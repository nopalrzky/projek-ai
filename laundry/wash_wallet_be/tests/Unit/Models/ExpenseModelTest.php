<?php

use App\Models\Account;
use App\Models\Expense;
use App\Models\Outlet;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

function createExpenseForOutlet(Outlet $outlet, array $overrides = []): Expense
{
  $expenseAccount = Account::query()->firstOrCreate([
    'owner_id' => $outlet->owner_id,
    'outlet_id' => $outlet->id,
    'code' => 'EXPENSE-' . $outlet->id,
  ], [
    'name' => 'Biaya Operasional',
    'owner_id' => $outlet->owner_id,
    'outlet_id' => $outlet->id,
    'type' => 'expense',
    'account_role' => 'expense',
    'is_transactional' => true,
    'is_system' => false,
    'is_active' => true,
  ]);

  $sourceAccount = Account::query()->firstOrCreate([
    'owner_id' => $outlet->owner_id,
    'outlet_id' => $outlet->id,
    'code' => 'CASH-' . $outlet->id,
  ], [
    'name' => 'Kas',
    'owner_id' => $outlet->owner_id,
    'outlet_id' => $outlet->id,
    'type' => 'asset',
    'account_role' => 'cash',
    'is_transactional' => true,
    'is_system' => false,
    'is_active' => true,
  ]);

  return Expense::factory()->create(array_merge([
    'outlet_id' => $outlet->id,
    'expense_account_id' => $expenseAccount->id,
    'source_account_id' => $sourceAccount->id,
  ], $overrides));
}

describe('Expense model scopes and helpers', function () {
  it('filters by outlet and status scopes correctly', function () {
    $owner = User::factory()->create();
    $outletA = Outlet::factory()->create(['owner_id' => $owner->id]);
    $outletB = Outlet::factory()->create();

    createExpenseForOutlet($outletA, ['status' => 'pending']);
    createExpenseForOutlet($outletA, ['status' => 'approved']);
    createExpenseForOutlet($outletB, ['status' => 'pending']);

    expect(Expense::byOutletId($outletA->id)->count())->toBe(2);
    expect(Expense::pending()->count())->toBe(2);
    expect(Expense::approved()->count())->toBe(1);
    expect(Expense::rejected()->count())->toBe(0);
  });

  it('supports amount and date range scopes', function () {
    $outlet = Outlet::factory()->create();

    createExpenseForOutlet($outlet, ['amount' => 10000, 'date' => now()->subDays(2)->toDateString()]);
    createExpenseForOutlet($outlet, ['amount' => 50000, 'date' => now()->toDateString()]);

    expect(Expense::minAmount(30000)->count())->toBe(1);
    expect(Expense::maxAmount(20000)->count())->toBe(1);
    expect(Expense::startDate(now()->subDay()->toDateString())->count())->toBe(1);
  });

  it('returns helper values and accessors correctly', function () {
    config(['filesystems.default' => 'public']);
    Storage::fake('public');
    Storage::disk('public')->put('expenses/evidence.jpg', 'x');

    $expense = Expense::factory()->make([
      'status' => 'pending',
      'attachment' => 'expenses/evidence.jpg',
      'user_id' => 1,
      'employee_id' => null,
    ]);

    expect($expense->isPending())->toBeTrue();
    expect($expense->canBeApproved())->toBeTrue();
    expect($expense->isCreatedByOwner())->toBeTrue();
    expect($expense->isCreatedByEmployee())->toBeFalse();
    expect($expense->getStatusLabel())->toBe('Menunggu Persetujuan');
    expect($expense->getStatusColor())->toBe('warning');
    expect($expense->has_attachment)->toBeTrue();
    expect($expense->attachment_url)->toContain('expenses/evidence.jpg');
  });

  it('generates expense code and computes summaries', function () {
    $outlet = Outlet::factory()->create();

    createExpenseForOutlet($outlet, [
      'code' => 'EXP-' . now()->format('Ymd') . '-0001',
      'amount' => 120000,
      'date' => now()->toDateString(),
    ]);

    createExpenseForOutlet($outlet, [
      'code' => 'EXP-' . now()->format('Ymd') . '-0002',
      'amount' => 80000,
      'date' => now()->toDateString(),
    ]);

    $nextCode = Expense::generateCode();
    $daily = Expense::getDailySummary($outlet->id, now()->toDateString());

    expect($nextCode)->toMatch('/^EXP-\d{8}-\d{4}$/');
    expect($nextCode)->toEndWith('0003');
    expect((float) Expense::getTotalByOutlet($outlet->id))->toBe(200000.0);
    expect($daily['total_count'])->toBe(2);
    expect((float) $daily['total_amount'])->toBe(200000.0);
  });
});
