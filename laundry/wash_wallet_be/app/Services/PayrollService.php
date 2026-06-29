<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Employee;
use App\Models\EmployeeSalary;
use App\Models\FineLog;
use App\Models\Loan;
use App\Models\LoanLog;
use App\Models\Outlet;
use App\Models\Payroll;
use App\Models\PayrollItem;
use App\Models\WorkLog;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;

class PayrollService extends BaseService
{
    public function __construct(
        protected Payroll $payroll,
        protected PayrollItem $payrollItem,
        protected Employee $employee,
        protected EmployeeSalary $employeeSalary,
        protected FineLog $fineLog,
        protected Loan $loan,
        protected LoanLog $loanLog,
        protected Account $account,
        protected Outlet $outlet,
        protected WorkLog $workLog,
        protected LoanService $loanService,
        protected AccountingService $accountingService,
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
        array $relations = ['outlet', 'employee', 'bankAccount', 'payrollItems', 'workLogs', 'fineLogs']
    ): LengthAwarePaginator|Collection {
        try {
            $query = $this->payroll->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get payrolls', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'type'    => 'payroll_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(
        int $id,
        array $relations = ['outlet', 'employee', 'bankAccount', 'payrollItems', 'workLogs', 'fineLogs']
    ): Payroll {
        try {
            $query = $this->payroll->byId('id', $id);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get payroll by ID', [
                'payroll_id' => $id,
                'error'      => $e->getMessage(),
                'type'       => 'payroll_service_error',
            ]);
            throw $e;
        }
    }

