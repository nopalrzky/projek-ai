<?php

use App\Models\CourierSchedule;
use App\Models\Outlet;
use App\Services\CourierScheduleService;

test('courier schedule overlap detection works correctly', function () {
    $outlet = Outlet::factory()->create();
    $courierSchedule = new CourierSchedule();
    $service = new CourierScheduleService($courierSchedule);

    CourierSchedule::create([
        'outlet_id' => $outlet->id,
        'day_of_week' => 'monday',
        'start_time' => '08:00',
        'end_time' => '10:00',
        'is_active' => true,
    ]);

    $overlaps = $service->checkOverlap($outlet->id, 'monday', '09:00', '11:00');
    expect($overlaps)->toBeTrue();

    $overlaps = $service->checkOverlap($outlet->id, 'monday', '10:00', '12:00');
    expect($overlaps)->toBeFalse();

    $overlaps = $service->checkOverlap($outlet->id, 'monday', '08:00', '10:00');
    expect($overlaps)->toBeTrue();
});

test('courier schedule validation for time works correctly', function () {
    $courierSchedule = new CourierSchedule();
    $service = new CourierScheduleService($courierSchedule);

    $isValid = $service->validateScheduleTime('08:00', '10:00');
    expect($isValid)->toBeTrue();

    $isValid = $service->validateScheduleTime('10:00', '08:00');
    expect($isValid)->toBeFalse();
});
