# Plan: Migrasi Semua Route Cashier ke Standalone GoRouter Route

## Latar Belakang

Cashier app menggunakan `GoRouter` dengan `StatefulShellRoute.indexedStack` untuk
navigasi tab (Home / Dana / Transaksi / Setting).  Saat ini route fitur operasional
(`/customers`, `/categories`, dll.) hanya berupa `redirect` ke path relatif yang
tidak valid, sementara implementasi screen aslinya masih berada di bawah
`/settings/setup-outlet/...`.  Route untuk Dana & Keuangan (`/deposits`,
`/petty-cashes`, `/expenses`) belum terdaftar sama sekali di `AppRouter`, dan
navigasi dari `IndexFinancesScreen` masih memakai `Navigator.push` (bukan GoRouter).

Sidebar tablet (`CashierNavigationConfig`) sudah benar mengarah ke route standalone,
tetapi router belum mengikuti. `MainShellScreen` masih membaca path nested lama untuk
menentukan active highlight sidebar.

Keputusan product: app belum release, tidak perlu backward compatibility. Semua
route fitur harus standalone di root level.

---

## Scope Pekerjaan

File utama yang akan dimodifikasi:

| File | Aksi |
|---|---|
| `lib/core/router/app_router.dart` | Refactor utama — tambah standalone routes, hapus nested lama, perluas auth guard |
| `lib/core/navigation/main_shell_screen.dart` | Perbarui `currentRouteId` mapping ke standalone routes |
| `lib/features/finances/presentation/screens/index_finances_screen.dart` | Ganti `Navigator.push` -> `context.go(...)` |
| `test/core/router/app_router_test.dart` | Tambah test cases baru |

File yang **tidak** perlu diubah:
- `cashier_navigation_config.dart` — sudah benar
- `bottom_nav_helper.dart` — tidak berubah
- Semua screen dart di dalam `features/` — tidak ada perubahan public API

---

## Langkah-langkah Implementasi

### Langkah 1 — Refactor `AppRouter`: Tambah Standalone Routes Operasional

**File:** `lib/core/router/app_router.dart`

**Yang harus dilakukan:**

Hapus blok redirect alias di bagian bawah `routes` list (baris ~709–728):

```dart
// HAPUS semua ini:
GoRoute(path: '/customers', redirect: (context, state) => 'customers'),
GoRoute(path: '/categories', redirect: (context, state) => 'categories'),
GoRoute(path: '/laundry-services', redirect: (context, state) => 'laundry-services'),
GoRoute(path: '/service-packages', redirect: (context, state) => 'service-packages'),
GoRoute(path: '/membership-plans', redirect: (context, state) => 'membership-plans'),
```

Tambahkan **di luar** `StatefulShellRoute` (setelah baris `GoRoute(path: '/dashboard', ...)`),
route standalone berikut. Gunakan helper `_resolveOutletId()` — buat sebagai
private method di dalam class `AppRouter`:

```dart
int? _resolveOutletId() {
  final authState = _authCubit.state;
  if (authState is Authenticated) return authState.employee.outletId;
  if (authState is AuthenticatedStale) return authState.employee.outletId;
  return null;
}
```

#### Route yang perlu ditambahkan

```
/customers
  /customers/create
  /customers/:id
  /customers/:id/edit

/categories
  /categories/create
  /categories/:id
  /categories/:id/edit

/laundry-services
  /laundry-services/create
  /laundry-services/:id
  /laundry-services/:id/edit

/service-packages
  /service-packages/:id

/membership-plans
```

Pola `pageBuilder` untuk index screen (gunakan `state.slidePage` untuk konsistensi):

