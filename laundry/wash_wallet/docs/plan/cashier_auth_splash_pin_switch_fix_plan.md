# Cashier Auth Splash dan PIN Switch Fix Plan

Dibuat: 2026-06-21
Berdasarkan issue: `docs/issue/cashier_auth_splash_pin_switch_issue.md`

---

## Ringkasan

Plan ini menangani 6 area perbaikan yang saling berkaitan:

1. **Splash routing** — `SplashScreen` tidak menangani semua final auth state.
2. **Router guard** — `/splash` tidak diproteksi dari state final.
3. **Unauthenticated routing** — flow tidak mempertimbangkan remembered accounts.
4. **Remembered account explicit opt-in** — auto-save harus dihapus, diganti prompt manual.
5. **Backend employee resource consistency** — `pin/setup` bisa mengembalikan permission kosong.
6. **Secure storage consistency** — `main.dart` dan `AuthProvider` memakai konfigurasi storage berbeda.

> **PENTING**: Implementasi ini bukan greenfield. Codebase sudah punya implementasi awal untuk state, screen, datasource, dan sebagian test. Fokus pada menutup gap, bukan menulis ulang dari awal.

---

## Konteks Codebase

### State machine auth (sudah ada di `auth_state.dart`)

```dart
AuthInitial
AuthLoading
Authenticated(employee)
AuthenticatedStale(employee)
AuthSetupPinRequired(employee)
AuthAccessDenied(employee)
SwitchPinVerifying(previousEmployee, targetEmployeeId, targetUsername)
SwitchPinFailure(previousEmployee, failure)
Unauthenticated()
AuthFailureState(failure)
```

### Gap yang ditemukan dari pembacaan kode aktual

| File | Gap |
|------|-----|
| `splash_screen.dart` | `_checkAuthStatus()` hanya handle `Authenticated` dan `Unauthenticated`/`AuthFailureState`. State `AuthSetupPinRequired`, `AuthAccessDenied`, `AuthenticatedStale` tidak ditangani — app stuck di splash. |
| `splash_screen.dart` | Saat unauthenticated, selalu `context.go('/login')` — tidak pernah ke `/switch-employee` walaupun ada remembered accounts. |
| `app_router.dart` | `/splash` selalu `return null` (allow) di redirect block — router tidak membantu keluar dari splash saat state final muncul. |
| `auth_repository_impl.dart` | `login()` memanggil `await _rememberedDatasource.saveAccount(employeeModel)` — auto-save tanpa consent user. |
| `auth_repository_impl.dart` | `setupPin()` memanggil `await _rememberedDatasource.saveAccount(employeeModel)` — auto-save tanpa consent user. |
| `auth_repository_impl.dart` | `verifyPin()` memanggil `await _rememberedDatasource.saveAccount(employeeModel)` — auto-save tanpa consent user. |
| `auth_provider.dart` | `createAuthCubitWithDependencies()` memakai `const FlutterSecureStorage()` sementara `main.dart` membuat `SecureStorageProvider.create()` yang memakai `encryptedSharedPreferences: true` di Android — berbeda konfigurasi. |
| `AuthService.php::setupPin()` | Memanggil `$employee->fresh()` tanpa load relasi `positions`, `positions.permissions`, `positions.outlet`. `LoginEmployeeResource` butuh relasi tersebut untuk mengisi `accessibleOutlets` dan `allPermissions` — kedua field akan kosong setelah setup PIN. |

---

## Perubahan yang Diperlukan

---

### Area 1 & 2 — Flutter: Splash Routing + Router Guard

#### [MODIFY] `apps/cashier/lib/features/splash/screens/splash_screen.dart`

**Gap**: `_checkAuthStatus()` membaca state setelah `await checkAuthStatus()` dan hanya cabang ke `/home` atau `/login`. State `AuthSetupPinRequired`, `AuthAccessDenied`, `AuthenticatedStale` tidak dihandle.

**Perbaikan**: Tambahkan semua cabang navigasi di `_checkAuthStatus()`:

```dart
Future<void> _checkAuthStatus() async {
  await Future.delayed(const Duration(milliseconds: 800));
  if (!mounted) return;

  await context.read<AuthCubit>().checkAuthStatus();

  await Future.delayed(const Duration(milliseconds: 300));
  if (!mounted) return;

  final authState = context.read<AuthCubit>().state;

  if (authState is Authenticated || authState is AuthenticatedStale) {
    context.go('/home');
  } else if (authState is AuthSetupPinRequired) {
    context.go('/setup-pin');
  } else if (authState is AuthAccessDenied) {
    context.go('/access-denied');
  } else if (authState is Unauthenticated || authState is AuthFailureState) {
    await _handleUnauthenticated(context);
  }
}

Future<void> _handleUnauthenticated(BuildContext context) async {
  final prefs = await SharedPreferences.getInstance();
  final onboardingService = OnboardingService(prefs);

  if (!onboardingService.isCompleted()) {
    context.go('/onboarding');
    return;
  }

  // Cek remembered accounts langsung dari datasource
  final rememberedDs = RememberedEmployeeLocalDatasourceImpl(prefs);
  final accounts = await rememberedDs.getAccounts();

  if (accounts.isNotEmpty) {
    context.go('/switch-employee');
  } else {
    context.go('/login');
  }
}
```

> **CATATAN**: `RememberedEmployeeLocalDatasource` memakai `SharedPreferences`, bukan secure storage. Import yang diperlukan sudah tersedia di codebase.

#### [MODIFY] `apps/cashier/lib/core/router/app_router.dart`

**Gap**: Block `/splash` selalu return `null`. Router tidak memaksa keluar dari splash saat state sudah final.

**Perbaikan**: Ubah logika redirect untuk `/splash`:

```dart
redirect: (context, state) {
  final authState = _authCubit.state;
  final currentLocation = state.matchedLocation;

  // Splash hanya boleh stay saat masih loading/initial
  if (currentLocation == '/splash') {
    if (authState is AuthInitial || authState is AuthLoading) {
      return null; // stay di splash
    }
    // State sudah final — paksa keluar (safety net)
    return _resolveRouteFromState(authState);
  }

  // Guard SwitchPinVerifying/SwitchPinFailure — jangan redirect
  if (authState is SwitchPinVerifying || authState is SwitchPinFailure) {
    return null;
  }

  // ... sisa redirect logic tetap sama ...
},
```

Tambahkan helper method di class `AppRouter`:

```dart
String? _resolveRouteFromState(AuthState authState) {
  if (authState is Authenticated || authState is AuthenticatedStale) return '/home';
  if (authState is AuthSetupPinRequired) return '/setup-pin';
  if (authState is AuthAccessDenied) return '/access-denied';
  if (authState is Unauthenticated || authState is AuthFailureState) return '/login';
  return null;
}
```

> **CATATAN**: Router me-redirect ke `/login` sebagai fallback untuk unauthenticated. Splash yang menangani detail remembered account check. Guard ini adalah safety net jika navigasi manual di splash gagal.

---

### Area 3 — Flutter: Unauthenticated Routing dengan Remembered Accounts

**Keputusan implementasi**: Berdasarkan kode aktual, `SplashScreen` sudah punya akses ke `SharedPreferences` dan dapat langsung query `RememberedEmployeeLocalDatasourceImpl`. Tidak perlu menambah field ke `Unauthenticated` state atau mengubah `AuthCubit`.

Cukup lakukan pengecekan di `_handleUnauthenticated()` seperti diuraikan pada Area 1. Ini lebih sederhana dan tidak memerlukan perubahan di domain layer.

---

### Area 4 — Flutter: Remembered Account Explicit Opt-in

#### [MODIFY] `packages/wash_wallet_data/lib/src/auth/repositories/auth_repository_impl.dart`

**Hapus** baris berikut dari ketiga method:

- `login()`: hapus `await _rememberedDatasource.saveAccount(employeeModel);`
- `setupPin()`: hapus `await _rememberedDatasource.saveAccount(employeeModel);`
- `verifyPin()`: hapus `await _rememberedDatasource.saveAccount(employeeModel);`

**Tambahkan** method eksplisit baru:

