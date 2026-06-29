<?php

use App\Models\Customer;
use App\Models\Outlet;
use App\Models\User;

describe('Customer model scopes', function () {
  it('filters active and inactive customers', function () {
    Customer::factory()->create(['is_active' => true]);
    Customer::factory()->create(['is_active' => false]);

    expect(Customer::active()->count())->toBe(1);
    expect(Customer::inactive()->count())->toBe(1);
  });

  it('filters by gender, outlet and owner', function () {
    $owner = User::factory()->create();
    $ownerOutlet = Outlet::factory()->create(['owner_id' => $owner->id]);
    $otherOutlet = Outlet::factory()->create();

    Customer::factory()->create(['outlet_id' => $ownerOutlet->id, 'gender' => 'male']);
    Customer::factory()->create(['outlet_id' => $otherOutlet->id, 'gender' => 'female']);

    expect(Customer::byGender('male')->count())->toBe(1);
    expect(Customer::byOutletId($ownerOutlet->id)->count())->toBe(1);
    expect(Customer::byOwnerId($owner->id)->count())->toBe(1);
  });

  it('supports search scope and status label helper', function () {
    Customer::factory()->create([
      'name' => 'Andi Laundry',
      'phone' => '0812340001',
      'address' => 'Jl. Mawar',
      'is_active' => true,
    ]);

    expect(Customer::search('Andi')->count())->toBe(1);
    expect(Customer::search('081234')->count())->toBe(1);
    expect(Customer::search('Mawar')->count())->toBe(1);
    expect(Customer::first()->getStatusLabel())->toBe('Aktif');
  });
});
