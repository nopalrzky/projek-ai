# RBAC Position Permission — Gap Implementation Plan

## Latar Belakang

Dokumen ini dibuat berdasarkan analisis spec [`employee_permission_user_need.md`](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/docs/spec/employee_permission_user_need.md) dan kondisi kode saat ini.

### Arsitektur RBAC — Permission melalui Position (cross-outlet)

#### Data Model

```
Permission (enum master, fixed)
  │
  │  owner memilih dari sini saat buat/edit posisi
  ▼
positions (tabel, milik outlet)            employee_positions (pivot)
  ├── position_permissions (pivot)   ←→   employees (tabel)
  │   position ↔ permission key           employee ↔ position
  │
  └── outlet_id (FK ke outlets)
```

**Relasi:**
- **Permission** = enum master (fixed, 12 key). Bukan tabel, bukan milik employee.
- **Outlet** has many **Position** (Kasir, Kurir, Produksi, dll)
- **Position** has many **Permission** via `position_permissions` pivot
- **Employee** has many **Position** via `employee_positions` pivot
- Satu position bisa dimiliki banyak employee, satu employee bisa punya banyak position

#### Use Case Utama: Cross-Outlet Position Assignment

```
Owner punya 3 outlet:
├── Outlet A → Posisi: [Kasir A, Kurir A]
├── Outlet B → Posisi: [Kasir B, Kurir B]
└── Outlet C → Posisi: [Kasir C, Kurir C]

Employee "Budi" bekerja di Outlet A (primary outlet)
  Owner assign posisi ke Budi:
  ├── Kasir A  (outlet sendiri)   → bisa kelola order di Outlet A
  ├── Kurir B  (outlet lain!)     → bisa akses kurir order di Outlet B
  └── Kurir C  (outlet lain!)     → bisa akses kurir order di Outlet C

Middleware cek: Budi punya courier.view di Outlet B? → Cek posisi Kurir B → ✅ ada → akses diberikan
```