```dart
GoRoute(
  path: '/customers',
  pageBuilder: (context, state) {
    final outletId = _resolveOutletId();
    if (outletId != null) {
      return state.slidePage(IndexCustomersScreen(outletId: outletId));
    }
    return state.slidePage(const _LoadingScaffold());
  },
  routes: [
    GoRoute(
      path: 'create',
      pageBuilder: (context, state) {
        final outletId = _resolveOutletId();
        if (outletId != null) {
          return state.slidePage(CreateCustomerScreen(outletId: outletId));
        }
        return state.slidePage(const _LoadingScaffold());
      },
    ),
    GoRoute(
      path: ':id',
      pageBuilder: (context, state) {
        final id = int.tryParse(state.pathParameters['id'] ?? '');
        if (id != null) return state.slidePage(ShowCustomerScreen(customerId: id));
        return state.slidePage(const _NotFoundScaffold());
      },
    ),
    GoRoute(
      path: ':id/edit',
      pageBuilder: (context, state) {
        final item = state.extra;
        if (item is Customer) {
          return state.slidePage(EditCustomerScreen(customer: item));
        }
        return state.slidePage(const _EditErrorScaffold());
      },
    ),
  ],
),
```

Terapkan pola yang sama untuk `/categories` (dengan `Category`/`EditCategoryScreen`),
`/laundry-services` (dengan `LaundryService`/`EditLaundryServiceScreen`),
`/service-packages`, dan `/membership-plans`.

> **Penting:** Route nested `/settings/setup-outlet/customers`,
> `/settings/setup-outlet/categories`, dll. di dalam `StatefulShellBranch` settings
> **dihapus** setelah route standalone ini selesai. Hapus juga
> `GoRoute(path: 'setup-outlet', ...)` beserta semua child-nya.
> Sub-route `printer`, `profile`, `pin-security`, `pin-setup`, `confirm-pin`,
> `pin-reset-verify`, `pin-reset-new` yang saat ini nested di bawah `/settings`
> tetap dipertahankan karena merupakan bagian dari alur multi-step PIN.

---

### Langkah 2 — Tambah Standalone Route Settings

**File:** `lib/core/router/app_router.dart`

Tambahkan route berikut **di luar** `StatefulShellRoute`, sejajar dengan route
standalone operasional:

```dart
GoRoute(
  path: '/profile',
  pageBuilder: (context, state) => state.slidePage(const ProfileSettingScreen()),
),
GoRoute(
  path: '/printer',
  pageBuilder: (context, state) => state.slidePage(const PrinterSettingScreen()),
),
GoRoute(
  path: '/pin-security',
  pageBuilder: (context, state) => state.slidePage(const PinSecuritySettingScreen()),
),
```

Route lama `/settings/profile`, `/settings/printer`, `/settings/pin-security`
yang berada di bawah `StatefulShellBranch` settings **dihapus**.

> Sub-route alur PIN (pin-setup, confirm-pin, pin-reset-verify, pin-reset-new)
> tetap nested di dalam `/settings` karena merupakan sub-halaman multi-step.

---

### Langkah 3 — Tambah Standalone Route Dana & Keuangan

**File:** `lib/core/router/app_router.dart`

Tambahkan tiga route berikut di luar `StatefulShellRoute`:

```dart
GoRoute(
  path: '/deposits',
  pageBuilder: (context, state) {
    final outletId = _resolveOutletId();
    if (outletId != null) {
      return state.slidePage(IndexDepositScreen(outletId: outletId));
    }
    return state.slidePage(const _LoadingScaffold());
  },
),
GoRoute(
  path: '/petty-cashes',
  pageBuilder: (context, state) =>
      state.slidePage(const IndexPettyCashScreen()),
),
GoRoute(
  path: '/expenses',
  pageBuilder: (context, state) {
    final outletId = _resolveOutletId();
    if (outletId != null) {
      return state.slidePage(IndexExpenseScreen(outletId: outletId));
    }
    return state.slidePage(const _LoadingScaffold());
  },
),
```

Tambahkan juga import yang diperlukan di bagian atas file:

```dart
import '../../features/deposit/presentation/screens/index_deposit_screen.dart';
import '../../features/petty_cash/presentation/screens/index_petty_cash_screen.dart';
import '../../features/expense/presentation/screens/index_expense_screen.dart';
```

Konstruktor screen (referensi dari codebase):
- `IndexDepositScreen({required int outletId})`
- `IndexPettyCashScreen({int? cashierId})` — optional, bisa dipanggil tanpa arg
- `IndexExpenseScreen({required int outletId})`

