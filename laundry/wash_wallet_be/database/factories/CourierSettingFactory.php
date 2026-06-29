<?php

namespace Database\Factories;

use App\Models\CourierSetting;
use App\Models\Outlet;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourierSettingFactory extends Factory
{
    protected $model = CourierSetting::class;

    public function definition(): array
    {
        return [
            'outlet_id' => Outlet::factory(),
            'pricing_method' => 'flat_rate',
            'pickup_fee' => 5000,
            'delivery_fee' => 5000,
            'flat_fee' => 10000,

            'base_fee' => 5000,
            'per_km_fee' => 2000,
            'default_price' => 12000,
            'min_fee' => 0,
            'surge_enabled' => false,
            'surge_multiplier' => 1.0,
            'night_surcharge' => 0,
            'weekend_surcharge' => 0,
            'merchant_subsidy' => 0,
            'merchant_subsidy_type' => 'fixed_amount',
            'free_shipping_enabled' => false,
            'unconditional_free_shipping_enabled' => false,
        ];
    }
}
