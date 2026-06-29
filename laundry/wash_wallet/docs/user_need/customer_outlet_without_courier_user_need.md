# User Need: Customer Order untuk Outlet Tanpa Fitur Kurir

Tanggal: 2026-05-29

## Latar Belakang

Pada aplikasi customer Wash Wallet, customer dapat memilih outlet dan membuat order laundry. Setiap outlet dapat memiliki fitur kurir atau layanan antar-jemput yang dinyalakan atau dimatikan oleh owner outlet.

Jika fitur kurir outlet tidak aktif, customer tetap perlu memahami bahwa outlet tersebut masih bisa menerima order, tetapi customer wajib datang langsung ke outlet untuk menyerahkan laundry. Aplikasi tidak boleh memberi kesan error atau menutup akses order tanpa penjelasan. Aplikasi juga perlu membantu customer datang ke outlet dengan menampilkan alamat, jam operasional, navigasi/maps, dan kontak outlet.

Dokumen ini menjadi acuan kebutuhan pengguna sebelum dibuat implementation plan oleh AI model lain.

## Tujuan

1. Memastikan outlet tanpa fitur kurir tetap muncul di aplikasi customer.
2. Memastikan customer tetap bisa membuat order pada outlet tanpa fitur kurir.
3. Mengubah alur order outlet tanpa kurir menjadi alur self drop-off atau datang langsung ke outlet.
4. Memberi informasi yang jelas bahwa layanan antar-jemput belum tersedia.
5. Mengarahkan customer untuk mengantar laundry sendiri ke outlet.
6. Menunda pemilihan metode pembayaran sampai laundry diterima, ditimbang, dan di-ACC oleh kasir.
7. Menetapkan status awal order self drop-off sebagai `pending_dropoff`.

## Aktor

- Customer
- Owner outlet
- Kasir
- Sistem

## Istilah Bisnis

### Fitur Kurir Outlet

Pengaturan milik outlet yang menentukan apakah outlet menyediakan layanan kurir atau antar-jemput untuk customer.

### Outlet Tanpa Kurir

Outlet yang fitur kurirnya tidak aktif. Outlet ini tetap melayani laundry, tetapi customer harus datang langsung ke outlet untuk menyerahkan pakaian.

### Self Drop-Off

Alur order ketika customer membuat order dari aplikasi, lalu mengantar laundry sendiri ke outlet. Dalam UI, label utama yang digunakan adalah **Datang langsung ke outlet**.

### Pending Drop-Off

Status order setelah customer membuat order self drop-off, tetapi laundry belum diserahkan ke outlet. Status teknis yang diharapkan adalah `pending_dropoff`.

## Keputusan Bisnis

1. Customer tetap boleh membuat order walaupun fitur kurir outlet tidak aktif.
2. Order pada outlet tanpa fitur kurir otomatis menjadi order self drop-off atau datang langsung ke outlet.
3. Customer belum memilih metode pembayaran saat order dibuat.
4. Metode pembayaran baru muncul setelah customer datang ke outlet, laundry diterima, ditimbang, total harga ditentukan, dan order di-ACC oleh kasir.
5. Transfer dan wallet balance tidak boleh dilakukan sebelum laundry diterima dan total harga final tersedia.
6. Tombol buat order tetap aktif walaupun fitur kurir outlet tidak aktif.
7. Aplikasi wajib memberi informasi bahwa customer harus datang langsung ke outlet.
8. Label utama yang digunakan adalah **Datang langsung ke outlet**.
9. Penjelasan tambahan yang digunakan adalah **Layanan antar-jemput belum tersedia**.
10. Outlet yang fitur kurirnya mati tetap muncul di daftar outlet customer.
11. Aplikasi perlu menampilkan alamat outlet, jam operasional, tombol navigasi/maps, dan kontak outlet.
12. Status order yang dibuat tanpa kurir adalah `pending_dropoff`.

## Masalah Saat Ini

