# Implementation Plan: Flutter UI Theme Color Alignment with Web Light/Dark

**Tanggal**: 2026-07-01
**Referensi User Need**: `docs/user_need/flutter_ui_theme_color_alignment_user_need.md`
**Dikerjakan oleh**: AI model implementor berikutnya
**Package target**: `packages/wash_wallet_ui`

---

## 1. Latar Belakang dan Tujuan

Web app Wash Wallet (`webapp/wash_wallet_be/resources/css/app.css`) sudah memiliki sistem warna berbasis CSS custom properties yang matang � lengkap dengan 11-step shade ramp untuk setiap family warna, semantic surface/border/text token, serta dukungan light/dark mode. Flutter app saat ini menggunakan `AppColors` berbasis teal/neutral kustom yang sudah **bergeser dari arah web** baik dari sisi hue maupun nilai shade.

Tujuan plan ini adalah merapikan sistem warna Flutter agar:
1. Raw palette selaras dengan token web.
2. Semantic light dan dark token menggunakan nilai yang identik atau setara dengan web.
3. Semua API publik yang sudah dipakai tetap tersedia tanpa breaking change.
4. Duplikasi file `dark_colors.dart` diatasi secara bersih.
5. `ThemeData.colorScheme` dan komponen Material menggunakan semantic colors yang benar.

---

## 2. Temuan Audit Codebase

### 2.1 `app_colors.dart` � Raw Palette (saat ini)

| Family | Shade tersedia | Catatan Gap |
|--------|---------------|-------------|
| `teal` | 50-900 (10 shade) | Value berbeda dari web primary. Contoh: `teal600 = #125B48` != `primary-600 web = #198a6a`. Belum ada shade `950`. |
| `neutral` | 0, 50-900 (11 shade) | Green-tinted (`#F7F9F8`-`#0F1211`), bukan slate neutral web (`#f8fafc`-`#020617`). |
| `success` | 50, 100, 500, 600, 700, 900 | Value default Tailwind, berbeda dari web success `#20a866`. |
| `warning` | 50, 100, 500, 600, 700, 900 | Value default Tailwind, berbeda dari web warning `#f5960a`. |
| `error` | 50, 100, 500, 600, 700, 900 | `error500 = #EF4444`, web error = `#f43f5e` (rose). |
| `info` | 50, 100, 500, 600, 700, 900 | `info500 = #3B82F6`, web info = `#2d9de8`. |
| `secondary` | tidak ada | Web punya green secondary family tersendiri. |
| `accent` | tidak ada | Web punya orange accent family. |
| `purple`, `rose` | tidak ada | Web punya, opsional di Flutter. |

### 2.2 `semantic_colors.dart` � Light Semantic (saat ini)

| Token | Value saat ini | Target web |
|-------|---------------|------------|
| `secondary` | alias `teal500` | Harus menjadi green secondary, bukan teal |
| `background` | `neutral50` = `#F7F9F8` | Web: `#f8fafc` |
| `textPrimary` | `neutral900` = `#0F1211` | Web: `#0f172a` |
| `textSecondary` | `neutral600` = `#4E5654` | Web: `#475569` |
| `textTertiary` | `neutral500` = `#6B7471` | Web: `#94a3b8` |
| `border` | `neutral200` | Web: `#e2e8f0` |
| `surfaceMuted` | tidak ada | Web: `#f1f5f9` |
| `borderLight` | tidak ada | Web dark borderLight: `#1e293b` |
| `borderHover` | tidak ada | Web: `#cbd5e1` (light), `#475569` (dark) |
| `focusRing` | `teal500.withValues(alpha:0.3)` | Web: `rgb(18 91 72 / 0.28)` |

### 2.3 `dark_semantic_colors.dart` � Dark Semantic (saat ini)

