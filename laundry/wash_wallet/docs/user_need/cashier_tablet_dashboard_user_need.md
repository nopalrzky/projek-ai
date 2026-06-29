# User Need: Layout Tablet Dashboard Cashier App

Tanggal: 2026-06-27

Dokumen ini menjadi acuan user need untuk AI model lain saat menyusun implementation plan. Fokus dokumen ini adalah **layout dan struktur tampilan tablet Cashier App**, bukan penambahan data dashboard, bukan analytics baru, dan bukan perubahan flow bisnis.

Maksud utama: tampilan tablet cashier perlu terasa seperti aplikasi dashboard/POS profesional dengan sidebar, header, content area yang terstruktur, dan panel kerja yang rapi. Inspirasi boleh mengambil rasa layout dashboard owner web, tetapi konteksnya tetap Cashier App.

## 1. Latar Belakang

Cashier App saat ini sudah memiliki root navigation dan Home operasional, tetapi tampilan tablet masih perlu dibuat lebih matang secara layout. Pada tablet atau layar landscape, UI seharusnya tidak terasa seperti phone layout yang hanya diperbesar.

Yang diinginkan adalah layout aplikasi tablet yang lebih mirip dashboard:

1. Ada sidebar atau navigation rail yang stabil.
2. Ada header/top bar yang jelas.
3. Ada area konten utama yang tertata.
4. Ada panel/kartu dashboard yang tersusun dalam grid.
5. Ada hirarki visual antara area utama, shortcut, dan status.
6. Ada spacing dan width constraint yang nyaman untuk tablet.

Dokumen ini hanya menyusun kebutuhan. AI model lain nanti yang membuat implementation plan teknis.

## 2. Tujuan

1. Membuat Cashier App pada tablet terlihat seperti dashboard operasional modern.
2. Membuat layout tablet terasa sengaja dirancang, bukan hasil stretch dari phone UI.
3. Menyediakan struktur layout yang jelas: sidebar, header, main content, side panel bila perlu.
4. Menjaga style tetap konsisten dengan `wash_wallet_ui`, Material 3, dan theme WashWallet.
5. Menentukan area reusable widget/layout yang mungkin perlu dibuat.
6. Menjaga phone layout tetap aman dan tidak rusak.

## 3. Batasan Penting

Scope dokumen ini adalah **layout**.

Termasuk scope:

1. Sidebar/navigation rail tablet.
2. Header/top app bar tablet.
3. Dashboard canvas untuk Home.
4. Grid kartu dan panel.
5. Responsive behavior phone/tablet/large.
6. Reusable layout widget.
7. Visual hierarchy, spacing, width, density.

Tidak termasuk scope:

1. Menambah data API dashboard.
2. Membuat analytics baru.
3. Mengubah lifecycle order.
4. Mengubah logic pembayaran.
5. Mengubah backend.
6. Redesign semua screen cashier secara besar-besaran.
7. Meniru seluruh isi dashboard owner web.

Jika plan berikutnya merasa butuh data tambahan, itu harus dicatat sebagai optional follow-up, bukan inti kebutuhan ini.

## 4. Konteks Codebase Saat Ini

Hasil review codebase:

1. Cashier app berada di `apps/cashier`.
2. Root navigation memakai `StatefulShellRoute.indexedStack`.
3. Root shell berada di `apps/cashier/lib/core/navigation/main_shell_screen.dart`.
4. Root shell memakai `AdaptiveScaffold` dari `packages/wash_wallet_ui`.
5. `AdaptiveScaffold` saat ini:
   - memakai bottom navigation untuk compact width,
   - memakai `NavigationRail` untuk width medium ke atas,
   - bisa memakai rail extended pada width besar.
6. Root tab cashier saat ini:
   - Home,
   - Dana,
   - Transaksi,
   - Setting.
7. Home screen berada di `apps/cashier/lib/features/home/presentation/screens/home_screen.dart`.
8. Home saat ini berisi:
   - header,
   - employee card,
   - transaction summary card,
   - quick actions,
   - notification badge,
   - new order banner.
9. Order list sudah punya pola tablet two-pane:
   - list order di kiri,
   - detail order embedded di kanan.
10. Finance screen sudah punya layout responsive sederhana, tetapi visualnya masih terasa mobile-card.
11. Owner dashboard web sudah memiliki struktur dashboard kuat dengan header, KPI grid, action center, order funnel, dan feed. Yang perlu ditiru adalah **struktur layout**, bukan domain datanya.

Catatan: ada issue sebelumnya terkait `NavigationRail` extended assertion pada width besar. Plan perlu memastikan adaptive shell tablet valid sebelum memoles Home.

## 5. Masalah Layout Saat Ini

