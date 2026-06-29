# Implementation Plan: Default Position, Production Eligibility, dan Realistic Order Seeder

> Baca seluruh plan ini sebelum menulis kode apapun.
> Setiap langkah wajib merujuk ke spesifikasi di `docs/spec/`.

---

## ⚠️ Peringatan Wajib untuk AI Model

Sebelum menulis satu baris kode pun, AI model **wajib membaca** file-file berikut:

| File Spec | Alasan |
|---|---|
| `docs/spec/service_spec.md` | Standar penulisan service, method helper, exception handling |
| `docs/spec/model_spec.md` | Standar penulisan model, query scope, helper method |

**Aturan Kode Wajib:**
- ❌ Jangan duplikasi aturan bisnis — gunakan satu source of truth (`PositionService::getDefaultPositions()` dan `Permission::defaultForSlug()`)
- ❌ Jangan tulis comment — clean code yang self-explanatory
- ✅ Eligibility produksi harus bisa di-reuse oleh service, seeder, dan middleware
- ✅ Seeder order harus scenario-driven, bukan random penuh
- ✅ Ikuti `service_spec.md` untuk method naming dan structure

---

## Ringkasan Gap

| Area | File | Gap |
|---|---|---|
| Seeder position | `LaundryBusinessSeeder::createPositionsForOutlet` | Masih random (small/medium/large), tidak pakai default position flow |
| Seeder employee | `LaundryBusinessSeeder::createEmployeesForOutlet` | Assign position secara acak, tidak mempertimbangkan slug `produksi` |
| Seeder employee-process | `EmployeeProcessSeeder` | Assign process ke 5 employee global, tidak cek eligibility produksi |
| Domain model | `Employee` | Tidak ada method `isEligibleForProduction()` |
| Service enforcement | `EmployeeService` | Tidak ada guard eligibility saat assign process atau commission |
| Service enforcement | `OrderItemService` | Tidak ada guard eligibility produksi saat start/complete proses |
| Seeder order | `LaundryBusinessSeeder::createOrdersForOutlet` | Random status, random payment, tidak ada distribusi per status |
| Factory order | `OrderFactory::definition()` | Status random dari semua enum, payment status tidak konsisten dengan status operasional |

---

## Fase 1 — Domain: Eligibility Helper di Employee Model

### 1.1 Tambah `isEligibleForProduction(int $outletId)` ke `Employee`

**File:** `app/Models/Employee.php`

Tambahkan di section **Business Logic**, berdampingan dengan `isKurirOnOutlet()`:

```php
public function isEligibleForProduction(int $outletId): bool
{
    if (!$this->is_active) {
        return false;
    }

    return $this->positions()
        ->where('employee_positions.is_active', true)
        ->where('positions.is_active', true)
        ->where('positions.outlet_id', $outletId)
        ->where('positions.slug', 'produksi')
        ->exists();
}
```

Method ini menjadi **single source of truth** untuk cek eligibility produksi.

---

## Fase 2 — Service: Enforcement di EmployeeService

### 2.1 Guard saat assign process ke employee

**File:** `app/Services/EmployeeService.php`

Sebelum melakukan assignment process (di method `syncProcesses`, `storeProcess`, atau equivalent), tambahkan cek eligibility:

```php
if (!$employee->isEligibleForProduction($employee->outlet_id)) {
    throw new \Exception("Employee tidak memiliki position produksi aktif.");
}
```

Temukan method yang menangani assign process di `EmployeeService` dan tambahkan guard tersebut.

### 2.2 Guard saat assign commission ke employee

Sama dengan 2.1 — pastikan commission tidak bisa dibuat jika employee tidak eligible produksi.

---

## Fase 3 — Service: Enforcement di OrderItemService

### 3.1 Tambah cek eligibility saat start/complete proses

**File:** `app/Services/OrderItemService.php`

Di method yang menangani start proses atau complete proses, setelah cek `canWorkOnProcess()`, tambahkan:

```php
if (!$employee->isEligibleForProduction($outletId)) {
    throw new \Exception("Employee tidak eligible untuk produksi pada outlet ini.");
}
```

Pastikan `$outletId` diambil dari konteks order yang sedang dikerjakan.

---

## Fase 4 — Seeder: Standardisasi Position dan Employee

### 4.1 Refactor `createPositionsForOutlet` di `LaundryBusinessSeeder`

**File:** `database/seeders/LaundryBusinessSeeder.php`

**Sekarang:** Random small/medium/large dengan nama position berbeda-beda.

**Target:** Selalu memanggil `PositionService::createDefaultPositionsForOutlet()`.

