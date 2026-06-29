<?php

use App\Models\Category;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\EmployeePosition;
use App\Models\LaundryService;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Outlet;
use App\Models\Position;
use App\Models\PositionPermission;
use App\Models\Unit;

function createWeighCashier(?Outlet $outlet = null): Employee
{
    $outlet ??= Outlet::factory()->create();

    $employee = Employee::factory()->create(['outlet_id' => $outlet->id]);
    $position = Position::create([
        'outlet_id' => $outlet->id,
        'name' => 'Cashier Weigh Test',
        'slug' => 'cashier-weigh-test-' . $employee->id,
        'is_active' => true,
    ]);

    PositionPermission::create([
        'position_id' => $position->id,
        'permission_key' => 'order.manage',
    ]);

    EmployeePosition::create([
        'employee_id' => $employee->id,
        'position_id' => $position->id,
        'is_active' => true,
    ]);

    return $employee;
}

function createWeighService(Outlet $outlet, array $attributes = []): LaundryService
{
    $category = Category::factory()->create(['outlet_id' => $outlet->id]);
    $unit = Unit::factory()->create();

    return LaundryService::factory()->create(array_merge([
        'category_id' => $category->id,
        'unit_id' => $unit->id,
        'price' => 10000,
        'min_quantity' => 1,
        'is_active' => true,
    ], $attributes));
}

function createReceivedWeighOrder(Employee $employee, LaundryService $service, array $attributes = []): Order
{
    $order = Order::factory()->create(array_merge([
        'employee_id' => $employee->id,
        'customer_id' => Customer::factory()->create()->id,
        'outlet_id' => $employee->outlet_id,
        'status' => Order::STATUS_RECEIVED,
        'payment_status' => Order::PAYMENT_STATUS_NOT_YET_PRICED,
        'subtotal' => 10000,
        'discount_amount' => 0,
        'tax_amount' => 0,
        'total_amount' => 10000,
        'paid_amount' => 0,
        'remaining_amount' => 10000,
    ], $attributes));

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'laundry_service_id' => $service->id,
        'category_name' => $service->category->name,
        'laundry_service_name' => $service->name,
        'unit_name' => $service->unit->name,
        'quantity' => 1,
        'unit_price' => $service->price,
        'subtotal' => $service->price,
        'discount_amount' => 0,
        'total_amount' => $service->price,
        'status' => OrderItem::STATUS_PENDING,
    ]);

    return $order;
}

function weighPayload(Employee $employee, array $items): array
{
    return [
        'employeeId' => $employee->id,
        'orderItems' => $items,
    ];
}

test('cashier dapat mengganti layanan item saat timbang', function () {
    $employee = createWeighCashier();
    $oldService = createWeighService($employee->outlet);
    $newService = createWeighService($employee->outlet, ['price' => 25000]);
    $order = createReceivedWeighOrder($employee, $oldService);

    $this->actingAs($employee, 'sanctum');

    $response = $this->postJson("/api/mobile/cashier/orders/{$order->id}/weigh", weighPayload($employee, [[
        'laundryServiceId' => $newService->id,
        'quantity' => 2,
        'itemNotes' => 'Jaket tebal',
    ]]));

    $response->assertOk()
        ->assertJsonPath('data.status', Order::STATUS_READY_TO_PROCESS)
        ->assertJsonPath('data.orderItems.0.laundryServiceId', $newService->id);
});

test('cashier dapat menambah item layanan baru saat timbang', function () {
    $employee = createWeighCashier();
    $serviceA = createWeighService($employee->outlet);
    $serviceB = createWeighService($employee->outlet, ['price' => 15000]);
    $order = createReceivedWeighOrder($employee, $serviceA);

    $this->actingAs($employee, 'sanctum');

    $response = $this->postJson("/api/mobile/cashier/orders/{$order->id}/weigh", weighPayload($employee, [
        ['laundryServiceId' => $serviceA->id, 'quantity' => 1],
        ['laundryServiceId' => $serviceB->id, 'quantity' => 3],
    ]));

    $response->assertOk()
        ->assertJsonCount(2, 'data.orderItems');
});