    public function getPreview(
        int $outletId,
        ?int $employeeId,
        string $month,
        string $year
    ): array {
        try {
            $outlet    = $this->outlet->findOrFail($outletId);
            $startDate = "{$year}-{$month}-01";
            $endDate   = date('Y-m-t', strtotime($startDate));

            if ($employeeId) {
                $employee = $this->employee
                    ->byId($employeeId)
                    ->byOutletId($outletId)
                    ->active()
                    ->firstOrFail();

                $payrollData = $this->calculatePayrollData($employee, $startDate, $endDate);

                return [
                    'type'    => 'single',
                    'outlet'  => $outlet,
                    'period'  => [
                        'month'      => $month,
                        'year'       => $year,
                    ],
                    'items'   => [$payrollData],
                    'summary' => $this->calculateSummary([$payrollData]),
                ];
            }

            $employees = $this->employee
                ->byOutletId($outletId)
                ->active()
                ->orderBy('name')
                ->get();

            if ($employees->isEmpty()) {
                throw new Exception('No active employees found in this outlet');
            }

            $payrollItems = [];
            foreach ($employees as $employee) {
                /** @var Employee $employee */
                $payrollData = $this->calculatePayrollData($employee, $startDate, $endDate);

                $existingPayroll = $this->payroll
                    ->byEmployeeId($employee->id)
                    ->byPeriod((int) $year, (int) $month)
                    ->whereIn('status', ['draft', 'paid'])
                    ->first();

                if ($existingPayroll) {
                    $payrollData['isAlreadyPaid'] = true;
                    $payrollData['existingPayrollId'] = $existingPayroll->id;
                    $payrollData['existingPayrollStatus'] = $existingPayroll->status;
                } else {
                    $payrollData['isAlreadyPaid'] = false;
                }

                $payrollItems[] = $payrollData;
            }

            return [
                'type'    => 'bulk',
                'outlet'  => $outlet,
                'period'  => [
                    'month'      => $month,
                    'year'       => $year,
                ],
                'items'   => $payrollItems,
                'summary' => $this->calculateSummary($payrollItems),
            ];
        } catch (Exception $e) {
            Log::error('Failed to get payroll preview', [
                'outlet_id'   => $outletId,
                'employee_id' => $employeeId,
                'month'       => $month,
                'year'        => $year,
                'error'       => $e->getMessage(),
                'type'        => 'payroll_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function store(array $data, ?UploadedFile $attachment = null): array
    {
        return DB::transaction(function () use ($data, $attachment) {
            try {
                if (empty($data['items']) || !is_array($data['items'])) {
                    throw new Exception('Payroll items are required');
                }

                $outlet      = $this->outlet->findOrFail($data['outletId']);
                $bankAccount = $this->account
                    ->byId($data['bankAccountId'])
                    ->byOwnerId($outlet->owner_id)
                    ->firstOrFail();

                if ($bankAccount->type !== 'asset') {
                    throw new Exception('Bank account must be of type "asset"');
                }

                $attachmentPath = null;
                if ($attachment) {
                    $attachmentPath = $this->handleFileUpload($attachment);
                }

                $createdPayrolls = [];
                $errors          = [];

                foreach ($data['items'] as $index => $item) {
                    try {
                        $employee = $this->employee->findOrFail($item['employeeId']);

                        if ($employee->outlet_id !== (int) $data['outletId']) {
                            throw new Exception("Employee does not belong to the selected outlet");
                        }

                        $existingPayroll = $this->payroll
                            ->byEmployeeId($item['employeeId'])
                            ->byPeriod((int) $data['year'], (int) $data['month'])
                            ->whereIn('status', ['draft', 'paid'])
                            ->first();

                        if ($existingPayroll) {
                            throw new Exception("Gaji untuk karyawan {$employee->name} sudah ada pada " . $existingPayroll->getPeriodLabel());
                        }

                        $payroll = $this->payroll->create([
                            'employee_id'          => $item['employeeId'],
                            'bank_account_id'      => $data['bankAccountId'],
                            'month'                => $data['month'],
                            'year'                 => $data['year'],
                            'payment_date'         => $data['paymentDate'],
                            'transaction_number'   => Payroll::generateTransactionNumber($data['outletId']),
                            'payment_method'       => $data['paymentMethod'],
                            'type'                 => count($data['items']) > 1 ? 'bulk' : 'single',
                            'base_salary'          => $item['baseSalary'],
                            'total_allowance'      => $item['totalAllowance'],
                            'total_commission'     => $item['totalCommission'],
                            'total_overtime'       => $item['totalOvertimeAllowance'] ?? 0,
                            'total_loan_deduction' => $item['totalLoanDeduction'],
                            'total_fine'           => $item['totalFine'],
                            'net_salary'           => $item['netSalary'],
                            'status'               => 'paid',
                            'note'                 => $data['note'] ?? null,
                            'attachment'           => $attachmentPath,
                        ]);

                        $this->createPayrollItem($payroll, 'Gaji Pokok', 'earning', 'salary', $item['baseSalary']);

                        if (!empty($item['totalAllowance']) && $item['totalAllowance'] > 0) {
                            $this->createPayrollItem($payroll, 'Tunjangan', 'earning', 'allowance', $item['totalAllowance']);
                        }

                        if (!empty($item['totalCommission']) && $item['totalCommission'] > 0) {
                            $this->createPayrollItem($payroll, 'Komisi', 'earning', 'commission', $item['totalCommission']);
                        }

                        if (!empty($item['totalOvertimeAllowance']) && $item['totalOvertimeAllowance'] > 0) {
                            $this->createPayrollItem($payroll, 'Lembur', 'earning', 'allowance', $item['totalOvertimeAllowance']);
                        }

                        if (!empty($item['totalFine']) && $item['totalFine'] > 0 && !empty($item['fineLogIds'])) {
                            foreach ($item['fineLogIds'] as $fineLogId) {
                                $fineLog = $this->fineLog->find($fineLogId);
                                if ($fineLog) {
                                    $fineItem = $this->createPayrollItem(
                                        $payroll,
                                        'Denda: ' . ($fineLog->fine->name ?? 'Denda'),
                                        'deduction',
                                        'fine',
                                        (float)$fineLog->amount,
                                        FineLog::class,
                                        $fineLog->id
                                    );

                                    $fineLog->update([
                                        'payroll_item_id' => $fineItem->id,
                                    ]);
                                }
                            }
                        }

                        if (!empty($item['totalLoanDeduction']) && $item['totalLoanDeduction'] > 0 && !empty($item['loanLogs'])) {
                            foreach ($item['loanLogs'] as $loanEntry) {
                                $loanLog = $this->loanLog->find($loanEntry['id']);
                                if ($loanLog) {
                                    $loanItem = $this->createPayrollItem(
                                        $payroll,
                                        'Potongan Kasbon: ' . ($loanLog->loan->note ?? 'Kasbon'),
                                        'deduction',
                                        'loan',
                                        (float)$loanEntry['amount'],
                                        LoanLog::class,
                                        $loanLog->id
                                    );

                                    $loanLog->update([
                                        'payroll_item_id' => $loanItem->id,
                                        'payment_date' => $data['paymentDate'],
                                        'amount' => $loanEntry['amount'],
                                    ]);

                                    $loan = $loanLog->loan;
                                    $newRemainingAmount = $loan->remaining_amount - $loanEntry['amount'];
                                    $loan->update([
                                        'remaining_amount' => $newRemainingAmount,
                                        'status' => $newRemainingAmount <= 0 ? 'paid' : 'ongoing',
                                    ]);
                                }
                            }
                        }

                        if (!empty($item['commissionLogIds'])) {
                            $commissionItem = $this->payrollItem->where('payroll_id', $payroll->id)
                                ->where('category', 'commission')
                                ->first();

                            if ($commissionItem) {
                                $this->workLog->whereIn('id', $item['commissionLogIds'])
                                    ->update(['payroll_item_id' => $commissionItem->id]);
                            }
                        }

                        if ($payroll->status === 'paid') {
                            $this->accountingService->recordPayroll($payroll);
                        }

                        $createdPayrolls[] = $payroll;

                        Log::info('Payroll created successfully', [
                            'payroll_id'   => $payroll->id,
                            'employee_id'  => $employee->id,
                            'employee_name' => $employee->name,
                            'net_salary'   => $payroll->net_salary,
                            'type'         => $payroll->type,
                        ]);
                    } catch (Exception $e) {
                        $errors[] = [
                            'index'       => $index,
                            'employee_id' => $item['employeeId'] ?? null,
                            'error'       => $e->getMessage(),
                        ];

                        Log::error('Failed to create individual payroll', [
                            'index'       => $index,
                            'employee_id' => $item['employeeId'] ?? null,
                            'error'       => $e->getMessage(),
                            'type'        => 'payroll_service_error',
                        ]);
                    }
                }

                if (empty($createdPayrolls)) {
                    throw new Exception('All payroll creation failed');
                }

                if (!empty($errors)) {
                    Log::warning('Some payrolls failed to create', [
                        'total_items'   => count($data['items']),
                        'success_count' => count($createdPayrolls),
                        'error_count'   => count($errors),
                        'errors'        => $errors,
                        'type'          => 'payroll_warning',
                    ]);
                }

                return [
                    'success'       => true,
                    'created_count' => count($createdPayrolls),
                    'error_count'   => count($errors),
                    'payrolls'      => $createdPayrolls,
                    'errors'        => $errors,
                ];
            } catch (Exception $e) {
                if (isset($attachmentPath) && $attachmentPath) {
                    Storage::delete($attachmentPath);
                }

                Log::error('Failed to create payroll', [
                    'data'  => $data,
                    'error' => $e->getMessage(),
                    'type'  => 'payroll_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function update(int $id, array $data, ?UploadedFile $attachment = null): Payroll
    {
        return DB::transaction(function () use ($id, $data, $attachment) {
            try {
                $payroll       = $this->payroll->findOrFail($id);
                $oldAttachment = $payroll->attachment;

                if ($payroll->status !== 'draft') {
                    throw new Exception('Only draft payrolls can be updated');
                }

                $updateData = [];

                if ($attachment) {
                    if ($oldAttachment && Storage::exists($oldAttachment)) {
                        Storage::delete($oldAttachment);
                    }
                    $updateData['attachment'] = $this->handleFileUpload($attachment);
                }

                if (isset($data['note'])) {
                    $updateData['note'] = $data['note'];
                }

                if (isset($data['status']) && in_array($data['status'], ['draft', 'paid', 'cancelled'])) {
                    $updateData['status'] = $data['status'];
                }

                if (!empty($updateData)) {
                    $payroll->update($updateData);
                }

                Log::info('Payroll updated successfully', [
                    'payroll_id'     => $payroll->id,
                    'updated_fields' => array_keys($updateData),
                    'type'           => 'payroll_action',
                ]);

                return $payroll->fresh();
            } catch (Exception $e) {
                Log::error('Failed to update payroll', [
                    'payroll_id' => $id,
                    'error'      => $e->getMessage(),
                    'type'       => 'payroll_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $payroll = $this->payroll->findOrFail($id);

                if ($payroll->status !== 'draft') {
                    throw new Exception('Only draft payrolls can be deleted');
                }

                if ($payroll->attachment && Storage::exists($payroll->attachment)) {
                    Storage::delete($payroll->attachment);
                }

                $this->accountingService->reverseJournalEntry(Payroll::class, $payroll->id);

                $deleted = $payroll->delete();

                Log::info('Payroll deleted successfully', [
                    'payroll_id' => $id,
                    'type'       => 'payroll_action',
                ]);

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete payroll', [
                    'payroll_id' => $id,
                    'error'      => $e->getMessage(),
                    'type'       => 'payroll_service_error',
                ]);
                throw $e;
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Private — Calculation & Helpers
    |--------------------------------------------------------------------------
    */

    private function calculatePayrollData(Employee $employee, string $startDate, string $endDate): array
    {
        try {
            $monthlySalaries = $this->employeeSalary
                ->byEmployeeId($employee->id)
                ->monthly()
                ->active()
                ->with('salary')
                ->get();

            $baseSalary      = $monthlySalaries->sum('amount');
            $salaryBreakdown = $monthlySalaries->map(fn($s) => [
                'id'               => $s->id,
                'name'             => $s->salary->name ?? 'Gaji',
                'type'             => 'monthly',
                'amount'           => $s->amount,
                'calculatedAmount' => $s->amount,
                'description'      => $s->salary->description ?? '',
            ])->toArray();

            $dailyAllowances  = $this->employeeSalary
                ->byEmployeeId($employee->id)
                ->daily()
                ->active()
                ->with('salary')
                ->get();

            $assumedWorkDays  = 30; // TODO: Integrate with Attendance
            $totalAllowance   = 0;
            $allowanceBreakdown = [];

            foreach ($dailyAllowances as $allowance) {
                $calculatedAmount = $allowance->amount * $assumedWorkDays;
                $totalAllowance  += $calculatedAmount;

                $allowanceBreakdown[] = [
                    'id'               => $allowance->id,
                    'name'             => $allowance->salary->name ?? 'Tunjangan',
                    'type'             => 'daily',
                    'amount'           => $allowance->amount,
                    'workDays'         => $assumedWorkDays,
                    'calculatedAmount' => $calculatedAmount,
                    'description'      => $allowance->salary->description ?? '',
                ];
            }

            $startDateObj = Carbon::parse($startDate);
            $year = $startDateObj->year;
            $month = $startDateObj->month;

            $commissionLogs = $this->workLog
                ->byEmployeeId($employee->id)
                ->byPeriod($year, $month)
                ->unpaid()
                ->with('employeeProcessCommission.employeeProcess.process')
                ->get();

            $totalCommission = $commissionLogs->sum('total_amount');
            $commissionLogIds = $commissionLogs->pluck('id')->toArray();
            $commissionDetails = $commissionLogs->map(fn($log) => [
                'id'          => $log->id,
                'date'        => $log->created_at?->toDateString(),
                'description' => $log->employeeProcessCommission?->employeeProcess?->process?->name ?? 'Komisi',
                'amount'      => (float) $log->total_amount,
            ])->toArray();

            $fines = $this->fineLog
                ->byEmployeeId($employee->id)
                ->byOutletId($employee->outlet_id)
                ->unpaid()
                ->between('date', [$startDate, $endDate])
                ->get();

            $totalFine  = $fines->sum('amount');
            $fineLogIds = $fines->pluck('id')->toArray();

            $scheduledLoanLogs = LoanLog::query()
                ->whereHas('loan', fn($q) => $q->byEmployeeId($employee->id)->byOutletId($employee->outlet_id)->ongoing())
                ->byType('repayment')
                ->bySource('payroll')
                ->whereNull('payroll_item_id')
                ->where('scheduled_month', (int) $month)
                ->where('scheduled_year', (int) $year)
                ->with('loan')
                ->get();

            $loanDeductionAmount = 0;
            $loanLogsData = [];

            foreach ($scheduledLoanLogs as $log) {
                $deduction = min((float) $log->amount, (float) $log->loan->remaining_amount);
                $loanDeductionAmount += $deduction;
                $loanLogsData[] = [
                    'id' => $log->id,
                    'amount' => $deduction,
                    'loan_id' => $log->loan_id
                ];
            }

            $grossSalary    = $baseSalary + $totalAllowance + $totalCommission;
            $totalDeduction = $totalFine + $loanDeductionAmount;
            $netSalary      = $grossSalary - $totalDeduction;

            return [
                'employeeId'          => $employee->id,
                'employeeName'        => $employee->name,
                'employeeCode'        => $employee->username,
                'baseSalary'          => $baseSalary,
                'totalAllowance'      => $totalAllowance,
                'totalCommission'     => $totalCommission,
                'totalOvertimeAllowance' => 0,
                'grossSalary'         => $grossSalary,
                'totalFine'           => $totalFine,
                'totalLoanDeduction'  => $loanDeductionAmount,
                'totalDeduction'      => $totalDeduction,
                'netSalary'           => $netSalary,
                'loanLogs'            => $loanLogsData,
                'loanDeductionAmount' => $loanDeductionAmount,
                'salaryBreakdown'     => $salaryBreakdown,
                'allowanceBreakdown'  => $allowanceBreakdown,
                'commissionLogIds'    => $commissionLogIds,
                'commissionDetails'   => $commissionDetails,
                'fineLogIds'          => $fineLogIds,
                'fineDetails'         => $fines->map(fn($f) => [
                    'id'          => $f->id,
                    'date'        => $f->date,
                    'fineName'    => $f->fine->name ?? 'N/A',
                    'reason'      => $f->reason,
                    'amount'      => $f->amount,
                ]),
            ];
        } catch (Exception $e) {
            Log::error('Failed to calculate payroll data', [
                'employee_id' => $employee->id,
                'start_date'  => $startDate,
                'end_date'    => $endDate,
                'error'       => $e->getMessage(),
                'type'        => 'payroll_calculation_error',
            ]);
            throw new Exception("Failed to calculate payroll for employee {$employee->name}: " . $e->getMessage());
        }
    }

    private function calculateSummary(array $payrollItems): array
    {
        return [
            'employee_count'       => count($payrollItems),
            'total_gross_salary'   => array_sum(array_column($payrollItems, 'grossSalary')),
            'total_net_salary'     => array_sum(array_column($payrollItems, 'netSalary')),
            'total_deduction'      => array_sum(array_column($payrollItems, 'totalDeduction')),
            'total_commission'     => array_sum(array_column($payrollItems, 'totalCommission')),
            'total_fine'           => array_sum(array_column($payrollItems, 'totalFine')),
            'total_loan_deduction' => array_sum(array_column($payrollItems, 'totalLoanDeduction')),
        ];
    }

    private function createPayrollItem(
        Payroll $payroll,
        string $name,
        string $type,
        string $category,
        float $amount,
        ?string $referenceType = null,
        ?int $referenceId = null
    ): PayrollItem {
        return $this->payrollItem->create([
            'payroll_id'     => $payroll->id,
            'name'           => $name,
            'type'           => $type,
            'category'       => $category,
            'amount'         => $amount,
            'reference_type' => $referenceType,
            'reference_id'   => $referenceId,
        ]);
    }

    private function handleFileUpload(UploadedFile $file): string
    {
        try {
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            return $file->storeAs('payrolls', $filename, 'public');
        } catch (Exception $e) {
            Log::error('Failed to upload payroll attachment', [
                'error'     => $e->getMessage(),
                'file_name' => $file->getClientOriginalName(),
                'type'      => 'payroll_service_error',
            ]);
            throw new Exception('Failed to upload attachment: ' . $e->getMessage());
        }
    }

    protected function applyFilters(Builder $query, array $filters = []): void
    {
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['outletId'])) {
            $query->byOutletId($filters['outletId']);
        }

        if (!empty($filters['employeeId'])) {
            $query->byEmployeeId($filters['employeeId']);
        }

        if (!empty($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['paymentMethod'])) {
            $query->byPaymentMethod($filters['paymentMethod']);
        }

        if (!empty($filters['month']) && !empty($filters['year'])) {
            $query->byMonthFilter((int) $filters['year'], (int) $filters['month']);
        }

        if (!empty($filters['paymentDateFrom'])) {
            $query->paymentDateFrom($filters['paymentDateFrom']);
        }

        if (!empty($filters['paymentDateTo'])) {
            $query->paymentDateTo($filters['paymentDateTo']);
        }

        if (isset($filters['minNetSalary']) && $filters['minNetSalary'] !== '') {
            $query->where('net_salary', '>=', $filters['minNetSalary']);
        }

        if (isset($filters['maxNetSalary']) && $filters['maxNetSalary'] !== '') {
            $query->where('net_salary', '<=', $filters['maxNetSalary']);
        }

        if (!empty($filters['sortBy'])) {
            $query->orderBy($filters['sortBy'], $filters['sortDirection'] ?? 'desc');
        }
    }
}