```php
private function createPositionsForOutlet(Outlet $outlet): array
{
    $this->command->info("    Creating default positions for outlet: {$outlet->name}");

    $positionService = app(PositionService::class);
    $positions = $positionService->createDefaultPositionsForOutlet($outlet->id);

    foreach ($positions as $pos) {
        $this->command->info("      ✓ Position: {$pos->name} (slug: {$pos->slug})");
    }

    return $positions;
}
```

Import yang diperlukan:
```php
use App\Services\PositionService;
```

---

### 4.2 Refactor `createEmployeesForOutlet` di `LaundryBusinessSeeder`

**File:** `database/seeders/LaundryBusinessSeeder.php`

**Target:** Buat employee dengan komposisi role yang masuk akal — minimal 1 kasir, 1 produksi, 1 kurir.

```php
private function createEmployeesForOutlet(Outlet $outlet, array $positions): \Illuminate\Support\Collection
{
    $this->command->info("    Creating employees for outlet: {$outlet->name}");

    $positionBySlug = collect($positions)->keyBy('slug');

    $kasirPosition    = $positionBySlug->get('kasir');
    $produksiPosition = $positionBySlug->get('produksi');
    $kurirPosition    = $positionBySlug->get('kurir');

    $employees = collect();

    $kasir = Employee::factory()->create(['outlet_id' => $outlet->id]);
    EmployeePosition::create([
        'employee_id' => $kasir->id,
        'position_id' => $kasirPosition->id,
        'is_active'   => true,
    ]);
    $this->command->info("      ✓ Kasir: {$kasir->name}");
    $employees->push($kasir);

    $produksi = Employee::factory()->create(['outlet_id' => $outlet->id]);
    EmployeePosition::create([
        'employee_id' => $produksi->id,
        'position_id' => $produksiPosition->id,
        'is_active'   => true,
    ]);
    $this->command->info("      ✓ Produksi: {$produksi->name}");
    $employees->push($produksi);

    $kurir = Employee::factory()->create(['outlet_id' => $outlet->id]);
    EmployeePosition::create([
        'employee_id' => $kurir->id,
        'position_id' => $kurirPosition->id,
        'is_active'   => true,
    ]);
    $this->command->info("      ✓ Kurir: {$kurir->name}");
    $employees->push($kurir);

    return $employees;
}
```

> Return type diubah dari `array` ke `Collection` agar konsisten.

---

## Fase 5 — Refactor `EmployeeProcessSeeder`

**File:** `database/seeders/EmployeeProcessSeeder.php`

**Target:** Hanya assign process dan commission ke employee yang memiliki position `produksi`.

**Logika baru:**
1. Ambil semua `EmployeePosition` aktif dengan slug position = `produksi`.
2. Untuk setiap employee produksi, assign semua process yang ada.
3. Sebagian employee (senior/specialist) mendapat commission.

```php
public function run(): void
{
    $processes = Process::all();

    if ($processes->isEmpty()) {
        $this->command->warn('No processes found. Run ProcessSeeder first.');
        return;
    }

    $produksiEmployeeIds = EmployeePosition::query()
        ->whereHas('position', fn($q) => $q->where('slug', 'produksi')->where('is_active', true))
        ->where('is_active', true)
        ->pluck('employee_id')
        ->unique();

    if ($produksiEmployeeIds->isEmpty()) {
        $this->command->warn('No production employees found. Run LaundryBusinessSeeder first.');
        return;
    }

    $employees = Employee::whereIn('id', $produksiEmployeeIds)->get();

    foreach ($employees as $index => $employee) {
        $this->assignProcessesToEmployee($employee, $processes, $index);
    }

    $this->command->info("✓ EmployeeProcessSeeder completed for {$employees->count()} production employees.");
}

private function assignProcessesToEmployee(Employee $employee, $processes, int $index): void
{
    foreach ($processes as $processIndex => $process) {
        $ep = EmployeeProcess::assignToEmployee($employee->id, $process->id, [
            'notes' => 'Seeded production employee',
        ]);

        if ($index === 0 && $processIndex < 3) {
            EmployeeProcessCommission::updateOrCreate(
                ['employee_process_id' => $ep->id],
                [
                    'commission_type'  => 'per_item',
                    'commission_value' => 5000,
                    'is_active'        => true,
                    'effective_date'   => now(),
                ]
            );
        }

        if ($index === 1) {
            EmployeeProcessCommission::updateOrCreate(
                ['employee_process_id' => $ep->id],
                [
                    'commission_type'    => 'per_item',
                    'commission_value'   => 7000,
                    'has_target'         => true,
                    'target_threshold'   => 50,
                    'bonus_amount'       => 100000,
                    'is_active'          => true,
                    'effective_date'     => now(),
                ]
            );
        }
    }

    $this->command->info("  ✓ {$employee->name}: {$processes->count()} processes assigned");
}
```

