# Plan Revisi: Cashier Multi Employee PIN Switch dan Resilient Transaction

Tanggal Revisi: 2026-06-20

Dokumen asli: `docs/plan/cashier_multi_employee_pin_switch_resilient_transaction_plan.md`

Feedback yang direspons: `docs/feedback/cashier_multi_employee_pin_switch_resilient_transaction_feedback.md`

---

## Instruksi untuk Model Implementer

**BACA BAGIAN INI TERLEBIH DAHULU.**

Ini adalah **delta plan**, bukan full implementation plan dari nol. Banyak bagian dari fitur ini sudah ada di repo. Model implementer harus:

1. Membaca state repo aktual sebelum menulis kode apapun.
2. Tidak membuat ulang file yang sudah ada.
3. Tidak menimpa implementasi yang sudah benar.
4. Fokus hanya pada gap, bug, hardening, dan test yang hilang.
5. Mengikuti pola arsitektur yang sudah ada (service/repository/bloc/cubit/route guard).

Jika ada ketidaksesuaian antara plan ini dan kode aktual, prioritaskan kode aktual dan anggap plan ini sebagai panduan arah, bukan instruksi kata per kata.

---

## Tujuan Revisi

Plan asli sudah menangkap arah produk yang benar. Revisi ini berfokus pada:

- Mensinkronkan path file dengan kondisi repo saat ini.
- Menutup bug dan gap keamanan yang ditemukan pada review.
- Memperjelas keputusan teknis yang masih ambigu.
- Menambah test coverage untuk risiko utama.

---

## State Repo Saat Ini

### Sudah Ada dan Cukup — Tidak Perlu Disentuh

| Item | Path Aktual |
|------|-------------|
| Migration `pin_hash` / `pin_set_at` | `webapp/wash_wallet_be/database/migrations/*` |
| `Employee` model (`hidden`, `casts`, `fillable`) | `webapp/wash_wallet_be/app/Models/Employee.php` |
| `AuthService::setupPin` | `webapp/wash_wallet_be/app/Services/AuthService.php` |
| `AuthService::verifyPin` | `webapp/wash_wallet_be/app/Services/AuthService.php` |
| `SetupPinRequest` / `VerifyPinRequest` | `webapp/wash_wallet_be/app/Http/Requests/` |
| Route `POST /mobile/cashier/auth/pin/setup` | `webapp/wash_wallet_be/routes/api_mobile_cashier.php:32` |
| Route `POST /mobile/cashier/auth/pin/verify` (+ throttle) | `webapp/wash_wallet_be/routes/api_mobile_cashier.php:33` |
| `LoginEmployeeResource` dengan `hasPin`, `accessibleOutlets`, `allPermissions` | `webapp/wash_wallet_be/app/Http/Resources/Employee/LoginEmployeeResource.php` |
| Middleware `IdempotencyMiddleware` | `webapp/wash_wallet_be/app/Http/Middleware/IdempotencyMiddleware.php` |
| Table `mobile_action_idempotencies` | `webapp/wash_wallet_be/database/migrations/*` |
| Route order sudah pakai `idempotent` middleware (store, update, start, complete, accept, reject, weigh, mark-cod-paid, send-wa-notification) | `webapp/wash_wallet_be/routes/api_mobile_cashier.php:142-164` |
| `TokenStorage` / `AuthInterceptor` | `packages/wash_wallet_core/lib/src/auth/token_storage.dart` `packages/wash_wallet_core/lib/src/network/interceptors/auth_interceptor.dart` |
| `AuthEmployeeModel` dengan `hasPin`, `accessibleOutlets`, `allPermissions` | `packages/wash_wallet_domain/` |
| Auth usecases: `LoginUsecase`, `LogoutUsecase`, `GetMeUsecase`, `CheckAuthStatusUsecase`, `SetupPinUseCase`, `VerifyPinUseCase` | `packages/wash_wallet_domain/lib/src/usecases/` |
| `RememberedEmployeeLocalDatasource` | `packages/wash_wallet_data/lib/src/auth/datasources/remembered_employee_local_datasource.dart` |
| `AuthRepositoryImpl` dengan login, setupPin, verifyPin, checkAuthStatus | `packages/wash_wallet_data/lib/src/auth/repositories/auth_repository_impl.dart` |
| Auth states: `AuthLoading`, `Unauthenticated`, `Authenticated`, `AuthFailureState`, `AuthSetupPinRequired`, `AuthAccessDenied` | `apps/cashier/lib/features/auth/presentation/bloc/auth_state.dart` |
| `AuthCubit` dengan login, setupPin, verifyPin, logout, refreshMe | `apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart` |
| Screens: `LoginScreen`, `SetupPinScreen`, `SwitchEmployeeScreen`, `PinEntryScreen`, `AccessDeniedScreen` | `apps/cashier/lib/features/auth/presentation/screens/` |
| `OrderDraftModel` dengan `status`, `clientRequestId`, `lastError` | `packages/wash_wallet_domain/lib/src/models/order_draft_model.dart` |
| `OrderLocalDatasource` dengan saveDraft, getDraft, clearDraft, saveWeighingDraft, getWeighingDraft, clearWeighingDraft | `apps/cashier/lib/features/order/data/datasources/order_local_datasource.dart` |
| `WeighingDraftModel` | `packages/wash_wallet_domain/lib/src/models/weighing_draft_model.dart` |
| Test PIN dasar | `webapp/wash_wallet_be/tests/Feature/EmployeePinAuthTest.php` |
| Notification service (Pusher, FCM, sound, badge, dedupe) | `apps/cashier/lib/core/services/notification_service.dart` |

