# Plan: Optional Employee PIN Setup Prompt (Cashier & Production)

**Tanggal:** 2026-06-28  
**Referensi User Need:** `docs/user_need/employee_pin_optional_setup_prompt_user_need.md`  
**Dikerjakan oleh:** AI model lain (bukan AI yang menyusun plan ini)

---

## Ringkasan

Mengubah flow setup PIN employee dari **hard-block** (wajib sebelum masuk Home) menjadi **prompt opsional** (dapat dilewati untuk session ini). Berlaku untuk Cashier App dan Production App.

Saat ini:
- Cashier App: `employee.hasPin == false` → emit `AuthSetupPinRequired` → router redirect ke `/setup-pin` (hard-block).
- Production App: tidak memiliki flow PIN sama sekali.

Target:
- Cashier App: `employee.hasPin == false` → emit state prompt opsional → tampilkan interstitial → user pilih "Setting sekarang" (ke setup PIN) atau "Lewati" (masuk Home, session-only).
- Production App: mendapat parity lengkap — state baru, screen prompt, setup PIN flow, dan backend route parity.

---

## Konteks Codebase Saat Ini

### Cashier Auth Flow
File utama:
- `apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart` — `AuthCubit`
- `apps/cashier/lib/features/auth/presentation/bloc/auth_state.dart` — `AuthState` (sealed class)
- `apps/cashier/lib/core/router/app_router.dart` — GoRouter dengan redirect berdasarkan `AuthCubit.state`

Alur `_handleAuthSuccess(employee)` saat ini:
```dart
if (!employee.hasOrderViewPermission) { emit(AuthAccessDenied(employee)); return; }
if (!employee.hasPin) { emit(AuthSetupPinRequired(employee)); return; } // ← yang diubah
// ... emit Authenticated atau AuthenticatedStale
```

State yang relevan saat ini:
- `AuthSetupPinRequired(employee)` — diemit jika `hasPin == false`, menyebabkan router memaksa ke `/setup-pin`
- `Authenticated(employee, {shouldPromptRemember})` — state setelah berhasil
- `AuthAccessDenied(employee)` — lebih prioritas dari PIN

Router redirect untuk `AuthSetupPinRequired`:
```dart
if (authState is AuthSetupPinRequired) {
  if (currentLocation != '/setup-pin') return '/setup-pin';
  return null;
}
```

Screen setup PIN:
- `setup_pin_screen.dart` — user masukkan PIN 6 digit, push ke `/confirm-pin` atau `/settings/confirm-pin`
- `confirm_pin_screen.dart` — user konfirmasi PIN, panggil `AuthCubit.setupPin()`

PIN use cases (domain layer, sudah ada):
- `SetupPinUseCase`, `VerifyPinUseCase`, `ResetPinUseCase`

PIN widget (lokal, bukan dari `wash_wallet_ui`):
- `apps/cashier/lib/features/auth/presentation/widgets/pin_box_input.dart`

### Production Auth Flow
File utama:
- `apps/production/lib/features/auth/presentation/bloc/auth_cubit.dart` — lebih simpel, tidak ada PIN
- `apps/production/lib/features/auth/presentation/bloc/auth_state.dart` — hanya: `AuthInitial`, `AuthLoading`, `Authenticated`, `Unauthenticated`, `AuthFailureState`
- `apps/production/lib/features/auth/presentation/providers/auth_provider.dart` — tidak inject PIN use cases
- `apps/production/lib/core/router/app_router.dart` — tidak ada route PIN

Startup session Production (dalam `_onAuthenticated(employee)`):
- Set courier outlet IDs
- Register FCM token
- Connect Pusher

### Backend Routes
Cashier: `webapp/wash_wallet_be/routes/api_mobile_cashier.php`
- `POST /mobile/cashier/auth/pin/setup` — `auth:sanctum`
- `POST /mobile/cashier/auth/pin/reset` — `auth:sanctum`
- `POST /mobile/cashier/auth/pin/verify` — `throttle:5,1`

Production: `webapp/wash_wallet_be/routes/api_mobile_production.php`
- **TIDAK ADA route PIN** — perlu ditambahkan

Backend Controller: `EmployeeAuthController` — method `setupPin()`, `resetPin()`, `verifyPin()` sudah ada, hanya belum di-route untuk production.

