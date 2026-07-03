# User Need: Improve Color Theme Wash Wallet UI agar Selaras dengan Web Light/Dark

Tanggal: 2026-07-01

Dokumen ini menjadi acuan kebutuhan untuk AI model lain saat menyusun implementation plan. Fokusnya adalah memperbaiki sistem warna di `packages/wash_wallet_ui/lib/src/theme/color` agar warna aplikasi Flutter lebih konsisten, lebih modern, dan selaras dengan token warna web di `webapp/wash_wallet_be/resources/css/app.css`, termasuk dukungan light dan dark theme.

Dokumen ini adalah user need, bukan implementation plan. Detail teknis di bawah dipakai untuk menjelaskan kebutuhan UX, scope, gap current state, constraint kompatibilitas, dan acceptance criteria agar implementor berikutnya dapat menyusun plan yang tepat.

## 1. Ringkasan Kebutuhan

User membutuhkan color theme pada package `wash_wallet_ui` di-improve agar:

1. Warna Flutter mengikuti arah visual web app Wash Wallet yang sudah punya token warna lengkap di `app.css`.
2. Light theme dan dark theme sama-sama terasa matang, konsisten, dan readable.
3. Brand color utama tetap hijau-teal Wash Wallet, tetapi tidak terlihat kusam atau berbeda arah antara web dan mobile/tablet apps.
4. Token semantic Flutter tetap mudah dipakai oleh semua apps: customer, cashier, dan production.
5. Perubahan tidak mematahkan public API yang sudah banyak dipakai, terutama `AppColors.teal*`, `AppColors.neutral*`, dan `context.colors.*`.

Target utama bukan sekadar mengganti hex code, tetapi merapikan sistem warna agar raw palette, semantic color, dark semantic color, dan `ThemeData.colorScheme` saling konsisten.

## 2. Referensi Utama dari Web App

Referensi warna web ada di:

1. `webapp/wash_wallet_be/resources/css/app.css`
2. Blok `:root` untuk light theme.
3. Blok `.dark` untuk dark theme.
4. Blok `@media (prefers-color-scheme: dark)` untuk default dark ketika user belum memilih mode eksplisit.

Token penting dari web light theme:

1. Primary teal: `#e6f5f1`, `#cce8e3`, `#99d1c7`, `#66baab`, `#33a38f`, `#125b48`, `#198a6a`, `#147055`, `#0e4738`, `#0a3328`, `#051f19`.
2. Secondary green: `#f0f9ed`, `#e1f3db`, `#c3e7b7`, `#a1e887`, `#6bc15a`, `#52a744`, `#438d38`, `#357f3b`, `#2a6330`, `#1f4a23`, `#0d1f13`.
3. Gray/slate neutral: `#f8fafc`, `#f1f5f9`, `#e2e8f0`, `#cbd5e1`, `#94a3b8`, `#64748b`, `#475569`, `#334155`, `#1e293b`, `#0f172a`, `#020617`.
4. Accent orange: `#fff8ed`, `#ffefd4`, `#fedaa8`, `#fdbe72`, `#fb9b3c`, `#f47f16`, `#df650c`, `#b94d0f`, `#943d13`, `#783414`, `#411807`.
5. Status colors: success `#20a866`, warning `#f5960a`, error `#f43f5e`, info `#2d9de8`.
6. Surface tokens: background `#f8fafc`, surface `#ffffff`, surface muted `#f1f5f9`, surface elevated `#ffffff`, text primary `#0f172a`, text secondary `#475569`, text tertiary `#94a3b8`, border `#e2e8f0`, border hover `#cbd5e1`, ring `rgb(18 91 72 / 0.28)`.

Token penting dari web dark theme:

1. Background `#0f172a`.
2. Surface `#1e293b`.
3. Surface muted `#182235`.
4. Surface elevated `#243247`.
5. Text primary `#f8fafc`.
6. Text secondary `#cbd5e1`.
7. Text tertiary `#94a3b8`.
8. Border `#334155`.
9. Border light `#1e293b`.
10. Border hover `#475569`.
11. Primary focus/ring memakai teal lebih terang, misalnya `#198a6a` dan `rgb(31 166 126 / 0.36)`.

Web juga punya color families `purple` dan `rose` untuk kebutuhan aksen visual tertentu. Flutter belum wajib memakainya di semua semantic token, tetapi sebaiknya tersedia di raw palette bila sistem warna ingin setara dengan web.

## 3. Kondisi Flutter Saat Ini

File yang sudah ada:

1. `packages/wash_wallet_ui/lib/src/theme/color/app_colors.dart`
   - Menyediakan raw palette `teal`, `neutral`, `success`, `warning`, `error`, dan `info`.
   - Belum punya `primary`, `secondary`, `accent`, `gray`, `purple`, `rose`, dan shade `950`.
   - Beberapa warna mirip web tetapi tidak sama. Contoh: Flutter `teal600` adalah `#125B48`, sedangkan web `primary-500` adalah `#125b48` dan web `primary-600` adalah `#198a6a`.
   - Neutral Flutter cenderung green-tinted (`#F7F9F8` sampai `#0F1211`), sedangkan web memakai slate neutral (`#f8fafc` sampai `#020617`).
2. `packages/wash_wallet_ui/lib/src/theme/color/semantic_colors.dart`
   - Sudah menyediakan semantic token untuk light theme: primary, secondary, background, surface, border, text, status, business status, surface tiers, icon containers, dan focus ring.
   - `secondary` saat ini masih memakai teal, bukan green secondary dari web.
   - Belum ada semantic token eksplisit untuk `accent`, `surfaceMuted`, `borderLight`, `borderHover`, `search`, `suggestion`, atau chart/visual accent bila dibutuhkan.
3. `packages/wash_wallet_ui/lib/src/theme/color/dark_semantic_colors.dart`
   - Sudah menyediakan override untuk dark theme.
   - Dark theme ada, tetapi mapping warnanya masih mengikuti palette lama dan belum meniru web dark tokens.
4. `packages/wash_wallet_ui/lib/src/theme/color/dark_colors.dart`
   - Berisi class `DarkSemanticColors` juga.
   - File ini tidak diekspor dari `packages/wash_wallet_ui/lib/wash_wallet_ui.dart`, tetapi tetap ada di source tree.
   - Ini berisiko membingungkan karena ada dua file yang mendefinisikan nama class yang sama bila ada import langsung ke `dark_colors.dart`.
5. `packages/wash_wallet_ui/lib/src/theme/extensions/app_color_extension.dart`
   - Menjadi jembatan `context.colors.*`.
   - Harus ikut diperbarui bila semantic token baru ditambahkan.
6. `packages/wash_wallet_ui/lib/src/theme/app_theme.dart`
   - Sudah punya `AppTheme.light()` dan `AppTheme.dark()`.
   - Apps memakai `theme: AppTheme.light()`, `darkTheme: AppTheme.dark()`, dan `themeMode: ThemeMode.system`.
   - `ColorScheme.secondary` saat ini memakai `colors.primary`, bukan `colors.secondary`.
   - Light `AppBarTheme.titleTextStyle` masih punya hardcoded `Color(0xFF1A1A1A)`, sehingga tidak sepenuhnya konsisten dengan semantic color.

## 4. Gap Current State vs Target

Gap utama:

1. Palette Flutter belum selaras dengan web token terbaru.
2. Flutter belum punya 11-step shade lengkap seperti web (`50` sampai `950`) untuk semua family.
3. Neutral Flutter berbeda karakter dari web slate neutral, sehingga background, table/card, dan text tone bisa terasa tidak sama antara web dan apps.
4. Secondary color Flutter belum merepresentasikan green secondary web.
5. Accent orange web belum tersedia sebagai raw/semantic token Flutter.
6. Dark theme Flutter sudah ada, tetapi belum memakai surface, border, text, dan primary ramp dark yang sama dengan web.
7. Semantic token belum cukup lengkap untuk beberapa token web yang sering dipakai: `surfaceMuted`, `borderLight`, `borderHover`, `ring`, search/suggestion colors, dan optional visual accent.
8. `dark_colors.dart` terlihat seperti legacy/duplikat dari `dark_semantic_colors.dart` dan perlu diputuskan nasibnya agar tidak membingungkan implementor berikutnya.
9. `ThemeData.colorScheme` belum sepenuhnya memanfaatkan semantic color yang ada, terutama `secondary`.
10. Ada penggunaan langsung `AppColors.*` di beberapa apps, sehingga perubahan value raw palette akan langsung mengubah tampilan onboarding/splash/production cards. Perlu kompatibilitas API dan review visual.

## 5. User Needs

### 5.1 Kebutuhan Brand dan Visual

User membutuhkan tampilan Flutter yang terasa satu brand dengan web app:

1. Primary color harus mengarah ke web primary teal, dengan base utama `#125b48` untuk light theme.
2. Dark theme harus memakai primary teal yang cukup terang dan readable, mengikuti arah web dark (`#198a6a`, `#1fa67e`, atau shade terkait sesuai semantic role).
3. Secondary color harus menjadi green supportive color seperti web secondary, bukan hanya alias dari primary teal.
4. Accent orange perlu tersedia untuk highlight non-status seperti promosi, warning-soft visual, atau decorative accent.
5. Status colors harus selaras dengan web: success green, warning amber, error rose/red, dan info blue.
6. Neutral harus mengikuti slate web agar background/surface/text lebih crisp dan modern.

