# Issue: Density Tabel Tablet Cashier Hardcode ke Compact, Row Height Tidak Konsisten Antar Fitur

Tanggal: 2026-07-02

Dokumen ini adalah hasil review awal untuk inkonsistensi density/row-height pada tabel tablet Cashier App. Dokumen ini dibuat sebagai acuan untuk AI model lain saat menyusun implementation plan, bukan sebagai implementasi fix.

## Ringkasan

Sistem density (`AppDensity`) menyediakan preset row height untuk mode `compact` dan `standard`, tapi seluruh index screen tablet Cashier yang memakainya selalu hardcode `AppDensityMode.compact` — tidak ada yang menyesuaikan density berdasarkan `WindowSizeClass` (mis. tablet besar/`large` seharusnya bisa memakai density lebih lega). Order screen bahkan tidak memakai `AppDensity` sama sekali dan menulis angka row height sendiri (96/108), sehingga row height antar fitur tabel tidak konsisten satu sama lain.

## Area yang Direview

- `packages/wash_wallet_ui/lib/src/theme/density/app_density.dart`
- `apps/cashier/lib/features/customer/presentation/screens/index_customers_screen.dart`
- `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`
- `apps/cashier/lib/features/category/presentation/screens/index_categories_screen.dart`
- `apps/cashier/lib/features/unit/presentation/screens/index_units_screen.dart`

## Analisis Teknis

Preset density yang tersedia:

```dart
static double tableRowHeight(AppDensityMode mode) =>
    mode == AppDensityMode.compact ? 52.0 : 64.0;

static double tableTwoLineRowHeight(AppDensityMode mode) =>
    mode == AppDensityMode.compact ? 72.0 : 88.0;
```

Pemakaian nyata di tiap fitur berbeda-beda:

- **Customer** (`index_customers_screen.dart`): memakai preset dengan mode di-hardcode compact —
  ```dart
  rowHeight: AppDensity.tableTwoLineRowHeight(AppDensityMode.compact), // = 72.0
  ```
- **Order** (`index_orders_screen.dart`): tidak memakai `AppDensity` sama sekali, menulis angka sendiri —
  ```dart
  rowHeight: isCondensedTable ? 108 : 96,
  ```
- **Category** (`index_categories_screen.dart`): tidak meng-override `rowHeight` sama sekali, sehingga memakai default `AppDataView` (`56.0`) — beda lagi dari Customer (72) dan Order (96/108).

Tidak satu pun dari screen ini membaca `WindowSizeClass` untuk menentukan mode density — semua selalu `AppDensityMode.compact` (atau tidak memakai `AppDensity` sama sekali), padahal `AppBreakpoints` sudah membedakan `medium`/`expanded`/`large` yang secara logis punya ruang berbeda untuk kelonggaran baris.

## Akar Masalah

1. Tidak ada mekanisme yang menghubungkan `WindowSizeClass` dengan pemilihan `AppDensityMode` — density selalu di-hardcode compact di tempat yang memakainya sama sekali.
2. Tidak ada konvensi yang mewajibkan pemakaian `AppDensity` helper — Order bebas menulis angka row height sendiri, menyebabkan row height antar fitur (56 / 72 / 96 / 108) tidak konsisten tanpa alasan konten yang jelas terdokumentasi di satu tempat.

## Dampak

1. Tampilan antar tabel (Category vs Customer vs Order) punya row height berbeda tanpa justifikasi desain yang terlihat, membuat aplikasi terasa tidak konsisten saat berpindah fitur.
2. Tablet besar (`large`, >=1200px) mendapat kepadatan baris yang sama dengan tablet kecil (`medium`, 600-840px), padahal ruang layar jauh lebih luas — kesempatan membuat tampilan lebih lega di layar besar tidak dimanfaatkan.
3. Menambah fitur tabel baru berisiko menambah angka row height baru lagi (pola ke-4, ke-5, dst.) karena tidak ada pedoman yang jelas kapan harus pakai `AppDensity` vs angka custom.

## Arah Perbaikan yang Disarankan

1. Pertimbangkan menambahkan logic yang memetakan `WindowSizeClass` ke `AppDensityMode` (mis. `medium` → compact, `expanded`/`large` → standard atau varian yang lebih lega), lalu terapkan di semua index screen tablet secara konsisten.
2. Migrasikan Order dan Category untuk memakai helper `AppDensity` yang sudah ada (`tableRowHeight`/`tableTwoLineRowHeight`) alih-alih angka custom (96/108) atau default yang tidak disengaja (56).
3. Jika Order memang butuh row height berbeda karena kontennya 2-baris dengan badge, itu wajar — tapi nilainya sebaiknya berasal dari preset `AppDensity` (atau varian baru yang ditambahkan ke `AppDensity`), bukan angka literal di file screen.
4. Dokumentasikan kapan sebuah tabel dianggap "two-line" vs "single-line" agar pemilihan preset density konsisten dan predictable untuk fitur-fitur berikutnya.

## Acceptance Criteria untuk Fix

1. Semua index screen tablet Cashier menentukan row height lewat helper `AppDensity`, tidak ada lagi angka row height yang ditulis literal di file screen (kecuali di dalam `AppDensity` sendiri).
2. Row height merespons `WindowSizeClass` — tablet besar mendapat kelonggaran yang berbeda (lebih lega) dibanding tablet kecil, atau ada keputusan eksplisit yang mendokumentasikan kenapa tidak perlu beda.
3. Tidak ada regresi tinggi baris yang menyebabkan konten terpotong di breakpoint manapun.
4. Perbedaan row height antar fitur (bila masih ada) punya alasan konten yang jelas (mis. jumlah baris teks per cell), bukan kebetulan historis.

## Catatan Design System / Anti-Hardcode

Order screen saat ini adalah contoh konkret dari angka hardcoded yang menyimpang dari sistem density (`96`/`108` alih-alih memakai `AppDensity.tableTwoLineRowHeight`). Saat memperbaiki, pastikan solusinya menambah/menyesuaikan preset di `AppDensity`, bukan menambahkan konstanta baru lagi di level masing-masing screen.
