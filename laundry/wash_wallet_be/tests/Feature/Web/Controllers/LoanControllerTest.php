<?php

use App\Models\User;
use App\Services\AccountService;
use App\Services\EmployeeService;
use App\Services\LoanService;
use App\Services\OutletService;
use Illuminate\Pagination\LengthAwarePaginator;

function emptyPaginator(): LengthAwarePaginator
{
  return new LengthAwarePaginator(collect([]), 0, 15, 1);
}

describe('Web LoanController', function () {
  it('redirects guest from loans index', function () {
    \Pest\Laravel\get(route('loans.index'))
      ->assertRedirect(route('login'));
  });

  it('renders loans index for authenticated user', function () {
    /** @var User $user */
    $user = User::factory()->create();
    \Pest\Laravel\actingAs($user);

    $loanService = \Mockery::mock(LoanService::class);
    $loanService->shouldReceive('getAll')->once()->andReturn(emptyPaginator());

    $employeeService = \Mockery::mock(EmployeeService::class);
    $employeeService->shouldReceive('getAll')->andReturn(collect([]));

    $outletService = \Mockery::mock(OutletService::class);
    $outletService->shouldReceive('getAll')->andReturn(collect([]));

    app()->instance(LoanService::class, $loanService);
    app()->instance(EmployeeService::class, $employeeService);
    app()->instance(OutletService::class, $outletService);
    app()->instance(AccountService::class, \Mockery::mock(AccountService::class));

    \Pest\Laravel\get(route('loans.index'))
      ->assertOk()
      ->assertSee('Dashboard\/Loans\/Index', false);
  });

  it('redirects to loans index when show fails', function () {
    /** @var User $user */
    $user = User::factory()->create();
    \Pest\Laravel\actingAs($user);

    $loanService = \Mockery::mock(LoanService::class);
    $loanService->shouldReceive('getById')->once()->andThrow(new Exception('not found'));

    app()->instance(LoanService::class, $loanService);
    app()->instance(EmployeeService::class, \Mockery::mock(EmployeeService::class));
    app()->instance(OutletService::class, \Mockery::mock(OutletService::class));
    app()->instance(AccountService::class, \Mockery::mock(AccountService::class));

    \Pest\Laravel\get(route('loans.show', 999))
      ->assertRedirect(route('loans.index'))
      ->assertSessionHas('error');
  });
});
