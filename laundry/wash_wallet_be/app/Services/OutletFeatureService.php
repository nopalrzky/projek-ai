<?php

namespace App\Services;

use App\Models\CoinTransaction;
use App\Models\CourierSetting;
use App\Models\Feature;
use App\Models\Outlet;
use App\Models\OutletFeature;
use App\Models\User;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class OutletFeatureService extends BaseService
{
  public function __construct(
    protected CoinTransaction $coinTransaction,
    protected CourierSetting $courierSetting,
    protected Feature $feature,
    protected Outlet $outlet,
    protected OutletFeature $outletFeature,
  ) {}

  public function getAll(
    ?array $filters = [],
    ?int $page = null,
    ?int $perPage = null,
    array $relations = []
  ): LengthAwarePaginator | Collection {
    try {
      $query = $this->outletFeature->query();

      $this->applyTenantScope($query);
      $this->applyFilters($query, $filters);

      if (!empty($relations)) {
        $query->with($relations);
      }

      return $this->paginate($query, $perPage, $page);
    } catch (Exception $e) {
      Log::error('Failed to get outlet features', [
        'filters' => $filters,
        'error' => $e->getMessage(),
        'user_id' => Auth::id(),
        'type' => 'outlet_feature_service_error',
      ]);

      throw $e;
    }
  }

  public function getById(int $id, array $relations = ['outlet', 'feature']): OutletFeature
  {
    try {
      $query = $this->outletFeature->query();

      if (!empty($relations)) {
        $query->with($relations);
      }

      return $query->whereKey($id)->firstOrFail();
    } catch (Exception $e) {
      Log::error('Failed to get outlet feature by ID', [
        'id' => $id,
        'error' => $e->getMessage(),
        'user_id' => Auth::id(),
        'type' => 'outlet_feature_service_error',
      ]);

      throw $e;
    }
  }

  protected function applyFilters(Builder $query, array $filters): void
  {
    if (isset($filters['id'])) {
      $query->whereKey($filters['id']);
    }

    if (isset($filters['outletId'])) {
      $query->byOutletId($filters['outletId']);
    }

    if (isset($filters['featureId'])) {
      $query->byFeatureId($filters['featureId']);
    }

    if (isset($filters['status'])) {
      if (is_array($filters['status'])) {
        $query->whereIn('status', $filters['status']);
      } else {
        $query->where('status', $filters['status']);
      }
    }

    if (isset($filters['excludeStatus'])) {
      $query->whereNotIn('status', (array) $filters['excludeStatus']);
    }

    if (isset($filters['autoRenewal'])) {
      $query->where('auto_renewal', (bool) $filters['autoRenewal']);
    }

    if (isset($filters['isActive'])) {
      if ($filters['isActive']) {
        $query->whereIn('status', [OutletFeature::STATUS_ACTIVE, OutletFeature::STATUS_TRIAL]);
      } else {
        $query->whereNotIn('status', [OutletFeature::STATUS_ACTIVE, OutletFeature::STATUS_TRIAL]);
      }
    }

    if (isset($filters['key'])) {
      $query->whereHas('feature', function (Builder $query) use ($filters) {
        $query->byKey($filters['key']);
      });
    }

    if (isset($filters['excludeKey'])) {
      $query->whereHas('feature', function (Builder $query) use ($filters) {
        $query->where('key', '!=', $filters['excludeKey']);
      });
    }

    if (isset($filters['orderBy'])) {
      $direction = $filters['orderDirection'] ?? 'desc';
      $this->applySort(
        $query,
        $filters['orderBy'],
        $direction,
        ['expires_at', 'unlocked_at', 'trial_expires_at', 'created_at'],
        [],
        'created_at'
      );
    }
  }


  public function startTrial(int $outletId): OutletFeature
  {
    return DB::transaction(function () use ($outletId) {
      $trialEligibility = $this->getTrialEligibility($outletId);
      if (!$trialEligibility['eligible']) {
        throw ValidationException::withMessages([
          'trial' => [$trialEligibility['message']],
        ]);
      }

      $feature = $this->feature->byKey('outlet_activation')->firstOrFail();
      $currentStatus = $this->outletFeature->byOutletId($outletId)
        ->byFeatureId($feature->id)
        ->first();

      $trialStart = now();
      $trialExpiry = $trialStart->copy()->addDays((int) $feature->trial_duration_days);

      $outletFeature = $this->outletFeature->updateOrCreate(
        ['outlet_id' => $outletId, 'feature_id' => $feature->id],
        [
          'status' => OutletFeature::STATUS_TRIAL,
          'trial_started_at' => $trialStart,
          'trial_expires_at' => $trialExpiry,
          'unlocked_at' => $trialStart,
          'expires_at' => $trialExpiry,
          'coin_spent' => $currentStatus?->coin_spent ?? 0,
        ]
      );

      return $outletFeature;
    });
  }

  public function unlockFreeFeature(int $outletId, string $featureKey): OutletFeature
  {
    return DB::transaction(function () use ($outletId, $featureKey) {
      $feature = $this->feature->byKey($featureKey)->first();

      if (!$feature) {
        if ($featureKey === 'courier_schedule') {
          $feature = $this->feature->updateOrCreate(
            ['key' => 'courier_schedule'],
            [
              'name'          => 'Layanan Antar-Jemput',
              'description'   => 'Aktifkan fitur pengambilan dan pengantaran cucian oleh kurir outlet.',
              'coin_price'    => 0,
              'duration_days' => 0,
              'is_paid'       => false,
              'is_active'     => true,
              'sort_order'    => 10,
            ]
          );
        } else {
          throw new Exception('Fitur tidak ditemukan: ' . $featureKey);
        }
      }

      if ($feature->is_paid) {
        throw new Exception('Fitur ini berbayar dan tidak bisa diaktifkan secara gratis.');
      }

      $currentStatus = $this->outletFeature->byOutletId($outletId)
        ->byFeatureId($feature->id)
        ->first();

      return $this->outletFeature->updateOrCreate(
        ['outlet_id' => $outletId, 'feature_id' => $feature->id],
        [
          'status'      => OutletFeature::STATUS_ACTIVE,
          'unlocked_at' => $currentStatus?->unlocked_at ?? now(),
          'expires_at'  => null,
          'coin_spent'  => $currentStatus ? $currentStatus->coin_spent : 0,
        ]
      );
    });
  }

  public function unlockFeature(int $outletId, int $featureId, string $type = 'outlet'): OutletFeature
  {
    return DB::transaction(function () use ($outletId, $featureId, $type) {
      $outlet = $this->outlet->with('owner')->findOrFail($outletId);
      $feature = $this->feature->byId($featureId)->firstOrFail();

      $coinBalance = $type === 'owner'
        ? $outlet->owner->coin_balance
        : $outlet->coin_balance;

      if ($coinBalance < $feature->coin_price) {
        throw new Exception('Saldo koin tidak mencukupi untuk membuka fitur ini.');
      }

      $currentStatus = $this->outletFeature->byOutletId($outletId)
        ->byFeatureId($feature->id)
        ->first();

      $baseDate = $currentStatus?->expires_at && $currentStatus->expires_at->isFuture()
        ? $currentStatus->expires_at
        : now();

      $expiresAt = $feature->duration_days > 0
        ? $baseDate->copy()->addDays($feature->duration_days)
        : null;

      if ($type === 'owner') {
        User::query()->whereKey($outlet->owner_id)->decrement('coin_balance', $feature->coin_price);
      } else {
        $this->outlet->query()->whereKey($outlet->id)->decrement('coin_balance', $feature->coin_price);
      }

      $this->coinTransaction->create([
        'transaction_number' => 'FT' . strtoupper(bin2hex(random_bytes(4))),
        'outlet_id'          => $outletId,
        'user_id'            => $outlet->owner_id,
        'type'               => CoinTransaction::TYPE_FEATURE_UNLOCK,
        'amount'             => $feature->coin_price,
        'description'        => $feature->duration_days > 0 ? "Unlock/Perpanjang fitur: {$feature->name}" : "Unlock fitur: {$feature->name}",
        'reference_id'       => $feature->id,
      ]);

      return $this->outletFeature->updateOrCreate(
        ['outlet_id' => $outletId, 'feature_id' => $feature->id],
        [
          'status'      => OutletFeature::STATUS_ACTIVE,
          'unlocked_at' => $currentStatus?->unlocked_at ?? now(),
          'expires_at'  => $expiresAt,
          'coin_spent'  => ($currentStatus ? $currentStatus->coin_spent : 0) + $feature->coin_price,
        ]
      );
    });
  }

  public function activateOutlet(int $outletId, string $type = 'owner'): OutletFeature
  {
    return $this->activate($outletId, $type, false);
  }

  public function getTrialEligibility(int $outletId): array
  {
    $feature = $this->feature->byKey('outlet_activation')->firstOrFail();
    $currentStatus = $this->outletFeature->byOutletId($outletId)
      ->byFeatureId($feature->id)
      ->first();

    if ((int) $feature->trial_duration_days <= 0) {
      return [
        'eligible' => false,
        'code' => 'trial_not_available',
        'message' => 'Fitur ini tidak memiliki masa trial.',
        'trialDurationDays' => (int) $feature->trial_duration_days,
      ];
    }

    if ($currentStatus && $currentStatus->isActive()) {
      return [
        'eligible' => false,
        'code' => 'feature_already_active',
        'message' => 'Fitur sudah aktif.',
        'trialDurationDays' => (int) $feature->trial_duration_days,
      ];
    }

    $hasUsedTrial = $currentStatus && (
      !is_null($currentStatus->trial_started_at)
      || !is_null($currentStatus->trial_expires_at)
      || $currentStatus->status === OutletFeature::STATUS_TRIAL
    );

    if ($hasUsedTrial) {
      return [
        'eligible' => false,
        'code' => 'trial_already_used',
        'message' => 'Trial hanya dapat digunakan satu kali.',
        'trialDurationDays' => (int) $feature->trial_duration_days,
      ];
    }

    return [
      'eligible' => true,
      'code' => null,
      'message' => null,
      'trialDurationDays' => (int) $feature->trial_duration_days,
    ];
  }

  public function activate(int $outletId, string $type, bool $withExposure = false): OutletFeature
  {
    return DB::transaction(function () use ($outletId, $type, $withExposure) {
      $outlet = $this->outlet->findOrFail($outletId);

      if (!in_array($type, ['owner', 'outlet'], true)) {
        throw new Exception('Tipe aktivasi tidak valid.');
      }

      $coinBalance = $type === 'owner'
        ? Auth::user()->coin_balance
        : $outlet->coin_balance;

      $feature = $this->feature->byKey('outlet_activation')->firstOrFail();
      $totalCost = $feature->coin_price;
      $exposureFeature = null;

      if ($withExposure) {
        $exposureFeature = $this->feature->byKey('outlet_exposure')->firstOrFail();
        $totalCost += $exposureFeature->coin_price;
      }

      if ($coinBalance < $totalCost) {
        throw new Exception('Saldo koin tidak mencukupi untuk aktivasi.');
      }

      if ($type === 'owner') {
        User::query()->whereKey(Auth::id())->decrement('coin_balance', $totalCost);
      } else {
        $this->outlet->query()->whereKey($outlet->id)->decrement('coin_balance', $totalCost);
      }

      $this->coinTransaction->create([
        'transaction_number' => 'FT' . strtoupper(bin2hex(random_bytes(4))),
        'outlet_id'          => $outletId,
        'user_id'            => $outlet->owner_id,
        'type'               => 'feature_unlock',
        'amount'             => $feature->coin_price,
        'description'        => $feature->duration_days > 0 ? "Unlock/Perpanjang fitur: {$feature->name}" : "Unlock fitur: {$feature->name}",
        'reference_id'       => $feature->id,
      ]);

      $outletFeature = $this->outletFeature->updateOrCreate(
        ['outlet_id' => $outletId, 'feature_id' => $feature->id],
        [
          'status'      => OutletFeature::STATUS_ACTIVE,
          'unlocked_at' => now(),
          'coin_spent'  => ($this->outletFeature->byOutletId($outletId)->byFeatureId($feature->id)->first()?->coin_spent ?? 0) + $feature->coin_price,
        ]
      );

      if ($withExposure && $exposureFeature) {
        $currentExpStatus = $this->outletFeature->byOutletId($outletId)
          ->byFeatureId($exposureFeature->id)
          ->first();

        $this->coinTransaction->create([
          'transaction_number' => 'FT' . strtoupper(bin2hex(random_bytes(4))),
          'outlet_id'          => $outletId,
          'user_id'            => $outlet->owner_id,
          'type'               => 'feature_unlock',
          'amount'             => $exposureFeature->coin_price,
          'description'        => $exposureFeature->duration_days > 0 ? "Unlock/Perpanjang fitur: {$exposureFeature->name}" : "Unlock fitur: {$exposureFeature->name}",
          'reference_id'       => $exposureFeature->id,
        ]);

        $this->outletFeature->updateOrCreate(
          ['outlet_id' => $outletId, 'feature_id' => $exposureFeature->id],
          [
            'status'      => OutletFeature::STATUS_ACTIVE,
            'unlocked_at' => now(),
            'coin_spent'  => ($currentExpStatus ? $currentExpStatus->coin_spent : 0) + $exposureFeature->coin_price,
          ]
        );
      }

      $outlet->update(['status' => 'active']);

      return $outletFeature;
    });
  }

  public function activateExposure(int $outletId, string $type = 'owner'): OutletFeature
  {
    return DB::transaction(function () use ($outletId, $type) {
      $outlet = $this->outlet->findOrFail($outletId);
      $feature = $this->feature->byKey('outlet_exposure')->firstOrFail();

      $coinBalance = $type === 'owner'
        ? $outlet->owner->coin_balance
        : $outlet->coin_balance;

      if ($coinBalance < $feature->coin_price) {
        throw new Exception('Saldo koin tidak mencukupi untuk mengaktifkan ekspos outlet.');
      }

      $currentStatus = $this->outletFeature->byOutletId($outletId)
        ->byFeatureId($feature->id)
        ->first();

      $startDate = $currentStatus?->expires_at && $currentStatus->expires_at->isFuture()
        ? $currentStatus->expires_at
        : now();

      $expiresAt = $feature->duration_days > 0
        ? $startDate->copy()->addDays($feature->duration_days)
        : null;

      if ($type === 'owner') {
        User::query()->whereKey($outlet->owner_id)->decrement('coin_balance', $feature->coin_price);
      } else {
        $this->outlet->query()->whereKey($outlet->id)->decrement('coin_balance', $feature->coin_price);
      }

      $this->coinTransaction->create([
        'transaction_number' => 'FT' . strtoupper(bin2hex(random_bytes(4))),
        'outlet_id'          => $outletId,
        'user_id'            => $outlet->owner_id,
        'type'               => CoinTransaction::TYPE_FEATURE_UNLOCK,
        'amount'             => $feature->coin_price,
        'description'        => "Unlock/Perpanjang fitur: {$feature->name}",
        'reference_id'       => $feature->id,
      ]);

      return $this->outletFeature->updateOrCreate(
        ['outlet_id' => $outletId, 'feature_id' => $feature->id],
        [
          'status'       => OutletFeature::STATUS_ACTIVE,
          'unlocked_at'  => $currentStatus?->unlocked_at ?? now(),
          'expires_at'   => $expiresAt,
          'coin_spent'   => ($currentStatus ? $currentStatus->coin_spent : 0) + $feature->coin_price,
          'auto_renewal' => $currentStatus?->auto_renewal ?? false,
        ]
      );
    });
  }

  public function toggleExposureAutoRenewal(int $outletId, bool $enabled): OutletFeature
  {
    return DB::transaction(function () use ($outletId, $enabled) {
      $feature = $this->feature->byKey('outlet_exposure')->firstOrFail();

      $outletFeature = $this->outletFeature->byOutletId($outletId)
        ->byFeatureId($feature->id)
        ->firstOrFail();

      $outletFeature->update(['auto_renewal' => $enabled]);

      return $outletFeature->refresh();
    });
  }

  public function processExposureRenewals(): int
  {
    return DB::transaction(function () {
      $feature = $this->feature->byKey('outlet_exposure')->firstOrFail();

      $renewals = $this->outletFeature->query()
        ->with(['outlet', 'feature'])
        ->byFeatureId($feature->id)
        ->where('auto_renewal', true)
        ->whereIn('status', [OutletFeature::STATUS_ACTIVE, OutletFeature::STATUS_EXPIRED])
        ->whereNotNull('expires_at')
        ->where('expires_at', '<=', now())
        ->get();

      $processed = 0;

      foreach ($renewals as $outletFeature) {
        /** @var OutletFeature $outletFeature */
        $outlet = $outletFeature->outlet;

        if (!$outlet || $outlet->coin_balance < $feature->coin_price) {
          Log::warning('Skipping exposure auto-renewal because coin balance is insufficient.', [
            'outlet_id' => $outletFeature->outlet_id,
            'feature_id' => $feature->id,
            'required_coin' => $feature->coin_price,
            'current_coin' => $outlet?->coin_balance,
          ]);

          continue;
        }

        $baseDate = $outletFeature->expires_at && $outletFeature->expires_at->isFuture()
          ? $outletFeature->expires_at
          : now();

        $newExpiresAt = $baseDate->copy()->addDays((int) $feature->duration_days);

        $this->outlet->query()->whereKey($outlet->id)->decrement('coin_balance', $feature->coin_price);

        $this->coinTransaction->create([
          'transaction_number' => 'FT' . strtoupper(bin2hex(random_bytes(4))),
          'outlet_id'          => $outletFeature->outlet_id,
          'user_id'            => $outlet->owner_id,
          'type'               => CoinTransaction::TYPE_FEATURE_RENEWAL,
          'amount'             => $feature->coin_price,
          'description'        => "Auto-renew fitur: {$feature->name}",
          'reference_id'       => $feature->id,
        ]);

        $outletFeature->update([
          'status'      => OutletFeature::STATUS_ACTIVE,
          'expires_at'  => $newExpiresAt,
          'unlocked_at' => $outletFeature->unlocked_at ?? now(),
          'coin_spent'  => $outletFeature->coin_spent + $feature->coin_price,
        ]);

        $processed++;
      }

      return $processed;
    });
  }
}
