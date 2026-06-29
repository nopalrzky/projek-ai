<?php

namespace App\Services;

use App\Models\CustomerAccount;
use App\Models\CustomerTopup;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;

class CustomerTopupService extends BaseService
{
    public function __construct(
        private CustomerTopup $customerTopup,
        private CustomerAccount $customerAccount,
        private MidtransService $midtransService,
        private FcmNotificationService $fcmNotificationService
    ) {}

    public function getAll(int $customerId, array $filters = [], ?int $perPage = 10, ?int $page = 1): LengthAwarePaginator|Collection
    {
        try {
            $query = $this->customerTopup->query()
                ->byCustomerAccountId($customerId)
                ->orderBy('created_at', 'desc');

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get customer topups', [
                'customer_id' => $customerId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    public function getById(int $id, int $customerId): CustomerTopup
    {
        return $this->customerTopup->where('id', $id)
            ->where('customer_account_id', $customerId)
            ->firstOrFail();
    }

    public function hasPendingTransaction(int $customerId): bool
    {
        return $this->customerTopup->byCustomerAccountId($customerId)
            ->pending()
            ->where('expired_at', '>', now())
            ->exists();
    }

    public function store(int $customerId, array $data): CustomerTopup
    {
        return DB::transaction(function () use ($customerId, $data) {
            try {
                if ($this->hasPendingTransaction($customerId)) {
                    throw new Exception('Anda masih memiliki transaksi yang menunggu pembayaran.');
                }

                $customer = $this->customerAccount->findOrFail($customerId);
                $amount = (int) $data['amount'];
                $paymentMethod = $data['paymentMethod'];
                $orderId = 'CTOPUP-' . time() . '-' . $customerId;

                $midtransPayload = [
                    'transaction_details' => [
                        'order_id' => $orderId,
                        'gross_amount' => $amount,
                    ],
                    'customer_details' => [
                        'first_name' => $customer->name,
                        'phone' => $customer->phone,
                        'email' => $customer->email,
                    ],
                ];

                if ($paymentMethod === 'bank_transfer') {
                    $midtransPayload['payment_type'] = 'bank_transfer';
                    $midtransPayload['bank_transfer'] = [
                        'bank' => $data['bankCode'] ?? 'bca',
                    ];
                } elseif ($paymentMethod === 'echannel') {
                    $midtransPayload['payment_type'] = 'echannel';
                    $midtransPayload['echannel'] = [
                        'bill_info1' => 'Payment:',
                        'bill_info2' => 'WashWallet Topup',
                    ];
                } elseif ($paymentMethod === 'permata') {
                    $midtransPayload['payment_type'] = 'permata';
                } else {
                    $midtransPayload['payment_type'] = $paymentMethod;
                }

                $paymentData = $this->midtransService->charge($midtransPayload);
                $expiryTime = isset($paymentData['expire_time'])
                    ? Carbon::parse($paymentData['expire_time'])
                    : now()->addMinutes(30);

                return $this->customerTopup->create([
                    'customer_account_id' => $customerId,
                    'amount' => $amount,
                    'status' => 'pending',
                    'payment_status' => 'pending',
                    'payment_method' => $paymentMethod,
                    'payment_provider' => 'Midtrans',
                    'payment_data' => $paymentData,
                    'midtrans_order_id' => $orderId,
                    'expired_at' => $expiryTime,
                ]);
            } catch (Exception $e) {
                Log::error('Failed to create customer topup', [
                    'customer_id' => $customerId,
                    'data' => $data,
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    public function updatePaymentStatus(string $orderId, string $midtransStatus): bool
    {
        return DB::transaction(function () use ($orderId, $midtransStatus) {
            $topup = $this->customerTopup->byMidtransOrderId($orderId)->first();

            if (!$topup) return false;

            $statusMap = [
                'settlement' => ['status' => 'success', 'payment' => 'paid'],
                'capture'    => ['status' => 'success', 'payment' => 'paid'],
                'pending'    => ['status' => 'pending', 'payment' => 'pending'],
                'expire'     => ['status' => 'failed',  'payment' => 'expired'],
                'cancel'     => ['status' => 'failed',  'payment' => 'failed'],
                'deny'       => ['status' => 'failed',  'payment' => 'failed'],
            ];

            $mapped = $statusMap[$midtransStatus] ?? null;
            if (!$mapped) return false;

            if ($mapped['status'] === 'success' && $topup->status !== 'success') {
                $this->handleSuccessfulPayment($topup);
            }

            return $topup->update([
                'status' => $mapped['status'],
                'payment_status' => $mapped['payment'],
            ]);
        });
    }

    private function handleSuccessfulPayment(CustomerTopup $topup): void
    {
        $topup->customerAccount->increment('deposit_balance', $topup->amount);

        // Kirim push notification
        $this->fcmNotificationService->sendToCustomer(
            $topup->customerAccount,
            'Topup Berhasil! 🎉',
            'Saldo Rp ' . number_format($topup->amount, 0, ',', '.') . ' sudah masuk ke akunmu.',
            [
                'type' => 'topup_success',
                'topup_id' => (string) $topup->id,
            ]
        );

        Log::info('Customer topup successful + balance credited', [
            'topup_id' => $topup->id,
            'customer_id' => $topup->customer_account_id,
            'amount' => $topup->amount,
        ]);
    }
}