### Sudah Ada Tetapi Perlu Diperbaiki

Ini adalah inti dari delta plan — item yang ada tetapi memiliki bug atau gap.

| Item | File | Gap |
|------|------|-----|
| `AuthRepositoryImpl.setupPin` | `packages/wash_wallet_data/lib/src/auth/repositories/auth_repository_impl.dart:95-118` | Tidak memanggil `_rememberedDatasource.saveAccount()` setelah setup PIN sukses |
| `AuthRepositoryImpl.checkAuthStatus` | `...auth_repository_impl.dart:67-93` | Menghapus semua local data untuk semua failure, termasuk network failure — harus dibedakan 401/403 dari network error |
| `AuthCubit.verifyPin` | `apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart:105-122` | Emit `AuthLoading` lalu `AuthFailureState` saat PIN salah — menghilangkan session employee aktif dari state |
| `WeighingDraftModel` | `packages/wash_wallet_domain/lib/src/models/weighing_draft_model.dart` | Missing: `outletId`, notes per order, notes per item, photo local path, `clientRequestId`, `status`, `lastError` |
| Weighing draft key | `apps/cashier/lib/features/order/data/datasources/order_local_datasource.dart:42-43` | Key tidak mengandung `outletId` |
| `IdempotencyMiddleware` | `webapp/wash_wallet_be/app/Http/Middleware/IdempotencyMiddleware.php` | Beberapa gap kritis — lihat detail di bagian Fase 2 |
| Route `outlets` dan `employees` | `webapp/wash_wallet_be/routes/api_mobile_cashier.php:49-51, 116-119` | Tidak terbungkus `auth:sanctum` |
| Print route | Belum ditemukan di `api_mobile_cashier.php` — perlu audit | Belum ada guard `position.permission` untuk print |
| `OrderCubit.store()` | `apps/cashier/lib/features/order/presentation/bloc/` | Tidak mengubah draft ke `submit_failed` saat network/server failure |
| Draft recovery UX | Flow create/review order | Saat draft ditemukan, langsung dimuat ke cart tanpa prompt lanjutkan/hapus/mulai baru |
| Client `clientRequestId` untuk aksi mutasi | Order remote datasource, print datasource | Banyak aksi (accept, reject, start, complete, deposit, petty cash, expense) belum kirim `Client-Request-Id` header secara konsisten |
| Print retry idempotency key | Print modal/datasource | `_clientRequestId` hanya hidup di modal — jika backend sudah debit coin tetapi app tutup, retry akan membuat key baru |
| `AuthService::setupPin` backend | `webapp/wash_wallet_be/app/Services/AuthService.php` | Selalu overwrite `pin_hash` tanpa cek apakah PIN sudah ada — bisa jadi reset PIN bebas |

### Belum Ada — Perlu Dibuat

| Item | Keterangan |
|------|------------|
| State PIN switch yang aman | `SwitchPinVerifying` / `SwitchPinFailure` — atau cubit terpisah |
| Kebijakan token lifecycle switch yang eksplisit | Belum ada keputusan: single-device atau multi-device per employee |
| Active outlet context yang eksplisit | `hasOrderViewPermission` sekarang flat — perlu dicek per outlet aktif |
| Helper `requireOnline` | Belum ada abstraction online guard — hanya bergantung DioException mapping |
| Test-test yang disebutkan di bagian Coverage |

---

## Keputusan Teknis yang Harus Ditetapkan

### A. Kebijakan Token Lifecycle saat Switch

> **Ini harus diputuskan sebelum implementasi dimulai.**

Pilih salah satu:

**Opsi 1 — Single-device per employee (Direkomendasikan)**

- `verifyPin` di backend menghapus semua token lama employee target, lalu menerbitkan token baru.
- Ini berarti login/switch di device baru akan logout device lama untuk employee yang sama.
- Tambahkan pesan di UI: "Login berhasil. Sesi sebelumnya di device lain telah dihentikan."
- Saat switch sukses di satu device: token employee lama (yang sedang aktif sebelum switch) tidak perlu dicabut di server karena employee berbeda punya token masing-masing. Employee A masih bisa switch balik dengan PIN tanpa harus login password lagi.

**Opsi 2 — Multi-device per employee**

