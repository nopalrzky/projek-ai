# Implementation Plan: Tablet Layout Cashier & Production App

**Versi:** 1.0  
**Tanggal:** 2026-06-28  
**Scope:** `apps/cashier` dan `apps/production`  
**Prasyarat:** Widget shared UI di `packages/wash_wallet_ui` sudah tersedia dan terverifikasi (`flutter analyze` clean).

---

## Latar Belakang

Widget-widget shared UI untuk tablet dashboard (`OperationalTabletShell`, `OperationalSidebar`, `OperationalTopHeader`, `PageContentHeader`, `AppDataView`, `AppDataTable`, `IndexToolbar`) telah selesai diimplementasikan di `packages/wash_wallet_ui`. Plan ini mendefinisikan bagaimana widget-widget tersebut diintegrasikan ke dalam `apps/cashier` dan `apps/production`.

Referensi user need: `docs/user_need/cashier_production_tablet_management_layout_user_need.md`

---

## Konteks Codebase Saat Ini

### apps/cashier

- Navigasi utama menggunakan `StatefulShellRoute.indexedStack` → `MainShellScreen` → `AdaptiveScaffold`
- `AdaptiveScaffold`: compact = `AppBottomBar`, medium/large = `NavigationRail`
- Root tabs (4 tab): **Home** (`/home`), **Dana** (`/finances`), **Transaksi** (`/orders`), **Setting** (`/settings`)
- Beberapa index screen sudah punya `_buildTabletTable` lokal dengan `DataTable` manual:
  - `IndexOrdersScreen`, `IndexLaundryServicesScreen`, `IndexCustomersScreen`, `IndexCategoriesScreen`, `IndexServicePackagesScreen`, `IndexMembershipPlanScreen`, `IndexDepositScreen`, `IndexExpenseScreen`, `IndexPettyCashScreen`
- Tiap screen menggunakan `AppLayout` + `AppHeader` sendiri

### apps/production

- **Tidak** menggunakan `StatefulShellRoute` — tiap route berdiri sendiri
- Navigasi via `AppDynamicBottomBar` yang permission-aware (`BottomBarItemsBuilder`)
- `PermissionChecker.hasProductionAccess()` dan `hasCourierAccess()` untuk mengontrol menu
- Protected routes: `/home`, `/orders`, `/orders/:id`, `/order-items/:id`, `/pickup-schedule`
- Layout: tiap screen memakai `AppLayout` + `AppDynamicBottomBar`

### packages/wash_wallet_ui (Widget Siap Digunakan)

| Widget | File |
|---|---|
| `OperationalTabletShell` | `layout/operational_tablet_shell/operational_tablet_shell.dart` |
| `OperationalSidebar` | `layout/operational_sidebar/operational_sidebar.dart` |
| `OperationalTopHeader` | `layout/operational_top_header/operational_top_header.dart` |
| `PageContentHeader` | `layout/page_content_header/page_content_header.dart` |
| `AppDataView` | `data_view/app_data_view.dart` |
| `AppDataTable` | `data_view/app_data_table.dart` |
| `IndexToolbar` | `data_view/index_toolbar.dart` |
| `SidebarMenuItem` | `layout/operational_sidebar/models/sidebar_menu_item.dart` |
| `SidebarMenuSection` | `layout/operational_sidebar/models/sidebar_menu_section.dart` |
| `SidebarUserAccount` | `layout/operational_sidebar/models/sidebar_user_account.dart` |
| `BreadcrumbItem` | `layout/page_content_header/models/breadcrumb_item.dart` |
| `DataTableColumnDef` | `data_view/models/data_table_column_def.dart` |
| `DataTableRowAction` | `data_view/models/data_table_action.dart` |
| `FilterConfig` | `data_view/models/filter_config.dart` |
| `FilterOption` | `data_view/models/filter_option.dart` |
| `ActiveFilter` | `data_view/models/active_filter.dart` |

---

## Strategi Implementasi

### Cashier: Replace `MainShellScreen` Shell

Karena Cashier sudah memakai `StatefulShellRoute`, pendekatannya adalah **memodifikasi `MainShellScreen`** untuk mempercabang antara:
- Compact → `AdaptiveScaffold` (tidak berubah, phone layout aman)
- Tablet → `OperationalTabletShell` menggantikan `AdaptiveScaffold`

