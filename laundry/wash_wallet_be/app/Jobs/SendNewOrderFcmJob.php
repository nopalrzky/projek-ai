<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\FcmNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SendNewOrderFcmJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(
        public readonly int $orderId
    ) {}

    public function handle(FcmNotificationService $fcmService): void
    {
        $order = Order::query()
            ->with(['customer', 'outlet'])
            ->find($this->orderId);

        if (!$order) {
            Log::warning("SendNewOrderFcmJob: order #{$this->orderId} not found.");
            return;
        }

        $isCustomerOrder = $order->source === Order::SOURCE_CUSTOMER_APP;
        $hasOutlet = $order->outlet_id !== null;
        $isNewStatus = in_array($order->status, [
            Order::STATUS_REQUESTED,
            Order::STATUS_PENDING_DROPOFF,
        ], true);

        if (!$isCustomerOrder || !$hasOutlet || !$isNewStatus) {
            Log::info("SendNewOrderFcmJob: order #{$this->orderId} does not match cashier notification criteria.", [
                'source' => $order->source,
                'outlet_id' => $order->outlet_id,
                'status' => $order->status,
            ]);
            return;
        }

        $orderNumber = $order->order_number ?? '#' . $order->id;
        $customerName = $order->customer?->name;

        $fcmService->sendToOutletCashiers(
            outletId: (int) $order->outlet_id,
            title: 'Order Baru Masuk',
            body: 'Order ' . $orderNumber . ' dari ' . ($customerName ?? 'customer') . ' menunggu diproses.',
            data: [
                'type' => 'cashier_new_order',
                'eventId' => (string) Str::uuid(),
                'orderId' => (string) $order->id,
                'orderNumber' => $orderNumber,
                'outletId' => (string) $order->outlet_id,
                'status' => $order->status,
                'customerName' => $customerName,
                'deliveryType' => $order->delivery_type,
                'createdAt' => $order->created_at?->toIso8601String(),
            ],
        );
    }
}
