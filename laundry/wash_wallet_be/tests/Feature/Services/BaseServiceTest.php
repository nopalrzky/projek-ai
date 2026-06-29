<?php

use App\Models\Customer;
use App\Models\Employee;
use App\Models\Outlet;
use App\Services\BaseService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class TestableBaseService extends BaseService
{
  public function applyTenant(Builder $query, string $ownerField = 'byOwnerId', string $outletField = 'byOutletId'): Builder
  {
    $this->applyTenantScope($query, $ownerField, $outletField);

    return $query;
  }

  public function doPaginate(Builder $query, ?int $perPage, ?int $page): LengthAwarePaginator|Collection
  {
    return $this->paginate($query, $perPage, $page);
  }

  public function doSort(
    Builder $query,
    string $column,
    string $direction = 'desc',
    array $allowed = [],
    array $columnMap = [],
    string $default = 'created_at'
  ): Builder {
    $this->applySort($query, $column, $direction, $allowed, $columnMap, $default);

    return $query;
  }
}

describe('BaseService shared behavior', function () {
  it('applyTenantScope handles super admin, owner, employee, and unauthenticated', function () {
    $service = new TestableBaseService();

    Customer::factory()->count(2)->create();
    $anonymousCount = $service->applyTenant(Customer::query())->count();
    expect($anonymousCount)->toBe(0);

    $owner = actingAsOwner();
    $ownerOutlet = Outlet::factory()->create(['owner_id' => $owner->id]);
    $otherOutlet = Outlet::factory()->create();

    Customer::factory()->create(['outlet_id' => $ownerOutlet->id]);
    Customer::factory()->create(['outlet_id' => $otherOutlet->id]);

    $ownerCount = $service->applyTenant(Customer::query())->count();
    expect($ownerCount)->toBe(1);

    /** @var Employee $employee */
    $employee = Employee::factory()->create(['outlet_id' => $ownerOutlet->id]);
    $position = \App\Models\Position::create([
      'outlet_id' => $ownerOutlet->id,
      'name' => 'Kurir',
      'slug' => 'kurir',
      'is_active' => true,
    ]);
    $employee->assignPosition($position->id, true);

    \Pest\Laravel\actingAs($employee, 'sanctum');
    $employeeCount = $service->applyTenant(Customer::query())->count();
    expect($employeeCount)->toBe(1);

    $superAdmin = actingAsSuperAdmin();
    \Pest\Laravel\actingAs($superAdmin, 'sanctum');
    $adminCount = $service->applyTenant(Customer::query())->count();
    expect($adminCount)->toBe(Customer::query()->count());
  });

  it('paginate returns paginator for valid page/perPage and collection otherwise', function () {
    $service = new TestableBaseService();

    Customer::factory()->count(3)->create();

    $paginated = $service->doPaginate(Customer::query(), 2, 1);
    $all = $service->doPaginate(Customer::query(), 0, 0);

    expect($paginated)->toBeInstanceOf(LengthAwarePaginator::class);
    expect($all)->toBeInstanceOf(Collection::class);
    expect($all->count())->toBe(3);
  });

  it('applySort uses allowed columns with safe fallback', function () {
    $service = new TestableBaseService();

    Customer::factory()->create(['name' => 'Zeta']);
    Customer::factory()->create(['name' => 'Alpha']);

    $asc = $service->doSort(Customer::query(), 'name', 'asc', ['name', 'createdAt'], ['createdAt' => 'created_at'])
      ->pluck('name')
      ->values()
      ->all();

    $fallback = $service->doSort(Customer::query(), 'invalidColumn', 'asc', ['name', 'createdAt'], ['createdAt' => 'created_at'], 'createdAt')
      ->get();

    expect($asc[0])->toBe('Alpha');
    expect($fallback)->not->toBeEmpty();
  });
});
