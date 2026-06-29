<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Deposit;
use App\Models\Employee;
use App\Models\JournalDetail;
use App\Models\JournalEntry;
use App\Models\User;
use App\Notifications\DepositRequestNotification;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class DepositService extends BaseService
{
    public function __construct(
        protected Deposit $deposit,
        protected AccountService $accountService,
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
    ): Collection|LengthAwarePaginator {
        try {
            $query = $this->deposit->query();

            $this->applyTenantScope($query, 'byOwnerId', 'byCashierId');
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get all deposits', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'type'    => 'deposit_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(int $id, array $relations = []): Deposit
    {
        try {
            $query = $this->deposit->query();

            $this->applyTenantScope($query, 'byOwnerId', 'byCashierId');

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $query->findOrFail($id);
        } catch (Exception $e) {
            Log::error('Failed to get deposit by ID', [
                'deposit_id' => $id,
                'error'      => $e->getMessage(),
                'type'       => 'deposit_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function store(array $data): Deposit
    {
        return DB::transaction(function () use ($data) {
            try {
                /** @var Employee $employee */
                $employee = Auth::user();
                $employee->load('outlet');

                if (!$employee->outlet) {
                    throw new Exception('Employee tidak memiliki outlet yang terkait');
                }

                $ownerId = $employee->outlet->owner_id;

                $sourceAccount = Account::query()
                    ->byOwnerId($ownerId)
                    ->byOutletId($employee->outlet_id)
                    ->byAccountRole('cash')
                    ->isTransactional(true)
                    ->active()
                    ->first();

                if (!$sourceAccount) {
                    throw new Exception('Kas outlet tidak ditemukan. Pastikan outlet memiliki akun kas yang aktif.');
                }

                $destinationAccount = Account::query()
                    ->byId($data['destinationAccountId'])
                    ->byOwnerId($ownerId)
                    ->isTransactional(true)
                    ->byAccountRoles(AccountService::TRANSFER_ACCOUNT_ROLES)
                    ->active()
                    ->firstOrFail();

                $code           = Deposit::generateCode();
                $attachmentPath = null;

                if (isset($data['attachment'])) {
                    $attachmentPath = $data['attachment']->store('deposits', 'public');
                }

                $deposit = $this->deposit->create([
                    'code'                   => $code,
                    'owner_id'               => $ownerId,
                    'outlet_id'              => $employee->outlet_id,
                    'cashier_id'             => $employee->id,
                    'source_account_id'      => $sourceAccount->id,
                    'destination_account_id' => $destinationAccount->id,
                    'amount'                 => $data['amount'],
                    'notes'                  => $data['notes'] ?? null,
                    'attachment_path'        => $attachmentPath,
                    'status'                 => 'pending',
                ]);

                Log::info('Deposit created', [
                    'deposit_id' => $deposit->id,
                    'code'       => $deposit->code,
                    'amount'     => $deposit->amount,
                    'outlet_id'  => $employee->outlet_id,
                    'type'       => 'deposit_action',
                ]);

                $owner = User::find($ownerId);
                if ($owner) {
                    $deposit->load(['cashier', 'outlet']);
                    $owner->notify(new DepositRequestNotification($deposit));
                }

                return $deposit;
            } catch (Exception $e) {
                Log::error('Failed to create deposit', [
                    'error' => $e->getMessage(),
                    'type'  => 'deposit_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function update(int $id, array $data): Deposit
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $deposit = $this->getById($id);

                if (!$deposit->canBeApproved()) {
                    throw new Exception('Setoran tidak dapat diubah karena sudah diproses');
                }

                if (isset($data['attachment'])) {
                    if ($deposit->attachment_path) {
                        Storage::disk('public')->delete($deposit->attachment_path);
                    }
                    $data['attachment_path'] = $data['attachment']->store('deposits', 'public');
                    unset($data['attachment']);
                }

                $deposit->update($data);

                Log::info('Deposit updated', [
                    'deposit_id' => $deposit->id,
                    'code'       => $deposit->code,
                    'type'       => 'deposit_action',
                ]);

                return $deposit->fresh();
            } catch (Exception $e) {
                Log::error('Failed to update deposit', [
                    'deposit_id' => $id,
                    'error'      => $e->getMessage(),
                    'type'       => 'deposit_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function approve(int $id): Deposit
    {
        return DB::transaction(function () use ($id) {
            try {
                /** @var User $user */
                $user    = Auth::user();
                $deposit = $this->getById($id, ['sourceAccount', 'destinationAccount', 'outlet']);

                if (!$deposit->canBeApproved()) {
                    throw new Exception('Setoran tidak dapat disetujui');
                }

                $journal = JournalEntry::create([
                    'outlet_id'          => $deposit->outlet_id,
                    'transaction_number' => JournalEntry::generateTransactionNumber($deposit->outlet_id),
                    'date'               => now(),
                    'description'        => "Setoran Kasir - {$deposit->code}" . ($deposit->notes ? " - {$deposit->notes}" : ''),
                    'reference_type'     => Deposit::class,
                    'reference_id'       => $deposit->id,
                    'is_manual'          => false,
                    'total_amount'       => $deposit->amount,
                ]);

                JournalDetail::create([
                    'journal_entry_id' => $journal->id,
                    'account_id'       => $deposit->destination_account_id,
                    'debit'            => $deposit->amount,
                    'credit'           => 0,
                    'memo'             => "Penerimaan setoran dari {$deposit->outlet->name}",
                ]);

                JournalDetail::create([
                    'journal_entry_id' => $journal->id,
                    'account_id'       => $deposit->source_account_id,
                    'debit'            => 0,
                    'credit'           => $deposit->amount,
                    'memo'             => "Pengeluaran kas outlet untuk setoran",
                ]);

                $deposit->update([
                    'status'           => 'approved',
                    'approved_by'      => $user->id,
                    'approved_at'      => now(),
                    'journal_entry_id' => $journal->id,
                ]);

                Log::info('Deposit approved', [
                    'deposit_id'       => $deposit->id,
                    'code'             => $deposit->code,
                    'approved_by'      => $user->id,
                    'journal_entry_id' => $journal->id,
                    'type'             => 'deposit_action',
                ]);

                return $deposit->fresh();
            } catch (Exception $e) {
                Log::error('Failed to approve deposit', [
                    'deposit_id' => $id,
                    'error'      => $e->getMessage(),
                    'type'       => 'deposit_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function reject(int $id, string $reason): Deposit
    {
        return DB::transaction(function () use ($id, $reason) {
            try {
                /** @var User $user */
                $user    = Auth::user();
                $deposit = $this->getById($id);

                if (!$deposit->canBeRejected()) {
                    throw new Exception('Setoran tidak dapat ditolak');
                }

                $deposit->update([
                    'status'           => 'rejected',
                    'approved_by'      => $user->id,
                    'approved_at'      => now(),
                    'rejection_reason' => $reason,
                ]);

                Log::info('Deposit rejected', [
                    'deposit_id'  => $deposit->id,
                    'code'        => $deposit->code,
                    'rejected_by' => $user->id,
                    'reason'      => $reason,
                    'type'        => 'deposit_action',
                ]);

                return $deposit->fresh();
            } catch (Exception $e) {
                Log::error('Failed to reject deposit', [
                    'deposit_id' => $id,
                    'error'      => $e->getMessage(),
                    'type'       => 'deposit_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function cancel(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $deposit = $this->getById($id);

                if (!$deposit->canBeCancelled()) {
                    throw new Exception('Setoran tidak dapat dibatalkan');
                }

                if ($deposit->attachment_path) {
                    Storage::disk('public')->delete($deposit->attachment_path);
                }

                $deposit->delete();

                Log::info('Deposit cancelled', [
                    'deposit_id' => $deposit->id,
                    'code'       => $deposit->code,
                    'type'       => 'deposit_action',
                ]);

                return true;
            } catch (Exception $e) {
                Log::error('Failed to cancel deposit', [
                    'deposit_id' => $id,
                    'error'      => $e->getMessage(),
                    'type'       => 'deposit_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroy(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            try {
                $deposit = $this->getById($id);

                if ($deposit->isApproved()) {
                    throw new Exception('Setoran yang sudah disetujui tidak dapat dihapus');
                }

                if ($deposit->attachment_path) {
                    Storage::disk('public')->delete($deposit->attachment_path);
                }

                $deposit->delete();

                Log::info('Deposit deleted', [
                    'deposit_id' => $deposit->id,
                    'code'       => $deposit->code,
                    'type'       => 'deposit_action',
                ]);

                return true;
            } catch (Exception $e) {
                Log::error('Failed to delete deposit', [
                    'deposit_id' => $id,
                    'error'      => $e->getMessage(),
                    'type'       => 'deposit_service_error',
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

    protected function applyFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        if (!empty($filters['outletId'])) {
            $query->byOutletId($filters['outletId']);
        }

        if (!empty($filters['cashierId'])) {
            $query->byCashierId($filters['cashierId']);
        }

        if (!empty($filters['startDate']) && !empty($filters['endDate'])) {
            $query->byDateRange($filters['startDate'], $filters['endDate']);
        }

        $sortBy        = $filters['sortBy'] ?? 'created_at';
        $sortDirection = $filters['sortDirection'] ?? 'desc';

        $query->sortBy($sortBy, $sortDirection);
    }
}
