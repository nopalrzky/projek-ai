# Persistent Shell Layout Dashboard — Cashier & Production

Tanggal: 2026-06-29
Status: Draft — Menunggu Approval
User Need Reference: `docs/user_need/flutter_tablet_persistent_shell_layout_user_need.md`

---

## 1. Ringkasan

Plan ini mengubah arsitektur routing Cashier dan Production agar seluruh route dashboard tablet berada di dalam satu **persistent shell route** yang tunggal. Sidebar dan header hanya dirender satu kali di level shell, bukan di setiap screen. Perpindahan menu hanya mengganti area body/content, bukan seluruh tree widget.

---

## 2. Kondisi Codebase Saat Ini (Hasil Audit)

### 2.1 Cashier

**Yang sudah baik:**
- `StatefulShellRoute.indexedStack` sudah ada di `app_router.dart` dengan 4 branch: `home`, `finances`, `orders`, `settings`.
- `MainShellScreen` sudah merender `OperationalTabletShell` untuk tablet dengan `currentRouteId` yang diresolved dari location.
- Sidebar dan header sudah terintegrasi di level `MainShellScreen`.

**Masalah:**
- `MainShellScreen` hanya mencakup 4 branch route. Route-route berikut masih standalone GoRoute di luar `StatefulShellRoute`:
  - `/customers`, `/customers/:id`, `/customers/create`, `/customers/:id/edit`
  - `/categories`, `/categories/:id`, `/categories/create`, `/categories/:id/edit`
  - `/laundry-services`, `/laundry-services/:id`, `/laundry-services/create`, `/laundry-services/:id/edit`
  - `/service-packages`, `/service-packages/:id`
  - `/membership-plans`
  - `/deposits`, `/petty-cashes`, `/expenses`
  - `/profile`, `/profile/edit`
  - `/printer`, `/pin-security`
- Route standalone yang menggunakan `CashierStandaloneTabletShell` sebagai wrapper per-page (categories, laundry-services, service-packages, membership-plans, deposits, petty-cashes, expenses) — shell **dibuat ulang** setiap navigasi.
- `CashierStandaloneTabletShell` adalah StatelessWidget — collapsed state hilang saat navigasi.
- `/customers`, `/profile`, `/printer`, `/pin-security` tidak memiliki wrapper shell tablet sama sekali.

**Implikasi:**
- Berpindah dari `/home` ke `/categories` berarti keluar dari `StatefulShellRoute` dan masuk ke GoRoute standalone — shell dibuat ulang, state hilang.

### 2.2 Production

**Kondisi:**
- Semua route adalah flat `GoRoute` individual tanpa ShellRoute.
- `ProductionTabletShell` adalah StatelessWidget yang dibungkus di setiap screen secara manual:
  - `HomeScreen`, `IndexOrderScreen`, `ShowOrderScreen`, `PickupScheduleScreen` — semuanya wrap `ProductionTabletShell`.
  - `ProfileSettingScreen` — tidak wrap shell (hanya `AppLayout`).
- Setiap navigasi antar screen = shell baru dibuat ulang, collapsed state hilang.

---

## 3. Keputusan Arsitektur

### 3.1 Pilihan Route Type

| Kebutuhan | Pilihan | Alasan |
|---|---|---|
| Cashier | `StatefulShellRoute.indexedStack` | Sudah ada, perlu diperluas. Branch state di-preserve per tab. |
| Production | `ShellRoute` | Tidak ada kebutuhan preserve branch state. Lebih simpel. |

**Keputusan Final:**
- **Cashier**: Perluas `StatefulShellRoute.indexedStack` yang sudah ada dengan menambahkan branch baru untuk route yang saat ini standalone.
- **Production**: Buat `ShellRoute` baru sebagai parent dari semua route dashboard.

### 3.2 State Collapsed Sidebar

`OperationalTabletShell` adalah `StatefulWidget` dengan `_isSidebarCollapsed` state internal. Dengan menempatkan shell di level ShellRoute/StatefulShellRoute.builder, widget shell tetap mounted selama user berada di dashboard — collapse state persist otomatis tanpa state management tambahan.