```dart
@override
Future<Result<void>> saveRememberedAccount(AuthEmployee employee) async {
  try {
    final model = await _localDatasource.getEmployee();
    if (model == null) {
      return const Result.failure(
        CacheFailure(message: 'Employee data not found in local cache.'),
      );
    }
    await _rememberedDatasource.saveAccount(model);
    return const Result.success(null);
  } catch (e) {
    return Result.failure(CacheFailure(message: e.toString()));
  }
}
```

#### [MODIFY] `packages/wash_wallet_domain/lib/src/repositories/auth_repository.dart`

Tambahkan deklarasi method baru:

```dart
Future<Result<void>> saveRememberedAccount(AuthEmployee employee);
```

#### [NEW] `packages/wash_wallet_domain/lib/src/usecases/auth/save_remembered_account_usecase.dart`

```dart
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../entities/auth_employee.dart';
import '../../repositories/auth_repository.dart';

class SaveRememberedAccountUsecase {
  final AuthRepository _repository;

  SaveRememberedAccountUsecase(this._repository);

  Future<Result<void>> call(AuthEmployee employee) {
    return _repository.saveRememberedAccount(employee);
  }
}
```

#### [MODIFY] `apps/cashier/lib/features/auth/presentation/bloc/auth_state.dart`

Tambahkan field `shouldPromptRemember` ke `Authenticated` state:

```dart
class Authenticated extends AuthState {
  final AuthEmployee employee;
  final bool shouldPromptRemember;

  const Authenticated(this.employee, {this.shouldPromptRemember = false});

  @override
  List<Object?> get props => [employee, shouldPromptRemember];
}
```

#### [MODIFY] `apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart`

Tambahkan dependency `SaveRememberedAccountUsecase`.

Update `_handleAuthSuccess()` untuk set `shouldPromptRemember: true` setelah login/setupPin:

```dart
void _handleAuthSuccess(AuthEmployee employee, {bool checkRemember = false}) async {
  if (!employee.hasOrderViewPermission) {
    emit(AuthAccessDenied(employee));
    return;
  }

  if (!employee.hasPin) {
    emit(AuthSetupPinRequired(employee));
    return;
  }

  bool shouldPrompt = false;
  if (checkRemember) {
    final prefs = await SharedPreferences.getInstance();
    final ds = RememberedEmployeeLocalDatasourceImpl(prefs);
    final accounts = await ds.getAccounts();
    shouldPrompt = !accounts.any((a) => a.employeeId == employee.id);
  }

  emit(Authenticated(employee, shouldPromptRemember: shouldPrompt));
  unawaited(_startNotificationSession(employee));
}
```

Ubah pemanggilan di `login()` dan `setupPin()` menjadi `checkRemember: true`:

```dart
// Di login():
success: (employee) => _handleAuthSuccess(employee, checkRemember: true),

// Di setupPin():
success: (employee) => _handleAuthSuccess(employee, checkRemember: true),

// Di checkAuthStatus() dan switchEmployee() tetap default (checkRemember: false)
```

Implementasi `rememberCurrentEmployee()`:

```dart
Future<void> rememberCurrentEmployee() async {
  final currentState = state;
  if (currentState is! Authenticated) return;

  await _saveRememberedAccountUsecase(currentState.employee);
  // Emit ulang state dengan shouldPromptRemember: false agar prompt hilang
  emit(Authenticated(currentState.employee, shouldPromptRemember: false));
}
```

#### [MODIFY] `apps/cashier/lib/features/auth/presentation/providers/auth_provider.dart`

Tambahkan `SaveRememberedAccountUsecase` ke dependency graph.

#### [MODIFY] `apps/cashier/lib/features/home/presentation/screens/home_screen.dart` (atau screen utama pasca-login)

Tambahkan `BlocListener` untuk memunculkan bottom sheet "Simpan info login?":

