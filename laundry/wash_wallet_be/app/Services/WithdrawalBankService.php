<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\WithdrawalBank;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WithdrawalBankService extends BaseService
{
    public function __construct(
        protected WithdrawalBank $withdrawalBank,
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
        array $relations = []
    ): LengthAwarePaginator|Collection {
        try {
            $page ??= (int) ($filters['page'] ?? 0);
            $perPage ??= (int) ($filters['perPage'] ?? 0);

            $query = $this->withdrawalBank->query();

            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get withdrawal banks', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'withdrawal_bank_service_error',
            ]);
            throw $e;
        }
    }

    public function getActiveBanks(): Collection
    {
        try {
            return $this->withdrawalBank->query()->active()->get();
        } catch (Exception $e) {
            Log::error('Failed to get active withdrawal banks', [
                'error' => $e->getMessage(),
                'type'  => 'withdrawal_bank_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(int $id, array $relations = []): WithdrawalBank
    {
        try {
            $query = $this->withdrawalBank->query();

            return $query->with($relations)->findOrFail($id);
        } catch (Exception $e) {
            Log::error('Failed to get withdrawal bank by ID', [
                'bank_id' => $id,
                'error'   => $e->getMessage(),
                'type'    => 'withdrawal_bank_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function store(array $data): WithdrawalBank
    {
        return DB::transaction(function () use ($data) {
            try {
                $bank = $this->withdrawalBank->create([
                    'bank_name'      => $data['bankName'],
                    'bank_code'      => $data['bankCode'] ?? null,
                    'admin_fee'      => $data['adminFee'] ?? 0.00,
                    'min_withdrawal' => $data['minWithdrawal'] ?? 50000.00,
                    'max_withdrawal' => $data['maxWithdrawal'] ?? null,
                    'is_active'      => $data['isActive'] ?? true,
                ]);

                Log::info('Withdrawal bank created successfully', [
                    'bank_id' => $bank->id,
                    'user_id' => Auth::id(),
                    'type'    => 'withdrawal_bank_management',
                ]);

                return $bank;
            } catch (Exception $e) {
                Log::error('Failed to create withdrawal bank', [
                    'error'   => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type'    => 'withdrawal_bank_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function update(int $id, array $data): WithdrawalBank
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $bank = $this->getById($id);

                $updateData = [];

                if (isset($data['bankName'])) {
                    $updateData['bank_name'] = $data['bankName'];
                }

                if (isset($data['bankCode'])) {
                    $updateData['bank_code'] = $data['bankCode'];
                }

                if (isset($data['adminFee'])) {
                    $updateData['admin_fee'] = $data['adminFee'];
                }

                if (isset($data['minWithdrawal'])) {
                    $updateData['min_withdrawal'] = $data['minWithdrawal'];
                }

                if (isset($data['maxWithdrawal'])) {
                    $updateData['max_withdrawal'] = $data['maxWithdrawal'];
                }

                if (isset($data['isActive'])) {
                    $updateData['is_active'] = $data['isActive'];
                }

                $bank->update($updateData);

                Log::info('Withdrawal bank updated successfully', [
                    'bank_id' => $id,
                    'changes' => array_keys($updateData),
                    'user_id' => Auth::id(),
                    'type'    => 'withdrawal_bank_management',
                ]);

                return $bank->fresh();
            } catch (Exception $e) {
                Log::error('Failed to update withdrawal bank', [
                    'bank_id' => $id,
                    'error'   => $e->getMessage(),
                    'type'    => 'withdrawal_bank_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroy(int $id): bool
    {
        try {
            $bank = $this->getById($id);
            $deleted = $bank->delete();

            if ($deleted) {
                Log::info('Withdrawal bank deleted', [
                    'bank_id' => $id,
                    'user_id' => Auth::id(),
                    'type'    => 'withdrawal_bank_management',
                ]);
            }

            return $deleted;
        } catch (Exception $e) {
            Log::error('Failed to delete withdrawal bank', [
                'bank_id' => $id,
                'error'   => $e->getMessage(),
                'type'    => 'withdrawal_bank_service_error',
            ]);
            throw $e;
        }
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

        if (isset($filters['isActive']) && $filters['isActive'] !== null) {
            $filters['isActive'] ? $query->active() : $query->where('is_active', false);
        }

        $query->sortBy(
            $filters['sortBy']        ?? 'createdAt',
            $filters['sortDirection'] ?? 'desc'
        );
    }
}
