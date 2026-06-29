<?php

use App\Models\Outlet;
use App\Models\OperationalDay;
use App\Models\CourierSchedule;
use App\Models\User;
use App\Services\OutletService;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;

function getOutletServiceTestSetup(): array
{
    Role::findOrCreate('owner', 'web');

    $owner = User::factory()->create();
    $owner->assignRole('owner');

    $outlet = Outlet::factory()->create(['owner_id' => $owner->id]);

    Auth::login($owner);

    $outletService = app(OutletService::class);

    return [$owner, $outlet, $outletService];
}

describe('OutletService courier schedule with missing operational days', function () {
    it('creates missing operational day and rejects storeCourierSchedule on that closed day', function () {
        [$owner, $outlet, $outletService] = getOutletServiceTestSetup();

        $outlet->operationalDays()->delete();
        expect($outlet->operationalDays()->where('day_of_week', 'wednesday')->exists())->toBeFalse();

        try {
            $outletService->storeCourierSchedule($outlet->id, [
                'dayOfWeek' => 'wednesday',
                'type' => 'pickup',
                'startTime' => '09:00:00',
                'endTime' => '11:00:00',
                'isActive' => true,
            ]);
            $this->fail('Should have thrown an exception because the day is closed.');
        } catch (Exception $e) {
            expect($e->getMessage())->toBe('Tidak dapat membuat jadwal kurir pada hari libur operasional outlet.');
        }
    });

    it('creates missing operational day and rejects updateCourierSchedule on that closed day', function () {
        [$owner, $outlet, $outletService] = getOutletServiceTestSetup();

        $monday = OperationalDay::create([
            'outlet_id' => $outlet->id,
            'day_of_week' => 'monday',
            'is_open' => true,
            'open_time' => '08:00:00',
            'close_time' => '17:00:00',
        ]);

        $schedule = CourierSchedule::create([
            'outlet_id' => $outlet->id,
            'operational_day_id' => $monday->id,
            'day_of_week' => 'monday',
            'type' => 'pickup',
            'start_time' => '09:00:00',
            'end_time' => '11:00:00',
            'is_active' => true,
        ]);

        $outlet->operationalDays()->where('day_of_week', 'wednesday')->delete();
        expect($outlet->operationalDays()->where('day_of_week', 'wednesday')->exists())->toBeFalse();

        try {
            $outletService->updateCourierSchedule($outlet->id, $schedule->id, [
                'dayOfWeek' => 'wednesday',
                'type' => 'pickup',
                'startTime' => '09:00:00',
                'endTime' => '11:00:00',
                'isActive' => true,
            ]);
            $this->fail('Should have thrown an exception because the day is closed.');
        } catch (Exception $e) {
            expect($e->getMessage())->toBe('Tidak dapat mengubah jadwal kurir pada hari libur operasional outlet.');
        }
    });
});
