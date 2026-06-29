<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

#[Table('whatsapp_otps')]
class WhatsappOtp extends Model
{
    protected $fillable = [
        'phone_number',
        'otp_code',
        'expires_at',
        'attempts',
        'is_verified',
        'verified_at',
        'ip_address',
        'user_agent',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expires_at'  => 'datetime',
            'verified_at' => 'datetime',
            'is_verified' => 'boolean',
        ];
    }

    // ------------------------------------------------------------------ //
    //  Helpers
    // ------------------------------------------------------------------ //

    public function isExpired(): bool
    {
        return Carbon::now()->isAfter($this->expires_at);
    }

    public function isValid(): bool
    {
        return !$this->isExpired() && !$this->is_verified;
    }

    public function hasReachedMaxAttempts(): bool
    {
        return $this->attempts >= config('fonnte.otp.max_attempts', 3);
    }

    public function incrementAttempts(): void
    {
        $this->increment('attempts');
    }

    public function markAsVerified(): void
    {
        $this->update([
            'is_verified' => true,
            'verified_at' => now(),
        ]);
    }

    // ------------------------------------------------------------------ //
    //  Scopes
    // ------------------------------------------------------------------ //

    /**
     * Scope: OTP terbaru yang masih valid untuk nomor HP tertentu.
     */
    public function scopeLatestValid($query, string $phoneNumber)
    {
        return $query
            ->where('phone_number', $phoneNumber)
            ->where('is_verified', false)
            ->where('expires_at', '>', now())
            ->latest();
    }
}
