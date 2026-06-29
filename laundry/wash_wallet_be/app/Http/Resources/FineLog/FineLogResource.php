<?php

namespace App\Http\Resources\FineLog;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Employee\EmployeeResource;
use App\Http\Resources\Fine\FineResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\Payroll\PayrollResource;

class FineLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'employeeId' => (int) $this->employee_id,
            'fineId' => (int) $this->fine_id,
            'outletId' => (int) $this->outlet_id,
            'payrollId' => $this->payrollItem?->payroll_id ? (int) $this->payrollItem->payroll_id : null,
            'date' => $this->date?->translatedFormat('d M Y'),
            'amount' => (float) $this->amount,
            'formattedAmount' => 'Rp ' . number_format($this->amount, 0, ',', '.'),
            'reason' => $this->reason ? (string) $this->reason : null,
            'attachment' => $this->attachment ? (string) $this->attachment : null,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : ($this->status ? (string) $this->status : null),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'deletedAt' => $this->deleted_at?->toISOString(),

            // Relations
            'employee' => EmployeeResource::make($this->whenLoaded('employee')),
            'fine' => FineResource::make($this->whenLoaded('fine')),
            'outlet' => OutletResource::make($this->whenLoaded('outlet')),
            'payroll' => $this->payrollItem?->payroll ? PayrollResource::make($this->payrollItem->payroll) : null,

        ];
    }
}
