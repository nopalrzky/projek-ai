# Spec Standarisasi API Resources — Laravel 13

> Dokumen ini adalah **panduan wajib** untuk penulisan dan refactoring semua API Resource pada proyek WashWallet BE.
> Setiap AI/developer yang merefactor kode **harus mengikuti** spesifikasi ini sepenuhnya.
>
> Untuk standarisasi Controllers, lihat [`controller_spec.md`](./controller_spec.md).

---

## Daftar Isi

1. [Overview](#1-overview)
2. [JsonResource — Single Resource](#2-jsonresource--single-resource)
   - [2.1 Aturan Wajib](#21-aturan-wajib)
   - [2.2 Field Attributes & Type Casting](#22-field-attributes--type-casting)
   - [2.3 Relasi & Conditional Attributes](#23-relasi--conditional-attributes)
   - [2.4 Contoh Lengkap](#24-contoh-lengkap)
3. [ResourceCollection](#3-resourcecollection)
   - [3.1 Kapan Menggunakan ResourceCollection](#31-kapan-menggunakan-resourcecollection)
   - [3.2 Attribute #[Collects]](#32-attribute-collects)
   - [3.3 Attribute #[PreserveKeys]](#33-attribute-preservekeys)
   - [3.4 Contoh Lengkap](#34-contoh-lengkap)
4. [Penggunaan di Controller](#4-penggunaan-di-controller)
   - [4.1 Single Resource](#41-single-resource)
   - [4.2 Collection tanpa Pagination](#42-collection-tanpa-pagination)
   - [4.3 Collection dengan Pagination](#43-collection-dengan-pagination)
5. [Pola yang DILARANG](#5-pola-yang-dilarang)
6. [Contoh Resource Kompleks](#6-contoh-resource-kompleks)
7. [Checklist Refactoring Resources](#7-checklist-refactoring-resources)

---

## 1. Overview

API Resources berfungsi sebagai **transformation layer** antara Eloquent model dan JSON response. Proyek ini menggunakan dua jenis resource:

| Kelas | Digunakan untuk |
|---|---|
| `JsonResource` | Transformasi satu model (single resource) |
| `ResourceCollection` | Transformasi koleksi model + metadata kustom |

Semua resource berada di `app/Http/Resources/{DomainName}/`.

---

## 2. JsonResource — Single Resource

### 2.1 Aturan Wajib

1. Semua class resource **extend** `Illuminate\Http\Resources\Json\JsonResource`.
2. Hanya boleh ada satu method public: `toArray(Request $request): array`.
3. **Tidak boleh** ada business logic, query, atau kalkulasi berat di dalam resource.
4. Semua akses ke model dilakukan via `$this->propertyName` (JsonResource meneruskan property access ke model).
5. **Selalu** gunakan `->resolve()` saat memanggil resource di controller untuk mengembalikan array murni ke `successResponse()`.

### 2.2 Field Attributes & Type Casting

**WAJIB:** Selalu lakukan explicit type casting untuk mencegah type inconsistency dari database.

```php
// ✅ BENAR
'id'     => (int) $this->id,
'name'   => (string) $this->name,
'amount' => (float) $this->amount,
'active' => (bool) $this->is_active,

// ❌ SALAH — tipe bisa berubah tergantung driver DB
'id'     => $this->id,
'amount' => $this->amount,
```

**Nullable fields** — gunakan null-safe operator atau ternary:

```php
// ✅ Null-safe operator (direkomendasikan untuk objek)
'deletedAt'    => $this->deleted_at?->toISOString(),
'completedAt'  => $this->completed_at?->toISOString(),

// ✅ Ternary untuk string/primitif nullable
'description'  => $this->description ? (string) $this->description : null,
'referralCode' => $this->referral_code ? (string) $this->referral_code : null,
```

**Konvensi penamaan field:** Gunakan **camelCase** untuk semua key di response (bukan snake_case):

```php
// ✅ BENAR — camelCase
'outletId'    => (int) $this->outlet_id,
'createdAt'   => $this->created_at?->toISOString(),
'isActive'    => (bool) $this->is_active,
'orderNumber' => (string) $this->order_number,

// ❌ SALAH — snake_case
'outlet_id'   => (int) $this->outlet_id,
'created_at'  => $this->created_at?->toISOString(),
```

### 2.3 Relasi & Conditional Attributes

#### `whenLoaded()` — Wajib untuk semua relasi

Selalu gunakan `whenLoaded()` untuk relasi agar tidak terjadi N+1 queries:

```php
// ✅ BENAR — relasi hanya di-load jika sudah di-eager-load
'outlet'   => OutletResource::make($this->whenLoaded('outlet')),
'orders'   => OrderResource::collection($this->whenLoaded('orders')),
'employee' => EmployeeResource::make($this->whenLoaded('employee')),

// ❌ SALAH — akan selalu query database, berpotensi N+1 atau throw MissingValue exception jika memakai new
'outlet'   => new OutletResource($this->outlet),
'orders'   => OrderResource::collection($this->orders),
```

#### `whenLoaded()` dengan count:

```php
// Jika relasi belum di-load, fallback ke 0
'ordersCount' => $this->whenLoaded('orders', fn() => $this->orders->count(), 0),

// Jika relasi belum di-load, field tidak disertakan dalam response
'ordersCount' => $this->whenLoaded('orders', fn() => $this->orders->count()),
```

#### `whenCounted()` — Untuk aggregasi via `loadCount()`:

```php
// Di controller:
$user = $this->userService->getById($id)->loadCount('orders');

// Di resource:
'ordersCount' => $this->whenCounted('orders'),
```

#### `when()` — Conditional attribute:

```php
// Field hanya muncul jika kondisi terpenuhi
'secret'       => $this->when($request->user()->isAdmin(), 'secret-value'),
'internalNote' => $this->when($request->user()->hasRole('admin'), $this->internal_note),
'cost'         => $this->when($request->user()->isAdmin(), fn() => (float) $this->cost),
```

#### `mergeWhen()` — Beberapa field conditional sekaligus:

```php
$this->mergeWhen($request->user()->isAdmin(), [
    'internalNotes' => $this->internal_notes,
    'costPrice'     => (float) $this->cost_price,
    'profitMargin'  => (float) $this->profit_margin,
]),
```

#### `whenPivotLoaded()` — Untuk pivot/many-to-many:

```php
'expiresAt' => $this->whenPivotLoaded('role_user', function () {
    return $this->pivot->expires_at;
}),
```

### 2.4 Contoh Lengkap

```php
<?php

namespace App\Http\Resources\Unit;

use App\Http\Resources\LaundryService\LaundryServiceResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UnitResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => (int) $this->id,
            'name'        => $this->name ? (string) $this->name : null,
            'symbol'      => $this->symbol ? (string) $this->symbol : null,
            'description' => $this->description ? (string) $this->description : null,

            // Relasi — hanya ada jika di-eager-load di controller
            'laundryServices'      => LaundryServiceResource::collection($this->whenLoaded('laundryServices')),
            'laundryServicesCount' => $this->whenLoaded('laundryServices', fn() => $this->laundryServices->count(), 0),

            // Timestamps
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'deletedAt' => $this->deleted_at?->toISOString(),
        ];
    }
}
```

---

## 3. ResourceCollection

### 3.1 Kapan Menggunakan ResourceCollection

Gunakan `ResourceCollection` **hanya jika** perlu:
- Menambahkan metadata kustom ke response koleksi (seperti `links`, `meta` tambahan)
- Mengkustomisasi struktur response koleksi secara keseluruhan

Jika **tidak** perlu metadata kustom, gunakan `XxxResource::collection($data)` langsung dari controller — **tidak perlu** membuat class `ResourceCollection` terpisah.

### 3.2 Attribute `#[Collects]`

**WAJIB:** Setiap `ResourceCollection` harus menggunakan PHP attribute `#[Collects]` untuk mendefinisikan resource yang digunakan — **menggantikan** property `public $collects`.

#### Namespace:
```php
use Illuminate\Http\Resources\Attributes\Collects;
```

#### Perubahan:

```php
// SEBELUM — pola lama menggunakan property
class UnitCollection extends ResourceCollection
{
    public $collects = UnitResource::class; // ❌ property lama, jangan dipakai
}

// SESUDAH — Laravel 13 menggunakan PHP attribute
#[Collects(UnitResource::class)]            // ✅ attribute baru
class UnitCollection extends ResourceCollection
{
    // Tidak perlu property $collects
}
```

#### Mengapa penting:
- `#[Collects]` adalah cara resmi Laravel 13 untuk mendefinisikan resource yang dikumpulkan.
- Setelah `#[Collects]` didefinisikan, gunakan `$this->collection` (bukan `XxxResource::collection($this->collection)`) di dalam `toArray()`.

### 3.3 Attribute `#[PreserveKeys]`

Gunakan `#[PreserveKeys]` **hanya jika** collection perlu mempertahankan key asli dari data (misalnya key-by ID).

#### Namespace:
```php
use Illuminate\Http\Resources\Attributes\PreserveKeys;
```

```php
// Contoh: collection di-key-by ID
#[PreserveKeys]
#[Collects(UnitResource::class)]
class UnitCollection extends ResourceCollection
{
    // Keys asli collection akan dipertahankan
}

// Di controller:
return UnitResource::collection(Unit::all()->keyBy->id);
```

> **Gunakan dengan hati-hati.** Secara default Laravel me-reset keys ke urutan numerik. Gunakan `#[PreserveKeys]` hanya jika ada kebutuhan spesifik dari frontend.

### 3.4 Contoh Lengkap

#### Collection Sederhana (paling umum):

```php
<?php

namespace App\Http\Resources\Fine;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Attributes\Collects;
use Illuminate\Http\Resources\Json\ResourceCollection;

#[Collects(FineResource::class)]
class FineCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,  // ← gunakan $this->collection, bukan FineResource::collection(...)
        ];
    }
}
```

#### Collection dengan Metadata Kustom:

```php
<?php

namespace App\Http\Resources\Order;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Attributes\Collects;
use Illuminate\Http\Resources\Json\ResourceCollection;

#[Collects(OrderResource::class)]
class OrderCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
        ];
    }

    /**
     * Get additional data returned with the resource array.
     * Method ini dipanggil hanya ketika resource ini adalah outermost resource.
     *
     * @return array<string, mixed>
     */
    public function with(Request $request): array
    {
        return [
            'meta' => [
                'generated_at' => now()->toISOString(),
            ],
        ];
    }
}
```

> **Catatan:** Untuk `OrderCollection` yang saat ini punya pola custom dengan constructor parameter (`$message`, `$status`, `$filters`) — pertahankan jika sudah dipakai secara luas. Tambahkan saja `#[Collects]` attribute dan hapus property `public $collects`.

---

## 4. Penggunaan di Controller

### 4.1 Single Resource

```php
// Instansiasi langsung + resolve()
return $this->successResponse(
    (new UnitResource($unit))->resolve(),
    'Unit retrieved successfully'
);
```

### 4.2 Collection tanpa Pagination

```php
// Tanpa class Collection terpisah — langsung dari controller
return $this->successResponse(
    UnitResource::collection($units)->resolve(),
    'Units fetched successfully'
);

// ATAU menggunakan class Collection (jika ada metadata kustom)
return $this->successResponse(
    (new UnitCollection($units))->resolve(),
    'Units fetched successfully'
);
```

### 4.3 Collection dengan Pagination

Untuk paginator (`LengthAwarePaginator`), gunakan `->items()` untuk mendapatkan array item dari halaman saat ini:

```php
// Paginated — gunakan ->items() dan sertakan PaginationHelper
return $this->successResponse(
    UnitResource::collection($units->items())->resolve(),  // ← ->items() penting!
    'Units fetched successfully',
    200,
    PaginationHelper::format($units, $request)             // ← meta pagination
);
```

> **JANGAN** lewatkan seluruh paginator ke resource collection tanpa `->items()`, karena akan menyebabkan duplikasi data atau error.

---

## 5. Pola yang DILARANG

```php
// ❌ DILARANG: Akses relasi tanpa whenLoaded()
'outlet' => new OutletResource($this->outlet)      // N+1 query!
'orders' => OrderResource::collection($this->orders) // N+1 query!

// ❌ DILARANG: Memanggil ->resolve() di dalam resource lain
'units' => UnitResource::collection($this->whenLoaded('units'))->resolve()

// ❌ DILARANG: Tanpa type casting untuk field primitif
'id'     => $this->id
'amount' => $this->amount

// ❌ DILARANG: Menggunakan snake_case untuk key response
'outlet_id'  => (int) $this->outlet_id
'created_at' => $this->created_at?->toISOString()

// ❌ DILARANG: Menggunakan property $collects di Collection
class FineCollection extends ResourceCollection
{
    public $collects = FineResource::class; // Ganti dengan #[Collects] attribute
}

// ❌ DILARANG: Business logic di dalam resource
public function toArray(Request $request): array
{
    $total = Order::where('customer_id', $this->id)->sum('total_amount'); // Query di resource!
    return ['total' => $total];
}

// ❌ DILARANG: Melewatkan seluruh paginator ke resource tanpa ->items()
UnitResource::collection($unitsPaginator)->resolve() // Harusnya $unitsPaginator->items()
```

---

## 6. Contoh Resource Kompleks

Contoh resource dengan banyak relasi, conditional attributes, dan timestamps — mengikuti semua aturan spec ini:

```php
<?php

namespace App\Http\Resources\Order;

use App\Http\Resources\Customer\CustomerResource;
use App\Http\Resources\Employee\EmployeeResource;
use App\Http\Resources\OrderItem\OrderItemResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Http\Resources\OrderReview\OrderReviewResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            // Primary fields — selalu explicit cast
            'id'          => (int) $this->id,
            'orderNumber' => (string) $this->order_number,
            'source'      => (string) $this->source,
            'status'      => (string) $this->status,

            // Foreign keys
            'customerId'  => (int) $this->customer_id,
            'employeeId'  => (int) $this->employee_id,
            'outletId'    => (int) $this->outlet_id,

            // Relasi — selalu via whenLoaded()
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'employee' => new EmployeeResource($this->whenLoaded('employee')),
            'outlet'   => new OutletResource($this->whenLoaded('outlet')),

            // Collection relasi
            'orderItems'      => OrderItemResource::collection($this->whenLoaded('orderItems')),
            'orderItemsCount' => $this->whenLoaded('orderItems', fn() => $this->orderItems->count(), 0),

            // Aggregasi via loadCount()
            'reviewsCount' => $this->whenCounted('reviews'),

            // Numeric fields
            'totalAmount'     => (float) $this->total_amount,
            'paidAmount'      => (float) $this->paid_amount,
            'remainingAmount' => (float) $this->remaining_amount,

            // Nullable fields
            'notes'              => $this->notes ? (string) $this->notes : null,
            'estimatedCompletion' => $this->estimated_completion?->toISOString(),
            'actualCompletion'   => $this->actual_completion?->toISOString(),

            // Conditional — hanya untuk admin
            $this->mergeWhen($request->user()?->isAdmin(), [
                'internalNotes' => $this->internal_notes,
                'costPrice'     => (float) $this->cost_price,
            ]),

            // Computed boolean
            'canPay'     => (bool) $this->canAcceptPayment(),
            'hasReview'  => (bool) $this->reviews()->exists(),

            // Timestamps
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'deletedAt' => $this->deleted_at?->toISOString(),
        ];
    }
}
```

---

## 7. Checklist Refactoring Resources

### JsonResource (setiap `*Resource.php`)

- [ ] Class extend `Illuminate\Http\Resources\Json\JsonResource`
- [ ] Hanya ada method `toArray(Request $request): array`
- [ ] Semua field ID di-cast ke `(int)`
- [ ] Semua field string di-cast ke `(string)`
- [ ] Semua field numerik di-cast ke `(float)` atau `(int)`
- [ ] Semua field boolean di-cast ke `(bool)`
- [ ] Semua field nullable menggunakan `?->` atau ternary
- [ ] Semua key menggunakan **camelCase**
- [ ] Semua relasi menggunakan `whenLoaded()`
- [ ] Tidak ada query database di dalam `toArray()`
- [ ] Tidak ada `->resolve()` di dalam resource lain

### ResourceCollection (setiap `*Collection.php`)

- [ ] Tambahkan `use Illuminate\Http\Resources\Attributes\Collects;`
- [ ] Tambahkan `#[Collects(XxxResource::class)]` di atas class declaration
- [ ] Hapus property `public $collects` (digantikan oleh attribute)
- [ ] Di `toArray()`, gunakan `$this->collection` bukan `XxxResource::collection($this->collection)`
- [ ] Jika perlu preserve keys: tambahkan `use Illuminate\Http\Resources\Attributes\PreserveKeys;` dan `#[PreserveKeys]`

### Di Controller (saat memanggil resource)

- [ ] Single resource: `(new XxxResource($model))->resolve()`
- [ ] Collection tanpa pagination: `XxxResource::collection($items)->resolve()`
- [ ] Collection dengan pagination: `XxxResource::collection($paginator->items())->resolve()`
- [ ] Meta pagination disertakan sebagai argumen ke-4 `successResponse()`

---

## Referensi

- [`api_resources_laravel_13.md`](../api_resources_laravel_13.md) — Dokumentasi resmi Laravel 13 API Resources
- [`controller_spec.md`](./controller_spec.md) — Spec standarisasi Controllers proyek ini
- [`app/Http/Resources/`](../app/Http/Resources/) — Direktori semua resource proyek ini