### 3.3 Route Auth Tetap di Luar Shell

Route berikut tetap sebagai flat GoRoute di luar shell:
`/splash`, `/login`, `/onboarding`, `/setup-pin`, `/pin-setup-prompt`, `/access-denied`, `/re-auth-pin`, `/switch-employee`, `/pin-entry`, `/confirm-pin`, `/no-permission`

---

## 4. Proposed Changes — Cashier

### 4.1 Struktur Route Baru

```
GoRouter routes:
├── /splash, /login, /onboarding, /setup-pin, /pin-setup-prompt
├── /access-denied, /no-permission, /confirm-pin, /re-auth-pin
├── /switch-employee, /pin-entry
└── StatefulShellRoute.indexedStack  ← diperluas
    builder: MainShellScreen
    branches:
    ├── Branch 0 — HomeNav
    │   └── /home
    ├── Branch 1 — FinancesNav (diperluas)
    │   ├── /finances
    │   ├── /deposits         ← dipindah dari standalone
    │   ├── /petty-cashes     ← dipindah dari standalone
    │   └── /expenses         ← dipindah dari standalone
    ├── Branch 2 — OrdersNav
    │   ├── /orders
    │   └── /orders/:id
    ├── Branch 3 — ManagementNav  ← BARU
    │   ├── /customers (+ /create, /:id, /:id/edit)
    │   ├── /categories (+ /create, /:id, /:id/edit)
    │   ├── /laundry-services (+ /create, /:id, /:id/edit)
    │   ├── /service-packages (+ /:id)
    │   └── /membership-plans
    └── Branch 4 — SettingsNav  ← diperluas
        ├── /settings (+ sub-routes PIN)
        ├── /profile (+ /profile/edit)  ← dipindah dari standalone
        ├── /printer                    ← dipindah dari standalone
        └── /pin-security               ← dipindah dari standalone
```

**Navigator Key baru:**
```dart
final _managementNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'managementNav');
```

### 4.2 File yang Diubah — Cashier

#### [MODIFY] `apps/cashier/lib/core/router/app_router.dart`

- Tambah `_managementNavigatorKey`.
- Tambah `StatefulShellBranch` baru untuk Management.
- Pindahkan `/customers` (dan sub-route) ke branch Management.
- Pindahkan `/categories`, `/laundry-services`, `/service-packages`, `/membership-plans` ke branch Management.
- Pindahkan `/deposits`, `/petty-cashes`, `/expenses` ke branch Finances.
- Pindahkan `/profile`, `/printer`, `/pin-security` ke branch Settings.
- Hapus semua standalone GoRoute untuk route di atas.
- Hapus `_wrapShell()` method dan semua pemanggilannya.
- Hapus import `cashier_standalone_tablet_shell.dart`.
- Hapus duplikat `GoRoute(path: '/dashboard', ...)` — ada dua di file saat ini.

#### [MODIFY] `apps/cashier/lib/core/navigation/main_shell_screen.dart`

- Verifikasi dan lengkapi location-to-routeId mapping untuk semua route yang masuk shell.

#### [DELETE] `apps/cashier/lib/core/navigation/cashier_standalone_tablet_shell.dart`

---

## 5. Proposed Changes — Production

### 5.1 Struktur Route Baru

```
GoRouter routes:
├── /splash, /login, /onboarding, /pin-setup-prompt
├── /setup-pin, /confirm-pin, /no-permission
└── ShellRoute  ← BARU
    builder: ProductionShellScreen
    routes:
    ├── /home
    ├── /orders
    ├── /orders/:id
    ├── /order-items/:id
    ├── /pickup-schedule
    └── /profile
```

### 5.2 ProductionShellScreen (Baru)

File: `apps/production/lib/core/navigation/production_shell_screen.dart`

