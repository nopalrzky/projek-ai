<?php

use App\Models\Customer;
use App\Models\Outlet;
use App\Models\User;
use App\Services\CustomerService;
use App\Services\CustomerSubscriptionService;
use App\Services\MembershipContractService;
use App\Services\MembershipPlanService;
use App\Services\OutletService;
use App\Services\ServicePackageService;
use Illuminate\Pagination\LengthAwarePaginator;

function customerPaginator(Customer $customer): LengthAwarePaginator
{
  return new LengthAwarePaginator(collect([$customer]), 1, 15, 1);
}

describe('Web CustomerController', function () {
  it('redirects guest from customers index', function () {
    \Pest\Laravel\get(route('customers.index'))
      ->assertRedirect(route('login'));
  });

  it('renders customers index for authenticated user', function () {
    /** @var User $user */
    $user = User::factory()->create();
    \Pest\Laravel\actingAs($user);

    $outlet = Outlet::factory()->create(['owner_id' => $user->id]);
    $customer = Customer::factory()->create(['outlet_id' => $outlet->id]);

    $customerService = \Mockery::mock(CustomerService::class);
    $customerService->shouldReceive('getAll')->once()->andReturn(customerPaginator($customer));
    $customerService->shouldReceive('getStats')->once()->andReturnUsing(fn() => ['totalCustomers' => 1]);

    $outletService = \Mockery::mock(OutletService::class);
    $outletService->shouldReceive('getAll')->once()->andReturn(collect([$outlet]));

    app()->instance(CustomerService::class, $customerService);
    app()->instance(OutletService::class, $outletService);
    app()->instance(MembershipContractService::class, \Mockery::mock(MembershipContractService::class));
    app()->instance(MembershipPlanService::class, \Mockery::mock(MembershipPlanService::class));
    app()->instance(CustomerSubscriptionService::class, \Mockery::mock(CustomerSubscriptionService::class));
    app()->instance(ServicePackageService::class, \Mockery::mock(ServicePackageService::class));

    \Pest\Laravel\get(route('customers.index'))
      ->assertOk()
      ->assertSee('Dashboard\/Customers\/Index', false);
  });

  it('redirects to customers index when show fails', function () {
    /** @var User $user */
    $user = User::factory()->create();
    \Pest\Laravel\actingAs($user);

    $customerService = \Mockery::mock(CustomerService::class);
    $customerService->shouldReceive('getById')->once()->andThrow(new Exception('not found'));

    app()->instance(CustomerService::class, $customerService);
    app()->instance(MembershipContractService::class, \Mockery::mock(MembershipContractService::class));
    app()->instance(MembershipPlanService::class, \Mockery::mock(MembershipPlanService::class));
    app()->instance(CustomerSubscriptionService::class, \Mockery::mock(CustomerSubscriptionService::class));
    app()->instance(OutletService::class, \Mockery::mock(OutletService::class));
    app()->instance(ServicePackageService::class, \Mockery::mock(ServicePackageService::class));

    \Pest\Laravel\get(route('customers.show', 999))
      ->assertRedirect(route('customers.index'))
      ->assertSessionHas('error');
  });
});
