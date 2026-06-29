# Cashier Tablet Dashboard Layout — Implementation Plan (Revised)

Tanggal: 2026-06-27
Status: Draft — Menunggu Approval
User Need Reference: `docs/user_need/cashier_tablet_dashboard_user_need.md`
Prerequisite Plan: `docs/plan/fix_navigation_rail_extended_assertion.md`

---

## 1. Ringkasan

Plan ini mengubah tampilan Cashier App pada tablet menjadi **dashboard operasional POS yang profesional**.

Dua area kerja utama:

1. **Home Screen Tablet** — dashboard canvas dengan panel-panel KPI, summary, quick actions, dan notifikasi menggunakan grid layout.
2. **Index Screens Tablet** — semua layar daftar (Category, Customer, Customer Subscription, Order, Laundry Service, Service Package, Membership Plan, Deposit, Expense, Petty Cash) diganti tampilan **data table** pada tablet, dengan search, filter chips, dan row actions inline.

Fokus: **presentation layer saja**. Tidak ada perubahan BLoC, use case, API, atau flow bisnis.

---

## 2. Konteks Codebase — Screen yang Akan Diubah

### 2.1 Index Screens (Saat Ini: Mobile List Card)

| Screen | File | Search | Filter | Actions |
|---|---|---|---|---|
| IndexOrdersScreen | `features/order/presentation/screens/index_orders_screen.dart` | Ada (OrderSearchBar) | Ada (OrderFilterChips - status) | onTap ke detail, buat pesanan |
| IndexCustomersScreen | `features/customer/presentation/screens/index_customers_screen.dart` | Ada (CustomerSearchBar) | Belum ada | onTap, edit, delete |
| IndexCategoriesScreen | `features/category/presentation/screens/index_categories_screen.dart` | Ada (CategorySearchBar) | Belum ada | onTap, edit, delete |
| IndexLaundryServicesScreen | `features/laundry_service/presentation/screens/index_laundry_services_screen.dart` | Perlu dicek | Belum ada | onTap, edit, delete |
| IndexServicePackagesScreen | `features/service_package/presentation/screens/index_service_packages_screen.dart` | Perlu dicek | Belum ada | onTap |
| IndexMembershipPlanScreen | `features/membership_plan/presentation/screens/index_membership_plan_screen.dart` | Perlu dicek | Belum ada | onTap |
| IndexDepositScreen | `features/deposit/presentation/screens/index_deposit_screen.dart` | Perlu dicek | Perlu dicek | onTap, buat deposit |
| IndexExpenseScreen | `features/expense/presentation/screens/index_expense_screen.dart` | Perlu dicek | Perlu dicek | onTap, buat expense |
| IndexPettyCashScreen | `features/petty_cash/presentation/screens/index_petty_cash_screen.dart` | Perlu dicek | Perlu dicek | onTap, buat petty cash |

### 2.2 Home Screen (Saat Ini: Mobile Column)

Data existing di HomeCubit yang bisa langsung dipakai:

| Field | Keterangan |
|---|---|
| `employeeName` | Nama kasir aktif |
| `cashBalance` | Saldo kas outlet |
| `ordersInProduction` | Pesanan sedang diproses |
| `ordersNotPickedUp` | Pesanan siap diambil |
| `ordersPickedUp` | Pesanan sudah diambil |
| Notification badge | Badge pesanan baru |
| NewOrderBanner | Banner pesanan baru |

### 2.3 Breakpoint (mengacu AppBreakpoints existing)

| Label | Width | Navigation | Layout Index | Layout Home |
|---|---|---|---|---|
| compact | < 600 dp | Bottom bar | Card list (tidak berubah) | Column mobile (tidak berubah) |
| medium | 600-839 dp | Navigation rail | Data table 2 kolom | Dashboard grid 2 kolom |
| expanded | 840-1199 dp | Navigation rail | Data table lebar | Dashboard grid 2-3 kolom |
| large | >= 1200 dp | Navigation rail extended | Data table + side panel | Dashboard grid 3 kolom, max-width |

---

## 3. Prerequisite

