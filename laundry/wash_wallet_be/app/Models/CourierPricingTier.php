<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

#[Table('courier_pricing_tiers')]
class CourierPricingTier extends Model
{
    use HasFactory;

    /*
    |--------------------------------------------------------------------------
    | TABLE & CONFIGURATION
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'courier_setting_id',
        'min_km',
        'max_km',
        'fee',
        'per_km_fee',
        'sort_order',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'min_km'     => 'decimal:2',
            'max_km'     => 'decimal:2',
            'fee'        => 'decimal:2',
            'per_km_fee' => 'decimal:2',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    public function courierSetting(): BelongsTo
    {
        return $this->belongsTo(CourierSetting::class);
    }

    /*
    |--------------------------------------------------------------------------
    | QUERY SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeById(Builder $query, int $id): Builder
    {
        return $query->where('id', $id);
    }

    public function scopeByCourierSettingId(Builder $query, int $settingId): Builder
    {
        return $query->where('courier_setting_id', $settingId);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('min_km');
    }

    public function scopeSortBy(Builder $query, string $column = 'sort_order', string $direction = 'asc'): Builder
    {
        $allowedColumns = ['min_km', 'max_km', 'fee', 'sort_order'];

        if (!in_array($column, $allowedColumns)) {
            $column = 'sort_order';
        }

        return $query->orderBy($column, strtolower($direction) === 'desc' ? 'desc' : 'asc');
    }
}
