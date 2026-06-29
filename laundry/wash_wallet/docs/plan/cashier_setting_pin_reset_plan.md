# Cashier Setting PIN dan Atur Ulang PIN — Implementation Plan

Dibuat: 2026-06-21
Berdasarkan: `docs/user_need/cashier_setting_pin_reset_user_need.md`

---

## Ringkasan

Plan ini mengimplementasikan dua fitur utama pada menu Settings cashier:

1. **Dynamic PIN menu label** — item PIN di Settings menampilkan `Setting PIN` (hasPin=false) atau `Atur Ulang PIN` (hasPin=true) secara langsung, menggantikan item `Keamanan PIN` yang pasif.
2. **Flow Atur Ulang PIN** — flow baru untuk reset PIN yang meminta PIN lama, kemudian PIN baru dan konfirmasi, menggunakan backend endpoint baru.

Flow **Setup PIN** (hasPin=false) mereuse screen dan flow existing (`SetupPinScreen → /confirm-pin → ConfirmPinScreen`) dengan penyesuaian navigasi dari Settings.

> **PENTING**: Implementasi ini bukan greenfield. Codebase sudah punya banyak bagian yang relevan. Baca catatan konteks di bawah sebelum mulai mengerjakan.

---

## Konteks Codebase (Temuan dari Kode Aktual)

### Yang sudah ada dan relevan

| Item | File | Detail |
|------|------|--------|
| Setup PIN screen | `apps/cashier/lib/features/auth/presentation/screens/setup_pin_screen.dart` | Ada. Memakai `PinBoxInput` widget, navigasi ke `/confirm-pin` via `context.push('/confirm-pin', extra: {'initialPin': _pin})` |
| Confirm PIN screen | `apps/cashier/lib/features/auth/presentation/screens/confirm_pin_screen.dart` | Ada. Menerima `initialPin` dari extra, memanggil `AuthCubit.setupPin()`, menangani success/failure |
| Route `/confirm-pin` | `app_router.dart` | Ada, sudah terdaftar |
| Route `/setup-pin` | `app_router.dart` | Ada, sudah terdaftar |
| Settings screen | `apps/cashier/lib/features/setting/presentation/screens/index_setting_screen.dart` | Ada. Item PIN saat ini: `title: 'Keamanan PIN'`, navigasi ke `/settings/pin-security` |
| Pin security screen | `apps/cashier/lib/features/setting/presentation/screens/pin_security_setting_screen.dart` | Ada. Screen pasif yang menampilkan info PIN dan tombol "Buat PIN Sekarang" (navigasi ke `/setup-pin`) jika belum ada PIN. Sudah punya logic `hasPin` |
| Route `/settings/pin-security` | `app_router.dart` | Ada, terdaftar sebagai sub-route settings |
| `PinBoxInput` widget | `apps/cashier/lib/features/auth/presentation/widgets/pin_box_input.dart` | Ada. Widget PIN box yang dipakai `SetupPinScreen` dan `ConfirmPinScreen` |
| Auth state `hasPin` | `Authenticated.employee.hasPin` | Ada di `AuthEmployee` entity |
| `AuthCubit.setupPin()` | `auth_cubit.dart` | Ada |
| `SetupPinUseCase` | `packages/wash_wallet_domain/lib/src/usecases/auth/setup_pin_usecase.dart` | Ada |
| Backend endpoint setup PIN | `POST /api/mobile/cashier/auth/pin/setup` | Ada, menolak employee yang sudah punya PIN (`pin_hash !== null`) |
| `SetupPinRequest.php` | `app/Http/Requests/Auth/SetupPinRequest.php` | Ada (bukan di `Requests/Employee/`) |
| `LoginEmployeeResource` | `app/Http/Resources/Employee/LoginEmployeeResource.php` | Ada, berisi `hasPin`, `allPermissions`, `accessibleOutlets` |
| `SaveRememberedAccountUsecase` | Domain use case | Ada |

### Yang belum ada (gap yang harus diimplementasikan)

| Item | Keterangan |
|------|------------|
| Backend reset PIN endpoint | `POST /api/mobile/cashier/auth/pin/reset` — belum ada |
| `ResetPinRequest.php` | `app/Http/Requests/Auth/ResetPinRequest.php` — belum ada |
| `AuthService::resetPin()` | Method di backend service — belum ada |
| `AuthRepository.resetPin()` | Interface di domain — belum ada |
| `AuthRepositoryImpl.resetPin()` | Impl di data layer — belum ada |
| `AuthRemoteDatasource.resetPin()` | Method di remote datasource — belum ada |
| `ResetPinUseCase` | Domain use case — belum ada |
| `AuthCubit.resetPin()` | Cubit method — belum ada |
| `PinResetVerifying` state | Auth state baru — belum ada |
| `PinResetSuccess` state | Auth state baru — belum ada |
| Screen input PIN lama untuk reset | Screen baru (dari Settings context) — belum ada |
| Screen input PIN baru untuk reset | Screen baru — belum ada (berbeda dari ConfirmPinScreen yang untuk setup) |
| Route `/settings/pin-reset-verify` | Route baru — belum ada |
| Route `/settings/pin-reset-new` | Route baru — belum ada |
| Dynamic label di `IndexSettingScreen` | `Keamanan PIN` harus diganti label dinamis — belum ada |

