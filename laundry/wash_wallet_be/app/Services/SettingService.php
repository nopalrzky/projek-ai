<?php

namespace App\Services;

use App\Models\Setting;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SettingService extends BaseService
{
    public function __construct(
        protected Setting $setting,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Read Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Get all settings with filters and pagination.
     */
    public function getAll(
        array $filters = [],
        ?int $page = null,
        ?int $perPage = null,
        array $relations = []
    ): LengthAwarePaginator|Collection {
        try {
            $query = $this->setting->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get settings', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'setting_service_error',
            ]);
            throw $e;
        }
    }

    /**
     * Get setting by ID.
     */
    public function getById(int $id, array $relations = []): Setting
    {
        try {
            $query = $this->setting->query();

            $this->applyTenantScope($query);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->findOrFail($id);
        } catch (Exception $e) {
            Log::error('Failed to get setting by ID', [
                'setting_id' => $id,
                'error'      => $e->getMessage(),
                'user_id'    => Auth::id(),
                'type'       => 'setting_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Store a new setting.
     */
    public function store(array $data): Setting
    {
        return DB::transaction(function () use ($data) {
            try {
                $setting = $this->setting->create([
                    'key'         => $data['key'],
                    'name'        => $data['name'],
                    'description' => $data['description'] ?? null,
                ]);

                Log::info('Setting created successfully', [
                    'setting_id' => $setting->id,
                    'key'        => $setting->key,
                    'user_id'    => Auth::id(),
                    'type'       => 'setting_management',
                ]);

                return $setting;
            } catch (Exception $e) {
                Log::error('Failed to create setting', [
                    'error'   => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type'    => 'setting_service_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Update an existing setting.
     */
    public function update(int $id, array $data): Setting
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $setting = $this->getById($id);

                $updateData = [];
                if (isset($data['key']))         $updateData['key']         = $data['key'];
                if (isset($data['name']))        $updateData['name']        = $data['name'];
                if (isset($data['description'])) $updateData['description'] = $data['description'];

                $setting->update($updateData);

                Log::info('Setting updated successfully', [
                    'setting_id' => $id,
                    'changes'    => array_keys($updateData),
                    'user_id'    => Auth::id(),
                    'type'       => 'setting_management',
                ]);

                return $setting->fresh();
            } catch (Exception $e) {
                Log::error('Failed to update setting', [
                    'setting_id' => $id,
                    'error'      => $e->getMessage(),
                    'user_id'    => Auth::id(),
                    'type'       => 'setting_service_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Delete a setting.
     */
    public function destroy(int $id): bool
    {
        try {
            $setting = $this->getById($id);
            $deleted = $setting->delete();

            if ($deleted) {
                Log::info('Setting deleted successfully', [
                    'setting_id' => $id,
                    'user_id'    => Auth::id(),
                    'type'       => 'setting_management',
                ]);
            }

            return $deleted;
        } catch (Exception $e) {
            Log::error('Failed to delete setting', [
                'setting_id' => $id,
                'error'      => $e->getMessage(),
                'user_id'    => Auth::id(),
                'type'       => 'setting_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Internal Helpers
    |--------------------------------------------------------------------------
    */

    /**
     * Apply filters to the query.
     */
    protected function applyFilters(Builder $query, array $filters = []): void
    {
        if (!empty($filters['search'])) {
            $query->where(function (Builder $q) use ($filters) {
                $q->where('key', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (!empty($filters['key'])) {
            $query->byKey($filters['key']);
        }

        $this->applySort(
            $query,
            $filters['sortBy'] ?? 'created_at',
            $filters['sortDirection'] ?? 'desc',
            ['id', 'key', 'name', 'created_at', 'updated_at'],
            ['createdAt' => 'created_at', 'updatedAt' => 'updated_at']
        );
    }
}
