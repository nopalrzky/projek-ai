<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('outlet_features')]
class OutletFeature extends Model
{
    use HasFactory;

    const STATUS_TRIAL    = 'trial';
    const STATUS_ACTIVE   = 'active';
    const STATUS_EXPIRED  = 'expired';
    const STATUS_INACTIVE = 'inactive';

    protected $fillable = [
        'outlet_id',
        'feature_id',
        'status',
        'trial_started_at',
        'trial_expires_at',
        'unlocked_at',
        'expires_at',
        'coin_spent',
        'auto_renewal',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'trial_started_at' => 'datetime',
            'trial_expires_at' => 'datetime',
            'unlocked_at'      => 'datetime',
            'expires_at'       => 'datetime',
            'coin_spent'       => 'integer',
            'outlet_id'        => 'integer',
            'feature_id'       => 'integer',
            'auto_renewal'     => 'boolean',
        ];
    }

    /**
     * Relationships
     */
    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function feature(): BelongsTo
    {
        return $this->belongsTo(Feature::class);
    }

    /**
     * Helpers
     */
    public function isTrial(): bool
    {
        return $this->status === self::STATUS_TRIAL;
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function isExpired(): bool
    {
        return $this->status === self::STATUS_EXPIRED;
    }

    public function isInactive(): bool
    {
        return $this->status === self::STATUS_INACTIVE;
    }

    public function hasActiveAccess(): bool
    {
        if ($this->isInactive() || $this->isExpired()) return false;

        if ($this->isActive()) {
            if ($this->expires_at && $this->expires_at->isPast()) {
                return false;
            }
            return true;
        }

        if ($this->isTrial() && $this->trial_expires_at && $this->trial_expires_at->isFuture()) {
            return true;
        }

        return false;
    }

    public function scopeByOutletId($query, int $outletId)
    {
        return $query->where('outlet_id', $outletId);
    }

    public function scopeByOwnerId($query, int $ownerId)
    {
        return $query->whereHas('outlet', function ($query) use ($ownerId) {
            $query->where('owner_id', $ownerId);
        });
    }

    public function scopeByFeatureId($query, int $featureId)
    {
        return $query->where('feature_id', $featureId);
    }
    /**
     * Get remaining trial days
     */
    public function getTrialRemainingDays(): int
    {
        if (!$this->isTrial() || !$this->trial_expires_at) {
            return 0;
        }

        if ($this->trial_expires_at->isPast()) {
            return 0;
        }

        return max(0, (int) now()->diffInDays($this->trial_expires_at));
    }
}
