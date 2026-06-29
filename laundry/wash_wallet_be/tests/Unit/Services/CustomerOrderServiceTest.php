<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Models\Outlet;
use App\Models\CustomerAccount;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OperationalDay;
use App\Models\CourierSchedule;
use App\Services\CustomerOrderService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->outlet = Outlet::factory()->create([
        'owner_id' => $this->owner->id,
        'balance' => 0,
    ]);

    $this->customerAccount = CustomerAccount::factory()->create([
        'deposit_balance' => 100000,
    ]);

    $this->customer = Customer::factory()->create([
        'customer_account_id' => $this->customerAccount->id,
        'outlet_id' => $this->outlet->id,
    ]);

    $this->order = Order::factory()->create([
        'customer_id' => $this->customer->id,
        'customer_account_id' => $this->customerAccount->id,
        'outlet_id' => $this->outlet->id,
        'total_amount' => 40000,
        'paid_amount' => 0,
        'remaining_amount' => 40000,
        'payment_status' => Order::PAYMENT_STATUS_UNPAID,
        'status' => Order::STATUS_READY,
    ]);

    $this->customerOrderService = app(CustomerOrderService::class);
});

it('pay: decrements customer balance correctly', function () {
    $this->customerOrderService->pay($this->customerAccount, $this->order->id);

    $this->customerAccount->refresh();
    expect($this->customerAccount->deposit_balance)->toEqual(60000);
});

it('pay: increments outlet balance correctly', function () {
    $this->customerOrderService->pay($this->customerAccount, $this->order->id);

    $this->outlet->refresh();
    expect($this->outlet->balance)->toEqual(40000);
});

it('pay: throws exception for insufficient balance', function () {
    $this->customerAccount->update(['deposit_balance' => 10000]);

    $this->customerOrderService->pay($this->customerAccount, $this->order->id);
})->throws(\Exception::class, 'Saldo tidak mencukupi');

it('pay: throws exception for already paid order', function () {
    $this->order->update([
        'payment_status' => Order::PAYMENT_STATUS_PAID,
    ]);

    $this->customerOrderService->pay($this->customerAccount, $this->order->id);
})->throws(\Exception::class, 'Order belum memiliki tagihan atau sudah dibayar');

it('scheduleDelivery: sets delivery_date and delivery_schedule', function () {
    $this->order->update([
        'status' => Order::STATUS_COMPLETED,
        'payment_method' => 'cod',
    ]);

    $deliveryDate = now()->addDay();
    $dayOfWeek = strtolower($deliveryDate->format('l'));

    $opDay = OperationalDay::factory()->create([
        'outlet_id' => $this->outlet->id,
        'day_of_week' => $dayOfWeek,
        'is_open' => true,
    ]);

    $deliverySchedule = CourierSchedule::factory()->create([
        'outlet_id' => $this->outlet->id,
        'operational_day_id' => $opDay->id,
        'day_of_week' => $dayOfWeek,
        'type' => 'delivery',
    ]);

    $data = [
        'courierScheduleId' => $deliverySchedule->id,
        'deliveryDate' => $deliveryDate->format('Y-m-d'),
        'deliveryAddress' => 'Jalan Menteng No. 5',
    ];

    $updatedOrder = $this->customerOrderService->scheduleDelivery($this->customerAccount, $this->order->id, $data);

    expect(Carbon::parse($updatedOrder->delivery_date)->format('Y-m-d'))->toBe($deliveryDate->format('Y-m-d'));
    expect($updatedOrder->delivery_address)->toBe('Jalan Menteng No. 5');
});

it('scheduleDelivery: throws exception when outlet is closed', function () {
    $this->order->update([
        'status' => Order::STATUS_COMPLETED,
        'payment_method' => 'cod',
    ]);

    $deliveryDate = now()->addDay();
    $dayOfWeek = strtolower($deliveryDate->format('l'));

    $opDay = OperationalDay::factory()->create([
        'outlet_id' => $this->outlet->id,
        'day_of_week' => $dayOfWeek,
        'is_open' => false,
    ]);

    $deliverySchedule = CourierSchedule::factory()->create([
        'outlet_id' => $this->outlet->id,
        'operational_day_id' => $opDay->id,
        'day_of_week' => $dayOfWeek,
        'type' => 'delivery',
    ]);

    $data = [
        'courierScheduleId' => $deliverySchedule->id,
        'deliveryDate' => $deliveryDate->format('Y-m-d'),
    ];

    $this->customerOrderService->scheduleDelivery($this->customerAccount, $this->order->id, $data);
})->throws(\Exception::class, 'Outlet tutup');

it('scheduleDelivery: throws exception for incomplete order', function () {
    $this->order->update([
        'status' => Order::STATUS_IN_PROGRESS,
    ]);

    $deliveryDate = now()->addDay();
    $dayOfWeek = strtolower($deliveryDate->format('l'));

    $opDay = OperationalDay::factory()->create([
        'outlet_id' => $this->outlet->id,
        'day_of_week' => $dayOfWeek,
        'is_open' => true,
    ]);

    $deliverySchedule = CourierSchedule::factory()->create([
        'outlet_id' => $this->outlet->id,
        'operational_day_id' => $opDay->id,
        'day_of_week' => $dayOfWeek,
        'type' => 'delivery',
    ]);

    $data = [
        'courierScheduleId' => $deliverySchedule->id,
        'deliveryDate' => $deliveryDate->format('Y-m-d'),
    ];

    $this->customerOrderService->scheduleDelivery($this->customerAccount, $this->order->id, $data);
})->throws(\Exception::class, 'Pesanan belum selesai diproduksi');

it('scheduleDelivery: throws exception for unpaid transfer order', function () {
    $this->order->update([
        'status' => Order::STATUS_COMPLETED,
        'payment_method' => 'transfer',
        'payment_status' => Order::PAYMENT_STATUS_UNPAID,
    ]);

    $deliveryDate = now()->addDay();
    $dayOfWeek = strtolower($deliveryDate->format('l'));

    $opDay = OperationalDay::factory()->create([
        'outlet_id' => $this->outlet->id,
        'day_of_week' => $dayOfWeek,
        'is_open' => true,
    ]);

    $deliverySchedule = CourierSchedule::factory()->create([
        'outlet_id' => $this->outlet->id,
        'operational_day_id' => $opDay->id,
        'day_of_week' => $dayOfWeek,
        'type' => 'delivery',
    ]);

    $data = [
        'courierScheduleId' => $deliverySchedule->id,
        'deliveryDate' => $deliveryDate->format('Y-m-d'),
    ];

    $this->customerOrderService->scheduleDelivery($this->customerAccount, $this->order->id, $data);
})->throws(\Exception::class, 'Selesaikan pembayaran terlebih dahulu');

it('getAll: returns paginated orders for customer account', function () {
    $orders = $this->customerOrderService->getAll($this->customerAccount);

    expect($orders)->not->toBeEmpty();
    expect($orders->first()->customer_account_id)->toBe($this->customerAccount->id);
});

it('getById: returns order for correct account', function () {
    $foundOrder = $this->customerOrderService->getById($this->customerAccount, $this->order->id);

    expect($foundOrder->id)->toBe($this->order->id);
});
