# Plan: Shared Tablet Management Layout Widgets
## `packages/wash_wallet_ui`

**Tanggal:** 2026-06-28  
**Referensi User Need:** `docs/user_need/cashier_production_tablet_management_layout_user_need.md`  
**Target Eksekutor:** AI model lain (bukan yang menyusun plan ini)  
**Scope:** Hanya `packages/wash_wallet_ui` — **belum** menyentuh `apps/cashier` atau `apps/production`

---

## Ringkasan

Plan ini mendefinisikan semua widget, model, dan config baru yang harus dibuat di `packages/wash_wallet_ui` sebagai fondasi shared untuk tablet management layout. Setelah widget ini selesai, AI model terpisah akan melanjutkan integrasi ke Cashier App dan Production App.

Widget yang akan dibuat:

1. **`OperationalTabletShell`** — layout shell pasca-login untuk tablet
2. **`OperationalSidebar`** — sidebar fixed/collapsible tablet dengan branding, grouped menu, dan account footer
3. **`OperationalTopHeader`** — top header dengan search global, waktu/tanggal, notifikasi, profile mini
4. **`PageContentHeader`** — breadcrumb + title + subtitle + action area per screen
5. **`IndexToolbar`** — toolbar search, filter button, active filter pills, reset, primary CTA
6. **`AppDataTable`** — data table reusable dengan empty/loading/error state
7. **`AppDataView`** — komposisi toolbar + table (DataView lengkap)

Serta model dan config pendukung:

- `SidebarMenuSection`, `SidebarMenuItem`
- `SidebarUserAccount`
- `BreadcrumbItem`
- `DataTableColumnDef<T>`, `DataTableAction<T>`, `DataTableRowAction<T>`
- `FilterConfig`, `FilterOption`, `ActiveFilter`
- Peningkatan `StatusChip`
- Peningkatan `TabletTableToolbar`

---

## Konteks Codebase yang Ada

### Yang sudah tersedia di `packages/wash_wallet_ui`

| Komponen | File | Keterangan |
|---|---|---|
| `AdaptiveScaffold` | `components/layout/adaptive_scaffold.dart` | Compact → BottomBar, Medium/Large → NavigationRail. Belum ada sidebar custom, top header, atau page header |
| `AppDrawer` | `components/drawer/app_drawer.dart` | Drawer mobile, pakai `Drawer` Flutter standar, tidak cocok sebagai sidebar fixed tablet |
| `TabletTableToolbar` | `components/layout/tablet_table_toolbar.dart` | Sudah ada search + filter chips + primary action, tapi belum ada filter panel generik, active filter pills terpisah, sticky behavior, atau reset/apply pattern |
| `StatusChip` | `components/indicators/status_chip.dart` | Chip warna semantik, perlu ditambah variant/size agar cocok untuk tabel |
| `AppBreakpoints` | `theme/responsive/app_breakpoints.dart` | `compact < 600`, `medium < 840`, `expanded < 1200`, `large >= 1200` |
| `AppDensity` | `theme/density/app_density.dart` | `compact` mode untuk cashier/production |
| Theme extensions | `theme/extensions/theme_context_extension.dart` | `context.colors`, `context.typography`, `context.space`, `context.radius` |

### Yang belum ada dan perlu dibuat

- Sidebar fixed (bukan Drawer Flutter) dengan collapsed/expanded state
- Top header horizontal untuk tablet
- PageContentHeader (breadcrumb, title, subtitle, actions)
- Filter panel generik + active filter pills
- `AppDataTable` reusable dengan kolom konfigurasi, state kosong/loading/error, row actions
- `AppDataView` komposisi toolbar + data table
- `OperationalTabletShell` yang menggabungkan sidebar + header + content area

---

## Struktur File yang Akan Dibuat

Semua file baru berada di dalam `packages/wash_wallet_ui/lib/src/`.

