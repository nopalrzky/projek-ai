<?php

namespace Tests\Feature\CustomerOrder;

use App\Models\User;
use App\Models\Outlet;
use App\Models\Category;
use App\Models\LaundryService;
use App\Models\CourierSetting;
use App\Models\OperationalDay;
use App\Models\CourierSchedule;
use App\Models\CustomerAccount;
use App\Models\CustomerAddress;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

/** @var \Tests\TestCase $this */
uses(RefreshDatabase::class);


beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-07-03 08:00:00', 'Asia/Jakarta'));
    $this->owner = User::factory()->create();
    $this->outlet = Outlet::factory()->create(['owner_id' => $this->owner->id]);
    $this->employee = \App\Models\Employee::factory()->create([
        'id' => 1,
        'outlet_id' => $this->outlet->id,
    ]);
    $this->category = Category::factory()->create(['outlet_id' => $this->outlet->id]);

    $this->service = LaundryService::factory()->create([
        'category_id' => $this->category->id,
        'is_active' => true,
        'price' => 15000,
        'supports_courier' => true,
    ]);

    $this->courierSetting = CourierSetting::factory()->create([
        'outlet_id' => $this->outlet->id,
        'is_courier_enabled' => true,
        'pickup_fee' => 5000,
        'delivery_fee' => 5000,
    ]);

    $feature = \App\Models\Feature::firstOrCreate(['key' => 'courier_schedule'], ['name' => 'Courier Schedule']);
    \App\Models\OutletFeature::create([
        'outlet_id' => $this->outlet->id,
        'feature_id' => $feature->id,
        'status' => 'active'
    ]);

    $this->todayDay = strtolower(now()->format('l'));
    $this->opDay = OperationalDay::factory()->create([
        'outlet_id' => $this->outlet->id,
        'day_of_week' => $this->todayDay,
        'is_open' => true,
        'open_time' => '08:00:00',
        'close_time' => '20:00:00',
    ]);

    $this->pickupSchedule = CourierSchedule::factory()->create([
        'outlet_id' => $this->outlet->id,
        'operational_day_id' => $this->opDay->id,
        'day_of_week' => $this->todayDay,
        'type' => 'pickup',
        'start_time' => '10:00',
        'end_time' => '12:00',
        'is_active' => true,
    ]);

    $this->customerAccount = CustomerAccount::factory()->create([
        'is_active' => true,
        'is_verified' => true,
        'deposit_balance' => 0,
    ]);

    $this->address = CustomerAddress::factory()->create([
        'customer_account_id' => $this->customerAccount->id,
        'is_primary' => true,
    ]);
});

it('creates order: courier pickup + self pickup at outlet + COD', function () {
    actingAsCustomerAccount($this->customerAccount);

    $payload = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'cod',
        'pickupType' => 'courier',
        'customerAddressId' => $this->address->id,
        'pickupScheduleId' => $this->pickupSchedule->id,
        'pickupDate' => now()->format('Y-m-d'),
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
        ],
    ];

    $response = $this->postJson('/api/mobile/customer/orders', $payload);

    $response->assertStatus(201);

    $order = Order::first();
    expect($order)->not->toBeNull();
    expect($order->status)->toBe(Order::STATUS_REQUESTED);
    expect($order->source)->toBe(Order::SOURCE_CUSTOMER_APP);
    expect($order->payment_status)->toBe(Order::PAYMENT_STATUS_NOT_YET_PRICED);
    expect($order->pickup_address)->toBe($this->address->getSnapshotString());
    expect($order->pickup_fee)->toEqual(5000);
    expect($order->delivery_type)->toBe('pickup');

    $this->assertDatabaseHas('customers', [
        'customer_account_id' => $this->customerAccount->id,
        'outlet_id' => $this->outlet->id,
    ]);
});

it('creates order: self pickup + self pickup at outlet + COD', function () {
    actingAsCustomerAccount($this->customerAccount);

    $payload = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'cod',
        'pickupType' => 'self_pickup',
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
        ],
    ];

    $response = $this->postJson('/api/mobile/customer/orders', $payload);

    $response->assertStatus(201);

    $order = Order::first();
    expect($order->pickup_address)->toBeNull();
    expect($order->pickup_schedule)->toBeNull();
    expect($order->pickup_fee)->toEqual(0);
});

it('creates order: courier pickup + courier delivery + COD', function () {
    actingAsCustomerAccount($this->customerAccount);

    $payload = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'cod',
        'pickupType' => 'courier',
        'customerAddressId' => $this->address->id,
        'pickupScheduleId' => $this->pickupSchedule->id,
        'pickupDate' => now()->format('Y-m-d'),
        'deliveryType' => 'delivery',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
        ],
    ];

    $response = $this->postJson('/api/mobile/customer/orders', $payload);

    $response->assertStatus(201);

    $order = Order::first();
    expect($order->delivery_type)->toBe('delivery');
    expect($order->pickup_fee)->toEqual(5000);
});

it('creates order: self pickup + courier delivery + transfer', function () {
    actingAsCustomerAccount($this->customerAccount);

    $payload = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'transfer',
        'pickupType' => 'self_pickup',
        'deliveryType' => 'delivery',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
        ],
    ];

    $response = $this->postJson('/api/mobile/customer/orders', $payload);

    $response->assertStatus(201);

    $order = Order::first();
    expect($order->payment_status)->toBe(Order::PAYMENT_STATUS_NOT_YET_PRICED);
});

it('creates order with multiple laundry items', function () {
    actingAsCustomerAccount($this->customerAccount);

    $service2 = LaundryService::factory()->create([
        'category_id' => $this->category->id,
        'is_active' => true,
        'price' => 20000,
    ]);

    $payload = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'cod',
        'pickupType' => 'self_pickup',
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
            ['laundryServiceId' => $service2->id],
        ],
    ];

    $response = $this->postJson('/api/mobile/customer/orders', $payload);

    $response->assertStatus(201);

    $order = Order::first();
    expect($order->orderItems)->toHaveCount(2);
});

