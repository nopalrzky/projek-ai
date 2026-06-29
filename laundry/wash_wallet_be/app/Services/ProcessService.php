<?php

namespace App\Services;

use App\Models\Process;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessService extends BaseService
{
    public function __construct(
        protected Process $process,
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
            $query = $this->process->query();

            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get processes', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'process_service_error',
            ]);
            throw $e;
        }
    }


    public function getById(int $id, array $relations = []): Process
    {
        try {
            $query = $this->process->byId($id);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get process by ID', [
                'process_id' => $id,
                'error'      => $e->getMessage(),
                'type'       => 'process_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function store(array $data): Process
    {
        try {
            $process = $this->process->create([
                'name'        => $data['name'],
                'description' => $data['description'] ?? null,
                'is_active'   => $data['isActive'] ?? $data['is_active'] ?? true,
            ]);

            Log::info('Process created successfully', [
                'process_id' => $process->id,
                'name'       => $process->name,
                'type'       => 'process_action',
            ]);

            return $process;
        } catch (Exception $e) {
            Log::error('Failed to create process', [
                'data'  => $data,
                'error' => $e->getMessage(),
                'type'  => 'process_service_error',
            ]);
            throw $e;
        }
    }

    public function update(int $id, array $data): Process
    {
        try {
            $process = $this->process->findOrFail($id);

            if (isset($data['name']))                             $process->name      = $data['name'];
            if (isset($data['description']))                      $process->description = $data['description'];
            if (isset($data['isActive']) || isset($data['is_active'])) {
                $process->is_active = $data['isActive'] ?? $data['is_active'];
            }

            $process->save();

            Log::info('Process updated successfully', [
                'process_id' => $id,
                'changes'    => array_keys($data),
                'type'       => 'process_action',
            ]);

            return $process->fresh();
        } catch (Exception $e) {
            Log::error('Failed to update process', [
                'process_id' => $id,
                'data'       => $data,
                'error'      => $e->getMessage(),
                'type'       => 'process_service_error',
            ]);
            throw $e;
        }
    }

    public function destroy(int $id): bool
    {
        try {
            $process = $this->process->findOrFail($id);

            if (!$process->canBeDeleted()) {
                throw new Exception('Cannot delete process that has associated laundry services or employees');
            }

            $deleted = $process->delete();

            if ($deleted) {
                Log::info('Process deleted successfully', [
                    'process_id' => $id,
                    'name'       => $process->name,
                    'type'       => 'process_action',
                ]);
            }

            return $deleted;
        } catch (Exception $e) {
            Log::error('Failed to delete process', [
                'process_id' => $id,
                'error'      => $e->getMessage(),
                'type'       => 'process_service_error',
            ]);
            throw $e;
        }
    }

    public function forceDelete(int $id): bool
    {
        try {
            $process = $this->process->onlyTrashed()->findOrFail($id);
            $deleted = $process->forceDelete();

            if ($deleted) {
                Log::info('Process permanently deleted', [
                    'process_id' => $id,
                    'type'       => 'process_action',
                ]);
            }

            return $deleted;
        } catch (Exception $e) {
            Log::error('Failed to force delete process', [
                'process_id' => $id,
                'error'      => $e->getMessage(),
                'type'       => 'process_service_error',
            ]);
            throw $e;
        }
    }

    public function restore(int $id): Process
    {
        try {
            $process = $this->process->withTrashed()->findOrFail($id);

            if (!$process->trashed()) {
                throw new Exception('Process is not deleted');
            }

            $process->restore();

            Log::info('Process restored successfully', [
                'process_id' => $id,
                'type'       => 'process_action',
            ]);

            return $process;
        } catch (Exception $e) {
            Log::error('Failed to restore process', [
                'process_id' => $id,
                'error'      => $e->getMessage(),
                'type'       => 'process_service_error',
            ]);
            throw $e;
        }
    }

    public function assignToLaundryService(int $processId, int $laundryServiceId, int $sequence = 1): bool
    {
        return DB::transaction(function () use ($processId, $laundryServiceId, $sequence) {
            try {
                $process = $this->process->findOrFail($processId);

                $process->laundryServices()->attach($laundryServiceId, [
                    'sequence'   => $sequence,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                Log::info('Process assigned to laundry service', [
                    'process_id'         => $processId,
                    'laundry_service_id' => $laundryServiceId,
                    'sequence'           => $sequence,
                    'type'               => 'process_action',
                ]);

                return true;
            } catch (Exception $e) {
                Log::error('Failed to assign process to laundry service', [
                    'process_id'         => $processId,
                    'laundry_service_id' => $laundryServiceId,
                    'error'              => $e->getMessage(),
                    'type'               => 'process_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function detachFromLaundryService(int $processId, int $laundryServiceId): bool
    {
        return DB::transaction(function () use ($processId, $laundryServiceId) {
            try {
                $process = $this->process->findOrFail($processId);
                $process->laundryServices()->detach($laundryServiceId);

                Log::info('Process detached from laundry service', [
                    'process_id'         => $processId,
                    'laundry_service_id' => $laundryServiceId,
                    'type'               => 'process_action',
                ]);

                return true;
            } catch (Exception $e) {
                Log::error('Failed to detach process from laundry service', [
                    'process_id'         => $processId,
                    'laundry_service_id' => $laundryServiceId,
                    'error'              => $e->getMessage(),
                    'type'               => 'process_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function assignToEmployee(int $processId, int $employeeId, array $commissionData): bool
    {
        return DB::transaction(function () use ($processId, $employeeId, $commissionData) {
            try {
                $process = $this->process->findOrFail($processId);

                $process->employees()->attach($employeeId, [
                    'commission_type'  => $commissionData['commissionType'] ?? 'per_item',
                    'commission_value' => $commissionData['commissionValue'] ?? 0,
                    'has_target'       => $commissionData['hasTarget'] ?? false,
                    'target_threshold' => $commissionData['targetThreshold'] ?? null,
                    'bonus_amount'     => $commissionData['bonusAmount'] ?? null,
                    'rules'            => $commissionData['rules'] ?? null,
                    'effective_date'   => $commissionData['effectiveDate'] ?? null,
                    'is_active'        => $commissionData['isActive'] ?? true,
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ]);

                Log::info('Process assigned to employee with commission', [
                    'process_id'  => $processId,
                    'employee_id' => $employeeId,
                    'type'        => 'process_action',
                ]);

                return true;
            } catch (Exception $e) {
                Log::error('Failed to assign process to employee', [
                    'process_id'  => $processId,
                    'employee_id' => $employeeId,
                    'error'       => $e->getMessage(),
                    'type'        => 'process_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function detachFromEmployee(int $processId, int $employeeId): bool
    {
        return DB::transaction(function () use ($processId, $employeeId) {
            try {
                $process = $this->process->findOrFail($processId);
                $process->employees()->detach($employeeId);

                Log::info('Process detached from employee', [
                    'process_id'  => $processId,
                    'employee_id' => $employeeId,
                    'type'        => 'process_action',
                ]);

                return true;
            } catch (Exception $e) {
                Log::error('Failed to detach process from employee', [
                    'process_id'  => $processId,
                    'employee_id' => $employeeId,
                    'error'       => $e->getMessage(),
                    'type'        => 'process_service_error',
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

    protected function applyFilters(Builder $query, array $filters = []): void
    {
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (isset($filters['isActive'])) {
            $filters['isActive'] ? $query->active() : $query->inactive();
        }

        if (!empty($filters['startDate']) && !empty($filters['endDate'])) {
            $query->whereBetween('created_at', [$filters['startDate'], $filters['endDate']]);
        } elseif (!empty($filters['startDate'])) {
            $query->whereDate('created_at', '>=', $filters['startDate']);
        } elseif (!empty($filters['endDate'])) {
            $query->whereDate('created_at', '<=', $filters['endDate']);
        }

        $sortBy        = $filters['sortBy'] ?? 'created_at';
        $sortDirection = $filters['sortDirection'] ?? 'desc';

        $query->sortBy($sortBy, $sortDirection);
    }
}