---

### Langkah 4 — Perluas Auth Guard (isProtectedRoute)

**File:** `lib/core/router/app_router.dart` — fungsi `redirect`, sekitar baris 143.

Ganti:

```dart
final isProtectedRoute =
    currentLocation == '/home' ||
    currentLocation.startsWith('/orders') ||
    currentLocation.startsWith('/customers') ||
    currentLocation.startsWith('/settings') ||
    currentLocation.startsWith('/finances') ||
    currentLocation.startsWith('/outlets');
```

Dengan:

```dart
final isProtectedRoute =
    currentLocation == '/home' ||
    currentLocation.startsWith('/orders') ||
    currentLocation.startsWith('/customers') ||
    currentLocation.startsWith('/categories') ||
    currentLocation.startsWith('/laundry-services') ||
    currentLocation.startsWith('/service-packages') ||
    currentLocation.startsWith('/membership-plans') ||
    currentLocation.startsWith('/settings') ||
    currentLocation.startsWith('/finances') ||
    currentLocation.startsWith('/outlets') ||
    currentLocation.startsWith('/profile') ||
    currentLocation.startsWith('/printer') ||
    currentLocation.startsWith('/pin-security') ||
    currentLocation.startsWith('/deposits') ||
    currentLocation.startsWith('/petty-cashes') ||
    currentLocation.startsWith('/expenses');
```

---

### Langkah 5 — Tambah Error/Loading Widget Helpers

**File:** `lib/core/router/app_router.dart` (tambahkan di bagian paling bawah file,
setelah class `GoRouterRefreshStream`)

```dart
class _EditErrorScaffold extends StatelessWidget {
  const _EditErrorScaffold();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tidak dapat membuka halaman')),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red),
            SizedBox(height: 16),
            Text(
              'Data tidak tersedia untuk mode edit.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 8),
            Text(
              'Silakan kembali dan coba lagi.',
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _LoadingScaffold extends StatelessWidget {
  const _LoadingScaffold();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: CircularProgressIndicator()));
  }
}

class _NotFoundScaffold extends StatelessWidget {
  const _NotFoundScaffold();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: const Center(child: Text('Halaman tidak ditemukan')),
    );
  }
}
```

> Catatan: Widget-widget ini menggantikan pola inline `Scaffold(body: Center(...))` 
> yang tersebar di berbagai route saat ini. Semua route yang sebelumnya menggunakan
> pola tersebut juga boleh diganti dengan helper ini untuk konsistensi.

---

### Langkah 6 — Perbarui Active Route Mapping di `MainShellScreen`

**File:** `lib/core/navigation/main_shell_screen.dart` — blok if-else sekitar baris 127–157.

Ganti **seluruh** blok mapping tersebut dengan:

```dart
final location = GoRouterState.of(context).matchedLocation;
String currentRouteId = 'home';

if (location.startsWith('/orders')) {
  currentRouteId = 'orders';
} else if (location.startsWith('/finances')) {
  currentRouteId = 'finances';
} else if (location.startsWith('/customers')) {
  currentRouteId = 'customers';
} else if (location.startsWith('/categories')) {
  currentRouteId = 'categories';
} else if (location.startsWith('/laundry-services')) {
  currentRouteId = 'laundry-services';
} else if (location.startsWith('/service-packages')) {
  currentRouteId = 'service-packages';
} else if (location.startsWith('/membership-plans')) {
  currentRouteId = 'membership-plans';
} else if (location.startsWith('/deposits')) {
  currentRouteId = 'deposits';
} else if (location.startsWith('/petty-cashes')) {
  currentRouteId = 'petty-cashes';
} else if (location.startsWith('/expenses')) {
  currentRouteId = 'expenses';
} else if (location.startsWith('/profile')) {
  currentRouteId = 'profile';
} else if (location.startsWith('/printer')) {
  currentRouteId = 'printer';
} else if (location.startsWith('/pin-security')) {
  currentRouteId = 'pin-security';
} else if (location.startsWith('/settings')) {
  currentRouteId = 'settings';
}
```

