# Routing Standardization Specification

> **WashWallet — Aplikasi Kasir**
> Versi: 1.0 | Tanggal: 2026-05-20

Dokumen ini adalah panduan standar untuk **penulisan dan pengembangan Route** di proyek WashWallet. Setiap route baru maupun refaktor route yang sudah ada wajib mengikuti spesifikasi ini.

---

## Daftar Isi

1. [Struktur File Route](#1-struktur-file-route)
2. [Urutan & Pengelompokan Route](#2-urutan--pengelompokan-route)
3. [Konvensi Penamaan Route](#3-konvensi-penamaan-route)
4. [Route Groups](#4-route-groups)
5. [Named Routes](#5-named-routes)
6. [Route Parameters](#6-route-parameters)
7. [Route Model Binding](#7-route-model-binding)
8. [Middleware](#8-middleware)
9. [Rate Limiting](#9-rate-limiting)
10. [HTTP Method & Action Mapping](#10-http-method--action-mapping)
11. [API vs Web Routes](#11-api-vs-web-routes)
12. [Aturan Umum & Larangan](#12-aturan-umum--larangan)
13. [Template Route](#13-template-route)

---

## 1. Struktur File Route

### File Route yang Digunakan

```
routes/
├── web.php                    # Route untuk antarmuka web (Inertia/SSR)
├── api.php                    # Route API utama (stateless, prefix /api)
├── api_mobile_cashier.php     # Route API mobile kasir (require dari api.php)
├── api_mobile_customer.php    # Route API mobile customer (require dari api.php)
├── api_mobile_production.php  # Route API mobile produksi (require dari api.php)
├── auth.php                   # Route autentikasi (require dari web.php)
└── console.php                # Route artisan console
```

### Aturan Penempatan File

- **`routes/web.php`** — Semua route yang menggunakan session, CSRF, dan menghasilkan response HTML/Inertia.
- **`routes/api.php`** — Route API stateless yang prefix-nya `/api`. File mobile di-`require` dari sini.
- **Route mobile dipisah** ke file sendiri (`api_mobile_cashier.php`, dll) dan di-`require` di bagian **akhir** `api.php`, **sebelum** webhook.
- Tidak boleh ada route yang didefinisikan inline di `bootstrap/app.php` (gunakan file route terpisah via `then:` closure jika memang diperlukan).

### Bootstrap Routing (bootstrap/app.php)

```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )->create();
```

---

## 2. Urutan & Pengelompokan Route

### Urutan Bagian dalam File Route

Tulis route dalam urutan berikut, dipisahkan komentar section:

```
1. use statements (imports controller)
2. Route publik (tanpa auth)
3. Route dengan auth middleware
4. Route dengan role/permission middleware tertentu
5. require file route lain (di akhir file)
```

### Komentar Section

Gunakan komentar untuk memisahkan kelompok route yang berhubungan:

```php
// =============================================================================
// PUBLIC ROUTES
// =============================================================================

Route::get('/', [HomeController::class, 'index'])->name('home');

// =============================================================================
// AUTHENTICATED ROUTES
// =============================================================================

Route::middleware('auth')->prefix('dashboard')->group(function () {
    // ...
});
```

---

## 3. Konvensi Penamaan Route

### URI (URL Path)

| Tipe             | Format                    | Contoh                              |
| ---------------- | ------------------------- | ----------------------------------- |
| Resource tunggal | `kebab-case`, plural      | `/orders`, `/laundry-services`      |
| Sub-resource     | nested di bawah parent    | `/outlets/{outletId}/categories`    |
| Aksi non-CRUD    | `/resource/{id}/aksi`     | `/orders/{id}/approve`              |
| API Mobile       | prefix `mobile/{platform}`| `/mobile/cashier/orders`            |

**Aturan:**
- Semua URI menggunakan **`kebab-case`** (huruf kecil, pemisah tanda hubung).
- URI adalah **noun** (benda), bukan verb (kata kerja).
- URI bersifat **plural** untuk resource collection: `/customers`, `/orders`.
- Aksi non-CRUD ditambahkan sebagai sub-path verb setelah ID: `POST /orders/{id}/approve`.

### Nama Route (Named Routes)

Format: `{resource}.{action}` atau `{prefix}.{resource}.{action}`

| Tipe                       | Format                          | Contoh                                |
| -------------------------- | ------------------------------- | ------------------------------------- |
| Resource standar           | `resource.action`               | `orders.index`, `orders.show`         |
| Sub-resource               | `resource.sub-resource.action`  | `customers.subscriptions.store`       |
| API Web internal           | `api.resource.action`           | `api.accounts.index`                  |
| API Mobile                 | `mobile.platform.resource.action` | `mobile.cashier.orders.index`       |
| Aksi non-CRUD              | `resource.action`               | `orders.approve`, `expenses.reject`   |

**Aturan:**
- Nama route selalu **unik** di seluruh aplikasi.
- Gunakan dot notation untuk membentuk hierarki: `prefix.resource.action`.
- Setiap group route **wajib** menggunakan `->name('prefix.')` dengan trailing dot.
- Hindari nama route yang terlalu panjang dan bertingkat lebih dari 4 level.

---

## 4. Route Groups

### Pola Group yang Wajib Digunakan

Selalu kombinasikan `prefix()`, `name()`, dan `controller()` dalam satu chain **sebelum** `group()`:

```php
// ✅ Benar — semua atribut dalam satu chain
Route::prefix('orders')
    ->name('orders.')
    ->controller(OrderController::class)
    ->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::get('/{id}', 'show')->name('show');
        Route::put('/{id}', 'update')->name('update');
        Route::delete('/{id}', 'destroy')->name('destroy');
    });

// ❌ Salah — controller didefinisikan per-route
Route::prefix('orders')->name('orders.')->group(function () {
    Route::get('/', [OrderController::class, 'index'])->name('index');
    Route::post('/', [OrderController::class, 'store'])->name('store');
});
```

### Group dengan Middleware Auth

Semua route dashboard/admin dibungkus dalam satu group auth:

```php
Route::middleware('auth')->prefix('dashboard')->group(function () {
    // semua route dashboard di sini
});
```

### Group Bertingkat (Nested Groups)

Saat melakukan nesting group, setiap level **wajib** punya prefix dan name-nya sendiri:

```php
Route::middleware('auth')->prefix('dashboard')->group(function () {

    Route::prefix('outlets/{outletId}')
        ->name('outlets.')
        ->controller(OutletController::class)
        ->group(function () {

            Route::prefix('categories')
                ->name('categories.')
                ->group(function () {
                    Route::get('/create', 'createCategory')->name('create');
                    Route::post('/', 'storeCategory')->name('store');
                    Route::get('/{categoryId}/edit', 'editCategory')->name('edit');
                    Route::put('/{categoryId}', 'updateCategory')->name('update');
                    Route::delete('/{categoryId}', 'destroyCategory')->name('destroy');
                });
        });
});
```

> **Batasan Nesting:** Maksimum 3 level nesting. Jika lebih dalam, pertimbangkan untuk memisah ke file route tersendiri.

---

## 5. Named Routes

### Aturan Named Route

- **Semua route wajib punya nama** — tidak boleh ada route anonim (kecuali route debug/health).
- Gunakan `->name('action')` di dalam group yang sudah punya `->name('prefix.')`.
- Jangan mengulang prefix di dalam nama individual: jika group sudah `->name('orders.')`, individual hanya `->name('index')`.

```php
// ✅ Benar
Route::prefix('orders')->name('orders.')->controller(OrderController::class)->group(function () {
    Route::get('/', 'index')->name('index');         // => orders.index
    Route::post('/', 'store')->name('store');        // => orders.store
    Route::get('/{id}', 'show')->name('show');       // => orders.show
});

// ❌ Salah — duplikasi prefix
Route::prefix('orders')->group(function () {
    Route::get('/', [OrderController::class, 'index'])->name('orders.index');
    Route::post('/', [OrderController::class, 'store'])->name('orders.store');
});
```

### Referensi Nama Route Standar (CRUD)

| Action  | Method   | URI           | Nama route      |
| ------- | -------- | ------------- | --------------- |
| index   | GET      | `/resource`   | `resource.index`  |
| create  | GET      | `/resource/create` | `resource.create` |
| store   | POST     | `/resource`   | `resource.store`  |
| show    | GET      | `/resource/{id}` | `resource.show` |
| edit    | GET      | `/resource/{id}/edit` | `resource.edit` |
| update  | PUT/PATCH| `/resource/{id}` | `resource.update` |
| destroy | DELETE   | `/resource/{id}` | `resource.destroy` |

---

## 6. Route Parameters

### Konvensi Penamaan Parameter

| Tipe Parameter        | Format              | Contoh                              |
| --------------------- | ------------------- | ----------------------------------- |
| ID resource tunggal   | `{resourceId}`      | `{orderId}`, `{customerId}`         |
| Model binding         | `{resource}`        | `{order}`, `{customer}`             |
| ID generik dalam group| `{id}`              | dalam sub-group sudah jelas contextnya |

**Aturan:**
- Parameter berupa **ID integer** gunakan suffix `Id`: `{outletId}`, `{employeeId}`.
- Parameter untuk **Route Model Binding** (inject model) cukup nama model: `{order}`, `{customer}`.
- **Selalu** berikan constraint tipe data pada parameter ID integer dengan `.where()`:

```php
Route::get('/{id}', 'show')->name('show')->where('id', '[0-9]+');

// Atau shorthand helper
Route::get('/{id}', 'show')->name('show')->whereNumber('id');
```

### Global Constraints (AppServiceProvider)

Parameter `id` dapat dikonfigurasi secara global di `AppServiceProvider::boot()`:

```php
use Illuminate\Support\Facades\Route;

public function boot(): void
{
    Route::pattern('id', '[0-9]+');
}
```

### Optional Parameters

Hindari optional parameter di route — lebih baik gunakan query string untuk filter opsional:

```php
// ✅ Gunakan query string untuk filter opsional
Route::get('/orders', 'index')->name('index');
// Controller: $request->query('status')

// ❌ Hindari optional route parameter
Route::get('/orders/{status?}', 'index')->name('index');
```

---

## 7. Route Model Binding

### Implicit Binding

Gunakan implicit binding untuk menyederhanakan controller — Laravel akan otomatis inject model berdasarkan `{parameterName}` yang cocok dengan type-hint:

```php
// routes/web.php
Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');

// Controller
public function show(Order $order): Response
{
    return Inertia::render('Dashboard/Orders/Show', ['order' => $order]);
}
```

**Kapan Menggunakan Implicit Binding:**
- Route yang beroperasi pada satu model spesifik (show, edit, update, destroy).
- Model tidak membutuhkan eager loading kompleks di level route.

### Explicit Binding via ID

Untuk route yang tidak menggunakan implicit binding (karena menggunakan custom ID naming), gunakan controller method biasa dengan parameter `int $id`:

```php
// Dalam web.php — menggunakan {id} bukan {order}
Route::prefix('orders')->name('orders.')->controller(OrderController::class)->group(function () {
    Route::get('/{id}', 'show')->name('show')->whereNumber('id');
    Route::put('/{id}', 'update')->name('update')->whereNumber('id');
    Route::delete('/{id}', 'destroy')->name('destroy')->whereNumber('id');
});

// Controller menerima int $id, service layer yang melakukan lookup
public function show(int $id): Response
{
    $order = $this->orderService->getById($id);
    // ...
}
```

> **Catatan Proyek:** WashWallet saat ini lebih banyak menggunakan pola `{id}` + service lookup daripada implicit model binding. Untuk route baru, **dianjurkan** menggunakan implicit binding jika controller tidak membutuhkan preprocessing kompleks.

### Soft Deleted Models

Jika route perlu mengakses model yang sudah soft-deleted:

```php
Route::get('/orders/{order}', [OrderController::class, 'show'])
    ->name('orders.show')
    ->withTrashed();
```

---

## 8. Middleware

### Middleware yang Tersedia

| Middleware          | Keterangan                                                     |
| ------------------- | -------------------------------------------------------------- |
| `auth`              | Memastikan user sudah login (session-based, untuk web)         |
| `auth:sanctum`      | Memastikan user sudah login via API token (untuk API mobile)   |
| `role:{role_name}`  | Membatasi akses berdasarkan role (Spatie Permission)           |

### Aturan Penerapan Middleware

- Middleware **selalu** diterapkan di level **group**, bukan per-route individual (kecuali ada kebutuhan berbeda satu route).
- Urutan middleware dalam array: **auth dulu, baru role/permission**:

```php
// ✅ Benar
Route::middleware(['auth', 'role:super_admin'])->group(function () { ... });

// ❌ Salah — role sebelum auth
Route::middleware(['role:super_admin', 'auth'])->group(function () { ... });
```

- Untuk route yang memerlukan role khusus, buat group terpisah di dalam group `auth`:

```php
Route::middleware('auth')->prefix('dashboard')->group(function () {

    // Route umum (semua user yang sudah login)
    Route::resource('orders', OrderController::class);

    // Route khusus super_admin
    Route::middleware('role:super_admin')->group(function () {
        Route::resource('settings', SettingController::class);
        Route::resource('units', UnitController::class);
    });
});
```

---

## 9. Rate Limiting

### Konfigurasi Rate Limiter

Definisikan rate limiter di `AppServiceProvider::boot()`, bukan inline di route file:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

public function boot(): void
{
    // Rate limit untuk API mobile
    RateLimiter::for('mobile-api', function (Request $request) {
        return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
    });

    // Rate limit untuk auth (login)
    RateLimiter::for('auth-attempts', function (Request $request) {
        return [
            Limit::perMinute(10)->by($request->ip()),
            Limit::perMinute(5)->by($request->input('email')),
        ];
    });
}
```

### Menerapkan Rate Limiter ke Route

```php
Route::middleware(['auth:sanctum', 'throttle:mobile-api'])
    ->prefix('mobile/cashier')
    ->name('mobile.cashier.')
    ->group(function () {
        // ...
    });
```

> **Catatan Proyek:** Saat ini proyek belum mengimplementasikan rate limiting secara eksplisit. Gunakan panduan ini saat menambahkan rate limiting di masa mendatang.

---

## 10. HTTP Method & Action Mapping

### Mapping HTTP Method ke Action Controller

| HTTP Method | Action Controller | Keterangan                           |
| ----------- | ----------------- | ------------------------------------ |
| `GET`       | `index`           | Listing / daftar resource            |
| `GET`       | `create`          | Form tambah baru (web only)          |
| `POST`      | `store`           | Simpan data baru                     |
| `GET`       | `show`            | Detail satu resource                 |
| `GET`       | `edit`            | Form edit (web only)                 |
| `PUT`       | `update`          | Update full resource                 |
| `PATCH`     | `update`          | Update partial resource              |
| `DELETE`    | `destroy`         | Hapus resource                       |

### Aksi Non-CRUD (Custom Actions)

Untuk aksi bisnis di luar CRUD standar, gunakan sub-path dengan method yang sesuai:

```php
// Persetujuan/penolakan
Route::post('/{id}/approve', 'approve')->name('approve')->whereNumber('id');
Route::post('/{id}/reject', 'reject')->name('reject')->whereNumber('id');

// Toggle status
Route::patch('/{id}/activate', 'activate')->name('activate')->whereNumber('id');
Route::patch('/{id}/deactivate', 'deactivate')->name('deactivate')->whereNumber('id');

// Action terhadap sub-entitas
Route::post('/{id}/payment', 'storePayment')->name('payment.store')->whereNumber('id');
Route::delete('/{id}/payment/{paymentId}', 'destroyPayment')->name('payment.destroy')
    ->where(['id' => '[0-9]+', 'paymentId' => '[0-9]+']);
```

**Aturan:**
- Gunakan `POST` untuk aksi yang **mengubah state** (approve, reject, send).
- Gunakan `PATCH` untuk toggle sederhana (activate/deactivate, toggle flag).
- Gunakan `DELETE` untuk penghapusan permanen.
- **Jangan** gunakan `GET` untuk aksi yang mengubah data.

---

## 11. API vs Web Routes

### Perbedaan Web dan API Routes

| Aspek              | `routes/web.php`                          | `routes/api.php`                         |
| ------------------ | ----------------------------------------- | ---------------------------------------- |
| Middleware group   | `web` (session, CSRF)                     | `api` (stateless)                        |
| Auth               | `auth` (session cookie)                   | `auth:sanctum` (API token)               |
| Response           | `Inertia::render()` atau `redirect()`     | `ApiResponse` / `JsonResource`           |
| Prefix URI         | `/dashboard/...`                          | `/api/...` (otomatis)                    |
| CSRF               | Diperlukan                                | Tidak diperlukan                         |

### API Routes di dalam Web Routes

WashWallet menggunakan pola khusus: ada route API ringan yang **didefinisikan di `web.php`** dengan prefix `api.` untuk keperluan data fetching di frontend Inertia (bukan API eksternal). Route-route ini menggunakan auth session, bukan token:

```php
// Di web.php — API internal untuk fetch data di frontend
Route::middleware('auth')->prefix('api')->name('api.')->group(function () {
    Route::prefix('accounts')->name('accounts.')->controller(ApiAccountController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/next-code', 'getNextCode')->name('next-code');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id');
    });
});
```

> **Aturan:** Route di `web.php` dengan prefix `api.` adalah **API internal** untuk frontend Inertia dan menggunakan **session auth**. Route di `routes/api.php` adalah **API eksternal** untuk mobile app dan menggunakan **token auth (Sanctum)**.

### Struktur API Mobile

Semua route mobile dikelompokkan per platform dengan prefix yang jelas:

```php
// api_mobile_cashier.php
Route::prefix('mobile/cashier')->name('mobile.cashier.')->group(function () {

    // Public: Auth routes (tanpa Sanctum)
    Route::prefix('auth')->controller(EmployeeAuthController::class)->group(function () {
        Route::post('login', 'login');
    });

    // Protected: Semua route lain pakai Sanctum
    Route::middleware('auth:sanctum')->group(function () {
        // resources...
    });
});
```

---

## 12. Aturan Umum & Larangan

### ✅ Wajib Dilakukan

- Selalu gunakan **named routes** — tidak ada route anonim.
- Selalu gunakan `->controller(ControllerClass::class)` di level group jika semua route dalam group menggunakan controller yang sama.
- Selalu gunakan **`prefix()`** dan **`name()`** secara konsisten di setiap group.
- Gunakan **`whereNumber()`** atau **`.where('id', '[0-9]+')` untuk constraint parameter ID**.
- Import semua controller di bagian atas file dengan `use` statement.
- Urutkan `use` imports secara **alphabetical** per namespace group.

### ❌ Tidak Boleh Dilakukan

- ❌ **Route tanpa nama** — semua route harus punya `->name()`.
- ❌ **Logic bisnis di route file** — route file hanya mendaftarkan route, tidak boleh ada `DB::`, `Auth::`, atau business logic lain.
- ❌ **Closure sebagai handler** — semua handler harus menggunakan controller class (kecuali route health/debug).
- ❌ **`Route::any()`** — terlalu permisif, gunakan method spesifik.
- ❌ **Raw string controller class** seperti `'App\\Http\\Controllers\\Api\\CustomerController'` — selalu import dengan `use` dan gunakan `::class`.
- ❌ **Nested group lebih dari 3 level** — refaktor ke file terpisah jika sudah terlalu dalam.
- ❌ **Prefix dengan leading slash ganda** seperti `'/customers'` di dalam group yang sudah punya prefix — cukup `'customers'`.
- ❌ **Mendefinisikan middleware di luar group** untuk route yang seharusnya satu kelompok.

### Catatan Khusus untuk Web Routes

- `Route::resource()` boleh digunakan, tetapi pastikan semua route yang tidak diperlukan di-`except`:
  ```php
  Route::resource('orders', OrderController::class)->except(['create', 'edit']);
  ```
- `Route::apiResource()` hanya digunakan di route API (file `routes/api.php` atau `api_mobile_*.php`).

---

## 13. Template Route

### Template: Web Resource Routes

```php
<?php

use App\Http\Controllers\Web\ResourceController;
use Illuminate\Support\Facades\Route;

// =============================================================================
// RESOURCE ROUTES
// =============================================================================

Route::middleware('auth')->prefix('dashboard')->group(function () {

    Route::prefix('resources')
        ->name('resources.')
        ->controller(ResourceController::class)
        ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/create', 'create')->name('create');
            Route::post('/', 'store')->name('store');
            Route::get('/{id}', 'show')->name('show')->whereNumber('id');
            Route::get('/{id}/edit', 'edit')->name('edit')->whereNumber('id');
            Route::put('/{id}', 'update')->name('update')->whereNumber('id');
            Route::delete('/{id}', 'destroy')->name('destroy')->whereNumber('id');

            // Non-CRUD actions
            Route::post('/{id}/approve', 'approve')->name('approve')->whereNumber('id');
            Route::post('/{id}/reject', 'reject')->name('reject')->whereNumber('id');
        });
});
```

### Template: API Mobile Resource Routes

```php
<?php

use App\Http\Controllers\Api\ResourceController;
use Illuminate\Support\Facades\Route;

Route::prefix('mobile/cashier')
    ->name('mobile.cashier.')
    ->group(function () {

        // Public routes
        Route::post('auth/login', [AuthController::class, 'login']);

        // Protected routes
        Route::middleware('auth:sanctum')->group(function () {

            Route::prefix('resources')
                ->name('resources.')
                ->controller(ResourceController::class)
                ->group(function () {
                    Route::get('/', 'index')->name('index');
                    Route::get('/{id}', 'show')->name('show')->whereNumber('id');
                    Route::post('/', 'store')->name('store');
                    Route::put('/{id}', 'update')->name('update')->whereNumber('id');
                    Route::delete('/{id}', 'destroy')->name('destroy')->whereNumber('id');
                });
        });
    });
```

### Template: Sub-Resource Routes (Nested)

```php
Route::prefix('outlets/{outletId}')
    ->name('outlets.')
    ->controller(OutletController::class)
    ->group(function () {
        // Outlet-level actions
        Route::get('/settings', 'showSettings')->name('settings.index');
        Route::put('/settings', 'updateSettings')->name('settings.update');

        // Sub-resource: categories
        Route::prefix('categories')
            ->name('categories.')
            ->group(function () {
                Route::get('/create', 'createCategory')->name('create');
                Route::post('/', 'storeCategory')->name('store');
                Route::get('/{categoryId}/edit', 'editCategory')->name('edit')->whereNumber('categoryId');
                Route::put('/{categoryId}', 'updateCategory')->name('update')->whereNumber('categoryId');
                Route::delete('/{categoryId}', 'destroyCategory')->name('destroy')->whereNumber('categoryId');
            });
    });
```

---

## Referensi

- [Laravel 13 Routing Documentation](../routing_laravel_13.md)
- [Model Standardization Specification](model_spec.md)
