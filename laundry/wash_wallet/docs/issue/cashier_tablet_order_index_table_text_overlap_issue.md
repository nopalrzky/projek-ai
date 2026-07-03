# Issue: Text Overlap dan Truncation pada Tabel Order Tablet Cashier

Tanggal: 2026-06-30

Dokumen ini berisi hasil debug awal untuk masalah visual pada tampilan index order tablet Cashier App. Dokumen ini dibuat sebagai acuan untuk AI model lain saat menyusun implementation plan, bukan sebagai implementasi fix.

## Ringkasan Masalah

Pada tampilan `IndexOrdersScreen` versi tablet cashier, terdapat beberapa masalah layout tabel:

1. Kolom `Total` dan `Tanggal` terlihat terlalu rapat sehingga nominal harga menabrak atau hampir menabrak teks tanggal transaksi.
2. Jarak antar kolom tabel kurang proporsional pada layar tablet.
3. Teks ID/no pesanan terpotong di dalam badge/chip order number.
4. Nomor telepon pelanggan di baris tabel terpotong di bagian bawah karena ruang vertikal atau padding baris tidak cukup.

Masalah ini muncul di tampilan index order tablet, bukan di layout mobile list.

## Area yang Direview

File utama:

1. `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`
2. `packages/wash_wallet_ui/lib/src/components/data_view/app_data_table.dart`
3. `packages/wash_wallet_ui/lib/src/components/data_view/app_data_view.dart`
4. `packages/wash_wallet_ui/lib/src/components/data_view/models/data_table_column_def.dart`
5. `packages/wash_wallet_ui/lib/src/components/badge/app_badge.dart`
6. `packages/wash_wallet_ui/lib/src/components/badge/app_badge_size.dart`
7. `packages/wash_wallet_ui/lib/src/components/badge/order_status_badge.dart`
8. `packages/wash_wallet_ui/lib/src/components/badge/payment_status_badge.dart`

## Temuan Debug

### 1. Kolom tabel order tablet memakai kombinasi fixed width yang sempit

Di `IndexOrdersScreen._buildTabletColumnDefs()`, beberapa kolom memakai fixed width:

```dart
No. Pesanan: 144
Status: 148
Total: 136
Tanggal: 128
```

Kolom `Pelanggan` tidak punya fixed width sehingga menjadi flex column. Dalam layar tablet, terutama saat detail panel kanan terbuka, area tabel kiri menyempit. Kombinasi fixed width + satu kolom flex membuat ruang antar kolom mudah terasa padat.

### 2. `AppDataTable` tidak memberi gap horizontal antar cell

`AppDataTable._buildRow()` membangun row dengan urutan cell langsung:

```dart
Row(
  children: [
    ...widget.columns.map((col) {
      return col.width != null
          ? SizedBox(width: col.width, child: cell)
          : Expanded(flex: col.flex, child: cell);
    }),
    rowActions,
  ],
)
```

Tidak ada `SizedBox`, column gap, atau padding per-cell di antara kolom. Jika isi kolom `Total` align kanan dan kolom `Tanggal` mulai tepat setelahnya, dua teks bisa terlihat menyatu atau saling menabrak secara visual.

### 3. Row height tetap dan cell berisi konten vertikal dua tingkat

`IndexOrdersScreen` mengirim:

```dart
rowHeight: 88,
```

Setiap cell order tablet memakai `Column(mainAxisAlignment: MainAxisAlignment.center)` dengan dua tingkat teks/badge:

1. No pesanan: badge order number + teks jumlah item.
2. Pelanggan: nama pelanggan + icon telepon + nomor telepon.
3. Total: total amount + payment status badge.
4. Tanggal: tanggal + icon jam + waktu.

Walaupun `rowHeight` sudah lebih besar dari default, konten dengan badge, icon, teks, gap 7-8px, dan font weight tebal masih rawan clipping pada tablet tertentu, text scale tinggi, atau saat style badge lebih tinggi dari asumsi.

### 4. `AppDataTable` hanya memberi padding horizontal, bukan padding vertikal

Di `_buildRow()`, row dibungkus:

```dart
SizedBox(
  height: widget.rowHeight,
  child: Padding(
    padding: const EdgeInsets.symmetric(horizontal: 16.0),
    child: Row(...),
  ),
)
```

Tidak ada vertical padding di level row. Akibatnya semua cell bergantung pada tinggi tetap `rowHeight`. Jika konten cell sedikit lebih tinggi, teks bawah seperti nomor telepon atau waktu bisa terpotong.

### 5. Badge/chip ID pesanan memakai fixed column width dan text ellipsis

No pesanan dirender sebagai `Container` dengan padding horizontal, lalu `Text`:

```dart
Container(
  padding: EdgeInsets.symmetric(horizontal: 10, vertical: 6),
  child: Text(
    order.orderNumber,
    maxLines: 1,
    overflow: TextOverflow.ellipsis,
  ),
)
```

Kolom `No. Pesanan` hanya `144px`. Jika nomor order panjang, padding badge mengurangi ruang teks sehingga ID pesanan mudah terpotong. Karena badge berada di dalam column fixed-width, tidak ada fallback seperti smaller font, min/max width adaptif, tooltip, atau cell width yang lebih longgar.

### 6. Tabel tidak punya strategi horizontal overflow untuk tablet sempit/two-pane

`AppDataTable` dirender dalam `Expanded` dan `Row` biasa. Tidak terlihat adanya `SingleChildScrollView` horizontal atau mekanisme responsive untuk menyembunyikan/meringkas kolom saat lebar tidak cukup.

