<?php

namespace App\Services;

use App\Models\Account;
use App\Models\JournalDetail;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BalanceSheetService
{
    public function __construct(
        protected Account $account,
        protected JournalDetail $journalDetail
    ) {}

    public function getReport(
        int $ownerId,
        int $outletId,
        string $date
    ): array {
        try {
            $this->validateDate($date);

            $assets = $this->getAssetsWithTransactions($ownerId, $outletId, $date);
            $liabilities = $this->getLiabilitiesWithTransactions($ownerId, $outletId, $date);
            $equity = $this->getEquityWithTransactions($ownerId, $outletId, $date);

            $currentEarnings = $this->calculateCurrentEarnings($ownerId, $outletId, $date);

            $groupedAssets = $this->groupAccountsBySubtype($assets);
            $groupedLiabilities = $this->groupAccountsBySubtype($liabilities);
            $groupedEquity = $this->groupAccountsBySubtype($equity);

            $assetsSection = $this->calculateAssets($groupedAssets);
            $liabilitiesSection = $this->calculateLiabilities($groupedLiabilities);
            $equitySection = $this->calculateEquity($groupedEquity, $currentEarnings);

            $totalAssets = $assetsSection['total'];
            $totalLiabilitiesEquity = $liabilitiesSection['total'] + $equitySection['total'];
            $difference = abs($totalAssets - $totalLiabilitiesEquity);
            $isBalanced = $difference < 0.01;

            $report = [
                'date' => $date,
                'assets' => $assetsSection,
                'liabilities' => $liabilitiesSection,
                'equity' => $equitySection,
                'summary' => [
                    'totalAssets' => (float) $totalAssets,
                    'totalLiabilitiesEquity' => (float) $totalLiabilitiesEquity,
                    'difference' => (float) $difference,
                    'isBalanced' => $isBalanced,
                ],
            ];

            Log::info('Balance Sheet report generated successfully', [
                'owner_id' => $ownerId,
                'outlet_id' => $outletId,
                'date' => $date,
                'total_assets' => $totalAssets,
                'total_liabilities_equity' => $totalLiabilitiesEquity,
                'is_balanced' => $isBalanced,
                'user_id' => Auth::id(),
                'type' => 'balance_sheet_report'
            ]);

            if (!$isBalanced) {
                Log::warning('Balance Sheet is not balanced', [
                    'owner_id' => $ownerId,
                    'outlet_id' => $outletId,
                    'date' => $date,
                    'total_assets' => $totalAssets,
                    'total_liabilities_equity' => $totalLiabilitiesEquity,
                    'difference' => $difference,
                    'user_id' => Auth::id(),
                    'type' => 'balance_sheet_unbalanced'
                ]);
            }

            return $report;
        } catch (Exception $e) {
            Log::error('Failed to generate Balance Sheet report', [
                'owner_id' => $ownerId,
                'outlet_id' => $outletId,
                'date' => $date,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'type' => 'balance_sheet_service_error'
            ]);
            throw $e;
        }
    }

    public function getComparativeReport(
        int $ownerId,
        int $outletId,
        string $currentDate,
        string $previousDate
    ): array {
        try {
            $currentReport = $this->getReport($ownerId, $outletId, $currentDate);
            $previousReport = $this->getReport($ownerId, $outletId, $previousDate);

            $comparison = [
                'current' => $currentReport,
                'previous' => $previousReport,
                'changes' => [
                    'assets' => $this->calculateChange(
                        $previousReport['summary']['totalAssets'],
                        $currentReport['summary']['totalAssets']
                    ),
                    'liabilities' => $this->calculateChange(
                        $previousReport['liabilities']['total'],
                        $currentReport['liabilities']['total']
                    ),
                    'equity' => $this->calculateChange(
                        $previousReport['equity']['total'],
                        $currentReport['equity']['total']
                    ),
                ],
            ];

            Log::info('Comparative Balance Sheet report generated successfully', [
                'owner_id' => $ownerId,
                'outlet_id' => $outletId,
                'current_date' => $currentDate,
                'previous_date' => $previousDate,
                'user_id' => Auth::id(),
                'type' => 'balance_sheet_comparative_report'
            ]);

            return $comparison;
        } catch (Exception $e) {
            Log::error('Failed to generate comparative Balance Sheet report', [
                'owner_id' => $ownerId,
                'outlet_id' => $outletId,
                'current_date' => $currentDate,
                'previous_date' => $previousDate,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'balance_sheet_service_error'
            ]);
            throw $e;
        }
    }

    private function getAssetsWithTransactions(
        int $ownerId,
        int $outletId,
        string $date
    ) {
        try {
            return $this->account
                ->byOwnerId($ownerId)
                ->assets()
                ->isTransactional(true)
                ->withTransactionsUntil($outletId, $date)
                ->orderBy('code', 'asc')
                ->get();
        } catch (Exception $e) {
            Log::error('Failed to get assets with transactions', [
                'owner_id' => $ownerId,
                'outlet_id' => $outletId,
                'date' => $date,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'balance_sheet_service_error'
            ]);
            throw $e;
        }
    }

    private function getLiabilitiesWithTransactions(
        int $ownerId,
        int $outletId,
        string $date
    ) {
        try {
            return $this->account
                ->byOwnerId($ownerId)
                ->liabilities()
                ->isTransactional(true)
                ->withTransactionsUntil($outletId, $date)
                ->orderBy('code', 'asc')
                ->get();
        } catch (Exception $e) {
            Log::error('Failed to get liabilities with transactions', [
                'owner_id' => $ownerId,
                'outlet_id' => $outletId,
                'date' => $date,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'balance_sheet_service_error'
            ]);
            throw $e;
        }
    }

    private function getEquityWithTransactions(
        int $ownerId,
        int $outletId,
        string $date
    ) {
        try {
            return $this->account
                ->byOwnerId($ownerId)
                ->equity()
                ->isTransactional(true)
                ->withTransactionsUntil($outletId, $date)
                ->orderBy('code', 'asc')
                ->get();
        } catch (Exception $e) {
            Log::error('Failed to get equity with transactions', [
                'owner_id' => $ownerId,
                'outlet_id' => $outletId,
                'date' => $date,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'balance_sheet_service_error'
            ]);
            throw $e;
        }
    }

    private function calculateCurrentEarnings(
        int $ownerId,
        int $outletId,
        string $date
    ): float {
        try {
            $startOfYear = Carbon::parse($date)->startOfYear()->format('Y-m-d');
            
            /** @var object|null $totals */
            $totals = DB::table('journal_details')
                ->join('journal_entries', 'journal_details.journal_entry_id', '=', 'journal_entries.id')
                ->join('accounts', 'journal_details.account_id', '=', 'accounts.id')
                ->where('accounts.owner_id', $ownerId)
                ->where('accounts.is_transactional', true)
                ->where('journal_entries.outlet_id', $outletId)
                ->whereBetween('journal_entries.date', [$startOfYear, $date])
                ->whereNull('journal_entries.deleted_at')
                ->whereIn('accounts.type', ['revenue', 'expense'])
                ->selectRaw("
                    SUM(CASE WHEN accounts.type = 'revenue' THEN journal_details.credit - journal_details.debit ELSE 0 END) as net_revenue,
                    SUM(CASE WHEN accounts.type = 'expense' THEN journal_details.debit - journal_details.credit ELSE 0 END) as net_expense
                ")
                ->first();

            $totalRevenue = $totals ? (float) $totals->net_revenue : 0.0;
            $totalExpense = $totals ? (float) $totals->net_expense : 0.0;

            $currentEarnings = $totalRevenue - $totalExpense;

            Log::info('Current earnings calculated', [
                'owner_id' => $ownerId,
                'outlet_id' => $outletId,
                'period_start' => $startOfYear,
                'period_end' => $date,
                'total_revenue' => $totalRevenue,
                'total_expense' => $totalExpense,
                'current_earnings' => $currentEarnings,
                'user_id' => Auth::id(),
                'type' => 'balance_sheet_earnings_calculation'
            ]);

            return (float) $currentEarnings;
        } catch (Exception $e) {
            Log::error('Failed to calculate current earnings', [
                'owner_id' => $ownerId,
                'outlet_id' => $outletId,
                'date' => $date,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'balance_sheet_service_error'
            ]);
            throw $e;
        }
    }

    private function groupAccountsBySubtype($accounts): array
    {
        $grouped = [];

        foreach ($accounts as $account) {
            $balance = $account->snapshot_balance;

            if ($balance == 0) {
                continue;
            }

            $subtype = $account->subtype ?? $this->determineDefaultSubtype($account->type);

            if (!isset($grouped[$subtype])) {
                $grouped[$subtype] = [];
            }

            $grouped[$subtype][] = [
                'id' => $account->id,
                'code' => $account->code,
                'name' => $account->name,
                'type' => $account->type,
                'subtype' => $subtype,
                'amount' => (float) $balance,
                'debit' => (float) $account->snapshot_debit,
                'credit' => (float) $account->snapshot_credit,
            ];
        }

        return $grouped;
    }

    private function determineDefaultSubtype(string $type): string
    {
        return match ($type) {
            'asset' => 'current_assets',
            'liability' => 'current_liabilities',
            'equity' => 'owner_equity',
            default => 'other',
        };
    }

    private function calculateAssets(array $groupedAccounts): array
    {
        $sections = [];
        $grandTotal = 0;

        foreach ($groupedAccounts as $subtype => $items) {
            $total = array_sum(array_column($items, 'amount'));
            $sections[$subtype] = [
                'items' => $items,
                'total' => (float) $total,
            ];
            $grandTotal += $total;
        }

        return [
            'sections' => $sections,
            'total' => (float) $grandTotal,
        ];
    }

    private function calculateLiabilities(array $groupedAccounts): array
    {
        $sections = [];
        $grandTotal = 0;

        foreach ($groupedAccounts as $subtype => $items) {
            $total = array_sum(array_column($items, 'amount'));
            $sections[$subtype] = [
                'items' => $items,
                'total' => (float) $total,
            ];
            $grandTotal += $total;
        }

        return [
            'sections' => $sections,
            'total' => (float) $grandTotal,
        ];
    }

    private function calculateEquity(array $groupedAccounts, float $currentEarnings): array
    {
        $sections = [];
        $grandTotal = 0;

        foreach ($groupedAccounts as $subtype => $items) {
            $total = array_sum(array_column($items, 'amount'));
            $sections[$subtype] = [
                'items' => $items,
                'total' => (float) $total,
            ];
            $grandTotal += $total;
        }

        if (!isset($sections['retained_earnings'])) {
            $sections['retained_earnings'] = [
                'items' => [],
                'total' => 0,
            ];
        }

        $sections['retained_earnings']['items'][] = [
            'id' => null,
            'code' => 'VIRTUAL',
            'name' => 'Laba Tahun Berjalan',
            'type' => 'equity',
            'subtype' => 'retained_earnings',
            'amount' => (float) $currentEarnings,
            'debit' => 0,
            'credit' => 0,
            'isVirtual' => true,
        ];

        $sections['retained_earnings']['total'] += $currentEarnings;
        $grandTotal += $currentEarnings;

        return [
            'sections' => $sections,
            'total' => (float) $grandTotal,
        ];
    }

    private function calculateChange(float $oldValue, float $newValue): array
    {
        $difference = $newValue - $oldValue;
        $percentage = $oldValue != 0
            ? (($newValue - $oldValue) / abs($oldValue)) * 100
            : 0;

        return [
            'difference' => (float) $difference,
            'percentage' => (float) round($percentage, 2),
            'trend' => $difference > 0 ? 'increase' : ($difference < 0 ? 'decrease' : 'stable'),
        ];
    }

    private function validateDate(string $date): void
    {
        try {
            Carbon::parse($date);
        } catch (Exception $e) {
            Log::error('Invalid date format', [
                'date' => $date,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'balance_sheet_service_error'
            ]);
            throw new Exception('Invalid date format provided');
        }
    }

    public function exportReport(
        int $ownerId,
        int $outletId,
        string $date,
        string $format = 'array'
    ): array {
        try {
            $report = $this->getReport($ownerId, $outletId, $date);

            if ($format !== 'array') {
                throw new Exception("Export format '{$format}' not implemented yet");
            }

            Log::info('Balance Sheet report exported successfully', [
                'owner_id' => $ownerId,
                'outlet_id' => $outletId,
                'date' => $date,
                'format' => $format,
                'user_id' => Auth::id(),
                'type' => 'balance_sheet_export'
            ]);

            return $report;
        } catch (Exception $e) {
            Log::error('Failed to export Balance Sheet report', [
                'owner_id' => $ownerId,
                'outlet_id' => $outletId,
                'date' => $date,
                'format' => $format,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'balance_sheet_service_error'
            ]);
            throw $e;
        }
    }

    public function getAccountBalance(
        int $ownerId,
        int $accountId,
        int $outletId,
        string $date
    ): float {
        try {
            $account = $this->account
                ->byOwnerId($ownerId)
                ->byId($accountId)
                ->withTransactionsUntil($outletId, $date)
                ->first();

            if (!$account) {
                throw new Exception("Account not found");
            }

            return (float) $account->snapshot_balance;
        } catch (Exception $e) {
            Log::error('Failed to get account balance', [
                'owner_id' => $ownerId,
                'account_id' => $accountId,
                'outlet_id' => $outletId,
                'date' => $date,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'balance_sheet_service_error'
            ]);
            throw $e;
        }
    }
}