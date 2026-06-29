<?php

use App\Models\Employee;
use App\Models\Outlet;
use App\Models\Position;
use App\Models\PositionPermission;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->outlet = Outlet::factory()->create();
    $this->position = Position::factory()->create([
        'outlet_id' => $this->outlet->id,
        'slug' => 'kasir',
        'is_active' => true,
    ]);
    PositionPermission::create([
        'position_id' => $this->position->id,
        'permission_key' => 'order.view',
    ]);
    $this->employee = Employee::factory()->create([
        'outlet_id' => $this->outlet->id,
        'username' => 'testkasir',
        'password' => Hash::make('password123'),
        'pin_hash' => null,
        'is_active' => true,
    ]);
    $this->employee->assignPosition($this->position->id);
});

test('password login employee tanpa PIN mengembalikan hasPin: false', function () {
    $response = $this->postJson('/api/mobile/cashier/auth/login', [
        'username' => 'testkasir',
        'password' => 'password123',
        'device_name' => 'test-device'
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
        ])
        ->assertJsonPath('data.employee.hasPin', false)
        ->assertJsonMissing(['pin_hash' => null]);
    
    // Ensure PIN does not appear in response
    $responseData = $response->json();
    expect(json_encode($responseData))->not->toContain('pin_hash');
});

test('setup PIN berhasil dan hash tersimpan', function () {
    Sanctum::actingAs($this->employee);

    $response = $this->postJson('/api/mobile/cashier/auth/pin/setup', [
        'pin' => '123456',
        'pin_confirmation' => '123456',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.employee.hasPin', true);

    $this->employee->refresh();
    expect($this->employee->pin_hash)->not->toBeNull();
    expect(Hash::check('123456', $this->employee->pin_hash))->toBeTrue();
});

test('setup PIN mengembalikan allPermissions populated', function () {
    Sanctum::actingAs($this->employee);

    $response = $this->postJson('/api/mobile/cashier/auth/pin/setup', [
        'pin' => '123456',
        'pin_confirmation' => '123456',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.employee.hasPin', true)
        ->assertJsonPath('data.employee.allPermissions', fn ($permissions) => count($permissions) > 0);
});

test('setup PIN mengembalikan accessibleOutlets populated', function () {
    Sanctum::actingAs($this->employee);

    $response = $this->postJson('/api/mobile/cashier/auth/pin/setup', [
        'pin' => '123456',
        'pin_confirmation' => '123456',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.employee.hasPin', true)
        ->assertJsonPath('data.employee.accessibleOutlets', fn ($outlets) => count($outlets) > 0);
});

test('verify PIN mengembalikan payload permission konsisten dengan login', function () {
    $this->employee->update([
        'pin_hash' => Hash::make('123456'),
        'pin_set_at' => now(),
    ]);

    $response = $this->postJson('/api/mobile/cashier/auth/pin/verify', [
        'username' => 'testkasir',
        'pin' => '123456',
        'device_name' => 'test-device'
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.employee.hasPin', true)
        ->assertJsonPath('data.employee.allPermissions', fn ($permissions) => count($permissions) > 0)
        ->assertJsonPath('data.employee.accessibleOutlets', fn ($outlets) => count($outlets) > 0);
});

test('verify PIN benar mengembalikan token baru', function () {
    $this->employee->update([
        'pin_hash' => Hash::make('123456'),
        'pin_set_at' => now(),
    ]);

    $response = $this->postJson('/api/mobile/cashier/auth/pin/verify', [
        'username' => 'testkasir',
        'pin' => '123456',
        'device_name' => 'test-device'
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'token',
                'tokenType',
                'employee' => [
                    'id',
                    'username',
                    'hasPin'
                ]
            ]
        ])
        ->assertJsonPath('data.employee.hasPin', true);
});

test('verify PIN salah gagal', function () {
    $this->employee->update([
        'pin_hash' => Hash::make('123456'),
        'pin_set_at' => now(),
    ]);

    $response = $this->postJson('/api/mobile/cashier/auth/pin/verify', [
        'username' => 'testkasir',
        'pin' => '654321',
        'device_name' => 'test-device'
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('error.pin.0', 'PIN tidak valid.');
});

test('setup PIN kedua kali ditolak', function () {
    $this->employee->update(['pin_hash' => Hash::make('oldpin')]);
    Sanctum::actingAs($this->employee);

    $response = $this->postJson('/api/mobile/cashier/auth/pin/setup', [
        'pin' => '123456',
        'pin_confirmation' => '123456',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('error.pin.0', 'PIN sudah diatur. Gunakan endpoint reset PIN.');
});

test('verify PIN employee tidak aktif ditolak', function () {
    $this->employee->update([
        'pin_hash' => Hash::make('123456'),
        'pin_set_at' => now(),
        'is_active' => false,
    ]);

    $response = $this->postJson('/api/mobile/cashier/auth/pin/verify', [
        'username' => 'testkasir',
        'pin' => '123456',
        'device_name' => 'test-device'
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('error.account.0', 'Akun tidak aktif.');
});

test('verify PIN salah tidak mencabut token', function () {
    $this->employee->update([
        'pin_hash' => Hash::make('123456'),
        'pin_set_at' => now(),
    ]);

    $token = $this->employee->createToken('test-device')->plainTextToken;

    $response = $this->postJson('/api/mobile/cashier/auth/pin/verify', [
        'username' => 'testkasir',
        'pin' => '654321',
        'device_name' => 'test-device'
    ]);

    $response->assertStatus(422);

    expect($this->employee->tokens()->count())->toBeGreaterThan(0);
});
