# Implementation Plan: Password Setup Card di Halaman Akun Customer

> Berdasarkan: `docs/user_need/customer_account_password_setup_card_user_need.md`  
> Scope: Full-stack — backend Laravel (`webapp/wash_wallet_be`) + domain, data, presentation (`apps/customer` + `packages/wash_wallet_domain` + `packages/wash_wallet_data`)

---

## ⚠️ Instruksi Wajib untuk AI Model

Sebelum menulis kode apapun, **selalu baca** spec berikut:

- `docs/spec/cubit_spec.md` — pola Cubit & `result.when()`
- `docs/spec/state_spec.md` — pola State & sealed class
- `docs/spec/usecase_spec.md` — pola Usecase & Params class
- `docs/spec/repository_spec.md` — pola Repository interface
- `docs/spec/repository_impl_spec.md` — pola RepositoryImpl
- `docs/spec/remote_datasource_spec.md` — pola RemoteDatasource

**Aturan ketat yang tidak boleh dilanggar:**

1. **Gunakan `context.colors.*`** — jangan hardcode warna
2. **Gunakan `context.typography.*`** — jangan hardcode `TextStyle`
3. **Gunakan `context.space.*`** — jangan hardcode angka spacing
4. **Gunakan `context.radius.*`** — jangan hardcode `BorderRadius`
5. **Gunakan shared UI components** dari `wash_wallet_ui` — `AppCard`, `AppButton`, `AppTextField`, `AppSnackbar`, dll.
6. **Pecah widget besar** menjadi widget kecil di folder `widgets/`
7. **Tidak ada comment** — tulis clean code yang self-explanatory
8. **Gunakan `result.when()`** — jangan `fold()` atau `if (result is Success)`
9. **Gunakan named parameters** di constructor

---

## Ringkasan Perubahan

| Layer | File | Aksi | Keterangan |
|-------|------|------|------------|
| **Backend Migration** | `xxxx_add_has_password_to_customer_accounts.php` | NEW | Tidak perlu kolom baru — `password` sudah ada, cukup computed |
| **Backend Resource** | `CustomerAccountResource.php` | MODIFY | Tambah field `has_password` di response |
| **Backend Service** | `CustomerAuthService.php` | MODIFY | Tambah method `setCustomerPassword` |
| **Backend Controller** | `CustomerAuthController.php` | MODIFY | Tambah method `setPassword`, tambah middleware `auth:customer_sanctum` |
| **Backend Route** | `api_mobile_customer.php` | MODIFY | Tambah `POST /auth/set-password` |
| **Domain Entity** | `customer_account.dart` | MODIFY | Tambah field `bool? hasPassword` (nullable) |
| **Domain Model** | `customer_account_model.dart` | MODIFY | Tambah field `hasPassword`, update `fromJson`, `toEntity`, `fromEntity` |
| **Domain Model** | `customer_account_model.freezed.dart` | REGEN | Regenerate via `dart run build_runner build` |
| **Domain Model** | `customer_account_model.g.dart` | REGEN | Regenerate via `dart run build_runner build` |
| **Domain Repository** | `customer_auth_repository.dart` | MODIFY | Tambah method `setPassword` |
| **Domain Usecase** | `set_password_usecase.dart` | NEW | Usecase untuk set/create password |
| **Domain Export** | `wash_wallet_domain.dart` | MODIFY | Export `set_password_usecase.dart` |
| **Data Datasource** | `auth_remote_datasource.dart` | MODIFY | Tambah method `setCustomerPassword` |
| **Data Repository** | `customer_auth_repository_impl.dart` | MODIFY | Implementasi `setPassword` |
| **Data Local** | `auth_local_datasource.dart` | *(no change)* | `saveCustomer` sudah ada, cukup dipanggil ulang |
| **Presentation Cubit** | `customer_auth_cubit.dart` | MODIFY | Tambah method `setPassword` + update `CustomerAuthAuthenticated` setelah sukses |
| **Presentation Route** | `app_router.dart` | MODIFY | Tambah sub-route `/profile/password` |
| **Presentation Screen** | `set_password_screen.dart` | NEW | Screen form set password |
| **Presentation Widget** | `profile_password_setup_card_widget.dart` | NEW | Card ajakan set password (closable) |
| **Presentation Screen** | `profile_screen.dart` | MODIFY | Sisipkan `ProfilePasswordSetupCardWidget` setelah `ProfileSummaryCardWidget` |

---

## Fase 1 — Domain: Entity & Model

### 1.1 Update `CustomerAccount` entity

**File:** `packages/wash_wallet_domain/lib/src/entities/customer_account.dart`

Tambah field nullable `hasPassword`:

```dart
import 'package:equatable/equatable.dart';

class CustomerAccount extends Equatable {
  final int id;
  final String phone;
  final String name;
  final String? email;
  final String? gender;
  final String? avatar;
  final String? dateOfBirth;
  final bool isVerified;
  final bool isActive;
  final String? lastLoginAt;
  final String? fcmToken;
  final int depositBalance;
  final bool? hasPassword; // nullable: null = unknown, false = belum, true = sudah

  const CustomerAccount({
    required this.id,
    required this.phone,
    required this.name,
    this.email,
    this.gender,
    this.avatar,
    this.dateOfBirth,
    required this.isVerified,
    required this.isActive,
    this.lastLoginAt,
    this.fcmToken,
    this.depositBalance = 0,
    this.hasPassword,
  });

  @override
  List<Object?> get props => [
    id,
    phone,
    name,
    email,
    gender,
    avatar,
    dateOfBirth,
    isVerified,
    isActive,
    lastLoginAt,
    fcmToken,
    depositBalance,
    hasPassword,
  ];
}
```

