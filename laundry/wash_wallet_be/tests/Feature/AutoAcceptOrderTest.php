<?php

use App\Events\CustomerOrderAccepted;
use App\Jobs\SendCourierNewPickupNotification;
use App\Jobs\SendCustomerOrderAcceptedFcm;
use App\Models\Customer;
use App\Models\CustomerAccount;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Outlet;
use App\Models\OutletSetting;
use App\Models\Setting;
use App\Services\AutoAcceptOrderService;
use App\Services\WaNotificationService;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;

function autoAcceptEnableSetting(Outlet $outlet, bool $enabled = true): void
{
    $setting = Setting::query()->updateOrCreate(
        ['key' => 'auto_accept_order'],
        [
            'name' => 'Auto Accept Order',
            'description' => 'Order dari customer-app dengan status requested yang tidak berubah selama 24 jam sejak dibuat akan diterima otomatis.',
        ]
    );

    OutletSetting::query()->updateOrCreate(
        ['outlet_id' => $outlet->id, 'setting_id' => $setting->id],
        ['value' => $enabled ? 'true' : 'false']
    );
}

function autoAcceptCustomerOrder(Outlet $outlet, array $overrides = []): Order
{
    $customerAccount = CustomerAccount::factory()->create();
    $customer = Customer::factory()->create([
        'customer_account_id' => $customerAccount->id,
        'outlet_id' => $outlet->id,
    ]);

    $order = Order::factory()->create(array_merge([
        'customer_account_id' => $customerAccount->id,
        'customer_id' => $customer->id,
        'outlet_id' => $outlet->id,
        'source' => Order::SOURCE_CUSTOMER_APP,
        'status' => Order::STATUS_REQUESTED,
        'delivery_type' => Order::DELIVERY_TYPE_PICKUP,
        'pickup_schedule' => now()->addDay()->setTime(9, 0),
        'created_at' => now()->subHours(25),
        'updated_at' => now()->subHours(25),
    ], $overrides));

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'status' => OrderItem::STATUS_PROCESSING,
    ]);

    return $order;
}

beforeEach(function () {
    $waNotificationService = Mockery::mock(WaNotificationService::class);
    $waNotificationService
        ->shouldReceive('sendStatusChangeNotification')
        ->zeroOrMoreTimes();

    app()->instance(WaNotificationService::class, $waNotificationService);
});

test('auto accept processes eligible requested customer app orders only for enabled outlets', function () {
    Queue::fake([
        SendCustomerOrderAcceptedFcm::class,
        SendCourierNewPickupNotification::class,
    ]);
    Event::fake([CustomerOrderAccepted::class]);

    $enabledOutlet = Outlet::factory()->create();
    $disabledOutlet = Outlet::factory()->create();
    autoAcceptEnableSetting($enabledOutlet, true);
    autoAcceptEnableSetting($disabledOutlet, false);

    $eligibleOrder = autoAcceptCustomerOrder($enabledOutlet);
    $recentOrder = autoAcceptCustomerOrder($enabledOutlet, [
        'created_at' => now()->subHours(2),
        'updated_at' => now()->subHours(2),
    ]);
    $pendingDropoffOrder = autoAcceptCustomerOrder($enabledOutlet, [
        'status' => Order::STATUS_PENDING_DROPOFF,
    ]);
    $disabledOutletOrder = autoAcceptCustomerOrder($disabledOutlet);

    $summary = app(AutoAcceptOrderService::class)->run(now());

    expect($summary['processed'])->toBe(1)
        ->and($summary['failed'])->toBe(0)
        ->and($eligibleOrder->fresh()->status)->toBe(Order::STATUS_ACCEPTED)
        ->and($recentOrder->fresh()->status)->toBe(Order::STATUS_REQUESTED)
        ->and($pendingDropoffOrder->fresh()->status)->toBe(Order::STATUS_PENDING_DROPOFF)
        ->and($disabledOutletOrder->fresh()->status)->toBe(Order::STATUS_REQUESTED)
        ->and($eligibleOrder->orderItems()->first()->status)->toBe(OrderItem::STATUS_PENDING);

    Queue::assertPushed(SendCustomerOrderAcceptedFcm::class, fn($job) => $job->orderId === $eligibleOrder->id);
    Queue::assertPushed(SendCourierNewPickupNotification::class, fn($job) => $job->orderId === $eligibleOrder->id);
    Event::assertDispatched(CustomerOrderAccepted::class, fn(CustomerOrderAccepted $event) => $event->order->id === $eligibleOrder->id);
});

test('auto accept status history is recorded as system actor', function () {
    Queue::fake();
    Event::fake();

    $outlet = Outlet::factory()->create();
    autoAcceptEnableSetting($outlet, true);
    $order = autoAcceptCustomerOrder($outlet);

    app(AutoAcceptOrderService::class)->run(now());

    $history = OrderStatusHistory::query()
        ->byOrderId($order->id)
        ->where('from_status', Order::STATUS_REQUESTED)
        ->where('to_status', Order::STATUS_ACCEPTED)
        ->first();

    expect($history)->not->toBeNull()
        ->and($history->employee_id)->toBeNull()
        ->and($history->actor_type)->toBe(OrderStatusHistory::ACTOR_TYPE_SYSTEM)
        ->and($history->actor_label)->toBe(OrderStatusHistory::ACTOR_LABEL_SYSTEM)
        ->and($history->metadata)->toMatchArray(['source' => 'auto_accept_order']);
});
