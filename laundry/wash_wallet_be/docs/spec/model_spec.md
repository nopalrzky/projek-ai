# Model Standardization Specification

> **WashWallet — Aplikasi Kasir**
> Versi: 1.0 | Tanggal: 2026-03-22

Dokumen ini adalah panduan standar untuk **penulisan dan pengembangan Eloquent Model** di proyek WashWallet Aplikasi Kasir. Setiap model baru maupun refaktor model yang sudah ada wajib mengikuti spesifikasi ini.

---

## Daftar Isi

1. [Struktur File & Penempatan](#1-struktur-file--penempatan)
2. [Urutan Properti & Section](#2-urutan-properti--section)
3. [Traits](#3-traits)
4. [Properti Konfigurasi](#4-properti-konfigurasi)
5. [Lifecycle Hooks (booted)](#5-lifecycle-hooks-booted)
6. [Accessors & Mutators](#6-accessors--mutators)
7. [Relationships](#7-relationships)
8. [Query Scopes](#8-query-scopes)
9. [Helper Methods](#9-helper-methods)
10. [Static Helpers](#10-static-helpers)
11. [Konvensi Penamaan](#11-konvensi-penamaan)
12. [Tipe Data & Casting](#12-tipe-data--casting)
13. [Aturan Umum Lainnya](#13-aturan-umum-lainnya)
14. [Template Model](#14-template-model)

---

## 1. Struktur File & Penempatan

- Semua model ditempatkan di `app/Models/`.
- Satu file = satu kelas model.
- Nama file menggunakan **PascalCase** dan harus identik dengan nama kelas: `OrderItem.php` → `class OrderItem`.
- Namespace: `namespace App\Models;`

---

## 2. Urutan Properti & Section

Setiap model ditulis dengan **urutan section yang konsisten** menggunakan komentar pemisah section.

### Format Komentar Section

Gunakan format divider standar Laravel:

```php
/*
|--------------------------------------------------------------------------
| Nama Section
|--------------------------------------------------------------------------
*/
```

Alternatif yang juga diperbolehkan untuk model yang lebih kecil:

```php
// ================================================================
// NAMA SECTION
// ================================================================
```

> **Pilihlah satu format dan terapkan secara konsisten dalam satu file.**

### Urutan Section

```
1. use statements (imports)
2. class declaration (termasuk PHP Attributes seperti #[Table])
3. Traits
4. TABLE & CONFIGURATION ($table / #[Table] attribute, $fillable, $hidden, casts())
5. LIFECYCLE HOOKS (booted)
6. ACCESSORS & MUTATORS (Attribute::make)
7. RELATIONSHIPS (belongsTo, hasMany, belongsToMany, dll)
8. QUERY SCOPES
9. HELPERS (instance methods)
10. PRIVATE / PROTECTED HELPERS
11. STATIC HELPERS (static methods)
```

---

## 3. Traits

### Aturan

- Traits ditulis pada baris pertama setelah deklarasi kelas (sebelum properti).
- Urutkan traits secara logis: **auth traits → factory → notifiable → behavioral**.
- Pemisahan menggunakan spasi setelah koma, dipisah dalam satu baris `use`.

### Contoh

```php
// Model biasa (bukan Authenticatable)
use HasFactory, SoftDeletes;

// Model Authenticatable (Employee, User)
use HasApiTokens, HasFactory, Notifiable, SoftDeletes;
```

### Kapan Menggunakan SoftDeletes

- **Gunakan** `SoftDeletes` pada model yang datanya sensitif dan perlu riwayat (Order, Customer, Employee, Account, Expense, dll).
- **Tidak perlu** `SoftDeletes` pada model pivot atau log yang sifatnya append-only (PositionRole, ReferralLog, dll).

---

## 4. Properti Konfigurasi

### `#[Table]` Attribute

Sebagai standar proyek untuk Laravel 13, gunakan **PHP Attribute `#[Table]`** secara eksklusif untuk mendefinisikan nama tabel dan primary key. Penggunaan variabel properti `$table` dan `$primaryKey` (cara lama) **dilarang**.

```php
use Illuminate\Database\Eloquent\Attributes\Table;

#[Table('orders')] // snake_case, plural
class Order extends Model { ... }

#[Table('orders', key: 'order_id')] // gunakan key: hanya jika berbeda dari 'id'
class Order extends Model { ... }
```

> **Aturan Proyek:** Semua model baru wajib menggunakan `#[Table]`. Saat melakukan refactor model lama yang masih menggunakan `$table` atau `$primaryKey`, wajib dimigrasi ke `#[Table]`.
### `$fillable`

- Semua kolom yang bisa diisi dari input user/service **wajib** dideclare di `$fillable`.
- **Jangan gunakan** `$guarded = []` — terlalu permisif.
- Setiap entri satu per baris, diurutkan: **foreign keys → kolom inti → kolom status/flag → kolom tambahan**.

```php
protected $fillable = [
    'outlet_id',      // foreign keys dulu
    'customer_id',
    'order_number',   // lalu kolom inti
    'status',
    'total_amount',
    'payment_status', // kolom status
    'notes',          // kolom tambahan
];
```

### `$hidden`

Sembunyikan kolom sensitif dan kolom garbage dari JSON serialization:

```php
protected $hidden = [
    'password',       // kolom sensitif
    'remember_token',
    'deleted_at',     // sembunyikan soft delete dari API response
];
```

### `casts(): array` Method

- Selalu gunakan method `casts(): array` (standar Laravel 11/12/13) daripada properti `$casts` lama.
- Selalu cast tipe data secara eksplisit.
- Format alignment menggunakan `=>` rata kanan (gunakan spasi untuk alignment visual).
- Selalu sertakan `created_at`, `updated_at`, dan `deleted_at` (jika pakai SoftDeletes).
- Urutan: **kolom data → boolean flags → date/datetime → timestamps**.

```php
protected function casts(): array
{
    return [
        'amount'      => 'decimal:2',
        'is_active'   => 'boolean',
        'is_system'   => 'boolean',
        'date'        => 'date',
        'approved_at' => 'datetime',
        'created_at'  => 'datetime',
        'updated_at'  => 'datetime',
        'deleted_at'  => 'datetime',
    ];
}
```

#### Referensi Tipe Cast

| Tipe Kolom       | Cast                               |
| ---------------- | ---------------------------------- |
| integer          | `'integer'`                        |
| boolean / is\_\* | `'boolean'`                        |
| desimal/uang     | `'decimal:2'`                      |
| tanggal saja     | `'date'`                           |
| tanggal + waktu  | `'datetime'`                       |
| JSON / array     | `'array'`                          |
| password         | `'hashed'`                         |
| enum             | `AsStringable` atau class Enum (misal: `UserRole::class`) |


---

## 5. Lifecycle Hooks (booted)

Gunakan `booted()` bukan `boot()` untuk lifecycle hooks di Laravel 8+.

### Kapan Menggunakan

- Set nilai default saat `creating` (gunakan `??=`).
- Komputasi nilai turunan saat `creating` atau `updating`.
- Side-effect: hapus file saat model dihapus (`deleting`).

### Aturan

- Annotasikan tipe parameter: `function (self $model)` atau nama kelas model jika lebih jelas.
- Gunakan `??=` untuk nilai default agar tidak override nilai yang sudah ada.
- Satu hook hanya mengerjakan satu tanggungjawab — pisahkan `creating` dan `updating` jika logikanya berbeda.

```php
protected static function booted(): void
{
    static::creating(function (self $order) {
        $order->order_number ??= static::generateOrderNumber();
        $order->order_date   ??= now();
        $order->remaining_amount = $order->total_amount - $order->paid_amount;
        $order->updatePaymentStatus();
    });

    static::updating(function (self $order) {
        if ($order->isDirty(['paid_amount', 'total_amount'])) {
            $order->remaining_amount = $order->total_amount - $order->paid_amount;
            $order->updatePaymentStatus();
        }
    });
}
```

---

## 6. Accessors & Mutators

Di Laravel 13, Accessors dan Mutators **wajib** didefinisikan menggunakan class `Illuminate\Database\Eloquent\Casts\Attribute` dengan method `Attribute::make()`. **Jangan** menggunakan `getXxxAttribute()` / `setXxxAttribute()` (pola lama pre-Laravel 9).

> **⚠️ Catatan Penting tentang PHP 8.4 Property Hooks:**
> PHP 8.4 memperkenalkan *Property Hooks* (`get` / `set` langsung di properti). Namun fitur ini **TIDAK KOMPATIBEL** dengan Eloquent Model untuk data yang di-persist ke database. Alasannya: Eloquent bekerja menggunakan `__get` dan `__set` magic methods untuk mengakses internal `$attributes` array. Mendefinisikan PHP 8.4 Property Hooks pada Eloquent model akan membuat **real class property** yang **membypass pipeline Eloquent**, sehingga data tidak akan tersimpan ke database.
>
> ✅ Gunakan `Attribute::make()` untuk semua accessor/mutator yang berhubungan dengan data Eloquent.
> ✅ Gunakan PHP 8.4 Property Hooks **hanya** untuk plain PHP objects (DTO, Value Objects) yang tidak meng-extend `Model`.

### Accessor Read-only (Computed Property)

```php
protected function snapshotBalance(): Attribute
{
    return Attribute::make(
        get: function (mixed $value, array $attributes) {
            if (!$this->relationLoaded('journalEntries')) {
                return 0.0;
            }
            return $this->journalEntries->sum('debit') - $this->journalEntries->sum('credit');
        }
    );
}
```

### Accessor Sederhana (Arrow Function)

```php
protected function balance(): Attribute
{
    return Attribute::make(
        get: fn (mixed $value) => $this->getCurrentBalance()
    );
}
```

### Mutator & Accessor (get & set)

```php
protected function name(): Attribute
{
    return Attribute::make(
        get: fn (string $value) => ucwords($value),
        set: fn (string $value) => strtolower($value),
    );
}
```

### Accessor Berat dengan Caching

Untuk accessor yang melakukan komputasi berat, gunakan `->shouldCache()`:

```php
protected function hash(): Attribute
{
    return Attribute::make(
        get: fn (string $value) => bcrypt(gzuncompress($value)),
    )->shouldCache();
}
```

### Aturan

- Nama method: **camelCase** — Laravel akan mengkonversi ke `snake_case` secara otomatis untuk dipetakan ke kolom database.
- Visibilitas method: **`protected`**.
- Return type: **`Attribute`** — selalu nyatakan secara eksplisit.
- Accessor yang membutuhkan relasi wajib cek `$this->relationLoaded('relationName')` sebelum akses.
- Komputasi berat tidak boleh memicu query baru di accessor — gunakan data yang sudah di-load.
- Gunakan `->shouldCache()` untuk accessor dengan komputasi intensif.
- Komentar singkat di atas method jika fungsinya tidak obvious.



---

## 7. Relationships

### Aturan Umum

- Semua metode relasi harus memiliki **return type declaration** yang eksplisit.
- Urutan relasi: `BelongsTo` → `HasOne` → `HasMany` → `BelongsToMany` → `HasManyThrough`.
- Nama metode relasi: **camelCase**, plural untuk collection (`hasMany`, `belongsToMany`), singular untuk single (`belongsTo`, `hasOne`).

```php
// Benar
public function outlet(): BelongsTo
public function orderItems(): HasMany
public function positions(): BelongsToMany

// Salah — tidak ada return type
public function outlet()
```

### BelongsTo

```php
public function outlet(): BelongsTo
{
    return $this->belongsTo(Outlet::class);               // jika FK = outlet_id (konvensi)
}

public function approvedBy(): BelongsTo
{
    return $this->belongsTo(User::class, 'approved_by'); // FK berbeda — nyatakan eksplisit
}
```

### HasMany

```php
public function orderItems(): HasMany
{
    return $this->hasMany(OrderItem::class);              // FK = order_id (konvensi)
}

public function journalDetails(): HasMany
{
    return $this->hasMany(JournalDetail::class, 'account_id'); // FK berbeda
}
```

### BelongsToMany

Selalu sertakan: nama tabel pivot, FK lokal, FK relasi. Gunakan `withPivot()` jika ada kolom pivot yang dibutuhkan, dan `withTimestamps()` jika pivot punya timestamps.

```php
public function processes(): BelongsToMany
{
    return $this->belongsToMany(Process::class, 'employee_processes')
        ->withPivot(['is_active', 'notes', 'assigned_at'])
        ->withTimestamps()
        ->wherePivot('is_active', true);
}
```

### Alias Relationship

Jika perlu alias untuk convenience, berikan komentar dan pastikan menggunakan FK yang sama:

```php
/** Alias of journalDetails for balance calculation convenience. */
public function journalEntries(): HasMany
{
    return $this->hasMany(JournalDetail::class, 'account_id');
}
```

---

## 8. Query Scopes

### Aturan

- Nama scope: `scope` + **PascalCase**, parameter pertama selalu `Builder $query`, return type selalu `Builder`.
- Scope yang menerima parameter harus **type-hinted**.
- Scope boolean flag (active/inactive) selalu disediakan berpasangan.

### Pola Scope yang Wajib Ada

Setiap model yang memiliki kolom berikut **wajib** memiliki scope yang bersesuaian:

| Kolom             | Scope Wajib                                                  |
| ----------------- | ------------------------------------------------------------ |
| `id`              | `scopeById(Builder $query, int $id)`                         |
| `id` (bulk)       | `scopeByIds(Builder $query, array $ids)`                     |
| `outlet_id`       | `scopeByOutletId(Builder $query, int $outletId)`             |
| `owner_id`        | `scopeByOwnerId(Builder $query, int $ownerId)`               |
| `is_active`       | `scopeActive()` dan `scopeInactive()`                        |
| `status` (string) | `scopeByStatus()` + scope per-status (`scopePending()`, dll) |

### Pola scopeSearch

Selalu gunakan `whereNested` untuk mengelompokkan kondisi OR dalam search agar tidak bocor ke kondisi AND lain:

```php
public function scopeSearch(Builder $query, string $search): Builder
{
    return $query->whereNested(function ($q) use ($search) {
        $q->where('name', 'like', "%{$search}%")
            ->orWhere('phone', 'like', "%{$search}%")
            ->orWhereHas('relation', function ($r) use ($search) {
                $r->where('name', 'like', "%{$search}%");
            });
    });
}
```

### Pola scopeSortBy

Setiap model yang digunakan di listing/pagination wajib punya `scopeSortBy` dengan whitelist kolom:

```php
public function scopeSortBy(Builder $query, string $column = 'createdAt', string $direction = 'desc'): Builder
{
    $allowedColumns = ['name', 'createdAt', 'updatedAt'];

    $columnMap = [
        'createdAt' => 'created_at',
        'updatedAt' => 'updated_at',
    ];

    if (!in_array($column, $allowedColumns)) {
        $column = 'createdAt'; // default fallback
    }

    $column    = $columnMap[$column] ?? $column;
    $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';

    $query->orderBy($column, $direction);

    return $query;
}
```

> **Penting:** Kolom yang diterima dari luar (request) harus divalidasi dengan whitelist. Jangan langsung `orderBy($request->sort_by)`.

---

## 9. Helper Methods (Instance)

Helper adalah method publik pada instance model yang mengenkapsulasi logika bisnis sederhana.

### Kategori Helper

| Kategori         | Pola Nama                      | Contoh                                       |
| ---------------- | ------------------------------ | -------------------------------------------- |
| Status check     | `isXxx(): bool`                | `isPending()`, `isApproved()`                |
| Capability check | `canXxx(): bool`               | `canBeDeleted()`, `canBeEdited()`            |
| Label/display    | `getXxxLabel(): string`        | `getStatusLabel()`, `getTypeLabel()`         |
| Formatted value  | `getFormattedXxx(): string`    | `getFormattedAmount()`, `getFormattedDate()` |
| Badge/variant    | `getXxxBadgeVariant(): string` | `getStatusBadgeVariant()`                    |
| Computed info    | `getXxx(): mixed`              | `getFullAddress()`, `getAge()`               |

### Aturan

- Return type selalu dideklarasikan.
- Method capability check (`canXxx`) boleh gunakan hasil `isXxx` untuk konsistensi:
    ```php
    public function canBeApproved(): bool
    {
        return $this->isPending();
    }
    ```
- Label dan variant menggunakan `match` expression untuk readability:
    ```php
    public function getStatusLabel(): string
    {
        return match ($this->status) {
            'pending'  => 'Menunggu',
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            default    => 'Unknown',
        };
    }
    ```
- Format uang (IDR) menggunakan helper yang konsisten:
    ```php
    public function getFormattedAmount(): string
    {
        return 'Rp ' . number_format((float) $this->amount, 0, ',', '.');
    }
    ```
- Format tanggal: `'d M Y, H:i'` untuk datetime, `'d M Y'` untuk date saja.

---

## 10. Static Helpers

Method statis digunakan untuk:

- **Generate kode unik** (nomor order, kode expense, dll).
- **Aggregate query** (total, summary, grouped data).
- **Factory-like creation** yang tidak cocok di service.

### Aturan

- Selalu annotasi `@throws Exception` jika bisa melempar exception.
- Method private statis untuk sub-routine: prefix `generate…` dibagi per-level jika kompleks.
- Pengecekan eksistensi menggunakan `do-while` untuk kode unik:

```php
public static function generateCode(): string
{
    $date   = now()->format('Ymd');
    $prefix = "EXP-{$date}-";

    $lastRecord = self::where('code', 'like', "{$prefix}%")
        ->orderBy('code', 'desc')
        ->first();

    $newNumber = $lastRecord
        ? (int) substr($lastRecord->code, -4) + 1
        : 1;

    return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
}
```

---

## 11. Konvensi Penamaan

### Nama Kelas

| Entitas      | Format     | Contoh                 |
| ------------ | ---------- | ---------------------- |
| Model        | PascalCase | `OrderItem`, `FineLog` |
| Pivot/Relasi | PascalCase | `EmployeeProcess`      |

### Nama Kolom Database (Migration)

| Tipe         | Format                      | Contoh                      |
| ------------ | --------------------------- | --------------------------- |
| Kolom biasa  | `snake_case`                | `total_amount`, `is_active` |
| Foreign key  | `{model}_id`                | `outlet_id`, `employee_id`  |
| Boolean flag | `is_{nama}` / `has_{nama}`  | `is_active`, `is_system`    |
| Tanggal      | `{nama}_at` / `{nama}_date` | `approved_at`, `order_date` |
| Status       | `status`                    | satu kolom, nilai string    |

### Nama Scope (Pola)

| Tujuan            | Format                                | Contoh                            |
| ----------------- | ------------------------------------- | --------------------------------- |
| Filter by FK      | `scopeBy{Column}()`                   | `scopeByOutletId()`               |
| Filter by IDs     | `scopeBy{Column}s()`                  | `scopeByIds()`                    |
| Filter status     | `scope{StatusName}()`                 | `scopePending()`, `scopeActive()` |
| Filter umum       | `scopeBy{Column}()`                   | `scopeByStatus()`                 |
| Range amount/date | `scopeMin{Col}()` / `scopeMax{Col}()` | `scopeMinAmount()`                |
| Date range        | `scope{Col}From()` / `scope{Col}To()` | `scopeOrderDateFrom()`            |
| Pencarian         | `scopeSearch()`                       | (satu per model)                  |
| Pengurutan        | `scopeSortBy()`                       | (satu per model)                  |

---

## 12. Tipe Data & Casting

### Angka Uang (Currency)

- Simpan di database sebagai `decimal(15, 2)`.
- Cast di model: `'decimal:2'`.
- Cast ke `float` saat komputasi: `(float) $this->amount`.
- Jangan gunakan `integer` untuk uang.

### Boolean

- Simpan di database sebagai `tinyint(1)`.
- Cast: `'boolean'`.
- Kolom penamaan: `is_*` atau `has_*`.

### Tanggal & Waktu

- Gunakan `'date'` untuk kolom tanggal saja (tanpa waktu).
- Gunakan `'datetime'` untuk kolom yang menyimpan waktu.
- `created_at`, `updated_at`, `deleted_at` **selalu** dicast ke `'datetime'`.

### JSON / Array

- Gunakan `'array'` untuk kolom JSON yang disimpan sebagai string.
- Di migration: kolom tipe `json` atau `text` yang menyimpan array.

### Password

- Selalu cast: `'hashed'` (Laravel 10+) — otomatis hash saat set.

---

## 13. Aturan Umum Lainnya

### Import / Use Statements

- Import semua kelas yang digunakan, **jangan** gunakan FQCN di dalam kode.
- Urutkan: PHP native → Laravel core → Illuminate contracts → Traits eksternal.
- Gunakan import spesifik untuk relasi: `use Illuminate\Database\Eloquent\Relations\HasMany;`

```php
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
```

### Indentasi & Formatting

- Gunakan **4 spasi** (bukan tab).
- Opening brace `{` ada di baris yang sama dengan deklarasi fungsi/kelas.
- Baris kosong antar method.
- Alignment `=>` di array multi-baris **diperbolehkan** untuk readability.

### Tidak Boleh

- ❌ Variabel properti `$table` atau `$primaryKey` (cara lama) — gunakan PHP Attribute `#[Table]`.
- ❌ `$guarded = []` — gunakan `$fillable` eksplisit.
- ❌ `getXxxAttribute()` / `setXxxAttribute()` — pola lama pre-Laravel 9, gunakan `Attribute::make()`.
- ❌ PHP 8.4 Property Hooks di Eloquent Model untuk data yang di-persist ke database — gunakan `Attribute::make()` (Property Hooks membypass Eloquent attribute pipeline).
- ❌ Query di dalam accessor yang bisa memicu N+1.
- ❌ Logic bisnis di dalam query scope — scope hanya boleh memodifikasi query builder.
- ❌ Hard-code string status di luar model — gunakan konstanta atau PHP Enum.
- ❌ Raw SQL di dalam scope tanpa escaping yang proper.


### Opsional tapi Direkomendasikan

- ✅ Gunakan **PHP Enum** untuk kolom status yang nilainya terbatas (PHP 8.1+).
- ✅ Tambahkan `@property` PHPDoc di atas kelas untuk kolom yang sering diakses (membantu IDE).
- ✅ Gunakan `firstOrFail()` daripada `first()` jika model wajib ada.

---

## 14. Template Model

Berikut template dasar untuk model baru menggunakan standar Laravel 13:

```php
<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Table('nama_tabel')]
class NamaModel extends Model
{
    use HasFactory, SoftDeletes;

    /*
    |--------------------------------------------------------------------------
    | TABLE & CONFIGURATION
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'foreign_key_id',
        'kolom_inti',
        'status',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active'  => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | LIFECYCLE HOOKS
    |--------------------------------------------------------------------------
    */

    protected static function booted(): void
    {
        static::creating(function (self $model) {
            // set default values
        });
    }

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS & MUTATORS
    |--------------------------------------------------------------------------
    */

    /**
     * Transform the name attribute.
     */
    protected function name(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => ucwords($value),
            set: fn (string $value) => strtolower($value),
        );
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    public function relasi(): BelongsTo
    {
        return $this->belongsTo(RelatedModel::class);
    }

    /*
    |--------------------------------------------------------------------------
    | QUERY SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeById(Builder $query, int $id): Builder
    {
        return $query->where('id', $id);
    }

    public function scopeByIds(Builder $query, array $ids): Builder
    {
        return $query->whereIn('id', $ids);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('kolom', 'like', "%{$search}%");
        });
    }

    public function scopeSortBy(Builder $query, string $column = 'createdAt', string $direction = 'desc'): Builder
    {
        $allowedColumns = ['column1', 'createdAt', 'updatedAt'];

        $columnMap = [
            'createdAt' => 'created_at',
            'updatedAt' => 'updated_at',
        ];

        if (!in_array($column, $allowedColumns)) {
            $column = 'createdAt';
        }

        $column    = $columnMap[$column] ?? $column;
        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';

        $query->orderBy($column, $direction);

        return $query;
    }

    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

    public function getStatusLabel(): string
    {
        return match ($this->status) {
            'pending'  => 'Menunggu',
            'approved' => 'Disetujui',
            default    => 'Unknown',
        };
    }

    public function canBeDeleted(): bool
    {
        return $this->status === 'pending';
    }

    /*
    |--------------------------------------------------------------------------
    | STATIC HELPERS
    |--------------------------------------------------------------------------
    */

    public static function generateCode(): string
    {
        $date   = now()->format('Ymd');
        $prefix = "MNM-{$date}-";

        $last = self::where('code', 'like', "{$prefix}%")
            ->orderBy('code', 'desc')
            ->first();

        $num = $last ? (int) substr($last->code, -4) + 1 : 1;

        return $prefix . str_pad($num, 4, '0', STR_PAD_LEFT);
    }
}
```

---

## Checklist Review Model

Gunakan checklist ini saat membuat atau mereview model:

- [ ] File diawali dengan `declare(strict_types=1);`
- [ ] Namespace dan `use` statements lengkap dan terurut
- [ ] Import `Illuminate\Database\Eloquent\Attributes\Table` jika menggunakan `#[Table]` attribute
- [ ] Import `Illuminate\Database\Eloquent\Casts\Attribute` jika menggunakan accessor/mutator
- [ ] Traits dideklarasikan dengan urutan yang benar
- [ ] Nama tabel dideklarasikan eksplisit via `$table` atau `#[Table]` attribute
- [ ] `$fillable` lengkap dan tidak menggunakan `$guarded = []`
- [ ] `$hidden` menyembunyikan `deleted_at` dan kolom sensitif
- [ ] Gunakan method `casts(): array` alih-alih properti `$casts`
- [ ] Method `casts()` menyertakan semua kolom termasuk timestamps
- [ ] Section dipisah dengan komentar divider yang konsisten
- [ ] Accessors & Mutators menggunakan `Attribute::make()` (bukan `getXxxAttribute` lama, dan bukan PHP 8.4 Property Hooks)
- [ ] Semua relasi punya return type declaration
- [ ] Scope wajib tersedia untuk kolom FK dan `is_active`
- [ ] `scopeSearch` menggunakan `whereNested`
- [ ] `scopeSortBy` menggunakan whitelist kolom
- [ ] Return type semua method dideklarasikan
- [ ] Tidak ada query di dalam accessor
- [ ] Indentasi 4 spasi konsisten


