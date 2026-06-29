<?php

namespace App\Console\Commands;

use App\Models\OutletFeature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckFeatureExpiry extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'features:check-expiry';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check and update expired outlet features based on expires_at date.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting feature expiry check...');

        $expiredCount = OutletFeature::where('status', OutletFeature::STATUS_ACTIVE)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->update(['status' => OutletFeature::STATUS_EXPIRED]);

        if ($expiredCount > 0) {
            $this->info("Successfully expired {$expiredCount} features.");
            Log::info("Feature expiry check completed. Expired: {$expiredCount}");
        } else {
            $this->info('No features expired today.');
        }

        $expiredTrialCount = OutletFeature::where('status', OutletFeature::STATUS_TRIAL)
            ->whereNotNull('trial_expires_at')
            ->where('trial_expires_at', '<', now())
            ->update(['status' => OutletFeature::STATUS_EXPIRED]);

        if ($expiredTrialCount > 0) {
            $this->info("Successfully expired {$expiredTrialCount} trials.");
            Log::info("Trial expiry check completed. Expired: {$expiredTrialCount}");
        }

        $this->info('Feature expiry check finished.');
    }
}
