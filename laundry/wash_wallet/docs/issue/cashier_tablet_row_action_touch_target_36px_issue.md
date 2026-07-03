# Issue: Row Action Button di `AppDataTable` Berukuran 36px, di Bawah Rekomendasi Touch Target Tablet

Tanggal: 2026-07-02

Dokumen ini adalah hasil review awal untuk masalah ergonomi sentuh pada komponen tabel shared yang dipakai di semua index screen tablet Cashier App. Dokumen ini dibuat sebagai acuan untuk AI model lain saat menyusun implementation plan, bukan sebagai implementasi fix.

## Ringkasan

Tombol aksi baris (row action — View/Edit/Delete) di `AppDataTable` dibatasi ukurannya lewat `BoxConstraints(minWidth: 36, minHeight: 36)`. Angka ini di bawah rekomendasi umum ukuran touch target untuk perangkat sentuh (biasanya ~44-48dp), sehingga berisiko salah tap terutama ketika beberapa row action (mis. Lihat, Edit, Hapus) berjejer berdempetan di satu baris tabel tablet.

## Area yang Direview

- `packages/wash_wallet_ui/lib/src/components/data_view/app_data_table.dart`
- Semua index screen tablet Cashier yang mendaftarkan `rowActions` lewat `AppDataView`/`DataTableRowAction`, mis. `apps/cashier/lib/features/category/presentation/screens/index_categories_screen.dart`, `.../order/.../index_orders_screen.dart`, `.../customer/.../index_customers_screen.dart`.

## Analisis Teknis

Potongan kode `AppDataTable` untuk row action button:

```dart
return Tooltip(
  message: action.tooltip,
  child: IconButton(
    icon: Icon(action.icon, size: 18),
    color: enabled
        ? (action.color ?? context.colors.onSurfaceVariant)
        : context.colors.onSurfaceVariant.withValues(alpha: 0.38),
    onPressed: enabled ? () => action.onTap(row) : null,
    constraints: const BoxConstraints(
      minWidth: 36,
      minHeight: 36,
    ),
    padding: EdgeInsets.zero,
    style: IconButton.styleFrom(
      backgroundColor: enabled
          ? context.colors.surfaceSubtle
          : Colors.transparent,
    ),
  ),
);
```

Setiap index screen tablet Cashier bisa mendaftarkan 2-3 `DataTableRowAction` sekaligus (contoh dari Category: Lihat, Edit, Hapus). Karena tiap tombol hanya 36x36px dan diletakkan berdampingan dalam satu `Row` tanpa spacing eksplisit yang besar, jarak antar tombol jadi sempit — kombinasi ukuran kecil + jarak sempit memperbesar risiko mis-tap, khususnya bagi pengguna yang mengetuk dengan sarung tangan atau di perangkat tablet resistif.

## Akar Masalah

Nilai `minWidth`/`minHeight: 36` di-hardcode langsung di komponen shared tanpa mengacu ke rekomendasi ukuran touch target tablet, dan tidak ada token/`AppDensity` yang mengatur ukuran tombol aksi ini secara terpusat.

## Dampak

1. Risiko salah tap pada row action, terutama pada aksi destruktif seperti Hapus yang berdekatan dengan Lihat/Edit.
2. Pengalaman pakai kurang nyaman di tablet dibanding rekomendasi umum ukuran target sentuh Material Design.
3. Karena ini komponen shared, masalah yang sama otomatis muncul di setiap index screen tablet Cashier yang memakai `rowActions` — bukan hanya satu fitur.

## Arah Perbaikan yang Disarankan

1. Naikkan `minWidth`/`minHeight` row action button ke nilai yang lebih sesuai rekomendasi touch target (misalnya menyamai standar 44-48dp), idealnya lewat token/konstanta yang sudah ada di sistem density, bukan angka baru yang di-hardcode lagi.
2. Jika menaikkan ukuran tombol berdampak pada tinggi baris (`rowHeight`) yang saat ini bervariasi antar fitur (lihat isu density terpisah), pertimbangkan penyesuaian bersamaan supaya tombol tidak terpotong.
3. Tambahkan spacing eksplisit antar row action (bukan hanya mengandalkan padding internal tombol) agar beberapa aksi berjejer tidak saling berdekatan.
4. Lakukan pengecekan visual di semua index screen tablet Cashier yang memakai `rowActions` setelah perubahan, karena ini komponen shared.

## Acceptance Criteria untuk Fix

1. Row action button di semua index screen tablet Cashier memiliki target sentuh yang sesuai rekomendasi umum (bukan lagi 36x36px).
2. Jarak antar row action button yang berjejer (Lihat/Edit/Hapus) cukup untuk mencegah mis-tap.
3. Perubahan ukuran tidak menyebabkan tombol terpotong secara vertikal pada baris dengan `rowHeight` terkecil yang ada di aplikasi.
4. Nilai ukuran baru berasal dari token/konstanta desain, bukan angka pixel baru yang ditulis ulang di banyak tempat.
5. Tidak ada regresi pada lebar kolom yang berdekatan dengan kolom aksi (khususnya pada layar sempit seperti breakpoint `medium`).

## Catatan Design System / Anti-Hardcode

Karena `36` sudah merupakan angka hardcoded yang bermasalah, jangan diganti dengan angka hardcoded lain (mis. `44` ditulis literal). Cek apakah `AppDensity` atau sistem token spacing yang ada sudah punya konstanta ukuran touch target; jika belum, ini kesempatan untuk menambahkannya sebagai token baru yang bisa dipakai ulang, bukan menambal satu komponen saja.
