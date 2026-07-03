# Implementation Plan: Cashier Tablet Management Index — Dashboard Style

Tanggal: 2026-06-30
Referensi User Need: `docs/user_need/cashier_tablet_management_dashboard_style_user_need.md`

---

## 1. Ringkasan

Plan ini bertujuan menyamakan semua halaman index manajemen pada Cashier App tablet dengan pola web dashboard owner — menggunakan `AppDataView`, inline `FilterPanel`, toolbar dengan filter count, batch apply filter via `onFiltersChanged`, `columnGap`, dan `rowHeight` dari density token.

Delapan halaman target:
1. Order (sudah paling dekat; penyesuaian styling dan atomic filter)
2. Layanan Laundry
3. Kategori
4. Paket Layanan
5. Membership Plan
6. Setoran Kasir
7. Petty Cash
8. Pengeluaran Outlet

---

## 2. Inventaris Current State

Berikut kondisi nyata setiap screen berdasarkan review kode:

| Halaman | AppDataView tablet | pageTitle | breadcrumbs | filterConfigs | onFiltersChanged | columnGap/rowHeight token | Masalah utama |
|---|---|---|---|---|---|---|---|
| Order | Ya | Ya | Ya | 5 filter | Ya (ada `_applyFilters`) | Belum | Masih pakai `onFilterApply` per filter, belum `onFiltersChanged`; angka rowHeight hardcode 88 |
| Layanan Laundry | Ya | Ya | Ya | 2 filter (kategori, satuan) | Belum | Belum | Filter terbatas, cell masih Text polos, apply masih per-filter |
| Kategori | Ya | Ya | Ya | Tidak ada filter | Belum | Belum | Tidak ada filter status aktif, tidak ada activeFilters |
| Paket Layanan | Ya | Ya | Ya | Tidak ada filter | Belum | Belum | Tidak ada filter, tidak ada action utama |
| Membership Plan | Ya | Ya | Ya | Tidak ada filter | Belum | Belum | Search client-side via `_filterPlans()`, tidak ada server-side search |
| Setoran Kasir | Sebagian | Tidak ada | Tidak ada | 1 filter (status) | Belum | Belum | Tidak ada page header tablet, state bersyarat di luar AppDataView |
| Petty Cash | Sebagian | Tidak ada | Tidak ada | 1 filter (status) | Belum | Belum | Tidak ada page header tablet, state bersyarat di luar AppDataView |
| Pengeluaran | Sebagian | Tidak ada | Tidak ada | 1 filter (status) | Belum | Belum | Tidak ada page header tablet, FAB hardcode `colors.warning`, state bersyarat |

---

## 3. Dependency API per Filter

Implementor wajib verifikasi dukungan API sebelum menambah filter baru.

| Halaman | Filter sudah ada di cubit/API | Filter baru yang dibutuhkan | Status |
|---|---|---|---|
| Order | `status`, `paymentStatus`, `orderDateFrom`, `orderDateTo`, `estimatedCompletionFrom`, `estimatedCompletionTo`, `totalAmountMin`, `totalAmountMax`, `search` | — | Semua sudah ada |
| Layanan Laundry | `search`, `categoryId`, `unitId` | `isActive`, `priceMin`, `priceMax` | [API DEPENDENCY] verifikasi dulu |
| Kategori | `search`, `outletId` | `isActive` | [API DEPENDENCY] verifikasi dulu |
| Paket Layanan | `search`, `outletId` | `isActive`, `priceMin`, `priceMax`, range validity | [API DEPENDENCY] verifikasi dulu |
| Membership Plan | `outletId` saja; tidak ada search server-side | `search` server-side, `isActive`, range harga | [API DEPENDENCY] cubit perlu perluasan |
| Setoran Kasir | `search`, `status`, `outletId` | `dateFrom`, `dateTo` | [API DEPENDENCY] verifikasi dulu |
| Petty Cash | `search`, `status`, (opsional `cashierId`) | `dateFrom`, `dateTo` | [API DEPENDENCY] verifikasi dulu |
| Pengeluaran | `search`, `status`, `outletId` | `dateFrom`, `dateTo`, `amountMin`, `amountMax` | [API DEPENDENCY] verifikasi dulu |

