<?php

use App\Http\Controllers\Api\CustomerAddressController;
use App\Http\Controllers\Api\CustomerAuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\OutletController;
use App\Http\Controllers\Api\CourierScheduleController;
use App\Http\Controllers\Api\CourierSettingController;
use App\Http\Controllers\Api\CustomerTopupController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderReviewController;
use Illuminate\Support\Facades\Route;

Route::prefix('mobile/customer')->name('mobile.customer.')->group(function () {
    Route::prefix('addresses')->name('addresses.')->controller(CustomerAddressController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id');
        Route::post('/', 'store')->name('store');
        Route::match(['put', 'patch'], '/{id}', 'update')->name('update')->whereNumber('id');
        Route::delete('/{id}', 'destroy')->name('destroy')->whereNumber('id');
    });

    Route::prefix('auth')->name('auth.')->controller(CustomerAuthController::class)->group(function () {
        Route::post('/otp/request', 'requestOtp')->name('otp.request');
        Route::post('/otp/verify', 'verifyOtp')->name('otp.verify');
        Route::post('/register', 'register')->name('register');
        Route::post('/login-password', 'loginWithPassword')->middleware('throttle:10,1')->name('login-password');
        Route::get('/me', 'me')->name('me');
        Route::post('/logout', 'logout')->name('logout');
        Route::post('/fcm-token', 'updateFcmToken')->name('fcm-token');
        Route::post('/set-password', 'setPassword')->name('set-password');
        Route::patch('/profile', 'updateProfile')->name('profile.update');
    });

    Route::prefix('courier-settings/{outletId}')->name('courier-settings.')->controller(CourierSettingController::class)->group(function () {
        Route::get('/calculate-fee', 'calculateFee')->name('calculate-fee');
        Route::get('/', 'show')->name('show')->whereNumber('outletId');
    });

    Route::prefix('courier-schedules')->name('courier-schedules.')->controller(CourierScheduleController::class)->group(function () {
        Route::get('/', 'index')->name('index');
    });

    Route::prefix('dashboard')->name('dashboard.')->controller(DashboardController::class)->group(function () {
        Route::get('/home', 'indexCustomer')->name('home');
    });

    Route::prefix('orders')
        ->name('orders.')
        ->controller(OrderController::class)
        ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::post('/', 'storeByCustomer')->name('store');
            Route::get('/{id}', 'show')->name('show')->whereNumber('id');
            Route::post('/{id}/cancel', 'cancel')->name('cancel')->whereNumber('id');
            Route::post('/{id}/pay', 'pay')->name('pay')->whereNumber('id');
            Route::post('/{id}/schedule-delivery', 'scheduleDelivery')->name('schedule_delivery')->whereNumber('id');
            Route::post('/{id}/complete', 'userComplete')->name('complete')->whereNumber('id');
            Route::post('/{id}/review', 'review')->name('review')->whereNumber('id');
        });

    Route::prefix('outlets')->name('outlets.')->controller(OutletController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/nearby', 'nearby')->name('nearby');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id');
    });

    Route::prefix('order-reviews')->name('order-reviews.')->controller(OrderReviewController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id');
        Route::get('/summary/{outletId}', 'orderReviewSummary')->name('summary')->whereNumber('outletId');
    });

    Route::prefix('topups')->name('topups.')->controller(CustomerTopupController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id');
    });
});