```
packages/wash_wallet_ui/lib/src/
│
├── components/
│   ├── layout/
│   │   ├── operational_tablet_shell/
│   │   │   ├── operational_tablet_shell.dart          [NEW]
│   │   │   └── operational_shell_config.dart          [NEW]
│   │   │
│   │   ├── operational_sidebar/
│   │   │   ├── operational_sidebar.dart               [NEW]
│   │   │   ├── operational_sidebar_item.dart          [NEW]
│   │   │   ├── operational_sidebar_section.dart       [NEW]
│   │   │   ├── operational_sidebar_header.dart        [NEW]
│   │   │   ├── operational_sidebar_footer.dart        [NEW]
│   │   │   └── models/
│   │   │       ├── sidebar_menu_section.dart          [NEW]
│   │   │       ├── sidebar_menu_item.dart             [NEW]
│   │   │       └── sidebar_user_account.dart          [NEW]
│   │   │
│   │   ├── operational_top_header/
│   │   │   ├── operational_top_header.dart            [NEW]
│   │   │   └── models/
│   │   │       └── top_header_action.dart             [NEW]
│   │   │
│   │   ├── page_content_header/
│   │   │   ├── page_content_header.dart               [NEW]
│   │   │   └── models/
│   │   │       └── breadcrumb_item.dart               [NEW]
│   │   │
│   │   └── tablet_table_toolbar.dart                  [MODIFY — backward-compatible upgrade]
│   │
│   ├── data_view/                                     [NEW DIRECTORY]
│   │   ├── app_data_table.dart                        [NEW]
│   │   ├── app_data_view.dart                         [NEW]
│   │   ├── index_toolbar.dart                         [NEW]
│   │   └── models/
│   │       ├── data_table_column_def.dart             [NEW]
│   │       ├── data_table_action.dart                 [NEW]
│   │       ├── filter_config.dart                     [NEW]
│   │       ├── filter_option.dart                     [NEW]
│   │       └── active_filter.dart                     [NEW]
│   │
│   └── indicators/
│       └── status_chip.dart                           [MODIFY — tambah size/variant]
│
└── (wash_wallet_ui.dart — MODIFY: export semua file baru)
```

---

## Detail Implementasi Per Komponen

---

### 1. Models Sidebar — `operational_sidebar/models/`

#### `sidebar_menu_item.dart`

```dart
class SidebarMenuItem {
  final String id;           // unique string id, misal 'orders', 'customers'
  final String label;
  final IconData icon;
  final IconData? selectedIcon;
  final String? route;
  final bool Function()? isVisible;   // permission-aware, nullable = selalu visible
  final VoidCallback? onTap;          // override route navigation bila perlu
  final int? badgeCount;
}
```

**Catatan:**
- `isVisible` adalah callback agar app-specific logic (permission check) bisa diinjeksikan tanpa sidebar tahu domain bisnis.
- Shared UI tidak boleh import provider/bloc Cashier atau Production.

#### `sidebar_menu_section.dart`

```dart
class SidebarMenuSection {
  final String? title;                // null = section tanpa header
  final List<SidebarMenuItem> items;
  final bool collapsible;            // accordion behavior
  final bool initiallyExpanded;
}
```

#### `sidebar_user_account.dart`

```dart
class SidebarUserAccount {
  final String name;
  final String? subtitle;            // email, username, atau role label
  final String? avatarUrl;
  final Widget? avatarWidget;        // fallback bila url null
  final List<SidebarUserAction> actions;  // profile, logout, switch employee
}

class SidebarUserAction {
  final String label;
  final IconData icon;
  final VoidCallback onTap;
}
```

---

### 2. `OperationalSidebar`

**File:** `components/layout/operational_sidebar/operational_sidebar.dart`

**Contract:**

```dart
class OperationalSidebar extends StatefulWidget {
  final String appName;                      // contoh: 'WashWallet'
  final String? appRoleLabel;                // contoh: 'Kasir App / Management System'
  final Widget? logoWidget;                  // Widget logo/icon aplikasi
  final List<SidebarMenuSection> sections;
  final String? currentRouteId;              // cocokkan dengan SidebarMenuItem.id
  final ValueChanged<SidebarMenuItem>? onItemTap;
  final SidebarUserAccount? userAccount;
  final bool collapsed;                      // dikontrol parent (shell)
  final ValueChanged<bool>? onCollapsedChanged;
  final double expandedWidth;               // default 268.0
  final double collapsedWidth;              // default 80.0
}
```

**Visual:**
- Background: warna `context.colors.surface` (dark navy bila dark mode)
- Header: logo + appName + roleLabel
- Navigation items: icon + label, selected state pakai `context.colors.primary` dengan highlight background
- Collapsed mode: hanya icon, dengan `Tooltip` wajib
- Section title sebagai label kecil muted di atas group item
- Collapsible section: `ExpansionTile` atau custom accordion
- Footer: `SidebarUserAccount` — avatar + nama + subtitle + action menu (popup atau bottom sheet mini)
- Toggle button (chevron/arrow) di bagian bawah header atau di tepi sidebar

**Behavior:**
- Gunakan `AnimatedContainer` untuk animasi width collapsed/expanded
- Pada collapsed, label item tersembunyi, tooltip wajib
- `isVisible` callback pada `SidebarMenuItem` dipanggil saat build untuk menentukan apakah item dirender
- Footer selalu tampil, di collapsed mode hanya avatar
- Sidebar tidak pakai Flutter `Drawer`, dia `Widget` biasa di dalam `Row`