ATURAN: Jika API belum mendukung filter tertentu, jangan tambahkan filter di screen. Tandai sebagai `// [API DEPENDENCY]` di komentar kode.

---

## 4. Perubahan Shared UI (Fase 1)

Dikerjakan pertama, sebelum perubahan screen. Semua file ada di `packages/wash_wallet_ui`.

---

### 4.1 `app_density.dart` — MODIFY

Lokasi: `packages/wash_wallet_ui/lib/src/theme/density/app_density.dart`

Tambah token density baru (skip jika sudah ada dari plan sebelumnya):

```dart
/// Gap horizontal antar kolom tabel
static double tableColumnGap(AppDensityMode mode) =>
    mode == AppDensityMode.compact ? 8.0 : 12.0;

/// Tinggi row tabel untuk cell satu baris (one-line row)
static double tableOneLineRowHeight(AppDensityMode mode) =>
    mode == AppDensityMode.compact ? 52.0 : 64.0;

/// Tinggi row tabel untuk cell dua baris (two-line row)
static double tableTwoLineRowHeight(AppDensityMode mode) =>
    mode == AppDensityMode.compact ? 72.0 : 88.0;
```

---

### 4.2 `data_table_column_def.dart` — MODIFY

Lokasi: `packages/wash_wallet_ui/lib/src/components/data_view/models/data_table_column_def.dart`

Tambah `minWidth` jika belum ada:

```dart
/// Minimum width untuk kolom flex. Tidak berlaku jika [width] sudah diset.
final double? minWidth;
```

---

### 4.3 `app_data_table.dart` — MODIFY (KRITIS)

Lokasi: `packages/wash_wallet_ui/lib/src/components/data_view/app_data_table.dart`

a. Tambah `columnGap` parameter (default 0.0 untuk backward compatible):

```dart
final double columnGap;
// di constructor:
this.columnGap = 0.0,
```

b. Tambah helper `_buildCellsWithGap` dan terapkan di `_buildHeaderRow` dan `_buildRow`:

```dart
List<Widget> _buildCellsWithGap(List<Widget> cells) {
  if (widget.columnGap <= 0 || cells.isEmpty) return cells;
  final result = <Widget>[];
  for (int i = 0; i < cells.length; i++) {
    result.add(cells[i]);
    if (i < cells.length - 1) {
      result.add(SizedBox(width: widget.columnGap));
    }
  }
  return result;
}
```

c. Ganti hardcode padding horizontal 16.0 dengan token:

```dart
// SEBELUM
padding: const EdgeInsets.symmetric(horizontal: 16.0),
// SESUDAH
padding: EdgeInsets.symmetric(horizontal: context.space.md),
```

Terapkan di `_buildHeaderRow` dan `_buildRow`.

---

### 4.4 `app_data_view.dart` — MODIFY (KRITIS)

Lokasi: `packages/wash_wallet_ui/lib/src/components/data_view/app_data_view.dart`

a. Tambah dan teruskan `columnGap`:

```dart
final double columnGap;
// di constructor:
this.columnGap = 0.0,
// di build():
AppDataTable<T>(
  ...
  columnGap: columnGap,
)
```

b. Ganti hardcode padding tabel 24.0 dengan token:

```dart
// SEBELUM
padding: const EdgeInsets.all(24.0),
// SESUDAH
padding: EdgeInsets.all(context.space.lg),
```

---

### 4.5 `filter_panel.dart` — MODIFY (styling token)

Lokasi: `packages/wash_wallet_ui/lib/src/components/data_view/filter_panel.dart`

Review dan ganti semua hardcode dengan token:

1. Padding container panel: ganti hardcode dengan `context.space`.
2. Border radius: ganti hardcode dengan `context.radius`.
3. Gap antar field: ganti `SizedBox(height: X)` hardcode dengan `context.space.sm` atau `.md`.
4. Warna border/background: pastikan pakai `context.colors.*`.