- `verifyPin` hanya menerbitkan token baru, tidak menghapus token lama.
- Token lama tetap valid di device lain.
- Lebih kompleks — perlu token identifier per device.

**Keputusan sementara untuk plan ini: Opsi 1 (single-device per employee).** Jika product owner memutuskan berbeda, ubah `AuthService::verifyPin` dan tambahkan test yang sesuai.

### B. Active Outlet Context

> **Ini harus diputuskan sebelum implementasi dimulai.**

Pilih salah satu:

**Opsi 1 — Single outlet (primary outlet) (Direkomendasikan untuk fase ini)**

- Cashier hanya beroperasi di satu outlet: `employee.outletId`.
- `hasOrderViewPermission` hanya berlaku jika employee punya `order.view` untuk `employee.outletId`.
- Backend route sudah enforce `position.permission` per outlet.
- Pusher, FCM, badge, list order, semua mengikuti `employee.outletId`.

**Opsi 2 — Multi-outlet**

- Perlu outlet selector di UI.
- Perlu header `X-Outlet-ID` di semua request yang butuh outlet context.
- Lebih kompleks — defer ke fase berikutnya.

**Keputusan sementara untuk plan ini: Opsi 1.** Perbarui `hasOrderViewPermission` agar dicek per `outletId`, bukan flat.

### C. Setup PIN vs Reset PIN

- `setupPin` backend **hanya boleh berhasil jika `pin_hash` null**.
- Jika employee sudah punya PIN dan memanggil setupPin, return 422 dengan pesan jelas.
- Reset PIN (ganti PIN yang sudah ada) memerlukan endpoint terpisah — **defer ke fase berikutnya**, tidak perlu diimplementasi sekarang.

### D. Standar `Client-Request-Id`

- Gunakan **header** `Client-Request-Id` sebagai standar, bukan body field, untuk konsistensi.
- Generate UUID v4, bukan timestamp.
- `IdempotencyMiddleware` sudah membaca keduanya (`header` dan `input`) — pertahankan agar backward compatible.

---

## Fase Implementasi

### Fase 1 — Hardening Auth/PIN/Switch (Backend)

**Prioritas: Kritis**

#### 1.1 Perbaiki `AuthService::setupPin` — Tolak setup PIN kedua kali

File: `webapp/wash_wallet_be/app/Services/AuthService.php`

- Tambahkan pengecekan: jika `employee->pin_hash` sudah tidak null, lempar exception dengan pesan "PIN sudah diatur. Gunakan endpoint reset PIN."
- Return HTTP 422 dari controller.

**Test yang harus ditambah** di `webapp/wash_wallet_be/tests/Feature/EmployeePinAuthTest.php`:

```php
test('setup PIN kedua kali ditolak', function () { ... }); // 422
test('setup PIN tidak membocorkan pin_hash di response', function () { ... });
test('verify PIN employee tidak aktif ditolak', function () { ... }); // 422/403
```

#### 1.2 Perbaiki Token Lifecycle sesuai kebijakan Opsi 1

File: `webapp/wash_wallet_be/app/Services/AuthService.php`

- Verifikasi bahwa `verifyPin` menghapus semua token employee target dan menerbitkan token baru.
- Verifikasi bahwa login password juga menghapus token lama employee yang sama.
- Tambahkan test: verify PIN employee A dari device 2 tidak mencabut token employee B yang sedang aktif di device yang sama.

**Test yang harus ditambah**:

```php
test('verify PIN tidak mencabut token employee lain', function () { ... });
test('verify PIN salah tidak mengganggu token employee aktif', function () { ... });
test('token lifecycle switch sesuai kebijakan single-device', function () { ... });
```

#### 1.3 Audit dan Hardening Route Permission

File: `webapp/wash_wallet_be/routes/api_mobile_cashier.php`

Gap yang ditemukan:

- `GET /mobile/cashier/outlets` — tidak ada `auth:sanctum`.
- `GET /mobile/cashier/employees`, `PUT /mobile/cashier/employees/{id}` — tidak ada `auth:sanctum`.
- Route print — perlu diaudit apakah sudah ada `position.permission`.

Tindakan:

1. Tambahkan `auth:sanctum` middleware pada route `outlets` (index dan show).
2. Tambahkan `auth:sanctum` middleware pada route `employees` (index, show, update).
3. Pastikan route print sudah memiliki `auth:sanctum` dan `position.permission:order.view` untuk info, dan `position.permission:order.manage` untuk process.
4. Cek apakah ada route `api_mobile_cashier.php` yang mengakses print — jika ada di file route lain (misal `api.php`), tambahkan guard yang sama.

**Test yang harus ditambah**:

```php
test('unauthenticated tidak bisa akses outlet list', function () { ... }); // 401
test('unauthenticated tidak bisa akses employee list', function () { ... }); // 401
test('employee outlet lain tidak bisa print order', function () { ... }); // 403
```

#### 1.4 Hardening `IdempotencyMiddleware`

