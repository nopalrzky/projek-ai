<?php

use App\Models\CourierSchedule;
use App\Models\Employee;
use App\Models\EmployeePosition;
use App\Models\OperationalDay;
use App\Models\Position;
use App\Models\PositionPermission;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function setupPositionPermissions(Employee $employee): void
{
    $position = Position::create([
        'outlet_id' => $employee->outlet_id,
        'name' => 'Kurir Test',
        'slug' => 'kurir',
        'is_active' => true,
    ]);
    
    PositionPermission::create([
        'position_id' => $position->id,
        'permission_key' => 'courier.view',
    ]);
    
    PositionPermission::create([
        'position_id' => $position->id,
        'permission_key' => 'courier.manage',
    ]);

    EmployeePosition::create([
        'employee_id' => $employee->id,
        'position_id' => $position->id,
        'is_active' => true,
    ]);
}

test('can create courier schedule', function () {
    /** @var Employee $employee */
    $employee = Employee::factory()->create();
    setupPositionPermissions($employee);
    
    OperationalDay::factory()->create([
        'outlet_id' => $employee->outlet_id,
        'day_of_week' => 'monday',
        'is_open' => true,
        'open_time' => '08:00:00',
        'close_time' => '17:00:00',
    ]);

    $this->actingAs($employee, 'sanctum');

    $scheduleData = [
        'dayOfWeek' => 'monday',
        'startTime' => '08:00',
        'endTime' => '10:00',
        'isActive' => true,
    ];

    $response = $this->postJson('/api/mobile/cashier/courier-schedules', $scheduleData);

    $response->assertStatus(201)
        ->assertJson([
            'success' => true,
            'message' => 'Courier schedule created successfully',
        ]);

    $this->assertDatabaseHas('courier_schedules', [
        'outlet_id' => $employee->outlet_id,
        'day_of_week' => 'monday',
        'start_time' => '08:00',
        'end_time' => '10:00',
        'is_active' => true,
    ]);
});

test('prevents overlapping courier schedules', function () {
    /** @var Employee $employee */
    $employee = Employee::factory()->create();
    setupPositionPermissions($employee);
    
    OperationalDay::factory()->create([
        'outlet_id' => $employee->outlet_id,
        'day_of_week' => 'monday',
        'is_open' => true,
        'open_time' => '08:00:00',
        'close_time' => '17:00:00',
    ]);

    CourierSchedule::create([
        'outlet_id' => $employee->outlet_id,
        'operational_day_id' => OperationalDay::where('outlet_id', $employee->outlet_id)->where('day_of_week', 'monday')->first()->id,
        'day_of_week' => 'monday',
        'start_time' => '08:00',
        'end_time' => '10:00',
        'is_active' => true,
    ]);

    $this->actingAs($employee, 'sanctum');

    $overlappingData = [
        'dayOfWeek' => 'monday',
        'startTime' => '09:00',
        'endTime' => '11:00',
        'isActive' => true,
    ];

    $response = $this->postJson('/api/mobile/cashier/courier-schedules', $overlappingData);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
            'message' => 'Schedule overlaps with existing schedule',
        ]);
});

test('can get courier schedules for outlet', function () {
    /** @var Employee $employee */
    $employee = Employee::factory()->create();
    setupPositionPermissions($employee);

    CourierSchedule::create([
        'outlet_id' => $employee->outlet_id,
        'day_of_week' => 'monday',
        'start_time' => '08:00',
        'end_time' => '10:00',
        'is_active' => true,
    ]);

    $this->actingAs($employee, 'sanctum');

    $response = $this->getJson('/api/mobile/cashier/courier-schedules');

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
        ])
        ->assertJsonCount(1, 'data');
});