Screen child (Home, Dana, Transaksi, Setting) tetap sebagai `body` shell. Pada tablet, tiap screen tidak perlu merender header sendiri — shell sudah menyediakan sidebar dan top header.

### Production: Wrapper `ProductionTabletShell`

Karena Production tidak memakai `StatefulShellRoute`, dibuat sebuah **wrapper widget `ProductionTabletShell`** yang membungkus tiap screen. Screen memilih layout berdasarkan breakpoint:
- Compact → `AppLayout` + `AppDynamicBottomBar` (tidak berubah)
- Tablet → `ProductionTabletShell` dengan sidebar permission-aware

---

## Fase-Fase Implementasi

---

### Fase 1 — Cashier Navigation Config & Shell Adapter

**Estimasi Kesulitan:** Sedang  
**Prasyarat:** -

#### [NEW] `apps/cashier/lib/core/navigation/cashier_navigation_config.dart`

Mendefinisikan menu sidebar Cashier sebagai `List<SidebarMenuSection>`.

```
CashierNavigationConfig
  └── static buildSections() → List<SidebarMenuSection>
        ├── SidebarMenuSection (tanpa title) → items: Home, Dana, Transaksi, Setting
        └── SidebarMenuSection (title: 'Operasional') → items:
              Manajemen Order, Data Pelanggan, Kelola Outlet,
              Layanan Laundry, Paket Layanan, Daftar Membership,
              Deposit Pelanggan, Catat Pengeluaran, Kas Kecil
```

Setiap `SidebarMenuItem` memiliki:
- `id`: unique string identifier (sama dengan route path, e.g. `'home'`, `'orders'`, `'laundry-services'`)
- `label`: string display
- `icon`: `IconData`
- `route`: path string untuk navigasi via `context.go()`

Contoh route mapping:
- Home → `/home`
- Dana → `/finances`
- Transaksi → `/orders`
- Setting → `/settings`
- Manajemen Order → `/orders`
- Layanan Laundry → `/settings/setup-outlet/laundry-services`
- Pelanggan → `/customers`
- Kategori → `/settings/setup-outlet/categories`
- Paket Layanan → `/settings/setup-outlet/service-packages`
- Membership → `/settings/setup-outlet/membership-plans`
- Deposit → `/settings/setup-outlet/deposits`
- Pengeluaran → `/settings/setup-outlet/expenses`
- Kas Kecil → `/settings/setup-outlet/petty-cash`

#### [MODIFY] `apps/cashier/lib/core/navigation/main_shell_screen.dart`

Modifikasi `build()`:
1. Import `AppBreakpoints`, `OperationalTabletShell`, `CashierNavigationConfig`, `SidebarUserAccount`, `AuthCubit`
2. Check breakpoint: `final isCompact = AppBreakpoints.of(context) == WindowSizeClass.compact;`
3. Jika `isCompact` → kembalikan `AdaptiveScaffold` existing (TIDAK ADA PERUBAHAN pada path ini)
4. Jika tablet → kembalikan `OperationalTabletShell`:
   - `appName: 'WashWallet'`
   - `appRoleLabel: 'Kasir App / Management System'`
   - `menuSections: CashierNavigationConfig.buildSections()`
   - `currentRouteId`: derive dari `GoRouterState.of(context).matchedLocation` atau mapping dari `navigationShell.currentIndex`
   - `onMenuItemTap`: `(item) => context.go(item.route ?? '')`
   - `userAccount`: baca dari `context.read<AuthCubit>().state` → `Authenticated.employee.name`
   - `searchHint: 'Cari pesanan, pelanggan...'`
   - `body: widget.navigationShell`
5. Pertahankan animasi slide dan gesture swipe hanya untuk compact mode

---

### Fase 2 — Cashier: Baseline IndexLaundryServicesScreen Refactor

**Estimasi Kesulitan:** Sedang  
**Prasyarat:** Fase 1

Ini adalah screen **baseline** yang harus selesai sempurna sebelum screen lain dimigrasikan.

#### [MODIFY] `apps/cashier/lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart`

Pada mode tablet (`!isCompact`):

1. Hapus method `_buildTabletTable()` dan `_buildTabletTableContent()` yang menggunakan `DataTable` manual
2. Hapus widget `TabletTableToolbar` manual
3. Tambahkan helper method `_buildTabletColumnDefs()` → `List<DataTableColumnDef>`:

| ID | Header | Lebar |
|---|---|---|
| `name` | Nama Layanan | flex |
| `category` | Kategori | 140 |
| `unit` | Unit | 100 |
| `price` | Harga | 120 |
| `duration` | Durasi | 100 |
| `min_qty` | Min. Qty | 100 |
| `status` | Status | 100 |

4. Tambahkan helper method `_buildFilterConfigs(categories, units)` → `List<FilterConfig>`:
   - Filter Kategori: opsi dari `CategoryCubit` state
   - Filter Unit: opsi dari `UnitCubit` state
   - Filter Status: Aktif / Nonaktif (statis)

5. Tambahkan helper method `_buildRowActions()` → `List<DataTableRowAction>`:
   - view: `Icons.visibility_outlined`, warna biru, tooltip "Lihat"
   - edit: `Icons.edit_outlined`, warna orange, tooltip "Edit"
   - delete: `Icons.delete_outline`, warna merah, tooltip "Hapus"

6. Map state services ke `List<Map<String, dynamic>>` untuk `rows`

7. Render di tablet:
```dart
Column(
  children: [
    PageContentHeader(
      breadcrumbs: [
        BreadcrumbItem(label: 'Setting'),
        BreadcrumbItem(label: 'Setup Outlet'),
        BreadcrumbItem(label: 'Layanan Laundry', isActive: true),
      ],
      title: 'Manajemen Layanan Laundry',
      subtitle: '${services.length} layanan tersedia',
      actions: [
        AppButton(..., label: 'Tambah Layanan Laundry', onPressed: _navigateToCreateScreen),
      ],
    ),
    Expanded(
      child: AppDataView(
        columns: _buildTabletColumnDefs(),
        rows: _mapServicesToRows(services),
        filterConfigs: _buildFilterConfigs(categories, units),
        rowActions: _buildRowActions(),
        isLoading: state is LaundryServiceLoading,
        errorMessage: state is LaundryServiceFailure ? ... : null,
        emptyMessage: 'Belum ada layanan laundry',
        onSearchChanged: ...,
        onFiltersChanged: ...,
      ),
    ),
  ],
)
```

---

### Fase 3 — Cashier: Refactor Index Screens Lainnya (Prioritas Tinggi)

**Estimasi Kesulitan:** Sedang  
**Prasyarat:** Fase 2 (pola sudah established)

Pola migrasi sama persis dengan Fase 2. Untuk setiap screen:
1. Tambahkan `!isCompact` branch menggunakan `AppDataView`
2. Pertahankan compact branch existing
3. Jika ada `_buildTabletTable` lokal → hapus dan ganti dengan `AppDataView`

#### [MODIFY] `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`

Kolom tablet:

| ID | Header |
|---|---|
| `invoice_number` | No. Order |
| `customer_name` | Pelanggan |
| `status` | Status |
| `total` | Total |
| `created_at` | Tanggal |

Filter: Status order (dropdown dari `_statusFilters`)  
Row actions: view, update status  
Two-pane: `showSecondaryBody: _selectedOrderId != null`, `secondaryBody: ShowOrderPanel(orderId: _selectedOrderId)`

#### [MODIFY] `apps/cashier/lib/features/customer/presentation/screens/index_customers_screen.dart`

Kolom: Nama, No. HP, Email, Poin, Tanggal Daftar  
Row actions: view, edit, delete

#### [MODIFY] `apps/cashier/lib/features/category/presentation/screens/index_categories_screen.dart`

Kolom: Nama, Deskripsi, Jumlah Layanan  
Row actions: edit, delete

#### [MODIFY] `apps/cashier/lib/features/service_package/presentation/screens/index_service_packages_screen.dart`

Kolom: Nama, Harga, Diskon, Status  
Row actions: view, edit, delete

#### [MODIFY] `apps/cashier/lib/features/membership_plan/presentation/screens/index_membership_plan_screen.dart`

Kolom: Nama, Harga, Durasi, Benefit  
Row actions: edit, delete

---

### Fase 4 — Cashier: Home Dashboard Tablet

**Estimasi Kesulitan:** Sedang  
**Prasyarat:** Fase 1

#### [MODIFY] `apps/cashier/lib/features/home/presentation/screens/home_screen.dart`

