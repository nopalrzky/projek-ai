# Implementation Plan: Bottom Bar Tab State Preservation

## Latar Belakang

Saat ini bottom bar WashWallet Cashier menggunakan `context.go(route)` via GoRouter untuk berpindah antar tab (Home, Dana, Transaksi, Setting). Setiap perpindahan tab membangun ulang screen dari awal, sehingga state lokal (filter pencarian, scroll position, nested navigator stack) hilang. Tujuan implementasi ini adalah:

1. Membuat setiap tab memiliki **navigator stack sendiri** yang tetap hidup (persistent).
2. Perpindahan antar tab menggunakan **animasi horizontal** sesuai arah urutan tab.
3. Mendukung **swipe gesture** kanan-kiri antar root tab jika tidak mengganggu gesture scroll dalam konten.
4. Bottom bar active index selalu sinkron dengan tab yang sedang tampil.

---

## Instruksi Wajib untuk AI Model yang Mengeksekusi Plan Ini

Sebelum menulis kode apapun, baca terlebih dahulu semua spec berikut:

- `docs/spec/cubit_spec.md`
- `docs/spec/state_spec.md`
- `docs/spec/remote_datasource_spec.md`
- `docs/spec/repository_spec.md`
- `docs/spec/repository_impl_spec.md`
- `docs/spec/provider_spec.md`
- `docs/spec/usecase_spec.md`

Aturan kode wajib (tanpa pengecualian):

1. Selalu gunakan widget shared UI dari `wash_wallet_ui` — `AppButton`, `AppCard`, `AppBottomSheet`, `AppLoadingIndicator`, `AppErrorState`, `AppSnackbar`, dst.
2. Jangan hardcode warna — selalu gunakan `context.colors.*` dari theme extension.
3. Jangan hardcode spacing/radius — gunakan `context.space.*` dan `context.radius.*`.
4. Jangan ada comment di kode — clean code bicara sendiri.
5. Pecah widget ke file terpisah di folder `widgets/` — tidak boleh ada widget lebih dari ~80 baris per file.
6. Jangan duplikasi kode antara kasir dan produksi — struktur modul harus sama persis.

---

## Analisis Codebase Saat Ini

### Struktur navigasi yang relevan

| File | Peran saat ini |
|---|---|
| `lib/core/navigation/bottom_nav_helper.dart` | Mendefinisikan item bottom bar (`cashierBottomNavItems`), route mapping (`_rootTabRoutes`), fungsi `getBottomNavIndex()` dan `handleBottomNavTap()` |
| `lib/core/router/app_router.dart` | GoRouter root. Setiap tab (`/home`, `/finances`, `/orders`, `/settings`) adalah `GoRoute` flat. Semua menggunakan `state.slidePage()` |
| `lib/core/router/route_transitions.dart` | `SlideRouteTransition` dan `FadeRouteTransition` — digunakan oleh GoRouter |
| `lib/main.dart` | Entry point. `AppDependencies`, `MainApp`, setup `MultiBlocProvider` global, `MaterialApp.router` |

### Root tab screens

| Tab | Route | Screen | State penting |
|---|---|---|---|
| Home | `/home` | `HomeScreen` (StatefulWidget) | Notification badge, banner timer, `HomeCubit` data |
| Dana | `/finances` | `IndexFinancesScreen` (StatelessWidget) | Tidak ada state lokal di root; sub-navigasi via `Navigator.push` |
| Transaksi | `/orders` | `IndexOrdersScreen` (StatefulWidget) | `_searchController`, `_selectedStatus`, daftar order |
| Setting | `/settings` | `IndexSettingScreen` (StatelessWidget) | Tidak ada state lokal; sub-navigasi via `context.push` GoRouter |

### Sub-navigasi Dana (via `Navigator.push`)

`IndexFinancesScreen` membuka:
- `IndexDepositScreen` (Setoran Kasir) — StatefulWidget dengan search dan filter state
- `IndexPettyCashScreen` (Saldo Petty Cash)
- `IndexExpenseScreen` (Pengeluaran Outlet)

