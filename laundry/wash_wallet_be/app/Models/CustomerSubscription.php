<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

#[Table('customer_subscriptions')]
class CustomerSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'service_package_id',
        'subscription_code',
        'price_paid',
        'purchase_date',
        'expired_at',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'customer_id'        => 'integer',
            'service_package_id' => 'integer',
            'price_paid'    => 'decimal:2',
            'purchase_date' => 'datetime',
            'expired_at'    => 'datetime',
            'created_at'    => 'datetime',
            'updated_at'    => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function servicePackage(): BelongsTo
    {
        return $this->belongsTo(ServicePackage::class);
    }

    public function customerQuotas(): HasMany
    {
        return $this->hasMany(CustomerQuota::class);
    }

    public function quotaUsageLogs(): HasMany
    {
        return $this->hasMany(QuotaUsageLog::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Status Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active')
            ->whereNested(function ($q) {
                $q->whereNull('expired_at')
                    ->orWhere('expired_at', '>', now());
            });
    }

    public function scopeExhausted(Builder $query): Builder
    {
        return $query->where('status', 'exhausted');
    }

    public function scopeExpired(Builder $query): Builder
    {
        return $query->where('status', 'expired');
    }

    /** Subscriptions expiring within $days days. */
    public function scopeExpiringSoon(Builder $query, int $days = 7): Builder
    {
        return $query->where('status', 'active')
            ->whereNotNull('expired_at')
            ->whereBetween('expired_at', [now(), now()->addDays($days)]);
    }

    /*
    |--------------------------------------------------------------------------
    | Filter Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeById(Builder $query, int $id): Builder
    {
        return $query->where('id', $id);
    }

    public function scopeByCustomerId(Builder $query, int $customerId): Builder
    {
        return $query->where('customer_id', $customerId);
    }

    public function scopeByServicePackageId(Builder $query, int $packageId): Builder
    {
        return $query->where('service_package_id', $packageId);
    }

    public function scopeByOwnerId(Builder $query, int $ownerId): Builder
    {
        return $query->whereHas('customer.outlet', function ($q) use ($ownerId) {
            $q->where('owner_id', $ownerId);
        });
    }

    public function scopeByOutletId(Builder $query, int $outletId): Builder
    {
        return $query->whereHas('customer.outlet', function ($q) use ($outletId) {
            $q->where('id', $outletId);
        });
    }

    public function scopeMinPurchaseDate(Builder $query, Carbon $date): Builder
    {
        return $query->where('purchase_date', '>=', $date);
    }

    public function scopeMaxPurchaseDate(Builder $query, Carbon $date): Builder
    {
        return $query->where('purchase_date', '<=', $date);
    }

    public function scopeExpiredAtFrom(Builder $query, Carbon $date): Builder
    {
        return $query->where('expired_at', '>=', $date);
    }

    public function scopeExpiredAtTo(Builder $query, Carbon $date): Builder
    {
        return $query->where('expired_at', '<=', $date);
    }

    public function scopeMinPricePaid(Builder $query, float $amount): Builder
    {
        return $query->where('price_paid', '>=', $amount);
    }

    public function scopeMaxPricePaid(Builder $query, float $amount): Builder
    {
        return $query->where('price_paid', '<=', $amount);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function (Builder $q) use ($search) {
            $q->where('subscription_code', 'LIKE', "%$search%")
                ->orWhereHas('customer', function (Builder $cq) use ($search) {
                    $cq->where('name', 'LIKE', "%$search%")
                        ->orWhere('email', 'LIKE', "%$search%")
                        ->orWhere('phone', 'LIKE', "%$search%");
                });
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'created_at', string $direction = 'desc'): Builder
    {
        $allowedColumns = [
            'subscriptionCode',
            'pricePaid',
            'purchaseDate',
            'expiredAt',
            'status',
            'createdAt',
            'updatedAt',
        ];

        $columnMap = [
            'subscriptionCode' => 'subscription_code',
            'pricePaid'        => 'price_paid',
            'purchaseDate'     => 'purchase_date',
            'expiredAt'        => 'expired_at',
            'createdAt'        => 'created_at',
            'updatedAt'        => 'updated_at',
        ];

        if (!in_array($column, $allowedColumns)) {
            $column = 'createdAt';
        }

        $column    = $columnMap[$column] ?? $column;
        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($column, $direction);

        return $query;
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function getRemainingDays(): ?int
    {
        if (!$this->expired_at) {
            return null;
        }

        $days = now()->diffInDays($this->expired_at, false);
        return $days > 0 ? (int) $days : 0;
    }

    public function getStatusBadgeVariant(): string
    {
        return match ($this->status) {
            'active'    => 'success',
            'expired'   => 'danger',
            'exhausted' => 'warning',
            default     => 'secondary',
        };
    }

    public function getStatusLabel(): string
    {
        return match ($this->status) {
            'active'    => 'Aktif',
            'expired'   => 'Kadaluarsa',
            'exhausted' => 'Habis',
            'cancelled' => 'Dibatalkan',
            default     => 'Tidak Diketahui',
        };
    }

    public function hasQuota(int $laundryServiceId, float $quantity): bool
    {
        $quota = $this->customerQuotas()
            ->firstWhere('laundry_service_id', $laundryServiceId);

        if (!$quota instanceof CustomerQuota) {
            return false;
        }

        return ((float) $quota->total_quantity - (float) $quota->used_quantity) >= $quantity;
    }

    /** @throws \Exception */
    public function deductQuota(int $laundryServiceId, float $quantity): void
    {
        $quota = $this->customerQuotas()
            ->firstWhere('laundry_service_id', $laundryServiceId);

        if (!$quota instanceof CustomerQuota || !$this->hasQuota($laundryServiceId, $quantity)) {
            throw new \Exception('Quota tidak cukup.');
        }

        $quota->increment('used_quantity', $quantity);
    }

    /*
    |--------------------------------------------------------------------------
    | Static Helpers
    |--------------------------------------------------------------------------
    */

    public static function generateCode(): string
    {
        $prefix    = 'SUB';
        $timestamp = now()->format('ymdHis');
        $random    = strtoupper(substr(md5(uniqid((string) mt_rand(), true)), 0, 4));

        return $prefix . '-' . $timestamp . '-' . $random;
    }
}
