# Cashier Auth Splash dan PIN Switch Issue

Tanggal debug: 2026-06-21

## Scope

Dokumen ini adalah artefak issue/debug saja. Tidak ada perubahan kode aplikasi dalam step ini.

Issue ini disusun agar implementasi dapat dikerjakan oleh agent/model lain dengan konteks yang cukup, tanpa perlu mengulang investigasi awal.

## Gejala

Pada flow cashier app, request `GET /api/mobile/cashier/auth/me` dapat sukses `200`, tetapi aplikasi tetap terlihat berhenti di splash screen atau tidak berpindah ke screen yang benar.

Kasus yang dicurigai:

- Employee sudah login dan `/auth/me` berhasil.
- Backend mengembalikan employee resource.
- State auth sudah menjadi state final selain `Authenticated` atau `Unauthenticated`.
- `SplashScreen` tidak menangani state final tersebut, sehingga tidak melakukan navigasi.

## Area yang Perlu Dibaca

Frontend cashier:

- `apps/cashier/lib/features/splash/screens/splash_screen.dart`
- `apps/cashier/lib/core/router/app_router.dart`
- `apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart`
- `apps/cashier/lib/features/auth/presentation/bloc/auth_state.dart`
- `apps/cashier/lib/features/auth/presentation/screens/login_screen.dart`
- `apps/cashier/lib/features/auth/presentation/screens/setup_pin_screen.dart`
- `apps/cashier/lib/features/auth/presentation/screens/switch_employee_screen.dart`
- `apps/cashier/lib/features/auth/presentation/screens/pin_entry_screen.dart`
- `apps/cashier/lib/features/auth/presentation/providers/auth_provider.dart`
- `apps/cashier/lib/main.dart`

Shared Flutter packages:

- `packages/wash_wallet_domain/lib/src/repositories/auth_repository.dart`
- `packages/wash_wallet_domain/lib/src/usecases/auth/login_usecase.dart`
- `packages/wash_wallet_domain/lib/src/usecases/auth/setup_pin_usecase.dart`
- `packages/wash_wallet_domain/lib/src/usecases/auth/verify_pin_usecase.dart`
- `packages/wash_wallet_data/lib/src/auth/repositories/auth_repository_impl.dart`
- `packages/wash_wallet_data/lib/src/auth/datasources/remembered_employee_local_datasource.dart`
- `packages/wash_wallet_core/lib/src/storage/secure_storage_provider.dart`

Backend:

- `webapp/wash_wallet_be/app/Services/AuthService.php`
- `webapp/wash_wallet_be/app/Http/Resources/Employee/LoginEmployeeResource.php`
- `webapp/wash_wallet_be/routes/api_mobile_cashier.php`
- `webapp/wash_wallet_be/tests/Feature/EmployeePinAuthTest.php`

## Temuan Utama

### 1. Splash tidak menangani semua final auth state

`SplashScreen._checkAuthStatus()` hanya melakukan navigasi untuk:

- `Authenticated` ke `/home`
- `Unauthenticated` atau `AuthFailureState` ke onboarding/login flow

Namun auth cashier saat ini juga dapat menghasilkan state final:

- `AuthSetupPinRequired`
- `AuthAccessDenied`
- `AuthenticatedStale`

Jika state tersebut muncul setelah `checkAuthStatus()`, splash tidak punya cabang navigasi dan dapat diam di splash.

Expected routing:

- `Authenticated` ke `/home`
- `AuthenticatedStale` ke `/home`
- `AuthSetupPinRequired` ke `/setup-pin`
- `AuthAccessDenied` ke `/access-denied`
- `Unauthenticated` atau `AuthFailureState` mengikuti flow onboarding, switch employee, atau login

### 2. Router guard belum cukup membantu saat posisi masih di `/splash`

`AppRouter` sudah mengenal beberapa auth state, tetapi ada guard awal yang membiarkan `/splash` lewat begitu saja.

Dampaknya, jika splash screen berada pada state final seperti `AuthSetupPinRequired` atau `AuthAccessDenied`, redirect router tidak memaksa keluar dari splash. Navigasi tetap bergantung pada logic manual di `SplashScreen`.

Expected behavior:

- `/splash` hanya boleh tetap stay saat state masih `AuthInitial` atau `AuthLoading`.
- Begitu state final muncul, router atau splash harus mengarahkan ke route yang sesuai.

### 3. Unauthenticated routing harus mempertimbangkan remembered accounts

Flow cashier multi employee membutuhkan quick switch berbasis akun tersimpan.

Saat unauthenticated, arah route sebaiknya:

1. Jika onboarding belum selesai: `/onboarding`
2. Jika onboarding selesai dan ada remembered account: `/switch-employee`
3. Jika onboarding selesai dan tidak ada remembered account: `/login`

Saat ini ada risiko flow selalu ke `/login`, sehingga quick switch tidak dipakai walaupun device sudah punya remembered employee.

### 4. `AuthCubit._handleAuthSuccess()` bisa menghasilkan state final selain authenticated

`AuthCubit._handleAuthSuccess()` menentukan state dari payload employee:

- Jika employee tidak punya permission `order.view`, emit `AuthAccessDenied`.
- Jika employee belum punya PIN, emit `AuthSetupPinRequired`.
- Jika lolos permission dan punya PIN, emit `Authenticated`.

Berarti response `/auth/me` `200` tidak selalu berarti aplikasi harus langsung ke `/home`. Aplikasi harus menangani semua state final tersebut.

### 5. Remembered account masih berisiko auto-save

`AuthRepositoryImpl` saat ini berisiko menyimpan remembered account otomatis pada flow login/setup/verify PIN.

Target product behavior dari issue ini:

- Remembered account harus explicit opt-in.
- Akun hanya masuk switch list setelah user memilih aksi `Simpan` pada prompt/bottom sheet.
- Jika user memilih `Nanti saja`, akun tidak disimpan.
- Jika user logout tanpa menyimpan akun, next auth flow kembali ke login password, bukan switch employee.

Flow yang perlu dicek dan diselaraskan:

- Password login sukses
- Setup PIN sukses
- PIN verify sukses
- Switch employee dengan PIN sukses

### 6. Butuh prompt simpan akun setelah login/setup PIN sukses

Setelah user berhasil login password atau menyelesaikan setup PIN pada device yang belum menyimpan akun tersebut, app perlu menampilkan bottom sheet:

- Title: `Simpan info login?`
- Primary action: `Simpan`
- Secondary action: `Nanti saja`

Expected behavior:

- `Simpan`: employee disimpan ke remembered account datasource.
- `Nanti saja`: employee tidak disimpan.
- Prompt hanya muncul untuk akun yang belum tersimpan di device.
- Prompt tidak boleh menghalangi routing utama ke screen yang benar.

Implementation direction:

- Tambahkan repository/use case method eksplisit, misalnya `rememberCurrentEmployee()` atau `saveRememberedEmployee(employee)`.
- Tambahkan flag auth state, misalnya `Authenticated(employee, shouldPromptRemember: true)`, atau state/event UI sejenis.
- Pastikan prompt tidak muncul berulang tanpa aksi user yang relevan.

### 7. Setup PIN response backend harus reload permission relation

Backend `LoginEmployeeResource` sudah memiliki field penting:

- `hasPin`
- `accessibleOutlets`
- `allPermissions`

Namun `AuthService::setupPin()` perlu dicek karena response yang memakai model hasil `fresh()` tanpa relation yang lengkap dapat membuat payload permission kosong atau tidak konsisten.

Risiko:

- Setup PIN sukses.
- Response employee punya `hasPin=true`, tetapi `allPermissions` kosong.
- Flutter `_handleAuthSuccess()` melihat tidak ada `order.view`.
- App mengarah ke `AuthAccessDenied` walaupun employee sebenarnya punya akses.

Expected backend behavior:

- `login`
- `me`
- `pin/setup`
- `pin/verify`

semuanya mengembalikan employee resource dengan `hasPin`, `accessibleOutlets`, dan `allPermissions` yang populated secara konsisten.

### 8. Token storage cashier harus konsisten

`apps/cashier/lib/main.dart` memakai:

- `SecureStorageProvider.create()`

Namun `AuthProvider` cashier memakai:

- `const FlutterSecureStorage()`