### Gap kritis yang ditemukan

- `IndexSettingScreen` punya item hardcoded `'Keamanan PIN'` yang navigasi ke `/settings/pin-security`.
- `PinSecuritySettingScreen` bersifat pasif (hanya info). Jika `hasPin=false`, ada tombol "Buat PIN Sekarang" yang navigasi ke `/setup-pin` — tapi ini bukan dari Settings langsung, melainkan lewat halaman info dulu.
- `SetupPinScreen` navigasi ke `/confirm-pin` tanpa callback `redirectTo` — setelah berhasil, `ConfirmPinScreen` mengandalkan `_handleAuthSuccess()` yang emits `Authenticated` atau `AuthSetupPinRequired`. **Ini perlu dicek**: jika user membuka setup PIN dari Settings (bukan dari splash/auth flow), `_handleAuthSuccess()` setelah setup berhasil masih akan memanggil notif session, emit `Authenticated` — router tidak akan redirect ke `/home` jika user sudah authenticated. Perlu verifikasi behavior ini.
- Belum ada endpoint, use case, maupun cubit method untuk reset PIN.
- `EmployeeAuthController` menggunakan `#[Middleware('auth:sanctum', only: ['logout', 'validateToken', 'me'])]` — artinya `setupPin` tidak dilindungi oleh class-level middleware, tapi dilindungi oleh route middleware di `api_mobile_cashier.php` (`->middleware('auth:sanctum')`). Pola yang sama harus diikuti untuk `resetPin`.

---

## Perubahan yang Diperlukan

---

### Area 1 — Backend: Reset PIN Endpoint

#### [NEW] `webapp/wash_wallet_be/app/Http/Requests/Auth/ResetPinRequest.php`

> **LOKASI**: Di `app/Http/Requests/Auth/` (ikuti pola `SetupPinRequest.php` yang ada di sana, bukan di `Requests/Employee/`)

```php
<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class ResetPinRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_pin'      => ['required', 'string', 'numeric', 'digits:6'],
            'pin'              => ['required', 'string', 'numeric', 'digits:6'],
            'pin_confirmation' => ['required', 'string', 'same:pin'],
        ];
    }

    public function messages(): array
    {
        return [
            'current_pin.required'  => 'PIN saat ini wajib diisi',
            'current_pin.numeric'   => 'PIN saat ini harus berupa angka',
            'current_pin.digits'    => 'PIN saat ini harus terdiri dari 6 digit',
            'pin.required'          => 'PIN baru wajib diisi',
            'pin.numeric'           => 'PIN baru harus berupa angka',
            'pin.digits'            => 'PIN baru harus terdiri dari 6 digit',
            'pin_confirmation.same' => 'Konfirmasi PIN baru tidak cocok',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422)
        );
    }
}
```

#### [MODIFY] `webapp/wash_wallet_be/app/Services/AuthService.php`

Tambahkan method `resetPin()` setelah method `setupPin()`. Pastikan menggunakan namespace dan import yang sudah ada (`Hash`, `Log`, `ValidationException`):

```php
/**
 * Reset PIN untuk employee authenticated yang sudah punya PIN.
 * Memvalidasi current_pin sebelum mengganti PIN.
 *
 * @throws ValidationException
 */
public function resetPin(Employee $employee, string $currentPin, string $newPin): Employee
{
    // Employee harus sudah punya PIN
    if ($employee->pin_hash === null) {
        throw ValidationException::withMessages([
            'current_pin' => 'Employee belum memiliki PIN. Gunakan endpoint setup PIN.',
        ]);
    }

    // Validasi PIN saat ini — jangan bocorkan info timing
    if (!Hash::check($currentPin, $employee->pin_hash)) {
        throw ValidationException::withMessages([
            'current_pin' => 'PIN saat ini tidak valid.',
        ]);
    }

    $employee->update([
        'pin_hash'   => Hash::make($newPin),
        'pin_set_at' => now(),
    ]);

    Log::info('Employee PIN reset successfully', [
        'employee_id' => $employee->id,
        'type'        => 'pin_reset',
    ]);

    // Load relasi yang sama dengan setupPin(), loginEmployee(), dan verifyPin()
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

#### [MODIFY] `webapp/wash_wallet_be/app/Http/Controllers/Api/EmployeeAuthController.php`

Tambahkan import `ResetPinRequest` dan method `resetPin()`:

```php
use App\Http\Requests\Auth\ResetPinRequest;

