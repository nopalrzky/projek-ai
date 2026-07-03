# Issue: Default `columnGap` 0 pada `AppDataView`/`AppDataTable` Membuat Semua Tabel Tablet Cashier Rapat

Tanggal: 2026-07-02

Dokumen ini adalah hasil review awal untuk masalah visual pada komponen tabel shared yang dipakai di banyak layar tablet Cashier App. Dokumen ini dibuat sebagai acuan untuk AI model lain saat menyusun implementation plan, bukan sebagai implementasi fix.

## Ringkasan

`AppDataView` (dan `AppDataTable` yang dibungkusnya) adalah komponen shared di `wash_wallet_ui` yang dipakai oleh hampir semua index screen tablet di Cashier App (Order, Customer, Category, Unit, Laundry Service). Komponen ini menerima parameter `columnGap` untuk memberi jarak visual antar kolom tabel, tapi nilai default-nya adalah `0.0`. Order sudah punya issue terpisah soal text overlap (`cashier_tablet_order_index_table_text_overlap_issue.md`), tapi root cause yang sama (`columnGap` default 0) ternyata membuat kolom di Category, Unit, dan Laundry Service juga rapat — hanya belum terdokumentasi karena belum ada laporan visual eksplisit untuk layar-layar tersebut.

## Area yang Direview

- `packages/wash_wallet_ui/lib/src/components/data_view/app_data_view.dart`
- `packages/wash_wallet_ui/lib/src/components/data_view/app_data_table.dart`
- `apps/cashier/lib/features/category/presentation/screens/index_categories_screen.dart`
- `apps/cashier/lib/features/unit/presentation/screens/index_units_screen.dart`
- `apps/cashier/lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart`
- `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart` (referensi — sudah overload rowHeight tapi tidak override columnGap)

## Analisis Teknis

Default parameter di `AppDataView` (`app_data_view.dart`):

```dart
final double rowHeight;
final double columnGap;

const AppDataView({
  ...
  this.rowHeight = 56.0,
  this.columnGap = 0.0,   // <-- default 0, diteruskan langsung ke AppDataTable
  ...
});
```

`columnGap` ini diteruskan apa adanya ke `AppDataTable` di dalam `build()`:

```dart
AppDataTable<T>(
  columns: columns,
  rows: rows,
  ...
  rowHeight: rowHeight,
  columnGap: columnGap,
  ...
)
```

`AppDataTable` sendiri sudah punya logic untuk menyisipkan gap antar cell (`_buildCellsWithGap`), tapi logic ini tidak berguna kalau caller tidak pernah mengisi `columnGap` secara eksplisit:

```dart
List<Widget> _buildCellsWithGap(List<Widget> cells) {
  if (widget.columnGap <= 0 || cells.isEmpty) return cells;
  ...
}
```

Semua index screen berikut memanggil `AppDataView` tanpa parameter `columnGap`, sehingga otomatis 0:

- `index_categories_screen.dart` — `_buildTabletTable()` memanggil `AppDataView<Category>(...)` tanpa `columnGap`.
- `index_units_screen.dart` — sama, tanpa `columnGap`.
- `index_laundry_services_screen.dart` — sama, tanpa `columnGap`.

Order screen (`index_orders_screen.dart`) sudah dikeluhkan lewat issue terpisah karena kolom Total dan Tanggal menabrak — itu gejala spesifik dari root cause yang sama, bukan bug yang berdiri sendiri.

## Akar Masalah

Nilai default `columnGap: 0.0` di komponen shared `AppDataView` membuat SEMUA konsumennya tampil rapat kecuali caller secara eksplisit mengisi nilai gap sendiri. Karena hampir tidak ada screen yang melakukan override ini, masalah bukan cuma di satu layar (Order) tapi sistemik di semua tabel tablet Cashier.

## Dampak

1. Kolom-kolom di tabel Category, Unit, dan Laundry Service secara visual menempel satu sama lain, walau belum separah Order (yang juga punya masalah tambahan seperti width sempit dan konten 2-baris).
2. Tidak konsisten: penampilan "rapat" ini baru terlihat sebagai bug ketika kontennya panjang/2-baris (seperti di Order), tapi sebenarnya berlaku di semua tabel — risiko regresi serupa akan terus muncul di fitur tabel baru selama default belum diperbaiki.
3. Perbaikan yang hanya menyasar Order (menambah `columnGap` di satu screen saja) tidak akan menyelesaikan masalah yang sama di Category/Unit/Laundry Service.
4. Developer baru yang menambah index screen baru dengan `AppDataView` default akan otomatis mewarisi bug ini tanpa sadar.

## Arah Perbaikan yang Disarankan

1. Pertimbangkan mengubah default `columnGap` di `AppDataView`/`AppDataTable` menjadi nilai token density (mis. `AppDensity`/`context.space`) alih-alih `0.0`, sehingga semua konsumen otomatis mendapat spacing yang layak tanpa perlu override manual di tiap screen.
2. Alternatif lain: pertahankan default 0 tapi audit semua pemanggilan `AppDataView` di Cashier dan tambahkan `columnGap` eksplisit secara konsisten di setiap layar (Category, Unit, Laundry Service, dan Order sesuai issue terpisahnya).
3. Pastikan solusi ini tidak mengubah tampilan tabel yang sudah eksplisit override (bila ada) — cek semua pemanggilan sebelum mengubah default.
4. Jika mengubah default, tambahkan smoke test visual singkat di setiap index screen tablet Cashier untuk memastikan tidak ada halaman yang tiba-tiba jadi terlalu lebar/renggang.

## Acceptance Criteria untuk Fix

1. Semua index screen tablet Cashier (Order, Customer, Category, Unit, Laundry Service) menampilkan jarak visual yang jelas antar kolom tabel.
2. Tidak ada satupun `AppDataView` yang secara tidak sengaja tetap `columnGap: 0` tanpa alasan eksplisit.
3. Perubahan pada `AppDataView`/`AppDataTable` (baik default maupun caller) memakai design token, bukan angka pixel baru yang di-hardcode.
4. Order tetap konsisten dengan solusi yang sama (tidak treatment berbeda dari Category/Unit/Laundry Service) kecuali ada alasan konten spesifik (mis. dua-baris per cell).
5. Tidak ada regresi visual pada tabel yang sudah terlihat baik sebelumnya di kedua breakpoint tablet (`medium` 600-840px dan `expanded`/`large` >=840px).

## Catatan Design System / Anti-Hardcode

Jangan perbaiki masalah ini dengan menambahkan angka pixel baru langsung di masing-masing screen (mis. `columnGap: 12` di satu tempat, `columnGap: 8` di tempat lain). Gunakan token spacing yang sudah ada (`context.space.*` atau helper `AppDensity`) supaya jarak antar kolom konsisten di seluruh aplikasi dan mudah diubah terpusat di masa depan.
