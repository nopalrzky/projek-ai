<?php

use App\Models\Employee;
use App\Models\EmployeePosition;
use App\Models\Outlet;
use App\Models\Position;
use App\Models\PositionPermission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createCourierWithPermission(Outlet $outlet, Employee $employee, string $permission): void
{
  $position = Position::create([
    'outlet_id' => $outlet->id,
    'name' => 'Kurir',
    'slug' => 'kurir',
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

test('aggregate courier route allows access if permission exists on any outlet', function () {
  /** @var User $owner */
  $owner = User::factory()->createOne();
  $primaryOutlet = Outlet::factory()->createOne(['owner_id' => $owner->id]);
  $secondaryOutlet = Outlet::factory()->createOne(['owner_id' => $owner->id]);

  /** @var Employee $employee */
  $employee = Employee::factory()->createOne(['outlet_id' => $primaryOutlet->id]);
  createCourierWithPermission($secondaryOutlet, $employee, 'courier.view');

  $this->actingAs($employee, 'sanctum');

  $response = $this->getJson('/api/mobile/production/courier/orders');

  $response->assertStatus(200);
});

test('aggregate courier route denies access without permission', function () {
  /** @var Employee $employee */
  $employee = Employee::factory()->createOne();

  $this->actingAs($employee, 'sanctum');

  $response = $this->getJson('/api/mobile/production/courier/orders');

  $response->assertStatus(403);
});

test('single outlet route requires permission on outlet context', function () {
  /** @var Employee $employee */
  $employee = Employee::factory()->createOne();
  createCourierWithPermission($employee->outlet, $employee, 'courier.view');

  $this->actingAs($employee, 'sanctum');

  $response = $this->getJson('/api/mobile/production/orders');

  $response->assertStatus(200);
});
