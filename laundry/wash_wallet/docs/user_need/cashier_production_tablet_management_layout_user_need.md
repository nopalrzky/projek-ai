# User Need: Shared Tablet Management Layout Cashier dan Production App

Tanggal: 2026-06-28

Dokumen ini menjadi acuan user need untuk AI model lain saat menyusun implementation plan. Fokus kebutuhan adalah membuat pola layout dashboard/index yang reusable untuk **semua screen setelah login** pada Cashier App dan Production App saat digunakan di tablet, terutama tablet landscape 10 sampai 12 inch.

Kebutuhan ini terinspirasi dari `AuthenticatedLayout` pada web owner, tetapi implementasi target tetap Flutter mobile/tablet dengan `wash_wallet_ui`, bukan menyalin kode React web.

## 1. Ringkasan Kebutuhan

User membutuhkan satu pola layout baru yang bisa dipakai ulang oleh screen operasional setelah login:

1. Widget layout/shell tablet yang memiliki sidebar, top header, page header, toolbar, dan content area.
2. Widget sidebar navigation yang fixed/collapsible untuk tablet.
3. Widget top header untuk search global, waktu/tanggal, notifikasi, theme toggle, dan profil user.
4. Widget page header untuk breadcrumb, title, subtitle, dan action area.
5. Widget table/data view untuk index screen, lengkap dengan search, filter, active filter indicator, empty/loading/error state, dan row actions.
6. Pola tersebut dipakai oleh Cashier App dan Production App saat width tablet/large.
7. Phone compact tetap memakai pola mobile existing dan bottom navigation.

## 2. Tujuan Produk

1. Membuat Cashier App dan Production App terasa seperti aplikasi dashboard/POS profesional pada tablet.
2. Menyatukan tampilan screen setelah login agar tidak terasa seperti kumpulan mobile screen yang diperbesar.
3. Mengurangi duplikasi implementasi search, filter, table, action button, dan header pada index screen.
4. Membuat workflow tablet lebih cepat untuk operasional outlet:
   - cashier: order input, customer lookup, service selection, payment, print receipt;
   - production: melihat antrian, mulai proses, update progress, pickup/kurir bila employee punya akses.
5. Meniru struktur owner web yang sudah mapan:
   - authenticated layout,
   - sidebar,
   - header,
   - breadcrumb/page header,
   - data view dengan filter dan table.

## 3. Konteks Codebase Saat Ini

Hasil baca codebase:

1. Monorepo Flutter berada di:
   - `apps/cashier`
   - `apps/production`
   - `packages/wash_wallet_ui`
2. Cashier App sudah memakai `StatefulShellRoute.indexedStack`:
   - shell: `apps/cashier/lib/core/navigation/main_shell_screen.dart`
   - root tabs: Home, Dana, Transaksi, Setting
   - shell memakai `AdaptiveScaffold` dari `packages/wash_wallet_ui`
3. `AdaptiveScaffold` saat ini:
   - compact: `AppBottomBar`
   - medium/expanded/large: `NavigationRail`
   - large: rail extended
   - sudah punya `railLeadingWidget` dan `railTrailingWidget`
4. Cashier App sudah memiliki beberapa tablet table lokal:
   - `IndexOrdersScreen`
   - `IndexCustomersScreen`
   - `IndexCategoriesScreen`
   - `IndexLaundryServicesScreen`
   - `IndexServicePackagesScreen`
   - `IndexMembershipPlanScreen`
   - `IndexDepositScreen`
   - `IndexExpenseScreen`
   - `IndexPettyCashScreen`
5. Cashier tablet table saat ini masih banyak duplikasi:
   - tiap screen membuat `_buildTabletTable`
   - tiap screen membuat `DataTable` manual
   - search/filter/action toolbar masih dirangkai per screen
   - styling table belum menjadi design system yang konsisten
6. `packages/wash_wallet_ui` sudah memiliki:
   - `AppLayout`
   - `AdaptiveScaffold`
   - `ResponsiveLayout`
   - `ResponsiveGrid`
   - `ContentConstraint`
   - `TabletTableToolbar`
   - `StatusChip`
   - `AppBreakpoints`
   - theme, spacing, radius, typography, density
