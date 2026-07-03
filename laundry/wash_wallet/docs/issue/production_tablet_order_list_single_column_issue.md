# Issue: Daftar Order Production Tetap 1 Kolom di Tablet, Hanya Ditambah Pagination

Tanggal: 2026-07-02

Dokumen ini adalah hasil review awal untuk masalah kepadatan tampilan daftar order tablet Production App. Dokumen ini dibuat sebagai acuan untuk AI model lain saat menyusun implementation plan, bukan sebagai implementasi fix.

## Ringkasan

Dua tab daftar order (`OrderQueuedTab` untuk status siap dikerjakan, `OrderInProgressTab` untuk status sedang dikerjakan) sama-sama merender order memakai `ListView.separated` satu kolom penuh, baik di mobile maupun tablet. Saat tablet (`!AppBreakpoints.isCompact`), satu-satunya penyesuaian yang dilakukan adalah menambahkan `AppPagination` di bawah list — layout list itu sendiri tidak pernah berubah menjadi grid multi-kolom. Sudah diverifikasi langsung: kedua tab memakai pola identik.

## Area yang Direview

- `apps/production/lib/features/order/presentation/widgets/order_queued_tab.dart`
- `apps/production/lib/features/order/presentation/widgets/order_in_progress_tab.dart`
- `apps/production/lib/features/order/presentation/widgets/order_item_card.dart` (ukuran kartu, relevan bila beralih ke grid)

## Analisis Teknis

`order_queued_tab.dart` baris ~49-78 (identik strukturnya dengan `order_in_progress_tab.dart`):

```dart
final isTablet = !AppBreakpoints.isCompact(context);

Widget listWidget = RefreshIndicator(
  onRefresh: () async { ... },
  child: ListView.separated(
    padding: EdgeInsets.all(context.space.md),
    itemCount: state.orders.length,
    separatorBuilder: (context, index) => SizedBox(height: context.space.md),
    itemBuilder: (context, index) {
      final order = state.orders[index];
      return OrderItemCard(order: order, showProcessButton: true, ...);
    },
  ),
);

if (isTablet) {
  return Column(
    children: [
      Expanded(child: listWidget),        // <-- list yang sama persis dengan mobile
      Container(
        child: AppPagination(...),        // satu-satunya perbedaan tablet: pagination di bawah
      ),
    ],
  );
}

return listWidget;
```

Tidak ada percabangan yang mengubah `ListView` menjadi grid pada `isTablet == true` — kartu order tetap selebar layar di kedua tab, baik pada breakpoint `medium` (600-840px) maupun `expanded`/`large` (>=840px).

## Akar Masalah

Penyesuaian tablet pada kedua tab ini hanya menyentuh pagination, bukan struktur layout list itu sendiri — tidak ada logic yang memetakan lebar layar ke jumlah kolom kartu order.

## Dampak

1. Pada tablet lebar (`expanded`/`large`), satu kartu order memenuhi lebar penuh layar meski isinya relatif ringkas (info order + tombol proses), membuat tampilan terasa kosong/boros ruang horizontal.
2. Jumlah order yang terlihat sekaligus tanpa scroll tetap sama seperti mobile, padahal layar tablet punya ruang untuk menampilkan lebih banyak order sekaligus (mis. 2-3 kartu per baris) — mengurangi efisiensi workflow operator produksi yang perlu memindai antrian order dengan cepat.
3. Kedua tab (`OrderQueuedTab`, `OrderInProgressTab`) sama-sama terdampak karena strukturnya identik — perbaikan di satu tempat kemungkinan besar bisa dipakai ulang untuk keduanya.

## Arah Perbaikan yang Disarankan

1. Pada `isTablet == true`, ganti `ListView.separated` dengan grid responsif (pola serupa `ResponsiveGrid` yang sudah dipakai untuk isu dashboard, `production_tablet_dashboard_grid_fixed_two_column_issue.md`) sehingga jumlah kolom kartu order menyesuaikan `WindowSizeClass`.
2. Sesuaikan `OrderItemCard` agar tetap enak dilihat dalam format grid (cek `childAspectRatio`, ukuran teks, dan tombol proses) — kartu ini didesain untuk full-width list, jadi kemungkinan perlu penyesuaian proporsi saat diletakkan dalam grid sempit.
3. Terapkan perubahan yang sama secara konsisten ke `OrderQueuedTab` dan `OrderInProgressTab` sekaligus, karena strukturnya identik — hindari memperbaiki satu tab saja dan meninggalkan yang lain tidak konsisten.
4. Pastikan `AppPagination` tetap berfungsi dengan baik di bawah grid (bukan cuma di bawah list satu kolom).

## Acceptance Criteria untuk Fix

1. Pada breakpoint `medium` ke atas, daftar order di kedua tab (Queued, In Progress) menampilkan lebih dari satu kartu per baris, menyesuaikan `WindowSizeClass`.
2. Kartu order (`OrderItemCard`) tetap terbaca baik (tidak terlalu padat/terpotong) dalam format grid pada semua breakpoint tablet.
3. Pagination tetap berfungsi dan tampil konsisten di bawah grid.
4. Tidak ada regresi pada tampilan mobile (`compact`), yang tetap memakai `ListView` satu kolom seperti sebelumnya.
5. Solusi diterapkan konsisten pada kedua tab, tidak hanya salah satu.
