# Issue: Onboarding selesai tidak selalu berakhir di login

## Scope Review

Dokumen ini adalah handoff untuk model/AI berikutnya agar menyusun implementation plan. Tidak ada perubahan kode yang dilakukan di tahap review ini.

Dokumen lama `docs/issue/onboarding_navigation_to_login_debug_issue.md` sebagian sudah stale. Root cause lama menyebut onboarding hanya menyimpan flag lalu `context.go('/login')`, sementara kode saat ini sudah memanggil `AuthCubit.completeOnboarding()`.

## Expected Behavior

Berdasarkan laporan/stakeholder expectation: setelah user menekan `Lewati` atau `Mulai Sekarang`, onboarding disimpan selesai dan aplikasi masuk ke screen login.

Ekspektasi ini perlu dikonfirmasi untuk kasus storage yang sudah punya remembered employee account.

## Current Behavior yang Terlihat dari Kode

Saat ini flow onboarding adalah:

1. `OnboardingScreen._onGetStarted()` memanggil `AuthCubit.completeOnboarding()`.
2. `AuthCubit.completeOnboarding()` menyimpan onboarding complete.
3. Jika tidak ada remembered employee, cubit emit `Unauthenticated`.
4. Jika ada remembered employee, cubit emit `AuthRequiresSwitchEmployee`.
5. Router mengarahkan `Unauthenticated` ke `/login`.
6. Router mengarahkan `AuthRequiresSwitchEmployee` dari `/onboarding` ke `/switch-employee`.

Jadi fresh storage seharusnya berakhir di `/login`, tetapi storage dengan remembered account dapat berakhir di `/switch-employee`.

## Bukti Kode

### 1. Onboarding screen sudah memakai AuthCubit

`lib/features/onboarding/presentation/screens/onboarding_screen.dart`:

```dart
Future<void> _onGetStarted() async {
  if (!mounted) return;
  await context.read<AuthCubit>().completeOnboarding();
}
```

`Lewati` dan `Mulai Sekarang` tetap memakai flow yang sama:

```dart
void _onNext() {
  if (_currentPage < _pages.length - 1) {
    _pageController.nextPage(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  } else {
    _onGetStarted();
  }
}

void _onSkip() {
  _onGetStarted();
}
```

### 2. AuthCubit complete onboarding punya dua cabang hasil

`lib/features/auth/presentation/bloc/auth_cubit.dart`:

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

Ini memperbaiki masalah state `AuthRequiresOnboarding` yang stale, tetapi juga berarti hasil setelah onboarding tidak selalu login.

### 3. Router memetakan state ke route berbeda

`lib/core/router/app_router.dart`:

```dart
if (authState is AuthRequiresSwitchEmployee) return '/switch-employee';
if (authState is Unauthenticated || authState is AuthFailureState) {
  return '/login';
}
```

Pada redirect umum:

```dart
if (authState is AuthRequiresSwitchEmployee) {
  if (currentLocation != '/switch-employee' &&
      currentLocation != '/login') {
    return '/switch-employee';
  }
  return null;
}
```

Saat current location masih `/onboarding`, state `AuthRequiresSwitchEmployee` akan redirect ke `/switch-employee`.

## Dugaan Mismatch Saat Ini

Jika stakeholder menganggap semua penyelesaian onboarding harus menuju `/login`, maka perilaku current remembered-account branch adalah mismatch:

```text
Onboarding selesai
-> remembered employee ada
-> AuthRequiresSwitchEmployee
-> /switch-employee
```

Namun jika product flow memang ingin remembered employee langsung masuk ke switch employee/pin flow, maka behavior current code bisa jadi benar. Yang hilang adalah test eksplisit dan keputusan produk yang terdokumentasi.

## Gap Test

Belum ada bukti automated test yang memastikan:

- Fresh storage: tap `Lewati` berakhir di `/login`.
- Fresh storage: halaman terakhir tap `Mulai Sekarang` berakhir di `/login`.
- Remembered-account storage: setelah onboarding selesai harus ke `/login` atau `/switch-employee`.

Tanpa test ini, bug yang dilaporkan bisa terus ambigu antara regresi actual, stale issue doc, dan expected behavior yang belum disepakati.

## Rekomendasi Arah Implementasi

Implementation plan berikutnya perlu dimulai dari keputusan produk:

1. Untuk fresh storage, `Lewati` dan `Mulai Sekarang` harus menuju `/login`.
2. Untuk storage dengan remembered employee, tentukan apakah expected route adalah `/login` atau `/switch-employee`.
3. Jika expected route adalah selalu `/login`, ubah branch `completeOnboarding()` atau redirect logic agar remembered employee tidak mengambil alih setelah onboarding.
4. Jika expected route adalah `/switch-employee` untuk remembered account, update issue lama/QA expectation agar tidak menandai behavior tersebut sebagai bug.

Jangan hanya mengacu pada `docs/issue/onboarding_navigation_to_login_debug_issue.md` karena dokumen itu menggambarkan kode sebelum `AuthCubit.completeOnboarding()` ada di onboarding flow.

## Acceptance Criteria

Acceptance minimum untuk implementasi berikutnya:

- `Lewati` dari onboarding pada fresh storage menyimpan onboarding complete dan route akhir adalah `/login`.
- `Mulai Sekarang` dari halaman terakhir pada fresh storage menyimpan onboarding complete dan route akhir adalah `/login`.
- Skenario remembered-account storage memiliki expected route yang eksplisit dan teruji.
- Dokumen/debug issue lama tidak lagi dipakai sebagai satu-satunya sumber root cause tanpa melihat current code.

Jika keputusan produk adalah remembered account tetap ke switch employee:

- Route akhir `/switch-employee` untuk remembered-account storage harus dianggap expected.
- Test harus menegaskan behavior tersebut agar tidak dianggap regresi login.

Jika keputusan produk adalah onboarding selalu ke login:

- `completeOnboarding()` atau router perlu diubah agar remembered-account branch tidak membawa user ke `/switch-employee` setelah onboarding.
- Test harus menegaskan remembered-account storage tetap berakhir di `/login`.

## Verification Plan

Tambahkan atau verifikasi widget/router test:

1. Fresh storage: render onboarding dari state `AuthRequiresOnboarding`, tap `Lewati`, assert route akhir `/login`.
2. Fresh storage: render onboarding, pindah ke halaman terakhir, tap `Mulai Sekarang`, assert route akhir `/login`.
3. Remembered-account storage: seed remembered employee, complete onboarding, assert route sesuai keputusan produk (`/login` atau `/switch-employee`).

Tambahkan atau verifikasi unit test `AuthCubit.completeOnboarding()`:

1. Tanpa remembered employee, emit `Unauthenticated`.
2. Dengan remembered employee, emit behavior yang disepakati.

## Catatan Test Review

Tidak ada automated test valid yang diperoleh dalam review ini. Catatan dari sesi review: command berikut sempat dijalankan tetapi timeout, sehingga hasilnya tidak bisa dipakai sebagai bukti regresi atau keberhasilan:

```text
flutter test test/features/auth/presentation/bloc/auth_cubit_test.dart test/core/router/app_router_test.dart
flutter test test/features/auth/presentation/bloc/auth_cubit_test.dart
```

## Resolusi

- **Root Cause:** Redirect logic untuk state `Unauthenticated` di router hanya me-whitelist `isProtectedRoute` untuk kembali ke path semula. `/onboarding` tidak masuk daftar tersebut, sehingga router mereturn `null` alih-alih redirect ke `/login` saat state menjadi `Unauthenticated`.
- **Expected Behavior & Keputusan Produk:**
  - Fresh storage setelah onboarding akan selalu menuju `/login`.
  - Storage dengan remembered account setelah onboarding akan menuju `/switch-employee` (sesuai behavior `AuthCubit.completeOnboarding()` dan `AuthCubit.checkAuthStatus()`). Behavior ini valid dan bukan regresi.
- **Fix:** Menambahkan pengecekan eksplisit `currentLocation == '/onboarding'` di dalam redirect block `Unauthenticated` (atau `AuthFailureState`) di `app_router.dart` yang mengarahkan user ke `/login`.
- **Test:** Menambahkan widget test `test/features/onboarding/presentation/screens/onboarding_screen_test.dart` untuk memverifikasi redirect saat menekan `Lewati` atau `Mulai Sekarang`, baik dengan kondisi storage kosong maupun yang telah memiliki remembered employee account, serta menambahkan test case pada `test/core/router/app_router_test.dart`.
