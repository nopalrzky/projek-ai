<?php

namespace App\Http\Resources\LoanLog;

use App\Http\Resources\Account\AccountResource;
use App\Http\Resources\Payroll\PayrollResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoanLogResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => (int) $this->id,
      'loanId' => (int) $this->loan_id,
      'type' => $this->type ? (string) $this->type : null,
      'source' => $this->source ? (string) $this->source : null,
      'paymentMethod' => $this->source === 'payroll' ? 'salary_deduction' : ($this->source ? (string) $this->source : null),
      'payrollId' => $this->payrollItem?->payroll_id ? (int) $this->payrollItem->payroll_id : null,
      'depositAccountId' => $this->deposit_account_id ? (int) $this->deposit_account_id : null,
      'amount' => (float) $this->amount,
      'paymentDate' => $this->payment_date?->format('Y-m-d'),
      'note' => $this->note ? (string) $this->note : null,
      'createdAt' => $this->created_at?->toISOString(),
      'updatedAt' => $this->updated_at?->toISOString(),
      'deletedAt' => $this->deleted_at?->toISOString(),

      'payroll' => $this->payrollItem?->payroll ? PayrollResource::make($this->payrollItem->payroll) : null,
      'depositAccount' => AccountResource::make($this->whenLoaded('depositAccount')),
    ];
  }
}
