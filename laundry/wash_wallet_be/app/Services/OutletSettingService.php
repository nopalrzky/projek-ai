<?php

namespace App\Services;

use App\Models\OutletSetting;
use App\Models\Setting;
use Illuminate\Support\Collection;

class OutletSettingService extends BaseService
{
    /**
     * Get all settings for an outlet
     */
    public function getAll(int $outletId): Collection
    {
        return OutletSetting::byOutletId($outletId)->get();
    }

    /**
     * Get a specific setting value
     */
    public function getValue(int $outletId, string $key, ?string $default = null): ?string
    {
        return OutletSetting::getValueByKey($outletId, $key, $default);
    }

    /**
     * Set a setting value
     */
    public function setValue(int $outletId, string $key, string $value): OutletSetting
    {
        $setting = Setting::firstOrCreate(
            ['key' => $key],
            [
                'name' => str($key)->replace('_', ' ')->title()->toString(),
                'description' => null,
            ]
        );

        return OutletSetting::updateOrCreate(
            ['outlet_id' => $outletId, 'setting_id' => $setting->id],
            ['value' => $value]
        );
    }

    /**
     * Check if auto WA notification is enabled
     */
    public function isAutoWaNotificationEnabled(int $outletId): bool
    {
        return $this->getValue($outletId, 'auto_wa_notification', 'false') === 'true';
    }

    /**
     * Check if COD payment is enabled
     */
    public function isCodEnabled(int $outletId): bool
    {
        return $this->getValue($outletId, 'cod_enabled', 'false') === 'true';
    }

    /**
     * Check if auto accept order is enabled
     */
    public function isAutoAcceptOrderEnabled(int $outletId): bool
    {
        return $this->getValue($outletId, 'auto_accept_order', 'false') === 'true';
    }

    /**
     * Get auto accept lead time in minutes
     */
    public function getAutoAcceptLeadTimeMinutes(int $outletId): int
    {
        return (int) $this->getValue($outletId, 'auto_accept_lead_time_minutes', '0');
    }

    /**
     * Check if outlet has auto accept lead time configured
     */
    public function hasAutoAcceptLeadTime(int $outletId): bool
    {
        return $this->getAutoAcceptLeadTimeMinutes($outletId) > 0;
    }

    /**
     * Get auto accept max distance in km
     */
    public function getAutoAcceptMaxDistanceKm(int $outletId): float
    {
        return (float) $this->getValue($outletId, 'auto_accept_max_distance_km', '0');
    }

    /**
     * Check if outlet has auto accept max distance configured
     */
    public function hasAutoAcceptMaxDistance(int $outletId): bool
    {
        return $this->getAutoAcceptMaxDistanceKm($outletId) > 0;
    }
}
