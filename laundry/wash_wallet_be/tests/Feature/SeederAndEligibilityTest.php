<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\LaundryService;
use App\Models\Outlet;
use App\Models\Employee;
use App\Models\Position;
use App\Models\EmployeePosition;
use App\Models\EmployeeProcess;
use App\Models\EmployeeProcessCommission;
use App\Models\Process;
use App\Services\PositionService;
use App\Services\EmployeeService;

uses(RefreshDatabase::class);

it('employee is eligible for production when active and assigned produksi', function () {
    $outlet = Outlet::factory()->create();
    $employee = Employee::factory()->create(['outlet_id' => $outlet->id, 'is_active' => true]);

    $position = Position::create([
        'outlet_id' => $outlet->id,
        'name' => 'Produksi',
        'slug' => 'produksi',
        'is_active' => true,
    ]);

    EmployeePosition::create([
        'employee_id' => $employee->id,
        'position_id' => $position->id,
        'is_active' => true,
    ]);

    expect($employee->isEligibleForProduction($outlet->id))->toBeTrue();
});

it('employee is not eligible when inactive or not assigned produksi', function () {
    $outlet = Outlet::factory()->create();
    $employee = Employee::factory()->create(['outlet_id' => $outlet->id, 'is_active' => false]);

    $position = Position::create([
        'outlet_id' => $outlet->id,
        'name' => 'Produksi',
        'slug' => 'produksi',
        'is_active' => true,
    ]);

    EmployeePosition::create([
        'employee_id' => $employee->id,
        'position_id' => $position->id,
        'is_active' => true,
    ]);

    expect($employee->isEligibleForProduction($outlet->id))->toBeFalse();

    // employee active but not assigned produksi
    $employee2 = Employee::factory()->create(['outlet_id' => $outlet->id, 'is_active' => true]);
    expect($employee2->isEligibleForProduction($outlet->id))->toBeFalse();
});

it('position service creates default positions including produksi', function () {
    $outlet = Outlet::factory()->create();

    /** @var PositionService $service */
    $service = app(PositionService::class);
    $positions = $service->createDefaultPositionsForOutlet($outlet->id);

    $slugs = collect($positions)->pluck('slug')->all();
    expect($slugs)->toContain('produksi');
});

it('prevents process assignment for non-eligible employee', function () {
    $outlet = Outlet::factory()->create();
    $employee = Employee::factory()->create(['outlet_id' => $outlet->id, 'is_active' => true]);
    $process = Process::create(['name' => 'Ironing', 'description' => 'Ironing process']);

    expect(fn() => $employee->assignProcess($process->id))->toThrow(\Exception::class, 'Employee tidak memiliki posisi produksi aktif.');
});

it('prevents commission assignment for non-eligible employee', function () {
    $outlet = Outlet::factory()->create();
    $employee = Employee::factory()->create(['outlet_id' => $outlet->id, 'is_active' => true]);

    expect(fn() => $employee->setProcessCommission(1, [
        'commission_type' => 'per_item',
        'commission_value' => 5000,
    ]))->toThrow(\Exception::class, 'Employee tidak memiliki posisi produksi aktif.');
});

it('cleans up processes and commissions when production position is removed', function () {
    $outlet = Outlet::factory()->create();
    $employee = Employee::factory()->create(['outlet_id' => $outlet->id, 'is_active' => true]);

    $prodPosition = Position::create([
        'outlet_id' => $outlet->id,
        'name' => 'Produksi',
        'slug' => 'produksi',
        'is_active' => true,
    ]);

    $kasirPosition = Position::create([
        'outlet_id' => $outlet->id,
        'name' => 'Kasir',
        'slug' => 'kasir',
        'is_active' => true,
    ]);

    EmployeePosition::create([
        'employee_id' => $employee->id,
        'position_id' => $prodPosition->id,
        'is_active' => true,
    ]);

    $process = Process::create(['name' => 'Ironing', 'description' => 'Ironing process']);
    $ep = $employee->assignProcess($process->id);
    
    $employee->setProcessCommission($process->id, [
        'commission_type' => 'per_item',
        'commission_value' => 5000,
    ]);

    expect(EmployeeProcess::where('employee_id', $employee->id)->count())->toBe(1);
    expect(EmployeeProcessCommission::where('employee_process_id', $ep->id)->count())->toBe(1);

    /** @var EmployeeService $service */
    $service = app(EmployeeService::class);
    
    $service->update($employee->id, [
        'positionIds' => [$kasirPosition->id],
    ]);

    expect(EmployeeProcess::where('employee_id', $employee->id)->count())->toBe(0);
    expect(EmployeeProcessCommission::where('employee_process_id', $ep->id)->count())->toBe(0);
});

it('defaults laundry services to not support courier', function () {
    $service = LaundryService::factory()->create();

    expect($service->supports_courier)->toBeFalse();
    expect(LaundryService::supportsCourier()->whereKey($service->id)->exists())->toBeFalse();
    expect(LaundryService::notSupportsCourier()->whereKey($service->id)->exists())->toBeTrue();
});