Tidak mengubah behavior — hanya mengganti angka hardcode dengan token.

---

### 4.6 `index_toolbar.dart` — VERIFY / MODIFY

Lokasi: `packages/wash_wallet_ui/lib/src/components/data_view/index_toolbar.dart`

Verifikasi:

1. `onFiltersChanged` sudah ada di signature dan dipanggil sekali setelah semua filter di-apply.
2. Jalur `onApply` tidak memanggil `widget.onFilterReset?.call()` sebelum memanggil apply (sesuai plan filter status query missing fix).
3. Active filter pills punya scroll horizontal jika banyak.

Jika masalah poin 2 belum diperbaiki, perbaiki dulu mengikuti plan `cashier_tablet_order_filter_status_query_missing_fix_plan.md`.

---

## 5. Perubahan Per Screen (Fase 2)

Dikerjakan setelah Fase 1 selesai.

---

### 5.1 `index_orders_screen.dart` — MODIFY

Lokasi: `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`

Gap:
- `rowHeight: 88` hardcode.
- `columnGap` belum ada.
- `onFilterApply` masih dipanggil per filter, bukan melalui `onFiltersChanged`.

Perubahan:

```dart
AppDataView<Order>(
  ...
  columnGap: AppDensity.tableColumnGap(AppDensityMode.compact),
  rowHeight: AppDensity.tableTwoLineRowHeight(AppDensityMode.compact),
  onFiltersChanged: _applyFilters,  // atomic — method ini sudah ada di screen
  onFilterRemove: (filterId) { ... _loadData(); },
  onFilterReset: () { ... _loadData(); },
)
```

Column widths direvisi mengikuti plan overlap fix:
- No. Pesanan: 160
- Status: 156
- Total: 148
- Tanggal: 140

---

### 5.2 `index_laundry_services_screen.dart` — MODIFY

Lokasi: `apps/cashier/lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart`

Gap:
- Filter hanya kategori + satuan; belum ada status aktif dan range harga.
- Apply per filter, bukan atomic.
- Cell masih Text polos.
- Tidak ada `columnGap` dan `rowHeight` token.

Tambah method `_applyFilters`:

```dart
String? _selectedCategoryId_str;
String? _selectedUnitId_str;

void _applyFilters(List<ActiveFilter> filters) {
  int? newCategoryId;
  int? newUnitId;
  for (final f in filters) {
    switch (f.filterId) {
      case 'category':
        newCategoryId = f.value is int ? f.value : int.tryParse(f.value.toString());
      case 'unit':
        newUnitId = f.value is int ? f.value : int.tryParse(f.value.toString());
    }
  }
  setState(() {
    _selectedCategoryId = newCategoryId;
    _selectedUnitId = newUnitId;
  });
  _loadData();
}
```

AppDataView tambahan:

```dart
columnGap: AppDensity.tableColumnGap(AppDensityMode.compact),
rowHeight: AppDensity.tableOneLineRowHeight(AppDensityMode.compact),
onFiltersChanged: _applyFilters,
filterConfigs: [
  // existing: kategori, satuan
  FilterConfig(id: 'category', ...),
  FilterConfig(id: 'unit', ...),
  // [API DEPENDENCY] FilterConfig(id: 'isActive', ...),
  // [API DEPENDENCY] FilterConfig(id: 'priceRange', ...),
],
```

Column improvements — nama layanan two-line:

```dart
DataTableColumnDef<LaundryService>(
  id: 'name', header: 'Layanan', flex: 2,
  cellBuilder: (ctx, s) => Column(
    mainAxisAlignment: MainAxisAlignment.center,
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(s.name, maxLines: 1, overflow: TextOverflow.ellipsis,
          style: ctx.typography.bodyMedium.copyWith(fontWeight: FontWeight.w700)),
      Text(s.category?.name ?? '-', maxLines: 1, overflow: TextOverflow.ellipsis,
          style: ctx.typography.caption.copyWith(color: ctx.colors.textSecondary)),
    ],
  ),
),
```

