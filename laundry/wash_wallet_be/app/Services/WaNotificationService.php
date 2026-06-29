<?php

namespace App\Services;

use App\Models\CoinTransaction;
use App\Models\Feature;
use App\Models\Order;
use App\Models\Outlet;
use Exception;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WaNotificationService extends BaseService
{
    const COIN_RUPIAH_VALUE = 1000;
    const DEFAULT_TEMPLATE = "Halo {customer_name}, order Anda *#{order_number}* di {outlet_name} telah kami terima.\n\n📋 *Detail Pesanan:*\n{order_items}\n\n💰 *Total: Rp {total_amount}*\n⏰ Estimasi selesai: {estimated_completion}\n\nTerima kasih sudah mempercayakan cucian Anda kepada kami! 🙏";

    public function __construct(
        protected FonnteService $fonnteService,
        protected JournalEntryService $journalEntryService,
        protected Feature $feature,
        protected OutletSettingService $outletSettingService
    ) {}

    /**
     * Get coin price for WA notification feature
     */
    public function getCoinPrice(): int
    {
        $feature = $this->feature->where('key', 'wa_order_notification')->first();
        return $feature ? (int) $feature->coin_price : 1;
    }

    /**
     * Check coin availability (outlet or owner)
     */
    public function checkCoinAvailability(Outlet $outlet): array
    {
        $coinPrice = $this->getCoinPrice();
        $owner = $outlet->owner;

        if ($outlet->coin_balance >= $coinPrice) {
            return [
                'source'    => 'outlet',
                'available' => (int) $outlet->coin_balance,
                'price'     => $coinPrice,
                'enough'    => true,
            ];
        }

        if ($owner && $owner->coin_balance >= $coinPrice) {
            return [
                'source'    => 'owner',
                'available' => (int) $owner->coin_balance,
                'price'     => $coinPrice,
                'enough'    => true,
            ];
        }

        return [
            'source'    => null,
            'available' => (int) max($outlet->coin_balance, $owner?->coin_balance ?? 0),
            'price'     => $coinPrice,
            'enough'    => false,
        ];
    }

    /**
     * Build order items string for template resolution
     */
    private function buildOrderItemsString(Collection $orderItems): string
    {
        if ($orderItems->isEmpty()) {
            return "-";
        }

        return $orderItems->map(function ($item) {
            $serviceName = $item->laundry_service_name ?? ($item->laundryService->name ?? 'Service');
            $unitName    = $item->unit_name ?? '';

            return "• {$serviceName} ({$item->quantity} {$unitName}) — Rp " . number_format((float) $item->total_amount, 0, ',', '.');
        })->implode("\n");
    }

    /**
     * Resolve template with order and outlet data
     */
    public function resolveTemplate(string $template, Order $order, Outlet $outlet): string
    {
        $order->loadMissing(['customer', 'orderItems.laundryService']);

        $data = [
            '{customer_name}'        => $order->customer->name ?? 'Pelanggan',
            '{order_number}'         => $order->order_number,
            '{outlet_name}'          => $outlet->name,
            '{order_items}'          => $this->buildOrderItemsString($order->orderItems),
            '{total_amount}'         => number_format((float) $order->total_amount, 0, ',', '.'),
            '{estimated_completion}' => $order->estimated_completion
                ? Carbon::parse($order->estimated_completion)->translatedFormat('l, d M Y')
                : '-',
        ];

        return str_replace(array_keys($data), array_values($data), $template);
    }

    /**
     * Get template based on status
     */
    public static function getTemplateForStatus(string $status): ?string
    {
        $templates = [
            Order::STATUS_ACCEPTED    => "Halo {customer_name}, pesanan Anda *#{order_number}* telah *diterima* di {outlet_name} ✅. Kami akan segera memprosesnya.\n\nTerima kasih! 🙏",
            Order::STATUS_WEIGHING    => "Halo {customer_name}, pesanan Anda *#{order_number}* sudah *selesai ditimbang* ⚖️.\n\n💰 *Total: Rp {total_amount}*\n⏰ Estimasi selesai: {estimated_completion}\n\nSilakan cek detail pesanan Anda di aplikasi. Terima kasih! 🙏",
            Order::STATUS_IN_PROGRESS => "Halo {customer_name}, pesanan Anda *#{order_number}* saat ini *sedang diproses* 🧺.\n\nKami akan memberitahu Anda jika sudah siap. Terima kasih! 🙏",
            Order::STATUS_READY       => "Halo {customer_name}, pesanan Anda *#{order_number}* sudah *siap diambil* di {outlet_name} ✨.\n\nTerima kasih sudah mempercayakan cucian Anda kepada kami! 🙏",
            Order::STATUS_PICKING_UP  => "Halo {customer_name}, kurir kami saat ini sedang dalam perjalanan menuju lokasi Anda untuk menjemput pakaian/laundry Anda 🚚. Mohon ditunggu ya! Terima kasih! 🙏",
            Order::STATUS_DELIVERING  => "Halo {customer_name}, pesanan Anda *#{order_number}* saat ini *sedang diantar* oleh kurir kami 🚚. Kurir kami sedang dalam perjalanan menuju lokasi Anda. Mohon ditunggu ya! Terima kasih! 🙏",
            Order::STATUS_DELIVERED   => "Halo {customer_name}, pesanan Anda *#{order_number}* telah *berhasil dikirim/diantar* 🏠.\n\nSemoga Anda puas dengan layanan kami. Sampai jumpa di pesanan berikutnya! 🙏",
            Order::STATUS_CANCELLED   => "Halo {customer_name}, pesanan Anda *#{order_number}* telah *dibatalkan* ❌.\n\nJika ini adalah kesalahan, silakan hubungi outlet kami. Terima kasih.",
        ];

        return $templates[$status] ?? null;
    }

    /**
     * Send status change notification automatically
     */
    public function sendStatusChangeNotification(Order $order, Outlet $outlet, string $newStatus): ?array
    {
        if (!$this->outletSettingService->isAutoWaNotificationEnabled($outlet->id)) {
            return null;
        }

        $template = self::getTemplateForStatus($newStatus);
        if (!$template) {
            return null;
        }

        $message = $this->resolveTemplate($template, $order, $outlet);

        try {
            return $this->sendRawMessage($order, $outlet, $message);
        } catch (Exception $e) {
            Log::warning('Auto WA notification failed', [
                'order_id' => $order->id,
                'status' => $newStatus,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Send order notification: full flow with transaction
     */
    public function sendOrderNotification(Order $order, Outlet $outlet): array
    {
        return DB::transaction(function () use ($order, $outlet) {
            try {
                $availability = $this->checkCoinAvailability($outlet);
                if (!$availability['enough']) {
                    throw new Exception("Saldo coin tidak mencukupi. Butuh {$availability['price']} coin.");
                }

                $coinPrice = $availability['price'];
                $source    = $availability['source'];

                $template = self::getTemplateForStatus($order->status) ?? self::DEFAULT_TEMPLATE;
                $message  = $this->resolveTemplate($template, $order, $outlet);

                $phone = $order->customer->phone ?? null;
                if (empty($phone)) {
                    throw new Exception("Pelanggan tidak memiliki nomor telepon.");
                }

                $this->fonnteService->sendMessage($phone, $message);

                $coinTransaction = $this->deductCoin($outlet, $source, $coinPrice, $order->id);

                $this->recordJournalEntry($outlet, $coinTransaction, $order);

                Log::info('WA Order Notification sent successfully', [
                    'order_id'       => $order->id,
                    'outlet_id'      => $outlet->id,
                    'source'         => $source,
                    'coin_deducted'  => $coinPrice,
                    'transaction_id' => $coinTransaction->id,
                ]);

                return [
                    'success'        => true,
                    'message'        => "Notifikasi WhatsApp berhasil dikirim ke {$phone}.",
                    'coin_deducted'  => $coinPrice,
                    'coin_source'    => $source,
                    'remaining_coin' => $source === 'outlet' ? $outlet->fresh()->coin_balance : $outlet->owner->fresh()->coin_balance,
                ];
            } catch (Exception $e) {
                Log::error('Failed to send WA notification', [
                    'order_id'  => $order->id,
                    'outlet_id' => $outlet->id,
                    'error'     => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    /**
     * Send raw WA notification: full flow with transaction
     */
    public function sendRawMessage(Order $order, Outlet $outlet, string $message): array
    {
        return DB::transaction(function () use ($order, $outlet, $message) {
            try {
                $availability = $this->checkCoinAvailability($outlet);
                if (!$availability['enough']) {
                    throw new Exception("Saldo coin tidak mencukupi. Butuh {$availability['price']} coin.");
                }

                $coinPrice = $availability['price'];
                $source    = $availability['source'];

                $phone = $order->customer->phone ?? null;
                if (empty($phone)) {
                    throw new Exception("Pelanggan tidak memiliki nomor telepon.");
                }

                $this->fonnteService->sendMessage($phone, $message);

                $coinTransaction = $this->deductCoin($outlet, $source, $coinPrice, $order->id);

                $this->recordJournalEntry($outlet, $coinTransaction, $order);

                Log::info('Raw WA Notification sent successfully', [
                    'order_id'       => $order->id,
                    'outlet_id'      => $outlet->id,
                    'source'         => $source,
                    'coin_deducted'  => $coinPrice,
                    'transaction_id' => $coinTransaction->id,
                ]);

                return [
                    'success'        => true,
                    'message'        => "Notifikasi WhatsApp berhasil dikirim ke {$phone}.",
                    'coin_deducted'  => $coinPrice,
                    'coin_source'    => $source,
                    'remaining_coin' => $source === 'outlet' ? $outlet->fresh()->coin_balance : $outlet->owner->fresh()->coin_balance,
                ];
            } catch (Exception $e) {
                Log::error('Failed to send raw WA notification', [
                    'order_id'  => $order->id,
                    'outlet_id' => $outlet->id,
                    'error'     => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    /**
     * Deduct coin and record transaction
     */
    private function deductCoin(Outlet $outlet, string $source, int $coinPrice, int $orderId): CoinTransaction
    {
        $payer = ($source === 'outlet') ? $outlet : $outlet->owner;

        $payer->coin_balance -= $coinPrice;
        $payer->save();

        return CoinTransaction::create([
            'transaction_number' => 'WA' . strtoupper(bin2hex(random_bytes(4))),
            'user_id'        => $outlet->owner_id,
            'outlet_id'      => $outlet->id,
            'type'           => CoinTransaction::TYPE_WA_NOTIFICATION,
            'amount'         => -$coinPrice,
            'description'    => "Biaya Notifikasi WhatsApp - Order ID: {$orderId}",
            'reference_type' => Order::class,
            'reference_id'   => $orderId,
        ]);
    }

    /**
     * Record journal entry for WA notification cost
     */
    private function recordJournalEntry(Outlet $outlet, CoinTransaction $coinTransaction, Order $order): void
    {
        try {
            $totalAmount = abs($coinTransaction->amount) * self::COIN_RUPIAH_VALUE;

            $expenseAccount = $outlet->accounts()->where('account_role', 'expense')->first();
            $cashAccount    = $outlet->accounts()->where('account_role', 'cash')->first();

            if (!$expenseAccount || !$cashAccount) {
                Log::warning('Journal entry skipped: accounts not found for outlet', [
                    'outlet_id' => $outlet->id,
                    'expense_found' => (bool)$expenseAccount,
                    'cash_found' => (bool)$cashAccount,
                ]);
                return;
            }

            $this->journalEntryService->store([
                'outletId'      => $outlet->id,
                'date'          => now(),
                'description'   => "Biaya Notifikasi WhatsApp - Order #{$order->order_number}",
                'referenceType' => CoinTransaction::class,
                'referenceId'   => $coinTransaction->id,
                'isManual'      => false,
                'journalDetails' => [
                    [
                        'accountId' => $expenseAccount->id,
                        'debit'     => $totalAmount,
                        'credit'    => 0,
                        'memo'      => "Biaya kirim notifikasi WA",
                    ],
                    [
                        'accountId' => $cashAccount->id,
                        'debit'     => 0,
                        'credit'    => $totalAmount,
                        'memo'      => "Pengurangan saldo coin - " . abs($coinTransaction->amount) . " coin",
                    ],
                ],
            ]);
        } catch (Exception $e) {
            Log::error('Failed to record journal entry for WA notification', [
                'outlet_id' => $outlet->id,
                'error'     => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