File: `webapp/wash_wallet_be/app/Http/Middleware/IdempotencyMiddleware.php`

Gap yang ditemukan di kode aktual:

1. **Conflict payload berbeda tidak ditolak 409 secara konsisten** — baris 53-56 ada komentar tapi logika tidak berjalan karena sudah return di atas.
2. **Business write dan update idempotency row tidak dalam satu transaction** — jika business sukses tetapi proses crash sebelum update status idempotency, retry bisa double-execute.
3. **Race condition** pada `create` idempotency row — jika dua request concurrent tiba bersamaan, keduanya bisa lolos.
4. **Hash multipart** — `json_encode($request->except('client_request_id'))` tidak stabil untuk file upload.

Tindakan:

1. Setelah cek `status === 'processing'` untuk stuck, tambahkan pengecekan payload hash: jika key sudah ada dengan status apapun dan `request_hash !== $requestHash`, return 409.
2. Wrap DB transaction: `DB::transaction(fn() => ...)` mencakup update/create idempotency row dan business action. Ini perlu koordinasi dengan controller — lihat catatan di bawah.
3. Gunakan `insertOrIgnore` atau `firstOrCreate` dengan unique constraint untuk mencegah race condition di `create`. Tangani `QueryException` dengan unique violation → return 409 atau retry ambil record.
4. Untuk request multipart, gunakan hash dari metadata saja (field teks, bukan binary file) — definisikan canonical hash function.

**Catatan:** Wrapping DB transaction di middleware sulit dilakukan untuk semua action. Pendekatan alternatif yang lebih pragmatis:

- Simpan response secara atomik setelah business commit, bukan setelah `$next($request)`.
- Jika proses gagal setelah business commit tetapi sebelum simpan response, status idempotency tetap `processing` → retry akan terdeteksi stuck dan diizinkan retry (safe untuk idempotent action).
- Untuk coin-deducting actions (print, WA), controller harus mengecek idempotency row sebelum debit coin, bukan hanya middleware.

**Test yang harus ditambah**:

```php
test('idempotency same key same payload return cached response', function () { ... }); // 200 dengan response lama
test('idempotency same key payload berbeda return 409', function () { ... });
test('concurrent idempotent request tidak double write', function () { ... });
test('coin tidak berkurang dua kali untuk retry print', function () { ... });
```

#### 1.5 Perbaiki `hasOrderViewPermission` per Active Outlet

File: `packages/wash_wallet_domain/lib/src/entities/auth_employee.dart` atau `auth_employee_model.dart`

- Ubah `hasOrderViewPermission` agar dicek dari `accessibleOutlets` untuk `outletId` primary, bukan flat `allPermissions`.
- Jika employee punya `order.view` hanya di outlet lain, `hasOrderViewPermission` harus `false` untuk outlet primary.
- Ini hanya perubahan di Flutter — backend sudah enforce per outlet.

---

### Fase 2 — Hardening Auth/Switch (Flutter)

**Prioritas: Kritis**

#### 2.1 Tambah State PIN Switch yang Aman

File: `apps/cashier/lib/features/auth/presentation/bloc/auth_state.dart`

Tambahkan state baru:

```dart
class SwitchPinVerifying extends AuthState {
  final AuthEmployee previousEmployee;
  final int? targetEmployeeId;
  final String? targetUsername;

  const SwitchPinVerifying({
    required this.previousEmployee,
    this.targetEmployeeId,
    this.targetUsername,
  });

  @override
  List<Object?> get props => [previousEmployee, targetEmployeeId, targetUsername];
}

class SwitchPinFailure extends AuthState {
  final AuthEmployee previousEmployee;
  final Failure failure;

  const SwitchPinFailure({
    required this.previousEmployee,
    required this.failure,
  });

  @override
  List<Object?> get props => [previousEmployee, failure];
}
```

#### 2.2 Perbaiki `AuthCubit.verifyPin` untuk PIN Switch

File: `apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart`

Saat ini `verifyPin` emit `AuthLoading` yang menghilangkan state employee aktif.

Tambahkan method baru untuk switch (bukan login pertama):

```dart
Future<void> switchEmployee({
  int? targetEmployeeId,
  String? targetUsername,
  required String pin,
}) async {
  // Simpan employee aktif saat ini
  final currentEmployee = (state is Authenticated)
      ? (state as Authenticated).employee
      : null;

  if (currentEmployee == null) {
    // Tidak ada session aktif, fallback ke verifyPin biasa
    await verifyPin(employeeId: targetEmployeeId, username: targetUsername, pin: pin);
    return;
  }

  emit(SwitchPinVerifying(
    previousEmployee: currentEmployee,
    targetEmployeeId: targetEmployeeId,
    targetUsername: targetUsername,
  ));

  final result = await _verifyPinUseCase(
    VerifyPinParams(employeeId: targetEmployeeId, username: targetUsername, pin: pin),
  );

  result.when(
    success: (employee) {
      _handleAuthSuccess(employee);
    },
    failure: (failure) => emit(SwitchPinFailure(
      previousEmployee: currentEmployee,
      failure: failure,
    )),
  );
}
```

