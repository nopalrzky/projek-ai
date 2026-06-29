# Context: Theme dan Shared UI Redesign WashWallet

Tanggal review: 2026-06-22

Dokumen ini adalah context brief untuk AI model lain yang akan menyusun plan improvement tampilan theme dan shared UI WashWallet. Fokus dokumen ini adalah kondisi saat ini, sinyal masalah visual, batasan redesign, area prioritas, dan pertanyaan desain yang perlu dikunci. Dokumen ini bukan implementation plan final.

## Ringkasan

WashWallet adalah monorepo Flutter dengan shared UI package internal di `packages/wash_wallet_ui`. Package ini dipakai lintas aplikasi:

- `apps/cashier`: app operasional kasir/front-office.
- `apps/production`: app operasional produksi/courier-related workflow.
- `apps/customer`: app customer-facing untuk discovery, order, checkout, wallet, dan profile.

Ketiga app memakai `AppTheme.light()` dan `AppTheme.dark()` dari `wash_wallet_ui`, sehingga perubahan pada theme dan shared components akan berdampak luas. Target redesign yang diinginkan adalah "clean operasional": modern, rapi, cepat dipindai, tidak terlalu dekoratif, dan tetap cocok untuk workflow laundry yang sering dipakai berulang sepanjang hari.

## Kondisi Shared UI Saat Ini

Shared UI diekspor melalui `packages/wash_wallet_ui/lib/wash_wallet_ui.dart`. Area utama yang tersedia:

- Theme: `AppTheme`, semantic colors, typography, spacing, radius, dan BuildContext extensions.
- Layout: `AppLayout`, `AppLayoutWithDrawer`, `AppHeader`, `AppBottomBar`.
- Input dan action: `AppButton`, `AppTextField`, `AppDropdown`.
- Content surfaces: `AppCard`, `AppListTile`, `AppDivider`.
- Feedback dan state: `AppSnackbar`, `AppDialog`, `AppBottomSheet`, `AppLoadingIndicator`, `AppEmptyState`, `AppErrorState`.
- Status/selection: `AppBadge`, `OrderStatusBadge`, `PaymentStatusBadge`, `AppChip`, `AppTabBar`.
- Navigation shell: drawer components dan bottom bar components.

Design system saat ini sudah cukup terstruktur. Komponen punya variant/size/style class sendiri, dan app memakai extension seperti `context.colors`, `context.typography`, `context.space`, dan `context.radius`.

## Token Visual Saat Ini

Color system:

- Primary brand saat ini berbasis teal: `teal600` untuk light mode dan `teal400` untuk dark mode.
- Neutral palette berbasis putih/abu/hitam dengan background light `neutral50`, surface `neutral0`, text primary `neutral900`.
- Semantic colors tersedia untuk success, warning, error, info, danger, revenue, expense, pending, completed, cancelled, low stock, dan out of stock.
- Dark semantic colors sudah ada, tetapi belum jelas apakah semua screen diuji konsisten di dark mode.

Typography:

- `AppFonts.fontFamily` mengarah ke `Satoshi`.
- Skala utama: display 32, headline 24/20/16, body 16/14/12, label 16/14/12, caption 11, price display 28.
- Ada negative letter spacing pada beberapa heading/token, misalnya `displayLarge`, `headlineLarge`, `headlineMedium`, `headlineSmall`, dan beberapa screen custom.
- Risiko penting: `Satoshi` terlihat dideklarasikan aktif di `apps/cashier/pubspec.yaml`, tetapi belum terlihat dideklarasikan aktif di `apps/customer/pubspec.yaml` dan `apps/production/pubspec.yaml`. Jika font tidak tersedia di app target, runtime bisa fallback ke font platform dan visual tidak konsisten.

Spacing dan radius:

- Spacing scale sederhana: 2, 4, 8, 12, 16, 24, 32.
- Radius scale sederhana: 0, 4, 8, 12, 16, 24, 32, full 999.
- Komponen dominan memakai radius 8-16. Card biasanya 12/16, chip/badge full pill, header/bottom bar cenderung datar.

Material theme:

- `useMaterial3: true` sudah aktif.
- `AppTheme.light()` dan `AppTheme.dark()` mengatur `ColorScheme`, scaffold background, app bar, card, divider, input decoration, button themes, bottom navigation, dialog, snackbar, FAB, chip, dan progress indicator.
- Banyak default Material theme memakai elevation rendah atau 0, border tipis, surface putih, dan radius 12.

## Kondisi Komponen Shared

### AppLayout dan AppHeader

- `AppLayout` membungkus `Scaffold`, drawer, header, bottom bar, FAB, padding, safe area, scrollable body, dan keyboard dismiss.
- Default background di `AppLayout` memakai `context.colors.surface`, bukan `context.colors.background`. Ini bisa membuat layar terasa terlalu putih/datar, terutama jika body juga memakai card putih.
- `AppHeader` berupa bar datar dengan tinggi standard 64, compact 56, large 96, transparent 64.
- Header standard memakai surface dan border bawah 1px dengan alpha. Visualnya utilitarian, tetapi masih terasa basic dan belum memberi hierarchy yang kuat.

### AppButton

- `AppButton` punya variant primary, secondary, outline, ghost, danger, success, icon-only.
- Implementasi memakai `Material` + `InkWell` + `Container`, bukan langsung Material button widgets.
- Ukuran tombol: 36, 44, 52, 60.
- Primary memakai teal solid, secondary memakai `primaryLight`, outline/ghost transparan.
- Belum ada token khusus untuk tonal/soft button, pressed depth, subtle shadow, icon alignment policy, atau loading width preservation selain spinner di center.

### AppCard

- `AppCard` punya variant surface, outlined, elevated, filled, danger, success.
- Style memakai `Container` + `BoxDecoration`, border optional, shadow ringan untuk elevated/surface.
- Card surface/elevated banyak tetap putih dengan border/shadow rendah. Dalam banyak screen operasional, ini bisa membuat hierarchy kurang kuat jika semua section menggunakan card yang mirip.
- `AppCard.info` saat ini memetakan ke variant `outlined`, bukan informasi warna khusus.

### AppTextField

- `AppTextField` membungkus `TextFormField` dan punya variant default, outlined, filled, danger, success, search.
- Filled memakai `surfaceVariant`, outlined/default transparan dengan border.
- Content padding relatif standar dan border radius mengikuti size.
- Search field default memakai icon `Icons.search`.
- Belum ada pola visual khusus untuk dense search/filter fields yang banyak dipakai pada list operasional.

### Badge, Chip, ListTile

- `AppBadge` mendukung solid, soft, outline. Badge pakai pill radius, height berdasarkan size, dan warna semantic.
- `AppChip` custom memakai height 32, pill, border, dan animated container. Ada pemakaian `withOpacity` lama di file ini.
- `AppListTile` punya variant default, order, service, customer, compact. Visual hover/selected sudah ada, tetapi hierarchy masih minimal: transparent base, selected teal light, border selected.
- Status badge dan filter chip merupakan area berdampak besar karena banyak dipakai di order, payment, discovery, dan list data.

### Bottom Bar dan Drawer

- `AppBottomBar` punya mode navigation, action, mixed, compact. Visual active icon memakai teal soft pill.
- Bottom bar memakai surface dan border top tipis. Belum ada treatment floating/tonal atau separation yang lebih modern.
- Drawer memakai width 280/72, surface background, selected teal light, item radius 8. Drawer cocok untuk struktur internal, tetapi untuk app operasional perlu dipastikan tidak bersaing dengan bottom navigation.

## Pemakaian Lintas App

Semua app memakai `wash_wallet_ui`, tetapi tingkat custom styling per screen berbeda.

Cashier:

- Banyak screen memakai `AppLayout`, `AppHeader`, `AppCard`, `AppButton`, `AppTextField`.
- App cashier mendeklarasikan font Satoshi di pubspec.
- Konteks produk: app operasional kasir. UI perlu dense, cepat dipindai, CTA jelas, status order/payment sangat terbaca, dan minim dekorasi.

Production:

- Memakai shared theme dan banyak shared components untuk dashboard produksi, order pickup, print, notification, no permission, dan auth.
- Beberapa screen/widget custom memakai gradient, shadow, dan `AppColors` langsung.
- Ada contoh encoding/copy issue di `apps/production/lib/features/home/presentation/screens/home_screen.dart`, subtitle memakai karakter rusak untuk separator antara employee dan outlet. Ini bukan isu theme, tetapi perlu dicatat sebagai polish issue.

Customer:

- Memakai shared theme dan banyak shared components pada home, discovery, search, outlet, order, checkout, topup, address, profile.
- Home customer sudah memakai custom branded header dan `Scaffold(backgroundColor: context.colors.background)`, sehingga terlihat lebih consumer-facing daripada `AppLayout` default.
- Discovery memakai sticky search header, filter bar, recommendation content, dan result list. Ini salah satu benchmark terbaik untuk validasi visual karena banyak elemen kecil muncul bersamaan.

## Sinyal Masalah Visual Saat Ini

1. Visual hierarchy cenderung datar.
   Banyak surface putih, border tipis, dan elevation 0/1 membuat section penting tidak selalu menonjol. Ini terasa pada dashboard, list operasional, dan form panjang.

2. Aksen warna terlalu bertumpu pada teal.
   Teal sudah kuat sebagai brand, tetapi primary/secondary/selected/price/action sering memakai keluarga warna yang sama. Perlu sistem accent/tonal yang lebih kaya tanpa membuat app menjadi terlalu ramai.

3. Token belum cukup ekspresif untuk modern UI.
   Saat ini ada color/spacing/radius/typography, tetapi belum ada token eksplisit untuk elevation/shadow, surface tiers, icon containers, focus ring, density, atau emphasis level.

4. Theme default dan komponen custom belum sepenuhnya sinkron.
   `ThemeData` mengatur banyak Material widget default, tetapi shared components punya style logic sendiri. Redesign perlu menjaga agar Material defaults dan custom components tidak berbeda arah.

5. Background usage belum konsisten.
   `AppTheme.scaffoldBackgroundColor` memakai `colors.background`, tetapi `AppLayout` default memakai `colors.surface`. Beberapa screen custom memakai `context.colors.background`. Ini memengaruhi rasa kedalaman layar.

6. Font Satoshi belum konsisten lintas app.
   `AppFonts.fontFamily` hardcoded ke `Satoshi`, namun customer/production pubspec yang dibaca belum mendeklarasikan font aktif. Jika target redesign mengandalkan Satoshi, font asset registration harus dibereskan.

7. Ada campuran `withOpacity` dan `withValues`.
   Beberapa file shared dan app masih memakai `withOpacity`; beberapa sudah memakai `withValues(alpha:)`. Ini bukan murni visual, tetapi bagian dari polish/modernization dan konsistensi Flutter API.

8. Beberapa screen punya gaya custom yang lebih dekoratif dari design system.
   Contoh: auth/onboarding, quick actions, production summary, topup balance card memakai gradient/shadow custom. Ini bisa bagus, tetapi perlu distandarkan agar tidak terasa tiap feature punya bahasa visual sendiri.

9. Density belum dibedakan berdasarkan persona.
   Cashier/production butuh UI operasional padat, customer boleh lebih airy. Saat ini shared component size cukup umum, tetapi belum ada density policy yang jelas.

10. Dark mode ada secara token, tetapi perlu validasi visual.
    Dark semantic colors tersedia, namun audit ini belum membuktikan semua screen punya contrast, shadow, surface tier, dan status color yang matang di dark mode.

## Arah Redesign yang Diinginkan

Gunakan arah "clean operasional" sebagai default:

- Modern dan polished, tetapi tidak terasa seperti landing page.
- Cepat dipindai untuk user yang sedang bekerja.
- CTA utama jelas, secondary action tidak berisik.
- Card dan list punya hierarchy yang lebih kuat tanpa shadow berlebihan.
- Status order, payment, courier, stock, dan warning harus lebih mudah dibaca daripada dekorasi visual.
- Customer app boleh sedikit lebih warm/expressive, tetapi tetap harus konsisten dengan system token.
- Cashier dan production harus tetap padat, stabil, dan minim distraksi.

Hindari:

- Hero marketing layout di layar operasional.
- Gradient besar sebagai solusi default untuk semua surface.
- Card di dalam card secara berlebihan.
- Palet satu warna yang terlalu teal semua.
- Shadow berat yang membuat app terasa lambat/berisik.
- Font kecil atau contrast rendah untuk status penting.

## Prioritas Area Untuk Plan

Prioritas 1: foundation token

- Review primary/secondary/accent semantic palette.
- Tambahkan atau rapikan surface tiers: background, surface, elevated, subtle, selected, overlay.
- Definisikan elevation/shadow tokens yang ringan dan konsisten.
- Definisikan density guidance untuk compact vs standard.
- Pastikan font Satoshi benar-benar tersedia untuk semua app yang memakai `AppTheme`.

Prioritas 2: shared components berdampak luas

- `AppLayout` dan `AppHeader`: background default, separation, large/standard hierarchy, status bar behavior.
- `AppCard`: surface hierarchy, selected state, filled/outlined/elevated policy, shadow/border balance.
- `AppButton`: primary/secondary/tonal/ghost hierarchy, icon-only state, loading state, disabled contrast.
- `AppTextField`: search/form density, filled/outlined policy, focus/error/success state.
- `AppBadge` dan `AppChip`: status readability, soft/solid/outline usage rules, filter selected state.
- `AppBottomBar`: active state, hit area, separation, badge clarity.
- `AppBottomSheet` dan `AppDialog`: modern modal surfaces, handle, action layout.

Prioritas 3: app-level cleanup

- Kurangi styling custom yang menduplikasi token di feature widgets.
- Pindahkan warna/shadow/radius custom yang berulang ke shared token atau helper.
- Validasi screen benchmark di customer, cashier, dan production.

## Screen Benchmark yang Disarankan

Gunakan beberapa screen ini sebagai benchmark visual sebelum rollout luas:

- Cashier home/order flow:
  - `apps/cashier/lib/features/home/presentation/screens/home_screen.dart`
  - `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`
  - `apps/cashier/lib/features/order/presentation/screens/review_order_screen.dart`
  - `apps/cashier/lib/features/order/presentation/screens/weigh_order_screen.dart`
- Production dashboard/pickup:
  - `apps/production/lib/features/home/presentation/screens/home_screen.dart`
  - `apps/production/lib/features/order/presentation/screens/pickup_schedule_screen.dart`
  - `apps/production/lib/features/order/presentation/screens/pickup_order_detail_screen.dart`
- Customer home/discovery/checkout:
  - `apps/customer/lib/features/home/presentation/screens/home_screen.dart`
  - `apps/customer/lib/features/discovery/presentation/screens/discovery_screen.dart`
  - `apps/customer/lib/features/order/presentation/screens/order_summary_screen.dart`
  - `apps/customer/lib/features/topup/presentation/screens/index_topup_screen.dart`

Benchmark harus mencakup:

- List padat dengan status.
- Dashboard dengan beberapa card.
- Form panjang.
- Bottom sheet/dialog.
- Empty/loading/error state.
- Light mode dan dark mode.

## Pertanyaan Desain Untuk Model Lain

Pertanyaan intent:

- Apakah visual target tetap satu bahasa untuk cashier, production, dan customer, atau customer boleh lebih ekspresif?
- Apakah teal tetap wajib sebagai primary brand color, atau boleh digeser ke teal yang lebih modern dengan accent pendamping?
- Apakah customer app ingin terasa seperti consumer service premium, atau tetap dekat dengan operational utility?
- Apakah dark mode wajib punya kualitas visual setara light mode sekarang, atau cukup tidak rusak?

Pertanyaan implementation boundary:

- Apakah API komponen shared harus backward-compatible sepenuhnya?
- Apakah boleh menambah token baru seperti `AppElevation`, `AppSurface`, atau `AppDensity`?
- Apakah boleh mengubah default `AppLayout` background dari `surface` ke `background` jika berdampak luas?
- Apakah screen custom yang memakai gradient/shadow langsung harus dimigrasikan ke shared token?
- Apakah perubahan font asset registration boleh masuk dalam scope visual redesign?

Pertanyaan acceptance:

- Screen mana yang menjadi visual benchmark pertama untuk sign-off?
- Apakah improvement dianggap sukses jika hanya shared components membaik, atau harus ada cleanup di feature widgets juga?
- Apakah perlu visual regression screenshot untuk beberapa viewport/device?
- Apakah redesign harus tetap aman untuk desktop/web target, atau mobile app adalah prioritas utama?

## Batasan dan Anti-Overclaim

- Jangan menganggap UI saat ini buruk total. Foundation sudah ada dan cukup modular; masalah utama adalah polish, hierarchy, consistency, dan token completeness.
- Jangan mengusulkan rebuild seluruh app dari nol. Perubahan sebaiknya dimulai dari shared theme/components agar berdampak luas.
- Jangan membuat plan yang hanya mengganti warna. Masalah modernisasi mencakup typography, surface, hierarchy, density, motion/state, dan component usage.
- Jangan membuat cashier/production terlalu dekoratif. Dua app ini adalah operational tools.
- Jangan mengklaim Satoshi sudah aktif di semua app. Dari audit file, font terlihat aktif di cashier, belum terlihat aktif di customer/production.
- Jangan mengklaim dark mode sudah final tanpa validasi screenshot/manual.
- Jangan mengubah route, domain logic, API backend, atau state management sebagai bagian utama dari redesign visual.

## Source Files Reviewed

- `packages/wash_wallet_ui/lib/wash_wallet_ui.dart`
- `packages/wash_wallet_ui/lib/src/theme/app_theme.dart`
- `packages/wash_wallet_ui/lib/src/theme/color/app_colors.dart`
- `packages/wash_wallet_ui/lib/src/theme/color/semantic_colors.dart`
- `packages/wash_wallet_ui/lib/src/theme/color/dark_semantic_colors.dart`
- `packages/wash_wallet_ui/lib/src/theme/typography/semantic_typography.dart`
- `packages/wash_wallet_ui/lib/src/theme/typography/text_styles.dart`
- `packages/wash_wallet_ui/lib/src/theme/typography/app_fonts.dart`
- `packages/wash_wallet_ui/lib/src/theme/spacing/spacing_values.dart`
- `packages/wash_wallet_ui/lib/src/theme/radius/radius_values.dart`
- `packages/wash_wallet_ui/lib/src/components/layout/app_layout.dart`
- `packages/wash_wallet_ui/lib/src/components/layout/app_header/app_header.dart`
- `packages/wash_wallet_ui/lib/src/components/layout/app_bottom_bar/app_bottom_bar.dart`
- `packages/wash_wallet_ui/lib/src/components/button/app_button.dart`
- `packages/wash_wallet_ui/lib/src/components/button/app_button_style.dart`
- `packages/wash_wallet_ui/lib/src/components/card/app_card.dart`
- `packages/wash_wallet_ui/lib/src/components/card/app_card_style.dart`
- `packages/wash_wallet_ui/lib/src/components/text_field/app_text_field.dart`
- `packages/wash_wallet_ui/lib/src/components/text_field/app_text_field_style.dart`
- `packages/wash_wallet_ui/lib/src/components/list_tile/app_list_tile.dart`
- `packages/wash_wallet_ui/lib/src/components/list_tile/app_list_tile_style.dart`
- `packages/wash_wallet_ui/lib/src/components/chip/app_chip.dart`
- `packages/wash_wallet_ui/lib/src/components/badge/app_badge.dart`
- `packages/wash_wallet_ui/lib/src/components/badge/app_badge_style.dart`
- `packages/wash_wallet_ui/lib/src/components/drawer/app_drawer.dart`
- `packages/wash_wallet_ui/lib/src/components/drawer/styles/app_drawer_style.dart`
- `apps/cashier/pubspec.yaml`
- `apps/customer/pubspec.yaml`
- `apps/production/pubspec.yaml`
- `apps/customer/lib/features/home/presentation/screens/home_screen.dart`
- `apps/customer/lib/features/discovery/presentation/screens/discovery_screen.dart`
- `apps/production/lib/features/home/presentation/screens/home_screen.dart`
- `docs/context/customer_app_portfolio_context.md`
- `docs/context/cashier_app_ux_redesign_blueprint.md`