---

### 3. `OperationalTopHeader`

**File:** `components/layout/operational_top_header/operational_top_header.dart`

**Contract:**

```dart
class OperationalTopHeader extends StatelessWidget {
  final String? searchHint;
  final ValueChanged<String>? onSearchSubmitted;
  final ValueChanged<String>? onSearchChanged;
  final VoidCallback? onSearchClear;
  final bool showSearch;
  final bool showClock;
  final bool showDate;
  final bool showNotification;
  final int notificationCount;
  final VoidCallback? onNotificationTap;
  final bool showThemeToggle;
  final VoidCallback? onThemeToggle;
  final String? userName;
  final String? userSubtitle;         // outlet, role
  final String? userAvatarUrl;
  final Widget? userAvatarWidget;
  final VoidCallback? onProfileTap;
  final List<TopHeaderAction>? extraActions;
  final double height;                // default 64.0
}
```

**Model `TopHeaderAction`:**

```dart
class TopHeaderAction {
  final IconData icon;
  final String? tooltip;
  final VoidCallback onTap;
  final Widget? badge;
}
```

**Visual:**
- Background: `context.colors.surface` atau sedikit elevated dari shell background
- Height: 64 dp (stabil, tidak overflow)
- Layout Row: `[Search Flex] [Clock/Date] [Notifications] [ThemeToggle] [Profile Mini]`
- Search: `TextField` dengan prefixIcon search, clear button, outline border tipis, max width terbatas (`flex: 3`)
- Clock: text jam real-time (gunakan `Stream` periodic atau `Timer` setiap detik), format `HH:mm`
- Date: text tanggal format `dd MMM yyyy`, misal `28 Jun 2026`
- Notification: `IconButton` dengan `Badge` count overlay
- Profile mini: avatar (CircleAvatar, 32 dp) + nama (tersembunyi pada medium width)
- Pada `WindowSizeClass.medium`: profile text tersembunyi, hanya avatar

**Behavior:**
- Header harus `PreferredSizeWidget` atau wrapper dengan tinggi fixed agar tidak override oleh content
- Real-time clock: gunakan `StatefulWidget` + `Timer.periodic(Duration(seconds: 1), ...)` + `setState`
- Clear button search muncul bila ada text

---

### 4. `PageContentHeader`

**File:** `components/layout/page_content_header/page_content_header.dart`

**Contract:**

```dart
class PageContentHeader extends StatelessWidget {
  final List<BreadcrumbItem> breadcrumbs;   // contoh: [Home, Layanan Laundry]
  final String title;
  final String? subtitle;
  final List<Widget>? statusBadges;         // optional StatusChip/badge
  final List<Widget>? actions;             // optional buttons kanan
  final EdgeInsetsGeometry? padding;
}
```

**Model `BreadcrumbItem`:**

```dart
class BreadcrumbItem {
  final String label;
  final VoidCallback? onTap;   // null = item ini tidak clickable (current page)
}
```

**Visual:**
- Breadcrumb: Row dengan separator `>` (chevron), item tappable berwarna muted, current item bold/primary
- Title: `context.typography.headlineSmall` atau `titleLarge`, bold
- Subtitle: `context.typography.bodyMedium`, muted color, max 2 baris
- Actions: aligned kanan, Row dengan gap
- Tidak terlalu besar (bukan hero), padding sedang sekitar 16-24 dp

---

### 5. Model Data Table — `data_view/models/`

#### `data_table_column_def.dart`

```dart
typedef CellBuilder<T> = Widget Function(BuildContext context, T row);
typedef SortExtractor<T> = Comparable? Function(T row);

class DataTableColumnDef<T> {
  final String id;
  final String header;
  final double? width;            // fixed width, null = flex
  final int flex;                 // default 1
  final CellBuilder<T> cellBuilder;
  final bool sortable;
  final SortExtractor<T>? sortExtractor;
  final TextAlign headerAlign;
  final TextAlign cellAlign;
}
```

#### `data_table_action.dart`

```dart
// Row action button (View, Edit, Delete, dll)
class DataTableRowAction<T> {
  final IconData icon;
  final String tooltip;
  final Color? color;
  final bool Function(T row)? isVisible;    // null = selalu tampil
  final bool Function(T row)? isEnabled;   // null = selalu enabled
  final void Function(T row) onTap;
}
```

#### `filter_config.dart`, `filter_option.dart`, `active_filter.dart`