| Token | Value saat ini | Target web |
|-------|---------------|------------|
| `background` | `neutral900` = `#0F1211` | Web dark: `#0f172a` |
| `surface` | `neutral800` = `#1E2322` | Web dark: `#1e293b` |
| `surfaceElevated` | `neutral700` = `#2F3533` | Web dark: `#243247` |
| `border` | `neutral600` = `#4E5654` | Web dark: `#334155` |
| `textPrimary` | `neutral50` = `#F7F9F8` | Web dark: `#f8fafc` |
| `textSecondary` | `neutral300` = `#CBD3D0` | Web dark: `#cbd5e1` |
| `textTertiary` | `neutral400` = `#9FAAA6` | Web dark: `#94a3b8` |
| `primary` | `teal400` = `#4FA08F` | Web dark: `#198a6a` |
| `focusRing` | `teal400.withValues(alpha:0.3)` | Web dark: `rgb(31 166 126 / 0.36)` |

### 2.4 `dark_colors.dart` � Masalah Duplikat

- Mendefinisikan class `DarkSemanticColors extends SemanticColors` � nama class yang sama dengan `dark_semantic_colors.dart`.
- Tidak dieksport dari `wash_wallet_ui.dart`.
- Harus dihapus untuk menghilangkan sumber konflik dan kebingungan.

### 2.5 `app_theme.dart` � Masalah ColorScheme dan Hardcoded Color

Bug yang ditemukan:
- `ColorScheme.light` dan `ColorScheme.dark`: `secondary: colors.primary` � seharusnya `colors.secondary`.
- Light `AppBarTheme.titleTextStyle`: `color: Color(0xFF1A1A1A)` � seharusnya `colors.textPrimary`.

### 2.6 Penggunaan Langsung `AppColors.*` di Apps

File yang memakai `AppColors.*` langsung (bukan via `context.colors`):
- `apps/customer/.../splash_screen.dart` � `AppColors.teal600`, `AppColors.teal800`
- `apps/customer/.../welcome_screen.dart` � `AppColors.teal50`, `AppColors.neutral0`
- `apps/production/.../production_summary_card.dart` � `AppColors.teal600`
- `apps/production/.../quick_action_buttons.dart` � `AppColors.teal600`

Perubahan nilai teal600 akan langsung berdampak pada tampilan screen ini. Review visual wajib dilakukan setelah implementasi.

---

## 3. Strategi Implementasi

### Prinsip Utama

1. **Tambah, jangan hapus** � Existing constants `AppColors.teal*`, `AppColors.neutral*` dipertahankan. Nilai teal diperbarui agar selaras web. Nilai neutral dipertahankan sebagai alias backward-compatible.
2. **Slate neutral baru** � Tambah family `AppColors.gray*` yang mengikuti web slate neutral. Semantic token akan pindah ke gray.
3. **Secondary benar** � Tambah `AppColors.secondary*` (green) dan perbaiki `SemanticColors.secondary`.
4. **Accent orange** � Tambah `AppColors.accent*`.
5. **Dark colors align web** � Update semua override di `DarkSemanticColors`.
6. **Hapus `dark_colors.dart`** � File legacy duplikat dihapus setelah konfirmasi tidak ada import langsung.

---

## 4. Proposed Changes

### 4.1 [MODIFY] `app_colors.dart` � Update dan Tambah Raw Palette

**File**: `packages/wash_wallet_ui/lib/src/theme/color/app_colors.dart`

#### A. Update Teal Palette (selaraskan dengan web primary)

Web menggunakan ramp primary dari `#e6f5f1` (50) sampai `#051f19` (950). Perbarui nilai teal agar selaras, tambahkan komentar mapping web.

```
// Primary / Teal -- selaras dengan web --color-primary-*
teal50  = #E6F5F1  (web primary-50)
teal100 = #CCE8E3  (web primary-100)
teal200 = #99D1C7  (web primary-200)
teal300 = #66BAAB  (web primary-300)
teal400 = #33A38F  (web primary-400)
teal500 = #125B48  (web primary-500, brand base)
teal600 = #198A6A  (web primary-600)  [VALUE BERUBAH dari #125B48]
teal700 = #147055  (web primary-700)
teal800 = #0E4738  (web primary-800)
teal900 = #0A3328  (web primary-900)
teal950 = #051F19  (web primary-950)  [BARU]
```

PERHATIAN: `teal400` berubah dari `#4FA08F` ke `#33A38F` dan `teal600` berubah dari `#125B48` ke `#198A6A`. Ini akan mempengaruhi visual splash screen (customer) dan production cards.

