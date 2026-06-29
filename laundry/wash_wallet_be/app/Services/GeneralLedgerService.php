<?php

namespace App\Services;

use App\Models\Account;
use App\Models\JournalDetail;
use App\Models\JournalEntry;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GeneralLedgerService extends BaseService
{
    public function __construct(
        protected Account $account,
        protected JournalEntry $journalEntry,
        protected JournalDetail $journalDetail,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Read Methods
    |--------------------------------------------------------------------------
    */

    public function getLedger(
        int $outletId,
        int $accountId,
        string $startDate,
        string $endDate
    ): array {
        try {
            $account       = $this->getAccountById($accountId);
            $normalBalance = $this->determineNormalBalance($account->type);

            $this->validateDateRange($startDate, $endDate);

            $openingBalance = $this->calculateOpeningBalance($outletId, $accountId, $startDate, $normalBalance);
            $transactions   = $this->getTransactions($outletId, $accountId, $startDate, $endDate);
            $transactionsWithBalance = $this->calculateRunningBalance($transactions, $openingBalance, $normalBalance);

            $closingBalance = $transactionsWithBalance->isEmpty()
                ? $openingBalance
                : $transactionsWithBalance->last()->running_balance;

            Log::info('General ledger generated successfully', [
                'outlet_id'          => $outletId,
                'account_id'         => $accountId,
                'account_code'       => $account->code,
                'period'             => ['start' => $startDate, 'end' => $endDate],
                'opening_balance'    => $openingBalance,
                'closing_balance'    => $closingBalance,
                'transactions_count' => $transactionsWithBalance->count(),
                'user_id'            => Auth::id(),
                'type'               => 'general_ledger_report',
            ]);

            return [
                'account'         => $account,
                'period'          => ['start' => $startDate, 'end' => $endDate],
                'opening_balance' => (float) $openingBalance,
                'transactions'    => $transactionsWithBalance,
                'closing_balance' => (float) $closingBalance,
            ];
        } catch (Exception $e) {
            Log::error('Failed to generate general ledger', [
                'outlet_id'  => $outletId,
                'account_id' => $accountId,
                'start_date' => $startDate,
                'end_date'   => $endDate,
                'error'      => $e->getMessage(),
                'user_id'    => Auth::id(),
                'type'       => 'general_ledger_service_error',
            ]);
            throw $e;
        }
    }

    public function getLedgerByMultipleAccounts(
        int $outletId,
        array $accountIds,
        string $startDate,
        string $endDate
    ): array {
        try {
            $this->validateDateRange($startDate, $endDate);

            $ledgers = array_map(
                fn($accountId) => $this->getLedger($outletId, $accountId, $startDate, $endDate),
                $accountIds
            );

            Log::info('Multiple general ledgers generated', [
                'outlet_id'      => $outletId,
                'account_ids'    => $accountIds,
                'accounts_count' => count($accountIds),
                'period'         => ['start' => $startDate, 'end' => $endDate],
                'user_id'        => Auth::id(),
                'type'           => 'general_ledger_report',
            ]);

            return [
                'period'  => ['start' => $startDate, 'end' => $endDate],
                'ledgers' => $ledgers,
            ];
        } catch (Exception $e) {
            Log::error('Failed to generate multiple general ledgers', [
                'outlet_id'   => $outletId,
                'account_ids' => $accountIds,
                'start_date'  => $startDate,
                'end_date'    => $endDate,
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'general_ledger_service_error',
            ]);
            throw $e;
        }
    }

    public function getLedgerSummary(
        int $outletId,
        string $startDate,
        string $endDate,
        ?string $accountType = null
    ): array {
        try {
            $this->validateDateRange($startDate, $endDate);

            $query = $this->account->query()->isTransactional(true);

            if ($accountType) {
                $query->byType($accountType);
            }

            $accounts = $query->orderBy('code', 'asc')->get();

            $aggregates = $this->journalDetail->query()
                ->select('account_id')
                ->selectRaw('SUM(CASE WHEN journal_entries.date < ? THEN debit ELSE 0 END) as opening_debit', [$startDate])
                ->selectRaw('SUM(CASE WHEN journal_entries.date < ? THEN credit ELSE 0 END) as opening_credit', [$startDate])
                ->selectRaw('SUM(CASE WHEN journal_entries.date BETWEEN ? AND ? THEN debit ELSE 0 END) as period_debit', [$startDate, $endDate])
                ->selectRaw('SUM(CASE WHEN journal_entries.date BETWEEN ? AND ? THEN credit ELSE 0 END) as period_credit', [$startDate, $endDate])
                ->selectRaw('COUNT(CASE WHEN journal_entries.date BETWEEN ? AND ? THEN journal_details.id ELSE NULL END) as period_count', [$startDate, $endDate])
                ->join('journal_entries', 'journal_entries.id', '=', 'journal_details.journal_entry_id')
                ->where('journal_entries.outlet_id', $outletId)
                ->where('journal_entries.date', '<=', $endDate)
                ->whereIn('account_id', $accounts->pluck('id'))
                ->groupBy('account_id')
                ->get()
                ->keyBy('account_id');

            $summary             = [];
            $totalOpeningBalance = 0;
            $totalClosingBalance = 0;

            foreach ($accounts as $account) {
                $agg = $aggregates->get($account->id);

                $openingDebit  = (float) ($agg->opening_debit  ?? 0);
                $openingCredit = (float) ($agg->opening_credit ?? 0);
                $periodDebit   = (float) ($agg->period_debit   ?? 0);
                $periodCredit  = (float) ($agg->period_credit  ?? 0);
                $periodCount   = (int)   ($agg->period_count   ?? 0);

                $normalBalance = $this->determineNormalBalance($account->type);

                $openingBalance = $normalBalance === 'debit'
                    ? $openingDebit - $openingCredit
                    : $openingCredit - $openingDebit;

                $mutation = $normalBalance === 'debit'
                    ? $periodDebit - $periodCredit
                    : $periodCredit - $periodDebit;

                $closingBalance = $openingBalance + $mutation;

                $summary[] = [
                    'account_id'         => $account->id,
                    'account_code'       => $account->code,
                    'account_name'       => $account->name,
                    'account_type'       => $account->type,
                    'opening_balance'    => $openingBalance,
                    'closing_balance'    => $closingBalance,
                    'total_debit'        => $periodDebit,
                    'total_credit'       => $periodCredit,
                    'transactions_count' => $periodCount,
                ];

                $totalOpeningBalance += $openingBalance;
                $totalClosingBalance += $closingBalance;
            }

            Log::info('General ledger summary generated', [
                'outlet_id'              => $outletId,
                'account_type'           => $accountType,
                'period'                 => ['start' => $startDate, 'end' => $endDate],
                'accounts_count'         => count($summary),
                'total_opening_balance'  => $totalOpeningBalance,
                'total_closing_balance'  => $totalClosingBalance,
                'user_id'                => Auth::id(),
                'type'                   => 'general_ledger_report',
            ]);

            return [
                'period'               => ['start' => $startDate, 'end' => $endDate],
                'account_type'         => $accountType,
                'summary'              => $summary,
                'total_opening_balance' => $totalOpeningBalance,
                'total_closing_balance' => $totalClosingBalance,
            ];
        } catch (Exception $e) {
            Log::error('Failed to generate general ledger summary', [
                'outlet_id'    => $outletId,
                'account_type' => $accountType,
                'start_date'   => $startDate,
                'end_date'     => $endDate,
                'error'        => $e->getMessage(),
                'user_id'      => Auth::id(),
                'type'         => 'general_ledger_service_error',
            ]);
            throw $e;
        }
    }

    public function exportLedger(
        int $outletId,
        int $accountId,
        string $startDate,
        string $endDate,
        string $format = 'array'
    ): array {
        try {
            $ledger = $this->getLedger($outletId, $accountId, $startDate, $endDate);

            if ($format !== 'array') {
                throw new Exception("Export format '{$format}' not implemented yet");
            }

            $exportData = [
                'account' => [
                    'id'   => $ledger['account']->id,
                    'code' => $ledger['account']->code,
                    'name' => $ledger['account']->name,
                    'type' => $ledger['account']->type,
                ],
                'period'          => $ledger['period'],
                'opening_balance' => $ledger['opening_balance'],
                'closing_balance' => $ledger['closing_balance'],
                'transactions'    => $ledger['transactions']->map(fn($t) => [
                    'id'                 => $t->id,
                    'date'               => $t->journalEntry->date->format('Y-m-d'),
                    'transaction_number' => $t->journalEntry->transaction_number,
                    'description'        => $t->journalEntry->description,
                    'memo'               => $t->memo,
                    'debit'              => $t->debit,
                    'credit'             => $t->credit,
                    'mutation'           => $t->mutation,
                    'running_balance'    => $t->running_balance,
                    'is_manual'          => $t->journalEntry->is_manual,
                ])->toArray(),
                'summary' => [
                    'total_debit'        => $ledger['transactions']->sum('debit'),
                    'total_credit'       => $ledger['transactions']->sum('credit'),
                    'net_change'         => $ledger['closing_balance'] - $ledger['opening_balance'],
                    'transactions_count' => $ledger['transactions']->count(),
                ],
            ];

            Log::info('General ledger exported successfully', [
                'outlet_id'          => $outletId,
                'account_id'         => $accountId,
                'period'             => ['start' => $startDate, 'end' => $endDate],
                'format'             => $format,
                'transactions_count' => count($exportData['transactions']),
                'user_id'            => Auth::id(),
                'type'               => 'general_ledger_export',
            ]);

            return $exportData;
        } catch (Exception $e) {
            Log::error('Failed to export general ledger', [
                'outlet_id'  => $outletId,
                'account_id' => $accountId,
                'start_date' => $startDate,
                'end_date'   => $endDate,
                'format'     => $format,
                'error'      => $e->getMessage(),
                'user_id'    => Auth::id(),
                'type'       => 'general_ledger_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Private — Helpers
    |--------------------------------------------------------------------------
    */

    private function getAccountById(int $accountId): Account
    {
        try {
            return $this->account->query()
                ->byId($accountId)
                ->isTransactional(true)
                ->firstOrFail();
        } catch (Exception $e) {
            Log::error('Account not found or not transactional', [
                'account_id' => $accountId,
                'error'      => $e->getMessage(),
                'user_id'    => Auth::id(),
                'type'       => 'general_ledger_service_error',
            ]);
            throw new Exception("Account with ID {$accountId} not found or not transactional");
        }
    }

    private function validateDateRange(string $startDate, string $endDate): void
    {
        $start = Carbon::parse($startDate);
        $end   = Carbon::parse($endDate);

        if ($start->greaterThan($end)) {
            throw new Exception('Start date must be before or equal to end date');
        }
    }

    private function determineNormalBalance(string $accountType): string
    {
        return in_array($accountType, ['asset', 'expense']) ? 'debit' : 'credit';
    }

    private function calculateOpeningBalance(
        int $outletId,
        int $accountId,
        string $startDate,
        string $normalBalance
    ): float {
        try {
            $result = $this->journalDetail
                ->select(
                    DB::raw('COALESCE(SUM(debit), 0) as total_debit'),
                    DB::raw('COALESCE(SUM(credit), 0) as total_credit')
                )
                ->whereHas('journalEntry', function (Builder $query) use ($outletId, $startDate) {
                    $query->where('outlet_id', $outletId)->where('date', '<', $startDate);
                })
                ->where('account_id', $accountId)
                ->first();

            $totalDebit  = (float) ($result->total_debit  ?? 0);
            $totalCredit = (float) ($result->total_credit ?? 0);

            return $normalBalance === 'debit'
                ? $totalDebit - $totalCredit
                : $totalCredit - $totalDebit;
        } catch (Exception $e) {
            Log::error('Failed to calculate opening balance', [
                'outlet_id'      => $outletId,
                'account_id'     => $accountId,
                'start_date'     => $startDate,
                'normal_balance' => $normalBalance,
                'error'          => $e->getMessage(),
                'user_id'        => Auth::id(),
                'type'           => 'general_ledger_service_error',
            ]);
            throw $e;
        }
    }

    private function getTransactions(
        int $outletId,
        int $accountId,
        string $startDate,
        string $endDate
    ) {
        return $this->journalDetail
            ->with([
                'journalEntry' => fn($q) => $q->select('id', 'outlet_id', 'transaction_number', 'date', 'description', 'reference_type', 'reference_id', 'is_manual'),
                'account'      => fn($q) => $q->select('id', 'code', 'name', 'type'),
            ])
            ->join('journal_entries', 'journal_entries.id', '=', 'journal_details.journal_entry_id')
            ->where('journal_entries.outlet_id', $outletId)
            ->whereBetween('journal_entries.date', [$startDate, $endDate])
            ->where('journal_details.account_id', $accountId)
            ->orderBy('journal_entries.date', 'asc')
            ->orderBy('journal_details.created_at', 'asc')
            ->select('journal_details.*')
            ->get();
    }

    private function calculateRunningBalance($transactions, float $openingBalance, string $normalBalance)
    {
        $runningBalance = $openingBalance;

        return $transactions->map(function ($transaction) use (&$runningBalance, $normalBalance) {
            $debit  = (float) $transaction->debit;
            $credit = (float) $transaction->credit;

            $mutation = $normalBalance === 'debit' ? $debit - $credit : $credit - $debit;

            $runningBalance += $mutation;

            $transaction->mutation        = $mutation;
            $transaction->running_balance = $runningBalance;

            return $transaction;
        });
    }
}