```dart
enum FilterType { singleSelect, multiSelect, dateRange, numberRange, textInput }

class FilterConfig {
  final String id;
  final String label;
  final FilterType type;
  final List<FilterOption> options;    // untuk singleSelect / multiSelect
  final bool optional;                 // true = tandai sebagai 'coming soon' / tidak dipaksakan
}

class FilterOption {
  final String id;
  final String label;
  final dynamic value;
}

// Representasi filter yang sedang aktif
class ActiveFilter {
  final String filterId;
  final String filterLabel;
  final String valueLabel;
  final dynamic value;
}
```

---

### 6. `IndexToolbar`

**File:** `data_view/index_toolbar.dart`

**Contract:**

```dart
class IndexToolbar extends StatelessWidget {
  final TextEditingController? searchController;
  final String? searchHint;
  final VoidCallback? onSearch;
  final VoidCallback? onSearchClear;

  final List<FilterConfig> filterConfigs;
  final List<ActiveFilter> activeFilters;
  final void Function(ActiveFilter filter)? onFilterApply;
  final void Function(String filterId)? onFilterRemove;
  final VoidCallback? onFilterReset;

  final String? primaryActionLabel;
  final IconData? primaryActionIcon;
  final VoidCallback? onPrimaryAction;

  final List<Widget>? secondaryActions;
  final bool sticky;                    // default true
}
```

**Visual:**
- Row utama: `[Search] [FilterButton] [ActiveFilterPills (scrollable)] [Spacer] [SecondaryActions] [PrimaryAction]`
- Search: `TextField` dengan prefixIcon, clear button, rounded border
- Filter button: `OutlinedButton.icon` dengan icon `tune_rounded`, label `Filter`, dan count badge bila ada active filter
- Active filter pills: horizontal scroll `Wrap` atau `SingleChildScrollView` dengan `FilterChip` per `ActiveFilter`, masing-masing punya delete button
- Reset button: hanya muncul bila `activeFilters.isNotEmpty`, warna muted
- Primary action: `FilledButton.icon` dengan warna `context.colors.primary` (green)
- Sticky: bila `sticky: true`, toolbar dibungkus dengan elevated container agar tidak hilang di scroll

**Filter Panel (Bottom Sheet atau Popover):**
- Buka dari Filter button => `showModalBottomSheet` atau custom popover
- Setiap `FilterConfig` dirender sesuai `FilterType`
- `singleSelect` / `multiSelect` => list chip selection
- `dateRange` => date range picker
- `numberRange` => range slider atau 2 text field
- `textInput` => text field tambahan
- Tombol Apply dan Reset di dalam panel
- Item `optional: true` boleh ditandai `(Coming Soon)` atau tidak ditampilkan

---

### 7. `AppDataTable<T>`

**File:** `data_view/app_data_table.dart`

**Contract:**

```dart
class AppDataTable<T> extends StatefulWidget {
  final List<DataTableColumnDef<T>> columns;
  final List<T> rows;
  final bool isLoading;
  final String? errorMessage;
  final String emptyMessage;
  final Widget? emptyIcon;
  final List<DataTableRowAction<T>>? rowActions;
  final bool selectable;
  final Set<T>? selectedRows;
  final void Function(Set<T>)? onSelectionChanged;
  final double rowHeight;              // default 56.0
  final bool stickyHeader;
  final AppDensityMode densityMode;   // default AppDensityMode.compact
  final void Function(DataTableColumnDef<T> column, bool ascending)? onSort;
  final String? sortColumnId;
  final bool sortAscending;

  // Optional pagination
  final int? totalCount;
  final int? currentPage;
  final int? pageSize;
  final void Function(int page)? onPageChanged;

  // Optional row tap
  final void Function(T row)? onRowTap;
  final bool Function(T row)? isRowHighlighted;
}
```

**Visual:**
- Header row: background `context.colors.surfaceVariant` atau sedikit lebih gelap dari row
- Header cell: `context.typography.labelMedium`, bold, muted color, dengan sort icon bila `sortable`
- Row: height minimal `rowHeight` (default 56 dp)
- Row hover/pressed: subtle highlight
- Action buttons di kolom terakhir: icon buttons 44 dp, tooltip wajib, warna semantik:
  - View: biru info
  - Edit: kuning/orange
  - Delete: merah
- Border table: divider tipis `context.colors.outline` atau `Divider` Flutter
- Loading state: `LinearProgressIndicator` di atas table + shimmer/skeleton rows
- Empty state: `AppEmptyState` yang sudah ada, dengan pesan custom
- Error state: `AppErrorState` yang sudah ada, dengan pesan custom