> Selesaikan `fix_navigation_rail_extended_assertion.md` terlebih dahulu sebelum mengerjakan plan ini.

---

## 4. Di Luar Scope

1. Perubahan BLoC, Cubit, use case, repository, atau API.
2. Perubahan flow bisnis (order, payment, timbang, printer).
3. Screen create/edit/show — tetap menggunakan layout mobile/push navigation.
4. Owner dashboard web (`webapp/`).
5. App lain: customer, production, courier.

---

## 5. Pendekatan Umum: Adaptive Index Screen Pattern

Semua index screen mengikuti pola yang sama:

`
IndexXxxScreen.build()
  |
  +-- AppBreakpoints.of(context) == compact
  |     --> _buildMobileList()   // layout existing, tidak diubah
  |
  +-- medium / expanded / large
        --> _buildTabletTable()  // BARU: data table layout
`

`_buildTabletTable()` terdiri dari:

`
Column(
  [TabletTableToolbar]   // search field + filter chips + action button (Tambah)
  [Expanded]
    [DataTable / CustomTableView]   // baris data + kolom + row actions
)
`

Tidak perlu membuat shared `DataTable` wrapper baru jika Flutter built-in `DataTable` / `SingleChildScrollView + DataTable` sudah cukup. Gunakan yang paling praktis.

---

## 6. Shared UI — Widget Baru di packages/wash_wallet_ui

### 6.1 [NEW] StatusChip

`packages/wash_wallet_ui/lib/src/components/indicators/status_chip.dart`

Widget chip kecil untuk status inline (order status, aktif/nonaktif, dll.).

`dart
class StatusChip extends StatelessWidget {
  const StatusChip({
    super.key,
    required this.label,
    this.icon,
    this.color,      // semantic color
    this.onTap,
  });
  final String label;
  final IconData? icon;
  final Color? color;
  final VoidCallback? onTap;
}
`

Ekspor di `wash_wallet_ui.dart`.

### 6.2 [NEW] TabletTableToolbar

`packages/wash_wallet_ui/lib/src/components/layout/tablet_table_toolbar.dart`

Toolbar reusable untuk semua index screen tablet: search field + filter chips row + primary action button.

`dart
class TabletTableToolbar extends StatelessWidget {
  const TabletTableToolbar({
    super.key,
    this.searchController,
    this.searchHint,
    this.onSearch,
    this.onSearchClear,
    this.filterChips = const [],   // List<Widget> — chip filter custom per screen
    this.primaryActionLabel,
    this.primaryActionIcon,
    this.onPrimaryAction,
  });
}
`

Ekspor di `wash_wallet_ui.dart`.

---

## 7. Home Screen — Tablet Dashboard Canvas

### [MODIFY] `apps/cashier/lib/features/home/presentation/screens/home_screen.dart`

Tambah conditional rendering berdasarkan breakpoint.

#### 7.1 Struktur Layout Tablet

`
Column(
  CashierDashboardHeader    // header 64dp dengan judul, outlet, action kanan
  Expanded(
    SingleChildScrollView(
      CashierDashboardGrid  // responsive grid panel
        [ShiftOutletPanel]
        [CashSummaryPanel]
        [OrderStatusPanel]
        [QuickActionsPanel]
        [NotificationPanel]
    )
  )
)
`

#### 7.2 Widget Baru (Cashier-Specific)

Semua berada di `apps/cashier/lib/features/home/presentation/`:

| Widget | File | Keterangan |
|---|---|---|
| CashierDashboardHeader | `widgets/cashier_dashboard_header.dart` | Header 64dp: judul, outlet, refresh, switch employee, notifikasi |
| CashierDashboardGrid | `layouts/cashier_dashboard_grid.dart` | Grid wrapper 1/2/3 kolom sesuai breakpoint |
| CashierShiftOutletPanel | `widgets/dashboard/shift_outlet_panel.dart` | Identitas kasir dan outlet |
| CashierCashSummaryPanel | `widgets/dashboard/cash_summary_panel.dart` | Saldo kas dan ringkasan |
| CashierOrderStatusPanel | `widgets/dashboard/order_status_panel.dart` | KPI order: in production, ready, done |
| CashierQuickActionsPanel | `widgets/dashboard/quick_actions_panel.dart` | Shortcut: Buat Transaksi, Cek Pesanan, Customer, Setor Kas |
| CashierNotificationPanel | `widgets/dashboard/notification_panel.dart` | NewOrderBanner dalam panel |

