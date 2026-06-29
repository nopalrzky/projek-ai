<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Category;
use App\Models\Customer;
use App\Models\CustomerQuota;
use App\Models\CustomerSubscription;
use App\Models\Employee;
use App\Models\JournalEntry;
use App\Models\LaundryService;
use App\Models\Outlet;
use App\Models\ServicePackage;
use App\Models\ServicePackageItem;
use App\Models\User;
use App\Services\AccountingService;
use App\Services\OrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('handles full package order workflow correctly', function () {
    $owner = User::factory()->create();
    $outlet = Outlet::factory()->create(['owner_id' => $owner->id]);
    $category = Category::factory()->create(['outlet_id' => $outlet->id]);
    $employee = Employee::factory()->create(['outlet_id' => $outlet->id]);
    $customer = Customer::factory()->create();

    Account::factory()->create([
        'owner_id' => $owner->id,
        'slug' => 'package_liability',
        'is_system' => true,
        'outlet_id' => null,
    ]);
    Account::factory()->create([
        'owner_id' => $owner->id,
        'slug' => 'laundry_revenue',
        'is_system' => true,
        'outlet_id' => null,
    ]);
    Account::factory()->create([
        'owner_id' => $owner->id,
        'slug' => 'package_discount_expense',
        'is_system' => true,
        'outlet_id' => null,
    ]);
    // Cash account for outlet
    Account::factory()->create([
        'owner_id' => $owner->id,
        'outlet_id' => $outlet->id,
        'account_role' => 'cash',
        'is_transactional' => true,
    ]);

    $laundryService1 = LaundryService::factory()->create(['category_id' => $category->id, 'price' => 10000]);
    $laundryService2 = LaundryService::factory()->create(['category_id' => $category->id, 'price' => 20000]);

    $servicePackage = ServicePackage::factory()->create([
        'outlet_id' => $outlet->id,
        'name' => 'Package 1',
        'price' => 50000,
    ]);

    ServicePackageItem::factory()->create([
        'service_package_id' => $servicePackage->id,
        'laundry_service_id' => $laundryService1->id,
        'quantity' => 5,
    ]);

    ServicePackageItem::factory()->create([
        'service_package_id' => $servicePackage->id,
        'laundry_service_id' => $laundryService2->id,
        'quantity' => 2,
    ]);

    $subscription = CustomerSubscription::create([
        'customer_id' => $customer->id,
        'service_package_id' => $servicePackage->id,
        'purchase_date' => now(),
        'price_paid' => 50000.0,
        'status' => 'active',
        'subscription_code' => 'SUB001',
    ]);

    CustomerQuota::create([
        'customer_subscription_id' => $subscription->id,
        'laundry_service_id' => $laundryService1->id,
        'total_quota' => 5.0,
        'remaining_quota' => 5.0,
    ]);

    CustomerQuota::create([
        'customer_subscription_id' => $subscription->id,
        'laundry_service_id' => $laundryService2->id,
        'total_quota' => 2.0,
        'remaining_quota' => 2.0,
    ]);

    app(AccountingService::class)->recordCustomerSubscriptionSale($subscription);

    $saleJournal = JournalEntry::where('reference_type', CustomerSubscription::class)
        ->where('reference_id' ,$subscription->id)
        ->first();
    expect($saleJournal)->not->toBeNull();

    $orderService = app(OrderService::class);
    $orderData = [
        'customerId' => $customer->id,
        'employeeId' => $employee->id,
        'orderItems' => [
            [
                'laundryServiceId' => $laundryService1->id,
                'quantity' => 5,
                'isPackageUsage' => true,
                'customerSubscriptionId' => $subscription->id,
                'quotaUsed' => 5,
            ]
        ],
    ];

    $order = $orderService->store($orderData);

    expect($order->payment_status)->toBe('paid_by_package');
    expect((float)$order->paid_amount)->toBe(0.0);
    expect((float)$order->remaining_amount)->toBe(0.0);

    $quota1 = CustomerQuota::where('customer_subscription_id' ,$subscription->id)
        ->where('laundry_service_id', $laundryService1->id)
        ->first();
    expect((float)$quota1->remaining_quota)->toBe(0.0);
    $subscription->refresh();
    expect($subscription->status)->toBe('active');

    $usageJournal = JournalEntry::where('reference_type' ,'order_package_usage')
        ->where('reference_id' ,$order->id)
        ->first();
    expect($usageJournal)->not->toBeNull();

    $orderData2 = [
        'customerId' => $customer->id,
        'employeeId' => $employee->id,
        'orderItems' => [
            [
                'laundryServiceId' => $laundryService2->id,
                'quantity' => 2,
                'isPackageUsage' => true,
                'customerSubscriptionId' => $subscription->id,
                'quotaUsed' => 2,
            ]
        ],
    ];

    $orderService->store($orderData2);

    $subscription->refresh();
    expect($subscription->status)->toBe('exhausted');
});