// Tambahkan method baru setelah setupPin():
public function resetPin(ResetPinRequest $request): JsonResponse
{
    try {
        /** @var Employee $employee */
        $employee = $request->user();

        $updatedEmployee = $this->authService->resetPin(
            $employee,
            $request->current_pin,
            $request->pin,
        );

        return $this->successResponse(
            [
                'employee' => new LoginEmployeeResource($updatedEmployee),
            ],
            'PIN berhasil diubah'
        );
    } catch (ValidationException $e) {
        return $this->errorResponse('Validasi gagal', 422, $e->errors());
    } catch (Throwable $e) {
        Log::error('[EmployeeAuthController] Failed to reset PIN', [
            'error'   => $e->getMessage(),
            'user_id' => Auth::id(),
            'type'    => 'employee_pin_reset',
        ]);

        return $this->errorResponse('Terjadi kesalahan saat mengubah PIN', 500, $e);
    }
}
```

#### [MODIFY] `webapp/wash_wallet_be/routes/api_mobile_cashier.php`

Tambahkan route `pin/reset` di group auth, dengan middleware yang sama dengan `pin/setup`:

```php
Route::post('/pin/reset', 'resetPin')->name('pin.reset')->middleware('auth:sanctum');
```

Letakkan setelah baris `pin/setup`:

```php
Route::post('/pin/setup', 'setupPin')->name('pin.setup')->middleware('auth:sanctum');
Route::post('/pin/reset', 'resetPin')->name('pin.reset')->middleware('auth:sanctum'); // [NEW]
```

---

### Area 2 — Flutter Domain: Reset PIN Interface & Use Case

#### [MODIFY] `packages/wash_wallet_domain/lib/src/repositories/auth_repository.dart`

Tambahkan deklarasi method `resetPin()` setelah `setupPin()`:

```dart
Future<Result<AuthEmployee>> resetPin({
  required String currentPin,
  required String pin,
  required String pinConfirmation,
});
```

#### [NEW] `packages/wash_wallet_domain/lib/src/usecases/auth/reset_pin_usecase.dart`

Ikuti pola `setup_pin_usecase.dart` yang sudah ada:

```dart
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../entities/auth_employee.dart';
import '../../repositories/auth_repository.dart';

class ResetPinParams {
  final String currentPin;
  final String pin;
  final String pinConfirmation;

  const ResetPinParams({
    required this.currentPin,
    required this.pin,
    required this.pinConfirmation,
  });
}

class ResetPinUseCase {
  final AuthRepository _repository;

  ResetPinUseCase(this._repository);

  Future<Result<AuthEmployee>> call(ResetPinParams params) {
    return _repository.resetPin(
      currentPin: params.currentPin,
      pin: params.pin,
      pinConfirmation: params.pinConfirmation,
    );
  }
}
```

---

### Area 3 — Flutter Data: Remote Datasource & Repository

#### [MODIFY] Auth Remote Datasource

Cari file `packages/wash_wallet_data/lib/src/auth/datasources/auth_remote_datasource.dart`. Tambahkan method `resetPin()` ke abstract class dan implementasinya.

Ikuti pola method `setupPin()` yang sudah ada di file tersebut:

```dart
// Di abstract class:
Future<AuthEmployeeModel> resetPin({
  required String currentPin,
  required String pin,
  required String pinConfirmation,
});

// Di AuthRemoteDatasourceImpl:
@override
Future<AuthEmployeeModel> resetPin({
  required String currentPin,
  required String pin,
  required String pinConfirmation,
}) async {
  final response = await _dio.post(
    _endpoints.cashierPinReset, // Tambahkan konstanta ini ke ApiEndpoints
    data: {
      'current_pin'      : currentPin,
      'pin'              : pin,
      'pin_confirmation' : pinConfirmation,
    },
  );
  // Ikuti pola parsing response dari setupPin() yang sudah ada
  return AuthEmployeeModel.fromJson(response.data['data']['employee']);
}
```

> **CATATAN**: Cek struktur response dari `setupPin` endpoint aktual untuk memastikan path JSON yang benar (`data['data']['employee']` atau `data['data']`). Lihat `EmployeeAuthController::setupPin()` — response wrapper-nya `$this->successResponse(['employee' => new LoginEmployeeResource(...)])`, jadi path adalah `data.data.employee`.

> **CATATAN**: Tambahkan endpoint constant `cashierPinReset` ke class `ApiEndpoints`. Cek file `ApiEndpoints` untuk pola naming yang dipakai.

#### [MODIFY] `packages/wash_wallet_data/lib/src/auth/repositories/auth_repository_impl.dart`

Tambahkan implementasi `resetPin()` setelah `setupPin()`:

```dart
@override
Future<Result<AuthEmployee>> resetPin({
  required String currentPin,
  required String pin,
  required String pinConfirmation,
}) async {
  try {
    final employeeModel = await _remoteDatasource.resetPin(
      currentPin: currentPin,
      pin: pin,
      pinConfirmation: pinConfirmation,
    );
    await _localDatasource.saveEmployee(employeeModel);
    // TIDAK auto-save ke remembered account — ikuti kebijakan explicit opt-in
    return Result.success(employeeModel.toEntity());
  } on ApiException catch (e) {
    return Result.failure(_mapApiExceptionToFailure(e));
  } on NetworkException catch (e) {
    return Result.failure(NetworkFailure(message: e.message));
  } catch (e) {
    return Result.failure(
      ServerFailure(message: 'Reset PIN failed: ${e.toString()}'),
    );
  }
}
```

---

### Area 4 — Flutter AuthState & AuthCubit

#### [MODIFY] `apps/cashier/lib/features/auth/presentation/bloc/auth_state.dart`

Tambahkan dua state baru di akhir file (sebelum penutup):

```dart
/// State saat proses reset PIN sedang berjalan
class PinResetVerifying extends AuthState {
  const PinResetVerifying();
}

/// State setelah reset PIN berhasil — membawa employee terbaru
class PinResetSuccess extends AuthState {
  final AuthEmployee employee;
  const PinResetSuccess(this.employee);

