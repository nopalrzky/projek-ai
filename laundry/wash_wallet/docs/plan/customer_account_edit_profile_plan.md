# Implementation Plan: Edit Profile Customer

> Berdasarkan: `docs/user_need/customer_account_edit_profile_user_need.md`  
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
6. **Tidak ada comment** — tulis clean code yang self-explanatory
7. **Gunakan `result.when()`** — jangan `fold()` atau `if (result is Success)`
8. **Gunakan named parameters** di constructor

---

## Ringkasan Perubahan

| Layer | File | Aksi | Keterangan |
|-------|------|------|------------|
| **Backend Service** | `CustomerAuthService.php` | MODIFY | Tambah method `updateCustomerProfile` |
| **Backend Controller** | `CustomerAuthController.php` | MODIFY | Tambah method `updateProfile`, tambah ke middleware list |
| **Backend Route** | `api_mobile_customer.php` | MODIFY | Tambah `PATCH /auth/profile` |
| **Domain Repository** | `customer_auth_repository.dart` | MODIFY | Tambah method `updateProfile` |
| **Domain Usecase** | `update_profile_usecase.dart` | NEW | Usecase + Params class untuk update profile |
| **Domain Export** | `wash_wallet_domain.dart` | MODIFY | Export `update_profile_usecase.dart` |
| **Data Datasource** | `auth_remote_datasource.dart` | MODIFY | Tambah abstract method + implementasi `updateCustomerProfile` |
| **Data Repository** | `customer_auth_repository_impl.dart` | MODIFY | Implementasi `updateProfile` |
| **Presentation Cubit** | `customer_auth_cubit.dart` | MODIFY | Tambah field `UpdateProfileUsecase`, tambah method `updateProfile` |
| **Presentation Provider** | `auth_provider.dart` | MODIFY | Inject `UpdateProfileUsecase` ke `CustomerAuthCubit` |
| **Presentation Route** | `app_router.dart` | MODIFY | Tambah sub-route `edit` di dalam `/profile` |
| **Presentation Screen** | `edit_profile_screen.dart` | NEW | Screen form edit profile |
| **Presentation Widget** | `profile_summary_card_widget.dart` | MODIFY | Tambah edit icon/button sebagai entry point |
| **Presentation Widget** | `profile_menu_section_widget.dart` | MODIFY | Aktifkan item `Edit Profil` dengan route `/profile/edit` |

---

## Fase 0 — Backend Laravel (Kerjakan Pertama)

> Backend harus selesai sebelum mobile mulai Fase 2 ke atas.

### Konteks Codebase Backend

- **Framework:** Laravel, Sanctum auth
- **Auth guard:** `customer_sanctum` — semua endpoint authenticated pakai guard ini
- **Base controller:** `app/Http/Controllers/Controller.php` — pakai `$this->successResponse()` dan `$this->errorResponse()`
- **Model:** `app/Models/CustomerAccount.php` — fillable mencakup `name`, `email`, `gender`, `date_of_birth`; `password` di `$hidden`
- **Resource:** `app/Http/Resources/CustomerAccount/CustomerAccountResource.php` — shape JSON yang dibaca mobile, sudah include `has_password`
- **Service:** `app/Services/CustomerAuthService.php` — berisi business logic auth customer
- **Route file:** `routes/api_mobile_customer.php` — semua route customer mobile

### 0.1 — Tambah Method `updateCustomerProfile` di `CustomerAuthService`

**File:** `app/Services/CustomerAuthService.php`

Tambah method baru setelah method `setCustomerPassword`:

```php
/**
 * Update customer profile basic data.
 *
 * @throws ValidationException
 */
public function updateCustomerProfile(CustomerAccount $customerAccount, array $data): CustomerAccount
{
    $customerAccount->update([
        'name'          => $data['name'],
        'email'         => $data['email'] ?? null,
        'gender'        => $data['gender'] ?? null,
        'date_of_birth' => $data['date_of_birth'] ?? null,
    ]);

    return $customerAccount->fresh();
}
```

**Catatan:**
- Method menerima `CustomerAccount` authenticated dari controller.
- Hanya update 4 field scope v1. Field lain (`phone`, `password`, `is_verified`, dll.) tidak disentuh.
- `$customerAccount->fresh()` me-refresh model dari database agar response mengandung data terbaru.
- Validasi email unique dan format dilakukan di controller layer.

