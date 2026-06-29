<?php

namespace App\Http\Resources\Loan;

use App\Http\Resources\Account\AccountResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Employee\EmployeeResource;
use App\Http\Resources\LoanLog\LoanLogResource;
use App\Http\Resources\Outlet\OutletResource;

class LoanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'employeeId' => (int) $this->employee_id,
            'outletId' => $this->employee?->outlet_id ? (int) $this->employee->outlet_id : null,
            'sourceAccountId' => $this->source_account_id ? (int) $this->source_account_id : null,
            'amount' => (float) $this->amount,
            'remainingAmount' => (float) $this->remaining_amount,
            'paidAmount' => (float) $this->paid_amount,
            'totalInstallments' => (int) $this->total_installments,
            'repaymentType' => $this->repayment_type ? (string) $this->repayment_type : null,
            'installmentAmount' => $this->installment_amount !== null ? (float) $this->installment_amount : null,
            'installmentPeriod' => $this->installment_period !== null ? (int) $this->installment_period : null,
            'loanDate' => $this->loan_date ? (string) $this->loan_date->format('Y-m-d') : null,
            'dueDate' => $this->due_date ? (string) $this->due_date->format('Y-m-d') : null,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : ($this->status ? (string) $this->status : null),
            'isPaid' => (bool) $this->is_paid,
            'progressPercentage' => (float) $this->progress_percentage,
            'remainingInstallments' => (int) $this->calculateRemainingInstallments(),
            'note' => $this->note ? (string) $this->note : null,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'deletedAt' => $this->deleted_at?->toISOString(),
 
            'employee' => $this->whenLoaded('employee', fn() => EmployeeResource::make($this->employee)),
            'outlet' => $this->when(
                $this->relationLoaded('employee') && $this->employee?->relationLoaded('outlet') && $this->employee->outlet,
                fn() => OutletResource::make($this->employee->outlet)
            ),
            'sourceAccount' => $this->whenLoaded('sourceAccount', fn() => AccountResource::make($this->sourceAccount)),
            'loanLogs' => LoanLogResource::collection($this->whenLoaded('loanLogs')),
            'loanLogCount' => $this->whenLoaded('loanLogs', fn() => $this->loanLogs?->count() ?? 0),
 
            'repaymentTypeLabel' => $this->repayment_type_label ? (string) $this->repayment_type_label : null,
            'statusLabel' => $this->status_label ? (string) $this->status_label : null,
            'formattedAmount' => (string) ('Rp ' . number_format((float) $this->amount, 0, ',', '.')),
            'formattedRemainingAmount' => (string) ('Rp ' . number_format((float) $this->remaining_amount, 0, ',', '.')),
            'formattedPaidAmount' => (string) ('Rp ' . number_format((float) $this->paid_amount, 0, ',', '.')),
            'formattedInstallmentAmount' => $this->installment_amount !== null
                ? (string) ('Rp ' . number_format($this->installment_amount, 0, ',', '.'))
                : null,
        ];
    }
}
