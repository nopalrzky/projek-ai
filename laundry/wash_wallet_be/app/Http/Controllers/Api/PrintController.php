<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PrintService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class PrintController extends Controller
{
    public function __construct(
        private readonly PrintService $printService
    ) {}

    /**
     * Get order data and coin availability for printing.
     */
    public function info(int $orderId): JsonResponse
    {
        try {
            $order = $this->printService->getOrderData($orderId);
            $outlet = $order->employee->outlet ?? null;

            if (!$outlet) {
                return $this->errorResponse('Outlet tidak ditemukan untuk order ini.', 404);
            }

            $receiptAvailability = $this->printService->checkCoinAvailability($outlet, 'print_receipt');
            $labelAvailability   = $this->printService->checkCoinAvailability($outlet, 'print_label');

            return $this->successResponse([
                'order' => [
                    'id'                   => $order->id,
                    'orderNumber'          => $order->order_number,
                    'orderDate'            => $order->order_date,
                    'estimatedCompletion'  => $order->estimated_completion,
                    'paymentStatus'        => $order->payment_status,
                    'subtotal'             => (float) $order->subtotal,
                    'discountAmount'       => (float) $order->discount_amount,
                    'taxAmount'            => (float) $order->tax_amount,
                    'totalAmount'          => (float) $order->total_amount,
                    'paidAmount'           => (float) $order->paid_amount,
                    'remainingAmount'      => (float) ($order->total_amount - $order->paid_amount),
                ],
                'customer' => [
                    'name'  => $order->customer->name ?? 'Pelanggan',
                    'phone' => $order->customer->phone ?? '-',
                ],
                'outlet' => [
                    'name'    => $outlet->name,
                    'address' => $outlet->address ?? '-',
                ],
                'orderItems' => $order->orderItems->map(function ($item) {
                    return [
                        'laundryServiceName' => $item->laundry_service_name ?? ($item->laundryService->name ?? 'Service'),
                        'quantity'           => (float) $item->quantity,
                        'unitName'           => $item->unit_name ?? ($item->laundryService->unit->name ?? ''),
                        'unitPrice'          => (float) $item->unit_price,
                        'totalAmount'        => (float) $item->total_amount,
                    ];
                }),
                'cashierName' => $order->employee->name ?? 'Kasir',
                'printReceipt' => [
                    'coinPrice' => $receiptAvailability['coin_price'],
                    'featureActive' => $receiptAvailability['feature_active'],
                    'hasEnoughCoin' => $receiptAvailability['has_enough_coin'],
                    'coinSource' => $receiptAvailability['coin_source'],
                    'outletCoinBalance' => $receiptAvailability['outlet_coin_balance'],
                    'ownerCoinBalance' => $receiptAvailability['owner_coin_balance'],
                ],
                'printLabel' => [
                    'coinPrice' => $labelAvailability['coin_price'],
                    'featureActive' => $labelAvailability['feature_active'],
                    'hasEnoughCoin' => $labelAvailability['has_enough_coin'],
                    'coinSource' => $labelAvailability['coin_source'],
                    'outletCoinBalance' => $labelAvailability['outlet_coin_balance'],
                    'ownerCoinBalance' => $labelAvailability['owner_coin_balance'],
                ],
            ], 'Print info retrieved successfully');
        } catch (Exception $e) {
            Log::error('Api/PrintController: info failed', [
                'order_id' => $orderId,
                'error'    => $e->getMessage(),
            ]);

            return $this->errorResponse('Gagal memuat info cetak: ' . $e->getMessage(), 500, $e);
        }
    }

    /**
     * Process coin debit for printing receipt.
     */
    public function processReceipt(int $orderId): JsonResponse
    {
        return $this->processPrint($orderId, 'print_receipt');
    }

    /**
     * Process coin debit for printing label.
     */
    public function processLabel(int $orderId): JsonResponse
    {
        return $this->processPrint($orderId, 'print_label');
    }

    /**
     * Common process for printing coin debit.
     */
    private function processPrint(int $orderId, string $featureKey): JsonResponse
    {
        try {
            $order = $this->printService->getOrderData($orderId);
            $outlet = $order->employee->outlet ?? null;

            if (!$outlet) {
                return $this->errorResponse('Outlet tidak ditemukan untuk order ini.', 404);
            }

            $result = $this->printService->processPrint($order, $outlet, $featureKey);

            if (isset($result['success']) && !$result['success']) {
                return $this->errorResponse($result['message'] ?? 'Gagal memproses cetak.', 400);
            }

            return $this->successResponse([
                'coinDeducted' => $result['coin_deducted'] ?? 0,
                'coinSource' => $result['coin_source'] ?? null,
                'remainingCoin' => $result['remaining_coin'] ?? 0,
            ], $result['message'] ?? 'Print processed successfully');
        } catch (Exception $e) {
            Log::error('Api/PrintController: processPrint failed', [
                'order_id'    => $orderId,
                'feature_key' => $featureKey,
                'error'       => $e->getMessage(),
            ]);

            $statusCode = 500;
            if (str_contains($e->getMessage(), 'Saldo coin tidak mencukupi')) {
                $statusCode = 422;
            } elseif (str_contains($e->getMessage(), 'sedang tidak aktif')) {
                $statusCode = 403;
            }

            return $this->errorResponse($e->getMessage(), $statusCode, $e);
        }
    }
}
