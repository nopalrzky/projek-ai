# Plan: Tablet Sidebar Navigation — Cashier & Production

## Latar Belakang

Berdasarkan dokumen kebutuhan `tablet_sidebar_navigation_user_need.md`, navigasi sidebar tablet pada kedua aplikasi perlu diperbaiki dengan grouping menu yang terstruktur.

**Kondisi Saat Ini:**
- **Cashier:** `CashierNavigationConfig` sudah memiliki section `Operasional` tetapi item-itemnya belum sesuai kebutuhan baru: finance items (Setoran Kasir, Petty Cash, Pengeluaran) masih di bawah `Operasional`, profile dan setting (Printer, PIN Security) tidak ada di sidebar, dan routing mapping di `MainShellScreen` belum mencakup semua route.
- **Production:** `ProductionNavigationConfig` hanya memiliki section `Produksi` dan `Kurir` yang sederhana, belum mengikuti pola sidebar section yang konsisten.
- Mobile/compact tidak terpengaruh, sudah berjalan dengan bottom navigation.

---

## Proposed Changes

### App Cashier

---

#### [MODIFY] [cashier_navigation_config.dart](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/core/navigation/cashier_navigation_config.dart)

Restrukturisasi total `buildSections()` menjadi 4 area:

1. **Area Utama (tanpa judul section):** `Home`, `Profile`
2. **Section `Operasional`:** Order/Transaksi, Pelanggan, Layanan Laundry, Kategori, Paket Layanan, Membership, Setup Outlet
3. **Section `Dana & Keuangan`:** Setoran Kasir (route `/finances`), Petty Cash, Pengeluaran Outlet
4. **Area `Setting` (di bagian bawah, tanpa judul atau dengan judul `Setting`):** Printer, Keamanan PIN

```dart
class CashierNavigationConfig {
  static List<SidebarMenuSection> buildSections() {
    return [
      // Area Utama
      SidebarMenuSection(
        items: [
          SidebarMenuItem(id: 'home', label: 'Home', icon: Icons.home_outlined, selectedIcon: Icons.home, route: '/home'),
          SidebarMenuItem(id: 'profile', label: 'Profil', icon: Icons.person_outline, selectedIcon: Icons.person, route: '/settings/profile'),
        ],
      ),
      // Section Operasional
      SidebarMenuSection(
        title: 'Operasional',
        items: [
          SidebarMenuItem(id: 'orders', label: 'Transaksi', icon: Icons.receipt_long_outlined, selectedIcon: Icons.receipt_long, route: '/orders'),
          SidebarMenuItem(id: 'customers', label: 'Pelanggan', icon: Icons.people_outline, route: '/settings/setup-outlet/customers'),
          SidebarMenuItem(id: 'laundry-services', label: 'Layanan Laundry', icon: Icons.local_laundry_service_outlined, route: '/settings/setup-outlet/laundry-services'),
          SidebarMenuItem(id: 'categories', label: 'Kategori', icon: Icons.category_outlined, route: '/settings/setup-outlet/categories'),
          SidebarMenuItem(id: 'service-packages', label: 'Paket Layanan', icon: Icons.inventory_2_outlined, route: '/settings/setup-outlet/service-packages'),
          SidebarMenuItem(id: 'membership-plans', label: 'Membership', icon: Icons.card_membership_outlined, route: '/settings/setup-outlet/membership-plans'),
          SidebarMenuItem(id: 'outlets', label: 'Kelola Outlet', icon: Icons.store_outlined, route: '/settings/setup-outlet'),
        ],
      ),
      // Section Dana & Keuangan
      SidebarMenuSection(
        title: 'Dana & Keuangan',
        items: [
          SidebarMenuItem(id: 'finances', label: 'Setoran Kasir', icon: Icons.account_balance_wallet_outlined, selectedIcon: Icons.account_balance_wallet, route: '/finances'),
          SidebarMenuItem(id: 'petty-cash', label: 'Petty Cash', icon: Icons.account_balance_outlined, route: '/settings/setup-outlet/petty-cash'),
          SidebarMenuItem(id: 'expenses', label: 'Pengeluaran Outlet', icon: Icons.money_off_outlined, route: '/settings/setup-outlet/expenses'),
        ],
      ),
      // Area Setting
      SidebarMenuSection(
        title: 'Setting',
        items: [
          SidebarMenuItem(id: 'printer', label: 'Printer', icon: Icons.print_outlined, route: '/settings/printer'),
          SidebarMenuItem(id: 'pin-security', label: 'Keamanan PIN', icon: Icons.security_outlined, route: '/settings/pin-security'),
        ],
      ),
    ];
  }
}
```

> [!NOTE]
> Item `deposits` (Deposit Pelanggan) yang ada di config lama tidak disebutkan eksplisit di user need, jadi bisa dihapus atau dipindahkan ke Operasional sesuai keputusan tim. Konfirmasi sebelum menghapus.

---

#### [MODIFY] [main_shell_screen.dart](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/core/navigation/main_shell_screen.dart)

Perbarui logika `currentRouteId` resolver agar mencakup semua route baru dari config, khususnya `profile`, `printer`, `pin-security`, dan `finances`:

```dart
// Tambahan route-id mapping:
} else if (location.startsWith('/settings/printer')) {
  currentRouteId = 'printer';
} else if (location.startsWith('/settings/pin-security') || location.startsWith('/settings/pin-reset')) {
  currentRouteId = 'pin-security';
} else if (location.startsWith('/settings/profile')) {
  currentRouteId = 'profile';
} else if (location.startsWith('/finances')) {
  currentRouteId = 'finances';
}
```