  @override
  List<Object?> get props => [employee];
}
```

#### [MODIFY] `apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart`

Tambahkan field `ResetPinUseCase`, update constructor, dan tambahkan method `resetPin()`.

**Constructor field baru:**
```dart
final ResetPinUseCase _resetPinUseCase;
```

**Tambahkan ke constructor parameter dan initialization:**
```dart
required ResetPinUseCase resetPinUseCase,
// ...
_resetPinUseCase = resetPinUseCase,
```

**Method baru — tambahkan setelah method `setupPin()`:**
```dart
Future<void> resetPin({
  required String currentPin,
  required String pin,
  required String pinConfirmation,
}) async {
  emit(const PinResetVerifying());

  final result = await _resetPinUseCase(
    ResetPinParams(
      currentPin: currentPin,
      pin: pin,
      pinConfirmation: pinConfirmation,
    ),
  );

  result.when(
    success: (employee) {
      emit(PinResetSuccess(employee));
      // Setelah sukses, update auth state ke Authenticated dengan data terbaru
      // Gunakan _handleAuthSuccess untuk konsistensi — checkRemember: false
      // karena ini bukan login pertama
      _handleAuthSuccess(employee);
    },
    failure: (failure) => emit(AuthFailureState(failure)),
  );
}
```

> **CATATAN**: `_handleAuthSuccess(employee)` setelah `PinResetSuccess` akan emit `Authenticated(employee)`. Screen reset PIN harus listen ke `PinResetSuccess` untuk menampilkan feedback sukses **sebelum** state berubah ke `Authenticated`. Gunakan `BlocConsumer` dengan `listenWhen` di screen untuk memisahkan behavior ini.

---

### Area 5 — Flutter: Auth Provider Update

#### [MODIFY] `apps/cashier/lib/features/auth/presentation/providers/auth_provider.dart`

Tambahkan factory method `createResetPinUseCase()` dan daftarkan di `createAuthCubitWithDependencies()`:

```dart
static ResetPinUseCase createResetPinUseCase(AuthRepository repository) {
  return ResetPinUseCase(repository);
}

// Di createAuthCubitWithDependencies(), tambahkan:
final resetPinUseCase = createResetPinUseCase(repository);

// Di createAuthCubit() call, tambahkan parameter:
resetPinUseCase: resetPinUseCase,
```

---

### Area 6 — Flutter: Screen Baru untuk Reset PIN

#### [NEW] `apps/cashier/lib/features/setting/presentation/screens/reset_pin_verify_screen.dart`

Screen untuk input PIN lama. Memakai `PinBoxInput` yang sama dengan `SetupPinScreen`. **PIN lama tidak diverifikasi ke backend di sini** — disimpan sementara di memory dan diteruskan ke screen berikutnya via route extra.

```dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../auth/presentation/widgets/pin_box_input.dart';

class ResetPinVerifyScreen extends StatefulWidget {
  const ResetPinVerifyScreen({super.key});

  @override
  State<ResetPinVerifyScreen> createState() => _ResetPinVerifyScreenState();
}

