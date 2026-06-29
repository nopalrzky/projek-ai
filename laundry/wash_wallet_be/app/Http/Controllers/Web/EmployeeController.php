<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;

use App\Http\Requests\Employee\StoreEmployeeRequest;
use App\Http\Requests\Employee\UpdateEmployeeRequest;
use App\Http\Requests\Employee\EmployeePosition\StoreEmployeePositionRequest;
use App\Http\Requests\Employee\EmployeePosition\UpdateEmployeePositionRequest;
use App\Http\Requests\Employee\EmployeeProcess\StoreEmployeeProcessRequest;
use App\Http\Requests\Employee\EmployeeProcess\UpdateEmployeeProcessRequest;
use App\Http\Requests\Employee\EmployeeSalary\StoreEmployeeSalaryRequest;
use App\Http\Requests\Employee\EmployeeSalary\UpdateEmployeeSalaryRequest;
use App\Http\Requests\Employee\Loan\StoreLoanRequest;
use App\Http\Requests\Employee\Loan\UpdateLoanRequest;

use App\Http\Resources\Account\AccountResource;
use App\Http\Resources\Employee\EmployeeResource;
use App\Http\Resources\EmployeeSalary\EmployeeSalaryResource;
use App\Http\Resources\Loan\LoanResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\Position\PositionResource;
use App\Http\Resources\Process\ProcessResource;
use App\Http\Resources\Salary\SalaryResource;

