<?php

use App\Models\Employee;
use App\Models\EmployeePosition;
use App\Models\Outlet;
use App\Models\Position;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('courier assignment across same owner outlets is allowed', function () {
  $owner = \App\Models\User::factory()->create();
  $primaryOutlet = Outlet::factory()->create(['owner_id' => $owner->id]);
  $secondaryOutlet = Outlet::factory()->create(['owner_id' => $owner->id]);

  $employee = Employee::factory()->create(['outlet_id' => $primaryOutlet->id]);

  $courierPosition = Position::create([
    'outlet_id' => $secondaryOutlet->id,
    'name' => 'Kurir',
    'slug' => 'kurir',
    'is_active' => true,
  ]);

  $employee->assignPosition($courierPosition->id, true);

  $this->assertDatabaseHas('employee_positions', [
    'employee_id' => $employee->id,
    'position_id' => $courierPosition->id,
    'deleted_at' => null,
  ]);
});

test('courier assignment across different owners is rejected', function () {
  $primaryOutlet = Outlet::factory()->create();
  $foreignOutlet = Outlet::factory()->create();

  $employee = Employee::factory()->create(['outlet_id' => $primaryOutlet->id]);

  $courierPosition = Position::create([
    'outlet_id' => $foreignOutlet->id,
    'name' => 'Kurir',
    'slug' => 'kurir',
    'is_active' => true,
  ]);

  $action = fn() => $employee->assignPosition($courierPosition->id, true);

  expect($action)->toThrow(InvalidArgumentException::class);
});

test('non-kurir assignment across outlets is rejected', function () {
  $owner = \App\Models\User::factory()->create();
  $primaryOutlet = Outlet::factory()->create(['owner_id' => $owner->id]);
  $secondaryOutlet = Outlet::factory()->create(['owner_id' => $owner->id]);

  $employee = Employee::factory()->create(['outlet_id' => $primaryOutlet->id]);

  $cashierPosition = Position::create([
    'outlet_id' => $secondaryOutlet->id,
    'name' => 'Kasir',
    'slug' => 'kasir',
    'is_active' => true,
  ]);

  $action = fn() => $employee->assignPosition($cashierPosition->id, true);

  expect($action)->toThrow(InvalidArgumentException::class);
});

test('accessible outlets only include active positions', function () {
  $owner = \App\Models\User::factory()->create();
  $primaryOutlet = Outlet::factory()->create(['owner_id' => $owner->id]);
  $secondaryOutlet = Outlet::factory()->create(['owner_id' => $owner->id]);

  $employee = Employee::factory()->create(['outlet_id' => $primaryOutlet->id]);

  $courierPosition = Position::create([
    'outlet_id' => $secondaryOutlet->id,
    'name' => 'Kurir',
    'slug' => 'kurir',
    'is_active' => true,
  ]);

  EmployeePosition::create([
    'employee_id' => $employee->id,
    'position_id' => $courierPosition->id,
    'is_active' => true,
  ]);

  $accessibleOutletIds = $employee->getAccessibleOutletIds();

  expect($accessibleOutletIds)->toEqual([$secondaryOutlet->id]);
});
