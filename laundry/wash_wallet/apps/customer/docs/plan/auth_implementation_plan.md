# Customer Auth — Flutter Implementation Plan

## Latar Belakang

Backend autentikasi customer sudah selesai dan siap diintegrasikan (lihat `docs/context/customer_auth_context.md`). Saat ini di sisi Flutter sudah ada pondasi awal berupa:

- `CustomerAuthCubit` + `CustomerAuthState` (hanya OTP flow sederhana)
- `LoginScreen` (input nomor HP → kirim OTP)
- `OtpScreen` (input OTP → verify)
- `CustomerAuthRepository` interface + `CustomerAuthRepositoryImpl`
- Usecase: `RequestOtpUsecase`, `VerifyOtpUsecase`, `CheckCustomerAuthStatusUsecase`, `CustomerLogoutUsecase`

Namun terdapat **gap** signifikan yang perlu dipenuhi agar flow lengkap bisa berjalan:

| Gap | Keterangan |
|-----|------------|
| Intent OTP | `requestOtp` tidak mengirim `intent` ("register"/"login") — backend wajib menerimanya |
| Response parsing | `verifyOtp` membaca key `account`, padahal backend mengembalikan `customer` |
| Register flow | Belum ada usecase, screen, dan routing untuk `POST /auth/register` |
| Login Password | Belum ada usecase, screen, dan routing untuk `POST /auth/login-password` |
| State machine | `CustomerAuthOtpVerifiedNewUser` belum ada — dibutuhkan untuk routing ke `RegisterScreen` |
| Entity / Model | `CustomerAccount` belum memiliki field `email`, `gender`, `dateOfBirth` |

---

## Keputusan Desain

✅ **`email`, `gender`, `dateOfBirth`** — Disimpan di `CustomerAccount` entity dan model. Perlu update Freezed + `build_runner`.

✅ **OTP Timer & Resend** — `OtpScreen` akan menampilkan countdown 5 menit dan tombol "Kirim Ulang OTP" yang aktif setelah timer habis.

✅ **Login Screen default OTP** — `LoginScreen` hanya menampilkan input nomor HP dan tombol "Kirim OTP". Link "Masuk dengan Password" diletakkan di `OtpScreen` sebagai alternatif, bukan di `LoginScreen`.

---

## Proposed Changes

### 1. Package `wash_wallet_domain` — Entity & Model & Interface

---

#### [MODIFY] [customer_account.dart](file:///c:/Bimo/Project/wash_wallet/packages/wash_wallet_domain/lib/src/entities/customer_account.dart)

Tambah field opsional yang dikembalikan backend tapi belum ada di entity:

```dart
// Tambahkan field berikut:
final String? email;
final String? gender;
final String? dateOfBirth;
```

#### [MODIFY] [customer_account_model.dart](file:///c:/Bimo/Project/wash_wallet/packages/wash_wallet_domain/lib/src/models/customer_account_model.dart)

Tambah field di Freezed model dan update `_normalizeJson` + `toEntity()` + `fromEntity()`:

```dart
// Field baru di @freezed class:
String? email;
String? gender;
String? dateOfBirth;

// Di _normalizeJson:
normalized['dateOfBirth'] = json['dateOfBirth'] ?? json['date_of_birth'];
```

> [!WARNING]
> Setelah edit file ini, **wajib** jalankan:
> ```
> dart run build_runner build --delete-conflicting-outputs
> ```
> di directory `packages/wash_wallet_domain` untuk regenerate file `.freezed.dart` dan `.g.dart`.

#### [MODIFY] [customer_auth_repository.dart](file:///c:/Bimo/Project/wash_wallet/packages/wash_wallet_domain/lib/src/repositories/customer_auth_repository.dart)

Tambah 2 method baru ke interface:

```dart
abstract class CustomerAuthRepository {
  // ... existing methods ...

  /// Register user baru setelah OTP diverifikasi
  Future<Result<CustomerAccount>> register({
    required String phone,
    required String name,
    String? email,
    String? gender,
    String? password,
    String? dateOfBirth,
    String? deviceName,
  });

  /// Login alternatif via password
  Future<Result<CustomerAccount>> loginWithPassword({
    required String phone,
    required String password,
    String? deviceName,
  });
}
```

