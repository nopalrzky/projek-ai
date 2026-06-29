<?php

namespace App\Services;

use App\Models\Account;
use App\Models\JournalDetail;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class DashboardService extends BaseService
{
    public function __construct(
        protected Account $account,
    ) {}

    private function formatMoney(mixed $amount): string
    {
        return 'Rp ' . number_format($this->toFloat($amount), 0, ',', '.');
    }

    private function toFloat(mixed $value): float
    {
        return (float) $value;
    }

    /*
    |--------------------------------------------------------------------------
    | Read Methods
    |--------------------------------------------------------------------------
    |
    */

    public function quickMetrics(): array
    {
        $ownerId = Auth::id();

        return Cache::remember(
            "users:{$ownerId}:dashboard:quick_metrics",
            60,
            function () use ($ownerId) {
                return [
                    'totalRevenue'   => User::totalRevenue($ownerId),
                    'totalOrders'    => User::totalOrders($ownerId),
                    'totalCustomers' => User::totalCustomers($ownerId),
                    'totalOutlets'   => User::totalOutlets($ownerId),
                ];
            }
        );
    }

    public function assetSummary(?int $ownerId = null): array
    {
        $ownerId ??= Auth::id();

        if ($ownerId === null) {
            return [];
        }

        return Cache::remember(
            "users:{$ownerId}:dashboard:asset_summary",
            180,
            function () use ($ownerId) {
                $level2Accounts = $this->account
                    ->assets()
                    ->byLevel(2)
                    ->byOwnerId($ownerId)
                    ->orderBy('code')
                    ->get();

                $level2Ids = $level2Accounts->pluck('id')->toArray();

                $level3Accounts = Account::whereIn('parent_id', $level2Ids)
                    ->byLevel(3)
                    ->get();

                $childrenGrouped = $level3Accounts->groupBy('parent_id');

                $allAccountIds = array_unique(array_merge($level2Ids, $level3Accounts->pluck('id')->toArray()));

                $totals = JournalDetail::whereIn('account_id', $allAccountIds)
                    ->selectRaw('account_id, SUM(debit) as total_debit, SUM(credit) as total_credit')
                    ->groupBy('account_id')
                    ->get()
                    ->keyBy('account_id');

                $summary = [];

                foreach ($level2Accounts as $account) {
                    $children = $childrenGrouped->get($account->id);
                    $accountIds = $children ? $children->pluck('id')->toArray() : [$account->id];

                    $totalDebit = 0.0;
                    $totalCredit = 0.0;

                    foreach ($accountIds as $accId) {
                        if (isset($totals[$accId])) {
                            $totalDebit += (float) $totals[$accId]->total_debit;
                            $totalCredit += (float) $totals[$accId]->total_credit;
                        }
                    }

                    $balance = $totalDebit - $totalCredit;

                    $summary[] = [
                        'slug'      => $account->slug,
                        'label'     => $account->name,
                        'amount'    => $balance,
                        'formatted' => $this->formatMoney($balance),
                    ];
                }

                return $summary;
            }
        );
    }

    public function recentCoinTransactions(int $limit = 5): array
    {
        $ownerId   = Auth::id();

        return Cache::remember(
            "users:{$ownerId}:dashboard:recent_coin_transactions:{$limit}",
            60,
            function () use ($ownerId, $limit) {
                $user = Auth::user();
                $outletIds = $user ? ($user->outlet_ids ?? []) : [];

                $coinAccount = $this->account->where('slug', 'coin_asset')->first();

                if (!$coinAccount) {
                    return [];
                }

                $details = JournalDetail::with(['journalEntry'])
                    ->where('account_id', $coinAccount->id)
                    ->when(!empty($outletIds), fn($q) => $q->whereHas('journalEntry', fn($q2) => $q2->whereIn('outlet_id', $outletIds)))
                    ->orderBy('created_at', 'desc')
                    ->limit($limit)
                    ->get();

                return $details->map(function ($detail) {
                    $isDebit = $detail->debit > 0;
                    $amount  = $isDebit ? $detail->debit : $detail->credit;

                    return [
                        'id'              => $detail->id,
                        'type'            => $isDebit ? 'in' : 'out',
                        'amount'          => $amount,
                        'formattedAmount' => $this->formatMoney($amount),
                        'description'     => $detail->journalEntry->description ?? '-',
                        'date'            => $detail->created_at,
                        'formattedDate'   => $detail->created_at->format('d M Y H:i'),
                    ];
                })->toArray();
            }
        );
    }

    public function getAssetBySlug(string $slug): ?array
    {
        $account = $this->account
            ->bySlug($slug)
            ->byOwnerId(Auth::id())
            ->byType('asset')
            ->byLevel(2)
            ->first();

        if (!$account) {
            return null;
        }

        $transactionalAccounts = Account::byParentId($account->id)
            ->byLevel(3)
            ->isTransactional(true)
            ->with(['journalDetails'])
            ->orderBy('code')
            ->get();

        $accountsWithBalance = $transactionalAccounts->map(function ($acc) {
            $totalDebit  = $acc->journalDetails->sum('debit');
            $totalCredit = $acc->journalDetails->sum('credit');
            $balance     = $totalDebit - $totalCredit;

            return [
                'id'               => $acc->id,
                'code'             => $acc->code,
                'name'             => $acc->name,
                'slug'             => $acc->slug,
                'totalDebit'       => $totalDebit,
                'totalCredit'      => $totalCredit,
                'balance'          => $balance,
                'formattedDebit'   => $this->formatMoney($totalDebit),
                'formattedCredit'  => $this->formatMoney($totalCredit),
                'formattedBalance' => $this->formatMoney($balance),
                'transactionCount' => $acc->journalDetails->count(),
            ];
        });

        $totalDebit   = $accountsWithBalance->sum('totalDebit');
        $totalCredit  = $accountsWithBalance->sum('totalCredit');
        $totalBalance = $accountsWithBalance->sum('balance');

        return [
            'account'               => $account,
            'transactionalAccounts' => $accountsWithBalance,
            'summary' => [
                'totalAccounts'  => $accountsWithBalance->count(),
                'totalDebit'     => $totalDebit,
                'totalCredit'    => $totalCredit,
                'balance'        => $totalBalance,
                'formattedDebit'   => $this->formatMoney($totalDebit),
                'formattedCredit'  => $this->formatMoney($totalCredit),
                'formattedBalance' => $this->formatMoney($totalBalance),
            ],
        ];
    }
}