1. Customer berpotensi bingung jika outlet tidak menyediakan kurir tetapi aplikasi tidak memberi informasi yang jelas.
2. Jika tombol order dimatikan tanpa penjelasan, customer bisa mengira outlet tutup atau aplikasi error.
3. Jika aplikasi tetap menampilkan pilihan kurir pada outlet tanpa kurir, customer bisa memilih alur yang tidak bisa dipenuhi outlet.
4. Jika metode pembayaran dipilih terlalu awal, customer bisa membayar sebelum laundry diterima dan harga final ditentukan.
5. Belum ada penegasan status bisnis untuk order yang sudah dibuat tetapi laundry belum diserahkan ke outlet.

## Kebutuhan Pengguna

### 1. Outlet Tanpa Kurir Tetap Muncul

- Outlet tanpa fitur kurir tetap muncul di daftar outlet customer.
- Outlet tetap dapat dibuka detailnya oleh customer.
- Aplikasi perlu memberi tanda atau informasi bahwa outlet tersebut tidak menyediakan layanan antar-jemput.
- Outlet tidak boleh disembunyikan hanya karena fitur kurir tidak aktif.

### 2. Informasi Kurir Tidak Tersedia

- Saat customer melihat outlet tanpa kurir, aplikasi harus menampilkan informasi utama: **Datang langsung ke outlet**.
- Aplikasi harus menampilkan penjelasan tambahan: **Layanan antar-jemput belum tersedia**.
- Informasi harus terlihat sebelum customer membuat order.
- Informasi tidak boleh hanya muncul setelah order dibuat.
- Bahasa UI harus membantu customer memahami bahwa order tetap bisa dibuat, tetapi laundry harus diantar sendiri.

### 3. Customer Tetap Bisa Membuat Order

- Tombol buat order tetap aktif untuk outlet tanpa fitur kurir.
- Saat membuat order, aplikasi memakai alur self drop-off.
- Customer tidak diminta memilih jadwal pickup kurir.
- Customer tidak diminta memilih alamat pickup.
- Customer tetap dapat memilih layanan laundry yang ingin dipesan sesuai layanan outlet.
- Sistem harus menolak alur courier pickup untuk outlet yang fitur kurirnya tidak aktif.

### 4. Order Otomatis Menjadi Self Drop-Off

- Order dari outlet tanpa kurir otomatis dianggap sebagai order self drop-off.
- Customer diarahkan untuk mengantar laundry sendiri ke outlet.
- Aplikasi harus menampilkan instruksi setelah order berhasil dibuat.
- Instruksi minimal:
  - order berhasil dibuat,
  - laundry perlu dibawa langsung ke outlet,
  - kasir akan menerima dan menimbang laundry,
  - pembayaran baru dapat dilakukan setelah total harga final tersedia.

### 5. Status Awal Order

- Status awal order self drop-off adalah `pending_dropoff`.
- Status ini berarti order sudah dibuat dari aplikasi, tetapi laundry belum diterima outlet.
- Order `pending_dropoff` belum boleh diproses sebagai order yang sudah diterima outlet.
- Order `pending_dropoff` belum memiliki total harga final jika harga membutuhkan penimbangan atau validasi kasir.
- Plan perlu memastikan status ini terlihat jelas di aplikasi customer dan dashboard/kasir.

### 6. Informasi Outlet untuk Kunjungan Langsung

- Aplikasi perlu menampilkan informasi yang membantu customer datang ke outlet.
- Informasi minimal:
  - nama outlet,
  - alamat outlet,
  - jam operasional,
  - tombol navigasi/maps,
  - kontak outlet.
- Jika data jam operasional atau kontak belum tersedia, aplikasi tetap harus menampilkan informasi yang ada dan tidak membuat layout kosong yang membingungkan.
- Tombol navigasi/maps harus mengarah ke lokasi outlet jika koordinat/alamat tersedia.

### 7. Pembayaran Ditunda Sampai Laundry Diterima