### 0.2 — Tambah Method `updateProfile` di `CustomerAuthController`

**File:** `app/Http/Controllers/Api/CustomerAuthController.php`

**Update middleware attribute** untuk menyertakan `updateProfile`:
```php
#[Middleware('auth:customer_sanctum', only: ['me', 'logout', 'updateFcmToken', 'setPassword', 'updateProfile'])]
```

**Tambah method:**
```php
/**
 * Update basic profile data for authenticated customer.
 */
public function updateProfile(Request $request): JsonResponse
{
    $customerId = $request->user()->id;

    $request->validate([
        'name'          => 'required|string|max:255',
        'email'         => [
            'nullable',
            'email',
            'max:255',
            Rule::unique('customer_accounts', 'email')->ignore($customerId),
        ],
        'gender'        => 'nullable|in:male,female',
        'date_of_birth' => 'nullable|date|before_or_equal:today',
    ]);

    try {
        $customerAccount = $this->authService->updateCustomerProfile(
            $request->user(),
            $request->only(['name', 'email', 'gender', 'date_of_birth'])
        );

        return $this->successResponse(
            new CustomerAccountResource($customerAccount),
            'Profil berhasil diperbarui.'
        );
    } catch (ValidationException $e) {
        return $this->errorResponse($e->getMessage(), 422, $e->errors());
    } catch (Throwable $e) {
        Log::error('[CustomerAuthController] Update Profile Failed', [
            'customer_id' => $request->user()?->id,
            'error'       => $e->getMessage(),
        ]);
        return $this->errorResponse('Gagal memperbarui profil. Silakan coba lagi.', 500);
    }
}
```

**Tambah import `Rule`** di bagian atas file:
```php
use Illuminate\Validation\Rule;
```

**Catatan validasi:**
- `Rule::unique(...)->ignore($customerId)` — validasi email unique mengabaikan customer sendiri, sehingga customer bisa menyimpan email yang sama tanpa error palsu.
- `before_or_equal:today` — tanggal lahir tidak boleh masa depan.
- `in:male,female` — gender hanya menerima dua nilai yang sudah ditentukan.

**Response sukses:**
```json
{
  "success": true,
  "message": "Profil berhasil diperbarui.",
  "data": {
    "id": 1,
    "phone": "08123456789",
    "name": "Nama Baru",
    "email": "customer@example.com",
    "gender": "male",
    "avatar": null,
    "depositBalance": 0,
    "dateOfBirth": "1995-01-31",
    "isVerified": true,
    "isActive": true,
    "lastLoginAt": "...",
    "has_password": true
  }
}
```

**Response error 422 (contoh email duplikat):**
```json
{
  "success": false,
  "message": "The email has already been taken."
}
```

### 0.3 — Tambah Route `PATCH /auth/profile`

**File:** `routes/api_mobile_customer.php`

Tambah satu baris di blok `Route::prefix('auth')`:

```php
Route::prefix('auth')->name('auth.')->controller(CustomerAuthController::class)->group(function () {
    Route::post('/otp/request', 'requestOtp')->name('otp.request');
    Route::post('/otp/verify', 'verifyOtp')->name('otp.verify');
    Route::post('/register', 'register')->name('register');
    Route::post('/login-password', 'loginWithPassword')->middleware('throttle:10,1')->name('login-password');
    Route::get('/me', 'me')->name('me');
    Route::post('/logout', 'logout')->name('logout');
    Route::post('/fcm-token', 'updateFcmToken')->name('fcm-token');
    Route::post('/set-password', 'setPassword')->name('set-password');
    Route::patch('/profile', 'updateProfile')->name('profile.update'); // BARU
});
```

**Full URL:** `PATCH /api/mobile/customer/auth/profile`  
**Auth:** Bearer token (Sanctum `customer_sanctum`)

**Request body:**
```json
{
  "name": "Nama Customer",
  "email": "customer@example.com",
  "gender": "male",
  "date_of_birth": "1995-01-31"
}
```

### 0.4 — Urutan Implementasi Backend

