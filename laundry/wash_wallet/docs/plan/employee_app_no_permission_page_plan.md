# Plan: Halaman No-Permission dan Tab Dinamis Aplikasi Produksi

## Referensi

- User Need: `docs/user_need/employee_app_no_permission_page_user_need.md`
- Spec Standarisasi: `apps/production/docs/model_standarization_spec.md`
- Spec Remote Datasource: `apps/production/docs/remote_datasource_standarization.md`

---

## Instruksi Penting untuk AI Model

Sebelum mengerjakan plan ini, **wajib baca** file-file berikut:

1. `apps/production/docs/model_standarization_spec.md`
2. `apps/production/docs/remote_datasource_standarization.md`

Selama implementasi:

- Selalu gunakan widget shared dari `package:wash_wallet_ui/wash_wallet_ui.dart` (`AppButton`, `AppCard`, `AppLayout`, `AppHeader`, `AppBottomBar`, `AppLoadingIndicator`, dsb). Jangan buat ulang komponen yang sudah ada.
- Selalu gunakan `context.colors`, `context.typography`, `context.space`, `context.radius` — **tidak boleh hardcode warna, ukuran font, atau spacing**.
- Pecah widget menjadi file-file kecil dalam folder `widgets/`. Satu file satu tanggung jawab.
- Tidak boleh ada comment dalam kode. Clean code.
- Kode per file tidak boleh terlalu panjang. Jika screen melebihi ~150 baris, ekstrak bagian-bagian ke widget terpisah.

---

## Konteks Codebase

### AuthEmployee Entity

```
AuthEmployee {
  id, name, username, email, phone,
  outletId,
  accessibleOutlets: List<OutletAccess>,
  allPermissions: List<String>,
  hasPermission(String key): bool,
  hasAnyPermission(List<String> keys): bool,
}
```

`allPermissions` adalah daftar flat semua permission aktif employee lintas outlet.

### AuthState

```dart
sealed class AuthState
  AuthInitial | AuthLoading | Authenticated(employee) | Unauthenticated | AuthFailureState
```

`AuthCubit` sudah memiliki method `refreshMe()` yang memanggil endpoint `/me` dan memperbarui state.

### Routing

App menggunakan `go_router`. Router berada di `lib/core/router/app_router.dart`. Route guard saat ini hanya mengecek `Authenticated` vs `Unauthenticated` tanpa mengecek permission.

### Bottom Navigation Saat Ini

Semua screen memiliki `AppBottomBar.navigation` dengan 4 item hardcode:
- Index 0: Home (`/home`)
- Index 1: Pesanan (`/orders`) — **perlu diganti menjadi Produksi**
- Index 2: Kurir (`/pickup-schedule`)
- Index 3: Profil

---

## Keputusan Teknis

### Permission Minimum Akses

| Area | Permission Minimum |
|---|---|
| Aplikasi Produksi (boleh masuk) | `production.view` ATAU `courier.view` |
| Tab Produksi | `production.view` |
| Tab Kurir | `courier.view` |

Jika employee tidak punya permission apapun dari dua jenis di atas, aplikasi menampilkan halaman no-permission seluruh aplikasi.

### Route No-Permission

Route tunggal `/no-permission` menerima parameter query untuk konteks:

```
/no-permission?context=app        -> no-permission seluruh aplikasi produksi
/no-permission?context=production -> no-permission tab Produksi
/no-permission?context=courier    -> no-permission tab Kurir
```

### Tab Dinamis

Tab dibentuk berdasarkan permission:

| Kondisi | Tab yang Muncul |
|---|---|
| `production.view` saja | Home, Produksi, Profil |
| `courier.view` saja | Home, Kurir, Profil |
| Keduanya | Home, Produksi, Kurir, Profil |
| Tidak ada keduanya | `/no-permission?context=app` |

### Pengecekan Permission

Pengecekan dilakukan di dua titik:

1. **Setelah login berhasil** — di `app_router.dart` dalam `redirect`.
2. **Saat restore session** — `SplashScreen` memanggil `checkAuthStatus()`, setelah state `Authenticated` diterima, router redirect memeriksa permission.

---

## Proposed Changes

