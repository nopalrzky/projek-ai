# Issue: Dialog Konfirmasi Hapus di Cashier Tidak Dibatasi Lebar pada Tablet

Tanggal: 2026-07-02

Dokumen ini adalah hasil review awal untuk masalah layout dialog pada layar tablet Cashier App. Dokumen ini dibuat sebagai acuan untuk AI model lain saat menyusun implementation plan, bukan sebagai implementasi fix.

## Ringkasan

Dialog konfirmasi hapus (delete confirmation) di beberapa index screen Cashier dibangun langsung dengan `AlertDialog` polos tanpa `ConstrainedBox`/`maxWidth`. Di layar tablet lebar (>=1200px), dialog seperti ini mengikuti perilaku default Material yang bisa melebar tidak proporsional, berbeda dengan pola form/create-edit screen lain di aplikasi yang sudah konsisten memakai `ContentConstraint` untuk membatasi lebar konten.

Sudah dicek langsung: dua contoh konkret ditemukan di Category dan Customer. Unit dan Laundry Service dicek juga (grep untuk `AlertDialog`/`showDialog`) dan **tidak ditemukan pola yang sama** — kemungkinan alur hapus di kedua fitur tersebut berbeda (misalnya lewat halaman terpisah, bukan dialog), sehingga tidak dimasukkan sebagai bagian dari isu ini. Executor lebih lanjut sebaiknya tetap mengecek ulang alur hapus Unit dan Laundry Service untuk memastikan.

## Area yang Direview

- `apps/cashier/lib/features/category/presentation/screens/index_categories_screen.dart` (method `_handleDelete`, baris ~299-342)
- `apps/cashier/lib/features/customer/presentation/screens/index_customers_screen.dart` (baris ~522 dst.)
- `apps/cashier/lib/features/unit/presentation/screens/index_units_screen.dart` — dicek, tidak ditemukan `AlertDialog`
- `apps/cashier/lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart` — dicek, tidak ditemukan `AlertDialog`

## Analisis Teknis

Contoh dari Category (`index_categories_screen.dart`):

```dart
void _handleDelete(int id) {
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(context.radius.lg),
      ),
      title: Row(
        children: [
          Container(...),
          SizedBox(width: context.space.sm),
          const Text('Hapus Kategori'),
        ],
      ),
      content: const Text(
        'Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.',
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Batal')),
        ElevatedButton(
          onPressed: () {
            Navigator.pop(context);
            context.read<CategoryCubit>().destroy(id);
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: context.colors.error,
            foregroundColor: Colors.white,
          ),
          child: const Text('Hapus'),
        ),
      ],
    ),
  );
}
```

Tidak ada `ConstrainedBox`, `maxWidth`, atau pembungkus `ContentConstraint` di manapun pada dialog ini. Pola yang sama juga ditemukan di `index_customers_screen.dart` sekitar baris 522 (`builder: (context) => AlertDialog(...)`, struktur serupa).

Sebagai pembanding, layar create/edit di Cashier (mis. `create_category_screen.dart`) untuk versi tablet sudah memakai `ContentConstraint` untuk membatasi lebar konten form — menunjukkan ada konvensi lebar konten yang mapan di aplikasi, hanya belum diterapkan konsisten ke dialog konfirmasi.

## Akar Masalah

Dialog konfirmasi dibangun langsung dengan `AlertDialog` bawaan Flutter tanpa mengikuti konvensi pembatas lebar (`ContentConstraint`/`ConstrainedBox`) yang sudah dipakai di bagian lain aplikasi untuk konten tablet.

## Dampak

1. Pada tablet lebar (>=1200px), dialog konfirmasi hapus bisa terlihat melebar tidak proporsional dibanding ukuran kontennya yang singkat (judul + satu kalimat + dua tombol).
2. Tidak konsisten secara visual dengan layar form lain di aplikasi yang sudah dibatasi lebarnya.
3. Karena pola `AlertDialog` polos ini kemungkinan disalin ke fitur lain di masa depan (copy-paste antar screen), risiko masalah yang sama menyebar ke fitur baru cukup tinggi kalau tidak diperbaiki di satu pola yang bisa dipakai ulang.

## Arah Perbaikan yang Disarankan

1. Bungkus `AlertDialog` (atau ganti dengan `Dialog` custom) dengan pembatas lebar yang konsisten dengan pola `ContentConstraint` yang sudah ada, dengan lebar maksimum yang wajar untuk dialog konfirmasi singkat (jauh lebih kecil dari `ContentConstraint` default 1200 yang dipakai form penuh).
2. Pertimbangkan membuat satu widget dialog konfirmasi shared/reusable (mis. `AppConfirmationDialog`) di `wash_wallet_ui` supaya semua fitur (Category, Customer, dan fitur mendatang) memakai pola yang sama, alih-alih tiap screen menulis `AlertDialog` sendiri-sendiri.
3. Verifikasi ulang alur hapus di Unit dan Laundry Service — jika ternyata memakai pola dialog serupa yang belum terdeteksi grep (mis. dialog custom dengan nama berbeda), masukkan juga ke scope perbaikan ini.

## Acceptance Criteria untuk Fix

1. Dialog konfirmasi hapus di Category dan Customer memiliki lebar maksimum yang wajar di semua breakpoint tablet (`medium`, `expanded`, `large`), tidak melebar mengikuti lebar layar penuh.
2. Solusi yang dipakai bisa digunakan ulang oleh fitur lain (bukan tambalan khusus satu screen saja).
3. Tidak ada regresi pada tampilan mobile (`compact`) dari dialog yang sama.
4. Alur hapus Unit dan Laundry Service sudah diverifikasi ulang; jika ditemukan pola serupa, diperbaiki dengan solusi yang sama.