1. Home tablet belum punya dashboard canvas yang jelas.
2. Konten masih terasa seperti urutan section mobile.
3. Header belum terasa seperti top bar dashboard tablet.
4. Sidebar/navigation rail belum diperlakukan sebagai bagian desain utama.
5. Kartu-kartu Home belum punya struktur dashboard seperti top summary, main panel, dan side panel.
6. Quick actions masih berupa grid mobile, belum terasa seperti toolbar/shortcut panel tablet.
7. Pada width besar, area kosong atau lebar konten berpotensi kurang terkontrol.
8. Belum ada layout reusable khusus dashboard tablet.
9. Beberapa widget masih memakai custom container/gradient/shadow, belum sepenuhnya terasa satu design system.

## 6. Kebutuhan Layout Utama

### 6.1 App Shell Tablet

Pada tablet dan layar besar, aplikasi perlu memiliki shell seperti dashboard:

1. Sidebar atau navigation rail berada di sisi kiri.
2. Sidebar menampilkan root navigation:
   - Home,
   - Dana,
   - Transaksi,
   - Setting.
3. Untuk width medium, sidebar boleh compact icon rail.
4. Untuk width large, sidebar boleh extended rail dengan label.
5. Sidebar tidak boleh menyebabkan crash atau assertion.
6. Sidebar harus punya selected state yang jelas.
7. Sidebar tidak perlu drawer tambahan di root screen.
8. Bottom navigation tetap dipakai untuk phone compact.

### 6.2 Header / Top Bar

Tablet dashboard perlu header yang lebih dashboard-like.

Header sebaiknya berisi:

1. Judul screen, misalnya `Dashboard Kasir`.
2. Subtitle/konteks outlet atau shift.
3. Search/global shortcut optional jika berguna.
4. Notification icon dengan badge.
5. Switch employee button.
6. Refresh action.
7. Status kecil seperti printer/notifikasi jika cukup ruang.

Header harus:

1. Tingginya stabil.
2. Tidak terlalu hero besar.
3. Tidak memakai hamburger pada tablet root.
4. Punya alignment yang rapi dengan content grid.
5. Tetap usable di phone dengan versi compact.

### 6.3 Main Dashboard Canvas

Home tablet perlu canvas utama, bukan column mobile biasa.

Struktur yang diharapkan pada tablet landscape:

```text
+--------------------------------------------------------------+
| Sidebar | Header / Top Bar                                  |
|         +----------------------------------------------------+
|         | Main Dashboard Content                             |
|         |                                                    |
|         | +----------------------+ +-----------------------+ |
|         | | Primary Summary      | | Side Action Panel     | |
|         | | KPI / cash / status  | | quick actions/status  | |
|         | +----------------------+ +-----------------------+ |
|         |                                                    |
|         | +----------------------+ +-----------------------+ |
|         | | Order Status Panel   | | Recent/Urgent Panel   | |
|         | +----------------------+ +-----------------------+ |
+--------------------------------------------------------------+
```

Struktur yang diharapkan pada tablet portrait:

```text
+--------------------------------------+
| Sidebar/Rail | Header                |
|              +-----------------------+
|              | Summary grid          |
|              | Action panel          |
|              | Order/status panels   |
|              | Quick actions         |
+--------------------------------------+
```

Struktur phone tetap:

```text
Header
Summary
Status
Quick actions
Bottom navigation
```

### 6.4 Content Width dan Spacing

1. Konten tablet tidak boleh full-bleed tanpa constraint.
2. Gunakan max width atau dashboard container yang membuat konten tetap nyaman.
3. Grid gap harus konsisten dengan spacing token `wash_wallet_ui`.
4. Cards tidak boleh terlalu tinggi atau terlalu airy.
5. Text harus tetap terbaca dari jarak tablet outlet.
6. Button dan hit target harus nyaman untuk touch.
7. Hindari card di dalam card yang membuat visual berat.

### 6.5 Dashboard Panels

Home tablet sebaiknya memakai panel yang jelas.

Panel yang disarankan:

1. `Shift / Outlet Panel`
   - identitas kasir, outlet, status kerja.
2. `Cash / Transaction Summary Panel`
   - kas outlet dan ringkasan transaksi yang sudah ada.
3. `Order Status Panel`
   - status pesanan yang sudah ada, ditampilkan sebagai KPI cards.
4. `Quick Actions Panel`
   - shortcut kerja utama.
5. `Urgent / Notification Panel`
   - order baru/banner/status notifikasi jika ada.
6. `Device Status Panel`
   - printer/status device jika feasible.

Poin penting: panel bisa memakai data yang sudah ada dulu. Fokus utama adalah struktur layout dan visual hierarchy.

## 7. Kebutuhan Sidebar

Sidebar pada tablet harus terasa seperti bagian utama app, bukan fallback.

Kebutuhan:

1. Sidebar/rail berada permanen di kiri untuk tablet dan desktop width.
2. Tampilkan icon dan label jika width cukup.
3. Tampilkan hanya icon dengan tooltip/label ringkas jika width medium.
4. Selected item harus jelas.
5. Item root tetap empat:
   - Home,
   - Dana,
   - Transaksi,
   - Setting.
6. Jangan tampilkan drawer hamburger di root screen tablet.
7. Jangan membuat sidebar menutupi konten.
8. Jangan membuat sidebar terlalu dekoratif.
9. Sidebar boleh memiliki bagian bawah untuk logout/profile jika design system mendukung, tetapi bukan prioritas tahap pertama.

## 8. Kebutuhan Header

Header tablet perlu berbeda dari header mobile yang terlalu sederhana.

Kebutuhan:

1. Header berada di atas content area, setelah sidebar.
2. Header menampilkan konteks screen dan outlet.
3. Header action berada di kanan:
   - refresh,
   - switch employee,
   - notification.
4. Header bisa memiliki small status chips:
   - printer,
   - online/offline,
   - last updated.
5. Header harus tetap compact.
6. Header phone boleh tetap memakai versi sederhana.
7. Header reusable sebaiknya dibuat di shared UI atau cashier-specific layout.

## 9. Kebutuhan Home Dashboard Layout

Home tablet diharapkan berubah dari vertical mobile sections menjadi dashboard grid.

Rekomendasi susunan:

1. Top row:
   - greeting/context card,
   - cash summary card,
   - notification/device status card.
2. Middle row:
   - order status KPI cards,
   - quick actions panel.
3. Bottom row:
   - active/urgent order panel,
   - recent activity atau secondary summary.

Jika data existing terbatas, isi panel tetap boleh memakai:

1. employeeName,
2. employeePhone,
3. cashBalance,
4. ordersInProduction,
5. ordersNotPickedUp,
6. ordersPickedUp,
7. notification badge/new order banner.

Yang penting adalah layout tabletnya terlihat matang.

## 10. Kebutuhan Quick Actions

Quick actions pada tablet tidak harus berupa grid mobile besar.

Kebutuhan:

1. Bisa menjadi panel samping.
2. Bisa menjadi toolbar shortcut dengan icon dan label.
3. Prioritaskan tindakan:
   - Buat Transaksi,
   - Cek Pesanan,
   - Customer,
   - Setor Kas.
4. Hindari card besar yang membuat dashboard terlihat kosong.
5. Gunakan icon konsisten.
6. Label harus pendek.
7. Tap target tetap cukup besar.

## 11. Kebutuhan Reusable Layout / Widget

Plan berikutnya boleh mengusulkan widget reusable baru.

Reusable di `packages/wash_wallet_ui` jika generik:

1. `AdaptiveScaffold` improvement.
2. `DashboardShell` atau `AdaptiveDashboardScaffold`.
3. `DashboardHeader`.
4. `DashboardPanel`.
5. `DashboardMetricCard`.
6. `DashboardGrid`.
7. `SideActionPanel`.
8. `StatusChip`.

Cashier-specific di `apps/cashier` jika mengandung domain:

1. `CashierDashboardLayout`.
2. `CashierDashboardHeader`.
3. `CashierSummaryPanel`.
4. `CashierQuickActionPanel`.
5. `CashierOrderStatusGrid`.
6. `CashierDeviceStatusPanel`.

Aturan:

1. Jangan membuat gaya visual baru di luar design system.
2. Gunakan token spacing, radius, typography, color dari `wash_wallet_ui`.
3. Komponen shared harus aman untuk app customer dan production.
4. Jika hanya dipakai cashier, letakkan di app cashier dulu.

## 12. Visual Direction

Arah visual:

1. Clean operational dashboard.
2. Padat tapi tidak sesak.
3. Banyak ruang untuk scanning.
4. Dominan netral/surface dengan accent warna semantic.
5. Primary teal dipakai untuk aksi utama, bukan semua card.
6. Hindari gradient besar berlebihan.
7. Hindari hero marketing.
8. Hindari dekorasi tidak fungsional.
9. Hindari card terlalu rounded atau shadow berat.
10. Gunakan typography yang lebih kecil dan rapat di panel dashboard.

## 13. Responsive Behavior

Breakpoint behavior yang diharapkan:

1. Compact phone:
   - bottom navigation,
   - single column,
   - header sederhana.
2. Medium tablet:
   - compact navigation rail,
   - dashboard grid 2 kolom,
   - header dashboard compact.
3. Expanded tablet/landscape:
   - navigation rail lebih jelas,
   - dashboard grid 2 sampai 3 kolom,
   - side panel boleh muncul.
4. Large desktop/tablet wide:
   - extended navigation rail jika aman,
   - content max width,
   - dashboard panel tidak terlalu melebar.