```dart
class ProductionShellScreen extends StatelessWidget {
  final Widget child;
  const ProductionShellScreen({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final isCompact = AppBreakpoints.of(context) == WindowSizeClass.compact;

    if (isCompact) {
      // Compact: kembalikan child langsung
      // Bottom bar tetap dihandle di dalam setiap screen (existing)
      return child;
    }

    final authState = context.read<AuthCubit>().state;
    final employee = switch (authState) {
      Authenticated(:final employee) => employee,
      _ => null,
    };

    final location = GoRouterState.of(context).matchedLocation;
    String currentRouteId = 'home';
    if (location.startsWith('/orders') || location.startsWith('/order-items')) {
      currentRouteId = 'orders';
    } else if (location.startsWith('/pickup-schedule')) {
      currentRouteId = 'pickup-schedule';
    } else if (location.startsWith('/profile')) {
      currentRouteId = 'profile';
    }

    return OperationalTabletShell(
      appName: 'WashWallet',
      appRoleLabel: 'Produksi & Logistik',
      menuSections: employee != null
          ? ProductionNavigationConfig.buildSections(employee)
          : const [],
      currentRouteId: currentRouteId,
      onMenuItemTap: (item) {
        if (item.route != null) context.go(item.route!);
      },
      userAccount: employee != null
          ? SidebarUserAccount(name: employee.name, subtitle: 'Produksi / Kurir')
          : null,
      searchHint: 'Cari order...',
      onSearchSubmitted: (_) {},
      body: child,
    );
  }
}
```

### 5.3 Pola Perubahan Screen Production (Hapus Shell Wrapper)

Setiap screen hanya merender kontennya saja untuk tablet mode:

```dart
@override
Widget build(BuildContext context) {
  final isCompact = AppBreakpoints.of(context) == WindowSizeClass.compact;

  if (isCompact) {
    return AppLayout(...);  // existing, tidak berubah
  }

  // Tablet: return konten saja — shell sudah dihandle ShellRoute
  return Column(
    children: [
      const PageContentHeader(...),
      Expanded(child: ...),
    ],
  );
}
```

### 5.4 Perhatian: Nested Scaffold

`OperationalTabletShell` menggunakan `Scaffold` di dalamnya. Screen yang sebelumnya menggunakan `AppLayout` atau `Scaffold` internal pada tablet mode akan menghasilkan **nested Scaffold**.

- Untuk semua screen Production: pada tablet mode, return widget konten saja (Column, bukan Scaffold/AppLayout).
- `ShowOrderScreen` menggunakan `Scaffold` dengan `bottomNavigationBar` — untuk tablet, refactor agar action button menggunakan `Column` + action di bawah konten, tanpa `Scaffold` wrapper.

### 5.5 Profile di Navigation Config

Tambahkan item "Profil" ke `ProductionNavigationConfig` agar sidebar menampilkan active state saat di `/profile`:

```dart
// Di ProductionNavigationConfig.buildSections():
SidebarMenuSection(
  items: [
    SidebarMenuItem(
      id: 'profile',
      label: 'Profil',
      icon: Icons.person_outline,
      selectedIcon: Icons.person,
      route: '/profile',
    ),
  ],
),
```

### 5.6 File yang Diubah — Production

#### [NEW] `apps/production/lib/core/navigation/production_shell_screen.dart`

#### [MODIFY] `apps/production/lib/core/router/app_router.dart`
- Bungkus route dashboard dalam `ShellRoute` dengan `ProductionShellScreen`.

#### [MODIFY] `apps/production/lib/core/navigation/production_navigation_config.dart`
- Tambah item Profile ke sidebar sections.

#### [MODIFY] `apps/production/lib/features/home/presentation/screens/home_screen.dart`
- Hapus `ProductionTabletShell` wrapper. Return konten langsung untuk non-compact.

#### [MODIFY] `apps/production/lib/features/order/presentation/screens/index_order_screen.dart`
- Hapus `ProductionTabletShell` wrapper.

#### [MODIFY] `apps/production/lib/features/order/presentation/screens/show_order_screen.dart`
- Hapus `ProductionTabletShell` wrapper.
- Refactor tablet mode agar tidak menggunakan `Scaffold` internal (karena akan nested dengan shell Scaffold).