Ini berisiko membuat interceptor dan auth repository membaca/menulis konfigurasi storage yang berbeda, terutama di Android karena `SecureStorageProvider.create()` memakai `encryptedSharedPreferences`.

Expected behavior:

- Auth local datasource dan `AuthInterceptor` memakai secure storage instance/config yang sama.
- `AuthProvider.createAuthCubitWithDependencies()` sebaiknya menerima storage dari caller atau membuat storage dengan `SecureStorageProvider.create()`.

## Root Cause Sementara

Root cause utama bug splash adalah mismatch antara state machine auth dan routing splash.

Backend `/auth/me` bisa sukses `200`, tetapi auth success di Flutter masih dapat berujung ke `AuthSetupPinRequired`, `AuthAccessDenied`, atau `AuthenticatedStale`. Karena `SplashScreen` tidak menangani state final tersebut, aplikasi tidak selalu keluar dari splash.

Root cause pendukung:

- Router guard membiarkan `/splash` stay untuk semua state.
- Remembered account flow belum explicit opt-in.
- Setup PIN backend berisiko mengembalikan permission payload tidak lengkap.
- Secure storage setup berisiko tidak konsisten antara interceptor dan auth datasource.

## Arah Perbaikan yang Disarankan

### Splash dan router

Perbaiki routing agar semua state final keluar dari splash:

- `Authenticated` dan `AuthenticatedStale`: `/home`
- `AuthSetupPinRequired`: `/setup-pin`
- `AuthAccessDenied`: `/access-denied`
- `Unauthenticated` atau `AuthFailureState`:
  - onboarding belum selesai: `/onboarding`
  - ada remembered account: `/switch-employee`
  - tidak ada remembered account: `/login`

Router guard juga perlu memastikan `/splash` hanya bisa stay saat auth state masih loading atau initial.

### Remembered account explicit opt-in

Hapus auto-save remembered account dari repository methods:

- `login()`
- `setupPin()`
- `verifyPin()`

Tambahkan method eksplisit untuk menyimpan account setelah user memilih `Simpan`.

Rekomendasi penamaan:

- Repository: `saveRememberedAccount(AuthEmployee employee)` atau `rememberCurrentEmployee()`
- Use case: `SaveRememberedAccountUsecase`
- Cubit method: `rememberCurrentEmployee()`

Pastikan `RememberedEmployeeLocalDatasource` tetap menjadi detail data layer, bukan dipanggil langsung dari UI kecuali memang sudah menjadi pola existing yang disepakati.

### Prompt simpan akun

Tambahkan prompt setelah password login/setup PIN sukses jika akun belum tersimpan.

Prompt harus mendukung:

- `Simpan`: simpan account, update remembered list.
- `Nanti saja`: jangan simpan account.

State auth dapat membawa flag seperti:

```dart
Authenticated(employee, shouldPromptRemember: true)
```

Atau gunakan mekanisme side-effect UI lain, selama prompt tetap one-time dan testable.

### PIN switch safety

Pastikan PIN switch failure tidak mengganti session employee aktif sebelumnya.

Behavior yang benar:

- Employee A aktif.
- User mencoba switch ke Employee B.
- PIN Employee B salah.
- State aktif Employee A tetap tersedia.
- Token lokal Employee A tidak ditimpa.
- UI tetap di PIN prompt atau kembali ke switch list dengan error.

Jika sudah ada state seperti `SwitchPinVerifying` dan `SwitchPinFailure`, test harus memastikan state tersebut benar-benar dipakai oleh screen switch/PIN.

### Backend employee resource consistency

Pastikan service/controller untuk cashier auth selalu load relation yang dibutuhkan sebelum membuat `LoginEmployeeResource`.

Minimal endpoint yang perlu dicek:

- `POST /api/mobile/cashier/auth/login`
- `GET /api/mobile/cashier/auth/me`
- `POST /api/mobile/cashier/auth/pin/setup`
- `POST /api/mobile/cashier/auth/pin/verify`

`pin/setup` harus mengembalikan:

- `hasPin=true`
- `accessibleOutlets` populated
- `allPermissions` populated

### Secure storage consistency

Samakan storage instance/config antara:

- `SecureTokenStorage` yang dipakai `AuthInterceptor`
- `AuthLocalDatasourceImpl` yang dipakai `AuthRepositoryImpl`

## Acceptance Criteria

- App tidak lagi stuck di splash setelah `/api/mobile/cashier/auth/me` mengembalikan `200`.
- Employee authenticated dan punya PIN serta `order.view` masuk ke `/home`.
- Employee authenticated tetapi belum punya PIN masuk ke `/setup-pin`.
- Employee authenticated tetapi tidak punya `order.view` masuk ke `/access-denied`.
- Authenticated stale masuk ke `/home` sesuai policy resilient auth.
- Unauthenticated dengan onboarding belum selesai masuk ke `/onboarding`.
- Unauthenticated dengan remembered account masuk ke `/switch-employee`.
- Unauthenticated tanpa remembered account masuk ke `/login`.
- Repository tidak menyimpan remembered account otomatis saat login/setup PIN/verify PIN.
- Account hanya tersimpan setelah user memilih `Simpan`.
- Jika user memilih `Nanti saja`, account tidak muncul di switch list.
- Setup PIN success mengembalikan payload employee dengan `hasPin=true` dan permission tetap populated.
- PIN switch gagal tidak menghapus atau mengganti session employee aktif lama.
- Auth token storage cashier konsisten antara interceptor dan repository.

## Test Plan

### Flutter unit/widget tests

- Splash routing:
  - `Authenticated` ke `/home`
  - `AuthenticatedStale` ke `/home`
  - `AuthSetupPinRequired` ke `/setup-pin`
  - `AuthAccessDenied` ke `/access-denied`
  - `Unauthenticated` dengan remembered account ke `/switch-employee`
  - `Unauthenticated` tanpa remembered account ke `/login`
- Password login tanpa PIN:
  - login success emit/setup route ke `/setup-pin`
  - setup PIN success lanjut ke `/home`
  - prompt simpan akun muncul jika account belum tersimpan
- Remembered account opt-in:
  - pilih `Simpan` menambah account ke switch list
  - pilih `Nanti saja` tidak menambah account
  - repository login/setup/verify tidak memanggil save remembered otomatis
- PIN switch:
  - verify PIN success mengganti active employee
  - verify PIN failure mempertahankan previous active employee
- Storage:
  - auth datasource dan interceptor memakai konfigurasi secure storage yang sama, atau test integration ringan yang membuktikan token tersimpan bisa dibaca interceptor

### Backend feature tests

- `/api/mobile/cashier/auth/me` mengandung:
  - `hasPin`
  - `accessibleOutlets`
  - `allPermissions`
- `/api/mobile/cashier/auth/pin/setup` setelah sukses mengembalikan:
  - `hasPin=true`
  - permission payload tidak kosong untuk employee yang punya permission
- `/api/mobile/cashier/auth/pin/verify` mengembalikan payload permission yang sama konsistennya dengan login/me.
- Employee dengan `order.view` lolos cashier auth success.
- Employee tanpa `order.view` dapat response payload yang membuat app masuk access denied, bukan stuck di splash.

### Manual emulator

- Login dengan akun Katrina atau akun cashier lain yang relevan.
- Verifikasi log network menunjukkan `/api/mobile/cashier/auth/me` `200`.
- Pastikan app keluar dari splash dan masuk screen yang benar.
- Logout tanpa menyimpan akun, lalu pastikan next flow masuk login password.
- Login lagi, pilih `Simpan`, logout, lalu pastikan `/switch-employee` muncul dan quick switch via PIN berjalan.
- Coba PIN salah saat switch, pastikan employee aktif lama tidak hilang.

## Catatan Untuk Implementer Berikutnya

- Jangan memperlakukan fitur ini sebagai greenfield. Repo sudah punya implementasi awal untuk `AuthSetupPinRequired`, `AuthAccessDenied`, setup PIN, switch employee, PIN entry, remembered account datasource, dan sebagian test.
- Fokus implementasi adalah memperbaiki gap state/routing, explicit opt-in remembered account, payload consistency, dan test coverage.
- Pertahankan perubahan worktree yang tidak terkait. Jangan revert file lain tanpa instruksi eksplisit.
- Dokumen ini sengaja tidak melakukan perubahan kode aplikasi.