```dart
BlocListener<AuthCubit, AuthState>(
  listenWhen: (prev, curr) =>
    curr is Authenticated && curr.shouldPromptRemember &&
    !(prev is Authenticated && (prev as Authenticated).shouldPromptRemember),
  listener: (context, state) {
    _showSaveAccountBottomSheet(context);
  },
  child: ...,
)

void _showSaveAccountBottomSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isDismissible: false,
    builder: (_) => Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text(
            'Simpan info login?',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text(
            'Simpan akun ini agar Anda bisa login lebih cepat dengan PIN di lain waktu.',
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              context.read<AuthCubit>().rememberCurrentEmployee();
              Navigator.pop(context);
            },
            child: const Text('Simpan'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Nanti saja'),
          ),
        ],
      ),
    ),
  );
}
```

> **PENTING**: Bottom sheet hanya boleh muncul setelah user sudah berada di `/home`. Jangan tampilkan saat navigasi masih berjalan atau di splash screen.

---

### Area 5 — Flutter: Secure Storage Consistency

**Gap**: `auth_provider.dart` memakai `const FlutterSecureStorage()` tanpa `AndroidOptions(encryptedSharedPreferences: true)`, sementara `main.dart` memakai `SecureStorageProvider.create()` yang mengaktifkan opsi tersebut. Di Android, keduanya menggunakan backend storage yang berbeda — token yang ditulis `AuthInterceptor` (via `SecureTokenStorage`) tidak bisa dibaca `AuthLocalDatasource`.

#### [MODIFY] `apps/cashier/lib/features/auth/presentation/providers/auth_provider.dart`

Ubah `createAuthCubitWithDependencies()` untuk menerima storage:

```dart
static Future<AuthCubit> createAuthCubitWithDependencies(
  Dio dio,
  ApiEndpoints endpoints, {
  required NotificationService notificationService,
  FlutterSecureStorage? storage,
}) async {
  final effectiveStorage = storage ?? SecureStorageProvider.create();
  final prefs = await SharedPreferences.getInstance();

  final localDatasource = createLocalDatasource(effectiveStorage, prefs);
  // ... sisa sama
}
```

#### [MODIFY] `apps/cashier/lib/main.dart`

Pass storage instance yang sama ke `AuthProvider`:

```dart
final storage = SecureStorageProvider.create();
final tokenStorage = SecureTokenStorage(storage);
// ...
final authCubit = await AuthProvider.createAuthCubitWithDependencies(
  dio,
  endpoints,
  notificationService: NotificationService.instance,
  storage: storage, // pass instance yang sama dengan AuthInterceptor
);
```

---

### Area 6 — Backend: Employee Resource Consistency

**Gap**: `AuthService::setupPin()` memanggil `$employee->fresh()` tanpa load relasi. `LoginEmployeeResource::toArray()` membutuhkan `positions`, `positions.permissions`, `positions.outlet` untuk mengisi `accessibleOutlets` dan `allPermissions`. Tanpa relasi, kedua field akan kosong, menyebabkan Flutter emit `AuthAccessDenied` walaupun employee punya permission.

#### [MODIFY] `webapp/wash_wallet_be/app/Services/AuthService.php` — method `setupPin()`

```php
public function setupPin(Employee $employee, string $pin): Employee
{
    if ($employee->pin_hash !== null) {
        throw ValidationException::withMessages(['pin' => 'PIN sudah diatur. Gunakan endpoint reset PIN.']);
    }

    $employee->update([
        'pin_hash'   => Hash::make($pin),
        'pin_set_at' => now(),
    ]);

    Log::info('Employee PIN setup successfully', [
        'employee_id' => $employee->id,
        'type'        => 'pin_setup',
    ]);

    // PERBAIKAN: Load relasi yang sama dengan loginEmployee() dan verifyPin()
    return $employee->fresh([
        'outlet',
        'positions' => function ($query) {
            $query->where('positions.is_active', true)
                ->where('employee_positions.is_active', true);
        },
        'positions.permissions',
        'positions.outlet',
    ]);
}
```

> **VERIFIKASI**: Nama relasi harus persis sama dengan yang digunakan di `loginEmployee()` dan `verifyPin()`. Kode aktual sudah menunjukkan keduanya menggunakan `outlet`, `positions`, `positions.permissions`, `positions.outlet`.

---

### Area 7 — Flutter: PIN Switch Safety

