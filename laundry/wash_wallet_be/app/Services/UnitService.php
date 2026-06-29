<?php

namespace App\Services;

use App\Models\Unit;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UnitService extends BaseService
{
    public function __construct(
        protected Unit $unit,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Read Methods
    |--------------------------------------------------------------------------
    */

    public function getAll(
        array $filters = [],
        array $relations = []
    ): LengthAwarePaginator|Collection {
        try {
            $page    = $filters['page'] ?? 1;
            $perPage = $filters['perPage'] ?? 15;

            $query = $this->unit->query();

            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get units', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(int $id, array $relations = []): Unit
    {
        try {
            $query = $this->unit->byId($id);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get unit by ID', [
                'unit_id' => $id,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function store(array $data): Unit
    {
        try {
            $unit = $this->unit->create([
                'name'        => $data['name'],
                'symbol'      => $data['symbol'],
                'description' => $data['description'] ?? null,
            ]);

            Log::info('Unit created successfully', [
                'unit_id' => $unit->id,
                'name'    => $unit->name,
                'symbol'  => $unit->symbol,
                'type'    => 'unit_action',
            ]);

            return $unit;
        } catch (Exception $e) {
            Log::error('Failed to create unit', [
                'data'  => $data,
                'error' => $e->getMessage(),
                'type'  => 'unit_service_error',
            ]);
            throw $e;
        }
    }

    public function update(int $id, array $data): Unit
    {
        try {
            $unit = $this->unit->byId($id)->firstOrFail();

            if (isset($data['name']))        $unit->name        = $data['name'];
            if (isset($data['symbol']))      $unit->symbol      = $data['symbol'];
            if (isset($data['description'])) $unit->description = $data['description'];

            $unit->save();

            Log::info('Unit updated successfully', [
                'unit_id'        => $unit->id,
                'updated_fields' => array_keys($data),
                'type'           => 'unit_action',
            ]);

            return $unit->fresh();
        } catch (Exception $e) {
            Log::error('Failed to update unit', [
                'unit_id' => $id,
                'data'    => $data,
                'error'   => $e->getMessage(),
                'type'    => 'unit_service_error',
            ]);
            throw $e;
        }
    }

    public function destroy(int $id): bool
    {
        try {
            $unit    = $this->unit->byId($id)->firstOrFail();
            $deleted = $unit->delete();

            if ($deleted) {
                Log::info('Unit deleted successfully', [
                    'unit_id' => $id,
                    'name'    => $unit->name,
                    'type'    => 'unit_action',
                ]);
            }

            return $deleted;
        } catch (Exception $e) {
            Log::error('Failed to delete unit', [
                'unit_id' => $id,
                'error'   => $e->getMessage(),
                'type'    => 'unit_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Private — Filters
    |--------------------------------------------------------------------------
    */

    protected function applyFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['symbol'])) {
            $query->bySymbol($filters['symbol']);
        }

        $sortBy        = $filters['sortBy'] ?? 'created_at';
        $sortDirection = $filters['sortDirection'] ?? 'desc';

        $query->sortBy($sortBy, $sortDirection);
    }
}
