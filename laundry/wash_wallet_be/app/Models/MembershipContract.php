<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

#[Table('membership_contracts')]
class MembershipContract extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE  = 'active';
    public const STATUS_EXPIRED = 'expired';

    protected $fillable = [
        'customer_id',
        'outlet_id',
        'membership_plan_id',
        'start_at',
        'expired_at',
        'status',
        'total_paid',
        'free_shipping_used',
        'free_shipping_expires_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_at'   => 'datetime',
            'expired_at' => 'datetime',
            'total_paid'               => 'decimal:2',
            'free_shipping_used'       => 'integer',
            'free_shipping_expires_at' => 'datetime',
            'created_at'               => 'datetime',
            'updated_at'               => 'datetime',
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

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function membershipPlan(): BelongsTo
    {
        return $this->belongsTo(MembershipPlan::class, 'membership_plan_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
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

    public function scopeByOutletId(Builder $query, int $outletId): Builder
    {
        return $query->where('outlet_id', $outletId);
    }

    public function scopeByOwnerId(Builder $query, int $ownerId): Builder
    {
        return $query->whereHas('outlet', function (Builder $outletQuery) use ($ownerId) {
            $outletQuery->where('owner_id', $ownerId);
        });
    }

    public function scopeByMembershipPlanId(Builder $query, int $planId): Builder
    {
        return $query->where('membership_plan_id', $planId);
    }

    public function scopeStartDateFrom(Builder $query, \Carbon\Carbon $date): Builder
    {
        return $query->where('start_at', '>=', $date->startOfDay());
    }

    public function scopeStartDateTo(Builder $query, \Carbon\Carbon $date): Builder
    {
        return $query->where('start_at', '<=', $date->endOfDay());
    }

    public function scopeExpiredAtFrom(Builder $query, \Carbon\Carbon $date): Builder
    {
        return $query->where('expired_at', '>=', $date->startOfDay());
    }

    public function scopeExpiredAtTo(Builder $query, \Carbon\Carbon $date): Builder
    {
        return $query->where('expired_at', '<=', $date->endOfDay());
    }

    public function scopeTotalPaidMin(Builder $query, float $amount): Builder
    {
        return $query->where('total_paid', '>=', $amount);
    }

    public function scopeTotalPaidMax(Builder $query, float $amount): Builder
    {
        return $query->where('total_paid', '<=', $amount);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_EXPIRED);
    }

    public function scopeExpired(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_EXPIRED);
    }

    public function scopeStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeActiveByCustomerAndPlan(Builder $query, int $customerId, int $membershipPlanId): Builder
    {
        return $query->active()
            ->where('customer_id', $customerId)
            ->where('membership_plan_id', $membershipPlanId);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('id', 'like', "%{$search}%")
                ->orWhereHas('customer', function ($customerQuery) use ($search) {
                    $customerQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                })
                ->orWhereHas('membershipPlan', function ($planQuery) use ($search) {
                    $planQuery->where('name', 'like', "%{$search}%");
                });
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'createdAt', string $direction = 'desc'): Builder
    {
        $allowedColumns = [
            'id',
            'startAt',
            'expiredAt',
            'totalPaid',
            'status',
            'createdAt',
            'updatedAt',
        ];

        $columnsMap = [
            'startAt'   => 'start_at',
            'expiredAt' => 'expired_at',
            'totalPaid' => 'total_paid',
            'createdAt' => 'created_at',
            'updatedAt' => 'updated_at',
        ];

        if (!in_array($column, $allowedColumns)) {
            $column = 'createdAt';
        }

        $column = $columnsMap[$column] ?? $column;

        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($column, $direction);

        return $query;
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    /** Get sisa hari sebelum expired */
    public function daysRemaining(): ?int
    {
        if ($this->expired_at === null || $this->isExpired()) {
            return null;
        }

        return (int) now()->diffInDays($this->expired_at, false);
    }

    public function isExpired(): bool
    {
        return $this->expired_at !== null && $this->expired_at->isPast();
    }

    public function getFormattedTotalPaid(): string
    {
        return 'Rp. ' . number_format((float)$this->total_paid, 2, ',', '.');
    }

    public static function hasActivePlanForCustomer(
        int $customerId,
        int $membershipPlanId,
        ?int $ignoreContractId = null
    ): bool {
        $query = static::query()->activeByCustomerAndPlan($customerId, $membershipPlanId);

        if ($ignoreContractId !== null) {
            $query->where('id', '!=', $ignoreContractId);
        }

        return $query->exists();
    }

    /** Check if membership free shipping can be used */
    public function canUseFreeShipping(): bool
    {
        if ($this->status !== self::STATUS_ACTIVE || $this->isExpired()) {
            return false;
        }

        if ($this->free_shipping_expires_at !== null && $this->free_shipping_expires_at->isPast()) {
            return false;
        }

        $plan = $this->membershipPlan;
        if (!$plan || !$plan->free_shipping) {
            return false;
        }

        // null quota means unlimited
        if ($plan->free_shipping_quota !== null && $this->free_shipping_used >= $plan->free_shipping_quota) {
            return false;
        }

        return true;
    }

    /** Increment free shipping usage count */
    public function useFreeShipping(): void
    {
        if ($this->canUseFreeShipping()) {
            $this->increment('free_shipping_used');
        }
    }

    /** Get remaining free shipping quota */
    public function getRemainingFreeShipping(): ?int
    {
        $plan = $this->membershipPlan;
        if (!$plan || !$plan->free_shipping) {
            return 0;
        }

        if ($plan->free_shipping_quota === null) {
            return null; // unlimited
        }

        return max(0, $plan->free_shipping_quota - $this->free_shipping_used);
    }
}
