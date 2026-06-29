<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CustomerOrderAccepted implements ShouldBroadcast, ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $eventId;

    public function __construct(public readonly Order $order)
    {
        $this->eventId = 'accept-' . $order->id;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('customer.' . $this->order->customer_account_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'customer.order.accepted';
    }

    public function broadcastWith(): array
    {
        return [
            'type' => 'customer_order_accepted',
            'eventId' => $this->eventId,
            'orderId' => (string) $this->order->id,
            'orderNumber' => $this->order->order_number ?? '#' . $this->order->id,
            'outletId' => (string) $this->order->outlet_id,
            'outletName' => $this->order->outlet?->name ?? '',
            'status' => $this->order->status,
            'pickupSchedule' => $this->order->pickup_schedule?->toIso8601String(),
            'formattedPickupSchedule' => $this->order->getFormattedPickupSchedule(),
            'createdAt' => now()->toIso8601String(),
        ];
    }
}
