# User Need: UX Home, Search, dan Discovery Layanan Customer

Tanggal: 2026-05-30

## Latar Belakang

Customer app Wash Wallet membutuhkan pengalaman awal yang lebih kuat untuk membantu customer mencari layanan laundry, memahami saldo dan order, serta berpindah dari Home ke Search dan Discovery dengan jelas.

Home screen tidak hanya menjadi tempat informasi akun, tetapi juga pintu utama untuk mencari layanan. Search perlu dipisahkan dari Home agar Home tetap bersih, sedangkan Search Screen fokus pada input keyword, riwayat pencarian, dan saran pencarian. Discovery Screen kemudian fokus menampilkan hasil layanan, sorting, dan filter.

Dokumen ini menjadi acuan kebutuhan produk dan UX untuk AI model lain saat menyusun plan implementasi. Dokumen ini tidak mengunci detail teknis endpoint, schema, atau komponen kode.

## Tujuan UX

1. Customer langsung memahami bahwa aksi utama aplikasi adalah mencari layanan laundry dan membuat order.
2. Home screen memiliki identitas visual Wash Wallet yang modern, bersih, friendly, dan reliable.
3. Customer dapat melihat alamat utama, membuka cart, melihat saldo wallet, dan membuka riwayat pesanan dari Home.
4. Customer dapat membuka Search Screen dari search bar Home tanpa mengetik langsung di Home.
5. Customer dapat memakai search history dan suggested search agar tidak perlu mengetik dari nol.
6. Customer dapat melihat hasil pencarian berupa layanan, bukan outlet.
7. Customer dapat sort dan filter hasil layanan dengan cara yang jelas dan mudah dijangkau.
8. Customer dapat memahami apakah layanan mendukung antar-jemput atau hanya datang langsung ke outlet.

## User Need Home Screen

### Identitas Visual Home

- Customer membutuhkan Home yang terasa punya identitas brand Wash Wallet.
- Header Home memakai warna utama brand Wash Wallet.
- Header boleh memakai elemen dekoratif halus seperti pattern, wave, bubble, laundry icon, atau motif ornamental.
- Elemen dekoratif hanya sebagai aksen dan tidak boleh mengganggu keterbacaan search bar, alamat, atau cart.
- Tampilan harus modern, bersih, friendly, dan reliable.

### Struktur Home

Home screen tahap awal memuat:

1. App header.
2. Search bar.
3. Cart button.
4. Informasi alamat customer.
5. Quick action atau quick info.
6. Wallet balance.
7. Riwayat pesanan.

### Header Home

Susunan utama header:

```text
[Alamat Customer] [Search Bar] [Cart Button]
```

Kebutuhan alamat:

- Customer melihat alamat primary/default di area kiri header.
- Jika customer memiliki banyak alamat, tampilkan alamat primary/default.
- Jika customer belum memiliki alamat, tampilkan `Alamat belum tersedia`.
- Alamat ditampilkan ringkas, misalnya `Rumah - Jl. Mawar No. 10` atau `Kirim ke Rumah`.
- Jika alamat terlalu panjang, gunakan ellipsis.
- Area alamat dapat ditekan untuk membuka halaman pilih atau atur alamat.

Kebutuhan search bar Home:

- Search bar Home adalah entry point, bukan input aktif.
- Saat search bar ditekan, customer diarahkan ke Search Screen.
- Search bar Home memakai placeholder seperti `Cari layanan laundry` atau `Mau laundry apa hari ini?`.
- Search di flow ini ditujukan untuk layanan laundry, bukan outlet sebagai hasil utama.

Kebutuhan cart button:

- Cart button berada di sisi kanan header.
- Cart button membuka cart atau order draft customer.
- Jika cart memiliki item, tampilkan badge jumlah item.

### Quick Info Home

- Customer dapat melihat saldo wallet sebagai informasi utama.
- Customer dapat membuka riwayat pesanan dengan shortcut cepat.
- Area quick info direkomendasikan memakai card horizontal dengan warna soft sesuai brand.
- Copy utama saldo: `Saldo Wallet`.
- Button riwayat memakai label `Riwayat Pesanan`.

