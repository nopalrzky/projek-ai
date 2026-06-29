# Plan: Theme & Shared UI Redesign — WashWallet

**Versi:** 1.0  
**Tanggal:** 2026-06-22  
**Target:** AI model yang akan mengeksekusi perubahan  
**Scope:** `packages/wash_wallet_ui` + font asset registration di ketiga app

---

## 1. Tujuan

Meningkatkan kualitas visual dan konsistensi design system WashWallet tanpa merombak arsitektur yang sudah ada. Perubahan berfokus pada:

1. **Token foundation** — memperkaya warna, elevation, surface tier, density, dan perbaikan font.
2. **Shared components** — memperbaiki visual hierarchy, state clarity, dan konsistensi API.
3. **Modernisasi kode** — migrasi `withOpacity` ke `withValues(alpha:)` di seluruh package UI.

Target rasa visual: **"clean operasional"** — modern, cepat dipindai, CTA jelas, status terbaca, tidak dekoratif berlebihan. Cashier dan production tetap padat/utilitarian; customer boleh sedikit lebih warm/expressive tetapi harus tetap dalam system token.

---

## 2. Asumsi dan Keputusan Desain

Sebelum eksekusi, AI model harus memakai asumsi berikut (jika tidak ada instruksi lain dari owner):

| Pertanyaan | Asumsi Default |
|---|---|
| Apakah teal tetap sebagai primary brand? | Ya. Teal dipertahankan. Boleh direfine ke nilai HEX yang lebih modern (teal600 = #125B48 dipertahankan). |
| Apakah customer boleh lebih ekspresif? | Ya, dalam batas token. Customer boleh pakai primarySurface, soft gradient ringan, dan tone lebih warm pada surface. |
| Apakah API komponen harus backward-compatible? | Ya. Jangan break existing API. Boleh menambah parameter baru dengan default value. |
| Boleh tambah token baru? | Ya. AppElevation, AppSurface (tier), AppDensity boleh ditambah sebagai class atau extension. |
| Boleh ubah default AppLayout background? | Ya. AppLayout default diubah dari colors.surface ke colors.background. |
| Font Satoshi wajib untuk semua app? | Ya. Font asset registration harus diselesaikan di apps/customer dan apps/production. |
| Apakah screen custom harus dimigrasikan ke shared token? | Partial. Hanya yang menggunakan warna/shadow hardcoded dan sudah punya equivalent token. |
| Dark mode scope? | Perbaiki agar tidak rusak dan memiliki surface tier yang proper. Tidak perlu full polish setara light. |
| Target platform? | Mobile (Android & iOS) sebagai prioritas utama. |

---

## 3. Batasan Eksekusi

- **JANGAN** mengubah route, domain logic, API backend, state management, atau Cubit/Provider.
- **JANGAN** rebuild komponen dari nol jika bisa diperbaiki inkremental.
- **JANGAN** mengganti semua warna hanya dengan warna baru tanpa alasan hierarchy.
- **JANGAN** menambahkan gradient besar sebagai solusi default.
- **JANGAN** membuat cashier/production terasa seperti consumer app.
- **JANGAN** mengubah file di luar `packages/wash_wallet_ui` kecuali untuk: font pubspec registration, dan AppLayout default background fix di shared package.
- **HARUS** jalankan `flutter analyze` setelah setiap fase selesai dan pastikan zero error/warning baru.

---

## 4. Struktur File yang Relevan

```
packages/wash_wallet_ui/lib/
├── wash_wallet_ui.dart                          <- barrel export
└── src/
    ├── theme/
    │   ├── app_theme.dart                       <- ThemeData light() + dark()
    │   ├── color/
    │   │   ├── app_colors.dart                  <- raw color palette
    │   │   ├── semantic_colors.dart             <- light semantic mapping
    │   │   └── dark_semantic_colors.dart        <- dark semantic mapping
    │   ├── typography/
    │   │   ├── app_fonts.dart                   <- font family + weights
    │   │   ├── text_styles.dart                 <- base TextStyle factory
    │   │   └── semantic_typography.dart         <- AppTypography class
    │   ├── spacing/spacing_values.dart          <- AppSpacing
    │   ├── radius/radius_values.dart            <- AppRadius
    │   └── extensions/
    │       ├── app_color_extension.dart
    │       ├── app_typography_extension.dart
    │       ├── app_spacing_extension.dart
    │       └── app_radius_extension.dart
    └── components/
        ├── layout/
        │   ├── app_layout.dart
        │   ├── app_header/app_header.dart
        │   └── app_bottom_bar/app_bottom_bar.dart
        ├── button/
        │   ├── app_button.dart
        │   └── app_button_style.dart
        ├── card/
        │   ├── app_card.dart
        │   └── app_card_style.dart
        ├── text_field/
        │   ├── app_text_field.dart
        │   └── app_text_field_style.dart
        ├── badge/
        │   ├── app_badge.dart
        │   └── app_badge_style.dart
        ├── chip/app_chip.dart
        ├── list_tile/
        │   ├── app_list_tile.dart
        │   └── app_list_tile_style.dart
        ├── bottom_sheet/
        ├── dialog/
        ├── drawer/
        ├── snackbar/
        ├── loading/
        ├── empty_state/
        └── error_state/

apps/cashier/pubspec.yaml                        <- font sudah terdaftar (OK)
apps/customer/pubspec.yaml                       <- font BELUM terdaftar (PERLU FIX)
apps/production/pubspec.yaml                     <- font BELUM terdaftar (PERLU FIX)
```

---

## 5. Fase Eksekusi

### FASE 1: Foundation Token (Prioritas Tertinggi)

Kerjakan berurutan. Fase ini adalah fondasi semua perubahan berikutnya.

---

#### 1.1 Fix Font Asset Registration

**File:** `apps/customer/pubspec.yaml`, `apps/production/pubspec.yaml`

Tambahkan deklarasi font Satoshi sesuai format yang sudah ada di `apps/cashier/pubspec.yaml`. Salin blok `fonts:` dari cashier ke customer dan production. Pastikan path asset mengarah ke direktori yang benar (biasanya relative ke monorepo root atau masing-masing app root).

Verifikasi: Setelah fix, jalankan masing-masing app dan pastikan font yang dirender adalah Satoshi (bukan San Francisco/Roboto default).

---

#### 1.2 Tambah Token: `AppElevation`

**File baru:** `packages/wash_wallet_ui/lib/src/theme/elevation/app_elevation.dart`

Buat class `AppElevation` dengan shadow token sebagai `List<BoxShadow>`:

```dart
class AppElevation {
  AppElevation._();

  /// Tidak ada bayangan. Gunakan untuk surface datar atau bersama border.
  static const List<BoxShadow> none = [];

  /// Shadow sangat ringan. Gunakan untuk card dalam background yang sedikit berbeda.
  static final List<BoxShadow> xs = [
    BoxShadow(
      color: Color(0xFF0F1211).withValues(alpha: 0.04),
      blurRadius: 2,
      offset: Offset(0, 1),
    ),
  ];

  /// Shadow standar untuk card, panel, dan modal ringan.
  static final List<BoxShadow> sm = [
    BoxShadow(
      color: Color(0xFF0F1211).withValues(alpha: 0.06),
      blurRadius: 6,
      offset: Offset(0, 2),
    ),
  ];

  /// Shadow medium. Gunakan untuk bottom sheet, popup, atau floating element.
  static final List<BoxShadow> md = [
    BoxShadow(
      color: Color(0xFF0F1211).withValues(alpha: 0.08),
      blurRadius: 12,
      offset: Offset(0, 4),
    ),
  ];

  /// Shadow besar. Gunakan untuk dialog dan modal penuh.
  static final List<BoxShadow> lg = [
    BoxShadow(
      color: Color(0xFF0F1211).withValues(alpha: 0.12),
      blurRadius: 20,
      offset: Offset(0, 8),
    ),
  ];
}
```

Export `AppElevation` di `wash_wallet_ui.dart`.

---

#### 1.3 Perkaya Surface Tier di `SemanticColors`

**File:** `packages/wash_wallet_ui/lib/src/theme/color/semantic_colors.dart`

Tambah properti berikut ke `SemanticColors` (dan ekuivalennya di `DarkSemanticColors`):

```dart
// Surface tiers — untuk membedakan kedalaman layer
Color get surfaceSubtle => AppColors.neutral50;      // background section halus
Color get surfaceSelected => AppColors.teal50;       // item terpilih / active row
Color get surfaceDeep => AppColors.neutral100;       // panel dalam, header strip

// Icon container
Color get iconContainerPrimary => AppColors.teal50;
Color get iconContainerNeutral => AppColors.neutral100;
Color get iconContainerSuccess => AppColors.success50;
Color get iconContainerWarning => AppColors.warning50;
Color get iconContainerError => AppColors.error50;
Color get iconContainerInfo => AppColors.info50;

// Focus ring
Color get focusRing => AppColors.teal500.withValues(alpha: 0.3);
```

Untuk dark mode (`DarkSemanticColors`), sesuaikan nilai agar kontras cukup di background gelap:
- `surfaceSubtle` → nilai sedikit lebih terang dari background dark
- `surfaceSelected` → teal lebih gelap, misal `teal800` atau `teal900` dengan opacity rendah
- `surfaceDeep` → neutral800 atau neutral700

---

#### 1.4 Tambah Token: `AppDensity`

**File baru:** `packages/wash_wallet_ui/lib/src/theme/density/app_density.dart`

```dart
/// Guidance density untuk komponen shared.
/// Gunakan [standard] untuk customer app.
/// Gunakan [compact] untuk cashier dan production app.
enum AppDensityMode { standard, compact }

class AppDensity {
  AppDensity._();

  /// Tinggi minimum item list/tile
  static double listItemHeight(AppDensityMode mode) =>
      mode == AppDensityMode.compact ? 52 : 64;

  /// Padding vertikal konten card
  static double cardVerticalPadding(AppDensityMode mode) =>
      mode == AppDensityMode.compact ? 12 : 16;

  /// Tinggi button standard
  static double buttonHeight(AppDensityMode mode) =>
      mode == AppDensityMode.compact ? 40 : 48;
}
```

Export `AppDensity` dan `AppDensityMode` di `wash_wallet_ui.dart`.

---

#### 1.5 Rapikan `withOpacity` ke `withValues(alpha:)`

**File yang terdampak (cari semua instance):**

Jalankan grep di seluruh `packages/wash_wallet_ui/lib/` untuk pattern `.withOpacity(`:

```bash
grep -rn "\.withOpacity(" packages/wash_wallet_ui/lib/
```

Ganti setiap instance `color.withOpacity(x)` menjadi `color.withValues(alpha: x)`. Ini adalah API yang lebih modern di Flutter.

Pastikan tidak ada regresi dengan `flutter analyze`.

---

#### 1.6 Update `AppTheme` — Sinkronkan ThemeData dengan Token Baru

**File:** `packages/wash_wallet_ui/lib/src/theme/app_theme.dart`

Setelah token di atas siap, update `AppTheme.light()` dan `AppTheme.dark()`:

1. `scaffoldBackgroundColor` sudah benar pakai `colors.background`. Pastikan tidak ada perubahan di sini.
2. `cardTheme` — pastikan `shadowColor: Colors.transparent` dan border dari `colors.border` dengan width 1:
   ```dart
   cardTheme: CardThemeData(
     color: colors.surface,
     elevation: 0,
     shadowColor: Colors.transparent,
     shape: RoundedRectangleBorder(
       borderRadius: BorderRadius.circular(12),
       side: BorderSide(color: colors.border, width: 1),
     ),
   ),
   ```
3. `chipTheme` — tambahkan `selectedColor: colors.primarySurface` dan `checkmarkColor: colors.primary`.
4. `snackBarTheme` — pastikan elevation dan shape sudah ada dan konsisten.
5. `dialogTheme` — pastikan elevation cukup tinggi (8) untuk separasi modal yang jelas.

---

### FASE 2: Shared Components

Kerjakan komponen berdasarkan urutan prioritas berikut. Setiap komponen harus tetap backward-compatible.

---

#### 2.1 `AppLayout` — Background Default Fix

**File:** `packages/wash_wallet_ui/lib/src/components/layout/app_layout.dart`

**Masalah:** Default background pakai `colors.surface` (putih), bukan `colors.background` (neutral50). Ini membuat layar terasa terlalu datar karena card di atasnya juga putih.

**Perubahan:**
- Ubah default `backgroundColor` di `AppLayout` dari `context.colors.surface` menjadi `context.colors.background`.
- Tetap terima `backgroundColor` sebagai parameter opsional (sudah ada) sehingga screen yang perlu override bisa melakukannya.

**Catatan:** Perubahan ini akan membuat semua layar yang belum mengoverride background mendapatkan tone neutral50 yang sedikit lebih gelap dari putih — ini adalah perilaku yang diinginkan agar card di atasnya punya kontras visual.

---

#### 2.2 `AppHeader` — Visual Hierarchy

**File:** `packages/wash_wallet_ui/lib/src/components/layout/app_header/app_header.dart`

**Masalah:** Header terasa terlalu basic dan belum memberi hierarchy yang kuat.

**Perubahan:**
1. Pastikan border bawah header menggunakan `colors.border` dengan opacity konsisten.
2. Untuk variant `large` (height 96): tambahkan dukungan `subtitle` text opsional di bawah title dengan style `context.typography.bodyMedium` dan warna `colors.textSecondary`.
3. Untuk variant `transparent`: pastikan system overlay style (status bar) tetap aman dan terbaca.
4. Tambah parameter `elevation` opsional (type `List<BoxShadow>`, default `AppElevation.none`) agar konsumen yang ingin sedikit shadow bisa menggunakannya.

Contoh tambahan parameter:
```dart
final List<BoxShadow> elevation;
// Default: AppElevation.none
```

---

#### 2.3 `AppCard` — Surface Hierarchy & Variant Info

**File:** `packages/wash_wallet_ui/lib/src/components/card/app_card.dart`, `app_card_style.dart`

**Masalah:**
- Card `surface` dan `elevated` sering terlihat identik karena dua-duanya putih.
- `AppCard.info` memetakan ke `outlined` bukan warna info yang sesungguhnya.

**Perubahan:**
1. **Variant `elevated`:** Gunakan `AppElevation.sm` sebagai shadow default, background tetap `colors.surface`. Ini membedakannya secara visual dari `surface` yang datar.
2. **Variant `surface`:** Tetap datar, gunakan border tipis `colors.border`. Boleh ditambah `AppElevation.xs` jika context memerlukan.
3. **Variant `filled`:** Gunakan `colors.surfaceVariant` (neutral100) sebagai background. Cocok untuk section yang ingin dibedakan tanpa border.
4. **Variant `info`:** Perbaiki dari mapping ke `outlined` menjadi background `colors.infoSurface` dan border/accent warna `colors.info`.
5. **Tambah parameter `elevation` opsional** dengan type `List<BoxShadow>` agar konsumen bisa inject `AppElevation.xs/sm/md` secara eksplisit.
6. **Tambah parameter `isSelected` opsional:** Jika `true`, gunakan `colors.surfaceSelected` (teal50) sebagai background dan `colors.primary` sebagai border.

---

#### 2.4 `AppButton` — Hierarchy Tonal & Loading State

**File:** `packages/wash_wallet_ui/lib/src/components/button/app_button.dart`, `app_button_style.dart`

**Masalah:**
- Belum ada variant `tonal` (warna soft, bukan outline).
- Loading state bisa membuat lebar button collapse.

**Perubahan:**
1. **Tambah variant `tonal`** — background `colors.primarySurface` (teal50), foreground `colors.primary`, tidak ada border. Ini middle ground antara `primary` (solid) dan `outline` (transparan + border). Tambah ke enum `AppButtonVariant`.
2. **Loading state:** Tambah parameter `isLoading` opsional. Jika `true`, tampilkan `CircularProgressIndicator` kecil di tengah tanpa mengubah lebar button. Gunakan `ConstrainedBox` atau simpan dimensi button. Disabled state otomatis aktif saat loading.
3. **Icon alignment:** Pastikan gap antara icon dan label konsisten (8px).
4. **Disabled contrast:** Pastikan teks dan icon pada state disabled menggunakan `colors.textDisabled` bukan transparan, agar tetap terbaca.

---

#### 2.5 `AppTextField` — Dense Search & State Visual

**File:** `packages/wash_wallet_ui/lib/src/components/text_field/app_text_field.dart`, `app_text_field_style.dart`

**Masalah:**
- Belum ada pola dense yang khusus untuk search/filter field di list operasional.
- State visual perlu lebih jelas.

**Perubahan:**
1. **Variant `search`:** Kurangi `contentPadding` vertikal ke 8px untuk field yang lebih compact. Pastikan icon search di-align dengan benar dan bisa diganti via `prefixIcon`.
2. **State `focus`:** Pastikan border focus menggunakan `colors.primary` dengan width 2 (sudah ada di ThemeData, konfirmasi teraplikasi di custom widget juga).
3. **State `success`:** Pastikan border menggunakan `colors.success` dan ada opsional icon checkmark di suffix.
4. **State `error`:** Pastikan error text style menggunakan `context.typography.caption` dan warna `colors.error`.
5. **Variant `filled`:** Pastikan `fillColor` menggunakan `colors.surfaceVariant` (neutral100) bukan `colors.surface` (putih).

---

#### 2.6 `AppBadge` — Readability & Soft Variant

**File:** `packages/wash_wallet_ui/lib/src/components/badge/app_badge.dart`, `app_badge_style.dart`

**Perubahan:**
1. **Ganti semua `withOpacity`** ke `withValues(alpha:)` (konfirmasi sudah done dari Fase 1.5).
2. **Soft variant:** Pastikan soft variant menggunakan `colorSurface` (misal `successSurface`) sebagai background dan `colorDark` (misal `successDark`) sebagai foreground untuk kontrast lebih baik. Hindari opacity langsung — gunakan token eksplisit.
3. **Minimum width:** Pastikan badge dengan 1-2 karakter punya minimum width yang cukup agar tidak terlalu mepet.
4. **Dark mode:** Pastikan nilai background/foreground soft/solid badge tetap kontras di dark mode.

---

#### 2.7 `AppChip` — Filter Selected State

**File:** `packages/wash_wallet_ui/lib/src/components/chip/app_chip.dart`

**Perubahan:**
1. **Ganti `withOpacity`** ke `withValues(alpha:)`.
2. **Selected state:** Background `colors.primarySurface` (teal50), border `colors.primary`, label `fontWeight: FontWeight.w600`.
3. **Unselected state:** Background `colors.surfaceVariant`, border `colors.border`, label weight normal.
4. **Animasi:** Pertahankan animasi yang ada — hanya perbaiki warna destination.

---

#### 2.8 `AppListTile` — Hierarchy & Selected State

**File:** `packages/wash_wallet_ui/lib/src/components/list_tile/app_list_tile.dart`, `app_list_tile_style.dart`

**Perubahan:**
1. **Hover state:** Pastikan menggunakan `colors.hover` (neutral900 opacity 4%) sebagai InkWell highlight.
2. **Selected state:** Gunakan `colors.surfaceSelected` (teal50) sebagai background. Tambahkan left indicator opsional — border kiri 3px warna `colors.primary` — sebagai penegasan visual.
3. **Variant `compact`:** Pastikan padding vertikal lebih kecil (8px vs 12px standard) dan font size menggunakan `bodySmall` / `labelSmall`.
4. **Divider:** Pastikan divider antar list tile menggunakan `colors.divider` yang tipis.

---

#### 2.9 `AppBottomBar` — Active State & Separation

**File:** `packages/wash_wallet_ui/lib/src/components/layout/app_bottom_bar/app_bottom_bar.dart`

**Perubahan:**
1. **Active state pill:** Pertahankan pill teal soft. Pastikan pill width tidak terlalu lebar (max 64px), tinggi 32px. Warna background `colors.primarySurface`, icon/label `colors.primary`.
2. **Inactive state:** Icon `colors.textTertiary`, label hidden atau sangat subtle.
3. **Separation:** Pertahankan border top 1px `colors.border`. Tambah parameter `elevation` opsional (default `AppElevation.none`).
4. **Badge di icon:** Pastikan notification badge menggunakan `AppBadge` solid kecil dengan warna `colors.error`.

---

#### 2.10 `AppBottomSheet` — Modern Modal Surface

**File:** `packages/wash_wallet_ui/lib/src/components/bottom_sheet/`

**Perubahan:**
1. **Handle bar:** Pastikan ada drag handle (pill 40x4px, warna `colors.border`) di bagian atas sheet.
2. **Background:** `colors.surface`, dengan `BorderRadius.vertical(top: Radius.circular(20))`.
3. **Shadow:** Gunakan `AppElevation.lg` untuk separasi dari background.
4. **Action layout:** Jika ada tombol di bagian bawah sheet, pastikan ada `SafeArea` bottom agar tidak tertutup home indicator.

---

#### 2.11 `AppDialog` — Elevation & Action Layout

**File:** `packages/wash_wallet_ui/lib/src/components/dialog/`

**Perubahan:**
1. **Background:** `colors.surface`, radius 16.
2. **Shadow/elevation:** Pastikan dialog punya separasi visual yang jelas dari overlay background.
3. **Action layout:** Primary action di kanan, secondary di kiri. Gap antar tombol 8px. Gunakan `AppButton` untuk konsistensi.
4. **Destructive dialog:** Gunakan `AppButton` variant `danger` untuk tombol destructive action.

---

#### 2.12 `AppEmptyState` & `AppErrorState` — Icon Container

**File:** `packages/wash_wallet_ui/lib/src/components/empty_state/`, `error_state/`

**Perubahan:**
1. **Icon container:** Bungkus icon utama dalam container rounded (radius 16, size 64x64) dengan background `colors.iconContainerNeutral` (untuk empty) atau `colors.iconContainerError` (untuk error).
2. **Typography:** Title pakai `context.typography.headlineSmall`, subtitle pakai `context.typography.bodyMedium` dengan `colors.textSecondary`.
3. **CTA:** Gunakan `AppButton` variant `primary` atau `outline` (jangan hardcode style di widget).

---

### FASE 3: App-Level Cleanup (Scope Terbatas)

Fase ini hanya menyentuh screen benchmark. Jangan cleanup semua screen — fokus pada validasi visual.

---

#### 3.1 Validasi Screen Benchmark

Buka screen berikut dan periksa apakah ada:
- Warna hardcoded yang punya equivalent token → ganti ke token.
- `withOpacity` → ganti ke `withValues(alpha:)`.
- Custom shadow/gradient yang duplikasi token → ganti ke `AppElevation`.
- Background `Scaffold(backgroundColor: ...)` yang tidak konsisten → ikuti guidance.

**Screen yang harus divalidasi:**

Cashier:
- `apps/cashier/lib/features/home/presentation/screens/home_screen.dart`
- `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`
- `apps/cashier/lib/features/order/presentation/screens/review_order_screen.dart`

Production:
- `apps/production/lib/features/home/presentation/screens/home_screen.dart`
- `apps/production/lib/features/order/presentation/screens/pickup_schedule_screen.dart`

Customer:
- `apps/customer/lib/features/home/presentation/screens/home_screen.dart`
- `apps/customer/lib/features/discovery/presentation/screens/discovery_screen.dart`
- `apps/customer/lib/features/order/presentation/screens/order_summary_screen.dart`

**Catatan:** Jika cleanup suatu screen memerlukan lebih dari 10 baris perubahan logic, skip screen tersebut dan catat sebagai "needs separate PR".

---

#### 3.2 Fix Encoding Issue di Production Home Screen

**File:** `apps/production/lib/features/home/presentation/screens/home_screen.dart`

**Masalah:** Subtitle menampilkan karakter rusak untuk separator antara employee dan outlet.

**Perubahan:** Temukan separator yang rusak dan ganti dengan karakter yang benar (contoh: `•` atau `|`). Ini adalah polish fix, bukan theme change.

---

## 6. Export & Barrel Update

Setelah semua fase selesai, pastikan `wash_wallet_ui.dart` mengekspor semua token baru:

```dart
// Tambahkan di wash_wallet_ui.dart:
export 'src/theme/elevation/app_elevation.dart';
export 'src/theme/density/app_density.dart';
```

Pastikan tidak ada export yang broken dengan `flutter analyze`.

---

## 7. Verifikasi

### Per Fase

Setiap fase selesai, jalankan:

```bash
flutter analyze packages/wash_wallet_ui
```

Pastikan zero error dan zero warning baru.

### Verifikasi Visual Manual

Setelah semua fase selesai, buka ketiga app dan verifikasi secara visual menggunakan checklist ini:

**Checklist per screen benchmark:**

- [ ] Background screen bukan pure putih (harus neutral50 atau background token)
- [ ] Card memiliki separasi visual yang lebih jelas dari background
- [ ] Button primary jelas, secondary tidak berisik
- [ ] Status badge (order, payment) terbaca dengan jelas
- [ ] Filter chip aktif vs nonaktif jelas terbedakan
- [ ] Bottom bar active state jelas terbaca
- [ ] Font Satoshi tampil di customer dan production app (bukan fallback platform)
- [ ] Empty state dan error state punya icon container yang rapi
- [ ] Bottom sheet punya drag handle dan rounded corner atas

**Checklist dark mode (minimal):**

- [ ] Surface tier tidak semua hitam pekat — ada perbedaan antara background dan surface
- [ ] Badge dan chip masih terbaca di dark
- [ ] Button disabled contrast aman

### Regression Check

Pastikan tidak ada breaking API change:

```bash
grep -rn "AppCard\." apps/ | head -20
grep -rn "AppButton\." apps/ | head -20
grep -rn "AppTextField\." apps/ | head -20
```

Pastikan tidak ada kompilasi error di ketiga app setelah perubahan.

---

## 8. Urutan Kerjaan yang Direkomendasikan

```
1.  Fix font registration (1.1)           <- 15-30 menit
2.  Buat AppElevation (1.2)               <- 15 menit
3.  Perkaya SemanticColors (1.3)          <- 20 menit
4.  Buat AppDensity (1.4)                 <- 15 menit
5.  Migrasi withOpacity (1.5)             <- 20-30 menit (grep + replace)
6.  Update AppTheme (1.6)                 <- 20 menit
    -> flutter analyze check
7.  AppLayout background fix (2.1)        <- 10 menit
8.  AppHeader improvement (2.2)           <- 30 menit
9.  AppCard hierarchy (2.3)               <- 30 menit
10. AppButton tonal + loading (2.4)       <- 45 menit
11. AppTextField dense (2.5)              <- 30 menit
12. AppBadge soft variant (2.6)           <- 20 menit
13. AppChip selected state (2.7)          <- 20 menit
14. AppListTile hierarchy (2.8)           <- 25 menit
15. AppBottomBar (2.9)                    <- 20 menit
16. AppBottomSheet (2.10)                 <- 25 menit
17. AppDialog (2.11)                      <- 20 menit
18. AppEmptyState & AppErrorState (2.12)  <- 20 menit
    -> flutter analyze check
19. Export barrel update (Fase 6)         <- 5 menit
20. Validasi screen benchmark (3.1)       <- 60-90 menit
21. Fix encoding production (3.2)         <- 5 menit
    -> flutter analyze final check
    -> Visual manual check
```

**Estimasi total:** ~6-8 jam kerja AI.

---

## 9. Hal yang TIDAK Termasuk dalam Plan Ini

Hal berikut sengaja dikecualikan dari scope:
- Perubahan routing atau navigasi.
- Perubahan domain/data layer.
- Perubahan state management (Cubit/Bloc/Provider).
- Full visual regression screenshot tooling.
- Animasi kompleks atau transition antar screen.
- Redesign screen yang tidak masuk benchmark list.
- Customer app redesign mendalam (home branded header, dll) — scope terpisah.
- Dark mode full polish — hanya "tidak rusak" yang ditarget.

---

## 10. Referensi File

| File | Path |
|---|---|
| Context dokumen | `docs/context/theme_shared_ui_redesign_context.md` |
| App theme | `packages/wash_wallet_ui/lib/src/theme/app_theme.dart` |
| App colors | `packages/wash_wallet_ui/lib/src/theme/color/app_colors.dart` |
| Semantic colors | `packages/wash_wallet_ui/lib/src/theme/color/semantic_colors.dart` |
| Dark semantic | `packages/wash_wallet_ui/lib/src/theme/color/dark_semantic_colors.dart` |
| Typography | `packages/wash_wallet_ui/lib/src/theme/typography/semantic_typography.dart` |
| Spacing | `packages/wash_wallet_ui/lib/src/theme/spacing/spacing_values.dart` |
| Radius | `packages/wash_wallet_ui/lib/src/theme/radius/radius_values.dart` |
| Barrel export | `packages/wash_wallet_ui/lib/wash_wallet_ui.dart` |
