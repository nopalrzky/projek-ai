<?php

namespace App\Services;

use App\Models\Account;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ProfitLossService extends BaseService
{
    public function __construct(
        protected Account $account,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Read Methods
    |--------------------------------------------------------------------------
    */

    public function getReport(
        int $ownerId,
        int $outletId,
        string $startDate,
        string $endDate
    ): array {
        try {
            $this->validateDateRange($startDate, $endDate);

            $accounts = $this->getAccountsWithTransactions($ownerId, $outletId, $startDate, $endDate);

            $groupedAccounts   = $this->groupAccountsBySubtype($accounts);
            $revenues          = $this->calculateRevenues($groupedAccounts);
            $cogs              = $this->calculateCOGS($groupedAccounts);
            $operatingExpenses = $this->calculateOperatingExpenses($groupedAccounts);
            $otherRevenues     = $this->calculateOtherRevenues($groupedAccounts);
            $otherExpenses     = $this->calculateOtherExpenses($groupedAccounts);

            $grossProfit    = $revenues['total'] - $cogs['total'];
            $grossMargin    = $revenues['total'] > 0 ? ($grossProfit    / $revenues['total']) * 100 : 0;
            $operatingProfit = $grossProfit - $operatingExpenses['total'];
            $operatingMargin = $revenues['total'] > 0 ? ($operatingProfit / $revenues['total']) * 100 : 0;
            $netProfit      = $operatingProfit + $otherRevenues['total'] - $otherExpenses['total'];
            $netMargin      = $revenues['total'] > 0 ? ($netProfit       / $revenues['total']) * 100 : 0;

            $report = [
                'period'             => ['start' => $startDate, 'end' => $endDate],
                'revenues'           => $revenues,
                'cogs'               => $cogs,
                'grossProfit'        => (float) $grossProfit,
                'grossMargin'        => (float) round($grossMargin, 2),
                'operatingExpenses'  => $operatingExpenses,
                'operatingProfit'    => (float) $operatingProfit,
                'operatingMargin'    => (float) round($operatingMargin, 2),
                'otherRevenues'      => $otherRevenues,
                'otherExpenses'      => $otherExpenses,
                'netProfit'          => (float) $netProfit,
                'netMargin'          => (float) round($netMargin, 2),
                'totalRevenue'       => (float) $revenues['total'],
                'totalExpense'       => (float) ($cogs['total'] + $operatingExpenses['total'] + $otherExpenses['total']),
            ];

            Log::info('Profit & Loss report generated successfully', [
                'owner_id'   => $ownerId,
                'outlet_id'  => $outletId,
                'period'     => ['start' => $startDate, 'end' => $endDate],
                'net_profit' => $netProfit,
                'net_margin' => $netMargin,
                'user_id'    => Auth::id(),
                'type'       => 'profit_loss_report',
            ]);

            return $report;
        } catch (Exception $e) {
            Log::error('Failed to generate Profit & Loss report', [
                'owner_id'   => $ownerId,
                'outlet_id'  => $outletId,
                'start_date' => $startDate,
                'end_date'   => $endDate,
                'error'      => $e->getMessage(),
                'user_id'    => Auth::id(),
                'type'       => 'profit_loss_service_error',
            ]);
            throw $e;
        }
    }

    public function getComparativeReport(
        int $ownerId,
        int $outletId,
        string $currentStartDate,
        string $currentEndDate,
        string $previousStartDate,
        string $previousEndDate
    ): array {
        try {
            $currentReport  = $this->getReport($ownerId, $outletId, $currentStartDate, $currentEndDate);
            $previousReport = $this->getReport($ownerId, $outletId, $previousStartDate, $previousEndDate);

            $comparison = [
                'current'  => $currentReport,
                'previous' => $previousReport,
                'changes'  => [
                    'revenue'         => $this->calculateChange($previousReport['totalRevenue'],    $currentReport['totalRevenue']),
                    'grossProfit'     => $this->calculateChange($previousReport['grossProfit'],     $currentReport['grossProfit']),
                    'operatingProfit' => $this->calculateChange($previousReport['operatingProfit'], $currentReport['operatingProfit']),
                    'netProfit'       => $this->calculateChange($previousReport['netProfit'],       $currentReport['netProfit']),
                ],
            ];

            Log::info('Comparative Profit & Loss report generated', [
                'owner_id'       => $ownerId,
                'outlet_id'      => $outletId,
                'current_period' => ['start' => $currentStartDate, 'end' => $currentEndDate],
                'previous_period' => ['start' => $previousStartDate, 'end' => $previousEndDate],
                'user_id'        => Auth::id(),
                'type'           => 'profit_loss_comparative_report',
            ]);

            return $comparison;
        } catch (Exception $e) {
            Log::error('Failed to generate comparative Profit & Loss report', [
                'owner_id'  => $ownerId,
                'outlet_id' => $outletId,
                'error'     => $e->getMessage(),
                'user_id'   => Auth::id(),
                'type'      => 'profit_loss_service_error',
            ]);
            throw $e;
        }
    }

    public function exportReport(
        int $ownerId,
        int $outletId,
        string $startDate,
        string $endDate,
        string $format = 'array'
    ): array {
        try {
            $report = $this->getReport($ownerId, $outletId, $startDate, $endDate);

            if ($format !== 'array') {
                throw new Exception("Export format '{$format}' not implemented yet");
            }

            Log::info('Profit & Loss report exported', [
                'owner_id'  => $ownerId,
                'outlet_id' => $outletId,
                'period'    => ['start' => $startDate, 'end' => $endDate],
                'format'    => $format,
                'user_id'   => Auth::id(),
                'type'      => 'profit_loss_export',
            ]);

            return $report;
        } catch (Exception $e) {
            Log::error('Failed to export Profit & Loss report', [
                'owner_id'  => $ownerId,
                'outlet_id' => $outletId,
                'start_date' => $startDate,
                'end_date'   => $endDate,
                'format'    => $format,
                'error'     => $e->getMessage(),
                'user_id'   => Auth::id(),
                'type'      => 'profit_loss_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Private — Helpers
    |--------------------------------------------------------------------------
    */

    private function getAccountsWithTransactions(int $ownerId, int $outletId, string $startDate, string $endDate)
    {
        return $this->account
            ->byOwnerId($ownerId)
            ->revenueAndExpense()
            ->isTransactional(true)
            ->with([
                'journalEntries' => function ($query) use ($outletId, $startDate, $endDate) {
                    $query->select('id', 'account_id', 'journal_entry_id', 'debit', 'credit')
                        ->whereHas('journalEntry', function ($q) use ($outletId, $startDate, $endDate) {
                            $q->where('outlet_id', $outletId)->whereBetween('date', [$startDate, $endDate]);
                        });
                },
            ])
            ->orderByTypeAndCode()
            ->get();
    }

    private function groupAccountsBySubtype($accounts): array
    {
        $grouped = [
            'operating_revenue' => [],
            'other_revenue'     => [],
            'cost_of_revenue'   => [],
            'operating_expense' => [],
            'other_expense'     => [],
        ];

        foreach ($accounts as $account) {
            $balance = $account->period_balance;

            if ($balance == 0) {
                continue;
            }

            $subtype = $account->subtype ?? $this->determineDefaultSubtype($account->type);

            if (isset($grouped[$subtype])) {
                $grouped[$subtype][] = [
                    'id'      => $account->id,
                    'code'    => $account->code,
                    'name'    => $account->name,
                    'type'    => $account->type,
                    'subtype' => $subtype,
                    'amount'  => (float) $balance,
                    'debit'   => (float) $account->period_debit,
                    'credit'  => (float) $account->period_credit,
                ];
            }
        }

        return $grouped;
    }

    private function determineDefaultSubtype(string $type): string
    {
        return match ($type) {
            'revenue' => 'operating_revenue',
            'expense' => 'operating_expense',
            default   => 'other',
        };
    }

    private function calculateRevenues(array $groupedAccounts): array
    {
        $items = array_merge($groupedAccounts['operating_revenue'], $groupedAccounts['other_revenue']);

        return ['items' => $items, 'total' => (float) array_sum(array_column($items, 'amount'))];
    }

    private function calculateCOGS(array $groupedAccounts): array
    {
        $items = $groupedAccounts['cost_of_revenue'];

        return ['items' => $items, 'total' => (float) array_sum(array_column($items, 'amount'))];
    }

    private function calculateOperatingExpenses(array $groupedAccounts): array
    {
        $items = $groupedAccounts['operating_expense'];

        return ['items' => $items, 'total' => (float) array_sum(array_column($items, 'amount'))];
    }

    private function calculateOtherRevenues(array $groupedAccounts): array
    {
        $items = $groupedAccounts['other_revenue'];

        return ['items' => $items, 'total' => (float) array_sum(array_column($items, 'amount'))];
    }

    private function calculateOtherExpenses(array $groupedAccounts): array
    {
        $items = $groupedAccounts['other_expense'];

        return ['items' => $items, 'total' => (float) array_sum(array_column($items, 'amount'))];
    }

    private function calculateChange(float $oldValue, float $newValue): array
    {
        $difference = $newValue - $oldValue;
        $percentage = $oldValue != 0 ? (($newValue - $oldValue) / abs($oldValue)) * 100 : 0;

        return [
            'difference' => (float) $difference,
            'percentage' => (float) round($percentage, 2),
            'trend'      => $difference > 0 ? 'increase' : ($difference < 0 ? 'decrease' : 'stable'),
        ];
    }

    private function validateDateRange(string $startDate, string $endDate): void
    {
        $start = Carbon::parse($startDate);
        $end   = Carbon::parse($endDate);

        if ($start->greaterThan($end)) {
            throw new Exception('Start date must be before or equal to end date');
        }
    }
}