**Aturan `hasPassword`:**
- `null` → status password tidak diketahui → jangan tampilkan card
- `false` → belum punya password → tampilkan card
- `true` → sudah punya password → jangan tampilkan card

### 1.2 Update `CustomerAccountModel`

**File:** `packages/wash_wallet_domain/lib/src/models/customer_account_model.dart`

Tambah field `hasPassword` di `@freezed` class dan update semua method:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/customer_account.dart';
import '../helpers/json_converters.dart';

part 'customer_account_model.freezed.dart';
part 'customer_account_model.g.dart';

@freezed
class CustomerAccountModel with _$CustomerAccountModel {
  const factory CustomerAccountModel({
    required int id,
    required String phone,
    required String name,
    String? email,
    String? gender,
    String? avatar,
    String? dateOfBirth,
    required bool isVerified,
    required bool isActive,
    String? lastLoginAt,
    String? fcmToken,
    @Default(0) int depositBalance,
    bool? hasPassword, // nullable — null = unknown
  }) = _CustomerAccountModel;

  const CustomerAccountModel._();

  factory CustomerAccountModel.fromJson(Map<String, dynamic> json) =>
      _$CustomerAccountModelFromJson(_normalizeJson(json));

  static Map<String, dynamic> _normalizeJson(Map<String, dynamic> json) {
    if (json.isEmpty) return json;

    final normalized = Map<String, dynamic>.from(json);

    normalized['isVerified'] = toBool(
      json['isVerified'] ?? json['is_verified'],
    );
    normalized['isActive'] = toBool(json['isActive'] ?? json['is_active']);
    normalized['dateOfBirth'] = json['dateOfBirth'] ?? json['date_of_birth'];
    normalized['lastLoginAt'] = json['lastLoginAt'] ?? json['last_login_at'];
    normalized['fcmToken'] = json['fcmToken'] ?? json['fcm_token'];
    normalized['depositBalance'] =
        json['depositBalance'] ?? json['deposit_balance'] ?? 0;

    // Nullable: jika key tidak ada di JSON maka null (unknown)
    final rawHasPassword = json['hasPassword'] ?? json['has_password'];
    normalized['hasPassword'] =
        rawHasPassword != null ? toBool(rawHasPassword) : null;

    return normalized;
  }

  CustomerAccount toEntity() => CustomerAccount(
    id: id,
    phone: phone,
    name: name,
    email: email,
    gender: gender,
    avatar: avatar,
    dateOfBirth: dateOfBirth,
    isVerified: isVerified,
    isActive: isActive,
    lastLoginAt: lastLoginAt,
    fcmToken: fcmToken,
    depositBalance: depositBalance,
    hasPassword: hasPassword,
  );

  factory CustomerAccountModel.fromEntity(CustomerAccount entity) =>
      CustomerAccountModel(
        id: entity.id,
        phone: entity.phone,
        name: entity.name,
        email: entity.email,
        gender: entity.gender,
        avatar: entity.avatar,
        dateOfBirth: entity.dateOfBirth,
        isVerified: entity.isVerified,
        isActive: entity.isActive,
        lastLoginAt: entity.lastLoginAt,
        fcmToken: entity.fcmToken,
        depositBalance: entity.depositBalance,
        hasPassword: entity.hasPassword,
      );
}
```

> **Setelah mengubah file ini**, jalankan perintah build_runner untuk regenerate file `.freezed.dart` dan `.g.dart`:
> ```
> dart run build_runner build --delete-conflicting-outputs
> ```
> atau dari root workspace:
> ```
> melos run build_runner
> ```

### 1.3 Tambah `SetPasswordUsecase`

**File:** `packages/wash_wallet_domain/lib/src/usecases/customer_auth/set_password_usecase.dart`  
**Aksi:** NEW

```dart
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../entities/customer_account.dart';
import '../../repositories/customer_auth_repository.dart';

class SetPasswordParams {
  final String password;
  final String passwordConfirmation;

  SetPasswordParams({
    required this.password,
    required this.passwordConfirmation,
  });
}

class SetPasswordUsecase {
  final CustomerAuthRepository _repository;

  SetPasswordUsecase(this._repository);

  Future<Result<CustomerAccount>> call(SetPasswordParams params) {
    return _repository.setPassword(
      password: params.password,
      passwordConfirmation: params.passwordConfirmation,
    );
  }
}
```

### 1.4 Update `CustomerAuthRepository` interface

**File:** `packages/wash_wallet_domain/lib/src/repositories/customer_auth_repository.dart`

Tambah method `setPassword`:

```dart
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../entities/customer_account.dart';

abstract class CustomerAuthRepository {
  Future<Result<bool>> requestOtp(String phone, {required String intent});

  Future<Result<CustomerAccount>> verifyOtp({
    required String phone,
    required String otp,
  });

  Future<Result<CustomerAccount>> register({
    required String phone,
    required String name,
    String? email,
    String? gender,
    String? password,
    String? dateOfBirth,
    String? deviceName,
  });

  Future<Result<CustomerAccount>> loginWithPassword({
    required String phone,
    required String password,
    String? deviceName,
  });

  Future<Result<CustomerAccount>> getProfile();

  Future<Result<CustomerAccount>> checkAuthStatus();

  Future<Result<void>> logout();

