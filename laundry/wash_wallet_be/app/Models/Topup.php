<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Table('topups')]
class Topup extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'outlet_id',
        'amount_money',
        'coin_received',
        'status',
        'payment_status',
        'payment_provider',
        'payment_reference',
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
            'user_id'        => 'integer',
            'outlet_id'      => 'integer',
            'amount_money'  => 'integer',
            'coin_received' => 'integer',
            'payment_data'  => 'array',
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function referralLog(): HasOne
    {
        return $this->hasOne(ReferralLog::class);
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

    public function scopeByIds(Builder $query, array $ids): Builder
    {
        return $query->whereIn('id', $ids);
    }

    public function scopeByUserId(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByOutletId(Builder $query, int $outletId): Builder
    {
        return $query->where('outlet_id', $outletId);
    }

    public function scopeByMidtransOrderId(Builder $query, string $midtransOrderId): Builder
    {
        return $query->where('midtrans_order_id', $midtransOrderId);
    }

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeByPaymentStatus(Builder $query, string $paymentStatus): Builder
    {
        return $query->where('payment_status', $paymentStatus);
    }

    public function scopeByPaymentReference(Builder $query, string $reference): Builder
    {
        return $query->where('payment_reference', $reference);
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

    public function scopePaymentPending(Builder $query): Builder
    {
        return $query->where('payment_status', 'pending');
    }

    public function scopePaymentPaid(Builder $query): Builder
    {
        return $query->where('payment_status', 'paid');
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('payment_reference', 'like', "%{$search}%")
                ->orWhere('payment_provider', 'like', "%{$search}%")
                ->orWhereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'created_at', string $direction = 'desc'): Builder
    {
        $allowedColumns = [
            'amountMoney',
            'coinReceived',
            'status',
            'paymentStatus',
            'createdAt',
            'updatedAt',
        ];

        $columnMap = [
            'amountMoney'   => 'amount_money',
            'coinReceived'  => 'coin_received',
            'paymentStatus' => 'payment_status',
            'createdAt'     => 'created_at',
            'updatedAt'     => 'updated_at',
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

    public function markAsSuccess(): bool
    {
        return $this->update(['status' => 'success']);
    }

    public function markAsFailed(): bool
    {
        return $this->update(['status' => 'failed']);
    }

    public function isMasterTopup(): bool
    {
        return $this->outlet_id === null;
    }

    public function topupTypeLabel(): string
    {
        return $this->isMasterTopup() ? 'Master Topup' : 'Outlet Topup';
    }

    public function formattedAmountMoney(): string
    {
        return 'Rp. ' . number_format($this->amount_money, 0, ',', '.');
    }
}