#### B. Tambah `gray*` � Slate Neutral Selaras Web

```
gray0   = #FFFFFF
gray50  = #F8FAFC  (web background light)
gray100 = #F1F5F9  (web surface-muted)
gray200 = #E2E8F0  (web border)
gray300 = #CBD5E1  (web border-hover / text-secondary dark)
gray400 = #94A3B8  (web text-tertiary)
gray500 = #64748B
gray600 = #475569  (web text-secondary)
gray700 = #334155  (web border dark)
gray800 = #1E293B  (web surface dark)
gray900 = #0F172A  (web background dark / text-primary)
gray950 = #020617
```

#### C. Pertahankan `neutral*` sebagai Alias Backward-Compatible

Pertahankan `neutral*` dengan nilai lama agar call site di splash/welcome/production tidak berubah visual secara tiba-tiba. Tambahkan komentar `// @deprecated: Gunakan AppColors.gray* untuk referensi baru.`

#### D. Tambah `secondary*` � Green Secondary

```
secondary50  = #F0F9ED  (web secondary-50)
secondary100 = #E1F3DB
secondary200 = #C3E7B7
secondary300 = #A1E887
secondary400 = #6BC15A
secondary500 = #52A744
secondary600 = #438D38
secondary700 = #357F3B
secondary800 = #2A6330
secondary900 = #1F4A23
secondary950 = #0D1F13
```

#### E. Tambah `accent*` � Orange Accent

```
accent50  = #FFF8ED  (web accent-50)
accent100 = #FFEFD4
accent200 = #FEDAA8
accent300 = #FDBE72
accent400 = #FB9B3C
accent500 = #F47F16
accent600 = #DF650C
accent700 = #B94D0F
accent800 = #943D13
accent900 = #783414
accent950 = #411807
```

#### F. Update Status Colors (selaraskan dengan web)

```
success500 = #20A866  (web: #20a866)  [UPDATE]
warning500 = #F5960A  (web: #f5960a)  [UPDATE]
error50    = #FFF1F2  (rose-50)       [UPDATE]
error100   = #FFE4E6  (rose-100)      [UPDATE]
error500   = #F43F5E  (web: #f43f5e)  [UPDATE]
error600   = #E11D48  (rose-600)      [UPDATE]
error700   = #BE123C  (rose-700)      [UPDATE]
error900   = #881337  (rose-900)      [UPDATE]
info500    = #2D9DE8  (web: #2d9de8)  [UPDATE]
```

---

### 4.2 [MODIFY] `semantic_colors.dart` � Update Light Semantic Token

**File**: `packages/wash_wallet_ui/lib/src/theme/color/semantic_colors.dart`

Perubahan yang diperlukan (tunjukkan nilai baru, sebelumnya, dan alasan):

**Primary group:**
```dart
Color get primary => AppColors.teal500;        // UPDATE: teal600 -> teal500 (#125B48, brand base)
Color get onPrimary => AppColors.gray0;        // UPDATE: neutral0 -> gray0 (sama nilai)
Color get primaryDark => AppColors.teal700;
Color get primaryLight => AppColors.teal200;
Color get primarySurface => AppColors.teal50;
```

**Secondary group (FIX utama):**
```dart
Color get secondary => AppColors.secondary500;       // FIX: teal500 -> secondary500 (green)
Color get onSecondary => AppColors.gray0;
Color get secondaryDark => AppColors.secondary700;
Color get secondaryLight => AppColors.secondary300;
Color get secondarySurface => AppColors.secondary50;
```

**Background & Surface:**
```dart
Color get background => AppColors.gray50;          // UPDATE: neutral50 -> gray50 (#F8FAFC)
Color get surface => AppColors.gray0;
Color get surfaceElevated => AppColors.gray0;
Color get surfaceVariant => AppColors.gray100;      // UPDATE: neutral100 -> gray100
Color get surfaceMuted => AppColors.gray100;        // BARU: #F1F5F9
```