- `SwitchEmployeeScreen` harus memanggil `switchEmployee()`, bukan `verifyPin()`.
- Router harus menangani `SwitchPinFailure` dengan tetap menampilkan UI di atas session lama (tidak redirect ke login).
- `PinEntryScreen` harus listen `SwitchPinFailure` dan kembali menampilkan PIN input dengan pesan error, tanpa mengubah route ke unauthenticated.

#### 2.3 Perbaiki `AuthRepositoryImpl.setupPin` — Update Remembered Account

File: `packages/wash_wallet_data/lib/src/auth/repositories/auth_repository_impl.dart`

Di method `setupPin`, setelah `_localDatasource.saveEmployee(employeeModel)`, tambahkan:

```dart
await _rememberedDatasource.saveAccount(employeeModel);
```

Ini memastikan setelah setup PIN, akun yang tersimpan di switch list menunjukkan `hasPin: true`.

#### 2.4 Perbaiki `AuthRepositoryImpl.checkAuthStatus` — Bedakan Network Failure

File: `packages/wash_wallet_data/lib/src/auth/repositories/auth_repository_impl.dart`

Method `checkAuthStatus` saat ini menghapus semua local data untuk semua jenis failure.

Ubah behavior:

- **401 / 403**: clear token dan employee lokal → redirect login.
- **Network failure / timeout**: pertahankan token lokal, return state `AuthenticatedStale` atau gunakan local employee data yang tersimpan.
- **Error lain**: pertahankan token lokal, return failure untuk handling di cubit.

Tambahkan state baru di `auth_state.dart` jika diperlukan:

```dart
class AuthenticatedStale extends AuthState {
  final AuthEmployee employee; // dari local storage
  const AuthenticatedStale(this.employee);
  @override
  List<Object?> get props => [employee];
}
```

Di `auth_cubit.checkAuthStatus`, tangani `AuthenticatedStale` di router: izinkan masuk dashboard dengan batasan — final actions tetap perlu online, draft recovery tetap berjalan.

**Test yang harus ditambah** (Flutter):

```dart
// Setelah setup PIN, remembered account berubah hasPin=true
// PIN salah saat switch mempertahankan previous authenticated employee
// Auth restore network failure tidak menghapus token lokal
```

---

### Fase 3 — Draft Order Recovery

**Prioritas: Kritis**

#### 3.1 Perbaiki `OrderCubit.store()` — Set `submit_failed` saat Gagal

File: `apps/cashier/lib/features/order/presentation/bloc/`

Saat ini `OrderCubit.store()` tidak mengubah draft ke `submit_failed` ketika network/server failure.

Ubah behavior:

- Saat submit gagal karena `NetworkFailure` atau `ServerFailure`: update draft dengan `status: 'submit_failed'`, simpan `lastError`, **pertahankan `clientRequestId` yang sama**.
- Jangan hapus draft.
- Emit state yang menampilkan pesan error dan tombol retry.

#### 3.2 Tambah UX Prompt Draft Recovery

Saat draft ditemukan saat membuka order screen:

- Tampilkan dialog/bottom sheet: **"Draft ditemukan untuk [nama customer]. Lanjutkan, hapus, atau mulai baru?"**
- Jika draft `status === 'submit_failed'`: tampilkan info error terakhir dan opsi retry.
- Jangan langsung muat draft ke cart tanpa konfirmasi user.
- Jika user pilih "lanjutkan": muat draft ke cart, pertahankan `clientRequestId`.
- Jika user pilih "hapus": hapus draft, mulai kosong.
- Jika user pilih "mulai baru": hapus draft, generate `clientRequestId` baru.

**Test yang harus ditambah**:

```dart
// Draft dipertahankan dengan status submit_failed dan lastError saat submit gagal
// Draft prompt menampilkan pilihan lanjutkan/hapus/mulai baru
// Clear draft terjadi setelah submit sukses
// clientRequestId sama dipertahankan saat retry dari submit_failed
```

---

### Fase 4 — Draft Weighing (Schema Lengkap)

**Prioritas: Kritis**

#### 4.1 Perluas Schema `WeighingDraftModel`

File: `packages/wash_wallet_domain/lib/src/models/weighing_draft_model.dart`

Field yang perlu ditambahkan:

```dart
class WeighingDraft {
  final int outletId;          // ← BARU
  final int orderId;
  final int employeeId;
  // ... existing fields ...
  final String? orderNotes;    // ← BARU
  final String? internalNotes; // ← BARU
  final String? photoLocalPath;   // ← BARU
  final String? photoUploadStatus; // ← BARU: 'pending', 'uploaded', 'failed'
  final String clientRequestId;   // ← BARU (required, bukan nullable)
  final String status;            // ← BARU: 'editing', 'submit_failed'
  final String? lastError;        // ← BARU
  // ... existing updatedAt ...
}
```