#### [NEW] [register_usecase.dart](file:///c:/Bimo/Project/wash_wallet/packages/wash_wallet_domain/lib/src/usecases/customer_auth/register_usecase.dart)

```dart
class RegisterUsecase {
  final CustomerAuthRepository _repository;
  RegisterUsecase(this._repository);

  Future<Result<CustomerAccount>> call({
    required String phone,
    required String name,
    String? email,
    String? gender,
    String? password,
    String? dateOfBirth,
    String? deviceName,
  }) async {
    return await _repository.register(
      phone: phone, name: name, email: email, gender: gender,
      password: password, dateOfBirth: dateOfBirth, deviceName: deviceName,
    );
  }
}
```

#### [NEW] [login_with_password_usecase.dart](file:///c:/Bimo/Project/wash_wallet/packages/wash_wallet_domain/lib/src/usecases/customer_auth/login_with_password_usecase.dart)

```dart
class LoginWithPasswordUsecase {
  final CustomerAuthRepository _repository;
  LoginWithPasswordUsecase(this._repository);

  Future<Result<CustomerAccount>> call({
    required String phone,
    required String password,
    String? deviceName,
  }) async {
    return await _repository.loginWithPassword(
      phone: phone, password: password, deviceName: deviceName,
    );
  }
}
```

#### [MODIFY] [wash_wallet_domain.dart](file:///c:/Bimo/Project/wash_wallet/packages/wash_wallet_domain/lib/wash_wallet_domain.dart)

Export 2 usecase baru:

```dart
export 'src/usecases/customer_auth/register_usecase.dart';
export 'src/usecases/customer_auth/login_with_password_usecase.dart';
```

---

### 2. Package `wash_wallet_data` — Datasource & Repository Impl

---

#### [MODIFY] [auth_remote_datasource.dart](file:///c:/Bimo/Project/wash_wallet/packages/wash_wallet_data/lib/src/auth/datasources/auth_remote_datasource.dart)

**Perbaikan bug:**
1. `requestOtp` — tambah parameter `intent` (wajib dikirim ke backend)
2. `verifyOtp` — perbaiki key parsing dari `account` → `customer`; handle `new_user` (tidak ada token)
3. **Tambah method baru:**
   - `registerCustomer(...)` — hit `POST /auth/register`
   - `loginWithPassword(...)` — hit `POST /auth/login-password`

```dart
// Abstract class — perbaiki signature & tambah method baru
abstract class AuthRemoteDatasource {
  // FIX: tambah intent
  Future<void> requestOtp(String phone, {required String intent});

  // FIX: parse key 'customer', handle new_user (no token)
  Future<({String? token, CustomerAccountModel? customer, String status, String phone})>
      verifyOtp({required String phone, required String otp});

  Future<(String token, CustomerAccountModel customer)> registerCustomer({
    required String phone,
    required String name,
    String? email,
    String? gender,
    String? password,
    String? dateOfBirth,
    String? deviceName,
  });

  Future<(String token, CustomerAccountModel customer)> loginWithPassword({
    required String phone,
    required String password,
    String? deviceName,
  });
}
```

> [!IMPORTANT]
> `verifyOtp` perlu return type yang berbeda karena response berbeda untuk `new_user` (tidak ada token) vs `existing_user` (ada token + customer). Gunakan named record `({String? token, CustomerAccountModel? customer, String status, String phone})`.

#### [MODIFY] [customer_auth_repository_impl.dart](file:///c:/Bimo/Project/wash_wallet/packages/wash_wallet_data/lib/src/auth/repositories/customer_auth_repository_impl.dart)

1. Update `requestOtp()` — teruskan `intent` ke datasource
2. Update `verifyOtp()` — jika `status == 'new_user'` emit `CustomerAuthOtpVerifiedNewUser` melalui return type khusus atau Failure subclass
3. Implementasi `register()`
4. Implementasi `loginWithPassword()`

> [!IMPORTANT]
> Untuk kasus `new_user` dari `verifyOtp`, repository **tidak menyimpan token**. Cubit perlu routing ke `RegisterScreen`. **Rekomendasi:** Return `Result.success(null)` dengan `CustomerAuthOtpVerifiedNewUser(phone)` di cubit, atau buat `PendingRegistrationFailure` yang membawa `phone` untuk membedakannya dari failure lain.

---

### 3. App `wash_wallet_customer` — Presentation Layer

---

