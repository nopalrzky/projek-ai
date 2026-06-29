<?php

use App\Models\Employee;
use App\Models\EmployeePosition;
use App\Models\Outlet;
use App\Models\Position;
use App\Models\PositionPermission;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createProductionStaffWithPermission(Outlet $outlet, Employee $employee, string $permission): void
{
  $position = Position::create([
    'outlet_id' => $outlet->id,
    'name' => 'Produksi',
    'slug' => 'produksi',
    'is_active' => true,
  ]);

  PositionPermission::create([
    'position_id' => $position->id,
    'permission_key' => $permission,
  ]);

  EmployeePosition::create([
    'employee_id' => $employee->id,
    'position_id' => $position->id,
    'is_active' => true,
  ]);
}

test('production orders index filters and sorts correctly for courier pickup date', function () {
    /** @var Employee $employee */
    $employee = Employee::factory()->createOne();
    createProductionStaffWithPermission($employee->outlet, $employee, 'production.view');

    $order1 = Order::factory()->createOne([
        'outlet_id' => $employee->outlet_id,
        'status' => 'accepted',
        'source' => 'customer_app',
        'delivery_type' => 'delivery',
        'pickup_schedule' => '2026-06-11 08:00:00',
    ]);

    $order2 = Order::factory()->createOne([
        'outlet_id' => $employee->outlet_id,
        'status' => 'accepted',
        'source' => 'customer_app',
        'delivery_type' => 'pickup',
        'pickup_schedule' => '2026-06-11 09:00:00',
    ]);

    $order3 = Order::factory()->createOne([
        'outlet_id' => $employee->outlet_id,
        'status' => 'accepted',
        'source' => 'customer_app',
        'delivery_type' => 'delivery',
        'pickup_schedule' => null,
    ]);

    $order4 = Order::factory()->createOne([
        'outlet_id' => $employee->outlet_id,
        'status' => 'accepted',
        'source' => 'customer_app',
        'delivery_type' => 'delivery',
        'pickup_schedule' => '2026-06-12 08:00:00',
    ]);

    $this->actingAs($employee, 'sanctum');

    $response = $this->getJson('/api/mobile/production/orders?' . http_build_query([
        'status' => 'accepted',
        'forCourierPickupDate' => '2026-06-11',
        'sortBy' => 'pickupSchedule',
        'sortDirection' => 'asc',
    ]));

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
        ]);

    $data = $response->json('data');
    
    expect($data)->toHaveCount(2);

    $ids = collect($data)->pluck('id')->toArray();
    expect($ids)->toContain($order1->id);
    expect($ids)->toContain($order2->id);
    expect($ids)->not->toContain($order3->id);
    expect($ids)->not->toContain($order4->id);

    expect($data[0]['id'])->toBe($order1->id);
    expect($data[1]['id'])->toBe($order2->id);

    $responseDesc = $this->getJson('/api/mobile/production/orders?' . http_build_query([
        'status' => 'accepted',
        'forCourierPickupDate' => '2026-06-11',
        'sortBy' => 'pickupSchedule',
        'sortDirection' => 'desc',
    ]));

    $responseDesc->assertStatus(200);
    $dataDesc = $responseDesc->json('data');

    expect($dataDesc[0]['id'])->toBe($order2->id);
    expect($dataDesc[1]['id'])->toBe($order1->id);
});
