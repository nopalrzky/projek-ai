# Cashier Play Store Large Screen — Adaptive UI & Screenshot Plan

Tanggal: 2026-06-27
Status: Draft — Menunggu Approval
User Need Reference: `docs/user_need/cashier_play_store_large_screen_user_need.md`
Context Reference: `docs/context/theme_shared_ui_redesign_context.md`, `docs/context/cashier_app_ux_redesign_blueprint.md`

## 1. Ringkasan

Plan ini mencakup dua area kerja utama:

1. **Adaptive UI** — Membuat tampilan WashWallet Cashier App benar-benar adaptive untuk layar besar (tablet 7-inch, tablet 10-inch, Chromebook, dan Android XR) dengan memperbarui shared UI package (`wash_wallet_ui`) dan screen cashier prioritas.
2. **Screenshot Readiness** — Menyiapkan screenshot Play Store untuk keempat kategori layar besar dengan data demo realistis, viewport yang benar, dan file output sesuai constraint Google Play.

Perubahan dilakukan bertahap: fondasi shared UI dulu, lalu screen-by-screen adaptation, dan terakhir screenshot capture. Phone portrait tetap dijaga agar tidak rusak.

## 2. Tujuan

1. Cashier app tampil profesional dan adaptive pada tablet 7-inch, tablet 10-inch, Chromebook, dan Android XR.
2. UI memanfaatkan ruang layar lebar dengan layout multi-kolom, navigation rail/sidebar, dan panel samping — bukan hanya mobile layout yang melebar.
3. Perubahan reusable masuk ke `packages/wash_wallet_ui` agar backward-compatible dan bisa dipakai app lain.
4. Visual tetap "clean operational": modern, padat, mudah dipindai, tidak dekoratif berlebihan.
5. Screenshot Play Store siap upload untuk 4 kategori layar besar.
6. Phone portrait layout tetap usable setelah perubahan.

## 3. Konteks Codebase Saat Ini

### 3.1 Arsitektur Umum

- Flutter monorepo dengan app `apps/cashier`, `apps/customer`, `apps/production`, dan shared packages.
- Cashier app memakai `MaterialApp.router` dengan `AppTheme.light()` / `AppTheme.dark()`.
- Root navigation memakai `StatefulShellRoute.indexedStack` dengan `MainShellScreen`.
- 4 tab root: Home, Dana, Transaksi, Setting.

### 3.2 Shared UI (`packages/wash_wallet_ui`)

Komponen yang diekspor saat ini:

| Kategori | Komponen |
|---|---|
| Theme | `AppTheme`, `AppColors`, `AppColorsExtension`, `SpacingValues`, `SemanticTypography` |
| Layout | `AppLayout`, `AppHeader`, `AppBottomBar` |
| Components | `AppCard`, `AppButton`, `AppTextField`, `AppDropdown`, `AppBadge`, `OrderStatusBadge`, `PaymentStatusBadge`, `AppChip`, `AppTabBar` |
| Overlays | `AppBottomSheet`, `AppDialog`, `AppSnackbar` |
| States | `AppLoadingIndicator`, `AppEmptyState`, `AppErrorState` |

Tidak ada responsive utility, breakpoint system, atau adaptive layout component.

### 3.3 Gap Utama Layar Besar

| Area | State Saat Ini | Gap |
|---|---|---|
| `AppLayout` | `SizedBox.expand` → `SafeArea` → child | Tidak ada breakpoint, max width, atau multi-pane |
| Navigation | Selalu `AppBottomBar.navigation` | Tidak ada rail/sidebar untuk layar lebar |
| Home | Single column `CustomScrollView` | Tidak ada grid untuk metric/quick action |
| Order List | Single column `ListView` | Tidak ada two-pane list+detail |
| Order Detail | Long single-column scroll | Tidak ada side panel untuk summary/actions |
| Finance | Gradient hero + stacked cards | Terlalu dekoratif, perlu grid operational |
| Modal/Sheet | Full width | Tidak ada max width pada tablet |
| Theme | Light/dark lengkap | Tidak ada responsive tokens |

## 4. Scope

1. Menambah responsive/adaptive foundation ke `wash_wallet_ui`.
2. Mengadaptasi `MainShellScreen` (root navigation) untuk adaptive navigation.
3. Mengadaptasi screen cashier prioritas untuk layar lebar:
   - Home dashboard
   - Order list
   - Order detail
   - Create/review order
   - Weigh order
   - Finance overview
   - Customer list (supporting)
   - Settings/printer (supporting)
4. Menjaga phone portrait tetap berfungsi.
5. Menyiapkan screenshot capture strategy dan tooling.
6. Menghasilkan screenshot kandidat untuk 4 kategori Play Store.

## 5. Di Luar Scope

1. Upload ke Play Console.
2. Feature graphic atau app icon.
3. Perubahan backend API.
4. Perubahan flow bisnis (order, payment, timbang, printer, finance).
5. Redesign customer app, production app, atau courier app.
6. Perubahan brand identity WashWallet.
7. Landing page marketing di dalam app.
8. Screen cashier yang tidak masuk prioritas screenshot.

## 6. Breakpoint Strategy

Breakpoint yang dipakai plan ini, mengacu pada Material Design adaptive layout guidance:

| Label | Width Range | Target Device | Navigation | Layout |
|---|---|---|---|---|
| `compact` | < 600 dp | Phone portrait | Bottom bar | Single column |
| `medium` | 600–839 dp | Phone landscape, tablet 7" portrait | Navigation rail | Adaptive (1-2 kolom) |
| `expanded` | 840–1199 dp | Tablet 10" portrait/landscape, tablet 7" landscape | Navigation rail | Multi-pane (2 kolom) |
| `large` | ≥ 1200 dp | Chromebook, Android XR, tablet 10" landscape | Navigation drawer / persistent sidebar | Multi-pane lebar (2-3 kolom) |

Breakpoint ini didefinisikan sebagai constant di shared UI dan dipakai oleh helper widget.

## 7. Fase Implementasi

### Fase 1: Responsive Foundation di Shared UI

**Tujuan**: Menambah breakpoint system, adaptive layout wrapper, dan responsive utility ke `packages/wash_wallet_ui` tanpa breaking change.

#### 1.1 [NEW] `packages/wash_wallet_ui/lib/src/theme/responsive/app_breakpoints.dart`

Buat file baru berisi:

1. Class `AppBreakpoints` dengan static constant:
   - `compact = 600.0`
   - `medium = 840.0`
   - `expanded = 1200.0`
2. Enum `WindowSizeClass { compact, medium, expanded, large }`.
3. Static method `WindowSizeClass of(BuildContext context)` yang membaca `MediaQuery.sizeOf(context).width` dan mengembalikan size class.
4. Static method `bool isCompact(BuildContext context)`, `isMedium`, `isExpanded`, `isLarge` sebagai shortcut.

#### 1.2 [NEW] `packages/wash_wallet_ui/lib/src/components/layout/adaptive_scaffold.dart`

Buat widget `AdaptiveScaffold` yang menjadi wrapper utama untuk screen yang butuh adaptive navigation:

1. Parameter:
   - `List<AdaptiveDestination> destinations` — item navigasi.
   - `int currentIndex` — index aktif.
   - `ValueChanged<int> onDestinationSelected` — callback navigasi.
   - `Widget body` — konten utama.
   - `Widget? secondaryBody` — panel kedua (optional, untuk two-pane).
   - `double? secondaryBodyWidth` — lebar panel kedua (default: proporsional).
   - `bool showSecondaryBody` — toggle panel kedua.
   - `Widget? floatingActionButton` — FAB.
2. Behavior berdasarkan `WindowSizeClass`:
   - `compact`: `Scaffold` + `AppBottomBar.navigation` di bawah, hanya `body`.
   - `medium`: `Scaffold` + `NavigationRail` di kiri (compact rail, icon + label), `body` mengisi sisa. `secondaryBody` jika disediakan ditampilkan di samping `body` dengan `VerticalDivider`.
   - `expanded`: Sama seperti `medium` tapi rail bisa lebih lebar dan `secondaryBody` proporsional lebih besar.
   - `large`: `Scaffold` + `NavigationDrawer` (persistent, bukan modal) di kiri, `body` + `secondaryBody`.
3. Transisi antar size class harus smooth (animasi width rail/drawer).
4. Rail/drawer memakai warna dari `AppColors` dan typography dari `SemanticTypography`.

#### 1.3 [NEW] `packages/wash_wallet_ui/lib/src/components/layout/responsive_layout.dart`

Buat widget `ResponsiveLayout` untuk content area yang butuh adaptive column:

1. Parameter:
   - `Widget compactLayout` — layout untuk compact.
   - `Widget? mediumLayout` — layout untuk medium (fallback ke compact).
   - `Widget? expandedLayout` — layout untuk expanded (fallback ke medium).
   - `Widget? largeLayout` — layout untuk large (fallback ke expanded).
2. Pilih layout berdasarkan `AppBreakpoints.of(context)`.
3. Gunakan `AnimatedSwitcher` atau transisi halus saat layout berubah.

#### 1.4 [NEW] `packages/wash_wallet_ui/lib/src/components/layout/content_constraint.dart`

Buat widget `ContentConstraint`:

1. Memberi `maxWidth` pada content agar tidak membentang terlalu lebar.
2. Parameter `maxWidth` (default: 1200), `alignment` (default: center), `padding`.
3. Dipakai untuk wrapping konten yang tidak butuh multi-pane tapi perlu dibatasi lebarnya.

#### 1.5 [NEW] `packages/wash_wallet_ui/lib/src/components/layout/responsive_grid.dart`

Buat widget `ResponsiveGrid`:

1. Seperti `GridView` tapi kolom otomatis berdasarkan width:
   - compact: 1–2 kolom.
   - medium: 2–3 kolom.
   - expanded: 3–4 kolom.
   - large: 4–6 kolom.
2. Parameter: `minCrossAxisExtent`, `mainAxisSpacing`, `crossAxisSpacing`, `children`.
3. Dipakai untuk dashboard metric card, quick action grid, finance menu grid.

#### 1.6 [NEW] `packages/wash_wallet_ui/lib/src/components/sheet/adaptive_sheet.dart`

Buat widget/function `showAdaptiveSheet`:

1. Pada `compact`: tampilkan sebagai `AppBottomSheet` (modal bottom sheet).
2. Pada `medium`/`expanded`/`large`: tampilkan sebagai `AppDialog` dengan `maxWidth` (misalnya 560 dp) agar tidak membentang terlalu lebar.
3. API mirip `showAppBottomSheet` yang sudah ada, hanya menambah logic adaptive.

#### 1.7 [MODIFY] `packages/wash_wallet_ui/lib/wash_wallet_ui.dart`

Tambahkan export untuk semua file baru:

1. `export 'src/theme/responsive/app_breakpoints.dart';`
2. `export 'src/components/layout/adaptive_scaffold.dart';`
3. `export 'src/components/layout/responsive_layout.dart';`
4. `export 'src/components/layout/content_constraint.dart';`
5. `export 'src/components/layout/responsive_grid.dart';`
6. `export 'src/components/sheet/adaptive_sheet.dart';`

#### 1.8 Verifikasi Fase 1

1. `flutter analyze` pada `packages/wash_wallet_ui` → 0 error baru.
2. `flutter analyze` pada `apps/cashier`, `apps/customer`, `apps/production` → 0 error baru (backward-compatible).
3. Buat file test sederhana atau widget preview untuk memverifikasi breakpoint detection dan AdaptiveScaffold pada berbagai width.

---

### Fase 2: Adaptive Root Navigation Cashier

**Tujuan**: Mengganti `MainShellScreen` cashier agar memakai `AdaptiveScaffold` dari shared UI, sehingga navigation otomatis berubah dari bottom bar ke rail/sidebar sesuai lebar layar.

#### 2.1 [MODIFY] `apps/cashier/lib/core/navigation/main_shell_screen.dart`

Perubahan:

1. Ganti `Scaffold` + `AppBottomBar.navigation` dengan `AdaptiveScaffold` dari `wash_wallet_ui`.
2. Mapping 4 tab root (Home, Dana, Transaksi, Setting) ke `AdaptiveDestination` items.
3. `body` memakai `navigationShell` yang sudah ada.
4. Pastikan `currentIndex` dan `onDestinationSelected` terhubung ke `navigationShell.goBranch`.
5. Pertahankan `key: scaffoldKey` dan logic existing yang dibutuhkan.

#### 2.2 [MODIFY] `apps/cashier/lib/core/navigation/bottom_nav_helper.dart`

Perubahan:

1. Jika ada helper atau extension khusus bottom nav, sesuaikan agar kompatibel dengan `AdaptiveDestination` juga.
2. Jika helper hanya menyediakan item data, tidak perlu banyak perubahan.

#### 2.3 Verifikasi Fase 2

1. Jalankan cashier app pada emulator phone → bottom bar tampil normal.
2. Jalankan pada emulator tablet 7" portrait → navigation rail muncul di kiri.
3. Jalankan pada emulator tablet 10" landscape → navigation rail/drawer muncul.
4. Jalankan pada Chromebook/desktop window lebar → persistent drawer muncul.
5. Switching tab berfungsi normal pada semua mode.
6. `flutter analyze` → 0 error baru.

---

### Fase 3: Home Dashboard Adaptive

**Tujuan**: Membuat home screen cashier memanfaatkan layar lebar dengan grid layout untuk metric, quick action, dan banner.

#### 3.1 [MODIFY] `apps/cashier/lib/features/home/presentation/screens/home_screen.dart`

Perubahan:

1. Deteksi `WindowSizeClass` di build method.
2. Pada `compact`: pertahankan layout single column saat ini.
3. Pada `medium` dan ke atas:
   - Bungkus content area dengan `ContentConstraint` jika diperlukan.
   - New Order Banner tetap full width tapi dengan max width.
   - Transaction Reports Section: gunakan `ResponsiveGrid` agar metric card tampil 2–3 kolom.
   - Quick Actions Section: gunakan `ResponsiveGrid` agar action button tampil 3–4 kolom.
4. Pada `expanded`/`large`:
   - Pertimbangkan layout dua kolom utama:
     - Kolom kiri (lebih besar): metric reports, quick actions.
     - Kolom kanan (sidebar): new order banner/notification, recent activity, atau summary kasir.
   - Atau cukup grid yang lebih lebar dengan metric cards yang lebih informatif.

#### 3.2 [MODIFY] `apps/cashier/lib/features/home/presentation/sections/transaction_reports_section.dart`

Perubahan:

1. Ganti layout saat ini (kemungkinan `Column` atau `Wrap`) dengan `ResponsiveGrid`.
2. Metric card tetap memakai `AppCard` dari shared UI.
3. Pada layar lebar, metric card bisa menampilkan lebih banyak info (trend, sparkline placeholder) bila ruang cukup.

#### 3.3 [MODIFY] `apps/cashier/lib/features/home/presentation/sections/quick_actions_section.dart`

Perubahan:

1. Gunakan `ResponsiveGrid` agar tombol quick action tampil 2 kolom di phone, 3–4 kolom di tablet, 4–6 kolom di Chromebook.
2. Pastikan icon + label tidak terpotong pada density apapun.
3. Quick action button tetap memakai `AppButton` atau `AppCard` dari shared UI.

#### 3.4 Verifikasi Fase 3

1. Home screen rapi di phone portrait → single column, tidak ada perubahan visual.
2. Home screen di tablet portrait → metric dan quick action tampil grid 2–3 kolom.
3. Home screen di Chromebook landscape → grid lebar, sidebar bila diimplementasi, info density baik.
4. Tidak ada overflow atau clipping pada semua viewport.

---

### Fase 4: Order List Adaptive (Two-Pane)

**Tujuan**: Pada layar lebar, order list menampilkan list di kiri dan preview/detail di kanan (master-detail pattern).

#### 4.1 [MODIFY] `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`

Perubahan:

1. Deteksi `WindowSizeClass`.
2. Pada `compact`: pertahankan layout saat ini (full screen list + navigate ke detail).
3. Pada `medium` dan ke atas:
   - Bagi layar menjadi dua panel: list di kiri, detail/preview di kanan.
   - List panel: pertahankan search, filter chips, dan list card. Berikan fixed/proportional width (misal 360–400 dp atau 40% layar).
   - Detail panel: tampilkan `ShowOrderScreen` content (embedded, bukan navigasi baru) untuk order yang dipilih. Jika belum ada order yang dipilih, tampilkan `AppEmptyState` dengan pesan "Pilih order untuk melihat detail".
   - Saat user tap order card di list, update detail panel (bukan navigate ke screen baru).
4. FAB "Pesanan Baru" tetap ada pada kedua mode.
5. Filter chips tidak boleh overflow — gunakan horizontal scroll dengan proper padding.
6. Search bar dan filter tetap di atas list panel.

#### 4.2 Pertimbangan State Management

1. Jika order list dan detail saat ini memakai Cubit/Bloc terpisah, pastikan keduanya bisa hidup berdampingan dalam satu screen.
2. Tambahkan state `selectedOrderId` di order list Cubit atau buat local state di screen.
3. Detail panel subscribe ke detail order berdasarkan `selectedOrderId`.

#### 4.3 Verifikasi Fase 4

1. Phone: list → tap → navigate ke detail (behavior lama).
2. Tablet: list di kiri, tap → detail muncul di kanan tanpa navigasi.
3. Tidak ada overflow pada filter chips di semua viewport.
4. FAB terlihat jelas di kedua mode.
5. Empty state detail panel saat belum ada yang dipilih.

---

### Fase 5: Order Detail Adaptive

**Tujuan**: Order detail memanfaatkan layar lebar dengan layout multi-kolom — content utama di kiri, summary/actions di kanan.

#### 5.1 [MODIFY] `apps/cashier/lib/features/order/presentation/screens/show_order_screen.dart`

Perubahan:

1. Deteksi `WindowSizeClass`.
2. Pada `compact`: pertahankan single-column scroll saat ini.
3. Pada `medium` dan ke atas:
   - Layout dua kolom:
     - **Kolom kiri** (scrollable, ~60-65% width): customer card, item list, timeline, notes.
     - **Kolom kanan** (sticky/scrollable terpisah, ~35-40% width): financial summary card, payment status, action buttons (print, WhatsApp, accept/reject, timbang).
   - Kolom kanan bisa sticky (tidak ikut scroll kolom kiri) atau scroll terpisah.
4. Pada `expanded`/`large`:
   - Kolom kanan bisa lebih lebar dan menampilkan info tambahan.
   - Status badge dan payment badge ukuran sedikit lebih besar agar readable.
5. Pastikan saat dipakai sebagai embedded panel (dari order list two-pane), layout tetap berfungsi baik.
6. Ganti penggunaan raw `Container`, `Card`, `ElevatedButton` dengan `AppCard`, `AppButton` dari shared UI di screen ini.

#### 5.2 Verifikasi Fase 5

1. Phone: single column scroll, behavior tidak berubah.
2. Tablet: dua kolom — detail kiri, summary+actions kanan.
3. Actions (print, WA, accept/reject) mudah dijangkau di kanan pada tablet.
4. Tidak ada text clipping atau overlap pada badge status.

---

### Fase 6: Create & Review Order Adaptive

**Tujuan**: Flow pembuatan order (select customer, select service, input item, review) lebih ergonomic pada layar lebar.

#### 6.1 [MODIFY] `apps/cashier/lib/features/order/presentation/screens/select_customer_for_order_screen.dart`

Perubahan:

1. Pada layar lebar, customer list bisa tampil grid atau wider list card dengan lebih banyak info visible.
2. Search bar dan CTA tetap jelas.
3. Bungkus content dengan `ContentConstraint` agar tidak terlalu lebar.

#### 6.2 [MODIFY] `apps/cashier/lib/features/order/presentation/screens/select_laundry_service_for_order_screen.dart`

Perubahan:

1. Service list/grid lebih lebar pada tablet.
2. Gunakan `ResponsiveGrid` bila service ditampilkan sebagai card grid.

#### 6.3 [MODIFY] `apps/cashier/lib/features/order/presentation/screens/input_order_item_screen.dart`

Perubahan:

1. Pada layar lebar, form input item bisa tampil dua kolom:
   - Kolom kiri: field input (quantity, service, catatan).
   - Kolom kanan: preview item / ringkasan sementara.
2. CTA utama (tambah item / lanjut) tetap visible dan dominan.
3. Bungkus form fields dengan `ContentConstraint` pada layar sangat lebar.

#### 6.4 [MODIFY] `apps/cashier/lib/features/order/presentation/screens/review_order_screen.dart`

Perubahan:

1. Pada layar lebar, layout dua kolom:
   - Kolom kiri: daftar item order, catatan, customer info.
   - Kolom kanan: ringkasan harga, metode pembayaran, CTA (buat pesanan).
2. Price summary sticky di kanan pada layar lebar.
3. Ganti raw Material widget ke shared component bila ada.

#### 6.5 Verifikasi Fase 6

1. Phone: flow step-by-step tidak berubah.
2. Tablet: form lebih ergonomic, ringkasan visible bersamaan dengan input.
3. CTA utama visible tanpa scroll pada semua viewport.

---

### Fase 7: Weigh Order Adaptive

**Tujuan**: Screen timbang pesanan memanfaatkan layar lebar untuk menampilkan item, foto, catatan, dan price summary secara bersamaan.

#### 7.1 [MODIFY] `apps/cashier/lib/features/order/presentation/screens/weigh_order_screen.dart`

Perubahan:

1. Pada `compact`: pertahankan layout saat ini.
2. Pada `medium` dan ke atas:
   - Layout dua kolom:
     - **Kolom kiri**: daftar item dengan correction control (quantity, berat), service selection, notes input, photo attachment.
     - **Kolom kanan**: price summary card (sticky), customer info ringkas, CTA (simpan timbangan).
3. Pada `expanded`/`large`:
   - Photo preview bisa lebih besar.
   - Item list bisa lebih detail.
4. Ganti raw Material widget ke shared component bila ada.

#### 7.2 Verifikasi Fase 7

1. Phone: single column, behavior sama.
2. Tablet: item+input kiri, summary kanan.
3. Photo attachment dan catatan berfungsi pada semua viewport.

---

### Fase 8: Finance Overview Adaptive

**Tujuan**: Finance screen lebih operational dan memanfaatkan layar lebar. Kurangi gradient dekoratif, tambah grid layout.

#### 8.1 [MODIFY] `apps/cashier/lib/features/finances/presentation/screens/index_finances_screen.dart`

Perubahan:

1. **Kurangi gradient hero header**:
   - Ganti gradient besar dengan header yang lebih compact dan operational.
   - Gunakan `AppCard` untuk balance summary, bukan custom gradient container.
   - Warna header tetap memakai `AppColors` (teal primary), tapi tidak gradient penuh.
2. **Menu card layout**:
   - Pada `compact`: stack vertikal tetap OK tapi dengan spacing dan card yang lebih clean.
   - Pada `medium` dan ke atas: gunakan `ResponsiveGrid` untuk menu card (Setoran Kasir, Petty Cash, Pengeluaran Outlet) tampil 2–3 kolom.
   - Pada `expanded`/`large`: grid + balance summary panel di samping atau di atas.
3. Ganti raw `Container`, `Card`, `BoxDecoration`, `LinearGradient`, dan custom color dengan shared component dan `AppColors`.
4. Pastikan dark mode masih berfungsi setelah penggantian gradient.

#### 8.2 Verifikasi Fase 8

1. Phone: finance screen terlihat lebih clean tapi tetap fungsional.
2. Tablet: grid layout untuk menu, header compact.
3. Dark mode finance screen OK.
4. Tidak ada custom color/gradient yang terlepas dari AppColors.

---

### Fase 9: Supporting Screens Adaptive

**Tujuan**: Customer list dan settings/printer cukup dibuatkan layout yang rapi pada layar lebar tanpa redesign besar.

#### 9.1 [MODIFY] `apps/cashier/lib/features/customer/presentation/screens/index_customers_screen.dart`

Perubahan:

1. Bungkus customer list dengan `ContentConstraint` pada layar lebar.
2. Customer card bisa tampil wider dengan lebih banyak info visible (nama, telepon, jumlah order) pada layar lebar.
3. Atau gunakan two-pane list+detail mirip order list jika scope memungkinkan (optional).

#### 9.2 [MODIFY] `apps/cashier/lib/features/setting/presentation/screens/index_setting_screen.dart`

Perubahan:

1. Bungkus setting list dengan `ContentConstraint` (max width ~720 dp).
2. Setting item card/tile tetap single column tapi centered, tidak membentang full width.

#### 9.3 [MODIFY] `apps/cashier/lib/features/setting/presentation/screens/printer_setting_screen.dart`

Perubahan:

1. Sama seperti setting: `ContentConstraint` untuk max width.
2. Printer list card centered pada layar lebar.

#### 9.4 Verifikasi Fase 9

1. Customer list rapi dan tidak terlalu lebar pada tablet.
2. Settings/printer centered dan profesional pada layar lebar.
3. Phone layout tidak berubah.

---

### Fase 10: Modal & Bottom Sheet Constraint

**Tujuan**: Semua bottom sheet dan dialog tidak membentang full width pada tablet/Chromebook.

#### 10.1 Penerapan `showAdaptiveSheet`

Perubahan di seluruh cashier app:

1. Cari semua penggunaan `showAppBottomSheet`, `showModalBottomSheet`, atau sejenisnya di `apps/cashier`.
2. Ganti dengan `showAdaptiveSheet` dari shared UI (dibuat di Fase 1).
3. Pada phone: tetap bottom sheet.
4. Pada tablet/Chromebook: menjadi dialog dengan max width (~560 dp).

#### 10.2 Dialog Max Width

1. Cari penggunaan `showDialog` atau `AppDialog` di cashier app.
2. Pastikan semua dialog punya `constraints: BoxConstraints(maxWidth: 560)` atau serupa.
3. Jika `AppDialog` belum punya parameter constraint, tambahkan ke shared component.

#### 10.3 Verifikasi Fase 10

1. Buka bottom sheet (print, WA, filter, dll) pada tablet → tampil sebagai dialog centered dengan max width.
2. Phone: tetap bottom sheet normal.
3. Dialog tidak overflow atau terlalu sempit.

---

### Fase 11: Visual Polish & Consistency Pass

**Tujuan**: Review dan bersihkan inkonsistensi visual di screen prioritas.

#### 11.1 Audit Penggunaan Raw Material Widget

Cek dan ganti di screen yang sudah dimodifikasi (Fase 3-9):

1. Raw `Card` → `AppCard`.
2. Raw `ElevatedButton` / `TextButton` / `OutlinedButton` → `AppButton`.
3. Raw `SnackBar` → `AppSnackbar`.
4. Raw `Container` dengan hardcoded color → gunakan `AppColors`.
5. Raw `BoxDecoration` dengan hardcoded gradient → minimalisir atau gunakan `AppColors` gradient bila tetap dibutuhkan.
6. Custom `TextStyle` dengan hardcoded font size/color → `SemanticTypography`.

