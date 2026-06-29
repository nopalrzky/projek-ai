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

class SendCustomerOrderAcceptedFcm implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(public readonly int $orderId) {}

    public function handle(FcmNotificationService $fcmService): void
    {
        $order = Order::query()
            ->with(['customerAccount', 'customer', 'outlet'])
            ->find($this->orderId);

        if (!$order || !$order->customerAccount) {
            Log::warning("SendCustomerOrderAcceptedFcm: order #{$this->orderId} or customer account not found.");
            return;
        }

        if (!$this->matchesCriteria($order)) {
            Log::info("SendCustomerOrderAcceptedFcm: order #{$this->orderId} does not match criteria.", [
                'source' => $order->source,
                'delivery_type' => $order->delivery_type,
                'status' => $order->status,
                'customer_account_id' => $order->customer_account_id,
            ]);
            return;
        }

        $fcmService->sendOrderAcceptedToCustomer(
            $order->customerAccount,
            $order,
            'accept-' . $order->id,
        );
    }

    private function matchesCriteria(Order $order): bool
    {
        return $order->source === Order::SOURCE_CUSTOMER_APP
            && $order->pickup_schedule !== null
            && $order->status === Order::STATUS_ACCEPTED
            && $order->customer_account_id !== null;
    }
}