### Domain Layer (Shared)
Package `packages/wash_wallet_domain`:
- `SetupPinUseCase`, `VerifyPinUseCase`, `ResetPinUseCase` — sudah ada
- `AuthRepository.setupPin()`, `AuthRepository.verifyPin()`, `AuthRepository.resetPin()` — sudah ada

Package `packages/wash_wallet_data`:
- `AuthRemoteDatasource.setupPin()` — POST `<authBase>/pin/setup` (path relative ke authBase prefix, jadi bisa dipakai Production jika datasource di-configure dengan prefix production)

---

## Keputusan Design

### D1: State baru untuk prompt opsional

Tambahkan state baru `AuthPinSetupPrompt(employee)` yang **terpisah** dari `AuthSetupPinRequired`.

Rationale:
- `AuthSetupPinRequired` saat ini masih dipakai secara internal dalam flow setup PIN (dari Settings).
- State baru yang eksplisit menghindari ambiguitas dan mempermudah router redirect yang tepat.
- `AuthSetupPinRequired` boleh dipertahankan namun tidak lagi diemit dari `_handleAuthSuccess()` secara langsung.

```dart
// State baru
class AuthPinSetupPrompt extends AuthState {
  final AuthEmployee employee;
  const AuthPinSetupPrompt(this.employee);
  @override
  List<Object?> get props => [employee];
}
```

### D2: Flag session-only untuk "Lewati"

Gunakan `bool _pinPromptSkippedThisSession` sebagai field private in-memory dalam `AuthCubit`.

Aturan:
- Di-set `true` ketika user memanggil `skipPinSetup()`.
- **Tidak** disimpan ke `SharedPreferences`, secure storage, atau backend.
- Direset secara otomatis saat cubit di-dispose (app restart / cold start).
- Setelah set ke `true`, `_handleAuthSuccess()` dengan `hasPin == false` akan emit `Authenticated` langsung (bukan prompt lagi) selama instance cubit masih sama.

> ⚠️ Catatan penting: Karena `AuthCubit` bisa hidup lama (hingga app benar-benar restart), flag ini mencegah prompt muncul berulang dalam satu sesi. Saat cold start baru, cubit baru dibuat dan flag kembali `false`.

### D3: Route interstitial baru

Tambahkan route `/pin-setup-prompt` (Cashier) dan `/pin-setup-prompt` (Production) yang masing-masing mengarah ke screen interstitial baru.

### D4: Production PIN endpoint

Production akan menambahkan route PIN pada backend dengan prefix `mobile/production`. Datasource production di-configure dengan `authBase = "mobile/production/auth"`, sehingga endpoint setup PIN menjadi `POST /mobile/production/auth/pin/setup`.

Production **hanya** butuh `setupPin` untuk saat ini (sesuai scope). `verifyPin` dan `resetPin` **opsional** untuk future parity, tapi tidak dalam scope minimal ini.

### D5: Reuse SetupPinScreen dan ConfirmPinScreen dari Cashier di Production

Production **tidak** akan membuat screen PIN baru dari nol. Sebaiknya komponen `SetupPinScreen`, `ConfirmPinScreen`, dan `PinBoxInput` **dipindahkan ke package shared** atau **di-copy ke Production** dengan penyesuaian minimal.

Rekomendasi: **Copy screen + widget ke Production** (bukan shared package) untuk menghindari over-engineering. Modifikasi pada cubit listener disesuaikan dengan production cubit.

---

## Perubahan yang Diperlukan

---

### Komponen 1: Backend (Laravel)

#### [MODIFY] `webapp/wash_wallet_be/routes/api_mobile_production.php`

Tambahkan route PIN untuk production:

```php
// Di dalam group middleware(['auth:sanctum']) yang sudah ada
Route::prefix('auth')->group(function () {
    // ... route yang sudah ada (login, logout, validate, me, fcm-token) ...
    
    // Tambahkan:
    Route::post('pin/setup', [EmployeeAuthController::class, 'setupPin']);
    // Untuk parity lengkap (opsional tapi direkomendasikan):
    Route::post('pin/reset', [EmployeeAuthController::class, 'resetPin']);
    Route::post('pin/verify', [EmployeeAuthController::class, 'verifyPin'])->middleware('throttle:5,1');
});
```

> Verifikasi: middleware yang dipakai harus konsisten dengan cashier. `setupPin` dan `resetPin` perlu `auth:sanctum`. `verifyPin` perlu throttle.