Import yang diperlukan:
```php
use App\Models\EmployeePosition;
```

---

## Fase 6 — Refactor Order Seeder: Scenario-Driven

### 6.1 Rancangan Skenario Order

Ganti metode random `createOrdersForOutlet` dengan sistem skenario berbasis template:

| Skenario | Status | Payment Status | Payment Method | Progres Produksi |
|---|---|---|---|---|
| `walkin_baru` | `received` | `unpaid` | `cash` | — |
| `walkin_ditimbang` | `weighing` | `unpaid` | `cash` | — |
| `walkin_antri_proses` | `ready_to_process` | `partial` | `cash` / `qris` | — |
| `walkin_dalam_proses` | `in_progress` | `partial` | `qris` / `transfer` | Sebagian proses started |
| `walkin_siap` | `ready` | `paid` | `qris` / `transfer` | Semua proses selesai |
| `walkin_selesai` | `completed` | `paid` | `cash` / `qris` / `transfer` | Semua proses selesai |
| `pickup_requested` | `requested` | `unpaid` | `cod` | — |
| `pickup_dijemput` | `picking_up` | `unpaid` | `cod` | — |
| `pickup_dalam_proses` | `in_progress` | `partial` | `cod` | Sebagian proses started |
| `pickup_diantar` | `delivering` | `paid` | `cod` / `transfer` | Semua proses selesai |
| `pickup_terkirim` | `delivered` | `paid` | `cod` / `transfer` | Semua proses selesai |
| `batal` | `cancelled` | `unpaid` | — | — |
| `ditolak` | `rejected` | `unpaid` | — | — |

### 6.2 Refactor `createOrdersForOutlet` di `LaundryBusinessSeeder`

**File:** `database/seeders/LaundryBusinessSeeder.php`

**Target:** Minimum **3 order per skenario** per outlet. Kasir menjadi employee order, produksi mengerjakan proses.

```php
private function createOrdersForOutlet(
    \Illuminate\Support\Collection $employees,
    $customers,
    $services
): void {
    $kasir    = $employees->firstWhere(fn($e) => $this->hasSlug($e, 'kasir'));
    $produksi = $employees->firstWhere(fn($e) => $this->hasSlug($e, 'produksi'));
    $kurir    = $employees->firstWhere(fn($e) => $this->hasSlug($e, 'kurir'));

    $scenarios = $this->buildOrderScenarios($kasir, $kurir);

    foreach ($scenarios as $scenario) {
        for ($i = 0; $i < 3; $i++) {
            $customer = $customers->random();
            $order    = $this->createOrderFromScenario($scenario, $customer);
            $this->createOrderItemsForOrder($order, $services, $produksi);
        }
    }
}

private function hasSlug(Employee $employee, string $slug): bool
{
    return $employee->positions()
        ->where('slug', $slug)
        ->exists();
}

private function buildOrderScenarios(Employee $kasir, Employee $kurir): array
{
    return [
        [
            'employee'       => $kasir,
            'status'         => Order::STATUS_RECEIVED,
            'payment_status' => Order::PAYMENT_STATUS_UNPAID,
            'payment_method' => 'cash',
            'type'           => 'walkin',
        ],
        [
            'employee'       => $kasir,
            'status'         => Order::STATUS_WEIGHING,
            'payment_status' => Order::PAYMENT_STATUS_UNPAID,
            'payment_method' => 'cash',
            'type'           => 'walkin',
        ],
        [
            'employee'       => $kasir,
            'status'         => Order::STATUS_READY_TO_PROCESS,
            'payment_status' => Order::PAYMENT_STATUS_PARTIAL,
            'payment_method' => 'qris',
            'type'           => 'walkin',
        ],
        [
            'employee'       => $kasir,
            'status'         => Order::STATUS_IN_PROGRESS,
            'payment_status' => Order::PAYMENT_STATUS_PARTIAL,
            'payment_method' => 'transfer',
            'type'           => 'walkin',
        ],
        [
            'employee'       => $kasir,
            'status'         => Order::STATUS_READY,
            'payment_status' => Order::PAYMENT_STATUS_PAID,
            'payment_method' => 'qris',
            'type'           => 'walkin',
        ],
        [
            'employee'       => $kasir,
            'status'         => Order::STATUS_COMPLETED,
            'payment_status' => Order::PAYMENT_STATUS_PAID,
            'payment_method' => 'cash',
            'type'           => 'walkin',
        ],
        [
            'employee'       => $kurir,
            'status'         => Order::STATUS_REQUESTED,
            'payment_status' => Order::PAYMENT_STATUS_UNPAID,
            'payment_method' => 'cod',
            'type'           => 'pickup',
        ],
        [
            'employee'       => $kurir,
            'status'         => Order::STATUS_PICKING_UP,
            'payment_status' => Order::PAYMENT_STATUS_UNPAID,
            'payment_method' => 'cod',
            'type'           => 'pickup',
        ],
        [
            'employee'       => $kurir,
            'status'         => Order::STATUS_DELIVERING,
            'payment_status' => Order::PAYMENT_STATUS_PAID,
            'payment_method' => 'cod',
            'type'           => 'pickup',
        ],
        [
            'employee'       => $kurir,
            'status'         => Order::STATUS_DELIVERED,
            'payment_status' => Order::PAYMENT_STATUS_PAID,
            'payment_method' => 'transfer',
            'type'           => 'pickup',
        ],
        [
            'employee'       => $kasir,
            'status'         => Order::STATUS_CANCELLED,
            'payment_status' => Order::PAYMENT_STATUS_UNPAID,
            'payment_method' => null,
            'type'           => 'cancelled',
        ],
        [
            'employee'       => $kasir,
            'status'         => Order::STATUS_REJECTED,
            'payment_status' => Order::PAYMENT_STATUS_UNPAID,
            'payment_method' => null,
            'type'           => 'rejected',
        ],
    ];
}
```