Semua mapping ke path nested lama (`/settings/setup-outlet/...`) **dihapus**
karena route tersebut sudah tidak ada.

---

### Langkah 7 — Ganti `Navigator.push` di `IndexFinancesScreen` dengan GoRouter

**File:** `lib/features/finances/presentation/screens/index_finances_screen.dart`

Tambahkan import:

```dart
import 'package:go_router/go_router.dart';
```

Ganti tiga method navigasi (baris ~284–303):

```dart
// SEBELUM:
void _navigateToCashDeposit(BuildContext context) {
  Navigator.push(context, MaterialPageRoute(
    builder: (_) => IndexDepositScreen(outletId: outletId)));
}
void _navigateToPettyCash(BuildContext context) {
  Navigator.push(context, MaterialPageRoute(
    builder: (_) => const IndexPettyCashScreen()));
}
void _navigateToCashExpense(BuildContext context) {
  Navigator.push(context, MaterialPageRoute(
    builder: (_) => IndexExpenseScreen(outletId: outletId)));
}

// SESUDAH:
void _navigateToCashDeposit(BuildContext context) {
  context.go('/deposits');
}
void _navigateToPettyCash(BuildContext context) {
  context.go('/petty-cashes');
}
void _navigateToCashExpense(BuildContext context) {
  context.go('/expenses');
}
```

Hapus juga tiga import screen yang tidak lagi dipakai di file ini:

```dart
// HAPUS:
import '../../../deposit/presentation/screens/index_deposit_screen.dart';
import '../../../petty_cash/presentation/screens/index_petty_cash_screen.dart';
import '../../../expense/presentation/screens/index_expense_screen.dart';
```

> **Behavior compact vs tablet:**
> - **Compact/Android**: user masuk `/finances` via tab "Dana" di bottom nav,
>   lalu memilih sub-menu -> `context.go('/deposits')` dst.
> - **Tablet/sidebar**: `CashierNavigationConfig` langsung mengarah ke `/deposits`
>   dll. via `context.go(item.route!)`.
> Keduanya dilayani oleh route standalone yang sama.

---

### Langkah 8 — Tambah Test Cases Router

**File:** `test/core/router/app_router_test.dart`

Test yang sudah ada dan tetap harus pass:
- Redirect dari `/splash` ke `/setup-pin` saat `AuthSetupPinRequired`
- Tidak redirect saat `SwitchPinVerifying`
- Tidak redirect saat `SwitchPinFailure`

**Tambahkan test cases baru:**

#### 8a. Unauthenticated redirect ke `/login` untuk route standalone

Buat helper widget test yang navigate ke route tertentu dan verifikasi redirect
ke `/login?from=...`. Contoh untuk satu route, kemudian replikasi:

```dart
testWidgets('unauthenticated redirect /deposits -> /login', (tester) async {
  final authCubit = _makeAuthCubit(const Unauthenticated());
  final appRouter = AppRouter(
    authCubit: authCubit,
    navigatorKey: GlobalKey<NavigatorState>(),
    splashScreen: const SizedBox(),
  );
  // Verify redirect logic via router.redirect directly
  final redirectResult = await appRouter.router.routerDelegate
      .currentConfiguration.fullPath;
  // Alternative: use router.redirect() directly by inspecting the guard logic
  // Expect: location contains '/login'
});
```

Lakukan untuk: `/categories`, `/laundry-services`, `/service-packages`,
`/membership-plans`, `/profile`, `/printer`, `/pin-security`,
`/deposits`, `/petty-cashes`, `/expenses`.

#### 8b. Route standalone valid di GoRouter

```dart
test('AppRouter has valid route for /deposits', () {
  final authCubit = _makeAuthCubit(const Unauthenticated());
  final appRouter = AppRouter(
    authCubit: authCubit,
    navigatorKey: GlobalKey<NavigatorState>(),
    splashScreen: const SizedBox(),
  );
  // Verifikasi bahwa route terdaftar dengan mengecek apakah
  // GoRouter tidak throw RouteNotFoundException
  // (bisa menggunakan try-catch atau inspeksi routeConfiguration)
});
```

