<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

#[Table('courier_pricing_zones')]
class CourierPricingZone extends Model
{
    use HasFactory;

    /*
    |--------------------------------------------------------------------------
    | TABLE & CONFIGURATION
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'courier_setting_id',
        'location_type',
        'location_id',
        'location_name',
        'parent_district_id',
        'fee',
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
            'fee'         => 'decimal:2',
            'created_at'  => 'datetime',
            'updated_at'  => 'datetime',
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

    public function scopeByLocationType(Builder $query, string $type): Builder
    {
        return $query->where('location_type', $type);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order');
    }

    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

    /**
     * Check if a CustomerAddress matches this zone based on regency/district IDs.
     */
    public function matchesAddress(CustomerAddress $address): bool
    {
        if ($this->location_type === 'village') {
            return (string) $address->village_id === (string) $this->location_id;
        }

        if ($this->location_type === 'district') {
            return (string) $address->district_id === (string) $this->location_id;
        }

        if ($this->location_type === 'regency') {
            return (string) $address->regency_id === (string) $this->location_id;
        }

        return false;
    }
}
