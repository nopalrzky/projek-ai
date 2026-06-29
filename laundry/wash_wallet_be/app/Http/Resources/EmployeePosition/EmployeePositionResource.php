<?php

namespace App\Http\Resources\EmployeePosition;

use App\Http\Resources\Employee\EmployeeResource;
use App\Http\Resources\Position\PositionResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeePositionResource extends JsonResource
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
            'positionId' => (int) $this->position_id,
            'isActive' => (bool) $this->is_active,
            'employee' => EmployeeResource::make($this->whenLoaded('employee')),
            'position' => PositionResource::make($this->whenLoaded('position')),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'deletedAt' => $this->deleted_at?->toISOString(),
        ];
    }
}
