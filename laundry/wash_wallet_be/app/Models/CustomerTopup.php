<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('customer_topups')]
class CustomerTopup extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_account_id',
        'amount',
        'status',
        'payment_status',
        'payment_provider',
        'payment_method',
        'payment_data',
        'midtrans_order_id',
        'expired_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'payment_data' => 'array',
            'expired_at' => 'datetime',
        ];
    }

    public function customerAccount(): BelongsTo
    {
        return $this->belongsTo(CustomerAccount::class);
    }

    public function scopeByCustomerAccountId(Builder $query, int $customerId): Builder
    {
        return $query->where('customer_account_id', $customerId);
    }

    public function scopeByMidtransOrderId(Builder $query, string $midtransOrderId): Builder
    {
        return $query->where('midtrans_order_id', $midtransOrderId);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopeSuccess(Builder $query): Builder
    {
        return $query->where('status', 'success');
    }

    public function scopeFailed(Builder $query): Builder
    {
        return $query->where('status', 'failed');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isSuccess(): bool
    {
        return $this->status === 'success';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }
}
