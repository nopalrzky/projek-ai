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

#[Table('positions')]
class Position extends Model
{
    use HasFactory, SoftDeletes;
 
    protected $fillable = [
        'outlet_id',
        'name',
        'slug',
        'description',
        'is_default',
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
            'is_default' => 'boolean',
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

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function employeePositions(): HasMany
    {
        return $this->hasMany(EmployeePosition::class);
    }

    public function permissions(): HasMany
    {
        return $this->hasMany(PositionPermission::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Helper Methods
    |--------------------------------------------------------------------------
    */

    public function hasPermission(string $key): bool
    {
        return $this->permissions()->where('permission_key', $key)->exists();
    }

    public function getPermissionKeys(): array
    {
        return $this->permissions()->pluck('permission_key')->toArray();
    }

    public function isKurir(): bool
    {
        return $this->slug === 'kurir';
    }

    public function hasCourierPermission(): bool
    {
        return $this->permissions()
            ->whereIn('permission_key', [
                \App\Enums\Permission::CourierView->value,
                \App\Enums\Permission::CourierManage->value,
            ])
            ->exists();
    }

    public function hasEmployees(): bool
    {
        return $this->employeePositions()->exists();
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

    public function scopeDefault(Builder $query): Builder
    {
        return $query->where('is_default', true);
    }

    public function scopeBySlug(Builder $query, string $slug): Builder
    {
        return $query->where('slug', $slug);
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    public function scopeStatus(Builder $query, bool $isActive): Builder
    {
        return $isActive ? $query->active() : $query->inactive();
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
                ->orWhere('description', 'like', "%{$search}%");
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'created_at', string $direction = 'desc'): Builder
    {
        $allowedColumns = [
            'name',
            'description',
            'isActive',
            'createdAt',
            'updatedAt',
            'employeesCount',
        ];

        $columnMap = [
            'isActive'       => 'is_active',
            'createdAt'      => 'created_at',
            'updatedAt'      => 'updated_at',
            'employeesCount' => 'employees_count',
        ];

        if (!in_array($column, $allowedColumns)) {
            $column = 'created_at';
        }

        $column = $columnMap[$column] ?? $column;

        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($column, $direction);

        return $query;
    }
}
