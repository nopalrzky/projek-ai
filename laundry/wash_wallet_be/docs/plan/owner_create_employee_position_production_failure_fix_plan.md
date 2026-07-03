# Owner Create Employee and Position Production Failure Fix Plan

Plan ini dibuat untuk issue `docs/issue/owner_create_employee_position_production_failure_issue.md`.

## Scope

Perbaiki dua failure production:

- Owner gagal membuat employee karena posisi non-kurir dari outlet yang sama terbaca seolah-olah berasal dari outlet lain.
- Owner gagal membuat position untuk outlet miliknya sendiri karena authorization service melempar `Unauthorized.`.

Tambahkan juga guard frontend agar form create employee tidak menampilkan posisi stale dari outlet sebelumnya saat request posisi selesai tidak berurutan.

Di luar scope:

- Tidak memperbaiki gap tenant check di `CustomerService::store()`. Catat sebagai issue terpisah.
- Tidak mengubah route, payload request, response API, migration, atau business rule cross-outlet.
- Tidak melonggarkan rule: posisi non-kurir tetap hanya boleh dipakai untuk outlet utama employee.

## Root Cause Hypothesis

Ada dua kemungkinan penyebab yang saling melengkapi:

1. Perbandingan strict `===` dan `!==` dipakai pada foreign key Eloquent yang belum di-cast eksplisit (`owner_id`, `outlet_id`). Di production, driver database dapat mengembalikan integer sebagai string, sehingga nilai sama seperti `1` dan `"1"` gagal pada strict comparison.
2. Form create employee melakukan fetch posisi per outlet secara async tanpa stale-response guard. Jika user mengganti outlet cepat, response outlet lama dapat menimpa daftar posisi outlet terbaru.

Fix harus defensif terhadap keduanya.

## Proposed Changes

### 1. Normalize Foreign Key Casts

Modify `app/Models/Position.php`:

- Tambahkan cast:
  - `outlet_id => integer`

Modify `app/Models/Outlet.php`:

- Tambahkan cast:
  - `owner_id => integer`

Modify `app/Models/Employee.php`:

- Tambahkan cast:
  - `outlet_id => integer`

Tujuan: semua comparison berbasis foreign key memakai tipe PHP yang konsisten setelah model di-load dari database.

### 2. Harden Outlet Ownership Helper

Modify `app/Models/Outlet.php`:

- Ubah `isOwner(User $user)` agar membandingkan integer-normalized IDs:
  - `(int) $this->owner_id === (int) $user->id`

Helper ini harus menjadi sumber perbandingan ownership outlet untuk service dan policy yang relevan.

### 3. Consolidate Position Authorization Guard

Modify `app/Services/PositionService.php`:

- Tambahkan helper internal untuk authorization outlet/position access.
- Guard harus menerima hanya `App\Models\User`; auth sebagai `Employee` atau tipe lain tetap ditolak.
- `super_admin` boleh akses semua outlet/position.
- `owner` hanya boleh akses outlet miliknya, memakai `Outlet::isOwner()`.
- Jika unauthorized, lempar `Illuminate\Auth\Access\AuthorizationException('Unauthorized.')`.

Gunakan helper ini di:

- `store()`: authorize outlet dari `$data['outletId']`.
- `update()`: authorize outlet milik position sebelum update.
- `destroy()`: authorize outlet milik position sebelum delete.
- `restore()`: authorize outlet milik position, termasuk soft-deleted record.
- `forceDestroy()`: authorize outlet milik position, termasuk soft-deleted record.
- `updatePermissions()`: authorize outlet milik position sebelum sync permission.

Catatan implementasi:

- Untuk method yang bekerja dengan position, load relation `outlet` secara eksplisit jika belum ada agar helper tidak bergantung pada lazy-loading behavior.
- Jangan duplikasi lagi expression `$position->outlet->owner_id !== $authUser->id` di setiap method.
- Pastikan `updatePermissions()` tidak membuat double-authorization yang inkonsisten saat dipanggil dari `store()` setelah position dibuat.

