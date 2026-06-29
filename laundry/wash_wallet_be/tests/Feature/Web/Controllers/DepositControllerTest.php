<?php

use App\Models\User;
use App\Services\DepositService;
use App\Services\OutletService;
use Illuminate\Pagination\LengthAwarePaginator;

function emptyDepositPaginator(): LengthAwarePaginator
{
  return new LengthAwarePaginator(collect([]), 0, 15, 1);
}

describe('Web DepositController', function () {
  it('redirects guest from deposits index', function () {
    \Pest\Laravel\get(route('deposits.index'))
      ->assertRedirect(route('login'));
  });

  it('renders deposits index for authenticated user', function () {
    /** @var User $user */
    $user = User::factory()->create();
    \Pest\Laravel\actingAs($user);

    $depositService = \Mockery::mock(DepositService::class);
    $depositService->shouldReceive('getAll')->once()->andReturn(emptyDepositPaginator());

    $outletService = \Mockery::mock(OutletService::class);
    $outletService->shouldReceive('getAll')->andReturn(collect([]));

    app()->instance(DepositService::class, $depositService);
    app()->instance(OutletService::class, $outletService);

    \Pest\Laravel\get(route('deposits.index'))
      ->assertOk()
      ->assertSee('Dashboard\/Deposits\/Index', false);
  });

  it('redirects to deposits index when show fails', function () {
    /** @var User $user */
    $user = User::factory()->create();
    \Pest\Laravel\actingAs($user);

    $depositService = \Mockery::mock(DepositService::class);
    $depositService->shouldReceive('getById')->once()->andThrow(new Exception('not found'));

    app()->instance(DepositService::class, $depositService);
    app()->instance(OutletService::class, \Mockery::mock(OutletService::class));

    \Pest\Laravel\get(route('deposits.show', 999))
      ->assertRedirect(route('deposits.index'))
      ->assertSessionHas('error');
  });
});
