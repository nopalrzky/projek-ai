<?php

namespace App\Console\Commands;

use App\Models\WhatsappOtp;
use Illuminate\Console\Command;

class CleanupExpiredOtps extends Command
{
    protected $signature   = 'otp:cleanup';
    protected $description = 'Hapus record OTP yang sudah expired lebih dari 24 jam';

    public function handle(): int
    {
        $deleted = WhatsappOtp::where('expires_at', '<', now()->subDay())->delete();

        $this->info("✅ Berhasil menghapus {$deleted} record OTP yang sudah kadaluarsa.");

        return Command::SUCCESS;
    }
}