Saat ini semua dibuka dengan `Navigator.push` biasa, artinya stack sub-navigasi tersimpan di dalam Navigator global GoRouter — **bukan** di dalam per-tab Navigator.

### Sub-navigasi Setting (via `context.push` GoRouter)

Setting menggunakan GoRouter nested routes (`/settings/printer`, `/settings/profile`, dll). Ini sudah berada dalam GoRouter stack, bukan per-tab Navigator.

### Masalah utama

- Karena semua tab adalah flat `GoRoute`, berpindah tab dengan `context.go('/orders')` menghancurkan tree widget tab sebelumnya.
- Tidak ada mekanisme untuk mempertahankan widget tree tiap tab saat berpindah.

---

## Pendekatan Implementasi

### Arsitektur: `StatefulShellRoute` (go_router built-in)

GoRouter versi >= 7.x menyediakan `StatefulShellRoute` yang persis untuk kebutuhan ini:
- Setiap tab adalah `StatefulShellBranch` dengan `navigatorKey` sendiri.
- Widget tree tiap tab dipertahankan saat berpindah tab (menggunakan `IndexedStack` secara internal).
- Animasi horizontal diimplementasikan di shell builder.
- Cocok dengan auth guard yang sudah ada di `AppRouter`.

**Perlu verifikasi versi go_router** di `pubspec.yaml` untuk memastikan `StatefulShellRoute` tersedia (butuh >= 7.0.0, idealnya >= 10.0.0).

---

## Proposed Changes

### Langkah 0: Verifikasi dependency

#### [VERIFY] `pubspec.yaml`

Buka `pubspec.yaml` dan pastikan `go_router` versi `>= 7.0.0`. Jika di bawah itu, upgrade terlebih dahulu sebelum melanjutkan.

---

### Langkah 1: Buat `MainShellScreen`

#### [NEW] `lib/core/navigation/main_shell_screen.dart`

Widget baru ini menjadi "pembungkus" utama keempat tab. Tanggung jawabnya:

1. Menampilkan konten tab aktif via `StatefulNavigationShell` (IndexedStack dihandle otomatis oleh `StatefulShellRoute`).
2. Menampilkan bottom bar terpusat — tidak lagi per-screen.
3. Animasi slide horizontal saat pergantian tab.
4. Swipe gesture (opsional) via `GestureDetector`.

```dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_cashier/core/navigation/bottom_nav_helper.dart';

class MainShellScreen extends StatefulWidget {
  final StatefulNavigationShell navigationShell;
  const MainShellScreen({super.key, required this.navigationShell});

  @override
  State<MainShellScreen> createState() => _MainShellScreenState();
}

class _MainShellScreenState extends State<MainShellScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<Offset> _slideAnimation;
  int _previousIndex = 0;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 280),
    );
    _slideAnimation = Tween<Offset>(
      begin: Offset.zero,
      end: Offset.zero,
    ).animate(_animController);
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _onTabTap(int index) {
    if (index == widget.navigationShell.currentIndex) return;
    _runSlideAnimation(
      fromIndex: _previousIndex,
      toIndex: index,
    );
    _previousIndex = index;
    widget.navigationShell.goBranch(
      index,
      initialLocation: index == widget.navigationShell.currentIndex,
    );
  }

  void _runSlideAnimation({required int fromIndex, required int toIndex}) {
    final bool goingRight = toIndex > fromIndex;
    _slideAnimation = Tween<Offset>(
      begin: goingRight
          ? const Offset(1.0, 0.0)
          : const Offset(-1.0, 0.0),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animController,
      curve: Curves.easeInOut,
    ));
    _animController.forward(from: 0);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SlideTransition(
        position: _slideAnimation,
        child: widget.navigationShell,
      ),
      bottomNavigationBar: AppBottomBar.navigation(
        currentIndex: widget.navigationShell.currentIndex,
        onTap: _onTabTap,
        items: cashierBottomNavItems,
      ),
    );
  }
}
```

