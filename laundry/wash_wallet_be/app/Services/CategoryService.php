<?php

namespace App\Services;

use App\Models\Category;
use App\Models\LaundryService;
use App\Models\LaundryServiceProcess;
use App\Models\Process;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CategoryService extends BaseService
{
    public function __construct(
        protected Category $category,
        protected Process $process,
        protected LaundryService $laundryService,
        protected LaundryServiceProcess $laundryServiceProcess,
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
            $query = $this->category->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get categories', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'category_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(int $id, array $relations = ['outlet']): Category
    {
        try {
            $query = $this->category->byId($id);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get category by ID', [
                'category_id' => $id,
                'error'       => $e->getMessage(),
                'type'        => 'category_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods — Category
    |--------------------------------------------------------------------------
    */

    public function store(array $data): Category
    {
        try {
            $category = $this->category->create([
                'outlet_id'   => $data['outletId'],
                'name'        => $data['name'],
                'description' => $data['description'] ?? null,
                'is_active'   => true,
            ]);

            Log::info('Category created successfully', [
                'category_id' => $category->id,
                'name'        => $category->name,
                'outlet_id'   => $category->outlet_id,
                'type'        => 'category_action',
            ]);

            return $category;
        } catch (Exception $e) {
            Log::error('Failed to create category', [
                'data'  => $data,
                'error' => $e->getMessage(),
                'type'  => 'category_service_error',
            ]);
            throw $e;
        }
    }

    public function update(int $id, array $data): Category
    {
        try {
            $query = $this->category->query();
            $this->applyTenantScope($query);
            $category = $query->findOrFail($id);

            if (isset($data['outletId']))   $category->outlet_id   = $data['outletId'];
            if (isset($data['name']))       $category->name        = $data['name'];
            if (isset($data['description'])) $category->description = $data['description'];
            if (isset($data['isActive']))   $category->is_active   = $data['isActive'];

            $category->save();
            $category->refresh();

            Log::info('Category updated successfully', [
                'category_id' => $id,
                'changes'     => array_keys($data),
                'type'        => 'category_action',
            ]);

            return $category;
        } catch (Exception $e) {
            Log::error('Failed to update category', [
                'category_id' => $id,
                'data'        => $data,
                'error'       => $e->getMessage(),
                'type'        => 'category_service_error',
            ]);
            throw $e;
        }
    }

    public function destroy(int $id): bool
    {
        try {
            $query = $this->category->query();
            $this->applyTenantScope($query);
            $category = $query->findOrFail($id);

            if ($category->laundryServices()->exists()) {
                throw new Exception('Cannot delete category that has associated laundry services');
            }

            $deleted = $category->delete();

            if ($deleted) {
                Log::info('Category deleted successfully', [
                    'category_id' => $id,
                    'name'        => $category->name,
                    'type'        => 'category_action',
                ]);
            }

            return $deleted;
        } catch (Exception $e) {
            Log::error('Failed to delete category', [
                'category_id' => $id,
                'error'       => $e->getMessage(),
                'type'        => 'category_service_error',
            ]);
            throw $e;
        }
    }

    public function forceDelete(int $id): bool
    {
        try {
            $query = $this->category->onlyTrashed();
            $this->applyTenantScope($query);
            $category = $query->findOrFail($id);
            $deleted  = $category->forceDelete();

            if ($deleted) {
                Log::info('Category permanently deleted', [
                    'category_id' => $id,
                    'type'        => 'category_action',
                ]);
            }

            return $deleted;
        } catch (Exception $e) {
            Log::error('Failed to force delete category', [
                'category_id' => $id,
                'error'       => $e->getMessage(),
                'type'        => 'category_service_error',
            ]);
            throw $e;
        }
    }

    public function restore(int $id): Category
    {
        try {
            $query = $this->category->withTrashed();
            $this->applyTenantScope($query);
            $category = $query->findOrFail($id);

            if (!$category->trashed()) {
                throw new Exception('Category is not deleted');
            }

            $category->restore();

            Log::info('Category restored successfully', [
                'category_id' => $id,
                'type'        => 'category_action',
            ]);

            return $category;
        } catch (Exception $e) {
            Log::error('Failed to restore category', [
                'category_id' => $id,
                'error'       => $e->getMessage(),
                'type'        => 'category_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods — Laundry Service
    |--------------------------------------------------------------------------
    */

    public function storeLaundryService(int $categoryId, array $data): LaundryService
    {
        return DB::transaction(function () use ($data, $categoryId) {
            try {
                $query = $this->category->query();
                $this->applyTenantScope($query);
                $category = $query->findOrFail($categoryId);

                $laundryService = $category->laundryServices()->create([
                    'unit_id'        => $data['unitId'],
                    'name'           => $data['name'],
                    'description'    => $data['description'] ?? null,
                    'price'          => $data['price'],
                    'duration_hours' => $data['durationHours'],
                    'min_quantity'   => $data['minQuantity'] ?? 1,
                    'is_active'      => $data['isActive'] ?? true,
                ]);

                Log::info('LaundryService created successfully', [
                    'laundry_service_id' => $laundryService->id,
                    'name'               => $laundryService->name,
                    'category_id'        => $categoryId,
                    'type'               => 'laundry_service_action',
                ]);

                if (!empty($data['laundryServiceProcesses'])) {
                    foreach ($data['laundryServiceProcesses'] as $index => $processData) {
                        $processData['sequence'] = $index + 1;
                        $this->storeLaundryServiceProcess($laundryService->id, $processData);
                    }
                }

                return $laundryService->fresh(['category', 'outlet', 'unit']);
            } catch (Exception $e) {
                Log::error('Failed to create laundry service', [
                    'category_id' => $categoryId,
                    'data'        => $data,
                    'error'       => $e->getMessage(),
                    'type'        => 'laundry_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function updateLaundryService(int $categoryId, int $laundryServiceId, array $data): LaundryService
    {
        return DB::transaction(function () use ($data, $categoryId, $laundryServiceId) {
            try {
                $query = $this->category->query();
                $this->applyTenantScope($query);
                $query->findOrFail($categoryId);

                $laundryService = $this->laundryService->where('category_id', $categoryId)->findOrFail($laundryServiceId);

                if (isset($data['unitId']))       $laundryService->unit_id        = $data['unitId'];
                if (isset($data['name']))         $laundryService->name           = $data['name'];
                if (array_key_exists('description', $data)) $laundryService->description = $data['description'];
                if (isset($data['price']))        $laundryService->price          = $data['price'];
                if (isset($data['durationHours'])) $laundryService->duration_hours = $data['durationHours'];
                if (isset($data['minQuantity']))  $laundryService->min_quantity   = $data['minQuantity'];
                if (isset($data['isActive']))     $laundryService->is_active      = $data['isActive'];

                $laundryService->save();

                if (isset($data['laundryServiceProcesses']) && is_array($data['laundryServiceProcesses'])) {
                    $this->laundryServiceProcess->where('laundry_service_id', $laundryServiceId)->delete();

                    foreach ($data['laundryServiceProcesses'] as $index => $processData) {
                        $this->laundryServiceProcess->create([
                            'laundry_service_id' => $laundryServiceId,
                            'process_id'         => $processData['processId'],
                            'sequence'           => $index + 1,
                        ]);
                    }

                    Log::info('LaundryServiceProcesses updated', [
                        'laundry_service_id' => $laundryServiceId,
                        'processes_count'    => count($data['laundryServiceProcesses']),
                        'type'               => 'laundry_service_process_action',
                    ]);
                }

                Log::info('LaundryService updated successfully', [
                    'laundry_service_id' => $laundryService->id,
                    'changes'            => array_keys($data),
                    'type'               => 'laundry_service_action',
                ]);

                return $laundryService->fresh(['category', 'outlet', 'unit', 'laundryServiceProcesses.process']);
            } catch (Exception $e) {
                Log::error('Failed to update laundry service', [
                    'category_id'        => $categoryId,
                    'laundry_service_id' => $laundryServiceId,
                    'data'               => $data,
                    'error'              => $e->getMessage(),
                    'type'               => 'laundry_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroyLaundryService(int $categoryId, int $laundryServiceId): bool
    {
        return DB::transaction(function () use ($categoryId, $laundryServiceId) {
            try {
                $query = $this->category->query();
                $this->applyTenantScope($query);
                $query->findOrFail($categoryId);

                $laundryService = $this->laundryService->where('category_id', $categoryId)->findOrFail($laundryServiceId);
                $deleted        = $laundryService->delete();

                if ($deleted) {
                    Log::info('LaundryService deleted successfully', [
                        'laundry_service_id' => $laundryServiceId,
                        'category_id'        => $categoryId,
                        'type'               => 'laundry_service_action',
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete laundry service', [
                    'category_id'        => $categoryId,
                    'laundry_service_id' => $laundryServiceId,
                    'error'              => $e->getMessage(),
                    'type'               => 'laundry_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function storeLaundryServiceProcess(int $laundryServiceId, array $data): LaundryServiceProcess
    {
        try {
            $laundryService = $this->laundryService
                ->whereHas('category', function ($q) {
                    $this->applyTenantScope($q);
                })
                ->where('id', $laundryServiceId)
                ->firstOrFail();

            $process = $this->process->byId($data['processId'])->firstOrFail();

            if (!$process->is_active) {
                throw new Exception('Cannot add inactive process to laundry service');
            }

            $existingProcess = $this->laundryServiceProcess
                ->byLaundryServiceId($laundryServiceId)
                ->byProcessId($data['processId'])
                ->first();

            if ($existingProcess) {
                throw new Exception('Process already exists for this laundry service');
            }

            $laundryServiceProcess = $laundryService->laundryServiceProcesses()->create([
                'process_id' => $data['processId'],
                'sequence'   => $data['sequence'],
            ]);

            Log::info('Laundry service process created successfully', [
                'laundry_service_process_id' => $laundryServiceProcess->id,
                'laundry_service_id'         => $laundryServiceId,
                'process_id'                 => $data['processId'],
                'sequence'                   => $data['sequence'],
                'created_by'                 => Auth::id(),
                'type'                       => 'laundry_service_process_action',
            ]);

            return $laundryServiceProcess->load('process');
        } catch (Exception $e) {
            Log::error('Failed to create laundry service process', [
                'laundry_service_id' => $laundryServiceId,
                'data'               => $data,
                'error'              => $e->getMessage(),
                'type'               => 'laundry_service_process_error',
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

        if (!empty($filters['outletId'])) {
            $query->byOutletId($filters['outletId']);
        }

        if (isset($filters['isActive'])) {
            $filters['isActive'] ? $query->active() : $query->inactive();
        }

        if (!empty($filters['slug'])) {
            $query->bySlug($filters['slug']);
        }

        $sortBy        = $filters['sortBy'] ?? 'created_at';
        $sortDirection = $filters['sortDirection'] ?? 'desc';

        $allowedSortColumns = ['name', 'slug', 'description', 'is_active', 'created_at', 'updated_at'];

        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->latest();
        }
    }
}
