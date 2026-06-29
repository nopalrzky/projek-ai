# Cashier Home Screen Redesign — Implementation Plan

Dibuat: 2026-06-21
Berdasarkan: `docs/context/home_screen_redesign_reccomendation.md`

---

## Ringkasan

Plan ini meredesign HomeScreen kasir dari kondisi saat ini menjadi **dashboard operasional kasir yang task-oriented**. Perubahan utama:

1. **Bottom bar menjadi route-aware** — hapus `currentIndex: 0` hardcoded, ganti dengan index berbasis route aktif.
2. **Navigasi root pakai `context.go`** — hapus `Navigator.push` uwokayyntuk root tab, ganti dengan `context.go`.
3. **Tambah route `/finances`** ke router sehingga tab Dana bisa jadi root tab yang proper.
4. **Hapus drawer & hamburger menu dari root screens** — Home, Orders, Finances, Settings.
5. **Rapikan struktur Home** — pisahkan Kas Outlet card dan Status Pesanan card, buat order stats tappable, update copy quick actions.
6. **Perbaiki notification flow** — gunakan `context.go('/orders?status=requested')` via GoRouter, bukan `Navigator.push`.
7. **Tambah `/settings/setup-outlet`** sebagai rumah Data Master (kategori, layanan, paket, membership).
8. **`/dashboard` dijadikan redirect ke `/home`**.

> **SCOPE**: Plan ini TIDAK mengubah logika backend, BLoC state, atau use case. Fokus pada Flutter presentation layer: router, screens, navigasi, dan layout.

---

## Konteks Codebase (Temuan dari Kode Aktual)

### Kondisi saat ini yang perlu diubah

| Masalah | Lokasi | Detail |
|---------|--------|--------|
| Bottom bar `currentIndex: 0` hardcoded | `home_screen.dart` L131 | Selalu aktif di tab 0 meskipun user navigasi ke screens lain |
| Root tab menggunakan `Navigator.push` | `home_screen.dart` L328, L342, L355, L369 | `_handleViewTransactions`, `_handleManageCustomers`, `_handleManageFinances` semuanya pakai `Navigator.push` |
| Tab Dana navigasi lewat `Navigator.push` juga dari bottom bar | `home_screen.dart` L383 | `case 1: _handleManageFinances(context)` — ini push, bukan go |
| `showMenuButton: true` di AppHeader | `home_screen.dart` L117 | Masih menampilkan hamburger menu |
| Route `/finances` belum ada di router | `app_router.dart` | Tidak ada GoRoute untuk `/finances` |
| Route `/dashboard` tidak redirect ke `/home` | `app_router.dart` L228 | `path: '/dashboard'` langsung ke `HomeScreen` tanpa redirect logic |
| `_handleSetorTap` kosong | `home_screen.dart` L323 | Method `{}` — tombol Setor tidak melakukan apa-apa |
| `onNotificationTap` di `EmployeeProfileCard` redundant | `employee_profile_card.dart` | Card menerima callback tapi tidak menggunakannya di build method |
| Order stats di `TransactionSummaryCard` tidak tappable | `transaction_summary_card.dart` L102-L140 | Stat boxes tidak punya `onTap` callback |
| Quick actions copy: `Lihat Transaksi` & `Dana & Keuangan` | `quick_actions_section.dart` L49, L61 | Rekomendasi: ganti ke `Cek Pesanan` dan `Setor Kas` |
| `EmployeeInfoSection` meneruskan `onNotificationTap` | `employee_info_section.dart` L7-L8 | Sudah ada notification icon di header — callback ini duplikatif |

### Apa yang SUDAH ADA dan dipertahankan

| Item | Status | Catatan |
|------|--------|---------|
| `HomeCubit`, `HomeState`, `GetHomeDataUsecase` | ✅ Ada | Tidak perlu diubah |
| `HomeLoaded` data: `cashBalance`, `ordersInProduction`, `ordersNotPickedUp`, `ordersPickedUp` | ✅ Ada | Sudah lengkap untuk kebutuhan redesign |
| `NewOrderBanner` + listener logic | ✅ Ada | Dipertahankan |
| `_NotificationBadgeButton` | ✅ Ada | Dipertahankan |
| `pull-to-refresh` | ✅ Ada | Dipertahankan |
| `_showSaveAccountBottomSheet` | ✅ Ada | Dipertahankan |
| `TransactionSummaryCard` UI | ✅ Ada | Diupdate: tambahkan tap callbacks untuk setiap stat |
| `QuickActionCard`, `QuickActionGrid` | ✅ Ada | Dipertahankan strukturnya, update items |
| `EmployeeProfileCard` | ✅ Ada | Diupdate: hapus `onNotificationTap` parameter |
| `IndexFinancesScreen` | ✅ Ada (`features/finances/`) | Sudah ada, hanya perlu didaftarkan ke router |
| `AppBottomBar.navigation` | ✅ Ada di `wash_wallet_ui` | Sudah dipakai, perlu update logic index |

