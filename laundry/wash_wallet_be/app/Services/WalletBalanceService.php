<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Models\Order;
use App\Models\WalletTransaction;
use App\Models\WalletWithdrawal;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WalletBalanceService extends BaseService
{
    public function __construct(
        protected WalletTransaction $walletTransaction,
        protected User $user,
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
        array $relations = []
    ): LengthAwarePaginator|Collection {
        try {
            $page ??= (int) ($filters['page'] ?? 0);
            $perPage ??= (int) ($filters['perPage'] ?? 0);

            $query = $this->walletTransaction->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get wallet transactions', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'wallet_balance_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(int $id, array $relations = []): WalletTransaction
    {
        try {
            $query = $this->walletTransaction->query();
            $this->applyTenantScope($query);

            return $query->with($relations)->findOrFail($id);
        } catch (Exception $e) {
            Log::error('Failed to get wallet transaction by ID', [
                'transaction_id' => $id,
                'error'          => $e->getMessage(),
                'type'           => 'wallet_balance_service_error',
            ]);
            throw $e;
        }
    }

    public function getStats(?int $userId = null): array
    {
        try {
            $userId ??= $this->resolveOwnerId();
            $owner = $this->user->findOrFail($userId);

            $pendingWdrTotal = (float) WalletWithdrawal::query()
                ->byUserId($userId)
                ->whereIn('status', [WalletWithdrawal::STATUS_PENDING, WalletWithdrawal::STATUS_PROCESSING])
                ->sum('requested_amount');

            $walletBalance = (float) $owner->wallet_balance;
            $availableBalance = $walletBalance;

            return [
                'walletBalance'    => $walletBalance,
                'availableBalance' => $availableBalance,
                'pendingWdrTotal'  => $pendingWdrTotal,
            ];
        } catch (Exception $e) {
            Log::error('Failed to get wallet stats', [
                'user_id' => $userId,
                'error'   => $e->getMessage(),
                'type'    => 'wallet_balance_service_error',
                'trace'   => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function creditFromOrder(User $owner, Order $order, string $type): WalletTransaction
    {
        return DB::transaction(function () use ($owner, $order, $type) {
            try {
                $owner = User::query()->lockForUpdate()->findOrFail($owner->id);

                $existing = $this->walletTransaction->query()
                    ->byOrderId($order->id)
                    ->where('type', $type)
                    ->first();

                if ($existing) {
                    Log::info('Transaction already exists for this order and type. Returning existing transaction.', [
                        'order_id' => $order->id,
                        'type' => $type
                    ]);
                    return $existing;
                }

                $gross = (float) $order->total_amount;
                $fee = 0.0;

                if ($type === WalletTransaction::TYPE_ORDER_TRANSFER_INCOME) {
                    $fee = (float) config('midtrans.payment_fee', 4000);
                }

                $net = max(0.0, $gross - $fee);
                $amount = $net;

                $balanceBefore = (float) $owner->wallet_balance;
                $balanceAfter = $balanceBefore + $amount;

                $transaction = $this->walletTransaction->create([
                    'user_id'            => $owner->id,
                    'outlet_id'          => $order->outlet_id,
                    'order_id'           => $order->id,
                    'transaction_number' => WalletTransaction::generateTransactionNumber(),
                    'type'               => $type,
                    'amount'             => $amount,
                    'gross_amount'       => $gross,
                    'fee_amount'         => $fee,
                    'net_amount'         => $net,
                    'balance_before'     => $balanceBefore,
                    'balance_after'      => $balanceAfter,
                    'description'        => "Pendapatan order #{$order->order_number}",
                ]);

                $owner->update([
                    'wallet_balance' => $balanceAfter,
                ]);

                Log::info('Wallet credited from order successfully', [
                    'wallet_transaction_id' => $transaction->id,
                    'order_id'              => $order->id,
                    'owner_id'              => $owner->id,
                    'type'                  => 'wallet_balance_credit',
                ]);

                return $transaction;
            } catch (Exception $e) {
                Log::error('Failed to credit wallet from order', [
                    'order_id' => $order->id,
                    'error'    => $e->getMessage(),
                    'type'     => 'wallet_balance_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function debitForWithdrawal(User $owner, WalletWithdrawal $withdrawal): WalletTransaction
    {
        return DB::transaction(function () use ($owner, $withdrawal) {
            try {
                $amount = (float) $withdrawal->requested_amount;
                $balanceBefore = (float) $owner->wallet_balance;
                $balanceAfter = $balanceBefore - $amount;

                if ($balanceAfter < 0) {
                    throw new Exception('Insufficient wallet balance.');
                }

                $transaction = $this->walletTransaction->create([
                    'user_id'              => $owner->id,
                    'wallet_withdrawal_id' => $withdrawal->id,
                    'transaction_number'   => WalletTransaction::generateTransactionNumber(),
                    'type'                 => WalletTransaction::TYPE_WITHDRAWAL_REQUEST,
                    'amount'               => -$amount,
                    'balance_before'       => $balanceBefore,
                    'balance_after'        => $balanceAfter,
                    'description'          => "Withdrawal request {$withdrawal->code}",
                ]);

                $owner->update([
                    'wallet_balance' => $balanceAfter,
                ]);

                Log::info('Wallet debited for withdrawal successfully', [
                    'wallet_transaction_id' => $transaction->id,
                    'withdrawal_id'         => $withdrawal->id,
                    'owner_id'              => $owner->id,
                    'type'                  => 'wallet_balance_debit',
                ]);

                return $transaction;
            } catch (Exception $e) {
                Log::error('Failed to debit wallet for withdrawal', [
                    'withdrawal_id' => $withdrawal->id,
                    'error'         => $e->getMessage(),
                    'type'          => 'wallet_balance_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function refundWithdrawal(User $owner, WalletWithdrawal $withdrawal, string $type): WalletTransaction
    {
        return DB::transaction(function () use ($owner, $withdrawal, $type) {
            try {
                $amount = (float) $withdrawal->requested_amount;
                $balanceBefore = (float) $owner->wallet_balance;
                $balanceAfter = $balanceBefore + $amount;

                $desc = $type === WalletTransaction::TYPE_WITHDRAWAL_REJECTED_REFUND
                    ? "Pengembalian dana penolakan withdrawal {$withdrawal->code}"
                    : "Pengembalian dana pembatalan withdrawal {$withdrawal->code}";

                $transaction = $this->walletTransaction->create([
                    'user_id'              => $owner->id,
                    'wallet_withdrawal_id' => $withdrawal->id,
                    'transaction_number'   => WalletTransaction::generateTransactionNumber(),
                    'type'                 => $type,
                    'amount'               => $amount,
                    'balance_before'       => $balanceBefore,
                    'balance_after'        => $balanceAfter,
                    'description'          => $desc,
                ]);

                $owner->update([
                    'wallet_balance' => $balanceAfter,
                ]);

                Log::info('Wallet withdrawal refunded successfully', [
                    'wallet_transaction_id' => $transaction->id,
                    'withdrawal_id'         => $withdrawal->id,
                    'owner_id'              => $owner->id,
                    'type'                  => 'wallet_balance_refund',
                ]);

                return $transaction;
            } catch (Exception $e) {
                Log::error('Failed to refund wallet withdrawal', [
                    'withdrawal_id' => $withdrawal->id,
                    'error'         => $e->getMessage(),
                    'type'          => 'wallet_balance_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function manualAdjustment(User $owner, float $amount, string $description): WalletTransaction
    {
        return DB::transaction(function () use ($owner, $amount, $description) {
            try {
                $balanceBefore = (float) $owner->wallet_balance;
                $balanceAfter = $balanceBefore + $amount;

                if ($balanceAfter < 0) {
                    throw new Exception('Adjustment results in negative balance.');
                }

                $transaction = $this->walletTransaction->create([
                    'user_id'            => $owner->id,
                    'transaction_number' => WalletTransaction::generateTransactionNumber(),
                    'type'               => WalletTransaction::TYPE_MANUAL_ADJUSTMENT,
                    'amount'             => $amount,
                    'balance_before'     => $balanceBefore,
                    'balance_after'      => $balanceAfter,
                    'description'        => $description,
                ]);

                $owner->update([
                    'wallet_balance' => $balanceAfter,
                ]);

                Log::info('Wallet manual adjustment completed successfully', [
                    'wallet_transaction_id' => $transaction->id,
                    'owner_id'              => $owner->id,
                    'type'                  => 'wallet_balance_adjustment',
                ]);

                return $transaction;
            } catch (Exception $e) {
                Log::error('Failed to perform manual adjustment', [
                    'owner_id' => $owner->id,
                    'error'    => $e->getMessage(),
                    'type'     => 'wallet_balance_service_error',
                ]);
                throw $e;
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Private — Filters
    |--------------------------------------------------------------------------
    */

    protected function applyFilters(Builder $query, array $filters = []): void
    {
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['type'])) {
            $query->byType($filters['type']);
        }

        if (!empty($filters['startDate'])) {
            $query->whereDate('created_at', '>=', $filters['startDate']);
        }

        if (!empty($filters['endDate'])) {
            $query->whereDate('created_at', '<=', $filters['endDate']);
        }

        $query->sortBy(
            $filters['sortBy']        ?? 'createdAt',
            $filters['sortDirection'] ?? 'desc'
        );
    }
}
