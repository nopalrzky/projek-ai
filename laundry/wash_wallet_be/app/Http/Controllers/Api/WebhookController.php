<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OrderService;
use App\Services\TopupService;
use App\Services\CustomerTopupService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(
        private readonly TopupService $topupService,
        private readonly OrderService $orderService,
        private readonly CustomerTopupService $customerTopupService
    ) {}

    public function handleMidtrans(Request $request)
    {
        $payload = $request->all();
        $orderId = $payload['order_id'] ?? null;
        $status  = $payload['transaction_status'] ?? null;

        Log::info('Midtrans Webhook Received', [
            'order_id' => $orderId,
            'status'   => $status,
            'payload'  => $payload,
        ]);

        if (!$orderId || !$status) {
            return $this->errorResponse('Invalid payload', 400);
        }

        $updated = false;

        try {
            $updated = $this->topupService->updatePaymentStatus($orderId, $status);
        } catch (\Exception $e) {
            Log::info('Not an outlet topup, trying next handler', ['order_id' => $orderId]);
        }

        if (!$updated) {
            try {
                $updated = $this->orderService->handlePaymentWebhook($orderId, $status);
            } catch (\Exception $e) {
                Log::info('Not an order payment, trying next handler', ['order_id' => $orderId]);
            }
        }

        if (!$updated) {
            try {
                $updated = $this->customerTopupService->updatePaymentStatus($orderId, $status);
            } catch (\Exception $e) {
                Log::error('All webhook handlers failed', [
                    'order_id' => $orderId,
                    'error'    => $e->getMessage(),
                ]);
            }
        }

        return $this->successResponse([
            'success' => $updated,
            'status'  => $status,
        ], 'Midtrans webhook handled');
    }
}