### 5.2 Kebutuhan Light/Dark Semantic

User membutuhkan semantic color yang jelas untuk kedua mode:

1. Light mode:
   - Background `#f8fafc`.
   - Surface `#ffffff`.
   - Surface muted/subtle `#f1f5f9`.
   - Surface elevated `#ffffff`.
   - Text primary `#0f172a`.
   - Text secondary `#475569`.
   - Text tertiary `#94a3b8`.
   - Border `#e2e8f0`.
   - Border hover/strong `#cbd5e1` atau `#94a3b8` sesuai role.
2. Dark mode:
   - Background `#0f172a`.
   - Surface `#1e293b`.
   - Surface muted/subtle `#182235`.
   - Surface elevated `#243247`.
   - Text primary `#f8fafc`.
   - Text secondary `#cbd5e1`.
   - Text tertiary `#94a3b8`.
   - Border `#334155`.
   - Border light/divider `#1e293b`.
   - Border hover/strong `#475569`.
3. Focus/ring harus mengikuti web: light `rgb(18 91 72 / 0.28)`, dark `rgb(31 166 126 / 0.36)` atau nilai Flutter alpha ekuivalen.
4. Surface container, selected state, hover, pressed, disabled, icon container, and business status colors harus tetap readable di kedua mode.

### 5.3 Kebutuhan Kompatibilitas API

Perubahan harus menjaga konsumsi existing code:

1. Jangan menghapus public constant yang sudah ada seperti `AppColors.teal50`, `AppColors.teal600`, `AppColors.neutral900`, `AppColors.success500`, dan seterusnya tanpa migration plan yang jelas.
2. Bila menambahkan nama baru seperti `primary500`, `gray900`, `accent500`, `secondary500`, jadikan itu tambahan atau alias yang aman.
3. `context.colors.primary`, `context.colors.secondary`, `context.colors.background`, `context.colors.surface`, `context.colors.textPrimary`, dan semantic token existing lain harus tetap tersedia.
4. Jika ada semantic token baru, `AppColorExtension` harus expose token tersebut agar bisa dipakai via `context.colors`.
5. Perubahan tidak boleh memaksa semua apps mengganti import atau API usage hanya untuk mendapatkan warna baru.

### 5.4 Kebutuhan Dark/Light Theme Behavior

User membutuhkan apps tetap memakai mekanisme Flutter theme yang sudah ada:

1. `AppTheme.light()` dan `AppTheme.dark()` tetap menjadi sumber theme utama.
2. Apps tetap bisa memakai `ThemeMode.system` seperti saat ini.
3. Implementasi berikutnya perlu memastikan `ColorScheme.light` dan `ColorScheme.dark` memakai semantic colors yang benar, termasuk `secondary: colors.secondary`.
4. Jangan membuat mode switching custom baru bila kebutuhan bisa dipenuhi oleh `ThemeData`, `AppColorExtension`, dan semantic colors yang sudah ada.

### 5.5 Kebutuhan Maintainability

Sistem warna baru harus mudah dirawat:

1. Pisahkan raw palette dan semantic role dengan jelas.
2. Hindari hardcoded color baru di component style bila token semantic sudah ada.
3. Tambahkan komentar singkat bila ada alias backward-compatible agar alasan alias jelas.
4. Tentukan nasib `dark_colors.dart`: hapus bila aman, jadikan deprecated wrapper, atau sinkronkan agar tidak mendefinisikan class duplikat yang membingungkan.
5. Dokumentasikan mapping warna web ke Flutter di kode atau doc terdekat bila implementor merasa perlu.

## 6. Scope yang Diharapkan

Scope utama untuk plan berikutnya:

1. Audit dan update `packages/wash_wallet_ui/lib/src/theme/color/app_colors.dart`.
2. Audit dan update `packages/wash_wallet_ui/lib/src/theme/color/semantic_colors.dart`.
3. Audit dan update `packages/wash_wallet_ui/lib/src/theme/color/dark_semantic_colors.dart`.
4. Tentukan cleanup untuk `packages/wash_wallet_ui/lib/src/theme/color/dark_colors.dart`.
5. Update `packages/wash_wallet_ui/lib/src/theme/extensions/app_color_extension.dart` bila token semantic baru ditambahkan.
6. Update `packages/wash_wallet_ui/lib/src/theme/app_theme.dart` agar `ColorScheme` dan Material component defaults memakai semantic colors yang benar.
7. Jalankan format/analyze Flutter setelah implementasi.
8. Review visual minimal pada apps yang memakai `AppTheme`: customer, cashier, dan production.

