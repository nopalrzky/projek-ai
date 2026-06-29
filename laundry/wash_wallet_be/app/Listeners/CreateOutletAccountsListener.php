<?php

namespace App\Listeners;

use App\Events\OutletCreated;
use App\Services\AccountService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Exception;

class CreateOutletAccountsListener implements ShouldQueue
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

    protected AccountService $accountService;

    /**
     * Create the event listener.
     */
    public function __construct(AccountService $accountService)
    {
        $this->accountService = $accountService;
    }

    /**
     * Handle the event.
     */
    public function handle(OutletCreated $event): void
    {
        try {
            Log::info('Starting outlet accounts creation', [
                'outlet_id' => $event->outletId,
                'outlet_name' => $event->outletName,
                'owner_id' => $event->ownerId,
                'type' => 'outlet_accounts_creation_start'
            ]);

            $this->accountService->createCashAccountForOutlet(
                $event->ownerId,
                $event->outletId,
                $event->outletName
            );

            $this->accountService->createReceivableAccountForOutlet(
                $event->ownerId,
                $event->outletId,
                $event->outletName
            );

            $this->accountService->createLoanAccountForOutlet(
                $event->ownerId,
                $event->outletId,
                $event->outletName
            );

            $this->accountService->createFineAccountForOutlet(
                $event->ownerId,
                $event->outletId,
                $event->outletName
            );

            Log::info('Outlet accounts creation completed successfully', [
                'outlet_id' => $event->outletId,
                'outlet_name' => $event->outletName,
                'owner_id' => $event->ownerId,
                'accounts_created' => ['cash', 'receivable', 'loan', 'fine'],
                'type' => 'outlet_accounts_creation_success'
            ]);
        } catch (Exception $e) {
            Log::error('Failed to create outlet accounts', [
                'outlet_id' => $event->outletId,
                'outlet_name' => $event->outletName,
                'owner_id' => $event->ownerId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'type' => 'outlet_accounts_creation_error'
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(OutletCreated $event, Exception $exception): void
    {
        Log::error('Outlet accounts creation job failed permanently', [
            'outlet_id' => $event->outletId,
            'outlet_name' => $event->outletName,
            'owner_id' => $event->ownerId,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
            'type' => 'outlet_accounts_creation_failed'
        ]);
    }
}
