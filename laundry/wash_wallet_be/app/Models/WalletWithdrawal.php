<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Table('wallet_withdrawals')]
class WalletWithdrawal extends Model
{
    use HasFactory, SoftDeletes;

    const STATUS_PENDING    = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_PAID       = 'paid';
    const STATUS_REJECTED   = 'rejected';
    const STATUS_CANCELLED  = 'cancelled';

    protected $fillable = [
        'user_id',
        'owner_bank_account_id',
        'code',
        'requested_amount',
        'admin_fee',
        'net_amount',
        'status',
        'bank_name',
        'bank_code',
        'account_number',
        'account_holder_name',
        'admin_note',
        'proof_path',
        'processed_by',
        'processed_at',
        'paid_at',
        'rejected_at',
        'cancelled_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'user_id'               => 'integer',
            'owner_bank_account_id' => 'integer',
            'processed_by'          => 'integer',
            'requested_amount' => 'decimal:2',
            'admin_fee'        => 'decimal:2',
            'net_amount'       => 'decimal:2',
            'processed_at'     => 'datetime',
            'paid_at'          => 'datetime',
            'rejected_at'      => 'datetime',
            'cancelled_at'     => 'datetime',
            'created_at'       => 'datetime',
            'updated_at'       => 'datetime',
            'deleted_at'       => 'datetime',
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

    public function ownerBankAccount(): BelongsTo
    {
        return $this->belongsTo(OwnerBankAccount::class);
    }

    public function processedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function walletTransactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
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

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeProcessing(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PROCESSING);
    }

    public function scopePendingOrProcessing(Builder $query): Builder
    {
        return $query->whereIn('status', [self::STATUS_PENDING, self::STATUS_PROCESSING]);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('code', 'like', "%{$search}%")
                ->orWhere('bank_name', 'like', "%{$search}%")
                ->orWhere('account_number', 'like', "%{$search}%")
                ->orWhereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'createdAt', string $direction = 'desc'): Builder
    {
        $allowedColumns = [
            'code',
            'requestedAmount',
            'adminFee',
            'netAmount',
            'status',
            'createdAt',
            'updatedAt',
        ];

        $columnMap = [
            'requestedAmount' => 'requested_amount',
            'adminFee'        => 'admin_fee',
            'netAmount'       => 'net_amount',
            'createdAt'       => 'created_at',
            'updatedAt'       => 'updated_at',
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

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isProcessing(): bool
    {
        return $this->status === self::STATUS_PROCESSING;
    }

    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    public function canBeProcessed(): bool
    {
        return $this->isPending();
    }

    public function canBeCancelled(): bool
    {
        return $this->isPending();
    }

    /*
    |--------------------------------------------------------------------------
    | Static Helpers
    |--------------------------------------------------------------------------
    */

    public static function generateCode(): string
    {
        $date   = now()->format('Ymd');
        $prefix = "WDR-{$date}-";

        $lastWithdrawal = self::where('code', 'like', "{$prefix}%")
            ->orderBy('code', 'desc')
            ->first();

        $newNumber = $lastWithdrawal
            ? (int) substr($lastWithdrawal->code, -4) + 1
            : 1;

        return $prefix . str_pad((string) $newNumber, 4, '0', STR_PAD_LEFT);
    }
}