## User Need Search Screen

### Tujuan Search Screen

Search Screen menjadi tempat customer fokus mengetik keyword layanan dan memilih keyword dari history atau suggestion.

Flow:

```text
Home Screen
-> Customer tap search bar
-> Search Screen
-> Customer mengetik keyword
-> Customer submit search
-> Discovery Screen
```

### Struktur Search Screen

Search Screen memuat:

1. Header search.
2. Input search aktif.
3. Search history.
4. Suggested search atau pencarian pilihan.

### Header Search

Susunan header:

```text
[Back Button] [Search Input]
```

- Search input langsung fokus saat screen dibuka.
- Placeholder input: `Cari layanan laundry`.
- Back button mengembalikan customer ke Home atau screen sebelumnya.

### Search History

- Customer dapat melihat riwayat pencarian dalam bentuk chip atau pill.
- Contoh history: `Cuci kering`, `Express`, `Kiloan`, `Karpet`.
- Saat history item ditekan, sistem langsung melakukan search dan membuka Discovery Screen.
- Jika belum ada history, section dapat disembunyikan atau menampilkan empty state ringan.

### Suggested Search

- Customer dapat melihat suggested search agar bisa eksplorasi tanpa mengetik dari nol.
- Section dapat memakai judul `Pencarian pilihan`.
- Contoh suggestion: `Cuci kiloan`, `Cuci kering`, `Express`, `Setrika`, `Karpet`.
- Saat suggestion ditekan, sistem langsung melakukan search dan membuka Discovery Screen.

## User Need Discovery Screen

### Tujuan Discovery

Discovery Screen adalah halaman hasil pencarian layanan. Screen ini digunakan untuk:

1. Menampilkan hasil search layanan.
2. Mengurutkan layanan.
3. Memfilter layanan.
4. Membuka detail layanan.
5. Menambahkan layanan ke cart jika alur order mendukung.

Aturan utama:

- Hasil discovery hanya menampilkan layanan sebagai result utama.
- Outlet tidak menjadi result utama.
- Outlet boleh muncul sebagai informasi pendukung pada service card.
- Jika search kosong, Discovery dapat menampilkan rekomendasi layanan populer atau pilihan.

### Header Discovery

Susunan header:

```text
[Back Button] [Search Bar] [Sort Button]
```

- Back button kembali ke Search Screen atau Home sesuai navigation stack.
- Search bar menampilkan keyword aktif.
- Jika search bar ditekan, customer dapat mengubah keyword.
- Sort button berada di kanan search bar.
- Saat sort button ditekan, tampilkan pilihan sorting.

### Result Content

Hasil Discovery memakai service card.

Informasi minimal pada service card:

1. Nama layanan.
2. Nama kategori.
3. Harga mulai dari.
4. Unit harga.
5. Durasi estimasi.
6. Rating jika tersedia.
7. Badge support antar-jemput atau datang langsung.
8. Outlet terkait sebagai informasi pendukung.
9. Status layanan aktif/tidak jika tersedia.
10. Button tambah atau lihat detail.

Contoh copy layanan dengan kurir:

```text
Cuci Kering
Laundry Pakaian - kg
Mulai Rp7.000/kg
Estimasi 24 jam
Antar-jemput tersedia
```

Contoh copy layanan tanpa kurir:

```text
Cuci Karpet Besar
Mulai Rp50.000
Datang langsung ke outlet
```

## Sorting

Default sorting:

```text
Terkait
```

Pilihan sorting:

1. Terkait.
2. Terbaru.
3. Terlaris.
4. Harga tertinggi.
5. Harga terendah.

Business meaning:

- `Terkait` menampilkan hasil paling relevan dengan keyword search.
- `Terbaru` berdasarkan tanggal layanan dibuat atau tersedia.
- `Terlaris` berdasarkan jumlah order atau popularity score jika tersedia.
- `Harga tertinggi` berdasarkan harga layanan dari tinggi ke rendah.
- `Harga terendah` berdasarkan harga layanan dari rendah ke tinggi.

## Filter Discovery

### Filter Horizontal

Di bawah header Discovery, tampilkan filter horizontal yang bisa discroll.

