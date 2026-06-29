<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\EmployeeSalary;
use App\Models\Salary;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EmployeeSalaryService extends BaseService
{
    public function __construct(
        protected EmployeeSalary $employeeSalary,
        protected Employee $employee,
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
        array $relations = ['employee', 'salary']
    ): LengthAwarePaginator|Collection {
        try {
            $query = $this->employeeSalary->query();

            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get employee salaries', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_salary_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(int $id, array $relations = ['employee', 'salary']): EmployeeSalary
    {
        try {
            $query = $this->employeeSalary->byId($id);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get employee salary by ID', [
                'employee_salary_id' => $id,
                'error'              => $e->getMessage(),
                'user_id'            => Auth::id(),
                'type'               => 'employee_salary_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function store(array $data): EmployeeSalary
    {
        return DB::transaction(function () use ($data) {
            try {
                $employeeSalary = $this->employeeSalary->create([
                    'employee_id' => $data['employeeId'],
                    'salary_id'   => $data['salaryId'],
                    'amount'      => $data['amount'],
                ]);

                Log::info('Employee salary created successfully', [
                    'employee_salary_id' => $employeeSalary->id,
                    'employee_id'        => $employeeSalary->employee_id,
                    'salary_id'          => $employeeSalary->salary_id,
                    'amount'             => $employeeSalary->amount,
                    'user_id'            => Auth::id(),
                    'type'               => 'employee_salary_action',
                ]);

                return $employeeSalary->fresh(['employee', 'salary', 'salary.outlet']);
            } catch (Exception $e) {
                Log::error('Failed to create employee salary', [
                    'data'    => $data,
                    'error'   => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type'    => 'employee_salary_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function update(int $id, array $data): EmployeeSalary
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $employeeSalary = $this->employeeSalary->byId($id)->firstOrFail();

                if (isset($data['salaryId']))    $employeeSalary->salary_id   = $data['salaryId'];
                if (isset($data['amount']))       $employeeSalary->amount      = $data['amount'];
                if (isset($data['employeeId']))   $employeeSalary->employee_id = $data['employeeId'];

                $employeeSalary->save();

                Log::info('Employee salary updated successfully', [
                    'employee_salary_id' => $employeeSalary->id,
                    'updated_fields'     => array_keys($data),
                    'user_id'            => Auth::id(),
                    'type'               => 'employee_salary_action',
                ]);

                return $employeeSalary->fresh(['employee', 'salary', 'salary.outlet']);
            } catch (Exception $e) {
                Log::error('Failed to update employee salary', [
                    'employee_salary_id' => $id,
                    'data'               => $data,
                    'error'              => $e->getMessage(),
                    'user_id'            => Auth::id(),
                    'type'               => 'employee_salary_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $employeeSalary = $this->employeeSalary->byId($id)->firstOrFail();
                $deleted        = $employeeSalary->delete();

                if ($deleted) {
                    Log::info('Employee salary deleted successfully', [
                        'employee_salary_id' => $id,
                        'employee_id'        => $employeeSalary->employee_id,
                        'salary_id'          => $employeeSalary->salary_id,
                        'amount'             => $employeeSalary->amount,
                        'user_id'            => Auth::id(),
                        'type'               => 'employee_salary_action',
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete employee salary', [
                    'employee_salary_id' => $id,
                    'error'              => $e->getMessage(),
                    'user_id'            => Auth::id(),
                    'type'               => 'employee_salary_service_error',
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
        $search        = !empty($filters['search']) ? (string) $filters['search'] : null;
        $sortBy        = !empty($filters['sortBy']) ? (string) $filters['sortBy'] : 'created_at';
        $sortDirection = !empty($filters['sortDirection']) ? (string) $filters['sortDirection'] : 'desc';

        if ($search) {
            $query->search($search);
        }

        if (!empty($filters['employeeId'])) {
            $query->byEmployeeId($filters['employeeId']);
        }

        if (!empty($filters['salaryId'])) {
            $query->bySalaryId($filters['salaryId']);
        }

        if (!empty($filters['outletId'])) {
            $query->whereHas('salary', function ($q) use ($filters) {
                $q->where('outlet_id', $filters['outletId']);
            });
        }

        if (!empty($filters['minAmount'])) {
            $query->where('amount', '>=', $filters['minAmount']);
        }

        if (!empty($filters['maxAmount'])) {
            $query->where('amount', '<=', $filters['maxAmount']);
        }

        if (!empty($filters['createdFrom'])) {
            $query->whereDate('created_at', '>=', $filters['createdFrom']);
        }

        if (!empty($filters['createdTo'])) {
            $query->whereDate('created_at', '<=', $filters['createdTo']);
        }

        $validSortColumns = ['amount', 'created_at', 'updated_at'];
        $sortColumn       = in_array($sortBy, $validSortColumns) ? $sortBy : 'created_at';
        $sortDir          = in_array(strtolower($sortDirection), ['asc', 'desc']) ? $sortDirection : 'desc';

        $query->orderBy($sortColumn, $sortDir);
    }
}