  // Baru: set password untuk customer authenticated
  Future<Result<CustomerAccount>> setPassword({
    required String password,
    required String passwordConfirmation,
  });
}
```

### 1.5 Update `wash_wallet_domain.dart` (export)

**File:** `packages/wash_wallet_domain/lib/wash_wallet_domain.dart`

Tambah export usecase baru:

```dart
export 'src/usecases/customer_auth/set_password_usecase.dart';
```

---

## Fase 2 — Data: Datasource & Repository Impl

### 2.1 Update `AuthRemoteDatasource`

**File:** `packages/wash_wallet_data/lib/src/auth/datasources/auth_remote_datasource.dart`

Tambah abstract method dan implementasi `setCustomerPassword`:

**Abstract:**
```dart
Future<CustomerAccountModel> setCustomerPassword({
  required String password,
  required String passwordConfirmation,
});
```

**Implementasi di `AuthRemoteDatasourceImpl`:**
```dart
@override
Future<CustomerAccountModel> setCustomerPassword({
  required String password,
  required String passwordConfirmation,
}) async {
  try {
    final response = await _dio.post(
      '$_authBaseEndpoint/set-password',
      data: {
        'password': password,
        'password_confirmation': passwordConfirmation,
      },
    );

    _validateResponse(response);

    final data = response.data['data'] as Map<String, dynamic>;
    return CustomerAccountModel.fromJson(data);
  } catch (e) {
    throw _handleError(e);
  }
}
```

**Catatan endpoint:** Endpoint `POST /auth/set-password` adalah asumsi berdasarkan pola existing (`$_authBaseEndpoint` = prefix `/auth`). Konfirmasi endpoint dengan backend sebelum implementasi. Jika endpoint berbeda, sesuaikan path-nya.

**Response yang diharapkan dari backend:**
```json
{
  "data": {
    "id": 1,
    "phone": "...",
    "name": "...",
    "has_password": true,
    ...
  }
}
```
Backend harus mengembalikan data customer terbaru dengan `has_password: true` setelah set password berhasil.

### 2.2 Update `CustomerAuthRepositoryImpl`

**File:** `packages/wash_wallet_data/lib/src/auth/repositories/customer_auth_repository_impl.dart`

Tambah implementasi `setPassword`:

```dart
@override
Future<Result<CustomerAccount>> setPassword({
  required String password,
  required String passwordConfirmation,
}) async {
  try {
    final customerModel = await _remoteDatasource.setCustomerPassword(
      password: password,
      passwordConfirmation: passwordConfirmation,
    );
    await _localDatasource.saveCustomer(customerModel);
    return Result.success(customerModel.toEntity());
  } on ApiException catch (e) {
    return Result.failure(_mapApiExceptionToFailure(e));
  } on NetworkException catch (e) {
    return Result.failure(NetworkFailure(message: e.message));
  } catch (e) {
    return Result.failure(
      ServerFailure(message: 'Set password failed: ${e.toString()}'),
    );
  }
}
```

**Catatan:** `_localDatasource.saveCustomer(customerModel)` memastikan data customer lokal (termasuk `hasPassword: true`) tersimpan, sehingga ketika app di-restart, status password sudah tersimpan.

---

## Fase 3 — Presentation: Cubit

### 3.1 Update `CustomerAuthCubit`

**File:** `apps/customer/lib/features/auth/presentation/bloc/customer_auth_cubit.dart`

Tambah dependency `SetPasswordUsecase` dan method `setPassword`:

```dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/usecases/update_usecase.dart';
import 'customer_auth_state.dart';

class CustomerAuthCubit extends Cubit<CustomerAuthState> {
  final CheckCustomerAuthStatusUsecase _checkAuthStatus;
  final RequestOtpUsecase _requestOtp;
  final VerifyOtpUsecase _verifyOtp;
  final RegisterUsecase _register;
  final LoginWithPasswordUsecase _loginWithPassword;
  final CustomerLogoutUsecase _logout;
  final UpdateUsecase? _updateUsecase;
  final SetPasswordUsecase? _setPassword; // nullable agar backward compatible

  CustomerAuthCubit({
    required CheckCustomerAuthStatusUsecase checkAuthStatus,
    required RequestOtpUsecase requestOtp,
    required VerifyOtpUsecase verifyOtp,
    required RegisterUsecase register,
    required LoginWithPasswordUsecase loginWithPassword,
    required CustomerLogoutUsecase logout,
    UpdateUsecase? updateUsecase,
    SetPasswordUsecase? setPassword,
  })  : _checkAuthStatus = checkAuthStatus,
        _requestOtp = requestOtp,
        _verifyOtp = verifyOtp,
        _register = register,
        _loginWithPassword = loginWithPassword,
        _logout = logout,
        _updateUsecase = updateUsecase,
        _setPassword = setPassword,
        super(CustomerAuthInitial());

  // ... semua method existing tidak berubah ...

  Future<void> setPassword({
    required String password,
    required String passwordConfirmation,
  }) async {
    final usecase = _setPassword;
    if (usecase == null) return;

    final currentState = state;
    if (currentState is! CustomerAuthAuthenticated) return;

    emit(CustomerAuthLoading());

    final result = await usecase(
      SetPasswordParams(
        password: password,
        passwordConfirmation: passwordConfirmation,
      ),
    );

    result.when(
      success: (updatedCustomer) {
        emit(CustomerAuthAuthenticated(updatedCustomer));
      },
      failure: (failure) {
        emit(CustomerAuthError(failure.message));
        emit(currentState); // kembali ke state authenticated sebelumnya
      },
    );
  }
}
```

**Catatan penting:** Setelah `setPassword` berhasil, cubit emit `CustomerAuthAuthenticated(updatedCustomer)` dengan data customer terbaru yang sudah memiliki `hasPassword: true`. `ProfileScreen` yang me-listen `CustomerAuthCubit` akan otomatis re-render dan menyembunyikan card karena `customer.hasPassword == true`.

### 3.2 Update `CustomerAuthProvider`

**File:** `apps/customer/lib/features/auth/presentation/providers/auth_provider.dart`

Inject `SetPasswordUsecase` ke `CustomerAuthCubit`:

```dart
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_data/wash_wallet_data.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../../data/datasources/fcm_token_datasource.dart';
import '../../data/repositories/fcm_token_repository_impl.dart';
import '../../domain/usecases/update_usecase.dart';
import '../bloc/customer_auth_cubit.dart';