Scope tambahan bila dibutuhkan:

1. Tambahkan semantic token untuk `accent`, `onAccent`, `accentSurface`, `surfaceMuted`, `borderLight`, `borderHover`, `searchBackground`, `searchBorder`, `suggestionBackground`, dan `suggestionSelected`.
2. Tambahkan raw family `purple` dan `rose` agar setara dengan web token, terutama untuk chart/visual accent di masa depan.
3. Tambahkan compatibility aliases agar `teal*` tetap hidup walau brand token baru bernama `primary*`.

## 7. Non-Goals

Yang tidak perlu dilakukan pada tahap kebutuhan ini:

1. Tidak perlu mengubah business logic apps.
2. Tidak perlu redesign seluruh screen.
3. Tidak perlu membuat theme switcher UI baru.
4. Tidak perlu mengganti typography, spacing, radius, atau elevation kecuali ada hard dependency terhadap warna.
5. Tidak perlu mengubah CSS web karena web menjadi referensi, bukan target edit.

## 8. Acceptance Criteria untuk Implementasi Berikutnya

Implementasi berikutnya dianggap memenuhi kebutuhan bila:

1. `AppColors` menyediakan palette yang selaras dengan web untuk primary/teal, secondary, gray/neutral, accent, success, warning, error, dan info.
2. Existing constant penting tetap tersedia sehingga code existing yang memakai `AppColors.teal*` dan `AppColors.neutral*` tidak rusak.
3. `SemanticColors` light memakai background/surface/text/border/status yang mengikuti web light token.
4. `DarkSemanticColors` memakai background/surface/text/border/status yang mengikuti web dark token.
5. `context.colors.secondary` benar-benar mengarah ke secondary green, bukan alias primary.
6. `ThemeData.colorScheme.secondary` memakai `colors.secondary`.
7. `ThemeData` light/dark tidak memiliki hardcoded color yang bertentangan dengan semantic color untuk app bar, card, chip, input, button, snackbar, dialog, dan scaffold.
8. `dark_colors.dart` tidak lagi menjadi sumber kebingungan class duplikat.
9. `dart format` dijalankan untuk file Dart yang berubah.
10. `flutter analyze` pada workspace/app relevan tidak menunjukkan error baru akibat perubahan theme.
11. Tampilan light dan dark tetap readable, termasuk button text, badge/status chip, input border/focus, card border, drawer/sidebar, table/data view, empty/error/loading state, dan snackbar.

## 9. Risiko dan Catatan untuk Planner

1. Web CSS memakai CSS variables yang nilainya berubah antara `:root` dan `.dark`. Flutter `AppColors` saat ini berupa static constants yang tidak bisa berubah sesuai mode. Planner perlu memilih struktur yang tepat: raw palette statis plus semantic mapping dark, atau menambahkan class palette dark terpisah.
2. Jangan langsung mengganti semua `teal*` menjadi `primary*` bila itu menyebabkan banyak call site berubah. Lebih aman menambahkan alias atau menjaga nama lama.
3. Mengubah neutral palette akan berdampak luas pada background, surface, border, text, disabled, dan icon container. Review dark/light perlu dilakukan pada komponen shared UI.
4. Status color web berbeda dari default Tailwind yang sekarang dipakai Flutter. Perubahan ini akan memengaruhi badge dan status chip.
5. `overlay` di Flutter saat ini lebih mirip modal dim overlay, sedangkan web punya `surface-overlay` untuk translucent surface. Jangan samakan keduanya tanpa memperjelas role token.
6. Jika semantic token baru ditambahkan, update extension dan pertimbangkan fallback agar komponen lama tetap compile.
7. Pastikan contrast primary/onPrimary, secondary/onSecondary, error/onError, success/onSuccess, warning/onWarning, dan info/onInfo diuji secara visual minimal.

## 10. File Relevan yang Ditemukan

1. `webapp/wash_wallet_be/resources/css/app.css`
2. `packages/wash_wallet_ui/lib/src/theme/color/app_colors.dart`
3. `packages/wash_wallet_ui/lib/src/theme/color/semantic_colors.dart`
4. `packages/wash_wallet_ui/lib/src/theme/color/dark_semantic_colors.dart`
5. `packages/wash_wallet_ui/lib/src/theme/color/dark_colors.dart`
6. `packages/wash_wallet_ui/lib/src/theme/extensions/app_color_extension.dart`
7. `packages/wash_wallet_ui/lib/src/theme/app_theme.dart`
8. `packages/wash_wallet_ui/lib/wash_wallet_ui.dart`
9. `apps/customer/lib/main.dart`
10. `apps/cashier/lib/main.dart`
11. `apps/production/lib/main.dart`