### Fitur yang ada di codebase (tapi belum di router sebagai root tab)

| Feature | Lokasi | Status |
|---------|--------|--------|
| `finances` | `apps/cashier/lib/features/finances/` | Ada, tapi belum route `/finances` |
| `IndexOrdersScreen` | `features/order/presentation/screens/` | Ada, route `/orders` sudah ada tapi pakai `Navigator.push` dari Home |
| `IndexSettingScreen` | `features/setting/presentation/screens/` | Ada, route `/settings` sudah ada dan sudah pakai `context.go` |

### Data Master yang perlu direlokasi ke Settings

Fitur-fitur ini saat ini diakses dari drawer atau hardcoded di router. Perlu dipindahkan ke `/settings/setup-outlet`:

- `IndexCategoriesScreen` → `/categories`
- `IndexLaundryServicesScreen` → `/laundry-services`
- `IndexServicePackagesScreen` → `/service-packages`
- `IndexMembershipPlanScreen` → `/membership-plans`
- `IndexCustomersScreen` → `/customers`

---

## Perubahan yang Diperlukan

---

### Tahap 1 — Router: Tambah `/finances`, Fix `/dashboard`, Route-Aware Bottom Bar Helper

#### [MODIFY] `apps/cashier/lib/core/router/app_router.dart`

**1a. Tambah import `IndexFinancesScreen`** (cek apakah sudah ada):
```dart
import '../../features/finances/presentation/screens/index_finances_screen.dart';
```

**1b. Ubah route `/dashboard` menjadi redirect ke `/home`**:
```dart
// BEFORE:
GoRoute(
  path: '/dashboard',
  pageBuilder: (context, state) => state.slidePage(const HomeScreen()),
),

// AFTER:
GoRoute(
  path: '/dashboard',
  redirect: (context, state) => '/home',
),
```

**1c. Tambah route `/finances` sebagai root tab**:
```dart
GoRoute(
  path: '/finances',
  pageBuilder: (context, state) {
    final authState = _authCubit.state;
    if (authState is Authenticated) {
      return state.slidePage(
        IndexFinancesScreen(outletId: authState.employee.outletId),
      );
    } else if (authState is AuthenticatedStale) {
      return state.slidePage(
        IndexFinancesScreen(outletId: authState.employee.outletId),
      );
    }
    return state.slidePage(const SizedBox());
  },
),
```

**1d. Update redirect guard** — tambahkan `/finances` ke path yang di-redirect ke `/switch-employee` saat unauthenticated:
```dart
if (authState is Unauthenticated || authState is AuthFailureState) {
  if (currentLocation == '/home' ||
      currentLocation.startsWith('/orders') ||
      currentLocation.startsWith('/customers') ||
      currentLocation.startsWith('/settings') ||
      currentLocation.startsWith('/finances') || // [NEW]
      currentLocation.startsWith('/outlets')) {
    return '/switch-employee';
  }
  return null;
}
```

**1e. Tambah route `/settings/setup-outlet`** sebagai sub-route `/settings`:
```dart
GoRoute(
  path: 'setup-outlet',
  pageBuilder: (context, state) =>
      state.slidePage(const SetupOutletSettingScreen()),
),
```

> **CATATAN**: `SetupOutletSettingScreen` adalah screen baru (lihat Tahap 4).

---

### Tahap 2 — Bottom Bar: Route-Aware Helper

#### [NEW] `apps/cashier/lib/core/navigation/bottom_nav_helper.dart`

Buat helper untuk bottom bar yang reusable di semua root screens:

```dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

/// Bottom bar items untuk root navigation cashier
const cashierBottomNavItems = [
  AppBottomBarItem(
    icon: Icons.home_outlined,
    activeIcon: Icons.home,
    label: 'Home',
  ),
  AppBottomBarItem(
    icon: Icons.account_balance_wallet_outlined,
    activeIcon: Icons.account_balance_wallet,
    label: 'Dana',
  ),
  AppBottomBarItem(
    icon: Icons.receipt_long_outlined,
    activeIcon: Icons.receipt_long,
    label: 'Transaksi',
  ),
  AppBottomBarItem(
    icon: Icons.settings_outlined,
    activeIcon: Icons.settings,
    label: 'Setting',
  ),
];

/// Root tab routes — urutan harus sama dengan cashierBottomNavItems
const _rootTabRoutes = ['/home', '/finances', '/orders', '/settings'];

/// Tentukan active index berdasarkan route aktif saat ini
int getBottomNavIndex(String location) {
  if (location.startsWith('/finances')) return 1;
  if (location.startsWith('/orders')) return 2;
  if (location.startsWith('/settings')) return 3;
  return 0; // default: Home
}

/// Handle tap pada bottom bar — gunakan context.go untuk root navigation
void handleBottomNavTap(BuildContext context, int index) {
  final targetRoute = _rootTabRoutes[index];
  final currentLocation = GoRouterState.of(context).uri.toString();
  if (currentLocation == targetRoute) return; // sudah di tab yang sama
  context.go(targetRoute);
}
```

---

### Tahap 3 — HomeScreen: Rewrite Navigation & Layout

#### [MODIFY] `apps/cashier/lib/features/home/presentation/screens/home_screen.dart`

Ini adalah perubahan terbesar. Berikut detail setiap bagian yang berubah:

**3a. Update import** — tambahkan bottom nav helper:
```dart
import 'package:wash_wallet_cashier/core/navigation/bottom_nav_helper.dart';
```

**3b. Hapus `Navigator.push` dari semua navigation handler** — ganti dengan `context.go`:

```dart
// BEFORE:
void _handleNotificationTap(BuildContext context) {
  // ...
  Navigator.push(context, MaterialPageRoute(builder: (_) => IndexOrdersScreen(...)));
}

// AFTER:
void _handleNotificationTap(BuildContext context) {
  final authState = context.read<AuthCubit>().state;
  if (authState is! Authenticated) return;
  NotificationService.instance.clearBadge();
  context.go('/orders?status=requested');
  context.read<HomeCubit>().refresh();
}
```

```dart
// BEFORE:
void _handleViewTransactions(BuildContext context) {
  Navigator.push(context, MaterialPageRoute(builder: (_) => IndexOrdersScreen(...)));
}

// AFTER:
void _handleViewTransactions(BuildContext context) {
  context.go('/orders');
}
```

```dart
// BEFORE:
void _handleManageFinances(BuildContext context) {
  Navigator.push(context, MaterialPageRoute(builder: (_) => IndexFinancesScreen(...)));
}

// AFTER:
void _handleManageFinances(BuildContext context) {
  context.go('/finances');
}
```

```dart
// BEFORE:
void _handleManageCustomers(BuildContext context) {
  Navigator.push(context, MaterialPageRoute(builder: (_) => IndexCustomersScreen(...)));
}

// AFTER:
void _handleManageCustomers(BuildContext context) {
  context.push('/customers');
  // Customer tetap pakai push karena bukan root tab
}
```

**3c. Fix `_handleSetorTap`** — saat ini kosong `{}`:
```dart
// BEFORE:
void _handleSetorTap(BuildContext context) {}

// AFTER:
void _handleSetorTap(BuildContext context) {
  context.go('/finances');
}
```

**3d. Update `_handleBottomNavTap`** — gunakan bottom nav helper:
```dart
// BEFORE:
void _handleBottomNavTap(BuildContext context, int index) {
  switch (index) {
    case 0: break;
    case 1: _handleManageFinances(context); break;
    case 2: _handleViewTransactions(context); break;
    case 3: context.go('/settings'); break;
  }
}

// AFTER:
void _handleBottomNavTap(BuildContext context, int index) {
  handleBottomNavTap(context, index);
}
```

**3e. Update `AppHeader`** — hapus hamburger menu:
```dart
// BEFORE:
header: AppHeader(
  title: 'Wash Wallet',
  subtitle: 'Selamat Bekerja',
  type: AppHeaderType.standard,
  backgroundColor: context.colors.surface,
  showMenuButton: true,  // [HAPUS]
  actions: [...],
),

// AFTER:
header: AppHeader(
  title: 'Wash Wallet',
  subtitle: 'Selamat Bekerja',
  type: AppHeaderType.standard,
  backgroundColor: context.colors.surface,
  showMenuButton: false,  // [UBAH]
  actions: [...],
),
```