```
1. CustomerAuthService.php      — tambah updateCustomerProfile
2. CustomerAuthController.php   — tambah updateProfile + update middleware attr + import Rule
3. api_mobile_customer.php      — tambah PATCH /auth/profile
4. Test manual: PATCH /api/mobile/customer/auth/profile dengan token valid
5. Test: email duplikat → 422, tanggal masa depan → 422, name kosong → 422
6. Test: email sama milik sendiri → 200 (bukan error)
```

---

## Fase 1 — Domain: Repository & Usecase

### 1.1 — Tambah Method `updateProfile` di `CustomerAuthRepository`

**File:** `packages/wash_wallet_domain/lib/src/repositories/customer_auth_repository.dart`

Tambah method baru:

```dart
Future<Result<CustomerAccount>> updateProfile({
  required String name,
  String? email,
  String? gender,
  String? dateOfBirth,
});
```

### 1.2 — Buat `UpdateProfileUsecase`

**File:** `packages/wash_wallet_domain/lib/src/usecases/customer_auth/update_profile_usecase.dart`  
**Aksi:** NEW

```dart
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../entities/customer_account.dart';
import '../../repositories/customer_auth_repository.dart';

class UpdateProfileParams {
  final String name;
  final String? email;
  final String? gender;
  final String? dateOfBirth;

  UpdateProfileParams({
    required this.name,
    this.email,
    this.gender,
    this.dateOfBirth,
  });
}

class UpdateProfileUsecase {
  final CustomerAuthRepository _repository;

  UpdateProfileUsecase(this._repository);

  Future<Result<CustomerAccount>> call(UpdateProfileParams params) {
    return _repository.updateProfile(
      name: params.name,
      email: params.email,
      gender: params.gender,
      dateOfBirth: params.dateOfBirth,
    );
  }
}
```

### 1.3 — Update `wash_wallet_domain.dart`

**File:** `packages/wash_wallet_domain/lib/wash_wallet_domain.dart`

Tambah export:
```dart
export 'src/usecases/customer_auth/update_profile_usecase.dart';
```

---

## Fase 2 — Data: Datasource & Repository Impl

### 2.1 — Update `AuthRemoteDatasource`

**File:** `packages/wash_wallet_data/lib/src/auth/datasources/auth_remote_datasource.dart`

Tambah abstract method dan implementasi.

**Abstract:**
```dart
Future<CustomerAccountModel> updateCustomerProfile({
  required String name,
  String? email,
  String? gender,
  String? dateOfBirth,
});
```

**Implementasi di `AuthRemoteDatasourceImpl`:**
```dart
@override
Future<CustomerAccountModel> updateCustomerProfile({
  required String name,
  String? email,
  String? gender,
  String? dateOfBirth,
}) async {
  try {
    final response = await _dio.patch(
      '$_authBaseEndpoint/profile',
      data: {
        'name': name,
        if (email != null && email.isNotEmpty) 'email': email,
        if (email != null && email.isEmpty) 'email': null,
        if (gender != null) 'gender': gender,
        if (dateOfBirth != null && dateOfBirth.isNotEmpty) 'date_of_birth': dateOfBirth,
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

**Catatan payload:**
- `email`: jika user mengosongkan field email (ingin menghapus email), kirim `null` secara eksplisit. Jika email diisi, kirim string.
- `gender`: kirim `null` jika tidak dipilih, atau `'male'`/`'female'`.
- `date_of_birth`: format `YYYY-MM-DD`.

### 2.2 — Update `CustomerAuthRepositoryImpl`

**File:** `packages/wash_wallet_data/lib/src/auth/repositories/customer_auth_repository_impl.dart`

Tambah implementasi `updateProfile`:

```dart
@override
Future<Result<CustomerAccount>> updateProfile({
  required String name,
  String? email,
  String? gender,
  String? dateOfBirth,
}) async {
  try {
    final customerModel = await _remoteDatasource.updateCustomerProfile(
      name: name,
      email: email,
      gender: gender,
      dateOfBirth: dateOfBirth,
    );
    await _localDatasource.saveCustomer(customerModel);
    return Result.success(customerModel.toEntity());
  } on ApiException catch (e) {
    return Result.failure(_mapApiExceptionToFailure(e));
  } on NetworkException catch (e) {
    return Result.failure(NetworkFailure(message: e.message));
  } catch (e) {
    return Result.failure(
      ServerFailure(message: 'Update profile failed: ${e.toString()}'),
    );
  }
}
```

**Catatan:** `_localDatasource.saveCustomer(customerModel)` memastikan customer terbaru tersimpan lokal, sehingga `checkAuthStatus` di restart berikutnya menggunakan data terbaru.

---

## Fase 3 — Presentation: Cubit & Provider

### 3.1 — Update `CustomerAuthCubit`

**File:** `apps/customer/lib/features/auth/presentation/bloc/customer_auth_cubit.dart`

Tambah field `UpdateProfileUsecase` dan method `updateProfile`.

**Tambah field:**
```dart
final UpdateProfileUsecase? _updateProfile;
```

**Update constructor:**
```dart
CustomerAuthCubit({
  required CheckCustomerAuthStatusUsecase checkAuthStatus,
  required RequestOtpUsecase requestOtp,
  required VerifyOtpUsecase verifyOtp,
  required RegisterUsecase register,
  required LoginWithPasswordUsecase loginWithPassword,
  required CustomerLogoutUsecase logout,
  UpdateUsecase? updateUsecase,
  SetPasswordUsecase? setPassword,
  UpdateProfileUsecase? updateProfile,    // BARU
}) : _checkAuthStatus = checkAuthStatus,
     _requestOtp = requestOtp,
     _verifyOtp = verifyOtp,
     _register = register,
     _loginWithPassword = loginWithPassword,
     _logout = logout,
     _updateUsecase = updateUsecase,
     _setPassword = setPassword,
     _updateProfile = updateProfile,       // BARU
     super(CustomerAuthInitial());
