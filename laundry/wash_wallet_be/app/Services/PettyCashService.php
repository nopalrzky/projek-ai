<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Employee;
use App\Models\JournalDetail;
use App\Models\JournalEntry;
use App\Models\PettyCash;
use App\Models\User;
use App\Notifications\PettyCashRequestNotification;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PettyCashService extends BaseService
{
    public function __construct(
        protected PettyCash $pettyCash,
        protected AccountService $accountService
    ) {}

    public function getAll(
        array $filters = [],
        ?int $page = null,
        ?int $perPage = null,
        array $relations = []
    ): Collection|LengthAwarePaginator {
        try {
            $query = $this->pettyCash->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (! empty($relations)) {
                $query->with($relations);
            }

            Log::debug('All petty cashes retrieved', [
                'filters' => $filters,
                'page' => $page,
                'perPage' => $perPage,
            ]);

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get all petty cashes', [
                'error' => $e->getMessage(),
                'filters' => $filters,
            ]);
            throw $e;
        }
    }

    public function getById(int $id, array $relations = []): PettyCash
    {
        try {
            $query = $this->pettyCash->query();

            $this->applyTenantScope($query);

            if (! empty($relations)) {
                $query->with($relations);
            }

            $pettyCash = $query->findOrFail($id);

            Log::debug('Petty cash retrieved by ID', [
                'petty_cash_id' => $id,
            ]);

            return $pettyCash;
        } catch (Exception $e) {
            Log::error('Failed to get petty cash by ID', [
                'petty_cash_id' => $id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    public function store(array $data): PettyCash
    {
        return DB::transaction(function () use ($data) {
            try {
                /** @var Employee $employee */
                $employee = Auth::user();
                $employee->load('outlet');

                if (! $employee->outlet) {
                    throw new Exception('Employee tidak memiliki outlet yang terkait');
                }

                $ownerId = $employee->outlet->owner_id;
                $code = PettyCash::generateCode();

                $pettyCash = $this->pettyCash->create([
                    'code' => $code,
                    'owner_id' => $ownerId,
                    'outlet_id' => $employee->outlet_id,
                    'cashier_id' => $employee->id,
                    'amount' => $data['amount'],
                    'description' => $data['description'],
                    'request_date' => $data['requestDate'],
                    'status' => 'pending',
                ]);

                Log::info('Petty cash created', [
                    'petty_cash_id' => $pettyCash->id,
                    'code' => $pettyCash->code,
                    'amount' => $pettyCash->amount,
                    'outlet_id' => $employee->outlet_id,
                ]);

                $owner = User::find($ownerId);
                if ($owner) {
                    $pettyCash->load(['cashier', 'outlet']);
                    $owner->notify(new PettyCashRequestNotification($pettyCash));
                }

                return $pettyCash;
            } catch (Exception $e) {
                Log::error('Failed to create petty cash', [
                    'data' => $data,
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    public function update(int $id, array $data): PettyCash
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $pettyCash = $this->getById($id);

                if (! $pettyCash->canBeApproved()) {
                    throw new Exception('Permintaan kas kecil tidak dapat diubah karena sudah diproses');
                }

                $updateData = [];
                if (isset($data['amount'])) {
                    $updateData['amount'] = $data['amount'];
                }
                if (isset($data['description'])) {
                    $updateData['description'] = $data['description'];
                }
                if (isset($data['requestDate'])) {
                    $updateData['request_date'] = $data['requestDate'];
                }

                $pettyCash->update($updateData);

                Log::info('Petty cash updated', [
                    'petty_cash_id' => $pettyCash->id,
                    'code' => $pettyCash->code,
                ]);

                return $pettyCash->fresh();
            } catch (Exception $e) {
                Log::error('Failed to update petty cash', [
                    'petty_cash_id' => $id,
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    public function approve(int $id, int $sourceAccountId): PettyCash
    {
        return DB::transaction(function () use ($id, $sourceAccountId) {
            try {
                /** @var User $user */
                $user = Auth::user();

                $pettyCash = $this->getById($id, ['outlet', 'cashier']);

                if (! $pettyCash->canBeApproved()) {
                    throw new Exception('Permintaan kas kecil tidak dapat disetujui');
                }

                $sourceAccount = Account::findOrFail($sourceAccountId);

                $destinationAccount = $this->accountService->getAccountBySlug(
                    'cash_outlet_' . $pettyCash->outlet_id,
                    $pettyCash->owner_id
                );

                $journal = JournalEntry::create([
                    'outlet_id' => $pettyCash->outlet_id,
                    'transaction_number' => JournalEntry::generateTransactionNumber($pettyCash->outlet_id),
                    'date' => now(),
                    'description' => "Petty Cash - {$pettyCash->code}: {$pettyCash->description}",
                    'reference_type' => PettyCash::class,
                    'reference_id' => $pettyCash->id,
                    'is_manual' => false,
                    'total_amount' => $pettyCash->amount,
                ]);

                JournalDetail::create([
                    'journal_entry_id' => $journal->id,
                    'account_id' => $destinationAccount->id,
                    'debit' => $pettyCash->amount,
                    'credit' => 0,
                    'memo' => "Penerimaan kas kecil untuk {$pettyCash->cashier->name}",
                ]);

                JournalDetail::create([
                    'journal_entry_id' => $journal->id,
                    'account_id' => $sourceAccount->id,
                    'debit' => 0,
                    'credit' => $pettyCash->amount,
                    'memo' => "Pengeluaran untuk kas kecil {$pettyCash->outlet->name}",
                ]);

                $pettyCash->update([
                    'status' => 'approved',
                    'approved_by' => $user->id,
                    'approved_at' => now(),
                    'source_account_id' => $sourceAccountId,
                    'journal_entry_id' => $journal->id,
                ]);

                Log::info('Petty cash approved', [
                    'petty_cash_id' => $pettyCash->id,
                    'code' => $pettyCash->code,
                    'approved_by' => $user->id,
                    'journal_entry_id' => $journal->id,
                ]);

                return $pettyCash->fresh();
            } catch (Exception $e) {
                Log::error('Failed to approve petty cash', [
                    'petty_cash_id' => $id,
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    public function reject(int $id, string $reason): PettyCash
    {
        return DB::transaction(function () use ($id, $reason) {
            try {
                /** @var User $user */
                $user = Auth::user();

                $pettyCash = $this->getById($id);

                if (! $pettyCash->canBeRejected()) {
                    throw new Exception('Permintaan kas kecil tidak dapat ditolak');
                }

                $pettyCash->update([
                    'status' => 'rejected',
                    'approved_by' => $user->id,
                    'approved_at' => now(),
                    'rejection_reason' => $reason,
                ]);

                Log::info('Petty cash rejected', [
                    'petty_cash_id' => $pettyCash->id,
                    'code' => $pettyCash->code,
                    'rejected_by' => $user->id,
                    'reason' => $reason,
                ]);

                return $pettyCash->fresh();
            } catch (Exception $e) {
                Log::error('Failed to reject petty cash', [
                    'petty_cash_id' => $id,
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    public function cancel(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $pettyCash = $this->getById($id);

                if (! $pettyCash->canBeCancelled()) {
                    throw new Exception('Permintaan kas kecil tidak dapat dibatalkan');
                }

                $pettyCash->delete();

                Log::info('Petty cash cancelled', [
                    'petty_cash_id' => $pettyCash->id,
                    'code' => $pettyCash->code,
                ]);

                return true;
            } catch (Exception $e) {
                Log::error('Failed to cancel petty cash', [
                    'petty_cash_id' => $id,
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $pettyCash = $this->getById($id);

                if ($pettyCash->isApproved()) {
                    throw new Exception('Permintaan kas kecil yang sudah disetujui tidak dapat dihapus');
                }

                $pettyCash->delete();

                Log::info('Petty cash deleted', [
                    'petty_cash_id' => $pettyCash->id,
                    'code' => $pettyCash->code,
                ]);

                return true;
            } catch (Exception $e) {
                Log::error('Failed to delete petty cash', [
                    'petty_cash_id' => $id,
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }



    private function applyFilters($query, array $filters): void
    {
        if (! empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (! empty($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        if (! empty($filters['outletId'])) {
            $query->byOutletId($filters['outletId']);
        }

        if (! empty($filters['cashierId'])) {
            $query->byCashierId($filters['cashierId']);
        }

        if (! empty($filters['startDate']) && ! empty($filters['endDate'])) {
            $query->byDateRange($filters['startDate'], $filters['endDate']);
        }

        $sortBy = $filters['sortBy'] ?? 'created_at';
        $sortDirection = $filters['sortDirection'] ?? 'desc';

        $query->sortBy($sortBy, $sortDirection);
    }
}