**Tidak ada perubahan pada Controller** — `EmployeeAuthController` sudah memiliki semua method yang dibutuhkan.

---

### Komponen 2: Cashier App — Auth State

#### [MODIFY] `apps/cashier/lib/features/auth/presentation/bloc/auth_state.dart`

Tambahkan state baru:

```dart
// Tambahkan setelah AuthSetupPinRequired
class AuthPinSetupPrompt extends AuthState {
  final AuthEmployee employee;
  const AuthPinSetupPrompt(this.employee);
  @override
  List<Object?> get props => [employee];
}
```

`AuthSetupPinRequired` tetap dipertahankan (masih dipakai flow reset PIN di Settings).

---

### Komponen 3: Cashier App — Auth Cubit

#### [MODIFY] `apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart`

**3a. Tambahkan field session-only:**

```dart
bool _pinPromptSkippedThisSession = false;
```

**3b. Modifikasi `_handleAuthSuccess()`:**

```dart
void _handleAuthSuccess(AuthEmployee employee, {bool checkRemember = false, bool isStale = false}) async {
  if (!employee.hasOrderViewPermission) {
    emit(AuthAccessDenied(employee));
    return;
  }

  // Ubah: tidak lagi hard-block, tapi emit prompt opsional
  if (!employee.hasPin && !_pinPromptSkippedThisSession) {
    emit(AuthPinSetupPrompt(employee)); // ← state baru, bukan AuthSetupPinRequired
    return;
  }

  // ... sisa kode (checkRemember, isStale, emit Authenticated) tetap sama
  bool shouldPrompt = false;
  if (checkRemember) {
    final prefs = await SharedPreferences.getInstance();
    final ds = RememberedEmployeeLocalDatasourceImpl(prefs);
    final accounts = await ds.getAccounts();
    shouldPrompt = !accounts.any((a) => a.employeeId == employee.id);
  }

  if (isStale) {
    emit(AuthenticatedStale(employee));
  } else {
    emit(Authenticated(employee, shouldPromptRemember: shouldPrompt));
    unawaited(_startNotificationSession(employee));
  }
}
```

**3c. Tambahkan method `skipPinSetup()`:**

```dart
/// Dipanggil saat user menekan "Lewati" pada prompt PIN opsional.
/// Menandai bahwa prompt sudah dilewati untuk session ini (tidak persist).
void skipPinSetup() {
  final currentState = state;
  if (currentState is! AuthPinSetupPrompt) return;
  
  _pinPromptSkippedThisSession = true;
  final employee = currentState.employee;
  
  // Langsung emit Authenticated dan jalankan notification session
  emit(Authenticated(employee));
  unawaited(_startNotificationSession(employee));
}
```

**3d. Verifikasi `setupPin()` tetap berfungsi:**

Method `setupPin()` sudah ada dan memanggil `_handleAuthSuccess()` setelah berhasil. Karena response dari backend akan mengembalikan `hasPin=true`, flag `_pinPromptSkippedThisSession` tidak relevan lagi (kondisi `!employee.hasPin` akan false).

**3e. Reset flag saat logout:**

Tambahkan reset pada `logout()`:

```dart
Future<void> logout() async {
  _pinPromptSkippedThisSession = false; // ← reset
  emit(const AuthLoading());
  // ... kode yang sudah ada
}
```

---

### Komponen 4: Cashier App — Router

#### [MODIFY] `apps/cashier/lib/core/router/app_router.dart`

**4a. Tambahkan import screen baru:**

```dart
import '../../features/auth/presentation/screens/pin_setup_prompt_screen.dart';
```

**4b. Modifikasi `_resolveRouteFromState()`:**

```dart
String? _resolveRouteFromState(AuthState authState) {
  if (authState is Authenticated || authState is AuthenticatedStale) return '/home';
  if (authState is AuthPinSetupPrompt) return '/pin-setup-prompt'; // ← tambahkan
  if (authState is AuthSetupPinRequired) return '/setup-pin'; // ← tetap ada (untuk Settings flow internal jika dipakai)
  if (authState is AuthAccessDenied) return '/access-denied';
  if (authState is AuthRequiresOnboarding) return '/onboarding';
  if (authState is AuthRequiresSwitchEmployee) return '/switch-employee';
  if (authState is Unauthenticated || authState is AuthFailureState) return '/login';
  return null;
}
```

