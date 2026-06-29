<?php

namespace App\Http\Resources\OrderItem;

use App\Models\EmployeeProcess;
use App\Http\Resources\LaundryService\LaundryServiceResource;
use App\Http\Resources\Order\OrderResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $employee = $request->user();

        $orderItemProcesses = $this->relationLoaded('orderItemProcesses')
            ? $this->orderItemProcesses
            ->sortBy(fn($process) => (int) ($process->laundryServiceProcess?->sequence ?? PHP_INT_MAX))
            ->values()
            : collect();
        // TODO: Prefer preloading `employeeProcesses` from controller/service and pass via the request
        // to avoid database queries inside resources. Fall back to using the relation if it's loaded.
        $assignedProcessIds = [];
        if ($employee && $employee->relationLoaded('employeeProcesses')) {
            $assignedProcessIds = $employee->employeeProcesses
                ->where('is_active', true)
                ->pluck('process_id')
                ->all();
        }

        $canCompleteOrderItem = $orderItemProcesses->every(fn($process) => !is_null($process->completed_at));

        return [
            'id' => (int) $this->id,
            'orderId' => (int) $this->order_id,
            'laundryServiceId' => (int) $this->laundry_service_id,
            'categoryName' => $this->category_name ? (string) $this->category_name : null,
            'laundryServiceName' => $this->laundry_service_name ? (string) $this->laundry_service_name : null,
            'unitName' => $this->unit_name ? (string) $this->unit_name : null,
            'quantity' => (float) $this->quantity,
            'unitPrice' => (float) $this->unit_price,
            'subtotal' => (float) $this->subtotal,
            'discountAmount' => (float) $this->discount_amount,
            'totalAmount' => (float) $this->total_amount,
            'formattedSubtotal' => $this->getFormattedSubtotal(),
            'formattedDiscountAmount' => $this->getFormattedDiscountAmount(),
            'formattedTotalAmount' => $this->getFormattedTotalAmount(),
            'status' => $this->status,
            'completionPercentage' => (int) $this->completion_percentage,
            'itemNotes' => $this->item_notes ? (string) $this->item_notes : null,
            'canCompleteOrderItem' => $canCompleteOrderItem,
            'completeOrderItemReason' => $canCompleteOrderItem ? null : 'Masih ada proses yang belum selesai',
            'processedBy' => $this->processed_by ? (int) $this->processed_by : null,
            'processingData' => $this->processing_data,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'formattedCreatedAt' => $this->getFormattedCreatedAt(),
            'formattedUpdatedAt' => $this->getFormattedUpdatedAt(),

            'order' => OrderResource::make($this->whenLoaded('order')),
            'laundryService' => LaundryServiceResource::make($this->whenLoaded('laundryService')),
            'quotaUsageLog' => \App\Http\Resources\QuotaUsageLog\QuotaUsageLogResource::make($this->whenLoaded('quotaUsageLog')),

            'orderItemProcesses' => $orderItemProcesses->map(function ($process) use ($orderItemProcesses, $assignedProcessIds) {
                $processId = $process->laundryServiceProcess?->process_id;
                $sequenceNumber = (int) ($process->laundryServiceProcess?->sequence ?? 0);
                $canWork = $processId ? in_array($processId, $assignedProcessIds, true) : false;

                $status = 'pending';
                if (!is_null($process->completed_at)) {
                    $status = 'done';
                } elseif (!is_null($process->started_at)) {
                    $status = 'processing';
                }

                $hasPreviousIncompleteProcess = $orderItemProcesses->contains(function ($otherProcess) use ($process, $sequenceNumber) {
                    if ($otherProcess->id === $process->id) {
                        return false;
                    }

                    $otherSequence = (int) ($otherProcess->laundryServiceProcess?->sequence ?? 0);
                    return $otherSequence > 0
                        && $otherSequence < $sequenceNumber
                        && is_null($otherProcess->completed_at);
                });

                $canStart = $status === 'pending' && !$hasPreviousIncompleteProcess && $canWork;
                $canComplete = $status === 'processing' && $canWork;

                $actionDeniedReason = null;
                if (!$canWork) {
                    $actionDeniedReason = 'Employee tidak memiliki akses untuk proses ini';
                } elseif ($status === 'pending' && $hasPreviousIncompleteProcess) {
                    $actionDeniedReason = 'Selesaikan proses sebelumnya terlebih dahulu';
                }

                return [
                    'id' => (int) $process->id,
                    'laundryServiceProcessId' => (int) $process->laundry_service_process_id,
                    'processId' => $processId ? (int) $processId : null,
                    'processName' => $process->laundryServiceProcess?->process?->name,
                    'sequenceNumber' => $sequenceNumber,
                    'status' => $status,
                    'startedAt' => $process->started_at?->toISOString(),
                    'completedAt' => $process->completed_at?->toISOString(),
                    'employeeId' => $process->employee_id ? (int) $process->employee_id : null,
                    'employeeName' => $process->employee?->name,
                    'canStart' => $canStart,
                    'canComplete' => $canComplete,
                    'canWork' => $canWork,
                    'actionDeniedReason' => $actionDeniedReason,
                ];
            })->values()->all(),

        ];
    }

    public function getFormattedTotalAmount(): string
    {
        return 'Rp ' . number_format((float) $this->total_amount, 0, ',', '.');
    }

    public function getFormattedCreatedAt(): string
    {
        return $this->created_at?->format('d M Y H:i') ?? '-';
    }

    public function getFormattedUpdatedAt(): string
    {
        return $this->updated_at?->format('d M Y H:i') ?? '-';
    }
}
