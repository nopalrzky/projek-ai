<?php

use App\Models\Outlet;
use App\Models\Position;
use App\Models\User;
use Spatie\Permission\Models\Role;

function createOwnerForOutletPositionTests(): User
{
    Role::findOrCreate('owner', 'web');

    $owner = User::factory()->create();
    $owner->assignRole('owner');

    return $owner;
}

test('nested outlet position update keeps same name and syncs permissions', function () {
    $owner = createOwnerForOutletPositionTests();
    $outlet = Outlet::factory()->create(['owner_id' => $owner->id]);

    $position = Position::create([
        'outlet_id' => $outlet->id,
        'name' => 'Kasir Senior',
        'description' => 'Posisi awal',
        'is_active' => true,
    ]);

    $position->permissions()->create(['permission_key' => 'order.view']);

    $response = $this->actingAs($owner)->put(
        route('outlets.positions.update', ['outletId' => $outlet->id, 'positionId' => $position->id]),
        [
            'name' => 'Kasir Senior',
            'description' => 'Deskripsi baru',
            'isActive' => true,
            'permissions' => ['order.create'],
        ]
    );

    $response->assertRedirect(route('outlets.show', ['outlet' => $outlet->id]));
    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('position_permissions', [
        'position_id' => $position->id,
        'permission_key' => 'order.create',
    ]);

    $this->assertDatabaseMissing('position_permissions', [
        'position_id' => $position->id,
        'permission_key' => 'order.view',
    ]);
});

test('nested outlet position store rejects duplicate active name in same outlet', function () {
    $owner = createOwnerForOutletPositionTests();
    $outlet = Outlet::factory()->create(['owner_id' => $owner->id]);

    Position::create([
        'outlet_id' => $outlet->id,
        'name' => 'Kasir',
        'description' => null,
        'is_active' => true,
    ]);

    $response = $this->actingAs($owner)->post(
        route('outlets.positions.store', ['outletId' => $outlet->id]),
        [
            'name' => 'Kasir',
            'description' => 'Duplicate',
            'isActive' => true,
            'permissions' => ['order.view'],
        ]
    );

    $response->assertSessionHasErrors(['name']);

    expect(
        Position::query()
            ->where('outlet_id', $outlet->id)
            ->where('name', 'Kasir')
            ->count()
    )->toBe(1);
});

test('nested outlet position store allows same name in different outlet', function () {
    $owner = createOwnerForOutletPositionTests();
    $outletA = Outlet::factory()->create(['owner_id' => $owner->id]);
    $outletB = Outlet::factory()->create(['owner_id' => $owner->id]);

    Position::create([
        'outlet_id' => $outletA->id,
        'name' => 'Kasir',
        'description' => null,
        'is_active' => true,
    ]);

    $response = $this->actingAs($owner)->post(
        route('outlets.positions.store', ['outletId' => $outletB->id]),
        [
            'name' => 'Kasir',
            'description' => 'Outlet B',
            'isActive' => true,
            'permissions' => ['order.view'],
        ]
    );

    $response->assertRedirect(route('outlets.show', ['outlet' => $outletB->id]));
    $response->assertSessionHasNoErrors();

    $createdPosition = Position::query()
        ->where('outlet_id', $outletB->id)
        ->where('name', 'Kasir')
        ->first();

    expect($createdPosition)->not->toBeNull();

    $this->assertDatabaseHas('position_permissions', [
        'position_id' => $createdPosition->id,
        'permission_key' => 'order.view',
    ]);
});

test('nested outlet position store restores soft deleted position with same name', function () {
    $owner = createOwnerForOutletPositionTests();
    $outlet = Outlet::factory()->create(['owner_id' => $owner->id]);

    $position = Position::create([
        'outlet_id' => $outlet->id,
        'name' => 'Kasir',
        'description' => 'Lama',
        'is_active' => true,
    ]);

    $position->permissions()->create(['permission_key' => 'order.view']);
    $position->delete();

    $response = $this->actingAs($owner)->post(
        route('outlets.positions.store', ['outletId' => $outlet->id]),
        [
            'name' => 'Kasir',
            'description' => 'Baru',
            'isActive' => false,
            'permissions' => ['order.create'],
        ]
    );

    $response->assertRedirect(route('outlets.show', ['outlet' => $outlet->id]));
    $response->assertSessionHasNoErrors();

    $restoredPosition = Position::withTrashed()->findOrFail($position->id);

    expect($restoredPosition->trashed())->toBeFalse();
    expect($restoredPosition->description)->toBe('Baru');
    expect($restoredPosition->is_active)->toBeFalse();

    expect(
        Position::withTrashed()
            ->where('outlet_id', $outlet->id)
            ->where('name', 'Kasir')
            ->count()
    )->toBe(1);

    $this->assertDatabaseHas('position_permissions', [
        'position_id' => $position->id,
        'permission_key' => 'order.create',
    ]);

    $this->assertDatabaseMissing('position_permissions', [
        'position_id' => $position->id,
        'permission_key' => 'order.view',
    ]);
});

test('nested outlet position mismatch route cannot update or delete position from other outlet', function () {
    $owner = createOwnerForOutletPositionTests();
    $outletA = Outlet::factory()->create(['owner_id' => $owner->id]);
    $outletB = Outlet::factory()->create(['owner_id' => $owner->id]);

    $position = Position::create([
        'outlet_id' => $outletA->id,
        'name' => 'Kasir',
        'description' => 'Tetap',
        'is_active' => true,
    ]);

    $updateResponse = $this->actingAs($owner)->put(
        route('outlets.positions.update', ['outletId' => $outletB->id, 'positionId' => $position->id]),
        [
            'name' => 'Kasir Baru',
            'description' => 'Harus gagal',
            'isActive' => false,
            'permissions' => ['order.create'],
        ]
    );

    $updateResponse->assertSessionHas('error');

    $deleteResponse = $this->actingAs($owner)->delete(
        route('outlets.positions.destroy', ['outletId' => $outletB->id, 'positionId' => $position->id])
    );

    $deleteResponse->assertSessionHas('error');

    $position->refresh();

    expect($position->outlet_id)->toBe($outletA->id);
    expect($position->name)->toBe('Kasir');
    expect($position->trashed())->toBeFalse();
});
