<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('units')]
class Unit extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'symbol',
        'description',
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

    public function laundryServices(): HasMany
    {
        return $this->hasMany(LaundryService::class);
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

    public function scopeBySymbol(Builder $query, string $symbol): Builder
    {
        return $query->where('symbol', $symbol);
    }

    public function scopeByIds(Builder $query, array $ids): Builder
    {
        return $query->whereIn('id', $ids);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('symbol', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'created_at', string $direction = 'asc'): Builder
    {
        $allowedColumns = [
            'name',
            'symbol',
            'description',
            'is_active',
            'created_at',
            'updated_at',
            'laundry_services_count',
        ];

        if (!in_array($column, $allowedColumns)) {
            $column = 'created_at';
        }

        $direction = strtolower($direction) === 'desc' ? 'desc' : 'asc';

        if ($column === 'laundry_services_count') {
            $query->withCount('laundryServices')->orderBy('laundry_services_count', $direction);

            return $query;
        }

        $query->orderBy($column, $direction);

        return $query;
    }
}
