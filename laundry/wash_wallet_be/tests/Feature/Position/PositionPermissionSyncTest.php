<?php

use App\Models\User;
use App\Models\Outlet;
use App\Models\Position;
use App\Models\Employee;
use App\Enums\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('owner can store position with valid permissions', function () {
    /** @var User $owner */ 
    $owner = User::factory()->createOne();
    $outlet = Outlet::factory()->createOne(['owner_id' => $owner->id]);

    $data = [
        'outletId' => $outlet->id,
        'name' => 'Kasir Senior',
        'description' => 'Mengepalai kasir lain',
        'permissions' => ['order.create', 'order.view']
    ];

    $response = $this->actingAs($owner, 'sanctum')
        ->postJson('/api/positions', $data);

    $response->assertStatus(201);
    
    $this->assertDatabaseHas('positions', [
        'outlet_id' => $outlet->id,
        'name' => 'Kasir Senior',
    ]);

    $position = Position::where('name', 'Kasir Senior')->first();
    expect($position->permissions()->pluck('permission_key')->toArray())
        ->toEqualCanonicalizing(['order.create', 'order.view']);
});

test('owner can update position permissions', function () {
    /** @var User $owner */ 
    $owner = User::factory()->createOne();
    $outlet = Outlet::factory()->createOne(['owner_id' => $owner->id]);
    
    $position = Position::create([
        'outlet_id' => $outlet->id,
        'name' => 'Kasir Junior',
        'is_active' => true,
    ]);
    $position->permissions()->create(['permission_key' => 'order.view']);

    $data = [
        'permissions' => ['order.create']
    ];

    $response = $this->actingAs($owner, 'sanctum')
        ->putJson("/api/positions/{$position->id}", $data);

    $response->assertStatus(200);

    expect($position->permissions()->pluck('permission_key')->toArray())
        ->toEqualCanonicalizing(['order.create']);
});

test('store position with invalid permission key is rejected with 422', function () {
    /** @var User $owner */ 
    $owner = User::factory()->createOne();
    $outlet = Outlet::factory()->createOne(['owner_id' => $owner->id]);

    $data = [
        'outletId' => $outlet->id,
        'name' => 'Kasir Baru',
        'permissions' => ['order.hack']
    ];

    $response = $this->actingAs($owner, 'sanctum')
        ->postJson('/api/positions', $data);

    $response->assertStatus(422)
        ->assertJsonValidationErrors('permissions.0');
});

test('update position with invalid permission key is rejected with 422', function () {
    /** @var User $owner */ 
    $owner = User::factory()->createOne();
    $outlet = Outlet::factory()->createOne(['owner_id' => $owner->id]);

    $position = Position::create([
        'outlet_id' => $outlet->id,
        'name' => 'Kasir Junior',
        'is_active' => true,
    ]);

    $data = [
        'permissions' => ['order.hack']
    ];

    $response = $this->actingAs($owner, 'sanctum')
        ->putJson("/api/positions/{$position->id}", $data);

    $response->assertStatus(422)
        ->assertJsonValidationErrors('permissions.0');
});

test('owner cannot store position in outlet belonging to another owner', function () {
    /** @var User $owner1 */
    $owner1 = User::factory()->createOne();
    /** @var User $owner2 */
    $owner2 = User::factory()->createOne();
    $outletOfOwner2 = Outlet::factory()->createOne(['owner_id' => $owner2->id]);

    $data = [
        'outletId' => $outletOfOwner2->id,
        'name' => 'Kasir Lain',
        'permissions' => ['order.view']
    ];

    $response = $this->actingAs($owner1, 'sanctum')
        ->postJson('/api/positions', $data);

    $response->assertStatus(403);
});

test('owner cannot update position in outlet belonging to another owner', function () {
    /** @var User $owner1 */
    $owner1 = User::factory()->createOne();
    /** @var User $owner2 */
    $owner2 = User::factory()->createOne();
    $outletOfOwner2 = Outlet::factory()->createOne(['owner_id' => $owner2->id]);

    $position = Position::create([
        'outlet_id' => $outletOfOwner2->id,
        'name' => 'Kasir Junior',
        'is_active' => true,
    ]);

    $data = [
        'name' => 'Kasir Diubah',
        'permissions' => ['order.view']
    ];

    $response = $this->actingAs($owner1, 'sanctum')
        ->putJson("/api/positions/{$position->id}", $data);

    $response->assertStatus(403);
});

test('owner cannot destroy position in outlet belonging to another owner', function () {
    /** @var User $owner1 */
    $owner1 = User::factory()->createOne();
    /** @var User $owner2 */
    $owner2 = User::factory()->createOne();
    $outletOfOwner2 = Outlet::factory()->createOne(['owner_id' => $owner2->id]);

    $position = Position::create([
        'outlet_id' => $outletOfOwner2->id,
        'name' => 'Kasir Junior',
        'is_active' => true,
    ]);

    $response = $this->actingAs($owner1, 'sanctum')
        ->deleteJson("/api/positions/{$position->id}");

    $response->assertStatus(403);
});

test('employee cannot access position management endpoints', function () {
    /** @var Employee $employee */ 
    $employee = Employee::factory()->createOne();

    $response = $this->actingAs($employee, 'sanctum')
        ->postJson('/api/positions', [
            'outletId' => $employee->outlet_id,
            'name' => 'Kasir Baru',
        ]);
    $response->assertStatus(403);

    $position = Position::create([
        'outlet_id' => $employee->outlet_id,
        'name' => 'Kasir Junior',
        'is_active' => true,
    ]);
    $response = $this->actingAs($employee, 'sanctum')
        ->putJson("/api/positions/{$position->id}", [
            'name' => 'Kasir Diubah',
        ]);
    $response->assertStatus(403);

    $response = $this->actingAs($employee, 'sanctum')
        ->deleteJson("/api/positions/{$position->id}");
    $response->assertStatus(403);
});
