<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Table('owner_bank_accounts')]
class OwnerBankAccount extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'withdrawal_bank_id',
        'account_number',
        'account_holder_name',
        'is_default',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'is_active'  => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
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

    public function withdrawalBank(): BelongsTo
    {
        return $this->belongsTo(WithdrawalBank::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeByUserId(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }
    
    public function scopeByOwnerId(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeDefault(Builder $query): Builder
    {
        return $query->where('is_default', true);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('account_number', 'like', "%{$search}%")
                ->orWhere('account_holder_name', 'like', "%{$search}%")
                ->orWhereHas('withdrawalBank', function ($bankQuery) use ($search) {
                    $bankQuery->where('bank_name', 'like', "%{$search}%")
                        ->orWhere('bank_code', 'like', "%{$search}%");
                });
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'createdAt', string $direction = 'desc'): Builder
    {
        $allowedColumns = [
            'accountNumber',
            'accountHolderName',
            'isDefault',
            'isActive',
            'createdAt',
            'updatedAt',
        ];

        $columnMap = [
            'accountNumber'     => 'account_number',
            'accountHolderName' => 'account_holder_name',
            'isDefault'         => 'is_default',
            'isActive'          => 'is_active',
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
}
