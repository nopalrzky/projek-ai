<?php

namespace App\Services;

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

class LaundryServiceProcessService extends BaseService
{
    public function __construct(
        protected LaundryServiceProcess $laundryServiceProcess,
        protected LaundryService $laundryService,
        protected Process $process
    ) {}

    /**
     * Get all laundry service processes with filters and pagination
     */
    public function getAll(
        array $filters = [],
        ?int $page = null,
        ?int $perPage = null,
        array $relations = ['laundryService', 'process']
    ): LengthAwarePaginator|Collection {
        try {
            $query = $this->laundryServiceProcess->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (! empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get laundry service processes', [
                'filters' => $filters,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'laundry_service_process_service_error',
            ]);
            throw $e;
        }
    }

    /**
     * Get laundry service process by ID
     */
    public function getById(
        int $id,
        array $relations = ['laundryService', 'process']
    ): LaundryServiceProcess {
        try {
            $query = $this->laundryServiceProcess->byId($id);

            if (! empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get laundry service process by ID', [
                'laundry_service_process_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'laundry_service_process_service_error',
            ]);
            throw $e;
        }
    }

    /**
     * Store new laundry service process
     */
    public function store(array $data): LaundryServiceProcess
    {
        return DB::transaction(function () use ($data) {
            try {
                $laundryService = $this->laundryService
                    ->byId($data['laundryServiceId'])
                    ->firstOrFail();

                $this->applyTenantScope($laundryService->newQuery());

                $process = $this->process->byId($data['processId'])->firstOrFail();

                if (! $process->is_active) {
                    throw new Exception('Cannot add inactive process to laundry service');
                }

                $existingProcess = $this->laundryServiceProcess
                    ->byLaundryServiceId($data['laundryServiceId'])
                    ->byProcessId($data['processId'])
                    ->first();

                if ($existingProcess) {
                    throw new Exception('Process already exists for this laundry service');
                }

                if (! isset($data['sequence'])) {
                    $maxSequence = $this->laundryServiceProcess
                        ->where('laundry_service_id', $data['laundryServiceId'])
                        ->max('sequence');
                    $data['sequence'] = ($maxSequence ?? 0) + 1;
                }

                $laundryServiceProcess = $this->laundryServiceProcess->create([
                    'laundry_service_id' => $data['laundryServiceId'],
                    'process_id' => $data['processId'],
                    'sequence' => $data['sequence'],
                ]);

                Log::info('Laundry service process created successfully', [
                    'laundry_service_process_id' => $laundryServiceProcess->id,
                    'laundry_service_id' => $data['laundryServiceId'],
                    'process_id' => $data['processId'],
                    'sequence' => $data['sequence'],
                    'created_by' => Auth::id(),
                    'type' => 'laundry_service_process_action',
                ]);

                return $laundryServiceProcess->load(['laundryService', 'process']);
            } catch (Exception $e) {
                Log::error('Failed to create laundry service process', [
                    'data' => $data,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'laundry_service_process_service_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Update laundry service process
     */
    public function update(int $id, array $data): LaundryServiceProcess
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $laundryServiceProcess = $this->laundryServiceProcess
                    ->byId($id)
                    ->with(['laundryService', 'process'])
                    ->firstOrFail();

                $this->applyTenantScope($laundryServiceProcess->laundryService()->getQuery());

                if (isset($data['processId']) && $data['processId'] !== $laundryServiceProcess->process_id) {
                    $process = $this->process->byId($data['processId'])->firstOrFail();

                    if (! $process->is_active) {
                        throw new Exception('Cannot change to inactive process');
                    }

                    $existingProcess = $this->laundryServiceProcess
                        ->byLaundryServiceId($laundryServiceProcess->laundry_service_id)
                        ->byProcessId($data['processId'])
                        ->where('id', '!=', $id)
                        ->first();

                    if ($existingProcess) {
                        throw new Exception('Process already exists for this laundry service');
                    }

                    $laundryServiceProcess->process_id = $data['processId'];
                }

                if (isset($data['sequence'])) {
                    $laundryServiceProcess->sequence = $data['sequence'];
                }

                $laundryServiceProcess->save();

                Log::info('Laundry service process updated successfully', [
                    'laundry_service_process_id' => $id,
                    'laundry_service_id' => $laundryServiceProcess->laundry_service_id,
                    'changes' => array_keys($data),
                    'updated_by' => Auth::id(),
                    'type' => 'laundry_service_process_action',
                ]);

                return $laundryServiceProcess->fresh(['laundryService', 'process']);
            } catch (Exception $e) {
                Log::error('Failed to update laundry service process', [
                    'laundry_service_process_id' => $id,
                    'data' => $data,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'laundry_service_process_service_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Delete laundry service process
     */
    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $laundryServiceProcess = $this->laundryServiceProcess
                    ->byId($id)
                    ->with(['laundryService', 'process'])
                    ->firstOrFail();

                $this->applyTenantScope($laundryServiceProcess->laundryService()->getQuery());

                $processName = $laundryServiceProcess->process->name ?? 'Unknown';
                $laundryServiceId = $laundryServiceProcess->laundry_service_id;
                $sequence = $laundryServiceProcess->sequence;

                $deleted = $laundryServiceProcess->delete();

                if ($deleted) {
                    $this->laundryServiceProcess
                        ->byLaundryServiceId($laundryServiceId)
                        ->where('sequence', '>', $sequence)
                        ->decrement('sequence');

                    Log::info('Laundry service process deleted successfully', [
                        'laundry_service_process_id' => $id,
                        'laundry_service_id' => $laundryServiceId,
                        'process_name' => $processName,
                        'deleted_by' => Auth::id(),
                        'type' => 'laundry_service_process_action',
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete laundry service process', [
                    'laundry_service_process_id' => $id,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'laundry_service_process_service_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Apply filters to query
     */
    private function applyFilters(Builder &$query, array $filters = []): void
    {
        if (! empty($filters['laundryServiceId'])) {
            $query->byLaundryServiceId($filters['laundryServiceId']);
        }

        if (! empty($filters['processId'])) {
            $query->byProcessId($filters['processId']);
        }

        if (! empty($filters['sequence'])) {
            $query->bySequence($filters['sequence']);
        }

        if (! empty($filters['startDate']) && ! empty($filters['endDate'])) {
            $query->whereBetween('created_at', [$filters['startDate'], $filters['endDate']]);
        } elseif (! empty($filters['startDate'])) {
            $query->whereDate('created_at', '>=', $filters['startDate']);
        } elseif (! empty($filters['endDate'])) {
            $query->whereDate('created_at', '<=', $filters['endDate']);
        }

        $sortBy = $filters['sortBy'] ?? 'sequence';
        $sortDirection = $filters['sortDirection'] ?? 'asc';

        $query->sortBy($sortBy, $sortDirection);
    }
}
