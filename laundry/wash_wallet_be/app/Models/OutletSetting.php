<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

#[Table('outlet_settings')]
class OutletSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'outlet_id',
        'setting_id',
        'value',
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
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Relationship to Outlet
     */
    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    /**
     * Relationship to Setting
     */
    public function setting(): BelongsTo
    {
        return $this->belongsTo(Setting::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope by Outlet ID
     */
    public function scopeByOutletId(Builder $query, int $outletId): Builder
    {
        return $query->where('outlet_id', $outletId);
    }

    /**
     * Scope by Setting ID
     */
    public function scopeBySettingId(Builder $query, int $settingId): Builder
    {
        return $query->where('setting_id', $settingId);
    }

    /*
    |--------------------------------------------------------------------------
    | Static Helpers
    |--------------------------------------------------------------------------
    */

    /**
     * Get value for outlet and setting
     */
    public static function getValueFor(int $outletId, int $settingId, ?string $default = null): ?string
    {
        $setting = self::byOutletId($outletId)->bySettingId($settingId)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Get value for outlet by setting key
     */
    public static function getValueByKey(int $outletId, string $settingKey, ?string $default = null): ?string
    {
        $setting = Setting::where('key', $settingKey)->first();
        if (!$setting) {
            return $default;
        }
        return self::getValueFor($outletId, $setting->id, $default);
    }
}
