<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Table('prives')]
class Prive extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'outlet_id',
        'user_id',
        'source_account_id',
        'equity_account_id',
        'amount',
        'date',
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
            'outlet_id'         => 'integer',
            'user_id'           => 'integer',
            'source_account_id' => 'integer',
            'equity_account_id' => 'integer',
            'amount'            => 'decimal:2',
            'date'              => 'date',
            'created_at'        => 'datetime',
            'updated_at'        => 'datetime',
            'deleted_at'        => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sourceAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'source_account_id');
    }

    public function equityAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'equity_account_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where('description', 'like', "%{$search}%");
    }

    public function scopeByOutletId(Builder $query, int $outletId): Builder
    {
        return $query->where('outlet_id', $outletId);
    }

    public function scopeByUserId(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByOwnerId(Builder $query, int $ownerId): Builder
    {
        return $query->where('user_id', $ownerId);
    }

    public function scopeBySourceAccountId(Builder $query, int $accountId): Builder
    {
        return $query->where('source_account_id', $accountId);
    }

    public function scopeByEquityAccountId(Builder $query, int $accountId): Builder
    {
        return $query->where('equity_account_id', $accountId);
    }

    public function scopeByDateFrom(Builder $query, string $date): Builder
    {
        return $query->whereDate('date', '>=', $date);
    }

    public function scopeByDateTo(Builder $query, string $date): Builder
    {
        return $query->whereDate('date', '<=', $date);
    }

    public function scopeMinAmount(Builder $query, float $amount): Builder
    {
        return $query->where('amount', '>=', $amount);
    }

    public function scopeMaxAmount(Builder $query, float $amount): Builder
    {
        return $query->where('amount', '<=', $amount);
    }
}
