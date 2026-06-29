<?php

namespace App\Services;

use App\Models\CustomerAccount;
use App\Models\CustomerAddress;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CustomerAddressService extends BaseService
{
  public function __construct(
    protected CustomerAddress $customerAddress,
    protected RegionFuzzyMatcherService $regionFuzzyMatcherService,
  ) {}

  /*
    |--------------------------------------------------------------------------
    | Read Methods
    |--------------------------------------------------------------------------
    */

  public function getAll(
    ?array $filters = [],
    ?int $page = null,
    ?int $perPage = null,
    array $relations = []
  ): LengthAwarePaginator|Collection {
    try {
      $query = $this->customerAddress->query();
      $this->applyFilters($query, $filters ?? []);

      if (!empty($relations)) {
        $query->with($relations);
      }

      return $this->paginate($query, $perPage, $page);
    } catch (Exception $e) {
      Log::error('Failed to get customer addresses', [
        'filters' => $filters,
        'error'   => $e->getMessage(),
        'user_id' => Auth::id(),
        'type'    => 'customer_address_service_error',
      ]);
      throw $e;
    }
  }

  public function getById(CustomerAccount $account, int $id): CustomerAddress
  {
    try {
      return $this->customerAddress
        ->query()
        ->byCustomerAccountId($account->id)
        ->findOrFail($id);
    } catch (Exception $e) {
      Log::error('Failed to get customer address by ID', [
        'address_id'          => $id,
        'customer_account_id' => $account->id,
        'error'               => $e->getMessage(),
        'user_id'             => Auth::id() ?? $account->id,
        'type'                => 'customer_address_service_error',
      ]);
      throw $e;
    }
  }

  /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

  public function store(CustomerAccount $account, array $data): CustomerAddress
  {
    return DB::transaction(function () use ($account, $data) {
      try {
        $isFirstAddress = !$this->customerAddress
          ->query()
          ->byCustomerAccountId($account->id)
          ->exists();

        $isPrimary = (bool) ($data['isPrimary'] ?? false);
        if ($isFirstAddress) {
          $isPrimary = true;
        }

        $matchedRegions = [];
        if (!empty($data['villageId']) || !empty($data['districtId'])) {
          $matchedRegions = [
            'province_id'   => $data['provinceId'] ?? null,
            'regency_id'    => $data['regencyId'] ?? null,
            'district_id'   => $data['districtId'] ?? null,
            'village_id'    => $data['villageId'] ?? null,
            'province_name' => $data['provinceName'] ?? null,
            'regency_name'  => $data['regencyName'] ?? null,
            'district_name' => $data['districtName'] ?? null,
            'village_name'  => $data['villageName'] ?? null,
          ];
          $matchedRegions = array_filter($matchedRegions, fn($value) => !is_null($value));
        } else {
          $provinceName = $data['provinceName'] ?? null;
          $regencyName = $data['regencyName'] ?? null;
          $districtName = $data['districtName'] ?? null;
          $villageName = $data['villageName'] ?? null;

          if (empty($provinceName) && !empty($data['street'])) {
            $parsed = $this->regionFuzzyMatcherService->parseFullAddress($data['street']);
            $provinceName = $parsed['province'];
            $regencyName = $parsed['regency'];
            $districtName = $parsed['district'];
            $villageName = $parsed['village'];
          }

          if (!empty($provinceName)) {
            $matchedRegions = $this->regionFuzzyMatcherService->matchLocation(
              $provinceName,
              $regencyName,
              $districtName,
              $villageName
            );

            // Fallback to raw names if matching fails
            $matchedRegions['province_name'] = $matchedRegions['province_name'] ?? $provinceName;
            $matchedRegions['regency_name'] = $matchedRegions['regency_name'] ?? $regencyName;
            $matchedRegions['district_name'] = $matchedRegions['district_name'] ?? $districtName;
            $matchedRegions['village_name'] = $matchedRegions['village_name'] ?? $villageName;
          }
        }

        $addressData = array_merge([
          'customer_account_id' => $account->id,
          'label'               => $data['label'],
          'recipient_name'      => $data['recipientName'],
          'recipient_phone'     => $data['recipientPhone'],
          'street'              => $data['street'],
          'notes'               => $data['notes'] ?? null,
          'latitude'            => $data['latitude'] ?? null,
          'longitude'           => $data['longitude'] ?? null,
          'is_primary'          => $isPrimary,
        ], $matchedRegions);

        $address = $this->customerAddress->create($addressData);

        if ($isPrimary) {
          $this->unsetOtherPrimaries($account, $address->id);
        }

        Log::info('Customer address created successfully', [
          'address_id'          => $address->id,
          'customer_account_id' => $account->id,
          'is_primary'          => $address->is_primary,
          'user_id'             => Auth::id() ?? $account->id,
          'type'                => 'customer_address_management',
        ]);

        return $address;
      } catch (Exception $e) {
        Log::error('Failed to create customer address', [
          'customer_account_id' => $account->id,
          'error'               => $e->getMessage(),
          'user_id'             => Auth::id() ?? $account->id,
          'type'                => 'customer_address_service_error',
        ]);
        throw $e;
      }
    });
  }

  public function update(CustomerAccount $account, int $id, array $data): CustomerAddress
  {
    return DB::transaction(function () use ($account, $id, $data) {
      try {
        $address = $this->getById($account, $id);

        $updateData = [];

        if (array_key_exists('label', $data)) {
          $updateData['label'] = $data['label'];
        }

        if (array_key_exists('recipientName', $data)) {
          $updateData['recipient_name'] = $data['recipientName'];
        }

        if (array_key_exists('recipientPhone', $data)) {
          $updateData['recipient_phone'] = $data['recipientPhone'];
        }

        if (array_key_exists('street', $data)) {
          $updateData['street'] = $data['street'];
        }

        if (array_key_exists('notes', $data)) {
          $updateData['notes'] = $data['notes'];
        }

        if (array_key_exists('latitude', $data)) {
          $updateData['latitude'] = $data['latitude'];
        }

        if (array_key_exists('longitude', $data)) {
          $updateData['longitude'] = $data['longitude'];
        }

        if (array_key_exists('isPrimary', $data)) {
          $updateData['is_primary'] = (bool) $data['isPrimary'];
        }

        $matchedRegions = [];
        if (!empty($data['villageId']) || !empty($data['districtId'])) {
          $matchedRegions = [
            'province_id'   => $data['provinceId'] ?? null,
            'regency_id'    => $data['regencyId'] ?? null,
            'district_id'   => $data['districtId'] ?? null,
            'village_id'    => $data['villageId'] ?? null,
            'province_name' => $data['provinceName'] ?? null,
            'regency_name'  => $data['regencyName'] ?? null,
            'district_name' => $data['districtName'] ?? null,
            'village_name'  => $data['villageName'] ?? null,
          ];
          $matchedRegions = array_filter($matchedRegions, fn($value) => !is_null($value));
        } else {
          $provinceName = $data['provinceName'] ?? null;
          $regencyName = $data['regencyName'] ?? null;
          $districtName = $data['districtName'] ?? null;
          $villageName = $data['villageName'] ?? null;

          if (empty($provinceName) && !empty($data['street'])) {
            $parsed = $this->regionFuzzyMatcherService->parseFullAddress($data['street']);
            $provinceName = $parsed['province'];
            $regencyName = $parsed['regency'];
            $districtName = $parsed['district'];
            $villageName = $parsed['village'];
          }

          if (!empty($provinceName)) {
            $matchedRegions = $this->regionFuzzyMatcherService->matchLocation(
              $provinceName,
              $regencyName,
              $districtName,
              $villageName
            );

            // Fallback to raw names if matching fails
            $matchedRegions['province_name'] = $matchedRegions['province_name'] ?? $provinceName;
            $matchedRegions['regency_name'] = $matchedRegions['regency_name'] ?? $regencyName;
            $matchedRegions['district_name'] = $matchedRegions['district_name'] ?? $districtName;
            $matchedRegions['village_name'] = $matchedRegions['village_name'] ?? $villageName;
          }
        }

        if (!empty($matchedRegions)) {
          $updateData = array_merge($updateData, $matchedRegions);
        }

        if (!empty($updateData)) {
          $address->update($updateData);
        }

        if (($updateData['is_primary'] ?? false) === true) {
          $this->unsetOtherPrimaries($account, $address->id);
        }

        Log::info('Customer address updated successfully', [
          'address_id'          => $address->id,
          'customer_account_id' => $account->id,
          'changes'             => array_keys($updateData),
          'user_id'             => Auth::id() ?? $account->id,
          'type'                => 'customer_address_management',
        ]);

        return $address->fresh();
      } catch (Exception $e) {
        Log::error('Failed to update customer address', [
          'address_id'          => $id,
          'customer_account_id' => $account->id,
          'error'               => $e->getMessage(),
          'user_id'             => Auth::id() ?? $account->id,
          'type'                => 'customer_address_service_error',
        ]);
        throw $e;
      }
    });
  }

  public function destroy(CustomerAccount $account, int $id): bool
  {
    return DB::transaction(function () use ($account, $id) {
      try {
        $address = $this->getById($account, $id);
        $wasPrimary = (bool) $address->is_primary;

        $deleted = $address->delete();

        if ($deleted && $wasPrimary) {
          $nextPrimary = $this->customerAddress
            ->query()
            ->byCustomerAccountId($account->id)
            ->orderBy('created_at', 'asc')
            ->orderBy('id', 'asc')
            ->first();

          if ($nextPrimary) {
            $nextPrimary->update(['is_primary' => true]);
            $this->unsetOtherPrimaries($account, $nextPrimary->id);
          }
        }

        Log::info('Customer address deleted successfully', [
          'address_id'          => $id,
          'customer_account_id' => $account->id,
          'user_id'             => Auth::id() ?? $account->id,
          'type'                => 'customer_address_management',
        ]);

        return $deleted;
      } catch (Exception $e) {
        Log::error('Failed to delete customer address', [
          'address_id'          => $id,
          'customer_account_id' => $account->id,
          'error'               => $e->getMessage(),
          'user_id'             => Auth::id() ?? $account->id,
          'type'                => 'customer_address_service_error',
        ]);
        throw $e;
      }
    });
  }

  /*
    |--------------------------------------------------------------------------
    | Private Helpers
    |--------------------------------------------------------------------------
    */

  private function unsetOtherPrimaries(CustomerAccount $account, int $exceptId): void
  {
    $this->customerAddress
      ->query()
      ->byCustomerAccountId($account->id)
      ->where('id', '!=', $exceptId)
      ->update(['is_primary' => false]);
  }

  /*
    |--------------------------------------------------------------------------
    | Private — Filters
    |--------------------------------------------------------------------------
    */
  private function applyFilters(Builder &$query, array $filters = []): void
  {
    if (!empty($filters['search'])) {
      $query->search($filters['search']);
    }

    if (!empty($filters['customerAccountId'])) {
      $query->byCustomerAccountId($filters['customerAccountId']);
    }

    if (($filters['isPrimary'] ?? null) === true) {
      $query->primary();
    }

    if (($filters['isPrimary'] ?? null) === false) {
      $query->where('is_primary', false);
    }

    $sortBy = $filters['sortBy'] ?? 'createdAt';
    $sortDirection = $filters['sortDirection'] ?? 'desc';
    $query->sortBy($sortBy, $sortDirection);
  }
}
