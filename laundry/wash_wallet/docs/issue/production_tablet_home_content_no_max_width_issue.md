# Issue: Konten Dashboard Home Production Tidak Dibatasi Lebar (`ContentConstraint` Tidak Dipakai)

Tanggal: 2026-07-02

Dokumen ini adalah hasil review awal untuk masalah layout dashboard tablet Production App. Dokumen ini dibuat sebagai acuan untuk AI model lain saat menyusun implementation plan, bukan sebagai implementasi fix.

## Ringkasan

`HomeScreen` (dashboard utama Production) pada branch non-compact langsung merender konten lewat `SingleChildScrollView` tanpa pembatas lebar (`ContentConstraint`), sehingga di tablet/desktop lebar konten melar mengikuti lebar layar penuh. Ini berbeda dengan `ProfileSettingScreen` di aplikasi yang sama, yang sudah benar membungkus kontennya dengan `ContentConstraint(maxWidth: 1200)` — menunjukkan konvensi ini sudah ada di aplikasi, hanya belum diterapkan konsisten ke Home.

## Area yang Direview

- `apps/production/lib/features/home/presentation/screens/home_screen.dart`
- `apps/production/lib/features/profile/presentation/screens/profile_setting_screen.dart` (pola pembanding yang sudah benar)

## Analisis Teknis

`home_screen.dart` baris ~57-74 (branch non-compact):

```dart
return SingleChildScrollView(
  padding: context.space.insetsHorizontal.lg,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      PageContentHeader(
        title: 'Dashboard Produksi',
        subtitle: ...,
        breadcrumbs: const [BreadcrumbItem(label: 'Dashboard Produksi')],
      ),
      _buildBody(context, state), // ProductionSummaryCard, ProcessQueueCard, ActiveOrderList, dst — tanpa max-width
    ],
  ),
);
```

Bandingkan dengan `profile_setting_screen.dart` (`_ProfileSettingContent.build`):

```dart
return ContentConstraint(
  child: SingleChildScrollView(
    padding: EdgeInsets.all(context.space.lg),
    child: Column(
      children: [
        _buildAvatarSection(context),
        SizedBox(height: context.space.xl),
        _buildFormCard(context),
      ],
    ),
  ),
);
```

`ContentConstraint` menyediakan `maxWidth` default 1200 — pola ini sudah ada dan terbukti dipakai di layar lain, tapi `home_screen.dart` tidak mengadopsinya.

## Akar Masalah

`HomeScreen` dibangun tanpa membungkus kontennya dengan `ContentConstraint`, berbeda dari konvensi yang sudah dipakai `ProfileSettingScreen` di aplikasi yang sama.

## Dampak

1. Pada tablet/desktop lebar (>=1200px), widget-widget dashboard (`ProductionSummaryCard`, `ProcessQueueCard`, `ActiveOrderList`, `PriorityOrderCard`) melebar penuh mengikuti lebar layar, yang bisa membuat kartu/list terlihat terlalu panjang secara horizontal dan sulit dipindai secara visual.
2. Tidak konsisten dengan `ProfileSettingScreen` dalam aplikasi yang sama — pengguna bisa merasakan lebar konten yang berbeda-beda saat berpindah antar halaman.
3. Masalah grid 2-kolom di dashboard (`production_tablet_dashboard_grid_fixed_two_column_issue.md`) menjadi lebih terasa karena kontainer luarnya juga tidak dibatasi — dua masalah ini saling memperbesar dampak visual satu sama lain.

## Arah Perbaikan yang Disarankan

1. Bungkus body non-compact `HomeScreen` dengan `ContentConstraint`, mengikuti pola yang sudah dipakai `ProfileSettingScreen`.
2. Setelah dibatasi, cek ulang tampilan `ProductionSummaryCard` (lihat issue grid 2-kolom) supaya kombinasi max-width + grid kolom yang responsif menghasilkan tampilan yang proporsional, bukan sekadar dua perbaikan terpisah yang belum tentu serasi.
3. Periksa apakah ada halaman non-compact lain di Production yang juga belum memakai `ContentConstraint` (di luar scope pengecekan dokumen ini) untuk konsistensi menyeluruh.

## Acceptance Criteria untuk Fix

1. Konten dashboard Home Production dibatasi lebar maksimumnya pada breakpoint `medium` ke atas, konsisten dengan pola `ContentConstraint` yang sudah dipakai `ProfileSettingScreen`.
2. Tidak ada regresi pada tampilan `compact` (mobile), yang tetap memakai `AppLayout` seperti sebelumnya.
3. Kombinasi dengan perbaikan grid ringkasan (issue terpisah) menghasilkan tampilan dashboard yang proporsional di breakpoint `expanded`/`large`, bukan cuma dua fix independen yang tidak nyambung secara visual.