### 6.3 Method `createOrderFromScenario`

```php
private function createOrderFromScenario(array $scenario, Customer $customer): Order
{
    $orderDate           = fake()->dateTimeBetween('-3 months', '-1 day');
    $estimatedCompletion = Carbon::parse($orderDate)->addDays(fake()->numberBetween(1, 3));

    $actualCompletion = null;
    $pickupDate       = null;

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

    $subtotal      = fake()->numberBetween(50000, 500000);
    $taxAmount     = $subtotal * 0.1;
    $totalAmount   = $subtotal + $taxAmount;

    $paidAmount = match ($scenario['payment_status']) {
        Order::PAYMENT_STATUS_PAID    => $totalAmount,
        Order::PAYMENT_STATUS_PARTIAL => $totalAmount * fake()->randomFloat(2, 0.3, 0.7),
        default                       => 0,
    };

    return Order::create([
        'employee_id'          => $scenario['employee']->id,
        'customer_id'          => $customer->id,
        'order_number'         => 'ORD' . Carbon::parse($orderDate)->format('Ymd') . fake()->unique()->numberBetween(1000, 9999),
        'status'               => $scenario['status'],
        'subtotal'             => $subtotal,
        'discount_amount'      => 0,
        'tax_amount'           => $taxAmount,
        'total_amount'         => $totalAmount,
        'paid_amount'          => $paidAmount,
        'remaining_amount'     => $totalAmount - $paidAmount,
        'payment_status'       => $scenario['payment_status'],
        'payment_method'       => $scenario['payment_method'],
        'order_date'           => $orderDate,
        'estimated_completion' => $estimatedCompletion,
        'actual_completion'    => $actualCompletion,
        'pickup_date'          => $pickupDate,
        'last_status_update'   => $actualCompletion ?? $orderDate,
        'updated_by'           => $scenario['employee']->id,
    ]);
}
```

### 6.4 Method `createOrderItemsForOrder`

Employee produksi digunakan untuk order item process log — hanya jika order sudah masuk tahap produksi.

```php
private function createOrderItemsForOrder(Order $order, $services, ?Employee $produksi): void
{
    $itemCount = fake()->numberBetween(1, 3);

    for ($i = 0; $i < $itemCount; $i++) {
        $service  = $services->random();
        $quantity = fake()->randomFloat(2, $service->min_quantity, 10);

        $orderItem = OrderItem::factory()
            ->forOrder($order->id)
            ->withLaundryService($service->id)
            ->withQuantity($quantity)
            ->withSnapshot([
                'category_name'        => $service->category->name,
                'laundry_service_name' => $service->name,
                'unit_name'            => $service->unit->name,
            ])
            ->paidWithCash()
            ->create(['unit_price' => $service->price]);

        $this->createProcessProgressForOrderItem($orderItem, $order->status, $produksi);
    }

    $this->recalculateOrderTotals($order);
}
```

### 6.5 Method `createProcessProgressForOrderItem`