use App\Services\AccountService;
use App\Services\EmployeeService;
use App\Services\EmployeeSalaryService;
use App\Services\LoanService;
use App\Services\OutletService;
use App\Services\PositionService;
use App\Services\ProcessService;
use App\Services\SalaryService;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class EmployeeController extends Controller
{
    public function __construct(private readonly AccountService $accountService, private readonly EmployeeService $employeeService, private readonly EmployeeSalaryService $employeeSalaryService, private readonly LoanService $loanService, private readonly OutletService $outletService, private readonly PositionService $positionService, private readonly ProcessService $processService, private readonly SalaryService $salaryService) {}

    /**
     * Display a listing of employees
     */
    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);
            $employees = $this->employeeService->getAll(
                $filters,
                $filters['page'],
                $filters['perPage'],
                ['outlet:id,name,code']
            );

            $outlets = $this->outletService->getAll();
            $positions = $this->positionService->getAll();

            return Inertia::render('Dashboard/Employees/Index', [
                'employees' => [
                    'data' => EmployeeResource::collection($employees->items())->resolve(),
                    'meta' => PaginationHelper::format($employees, $request),
                ],
                'stats' => $this->employeeService->getStats(),
                'filterOptions' => [
                    'outlets' => OutletResource::collection($outlets)->resolve(),
                    'positions' => PositionResource::collection($positions)->resolve(),
                ],
                'filters' => $filters,
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to load employees index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return Inertia::render('Dashboard/Employees/Index', [
                'employees' => [
                    'data' => [],
                    'meta' => [],
                ],
                'filterOptions' => [
                    'outlets' => [],
                    'positions' => [],
                ],
                'filters' => [],
                'error' => 'Gagal memuat data. Silakan coba lagi.',
            ]);
        }
    }

    /**
     * Show the form for creating a new employee
     */
    public function create(): Response|RedirectResponse
    {
        try {
            $outlets = $this->outletService->getAll();
            $salaries = $this->salaryService->getAll();
            $processes = $this->processService->getAll();

            return Inertia::render('Dashboard/Employees/Create', [
                'outlets' => OutletResource::collection($outlets)->resolve(),
                'salaries' => SalaryResource::collection($salaries)->resolve(),
                'processes' => ProcessResource::collection($processes)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to load employee create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->route('employees.index')
                ->with('error', 'Gagal memuat formulir pembuatan Karyawan');
        }
    }

    /**
     * Store a newly created employee
     */
    public function store(StoreEmployeeRequest $request): RedirectResponse
    {
        try {
            $employee = $this->employeeService->store($request->validated());

            return redirect()->route('employees.index')
                ->with('success', "Karyawan '{$employee->name}' berhasil ditambahkan");
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to create employee', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->back()
                ->withInput($request->except(['password', 'passwordConfirmation', 'avatar']))
                ->withErrors(['error' => 'Gagal menambahkan Karyawan: ' . $e->getMessage()])
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified employee
     */
    public function show(int $id): Response|RedirectResponse
    {
        try {
            $employee = $this->employeeService->getById($id, [
                'outlet',
                'employeePositions',
                'employeePositions.position',
                'employeePositions.position.outlet',
                'employeeProcesses',
                'employeeProcesses.process',
                'employeeProcesses.commission',
                'employeeSalaries',
                'employeeSalaries.salary',
                'fineLogs',
                'fineLogs.fine',
                'fineLogs.payrollItem.payroll',
                'loans',
                'loans.sourceAccount',
                'loans.loanLogs',
                'orders',
                'orders.customer',
                'orders.orderItems',
            ]);

            $salaries = $this->salaryService->getAll();
            $positions = $this->positionService->getAll(
                filters: []
            );

            return Inertia::render('Dashboard/Employees/Show', [
                'employee' => (new EmployeeResource($employee))->resolve(),
                'positions' => PositionResource::collection($positions)->resolve(),
                'salaries' => SalaryResource::collection($salaries)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to show employee', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->route('employees.index')
                ->with('error', 'Karyawan tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Show the form for editing the specified employee
     */
    public function edit(int $id): Response|RedirectResponse
    {
        try {
            $employee = $this->employeeService->getById($id, [
                'outlet',
                'employeePositions.position',
                'employeePositions.position.outlet',
                'employeeSalaries.salary',
                'employeeProcesses',
                'employeeProcesses.process',
                'employeeProcesses.commission',
            ]);
            $salaries = $this->salaryService->getAll();
            $processes = $this->processService->getAll();
            $positions = $this->positionService->getAll(
                filters: []
            );

            return Inertia::render('Dashboard/Employees/Edit', [
                'employee' => (new EmployeeResource($employee))->resolve(),
                'salaries' => SalaryResource::collection($salaries)->resolve(),
                'processes' => ProcessResource::collection($processes)->resolve(),
                'positions' => PositionResource::collection($positions)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to load employee edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->route('employees.index')
                ->with('error', 'Karyawan tidak ditemukan atau akses ditolak');
        }
    }

    /**
     * Update the specified employee
     */
    public function update(UpdateEmployeeRequest $request, int $id): RedirectResponse
    {
        try {
            $employee = $this->employeeService->update($id, $request->validated());

            return redirect()->route('employees.index')
                ->with('success', "Data Karyawan '{$employee->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to update employee', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified employee
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            $deleted = $this->employeeService->destroy($id);

            if ($deleted) {
                return redirect()->route('employees.index')
                    ->with('success', 'Karyawan berhasil dihapus');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus Karyawan');
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to delete employee', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Restore soft deleted employee
     */
    public function restore(int $id): RedirectResponse
    {
        try {
            $employee = $this->employeeService->restore($id);

            return redirect()->route('employees.show', $employee->id)
                ->with('success', "Karyawan '{$employee->name}' berhasil dipulihkan");
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to restore employee', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Permanently delete employee
     */
    public function forceDestroy(int $id): RedirectResponse
    {
        try {
            $deleted = $this->employeeService->forceDestroy($id);

            if ($deleted) {
                return redirect()->route('employees.index')
                    ->with('success', 'Karyawan berhasil dihapus permanen');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus Karyawan secara permanen');
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to force delete employee', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    public function createEmployeeSalary(int $employeeId): Response|RedirectResponse
    {
        try {
            $employee = $this->employeeService->getById($employeeId, [
                'outlet:id,name,code',
                'positions:id,name',
                'employeeSalaries:id,employee_id,salary_id',
            ]);

            $assignedSalaryIds = $employee->employeeSalaries->pluck('salary_id')->toArray();

            $salaries = $this->salaryService->getAll()->filter(
                fn($salary) => !in_array($salary->id, $assignedSalaryIds)
            )->values();

            return Inertia::render('Dashboard/Employees/EmployeeSalaries/Create', [
                'employee' => (new EmployeeResource($employee))->resolve(),
                'salaries' => SalaryResource::collection($salaries)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to load employee salary create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->route('employees.show', $employeeId)
                ->with('error', 'Gagal memuat formulir pembuatan Gaji Karyawan');
        }
    }

    public function storeEmployeeSalary(StoreEmployeeSalaryRequest $request, int $employeeId): RedirectResponse
    {
        try {
            $this->employeeService->storeEmployeeSalary($employeeId, $request->validated());

            return redirect()->route('employees.show', $employeeId)
                ->with('success', 'Gaji Karyawan berhasil ditambahkan');
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to create employee salary', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function editEmployeeSalary(int $employeeId, int $employeeSalaryId): Response|RedirectResponse
    {
        try {
            $employee = $this->employeeService->getById($employeeId, [
                'outlet:id,name,code',
                'employeeSalaries:id,employee_id,salary_id',
            ]);

            $employeeSalary = $this->employeeSalaryService->getById($employeeSalaryId);

            $assignedSalaryIds = $employee->employeeSalaries
                ->pluck('salary_id')
                ->filter(fn($id) => $id !== $employeeSalary->salary_id)
                ->toArray();

            $salaries = $this->salaryService->getAll()->filter(
                fn($salary) => !in_array($salary->id, $assignedSalaryIds)
            )->values();

            return Inertia::render('Dashboard/Employees/EmployeeSalaries/Edit', [
                'employee' => (new EmployeeResource($employee))->resolve(),
                'employeeSalary' => (new EmployeeSalaryResource($employeeSalary))->resolve(),
                'salaries' => SalaryResource::collection($salaries)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to load employee salary edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->route('employees.show', $employeeId)
                ->with('error', 'Gagal memuat data Gaji Karyawan');
        }
    }

    public function updateEmployeeSalary(UpdateEmployeeSalaryRequest $request, int $employeeId, int $employeeSalaryId): RedirectResponse
    {
        try {
            $this->employeeService->updateEmployeeSalary($employeeId, $employeeSalaryId, $request->validated());

            return redirect()->route('employees.show', $employeeId)
                ->with('success', 'Gaji Karyawan berhasil diperbarui');
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to update employee salary', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function destroyEmployeeSalary(int $employeeId, int $employeeSalaryId): RedirectResponse
    {
        try {
            $deleted = $this->employeeService->destroyEmployeeSalary($employeeId, $employeeSalaryId);

            if ($deleted) {
                return redirect()->route('employees.show', $employeeId)
                    ->with('success', 'Gaji Karyawan berhasil dihapus');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus Gaji Karyawan');
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to delete employee salary', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    public function storeEmployeePosition(StoreEmployeePositionRequest $request, int $employeeId): RedirectResponse
    {
        try {
            $this->employeeService->storeEmployeePosition($employeeId, $request->validated());

            return redirect()->route('employees.show', $employeeId)
                ->with('success', 'Posisi Karyawan berhasil ditambahkan');
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to create employee position', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function createEmployeeProcess(int $employeeId): Response|RedirectResponse
    {
        try {
            $employee = $this->employeeService->getById($employeeId, [
                'outlet:id,name,code',
                'employeeProcesses',
            ]);

            $assignedProcessIds = $employee->employeeProcesses->pluck('process_id')->toArray();

            $processes = $this->processService->getAll()->filter(
                fn($process) => !in_array($process->id, $assignedProcessIds)
            )->values();

            return Inertia::render('Dashboard/Employees/EmployeeProcesses/Create', [
                'employee' => (new EmployeeResource($employee))->resolve(),
                'processes' => ProcessResource::collection($processes)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to load employee process create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->route('employees.show', $employeeId)
                ->with('error', 'Gagal memuat formulir pembuatan Proses Karyawan');
        }
    }

    public function storeEmployeeProcess(StoreEmployeeProcessRequest $request, int $employeeId): RedirectResponse
    {
        try {
            $this->employeeService->storeEmployeeProcess($employeeId, $request->validated());

            return redirect()->route('employees.show', $employeeId)
                ->with('success', 'Proses Karyawan berhasil ditambahkan');
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to create employee process', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function settingEmployeeProcess(int $employeeId): Response|RedirectResponse
    {
        try {
            $employee = $this->employeeService->getById($employeeId, [
                'outlet:id,name,code',
                'employeeProcesses',
                'employeeProcesses.commission',
            ]);

            $processes = $this->processService->getAll();

            return Inertia::render('Dashboard/Employees/EmployeeProcesses/Setting', [
                'employee' => (new EmployeeResource($employee))->resolve(),
                'processes' => ProcessResource::collection($processes)->resolve(),
            ]);
        } catch (\Throwable $e) {
            Log::error('[EmployeeController] Failed to load employee process setting form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->route('employees.show', $employeeId)
                ->with('error', 'Gagal memuat halaman pengaturan Proses Karyawan');
        }
    }

    public function syncEmployeeProcesses(\Illuminate\Http\Request $request, int $employeeId): RedirectResponse
    {
        try {
            $this->employeeService->syncEmployeeProcesses($employeeId, $request->all());

            return redirect()->route('employees.show', $employeeId)
                ->with('success', 'Pengaturan Proses Karyawan berhasil disimpan');
        } catch (\Throwable $e) {
            Log::error('[EmployeeController] Failed to sync employee processes', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function editEmployeeProcess(int $employeeId, int $employeeProcessId): Response|RedirectResponse
    {
        try {
            $employee = $this->employeeService->getById($employeeId, [
                'outlet:id,name,code',
            ]);

            $employeeProcess = $employee->employeeProcesses()
                ->with(['process', 'commission'])
                ->where('id', $employeeProcessId)
                ->firstOrFail();

            return Inertia::render('Dashboard/Employees/EmployeeProcesses/Edit', [
                'employee' => (new EmployeeResource($employee))->resolve(),
                'employeeProcess' => (new \App\Http\Resources\EmployeeProcess\EmployeeProcessResource($employeeProcess))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to load employee process edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->route('employees.show', $employeeId)
                ->with('error', 'Gagal memuat formulir edit Proses Karyawan');
        }
    }

    public function updateEmployeeProcess(UpdateEmployeeProcessRequest $request, int $employeeId, int $employeeProcessId): RedirectResponse
    {
        try {
            $this->employeeService->updateEmployeeProcess($employeeId, $employeeProcessId, $request->validated());

            return redirect()->route('employees.show', $employeeId)
                ->with('success', 'Proses Karyawan berhasil diperbarui');
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to update employee process', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function destroyEmployeeProcess(int $employeeId, int $employeeProcessId): RedirectResponse
    {
        try {
            $deleted = $this->employeeService->destroyEmployeeProcess($employeeId, $employeeProcessId);

            if ($deleted) {
                return redirect()->route('employees.show', $employeeId)
                    ->with('success', 'Proses Karyawan berhasil dihapus');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus Proses Karyawan');
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to delete employee process', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    public function updateEmployeePosition(UpdateEmployeePositionRequest $request, int $employeeId, int $employeePositionId): RedirectResponse
    {
        try {
            $this->employeeService->updateEmployeePosition($employeeId, $employeePositionId, $request->validated());

            return redirect()->route('employees.show', $employeeId)
                ->with('success', 'Posisi Karyawan berhasil diperbarui');
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to update employee position', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function destroyEmployeePosition(int $employeeId, int $employeePositionId): RedirectResponse
    {
        try {
            $deleted = $this->employeeService->destroyEmployeePosition($employeeId, $employeePositionId);

            if ($deleted) {
                return redirect()->route('employees.show', $employeeId)
                    ->with('success', 'Posisi Karyawan berhasil dihapus');
            }

            return redirect()->back()
                ->with('error', 'Gagal menghapus Posisi Karyawan');
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to delete employee position', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    public function createLoan(int $employeeId): Response|RedirectResponse
    {
        try {
            $employee = $this->employeeService->getById($employeeId, [
                'outlet:id,name,code',
                'positions:id,name',
            ]);

            $accounts = $this->accountService->getAll([
                'owner_id' => Auth::id(),
                'type' => 'asset',
                'isTransactional' => true,
            ]);

            return Inertia::render('Dashboard/Employees/Loans/Create', [
                'employee' => (new EmployeeResource($employee))->resolve(),
                'accounts' => AccountResource::collection($accounts)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to load employee loan create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->route('employees.show', $employeeId)
                ->with('error', 'Gagal memuat formulir pembuatan Pinjaman Karyawan');
        }
    }

    public function storeLoan(StoreLoanRequest $request, int $employeeId): RedirectResponse
    {
        try {
            $this->employeeService->storeEmployeeLoan($employeeId, $request->validated());

            return redirect()->route('employees.show', $employeeId)
                ->with('success', 'Pinjaman Karyawan berhasil ditambahkan');
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to create employee loan', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function editLoan(int $employeeId, int $loanId): Response|RedirectResponse
    {
        try {
            $employee = $this->employeeService->getById($employeeId);

            $loan = $this->loanService->getById($loanId);

            $accounts = $this->accountService->getAll([
                'owner_id' => Auth::id(),
                'type' => 'asset',
                'isTransactional' => true,
            ]);

            return Inertia::render('Dashboard/Employees/Loans/Edit', [
                'employee' => (new EmployeeResource($employee))->resolve(),
                'loan' => (new LoanResource($loan))->resolve(),
                'accounts' => AccountResource::collection($accounts)->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to load employee loan edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->route('employees.show', $employeeId)
                ->with('error', 'Gagal memuat data Pinjaman Karyawan');
        }
    }

    public function updateLoan(UpdateLoanRequest $request, int $employeeId, int $loanId): RedirectResponse
    {
        try {
            $this->employeeService->updateEmployeeLoan($employeeId, $loanId, $request->validated());

            return redirect()->route('employees.show', $employeeId)
                ->with('success', 'Data Pinjaman berhasil diperbarui');
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to update employee loan', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function destroyLoan(int $employeeId, int $loanId): RedirectResponse
    {
        try {
            $this->employeeService->destroyEmployeeLoan($employeeId, $loanId);

            return redirect()->route('employees.show', $employeeId)
                ->with('success', 'Pinjaman Karyawan berhasil dihapus');
        } catch (Throwable $e) {
            Log::error('[EmployeeController] Failed to delete employee loan', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'employee_controller_error',
            ]);

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Get filters from request
     */
    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search' => $request->string('search')->toString(),
            'sortBy' => $request->string('sortBy', 'createdAt')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page' => $request->integer('page', 1),
            'perPage' => $request->integer('perPage', 15),
            'isActive' => $request->has('isActive') && $request->filled('isActive')
                ? $request->boolean('isActive')
                : null,
            'outletId' => $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'positionId' => $request->filled('positionId')
                ? $request->integer('positionId')
                : null,
        ];
    }
}