> **Catatan swipe gesture (opsional):** Dapat ditambahkan `GestureDetector` dengan `onHorizontalDragEnd` di atas `widget.navigationShell`. Gunakan threshold velocity tinggi (>300) untuk menghindari konflik dengan scroll horizontal `OrderFilterChips`. Swipe kiri → tab berikutnya, swipe kanan → tab sebelumnya.

---

### Langkah 2: Refactor `AppRouter`

#### [MODIFY] `lib/core/router/app_router.dart`

**Perubahan utama:**

a. Tambah 4 `GlobalKey<NavigatorState>` baru untuk masing-masing branch tab di dalam class `AppRouter`:

```dart
final _homeNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'homeNav');
final _financesNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'financesNav');
final _ordersNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'ordersNav');
final _settingsNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'settingsNav');
```

b. Tambah `StatefulShellRoute.indexedStack` sebagai route utama yang membungkus keempat root tab. Ganti keempat `GoRoute` flat (`/home`, `/finances`, `/orders`, `/settings`) dengan struktur baru ini:

```dart
StatefulShellRoute.indexedStack(
  builder: (context, state, navigationShell) {
    return MainShellScreen(navigationShell: navigationShell);
  },
  branches: [
    // Branch 0: Home
    StatefulShellBranch(
      navigatorKey: _homeNavigatorKey,
      routes: [
        GoRoute(
          path: '/home',
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: HomeScreen()),
        ),
      ],
    ),

    // Branch 1: Dana
    StatefulShellBranch(
      navigatorKey: _financesNavigatorKey,
      routes: [
        GoRoute(
          path: '/finances',
          pageBuilder: (context, state) {
            final authState = _authCubit.state;
            if (authState is Authenticated) {
              return NoTransitionPage(
                child: IndexFinancesScreen(outletId: authState.employee.outletId),
              );
            } else if (authState is AuthenticatedStale) {
              return NoTransitionPage(
                child: IndexFinancesScreen(outletId: authState.employee.outletId),
              );
            }
            return const NoTransitionPage(child: SizedBox());
          },
        ),
      ],
    ),

    // Branch 2: Transaksi
    StatefulShellBranch(
      navigatorKey: _ordersNavigatorKey,
      routes: [
        GoRoute(
          path: '/orders',
          pageBuilder: (context, state) {
            final authState = _authCubit.state;
            if (authState is Authenticated) {
              return NoTransitionPage(
                child: IndexOrdersScreen(outletId: authState.employee.outletId),
              );
            } else if (authState is AuthenticatedStale) {
              return NoTransitionPage(
                child: IndexOrdersScreen(outletId: authState.employee.outletId),
              );
            }
            return const NoTransitionPage(child: SizedBox());
          },
        ),
      ],
    ),

    // Branch 3: Setting
    StatefulShellBranch(
      navigatorKey: _settingsNavigatorKey,
      routes: [
        GoRoute(
          path: '/settings',
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: IndexSettingScreen()),
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
              path: 'pin-security',
              pageBuilder: (context, state) =>
                  state.slidePage(const PinSecuritySettingScreen()),
            ),
            GoRoute(
              path: 'pin-setup',
              pageBuilder: (context, state) =>
                  state.slidePage(const SetupPinScreen()),
            ),
            GoRoute(
              path: 'confirm-pin',
              pageBuilder: (context, state) {
                final extra = state.extra as Map<String, dynamic>? ?? {};
                return state.slidePage(ConfirmPinScreen(
                  initialPin: extra['initialPin'] as String? ?? '',
                ));
              },
            ),
            GoRoute(
              path: 'pin-reset-verify',
              pageBuilder: (context, state) =>
                  state.slidePage(const ResetPinVerifyScreen()),
            ),
            GoRoute(
              path: 'pin-reset-new',
              pageBuilder: (context, state) {
                final extra = state.extra as Map<String, dynamic>? ?? {};
                final currentPin = extra['currentPin'] as String? ?? '';
                return state.slidePage(ResetPinNewScreen(currentPin: currentPin));
              },
            ),
            GoRoute(
              path: 'setup-outlet',
              pageBuilder: (context, state) =>
                  state.slidePage(const SetupOutletSettingScreen()),
            ),
          ],
        ),
      ],
    ),
  ],
),
```

