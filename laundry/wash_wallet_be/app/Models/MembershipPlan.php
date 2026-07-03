<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

#[Table('membership_plans')]
class MembershipPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'outlet_id',
        'name',
        'price',
        'level',
        'duration_days',
        'is_active',
        'discount_percentage',
        'description',
        'free_shipping',
        'free_shipping_quota',
        'free_shipping_validity_days',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'outlet_id'                   => 'integer',
            'price'                       => 'decimal:2',
            'level'                       => 'integer',
            'duration_days'               => 'integer',
            'is_active'                   => 'boolean',
            'discount_percentage'         => 'decimal:2',
            'free_shipping'               => 'boolean',
            'free_shipping_quota'         => 'integer',
            'free_shipping_validity_days' => 'integer',
            'created_at'                  => 'datetime',
            'updated_at'                  => 'datetime',
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

    public function membershipContracts(): HasMany
    {
        return $this->hasMany(MembershipContract::class, 'membership_plan_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false);
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

    public function scopeById(Builder $query, int $id): Builder
    {
        return $query->where('id', $id);
    }

    public function scopeStatus(Builder $query, bool $isActive): Builder
    {
        return $isActive ? $query->active() : $query->inactive();
    }

    public function scopeMinPrice(Builder $query, float $minPrice): Builder
    {
        return $query->where('price', '>=', $minPrice);
    }

    public function scopeMaxPrice(Builder $query, float $maxPrice): Builder
    {
        return $query->where('price', '<=', $maxPrice);
    }

    public function scopeMinDurationDays(Builder $query, int $minDays): Builder
    {
        return $query->where('duration_days', '>=', $minDays);
    }

    public function scopeMaxDurationDays(Builder $query, int $maxDays): Builder
    {
        return $query->where('duration_days', '<=', $maxDays);
    }

    public function scopeMinDiscountPercentage(Builder $query, float $minDiscount): Builder
    {
        return $query->where('discount_percentage', '>=', $minDiscount);
    }

    public function scopeMaxDiscountPercentage(Builder $query, float $maxDiscount): Builder
    {
        return $query->where('discount_percentage', '<=', $maxDiscount);
    }

    public function scopeLevel(Builder $query, int $level): Builder
    {
        return $query->where('level', $level);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function (Builder $q) use ($search) {
            $q->where('name', 'like', '%' . $search . '%')
                ->orWhere('description', 'like', '%' . $search . '%');
        });
    }

    public function scopeSortBy(Builder $query, string $field, string $direction = 'asc'): Builder
    {
        $allowedFields = ['name', 'price', 'durationDays', 'createdAt', 'updatedAt'];

        $fieldMap = [
            'durationDays' => 'duration_days',
            'createdAt'    => 'created_at',
            'updatedAt'    => 'updated_at',
        ];

        if (!in_array($field, $allowedFields)) {
            $field = 'createdAt';
        }

        $field = $fieldMap[$field] ?? $field;

        $query->orderBy($field, $direction);

        return $query;
    }
}
