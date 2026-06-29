<?php

use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EmployeeAuthController;
use App\Http\Controllers\Api\EmployeeFcmTokenController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderItemController;
use App\Http\Controllers\Api\OrderItemProcessController;
use App\Http\Controllers\Api\CourierScheduleController;
use App\Http\Controllers\Api\WaNotificationController;
use Illuminate\Support\Facades\Route;

Route::prefix('mobile/production')->name('mobile.production.')->group(function () {

    Route::prefix('auth')->controller(EmployeeAuthController::class)->group(function () {
        Route::post('login', 'login');
        Route::post('logout', 'logout');
        Route::get('validate', 'validateToken');
        Route::get('me', 'me');
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/fcm-token', [EmployeeFcmTokenController::class, 'store'])
            ->name('auth.fcm-token.store');
        Route::delete('/auth/fcm-token', [EmployeeFcmTokenController::class, 'destroy'])
            ->name('auth.fcm-token.destroy');

        Route::get('/dashboard', [DashboardController::class, 'indexProduction'])
            ->name('dashboard')
            ->middleware('position.permission:production.view,courier.view');

        Route::get('/orders', [OrderController::class, 'index'])
            ->name('orders.index')
            ->middleware('position.permission:production.view,courier.view');
        Route::get('/orders/{id}', [OrderController::class, 'show'])
            ->name('orders.show')
            ->whereNumber('id')
            ->middleware('position.permission:production.view,courier.view');
        Route::post('/orders/{id}/start', [OrderController::class, 'start'])
            ->name('orders.start')
            ->whereNumber('id')
            ->middleware('position.permission:production.manage');
        Route::post('/orders/{id}/complete', [OrderController::class, 'complete'])
            ->name('orders.complete')
            ->whereNumber('id')
            ->middleware('position.permission:production.manage');
        Route::post('/orders/{id}/mark-cod-paid', [OrderController::class, 'markCodPaid'])
            ->name('orders.mark_cod_paid')
            ->whereNumber('id')
            ->middleware('position.permission:payment.manage');

        Route::get('/orders/{orderId}/wa-notification-preview', [WaNotificationController::class, 'preview'])
            ->name('orders.wa-notification-preview')
            ->whereNumber('orderId')
            ->middleware('position.permission:courier.view,courier.manage');

        Route::post('/orders/{orderId}/send-wa-notification', [WaNotificationController::class, 'send'])
            ->name('orders.send-wa-notification')
            ->whereNumber('orderId')
            ->middleware('position.permission:courier.manage');

        Route::post('/orders/{id}/pickup', [OrderController::class, 'pickup'])
            ->name('orders.pickup')
            ->whereNumber('id')
            ->middleware('position.permission:courier.manage');
        Route::post('/orders/{id}/confirm-pickup', [OrderController::class, 'confirmPickup'])
            ->name('orders.confirm-pickup')
            ->whereNumber('id')
            ->middleware('position.permission:courier.manage');
        Route::post('/orders/{id}/confirm-arrived', [OrderController::class, 'confirmArrived'])
            ->name('orders.confirm-arrived')
            ->whereNumber('id')
            ->middleware('position.permission:courier.manage');

        Route::prefix('courier')->name('courier.')->group(function () {
            Route::get('/orders', [OrderController::class, 'index'])
                ->name('orders')
                ->middleware('position.permission:courier.view,aggregate');
            Route::post('/orders/{id}/pickup', [OrderController::class, 'pickup'])
                ->name('orders.pickup')
                ->whereNumber('id')
                ->middleware('position.permission:courier.manage');
            Route::post('/orders/{id}/confirm-pickup', [OrderController::class, 'confirmPickup'])
                ->name('orders.confirm-pickup')
                ->whereNumber('id')
                ->middleware('position.permission:courier.manage');
            Route::post('/orders/{id}/confirm-arrived', [OrderController::class, 'confirmArrived'])
                ->name('orders.confirm-arrived')
                ->whereNumber('id')
                ->middleware('position.permission:courier.manage');
            Route::get('/schedules', [CourierScheduleController::class, 'index'])
                ->name('schedules')
                ->middleware('position.permission:courier.view,aggregate');
        });

        Route::get('/order-items', [OrderItemController::class, 'index'])
            ->name('order-items.index')
            ->middleware('position.permission:production.view');
        Route::get('/order-items/{id}', [OrderItemController::class, 'show'])
            ->name('order-items.show')
            ->whereNumber('id')
            ->middleware('position.permission:production.view');
        Route::post('/order-items/{id}/start', [OrderItemController::class, 'start'])
            ->name('order-items.start')
            ->whereNumber('id')
            ->middleware('position.permission:production.manage');
        Route::post('/order-items/{id}/complete', [OrderItemController::class, 'complete'])
            ->name('order-items.complete')
            ->whereNumber('id')
            ->middleware('position.permission:production.manage');

        Route::post('/order-item-processes/{id}/start', [OrderItemProcessController::class, 'start'])
            ->name('order-item-processes.start')
            ->whereNumber('id')
            ->middleware('position.permission:production.manage');
        Route::post('/order-item-processes/{id}/complete', [OrderItemProcessController::class, 'complete'])
            ->name('order-item-processes.complete')
            ->whereNumber('id')
            ->middleware('position.permission:production.manage');
    });
});
