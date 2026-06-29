<?php

use App\Models\Outlet;
use App\Models\Feature;
use App\Models\OutletFeature;
use App\Models\OperationalDay;
use Carbon\Carbon;

describe('Outlet model helpers and features', function () {
    beforeEach(function () {
        Feature::updateOrCreate(['key' => 'outlet_activation'], [
            'name' => 'Aktivasi Outlet',
            'is_paid' => true,
            'is_active' => true,
        ]);

        Feature::updateOrCreate(['key' => 'outlet_exposure'], [
            'name' => 'Ekspos Outlet',
            'is_paid' => true,
            'is_active' => true,
        ]);

        Feature::updateOrCreate(['key' => 'free_feature'], [
            'name' => 'Fitur Gratis',
            'is_paid' => false,
            'is_active' => true,
        ]);
    });

    it('returns false for non-existent features', function () {
        $outlet = Outlet::factory()->create();
        expect($outlet->hasFeature('non_existent'))->toBeFalse();
    });

    it('returns true for free (non-paid) features without any records in outletFeatures', function () {
        $outlet = Outlet::factory()->create();
        expect($outlet->hasFeature('free_feature'))->toBeTrue();
    });

    it('returns false for paid features when there is no outletFeature record', function () {
        $outlet = Outlet::factory()->create();
        expect($outlet->hasFeature('outlet_activation'))->toBeFalse();
    });

    it('returns true for paid features when active outletFeature record exists', function () {
        $outlet = Outlet::factory()->create();
        $feature = Feature::where('key', 'outlet_activation')->first();

        $outlet->outletFeatures()->create([
            'feature_id' => $feature->id,
            'status' => OutletFeature::STATUS_ACTIVE,
            'expires_at' => now()->addDays(30),
        ]);

        expect($outlet->hasFeature('outlet_activation'))->toBeTrue();
        expect($outlet->getActivationFeature())->not->toBeNull();
        expect($outlet->getActivationFeature()->feature_id)->toBe($feature->id);
    });

    it('correctly handles exposure feature activation and expiration', function () {
        $outlet = Outlet::factory()->create();
        $feature = Feature::where('key', 'outlet_exposure')->first();

        expect($outlet->hasActiveExposure())->toBeFalse();
        expect($outlet->isExposureExpired())->toBeFalse();

        $outletFeature = $outlet->outletFeatures()->create([
            'feature_id' => $feature->id,
            'status' => OutletFeature::STATUS_ACTIVE,
            'expires_at' => now()->addDays(15),
        ]);

        expect($outlet->hasActiveExposure())->toBeTrue();
        expect($outlet->isExposureExpired())->toBeFalse();

        $outletFeature->update([
            'status' => OutletFeature::STATUS_EXPIRED,
            'expires_at' => now()->subDays(1),
        ]);

        expect($outlet->hasActiveExposure())->toBeFalse();
        expect($outlet->isExposureExpired())->toBeTrue();
    });

    it('correctly scopes exposure and hasExposure queries', function () {
        $outlet = Outlet::factory()->create();
        $feature = Feature::where('key', 'outlet_exposure')->first();

        expect(Outlet::exposure()->count())->toBe(0);
        expect(Outlet::hasExposure()->count())->toBe(0);

        $outlet->outletFeatures()->create([
            'feature_id' => $feature->id,
            'status' => OutletFeature::STATUS_ACTIVE,
            'expires_at' => now()->addDays(30),
        ]);

        expect(Outlet::exposure()->count())->toBe(1);
        expect(Outlet::hasExposure()->count())->toBe(1);
        expect(Outlet::exposure()->first()->id)->toBe($outlet->id);
    });
});

describe('Outlet model operational day helpers', function () {
    afterEach(function () {
        Carbon::setTestNow();
    });

    it('correctly determines if currently open', function () {
        Carbon::setTestNow('2026-05-25 10:00:00'); // Monday
        $outlet = Outlet::factory()->create();

        // No operational day setup yet
        expect($outlet->isCurrentlyOpen())->toBeFalse();

        // Create Monday closed
        $mondayClosed = OperationalDay::create([
            'outlet_id' => $outlet->id,
            'day_of_week' => 'monday',
            'is_open' => false,
            'open_time' => '08:00:00',
            'close_time' => '17:00:00',
        ]);

        expect($outlet->isCurrentlyOpen())->toBeFalse();

        // Update to open but outside hours (it's 10:00:00, so let's set close_time to 09:00:00)
        $mondayClosed->update([
            'is_open' => true,
            'open_time' => '08:00:00',
            'close_time' => '09:00:00',
        ]);
        expect($outlet->isCurrentlyOpen())->toBeFalse();

        // Update to open and inside hours
        $mondayClosed->update([
            'close_time' => '17:00:00',
        ]);
        expect($outlet->isCurrentlyOpen())->toBeTrue();
    });

    it('gets today operational day', function () {
        Carbon::setTestNow('2026-05-25 10:00:00'); // Monday
        $outlet = Outlet::factory()->create();

        expect($outlet->getTodayOperationalDay())->toBeNull();

        $monday = OperationalDay::create([
            'outlet_id' => $outlet->id,
            'day_of_week' => 'monday',
            'is_open' => true,
            'open_time' => '08:00:00',
            'close_time' => '17:00:00',
        ]);

        // Non-eager-loaded relation
        expect($outlet->getTodayOperationalDay())->not->toBeNull();
        expect($outlet->getTodayOperationalDay()->id)->toBe($monday->id);

        // Eager-loaded relation
        $outletWithRelation = Outlet::with('operationalDays')->find($outlet->id);
        expect($outletWithRelation->getTodayOperationalDay())->not->toBeNull();
        expect($outletWithRelation->getTodayOperationalDay()->id)->toBe($monday->id);
    });

    it('gets next open day', function () {
        Carbon::setTestNow('2026-05-25 10:00:00'); // Monday
        $outlet = Outlet::factory()->create();

        // No days
        expect($outlet->getNextOpenDay())->toBeNull();

        // Create days
        $monday = OperationalDay::create([
            'outlet_id' => $outlet->id,
            'day_of_week' => 'monday',
            'is_open' => true,
        ]);
        $tuesday = OperationalDay::create([
            'outlet_id' => $outlet->id,
            'day_of_week' => 'tuesday',
            'is_open' => false,
        ]);
        $wednesday = OperationalDay::create([
            'outlet_id' => $outlet->id,
            'day_of_week' => 'wednesday',
            'is_open' => true,
        ]);

        // Next open day after Monday should be Wednesday since Tuesday is closed
        $nextOpen = $outlet->getNextOpenDay();
        expect($nextOpen)->not->toBeNull();
        expect($nextOpen->day_of_week)->toBe('wednesday');

        // If today is Wednesday, next open day wraps around to Monday
        Carbon::setTestNow('2026-05-27 10:00:00'); // Wednesday
        $nextOpenWrap = $outlet->getNextOpenDay();
        expect($nextOpenWrap)->not->toBeNull();
        expect($nextOpenWrap->day_of_week)->toBe('monday');
    });
});
