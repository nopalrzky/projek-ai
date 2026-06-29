<?php

namespace Tests\Feature\CustomerOrder;

use App\Models\User;
use App\Models\Outlet;
use App\Models\CustomerAccount;
use App\Models\Customer;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;

/** @var \Tests\TestCase $this */
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
        'total_amount' => 60000,
        'paid_amount' => 0,
        'remaining_amount' => 60000,
        'payment_status' => Order::PAYMENT_STATUS_UNPAID,
        'status' => Order::STATUS_READY,
    ]);
});

it('pays order with sufficient balance', function () {
    actingAsCustomerAccount($this->customerAccount);

    $response = $this->postJson("/api/mobile/customer/orders/{$this->order->id}/pay");

    $response->assertStatus(200);
    $response->assertJsonPath('data.paymentStatus', Order::PAYMENT_STATUS_PAID);
    $response->assertJsonPath('data.paymentMethod', 'wallet_balance');

    $this->order->refresh();
    expect($this->order->payment_status)->toBe(Order::PAYMENT_STATUS_PAID);
    expect($this->order->payment_method)->toBe('wallet_balance');
    expect($this->order->paid_amount)->toEqual(60000);
    expect($this->order->remaining_amount)->toEqual(0);
});

it('fails to pay with insufficient balance', function () {
    $this->customerAccount->update(['deposit_balance' => 20000]);

    actingAsCustomerAccount($this->customerAccount);

    $response = $this->postJson("/api/mobile/customer/orders/{$this->order->id}/pay");

    $response->assertStatus(500);
});

it('fails to pay already paid order', function () {
    $this->order->update([
        'payment_status' => Order::PAYMENT_STATUS_PAID,
        'payment_method' => 'wallet_balance',
        'paid_amount' => 60000,
        'remaining_amount' => 0,
    ]);

    actingAsCustomerAccount($this->customerAccount);

    $response = $this->postJson("/api/mobile/customer/orders/{$this->order->id}/pay");

    $response->assertStatus(500);
});

it('decrements customer balance and increments outlet balance', function () {
    actingAsCustomerAccount($this->customerAccount);

    $response = $this->postJson("/api/mobile/customer/orders/{$this->order->id}/pay");

    $response->assertStatus(200);

    $this->customerAccount->refresh();
    $this->outlet->refresh();

    expect($this->customerAccount->deposit_balance)->toEqual(40000);
    expect($this->outlet->balance)->toEqual(60000);
});
