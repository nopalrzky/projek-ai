<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Support\Str;

#[Table('laundry_services')]
class LaundryService extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'unit_id',
        'name',
        'description',
        'duration_hours',
        'min_quantity',
        'price',
        'slug',
        'is_active',
        'supports_courier',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active'      => 'boolean',
            'supports_courier' => 'boolean',
            'duration_hours' => 'integer',
            'min_quantity'   => 'integer',
            'price'          => 'decimal:2',
            'created_at'     => 'datetime',
            'updated_at'     => 'datetime',
            'deleted_at'     => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Lifecycle Hooks
    |--------------------------------------------------------------------------
    */

    protected static function booted(): void
    {
        static::creating(function ($laundryService) {
            if (empty($laundryService->slug)) {
                $name = $laundryService->name ?? '';
                $categoryId = $laundryService->category_id ?? 0;

                $laundryService->slug = !empty($name)
                    ? static::generateUniqueSlug($name, $categoryId)
                    : 'service-' . time();
            }
        });

        static::updating(function ($laundryService) {
            if ($laundryService->isDirty('name')) {
                if (empty($laundryService->slug) || $laundryService->isDirty('slug')) {
                    $laundryService->slug = static::generateUniqueSlug(
                        $laundryService->name,
                        $laundryService->category_id ?? 0,
                        $laundryService->id
                    );
                }
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function servicePackageItems(): HasMany
    {
        return $this->hasMany(ServicePackageItem::class);
    }

    public function outlet(): HasOneThrough
    {
        return $this->hasOneThrough(Outlet::class, Category::class, 'id', 'id', 'category_id', 'outlet_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'laundry_service_id', 'id');
    }

    public function laundryServiceProcesses(): HasMany
    {
        return $this->hasMany(LaundryServiceProcess::class, 'laundry_service_id', 'id');
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

    public function scopeSupportsCourier(Builder $query): Builder
    {
        return $query->where('supports_courier', true);
    }

    public function scopeNotSupportsCourier(Builder $query): Builder
    {
        return $query->where('supports_courier', false);
    }

    public function scopeById(Builder $query, int $id): Builder
    {
        return $query->where('id', $id);
    }

    public function scopeByIds(Builder $query, array $ids): Builder
    {
        return $query->whereIn('id', $ids);
    }

    public function scopeByCategoryId(Builder $query, int $categoryId): Builder
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeByCategoryIds(Builder $query, array $categoryIds): Builder
    {
        return $query->whereIn('category_id', $categoryIds);
    }

    public function scopeByUnitId(Builder $query, int $unitId): Builder
    {
        return $query->where('unit_id', $unitId);
    }

    public function scopeByUnitIds(Builder $query, array $unitIds): Builder
    {
        return $query->whereIn('unit_id', $unitIds);
    }

    public function scopeByOutletId(Builder $query, int $outletId): Builder
    {
        return $query->whereHas('category', function (Builder $q) use ($outletId) {
            $q->where('outlet_id', $outletId);
        });
    }

    public function scopeByOwnerId(Builder $query, int $ownerId): Builder
    {
        return $query->whereHas('category.outlet', function (Builder $q) use ($ownerId) {
            $q->where('owner_id', $ownerId);
        });
    }

    public function scopeMinDurationHour(Builder $query, int $hours): Builder
    {
        return $query->where('duration_hours', '>=', $hours);
    }

    public function scopeMaxDurationHour(Builder $query, int $hours): Builder
    {
        return $query->where('duration_hours', '<=', $hours);
    }

    public function scopeMinQuantity(Builder $query, int $quantity): Builder
    {
        return $query->where('min_quantity', '>=', $quantity);
    }

    public function scopeMaxQuantity(Builder $query, int $quantity): Builder
    {
        return $query->where('min_quantity', '<=', $quantity);
    }

    public function scopeMinPrice(Builder $query, float $price): Builder
    {
        return $query->where('price', '>=', $price);
    }

    public function scopeMaxPrice(Builder $query, float $price): Builder
    {
        return $query->where('price', '<=', $price);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhere('slug', 'like', "%{$search}%")
                ->orWhereHas('category', function ($categoryQuery) use ($search) {
                    $categoryQuery->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('unit', function ($unitQuery) use ($search) {
                    $unitQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('symbol', 'like', "%{$search}%");
                });
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'createdAt', string $direction = 'desc'): Builder
    {
        $allowedColumns = [
            'name',
            'description',
            'slug',
            'isActive',
            'supportsCourier',
            'createdAt',
            'updatedAt',
        ];

        $columnMap = [
            'isActive'  => 'is_active',
            'supportsCourier' => 'supports_courier',
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

    public function canBeDeleted(): bool
    {
        return $this->orderItems()->count() === 0;
    }

    protected function averageRating(): Attribute
    {
        return Attribute::make(
            get: function () {
                $ratings = \App\Models\OrderReview::whereHas('order.orderItems', function ($q) {
                    $q->where('laundry_service_id', $this->id);
                })->where('is_published', true)->pluck('rating');

                return (float) round($ratings->avg() ?? 0, 1);
            }
        );
    }

    protected function totalReviews(): Attribute
    {
        return Attribute::make(
            get: function () {
                return \App\Models\OrderReview::whereHas('order.orderItems', function ($q) {
                    $q->where('laundry_service_id', $this->id);
                })->where('is_published', true)->count();
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Static Helpers
    |--------------------------------------------------------------------------
    */

    public static function generateUniqueSlug(string $name, int $categoryId, ?int $excludeId = null): string
    {
        $baseSlug = Str::slug($name);
        if (empty($baseSlug)) {
            $baseSlug = 'service-' . time();
        }

        $slug    = $baseSlug;
        $counter = 1;

        while (static::slugExists($slug, $categoryId, $excludeId)) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    public static function slugExists(string $slug, int $categoryId = 0, ?int $excludeId = null): bool
    {
        $query = static::where('slug', $slug);

        if ($categoryId > 0) {
            $query->where('category_id', $categoryId);
        }

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }
}
