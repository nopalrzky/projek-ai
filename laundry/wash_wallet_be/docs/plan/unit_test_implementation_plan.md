# Rencana Implementasi: Unit Testing — wash_wallet_be

## Latar Belakang & Konteks

Proyek `wash_wallet_be` adalah backend Laravel 11 untuk aplikasi laundry management. Arsitekturnya terdiri dari:

- **Controllers** (`/app/Http/Controllers/Api/`) — menerima request, mendelegasikan ke Service
- **Services** (`/app/Services/`) — business logic utama, extend `BaseService`
- **Models** (`/app/Models/`) — Eloquent model dengan query scopes, helpers, dan mutators
- **Form Requests** (`/app/Http/Requests/`) — validasi input
- **Resources** (`/app/Http/Resources/`) — transformasi output

Framework test yang sudah terpasang: **Pest PHP v3** (wrapper modern di atas PHPUnit). Mockery juga sudah tersedia.

---

## Apa Itu Unit Test & Manfaatnya?

> **Unit Test** adalah test yang menguji satu "unit" kode secara terisolasi — misalnya satu method, satu class — **tanpa menyentuh database sungguhan** (menggunakan in-memory SQLite atau mock).

### Jenis Test yang Akan Dibuat

| Tipe | Lokasi | Deskripsi |
|------|--------|-----------|
| **Unit Test** | `tests/Unit/` | Test logika murni (helper method, mutator, scope) tanpa HTTP request |
| **Feature Test** | `tests/Feature/` | Test alur HTTP end-to-end (request → controller → service → response) menggunakan database SQLite in-memory |

### Manfaat Konkret untuk Proyek Ini
1. **Memastikan business logic** (approve expense, generate order number, payment status) tidak rusak saat ada perubahan
2. **Dokumentasi living** — test menjelaskan perilaku yang diharapkan
3. **Refactoring aman** — bisa ubah implementasi service tanpa takut merusak logika
4. **Deteksi regresi** — bug yang sudah diperbaiki tidak muncul lagi

---

## Strategi Testing

### Prinsip: Test Behavior, Bukan Implementation
- Fokus pada **apa yang dilakukan**, bukan **bagaimana** dilakukan
- Controller test: mock Service → verifikasi response HTTP
- Service test: gunakan database SQLite in-memory real transactions
- Model test: gunakan database SQLite in-memory untuk scope/query

### Prioritas (High → Low)
1. **Model Helpers & Scopes** — pure logic, mudah dan cepat ditest ✅
2. **Service Business Logic** — kritis, kompleks, banyak edge case ✅
3. **API Feature Tests** — end-to-end flow ✅
4. **Form Request Validation** — validasi rules ⚠️ (lower priority)

---

## Setup & Konfigurasi

### A. `phpunit.xml` yang Perlu Dicek/Diupdate

File sudah ada. Pastikan konfigurasi database untuk testing menggunakan SQLite in-memory:

```xml
<!-- phpunit.xml -->
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
<env name="CACHE_DRIVER" value="array"/>
<env name="SESSION_DRIVER" value="array"/>
<env name="QUEUE_CONNECTION" value="sync"/>
```

### B. `tests/Pest.php` — Update Konfigurasi

File ini perlu diupdate untuk menambahkan helper functions global yang dipakai semua test:

#### [MODIFY] [Pest.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/tests/Pest.php)

Tambahkan helper function untuk membuat user dan employee terautentikasi:

```php
// Helper: buat user owner yang sudah login
function actingAsOwner(): User
function actingAsEmployee(): Employee  
function actingAsSuperAdmin(): User
```

---

## Proposed Changes

### Layer 1 — Model Tests (Unit Tests)
> Lokasi: `tests/Unit/Models/`

---

#### [NEW] `tests/Unit/Models/ExpenseModelTest.php`

Test untuk semua method dan scope di `App\Models\Expense`.