---

### 5.3 `index_categories_screen.dart` — MODIFY

Lokasi: `apps/cashier/lib/features/category/presentation/screens/index_categories_screen.dart`

Gap:
- Tidak ada filterConfigs sama sekali.
- Tidak ada `columnGap` dan `rowHeight`.

Perubahan:

```dart
AppDataView<Category>(
  ...
  columnGap: AppDensity.tableColumnGap(AppDensityMode.compact),
  rowHeight: AppDensity.tableOneLineRowHeight(AppDensityMode.compact),
  filterConfigs: [
    // [API DEPENDENCY] — Tambah jika CategoryCubit.getAll menerima isActive:
    // FilterConfig(id: 'isActive', label: 'Status', type: FilterType.singleSelect,
    //   options: [
    //     FilterOption(id: 'true', label: 'Aktif', value: 'true'),
    //     FilterOption(id: 'false', label: 'Nonaktif', value: 'false'),
    //   ],
    // ),
  ],
  activeFilters: _buildActiveFilters(),
  onFiltersChanged: _applyFilters,
  onFilterRemove: (id) { ... _loadData(); },
  onFilterReset: () { ... _loadData(); },
)
```

Tambah state dan method:

```dart
String? _isActiveFilter;

List<ActiveFilter> _buildActiveFilters() => [];

void _applyFilters(List<ActiveFilter> filters) {
  setState(() { /* parse filters */ });
  _loadData();
}
```

---

### 5.4 `index_service_packages_screen.dart` — MODIFY

Lokasi: `apps/cashier/lib/features/service_package/presentation/screens/index_service_packages_screen.dart`

Gap:
- Tidak ada filter.
- Tidak ada `columnGap` dan `rowHeight`.
- Tidak ada action utama (read-only).

Perubahan:

```dart
AppDataView<ServicePackage>(
  ...
  columnGap: AppDensity.tableColumnGap(AppDensityMode.compact),
  rowHeight: AppDensity.tableOneLineRowHeight(AppDensityMode.compact),
  filterConfigs: [
    // [API DEPENDENCY] FilterConfig(id: 'isActive', ...),
    // [API DEPENDENCY] FilterConfig(id: 'priceRange', ...),
  ],
  // primaryActionLabel: null (cashier read-only)
)
```

Column nama paket two-line (nama + masa berlaku):

```dart
DataTableColumnDef<ServicePackage>(
  id: 'name', header: 'Paket', flex: 2,
  cellBuilder: (ctx, p) => Column(
    mainAxisAlignment: MainAxisAlignment.center,
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(p.name, maxLines: 1, overflow: TextOverflow.ellipsis,
          style: ctx.typography.bodyMedium.copyWith(fontWeight: FontWeight.w700)),
      Text(p.validityDays != null ? '${p.validityDays} hari' : 'Unlimited',
          style: ctx.typography.caption.copyWith(color: ctx.colors.textSecondary)),
    ],
  ),
),
```

---

### 5.5 `index_membership_plan_screen.dart` — MODIFY

Lokasi: `apps/cashier/lib/features/membership_plan/presentation/screens/index_membership_plan_screen.dart`

Gap (kritis):
- Search client-side via `_filterPlans()`.
- `getAll(outletId)` tidak menerima `search`.
- Tidak ada filter.

Perubahan (jika cubit sudah mendukung search server-side):

```dart
void _loadData() {
  context.read<MembershipPlanCubit>().getAll(
    outletId: widget.outletId,
    search: _searchController.text.isEmpty ? null : _searchController.text,
  );
}

// Hapus _filterPlans() — gunakan rows langsung dari state
rows: state is MembershipPlansLoaded ? state.plans : [],
```

CATATAN PENTING: Jika `MembershipPlanCubit.getAll` belum menerima `search`, implementor harus terlebih dahulu menambahkan parameter ini ke cubit dan memastikan API server mendukung. Jangan gunakan client-side filter. Jika belum siap, tandai `// [API DEPENDENCY]` dan biarkan `_filterPlans()` sementara.