Contoh chips:

```text
[Semua] [Buka sekarang] [Antar-jemput] [Datang langsung] [Rating 4+] [Harga hemat]
```

Aturan UX:

- Filter chips harus mudah discroll.
- Button `Filter` tetap mudah dijangkau di sisi kanan.
- Filter aktif harus terlihat jelas.

### Filter Lengkap

Saat customer menekan button `Filter`, tampilkan bottom sheet atau modal.

Alasan:

- Filter memiliki banyak input.
- Customer perlu memilih beberapa opsi.
- Dibutuhkan tombol reset dan apply.
- Snackbar terlalu kecil untuk kebutuhan filter lengkap.

Isi filter lengkap:

1. Lokasi.
2. Metode pembayaran.
3. Range harga.
4. Preset harga.
5. Rating atau penilaian.
6. Button reset.
7. Button terapkan.

### Filter Lokasi

Opsi lokasi:

1. Gunakan alamat utama.
2. Pilih alamat lain.
3. Sekitar lokasi saya.

Jika customer belum punya alamat, tampilkan `Alamat belum tersedia`.

### Filter Metode Pembayaran

Opsi pembayaran:

1. Wallet.
2. Transfer.
3. Bayar di outlet.

Catatan:

- Istilah `Bayar di outlet` lebih jelas daripada COD untuk flow self drop-off.
- Untuk layanan tanpa kurir, copy pembayaran tidak boleh membuat customer mengira ada pembayaran di tempat pickup.

### Filter Range Harga

- Customer dapat mengisi harga minimum dan maksimum.
- Input memakai label `Min` dan `Max`.
- Contoh: `Min: 0`, `Max: 75000`.

### Preset Harga

Preset harga ditampilkan dalam bentuk chip:

```text
[0 - 25rb] [25rb - 50rb] [50rb - 75rb] [75rb - 100rb] [100rb+]
```

- Saat customer memilih preset, input min/max otomatis mengikuti preset.
- Customer tetap bisa mengubah min/max manual setelah memilih preset.

### Filter Rating

Filter rating dapat ditampilkan sebagai pilihan bintang atau chip.

Contoh chip:

```text
[4.5+] [4.0+] [3.5+]
```

### Button Filter

Di bagian bawah filter lengkap, tampilkan fixed action:

```text
[Atur Ulang] [Terapkan]
```

Aturan:

- `Atur Ulang` menghapus semua filter.
- `Terapkan` menerapkan filter dan menutup bottom sheet/modal.
- Button harus tetap mudah dijangkau.

## Business Rules

1. Search dari Home tidak langsung mengetik di Home, tetapi membuka Search Screen.
2. Search Screen digunakan untuk input keyword, search history, dan suggested search.
3. Submit search membuka Discovery Screen.
4. Hasil utama Discovery adalah layanan.
5. Outlet hanya muncul sebagai informasi pendukung pada service card atau section rekomendasi jika dibutuhkan.
6. Sorting default adalah `Terkait`.
7. Filter lengkap memakai bottom sheet atau modal.
8. Search harus mendukung typo-tolerant dan synonym jika backend sudah siap.
9. Jika tidak ada hasil, tampilkan empty state yang jelas.
10. Jika search kosong, Discovery boleh menampilkan rekomendasi layanan populer.
11. Jika layanan mendukung kurir dan outlet mendukung kurir, tampilkan `Antar-jemput tersedia`.
12. Jika layanan tidak mendukung kurir atau outlet tidak mengaktifkan kurir, tampilkan `Datang langsung ke outlet`.
13. Outlet yang sedang tutup tetap boleh tampil.
14. Customer tidak boleh membuat order jika outlet sedang tutup atau backend menyatakan order tidak bisa dibuat.
15. Validasi akhir tetap dilakukan oleh backend saat customer membuat order atau checkout.

## Empty, Loading, dan Error State

### Empty State

Jika tidak ada hasil search, tampilkan:

```text
Layanan tidak ditemukan
Coba gunakan kata kunci lain atau hapus beberapa filter.
```

Button opsional:

```text
Atur Ulang Filter
```

