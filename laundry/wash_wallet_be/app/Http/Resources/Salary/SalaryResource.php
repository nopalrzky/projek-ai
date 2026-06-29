<?php

namespace App\Http\Resources\Salary;

use App\Http\Resources\EmployeeSalary\EmployeeSalaryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalaryResource extends JsonResource
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
            'type' => $this->type ? (string) $this->type : null,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'deletedAt' => $this->deleted_at?->toISOString(),

            'employeeSalaries' => EmployeeSalaryResource::collection($this->whenLoaded('employeeSalaries')),
            'employeeSalariesCount' => $this->whenLoaded('employeeSalaries', fn() => $this->employeeSalaries->count(), 0),
        ];
    }
}
