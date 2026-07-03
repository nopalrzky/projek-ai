# Plan: Index Profile dan Edit Profile Tablet — Cashier App & Production App

**Tanggal:** 2026-06-29
**Referensi User Need:** `docs/user_need/cashier_production_tablet_profile_user_need.md`
**Target Eksekutor:** AI model lain (bukan yang menyusun plan ini)
**Scope:** Backend (Laravel) → Shared Domain/Data Layer → Cashier App → Production App

---

## Ringkasan

Plan ini mengimplementasikan halaman **Index Profile** dan **Edit Profile** untuk Cashier App dan Production App pada tampilan tablet. Fitur ini mencakup:

1. **Backend** — endpoint baru untuk update profile pribadi dan change password employee.
2. **Shared Domain & Data Layer** — entity, repository, use case, dan datasource yang digunakan kedua app.
3. **Cashier App** — mengisi file index/edit profile yang masih kosong, memperbaiki routing, dan menyambungkan sidebar.
4. **Production App** — menambahkan menu `Profil` di sidebar, membuat route, dan screen profile dari nol.

> **PENTING**: Ini bukan greenfield. Cashier sudah punya banyak bagian (PIN flow, routes, auth cubit). Baca tabel konteks di bawah sebelum mulai mengerjakan. Jangan menimpa atau mengubah yang sudah ada kecuali disebut eksplisit.

---

## Konteks Codebase Saat Ini

### Yang sudah ada dan relevan

| Item | File / Lokasi | Keterangan |
|------|--------------|------------|
| `AuthEmployee` entity | `packages/wash_wallet_domain/lib/src/entities/auth_employee.dart` | Ada. Field: `id`, `name`, `username`, `email`, `phone`, `outletId`, `accessibleOutlets`, `allPermissions`, `hasPin`. Belum ada `gender`, `address` |
| `LoginEmployeeResource` | `webapp/wash_wallet_be/app/Http/Resources/Employee/LoginEmployeeResource.php` | Sudah mengirim `gender`, `address`, `startDate`, dll. tetapi field ini belum di-map ke `AuthEmployee` |
| Auth repository interface | `packages/wash_wallet_domain/lib/src/repositories/auth_repository.dart` | Ada |
| Auth repository impl | `packages/wash_wallet_data/lib/src/auth/repositories/auth_repository_impl.dart` | Ada |
| Auth remote datasource | `packages/wash_wallet_data/lib/src/auth/datasources/auth_remote_datasource.dart` | Ada |
| `AuthCubit` Cashier | `apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart` | Ada. Punya `setupPin()`, `logout()`, `refreshMe()` |
| `AuthCubit` Production | `apps/production/lib/features/auth/presentation/bloc/auth_cubit.dart` | Ada. Punya `setupPin()`, login, logout, refresh me |
| Backend setup PIN Cashier | `POST /mobile/cashier/auth/pin/setup` | Ada |
| Backend setup PIN Production | `POST /mobile/production/auth/pin/setup` | Ada |
| Backend reset PIN Cashier | `POST /mobile/cashier/auth/pin/reset` | Ada |
| Backend reset PIN Production | `POST /mobile/production/auth/pin/reset` | Ada |
| Backend GET me Cashier | `GET /mobile/cashier/auth/me` | Ada |
| Backend GET me Production | `GET /mobile/production/auth/me` | Ada |
| `SetupPinScreen` Cashier | `apps/cashier/lib/features/auth/presentation/screens/setup_pin_screen.dart` | Ada |
| `ConfirmPinScreen` Cashier | `apps/cashier/lib/features/auth/presentation/screens/confirm_pin_screen.dart` | Ada |
| `ResetPinVerifyScreen` Cashier | Di Cashier Settings flow | Ada |
| `ResetPinNewScreen` Cashier | Di Cashier Settings flow | Ada |
| `PinBoxInput` widget | `apps/cashier/lib/features/auth/presentation/widgets/pin_box_input.dart` | Ada |
| Sidebar tablet Cashier | `apps/cashier/lib/core/navigation/main_shell_screen.dart` | Ada. Sudah punya item `Profil` yang navigasi ke `/profile` |
| `CashierNavigationConfig` | `apps/cashier/lib/core/navigation/cashier_navigation_config.dart` | Ada |
| Route `/profile` Cashier | `apps/cashier/lib/core/router/app_router.dart` | Ada, mengarah ke `ProfileSettingScreen` lama |
| `ProfileSettingScreen` Cashier | `apps/cashier/lib/features/setting/presentation/screens/profile_setting_screen.dart` | Ada. Form nama+email, action simpan hanya snackbar. Akan digantikan oleh index/edit profile baru |
| File kosong index profile Cashier | `apps/cashier/lib/features/profile/presentation/index_profile_screen.dart` | Ada tapi kosong |
| File kosong edit profile Cashier | `apps/cashier/lib/features/profile/presentation/edit_profile_screen.dart` | Ada tapi kosong |
| `ProductionTabletShell` | `apps/production/lib/core/widgets/production_tablet_shell.dart` | Ada |
| `ProductionNavigationConfig` | `apps/production/lib/core/navigation/production_navigation_config.dart` | Ada. Sidebar belum ada item `Profil` |
| Router Production | `apps/production/lib/core/router/app_router.dart` | Ada. Belum ada route `/profile` atau `/profile/edit` |
| `EmployeeAuthController` backend | `webapp/wash_wallet_be/app/Http/Controllers/Api/EmployeeAuthController.php` | Ada. Punya setup/reset PIN |
| Route cashier mobile | `webapp/wash_wallet_be/routes/api_mobile_cashier.php` | Ada. Dilindungi `auth:sanctum` middleware |
| Route production mobile | `webapp/wash_wallet_be/routes/api_mobile_production.php` | Ada |

