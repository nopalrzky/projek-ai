<?php

namespace App\Services;

use App\Models\CustomerAccount;
use App\Models\Employee;
use App\Models\User;
use App\Models\Outlet;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Abstract base class for all service classes.
 *
 * Provides shared utilities:
 *  - applyTenantScope()   — restrict query by logged-in user role (super_admin / owner / employee)
 *  - paginate()           — unified pagination or get-all helper
 *  - applySort()          — safe column + direction ordering
 *  - resolveUser()        — retrieve the currently authenticated user or employee
 *  - resolveOwnerId()     — resolve the owner ID from the authenticated context
 *  - resolveOutletId()    — resolve the outlet ID from the authenticated context (employee guard)
 *  - isEmployee()         — check if currently authenticated as an employee
 *  - isOwner()            — check if currently authenticated as an owner (User with role owner)
 *  - isSuperAdmin()       — check if currently authenticated as a super_admin
 */
abstract class BaseService
{
    /*
    |--------------------------------------------------------------------------
    | Tenant Scope
    |--------------------------------------------------------------------------
    */

    /**
     * Apply multi-tenant scope to a query.
     *
     * Rules:
     *  - super_admin  → no restriction (sees everything)
     *  - owner        → scoped to `byOwnerId($user->id)` — the model must have scopeByOwnerId
     *  - employee     → scoped to `byOutletId($employee->outlet_id)` — model must have scopeByOutletId
     *  - others       → blocked with `whereRaw('1 = 0')`
     *
     * @param  Builder  $query        The Eloquent query builder to restrict.
     * @param  string   $ownerField   Scope method name for owner filtering (default: 'byOwnerId').
     * @param  string   $outletField  Scope method name for outlet filtering (default: 'byOutletId').
     */
    protected function applyTenantScope(
        Builder $query,
        string $ownerField = 'byOwnerId',
        string $outletField = 'byOutletId'
    ): void {
        $user = Auth::user();

        if (!$user) {
            $query->whereRaw('1 = 0');
            return;
        }

        if ($user instanceof CustomerAccount) {
            return;
        }

        if ($user instanceof Employee) {
            $outletIds = $user->getAccessibleOutletIds();
            if (method_exists($query->getModel(), 'scopeByOutletIds')) {
                $query->byOutletIds($outletIds);
            } elseif (method_exists($query->getModel(), 'scopeByOutletId') && count($outletIds) === 1) {
                $singleOutletId = reset($outletIds);
                if ($singleOutletId === false) {
                    $query->whereRaw('1 = 0');
                    return;
                }
                $query->byOutletId((int) $singleOutletId);
            } else {
                $table = $query->getModel()->getTable();
                $query->whereIn($table . '.outlet_id', $outletIds);
            }
            return;
        }

        // User guard
        if ($user instanceof User) {
            if ($user->hasRole('super_admin')) {
                return;
            }

            if ($user->hasRole('owner')) {
                $query->{$ownerField}($user->id);
                return;
            }
        }

        // Deny all others
        $query->whereRaw('1 = 0');
    }

    /*
    |--------------------------------------------------------------------------
    | Pagination Helper
    |--------------------------------------------------------------------------
    */

