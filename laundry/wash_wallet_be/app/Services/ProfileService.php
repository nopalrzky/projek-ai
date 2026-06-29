<?php

namespace App\Services;

use App\Models\User;
use App\Models\Outlet;
use App\Models\OwnerBankAccount;
use App\Models\WalletWithdrawal;
use App\Models\WalletTransaction;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class ProfileService extends BaseService
{
    public function __construct(
        protected User $user,
        protected Outlet $outlet,
        protected OwnerBankAccount $ownerBankAccount,
        protected WalletWithdrawal $walletWithdrawal,
        protected WalletTransaction $walletTransaction,
        protected WalletBalanceService $walletBalanceService,
    ) {}

    private function authenticatedUser(): User
    {
        /** @var User|null $user */
        $user = Auth::user();

        if (!$user instanceof User) {
            throw new AccessDeniedHttpException('User not authenticated');
        }

        return $user;
    }

    /*
    |--------------------------------------------------------------------------
    | Read Methods
    |--------------------------------------------------------------------------
    */

    public function getProfile(): User
    {
        try {
            $user = $this->authenticatedUser();
            return $user->load([
                'outlets',
                'referrals',
            ]);
        } catch (Exception $e) {
            Log::error('Failed to load profile', [
                'user_id' => Auth::id(),
                'error'   => $e->getMessage(),
                'type'    => 'profile_service_error',
            ]);
            throw $e;
        }
    }

    public function getProfileOverview(): array
    {
        try {
            $user = $this->authenticatedUser();

            return [
                'totalOutlets'    => $user->outlets()->count(),
                'activeOutlets'   => $user->outlets()->where('status', 'active')->count(),
                'totalReferrals'  => $user->referrals()->count(),
                'totalCommission' => $user->getTotalCommission(),
                'memberSince'     => $user->created_at?->toISOString(),
                'lastLoginAt'     => $user->last_login_at?->toISOString(),
                'status'          => $user->status,
            ];
        } catch (Exception $e) {
            Log::error('Failed to get profile overview', [
                'user_id' => Auth::id(),
                'error'   => $e->getMessage(),
                'type'    => 'profile_service_error',
            ]);
            throw $e;
        }
    }

    public function getOwnedOutlets()
    {
        try {
            $user = $this->authenticatedUser();

            return $user->outlets()
                ->select('id', 'name', 'code', 'status', 'created_at')
                ->orderBy('created_at', 'desc')
                ->get();
        } catch (Exception $e) {
            Log::error('Failed to get owned outlets', [
                'user_id' => Auth::id(),
                'error'   => $e->getMessage(),
                'type'    => 'profile_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function updateProfile(array $data): User
    {
        return DB::transaction(function () use ($data) {
            try {
                $user = $this->authenticatedUser();

                if (isset($data['name']))               $user->name    = $data['name'];
                if (isset($data['phone']))              $user->phone   = $data['phone'];
                if (array_key_exists('address', $data)) $user->address = $data['address'];
                if (isset($data['avatar']))             $user->avatar  = $data['avatar'];

                $user->save();

                Log::info('Profile updated successfully', [
                    'user_id' => $user->id,
                    'changes' => array_keys($data),
                    'type'    => 'profile_management',
                ]);

                return $user->fresh();
            } catch (Exception $e) {
                Log::error('Failed to update profile', [
                    'user_id' => Auth::id(),
                    'error'   => $e->getMessage(),
                    'type'    => 'profile_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function changePassword(string $password): User
    {
        return DB::transaction(function () use ($password) {
            try {
                $user = $this->authenticatedUser();

                $user->password = Hash::make($password);
                $user->save();

                Log::info('Password changed successfully', [
                    'user_id' => $user->id,
                    'type'    => 'profile_management',
                ]);

                return $user->fresh();
            } catch (Exception $e) {
                Log::error('Failed to change password', [
                    'user_id' => Auth::id(),
                    'error'   => $e->getMessage(),
                    'type'    => 'profile_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function getFinanceSummary(): array
    {
        try {
            $user = $this->authenticatedUser();

            $stats = $this->walletBalanceService->getStats($user->id);

            $bankAccounts = $this->ownerBankAccount->query()
                ->byUserId($user->id)
                ->active()
                ->with('withdrawalBank')
                ->get()
                ->map(fn($item) => [
                    'id' => $item->id,
                    'bankName' => $item->withdrawalBank?->bank_name ?? '-',
                    'accountNumberMasked' => $this->maskAccountNumber($item->account_number),
                    'accountHolderName' => $item->account_holder_name,
                    'isDefault' => $item->is_default,
                    'isActive' => $item->is_active,
                ])
                ->toArray();

            $recentWithdrawals = $this->walletWithdrawal->query()
                ->byUserId($user->id)
                ->latest()
                ->take(3)
                ->get()
                ->map(fn($item) => [
                    'id' => $item->id,
                    'code' => $item->code,
                    'requestedAmount' => (float) $item->requested_amount,
                    'adminFee' => (float) $item->admin_fee,
                    'netAmount' => (float) $item->net_amount,
                    'status' => $item->status,
                    'statusLabel' => ucfirst($item->status),
                    'createdAt' => $item->created_at?->toISOString(),
                ])
                ->toArray();

            $recentTransactions = $this->walletTransaction->query()
                ->byUserId($user->id)
                ->latest()
                ->take(5)
                ->get()
                ->map(fn($item) => [
                    'id' => $item->id,
                    'transactionNumber' => $item->transaction_number,
                    'type' => $item->type,
                    'typeLabel' => str_replace('_', ' ', ucfirst($item->type)),
                    'amount' => (float) $item->amount,
                    'isCredit' => (float) $item->amount > 0,
                    'createdAt' => $item->created_at?->toISOString(),
                ])
                ->toArray();

            $totalWithdrawals = [
                'pending' => $this->walletWithdrawal->query()->byUserId($user->id)->byStatus(WalletWithdrawal::STATUS_PENDING)->count(),
                'processing' => $this->walletWithdrawal->query()->byUserId($user->id)->byStatus(WalletWithdrawal::STATUS_PROCESSING)->count(),
                'paid' => $this->walletWithdrawal->query()->byUserId($user->id)->byStatus(WalletWithdrawal::STATUS_PAID)->count(),
                'rejected' => $this->walletWithdrawal->query()->byUserId($user->id)->byStatus(WalletWithdrawal::STATUS_REJECTED)->count(),
            ];

            return [
                'walletBalance' => (float) $user->wallet_balance,
                'coinBalance' => (float) $user->coin_balance,
                'availableBalance' => (float) ($stats['availableBalance'] ?? $user->wallet_balance),
                'pendingWdrTotal' => (float) ($stats['pendingWdrTotal'] ?? 0),
                'bankAccounts' => $bankAccounts,
                'recentWithdrawals' => $recentWithdrawals,
                'recentTransactions' => $recentTransactions,
                'totalWithdrawals' => $totalWithdrawals,
            ];
        } catch (Exception $e) {
            Log::error('Failed to get finance summary', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'type' => 'profile_service_error',
            ]);
            throw $e;
        }
    }

    public function getReferralSummary(): array
    {
        try {
            $user = $this->authenticatedUser();

            $recentReferrals = $user->referrals()
                ->latest()
                ->take(5)
                ->get()
                ->map(fn($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'createdAt' => $item->created_at?->toISOString(),
                ])
                ->toArray();

            return [
                'referralCode' => $user->referral_code,
                'totalReferrals' => $user->referrals()->count(),
                'totalCommission' => (float) $user->getTotalCommission(),
                'recentReferrals' => $recentReferrals,
            ];
        } catch (Exception $e) {
            Log::error('Failed to get referral summary', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'type' => 'profile_service_error',
            ]);
            throw $e;
        }
    }

    public function getSetupChecklist(): array
    {
        try {
            $user = $this->authenticatedUser();

            $profileComplete = !empty($user->name) && !empty($user->phone) && !empty($user->address);
            $hasPhone = !empty($user->phone);
            $hasAddress = !empty($user->address);
            $hasOutlet = $user->outlets()->count() > 0;
            $hasActiveOutlet = $user->outlets()->where('status', 'active')->count() > 0;
            $hasActiveBankAccount = $this->ownerBankAccount->query()
                ->byUserId($user->id)
                ->active()
                ->count() > 0;
            $hasWalletOrCoin = (float) $user->wallet_balance > 0 || (float) $user->coin_balance > 0;

            return [
                'profileComplete' => $profileComplete,
                'hasPhone' => $hasPhone,
                'hasAddress' => $hasAddress,
                'hasOutlet' => $hasOutlet,
                'hasActiveOutlet' => $hasActiveOutlet,
                'hasActiveBankAccount' => $hasActiveBankAccount,
                'hasWalletOrCoin' => $hasWalletOrCoin,
            ];
        } catch (Exception $e) {
            Log::error('Failed to get setup checklist', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'type' => 'profile_service_error',
            ]);
            throw $e;
        }
    }

    private function maskAccountNumber(string $number): string
    {
        $len = strlen($number);
        if ($len <= 4) {
            return $number;
        }
        return str_repeat('*', $len - 4) . substr($number, -4);
    }
}