### 1. PermissionChecker — Helper Util

#### [NEW] `lib/core/utils/permission_checker.dart`

Buat helper class stateless untuk mengecek permission terkait aplikasi produksi.

```dart
class PermissionChecker {
  static const String productionView = 'production.view';
  static const String courierView = 'courier.view';

  static bool hasProductionAccess(AuthEmployee employee) =>
      employee.hasPermission(productionView);

  static bool hasCourierAccess(AuthEmployee employee) =>
      employee.hasPermission(courierView);

  static bool hasAnyAppAccess(AuthEmployee employee) =>
      hasProductionAccess(employee) || hasCourierAccess(employee);
}
```

---

### 2. AppRouter — Redirect Berbasis Permission

#### [MODIFY] `lib/core/router/app_router.dart`

Perbarui `redirect` agar:

1. Jika state `Authenticated` dan employee tidak punya permission app -> redirect ke `/no-permission?context=app`.
2. Jika state `Authenticated` dan berada di `/no-permission` tetapi sudah punya permission -> redirect ke `/home`.
3. Tambahkan route `/no-permission`.
4. Tambahkan guard untuk route `/orders` (Produksi) dan `/pickup-schedule` (Kurir): jika tidak punya permission yang sesuai, redirect ke `/no-permission?context=production` atau `/no-permission?context=courier`.

Import `permission_checker.dart` dan `no_permission_screen.dart`.

Pola redirect yang diharapkan:

```dart
redirect: (context, state) {
  final authState = _authCubit.state;
  final location = state.matchedLocation;

  if (location == '/splash') return null;

  if (authState is Authenticated) {
    final employee = authState.employee;

    if (location == '/login' || location == '/onboarding') return '/home';

    if (!PermissionChecker.hasAnyAppAccess(employee)) {
      if (location == '/no-permission') return null;
      return '/no-permission?context=app';
    }

    if (location == '/no-permission') return '/home';

    if (location.startsWith('/orders') && !PermissionChecker.hasProductionAccess(employee)) {
      return '/no-permission?context=production';
    }

    if (location.startsWith('/pickup-schedule') && !PermissionChecker.hasCourierAccess(employee)) {
      return '/no-permission?context=courier';
    }

    return null;
  }

  if (authState is Unauthenticated || authState is AuthFailureState) {
    if (location == '/home' || location.startsWith('/orders') ||
        location.startsWith('/pickup-schedule') || location == '/no-permission') {
      return '/login';
    }
    return null;
  }

  return null;
},
```

Tambahkan route baru di dalam `routes`:

```dart
GoRoute(
  path: '/no-permission',
  pageBuilder: (context, state) {
    final ctx = state.uri.queryParameters['context'] ?? 'app';
    return state.fadePage(NoPermissionScreen(permissionContext: ctx));
  },
),
```

---

### 3. NoPermissionScreen — Screen Utama

#### [NEW] `lib/features/no_permission/presentation/screens/no_permission_screen.dart`

Screen reusable yang menerima `permissionContext` (`app`, `production`, `courier`).

Screen ini:
- Menggunakan `Scaffold` dengan body `SafeArea` (tidak perlu AppLayout karena tidak ada header/bottom bar)
- Tidak memuat data operasional
- Menampilkan widget-widget dari folder `widgets/`

Struktur screen:

```dart
class NoPermissionScreen extends StatelessWidget {
  final String permissionContext;

  const NoPermissionScreen({super.key, required this.permissionContext});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(context.space.xl),
          child: Column(
            children: [
              const Spacer(),
              NoPermissionIllustration(permissionContext: permissionContext),
              SizedBox(height: context.space.xxl),
              NoPermissionMessage(permissionContext: permissionContext),
              SizedBox(height: context.space.lg),
              NoPermissionEmployeeInfo(),
              const Spacer(),
              NoPermissionActions(),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

### 4. Widget: NoPermissionIllustration

#### [NEW] `lib/features/no_permission/presentation/widgets/no_permission_illustration.dart`

Menampilkan icon besar dan badge konteks.

- Container dengan background `context.colors.errorContainer`
- Icon `Icons.lock_outline_rounded` besar dengan warna `context.colors.error`
- Tidak ada teks di widget ini (teks ada di `NoPermissionMessage`)

---

### 5. Widget: NoPermissionMessage

#### [NEW] `lib/features/no_permission/presentation/widgets/no_permission_message.dart`

Menampilkan judul dan pesan berdasarkan `permissionContext`.

Mapping copy:

| `permissionContext` | Judul | Pesan |
|---|---|---|
| `app` | Akses Ditolak | Anda tidak memiliki izin untuk mengakses aplikasi produksi. Silakan hubungi owner outlet Anda untuk meminta akses. |
| `production` | Tab Tidak Tersedia | Anda tidak memiliki izin untuk membuka tab Produksi. Silakan hubungi owner outlet Anda untuk meminta akses. |
| `courier` | Tab Tidak Tersedia | Anda tidak memiliki izin untuk membuka tab Kurir. Silakan hubungi owner outlet Anda untuk meminta akses. |

---

### 6. Widget: NoPermissionEmployeeInfo

#### [NEW] `lib/features/no_permission/presentation/widgets/no_permission_employee_info.dart`

Menampilkan informasi kontekstual employee menggunakan `AppCard`:

- Nama employee
- Nama outlet utama (dari `accessibleOutlets` berdasarkan `outletId`)

Ambil data dari `BlocBuilder<AuthCubit, AuthState>`. Jika state bukan `Authenticated`, tampilkan `SizedBox.shrink()`.

---

### 7. Widget: NoPermissionActions

#### [NEW] `lib/features/no_permission/presentation/widgets/no_permission_actions.dart`

Menampilkan tombol-tombol aksi menggunakan `AppButton`:

1. **Cek Ulang Akses** — `AppButton.primary` full width
   - Memanggil `context.read<AuthCubit>().refreshMe()`
   - Tampilkan `isLoading: true` saat state `AuthLoading`
   - Jika setelah refresh state menjadi `Authenticated` dengan permission valid -> router otomatis redirect ke `/home`
   - Jika masih tanpa permission -> tampilkan snackbar "Akses belum tersedia. Hubungi owner outlet Anda."

2. **Keluar** — `AppButton.secondary` full width
   - Memanggil `context.read<AuthCubit>().logout()`
   - Router otomatis redirect ke `/login` karena state menjadi `Unauthenticated`

Gunakan `BlocConsumer<AuthCubit, AuthState>` untuk menangani loading state dan side effect redirect.

---

### 8. Helper: BottomBarItemsBuilder

#### [NEW] `lib/core/utils/bottom_bar_items_builder.dart`

Buat helper yang mengembalikan daftar `AppBottomBarItem` dan mapping index -> route berdasarkan permission employee.

```dart
class BottomBarItemsBuilder {
  static List<AppBottomBarItem> buildItems(AuthEmployee employee) {
    return [
      const AppBottomBarItem(
        icon: Icons.home_outlined,
        activeIcon: Icons.home,
        label: 'Home',
      ),
      if (PermissionChecker.hasProductionAccess(employee))
        const AppBottomBarItem(
          icon: Icons.receipt_long_outlined,
          activeIcon: Icons.receipt_long,
          label: 'Produksi',
        ),
      if (PermissionChecker.hasCourierAccess(employee))
        const AppBottomBarItem(
          icon: Icons.local_shipping_outlined,
          activeIcon: Icons.local_shipping,
          label: 'Kurir',
        ),
      const AppBottomBarItem(
        icon: Icons.person_outline,
        activeIcon: Icons.person,
        label: 'Profil',
      ),
    ];
  }

  static Map<int, String> buildRouteMap(AuthEmployee employee) {
    final map = <int, String>{};
    int index = 0;
    map[index++] = '/home';
    if (PermissionChecker.hasProductionAccess(employee)) map[index++] = '/orders';
    if (PermissionChecker.hasCourierAccess(employee)) map[index++] = '/pickup-schedule';
    return map;
  }
}
```

---

### 9. Widget: AppDynamicBottomBar

#### [NEW] `lib/core/widgets/app_dynamic_bottom_bar.dart`

Widget reusable yang membaca state `AuthCubit` dan merender `AppBottomBar.navigation` secara dinamis.
Dipakai di semua screen sebagai pengganti `AppBottomBar.navigation` yang hardcode.

```dart
class AppDynamicBottomBar extends StatelessWidget {
  final String currentRoute;

