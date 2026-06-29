# User Need: Tampilan Tablet, Chromebook, dan Android XR untuk Play Store Cashier App

Tanggal: 2026-06-27

Dokumen ini menjadi acuan user need untuk AI model lain saat menyusun implementation plan. Fokus dokumen ini adalah kebutuhan pengguna, konteks codebase saat ini, batasan visual, kebutuhan screenshot Play Store, dan acceptance criteria. Dokumen ini bukan implementation plan dan tidak berisi urutan teknis final.

## 1. Latar Belakang

WashWallet Cashier App perlu disiapkan agar tampil layak untuk materi Google Play pada kategori layar besar: tablet 7-inch, tablet 10-inch, Chromebook, dan Android XR. Kebutuhan ini bukan sekadar membuat screenshot dengan ukuran file yang benar. UI aplikasi cashier harus benar-benar terlihat rapi, modern, dan usable pada layar yang lebih besar.

Saat ini cashier app sudah punya fondasi produk yang cukup kuat: POS laundry, dashboard kasir, order list, order detail, flow buat transaksi, timbang pesanan, printer, WhatsApp notification, customer management, dan dana outlet. Namun banyak screen masih mobile-first satu kolom. Pada tablet, Chromebook, atau layar landscape, tampilan seperti ini berisiko terlihat terlalu melebar, kosong, kurang profesional, atau tidak memanfaatkan ruang layar.

User mengharapkan improvement tampilan agar lebih bagus dan modern, tetapi tetap menggunakan shared UI dan color theme yang sudah ada. Artinya, perubahan visual harus memperkuat `packages/wash_wallet_ui`, bukan membuat gaya baru yang terpisah di feature cashier.

## 2. Tujuan

1. Menyiapkan WashWallet Cashier App agar tampil profesional pada screenshot Play Store untuk 7-inch tablet, 10-inch tablet, Chromebook, dan Android XR.
2. Membuat pengalaman layar besar yang benar-benar adaptive, bukan hanya mobile layout yang melebar.
3. Mempertahankan shared UI, typography, color theme, spacing, radius, badge, button, card, loading, empty, error, bottom sheet, dan layout system yang sudah ada.
4. Meningkatkan visual polish cashier app dengan arah "clean operasional": modern, padat, mudah dipindai, tidak dekoratif berlebihan.
5. Menjaga flow bisnis cashier tetap sama: order, customer, finance, print, notification, dan setting tidak berubah secara fungsional kecuali diperlukan untuk layout.
6. Menyediakan requirement yang cukup jelas agar model penyusun plan dapat menentukan perubahan responsive UI dan strategi screenshot capture.

## 3. Aktor dan Kebutuhan Pengguna

### 3.1 Cashier / Frontliner

Cashier membutuhkan UI yang cepat dipindai selama shift, terutama pada perangkat tablet outlet. Pada layar besar, cashier perlu melihat antrean order, status pembayaran, customer, item, dan CTA utama dengan lebih jelas tanpa harus scroll berlebihan.

Kebutuhan utama:

1. Melihat dashboard operasional dan order urgent dengan cepat.
2. Membuka list order dan detail order dengan minim perpindahan layar saat ruang layar memungkinkan.
3. Membuat transaksi walk-in dengan alur yang tetap jelas pada tablet.
4. Menimbang pesanan dengan kontrol item, foto, catatan, dan ringkasan harga yang mudah dibaca.
5. Mengakses print, WhatsApp, customer, dan finance tanpa UI terasa sempit atau berantakan.

### 3.2 Owner / Reviewer Play Store

Owner atau reviewer Play Store perlu melihat bahwa aplikasi adalah POS laundry yang nyata, bukan tampilan kosong atau mobile app yang dipaksa masuk kategori tablet.

Kebutuhan utama:

1. Screenshot menunjukkan fitur inti cashier secara jelas.
2. Screenshot tidak menampilkan data sensitif real customer/outlet.
3. Screenshot tidak menampilkan error, placeholder, debug banner, layout patah, overflow, atau UI kosong.
4. Tampilan terlihat konsisten dengan brand WashWallet dan cukup modern untuk store listing.

