# Cashier Tablet Home Crash: NavigationRail Extended Assertion

## Ringkasan

Saat user sudah login dan masuk ke Home aplikasi cashier pada tampilan tablet/lebar besar, build `MainShellScreen` gagal karena assertion Flutter di `NavigationRail`.

Error yang dilaporkan:

```text
Exception caught by widgets library
The following assertion was thrown building AdaptiveScaffold(dirty, dependencies: [MediaQuery]):
'package:flutter/src/material/navigation_rail.dart': Failed assertion: line 120 pos 15: '!extended || (labelType == null || labelType == NavigationRailLabelType.none)': is not true.

The relevant error-causing widget was:
    AdaptiveScaffold AdaptiveScaffold:file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/core/navigation/main_shell_screen.dart:94:12
```

## Status Debug

- Scope pekerjaan ini hanya debug dan dokumentasi issue.
- Tidak ada perubahan kode aplikasi.
- File yang paling relevan:
  - `apps/cashier/lib/core/navigation/main_shell_screen.dart`
  - `packages/wash_wallet_ui/lib/src/components/layout/adaptive_scaffold.dart`
  - `packages/wash_wallet_ui/lib/src/theme/responsive/app_breakpoints.dart`

## Alur Reproduksi

1. Jalankan aplikasi cashier.
2. Login sampai masuk ke root shell/home.
3. Gunakan viewport tablet atau layar besar.
4. `MainShellScreen` membangun `AdaptiveScaffold`.
5. Pada size class tertentu, `AdaptiveScaffold` membangun `NavigationRail`.
6. Flutter melempar assertion sebelum halaman selesai render.

Catatan: dari implementasi breakpoint saat ini, assertion ini hanya bisa terjadi ketika `AdaptiveScaffold` memilih mode `NavigationRail` dengan `extended: true`. Di kode saat ini itu terjadi untuk `WindowSizeClass.large`, yaitu width `>= 1200`.

## Analisis Teknis

`MainShellScreen` memanggil `AdaptiveScaffold` di `apps/cashier/lib/core/navigation/main_shell_screen.dart`:

```dart
return AdaptiveScaffold(
  currentIndex: widget.navigationShell.currentIndex,
  onDestinationSelected: _onTabTap,
  destinations: cashierBottomNavItems.map((item) => AdaptiveDestination(
    label: item.label ?? '',
    icon: item.icon,
    selectedIcon: item.activeIcon,
  )).toList(),
  body: GestureDetector(
    onHorizontalDragEnd: _onHorizontalDragEnd,
    child: SlideTransition(
      position: _slideAnimation,
      child: widget.navigationShell,
    ),
  ),
);
```

`AdaptiveScaffold` kemudian memilih layout berdasarkan `AppBreakpoints.of(context)`.

Untuk `compact`, widget memakai bottom navigation. Untuk selain `compact`, widget memakai `NavigationRail`:

```dart
NavigationRail(
  selectedIndex: currentIndex,
  onDestinationSelected: onDestinationSelected,
  labelType: NavigationRailLabelType.all,
  extended: sizeClass == WindowSizeClass.large,
  destinations: destinations.map((d) => NavigationRailDestination(
    icon: Icon(d.icon),
    selectedIcon: Icon(d.selectedIcon ?? d.icon),
    label: Text(d.label),
  )).toList(),
),
```

Masalahnya ada pada kombinasi properti ini:

```dart
labelType: NavigationRailLabelType.all,
extended: true,
```

Flutter Material `NavigationRail` tidak mengizinkan `extended == true` jika `labelType` masih bernilai selain `null` atau `NavigationRailLabelType.none`.

Assertion yang relevan:

```text
!extended || (labelType == null || labelType == NavigationRailLabelType.none)
```

Artinya:

- Jika `extended == false`, `labelType: NavigationRailLabelType.all` masih valid.
- Jika `extended == true`, `labelType` harus `null` atau `NavigationRailLabelType.none`.

## Hubungan dengan Breakpoint Tablet