it('handles hybrid order (package + cash) correctly', function () {
    $owner = User::factory()->create();
    $outlet = Outlet::factory()->create(['owner_id' => $owner->id]);
    $category = Category::factory()->create(['outlet_id' => $outlet->id]);
    $employee = Employee::factory()->create(['outlet_id' => $outlet->id]);
    $customer = Customer::factory()->create();

    Account::factory()->create(['owner_id' => $owner->id, 'slug' => 'package_liability', 'is_system' => true]);
    Account::factory()->create(['owner_id' => $owner->id, 'slug' => 'laundry_revenue', 'is_system' => true]);
    Account::factory()->create(['owner_id' => $owner->id, 'slug' => 'package_discount_expense', 'is_system' => true]);
    Account::factory()->create(['owner_id' => $owner->id, 'outlet_id' => $outlet->id, 'account_role' => 'cash', 'is_transactional' => true]);

    $laundryService1 = LaundryService::factory()->create(['category_id' => $category->id, 'price' => 10000]);
    $laundryService2 = LaundryService::factory()->create(['category_id' => $category->id, 'price' => 20000]);

    $servicePackage = ServicePackage::factory()->create(['outlet_id' => $outlet->id, 'name' => 'Hybrid Package', 'price' => 50000]);
    ServicePackageItem::factory()->create(['service_package_id' => $servicePackage->id, 'laundry_service_id' => $laundryService1->id, 'quantity' => 5]);

    $subscription = CustomerSubscription::create([
        'customer_id' => $customer->id, 'service_package_id' => $servicePackage->id,
        'purchase_date' => now(), 'price_paid' => 50000.0, 'status' => 'active', 'subscription_code' => 'SUB_HYBRID'
    ]);

    CustomerQuota::create(['customer_subscription_id' => $subscription->id, 'laundry_service_id' => $laundryService1->id, 'total_quota' => 5.0, 'remaining_quota' => 5.0]);

    $orderService = app(OrderService::class);
    $orderData = [
        'customerId' => $customer->id,
        'employeeId' => $employee->id,
        'paymentStatus' => 'paid',
        'paymentMethod' => 'cash',
        'paidAmount' => 20000.0,
        'orderItems' => [
            [
                'laundryServiceId' => $laundryService1->id,
                'quantity' => 1,
                'isPackageUsage' => true,
                'customerSubscriptionId' => $subscription->id,
                'quotaUsed' => 1,
            ],
            [
                'laundryServiceId' => $laundryService2->id,
                'quantity' => 1,
                'isPackageUsage' => false,
            ]
        ],
    ];

    $order = $orderService->store($orderData);

    expect((float)$order->total_amount)->toBe(30000.0);
    expect((float)$order->paid_amount)->toBe(20000.0);
    expect((float)$order->remaining_amount)->toBe(0.0);
});
