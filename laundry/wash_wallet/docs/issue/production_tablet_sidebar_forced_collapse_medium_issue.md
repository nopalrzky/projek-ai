# Issue: `OperationalTabletShell` Memaksa Sidebar Collapsed di Seluruh Breakpoint Medium Tanpa Opsi Expand

Tanggal: 2026-07-02

Dokumen ini adalah hasil review awal untuk masalah navigasi tablet pada komponen shell yang dipakai bersama oleh Production App dan Cashier App. Dokumen ini dibuat sebagai acuan untuk AI model lain saat menyusun implementation plan, bukan sebagai implementasi fix.

## Ringkasan

Sidebar navigasi tablet (`OperationalSidebar`, dirender lewat `OperationalTabletShell`) otomatis collapsed (lebar sempit, label menu hilang) untuk seluruh rentang breakpoint `medium` (600-840px), dan pada breakpoint ini tombol toggle expand/collapse juga disembunyikan — artinya pengguna tidak punya cara sama sekali untuk melihat sidebar dengan label penuh selama berada di rentang lebar tersebut, walau ruang konten yang tersisa (~759px pada lebar 840px) sebenarnya cukup luas untuk menampung sidebar penuh.

Root cause berada di komponen shared `OperationalTabletShell`, bukan di kode khusus Production maupun Cashier — jadi perilaku ini identik di kedua aplikasi.

## Area yang Direview

- `packages/wash_wallet_ui/lib/src/components/layout/operational_tablet_shell/operational_tablet_shell.dart`
- `packages/wash_wallet_ui/lib/src/components/layout/operational_sidebar/` (konsumen `collapsed`/`expandedWidth`/`collapsedWidth`)
- `apps/production/lib/core/navigation/production_shell_screen.dart`
- `apps/cashier/lib/core/navigation/main_shell_screen.dart` (verified: memakai `OperationalTabletShell` yang sama)

## Analisis Teknis

Logic collapse ada di dalam `_OperationalTabletShellState.build()`:

```dart
final sizeClass = AppBreakpoints.of(context);
final isCompact = sizeClass == WindowSizeClass.compact;

if (isCompact) {
  return Scaffold(body: widget.body);
}

final isMedium = sizeClass == WindowSizeClass.medium;
final collapsed = isMedium || _isSidebarCollapsed;

return Scaffold(
  body: Row(
    children: [
      OperationalSidebar(
        ...
        collapsed: collapsed,
        expandedWidth: widget.config.expandedSidebarWidth,   // 268.0
        collapsedWidth: widget.config.collapsedSidebarWidth, // 80.0
      ),
      ...
```

Tombol toggle sidebar juga sengaja disembunyikan saat `isMedium`:

```dart
extraActions: [
  if (!isMedium)
    TopHeaderAction(
      icon: _isSidebarCollapsed ? Icons.menu : Icons.menu_open,
      onTap: _toggleSidebar,
      tooltip: _isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar',
    ),
],
```

Artinya: `_isSidebarCollapsed` (state manual dari toggle button) tidak relevan sama sekali selama `isMedium` bernilai true, karena `collapsed` sudah dipaksa true oleh kondisi `isMedium ||` di depannya, dan tombol untuk mengubahnya pun tidak ditampilkan.

`ProductionShellScreen` dan Cashier `MainShellScreen` sama-sama memanggil `OperationalTabletShell(...)` tanpa parameter tambahan yang bisa meng-override perilaku ini — keduanya murni konsumen pasif dari logic di atas.

## Akar Masalah

Kondisi `collapsed = isMedium || _isSidebarCollapsed` membuat seluruh breakpoint `medium` (600-840px) terkunci ke mode collapsed tanpa mekanisme opt-out, sekaligus menyembunyikan satu-satunya kontrol UI (`TopHeaderAction` toggle) yang bisa mengubahnya.

## Dampak

1. Pengguna tablet 600-840px (mis. tablet portrait umum) tidak pernah melihat label menu sidebar, hanya ikon — navigasi jadi kurang jelas terutama untuk menu yang ikonnya mirip.
2. Tidak ada jalan keluar manual: tombol expand/collapse memang disembunyikan khusus di breakpoint ini, jadi keterbatasan ini bukan bug tersembunyi tapi keputusan desain eksplisit yang mungkin sudah usang.
3. Ruang yang tersisa setelah sidebar collapsed (~759px pada 840px) kemungkinan cukup untuk sidebar penuh (268px) + konten yang layak, sehingga potensi ruang terbuang.
4. Karena root cause di komponen shared, dampaknya identik di Production App dan Cashier App — perbaikan atau justifikasi ulang harus mempertimbangkan kedua aplikasi sekaligus.

## Arah Perbaikan yang Disarankan

1. Pertimbangkan menghitung ambang collapse berdasarkan lebar aktual yang tersisa setelah sidebar expanded (`expandedWidth` + estimasi lebar konten minimum), bukan mengunci seluruh breakpoint `medium` secara membabi buta.
2. Alternatif: biarkan default collapsed di `medium` (sebagai starting state), tapi tetap tampilkan tombol toggle supaya pengguna bisa memilih expand jika mau — cukup hapus kondisi `if (!isMedium)` pada `extraActions`.
3. Jika keputusan produk memang ingin sidebar selalu collapsed di `medium` (misalnya karena constraint desain tertentu), dokumentasikan alasannya secara eksplisit di kode/komentar supaya tidak terlihat seperti bug bagi kontributor berikutnya.
4. Verifikasi hasil akhir di kedua aplikasi (Production, Cashier) pada lebar 600, 700, 840px untuk memastikan sidebar tidak memakan terlalu banyak ruang konten saat expanded di ujung bawah rentang `medium`.

## Acceptance Criteria untuk Fix

1. Pengguna punya cara (baik otomatis berdasarkan lebar tersedia, atau manual lewat toggle) untuk melihat sidebar dengan label penuh selama berada di breakpoint `medium`, kecuali ada keputusan produk eksplisit yang mendokumentasikan sebaliknya.
2. Tombol toggle sidebar tidak disembunyikan tanpa alasan yang terdokumentasi.
3. Tidak ada regresi pada breakpoint `expanded`/`large` yang sudah berjalan dengan baik (toggle manual tetap berfungsi).
4. Perubahan diverifikasi di Production App dan Cashier App karena keduanya memakai `OperationalTabletShell` yang sama.
