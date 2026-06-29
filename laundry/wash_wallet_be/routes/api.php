<?php

use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\OrderItemController;
use App\Http\Controllers\Api\OrderItemProcessController;
use App\Http\Controllers\Api\PrintController;
use App\Http\Controllers\Api\ReferralController;
use App\Http\Controllers\Api\WaNotificationController;
use App\Http\Controllers\Api\WebhookController;
use Illuminate\Support\Facades\Route;

Route::prefix('locations')->name('locations.')->controller(LocationController::class)->group(function () {
    Route::get('/provinces', 'getProvinces')->name('provinces');
    Route::get('/regencies/{provinceId}', 'getRegencies')->name('regencies')->whereNumber('provinceId');
    Route::get('/districts/{regencyId}', 'getDistricts')->name('districts')->whereNumber('regencyId');
    Route::get('/villages/{districtId}', 'getVillages')->name('villages')->whereNumber('districtId');
    Route::get('/province/{provinceId}', 'getProvinceById')->name('province.show')->whereNumber('provinceId');
    Route::get('/regency/{regencyId}', 'getRegencyById')->name('regency.show')->whereNumber('regencyId');
});

Route::get('/referral/check', [ReferralController::class, 'checkReferralCode'])->name('referral.check');

Route::prefix('order-items')->name('order-items.')->controller(OrderItemController::class)->group(function () {
    Route::get('/', 'index')->name('index');
    Route::get('/{id}', 'show')->name('show')->whereNumber('id');
    Route::post('/{id}/start', 'start')->name('start')->whereNumber('id');
    Route::post('/{id}/complete', 'complete')->name('complete')->whereNumber('id');
});

Route::prefix('order-item-processes')->name('order-item-processes.')->controller(OrderItemProcessController::class)->group(function () {
    Route::post('/{id}/start', 'start')->name('start')->whereNumber('id');
    Route::post('/{id}/complete', 'complete')->name('complete')->whereNumber('id');
});

Route::prefix('orders/{orderId}/wa-notification')
    ->name('wa-notification.')
    ->controller(WaNotificationController::class)
    ->group(function () {
        Route::get('preview', 'preview')->name('preview');
        Route::post('send', 'send')->name('send')->middleware('idempotent');
    })->whereNumber('orderId');

Route::prefix('orders/{orderId}/print')
    ->name('print.')
    ->controller(PrintController::class)
    ->middleware('auth:sanctum')
    ->group(function () {
        Route::get('info', 'info')->name('info')->middleware('position.permission:order.view');
        Route::post('receipt', 'processReceipt')->name('receipt')->middleware(['position.permission:order.manage', 'idempotent']);
        Route::post('label', 'processLabel')->name('label')->middleware(['position.permission:order.manage', 'idempotent']);
    })->whereNumber('orderId');

require __DIR__ . '/api_mobile_cashier.php';
require __DIR__ . '/api_mobile_production.php';
require __DIR__ . '/api_mobile_customer.php';

Route::post('/webhooks/midtrans', [WebhookController::class, 'handleMidtrans'])->name('webhooks.midtrans');