    /**
     * Return paginated results or a full collection, based on $perPage and $page.
     *
     * @param  Builder|QueryBuilder  $query
     * @param  int|null  $perPage  Number of items per page. Pass null or 0 to get all.
     * @param  int|null  $page     Page number. Pass null or 0 to get all.
     * @return LengthAwarePaginator|Collection
     */
    protected function paginate(Builder|QueryBuilder $query, ?int $perPage, ?int $page): LengthAwarePaginator|Collection
    {
        if ($perPage > 0 && $page > 0) {
            return $query->paginate($perPage, ['*'], 'page', $page);
        }

        return $query->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Sort Helper
    |--------------------------------------------------------------------------
    */

    /**
     * Apply a safe ORDER BY to the query.
     *
     * @param  Builder       $query
     * @param  string        $column       Column to sort by. Will be mapped via $columnMap if provided.
     * @param  string        $direction    'asc' or 'desc'.
     * @param  array         $allowed      Whitelist of allowed column names (camelCase keys from $columnMap).
     * @param  array         $columnMap    Map of camelCase → snake_case column names.
     * @param  string        $default      Default column key if $column is not in $allowed.
     */
    protected function applySort(
        Builder $query,
        string $column,
        string $direction = 'desc',
        array $allowed = [],
        array $columnMap = [],
        string $default = 'created_at'
    ): void {
        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';

        if (!empty($allowed) && !in_array($column, $allowed)) {
            $column = $default;
        }

        $column = $columnMap[$column] ?? $column;

        $query->orderBy($column, $direction);
    }

    /*
    |--------------------------------------------------------------------------
    | Auth Helpers
    |--------------------------------------------------------------------------
    */

    /**
     * Get the currently authenticated user or employee.
     *
     * @return User|Employee
     * @throws Exception if no user is authenticated.
     */
    protected function resolveUser(): User|Employee
    {
        $user = Auth::user();

        if (!($user instanceof User || $user instanceof Employee)) {
            throw new Exception('Unauthenticated. Please log in.');
        }

        return $user;
    }

    /**
     * Resolve the authenticated owner's user ID.
     * Works for both User (owner) and Employee (looks up outlet->owner_id).
     *
     * @throws Exception
     */
    protected function resolveOwnerId(): int
    {
        $user = $this->resolveUser();

        if ($user instanceof Employee) {
            return $user->outlet->owner_id
                ?? throw new Exception('Employee outlet owner not found.');
        }

        return (int) $user->id;
    }

    /**
     * Resolve the authenticated employee's outlet ID.
     * Only valid in the employee (mobile) guard context.
     *
     * @throws Exception if the user is not an employee.
     */
    protected function resolveOutletId(?int $requestOutletId = null): int
    {
        $user = $this->resolveUser();

        if (!($user instanceof Employee)) {
            throw new Exception('resolveOutletId() is only valid for the employee guard.');
        }

        $outletId = $requestOutletId ?? request('outlet_id') ?? request('outletId') ?? request()->header('X-Outlet-ID');
        if ($outletId !== null) {
            $outletId = (int) $outletId;
            if (!in_array($outletId, $user->getAccessibleOutletIds())) {
                throw new AccessDeniedHttpException('Unauthorized access to outlet ID ' . $outletId);
            }
            return $outletId;
        }

        if ($user->outlet_id === null) {
            throw new Exception('Employee outlet not found.');
        }

        return (int) $user->outlet_id;
    }

    /**
     * Resolve all accessible outlet IDs based on user guard and role.
     */
    protected function resolveAccessibleOutletIds(): array
    {
        $user = $this->resolveUser();

        if ($user instanceof Employee) {
            return $user->getAccessibleOutletIds();
        }

        if ($user instanceof User) {
            if ($user->hasRole('super_admin')) {
                return Outlet::pluck('id')->toArray();
            }
            if ($user->hasRole('owner')) {
                return Outlet::where('owner_id', $user->id)->pluck('id')->toArray();
            }
        }

        return [];
    }

    /**
     * Check if the authenticated employee has a specific permission.
     *
     * @throws AccessDeniedHttpException
     */
    protected function checkPermission(string $permission, ?int $outletId = null): void
    {
        $user = $this->resolveUser();

        if ($user instanceof Employee) {
            $targetOutletId = $outletId ?? $this->resolveOutletId();
            if (!$user->hasPermissionOnOutlet($permission, $targetOutletId)) {
                throw new AccessDeniedHttpException(
                    "Employee does not have permission '{$permission}' on outlet ID {$targetOutletId}."
                );
            }
        }
    }

    /**
     * Check if the current session is authenticated as an Employee.
     */
    protected function isEmployee(): bool
    {
        return Auth::user() instanceof Employee;
    }

    /**
     * Check if the current session is authenticated as an owner (User with role 'owner').
     */
    protected function isOwner(): bool
    {
        $user = Auth::user();
        return $user instanceof User && $user->hasRole('owner');
    }

    /**
     * Check if the current session is authenticated as a super_admin.
     */
    protected function isSuperAdmin(): bool
    {
        $user = Auth::user();
        return $user instanceof User && $user->hasRole('super_admin');
    }
}