- Customer tidak memilih metode pembayaran saat membuat order self drop-off.
- Field payment method untuk order self drop-off baru ditentukan setelah laundry diterima, ditimbang, total harga ditentukan, dan order di-ACC oleh kasir.
- Metode pembayaran yang dapat muncul setelah ACC mengikuti aturan pembayaran order yang berlaku, misalnya `cod`, `transfer`, atau `wallet_balance`.
- Customer tidak boleh melakukan transfer atau wallet balance sebelum datang ke outlet.
- Jika total harga belum tersedia, aplikasi tidak boleh menampilkan tombol bayar transfer atau wallet balance.

### 8. Proses Kasir Setelah Customer Datang

- Customer datang ke outlet membawa laundry.
- Kasir mencari atau membuka order `pending_dropoff`.
- Kasir menerima laundry dari customer.
- Kasir menimbang atau mengecek laundry sesuai proses outlet.
- Kasir menentukan total harga final.
- Kasir meng-ACC order.
- Setelah ACC, order masuk ke alur pembayaran dan proses laundry berikutnya.

### 9. Komunikasi Status ke Customer

- Customer harus bisa melihat bahwa order masih menunggu laundry diserahkan ke outlet.
- Label status customer harus mudah dipahami, misalnya **Menunggu Anda datang ke outlet**.
- Aplikasi perlu memberi arahan lanjutan, misalnya **Bawa laundry Anda ke outlet untuk ditimbang dan diproses**.
- Customer tidak boleh melihat status yang memberi kesan kurir akan menjemput.

## Alur Bisnis yang Diharapkan

### Alur Outlet Tanpa Kurir

1. Customer membuka daftar outlet.
2. Outlet tanpa kurir tetap muncul.
3. Customer membuka detail outlet.
4. Aplikasi menampilkan informasi **Datang langsung ke outlet** dan **Layanan antar-jemput belum tersedia**.
5. Aplikasi menampilkan alamat, jam operasional, navigasi/maps, dan kontak outlet.
6. Customer membuat order.
7. Customer tidak memilih jadwal pickup, alamat pickup, atau metode pembayaran.
8. Sistem membuat order dengan status `pending_dropoff`.
9. Aplikasi menampilkan instruksi agar customer datang langsung ke outlet.
10. Customer datang ke outlet membawa laundry.
11. Kasir menerima dan menimbang laundry.
12. Kasir menentukan total harga final dan meng-ACC order.
13. Setelah ACC, customer dapat memilih atau menyelesaikan pembayaran sesuai metode yang tersedia.

## Aturan Bisnis

1. Outlet tanpa fitur kurir tetap dapat menerima order dari aplikasi customer.
2. Outlet tanpa fitur kurir tidak boleh menawarkan pickup kurir.
3. Order pada outlet tanpa kurir wajib masuk alur self drop-off.
4. Customer wajib datang langsung ke outlet untuk menyerahkan laundry.
5. Order self drop-off dibuat dengan status `pending_dropoff`.
6. `pending_dropoff` berarti laundry belum diterima outlet.
7. Customer tidak memilih payment method saat order self drop-off dibuat.
8. Payment method baru tersedia setelah kasir menerima laundry, menimbang, menentukan total harga, dan meng-ACC order.
9. Transfer dan wallet balance tidak boleh dilakukan sebelum total harga final tersedia.
10. Aplikasi wajib menampilkan informasi outlet untuk membantu customer datang langsung.
11. Label utama UI adalah **Datang langsung ke outlet**.
12. Penjelasan tambahan UI adalah **Layanan antar-jemput belum tersedia**.
13. Backend menjadi sumber kebenaran apakah outlet memiliki fitur kurir aktif atau tidak.
14. Frontend tidak boleh hanya mengandalkan state lokal untuk menentukan ketersediaan kurir.

## Acceptance Criteria