#### 11.2 Status Badge Readability

1. Pastikan `OrderStatusBadge` dan `PaymentStatusBadge` memiliki ukuran minimum yang readable pada tablet.
2. Jika badge terlalu kecil pada layar besar, pertimbangkan parameter size di shared component.

#### 11.3 CTA Visibility

1. Di setiap screen prioritas, pastikan CTA utama (buat pesanan, simpan, bayar, print) terlihat dominan tanpa scroll.
2. Gunakan `AppButton` primary untuk CTA utama dan secondary/tertiary untuk action lain.

#### 11.4 Verifikasi Fase 11

1. Tidak ada raw Material widget yang seharusnya diganti di screen prioritas.
2. Badge status readable pada semua viewport.
3. CTA utama visible tanpa scroll pada layar besar.
4. `flutter analyze` → 0 error atau warning baru pada seluruh workspace.

---

### Fase 12: Screenshot Capture Strategy & Execution

**Tujuan**: Menghasilkan screenshot kandidat untuk Play Store upload.

#### 12.1 Target Viewport & Resolution

| Kategori | Orientation | Resolution (px) | DPR | Viewport (dp) | Rasio |
|---|---|---|---|---|---|
| 7" Tablet | Portrait | 1200 × 1920 | 2.0 | 600 × 960 | 9:16 |
| 7" Tablet | Landscape | 1920 × 1200 | 2.0 | 960 × 600 | 16:9 |
| 10" Tablet | Portrait | 1600 × 2560 | 2.0 | 800 × 1280 | 9:16 |
| 10" Tablet | Landscape | 2560 × 1600 | 2.0 | 1280 × 800 | 16:9 |
| Chromebook | Landscape | 1920 × 1080 | 1.0 | 1920 × 1080 | 16:9 |
| Android XR | Landscape | 1920 × 1080 | 1.0–2.0 | TBD (verify) | 16:9 (verify) |

**Catatan Android XR**: Constraint dalam brief user (rasio 16:9 / 9:16, sisi 720–7680 px, max 15 MB) perlu diverifikasi ulang dengan Play Console aktual atau dokumentasi resmi `https://support.google.com/googleplay/android-developer/answer/9866151` sebelum capture final. Ini adalah **open risk**.

#### 12.2 Screenshot Scenario (8 screenshot per kategori)

| No | Screen | Scenario | Data Demo |
|---|---|---|---|
| 1 | Home Dashboard | Shift aktif, 3 order baru, metric revenue/order hari ini, quick actions visible | Employee: "Dian Pratama", Outlet: "WashWallet Laundry Cikini" |
| 2 | Order List | 8+ order dengan variasi status (requested, received, ready_to_process, completed), search visible, filter chip aktif | Nama customer demo, status bervariasi |
| 3 | Order Detail | Detail order completed/ready_to_process, customer card, 3 item, timeline 4 step, financial summary, CTA print | Customer: "Ahmad Fauzi", Order: #WW-20260627-001 |
| 4 | Order Detail (Two-Pane) | Khusus tablet landscape/Chromebook: list di kiri, detail di kanan | Sama dengan No 2 + No 3 |
| 5 | Create/Review Order | Review order screen dengan 2-3 item, ringkasan harga, metode pembayaran, CTA Buat Pesanan | Item: "Cuci Setrika 3.5 kg", "Dry Clean Jas" |
| 6 | Weigh Order | Item correction view, quantity field, price summary di samping, notes dan photo | Order: #WW-20260627-002 |
| 7 | Finance Overview | Setoran Kasir, Petty Cash, Pengeluaran tampil grid, balance summary visible | Balance demo: Rp 2.450.000 |
| 8 | Customer / Print Modal | Customer list atau print receipt modal sebagai supporting feature | Customer list 10+ entry |

Untuk kategori yang hanya butuh 4 screenshot minimum, prioritaskan No 1, 2/4, 3, 5.

#### 12.3 Data Demo

1. Gunakan staging environment atau local seeded database dengan data demo.
2. Pastikan data tidak berisi nama/telepon/alamat real customer.
3. Gunakan nama outlet demo: "WashWallet Laundry Cikini" atau serupa.
4. Gunakan employee demo: "Dian Pratama" (kasir).
5. Pastikan status order bervariasi agar badge terlihat.
6. Jika belum ada seeder data demo, buat script seeder sederhana atau set up manual di staging.

#### 12.4 Metode Capture

Opsi yang direkomendasikan (pilih berdasarkan ketersediaan):

**Opsi A: Flutter Integration Test + Screenshot** (Direkomendasikan)
1. Buat integration test di `apps/cashier/integration_test/screenshots/` yang:
   - Navigate ke setiap screen target.
   - Set up demo data melalui mock atau seeded state.
   - Capture screenshot dengan `IntegrationTestWidgetsFlutterBinding.takeScreenshot()`.
2. Jalankan pada emulator dengan resolution target.
3. Output file otomatis di folder tertentu.

**Opsi B: Manual Capture dari Emulator**
1. Jalankan cashier app pada emulator dengan resolution target.
2. Navigate manual ke setiap screen.
3. Capture via emulator screenshot tool (Ctrl+S pada Android Emulator).
4. Rename file sesuai naming convention.

