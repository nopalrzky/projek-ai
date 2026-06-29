<?php

namespace App\Http\Resources\Process;

use App\Http\Resources\Employee\EmployeeResource;
use App\Http\Resources\EmployeeProcessCommission\EmployeeProcessCommissionResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\LaundryService\LaundryServiceResource;
use App\Http\Resources\LaundryServiceProcess\LaundryServiceProcessResource;

class ProcessResource extends JsonResource
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
            'name' => $this->name ? (string) $this->name : null,
            'description' => $this->description ? (string) $this->description : null,
            'isActive' => (bool) $this->is_active,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'deletedAt' => $this->deleted_at?->toISOString(),

            'laundryServices' => LaundryServiceResource::collection($this->whenLoaded('laundryServices')),
            'laundryServicesCount' => $this->whenLoaded('laundryServices', fn() => $this->laundryServices->count(), 0),
            'employees' => EmployeeResource::collection($this->whenLoaded('employees')),
            'employeesCount' => $this->whenLoaded('employees', fn() => $this->employees->count(), 0),

            'laundryServiceProcesses' => LaundryServiceProcessResource::collection($this->whenLoaded('laundryServiceProcesses')),
            'employeeProcessCommissions' => EmployeeProcessCommissionResource::collection($this->whenLoaded('employeeProcessCommissions')),
        ];
    }
}
