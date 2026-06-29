<?php

namespace App\Services;

use App\Enums\Permission;
use App\Models\Position;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PositionService extends BaseService
{
    public function __construct(
        protected Position $position,
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
        array $relations = ['outlet']
    ): LengthAwarePaginator|Collection {
        try {
            $query = $this->position->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get positions', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'position_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(int $id, array $relations = ['outlet']): Position
    {
        try {
            $query = $this->position->byId($id);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get position by ID', [
                'position_id' => $id,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'position_service_error',
            ]);
            throw $e;
        }
    }

    public function getPermissionCatalog(): array
    {
        return array_map(
            fn(Permission $p) => ['key' => $p->value, 'label' => $p->label()],
            Permission::cases()
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function store(array $data): Position
    {
        $authUser = Auth::user();
        $outlet = \App\Models\Outlet::findOrFail($data['outletId']);
        if (!($authUser instanceof \App\Models\User) || 
            (!$authUser->hasRole('super_admin') && $outlet->owner_id !== $authUser->id)) {
            throw new \Illuminate\Auth\Access\AuthorizationException('Unauthorized.');
        }

        return DB::transaction(function () use ($data) {
            try {
                $position = $this->position->create([
                    'outlet_id'   => $data['outletId'],
                    'name'        => $data['name'],
                    'description' => $data['description'] ?? null,
                    'is_active'   => true,
                ]);

                if (isset($data['permissions']) && is_array($data['permissions'])) {
                    $this->updatePermissions($position->id, $data['permissions']);
                }

                Log::info('Position created successfully', [
                    'position_id' => $position->id,
                    'outlet_id'   => $position->outlet_id,
                    'name'        => $position->name,
                    'user_id'     => Auth::id(),
                    'type'        => 'position_service_action',
                ]);

                return $position->fresh(['outlet', 'permissions']);
            } catch (Exception $e) {
                Log::error('Failed to create position', [
                    'data'    => $data,
                    'error'   => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type'    => 'position_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function update(int $id, array $data): Position
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $position = $this->position->findOrFail($id);

                $authUser = Auth::user();
                if (!($authUser instanceof \App\Models\User) || 
                    (!$authUser->hasRole('super_admin') && $position->outlet->owner_id !== $authUser->id)) {
                    throw new \Illuminate\Auth\Access\AuthorizationException('Unauthorized.');
                }

                if (isset($data['name']))        $position->name        = $data['name'];
                if (isset($data['description'])) $position->description = $data['description'];
                if (isset($data['isActive']))    $position->is_active   = $data['isActive'];

                $position->save();

                if (isset($data['permissions']) && is_array($data['permissions'])) {
                    $this->updatePermissions($position->id, $data['permissions']);
                }

                Log::info('Position updated successfully', [
                    'position_id' => $id,
                    'outlet_id'   => $position->outlet_id,
                    'type'        => 'position_service_action',
                ]);

                return $position->fresh(['outlet', 'permissions']);
            } catch (Exception $e) {
                Log::error('Failed to update position', [
                    'position_id' => $id,
                    'data'        => $data,
                    'error'       => $e->getMessage(),
                    'user_id'     => Auth::id(),
                    'type'        => 'position_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroy(int $id): bool
    {
        try {
            $position = $this->position->findOrFail($id);

            $authUser = Auth::user();
            if (!($authUser instanceof \App\Models\User) || 
                (!$authUser->hasRole('super_admin') && $position->outlet->owner_id !== $authUser->id)) {
                throw new \Illuminate\Auth\Access\AuthorizationException('Unauthorized.');
            }

            $deleted  = $position->delete();

            if ($deleted) {
                Log::info('Position deleted successfully', [
                    'position_id' => $id,
                    'outlet_id'   => $position->outlet_id,
                    'name'        => $position->name,
                    'type'        => 'position_service_action',
                ]);
            }

            return $deleted;
        } catch (Exception $e) {
            Log::error('Failed to delete position', [
                'position_id' => $id,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'position_service_error',
            ]);
            throw $e;
        }
    }

    public function restore(int $id): Position
    {
        try {
            $position = $this->position->withTrashed()->findOrFail($id);

            $authUser = Auth::user();
            if (!($authUser instanceof \App\Models\User) || 
                (!$authUser->hasRole('super_admin') && $position->outlet->owner_id !== $authUser->id)) {
                throw new \Illuminate\Auth\Access\AuthorizationException('Unauthorized.');
            }

            if (!$position->trashed()) {
                throw new Exception('Position is not deleted');
            }

            $position->restore();

            Log::info('Position restored successfully', [
                'position_id' => $id,
                'outlet_id'   => $position->outlet_id,
                'name'        => $position->name,
                'type'        => 'position_service_action',
            ]);

            return $position;
        } catch (Exception $e) {
            Log::error('Failed to restore position', [
                'position_id' => $id,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'position_service_error',
            ]);
            throw $e;
        }
    }

    public function forceDestroy(int $id): bool
    {
        try {
            $position = $this->position->withTrashed()->findOrFail($id);

            $authUser = Auth::user();
            if (!($authUser instanceof \App\Models\User) || 
                (!$authUser->hasRole('super_admin') && $position->outlet->owner_id !== $authUser->id)) {
                throw new \Illuminate\Auth\Access\AuthorizationException('Unauthorized.');
            }

            if ($position->hasEmployees()) {
                throw new Exception('Cannot permanently delete position that has associated employees');
            }

            $positionName = $position->name;
            $outletId     = $position->outlet_id;
            $deleted      = $position->forceDelete();

            if ($deleted) {
                Log::info('Position permanently deleted', [
                    'position_id' => $id,
                    'outlet_id'   => $outletId,
                    'name'        => $positionName,
                    'type'        => 'position_service_action',
                ]);
            }

            return $deleted;
        } catch (Exception $e) {
            Log::error('Failed to force delete position', [
                'position_id' => $id,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'position_service_error',
            ]);
            throw $e;
        }
    }

    public function createDefaultPositionsForOutlet(int $outletId): array
    {
        return DB::transaction(function () use ($outletId) {
            try {
                $defaultPositions = $this->getDefaultPositions();
                $createdPositions = [];

                foreach ($defaultPositions as $positionData) {
                    $position = $this->position->create([
                        'outlet_id'   => $outletId,
                        'name'        => $positionData['name'],
                        'slug'        => $positionData['slug'],
                        'description' => $positionData['description'],
                        'is_default'  => $positionData['is_default'],
                        'is_active'   => true,
                    ]);

                    $permissionKeys = Permission::defaultForSlug($positionData['slug']);
                    foreach ($permissionKeys as $key) {
                        $position->permissions()->create(['permission_key' => $key]);
                    }

                    $createdPositions[] = $position;
                }

                Log::info('Default positions created for outlet', [
                    'outlet_id'         => $outletId,
                    'positions_created' => count($createdPositions),
                    'position_names'    => array_column($createdPositions, 'name'),
                    'user_id'           => Auth::id(),
                    'type'              => 'default_positions_creation',
                ]);

                return $createdPositions;
            } catch (Exception $e) {
                Log::error('Failed to create default positions for outlet', [
                    'outlet_id' => $outletId,
                    'error'     => $e->getMessage(),
                    'user_id'   => Auth::id(),
                    'type'      => 'position_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function updatePermissions(int $positionId, array $permissionKeys): void
    {
        $position = $this->position->findOrFail($positionId);

        $authUser = Auth::user();
        if (!($authUser instanceof \App\Models\User) || 
            (!$authUser->hasRole('super_admin') && $position->outlet->owner_id !== $authUser->id)) {
            throw new \Illuminate\Auth\Access\AuthorizationException('Unauthorized.');
        }

        DB::transaction(function () use ($position, $permissionKeys) {
            $position->permissions()->whereNotIn('permission_key', $permissionKeys)->delete();

            foreach ($permissionKeys as $key) {
                $validEnum = Permission::tryFrom($key);
                if (!$validEnum) {
                    throw new Exception("Invalid permission key: " . $key);
                }

                $position->permissions()->firstOrCreate(['permission_key' => $key]);
            }

            Log::info('Position permissions updated', [
                'position_id' => $position->id,
                'permissions' => $permissionKeys,
                'user_id'     => Auth::id(),
                'type'        => 'position_permissions_update',
            ]);
        });
    }

    public function getPermissions(int $positionId): array
    {
        $position = $this->position->findOrFail($positionId);
        return $position->getPermissionKeys();
    }

    /*
    |--------------------------------------------------------------------------
    | Private — Filters & Helpers
    |--------------------------------------------------------------------------
    */

    protected function applyFilters(Builder $query, array $filters = []): void
    {
        if (isset($filters['isActive'])) {
            $query->status($filters['isActive']);
        }

        if (isset($filters['outletId'])) {
            $query->byOutletId($filters['outletId']);
        }

        if (isset($filters['search'])) {
            $query->search($filters['search']);
        }

        $sortBy    = $filters['sortBy'] ?? 'createdAt';
        $sortOrder = $filters['sortOrder'] ?? 'desc';

        $query->sortBy($sortBy, $sortOrder);
    }

    private function getDefaultPositions(): array
    {
        return [
            [
                'name'        => 'Kasir',
                'slug'        => 'kasir',
                'description' => 'Bertanggung jawab menangani transaksi pembayaran, penerimaan orderan, dan pelayanan pelanggan di kasir.',
                'is_default'  => true,
            ],
            [
                'name'        => 'Produksi',
                'slug'        => 'produksi',
                'description' => 'Bertanggung jawab dalam proses pembuatan dan penyelesaian produk sesuai pesanan pelanggan.',
                'is_default'  => true,
            ],
            [
                'name'        => 'Kurir',
                'slug'        => 'kurir',
                'description' => 'Bertanggung jawab mengambil dan mengantar cucian pelanggan.',
                'is_default'  => true,
            ],
        ];
    }
}