### 4. Align Position Policy

Modify `app/Policies/PositionPolicy.php`:

- Semua method yang menerima `Position` (`update`, `destroy`, `restore`, `forceDestroy`, `updatePermissions`) harus memakai `Outlet::isOwner()` atau comparison integer-normalized.
- Non-`User` tetap false.
- `super_admin` tetap true.
- `store(Authenticatable $user)` tetap hanya dapat memverifikasi bahwa user adalah `User`, karena outlet id belum tersedia di policy signature. Ownership outlet tetap divalidasi di `PositionService::store()`.

### 5. Align Web Position Store Authorization

Modify `app/Http/Controllers/Web/PositionController.php`:

- Tambahkan `Gate::authorize('store', Position::class)` di `store()`, konsisten dengan `Api\PositionController::store()`.
- Import `App\Models\Position` dan `Illuminate\Support\Facades\Gate`.
- Tetap pertahankan ownership outlet di `PositionService::store()`.

### 6. Harden Employee Position Validation

Modify `app/Services/EmployeeService.php`:

- Di `validatePositionsForEmployee()`, normalisasi nilai berikut ke integer sebelum comparison:
  - `$primaryOutletId`
  - `$ownerId`
  - `$position->outlet_id`
  - `$position->outlet->owner_id`
- Tetap load `outlet` dan `permissions`.
- Tetap tolak jika position owner berbeda dari owner primary outlet.
- Tetap tolak jika position tidak punya courier permission dan `position.outlet_id` berbeda dari primary outlet id.
- Tetap izinkan cross-outlet hanya jika position punya courier permission dan masih dalam owner yang sama.

Recommended shape:

- Cast `$primaryOutletId = (int) $primaryOutletId`.
- Cast `$ownerId = (int) $primaryOutlet->owner_id`.
- Dalam loop, gunakan local variables seperti `$positionOutletId` dan `$positionOwnerId` yang sudah di-cast.
- Jangan mengubah pesan error kecuali perlu untuk konsistensi.

### 7. Optional Model-Level Cross-Outlet Normalization

Modify `app/Models/Employee.php` if strict comparison masih ada di `validatePositionOwnership()`:

- Normalisasi `$position->outlet_id`, `$this->outlet_id`, owner id, dan owner outlet ids ke integer sebelum strict checks.
- Karena `Employee::outlet_id` dan `Position::outlet_id` sudah di-cast, ini defensif tambahan untuk query `pluck()` atau value mentah.

Ini menjaga rule model-level agar konsisten dengan service-level validation.

### 8. Prevent Stale Position Responses in Create Employee UI

Modify `resources/js/Pages/Dashboard/Employees/Create.tsx`:

- Import dan gunakan `useRef`.
- Simpan request sequence terbaru dan outlet id terbaru.
- Saat outlet berubah:
  - Segera kosongkan `positionIds`.
  - Segera kosongkan `positions`.
  - Reset `positionsError`.
  - Mulai loading hanya untuk outlet id valid.
- Ketika `getPositionsByOutletId()` selesai:
  - Abaikan response jika sequence bukan request terbaru.
  - Abaikan response jika outlet id response tidak sama dengan outlet id terbaru.
  - Hanya request terbaru yang boleh memanggil `setPositions`, `setPositionsError`, dan `setLoadingPositions(false)`.
- Di `catch` dan `finally`, jangan update state jika request sudah stale.

Manual behavior yang diinginkan:

- User pilih outlet A lalu cepat pilih outlet B.
- Response A datang belakangan.
- UI tetap menampilkan posisi outlet B, bukan posisi outlet A.
- `positionIds` tidak membawa pilihan dari outlet sebelumnya.

### 9. Check Edit Employee UI for Same Pattern

Inspect `resources/js/Pages/Dashboard/Employees/Edit.tsx`:

- Jika ada fetch posisi per outlet dengan pola async tanpa stale guard, terapkan pola yang sama.
- Jika edit page tidak punya race-prone fetch, cukup catat no-op di implementation summary.

## Tests To Add or Update

### Feature: Employee Create Position Validation

Add or update tests around employee creation/service validation:

- Owner dengan dua outlet membuat employee di outlet B memakai posisi `Kasir` milik outlet B -> sukses.
- Owner mencoba membuat employee di outlet B memakai posisi non-kurir milik outlet A -> gagal.
- Owner membuat employee di outlet B memakai posisi dengan courier permission dari outlet A milik owner yang sama -> sukses.
- Owner mencoba memakai posisi dengan courier permission dari outlet milik owner lain -> gagal.

### Feature: Position Create Authorization

Add or update tests around position create/update:

- Owner membuat position untuk outlet miliknya -> sukses, tidak `Unauthorized`.
- Owner memanipulasi request memakai outlet milik owner lain -> 403.
- `super_admin` membuat position untuk outlet mana pun -> sukses.
- Auth sebagai employee/non-`User` tetap ditolak.

### Unit: Model Casts and Ownership

Add unit regression tests:

- `Position::outlet_id` terbaca sebagai `int`.
- `Outlet::owner_id` terbaca sebagai `int`.
- `Employee::outlet_id` terbaca sebagai `int`.
- `Outlet::isOwner()` true untuk owner valid walau `owner_id` diset dari string.
- `Outlet::isOwner()` false untuk owner lain.

### Existing Regression Tests To Run

Run targeted tests:

- `tests/Feature/CrossOutletPositionPermissionTest.php`
- `tests/Feature/Position/PositionPermissionSyncTest.php`
- `tests/Feature/Rbac/PositionPermissionMiddlewareTest.php`
- `tests/Feature/Rbac/CrossOutletAssignmentTest.php`
- Relevant web employee/position controller tests if available.

## Verification Commands

After implementation, run:

```bash
php -l app/Models/Position.php
php -l app/Models/Outlet.php
php -l app/Models/Employee.php
php -l app/Services/PositionService.php
php -l app/Services/EmployeeService.php
php -l app/Policies/PositionPolicy.php
php -l app/Http/Controllers/Web/PositionController.php
php artisan test tests/Feature/CrossOutletPositionPermissionTest.php
php artisan test tests/Feature/Position/PositionPermissionSyncTest.php
php artisan test tests/Feature/Rbac/PositionPermissionMiddlewareTest.php
php artisan test tests/Feature/Rbac/CrossOutletAssignmentTest.php
npm run build
```

If project test runner differs, use the equivalent existing command.

## Production Diagnostic Optional

If production access is available before or after deploy, verify type behavior with `php artisan tinker` or temporary structured logging:

```php
$position = \App\Models\Position::first();
$outlet = \App\Models\Outlet::first();
$user = \App\Models\User::first();

logger()->info('owner-create-type-check', [
    'position_outlet_id_type' => gettype($position?->outlet_id),
    'outlet_owner_id_type' => gettype($outlet?->owner_id),
    'user_id_type' => gettype($user?->id),
]);
```

Do not leave temporary diagnostic logging in the final code unless intentionally guarded and approved.

## Acceptance Criteria

- Owner dapat membuat position baru untuk outlet miliknya sendiri di production.
- Owner tetap tidak dapat membuat position untuk outlet owner lain.
- Owner dapat membuat employee di outlet B memakai posisi non-kurir milik outlet B.
- Posisi non-kurir dari outlet lain tetap ditolak.
- Posisi dengan courier permission lintas outlet tetap diizinkan hanya untuk owner yang sama.
- UI create employee tidak menampilkan posisi stale dari outlet sebelumnya setelah outlet diganti cepat.
- Tidak ada perubahan API contract, migration, route, atau response format.
