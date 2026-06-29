<?php

namespace App\Listeners;

use App\Services\AccountService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Log;
use Exception;

class GenerateOwnerDefaultAccounts
{
    protected AccountService $accountService;

    /**
     * Create the event listener.
     * Inject Service di sini.
     */
    public function __construct(AccountService $accountService)
    {
        $this->accountService = $accountService;
    }

    /**
     * Handle the event.
     */
    public function handle(Registered $event): void
    {
        $user = $event->user;
        try {
            Log::info("Starting COA generation for new owner: {$user->id}");

            $this->accountService->generateDefaultAccounts($user->id);

            Log::info("COA generation success for owner: {$user->id}");
        } catch (Exception $e) {
            Log::error("Failed to generate default accounts for user {$user->id}", [
                'error' => $e->getMessage()
            ]);
        }
    }
}