Selalu tambahkan:

```dart
columnGap: AppDensity.tableColumnGap(AppDensityMode.compact),
rowHeight: AppDensity.tableOneLineRowHeight(AppDensityMode.compact),
```

---

### 5.6 `index_deposit_screen.dart` — MODIFY (KRITIS)

Lokasi: `apps/cashier/lib/features/deposit/presentation/screens/index_deposit_screen.dart`

Gap:
- Tidak ada `pageTitle` dan `breadcrumbs`.
- State bersyarat di luar AppDataView (loading/error di-handle manual sebelum AppDataView di-render).
- Filter hanya status, belum ada tanggal.
- Column semua flex tanpa width.

Perubahan — refactor `_buildTabletTable`:

```dart
Widget _buildTabletTable(BuildContext context, DepositState state) {
  return AppDataView<Deposit>(
    breadcrumbs: const [
      BreadcrumbItem(label: 'Home'),
      BreadcrumbItem(label: 'Keuangan'),
      BreadcrumbItem(label: 'Setoran Kasir'),
    ],
    pageTitle: 'Setoran Kasir',
    searchController: _searchController,
    searchHint: 'Cari referensi...',
    onSearch: _loadData,
    onSearchClear: () { _searchController.clear(); _loadData(); },
    rows: state is DepositsLoaded ? state.deposits : [],
    isLoading: state is DepositLoading,
    errorMessage: state is DepositFailure ? state.failure.message : null,
    columnGap: AppDensity.tableColumnGap(AppDensityMode.compact),
    rowHeight: AppDensity.tableTwoLineRowHeight(AppDensityMode.compact),
    primaryActionLabel: 'Buat Setoran',
    primaryActionIcon: Icons.add_rounded,
    onPrimaryAction: _navigateToCreateScreen,
    filterConfigs: const [
      FilterConfig(id: 'status', label: 'Status', type: FilterType.singleSelect, options: [
        FilterOption(id: 'pending', label: 'Menunggu', value: 'pending'),
        FilterOption(id: 'approved', label: 'Disetujui', value: 'approved'),
        FilterOption(id: 'rejected', label: 'Ditolak', value: 'rejected'),
      ]),
      // [API DEPENDENCY] FilterConfig(id: 'dateRange', label: 'Tanggal', type: FilterType.dateRange),
    ],
    activeFilters: _buildActiveFilters(),
    onFiltersChanged: _applyFilters,
    onFilterRemove: (id) { _resetFilter(id); _loadData(); },
    onFilterReset: () { _resetAllFilters(); _loadData(); },
    columns: _buildTabletColumnDefs(context),
    rowActions: [
      DataTableRowAction<Deposit>(
        icon: Icons.visibility_outlined,
        tooltip: 'Lihat Detail',
        onTap: _handleShow,
      ),
    ],
    emptyMessage: 'Belum ada data setoran kasir',
  );
}
```

Tambah state variables dan methods:

```dart
String? _selectedStatus;
// [API DEPENDENCY] String? _dateFrom;
// [API DEPENDENCY] String? _dateTo;

List<ActiveFilter> _buildActiveFilters() {
  final filters = <ActiveFilter>[];
  if (_selectedStatus != null) {
    filters.add(ActiveFilter(
      filterId: 'status',
      filterLabel: 'Status',
      valueLabel: _statusLabel(_selectedStatus!),
      value: _selectedStatus!,
    ));
  }
  return filters;
}

void _applyFilters(List<ActiveFilter> filters) {
  String? newStatus;
  for (final f in filters) {
    if (f.filterId == 'status') newStatus = f.value as String?;
  }
  setState(() { _selectedStatus = newStatus; });
  _loadData();
}

void _resetFilter(String filterId) {
  setState(() {
    if (filterId == 'status') _selectedStatus = null;
  });
}

void _resetAllFilters() {
  setState(() { _selectedStatus = null; });
}

String _statusLabel(String status) {
  switch (status) {
    case 'pending': return 'Menunggu';
    case 'approved': return 'Disetujui';
    case 'rejected': return 'Ditolak';
    default: return status;
  }
}
```