7. Production App saat ini masih memakai `AppLayout` per screen dengan `AppDynamicBottomBar`:
   - `apps/production/lib/features/home/presentation/screens/home_screen.dart`
   - `apps/production/lib/features/order/presentation/screens/index_order_screen.dart`
   - route protected utama: `/home`, `/orders`, `/orders/:id`, `/order-items/:id`, `/pickup-schedule`
8. Production App belum memiliki shared tablet shell/sidebar seperti Cashier.
9. Web owner memiliki pola yang ingin dijadikan referensi:
   - `webapp/wash_wallet_be/resources/js/Layouts/AuthenticatedLayout.tsx`
   - `webapp/wash_wallet_be/resources/js/Components/Header/Header.tsx`
   - `webapp/wash_wallet_be/resources/js/Components/Sidebar/Sidebar.tsx`
   - `webapp/wash_wallet_be/resources/js/Components/Page/PageHeader.tsx`
   - `webapp/wash_wallet_be/resources/js/Components/DataView/DataView.tsx`
   - `webapp/wash_wallet_be/resources/js/Components/Filters/FilterBar.tsx`
   - `webapp/wash_wallet_be/resources/js/Components/DataTable/DataTable.tsx`
10. Web owner index `LaundryServices` sudah menjadi contoh lengkap:
    - `PageHeader`
    - `DataView`
    - `searchPlaceholder`
    - `createLaundryServiceFilters`
    - `createLaundryServiceColumns`
    - action button `Tambah Layanan Laundry`

## 4. Masalah Saat Ini

1. Belum ada satu layout tablet pasca-login yang konsisten untuk Cashier dan Production.
2. Cashier tablet sudah mulai memakai table, tetapi implementasinya lokal dan berulang di banyak screen.
3. Production App belum memiliki sidebar/header/tablet management layout.
4. `TabletTableToolbar` saat ini masih terlalu sederhana untuk kebutuhan index screen lengkap:
   - belum ada filter button/panel generik,
   - belum ada active filter pills,
   - belum ada reset/apply pattern,
   - belum ada layout sticky toolbar,
   - belum ada konfigurasi filter reusable seperti web owner `DataView`.
5. `DataTable` bawaan Flutter dipakai langsung di screen, sehingga style, empty state, row action, scroll, dan density mudah tidak konsisten.
6. App header mobile existing tidak cukup untuk dashboard tablet:
   - belum ada global search,
   - belum ada waktu/tanggal,
   - belum ada notifikasi dan profile mini yang konsisten,
   - belum ada breadcrumb/page context yang konsisten.
7. Sidebar mobile/tablet belum meniru struktur owner web:
   - belum ada branding aplikasi yang kuat,
   - belum ada grouped menu/accordion,
   - belum ada menu search,
   - belum ada account footer.

## 5. Scope Kebutuhan

Termasuk scope:

1. Shared tablet shell/layout untuk screen setelah login di Cashier dan Production.
2. Shared sidebar widget untuk tablet.
3. Shared top header widget untuk tablet.
4. Shared page header/content header widget.
5. Shared data table/data view widget untuk index screen.
6. Shared search/filter toolbar untuk index screen.
7. Config/adaptor menu per app:
   - Cashier menu config
   - Production menu config
8. Responsive behavior:
   - phone compact tetap mobile layout,
   - tablet/large memakai shell dan table pattern.
9. Dark mode visual direction untuk tablet operational dashboard.
10. Migration plan bertahap untuk screen yang sudah punya table lokal.

Di luar scope:

1. Tidak mengubah backend/API.
2. Tidak menambah flow bisnis baru.
3. Tidak mengubah logic order, payment, print, pickup, atau production process.
4. Tidak wajib mengubah screen auth/login/onboarding/splash.
5. Tidak perlu mengubah owner web.
6. Tidak perlu membuat analytics baru.
7. Tidak perlu mengganti seluruh form/create/edit/detail bila belum dibutuhkan; cukup pastikan form/detail tetap hidup di dalam shell tablet.

## 6. Referensi Struktur dari Web Owner

Pola web owner yang ingin diadaptasi:

```text
+---------------------------------------------------------------+
| Top Header                                                    |
+----------------------+----------------------------------------+
| Sidebar              | Breadcrumb / Page Context              |
| - Logo               +----------------------------------------+
| - Search menu        | Page Header                            |
| - Menu sections      | - Title                                |
| - Accordion items    | - Subtitle/count                       |
| - Profile footer     | - Actions                              |
|                      +----------------------------------------+
|                      | Toolbar                                |
|                      | - Search                               |
|                      | - Filter                               |
|                      | - Add button                           |
|                      +----------------------------------------+
|                      | Data Table / Main Content              |
+----------------------+----------------------------------------+
```

Yang perlu diambil:

1. Struktur layout authenticated.
2. Header sticky di atas.
3. Sidebar collapsible dengan branding dan grouped menu.
4. Breadcrumb/page header.
5. DataView pattern: search, filter, active filters, action button, table, pagination.

Yang tidak perlu diambil mentah:

1. Framer motion/animation web.
2. Tailwind class.
3. Semua item menu owner web.
4. Gradient/dekorasi yang terlalu web-marketing.

## 7. Kebutuhan Shared Tablet Shell

Butuh widget layout baru di shared UI atau peningkatan `AdaptiveScaffold` yang dapat menjadi shell pasca-login.

Nama final bebas ditentukan saat plan, tetapi konsepnya:

1. `OperationalTabletShell`
2. `AuthenticatedTabletLayout`
3. `PostLoginDashboardShell`
4. Atau upgrade besar pada `AdaptiveScaffold`

Kebutuhan shell:

1. Berlaku hanya untuk authenticated/protected screens.
2. Pada compact width:
   - tetap memakai bottom navigation dan layout mobile existing.
3. Pada medium/expanded/large:
   - memakai sidebar/rail kiri,
   - top header horizontal,
   - scrollable content area,
   - optional secondary/detail panel.
4. Shell menerima config:
   - app name,
   - app role/system label,
   - logo/icon,
   - destinations/menu sections,
   - selected route/index,
   - user account info,
   - header actions,
   - body,
   - optional secondary body.
5. Shell harus aman untuk Cashier dan Production.
6. Shell tidak boleh memaksa data domain tertentu.
7. Shell harus menghindari overflow pada tablet portrait dan landscape.

## 8. Kebutuhan Sidebar

Sidebar tablet harus terasa seperti bagian utama aplikasi, bukan fallback drawer.

Kebutuhan visual:

1. Fixed di kiri, full height.
2. Dark navy/deep blue surface.
3. Logo aplikasi di atas.
4. Nama aplikasi:
   - `WashWallet`
5. Label role/system:
   - Cashier: `Kasir App / Management System`
   - Production: `Production App / Operation System`
6. Navigation item memakai icon + label.
7. Selected state jelas.
8. Width expanded sekitar 260 sampai 280 dp.
9. Width collapsed sekitar 72 sampai 88 dp.
10. Touch target minimal 44 dp.

Kebutuhan behavior:

1. Bisa collapsed/expanded pada tablet landscape/large.
2. Pada collapsed mode, item tetap punya tooltip.
3. Grouped menu memakai accordion/collapsible section.
4. Sidebar bisa memiliki search menu seperti web owner bila jumlah menu banyak.
5. Sidebar footer menampilkan:
   - avatar,
   - nama user,
   - email/username bila tersedia,
   - menu profile/logout/switch employee bila tersedia.
6. Menu harus permission-aware untuk Production, karena employee bisa punya production/courier access berbeda.
7. Sidebar tidak boleh menutup content area.
8. Sidebar tidak boleh menggantikan bottom nav pada phone.

Contoh menu Cashier:

1. Home
2. Dana
3. Transaksi
4. Setting
5. Operasional:
   - Manajemen Order
   - Data Pelanggan
   - Kelola Outlet
   - Layanan Laundry
   - Paket Layanan
   - Daftar Membership
   - Deposit Pelanggan
   - Catat Pengeluaran
   - Kas Kecil

Contoh menu Production:

1. Home
2. Produksi / Order
3. Pickup Schedule bila employee punya courier access
4. Order Items
5. Profile/Setting bila route tersedia atau direncanakan

## 9. Kebutuhan Top Header

Top header berada di atas content area dan harus konsisten untuk Cashier dan Production tablet.