Buat progress produksi konsisten dengan status order.

```php
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

    $laundryServiceProcesses = LaundryServiceProcess::where('laundry_service_id', $orderItem->laundry_service_id)
        ->orderBy('sequence')
        ->get();

    if ($laundryServiceProcesses->isEmpty()) {
        return;
    }

    if (in_array($orderStatus, $completedStatuses)) {
        foreach ($laundryServiceProcesses as $lsp) {
            OrderItemProcess::create([
                'order_item_id' => $orderItem->id,
                'process_id'    => $lsp->process_id,
                'employee_id'   => $produksi->id,
                'sequence'      => $lsp->sequence,
                'status'        => 'completed',
                'started_at'    => now()->subHours(3),
                'completed_at'  => now()->subHours(1),
            ]);
        }
        return;
    }

    if (in_array($orderStatus, $inProgressStatuses)) {
        $halfway = (int) ceil($laundryServiceProcesses->count() / 2);
        foreach ($laundryServiceProcesses->take($halfway) as $lsp) {
            OrderItemProcess::create([
                'order_item_id' => $orderItem->id,
                'process_id'    => $lsp->process_id,
                'employee_id'   => $produksi->id,
                'sequence'      => $lsp->sequence,
                'status'        => 'in_progress',
                'started_at'    => now()->subHours(1),
                'completed_at'  => null,
            ]);
        }
    }
}
```

---

## Urutan Implementasi

```
1. docs/spec/service_spec.md                            — Baca dulu
2. docs/spec/model_spec.md                              — Baca dulu
3. app/Models/Employee.php                              — Tambah isEligibleForProduction()
4. app/Services/EmployeeService.php                     — Tambah guard eligibility di assign process/commission
5. app/Services/OrderItemService.php                    — Tambah guard eligibility di start/complete proses
6. database/seeders/LaundryBusinessSeeder.php           — Refactor createPositionsForOutlet → pakai PositionService
7. database/seeders/LaundryBusinessSeeder.php           — Refactor createEmployeesForOutlet → komposisi kasir/produksi/kurir
8. database/seeders/LaundryBusinessSeeder.php           — Refactor createOrdersForOutlet → scenario-driven
9. database/seeders/LaundryBusinessSeeder.php           — Tambah createOrderFromScenario
10. database/seeders/LaundryBusinessSeeder.php          — Tambah createProcessProgressForOrderItem
11. database/seeders/EmployeeProcessSeeder.php          — Refactor → hanya untuk employee dengan position produksi
```

---

## Checklist Sebelum Commit

- [ ] `isEligibleForProduction()` ada di `Employee` model, di section Business Logic
- [ ] `EmployeeService` menolak assign process jika employee tidak eligible produksi
- [ ] `OrderItemService` menolak start/complete proses jika employee tidak eligible produksi
- [ ] `LaundryBusinessSeeder::createPositionsForOutlet` memanggil `PositionService::createDefaultPositionsForOutlet()`
- [ ] Seeder tidak memiliki definisi position hard-coded (small/medium/large) lagi
- [ ] Setiap outlet seeded memiliki employee kasir, produksi, dan kurir
- [ ] `EmployeeProcessSeeder` hanya assign process ke employee dengan slug `produksi`
- [ ] Setiap outlet seeded memiliki minimal 3 order per skenario
- [ ] Order `completed` atau `delivered` selalu berstatus `paid`
- [ ] Order `cancelled` atau `rejected` selalu berstatus `unpaid`, tanpa progres produksi
- [ ] Order `in_progress` memiliki partial process progress
- [ ] Order `ready`, `delivering`, `delivered`, `completed` memiliki semua process selesai
- [ ] Tidak ada duplikasi aturan eligibility di seeder vs service

---

## Referensi File Penting

| File | Tujuan Review |
|---|---|
| `app/Enums/Permission.php` | Source of truth permission default |
| `app/Services/PositionService.php` | `createDefaultPositionsForOutlet()` dan `getDefaultPositions()` |
| `app/Listeners/CreateOutletPositionsListener.php` | Pastikan runtime dan seeder pakai flow yang sama |
| `app/Models/Employee.php` | Tambah helper method eligibility |
| `app/Enums/OrderStatus.php` | Semua konstanta status order |
| `app/Models/Order.php` | Konstanta `PAYMENT_STATUS_*` dan `STATUS_*` |
| `database/factories/OrderFactory.php` | State factory yang sudah ada — bisa dipakai di seeder |
| `database/seeders/ProcessSeeder.php` | Pastikan proses-proses yang di-assign ke employee valid |
