<?php

namespace App\Services;

use App\Models\CoinTransaction;
use App\Models\Outlet;
use App\Models\User;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CoinTransactionService extends BaseService
{
    public function __construct(
        protected CoinTransaction $coinTransaction,
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
            $query = $this->coinTransaction->query();

            $this->applyTenantScope($query, 'byUserId', 'byOutletId');
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get all coin transactions', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'coin_transaction_service_error',
            ]);
            throw $e;
        }
    }

    public function getStats(): array
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            if (!$user) {
                throw new Exception('User not authenticated');
            }

            $userCoinBalance = $user->coin_balance ?? 0;

            $outletsCoinBalance = 0;
            if ($user->isOwner()) {
                $outletsCoinBalance = Outlet::where('owner_id', $user->id)->sum('coin_balance');
            }

            $totalCoinBalance = $userCoinBalance + $outletsCoinBalance;
            $startOfMonth     = now()->startOfMonth();
            $endOfMonth       = now()->endOfMonth();

            $query = $this->coinTransaction->query();
            $this->applyTenantScope($query, 'byUserId', 'byOutletId');

            $coinInThisMonth = (clone $query)
                ->whereIn('type', ['topup', 'commission'])
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->sum('amount');

            $coinOutThisMonth = (clone $query)
                ->whereIn('type', ['transfer_to_outlet', 'outlet_spending', 'withdrawal'])
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->sum('amount');

            $totalTransactionsThisMonth = (clone $query)
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->count();

            return [
                ['label' => 'Total Saldo Coin',  'value' => number_format($totalCoinBalance, 0, ',', '.'), 'subValue' => 'User: ' . number_format($userCoinBalance, 0, ',', '.') . ' | Outlet: ' . number_format($outletsCoinBalance, 0, ',', '.'), 'icon' => 'Coins',       'variant' => 'primary'],
                ['label' => 'Coin Masuk',         'value' => number_format($coinInThisMonth, 0, ',', '.'),  'subValue' => 'Topup & komisi bulan ini',          'icon' => 'TrendingUp',   'variant' => 'success'],
                ['label' => 'Coin Keluar',        'value' => number_format($coinOutThisMonth, 0, ',', '.'), 'subValue' => 'Spending & withdrawal bulan ini',    'icon' => 'TrendingDown', 'variant' => 'danger'],
                ['label' => 'Total Transaksi',    'value' => $totalTransactionsThisMonth,                   'subValue' => 'Bulan ini',                          'icon' => 'Receipt',      'variant' => 'info'],
            ];
        } catch (Exception $e) {
            Log::error('Failed to get coin transaction stats', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'coin_transaction_service_error',
            ]);

            return [
                ['label' => 'Saldo Coin',      'value' => '0', 'subValue' => 'Total coin tersedia',          'icon' => 'Coins',       'variant' => 'primary'],
                ['label' => 'Coin Masuk',       'value' => '0', 'subValue' => 'Topup & komisi bulan ini',    'icon' => 'TrendingUp',   'variant' => 'success'],
                ['label' => 'Coin Keluar',      'value' => '0', 'subValue' => 'Spending & withdrawal bulan ini', 'icon' => 'TrendingDown', 'variant' => 'danger'],
                ['label' => 'Total Transaksi',  'value' => 0,   'subValue' => 'Bulan ini',                   'icon' => 'Receipt',      'variant' => 'info'],
            ];
        }
    }

    public function getById(int $id, array $relations = []): CoinTransaction
    {
        try {
            $query = $this->coinTransaction->byId($id);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get coin transaction by ID', [
                'transaction_id' => $id,
                'error'          => $e->getMessage(),
                'type'           => 'coin_transaction_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function recordTopup(
        int $userId,
        ?int $outletId,
        int $amount,
        int $referenceId,
        string $description = 'Topup coin'
    ): CoinTransaction {
        return DB::transaction(function () use ($userId, $outletId, $amount, $referenceId, $description) {
            try {
                $balanceBefore = $this->getBalance($userId, $outletId);

                $transaction = $this->coinTransaction->create([
                    'user_id'        => $userId,
                    'outlet_id'      => $outletId,
                    'type'           => 'topup',
                    'amount'         => $amount,
                    'balance_before' => $balanceBefore,
                    'balance_after'  => $balanceBefore + $amount,
                    'reference_type' => 'App\Models\Topup',
                    'reference_id'   => $referenceId,
                    'description'    => $description,
                    'status'         => 'completed',
                ]);

                Log::info('Topup transaction recorded', [
                    'transaction_id' => $transaction->id,
                    'user_id'        => $userId,
                    'outlet_id'      => $outletId,
                    'amount'         => $amount,
                    'type'           => 'coin_transaction',
                ]);

                return $transaction;
            } catch (Exception $e) {
                Log::error('Failed to record topup transaction', [
                    'user_id'   => $userId,
                    'outlet_id' => $outletId,
                    'amount'    => $amount,
                    'error'     => $e->getMessage(),
                    'type'      => 'coin_transaction_error',
                ]);
                throw $e;
            }
        });
    }

    public function recordCommission(
        int $referrerId,
        int $amount,
        int $referenceId,
        int $referredUserId
    ): CoinTransaction {
        return DB::transaction(function () use ($referrerId, $amount, $referenceId, $referredUserId) {
            try {
                $balanceBefore = $this->getBalance($referrerId, null);

                $transaction = $this->coinTransaction->create([
                    'user_id'        => $referrerId,
                    'outlet_id'      => null,
                    'type'           => 'commission',
                    'amount'         => $amount,
                    'balance_before' => $balanceBefore,
                    'balance_after'  => $balanceBefore + $amount,
                    'reference_type' => 'App\Models\Topup',
                    'reference_id'   => $referenceId,
                    'description'    => "Referral commission from user #{$referredUserId}",
                    'status'         => 'completed',
                ]);

                Log::info('Commission transaction recorded', [
                    'transaction_id'   => $transaction->id,
                    'referrer_id'      => $referrerId,
                    'referred_user_id' => $referredUserId,
                    'amount'           => $amount,
                    'type'             => 'coin_transaction',
                ]);

                return $transaction;
            } catch (Exception $e) {
                Log::error('Failed to record commission transaction', [
                    'referrer_id' => $referrerId,
                    'amount'      => $amount,
                    'error'       => $e->getMessage(),
                    'type'        => 'coin_transaction_error',
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
        if (!empty($filters['type'])) {
            $query->byType($filters['type']);
        }

        if (!empty($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        if (!empty($filters['userId'])) {
            $query->byUserId($filters['userId']);
        }

        if (!empty($filters['outletId'])) {
            $query->byOutletId($filters['outletId']);
        }

        if (!empty($filters['referenceType'])) {
            $query->byReferenceType($filters['referenceType']);
        }

        if (!empty($filters['referenceId'])) {
            $query->byReferenceId($filters['referenceId']);
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

        $allowedSortColumns = ['id', 'type', 'amount', 'balance_before', 'balance_after', 'status', 'created_at', 'updated_at'];

        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->latest();
        }
    }

    private function getBalance(int $userId, ?int $outletId): int
    {
        if ($outletId) {
            return Outlet::find($outletId)?->coin_balance ?? 0;
        }

        return User::find($userId)?->coin_balance ?? 0;
    }
}