**Kasus uji:**
```
describe('Query Scopes')
├── scopeByOutletId → filter berdasarkan outlet_id
├── scopeByEmployeeId → filter berdasarkan employee_id
├── scopeByOwnerId → filter melalui relasi outlet.owner_id
├── scopePending → hanya status 'pending'
├── scopeApproved → hanya status 'approved'
├── scopeRejected → hanya status 'rejected'
├── scopeStartDate → data dari tanggal tertentu
├── scopeEndDate → data sampai tanggal tertentu
├── scopeMinAmount → amount >= nilai
├── scopeMaxAmount → amount <= nilai
├── scopeHasAttachment → memiliki attachment
├── scopeNoAttachment → tidak memiliki attachment
└── scopeSearch → cari di code, description, employee.name, user.name

describe('Helper Methods')
├── isPending() → true jika status = 'pending'
├── isApproved() → true jika status = 'approved'
├── isRejected() → true jika status = 'rejected'
├── canBeApproved() → true hanya saat pending
├── canBeRejected() → true hanya saat pending
├── canBeCancelled() → true hanya saat pending
├── isCreatedByOwner() → true jika user_id tidak kosong
├── isCreatedByEmployee() → true jika employee_id tidak kosong
├── getStatusLabel() → kembalikan label Indonesia yang benar
└── getStatusColor() → kembalikan warna yang sesuai

describe('Static Methods')
├── generateCode() → format EXP-YYYYMMDD-XXXX, incremental setiap hari
├── getTotalByOutlet() → sum amount untuk outlet tertentu
├── getTotalByExpenseAccount() → sum amount untuk account tertentu
├── getDailySummary() → kembalikan summary benar untuk tanggal itu
└── getMonthlySummary() → kembalikan summary benar untuk bulan/tahun itu

describe('Accessors')
├── attachmentUrl → null jika tidak ada, URL storage jika ada
└── hasAttachment → false jika attachment null/kosong, true jika ada
```

---

#### [NEW] `tests/Unit/Models/OrderModelTest.php`

Test untuk `App\Models\Order`.

**Kasus uji:**
```
describe('Lifecycle Hooks — creating')
├── auto-generate order_number jika kosong
├── auto-set order_date ke now() jika kosong
├── hitung remaining_amount = total - paid
└── set payment_status berdasarkan paid vs total

describe('Lifecycle Hooks — updating')
├── recalculate remaining_amount saat paid_amount berubah
├── recalculate payment_status saat total_amount berubah
└── set last_status_update saat status berubah

describe('updatePaymentStatus (private helper)')
├── paid_amount = 0 → payment_status = 'unpaid'
├── paid_amount < total_amount → payment_status = 'partial'
└── paid_amount >= total_amount → payment_status = 'paid'

describe('Status Helpers')
├── canBeEdited() → true hanya saat 'pending'
├── canBeCancelled() → true hanya saat 'pending'
├── canBeDeleted() → true saat 'cancelled' atau 'delivered'
└── getStatusLabel() → mapping benar semua status

describe('generateOrderNumber() — static')
├── format ORD-YYYYMMDD-XXXX
└── increment sequential pada hari sama
```

---

#### [NEW] `tests/Unit/Models/CustomerModelTest.php`

Test untuk `App\Models\Customer` — terutama scope dan helper.

**Kasus uji:**
```
├── scopeActive / scopeInactive
├── scopeByGender
├── scopeByOutletId / scopeByOwnerId
├── scopeSearch (cari di name, phone, email)
└── getFullAddress() → gabungkan field address menjadi string
```

---

#### [NEW] `tests/Unit/Models/UserModelTest.php`

Test untuk `App\Models\User`.

**Kasus uji:**
```
├── isOwner() / isSuperAdmin() → berdasarkan Role
├── isActive() / isInactive() / isSuspended() / isPending()
├── generateReferralCode() → 8 karakter unique uppercase
├── totalRevenue() → sum dari completed orders
├── totalOrders() / totalCustomers() / totalOutlets()
└── scopeSearch → cari di name, email, phone, username, referral_code
```

---

### Layer 2 — Service Tests (Feature Tests dengan DB)
> Lokasi: `tests/Feature/Services/`

Test service menggunakan database SQLite in-memory (RefreshDatabase). Tidak di-mock karena kita ingin test **real business logic dengan real DB transactions**.

---

#### [NEW] `tests/Feature/Services/ExpenseServiceTest.php`