#### [MODIFY] [customer_auth_state.dart](file:///c:/Bimo/Project/wash_wallet/apps/customer/lib/features/auth/presentation/bloc/customer_auth_state.dart)

Tambah state baru:

```dart
/// Dipanggil setelah verifyOtp sukses dan backend return status: "new_user"
/// → Flutter harus routing ke RegisterScreen
class CustomerAuthOtpVerifiedNewUser extends CustomerAuthState {
  final String phone;
  const CustomerAuthOtpVerifiedNewUser(this.phone);

  @override
  List<Object?> get props => [phone];
}
```

**State machine lengkap setelah perubahan:**

```
CustomerAuthInitial
    ↓ checkAuthStatus()
CustomerAuthLoading → CustomerAuthAuthenticated | CustomerAuthUnauthenticated

CustomerAuthUnauthenticated
    ↓ requestOtp(phone, intent: "login"|"register")
CustomerAuthLoading → CustomerAuthOtpRequested(phone) | CustomerAuthError

CustomerAuthOtpRequested
    ↓ verifyOtp(phone, otp)
CustomerAuthLoading
    → CustomerAuthAuthenticated(customer)     [existing_user]
    → CustomerAuthOtpVerifiedNewUser(phone)   [new_user]
    → CustomerAuthError                       [OTP salah/expired]

CustomerAuthOtpVerifiedNewUser
    ↓ register(phone, name, ...)
CustomerAuthLoading → CustomerAuthAuthenticated | CustomerAuthError

CustomerAuthUnauthenticated
    ↓ loginWithPassword(phone, password)
CustomerAuthLoading → CustomerAuthAuthenticated | CustomerAuthError
```

#### [MODIFY] [customer_auth_cubit.dart](file:///c:/Bimo/Project/wash_wallet/apps/customer/lib/features/auth/presentation/bloc/customer_auth_cubit.dart)

Tambah dependency + method baru:

```dart
class CustomerAuthCubit extends Cubit<CustomerAuthState> {
  // tambah:
  final RegisterUsecase _register;
  final LoginWithPasswordUsecase _loginWithPassword;

  // update signature requestOtp:
  Future<void> requestOtp(String phone, {String intent = 'login'}) async { ... }

  // tambah method:
  Future<void> register({
    required String phone,
    required String name,
    String? email,
    String? gender,
    String? password,
    String? dateOfBirth,
  }) async { ... }

  Future<void> loginWithPassword({
    required String phone,
    required String password,
  }) async { ... }
}
```

#### [MODIFY] [auth_provider.dart](file:///c:/Bimo/Project/wash_wallet/apps/customer/lib/features/auth/presentation/providers/auth_provider.dart)

Inject 2 usecase baru ke `CustomerAuthCubit`.

---

#### [MODIFY] [login_screen.dart](file:///c:/Bimo/Project/wash_wallet/apps/customer/lib/features/auth/presentation/screens/login_screen.dart)

Simple entry point — hanya satu jalur: OTP. Layout menggunakan shared UI:

```
Scaffold (backgroundColor: context.colors.background)
└── SafeArea
    └── Padding(context.space.xl)
        ├── [Header] Logo/Icon + Judul "Selamat Datang" + Subtitle
        │   "Masukkan nomor WhatsApp Anda untuk melanjutkan"
        ├── AppTextField.outlined — Nomor HP (prefixIcon: Icons.phone)
        └── AppButton.primary (isFullWidth, isLoading) — "Kirim OTP"
```

**Catatan:** Tidak ada tombol "Masuk dengan Password" di halaman ini. Link tersebut ada di `OtpScreen`.

**Listener:**
- `CustomerAuthOtpRequested` → `context.go('/otp')`
- `CustomerAuthError` dengan pesan `not_found` → `AppDialog` tawaran daftar (intent: register)
- `CustomerAuthError` lainnya → `AppSnackbar.error(...)`

**Logic intent:**
- Default: kirim `requestOtp(phone, intent: 'login')`
- Jika user konfirmasi daftar dari dialog: kirim `requestOtp(phone, intent: 'register')`

#### [MODIFY] [otp_screen.dart](file:///c:/Bimo/Project/wash_wallet/apps/customer/lib/features/auth/presentation/screens/otp_screen.dart)

Update listener untuk state baru + tambah fitur OTP timer dan link login password:

```
Scaffold
├── AppBar: back → LoginScreen
└── Body: Padding(context.space.xl)
    ├── Judul "Verifikasi OTP" + info "Dikirim via WhatsApp ke $phone"
    ├── AppTextField.outlined — 6 digit OTP (keyboardType: number)
    ├── AppButton.primary (isFullWidth, isLoading) — "Verifikasi"
    ├── [Timer Row] Countdown 5:00 → setelah habis: tombol "Kirim Ulang OTP"
    ├── AppDivider — teks "atau"
    └── TextButton — "Masuk dengan Password" → context.go('/login-password')
```

**Timer countdown:**
- Gunakan `Timer.periodic` di `initState`, hitung mundur 5 menit (300 detik)
- Tampilkan format `MM:SS` di bawah tombol Verifikasi
- Saat countdown habis: tampilkan tombol `AppButton.outlined` "Kirim Ulang OTP"
- Tombol "Kirim Ulang OTP" memanggil `requestOtp(phone, intent: ...)` ulang dan reset timer

**Listener:**
```dart
if (state is CustomerAuthOtpVerifiedNewUser) {
  context.go('/register', extra: state.phone); // new_user
}
if (state is CustomerAuthAuthenticated) {
  context.go('/home'); // existing_user
}
if (state is CustomerAuthError) {
  AppSnackbar.error(context, message: state.message);
}
```

#### [NEW] [register_screen.dart](file:///c:/Bimo/Project/wash_wallet/apps/customer/lib/features/auth/presentation/screens/register_screen.dart)

Screen "Lengkapi Profil" setelah OTP diverifikasi sebagai user baru.

```
Scaffold
├── AppBar: "Lengkapi Profil" (no back — phone sudah di-OTP)
└── Body: SingleChildScrollView > Padding(context.space.xl)
    ├── Judul + subtitle (info window 5 menit)
    ├── AppTextField.outlined — Nama Lengkap* (prefixIcon: Icons.person)
    ├── AppTextField.outlined — Email (opsional, keyboardType: email)
    ├── AppDropdown — Jenis Kelamin (opsional: Pria / Wanita)
    ├── AppTextField / DatePicker — Tanggal Lahir (opsional)
    ├── AppTextField.outlined — Password (opsional, obscureText, min 6 karakter)
    ├── AppTextField.outlined — Konfirmasi Password (opsional, validasi match)
    └── AppButton.primary isFullWidth — "Daftar Sekarang"
```

- `phone` diterima via `GoRouter extra` atau dari Cubit state
- Validasi: `name` wajib, password & confirm harus cocok jika diisi
- Listener: `CustomerAuthAuthenticated` → `/home`; `CustomerAuthError` → `AppSnackbar.error`

#### [NEW] [login_password_screen.dart](file:///c:/Bimo/Project/wash_wallet/apps/customer/lib/features/auth/presentation/screens/login_password_screen.dart)

Screen login alternatif via password.

```
Scaffold
├── AppBar: "Masuk dengan Password" (back → LoginScreen)
└── Body: Padding(context.space.xl)
    ├── Judul + subtitle
    ├── AppTextField.outlined — Nomor HP (prefixIcon: Icons.phone)
    ├── AppTextField.outlined — Password (obscureText, toggle visibility)
    └── AppButton.primary isFullWidth — "Masuk"
```

- Handle 429: disable tombol + `AppSnackbar.warning("Terlalu banyak percobaan. Coba lagi nanti.")`
- Listener: `CustomerAuthAuthenticated` → `/home`; `CustomerAuthError` → `AppSnackbar.error`

---

#### [MODIFY] [app_router.dart](file:///c:/Bimo/Project/wash_wallet/apps/customer/lib/core/router/app_router.dart)

Tambah 2 route baru:

```dart
GoRoute(
  path: '/register',
  builder: (context, state) {
    final phone = state.extra as String? ?? '';
    return RegisterScreen(phone: phone);
  },
),
GoRoute(
  path: '/login-password',
  builder: (context, state) => const LoginPasswordScreen(),
),
```

Update redirect logic:

```dart
// tambah constant auth routes
final authRoutes = ['/login', '/otp', '/register', '/login-password'];
final isGoingToAuth = authRoutes.contains(state.matchedLocation);

// tambah redirect baru:
if (authState is CustomerAuthOtpVerifiedNewUser &&
    state.matchedLocation != '/register') {
  return '/register';
}
```