**Overflow prevention:**
- Table scroll horizontal via `SingleChildScrollView(scrollDirection: Axis.horizontal)` bungkus seluruh table bila kolom banyak
- Setiap cell harus clamp overflow: `overflow: TextOverflow.ellipsis`, max lines terkontrol
- Action buttons tidak boleh wrap ke baris baru — letakkan di kolom fixed-width

**Pagination:**
- Bila `totalCount != null`, tampilkan footer pagination: `[Previous] [Page X / Y] [Next]` atau page number chips
- Default page size 15 atau 25

---

### 8. `AppDataView<T>`

**File:** `data_view/app_data_view.dart`

Ini adalah komposisi dari `IndexToolbar` + `PageContentHeader` (optional) + `AppDataTable<T>`. Widget "all-in-one" yang mudah dipakai oleh screen.

**Contract:**

```dart
class AppDataView<T> extends StatelessWidget {
  // Page header (optional)
  final List<BreadcrumbItem>? breadcrumbs;
  final String? pageTitle;
  final String? pageSubtitle;
  final List<Widget>? pageActions;

  // Toolbar
  final TextEditingController? searchController;
  final String? searchHint;
  final VoidCallback? onSearch;
  final VoidCallback? onSearchClear;
  final List<FilterConfig> filterConfigs;
  final List<ActiveFilter> activeFilters;
  final void Function(ActiveFilter)? onFilterApply;
  final void Function(String filterId)? onFilterRemove;
  final VoidCallback? onFilterReset;
  final String? primaryActionLabel;
  final IconData? primaryActionIcon;
  final VoidCallback? onPrimaryAction;

  // Table
  final List<DataTableColumnDef<T>> columns;
  final List<T> rows;
  final bool isLoading;
  final String? errorMessage;
  final String emptyMessage;
  final List<DataTableRowAction<T>>? rowActions;
  final void Function(T row)? onRowTap;

  // Pagination
  final int? totalCount;
  final int? currentPage;
  final int? pageSize;
  final void Function(int page)? onPageChanged;
}
```

**Layout:**

```
Column(
  children: [
    if (breadcrumbs != null || pageTitle != null)
      PageContentHeader(...),
    IndexToolbar(...),           // sticky: true
    Expanded(
      child: AppDataTable<T>(...),
    ),
  ],
)
```

---

### 9. `OperationalTabletShell`

**File:** `components/layout/operational_tablet_shell/operational_tablet_shell.dart`

**Contract:**

```dart
class OperationalTabletShell extends StatefulWidget {
  // Branding & Config
  final String appName;
  final String? appRoleLabel;
  final Widget? logoWidget;

  // Navigation
  final List<SidebarMenuSection> menuSections;
  final String? currentRouteId;
  final ValueChanged<SidebarMenuItem>? onMenuItemTap;

  // Top Header
  final String? searchHint;
  final ValueChanged<String>? onSearchSubmitted;
  final bool showClock;
  final bool showNotification;
  final int notificationCount;
  final VoidCallback? onNotificationTap;
  final bool showThemeToggle;
  final VoidCallback? onThemeToggle;

  // User
  final SidebarUserAccount? userAccount;

  // Content
  final Widget body;

  // Secondary panel (two-pane, optional)
  final Widget? secondaryBody;
  final double secondaryBodyWidth;
  final bool showSecondaryBody;
}
```

**Responsive behavior:**

| `WindowSizeClass` | Navigasi | Layout |
|---|---|---|
| `compact` | BottomBar existing (lewat `AppBottomBar`) | Mobile body, tanpa sidebar/header tablet |
| `medium` | Sidebar collapsed (icon-only) | TopHeader + Sidebar collapsed + body |
| `expanded` | Sidebar expanded (collapsible) | TopHeader + Sidebar + body |
| `large` | Sidebar expanded + content max-width | TopHeader + Sidebar + body (content constraint) |

**Catatan penting:**
- Pada `compact`, shell **tidak** menggunakan sidebar atau top header. Semua navigasi tablet dinonaktifkan. Shell meneruskan `body` langsung ke dalam `Scaffold` dengan `AppBottomBar`.
- Pada `medium+`, shell adalah `Scaffold` dengan body berupa `Row`: `[OperationalSidebar | Column(TopHeader, content)]`
- Sidebar collapsed state disimpan sebagai `StatefulWidget` internal, bisa di-override dari luar bila perlu
- Shell memiliki internal `_isSidebarCollapsed` state, dengan tombol toggle di sidebar atau di top header

**Struktur widget tree (medium/expanded/large):**

