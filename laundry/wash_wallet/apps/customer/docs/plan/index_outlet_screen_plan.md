# Index Outlet Screen — UI Implementation Plan

Dokumen ini berisi panduan spesifik untuk membangun antarmuka (UI) dari layar `IndexOutletScreen`. Seluruh *Data Layer*, *Domain Layer*, hingga *Presentation State Management* (`Cubit`, `State`, `Provider`) **SUDAH SELESAI DIBUAT**. Tugas agen AI selanjutnya HANYA fokus pada pembuatan UI.

---

## 1. Aturan Bisnis & Integrasi API
Saat menghubungkan UI dengan `CustomerOutletListCubit` yang sudah ada, pastikan:
- **`isExposure=true` Wajib**: Pemanggilan fungsi `getAll` atau pencarian dari Cubit **HARUS SELALU** mengirimkan parameter `isExposure: true`. Ini bukan fitur unggulan, melainkan syarat utama agar outlet tampil di aplikasi customer.
- **Tanpa Jarak (No Geolocation)**: Karena API Google Maps belum terhubung, abaikan perhitungan jarak. Tampilkan outlet apa adanya sesuai respons API tanpa memfilter atau mengurutkan berdasarkan jarak terdekat.

---

## 2. Struktur UI & Komponen

### A. Layar Utama (`IndexOutletScreen`)
File: `lib/features/outlet/presentation/screens/index_outlet_screen.dart`

- **AppBar**: Menggunakan `AppBar` standar (misal judul: "Daftar Outlet").
- **Search Header**: Area pencarian (`SearchBar`) yang berada di bawah AppBar (atau di dalam AppBar bottom). Saat user mengetik, panggil ulang Cubit dengan string pencarian + `isExposure: true`.
- **Body**:
  - Bungkus daftar dengan `RefreshIndicator` untuk fitur *pull-to-refresh*.
  - Gunakan `BlocBuilder<CustomerOutletListCubit, CustomerOutletListState>`.
  - Terapkan *ScrollController* untuk *infinite scrolling* (Load More) jika API mendukung paginasi.

### B. Widget Outlet Card
Buat komponen UI terpisah: `lib/features/outlet/presentation/widgets/outlet_card.dart`

- **Konteks Visual**: Jangan gunakan aset gambar eksternal. Semuanya harus murni menggunakan komponen Flutter bawaan dan token dari `wash_wallet_ui` (`context.colors`, `context.space`, `context.typography`).
- **Layout Kartu**:
  - Gunakan `AppCard.outlined` atau desain container sejenis.
  - **Kiri**: Gunakan `Container` berbentuk kotak membulat dengan warna abu-abu/primer transparan, diisi dengan `Icon(Icons.storefront_rounded, size: 40)`. Ini berfungsi sebagai *placeholder* foto.
  - **Kanan**:
    - **Nama Outlet**: Teks tebal.
    - **Status**: Label "Buka" atau "Tutup" (Gunakan `AppBadge`).
    - **Nomor Telepon/Alamat**: Teks tambahan berukuran kecil.

### C. Penanganan State (State Handling)
Tampilkan UI yang berbeda berdasarkan status `CustomerOutletListState`:
1. **Loading (`CustomerOutletListLoading`)**: Tampilkan 5 buah efek `Shimmer` berbentuk kotak kartu.
2. **Success Empty**: Jika daftar kosong, tampilkan ilustrasi ikon bawaan (`Icons.search_off_rounded` atau `Icons.store_outlined` ukuran 80) dengan pesan "Tidak ada outlet ditemukan".
3. **Success Populated**: Tampilkan `ListView.separated` berisi `OutletCard`.
4. **Failure**: Tampilkan pesan error dengan tombol "Coba Lagi".

---

## 3. Instruksi Eksekusi
- [ ] Buka `index_outlet_screen.dart` dan bangun strukturnya.
- [ ] Buat widget `OutletCard` dan `OutletSearchBar` jika dirasa perlu dipecah.
- [ ] Hubungkan UI dengan `CustomerOutletListCubit` (pastikan filter `isExposure: true` terkirim).
- [ ] Terapkan desain yang *spacious* dan premium menggunakan standar *spacing* dan tipografi `wash_wallet_ui`.
