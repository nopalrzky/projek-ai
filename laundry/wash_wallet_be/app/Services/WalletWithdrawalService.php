<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Models\OwnerBankAccount;
use App\Models\WalletWithdrawal;
use App\Models\WalletTransaction;
use App\Notifications\WithdrawalRequestedNotification;
use App\Notifications\WithdrawalPaidNotification;
use App\Notifications\WithdrawalRejectedNotification;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

class WalletWithdrawalService extends BaseService
{
    public function __construct(
        protected WalletWithdrawal $walletWithdrawal,
        protected WalletBalanceService $walletBalanceService,
        protected OwnerBankAccount $ownerBankAccount,
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
        array $relations = ['user']
    ): LengthAwarePaginator|Collection {
        try {
            $page ??= (int) ($filters['page'] ?? 0);
            $perPage ??= (int) ($filters['perPage'] ?? 0);

            $query = $this->walletWithdrawal->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get wallet withdrawals', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'wallet_withdrawal_service_error',
            ]);
            throw $e;
        }
    }

    public function getById(int $id, array $relations = ['user', 'ownerBankAccount', 'processedByUser']): WalletWithdrawal
    {
        try {
            $query = $this->walletWithdrawal->query();
            $this->applyTenantScope($query);

            return $query->with($relations)->findOrFail($id);
        } catch (Exception $e) {
            Log::error('Failed to get wallet withdrawal by ID', [
                'withdrawal_id' => $id,
                'error'         => $e->getMessage(),
                'type'          => 'wallet_withdrawal_service_error',
            ]);
            throw $e;
        }
    }

    public function getStats(): array
    {
        try {
            $query = $this->walletWithdrawal->query();
            $this->applyTenantScope($query);

            $total = (clone $query)->count();
            $pending = (clone $query)->pending()->count();
            $processing = (clone $query)->processing()->count();
            $paid = (clone $query)->byStatus(WalletWithdrawal::STATUS_PAID)->count();
            $rejected = (clone $query)->byStatus(WalletWithdrawal::STATUS_REJECTED)->count();

            $totalAmount = (float) (clone $query)->whereIn('status', [WalletWithdrawal::STATUS_PAID])->sum('requested_amount');
            $pendingAmount = (float) (clone $query)->whereIn('status', [WalletWithdrawal::STATUS_PENDING, WalletWithdrawal::STATUS_PROCESSING])->sum('requested_amount');

            return [
                'totalCount'      => $total,
                'pendingCount'    => $pending,
                'processingCount' => $processing,
                'paidCount'       => $paid,
                'rejectedCount'   => $rejected,
                'totalAmount'     => $totalAmount,
                'pendingAmount'   => $pendingAmount,
            ];
        } catch (Exception $e) {
            Log::error('Failed to get withdrawal stats', [
                'error' => $e->getMessage(),
                'type'  => 'wallet_withdrawal_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function store(array $data): WalletWithdrawal
    {
        return DB::transaction(function () use ($data) {
            try {
                $ownerId = $this->resolveOwnerId();
                $owner = $this->user->findOrFail($ownerId);

                $account = $this->ownerBankAccount->query()
                    ->byUserId($ownerId)
                    ->active()
                    ->with('withdrawalBank')
                    ->findOrFail($data['ownerBankAccountId']);

                $bank = $account->withdrawalBank;

                $requestedAmount = (float) $data['requestedAmount'];
                $adminFee = (float) $bank->admin_fee;
                $netAmount = $requestedAmount - $adminFee;

                if ($requestedAmount < (float) $bank->min_withdrawal) {
                    throw new Exception("Nominal penarikan kurang dari batas minimum Rp " . number_format((float) $bank->min_withdrawal, 0, ',', '.'));
                }

                if ($bank->max_withdrawal && $requestedAmount > (float) $bank->max_withdrawal) {
                    throw new Exception("Nominal penarikan melebihi batas maksimum Rp " . number_format((float) $bank->max_withdrawal, 0, ',', '.'));
                }

                if ($requestedAmount > $owner->availableWalletBalance()) {
                    throw new Exception('Saldo pendapatan tidak mencukupi untuk melakukan penarikan.');
                }

                if ($netAmount <= 0) {
                    throw new Exception('Nominal penarikan setelah biaya admin harus lebih dari Rp 0.');
                }

                $withdrawal = $this->walletWithdrawal->create([
                    'user_id'               => $ownerId,
                    'owner_bank_account_id' => $account->id,
                    'code'                  => WalletWithdrawal::generateCode(),
                    'requested_amount'      => $requestedAmount,
                    'admin_fee'             => $adminFee,
                    'net_amount'            => $netAmount,
                    'status'                => WalletWithdrawal::STATUS_PENDING,
                    'bank_name'             => $bank->bank_name,
                    'bank_code'             => $bank->bank_code,
                    'account_number'        => $account->account_number,
                    'account_holder_name'   => $account->account_holder_name,
                ]);

                $this->walletBalanceService->debitForWithdrawal($owner, $withdrawal);

                $superAdmins = User::superAdmins()->get();
                if ($superAdmins->isNotEmpty()) {
                    Notification::send($superAdmins, new WithdrawalRequestedNotification($withdrawal));
                }

                Log::info('Wallet withdrawal request created successfully', [
                    'withdrawal_id' => $withdrawal->id,
                    'owner_id'      => $ownerId,
                    'code'          => $withdrawal->code,
                    'type'          => 'wallet_withdrawal_management',
                ]);

                return $withdrawal->load(['user', 'ownerBankAccount']);
            } catch (Exception $e) {
                Log::error('Failed to create wallet withdrawal request', [
                    'error'   => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type'    => 'wallet_withdrawal_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function process(int $id): WalletWithdrawal
    {
        return DB::transaction(function () use ($id) {
            try {
                $withdrawal = $this->getById($id);

                if (!$withdrawal->canBeProcessed()) {
                    throw new Exception("Withdrawal status tidak dapat diproses (Status: {$withdrawal->status}).");
                }

                $withdrawal->update([
                    'status'       => WalletWithdrawal::STATUS_PROCESSING,
                    'processed_by' => Auth::id(),
                    'processed_at' => now(),
                ]);

                Log::info('Wallet withdrawal status changed to processing', [
                    'withdrawal_id' => $id,
                    'admin_id'      => Auth::id(),
                    'type'          => 'wallet_withdrawal_process',
                ]);

                return $withdrawal->fresh();
            } catch (Exception $e) {
                Log::error('Failed to process wallet withdrawal', [
                    'withdrawal_id' => $id,
                    'error'         => $e->getMessage(),
                    'type'          => 'wallet_withdrawal_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function markPaid(int $id, array $data): WalletWithdrawal
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $withdrawal = $this->getById($id);

                if ($withdrawal->isPaid() || $withdrawal->isRejected() || $withdrawal->isCancelled()) {
                    throw new Exception("Withdrawal status tidak dapat diselesaikan (Status: {$withdrawal->status}).");
                }

                $proofPath = null;
                if (isset($data['proof'])) {
                    $proofPath = $data['proof']->store('proofs/withdrawals', 'public');
                }

                $withdrawal->update([
                    'status'       => WalletWithdrawal::STATUS_PAID,
                    'proof_path'   => $proofPath ?? $withdrawal->proof_path,
                    'admin_note'   => $data['adminNote'] ?? $withdrawal->admin_note,
                    'processed_by' => Auth::id(),
                    'paid_at'      => now(),
                ]);

                $withdrawal->user->notify(new WithdrawalPaidNotification($withdrawal));

                Log::info('Wallet withdrawal marked as paid successfully', [
                    'withdrawal_id' => $id,
                    'admin_id'      => Auth::id(),
                    'type'          => 'wallet_withdrawal_complete',
                ]);

                return $withdrawal->fresh();
            } catch (Exception $e) {
                Log::error('Failed to mark wallet withdrawal as paid', [
                    'withdrawal_id' => $id,
                    'error'         => $e->getMessage(),
                    'type'          => 'wallet_withdrawal_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function reject(int $id, string $reason): WalletWithdrawal
    {
        return DB::transaction(function () use ($id, $reason) {
            try {
                $withdrawal = $this->getById($id);

                if ($withdrawal->isPaid() || $withdrawal->isRejected() || $withdrawal->isCancelled()) {
                    throw new Exception("Withdrawal status tidak dapat ditolak (Status: {$withdrawal->status}).");
                }

                $withdrawal->update([
                    'status'       => WalletWithdrawal::STATUS_REJECTED,
                    'admin_note'   => $reason,
                    'processed_by' => Auth::id(),
                    'rejected_at'  => now(),
                ]);

                $this->walletBalanceService->refundWithdrawal(
                    $withdrawal->user,
                    $withdrawal,
                    WalletTransaction::TYPE_WITHDRAWAL_REJECTED_REFUND
                );

                $withdrawal->user->notify(new WithdrawalRejectedNotification($withdrawal));

                Log::info('Wallet withdrawal rejected successfully', [
                    'withdrawal_id' => $id,
                    'admin_id'      => Auth::id(),
                    'type'          => 'wallet_withdrawal_reject',
                ]);

                return $withdrawal->fresh();
            } catch (Exception $e) {
                Log::error('Failed to reject wallet withdrawal', [
                    'withdrawal_id' => $id,
                    'error'         => $e->getMessage(),
                    'type'          => 'wallet_withdrawal_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function cancel(int $id): WalletWithdrawal
    {
        return DB::transaction(function () use ($id) {
            try {
                $withdrawal = $this->getById($id);
                $userId = $this->resolveOwnerId();

                if ((int) $withdrawal->user_id !== (int) $userId) {
                    throw new Exception('Akses ditolak.');
                }

                if (!$withdrawal->canBeCancelled()) {
                    throw new Exception("Withdrawal status tidak dapat dibatalkan (Status: {$withdrawal->status}).");
                }

                $withdrawal->update([
                    'status'       => WalletWithdrawal::STATUS_CANCELLED,
                    'cancelled_at' => now(),
                ]);

                $this->walletBalanceService->refundWithdrawal(
                    $withdrawal->user,
                    $withdrawal,
                    WalletTransaction::TYPE_WITHDRAWAL_CANCELLED_REFUND
                );

                Log::info('Wallet withdrawal cancelled successfully by owner', [
                    'withdrawal_id' => $id,
                    'owner_id'      => $userId,
                    'type'          => 'wallet_withdrawal_cancel',
                ]);

                return $withdrawal->fresh();
            } catch (Exception $e) {
                Log::error('Failed to cancel wallet withdrawal', [
                    'withdrawal_id' => $id,
                    'error'         => $e->getMessage(),
                    'type'          => 'wallet_withdrawal_service_error',
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

        if (!empty($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        if (!empty($filters['userId'])) {
            $query->byUserId((int) $filters['userId']);
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
