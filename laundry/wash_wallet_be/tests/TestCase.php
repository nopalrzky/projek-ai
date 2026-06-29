<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

/**
 * @property \App\Models\User $owner
 * @property \App\Models\Outlet $outlet
 * @property \App\Models\Category $category
 * @property \App\Models\LaundryService $service
 * @property \App\Models\CourierSetting $courierSetting
 * @property \App\Models\OperationalDay $opDay
 * @property \App\Models\CourierSchedule $pickupSchedule
 * @property \App\Models\CourierSchedule $deliverySchedule
 * @property \App\Models\CustomerAccount $customerAccount
 * @property \App\Models\CustomerAddress $address
 * @property \App\Models\Customer $customer
 * @property \App\Models\Order $order
 * @property \App\Models\Employee $employee
 * @property \App\Services\OrderService $orderService
 * @property \App\Services\CustomerOrderService $customerOrderService
 * @property \Carbon\Carbon $deliveryDate
 * @property string $deliveryDay
 * @property string $todayDay
 */
abstract class TestCase extends BaseTestCase
{
    //
}

