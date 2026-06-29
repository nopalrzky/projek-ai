<?php

namespace App\Services;

use App\Models\Category;
use App\Models\LaundryService;
use App\Models\LaundryServiceProcess;
use App\Models\Process;
use App\Models\Unit;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LaundryServiceService extends BaseService
{
    public function __construct(
        protected Category $category,
        protected LaundryService $laundryService,
        protected LaundryServiceProcess $laundryServiceProcess,
        protected Process $process,
        protected Unit $unit,
    ) {}

    /**
     * Get all laundry services with filters and pagination
     */
    public function getAll(
        array $filters = [],
        ?int $page = null,
        ?int $perPage = null,
        array $relations = ['category', 'unit']
    ): LengthAwarePaginator|Collection {
        try {
            $query = $this->laundryService->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (! empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get laundry services', [
                'filters' => $filters,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'laundry_service_service_error',
            ]);
            throw $e;
        }
    }

    /**
     * Get laundry service by ID
     */
    public function getById(int $id, array $relations = ['category', 'unit']): LaundryService
    {
        try {
            $query = $this->laundryService->byId($id);

            if (! empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get laundry service by ID', [
                'laundry_service_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'laundry_service_service_error',
            ]);
            throw $e;
        }
    }

    /**
     * Create new laundry service
     */
    public function store(array $data): LaundryService
    {
        return DB::transaction(function () use ($data) {
            try {

                $laundryService = $this->laundryService->create([
                    'unit_id' => $data['unitId'],
                    'category_id' => $data['categoryId'],
                    'name' => $data['name'],
                    'description' => $data['description'] ?? null,
                    'price' => $data['price'],
                    'duration_hours' => $data['durationHours'],
                    'min_quantity' => $data['minQuantity'] ?? 1,
                    'is_active' => $data['isActive'] ?? true,
                    'supports_courier' => $data['supportsCourier'] ?? false,
                ]);

                Log::info('Laundry service created successfully', [
                    'laundry_service_id' => $laundryService->id,
                    'name' => $laundryService->name,
                    'category_id' => $laundryService->category_id,
                    'unit_id' => $laundryService->unit_id,
                    'type' => 'laundry_service_action',
                ]);

                if (! empty($data['laundryServiceProcesses'])) {
                    foreach ($data['laundryServiceProcesses'] as $index => $processData) {
                        $processData['sequence'] = $index + 1;
                        $this->storeLaundryServiceProcess($laundryService->id, $processData);
                    }
                }

                return $laundryService;
            } catch (Exception $e) {
                Log::error('Failed to create laundry service', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => Auth::id(),
                    'type' => 'laundry_service_service_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Update existing laundry service
     */
    public function update(int $id, array $data): LaundryService
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $laundryService = $this->laundryService->byId($id)->firstOrFail();

                if (isset($data['unitId'])) {
                    $laundryService->unit_id = $data['unitId'];
                }

                if (isset($data['categoryId'])) {
                    $laundryService->category_id = $data['categoryId'];
                }

                if (isset($data['name'])) {
                    $laundryService->name = $data['name'];
                }

                if (isset($data['description'])) {
                    $laundryService->description = $data['description'];
                }

                if (isset($data['price'])) {
                    $laundryService->price = $data['price'];
                }

                if (isset($data['durationHours'])) {
                    $laundryService->duration_hours = $data['durationHours'];
                }

                if (isset($data['minQuantity'])) {
                    $laundryService->min_quantity = $data['minQuantity'];
                }

                if (isset($data['isActive'])) {
                    $laundryService->is_active = $data['isActive'];
                }

                if (isset($data['supportsCourier'])) {
                    $laundryService->supports_courier = $data['supportsCourier'];
                }

                $laundryService->save();

                if (isset($data['laundryServiceProcesses'])) {
                    LaundryServiceProcess::where('laundry_service_id', $id)->delete();

                    if (! empty($data['laundryServiceProcesses'])) {
                        foreach ($data['laundryServiceProcesses'] as $index => $processData) {
                            $processData['sequence'] = $index + 1;
                            $this->storeLaundryServiceProcess($id, $processData);
                        }
                    }
                }

                Log::info('Laundry service updated successfully', [
                    'laundry_service_id' => $id,
                    'type' => 'laundry_service_action',
                ]);

                return $laundryService->fresh(['category', 'unit', 'laundryServiceProcesses.process']);
            } catch (Exception $e) {
                Log::error('Failed to update laundry service', [
                    'laundry_service_id' => $id,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'laundry_service_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function updateCourierEligibility(int $laundryServiceId, bool $supportsCourier): LaundryService
    {
        $laundryService = $this->laundryService->byId($laundryServiceId)->firstOrFail();

        $laundryService->update(['supports_courier' => $supportsCourier]);

        return $laundryService->fresh();
    }

    public function bulkUpdateCourierEligibility(array $services): void
    {
        DB::transaction(function () use ($services) {
            foreach ($services as $item) {
                $this->laundryService
                    ->where('id', $item['id'])
                    ->update(['supports_courier' => $item['supportsCourier']]);
            }
        });
    }

    /**
     * Soft delete laundry service
     */
    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $laundryService = $this->laundryService->byId($id)->firstOrFail();
                if (! $laundryService->canBeDeleted()) {
                    throw new Exception('Cannot delete laundry service that has laundry services or orders');
                }
                $deleted = $laundryService->delete();

                if ($deleted) {
                    Log::info('Laundry service soft deleted successfully', [
                        'laundry_service_id' => $id,
                        'name' => $laundryService->name,
                        'category_id' => $laundryService->category_id,
                        'deleted_by' => Auth::id(),
                        'type' => 'laundry_service_action',
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete laundry service', [
                    'laundry_service_id' => $id,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'laundry_service_service_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Restore soft deleted laundry service
     */
    public function restore(int $id): LaundryService
    {
        return DB::transaction(function () use ($id) {
            try {
                $laundryService = $this->laundryService->withTrashed()->findOrFail($id);

                $this->applyTenantScope($laundryService->newQuery());

                if (! $laundryService->trashed()) {
                    throw new Exception('Laundry service is not deleted');
                }

                $laundryService->restore();

                Log::info('Laundry service restored successfully', [
                    'laundry_service_id' => $id,
                    'name' => $laundryService->name,
                    'restored_by' => Auth::id(),
                    'type' => 'laundry_service_action',
                ]);

                return $laundryService->fresh(['category', 'unit']);
            } catch (Exception $e) {
                Log::error('Failed to restore laundry service', [
                    'laundry_service_id' => $id,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'laundry_service_service_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Permanently delete laundry service
     */
    public function forceDestroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $laundryService = $this->laundryService->withTrashed()->findOrFail($id);

                if (! $laundryService->canBeDeleted()) {
                    throw new Exception('Cannot permanently delete laundry service that has laundry services or orders');
                }

                $serviceName = $laundryService->name;
                $categoryId = $laundryService->category_id;
                $deleted = $laundryService->forceDelete();

                if ($deleted) {
                    Log::info('Laundry service permanently deleted', [
                        'laundry_service_id' => $id,
                        'name' => $serviceName,
                        'category_id' => $categoryId,
                        'deleted_by' => Auth::id(),
                        'type' => 'laundry_service_action',
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to force delete laundry service', [
                    'laundry_service_id' => $id,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'laundry_service_service_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Store laundry service process
     */
    public function storeLaundryServiceProcess(int $laundryServiceId, array $data): LaundryServiceProcess
    {
        return DB::transaction(function () use ($laundryServiceId, $data) {
            try {
                $laundryService = $this->laundryService->byId($laundryServiceId)->firstOrFail();

                $process = $this->process->byId($data['processId'])->firstOrFail();

                if (! $process->is_active) {
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
                    'sequence' => $data['sequence'],
                ]);

                Log::info('Laundry service process created successfully', [
                    'laundry_service_process_id' => $laundryServiceProcess->id,
                    'laundry_service_id' => $laundryServiceId,
                    'process_id' => $data['processId'],
                    'sequence' => $data['sequence'],
                    'created_by' => Auth::id(),
                    'type' => 'laundry_service_process_action',
                ]);

                return $laundryServiceProcess->load('process');
            } catch (Exception $e) {
                Log::error('Failed to create laundry service process', [
                    'laundry_service_id' => $laundryServiceId,
                    'data' => $data,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'laundry_service_process_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Update laundry service process
     */
    public function updateLaundryServiceProcess(
        int $laundryServiceId,
        int $laundryServiceProcessId,
        array $data
    ): LaundryServiceProcess {
        return DB::transaction(function () use ($laundryServiceId, $laundryServiceProcessId, $data) {
            try {
                $laundryService = $this->laundryService->byId($laundryServiceId)->firstOrFail();

                $laundryServiceProcess = $this->laundryServiceProcess
                    ->byId($laundryServiceProcessId)
                    ->byLaundryServiceId($laundryServiceId)
                    ->firstOrFail();

                if (isset($data['processId']) && $data['processId'] !== $laundryServiceProcess->process_id) {
                    $process = $this->process->byId($data['processId'])->firstOrFail();

                    if (! $process->is_active) {
                        throw new Exception('Cannot change to inactive process');
                    }

                    // Check if new process already exists for this laundry service
                    $existingProcess = $this->laundryServiceProcess
                        ->byLaundryServiceId($laundryServiceId)
                        ->byProcessId($data['processId'])
                        ->where('id', '!=', $laundryServiceProcessId)
                        ->first();

                    if ($existingProcess) {
                        throw new Exception('Process already exists for this laundry service');
                    }

                    $laundryServiceProcess->process_id = $data['processId'];
                }

                // Update sequence if provided
                if (isset($data['sequence'])) {
                    $laundryServiceProcess->sequence = $data['sequence'];
                }

                $laundryServiceProcess->save();

                Log::info('Laundry service process updated successfully', [
                    'laundry_service_process_id' => $laundryServiceProcessId,
                    'laundry_service_id' => $laundryServiceId,
                    'changes' => array_keys($data),
                    'updated_by' => Auth::id(),
                    'type' => 'laundry_service_process_action',
                ]);

                return $laundryServiceProcess->fresh('process');
            } catch (Exception $e) {
                Log::error('Failed to update laundry service process', [
                    'laundry_service_process_id' => $laundryServiceProcessId,
                    'laundry_service_id' => $laundryServiceId,
                    'data' => $data,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'laundry_service_process_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Destroy laundry service process
     */
    public function destroyLaundryServiceProcess(
        int $laundryServiceId,
        int $laundryServiceProcessId
    ): bool {
        return DB::transaction(function () use ($laundryServiceId, $laundryServiceProcessId) {
            try {

                $laundryServiceProcess = $this->laundryServiceProcess
                    ->byId($laundryServiceProcessId)
                    ->byLaundryServiceId($laundryServiceId)
                    ->firstOrFail();

                $processName = $laundryServiceProcess->process->name ?? 'Unknown';
                $sequence = $laundryServiceProcess->sequence;

                $deleted = $laundryServiceProcess->delete();

                if ($deleted) {
                    $this->laundryServiceProcess
                        ->byLaundryServiceId($laundryServiceId)
                        ->where('sequence', '>', $sequence)
                        ->decrement('sequence');

                    Log::info('Laundry service process deleted successfully', [
                        'laundry_service_process_id' => $laundryServiceProcessId,
                        'laundry_service_id' => $laundryServiceId,
                        'process_name' => $processName,
                        'deleted_by' => Auth::id(),
                        'type' => 'laundry_service_process_action',
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete laundry service process', [
                    'laundry_service_process_id' => $laundryServiceProcessId,
                    'laundry_service_id' => $laundryServiceId,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'laundry_service_process_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Apply filters to the query using Spatie Query Builder
     */
    private function applyFilters(Builder &$query, array $filters = []): void
    {
        if (! empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (isset($filters['isActive']) && $filters['isActive'] !== null) {
            if ($filters['isActive']) {
                $query->active();
            } else {
                $query->inactive();
            }
        }

        if (! empty($filters['outletId'])) {
            $query->byOutletId($filters['outletId']);
        }

        if (! empty($filters['categoryId'])) {
            $query->byCategoryId($filters['categoryId']);
        }

        if (! empty($filters['unitId'])) {
            $query->byUnitId($filters['unitId']);
        }

        if (isset($filters['minPrice'])) {
            $query->minPrice($filters['minPrice']);
        }

        if (isset($filters['maxPrice'])) {
            $query->maxPrice($filters['maxPrice']);
        }

        if (isset($filters['minQuantity'])) {
            $query->minQuantity($filters['minQuantity']);
        }

        if (isset($filters['minDurationHours'])) {
            $query->minDurationHours($filters['minDurationHours']);
        }

        if (isset($filters['maxDurationHours'])) {
            $query->maxDurationHours($filters['maxDurationHours']);
        }

        $sortBy = $filters['sortBy'] ?? 'createdAt';
        $sortDirection = $filters['sortDirection'] ?? 'desc';
        $query->sortBy($sortBy, $sortDirection);
    }
}
