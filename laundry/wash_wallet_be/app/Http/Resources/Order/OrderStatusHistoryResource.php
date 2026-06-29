<?php

namespace App\Http\Resources\Order;

use App\Http\Resources\Employee\EmployeeResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderStatusHistoryResource extends JsonResource
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
            'orderId' => (int) $this->order_id,
            'employeeId' => $this->employee_id ? (int) $this->employee_id : null,
            'actorType' => $this->actor_type ? (string) $this->actor_type : 'employee',
            'actorLabel' => $this->actor_label ? (string) $this->actor_label : null,
            'fromStatus' => $this->from_status ? (string) $this->from_status : null,
            'fromStatusLabel' => $this->from_status_label ? (string) $this->from_status_label : null,
            'toStatus' => (string) $this->to_status,
            'toStatusLabel' => (string) $this->to_status_label,
            'notes' => $this->notes ? (string) $this->notes : null,
            'metadata' => $this->metadata ? (array) $this->metadata : null,
            'description' => $this->status_change_description ? (string) $this->status_change_description : null,
            'employee' => EmployeeResource::make($this->whenLoaded('employee')),
            'createdAt' => $this->created_at->toISOString(),
            'formattedCreatedAt' => $this->formatted_created_at ? (string) $this->formatted_created_at : null,
            'timeAgo' => $this->time_ago ? (string) $this->time_ago : null,
        ];
    }
}