Column dengan width proporsional:

```dart
List<DataTableColumnDef<Deposit>> _buildTabletColumnDefs(BuildContext ctx) {
  return [
    DataTableColumnDef<Deposit>(
      id: 'code', header: 'No Referensi', width: 160,
      cellBuilder: (context, item) => Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(item.code, maxLines: 1, overflow: TextOverflow.ellipsis,
              style: context.typography.labelSmall.copyWith(fontWeight: FontWeight.w800, color: context.colors.primary)),
          Text(item.cashierName ?? '-', maxLines: 1, overflow: TextOverflow.ellipsis,
              style: context.typography.caption.copyWith(color: context.colors.textSecondary)),
        ],
      ),
    ),
    DataTableColumnDef<Deposit>(id: 'amount', header: 'Total', width: 148,
      cellBuilder: (context, item) => Text(item.formattedAmount ?? '-')),
    DataTableColumnDef<Deposit>(id: 'date', header: 'Tanggal', width: 140,
      cellBuilder: (context, item) => Text(item.createdAtFormatted ?? item.createdAtHuman ?? '-')),
    DataTableColumnDef<Deposit>(id: 'status', header: 'Status', width: 120,
      cellBuilder: (context, item) => StatusChip(
        label: item.statusLabel,
        color: _getStatusColor(context, item.status.toLowerCase()),
      )),
  ];
}
```

---

### 5.7 `index_petty_cash_screen.dart` — MODIFY (KRITIS)

Lokasi: `apps/cashier/lib/features/petty_cash/presentation/screens/index_petty_cash_screen.dart`

Gap: Identik dengan deposit — tidak ada pageTitle/breadcrumbs, state bersyarat, filter hanya status.

Perubahan: Sama dengan 5.6, adaptasi untuk domain PettyCash:

```dart
AppDataView<PettyCash>(
  breadcrumbs: const [
    BreadcrumbItem(label: 'Home'),
    BreadcrumbItem(label: 'Keuangan'),
    BreadcrumbItem(label: 'Kas Kecil'),
  ],
  pageTitle: 'Kas Kecil',
  ...
)
```

Column proporsional sama dengan deposit (No Referensi 160, Pegawai flex, Total 148, Tanggal 140, Status 120).

Catatan: `IndexPettyCashScreen` bisa dipanggil dengan `cashierId` optional. Logika `_loadData` tetap mempertahankan bifurcasi `loadPettyCashesByCashierId` vs `getAll`.

---

### 5.8 `index_expense_screen.dart` — MODIFY (KRITIS)

Lokasi: `apps/cashier/lib/features/expense/presentation/screens/index_expense_screen.dart`

Gap: Identik dengan deposit + petty cash, plus FAB mobile menggunakan `context.colors.warning` (inconsisten).

Perbaikan FAB mobile:

```dart
// SEBELUM
floatingActionButton: isCompact ? FloatingActionButton.extended(
  backgroundColor: context.colors.warning,  // inconsisten
  ...

// SESUDAH
floatingActionButton: isCompact ? FloatingActionButton.extended(
  backgroundColor: context.colors.primary,  // konsisten dengan halaman lain
  ...
```

AppDataView tablet:

```dart
AppDataView<Expense>(
  breadcrumbs: const [
    BreadcrumbItem(label: 'Home'),
    BreadcrumbItem(label: 'Keuangan'),
    BreadcrumbItem(label: 'Pengeluaran'),
  ],
  pageTitle: 'Pengeluaran Outlet',
  columnGap: AppDensity.tableColumnGap(AppDensityMode.compact),
  rowHeight: AppDensity.tableTwoLineRowHeight(AppDensityMode.compact),
  filterConfigs: const [
    FilterConfig(id: 'status', label: 'Status', type: FilterType.singleSelect, ...),
    // [API DEPENDENCY] FilterConfig(id: 'dateRange', label: 'Tanggal', type: FilterType.dateRange),
    // [API DEPENDENCY] FilterConfig(id: 'amountRange', label: 'Nominal', type: FilterType.numberRange),
  ],
  onFiltersChanged: _applyFilters,
  ...
)
```

