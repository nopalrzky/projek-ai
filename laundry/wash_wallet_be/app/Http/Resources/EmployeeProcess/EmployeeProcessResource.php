<?php

namespace App\Http\Resources\EmployeeProcess;

use App\Http\Resources\Employee\EmployeeResource;
use App\Http\Resources\EmployeeProcessCommission\EmployeeProcessCommissionResource;
use App\Http\Resources\Process\ProcessResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeProcessResource extends JsonResource
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
      'processId' => (int) $this->process_id,
      'isActive' => (bool) $this->is_active,
      'notes' => $this->notes ? (string) $this->notes : null,
      'assignedAt' => $this->assigned_at?->toISOString(),
      'formattedAssignedAt' => $this->assigned_at ? (string) $this->assigned_at->format('d M Y H:i') : null,
      'canWork' => (bool) $this->canWork(),
      'hasCommission' => (bool) $this->hasCommission(),
      'commissionAmount' => $this->getCommissionAmount() !== null ? (float) $this->getCommissionAmount() : null,

      'employee' => EmployeeResource::make($this->whenLoaded('employee')),
      'process' => ProcessResource::make($this->whenLoaded('process')),
      'commission' => EmployeeProcessCommissionResource::make($this->whenLoaded('commission')),

      'createdAt' => $this->created_at?->toISOString(),
      'updatedAt' => $this->updated_at?->toISOString(),
      'formattedCreatedAt' => $this->created_at ? (string) $this->created_at->format('d M Y H:i') : null,
      'formattedUpdatedAt' => $this->updated_at ? (string) $this->updated_at->format('d M Y H:i') : null,
    ];
  }
}
