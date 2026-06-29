# Fix Plan: NavigationRail Extended Assertion Crash

> Berdasarkan issue: `docs/issue/cashier_tablet_home_navigation_rail_extended_assertion_issue.md`

---

## Ringkasan Masalah

`AdaptiveScaffold` crash dengan assertion Flutter saat viewport `>= 1200` (WindowSizeClass.large) karena kombinasi properti yang tidak valid:

```dart
// Di: packages/wash_wallet_ui/lib/src/components/layout/adaptive_scaffold.dart
labelType: NavigationRailLabelType.all,  // ❌ tidak boleh saat extended == true
extended: sizeClass == WindowSizeClass.large,
```

Flutter `NavigationRail` menegakkan aturan:
```
!extended || (labelType == null || labelType == NavigationRailLabelType.none)
```

---

## Scope Perbaikan

| Area | Tindakan |
|---|---|
| `packages/wash_wallet_ui/lib/src/components/layout/adaptive_scaffold.dart` | ✅ **Ubah** – fix konfigurasi NavigationRail |
| `packages/wash_wallet_ui/test/` (baru) | ✅ **Buat** – widget test untuk AdaptiveScaffold |
| `apps/cashier/lib/core/navigation/main_shell_screen.dart` | ❌ Tidak diubah |
| `packages/wash_wallet_ui/lib/src/theme/responsive/app_breakpoints.dart` | ❌ Tidak diubah |
| Routing go_router, konten Home, desain adaptive navigation | ❌ Tidak diubah |

---

## Langkah 1 – Perbaiki `adaptive_scaffold.dart`

### File
```
packages/wash_wallet_ui/lib/src/components/layout/adaptive_scaffold.dart
```

### Perubahan

Ganti blok `NavigationRail` di method `build()` (sekitar baris 63–73):

**Sebelum (buggy):**
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

**Sesudah (fixed):**
```dart
NavigationRail(
  selectedIndex: currentIndex,
  onDestinationSelected: onDestinationSelected,
  extended: sizeClass == WindowSizeClass.large,
  labelType: sizeClass == WindowSizeClass.large
      ? null
      : NavigationRailLabelType.all,
  destinations: destinations.map((d) => NavigationRailDestination(
    icon: Icon(d.icon),
    selectedIcon: Icon(d.selectedIcon ?? d.icon),
    label: Text(d.label),
  )).toList(),
),
```

### Penjelasan Rasional

- Saat `extended == true`, label destinasi sudah ditampilkan di samping icon secara otomatis oleh Flutter. Menetapkan `labelType` selain `null`/`none` redundan **sekaligus** melanggar assertion.
- Saat `extended == false` (medium/expanded), `labelType: NavigationRailLabelType.all` tetap dipertahankan agar label tampil di bawah icon — perilaku ini tidak berubah dari sebelumnya.

### Tips Implementasi

Untuk keterbacaan, extrak boolean lokal sebelum widget NavigationRail:

```dart
@override
Widget build(BuildContext context) {
  final sizeClass = AppBreakpoints.of(context);
  final isExtended = sizeClass == WindowSizeClass.large; // ← tambahkan ini

  if (sizeClass == WindowSizeClass.compact) {
    // ... (tidak berubah)
  }

  return Scaffold(
    floatingActionButton: floatingActionButton,
    body: Row(
      children: [
        NavigationRail(
          selectedIndex: currentIndex,
          onDestinationSelected: onDestinationSelected,
          extended: isExtended,
          labelType: isExtended ? null : NavigationRailLabelType.all,
          destinations: destinations.map((d) => NavigationRailDestination(
            icon: Icon(d.icon),
            selectedIcon: Icon(d.selectedIcon ?? d.icon),
            label: Text(d.label),
          )).toList(),
        ),
        // ... (tidak berubah)
      ],
    ),
  );
}
```

---

## Langkah 2 – Tulis Widget Test untuk `AdaptiveScaffold`

### Lokasi File Test (buat baru jika belum ada)
```
packages/wash_wallet_ui/test/src/components/layout/adaptive_scaffold_test.dart
```

### Deskripsi Test

Test harus menggunakan `MediaQuery` dengan width berbeda untuk memvalidasi:

1. **Width < 600 (compact)** → Harus render `BottomNavigationBar` / `AppBottomBar`, tidak ada `NavigationRail`.
2. **Width = 600 (medium)** → Harus render `NavigationRail` dengan `extended == false` dan `labelType == NavigationRailLabelType.all`.
3. **Width = 840 (expanded)** → Harus render `NavigationRail` dengan `extended == false` dan `labelType == NavigationRailLabelType.all`.
4. **Width = 1200 (large)** → Harus render `NavigationRail` dengan `extended == true` dan `labelType == null` (atau `none`). **Tidak boleh throw assertion.**
5. **Width = 1440 (large, oversized)** → Sama dengan poin 4. Tidak boleh crash.

### Contoh Struktur Test

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

