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
use Illuminate\Support\Str;

#[Table('categories')]
class Category extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'outlet_id',
        'name',
        'description',
        'slug',
        'is_active',
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
            'outlet_id'  => 'integer',
            'is_active'  => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Lifecycle Hooks
    |--------------------------------------------------------------------------
    */

    protected static function booted(): void
    {
        static::creating(function ($category) {
            if (empty($category->slug)) {
                $outletId = $category->outlet_id;
                if ($outletId) {
                    $category->slug = static::generateUniqueSlug($category->name, $outletId);
                }
            }
        });

        static::updating(function ($category) {
            if ($category->isDirty('name') && empty($category->getOriginal('slug'))) {
                $outletId = $category->outlet_id;
                if ($outletId) {
                    $category->slug = static::generateUniqueSlug($category->name, $outletId, $category->id);
                }
            }
        });
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

    public function laundryServices(): HasMany
    {
        return $this->hasMany(LaundryService::class);
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

    public function scopeById(Builder $query, int $id): Builder
    {
        return $query->where('id', $id);
    }

    public function scopeByIds(Builder $query, array $ids): Builder
    {
        return $query->whereIn('id', $ids);
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

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhere('slug', 'like', "%{$search}%");
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'createdAt', string $direction = 'desc'): Builder
    {
        $allowedColumns = [
            'name',
            'slug',
            'description',
            'isActive',
            'createdAt',
            'updatedAt',
            'laundryServicesCount',
        ];

        $columnMap = [
            'isActive'            => 'is_active',
            'createdAt'           => 'created_at',
            'updatedAt'           => 'updated_at',
            'laundryServicesCount' => 'laundry_services_count',
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
    | Static Helpers
    |--------------------------------------------------------------------------
    */

    public static function generateUniqueSlug(string $name, int $outletId, ?int $excludeId = null): string
    {
        $baseSlug = Str::slug($name);
        $slug     = $baseSlug;
        $counter  = 1;

        while (static::slugExists($slug, $outletId, $excludeId)) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    public static function slugExists(string $slug, int $outletId, ?int $excludeId = null): bool
    {
        $query = static::where('slug', $slug)->where('outlet_id', $outletId);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }
}