### Loading State

- Saat search, sort, atau filter sedang memuat, tampilkan skeleton loading untuk service card.
- Jangan tampilkan layar kosong terlalu lama.
- Filter aktif dan keyword tidak boleh hilang saat loading.

### Error State

Jika gagal memuat hasil:

```text
Gagal memuat layanan
Periksa koneksi kamu dan coba lagi.
```

Button:

```text
Coba Lagi
```

## Edge Cases

1. Customer belum memiliki alamat.
2. Customer memiliki alamat panjang.
3. Customer belum memiliki search history.
4. Customer submit query kosong.
5. Customer memakai typo berat.
6. Suggested search tidak tersedia.
7. Tidak ada layanan cocok dengan filter.
8. Filter aktif terlalu banyak dan membuat hasil kosong.
9. Outlet sedang tutup.
10. Layanan tidak mendukung kurir.
11. Outlet tidak mengaktifkan kurir.
12. Cart memiliki item dari outlet berbeda.
13. Cart memiliki item tetapi layanan yang dipilih tidak lagi tersedia.
14. Koneksi gagal saat search, sort, atau apply filter.
15. Backend mengubah status outlet/layanan setelah customer melihat hasil.

## Acceptance Criteria

1. Home screen memiliki header dengan identitas visual Wash Wallet.
2. Header Home menampilkan alamat customer, search bar, dan cart button.
3. Jika alamat belum tersedia, Home menampilkan `Alamat belum tersedia`.
4. Alamat panjang dipotong dengan ellipsis.
5. Area alamat dapat membuka halaman pilih atau atur alamat.
6. Search bar Home tidak menjadi input aktif.
7. Tap search bar Home membuka Search Screen.
8. Cart button membuka cart atau order draft.
9. Cart button menampilkan badge jumlah item jika cart berisi item.
10. Home menampilkan saldo wallet dan shortcut riwayat pesanan.
11. Search Screen menampilkan back button dan search input aktif.
12. Search input langsung fokus saat Search Screen dibuka.
13. Search Screen menampilkan search history jika tersedia.
14. Search Screen menampilkan suggested search atau pencarian pilihan.
15. Tap history atau suggestion menjalankan search dan membuka Discovery Screen.
16. Discovery Screen menampilkan back button, search bar, dan sort button.
17. Discovery Screen menampilkan keyword aktif pada search bar.
18. Sort button menampilkan opsi `Terkait`, `Terbaru`, `Terlaris`, `Harga tertinggi`, dan `Harga terendah`.
19. Default sorting adalah `Terkait`.
20. Hasil utama Discovery berupa service card.
21. Service card menampilkan nama layanan, kategori, harga, unit, durasi, dan outlet pendukung.
22. Service card menampilkan badge `Antar-jemput tersedia` jika layanan dan outlet mendukung kurir.
23. Service card menampilkan badge `Datang langsung ke outlet` jika layanan atau outlet tidak mendukung kurir.
24. Discovery menampilkan filter horizontal.
25. Button filter lengkap mudah dijangkau.
26. Filter lengkap tampil sebagai bottom sheet atau modal.
27. Filter lengkap memiliki reset dan apply.
28. Filter lengkap mendukung lokasi, metode pembayaran, range harga, preset harga, dan rating.
29. Empty state muncul saat tidak ada hasil.
30. Error state memiliki tombol `Coba Lagi`.
31. Loading state memakai skeleton atau indikator yang sesuai.
32. Outlet tutup tetap diberi status jelas.
33. Customer tidak bisa membuat order jika backend menyatakan outlet atau layanan tidak eligible.

## Relasi dengan Dokumen Lain

Dokumen ini melengkapi:

- `docs/user_need/customer_service_discovery_search_filter_user_need.md`
- `docs/user_need/customer_service_courier_eligibility_user_need.md`
- `docs/user_need/customer_outlet_without_courier_user_need.md`
- `docs/user_need/customer_outlet_operational_hours_user_need.md`

Dokumen ini fokus pada UX Home, Search Screen, dan Discovery Screen. Detail teknis search, endpoint, dan filter backend tetap diputuskan pada plan implementasi.
