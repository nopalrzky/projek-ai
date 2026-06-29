<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class CashierNewOrderCreated implements ShouldBroadcast, ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $eventId;

    public function __construct(public readonly Order $order)
    {
        $this->eventId = (string) Str::uuid();
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('outlet.' . $this->order->outlet_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'cashier.new-order.created';
    }

    public function broadcastWith(): array
    {
        $customer = $this->order->customer;

        return [
            'type' => 'cashier_new_order',
            'eventId' => $this->eventId,
            'orderId' => (string) $this->order->id,
            'orderNumber' => $this->order->order_number ?? '#' . $this->order->id,
            'outletId' => (string) $this->order->outlet_id,
            'status' => $this->order->status,
            'customerName' => $customer?->name,
            'deliveryType' => $this->order->delivery_type,
            'createdAt' => $this->order->created_at?->toIso8601String(),
        ];
    }
}
