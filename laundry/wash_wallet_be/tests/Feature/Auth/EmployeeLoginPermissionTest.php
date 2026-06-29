<?php

use App\Models\Employee;
use App\Models\EmployeePosition;
use App\Models\Outlet;
use App\Models\Position;
use App\Models\PositionPermission;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createPositionWithPermissions(Outlet $outlet, string $slug, array $permissions): Position
{
  $position = Position::create([
    'outlet_id' => $outlet->id,
    'name' => ucfirst($slug),
    'slug' => $slug,
    'is_active' => true,
  ]);

  foreach ($permissions as $permission) {
    PositionPermission::create([
      'position_id' => $position->id,
      'permission_key' => $permission,
    ]);
  }

  return $position;
}

test('employee login returns permission payload', function () {
  $employee = Employee::factory()->create();
  $position = createPositionWithPermissions($employee->outlet, 'kasir', [
    'order.create',
    'order.view',
  ]);

  EmployeePosition::create([
    'employee_id' => $employee->id,
    'position_id' => $position->id,
    'is_active' => true,
  ]);

  $response = $this->postJson('/api/mobile/production/auth/login', [
    'username' => $employee->username,
    'password' => 'password',
    'deviceName' => 'test-device',
  ]);

  $response->assertStatus(200);

  $permissions = $response->json('data.employee.allPermissions');
  expect($permissions)->toContain('order.create');
  expect($permissions)->toContain('order.view');
});

test('employee login returns accessible outlets for multi-outlet courier', function () {
  $owner = \App\Models\User::factory()->create();
  $primaryOutlet = Outlet::factory()->create(['owner_id' => $owner->id]);
  $secondaryOutlet = Outlet::factory()->create(['owner_id' => $owner->id]);

  $employee = Employee::factory()->create(['outlet_id' => $primaryOutlet->id]);

  $primaryPosition = createPositionWithPermissions($primaryOutlet, 'kurir', ['courier.view']);
  $secondaryPosition = createPositionWithPermissions($secondaryOutlet, 'kurir', ['courier.view']);

  EmployeePosition::create([
    'employee_id' => $employee->id,
    'position_id' => $primaryPosition->id,
    'is_active' => true,
  ]);

  EmployeePosition::create([
    'employee_id' => $employee->id,
    'position_id' => $secondaryPosition->id,
    'is_active' => true,
  ]);

  $response = $this->postJson('/api/mobile/production/auth/login', [
    'username' => $employee->username,
    'password' => 'password',
    'deviceName' => 'test-device',
  ]);

  $response->assertStatus(200);

  $accessibleOutlets = $response->json('data.employee.accessibleOutlets');
  expect($accessibleOutlets)->toHaveCount(2);
});

test('me endpoint returns permissions payload', function () {
  /** @var Employee $employee */
  $employee = Employee::factory()->createOne();
  $position = createPositionWithPermissions($employee->outlet, 'kasir', ['order.view']);

  EmployeePosition::create([
    'employee_id' => $employee->id,
    'position_id' => $position->id,
    'is_active' => true,
  ]);

  $this->actingAs($employee, 'sanctum');

  $response = $this->getJson('/api/mobile/production/auth/me');

  $response->assertStatus(200);

  $permissions = $response->json('data.allPermissions');
  expect($permissions)->toContain('order.view');
});