c. Route non-root seperti `/customers`, `/categories`, `/laundry-services`, `/service-packages`, `/membership-plans` tetap sebagai `GoRoute` flat di luar `StatefulShellRoute` (tidak berubah).

d. Route non-tab (`/splash`, `/login`, `/setup-pin`, `/onboarding`, `/confirm-pin`, `/re-auth-pin`, `/switch-employee`, `/pin-entry`, `/access-denied`) **TIDAK masuk** ke dalam `StatefulShellRoute`. Tetap sebagai `GoRoute` flat di level atas.

e. Tambah import untuk `MainShellScreen`:
```dart
import '../navigation/main_shell_screen.dart';
```

---

### Langkah 3: Hapus Bottom Bar dari Setiap Screen Root Tab

Karena bottom bar kini dikelola oleh `MainShellScreen`, hapus property `bottomBar` dari `AppLayout` di keempat screen berikut.

#### [MODIFY] `lib/features/home/presentation/screens/home_screen.dart`

Hapus block `bottomBar: Builder(...)` dari `AppLayout`:

```dart
// HAPUS bagian ini dari AppLayout:
bottomBar: Builder(
  builder: (context) {
    final location = GoRouterState.of(context).uri.toString();
    return AppBottomBar.navigation(
      currentIndex: getBottomNavIndex(location),
      onTap: (index) => handleBottomNavTap(context, index),
      items: cashierBottomNavItems,
    );
  },
),
```

Juga hapus import `bottom_nav_helper.dart` dan `go_router` jika tidak lagi dipakai di file ini (perlu verifikasi — `HomeScreen` masih menggunakan `context.go` untuk navigasi).

#### [MODIFY] `lib/features/finances/presentation/screens/index_finances_screen.dart`

Hapus block `bottomBar: Builder(...)` dari `AppLayout`. Juga hapus import `bottom_nav_helper.dart` dan `go_router` jika tidak lagi diperlukan.

#### [MODIFY] `lib/features/order/presentation/screens/index_orders_screen.dart`

Hapus block `bottomBar: Builder(...)` dari `AppLayout`. Pertahankan import `go_router` jika masih dipakai di tempat lain dalam file yang sama.

#### [MODIFY] `lib/features/setting/presentation/screens/index_setting_screen.dart`

Hapus block `bottomBar: Builder(...)` dari `AppLayout`. Pertahankan import `go_router` karena masih digunakan untuk `context.push('/settings/...')`.

---

### Langkah 4: Update `bottom_nav_helper.dart`

#### [MODIFY] `lib/core/navigation/bottom_nav_helper.dart`

- **Pertahankan** `cashierBottomNavItems` — masih digunakan oleh `MainShellScreen`.
- **Hapus atau comment** `_rootTabRoutes`, `getBottomNavIndex()`, dan `handleBottomNavTap()` — tidak lagi dibutuhkan setelah refactor.
- **Hapus import** `go_router` jika tidak ada lagi yang menggunakannya.

---

### Langkah 5: Verifikasi `rootNavigator: true`

Grep seluruh codebase untuk `rootNavigator: true`. Jika ditemukan di dalam flow Dana, Transaksi, atau Home, ubah menjadi `rootNavigator: false` atau hapus parameter tersebut.

Perintah grep:
```
grep -r "rootNavigator: true" lib/
```

Jika ada penggunaan di screen detail (create order, show order, dsb.), evaluasi apakah harus tetap menggunakan root navigator atau bisa dipindah ke per-branch navigator.

---

## Ringkasan File yang Diubah

### File Baru
| File | Deskripsi |
|---|---|
| `lib/core/navigation/main_shell_screen.dart` | Shell widget terpusat: bottom bar, animasi tab, opsional swipe |

