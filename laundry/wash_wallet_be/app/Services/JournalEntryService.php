<?php

namespace App\Services;

use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\JournalDetail;
use App\Models\JournalEntry;
use App\Models\Outlet;
use Carbon\Carbon;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class JournalEntryService extends BaseService
{
    public function __construct(
        protected JournalEntry $journalEntry,
        protected JournalDetail $journalDetail,
        protected Account $account,
        protected AccountingPeriod $accountingPeriod,
        protected Outlet $outlet
    ) {}

    /**
     * Get all journal entries with filters and pagination
     */
    public function getAll(
        array $filters = [],
        ?int $page = null,
        ?int $perPage = null,
        array $relations = ['outlet', 'journalDetails.account']
    ): LengthAwarePaginator|Collection {
        try {
            $query = $this->journalEntry->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (! empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get journal entries', [
                'filters' => $filters,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'journal_entry_service_error',
            ]);
            throw $e;
        }
    }

    /**
     * Get journal entry by ID
     */
    public function getById(
        int $id,
        array $relations = ['outlet', 'journalDetails.account', 'reference']
    ): JournalEntry {
        try {
            $query = $this->journalEntry->query()->byId($id);

            if (! empty($relations)) {
                $query->with($relations);
            }

            return $query->firstOrFail();
        } catch (Exception $e) {
            Log::error('Failed to get journal entry by ID', [
                'journal_entry_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'journal_entry_service_error',
            ]);
            throw $e;
        }
    }

    /**
     * Create new journal entry
     */
    public function store(array $data): JournalEntry
    {
        return DB::transaction(function () use ($data) {
            try {
                $user = Auth::user();
                $transactionDate = isset($data['date']) ? Carbon::parse($data['date']) : now();
                $period = $this->accountingPeriod
                    ->byOutletId($data['outletId'])
                    ->containingDate($transactionDate)
                    ->first();

                if ($period && $period->is_closed) {
                    throw new Exception('Cannot create journal entry. Accounting period is closed.');
                }

                $transactionNumber = $this->journalEntry->generateTransactionNumber($data['outletId']);

                if (empty($data['journalDetails']) || ! is_array($data['journalDetails'])) {
                    throw new Exception('Journal entry must have at least one detail');
                }

                $totalDebit = 0;
                $totalCredit = 0;

                foreach ($data['journalDetails'] as $detail) {
                    $totalDebit += $detail['debit'] ?? 0;
                    $totalCredit += $detail['credit'] ?? 0;
                }

                if (abs($totalDebit - $totalCredit) >= 0.01) {
                    throw new Exception('Journal entry must be balanced. Debit and Credit totals must match.');
                }

                $journalEntry = $this->journalEntry->create([
                    'outlet_id' => $data['outletId'],
                    'transaction_number' => $transactionNumber,
                    'date' => $data['date'] ?? now(),
                    'description' => $data['description'] ?? null,
                    'reference_type' => $data['referenceType'] ?? null,
                    'reference_id' => $data['referenceId'] ?? null,
                    'is_manual' => $data['isManual'] ?? true,
                    'total_amount' => max($totalDebit, $totalCredit),
                ]);

                foreach ($data['journalDetails'] as $journalDetail) {
                    $journalEntry->journalDetails()->create([
                        'account_id' => $journalDetail['accountId'],
                        'debit' => $journalDetail['debit'] ?? 0,
                        'credit' => $journalDetail['credit'] ?? 0,
                        'memo' => $journalDetail['memo'] ?? null,
                    ]);
                }

                Log::info('Journal entry created successfully', [
                    'journal_entry_id' => $journalEntry->id,
                    'transaction_number' => $journalEntry->transaction_number,
                    'outlet_id' => $data['outletId'],
                    'total_amount' => $journalEntry->total_amount,
                    'details_count' => count($data['journalDetails']),
                    'is_manual' => $journalEntry->is_manual,
                    'created_by' => $user?->id ?? 'system',
                    'type' => 'journal_entry_action',
                ]);

                return $journalEntry->load(['outlet', 'journalDetails.account']);
            } catch (Exception $e) {
                Log::error('Failed to create journal entry', [
                    'outlet_id' => $data['outletId'],
                    'data' => $data,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => Auth::id(),
                    'type' => 'journal_entry_service_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Update existing journal entry
     */
    public function update(int $id, array $data): JournalEntry
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $user = Auth::user();

                $journalEntry = $this->journalEntry->findOrFail($id);

                if (! $journalEntry->canBeEdited()) {
                    throw new Exception('Cannot edit journal entry. Accounting period is closed.');
                }

                if (isset($data['date'])) {
                    $period = $this->accountingPeriod
                        ->byOutletId($journalEntry->outlet_id)
                        ->containingDate($data['date'])
                        ->first();

                    if ($period && $period->is_closed) {
                        throw new Exception('Cannot update date. Target accounting period is closed.');
                    }

                    $journalEntry->date = $data['date'];
                }

                if (isset($data['description'])) {
                    $journalEntry->description = $data['description'];
                }

                $journalEntry->save();

                if (isset($data['journalDetails']) && is_array($data['journalDetails'])) {
                    $totalDebit = 0;
                    $totalCredit = 0;

                    foreach ($data['journalDetails'] as $journalDetail) {
                        $totalDebit += $journalDetail['debit'] ?? 0;
                        $totalCredit += $journalDetail['credit'] ?? 0;
                    }

                    if (abs($totalDebit - $totalCredit) >= 0.01) {
                        throw new Exception('Journal entry must be balanced. Debit and Credit totals must match.');
                    }

                    $journalEntry->journalDetails()->delete();

                    foreach ($data['journalDetails'] as $journalDetail) {
                        $journalEntry->journalDetails()->create([
                            'account_id' => $journalDetail['accountId'],
                            'debit' => $journalDetail['debit'] ?? 0,
                            'credit' => $journalDetail['credit'] ?? 0,
                            'memo' => $journalDetail['memo'] ?? null,
                        ]);
                    }

                    $journalEntry->update([
                        'total_amount' => max($totalDebit, $totalCredit),
                    ]);
                }

                Log::info('Journal entry updated successfully', [
                    'journal_entry_id' => $id,
                    'transaction_number' => $journalEntry->transaction_number,
                    'details_updated' => isset($data['journalDetails']),
                    'updated_by' => $user?->id ?? 'system',
                    'is_automatic' => ! $journalEntry->is_manual,
                    'type' => 'journal_entry_action',
                ]);

                return $journalEntry->fresh(['outlet', 'journalDetails.account']);
            } catch (Exception $e) {
                Log::error('Failed to update journal entry', [
                    'journal_entry_id' => $id,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'journal_entry_service_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Soft delete journal entry
     */
    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $user = Auth::user();

                $journalEntry = $this->journalEntry->findOrFail($id);

                if (! $journalEntry->canBeDeleted()) {
                    throw new Exception('Cannot delete this journal entry. Either accounting period is closed or entry is automatic.');
                }

                $transactionNumber = $journalEntry->transaction_number;
                $deleted = $journalEntry->delete();

                if ($deleted) {
                    Log::info('Journal entry soft deleted successfully', [
                        'journal_entry_id' => $id,
                        'transaction_number' => $transactionNumber,
                        'outlet_id' => $journalEntry->outlet_id,
                        'deleted_by' => $user?->id ?? 'system',
                        'type' => 'journal_entry_action',
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to delete journal entry', [
                    'journal_entry_id' => $id,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'journal_entry_service_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Restore soft deleted journal entry
     */
    public function restore(int $id): JournalEntry
    {
        return DB::transaction(function () use ($id) {
            try {
                $user = Auth::user();

                $journalEntry = $this->journalEntry->withTrashed()->findOrFail($id);

                $this->applyTenantScope($journalEntry->newQuery());

                if (! $journalEntry->trashed()) {
                    throw new Exception('Journal entry is not deleted');
                }

                if (! $journalEntry->canBeEdited()) {
                    throw new Exception('Cannot restore journal entry. Accounting period is closed.');
                }

                $journalEntry->restore();

                Log::info('Journal entry restored successfully', [
                    'journal_entry_id' => $id,
                    'transaction_number' => $journalEntry->transaction_number,
                    'restored_by' => $user?->id ?? 'system',
                    'type' => 'journal_entry_action',
                ]);

                return $journalEntry->fresh(['outlet', 'journalDetails.account']);
            } catch (Exception $e) {
                Log::error('Failed to restore journal entry', [
                    'journal_entry_id' => $id,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'journal_entry_service_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Permanently delete journal entry
     */
    public function forceDestroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $user = Auth::user();

                $journalEntry = $this->journalEntry->withTrashed()->findOrFail($id);

                $transactionNumber = $journalEntry->transaction_number;
                $deleted = $journalEntry->forceDelete();

                if ($deleted) {
                    Log::info('Journal entry permanently deleted', [
                        'journal_entry_id' => $id,
                        'transaction_number' => $transactionNumber,
                        'outlet_id' => $journalEntry->outlet_id,
                        'deleted_by' => $user?->id ?? 'system',
                        'type' => 'journal_entry_action',
                    ]);
                }

                return $deleted;
            } catch (Exception $e) {
                Log::error('Failed to force delete journal entry', [
                    'journal_entry_id' => $id,
                    'error' => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type' => 'journal_entry_service_error',
                ]);
                throw $e;
            }
        });
    }

    /**
     * Calculate account balance from journal entries
     */
    public function calculateAccountBalance(
        int $accountId,
        ?string $endDate = null,
        ?int $outletId = null
    ): float {
        try {
            $query = $this->journalDetail
                ->byAccountId($accountId)
                ->whereHas('journalEntry', function ($q) use ($endDate, $outletId) {
                    $this->applyTenantScope($q);

                    if ($endDate) {
                        $q->byDateTo($endDate);
                    }

                    if ($outletId) {
                        $q->where('outlet_id', $outletId);
                    }
                });

            $totalDebit = $query->sum('debit');
            $totalCredit = $query->sum('credit');

            $balance = $totalDebit - $totalCredit;

            Log::debug('Account balance calculated', [
                'account_id' => $accountId,
                'end_date' => $endDate,
                'outlet_id' => $outletId,
                'total_debit' => $totalDebit,
                'total_credit' => $totalCredit,
                'balance' => $balance,
                'user_id' => Auth::id(),
                'type' => 'journal_entry_calculation',
            ]);

            return (float) $balance;
        } catch (Exception $e) {
            Log::error('Failed to calculate account balance', [
                'account_id' => $accountId,
                'end_date' => $endDate,
                'outlet_id' => $outletId,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'journal_entry_service_error',
            ]);

            return 0.0;
        }
    }

    /**
     * Get trial balance for outlet
     */
    public function getTrialBalance(int $outletId, ?string $endDate = null): Collection
    {
        try {
            $query = $this->journalDetail
                ->selectRaw('account_id, SUM(debit) as total_debit, SUM(credit) as total_credit')
                ->whereHas('journalEntry', function ($q) use ($outletId, $endDate) {
                    $q->where('outlet_id', $outletId);

                    if ($endDate) {
                        $q->whereDate('date', '<=', $endDate);
                    }

                    $this->applyTenantScope($q);
                })
                ->with('account')
                ->groupBy('account_id')
                ->get()
                ->map(function ($detail) {
                    $balance = $detail->total_debit - $detail->total_credit;

                    return [
                        'account_id' => $detail->account_id,
                        'account_code' => $detail->account->code ?? null,
                        'account_name' => $detail->account->name ?? null,
                        'account_type' => $detail->account->type ?? null,
                        'total_debit' => (float) $detail->total_debit,
                        'total_credit' => (float) $detail->total_credit,
                        'balance' => $balance,
                    ];
                });

            Log::debug('Trial balance retrieved', [
                'outlet_id' => $outletId,
                'end_date' => $endDate,
                'accounts_count' => $query->count(),
                'user_id' => Auth::id(),
                'type' => 'journal_entry_report',
            ]);

            return $query;
        } catch (Exception $e) {
            Log::error('Failed to get trial balance', [
                'outlet_id' => $outletId,
                'end_date' => $endDate,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'type' => 'journal_entry_service_error',
            ]);
            throw $e;
        }
    }



    /**
     * Apply filters to the query using Builder
     */
    private function applyFilters(Builder &$query, array $filters = []): void
    {
        if (! empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (! empty($filters['outletId'])) {
            $query->byOutletId($filters['outletId']);
        }

        if (isset($filters['isManual'])) {
            $query->where('is_manual', $filters['isManual']);
        }

        if (! empty($filters['referenceType'])) {
            $query->byReferenceType($filters['referenceType']);
        }

        if (! empty($filters['dateFrom'])) {
            $query->byDateFrom($filters['dateFrom']);
        }

        if (! empty($filters['dateTo'])) {
            $query->byDateTo($filters['dateTo']);
        }

        if (isset($filters['minAmount'])) {
            $query->minAmount($filters['minAmount']);
        }

        if (isset($filters['maxAmount'])) {
            $query->maxAmount($filters['maxAmount']);
        }

        if (isset($filters['balanced']) && $filters['balanced'] === true) {
            $query->balanced();
        }

        $sortBy = $filters['sortBy'] ?? 'createdAt';
        $sortDirection = $filters['sortDirection'] ?? 'desc';

        $query->sortBy($sortBy, $sortDirection);
    }
}
