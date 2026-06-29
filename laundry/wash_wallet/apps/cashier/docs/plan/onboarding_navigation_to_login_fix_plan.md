# Fix: Onboarding Selesai Tidak Redirect ke Login

## Latar Belakang & Root Cause

Setelah user menyelesaikan onboarding (via tombol `Lewati` atau `Mulai Sekarang`), aplikasi seharusnya berpindah ke screen login. Namun aplikasi justru tetap berada atau kembali ke `/onboarding`.

**Root Cause:** `_onGetStarted()` di `onboarding_screen.dart` memanggil `onboardingService.complete()` (menyimpan flag ke SharedPreferences) lalu `context.go('/login')`. Namun `AuthCubit` masih dalam state `AuthRequiresOnboarding`. Ketika router memeriksa state saat navigasi, `AppRouter.redirect` membaca state yang stale ini dan memaksa route kembali ke `/onboarding`, sehingga navigasi ke `/login` tidak pernah berhasil.

**Komponen yang terlibat:**

| File | Masalah |
|---|---|
| `onboarding_screen.dart` | Tidak memperbarui state `AuthCubit` setelah onboarding selesai |
| `auth_cubit.dart` | Tidak memiliki method khusus untuk handle transisi setelah onboarding selesai |
| `app_router.dart` | Membaca state `AuthRequiresOnboarding` yang stale saat redirect |

---

## Strategi Fix

Menggunakan **Opsi Aman** dari rekomendasi dokumen debug: menambahkan method `completeOnboarding()` di `AuthCubit` yang menangani keseluruhan flow transisi auth setelah onboarding selesai. Onboarding screen hanya cukup memanggil satu method ini, kemudian router akan bereaksi terhadap state baru yang di-emit.

> [!IMPORTANT]
> **Jangan** menambahkan pengecualian di router (misalnya mengabaikan `AuthRequiresOnboarding` saat di `/login`). Ini akan membuat state auth dan storage tidak sinkron. Root cause tetap state `AuthCubit` yang stale.

---

## Proposed Changes

### Layer 1 — Auth Cubit

#### [MODIFY] [auth_cubit.dart](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart)

Tambahkan method baru `completeOnboarding()` yang:
1. Mengambil instance `SharedPreferences`.
2. Memanggil `OnboardingService.complete()` untuk menyimpan flag.
3. Memeriksa apakah ada remembered employee via `RememberedEmployeeLocalDatasourceImpl`.
4. Emit `AuthRequiresSwitchEmployee` jika ada remembered employee, atau emit `Unauthenticated` jika tidak ada.

```dart
Future<void> completeOnboarding() async {
  final prefs = await SharedPreferences.getInstance();
  final onboardingService = OnboardingService(prefs);
  await onboardingService.complete();

  final ds = RememberedEmployeeLocalDatasourceImpl(prefs);
  final accounts = await ds.getAccounts();
  if (accounts.isNotEmpty) {
    emit(const AuthRequiresSwitchEmployee());
  } else {
    emit(const Unauthenticated());
  }
}
```

> [!NOTE]
> Method ini memindahkan tanggung jawab penyimpanan onboarding dari screen ke cubit, sehingga state machine auth selalu sinkron dengan storage.

---

### Layer 2 — Onboarding Screen

#### [MODIFY] [onboarding_screen.dart](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/features/onboarding/presentation/screens/onboarding_screen.dart)

Ubah `_onGetStarted()` agar tidak lagi mengelola `SharedPreferences` secara langsung. Cukup delegasikan ke `AuthCubit.completeOnboarding()`, kemudian hapus `context.go('/login')` secara manual karena router akan otomatis bereaksi terhadap state baru.

**Sebelum (buggy):**
```dart
Future<void> _onGetStarted() async {
  final prefs = await SharedPreferences.getInstance();
  final onboardingService = OnboardingService(prefs);
  await onboardingService.complete();

  if (mounted) {
    context.go('/login');
  }
}
```

**Sesudah (fixed):**
```dart
Future<void> _onGetStarted() async {
  if (!mounted) return;
  await context.read<AuthCubit>().completeOnboarding();
  // Router akan otomatis redirect berdasarkan state baru dari AuthCubit
}
```