**Border:**
```dart
Color get border => AppColors.gray200;             // UPDATE: neutral200 -> gray200 (#E2E8F0)
Color get borderStrong => AppColors.gray300;       // UPDATE
Color get outline => AppColors.gray200;
Color get divider => AppColors.gray200;
Color get borderLight => AppColors.gray200;        // BARU
Color get borderHover => AppColors.gray300;        // BARU: #CBD5E1
```

**Text:**
```dart
Color get textPrimary => AppColors.gray900;        // UPDATE: neutral900 -> gray900 (#0F172A)
Color get textSecondary => AppColors.gray600;      // UPDATE: neutral600 -> gray600 (#475569)
Color get textTertiary => AppColors.gray400;       // UPDATE: neutral500 -> gray400 (#94A3B8)
Color get textDisabled => AppColors.gray300;       // UPDATE
```

**Focus ring:**
```dart
// Light: rgb(18 91 72 / 0.28) = Color(0x47125B48)
Color get focusRing => const Color(0x47125B48);    // UPDATE
```

**Accent (BARU):**
```dart
Color get accent => AppColors.accent500;
Color get onAccent => AppColors.gray0;
Color get accentSurface => AppColors.accent50;
```

**Token yang TIDAK berubah:** `disabled`, `disabledBorder`, `hover`, `pressed`, `focus`, semua status colors (success/warning/error/info/danger), semua business status (revenue/expense/pending/completed/cancelled/lowStock/outOfStock), semua surface tiers, semua icon containers.

---

### 4.3 [MODIFY] `dark_semantic_colors.dart` � Update Dark Semantic Token

**File**: `packages/wash_wallet_ui/lib/src/theme/color/dark_semantic_colors.dart`

**Primary group:**
```dart
Color get primary => AppColors.teal600;            // UPDATE: teal400 -> teal600 (#198A6A)
Color get onPrimary => AppColors.gray0;            // UPDATE: neutral900 -> gray0 (text putih, kontras)
Color get primaryDark => AppColors.teal500;
Color get primaryLight => AppColors.teal800;
Color get primarySurface => AppColors.teal950.withValues(alpha: 0.3);
```

**Secondary group (FIX):**
```dart
Color get secondary => AppColors.secondary400;     // FIX: teal300 -> secondary400 (green)
Color get onSecondary => AppColors.gray900;
Color get secondaryDark => AppColors.secondary600;
Color get secondaryLight => AppColors.secondary800;
Color get secondarySurface => AppColors.secondary950.withValues(alpha: 0.3);
```

**Background & Surface:**
```dart
Color get background => AppColors.gray900;         // UPDATE: neutral900 -> gray900 (#0F172A)
Color get surface => AppColors.gray800;            // UPDATE: neutral800 -> gray800 (#1E293B)
Color get surfaceElevated => const Color(0xFF243247); // UPDATE: web dark #243247
Color get surfaceVariant => AppColors.gray800;
Color get surfaceMuted => const Color(0xFF182235); // BARU: web dark surface-muted #182235
```

**Border:**
```dart
Color get border => AppColors.gray700;             // UPDATE: neutral600 -> gray700 (#334155)
Color get borderStrong => AppColors.gray600;       // UPDATE: neutral500 -> gray600 (#475569)
Color get outline => AppColors.gray700;
Color get divider => AppColors.gray800;            // UPDATE: neutral700 -> gray800 (#1E293B)
Color get borderLight => AppColors.gray800;        // BARU: web dark border-light #1E293B
Color get borderHover => AppColors.gray600;        // BARU: web dark border-hover #475569
```

**Text:**
```dart
Color get textPrimary => AppColors.gray50;         // UPDATE: neutral50 -> gray50 (#F8FAFC)
Color get textSecondary => AppColors.gray300;      // UPDATE: neutral300 -> gray300 (#CBD5E1)
Color get textTertiary => AppColors.gray400;       // UPDATE: neutral400 -> gray400 (#94A3B8)
Color get textDisabled => AppColors.gray600;       // UPDATE: neutral600 -> gray600
```

**Focus ring:**
```dart
// Dark: rgb(31 166 126 / 0.36) = Color(0x5C1FA67E)
Color get focusRing => const Color(0x5C1FA67E);   // UPDATE
```