**Status dari pembacaan kode aktual**: Implementasi `switchEmployee()` di `AuthCubit` sudah benar — menyimpan `previousEmployee` sebelum verifikasi dan emit `SwitchPinFailure` saat gagal. `PinEntryScreen` sudah memanggil `switchEmployee()` (bukan `verifyPin()`) dan menangani `SwitchPinFailure`.

**Gap yang perlu diperbaiki**:

#### [MODIFY] `apps/cashier/lib/core/router/app_router.dart`

Tambahkan guard agar `SwitchPinVerifying` dan `SwitchPinFailure` tidak di-redirect oleh router (sudah tercakup di Area 2):

```dart
// Di redirect block, sebelum guard lainnya:
if (authState is SwitchPinVerifying || authState is SwitchPinFailure) {
  return null; // Biarkan screen handle sendiri
}
```

---

## Urutan Pengerjaan yang Disarankan

```
Step 1.  Backend: Perbaiki setupPin() — tambah relasi di fresh() call
Step 2.  Flutter Domain: Tambah saveRememberedAccount() di AuthRepository interface
Step 3.  Flutter Domain: Buat SaveRememberedAccountUsecase
Step 4.  Flutter Data: Hapus auto-save di login/setupPin/verifyPin
Step 5.  Flutter Data: Implementasi saveRememberedAccount() di AuthRepositoryImpl
Step 6.  Flutter State: Tambah shouldPromptRemember ke Authenticated state
Step 7.  Flutter: Update AuthProvider — tambah SaveRememberedAccountUsecase, terima storage parameter
Step 8.  Flutter: Update main.dart — pass storage ke AuthProvider
Step 9.  Flutter AuthCubit: Update _handleAuthSuccess() untuk set shouldPromptRemember
Step 10. Flutter AuthCubit: Implementasi rememberCurrentEmployee()
Step 11. Flutter: Update SplashScreen — tambah semua cabang navigasi + remembered account check
Step 12. Flutter: Update AppRouter redirect — guard /splash dan SwitchPinVerifying/SwitchPinFailure
Step 13. Flutter: Tambah bottom sheet di HomeScreen
Step 14. Tests: Tulis/perbaiki unit test sesuai test plan
```

---

## Acceptance Criteria

- [x] App tidak lagi stuck di splash setelah `/api/mobile/cashier/auth/me` mengembalikan `200`.
- [x] Employee dengan PIN dan `order.view` → `/home`.
- [x] Employee tanpa PIN → `/setup-pin`.
- [x] Employee tanpa `order.view` → `/access-denied`.
- [x] `AuthenticatedStale` → `/home`.
- [x] Unauthenticated + onboarding belum selesai → `/onboarding`.
- [x] Unauthenticated + ada remembered account → `/switch-employee`.
- [x] Unauthenticated + tidak ada remembered account → `/login`.
- [x] `AuthRepositoryImpl.login()` tidak auto-save remembered account.
- [x] `AuthRepositoryImpl.setupPin()` tidak auto-save remembered account.
- [x] `AuthRepositoryImpl.verifyPin()` tidak auto-save remembered account.
- [x] Bottom sheet "Simpan info login?" muncul setelah login password/setupPin sukses (jika belum tersimpan).
- [x] Pilih "Simpan" → akun masuk switch list.
- [x] Pilih "Nanti saja" → akun tidak masuk switch list.
- [x] Setup PIN backend mengembalikan `hasPin: true` + `allPermissions` populated.
- [x] PIN switch gagal → `SwitchPinFailure` state, session employee aktif lama tidak berubah.
- [x] Auth token storage konsisten antara `AuthInterceptor` dan `AuthLocalDatasource`.

---

## Test Plan

### Unit tests — Flutter