**3f. Update bottom bar** — gunakan route-aware index dan items dari helper:
```dart
// BEFORE:
bottomBar: AppBottomBar.navigation(
  currentIndex: 0,
  onTap: (index) => _handleBottomNavTap(context, index),
  items: const [/* hardcoded items */],
),

// AFTER:
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

> **CATATAN**: Gunakan `Builder` atau pastikan `GoRouterState.of(context)` bisa diakses dari dalam widget tree. Jika tidak tersedia di context tersebut, alternatifnya: inject `location` dari luar lewat parameter atau gunakan `StatefulNavigationShell` (lihat Note implementer).

**3g. Update `_buildBody`** — tambah tap callback ke order stats:
```dart
// Ganti TransactionReportsSection call:
TransactionReportsSection(
  cashBalance: state.cashBalance,
  ordersInProduction: state.ordersInProduction,
  ordersNotPickedUp: state.ordersNotPickedUp,
  ordersPickedUp: state.ordersPickedUp,
  onSetorTap: () => _handleSetorTap(context),
  onProductionTap: () => context.go('/orders?status=production'),     // [NEW]
  onNotPickedUpTap: () => context.go('/orders?status=not_picked_up'), // [NEW]
  onPickedUpTap: () => context.go('/orders?status=picked_up'),        // [NEW]
),
```

**3h. Update `EmployeeInfoSection` call** — hapus `onNotificationTap` yang tidak dipakai:
```dart
// BEFORE:
EmployeeInfoSection(
  employeeName: state.employeeName,
  employeePhone: state.employeePhone,
  onNotificationTap: () => _handleNotificationTap(context),
),

// AFTER:
EmployeeInfoSection(
  employeeName: state.employeeName,
  employeePhone: state.employeePhone,
),
```

**3i. Update `QuickActionsSection`** — ganti label `onViewTransactions` dan `onManageFinances`:
Sekarang diteruskan ke `QuickActionsSection` dengan callback yang sudah difix.

---

### Tahap 4 — Widget Updates

#### [MODIFY] `apps/cashier/lib/features/home/presentation/widgets/transaction_summary_card.dart`

Tambahkan tap callbacks untuk setiap order stat:

```dart
// Tambahkan parameter ke constructor:
final VoidCallback? onProductionTap;
final VoidCallback? onNotPickedUpTap;
final VoidCallback? onPickedUpTap;

// Update _buildOrderStat — bungkus dengan GestureDetector atau InkWell:
Expanded(
  child: GestureDetector(
    onTap: onProductionTap,
    child: _buildOrderStat(
      context,
      icon: Icons.hourglass_empty,
      label: 'Produksi',
      count: ordersInProduction,
    ),
  ),
),
// ... dst untuk NotPickedUp dan PickedUp
```

> **CATATAN UX**: Tambahkan visual feedback saat stat bisa ditap — misalnya ubah cursor ke `SystemMouseCursors.click` atau tambahkan subtle highlight. Jika `onProductionTap` null, hapus tap feedback.

#### [MODIFY] `apps/cashier/lib/features/home/presentation/sections/transaction_reports_section.dart`

Teruskan callback tap baru ke `TransactionSummaryCard`:

```dart
class TransactionReportsSection extends StatelessWidget {
  // ... existing params ...
  final VoidCallback? onProductionTap;    // [NEW]
  final VoidCallback? onNotPickedUpTap;  // [NEW]
  final VoidCallback? onPickedUpTap;     // [NEW]

