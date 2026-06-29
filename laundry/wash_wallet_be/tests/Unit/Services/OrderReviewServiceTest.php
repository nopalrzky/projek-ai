<?php

use App\Models\OrderReview;
use App\Models\Outlet;
use App\Models\Order;
use App\Models\CustomerAccount;
use App\Services\OrderReviewService;

beforeEach(function () {
  // nothing
});

it('returns order reviews sorted by rating asc when requested', function () {
  $outlet = Outlet::factory()->create();

  // create an order for the outlet and two reviews for that outlet
  $order1 = Order::factory()->create(['outlet_id' => $outlet->id]);
  $order2 = Order::factory()->create(['outlet_id' => $outlet->id]);
  $customer1 = CustomerAccount::create([
    'phone' => '0811111111',
    'name' => 'Alice',
    'password' => bcrypt('password'),
    'is_verified' => true,
    'is_active' => true,
  ]);

  $customer2 = CustomerAccount::create([
    'phone' => '0822222222',
    'name' => 'Bob',
    'password' => bcrypt('password'),
    'is_verified' => true,
    'is_active' => true,
  ]);

  OrderReview::create([
    'order_id' => $order1->id,
    'outlet_id' => $outlet->id,
    'customer_account_id' => $customer1->id,
    'customer_name' => 'Alice',
    'rating' => 5,
    'comment' => 'Great',
    'is_published' => true,
  ]);

  OrderReview::create([
    'order_id' => $order2->id,
    'outlet_id' => $outlet->id,
    'customer_account_id' => $customer2->id,
    'customer_name' => 'Bob',
    'rating' => 3,
    'comment' => 'Okay',
    'is_published' => true,
  ]);

  $service = new OrderReviewService(new OrderReview());

  $results = $service->getAll([
    'outletId' => $outlet->id,
    'sortBy' => 'rating',
    'sortDirection' => 'asc',
  ], 0, 0);

  expect($results)->toBeInstanceOf(Illuminate\Support\Collection::class);

  $ratings = $results->pluck('rating')->values()->all();

  expect($ratings[0])->toBe(3);
  expect($ratings[1])->toBe(5);
});