  const AppDynamicBottomBar({super.key, required this.currentRoute});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthCubit, AuthState>(
      builder: (context, state) {
        if (state is! Authenticated) return const SizedBox.shrink();

        final employee = state.employee;
        final items = BottomBarItemsBuilder.buildItems(employee);
        final routeMap = BottomBarItemsBuilder.buildRouteMap(employee);
        final currentIndex = routeMap.entries
            .firstWhere(
              (e) => e.value == currentRoute,
              orElse: () => const MapEntry(0, '/home'),
            )
            .key;

        return AppBottomBar.navigation(
          currentIndex: currentIndex,
          items: items,
          onTap: (index) {
            final route = routeMap[index];
            if (route != null) context.go(route);
          },
        );
      },
    );
  }
}
```

---

### 10. Modifikasi Screen — Gunakan AppDynamicBottomBar

#### [MODIFY] `lib/features/home/presentation/screens/home_screen.dart`
#### [MODIFY] `lib/features/order/presentation/screens/index_order_screen.dart`
#### [MODIFY] `lib/features/order/presentation/screens/pickup_schedule_screen.dart`

Ganti `AppBottomBar.navigation(...)` hardcode dengan `AppDynamicBottomBar`:

```dart
bottomBar: const AppDynamicBottomBar(currentRoute: '/home'),
```

Sesuaikan nilai `currentRoute` untuk setiap screen.

---

## Struktur File Baru

```
apps/production/lib/
├── core/
│   ├── router/
│   │   └── app_router.dart               [MODIFY]
│   ├── utils/
│   │   ├── permission_checker.dart        [NEW]
│   │   └── bottom_bar_items_builder.dart  [NEW]
│   └── widgets/
│       └── app_dynamic_bottom_bar.dart    [NEW]
└── features/
    ├── home/
    │   └── presentation/
    │       └── screens/
    │           └── home_screen.dart       [MODIFY]
    ├── no_permission/
    │   └── presentation/
    │       ├── screens/
    │       │   └── no_permission_screen.dart          [NEW]
    │       └── widgets/
    │           ├── no_permission_illustration.dart    [NEW]
    │           ├── no_permission_message.dart         [NEW]
    │           ├── no_permission_employee_info.dart   [NEW]
    │           └── no_permission_actions.dart         [NEW]
    └── order/
        └── presentation/
            └── screens/
                ├── index_order_screen.dart     [MODIFY]
                └── pickup_schedule_screen.dart [MODIFY]
```

---

## Urutan Implementasi yang Disarankan

1. `permission_checker.dart`
2. `bottom_bar_items_builder.dart`
3. `app_dynamic_bottom_bar.dart`
4. `no_permission_illustration.dart`, `no_permission_message.dart`, `no_permission_employee_info.dart`, `no_permission_actions.dart`
5. `no_permission_screen.dart`
6. `app_router.dart`
7. `home_screen.dart`, `index_order_screen.dart`, `pickup_schedule_screen.dart`

---

## Acceptance Criteria Teknis

- Employee tanpa `production.view` dan `courier.view` tidak bisa masuk `/home`, `/orders`, `/pickup-schedule` — selalu redirect ke `/no-permission?context=app`
- Employee dengan `production.view` saja: tab Produksi tampil, tab Kurir tidak tampil
- Employee dengan `courier.view` saja: tab Kurir tampil, tab Produksi tidak tampil
- Employee dengan keduanya: semua tab tampil
- Label `'Pesanan'` sudah diganti `'Produksi'` di seluruh bottom bar
- Tombol `Cek Ulang Akses` memanggil `refreshMe()` dan router redirect otomatis jika permission valid
- Tombol `Keluar` logout dan kembali ke `/login`
- Screen `/no-permission` tidak memuat data operasional
- Copy pesan disesuaikan dengan `permissionContext`
- Tidak ada hardcode warna, spacing, atau font size
- Tidak ada comment dalam kode
- Setiap file widget tidak melebihi ~150 baris
