<?php

namespace App\Listeners;

use App\Events\OutletDeleted;
use App\Models\Account;
use App\Services\AccountService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Exception;

class DeactivateOutletAccountsListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The maximum number of seconds the job may run.
     *
     * @var int
     */
    public $timeout = 120;

    protected Account $account;

    /**
     * Create the event listener.
     */
    public function __construct(Account $account)
    {
        $this->account = $account;
    }

    /**
     * Handle the event.
     */
    public function handle(OutletDeleted $event): void
    {
        try {
            Log::info('Starting outlet accounts deactivation process', [
                'outlet_id' => $event->outletId,
                'owner_id' => $event->ownerId,
                'outlet_name' => $event->outletName,
                'type' => 'outlet_accounts_deactivation_start'
            ]);

            $this->deactivateAccountByRole($event->outletId, 'cash');

            $this->deactivateAccountByRole($event->outletId, 'receivable');

            $this->deactivateAccountByRole($event->outletId, 'loan');

            $this->deactivateAccountByRole($event->outletId, 'fine');

            Log::info('Outlet accounts deactivation process completed successfully', [
                'outlet_id' => $event->outletId,
                'owner_id' => $event->ownerId,
                'outlet_name' => $event->outletName,
                'accounts_deactivated' => ['cash', 'receivable', 'loan', 'fine'],
                'type' => 'outlet_accounts_deactivation_success'
            ]);
        } catch (Exception $e) {
            Log::error('Failed to deactivate outlet accounts', [
                'outlet_id' => $event->outletId,
                'owner_id' => $event->ownerId,
                'outlet_name' => $event->outletName,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'type' => 'outlet_accounts_deactivation_error'
            ]);

            // Re-throw the exception to trigger job retry
            throw $e;
        }
    }

    /**
     * Deactivate account by role for specific outlet
     * @param int $outletId
     * @param string $accountRole
     * @return void
     */
    private function deactivateAccountByRole(int $outletId, string $accountRole): void
    {
        try {
            $account = $this->account
                ->byOutletId($outletId)
                ->byAccountRole($accountRole)
                ->first();

            if ($account) {
                $account->update(['is_active' => false]);

                Log::info('Account deactivated successfully', [
                    'account_id' => $account->id,
                    'outlet_id' => $outletId,
                    'account_role' => $accountRole,
                    'account_name' => $account->name,
                    'account_code' => $account->code,
                    'deactivation_method' => 'is_active_false',
                    'type' => 'account_deactivation'
                ]);
            } else {
                Log::warning('Account not found for deactivation', [
                    'outlet_id' => $outletId,
                    'account_role' => $accountRole,
                    'type' => 'account_deactivation_warning'
                ]);
            }
        } catch (Exception $e) {
            Log::error('Failed to deactivate account', [
                'outlet_id' => $outletId,
                'account_role' => $accountRole,
                'error' => $e->getMessage(),
                'type' => 'account_deactivation_error'
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(OutletDeleted $event, Exception $exception): void
    {
        Log::error('Outlet accounts deactivation job failed permanently', [
            'outlet_id' => $event->outletId,
            'owner_id' => $event->ownerId,
            'outlet_name' => $event->outletName,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
            'type' => 'outlet_accounts_deactivation_failed'
        ]);
    }
}