**Kasus uji:**
```
describe('getAll()')
├── owner hanya dapat data dari outletnya sendiri (tenant scope)
├── employee hanya dapat data dari outletnya (bukan outlet lain)
├── filter search bekerja
├── filter status bekerja
├── filter dateRange bekerja
└── pagination bekerja

describe('getById()')
├── kembalikan expense yang benar
└── throw ModelNotFoundException jika id tidak ada

describe('store() — dibuat oleh owner')
├── expense dibuat dengan status 'approved' langsung
├── journal entry otomatis dibuat
└── tidak kirim notifikasi

describe('store() — dibuat oleh employee')  
├── expense dibuat dengan status 'pending'
└── notifikasi dikirim ke owner

describe('approve()')
├── berhasil approve expense pending → status menjadi 'approved'
├── journal entry dibuat
└── throw exception jika status bukan 'pending'

describe('reject()')
├── berhasil reject dengan alasan → status menjadi 'rejected'
└── throw exception jika status bukan 'pending'

describe('destroy()')
├── soft delete berhasil
└── throw exception jika tidak ditemukan

describe('getExpenseSummary()')
├── total_amount dan total_count benar
└── filter startDate/endDate bekerja
```

---

#### [NEW] `tests/Feature/Services/OrderServiceTest.php`

**Kasus uji:**
```
describe('getAll()')
├── filter status bekerja
├── filter paymentStatus bekerja
├── tenant scope: employee hanya lihat order di outletnya
└── pagination bekerja

describe('store()')
├── order dibuat dengan data yang benar
├── order_number ter-generate otomatis
├── payment_status ter-set otomatis
└── orderItems dibuat sesuai data

describe('update()')
├── data order terupdate
└── tidak bisa update jika status bukan 'pending'

describe('start()')
├── status berubah dari 'pending' → 'in_progress'
└── throw exception jika bukan 'pending'

describe('complete()')
├── status berubah menjadi 'completed'
└── actual_completion ter-set
```

---

#### [NEW] `tests/Feature/Services/CustomerServiceTest.php`

**Kasus uji:**
```
describe('store()')
├── customer dibuat dengan data yang benar
└── outlet_id terisi berdasarkan context auth

describe('getAll()')
├── filter search bekerja (name, phone)
├── filter gender bekerja
└── filter isActive bekerja

describe('update()')
├── data customer terupdate
└── throw ModelNotFoundException jika tidak ditemukan

describe('storeMembershipContract()')
├── contract dibuat untuk customer
└── validasi customer ownership

describe('storeCustomerSubscription()')
└── subscription dibuat dengan quota yang benar
```

---

#### [NEW] `tests/Feature/Services/BaseServiceTest.php`

Test untuk shared logic di `BaseService` — terutama `applyTenantScope()`.

**Kasus uji:**
```
describe('applyTenantScope()')
├── super_admin → tidak ada filter (lihat semua)
├── owner → filter byOwnerId
├── employee → filter byOutletId
└── unauthenticated → whereRaw('1 = 0') — tidak ada data

describe('paginate()')
├── perPage > 0 → kembalikan LengthAwarePaginator
└── perPage = null/0 → kembalikan Collection (semua data)

describe('applySort()')
├── kolom valid → order by kolom itu
├── kolom tidak valid → fallback ke default
└── direction 'asc' dan 'desc' bekerja benar
```

---

### Layer 3 — API Feature Tests (HTTP Tests)
> Lokasi: `tests/Feature/Api/`

Test end-to-end melalui HTTP. Service **akan di-mock** di sini agar test fokus pada:
- response status code yang benar
- struktur JSON response (success/error format)
- middleware auth berjalan

---

#### [NEW] `tests/Feature/Api/ExpenseApiTest.php`

**Kasus uji:**
```
describe('GET /api/expenses')
├── unauthenticated → 401
├── owner terautentikasi → 200 + pagination meta
└── struktur response benar (success, message, data, meta)

describe('GET /api/expenses/{id}')
├── unauthenticated → 401
├── id ada → 200 + data expense
└── id tidak ada → 404

describe('POST /api/expenses')
├── unauthenticated → 401
├── data valid → 201 + expense dibuat
├── validasi gagal (amount kosong) → 422
└── service throw exception → 500

describe('PUT /api/expenses/{id}')
├── unauthenticated → 401
├── data valid → 200 + expense terupdate
└── id tidak ada → 404

describe('POST /api/expenses/{id}/approve')
├── berhasil approve → 200
└── status bukan pending → 500

describe('POST /api/expenses/{id}/reject')
├── berhasil reject dengan reason → 200
└── status bukan pending → 500
```

