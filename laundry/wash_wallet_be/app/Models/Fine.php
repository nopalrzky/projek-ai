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

#[Table('fines')]
class Fine extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'outlet_id',
        'name',
        'amount',
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
            'amount'     => 'decimal:2',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    protected $hidden = [
        'deleted_at',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function fineLogs(): HasMany
    {
        return $this->hasMany(FineLog::class);
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

    public function scopeByOutletId(Builder $query, int $outletId): Builder
    {
        return $query->where('outlet_id', $outletId);
    }

    public function scopeByOwnerId(Builder $query, int $ownerId): Builder
    {
        return $query->whereHas('outlet', function (Builder $q) use ($ownerId) {
            $q->where('owner_id', $ownerId);
        });
    }

    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->whereNested(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%");
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'createdAt', string $direction = 'desc'): Builder
    {
        $allowedColumns = ['amount', 'name', 'createdAt', 'updatedAt'];

        $columnMap = [
            'createdAt' => 'created_at',
            'updatedAt' => 'updated_at',
        ];

        if (!in_array($column, $allowedColumns)) {
            $column = 'createdAt';
        }

        $column    = $columnMap[$column] ?? $column;
        $direction = in_array(strtolower($direction), ['asc', 'desc']) ? strtolower($direction) : 'desc';
        $query->orderBy($column, $direction);

        return $query;
    }

    public function scopeMinAmount(Builder $query, float $amount): Builder
    {
        return $query->where('amount', '>=', $amount);
    }

    public function scopeMaxAmount(Builder $query, float $amount): Builder
    {
        return $query->where('amount', '<=', $amount);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function canBeDeleted(): bool
    {
        return $this->fineLogs()->count() === 0;
    }
}
