<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Loan;
use App\Models\LoanLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class LoanService extends BaseService
{
    public function __construct(
        protected Loan $loan,
        protected Employee $employee,
        protected LoanLog $loanLog,
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
        array $relations = ['employee.outlet', 'sourceAccount', 'loanLogs.depositAccount']
    ): LengthAwarePaginator|Collection {
        try {
            $query = $this->loan->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get loans', [
                'filters'  => $filters,
                'error'    => $e->getMessage(),
                'user_id'  => Auth::id(),
                'type'     => 'loan_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(
        int $id,
        array $relations = ['employee.outlet', 'sourceAccount', 'loanLogs.depositAccount']
    ): Loan {
        try {
            $query = $this->loan->byId($id);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get loan by ID', [
                'loan_id'  => $id,
                'error'    => $e->getMessage(),
                'user_id'  => Auth::id(),
                'type'     => 'loan_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function store(array $data): Loan
    {
        return DB::transaction(function () use ($data) {
            try {
                $employee = $this->employee->newQuery()->with('outlet')->findOrFail($data['employeeId']);

                if (!empty($data['outletId']) && (int) $employee->outlet_id !== (int) $data['outletId']) {
                    throw new Exception('Karyawan tidak sesuai dengan outlet yang dipilih.');
                }

                $loans = $this->loan->byEmployeeId($employee->id)->active()->get();

                if ($loans->isNotEmpty()) {
                    $totalOutstanding = $loans->sum('remaining_amount');
                    throw new Exception(
                        "Karyawan masih memiliki kasbon aktif sebesar Rp " .
                            number_format($totalOutstanding, 0, ',', '.') .
                            ". Selesaikan hutang lama terlebih dahulu."
                    );
                }

                $totalInstallments = 1;
                $installmentAmount = $data['amount'];
                $dueDate           = null;

                if ($data['repaymentType'] === 'installment' && !empty($data['installmentPeriod'])) {
                    $totalInstallments = (int) $data['installmentPeriod'];
                    $installmentAmount = $data['amount'] / $totalInstallments;
                    $dueDate           = Carbon::parse($data['dueDate'] ?? $data['startRepayment'] ?? $data['loanDate'] ?? now());
                } else {
                    $dueDate = Carbon::parse($data['dueDate'] ?? $data['startRepayment'] ?? $data['loanDate'] ?? now());
                }

                $loan = $this->loan->create([
                    'employee_id'        => $employee->id,
                    'source_account_id'  => $data['sourceAccountId'],
                    'amount'             => $data['amount'],
                    'remaining_amount'   => $data['amount'],
                    'installment_amount' => $installmentAmount,
                    'total_installments' => $totalInstallments,
                    'loan_date'          => $data['loanDate'] ?? Carbon::now(),
                    'due_date'           => $dueDate,
                    'status'             => 'ongoing',
                    'repayment_type'     => $data['repaymentType'],
                    'installment_period' => $data['installmentPeriod'] ?? null,
                    'note'               => $data['note'] ?? null,
                ]);

                if ($loan->repayment_type === 'installment') {
                    $schedules = $this->buildInstallmentSchedule($data, $loan);
                    foreach ($schedules as $schedule) {
                        $loan->loanLogs()->create([
                            'type'            => 'repayment',
                            'source'          => 'payroll',
                            'payroll_item_id' => null,
                            'deposit_account_id' => null,
                            'amount'          => $schedule['amount'],
                            'payment_date'    => Carbon::createFromDate($schedule['year'], $schedule['month'], 1)->endOfMonth()->toDateString(),
                            'scheduled_month' => $schedule['month'],
                            'scheduled_year'  => $schedule['year'],
                            'note'            => "Cicilan bulan " . Carbon::createFromDate($schedule['year'], $schedule['month'], 1)->translatedFormat('F Y'),
                        ]);
                    }
                }

                $this->accountingService->recordLoanDisbursement(
                    $loan->fresh(['employee.outlet', 'sourceAccount'])
                );

                Log::info('Loan created successfully', [
                    'loan_id'            => $loan->id,
                    'employee_id'        => $loan->employee_id,
                    'outlet_id'          => $employee->outlet_id,
                    'amount'             => $loan->amount,
                    'repayment_type'     => $loan->repayment_type,
                    'total_installments' => $loan->total_installments,
                    'user_id'            => Auth::id(),
                    'type'               => 'loan_action',
                ]);

                return $loan->fresh(['employee.outlet', 'sourceAccount', 'loanLogs.depositAccount']);
            } catch (Exception $e) {
                Log::error('Failed to create loan', [
                    'data'    => $data,
                    'error'   => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type'    => 'loan_service_error',
                ]);
                throw $e;
            }
        });
    }

    private function buildInstallmentSchedule(array $data, Loan $loan): array
    {
        $startDate = Carbon::parse($data['loanDate'] ?? now())->addMonth();
        $period    = (int) $data['installmentPeriod'];
        $schedules = [];

        if (($data['installmentMode'] ?? 'auto') === 'custom' && !empty($data['installmentSchedule'])) {
            foreach ($data['installmentSchedule'] as $item) {
                $schedules[] = [
                    'month'  => (int) $item['month'],
                    'year'   => (int) $item['year'],
                    'amount' => (float) $item['amount'],
                ];
            }
        } else {
            $installmentAmount = round($loan->amount / $period, 2);
            $remainder         = $loan->amount - ($installmentAmount * ($period - 1));

            for ($i = 0; $i < $period; $i++) {
                $date      = $startDate->copy()->addMonths($i);
                $amount    = ($i === $period - 1) ? $remainder : $installmentAmount;
                $schedules[] = [
                    'month'  => $date->month,
                    'year'   => $date->year,
                    'amount' => $amount,
                ];
            }
        }

        return $schedules;
    }

    public function update(int $id, array $data): Loan
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $loan      = $this->loan->byId($id)->firstOrFail();
                $oldAmount = $loan->amount;

                if (!$loan->canBeUpdated()) {
                    throw new Exception('Cannot update loan that has payment records');
                }

                $updateData = [];

                if (isset($data['amount'])) {
                    $updateData['amount']           = $data['amount'];
                    $updateData['remaining_amount'] = $data['amount'];
                }

                if (isset($data['repaymentType'])) {
                    $updateData['repayment_type'] = $data['repaymentType'];
                }

                if (isset($data['installmentPeriod'])) {
                    $amount                             = $data['amount'] ?? $loan->amount;
                    $updateData['installment_period']   = $data['installmentPeriod'];
                    $updateData['total_installments']   = $data['installmentPeriod'];
                    $updateData['installment_amount']   = $amount / $data['installmentPeriod'];
                }

                if (isset($data['loanDate'])) {
                    $updateData['loan_date'] = $data['loanDate'];
                }

                if (isset($data['note'])) {
                    $updateData['note'] = $data['note'];
                }

                if (!empty($updateData)) {
                    $loan->update($updateData);
                }

                if (isset($data['amount']) && $oldAmount != $data['amount']) {
                    $this->accountingService->updateJournalEntry('loan', $loan->id, function () use ($loan) {
                        $this->accountingService->recordLoanDisbursement(
                            $loan->fresh(['employee', 'sourceAccount'])
                        );
                    });
                }

                Log::info('Loan updated successfully', [
                    'loan_id'        => $loan->id,
                    'updated_fields' => array_keys($updateData),
                    'amount_changed' => isset($data['amount']) && $oldAmount != $data['amount'],
                    'user_id'        => Auth::id(),
                    'type'           => 'loan_action',
                ]);

                return $loan->fresh(['employee.outlet', 'sourceAccount', 'loanLogs.depositAccount']);
            } catch (Exception $e) {
                Log::error('Failed to update loan', [
                    'loan_id' => $id,
                    'data'    => $data,
                    'error'   => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type'    => 'loan_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $loan = $this->loan->byId($id)->withCount('loanLogs')->firstOrFail();

                if (!$loan->canBeDeleted()) {
                    throw new Exception('Cannot delete loan that has payment records');
                }

                $this->accountingService->reverseJournalEntry('loan', $loan->id);

                $deleted = $loan->delete();

                if ($deleted) {
                    Log::info('Loan deleted successfully', [
                        'loan_id' => $id,
                        'user_id' => Auth::id(),
                        'type'    => 'loan_action',
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete loan', [
                    'loan_id' => $id,
                    'error'   => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type'    => 'loan_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function addPayment(array $data): LoanLog
    {
        return DB::transaction(function () use ($data) {
            try {
                $loan = $this->getById($data['loanId'], ['employee.outlet', 'sourceAccount']);

                if ($loan->status !== 'ongoing') {
                    throw new Exception('Cannot add payment to a loan that is not ongoing');
                }

                if ($data['amount'] <= 0) {
                    throw new Exception('Payment amount must be greater than zero');
                }

                if ($data['amount'] > $loan->remaining_amount) {
                    throw new Exception(sprintf(
                        'Payment amount (Rp %s) exceeds remaining loan balance (Rp %s)',
                        number_format($data['amount'], 0, ',', '.'),
                        number_format((float) $loan->remaining_amount, 0, ',', '.')
                    ));
                }

                if ($data['paymentMethod'] !== 'salary_deduction' && empty($data['depositAccountId'])) {
                    throw new Exception('Deposit account is required for manual payments');
                }

                $loanLog = $loan->loanLogs()->create([
                    'type'               => 'repayment',
                    'source'             => $data['paymentMethod'] === 'salary_deduction' ? 'payroll' : $data['paymentMethod'],
                    'amount'             => $data['amount'],
                    'payment_date'       => $data['paymentDate'] ?? Carbon::now(),
                    'deposit_account_id' => $data['depositAccountId'] ?? null,
                    'note'               => $data['note'] ?? null,
                ]);

                $newRemainingAmount = $loan->remaining_amount - $data['amount'];
                $loan->update([
                    'remaining_amount' => $newRemainingAmount,
                    'status'           => $newRemainingAmount <= 0 ? 'paid' : 'ongoing',
                ]);

                if ($data['paymentMethod'] !== 'salary_deduction') {
                    $this->accountingService->recordLoanLog(
                        $loanLog->fresh(['depositAccount'])
                    );
                }

                Log::info('Loan payment added successfully', [
                    'loan_id'          => $loan->id,
                    'payment_id'       => $loanLog->id,
                    'amount'           => $data['amount'],
                    'payment_method'   => $data['paymentMethod'],
                    'remaining_amount' => $newRemainingAmount,
                    'new_status'       => $loan->status,
                    'user_id'          => Auth::id(),
                    'type'             => 'loan_payment_action',
                ]);

                return $loanLog->fresh(['loan', 'depositAccount']);
            } catch (Exception $e) {
                Log::error('Failed to add loan payment', [
                    'data'    => $data,
                    'error'   => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type'    => 'loan_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function deletePayment(int $paymentId): bool
    {
        return DB::transaction(function () use ($paymentId) {
            try {
                $loanLog = $this->loanLog->newQuery()->with('loan.employee.outlet')->findOrFail($paymentId);
                $loan        = $loanLog->loan;

                if ($loanLog->source === 'payroll') {
                    throw new Exception('Cannot delete payment from salary deduction. Please void the payroll instead.');
                }

                $loan->update([
                    'remaining_amount' => $loan->remaining_amount + $loanLog->amount,
                    'status'           => 'ongoing',
                ]);

                $this->accountingService->reverseJournalEntry(LoanLog::class, $loanLog->id);

                $deleted = $loanLog->delete();

                Log::info('Loan payment deleted successfully', [
                    'loan_id'         => $loan->id,
                    'payment_id'      => $paymentId,
                    'restored_amount' => $loanLog->amount,
                    'user_id'         => Auth::id(),
                    'type'            => 'loan_payment_action',
                ]);

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete loan payment', [
                    'payment_id' => $paymentId,
                    'error'      => $e->getMessage(),
                    'type'       => 'loan_service_error',
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

        if (!empty($filters['employeeId'])) {
            $query->byEmployeeId($filters['employeeId']);
        }

        if (!empty($filters['outletId'])) {
            $query->byOutletId($filters['outletId']);
        }

        if (!empty($filters['status'])) {
            $query->status($filters['status']);
        }

        if (!empty($filters['repaymentType'])) {
            $query->repaymentType($filters['repaymentType']);
        }

        if (!empty($filters['loanDateFrom'])) {
            $query->loanDateFrom(Carbon::parse($filters['loanDateFrom']));
        }

        if (!empty($filters['loanDateTo'])) {
            $query->loanDateTo(Carbon::parse($filters['loanDateTo']));
        }

        if (!empty($filters['minAmount'])) {
            $query->minAmount($filters['minAmount']);
        }

        if (!empty($filters['maxAmount'])) {
            $query->maxAmount($filters['maxAmount']);
        }

        if (!empty($filters['minRemainingAmount'])) {
            $query->minRemainingAmount($filters['minRemainingAmount']);
        }

        if (!empty($filters['maxRemainingAmount'])) {
            $query->maxRemainingAmount($filters['maxRemainingAmount']);
        }

        if (!empty($filters['minInstallmentAmount'])) {
            $query->minInstallmentAmount($filters['minInstallmentAmount']);
        }

        if (!empty($filters['maxInstallmentAmount'])) {
            $query->maxInstallmentAmount($filters['maxInstallmentAmount']);
        }

        $sortBy        = $filters['sortBy'] ?? 'createdAt';
        $sortDirection = $filters['sortDirection'] ?? 'desc';

        $query->sortBy($sortBy, $sortDirection);
    }
}