class _ResetPinVerifyScreenState extends State<ResetPinVerifyScreen> {
  final _pinController = TextEditingController();
  String _pin = '';
  String? _errorText;

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }

  void _validateAndContinue() {
    setState(() => _errorText = null);

    if (_pin.length < 6) {
      setState(() => _errorText = 'PIN harus 6 digit.');
      return;
    }

    // Teruskan PIN lama ke screen berikutnya via route extra
    context.push('/settings/pin-reset-new', extra: {'currentPin': _pin});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verifikasi PIN Saat Ini')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 24),
            // Ikon atau ilustrasi — ikuti pola SetupPinScreen
            const SizedBox(height: 32),
            Text(
              'Masukkan PIN Saat Ini',
              style: context.typography.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Masukkan PIN Anda yang aktif untuk melanjutkan.',
              style: context.typography.bodyMedium?.copyWith(
                color: context.colors.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            PinBoxInput(
              controller: _pinController,
              currentValue: _pin,
              errorText: _errorText,
              onChanged: (val) {
                setState(() {
                  _pin = val;
                  _errorText = null;
                });
              },
              onCompleted: (_) => _validateAndContinue(),
            ),
            const SizedBox(height: 48),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _validateAndContinue,
                style: ElevatedButton.styleFrom(
                  backgroundColor: context.colors.primary,
                  foregroundColor: context.colors.onPrimary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(context.radius.md),
                  ),
                ),
                child: const Text('Lanjutkan', style: TextStyle(fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

#### [NEW] `apps/cashier/lib/features/setting/presentation/screens/reset_pin_new_screen.dart`

Screen untuk input PIN baru dan konfirmasi, lalu submit ke backend. Struktur mirip `ConfirmPinScreen` tapi memakai `AuthCubit.resetPin()`. Menerima `currentPin` dari route extra.

```dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../auth/presentation/bloc/auth_cubit.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../../auth/presentation/widgets/pin_box_input.dart';

class ResetPinNewScreen extends StatefulWidget {
  final String currentPin;

  const ResetPinNewScreen({super.key, required this.currentPin});

  @override
  State<ResetPinNewScreen> createState() => _ResetPinNewScreenState();
}

class _ResetPinNewScreenState extends State<ResetPinNewScreen> {
  // Step 1: input PIN baru
  // Step 2: konfirmasi PIN baru
  // Gunakan dua sub-step dalam satu screen, atau dua PinBoxInput sequential
  
  final _newPinController = TextEditingController();
  final _confirmPinController = TextEditingController();
  String _newPin = '';
  String _confirmPin = '';
  String? _errorText;
  bool _isConfirmStep = false; // false = input PIN baru, true = konfirmasi PIN baru

  @override
  void dispose() {
    _newPinController.dispose();
    _confirmPinController.dispose();
    super.dispose();
  }

  void _onNewPinCompleted(String pin) {
    setState(() {
      _isConfirmStep = true;
      _errorText = null;
    });
  }

  void _onConfirmPinCompleted(String pin) {
    if (_confirmPin != _newPin) {
      setState(() {
        _errorText = 'PIN tidak cocok. Coba lagi.';
        _confirmPin = '';
        _confirmPinController.clear();
      });
      return;
    }
    _submitReset();
  }

  void _submitReset() {
    context.read<AuthCubit>().resetPin(
      currentPin: widget.currentPin,
      pin: _newPin,
      pinConfirmation: _confirmPin,
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthCubit, AuthState>(
      listenWhen: (prev, curr) =>
          curr is PinResetSuccess || curr is AuthFailureState,
      listener: (context, state) {
        if (state is PinResetSuccess) {
          // Tampilkan sukses, kembali ke Settings
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('PIN berhasil diubah')),
          );
          // Pop sampai ke /settings
          while (context.canPop()) {
            context.pop();
          }
          context.go('/settings');
        } else if (state is AuthFailureState) {
          setState(() {
            _errorText = state.failure.message;
            // Reset seluruh form — mungkin current_pin salah
            _newPin = '';
            _confirmPin = '';
            _isConfirmStep = false;
            _newPinController.clear();
            _confirmPinController.clear();
          });
        }
      },
      builder: (context, state) {
        final isLoading = state is PinResetVerifying;

        return Scaffold(
          appBar: AppBar(
            title: Text(_isConfirmStep ? 'Konfirmasi PIN Baru' : 'Buat PIN Baru'),
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 24),
                Text(
                  _isConfirmStep ? 'Konfirmasi PIN Baru' : 'Masukkan PIN Baru',
                  style: context.typography.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  _isConfirmStep
                      ? 'Masukkan kembali PIN baru untuk konfirmasi.'
                      : 'Masukkan 6 digit PIN baru Anda.',
                  style: context.typography.bodyMedium?.copyWith(
                    color: context.colors.onSurfaceVariant,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                if (!_isConfirmStep)
                  PinBoxInput(
                    controller: _newPinController,
                    currentValue: _newPin,
                    errorText: _errorText,
                    onChanged: (val) {
                      setState(() {
                        _newPin = val;
                        _errorText = null;
                      });
                    },
                    onCompleted: _onNewPinCompleted,
                  )
                else
                  PinBoxInput(
                    controller: _confirmPinController,
                    currentValue: _confirmPin,
                    errorText: _errorText,
                    onChanged: (val) {
                      setState(() {
                        _confirmPin = val;
                        _errorText = null;
                      });
                    },
                    onCompleted: _onConfirmPinCompleted,
                  ),
                const SizedBox(height: 48),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: isLoading
                        ? null
                        : () {
                            if (!_isConfirmStep) {
                              _onNewPinCompleted(_newPin);
                            } else {
                              _onConfirmPinCompleted(_confirmPin);
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: context.colors.primary,
                      foregroundColor: context.colors.onPrimary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(context.radius.md),
                      ),
                    ),
                    child: isLoading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : Text(
                            _isConfirmStep ? 'Simpan PIN Baru' : 'Lanjutkan',
                            style: const TextStyle(fontSize: 16),
                          ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
```

> **CATATAN DESAIN**: Jika implementer ingin memisahkan step "input PIN baru" dan "konfirmasi PIN baru" menjadi dua screen terpisah (seperti `SetupPinScreen → ConfirmPinScreen`), itu juga boleh. Pastikan `currentPin` tetap dipass via route extra di setiap step. Contoh di atas menggabungkan keduanya dalam satu screen dengan `_isConfirmStep` toggle untuk kesederhanaan.

> **KEAMANAN**: `currentPin` disimpan sementara dalam memory widget sebagai parameter constructor, tidak ke storage. `currentPin` plain text tidak boleh di-log, tidak disimpan ke SharedPreferences, dan tidak dikirim ke mana pun kecuali sebagai bagian dari request `POST /pin/reset`.

---

### Area 7 — Flutter: Router Update

#### [MODIFY] `apps/cashier/lib/core/router/app_router.dart`

Tambahkan dua route baru sebagai sub-route di bawah `/settings`. Tambahkan juga import screen baru.

**Import yang perlu ditambahkan:**
```dart
import '../../features/setting/presentation/screens/reset_pin_verify_screen.dart';
import '../../features/setting/presentation/screens/reset_pin_new_screen.dart';
```

**Route baru di bawah `/settings`:**
```dart
GoRoute(
  path: '/settings',
  pageBuilder: (context, state) =>
      state.slidePage(const IndexSettingScreen()),
  routes: [
    GoRoute(
      path: 'printer',
      pageBuilder: (context, state) =>
          state.slidePage(const PrinterSettingScreen()),
    ),
    GoRoute(
      path: 'profile',
      pageBuilder: (context, state) =>
          state.slidePage(const ProfileSettingScreen()),
    ),
    GoRoute(
      path: 'pin-security', // Route lama — tetap ada untuk backward compat
      pageBuilder: (context, state) =>
          state.slidePage(const PinSecuritySettingScreen()),
    ),
    // [NEW] Verifikasi PIN lama sebelum reset
    GoRoute(
      path: 'pin-reset-verify',
      pageBuilder: (context, state) =>
          state.slidePage(const ResetPinVerifyScreen()),
    ),
    // [NEW] Input PIN baru saat reset
    GoRoute(
      path: 'pin-reset-new',
      pageBuilder: (context, state) {
        final extra = state.extra as Map<String, dynamic>? ?? {};
        final currentPin = extra['currentPin'] as String? ?? '';
        return state.slidePage(ResetPinNewScreen(currentPin: currentPin));
      },
    ),
  ],
),
```

> **CATATAN**: Route `/settings/pin-security` tetap dipertahankan agar tidak ada breaking change. `IndexSettingScreen` yang diupdate akan **tidak lagi** navigasi ke `/settings/pin-security` — tapi route ini bisa tetap ada untuk backward compat atau di-remove jika tidak ada referensi lain.

---

### Area 8 — Flutter: Settings Screen Update

#### [MODIFY] `apps/cashier/lib/features/setting/presentation/screens/index_setting_screen.dart`

Ubah item PIN dari `'Keamanan PIN'` dengan navigasi ke `/settings/pin-security` menjadi label dinamis dengan navigasi yang sesuai.

Perhatikan: `IndexSettingScreen` sudah memakai `context.watch<AuthCubit>().state` — tinggal gunakan `authState` yang sudah tersedia untuk membaca `hasPin`.

```dart
// Ganti item 'Keamanan PIN' yang ada:
// BEFORE:
_buildSettingItem(
  context,
  icon: Icons.lock_outline,
  title: 'Keamanan PIN',
  subtitle: 'PIN digunakan untuk login cepat dan verifikasi ulang sesi kasir',
  onTap: () => context.push('/settings/pin-security'),
),

// AFTER:
_buildSettingItem(
  context,
  icon: Icons.lock_outline,
  title: authState is Authenticated && authState.employee.hasPin
      ? 'Atur Ulang PIN'
      : 'Setting PIN',
  subtitle: authState is Authenticated && authState.employee.hasPin
      ? 'Ganti PIN login cepat Anda'
      : 'Buat PIN untuk login lebih cepat',
  onTap: () {
    if (authState is Authenticated && authState.employee.hasPin) {
      context.push('/settings/pin-reset-verify');
    } else {
      context.push('/setup-pin');
    }
  },
),
```

> **CATATAN**: `SetupPinScreen` saat ini tidak punya parameter `redirectTo`. Setelah setup berhasil, `ConfirmPinScreen` memanggil `AuthCubit.setupPin()` yang meng-emit `Authenticated(employee, shouldPromptRemember: true)` (karena `checkRemember: true`). Dari Settings, user sudah di stack `/settings`, sehingga router tidak akan redirect ke `/home` karena user sudah `Authenticated`. **Perlu verifikasi** apakah `context.push('/setup-pin')` dari `/settings` akan kembali ke settings setelah setup berhasil, atau router redirect ke `/home`. Jika router redirect ke `/home`, perlu tambahkan `redirectTo` parameter ke `SetupPinScreen` (lihat catatan di bawah).

---

### Area 8b — Flutter: SetupPinScreen Redirect (Opsional, perlu verifikasi)

#### [MODIFY] `apps/cashier/lib/features/auth/presentation/screens/setup_pin_screen.dart`

Saat ini `SetupPinScreen` tidak punya navigasi setelah setup berhasil — `ConfirmPinScreen` yang menangani itu dengan memanggil `AuthCubit.setupPin()`. `ConfirmPinScreen` listen ke `AuthFailureState` tapi tidak melakukan navigasi secara eksplisit saat sukses — navigasi dilakukan oleh router/splash flow auth.

**Yang perlu diverifikasi**: Setelah `setupPin()` sukses dari Settings context, apakah `Authenticated` state menyebabkan router me-redirect ke `/home`? Lihat router redirect logic:

```dart
if (authState is Authenticated) {
  if (currentLocation == '/login' || 
      currentLocation == '/onboarding' ||
      currentLocation == '/setup-pin' ||    // <-- INI!
      currentLocation == '/access-denied') {
    return '/home';
  }
  return null;
}
```

Router akan redirect ke `/home` saat di `/setup-pin` dan state menjadi `Authenticated`. Ini berarti setelah setup PIN dari Settings, user akan di-redirect ke `/home`, bukan kembali ke Settings.

**Solusi**: Tambahkan route baru `/settings/pin-setup` yang memakai `SetupPinScreen` tanpa trigger redirect dari router, atau update router agar `/settings/pin-setup` tidak di-redirect ke `/home`:

**Opsi yang direkomendasikan** — Tambahkan route `/settings/pin-setup` yang tidak masuk kondisi redirect:

```dart
// Di app_router.dart, sub-route settings:
GoRoute(
  path: 'pin-setup',  // path: /settings/pin-setup
  pageBuilder: (context, state) => state.slidePage(const SetupPinScreen()),
),

// Di router redirect, update kondisi:
if (authState is Authenticated) {
  if (currentLocation == '/login' || 
      currentLocation == '/onboarding' ||
      currentLocation == '/setup-pin' ||    // Auth flow setup PIN
      currentLocation == '/access-denied') {
    return '/home';
  }
  // /settings/pin-setup — tidak di-redirect ke home
  return null;
}
```

Ubah `IndexSettingScreen` untuk navigasi ke `/settings/pin-setup` (bukan `/setup-pin`):

```dart
onTap: () {
  if (authState is Authenticated && authState.employee.hasPin) {
    context.push('/settings/pin-reset-verify');
  } else {
    context.push('/settings/pin-setup'); // Gunakan route settings variant
  }
},
```

Tambahkan konfirmasi pin route sebagai sub-route atau buat route terpisah `/settings/confirm-pin` yang tidak trigger redirect. Karena `ConfirmPinScreen` dipush dari `SetupPinScreen` ke `/confirm-pin`, router redirect tidak akan trigger untuk route `/confirm-pin` karena tidak ada kondisi yang me-redirect `/confirm-pin` ke home.

---

## Urutan Pengerjaan yang Disarankan

```
Step 1.  Backend: Buat ResetPinRequest.php di app/Http/Requests/Auth/
Step 2.  Backend: Tambah AuthService::resetPin()
Step 3.  Backend: Tambah EmployeeAuthController::resetPin() + import
Step 4.  Backend: Daftarkan route POST /pin/reset di api_mobile_cashier.php
Step 5.  Flutter Domain: Tambah resetPin() di AuthRepository interface
Step 6.  Flutter Domain: Buat ResetPinUseCase di usecases/auth/
Step 7.  Flutter Data: Tambah resetPin() di AuthRemoteDatasource (abstract + impl)
Step 8.  Flutter Data: Tambah endpoint constant untuk /pin/reset di ApiEndpoints
Step 9.  Flutter Data: Implementasi resetPin() di AuthRepositoryImpl
Step 10. Flutter State: Tambah PinResetVerifying dan PinResetSuccess di auth_state.dart
Step 11. Flutter AuthCubit: Tambah ResetPinUseCase dependency dan method resetPin()
Step 12. Flutter Provider: Daftarkan ResetPinUseCase di AuthProvider
Step 13. Flutter Router: Tambah route /settings/pin-reset-verify dan /settings/pin-reset-new
Step 14. Flutter Router: Tambah route /settings/pin-setup (untuk menghindari redirect ke /home)
Step 15. Flutter Screen: Buat ResetPinVerifyScreen
Step 16. Flutter Screen: Buat ResetPinNewScreen
Step 17. Flutter Settings: Update IndexSettingScreen — dynamic label + navigasi yang benar
Step 18. Tests: Tulis unit test dan widget test sesuai test plan
```

---

## Acceptance Criteria

- [ ] Settings menampilkan `Setting PIN` saat `authState.employee.hasPin == false`.
- [ ] Settings menampilkan `Atur Ulang PIN` saat `authState.employee.hasPin == true`.
- [ ] Label `Keamanan PIN` tidak lagi terlihat sebagai label menu utama.
- [ ] Tap `Setting PIN` → masuk flow setup PIN, kembali ke Settings setelah berhasil (bukan `/home`).
- [ ] Tap `Atur Ulang PIN` → `ResetPinVerifyScreen` → `ResetPinNewScreen`.
- [ ] Input PIN lama salah di `ResetPinNewScreen` → error "PIN saat ini tidak valid.", PIN tidak berubah.
- [ ] Konfirmasi PIN baru tidak cocok (client-side) → error, tidak ada request ke backend.
- [ ] Reset PIN berhasil → snackbar "PIN berhasil diubah", kembali ke Settings.
- [ ] Auth state setelah reset PIN tetap `Authenticated`, `hasPin` tetap `true`.
- [ ] Setup PIN berhasil dari Settings → Settings menampilkan `Atur Ulang PIN`.
- [ ] `GET /auth/me` setelah reset PIN mengembalikan `hasPin: true` + `allPermissions` populated.
- [ ] `POST /pin/reset` response tidak mengandung `pin_hash`.
- [ ] `POST /pin/reset` hanya bisa diakses oleh employee authenticated.
- [ ] `POST /pin/reset` dengan `current_pin` salah → 422, PIN tidak berubah.
- [ ] Kegagalan jaringan tidak mengubah `hasPin` di UI.

---

## Test Plan

### Flutter Widget & Navigation Tests

| Skenario | Target file |
|----------|-------------|
| `IndexSettingScreen` dengan `hasPin=false` → tampil `Setting PIN` | `index_setting_screen_test.dart` |
| `IndexSettingScreen` dengan `hasPin=true` → tampil `Atur Ulang PIN` | `index_setting_screen_test.dart` |
| Tap `Setting PIN` → navigasi ke `/settings/pin-setup` | `index_setting_screen_test.dart` |
| Tap `Atur Ulang PIN` → navigasi ke `/settings/pin-reset-verify` | `index_setting_screen_test.dart` |
| `ResetPinVerifyScreen` input 6 digit → navigasi ke `/settings/pin-reset-new` dengan `currentPin` di extra | `reset_pin_verify_screen_test.dart` |
| `ResetPinNewScreen` PIN tidak cocok (client) → error, tidak submit | `reset_pin_new_screen_test.dart` |
| `ResetPinNewScreen` submit → cubit memanggil `resetPin()` dengan params benar | `reset_pin_new_screen_test.dart` |
| `PinResetSuccess` state → snackbar sukses + kembali ke `/settings` | `reset_pin_new_screen_test.dart` |
| `AuthFailureState` di `ResetPinNewScreen` → error ditampilkan, form di-reset | `reset_pin_new_screen_test.dart` |
| `AuthCubit.resetPin()` success → emit `PinResetSuccess` lalu `Authenticated` | `auth_cubit_test.dart` |
| `AuthCubit.resetPin()` failure → emit `AuthFailureState` | `auth_cubit_test.dart` |
| Setup PIN dari `/settings/pin-setup` → tidak di-redirect ke `/home` | `app_router_test.dart` |

### Backend Feature Tests — tambahkan ke `tests/Feature/EmployeePinAuthTest.php`

| Skenario | Assertion |
|----------|-----------|
| `POST /pin/reset` dengan token valid + `current_pin` benar → 200 | Status 200 |
| `POST /pin/reset` berhasil → response mengandung `hasPin: true` | `hasPin == true` |
| `POST /pin/reset` berhasil → response mengandung `allPermissions` tidak kosong | Array tidak kosong |
| `POST /pin/reset` berhasil → response mengandung `accessibleOutlets` tidak kosong | Array tidak kosong |
| `POST /pin/reset` berhasil → response TIDAK mengandung `pin_hash` | Key tidak ada |
| `POST /pin/reset` dengan `current_pin` salah → 422 | Status 422 |
| `POST /pin/reset` dengan `current_pin` salah → PIN tidak berubah | Hash lama masih valid |
| `POST /pin/reset` tanpa token → 401 | Status 401 |
| `POST /pin/reset` oleh employee yang belum punya PIN → 422 | Status 422 |
| `POST /pin/setup` masih menolak employee yang sudah punya PIN | Status 422 |

### Manual Verification — Emulator

1. Login sebagai employee tanpa PIN → buka Settings → verifikasi label `Setting PIN`.
2. Tap `Setting PIN` → setup PIN → setelah berhasil, verifikasi kembali ke Settings (bukan `/home`) → label berubah ke `Atur Ulang PIN`.
3. Tap `Atur Ulang PIN` → masukkan PIN lama yang salah → submit → verifikasi error, tidak ke screen PIN baru.
4. Tap `Atur Ulang PIN` → masukkan PIN lama yang benar → lanjut → input PIN baru → konfirmasi berbeda → verifikasi error client-side.
5. Tap `Atur Ulang PIN` → masukkan PIN lama yang benar → lanjut → input PIN baru → konfirmasi sama → submit → verifikasi snackbar sukses + kembali ke Settings.
6. Verifikasi `GET /auth/me` setelah reset PIN mengembalikan `hasPin: true` di network log.
7. Logout → login ulang → gunakan PIN baru → verifikasi berhasil login.

---

## Catatan Implementer

- **Lokasi `ResetPinRequest.php`**: di `app/Http/Requests/Auth/` — bukan `Requests/Employee/`. Ikuti pola `SetupPinRequest.php` yang ada.
- **PIN lama tidak diverifikasi secara terpisah ke backend** — kedua PIN dikirim sekaligus ke `POST /pin/reset`. Error "PIN lama salah" dikembalikan dari backend sebagai `422` dengan key `current_pin`. Ini membuat flow lebih sederhana dan aman.
- **`currentPin` plain text** disimpan sementara di memory widget saja, tidak ke storage, tidak di-log.
- **`PinBoxInput` widget** sudah ada dan sudah dipakai di `SetupPinScreen` dan `ConfirmPinScreen`. Reuse untuk konsistensi UX.
- **Redirect ke `/home` dari `/setup-pin`**: Router saat ini me-redirect ke `/home` saat state menjadi `Authenticated` dan lokasi adalah `/setup-pin`. Jika setup PIN dibuka dari Settings, user harus dikembalikan ke Settings. Solusi: gunakan route `/settings/pin-setup` yang tidak masuk kondisi redirect (lihat Area 8b).
- **Jangan ubah** flow switch employee, `PinEntryScreen`, `verifyPin()`, atau screen auth lain. Scope plan ini hanya Settings PIN.
- **`PinSecuritySettingScreen`** bisa dipertahankan atau di-deprecate. Tidak perlu dihapus dulu — cukup tidak lagi dinavigasi dari menu utama Settings.
- Gunakan design system `wash_wallet_ui` secara konsisten (`context.colors`, `context.typography`, `context.space`, `context.radius`). Lihat `SetupPinScreen` dan `ConfirmPinScreen` sebagai referensi pola UI yang persis harus diikuti.