```

**Tambah method `updateProfile`:**
```dart
Future<void> updateProfile({
  required String name,
  String? email,
  String? gender,
  String? dateOfBirth,
}) async {
  final usecase = _updateProfile;
  if (usecase == null) return;

  final currentState = state;
  if (currentState is! CustomerAuthAuthenticated) return;

  emit(CustomerAuthLoading());

  final result = await usecase(
    UpdateProfileParams(
      name: name,
      email: email,
      gender: gender,
      dateOfBirth: dateOfBirth,
    ),
  );

  result.when(
    success: (updatedCustomer) {
      emit(CustomerAuthAuthenticated(updatedCustomer));
    },
    failure: (failure) {
      emit(CustomerAuthError(failure.message));
      emit(currentState);
    },
  );
}
```

**Catatan pola:**
- Menyimpan `currentState` sebelum emit loading — pola identik dengan `setPassword`.
- Saat sukses: emit `CustomerAuthAuthenticated(updatedCustomer)` — `ProfileScreen` akan otomatis re-render dengan data terbaru karena membaca dari `CustomerAuthCubit`.
- Saat gagal: emit `CustomerAuthError` lalu kembalikan `currentState` (authenticated dengan data lama) — form edit tetap menampilkan pesan error dan data tidak berubah.

### 3.2 — Update `CustomerAuthProvider`

**File:** `apps/customer/lib/features/auth/presentation/providers/auth_provider.dart`

Inject `UpdateProfileUsecase`:

```dart
return CustomerAuthCubit(
  checkAuthStatus: CheckCustomerAuthStatusUsecase(repository),
  requestOtp: RequestOtpUsecase(repository),
  verifyOtp: VerifyOtpUsecase(repository),
  register: RegisterUsecase(repository),
  loginWithPassword: LoginWithPasswordUsecase(repository),
  logout: CustomerLogoutUsecase(repository),
  updateUsecase: updateUsecase,
  setPassword: SetPasswordUsecase(repository),
  updateProfile: UpdateProfileUsecase(repository), // BARU
);
```

---

## Fase 4 — Presentation: Route

### 4.1 — Tambah Sub-Route `edit` di `/profile`

**File:** `apps/customer/lib/core/router/app_router.dart`

Tambah import:
```dart
import '../../features/profile/presentation/screens/edit_profile_screen.dart';
```

Update blok `StatefulShellBranch` untuk `/profile`:

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
        GoRoute(
          path: 'edit',                                           // BARU
          builder: (context, state) => const EditProfileScreen(),
        ),
      ],
    ),
  ],
),
```