> [!IMPORTANT]
> Urutan `if-else` sangat penting karena GoRouter menggunakan prefix matching. Route yang lebih spesifik harus diperiksa lebih dulu daripada yang lebih umum (misalnya `/settings/setup-outlet/laundry-services` sebelum `/settings/setup-outlet` sebelum `/settings`).

---

### App Production

---

#### [MODIFY] [production_navigation_config.dart](file:///C:/Bimo/Project/wash_wallet/apps/production/lib/core/navigation/production_navigation_config.dart)

Tambahkan area utama yang lebih rapi dan ikuti pola sidebar section yang konsisten dengan Cashier. Sidebar Production tetap permission-aware sesuai `PermissionChecker`:

```dart
class ProductionNavigationConfig {
  static List<SidebarMenuSection> buildSections(AuthEmployee employee) {
    return [
      // Area Utama
      SidebarMenuSection(
        items: [
          SidebarMenuItem(
            id: 'home',
            label: 'Dashboard',
            icon: Icons.home_outlined,
            selectedIcon: Icons.home,
            route: '/home',
          ),
        ],
      ),
      // Section Produksi (permission-gated)
      if (PermissionChecker.hasProductionAccess(employee))
        SidebarMenuSection(
          title: 'Produksi',
          items: [
            SidebarMenuItem(
              id: 'orders',
              label: 'Antrian Order',
              icon: Icons.receipt_long_outlined,
              selectedIcon: Icons.receipt_long,
              route: '/orders',
            ),
          ],
        ),
      // Section Kurir (permission-gated)
      if (PermissionChecker.hasCourierAccess(employee))
        SidebarMenuSection(
          title: 'Kurir',
          items: [
            SidebarMenuItem(
              id: 'pickup-schedule',
              label: 'Jadwal Pickup',
              icon: Icons.local_shipping_outlined,
              selectedIcon: Icons.local_shipping,
              route: '/pickup-schedule',
            ),
          ],
        ),
    ];
  }
}
```

> [!NOTE]
> Perubahan pada `ProductionNavigationConfig` terutama berupa normalisasi: menambahkan `selectedIcon` yang hilang dan memastikan visual konsisten dengan Cashier. Struktur section tidak berubah signifikan karena modul Production memang lebih terbatas.

---

#### [MODIFY] Production `main_shell_screen.dart` atau equivalent

Pastikan shell screen Production memiliki route-id resolver yang sinkron dengan config menu. Cek file shell screen Production (kemungkinan ada di `lib/core/widgets/` atau langsung di router) dan pastikan `currentRouteId` di-resolve untuk `/orders`, `/pickup-schedule`, dan `/home`.

---

## Hal yang TIDAK Perlu Diubah

- Router GoRouter (`app_router.dart`) pada kedua app — route yang ada sudah mencakup semua target navigasi sidebar.
- Bottom navigation mobile/compact — tidak tersentuh oleh perubahan ini.
- Auth flow, permission guard, onboarding, dan stale session tidak berubah.
- Komponen `OperationalTabletShell` / `ProductionTabletShell` di `wash_wallet_ui` — sudah mendukung section.

---

## Tabel Mapping Sidebar Cashier

| Menu Item         | Section           | Route                                       | Route ID           |
|-------------------|-------------------|---------------------------------------------|--------------------|
| Home              | (utama)           | `/home`                                     | `home`             |
| Profil            | (utama)           | `/settings/profile`                         | `profile`          |
| Transaksi         | Operasional       | `/orders`                                   | `orders`           |
| Pelanggan         | Operasional       | `/settings/setup-outlet/customers`          | `customers`        |
| Layanan Laundry   | Operasional       | `/settings/setup-outlet/laundry-services`   | `laundry-services` |
| Kategori          | Operasional       | `/settings/setup-outlet/categories`         | `categories`       |
| Paket Layanan     | Operasional       | `/settings/setup-outlet/service-packages`   | `service-packages` |
| Membership        | Operasional       | `/settings/setup-outlet/membership-plans`   | `membership-plans` |
| Kelola Outlet     | Operasional       | `/settings/setup-outlet`                    | `outlets`          |
| Setoran Kasir     | Dana & Keuangan   | `/finances`                                 | `finances`         |
| Petty Cash        | Dana & Keuangan   | `/settings/setup-outlet/petty-cash`         | `petty-cash`       |
| Pengeluaran       | Dana & Keuangan   | `/settings/setup-outlet/expenses`           | `expenses`         |
| Printer           | Setting           | `/settings/printer`                         | `printer`          |
| Keamanan PIN      | Setting           | `/settings/pin-security`                    | `pin-security`     |

---

## Verification Plan

### Automated
```bash
flutter analyze
```
Pastikan tidak ada error atau warning baru di kedua app.

### Manual (Tablet/Emulator Non-Compact)

**Cashier:**
1. Login sebagai kasir di tablet → sidebar tampil
2. Verifikasi 4 area terbentuk: utama, Operasional, Dana & Keuangan, Setting
3. Tap setiap item → memastikan navigasi ke route yang benar
4. Deep link ke `/settings/printer` → sidebar highlight `Printer` di area Setting
5. Deep link ke `/settings/pin-security` → sidebar highlight `Keamanan PIN` di area Setting
6. Deep link ke `/settings/profile` → sidebar highlight `Profil`
7. Di mobile/compact → bottom navigation tidak berubah

**Production:**
1. Login sebagai user production di tablet
2. Sidebar menampilkan area utama dan section Produksi
3. Login sebagai user courier → sidebar menampilkan section Kurir
4. Login sebagai user tanpa akses produksi → section Produksi tidak tampil
5. Login sebagai user tanpa akses kurir → section Kurir tidak tampil
