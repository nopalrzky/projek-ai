<?php

namespace App\Listeners;

use App\Events\OutletRenamed;
use App\Models\Account;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Exception;

class RenameOutletAccountsListener implements ShouldQueue
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
    public function handle(OutletRenamed $event): void
    {
        try {
            Log::info('Starting outlet accounts rename process', [
                'outlet_id' => $event->outletId,
                'old_name' => $event->oldName,
                'new_name' => $event->newName,
                'owner_id' => $event->ownerId,
                'type' => 'outlet_accounts_rename_start'
            ]);

            $this->updateAccountName(
                $event->outletId,
                'cash',
                "Kas {$event->oldName}",
                "Kas {$event->newName}"
            );

            $this->updateAccountName(
                $event->outletId,
                'receivable',
                "Piutang {$event->oldName}",
                "Piutang {$event->newName}"
            );

            $this->updateAccountName(
                $event->outletId,
                'loan',
                "Kasbon {$event->oldName}",
                "Kasbon {$event->newName}"
            );

            $this->updateAccountName(
                $event->outletId,
                'fine',
                "Denda {$event->oldName}",
                "Denda {$event->newName}"
            );

            Log::info('Outlet accounts rename process completed successfully', [
                'outlet_id' => $event->outletId,
                'old_name' => $event->oldName,
                'new_name' => $event->newName,
                'owner_id' => $event->ownerId,
                'accounts_updated' => ['cash', 'receivable', 'loan', 'fine'],
                'type' => 'outlet_accounts_rename_success'
            ]);
        } catch (Exception $e) {
            Log::error('Failed to rename outlet accounts', [
                'outlet_id' => $event->outletId,
                'old_name' => $event->oldName,
                'new_name' => $event->newName,
                'owner_id' => $event->ownerId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'type' => 'outlet_accounts_rename_error'
            ]);

            throw $e;
        }
    }

    /**
     * Update account name for specific role
     *
     * @param int $outletId
     * @param string $accountRole
     * @param string $oldAccountName
     * @param string $newAccountName
     * @return void
     */
    private function updateAccountName(int $outletId, string $accountRole, string $oldAccountName, string $newAccountName): void
    {
        try {
            $account = $this->account
                ->byOutletId($outletId)
                ->byAccountRole($accountRole)
                ->first();

            if ($account) {
                $account->update(['name' => $newAccountName]);

                Log::info('Account name updated successfully', [
                    'account_id' => $account->id,
                    'outlet_id' => $outletId,
                    'account_role' => $accountRole,
                    'old_name' => $oldAccountName,
                    'new_name' => $newAccountName,
                    'type' => 'account_name_update'
                ]);
            } else {
                Log::warning('Account not found for renaming', [
                    'outlet_id' => $outletId,
                    'account_role' => $accountRole,
                    'expected_old_name' => $oldAccountName,
                    'type' => 'account_rename_warning'
                ]);
            }
        } catch (Exception $e) {
            Log::error('Failed to update account name', [
                'outlet_id' => $outletId,
                'account_role' => $accountRole,
                'old_name' => $oldAccountName,
                'new_name' => $newAccountName,
                'error' => $e->getMessage(),
                'type' => 'account_name_update_error'
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(OutletRenamed $event, Exception $exception): void
    {
        Log::error('Outlet accounts rename job failed permanently', [
            'outlet_id' => $event->outletId,
            'old_name' => $event->oldName,
            'new_name' => $event->newName,
            'owner_id' => $event->ownerId,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
            'type' => 'outlet_accounts_rename_failed'
        ]);
    }
}