#### 8c. Route edit tanpa `state.extra` menampilkan error page, tidak crash

```dart
testWidgets('/customers/:id/edit without extra shows error scaffold', (tester) async {
  final authCubit = _makeAuthCubit(Authenticated(tEmployee));
  final appRouter = AppRouter(
    authCubit: authCubit,
    navigatorKey: GlobalKey<NavigatorState>(),
    splashScreen: const SizedBox(),
  );
  // Navigate ke /customers/1/edit tanpa state.extra
  // Expect: tidak throw, menampilkan widget error
});
```

> **Catatan testability:** Test router sebelumnya timeout (120–240 detik).
> Gunakan `pump` + `tester.pump(Duration.zero)` alih-alih `pumpAndSettle` jika
> ada animasi infinite. Pastikan mock semua dependency BLoC.

---

## Urutan Eksekusi yang Direkomendasikan

```
1. Langkah 5  — Tambah error/loading widget helpers (tidak ada dependency lain)
2. Langkah 1  — Tambah standalone routes operasional + hapus nested lama
3. Langkah 2  — Tambah standalone routes settings (profile, printer, pin-security)
4. Langkah 3  — Tambah standalone routes Dana & Keuangan (deposits, petty-cashes, expenses)
5. Langkah 4  — Perluas auth guard isProtectedRoute
6. Langkah 6  — Perbarui MainShellScreen currentRouteId mapping
7. Langkah 7  — Ganti Navigator.push di IndexFinancesScreen dengan context.go
8. flutter analyze -> pastikan bersih sebelum lanjut ke test
9. Langkah 8  — Tambah test cases
10. flutter test test/core/router/app_router_test.dart -> pastikan pass
```

---

## Checklist Validasi Akhir

- [ ] `flutter analyze` -> `No issues found`
- [ ] Semua route `CashierNavigationConfig.buildSections()` resolve ke GoRoute yang valid (tidak 404)
- [ ] `/customers`, `/categories`, `/laundry-services`, `/service-packages`, `/membership-plans` -> screen langsung tampil tanpa melalui `/settings`
- [ ] `/profile`, `/printer`, `/pin-security` -> screen langsung tampil tanpa melalui `/settings`
- [ ] `/deposits`, `/petty-cashes`, `/expenses` -> screen langsung tampil
- [ ] Semua route standalone di atas di-guard -> unauthenticated diarahkan ke `/login?from=...`
- [ ] Sidebar highlight aktif sesuai untuk setiap route standalone
- [ ] `/customers/:id/edit` tanpa `state.extra` -> menampilkan error page, tidak crash
- [ ] `/categories/:id/edit` tanpa `state.extra` -> menampilkan error page, tidak crash
- [ ] `/laundry-services/:id/edit` tanpa `state.extra` -> menampilkan error page, tidak crash
- [ ] Compact/Android: tab "Dana" -> `/finances` -> pilih Setoran -> GoRouter navigate ke `/deposits`
- [ ] Tablet/sidebar: item "Setoran" di sidebar -> langsung `/deposits`, tidak melalui `/finances`
- [ ] `/settings` tetap ada dan dapat diakses sebagai hub compact
- [ ] Sub-flow PIN (`/settings/pin-setup`, `/settings/confirm-pin`, dll.) masih berfungsi
- [ ] Router tests pass (tidak timeout)

---

## Asumsi

- AI executor **tidak** perlu membuat screen baru — semua screen sudah ada di codebase.
- Route nested `/settings/setup-outlet/...` dihapus sepenuhnya setelah standalone tersedia.
- Route `/settings` tetap ada sebagai hub compact (tab Setting di bottom nav).
- Sub-flow PIN (`/settings/pin-setup`, `/settings/confirm-pin`, dll.) tetap nested di bawah `/settings`.
- `IndexPettyCashScreen` tidak membutuhkan `outletId` (konstruktor sudah optional `cashierId`).
- Tidak ada perubahan pada desain visual atau logika bisnis screen — murni perubahan routing.
- `state.slidePage(...)` adalah extension dari `route_transitions.dart` yang sudah ada.
