<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\Category;
use App\Models\Customer;
use App\Models\CustomerQuota;
use App\Models\CustomerSubscription;
use App\Models\Employee;
use App\Models\EmployeePosition;
use App\Models\JournalEntry;
use App\Models\JournalDetail;
use App\Models\LaundryService;
use App\Models\LaundryServiceProcess;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Outlet;
use App\Models\OperationalDay;
use App\Models\Process;
use App\Models\OrderItemProcess;
use App\Services\PositionService;
use App\Models\QuotaUsageLog;
use App\Models\User;
use App\Models\Unit;
use App\Services\AccountService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LaundryBusinessSeeder extends Seeder
{
    protected AccountService $accountService;

    public function __construct(AccountService $accountService)
    {
        $this->accountService = $accountService;
    }

    public function run(): void
    {
        DB::beginTransaction();

        try {
            $this->command->info('🚀 Starting Laundry Business Seeder...');

            $this->createUnits();
            $owners = $this->createOwners();

            foreach ($owners as $owner) {
                $this->command->info("Creating outlets for owner: {$owner->name}");
                $outlets = $this->createOutletsForOwner($owner);

                foreach ($outlets as $outlet) {
                    $this->command->info("  - Setting up outlet: {$outlet->name}");

                    $this->command->info("    Creating outlet accounts...");
                    $this->accountService->createCashAccountForOutlet($owner->id, $outlet->id, $outlet->name);
                    $this->accountService->createReceivableAccountForOutlet($owner->id, $outlet->id, $outlet->name);
                    $this->accountService->createLoanAccountForOutlet($owner->id, $outlet->id, $outlet->name);
                    $this->accountService->createFineAccountForOutlet($owner->id, $outlet->id, $outlet->name);

                    $this->command->info("    Creating default active operational days...");
                    foreach (array_keys(OperationalDay::DAYS_OF_WEEK) as $day) {
                        OperationalDay::create([
                            'outlet_id'   => $outlet->id,
                            'day_of_week' => $day,
                            'open_time'   => '08:00:00',
                            'close_time'  => '20:00:00',
                            'is_open'     => true,
                        ]);
                    }

                    $this->setupOutlet($outlet);
                    $this->createAccountingPeriods($outlet, $owner);
                    $this->createComprehensiveJournals($outlet, $owner);
                }
            }

            DB::commit();
            $this->command->info('✅ Laundry Business Seeder completed successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Seeder failed: ' . $e->getMessage());
            $this->command->error('❌ Seeder failed: ' . $e->getMessage());
            throw $e;
        }
    }

    private function createUnits(): void
    {
        $this->command->info('Creating units...');

        $units = [
            ['name' => 'Kilogram', 'symbol' => 'kg', 'description' => 'Satuan berat dalam kilogram'],
            ['name' => 'Pieces', 'symbol' => 'pcs', 'description' => 'Satuan per potong'],
            ['name' => 'Set', 'symbol' => 'set', 'description' => 'Satuan per set'],
            ['name' => 'Meter', 'symbol' => 'm', 'description' => 'Satuan panjang dalam meter'],
        ];

        foreach ($units as $unit) {
            Unit::firstOrCreate(['symbol' => $unit['symbol']], $unit);
        }
    }

    private function createOwners()
    {
        $this->command->info('Creating 5 owners...');

        $owners = collect();
        for ($i = 0; $i < 5; $i++) {
            $owner = User::factory()->owner()->create();
            $owner->assignRole('owner');
            $this->accountService->generateDefaultAccounts($owner->id);
            $this->command->info("  - Owner created: {$owner->name} (Role: owner, COA: Generated)");
            $owners->push($owner);
        }

        return $owners;
    }

    private function createOutletsForOwner(User $owner)
    {
        return Outlet::factory()
            ->count(3)
            ->create(['owner_id' => $owner->id]);
    }

    private function setupOutlet(Outlet $outlet): void
    {
        $positions = $this->createPositionsForOutlet($outlet);
        $employees = $this->createEmployeesForOutlet($outlet, $positions);
        $customers = $this->createCustomersForOutlet($outlet);
        $categories = $this->createCategoriesForOutlet($outlet);

        $services = collect();
        foreach ($categories as $category) {
            $categoryServices = $this->createLaundryServicesForCategory($category);
            $services = $services->merge($categoryServices);
        }

        $this->createOrdersForOutlet($employees, $customers, $services);
    }

    private function createPositionsForOutlet(Outlet $outlet): array
    {
        $this->command->info("    Creating default positions for outlet: {$outlet->name}");

        // Use PositionService to create default positions (kasir, produksi, kurir, etc.)
        $positionService = app(PositionService::class);

        $created = $positionService->createDefaultPositionsForOutlet($outlet->id);

        // Ensure we return an array of Position models
        return is_array($created) ? $created : (array) $created;
    }

    private function createEmployeesForOutlet(Outlet $outlet, array $positions)
    {
        $this->command->info("    Creating core employees (Kasir, Produksi, Kurir) for outlet: {$outlet->name}");

        $employees = collect();

        // Ensure position map by slug for assignment
        $positionMap = collect($positions)->keyBy(fn($p) => $p->slug ?? strtolower(str_replace(' ', '-', $p->name)));

        // Helper to create and assign
        $createAndAssign = function (string $roleSlug, string $displayName) use ($outlet, $positionMap, &$employees) {
            $employee = Employee::factory()->create(['outlet_id' => $outlet->id]);

            $position = $positionMap->get($roleSlug);
            if ($position) {
                EmployeePosition::create([
                    'employee_id' => $employee->id,
                    'position_id' => $position->id,
                    'is_active' => true,
                ]);
                $this->command->info("      Created {$displayName} {$employee->name} and assigned position: {$position->name}");

                if ($roleSlug === 'produksi') {
                    $processes = Process::all();
                    foreach ($processes as $process) {
                        \App\Models\EmployeeProcess::create([
                            'employee_id' => $employee->id,
                            'process_id' => $process->id,
                            'is_active' => true,
                            'assigned_at' => now(),
                        ]);
                    }
                }
            } else {
                $this->command->warn("      Position '{$roleSlug}' not found for outlet {$outlet->id} — created employee without that role");
            }

            $employees->push($employee);
        };

        // Create one Kasir, Produksi, Kurir each
        $createAndAssign('kasir', 'Kasir');
        $createAndAssign('produksi', 'Produksi');
        $createAndAssign('kurir', 'Kurir');

        return $employees;
    }

    private function createCustomersForOutlet(Outlet $outlet)
    {
        return Customer::factory()
            ->count(10)
            ->create(['outlet_id' => $outlet->id]);
    }

    private function createCategoriesForOutlet(Outlet $outlet)
    {
        $categoryNames = ['Pakaian', 'Sepatu', 'Karpet', 'Tas'];
        $categories = collect();

        foreach ($categoryNames as $name) {
            $category = Category::factory()->create([
                'outlet_id' => $outlet->id,
                'name' => $name,
                'slug' => strtolower(str_replace(' ', '-', $name)) . '-' . $outlet->id,
            ]);
            $categories->push($category);
        }

        return $categories;
    }

    private function createLaundryServicesForCategory(Category $category)
    {
        $units = Unit::all();
        $serviceNames = ['Cuci Kering', 'Cuci Basah', 'Cuci Komplit'];
        $processes = Process::all();

        $services = collect();
        foreach ($serviceNames as $name) {
            $service = LaundryService::create([
                'category_id' => $category->id,
                'unit_id' => $units->random()->id,
                'name' => $name,
                'description' => "Layanan {$name} untuk kategori {$category->name}",
                'duration_hours' => fake()->numberBetween(12, 72),
                'price' => fake()->randomFloat(2, 10000, 100000),
                'min_quantity' => fake()->numberBetween(1, 5),
                'is_active' => true,
                'supports_courier' => in_array($name, ['Cuci Kering', 'Cuci Komplit'], true),
            ]);

            $processSequence = [
                'Pencucian',
                'Pengeringan',
                'Penyetrikaan',
                'Pelipatan',
                'Pemeriksaan Kualitas',
                'Siap Diambil'
            ];

            foreach ($processSequence as $index => $processName) {
                $process = $processes->where('name', $processName)->first();
                if ($process) {
                    LaundryServiceProcess::create([
                        'laundry_service_id' => $service->id,
                        'process_id' => $process->id,
                        'sequence' => $index + 1,
                    ]);
                }
            }

            $services->push($service);
        }

        return $services;
    }

    private function createOrdersForOutlet($employees, $customers, $services): void
    {
        $this->command->info("    Seeding scenario-driven orders...");

        $kasir = $employees->first(fn($e) => $e->positions()->where('slug', 'kasir')->exists()) ?? $employees->first();
        $produksi = $employees->first(fn($e) => $e->positions()->where('slug', 'produksi')->exists()) ?? $employees->first();
        $kurir = $employees->first(fn($e) => $e->positions()->where('slug', 'kurir')->exists()) ?? $employees->first();

        $scenarios = $this->buildOrderScenarios($kasir, $kurir);

        foreach ($scenarios as $scenario) {
            for ($i = 0; $i < 3; $i++) {
                $customer = $customers->random();
                $order = $this->createOrderFromScenario($scenario, $customer);
                $this->createOrderItemsForOrder($order, $services, $produksi, $scenario['status']);
                $this->recalculateOrderTotals($order, $scenario['payment_status']);
            }
        }
    }

    private function generateOrderNumber(int $outletId, $orderDate): string
    {
        $prefix = 'ORD';
        $date = Carbon::parse($orderDate)->format('Ymd');
        $outletCode = str_pad((string) $outletId, 3, '0', STR_PAD_LEFT);
        $randomSuffix = str_pad((string) fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT);

        return "{$prefix}{$date}{$outletCode}{$randomSuffix}";
    }

    private function buildOrderScenarios($kasir, $kurir): array
    {
        return [
            [
                'status' => Order::STATUS_REQUESTED,
                'payment_status' => Order::PAYMENT_STATUS_UNPAID,
                'payment_method' => 'cod',
                'delivery_type' => Order::DELIVERY_TYPE_PICKUP,
                'employee' => $kurir,
            ],
            [
                'status' => Order::STATUS_ACCEPTED,
                'payment_status' => Order::PAYMENT_STATUS_UNPAID,
                'payment_method' => 'cod',
                'delivery_type' => Order::DELIVERY_TYPE_PICKUP,
                'employee' => $kurir,
            ],
            [
                'status' => Order::STATUS_PICKING_UP,
                'payment_status' => Order::PAYMENT_STATUS_UNPAID,
                'payment_method' => 'cod',
                'delivery_type' => Order::DELIVERY_TYPE_PICKUP,
                'employee' => $kurir,
            ],
            [
                'status' => Order::STATUS_RECEIVED,
                'payment_status' => Order::PAYMENT_STATUS_UNPAID,
                'payment_method' => 'cash',
                'delivery_type' => Order::DELIVERY_TYPE_PICKUP,
                'employee' => $kasir,
            ],
            [
                'status' => Order::STATUS_WEIGHING,
                'payment_status' => Order::PAYMENT_STATUS_UNPAID,
                'payment_method' => 'cash',
                'delivery_type' => Order::DELIVERY_TYPE_PICKUP,
                'employee' => $kasir,
            ],
            [
                'status' => Order::STATUS_READY_TO_PROCESS,
                'payment_status' => Order::PAYMENT_STATUS_PARTIAL,
                'payment_method' => 'qris',
                'delivery_type' => Order::DELIVERY_TYPE_PICKUP,
                'employee' => $kasir,
            ],
            [
                'status' => Order::STATUS_IN_PROGRESS,
                'payment_status' => Order::PAYMENT_STATUS_PARTIAL,
                'payment_method' => 'transfer',
                'delivery_type' => Order::DELIVERY_TYPE_PICKUP,
                'employee' => $kasir,
            ],
            [
                'status' => Order::STATUS_READY,
                'payment_status' => Order::PAYMENT_STATUS_PAID,
                'payment_method' => 'qris',
                'delivery_type' => Order::DELIVERY_TYPE_PICKUP,
                'employee' => $kasir,
            ],
            [
                'status' => Order::STATUS_DELIVERING,
                'payment_status' => Order::PAYMENT_STATUS_PAID,
                'payment_method' => 'cod',
                'delivery_type' => Order::DELIVERY_TYPE_DELIVERY,
                'employee' => $kurir,
            ],
            [
                'status' => Order::STATUS_DELIVERED,
                'payment_status' => Order::PAYMENT_STATUS_PAID,
                'payment_method' => 'transfer',
                'delivery_type' => Order::DELIVERY_TYPE_DELIVERY,
                'employee' => $kurir,
            ],
            [
                'status' => Order::STATUS_COMPLETED,
                'payment_status' => Order::PAYMENT_STATUS_PAID,
                'payment_method' => 'cash',
                'delivery_type' => Order::DELIVERY_TYPE_PICKUP,
                'employee' => $kasir,
            ],
            [
                'status' => Order::STATUS_CANCELLED,
                'payment_status' => Order::PAYMENT_STATUS_UNPAID,
                'payment_method' => null,
                'delivery_type' => Order::DELIVERY_TYPE_PICKUP,
                'employee' => $kasir,
            ],
            [
                'status' => Order::STATUS_REJECTED,
                'payment_status' => Order::PAYMENT_STATUS_UNPAID,
                'payment_method' => null,
                'delivery_type' => Order::DELIVERY_TYPE_PICKUP,
                'employee' => $kasir,
            ],
        ];
    }

    private function createOrderFromScenario(array $scenario, Customer $customer): Order
    {
        $orderDate = fake()->dateTimeBetween('-3 months', '-1 day');
        $estimatedCompletion = Carbon::parse($orderDate)->addDays(fake()->numberBetween(1, 3));

        $actualCompletion = null;
        $pickupDate = null;

        $terminalStatuses = [
            Order::STATUS_READY,
            Order::STATUS_DELIVERING,
            Order::STATUS_DELIVERED,
            Order::STATUS_COMPLETED,
        ];

        if (in_array($scenario['status'], $terminalStatuses)) {
            $actualCompletion = Carbon::parse($orderDate)->addDays(fake()->numberBetween(1, 2));
        }

        if (in_array($scenario['status'], [Order::STATUS_DELIVERED, Order::STATUS_COMPLETED])) {
            $pickupDate = Carbon::parse($actualCompletion)->addHours(fake()->numberBetween(1, 12));
        }

        return Order::create([
            'employee_id' => $scenario['employee']->id,
            'customer_id' => $customer->id,
            'order_number' => $this->generateOrderNumber($customer->outlet_id, $orderDate),
            'status' => $scenario['status'],
            'subtotal' => 0,
            'discount_amount' => 0,
            'tax_amount' => 0,
            'total_amount' => 0,
            'paid_amount' => 0,
            'remaining_amount' => 0,
            'payment_status' => $scenario['payment_status'],
            'payment_method' => $scenario['payment_method'],
            'delivery_type' => $scenario['delivery_type'],
            'order_date' => $orderDate,
            'estimated_completion' => $estimatedCompletion,
            'actual_completion' => $actualCompletion,
            'pickup_date' => $pickupDate,
            'last_status_update' => $actualCompletion ?? $orderDate,
            'updated_by' => $scenario['employee']->id,
            'outlet_id' => $customer->outlet_id,
        ]);
    }

    private function createOrderItemsForOrder(Order $order, $services, ?Employee $produksi, string $orderStatus): void
    {
        $itemCount = fake()->numberBetween(1, 3);
        $createdItems = collect();

        for ($i = 0; $i < $itemCount; $i++) {
            $service = $services->random();
            $quantity = fake()->randomFloat(2, $service->min_quantity, 10);

            $orderItem = OrderItem::factory()
                ->forOrder($order->id)
                ->withLaundryService($service->id)
                ->withQuantity($quantity)
                ->withSnapshot([
                    'category_name' => $service->category->name,
                    'laundry_service_name' => $service->name,
                    'unit_name' => $service->unit->name,
                ])
                ->paidWithCash()
                ->create(['unit_price' => $service->price]);

            $createdItems->push($orderItem);
        }

        foreach ($createdItems as $createdItem) {
            $this->createProcessProgressForOrderItem($createdItem, $orderStatus, $produksi);
        }
    }

    private function createProcessProgressForOrderItem(
        OrderItem $orderItem,
        string $orderStatus,
        ?Employee $produksi
    ): void {
        if (!$produksi) {
            return;
        }

        $completedStatuses = [
            Order::STATUS_READY,
            Order::STATUS_DELIVERING,
            Order::STATUS_DELIVERED,
            Order::STATUS_COMPLETED,
        ];

        $inProgressStatuses = [
            Order::STATUS_IN_PROGRESS,
        ];

        $serviceProcesses = LaundryServiceProcess::where('laundry_service_id', $orderItem->laundry_service_id)
            ->orderBy('sequence')
            ->get();

        if ($serviceProcesses->isEmpty()) {
            return;
        }

        if (in_array($orderStatus, $completedStatuses)) {
            foreach ($serviceProcesses as $serviceProcess) {
                try {
                    $oip = OrderItemProcess::create([
                        'order_item_id' => $orderItem->id,
                        'laundry_service_process_id' => $serviceProcess->id,
                        'qty_processed' => 0,
                    ]);
                    $oip->start($produksi->id);
                    $qty = $orderItem->quantity;
                    $oip->complete($qty, $produksi->id);
                } catch (\Exception $e) {
                    $this->command->warn('Error seeding completed process progress: ' . $e->getMessage());
                }
            }
            return;
        }

        if (in_array($orderStatus, $inProgressStatuses)) {
            $halfway = (int) ceil($serviceProcesses->count() / 2);
            foreach ($serviceProcesses->take($halfway) as $index => $serviceProcess) {
                try {
                    $oip = OrderItemProcess::create([
                        'order_item_id' => $orderItem->id,
                        'laundry_service_process_id' => $serviceProcess->id,
                        'qty_processed' => 0,
                    ]);
                    $oip->start($produksi->id);
                    if ($index < $halfway - 1) {
                        $qty = $orderItem->quantity;
                        $oip->complete($qty, $produksi->id);
                    }
                } catch (\Exception $e) {
                    $this->command->warn('Error seeding in_progress process progress: ' . $e->getMessage());
                }
            }
        }
    }

    private function recalculateOrderTotals(Order $order, string $scenarioPaymentStatus): void
    {
        $orderItems = OrderItem::where('order_id', $order->id)->get();
        $subtotal = $orderItems->sum('subtotal');
        $discountAmount = 0;
        $taxAmount = $subtotal * 0.1;
        $totalAmount = $subtotal - $discountAmount + $taxAmount;

        $paidAmount = match ($scenarioPaymentStatus) {
            Order::PAYMENT_STATUS_PAID => $totalAmount,
            Order::PAYMENT_STATUS_PARTIAL => $totalAmount * 0.5,
            default => 0,
        };

        $order->update([
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount,
            'paid_amount' => $paidAmount,
            'remaining_amount' => $totalAmount - $paidAmount,
            'payment_status' => $scenarioPaymentStatus,
        ]);
    }

    private function createAccountingPeriods(Outlet $outlet, User $owner): void
    {
        $this->command->info("    Creating accounting periods for outlet: {$outlet->name}");

        $periodCount = 0;

        for ($year = 2023; $year <= 2025; $year++) {
            for ($month = 1; $month <= 12; $month++) {
                $startDate = Carbon::create($year, $month, 1)->startOfMonth();
                $endDate = $startDate->copy()->endOfMonth();

                $isClosed = ($year < 2025) || ($year == 2025 && $month < 12);

                AccountingPeriod::create([
                    'outlet_id' => $outlet->id,
                    'start_date' => $startDate->toDateString(),
                    'end_date' => $endDate->toDateString(),
                    'is_closed' => $isClosed,
                    'closed_at' => $isClosed ? $endDate->copy()->addDays(5) : null,
                    'closed_by' => $isClosed ? $owner->id : null,
                ]);

                $periodCount++;
            }
        }

        $this->command->info("      ✓ Created {$periodCount} accounting periods (2023-2025, Nov 2025 closed, Dec 2025 open)");
    }

    private function createComprehensiveJournals(Outlet $outlet, User $owner): void
    {
        $this->command->info("    Creating comprehensive journal entries for outlet: {$outlet->name}");

        $accounts = $this->getAccountsForJournals($owner, $outlet);

        if (!$accounts) {
            $this->command->warn("      Skipping journal entries: Required accounts not found");
            return;
        }

        $journalCount = 0;
        $journalCount += $this->createInitialCapital($outlet, $accounts, Carbon::create(2023, 1, 1));
        $journalCount += $this->createOperatingTransactions($outlet, $accounts, 2023, 2025);
        $journalCount += $this->createMonthlyExpenses($outlet, $accounts, 2023, 2025);
        $journalCount += $this->createAssetPurchases($outlet, $accounts);
        $journalCount += $this->createLoanTransactions($outlet, $accounts);
        $journalCount += $this->createYearEndClosing($outlet, $accounts, 2023);
        $journalCount += $this->createYearEndClosing($outlet, $accounts, 2024);

        $this->command->info("      ✓ Created {$journalCount} journal entries with details");
    }

    private function getAccountsForJournals(User $owner, ?Outlet $outlet = null): ?array
    {
        $accounts = [
            'kas' => Account::byOwnerId($owner->id)
                ->byOutletId($outlet?->id)
                ->byAccountRole('cash')
                ->isTransactional(true)
                ->first()
                ?? Account::byOwnerId($owner->id)
                    ->assets()
                    ->where('name', 'LIKE', '%Kas%')
                    ->isTransactional(true)
                    ->first(),

            'bank' => Account::byOwnerId($owner->id)
                ->assets()
                ->where('name', 'LIKE', '%Bank%')
                ->isTransactional(true)
                ->first(),

            'piutang' => Account::byOwnerId($owner->id)
                ->where('outlet_id', $outlet?->id)
                ->where('account_role', 'receivable')
                ->isTransactional(true)
                ->first()
                ?? Account::byOwnerId($owner->id)
                    ->assets()
                    ->where('name', 'LIKE', '%Piutang%')
                    ->isTransactional(true)
                    ->first(),

            'peralatan' => Account::byOwnerId($owner->id)
                ->assets()
                ->where('name', 'LIKE', '%Peralatan%')
                ->isTransactional(true)
                ->first(),

            'modal' => Account::byOwnerId($owner->id)
                ->equities()
                ->where('name', 'LIKE', '%Modal%')
                ->isTransactional(true)
                ->first(),

            'utang' => Account::byOwnerId($owner->id)
                ->liabilities()
                ->where('name', 'LIKE', '%Utang%')
                ->isTransactional(true)
                ->first(),

            'pendapatan' => Account::byOwnerId($owner->id)
                ->revenues()
                ->where('name', 'LIKE', '%Pendapatan%')
                ->isTransactional(true)
                ->first(),

            'beban_listrik' => Account::byOwnerId($owner->id)
                ->expenses()
                ->where('name', 'LIKE', '%Listrik%')
                ->isTransactional(true)
                ->first(),

            'beban_gaji' => Account::byOwnerId($owner->id)
                ->expenses()
                ->where('name', 'LIKE', '%Gaji%')
                ->isTransactional(true)
                ->first(),

            'beban_sewa' => Account::byOwnerId($owner->id)
                ->expenses()
                ->where('name', 'LIKE', '%Sewa%')
                ->isTransactional(true)
                ->first(),

            'beban_operasional' => Account::byOwnerId($owner->id)
                ->expenses()
                ->where('name', 'LIKE', '%Operasional%')
                ->isTransactional(true)
                ->first(),
        ];

        if (!$accounts['kas'] || !$accounts['modal'] || !$accounts['pendapatan']) {
            return null;
        }

        return $accounts;
    }

    private function createInitialCapital(Outlet $outlet, array $accounts, Carbon $date): int
    {
        $journalEntry = JournalEntry::create([
            'outlet_id' => $outlet->id,
            'transaction_number' => 'JE-' . $outlet->id . '-' . $date->format('Ymd') . '-CAPITAL',
            'date' => $date,
            'description' => 'Setoran Modal Awal',
            'reference_type' => null,
            'reference_id' => null,
            'is_manual' => true,
        ]);

        JournalDetail::create([
            'journal_entry_id' => $journalEntry->id,
            'account_id' => $accounts['kas']->id,
            'debit' => 50000000,
            'credit' => 0,
            'memo' => 'Setoran modal awal (kas)',
        ]);

        if ($accounts['bank']) {
            JournalDetail::create([
                'journal_entry_id' => $journalEntry->id,
                'account_id' => $accounts['bank']->id,
                'debit' => 100000000,
                'credit' => 0,
                'memo' => 'Setoran modal awal (bank)',
            ]);
        }

        JournalDetail::create([
            'journal_entry_id' => $journalEntry->id,
            'account_id' => $accounts['modal']->id,
            'debit' => 0,
            'credit' => $accounts['bank'] ? 150000000 : 50000000,
            'memo' => 'Modal pemilik untuk outlet ' . $outlet->name,
        ]);

        return 1;
    }

    private function createOperatingTransactions(Outlet $outlet, array $accounts, int $startYear, int $endYear): int
    {
        $count = 0;
        $transactionNumber = 1;

        for ($year = $startYear; $year <= $endYear; $year++) {
            $maxMonth = ($year == $endYear) ? 11 : 12;
            for ($month = 1; $month <= $maxMonth; $month++) {
                $daysInMonth = Carbon::create($year, $month)->daysInMonth;

                $revenueCount = fake()->numberBetween(3, 5);
                for ($i = 0; $i < $revenueCount; $i++) {
                    $day = fake()->numberBetween(1, $daysInMonth);
                    $date = Carbon::create($year, $month, $day);
                    $amount = fake()->numberBetween(3000000, 10000000);

                    $journalEntry = JournalEntry::create([
                        'outlet_id' => $outlet->id,
                        'transaction_number' => 'JE-' . $outlet->id . '-' . $date->format('Ymd') . '-' . str_pad($transactionNumber++, 4, '0', STR_PAD_LEFT),
                        'date' => $date,
                        'description' => 'Pendapatan Jasa Laundry',
                        'reference_type' => null,
                        'reference_id' => null,
                        'is_manual' => true,
                    ]);

                    if (fake()->boolean(70)) {
                        JournalDetail::create([
                            'journal_entry_id' => $journalEntry->id,
                            'account_id' => $accounts['kas']->id,
                            'debit' => $amount,
                            'credit' => 0,
                            'memo' => 'Penerimaan kas dari jasa laundry',
                        ]);
                    } else {
                        if ($accounts['piutang']) {
                            JournalDetail::create([
                                'journal_entry_id' => $journalEntry->id,
                                'account_id' => $accounts['piutang']->id,
                                'debit' => $amount,
                                'credit' => 0,
                                'memo' => 'Piutang jasa laundry (kredit)',
                            ]);
                        } else {
                            JournalDetail::create([
                                'journal_entry_id' => $journalEntry->id,
                                'account_id' => $accounts['kas']->id,
                                'debit' => $amount,
                                'credit' => 0,
                                'memo' => 'Penerimaan kas dari jasa laundry',
                            ]);
                        }
                    }

                    JournalDetail::create([
                        'journal_entry_id' => $journalEntry->id,
                        'account_id' => $accounts['pendapatan']->id,
                        'debit' => 0,
                        'credit' => $amount,
                        'memo' => 'Pendapatan jasa laundry',
                    ]);

                    $count++;
                }

                if ($accounts['piutang'] && fake()->boolean(60)) {
                    $day = fake()->numberBetween(1, $daysInMonth);
                    $date = Carbon::create($year, $month, $day);
                    $amount = fake()->numberBetween(1000000, 3000000);

                    $journalEntry = JournalEntry::create([
                        'outlet_id' => $outlet->id,
                        'transaction_number' => 'JE-' . $outlet->id . '-' . $date->format('Ymd') . '-' . str_pad($transactionNumber++, 4, '0', STR_PAD_LEFT),
                        'date' => $date,
                        'description' => 'Pelunasan Piutang',
                        'reference_type' => null,
                        'reference_id' => null,
                        'is_manual' => true,
                    ]);

                    JournalDetail::create([
                        'journal_entry_id' => $journalEntry->id,
                        'account_id' => $accounts['kas']->id,
                        'debit' => $amount,
                        'credit' => 0,
                        'memo' => 'Penerimaan pelunasan piutang',
                    ]);

                    JournalDetail::create([
                        'journal_entry_id' => $journalEntry->id,
                        'account_id' => $accounts['piutang']->id,
                        'debit' => 0,
                        'credit' => $amount,
                        'memo' => 'Pengurangan piutang',
                    ]);

                    $count++;
                }
            }
        }

        return $count;
    }

    private function createMonthlyExpenses(Outlet $outlet, array $accounts, int $startYear, int $endYear): int
    {
        $count = 0;
        $transactionNumber = 5000;

        for ($year = $startYear; $year <= $endYear; $year++) {
            $maxMonth = ($year == $endYear) ? 11 : 12;

            for ($month = 1; $month <= $maxMonth; $month++) {
                $date = Carbon::create($year, $month, 5);

                if ($accounts['beban_listrik']) {
                    $amount = fake()->numberBetween(1200000, 2000000);

                    $journalEntry = JournalEntry::create([
                        'outlet_id' => $outlet->id,
                        'transaction_number' => 'JE-' . $outlet->id . '-' . $date->format('Ymd') . '-' . str_pad($transactionNumber++, 4, '0', STR_PAD_LEFT),
                        'date' => $date,
                        'description' => 'Bayar Listrik Bulan ' . $date->format('F Y'),
                        'reference_type' => null,
                        'reference_id' => null,
                        'is_manual' => true,
                    ]);

                    JournalDetail::create([
                        'journal_entry_id' => $journalEntry->id,
                        'account_id' => $accounts['beban_listrik']->id,
                        'debit' => $amount,
                        'credit' => 0,
                        'memo' => 'Beban listrik ' . $date->format('F Y'),
                    ]);

                    JournalDetail::create([
                        'journal_entry_id' => $journalEntry->id,
                        'account_id' => $accounts['kas']->id,
                        'debit' => 0,
                        'credit' => $amount,
                        'memo' => 'Pembayaran listrik',
                    ]);

                    $count++;
                }

                if ($accounts['beban_sewa']) {
                    $amount = fake()->numberBetween(5000000, 8000000);
                    $rentDate = Carbon::create($year, $month, 1);

                    $journalEntry = JournalEntry::create([
                        'outlet_id' => $outlet->id,
                        'transaction_number' => 'JE-' . $outlet->id . '-' . $rentDate->format('Ymd') . '-' . str_pad($transactionNumber++, 4, '0', STR_PAD_LEFT),
                        'date' => $rentDate,
                        'description' => 'Bayar Sewa Tempat Bulan ' . $rentDate->format('F Y'),
                        'reference_type' => null,
                        'reference_id' => null,
                        'is_manual' => true,
                    ]);

                    JournalDetail::create([
                        'journal_entry_id' => $journalEntry->id,
                        'account_id' => $accounts['beban_sewa']->id,
                        'debit' => $amount,
                        'credit' => 0,
                        'memo' => 'Beban sewa ' . $rentDate->format('F Y'),
                    ]);

                    JournalDetail::create([
                        'journal_entry_id' => $journalEntry->id,
                        'account_id' => $accounts['bank'] ? $accounts['bank']->id : $accounts['kas']->id,
                        'debit' => 0,
                        'credit' => $amount,
                        'memo' => 'Pembayaran sewa tempat',
                    ]);

                    $count++;
                }

                if ($accounts['beban_gaji']) {
                    $amount = fake()->numberBetween(8000000, 15000000);
                    $salaryDate = Carbon::create($year, $month, 25);

                    $journalEntry = JournalEntry::create([
                        'outlet_id' => $outlet->id,
                        'transaction_number' => 'JE-' . $outlet->id . '-' . $salaryDate->format('Ymd') . '-' . str_pad($transactionNumber++, 4, '0', STR_PAD_LEFT),
                        'date' => $salaryDate,
                        'description' => 'Bayar Gaji Karyawan Bulan ' . $salaryDate->format('F Y'),
                        'reference_type' => null,
                        'reference_id' => null,
                        'is_manual' => true,
                    ]);

                    JournalDetail::create([
                        'journal_entry_id' => $journalEntry->id,
                        'account_id' => $accounts['beban_gaji']->id,
                        'debit' => $amount,
                        'credit' => 0,
                        'memo' => 'Beban gaji ' . $salaryDate->format('F Y'),
                    ]);

                    JournalDetail::create([
                        'journal_entry_id' => $journalEntry->id,
                        'account_id' => $accounts['bank'] ? $accounts['bank']->id : $accounts['kas']->id,
                        'debit' => 0,
                        'credit' => $amount,
                        'memo' => 'Pembayaran gaji karyawan',
                    ]);

                    $count++;
                }

                if ($accounts['beban_operasional'] && fake()->boolean(80)) {
                    $amount = fake()->numberBetween(500000, 2000000);
                    $opDate = Carbon::create($year, $month, fake()->numberBetween(10, 20));

                    $journalEntry = JournalEntry::create([
                        'outlet_id' => $outlet->id,
                        'transaction_number' => 'JE-' . $outlet->id . '-' . $opDate->format('Ymd') . '-' . str_pad($transactionNumber++, 4, '0', STR_PAD_LEFT),
                        'date' => $opDate,
                        'description' => 'Beban Operasional ' . $opDate->format('F Y'),
                        'reference_type' => null,
                        'reference_id' => null,
                        'is_manual' => true,
                    ]);

                    JournalDetail::create([
                        'journal_entry_id' => $journalEntry->id,
                        'account_id' => $accounts['beban_operasional']->id,
                        'debit' => $amount,
                        'credit' => 0,
                        'memo' => 'Beban operasional (supplies, maintenance, dll)',
                    ]);

                    JournalDetail::create([
                        'journal_entry_id' => $journalEntry->id,
                        'account_id' => $accounts['kas']->id,
                        'debit' => 0,
                        'credit' => $amount,
                        'memo' => 'Pengeluaran operasional',
                    ]);

                    $count++;
                }
            }
        }

        return $count;
    }

    private function createAssetPurchases(Outlet $outlet, array $accounts): int
    {
        if (!$accounts['peralatan']) {
            return 0;
        }

        $count = 0;
        $purchases = [
            ['date' => Carbon::create(2023, 2, 15), 'description' => 'Pembelian Mesin Cuci', 'amount' => 25000000],
            ['date' => Carbon::create(2023, 3, 10), 'description' => 'Pembelian Mesin Pengering', 'amount' => 15000000],
            ['date' => Carbon::create(2024, 1, 20), 'description' => 'Pembelian Setrika Uap', 'amount' => 5000000],
            ['date' => Carbon::create(2024, 6, 5), 'description' => 'Pembelian AC', 'amount' => 8000000],
            ['date' => Carbon::create(2025, 3, 12), 'description' => 'Pembelian Komputer Kasir', 'amount' => 12000000],
        ];

        $transactionNumber = 8000;

        foreach ($purchases as $purchase) {
            $journalEntry = JournalEntry::create([
                'outlet_id' => $outlet->id,
                'transaction_number' => 'JE-' . $outlet->id . '-' . $purchase['date']->format('Ymd') . '-' . str_pad($transactionNumber++, 4, '0', STR_PAD_LEFT),
                'date' => $purchase['date'],
                'description' => $purchase['description'],
                'reference_type' => null,
                'reference_id' => null,
                'is_manual' => true,
            ]);

            JournalDetail::create([
                'journal_entry_id' => $journalEntry->id,
                'account_id' => $accounts['peralatan']->id,
                'debit' => $purchase['amount'],
                'credit' => 0,
                'memo' => $purchase['description'],
            ]);

            if (fake()->boolean(50) && $accounts['utang']) {
                $cashAmount = $purchase['amount'] * 0.3;
                $payableAmount = $purchase['amount'] * 0.7;

                JournalDetail::create([
                    'journal_entry_id' => $journalEntry->id,
                    'account_id' => $accounts['kas']->id,
                    'debit' => 0,
                    'credit' => $cashAmount,
                    'memo' => 'Pembayaran DP',
                ]);

                JournalDetail::create([
                    'journal_entry_id' => $journalEntry->id,
                    'account_id' => $accounts['utang']->id,
                    'debit' => 0,
                    'credit' => $payableAmount,
                    'memo' => 'Utang pembelian peralatan',
                ]);
            } else {
                JournalDetail::create([
                    'journal_entry_id' => $journalEntry->id,
                    'account_id' => $accounts['bank'] ? $accounts['bank']->id : $accounts['kas']->id,
                    'debit' => 0,
                    'credit' => $purchase['amount'],
                    'memo' => 'Pembayaran ' . strtolower($purchase['description']),
                ]);
            }

            $count++;
        }

        return $count;
    }

    private function createLoanTransactions(Outlet $outlet, array $accounts): int
    {
        if (!$accounts['utang']) {
            return 0;
        }

        $count = 0;
        $transactionNumber = 9000;

        $loanDate = Carbon::create(2023, 6, 1);
        $loanAmount = 50000000;

        $journalEntry = JournalEntry::create([
            'outlet_id' => $outlet->id,
            'transaction_number' => 'JE-' . $outlet->id . '-' . $loanDate->format('Ymd') . '-' . str_pad($transactionNumber++, 4, '0', STR_PAD_LEFT),
            'date' => $loanDate,
            'description' => 'Penerimaan Pinjaman Bank',
            'reference_type' => null,
            'reference_id' => null,
            'is_manual' => true,
        ]);

        JournalDetail::create([
            'journal_entry_id' => $journalEntry->id,
            'account_id' => $accounts['bank'] ? $accounts['bank']->id : $accounts['kas']->id,
            'debit' => $loanAmount,
            'credit' => 0,
            'memo' => 'Penerimaan pinjaman bank',
        ]);

        JournalDetail::create([
            'journal_entry_id' => $journalEntry->id,
            'account_id' => $accounts['utang']->id,
            'debit' => 0,
            'credit' => $loanAmount,
            'memo' => 'Utang bank jangka panjang',
        ]);

        $count++;

        $paymentDate = Carbon::create(2023, 7, 1);
        $monthlyPayment = 2500000;

        while ($paymentDate->lte(Carbon::create(2025, 10, 31))) {
            $journalEntry = JournalEntry::create([
                'outlet_id' => $outlet->id,
                'transaction_number' => 'JE-' . $outlet->id . '-' . $paymentDate->format('Ymd') . '-' . str_pad($transactionNumber++, 4, '0', STR_PAD_LEFT),
                'date' => $paymentDate,
                'description' => 'Pembayaran Cicilan Pinjaman ' . $paymentDate->format('F Y'),
                'reference_type' => null,
                'reference_id' => null,
                'is_manual' => true,
            ]);

            JournalDetail::create([
                'journal_entry_id' => $journalEntry->id,
                'account_id' => $accounts['utang']->id,
                'debit' => $monthlyPayment,
                'credit' => 0,
                'memo' => 'Pembayaran pokok pinjaman',
            ]);

            JournalDetail::create([
                'journal_entry_id' => $journalEntry->id,
                'account_id' => $accounts['bank'] ? $accounts['bank']->id : $accounts['kas']->id,
                'debit' => 0,
                'credit' => $monthlyPayment,
                'memo' => 'Pembayaran cicilan bank',
            ]);

            $count++;
            $paymentDate->addMonth();
        }

        return $count;
    }

    private function createYearEndClosing(Outlet $outlet, array $accounts, int $year): int
    {
        $closingDate = Carbon::create($year, 12, 31);

        $journalEntry = JournalEntry::create([
            'outlet_id' => $outlet->id,
            'transaction_number' => 'JE-' . $outlet->id . '-' . $closingDate->format('Ymd') . '-CLOSING',
            'date' => $closingDate,
            'description' => 'Penutupan Buku Tahun ' . $year,
            'reference_type' => null,
            'reference_id' => null,
            'is_manual' => true,
        ]);

        JournalDetail::create([
            'journal_entry_id' => $journalEntry->id,
            'account_id' => $accounts['pendapatan']->id,
            'debit' => 0,
            'credit' => 0,
            'memo' => 'Penutupan akun pendapatan tahun ' . $year,
        ]);

        if ($accounts['beban_listrik']) {
            JournalDetail::create([
                'journal_entry_id' => $journalEntry->id,
                'account_id' => $accounts['beban_listrik']->id,
                'debit' => 0,
                'credit' => 0,
                'memo' => 'Penutupan akun beban tahun ' . $year,
            ]);
        }

        return 1;
    }
}
