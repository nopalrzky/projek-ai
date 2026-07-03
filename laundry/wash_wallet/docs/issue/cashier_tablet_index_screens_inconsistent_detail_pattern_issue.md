# Issue: Pola Tampilan Detail Tablet Tidak Konsisten Antar Index Screen Cashier

Tanggal: 2026-07-02

Dokumen ini adalah hasil review awal untuk inkonsistensi pola UX tablet antar fitur di Cashier App. Dokumen ini dibuat sebagai acuan untuk AI model lain saat menyusun implementation plan, bukan sebagai implementasi fix — dan sengaja memuat pertanyaan terbuka karena ini menyentuh keputusan desain, bukan sekadar bug teknis.

## Ringkasan

Order dan Customer di Cashier App menampilkan detail baris tabel dengan pola two-pane embedded (tabel di kiri, detail di kanan, tanpa pindah halaman). Category, Unit, dan Laundry Service — meski berjalan di shell tablet yang sama — pada aksi Lihat/Edit (row action maupun row tap) malah berpindah ke route/halaman terpisah, meninggalkan tabel sepenuhnya. Ini membuat pengalaman tablet terasa tidak konsisten antar fitur dalam satu aplikasi yang sama.

## Area yang Direview

- `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart` (pola two-pane — referensi)
- `apps/cashier/lib/features/customer/presentation/screens/index_customers_screen.dart` (pola two-pane — referensi)
- `apps/cashier/lib/features/category/presentation/screens/index_categories_screen.dart` (pola navigasi terpisah)
- `apps/cashier/lib/features/unit/presentation/screens/index_units_screen.dart`
- `apps/cashier/lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart`

## Analisis Teknis

Pola Order & Customer (two-pane embedded), contoh struktur dari Order:

```dart
Row(
  children: [
    Expanded(flex: 2, child: AppDataView<Order>(...)),   // tabel
    if (_selectedOrderId != null)
      Expanded(flex: 1, child: ShowOrderScreen(...)),      // detail, di-render inline
  ],
)
```

Pola Category (navigasi ke route terpisah), verified dari `index_categories_screen.dart`:

```dart
rowActions: [
  DataTableRowAction<Category>(
    icon: Icons.visibility_outlined,
    tooltip: 'Lihat',
    onTap: (category) => _handleTap(category.id),
  ),
  ...
],
onRowTap: (category) => _handleTap(category.id),

...

void _handleTap(int id) {
  context.push('/categories/$id').then((_) => _handleRefresh());
}

void _handleEdit(Category category) {
  context.push('/categories/${category.id}/edit', extra: category)
      .then((_) => _handleRefresh());
}
```

Baik `onRowTap` maupun row action "Lihat"/"Edit" di Category sama-sama memanggil `context.push(...)` — berpindah ke route baru, bukan merender detail di panel kanan seperti Order/Customer. Unit dan Laundry Service mengikuti pola navigasi yang sama (berdasarkan struktur kode index screen yang serupa).

## Akar Masalah

Tidak ada konvensi/keputusan desain terdokumentasi soal kapan sebuah index screen tablet harus memakai pola two-pane embedded vs kapan cukup navigasi halaman terpisah. Order & Customer kemungkinan besar dibangun lebih dulu dengan pola two-pane, sementara Category/Unit/Laundry Service dibangun mengikuti pola CRUD standar (list → push ke halaman lain) tanpa menyesuaikan ke pola tablet yang sudah ada di fitur lain.

## Dampak (termasuk pertanyaan terbuka)

1. Pengalaman pengguna berbeda tanpa alasan yang jelas saat berpindah dari Order/Customer (tetap di tabel, detail muncul di samping) ke Category/Unit/Laundry Service (tabel hilang, harus tekan kembali untuk balik ke daftar).
2. Fitur yang memakai navigasi terpisah tidak memanfaatkan ruang tablet lebar sebaik Order/Customer — pada layar `expanded`/`large`, membuka halaman detail penuh untuk data sesederhana kategori/unit terasa berlebihan dibanding menampilkannya di panel samping.
3. **Pertanyaan produk yang belum terjawab dan perlu diputuskan sebelum implementasi:** apakah Category/Unit/Laundry Service sebaiknya diseragamkan ke pola two-pane (mengikuti Order/Customer), atau justru Order/Customer yang terlalu kompleks dan sebaiknya disederhanakan ke pola navigasi biasa? Dokumen ini tidak berasumsi jawabannya — kedua arah punya trade-off (two-pane lebih baik untuk data yang sering dicek-silang, tapi menambah kompleksitas state management tiap screen).

## Arah Perbaikan yang Disarankan

1. Jika arah yang dipilih adalah menyeragamkan ke two-pane: gunakan pola yang sudah terbukti di Order/Customer sebagai referensi implementasi (state `_selectedXxxId`, `Row` dengan `Expanded` flex 2:1), diterapkan ke Category/Unit/Laundry Service.
2. Jika arah yang dipilih adalah mempertahankan navigasi terpisah untuk data sederhana: dokumentasikan kriteria eksplisit kapan sebuah fitur "butuh" two-pane (mis. volume data besar, kebutuhan cek-silang cepat) vs kapan navigasi biasa sudah cukup, supaya keputusan ini konsisten untuk fitur-fitur mendatang.
3. Terlepas dari arah yang dipilih, pertimbangkan juga slot `secondaryBody` yang sudah tersedia di komponen shell `OperationalTabletShell` (lihat `production_tablet_two_pane_shell_unused_for_orders_issue.md`) sebagai kemungkinan pola terpusat, alih-alih setiap screen membangun two-pane manual sendiri-sendiri seperti saat ini.
4. Jangan menerapkan salah satu arah secara sepihak tanpa konfirmasi — sajikan sebagai pilihan ke pemangku kepentingan produk terlebih dahulu.

## Acceptance Criteria untuk Fix

1. Ada keputusan eksplisit dan terdokumentasi soal kriteria pola detail tablet (two-pane vs navigasi halaman) yang berlaku untuk seluruh index screen Cashier.
2. Semua index screen tablet Cashier (Order, Customer, Category, Unit, Laundry Service) mengikuti kriteria yang sama secara konsisten — tidak ada lagi perbedaan pola tanpa alasan.
3. Jika Category/Unit/Laundry Service diseragamkan ke two-pane, implementasinya memakai pola/komponen yang bisa dipakai ulang, bukan duplikasi manual di setiap screen.
4. Tidak ada regresi pada Order/Customer yang sudah berjalan dengan pola two-pane saat ini.
