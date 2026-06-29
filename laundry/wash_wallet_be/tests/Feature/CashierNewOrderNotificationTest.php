<?php

use App\Models\Employee;
use App\Models\EmployeeDeviceToken;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\Position;
use App\Services\FcmNotificationService;
use Mockery;
use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Messaging\Message;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\deleteJson;
use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;

function cashierNotificationAttachPosition(Employee $employee, Outlet $outlet, array $permissions = ['order.view'], bool $active = true): Position
{
    $position = Position::factory()->create([
        'outlet_id' => $outlet->id,
        'is_active' => true,
    ]);

    foreach ($permissions as $permission) {
        $position->permissions()->create(['permission_key' => $permission]);
    }

    $employee->positions()->attach($position->id, [
        'is_active' => $active,
    ]);

    return $position;
}

test('employee can register update and remove fcm token with device id', function () {
    /** @var Employee $employee */
    $employee = Employee::factory()->create();
    actingAs($employee, 'sanctum');

    postJson('/api/mobile/cashier/auth/fcm-token', [
        'token' => 'old-token',
        'device_id' => 'device-1',
        'device_name' => 'Cashier Device',
    ])->assertOk();

    postJson('/api/mobile/cashier/auth/fcm-token', [
        'token' => 'new-token',
        'device_id' => 'device-1',
        'device_name' => 'Cashier Device',
    ])->assertOk();

    expect(EmployeeDeviceToken::query()->where('employee_id', $employee->id)->pluck('token')->all())
        ->toBe(['new-token']);

    deleteJson('/api/mobile/cashier/auth/fcm-token', [
        'token' => 'new-token',
    ])->assertOk();

    expect(EmployeeDeviceToken::query()->where('employee_id', $employee->id)->count())->toBe(0);
});

test('new count uses active outlet context and order view permission', function () {
    $primaryOutlet = Outlet::factory()->create();
    $secondaryOutlet = Outlet::factory()->create();
    /** @var Employee $employee */
    $employee = Employee::factory()->create(['outlet_id' => $primaryOutlet->id]);
    cashierNotificationAttachPosition($employee, $secondaryOutlet);

    Order::factory()->create([
        'outlet_id' => $secondaryOutlet->id,
        'source' => Order::SOURCE_CUSTOMER_APP,
        'status' => Order::STATUS_REQUESTED,
    ]);
    Order::factory()->create([
        'outlet_id' => $secondaryOutlet->id,
        'source' => Order::SOURCE_CASHIER,
        'status' => Order::STATUS_REQUESTED,
    ]);
    Order::factory()->create([
        'outlet_id' => $primaryOutlet->id,
        'source' => Order::SOURCE_CUSTOMER_APP,
        'status' => Order::STATUS_REQUESTED,
    ]);

    actingAs($employee, 'sanctum');

    getJson('/api/mobile/cashier/orders/new-count', [
        'X-Outlet-ID' => $secondaryOutlet->id,
    ])
        ->assertOk()
        ->assertJsonPath('data.count', 1);
});

test('fcm targeting uses active position permission on order outlet', function () {
    $outlet = Outlet::factory()->create();
    $otherOutlet = Outlet::factory()->create();

    /** @var Employee $eligible */
    $eligible = Employee::factory()->create(['outlet_id' => $otherOutlet->id, 'is_active' => true]);
    cashierNotificationAttachPosition($eligible, $outlet);
    EmployeeDeviceToken::query()->create([
        'employee_id' => $eligible->id,
        'token' => 'eligible-token',
        'last_used_at' => now(),
    ]);

    /** @var Employee $wrongOutlet */
    $wrongOutlet = Employee::factory()->create(['outlet_id' => $otherOutlet->id, 'is_active' => true]);
    cashierNotificationAttachPosition($wrongOutlet, $otherOutlet);
    EmployeeDeviceToken::query()->create([
        'employee_id' => $wrongOutlet->id,
        'token' => 'wrong-outlet-token',
        'last_used_at' => now(),
    ]);

    /** @var Employee $withoutPermission */
    $withoutPermission = Employee::factory()->create(['outlet_id' => $outlet->id, 'is_active' => true]);
    cashierNotificationAttachPosition($withoutPermission, $outlet, []);
    EmployeeDeviceToken::query()->create([
        'employee_id' => $withoutPermission->id,
        'token' => 'without-permission-token',
        'last_used_at' => now(),
    ]);

    $sentTokens = [];
    $messaging = Mockery::mock(Messaging::class);
    $messaging->shouldReceive('send')
        ->once()
        ->with(Mockery::on(function (Message $message) use (&$sentTokens) {
            $data = $message->jsonSerialize();
            $sentTokens[] = $data['token'] ?? null;

            return true;
        }))
        ->andReturn('message-id');

    $service = new FcmNotificationService($messaging);
    $service->sendToOutletCashiers($outlet->id, 'Order Baru Masuk', 'Body', [
        'type' => 'cashier_new_order',
        'orderId' => '1',
    ]);

    expect($sentTokens)->toBe(['eligible-token']);
});