class CustomerAuthProvider {
  static Future<CustomerAuthCubit> createAuthCubitWithDependencies(
    Dio dio,
    ApiEndpoints endpoints,
  ) async {
    final remoteDatasource = AuthRemoteDatasourceImpl(dio, endpoints);
    final fcmTokenDataSource = FcmTokenRemoteDataSourceImpl(dio, endpoints);
    final fcmTokenRepository = FcmTokenRepositoryImpl(fcmTokenDataSource);
    final updateUsecase = UpdateUsecase(fcmTokenRepository);

    final storage = SecureStorageProvider.create();
    final sharedPreferences = await SharedPreferences.getInstance();
    final localDatasource = AuthLocalDatasourceImpl(storage, sharedPreferences);

    final repository = CustomerAuthRepositoryImpl(
      remoteDatasource: remoteDatasource,
      localDatasource: localDatasource,
    );

    return CustomerAuthCubit(
      checkAuthStatus: CheckCustomerAuthStatusUsecase(repository),
      requestOtp: RequestOtpUsecase(repository),
      verifyOtp: VerifyOtpUsecase(repository),
      register: RegisterUsecase(repository),
      loginWithPassword: LoginWithPasswordUsecase(repository),
      logout: CustomerLogoutUsecase(repository),
      updateUsecase: updateUsecase,
      setPassword: SetPasswordUsecase(repository), // baru
    );
  }
}
```

---

## Fase 4 — Presentation: Screen Set Password

### 4.1 Buat `SetPasswordScreen`

**File:** `apps/customer/lib/features/profile/presentation/screens/set_password_screen.dart`  
**Aksi:** NEW

Screen ini adalah form untuk customer membuat password pertama kali. Customer sudah authenticated saat mengakses screen ini.

**Layout:**
```
AppLayout
  └── AppHeader(title: 'Atur Password', showBackButton: true)
  └── SingleChildScrollView
        └── Column
              ├── [Deskripsi singkat]
              ├── AppTextField (Password)      ← dengan toggle show/hide
              ├── AppTextField (Konfirmasi)    ← dengan toggle show/hide
              └── [Spacer]
  └── BottomBar
        └── AppButton.primary('Simpan Password')
```

**Validasi lokal sebelum submit:**
- Password tidak boleh kosong
- Password minimal 8 karakter
- Konfirmasi password harus sama dengan password

**State management:**

Screen ini menggunakan `BlocConsumer<CustomerAuthCubit, CustomerAuthState>`:

```dart
class SetPasswordScreen extends StatefulWidget {
  const SetPasswordScreen({super.key});

  @override
  State<SetPasswordScreen> createState() => _SetPasswordScreenState();
}

class _SetPasswordScreenState extends State<SetPasswordScreen> {
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirm = true;
  String? _localError;

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  bool _validate() {
    final password = _passwordController.text.trim();
    final confirm = _confirmController.text.trim();

    if (password.isEmpty) {
      setState(() => _localError = 'Password tidak boleh kosong');
      return false;
    }
    if (password.length < 8) {
      setState(() => _localError = 'Password minimal 8 karakter');
      return false;
    }
    if (password != confirm) {
      setState(() => _localError = 'Konfirmasi password tidak cocok');
      return false;
    }

    setState(() => _localError = null);
    return true;
  }

