<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('order_reviews')]
class OrderReview extends Model
{
    protected $fillable = [
        'order_id',
        'outlet_id',
        'customer_account_id',
        'customer_name',
        'rating',
        'comment',
        'is_published',
    ];

    /**
     * Get the order that owns the review.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the customer account that owns the review.
     */
    public function customerAccount(): BelongsTo
    {
        return $this->belongsTo(CustomerAccount::class);
    }

    /**
     * Get the outlet that owns the review.
     */
    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function scopeById(Builder $query, int $id): Builder
    {
        return $query->where('id', $id);
    }

    public function scopeByOutletId(Builder $query, int $outletId): Builder
    {
        return $query->where('outlet_id', $outletId);
    }

    public function scopeByCustomerAccountId(Builder $query, int $customerAccountId): Builder
    {
        return $query->where('customer_account_id', $customerAccountId);
    }

    public function scopeByOrderId(Builder $query, int $orderId): Builder
    {
        return $query->where('order_id', $orderId);
    }
    /**
     * Get the masked name of the customer.
     */
    protected function maskedName(): Attribute
    {
        return Attribute::make(
            get: function () {
                $name = $this->customer_name;
                if (strlen($name) <= 2) {
                    return str_repeat('*', strlen($name));
                }
                return strtolower($name[0]) . str_repeat('*', strlen($name) - 2) . strtolower($name[strlen($name) - 1]);
            }
        );
    }
}