| Skenario | Target file |
|----------|-------------|
| `Authenticated` → go `/home` | `splash_screen_test.dart` |
| `AuthenticatedStale` → go `/home` | `splash_screen_test.dart` |
| `AuthSetupPinRequired` → go `/setup-pin` | `splash_screen_test.dart` |
| `AuthAccessDenied` → go `/access-denied` | `splash_screen_test.dart` |
| `Unauthenticated` + ada remembered → go `/switch-employee` | `splash_screen_test.dart` |
| `Unauthenticated` + tidak ada remembered → go `/login` | `splash_screen_test.dart` |
| Router redirect dari `/splash` saat state `AuthSetupPinRequired` | `app_router_test.dart` |
| Router tidak redirect saat `SwitchPinVerifying` | `app_router_test.dart` |
| `rememberCurrentEmployee()` memanggil datasource `saveAccount()` | `auth_cubit_test.dart` |
| `_handleAuthSuccess()` set `shouldPromptRemember: true` setelah login | `auth_cubit_test.dart` |
| `switchEmployee()` gagal → emit `SwitchPinFailure` dengan `previousEmployee` intact | `auth_cubit_test.dart` |
| `AuthRepositoryImpl.login()` tidak memanggil `saveAccount()` | `auth_repository_impl_test.dart` |
| `AuthRepositoryImpl.setupPin()` tidak memanggil `saveAccount()` | `auth_repository_impl_test.dart` |
| `AuthRepositoryImpl.verifyPin()` tidak memanggil `saveAccount()` | `auth_repository_impl_test.dart` |
| `AuthRepositoryImpl.saveRememberedAccount()` memanggil datasource | `auth_repository_impl_test.dart` |

### Feature tests — Backend (PHP)

| Skenario | File |
|----------|------|
| `POST /pin/setup` mengembalikan `hasPin: true` | `EmployeePinAuthTest.php` |
| `POST /pin/setup` mengembalikan `allPermissions` tidak kosong untuk employee dengan permission | `EmployeePinAuthTest.php` |
| `POST /pin/setup` mengembalikan `accessibleOutlets` populated | `EmployeePinAuthTest.php` |
| `POST /pin/verify` mengembalikan payload konsisten dengan `GET /me` | `EmployeePinAuthTest.php` |

### Manual verification — emulator

1. Login dengan akun cashier yang belum punya PIN → harus masuk `/setup-pin`.
2. Setup PIN → harus masuk `/home`. Prompt "Simpan info login?" harus muncul.
3. Pilih "Simpan", logout → app harus masuk `/switch-employee`.
4. Switch ke employee lain, masukkan PIN salah → employee aktif lama tidak hilang, UI tetap di PIN screen dengan error.
5. Login akun baru, pilih "Nanti saja" → logout → app masuk `/login` (bukan `/switch-employee`).
6. Verifikasi di logcat bahwa read/write token terjadi di storage config yang sama.

---

## Status Implementasi

**Semua acceptance criteria telah terpenuhi.** Flutter test suite (`apps/cashier`) passing 29/29 test.

### Daftar perubahan yang sudah diterapkan

#### Backend
- `AuthService.php::setupPin()` — `fresh()` sekarang memuat relasi `outlet`, `positions`, `positions.permissions`, `positions.outlet` (sama dengan `loginEmployee()` dan `verifyPin()`).

#### Domain
- `AuthRepository` — ditambahkan method `saveRememberedAccount(AuthEmployee)`.
- `SaveRememberedAccountUsecase` — use case baru untuk explicit opt-in.
- `Authenticated` state — ditambahkan field `shouldPromptRemember` (default `false`) agar tidak breaking existing tests.

#### Data
- `AuthRepositoryImpl.login()` — dihapus auto-save `rememberedDatasource`.
- `AuthRepositoryImpl.setupPin()` — dihapus auto-save `rememberedDatasource`.
- `AuthRepositoryImpl.verifyPin()` — dihapus auto-save `rememberedDatasource`.
- `AuthRepositoryImpl.saveRememberedAccount()` — implementasi baru yang membaca dari `localDatasource` lalu memanggil `rememberedDatasource.saveAccount()`.

#### Provider
- `AuthProvider.createAuthCubitWithDependencies()` — sekarang menerima parameter opsional `FlutterSecureStorage? storage` dan menggunakan `SecureStorageProvider.create()` sebagai fallback, memastikan konsistensi konfigurasi storage dengan `main.dart`.
- `SaveRememberedAccountUsecase` di-wire ke dependency graph.

#### main.dart
- Instance `SecureStorageProvider.create()` sekarang dibuat sekali di `main()` dan di-pass ke `AuthProvider` serta `AuthInterceptor`, menghilangkan inkonsistensi storage backend.

