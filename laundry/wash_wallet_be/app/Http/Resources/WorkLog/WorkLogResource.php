<?php

namespace App\Http\Resources\WorkLog;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                => (int) $this->id,
            'orderItemProcessId'=> (int) $this->order_item_process_id,
            'employeeId'        => (int) $this->employee_id,
            'processId'         => (int) $this->process_id,
            'employeeProcessId' => (int) $this->employee_process_id,
            'payrollItemId'     => $this->payroll_item_id ? (int) $this->payroll_item_id : null,
            'amount'            => (float) $this->amount,
            'formattedAmount'   => (string) ('Rp ' . number_format($this->amount, 0, ',', '.')),
            'type'              => (string) $this->type,
            'date'              => $this->worked_at ? (string) $this->worked_at->translatedFormat('d M Y') : null,
            'workedAt'          => $this->worked_at?->toISOString(),
            'createdAt'         => $this->created_at?->toISOString(),
            'updatedAt'         => $this->updated_at?->toISOString(),
        ];
    }
}