### Yang belum ada (gap yang harus diimplementasikan)

| Item | Keterangan |
|------|------------|
| Backend `PATCH /mobile/cashier/auth/profile` | Endpoint update profile pribadi cashier — belum ada |
| Backend `PATCH /mobile/production/auth/profile` | Endpoint update profile pribadi production — belum ada |
| Backend `POST /mobile/cashier/auth/password` | Endpoint change password cashier — belum ada |
| Backend `POST /mobile/production/auth/password` | Endpoint change password production — belum ada |
| `UpdateEmployeeProfileRequest.php` | Form request baru untuk update profile — belum ada |
| `ChangeEmployeePasswordRequest.php` | Form request baru untuk change password — belum ada |
| Method `updateProfile()` di `EmployeeAuthController` | Belum ada |
| Method `changePassword()` di `EmployeeAuthController` | Belum ada |
| Field `gender` dan `address` di `AuthEmployee` | Belum ada di entity domain |
| `AuthEmployeeModel` update | Belum map field `gender`, `address` dari JSON |
| `AuthRepository.updateProfile()` | Method interface belum ada |
| `AuthRepository.changePassword()` | Method interface belum ada |
| `AuthRepositoryImpl.updateProfile()` | Impl belum ada |
| `AuthRepositoryImpl.changePassword()` | Impl belum ada |
| `AuthRemoteDatasource.updateProfile()` | Method belum ada |
| `AuthRemoteDatasource.changePassword()` | Method belum ada |
| `UpdateProfileUseCase` | Domain use case belum ada |
| `ChangePasswordUseCase` | Domain use case belum ada |
| `AuthCubit.updateProfile()` (Cashier) | Method belum ada |
| `AuthCubit.changePassword()` (Cashier) | Method belum ada |
| State `ProfileUpdating` / `ProfileUpdateSuccess` | Auth state baru Cashier — belum ada |
| State `PasswordChanging` / `PasswordChangeSuccess` | Auth state baru Cashier — belum ada |
| `IndexProfileScreen` Cashier | File ada tapi kosong |
| `EditProfileScreen` Cashier | File ada tapi kosong |
| Menu `Profil` di sidebar Production | Belum ada di `ProductionNavigationConfig` |
| Route `/profile` Production | Belum ada |
| Route `/profile/edit` Production | Belum ada |
| `IndexProfileScreen` Production | Belum ada |
| `EditProfileScreen` Production | Belum ada |
| `AuthCubit.updateProfile()` (Production) | Belum ada |
| `AuthCubit.changePassword()` (Production) | Belum ada |
| UI reset PIN Production | Backend sudah ada, tapi UI reset PIN di Production belum ada |

---

## Urutan Pengerjaan

Pengerjaan harus dilakukan berurutan karena ada dependency antar layer:

```
Area 1 (Backend) → Area 2 (Shared Domain) → Area 3 (Shared Data) → Area 4 (Cashier App) → Area 5 (Production App)
```

---

## Area 1 — Backend Laravel

### 1.1 `UpdateEmployeeProfileRequest.php` [NEW]

**Lokasi:** `webapp/wash_wallet_be/app/Http/Requests/Auth/UpdateEmployeeProfileRequest.php`

