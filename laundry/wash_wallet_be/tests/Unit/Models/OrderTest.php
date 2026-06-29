<?php

namespace Tests\Unit\Models;

use App\Models\Customer;
use App\Models\Employee;
use App\Models\Order;
use App\Models\Outlet;
use Illuminate\Foundation\Testing\RefreshDatabase;

/** @var \Tests\TestCase $this */
uses(RefreshDatabase::class);

beforeEach(function () {
    $this->outlet = Outlet::factory()->create();
    $this->employee = Employee::factory()->create(['outlet_id' => $this->outlet->id]);
    $this->customer = Customer::factory()->create(['outlet_id' => $this->outlet->id]);
});

it('generates unique order number on create', function () {
    $order = Order::create([
        'employee_id' => $this->employee->id,
        'customer_id' => $this->customer->id,
        'status' => 'requested',
        'subtotal' => 100000,
        'discount_amount' => 0,
        'tax_amount' => 0,
        'total_amount' => 100000,
        'paid_amount' => 0,
        'order_date' => now(),
        'outlet_id' => $this->outlet->id,
    ]);

    expect($order->order_number)->toMatch('/^ORD-\d{8}-\d{4}$/');
});

it('auto-calculates remaining_amount on create', function () {
    $order = Order::create([
        'employee_id' => $this->employee->id,
        'customer_id' => $this->customer->id,
        'status' => 'requested',
        'subtotal' => 100000,
        'discount_amount' => 10000,
        'tax_amount' => 9000,
        'total_amount' => 99000,
        'paid_amount' => 40000,
        'order_date' => now(),
        'outlet_id' => $this->outlet->id,
    ]);

    expect((float)$order->remaining_amount)->toBe(59000.0);
});

it('updates payment_status based on paid_amount', function () {
    $order = Order::factory()->create([
        'total_amount' => 100000,
        'paid_amount' => 0,
        'payment_status' => Order::PAYMENT_STATUS_UNPAID,
        'outlet_id' => $this->outlet->id,
    ]);

    $order->update(['paid_amount' => 50000]);
    expect($order->fresh()->payment_status)->toBe(Order::PAYMENT_STATUS_PARTIAL);

    $order->update(['paid_amount' => 100000]);
    expect($order->fresh()->payment_status)->toBe(Order::PAYMENT_STATUS_PAID);
});

it('canBeCancelled returns true for requested/accepted/picking_up', function () {
    $requested = Order::factory()->make(['status' => Order::STATUS_REQUESTED]);
    $accepted = Order::factory()->make(['status' => Order::STATUS_ACCEPTED]);
    $pickingUp = Order::factory()->make(['status' => Order::STATUS_PICKING_UP]);

    expect($requested->canBeCancelled())->toBeTrue();
    expect($accepted->canBeCancelled())->toBeTrue();
    expect($pickingUp->canBeCancelled())->toBeTrue();
});

it('canBeCancelled returns false for in_progress', function () {
    $inProgress = Order::factory()->make(['status' => Order::STATUS_IN_PROGRESS]);

    expect($inProgress->canBeCancelled())->toBeFalse();
});

it('canAcceptPayment returns true for correct status+payment_status combo', function () {
    $order = Order::factory()->make([
        'status' => Order::STATUS_READY,
        'payment_status' => Order::PAYMENT_STATUS_UNPAID,
    ]);

    expect($order->canAcceptPayment())->toBeTrue();

    // False if status not payable
    $order->status = Order::STATUS_REQUESTED;
    expect($order->canAcceptPayment())->toBeFalse();

    // False if already paid
    $order->status = Order::STATUS_READY;
    $order->payment_status = Order::PAYMENT_STATUS_PAID;
    expect($order->canAcceptPayment())->toBeFalse();
});