**Navigasi ke screen:**
```dart
context.push('/profile/edit');
```

---

## Fase 5 — Presentation: Screen Edit Profile

### 5.1 — Buat `EditProfileScreen`

**File:** `apps/customer/lib/features/profile/presentation/screens/edit_profile_screen.dart`  
**Aksi:** NEW

**Struktur screen:**
```
Scaffold
  AppBar (title: 'Edit Profil', leading: back button)
  BlocConsumer<CustomerAuthCubit, CustomerAuthState>
    listener: handle sukses & error
    builder:
      SingleChildScrollView
        Column
          [Phone read-only info row]
          AppTextField — Nama (controller: _nameController)
          AppTextField — Email (controller: _emailController)
          [Gender dropdown/selector]
          [DateOfBirth field dengan date picker]
      BottomBar / sticky footer
        AppButton.primary('Simpan')
```

**State class:**
```dart
class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _dateOfBirthController = TextEditingController();

  String? _selectedGender;
  String? _nameError;
  String? _emailError;
  bool _initialized = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _dateOfBirthController.dispose();
    super.dispose();
  }

  void _initFromCustomer(CustomerAccount customer) {
    if (_initialized) return;
    _initialized = true;
    _nameController.text = customer.name;
    _emailController.text = customer.email ?? '';
    _dateOfBirthController.text = customer.dateOfBirth ?? '';
    _selectedGender = customer.gender;
  }

  Future<void> _pickDateOfBirth() async {
    final now = DateTime.now();
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 20, now.month, now.day),
      firstDate: DateTime(1900),
      lastDate: now,
    );

    if (pickedDate == null) return;

    final formatted =
        '${pickedDate.year}-${pickedDate.month.toString().padLeft(2, '0')}-${pickedDate.day.toString().padLeft(2, '0')}';
    setState(() => _dateOfBirthController.text = formatted);
  }

  bool _validate() {
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();

    String? nameError;
    String? emailError;

    if (name.isEmpty) {
      nameError = 'Nama tidak boleh kosong';
    }

    if (email.isNotEmpty) {
      final emailRegex = RegExp(r'^[\w-.]+@([\w-]+\.)+[\w-]{2,}$');
      if (!emailRegex.hasMatch(email)) {
        emailError = 'Format email tidak valid';
      }
    }

    setState(() {
      _nameError = nameError;
      _emailError = emailError;
    });

    return nameError == null && emailError == null;
  }

  void _submit(BuildContext context) {
    if (!_validate()) return;

    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final dateOfBirth = _dateOfBirthController.text.trim();

    context.read<CustomerAuthCubit>().updateProfile(
      name: name,
      email: email.isEmpty ? null : email,
      gender: _selectedGender,
      dateOfBirth: dateOfBirth.isEmpty ? null : dateOfBirth,
    );
  }
```