Ikuti pola `SetupPinRequest.php` yang ada di `app/Http/Requests/Auth/`.

Rules:

```php
public function rules(): array
{
    return [
        'name'    => ['required', 'string', 'max:255'],
        'email'   => ['nullable', 'email', 'max:255', 'unique:employees,email,' . $this->user()->id],
        'phone'   => ['nullable', 'string', 'max:20'],
        'gender'  => ['nullable', 'in:male,female'],
        'address' => ['nullable', 'string', 'max:1000'],
    ];
}
```

`unique:employees,email` harus mengecualikan employee saat ini agar tidak konflik saat email tidak berubah.

---

### 1.2 `ChangeEmployeePasswordRequest.php` [NEW]

**Lokasi:** `webapp/wash_wallet_be/app/Http/Requests/Auth/ChangeEmployeePasswordRequest.php`

Rules:

```php
public function rules(): array
{
    return [
        'current_password'      => ['required', 'string'],
        'password'              => ['required', 'string', 'min:8', 'confirmed'],
        'password_confirmation' => ['required', 'string'],
    ];
}
```

Catatan: `min:8` mengikuti standar owner. Tambahkan rule kombinasi huruf besar/kecil jika sudah diterapkan di owner.

---

### 1.3 Method `updateProfile()` di `EmployeeAuthController` [MODIFY]

**File:** `webapp/wash_wallet_be/app/Http/Controllers/Api/EmployeeAuthController.php`

Tambahkan method baru. Jangan ubah method yang sudah ada.

Logika:
1. Ambil employee authenticated dari `auth()->user()`.
2. Validasi request dengan `UpdateEmployeeProfileRequest`.
3. Update hanya field: `name`, `email`, `phone`, `gender`, `address`.
4. **Jangan update**: `position_ids`, `salary`, `commissions`, `cutoff_days`, `is_active`, `outlet_id`, `username`, `password`.
5. Simpan ke database.
6. Return `LoginEmployeeResource` dengan data terbaru.

Response sukses:

```json
{
  "message": "Profile berhasil diperbarui",
  "employee": { "...LoginEmployeeResource..." }
}
```

---

### 1.4 Method `changePassword()` di `EmployeeAuthController` [MODIFY]

**File:** `webapp/wash_wallet_be/app/Http/Controllers/Api/EmployeeAuthController.php`

Logika:
1. Ambil employee authenticated.
2. Validasi request dengan `ChangeEmployeePasswordRequest`.
3. Verifikasi `current_password` dengan `Hash::check($request->current_password, $employee->password)`.
4. Jika salah, return error 422: `"current_password tidak sesuai"`.
5. Update password dengan `Hash::make($request->password)`.
6. **Jangan logout** session yang sedang aktif (jangan invalidate token).
7. Return response sukses tanpa password atau hash.

Response sukses:

```json
{
  "message": "Password berhasil diperbarui"
}
```

---

### 1.5 Daftarkan Route di `api_mobile_cashier.php` [MODIFY]

**File:** `webapp/wash_wallet_be/routes/api_mobile_cashier.php`

Tambahkan di dalam group yang sudah dilindungi `auth:sanctum`:

```php
Route::patch('/auth/profile', [EmployeeAuthController::class, 'updateProfile']);
Route::post('/auth/password', [EmployeeAuthController::class, 'changePassword']);
```

Endpoint lengkap:
- `PATCH /api/mobile/cashier/auth/profile`
- `POST /api/mobile/cashier/auth/password`

---

### 1.6 Daftarkan Route di `api_mobile_production.php` [MODIFY]

**File:** `webapp/wash_wallet_be/routes/api_mobile_production.php`

Tambahkan dengan pola yang sama persis:

```php
Route::patch('/auth/profile', [EmployeeAuthController::class, 'updateProfile']);
Route::post('/auth/password', [EmployeeAuthController::class, 'changePassword']);
```

Endpoint lengkap:
- `PATCH /api/mobile/production/auth/profile`
- `POST /api/mobile/production/auth/password`

> **Verifikasi terlebih dahulu**: Pastikan `EmployeeAuthController` yang dipakai cashier dan production adalah controller yang sama atau paralel sebelum mendaftarkan route.

---

## Area 2 — Shared Domain (`packages/wash_wallet_domain`)

### 2.1 Update `AuthEmployee` entity [MODIFY]

**File:** `packages/wash_wallet_domain/lib/src/entities/auth_employee.dart`

Tambahkan field baru yang sudah dikirim backend tapi belum di-map:

```dart
final String? gender;
final String? address;
```

Pastikan constructor, `copyWith`, dan `==`/`hashCode` diperbarui mengikuti field baru.

---

### 2.2 Tambah `updateProfile()` dan `changePassword()` ke `AuthRepository` interface [MODIFY]

**File:** `packages/wash_wallet_domain/lib/src/repositories/auth_repository.dart`

Tambahkan:

```dart
Future<Either<Failure, AuthEmployee>> updateProfile({
  required String name,
  String? email,
  String? phone,
  String? gender,
  String? address,
});

Future<Either<Failure, void>> changePassword({
  required String currentPassword,
  required String newPassword,
  required String newPasswordConfirmation,
});
```

---

### 2.3 `UpdateProfileUseCase` [NEW]

**Lokasi:** `packages/wash_wallet_domain/lib/src/usecases/auth/update_profile_usecase.dart`

```dart
class UpdateProfileUseCase {
  final AuthRepository repository;

  UpdateProfileUseCase(this.repository);

  Future<Either<Failure, AuthEmployee>> call({
    required String name,
    String? email,
    String? phone,
    String? gender,
    String? address,
  }) => repository.updateProfile(
    name: name,
    email: email,
    phone: phone,
    gender: gender,
    address: address,
  );
}
```

---

### 2.4 `ChangePasswordUseCase` [NEW]

**Lokasi:** `packages/wash_wallet_domain/lib/src/usecases/auth/change_password_usecase.dart`

```dart
class ChangePasswordUseCase {
  final AuthRepository repository;

  ChangePasswordUseCase(this.repository);

  Future<Either<Failure, void>> call({
    required String currentPassword,
    required String newPassword,
    required String newPasswordConfirmation,
  }) => repository.changePassword(
    currentPassword: currentPassword,
    newPassword: newPassword,
    newPasswordConfirmation: newPasswordConfirmation,
  );
}
```

---

### 2.5 Export use case baru di barrel domain [MODIFY]

Export `UpdateProfileUseCase` dan `ChangePasswordUseCase` di barrel file domain package.

---

## Area 3 — Shared Data Layer (`packages/wash_wallet_data`)

### 3.1 Update `AuthEmployeeModel` [MODIFY]

**File:** `packages/wash_wallet_data/lib/src/auth/models/auth_employee_model.dart`

Tambahkan parsing `gender` dan `address` dari JSON di `fromJson`:

```dart
gender: json['gender'] as String?,
address: json['address'] as String?,
```

Tambahkan ke `toJson` jika ada.

---

### 3.2 Tambah method `updateProfile()` ke `AuthRemoteDatasource` [MODIFY]

**File:** `packages/wash_wallet_data/lib/src/auth/datasources/auth_remote_datasource.dart`

Tambahkan method:

```dart
Future<AuthEmployeeModel> updateProfile({
  required String name,
  String? email,
  String? phone,
  String? gender,
  String? address,
});
```

Implementasi memanggil `PATCH /auth/profile` pada base URL yang sudah dikonfigurasi per app. Response di-parse menjadi `AuthEmployeeModel` dari field `employee` di response JSON.

---

### 3.3 Tambah method `changePassword()` ke `AuthRemoteDatasource` [MODIFY]

Tambahkan method:

```dart
Future<void> changePassword({
  required String currentPassword,
  required String newPassword,
  required String newPasswordConfirmation,
});
```

Implementasi memanggil `POST /auth/password`. Tidak perlu parse response body selain memastikan status sukses.

---

### 3.4 Implementasi di `AuthRepositoryImpl` [MODIFY]

**File:** `packages/wash_wallet_data/lib/src/auth/repositories/auth_repository_impl.dart`

Implementasikan kedua method baru dari interface:

- `updateProfile()`: Panggil datasource, pada sukses simpan `AuthEmployeeModel` baru ke local cache (pola yang sama dengan `refreshMe()`), return `AuthEmployee`.
- `changePassword()`: Panggil datasource, return `Right(null)` jika sukses.

**Penting**: Setelah `updateProfile()` sukses, local cache `AuthEmployee` harus diperbarui agar data tidak stale.

---

## Area 4 — Cashier App

### 4.1 State management — pendekatan yang dipilih

Gunakan **`AuthCubit` langsung** (konsisten dengan `setupPin` dan `resetPin` yang sudah ada di `AuthCubit`). Tambahkan method dan state baru ke `AuthCubit` yang ada.

---

### 4.2 Tambah `updateProfile()` dan `changePassword()` ke `AuthCubit` Cashier [MODIFY]

