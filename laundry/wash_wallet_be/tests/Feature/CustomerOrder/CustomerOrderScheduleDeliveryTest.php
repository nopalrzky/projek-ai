<?php

namespace Tests\Feature\CustomerOrder;

use App\Models\User;
use App\Models\Outlet;
use App\Models\CustomerAccount;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OperationalDay;
use App\Models\CourierSchedule;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

/** @var \Tests\TestCase $this */
uses(RefreshDatabase::class);


beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->outlet = Outlet::factory()->create(['owner_id' => $this->owner->id]);
    
    $this->customerAccount = CustomerAccount::factory()->create();
    $this->customer = Customer::factory()->create([
        'customer_account_id' => $this->customerAccount->id,
        'outlet_id' => $this->outlet->id,
    ]);

    $this->deliveryDate = now()->addDay();
    $this->deliveryDay = strtolower($this->deliveryDate->format('l'));

    $this->opDay = OperationalDay::factory()->create([
        'outlet_id' => $this->outlet->id,
        'day_of_week' => $this->deliveryDay,
        'is_open' => true,
    ]);

    $this->deliverySchedule = CourierSchedule::factory()->create([
        'outlet_id' => $this->outlet->id,
        'operational_day_id' => $this->opDay->id,
        'day_of_week' => $this->deliveryDay,
        'type' => 'delivery',
        'start_time' => '14:00',
        'end_time' => '16:00',
        'is_active' => true,
    ]);

    $this->order = Order::factory()->create([
        'customer_id' => $this->customer->id,
        'customer_account_id' => $this->customerAccount->id,
        'outlet_id' => $this->outlet->id,
        'status' => Order::STATUS_COMPLETED,
        'payment_method' => 'transfer',
        'total_amount' => 50000,
        'paid_amount' => 50000,
        'remaining_amount' => 0,
        'payment_status' => Order::PAYMENT_STATUS_PAID,
    ]);
});

it('schedules delivery for completed paid order (transfer)', function () {
    actingAsCustomerAccount($this->customerAccount);

    $payload = [
        'courierScheduleId' => $this->deliverySchedule->id,
        'deliveryDate' => $this->deliveryDate->format('Y-m-d'),
        'deliveryAddress' => 'Jalan Kebayoran Baru No. 12',
    ];

    $response = $this->postJson("/api/mobile/customer/orders/{$this->order->id}/schedule-delivery", $payload);

    $response->assertStatus(200);


    
    $this->order->refresh();
    expect(Carbon::parse($this->order->delivery_date)->format('Y-m-d'))->toBe($this->deliveryDate->format('Y-m-d'));
    expect($this->order->delivery_address)->toBe('Jalan Kebayoran Baru No. 12');
});

it('schedules delivery for completed COD order (no payment required)', function () {
    $this->order->update([
        'payment_method' => 'cod',
        'payment_status' => Order::PAYMENT_STATUS_UNPAID,
    ]);

    actingAsCustomerAccount($this->customerAccount);

    $payload = [
        'courierScheduleId' => $this->deliverySchedule->id,
        'deliveryDate' => $this->deliveryDate->format('Y-m-d'),
    ];

    $response = $this->postJson("/api/mobile/customer/orders/{$this->order->id}/schedule-delivery", $payload);

    $response->assertStatus(200);
});

it('fails to schedule delivery for unpaid transfer order', function () {
    $this->order->update([
        'payment_method' => 'transfer',
        'payment_status' => Order::PAYMENT_STATUS_UNPAID,
    ]);

    actingAsCustomerAccount($this->customerAccount);

    $payload = [
        'courierScheduleId' => $this->deliverySchedule->id,
        'deliveryDate' => $this->deliveryDate->format('Y-m-d'),
    ];

    $response = $this->postJson("/api/mobile/customer/orders/{$this->order->id}/schedule-delivery", $payload);

    $response->assertStatus(500); // throws Exception
});

it('fails to schedule delivery when outlet is closed on that day', function () {
    $this->opDay->update(['is_open' => false]);

    actingAsCustomerAccount($this->customerAccount);

    $payload = [
        'courierScheduleId' => $this->deliverySchedule->id,
        'deliveryDate' => $this->deliveryDate->format('Y-m-d'),
    ];

    $response = $this->postJson("/api/mobile/customer/orders/{$this->order->id}/schedule-delivery", $payload);

    $response->assertStatus(500); // throws Exception
});

it('fails to schedule delivery for incomplete order', function () {
    $this->order->update([
        'status' => Order::STATUS_IN_PROGRESS,
    ]);

    actingAsCustomerAccount($this->customerAccount);

    $payload = [
        'courierScheduleId' => $this->deliverySchedule->id,
        'deliveryDate' => $this->deliveryDate->format('Y-m-d'),
    ];

    $response = $this->postJson("/api/mobile/customer/orders/{$this->order->id}/schedule-delivery", $payload);

    $response->assertStatus(500); // throws Exception
});