**Build method:**
```dart
  @override
  Widget build(BuildContext context) {
    return BlocConsumer<CustomerAuthCubit, CustomerAuthState>(
      listener: (context, state) {
        if (state is CustomerAuthAuthenticated) {
          AppSnackbar.success(context, message: 'Profil berhasil diperbarui');
          context.pop();
        } else if (state is CustomerAuthError) {
          AppSnackbar.error(context, message: state.message);
        }
      },
      builder: (context, state) {
        if (state is CustomerAuthAuthenticated) {
          _initFromCustomer(state.customer);
        }

        final isLoading = state is CustomerAuthLoading;

        return Scaffold(
          backgroundColor: context.colors.background,
          appBar: AppBar(
            title: Text(
              'Edit Profil',
              style: context.typography.titleMedium.copyWith(
                color: context.colors.textPrimary,
                fontWeight: FontWeight.w700,
              ),
            ),
            backgroundColor: context.colors.surface,
            foregroundColor: context.colors.textPrimary,
            elevation: 0,
          ),
          body: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: EdgeInsets.all(context.space.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Phone read-only info
                _PhoneInfoRow(phone: _phoneFromState(state)),
                SizedBox(height: context.space.xl),

                // Nama
                AppTextField(
                  controller: _nameController,
                  label: 'Nama Lengkap',
                  hint: 'Masukkan nama lengkap',
                  errorText: _nameError,
                  onChanged: (_) {
                    if (_nameError != null) setState(() => _nameError = null);
                  },
                ),
                SizedBox(height: context.space.md),

                // Email
                AppTextField(
                  controller: _emailController,
                  label: 'Email',
                  hint: 'Masukkan email (opsional)',
                  keyboardType: TextInputType.emailAddress,
                  errorText: _emailError,
                  onChanged: (_) {
                    if (_emailError != null) setState(() => _emailError = null);
                  },
                ),
                SizedBox(height: context.space.md),

                // Gender
                _GenderSelector(
                  value: _selectedGender,
                  onChanged: (value) => setState(() => _selectedGender = value),
                ),
                SizedBox(height: context.space.md),

                // Tanggal lahir
                AppTextField(
                  controller: _dateOfBirthController,
                  label: 'Tanggal Lahir',
                  hint: 'YYYY-MM-DD (opsional)',
                  readOnly: true,
                  onTap: _pickDateOfBirth,
                  suffixIcon: Icon(
                    Icons.calendar_today_outlined,
                    color: context.colors.textSecondary,
                    size: 18,
                  ),
                ),
                SizedBox(height: context.space.xxxl),
              ],
            ),
          ),
          bottomNavigationBar: SafeArea(
            child: Padding(
              padding: EdgeInsets.symmetric(
                horizontal: context.space.lg,
                vertical: context.space.md,
              ),
              child: AppButton.primary(
                label: 'Simpan',
                isLoading: isLoading,
                onPressed: isLoading ? null : () => _submit(context),
              ),
            ),
          ),
        );
      },
    );
  }

  String _phoneFromState(CustomerAuthState state) {
    if (state is CustomerAuthAuthenticated) return state.customer.phone;
    return '';
  }
}
```

**Widget helper `_PhoneInfoRow`** (private di file yang sama):
```dart
class _PhoneInfoRow extends StatelessWidget {
  final String phone;

  const _PhoneInfoRow({required this.phone});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Row(
        children: [
          Icon(Icons.phone_outlined, color: context.colors.textSecondary, size: 18),
          SizedBox(width: context.space.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Nomor HP',
                  style: context.typography.labelSmall.copyWith(
                    color: context.colors.textTertiary,
                  ),
                ),
                Text(
                  phone,
                  style: context.typography.bodyMedium.copyWith(
                    color: context.colors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Text(
            'Tidak dapat diubah',
            style: context.typography.labelSmall.copyWith(
              color: context.colors.textDisabled,
            ),
          ),
        ],
      ),
    );
  }
}
```

**Widget helper `_GenderSelector`** (private di file yang sama):
```dart
class _GenderSelector extends StatelessWidget {
  final String? value;
  final ValueChanged<String?> onChanged;

  const _GenderSelector({required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Gender',
          style: context.typography.labelMedium.copyWith(
            color: context.colors.textSecondary,
          ),
        ),
        SizedBox(height: context.space.xs),
        Row(
          children: [
            Expanded(
              child: _GenderOption(
                label: 'Laki-laki',
                value: 'male',
                selectedValue: value,
                onTap: () => onChanged(value == 'male' ? null : 'male'),
              ),
            ),
            SizedBox(width: context.space.sm),
            Expanded(
              child: _GenderOption(
                label: 'Perempuan',
                value: 'female',
                selectedValue: value,
                onTap: () => onChanged(value == 'female' ? null : 'female'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _GenderOption extends StatelessWidget {
  final String label;
  final String value;
  final String? selectedValue;
  final VoidCallback onTap;

  const _GenderOption({
    required this.label,
    required this.value,
    required this.selectedValue,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isSelected = selectedValue == value;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: EdgeInsets.symmetric(
          vertical: context.space.sm,
          horizontal: context.space.md,
        ),
        decoration: BoxDecoration(
          color: isSelected ? context.colors.primarySurface : context.colors.surface,
          border: Border.all(
            color: isSelected ? context.colors.primary : context.colors.border,
            width: isSelected ? 1.5 : 1,
          ),
          borderRadius: BorderRadius.circular(context.radius.md),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (isSelected)
              Padding(
                padding: EdgeInsets.only(right: context.space.xs),
                child: Icon(
                  Icons.check_circle_rounded,
                  size: 16,
                  color: context.colors.primary,
                ),
              ),
            Text(
              label,
              style: context.typography.labelMedium.copyWith(
                color: isSelected
                    ? context.colors.primary
                    : context.colors.textSecondary,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

**Catatan penting `_initFromCustomer`:**
- Guard `_initialized` memastikan form hanya di-prefill sekali dari state pertama saat screen dibuka.
- Tanpa guard ini, setiap rebuild BlocConsumer (misalnya saat `CustomerAuthLoading`) akan me-reset field yang sedang diedit user.
- Listener menangkap `CustomerAuthAuthenticated` setelah sukses — ini trigger `context.pop()` kembali ke `/profile`.

---

## Fase 6 — Presentation: Update Widget & Entry Point

### 6.1 — Update `ProfileSummaryCardWidget`

**File:** `apps/customer/lib/features/profile/presentation/widgets/profile_summary_card_widget.dart`

Tambah parameter callback `onEditTap` dan icon edit di sisi kanan atas card:

```dart
class ProfileSummaryCardWidget extends StatelessWidget {
  final CustomerAccount customer;
  final VoidCallback? onEditTap;    // BARU