#### [MODIFY] `apps/production/lib/features/order/presentation/screens/pickup_schedule_screen.dart`
- Hapus `ProductionTabletShell` wrapper.

#### [MODIFY] `apps/production/lib/features/profile/presentation/screens/profile_setting_screen.dart`
- Tambah conditional tablet rendering: compact → `AppLayout`, tablet → konten saja.

#### [DELETE] `apps/production/lib/core/widgets/production_tablet_shell.dart`

---

## 6. Tidak Diperlukan Perubahan

- `OperationalTabletShell`, `OperationalSidebar`, `OperationalTopHeader` di `wash_wallet_ui`.
- BLoC, Cubit, UseCase, Repository, atau model domain.
- Flow login, splash, atau onboarding.
- Redesign visual sidebar atau header.
- Mobile/compact layout — tetap tidak berubah.
- `CashierNavigationConfig` — sudah memiliki semua menu items.

---

## 7. Pertimbangan Khusus

### 7.1 Deep Link

Setelah perubahan, deep link ke `/customers/123` akan:
1. GoRouter mencocokkan ke branch Management `StatefulShellRoute`.
2. `MainShellScreen` merender dengan `currentRouteId = 'customers'`.
3. Sidebar menampilkan "Pelanggan" sebagai active item.

### 7.2 Back Button

Di dalam `StatefulShellRoute` dengan nested route, tombol back bekerja di dalam navigator key branch. Contoh: `/categories/:id/edit` → back → `/categories/:id` → back → `/categories`. Shell tetap mounted.

### 7.3 Duplikat Route `/dashboard` di Cashier

Ada dua `GoRoute(path: '/dashboard', redirect: ...)` di `app_router.dart` Cashier. Hapus yang duplikat, sisakan satu.

---

## 8. Strategi Migrasi Bertahap

### Tahap 1 — Production (Risiko Lebih Rendah)

1. Buat `production_shell_screen.dart`.
2. Update `production_navigation_config.dart` — tambah item Profile.
3. Update `app_router.dart` Production — wrap routes dalam `ShellRoute`.
4. Update semua screen — hapus `ProductionTabletShell` wrapper.
5. Update `profile_setting_screen.dart` — tambah conditional tablet rendering.
6. Verifikasi tablet dan phone.
7. Hapus `production_tablet_shell.dart`.

### Tahap 2 — Cashier (Risiko Lebih Tinggi)

1. Tambah `_managementNavigatorKey` di `app_router.dart`.
2. Tambah `StatefulShellBranch` baru untuk Management.
3. Pindahkan route customers ke branch Management — verifikasi.
4. Pindahkan categories, laundry-services, service-packages, membership-plans ke branch Management.
5. Pindahkan deposits, petty-cashes, expenses ke branch Finances.
6. Pindahkan profile, printer, pin-security ke branch Settings.
7. Verifikasi semua navigasi dari sidebar.
8. Hapus `_wrapShell()`, standalone routes, dan `cashier_standalone_tablet_shell.dart`.
9. Hapus duplikat `/dashboard` route.

---

## 9. Ringkasan File

### Production

| File | Aksi |
|---|---|
| `apps/production/lib/core/navigation/production_shell_screen.dart` | **[NEW]** |
| `apps/production/lib/core/router/app_router.dart` | **[MODIFY]** |
| `apps/production/lib/core/navigation/production_navigation_config.dart` | **[MODIFY]** |
| `apps/production/lib/features/home/presentation/screens/home_screen.dart` | **[MODIFY]** |
| `apps/production/lib/features/order/presentation/screens/index_order_screen.dart` | **[MODIFY]** |
| `apps/production/lib/features/order/presentation/screens/show_order_screen.dart` | **[MODIFY]** |
| `apps/production/lib/features/order/presentation/screens/pickup_schedule_screen.dart` | **[MODIFY]** |
| `apps/production/lib/features/profile/presentation/screens/profile_setting_screen.dart` | **[MODIFY]** |
| `apps/production/lib/core/widgets/production_tablet_shell.dart` | **[DELETE]** |

