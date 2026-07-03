<?php

namespace App\Services;

use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class AccountService extends BaseService
{
    const OUTLET_ACCOUNT_ROLES = ['cash', 'receivable', 'loan', 'fine'];
    const FUNDING_ACCOUNT_ROLES = ['cash', 'bank', 'ewallet'];

    const TRANSFER_ACCOUNT_ROLES = ['bank', 'ewallet'];

    public function __construct(
        protected Account $account
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
            $query = $this->account->query();

            if (!empty($filters['includeCommonOutletAccounts']) && !empty($filters['outletId'])) {
                $ownerId = $filters['ownerId'] ?? $this->resolveOwnerId();
                $outletId = (int) $filters['outletId'];

                $query->byOwnerId($ownerId)
                    ->where(function (Builder $q) use ($outletId) {
                        $q->whereNull('outlet_id')
                            ->orWhere('outlet_id', $outletId);
                    });
            } else {
                $this->applyTenantScope($query);
            }

            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            Log::debug('All accounts retrieved', [
                'filters' => $filters,
                'user_id' => Auth::id(),
                'type' => 'account_access'
            ]);

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get all accounts', [
                'filters' => $filters,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'account_service_error'
            ]);
            throw $e;
        }
    }

    /**
     * Get next available account code
     * This method ONLY calls the static method from the model
     */
    public function getNextCode(int $ownerId, ?int $parentId = null): string
    {
        try {
            $nextCode = $this->account->generateNextCode($ownerId, $parentId);

            Log::debug('Next account code generated', [
                'owner_id' => $ownerId,
                'parent_id' => $parentId,
                'next_code' => $nextCode,
                'user_id' => Auth::id(),
                'type' => 'account_code_generation'
            ]);

            return $nextCode;
        } catch (Exception $e) {
            Log::error('Failed to generate next account code', [
                'owner_id' => $ownerId,
                'parent_id' => $parentId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'account_service_error'
            ]);
            throw $e;
        }
    }

    /**
     * Get account tree (Root accounts with eager loaded children recursively)
     */
    public function getAccountTree(array $filters = []): Collection
    {
        try {
            $query = $this->account->query()->active();

            $this->applyTenantScope($query);

            $query->root();

            $this->applyFilters($query, $filters);

            $query->with([
                'children' => fn($q) => $q->active()->orderBy('code'),
                'children.children' => fn($q) => $q->active()->orderBy('code'),
                'children.children.children' => fn($q) => $q->active()->orderBy('code')
            ]);


            $query->orderBy('code');

            $accounts = $query->get();

            Log::debug('Account tree retrieved successfully', [
                'total_root_accounts' => $accounts->count(),
                'filters' => $filters,
                'user_id' => Auth::id(),
                'type' => 'account_access'
            ]);

            return $accounts;
        } catch (Exception $e) {
            Log::error('Failed to get account tree', [
                'filters' => $filters,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'account_service_error'
            ]);
            throw $e;
        }
    }

    /**
     * Get account by ID with access control
     */
    public function getById(int $id, array $relations = []): Account
    {
        try {
            $query = $this->account->query()->byId($id);

            $this->applyTenantScope($query);

            if (!empty($relations)) {
                $query->with($relations);
            }

            $account = $query->firstOrFail();

            Log::debug('Account retrieved successfully', [
                'account_id' => $id,
                'account_code' => $account->code,
                'account_name' => $account->name,
                'user_id' => Auth::id(),
                'type' => 'account_access'
            ]);

            return $account;
        } catch (Exception $e) {
            Log::error('Failed to get account by ID', [
                'account_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'account_service_error'
            ]);
            throw $e;
        }
    }



    /**
     * Create new account
     */
    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function store(array $data): Account
    {
        return DB::transaction(function () use ($data) {
            try {
                $user = Auth::user();

                $level = 1;
                $parentId = $data['parentId'] ?? null;

                if ($parentId) {
                    $parent = $this->account
                        ->byId($parentId)
                        ->byOwnerId($user->id)
                        ->firstOrFail();

                    if ($parent->level >= 3) {
                        throw new Exception('Maximum account level is 3. Cannot create child account under level 3.');
                    }

                    $level = $parent->level + 1;
                }

                Log::debug('Validating account code', [
                    'code' => $data['code'],
                    'level' => $level,
                    'owner_id' => $user->id,
                    'parent_id' => $parentId,
                ]);

                if (!Account::validateCodeFormat($data['code'], $level)) {
                    Log::error('Code validation failed', [
                        'code' => $data['code'],
                        'level' => $level,
                        'pattern_check' => preg_match('/^\d{1,2}-\d{2}-\d{4}$/', $data['code']),
                        'code_parts' => explode('-', $data['code']),
                    ]);
                    throw new Exception("Invalid code format for level {$level}: {$data['code']}");
                }

                $existingAccount = $this->account
                    ->byOwnerId($user->id)
                    ->byCode($data['code'])
                    ->first();

                if ($existingAccount) {
                    throw new Exception("Account code '{$data['code']}' already exists for this owner.");
                }

                $account = $this->account->create([
                    'owner_id' => $user->id,
                    'parent_id' => $parentId,
                    'code' => $data['code'],
                    'name' => $data['name'],
                    'slug' => $data['slug'] ?? null,
                    'type' => $data['type'],
                    'account_role' => $data['accountRole'] ?? null,
                    'level' => $level,
                    'is_system' =>  false,
                    'is_transactional' => $data['isTransactional'] ?? ($level === 3),
                ]);

                Log::info('Account created successfully', [
                    'account_id' => $account->id,
                    'account_code' => $account->code,
                    'account_name' => $account->name,
                    'account_type' => $account->type,
                    'account_level' => $account->level,
                    'parent_id' => $account->parent_id,
                    'owner_id' => $account->owner_id,
                    'created_by' => $user->id,
                    'type' => 'account_management'
                ]);

                return $account->load(['parent', 'owner']);
            } catch (Exception $e) {
                Log::error('Failed to create account', [
                    'error' => $e->getMessage(),
                    'data' => $data,
                    'user_id' => Auth::id(),
                    'type' => 'account_service_error'
                ]);
                throw $e;
            }
        });
    }

    /**
     * Update existing account
     */
    public function update(int $id, array $data): Account
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $account = $this->account->byId($id)->with(['parent', 'children'])->firstOrFail();

                /** @var User $user */
                $user = Auth::user();

                if (!$this->canUserModifyAccount($user, $account)) {
                    throw new Exception('Access denied to modify this account');
                }

                if (!$account->canBeModified() && isset($data['code'])) {
                    throw new Exception('Cannot change code of system account');
                }

                if (isset($data['parentId']) && $data['parentId'] !== $account->parent_id) {
                    if ($data['parentId']) {
                        $parent = $this->account
                            ->byId($data['parentId'])
                            ->byOwnerId($account->owner_id)
                            ->firstOrFail();

                        if ($parent->isChildOf($account)) {
                            throw new Exception('Cannot set parent to a child account');
                        }

                        if ($parent->level >= 3) {
                            throw new Exception('Maximum account level is 3. Cannot move account under level 3.');
                        }

                        $data['level'] = $parent->level + 1;
                    } else {
                        $data['level'] = 1;
                    }
                }

                if (isset($data['parentId']) && $data['parentId'] !== $account->parent_id) {
                    $account->parent_id = $data['parentId'];
                }

                if (isset($data['name'])) {
                    $account->name = $data['name'];
                }

                if (isset($data['slug'])) {
                    $account->slug = $data['slug'];
                }

                if (isset($data['type'])) {
                    $account->type = $data['type'];
                }

                if (isset($data['accountRole'])) {
                    $account->account_role = $data['accountRole'];
                }

                if (isset($data['isTransactional'])) {
                    $account->is_transactional = $data['isTransactional'];
                }

                if (isset($data['level'])) {
                    $account->level = $data['level'];
                }

                $account->save();

                Log::info('Account updated successfully', [
                    'account_id' => $id,
                    'updated_by' => $user->id,
                    'type' => 'account_management'
                ]);

                return $account->fresh(['parent', 'owner', 'children']);
            } catch (Exception $e) {
                Log::error('Failed to update account', [
                    'account_id' => $id,
                    'error' => $e->getMessage(),
                    'data' => $data,
                    'user_id' => Auth::id(),
                    'type' => 'account_service_error'
                ]);
                throw $e;
            }
        });
    }

    /**
     * Delete account (soft delete)
     */
    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $account = $this->account->byId($id)->with(['children'])->firstOrFail();

                /** @var User $user */
                $user = Auth::user();

                if (!$this->canUserModifyAccount($user, $account)) {
                    throw new Exception('Access denied to delete this account');
                }

                if (!$account->canBeDeleted()) {
                    if ($account->is_system) {
                        throw new Exception('Cannot delete system account');
                    }
                    if ($account->hasChildren()) {
                        throw new Exception('Cannot delete account that has child accounts. Please delete or move child accounts first.');
                    }
                }

                $deleted = $account->delete();

                if ($deleted) {
                    Log::info('Account deleted successfully', [
                        'account_id' => $id,
                        'account_code' => $account->code,
                        'account_name' => $account->name,
                        'deleted_by' => $user->id,
                        'type' => 'account_management'
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete account', [
                    'account_id' => $id,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'account_service_error'
                ]);
                throw $e;
            }
        });
    }

    /**
     * Generate default Chart of Accounts including required system accounts.
     */
    public function generateDefaultAccounts(int $ownerId): void
    {
        DB::transaction(function () use ($ownerId) {

            $existing = $this->account
                ->byOwnerId($ownerId)
                ->isSystem(true)
                ->count();

            if ($existing > 0) {
                throw new Exception("Default system accounts already exist for this owner");
            }

            $defaultAccounts = $this->getDefaultAccountTree();

            foreach ($defaultAccounts as $root) {
                $this->createAccountRecursive($ownerId, $root);
            }

            Log::info("Default chart of accounts generated", [
                "owner_id" => $ownerId,
                "generated_by" => Auth::id(),
            ]);
        });
    }

    /**
     * Create cash account for outlet
     * This will create a Level 3 account under "Kas" parent
     * 
     * @param int $ownerId
     * @param int $outletId
     * @param string $outletName
     * @return Account
     * @throws Exception
     */
    public function createCashAccountForOutlet(int $ownerId, int $outletId, string $outletName): Account
    {
        try {
            return DB::transaction(function () use ($ownerId, $outletId, $outletName) {
                $parentAccount = $this->account
                    ->byOwnerId($ownerId)
                    ->bySlug('cash')
                    ->whereNull('outlet_id')
                    ->first();

                if (!$parentAccount) {
                    Log::error('Cash parent account not found', [
                        'owner_id' => $ownerId,
                        'type' => 'account_service_error'
                    ]);

                    throw new Exception("Cash parent account not found for owner_id: {$ownerId}. Please generate default accounts first.");
                }
                $nextCode = $this->getNextCode($ownerId, $parentAccount->id);

                $account = $this->account->create([
                    'owner_id' => $ownerId,
                    'outlet_id' => $outletId,
                    'parent_id' => $parentAccount->id,
                    'code' => $nextCode,
                    'name' => "Kas {$outletName}",
                    'slug' => "cash_outlet_{$outletId}",
                    'type' => 'asset',
                    'account_role' => 'cash',
                    'level' => $parentAccount->level + 1,
                    'is_system' => false,
                    'is_transactional' => true,
                    'is_active' => true,

                ]);


                Log::info('Cash account created for outlet', [
                    'account_id' => $account->id,
                    'outlet_id' => $outletId,
                    'outlet_name' => $outletName,
                    'owner_id' => $ownerId,
                    'code' => $nextCode,
                    'type' => 'account_creation_success'
                ]);

                DB::commit();

                return $account;
            });
        } catch (Exception $e) {
            Log::error('Failed to create cash account for outlet', [
                'outlet_id' => $outletId,
                'outlet_name' => $outletName,
                'owner_id' => $ownerId,
                'error' => $e->getMessage(),
                'type' => 'account_service_error'
            ]);
            throw new Exception("Failed to create cash account for outlet: {$e->getMessage()}");
        }
    }

    /**
     * Delete cash account for outlet
     * 
     * @param int $outletId
     * @return bool
     */
    public function destroyCashAccountForOutlet(int $outletId): bool
    {
        try {
            $cashAccount = $this->account
                ->byOutletId($outletId)
                ->byAccountRole('cash')
                ->first();

            if ($cashAccount) {
                Log::info('Attempting to delete cash account for outlet', [
                    'account_id' => $cashAccount->id,
                    'outlet_id' => $outletId,
                    'account_name' => $cashAccount->name,
                    'account_role' => $cashAccount->account_role,
                ]);

                return $this->destroy($cashAccount->id);
            }

            Log::info('No cash account found to delete', [
                'outlet_id' => $outletId,
                'account_role' => 'cash',
            ]);

            return true;
        } catch (Exception $e) {
            Log::error('Failed to delete cash account for outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'type' => 'account_service_error'
            ]);
            return false;
        }
    }

    /**
     * Create receivable account for outlet
     * This will create a Level 3 account under "Piutang" parent
     * 
     * @param int $ownerId
     * @param int $outletId
     * @param string $outletName
     * @return Account
     * @throws Exception
     */
    public function createReceivableAccountForOutlet(int $ownerId, int $outletId, string $outletName): Account
    {
        try {
            return DB::transaction(function () use ($ownerId, $outletId, $outletName) {
                $parentAccount = $this->account
                    ->byOwnerId($ownerId)
                    ->bySlug('receivable')
                    ->whereNull('outlet_id')
                    ->first();

                if (!$parentAccount) {
                    Log::error('Receivable parent account not found', [
                        'owner_id' => $ownerId,
                        'type' => 'account_service_error'
                    ]);

                    throw new Exception("Receivable parent account not found for owner_id: {$ownerId}. Please generate default accounts first.");
                }

                $nextCode = $this->getNextCode($ownerId, $parentAccount->id);

                $account = $this->account->create([
                    'owner_id' => $ownerId,
                    'outlet_id' => $outletId,
                    'parent_id' => $parentAccount->id,
                    'code' => $nextCode,
                    'name' => "Piutang {$outletName}",
                    'slug' => "receivable_outlet_{$outletId}",
                    'type' => 'asset',
                    'account_role' => 'receivable',
                    'level' => $parentAccount->level + 1,
                    'is_system' => false,
                    'is_transactional' => true,
                    'is_active' => true,
                ]);

                Log::info('Receivable account created for outlet', [
                    'account_id' => $account->id,
                    'outlet_id' => $outletId,
                    'owner_id' => $ownerId,
                    'type' => 'account_creation_success'
                ]);

                DB::commit();
                return $account;
            });
        } catch (Exception $e) {
            Log::error('Failed to create receivable account for outlet', [
                'outlet_id' => $outletId,
                'outlet_name' => $outletName,
                'owner_id' => $ownerId,
                'error' => $e->getMessage(),
                'type' => 'account_service_error'
            ]);
            throw new Exception("Failed to create receivable account for outlet: {$e->getMessage()}");
        }
    }

    /**
     * Delete receivable account for outlet
     * 
     * @param int $outletId
     * @return bool
     */
    public function destroyReceivableAccountForOutlet(int $outletId): bool
    {
        try {
            $receivableAccount = $this->account
                ->byOutletId($outletId)
                ->byAccountRole('receivable')
                ->first();

            if ($receivableAccount) {
                Log::info('Attempting to delete receivable account for outlet', [
                    'account_id' => $receivableAccount->id,
                    'outlet_id' => $outletId,
                    'account_name' => $receivableAccount->name,
                    'account_role' => $receivableAccount->account_role,
                ]);

                return $this->destroy($receivableAccount->id);
            }

            Log::info('No receivable account found to delete', [
                'outlet_id' => $outletId,
                'account_role' => 'receivable',
            ]);

            return true;
        } catch (Exception $e) {
            Log::error('Failed to delete receivable account for outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'type' => 'account_service_error'
            ]);
            return false;
        }
    }

    /**
     * Create loan account for outlet
     * This will create a Level 3 account under "Kasbon" parent
     * 
     * @param int $ownerId
     * @param int $outletId
     * @param string $outletName
     * @return Account
     * @throws Exception
     */
    public function createLoanAccountForOutlet(int $ownerId, int $outletId, string $outletName): Account
    {
        try {
            return DB::transaction(function () use ($ownerId, $outletId, $outletName) {
                $parentAccount = $this->account
                    ->byOwnerId($ownerId)
                    ->bySlug('loan')
                    ->whereNull('outlet_id')
                    ->first();

                if (!$parentAccount) {
                    Log::error('Loan parent account not found', [
                        'owner_id' => $ownerId,
                        'type' => 'account_service_error'
                    ]);

                    throw new Exception("Loan parent account not found for owner_id: {$ownerId}. Please generate default accounts first.");
                }

                $nextCode = $this->getNextCode($ownerId, $parentAccount->id);

                $account = $this->account->create([
                    'owner_id' => $ownerId,
                    'outlet_id' => $outletId,
                    'parent_id' => $parentAccount->id,
                    'code' => $nextCode,
                    'name' => "Kasbon {$outletName}",
                    'slug' => "loan_outlet_{$outletId}",
                    'type' => 'asset',
                    'account_role' => 'loan',
                    'level' => $parentAccount->level + 1,
                    'is_system' => false,
                    'is_transactional' => true,
                    'is_active' => true,

                ]);

                Log::info('Loan account created for outlet', [
                    'account_id' => $account->id,
                    'outlet_id' => $outletId,
                    'owner_id' => $ownerId,
                    'type' => 'account_creation_success'
                ]);

                DB::commit();

                return $account;
            });
        } catch (Exception $e) {
            Log::error('Failed to create loan account for outlet', [
                'outlet_id' => $outletId,
                'outlet_name' => $outletName,
                'owner_id' => $ownerId,
                'error' => $e->getMessage(),
                'type' => 'account_service_error'
            ]);
            throw new Exception("Failed to create loan account for outlet: {$e->getMessage()}");
        }
    }

    /**
     * Delete loan account for outlet
     * 
     * @param int $outletId
     * @return bool
     */
    public function destroyLoanAccountForOutlet(int $outletId): bool
    {
        try {
            $loanAccount = $this->account
                ->byOutletId($outletId)
                ->byAccountRole('loan')
                ->first();

            if ($loanAccount) {
                Log::info('Attempting to delete loan account for outlet', [
                    'account_id' => $loanAccount->id,
                    'outlet_id' => $outletId,
                    'account_name' => $loanAccount->name,
                    'account_role' => $loanAccount->account_role,
                ]);

                return $this->destroy($loanAccount->id);
            }

            Log::info('No loan account found to delete', [
                'outlet_id' => $outletId,
                'account_role' => 'loan',
            ]);

            return true;
        } catch (Exception $e) {
            Log::error('Failed to delete loan account for outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'type' => 'account_service_error'
            ]);
            return false;
        }
    }

    /**
     * Create fine account for outlet
     * This will create a Level 3 account under "Denda" parent
     * 
     * @param int $ownerId
     * @param int $outletId
     * @param string $outletName
     * @return Account
     * @throws Exception
     */
    public function createFineAccountForOutlet(int $ownerId, int $outletId, string $outletName): Account
    {
        try {
            return DB::transaction(function () use ($ownerId, $outletId, $outletName) {
                $parentAccount = $this->account
                    ->byOwnerId($ownerId)
                    ->bySlug('fine')
                    ->whereNull('outlet_id')
                    ->first();

                if (!$parentAccount) {
                    Log::error('Fine parent account not found', [
                        'owner_id' => $ownerId,
                        'type' => 'account_service_error'
                    ]);

                    throw new Exception("Fine parent account not found for owner_id: {$ownerId}. Please generate default accounts first.");
                }

                $nextCode = $this->getNextCode($ownerId, $parentAccount->id);

                $account = $this->account->create([
                    'owner_id' => $ownerId,
                    'outlet_id' => $outletId,
                    'parent_id' => $parentAccount->id,
                    'code' => $nextCode,
                    'name' => "Denda {$outletName}",
                    'slug' => "fine_outlet_{$outletId}",
                    'type' => 'revenue',
                    'account_role' => 'fine',
                    'level' => $parentAccount->level + 1,
                    'is_system' => false,
                    'is_transactional' => true,
                    'is_active' => true,
                ]);

                Log::info('Fine account created for outlet', [
                    'account_id' => $account->id,
                    'outlet_id' => $outletId,
                    'owner_id' => $ownerId,
                    'type' => 'account_creation_success'
                ]);

                DB::commit();

                return $account;
            });
        } catch (Exception $e) {
            Log::error('Failed to create fine account for outlet', [
                'outlet_id' => $outletId,
                'outlet_name' => $outletName,
                'owner_id' => $ownerId,
                'error' => $e->getMessage(),
                'type' => 'account_service_error'
            ]);
            throw new Exception("Failed to create fine account for outlet: {$e->getMessage()}");
        }
    }

    /**
     * Delete fine account for outlet
     * 
     * @param int $outletId
     * @return bool
     */
    public function destroyFineAccountForOutlet(int $outletId): bool
    {
        try {
            $fineAccount = $this->account
                ->byOutletId($outletId)
                ->byAccountRole('fine')
                ->first();

            if ($fineAccount) {
                Log::info('Attempting to delete fine account for outlet', [
                    'account_id' => $fineAccount->id,
                    'outlet_id' => $outletId,
                    'account_name' => $fineAccount->name,
                    'account_role' => $fineAccount->account_role,
                ]);

                return $this->destroy($fineAccount->id);
            }

            Log::info('No fine account found to delete', [
                'outlet_id' => $outletId,
                'account_role' => 'fine',
            ]);

            return true;
        } catch (Exception $e) {
            Log::error('Failed to delete fine account for outlet', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'type' => 'account_service_error'
            ]);
            return false;
        }
    }

    /**
     * Update outlet account name by role
     * 
     * @param int $outletId
     * @param string $accountRole
     * @param string $newName
     * @return bool
     */
    public function updateOutletAccountName(int $outletId, string $accountRole, string $newName): bool
    {
        try {
            $account = $this->account
                ->byOutletId($outletId)
                ->byAccountRole($accountRole)
                ->first();

            if ($account) {
                $account->update(['name' => $newName]);

                Log::info('Outlet account name updated', [
                    'account_id' => $account->id,
                    'outlet_id' => $outletId,
                    'account_role' => $accountRole,
                    'new_name' => $newName,
                    'type' => 'outlet_account_name_update'
                ]);

                return true;
            }

            Log::warning('Outlet account not found for name update', [
                'outlet_id' => $outletId,
                'account_role' => $accountRole,
                'type' => 'outlet_account_name_update_warning'
            ]);

            return false;
        } catch (Exception $e) {
            Log::error('Failed to update outlet account name', [
                'outlet_id' => $outletId,
                'account_role' => $accountRole,
                'new_name' => $newName,
                'error' => $e->getMessage(),
                'type' => 'account_service_error'
            ]);

            return false;
        }
    }

    /**
     * Create account recursively with children
     * Uses auto-generated codes from model
     */
    private function createAccountRecursive(
        int $ownerId,
        array $accountData,
        ?int $parentId = null
    ): Account {
        $children = $accountData['children'] ?? [];
        unset($accountData['children']);

        $code = $accountData['code'] ?? Account::generateNextCode($ownerId, $parentId);

        $level = 1;
        if ($parentId) {
            $parent = $this->account->find($parentId);
            $level = $parent->level + 1;
        }

        $account = $this->account->create([
            'owner_id' => $ownerId,
            'parent_id' => $parentId,
            'code' => $code,
            'name' => $accountData['name'],
            'slug' => $accountData['slug'] ?? null,
            'account_role' => $accountData['account_role'] ?? null,
            'type' => $accountData['type'],
            'level' => $level,
            'is_system' => true,
            'is_transactional' => empty($children),
            'is_active' =>  true,
        ]);

        foreach ($children as $childData) {
            $this->createAccountRecursive($ownerId, $childData, $account->id);
        }

        return $account;
    }

    /**
     * Rename all outlet accounts based on new outlet name
     * Updates only the name field for all outlet accounts
     *
     * @param int $outletId
     * @param string $newOutletName
     * @return void
     * @throws Exception
     */
    public function renameOutletAccounts(int $outletId, string $newOutletName): void
    {
        try {
            DB::transaction(function () use ($outletId, $newOutletName) {
                $updatedCount = 0;

                foreach (self::OUTLET_ACCOUNT_ROLES as $role) {
                    $account = $this->account
                        ->byOutletId($outletId)
                        ->byAccountRole($role)
                        ->first();

                    if ($account) {
                        $newName = $this->generateOutletAccountName($role, $newOutletName);

                        $account->update(['name' => $newName]);
                        $updatedCount++;

                        Log::debug('Outlet account name updated', [
                            'account_id' => $account->id,
                            'outlet_id' => $outletId,
                            'account_role' => $role,
                            'old_name' => $account->getOriginal('name'),
                            'new_name' => $newName,
                            'account_code' => $account->code,
                            'type' => 'account_name_update'
                        ]);
                    } else {
                        Log::warning('Outlet account not found for rename', [
                            'outlet_id' => $outletId,
                            'account_role' => $role,
                            'new_outlet_name' => $newOutletName,
                            'type' => 'account_rename_warning'
                        ]);
                    }
                }

                Log::info('Outlet accounts renamed successfully', [
                    'outlet_id' => $outletId,
                    'new_outlet_name' => $newOutletName,
                    'accounts_updated' => $updatedCount,
                    'total_roles' => count(self::OUTLET_ACCOUNT_ROLES),
                    'user_id' => Auth::id(),
                    'type' => 'outlet_accounts_rename_service'
                ]);
            });
        } catch (Exception $e) {
            Log::error('Failed to rename outlet accounts', [
                'outlet_id' => $outletId,
                'new_outlet_name' => $newOutletName,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'type' => 'account_service_error'
            ]);
            throw new Exception("Failed to rename outlet accounts: {$e->getMessage()}");
        }
    }

    /**
     * Deactivate all outlet accounts when outlet is deleted
     * Sets is_active = false to preserve audit trail and transaction history
     *
     * @param int $outletId
     * @return void
     * @throws Exception
     */
    public function deactivateOutletAccounts(int $outletId): void
    {
        try {
            DB::transaction(function () use ($outletId) {
                $deactivatedCount = 0;

                foreach (self::OUTLET_ACCOUNT_ROLES as $role) {
                    $account = $this->account
                        ->byOutletId($outletId)
                        ->byAccountRole($role)
                        ->first();

                    if ($account) {
                        $account->update(['is_active' => false]);

                        $deactivatedCount++;

                        Log::debug('Outlet account deactivated', [
                            'account_id' => $account->id,
                            'outlet_id' => $outletId,
                            'account_role' => $role,
                            'account_name' => $account->name,
                            'account_code' => $account->code,
                            'deactivation_method' => 'is_active_false',
                            'type' => 'account_deactivation'
                        ]);
                    } else {
                        Log::warning('Outlet account not found for deactivation', [
                            'outlet_id' => $outletId,
                            'account_role' => $role,
                            'type' => 'account_deactivation_warning'
                        ]);
                    }
                }

                Log::info('Outlet accounts deactivated successfully', [
                    'outlet_id' => $outletId,
                    'accounts_deactivated' => $deactivatedCount,
                    'total_roles' => count(self::OUTLET_ACCOUNT_ROLES),
                    'user_id' => Auth::id(),
                    'type' => 'outlet_accounts_deactivation_service'
                ]);
            });
        } catch (Exception $e) {
            Log::error('Failed to deactivate outlet accounts', [
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'type' => 'account_service_error'
            ]);
            throw new Exception("Failed to deactivate outlet accounts: {$e->getMessage()}");
        }
    }

    /**
     * Generate outlet account name based on role and outlet name
     *
     * @param string $accountRole
     * @param string $outletName
     * @return string
     */
    private function generateOutletAccountName(string $accountRole, string $outletName): string
    {
        return match ($accountRole) {
            'cash' => "Kas {$outletName}",
            'receivable' => "Piutang {$outletName}",
            'loan' => "Kasbon {$outletName}",
            'fine' => "Denda {$outletName}",
            default => throw new Exception("Invalid account role: {$accountRole}")
        };
    }

    /**
     * Default Chart of Accounts structure
     */
    protected function getDefaultAccountTree(): array
    {
        return [

            // ==================================================
            // 1. ASET
            // ==================================================
            [
                'code' => '1',
                'name' => 'ASET',
                'type' => 'asset',
                'slug' => 'assets',
                'level' => 1,
                'is_transactional' => false,
                'children' => [

                    // --------------------------
                    // BANK (Kategori)
                    // --------------------------
                    [
                        'name' => 'Bank',
                        'type' => 'asset',
                        'slug' => 'bank',
                        'is_transactional' => false,
                        'children' => [
                            [
                                'name' => 'Bank BNI',
                                'type' => 'asset',
                                'slug' => 'bank_bni',
                                'account_role' => 'bank',
                                'is_transactional' => true,
                            ],
                            [
                                'name' => 'Bank BRI',
                                'type' => 'asset',
                                'slug' => 'bank_bri',
                                'account_role' => 'bank',
                                'is_transactional' => true,
                            ],
                            [
                                'name' => 'Bank BCA',
                                'type' => 'asset',
                                'slug' => 'bank_bca',
                                'account_role' => 'bank',
                                'is_transactional' => true,
                            ],
                            [
                                'name' => 'Bank Mandiri',
                                'type' => 'asset',
                                'slug' => 'bank_mandiri',
                                'account_role' => 'bank',
                                'is_transactional' => true,
                            ],
                        ],
                    ],

                    // --------------------------
                    // E-WALLET (Kategori)
                    // --------------------------
                    [
                        'name' => 'E-Wallet',
                        'type' => 'asset',
                        'slug' => 'ewallet',
                        'is_transactional' => false,
                        'children' => [
                            [
                                'name' => 'ShopeePay',
                                'type' => 'asset',
                                'slug' => 'shopeepay',
                                'account_role' => 'ewallet',
                                'is_transactional' => true,
                            ],
                            [
                                'name' => 'OVO',
                                'type' => 'asset',
                                'slug' => 'ovo',
                                'account_role' => 'ewallet',
                                'is_transactional' => true,
                            ],
                            [
                                'name' => 'GoPay',
                                'type' => 'asset',
                                'slug' => 'gopay',
                                'account_role' => 'ewallet',
                                'is_transactional' => true,
                            ],
                            [
                                'name' => 'DANA',
                                'type' => 'asset',
                                'slug' => 'dana',
                                'account_role' => 'ewallet',
                                'is_transactional' => true,
                            ],
                        ],
                    ],

                    // --------------------------
                    // KAS (Langsung Transaksional)
                    // --------------------------
                    [
                        'name' => 'Kas',
                        'type' => 'asset',
                        'slug' => 'cash',
                        'is_transactional' => false,
                        'children' => [
                            [
                                'name' => 'Kas Besar',
                                'type' => 'asset',
                                'slug' => 'master_cash',
                                'account_role' => 'cash',
                                'is_transactional' => true,
                            ],
                            [
                                'name' => 'Kas Kecil',
                                'type' => 'asset',
                                'slug' => 'petty_cash',
                                'account_role' => 'cash',
                                'is_transactional' => true,
                            ],
                        ],
                    ],
                    [
                        'name' => 'Piutang',
                        'type' => 'asset',
                        'slug' => 'receivable',
                        'is_transactional' => false,
                        'children' => [
                            [
                                'name' => 'Total Piutang',
                                'type' => 'asset',
                                'slug' => 'accounts_receivable',
                                'account_role' => 'receivable',
                                'is_transactional' => true,
                            ],
                            [
                                'name' => 'Piutang Karyawan',
                                'type' => 'asset',
                                'slug' => 'employee_receivable',
                                'is_transactional' => true,
                            ],
                        ]
                    ],
                    [
                        'name' => 'Kasbon',
                        'type' => 'asset',
                        'slug' => 'loan',
                        'is_transactional' => false,
                        'children' => [
                            [
                                'name' => 'Total Kasbon',
                                'type' => 'asset',
                                'slug' => 'master_loan',
                                'is_transactional' => true,
                            ],
                        ],

                    ],
                    [
                        'name' => 'Denda',
                        'type' => 'asset',
                        'slug' => 'fine',
                        'is_transactional' => false,
                        'children' => [
                            [
                                'name' => 'Total Denda',
                                'type' => 'asset',
                                'slug' => 'master_fines',
                                'is_transactional' => true,
                            ],
                        ],
                    ],
                    [
                        'name' => 'Aset Lainnya',
                        'type' => 'asset',
                        'slug' => 'other_assets',
                        'is_transactional' => false,
                        'children' => [
                            [
                                'name' => 'Saldo Koin',
                                'type' => 'asset',
                                'slug' => 'coin_asset',
                                'is_transactional' => true,
                            ],

                        ]
                    ]
                ],
            ],

            // ==================================================
            // 2. KEWAJIBAN
            // ==================================================
            [
                'code' => '2',
                'name' => 'KEWAJIBAN',
                'type' => 'liability',
                'slug' => 'liabilities',
                'level' => 1,
                'is_transactional' => false,
                'children' => [
                    [
                        'name' => 'Utang Usaha',
                        'type' => 'liability',
                        'slug' => 'account_payable',
                        'level' => 2,
                        'is_transactional' => true,
                    ],
                    [
                        'name' => 'Utang Gaji',
                        'type' => 'liability',
                        'slug' => 'salary_payable',
                        'level' => 2,
                        'is_transactional' => true,
                    ],
                    [
                        'name' => 'Utang Pajak',
                        'type' => 'liability',
                        'slug' => 'tax_payable',
                        'level' => 2,
                        'is_transactional' => true,
                    ],
                    [
                        'name' => 'Utang Paket Pelanggan',
                        'type' => 'liability',
                        'slug' => 'package_liability',
                        'level' => 2,
                        'is_transactional' => true,
                    ],
                ],
            ],

            // ==================================================
            // 3. MODAL
            // ==================================================
            [
                'code' => '3',
                'name' => 'MODAL',
                'type' => 'equity',
                'slug' => 'equity',
                'level' => 1,
                'is_transactional' => false,
                'children' => [
                    [
                        'name' => 'Modal Pemilik',
                        'type' => 'equity',
                        'slug' => 'owner_equity',
                        'level' => 2,
                        'is_transactional' => true,
                    ],
                    [
                        'name' => 'Prive',
                        'type' => 'equity',
                        'slug' => 'drawings',
                        'level' => 2,
                        'is_transactional' => true,
                    ],
                    [
                        'name' => 'Laba Ditahan',
                        'type' => 'equity',
                        'slug' => 'retained_earnings',
                        'level' => 2,
                        'is_transactional' => true,
                    ],
                ],
            ],

            // ==================================================
            // 4. PENDAPATAN
            // ==================================================
            [
                'code' => '4',
                'name' => 'PENDAPATAN',
                'type' => 'revenue',
                'slug' => 'revenue',
                'level' => 1,
                'is_transactional' => false,
                'children' => [
                    [
                        'name' => 'Pendapatan Laundry',
                        'type' => 'revenue',
                        'slug' => 'laundry_revenue',
                        'level' => 2,
                        'is_transactional' => true,
                    ],
                    [
                        'name' => 'Pendapatan Paket',
                        'type' => 'revenue',
                        'slug' => 'service_revenue',
                        'level' => 2,
                        'is_transactional' => true,
                    ],
                    [
                        'name' => 'Pendapatan Hangus Paket',
                        'type' => 'revenue',
                        'slug' => 'package_breakage_revenue',
                        'level' => 2,
                        'is_transactional' => true,
                    ],
                    [
                        'name' => 'Pendapatan Topup Koin',
                        'type' => 'revenue',
                        'slug' => 'coin_topup_revenue',
                        'level' => 2,
                        'is_transactional' => true,
                    ],
                    [
                        'name' => 'Pendapatan Denda',
                        'type' => 'revenue',
                        'slug' => 'fine_revenue',
                        'level' => 2,
                        'is_transactional' => true,
                    ],
                ],
            ],

            // ==================================================
            // 5. BEBAN
            // ==================================================
            [
                'code' => '5',
                'name' => 'BEBAN',
                'type' => 'expense',
                'slug' => 'expenses',
                'level' => 1,
                'is_transactional' => false,
                'children' => [
                    // --------------------------
                    // BEBAN OPERASIONAL
                    // --------------------------
                    [
                        'name' => 'Beban Operasional',
                        'type' => 'expense',
                        'slug' => 'operational_expense',
                        'is_transactional' => false,
                        'children' => [
                            [
                                'name' => 'Beban Gaji',
                                'type' => 'expense',
                                'slug' => 'salary_expense',
                                'is_transactional' => true,
                            ],
                            [
                                'name' => 'Beban Koin',
                                'type' => 'expense',
                                'slug' => 'coin_expense',
                                'is_transactional' => true,
                            ],
                            [
                                'name' => 'Beban Diskon Paket',
                                'type' => 'expense',
                                'slug' => 'package_discount_expense',
                                'is_transactional' => true,
                            ],
                            [
                                'name' => 'Beban Listrik',
                                'type' => 'expense',
                                'slug' => 'electricity_expense',
                                'is_transactional' => true,
                            ],
                            [
                                'name' => 'Beban Air',
                                'type' => 'expense',
                                'slug' => 'water_expense',
                                'is_transactional' => true,
                            ],
                            [
                                'name' => 'Beban Sewa',
                                'type' => 'expense',
                                'slug' => 'rent_expense',
                                'is_transactional' => true,
                            ],
                            [
                                'name' => 'Beban Pemeliharaan',
                                'type' => 'expense',
                                'slug' => 'maintenance_expense',
                                'is_transactional' => true,
                            ],
                        ],
                    ],
                    // --------------------------
                    // BEBAN NON-OPERASIONAL
                    // --------------------------
                    [
                        'name' => 'Beban Non-Operasional',
                        'type' => 'expense',
                        'slug' => 'non_operational_expense',
                        'is_transactional' => false,
                        'children' => [
                            [
                                'name' => 'Beban Komisi Referral',
                                'type' => 'expense',
                                'slug' => 'referral_expense',
                                'is_transactional' => true,
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * ============================================================
     * PRIVATE HELPER METHODS
     * ============================================================
     */


    /**
     * Check if user can modify account
     */
    private function canUserModifyAccount(User $user, Account $account): bool
    {
        if ($user->hasRole('super_admin')) {
            return true;
        }

        if ($user->hasRole('owner') && (int) $account->owner_id === (int) $user->id) {
            return true;
        }

        return false;
    }


    /**
     * Apply filters to the query
     */
    /*
    |--------------------------------------------------------------------------
    | Private — Filters
    |--------------------------------------------------------------------------
    */

    private function applyFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (isset($filters['ownerId'])) {
            $query->byOwnerId((int) $filters['ownerId']);
        }

        if (!empty($filters['slug'])) {
            $query->bySlug((string) $filters['slug']);
        }

        if (array_key_exists('outletId', $filters) && empty($filters['includeCommonOutletAccounts'])) {
            $query->byOutletId($filters['outletId']);
        }

        if (isset($filters['isSystem'])) {
            $query->isSystem($filters['isSystem']);
        }

        if (!empty($filters['type'])) {
            $query->byType($filters['type']);
        }

        if (!empty($filters['accountRole'])) {
            $query->byAccountRole($filters['accountRole']);
        }

        if (isset($filters['isActive'])) {
            if ($filters['isActive']) {
                $query->active();
            } else {
                $query->inactive();
            }
        }

        if (isset($filters['accountRoles'])) {
            $query->byAccountRoles($filters['accountRoles']);
        }

        if (isset($filters['isTransactional'])) {
            $query->isTransactional($filters['isTransactional']);
        }

        if (!empty($filters['level'])) {
            $query->byLevel($filters['level']);
        }

        if (!empty($filters['sortBy'])) {
            $direction = $filters['sortDirection'] ?? 'asc';
            $query->orderBy($filters['sortBy'], $direction);
        }
    }
}