**File:** `apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart`

Tambahkan method:

```dart
Future<void> updateProfile({
  required String name,
  String? email,
  String? phone,
  String? gender,
  String? address,
}) async {
  emit(ProfileUpdating());
  final result = await _updateProfileUseCase(
    name: name, email: email, phone: phone, gender: gender, address: address,
  );
  result.fold(
    (failure) => emit(ProfileUpdateFailure(failure.message)),
    (employee) => emit(Authenticated(employee)),
  );
}

Future<void> changePassword({
  required String currentPassword,
  required String newPassword,
  required String newPasswordConfirmation,
}) async {
  emit(PasswordChanging());
  final result = await _changePasswordUseCase(
    currentPassword: currentPassword,
    newPassword: newPassword,
    newPasswordConfirmation: newPasswordConfirmation,
  );
  result.fold(
    (failure) => emit(PasswordChangeFailure(failure.message)),
    (_) => emit(PasswordChangeSuccess()),
  );
}
```

Injeksi `UpdateProfileUseCase` dan `ChangePasswordUseCase` melalui constructor.

---

### 4.3 Tambah state baru ke `AuthState` Cashier [MODIFY]

**File:** `apps/cashier/lib/features/auth/presentation/bloc/auth_state.dart`

Tambahkan:

```dart
class ProfileUpdating extends AuthState {}
class ProfileUpdateFailure extends AuthState {
  final String message;
  ProfileUpdateFailure(this.message);
}
class PasswordChanging extends AuthState {}
class PasswordChangeSuccess extends AuthState {}
class PasswordChangeFailure extends AuthState {
  final String message;
  PasswordChangeFailure(this.message);
}
```

Catatan: State sukses update profile tidak perlu class baru karena cubit langsung emit `Authenticated(employee)` dengan data terbaru.

---

### 4.4 Update route Cashier [MODIFY]

**File:** `apps/cashier/lib/core/router/app_router.dart`

Perubahan:
1. Route `/profile` — ganti target dari `ProfileSettingScreen` menjadi `IndexProfileScreen` (di `features/profile/presentation/index_profile_screen.dart`).
2. Tambahkan route baru `/profile/edit` yang mengarah ke `EditProfileScreen` (di `features/profile/presentation/edit_profile_screen.dart`).
3. Pastikan kedua route berada di dalam shell yang sama agar sidebar tetap tampil.

Struktur route:

```
/profile        → IndexProfileScreen
/profile/edit   → EditProfileScreen
```

---

### 4.5 Update selected state sidebar Cashier untuk route profile [MODIFY]

**File:** `apps/cashier/lib/core/navigation/cashier_navigation_config.dart` atau `main_shell_screen.dart`

Item `Profil` di sidebar harus menampilkan selected state saat route aktif adalah `/profile` **atau** `/profile/edit`.

Implementasi: gunakan `GoRouterState.of(context).uri.path.startsWith('/profile')` atau pola yang konsisten dengan cara sidebar mendeteksi selected state untuk route lain.

---

### 4.6 `IndexProfileScreen` Cashier [MODIFY — isi file kosong]

**File:** `apps/cashier/lib/features/profile/presentation/index_profile_screen.dart`

Screen read-only. Gunakan design system `wash_wallet_ui` dan pola yang konsisten dengan screen tablet lain di Cashier.

Struktur screen:

1. **Header halaman**: `Profil Saya`
2. **Profile card** (read-only):
   - Avatar / initial fallback (huruf pertama nama)
   - Nama employee
   - Username
   - Email (jika ada)
   - Nomor telepon (jika ada)
   - Outlet aktif
   - Accessible outlets (jika lebih dari satu)
3. **Status section**:
   - Badge `PIN Aktif` (warna hijau/positif) jika `hasPin == true`
   - Badge `PIN Belum Dibuat` (warna netral/oranye) jika `hasPin == false`
   - Badge status akun aktif
4. **Role/Access section**:
   - Label akses cashier: `Kasir` atau outlet context
5. **Action**:
   - Tombol `Edit Profil` — navigasi ke `/profile/edit`

Data diambil dari `AuthCubit` state `Authenticated` yang sudah ada. Tidak perlu fetch ulang ke backend.

---

### 4.7 `EditProfileScreen` Cashier [MODIFY — isi file kosong]

**File:** `apps/cashier/lib/features/profile/presentation/edit_profile_screen.dart`

**Bagian 1 — Form Data Pribadi:**

