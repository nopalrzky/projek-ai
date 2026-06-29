<?php

namespace App\Http\Resources\OrderItemProcess;

use App\Http\Resources\Employee\EmployeeResource;
use App\Http\Resources\LaundryServiceProcess\LaundryServiceProcessResource;
use App\Http\Resources\OrderItem\OrderItemResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemProcessResource extends JsonResource
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
            'orderItemId' => (int) $this->order_item_id,
            'laundryServiceProcessId' => (int) $this->laundry_service_process_id,
            'employeeId' => $this->employee_id ? (int) $this->employee_id : null,
            'qtyProcessed' => (float) $this->qty_processed,
            'evidenceAttachment' => $this->evidence_attachment ? (string) $this->evidence_attachment : null,
            'evidenceUrl' => $this->evidence_attachment ? (string) asset('storage/' . $this->evidence_attachment) : null,
            'hasEvidence' => (bool) $this->hasEvidence(),
            'startedAt' => $this->started_at?->toISOString(),
            'completedAt' => $this->completed_at?->toISOString(),
            'formattedStartedAt' => $this->started_at ? (string) $this->started_at->format('d M Y H:i') : null,
            'formattedCompletedAt' => $this->completed_at ? (string) $this->completed_at->format('d M Y H:i') : null,
            'isCompleted' => (bool) $this->isCompleted(),
            'isInProgress' => (bool) $this->isInProgress(),
            'isPending' => (bool) $this->isPending(),
            'processName' => $this->when($this->relationLoaded('laundryServiceProcess') && $this->laundryServiceProcess?->relationLoaded('process') && $this->laundryServiceProcess->process, fn() => (string) $this->laundryServiceProcess->process->name),
            'sequenceNumber' => $this->whenLoaded('laundryServiceProcess', fn() => (int) $this->laundryServiceProcess->sequence),
            'employeeName' => $this->whenLoaded('employee', fn() => (string) $this->employee->name),

            'processingDuration' => $this->getProcessingDuration() ? (string) $this->getProcessingDuration() : null,
            'completionPercentage' => (float) $this->getCompletionPercentage(),
            'commissionAmount' => $this->calculateCommission() !== null ? (float) $this->calculateCommission() : null,

            'orderItem' => $this->whenLoaded('orderItem', fn() => OrderItemResource::make($this->orderItem)),
            'laundryServiceProcess' => $this->whenLoaded('laundryServiceProcess', fn() => LaundryServiceProcessResource::make($this->laundryServiceProcess)),
            'employee' => $this->whenLoaded('employee', fn() => EmployeeResource::make($this->employee)),

            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'formattedCreatedAt' => $this->created_at ? (string) $this->created_at->format('d M Y H:i') : null,
            'formattedUpdatedAt' => $this->updated_at ? (string) $this->updated_at->format('d M Y H:i') : null,
        ];
    }
}