> [!IMPORTANT]
> Pastikan `AuthCubit` sudah tersedia di subtree `OnboardingScreen`. Cek apakah cubit sudah diprovide di level router atau provider yang mencakup onboarding route. Jika belum, tambahkan provider yang sesuai.

---

## Alur Setelah Fix

```
User tap "Lewati" / "Mulai Sekarang"
        │
        ▼
_onGetStarted() dipanggil
        │
        ▼
AuthCubit.completeOnboarding()
  ├── OnboardingService.complete() → SharedPreferences['is_onboarding_done'] = true
  └── Cek remembered employee
        ├── Ada  → emit AuthRequiresSwitchEmployee
        └── Tidak ada → emit Unauthenticated
        │
        ▼
AppRouter.redirect() membaca state baru
  ├── AuthRequiresSwitchEmployee → route ke switch employee screen
  └── Unauthenticated → route ke /login ✓
```

---

## Hal yang TIDAK Perlu Diubah

- `OnboardingService` (storage logic sudah benar)
- `AppRouter.redirect` logic (sudah benar, hanya perlu state yang tepat)
- `AuthCubit.checkAuthStatus()` (logic bootstrap sudah benar)
- `_onNext()` dan `_onSkip()` di onboarding screen (cukup panggil `_onGetStarted()`)

---

## Test Plan

### Widget Test — Tombol `Lewati`

```dart
// test/features/onboarding/presentation/screens/onboarding_screen_test.dart
testWidgets('Lewati → onboarding complete → navigasi ke /login', (tester) async {
  // 1. Setup: mock SharedPreferences, AuthCubit dengan state AuthRequiresOnboarding
  // 2. Render OnboardingScreen dengan router
  // 3. Tap tombol 'Lewati'
  // 4. Verifikasi SharedPreferences['is_onboarding_done'] == true
  // 5. Verifikasi route akhir adalah /login (atau Unauthenticated state)
});
```

### Widget Test — Tombol `Mulai Sekarang`

```dart
testWidgets('Mulai Sekarang → onboarding complete → navigasi ke /login', (tester) async {
  // 1. Setup: mock SharedPreferences, AuthCubit dengan state AuthRequiresOnboarding
  // 2. Render OnboardingScreen dengan router
  // 3. Swipe/tap Selanjutnya sampai halaman ke-3
  // 4. Tap tombol 'Mulai Sekarang'
  // 5. Verifikasi SharedPreferences['is_onboarding_done'] == true
  // 6. Verifikasi route akhir adalah /login (atau Unauthenticated state)
});
```

### Unit Test — `AuthCubit.completeOnboarding()`

```dart
// test/features/auth/presentation/bloc/auth_cubit_test.dart
group('completeOnboarding', () {
  test('emit Unauthenticated jika tidak ada remembered employee', () async {
    // 1. State awal: AuthRequiresOnboarding
    // 2. Setup mock: onboarding belum done, tidak ada remembered account
    // 3. Panggil cubit.completeOnboarding()
    // 4. Verifikasi SharedPreferences['is_onboarding_done'] == true
    // 5. Verifikasi state akhir adalah Unauthenticated
  });

  test('emit AuthRequiresSwitchEmployee jika ada remembered employee', () async {
    // 1. State awal: AuthRequiresOnboarding
    // 2. Setup mock: ada remembered account
    // 3. Panggil cubit.completeOnboarding()
    // 4. Verifikasi state akhir adalah AuthRequiresSwitchEmployee
  });
});
```

---

## Verification Plan

### Automated

```bash
# Jalankan setelah implementasi selesai
flutter analyze
flutter test test/features/auth/presentation/bloc/auth_cubit_test.dart
flutter test test/features/onboarding/presentation/screens/onboarding_screen_test.dart
```

### Manual (Device/Emulator)

1. Install fresh (clear storage) → pastikan onboarding muncul
2. Tap **`Lewati`** → verifikasi app masuk ke `/login` tanpa kembali ke onboarding
3. Install fresh lagi → Swipe sampai halaman terakhir → Tap **`Mulai Sekarang`** → verifikasi app masuk ke `/login`
4. Login sebagai employee → logout → pastikan app langsung ke `/login` (bukan onboarding) karena flag sudah tersimpan

> [!NOTE]
> Pastikan test `flutter test test/core/router/app_router_test.dart` yang sebelumnya timeout juga dijalankan ulang dan tidak ada timeout setelah implementasi ini.
