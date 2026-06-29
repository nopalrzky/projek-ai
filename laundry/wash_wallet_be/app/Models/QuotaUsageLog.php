<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('quota_usage_logs')]
class QuotaUsageLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_subscription_id',
        'order_item_id',
        'amount_used',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount_used' => 'decimal:2',
            'created_at'  => 'datetime',
            'updated_at'  => 'datetime',
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

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
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

    public function scopeByOrderItemId(Builder $query, int $orderItemId): Builder
    {
        return $query->where('order_item_id', $orderItemId);
    }

    public function scopeDateBetween(Builder $query, string $startDate, string $endDate): Builder
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    public function scopeWithAll(Builder $query): Builder
    {
        return $query->with(['customerSubscription.customer', 'orderItem.order']);
    }

    /*
    |--------------------------------------------------------------------------
    | Static Helpers
    |--------------------------------------------------------------------------
    */

    public static function getTotalUsage(int $subscriptionId): float
    {
        return (float) static::byCustomerSubscriptionId($subscriptionId)->sum('amount_used');
    }
}
