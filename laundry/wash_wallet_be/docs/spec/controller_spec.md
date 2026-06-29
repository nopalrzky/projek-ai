# Spec Standarisasi Controller — Laravel 13

> Dokumen ini adalah **panduan wajib** untuk penulisan dan refactoring semua controller pada proyek WashWallet BE.
> Setiap AI/developer yang merefactor kode **harus mengikuti** spesifikasi ini sepenuhnya.
>
> Untuk standarisasi API Resources, lihat [`api_resource_spec.md`](./api_resource_spec.md).

---

## Daftar Isi

1. [Base Controller](#1-base-controller)
2. [API Controllers](#2-api-controllers)
   - [2.1 Middleware Attributes](#21-middleware-attributes)
   - [2.2 Authorization Attributes](#22-authorization-attributes)
   - [2.3 Struktur Method Controller](#23-struktur-method-controller)
   - [2.4 Error Handling](#24-error-handling)
   - [2.5 Response Format](#25-response-format)
3. [Web Controllers](#3-web-controllers)
4. [Import Controllers](#4-import-controllers)
5. [Route Files](#5-route-files)
   - [5.1 Middleware di Route vs Controller](#51-middleware-di-route-vs-controller)
   - [5.2 Aturan Route Files](#52-aturan-route-files)
6. [Contoh Lengkap per Kategori](#6-contoh-lengkap-per-kategori)
7. [Checklist Refactoring Controller](#7-checklist-refactoring-controller)

---

## 1. Base Controller

**File:** `app/Http/Controllers/Controller.php`

Base Controller **tidak berubah secara struktural**. Tetap menggunakan:
- `successResponse()` — untuk respons sukses
- `errorResponse()` — untuk respons error
- `getPaginationMeta()` — untuk format pagination

Tidak perlu mengimplementasikan `HasMiddleware` interface pada base controller. Middleware dikelola melalui PHP Attributes di masing-masing controller (lihat Bagian 2.1).

```php
<?php

namespace App\Http\Controllers;

use App\Helpers\PaginationHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

abstract class Controller
{
    /**
     * Return a standardized success JSON response.
     */
    protected function successResponse(mixed $data = null, string $message = 'Success', int $code = 200, array $meta = []): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ];

        if (!empty($meta)) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $code);
    }

    /**
     * Return a standardized error JSON response.
     */
    protected function errorResponse(string $message = 'Error', int $code = 500, mixed $error = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if (config('app.debug') && !is_null($error)) {
            if ($error instanceof \Exception || $error instanceof \Throwable) {
                $response['error'] = $error->getMessage();
            } else {
                $response['error'] = $error;
            }
        }

        return response()->json($response, $code);
    }

    /**
     * Format pagination metadata for a paginated response.
     */
    protected function getPaginationMeta(LengthAwarePaginator $paginator, ?Request $request = null): array
    {
        return PaginationHelper::format($paginator, $request ?? request());
    }
}
```

---

## 2. API Controllers

### 2.1 Middleware Attributes

**WAJIB:** Semua controller menggunakan PHP Attributes `#[Middleware]` untuk mendefinisikan middleware, **bukan** via route files atau interface `HasMiddleware`.

#### Namespace yang digunakan:
```php
use Illuminate\Routing\Attributes\Controllers\Middleware;
```

#### Aturan penempatan:

**Class-level** — middleware berlaku untuk semua method:
```php
#[Middleware('auth:sanctum')]
class OrderController extends Controller
{
    // Semua method terlindungi
}
```

**Method-level** — middleware berlaku hanya untuk method tertentu:
```php
class EmployeeAuthController extends Controller
{
    // Login tidak butuh auth (tidak ada attribute)
    public function login(LoginRequest $request): JsonResponse { ... }

    // Logout dan me butuh auth
    #[Middleware('auth:sanctum')]
    public function logout(): JsonResponse { ... }

    #[Middleware('auth:sanctum')]
    public function me(): JsonResponse { ... }
}
```

**Dengan `only` dan `except`:**
```php
// Berlaku ke semua method kecuali 'login'
#[Middleware('auth:sanctum', except: ['login'])]
class EmployeeAuthController extends Controller
{
    // ...
}
```

#### Mapping middleware per controller category:

| Controller Group | Middleware |
|---|---|
| `Api\EmployeeAuthController` | `auth:sanctum` di **method-level**, kecuali `login` |
| `Api\CustomerAuthController` | `auth:sanctum` di **method-level**, kecuali `login`, `register` |
| Semua `Api\*Controller` lainnya | `#[Middleware('auth:sanctum')]` di **class-level** |
| Semua `Web\*Controller` | `#[Middleware('auth')]` di **class-level** |
| `Import\*Controller` | `#[Middleware('auth')]` di **class-level** |
| `Api\WebhookController` | **Tanpa middleware** (public webhook) |
| `Api\LocationController` | **Tanpa middleware** (public endpoint) |
| `Api\ReferralController` | **Tanpa middleware** (method `checkReferralCode`) |

#### Middleware untuk role-based access (super_admin):

Controller yang hanya boleh diakses oleh `super_admin` harus menggunakan dua attribute:

```php
#[Middleware('auth')]
#[Middleware('role:super_admin')]
class SalaryController extends Controller { ... }
```

Berlaku untuk Web controllers: `SalaryController`, `UnitController`, `SettingController`, `FeatureCatalogController`.

---

### 2.2 Authorization Attributes

Jika suatu method controller memerlukan policy-based authorization, gunakan attribute `#[Authorize]` sebagai pengganti `$this->authorize()` di dalam method.

#### Namespace:
```php
use Illuminate\Routing\Attributes\Controllers\Authorize;
```

#### Contoh:
```php
use Illuminate\Routing\Attributes\Controllers\Authorize;
use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class OrderController extends Controller
{
    #[Authorize('update', 'order')]
    public function update(UpdateOrderRequest $request, int $orderId): JsonResponse
    {
        // ...
    }

    #[Authorize('delete', 'order')]
    public function destroy(int $orderId): JsonResponse
    {
        // ...
    }
}
```

> **Catatan:** Gunakan `#[Authorize]` hanya jika proyek telah mendefinisikan Laravel Policies untuk model terkait. Jika belum ada policy, tidak perlu dipaksakan.

---

### 2.3 Struktur Method Controller

Setiap method controller **harus** mengikuti urutan berikut:

1. **Filter extraction** (jika ada) — via private `getFilters()` / `getFiltersFromRequest()`
2. **Service call** — delegasikan semua business logic ke Service class
3. **Resource wrapping** — gunakan Resource class untuk transformasi data
4. **Return response** — gunakan `successResponse()` atau `errorResponse()`

#### Template API Controller Lengkap (CRUD):

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Unit\StoreUnitRequest;
use App\Http\Requests\Unit\UpdateUnitRequest;
use App\Http\Resources\Unit\UnitResource;
use App\Services\UnitService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

#[Middleware('auth:sanctum')]
class UnitController extends Controller
{
    public function __construct(
        private readonly UnitService $unitService,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilters($request);

            $units = $this->unitService->getAll(
                filters: $filters,
                relations: []
            );

            return $this->successResponse(
                UnitResource::collection($units)->resolve(),
                'Units fetched successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[UnitController] Failed to fetch units', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_management',
            ]);

            return $this->errorResponse('Gagal memuat data satuan', 500, $e);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $unit = $this->unitService->getById($id);

            return $this->successResponse(
                (new UnitResource($unit))->resolve(),
                'Unit retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[UnitController] Failed to fetch unit', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_management',
                'unit_id' => $id,
            ]);

            return $this->errorResponse('Gagal memuat data satuan', 500, $e);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUnitRequest $request): JsonResponse
    {
        try {
            $unit = $this->unitService->store($request->validated());

            return $this->successResponse(
                (new UnitResource($unit))->resolve(),
                'Unit created successfully',
                201
            );
        } catch (Throwable $e) {
            Log::error('[UnitController] Failed to create unit', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_management',
            ]);

            return $this->errorResponse('Gagal membuat data satuan', 500, $e);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUnitRequest $request, int $id): JsonResponse
    {
        try {
            $unit = $this->unitService->update($id, $request->validated());

            return $this->successResponse(
                (new UnitResource($unit))->resolve(),
                'Unit updated successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[UnitController] Failed to update unit', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_management',
                'unit_id' => $id,
            ]);

            return $this->errorResponse('Gagal memperbarui data satuan', 500, $e);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $deleted = $this->unitService->destroy($id);

            if ($deleted) {
                return $this->successResponse(null, 'Unit deleted successfully');
            }

            return $this->errorResponse('Data tidak ditemukan atau tidak dapat dihapus', 404);
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[UnitController] Failed to delete unit', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_management',
                'unit_id' => $id,
            ]);

            return $this->errorResponse('Gagal menghapus data satuan', 500, $e);
        }
    }

    /**
     * Helper: Extract filters from request.
     */
    private function getFilters(Request $request): array
    {
        return [
            'search'        => $request->string('search')->toString(),
            'sortBy'        => $request->string('sortBy', 'createdAt')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
            'isActive'      => $request->has('isActive') && $request->filled('isActive')
                ? $request->boolean('isActive')
                : null,
        ];
    }
}
```

---

### 2.4 Error Handling

**Aturan wajib untuk exception handling:**

1. **`ModelNotFoundException`** harus selalu di-catch terpisah dengan kode `404`.
2. **`Throwable`** sebagai catch terakhir dengan kode `500`.
3. **Log error** harus disertakan di setiap catch `Throwable` dengan format:
   ```php
   Log::error('[ClassName] Short description of failure', [
       'error'     => $e->getMessage(),
       'user_id'   => Auth::id(),
       'type'      => 'domain_management',   // e.g. 'unit_management', 'order_management'
       'entity_id' => $id,                   // tambahkan jika relevan
   ]);
   ```
4. **Operasi write (store/update/destroy) yang kompleks** harus dibungkus `DB::beginTransaction()` / `DB::commit()` / `DB::rollBack()`.

#### Contoh dengan DB Transaction:

```php
public function store(StoreOrderRequest $request): JsonResponse
{
    DB::beginTransaction();

    try {
        $order = $this->orderService->store($request->validated());

        DB::commit();

        return $this->successResponse(
            (new OrderResource($order))->resolve(),
            'Order created successfully',
            201
        );
    } catch (ModelNotFoundException $e) {
        DB::rollBack();
        return $this->errorResponse('Data tidak ditemukan', 404, $e);
    } catch (Throwable $e) {
        DB::rollBack();

        Log::error('[OrderController] Failed to create order', [
            'error'   => $e->getMessage(),
            'user_id' => Auth::id(),
            'type'    => 'order_management',
        ]);

        return $this->errorResponse('Gagal membuat order', 500, $e);
    }
}
```

---

### 2.5 Response Format

**Selalu** gunakan helper dari Base Controller. **Dilarang** memanggil `response()->json()` secara langsung di controller child.

| Skenario | Contoh |
|---|---|
| Sukses, single resource | `$this->successResponse((new UnitResource($unit))->resolve(), 'Unit retrieved successfully')` |
| Sukses, collection | `$this->successResponse(UnitResource::collection($units)->resolve(), 'Units fetched successfully')` |
| Sukses, collection + pagination | `$this->successResponse(UnitResource::collection($units->items())->resolve(), 'Units fetched successfully', 200, PaginationHelper::format($units, $request))` |
| Sukses, create (HTTP 201) | `$this->successResponse((new UnitResource($unit))->resolve(), 'Unit created successfully', 201)` |
| Sukses, delete | `$this->successResponse(null, 'Unit deleted successfully')` |
| Error 404 | `$this->errorResponse('Data tidak ditemukan', 404, $e)` |
| Error 500 | `$this->errorResponse('Gagal memuat data', 500, $e)` |
| Error 422 | `$this->errorResponse('Validasi gagal', 422)` |

---

## 3. Web Controllers

Web Controllers (Inertia.js) mengikuti aturan yang **sama** untuk Middleware Attributes, namun return type-nya berbeda (`Inertia\Response` atau `RedirectResponse`).

#### Namespace middleware:
```php
use Illuminate\Routing\Attributes\Controllers\Middleware;
```

#### Template Web Controller:

```php
<?php

namespace App\Http\Controllers\Web;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Unit\StoreUnitRequest;
use App\Http\Requests\Unit\UpdateUnitRequest;
use App\Http\Resources\Unit\UnitResource;
use App\Services\UnitService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class UnitController extends Controller
{
    public function __construct(
        private readonly UnitService $unitService,
    ) {}

    public function index(Request $request): Response
    {
        try {
            $filters = $this->getFiltersFromRequest($request);
            $units   = $this->unitService->getAll($filters, ['laundryServices']);

            return Inertia::render('Dashboard/Units/Index', [
                'units' => [
                    'data' => UnitResource::collection($units->items())->resolve(),
                    'meta' => PaginationHelper::format($units, $request),
                ],
                'filters' => $filters,
                'flash'   => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[UnitController] Failed to load units index', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_controller_error',
            ]);

            return Inertia::render('Dashboard/Units/Index', [
                'units'   => ['data' => [], 'meta' => []],
                'filters' => $this->getFiltersFromRequest($request),
                'error'   => 'Gagal memuat data. Silakan coba lagi.',
            ]);
        }
    }

    public function create(): Response|RedirectResponse
    {
        try {
            return Inertia::render('Dashboard/Units/Create');
        } catch (Throwable $e) {
            Log::error('[UnitController] Failed to load unit create form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_controller_error',
            ]);

            return redirect()->route('units.index')
                ->with('error', 'Gagal memuat formulir pembuatan unit');
        }
    }

    public function store(StoreUnitRequest $request): RedirectResponse
    {
        try {
            $unit = $this->unitService->store($request->validated());

            return redirect()->route('units.index')
                ->with('success', "Unit '{$unit->name}' berhasil dibuat");
        } catch (Throwable $e) {
            Log::error('[UnitController] Failed to create unit', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function show(int $id): Response|RedirectResponse
    {
        try {
            $unit = $this->unitService->getById($id, ['laundryServices']);

            return Inertia::render('Dashboard/Units/Show', [
                'unit' => (new UnitResource($unit))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[UnitController] Failed to show unit', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_controller_error',
            ]);

            return redirect()->route('units.index')
                ->with('error', 'Unit tidak ditemukan');
        }
    }

    public function edit(int $id): Response|RedirectResponse
    {
        try {
            return Inertia::render('Dashboard/Units/Edit', [
                'unit' => (new UnitResource($this->unitService->getById($id)))->resolve(),
            ]);
        } catch (Throwable $e) {
            Log::error('[UnitController] Failed to load unit edit form', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_controller_error',
            ]);

            return redirect()->route('units.index')
                ->with('error', 'Unit tidak ditemukan');
        }
    }

    public function update(UpdateUnitRequest $request, int $id): RedirectResponse
    {
        try {
            $result = $this->unitService->update($id, $request->validated());

            return redirect()->route('units.index')
                ->with('success', "Unit '{$result->name}' berhasil diperbarui");
        } catch (Throwable $e) {
            Log::error('[UnitController] Failed to update unit', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_controller_error',
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        try {
            $deleted = $this->unitService->destroy($id);

            if ($deleted) {
                return redirect()->route('units.index')
                    ->with('success', 'Unit berhasil dihapus');
            }

            return redirect()->back()->with('error', 'Gagal menghapus unit');
        } catch (Throwable $e) {
            Log::error('[UnitController] Failed to delete unit', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'unit_controller_error',
            ]);

            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search'        => $request->string('search')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
            'sortBy'        => $request->string('sortBy', 'created_at')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
        ];
    }
}
```

#### Aturan khusus Web Controllers:

- **Super admin only** (salaries, units, settings, feature-catalog): gunakan dua attribute:
  ```php
  #[Middleware('auth')]
  #[Middleware('role:super_admin')]
  class UnitController extends Controller { ... }
  ```
- **Inertia error fallback** harus mengembalikan page yang sama dengan data kosong, **bukan redirect**.
- Resource data untuk Inertia **selalu** di-resolve dengan `->resolve()`.
- Gunakan `$units->items()` (bukan `$units`) saat melewatkan data paginator ke resource collection.

---

## 4. Import Controllers

Import Controllers mengikuti pola Web Controller dengan middleware `auth`.

```php
<?php

namespace App\Http\Controllers\Import;

use App\Http\Controllers\Controller;
use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth')]
class CategoryImportController extends Controller
{
    // method-method import tetap tidak berubah strukturnya
}
```

---

## 5. Route Files

### 5.1 Middleware di Route vs Controller

**Setelah refactor**, `Route::middleware()->group(...)` **dihapus** dari route files untuk semua controller yang sudah menggunakan `#[Middleware]` attribute.

#### Tabel perubahan:

| Route File | Sebelum | Sesudah |
|---|---|---|
| `web.php` | `Route::middleware('auth')->group(...)` | **Hapus wrapper**, sudah di controller |
| `api_mobile_cashier.php` | `Route::middleware('auth:sanctum')->group(...)` | **Hapus wrapper**, sudah di controller |
| `api_mobile_customer.php` | `Route::middleware('auth:sanctum')->group(...)` | **Hapus wrapper**, sudah di controller |
| `api_mobile_production.php` | `Route::middleware('auth:sanctum')->group(...)` | **Hapus wrapper**, sudah di controller |
| `api.php` | `Route::middleware('auth:sanctum')->group(...)` | **Hapus wrapper**, sudah di controller |

> **PENGECUALIAN:** Jika ada route yang bersifat granular (misalnya `throttle`) atau memanggil controller third-party, middleware bisa tetap di route file.

#### Contoh refactor `api_mobile_cashier.php`:

```php
// SEBELUM:
Route::prefix('mobile/cashier')->name('mobile.cashier.')->group(function () {
    Route::prefix('auth')->controller(EmployeeAuthController::class)->group(function () {
        Route::post('login', 'login');

        Route::middleware('auth:sanctum')->group(function () {  // ← HAPUS ini
            Route::post('logout', 'logout');
            Route::get('me', 'me');
        });
    });

    Route::middleware('auth:sanctum')->group(function () {  // ← HAPUS ini
        Route::apiResource('units', UnitController::class);
        Route::apiResource('orders', OrderController::class);
    });
});

// SESUDAH (middleware sudah ada di setiap controller via attribute):
Route::prefix('mobile/cashier')->name('mobile.cashier.')->group(function () {
    Route::prefix('auth')->controller(EmployeeAuthController::class)->group(function () {
        Route::post('login', 'login');
        Route::post('logout', 'logout');
        Route::get('validate', 'validateToken');
        Route::get('me', 'me');
    });

    Route::apiResource('units', UnitController::class);
    Route::apiResource('orders', OrderController::class);
    // ...
});
```

---

### 5.2 Aturan Route Files

1. **Gunakan named routes** (`->name()`) secara konsisten di semua route.
2. **Gunakan `whereNumber()`** untuk semua parameter ID numerik.
3. **Gunakan `Route::controller()`** untuk mengelompokkan routes dari controller yang sama.
4. **Gunakan `Route::apiResource()`** untuk controller dengan set CRUD standar.
5. **Gunakan `middlewareFor()` / `withoutMiddlewareFor()`** di route hanya jika ada kebutuhan granular yang tidak bisa ditangani oleh method-level attribute:
   ```php
   // Contoh: throttle hanya untuk endpoint store
   Route::apiResource('orders', OrderController::class)
       ->middlewareFor('store', 'throttle:60,1');
   ```

---

## 6. Contoh Lengkap per Kategori

### Controller Auth — Middleware Method-Level

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;

// Tidak ada middleware di class level karena login bersifat public
class EmployeeAuthController extends Controller
{
    /**
     * Login — PUBLIC endpoint, tidak perlu auth.
     */
    public function login(Request $request): JsonResponse
    {
        // ...
    }

    /**
     * Logout — PROTECTED.
     */
    #[Middleware('auth:sanctum')]
    public function logout(): JsonResponse
    {
        Auth::user()->currentAccessToken()->delete();
        return $this->successResponse(null, 'Logged out successfully');
    }

    /**
     * Validate token — PROTECTED.
     */
    #[Middleware('auth:sanctum')]
    public function validateToken(): JsonResponse
    {
        return $this->successResponse(['valid' => true], 'Token is valid');
    }

    /**
     * Get current user — PROTECTED.
     */
    #[Middleware('auth:sanctum')]
    public function me(): JsonResponse
    {
        return $this->successResponse(Auth::user(), 'User retrieved');
    }
}
```

---

### Controller API dengan Pagination

```php
<?php

namespace App\Http\Controllers\Api;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Resources\Fine\FineResource;
use App\Services\FineService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

#[Middleware('auth:sanctum')]
class FineController extends Controller
{
    public function __construct(
        private readonly FineService $fineService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilters($request);

            $fines = $this->fineService->getAll(
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: ['outlet']
            );

            return $this->successResponse(
                FineResource::collection($fines->items())->resolve(),
                'Fines fetched successfully',
                200,
                PaginationHelper::format($fines, $request)
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[FineController] Failed to fetch fines', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'fine_management',
            ]);

            return $this->errorResponse('Gagal memuat data denda', 500, $e);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $fine = $this->fineService->getById($id, ['outlet']);

            return $this->successResponse(
                (new FineResource($fine))->resolve(),
                'Fine fetched successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[FineController] Failed to fetch fine', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'fine_management',
                'fine_id' => $id,
            ]);

            return $this->errorResponse('Gagal memuat data denda', 500, $e);
        }
    }

    private function getFilters(Request $request): array
    {
        return [
            'search'        => $request->string('search', '')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
            'sortBy'        => $request->string('sortBy', 'createdAt')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'outletId'      => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'minAmount'     => $request->has('minAmount') && $request->filled('minAmount')
                ? $request->float('minAmount')
                : null,
            'maxAmount'     => $request->has('maxAmount') && $request->filled('maxAmount')
                ? $request->float('maxAmount')
                : null,
        ];
    }
}
```

---

## 7. Checklist Refactoring Controller

Gunakan checklist ini untuk setiap controller yang di-refactor:

### Semua Controller (API & Web)

- [ ] Tambahkan `use Illuminate\Routing\Attributes\Controllers\Middleware;`
- [ ] Tambahkan `#[Middleware('auth:sanctum')]` (API) atau `#[Middleware('auth')]` (Web) di class level
- [ ] Untuk super_admin controllers: tambahkan juga `#[Middleware('role:super_admin')]`
- [ ] Untuk Auth controllers: gunakan `#[Middleware]` di method-level, bukan class-level
- [ ] Hapus penggunaan `HasMiddleware` interface (jika ada)
- [ ] Ganti `private ServiceClass $service` menjadi `private readonly ServiceClass $service` di constructor
- [ ] Pastikan setiap method memiliki try-catch dengan urutan: `ModelNotFoundException` → `Throwable`
- [ ] Pastikan `Log::error()` ada di setiap catch `Throwable`
- [ ] Pastikan operasi write kompleks dibungkus DB transaction

### API Controllers

- [ ] Return type semua method adalah `JsonResponse`
- [ ] Gunakan `successResponse()` dan `errorResponse()` untuk semua response
- [ ] Gunakan `->resolve()` saat melewatkan resource ke `successResponse()`
- [ ] Sertakan `PaginationHelper::format()` sebagai argumen ke-4 `successResponse()` jika paginated
- [ ] Gunakan `$paginator->items()` (bukan `$paginator`) saat collection dipaginasi

### Web Controllers

- [ ] Gunakan `Inertia::render()` untuk halaman sukses
- [ ] Fallback error: return `Inertia::render()` dengan data kosong, bukan redirect
- [ ] Gunakan `->resolve()` untuk semua resource yang dikirim ke Inertia
- [ ] Gunakan `$paginator->items()` saat melewatkan data ke resource collection

### Route Files

- [ ] Hapus `Route::middleware()->group(...)` jika controller sudah pakai attribute
- [ ] Pastikan semua route tetap memiliki nama (`->name()`)
- [ ] Pastikan parameter ID numerik tetap menggunakan `->whereNumber()`

---

## Referensi

- [`controller_laravel_13.md`](../controller_laravel_13.md) — Dokumentasi resmi Laravel 13 Controllers
- [`api_resource_spec.md`](./api_resource_spec.md) — Spec standarisasi API Resources proyek ini
- [`app/Http/Controllers/Controller.php`](../app/Http/Controllers/Controller.php) — Base Controller
- [`app/Helpers/PaginationHelper.php`](../app/Helpers/PaginationHelper.php) — Helper pagination