```
Scaffold(
  body: Row(
    children: [
      OperationalSidebar(collapsed: _isSidebarCollapsed, ...),
      VerticalDivider(),
      Expanded(
        child: Column(
          children: [
            OperationalTopHeader(...),
            Divider(),
            Expanded(child: body),
            if (showSecondaryBody) SecondaryPanel(secondaryBody),
          ],
        ),
      ),
    ],
  ),
)
```

---

### 10. Upgrade `StatusChip`

**File:** `components/indicators/status_chip.dart` (MODIFY)

Tambahkan:

```dart
enum StatusChipSize { small, medium }
enum StatusChipVariant { filled, outlined, subtle }

class StatusChip extends StatelessWidget {
  // ... existing params ...
  final StatusChipSize size;      // default medium
  final StatusChipVariant variant; // default subtle (existing behavior)
}
```

- `small`: `labelSmall`, padding `(6, 3)`
- `medium`: existing behavior, padding `(8, 4)`
- `filled`: opaque background, teks berwarna kontras
- `outlined`: border + teks, background transparent
- `subtle`: existing (background 20% opacity)

---

### 11. Upgrade `TabletTableToolbar` (Backward-Compatible)

**File:** `components/layout/tablet_table_toolbar.dart` (MODIFY)

Toolbar lama tetap ada untuk backward compatibility. Tambahkan parameter opsional baru:

```dart
class TabletTableToolbar extends StatelessWidget {
  // ... existing params tetap ...

  // Tambahan baru (semua optional agar tidak break caller lama)
  final List<FilterConfig>? filterConfigs;          // NEW
  final List<ActiveFilter>? activeFilters;           // NEW
  final void Function(ActiveFilter)? onFilterApply; // NEW
  final void Function(String)? onFilterRemove;       // NEW
  final VoidCallback? onFilterReset;                 // NEW
  final List<Widget>? secondaryActions;              // NEW
  final bool sticky;                                 // NEW, default false
}
```

Bila `filterConfigs` null => perilaku lama (filterChips raw widgets). Bila `filterConfigs` tidak null => gunakan behavior baru dengan `IndexToolbar` internal logic.

---

### 12. Export di `wash_wallet_ui.dart`

Tambahkan semua export baru:

```dart
// Operational Tablet Shell
export 'src/components/layout/operational_tablet_shell/operational_tablet_shell.dart';
export 'src/components/layout/operational_tablet_shell/operational_shell_config.dart';

// Operational Sidebar
export 'src/components/layout/operational_sidebar/operational_sidebar.dart';
export 'src/components/layout/operational_sidebar/models/sidebar_menu_section.dart';
export 'src/components/layout/operational_sidebar/models/sidebar_menu_item.dart';
export 'src/components/layout/operational_sidebar/models/sidebar_user_account.dart';

// Operational Top Header
export 'src/components/layout/operational_top_header/operational_top_header.dart';
export 'src/components/layout/operational_top_header/models/top_header_action.dart';

// Page Content Header
export 'src/components/layout/page_content_header/page_content_header.dart';
export 'src/components/layout/page_content_header/models/breadcrumb_item.dart';

// Data View
export 'src/components/data_view/app_data_table.dart';
export 'src/components/data_view/app_data_view.dart';
export 'src/components/data_view/index_toolbar.dart';
export 'src/components/data_view/models/data_table_column_def.dart';
export 'src/components/data_view/models/data_table_action.dart';
export 'src/components/data_view/models/filter_config.dart';
export 'src/components/data_view/models/filter_option.dart';
export 'src/components/data_view/models/active_filter.dart';
```

---

## Urutan Pengerjaan yang Direkomendasikan

> Ikuti urutan ini karena ada dependency antar file.

### Fase 1 — Models & Config (Tanpa UI)

1. `sidebar_menu_item.dart`
2. `sidebar_menu_section.dart`
3. `sidebar_user_account.dart`
4. `breadcrumb_item.dart`
5. `top_header_action.dart`
6. `data_table_column_def.dart`
7. `data_table_action.dart`
8. `filter_config.dart`
9. `filter_option.dart`
10. `active_filter.dart`

### Fase 2 — StatusChip Upgrade

11. Upgrade `status_chip.dart` (tambah size + variant, backward-compatible)

### Fase 3 — Komponen Sidebar

12. `operational_sidebar_header.dart`
13. `operational_sidebar_item.dart`
14. `operational_sidebar_section.dart`
15. `operational_sidebar_footer.dart`
16. `operational_sidebar.dart`

### Fase 4 — Top Header

17. `operational_top_header.dart`

### Fase 5 — Page Content Header