Semua breakpoint harus bebas overflow.

## 14. Acceptance Criteria

1. Dokumen plan berikutnya fokus pada layout tablet cashier, bukan penambahan data dashboard.
2. Tablet Home memiliki struktur dashboard yang jelas:
   - sidebar/navigation rail,
   - header/top bar,
   - main dashboard canvas,
   - grid/panel content.
3. Root screen tablet tidak memakai drawer hamburger sebagai navigasi utama.
4. Sidebar selected state terlihat jelas.
5. Header tablet menampilkan konteks screen dan action kanan.
6. Home tablet tidak lagi terasa seperti phone column yang dilebarkan.
7. Phone layout tetap aman dan usable.
8. Layout tablet portrait dan landscape tidak overflow.
9. Reusable layout/widget yang diusulkan jelas lokasinya: shared UI atau cashier-specific.
10. Styling tetap memakai `wash_wallet_ui`.
11. Tidak ada perubahan flow bisnis order, payment, print, atau finance.
12. Tidak ada kewajiban menambah API/data baru untuk memenuhi tahap layout ini.

## 15. Verifikasi yang Diharapkan pada Plan

Plan implementasi berikutnya perlu memasukkan verifikasi:

1. Visual check phone portrait.
2. Visual check tablet portrait.
3. Visual check tablet landscape.
4. Visual check width besar dengan navigation rail extended.
5. Cek tidak ada overflow text/button/card.
6. Cek sidebar navigation berpindah tab dengan benar.
7. Cek header actions tetap bekerja:
   - switch employee,
   - notification,
   - refresh jika ada.
8. Cek Home pull-to-refresh tetap ada jika dipertahankan.
9. `flutter analyze` untuk cashier/shared UI bila disentuh.

## 16. Catatan untuk AI Penyusun Plan

Saat menyusun plan:

1. Mulai dari shell layout dan breakpoint.
2. Periksa `AdaptiveScaffold` lebih dulu.
3. Tentukan apakah perlu membuat `CashierDashboardLayout`.
4. Setelah shell jelas, baru susun Home dashboard canvas.
5. Jangan langsung membuat data contract baru.
6. Gunakan data existing sebagai isi awal dashboard.
7. Jika ada panel yang butuh data belum ada, isi sebagai optional/future enhancement.
8. Jangan mengubah owner dashboard web.
9. Jangan membuat layout seperti landing page.
10. Fokus pada rasa aplikasi tablet POS yang profesional.

## 17. Source Files Reviewed

File dan dokumen yang direview:

1. `apps/cashier/lib/core/router/app_router.dart`
2. `apps/cashier/lib/core/navigation/main_shell_screen.dart`
3. `apps/cashier/lib/core/navigation/bottom_nav_helper.dart`
4. `apps/cashier/lib/features/home/presentation/screens/home_screen.dart`
5. `apps/cashier/lib/features/home/presentation/sections/employee_info_section.dart`
6. `apps/cashier/lib/features/home/presentation/sections/transaction_reports_section.dart`
7. `apps/cashier/lib/features/home/presentation/sections/quick_actions_section.dart`
8. `apps/cashier/lib/features/home/presentation/widgets/transaction_summary_card.dart`
9. `apps/cashier/lib/features/home/presentation/widgets/new_order_banner.dart`
10. `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`
11. `apps/cashier/lib/features/finances/presentation/screens/index_finances_screen.dart`
12. `apps/cashier/lib/features/setting/presentation/screens/index_setting_screen.dart`
13. `packages/wash_wallet_ui/lib/src/components/layout/adaptive_scaffold.dart`
14. `packages/wash_wallet_ui/lib/src/components/layout/app_layout.dart`
15. `packages/wash_wallet_ui/lib/src/theme/responsive/app_breakpoints.dart`
16. `webapp/wash_wallet_be/resources/js/Pages/Dashboard/Index.tsx`
17. `webapp/wash_wallet_be/resources/js/Pages/Dashboard/Partials/DashboardHeader.tsx`
18. `webapp/wash_wallet_be/resources/js/Pages/Dashboard/Partials/KpiGrid.tsx`
19. `webapp/wash_wallet_be/resources/js/Pages/Dashboard/Partials/ActionCenter.tsx`
20. `webapp/wash_wallet_be/resources/js/Pages/Dashboard/Partials/OrderFunnel.tsx`
21. `docs/context/cashier_app_ux_redesign_blueprint.md`
22. `docs/context/home_screen_redesign_reccomendation.md`
23. `docs/user_need/cashier_play_store_large_screen_user_need.md`

## Status

User need selesai direvisi agar fokus pada layout tablet dashboard Cashier App: sidebar, header, dashboard canvas, responsive panel, dan reusable layout widgets.
