<?php

use App\Models\Outlet;
use App\Models\OperationalDay;
use App\Models\CourierSchedule;
use App\Models\Order;
use App\Models\CustomerAccount;
use App\Models\User;
use App\Services\OutletService;
use App\Services\CustomerOrderService;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;


function getCourierScheduleValidationSetup(): array
{
    Role::findOrCreate('owner', 'web');
    Role::findOrCreate('super_admin', 'web');

    $owner = User::factory()->create();
    $owner->assignRole('owner');

    $outlet = Outlet::factory()->create(['owner_id' => $owner->id]);

    Auth::login($owner);

    $outletService = app(OutletService::class);
    $customerOrderService = app(CustomerOrderService::class);

    return [$owner, $outlet, $outletService, $customerOrderService];
}

describe('Courier schedule and delivery validation services', function () {
    it('rejects courier schedule creation on a closed day', function () {
        [$owner, $outlet, $outletService, $customerOrderService] = getCourierScheduleValidationSetup();

        $monday = OperationalDay::create([
            'outlet_id' => $outlet->id,
            'day_of_week' => 'monday',
            'is_open' => false,
            'open_time' => '08:00:00',
            'close_time' => '17:00:00',
        ]);

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Tidak dapat membuat jadwal kurir pada hari libur operasional outlet.');

        $outletService->storeCourierSchedule($outlet->id, [
            'dayOfWeek' => 'monday',
            'type' => 'pickup',
            'startTime' => '09:00:00',
            'endTime' => '11:00:00',
            'isActive' => true,
        ]);
    });

    it('rejects courier schedule creation outside operational hours', function () {
        [$owner, $outlet, $outletService, $customerOrderService] = getCourierScheduleValidationSetup();

        $monday = OperationalDay::create([
            'outlet_id' => $outlet->id,
            'day_of_week' => 'monday',
            'is_open' => true,
            'open_time' => '08:00:00',
            'close_time' => '17:00:00',
        ]);

        try {
            $outletService->storeCourierSchedule($outlet->id, [
                'dayOfWeek' => 'monday',
                'type' => 'pickup',
                'startTime' => '07:00:00',
                'endTime' => '10:00:00',
                'isActive' => true,
            ]);
            $this->fail('Should have thrown an exception for start time.');
        } catch (Exception $e) {
            expect($e->getMessage())->toContain('Jadwal kurir harus berada dalam rentang jam operasional outlet');
        }

        try {
            $outletService->storeCourierSchedule($outlet->id, [
                'dayOfWeek' => 'monday',
                'type' => 'pickup',
                'startTime' => '10:00:00',
                'endTime' => '18:00:00',
                'isActive' => true,
            ]);
            $this->fail('Should have thrown an exception for end time.');
        } catch (Exception $e) {
            expect($e->getMessage())->toContain('Jadwal kurir harus berada dalam rentang jam operasional outlet');
        }
    });

    it('creates courier schedule successfully within operational hours', function () {
        [$owner, $outlet, $outletService, $customerOrderService] = getCourierScheduleValidationSetup();

        $monday = OperationalDay::create([
            'outlet_id' => $outlet->id,
            'day_of_week' => 'monday',
            'is_open' => true,
            'open_time' => '08:00:00',
            'close_time' => '17:00:00',
        ]);

        $schedule = $outletService->storeCourierSchedule($outlet->id, [
            'dayOfWeek' => 'monday',
            'type' => 'pickup',
            'startTime' => '09:00:00',
            'endTime' => '11:00:00',
            'isActive' => true,
        ]);

        expect($schedule)->not->toBeNull();
        expect($schedule->operational_day_id)->toBe($monday->id);
        expect($schedule->day_of_week)->toBe('monday');
        expect($schedule->start_time->format('H:i:s'))->toBe('09:00:00');
        expect($schedule->end_time->format('H:i:s'))->toBe('11:00:00');
    });

    it('rejects delivery schedule on closed days in CustomerOrderService', function () {
        [$owner, $outlet, $outletService, $customerOrderService] = getCourierScheduleValidationSetup();

        $monday = OperationalDay::create([
            'outlet_id' => $outlet->id,
            'day_of_week' => 'monday',
            'is_open' => true,
            'open_time' => '08:00:00',
            'close_time' => '17:00:00',
        ]);

        $tuesday = OperationalDay::create([
            'outlet_id' => $outlet->id,
            'day_of_week' => 'tuesday',
            'is_open' => false,
            'open_time' => '08:00:00',
            'close_time' => '17:00:00',
        ]);

        $schedule = CourierSchedule::create([
            'outlet_id' => $outlet->id,
            'operational_day_id' => $monday->id,
            'day_of_week' => 'monday',
            'type' => 'delivery',
            'start_time' => '09:00:00',
            'end_time' => '11:00:00',
            'is_active' => true,
        ]);

        $customerAccount = CustomerAccount::create([
            'phone' => '081234567890',
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => bcrypt('password'),
            'is_verified' => true,
            'is_active' => true,
            'deposit_balance' => 1000000,
        ]);

        $order = Order::factory()->create([
            'outlet_id' => $outlet->id,
            'customer_account_id' => $customerAccount->id,
            'status' => Order::STATUS_COMPLETED,
            'total_amount' => 10000,
            'paid_amount' => 10000,
            'payment_status' => Order::PAYMENT_STATUS_PAID,
            'payment_method' => 'balance',
        ]);

        $updatedOrder = $customerOrderService->scheduleDelivery($customerAccount, $order->id, [
            'deliveryDate' => '2026-05-25',
            'courierScheduleId' => $schedule->id,
            'deliveryAddress' => 'Home address',
        ]);
        expect($updatedOrder->delivery_date->format('Y-m-d'))->toBe('2026-05-25');

        try {
            $customerOrderService->scheduleDelivery($customerAccount, $order->id, [
                'deliveryDate' => '2026-05-26',
                'courierScheduleId' => $schedule->id,
                'deliveryAddress' => 'Home address',
            ]);
            $this->fail('Should have failed to schedule delivery on closed Tuesday.');
        } catch (Exception $e) {
            expect($e->getMessage())->toContain('Outlet tutup pada hari');
        }
    });
});
