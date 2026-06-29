<?php

namespace App\Http\Resources\EmployeeSalary;

use App\Http\Resources\Employee\EmployeeResource;
use App\Http\Resources\Salary\SalaryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeSalaryResource extends JsonResource
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
            'salaryId' => (int) $this->salary_id,
            'amount' => (float) $this->amount,
            'type' => $this->type ? (string) $this->type : null,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : ($this->status ? (string) $this->status : null),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'employee' => EmployeeResource::make($this->whenLoaded('employee')),
            'salary' => SalaryResource::make($this->whenLoaded('salary')),
        ];
    }
}
