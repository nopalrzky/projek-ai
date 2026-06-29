<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\OwnerBankAccount;
use App\Models\WithdrawalBank;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OwnerBankAccountService extends BaseService
{
    public function __construct(
        protected OwnerBankAccount $ownerBankAccount,
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
        array $relations = ['withdrawalBank']
    ): LengthAwarePaginator|Collection {
        try {
            $page ??= (int) ($filters['page'] ?? 0);
            $perPage ??= (int) ($filters['perPage'] ?? 0);

            $query = $this->ownerBankAccount->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get owner bank accounts', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'owner_bank_account_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(int $id, array $relations = ['withdrawalBank']): OwnerBankAccount
    {
        try {
            $query = $this->ownerBankAccount->query();
            $this->applyTenantScope($query);

            return $query->with($relations)->findOrFail($id);
        } catch (Exception $e) {
            Log::error('Failed to get owner bank account by ID', [
                'bank_account_id' => $id,
                'error'           => $e->getMessage(),
                'type'            => 'owner_bank_account_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function store(array $data): OwnerBankAccount
    {
        return DB::transaction(function () use ($data) {
            try {
                $userId = $this->resolveOwnerId();

                $bank = WithdrawalBank::query()->active()->findOrFail($data['withdrawalBankId']);

                $existingDefault = $this->ownerBankAccount->query()
                    ->byUserId($userId)
                    ->default()
                    ->exists();

                $isDefault = $data['isDefault'] ?? !$existingDefault;

                if ($isDefault) {
                    $this->ownerBankAccount->query()
                        ->byUserId($userId)
                        ->update(['is_default' => false]);
                }

                $account = $this->ownerBankAccount->create([
                    'user_id'             => $userId,
                    'withdrawal_bank_id'  => $bank->id,
                    'account_number'      => $data['accountNumber'],
                    'account_holder_name' => $data['accountHolderName'],
                    'is_default'          => $isDefault,
                    'is_active'           => $data['isActive'] ?? true,
                ]);

                Log::info('Owner bank account created successfully', [
                    'bank_account_id' => $account->id,
                    'user_id'         => Auth::id(),
                    'type'            => 'owner_bank_account_management',
                ]);

                return $account->load(['withdrawalBank']);
            } catch (Exception $e) {
                Log::error('Failed to create owner bank account', [
                    'error'   => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type'    => 'owner_bank_account_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function update(int $id, array $data): OwnerBankAccount
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $account = $this->getById($id);
                $userId = $this->resolveOwnerId();

                $updateData = [];

                if (isset($data['accountNumber'])) {
                    $updateData['account_number'] = $data['accountNumber'];
                }

                if (isset($data['accountHolderName'])) {
                    $updateData['account_holder_name'] = $data['accountHolderName'];
                }

                if (isset($data['isActive'])) {
                    $updateData['is_active'] = $data['isActive'];
                }

                if (isset($data['isDefault'])) {
                    $isDefault = $data['isDefault'];
                    $updateData['is_default'] = $isDefault;

                    if ($isDefault) {
                        $this->ownerBankAccount->query()
                            ->byUserId($userId)
                            ->update(['is_default' => false]);
                    }
                }

                $account->update($updateData);

                Log::info('Owner bank account updated successfully', [
                    'bank_account_id' => $id,
                    'changes'         => array_keys($updateData),
                    'user_id'         => Auth::id(),
                    'type'            => 'owner_bank_account_management',
                ]);

                return $account->fresh(['withdrawalBank']);
            } catch (Exception $e) {
                Log::error('Failed to update owner bank account', [
                    'bank_account_id' => $id,
                    'error'           => $e->getMessage(),
                    'type'            => 'owner_bank_account_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroy(int $id): bool
    {
        try {
            $account = $this->getById($id);
            $deleted = $account->delete();

            if ($deleted) {
                Log::info('Owner bank account deleted', [
                    'bank_account_id' => $id,
                    'user_id'         => Auth::id(),
                    'type'            => 'owner_bank_account_management',
                ]);
            }

            return $deleted;
        } catch (Exception $e) {
            Log::error('Failed to delete owner bank account', [
                'bank_account_id' => $id,
                'error'           => $e->getMessage(),
                'type'            => 'owner_bank_account_service_error',
            ]);
            throw $e;
        }
    }

    public function setDefault(int $id): OwnerBankAccount
    {
        return DB::transaction(function () use ($id) {
            try {
                $account = $this->getById($id);
                $userId = $this->resolveOwnerId();

                $this->ownerBankAccount->query()
                    ->byUserId($userId)
                    ->update(['is_default' => false]);

                $account->update(['is_default' => true]);

                Log::info('Owner bank account set as default', [
                    'bank_account_id' => $id,
                    'user_id'         => Auth::id(),
                    'type'            => 'owner_bank_account_management',
                ]);

                return $account->fresh(['withdrawalBank']);
            } catch (Exception $e) {
                Log::error('Failed to set default owner bank account', [
                    'bank_account_id' => $id,
                    'error'           => $e->getMessage(),
                    'type'            => 'owner_bank_account_service_error',
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

        if (
            isset($filters['isActive'])
            && $filters['isActive'] !== null
            && $filters['isActive'] !== ''
        ) {
            filter_var($filters['isActive'], FILTER_VALIDATE_BOOLEAN)
                ? $query->active()
                : $query->where('is_active', false);
        }

        $query->sortBy(
            $filters['sortBy']        ?? 'createdAt',
            $filters['sortDirection'] ?? 'desc'
        );
    }
}