  const ProfileSummaryCardWidget({
    super.key,
    required this.customer,
    this.onEditTap,                  // BARU
  });

  @override
  Widget build(BuildContext context) {
    final email = customer.email?.trim();

    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.lg,
        vertical: context.space.sm,
      ),
      child: AppCard.elevated(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _ProfileAvatar(customer: customer),
            SizedBox(width: context.space.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ... isi yang sama seperti sebelumnya ...
                ],
              ),
            ),
            // BARU: edit icon di pojok kanan
            if (onEditTap != null)
              AppButton.icon(
                icon: Icon(
                  Icons.edit_outlined,
                  color: context.colors.textSecondary,
                  size: 20,
                ),
                onPressed: onEditTap,
                tooltip: 'Edit Profil',
              ),
          ],
        ),
      ),
    );
  }
}
```

**Perubahan di `ProfileScreen`** — pass `onEditTap`:
```dart
ProfileSummaryCardWidget(
  customer: customer,
  onEditTap: () => context.push('/profile/edit'),  // BARU
),
```

### 6.2 — Update `ProfileMenuSectionWidget`

**File:** `apps/customer/lib/features/profile/presentation/widgets/profile_menu_section_widget.dart`

Pindahkan `Edit Profil` dari `disabledItems` ke `activeItems` dengan route `/profile/edit`:

```dart
final activeItems = [
  _ProfileMenuItem(
    label: 'Edit Profil',                              // BARU (dipindah dari disabled)
    icon: Icons.edit_outlined,
    route: '/profile/edit',
  ),
  _ProfileMenuItem(
    label: 'Alamat Saya',
    icon: Icons.location_on_outlined,
    route: '/customer-addresses',
  ),
  _ProfileMenuItem(
    label: 'Riwayat Pesanan',
    icon: Icons.receipt_long_outlined,
    route: '/orders',
  ),
  _ProfileMenuItem(
    label: 'Promo',
    icon: Icons.local_offer_outlined,
    route: '/promos',
  ),
  _ProfileMenuItem(
    label: 'Saldo Deposit',
    icon: Icons.account_balance_wallet_outlined,
    route: '/topup',
  ),
];

final disabledItems = [
  // _ProfileMenuItem(label: 'Edit Profil', ...) DIHAPUS dari sini
  _ProfileMenuItem(label: 'Keamanan Akun', icon: Icons.lock_outlined),
  _ProfileMenuItem(label: 'Notifikasi', icon: Icons.notifications_outlined),
  _ProfileMenuItem(label: 'Bantuan', icon: Icons.help_outline_rounded),
  _ProfileMenuItem(label: 'Tentang Aplikasi', icon: Icons.info_outline),
];
```

---

## Urutan Implementasi (Full Stack)

```
=== BACKEND (kerjakan lebih dulu) ===
1. CustomerAuthService.php      — tambah updateCustomerProfile
2. CustomerAuthController.php   — tambah updateProfile + update middleware + import Rule
3. api_mobile_customer.php      — tambah PATCH /auth/profile
4. Test manual semua kasus validasi backend