Breakpoint saat ini:

```dart
static const double compact = 600.0;
static const double medium = 840.0;
static const double expanded = 1200.0;

if (width < compact) {
  return WindowSizeClass.compact;
} else if (width < medium) {
  return WindowSizeClass.medium;
} else if (width < expanded) {
  return WindowSizeClass.expanded;
} else {
  return WindowSizeClass.large;
}
```

Dengan aturan tersebut:

- `< 600`: bottom navigation, tidak terkena issue.
- `600 - 839`: compact `NavigationRail`, `extended == false`, valid.
- `840 - 1199`: compact `NavigationRail`, `extended == false`, valid.
- `>= 1200`: extended `NavigationRail`, `extended == true`, crash karena `labelType == NavigationRailLabelType.all`.

Jadi bila crash muncul pada perangkat tablet, kemungkinan viewport logical width perangkat tersebut masuk `>= 1200`, misalnya tablet landscape atau emulator tablet besar.

## Root Cause

Root cause utama adalah bug konfigurasi `NavigationRail` di shared widget `AdaptiveScaffold`:

```dart
labelType: NavigationRailLabelType.all,
extended: sizeClass == WindowSizeClass.large,
```

Saat `sizeClass == WindowSizeClass.large`, nilai `extended` menjadi `true`, tetapi `labelType` tetap `NavigationRailLabelType.all`. Kombinasi ini melanggar kontrak Flutter Material `NavigationRail`.

## Area Terdampak

Semua screen yang berada di bawah `MainShellScreen` cashier dapat gagal render pada width `>= 1200`, karena crash terjadi di shell navigasi sebelum konten route selesai ditampilkan.

Destinasi yang terdampak berasal dari `cashierBottomNavItems`:

- Home
- Dana
- Transaksi
- Setting

Walaupun user melaporkan issue saat masuk Home, akar masalahnya bukan konten Home. Crash terjadi di wrapper navigasi `AdaptiveScaffold`.

## Bukti dari Kode

- `apps/cashier/lib/core/navigation/main_shell_screen.dart`
  - `MainShellScreen.build()` mengembalikan `AdaptiveScaffold`.
  - Tidak ada properti khusus dari Home yang mengubah konfigurasi rail.

- `packages/wash_wallet_ui/lib/src/components/layout/adaptive_scaffold.dart`
  - `NavigationRail` selalu diberi `labelType: NavigationRailLabelType.all`.
  - `extended` menjadi `true` ketika `sizeClass == WindowSizeClass.large`.

- `packages/wash_wallet_ui/lib/src/theme/responsive/app_breakpoints.dart`
  - `WindowSizeClass.large` aktif saat width `>= 1200`.

## Catatan untuk Penyusun Plan Perbaikan

Plan perbaikan sebaiknya fokus pada `AdaptiveScaffold`, bukan screen Home.

Beberapa arah solusi yang perlu dievaluasi:

1. Buat `labelType` conditional:
   - `NavigationRailLabelType.all` untuk rail non-extended.
   - `null` atau `NavigationRailLabelType.none` saat `extended == true`.
2. Simpan boolean lokal, misalnya `final isExtendedRail = sizeClass == WindowSizeClass.large;`, agar konfigurasi rail konsisten dan mudah dites.
3. Tambahkan widget test atau golden-lite test untuk `AdaptiveScaffold` pada width:
   - `< 600`
   - `600`
   - `840`
   - `1200`
   - `>= 1200`
4. Verifikasi manual setelah fix:
   - Cashier login -> Home pada tablet portrait.
   - Cashier login -> Home pada tablet landscape/lebar `>= 1200`.
   - Navigasi Home/Dana/Transaksi/Setting tetap berpindah branch.

## Non-Goal Issue Ini

- Tidak memperbaiki kode.
- Tidak mengubah desain adaptive navigation.
- Tidak mengubah breakpoint.
- Tidak mengubah konten Home.
- Tidak mengubah routing `go_router`.