**Opsi C: Flutter Desktop/Web untuk Chromebook**
1. Jalankan `flutter run -d chrome` atau `flutter run -d windows` dengan window size sesuai target.
2. Capture screenshot.
3. Perlu pastikan semua plugin/dependency kompatibel.

#### 12.5 Screenshot File Convention

Format nama file:
```
{kategori}_{nomor}_{screen}_{orientation}.png
```

Contoh:
```
tablet7_01_home_dashboard_portrait.png
tablet7_02_order_list_portrait.png
tablet10_01_home_dashboard_landscape.png
chromebook_01_home_dashboard_landscape.png
xr_01_home_dashboard_landscape.png
```

Folder output: `apps/cashier/screenshots/play_store/`

#### 12.6 Post-Capture Validation

Sebelum dianggap siap upload:

1. Cek setiap file:
   - Format: PNG atau JPEG.
   - File size ≤ 8 MB (≤ 15 MB untuk XR sesuai brief user).
   - Pixel dimension sesuai constraint per kategori (lihat tabel 12.1).
   - Rasio 16:9 atau 9:16.
2. Cek visual:
   - Tidak ada debug banner (`--release` mode atau `debugShowCheckedModeBanner: false`).
   - Tidak ada data sensitif.
   - Tidak ada error/loading/empty state yang tidak diinginkan.
   - Tidak ada overflow, clipped text, atau layout patah.
   - Status badge dan payment badge terbaca.
3. Buat checklist file per kategori.

#### 12.7 Verifikasi Fase 12

1. Minimal 4 screenshot per kategori yang lulus semua validasi.
2. Ideal 6–8 screenshot per kategori.
3. Screenshot menceritakan workflow cashier yang nyata.
4. File naming konsisten.

---

## 8. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Android XR constraint berbeda dengan brief user | Screenshot ditolak Play Console | Verifikasi ulang constraint di Play Console aktual atau dokumentasi resmi sebelum capture final. Treat sebagai open risk. |
| Perubahan `AppLayout` / shared UI mempengaruhi app lain (customer, production) | App lain broken | Semua perubahan shared UI additive (file baru), bukan modifikasi existing. `AppLayout` existing tidak diubah. Cek compile semua app setelah Fase 1. |
| Two-pane order list membutuhkan refactor state management | Scope membesar, timeline molor | Mulai dengan versi sederhana (selected order ID di local state). Jika refactor Cubit terlalu besar, fallback ke ContentConstraint saja. |
| Data demo tidak siap | Screenshot kosong/tidak realistis | Siapkan seeder script atau manual data entry sebelum screenshot capture. Jangan screenshot di akhir tanpa data. |
| AdaptiveScaffold terlalu complex | Bug navigasi, edge case | Gunakan Flutter `NavigationRail` dan `NavigationDrawer` bawaan Material 3 sebagai basis, bukan build from scratch. Test per size class. |
| Finance screen gradient removal mengubah visual identity | Owner merasa berbeda | Tetap gunakan warna teal primary di header. Hanya kurangi gradient besar, tidak hilangkan identitas warna. |
| Phone layout rusak setelah perubahan | Regresi di device utama cashier | Verifikasi phone portrait di setiap fase. Gunakan `ResponsiveLayout` dengan fallback ke layout existing. |
| Printer/FCM/realtime tidak tersedia saat screenshot | Error muncul di screenshot | Gunakan release mode. Mock atau pastikan screen bisa render tanpa koneksi printer. Hindari screen yang butuh realtime data aktif untuk screenshot. |

## 9. Acceptance Criteria

### 9.1 Visual dan Responsive

1. Cashier app tetap memakai `AppTheme.light()` dan `AppTheme.dark()` dari `wash_wallet_ui`.
2. Perubahan reusable (breakpoint, adaptive scaffold, responsive grid, adaptive sheet, content constraint) ada di `packages/wash_wallet_ui`.
3. Home, order list, order detail, create/review order, weigh order, finance, dan minimal 1 supporting screen (customer atau setting) terlihat rapi pada tablet 7", tablet 10", Chromebook landscape, dan Android XR.
4. Pada viewport ≥ 600 dp, UI tidak terlihat seperti phone layout yang hanya diperbesar.
5. Navigation berubah dari bottom bar ke rail/sidebar pada viewport ≥ 600 dp.
6. Tidak ada horizontal overflow, clipped text, layout overlap, atau CTA keluar layar pada target viewport.
7. Modal/bottom sheet tidak membentang full width di tablet/Chromebook (max ~560 dp).
8. `OrderStatusBadge` dan `PaymentStatusBadge` terbaca jelas pada semua viewport.
9. CTA utama pada setiap screen mudah ditemukan tanpa scroll pada layar besar.
10. Phone portrait tetap usable dan tidak ada regresi visual setelah perubahan.

### 9.2 Play Store Screenshot Readiness

1. 7-inch tablet: 4–8 screenshot, PNG/JPEG, ≤ 8 MB, 16:9 atau 9:16, sisi 320–3840 px.
2. 10-inch tablet: 4–8 screenshot, PNG/JPEG, ≤ 8 MB, 16:9 atau 9:16, sisi 1080–7680 px.
3. Chromebook: 4–8 screenshot, PNG/JPEG, ≤ 8 MB, 16:9 atau 9:16, sisi 1080–7680 px.
4. Android XR: 4–8 screenshot sesuai constraint terverifikasi (lihat open risk section 12.1).
5. Tidak ada debug banner di screenshot.
6. Tidak ada data sensitif di screenshot.
7. Data demo realistis menunjukkan fitur inti POS cashier.
8. Tidak ada error, loading, atau empty state yang tidak diinginkan.
9. File lulus pengecekan pixel, rasio, dan size sebelum upload.

