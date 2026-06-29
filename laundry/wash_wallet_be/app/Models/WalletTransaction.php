<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('wallet_transactions')]
class WalletTransaction extends Model
{
    use HasFactory;

    const TYPE_ORDER_TRANSFER_INCOME     = 'order_transfer_income';
    const TYPE_ORDER_WALLET_INCOME       = 'order_wallet_income';
    const TYPE_WITHDRAWAL_REQUEST        = 'withdrawal_request';
    const TYPE_WITHDRAWAL_REJECTED_REFUND = 'withdrawal_rejected_refund';
    const TYPE_WITHDRAWAL_CANCELLED_REFUND = 'withdrawal_cancelled_refund';
    const TYPE_MANUAL_ADJUSTMENT         = 'manual_adjustment';

    protected $fillable = [
        'user_id',
        'outlet_id',
        'order_id',
        'wallet_withdrawal_id',
        'transaction_number',
        'type',
        'amount',
        'gross_amount',
        'fee_amount',
        'net_amount',
        'balance_before',
        'balance_after',
        'description',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount'         => 'decimal:2',
            'balance_before' => 'decimal:2',
            'balance_after'  => 'decimal:2',
            'created_at'     => 'datetime',
            'updated_at'     => 'datetime',
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

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function walletWithdrawal(): BelongsTo
    {
        return $this->belongsTo(WalletWithdrawal::class);
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

    public function scopeByUserId(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByOwnerId(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    public function scopeByOrderId(Builder $query, int $orderId): Builder
    {
        return $query->where('order_id', $orderId);
    }

    public function scopeByWalletWithdrawalId(Builder $query, int $walletWithdrawalId): Builder
    {
        return $query->where('wallet_withdrawal_id', $walletWithdrawalId);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('transaction_number', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhere('type', 'like', "%{$search}%")
                ->orWhereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'createdAt', string $direction = 'desc'): Builder
    {
        $allowedColumns = [
            'transactionNumber',
            'type',
            'amount',
            'balanceBefore',
            'balanceAfter',
            'createdAt',
            'updatedAt',
        ];

        $columnMap = [
            'transactionNumber' => 'transaction_number',
            'balanceBefore'     => 'balance_before',
            'balanceAfter'      => 'balance_after',
            'createdAt'         => 'created_at',
            'updatedAt'         => 'updated_at',
        ];

        if (!in_array($column, $allowedColumns)) {
            $column = 'createdAt';
        }

        $column    = $columnMap[$column] ?? $column;
        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($column, $direction);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isCredit(): bool
    {
        return (float) $this->amount > 0;
    }

    public function isDebit(): bool
    {
        return (float) $this->amount < 0;
    }

    /*
    |--------------------------------------------------------------------------
    | Static Helpers
    |--------------------------------------------------------------------------
    */

    public static function generateTransactionNumber(): string
    {
        $date   = now()->format('Ymd');
        $prefix = "WTX-{$date}-";

        $lastTransaction = self::where('transaction_number', 'like', "{$prefix}%")
            ->orderBy('transaction_number', 'desc')
            ->first();

        $newNumber = $lastTransaction
            ? (int) substr($lastTransaction->transaction_number, -4) + 1
            : 1;

        return $prefix . str_pad((string) $newNumber, 4, '0', STR_PAD_LEFT);
    }
}
