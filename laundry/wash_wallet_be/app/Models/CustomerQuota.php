<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('customer_quotas')]
class CustomerQuota extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_subscription_id',
        'laundry_service_id',
        'total_quota',
        'remaining_quota',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total_quota'     => 'decimal:2',
            'remaining_quota' => 'decimal:2',
            'created_at'      => 'datetime',
            'updated_at'      => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function customerSubscription(): BelongsTo
    {
        return $this->belongsTo(CustomerSubscription::class);
    }

    public function laundryService(): BelongsTo
    {
        return $this->belongsTo(LaundryService::class);
    }

    public function quotaUsageLogs(): HasMany
    {
        return $this->hasMany(QuotaUsageLog::class, 'customer_subscription_id', 'customer_subscription_id')
            ->where('laundry_service_id', $this->laundry_service_id);
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeByCustomerSubscriptionId(Builder $query, int $subscriptionId): Builder
    {
        return $query->where('customer_subscription_id', $subscriptionId);
    }

    public function scopeByLaundryServiceId(Builder $query, int $laundryServiceId): Builder
    {
        return $query->where('laundry_service_id', $laundryServiceId);
    }

    public function scopeHasRemaining(Builder $query): Builder
    {
        return $query->where('remaining_quota', '>', 0);
    }

    public function scopeExhausted(Builder $query): Builder
    {
        return $query->where('remaining_quota', '<=', 0);
    }

    public function scopeWithAll(Builder $query): Builder
    {
        return $query->with(['customerSubscription.customer', 'laundryService']);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function hasRemaining(): bool
    {
        return $this->remaining_quota > 0;
    }

    public function isExhausted(): bool
    {
        return $this->remaining_quota <= 0;
    }

    public function getUsagePercentage(): float
    {
        if ($this->total_quota <= 0) {
            return 0;
        }

        $used = $this->total_quota - $this->remaining_quota;
        return round(($used / $this->total_quota) * 100, 2);
    }

    public function getUsedQuota(): float
    {
        return $this->total_quota - $this->remaining_quota;
    }

    public function deduct(float $amount): bool
    {
        if ($amount > $this->remaining_quota) {
            return false;
        }

        return $this->update(['remaining_quota' => $this->remaining_quota - $amount]);
    }

    public function canFulfill(float $amount): bool
    {
        return $this->remaining_quota >= $amount;
    }

    public function getFormattedQuota(): string
    {
        $unit = $this->laundryService?->unit?->name ?? 'unit';
        return number_format((float) $this->remaining_quota, 2) . ' / ' .
            number_format((float) $this->total_quota, 2) . ' ' . $unit;
    }

    /*
    |--------------------------------------------------------------------------
    | Static Helpers
    |--------------------------------------------------------------------------
    */

    public static function getAvailableForCustomer(int $customerId, int $laundryServiceId): ?self
    {
        return static::whereHas('customerSubscription', function ($query) use ($customerId) {
            $query->where('customer_id', $customerId)->where('status', 'active');
        })
            ->byLaundryServiceId($laundryServiceId)
            ->hasRemaining()
            ->orderBy('created_at', 'asc')
            ->first();
    }

    public static function getByCustomer(int $customerId): \Illuminate\Database\Eloquent\Collection
    {
        return static::whereHas('customerSubscription', function ($query) use ($customerId) {
            $query->where('customer_id', $customerId)->where('status', 'active');
        })
            ->hasRemaining()
            ->withAll()
            ->get();
    }
}
