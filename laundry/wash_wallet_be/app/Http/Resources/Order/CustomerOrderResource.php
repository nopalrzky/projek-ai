<?php

namespace App\Http\Resources\Order;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerOrderResource extends JsonResource
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
            'orderNumber'        => (string) $this->order_number,
            'status'             => (string) $this->status,
            'statusLabel'        => (string) $this->getCustomerStatusLabel(),
            'paymentMethod'      => $this->payment_method ? (string) $this->payment_method : null,
            'paymentStatus'      => (string) $this->payment_status,
            'paymentStatusLabel' => (string) $this->getPaymentStatusLabel(),
            'pickupAddress'      => $this->pickup_address ? (string) $this->pickup_address : null,
            'pickupSchedule'     => $this->pickup_schedule ? $this->pickup_schedule->toISOString() : null,
            'pickupFee'          => (float) $this->pickup_fee,
            'notes'              => $this->notes ? (string) $this->notes : null,
            'outlet'             => $this->whenLoaded('outlet', fn() => [
                'id'      => (int) $this->outlet_id,
                'name'    => (string) $this->outlet->name,
                'address' => $this->outlet->address ? (string) $this->outlet->address : null,
                'phone'   => $this->outlet->phone ? (string) $this->outlet->phone : null,
            ]),
            'orderItems' => $this->whenLoaded('orderItems', fn() => $this->orderItems->map(fn($item) => [
                'id'                 => (int) $item->id,
                'laundryServiceId'   => (int) $item->laundry_service_id,
                'laundryServiceName' => (string) $item->laundry_service_name,
                'categoryName'       => (string) $item->category_name,
                'unitName'           => (string) $item->unit_name,
            ])),
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }

    private function getCustomerStatusLabel(): string
    {
        return match ($this->status) {
            Order::STATUS_ACCEPTED => 'Siap Dijemput',
            Order::STATUS_PICKING_UP => 'Dalam Perjalanan',
            Order::STATUS_PICKED_UP => 'Sudah Diambil',
            Order::STATUS_RECEIVED => 'Cucian di Outlet',
            default => $this->getStatusLabel(),
        };
    }
}