---

#### [NEW] `tests/Feature/Api/OrderApiTest.php`

**Kasus uji:**
```
describe('GET /api/orders')
├── unauthenticated → 401
└── authenticated → 200 + pagination

describe('GET /api/orders/{id}')
├── id ada → 200
└── id tidak ada → 404

describe('POST /api/orders')
├── data valid → 201
└── validasi gagal → 422

describe('PUT /api/orders/{orderId}')
├── data valid → 200
└── id tidak ada → 404

describe('DELETE /api/orders/{orderId}')
├── berhasil → 200
└── tidak ada → 404

describe('POST /api/orders/{id}/start')
└── berhasil → 200

describe('POST /api/orders/{id}/complete')
└── berhasil → 200
```

---

#### [NEW] `tests/Feature/Api/CustomerApiTest.php`

**Kasus uji:**
```
describe('GET /api/customers') → 200 + pagination
describe('POST /api/customers') → 201 created
describe('GET /api/customers/{id}') → 200 / 404
describe('PUT /api/customers/{id}') → 200 updated
describe('DELETE /api/customers/{id}') → 200 deleted
describe('POST /api/customers/{id}/membership-contracts') → 201
describe('POST /api/customers/{id}/subscriptions') → 201
```

---

#### [NEW] `tests/Feature/Api/DepositApiTest.php`

**Kasus uji:**
```
describe('GET /api/deposits') → 200 dengan filter
describe('GET /api/deposits/{id}') → 200 / 404
describe('POST /api/deposits') → 201
describe('PUT /api/deposits/{id}') → 200
```

---

### Factory Files yang Perlu Dilengkapi

Banyak factory sudah ada tapi belum memiliki data definition yang lengkap. Perlu update:

| Factory | Perlu diisi |
|---------|-------------|
| `ExpenseFactory.php` | Semua field: code, amount, date, status, outlet_id, dll |
| `OrderFactory.php` | Sudah cukup lengkap (11KB) — verifikasi states |
| `CustomerFactory.php` | name, phone, email, outlet_id, gender, is_active |
| `DepositFactory.php` | Semua field deposit |
| `AccountFactory.php` | type (asset/expense), is_transactional |
| `OutletFactory.php` | Sudah ada — verifikasi owner_id |
| `EmployeeFactory.php` | Sudah ada — verifikasi outlet_id, position |

---

## Struktur File Test Akhir

```
tests/
├── Pest.php                        ← Update: tambah global helpers
├── TestCase.php
├── Unit/
│   └── Models/
│       ├── ExpenseModelTest.php    ← [NEW]
│       ├── OrderModelTest.php      ← [NEW]
│       ├── CustomerModelTest.php   ← [NEW]
│       └── UserModelTest.php       ← [NEW]
└── Feature/
    ├── Services/
    │   ├── BaseServiceTest.php     ← [NEW]
    │   ├── ExpenseServiceTest.php  ← [NEW]
    │   ├── OrderServiceTest.php    ← [NEW]
    │   └── CustomerServiceTest.php ← [NEW]
    └── Api/
        ├── ExpenseApiTest.php      ← [NEW]
        ├── OrderApiTest.php        ← [NEW]
        ├── CustomerApiTest.php     ← [NEW]
        └── DepositApiTest.php      ← [NEW]
```

**Total: 12 file test baru** (tidak termasuk update helper di Pest.php dan factory updates).

---

## Contoh Pola Kode untuk Referensi AI Executor

