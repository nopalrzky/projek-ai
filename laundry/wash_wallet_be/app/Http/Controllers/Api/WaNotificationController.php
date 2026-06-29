<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\WaNotificationService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class WaNotificationController extends Controller
{
    public function __construct(
        private readonly WaNotificationService $waNotificationService
    ) {}

    /**
     * Preview notification message and check coin availability.
     */
    public function preview(int $orderId): JsonResponse
    {
        try {
            $order = Order::with(['customer', 'orderItems.laundryService', 'employee.outlet'])->findOrFail($orderId);
            $outlet = $order->employee->outlet;

            $template = WaNotificationService::getTemplateForStatus($order->status) ?? WaNotificationService::DEFAULT_TEMPLATE;
            $message  = $this->waNotificationService->resolveTemplate(
                $template,
                $order,
                $outlet
            );
            $availability = $this->waNotificationService->checkCoinAvailability($outlet);

            return $this->successResponse([
                'orderId'           => $order->id,
                'customerName'      => $order->customer->name ?? 'Pelanggan',
                'customerPhone'     => $order->customer->phone ?? null,
                'hasPhone'          => !empty($order->customer->phone),
                'messagePreview'    => $message,
                'coinPrice'         => $availability['price'],
                'hasEnoughCoin'     => $availability['enough'],
                'coinSource'        => $availability['source'],
                'outletCoinBalance' => (int) $outlet->coin_balance,
                'ownerCoinBalance'  => (int) $outlet->owner->coin_balance,
            ], 'Preview generated successfully');
        } catch (Exception $e) {
            Log::error('Api/WaNotificationController: Preview failed', [
                'order_id' => $orderId,
                'error'    => $e->getMessage(),
            ]);

            return $this->errorResponse('Gagal memuat pratinjau notifikasi: ' . $e->getMessage(), 500, $e);
        }
    }

    /**
     * Send notification, deduct coin, and record journal.
     */
    public function send(int $orderId): JsonResponse
    {
        try {
            $order = Order::with('employee.outlet')->findOrFail($orderId);
            $outlet = $order->employee->outlet;

            $result = $this->waNotificationService->sendOrderNotification($order, $outlet);

            if (isset($result['success']) && !$result['success']) {
                return $this->errorResponse($result['message'] ?? 'Gagal mengirim notifikasi.', 400);
            }

            return $this->successResponse([
                'coinDeducted'  => $result['coin_deducted'] ?? 0,
                'coinSource'    => $result['coin_source'] ?? '',
                'remainingCoin' => $result['remaining_coin'] ?? 0,
            ], $result['message'] ?? 'Notifikasi berhasil dikirim');
        } catch (Exception $e) {
            Log::error('Api/WaNotificationController: Send failed', [
                'order_id' => $orderId,
                'error'    => $e->getMessage(),
            ]);

            $statusCode = ($e->getMessage() === "Saldo coin tidak mencukupi.") ? 422 : 500;

            return $this->errorResponse($e->getMessage(), $statusCode, $e);
        }
    }
}