### 3.3 AI Model Penyusun Plan

AI model lain membutuhkan konteks codebase dan batasan produk agar bisa menyusun plan yang realistis.

Kebutuhan utama:

1. Mengetahui file dan area UI yang relevan.
2. Mengetahui bahwa perubahan harus melalui shared UI bila reusable.
3. Mengetahui kategori screenshot dan constraint Play Store yang diberikan user.
4. Mengetahui gap responsive UI saat ini.
5. Mengetahui acceptance criteria untuk visual, responsive, dan screenshot readiness.

## 4. Konteks Codebase Saat Ini

Hasil review codebase saat ini:

1. Repository adalah Flutter monorepo dengan app `apps/cashier`, `apps/customer`, `apps/production`, dan package shared `wash_wallet_core`, `wash_wallet_domain`, `wash_wallet_data`, `wash_wallet_ui`.
2. Cashier app berada di `apps/cashier`.
3. Cashier app memakai `MaterialApp.router` dengan:
   - `theme: AppTheme.light()`
   - `darkTheme: AppTheme.dark()`
   - `themeMode: ThemeMode.system`
4. Theme dan komponen utama berasal dari `packages/wash_wallet_ui`.
5. `wash_wallet_ui` mengekspor komponen:
   - `AppLayout`
   - `AppHeader`
   - `AppBottomBar`
   - `AppCard`
   - `AppButton`
   - `AppTextField`
   - `AppDropdown`
   - `AppBadge`
   - `OrderStatusBadge`
   - `PaymentStatusBadge`
   - `AppChip`
   - `AppTabBar`
   - `AppBottomSheet`
   - `AppDialog`
   - `AppSnackbar`
   - `AppLoadingIndicator`
   - `AppEmptyState`
   - `AppErrorState`
6. Color system shared UI memakai primary teal/green dengan neutral background, semantic success, warning, error, dan info.
7. Cashier app mendeklarasikan font Satoshi di `apps/cashier/pubspec.yaml`.
8. Root navigation cashier memakai `StatefulShellRoute.indexedStack` dan `MainShellScreen`.
9. Root bottom navigation cashier saat ini berisi 4 item:
   - Home
   - Dana
   - Transaksi
   - Setting
10. Customer, kategori, layanan, service package, membership plan, dan beberapa screen lain dibuka melalui route sekunder, bukan sebagai tab root.
11. `MainShellScreen` selalu memakai `AppBottomBar.navigation`, termasuk pada layar lebar.
12. `AppLayout` saat ini membuat content memenuhi lebar layar (`SizedBox.expand`) dan belum terlihat punya breakpoint atau max content width untuk tablet/desktop.
13. Android manifest cashier tidak mengunci orientasi; activity menangani `screenSize` dan `smallestScreenSize`, sehingga tablet/large screen secara platform memungkinkan.
14. Tidak ditemukan tooling screenshot/golden khusus untuk Play Store large-screen assets pada area yang direview.

## 5. Screen dan Flow Cashier yang Relevan

Area UI utama yang perlu dipertimbangkan oleh plan:

1. Home dashboard
   - `apps/cashier/lib/features/home/presentation/screens/home_screen.dart`
   - Menampilkan employee info, transaction reports, quick actions, notification badge, dan new order banner.
2. Root navigation
   - `apps/cashier/lib/core/navigation/main_shell_screen.dart`
   - `apps/cashier/lib/core/navigation/bottom_nav_helper.dart`
   - Saat ini mobile-first dengan bottom bar.
3. Order list
   - `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`
   - Search, filter chips, list card, FAB pesanan baru.
4. Order detail
   - `apps/cashier/lib/features/order/presentation/screens/show_order_screen.dart`
   - Header, customer card, item list, timeline, financial summary, notes, action buttons, print, WhatsApp, accept/reject, timbang.
