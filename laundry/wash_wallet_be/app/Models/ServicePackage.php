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

#[Table('service_packages')]
class ServicePackage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'outlet_id',
        'name',
        'price',
        'validity_days',
        'description',
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
            'price'         => 'decimal:2',
            'validity_days' => 'integer',
            'is_active'     => 'boolean',
            'created_at'    => 'datetime',
            'updated_at'    => 'datetime',
            'deleted_at'    => 'datetime',
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

    public function servicePackageItems(): HasMany
    {
        return $this->hasMany(ServicePackageItem::class);
    }

    public function customerSubscriptions(): HasMany
    {
        return $this->hasMany(CustomerSubscription::class);
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

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }

    public function scopeSortBy(Builder $query, string $field, string $direction = 'asc'): Builder
    {
        $allowedFields = ['name', 'price', 'validityDays', 'createdAt', 'updatedAt'];

        $columnMap = [
            'validityDays' => 'validity_days',
            'createdAt'    => 'created_at',
            'updatedAt'    => 'updated_at',
        ];

        if (!in_array($field, $allowedFields)) {
            $field = 'createdAt';
        }

        $column = $columnMap[$field] ?? $field;
        $query->orderBy($column, $direction);

        return $query;
    }

    public function scopeMinPrice(Builder $query, float $minPrice): Builder
    {
        return $query->where('price', '>=', $minPrice);
    }

    public function scopeMaxPrice(Builder $query, float $maxPrice): Builder
    {
        return $query->where('price', '<=', $maxPrice);
    }

    public function scopeMinValidityDays(Builder $query, int $minDays): Builder
    {
        return $query->where('validity_days', '>=', $minDays);
    }

    public function scopeMaxValidityDays(Builder $query, int $maxDays): Builder
    {
        return $query->where('validity_days', '<=', $maxDays);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function hasTransactions(): bool
    {
        return $this->customerSubscriptions()->exists();
    }
}
