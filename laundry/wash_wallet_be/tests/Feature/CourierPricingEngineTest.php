<?php

namespace Tests\Feature;

use App\Models\CourierPricingTier;
use App\Models\CourierPricingZone;
use App\Models\CourierSetting;
use App\Models\CustomerAddress;
use App\Models\Outlet;
use App\Services\CourierPricingEngine;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourierPricingEngineTest extends TestCase
{
    use RefreshDatabase;

    private CourierPricingEngine $engine;
    private Outlet $outlet;

    protected function setUp(): void
    {
        parent::setUp();
        $this->engine = app(CourierPricingEngine::class);
        $this->outlet = Outlet::factory()->create();
    }

    public function test_flat_fee_calculation()
    {
        $setting = CourierSetting::factory()->create([
            'outlet_id' => $this->outlet->id,
            'pricing_method' => 'flat_rate',
            'flat_fee' => 15000,
        ]);

        $result = $this->engine->calculate($setting, 5.5);

        $this->assertEquals(15000, $result->finalFee);
        $this->assertEquals(5.5, $result->distanceKm);
        $this->assertEquals('flat_rate', $result->calculationSource);
    }

    public function test_tiered_fee_calculation()
    {
        $setting = CourierSetting::factory()->create([
            'outlet_id' => $this->outlet->id,
            'pricing_method' => 'tiered',
            'default_price' => 14000,
        ]);

        CourierPricingTier::create([
            'courier_setting_id' => $setting->id,
            'min_km' => 0,
            'max_km' => 2,
            'fee' => 5000,
        ]);

        CourierPricingTier::create([
            'courier_setting_id' => $setting->id,
            'min_km' => 2,
            'max_km' => 5,
            'fee' => 10000,
        ]);

        $result1 = $this->engine->calculate($setting, 1.5);
        $this->assertEquals(5000, $result1->finalFee);
        $this->assertEquals('tier', $result1->calculationSource);

        $result2 = $this->engine->calculate($setting, 3.5);
        $this->assertEquals(10000, $result2->finalFee);
        $this->assertEquals('tier', $result2->calculationSource);
    }

    public function test_tiered_uses_default_price_when_distance_does_not_match_any_tier()
    {
        $setting = CourierSetting::factory()->create([
            'outlet_id' => $this->outlet->id,
            'pricing_method' => 'tiered',
            'default_price' => 14000,
        ]);

        CourierPricingTier::create([
            'courier_setting_id' => $setting->id,
            'min_km' => 0,
            'max_km' => 3,
            'fee' => 7000,
        ]);

        $result = $this->engine->calculate($setting, 7);

        $this->assertEquals(14000, $result->baseFee);
        $this->assertEquals(14000, $result->finalFee);
        $this->assertEquals('default_price', $result->calculationSource);
    }

    public function test_zone_based_uses_zone_fee_when_address_matches()
    {
        $setting = CourierSetting::factory()->create([
            'outlet_id' => $this->outlet->id,
            'pricing_method' => 'zone_based',
            'default_price' => 12000,
        ]);

        CourierPricingZone::create([
            'courier_setting_id' => $setting->id,
            'location_type' => 'district',
            'location_id' => '1101010',
            'location_name' => 'BAKONGAN',
            'fee' => 9000,
            'sort_order' => 0,
        ]);

        $address = CustomerAddress::factory()->create([
            'district_id' => '1101010',
        ]);

        $result = $this->engine->calculate($setting, 4, null, null, $address);

        $this->assertEquals(9000, $result->baseFee);
        $this->assertEquals(9000, $result->finalFee);
        $this->assertEquals('zone', $result->calculationSource);
    }

    public function test_zone_based_uses_default_price_when_address_does_not_match_any_zone()
    {
        $setting = CourierSetting::factory()->create([
            'outlet_id' => $this->outlet->id,
            'pricing_method' => 'zone_based',
            'default_price' => 12500,
        ]);

        CourierPricingZone::create([
            'courier_setting_id' => $setting->id,
            'location_type' => 'district',
            'location_id' => '9999999',
            'location_name' => 'OTHER',
            'fee' => 9000,
            'sort_order' => 0,
        ]);

        $address = CustomerAddress::factory()->create([
            'district_id' => '1101010',
            'village_id' => '1101010001',
        ]);

        $result = $this->engine->calculate($setting, 4, null, null, $address);

        $this->assertEquals(12500, $result->baseFee);
        $this->assertEquals(12500, $result->finalFee);
        $this->assertEquals('default_price', $result->calculationSource);
    }

    public function test_default_price_still_applies_modifiers()
    {
        $setting = CourierSetting::factory()->create([
            'outlet_id' => $this->outlet->id,
            'pricing_method' => 'tiered',
            'default_price' => 12000,
            'surge_enabled' => true,
            'surge_multiplier' => 1.5,
        ]);

        $result = $this->engine->calculate($setting, 10);

        $this->assertEquals(12000, $result->baseFee);
        $this->assertEquals(18000, $result->finalFee);
        $this->assertEquals('default_price', $result->calculationSource);
    }

    public function test_surge_pricing_modifier()
    {
        $setting = CourierSetting::factory()->create([
            'outlet_id' => $this->outlet->id,
            'pricing_method' => 'flat_rate',
            'flat_fee' => 10000,
            'surge_enabled' => true,
            'surge_multiplier' => 1.5,
        ]);

        $result = $this->engine->calculate($setting, 2);

        $this->assertEquals(15000, $result->finalFee);
    }

    public function test_merchant_subsidy_modifier()
    {
        $setting = CourierSetting::factory()->create([
            'outlet_id' => $this->outlet->id,
            'pricing_method' => 'flat_rate',
            'flat_fee' => 10000,
            'merchant_subsidy' => 2000,
            'merchant_subsidy_type' => 'fixed_amount',
        ]);

        $result = $this->engine->calculate($setting, 2);

        $this->assertEquals(10000, $result->finalFee);
        $this->assertEquals(8000, $result->customerPays);
        $this->assertEquals(2000, $result->merchantSubsidy);
    }

    public function test_unconditional_free_shipping_returns_zero_fee_with_expected_source()
    {
        $setting = CourierSetting::factory()->create([
            'outlet_id' => $this->outlet->id,
            'pricing_method' => 'flat_rate',
            'flat_fee' => 15000,
            'unconditional_free_shipping_enabled' => true,
        ]);

        $result = $this->engine->calculate($setting, 3, 10000);

        $this->assertEquals(0, $result->finalFee);
        $this->assertEquals(0, $result->customerPays);
        $this->assertEquals('unconditional_free_shipping', $result->discountSource);
        $this->assertEquals('unconditional_free_shipping', $result->calculationSource);
    }

    public function test_unconditional_free_shipping_takes_priority_over_minimum_order_free_shipping()
    {
        $setting = CourierSetting::factory()->create([
            'outlet_id' => $this->outlet->id,
            'pricing_method' => 'flat_rate',
            'flat_fee' => 15000,
            'free_shipping_enabled' => true,
            'min_order_free_shipping' => 50000,
            'unconditional_free_shipping_enabled' => true,
        ]);

        $result = $this->engine->calculate($setting, 3, 60000);

        $this->assertEquals(0, $result->customerPays);
        $this->assertEquals('unconditional_free_shipping', $result->discountSource);
    }

    public function test_default_price_does_not_make_order_serviceable_when_max_distance_is_exceeded()
    {
        $setting = CourierSetting::factory()->create([
            'outlet_id' => $this->outlet->id,
            'pricing_method' => 'tiered',
            'default_price' => 12000,
            'max_distance_km' => 5,
        ]);

        $result = $this->engine->calculate($setting, 8);

        $this->assertFalse($result->isServiceable);
        $this->assertSame('Distance exceeds maximum service radius of 5.00 km', $result->rejectionReason);
    }
}