#### 7.3 Grid Layout per Breakpoint

| Breakpoint | Kolom | Susunan Panel |
|---|---|---|
| compact | 1 | Column mobile existing (tidak berubah) |
| medium | 2 | [Shift+Cash] [Order+Quick] [Notif full-width] |
| expanded | 2-3 | [Shift] [Cash] [Order] / [Quick] [Notif] |
| large | 3 | [Shift] [Cash] [Order] / [Quick] [Notif] + max-width 1400 |

#### 7.4 CashierDashboardHeader — Spesifikasi

- Background: `colorScheme.surface` + border bottom `colorScheme.outlineVariant`
- Height: 64 dp
- Kiri: judul "Dashboard Kasir" (`titleMedium`, w600) + subtitle outlet (`bodySmall`, `onSurfaceVariant`)
- Kanan: `IconButton` refresh + switch employee + notification badge
- Phone: tetap pakai header existing

#### 7.5 CashierOrderStatusPanel — Spesifikasi

Tiga KPI card horizontal:

| KPI | Data Field | Icon | Aksi Tap |
|---|---|---|---|
| Diproses | ordersInProduction | pending_actions | go('/orders?status=in_progress') |
| Siap Ambil | ordersNotPickedUp | inventory | go('/orders?status=ready') |
| Selesai | ordersPickedUp | check_circle | go('/orders?status=completed') |

Setiap KPI card: angka besar bold + label + icon semantik kecil.

#### 7.6 CashierQuickActionsPanel — Spesifikasi

Layout tablet: baris horizontal icon + label (bukan grid 2x2 mobile).

| Aksi | Icon | Route |
|---|---|---|
| Buat Transaksi | add_circle | Navigator ke SelectCustomerForOrderScreen |
| Cek Pesanan | receipt_long | go('/orders') |
| Pelanggan | people | go('/customers') atau route existing |
| Setor Kas | savings | handler existing |

---

## 8. Index Screens — Tablet Data Table

### 8.1 Pattern Implementasi

Setiap index screen ditambah method `_buildTabletTable(context, state)` yang dipanggil saat `!isCompact`.

Struktur `_buildTabletTable`:

`dart
Widget _buildTabletTable(BuildContext context, XxxLoaded state) {
  return Column(
    children: [
      TabletTableToolbar(
        searchController: _searchController,
        searchHint: 'Cari ...',
        onSearch: _loadData,
        onSearchClear: _clearSearch,
        filterChips: _buildFilterChips(), // opsional per screen
        primaryActionLabel: 'Tambah',
        primaryActionIcon: Icons.add_rounded,
        onPrimaryAction: _navigateToCreateScreen,
      ),
      Expanded(
        child: SingleChildScrollView(
          scrollDirection: Axis.vertical,
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              columns: _buildColumns(),
              rows: _buildRows(state.items),
            ),
          ),
        ),
      ),
    ],
  );
}
`

Row actions menggunakan `DataCell` dengan `Row([IconButton(edit), IconButton(delete)])` atau `PopupMenuButton` tergantung jumlah aksi.

### 8.2 IndexOrdersScreen

**File**: `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`

**Kolom tabel tablet**:

| # | Kolom | Lebar | Keterangan |
|---|---|---|---|
| 1 | No. Pesanan | 120 | ID atau nomor referensi |
| 2 | Pelanggan | 160 | Nama customer |
| 3 | Layanan | 140 | Nama layanan/item |
| 4 | Status | 120 | StatusChip dengan warna semantik |
| 5 | Total | 100 | Format currency |
| 6 | Tanggal | 120 | Format tanggal singkat |
| 7 | Aksi | 80 | IconButton detail |

