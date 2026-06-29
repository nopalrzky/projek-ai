<?php

use App\Models\User;
use App\Services\AccountService;
use App\Services\EmployeeSalaryService;
use App\Services\EmployeeService;
use App\Services\LoanService;
use App\Services\OutletService;
use App\Services\PositionService;
use App\Services\ProcessService;
use App\Services\SalaryService;
use Illuminate\Pagination\LengthAwarePaginator;

function emptyEmployeePaginator(): LengthAwarePaginator
{
  return new LengthAwarePaginator(collect([]), 0, 15, 1);
}

describe('Web EmployeeController', function () {
  it('redirects guest from employees index', function () {
    \Pest\Laravel\get(route('employees.index'))
      ->assertRedirect(route('login'));
  });

  it('renders employees index for authenticated user', function () {
    /** @var User $user */
    $user = User::factory()->create();
    \Pest\Laravel\actingAs($user);

    $employeeService = \Mockery::mock(EmployeeService::class);
    $employeeService->shouldReceive('getAll')->once()->andReturn(emptyEmployeePaginator());
    $employeeService->shouldReceive('getStats')->andReturnUsing(fn() => ['totalEmployees' => 0]);

    $outletService = \Mockery::mock(OutletService::class);
    $outletService->shouldReceive('getAll')->andReturn(collect([]));

    $positionService = \Mockery::mock(PositionService::class);
    $positionService->shouldReceive('getAll')->andReturn(collect([]));

    app()->instance(EmployeeService::class, $employeeService);
    app()->instance(OutletService::class, $outletService);
    app()->instance(PositionService::class, $positionService);
    app()->instance(AccountService::class, \Mockery::mock(AccountService::class));
    app()->instance(EmployeeSalaryService::class, \Mockery::mock(EmployeeSalaryService::class));
    app()->instance(LoanService::class, \Mockery::mock(LoanService::class));
    app()->instance(ProcessService::class, \Mockery::mock(ProcessService::class));
    app()->instance(SalaryService::class, \Mockery::mock(SalaryService::class));

    \Pest\Laravel\get(route('employees.index'))
      ->assertOk()
      ->assertSee('Dashboard\/Employees\/Index', false);
  });

  it('redirects to employees index when show fails', function () {
    /** @var User $user */
    $user = User::factory()->create();
    \Pest\Laravel\actingAs($user);

    $employeeService = \Mockery::mock(EmployeeService::class);
    $employeeService->shouldReceive('getById')->once()->andThrow(new Exception('not found'));

    app()->instance(EmployeeService::class, $employeeService);
    app()->instance(OutletService::class, \Mockery::mock(OutletService::class));
    app()->instance(PositionService::class, \Mockery::mock(PositionService::class));
    app()->instance(AccountService::class, \Mockery::mock(AccountService::class));
    app()->instance(EmployeeSalaryService::class, \Mockery::mock(EmployeeSalaryService::class));
    app()->instance(LoanService::class, \Mockery::mock(LoanService::class));
    app()->instance(ProcessService::class, \Mockery::mock(ProcessService::class));
    app()->instance(SalaryService::class, \Mockery::mock(SalaryService::class));

    \Pest\Laravel\get(route('employees.show', 999))
      ->assertRedirect(route('employees.index'))
      ->assertSessionHas('error');
  });
});