Juga perluas `WeighingDraftItemModel`:

```dart
class WeighingDraftItem {
  // ... existing fields ...
  final String? itemNotes;  // ← BARU (notes per item)
}
```

#### 4.2 Update Key Weighing Draft

File: `apps/cashier/lib/features/order/data/datasources/order_local_datasource.dart`

Ubah `_generateWeighingKey` agar mengandung `outletId`:

```dart
// Sebelum:
String _generateWeighingKey(int orderId, int employeeId) {
  return 'cashier_weighing_draft_v1_${orderId}_$employeeId';
}

// Sesudah:
String _generateWeighingKey(int orderId, int employeeId, int outletId) {
  return 'cashier_weighing_draft_v1_${outletId}_${employeeId}_$orderId';
}
```

Update semua pemanggil `_generateWeighingKey` dan method `saveWeighingDraft`, `getWeighingDraft`, `clearWeighingDraft`.

#### 4.3 Hubungkan Autosave Weighing Draft ke Notes dan Photo

Di screen weighing (cari file di `apps/cashier/lib/features/order/presentation/screens/`):

- Autosave setiap kali user mengubah quantity item, notes per item, order notes, internal notes.
- Simpan `clientRequestId` ke draft weighing saat pertama kali dibuat.
- Reuse `clientRequestId` yang sama saat retry submit.
- Hapus draft hanya setelah backend confirm weighing berhasil.

**Test yang harus ditambah**:

```dart
// Weighing draft menyimpan notes, item qty, photo reference, dan clientRequestId
// Weighing draft key mengandung outletId
```

---

### Fase 5 — Client Idempotency Lengkap

**Prioritas: Kritis**

#### 5.1 Helper UUID Generator

Buat utility function di cashier app atau shared package:

```dart
// packages/wash_wallet_core/lib/src/utils/idempotency_key.dart
import 'package:uuid/uuid.dart';

class IdempotencyKey {
  static String generate() => const Uuid().v4();
}
```

Pastikan package `uuid` sudah ada di `pubspec.yaml`.

#### 5.2 Tambah `Client-Request-Id` Header ke Semua Aksi Mutasi

File: `apps/cashier/lib/features/order/data/datasources/order_remote_datasource.dart`

Cek setiap method berikut dan pastikan mengirim header `Client-Request-Id`:

- `acceptOrder` — tambahkan parameter `String clientRequestId` jika belum ada.
- `rejectOrder` — sama.
- `startOrder` — sama.
- `completeOrder` — sama.
- `markCodPaid` — sama.
- `sendWaNotification` — sama.

Untuk deposit, petty cash, expense — cek datasource masing-masing.

**Pola yang harus diikuti:**

```dart
Future<void> acceptOrder({
  required int orderId,
  required String clientRequestId,  // ← tambahkan
}) async {
  await _dio.post(
    '/mobile/cashier/orders/$orderId/accept',
    options: Options(
      headers: {'Client-Request-Id': clientRequestId},
    ),
  );
}
```

#### 5.3 Persistence Print Idempotency Key

File: Print modal/datasource di `apps/cashier/lib/features/print/`

Gap: `_clientRequestId` hanya hidup di modal widget — jika app tutup setelah backend debit coin, retry membuat key baru.

Solusi:

1. Sebelum memanggil backend print, simpan `clientRequestId` ke SharedPreferences dengan key `cashier_print_pending_{orderId}_{printType}`.
2. Saat modal print dibuka ulang untuk order yang sama, cek apakah ada pending print key — jika ada, reuse key tersebut.
3. Hapus pending print key setelah local print berhasil atau user membatalkan retry.

---

### Fase 6 — Online Guard

**Prioritas: Medium**

#### 6.1 Buat Helper `requireOnline`

Buat abstraction di cashier app:

```dart
// apps/cashier/lib/core/helpers/online_guard.dart

import 'package:connectivity_plus/connectivity_plus.dart';

class OnlineGuard {
  static Future<bool> isOnline() async {
    final result = await Connectivity().checkConnectivity();
    return result != ConnectivityResult.none;
  }

  static Future<T> requireOnline<T>({
    required String actionName,
    required Future<T> Function() action,
    required void Function(String message) onOffline,
  }) async {
    if (!await isOnline()) {
      onOffline('Diperlukan koneksi internet untuk $actionName. '
          'Draft Anda telah disimpan.');
      throw OfflineException(actionName: actionName);
    }
    return await action();
  }
}
```

#### 6.2 Terapkan `requireOnline` pada Aksi Final

Aksi yang wajib online-required:

- Submit order.
- Update order.
- Accept, reject, start, complete order.
- Submit weighing.
- Mark payment.
- Print (yang mengurangi coin).
- WhatsApp (yang mengurangi coin).
- Deposit, petty cash, expense.

Behavior saat offline:

- Tampilkan snackbar/dialog singkat dengan pesan spesifik per action.
- Jangan hapus draft.
- Jangan silent queue.