**Accent (BARU � override):**
```dart
Color get accent => AppColors.accent400;
Color get onAccent => AppColors.gray900;
Color get accentSurface => AppColors.accent950.withValues(alpha: 0.3);
```

**Surface tiers override (UPDATE):**
```dart
Color get surfaceSubtle => AppColors.gray800;      // UPDATE: neutral800 -> gray800
Color get surfaceSelected => AppColors.teal950.withValues(alpha: 0.25);
Color get surfaceDeep => AppColors.gray700;        // UPDATE: neutral700 -> gray700
```

**Icon containers (UPDATE):**
```dart
Color get iconContainerPrimary => AppColors.teal950.withValues(alpha: 0.2);
Color get iconContainerNeutral => AppColors.gray700; // UPDATE
```

---

### 4.4 [DELETE] `dark_colors.dart`

**File**: `packages/wash_wallet_ui/lib/src/theme/color/dark_colors.dart`

**Aksi**: Hapus file ini.

**Sebelum hapus**, verifikasi tidak ada import langsung:
```bash
grep -rn "dark_colors" packages/ apps/
```

Jika hasil grep kosong, aman untuk dihapus. Jika ada hasil, perbaiki import tersebut dahulu untuk mengarah ke `dark_semantic_colors.dart`.

---

### 4.5 [MODIFY] `app_color_extension.dart` � Tambah Token Baru

**File**: `packages/wash_wallet_ui/lib/src/theme/extensions/app_color_extension.dart`

Tambahkan getter berikut setelah getter `secondary` group dan `surface` group:

```dart
// Tambah setelah surfaceVariant
Color get surfaceMuted => colors.surfaceMuted;

// Tambah setelah borderStrong
Color get borderLight => colors.borderLight;
Color get borderHover => colors.borderHover;

// Tambah setelah focusRing
Color get accent => colors.accent;
Color get onAccent => colors.onAccent;
Color get accentSurface => colors.accentSurface;
```

---

### 4.6 [MODIFY] `app_theme.dart` � Fix ColorScheme dan Hardcoded Color

**File**: `packages/wash_wallet_ui/lib/src/theme/app_theme.dart`

**Fix 1**: `ColorScheme.light()` � ubah secondary:
```dart
// SEBELUM
secondary: colors.primary,
onSecondary: colors.onPrimary,

// SESUDAH
secondary: colors.secondary,
onSecondary: colors.onSecondary,
```

**Fix 2**: `ColorScheme.dark()` � ubah secondary (sama dengan light):
```dart
// SEBELUM
secondary: colors.primary,
onSecondary: colors.onPrimary,

// SESUDAH
secondary: colors.secondary,
onSecondary: colors.onSecondary,
```

**Fix 3**: Light `AppBarTheme.titleTextStyle` � hapus hardcoded color:
```dart
// SEBELUM
titleTextStyle: const TextStyle(
  fontSize: 20,
  fontWeight: FontWeight.w600,
  color: Color(0xFF1A1A1A),   // hardcoded
),

// SESUDAH
titleTextStyle: TextStyle(
  fontSize: 20,
  fontWeight: FontWeight.w600,
  color: colors.textPrimary,  // semantic
),
```

---

## 5. Urutan Pengerjaan

Ikuti urutan ini untuk meminimalkan compile error sementara:

```
Step 1: Update app_colors.dart
  - Tambah gray*, secondary*, accent* family
  - Update teal* values selaraskan web
  - Update status color values (success, warning, error, info)
  - Pertahankan neutral* dengan nilai lama (backward compat)

Step 2: Update semantic_colors.dart
  - Update getter yang bergantung pada gray*, secondary*, accent*
  - Tambah token baru: surfaceMuted, borderLight, borderHover, accent, onAccent, accentSurface
  - Update focusRing

Step 3: Update dark_semantic_colors.dart
  - Update semua override bergantung pada gray*, secondary*, accent*
  - Tambah override untuk token baru dari SemanticColors
  - Update focusRing dark

Step 4: Verifikasi dan hapus dark_colors.dart
  - Jalankan: grep -rn "dark_colors" packages/ apps/
  - Jika kosong, hapus file dark_colors.dart
  - Jika ada hasil, perbaiki import dahulu

Step 5: Update app_color_extension.dart
  - Tambah getter untuk token baru

Step 6: Update app_theme.dart
  - Fix secondary di ColorScheme.light() dan ColorScheme.dark()
  - Fix hardcoded color di AppBarTheme light

Step 7: dart format
  - dart format packages/wash_wallet_ui/lib/src/theme/

Step 8: flutter analyze
  - flutter analyze packages/wash_wallet_ui
  - flutter analyze apps/customer
  - flutter analyze apps/cashier
  - flutter analyze apps/production

Step 9: Review visual manual
  - Jalankan setiap app di emulator/device
  - Test light mode dan dark mode
  - Lihat verification plan di bagian 7
```