5. Create order / POS flow
   - `select_customer_for_order_screen.dart`
   - `select_laundry_service_for_order_screen.dart`
   - `input_order_item_screen.dart`
   - `review_order_screen.dart`
   - `success_order_screen.dart`
6. Weigh order
   - `apps/cashier/lib/features/order/presentation/screens/weigh_order_screen.dart`
   - Item correction, quantity, service selection, notes, photo, price summary.
7. Finance
   - `apps/cashier/lib/features/finances/presentation/screens/index_finances_screen.dart`
   - Entry untuk Setoran Kasir, Petty Cash, dan Pengeluaran Outlet.
8. Customer
   - `apps/cashier/lib/features/customer/presentation/screens/index_customers_screen.dart`
   - Customer list/search, create/edit/detail.
9. Settings and printer
   - `apps/cashier/lib/features/setting/presentation/screens/index_setting_screen.dart`
   - `printer_setting_screen.dart`
   - `setup_outlet_setting_screen.dart`

## 6. Gap Tampilan Saat Ini

Gap utama yang terlihat dari review:

1. Banyak screen masih satu kolom mobile-first.
2. Pada tablet/Chromebook, list dan detail berpotensi terlalu melebar atau terlalu kosong.
3. Root navigation selalu bottom bar, sehingga pada landscape/wide viewport bisa terasa seperti phone UI yang diperbesar.
4. Belum ada adaptive scaffold atau breakpoint policy di shared UI.
5. `AppLayout` belum menyediakan constraint lebar konten, content rail, atau multi-pane slot.
6. Modal, dialog, dan bottom sheet perlu dipastikan punya lebar maksimum pada tablet/desktop agar tidak membentang penuh.
7. Beberapa screen feature masih memakai `Card`, `SnackBar`, `ElevatedButton`, gradient, warna, dan shadow custom langsung, bukan selalu shared component.
8. Finance screen memakai gradient header dan stacked menu card yang terlihat mobile-oriented; perlu dipoles agar layar besar tetap operational, bukan hero/dekoratif.
9. Order list dan customer list memakai list card satu kolom; pada layar lebar bisa lebih baik jika ada two-pane, grid, atau table-like density sesuai kebutuhan.
10. Tidak ada bukti validasi visual untuk viewport 7-inch tablet, 10-inch tablet, Chromebook, atau Android XR.

## 7. Kebutuhan Play Store Screenshot

Kebutuhan screenshot yang diberikan user:

| Kategori | Jumlah | Format | Ukuran file | Rasio | Batas pixel |
| --- | --- | --- | --- | --- | --- |
| 7-inch tablet | Upload up to 8 screenshots | PNG atau JPEG | Maks 8 MB per file | 16:9 atau 9:16 | Setiap sisi 320 px sampai 3,840 px |
| 10-inch tablet | Upload up to 8 screenshots | PNG atau JPEG | Maks 8 MB per file | 16:9 atau 9:16 | Setiap sisi 1,080 px sampai 7,680 px |
| Chromebook | Upload 4-8 screenshots | PNG atau JPEG | Maks 8 MB per file | 16:9 atau 9:16 | Setiap sisi 1,080 px sampai 7,680 px |
| Android XR | Upload 4-8 screenshots | PNG atau JPEG | Maks 15 MB per file menurut brief user | 16:9 atau 9:16 menurut brief user | Setiap sisi 720 px sampai 7,680 px menurut brief user |

Catatan validasi:

1. User sudah memberikan constraint di atas dan constraint tersebut harus menjadi input utama plan.
2. Karena aturan Google Play bisa berubah, plan berikutnya harus memverifikasi lagi langsung di Play Console atau dokumentasi resmi tepat sebelum capture/upload final.
3. Pada pengecekan halaman bantuan resmi Google Play tanggal 2026-06-27, ada potensi perbedaan untuk kategori Android XR dibanding brief user. Dokumentasi resmi yang terlihat menyebut Android XR store listing screenshots dengan rasio dan batas berbeda. Penyusun plan harus memperlakukan ini sebagai open risk dan tidak mengabaikannya.
4. Referensi resmi untuk diverifikasi ulang: `https://support.google.com/googleplay/android-developer/answer/9866151`.

