# Issue: Onboarding selesai tetapi tidak redirect ke login

## Scope Debug

Dokumen ini hanya berisi hasil debug dan rekomendasi perbaikan. Tidak ada perubahan implementasi pada kode aplikasi.

Expected behavior berdasarkan laporan: setelah user menekan `Lewati` atau `Mulai Sekarang`, onboarding disimpan selesai dan aplikasi masuk ke screen login.

Actual behavior yang terindikasi: aplikasi tetap berada atau kembali ke `/onboarding`.

## Ringkasan Root Cause

Tombol onboarding sudah memanggil navigasi ke `/login`, tetapi state auth global masih `AuthRequiresOnboarding`. Saat `context.go('/login')` dipanggil, `AppRouter.redirect` membaca state tersebut dan memaksa route kembali ke `/onboarding`.

Dengan kata lain, masalah utama bukan pada tombol `Lewati`, bukan pada halaman onboarding ke-3, dan bukan pada `context.go('/login')` itu sendiri. Masalahnya ada pada state machine auth yang tidak berubah setelah onboarding ditandai selesai.

## Bukti Kode

### 1. Onboarding selesai menyimpan flag lalu navigasi ke login

`lib/features/onboarding/presentation/screens/onboarding_screen.dart:51-57`:

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

Ini menunjukkan action utama sudah menyimpan onboarding sebagai complete dan mencoba pindah ke `/login`.

### 2. `Lewati` dan `Mulai Sekarang` memakai flow yang sama

`lib/features/onboarding/presentation/screens/onboarding_screen.dart:61-73`:

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

`Lewati` memanggil `_onSkip()`, sedangkan tombol terakhir `Mulai Sekarang` memanggil `_onNext()` lalu `_onGetStarted()`. Jadi bug berlaku untuk kedua entry point tersebut.

### 3. Router memaksa `AuthRequiresOnboarding` kembali ke `/onboarding`

`lib/core/router/app_router.dart:143-145`:

```dart
if (authState is AuthRequiresOnboarding) {
  if (currentLocation != '/onboarding') return '/onboarding';
  return null;
}
```

Selama `AuthCubit.state` masih `AuthRequiresOnboarding`, route apapun selain `/onboarding` akan dipaksa balik ke `/onboarding`, termasuk `/login`.

### 4. Auth state hanya berubah dari onboarding saat `checkAuthStatus()` dijalankan

`lib/features/auth/presentation/bloc/auth_cubit.dart:103-116`:

```dart
failure: (failure) async {
  final prefs = await SharedPreferences.getInstance();
  final onboardingService = OnboardingService(prefs);
  if (!onboardingService.isCompleted()) {
    emit(const AuthRequiresOnboarding());
    return;
  }
  final ds = RememberedEmployeeLocalDatasourceImpl(prefs);
  final accounts = await ds.getAccounts();
  if (accounts.isNotEmpty) {
    emit(const AuthRequiresSwitchEmployee());
  } else {
    emit(const Unauthenticated());
  }
},
```

Logic ini sudah benar untuk bootstrap auth: jika onboarding sudah selesai, state berikutnya menjadi `AuthRequiresSwitchEmployee` atau `Unauthenticated`. Namun setelah `_onGetStarted()` memanggil `onboardingService.complete()`, tidak ada pemanggilan `checkAuthStatus()` atau method lain yang mengubah state aktif dari `AuthRequiresOnboarding`.

### 5. Flag onboarding memang disimpan di shared preferences

`../../packages/wash_wallet_core/lib/src/services/onboarding_service.dart`:

```dart
class OnboardingService {
  static const String _onboardingKey = 'is_onboarding_done';
  final SharedPreferences _prefs;

  OnboardingService(this._prefs);

  bool isCompleted() {
    return _prefs.getBool(_onboardingKey) ?? false;
  }

  Future<void> complete() async {
    await _prefs.setBool(_onboardingKey, true);
  }
}
```

Storage flag onboarding tidak terlihat sebagai penyebab utama. Masalahnya adalah router menggunakan state `AuthCubit` yang belum ikut diupdate setelah flag berubah.

## Analisis Alur Bug

