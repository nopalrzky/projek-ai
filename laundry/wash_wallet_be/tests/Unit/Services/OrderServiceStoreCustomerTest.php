<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Models\Outlet;
use App\Models\Category;
use App\Models\LaundryService;
use App\Models\CourierSetting;
use App\Models\OperationalDay;
use App\Models\CourierSchedule;
use App\Models\CustomerAccount;
use App\Models\CustomerAddress;
use App\Models\Customer;
use App\Models\Order;
use App\Services\OrderService;
use InvalidArgumentException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\RefreshDatabase;

/** @var \Tests\TestCase $this */
uses(RefreshDatabase::class);


beforeEach(function () {
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
        'pickup_fee' => 5000,
        'delivery_fee' => 5000,
    ]);

    $this->todayDay = strtolower(now()->format('l'));
    $this->opDay = OperationalDay::factory()->create([
        'outlet_id' => $this->outlet->id,
        'day_of_week' => $this->todayDay,
        'is_open' => true,
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

    $this->customerAccount = CustomerAccount::factory()->create();
    $this->address = CustomerAddress::factory()->create([
        'customer_account_id' => $this->customerAccount->id,
    ]);

    $this->orderService = app(OrderService::class);
});

it('creates order with courier pickup and sets pickup address from snapshot', function () {
    $data = [
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

    $order = $this->orderService->storeCustomer($data);

    expect($order)->not->toBeNull();
    expect($order->pickup_address)->toBe($this->address->getSnapshotString());
    expect($order->pickup_schedule)->not->toBeNull();
});

it('creates order with self_pickup and no pickup address', function () {
    $data = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'cod',
        'pickupType' => 'self_pickup',
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
        ],
    ];

    $order = $this->orderService->storeCustomer($data);

    expect($order->pickup_address)->toBeNull();
    expect($order->pickup_schedule)->toBeNull();
    expect($order->pickup_fee)->toEqual(0);
});

it('creates order with self_dropoff even when courier is enabled', function () {
    $this->courierSetting->update(['is_courier_enabled' => true]);

    $data = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'transfer',
        'pickupType' => 'self_dropoff',
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
        ],
    ];

    $order = $this->orderService->storeCustomer($data);

    expect($order->status)->toBe(Order::STATUS_PENDING_DROPOFF);
    expect($order->payment_method)->toBeNull();
    expect($order->pickup_address)->toBeNull();
    expect($order->pickup_schedule)->toBeNull();
    expect($order->pickup_fee)->toEqual(0);
});

it('creates customer profile via firstOrCreate when not exists', function () {
    expect(Customer::where('customer_account_id', $this->customerAccount->id)->where('outlet_id', $this->outlet->id)->exists())->toBeFalse();

    $data = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'cod',
        'pickupType' => 'self_pickup',
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
        ],
    ];

    $order = $this->orderService->storeCustomer($data);

    $customer = Customer::where('customer_account_id', $this->customerAccount->id)->where('outlet_id', $this->outlet->id)->first();
    expect($customer)->not->toBeNull();
    expect($order->customer_id)->toBe($customer->id);
});

it('reuses existing customer profile for same account+outlet', function () {
    $existingCustomer = Customer::factory()->create([
        'customer_account_id' => $this->customerAccount->id,
        'outlet_id' => $this->outlet->id,
    ]);

    $data = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'cod',
        'pickupType' => 'self_pickup',
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
        ],
    ];

    $order = $this->orderService->storeCustomer($data);

    expect($order->customer_id)->toBe($existingCustomer->id);
    expect(Customer::where('customer_account_id', $this->customerAccount->id)->where('outlet_id', $this->outlet->id)->count())->toBe(1);
});

it('sets payment_status to cod when paymentMethod is cod', function () {
    $data = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'cod',
        'pickupType' => 'self_pickup',
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
        ],
    ];

    $order = $this->orderService->storeCustomer($data);

    expect($order->payment_status)->toBe(Order::PAYMENT_STATUS_NOT_YET_PRICED);
});

it('sets payment_status to not_yet_priced when paymentMethod is transfer', function () {
    $data = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'transfer',
        'pickupType' => 'self_pickup',
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
        ],
    ];

    $order = $this->orderService->storeCustomer($data);

    expect($order->payment_status)->toBe(Order::PAYMENT_STATUS_NOT_YET_PRICED);
});

it('calculates pickup_fee from CourierSetting', function () {
    $data = [
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

    $order = $this->orderService->storeCustomer($data);

    expect($order->pickup_fee)->toEqual(5000);
});

it('creates correct order items from laundry services', function () {
    $data = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'cod',
        'pickupType' => 'self_pickup',
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
        ],
    ];

    $order = $this->orderService->storeCustomer($data);

    expect($order->orderItems)->toHaveCount(1);
    $item = $order->orderItems->first();
    expect($item->laundry_service_id)->toBe($this->service->id);
    expect($item->quantity)->toEqual(0);
});

it('throws exception when laundry service not found', function () {
    $data = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'cod',
        'pickupType' => 'self_pickup',
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => 99999],
        ],
    ];

    $this->orderService->storeCustomer($data);
})->throws(\Exception::class);

it('throws exception when customer address not owned by account', function () {
    $otherAccount = CustomerAccount::factory()->create();
    $otherAddress = CustomerAddress::factory()->create([
        'customer_account_id' => $otherAccount->id,
    ]);

    $data = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'cod',
        'pickupType' => 'courier',
        'customerAddressId' => $otherAddress->id,
        'pickupScheduleId' => $this->pickupSchedule->id,
        'pickupDate' => now()->format('Y-m-d'),
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => $this->service->id],
        ],
    ];

    $this->orderService->storeCustomer($data);
})->throws(ModelNotFoundException::class);

it('throws exception when courier order includes a service that does not support courier', function () {
    $ineligibleService = LaundryService::factory()->create([
        'category_id' => $this->category->id,
        'is_active' => true,
        'price' => 18000,
        'supports_courier' => false,
    ]);

    $data = [
        'customerAccountId' => $this->customerAccount->id,
        'outletId' => $this->outlet->id,
        'paymentMethod' => 'cod',
        'pickupType' => 'courier',
        'customerAddressId' => $this->address->id,
        'pickupScheduleId' => $this->pickupSchedule->id,
        'pickupDate' => now()->format('Y-m-d'),
        'deliveryType' => 'pickup',
        'orderItems' => [
            ['laundryServiceId' => $ineligibleService->id],
        ],
    ];

    $this->orderService->storeCustomer($data);
})->throws(InvalidArgumentException::class, 'Layanan berikut tidak mendukung kurir');