## 8. Kebutuhan Responsive dan Adaptive UI

Kebutuhan utama:

1. Cashier app harus tetap nyaman di phone portrait, tetapi screenshot target utama adalah tablet, Chromebook, dan XR.
2. Pada layar lebar, UI tidak boleh hanya membentang penuh tanpa struktur.
3. Root navigation perlu beradaptasi:
   - Bottom navigation tetap masuk akal untuk phone dan tablet sempit.
   - Pada width besar, plan perlu mempertimbangkan navigation rail, sidebar, compact drawer, atau adaptive shell berbasis shared UI.
4. Layout list/detail perlu beradaptasi:
   - Order list dapat memakai two-pane list + preview/detail saat width cukup.
   - Order detail dapat memakai content column + side summary/actions pada width besar.
   - Finance overview dapat memakai grid menu dan summary panel, bukan hanya stack vertikal.
   - Home dapat memakai grid/columns untuk metric, urgent queue, dan quick action.
5. Modal dan bottom sheet perlu constraint width:
   - Di phone tetap bottom sheet.
   - Di tablet/Chromebook dapat menjadi dialog/sheet dengan max width agar tidak terlalu lebar.
6. Form panjang perlu dibuat lebih ergonomic:
   - Field dapat dikelompokkan dalam 2 kolom pada width besar.
   - CTA utama tetap visible dan jelas.
   - Ringkasan harga/payment bisa sticky atau berada di side panel.
7. Status order/payment harus semakin jelas pada layar besar:
   - Badge tidak boleh terlalu kecil.
   - Filter chip tidak boleh overflow.
   - Copy status harus terbaca.
8. Text, icon, badge, button, dan card tidak boleh overlap pada semua target viewport.
9. Tidak boleh ada horizontal overflow atau clipped text pada screenshot target.
10. Safe area dan padding harus aman untuk Chromebook landscape dan Android XR landscape.

## 9. Kebutuhan Visual Modernisasi

Arah visual yang diminta:

1. Modern, rapi, dan profesional.
2. Tetap operational, bukan landing page atau marketing UI.
3. Tetap menggunakan shared UI dan color theme WashWallet.
4. Teal/green brand tetap menjadi primary color.
5. Gunakan semantic colors untuk status, bukan semua elemen diberi variasi teal.
6. Visual hierarchy harus lebih jelas:
   - CTA utama terlihat dominan.
   - Status penting terlihat cepat.
   - Secondary action tidak terlalu berisik.
   - Section tidak semuanya terasa setara.
7. Komponen harus terasa konsisten lintas screen.
8. Kurangi styling custom yang tidak berbasis token shared UI bila ada padanan shared component.
9. Gunakan density yang cocok untuk cashier:
   - Cukup padat untuk operasional.
   - Tidak terlalu kecil untuk tablet.
   - Tidak terlalu airy seperti landing page.
10. Hindari dekorasi yang tidak membantu workflow:
   - Gradient besar berlebihan.
   - Card bertumpuk dalam card.
   - Shadow berat.
   - Hero marketing.
   - Ilustrasi/dekorasi yang tidak menunjukkan produk.

## 10. Kebutuhan Shared UI

Perubahan reusable sebaiknya ditempatkan di `packages/wash_wallet_ui`.

Kebutuhan:

1. Shared UI tetap menjadi sumber utama layout, color, typography, spacing, radius, state, dan component behavior.
2. Jika dibutuhkan adaptive behavior, pertimbangkan helper/component shared seperti:
   - responsive breakpoint token,
   - adaptive layout wrapper,
   - max content width utility,
   - adaptive navigation shell,
   - adaptive dialog/bottom sheet wrapper,
   - responsive grid helper.