1. App start dengan onboarding belum complete.
2. `AuthCubit.checkAuthStatus()` emit `AuthRequiresOnboarding`.
3. Router mengarahkan user ke `/onboarding`.
4. User menekan `Lewati` atau `Mulai Sekarang`.
5. `_onGetStarted()` memanggil `OnboardingService.complete()`, sehingga `SharedPreferences['is_onboarding_done'] = true`.
6. `_onGetStarted()` memanggil `context.go('/login')`.
7. `AppRouter.redirect` tetap melihat `authState is AuthRequiresOnboarding`.
8. Router menolak `/login` dan redirect kembali ke `/onboarding`.

## Catatan Log Emulator

Log seperti berikut tidak menunjukkan exception Flutter yang relevan dengan bug ini:

```text
EGL_emulation app_time_stats
Package ... reported as REPLACED
```

`EGL_emulation app_time_stats` umum muncul dari emulator Android. `Package ... reported as REPLACED` biasanya muncul saat app diinstall ulang atau hot restart/redeploy. Keduanya tidak cukup untuk menjelaskan redirect balik ke onboarding.

Indikator yang lebih kuat adalah kombinasi:

- `context.go('/login')` sudah dipanggil dari onboarding.
- `AppRouter.redirect` memaksa `AuthRequiresOnboarding` tetap ke `/onboarding`.
- `AuthCubit` tidak emit state baru setelah onboarding complete.

## Rekomendasi Fix untuk Implementasi Berikutnya

### Opsi aman

Tambahkan method di `AuthCubit`, misalnya `completeOnboarding()`, yang:

1. Menyimpan onboarding complete melalui `OnboardingService`.
2. Mengecek remembered employee account.
3. Emit `AuthRequiresSwitchEmployee` jika ada remembered employee.
4. Emit `Unauthenticated` jika tidak ada remembered employee.

Dengan opsi ini, onboarding screen tidak langsung menjadi pemilik keputusan auth flow. Screen cukup memanggil method auth flow, lalu router mengikuti state baru.

### Opsi minimal

Setelah `onboardingService.complete()`, panggil `context.read<AuthCubit>().checkAuthStatus()` dan biarkan router menentukan route dari state baru.

Catatan: opsi ini lebih kecil, tetapi pastikan tidak membuat loading/flicker yang mengganggu dan pastikan dependency `AuthCubit` tersedia pada subtree onboarding.

### Hal yang sebaiknya dihindari

Jangan hanya menambah pengecualian router seperti "jika di `/login`, abaikan `AuthRequiresOnboarding`". Itu bisa membuat state auth dan storage onboarding tidak sinkron. Root cause tetap state `AuthCubit` yang stale setelah onboarding selesai.

## Test Plan

Tambahkan widget/router test untuk tombol `Lewati`:

1. Initial auth state `AuthRequiresOnboarding`.
2. Render onboarding dengan router.
3. Tap `Lewati`.
4. Pastikan `SharedPreferences['is_onboarding_done'] == true`.
5. Pastikan route akhir `/login`.

Tambahkan skenario tombol terakhir:

1. Initial auth state `AuthRequiresOnboarding`.
2. Tap `Selanjutnya` sampai halaman ke-3.
3. Tap `Mulai Sekarang`.
4. Pastikan `SharedPreferences['is_onboarding_done'] == true`.
5. Pastikan route akhir `/login`.

Tambahkan test state transition auth:

1. State awal `AuthRequiresOnboarding`.
2. Onboarding complete dipanggil.
3. Jika tidak ada remembered employee, state menjadi `Unauthenticated`.
4. Jika ada remembered employee, state menjadi `AuthRequiresSwitchEmployee`.

## Catatan Verifikasi

Catatan dari sesi debug sebelumnya: `flutter test test/core/router/app_router_test.dart` sempat dijalankan tetapi timeout setelah 120 detik, sehingga belum ada hasil test valid untuk bug ini.

Karena dokumen ini hanya hasil debug, acceptance untuk tahap ini adalah:

- File issue tersedia di `docs/issue/onboarding_navigation_to_login_debug_issue.md`.
- Dokumen menjelaskan root cause router/auth state stale.
- Dokumen memuat bukti kode dan test plan untuk implementasi berikutnya.