**Filter chips**: status (Semua, Diajukan, Diterima, Diproses, Siap Ambil, Selesai) — pindahkan dari `OrderFilterChips` ke dalam `TabletTableToolbar.filterChips`.

**Side panel**: Pertahankan pola existing `_selectedOrderId` + `ShowOrderScreen(isEmbedded: true)` pada medium/expanded. Pada large, detail bisa tampil di panel kanan.

**Aksi per baris**: `IconButton(Icons.open_in_new)` → navigasi ke detail.

### 8.3 IndexCustomersScreen

**File**: `apps/cashier/lib/features/customer/presentation/screens/index_customers_screen.dart`

**Kolom tabel tablet**:

| # | Kolom | Keterangan |
|---|---|---|
| 1 | Nama | Nama pelanggan |
| 2 | No. HP | Nomor telepon |
| 3 | Total Pesanan | Jika tersedia di model |
| 4 | Aksi | IconButton(lihat), IconButton(edit), IconButton(hapus) |

**Filter chips**: belum ada di existing — implementer bisa menambahkan filter aktif/nonaktif jika model mendukung, atau skip filter dulu.

**Aksi per baris**: lihat detail, edit, hapus (dengan confirm dialog existing).

### 8.4 IndexCategoriesScreen

**File**: `apps/cashier/lib/features/category/presentation/screens/index_categories_screen.dart`

**Kolom tabel tablet**:

| # | Kolom | Keterangan |
|---|---|---|
| 1 | Nama Kategori | Nama |
| 2 | Jumlah Layanan | Jika tersedia di model |
| 3 | Aksi | IconButton(lihat), IconButton(edit), IconButton(hapus) |

**Filter chips**: tidak diperlukan untuk kategori.

### 8.5 IndexLaundryServicesScreen

**File**: `apps/cashier/lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart`

**Kolom tabel tablet**:

| # | Kolom | Keterangan |
|---|---|---|
| 1 | Nama Layanan | Nama |
| 2 | Kategori | Nama kategori |
| 3 | Harga | Format currency |
| 4 | Satuan | Satuan pengerjaan |
| 5 | Aksi | Lihat, edit, hapus |

### 8.6 IndexServicePackagesScreen

**File**: `apps/cashier/lib/features/service_package/presentation/screens/index_service_packages_screen.dart`

**Kolom tabel tablet**:

| # | Kolom | Keterangan |
|---|---|---|
| 1 | Nama Paket | Nama |
| 2 | Harga | Format currency |
| 3 | Deskripsi | Text singkat, truncated |
| 4 | Aksi | Lihat detail |

### 8.7 IndexMembershipPlanScreen

**File**: `apps/cashier/lib/features/membership_plan/presentation/screens/index_membership_plan_screen.dart`

**Kolom tabel tablet**:

| # | Kolom | Keterangan |
|---|---|---|
| 1 | Nama Plan | Nama membership |
| 2 | Harga | Format currency |
| 3 | Durasi | Misal: 30 hari |
| 4 | Aksi | Lihat detail |

### 8.8 IndexDepositScreen

**File**: `apps/cashier/lib/features/deposit/presentation/screens/index_deposit_screen.dart`

**Kolom tabel tablet**:

| # | Kolom | Keterangan |
|---|---|---|
| 1 | Tanggal | Tanggal deposit |
| 2 | Kasir | Nama kasir yang deposit |
| 3 | Jumlah | Format currency |
| 4 | Keterangan | Catatan singkat |
| 5 | Aksi | Lihat detail |

**Filter chips**: filter per tanggal/periode jika model mendukung — opsional, implementer tentukan berdasarkan data actual.

### 8.9 IndexExpenseScreen

**File**: `apps/cashier/lib/features/expense/presentation/screens/index_expense_screen.dart`

**Kolom tabel tablet**:

| # | Kolom | Keterangan |
|---|---|---|
| 1 | Tanggal | Tanggal pengeluaran |
| 2 | Kategori | Jenis pengeluaran |
| 3 | Jumlah | Format currency |
| 4 | Keterangan | Deskripsi singkat |
| 5 | Aksi | Lihat detail |

