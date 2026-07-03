<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Employee;
use App\Models\EmployeePosition;
use App\Models\EmployeeProcess;
use App\Models\EmployeeProcessCommission;
use App\Models\EmployeeSalary;
use App\Models\LaundryService;
use App\Models\Loan;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\Position;
use App\Models\User;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class EmployeeService extends BaseService
{
    public function __construct(
        protected Employee $employee,
        protected EmployeePosition $employeePosition,
        protected EmployeeProcess $employeeProcess,
        protected EmployeeProcessCommission $employeeProcessCommission,
        protected EmployeeSalary $employeeSalary,
        protected Loan $loan,
        protected Outlet $outlet,
        protected Position $position,
        protected Order $order,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Read Methods
    |--------------------------------------------------------------------------
    */

    public function getAll(
        array $filters = [],
        ?int $page = 1,
        ?int $perPage = 15,
        array $relations = []
    ): LengthAwarePaginator|Collection {
        try {
            $query = $this->employee->withTrashed();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get employees', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_service_error',
            ]);
            throw $e;
        }
    }

    public function getStats(): array
    {
        try {
            $query = $this->employee->query();

            $this->applyTenantScope($query);

            $totalEmployees    = $query->count();
            $activeEmployees   = (clone $query)->active()->count();
            $inactiveEmployees = (clone $query)->inactive()->count();

            return [
                [
                    'label'   => 'Total Employees',
                    'value'   => $totalEmployees,
                    'icon'    => 'Users',
                    'variant' => 'primary',
                ],
                [
                    'label'   => 'Active Employees',
                    'value'   => $activeEmployees,
                    'icon'    => 'UserCheck',
                    'variant' => 'success',
                ],
                [
                    'label'   => 'Inactive Employees',
                    'value'   => $inactiveEmployees,
                    'icon'    => 'UserX',
                    'variant' => 'danger',
                ],
            ];
        } catch (Exception $e) {
            Log::error('Failed to get employee stats', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(int $id, array $relations = []): Employee
    {
        try {
            $query = $this->employee->byId($id);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get employee by ID', [
                'employee_id' => $id,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'employee_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Employee CRUD
    |--------------------------------------------------------------------------
    */

    public function store(array $data): Employee
    {
        return DB::transaction(function () use ($data) {
            try {
                /** @var User $user */
                $user = Auth::user();

                if (!empty($data['positionIds'])) {
                    $this->validatePositionsForEmployee(null, $data['positionIds'], (int) $data['outletId']);
                }

                $avatarPath = !empty($data['avatar'])
                    ? $this->handleAvatarUpload($data['avatar'])
                    : null;

                $employee = $this->employee->create([
                    'outlet_id'     => $data['outletId'],
                    'name'          => $data['name'],
                    'username'      => $data['username'],
                    'password'      => Hash::make($data['password']),
                    'avatar'        => $avatarPath,
                    'phone'         => $data['phone'] ?? null,
                    'gender'        => $data['gender'] ?? null,
                    'address'       => $data['address'] ?? null,
                    'date_of_birth' => $data['dateOfBirth'] ?? null,
                    'start_date'    => $data['startDate'] ?? now()->format('Y-m-d'),
                    'is_active'     => true,
                    'cutoff_days'   => $data['cutoffDays'] ?? 30,
                ]);

                if (!empty($data['positionIds'])) {
                    $this->assignPositions($employee, $data['positionIds']);
                }

                if (!empty($data['employeeSalaries'])) {
                    $this->assignSalaries($employee, $data['employeeSalaries']);
                }

                $employeeProcesses = $data['employeeProcesses'] ?? [];

                if (empty($employeeProcesses) && !empty($data['employeeProcessCommissions'])) {
                    $employeeProcesses = collect($data['employeeProcessCommissions'])
                        ->pluck('processId')
                        ->filter()
                        ->unique()
                        ->values()
                        ->map(fn($processId) => ['processId' => $processId, 'isActive' => true])
                        ->all();
                }

                if (!empty($employeeProcesses)) {
                    $this->assignProcesses($employee, $employeeProcesses);
                }

                if (!empty($data['employeeProcessCommissions'])) {
                    $this->assignProcessCommissions($employee, $data['employeeProcessCommissions']);
                }

                Log::info('Employee created successfully', [
                    'employee_id'                   => $employee->id,
                    'employee_name'                 => $employee->name,
                    'outlet_id'                     => $employee->outlet_id,
                    'positions_assigned'            => count($data['positionIds'] ?? []),
                    'salaries_assigned'             => count($data['employeeSalaries'] ?? []),
                    'processes_assigned'            => count($employeeProcesses),
                    'process_commissions_assigned'  => count($data['employeeProcessCommissions'] ?? []),
                    'created_by'                    => $user?->id,
                    'type'                          => 'employee_management',
                ]);

                return $employee->load([
                    'outlet',
                    'positions',
                    'employeeSalaries',
                    'employeeProcesses',
                    'employeeProcesses.process',
                    'employeeProcesses.commission',
                ]);
            } catch (Exception $e) {
                Log::error('Failed to create employee', [
                    'error'   => $e->getMessage(),
                    'data'    => array_diff_key($data, ['password' => '', 'avatar' => '']),
                    'user_id' => Auth::id(),
                    'type'    => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function update(int $id, array $data): Employee
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $employee = $this->employee->byId($id)->firstOrFail();

                /** @var User $user */
                $user = Auth::user();

                if (isset($data['name']))        $employee->name          = $data['name'];
                if (isset($data['phone']))       $employee->phone         = $data['phone'];
                if (isset($data['gender']))      $employee->gender        = $data['gender'];
                if (isset($data['address']))     $employee->address       = $data['address'];
                if (isset($data['startDate']))   $employee->start_date    = $data['startDate'];
                if (isset($data['dateOfBirth'])) $employee->date_of_birth = $data['dateOfBirth'];
                if (isset($data['cutoffDays']))  $employee->cutoff_days   = $data['cutoffDays'];
                if (isset($data['isActive']))    $employee->is_active     = $data['isActive'];

                if (isset($data['avatar'])) {
                    if ($employee->avatar) {
                        $this->deleteAvatar($employee->avatar);
                    }
                    $employee->avatar = $this->handleAvatarUpload($data['avatar']);
                }

                if (array_key_exists('positionIds', $data)) {
                    $this->validatePositionsForEmployee($employee, $data['positionIds'] ?? [], $employee->outlet_id);
                    $this->syncPositions($employee, $data['positionIds'] ?? []);

                    if (!$employee->fresh()->isEligibleForProduction($employee->outlet_id)) {
                        $this->employeeProcessCommission
                            ->byEmployeeId($employee->id)
                            ->delete();
                        $employee->employeeProcesses()->delete();
                    }
                }

                if (array_key_exists('employeeSalaries', $data)) {
                    $this->syncSalaries($employee, $data['employeeSalaries'] ?? []);
                }

                if (array_key_exists('employeeProcessCommissions', $data)) {
                    $this->syncProcessCommissions($employee, $data['employeeProcessCommissions'] ?? []);
                }

                $employee->save();

                Log::info('Employee updated successfully', [
                    'employee_id'               => $id,
                    'changes'                   => array_keys($data),
                    'positions_updated'         => array_key_exists('positionIds', $data),
                    'salaries_updated'          => array_key_exists('employeeSalaries', $data),
                    'process_commissions_updated' => array_key_exists('employeeProcessCommissions', $data),
                    'updated_by'                => $user?->id,
                    'type'                      => 'employee_management',
                ]);

                return $employee->fresh(['outlet', 'positions', 'employeeSalaries', 'employeeProcesses', 'employeeProcesses.commission']);
            } catch (Exception $e) {
                Log::error('Failed to update employee', [
                    'employee_id' => $id,
                    'error'       => $e->getMessage(),
                    'data'        => array_diff_key($data, ['password' => '', 'avatar' => '']),
                    'user_id'     => Auth::id(),
                    'type'        => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function updatePassword(int $id, string $password): Employee
    {
        return DB::transaction(function () use ($id, $password) {
            try {
                $employee = $this->employee
                    ->byId($id)
                    ->active()
                    ->with('outlet')
                    ->firstOrFail();

                /** @var User $user */
                $user = Auth::user();

                $this->assertUserCanModifyEmployee($user, $employee);

                $employee->password = Hash::make($password);
                $employee->save();
                $employee->tokens()->delete();

                Log::info('Employee password updated successfully', [
                    'employee_id' => $employee->id,
                    'outlet_id'   => $employee->outlet_id,
                    'updated_by'  => $user?->id,
                    'type'        => 'employee_password_update',
                ]);

                return $employee->fresh(['outlet']);
            } catch (Exception $e) {
                Log::error('Failed to update employee password', [
                    'employee_id' => $id,
                    'error'       => $e->getMessage(),
                    'user_id'     => Auth::id(),
                    'type'        => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $employee = $this->employee->byId($id)->firstOrFail();

                /** @var User $user */
                $user = Auth::user();

                if (!$this->canEmployeeBeDeleted($employee)) {
                    throw new Exception('Cannot delete employee that has active records');
                }

                $deleted = $employee->delete();

                if ($deleted) {
                    Log::info('Employee deleted successfully', [
                        'employee_id' => $id,
                        'name'        => $employee->name,
                        'username'    => $employee->username,
                        'outlet_id'   => $employee->outlet_id,
                        'deleted_by'  => $user->id,
                        'type'        => 'employee_management',
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete employee', [
                    'employee_id' => $id,
                    'error'       => $e->getMessage(),
                    'user_id'     => Auth::id(),
                    'type'        => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function forceDestroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $employee = $this->employee->withTrashed()->findOrFail($id);

                /** @var User $user */
                $user = Auth::user();

                $this->assertUserCanModifyEmployee($user, $employee);

                if ($employee->avatar) {
                    $this->deleteAvatar($employee->avatar);
                }

                $deleted = $employee->forceDelete();

                if ($deleted) {
                    Log::info('Employee permanently deleted', [
                        'employee_id' => $id,
                        'name'        => $employee->name,
                        'username'    => $employee->username,
                        'outlet_id'   => $employee->outlet_id,
                        'deleted_by'  => $user->id,
                        'type'        => 'employee_management',
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to force delete employee', [
                    'employee_id' => $id,
                    'error'       => $e->getMessage(),
                    'user_id'     => Auth::id(),
                    'type'        => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function restore(int $id): Employee
    {
        return DB::transaction(function () use ($id) {
            try {
                $employee = $this->employee->withTrashed()->findOrFail($id);

                /** @var User $user */
                $user = Auth::user();

                $this->assertUserCanModifyEmployee($user, $employee);

                $employee->restore();

                Log::info('Employee restored successfully', [
                    'employee_id' => $id,
                    'name'        => $employee->name,
                    'outlet_id'   => $employee->outlet_id,
                    'restored_by' => $user->id,
                    'type'        => 'employee_management',
                ]);

                return $employee->fresh();
            } catch (Exception $e) {
                Log::error('Failed to restore employee', [
                    'employee_id' => $id,
                    'error'       => $e->getMessage(),
                    'user_id'     => Auth::id(),
                    'type'        => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Employee Salary
    |--------------------------------------------------------------------------
    */

    public function storeEmployeeSalary(int $employeeId, array $data): EmployeeSalary
    {
        return DB::transaction(function () use ($employeeId, $data) {
            try {
                $employee = $this->employee->byId($employeeId)->firstOrFail();

                $existingSalary = $this->employeeSalary
                    ->where('employee_id', $employeeId)
                    ->where('salary_id', $data['salaryId'])
                    ->withTrashed()
                    ->first();

                if ($existingSalary) {
                    if ($existingSalary->trashed()) {
                        $existingSalary->restore();
                    }
                    $existingSalary->update([
                        'amount' => $data['amount'],
                    ]);
                    $employeeSalary = $existingSalary;
                } else {
                    $employeeSalary = $employee->employeeSalaries()->create([
                        'salary_id' => $data['salaryId'],
                        'amount'    => $data['amount'],
                    ]);
                }

                return $employeeSalary->fresh(['employee', 'salary']);
            } catch (Exception $e) {
                Log::error('Failed to create employee salary', [
                    'employee_id' => $employeeId,
                    'data'        => $data,
                    'error'       => $e->getMessage(),
                    'user_id'     => Auth::id(),
                    'type'        => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function updateEmployeeSalary(int $employeeId, int $employeeSalaryId, array $data): EmployeeSalary
    {
        return DB::transaction(function () use ($employeeId, $employeeSalaryId, $data) {
            try {
                $employeeSalary = $this->employeeSalary->byId($employeeSalaryId)->firstOrFail();

                if (isset($data['salaryId'])) $employeeSalary->salary_id = $data['salaryId'];
                if (isset($data['amount']))   $employeeSalary->amount    = $data['amount'];

                $employeeSalary->save();

                return $employeeSalary->fresh(['employee', 'salary']);
            } catch (Exception $e) {
                Log::error('Failed to update employee salary', [
                    'employee_id'       => $employeeId,
                    'employee_salary_id' => $employeeSalaryId,
                    'error'             => $e->getMessage(),
                    'user_id'           => Auth::id(),
                    'type'              => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroyEmployeeSalary(int $employeeId, int $employeeSalaryId): bool
    {
        return DB::transaction(function () use ($employeeId, $employeeSalaryId) {
            try {
                $employeeSalary = $this->employeeSalary->byId($employeeSalaryId)->firstOrFail();

                return $employeeSalary->delete();
            } catch (Exception $e) {
                Log::error('Failed to delete employee salary', [
                    'employee_id'        => $employeeId,
                    'employee_salary_id' => $employeeSalaryId,
                    'error'              => $e->getMessage(),
                    'user_id'            => Auth::id(),
                    'type'               => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Employee Position
    |--------------------------------------------------------------------------
    */

    public function storeEmployeePosition(int $employeeId, array $data): EmployeePosition
    {
        return DB::transaction(function () use ($employeeId, $data) {
            try {
                $employee = $this->employee->byId($employeeId)->firstOrFail();

                $this->validatePositionsForEmployee($employee, [$data['positionId']], $employee->outlet_id);

                $existingPosition = $this->employeePosition
                    ->where('employee_id', $employeeId)
                    ->where('position_id', $data['positionId'])
                    ->withTrashed()
                    ->first();

                if ($existingPosition) {
                    if ($existingPosition->trashed()) {
                        $existingPosition->restore();
                    }
                    $existingPosition->update([
                        'is_active' => $data['isActive'] ?? true,
                    ]);
                    $employeePosition = $existingPosition;
                } else {
                    $employeePosition = $employee->employeePositions()->create([
                        'position_id' => $data['positionId'],
                        'is_active'   => $data['isActive'] ?? true,
                    ]);
                }

                return $employeePosition->fresh(['employee', 'position']);
            } catch (Exception $e) {
                Log::error('Failed to create employee position', [
                    'employee_id' => $employeeId,
                    'data'        => $data,
                    'error'       => $e->getMessage(),
                    'user_id'     => Auth::id(),
                    'type'        => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function updateEmployeePosition(int $employeeId, int $employeePositionId, array $data): EmployeePosition
    {
        return DB::transaction(function () use ($employeeId, $employeePositionId, $data) {
            try {
                $employee = $this->employee->byId($employeeId)->firstOrFail();
                $employeePosition = $this->employeePosition->byId($employeePositionId)->firstOrFail();

                if (isset($data['positionId'])) {
                    $this->validatePositionsForEmployee($employee, [$data['positionId']], $employee->outlet_id);
                    $employeePosition->position_id = $data['positionId'];
                }
                if (isset($data['isActive']))   $employeePosition->is_active   = $data['isActive'];

                $employeePosition->save();

                return $employeePosition->fresh(['employee', 'position']);
            } catch (Exception $e) {
                Log::error('Failed to update employee position', [
                    'employee_id'          => $employeeId,
                    'employee_position_id' => $employeePositionId,
                    'error'                => $e->getMessage(),
                    'user_id'              => Auth::id(),
                    'type'                 => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroyEmployeePosition(int $employeeId, int $employeePositionId): bool
    {
        return DB::transaction(function () use ($employeeId, $employeePositionId) {
            try {
                $employeePosition = $this->employeePosition->byId($employeePositionId)->firstOrFail();

                return $employeePosition->delete();
            } catch (Exception $e) {
                Log::error('Failed to delete employee position', [
                    'employee_id'          => $employeeId,
                    'employee_position_id' => $employeePositionId,
                    'error'                => $e->getMessage(),
                    'user_id'              => Auth::id(),
                    'type'                 => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Employee Process
    |--------------------------------------------------------------------------
    */

    public function storeEmployeeProcess(int $employeeId, array $data): EmployeeProcess
    {
        return DB::transaction(function () use ($employeeId, $data) {
            try {
                $employee = $this->employee->byId($employeeId)->firstOrFail();

                if (!$employee->isEligibleForProduction($employee->outlet_id)) {
                    throw new Exception('Employee tidak memiliki posisi produksi aktif.');
                }

                $existingProcess = $this->employeeProcess
                    ->where('employee_id', $employeeId)
                    ->where('process_id', $data['processId'])
                    ->withTrashed()
                    ->first();

                if ($existingProcess) {
                    if ($existingProcess->trashed()) {
                        $existingProcess->restore();
                    }
                    $existingProcess->update([
                        'is_active'   => true,
                        'assigned_at' => now(),
                    ]);
                    $employeeProcess = $existingProcess;
                } else {
                    $employeeProcess = $employee->employeeProcesses()->create([
                        'process_id'  => $data['processId'],
                        'is_active'   => true,
                        'assigned_at' => now(),
                    ]);
                }

                if (!empty($data['hasCommission'])) {
                    $this->employeeProcessCommission->create([
                        'employee_process_id' => $employeeProcess->id,
                        'commission_type'     => $data['commissionType'],
                        'commission_value'    => $data['commissionValue'],
                        'has_target'          => $data['hasTarget'] ?? false,
                        'target_threshold'    => !empty($data['hasTarget']) ? ($data['targetThreshold'] ?? null) : null,
                        'bonus_amount'        => !empty($data['hasTarget']) ? ($data['bonusAmount'] ?? null) : null,
                        'is_active'           => true,
                    ]);
                }

                return $employeeProcess->fresh(['employee', 'process', 'commission']);
            } catch (Exception $e) {
                Log::error('Failed to create employee process', [
                    'employee_id' => $employeeId,
                    'data'        => $data,
                    'error'       => $e->getMessage(),
                    'user_id'     => Auth::id(),
                    'type'        => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function updateEmployeeProcess(int $employeeId, int $employeeProcessId, array $data): EmployeeProcess
    {
        return DB::transaction(function () use ($employeeId, $employeeProcessId, $data) {
            try {
                $employee = $this->employee->byId($employeeId)->firstOrFail();

                if (!$employee->isEligibleForProduction($employee->outlet_id)) {
                    throw new Exception('Employee tidak memiliki posisi produksi aktif.');
                }

                $employeeProcess = $this->employeeProcess
                    ->where('employee_id', $employeeId)
                    ->where('id', $employeeProcessId)
                    ->firstOrFail();

                $employeeProcess->is_active = $data['isActive'];
                $employeeProcess->save();

                $hasCommission = !empty($data['hasCommission']);

                if ($hasCommission) {
                    $commissionData = [
                        'commission_type'  => $data['commissionType'],
                        'commission_value' => $data['commissionValue'],
                        'has_target'       => $data['hasTarget'] ?? false,
                        'target_threshold' => !empty($data['hasTarget']) ? ($data['targetThreshold'] ?? null) : null,
                        'bonus_amount'     => !empty($data['hasTarget']) ? ($data['bonusAmount'] ?? null) : null,
                        'is_active'        => true,
                    ];

                    if ($employeeProcess->commission) {
                        $employeeProcess->commission->update($commissionData);
                    } else {
                        $this->employeeProcessCommission->create(array_merge(
                            ['employee_process_id' => $employeeProcess->id],
                            $commissionData
                        ));
                    }
                } else {
                    $employeeProcess->commission?->delete();
                }

                return $employeeProcess->fresh(['employee', 'process', 'commission']);
            } catch (Exception $e) {
                Log::error('Failed to update employee process', [
                    'employee_id'         => $employeeId,
                    'employee_process_id' => $employeeProcessId,
                    'error'               => $e->getMessage(),
                    'user_id'             => Auth::id(),
                    'type'                => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroyEmployeeProcess(int $employeeId, int $employeeProcessId): bool
    {
        return DB::transaction(function () use ($employeeId, $employeeProcessId) {
            try {
                $employeeProcess = $this->employeeProcess
                    ->where('employee_id', $employeeId)
                    ->where('id', $employeeProcessId)
                    ->firstOrFail();

                return $employeeProcess->delete();
            } catch (Exception $e) {
                Log::error('Failed to delete employee process', [
                    'employee_id'         => $employeeId,
                    'employee_process_id' => $employeeProcessId,
                    'error'               => $e->getMessage(),
                    'user_id'             => Auth::id(),
                    'type'                => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function syncEmployeeProcesses(int $employeeId, array $data): bool
    {
        return DB::transaction(function () use ($employeeId, $data) {
            try {
                $employee = $this->employee->byId($employeeId)->firstOrFail();
                $processesData = $data['processes'] ?? [];

                if (!$employee->isEligibleForProduction($employee->outlet_id)) {
                    throw new Exception('Employee tidak memiliki posisi produksi aktif.');
                }

                $submittedProcessIds = collect($processesData)
                    ->filter(fn($p) => !empty($p['selected']))
                    ->pluck('processId')
                    ->toArray();

                $employee->employeeProcesses()
                    ->whereNotIn('process_id', $submittedProcessIds)
                    ->delete();

                foreach ($processesData as $processData) {
                    if (empty($processData['selected'])) {
                        continue;
                    }

                    $processId = $processData['processId'];
                    
                    $employeeProcess = $employee->employeeProcesses()
                        ->where('process_id', $processId)
                        ->first();

                    if (!$employeeProcess) {
                        $employeeProcess = $employee->employeeProcesses()->create([
                            'process_id'  => $processId,
                            'is_active'   => true,
                            'assigned_at' => now(),
                        ]);
                    }

                    $hasCommission = !empty($processData['hasCommission']);

                    if ($hasCommission) {
                        $commissionData = [
                            'commission_type'  => $processData['commissionType'],
                            'commission_value' => $processData['commissionValue'],
                            'has_target'       => $processData['hasTarget'] ?? false,
                            'target_threshold' => !empty($processData['hasTarget']) ? ($processData['targetThreshold'] ?? null) : null,
                            'bonus_amount'     => !empty($processData['hasTarget']) ? ($processData['bonusAmount'] ?? null) : null,
                            'is_active'        => true,
                        ];

                        if ($employeeProcess->commission) {
                            $employeeProcess->commission->update($commissionData);
                        } else {
                            $this->employeeProcessCommission->create(array_merge(
                                ['employee_process_id' => $employeeProcess->id],
                                $commissionData
                            ));
                        }
                    } else {
                        $employeeProcess->commission?->delete();
                    }
                }

                return true;
            } catch (Exception $e) {
                Log::error('Failed to sync employee processes', [
                    'employee_id' => $employeeId,
                    'error'       => $e->getMessage(),
                    'user_id'     => Auth::id(),
                    'type'        => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Employee Loan
    |--------------------------------------------------------------------------
    */

    public function storeEmployeeLoan(int $employeeId, array $data): Loan
    {
        return DB::transaction(function () use ($employeeId, $data) {
            try {
                $employee = $this->employee->byId($employeeId)->firstOrFail();

                $activeLoan = $this->loan
                    ->byEmployeeId($employeeId)
                    ->minRemainingAmount(0)
                    ->whereNotIn('status', ['paid', 'bad_debt'])
                    ->exists();

                if ($activeLoan) {
                    throw new Exception('Employee has an active loan or outstanding balance');
                }

                $employeeLoan = $employee->loans()->create([
                    'outlet_id'          => $employee->outlet_id,
                    'source_account_id'  => $data['sourceAccountId'],
                    'amount'             => $data['amount'],
                    'installment_amount' => $data['installmentAmount'] ?? null,
                    'remaining_amount'   => $data['amount'],
                    'loan_date'          => $data['loanDate'],
                    'due_date'           => $data['dueDate'] ?? null,
                    'status'             => 'ongoing',
                    'note'               => $data['note'] ?? null,
                ]);

                Log::info('Employee loan created', [
                    'loan_id'           => $employeeLoan->id,
                    'employee_id'       => $employeeId,
                    'amount'            => $employeeLoan->amount,
                    'source_account_id' => $employeeLoan->source_account_id,
                    'user_id'           => Auth::id(),
                    'type'              => 'loan_creation',
                ]);

                return $employeeLoan->fresh(['employee', 'sourceAccount']);
            } catch (Exception $e) {
                Log::error('Failed to create employee loan', [
                    'employee_id' => $employeeId,
                    'error'       => $e->getMessage(),
                    'user_id'     => Auth::id(),
                    'type'        => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function updateEmployeeLoan(int $employeeId, int $loanId, array $data): Loan
    {
        return DB::transaction(function () use ($employeeId, $loanId, $data) {
            try {
                $loan = $this->loan->byId($loanId)->byEmployeeId($employeeId)->firstOrFail();

                if (isset($data['loanDate']))         $loan->loan_date          = $data['loanDate'];
                if (isset($data['dueDate']))          $loan->due_date           = $data['dueDate'];
                if (isset($data['note']))             $loan->note               = $data['note'];
                if (isset($data['installmentAmount'])) $loan->installment_amount = $data['installmentAmount'];

                if (isset($data['status']) && in_array($data['status'], ['ongoing', 'paid', 'bad_debt'])) {
                    $loan->status = $data['status'];
                }

                $loan->save();

                Log::info('Employee loan updated', [
                    'loan_id'     => $loan->id,
                    'employee_id' => $employeeId,
                    'changes'     => array_keys($data),
                    'user_id'     => Auth::id(),
                    'type'        => 'loan_update',
                ]);

                return $loan->fresh(['employee']);
            } catch (Exception $e) {
                Log::error('Failed to update employee loan', [
                    'employee_id' => $employeeId,
                    'loan_id'     => $loanId,
                    'error'       => $e->getMessage(),
                    'user_id'     => Auth::id(),
                    'type'        => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroyEmployeeLoan(int $employeeId, int $loanId): bool
    {
        return DB::transaction(function () use ($employeeId, $loanId) {
            try {
                $loan = $this->loan->byId($loanId)->byEmployeeId($employeeId)->firstOrFail();

                if ($loan->payments()->exists()) {
                    throw new Exception('Cannot delete loan that has payments');
                }

                $deleted = $loan->delete();

                Log::info('Employee loan deleted', [
                    'loan_id'     => $loanId,
                    'employee_id' => $employeeId,
                    'user_id'     => Auth::id(),
                    'type'        => 'loan_deletion',
                ]);

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete employee loan', [
                    'employee_id' => $employeeId,
                    'loan_id'     => $loanId,
                    'error'       => $e->getMessage(),
                    'user_id'     => Auth::id(),
                    'type'        => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Employee Order
    |--------------------------------------------------------------------------
    */

    public function storeOrder(int $employeeId, array $data): Order
    {
        return DB::transaction(function () use ($employeeId, $data) {
            try {
                $employee = $this->employee->byId($employeeId)->firstOrFail();

                $orderNumber    = $this->generateOrderNumber($employee->outlet_id);
                $orderItemsData = $data['orderItems'];
                $subtotal       = 0;
                $itemSnapshots  = [];

                foreach ($orderItemsData as $orderItem) {
                    $laundryService = LaundryService::with(['category', 'unit'])->findOrFail($orderItem['laundryServiceId']);

                    if ((int) $laundryService->category->outlet_id !== (int) $employee->outlet_id) {
                        throw new Exception('Laundry service does not belong to the same outlet');
                    }

                    if (!$laundryService->is_active) {
                        throw new Exception("Laundry service '{$laundryService->name}' is not active");
                    }

                    if ($orderItem['quantity'] < $laundryService->min_quantity) {
                        throw new Exception("Quantity for '{$laundryService->name}' must be at least {$laundryService->min_quantity}");
                    }

                    $unitPrice      = $laundryService->price;
                    $quantity       = $orderItem['quantity'];
                    $discountAmount = $orderItem['discountAmount'] ?? 0;
                    $itemSubtotal   = $unitPrice * $quantity;
                    $totalAmount    = $itemSubtotal - $discountAmount;

                    $subtotal += $totalAmount;

                    $itemSnapshots[] = [
                        'laundry_service_id'       => $laundryService->id,
                        'category_name'            => $laundryService->category->name,
                        'laundry_service_name'     => $laundryService->name,
                        'unit_name'                => $laundryService->unit->name,
                        'quantity'                 => $quantity,
                        'unit_price'               => $unitPrice,
                        'subtotal'                 => $itemSubtotal,
                        'discount_amount'          => $discountAmount,
                        'total_amount'             => $totalAmount,
                        'status'        => 'pending',
                        'is_package_usage'         => $orderItem['isPackageUsage'] ?? false,
                        'customer_subscription_id' => $orderItem['customerSubscriptionId'] ?? null,
                        'quota_used'               => $orderItem['quotaUsed'] ?? null,
                        'paid_amount'              => $orderItem['paidAmount'] ?? 0,
                        'item_notes'               => $orderItem['itemNotes'] ?? null,
                    ];
                }

                $discountAmount = $data['discountAmount'] ?? 0;
                $taxAmount      = $data['taxAmount'] ?? 0;
                $totalAmount    = $subtotal - $discountAmount + $taxAmount;

                $estimatedCompletion = isset($data['estimatedCompletion'])
                    ? Carbon::parse($data['estimatedCompletion'])
                    : $this->calculateEstimatedCompletion($orderItemsData);

                $order = $employee->orders()->create([
                    'customer_id'          => $data['customerId'],
                    'order_number'         => $orderNumber,
                    'order_type'           => $data['orderType'],
                    'order_status'         => $data['orderStatus'],
                    'payment_method'       => $data['paymentMethod'],
                    'payment_status'       => $data['paymentStatus'],
                    'subtotal'             => $subtotal,
                    'discount_amount'      => $discountAmount,
                    'tax_amount'           => $taxAmount,
                    'total_amount'         => $totalAmount,
                    'paid_amount'          => $data['paidAmount'] ?? 0,
                    'notes'                => $data['notes'] ?? null,
                    'internal_notes'       => $data['internalNotes'] ?? null,
                    'special_instructions' => isset($data['specialInstructions'])
                        ? json_encode($data['specialInstructions'])
                        : null,
                    'order_date'           => isset($data['orderDate'])
                        ? Carbon::parse($data['orderDate'])
                        : Carbon::now(),
                    'estimated_completion' => $estimatedCompletion,
                    'pickup_date'          => isset($data['pickupDate'])
                        ? Carbon::parse($data['pickupDate'])
                        : null,
                ]);

                foreach ($itemSnapshots as $itemSnapshot) {
                    $order->orderItems()->create($itemSnapshot);
                }

                Log::info('Employee order created', [
                    'order_id'     => $order->id,
                    'order_number' => $order->order_number,
                    'employee_id'  => $employeeId,
                    'outlet_id'    => $employee->outlet_id,
                    'customer_id'  => $order->customer_id,
                    'total_amount' => $order->total_amount,
                    'items_count'  => count($itemSnapshots),
                    'user_id'      => Auth::id(),
                    'type'         => 'employee_order_creation',
                ]);

                return $order->fresh(['customer', 'employee', 'orderItems.laundryService']);
            } catch (Exception $e) {
                Log::error('Failed to create employee order', [
                    'employee_id' => $employeeId,
                    'error'       => $e->getMessage(),
                    'user_id'     => Auth::id(),
                    'type'        => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function updateOrder(int $employeeId, int $orderId, array $data): Order
    {
        return DB::transaction(function () use ($employeeId, $orderId, $data) {
            try {
                $employee = $this->employee->byId($employeeId)->firstOrFail();

                $order = $this->order
                    ->byId($orderId)
                    ->where('employee_id', $employeeId)
                    ->where('outlet_id', $employee->outlet_id)
                    ->firstOrFail();

                if (isset($data['customerId'])) {
                    $customer = Customer::findOrFail($data['customerId']);
                    if ((int) $customer->outlet_id !== (int) $employee->outlet_id) {
                        throw new Exception('Customer does not belong to the same outlet');
                    }
                }

                if (isset($data['orderItems'])) {
                    $order->orderItems()->delete();

                    $subtotal      = 0;
                    $itemSnapshots = [];

                    foreach ($data['orderItems'] as $orderItem) {
                        $laundryService = LaundryService::with(['category', 'unit'])->findOrFail($orderItem['laundryServiceId']);

                        if ((int) $laundryService->category->outlet_id !== (int) $employee->outlet_id) {
                            throw new Exception('Laundry service does not belong to the same outlet');
                        }

                        if (!$laundryService->is_active) {
                            throw new Exception("Laundry service '{$laundryService->name}' is not active");
                        }

                        if ($orderItem['quantity'] < $laundryService->min_quantity) {
                            throw new Exception("Quantity for '{$laundryService->name}' must be at least {$laundryService->min_quantity}");
                        }

                        $unitPrice      = $laundryService->price;
                        $quantity       = $orderItem['quantity'];
                        $discountAmount = $orderItem['discountAmount'] ?? 0;
                        $itemSubtotal   = $unitPrice * $quantity;
                        $totalAmount    = $itemSubtotal - $discountAmount;

                        $subtotal += $totalAmount;

                        $itemSnapshots[] = [
                            'laundry_service_id'       => $laundryService->id,
                            'category_name'            => $laundryService->category->name,
                            'laundry_service_name'     => $laundryService->name,
                            'unit_name'                => $laundryService->unit->name,
                            'quantity'                 => $quantity,
                            'unit_price'               => $unitPrice,
                            'subtotal'                 => $itemSubtotal,
                            'discount_amount'          => $discountAmount,
                            'total_amount'             => $totalAmount,
                            'status'        => $orderItem['productionStatus'] ?? 'pending',
                            'is_package_usage'         => $orderItem['isPackageUsage'] ?? false,
                            'customer_subscription_id' => $orderItem['customerSubscriptionId'] ?? null,
                            'quota_used'               => $orderItem['quotaUsed'] ?? null,
                            'paid_amount'              => $orderItem['paidAmount'] ?? 0,
                            'item_notes'               => $orderItem['itemNotes'] ?? null,
                        ];
                    }

                    $discountAmount      = $data['discountAmount'] ?? $order->discount_amount;
                    $taxAmount           = $data['taxAmount'] ?? $order->tax_amount;
                    $order->subtotal     = $subtotal;
                    $order->discount_amount = $discountAmount;
                    $order->tax_amount   = $taxAmount;
                    $order->total_amount = $subtotal - $discountAmount + $taxAmount;

                    if (!isset($data['estimatedCompletion'])) {
                        $order->estimated_completion = $this->calculateEstimatedCompletion($data['orderItems']);
                    }
                }

                if (isset($data['customerId']))         $order->customer_id          = $data['customerId'];
                if (isset($data['orderType']))          $order->order_type           = $data['orderType'];
                if (isset($data['orderStatus']))        $order->order_status         = $data['orderStatus'];
                if (isset($data['paymentMethod']))      $order->payment_method       = $data['paymentMethod'];
                if (isset($data['paymentStatus']))      $order->payment_status       = $data['paymentStatus'];
                if (isset($data['notes']))              $order->notes                = $data['notes'];
                if (isset($data['internalNotes']))      $order->internal_notes       = $data['internalNotes'];
                if (isset($data['paidAmount']))         $order->paid_amount          = $data['paidAmount'];
                if (isset($data['orderDate']))          $order->order_date           = Carbon::parse($data['orderDate']);
                if (isset($data['estimatedCompletion'])) $order->estimated_completion = Carbon::parse($data['estimatedCompletion']);
                if (isset($data['pickupDate']))         $order->pickup_date          = Carbon::parse($data['pickupDate']);

                if (isset($data['specialInstructions'])) {
                    $order->special_instructions = json_encode($data['specialInstructions']);
                }

                if (!isset($data['orderItems'])) {
                    if (isset($data['discountAmount'])) {
                        $order->discount_amount = $data['discountAmount'];
                        $order->total_amount    = $order->subtotal - $order->discount_amount + $order->tax_amount;
                    }
                    if (isset($data['taxAmount'])) {
                        $order->tax_amount   = $data['taxAmount'];
                        $order->total_amount = $order->subtotal - $order->discount_amount + $order->tax_amount;
                    }
                }

                $order->save();

                if (isset($itemSnapshots)) {
                    foreach ($itemSnapshots as $itemSnapshot) {
                        $order->orderItems()->create($itemSnapshot);
                    }
                }

                Log::info('Employee order updated', [
                    'order_id'    => $orderId,
                    'employee_id' => $employeeId,
                    'changes'     => array_keys($data),
                    'user_id'     => Auth::id(),
                    'type'        => 'employee_order_update',
                ]);

                return $order->fresh(['customer', 'employee', 'orderItems.laundryService']);
            } catch (Exception $e) {
                Log::error('Failed to update employee order', [
                    'employee_id' => $employeeId,
                    'order_id'    => $orderId,
                    'error'       => $e->getMessage(),
                    'user_id'     => Auth::id(),
                    'type'        => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroyOrder(int $employeeId, int $orderId): bool
    {
        return DB::transaction(function () use ($employeeId, $orderId) {
            try {
                $employee = $this->employee->byId($employeeId)->firstOrFail();

                $order = $this->order
                    ->byId($orderId)
                    ->where('employee_id', $employeeId)
                    ->where('outlet_id', $employee->outlet_id)
                    ->firstOrFail();

                if (in_array($order->order_status, ['processing', 'ready'])) {
                    throw new Exception('Cannot delete order that is being processed or ready');
                }

                $deleted = $order->delete();

                Log::info('Employee order deleted', [
                    'order_id'    => $orderId,
                    'employee_id' => $employeeId,
                    'user_id'     => Auth::id(),
                    'type'        => 'employee_order_deletion',
                ]);

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete employee order', [
                    'employee_id' => $employeeId,
                    'order_id'    => $orderId,
                    'error'       => $e->getMessage(),
                    'user_id'     => Auth::id(),
                    'type'        => 'employee_service_error',
                ]);
                throw $e;
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Private — Batch Assignment Helpers
    |--------------------------------------------------------------------------
    */

    private function assignSalaries(Employee $employee, array $salaries): void
    {
        if (empty($salaries)) {
            return;
        }

        $salaryData = array_map(fn($s) => [
            'employee_id' => $employee->id,
            'salary_id'   => $s['salaryId'],
            'amount'      => $s['amount'],
            'created_at'  => now(),
            'updated_at'  => now(),
        ], $salaries);

        $this->employeeSalary->insert($salaryData);

        Log::debug('Salaries assigned to employee', [
            'employee_id'    => $employee->id,
            'salaries_count' => count($salaryData),
            'type'           => 'employee_salary_assignment',
        ]);
    }

    private function syncSalaries(Employee $employee, array $salaries): void
    {
        $this->employeeSalary->where('employee_id', $employee->id)->delete();

        if (!empty($salaries)) {
            $this->assignSalaries($employee, $salaries);
        }

        Log::debug('Salaries synced for employee', [
            'employee_id'    => $employee->id,
            'salaries_count' => count($salaries),
            'type'           => 'employee_salary_sync',
        ]);
    }

    private function assignPositions(Employee $employee, array $positionIds): void
    {
        if (empty($positionIds)) {
            return;
        }

        $syncData = collect($positionIds)->mapWithKeys(fn($id) => [
            $id => ['is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ])->all();

        $employee->positions()->syncWithoutDetaching($syncData);

        Log::debug('Positions assigned to employee', [
            'employee_id'  => $employee->id,
            'position_ids' => $positionIds,
            'type'         => 'employee_position_assignment',
        ]);
    }

    private function syncPositions(Employee $employee, array $positionIds): array
    {
        $syncData = collect($positionIds)->mapWithKeys(fn($id) => [
            $id => ['is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ])->all();

        $result = $employee->positions()->sync($syncData);

        Log::debug('Positions synced for employee', [
            'employee_id'  => $employee->id,
            'position_ids' => $positionIds,
            'attached'     => count($result['attached'] ?? []),
            'detached'     => count($result['detached'] ?? []),
            'updated'      => count($result['updated'] ?? []),
            'type'         => 'employee_position_sync',
        ]);

        return $result;
    }

    private function assignProcesses(Employee $employee, array $employeeProcesses): void
    {
        if (empty($employeeProcesses)) {
            return;
        }

        if (!$employee->isEligibleForProduction($employee->outlet_id)) {
            throw new Exception('Employee tidak memiliki posisi produksi aktif.');
        }

        foreach ($employeeProcesses as $assignment) {
            if (empty($assignment['processId'])) {
                continue;
            }

            $employee->assignProcess((int) $assignment['processId'], [
                'is_active' => (bool) ($assignment['isActive'] ?? true),
            ]);
        }

        Log::debug('Processes assigned to employee', [
            'employee_id'     => $employee->id,
            'processes_count' => count($employeeProcesses),
            'type'            => 'employee_process_assignment',
        ]);
    }

    private function assignProcessCommissions(Employee $employee, array $processCommissions): void
    {
        if (empty($processCommissions)) {
            return;
        }

        if (!$employee->isEligibleForProduction($employee->outlet_id)) {
            throw new Exception('Employee tidak memiliki posisi produksi aktif.');
        }

        $commissionData = [];

        foreach ($processCommissions as $commission) {
            if (empty($commission['processId'])) {
                continue;
            }

            $employeeProcess = $this->employeeProcess
                ->byEmployeeId($employee->id)
                ->byProcessId((int) $commission['processId'])
                ->first();

            if (!$employeeProcess) {
                $employeeProcess = EmployeeProcess::assignToEmployee(
                    $employee->id,
                    (int) $commission['processId']
                );
            }

            $commissionData[] = [
                'employee_process_id' => $employeeProcess->id,
                'commission_type'     => $commission['commissionType'],
                'commission_value'    => $commission['commissionValue'],
                'has_target'          => $commission['hasTarget'] ?? false,
                'target_threshold'    => $commission['targetThreshold'] ?? null,
                'bonus_amount'        => $commission['bonusAmount'] ?? null,
                'rules'               => isset($commission['rules']) ? json_encode($commission['rules']) : null,
                'effective_date'      => $commission['effectiveDate'] ?? null,
                'is_active'           => $commission['isActive'] ?? true,
                'created_at'          => now(),
                'updated_at'          => now(),
            ];
        }

        if (!empty($commissionData)) {
            $this->employeeProcessCommission::insert($commissionData);
        }

        Log::debug('Process commissions assigned to employee', [
            'employee_id'       => $employee->id,
            'commissions_count' => count($commissionData),
            'type'              => 'employee_process_commission_assignment',
        ]);
    }

    private function syncProcessCommissions(Employee $employee, array $processCommissions): void
    {
        if (!empty($processCommissions) && !$employee->isEligibleForProduction($employee->outlet_id)) {
            throw new Exception('Employee tidak memiliki posisi produksi aktif.');
        }

        $processIds = array_column($processCommissions, 'processId');

        $this->employeeProcessCommission
            ->byEmployeeId($employee->id)
            ->onlyTrashed()
            ->whereIn('process_id', $processIds)
            ->restore();

        $existingCommissions = $this->employeeProcessCommission
            ->byEmployeeId($employee->id)
            ->get()
            ->keyBy('process_id');

        $processedIds = [];

        foreach ($processCommissions as $commission) {
            $processId      = $commission['processId'];
            $processedIds[] = $processId;

            $data = [
                'commission_type'  => $commission['commissionType'],
                'commission_value' => $commission['commissionValue'],
                'has_target'       => $commission['hasTarget'] ?? false,
                'target_threshold' => $commission['targetThreshold'] ?? null,
                'bonus_amount'     => $commission['bonusAmount'] ?? null,
                'rules'            => isset($commission['rules']) ? json_encode($commission['rules']) : null,
                'effective_date'   => $commission['effectiveDate'] ?? null,
                'is_active'        => $commission['isActive'] ?? true,
            ];

            if ($existingCommissions->has($processId)) {
                $existingCommissions->get($processId)->update($data);
            } else {
                $this->employeeProcessCommission->create(array_merge(
                    ['employee_id' => $employee->id, 'process_id' => $processId],
                    $data
                ));
            }
        }

        $this->employeeProcessCommission
            ->byEmployeeId($employee->id)
            ->whereNotIn('process_id', $processedIds)
            ->forceDelete();

        Log::debug('Process commissions synced for employee', [
            'employee_id'       => $employee->id,
            'commissions_count' => count($processCommissions),
            'type'              => 'employee_process_commission_sync',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Private — Utility Helpers
    |--------------------------------------------------------------------------
    */

    private function handleAvatarUpload($avatarFile): string
    {
        try {
            return $avatarFile->store('avatars/employees', 'public');
        } catch (Exception $e) {
            Log::error('Failed to upload avatar', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'file_upload_error',
            ]);
            throw new Exception('Failed to upload avatar file');
        }
    }

    private function deleteAvatar(string $avatarPath): bool
    {
        try {
            if (Storage::disk('public')->exists($avatarPath)) {
                return Storage::disk('public')->delete($avatarPath);
            }
            return true;
        } catch (Exception $e) {
            Log::warning('Failed to delete avatar file', [
                'avatar_path' => $avatarPath,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'file_delete_error',
            ]);
            return false;
        }
    }

    private function generateOrderNumber(int $outletId): string
    {
        $prefix      = 'ORD';
        $date        = Carbon::now()->format('Ymd');
        $outletCode  = str_pad($outletId, 3, '0', STR_PAD_LEFT);

        $lastOrder = $this->order
            ->where('outlet_id', $outletId)
            ->whereDate('created_at', Carbon::today())
            ->orderBy('id', 'desc')
            ->first();

        $sequence    = $lastOrder ? (int) substr($lastOrder->order_number, -4) + 1 : 1;
        $sequenceStr = str_pad($sequence, 4, '0', STR_PAD_LEFT);

        return "{$prefix}{$date}{$outletCode}{$sequenceStr}";
    }

    private function calculateEstimatedCompletion(array $orderItemsData): \Carbon\CarbonInterface
    {
        $maxDuration = 0;

        foreach ($orderItemsData as $orderItem) {
            $laundryService = LaundryService::find($orderItem['laundryServiceId']);
            if ($laundryService && $laundryService->duration_hours > $maxDuration) {
                $maxDuration = $laundryService->duration_hours;
            }
        }

        return Carbon::now()->addHours($maxDuration ?: 24);
    }

    private function canEmployeeBeDeleted(Employee $employee): bool
    {
        return true;
    }

    private function canUserAccessOutlet(User $user, Outlet $outlet): bool
    {
        if ($user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasRole('owner') && $outlet->isOwner($user);
    }

    private function canUserModifyEmployee(User $user, Employee $employee): bool
    {
        if ($user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasRole('owner')
            && $employee->outlet
            && $employee->outlet->isOwner($user);
    }

    /**
     * @throws AuthorizationException
     */
    private function assertUserCanModifyEmployee(?User $user, Employee $employee): void
    {
        if (!$user || !$this->canUserModifyEmployee($user, $employee)) {
            throw new AuthorizationException('Anda tidak berhak mengubah karyawan ini.');
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Private — Filters
    |--------------------------------------------------------------------------
    */

    private function applyFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (isset($filters['isActive'])) {
            $query->where('is_active', $filters['isActive']);
        }

        if (!empty($filters['outletId'])) {
            $query->where('outlet_id', $filters['outletId']);
        }

        if (!empty($filters['positionId'])) {
            $query->byPositionId($filters['positionId']);
        }

        $this->applySort(
            query: $query,
            column: $filters['sortBy'] ?? 'createdAt',
            direction: $filters['sortDirection'] ?? 'desc',
            allowed: ['name', 'username', 'createdAt', 'updatedAt'],
            columnMap: ['createdAt' => 'created_at', 'updatedAt' => 'updated_at'],
            default: 'createdAt'
        );
    }

    /**
     * Validate positions to assign to an employee.
     *
     * @throws Exception
     */
    protected function validatePositionsForEmployee(?Employee $employee, array $positionIds, int $primaryOutletId): void
    {
        if (empty($positionIds)) {
            return;
        }

        $primaryOutletId = (int) $primaryOutletId;
        $primaryOutlet = $this->outlet->findOrFail($primaryOutletId);
        $ownerId = (int) $primaryOutlet->owner_id;

        $positions = $this->position->whereIn('id', $positionIds)->with(['outlet', 'permissions'])->get();

        if ($positions->count() !== count(array_unique($positionIds))) {
            throw new Exception('Satu atau lebih posisi tidak ditemukan.');
        }

        foreach ($positions as $position) {
            $positionOutletId = (int) $position->outlet_id;
            $positionOwnerId = (int) $position->outlet->owner_id;

            if ($positionOwnerId !== $ownerId) {
                throw new Exception("Posisi '{$position->name}' bukan milik outlet dari owner yang sama.");
            }

            if (!$position->hasCourierPermission() && $positionOutletId !== $primaryOutletId) {
                throw new Exception(
                    "Posisi '{$position->name}' tidak memiliki permission kurir dan tidak dapat ditugaskan ke outlet lain."
                );
            }
        }
    }
}
