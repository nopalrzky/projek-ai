<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Table('withdrawal_banks')]
class WithdrawalBank extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'bank_name',
        'bank_code',
        'admin_fee',
        'min_withdrawal',
        'max_withdrawal',
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
            'admin_fee'      => 'decimal:2',
            'min_withdrawal' => 'decimal:2',
            'max_withdrawal' => 'decimal:2',
            'is_active'      => 'boolean',
            'created_at'     => 'datetime',
            'updated_at'     => 'datetime',
            'deleted_at'     => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function ownerBankAccounts(): HasMany
    {
        return $this->hasMany(OwnerBankAccount::class);
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

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('bank_name', 'like', "%{$search}%")
                ->orWhere('bank_code', 'like', "%{$search}%");
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'createdAt', string $direction = 'desc'): Builder
    {
        $allowedColumns = [
            'bankName',
            'adminFee',
            'minWithdrawal',
            'maxWithdrawal',
            'isActive',
            'createdAt',
            'updatedAt',
        ];

        $columnMap = [
            'bankName'      => 'bank_name',
            'adminFee'      => 'admin_fee',
            'minWithdrawal' => 'min_withdrawal',
            'maxWithdrawal' => 'max_withdrawal',
            'isActive'      => 'is_active',
            'createdAt'     => 'created_at',
            'updatedAt'     => 'updated_at',
        ];

        if (!in_array($column, $allowedColumns)) {
            $column = 'createdAt';
        }

        $column    = $columnMap[$column] ?? $column;
        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($column, $direction);
    }
}