Saat `IndexOrdersScreen` membuka detail embedded kanan, list order hanya memakai `Expanded(flex: 2)` dan detail memakai `Expanded(flex: 1)`. Ini mempersempit tabel kiri, sementara fixed width kolom tetap sama.

## Dugaan Akar Masalah

Akar masalah utama adalah layout tabel tablet belum punya sizing strategy yang aman untuk data padat:

1. Fixed width kolom terlalu agresif untuk layar tablet dan two-pane mode.
2. Tidak ada gap/padding horizontal antar kolom.
3. Row height fixed tidak disertai vertical padding atau adaptive height.
4. Cell berisi dua baris konten visual, tetapi tinggi baris tidak dihitung dari intrinsic content.
5. Tidak ada horizontal scroll atau responsive column behavior saat available width kurang.
6. Beberapa angka layout masih tersebar langsung di screen/table (`rowHeight`, column width, padding/gap), sehingga sulit dijaga konsisten antar halaman.

## Catatan Design System / Anti-Hardcode

Fix yang disusun nanti sebaiknya tidak hanya mengganti angka fixed secara lokal di `IndexOrdersScreen`.

Repo sudah memiliki fondasi design system di `packages/wash_wallet_ui`, termasuk:

1. spacing token melalui `context.space`;
2. radius token melalui `context.radius`;
3. typography token melalui `context.typography`;
4. density helper di `packages/wash_wallet_ui/lib/src/theme/density/app_density.dart`;
5. shared table component `AppDataTable`.

Karena issue ini terkait pola tabel yang bisa terjadi di halaman lain, plan fix sebaiknya menambahkan kemampuan reusable di shared UI, misalnya:

1. `AppDataTable` menerima `columnGap`, `rowPadding`, atau density-aware spacing;
2. `AppDataTable` memakai token spacing/density untuk header padding, row padding, cell gap, dan action width;
3. `DataTableColumnDef` mendukung min/max width atau responsive priority jika diperlukan;
4. order screen hanya mengatur kebutuhan domain seperti kolom mana yang ditampilkan, bukan menaruh semua ukuran layout secara hardcoded;
5. jika ada ukuran khusus order table, bungkus sebagai konfigurasi bernama atau helper lokal yang tetap memakai token shared UI.

Tujuannya agar perbaikan visual konsisten dengan halaman `AppDataView` lain dan tidak menjadi patch khusus yang rapuh.

## Dampak

1. Data order sulit discan di tablet.
2. Nominal dan tanggal terlihat seperti satu area `TotalTanggal`.
3. No pesanan tidak bisa dibaca penuh.
4. Nomor telepon pelanggan terpotong sehingga informasi kontak tidak utuh.
5. Tampilan terasa kurang proporsional dan kurang profesional untuk aplikasi kasir tablet.

## Panduan untuk Plan Fix

Plan berikutnya sebaiknya mempertimbangkan:

1. Tambahkan spacing/padding antar cell di `AppDataTable`, atau dukung `columnGap`, dengan nilai default dari token spacing/density.
2. Revisi width kolom order tablet, terutama `No. Pesanan`, `Total`, dan `Tanggal`, tetapi hindari angka magic yang tersebar langsung di banyak tempat.
3. Pertimbangkan menggabungkan `Total` dan payment badge dengan alignment yang lebih compact, atau memberi min width lebih besar melalui konfigurasi reusable.
4. Pertimbangkan menggabungkan `Tanggal` dan jam dengan format lebih pendek jika lebar terbatas.
5. Tambahkan vertical padding pada row atau ubah row height order menjadi lebih adaptif berdasarkan density/table variant.
6. Pastikan `AppDataTable` punya strategy saat total fixed width melebihi available width: horizontal scroll, responsive column hide, atau alternate compact cell.
7. Saat detail panel kanan terbuka, pertimbangkan layout khusus yang mengurangi kolom tabel kiri atau menutup detail jika width tidak cukup.
8. Untuk badge ID pesanan, gunakan width yang cukup, font lebih kecil, tooltip, atau tampilkan order number sebagai plain text dengan accent color jika badge terlalu memakan ruang.
9. Jika perlu menambah style baru, letakkan di `wash_wallet_ui` sebagai bagian dari table/data-view styling agar halaman lain bisa reuse.
10. Verifikasi pada tablet portrait, tablet landscape, dan kondisi detail embedded terbuka.

## Acceptance Criteria untuk Fix

1. Nominal total tidak menabrak atau terlihat menyatu dengan tanggal transaksi.
2. Ada jarak visual yang jelas antara kolom `Total` dan `Tanggal`.
3. No pesanan tidak terpotong pada format order number normal yang digunakan sistem.
4. Nomor telepon pelanggan tidak terpotong di bagian bawah baris.
5. Row order tetap rapi dengan dua tingkat informasi pada setiap cell.
6. Tabel tetap usable saat detail order embedded kanan terbuka.
7. Tidak ada horizontal overflow warning atau text clipping pada tablet portrait dan landscape.
8. Perubahan shared `AppDataTable` tidak merusak halaman lain yang memakai `AppDataView`.
9. Spacing, padding, density, dan radius memakai token/shared UI API, bukan hardcode lokal yang tidak reusable.

## Status Debug

Bug belum diperbaiki di kode. Hasil debug menunjukkan issue berada pada layout/sizing tabel tablet, terutama kombinasi fixed column width, tidak adanya gap antar cell, row height tetap, dan konten cell yang terlalu padat untuk ruang yang tersedia.