Di mode tablet:
- Body screen **tidak** merender `AppLayout` + `AppHeader` standalone (header sudah ada di shell)
- Tambahkan `PageContentHeader` di atas konten:
  - `breadcrumbs: [BreadcrumbItem(label: 'Dashboard', isActive: true)]`
  - `title: 'Dashboard Kasir'`
  - `subtitle`: bisa menampilkan nama outlet/employee
- Konten dashboard (SummaryCard, QuickActions, dll.) tetap sama, hanya dibungkus `Scaffold(body: ...)` tanpa AppLayout

---

### Fase 5 — Production: Navigation Config & Wrapper Shell

**Estimasi Kesulitan:** Sedang-Tinggi  
**Prasyarat:** Fase 1 (pola Cashier sudah established)

#### [NEW] `apps/production/lib/core/navigation/production_navigation_config.dart`

```dart
class ProductionNavigationConfig {
  static List<SidebarMenuSection> buildSections(AuthEmployee employee) {
    return [
      SidebarMenuSection(
        items: [
          SidebarMenuItem(id: 'home', label: 'Dashboard', icon: Icons.home_outlined, route: '/home'),
        ],
      ),
      if (PermissionChecker.hasProductionAccess(employee))
        SidebarMenuSection(
          title: 'Produksi',
          items: [
            SidebarMenuItem(id: 'orders', label: 'Antrian Order', icon: Icons.receipt_long_outlined, route: '/orders'),
            // order-items bila ada dedicated route
          ],
        ),
      if (PermissionChecker.hasCourierAccess(employee))
        SidebarMenuSection(
          title: 'Kurir',
          items: [
            SidebarMenuItem(id: 'pickup-schedule', label: 'Jadwal Pickup', icon: Icons.local_shipping_outlined, route: '/pickup-schedule'),
          ],
        ),
    ];
  }
}
```

#### [NEW] `apps/production/lib/core/widgets/production_tablet_shell.dart`

```dart
class ProductionTabletShell extends StatelessWidget {
  final String currentRouteId;
  final Widget child;
  final bool showSecondaryBody;
  final Widget? secondaryBody;

  // build():
  // 1. Baca context breakpoint
  // 2. isCompact → return child (screen kelola AppLayout sendiri)
  // 3. tablet → baca AuthCubit state untuk employee info
  //             → render OperationalTabletShell dengan buildSections(employee)
  //             → body: child (tanpa AppLayout wrapping)
}
```

#### [MODIFY] `apps/production/lib/features/home/presentation/screens/home_screen.dart`

```dart
Widget build(BuildContext context) {
  final isCompact = AppBreakpoints.of(context) == WindowSizeClass.compact;
  
  if (isCompact) {
    return AppLayout(
      header: AppHeader(...),
      bottomBar: AppDynamicBottomBar(...),
      body: _buildBody(context, state),
    );
  }
  
  return ProductionTabletShell(
    currentRouteId: 'home',
    child: Column(
      children: [
        PageContentHeader(title: 'Dashboard Produksi', ...),
        Expanded(child: _buildBody(context, state)),
      ],
    ),
  );
}
```

#### [MODIFY] `apps/production/lib/features/order/presentation/screens/index_order_screen.dart`

Tablet mode:
- `ProductionTabletShell` sebagai wrapper
- `AppTabBar` untuk tab "Siap Dikerjakan" / "Sedang Dikerjakan" tetap ada
- Konten order list bisa menggunakan `AppDataView` atau tetap list card (tergantung kompleksitas)
- `PageContentHeader` dengan title "Antrian Produksi"

#### [MODIFY] `apps/production/lib/features/order/presentation/screens/show_order_screen.dart`

Tablet mode:
- `ProductionTabletShell` sebagai wrapper
- `PageContentHeader` dengan breadcrumb: Home > Antrian > #OrderId

#### [MODIFY] `apps/production/lib/features/order/presentation/screens/pickup_schedule_screen.dart`

Tablet mode:
- `ProductionTabletShell` sebagai wrapper
- `PageContentHeader` dengan title "Jadwal Pickup"

---

### Fase 6 — Cashier: Secondary Priority Screens

**Estimasi Kesulitan:** Rendah-Sedang  
**Prasyarat:** Fase 2-3 (pola established)

Screen-screen berikut ditambahkan tablet support:

#### [MODIFY] `apps/cashier/lib/features/deposit/presentation/screens/` *(index screen)*
- `AppDataView`: Pelanggan, Jumlah, Tanggal, Aksi