---

## Urutan Pengerjaan

```
1.  Domain: Update CustomerAccount entity (tambah email, gender, dateOfBirth)
2.  Domain: Update CustomerAccountModel (Freezed) → jalankan build_runner
3.  Domain: Update CustomerAuthRepository interface (tambah register + loginWithPassword)
4.  Domain: Buat RegisterUsecase
5.  Domain: Buat LoginWithPasswordUsecase
6.  Domain: Update wash_wallet_domain.dart (export 2 usecase baru)
7.  Data:   Perbaiki bug requestOtp (tambah intent) di AuthRemoteDatasource
8.  Data:   Perbaiki bug verifyOtp (key 'customer', handle new_user) di AuthRemoteDatasource
9.  Data:   Tambah registerCustomer + loginWithPassword di AuthRemoteDatasource
10. Data:   Update CustomerAuthRepositoryImpl (implement 2 method baru + perbaiki bug)
11. App:    Update CustomerAuthState (tambah CustomerAuthOtpVerifiedNewUser)
12. App:    Update CustomerAuthCubit (method baru + inject usecase baru)
13. App:    Update auth_provider.dart (inject RegisterUsecase + LoginWithPasswordUsecase)
14. App:    Refactor LoginScreen (2 jalur: OTP + Password, tombol Daftar)
15. App:    Update OtpScreen (listener state baru + UX improvements)
16. App:    Buat RegisterScreen (form complete profile)
17. App:    Buat LoginPasswordScreen
18. App:    Update app_router.dart (route baru + redirect logic)
```

---

## Panduan Shared UI

Selalu gunakan komponen dari `package:wash_wallet_ui/wash_wallet_ui.dart`:

| Kebutuhan | Komponen |
|-----------|----------|
| Tombol utama | `AppButton.primary(label: ..., onPressed: ..., isFullWidth: true, isLoading: ...)` |
| Tombol sekunder | `AppButton.outlined(...)` |
| Input teks | `AppTextField.outlined(controller: ..., label: ..., prefixIcon: ..., enabled: ...)` |
| Notifikasi error | `AppSnackbar.error(context, message: ...)` |
| Notifikasi peringatan | `AppSnackbar.warning(context, message: ...)` |
| Dialog konfirmasi | `AppDialog` |
| Separator | `AppDivider` |
| Dropdown | `AppDropdown` |
| Warna | `context.colors.primary`, `.background`, `.textPrimary`, `.textSecondary` |
| Typography | `context.typography.displayLarge`, `.bodyMedium`, `.labelSmall` |
| Spacing | `context.space.xs`, `.sm`, `.md`, `.lg`, `.xl`, `.xxl` |
| Radius | `context.radius` |
| Kartu | `AppCard` |

---

## Verification Plan

### Automated
- [ ] `dart run build_runner build --delete-conflicting-outputs` di `packages/wash_wallet_domain`
- [ ] `flutter analyze` di `apps/customer` (zero errors)

### Manual — Flow Register (New User)
1. Buka app → `LoginScreen`
2. Input nomor baru → Tap "Masuk via OTP" → OTP terkirim via WA → `OtpScreen`
3. Input OTP valid → routing ke `RegisterScreen` (phone terisi otomatis)
4. Isi nama → Tap "Daftar Sekarang" → routing ke `HomeScreen`

### Manual — Flow Login OTP (Existing User)
1. `LoginScreen` → input nomor lama → OTP terkirim → `OtpScreen`
2. Input OTP valid → langsung ke `HomeScreen`

### Manual — Flow Login Password
1. `LoginScreen` → Tap "Masuk dengan Password" → `LoginPasswordScreen`
2. Input nomor + password valid → Tap "Masuk" → `HomeScreen`

### Manual — Error Cases
- OTP salah → `AppSnackbar.error` tampil, tetap di `OtpScreen`
- Nomor sudah terdaftar saat register OTP → `AppDialog` tawaran ke login
- Nomor belum terdaftar saat login OTP → `AppDialog` tawaran daftar
- Rate limit 429 di login-password → tombol disabled + `AppSnackbar.warning`
- Token expired saat di app → redirect ke `LoginScreen`
- Akun tidak aktif (`is_active: false`) → pesan hubungi admin