**4c. Modifikasi blok redirect untuk `AuthPinSetupPrompt`:**

```dart
// Tambahkan SEBELUM blok AuthSetupPinRequired
if (authState is AuthPinSetupPrompt) {
  if (currentLocation != '/pin-setup-prompt') return '/pin-setup-prompt';
  return null;
}
```

**4d. Update blok redirect untuk `Authenticated` (tambahkan `/pin-setup-prompt` ke list screen yang perlu di-redirect ke Home):**

```dart
if (authState is Authenticated) {
  if (currentLocation == '/login' ||
      currentLocation == '/onboarding' ||
      currentLocation == '/setup-pin' ||
      currentLocation == '/pin-setup-prompt' || // ← tambahkan
      currentLocation == '/access-denied' ||
      currentLocation == '/re-auth-pin') {
    final from = state.uri.queryParameters['from'];
    return from != null ? Uri.decodeComponent(from) : '/home';
  }
  return null;
}
```

**4e. Tambahkan route `/pin-setup-prompt`:**

```dart
GoRoute(
  path: '/pin-setup-prompt',
  pageBuilder: (context, state) => state.fadePage(const PinSetupPromptScreen()),
),
```

---

### Komponen 5: Cashier App — Screen Baru

#### [NEW] `apps/cashier/lib/features/auth/presentation/screens/pin_setup_prompt_screen.dart`

Screen interstitial opsional.

```dart
class PinSetupPromptScreen extends StatelessWidget {
  const PinSetupPromptScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Ikon/ilustrasi PIN
              Icon(Icons.lock_outline_rounded, size: 80, color: context.colors.primary),
              SizedBox(height: context.space.xl),
              
              // Title
              Text(
                'PIN Anda belum disetting',
                style: context.typography.headlineMedium.copyWith(fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: context.space.md),
              
              // Body copy
              Text(
                'Buat PIN 6 digit agar akses dan pergantian akun di perangkat ini lebih cepat. Anda tetap bisa melanjutkan pekerjaan sekarang dan mengatur PIN nanti.',
                style: context.typography.bodyMedium,
                textAlign: TextAlign.center,
              ),
              SizedBox(height: context.space.xl),
              
              // Tombol utama: "Setting sekarang"
              ElevatedButton(
                onPressed: () => context.go('/setup-pin'),
                child: const Text('Setting sekarang'),
              ),
              SizedBox(height: context.space.md),
              
              // Tombol sekunder: "Lewati"
              TextButton(
                onPressed: () {
                  context.read<AuthCubit>().skipPinSetup();
                },
                child: const Text('Lewati'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

> Catatan implementor: Styling disesuaikan dengan design system yang ada. Gunakan `context.colors`, `context.space`, `context.typography` sesuai pola yang sudah dipakai di screen lain (mis. `login_screen.dart`).

> Catatan navigasi: Tombol "Setting sekarang" menggunakan `context.go('/setup-pin')`. Router akan menangani ini selama `AuthPinSetupPrompt` masih aktif (belum `skipPinSetup()`). Setelah setup berhasil, `setupPin()` di cubit akan emit `Authenticated` dan router redirect ke Home otomatis.

---

### Komponen 6: Production App — Auth State

#### [MODIFY] `apps/production/lib/features/auth/presentation/bloc/auth_state.dart`

Tambahkan state baru yang sejajar dengan Cashier:

```dart
// Tambahkan setelah AuthFailureState
class AuthPinSetupPrompt extends AuthState {
  final AuthEmployee employee;
  const AuthPinSetupPrompt(this.employee);
  @override
  List<Object?> get props => [employee];
}
```

---

### Komponen 7: Production App — Auth Cubit

#### [MODIFY] `apps/production/lib/features/auth/presentation/bloc/auth_cubit.dart`

**7a. Tambahkan PIN use cases sebagai dependency:**

```dart
class AuthCubit extends Cubit<AuthState> {
  final LoginUsecase _loginUsecase;
  final LogoutUsecase _logoutUsecase;
  final GetMeUsecase _getMeUsecase;
  final CheckAuthStatusUsecase _checkAuthStatusUsecase;
  final SetupPinUseCase _setupPinUseCase; // ← tambahkan
  // ... (FcmTokenDatasource tetap)
  