### 8.10 IndexPettyCashScreen

**File**: `apps/cashier/lib/features/petty_cash/presentation/screens/index_petty_cash_screen.dart`

**Kolom tabel tablet**:

| # | Kolom | Keterangan |
|---|---|---|
| 1 | Tanggal | Tanggal transaksi |
| 2 | Tipe | Masuk / Keluar |
| 3 | Jumlah | Format currency |
| 4 | Keterangan | Deskripsi singkat |
| 5 | Aksi | Lihat detail |

**Filter chips**: Tipe (Semua, Masuk, Keluar) jika model mendukung.

---

## 9. Visual Direction untuk Data Table

1. Gunakan Flutter built-in `DataTable` + `Material 3` styling — cukup untuk tampilan operasional.
2. Header kolom: `labelLarge` atau `labelMedium`, `onSurfaceVariant`.
3. Row data: `bodyMedium`, row divider tipis `outlineVariant`.
4. Row hover / selected state: `colorScheme.surfaceContainerLow` untuk highlight.
5. Row actions: `IconButton` kecil dengan `size: 20`, warna `onSurfaceVariant` default, `error` untuk hapus.
6. StatusChip pada kolom status: warna semantik sesuai status.
7. Tidak perlu zebra striping — cukup divider.
8. Tombol Tambah di toolbar: `FilledButton.icon` atau `ElevatedButton.icon`.
9. Search field di toolbar: `TextField` dengan `InputDecoration.outlined` standar dari `wash_wallet_ui`.
10. Toolbar padding: sesuai `SpacingValues` dari `wash_wallet_ui`.

---

## 10. Ringkasan File yang Diubah / Dibuat

### Shared UI (packages/wash_wallet_ui)

| File | Aksi | Tahap |
|---|---|---|
| `lib/src/components/indicators/status_chip.dart` | Create | 1 |
| `lib/src/components/layout/tablet_table_toolbar.dart` | Create | 1 |
| `lib/wash_wallet_ui.dart` | Modify — ekspor 2 widget baru | 1 |

### Cashier App — Home

| File | Aksi | Tahap |
|---|---|---|
| `features/home/presentation/widgets/cashier_dashboard_header.dart` | Create | 2 |
| `features/home/presentation/layouts/cashier_dashboard_grid.dart` | Create | 2 |
| `features/home/presentation/widgets/dashboard/shift_outlet_panel.dart` | Create | 2 |
| `features/home/presentation/widgets/dashboard/cash_summary_panel.dart` | Create | 2 |
| `features/home/presentation/widgets/dashboard/order_status_panel.dart` | Create | 2 |
| `features/home/presentation/widgets/dashboard/quick_actions_panel.dart` | Create | 2 |
| `features/home/presentation/widgets/dashboard/notification_panel.dart` | Create | 2 |
| `features/home/presentation/screens/home_screen.dart` | Modify | 2 |

### Cashier App — Index Screens

| File | Aksi | Tahap |
|---|---|---|
| `features/order/presentation/screens/index_orders_screen.dart` | Modify | 3 |
| `features/customer/presentation/screens/index_customers_screen.dart` | Modify | 3 |
| `features/category/presentation/screens/index_categories_screen.dart` | Modify | 3 |
| `features/laundry_service/presentation/screens/index_laundry_services_screen.dart` | Modify | 3 |
| `features/service_package/presentation/screens/index_service_packages_screen.dart` | Modify | 3 |
| `features/membership_plan/presentation/screens/index_membership_plan_screen.dart` | Modify | 3 |
| `features/deposit/presentation/screens/index_deposit_screen.dart` | Modify | 3 |
| `features/expense/presentation/screens/index_expense_screen.dart` | Modify | 3 |
| `features/petty_cash/presentation/screens/index_petty_cash_screen.dart` | Modify | 3 |

### Cashier App — Shell

| File | Aksi | Tahap |
|---|---|---|
| `core/navigation/main_shell_screen.dart` | Modify (minor) | 1 |
| `packages/wash_wallet_ui/lib/src/components/layout/adaptive_scaffold.dart` | Modify | 1 |