---

## 6. Token Mapping Lengkap: Web ke Flutter

### Light Theme

| Web Token | Web Value | Flutter Getter | Flutter Value |
|-----------|-----------|----------------|---------------|
| `--color-primary-500` | `#125b48` | `AppColors.teal500` | `#125B48` |
| `--color-primary-600` | `#198a6a` | `AppColors.teal600` | `#198A6A` |
| `background` | `#f8fafc` | `colors.background` | `AppColors.gray50` |
| `surface` | `#ffffff` | `colors.surface` | `AppColors.gray0` |
| `surface-muted` | `#f1f5f9` | `colors.surfaceMuted` | `AppColors.gray100` |
| `text-primary` | `#0f172a` | `colors.textPrimary` | `AppColors.gray900` |
| `text-secondary` | `#475569` | `colors.textSecondary` | `AppColors.gray600` |
| `text-tertiary` | `#94a3b8` | `colors.textTertiary` | `AppColors.gray400` |
| `border` | `#e2e8f0` | `colors.border` | `AppColors.gray200` |
| `border-hover` | `#cbd5e1` | `colors.borderHover` | `AppColors.gray300` |
| `ring` | `rgb(18 91 72 / 0.28)` | `colors.focusRing` | `Color(0x47125B48)` |
| `success` | `#20a866` | `colors.success` | `AppColors.success500` |
| `warning` | `#f5960a` | `colors.warning` | `AppColors.warning500` |
| `error` | `#f43f5e` | `colors.error` | `AppColors.error500` |
| `info` | `#2d9de8` | `colors.info` | `AppColors.info500` |

### Dark Theme

| Web Token | Web Value | Flutter Getter | Flutter Value |
|-----------|-----------|----------------|---------------|
| `background` dark | `#0f172a` | `colors.background` | `AppColors.gray900` |
| `surface` dark | `#1e293b` | `colors.surface` | `AppColors.gray800` |
| `surface-muted` dark | `#182235` | `colors.surfaceMuted` | `Color(0xFF182235)` |
| `surface-elevated` dark | `#243247` | `colors.surfaceElevated` | `Color(0xFF243247)` |
| `text-primary` dark | `#f8fafc` | `colors.textPrimary` | `AppColors.gray50` |
| `text-secondary` dark | `#cbd5e1` | `colors.textSecondary` | `AppColors.gray300` |
| `text-tertiary` dark | `#94a3b8` | `colors.textTertiary` | `AppColors.gray400` |
| `border` dark | `#334155` | `colors.border` | `AppColors.gray700` |
| `border-light` dark | `#1e293b` | `colors.borderLight` | `AppColors.gray800` |
| `border-hover` dark | `#475569` | `colors.borderHover` | `AppColors.gray600` |
| primary dark | `#198a6a` | `colors.primary` | `AppColors.teal600` |
| ring dark | `rgb(31 166 126 / 0.36)` | `colors.focusRing` | `Color(0x5C1FA67E)` |

---

## 7. Verification Plan

### 7.1 Automated (wajib)

```bash
# Format semua file dart yang diubah
dart format packages/wash_wallet_ui/lib/src/theme/

# Analyze � harus zero error baru
flutter analyze packages/wash_wallet_ui
flutter analyze apps/customer
flutter analyze apps/cashier
flutter analyze apps/production
```

### 7.2 Visual Review Manual

Jalankan tiap app di emulator/device dalam **light mode** dan **dark mode**:

| Screen | Elemen yang diverifikasi |
|--------|--------------------------|
| Splash screen (customer) | Gradient teal600 ke teal800 � warna berubah sewajarnya? readability? |
| Welcome screen (customer) | Gradient teal50 ke neutral0 � terlihat natural? |
| Home screen | Background, card, border, text hierarchy |
| Badge / Status chip | Success, warning, error, info � warna selaras web? |
| Primary button | Background primary, text onPrimary � contrast cukup? |
| Outlined button | Border, foreground primary |
| Input field | Border normal, focused border, error border |
| Dialog | Background, text, button |
| Snackbar | Background, text |
| Bottom navigation bar | Selected (primary) vs unselected (textTertiary) |
| Drawer / sidebar | Header background, item color, footer |
| Data table | Header, row divider, border |
| Empty / error / loading state | Icon container color, text |
| Production summary card | Gradient teal, text contrast |
| Quick action buttons | Gradient teal |

---

## 8. Files yang Diubah

| File | Aksi |
|------|------|
| `packages/wash_wallet_ui/lib/src/theme/color/app_colors.dart` | MODIFY |
| `packages/wash_wallet_ui/lib/src/theme/color/semantic_colors.dart` | MODIFY |
| `packages/wash_wallet_ui/lib/src/theme/color/dark_semantic_colors.dart` | MODIFY |
| `packages/wash_wallet_ui/lib/src/theme/color/dark_colors.dart` | DELETE |
| `packages/wash_wallet_ui/lib/src/theme/extensions/app_color_extension.dart` | MODIFY |
| `packages/wash_wallet_ui/lib/src/theme/app_theme.dart` | MODIFY |

---

## 9. Backward Compatibility Summary

| Token / Constant | Status | Catatan |
|-----------------|--------|---------|
| `AppColors.teal50`�`teal900` | Tetap ada, value update | Selaraskan ke web primary ramp |
| `AppColors.teal950` | Baru ditambahkan | |
| `AppColors.neutral0`�`neutral900` | Tetap ada, nilai LAMA dipertahankan | @deprecated, migrasi ke gray* |
| `AppColors.gray*` | Baru ditambahkan | Slate neutral selaras web |
| `AppColors.secondary*` | Baru ditambahkan | Green secondary family |
| `AppColors.accent*` | Baru ditambahkan | Orange accent family |
| `AppColors.success/warning/error/info` | Tetap ada, value update | Selaraskan ke web status colors |
| `context.colors.primary` | Tetap ada | Value update ke teal500 |
| `context.colors.secondary` | Tetap ada | FIX: sekarang green secondary |
| `context.colors.background` | Tetap ada | Update ke gray50 |
| `context.colors.surfaceMuted` | Baru ditambahkan | |
| `context.colors.borderLight` | Baru ditambahkan | |
| `context.colors.borderHover` | Baru ditambahkan | |
| `context.colors.accent/onAccent/accentSurface` | Baru ditambahkan | |
| `dark_colors.dart` | DIHAPUS | Duplikat tidak dieksport |

---

## 10. Risiko dan Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| `teal600` berubah dari `#125B48` ke `#198A6A` � splash dan production card berubah visual | Review visual wajib. Keputusan apakah acceptable diserahkan ke user. |
| `neutral*` dipertahankan nilai lama � sedikit inkonsistensi antara neutral dan gray | Disengaja untuk backward compat. Dokumentasikan sebagai deprecated. |
| Token baru di `SemanticColors` belum ada override di `DarkSemanticColors` | Pastikan setiap getter baru di SemanticColors punya @override di DarkSemanticColors. |
| `dark_colors.dart` dihapus � ada import langsung yang tidak terdeteksi | Jalankan grep sebelum hapus, perbaiki dahulu jika ditemukan. |
| Status color berubah (error jadi rose, warning lebih oranye) � badge/chip berubah visual | Review visual status chip di semua screen. |
| `ColorScheme.secondary` fix � komponen Material yang menggunakan secondary scheme berubah | Review Material default widget yang menggunakan secondary (FAB secondary variant, dll). |
| `onPrimary` dark berubah dari `neutral900` (gelap) ke `gray0` (putih) � contrast dark primary button | Verifikasi contrast ratio primary button di dark mode. |
