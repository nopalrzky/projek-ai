<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Carbon;

#[Table('courier_settings')]
class CourierSetting extends Model
{
    use HasFactory;

    /*
    |--------------------------------------------------------------------------
    | TABLE & CONFIGURATION
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'outlet_id',
        'is_courier_enabled',
        'pricing_method',
        'flat_fee',
        'base_fee',
        'per_km_fee',
        'default_price',
        'free_radius_km',
        'min_fee',
        'max_fee',
        'max_distance_km',
        'surge_enabled',
        'surge_multiplier',
        'night_surcharge',
        'night_start_time',
        'night_end_time',
        'weekend_surcharge',
        'merchant_subsidy',
        'merchant_subsidy_type',
        'free_shipping_enabled',
        'min_order_free_shipping',
        'unconditional_free_shipping_enabled',
        'pickup_fee',
        'delivery_fee',
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
            'outlet_id'                => 'integer',
            'flat_fee'                => 'decimal:2',
            'base_fee'                => 'decimal:2',
            'per_km_fee'              => 'decimal:2',
            'default_price'           => 'decimal:2',
            'free_radius_km'          => 'decimal:2',
            'min_fee'                 => 'decimal:2',
            'max_fee'                 => 'decimal:2',
            'max_distance_km'         => 'decimal:2',
            'surge_enabled'           => 'boolean',
            'is_courier_enabled'      => 'boolean',
            'surge_multiplier'        => 'decimal:2',
            'night_surcharge'         => 'decimal:2',
            'weekend_surcharge'       => 'decimal:2',
            'merchant_subsidy'        => 'decimal:2',
            'free_shipping_enabled'   => 'boolean',
            'min_order_free_shipping' => 'decimal:2',
            'unconditional_free_shipping_enabled' => 'boolean',
            'pickup_fee'              => 'decimal:2',
            'delivery_fee'            => 'decimal:2',
            'created_at'              => 'datetime',
            'updated_at'              => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function pricingTiers(): HasMany
    {
        return $this->hasMany(CourierPricingTier::class, 'courier_setting_id')->orderBy('sort_order');
    }

    public function pricingZones(): HasMany
    {
        return $this->hasMany(CourierPricingZone::class, 'courier_setting_id')->orderBy('sort_order');
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

    public function scopeByIds(Builder $query, array $ids): Builder
    {
        return $query->whereIn('id', $ids);
    }

    public function scopeByOutletId(Builder $query, int $outletId): Builder
    {
        return $query->where('outlet_id', $outletId);
    }

    public function scopeByPricingMethod(Builder $query, string $method): Builder
    {
        return $query->where('pricing_method', $method);
    }

    public function scopeSortBy(Builder $query, string $column = 'createdAt', string $direction = 'desc'): Builder
    {
        $allowedColumns = ['pricing_method', 'createdAt', 'updatedAt'];
        $columnMap = [
            'createdAt' => 'created_at',
            'updatedAt' => 'updated_at',
        ];

        if (!in_array($column, $allowedColumns)) {
            $column = 'createdAt';
        }

        $column = $columnMap[$column] ?? $column;
        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($column, $direction);
    }

    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

    /**
     * Check if a specific time falls within the night surcharge window.
     */
    public function isNightTime(?Carbon $time = null): bool
    {
        $time ??= now();
        $start = Carbon::createFromTimeString($this->night_start_time ?? '21:00');
        $end = Carbon::createFromTimeString($this->night_end_time ?? '06:00');

        if ($start->lessThan($end)) {
            return $time->between($start, $end);
        }

        // Overnights (e.g. 21:00 to 06:00)
        return $time->greaterThanOrEqualTo($start) || $time->lessThanOrEqualTo($end);
    }

    /**
     * Check if a specific time falls on a weekend.
     */
    public function isWeekend(?Carbon $time = null): bool
    {
        $time ??= now();
        return $time->isWeekend();
    }

    public function isCourierEnabled(): bool
    {
        return $this->is_courier_enabled;
    }

    public function freeShippingMode(): string
    {
        if ($this->unconditional_free_shipping_enabled) {
            return 'all';
        }

        if ($this->free_shipping_enabled) {
            return 'min_order';
        }

        return 'none';
    }

    public function requiresDefaultPriceFallback(): bool
    {
        return in_array($this->pricing_method, ['zone_based', 'tiered'], true);
    }
}