  bool _pinPromptSkippedThisSession = false; // ← tambahkan
```

**7b. Tambahkan method `_handleAuthSuccess()` yang baru (sebelumnya tidak ada pattern ini di production):**

Saat ini production memanggil `_onAuthenticated(employee)` secara langsung. Refactor menjadi:

```dart
void _handleAuthSuccess(AuthEmployee employee) {
  // Cek permission (sesuaikan dengan kondisi production — gunakan logic yang sudah ada di router/cubit)
  // Production menggunakan hasProductionAppAccess / hasCourierAppAccess
  // Jika tidak punya akses sama sekali: state no-permission ditangani di router (bukan di cubit)
  // Jadi cubit tidak perlu cek permission, cukup cek hasPin
  
  if (!employee.hasPin && !_pinPromptSkippedThisSession) {
    emit(AuthPinSetupPrompt(employee));
    return;
  }
  
  emit(Authenticated(employee));
  _onAuthenticated(employee); // startup FCM, Pusher, dll
}
```

Kemudian modifikasi `login()`, `checkAuthStatus()`, `refreshMe()` agar memanggil `_handleAuthSuccess()` alih-alih langsung emit `Authenticated`:

```dart
Future<void> login({required String username, required String password}) async {
  emit(const AuthLoading());
  final result = await _loginUsecase(username: username, password: password);
  result.when(
    success: (employee) => _handleAuthSuccess(employee), // ← ubah
    failure: (failure) => emit(AuthFailureState(failure)),
  );
}
// Sama untuk checkAuthStatus dan refreshMe
```

**7c. Tambahkan `skipPinSetup()`:**

```dart
void skipPinSetup() {
  final currentState = state;
  if (currentState is! AuthPinSetupPrompt) return;
  
  _pinPromptSkippedThisSession = true;
  final employee = currentState.employee;
  emit(Authenticated(employee));
  _onAuthenticated(employee); // ← pastikan startup session tetap jalan
}
```

**7d. Tambahkan `setupPin()`:**

```dart
Future<void> setupPin({required String pin, required String pinConfirmation}) async {
  emit(const AuthLoading());
  final result = await _setupPinUseCase(
    SetupPinParams(pin: pin, pinConfirmation: pinConfirmation),
  );
  result.when(
    success: (employee) => _handleAuthSuccess(employee),
    failure: (failure) => emit(AuthFailureState(failure)),
  );
}
```

**7e. Reset flag pada logout:**

```dart
Future<void> logout() async {
  _pinPromptSkippedThisSession = false;
  // ... kode yang sudah ada
}
```

---

### Komponen 8: Production App — Auth Provider

#### [MODIFY] `apps/production/lib/features/auth/presentation/providers/auth_provider.dart`

Tambahkan factory untuk `SetupPinUseCase` dan inject ke `createAuthCubit()`:

```dart
static SetupPinUseCase createSetupPinUsecase(AuthRepository repository) {
  return SetupPinUseCase(repository);
}

// Modifikasi createAuthCubit (atau createAuthCubitWithDependencies) untuk menerima dan menginject:
static AuthCubit createAuthCubit({
  required LoginUsecase loginUsecase,
  required LogoutUsecase logoutUsecase,
  required GetMeUsecase getMeUsecase,
  required CheckAuthStatusUsecase checkAuthStatusUsecase,
  required SetupPinUseCase setupPinUsecase, // ← tambahkan
  FcmTokenDatasource? fcmTokenDatasource,
}) {
  return AuthCubit(
    loginUsecase: loginUsecase,
    logoutUsecase: logoutUsecase,
    getMeUsecase: getMeUsecase,
    checkAuthStatusUsecase: checkAuthStatusUsecase,
    setupPinUseCase: setupPinUsecase, // ← tambahkan
    fcmTokenDatasource: fcmTokenDatasource,
  );
}
```

Catatan: Pastikan endpoint yang dipakai `AuthRemoteDatasource` untuk production adalah prefix `/mobile/production/auth` sehingga PIN setup endpoint yang dipanggil adalah `POST /mobile/production/auth/pin/setup` (setelah backend route ditambahkan).

---

### Komponen 9: Production App — Router

#### [MODIFY] `apps/production/lib/core/router/app_router.dart`

**9a. Import screen baru:**

```dart
import '../../features/auth/presentation/screens/pin_setup_prompt_screen.dart';
import '../../features/auth/presentation/screens/setup_pin_screen.dart';
import '../../features/auth/presentation/screens/confirm_pin_screen.dart';
```

**9b. Tambahkan redirect logic untuk `AuthPinSetupPrompt`:**

Di dalam blok redirect (sebelum cek `Authenticated`):

```dart
if (authState is AuthPinSetupPrompt) {
  if (currentLocation != '/pin-setup-prompt') return '/pin-setup-prompt';
  return null;
}
```

**9c. Update redirect untuk `Authenticated`** — tambahkan `/pin-setup-prompt`, `/setup-pin`, `/confirm-pin` ke list lokasi yang harus di-redirect ke `/home`:

```dart
if (authState is Authenticated) {
  if (currentLocation == '/login' ||
      currentLocation == '/onboarding' ||
      currentLocation == '/pin-setup-prompt' ||
      currentLocation == '/setup-pin' ||
      currentLocation == '/confirm-pin') {
    return '/home';
  }
  return null;
}
```

**9d. Tambahkan routes baru:**

```dart
GoRoute(
  path: '/pin-setup-prompt',
  pageBuilder: (context, state) => state.fadePage(const PinSetupPromptScreen()),
),
GoRoute(
  path: '/setup-pin',
  pageBuilder: (context, state) => state.fadePage(const SetupPinScreen()),
),
GoRoute(
  path: '/confirm-pin',
  pageBuilder: (context, state) {
    final extra = state.extra as Map<String, dynamic>? ?? {};
    return state.fadePage(
      ConfirmPinScreen(initialPin: extra['initialPin'] as String? ?? ''),
    );
  },
),
```

---

### Komponen 10: Production App — Screen Baru (PIN)

#### [NEW] `apps/production/lib/features/auth/presentation/screens/pin_setup_prompt_screen.dart`

Identik dengan Cashier tapi menggunakan `AuthCubit` dari production:

```dart
// Sama struktur dengan Cashier PinSetupPromptScreen
// Tombol "Setting sekarang" → context.go('/setup-pin')
// Tombol "Lewati" → context.read<AuthCubit>().skipPinSetup()
```

#### [NEW] `apps/production/lib/features/auth/presentation/screens/setup_pin_screen.dart`

Copy dari `apps/cashier/lib/features/auth/presentation/screens/setup_pin_screen.dart` dengan penyesuaian:
- Path navigate ke `/confirm-pin` (bukan `/settings/confirm-pin` karena production tidak punya settings flow PIN)
- Judul bisa diubah: "Buat PIN Anda" (tanpa "Kasir")

#### [NEW] `apps/production/lib/features/auth/presentation/screens/confirm_pin_screen.dart`

Copy dari Cashier dengan penyesuaian:
- Setelah `setupPin()` berhasil: `context.go('/home')`
- Tidak ada logic `/settings` karena production tidak punya settings PIN

#### [NEW] `apps/production/lib/features/auth/presentation/widgets/pin_box_input.dart`

Copy dari `apps/cashier/lib/features/auth/presentation/widgets/pin_box_input.dart`. Widget ini bersifat presentational dan tidak berisi logic bisnis sehingga aman untuk di-copy.

---

## Urutan Implementasi yang Disarankan

1. **Backend first** — Tambahkan route PIN production (`api_mobile_production.php`). Test dengan Postman/curl bahwa `POST /mobile/production/auth/pin/setup` berfungsi setelah token valid.

2. **Domain + Data (jika perlu)** — Tidak ada perubahan di domain layer. Verifikasi bahwa `AuthRemoteDatasource.setupPin()` menggunakan path relative sehingga bisa digunakan oleh production auth repository jika prefix-nya berbeda.

3. **Cashier App** (lebih simpel karena hanya refactor):
   - Tambah `AuthPinSetupPrompt` state
   - Modifikasi `_handleAuthSuccess()` dan tambah `skipPinSetup()` di cubit
   - Tambah route `/pin-setup-prompt` dan screen `PinSetupPromptScreen`
   - Update router redirect logic
   - Test: login `hasPin=false`, verify prompt, test "Lewati", test "Setting sekarang", test restart prompt muncul lagi

4. **Production App** (lebih banyak pekerjaan baru):
   - Tambah `AuthPinSetupPrompt` state
   - Refactor cubit: tambah `_handleAuthSuccess()`, `skipPinSetup()`, `setupPin()`, inject `SetupPinUseCase`
   - Update `AuthProvider` untuk inject `SetupPinUseCase`
   - Copy PIN widget dan screens, sesuaikan
   - Tambah routes baru di router
   - Test sama seperti Cashier

5. **Verifikasi akhir** — `flutter analyze` pada kedua app, test skenario edge case (permission denied, stale session, remembered account).

---

## Edge Cases dan Catatan Penting

### Remembered Account
- `Lewati` **tidak boleh** mengupdate `hasPin` di remembered account storage.
- `skipPinSetup()` hanya emit `Authenticated` dengan employee yang masih `hasPin=false`.
- Cashier: `SwitchEmployeeScreen` dan `PinEntryScreen` sudah mengecek `hasPin` dari data remembered account — tidak perlu perubahan, karena employee dengan `hasPin=false` tetap tidak punya PIN entry.

### Settings PIN Cashier
- Setting → PIN Security tetap berfungsi.
- Route `/settings/pin-setup` tetap mengarah ke `SetupPinScreen`.
- `AuthSetupPinRequired` masih ada sebagai state (tidak dihapus), tapi tidak lagi diemit dari `_handleAuthSuccess()`.
- Jika ada kode lain yang mengemit `AuthSetupPinRequired`, perlu diperiksa (tidak ditemukan selain `_handleAuthSuccess()`).

### Stale Session (Cashier)
- Saat `isStale=true`, cubit emit `AuthenticatedStale` — **melewati** cek `hasPin`.
- Ini intentional: stale session memerlukan re-auth PIN via `ReAuthPinScreen`, yang hanya tersedia jika employee sudah punya PIN.
- Jika employee stale dan `hasPin=false`: situasi ini seharusnya tidak terjadi karena stale threshold hanya berlaku jika sebelumnya sudah `Authenticated` (yang artinya sudah punya PIN atau sudah skip).
- Plan ini tidak perlu menangani kasus edge ini secara khusus.

### Back dari Prompt
- Prompt screen bisa menampilkan opsi logout di header/app bar jika diperlukan.
- Back button dari interstitial: tidak ada route sebelumnya yang valid — bisa disable back atau arahkan ke logout.
- Rekomendasi: tambahkan tombol logout kecil di sudut screen (opsional, tergantung preferensi UX).

### Setup gagal saat di `/setup-pin`
- Jika `setupPin()` gagal, cubit emit `AuthFailureState`.
- Router untuk `AuthFailureState` saat ini tidak menyebabkan redirect dari `/setup-pin`.
- Screen `ConfirmPinScreen` sudah menangani `AuthFailureState` dengan menampilkan error di field.
- Tidak ada perubahan yang diperlukan.

### Setup sukses tapi response tanpa `hasPin=true`
- Jika response tidak membawa `hasPin=true` (edge case backend), fallback: `_handleAuthSuccess()` akan dipanggil, employee masih `hasPin=false`, dan prompt akan muncul lagi (karena `_pinPromptSkippedThisSession` tidak di-set).
- Ini safe behavior — user tidak terjebak di loop karena masih bisa "Lewati".

---

## Acceptance Criteria Checklist (Untuk Verifikasi)

### Cashier
- [ ] Login dengan `hasPin=false` → tampil `PinSetupPromptScreen` bukan langsung `/setup-pin`
- [ ] Tap "Lewati" → masuk `/home`, FCM/Pusher tetap jalan
- [ ] Tap "Lewati", navigasi Home normal, tidak muncul prompt lagi dalam session ini
- [ ] App restart / cold start dengan `/auth/me` `hasPin=false` → prompt muncul lagi
- [ ] Tap "Setting sekarang" → buka `/setup-pin` → `/confirm-pin` → setup berhasil → `/home`
- [ ] Login dengan `hasPin=true` → langsung `/home`
- [ ] Employee tanpa `hasOrderViewPermission` → `/access-denied` (bukan prompt PIN)
- [ ] Settings → PIN Security tetap berfungsi
- [ ] Remembered account `hasPin=false` tidak bisa PIN entry untuk quick switch
- [ ] `Lewati` tidak mengubah backend PIN state

### Production
- [ ] Login dengan `hasPin=false` dan permission valid → tampil `PinSetupPromptScreen`
- [ ] Tap "Lewati" → masuk `/home`, FCM/Pusher tetap jalan
- [ ] Bootstrap token dengan `hasPin=false` → prompt muncul lagi
- [ ] Tap "Setting sekarang" → flow setup PIN → berhasil → `/home`
- [ ] Login dengan `hasPin=true` → langsung `/home`
- [ ] Employee tanpa permission production/courier → `/no-permission` (bukan prompt PIN)

### Backend
- [ ] `POST /mobile/production/auth/pin/setup` berfungsi dengan token valid
- [ ] Response login/me tetap membawa field `hasPin`
- [ ] Response setup PIN berhasil membawa `hasPin: true`
- [ ] Setup gagal tidak mengubah PIN hash
- [ ] Response tidak membocorkan `pin_hash`

---

## File Summary

### Backend
| File | Action | Keterangan |
|------|--------|------------|
| `webapp/wash_wallet_be/routes/api_mobile_production.php` | MODIFY | Tambah route `pin/setup`, `pin/reset`, `pin/verify` |

### Cashier App
| File | Action | Keterangan |
|------|--------|------------|
| `apps/cashier/lib/features/auth/presentation/bloc/auth_state.dart` | MODIFY | Tambah `AuthPinSetupPrompt` state |
| `apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart` | MODIFY | Ubah `_handleAuthSuccess()`, tambah `skipPinSetup()`, tambah flag |
| `apps/cashier/lib/core/router/app_router.dart` | MODIFY | Tambah redirect `AuthPinSetupPrompt`, tambah route `/pin-setup-prompt` |
| `apps/cashier/lib/features/auth/presentation/screens/pin_setup_prompt_screen.dart` | **NEW** | Screen interstitial prompt PIN opsional |

### Production App
| File | Action | Keterangan |
|------|--------|------------|
| `apps/production/lib/features/auth/presentation/bloc/auth_state.dart` | MODIFY | Tambah `AuthPinSetupPrompt` state |
| `apps/production/lib/features/auth/presentation/bloc/auth_cubit.dart` | MODIFY | Refactor dengan `_handleAuthSuccess()`, `skipPinSetup()`, `setupPin()` |
| `apps/production/lib/features/auth/presentation/providers/auth_provider.dart` | MODIFY | Inject `SetupPinUseCase` |
| `apps/production/lib/core/router/app_router.dart` | MODIFY | Tambah redirect dan routes PIN |
| `apps/production/lib/features/auth/presentation/screens/pin_setup_prompt_screen.dart` | **NEW** | Screen interstitial prompt PIN opsional |
| `apps/production/lib/features/auth/presentation/screens/setup_pin_screen.dart` | **NEW** | Copy + adapt dari Cashier |
| `apps/production/lib/features/auth/presentation/screens/confirm_pin_screen.dart` | **NEW** | Copy + adapt dari Cashier |
| `apps/production/lib/features/auth/presentation/widgets/pin_box_input.dart` | **NEW** | Copy dari Cashier |

---

## Catatan untuk Implementor

1. **Tidak ada perubahan di `packages/wash_wallet_domain` atau `packages/wash_wallet_data`** — semua use case dan repository yang dibutuhkan sudah ada.

2. **`AuthSetupPinRequired` tidak dihapus** dari Cashier auth state. Jika ada kode di luar `_handleAuthSuccess()` yang menggunakannya, periksa agar tidak konflik dengan flow baru.

3. **Production `AuthCubit`** saat ini tidak memiliki pattern `_handleAuthSuccess()` — perlu dibuat fresh. Pastikan `_onAuthenticated(employee)` tetap dipanggil baik dari `skipPinSetup()` maupun dari path normal (jika `hasPin=true`).

4. **Jalankan `flutter analyze` setelah setiap komponen selesai** untuk deteksi error sintaks lebih awal.

5. **Tidak ada widget baru di `packages/wash_wallet_ui`** yang perlu dibuat — PIN box input dan screen tetap app-local.

6. **Verifikasi endpoint production:** Pastikan `AuthRemoteDatasource` yang dipakai production dikonfigurasi dengan base URL yang tepat sehingga `setupPin()` memanggil `POST /mobile/production/auth/pin/setup`, bukan `/mobile/cashier/auth/pin/setup`.