Field editable:
- Nama (required)
- Email (optional, validasi format email)
- Nomor telepon (optional)
- Gender (optional, dropdown: Laki-laki / Perempuan)
- Alamat (optional, multiline)

Field read-only yang ditampilkan sebagai konteks:
- Username
- Outlet aktif

Form prefilled dari `AuthEmployee` data yang ada di `AuthCubit`.

Tombol `Simpan`:
- Validasi form terlebih dahulu.
- Panggil `AuthCubit.updateProfile()`.
- Saat `ProfileUpdating`: loading indicator, disable tombol.
- Setelah emit `Authenticated`: navigasi kembali ke index profile atau tampilkan snackbar sukses.
- Saat `ProfileUpdateFailure`: tampilkan error message, form tetap terbuka.

**Bagian 2 — Security Section:**

Sub-section terpisah di bawah form data pribadi.

Actions:
- Tombol `Ubah Password` — buka form password (sebagai route `/profile/password`, dialog, atau bottom sheet)
- Jika `hasPin == false`: tombol `Setting PIN` — navigasi ke `/setup-pin` (reuse existing flow)
- Jika `hasPin == true`: tombol `Atur Ulang PIN` — navigasi ke route reset PIN yang sudah ada

**Password form** (bisa sebagai sub-route `/profile/password` atau dialog):
- Field: Password Saat Ini, Password Baru, Konfirmasi Password Baru
- Semua field required
- Password baru min 8 karakter
- Konfirmasi harus sama dengan password baru
- Tombol `Ubah Password`
- Saat `PasswordChanging`: loading, disable tombol
- Saat `PasswordChangeSuccess`: feedback sukses, tutup form
- Saat `PasswordChangeFailure`: tampilkan error, form tetap terbuka

---

### 4.8 Daftarkan DI Cashier [MODIFY]

Daftarkan `UpdateProfileUseCase` dan `ChangePasswordUseCase` di dependency injection atau service locator Cashier. Pastikan injeksi ke `AuthCubit` tersedia sebelum screen profile dipakai.

---

## Area 5 — Production App

### 5.1 Tambah menu `Profil` ke sidebar Production [MODIFY]

**File:** `apps/production/lib/core/navigation/production_navigation_config.dart`

Tambahkan item `Profil` ke konfigurasi sidebar tablet dengan ketentuan:

1. **Tidak dibungkus filter permission** operasional (`production.view`, `courier.view`, dll.).
2. Tampil untuk semua employee authenticated.
3. Berada di section utama atau section akun — bukan di section Produksi/Kurir yang permission-gated.
4. Icon: `Icons.person` atau `Icons.account_circle`.
5. Label: `Profil`.
6. Selected state aktif saat route `/profile` atau `/profile/edit` sedang terbuka.

---

### 5.2 Update `ProductionTabletShell` untuk selected state profile [MODIFY]

**File:** `apps/production/lib/core/widgets/production_tablet_shell.dart`

Pastikan sidebar mendeteksi route `/profile` dan `/profile/edit` sebagai selected untuk item `Profil`.

---

### 5.3 Tambah route `/profile` dan `/profile/edit` di Production Router [MODIFY]

**File:** `apps/production/lib/core/router/app_router.dart`

Tambahkan:

```
/profile        → IndexProfileScreen (Production)
/profile/edit   → EditProfileScreen (Production)
```

Route harus berada di dalam shell yang sama dengan route operasional lain agar sidebar tetap tampil.

---

### 5.4 Tambah `updateProfile()` dan `changePassword()` ke `AuthCubit` Production [MODIFY]

**File:** `apps/production/lib/features/auth/presentation/bloc/auth_cubit.dart`

Pola implementasi identik dengan Cashier (lihat 4.2). Tambahkan method yang sama. Tambahkan state yang sama ke `auth_state.dart` Production.

Injeksi `UpdateProfileUseCase` dan `ChangePasswordUseCase` melalui constructor.

---

### 5.5 `IndexProfileScreen` Production [NEW]

**Lokasi:** `apps/production/lib/features/profile/presentation/index_profile_screen.dart`

Buat direktori dan file baru jika belum ada.

Konten identik dengan Cashier `IndexProfileScreen` (lihat 4.6), dengan perbedaan pada **Role/Access section**:
- Tampilkan: `Produksi`, `Kurir`, atau keduanya sesuai `allPermissions`.
- Tidak ada label `Kasir`.

---

### 5.6 `EditProfileScreen` Production [NEW]

