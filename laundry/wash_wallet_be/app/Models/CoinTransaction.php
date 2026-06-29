<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('coin_transactions')]
class CoinTransaction extends Model
{
    use HasFactory;

    const TYPE_TOPUP              = 'topup';
    const TYPE_COMMISSION         = 'commission';
    const TYPE_TRANSFER_TO_OUTLET = 'transfer_to_outlet';
    const TYPE_OUTLET_SPENDING    = 'outlet_spending';
    const TYPE_AUTO_FALLBACK      = 'auto_fallback';
    const TYPE_WITHDRAWAL         = 'withdrawal';
    const TYPE_FEATURE_UNLOCK     = 'feature_unlock';
    const TYPE_FEATURE_RENEWAL    = 'feature_renewal';
    const TYPE_WA_NOTIFICATION    = 'wa_notification';
    const TYPE_PRINT_RECEIPT      = 'print_receipt';
    const TYPE_PRINT_LABEL        = 'print_label';

    protected $fillable = [
        'user_id',
        'outlet_id',
        'transaction_number',
        'type',
        'amount',
        'description',
        'reference_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount'       => 'integer',
            'reference_id' => 'integer',
            'created_at'   => 'datetime',
            'updated_at'   => 'datetime',
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

    public function scopeByType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    public function scopeByReferenceId(Builder $query, int $referenceId): Builder
    {
        return $query->where('reference_id', $referenceId);
    }

    public function scopeTopup(Builder $query): Builder
    {
        return $query->where('type', 'topup');
    }

    public function scopeCommission(Builder $query): Builder
    {
        return $query->where('type', 'commission');
    }

    public function scopeTransferToOutlet(Builder $query): Builder
    {
        return $query->where('type', 'transfer_to_outlet');
    }

    public function scopeOutletSpending(Builder $query): Builder
    {
        return $query->where('type', 'outlet_spending');
    }

    public function scopeAutoFallback(Builder $query): Builder
    {
        return $query->where('type', 'auto_fallback');
    }

    public function scopeWithdrawal(Builder $query): Builder
    {
        return $query->where('type', 'withdrawal');
    }

    public function scopeFeatureUnlock(Builder $query): Builder
    {
        return $query->where('type', 'feature_unlock');
    }

    public function scopeFeatureRenewal(Builder $query): Builder
    {
        return $query->where('type', 'feature_renewal');
    }

    public function scopeWaNotification(Builder $query): Builder
    {
        return $query->where('type', 'wa_notification');
    }

    public function scopePrintReceipt(Builder $query): Builder
    {
        return $query->where('type', 'print_receipt');
    }

    public function scopePrintLabel(Builder $query): Builder
    {
        return $query->where('type', 'print_label');
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('description', 'like', "%{$search}%")
                ->orWhere('type', 'like', "%{$search}%")
                ->orWhereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'created_at', string $direction = 'desc'): Builder
    {
        $allowedColumns = [
            'amount',
            'type',
            'createdAt',
            'updatedAt',
        ];

        $columnMap = [
            'createdAt' => 'created_at',
            'updatedAt' => 'updated_at',
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

    public function isTopup(): bool
    {
        return $this->type === 'topup';
    }

    public function isCommission(): bool
    {
        return $this->type === 'commission';
    }

    public function isTransferToOutlet(): bool
    {
        return $this->type === 'transfer_to_outlet';
    }

    public function isOutletSpending(): bool
    {
        return $this->type === 'outlet_spending';
    }

    public function isAutoFallback(): bool
    {
        return $this->type === 'auto_fallback';
    }

    public function isWithdrawal(): bool
    {
        return $this->type === 'withdrawal';
    }

    public function isFeatureUnlock(): bool
    {
        return $this->type === 'feature_unlock';
    }

    public function isFeatureRenewal(): bool
    {
        return $this->type === 'feature_renewal';
    }

    public function isWaNotification(): bool
    {
        return $this->type === 'wa_notification';
    }

    public function isPrintReceipt(): bool
    {
        return $this->type === 'print_receipt';
    }

    public function isPrintLabel(): bool
    {
        return $this->type === 'print_label';
    }
}
