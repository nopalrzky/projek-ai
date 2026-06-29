<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Outlet;
use App\Models\Employee;
use App\Models\Position;
use App\Models\PositionPermission;
use App\Models\User;

uses(RefreshDatabase::class);

it('allows assignment of position with courier permission from owner\'s other outlet', function () {
    $owner = User::factory()->create();
    $primary = Outlet::factory()->create(['owner_id' => $owner->id]);
    $other = Outlet::factory()->create(['owner_id' => $owner->id]);

    $position = Position::create([
        'outlet_id' => $other->id,
        'name' => 'Cross Kurir',
        'slug' => 'kurir',
        'is_active' => true,
    ]);

    PositionPermission::create([
        'position_id' => $position->id,
        'permission_key' => \App\Enums\Permission::CourierView->value,
    ]);

    $employee = Employee::factory()->create(['outlet_id' => $primary->id]);

    // should not throw
    $employee->assignPosition($position->id);

    expect($employee->positions()->where('positions.id', $position->id)->exists())->toBeTrue();
});

it('rejects assignment of position without courier permission from owner\'s other outlet', function () {
    $owner = User::factory()->create();
    $primary = Outlet::factory()->create(['owner_id' => $owner->id]);
    $other = Outlet::factory()->create(['owner_id' => $owner->id]);

    $position = Position::create([
        'outlet_id' => $other->id,
        'name' => 'NotCourier',
        'slug' => 'helper',
        'is_active' => true,
    ]);

    $employee = Employee::factory()->create(['outlet_id' => $primary->id]);

    expect(fn() => $employee->assignPosition($position->id))->toThrow(\InvalidArgumentException::class);
});

it('rejects assignment when position slug is kurir but missing courier permissions', function () {
    $owner = User::factory()->create();
    $primary = Outlet::factory()->create(['owner_id' => $owner->id]);
    $other = Outlet::factory()->create(['owner_id' => $owner->id]);

    $position = Position::create([
        'outlet_id' => $other->id,
        'name' => 'KurirNoPerm',
        'slug' => 'kurir',
        'is_active' => true,
    ]);

    $employee = Employee::factory()->create(['outlet_id' => $primary->id]);

    expect(fn() => $employee->assignPosition($position->id))->toThrow(\InvalidArgumentException::class);
});

it('rejects assignment of courier-position from outlet owned by different owner', function () {
    $owner1 = User::factory()->create();
    $owner2 = User::factory()->create();

    $primary = Outlet::factory()->create(['owner_id' => $owner1->id]);
    $other = Outlet::factory()->create(['owner_id' => $owner2->id]);

    $position = Position::create([
        'outlet_id' => $other->id,
        'name' => 'CrossKurirOtherOwner',
        'slug' => 'kurir',
        'is_active' => true,
    ]);

    PositionPermission::create([
        'position_id' => $position->id,
        'permission_key' => \App\Enums\Permission::CourierManage->value,
    ]);

    $employee = Employee::factory()->create(['outlet_id' => $primary->id]);

    expect(fn() => $employee->assignPosition($position->id))->toThrow(\InvalidArgumentException::class);
});

it('allows assignment of position in same outlet even without courier permission', function () {
    $owner = User::factory()->create();
    $outlet = Outlet::factory()->create(['owner_id' => $owner->id]);

    $position = Position::create([
        'outlet_id' => $outlet->id,
        'name' => 'KasirLocal',
        'slug' => 'kasir',
        'is_active' => true,
    ]);

    $employee = Employee::factory()->create(['outlet_id' => $outlet->id]);

    $employee->assignPosition($position->id);

    expect($employee->positions()->where('positions.id', $position->id)->exists())->toBeTrue();
});
