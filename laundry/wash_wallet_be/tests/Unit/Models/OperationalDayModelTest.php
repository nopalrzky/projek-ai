<?php

use App\Models\OperationalDay;
use App\Models\Outlet;
use App\Models\CourierSchedule;

describe('OperationalDay model helpers and relationships', function () {
    it('determines if the operational day is currently open', function () {
        $outlet = Outlet::factory()->create();

        $opDayClosed = OperationalDay::create([
            'outlet_id' => $outlet->id,
            'day_of_week' => 'monday',
            'is_open' => false,
            'open_time' => '08:00:00',
            'close_time' => '17:00:00',
        ]);

        expect($opDayClosed->isCurrentlyOpen())->toBeFalse();

        $opDayNoTimes = OperationalDay::create([
            'outlet_id' => $outlet->id,
            'day_of_week' => 'tuesday',
            'is_open' => true,
            'open_time' => null,
            'close_time' => null,
        ]);

        expect($opDayNoTimes->isCurrentlyOpen())->toBeFalse();

        $opDayOpen = OperationalDay::create([
            'outlet_id' => $outlet->id,
            'day_of_week' => 'wednesday',
            'is_open' => true,
            'open_time' => '00:00:00',
            'close_time' => '23:59:59',
        ]);

        expect($opDayOpen->isCurrentlyOpen())->toBeTrue();

        $opDayExpired = OperationalDay::create([
            'outlet_id' => $outlet->id,
            'day_of_week' => 'thursday',
            'is_open' => true,
            'open_time' => '00:00:00',
            'close_time' => '00:00:01',
        ]);

        expect($opDayExpired->isCurrentlyOpen())->toBeFalse();
    });

    it('has courier schedules relationship', function () {
        $outlet = Outlet::factory()->create();

        $opDay = OperationalDay::create([
            'outlet_id' => $outlet->id,
            'day_of_week' => 'monday',
            'is_open' => true,
            'open_time' => '08:00:00',
            'close_time' => '17:00:00',
        ]);

        $schedule = CourierSchedule::create([
            'outlet_id' => $outlet->id,
            'operational_day_id' => $opDay->id,
            'day_of_week' => 'monday',
            'type' => 'pickup',
            'start_time' => '09:00:00',
            'end_time' => '11:00:00',
            'is_active' => true,
        ]);

        expect($opDay->courierSchedules)->toHaveCount(1);
        expect($opDay->courierSchedules->first()->id)->toBe($schedule->id);
    });

    it('normalizes time formats for open_time and close_time', function () {
        $outlet = Outlet::factory()->create();

        $opDayShort = OperationalDay::create([
            'outlet_id' => $outlet->id,
            'day_of_week' => 'monday',
            'is_open' => true,
            'open_time' => '08:00',
            'close_time' => '22:00',
        ]);

        expect($opDayShort->open_time)->toBe('08:00:00');
        expect($opDayShort->close_time)->toBe('22:00:00');
        expect($opDayShort->getDuration())->toBe(840);
    });
});
