<?php

namespace App\Console\Commands;

use App\Services\AutoAcceptOrderService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class AutoAcceptOrders extends Command
{
    protected $signature = 'orders:auto-accept';
    protected $description = 'Auto accept customer-app orders by lead time before pickup (if configured) and max distance (if configured), with 24-hour fallback.';

    public function handle(AutoAcceptOrderService $autoAcceptOrderService): int
    {
        $this->info('Starting auto accept order run...');

        $summary = $autoAcceptOrderService->run();

        $message = sprintf(
            'Auto accept order completed. Processed: %d, skipped: %d, failed: %d',
            $summary['processed'],
            $summary['skipped'],
            $summary['failed']
        );

        $this->info($message);
        Log::info($message, $summary);

        return $summary['failed'] > 0 ? Command::FAILURE : Command::SUCCESS;
    }
}
