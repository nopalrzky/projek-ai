<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('features')]
class Feature extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'name',
        'description',
        'coin_price',
        'is_paid',
        'is_active',
        'sort_order',
        'duration_days',
        'trial_duration_days',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'coin_price' => 'integer',
            'is_paid'    => 'boolean',
            'is_active'  => 'boolean',
            'sort_order' => 'integer',
            'duration_days' => 'integer',
            'trial_duration_days' => 'integer',
        ];
    }

    /**
     * Relationships
     */
    public function outletFeatures(): HasMany
    {
        return $this->hasMany(OutletFeature::class);
    }

    /**
     * Scopes
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    public function scopePaid(Builder $query): Builder
    {
        return $query->where('is_paid', true);
    }

    public function scopeFree(Builder $query): Builder
    {
        return $query->where('is_paid', false);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function (Builder $subQuery) use ($search) {
            $subQuery->where('name', 'like', "%{$search}%")
                ->orWhere('key', 'like', "%{$search}%");
        });
    }

    public function scopeById(Builder $query, int $id): Builder
    {
        return $query->where('id', $id);
    }

    public function scopeByKey(Builder $query, string $key): Builder
    {
        return $query->where('key', $key);
    }

    public function scopeNotKey(Builder $query, string $key): Builder
    {
        return $query->where('key', '!=', $key);
    }

    public function scopeSortByOrder(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Helpers
     */
    public function isFree(): bool
    {
        return !$this->is_paid || $this->coin_price <= 0;
    }
}