Column deskripsi two-line:

```dart
DataTableColumnDef<Expense>(
  id: 'code', header: 'No Referensi', width: 160,
  cellBuilder: (context, item) => Column(
    mainAxisAlignment: MainAxisAlignment.center,
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(item.code, maxLines: 1, overflow: TextOverflow.ellipsis,
          style: context.typography.labelSmall.copyWith(fontWeight: FontWeight.w800, color: context.colors.primary)),
      Text(item.description ?? '-', maxLines: 1, overflow: TextOverflow.ellipsis,
          style: context.typography.caption.copyWith(color: context.colors.textSecondary)),
    ],
  ),
),
DataTableColumnDef<Expense>(id: 'category', header: 'Akun', flex: 1,
  cellBuilder: (context, item) => Text(item.expenseAccountName ?? '-')),
DataTableColumnDef<Expense>(id: 'amount', header: 'Total', width: 148, ...),
DataTableColumnDef<Expense>(id: 'date', header: 'Tanggal', width: 140, ...),
DataTableColumnDef<Expense>(id: 'status', header: 'Status', width: 120, ...),
```

---

## 6. Urutan Pengerjaan

### Fase 1 — Shared UI (harus selesai sebelum screen)

1. `app_density.dart` — tambah token yang belum ada.
2. `data_table_column_def.dart` — tambah `minWidth` jika belum ada.
3. `app_data_table.dart` — tambah `columnGap`, ganti hardcode padding dengan token.
4. `app_data_view.dart` — teruskan `columnGap`, ganti hardcode padding.
5. `filter_panel.dart` — ganti hardcode spacing/color dengan token.
6. `index_toolbar.dart` — verifikasi atomic apply dan tidak ada `onFilterReset` di jalur apply.

### Fase 2 — Screen (urutan berdasarkan gap terbesar dulu)

7. `index_deposit_screen.dart` — tambah pageTitle/breadcrumbs, refactor state, columns, onFiltersChanged.
8. `index_petty_cash_screen.dart` — sama dengan deposit.
9. `index_expense_screen.dart` — sama dengan deposit + perbaiki FAB color.
10. `index_orders_screen.dart` — ganti rowHeight/columnGap ke token, hubungkan ke onFiltersChanged.
11. `index_laundry_services_screen.dart` — refactor ke atomic apply, column two-line, token density.
12. `index_categories_screen.dart` — tambah infrastructure filter, token density.
13. `index_service_packages_screen.dart` — tambah columnGap/rowHeight, column two-line.
14. `index_membership_plan_screen.dart` — hilangkan client-side search jika cubit siap, token density.

---

## 7. Acceptance Criteria

### Shared UI

- [ ] `AppDataTable` menerima `columnGap` dengan default `0.0` (backward compatible).
- [ ] `AppDataTable` tidak ada hardcode `16.0` padding — memakai `context.space.md`.
- [ ] `AppDensity` punya token `tableColumnGap`, `tableOneLineRowHeight`, `tableTwoLineRowHeight`.
- [ ] `AppDataView` meneruskan `columnGap` ke `AppDataTable`.
- [ ] `FilterPanel` tidak ada hardcode padding/radius/color per komponen.
- [ ] `IndexToolbar` apply filter tidak memanggil `onFilterReset` sebelum apply.

### Per Screen

