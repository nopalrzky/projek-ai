<?php

namespace App\Http\Resources\EmployeeProcessCommission;

use App\Http\Resources\Employee\EmployeeResource;
use App\Http\Resources\Process\ProcessResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeProcessCommissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'employeeProcessId' => (int) $this->employee_process_id,
            'employeeId' => $this->employeeProcess?->employee_id ? (int) $this->employeeProcess->employee_id : null,
            'processId' => $this->employeeProcess?->process_id ? (int) $this->employeeProcess->process_id : null,
            'commissionType' => (string) $this->commission_type,
            'commissionValue' => (float) $this->commission_value,
            'hasTarget' => (bool) $this->has_target,
            'targetThreshold' => $this->target_threshold !== null ? (int) $this->target_threshold : null,
            'bonusAmount' => $this->bonus_amount !== null ? (float) $this->bonus_amount : null,
            'rules' => $this->rules,
            'effectiveDate' => $this->effective_date?->toISOString(),
            'isActive' => (bool) $this->is_active,
            'employee' => EmployeeResource::make($this->when(
                $this->relationLoaded('employeeProcess') && $this->employeeProcess?->relationLoaded('employee'),
                $this->employeeProcess?->employee
            )),
            'process' => ProcessResource::make($this->when(
                $this->relationLoaded('employeeProcess') && $this->employeeProcess?->relationLoaded('process'),
                $this->employeeProcess?->process
            )),
            'processName' => $this->when(
                $this->relationLoaded('employeeProcess') && $this->employeeProcess?->relationLoaded('process') && $this->employeeProcess?->process,
                $this->employeeProcess?->process?->name
            ),
            'employeeName' => $this->when(
                $this->relationLoaded('employeeProcess') && $this->employeeProcess?->relationLoaded('employee') && $this->employeeProcess?->employee,
                $this->employeeProcess?->employee?->name
            ),
            'commissionTypeLabel' => $this->getCommissionTypeLabel(),
            'formattedCommissionValue' => $this->getFormattedCommissionValue(),
            'formattedBonusAmount' => $this->bonus_amount
                ? 'Rp ' . number_format($this->bonus_amount, 0, ',', '.')
                : null,
            'formattedTargetThreshold' => $this->target_threshold
                ? number_format($this->target_threshold, 0, ',', '.')
                : null,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'deletedAt' => $this->deleted_at?->toISOString(),
        ];
    }

    protected function getCommissionTypeLabel(): string
    {
        return match ($this->commission_type) {
            'per_item' => 'Per Item',
            'per_kg' => 'Per Kg',
            'percentage' => 'Persentase',
            'flat' => 'Nominal Tetap',
            default => ucfirst(str_replace('_', ' ', $this->commission_type)),
        };
    }

    protected function getFormattedCommissionValue(): string
    {
        return match ($this->commission_type) {
            'percentage' => number_format($this->commission_value, 2, ',', '.') . '%',
            'per_item', 'per_kg', 'flat' => 'Rp ' . number_format($this->commission_value, 0, ',', '.'),
            default => (string) $this->commission_value,
        };
    }
}