18. `page_content_header.dart`

### Fase 6 — Data View

19. `index_toolbar.dart`
20. `app_data_table.dart`
21. `app_data_view.dart`

### Fase 7 — Shell

22. `operational_shell_config.dart` (jika diperlukan config object terpisah)
23. `operational_tablet_shell.dart`

### Fase 8 — Upgrade TabletTableToolbar

24. Upgrade `tablet_table_toolbar.dart` (backward-compatible)

### Fase 9 — Export & Verifikasi

25. Update `wash_wallet_ui.dart` (tambah semua export baru)
26. Jalankan `flutter analyze packages/wash_wallet_ui`
27. Pastikan tidak ada breaking change untuk file yang di-MODIFY

---

## Aturan Ketat Saat Implementasi

1. **Shared UI tidak boleh import domain Cashier atau Production** — tidak ada import dari `apps/cashier` atau `apps/production` di dalam `packages/wash_wallet_ui`.
2. **Semua permission logic diinjeksikan via callback** — gunakan `bool Function()? isVisible` pada `SidebarMenuItem`, bukan hard-coded role check.
3. **Tidak ada hardcoded string** — semua teks (empty message, error message, search hint) harus bisa dikonfigurasi via parameter, bukan konstan.
4. **Backward-compatible untuk MODIFY** — `TabletTableToolbar` dan `StatusChip` yang di-upgrade tidak boleh mengubah signature existing constructor.
5. **Gunakan `context.colors`, `context.typography`, `context.space`, `context.radius`** — tidak boleh hardcode warna hex atau ukuran angka langsung. Gunakan theme token.
6. **Tidak ada perubahan API/backend** — widget hanya menerima data dari luar, tidak fetching data sendiri.
7. **Overflow prevention wajib** — setiap widget harus ditest tidak overflow pada:
   - tablet portrait (840 dp)
   - tablet landscape (1280 dp)
   - large width (1440 dp+)

---

## Visual Style Reference

Seluruh widget mengikuti arah visual dari user need:

| Elemen | Spesifikasi |
|---|---|
| Background utama | `context.colors.background` (dark navy/deep blue pada dark mode) |
| Surface sidebar | Sedikit lebih terang dari background, `context.colors.surface` |
| Surface header | Sama dengan surface sidebar atau elevated tipis |
| Primary/Active | `context.colors.primary` — hijau untuk selected state dan primary action |
| Info/View | `context.colors.info` atau biru |
| Warning/Edit | Kuning/orange (`context.colors.warning`) |
| Danger/Delete | `context.colors.error` (merah) |
| Muted text | `context.colors.onSurfaceVariant` |
| Border radius | `context.radius.md` (8-12 dp), tidak terlalu bulat |
| Touch target minimum | 44 dp (sesuai Material guidelines) |
| Row height table | Minimal 56 dp (`AppDensity.listItemHeight(compact)` = 52, override ke 56) |
| Sidebar expanded width | 268 dp |
| Sidebar collapsed width | 80 dp |
| Top header height | 64 dp |

---

## Verifikasi

Setelah semua widget selesai dibuat, AI eksekutor harus menjalankan:

### Automated

```bash
flutter analyze packages/wash_wallet_ui
```

Hasil: **zero errors, zero warnings** (atau hanya info hint yang tidak kritis).

### Manual / Visual Check

Karena ini hanya `packages/wash_wallet_ui` (bukan app), verifikasi dilakukan dengan salah satu cara:

**Opsi A — Widget test atau Golden test:**
- Buat file `packages/wash_wallet_ui/test/operational_tablet_shell_test.dart`
- Buat golden test untuk:
  - `OperationalSidebar` collapsed
  - `OperationalSidebar` expanded
  - `OperationalTopHeader` dengan semua elemen aktif
  - `PageContentHeader` dengan breadcrumb 2 level
  - `AppDataTable` dengan 3 baris data, loading state, dan empty state
  - `IndexToolbar` tanpa filter aktif dan dengan 2 filter aktif
  - `AppDataView` komposisi lengkap

**Opsi B — Example screen di cashier/production (bila sudah ada integrasi awal):**
- Tidak wajib untuk scope ini, cukup `flutter analyze` + code review

### Checklist Review Kode

