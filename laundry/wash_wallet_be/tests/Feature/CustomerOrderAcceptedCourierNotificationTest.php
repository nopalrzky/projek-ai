<?php

use App\Events\CustomerOrderAccepted;
use App\Events\CourierNewPickupBroadcast;
use App\Jobs\SendCourierNewPickupNotification;
use App\Jobs\SendCustomerOrderAcceptedFcm;
use App\Models\Customer;
use App\Models\CustomerAccount;
use App\Models\Employee;
use App\Models\EmployeeDeviceToken;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\Position;
use App\Services\FcmNotificationService;
use Mockery;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Messaging\Message;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\deleteJson;
use function Pest\Laravel\postJson;

function acceptedNotificationAttachPosition(
    Employee $employee,
    Outlet $outlet,
    array $permissions,
    bool $active = true
): Position {
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

function acceptedNotificationCustomerPickupOrder(Outlet $outlet, array $overrides = []): Order
{
    $customerAccount = $overrides['customer_account'] ?? CustomerAccount::factory()->create();
    $customer = $overrides['customer'] ?? Customer::factory()->create([
        'customer_account_id' => $customerAccount->id,
    ]);

    unset($overrides['customer_account'], $overrides['customer']);

    return Order::factory()->create(array_merge([
        'customer_account_id' => $customerAccount->id,
        'customer_id' => $customer->id,
        'outlet_id' => $outlet->id,
        'source' => Order::SOURCE_CUSTOMER_APP,
        'delivery_type' => Order::DELIVERY_TYPE_PICKUP,
        'status' => Order::STATUS_REQUESTED,
        'pickup_schedule' => now()->addDay()->setTime(9, 0),
        'pickup_address' => 'Jl. Merdeka No. 1',
    ], $overrides));
}

test('accepting requested customer pickup order dispatches customer and courier notifications', function () {
    Queue::fake([
        SendCustomerOrderAcceptedFcm::class,
        SendCourierNewPickupNotification::class,
    ]);
    Event::fake([CustomerOrderAccepted::class]);

    $outlet = Outlet::factory()->create();
    /** @var Employee $cashier */
    $cashier = Employee::factory()->create(['outlet_id' => $outlet->id]);
    acceptedNotificationAttachPosition($cashier, $outlet, ['order.manage']);
    $order = acceptedNotificationCustomerPickupOrder($outlet);

    actingAs($cashier, 'sanctum');

    postJson("/api/mobile/cashier/orders/{$order->id}/accept")
        ->assertOk();

    $order->refresh();
    expect($order->status)->toBe(Order::STATUS_ACCEPTED);

    Event::assertDispatched(CustomerOrderAccepted::class, function (CustomerOrderAccepted $event) use ($order) {
        return $event->order->id === $order->id && $event->eventId === 'accept-' . $order->id;
    });
    Queue::assertPushed(SendCustomerOrderAcceptedFcm::class, fn($job) => $job->orderId === $order->id);
    Queue::assertPushed(SendCourierNewPickupNotification::class, fn($job) => $job->orderId === $order->id);
});

test('accepting customer order without courier pickup schedule does not dispatch accepted pickup notifications', function () {
    Queue::fake([
        SendCustomerOrderAcceptedFcm::class,
        SendCourierNewPickupNotification::class,
    ]);
    Event::fake([CustomerOrderAccepted::class]);

    $outlet = Outlet::factory()->create();
    /** @var Employee $cashier */
    $cashier = Employee::factory()->create(['outlet_id' => $outlet->id]);
    acceptedNotificationAttachPosition($cashier, $outlet, ['order.manage']);
    $order = acceptedNotificationCustomerPickupOrder($outlet, [
        'pickup_schedule' => null,
        'pickup_address' => null,
    ]);

    actingAs($cashier, 'sanctum');

    postJson("/api/mobile/cashier/orders/{$order->id}/accept")
        ->assertOk();

    Event::assertNotDispatched(CustomerOrderAccepted::class);
    Queue::assertNotPushed(SendCustomerOrderAcceptedFcm::class);
    Queue::assertNotPushed(SendCourierNewPickupNotification::class);
});

test('courier notification job targets active courier permission on order outlet', function () {
    Event::fake([CourierNewPickupBroadcast::class]);

    $outlet = Outlet::factory()->create();
    $otherOutlet = Outlet::factory()->create();
    $order = acceptedNotificationCustomerPickupOrder($outlet, [
        'status' => Order::STATUS_ACCEPTED,
    ]);

    /** @var Employee $crossOutletCourier */
    $crossOutletCourier = Employee::factory()->create([
        'outlet_id' => $otherOutlet->id,
        'is_active' => true,
    ]);
    acceptedNotificationAttachPosition($crossOutletCourier, $outlet, ['courier.view']);
    EmployeeDeviceToken::query()->create([
        'employee_id' => $crossOutletCourier->id,
        'token' => 'cross-outlet-token',
        'last_used_at' => now(),
    ]);

    /** @var Employee $wrongOutletCourier */
    $wrongOutletCourier = Employee::factory()->create([
        'outlet_id' => $otherOutlet->id,
        'is_active' => true,
    ]);
    acceptedNotificationAttachPosition($wrongOutletCourier, $otherOutlet, ['courier.view']);

    /** @var Employee $productionOnly */
    $productionOnly = Employee::factory()->create([
        'outlet_id' => $outlet->id,
        'is_active' => true,
    ]);
    acceptedNotificationAttachPosition($productionOnly, $outlet, ['production.view']);

    $service = Mockery::mock(FcmNotificationService::class);
    $service->shouldReceive('sendToCourierDevices')
        ->once()
        ->with(Mockery::on(fn(Employee $employee) => $employee->id === $crossOutletCourier->id), Mockery::type(Order::class), 'pickup-' . $order->id);

    (new SendCourierNewPickupNotification($order->id))->handle($service);

    Event::assertDispatched(CourierNewPickupBroadcast::class);
});

test('customer accepted fcm payload includes stable event id and order details', function () {
    $outlet = Outlet::factory()->create(['name' => 'Outlet Pusat']);
    $customerAccount = CustomerAccount::factory()->create([
        'name' => 'Budi Santoso',
        'fcm_token' => 'customer-token',
    ]);
    $order = acceptedNotificationCustomerPickupOrder($outlet, [
        'customer_account' => $customerAccount,
        'status' => Order::STATUS_ACCEPTED,
    ])->load(['customerAccount', 'outlet']);

    /** @var array<string, mixed> $sentMessage */
    $sentMessage = [];
    $messaging = Mockery::mock(Messaging::class);
    $messaging->shouldReceive('send')
        ->once()
        ->with(Mockery::on(function (Message $message) use (&$sentMessage) {
            $sentMessage = $message->jsonSerialize();
            return true;
        }))
        ->andReturn('message-id');

    $service = new FcmNotificationService($messaging);
    $service->sendOrderAcceptedToCustomer($customerAccount, $order, 'accept-' . $order->id);

    expect($sentMessage['token'])->toBe('customer-token')
        ->and($sentMessage['data']['type'])->toBe('customer_order_accepted')
        ->and($sentMessage['data']['eventId'])->toBe('accept-' . $order->id)
        ->and($sentMessage['data']['orderId'])->toBe((string) $order->id)
        ->and($sentMessage['data']['outletName'])->toBe('Outlet Pusat')
        ->and($sentMessage['data']['status'])->toBe(Order::STATUS_ACCEPTED);
});

test('production app can register and remove employee fcm token', function () {
    /** @var Employee $employee */
    $employee = Employee::factory()->create();
    actingAs($employee, 'sanctum');

    postJson('/api/mobile/production/auth/fcm-token', [
        'token' => 'production-token',
        'device_id' => 'device-1',
        'device_name' => 'Production Device',
    ])->assertOk();

    expect(EmployeeDeviceToken::query()->where('employee_id', $employee->id)->pluck('token')->all())
        ->toBe(['production-token']);

    deleteJson('/api/mobile/production/auth/fcm-token', [
        'token' => 'production-token',
    ])->assertOk();

    expect(EmployeeDeviceToken::query()->where('employee_id', $employee->id)->count())->toBe(0);
});