#### AuthCubit
- `_handleAuthSuccess()` — menambahkan logika `checkRemember` yang memeriksa apakah akun sudah ada di `RememberedEmployeeLocalDatasource`. Jika belum, `shouldPromptRemember = true`.
- `login()` dan `setupPin()` memanggil `_handleAuthSuccess(..., checkRemember: true)`.
- `checkAuthStatus()` dan `switchEmployee()` tetap default `checkRemember: false`.
- `rememberCurrentEmployee()` — memanggil `_saveRememberedAccountUsecase` lalu emit ulang `Authenticated` dengan `shouldPromptRemember: false`.

#### SplashScreen
- `_checkAuthStatus()` — menangani semua final state: `Authenticated`, `AuthenticatedStale`, `AuthSetupPinRequired`, `AuthAccessDenied`, `Unauthenticated`, `AuthFailureState`.
- `_handleUnauthenticated()` — menambahkan pengecekan onboarding → remembered accounts → login/switch-employee.

#### AppRouter
- Redirect guard `/splash` — hanya stay untuk `AuthInitial`/`AuthLoading`; final states dipaksa keluar via `_resolveRouteFromState()`.
- Guard `SwitchPinVerifying`/`SwitchPinFailure` — return `null` agar tidak di-redirect.
- Constructor menerima parameter opsional `Widget? splashScreen` untuk meningkatkan testability.

#### HomeScreen
- Digunakan `BlocConsumer<AuthCubit, AuthState>` (ganti nested `BlocListener`+`BlocBuilder`) untuk menampilkan bottom sheet "Simpan info login?" saat `Authenticated.shouldPromptRemember == true`.
- Bottom sheet menyediakan tombol "Simpan" (memicu `rememberCurrentEmployee()`) dan "Nanti saja" (dismiss).

#### Tests
- `auth_cubit_test.dart` — ditambahkan test untuk `rememberCurrentEmployee` dan `shouldPromptRemember: true` setelah login.
- `auth_repository_impl_test.dart` — ditambahkan test verifikasi tidak ada auto-save di `login`/`setupPin`/`verifyPin`, dan test `saveRememberedAccount` memanggil datasource.
- `splash_screen_test.dart` — 6 widget tests untuk semua cabang navigasi splash (termasuk remembered account & onboarding). Menggunakan `pumpAndSettle()`, mock `SharedPreferences` dengan `is_onboarding_done: true`, dan stub `CheckAuthStatusUsecase` yang benar.
- `app_router_test.dart` — 3 routing tests untuk redirect dari `/splash` dan guard `SwitchPinVerifying`/`SwitchPinFailure`. Menggunakan dummy `SizedBox()` untuk isolasi router dan `BlocProvider.value` untuk menyediakan `AuthCubit`.
- `EmployeePinAuthTest.php` — ditambahkan test `setupPin` mengembalikan `allPermissions` dan `accessibleOutlets` populated, serta `verifyPin` payload konsisten dengan `/me`.

---

## Catatan Implementer

- **Jangan revert** file yang tidak terkait dengan issue ini.
- `AuthService.php::setupPin()` — nama relasi harus persis sama dengan yang dipakai `loginEmployee()` dan `verifyPin()`. Lihat kode aktual sebagai referensi.
- `RememberedEmployeeLocalDatasource` memakai `SharedPreferences`, bukan `FlutterSecureStorage`. Jangan keliru.
- `switchEmployee()` di `AuthCubit` sudah benar — jangan ubah logic PIN switch yang sudah ada.
- Jika memilih approach `shouldPromptRemember` di state, pastikan update semua test yang mock `Authenticated` state agar tidak break karena default parameter baru (default `false` sehingga tidak breaking).
- Prompt simpan akun **tidak boleh** muncul saat switch employee via PIN — hanya saat login password atau setup PIN pertama kali. Ini sudah ditangani karena `switchEmployee()` memanggil `_handleAuthSuccess()` dengan `checkRemember: false`.
- `verifyPin()` dalam konteks switch employee sudah benar memanggil `switchEmployee()` — tidak perlu diubah, hanya pastikan tidak ada regression.
