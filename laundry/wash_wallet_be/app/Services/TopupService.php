<?php

namespace App\Services;

use App\Models\Outlet;
use App\Models\Topup;
use App\Models\User;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\MidtransService;

class TopupService extends BaseService
{
    public function __construct(
        private Topup $topup,
        private Outlet $outlet,
        private User $user,
        private AccountingService $accountingService,
        private MidtransService $midtransService
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Read Methods
    |--------------------------------------------------------------------------
    */

    public function getAll(
        array $filters = [],
        ?int $page = null,
        ?int $perPage = null,
        array $relations = ['user']
    ): LengthAwarePaginator|Collection {
        try {
            $query = $this->topup->query();

            $this->applyTenantScope($query, 'byUserId', 'byUserId');
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get topups', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'topup_service_error',
            ]);
            throw $e;
        }
    }

    public function getStats(): array
    {
        try {
            $query = $this->topup->query();

            $this->applyTenantScope($query, 'byUserId', 'byUserId');

            return [
                ['label' => 'Total Topup', 'value' => (clone $query)->count(),                                                     'subValue' => 'Rp ' . number_format((clone $query)->success()->sum('amount_money'), 0, ',', '.'), 'icon' => 'TrendingUp',  'variant' => 'primary'],
                ['label' => 'Selesai',     'value' => (clone $query)->success()->count(),  'subValue' => null, 'icon' => 'CheckCircle2', 'variant' => 'success'],
                ['label' => 'Menunggu',    'value' => (clone $query)->pending()->count(),  'subValue' => null, 'icon' => 'Clock',        'variant' => 'warning'],
                ['label' => 'Gagal',       'value' => (clone $query)->failed()->count(),   'subValue' => null, 'icon' => 'XCircle',      'variant' => 'danger'],
            ];
        } catch (Exception $e) {
            Log::error('Failed to get topup stats', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'topup_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(int $id, array $relations = ['user', 'outlet']): Topup
    {
        try {
            $query = $this->topup->byId($id);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get topup by ID', [
                'topup_id' => $id,
                'error'    => $e->getMessage(),
                'user_id'  => Auth::id(),
                'type'     => 'topup_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function store(array $data): Topup
    {
        return DB::transaction(function () use ($data) {
            try {
                /** @var User $user */
                $user          = Auth::user();
                $isOutletTopup = !empty($data['outletId']);

                if ($this->hasPendingTransaction($user->id)) {
                    throw new Exception('Anda masih memiliki transaksi yang menunggu pembayaran. Selesaikan transaksi tersebut terlebih dahulu.');
                }

                if ($isOutletTopup) {
                    $outlet = $this->outlet->findOrFail($data['outletId']);
                    if ($outlet->owner_id !== $user->id) {
                        throw new Exception('Bukan owner outlet ini.');
                    }
                }

                $paymentMethod = $data['paymentMethod'] ?? 'bank_transfer';
                $orderId       = 'TOPUP-' . time() . '-' . $user->id;

                $midtransPayload = [
                    'transaction_details' => [
                        'order_id'     => $orderId,
                        'gross_amount' => (int) $data['amountMoney'],
                    ],
                    'customer_details' => [
                        'first_name' => $user->name,
                        'email'      => $user->email,
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
                } elseif (in_array($paymentMethod, ['gopay', 'qris'])) {
                    $midtransPayload['payment_type'] = $paymentMethod;
                    $midtransPayload[$paymentMethod] = [
                        'enable_callback' => true,
                        'callback_url'    => config('app.url') . '/dashboard/topups',
                    ];
                } elseif ($paymentMethod === 'cstore') {
                    $midtransPayload['payment_type'] = 'cstore';
                    $midtransPayload['cstore'] = [
                        'store'   => $data['cstoreType'], // 'alfamart' or 'indomaret'
                        'message' => 'WashWallet Topup',
                    ];

                    if ($data['cstoreType'] === 'alfamart') {
                        $midtransPayload['cstore']['alfamart_free_text_1'] = 'Terima kasih telah topup';
                        $midtransPayload['cstore']['alfamart_free_text_2'] = 'di WashWallet';
                        $midtransPayload['cstore']['alfamart_free_text_3'] = 'Enjoy your coins!';
                    }
                } elseif (in_array($paymentMethod, ['akulaku', 'kredivo'])) {
                    $midtransPayload['payment_type'] = $paymentMethod;
                    $midtransPayload['item_details'] = [
                        [
                            'id'       => 'COIN_TOPUP',
                            'name'     => 'WashWallet Coin Topup',
                            'price'    => (int) $data['amountMoney'],
                            'quantity' => 1,
                        ]
                    ];
                } else {
                    $midtransPayload['payment_type'] = $paymentMethod;
                }

                $paymentData = $this->midtransService->charge($midtransPayload);
                $expiryTime  = isset($paymentData['expire_time']) ? \Illuminate\Support\Carbon::parse($paymentData['expire_time']) : now()->addMinutes(30);

                $topup = $this->topup->create([
                    'user_id'            => $user->id,
                    'outlet_id'          => $data['outletId'] ?? null,
                    'amount_money'       => $data['amountMoney'],
                    'coin_received'      => $data['amountMoney'],
                    'status'             => 'pending',
                    'payment_status'     => 'pending',
                    'payment_method'     => $paymentMethod,
                    'payment_provider'   => 'Midtrans',
                    'payment_reference'  => $orderId,
                    'midtrans_order_id'  => $orderId,
                    'expired_at'         => $expiryTime,
                    'payment_data'       => $paymentData,
                ]);

                Log::info('New topup created (Real Midtrans)', [
                    'topup_id'      => $topup->id,
                    'user_id'       => $user->id,
                    'order_id'      => $orderId,
                    'payment_method' => $paymentMethod,
                ]);

                return $topup->fresh(['user', 'outlet']);
            } catch (Exception $e) {
                Log::error('Failed to create topup', [
                    'data'    => $data,
                    'error'   => $e->getMessage(),
                    'user_id' => Auth::id(),
                ]);
                throw $e;
            }
        });
    }

    public function hasPendingTransaction(int $userId): bool
    {
        return $this->topup->where('user_id', $userId)
            ->where('status', 'pending')
            ->where('expired_at', '>', now())
            ->exists();
    }

    public function getPendingTransaction(int $userId): ?Topup
    {
        return $this->topup->where('user_id', $userId)
            ->where('status', 'pending')
            ->where('expired_at', '>', now())
            ->first();
    }

    public function updatePaymentStatus(string $orderId, string $midtransStatus): bool
    {
        return DB::transaction(function () use ($orderId, $midtransStatus) {
            $topup = $this->topup->byMidtransOrderId($orderId)->first();

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
                'status'         => $mapped['status'],
                'payment_status' => $mapped['payment'],
            ]);
        });
    }

    private function handleSuccessfulPayment(Topup $topup): void
    {
        $user       = $topup->user;
        $coinAmount = $topup->coin_received;

        if ($topup->outlet_id) {
            $topup->outlet->increment('coin_balance', $coinAmount);
        } else {
            $user->increment('coin_balance', $coinAmount);
        }

        $this->accountingService->recordOwnerTopup(
            ownerId: $user->id,
            outletId: $topup->outlet_id,
            amount: $coinAmount,
            topupId: $topup->id,
            description: "Topup coin sebesar {$coinAmount} berhasil"
        );

        if ($user->referred_by) {
            $commissionAmount = intval($coinAmount * 0.10);

            $referrer = $this->user->find($user->referred_by);
            $referrer->increment('reward_balance', $commissionAmount);

            $this->accountingService->recordReferralCommission(
                referrerId: $user->referred_by,
                amount: $commissionAmount,
                referenceType: 'topup',
                referenceId: $topup->id,
                description: "Komisi referral dari topup user #{$user->id}"
            );

            $topup->referralLog()->create([
                'referrer_id'      => $user->referred_by,
                'referred_user_id' => $user->id,
                'commission_coin'  => $commissionAmount,
            ]);
        }

        Log::info('Topup completed + coin credited', [
            'topup_id'      => $topup->id,
            'user_id'       => $user->id,
            'coin_received' => $coinAmount,
        ]);
    }

    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $topup = $this->topup->byId($id)->firstOrFail();

                if ($topup->status === 'success') {
                    throw new Exception('Cannot delete successful topup');
                }

                $deleted = $topup->delete();

                if ($deleted) {
                    Log::info('Topup deleted successfully', [
                        'topup_id'   => $id,
                        'topup_type' => $topup->outlet_id ? 'outlet' : 'master',
                        'user_id'    => $topup->user_id,
                        'outlet_id'  => $topup->outlet_id,
                        'deleted_by' => Auth::id(),
                        'type'       => 'topup_action',
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete topup', [
                    'topup_id' => $id,
                    'error'    => $e->getMessage(),
                    'user_id'  => Auth::id(),
                    'type'     => 'topup_service_error',
                ]);
                throw $e;
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Private — Filters & Helpers
    |--------------------------------------------------------------------------
    */

    protected function applyFilters(Builder $query, array $filters = []): void
    {
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        if (!empty($filters['paymentStatus'])) {
            $query->byPaymentStatus($filters['paymentStatus']);
        }

        if (!empty($filters['paymentProvider'])) {
            $query->where('payment_provider', $filters['paymentProvider']);
        }

        if (!empty($filters['minAmount'])) {
            $query->where('amount_money', '>=', $filters['minAmount']);
        }

        if (!empty($filters['maxAmount'])) {
            $query->where('amount_money', '<=', $filters['maxAmount']);
        }

        if (!empty($filters['startDate']) && !empty($filters['endDate'])) {
            $query->whereBetween('created_at', [$filters['startDate'], $filters['endDate']]);
        } elseif (!empty($filters['startDate'])) {
            $query->whereDate('created_at', '>=', $filters['startDate']);
        } elseif (!empty($filters['endDate'])) {
            $query->whereDate('created_at', '<=', $filters['endDate']);
        }

        $sortBy        = $filters['sortBy'] ?? 'created_at';
        $sortDirection = $filters['sortDirection'] ?? 'desc';

        $query->sortBy($sortBy, $sortDirection);
    }

    private function generatePaymentReference(): string
    {
        do {
            $reference = 'TOP-' . strtoupper(uniqid()) . '-' . time();
        } while ($this->topup->where('payment_reference', $reference)->exists());

        return $reference;
    }
}