### Cashier

| File | Aksi |
|---|---|
| `apps/cashier/lib/core/router/app_router.dart` | **[MODIFY]** |
| `apps/cashier/lib/core/navigation/main_shell_screen.dart` | **[MODIFY]** |
| `apps/cashier/lib/core/navigation/cashier_standalone_tablet_shell.dart` | **[DELETE]** |

---

## 10. Rencana Verifikasi

### 10.1 Flutter Analyze

```bash
flutter analyze apps/production
flutter analyze apps/cashier
```

### 10.2 Manual QA — Production Tablet

| Skenario | Ekspektasi |
|---|---|
| Buka `/home` langsung | Shell muncul, sidebar "Dashboard" aktif |
| Tap "Antrian Order" di sidebar | Body ganti, sidebar tetap, tidak flicker |
| Tap "Jadwal Pickup" di sidebar | Body ganti, sidebar tetap |
| Tap order → `/orders/:id` | Shell tetap, sidebar "Antrian Order" aktif |
| Back di `/orders/:id` | Kembali ke `/orders`, shell tetap |
| Collapsed sidebar di home → pindah route | Sidebar tetap collapsed |
| Buka `/profile` | Shell tetap, konten profil tampil |
| Buka splash/login | Tidak ada shell/sidebar |

### 10.3 Manual QA — Production Compact

| Skenario | Ekspektasi |
|---|---|
| Navigasi antar semua menu | Bottom bar berfungsi, tidak ada perubahan |
| Order detail | AppLayout dengan header back button |

### 10.4 Manual QA — Cashier Tablet

| Skenario | Ekspektasi |
|---|---|
| Tap "Pelanggan" dari `/home` | Body ganti, sidebar tetap |
| Tap customer → `/customers/:id` | Shell tetap, "Pelanggan" aktif |
| Tap edit → `/customers/:id/edit` | Shell tetap |
| Back dari edit | Shell tetap |
| Tap "Kategori", "Setoran", "Profil", "Printer" | Body ganti, shell tetap |
| Collapsed sidebar → pindah route | Sidebar tetap collapsed |
| Deep link ke `/categories/5` | Shell tampil, "Kategori" aktif |
| Auth redirect saat unauthenticated | Redirect ke login tanpa shell |

### 10.5 Manual QA — Cashier Compact

| Skenario | Ekspektasi |
|---|---|
| Semua tab bottom nav | Tidak ada perubahan perilaku |

---

## 11. Catatan untuk AI yang Mengerjakan Plan

1. **Mulai dari Production** — lebih sederhana, flat GoRoute ke ShellRoute.
2. **Jangan ubah compact layout** — hanya tambahkan kondisi `if (!isCompact)` untuk mereturn konten tanpa shell wrapper.
3. **Verifikasi import** — setelah hapus `ProductionTabletShell` dari screen, pastikan import-nya juga dihapus.
4. **Hati-hati nested Scaffold** — `AppLayout` dan `OperationalTabletShell` sama-sama menggunakan `Scaffold`. Pada tablet mode, screen hanya merender widget konten (bukan Scaffold/AppLayout).
5. **GoRouterState.of(context)** di `ProductionShellScreen` harus bisa mengambil location yang benar.
6. **Hapus duplikat `/dashboard` route** di Cashier `app_router.dart`.
7. **Gunakan `context.go()` bukan `context.push()`** dari sidebar agar navigasi melalui branch yang benar.
8. **`ShowOrderScreen` Production** — screen ini memiliki `Scaffold` internal dengan `bottomNavigationBar`. Untuk tablet mode, refactor agar action button menggunakan Column + widget action di bawah konten, tanpa Scaffold wrapper.
9. **Profile di Production** — tambahkan menu "Profile" ke `ProductionNavigationConfig`.
10. **Jangan buat shell baru** — gunakan `OperationalTabletShell` yang sudah ada.
