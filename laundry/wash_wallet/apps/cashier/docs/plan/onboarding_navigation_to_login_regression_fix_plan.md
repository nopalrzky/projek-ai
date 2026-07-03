# Plan: Fix Navigasi Onboarding → Login/Switch Employee

## Context

`docs/issue/onboarding_navigation_to_login_current_regression_issue.md` adalah hasil review yang menyimpulkan fix lama (`docs/plan/onboarding_navigation_to_login_fix_plan.md`, sudah diimplementasikan — `AuthCubit.completeOnboarding()` sudah ada dan onboarding screen sudah delegasikan ke cubit) belum tentu menyelesaikan masalah, dan meminta model berikutnya menyusun implementation plan dengan mulai dari keputusan produk soal remembered-account branch.

Investigasi kode lebih dalam (pembacaan langsung `lib/core/router/app_router.dart`, tidak ada perubahan kode dilakukan pada tahap ini) menemukan **root cause konkret yang lebih mendasar** dan menjelaskan langsung judul issue "onboarding selesai tidak selalu berakhir di login":

### Root Cause Terverifikasi

Redirect logic umum di `GoRouter.redirect` (`app_router.dart:227-326`) — bukan `_resolveRouteFromState` yang hanya dipakai saat `currentLocation == '/splash'` — menangani navigasi setelah `AuthCubit` emit state baru dari `/onboarding`. Untuk state `Unauthenticated`/`AuthFailureState`:

```dart
// app_router.dart:285-302
final isProtectedRoute =
    currentLocation == '/home' ||
    currentLocation.startsWith('/orders') ||
    ... // /customers, /categories, /laundry-services, /service-packages,
        // /membership-plans, /settings, /finances, /outlets, /profile,
        // /printer, /pin-security, /deposits, /petty-cashes, /expenses, /units
    currentLocation.startsWith('/units');

// app_router.dart:317-323
if (authState is Unauthenticated || authState is AuthFailureState) {
  if (isProtectedRoute) {
    final from = Uri.encodeComponent(state.uri.toString());
    return '/login?from=$from';
  }
  return null;   // <-- tidak ada redirect!
}
```

`/onboarding` **tidak** termasuk dalam daftar `isProtectedRoute`. Artinya: ketika user di `/onboarding` menekan `Lewati`/`Mulai Sekarang` pada **fresh storage** (tidak ada remembered employee), `AuthCubit.completeOnboarding()` emit `Unauthenticated` — tapi redirect callback mengembalikan `null` karena `isProtectedRoute` bernilai `false` untuk `/onboarding`. **User tetap tertahan di `/onboarding`, tidak pernah pindah ke `/login`.**

Sebagai pembanding, blok `AuthRequiresSwitchEmployee` tepat di atasnya (`app_router.dart:309-315`) menggunakan pola berbeda — bukan whitelist `isProtectedRoute`, melainkan blacklist lokasi (`currentLocation != '/switch-employee' && currentLocation != '/login'`), sehingga dari `/onboarding` state ini SELALU redirect ke `/switch-employee`. Inilah sebabnya remembered-account storage tampak "berhasil" pindah, sementara fresh storage (tanpa remembered account) macet — persis kebalikan dari asumsi review sebelumnya, dan cocok dengan judul issue "tidak selalu berakhir di login".

Temuan ini lebih konkret dan bisa diverifikasi langsung lewat widget test (lihat Task 2), sehingga tidak memerlukan keputusan produk untuk diperbaiki — ini murni bug pada whitelist redirect.

### Isu Sekunder (Butuh Keputusan Produk, non-blocking untuk fix utama)