test('cashier dapat menghapus item lama saat timbang', function () {
    $employee = createWeighCashier();
    $serviceA = createWeighService($employee->outlet);
    $serviceB = createWeighService($employee->outlet);
    $serviceC = createWeighService($employee->outlet);
    $order = createReceivedWeighOrder($employee, $serviceA);

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'laundry_service_id' => $serviceB->id,
        'category_name' => $serviceB->category->name,
        'laundry_service_name' => $serviceB->name,
        'unit_name' => $serviceB->unit->name,
    ]);

    $this->actingAs($employee, 'sanctum');

    $response = $this->postJson("/api/mobile/cashier/orders/{$order->id}/weigh", weighPayload($employee, [[
        'laundryServiceId' => $serviceC->id,
        'quantity' => 1,
    ]]));

    $response->assertOk()
        ->assertJsonCount(1, 'data.orderItems')
        ->assertJsonPath('data.orderItems.0.laundryServiceId', $serviceC->id);
});

test('backend menolak timbang tanpa item', function () {
    $employee = createWeighCashier();
    $service = createWeighService($employee->outlet);
    $order = createReceivedWeighOrder($employee, $service);

    $this->actingAs($employee, 'sanctum');

    $this->postJson("/api/mobile/cashier/orders/{$order->id}/weigh", weighPayload($employee, []))
        ->assertStatus(422);
});

test('backend menolak layanan inactive', function () {
    $employee = createWeighCashier();
    $service = createWeighService($employee->outlet);
    $inactiveService = createWeighService($employee->outlet, ['is_active' => false]);
    $order = createReceivedWeighOrder($employee, $service);

    $this->actingAs($employee, 'sanctum');

    $this->postJson("/api/mobile/cashier/orders/{$order->id}/weigh", weighPayload($employee, [[
        'laundryServiceId' => $inactiveService->id,
        'quantity' => 1,
    ]]))->assertStatus(422);
});

test('backend menolak layanan dari outlet lain', function () {
    $employee = createWeighCashier();
    $service = createWeighService($employee->outlet);
    $otherOutlet = Outlet::factory()->create();
    $otherService = createWeighService($otherOutlet);
    $order = createReceivedWeighOrder($employee, $service);

    $this->actingAs($employee, 'sanctum');

    $this->postJson("/api/mobile/cashier/orders/{$order->id}/weigh", weighPayload($employee, [[
        'laundryServiceId' => $otherService->id,
        'quantity' => 1,
    ]]))->assertStatus(422);
});

test('backend menolak quantity di bawah minimum layanan', function () {
    $employee = createWeighCashier();
    $service = createWeighService($employee->outlet, ['min_quantity' => 2]);
    $order = createReceivedWeighOrder($employee, $service);

    $this->actingAs($employee, 'sanctum');

    $this->postJson("/api/mobile/cashier/orders/{$order->id}/weigh", weighPayload($employee, [[
        'laundryServiceId' => $service->id,
        'quantity' => 0.5,
    ]]))->assertStatus(422);
});

test('backend menghitung ulang total berdasarkan item aktual', function () {
    $employee = createWeighCashier();
    $service = createWeighService($employee->outlet, ['price' => 12000]);
    $order = createReceivedWeighOrder($employee, $service);

    $this->actingAs($employee, 'sanctum');

    $response = $this->postJson("/api/mobile/cashier/orders/{$order->id}/weigh", weighPayload($employee, [[
        'laundryServiceId' => $service->id,
        'quantity' => 2.5,
    ]]));

    $response->assertOk()
        ->assertJsonPath('data.totalAmount', 30000);
});

test('timbang tetap berhasil tanpa foto', function () {
    $employee = createWeighCashier();
    $service = createWeighService($employee->outlet);
    $order = createReceivedWeighOrder($employee, $service);

    $this->actingAs($employee, 'sanctum');

    $this->postJson("/api/mobile/cashier/orders/{$order->id}/weigh", weighPayload($employee, [[
        'laundryServiceId' => $service->id,
        'quantity' => 1,
    ]]))->assertOk();
});

test('order berubah ke ready_to_process setelah timbang', function () {
    $employee = createWeighCashier();
    $service = createWeighService($employee->outlet);
    $order = createReceivedWeighOrder($employee, $service);

    $this->actingAs($employee, 'sanctum');

    $this->postJson("/api/mobile/cashier/orders/{$order->id}/weigh", weighPayload($employee, [[
        'laundryServiceId' => $service->id,
        'quantity' => 1,
    ]]))->assertOk()
        ->assertJsonPath('data.status', Order::STATUS_READY_TO_PROCESS);
});
