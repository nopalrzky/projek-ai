<?php

namespace App\Http\Resources\Order;

use App\Http\Resources\Employee\EmployeeResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderPaymentLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                 => (int) $this->id,
            'orderId'            => (int) $this->order_id,
            'employeeId'         => $this->employee_id ? (int) $this->employee_id : null,
            'amount'             => (float) $this->amount,
            'formattedAmount'    => $this->getFormattedAmount(),
            'paymentMethod'      => $this->payment_method ? (string) $this->payment_method : null,
            'paymentMethodLabel' => $this->getPaymentMethodLabel() ? (string) $this->getPaymentMethodLabel() : null,
            'referenceNumber'    => $this->reference_number ? (string) $this->reference_number : null,
            'notes'              => $this->notes ? (string) $this->notes : null,
            'employee'           => $this->whenLoaded('employee', fn() => EmployeeResource::make($this->employee)),
            'createdAt'          => $this->created_at->toISOString(),
            'formattedCreatedAt' => $this->created_at ? (string) $this->created_at->format('d M Y, H:i') : null,
            'canBeDeleted'       => (bool) $this->canBeDeletedByPeriod(),
        ];
    }
}