3. API shared component harus backward-compatible sebisa mungkin.
4. Feature screen cashier boleh diubah untuk memakai shared UI yang lebih baik, tetapi jangan membuat design system lokal baru.
5. Jika ada screen yang masih memakai raw `Card`, raw `SnackBar`, raw `ElevatedButton`, atau hardcoded color, plan perlu menentukan mana yang diganti ke shared component dalam scope ini.
6. Theme light/dark tetap berasal dari `AppTheme`.
7. Jangan mengubah business logic, endpoint API, Cubit state, atau routing utama kecuali memang dibutuhkan untuk layout dan dijelaskan eksplisit.

## 11. Screenshot Story yang Diharapkan

Screenshot Play Store sebaiknya menceritakan workflow cashier yang nyata, bukan hanya layar statis kosong.

Prioritas screenshot:

1. Home dashboard cashier
   - Menunjukkan ringkasan outlet, notification badge/banner, metric operasional, dan quick actions.
2. Order list / new order queue
   - Menunjukkan search, filter, status order, customer, dan list transaksi.
3. Order detail
   - Menunjukkan customer card, item, timeline, financial summary, status, dan CTA kontekstual.
4. Create order / review order
   - Menunjukkan POS workflow, cart/order summary, payment status, metode pembayaran, membership/deposit benefit jika ada.
5. Weigh order
   - Menunjukkan item correction, quantity, notes, photo, dan price summary.
6. Print / WhatsApp modal
   - Menunjukkan cashier action yang membedakan app POS laundry: cetak struk/label dan komunikasi customer.
7. Finance overview
   - Menunjukkan Setoran Kasir, Petty Cash, dan Expense outlet.
8. Customer or settings/printer
   - Menunjukkan customer management atau printer setting sebagai supporting feature.

Rekomendasi minimum per kategori:

1. 7-inch tablet: 4-8 screenshot, ideal 6-8 bila UI sudah siap.
2. 10-inch tablet: 4-8 screenshot, ideal 6-8 bila UI sudah siap.
3. Chromebook: 4-8 screenshot, minimal Home, Order list/detail, Create/Review, Finance.
4. Android XR: 4-8 screenshot, fokus landscape/wide readability, Home, Orders, Detail, Weigh/Finance.

Data dalam screenshot:

1. Gunakan demo/staging data yang realistis.
2. Jangan tampilkan data real customer, nomor telepon real, alamat real, token, API URL, atau informasi sensitif.
3. Hindari empty state untuk screenshot utama kecuali sengaja menampilkan kualitas empty state.
4. Hindari error, loading lama, snackbar gagal, permission prompt, dan koneksi printer gagal pada screenshot store listing.
5. Pastikan status order bervariasi agar badge/status terlihat: requested, received, ready_to_process, completed, partial/paid.

## 12. Scope Utama

Scope yang diharapkan untuk plan berikutnya:

1. Audit responsive cashier UI untuk target tablet 7-inch, tablet 10-inch, Chromebook, dan Android XR.
2. Perbaikan shared UI yang diperlukan untuk adaptive layout dan visual polish.
3. Perbaikan screen cashier prioritas untuk screenshot Play Store:
   - Home
   - Orders list
   - Order detail
   - Create/review order
   - Weigh order
   - Finance
   - Customer atau printer/setting
4. Menjaga phone layout tetap tidak rusak.
5. Menyiapkan strategy screenshot capture:
   - target viewport/resolution,
   - data demo,
   - scenario screen,
   - file format,
   - compression/size check,
   - naming convention.
6. Verifikasi visual minimal pada target viewport.

## 13. Di Luar Scope

Hal berikut tidak termasuk user need ini kecuali user memberi instruksi lanjutan:

1. Upload langsung ke Play Console.
2. Membuat feature graphic atau app icon.
3. Mengubah backend API.
4. Mengubah flow bisnis order, payment, timbang, printer, atau finance.
5. Redesign customer app atau production app.
6. Mengubah brand identity utama WashWallet.
7. Membuat landing page marketing di dalam aplikasi.
8. Mengubah distribusi Play Store public/private/unlisted.
9. Menyelesaikan seluruh screen cashier yang tidak masuk prioritas screenshot.