1. Outlet tanpa fitur kurir tetap muncul pada daftar outlet customer.
2. Detail outlet tanpa kurir menampilkan informasi **Datang langsung ke outlet**.
3. Detail outlet tanpa kurir menampilkan penjelasan **Layanan antar-jemput belum tersedia**.
4. Tombol buat order tetap aktif pada outlet tanpa kurir.
5. Customer dapat membuat order pada outlet tanpa kurir.
6. Aplikasi tidak menampilkan pilihan pickup kurir untuk outlet tanpa kurir.
7. Aplikasi tidak mewajibkan alamat pickup, jadwal pickup, atau tanggal pickup untuk outlet tanpa kurir.
8. Customer tidak memilih metode pembayaran saat membuat order self drop-off.
9. Order yang dibuat pada outlet tanpa kurir memiliki status `pending_dropoff`.
10. Order `pending_dropoff` menampilkan label yang mudah dipahami customer, misalnya **Menunggu Anda datang ke outlet**.
11. Setelah order dibuat, aplikasi menampilkan instruksi agar customer mengantar laundry langsung ke outlet.
12. Aplikasi menampilkan alamat outlet.
13. Aplikasi menampilkan jam operasional outlet.
14. Aplikasi menampilkan tombol navigasi/maps jika data lokasi tersedia.
15. Aplikasi menampilkan kontak outlet jika data tersedia.
16. Customer tidak dapat melakukan pembayaran transfer atau wallet balance sebelum laundry diterima dan order di-ACC kasir.
17. Setelah kasir menerima, menimbang, menentukan harga, dan meng-ACC order, customer baru dapat melanjutkan ke pembayaran.
18. Order self drop-off tidak muncul sebagai order yang harus dijemput kurir.
19. Backend menolak request order dengan pickup kurir jika fitur kurir outlet tidak aktif.
20. Backend tetap mengizinkan request order self drop-off untuk outlet tanpa kurir.

## Catatan Relasi dengan User Need Pembayaran

Dokumen `docs/user_need/payment_wallet_balance_user_need.md` sebelumnya menetapkan customer memilih metode pembayaran saat membuat order. Untuk alur outlet tanpa kurir, keputusan bisnis terbaru adalah customer belum memilih metode pembayaran saat membuat order.

Plan implementasi perlu menyelaraskan dua kebutuhan ini dengan salah satu pendekatan:

1. Membuat aturan khusus untuk order self drop-off: payment method dipilih setelah ACC kasir.
2. Atau memperbarui user need pembayaran agar pemilihan metode pembayaran bisa terjadi setelah total harga final tersedia, terutama untuk order yang membutuhkan penerimaan dan penimbangan di outlet.

Rekomendasi awal: gunakan aturan khusus untuk self drop-off agar tidak mengganggu alur order kurir yang sudah dirancang.

## Catatan Ruang Lingkup

- Dokumen ini fokus pada kebutuhan pengguna dan aturan bisnis customer app untuk outlet tanpa kurir.
- Dokumen ini belum menentukan struktur database, nama endpoint, bentuk payload API, atau desain UI final.
- Detail teknis seperti sumber data fitur kurir outlet, status enum `pending_dropoff`, perubahan validasi backend, dan update screen customer perlu dibahas pada implementation plan.
- Fitur pembayaran detail tetap mengikuti dokumen pembayaran, tetapi waktu pemilihan payment method untuk self drop-off mengikuti dokumen ini.

## Keputusan untuk Plan

1. Tambahkan dukungan status order `pending_dropoff`.
2. Outlet tanpa kurir tetap bisa menerima order.
3. Order outlet tanpa kurir otomatis menjadi self drop-off.
4. Customer tidak memilih payment method saat membuat order self drop-off.
5. Payment method baru dipilih setelah laundry diterima, ditimbang, total harga final tersedia, dan order di-ACC kasir.
6. UI utama memakai label **Datang langsung ke outlet**.
7. UI pendukung memakai teks **Layanan antar-jemput belum tersedia**.
8. Aplikasi wajib menampilkan alamat, jam operasional, navigasi/maps, dan kontak outlet.
9. Backend harus menolak pickup kurir untuk outlet tanpa fitur kurir.
10. Plan perlu memastikan order `pending_dropoff` tidak masuk antrian pickup kurir.