**File yang TIDAK boleh disentuh:**
- Semua BLoC / Cubit / UseCase / Repository.
- Screen create / edit / show.
- Router `app_router.dart`.
- `webapp/`, `apps/customer`, `apps/production`, `apps/courier`.

---

## 11. Tahapan Implementasi

### Tahap 1 — Shell + Shared UI Foundation
1. Perbaiki `AdaptiveScaffold`: background rail, VerticalDivider, `railLeadingWidget` param.
2. Buat `StatusChip` di shared UI.
3. Buat `TabletTableToolbar` di shared UI.
4. Ekspor keduanya di `wash_wallet_ui.dart`.
5. Update `main_shell_screen.dart` minor jika perlu.

### Tahap 2 — Home Tablet Dashboard
1. Buat `CashierDashboardHeader`.
2. Buat `CashierDashboardGrid` layout wrapper.
3. Buat 5 panel: Shift/Outlet, Cash Summary, Order Status, Quick Actions, Notification.
4. Update `home_screen.dart` dengan conditional compact vs tablet.

### Tahap 3 — Index Screens Data Table (urutan prioritas)
1. `IndexOrdersScreen` — paling penting, punya filter status existing.
2. `IndexCustomersScreen` — paling sering dipakai.
3. `IndexCategoriesScreen`.
4. `IndexLaundryServicesScreen`.
5. `IndexServicePackagesScreen`.
6. `IndexMembershipPlanScreen`.
7. `IndexDepositScreen`.
8. `IndexExpenseScreen`.
9. `IndexPettyCashScreen`.

---

## 12. Rencana Verifikasi

### flutter analyze

`ash
flutter analyze packages/wash_wallet_ui
flutter analyze apps/cashier
`

### Visual Check Manual

| Skenario | Viewport | Ekspektasi |
|---|---|---|
| Phone portrait | ~360-414 | Card list + bottom nav — tidak berubah |
| Phone landscape | ~600 | Data table ringan + navigation rail |
| Tablet portrait | ~768 | Data table + rail compact + toolbar search+filter |
| Tablet landscape | ~1024 | Data table lebar + rail + side panel order |
| Large | >= 1200 | Rail extended + data table full + max-width |

### Checklist

- [ ] Phone layout semua index screen tidak rusak.
- [ ] Tablet index screen menampilkan data table dengan kolom yang benar.
- [ ] Toolbar tablet: search berfungsi, filter chips berfungsi, tombol Tambah berfungsi.
- [ ] Row actions berfungsi: lihat detail, edit, hapus (dengan confirm dialog).
- [ ] Home tablet menampilkan dashboard grid dengan 5 panel.
- [ ] Header tablet menampilkan judul, outlet, dan action kanan.
- [ ] Order KPI cards tappable dan navigasi ke orders screen dengan filter.
- [ ] Navigation rail tidak crash di semua breakpoint.
- [ ] Tidak ada overflow di semua skenario.
- [ ] flutter analyze tidak ada error baru.

---

## 13. Catatan Implementasi

1. **Periksa model dulu** — sebelum menentukan kolom tabel, cek field yang tersedia di model domain masing-masing screen. Jika field tidak ada, skip kolom tersebut.
2. **Jangan membuat shared DataTable baru** jika Flutter `DataTable` sudah cukup — hindari over-engineering.
3. **Gunakan `LayoutBuilder` atau `AppBreakpoints.of(context)`** untuk conditional rendering, bukan `MediaQuery.of(context).size.width` hardcoded.
4. **Test phone setiap screen selesai** — conditional harus benar-benar hanya aktif di non-compact.
5. **Row action hapus** — tetap gunakan dialog confirm existing, jangan buat pola baru.
6. **Spacing dan typography** — gunakan token dari `wash_wallet_ui` (`context.space`, `context.typography`, `context.colors`).
7. **Prioritas delivery**: Shell → Home Dashboard → Orders Table → Customer Table → sisanya.