## 14. Acceptance Criteria

### 14.1 Visual dan Responsive

1. Cashier app tetap memakai `AppTheme.light()` dan `AppTheme.dark()` dari `wash_wallet_ui`.
2. Perubahan visual reusable masuk ke `packages/wash_wallet_ui` bila layak reusable.
3. Home, order list, order detail, create/review order, weigh order, finance, dan minimal satu supporting screen terlihat rapi pada tablet/wide viewport.
4. Pada wide viewport, UI tidak terlihat seperti phone layout yang hanya diperbesar.
5. Navigation pada wide viewport tidak terasa dipaksa memakai bottom bar penuh bila ada alternatif adaptive yang lebih sesuai.
6. Tidak ada horizontal overflow, clipped text, layout overlap, atau CTA keluar layar pada target screenshot.
7. Modal/bottom sheet tidak membentang terlalu lebar di tablet/Chromebook.
8. Status badge dan payment badge terbaca jelas.
9. CTA utama pada setiap screen tetap mudah ditemukan.
10. Phone portrait tetap usable setelah perubahan.

### 14.2 Play Store Screenshot Readiness

1. Untuk 7-inch tablet, tersedia kandidat screenshot sampai 8 file dalam format PNG/JPEG, masing-masing <= 8 MB, rasio 16:9 atau 9:16, dan sisi 320-3,840 px sesuai brief user.
2. Untuk 10-inch tablet, tersedia kandidat screenshot sampai 8 file dalam format PNG/JPEG, masing-masing <= 8 MB, rasio 16:9 atau 9:16, dan sisi 1,080-7,680 px sesuai brief user.
3. Untuk Chromebook, tersedia 4-8 kandidat screenshot dalam format PNG/JPEG, masing-masing <= 8 MB, rasio 16:9 atau 9:16, dan sisi 1,080-7,680 px sesuai brief user.
4. Untuk Android XR, tersedia 4-8 kandidat screenshot sesuai brief user, tetapi plan wajib memverifikasi ulang constraint final karena ada potensi perbedaan dokumentasi resmi.
5. Screenshot tidak menampilkan debug banner.
6. Screenshot tidak menampilkan data sensitif.
7. Screenshot menggunakan data demo yang realistis.
8. Screenshot menampilkan fitur inti POS cashier, bukan hanya login atau empty screen.
9. Screenshot final lulus pengecekan ukuran pixel, rasio, dan file size sebelum upload.

### 14.3 Quality Check

1. `flutter analyze` untuk cashier/shared UI tidak menambah error atau warning baru.
2. Jika plan mengubah shared UI, app lain yang memakai shared package tidak boleh broken secara compile.
3. Jika memungkinkan, lakukan visual verification manual atau screenshot untuk beberapa viewport.
4. Jika screenshot tooling dibuat, output file harus deterministic dan mudah diulang.

## 15. Risiko dan Catatan

1. Android XR requirement dalam brief user perlu diverifikasi ulang di Play Console atau dokumentasi resmi karena ada potensi perbedaan dari halaman resmi Google yang dicek.
2. Menambahkan adaptive layout bisa berdampak ke banyak screen bila langsung dilakukan global di `AppLayout`; plan perlu menjaga scope.
3. Jika data demo tidak siap, screenshot bisa terlihat kosong atau tidak menunjukkan value app.
4. Jika printer/realtime/FCM tidak tersedia di environment screenshot, screen harus tetap bisa menampilkan flow dengan data aman tanpa error yang muncul di screenshot.
5. Redesign yang terlalu dekoratif bisa membuat cashier app kurang cocok untuk operasional outlet.
6. Redesign yang hanya mengganti warna tidak akan menyelesaikan masalah tablet/Chromebook.
7. Perubahan shared UI bisa memengaruhi customer dan production app, sehingga plan harus membedakan perubahan shared yang aman dari perubahan spesifik cashier.

## 16. Open Questions untuk Penyusun Plan