=== MOBILE DOMAIN ===
5. customer_auth_repository.dart   — tambah method updateProfile
6. update_profile_usecase.dart     — buat file baru (Params class + Usecase)
7. wash_wallet_domain.dart         — export UpdateProfileUsecase

=== MOBILE DATA ===
8. auth_remote_datasource.dart         — tambah abstract + implementasi updateCustomerProfile
9. customer_auth_repository_impl.dart  — implementasi updateProfile

=== MOBILE PRESENTATION ===
10. customer_auth_cubit.dart       — tambah field + method updateProfile
11. auth_provider.dart             — inject UpdateProfileUsecase
12. app_router.dart                — tambah sub-route 'edit'
13. edit_profile_screen.dart       — buat screen baru (TERBESAR, kerjakan setelah yang lain siap)
14. profile_summary_card_widget.dart — tambah onEditTap parameter + icon edit
15. profile_screen.dart            — pass onEditTap ke ProfileSummaryCardWidget
16. profile_menu_section_widget.dart — aktifkan Edit Profil ke /profile/edit
```

---

## Acceptance Criteria (Checklist Verifikasi)

### Backend
- [ ] `PATCH /api/mobile/customer/auth/profile` dengan token valid + payload lengkap → 200 + customer terbaru
- [ ] `PATCH /auth/profile` tanpa token → 401
- [ ] `name` kosong → 422
- [ ] `email` format tidak valid → 422
- [ ] `email` milik customer lain → 422 (duplicate)
- [ ] `email` sama dengan milik customer sendiri → 200 (tidak error)
- [ ] `gender` selain `male`/`female` → 422
- [ ] `date_of_birth` tanggal masa depan → 422
- [ ] `date_of_birth` format tidak valid → 422
- [ ] Response sukses mengembalikan `CustomerAccountResource` lengkap termasuk `has_password`

### Mobile Domain & Data
- [ ] `CustomerAuthRepository` memiliki method `updateProfile`
- [ ] `UpdateProfileUsecase` + `UpdateProfileParams` tersedia
- [ ] `AuthRemoteDatasource` memiliki method `updateCustomerProfile`
- [ ] `CustomerAuthRepositoryImpl.updateProfile` menyimpan customer terbaru ke local cache

### Mobile Presentation
- [ ] Route `/profile/edit` terdaftar dan membuka `EditProfileScreen`
- [ ] `CustomerAuthCubit` memiliki method `updateProfile`
- [ ] `EditProfileScreen` ter-prefill dari `CustomerAuthAuthenticated.customer`
- [ ] Field nama tersedia dan wajib diisi
- [ ] Field email tersedia, opsional, tervalidasi format jika diisi
- [ ] Field gender tersedia sebagai selector `male`/`female`, opsional
- [ ] Field tanggal lahir tersedia dengan date picker, opsional
- [ ] Nomor HP ditampilkan sebagai read-only, tidak editable
- [ ] Validasi lokal mencegah submit jika nama kosong
- [ ] Validasi lokal mencegah submit jika format email tidak valid
- [ ] Tombol simpan disabled/loading saat request berjalan
- [ ] Double submit tidak bisa terjadi
- [ ] Submit sukses menampilkan snackbar berhasil dan kembali ke `/profile`
- [ ] Submit sukses memperbarui `CustomerAuthAuthenticated.customer`
- [ ] Submit sukses memperbarui local cached customer
- [ ] `/profile` langsung menampilkan data terbaru setelah kembali
- [ ] `ProfileStatusCardWidget` menyesuaikan kondisi berdasarkan customer terbaru
- [ ] Submit gagal menampilkan error tanpa mengubah auth state
- [ ] Form tetap terbuka dan berisi data yang diedit setelah gagal
- [ ] Item `Edit Profil` di menu aktif dan mengarah ke `/profile/edit`
- [ ] Item `Edit Profil` tidak lagi menampilkan "Segera hadir"
- [ ] Icon edit di `ProfileSummaryCardWidget` membuka `/profile/edit`
- [ ] Tidak ada `ProfileCubit` atau repository terpisah
- [ ] Tidak ada update local-only sebagai sumber kebenaran