  // ... update build() untuk meneruskan ke TransactionSummaryCard
}
```

#### [MODIFY] `apps/cashier/lib/features/home/presentation/widgets/employee_profile_card.dart`

Hapus parameter `onNotificationTap` yang tidak digunakan di build method:

```dart
// BEFORE:
class EmployeeProfileCard extends StatelessWidget {
  final VoidCallback onNotificationTap; // tidak dipakai di build

// AFTER:
class EmployeeProfileCard extends StatelessWidget {
  // onNotificationTap dihapus
```

#### [MODIFY] `apps/cashier/lib/features/home/presentation/sections/employee_info_section.dart`

Hapus parameter `onNotificationTap`:

```dart
// BEFORE:
class EmployeeInfoSection extends StatelessWidget {
  final VoidCallback onNotificationTap;

// AFTER:
class EmployeeInfoSection extends StatelessWidget {
  // onNotificationTap dihapus
```

#### [MODIFY] `apps/cashier/lib/features/home/presentation/sections/quick_actions_section.dart`

Update label quick action items — ganti copy yang terasa seperti menu navigasi menjadi shortcut kerja:

```dart
// BEFORE items:
// - 'Buat Transaksi'  (ok — pertahankan)
// - 'Lihat Transaksi' (ganti)
// - 'Customer'        (ok — pertahankan)
// - 'Dana & Keuangan' (ganti)

// AFTER items:
QuickActionItem(
  icon: Icons.add_shopping_cart,
  label: 'Buat Transaksi',
  color: context.colors.primary,
  onTap: onCreateTransaction,
),
QuickActionItem(
  icon: Icons.list_alt,
  label: 'Cek Pesanan',  // [UBAH dari 'Lihat Transaksi']
  color: context.colors.info,
  onTap: onViewTransactions,
),
QuickActionItem(
  icon: Icons.people_outline,
  label: 'Customer',
  color: context.colors.success,
  onTap: onManageCustomers,
),
QuickActionItem(
  icon: Icons.upload_rounded,
  label: 'Setor Kas',  // [UBAH dari 'Dana & Keuangan']
  color: context.colors.warning,
  onTap: onManageFinances,
),
```

---

### Tahap 5 — IndexOrdersScreen & IndexFinancesScreen: Hapus Drawer

#### [MODIFY] `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`

Cari `AppLayout` call dan set `showMenuButton: false`. Pastikan bottom bar sudah ada atau tambahkan:

```dart
// Dalam AppLayout di IndexOrdersScreen:
header: AppHeader(
  // ...
  showMenuButton: false, // [UBAH]
),
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

> **CATATAN**: Jika `IndexOrdersScreen` belum punya bottom bar, tambahkan. Jika sudah punya bottom bar dengan hardcoded index, update agar route-aware menggunakan helper dari Tahap 2.

#### [MODIFY] `apps/cashier/lib/features/finances/presentation/screens/index_finances_screen.dart`

Sama seperti `IndexOrdersScreen` — hapus drawer/hamburger, tambahkan route-aware bottom bar:

```dart
header: AppHeader(
  showMenuButton: false,
  // ...
),
bottomBar: Builder(
  builder: (context) {
    final location = GoRouterState.of(context).uri.toString();
    return AppBottomBar.navigation(
      currentIndex: getBottomNavIndex(location),  // akan return 1 untuk /finances
      onTap: (index) => handleBottomNavTap(context, index),
      items: cashierBottomNavItems,
    );
  },
),
```

#### [MODIFY] `apps/cashier/lib/features/setting/presentation/screens/index_setting_screen.dart`

Sama — pastikan `showMenuButton: false` dan tambahkan route-aware bottom bar jika belum ada.

---

### Tahap 6 — Settings: Tambah Setup Outlet Screen

#### [NEW] `apps/cashier/lib/features/setting/presentation/screens/setup_outlet_setting_screen.dart`

Screen baru yang menampilkan daftar item Data Master — ini adalah "rumah" untuk fitur outlet management yang sebelumnya mungkin ada di drawer atau menu lain:

```dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../auth/presentation/bloc/auth_cubit.dart';
import '../../../auth/presentation/bloc/auth_state.dart';

class SetupOutletSettingScreen extends StatelessWidget {
  const SetupOutletSettingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authState = context.watch<AuthCubit>().state;
    final outletId = authState is Authenticated
        ? authState.employee.outletId
        : null;

    return Scaffold(
      appBar: AppBar(title: const Text('Setup Outlet')),
      body: ListView(
        padding: EdgeInsets.all(context.space.md),
        children: [
          _buildItem(
            context,
            icon: Icons.people_outline,
            title: 'Pelanggan',
            subtitle: 'Kelola data pelanggan outlet',
            onTap: outletId != null
                ? () => context.push('/customers')
                : null,
          ),
          SizedBox(height: context.space.sm),
          _buildItem(
            context,
            icon: Icons.category_outlined,
            title: 'Kategori',
            subtitle: 'Kelola kategori layanan laundry',
            onTap: outletId != null
                ? () => context.push('/categories')
                : null,
          ),
          SizedBox(height: context.space.sm),
          _buildItem(
            context,
            icon: Icons.local_laundry_service_outlined,
            title: 'Layanan Laundry',
            subtitle: 'Kelola layanan dan harga',
            onTap: outletId != null
                ? () => context.push('/laundry-services')
                : null,
          ),
          SizedBox(height: context.space.sm),
          _buildItem(
            context,
            icon: Icons.card_giftcard_outlined,
            title: 'Paket Deposit',
            subtitle: 'Kelola paket deposit pelanggan',
            onTap: outletId != null
                ? () => context.push('/service-packages')
                : null,
          ),
          SizedBox(height: context.space.sm),
          _buildItem(
            context,
            icon: Icons.workspace_premium_outlined,
            title: 'Membership',
            subtitle: 'Kelola paket membership pelanggan',
            onTap: outletId != null
                ? () => context.push('/membership-plans')
                : null,
          ),
        ],
      ),
    );
  }

  Widget _buildItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    VoidCallback? onTap,
  }) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(context.radius.md),
        side: BorderSide(color: context.colors.outlineVariant),
      ),
      child: ListTile(
        leading: Container(
          padding: EdgeInsets.all(context.space.xs),
          decoration: BoxDecoration(
            color: context.colors.primary.withAlpha(20),
            borderRadius: BorderRadius.circular(context.radius.sm),
          ),
          child: Icon(icon, color: context.colors.primary),
        ),
        title: Text(title, style: context.typography.titleMedium),
        subtitle: Text(subtitle, style: context.typography.bodySmall),
        trailing: Icon(Icons.chevron_right, color: context.colors.onSurfaceVariant),
        onTap: onTap,
      ),
    );
  }
}
```

#### [MODIFY] `apps/cashier/lib/features/setting/presentation/screens/index_setting_screen.dart`

Tambahkan item `Setup Outlet` di bagian settings:

```dart
// Tambahkan item di ListView, setelah item-item yang sudah ada:
SizedBox(height: context.space.sm),
_buildSettingItem(
  context,
  icon: Icons.store_outlined,
  title: 'Setup Outlet',
  subtitle: 'Kelola kategori, layanan, paket, membership, dan pelanggan',
  onTap: () => context.push('/settings/setup-outlet'),
),
```

---

### Tahap 7 — Router: Daftarkan `SetupOutletSettingScreen`

#### [MODIFY] `apps/cashier/lib/core/router/app_router.dart`

Tambahkan import dan sub-route:

```dart
import '../../features/setting/presentation/screens/setup_outlet_setting_screen.dart';

// Di dalam routes '/settings':
GoRoute(
  path: 'setup-outlet',
  pageBuilder: (context, state) =>
      state.slidePage(const SetupOutletSettingScreen()),
),
```

---

## Urutan Pengerjaan yang Disarankan

```
Step 1.  Buat bottom_nav_helper.dart (helper reusable)
Step 2.  Router: ubah /dashboard menjadi redirect ke /home
Step 3.  Router: tambahkan route /finances
Step 4.  Router: update redirect guard untuk /finances
Step 5.  HomeScreen: fix _handleBottomNavTap pakai helper
Step 6.  HomeScreen: fix semua Navigator.push menjadi context.go/push
Step 7.  HomeScreen: fix _handleSetorTap (context.go('/finances'))
Step 8.  HomeScreen: update AppHeader — showMenuButton: false
Step 9.  HomeScreen: update bottom bar — route-aware index
Step 10. HomeScreen: teruskan tap callbacks ke TransactionReportsSection
Step 11. HomeScreen: hapus onNotificationTap dari EmployeeInfoSection
Step 12. TransactionSummaryCard: tambah tap callbacks untuk stat boxes
Step 13. TransactionReportsSection: teruskan tap callbacks
Step 14. EmployeeProfileCard: hapus onNotificationTap parameter
Step 15. EmployeeInfoSection: hapus onNotificationTap parameter
Step 16. QuickActionsSection: update copy label quick actions
Step 17. IndexOrdersScreen: hapus hamburger, tambahkan route-aware bottom bar
Step 18. IndexFinancesScreen: hapus hamburger, tambahkan route-aware bottom bar
Step 19. IndexSettingScreen: hapus hamburger jika masih ada, tambahkan bottom bar jika belum ada
Step 20. Buat SetupOutletSettingScreen
Step 21. IndexSettingScreen: tambahkan item Setup Outlet
Step 22. Router: daftarkan /settings/setup-outlet
Step 23. Verifikasi semua tap flows manual (lihat Test Plan)
```

---

## Acceptance Criteria

- [ ] Bottom bar menampilkan tab aktif yang benar saat berada di `/home`, `/finances`, `/orders`, `/settings`.
- [ ] Tap tab Dana dari Home → navigasi ke `/finances` (bukan push ke stack baru).
- [ ] Tap tab Transaksi dari Home → navigasi ke `/orders` (bukan push).
- [ ] Tap tab Setting dari Home → navigasi ke `/settings` (sudah benar, dipertahankan).
- [ ] Tap tab Home dari tab lain → kembali ke `/home`.
- [ ] Tap tab yang sama dua kali → tidak menumpuk screen baru.
- [ ] Hamburger menu tidak terlihat di Home, Finances, Orders, Settings.
- [ ] Drawer tidak bisa dibuka dari root screens.
- [ ] `/dashboard` redirect ke `/home`.
- [ ] Tap Setor di Kas Outlet card → navigasi ke `/finances`.
- [ ] Tap stat `Produksi` → navigasi ke `/orders?status=production`.
- [ ] Tap stat `Belum Diambil` → navigasi ke `/orders?status=not_picked_up`.
- [ ] Tap stat `Sudah Diambil` → navigasi ke `/orders?status=picked_up`.
- [ ] Tap notification badge → clear badge + navigasi ke `/orders?status=requested`.
- [ ] Tap `Buat Transaksi` → `SelectCustomerForOrderScreen` (push, bukan go).
- [ ] Tap `Cek Pesanan` → navigasi ke `/orders`.
- [ ] Tap `Customer` → navigasi ke `/customers`.
- [ ] Tap `Setor Kas` (quick action) → navigasi ke `/finances`.
- [ ] Settings menampilkan item `Setup Outlet`.
- [ ] Tap `Setup Outlet` → `/settings/setup-outlet` dengan daftar data master.
- [ ] Tap item di `SetupOutletSettingScreen` → navigasi ke screen yang benar.
- [ ] Pull-to-refresh tetap berfungsi di Home.
- [ ] `NewOrderBanner` tetap muncul saat ada order baru.
- [ ] `_showSaveAccountBottomSheet` tetap muncul saat `shouldPromptRemember: true`.
- [ ] Saat unauthenticated dan mencoba akses `/finances` → redirect ke `/switch-employee`.
- [ ] `IndexOrdersScreen` menerima `initialStatusFilter` dari query param (cek apakah sudah bisa atau perlu ditambahkan).

---

## Test Plan

### Navigasi Manual — Emulator

**Flow 1 — Bottom Bar Navigation:**
1. Buka Home → pastikan tab Home aktif.
2. Tap tab Dana → pastikan masuk `/finances`, tab Dana aktif.
3. Tap tab Transaksi → pastikan masuk `/orders`, tab Transaksi aktif.
4. Tap tab Setting → pastikan masuk `/settings`, tab Setting aktif.
5. Tap tab Home → kembali ke `/home`, tab Home aktif.
6. Di `/orders`, tap tab Home → kembali ke Home (bukan menumpuk screen).

**Flow 2 — Home Interactions:**
7. Di Home, tap stat `Produksi` → `/orders` dengan filter production.
8. Di Home, tap stat `Belum Diambil` → `/orders` dengan filter not_picked_up.
9. Di Home, tap stat `Sudah Diambil` → `/orders` dengan filter picked_up.
10. Tap tombol `Setor` di Kas Outlet → masuk ke `/finances`.
11. Tap quick action `Buat Transaksi` → `SelectCustomerForOrderScreen` terbuka.
12. Tap quick action `Cek Pesanan` → `/orders`.
13. Tap quick action `Customer` → customer screen.
14. Tap quick action `Setor Kas` → `/finances`.

**Flow 3 — Notification:**
15. Pastikan notification badge muncul jika ada order baru.
16. Tap notification badge → badge hilang, masuk `/orders?status=requested`.

**Flow 4 — Settings Data Master:**
17. Buka Settings → pastikan item `Setup Outlet` muncul.
18. Tap `Setup Outlet` → `SetupOutletSettingScreen` terbuka.
19. Tap setiap item di Setup Outlet → navigasi ke screen yang benar.

**Flow 5 — Dashboard Redirect:**
20. Navigasi ke `/dashboard` (bisa via deep link atau test) → harus redirect ke `/home`.

**Flow 6 — Drawer/Hamburger:**
21. Swipe dari kiri di Home → drawer tidak terbuka.
22. Swipe dari kiri di Finances → drawer tidak terbuka.
23. Tidak ada hamburger icon di AppBar root screens.

### Widget Tests

| Skenario | File test |
|----------|-----------|
| `getBottomNavIndex('/home')` → 0 | `bottom_nav_helper_test.dart` |
| `getBottomNavIndex('/finances')` → 1 | `bottom_nav_helper_test.dart` |
| `getBottomNavIndex('/orders')` → 2 | `bottom_nav_helper_test.dart` |
| `getBottomNavIndex('/settings')` → 3 | `bottom_nav_helper_test.dart` |
| `getBottomNavIndex('/orders?status=requested')` → 2 | `bottom_nav_helper_test.dart` |
| `TransactionSummaryCard` stat tap → callback dipanggil | `transaction_summary_card_test.dart` |
| `HomeScreen` — `_handleSetorTap` → go('/finances') | `home_screen_test.dart` |
| `HomeScreen` — notification tap → clearBadge + go('/orders?status=requested') | `home_screen_test.dart` |

---

## Catatan Implementer

### Route-Aware Bottom Bar
`GoRouterState.of(context)` membutuhkan `BuildContext` yang berada di dalam `GoRouter` widget tree. Di `HomeScreen`, pastikan `GoRouterState.of(context)` bisa diakses. Jika tidak, gunakan `Builder` widget untuk mendapat context yang benar, atau extract location dari `GoRouter.of(context).routeInformationProvider.value.uri`.

### `IndexOrdersScreen` — Query Parameter Filter
Pastikan `IndexOrdersScreen` bisa menerima `initialStatusFilter` dari query parameter GoRouter (bukan hanya dari constructor). Cek implementasinya saat ini — jika `initialStatusFilter` sudah ada sebagai constructor param, update route `/orders` di router untuk meneruskan query param:

```dart
GoRoute(
  path: '/orders',
  pageBuilder: (context, state) {
    final authState = _authCubit.state;
    final statusFilter = state.uri.queryParameters['status'];
    if (authState is Authenticated) {
      return state.slidePage(
        IndexOrdersScreen(
          outletId: authState.employee.outletId,
          initialStatusFilter: statusFilter, // [TAMBAHKAN]
        ),
      );
    }
    // ...
  },
),
```

### Tidak Ada `StatefulNavigationShell`
Plan ini TIDAK menggunakan `StatefulNavigationShell` dari GoRouter. Bottom bar diimplementasikan di masing-masing root screen secara manual menggunakan `bottom_nav_helper.dart`. Ini lebih sederhana dan tidak membutuhkan perubahan arsitektur besar. Trade-off: state tiap root screen akan di-reset saat user pindah tab (tidak ada state preservation antar tab). Jika implementer ingin state preservation, pertimbangkan `StatefulNavigationShell` tapi itu adalah scope yang berbeda dan lebih besar.

### `menu_outlet_section.dart` dan `quick_actions_section.dart` di widgets/
Ada duplikasi: terdapat `quick_actions_section.dart` di `presentation/widgets/` (4218 bytes) dan `quick_actions_section.dart` di `presentation/sections/` (2256 bytes). Pastikan yang dipakai adalah yang di `sections/` — yang di `widgets/` mungkin versi lama atau tidak dipakai. Periksa sebelum memodifikasi.

### `menu_outlet_section.dart`
Widget ini (di `presentation/widgets/`) tampaknya tidak dipakai di `HomeScreen` saat ini (tidak ada import di `home_screen.dart`). Kemungkinan merupakan widget legacy. Jangan dipakai — fokus pada `QuickActionsSection` yang sudah terintegrasi di Home.

### Backward Compat — Route `/orders` dari Notification
Pastikan setelah `context.go('/orders?status=requested')`, `IndexOrdersScreen` benar-benar menerima dan menerapkan filter. Jika tidak, user akan masuk ke daftar order tanpa filter. Ini harus diverifikasi di langkah manual testing.

### `AppLayout` — `showDrawer` vs `showMenuButton`
Cek apakah `AppLayout` dari `wash_wallet_ui` punya parameter `showDrawer` atau hanya `showMenuButton` di `AppHeader`. Jika drawer dicontrol lewat `AppLayout`, tambahkan `showDrawer: false`. Jika hanya lewat `AppHeader.showMenuButton`, cukup set `showMenuButton: false`.
