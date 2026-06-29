<?php

namespace App\Services;

use App\Models\Fine;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FineService extends BaseService
{
    public function __construct(
        protected Fine $fine,
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
        array $relations = ['fineLogs', 'outlet']
    ): LengthAwarePaginator|Collection {
        try {
            $query = $this->fine->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get fines', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'fine_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(int $id, array $relations = ['fineLogs', 'outlet']): Fine
    {
        try {
            $query = $this->fine->byId($id);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get fine by ID', [
                'fine_id' => $id,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'fine_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function store(array $data): Fine
    {
        return DB::transaction(function () use ($data) {
            try {
                $fine = $this->fine->create([
                    'outlet_id'   => $data['outletId'] ?? null,
                    'name'        => $data['name'],
                    'amount'      => $data['amount'],
                    'description' => $data['description'] ?? null,
                ]);

                Log::info('Fine master created successfully', [
                    'fine_id'   => $fine->id,
                    'name'      => $fine->name,
                    'amount'    => $fine->amount,
                    'outlet_id' => $fine->outlet_id,
                    'user_id'   => Auth::id(),
                    'type'      => 'fine_action',
                ]);

                return $fine->fresh(['fineLogs', 'outlet']);
            } catch (Exception $e) {
                Log::error('Failed to create fine master', [
                    'data'    => $data,
                    'error'   => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type'    => 'fine_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function update(int $id, array $data): Fine
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $fine = $this->fine->byId($id)->firstOrFail();

                if (isset($data['outletId']))   $fine->outlet_id   = $data['outletId'];
                if (isset($data['name']))       $fine->name        = $data['name'];
                if (isset($data['amount']))     $fine->amount      = $data['amount'];
                if (isset($data['description'])) $fine->description = $data['description'];

                $fine->save();

                Log::info('Fine master updated successfully', [
                    'fine_id' => $fine->id,
                    'user_id' => Auth::id(),
                    'type'    => 'fine_action',
                ]);

                return $fine->fresh(['fineLogs', 'outlet']);
            } catch (Exception $e) {
                Log::error('Failed to update fine master', [
                    'fine_id' => $id,
                    'data'    => $data,
                    'error'   => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type'    => 'fine_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $fine = $this->fine->byId($id)->firstOrFail();

                if (!$fine->canBeDeleted()) {
                    throw new Exception('Fine master cannot be deleted because it is in use');
                }

                $deleted = $fine->delete();

                if ($deleted) {
                    Log::info('Fine master deleted successfully', [
                        'fine_id' => $id,
                        'user_id' => Auth::id(),
                        'type'    => 'fine_action',
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete fine master', [
                    'fine_id' => $id,
                    'error'   => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type'    => 'fine_service_error',
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

    protected function applyFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['outletId'])) {
            $query->byOutletId((int) $filters['outletId']);
        }

        if (isset($filters['minAmount']) && is_numeric($filters['minAmount'])) {
            $query->minAmount((float) $filters['minAmount']);
        }

        if (isset($filters['maxAmount']) && is_numeric($filters['maxAmount'])) {
            $query->maxAmount((float) $filters['maxAmount']);
        }

        $sortBy        = $filters['sortBy'] ?? 'createdAt';
        $sortDirection = $filters['sortDirection'] ?? 'desc';

        $query->sortBy($sortBy, $sortDirection);
    }
}