- [ ] Order: `rowHeight` dan `columnGap` pakai token density. Filter apply atomic via `onFiltersChanged`.
- [ ] Layanan Laundry: Filter apply atomic. Column nama two-line. Token density.
- [ ] Kategori: Infrastructure filter siap. Token density. Filter status aktif ada jika API mendukung.
- [ ] Paket Layanan: Tidak ada action utama (read-only). Token density. Column nama two-line.
- [ ] Membership Plan: Search menggunakan server-side jika cubit mendukung. `_filterPlans()` client-side dihapus.
- [ ] Setoran Kasir: Ada `pageTitle: 'Setoran Kasir'` dan breadcrumbs. State tidak bersyarat di luar AppDataView. Column proporsional.
- [ ] Petty Cash: Ada `pageTitle: 'Kas Kecil'` dan breadcrumbs. Layout sama dengan setoran.
- [ ] Pengeluaran: Ada `pageTitle: 'Pengeluaran Outlet'` dan breadcrumbs. FAB mobile pakai `context.colors.primary`.
- [ ] Semua tablet screen memiliki `pageTitle`, `breadcrumbs`, `searchController`, dan `primaryActionLabel` yang sesuai.
- [ ] Tidak ada `const TextStyle(fontWeight: FontWeight.bold)` hardcode — pakai typography token.
- [ ] Semua halaman target aman dari overflow di tablet portrait 768px dan landscape.
- [ ] Mobile layout tidak berubah/rusak.
- [ ] Halaman lain yang memakai `AppDataView` tidak terpengaruh perubahan shared UI.

---

## 8. Catatan API Dependency

Filter berikut tidak boleh diimplementasikan sebelum backend mendukung:

| Halaman | Filter | Label di kode |
|---|---|---|
| Layanan Laundry | `isActive`, `priceMin`, `priceMax` | `// [API DEPENDENCY]` |
| Kategori | `isActive` | `// [API DEPENDENCY]` |
| Paket Layanan | `isActive`, `priceMin`, `priceMax`, range validity | `// [API DEPENDENCY]` |
| Membership Plan | `search` server-side, `isActive`, range harga | `// [API DEPENDENCY]` |
| Setoran Kasir | `dateFrom`, `dateTo` | `// [API DEPENDENCY]` |
| Petty Cash | `dateFrom`, `dateTo` | `// [API DEPENDENCY]` |
| Pengeluaran | `dateFrom`, `dateTo`, `amountMin`, `amountMax` | `// [API DEPENDENCY]` |

---

## 9. File Summary

| File | Aksi | Paket | Prioritas |
|---|---|---|---|
| `app_density.dart` | MODIFY — tambah token row height | `wash_wallet_ui` | KRITIS |
| `app_data_table.dart` | MODIFY — columnGap, token padding | `wash_wallet_ui` | KRITIS |
| `app_data_view.dart` | MODIFY — teruskan columnGap, token padding | `wash_wallet_ui` | KRITIS |
| `index_toolbar.dart` | VERIFY/MODIFY — atomic apply fix | `wash_wallet_ui` | KRITIS |
| `filter_panel.dart` | MODIFY — ganti hardcode dengan token | `wash_wallet_ui` | Penting |
| `data_table_column_def.dart` | MODIFY — tambah minWidth | `wash_wallet_ui` | Opsional |
| `index_deposit_screen.dart` | MODIFY — pageTitle, breadcrumbs, state refactor, columns, onFiltersChanged | `cashier` | KRITIS |
| `index_petty_cash_screen.dart` | MODIFY — pageTitle, breadcrumbs, state refactor, columns, onFiltersChanged | `cashier` | KRITIS |
| `index_expense_screen.dart` | MODIFY — pageTitle, breadcrumbs, state refactor, FAB color fix, columns, onFiltersChanged | `cashier` | KRITIS |
| `index_orders_screen.dart` | MODIFY — token density, onFiltersChanged atomic, column widths | `cashier` | KRITIS |
| `index_laundry_services_screen.dart` | MODIFY — atomic apply, column improvement, token density | `cashier` | Penting |
| `index_categories_screen.dart` | MODIFY — filter infrastructure, token density | `cashier` | Penting |
| `index_service_packages_screen.dart` | MODIFY — token density, column two-line | `cashier` | Penting |
| `index_membership_plan_screen.dart` | MODIFY — server-side search jika siap, token density | `cashier` | Penting |
