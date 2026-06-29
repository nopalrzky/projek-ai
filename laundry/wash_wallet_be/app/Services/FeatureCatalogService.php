<?php

namespace App\Services;

use App\Models\Feature;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FeatureCatalogService extends BaseService
{
    public function __construct(
        protected Feature $feature
    ) {}

    /**
     * Get all features with filters and pagination
     */
    public function getAll(
        array $filters = [],
        ?int $page = null,
        ?int $perPage = null
    ): LengthAwarePaginator | Collection {
        try {
            $query = $this->feature->query();

            $this->applyFilters($query, $filters);

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get features', [
                'filters' => $filters,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'feature_catalog_service_error'
            ]);
            throw $e;
        }
    }

    public function getById(
        int $id
    ): Feature {
        try {
            $query = $this->feature->byId($id);

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get feature by ID', [
                'feature_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'feature_catalog_service_error'
            ]);
            throw $e;
        }
    }


    /**
     * Store new feature in catalog
     */
    public function store(array $data): Feature
    {
        return DB::transaction(function () use ($data) {
            return $this->feature->create([
                'key'            => $data['key'],
                'name'           => $data['name'],
                'description'    => $data['description'] ?? null,
                'coin_price'     => $data['coinPrice'] ?? 0,
                'is_paid'        => $data['isPaid'] ?? (isset($data['coinPrice']) && $data['coinPrice'] > 0),
                'is_active'      => $data['isActive'] ?? true,
                'sort_order'     => $data['sortOrder'] ?? 0,
                'duration_days'  => $data['durationDays'] ?? null,
            ]);
        });
    }

    /**
     * Update existing feature in catalog
     */
    public function update(int $id, array $data): Feature
    {
        return DB::transaction(function () use ($id, $data) {
            $feature = $this->feature->findOrFail($id);

            $feature->update([
                'name'           => $data['name'] ?? $feature->name,
                'description'    => $data['description'] ?? $feature->description,
                'coin_price'     => $data['coinPrice'] ?? $feature->coin_price,
                'is_paid'        => $data['isPaid'] ?? $feature->is_paid,
                'is_active'      => $data['isActive'] ?? $feature->is_active,
                'sort_order'     => $data['sortOrder'] ?? $feature->sort_order,
                'duration_days'  => $data['durationDays'] ?? $feature->duration_days,
            ]);

            return $feature->fresh();
        });
    }

    /**
     * Delete feature from catalog (permanent)
     */
    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $feature = $this->feature->findOrFail($id);
            return $feature->delete();
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Private — Filters & Helpers
    |--------------------------------------------------------------------------
    */

    protected function applyFilters(Builder $query, array $filters = []): void
    {
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['key'])) {
            $query->byKey($filters['key']);
        }

        if (!empty($filters['excludeKey'])) {
            $query->notKey($filters['excludeKey']);
        }

        if (isset($filters['isActive'])) {
            $filters['isActive'] ? $query->active() : $query->inactive();
        }

        $sortBy        = $filters['sortBy'] ?? 'sort_order';
        $sortDirection = $filters['sortDirection'] ?? 'asc';
        $allowed       = ['sort_order', 'name', 'key', 'coin_price', 'duration_days', 'created_at', 'updated_at'];

        $this->applySort($query, $sortBy, $sortDirection, $allowed, [], 'sort_order');
    }
}