  void _submit(BuildContext context) {
    if (!_validate()) return;

    context.read<CustomerAuthCubit>().setPassword(
      password: _passwordController.text.trim(),
      passwordConfirmation: _confirmController.text.trim(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<CustomerAuthCubit, CustomerAuthState>(
      listener: (context, state) {
        if (state is CustomerAuthAuthenticated) {
          // Sukses: customer sudah punya password, kembali ke profile
          AppSnackbar.show(
            context,
            message: 'Password berhasil dibuat',
          );
          context.pop();
        } else if (state is CustomerAuthError) {
          AppSnackbar.show(
            context,
            message: state.message,
            variant: AppSnackbarVariant.error,
          );
        }
      },
      builder: (context, state) {
        final isLoading = state is CustomerAuthLoading;

        return AppLayout(
          header: const AppHeader(title: 'Atur Password'),
          bottomBar: AppBottomBar(
            child: AppButton.primary(
              label: 'Simpan Password',
              isLoading: isLoading,
              onPressed: isLoading ? null : () => _submit(context),
            ),
          ),
          child: SingleChildScrollView(
            padding: EdgeInsets.all(context.space.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Buat password untuk mengamankan akun kamu dan memudahkan login ke depannya.',
                  style: context.typography.bodyMedium.copyWith(
                    color: context.colors.textSecondary,
                  ),
                ),
                SizedBox(height: context.space.xl),
                AppTextField(
                  controller: _passwordController,
                  label: 'Password',
                  hint: 'Minimal 8 karakter',
                  obscureText: _obscurePassword,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                    ),
                    onPressed: () {
                      setState(() => _obscurePassword = !_obscurePassword);
                    },
                  ),
                ),
                SizedBox(height: context.space.md),
                AppTextField(
                  controller: _confirmController,
                  label: 'Konfirmasi Password',
                  hint: 'Ulangi password',
                  obscureText: _obscureConfirm,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscureConfirm
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                    ),
                    onPressed: () {
                      setState(() => _obscureConfirm = !_obscureConfirm);
                    },
                  ),
                ),
                if (_localError != null) ...[
                  SizedBox(height: context.space.sm),
                  Text(
                    _localError!,
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.error,
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}
```

**Catatan listener:**
- `CustomerAuthAuthenticated` muncul kembali setelah `setPassword` sukses → berarti password berhasil disimpan. Pop screen dan tampilkan snackbar sukses.
- `CustomerAuthError` → tampilkan snackbar error, screen tetap terbuka.
- Jika terjadi `CustomerAuthLoading`, tombol submit di-disable untuk mencegah double submit.

---

## Fase 5 — Presentation: Route

### 5.1 Tambah route `/profile/password` di `AppRouter`

**File:** `apps/customer/lib/core/router/app_router.dart`

Tambahkan import:
```dart
import '../../features/profile/presentation/screens/set_password_screen.dart';
```

Ubah blok `StatefulShellBranch` untuk `/profile` dari:
```dart
StatefulShellBranch(
  routes: [
    GoRoute(
      path: '/profile',
      builder: (context, state) => const ProfileScreen(),
    ),
  ],
),
```

Menjadi:
```dart
StatefulShellBranch(
  routes: [
    GoRoute(
      path: '/profile',
      builder: (context, state) => const ProfileScreen(),
      routes: [
        GoRoute(
          path: 'password',
          builder: (context, state) => const SetPasswordScreen(),
        ),
      ],
    ),
  ],
),
```

Route `/profile/password` adalah sub-route dari `/profile`, sehingga otomatis menjadi child route dalam `StatefulShellBranch` yang sama.

**Navigasi dari card ke screen:**
```dart
context.push('/profile/password');
```

---

## Fase 6 — Presentation: Widget Password Setup Card

### 6.1 Buat `ProfilePasswordSetupCardWidget`

**File:** `apps/customer/lib/features/profile/presentation/widgets/profile_password_setup_card_widget.dart`  
**Aksi:** NEW

```dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class ProfilePasswordSetupCardWidget extends StatelessWidget {
  final VoidCallback onDismiss;

  const ProfilePasswordSetupCardWidget({
    super.key,
    required this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.lg,
        vertical: context.space.sm,
      ),
      child: AppCard.outlined(
        backgroundColor: context.colors.primarySurface,
        borderColor: context.colors.primary,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.lock_outline_rounded, color: context.colors.primary),
            SizedBox(width: context.space.sm),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Amankan akun kamu',
                    style: context.typography.labelMedium.copyWith(
                      fontWeight: FontWeight.w700,
                      color: context.colors.textPrimary,
                    ),
                  ),
                  SizedBox(height: context.space.xs),
                  Text(
                    'Kamu belum membuat password. Atur password agar akun bisa login lebih mudah dan tetap aman.',
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.textSecondary,
                    ),
                  ),
                  SizedBox(height: context.space.sm),
                  AppButton.outlined(
                    label: 'Atur Password',
                    size: AppButtonSize.small,
                    onPressed: () => context.push('/profile/password'),
                  ),
                ],
              ),
            ),
            AppButton.icon(
              icon: Icon(
                Icons.close_rounded,
                color: context.colors.textSecondary,
              ),
              onPressed: onDismiss,
              tooltip: 'Tutup',
            ),
          ],
        ),
      ),
    );
  }
}
```

**Catatan desain:**
- Gunakan `context.colors.primarySurface` sebagai background dan `context.colors.primary` sebagai border — berbeda dari `ProfileStatusCardWidget` yang memakai `warningSurface`/`warning`, agar password setup card terlihat berbeda secara visual (lebih positif/call to action, bukan peringatan).
- Gunakan `AppButton.outlined` dengan size `small` untuk CTA di dalam card agar tidak terlalu dominan.

---

## Fase 7 — Presentation: Update `ProfileScreen`

### 7.1 Modifikasi `ProfileScreen`

**File:** `apps/customer/lib/features/profile/presentation/screens/profile_screen.dart`

Perubahan yang perlu dilakukan:

1. **Tambah import** `profile_password_setup_card_widget.dart`
2. **Tambah state** `_dismissedPasswordCardSignature`
3. **Tambah logika eligibility** password card
4. **Sisipkan** `ProfilePasswordSetupCardWidget` setelah `ProfileSummaryCardWidget`

**Diff perubahan pada `_ProfileScreenState`:**

```dart
class _ProfileScreenState extends State<ProfileScreen> {
  String? _dismissedStatusCardSignature;
  String? _dismissedPasswordCardSignature; // BARU

