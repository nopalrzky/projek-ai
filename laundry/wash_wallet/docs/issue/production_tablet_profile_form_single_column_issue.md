# Issue: Form Profil Production Tetap 1 Kolom Penuh Walau Sudah Dibatasi Lebar

Tanggal: 2026-07-02

Dokumen ini adalah hasil review awal untuk masalah pemanfaatan ruang form pada layar tablet Production App. Dokumen ini dibuat sebagai acuan untuk AI model lain saat menyusun implementation plan, bukan sebagai implementasi fix.

## Ringkasan

`ProfileSettingScreen` sudah benar membungkus kontennya dengan `ContentConstraint` (lihat juga `production_tablet_home_content_no_max_width_issue.md` yang menjadikan screen ini sebagai referensi pola yang baik), tapi field-field di dalamnya (Nama Lengkap, Email, No. Handphone, Jenis Kelamin, Alamat) semua di-stack vertikal satu kolom penuh. Di tablet lebar, field pendek seperti Nama/Email/No. Handphone jadi terlihat sangat memanjang secara horizontal dan boros ruang, padahal field-field tersebut cocok diletakkan berdampingan dalam 2 kolom.

## Area yang Direview

- `apps/production/lib/features/profile/presentation/screens/profile_setting_screen.dart`

## Analisis Teknis

Struktur form saat ini (`_ProfileSettingContent._buildFormCard`, verified):

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    AppTextField.outlined(label: 'Nama Lengkap', controller: nameController, ...),
    SizedBox(height: context.space.md),
    AppTextField.outlined(label: 'Email', controller: emailController, ...),
    SizedBox(height: context.space.md),
    AppTextField.outlined(label: 'No. Handphone', controller: phoneController, ...),
    SizedBox(height: context.space.md),
    DropdownButtonFormField<String>(
      decoration: InputDecoration(labelText: 'Jenis Kelamin', ...),
      items: const [
        DropdownMenuItem(value: 'l', child: Text('Laki-laki')),
        DropdownMenuItem(value: 'p', child: Text('Perempuan')),
      ],
      onChanged: onGenderChanged,
    ),
    SizedBox(height: context.space.md),
    AppTextField.outlined(label: 'Alamat', controller: addressController, maxLines: 3, ...),
    SizedBox(height: context.space.xl),
    Align(
      alignment: Alignment.centerRight,
      child: AppButton.primary(label: 'Simpan Perubahan', isFullWidth: true, ...),
    ),
  ],
)
```

Seluruh field ditumpuk vertikal tanpa percabangan `WindowSizeClass` apapun untuk mengatur ulang layout jadi 2 kolom di tablet — berbeda dengan bagian lain aplikasi yang sudah punya percabangan compact/non-compact eksplisit (mis. `build()` di screen yang sama membedakan `isCompact` untuk header, tapi tidak untuk susunan field form).

## Akar Masalah

Form ini dibangun sebagai satu `Column` linear tanpa mempertimbangkan lebar layar tablet yang tersedia di dalam `ContentConstraint` — tidak ada logic yang mengelompokkan field pendek (Nama, Email, No. HP, Jenis Kelamin) ke dalam baris berdampingan.

## Dampak

1. Pada tablet `expanded`/`large`, field seperti Nama Lengkap atau Email terlihat sangat panjang secara horizontal relatif terhadap teks yang diisi, membuat form terasa "kosong" dan kurang efisien secara vertikal (perlu scroll lebih jauh untuk sampai ke tombol Simpan).
2. Tidak memanfaatkan lebar yang sudah disediakan `ContentConstraint(maxWidth: 1200)` — ruang tersedia tapi field tidak disusun untuk mengisinya secara proporsional.
3. Waktu yang dibutuhkan pengguna untuk mengisi/meninjau form jadi lebih lama karena field tersebar vertikal lebih panjang dari yang perlu.

## Arah Perbaikan yang Disarankan

1. Pada breakpoint `expanded`/`large` (atau `medium` ke atas, sesuai kebutuhan), kelompokkan field pendek ke dalam baris 2-kolom, misalnya: [Nama Lengkap | Email] pada satu baris, [No. Handphone | Jenis Kelamin] pada baris berikutnya, sementara Alamat (multiline) tetap satu kolom penuh.
2. Pastikan validasi dan pesan error tiap field tetap terbaca baik saat field diletakkan berdampingan (cek lebar minimum per kolom).
3. Pertahankan tampilan `compact` (mobile) tetap satu kolom seperti sekarang — perubahan ini spesifik untuk breakpoint tablet ke atas.
4. Jika pola 2-kolom untuk form ini terbukti berguna, pertimbangkan menjadikannya pola yang bisa dipakai ulang untuk form lain di Production/Cashier yang mengalami masalah serupa (di luar scope dokumen ini, cukup dicatat sebagai potensi).

## Acceptance Criteria untuk Fix

1. Pada breakpoint tablet (`medium` ke atas atau sesuai keputusan implementasi), field pendek (Nama, Email, No. HP, Jenis Kelamin) disusun berdampingan dalam 2 kolom, bukan lagi ditumpuk satu-satu.
2. Field Alamat (multiline) tetap ditampilkan penuh selebar container, tidak dipaksa ke dalam kolom sempit.
3. Tidak ada regresi pada tampilan `compact` (mobile), yang tetap satu kolom seperti sebelumnya.
4. Validasi/error message tiap field tetap terbaca jelas dalam layout 2-kolom.
5. Tombol "Simpan Perubahan" tetap mudah ditemukan dan proporsional terhadap layout form yang baru.