**Lokasi:** `apps/production/lib/features/profile/presentation/edit_profile_screen.dart`

Konten identik dengan Cashier `EditProfileScreen` (lihat 4.7).

Security section Production — reset PIN:
- Backend `POST /mobile/production/auth/pin/reset` sudah ada.
- Buat screen input PIN lama (misal route `/production/pin-reset-verify`) dan screen input PIN baru + konfirmasi (misal `/production/pin-reset-new`), atau reuse widget yang ada dari Cashier jika sudah shared.
- Daftarkan route baru di Production router.

---

### 5.7 Daftarkan DI Production [MODIFY]

Daftarkan `UpdateProfileUseCase` dan `ChangePasswordUseCase` di DI Production. Pastikan injeksi ke `AuthCubit` Production tersedia.

---

## Area 6 — Test

### 6.1 Backend Tests

| Test | Endpoint |
|------|---------|
| Update profile sukses mengembalikan `LoginEmployeeResource` terbaru | `PATCH /mobile/cashier/auth/profile` |
| Update profile menolak request unauthenticated | `PATCH /mobile/cashier/auth/profile` |
| Update profile tidak mengubah field HR (position, salary, active status, cutoff) | `PATCH /mobile/cashier/auth/profile` |
| Change password sukses dengan `current_password` benar | `POST /mobile/cashier/auth/password` |
| Change password gagal dengan `current_password` salah | `POST /mobile/cashier/auth/password` |
| Change password tidak membocorkan hash di response | `POST /mobile/cashier/auth/password` |
| Semua test di atas berlaku identik untuk production endpoint | `PATCH/POST /mobile/production/auth/...` |

### 6.2 Flutter Cashier Tests

| Test | Jenis |
|------|-------|
| Sidebar item `Profil` ada dan navigasi ke route `/profile` | Navigation/Widget |
| Route `/profile` merender `IndexProfileScreen` | Navigation |
| Route `/profile/edit` merender `EditProfileScreen` | Navigation |
| `IndexProfileScreen` menampilkan nama dari `Authenticated` state | Widget |
| `IndexProfileScreen` menampilkan badge `PIN Aktif` saat `hasPin=true` | Widget |
| `IndexProfileScreen` menampilkan badge `PIN Belum Dibuat` saat `hasPin=false` | Widget |
| `IndexProfileScreen` tombol `Edit Profil` membuka `/profile/edit` | Widget |
| `EditProfileScreen` form prefilled dari `AuthEmployee` data | Widget |
| `EditProfileScreen` submit valid memanggil `updateProfile` | Widget/Unit |
| `EditProfileScreen` submit gagal menampilkan error, tidak mengubah auth state | Widget |
| `EditProfileScreen` action `Setting PIN` muncul saat `hasPin=false` | Widget |
| `EditProfileScreen` action `Atur Ulang PIN` muncul saat `hasPin=true` | Widget |
| Password form validasi konfirmasi tidak cocok | Widget |
| `changePassword` sukses tidak melakukan logout | Unit/Integration |

### 6.3 Flutter Production Tests

| Test | Jenis |
|------|-------|
| Sidebar Production memiliki item `Profil` | Widget |
| Item `Profil` tampil untuk production-only employee | Widget |
| Item `Profil` tampil untuk courier-only employee | Widget |
| Item `Profil` tampil untuk employee dengan production + courier | Widget |
| Klik `Profil` navigasi ke route `/profile` | Navigation |
| `IndexProfileScreen` menampilkan data employee | Widget |
| `IndexProfileScreen` menampilkan role Produksi/Kurir sesuai permission | Widget |
| `EditProfileScreen` dapat dibuka dari `IndexProfileScreen` | Widget |
| `EditProfileScreen` action PIN tersedia sesuai `hasPin` | Widget |
| `EditProfileScreen` action password tersedia | Widget |

---

## Ringkasan File

### File Baru

```
webapp/wash_wallet_be/
  app/Http/Requests/Auth/
    UpdateEmployeeProfileRequest.php       [NEW]
    ChangeEmployeePasswordRequest.php      [NEW]

packages/wash_wallet_domain/
  lib/src/usecases/auth/
    update_profile_usecase.dart            [NEW]
    change_password_usecase.dart           [NEW]

apps/production/
  lib/features/profile/presentation/
    index_profile_screen.dart              [NEW]
    edit_profile_screen.dart               [NEW]
```

### File yang Dimodifikasi