  // ... initState tidak berubah ...

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CustomerAuthCubit, CustomerAuthState>(
      builder: (context, authState) {
        if (authState is! CustomerAuthAuthenticated) {
          return Scaffold(
            backgroundColor: context.colors.background,
            body: const Center(child: AppLoadingIndicator()),
          );
        }

        final customer = authState.customer;
        final statusSignature = _buildStatusSignature(customer);
        final showStatusCard =
            statusSignature != null &&
            statusSignature != _dismissedStatusCardSignature;

        // Logika password card — BARU
        final passwordCardSignature = _buildPasswordCardSignature(customer);
        final showPasswordCard =
            passwordCardSignature != null &&
            passwordCardSignature != _dismissedPasswordCardSignature;

        return Scaffold(
          backgroundColor: context.colors.background,
          body: SafeArea(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const ProfileAccountHeaderWidget(),
                  if (showStatusCard)
                    ProfileStatusCardWidget(
                      customer: customer,
                      onDismiss: () {
                        setState(() {
                          _dismissedStatusCardSignature = statusSignature;
                        });
                      },
                    ),
                  ProfileSummaryCardWidget(customer: customer),
                  // Password setup card — BARU, setelah summary card
                  if (showPasswordCard)
                    ProfilePasswordSetupCardWidget(
                      onDismiss: () {
                        setState(() {
                          _dismissedPasswordCardSignature =
                              passwordCardSignature;
                        });
                      },
                    ),
                  ProfileWalletCardWidget(customer: customer),
                  const ProfileQuickActionsWidget(),
                  const ProfileRecentActivityWidget(),
                  const ProfileMenuSectionWidget(),
                  const ProfileLogoutButtonWidget(),
                  SizedBox(height: context.space.xxl),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  String? _buildStatusSignature(CustomerAccount customer) {
    // ... tidak berubah ...
  }

  // Method baru untuk password card signature
  String? _buildPasswordCardSignature(CustomerAccount customer) {
    if (customer.hasPassword == null) return null; // unknown → jangan tampilkan
    if (customer.hasPassword == true) return null;  // sudah punya → jangan tampilkan
    return 'missing_password'; // belum punya → tampilkan
  }
}
```

---

## Urutan Implementasi

```
1. CustomerAccount entity           — tambah field hasPassword (domain)
2. CustomerAccountModel             — tambah field, update fromJson/toEntity (domain)
3. Regenerate build_runner          — dart run build_runner build
4. CustomerAuthRepository interface — tambah method setPassword (domain)
5. SetPasswordUsecase               — buat usecase baru (domain)
6. wash_wallet_domain.dart export   — export SetPasswordUsecase
7. AuthRemoteDatasource             — tambah setCustomerPassword (data)
8. CustomerAuthRepositoryImpl       — implementasi setPassword (data)
9. CustomerAuthCubit                — tambah setPassword method (presentation)
10. CustomerAuthProvider            — inject SetPasswordUsecase (presentation)
11. SetPasswordScreen               — buat screen form set password (presentation)
12. AppRouter                       — tambah sub-route /profile/password (presentation)
13. ProfilePasswordSetupCardWidget  — buat widget card (presentation)
14. ProfileScreen                   — sisipkan card + logika dismiss (presentation)
```

---

## Catatan Khusus: Backend Contract

Backend harus mengembalikan field `has_password` dalam response:

1. **GET `/me`** (dipakai oleh `getCustomerProfile` → `checkAuthStatus`) — harus mengembalikan `has_password`
2. **POST `/auth/set-password`** — endpoint baru, harus mengembalikan customer terbaru dengan `has_password: true`
3. Semua response auth lain yang mengembalikan `customer` object (verify OTP, register, login) — opsional untuk mengembalikan `has_password`, tapi direkomendasikan agar konsisten

Jika backend belum siap mengembalikan `has_password`, `CustomerAccount.hasPassword` akan `null` → card tidak ditampilkan (perilaku aman).

---

## Catatan Khusus: Dismiss Behavior

- `_dismissedPasswordCardSignature` disimpan di local state (in-memory).
- Signature: `'missing_password'` (string konstan selama customer belum punya password).
- Ketika customer berhasil set password:
  - `CustomerAuthAuthenticated(updatedCustomer)` di-emit dengan `updatedCustomer.hasPassword == true`
  - `_buildPasswordCardSignature(customer)` return `null`
  - Card otomatis disembunyikan **tanpa perlu memeriksa dismiss state**
  - Ini lebih bersih dari dismiss: card hilang karena kondisi berubah, bukan karena di-dismiss
- Jika customer dismiss card tapi belum set password, card tidak muncul lagi sampai signature berubah (app restart atau kondisi lain)

---

## Non-Goals (Jangan dikerjakan)

- Form ganti password (untuk customer yang sudah punya password) — ini bukan scope plan ini
- Validasi kekuatan password di UI (beyond minimal 8 karakter)
- Reset password via OTP dalam screen ini
- Perubahan halaman login atau OTP flow
- Perubahan pada alur login, OTP, atau register existing
- `ProfileCubit`, `ProfileRepository` baru
- Penggunaan `CustomerAuthOtpRequested.hasPassword` sebagai sumber data card

---

## Fase 0 — Backend (Laravel) — Kerjakan Pertama

> Backend harus selesai **sebelum** mobile mulai Fase 2 ke atas, karena mobile bergantung pada response `has_password` dari API.

### Konteks Codebase Backend

**Framework:** Laravel (dengan Sanctum untuk auth customer)  
**Auth guard:** `customer_sanctum` — endpoint yang butuh login wajib pakai middleware ini  
**Base controller:** `app/Http/Controllers/Controller.php` — gunakan `$this->successResponse()` dan `$this->errorResponse()`  
**Model utama:** `app/Models/CustomerAccount.php` — sudah punya kolom `password` (nullable, di-cast `hashed`) dan disembunyikan di `$hidden`  
**Service utama:** `app/Services/CustomerAuthService.php` — berisi semua business logic auth customer  
**Resource:** `app/Http/Resources/CustomerAccount/CustomerAccountResource.php` — mengontrol shape JSON yang diterima mobile  
**Route file:** `routes/api_mobile_customer.php` — semua route customer mobile ada di sini  

### 0.1 — Tidak Perlu Migration Baru

Kolom `password` sudah ada di tabel `customer_accounts` (nullable, tipe string, di-cast `hashed`).  
Status "punya password" dapat diderivasi langsung dari kolom yang ada:  
```php
$hasPassword = !is_null($customerAccount->password);
// atau
$hasPassword = CustomerAccount::byPhone($phone)->whereNotNull('password')->exists();
```

> ⚠️ **Tidak perlu tambah kolom `has_password` ke database.** Ini adalah computed value, bukan kolom tersimpan.

### 0.2 — Update `CustomerAccountResource`

**File:** `app/Http/Resources/CustomerAccount/CustomerAccountResource.php`

Tambah field `has_password` ke array response:

```php
public function toArray(Request $request): array
{
    return [
        'id'             => (int) $this->id,
        'phone'          => $this->phone ? (string) $this->phone : null,
        'name'           => $this->name ? (string) $this->name : null,
        'email'          => $this->email ? (string) $this->email : null,
        'gender'         => $this->gender ? (string) $this->gender : null,
        'avatar'         => $this->avatar ? (string) $this->avatar : null,
        'depositBalance' => (int) $this->deposit_balance,
        'dateOfBirth'    => $this->date_of_birth?->toDateString(),
        'isVerified'     => (bool) $this->is_verified,
        'isActive'       => (bool) $this->is_active,
        'lastLoginAt'    => $this->last_login_at?->toISOString(),
        'has_password'   => !is_null($this->password), // BARU: true jika sudah punya password
    ];
}
```

**Catatan penting:** `password` ada di `$hidden` model Eloquent, tapi `CustomerAccountResource` bisa mengakses properti langsung dari model melalui `$this->password`. `$hidden` hanya menyembunyikan field dari serialisasi Eloquent (misalnya `toArray()`, `toJson()`), tidak dari akses properti PHP langsung.

Dengan perubahan ini, **semua endpoint yang mengembalikan `CustomerAccountResource`** — yaitu `GET /me`, verify OTP, register, login password — otomatis akan menyertakan `has_password`.

### 0.3 — Tambah Method `setCustomerPassword` di `CustomerAuthService`

**File:** `app/Services/CustomerAuthService.php`

Tambah method baru di bawah method `logoutCustomer`:

```php
/**
 * Set or create password for authenticated customer.
 *
 * @throws ValidationException
 */
public function setCustomerPassword(CustomerAccount $customerAccount, string $password): CustomerAccount
{
    if (!is_null($customerAccount->password)) {
        throw ValidationException::withMessages([
            'password' => 'Akun sudah memiliki password.',
        ]);
    }

    $customerAccount->update([
        'password' => $password,
    ]);

    return $customerAccount->fresh();
}
```

**Catatan:**
- Method ini menerima `CustomerAccount` yang sudah authenticated (dari `$request->user()`).
- Validasi `is_null($customerAccount->password)` memastikan endpoint ini hanya dipakai untuk **set** password pertama kali, bukan ganti password.
- `$customerAccount->fresh()` me-refresh model dari database agar data terbaru (dengan `has_password` yang sudah ter-update) dikembalikan ke controller.
- Password di-hash otomatis karena kolom `password` sudah di-cast `'hashed'` di model.

### 0.4 — Tambah Method `setPassword` di `CustomerAuthController`

**File:** `app/Http/Controllers/Api/CustomerAuthController.php`

Tambah method `setPassword` baru dan update attribute `#[Middleware]` untuk menyertakan endpoint baru:

**Update middleware attribute:**
```php
#[Middleware('auth:customer_sanctum', only: ['me', 'logout', 'updateFcmToken', 'setPassword'])]
```

**Tambah method:**
```php
/**
 * Set password for authenticated customer (first time only).
 */
public function setPassword(Request $request): JsonResponse
{
    $request->validate([
        'password'              => 'required|string|min:8|confirmed',
        'password_confirmation' => 'required|string',
    ]);

    try {
        $customerAccount = $this->authService->setCustomerPassword(
            $request->user(),
            $request->password
        );

        return $this->successResponse(
            new CustomerAccountResource($customerAccount),
            'Password berhasil dibuat.'
        );
    } catch (ValidationException $e) {
        return $this->errorResponse($e->getMessage(), 422, $e->errors());
    } catch (Throwable $e) {
        Log::error('[CustomerAuthController] Set Password Failed', [
            'customer_id' => $request->user()?->id,
            'error'       => $e->getMessage(),
        ]);
        return $this->errorResponse('Gagal membuat password. Silakan coba lagi.', 500);
    }
}
```

**Validasi Laravel:**
- `required|string|min:8` — password wajib, minimal 8 karakter
- `confirmed` — otomatis memvalidasi bahwa ada field `password_confirmation` yang nilainya sama dengan `password`

**Response sukses:**
```json
{
  "success": true,
  "message": "Password berhasil dibuat.",
  "data": {
    "id": 1,
    "phone": "...",
    "name": "...",
    "has_password": true,
    ...
  }
}
```

**Response error (sudah punya password):**
```json
{
  "success": false,
  "message": "Akun sudah memiliki password."
}
```

### 0.5 — Tambah Route `POST /auth/set-password`

**File:** `routes/api_mobile_customer.php`

Tambah satu baris di dalam blok `Route::prefix('auth')`:

```php
Route::prefix('auth')->name('auth.')->controller(CustomerAuthController::class)->group(function () {
    Route::post('/otp/request', 'requestOtp')->name('otp.request');
    Route::post('/otp/verify', 'verifyOtp')->name('otp.verify');
    Route::post('/register', 'register')->name('register');
    Route::post('/login-password', 'loginWithPassword')->middleware('throttle:10,1')->name('login-password');
    Route::get('/me', 'me')->name('me');
    Route::post('/logout', 'logout')->name('logout');
    Route::post('/fcm-token', 'updateFcmToken')->name('fcm-token');
    Route::post('/set-password', 'setPassword')->name('set-password'); // BARU
});
```

**Full URL endpoint:** `POST /api/mobile/customer/auth/set-password`  
**Auth:** Bearer token (Sanctum customer_sanctum guard)

**Request body:**
```json
{
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

### 0.6 — Urutan Implementasi Backend

```
1. CustomerAccountResource.php   — tambah has_password (paling tidak berisiko, tidak ada logic)
2. CustomerAuthService.php       — tambah setCustomerPassword method
3. CustomerAuthController.php    — tambah setPassword method + update middleware attr
4. api_mobile_customer.php       — daftarkan route POST /auth/set-password
5. Test manual endpoint GET /me  — pastikan has_password muncul di response
6. Test manual POST /set-password — pastikan berhasil dan response has_password: true
```

### 0.7 — Dampak terhadap Endpoint Lain

Karena `has_password` ditambahkan langsung ke `CustomerAccountResource`, field ini otomatis muncul di **semua** endpoint yang sudah memakai resource ini:

| Endpoint | Kondisi `has_password` |
|----------|------------------------|
| `GET /me` | `true` jika sudah punya, `false` jika belum |
| `POST /otp/verify` (existing_user) | `true` atau `false` sesuai data |
| `POST /register` | `false` (customer baru, belum set password kecuali diisi saat register) |
| `POST /login-password` | `true` (bisa login dengan password, pasti punya password) |
| `POST /auth/set-password` (baru) | `true` setelah sukses |

---

## Urutan Implementasi (Full Stack)

```
=== BACKEND (kerjakan lebih dulu) ===
1. CustomerAccountResource.php     — tambah has_password
2. CustomerAuthService.php         — tambah setCustomerPassword
3. CustomerAuthController.php      — tambah setPassword + update middleware
4. api_mobile_customer.php         — daftarkan route
5. Test manual GET /me dan POST /set-password

=== MOBILE DOMAIN ===
6.  CustomerAccount entity          — tambah field hasPassword
7.  CustomerAccountModel            — tambah field, update fromJson/toEntity
8.  Regenerate build_runner         — dart run build_runner build
9.  CustomerAuthRepository interface — tambah method setPassword
10. SetPasswordUsecase              — buat usecase baru
11. wash_wallet_domain.dart export  — export SetPasswordUsecase

=== MOBILE DATA ===
12. AuthRemoteDatasource            — tambah setCustomerPassword
13. CustomerAuthRepositoryImpl      — implementasi setPassword

=== MOBILE PRESENTATION ===
14. CustomerAuthCubit               — tambah setPassword method
15. CustomerAuthProvider            — inject SetPasswordUsecase
16. SetPasswordScreen               — buat screen form set password
17. AppRouter                       — tambah sub-route /profile/password
18. ProfilePasswordSetupCardWidget  — buat widget card
19. ProfileScreen                   — sisipkan card + logika dismiss
```

---

## Acceptance Criteria (Checklist Verifikasi)

### Backend
- [ ] `GET /me` mengembalikan field `has_password: false` untuk customer tanpa password
- [ ] `GET /me` mengembalikan field `has_password: true` untuk customer yang sudah punya password
- [ ] `POST /auth/set-password` dengan token valid + payload `{password, password_confirmation}` → 200 + `has_password: true`
- [ ] `POST /auth/set-password` tanpa token → 401
- [ ] `POST /auth/set-password` jika customer sudah punya password → 422 dengan pesan error
- [ ] `POST /auth/set-password` dengan password < 8 karakter → 422
- [ ] `POST /auth/set-password` dengan `password_confirmation` tidak cocok → 422
- [ ] Semua endpoint yang pakai `CustomerAccountResource` otomatis menyertakan `has_password`

### Mobile
- [ ] `CustomerAccount` memiliki field `bool? hasPassword`
- [ ] `CustomerAccountModel.fromJson` memetakan `has_password` dari JSON
- [ ] Jika `has_password` tidak ada di JSON, `hasPassword == null` (unknown)
- [ ] `SetPasswordUsecase` tersedia dan dapat dipanggil
- [ ] `CustomerAuthCubit.setPassword()` tersedia
- [ ] Route `/profile/password` terdaftar dan membuka `SetPasswordScreen`
- [ ] `ProfilePasswordSetupCardWidget` tampil jika `customer.hasPassword == false`
- [ ] Card tidak tampil jika `customer.hasPassword == null` (unknown)
- [ ] Card tidak tampil jika `customer.hasPassword == true`
- [ ] Card bisa di-dismiss
- [ ] Setelah dismiss, card tidak muncul lagi selama signature `missing_password`
- [ ] Tap `Atur Password` membuka `/profile/password`
- [ ] Form set password memiliki field password + konfirmasi dengan toggle show/hide
- [ ] Validasi: password kosong → error lokal
- [ ] Validasi: password < 8 karakter → error lokal
- [ ] Validasi: konfirmasi tidak sama → error lokal
- [ ] Submit memanggil `CustomerAuthCubit.setPassword()`
- [ ] Setelah sukses, `CustomerAuthAuthenticated` di-emit dengan `hasPassword: true`
- [ ] Setelah sukses, screen pop dan snackbar sukses tampil
- [ ] Setelah sukses, card tidak muncul lagi di `/profile`
- [ ] Error API ditampilkan via snackbar
- [ ] Tombol submit tidak bisa di-tap ganda saat loading
- [ ] `CustomerAuthOtpRequested.hasPassword` tidak dipakai sebagai sumber data card
