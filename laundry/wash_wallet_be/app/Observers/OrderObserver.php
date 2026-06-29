<?php

namespace App\Observers;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Services\FcmNotificationService;
use Illuminate\Support\Facades\Auth;

class OrderObserver
{
    public function __construct(
        protected FcmNotificationService $fcmService
    ) {}

    /**
     * Handle the Order "created" event.
     */
    public function created(Order $order): void
    {
        $this->logStatusHistory($order, null, $order->status);
    }

    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order): void
    {
        if ($order->isDirty('status')) {
            $this->logStatusHistory($order, $order->getOriginal('status'), $order->status);
            $this->handleStatusChange($order);
        }

        if ($order->isDirty('payment_status')) {
            $this->handlePaymentStatusChange($order);
        }
    }

    protected function logStatusHistory(Order $order, ?string $fromStatus, string $toStatus): void
    {
        if ($order->wasAutoAccepted) {
            OrderStatusHistory::logSystemStatusChange(
                $order->id,
                $fromStatus,
                $toStatus,
                $order->notes ?? null,
                ['source' => 'auto_accept_order']
            );

            return;
        }

        OrderStatusHistory::logStatusChange(
            $order->id,
            $order->updated_by ?? Auth::id() ?? $order->employee_id ?? 1,
            $fromStatus,
            $toStatus,
            $order->notes ?? null
        );
    }

    protected function handleStatusChange(Order $order): void
    {
        $status = $order->status;
        $customerAccount = $order->customerAccount;

        if (!$customerAccount) {
            return;
        }

        $title = "Update Pesanan #{$order->order_number}";
        $body = "";
        $waBody = "";
        $data = [
            'order_id' => (string) $order->id,
            'type' => 'order_status_update',
            'status' => $status,
        ];

        switch ($status) {
            case Order::STATUS_ACCEPTED:
                $body = "Pesanan Anda telah diterima oleh outlet. Kami akan segera memprosesnya.";
                break;
            case Order::STATUS_READY_TO_PROCESS:
                $formattedAmount = 'Rp ' . number_format($order->total_amount, 0, ',', '.');
                $body = "Pesanan Anda sudah ditimbang dan siap dikerjakan. Total: {$formattedAmount}. Anda bisa melakukan pembayaran kapan saja.";
                break;
            case Order::STATUS_READY:
                $body = "Pakaian Anda sudah bersih dan siap diambil!";
                break;
            case Order::STATUS_DELIVERING:
                $body = "Pesanan Anda sedang dalam perjalanan ke alamat Anda.";
                break;
            case Order::STATUS_DELIVERED:
                $body = "Pesanan Anda telah sampai di tujuan.";
                break;
            case Order::STATUS_COMPLETED:
                $formattedAmount = 'Rp ' . number_format($order->total_amount, 0, ',', '.');
                if ($order->payment_method === 'cod') {
                    if ($order->delivery_type === Order::DELIVERY_TYPE_PICKUP) {
                        $body = "Pesanan #{$order->order_number} sudah selesai! Silakan ambil di outlet. Mohon bawa uang pas: {$formattedAmount}.";
                        $waBody = $body;
                    } else {
                        $body = "Pesanan selesai. Silakan atur jadwal pengantaran.";
                        $waBody = $body;
                    }
                } else {
                    if ($order->delivery_type === Order::DELIVERY_TYPE_PICKUP) {
                        if ($order->payment_status === Order::PAYMENT_STATUS_PAID || $order->payment_status === Order::PAYMENT_STATUS_PAID_BY_PACKAGE) {
                            $body = "Pesanan selesai & sudah dibayar. Silakan ambil di outlet.";
                        } else {
                            $body = "Pesanan selesai. Lakukan pembayaran sebelum mengambil pesanan.";
                        }
                        $waBody = $body;
                    } else {
                        if ($order->payment_status === Order::PAYMENT_STATUS_PAID || $order->payment_status === Order::PAYMENT_STATUS_PAID_BY_PACKAGE) {
                            $body = "Pesanan selesai. Silakan atur jadwal pengantaran.";
                        } else {
                            $body = "Pesanan selesai. Selesaikan pembayaran untuk menentukan waktu pengantaran.";
                        }
                        $waBody = $body;
                    }
                }
                break;
            case Order::STATUS_PICKING_UP:
                $body = "Kurir kami sedang menuju ke lokasi Anda untuk menjemput pesanan.";
                break;
            case Order::STATUS_PICKED_UP:
                $body = "Cucian Anda sudah diambil. Kurir sedang menuju outlet.";
                break;
            case Order::STATUS_RECEIVED:
                $body = "Cucian Anda sudah sampai di outlet dan menunggu ditimbang.";
                break;
            case Order::STATUS_CANCELLED:
                $body = "Pesanan Anda telah dibatalkan.";
                break;
            case Order::STATUS_REJECTED:
                $body = "Pesanan Anda ditolak oleh outlet.";
                break;
            default:
                return;
        }

        if ($body) {
            $this->fcmService->sendToCustomer($customerAccount, $title, $body, $data);
        }

        if ($waBody) {
            $this->sendWaIfEnabled($order, $waBody);
        }
    }

    private function sendWaIfEnabled(Order $order, string $message): void
    {
        $waService = app(\App\Services\WaNotificationService::class);
        $outlet = $order->outlet;
        if (!$outlet) return;

        $availability = $waService->checkCoinAvailability($outlet);
        if (!$availability['enough']) {
            \Illuminate\Support\Facades\Log::info('WA skipped: insufficient coin', ['order_id' => $order->id]);
            return;
        }

        $waService->sendRawMessage($order, $outlet, $message);
    }

    protected function handlePaymentStatusChange(Order $order): void
    {
        $paymentStatus = $order->payment_status;
        $customerAccount = $order->customerAccount;

        if (!$customerAccount) {
            return;
        }

        if ($paymentStatus === Order::PAYMENT_STATUS_PAID || $paymentStatus === Order::PAYMENT_STATUS_PAID_BY_PACKAGE) {
            $title = "Pembayaran Berhasil";
            $body = "Terima kasih! Pembayaran untuk pesanan #{$order->order_number} telah kami terima.";
            $data = [
                'order_id' => (string) $order->id,
                'type' => 'payment_success',
            ];

            $this->fcmService->sendToCustomer($customerAccount, $title, $body, $data);
        }
    }
}
