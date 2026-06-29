<?php

namespace App\Http\Resources\Position;

use App\Http\Resources\Employee\EmployeeResource;
use App\Http\Resources\EmployeePosition\EmployeePositionResource;
use App\Http\Resources\Outlet\OutletResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PositionResource extends JsonResource
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
            'outletId' => $this->outlet_id ? (int) $this->outlet_id : null,
            'name' => $this->name ? (string) $this->name : null,
            'slug' => $this->slug ? (string) $this->slug : null,
            'description' => $this->description ? (string) $this->description : null,
            'isDefault' => (bool) $this->is_default,
            'isActive' => (bool) $this->is_active,
            'permissions' => $this->relationLoaded('permissions')
                ? $this->permissions->pluck('permission_key')->toArray()
                : [],
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'deletedAt' => $this->deleted_at?->toISOString(),

            'outlet' => OutletResource::make($this->whenLoaded('outlet')),
            'employeePositions' => EmployeePositionResource::collection($this->whenLoaded('employeePositions')),
            'employees' => EmployeeResource::collection($this->whenLoaded('employees')),

        ];
    }
}