// Helper untuk membungkus widget dengan ukuran tertentu
Widget buildSubject({
  required double width,
  required double height,
}) {
  return MaterialApp(
    home: MediaQuery(
      data: MediaQueryData(size: Size(width, height)),
      child: AdaptiveScaffold(
        currentIndex: 0,
        onDestinationSelected: (_) {},
        destinations: const [
          AdaptiveDestination(label: 'Home', icon: Icons.home),
          AdaptiveDestination(label: 'Dana', icon: Icons.account_balance_wallet),
          AdaptiveDestination(label: 'Transaksi', icon: Icons.receipt_long),
          AdaptiveDestination(label: 'Setting', icon: Icons.settings),
        ],
        body: const SizedBox.expand(),
      ),
    ),
  );
}

void main() {
  group('AdaptiveScaffold', () {
    testWidgets('compact (< 600): renders BottomNavigationBar, no NavigationRail', (tester) async {
      await tester.pumpWidget(buildSubject(width: 599, height: 800));
      expect(find.byType(NavigationRail), findsNothing);
      // Cari AppBottomBar atau BottomNavigationBar
      expect(find.byType(BottomNavigationBar), findsOneWidget);
    });

    testWidgets('medium (600): renders NavigationRail, extended == false, does not crash', (tester) async {
      await tester.pumpWidget(buildSubject(width: 600, height: 800));
      final rail = tester.widget<NavigationRail>(find.byType(NavigationRail));
      expect(rail.extended, isFalse);
      expect(rail.labelType, NavigationRailLabelType.all);
    });

    testWidgets('expanded (840): renders NavigationRail, extended == false, does not crash', (tester) async {
      await tester.pumpWidget(buildSubject(width: 840, height: 800));
      final rail = tester.widget<NavigationRail>(find.byType(NavigationRail));
      expect(rail.extended, isFalse);
      expect(rail.labelType, NavigationRailLabelType.all);
    });

    testWidgets('large (1200): renders NavigationRail, extended == true, labelType null/none, does not crash', (tester) async {
      await tester.pumpWidget(buildSubject(width: 1200, height: 800));
      final rail = tester.widget<NavigationRail>(find.byType(NavigationRail));
      expect(rail.extended, isTrue);
      final isLabelTypeValid = rail.labelType == null ||
          rail.labelType == NavigationRailLabelType.none;
      expect(isLabelTypeValid, isTrue,
          reason: 'labelType must be null or none when extended == true');
    });

    testWidgets('large (1440): renders NavigationRail, extended == true, does not crash', (tester) async {
      await tester.pumpWidget(buildSubject(width: 1440, height: 900));
      final rail = tester.widget<NavigationRail>(find.byType(NavigationRail));
      expect(rail.extended, isTrue);
    });
  });
}
```

> [!NOTE]
> Sesuaikan `find.byType(BottomNavigationBar)` dengan tipe widget actual `AppBottomBar`. Periksa di `packages/wash_wallet_ui/lib/src/components/layout/app_bottom_bar/` untuk mendapat nama widget yang tepat.

---

## Langkah 3 – Jalankan Test & Verifikasi Manual

### 3.1 Jalankan Widget Test

```bash
# Dari root project
flutter test packages/wash_wallet_ui/test/src/components/layout/adaptive_scaffold_test.dart -v
```

Semua 5 test case harus pass.

### 3.2 Verifikasi Manual (Cashier App)

Jalankan cashier app di emulator/device dengan ukuran viewport berbeda:

| Skenario | Viewport Width | Ekspektasi |
|---|---|---|
| Phone portrait | ~360–414 | Bottom nav bar tampil |
| Tablet portrait | ~600–768 | NavigationRail collapsed (icon + label bawah) |
| Tablet landscape | ~840–1199 | NavigationRail collapsed (icon + label bawah) |
| **Large tablet/desktop** | **>= 1200** | **NavigationRail extended (label di samping icon), tidak crash** |

Langkah verifikasi manual:
1. Jalankan `apps/cashier`.
2. Login hingga masuk ke Home.
3. Resize emulator atau gunakan device dengan width >= 1200.
4. Verifikasi navigasi berpindah dengan benar ke tab: Home → Dana → Transaksi → Setting.
5. Verifikasi tidak ada exception di console.

---

## Ringkasan Perubahan File

| File | Aksi | Penjelasan |
|---|---|---|
| `packages/wash_wallet_ui/lib/src/components/layout/adaptive_scaffold.dart` | **Modify** | Ubah `labelType` menjadi conditional (null saat extended, all saat tidak) |
| `packages/wash_wallet_ui/test/src/components/layout/adaptive_scaffold_test.dart` | **Create** | Widget test untuk 5 skenario breakpoint |

---

## Definisi Done

- [ ] `AdaptiveScaffold` di width >= 1200 tidak lagi throw assertion.
- [ ] `NavigationRail` compact (width 600–1199) masih menampilkan label di bawah icon (`labelType: all`).
- [ ] `NavigationRail` extended (width >= 1200) menampilkan label di samping icon.
- [ ] Semua 5 widget test pass tanpa error.
- [ ] Verifikasi manual cashier app: navigasi berfungsi di 4 tab pada viewport >= 1200.
- [ ] Tidak ada perubahan di luar scope (breakpoint, routing, Home screen, design).
