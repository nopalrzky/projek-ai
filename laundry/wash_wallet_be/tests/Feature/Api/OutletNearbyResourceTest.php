<?php

namespace Tests\Feature\Api;

use App\Models\CustomerAccount;
use App\Models\Outlet;
use App\Models\OperationalDay;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class OutletNearbyResourceTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsCustomer(): static
    {
        $account = CustomerAccount::factory()->create();
        Sanctum::actingAs($account, [], 'customer_sanctum');
        return $this;
    }

    public function test_nearby_response_never_contains_today_schedule_as_bare_array(): void
    {
        $outlet = Outlet::factory()->create([
            'latitude'  => -6.200,
            'longitude' => 106.816,
            'status'    => 'active',
        ]);

        // Buat semua hari tutup untuk memastikan todayHours kosong
        foreach (['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as $day) {
            OperationalDay::factory()->create([
                'outlet_id'    => $outlet->id,
                'day_of_week'  => $day,
                'is_open'      => false,
            ]);
        }

        $response = $this->actingAsCustomer()
            ->getJson('/api/mobile/customer/outlets/nearby?latitude=-6.200&longitude=106.816&radius=50');

        $response->assertStatus(200);

        $outlets = $response->json('data');
        foreach ($outlets as $outletData) {
            $todaySchedule = $outletData['todaySchedule'] ?? null;
            $this->assertFalse(
                is_array($todaySchedule),
                "todaySchedule must not be a bare array, got: " . json_encode($todaySchedule)
            );
        }
    }

    public function test_nearby_meta_uses_camel_case_corrected_query(): void
    {
        $response = $this->actingAsCustomer()
            ->getJson('/api/mobile/customer/outlets/nearby?latitude=-6.200&longitude=106.816&search=londri');

        $response->assertStatus(200);

        $meta = $response->json('meta');
        if ($meta !== null) {
            $this->assertArrayNotHasKey('corrected_query', $meta,
                'meta should use camelCase correctedQuery, not corrected_query');
        }
    }
}
