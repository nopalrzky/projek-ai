<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Employee;
use App\Models\Expense;
use App\Models\Outlet;
use App\Models\User;
use App\Notifications\ExpenseRequestNotification;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ExpenseService extends BaseService
{
    public function __construct(
        protected Expense $expense,
        protected Account $account,
        protected Outlet $outlet,
        protected AccountingService $accountingService,
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
        array $relations = ['outlet', 'employee', 'user', 'expenseAccount', 'sourceAccount']
    ): LengthAwarePaginator|Collection {
        try {
            $query = $this->expense->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get expenses', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'type'    => 'expense_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(
        int $id,
        array $relations = ['outlet', 'employee', 'user', 'expenseAccount', 'sourceAccount']
    ): Expense {
        try {
            $query = $this->expense->query();

            $this->applyTenantScope($query);

            return $query->with($relations)->findOrFail($id);
        } catch (Exception $e) {
            Log::error('Failed to get expense by ID', [
                'expense_id' => $id,
                'error'      => $e->getMessage(),
                'type'       => 'expense_service_error',
            ]);
            throw $e;
        }
    }

    public function getExpenseSummary(?string $startDate = null, ?string $endDate = null): array
    {
        try {
            $query = $this->expense->query();

            $this->applyTenantScope($query);

            if ($startDate) {
                $query->whereDate('date', '>=', $startDate);
            }

            if ($endDate) {
                $query->whereDate('date', '<=', $endDate);
            }

            return [
                'total_amount'   => $query->sum('amount'),
                'total_count'    => $query->count(),
                'average_amount' => $query->avg('amount'),
            ];
        } catch (Exception $e) {
            Log::error('Failed to get expense summary', [
                'error' => $e->getMessage(),
                'type'  => 'expense_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function store(array $data): Expense
    {
        return DB::transaction(function () use ($data) {
            try {
                $outlet         = $this->outlet->findOrFail($data['outletId']);
                $expenseAccount = $this->account->findOrFail($data['expenseAccountId']);
                $creator        = $this->determineCreator();

                if ($creator['employee_id']) {
                    $sourceAccount = $this->account->query()
                        ->byOwnerId($outlet->owner_id)
                        ->byOutletId($outlet->id)
                        ->byAccountRole('cash')
                        ->isTransactional(true)
                        ->active()
                        ->first();

                    if (!$sourceAccount) {
                        throw new Exception('Kas outlet tidak ditemukan. Pastikan outlet memiliki akun kas.');
                    }
                } else {
                    if (empty($data['sourceAccountId'])) {
                        throw new Exception('Owner harus memilih akun sumber pembayaran.');
                    }
                    $sourceAccount = $this->account->query()
                        ->byId($data['sourceAccountId'])
                        ->byOwnerId($outlet->owner_id)
                        ->byType('asset')
                        ->isTransactional(true)
                        ->active()
                        ->firstOrFail();
                }

                $attachmentPath = null;
                if ($data['attachment'] ?? null) {
                    $attachmentPath = $this->handleFileUpload($data['attachment']);
                }

                $expense = $this->expense->create([
                    'code'              => $this->expense->generateCode(),
                    'outlet_id'         => $outlet->id,
                    'expense_account_id' => $expenseAccount->id,
                    'source_account_id' => $sourceAccount->id,
                    'employee_id'       => $creator['employee_id'],
                    'user_id'           => $creator['user_id'],
                    'amount'            => $data['amount'],
                    'date'              => $data['date'],
                    'description'       => $data['description'] ?? null,
                    'attachment'        => $attachmentPath,
                    'reference_number'  => $data['referenceNumber'] ?? null,
                    'status'            => 'pending',
                ]);

                if ($expense->isCreatedByOwner()) {
                    $journalEntry = $this->accountingService->recordExpense($expense);

                    $expense->update([
                        'status'           => 'approved',
                        'approved_by'      => $creator['user_id'],
                        'approved_at'      => now(),
                        'journal_entry_id' => $journalEntry->id,
                    ]);

                    Log::info('Expense auto-approved (created by owner)', [
                        'expense_id' => $expense->id,
                        'user_id'    => $creator['user_id'],
                        'type'       => 'expense_auto_approval',
                    ]);
                }

                if ($creator['employee_id'] && $expense->status === 'pending') {
                    $owner = User::find($outlet->owner_id);
                    if ($owner) {
                        $expense->load(['outlet', 'employee']);
                        $owner->notify(new ExpenseRequestNotification($expense));
                    }
                }

                Log::info('Expense created successfully', [
                    'expense_id' => $expense->id,
                    'outlet_id'  => $outlet->id,
                    'amount'     => $data['amount'],
                    'created_by' => $creator,
                    'type'       => 'expense_management',
                ]);

                return $expense->load(['outlet', 'employee', 'user', 'expenseAccount', 'sourceAccount']);
            } catch (Exception $e) {
                if (isset($attachmentPath) && $attachmentPath) {
                    Storage::disk('public')->delete($attachmentPath);
                }

                Log::error('Failed to create expense', [
                    'error' => $e->getMessage(),
                    'type'  => 'expense_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function update(int $id, array $data, ?UploadedFile $attachment = null): Expense
    {
        return DB::transaction(function () use ($id, $data, $attachment) {
            try {
                $expense            = $this->getById($id);
                $oldAmount          = $expense->amount;
                $oldExpenseAccountId = $expense->expense_account_id;
                $oldSourceAccountId = $expense->source_account_id;
                $oldDate            = $expense->date;

                $outlet = $this->outlet->findOrFail($data['outletId']);

                if ((int) $outlet->owner_id !== (int) $this->resolveOwnerId()) {
                    throw new Exception('Akses ditolak. Anda hanya dapat mengakses outlet milik Anda sendiri.');
                }

                $expenseAccount = $this->account->findOrFail($data['expenseAccountId']);

                if ($expenseAccount->type !== 'expense') {
                    throw new Exception('Account must be of type expense');
                }

                $creator = $this->determineCreator();

                if ($creator['employee_id']) {
                    $sourceAccount = $this->account->query()
                        ->byOwnerId($outlet->owner_id)
                        ->byOutletId($outlet->id)
                        ->byAccountRole('cash')
                        ->isTransactional(true)
                        ->active()
                        ->first();

                    if (!$sourceAccount) {
                        throw new Exception('Kas outlet tidak ditemukan. Pastikan outlet memiliki akun kas.');
                    }
                } else {
                    if (empty($data['sourceAccountId'])) {
                        throw new Exception('Owner harus memilih akun sumber pembayaran.');
                    }
                    $sourceAccount = $this->account->query()
                        ->byId($data['sourceAccountId'])
                        ->byOwnerId($outlet->owner_id)
                        ->byType('asset')
                        ->isTransactional(true)
                        ->active()
                        ->firstOrFail();
                }

                $attachmentPath = $expense->attachment;

                if (isset($data['removeAttachment']) && $data['removeAttachment'] && $attachmentPath) {
                    Storage::disk('public')->delete($attachmentPath);
                    $attachmentPath = null;
                }

                if ($attachment) {
                    if ($attachmentPath) {
                        Storage::disk('public')->delete($attachmentPath);
                    }
                    $attachmentPath = $this->handleFileUpload($attachment);
                }

                $hasFinancialChanges = (
                    $oldAmount != $data['amount'] ||
                    $oldExpenseAccountId != $data['expenseAccountId'] ||
                    $oldSourceAccountId != $sourceAccount->id ||
                    $oldDate != $data['date']
                );

                $expense->update([
                    'outlet_id'          => $outlet->id,
                    'expense_account_id' => $expenseAccount->id,
                    'source_account_id'  => $sourceAccount->id,
                    'amount'             => $data['amount'],
                    'date'               => $data['date'],
                    'description'        => $data['description'] ?? null,
                    'attachment'         => $attachmentPath,
                    'reference_number'   => $data['referenceNumber'] ?? null,
                ]);

                if ($hasFinancialChanges) {
                    $this->accountingService->updateExpenseJournal($expense);
                }

                Log::info('Expense updated successfully', [
                    'expense_id'           => $expense->id,
                    'has_financial_changes' => $hasFinancialChanges,
                    'type'                 => 'expense_management',
                ]);

                return $expense->fresh(['outlet', 'employee', 'user', 'expenseAccount', 'sourceAccount']);
            } catch (Exception $e) {
                if (isset($attachmentPath) && $attachment && isset($expense) && $attachmentPath !== $expense->attachment) {
                    Storage::disk('public')->delete($attachmentPath);
                }

                Log::error('Failed to update expense', [
                    'expense_id' => $id,
                    'error'      => $e->getMessage(),
                    'type'       => 'expense_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroy(int $id): bool
    {
        try {
            $expense = $this->getById($id);
            return $expense->delete();
        } catch (Exception $e) {
            Log::error('Failed to delete expense', [
                'expense_id' => $id,
                'error'      => $e->getMessage(),
                'type'       => 'expense_service_error',
            ]);
            throw $e;
        }
    }

    public function restore(int $id): Expense
    {
        try {
            $expense = $this->expense->withTrashed()->findOrFail($id);
            $expense->restore();

            return $expense;
        } catch (Exception $e) {
            Log::error('Failed to restore expense', [
                'expense_id' => $id,
                'error'      => $e->getMessage(),
                'type'       => 'expense_service_error',
            ]);
            throw $e;
        }
    }

    public function forceDestroy(int $id): bool
    {
        try {
            $expense = $this->expense->withTrashed()->findOrFail($id);

            if ($expense->attachment) {
                Storage::disk('public')->delete($expense->attachment);
            }

            return $expense->forceDelete();
        } catch (Exception $e) {
            Log::error('Failed to force delete expense', [
                'expense_id' => $id,
                'error'      => $e->getMessage(),
                'type'       => 'expense_service_error',
            ]);
            throw $e;
        }
    }

    public function approve(int $id, ?int $sourceAccountId = null): Expense
    {
        return DB::transaction(function () use ($id, $sourceAccountId) {
            try {
                /** @var User $user */
                $user    = Auth::user();
                $expense = $this->getById($id, ['outlet', 'employee', 'user', 'expenseAccount', 'sourceAccount']);

                if (!$expense->canBeApproved()) {
                    throw new Exception('Expense tidak dapat disetujui. Status saat ini: ' . $expense->status);
                }

                if ($sourceAccountId) {
                    $sourceAccount = $this->account->findOrFail($sourceAccountId);

                    if ($sourceAccount->type !== 'asset' || !$sourceAccount->is_transactional) {
                        throw new Exception('Source account must be a transactional asset account');
                    }

                    $expense->update(['source_account_id' => $sourceAccountId]);
                }

                $journalEntry = $this->accountingService->recordExpense($expense);

                $expense->update([
                    'status'           => 'approved',
                    'approved_by'      => $user->id,
                    'approved_at'      => now(),
                    'journal_entry_id' => $journalEntry->id,
                ]);

                Log::info('Expense approved', [
                    'expense_id'       => $expense->id,
                    'approved_by'      => $user->id,
                    'amount'           => $expense->amount,
                    'journal_entry_id' => $journalEntry->id,
                    'type'             => 'expense_approval',
                ]);

                return $expense->fresh();
            } catch (Exception $e) {
                Log::error('Failed to approve expense', [
                    'expense_id' => $id,
                    'error'      => $e->getMessage(),
                    'type'       => 'expense_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function reject(int $id, string $reason): Expense
    {
        return DB::transaction(function () use ($id, $reason) {
            try {
                /** @var User $user */
                $user    = Auth::user();
                $expense = $this->getById($id);

                if (!$expense->canBeRejected()) {
                    throw new Exception('Expense tidak dapat ditolak. Status saat ini: ' . $expense->status);
                }

                $expense->update([
                    'status'           => 'rejected',
                    'approved_by'      => $user->id,
                    'approved_at'      => now(),
                    'rejection_reason' => $reason,
                ]);

                Log::info('Expense rejected', [
                    'expense_id'  => $expense->id,
                    'rejected_by' => $user->id,
                    'reason'      => $reason,
                    'type'        => 'expense_rejection',
                ]);

                return $expense->fresh();
            } catch (Exception $e) {
                Log::error('Failed to reject expense', [
                    'expense_id' => $id,
                    'error'      => $e->getMessage(),
                    'type'       => 'expense_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function cancel(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $expense = $this->getById($id);

                if (!$expense->canBeCancelled()) {
                    throw new Exception('Expense tidak dapat dibatalkan. Status saat ini: ' . $expense->status);
                }

                $expense->update(['status' => 'rejected']);

                Log::info('Expense cancelled', [
                    'expense_id' => $expense->id,
                    'type'       => 'expense_cancellation',
                ]);

                return true;
            } catch (Exception $e) {
                Log::error('Failed to cancel expense', [
                    'expense_id' => $id,
                    'error'      => $e->getMessage(),
                    'type'       => 'expense_service_error',
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

        if (!empty($filters['outletId'])) {
            $query->byOutletId($filters['outletId']);
        }

        if (!empty($filters['employeeId'])) {
            $query->byEmployeeId($filters['employeeId']);
        }

        if (!empty($filters['expenseAccountId'])) {
            $query->byExpenseAccountId($filters['expenseAccountId']);
        }

        if (!empty($filters['sourceAccountId'])) {
            $query->bySourceAccountId($filters['sourceAccountId']);
        }

        if (!empty($filters['startDate'])) {
            $query->startDate($filters['startDate']);
        }

        if (!empty($filters['endDate'])) {
            $query->endDate($filters['endDate']);
        }

        if (!empty($filters['minAmount'])) {
            $query->minAmount($filters['minAmount']);
        }

        if (!empty($filters['maxAmount'])) {
            $query->maxAmount($filters['maxAmount']);
        }

        if (isset($filters['hasAttachment']) && $filters['hasAttachment'] !== null) {
            $filters['hasAttachment'] ? $query->hasAttachment() : $query->noAttachment();
        }

        $sortBy        = $filters['sortBy'] ?? 'date';
        $sortDirection = $filters['sortDirection'] ?? 'desc';

        $query->sortBy($sortBy, $sortDirection);
    }

    private function determineCreator(): array
    {
        $creator = ['employee_id' => null, 'user_id' => null];
        $user    = Auth::user();

        if ($user instanceof Employee) {
            $creator['employee_id'] = $user->id;
        } else {
            $creator['user_id'] = $user->id;
        }

        return $creator;
    }

    private function handleFileUpload(UploadedFile $file): string
    {
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        return $file->storeAs('expenses/attachments', $filename, 'public');
    }
}
