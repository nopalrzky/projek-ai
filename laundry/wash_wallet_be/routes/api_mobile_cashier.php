<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CourierScheduleController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\CustomerSubscriptionController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DepositController;
use App\Http\Controllers\Api\EmployeeAuthController;
use App\Http\Controllers\Api\EmployeeFcmTokenController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\LaundryServiceController;
use App\Http\Controllers\Api\MembershipContractController;
use App\Http\Controllers\Api\MembershipPlanController;
use App\Http\Controllers\Api\OrderContextController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OutletController;
use App\Http\Controllers\Api\PettyCashController;
use App\Http\Controllers\Api\ServicePackageController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\Api\WaNotificationController;
use Illuminate\Support\Facades\Route;

Route::prefix('mobile/cashier')->name('mobile.cashier.')->group(function () {
    Route::prefix('auth')->name('auth.')->controller(EmployeeAuthController::class)->group(function () {
        Route::post('/login', 'login')->name('login');
        Route::post('/logout', 'logout')->name('logout');
        Route::get('/validate', 'validateToken')->name('validate');
        Route::get('/me', 'me')->name('me');
        Route::post('/pin/setup', 'setupPin')->name('pin.setup')->middleware('auth:sanctum');
        Route::post('/pin/reset', 'resetPin')->name('pin.reset')->middleware('auth:sanctum');
        Route::post('/pin/verify', 'verifyPin')->name('pin.verify')->middleware('throttle:5,1');
    });

    Route::middleware('auth:sanctum')->name('auth.')->group(function () {
        Route::post('/auth/fcm-token', [EmployeeFcmTokenController::class, 'store'])->name('fcm-token.store');
        Route::delete('/auth/fcm-token', [EmployeeFcmTokenController::class, 'destroy'])->name('fcm-token.destroy');
    });

    Route::prefix('dashboard')->name('dashboard.')->controller(DashboardController::class)->group(function () {
        Route::get('/', 'indexCashier')->name('index')->middleware('position.permission:order.view');
    });

    Route::prefix('accounts')->name('accounts.')->controller(AccountController::class)->group(function () {
        Route::get('/', 'index')->name('index')->middleware('position.permission:payment.manage');
    });

    Route::prefix('outlets')->name('outlets.')->controller(OutletController::class)->middleware('auth:sanctum')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id');
    });

    Route::prefix('courier-schedules')->name('courier-schedules.')->controller(CourierScheduleController::class)->group(function () {
        Route::get('/', 'index')->name('index')->middleware('position.permission:courier.view');
        Route::post('/', 'store')->name('store')->middleware('position.permission:courier.manage');
        Route::get('/{schedule}', 'show')->name('show')->middleware('position.permission:courier.view');
        Route::put('/{schedule}', 'update')->name('update')->middleware('position.permission:courier.manage');
        Route::delete('/{schedule}', 'destroy')->name('destroy')->middleware('position.permission:courier.manage');
    });

    Route::prefix('categories')->name('categories.')->controller(CategoryController::class)->group(function () {
        Route::get('/', 'index')->name('index')->middleware('position.permission:service.view');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id')->middleware('position.permission:service.view');
        Route::post('/', 'store')->name('store')->middleware('position.permission:service.manage');
        Route::put('/{id}', 'update')->name('update')->whereNumber('id')->middleware('position.permission:service.manage');
        Route::delete('/{id}', 'destroy')->name('destroy')->whereNumber('id')->middleware('position.permission:service.manage');

        Route::prefix('{categoryId}/laundry-services')->name('laundry-services.')->group(function () {
            Route::post('/', 'storeLaundryService')->name('store')->whereNumber('categoryId')->middleware('position.permission:service.manage');
            Route::put('/{laundryServiceId}', 'updateLaundryService')->name('update')->whereNumber('categoryId')->whereNumber('laundryServiceId')->middleware('position.permission:service.manage');
            Route::delete('/{laundryServiceId}', 'destroyLaundryService')->name('destroy')->whereNumber('categoryId')->whereNumber('laundryServiceId')->middleware('position.permission:service.manage');
        });
    });

    Route::prefix('laundry-services')->name('laundry-services.')->controller(LaundryServiceController::class)->group(function () {
        Route::get('/', 'index')->name('index')->middleware('position.permission:service.view,order.manage');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id')->middleware('position.permission:service.view,order.manage');
        Route::post('/', 'store')->name('store')->middleware('position.permission:service.manage');
        Route::put('/{id}', 'update')->name('update')->whereNumber('id')->middleware('position.permission:service.manage');
        Route::delete('/{id}', 'destroy')->name('destroy')->whereNumber('id')->middleware('position.permission:service.manage');
    });

    Route::prefix('customers')->name('customers.')->controller(CustomerController::class)->group(function () {
        Route::get('/', 'index')->name('index')->middleware('position.permission:customer.view');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id')->middleware('position.permission:customer.view');
        Route::post('/', 'store')->name('store')->middleware('position.permission:customer.manage');
        Route::put('/{id}', 'update')->name('update')->whereNumber('id')->middleware('position.permission:customer.manage');
        Route::delete('/{id}', 'destroy')->name('destroy')->whereNumber('id')->middleware('position.permission:customer.manage');

        Route::prefix('{customerId}/customer-subscriptions')->name('subscriptions.')->group(function () {
            Route::post('/', 'storeCustomerSubscription')->name('store')->whereNumber('customerId')->middleware('position.permission:customer.manage');
            Route::put('/{customerSubscriptionId}', 'updateCustomerSubscription')->name('update')->whereNumber('customerId')->whereNumber('customerSubscriptionId')->middleware('position.permission:customer.manage');
        });

        Route::prefix('{customerId}/membership-contracts')->name('membership-contracts.')->group(function () {
            Route::post('/', 'storeMembershipContract')->name('store')->whereNumber('customerId')->middleware('position.permission:customer.manage');
        });
    });

    Route::prefix('customer-subscriptions')->name('customer-subscriptions.')->controller(CustomerSubscriptionController::class)->group(function () {
        Route::get('/', 'index')->name('index')->middleware('position.permission:customer.view,order.manage');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id')->middleware('position.permission:customer.view,order.manage');
        Route::post('/', 'store')->name('store')->middleware('position.permission:customer.manage');
        Route::put('/{id}', 'update')->name('update')->whereNumber('id')->middleware('position.permission:customer.manage');
        Route::delete('/{id}', 'destroy')->name('destroy')->whereNumber('id')->middleware('position.permission:customer.manage');
    });

    Route::prefix('deposits')->name('deposits.')->controller(DepositController::class)->group(function () {
        Route::get('/', 'index')->name('index')->middleware('position.permission:payment.manage');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id')->middleware('position.permission:payment.manage');
        Route::post('/', 'store')->name('store')->middleware('position.permission:payment.manage');
        Route::put('/{id}', 'update')->name('update')->whereNumber('id')->middleware('position.permission:payment.manage');
    });

    Route::prefix('employees')->name('employees.')->controller(EmployeeController::class)->middleware('auth:sanctum')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id');
        Route::put('/{id}', 'update')->name('update')->whereNumber('id');
    });

    Route::prefix('expenses')->name('expenses.')->controller(ExpenseController::class)->group(function () {
        Route::get('/', 'index')->name('index')->middleware('position.permission:payment.manage');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id')->middleware('position.permission:payment.manage');
        Route::post('/', 'store')->name('store')->middleware('position.permission:payment.manage');
        Route::put('/{id}', 'update')->name('update')->whereNumber('id')->middleware('position.permission:payment.manage');
        Route::delete('/{id}', 'destroy')->name('destroy')->whereNumber('id')->middleware('position.permission:payment.manage');
    });

    Route::prefix('membership-contracts')->name('membership-contracts.')->controller(MembershipContractController::class)->group(function () {
        Route::get('/', 'index')->name('index')->middleware('position.permission:customer.view,order.manage');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id')->middleware('position.permission:customer.view,order.manage');
    });

    Route::prefix('membership-plans')->name('membership-plans.')->controller(MembershipPlanController::class)->group(function () {
        Route::get('/', 'index')->name('index')->middleware('position.permission:customer.view');
        Route::get('/{membershipPlanId}', 'getById')->name('show')->whereNumber('membershipPlanId')->middleware('position.permission:customer.view');
    });

    Route::prefix('orders')->name('orders.')->controller(OrderController::class)->group(function () {
        Route::get('/', 'index')->name('index')->middleware('position.permission:order.view');
        Route::post('/', 'store')->name('store')->middleware(['position.permission:order.create', 'idempotent']);
        Route::get('/new-count', 'newCount')->name('new-count')->middleware('position.permission:order.view');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id')->middleware('position.permission:order.view');
        Route::put('/{orderId}', 'update')->name('update')->whereNumber('orderId')->middleware(['position.permission:order.manage', 'idempotent']);
        Route::delete('/{orderId}', 'destroy')->name('destroy')->whereNumber('orderId')->middleware('position.permission:order.manage');

        Route::get('/context/{customerId}', 'context')->name('context')->whereNumber('customerId')->middleware('position.permission:order.view');
        Route::post('/{id}/start', 'start')->name('start')->whereNumber('id')->middleware(['position.permission:order.manage', 'idempotent']);
        Route::post('/{id}/complete', 'complete')->name('complete')->whereNumber('id')->middleware(['position.permission:order.manage', 'idempotent']);
        Route::post('/{id}/accept', 'accept')->name('accept')->whereNumber('id')->middleware(['position.permission:order.manage', 'idempotent']);
        Route::post('/{id}/reject', 'reject')->name('reject')->whereNumber('id')->middleware(['position.permission:order.manage', 'idempotent']);
        Route::post('/{id}/weigh', 'weight')->name('weigh')->whereNumber('id')->middleware(['position.permission:order.manage', 'idempotent']);
        Route::post('/{id}/mark-cod-paid', 'markCodPaid')->name('mark-cod-paid')->whereNumber('id')->middleware(['position.permission:payment.manage', 'idempotent']);

        Route::get('/{orderId}/wa-notification-preview', [WaNotificationController::class, 'preview'])
            ->name('wa-notification-preview')
            ->whereNumber('orderId')
            ->middleware('position.permission:order.view');

        Route::post('/{orderId}/send-wa-notification', [WaNotificationController::class, 'send'])
            ->name('send-wa-notification')
            ->whereNumber('orderId')
            ->middleware(['position.permission:order.manage', 'idempotent']);
    });

    Route::prefix('orders/context-info')->name('orders.context-info.')->controller(OrderContextController::class)->group(function () {
        Route::get('/{customerId}', 'getOrderContext')->name('show')->whereNumber('customerId')->middleware('position.permission:order.view');
    });

    Route::prefix('petty-cashes')->name('petty-cashes.')->controller(PettyCashController::class)->group(function () {
        Route::get('/', 'index')->name('index')->middleware('position.permission:payment.manage');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id')->middleware('position.permission:payment.manage');
        Route::post('/', 'store')->name('store')->middleware('position.permission:payment.manage');
        Route::put('/{id}', 'update')->name('update')->whereNumber('id')->middleware('position.permission:payment.manage');
    });

    Route::prefix('service-packages')->name('service-packages.')->controller(ServicePackageController::class)->group(function () {
        Route::get('/', 'index')->name('index')->middleware('position.permission:service.view');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id')->middleware('position.permission:service.view');
    });

    Route::prefix('units')->name('units.')->controller(UnitController::class)->group(function () {
        Route::get('/', 'index')->name('index')->middleware('position.permission:service.view');
    });

});