### 9.3 Quality Check

1. `flutter analyze` pada `packages/wash_wallet_ui` dan `apps/cashier` → 0 error atau warning baru.
2. `flutter analyze` pada `apps/customer` dan `apps/production` → 0 error baru (backward compatibility).
3. Verifikasi visual manual atau screenshot pada minimal 4 viewport: phone portrait, tablet 7" portrait, tablet 10" landscape, Chromebook landscape.
4. Jika screenshot tooling dibuat (integration test), output deterministic dan repeatable.

## 10. Open Questions untuk Owner

1. **Orientasi screenshot utama**: Apakah tablet screenshot lebih diutamakan portrait (9:16), landscape (16:9), atau keduanya? keduanya
2. **Chromebook & XR orientation**: Apakah semua screenshot Chromebook dan Android XR landscape 16:9? iyaaa
3. **Metode capture**: Apakah screenshot diambil dari emulator Android, Flutter desktop window, atau automation test? manual emulator
4. **Data demo**: Apakah sudah ada staging account dan seeded data khusus untuk screenshot? Atau perlu dibuat baru? belum ada, mungkin perlu dibuat baru
5. **Android XR constraint**: Apakah mengikuti brief user atau constraint terbaru Play Console bila berbeda? mengikuti constraint terbaru Play Console
6. **Adaptive navigation**: Bolehkah menambah `NavigationRail` dan `NavigationDrawer` sebagai shared component baru di `wash_wallet_ui`? boleh, tolong tambahkan
7. **Scope visual**: Apakah scope visual boleh menyentuh semua screen prioritas atau hanya screen yang akan diambil screenshot-nya? screen prioritas saja, tapi jika ada inkonsistensi visual di screen lain, boleh diperbaiki juga

## 11. Catatan untuk Pelaksana (AI Model Lain)

1. **Mulai dari Fase 1** (shared UI foundation) sebelum menyentuh screen cashier manapun. Semua screen bergantung pada breakpoint dan responsive utility.
2. **Jangan ubah `AppLayout` existing**. Buat widget baru (`AdaptiveScaffold`, `ResponsiveLayout`, `ContentConstraint`, `ResponsiveGrid`) agar backward-compatible.
3. **Jangan ubah business logic, Cubit state, API call, atau routing** kecuali memang dibutuhkan untuk layout dan dijelaskan di perubahan.
4. **Gunakan `AppColors`, `SemanticTypography`, `SpacingValues`** dari shared UI. Jangan hardcode warna, font size, atau spacing.
5. **Test per fase**. Setelah setiap fase, pastikan `flutter analyze` clean dan UI tidak rusak di phone portrait.
6. **Verifikasi Android XR constraint** sebelum Fase 12. Buka `https://support.google.com/googleplay/android-developer/answer/9866151` dan catat constraint terbaru.
7. **Finance screen**: kurangi gradient dekoratif tapi jangan hilangkan identitas teal. Ganti ke `AppCard` + `AppColors`.
8. **Order list two-pane**: jika refactor state management terlalu besar, boleh fallback ke `ContentConstraint` saja dan skip two-pane. Catat decision ini.
9. **Screenshot data demo**: siapkan data sebelum capture. Jangan screenshot empty state atau error state untuk store listing.
10. **Debug banner**: pastikan `debugShowCheckedModeBanner: false` atau jalankan dalam release mode saat screenshot.
11. **Backward compatibility**: setelah setiap perubahan di `wash_wallet_ui`, jalankan `flutter analyze` pada customer app dan production app juga.
12. **Pisahkan commit**: buat commit terpisah per fase agar mudah di-revert jika ada issue.

## 12. Urutan Prioritas Jika Scope Perlu Dikurangi

Jika waktu atau resource terbatas, prioritaskan dalam urutan berikut:

1. **Wajib**: Fase 1 (responsive foundation) + Fase 2 (adaptive navigation) + Fase 10 (modal constraint).
2. **Prioritas tinggi**: Fase 3 (home) + Fase 4 (order list) + Fase 5 (order detail) + Fase 12 (screenshot).
3. **Prioritas sedang**: Fase 6 (create/review order) + Fase 7 (weigh order) + Fase 8 (finance).
4. **Prioritas rendah**: Fase 9 (supporting screens) + Fase 11 (visual polish pass).

Fase 12 (screenshot) bisa dimulai segera setelah Fase 1-5 selesai, sambil mengerjakan fase lain secara paralel.

## 13. Referensi

1. `docs/user_need/cashier_play_store_large_screen_user_need.md` — User need lengkap.
2. `docs/context/theme_shared_ui_redesign_context.md` — Konteks shared UI dan gap analysis.
3. `docs/context/cashier_app_ux_redesign_blueprint.md` — Visual design direction dan screen analysis.
4. `docs/plan/theme_shared_ui_redesign_plan.md` — Plan terkait shared UI redesign.
5. `docs/plan/cashier_home_screen_redesign_plan.md` — Plan terkait home screen redesign.
6. `docs/plan/google_play_release_preparation_plan.md` — Plan terkait Google Play preparation.
7. `https://support.google.com/googleplay/android-developer/answer/9866151` — Google Play screenshot requirements (verifikasi ulang sebelum capture).
8. Material Design Adaptive Layout: `https://m3.material.io/foundations/layout/applying-layout/window-size-classes` — Referensi breakpoint.