Terlepas dari bug di atas, ada pertanyaan produk yang masih terbuka: apakah remembered-account storage setelah onboarding memang seharusnya ke `/switch-employee` (perilaku saat ini, konsisten dengan `AuthCubit.checkAuthStatus()` yang punya logic identik untuk boot flow normal), atau harus selalu ke `/login`. Unit test yang sudah ada di `test/features/auth/presentation/bloc/auth_cubit_test.dart:317-353` (grup `completeOnboarding`) sudah mengunci behavior saat ini (remembered → `AuthRequiresSwitchEmployee`). Karena ini konsisten dengan boot flow lain dan sudah di-lock oleh test yang lolos, plan ini **tidak mengubah logic itu** — hanya memperbaiki bug redirect di atas. Jika stakeholder nanti memutuskan lain, itu perubahan terpisah.

### Konvensi Test yang Wajib Diikuti

- **Tidak ada mocktail/mockito/bloc_test** di `pubspec.yaml`. Semua test pakai fake class manual yang `implements` interface asli, sebagian dengan `noSuchMethod` passthrough, sebagian dengan field `callMock` yang bisa di-assign closure. Ikuti pola ini, jangan tambah dependency baru.
- Pola test router: lihat `test/core/router/app_router_test.dart` — helper `_makeAuthCubit(AuthState initialState)` yang langsung `..emit(initialState)`, lalu `tester.pumpWidget(BlocProvider.value(value: authCubit, child: MaterialApp.router(routerConfig: appRouter.router, theme: ThemeData(extensions: [AppColorExtension.light(), AppRadiusExtension.light(), AppSpacingExtension.light(), AppTypographyExtension.light()]))))`, assert via `appRouter.router.routerDelegate.currentConfiguration.fullPath`.
- Pola test cubit: lihat `test/features/auth/presentation/bloc/auth_cubit_test.dart` — `SharedPreferences.setMockInitialValues({})` di `setUp()`, assert emitted states via `authCubit.stream.listen(states.add)`.

## Task 1 — Fix Router Redirect (root cause utama)

**File:** `lib/core/router/app_router.dart`, blok `if (authState is Unauthenticated || authState is AuthFailureState)` di sekitar baris 317-323.

Tambahkan `/onboarding` sebagai lokasi yang wajib redirect ke `/login` saat state `Unauthenticated`/`AuthFailureState`, konsisten dengan pola blok `AuthRequiresOnboarding`/`AuthRequiresSwitchEmployee` di atasnya:

```dart
if (authState is Unauthenticated || authState is AuthFailureState) {
  if (currentLocation == '/onboarding') {
    return '/login';
  }
  if (isProtectedRoute) {
    final from = Uri.encodeComponent(state.uri.toString());
    return '/login?from=$from';
  }
  return null;
}
```

**Jangan** menambahkan `/onboarding` ke daftar `isProtectedRoute` — daftar itu dipakai untuk skema `?from=` redirect-back setelah login, dan `/onboarding` bukan halaman yang perlu di-restore setelah login (perilaku redirect-back untuk onboarding tidak masuk akal). Gunakan pengecekan eksplisit terpisah seperti contoh di atas agar semantiknya jelas dan tidak mengubah behavior route lain.

**Jangan** mengubah blok `AuthRequiresSwitchEmployee` maupun logic `AuthCubit.completeOnboarding()` / `checkAuthStatus()` — behavior remembered-account sudah benar dan sudah di-lock oleh test yang ada.

## Task 2 — Widget Test Baru untuk Onboarding Screen

**File baru:** `test/features/onboarding/presentation/screens/onboarding_screen_test.dart`

Ikuti pola provider/router setup dari `test/core/router/app_router_test.dart` (gunakan `AppRouter` asli, bukan router tiruan, agar redirect logic sungguhan ikut teruji). Skenario:

1. **Fresh storage, tap `Lewati`:** `SharedPreferences.setMockInitialValues({})`, buat `AuthCubit` real dengan mock usecases minimal (ikuti pola `_MockLoginUsecase implements LoginUsecase { noSuchMethod... }` dari `app_router_test.dart`), emit `AuthRequiresOnboarding` sebagai state awal, render `MaterialApp.router` dengan `AppRouter`, arahkan ke `/onboarding`, tap tombol berlabel `Lewati` (hanya tampil di halaman pertama/kedua, bukan halaman terakhir), `await tester.pumpAndSettle()`, assert `fullPath == '/login'` dan `prefs.getBool('is_onboarding_done') == true`.
2. **Fresh storage, halaman terakhir, tap `Mulai Sekarang`:** dari state awal sama, tap tombol `Selanjutnya` dua kali (untuk mencapai halaman ke-3 dari 3 halaman di `onboarding_screen.dart:17-36`), lalu tap `Mulai Sekarang`, assert `fullPath == '/login'`.
3. **Remembered-account storage:** seed `prefs.setString('cashier_remembered_employee_accounts_v1', '<json accounts, contoh yang sama seperti di auth_cubit_test.dart:337-338>')` sebelum render, tap `Mulai Sekarang`/`Lewati`, assert `fullPath == '/switch-employee'` (mengunci behavior yang sudah ada, bukan regresi).

Skenario 1 & 2 adalah yang akan **gagal sebelum Task 1 diterapkan** (karena redirect null) dan **lolos setelahnya** — jadikan ini bukti verifikasi fix.

## Task 3 — Tambahan Test Router (opsional tapi direkomendasikan)

**File:** `test/core/router/app_router_test.dart` — tambahkan test-case baru (bukan mengubah yang sudah ada):

- `authCubit` mulai dari state `Unauthenticated` di lokasi `/onboarding` (via `appRouter.router.go('/onboarding')` sebelum pump, mirip pola loop `for (final route in [...])` yang sudah ada untuk rute protected) → assert redirect ke `/login`.
- `authCubit` mulai dari state `AuthRequiresSwitchEmployee` di lokasi `/onboarding` → assert redirect ke `/switch-employee` (regression guard untuk behavior yang sudah benar, supaya tidak sengaja rusak saat orang lain edit blok ini nanti).

## File yang Terlibat

| File | Perubahan |
|---|---|
| `lib/core/router/app_router.dart` | Tambah 1 pengecekan `/onboarding` di blok `Unauthenticated`/`AuthFailureState` |
| `test/features/onboarding/presentation/screens/onboarding_screen_test.dart` | **File baru** — 3 skenario widget test |
| `test/core/router/app_router_test.dart` | Tambah 2 test-case baru (opsional) |
| `docs/issue/onboarding_navigation_to_login_current_regression_issue.md` | Tambah section "Resolusi" yang mendokumentasikan root cause sebenarnya (whitelist `isProtectedRoute` tidak mencakup `/onboarding`) dan bahwa remembered-account → `/switch-employee` adalah expected behavior (konsisten dengan `checkAuthStatus()`), bukan regresi |

## Verification Plan

1. `flutter analyze` — tidak ada warning/error baru.
2. `flutter test test/features/onboarding/presentation/screens/onboarding_screen_test.dart` — semua 3 skenario lolos setelah fix Task 1 diterapkan. Jalankan juga **sebelum** fix untuk memastikan skenario 1 & 2 memang gagal (bukti bug nyata), lalu commit fix.
3. `flutter test test/core/router/app_router_test.dart` — pastikan test lama tetap lolos + test baru (jika ditambahkan) lolos.
4. `flutter test test/features/auth/presentation/bloc/auth_cubit_test.dart` — pastikan tidak ada regresi (tidak ada perubahan di file ini, jadi harus tetap lolos seperti semula).
5. Jika command `flutter test` sebelumnya sempat timeout (dicatat di issue doc lama), jalankan test per-file secara terpisah dan catat hasil aktualnya di issue doc sebagai bukti, jangan berasumsi.
6. Manual check (opsional, emulator/device): install fresh (clear storage) → onboarding muncul → tap `Lewati` → pastikan mendarat di `/login` (sebelumnya macet di `/onboarding`). Ulangi dengan akun yang sudah pernah "ingat saya" → pastikan mendarat di `/switch-employee`.
