<?php

namespace App\Services;

use App\Models\Account;
use App\Models\JournalEntry;
use App\Models\Outlet;
use App\Models\Prive;
use App\Models\User;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PriveService extends BaseService
{
    public function __construct(
        protected Prive $prive,
        protected Account $account,
        protected Outlet $outlet,
        protected AccountingService $accountingService,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Read Methods
    |--------------------------------------------------------------------------
    */

    public function getAll(
        array $filters = [],
        ?int $page = null,
        ?int $perPage = null,
        array $relations = ['outlet', 'user', 'sourceAccount', 'equityAccount']
    ): LengthAwarePaginator|Collection {
        try {
            $query = $this->prive->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get prives', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'prive_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(
        int $id,
        array $relations = ['outlet', 'user', 'sourceAccount', 'equityAccount']
    ): Prive {
        try {
            $query = $this->prive->newQuery()->where('id', $id);

            $this->applyTenantScope($query);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get prive by ID', [
                'prive_id' => $id,
                'error'    => $e->getMessage(),
                'user_id'  => Auth::id(),
                'type'     => 'prive_service_error',
            ]);
            throw $e;
        }
    }

    public function getPriveSummary(int $outletId, ?string $startDate = null, ?string $endDate = null): array
    {
        try {
            $query = $this->prive->query()->byOutletId($outletId);

            $this->applyTenantScope($query);

            if ($startDate && $endDate) {
                $query->dateBetween($startDate, $endDate);
            }

            $prives = $query->with(['user', 'sourceAccount', 'equityAccount'])->get();

            return [
                'total_amount'     => $prives->sum('amount'),
                'total_count'      => $prives->count(),
                'average_amount'   => $prives->avg('amount') ?? 0,
                'by_user'          => $prives->groupBy('user_id')->map(fn($group) => [
                    'user'  => $group->first()->user,
                    'total' => $group->sum('amount'),
                    'count' => $group->count(),
                ])->values(),
                'by_source_account' => $prives->groupBy('source_account_id')->map(fn($group) => [
                    'account' => $group->first()->sourceAccount,
                    'total'   => $group->sum('amount'),
                    'count'   => $group->count(),
                ])->values(),
            ];
        } catch (Exception $e) {
            Log::error('Failed to get prive summary', [
                'outlet_id'  => $outletId,
                'start_date' => $startDate,
                'end_date'   => $endDate,
                'error'      => $e->getMessage(),
                'type'       => 'prive_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function store(array $data): Prive
    {
        return DB::transaction(function () use ($data) {
            try {
                /** @var User $user */
                $user = Auth::guard('web')->user();

                if (!$user || !$user->hasRole('owner')) {
                    throw new Exception('Only owner can create prive');
                }

                $outlet = $this->outlet->findOrFail($data['outletId']);

                if (!(int) $outlet->owner_id === (int) $user->id) {
                    throw new Exception('You do not have permission to access this outlet');
                }

                $sourceAccount = $this->account
                    ->where('id', $data['sourceAccountId'])
                    ->where('owner_id', $outlet->owner_id)
                    ->firstOrFail();

                $equityAccount = $this->account
                    ->where('id', $data['equityAccountId'])
                    ->where('owner_id', $outlet->owner_id)
                    ->firstOrFail();

                if ($sourceAccount->type !== 'asset') {
                    throw new Exception('Source account must be of type "asset" (e.g., Cash, Bank)');
                }

                if (!$sourceAccount->is_transactional) {
                    throw new Exception('Source account must be transactional');
                }

                if ($equityAccount->type !== 'equity') {
                    throw new Exception('Equity account must be of type "equity"');
                }

                $prive = $this->prive->create([
                    'outlet_id'         => $data['outletId'],
                    'user_id'           => $user->id,
                    'source_account_id' => $data['sourceAccountId'],
                    'equity_account_id' => $data['equityAccountId'],
                    'amount'            => $data['amount'],
                    'date'              => $data['date'] ?? now()->format('Y-m-d'),
                    'description'       => $data['description'] ?? null,
                ]);

                $this->accountingService->recordPrive($prive);

                Log::info('Prive created successfully', [
                    'prive_id'       => $prive->id,
                    'outlet_id'      => $prive->outlet_id,
                    'amount'         => $prive->amount,
                    'source_account' => $sourceAccount->name,
                    'equity_account' => $equityAccount->name,
                    'user_id'        => $user->id,
                    'type'           => 'prive_action',
                ]);

                return $prive->load(['outlet', 'user', 'sourceAccount', 'equityAccount']);
            } catch (Exception $e) {
                Log::error('Failed to create prive', [
                    'data'    => $data,
                    'error'   => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type'    => 'prive_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function update(int $id, array $data): Prive
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $prive      = $this->getById($id);
                $updateData = [];

                if (isset($data['sourceAccountId'])) {
                    $sourceAccount = $this->account
                        ->where('id', $data['sourceAccountId'])
                        ->where('owner_id', $prive->outlet->owner_id)
                        ->firstOrFail();

                    if ($sourceAccount->type !== 'asset') {
                        throw new Exception('Source account must be of type "asset"');
                    }

                    if (!$sourceAccount->is_transactional) {
                        throw new Exception('Source account must be transactional');
                    }

                    $checkAmount = $data['amount'] ?? $prive->amount;
                    $currentBalance = $sourceAccount->balance ?? 0;

                    if ($currentBalance < $checkAmount) {
                        throw new Exception(sprintf(
                            'Saldo tidak mencukupi. Saldo saat ini: Rp %s, Jumlah penarikan: Rp %s',
                            number_format($currentBalance, 2, ',', '.'),
                            number_format($checkAmount, 2, ',', '.')
                        ));
                    }

                    $updateData['source_account_id'] = $data['sourceAccountId'];
                }

                if (isset($data['equityAccountId'])) {
                    $equityAccount = $this->account
                        ->where('id', $data['equityAccountId'])
                        ->where('owner_id', $prive->outlet->owner_id)
                        ->firstOrFail();

                    if ($equityAccount->type !== 'equity') {
                        throw new Exception('Equity account must be of type "equity"');
                    }

                    $updateData['equity_account_id'] = $data['equityAccountId'];
                }

                if (isset($data['amount']))      $updateData['amount']      = $data['amount'];
                if (isset($data['date']))        $updateData['date']        = $data['date'];
                if (isset($data['description'])) $updateData['description'] = $data['description'];

                if (!empty($updateData)) {
                    $prive->update($updateData);
                    $prive->refresh();
                }

                $oldJournal = JournalEntry::where('reference_type', Prive::class)
                    ->where('reference_id', $prive->id)
                    ->first();

                if ($oldJournal) {
                    $oldJournal->forceDelete();
                }

                $this->accountingService->recordPrive($prive);

                Log::info('Prive updated successfully', [
                    'prive_id'          => $prive->id,
                    'outlet_id'         => $prive->outlet_id,
                    'updated_fields'    => array_keys($updateData),
                    'journal_recreated' => !is_null($oldJournal),
                    'user_id'           => Auth::id(),
                    'type'              => 'prive_action',
                ]);

                return $prive->fresh(['outlet', 'user', 'sourceAccount', 'equityAccount']);
            } catch (Exception $e) {
                Log::error('Failed to update prive', [
                    'prive_id' => $id,
                    'data'     => $data,
                    'error'    => $e->getMessage(),
                    'user_id'  => Auth::id(),
                    'type'     => 'prive_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $prive    = $this->getById($id);
                $amount   = $prive->amount;
                $outletId = $prive->outlet_id;

                $journal = JournalEntry::where('reference_type', Prive::class)
                    ->where('reference_id', $prive->id)
                    ->first();

                if ($journal) {
                    $journal->forceDelete();
                }

                $deleted = $prive->delete();

                if ($deleted) {
                    Log::info('Prive deleted successfully', [
                        'prive_id'       => $id,
                        'outlet_id'      => $outletId,
                        'amount'         => $amount,
                        'journal_deleted' => !is_null($journal),
                        'user_id'        => Auth::id(),
                        'type'           => 'prive_action',
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete prive', [
                    'prive_id' => $id,
                    'error'    => $e->getMessage(),
                    'user_id'  => Auth::id(),
                    'type'     => 'prive_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function restore(int $id): Prive
    {
        return DB::transaction(function () use ($id) {
            try {
                $prive = $this->prive->withTrashed()->findOrFail($id);

                if (!$prive->trashed()) {
                    throw new Exception('Prive is not deleted');
                }

                $prive->restore();

                $this->accountingService->recordPrive($prive);

                Log::info('Prive restored successfully', [
                    'prive_id'          => $id,
                    'outlet_id'         => $prive->outlet_id,
                    'journal_recreated' => true,
                    'user_id'           => Auth::id(),
                    'type'              => 'prive_action',
                ]);

                return $prive->fresh(['outlet', 'user', 'sourceAccount', 'equityAccount']);
            } catch (Exception $e) {
                Log::error('Failed to restore prive', [
                    'prive_id' => $id,
                    'error'    => $e->getMessage(),
                    'user_id'  => Auth::id(),
                    'type'     => 'prive_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function forceDestroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $prive = $this->prive->withTrashed()->findOrFail($id);

                if (!$this->isSuperAdmin()) {
                    throw new Exception('Only super admin can permanently delete prives');
                }

                $journal = JournalEntry::withTrashed()
                    ->where('reference_type', Prive::class)
                    ->where('reference_id', $prive->id)
                    ->first();

                if ($journal) {
                    $journal->forceDelete();
                }

                $deleted = $prive->forceDelete();

                if ($deleted) {
                    Log::info('Prive permanently deleted', [
                        'prive_id'  => $id,
                        'outlet_id' => $prive->outlet_id,
                        'user_id'   => Auth::id(),
                        'type'      => 'prive_action',
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to force delete prive', [
                    'prive_id' => $id,
                    'error'    => $e->getMessage(),
                    'user_id'  => Auth::id(),
                    'type'     => 'prive_service_error',
                ]);
                throw $e;
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Private — Filters
    |--------------------------------------------------------------------------
    */

    protected function applyFilters(Builder $query, array $filters = []): void
    {
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['outletId'])) {
            $query->byOutletId($filters['outletId']);
        }

        if (!empty($filters['userId'])) {
            $query->byUserId($filters['userId']);
        }

        if (!empty($filters['sourceAccountId'])) {
            $query->bySourceAccountId($filters['sourceAccountId']);
        }

        if (!empty($filters['equityAccountId'])) {
            $query->byEquityAccountId($filters['equityAccountId']);
        }

        if (!empty($filters['date'])) {
            $query->byDate($filters['date']);
        }

        if (!empty($filters['startDate']) && !empty($filters['endDate'])) {
            $query->dateBetween($filters['startDate'], $filters['endDate']);
        } elseif (!empty($filters['startDate'])) {
            $query->whereDate('date', '>=', $filters['startDate']);
        } elseif (!empty($filters['endDate'])) {
            $query->whereDate('date', '<=', $filters['endDate']);
        }

        if (!empty($filters['minAmount'])) {
            $query->minAmount($filters['minAmount']);
        }

        if (!empty($filters['maxAmount'])) {
            $query->maxAmount($filters['maxAmount']);
        }

        $sortBy        = $filters['sortBy'] ?? 'date';
        $sortDirection = $filters['sortDirection'] ?? 'desc';

        $allowedSortColumns = ['date', 'amount', 'created_at', 'updated_at'];
        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->latest();
        }
    }
}
