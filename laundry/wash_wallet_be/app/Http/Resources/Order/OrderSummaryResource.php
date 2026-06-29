<?php

namespace App\Http\Resources\Order;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => (int) $this->id,
            'orderNumber'         => (string) $this->order_number,
            'customerName'        => $this->whenLoaded('customer', fn() => $this->customer?->name, null),
            'customerId'          => (int) $this->customer_id,
            'status'              => (string) $this->status,
            'statusLabel'         => (string) $this->getStatusLabel(),
            'statusBadgeVariant'  => (string) $this->getStatusBadgeVariant(),
            'paymentStatus'       => (string) $this->payment_status,
            'paymentStatusLabel' => (string) $this->getPaymentStatusLabel(),
            'totalAmount'         => (float) $this->total_amount,
            'remainingAmount'     => (float) $this->remaining_amount,
            'orderDate'           => $this->order_date ? (string) $this->order_date : null,
            'createdAt'           => $this->created_at->toISOString(),
        ];
    }
}
