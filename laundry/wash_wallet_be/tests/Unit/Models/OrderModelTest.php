<?php

use App\Models\Customer;
use App\Models\Employee;
use App\Models\Order;
use App\Models\Outlet;

describe('Order model lifecycle and helpers', function () {
  it('auto-generates order_number and payment fields on create', function () {
    $outlet = Outlet::factory()->create();
    $employee = Employee::factory()->create(['outlet_id' => $outlet->id]);
    $customer = Customer::factory()->create(['outlet_id' => $outlet->id]);

    $order = Order::create([
      'employee_id' => $employee->id,
      'customer_id' => $customer->id,
      'status' => 'requested',
      'subtotal' => 100000,
      'discount_amount' => 0,
      'tax_amount' => 0,
      'total_amount' => 100000,
      'paid_amount' => 0,
      'order_date' => now(),
    ]);

    expect($order->order_number)->toMatch('/^ORD-\d{8}-\d{4}$/');
    expect((float) $order->remaining_amount)->toBe(100000.0);
    expect($order->payment_status)->toBe('unpaid');
  });

  it('recalculates payment status on update', function () {
    $order = Order::factory()->create([
      'total_amount' => 100000,
      'paid_amount' => 10000,
      'payment_status' => 'partial',
    ]);

    $order->update(['paid_amount' => 100000]);

    expect((float) $order->fresh()->remaining_amount)->toBe(0.0);
    expect($order->fresh()->payment_status)->toBe('paid');
  });

  it('sets last_status_update when status changes', function () {
    $order = Order::factory()->create(['status' => 'requested']);

    expect($order->last_status_update)->toBeInstanceOf(Carbon\Carbon::class);

    $before = $order->last_status_update;
    $order->update(['status' => 'in_progress']);

    expect($order->fresh()->last_status_update->greaterThanOrEqualTo($before))->toBeTrue();
  });

  it('exposes status helper methods correctly', function () {
    $pending = Order::factory()->make(['status' => 'requested']);
    $delivered = Order::factory()->make(['status' => 'delivered']);
    $cancelled = Order::factory()->make(['status' => 'cancelled']);

    expect($pending->canBeEdited())->toBeTrue();
    expect($pending->canBeCancelled())->toBeTrue();
    expect($delivered->canBeDeleted())->toBeTrue();
    expect($cancelled->canBeDeleted())->toBeTrue();
    expect($pending->getStatusLabel())->toBe('Diajukan');
  });

  it('generates sequential order numbers on same day', function () {
    $outlet = Outlet::factory()->create();
    $employee = Employee::factory()->create(['outlet_id' => $outlet->id]);
    $customer = Customer::factory()->create(['outlet_id' => $outlet->id]);

    $first = Order::create([
      'employee_id' => $employee->id,
      'customer_id' => $customer->id,
      'status' => 'requested',
      'subtotal' => 100000,
      'discount_amount' => 0,
      'tax_amount' => 0,
      'total_amount' => 100000,
      'paid_amount' => 0,
      'order_date' => now(),
    ]);

    $second = Order::create([
      'employee_id' => $employee->id,
      'customer_id' => $customer->id,
      'status' => 'requested',
      'subtotal' => 100000,
      'discount_amount' => 0,
      'tax_amount' => 0,
      'total_amount' => 100000,
      'paid_amount' => 0,
      'order_date' => now(),
    ]);

    $firstSeq = (int) substr($first->order_number, -4);
    $secondSeq = (int) substr($second->order_number, -4);

    expect($secondSeq)->toBe($firstSeq + 1);
  });

  it('correctly maps special instructions array in OrderResource', function () {
    $order = Order::factory()->create([
      'special_instructions' => ['Cuci bersih', 'Setrika wangi'],
    ]);

    $resource = new \App\Http\Resources\Order\OrderResource($order);
    $data = $resource->toArray(request());

    expect($data['specialInstructions'])->toBeArray();
    expect($data['specialInstructions'])->toEqual(['Cuci bersih', 'Setrika wangi']);
  });
});