#### [MODIFY] `apps/cashier/lib/features/expense/presentation/screens/` *(index screen)*
- `AppDataView`: Kategori, Deskripsi, Jumlah, Tanggal, Aksi

#### [MODIFY] `apps/cashier/lib/features/petty_cash/presentation/screens/` *(index screen)*
- `AppDataView`: Keterangan, Jumlah, Tanggal, Aksi

#### Screens yang cukup tambahkan `PageContentHeader` tanpa `AppDataView` (misal detail/form screens):
- Setting index screen
- Create/edit screens — cukup dibungkus oleh shell otomatis via navigation

---

### Fase 7 — Verifikasi End-to-End

**Prasyarat:** Fase 1-6

1. `flutter analyze packages/wash_wallet_ui` → No issues
2. `flutter analyze apps/cashier` → No issues
3. `flutter analyze apps/production` → No issues

**Visual check Cashier:**
- Phone portrait: bottom bar ada, layout mobile tidak berubah
- Tablet portrait: sidebar collapsed, content area tidak overflow
- Tablet landscape: sidebar expanded, semua tabel terbaca

**Visual check Production:**
- Phone portrait: `AppDynamicBottomBar` ada, layout tidak berubah
- Tablet portrait: sidebar compact dengan permission filtering
- Tablet landscape: sidebar expanded, order view terbaca
- Production-only employee: menu Kurir tidak muncul
- Courier-only employee: menu Produksi tidak muncul

**Cek Sidebar:**
- Expanded: logo + nama app + label + semua menu dengan text
- Collapsed: icon only + tooltip saat hover/long-press
- Selected state: highlight jelas pada item aktif
- Grouped section: header label muncul di atas grup
- Account footer: avatar + nama + subtitle

**Cek Top Header:**
- Search bar: bisa submit, clear, tidak overflow
- Clock: update real-time
- Notification badge: muncul saat `notificationCount > 0`
- User avatar dan nama

**Cek AppDataView (IndexLaundryServicesScreen sebagai baseline):**
- Search: submit dengan Enter, clear dengan × button
- Filter: pilih kategori → data berubah, active filter pill muncul
- Reset filter: data kembali ke semua
- Loading state: spinner/shimmer
- Empty state: pesan dan icon kosong
- Error state: pesan error + retry button
- Row actions: view (biru), edit (orange), delete (merah) dengan tooltip

**Cek No Overflow:**
- Toolbar: search + filter + button tidak overflow pada tablet portrait
- Table rows: text truncate dengan ellipsis, tidak overflow
- Action buttons: icon buttons dalam batas touch target 44dp
- Sidebar labels: truncate bila panjang, tidak overflow saat collapsed

---

## Catatan Implementasi

1. **`currentRouteId` di Cashier:** Derive dari `GoRouterState.of(context).matchedLocation` karena Cashier menggunakan subroutes (`/settings/setup-outlet/laundry-services`). `navigationShell.currentIndex` hanya cocok untuk 4 root tab.

2. **Two-pane Order Cashier:** `IndexOrdersScreen` sudah punya state `_selectedOrderId`. Di tablet, ini bisa digunakan sebagai `showSecondaryBody: true` pada `OperationalTabletShell`. Secondary body adalah widget detail order yang sudah ada (`ShowOrderScreen` dalam panel mode).

3. **Cashier Index Screens yang Sudah Ada `_buildTabletTable`:** Hapus method tersebut dan ganti total dengan `AppDataView`. Jangan menyisakan dua implementasi paralel.

4. **Production Permission Awareness:** `ProductionTabletShell` harus membaca `context.read<AuthCubit>().state` untuk mendapat `employee`, lalu memanggil `ProductionNavigationConfig.buildSections(employee)`. Ini menjaga logika permission tetap di layer app, bukan di shared UI.

5. **Jika Screen Belum Ada `_buildTabletTable`:** Prioritas cukup tambahkan `PageContentHeader` dulu agar terasa terintegrasi dengan shell. Data table bisa menyusul.

6. **Filter yang Belum Didukung API:** Tandai dengan komentar `// TODO: implement when API supports filter X`, jangan diimplementasi paksa.

7. **`AppDataView` rows:** Harus berupa `List<Map<String, dynamic>>` atau custom row builder yang kompatibel dengan `DataTableColumnDef`. Setiap key pada map harus match dengan `columnId` yang didefinisikan di `DataTableColumnDef`.