---

### Fase 7 — Notification: Tambah Vibration/Haptic

**Prioritas: Medium**

File: `apps/cashier/lib/core/services/notification_service.dart`

Di method yang mempublish/menampilkan notifikasi order baru (cari `_publishNewOrder` atau equivalent):

```dart
import 'package:flutter/services.dart';

// Di dalam method notifikasi order baru, setelah dedupe check:
try {
  await HapticFeedback.mediumImpact();
} catch (_) {
  // Platform tidak mendukung, tidak crash
}
```

Pastikan:

- Haptic hanya dipanggil setelah dedupe check — tidak double untuk order yang sama.
- Guard dengan try-catch agar tidak crash di platform yang tidak mendukung haptic.
- Sound tetap berjalan seperti sebelumnya.

---

## Path File yang Benar untuk Dibaca Model Implementer

Sebelum mulai, baca file-file ini untuk memahami konteks:

### Backend Laravel

```
webapp/wash_wallet_be/app/Services/AuthService.php
webapp/wash_wallet_be/app/Http/Resources/Employee/LoginEmployeeResource.php
webapp/wash_wallet_be/app/Http/Middleware/IdempotencyMiddleware.php
webapp/wash_wallet_be/app/Models/Employee.php
webapp/wash_wallet_be/routes/api_mobile_cashier.php
webapp/wash_wallet_be/tests/Feature/EmployeePinAuthTest.php
```

Cari juga:
- Controller print (grep: `PrintController` di `app/Http/Controllers/`)
- Service print: `webapp/wash_wallet_be/app/Services/PrintService.php`
- Model: `webapp/wash_wallet_be/app/Models/MobileActionIdempotency.php`

### Flutter Shared Packages

```
packages/wash_wallet_core/lib/src/auth/token_storage.dart
packages/wash_wallet_core/lib/src/network/interceptors/auth_interceptor.dart
packages/wash_wallet_domain/lib/src/entities/ (auth_employee.dart, weighing_draft.dart, order_draft.dart)
packages/wash_wallet_domain/lib/src/models/auth_employee_model.dart
packages/wash_wallet_domain/lib/src/models/weighing_draft_model.dart
packages/wash_wallet_domain/lib/src/models/order_draft_model.dart
packages/wash_wallet_data/lib/src/auth/datasources/auth_local_datasource.dart
packages/wash_wallet_data/lib/src/auth/datasources/auth_remote_datasource.dart
packages/wash_wallet_data/lib/src/auth/datasources/remembered_employee_local_datasource.dart
packages/wash_wallet_data/lib/src/auth/repositories/auth_repository_impl.dart
```

### Flutter Cashier App

```
apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart
apps/cashier/lib/features/auth/presentation/bloc/auth_state.dart
apps/cashier/lib/features/auth/presentation/screens/switch_employee_screen.dart
apps/cashier/lib/features/auth/presentation/screens/pin_entry_screen.dart
apps/cashier/lib/features/order/data/datasources/order_local_datasource.dart
apps/cashier/lib/features/order/data/datasources/order_remote_datasource.dart
apps/cashier/lib/features/order/presentation/bloc/ (order_cubit.dart dan sejenisnya)
apps/cashier/lib/features/print/data/datasources/print_remote_datasource.dart
apps/cashier/lib/core/services/notification_service.dart
apps/cashier/lib/core/router/app_router.dart
```

---

## Urutan Pengerjaan yang Direkomendasikan

1. **Backend dulu** — Fase 1 (hardening auth/PIN, route security, idempotency) agar contract API stabil.
2. **Flutter shared packages** — Fase 2 bagian model/repository setelah contract backend stabil.
3. **Flutter auth/switch** — Fase 2 bagian cubit/state/screen.
4. **Flutter draft** — Fase 3 dan 4 (order dan weighing draft).
5. **Flutter idempotency client** — Fase 5.
6. **Online guard dan notification** — Fase 6 dan 7.
7. **Test dan validasi** — Sepanjang pengerjaan, bukan di akhir saja.

---

## Test Coverage yang Harus Ditambahkan

### Backend (PHP Pest)

Tambahkan ke `webapp/wash_wallet_be/tests/Feature/EmployeePinAuthTest.php` atau file test baru:

1. `setupPin` tidak membocorkan `pin_hash` di response.
2. `setupPin` kedua kali ditolak 422.
3. Verify PIN employee tidak aktif mengembalikan error akun tidak aktif.
4. Verify PIN salah tidak mencabut token employee aktif lain.
5. Token lifecycle switch sesuai kebijakan single-device.
6. Route `/mobile/cashier/outlets` ditolak 401 untuk unauthenticated.
7. Route `/mobile/cashier/employees` ditolak 401 untuk unauthenticated.
8. Print info/process employee wrong-outlet ditolak 403.
9. Idempotency same key same payload return response lama (200).
10. Idempotency same key payload berbeda return 409.
11. Concurrent idempotent request tidak double write/debit coin.

