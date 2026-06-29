<?php

use App\Models\Customer;
use App\Models\Employee;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\User;
use Spatie\Permission\Models\Role;

describe('User model helpers and scopes', function () {
  beforeEach(function () {
    Role::findOrCreate('owner', 'web');
    Role::findOrCreate('super_admin', 'web');
  });

  it('resolves role and status helper methods', function () {
    $owner = User::factory()->create(['status' => User::STATUS_ACTIVE]);
    $owner->assignRole('owner');

    $admin = User::factory()->create(['status' => User::STATUS_PENDING]);
    $admin->assignRole('super_admin');

    expect($owner->isOwner())->toBeTrue();
    expect($owner->isSuperAdmin())->toBeFalse();
    expect($owner->isActive())->toBeTrue();

    expect($admin->isSuperAdmin())->toBeTrue();
    expect($admin->isPending())->toBeTrue();
    expect($admin->isInactive())->toBeFalse();
  });

  it('generates unique referral code with expected format', function () {
    $code = User::generateReferralCode();

    expect($code)->toMatch('/^[A-Z0-9]{8}$/');
  });

  it('aggregates total revenue, orders, customers, and outlets by owner', function () {
    $owner = User::factory()->create();
    $outlet = Outlet::factory()->create(['owner_id' => $owner->id]);
    $employee = Employee::factory()->create(['outlet_id' => $outlet->id]);
    $customer = Customer::factory()->create(['outlet_id' => $outlet->id, 'is_active' => true]);

    Order::factory()->create([
      'employee_id' => $employee->id,
      'customer_id' => $customer->id,
      'status' => 'delivered',
      'total_amount' => 250000,
      'paid_amount' => 250000,
    ]);

    expect(User::totalRevenue($owner->id))->toBe(250000.0);
    expect(User::totalOrders($owner->id))->toBe(1);
    expect(User::totalCustomers($owner->id))->toBe(1);
    expect(User::totalOutlets($owner->id))->toBe(1);
  });

  it('supports search scope across key identity fields', function () {
    User::factory()->create([
      'name' => 'Budi',
      'username' => 'budi_owner',
      'email' => 'budi@example.com',
      'phone' => '08122334455',
      'referral_code' => 'ABCDE123',
    ]);

    expect(User::search('Budi')->count())->toBe(1);
    expect(User::search('budi_owner')->count())->toBe(1);
    expect(User::search('ABCDE123')->count())->toBe(1);
  });

  it('calculates revenue overtime correctly', function () {
    $owner = User::factory()->create();
    $outlet = Outlet::factory()->create(['owner_id' => $owner->id]);
    $employee = Employee::factory()->create(['outlet_id' => $outlet->id]);
    $customer = Customer::factory()->create(['outlet_id' => $outlet->id, 'is_active' => true]);

    Order::factory()->create([
      'employee_id' => $employee->id,
      'customer_id' => $customer->id,
      'status' => 'delivered',
      'total_amount' => 250000,
      'paid_amount' => 250000,
      'order_date' => now()->format('Y-m-d H:i:s'),
    ]);

    $revenue = User::revenueOvertime($owner->id, 'day', 7);
    expect($revenue)->toBeArray();
    expect(count($revenue))->toBeGreaterThanOrEqual(1);
    expect($revenue[0]['revenue'])->toBe(250000.0);
  });
});