```
webapp/wash_wallet_be/
  app/Http/Controllers/Api/
    EmployeeAuthController.php             [MODIFY — tambah updateProfile(), changePassword()]
  routes/
    api_mobile_cashier.php                 [MODIFY — tambah 2 route baru]
    api_mobile_production.php              [MODIFY — tambah 2 route baru]

packages/wash_wallet_domain/
  lib/src/entities/
    auth_employee.dart                     [MODIFY — tambah gender, address]
  lib/src/repositories/
    auth_repository.dart                   [MODIFY — tambah 2 method baru]
  (barrel file)                            [MODIFY — export use case baru]

packages/wash_wallet_data/
  lib/src/auth/
    models/auth_employee_model.dart        [MODIFY — parse gender, address]
    datasources/auth_remote_datasource.dart[MODIFY — tambah 2 method]
    repositories/auth_repository_impl.dart [MODIFY — implementasi 2 method baru]

apps/cashier/
  lib/core/router/
    app_router.dart                        [MODIFY — ganti target /profile, tambah /profile/edit]
  lib/core/navigation/
    cashier_navigation_config.dart         [MODIFY — selected state profil route]
  lib/features/auth/presentation/
    bloc/auth_cubit.dart                   [MODIFY — tambah updateProfile(), changePassword()]
    bloc/auth_state.dart                   [MODIFY — tambah state baru]
  lib/features/profile/presentation/
    index_profile_screen.dart              [MODIFY — isi file yang masih kosong]
    edit_profile_screen.dart               [MODIFY — isi file yang masih kosong]

apps/production/
  lib/core/navigation/
    production_navigation_config.dart      [MODIFY — tambah item Profil]
  lib/core/widgets/
    production_tablet_shell.dart           [MODIFY — selected state profil route]
  lib/core/router/
    app_router.dart                        [MODIFY — tambah /profile, /profile/edit]
  lib/features/auth/presentation/
    bloc/auth_cubit.dart                   [MODIFY — tambah updateProfile(), changePassword()]
    bloc/auth_state.dart                   [MODIFY — tambah state baru]
```

---

## Constraint Teknis Wajib

1. **Jangan** memakai endpoint `PUT /mobile/{app}/employees/{id}` (manajemen employee) sebagai endpoint update profile pribadi. Gunakan endpoint baru `/auth/profile`.
2. **Jangan** mengirim field HR (`position_ids`, `salary`, `cutoff_days`, `is_active`, `outlet_id`) dari form edit profile.
3. **Jangan** menyimpan password atau PIN dalam plain text.
4. **Jangan** membuat UI menganggap update berhasil sebelum backend sukses (no optimistic update).
5. **Jangan** menyembunyikan menu `Profil` berdasarkan permission operasional.
6. **Jangan** merusak navigation atau flow phone compact yang sudah ada.
7. **Gunakan** design system `wash_wallet_ui` untuk semua widget UI profile.
8. **Pastikan** sidebar user account (nama di sidebar) ikut re-render setelah nama berubah — cukup dengan rebuild dari `AuthCubit` yang sudah emit `Authenticated` terbaru.
9. **Pastikan** `AuthEmployee` di local cache diperbarui setelah `updateProfile()` sukses.
10. **Verifikasi** apakah `EmployeeAuthController` di cashier dan production adalah controller yang sama atau berbeda sebelum mendaftarkan route.

---

## Catatan Implementasi Tambahan

1. Cashier sudah punya file kosong `index_profile_screen.dart` dan `edit_profile_screen.dart` di `features/profile/presentation/` — gunakan file ini, jangan buat di lokasi baru.
2. `ProfileSettingScreen` di Cashier Settings boleh tetap ada (tidak dihapus) untuk menghindari breaking change, tetapi route `/profile` harus diarahkan ke `IndexProfileScreen` yang baru.
3. Production perlu membuat direktori `features/profile/presentation/` dari awal jika belum ada.
4. Untuk PIN reset Production: backend endpoint sudah tersedia. Buat screen baru dengan pola yang sama dengan `ResetPinVerifyScreen` dan `ResetPinNewScreen` di Cashier.
5. Implementation plan boleh memilih antara route terpisah, dialog, atau bottom sheet untuk password form — yang penting user dapat mencapainya dari `EditProfileScreen`.
6. Jika `AuthEmployee` membutuhkan field tambahan selain `gender` dan `address`, tambahkan secara konsisten di entity, model, dan semua tempat yang menggunakannya.

---

## Status

Draft plan selesai disusun. Siap dikerjakan oleh AI model lain mulai dari **Area 1 (Backend)** berurutan sesuai dependency.
