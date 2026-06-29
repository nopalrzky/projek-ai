<?php

namespace App\Services;

use App\Models\Salary;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SalaryService extends BaseService
{
    public function __construct(
        protected Salary $salary,
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
            $query = $this->salary->query();

            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get salaries', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'salary_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(int $id, array $relations = []): Salary
    {
        try {
            $query = $this->salary->byId($id);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get salary by ID', [
                'salary_id' => $id,
                'error'     => $e->getMessage(),
                'user_id'   => Auth::id(),
                'type'      => 'salary_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function store(array $data): Salary
    {
        try {
            $salary = $this->salary->create([
                'name'        => $data['name'],
                'description' => $data['description'] ?? null,
                'type'        => $data['type'] ?? 'monthly',
            ]);

            Log::info('Salary created successfully', [
                'salary_id' => $salary->id,
                'name'      => $salary->name,
                'type'      => $salary->type,
                'type_key'  => 'salary_action',
            ]);

            return $salary;
        } catch (Exception $e) {
            Log::error('Failed to create salary', [
                'data'  => $data,
                'error' => $e->getMessage(),
                'type'  => 'salary_service_error',
            ]);
            throw $e;
        }
    }

    public function update(int $id, array $data): Salary
    {
        try {
            $salary = $this->salary->byId($id)->firstOrFail();

            if (isset($data['name']))        $salary->name        = $data['name'];
            if (isset($data['description'])) $salary->description = $data['description'];
            if (isset($data['type']))        $salary->type        = $data['type'];

            $salary->save();

            Log::info('Salary updated successfully', [
                'salary_id'      => $salary->id,
                'updated_fields' => array_keys($data),
                'type'           => 'salary_action',
            ]);

            return $salary->fresh();
        } catch (Exception $e) {
            Log::error('Failed to update salary', [
                'salary_id' => $id,
                'data'      => $data,
                'error'     => $e->getMessage(),
                'type'      => 'salary_service_error',
            ]);
            throw $e;
        }
    }

    public function destroy(int $id): bool
    {
        try {
            $salary  = $this->salary->byId($id)->firstOrFail();
            $deleted = $salary->delete();

            if ($deleted) {
                Log::info('Salary deleted successfully', [
                    'salary_id' => $id,
                    'name'      => $salary->name,
                    'type'      => 'salary_action',
                ]);
            }

            return $deleted;
        } catch (Exception $e) {
            Log::error('Failed to delete salary', [
                'salary_id' => $id,
                'error'     => $e->getMessage(),
                'type'      => 'salary_service_error',
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

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        $sortBy    = $filters['sortBy'] ?? 'created_at';
        $direction = $filters['sortDirection'] ?? 'desc';

        $query->sortBy($sortBy, $direction);
    }
}