### Flutter (Dart Unit/Bloc Test)

1. Setelah `setupPin`, `remembered account` memiliki `hasPin: true`.
2. `switchEmployee` dengan PIN salah mempertahankan `Authenticated(Employee A)` sebagai state aktif.
3. Auth restore: `checkAuthStatus` dengan network failure tidak menghapus token lokal.
4. Submit order gagal: draft dipertahankan dengan `status: submit_failed` dan `lastError` terisi.
5. Prompt draft ditemukan menampilkan pilihan lanjutkan/hapus/mulai baru.
6. `clientRequestId` yang sama dipertahankan saat retry dari `submit_failed`.
7. Clear draft terjadi hanya setelah submit sukses.
8. Weighing draft menyimpan `outletId`, notes, item qty, photo reference, dan `clientRequestId`.
9. Aksi mutasi (accept, reject, start, complete) mengirim header `Client-Request-Id`.
10. Print local failure lalu retry memakai idempotency key yang sama (dari persistent storage).
11. Notification sound dan vibration hanya sekali untuk order ID yang sama dalam dedupe window.

---

## Acceptance Checklist (Ditambah dari Plan Asli)

### Dari Plan Asli (Verifikasi Tetap Berlaku)

- [ ] Password login employee tetap berjalan.
- [ ] Login employee tanpa PIN mengarah ke setup PIN.
- [ ] Setup PIN tersimpan hash di backend dan tidak bocor di response.
- [ ] Quick switch employee via PIN berhasil untuk remembered account.
- [ ] App tidak menyimpan inactive token.
- [ ] Active employee dan outlet terlihat jelas.
- [ ] Employee tanpa permission `order.view` di outlet primary tidak dapat masuk cashier dashboard.
- [ ] Draft order v2 menyimpan outlet, employee, customer, items, notes, estimate, payment fields, status, clientRequestId, updatedAt.
- [ ] Draft weighing tersedia dan tidak hilang sebelum submit sukses.
- [ ] Semua final backend action online-required.
- [ ] Retry mutasi memakai idempotency key yang sama.
- [ ] Submit/order/status/payment/print/WA tidak dobel akibat retry.
- [ ] Print confirmation tetap ada.
- [ ] Notification sound tetap ada dan vibration/haptic ditambahkan.

### Tambahan dari Revisi

- [ ] `setupPin` kedua kali ditolak dengan pesan yang jelas.
- [ ] PIN salah saat switch tidak mengubah session employee aktif.
- [ ] Session `Employee A` tetap aktif jika switch ke `Employee B` gagal.
- [ ] Token lama tidak dicabut untuk switch yang gagal.
- [ ] Remembered account diperbarui `hasPin: true` segera setelah setup PIN sukses.
- [ ] `checkAuthStatus` dengan network failure tidak menghapus token lokal.
- [ ] Route `/outlets` dan `/employees` memerlukan `auth:sanctum`.
- [ ] Print endpoint memerlukan permission yang sesuai dan dicek per outlet.
- [ ] Idempotency payload berbeda dengan key sama menghasilkan 409.
- [ ] Coin tidak berkurang dua kali untuk retry print/WA.
- [ ] Draft order masuk `submit_failed` saat submit gagal.
- [ ] Prompt "lanjutkan/hapus/mulai baru" muncul saat draft ditemukan.
- [ ] Weighing draft menyimpan `outletId`, notes, photo reference, `clientRequestId`.
- [ ] Semua aksi mutasi mengirim `Client-Request-Id` secara konsisten.
- [ ] Print retry key persisted di SharedPreferences selama local print belum selesai.
- [ ] Backend dan Flutter lulus format/analyze/test yang relevan.

---

## Risiko dan Mitigasi (Diperbarui)

| Risiko | Mitigasi |
|--------|----------|
| Session employee aktif hilang saat PIN switch gagal | Gunakan state `SwitchPinVerifying` / `SwitchPinFailure` yang mempertahankan `previousEmployee` |
| Token employee lama tetap valid setelah switch | Implementasi kebijakan token lifecycle yang eksplisit; test di backend |
| Employee reset PIN tanpa verifikasi | `setupPin` hanya untuk PIN null; tambahkan endpoint reset PIN terpisah |
| Remembered account masih `hasPin: false` setelah setup | Tambahkan `_rememberedDatasource.saveAccount()` di `setupPin` repository |
| Draft weighing kehilangan data setelah app crash | Perluas schema weighing draft, autosave setiap perubahan |
| Retry print mengurangi coin dua kali | Idempotency key persisted di local storage; backend idempotency melingkupi coin debit |
| Route unauthenticated bocor data | Audit dan tambahkan `auth:sanctum` ke semua route yang membutuhkan |
| `checkAuthStatus` logout user saat koneksi buruk | Bedakan 401/403 dari network failure di repository |
| Race condition idempotency concurrent request | Gunakan unique constraint + `firstOrCreate` + penanganan `QueryException` |