Komponen:

1. Global search bar.
   - Cashier: mencari pesanan, pelanggan, transaksi.
   - Production: mencari order, item produksi, pelanggan.
2. Current time.
3. Current date.
4. Notification icon.
5. Theme toggle jika theme switching tersedia.
6. User profile mini info:
   - avatar,
   - nama,
   - outlet/role bila tersedia.
7. Optional app actions:
   - refresh,
   - switch employee,
   - printer/device status.

Kebutuhan behavior:

1. Header height stabil, sekitar 60 sampai 72 dp.
2. Search tidak boleh membuat header overflow.
3. Pada medium width, profile text boleh disembunyikan dan hanya avatar ditampilkan.
4. Header tidak memakai hamburger sebagai navigasi utama di tablet.
5. Header tetap bisa membuka sidebar pada tablet kecil bila desain memerlukan.

## 10. Kebutuhan Page Header / Content Header

Setiap screen setelah login perlu page header konsisten.

Komponen:

1. Breadcrumb navigation.
   - contoh: `Home > Layanan Laundry`
2. Page title.
   - contoh: `Manajemen Layanan Laundry`
3. Subtitle/description.
   - contoh: `Kelola semua layanan laundry Anda (36 layanan)`
4. Optional badges/status.
5. Optional right actions.

Kebutuhan behavior:

1. Page header harus berada di atas toolbar/content.
2. Page header tidak terlalu hero besar.
3. Title dan subtitle harus tetap terbaca pada tablet.
4. Untuk dashboard home, page header boleh digabung dengan dashboard header.
5. Untuk form/detail screen, page header tetap dipakai untuk konteks dan back action.

## 11. Kebutuhan Index Toolbar Search dan Filter

Setiap index screen tablet perlu toolbar yang seragam.

Komponen:

1. Search input.
2. Filter button/dropdown/panel.
3. Active filter pills/chips.
4. Reset filter.
5. Apply filter bila filter panel tidak auto apply.
6. Primary CTA button.
7. Optional secondary actions.

Contoh untuk Layanan Laundry:

1. Search:
   - nama layanan,
   - deskripsi.
2. Filter:
   - kategori,
   - status,
   - harga,
   - unit,
   - durasi,
   - minimal quantity.
3. Primary CTA:
   - `Tambah Layanan Laundry`
   - icon plus
   - prominent green/primary action.

Kebutuhan behavior:

1. Toolbar bisa sticky di atas table pada tablet.
2. Search bisa submit dengan Enter dan clear button.
3. Filter yang aktif terlihat jelas.
4. Reset filter mengembalikan data ke default.
5. Filter yang tidak didukung data/API saat ini boleh ditandai optional pada plan, bukan dipaksakan.

## 12. Kebutuhan Data Table / Data View

Butuh widget table/data view reusable, bukan `DataTable` manual berulang di setiap screen.

Nama final bebas ditentukan saat plan, tetapi konsepnya:

1. `OperationalDataView`
2. `TabletDataView`
3. `AppDataTable`
4. `IndexDataTable`

Kebutuhan umum:

1. Full width di content area.
2. Dark theme.
3. Header row sticky bila feasible.
4. Row compact tetapi touch-friendly.
5. Row height minimal 52 sampai 56 dp.
6. Vertical scroll dan horizontal scroll aman.
7. Empty/loading/error state konsisten.
8. Optional pagination atau load more bila data screen mendukung.
9. Optional row selection.
10. Optional secondary/detail panel untuk order/tablet two-pane.
11. Row action inline dengan icon button.
12. Table config harus mendukung kolom custom per screen.

Kebutuhan column/cell:

1. Cell dapat menampilkan title + subtitle.
2. Cell dapat menampilkan status badge/chip.
3. Cell dapat menampilkan formatted currency.
4. Cell dapat menampilkan date/time.
5. Cell dapat menampilkan action buttons.
6. Long text harus truncate atau wrap secara terkontrol.

## 13. Contoh Baseline Table: Layanan Laundry

Table `Layanan Laundry` menjadi baseline visual karena sudah ada di web owner dan sesuai request user.

Kolom:

| Kolom | Fungsi |
|---|---|
| Nama Layanan | Nama service laundry, bold, dengan status badge |
| Kategori | Jenis layanan seperti Tas, Pakaian, Sepatu, Karpet |
| Unit | Satuan harga seperti kg, pcs, set |
| Harga | Harga per unit dalam format Rp xx.xxx |
| Durasi | Lama pengerjaan seperti 14 jam atau 2 hari |
| Min. Qty | Minimum quantity seperti 1 kg atau 2 pcs |
| Aksi | View, edit, delete |

Row design:

1. Service name bold.
2. Status badge:
   - Aktif: green
   - Nonaktif: gray/red
3. Category description sebagai metadata.
4. Price:
   - `Rp xx.xxx`
   - subtext: `per kg`, `per pcs`, `per set`
5. Duration:
   - `14 jam`
   - subtext: estimasi hari bila tersedia
6. Minimum quantity:
   - `1 kg`
   - `2 pcs`

Action buttons:

1. View:
   - icon mata
   - warna biru/info
2. Edit:
   - icon pensil
   - warna yellow/orange
3. Delete:
   - icon trash
   - warna merah/error
4. Button rounded square, minimal 44 dp, tooltip wajib.

## 14. Kebutuhan Coverage Cashier App

Pada tablet, shell/layout baru perlu digunakan pada protected screen setelah login.

Prioritas tinggi:

1. Home dashboard.
2. Orders index.
3. Customers index.
4. Laundry services index.
5. Categories index.
6. Service packages index.
7. Membership plans index.
8. Finance/index Dana.

Prioritas berikutnya:

1. Deposit index.
2. Expense index.
3. Petty cash index.
4. Customer subscription index.
5. Membership contract index.
6. Setting/setup outlet index.
7. Detail/create/edit screen agar tetap berada di shell tablet, minimal dengan page header dan content constraint.

Catatan:

1. Cashier phone layout jangan rusak.
2. Table lokal yang sudah ada boleh dimigrasikan bertahap ke shared data view.
3. Two-pane order detail yang sudah ada perlu dipertahankan atau dirapikan dalam shared layout.

## 15. Kebutuhan Coverage Production App

Pada tablet, Production App perlu memakai pola shell yang sama.

Prioritas tinggi:

1. Home dashboard produksi.
2. Orders index.
3. Order detail.
4. Order item detail.
5. Pickup schedule bila employee punya courier access.

Kebutuhan khusus Production:

1. Menu sidebar harus permission-aware:
   - Production access menampilkan order produksi.
   - Courier access menampilkan pickup schedule.
2. Tablet workflow harus memprioritaskan:
   - melihat antrian siap dikerjakan,
   - mulai proses,
   - menyelesaikan proses,
   - melihat detail item/order,
   - pickup schedule jika relevan.
3. Phone tetap memakai `AppDynamicBottomBar` existing.
4. Tablet sebaiknya tidak memakai bottom bar sebagai navigasi utama.

## 16. Visual Style

Arah visual:

1. Modern dark mode.
2. Dark navy / deep blue sebagai base.
3. Green untuk primary action dan active state.
4. Blue untuk info/view.
5. Yellow/orange untuk edit/warning.
6. Red untuk delete/error.
7. Gray untuk secondary text/disabled.
8. Typography:
   - title bold,
   - primary data medium,
   - metadata small muted.
9. Border radius:
   - 8 sampai 14 px/dp,
   - card/table/widget jangan terlalu bulat.
10. Spacing generous untuk tablet touch interaction.
11. Hindari landing page/hero/marketing style.
12. Hindari card di dalam card bila tidak perlu.
13. Gunakan tokens dari `wash_wallet_ui`:
    - `context.colors`
    - `context.typography`
    - `context.space`
    - `context.radius`
    - `AppDensityMode.compact`

## 17. Responsive Behavior

Expected behavior:

| Width | Navigation | Layout |
|---|---|---|
| Compact phone | Bottom bar existing | Mobile list/card existing |
| Medium tablet | Sidebar/rail compact | Page header + toolbar + table |
| Expanded tablet | Sidebar expanded/collapsible | Table/data view, optional detail panel |
| Large | Sidebar expanded | Max-width content, table tidak terlalu melebar |

Rules:

1. Compact phone tidak boleh berubah besar-besaran.
2. Tablet portrait tidak boleh overflow.
3. Tablet landscape menjadi target utama.
4. Large width perlu content constraint.
5. Header, toolbar, dan table tidak boleh saling overlap.
6. Text di button/table/header harus fit atau truncate secara profesional.

## 18. Rekomendasi Penempatan Widget

Plan berikutnya perlu memutuskan nama final, tetapi arah penempatan disarankan:

Shared di `packages/wash_wallet_ui` jika generik:

1. `OperationalShell` atau `AuthenticatedTabletLayout`
2. `OperationalSidebar`
3. `OperationalHeader`
4. `PageContentHeader`
5. `OperationalDataView`
6. `AppDataTable`
7. `DataTableColumnConfig`
8. `DataTableAction`
9. `FilterConfig`
10. `FilterBar`
11. `ActiveFilterPills`
12. Improvement `StatusChip`
13. Improvement `TabletTableToolbar`

App-specific di `apps/cashier`:

1. `CashierNavigationConfig`
2. `CashierShellAdapter`
3. `CashierIndexScreenConfig`
4. Domain-specific table cells bila perlu.

App-specific di `apps/production`:

1. `ProductionNavigationConfig`
2. `ProductionShellAdapter`
3. `ProductionIndexScreenConfig`
4. Permission-aware menu adapter.

Aturan:

1. Shared UI tidak boleh import domain Cashier/Production.
2. App-specific adapter boleh membaca auth employee, permission, route, dan domain.
3. Jangan membuat backend contract baru hanya untuk layout.
4. Jangan memindahkan semua screen sekaligus jika risikonya tinggi; migrasi bertahap boleh.

## 19. Acceptance Criteria

1. AI model berikutnya dapat menyusun implementation plan berdasarkan dokumen ini tanpa bertanya ulang tentang scope utama.
2. Ada rencana membuat/memperbaiki shared tablet shell untuk Cashier dan Production.
3. Ada rencana membuat/memperbaiki shared table/data view untuk index screen.
4. Sidebar tablet memiliki branding, menu, grouped section, selected state, dan account footer.
5. Top header tablet memiliki global search, date/time, notification, theme toggle/profile area sesuai dukungan app.
6. Page header memiliki breadcrumb/title/subtitle/action.
7. Index toolbar memiliki search, filter, active filter state, reset/apply, dan primary CTA.
8. Layanan Laundry table dapat menjadi contoh baseline dengan kolom:
   - Nama Layanan,
   - Kategori,
   - Unit,
   - Harga,
   - Durasi,
   - Min. Qty,
   - Aksi.
9. Row actions memakai icon buttons view/edit/delete dengan warna semantik dan tooltip.
10. Phone compact tetap aman dan tidak dipaksa memakai tablet shell.
11. Production App mendapat rencana tablet shell yang permission-aware.
12. Tidak ada perubahan API/backend/logic bisnis sebagai syarat utama.
13. Styling menggunakan `wash_wallet_ui`, bukan hardcoded style besar-besaran.
14. Tidak ada overflow pada tablet portrait, tablet landscape, dan large width.

## 20. Verifikasi yang Diharapkan pada Plan

Plan implementasi berikutnya perlu memasukkan verifikasi:

1. `flutter analyze packages/wash_wallet_ui`
2. `flutter analyze apps/cashier`
3. `flutter analyze apps/production`
4. Visual check Cashier:
   - phone portrait,
   - tablet portrait,
   - tablet landscape,
   - large width.
5. Visual check Production:
   - phone portrait,
   - tablet portrait,
   - tablet landscape,
   - permission berbeda untuk production/courier.
6. Cek sidebar:
   - expanded,
   - collapsed,
   - selected state,
   - menu group,
   - account footer.
7. Cek header:
   - search,
   - date/time,
   - notification,
   - theme/profile actions.
8. Cek index data view:
   - search submit,
   - clear search,
   - filter apply/reset,
   - active filter pills,
   - empty/loading/error state,
   - row actions.
9. Cek no overflow:
   - toolbar,
   - table rows,
   - action buttons,
   - sidebar labels.

## 21. Catatan untuk AI Penyusun Plan

Saat menyusun plan:

1. Mulai dari shared shell contract, bukan langsung memoles satu screen.
2. Tentukan apakah `AdaptiveScaffold` cukup di-upgrade atau perlu widget baru.
3. Desain config menu agar bisa dipakai Cashier dan Production.
4. Buat data view/table contract yang sederhana tetapi cukup untuk index screens.
5. Gunakan `IndexLaundryServicesScreen` dan web owner `LaundryServices` sebagai baseline table/search/filter.
6. Migrasikan Cashier index screen yang sudah punya `_buildTabletTable` secara bertahap.
7. Untuk Production, mulai dari shell + home + orders index.
8. Jangan mengganti flow bisnis.
9. Jangan mengubah backend.
10. Jangan mengubah owner web.
11. Jangan memaksa filter yang belum didukung data/API; catat sebagai optional follow-up.
12. Pastikan phone compact tetap lolos visual check.

## 22. Source Files Reviewed

File dan dokumen yang direview:

1. `packages/wash_wallet_ui/lib/src/components/layout/adaptive_scaffold.dart`
2. `packages/wash_wallet_ui/lib/src/components/layout/app_layout.dart`
3. `packages/wash_wallet_ui/lib/src/components/layout/tablet_table_toolbar.dart`
4. `packages/wash_wallet_ui/lib/src/components/indicators/status_chip.dart`
5. `packages/wash_wallet_ui/lib/src/components/layout/responsive_layout.dart`
6. `packages/wash_wallet_ui/lib/src/components/layout/content_constraint.dart`
7. `packages/wash_wallet_ui/lib/src/theme/responsive/app_breakpoints.dart`
8. `packages/wash_wallet_ui/lib/src/theme/density/app_density.dart`
9. `packages/wash_wallet_ui/lib/wash_wallet_ui.dart`
10. `apps/cashier/lib/core/router/app_router.dart`
11. `apps/cashier/lib/core/navigation/main_shell_screen.dart`
12. `apps/cashier/lib/core/navigation/bottom_nav_helper.dart`
13. `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`
14. `apps/cashier/lib/features/customer/presentation/screens/index_customers_screen.dart`
15. `apps/cashier/lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart`
16. `apps/cashier/lib/features/laundry_service/presentation/widgets/laundry_service_list_view.dart`
17. `apps/production/lib/core/router/app_router.dart`
18. `apps/production/lib/core/widgets/app_dynamic_bottom_bar.dart`
19. `apps/production/lib/core/utils/bottom_bar_items_builder.dart`
20. `apps/production/lib/features/home/presentation/screens/home_screen.dart`
21. `apps/production/lib/features/order/presentation/screens/index_order_screen.dart`
22. `webapp/wash_wallet_be/resources/js/Layouts/AuthenticatedLayout.tsx`
23. `webapp/wash_wallet_be/resources/js/Components/Sidebar/Sidebar.tsx`
24. `webapp/wash_wallet_be/resources/js/Components/Header/Header.tsx`
25. `webapp/wash_wallet_be/resources/js/Components/Page/PageHeader.tsx`
26. `webapp/wash_wallet_be/resources/js/Components/DataView/DataView.tsx`
27. `webapp/wash_wallet_be/resources/js/Components/Filters/FilterBar.tsx`
28. `webapp/wash_wallet_be/resources/js/Components/Filters/FilterContainer.tsx`
29. `webapp/wash_wallet_be/resources/js/Components/DataTable/DataTable.tsx`
30. `webapp/wash_wallet_be/resources/js/Components/DataTable/DataTableHeader.tsx`
31. `webapp/wash_wallet_be/resources/js/Pages/Dashboard/LaundryServices/Index.tsx`
32. `webapp/wash_wallet_be/resources/js/Pages/Dashboard/LaundryServices/columns.tsx`
33. `webapp/wash_wallet_be/resources/js/Pages/Dashboard/LaundryServices/filters.tsx`
34. `docs/user_need/cashier_tablet_dashboard_user_need.md`
35. `docs/plan/cashier_tablet_dashboard_layout_plan.md`

## Status

User need selesai disusun untuk kebutuhan shared tablet management layout Cashier dan Production App: sidebar, top header, page header, search/filter toolbar, data table, dan responsive shell pasca-login.
