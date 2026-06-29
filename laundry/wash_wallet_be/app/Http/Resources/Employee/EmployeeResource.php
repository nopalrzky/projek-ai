<?php

namespace App\Http\Resources\Employee;

use App\Http\Resources\EmployeeSalary\EmployeeSalaryResource;
use App\Http\Resources\EmployeePosition\EmployeePositionResource;
use App\Http\Resources\EmployeeProcess\EmployeeProcessResource;
use App\Http\Resources\FineLog\FineLogResource;
use App\Http\Resources\Loan\LoanResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\Order\OrderResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
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
            'name' => (string) $this->name,
            'username' => (string) $this->username,
            'email' => $this->email ? (string) $this->email : null,
            'phone' => $this->phone ? (string) $this->phone : null,
            'gender' => $this->gender ? (string) $this->gender : null,
            'avatar' => $this->avatar ? (string) $this->avatar : null,
            'formattedGender' => $this->getFormattedGender(),
            'address' => $this->address ? (string) $this->address : null,
            'age' => $this->getAge(),
            'startDate' => $this->start_date ? $this->start_date->format('Y-m-d') : null,
            'dateOfBirth' => $this->date_of_birth ? $this->date_of_birth->format('Y-m-d') : null,
            'isActive' => (bool) $this->is_active,
            'outletId' => $this->outlet_id ? (int) $this->outlet_id : null,
            'cutoffDays' => $this->cutoff_days !== null ? (int) $this->cutoff_days : null,
            'lastLoginAt' => $this->last_login_at?->toISOString(),
            'outlet' => OutletResource::make($this->whenLoaded('outlet')),
            'accessibleOutlets' => $this->when($this->relationLoaded('positions'), function () {
                $map = $this->getOutletPositionMap();
                $accessible = [];
                foreach ($map as $outletId => $positions) {
                    $firstPos = $positions->first();
                    $outletName = $firstPos && $firstPos->relationLoaded('outlet') && $firstPos->outlet 
                        ? $firstPos->outlet->name 
                        : 'Outlet ' . $outletId;
                    
                    $posData = [];
                    foreach ($positions as $pos) {
                        $posData[] = [
                            'positionId'   => (int) $pos->id,
                            'positionName' => (string) $pos->name,
                            'slug'         => (string) $pos->slug,
                            'permissions'  => $pos->relationLoaded('permissions') ? $pos->getPermissionKeys() : [],
                        ];
                    }
                    
                    $accessible[] = [
                        'outletId'   => (int) $outletId,
                        'outletName' => (string) $outletName,
                        'positions'  => $posData,
                    ];
                }
                return $accessible;
            }),
            'employeeSalaries' => EmployeeSalaryResource::collection($this->whenLoaded('employeeSalaries')),
            'employeePositions' => EmployeePositionResource::collection($this->whenLoaded('employeePositions')),
            'employeeProcesses' => EmployeeProcessResource::collection($this->whenLoaded('employeeProcesses')),
            'fineLogs' => FineLogResource::collection($this->whenLoaded('fineLogs')),
            'loans' => LoanResource::collection($this->whenLoaded('loans')),
            'orders' => OrderResource::collection($this->whenLoaded('orders')),
            'employeePositionsCount' => $this->whenLoaded('employeePositions', fn() => $this->employeePositions?->count() ?? 0),
            'employeeProcessesCount' => $this->whenLoaded('employeeProcesses', fn() => $this->employeeProcesses?->count() ?? 0),
            'employeeSalariesCount' => $this->whenLoaded('employeeSalaries', fn() => $this->employeeSalaries?->count() ?? 0),
            'fineLogsCount' => $this->whenLoaded('fineLogs', fn() => $this->fineLogs?->count() ?? 0),
            'loansCount' => $this->whenLoaded('loans', fn() => $this->loans?->count() ?? 0),
            'ordersCount' => $this->whenLoaded('orders', fn() => $this->orders?->count() ?? 0),
            'isEligibleForProduction' => $this->isEligibleForProduction(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'deletedAt' => $this->deleted_at?->toISOString(),


        ];
    }


    /**
     * Get formatted gender
     */
    private function getFormattedGender(): string
    {
        return match ($this->gender) {
            'male' => 'Laki-laki',
            'female' => 'Perempuan',
            default => '-',
        };
    }
}