it('creates order with future pickup date', function () {
    actingAsCustomerAccount($this->customerAccount);

    $futureDate = now()->addDays(2);
    $futureDay = strtolower($futureDate->format('l'));

    // Create operational day & schedule for future day
    OperationalDay::factory()->create([
        'outlet_id' => $this->outlet->id,
        'day_of_week' => $futureDay,
        'is_open' => true,
    ]);

    $futureSchedule = CourierSchedule::factory()->create([
        'outlet_id' => $this->outlet->id,
        'day_of_week' => $futureDay,
        'type' => 'pickup',
    ]);

    $payload = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'cod',
        'pickupType' => 'courier',
        'customerAddressId' => $this->address->id,
        'pickupScheduleId' => $futureSchedule->id,
        'pickupDate' => $futureDate->format('Y-m-d'),
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
        ],
    ];

    $response = $this->postJson('/api/mobile/customer/orders', $payload);

    $response->assertStatus(201);

    $order = Order::first();
    expect(Carbon::parse($order->pickup_schedule)->format('Y-m-d'))->toBe($futureDate->format('Y-m-d'));
});

it('fails without required fields', function () {
    actingAsCustomerAccount($this->customerAccount);

    $response = $this->postJson('/api/mobile/customer/orders', []);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['customerAccountId', 'outletId', 'pickupType', 'deliveryType', 'orderItems']);
});

it('fails when courier pickup without address', function () {
    actingAsCustomerAccount($this->customerAccount);

    $payload = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'cod',
        'pickupType' => 'courier',
        'pickupScheduleId' => $this->pickupSchedule->id,
        'pickupDate' => now()->format('Y-m-d'),
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
        ],
    ];

    $response = $this->postJson('/api/mobile/customer/orders', $payload);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['customerAddressId']);
});

it('fails when courier pickup without schedule', function () {
    actingAsCustomerAccount($this->customerAccount);

    $payload = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'cod',
        'pickupType' => 'courier',
        'customerAddressId' => $this->address->id,
        'pickupDate' => now()->format('Y-m-d'),
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
        ],
    ];

    $response = $this->postJson('/api/mobile/customer/orders', $payload);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['pickupScheduleId']);
});

it('fails when courier pickup without pickupDate', function () {
    actingAsCustomerAccount($this->customerAccount);

    $payload = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'cod',
        'pickupType' => 'courier',
        'customerAddressId' => $this->address->id,
        'pickupScheduleId' => $this->pickupSchedule->id,
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
        ],
    ];

    $response = $this->postJson('/api/mobile/customer/orders', $payload);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['pickupDate']);
});

it('fails when pickupDate is in the past', function () {
    actingAsCustomerAccount($this->customerAccount);

    $payload = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'cod',
        'pickupType' => 'courier',
        'customerAddressId' => $this->address->id,
        'pickupScheduleId' => $this->pickupSchedule->id,
        'pickupDate' => now()->subDay()->format('Y-m-d'),
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
        ],
    ];

    $response = $this->postJson('/api/mobile/customer/orders', $payload);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['pickupDate']);
});

it('fails when orderItems is empty', function () {
    actingAsCustomerAccount($this->customerAccount);

    $payload = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'cod',
        'pickupType' => 'self_pickup',
        'deliveryType' => 'pickup',
        'orderItems' => [],
    ];

    $response = $this->postJson('/api/mobile/customer/orders', $payload);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['orderItems']);
});

it('fails when unauthenticated', function () {
    $payload = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'cod',
        'pickupType' => 'self_pickup',
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
        ],
    ];

    $response = $this->postJson('/api/mobile/customer/orders', $payload);

    $response->assertStatus(401);
});

it('creates self drop-off order successfully when courier is disabled', function () {
    actingAsCustomerAccount($this->customerAccount);

    $this->courierSetting->update(['is_courier_enabled' => false]);

    $payload = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => null,
        'pickupType' => 'self_dropoff',
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
        ],
    ];

    $response = $this->postJson('/api/mobile/customer/orders', $payload);

    $response->assertStatus(201);

    $order = Order::first();
    expect($order)->not->toBeNull();
    expect($order->status)->toBe(Order::STATUS_PENDING_DROPOFF);
    expect($order->payment_method)->toBeNull();
    expect($order->payment_status)->toBe(Order::PAYMENT_STATUS_NOT_YET_PRICED);
    expect($order->pickup_address)->toBeNull();
    expect($order->pickup_schedule)->toBeNull();
    expect($order->pickup_fee)->toEqual(0);
});

it('fails to create courier order when courier is disabled', function () {
    actingAsCustomerAccount($this->customerAccount);

    $this->courierSetting->update(['is_courier_enabled' => false]);

    $payload = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'cod',
        'pickupType' => 'courier',
        'customerAddressId' => $this->address->id,
        'pickupScheduleId' => $this->pickupSchedule->id,
        'pickupDate' => now()->format('Y-m-d'),
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
        ],
    ];

    $response = $this->postJson('/api/mobile/customer/orders', $payload);

    $response->assertStatus(500); // or 400 depending on service exception handling, let's check
});

it('creates self drop-off order when courier is enabled', function () {
    actingAsCustomerAccount($this->customerAccount);

    $this->courierSetting->update(['is_courier_enabled' => true]);

    $payload = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => null,
        'pickupType' => 'self_dropoff',
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
        ],
    ];

    $response = $this->postJson('/api/mobile/customer/orders', $payload);

    $response->assertStatus(201);
});
