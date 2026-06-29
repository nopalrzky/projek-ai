<?php

namespace App\Console\Commands;

use App\Services\OutletService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessExposureRenewals extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'features:process-exposure-renewals';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Process auto-renewal for outlet exposure features.';

  public function __construct(protected OutletService $outletService)
  {
    parent::__construct();
  }

  /**
   * Execute the console command.
   */
  public function handle(): int
  {
    $this->info('Processing outlet exposure auto-renewals...');

    try {
      $processed = $this->outletService->processExposureRenewals();

      $this->info("Processed {$processed} exposure renewal(s).");
      Log::info('Outlet exposure auto-renewal process finished.', [
        'processed' => $processed,
      ]);

      return Command::SUCCESS;
    } catch (\Throwable $e) {
      $this->error('Failed to process exposure renewals: ' . $e->getMessage());
      Log::error('Outlet exposure auto-renewal process failed.', [
        'error' => $e->getMessage(),
      ]);

      return Command::FAILURE;
    }
  }
}
