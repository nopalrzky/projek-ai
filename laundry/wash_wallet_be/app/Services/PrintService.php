<?php

namespace App\Services;

use App\Models\CoinTransaction;
use App\Models\Feature;
use App\Models\Order;
use App\Models\Outlet;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PrintService extends BaseService
{
    const COIN_RUPIAH_VALUE = 1;

    public function __construct(
        protected JournalEntryService $journalEntryService,
        protected Feature $feature
    ) {}

    /**
     * Get coin price for print feature
     */
    public function getCoinPrice(string $featureKey): int
    {
        $feature = $this->feature->where('key', $featureKey)->first();
        return $feature ? (int) $feature->coin_price : 1;
    }

    /**
     * Check coin availability and feature status
     */
    public function checkCoinAvailability(Outlet $outlet, string $featureKey): array
    {
        $feature = $this->feature->where('key', $featureKey)->first();
        $coinPrice = $feature ? (int) $feature->coin_price : 1;
        $featureActive = $feature ? (bool) $feature->is_active : false;
        
        $owner = $outlet->owner;

        $availability = [
            'coin_price'     => $coinPrice,
            'feature_active' => $featureActive,
            'has_enough_coin'=> false,
            'coin_source'    => null,
            'outlet_coin_balance' => (int) $outlet->coin_balance,
            'owner_coin_balance'  => $owner ? (int) $owner->coin_balance : 0,
        ];

        if (!$featureActive) {
            return $availability;
        }

        if ($outlet->coin_balance >= $coinPrice) {
            $availability['has_enough_coin'] = true;
            $availability['coin_source']    = 'outlet';
        } elseif ($owner && $owner->coin_balance >= $coinPrice) {
            $availability['has_enough_coin'] = true;
            $availability['coin_source']    = 'owner';
        }

        return $availability;
    }

    /**
     * Get complete order data for printing
     */
    public function getOrderData(int $orderId): Order
    {
        return Order::with([
            'customer', 
            'orderItems.laundryService', 
            'orderItems.servicePackage', 
            'employee.outlet'
        ])->findOrFail($orderId);
    }

    /**
     * Process print: deduct coin and record journal entry
     */
    public function processPrint(Order $order, Outlet $outlet, string $featureKey): array
    {
        return DB::transaction(function () use ($order, $outlet, $featureKey) {
            try {
                $availability = $this->checkCoinAvailability($outlet, $featureKey);

                if (!$availability['feature_active']) {
                    $featureName = $featureKey === 'print_receipt' ? 'cetak struk' : 'cetak label';
                    throw new Exception("Fitur {$featureName} sedang tidak aktif.");
                }

                if (!$availability['has_enough_coin']) {
                    throw new Exception("Saldo coin tidak mencukupi. Butuh {$availability['coin_price']} coin.");
                }

                $coinPrice = $availability['coin_price'];
                $source    = $availability['coin_source'];

                $coinType = $featureKey === 'print_receipt' 
                    ? CoinTransaction::TYPE_PRINT_RECEIPT 
                    : CoinTransaction::TYPE_PRINT_LABEL;

                $coinTransaction = $this->deductCoin($outlet, $source, $coinPrice, $coinType, $order->id);

                $this->recordJournalEntry($outlet, $coinTransaction, $order, $featureKey);

                Log::info('Print transaction processed successfully', [
                    'order_id'       => $order->id,
                    'outlet_id'      => $outlet->id,
                    'feature_key'    => $featureKey,
                    'source'         => $source,
                    'coin_deducted'  => $coinPrice,
                    'transaction_id' => $coinTransaction->id,
                ]);

                return [
                    'success'        => true,
                    'message'        => $featureKey === 'print_receipt' 
                        ? "Coin berhasil diproses. Silakan cetak struk." 
                        : "Coin berhasil diproses. Silakan cetak label.",
                    'coin_deducted'  => $coinPrice,
                    'coin_source'    => $source,
                    'remaining_coin' => $source === 'outlet' 
                        ? $outlet->fresh()->coin_balance 
                        : $outlet->owner->fresh()->coin_balance,
                ];
            } catch (Exception $e) {
                Log::error('Failed to process print transaction', [
                    'order_id'    => $order->id,
                    'outlet_id'   => $outlet->id,
                    'feature_key' => $featureKey,
                    'error'       => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    /**
     * Deduct coin and record transaction
     */
    private function deductCoin(Outlet $outlet, string $source, int $coinPrice, string $coinType, int $orderId): CoinTransaction
    {
        $payer = ($source === 'outlet') ? $outlet : $outlet->owner;

        $payer->decrement('coin_balance', $coinPrice);

        $featureName = $coinType === CoinTransaction::TYPE_PRINT_RECEIPT ? 'Struk' : 'Label';

        return CoinTransaction::create([
            'transaction_number' => ($coinType === CoinTransaction::TYPE_PRINT_RECEIPT ? 'PRT' : 'LBL') . strtoupper(bin2hex(random_bytes(4))),
            'user_id'        => $outlet->owner_id,
            'outlet_id'      => $outlet->id,
            'type'           => $coinType,
            'amount'         => -$coinPrice,
            'description'    => "Biaya Cetak {$featureName} - Order ID: {$orderId}",
            'reference_type' => Order::class,
            'reference_id'   => $orderId,
        ]);
    }

    /**
     * Record journal entry for print cost
     */
    private function recordJournalEntry(Outlet $outlet, CoinTransaction $coinTransaction, Order $order, string $printType): void
    {
        try {
            $totalAmount = abs($coinTransaction->amount) * self::COIN_RUPIAH_VALUE;
            $featureName = $printType === 'print_receipt' ? 'Struk' : 'Label';

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
                'description'   => "Biaya Cetak {$featureName} - Order #{$order->order_number}",
                'referenceType' => CoinTransaction::class,
                'referenceId'   => $coinTransaction->id,
                'isManual'      => false,
                'journalDetails' => [
                    [
                        'accountId' => $expenseAccount->id,
                        'debit'     => $totalAmount,
                        'credit'    => 0,
                        'memo'      => "Biaya cetak {$featureName}",
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
            Log::error('Failed to record journal entry for print transaction', [
                'outlet_id' => $outlet->id,
                'error'     => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