### Unit Test — Model Scope (Pest style)
```php
// tests/Unit/Models/ExpenseModelTest.php
use App\Models\Expense;
use App\Models\Outlet;

uses(Tests\TestCase::class, Illuminate\Foundation\Testing\RefreshDatabase::class);

describe('scopePending', function () {
    it('hanya mengembalikan expense berstatus pending', function () {
        // Arrange
        $outlet = Outlet::factory()->create();
        Expense::factory()->create(['outlet_id' => $outlet->id, 'status' => 'pending']);
        Expense::factory()->create(['outlet_id' => $outlet->id, 'status' => 'approved']);

        // Act
        $result = Expense::pending()->get();

        // Assert
        expect($result)->toHaveCount(1);
        expect($result->first()->status)->toBe('pending');
    });
});

describe('isPending()', function () {
    it('mengembalikan true jika status pending', function () {
        $expense = new Expense(['status' => 'pending']);
        expect($expense->isPending())->toBeTrue();
    });

    it('mengembalikan false jika status bukan pending', function () {
        $expense = new Expense(['status' => 'approved']);
        expect($expense->isPending())->toBeFalse();
    });
});
```

### Feature Test — API (Pest style with mock)
```php
// tests/Feature/Api/ExpenseApiTest.php
use App\Http\Controllers\Api\ExpenseController;
use App\Services\ExpenseService;

uses(Tests\TestCase::class, Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->owner = \App\Models\User::factory()->create();
    $this->owner->assignRole('owner');
});

describe('GET /api/expenses', function () {
    it('mengembalikan 401 jika tidak terautentikasi', function () {
        $this->getJson('/api/expenses')
            ->assertStatus(401);
    });

    it('mengembalikan 200 dengan pagination untuk owner', function () {
        $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/expenses')
            ->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'meta' => ['current_page', 'per_page', 'total'],
            ]);
    });
});
```

### Feature Test — Service dengan real DB
```php
// tests/Feature/Services/ExpenseServiceTest.php
use App\Services\ExpenseService;

uses(Tests\TestCase::class, Illuminate\Foundation\Testing\RefreshDatabase::class);

describe('getExpenseSummary()', function () {
    it('menghitung total amount dengan benar', function () {
        $owner = \App\Models\User::factory()->create();
        $owner->assignRole('owner');
        $outlet = \App\Models\Outlet::factory()->create(['owner_id' => $owner->id]);

        \App\Models\Expense::factory()->count(3)->create([
            'outlet_id' => $outlet->id,
            'amount'    => 100000,
        ]);

        $this->actingAs($owner);

        $service = app(ExpenseService::class);
        $summary = $service->getExpenseSummary();

        expect($summary['total_count'])->toBe(3);
        expect((float) $summary['total_amount'])->toBe(300000.0);
    });
});
```

---

## Aturan Penting untuk AI Executor

> [!IMPORTANT]
> **Gunakan selalu Pest PHP syntax** (bukan PHPUnit class syntax). Gunakan `describe()`, `it()`, `beforeEach()`, `expect()`.

> [!IMPORTANT]
> **Jangan pernah hit database production**. Semua test harus menggunakan `RefreshDatabase` trait atau mock. Pastikan `.env.testing` atau `phpunit.xml` sudah dikonfigurasi ke SQLite.

> [!WARNING]
> **Expense & Deposit service memanggil `AccountingService`**. Saat test service, ini perlu di-mock atau perlu factory `Account` + `JournalEntry` yang lengkap. Gunakan `app()->bind()` atau `$this->mock()`.

> [!WARNING]
> **Tenant scope bergantung pada `Auth::user()`**. Selalu panggil `actingAs($user)` atau `actingAs($employee, 'employee')` sebelum memanggil service yang membutuhkan autentikasi.

> [!NOTE]
> **Untuk test BaseService**: Buat concrete test class yang meng-extend BaseService karena BaseService adalah abstract class.

---

## Cara Menjalankan Test

```bash
# Jalankan semua test
php artisan test

# Jalankan test spesifik
php artisan test tests/Unit/Models/ExpenseModelTest.php

# Jalankan dengan coverage report
php artisan test --coverage

# Filter test tertentu
php artisan test --filter="scopePending"
```

---

## Verification Plan

Setelah executor selesai membuat semua test, verifikasi:

1. `php artisan test` — semua test hijau (pass) tanpa error
2. `php artisan test --coverage` — coverage ≥ 70% untuk Models dan Services
3. Tidak ada test yang skip atau pending tanpa alasan jelas
4. Semua file test ada di lokasi yang benar sesuai struktur di atas
