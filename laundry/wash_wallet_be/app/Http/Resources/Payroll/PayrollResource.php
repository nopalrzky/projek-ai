<?php

namespace App\Http\Resources\Payroll;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\Employee\EmployeeResource;
use App\Http\Resources\Account\AccountResource;
use App\Http\Resources\FineLog\FineLogResource;
use App\Http\Resources\PayrollItem\PayrollItemResource;
use App\Http\Resources\WorkLog\WorkLogResource;

class PayrollResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => (int) $this->id,
            'outletId'            => $this->when($this->relationLoaded('employee') && $this->employee, fn() => (int) $this->employee->outlet_id),
            'employeeId'          => $this->employee_id ? (int) $this->employee_id : null,
            'bankAccountId'       => $this->bank_account_id ? (int) $this->bank_account_id : null,
            'month'               => (int) $this->month,
            'year'                => (int) $this->year,
            'paymentDate'         => $this->payment_date?->toISOString(),
            'transactionNumber'   => $this->transaction_number ? (string) $this->transaction_number : null,
            'paymentMethod'       => $this->payment_method ? (string) $this->payment_method : null,
            'type'                => (string) $this->type,
            'baseSalary'          => (float) $this->base_salary,
            'totalAllowance'      => (float) $this->total_allowance,
            'totalCommission'     => (float) $this->total_commission,
            'totalOvertime'       => (float) $this->total_overtime,
            'totalLoanDeduction'  => (float) $this->total_loan_deduction,
            'totalFine'           => (float) $this->total_fine,
            'netSalary'           => (float) $this->net_salary,
            'status'              => (string) $this->status,
            'note'                => $this->note ? (string) $this->note : null,
            'attachment'          => $this->attachment ? (string) $this->attachment : null,
            'attachmentUrl'       => $this->attachment ? (string) asset('storage/' . $this->attachment) : null,
            'hasAttachment'       => (bool) $this->attachment,
            'createdAt'           => $this->created_at?->toISOString(),
            'updatedAt'           => $this->updated_at?->toISOString(),
            'deletedAt'           => $this->deleted_at?->toISOString(),
 
            'grossSalary'         => (float) $this->getGrossSalary(),
            'totalDeduction'      => (float) $this->getTotalDeduction(),
 
            'formattedBaseSalary'      => (string) ('Rp ' . number_format($this->base_salary, 0, ',', '.')),
            'formattedGrossSalary'     => (string) ('Rp ' . number_format($this->getGrossSalary(), 0, ',', '.')),
            'formattedTotalDeduction'  => (string) ('Rp ' . number_format($this->getTotalDeduction(), 0, ',', '.')),
            'formattedNetSalary'       => (string) ('Rp ' . number_format($this->net_salary, 0, ',', '.')),
            'formattedPaymentDate'     => $this->payment_date ? (string) $this->payment_date->translatedFormat('d M Y') : null,
            'periodLabel'              => (string) $this->getPeriodLabel(),
            'statusLabel'              => (string) $this->getStatusLabel(),
            'statusColor'              => (string) $this->getStatusColor(),
            'paymentMethodLabel'       => $this->getPaymentMethodLabel() ? (string) $this->getPaymentMethodLabel() : null,
            'typeLabel'                => (string) $this->getTypeLabel(),
 
            'employeeName'    => $this->whenLoaded('employee', fn() => (string) $this->employee->name),
            'employeeCode'    => $this->whenLoaded('employee', fn() => (string) $this->employee->username),
            'outletName'      => $this->when(
                $this->relationLoaded('employee') && $this->employee?->relationLoaded('outlet') && $this->employee->outlet,
                fn() => (string) $this->employee->outlet->name
            ),
            'bankAccountName' => $this->whenLoaded('bankAccount', fn() => (string) $this->bankAccount->name),
 
            'outlet'          => $this->when(
                $this->relationLoaded('employee') && $this->employee?->relationLoaded('outlet') && $this->employee->outlet,
                fn() => OutletResource::make($this->employee->outlet)
            ),
            'employee'        => $this->whenLoaded('employee', fn() => EmployeeResource::make($this->employee)),
            'bankAccount'     => $this->whenLoaded('bankAccount', fn() => AccountResource::make($this->bankAccount)),
            'payrollDetails'  => PayrollItemResource::collection($this->whenLoaded('payrollItems')),
            'workLogs'        => WorkLogResource::collection($this->whenLoaded('workLogs')),
            'fineLogs'        => FineLogResource::collection($this->whenLoaded('fineLogs')),
 
            'isDraft'      => (bool) $this->isDraft(),
            'isPaid'       => (bool) $this->isPaid(),
            'isCancelled'  => (bool) $this->isCancelled(),
            'canBeUpdated' => (bool) $this->isDraft(),
            'canBeDeleted' => (bool) $this->isDraft(),
        ];
    }

    private function getTypeLabel(): string
    {
        return match ($this->type) {
            'single' => 'Per Karyawan',
            'bulk'   => 'Massal',
            default  => ucfirst($this->type ?? '-'),
        };
    }
}