> [!NOTE]
> **Flow ini sudah jalan di code!**
> - [`Employee::validatePositionOwnership()`](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Models/Employee.php#L500-L530) — validasi kurir boleh dari outlet lain selama masih milik owner yang sama
> - [`CheckEmployeePermission`](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Middleware/CheckEmployeePermission.php) mode `aggregate` — cek permission di semua outlet yang bisa diakses
> - [`Employee::getAccessibleOutletIds()`](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Models/Employee.php#L432-L441) — return semua outlet dari posisi aktif
>
> **Yang belum jalan** adalah gap G0–G6 di bawah.



### Sudah Berjalan dengan Baik ✅
- Enum master permission (12 key + label + default per slug) sudah ada, tapi namanya masih `EmployeePermission` (akan di-rename)
- Validasi `permissions.*` menggunakan `Rule::enum()` di `StorePositionRequest` & `UpdatePositionRequest`
- Middleware outlet-aware + aggregate mode sudah aktif (kelas `CheckEmployeePermission`, akan di-rename)
- Route guard mobile cashier & production memakai `employee.permission:{key}` (akan di-rename ke `position.permission`)
- `LoginEmployeeResource` memuat `accessibleOutlets` dan `allPermissions`
- `PositionService::createDefaultPositionsForOutlet()` menyimpan default permission saat outlet baru
- `PositionService::updatePermissions()` sudah ada (atomic sync ke `position_permissions`)
- Pivot `employee_positions` sudah ada dengan soft delete support

### Gap yang Harus Diselesaikan ❌

| # | Gap | FR/NFR |
|---|-----|--------|
| G0 | Nama enum `EmployeePermission`, middleware class `CheckEmployeePermission`, dan alias `employee.permission` salah — harus mengacu ke "position" bukan "employee" | Naming |
| G1 | `PositionService::store()` tidak menyimpan `permissions` dari request ke `position_permissions` | FR-02 |
| G2 | `PositionService::update()` tidak menyimpan `permissions` dari request ke `position_permissions` | FR-02 |
| G3 | `PositionController` (API) hanya dilindungi `auth:sanctum`, tidak ada otorisasi owner-outlet | NFR-01 |
| G4 | `store/update/destroy` di `PositionService` tidak memverifikasi kepemilikan tenant sebelum eksekusi | NFR-01 |
| G5 | Tidak ada endpoint `GET /api/permissions/catalog` untuk katalog permission master | FR-01 |
| G6 | Tidak ada feature test untuk acceptance criteria FR-02, FR-03, NFR-01 | — |

---

## Resolved Questions

> [!NOTE]
> **Audit log (FR-07)**: Tidak perlu tabel baru. Audit cukup `Log::info()` yang sudah ada di `PositionService::updatePermissions()`.

> [!NOTE]
> **Otorisasi employee ke endpoint manajemen position**: Ya, employee ditolak 403. `PositionPolicy` hanya menerima `User` — `Employee` otomatis ditolak oleh Laravel.

---

## Proposed Changes

### Component 0 — Rename: `EmployeePermission` → `Permission`, Middleware → `CheckPositionPermission`, Alias → `position.permission`

Masalah: Penamaan saat ini (`EmployeePermission`, `CheckEmployeePermission`, `employee.permission`) mengimplikasikan permission ditempel langsung ke employee. Padahal permission **milik position**.

---

#### [RENAME] [EmployeePermission.php → Permission.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Enums/EmployeePermission.php)

- Rename file: `app/Enums/EmployeePermission.php` → `app/Enums/Permission.php`
- Rename enum: `EmployeePermission` → `Permission`
- Update namespace: `App\Enums\Permission`

#### [RENAME] [CheckEmployeePermission.php → CheckPositionPermission.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Middleware/CheckEmployeePermission.php)

- Rename file: `app/Http/Middleware/CheckEmployeePermission.php` → `app/Http/Middleware/CheckPositionPermission.php`
- Rename class: `CheckEmployeePermission` → `CheckPositionPermission`

#### [MODIFY] [bootstrap/app.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/bootstrap/app.php)

Update middleware alias:
```diff
-'employee.permission' => \App\Http\Middleware\CheckEmployeePermission::class,
+'position.permission'  => \App\Http\Middleware\CheckPositionPermission::class,
```

#### [MODIFY] File-file yang mengimport/mereferensikan `EmployeePermission`:

| File | Perubahan |
|------|-----------|
| [PositionService.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Services/PositionService.php) | `use App\Enums\EmployeePermission` → `use App\Enums\Permission` + 2 usage |
| [StorePositionRequest.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Requests/Position/StorePositionRequest.php) | `use App\Enums\EmployeePermission` → `use App\Enums\Permission` + 1 usage |
| [UpdatePositionRequest.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Requests/Position/UpdatePositionRequest.php) | `use App\Enums\EmployeePermission` → `use App\Enums\Permission` + 1 usage |
| [Web/PositionController.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Controllers/Web/PositionController.php) | 2x inline `\App\Enums\EmployeePermission::cases()` → `\App\Enums\Permission::cases()` |

#### [MODIFY] File routes — ganti alias `employee.permission` → `position.permission`:

| File | Baris terdampak |
|------|-----------------|
| [api_mobile_cashier.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/routes/api_mobile_cashier.php) | ~30 baris |
| [api_mobile_production.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/routes/api_mobile_production.php) | ~18 baris |

> [!WARNING]
> Lakukan find-and-replace `employee.permission` → `position.permission` di kedua file route di atas. Pastikan tidak ada typo — middleware alias harus exact match.

#### [MODIFY] Docs & Tests:

| File | Perubahan |
|------|-----------|
| [employee_permission_user_need.md](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/docs/spec/employee_permission_user_need.md) | Update referensi enum & middleware name |
| [CourierScheduleApiTest.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/tests/Feature/CourierScheduleApiTest.php) | `setupEmployeePermissions` → `setupPositionPermissions` (opsional, tapi recommended) |
| [EmployeePermissionMiddlewareTest.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/tests/Feature/Rbac/EmployeePermissionMiddlewareTest.php) | Rename file jika perlu, sesuaikan referensi |

---

### Component 1 — PositionService: Sync permissions saat store & update

Masalah: `store()` tidak memproses key `permissions` dari data request. `update()` juga tidak. `updatePermissions()` sudah ada dan benar, tinggal dipanggil.

---

#### [MODIFY] [PositionService.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Services/PositionService.php)

**`store()`** — setelah `$position` dibuat, jika `$data['permissions']` ada dan tidak kosong, panggil `$this->updatePermissions($position->id, $data['permissions'])` di dalam transaction yang sama.

**`update()`** — setelah `$position->save()`, jika `$data['permissions']` ada (termasuk array kosong untuk menghapus semua), panggil `$this->updatePermissions($position->id, $data['permissions'])` dalam DB::transaction.

> [!NOTE]
> `updatePermissions()` sudah atomic (pakai `DB::transaction`). Pastikan `store()` membungkus seluruh operasi (create + sync permission) dalam satu transaction yang sama agar atomik (saat ini `store()` sudah pakai `DB::transaction`, tinggal sisipkan pemanggilan `updatePermissions()` di dalamnya).

---

### Component 2 — Authorization: PositionPolicy untuk owner-tenant guard

Tidak ada direktori `app/Policies`. Perlu dibuat baru.

---

#### [NEW] [PositionPolicy.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Policies/PositionPolicy.php)

```php
<?php

namespace App\Policies;

use App\Models\Position;
use App\Models\User;

class PositionPolicy
{
    /**
     * Owner hanya boleh store/update/destroy position pada outlet miliknya.
     * Employee (non-User) selalu ditolak.
     */
    public function store(User $user): bool
    {
        return true; // outlet ownership divalidasi di service layer
    }

    public function update(User $user, Position $position): bool
    {
        return $position->outlet->owner_id === $user->id;
    }

    public function destroy(User $user, Position $position): bool
    {
        return $position->outlet->owner_id === $user->id;
    }

    public function updatePermissions(User $user, Position $position): bool
    {
        return $position->outlet->owner_id === $user->id;
    }
}
```

> [!NOTE]
> Policy ini hanya menerima `User` sebagai `$user`, bukan `Employee`. Laravel akan otomatis menolak dengan 403 jika authenticated user bukan instance `User`.

---

#### [MODIFY] [bootstrap/app.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/bootstrap/app.php)

> [!IMPORTANT]
> Project menggunakan Laravel 13 (`"laravel/framework": "^13.0"`). Laravel 11+ mendukung automatic policy discovery jika policy dinamai `{Model}Policy` dan berada di `App\Policies`. Karena file dinamai `PositionPolicy` → otomatis terhubung ke model `Position`. Tidak perlu registrasi eksplisit.

---

#### [MODIFY] [PositionController.php (Api)](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Controllers/Api/PositionController.php)

Tambahkan `$this->authorize()` calls di method `store`, `update`, `destroy`:

```php
// store()
$this->authorize('store', Position::class);

// update()
$position = $this->positionService->getById($id);
$this->authorize('update', $position);

// destroy()
$position = $this->positionService->getById($id);
$this->authorize('destroy', $position);
```

---

#### [MODIFY] [PositionService.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Services/PositionService.php)

Tambahkan validasi tenant di `update()`, `destroy()`, `forceDestroy()`, `updatePermissions()`:

```php
// Di dalam update() sebelum save:
$authUser = Auth::user();
if ($authUser instanceof \App\Models\User && $position->outlet->owner_id !== $authUser->id) {
    throw new \Illuminate\Auth\Access\AuthorizationException('Unauthorized.');
}
```

> [!NOTE]
> Ini lapisan defense-in-depth di service, di samping policy di controller. Jika policy sudah terpasang di controller, guard di service bersifat optional tapi recommended.

---

### Component 3 — Catalog API Endpoint

Spec FR-01 meminta endpoint yang mengembalikan daftar master permission (key + label) agar web/mobile konsisten dari satu sumber.

---

#### [NEW] [PermissionCatalogController.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Controllers/Api/PermissionCatalogController.php)

```php
<?php

namespace App\Http\Controllers\Api;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class PermissionCatalogController extends Controller
{
    /**
     * GET /api/permissions/catalog
     * Mengembalikan daftar master permission (read-only).
     */
    public function index(): JsonResponse
    {
        $permissions = array_map(fn(Permission $p) => [
            'key'   => $p->value,
            'label' => $p->label(),
        ], Permission::cases());

        return $this->successResponse($permissions, 'Permission catalog fetched successfully');
    }
}
```

---

#### [MODIFY] [routes/web.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/routes/web.php) (bagian `/api` prefix, baris ~484)

Tambahkan route baru di dalam grup `Route::prefix('api')`:

```php
Route::get('permissions/catalog', [PermissionCatalogController::class, 'index'])
    ->name('permissions.catalog');
```

> [!NOTE]
> Endpoint ini readonly master data. Tidak memerlukan otorisasi owner-specific.

---

### Component 4 — Feature Tests

---

#### [NEW] [tests/Feature/Position/PositionPermissionSyncTest.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/tests/Feature/Position/PositionPermissionSyncTest.php)

Test case yang harus dicover:

| Test | Acceptance Criteria |
|------|---------------------|
| `store position dengan permissions tersimpan di position_permissions` | AC-1 |
| `update position mengganti permissions yang ada` | AC-1 |
| `store dengan invalid permission key ditolak 422` | AC-2 |
| `update dengan invalid permission key ditolak 422` | AC-2 |
| `owner tidak bisa store position di outlet milik owner lain` | NFR-01 |
| `owner tidak bisa update position di outlet milik owner lain` | NFR-01 |
| `owner tidak bisa destroy position di outlet milik owner lain` | NFR-01 |
| `employee tidak bisa akses endpoint manajemen position (store/update/destroy)` | NFR-01 |

Gunakan Pest PHP. Setiap test:
- Gunakan `RefreshDatabase`
- Buat `User` (owner) dengan `User::factory()->createOne()`
- Buat `Outlet` milik owner tersebut
- Authenticate dengan `$this->actingAs($owner, 'web')` (atau guard yang dipakai route)
- Untuk test employee: `$this->actingAs($employee, 'sanctum')`

---

#### [NEW] [tests/Feature/Position/PermissionCatalogApiTest.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/tests/Feature/Position/PermissionCatalogApiTest.php)

| Test | Cakupan |
|------|---------|
| `GET /api/permissions/catalog mengembalikan 12 permission key` | FR-01 |
| `setiap item memiliki key dan label` | FR-01 |
| `unauthenticated request ditolak 401` | Security |

---

## Verification Plan

### Automated Tests

```bash
# Jalankan semua test baru
php artisan test tests/Feature/Position/

# Pastikan test yang sudah ada tidak rusak (setelah rename)
php artisan test tests/Feature/Auth/EmployeeLoginPermissionTest.php
php artisan test tests/Feature/Rbac/
php artisan test tests/Feature/CourierScheduleApiTest.php
```

### Manual Verification

1. **Store position dengan permissions**: POST ke `/api/positions` dengan body `{ "outletId": X, "name": "Kasir Baru", "permissions": ["order.view", "order.create"] }` → cek tabel `position_permissions` memuat 2 baris.
2. **Update permissions**: PUT ke `/api/positions/{id}` dengan `{ "permissions": [] }` → semua permission position tersebut terhapus.
3. **Invalid permission key**: POST dengan `{ "permissions": ["order.hack"] }` → respons 422.
4. **Catalog endpoint**: GET `/api/permissions/catalog` (dengan auth) → 12 item dengan `key` dan `label`.
5. **Employee akses manajemen position**: Coba POST `/api/positions` dengan Sanctum token employee → 403.

---

## Urutan Eksekusi yang Disarankan

1. **G0** — Rename `EmployeePermission` → `Permission`, `CheckEmployeePermission` → `CheckPositionPermission`, alias `employee.permission` → `position.permission`. Jalankan test setelah rename untuk memastikan tidak ada broken reference.
2. **G1/G2** — Modifikasi `PositionService` store/update untuk sync permissions.
3. **G5** — Buat `PermissionCatalogController` + tambah route.
4. **G3/G4** — Buat `PositionPolicy` + tambah `authorize()` di controller + guard di service.
5. **G6** — Tulis semua feature test.
