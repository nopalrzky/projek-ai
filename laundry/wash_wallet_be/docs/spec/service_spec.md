# Service Standardization Specification

> **WashWallet — Aplikasi Kasir**
> Versi: 1.0 | Tanggal: 2026-03-22

Dokumen ini adalah panduan standar untuk **penulisan dan pengembangan Service Class** di proyek WashWallet Aplikasi Kasir. Setiap service baru maupun refaktor service yang sudah ada wajib mengikuti spesifikasi ini.

---

## Daftar Isi

1. [Peran & Tanggung Jawab Service](#1-peran--tanggung-jawab-service)
2. [Struktur File & Penempatan](#2-struktur-file--penempatan)
3. [Pewarisan BaseService](#3-pewarisan-baseservice)
4. [Constructor Injection](#4-constructor-injection)
5. [Urutan Section & Divider](#5-urutan-section--divider)
6. [Read Methods](#6-read-methods)
7. [Write Methods (store / update / destroy)](#7-write-methods-store--update--destroy)
8. [applyFilters Pattern](#8-applyfilters-pattern)
9. [Logging](#9-logging)
10. [Exception Handling](#10-exception-handling)
11. [Database Transactions](#11-database-transactions)
12. [Return Value & Eager Loading](#12-return-value--eager-loading)
13. [Multi-Tenant Scope](#13-multi-tenant-scope)
14. [Konvensi Penamaan Method](#14-konvensi-penamaan-method)
15. [Aturan Umum Lainnya](#15-aturan-umum-lainnya)
16. [Template Service](#16-template-service)

---

## 1. Peran & Tanggung Jawab Service

Service adalah lapisan **business logic** — bukan lapisan database dan bukan lapisan HTTP.

| Yang dilakukan Service ✅                        | Yang TIDAK dilakukan Service ❌                            |
| ------------------------------------------------ | ---------------------------------------------------------- |
| Mengorkestrasikan operasi model dan relasi       | Memvalidasi request HTTP (tugas Form Request)              |
| Menerapkan aturan bisnis (cek status, hak akses) | Memformat response JSON (tugas Resource/Controller)        |
| Membungkus operasi multi-model dalam transaksi   | Langsung akses `$request->input()` atau `$request->file()` |
| Menerapkan tenant scope (owner/outlet/admin)     | Mendefinisikan route atau middleware                       |
| Logging dan audit trail                          | Memanggil service lain secara circular                     |

---

## 2. Struktur File & Penempatan

- Semua service ditempatkan di `app/Services/`.
- Sub-folder diizinkan untuk grouping: `app/Services/Export/`, `app/Services/Import/`.
- Nama file: **PascalCase**, diakhiri `Service`: `OrderService.php` → `class OrderService`.
- Namespace: `namespace App\Services;`

---

## 3. Pewarisan BaseService

**Semua service wajib meng-extend `BaseService`**, kecuali service yang bersifat utility murni (seperti `ImageService`, `LocationService`).

```php
class OrderService extends BaseService
{
    // ...
}
```

### Kemampuan yang diwarisi dari BaseService

| Method                                          | Fungsi                                                        |
| ----------------------------------------------- | ------------------------------------------------------------- |
| `applyTenantScope($query)`                      | Filter query berdasarkan role: super_admin / owner / employee |
| `paginate($query, $perPage, $page)`             | Paginate atau get-all berdasarkan parameter                   |
| `applySort($query, ...)`                        | Safe ordering dengan whitelist kolom                          |
| `resolveUser()`                                 | Ambil authenticated user/employee, throw jika tidak ada       |
| `resolveOwnerId()`                              | Ambil owner ID dari konteks auth (user atau employee→outlet)  |
| `resolveOutletId()`                             | Ambil outlet ID, hanya valid di employee guard                |
| `isEmployee()` / `isOwner()` / `isSuperAdmin()` | Cek role auth saat ini                                        |

---

## 4. Constructor Injection

Gunakan **Constructor Property Promotion** (PHP 8.0+) dengan visibilitas `protected`.

### Aturan

- Semua dependensi (model, service lain) diinject melalui constructor — **tidak boleh** `new ModelClass()` di dalam method atau `app(ModelClass::class)` di dalam method kecuali terpaksa.
- Urutan dependensi: **model utama → model pendukung → service lain**.
- Satu baris per dependensi untuk readability.

### Contoh — Service sederhana

```php
public function __construct(
    protected MembershipPlan $membershipPlan,
) {}
```

### Contoh — Service kompleks

```php
public function __construct(
    protected Expense          $expense,
    protected Account          $account,
    protected Outlet           $outlet,
    protected AccountingService $accountingService,
) {}
```

> **Perhatian:** Jika service lain **belum pasti dibutuhkan** di setiap method (hanya di satu jalur tertentu), gunakan `app(ServiceClass::class)` di dalam method tersebut — jangan inject di constructor untuk menghindari circular dependency.

---

## 5. Urutan Section & Divider

Gunakan divider format standar Laravel:

```php
/*
|--------------------------------------------------------------------------
| Nama Section
|--------------------------------------------------------------------------
*/
```

### Urutan Section

```
1. Read Methods    — Query & retrieve data
2. Write Methods   — store / update / destroy / bisnis action (approve, reject, dll)
3. Private / Protected — applyFilters, helpers internal
```

Jika ada beberapa sub-domain dalam satu service (seperti CustomerService yang mengelola Customer + Subscription + MembershipContract), gunakan divider dengan label yang lebih spesifik:

```php
/*
|--------------------------------------------------------------------------
| Write Methods — Customer
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Write Methods — Customer Subscription
|--------------------------------------------------------------------------
*/
```

---

## 6. Read Methods

### Pola Signature

```php
public function getAll{Resource}(
    array $filters = [],
    ?int $page = null,
    ?int $perPage = null,
    array $relations = ['relasi_default']
): LengthAwarePaginator|Collection
```

### Aturan Read Methods

1. **Selalu mulai dengan** `$query = $this->model->query();`
2. **Terapkan tenant scope** dengan `$this->applyTenantScope($query)` untuk method yang list semua data.
3. **Terapkan filter** dengan `$this->applyFilters($query, $filters)`.
4. **Eager load** relasi dengan `$query->with($relations)` jika `$relations` tidak kosong.
5. **Paginate** dengan `$this->paginate($query, $perPage, $page)`.
6. Bungkus dengan `try/catch` → log error → `throw $e`.

### Pola Standar getAll

```php
public function getAll(
    array $filters = [],
    ?int $page = null,
    ?int $perPage = null,
    array $relations = ['outlet', 'employee', 'expenseAccount']
): LengthAwarePaginator|Collection {
    try {
        $query = $this->expense->query();

        $this->applyTenantScope($query);
        $this->applyFilters($query, $filters);

        if (!empty($relations)) {
            $query->with($relations);
        }

        return $this->paginate($query, $perPage, $page);
    } catch (Exception $e) {
        Log::error('Failed to get expenses', [
            'filters' => $filters,
            'error'   => $e->getMessage(),
            'user_id' => Auth::id(),
            'type'    => 'expense_service_error',
        ]);
        throw $e;
    }
}
```

### Pola Standar getById

```php
public function getById(
    int $id,
    array $relations = ['outlet', 'employee', 'expenseAccount']
): Expense {
    try {
        $query = $this->expense->query();

        $this->applyTenantScope($query);

        return $query->with($relations)->findOrFail($id);
    } catch (Exception $e) {
        Log::error('Failed to get expense by ID', [
            'expense_id' => $id,
            'error'      => $e->getMessage(),
            'type'       => 'expense_service_error',
        ]);
        throw $e;
    }
}
```

### Pola getStats

Method aggregate/statistic, return `array`, selalu apply tenant scope:

```php
public function getStats(): array
{
    try {
        $query = $this->model->query();
        $this->applyTenantScope($query);

        // gunakan clone agar query dasar tidak termutasi
        $total  = (clone $query)->count();
        $active = (clone $query)->where('is_active', true)->count();

        return [
            ['label' => 'Total',  'value' => $total,  'icon' => 'Users',     'variant' => 'primary'],
            ['label' => 'Aktif',  'value' => $active, 'icon' => 'UserCheck', 'variant' => 'success'],
        ];
    } catch (Exception $e) {
        Log::error('Failed to get stats', [
            'error' => $e->getMessage(),
            'type'  => '{resource}_service_error',
        ]);
        throw $e;
    }
}
```

---

## 7. Write Methods (store / update / destroy)

### `store(array $data): Model`

```php
public function store(array $data): Expense
{
    return DB::transaction(function () use ($data) {
        try {
            // 1. Resolve dan validasi dependensi
            $outlet = $this->outlet->findOrFail($data['outletId']);

            // 2. Validasi business rule
            if ($outlet->owner_id !== $this->resolveOwnerId()) {
                throw new Exception('Akses ditolak.');
            }

            // 3. Buat model
            $expense = $this->expense->create([
                'outlet_id' => $outlet->id,
                'amount'    => $data['amount'],
                // ...
            ]);

            // 4. Log
            Log::info('Expense created successfully', [
                'expense_id' => $expense->id,
                'outlet_id'  => $outlet->id,
                'user_id'    => Auth::id(),
                'type'       => 'expense_management',
            ]);

            // 5. Return dengan relasi yang dibutuhkan
            return $expense->load(['outlet', 'employee']);
        } catch (Exception $e) {
            Log::error('Failed to create expense', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'expense_service_error',
            ]);
            throw $e;
        }
    });
}
```

### `update(int $id, array $data): Model`

```php
public function update(int $id, array $data): Expense
{
    return DB::transaction(function () use ($id, $data) {
        try {
            // 1. Ambil data yang akan diupdate
            $expense = $this->getById($id);

            // 2. Validasi business rule
            if (!$expense->canBeEdited()) {
                throw new Exception("Expense tidak dapat diubah saat status: {$expense->status}");
            }

            // 3. Bangun array update (hanya field yang dikirim)
            $updateData = [];
            if (isset($data['amount']))      $updateData['amount']      = $data['amount'];
            if (isset($data['description'])) $updateData['description'] = $data['description'];

            $expense->update($updateData);

            Log::info('Expense updated successfully', [
                'expense_id' => $id,
                'changes'    => array_keys($updateData),
                'user_id'    => Auth::id(),
                'type'       => 'expense_management',
            ]);

            return $expense->fresh(['outlet', 'employee']);
        } catch (Exception $e) {
            Log::error('Failed to update expense', [
                'expense_id' => $id,
                'error'      => $e->getMessage(),
                'type'       => 'expense_service_error',
            ]);
            throw $e;
        }
    });
}
```

### `destroy(int $id): bool`

```php
public function destroy(int $id): bool
{
    try {
        $expense = $this->getById($id);
        $deleted = $expense->delete();

        if ($deleted) {
            Log::info('Expense soft deleted', [
                'expense_id' => $id,
                'user_id'    => Auth::id(),
                'type'       => 'expense_management',
            ]);
        }

        return $deleted;
    } catch (Exception $e) {
        Log::error('Failed to delete expense', [
            'expense_id' => $id,
            'error'      => $e->getMessage(),
            'type'       => 'expense_service_error',
        ]);
        throw $e;
    }
}
```

### `restore(int $id): Model`

```php
public function restore(int $id): Expense
{
    try {
        $expense = $this->expense->withTrashed()->findOrFail($id);
        $expense->restore();

        Log::info('Expense restored', [
            'expense_id' => $id,
            'user_id'    => Auth::id(),
            'type'       => 'expense_management',
        ]);

        return $expense;
    } catch (Exception $e) {
        Log::error('Failed to restore expense', [
            'expense_id' => $id,
            'error'      => $e->getMessage(),
            'type'       => 'expense_service_error',
        ]);
        throw $e;
    }
}
```

### `forceDestroy(int $id): bool`

```php
public function forceDestroy(int $id): bool
{
    try {
        $expense = $this->expense->withTrashed()->findOrFail($id);

        // Cleanup side effects sebelum hapus
        if ($expense->attachment) {
            Storage::disk('public')->delete($expense->attachment);
        }

        $deleted = $expense->forceDelete();

        Log::info('Expense permanently deleted', [
            'expense_id' => $id,
            'user_id'    => Auth::id(),
            'type'       => 'expense_management',
        ]);

        return $deleted;
    } catch (Exception $e) {
        Log::error('Failed to force delete expense', [
            'expense_id' => $id,
            'error'      => $e->getMessage(),
            'type'       => 'expense_service_error',
        ]);
        throw $e;
    }
}
```

### Business Action Methods (approve, reject, cancel, dll)

Sama seperti write method — bungkus dengan `DB::transaction` jika ada perubahan data lebih dari satu, selalu:

1. Ambil model dengan `getXxxById()`.
2. Cek capability model: `$model->canBeApproved()`.
3. Lakukan mutasi.
4. Log action-specific type.
5. Return `$model->fresh()`.

```php
public function approve(int $id): Expense
{
    return DB::transaction(function () use ($id) {
        try {
            $expense = $this->getById($id);

            if (!$expense->canBeApproved()) {
                throw new Exception("Expense tidak dapat disetujui. Status: {$expense->status}");
            }

            $expense->update([
                'status'      => 'approved',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);

            Log::info('Expense approved', [
                'expense_id'  => $expense->id,
                'approved_by' => Auth::id(),
                'type'        => 'expense_approval',
            ]);

            return $expense->fresh();
        } catch (Exception $e) {
            Log::error('Failed to approve expense', [
                'expense_id' => $id,
                'error'      => $e->getMessage(),
                'type'       => 'expense_service_error',
            ]);
            throw $e;
        }
    });
}
```

---

## 8. applyFilters Pattern

Setiap service memiliki satu method `applyFilters` yang dipanggil pada semua read methods. Method ini bersifat **protected** (bisa digunakan oleh subclass) atau **private** jika tidak akan dioverride.

### Signature

```php
protected function applyFilters(Builder $query, array $filters = []): void
```

> **Catatan:** Gunakan `Builder $query` (bukan `Builder &$query`) karena objek Builder diteruskan by reference secara implisit di PHP.

### Pola applyFilters

```php
protected function applyFilters(Builder $query, array $filters = []): void
{
    // 1. Search — selalu pertama
    if (!empty($filters['search'])) {
        $query->search($filters['search']);
    }

    // 2. Filter FK / kolom spesifik
    if (!empty($filters['outletId'])) {
        $query->byOutletId($filters['outletId']);
    }

    if (!empty($filters['employeeId'])) {
        $query->byEmployeeId($filters['employeeId']);
    }

    // 3. Filter status / boolean
    if (isset($filters['status'])) {
        $query->byStatus($filters['status']);
    }

    if (isset($filters['isActive']) && $filters['isActive'] !== null) {
        $filters['isActive'] ? $query->active() : $query->inactive();
    }

    // 4. Filter range (amount, date)
    if (!empty($filters['startDate'])) {
        $query->startDate($filters['startDate']);
    }

    if (!empty($filters['endDate'])) {
        $query->endDate($filters['endDate']);
    }

    if (!empty($filters['minAmount'])) {
        $query->minAmount($filters['minAmount']);
    }

    if (!empty($filters['maxAmount'])) {
        $query->maxAmount($filters['maxAmount']);
    }

    // 5. Sorting — selalu terakhir
    $query->sortBy(
        $filters['sortBy']        ?? 'createdAt',
        $filters['sortDirection'] ?? 'desc'
    );
}
```

### Aturan applyFilters

- `search` selalu diproses **pertama**.
- Sorting selalu diproses **terakhir**.
- Gunakan `!empty()` untuk filter yang nilainya string/integer (hindari filter dengan string kosong `""`).
- Gunakan `isset($filters['key']) && $filters['key'] !== null` untuk filter boolean yang harus bisa bernilai `false`.
- Semua kunci filter menggunakan **camelCase** (konsisten dengan input dari controller/request).

---

## 9. Logging

### Aturan Logging

- **Setiap operasi sukses** harus di-log dengan `Log::info`.
- **Setiap exception** harus di-log dengan `Log::error`.
- Selalu sertakan field `type` sebagai kategori log untuk memudahkan filtering di log management.

### Struktur Log Info (sukses)

```php
Log::info('{Resource} {action} successfully', [
    '{resource}_id' => $model->id,
    'outlet_id'     => $model->outlet_id,      // jika relevan
    'user_id'       => Auth::id(),
    'type'          => '{resource}_management', // atau '{resource}_{action}'
]);
```

### Struktur Log Error

```php
Log::error('Failed to {action} {resource}', [
    '{resource}_id' => $id,                    // jika ada
    'error'         => $e->getMessage(),        // selalu ada
    'user_id'       => Auth::id(),             // selalu ada
    'type'          => '{resource}_service_error',
]);
```

### Referensi Tipe Log

| Konteks                   | Nilai `type`               |
| ------------------------- | -------------------------- |
| Operasi CRUD umum         | `{resource}_management`    |
| Approval/rejection/action | `{resource}_{action}`      |
| Error di service          | `{resource}_service_error` |
| Debug (development only)  | Gunakan `Log::debug()`     |

### Contoh Tipe Log

```
expense_management     → store, update, destroy, restore
expense_approval       → approve
expense_rejection      → reject
expense_service_error  → semua catch block
customer_service_action → store, update, destroy customer
order_management       → buat/ubah/hapus order
```

> **Jangan** log data sensitif (password, token, nomor rekening penuh) di dalam array log context.

---

## 10. Exception Handling

### Aturan

- Gunakan `throw new Exception(...)` dengan pesan yang informatif dan bisa dibaca manusia (bahasa Indonesia jika pesan ditampilkan ke user, bahasa Inggris jika hanya untuk developer).
- **Jangan** catch exception hanya untuk diam — selalu re-throw setelah log.
- **Jangan** throw exception di dalam catch, kecuali untuk wrapping dengan konteks tambahan.
- Gunakan `firstOrFail()` / `findOrFail()` — jangan `first()` lalu null-check manual jika modelnya wajib ada.

```php
// ✅ Benar
$expense = $this->expense->query()->findOrFail($id);

// ❌ Tidak perlu
$expense = $this->expense->query()->find($id);
if (!$expense) throw new Exception('Not found');
```

### Cek Business Rule Sebelum Mutasi

Gunakan helper method dari model:

```php
if (!$expense->canBeApproved()) {
    throw new Exception("Expense tidak dapat disetujui. Status saat ini: {$expense->status}");
}
```

---

## 11. Database Transactions

### Kapan Menggunakan Transaksi

| Kondisi                                      | Gunakan Transaksi?      |
| -------------------------------------------- | ----------------------- |
| Hanya satu operasi model (`create`/`update`) | Tidak wajib, tapi boleh |
| Beberapa model yang harus konsisten          | **Wajib**               |
| Ada side effect (file upload, notifikasi)    | **Wajib**               |
| Read-only (query)                            | Tidak diperlukan        |

### Pola Transaksi

```php
return DB::transaction(function () use ($data) {
    try {
        // logika di sini
        return $result;
    } catch (Exception $e) {
        // Log lalu re-throw — DB::transaction auto-rollback jika ada exception
        Log::error('Failed to ...', ['error' => $e->getMessage(), 'type' => '...']);
        throw $e;
    }
});
```

> `DB::transaction()` sudah otomatis rollback jika ada exception yang tidak ditangkap di dalam closure. Jangan panggil `DB::rollBack()` manual kecuali ada alasan spesifik.

### Side Effects dalam Transaksi

Untuk side effect seperti file upload atau notifikasi yang tidak bisa di-rollback:

```php
$uploadedPath = null;

return DB::transaction(function () use ($data, &$uploadedPath) {
    try {
        if ($data['attachment'] ?? null) {
            $uploadedPath = $this->handleFileUpload($data['attachment']);
        }

        $model = $this->model->create([...]);
        return $model;
    } catch (Exception $e) {
        // Rollback file yang sudah diupload
        if ($uploadedPath) {
            Storage::disk('public')->delete($uploadedPath);
        }
        Log::error('...', ['error' => $e->getMessage()]);
        throw $e;
    }
});
```

---

## 12. Return Value & Eager Loading

### Setelah store

Gunakan `->load(['relasi'])` untuk eager load pada model yang baru dibuat:

```php
return $expense->load(['outlet', 'employee', 'expenseAccount']);
```

### Setelah update

Gunakan `->fresh(['relasi'])` untuk reload dari database (memastikan nilai terbaru):

```php
return $expense->fresh(['outlet', 'employee']);
```

### Kapan pakai `load` vs `fresh`

| Situasi                                            | Gunakan     |
| -------------------------------------------------- | ----------- |
| Model baru (`create`) — belum ada di DB sebelumnya | `->load()`  |
| Model lama yang diupdate — perlu data terbaru      | `->fresh()` |
| Perlu reload semua relasi dari nol                 | `->fresh()` |

### Relasi Default

Setiap method yang return model sebaiknya menyertakan relasi yang paling umum dibutuhkan konsumen (controller/resource). Tentukan default di parameter method:

```php
public function getById(
    int $id,
    array $relations = ['outlet', 'employee', 'user', 'expenseAccount', 'sourceAccount']
): Expense
```

---

## 13. Multi-Tenant Scope

Semua query data yang berhubungan dengan ownership tenant **wajib** menggunakan `applyTenantScope`. Ini memastikan:

- `super_admin` → melihat semua data
- `owner` → hanya data milik outlet-nya (`byOwnerId`)
- `employee` → hanya data outlet tempat dia berkerja (`byOutletId`)

```php
$query = $this->expense->query();
$this->applyTenantScope($query);
```

### Pengecualian

Jika sudah ada filter eksplisit (byOutletId, byOwnerId) dan hak akses sudah divalidasi sebelumnya, `applyTenantScope` tidak perlu duplikat. Contoh: method `getByOutletId` yang dipanggil dari controller yang sudah memvalidasi outlet ownership.

---

## 14. Konvensi Penamaan Method

### Read Methods

| Tujuan                                   | Nama Method                             |
| ---------------------------------------- | --------------------------------------- |
| List semua (tenant-scoped)               | `getAll{Resources}()`                   |
| Get by ID                                | `get{Resource}ById(int $id)`            |
| Get by context (outlet, owner, customer) | `get{Resources}By{Context}(int $ctxId)` |
| Statistik/aggregate                      | `getStats(): array`                     |
| Summary/report                           | `get{Resource}Summary()`                |

### Write Methods

| Tujuan               | Nama Method                       |
| -------------------- | --------------------------------- |
| Buat baru            | `store(array $data)`              |
| Update               | `update(int $id, array $data)`    |
| Soft delete          | `destroy(int $id)`                |
| Restore soft delete  | `restore(int $id)`                |
| Permanent delete     | `forceDestroy(int $id)`           |
| Approve action       | `approve(int $id)`                |
| Reject action        | `reject(int $id, string $reason)` |
| Cancel action        | `cancel(int $id)`                 |
| Custom bisnis action | `{verb}{Resource}(int $id, ...)`  |

### Private / Protected Methods

| Tujuan                          | Nama Method                                               |
| ------------------------------- | --------------------------------------------------------- |
| Filter query internal           | `applyFilters(Builder $query, array $filters)`            |
| Resolve creator                 | `determineCreator(): array`                               |
| Handle file upload              | `handleFileUpload(UploadedFile $file): string`            |
| Validasi akses user ke resource | `canUserModify{Resource}(User $user, Model $model): bool` |

---

## 15. Aturan Umum Lainnya

### Input Data Convention

- Service menerima input dalam format **camelCase array** (bukan `snake_case`). Konversi ke `snake_case` dilakukan di dalam service sebelum diteruskan ke model.
    ```php
    // Input: $data['outletId']
    // Masuk ke model: 'outlet_id' => $data['outletId']
    ```
- Jangan passing `Request` object ke service — hanya array data.

### Tidak Boleh

- ❌ Menulis query Eloquent langsung di controller — pindahkan ke service.
- ❌ Mengakses `Auth::user()` di controller untuk keperluan bisnis — lakukan di service.
- ❌ Memanggil `DB::rollBack()` manual dalam transaksi yang wrap dengan `DB::transaction()`.
- ❌ `Log::info` tanpa field `type`.
- ❌ Exception dengan pesan kosong atau generic: `throw new Exception('Error')`.
- ❌ `app(ServiceClass::class)` di dalam loop atau method yang sering dipanggil — inject di constructor.

### Direkomendasikan

- ✅ Gunakan `(clone $query)` untuk operasi aggregate parallel pada query yang sama agar tidak mutasi query dasar.
- ✅ Gunakan model helper untuk cek kapabilitas: `$model->canBeDeleted()`, `$model->canBeApproved()`.
- ✅ Pisahkan logic kompleks ke private helper method yang bernama jelas.
- ✅ Jika service butuh service lain yang sama-sama besar, pertimbangkan memecah domain atau menggunakan event/job.

---

## 15. Laravel 13 & PHP 8.4 Utilities

### `Cache::touch()`

Untuk memperbarui Time-To-Live (TTL) cache tanpa perlu melakukan fetch dan write kembali data tersebut, gunakan method `Cache::touch($key, $ttl)`. Ini sangat efisien untuk memperpanjang masa aktif cache session, token, atau session metadata:
```php
Cache::touch("user_session:{$userId}", now()->addHours(2));
```

### `Context` Facade

Gunakan facade `Illuminate\Support\Facades\Context` untuk mengelola data request-level (seperti tracking ID, metadata, atau context user) yang ingin Anda distribusikan ke log, background jobs, atau event listeners tanpa harus mem-passing variabel tersebut secara manual melalui constructor.
```php
use Illuminate\Support\Facades\Context;

Context::add('transaction_uuid', $transactionUuid);
Context::add('source', 'mobile_app');
```
Setiap log yang dipicu oleh `Log::info` atau `Log::error` setelah pemanggilan `Context::add` akan otomatis merekam informasi context tersebut.

---


## 16. Template Service

```php
<?php

declare(strict_types=1);

namespace App\Services;


use App\Models\NamaModel;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class NamaModelService extends BaseService
{
    public function __construct(
        protected NamaModel $namaModel,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Read Methods
    |--------------------------------------------------------------------------
    */

    public function getAllNamaModels(
        array $filters = [],
        ?int $page = null,
        ?int $perPage = null,
        array $relations = ['relasi']
    ): LengthAwarePaginator|Collection {
        try {
            $query = $this->namaModel->query();

            $this->applyTenantScope($query);
            $this->applyFilters($query, $filters);

            if (!empty($relations)) {
                $query->with($relations);
            }

            return $this->paginate($query, $perPage, $page);
        } catch (Exception $e) {
            Log::error('Failed to get namaModels', [
                'filters' => $filters,
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'nama_model_service_error',
            ]);
            throw $e;
        }
    }

    public function getNamaModelById(
        int $id,
        array $relations = ['relasi']
    ): NamaModel {
        try {
            $query = $this->namaModel->query();
            $this->applyTenantScope($query);

            return $query->with($relations)->findOrFail($id);
        } catch (Exception $e) {
            Log::error('Failed to get namaModel by ID', [
                'nama_model_id' => $id,
                'error'         => $e->getMessage(),
                'type'          => 'nama_model_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Write Methods
    |--------------------------------------------------------------------------
    */

    public function store(array $data): NamaModel
    {
        return DB::transaction(function () use ($data) {
            try {
                $model = $this->namaModel->create([
                    'kolom' => $data['kolom'],
                ]);

                Log::info('NamaModel created successfully', [
                    'nama_model_id' => $model->id,
                    'user_id'       => Auth::id(),
                    'type'          => 'nama_model_management',
                ]);

                return $model->load(['relasi']);
            } catch (Exception $e) {
                Log::error('Failed to create namaModel', [
                    'error'   => $e->getMessage(),
                    'user_id' => Auth::id(),
                    'type'    => 'nama_model_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function update(int $id, array $data): NamaModel
    {
        return DB::transaction(function () use ($id, $data) {
            try {
                $model = $this->getNamaModelById($id);

                $updateData = [];
                if (isset($data['kolom'])) $updateData['kolom'] = $data['kolom'];

                $model->update($updateData);

                Log::info('NamaModel updated successfully', [
                    'nama_model_id' => $id,
                    'changes'       => array_keys($updateData),
                    'user_id'       => Auth::id(),
                    'type'          => 'nama_model_management',
                ]);

                return $model->fresh(['relasi']);
            } catch (Exception $e) {
                Log::error('Failed to update namaModel', [
                    'nama_model_id' => $id,
                    'error'         => $e->getMessage(),
                    'type'          => 'nama_model_service_error',
                ]);
                throw $e;
            }
        });
    }

    public function destroy(int $id): bool
    {
        try {
            $model   = $this->getNamaModelById($id);
            $deleted = $model->delete();

            if ($deleted) {
                Log::info('NamaModel deleted', [
                    'nama_model_id' => $id,
                    'user_id'       => Auth::id(),
                    'type'          => 'nama_model_management',
                ]);
            }

            return $deleted;
        } catch (Exception $e) {
            Log::error('Failed to delete namaModel', [
                'nama_model_id' => $id,
                'error'         => $e->getMessage(),
                'type'          => 'nama_model_service_error',
            ]);
            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Private — Filters
    |--------------------------------------------------------------------------
    */

    protected function applyFilters(Builder $query, array $filters = []): void
    {
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['outletId'])) {
            $query->byOutletId($filters['outletId']);
        }

        if (isset($filters['isActive']) && $filters['isActive'] !== null) {
            $filters['isActive'] ? $query->active() : $query->inactive();
        }

        $query->sortBy(
            $filters['sortBy']        ?? 'createdAt',
            $filters['sortDirection'] ?? 'desc'
        );
    }
}
```

---

## Checklist Review Service

Gunakan checklist ini saat membuat atau mereview service:

- [ ] File diawali dengan `declare(strict_types=1);`
- [ ] Service extends `BaseService` (kecuali pure utility)
- [ ] Constructor menggunakan Property Promotion — satu baris per dependensi
- [ ] Input menggunakan camelCase array, bukan Request object
- [ ] Section dipisah dengan komentar divider yang jelas
- [ ] Read methods: apply tenant scope → apply filters → with relations → paginate
- [ ] Write methods dibungkus `DB::transaction` (jika multi-model atau ada side effect)
- [ ] Setiap method punya `try/catch` → `Log::error` → `throw $e`
- [ ] `Log::info` ada di setiap operasi sukses dengan field `type`
- [ ] `Log::error` ada di setiap catch block dengan `error` dan `type`
- [ ] `applyFilters` adalah `protected` atau `private` method, dipanggil dari read methods
- [ ] Sorting dilakukan di akhir `applyFilters` via `sortBy()` scope di model
- [ ] Return menggunakan `->load()` untuk model baru, `->fresh()` untuk model lama
- [ ] Business rule dicek menggunakan model helper (`canBeDeleted()`, `canBeApproved()`, dll)
- [ ] Tidak ada akses `$request->input()` di dalam service
- [ ] Tidak ada `new ModelClass()` atau `new ServiceClass()` di luar constructor
- [ ] Menggunakan modern PHP 8.4 features (seperti properti/argument type hinting) secara konsisten

