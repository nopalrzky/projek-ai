<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CourierNewPickupBroadcast implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Order $order,
        public readonly string $eventId
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('outlet.' . $this->order->outlet_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'courier.new-pickup';
    }

    public function broadcastWith(): array
    {
        $customerName = $this->order->customerAccount?->name
            ?? $this->order->customer?->name
            ?? 'Pelanggan';

        return [
            'type' => 'courier_new_pickup',
            'eventId' => $this->eventId,
            'orderId' => (string) $this->order->id,
            'orderNumber' => $this->order->order_number ?? '#' . $this->order->id,
            'outletId' => (string) $this->order->outlet_id,
            'outletName' => $this->order->outlet?->name ?? '',
            'customerName' => $customerName,
            'pickupAddress' => $this->order->pickup_address ?? '',
            'pickupSchedule' => $this->order->pickup_schedule?->toIso8601String(),
            'formattedPickupSchedule' => $this->order->getFormattedPickupSchedule(),
            'status' => $this->order->status,
            'createdAt' => now()->toIso8601String(),
        ];
    }
}
