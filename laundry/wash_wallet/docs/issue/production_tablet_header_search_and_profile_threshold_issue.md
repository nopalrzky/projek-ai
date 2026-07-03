# Issue: `OperationalTopHeader` — Search Field 400px & Threshold Info User 900px Tidak Selaras Breakpoint

Tanggal: 2026-07-02

Dokumen ini adalah hasil review awal untuk masalah layout header tablet pada komponen shell yang dipakai bersama oleh Production App dan Cashier App. Dokumen ini dibuat sebagai acuan untuk AI model lain saat menyusun implementation plan, bukan sebagai implementasi fix.

## Ringkasan

`OperationalTopHeader` adalah komponen header shared (`wash_wallet_ui`) yang dipakai lewat `OperationalTabletShell`, sehingga dipakai oleh Production App maupun Cashier App di layar tablet. Ada dua angka hardcoded di dalamnya yang tidak selaras dengan sistem breakpoint (`AppBreakpoints`) aplikasi:

1. Kolom pencarian dibatasi `maxWidth: 400` secara tetap, tidak peduli lebar layar tablet.
2. Info nama/subtitle user di pojok kanan hanya muncul jika `MediaQuery.sizeOf(context).width > 900` — angka 900 ini tidak sama dengan breakpoint resmi `AppBreakpoints.medium = 840`, sehingga tablet di rentang 840-900px (yang sudah dianggap tablet oleh sistem breakpoint) tetap kehilangan info identitas user.

Karena `OperationalTabletShell` dipakai baik oleh `ProductionShellScreen` (`apps/production/lib/core/navigation/production_shell_screen.dart`) maupun `MainShellScreen` Cashier (`apps/cashier/lib/core/navigation/main_shell_screen.dart:163`), kedua masalah ini tereproduksi identik di kedua aplikasi.

## Area yang Direview

- `packages/wash_wallet_ui/lib/src/components/layout/operational_top_header/operational_top_header.dart`
- `packages/wash_wallet_ui/lib/src/theme/responsive/app_breakpoints.dart`
- `apps/production/lib/core/navigation/production_shell_screen.dart`
- `apps/cashier/lib/core/navigation/main_shell_screen.dart` (verified: juga memakai `OperationalTabletShell`, jadi ikut terdampak)

## Analisis Teknis

Kolom pencarian (`operational_top_header.dart` baris ~117-121):

```dart
if (widget.showSearch)
  Expanded(
    flex: 3,
    child: ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 400),
      child: TextField(...),
    ),
  )
else
  const Spacer(),
```

Threshold info user (`operational_top_header.dart` baris ~272):

```dart
if (MediaQuery.sizeOf(context).width > 900) ...[
  const SizedBox(width: 12),
  Column(
    children: [
      Text(widget.userName!),
      if (widget.userSubtitle != null) Text(widget.userSubtitle!),
    ],
  ),
],
```

Breakpoint resmi aplikasi (`app_breakpoints.dart`):

```dart
enum WindowSizeClass { compact, medium, expanded, large }
compact  = 600.0
medium   = 840.0
expanded = 1200.0
```

Angka `900` di atas berada di antara `medium` (840) dan `expanded` (1200), tidak match keduanya — artinya perilaku UI berubah pada breakpoint "siluman" yang tidak terdokumentasi di sistem breakpoint resmi.

## Akar Masalah

Dua angka (`400` untuk search field, `900` untuk threshold user info) ditulis langsung sebagai literal di komponen shared, tanpa mengacu ke `AppBreakpoints`/`WindowSizeClass` yang sudah jadi sumber kebenaran breakpoint di aplikasi.

## Dampak

1. Tablet pada rentang 840-900px (resmi "tablet" menurut `AppBreakpoints.medium`) tetap kehilangan info nama/subtitle user di header — pengguna tidak bisa memastikan akun mana yang sedang login tanpa membuka menu lain.
2. Search field tidak memanfaatkan ruang tambahan pada tablet lebar (`expanded`/`large`), sehingga terlihat sama sempit di layar 840px maupun 1400px.
3. Karena komponen ini dipakai bersama, masalah muncul identik di Production App dan Cashier App — perbaikan di satu tempat otomatis memperbaiki keduanya, tapi sebaliknya jika luput, keduanya tetap bermasalah.
4. Menambah kebingungan bagi developer berikutnya: ada dua sumber breakpoint yang berbeda (`AppBreakpoints` resmi vs angka 900 lokal) untuk keputusan UI yang mirip.

## Arah Perbaikan yang Disarankan

1. Ganti kondisi `MediaQuery.sizeOf(context).width > 900` dengan pemeriksaan berbasis `AppBreakpoints.of(context)`/`WindowSizeClass`, misalnya tampil mulai dari `WindowSizeClass.medium` ke atas.
2. Buat lebar maksimum search field mengikuti breakpoint (mis. lebih lebar di `expanded`/`large` dibanding `medium`), alih-alih satu angka tetap 400.
3. Setelah perubahan, cek ulang keseimbangan flex antara search field, clock/date, action icons, dan info user supaya tidak ada elemen yang terpotong di breakpoint manapun.
4. Karena komponen ini shared, verifikasi hasil akhir di kedua aplikasi (Production dan Cashier) pada breakpoint `medium`, `expanded`, dan `large`.

## Acceptance Criteria untuk Fix

1. Info nama/subtitle user tampil mulai dari breakpoint resmi `medium` (840px), bukan lagi pada angka 900 yang tidak selaras.
2. Lebar search field beradaptasi dengan breakpoint, tidak lagi satu angka tetap di semua ukuran tablet.
3. Tidak ada elemen header (search, clock, notifikasi, info user) yang saling bertabrakan/terpotong pada breakpoint `medium`, `expanded`, maupun `large`.
4. Perubahan diverifikasi berjalan konsisten di Production App dan Cashier App, karena keduanya memakai komponen yang sama.
5. Threshold dan lebar yang baru diambil dari `AppBreakpoints`/token, bukan angka pixel baru yang di-hardcode lagi.

## Catatan Design System / Anti-Hardcode

Angka `900` dan `400` adalah contoh nyata drift dari sistem breakpoint resmi. Perbaikan harus mengacu ke `AppBreakpoints`/`WindowSizeClass` yang sudah ada, bukan menambah angka hardcoded baru yang berpotensi drift lagi di kemudian hari.
