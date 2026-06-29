<?php

use App\Models\Employee;
use App\Models\EmployeePosition;
use App\Models\Position;
use App\Models\PositionPermission;
use App\Models\Order;
use App\Models\Customer;
use App\Models\Feature;
use Illuminate\Support\Facades\Http;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function setupStaffWithPermissions(Employee $employee, array $permissions): void
{
    $position = Position::create([
        'outlet_id' => $employee->outlet_id,
        'name' => 'Staff Test',
        'slug' => 'staff-test',
        'is_active' => true,
    ]);
    
    foreach ($permissions as $permission) {
        PositionPermission::create([
            'position_id' => $position->id,
            'permission_key' => $permission,
        ]);
    }

    EmployeePosition::create([
        'employee_id' => $employee->id,
        'position_id' => $position->id,
        'is_active' => true,
    ]);
}

test('production courier can preview WA notification', function () {
    /** @var Employee $employee */
    $employee = Employee::factory()->create();
    setupStaffWithPermissions($employee, ['courier.view']);

    $outlet = $employee->outlet;
    $outlet->coin_balance = 10;
    $outlet->save();

    Feature::create([
        'key' => 'wa_order_notification',
        'name' => 'WA Order Notification',
        'coin_price' => 1,
        'is_active' => true,
    ]);

    $customer = Customer::factory()->create([
        'phone' => '081234567890',
    ]);

    $order = Order::factory()->create([
        'outlet_id' => $employee->outlet_id,
        'employee_id' => $employee->id,
        'customer_id' => $customer->id,
        'status' => Order::STATUS_PICKING_UP,
    ]);

    $this->actingAs($employee, 'sanctum');

    $response = $this->getJson("/api/mobile/production/orders/{$order->id}/wa-notification-preview");

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'message' => 'Preview generated successfully',
        ])
        ->assertJsonPath('data.customerPhone', '081234567890');

    expect($response->json('data.messagePreview'))->toContain('menuju lokasi Anda untuk menjemput pakaian/laundry Anda');
});

test('production courier without view permission is unauthorized to preview WA notification', function () {
    /** @var Employee $employee */
    $employee = Employee::factory()->create();
    setupStaffWithPermissions($employee, []);

    $order = Order::factory()->create([
        'outlet_id' => $employee->outlet_id,
        'employee_id' => $employee->id,
    ]);

    $this->actingAs($employee, 'sanctum');

    $response = $this->getJson("/api/mobile/production/orders/{$order->id}/wa-notification-preview");

    $response->assertStatus(403);
});

test('production courier can send WA notification', function () {
    Http::fake([
        'api.fonnte.com/*' => Http::response(['status' => true, 'detail' => 'success'], 200)
    ]);

    /** @var Employee $employee */
    $employee = Employee::factory()->create();
    setupStaffWithPermissions($employee, ['courier.manage']);

    $outlet = $employee->outlet;
    $outlet->coin_balance = 10;
    $outlet->save();

    Feature::create([
        'key' => 'wa_order_notification',
        'name' => 'WA Order Notification',
        'coin_price' => 1,
        'is_active' => true,
    ]);

    $customer = Customer::factory()->create([
        'phone' => '081234567890',
    ]);

    $order = Order::factory()->create([
        'outlet_id' => $employee->outlet_id,
        'employee_id' => $employee->id,
        'customer_id' => $customer->id,
    ]);

    $this->actingAs($employee, 'sanctum');

    $response = $this->postJson("/api/mobile/production/orders/{$order->id}/send-wa-notification");

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'data' => [
                'coinDeducted' => 1,
                'coinSource' => 'outlet',
                'remainingCoin' => 9,
            ],
        ]);
});

test('production courier without manage permission is unauthorized to send WA notification', function () {
    /** @var Employee $employee */
    $employee = Employee::factory()->create();
    setupStaffWithPermissions($employee, ['courier.view']);

    $order = Order::factory()->create([
        'outlet_id' => $employee->outlet_id,
        'employee_id' => $employee->id,
    ]);

    $this->actingAs($employee, 'sanctum');

    $response = $this->postJson("/api/mobile/production/orders/{$order->id}/send-wa-notification");

    $response->assertStatus(403);
});

test('cashier can preview WA notification', function () {
    /** @var Employee $employee */
    $employee = Employee::factory()->create();
    setupStaffWithPermissions($employee, ['order.view']);

    $outlet = $employee->outlet;
    $outlet->coin_balance = 10;
    $outlet->save();

    Feature::create([
        'key' => 'wa_order_notification',
        'name' => 'WA Order Notification',
        'coin_price' => 1,
        'is_active' => true,
    ]);

    $customer = Customer::factory()->create([
        'phone' => '081234567890',
    ]);

    $order = Order::factory()->create([
        'outlet_id' => $employee->outlet_id,
        'employee_id' => $employee->id,
        'customer_id' => $customer->id,
        'status' => Order::STATUS_DELIVERING,
    ]);

    $this->actingAs($employee, 'sanctum');

    $response = $this->getJson("/api/mobile/cashier/orders/{$order->id}/wa-notification-preview");

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'message' => 'Preview generated successfully',
        ])
        ->assertJsonPath('data.customerPhone', '081234567890');

    expect($response->json('data.messagePreview'))->toContain('*sedang diantar* oleh kurir kami');
    expect($response->json('data.messagePreview'))->toContain('sedang dalam perjalanan menuju lokasi Anda');
});

test('cashier without view permission is unauthorized to preview WA notification', function () {
    /** @var Employee $employee */
    $employee = Employee::factory()->create();
    setupStaffWithPermissions($employee, []);

    $order = Order::factory()->create([
        'outlet_id' => $employee->outlet_id,
        'employee_id' => $employee->id,
    ]);

    $this->actingAs($employee, 'sanctum');

    $response = $this->getJson("/api/mobile/cashier/orders/{$order->id}/wa-notification-preview");

    $response->assertStatus(403);
});

test('cashier can send WA notification', function () {
    Http::fake([
        'api.fonnte.com/*' => Http::response(['status' => true, 'detail' => 'success'], 200)
    ]);

    /** @var Employee $employee */
    $employee = Employee::factory()->create();
    setupStaffWithPermissions($employee, ['order.manage']);

    $outlet = $employee->outlet;
    $outlet->coin_balance = 10;
    $outlet->save();

    Feature::create([
        'key' => 'wa_order_notification',
        'name' => 'WA Order Notification',
        'coin_price' => 1,
        'is_active' => true,
    ]);

    $customer = Customer::factory()->create([
        'phone' => '081234567890',
    ]);

    $order = Order::factory()->create([
        'outlet_id' => $employee->outlet_id,
        'employee_id' => $employee->id,
        'customer_id' => $customer->id,
    ]);

    $this->actingAs($employee, 'sanctum');

    $response = $this->postJson("/api/mobile/cashier/orders/{$order->id}/send-wa-notification");

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'data' => [
                'coinDeducted' => 1,
                'coinSource' => 'outlet',
                'remainingCoin' => 9,
            ],
        ]);
});

test('cashier without manage permission is unauthorized to send WA notification', function () {
    /** @var Employee $employee */
    $employee = Employee::factory()->create();
    setupStaffWithPermissions($employee, ['order.view']);

    $order = Order::factory()->create([
        'outlet_id' => $employee->outlet_id,
        'employee_id' => $employee->id,
    ]);

    $this->actingAs($employee, 'sanctum');

    $response = $this->postJson("/api/mobile/cashier/orders/{$order->id}/send-wa-notification");

    $response->assertStatus(403);
});