### File Dimodifikasi
| File | Perubahan |
|---|---|
| `lib/core/router/app_router.dart` | Tambah `StatefulShellRoute.indexedStack`; pindahkan 4 root route ke dalam branches |
| `lib/core/navigation/bottom_nav_helper.dart` | Hapus fungsi tidak terpakai; pertahankan `cashierBottomNavItems` |
| `lib/features/home/presentation/screens/home_screen.dart` | Hapus `bottomBar` dari `AppLayout` |
| `lib/features/finances/presentation/screens/index_finances_screen.dart` | Hapus `bottomBar` dari `AppLayout` |
| `lib/features/order/presentation/screens/index_orders_screen.dart` | Hapus `bottomBar` dari `AppLayout` |
| `lib/features/setting/presentation/screens/index_setting_screen.dart` | Hapus `bottomBar` dari `AppLayout` |

### File Tidak Diubah
| File | Alasan |
|---|---|
| `lib/main.dart` | Tidak perlu perubahan |
| `lib/core/router/route_transitions.dart` | Masih dipakai route non-tab |
| `lib/core/router/auth_guard.dart` | Redirect logic tidak berubah |
| Semua sub-screen (deposit, petty cash, expense, order detail) | Tidak perlu diubah; per-branch navigator otomatis resolved |

---

## Urutan Pengerjaan

1. Verifikasi versi `go_router` di `pubspec.yaml`. Upgrade jika perlu.
2. Buat `lib/core/navigation/main_shell_screen.dart`.
3. Refactor `lib/core/router/app_router.dart` — tambah `StatefulShellRoute`.
4. Hapus `bottomBar` dari keempat screen root tab.
5. Bersihkan `bottom_nav_helper.dart` — hapus fungsi tidak terpakai.
6. Grep dan verifikasi tidak ada `rootNavigator: true` di flow tab utama.
7. Jalankan `flutter analyze` — pastikan tidak ada error.
8. Test manual sesuai acceptance criteria.
9. (Opsional) Tambah swipe gesture di `MainShellScreen`.

---

## Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| `go_router` versi < 7.0.0 tidak support `StatefulShellRoute` | Verifikasi pubspec sebelum mulai; upgrade jika perlu |
| `Navigator.push` menggunakan `rootNavigator: true` di dalam branch | Grep sebelum implementasi; ubah ke false jika ditemukan |
| Animasi slide bentrok dengan GoRouter page transition | Gunakan `NoTransitionPage` untuk semua root tab pages |
| Bottom bar tidak muncul di detail screen (Setoran Kasir, dsb.) | Ini perilaku yang **diinginkan** |
| Auth redirect ke `/home` tapi state branch belum siap | GoRouter `StatefulShellRoute` handle ini secara otomatis |
| Swipe gesture konflik dengan `OrderFilterChips` scroll horizontal | Gunakan velocity threshold tinggi (>300) atau disable swipe sementara |
| `_previousIndex` tidak sinkron jika tab berpindah via `context.go` | Override `didUpdateWidget` di `MainShellScreen` untuk sinkronkan `_previousIndex` dari `navigationShell.currentIndex` |

---

## Acceptance Criteria (referensi dari user need)

- [ ] Home → Dana: transisi horizontal.
- [ ] Home → Transaksi: transisi horizontal.
- [ ] Dana → Setoran Kasir → pindah tab → kembali ke Dana → tetap di Setoran Kasir.
- [ ] Dana → Saldo Petty Cash atau Pengeluaran Outlet → pindah tab → kembali → tetap di halaman terakhir.
- [ ] Transaksi: filter, pencarian, scroll tetap tersimpan saat pindah tab dan kembali.
- [ ] Detail Transaksi terbuka → pindah tab → kembali → tetap di detail transaksi.
- [ ] Bottom bar active index selalu sesuai tab yang ditampilkan.
- [ ] Tap tab aktif tidak menumpuk route duplikat.
- [ ] Auth flow (logout, switch employee, re-auth, redirect) tetap berfungsi normal.
- [ ] Route non-root (create order, setup PIN, printer setting, dll.) tetap berfungsi dan tidak memiliki bottom bar.
