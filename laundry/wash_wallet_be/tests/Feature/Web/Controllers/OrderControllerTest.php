<?php

use App\Models\Customer;
use App\Models\Employee;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\User;
use App\Services\CustomerService;
use App\Services\EmployeeService;
use App\Services\OrderService;
use App\Services\OutletService;
use Illuminate\Pagination\LengthAwarePaginator;

function orderPaginator(Order $order): LengthAwarePaginator
{
  return new LengthAwarePaginator(collect([$order]), 1, 15, 1);
}

describe('Web OrderController', function () {
  it('redirects guest from orders index', function () {
    \Pest\Laravel\get(route('orders.index'))
      ->assertRedirect(route('login'));
  });

  it('renders orders index for authenticated user', function () {
    /** @var User $user */
    $user = User::factory()->create();
    \Pest\Laravel\actingAs($user);

    $outlet = Outlet::factory()->create(['owner_id' => $user->id]);
    $employee = Employee::factory()->create(['outlet_id' => $outlet->id]);
    $customer = Customer::factory()->create(['outlet_id' => $outlet->id]);
    $order = Order::factory()->create([
      'employee_id' => $employee->id,
      'customer_id' => $customer->id,
    ]);

    $orderService = \Mockery::mock(OrderService::class);
    $orderService->shouldReceive('getAll')->once()->andReturn(orderPaginator($order));
    $orderService->shouldReceive('getStats')->andReturnUsing(fn() => ['totalOrders' => 1]);

    $outletService = \Mockery::mock(OutletService::class);
    $outletService->shouldReceive('getAll')->andReturn(collect([$outlet]));

    $customerService = \Mockery::mock(CustomerService::class);
    $customerService->shouldReceive('getAll')->andReturn(collect([$customer]));

    $employeeService = \Mockery::mock(EmployeeService::class);
    $employeeService->shouldReceive('getAll')->andReturn(collect([$employee]));

    app()->instance(OrderService::class, $orderService);
    app()->instance(OutletService::class, $outletService);
    app()->instance(CustomerService::class, $customerService);
    app()->instance(EmployeeService::class, $employeeService);

    \Pest\Laravel\get(route('orders.index'))
      ->assertOk()
      ->assertSee('Dashboard\/Orders\/Index', false);
  });

  it('redirects to orders index when show fails', function () {
    /** @var User $user */
    $user = User::factory()->create();
    \Pest\Laravel\actingAs($user);

    $orderService = \Mockery::mock(OrderService::class);
    $orderService->shouldReceive('getById')->once()->andThrow(new Exception('not found'));

    app()->instance(OrderService::class, $orderService);

    \Pest\Laravel\get(route('orders.show', 999))
      ->assertRedirect(route('orders.index'))
      ->assertSessionHas('error');
  });
});
