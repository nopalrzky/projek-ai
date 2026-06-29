<?php

use App\Models\Expense;
use App\Models\Outlet;
use App\Models\User;
use App\Services\AccountService;
use App\Services\ExpenseService;
use App\Services\OutletService;
use Illuminate\Pagination\LengthAwarePaginator;

function expensePaginator(Expense $expense): LengthAwarePaginator
{
  return new LengthAwarePaginator(collect([$expense]), 1, 15, 1);
}

describe('Web ExpenseController', function () {
  it('redirects guest from expenses index', function () {
    \Pest\Laravel\get(route('expenses.index'))
      ->assertRedirect(route('login'));
  });

  it('renders expenses index for authenticated user', function () {
    /** @var User $user */
    $user = User::factory()->create();
    \Pest\Laravel\actingAs($user);

    $outlet = Outlet::factory()->create(['owner_id' => $user->id]);
    $expense = Expense::factory()->create(['outlet_id' => $outlet->id]);

    $expenseService = \Mockery::mock(ExpenseService::class);
    $expenseService->shouldReceive('getAll')->once()->andReturn(expensePaginator($expense));

    $outletService = \Mockery::mock(OutletService::class);
    $outletService->shouldReceive('getAll')->once()->andReturn(collect([$outlet]));

    $accountService = \Mockery::mock(AccountService::class);
    $accountService->shouldReceive('getAccountsByOwnerId')->andReturn(collect([]));

    app()->instance(ExpenseService::class, $expenseService);
    app()->instance(OutletService::class, $outletService);
    app()->instance(AccountService::class, $accountService);

    \Pest\Laravel\get(route('expenses.index'))
      ->assertOk()
      ->assertSee('Dashboard\/Expenses\/Index', false);
  });

  it('redirects to expenses index when show fails', function () {
    /** @var User $user */
    $user = User::factory()->create();
    \Pest\Laravel\actingAs($user);

    $expenseService = \Mockery::mock(ExpenseService::class);
    $expenseService->shouldReceive('getById')->once()->andThrow(new Exception('not found'));

    app()->instance(ExpenseService::class, $expenseService);
    app()->instance(OutletService::class, \Mockery::mock(OutletService::class));
    app()->instance(AccountService::class, \Mockery::mock(AccountService::class));

    \Pest\Laravel\get(route('expenses.show', 999))
      ->assertRedirect(route('expenses.index'))
      ->assertSessionHas('error');
  });
});