1. Screenshot final lebih diutamakan portrait 9:16, landscape 16:9, atau keduanya untuk tablet?
2. Untuk Chromebook dan Android XR, apakah owner ingin semua screenshot landscape 16:9 agar sesuai ekspektasi layar lebar?
3. Apakah screenshot akan diambil dari emulator/device, web/desktop build, atau automation test?
4. Apakah sudah ada staging account dan seeded data khusus untuk screenshot?
5. Apakah Android XR mengikuti constraint brief user atau constraint terbaru Play Console bila berbeda?
6. Apakah adaptive navigation boleh menambahkan shared component baru seperti navigation rail/sidebar?
7. Apakah scope visual boleh menyentuh semua screen prioritas atau hanya screen yang masuk screenshot final?

## 17. Catatan untuk AI Model Penyusun Plan

Saat menyusun plan, prioritaskan:

1. Review ulang file cashier yang disebut dalam dokumen ini.
2. Tentukan breakpoint dan adaptive pattern sebelum menyentuh banyak screen.
3. Mulai dari shared UI jika perubahan akan dipakai di banyak screen.
4. Jangan membuat gaya visual baru yang lepas dari `wash_wallet_ui`.
5. Tetapkan daftar screenshot final lebih awal agar scope visual tidak melebar.
6. Buat verifikasi per viewport, minimal untuk:
   - phone portrait,
   - tablet portrait,
   - tablet landscape,
   - Chromebook landscape,
   - Android XR/wide landscape bila tooling mendukung.
7. Pisahkan pekerjaan visual/responsive dari pekerjaan screenshot capture.
8. Catat risiko jika requirement Android XR resmi berbeda dengan brief user.

## 18. Source Files Reviewed

File dan dokumen yang direview untuk menyusun user need ini:

1. `apps/cashier/pubspec.yaml`
2. `apps/cashier/lib/main.dart`
3. `apps/cashier/lib/core/router/app_router.dart`
4. `apps/cashier/lib/core/navigation/main_shell_screen.dart`
5. `apps/cashier/lib/core/navigation/bottom_nav_helper.dart`
6. `apps/cashier/lib/features/home/presentation/screens/home_screen.dart`
7. `apps/cashier/lib/features/home/presentation/sections/quick_actions_section.dart`
8. `apps/cashier/lib/features/home/presentation/sections/transaction_reports_section.dart`
9. `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`
10. `apps/cashier/lib/features/order/presentation/screens/show_order_screen.dart`
11. `apps/cashier/lib/features/finances/presentation/screens/index_finances_screen.dart`
12. `apps/cashier/lib/features/setting/presentation/screens/index_setting_screen.dart`
13. `apps/cashier/lib/features/customer/presentation/screens/index_customers_screen.dart`
14. `apps/cashier/android/app/src/main/AndroidManifest.xml`
15. `apps/cashier/android/app/build.gradle.kts`
16. `packages/wash_wallet_ui/lib/wash_wallet_ui.dart`
17. `packages/wash_wallet_ui/lib/src/theme/app_theme.dart`
18. `packages/wash_wallet_ui/lib/src/theme/color/app_colors.dart`
19. `packages/wash_wallet_ui/lib/src/theme/spacing/spacing_values.dart`
20. `packages/wash_wallet_ui/lib/src/theme/typography/semantic_typography.dart`
21. `packages/wash_wallet_ui/lib/src/components/layout/app_layout.dart`
22. `packages/wash_wallet_ui/lib/src/components/layout/app_bottom_bar/app_bottom_bar.dart`
23. `docs/context/play_store_upload_context.md`
24. `docs/context/google_play_store_listing_context.md`
25. `docs/context/cashier_app_portfolio_context.md`
26. `docs/context/cashier_app_ux_redesign_blueprint.md`
27. `docs/context/theme_shared_ui_redesign_context.md`

## Status

User need selesai disusun sebagai input untuk penyusunan implementation plan tampilan tablet, Chromebook, dan Android XR pada WashWallet Cashier App untuk kebutuhan Play Store.