- [ ] Tidak ada import dari `apps/`
- [ ] Semua parameter yang perlu dikonfigurasi sudah ada di constructor
- [ ] Tidak ada hardcoded warna
- [ ] `StatusChip` backward-compatible
- [ ] `TabletTableToolbar` backward-compatible
- [ ] `wash_wallet_ui.dart` sudah export semua file baru
- [ ] Tidak ada `DataTable` Flutter standar yang dipakai langsung (harus dibungkus `AppDataTable`)
- [ ] Real-time clock menggunakan Timer yang di-dispose dengan benar di `dispose()`
- [ ] `isVisible` di `SidebarMenuItem` dipanggil saat build, bukan disimpan sebagai state
- [ ] Filter panel bisa dibuka dan ditutup tanpa crash
- [ ] Active filter pills bisa di-delete individual
- [ ] Reset filter mengosongkan semua `activeFilters`
- [ ] Sidebar collapsed/expanded animasi smooth

---

## Catatan untuk AI Eksekutor

1. Baca seluruh plan ini sebelum menulis satu baris kode.
2. Ikuti **Fase 1 sampai Fase 9** secara berurutan — jangan loncat ke shell sebelum model selesai.
3. Gunakan Dart generics (`AppDataTable<T>`, `AppDataView<T>`, `DataTableColumnDef<T>`, dll) dari awal — jangan dibuat non-generic lalu di-refactor.
4. Untuk `OperationalTopHeader`, real-time clock menggunakan `Timer.periodic` harus di-dispose di `dispose()` — jangan lupa.
5. Jangan membuat widget demo/placeholder di `apps/` — scope ini hanya `packages/wash_wallet_ui`.
6. Bila ada ambiguitas kecil dalam spec (misalnya warna spesifik untuk header), pilih yang paling konsisten dengan `context.colors.*` token yang sudah ada.
7. Setelah selesai, jalankan `flutter analyze packages/wash_wallet_ui` dan pastikan hasilnya bersih.
8. Dokumentasikan setiap class public dengan DartDoc minimal satu baris.

---

## Ringkasan File

### File yang Akan Dimodifikasi

| File | Tipe | Perubahan |
|---|---|---|
| `packages/wash_wallet_ui/lib/wash_wallet_ui.dart` | MODIFY | Tambah export semua file baru |
| `packages/wash_wallet_ui/lib/src/components/layout/tablet_table_toolbar.dart` | MODIFY | Tambah parameter opsional baru, backward-compatible |
| `packages/wash_wallet_ui/lib/src/components/indicators/status_chip.dart` | MODIFY | Tambah `StatusChipSize` dan `StatusChipVariant`, backward-compatible |

### File yang Akan Dibuat (Baru)

| File | Keterangan |
|---|---|
| `components/layout/operational_tablet_shell/operational_tablet_shell.dart` | Shell utama pasca-login tablet |
| `components/layout/operational_tablet_shell/operational_shell_config.dart` | Config object opsional untuk shell |
| `components/layout/operational_sidebar/operational_sidebar.dart` | Sidebar fixed/collapsible tablet |
| `components/layout/operational_sidebar/operational_sidebar_item.dart` | Item navigasi sidebar |
| `components/layout/operational_sidebar/operational_sidebar_section.dart` | Section/group sidebar |
| `components/layout/operational_sidebar/operational_sidebar_header.dart` | Header sidebar (logo + nama) |
| `components/layout/operational_sidebar/operational_sidebar_footer.dart` | Footer sidebar (user account) |
| `components/layout/operational_sidebar/models/sidebar_menu_section.dart` | Model section menu |
| `components/layout/operational_sidebar/models/sidebar_menu_item.dart` | Model item menu |
| `components/layout/operational_sidebar/models/sidebar_user_account.dart` | Model user account footer |
| `components/layout/operational_top_header/operational_top_header.dart` | Top header tablet |
| `components/layout/operational_top_header/models/top_header_action.dart` | Model action header |
| `components/layout/page_content_header/page_content_header.dart` | Page header breadcrumb + title |
| `components/layout/page_content_header/models/breadcrumb_item.dart` | Model item breadcrumb |
| `components/data_view/app_data_table.dart` | Data table reusable generic |
| `components/data_view/app_data_view.dart` | Komposisi toolbar + table |
| `components/data_view/index_toolbar.dart` | Toolbar search + filter + CTA |
| `components/data_view/models/data_table_column_def.dart` | Definisi kolom table generic |
| `components/data_view/models/data_table_action.dart` | Definisi row action |
| `components/data_view/models/filter_config.dart` | Config filter (type, options) |
| `components/data_view/models/filter_option.dart` | Option item filter |
| `components/data_view/models/active_filter.dart` | State filter yang aktif |

---

*Plan ini disusun pada 2026-06-28. Scope: hanya `packages/wash_wallet_ui`. Integrasi ke `apps/cashier` dan `apps/production` dikerjakan dalam plan terpisah.*
