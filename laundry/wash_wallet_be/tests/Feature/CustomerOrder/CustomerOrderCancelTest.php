<?php

namespace Tests\Feature\CustomerOrder;

use App\Models\User;
use App\Models\Outlet;
use App\Models\CustomerAccount;
use App\Models\Customer;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use function Pest\Laravel\postJson;

/** @var \Tests\TestCase $this */
uses(RefreshDatabase::class);


function customerOrderCancelSetup(): array
{
    $owner = User::factory()->create();
    $outlet = Outlet::factory()->create(['owner_id' => $owner->id]);

    $customerAccount = CustomerAccount::factory()->create();
    $customer = Customer::factory()->create([
        'customer_account_id' => $customerAccount->id,
        'outlet_id' => $outlet->id,
    ]);

    $order = Order::factory()->create([
        'customer_id' => $customer->id,
        'customer_account_id' => $customerAccount->id,
        'outlet_id' => $outlet->id,
        'status' => Order::STATUS_REQUESTED,
    ]);

    return [$owner, $outlet, $customerAccount, $customer, $order];
}

it('cancels requested order', function () {
    [,, $customerAccount,, $order] = customerOrderCancelSetup();

    actingAsCustomerAccount($customerAccount);

    $response = postJson("/api/mobile/customer/orders/{$order->id}/cancel");

    $response->assertStatus(200);
    $response->assertJsonPath('data.status', Order::STATUS_CANCELLED);

    $order->refresh();
    expect($order->status)->toBe(Order::STATUS_CANCELLED);
});

it('fails to cancel order that is already in progress', function () {
    [,, $customerAccount,, $order] = customerOrderCancelSetup();

    $order->update([
        'status' => Order::STATUS_IN_PROGRESS,
    ]);

    actingAsCustomerAccount($customerAccount);

    $response = postJson("/api/mobile/customer/orders/{$order->id}/cancel");

    $response->assertStatus(500);
});
