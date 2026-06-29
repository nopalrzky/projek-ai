# User Need: Detail Order Kurir Dalam Perjalanan dengan Notifikasi WA dan Google Maps

Tanggal: 2026-06-11

## 1. Latar Belakang

Pada aplikasi produksi, tab `Kurir` memiliki alur pickup order. Kurir perlu menangani order yang sudah masuk tahap `Dalam Perjalanan`, yaitu order yang sudah mulai dijemput dan kurir sedang menuju rumah customer atau sedang menjalankan proses penjemputan.

Saat ini kebutuhan operasional kurir belum cukup hanya dengan melihat kartu order di daftar. Kurir perlu bisa membuka detail order dari tab `Dalam Perjalanan`, melihat informasi lengkap order, mengirim notifikasi WhatsApp ke customer bahwa kurir sedang menuju alamat customer, dan membuka Google Maps agar bisa melihat rute menuju alamat tersebut.

Kebutuhan ini bertujuan membuat kerja kurir lebih cepat dan jelas:

1. Kurir menekan order pada tab `Dalam Perjalanan`.
2. Aplikasi membuka detail order.
3. Detail order menampilkan informasi customer, alamat pickup, jadwal, outlet, dan ringkasan order.
4. Detail order menyediakan tombol `Kirim Notif WA` untuk memberi tahu customer bahwa kurir sedang OTW.
5. Detail order menyediakan tombol `Buka Maps` untuk membuka Google Maps ke alamat customer.

Dokumen ini menjadi acuan user need untuk AI model lain saat menyusun implementation plan. Dokumen ini fokus pada kebutuhan pengguna, alur bisnis, aturan UX, edge case, dan acceptance criteria. Detail teknis final seperti endpoint, request body, repository, cubit, model, atau widget final ditentukan pada dokumen plan.

## 2. Relasi dengan Dokumen Lain

Dokumen ini perlu dibaca bersama:

1. `docs/user_need/courier_multi_outlet_pickup_user_need.md`
2. `docs/user_need/courier_google_maps_navigation_button_user_need.md`
3. `docs/user_need/order_pickup_to_ready_process_lifecycle_user_need.md`

Catatan relasi:

1. User need Google Maps sebelumnya sudah menetapkan bahwa tombol Maps perlu tersedia pada flow kurir dan mengarah ke alamat customer.
2. Dokumen ini memperjelas kebutuhan detail order pada tab `Dalam Perjalanan` dan menambahkan tombol notifikasi WhatsApp.
3. Dokumen ini tidak mengubah aturan akses kurir lintas outlet.
4. Dokumen ini tidak mengganti alur status pickup yang sudah ada.

## 3. Tujuan

1. Memudahkan kurir membuka detail order dari tab `Dalam Perjalanan`.
2. Memastikan kurir bisa melihat informasi lengkap sebelum melakukan aksi pickup lanjutan.
3. Memungkinkan kurir mengirim notifikasi WhatsApp ke customer bahwa kurir sedang menuju rumah customer.
4. Memungkinkan kurir membuka Google Maps dari detail order.
5. Mengurangi risiko kurir salah alamat atau customer tidak siap saat kurir datang.
6. Menjaga aksi notifikasi dan Maps tidak mengubah status order.
7. Menjaga aksi konfirmasi pickup tetap terpisah dari aksi notifikasi dan navigasi.

## 4. Aktor

1. `courier employee`
   Employee yang memiliki permission kurir dan menangani pickup order.
2. `customer`
   Penerima notifikasi WhatsApp bahwa kurir sedang menuju alamat pickup.
3. `owner/outlet`
   Pemilik outlet yang menyediakan akses kurir dan, jika berlaku, menanggung biaya notifikasi WhatsApp.
4. `system`
   Menampilkan detail order, membuka Maps, mengirim notifikasi WhatsApp, dan menjaga validasi akses.

## 5. Scope Kebutuhan

Scope utama:

1. Perilaku klik order pada tab `Dalam Perjalanan`.
2. Halaman/detail order kurir untuk order dalam perjalanan.
3. Tombol kirim notifikasi WhatsApp dari detail order.
4. Tombol Google Maps dari detail order.
5. Feedback sukses/gagal untuk pengiriman WhatsApp dan pembukaan Maps.
6. Validasi agar hanya kurir yang berhak mengakses order tersebut yang bisa membuka detail dan menjalankan aksi.

Di luar scope:

1. Redesign menyeluruh tab kurir.
2. Perubahan flow status pickup selain kebutuhan detail dan action button.
3. Perubahan dashboard owner untuk konfigurasi WA.
4. Perubahan template WA global kecuali plan teknis memutuskan perlu template khusus.
5. Tracking lokasi kurir secara realtime.
6. Embedded map di aplikasi.

## 6. Istilah Bisnis

### 6.1 Tab Kurir

Tab pada aplikasi produksi yang dipakai kurir untuk melihat order pickup dan menjalankan tugas penjemputan.

### 6.2 Tab Dalam Perjalanan

Subtab atau filter di tab kurir yang menampilkan order yang sedang dijemput. Secara teknis status utama yang relevan adalah `picking_up`.

Jika implementasi saat ini juga menampilkan status lanjutan seperti `picked_up` pada tab yang sama, plan perlu membedakan aksi yang relevan untuk setiap status.

### 6.3 Detail Order Kurir

Halaman atau screen yang menampilkan detail order dalam konteks kerja kurir. Detail ini harus membantu kurir memahami siapa customer-nya, alamat yang dituju, jadwal pickup, outlet asal order, dan aksi yang masih boleh dilakukan.

### 6.4 Notifikasi WA Kurir OTW

Notifikasi WhatsApp yang dikirim ke customer untuk memberi tahu bahwa kurir sedang menuju alamat customer.

Contoh makna pesan:

```text
Kurir sedang dalam perjalanan menuju alamat Anda untuk menjemput cucian order #ORD-001.
Mohon siapkan cucian Anda.
```

Copy final boleh berbeda, tetapi maknanya harus tetap bahwa kurir sedang OTW ke alamat customer untuk pickup.

### 6.5 Tombol Google Maps

Tombol yang membuka Google Maps ke alamat customer. Tombol ini bukan untuk mengubah status order dan bukan pengganti konfirmasi pickup.

## 7. Masalah Saat Ini

1. Kurir membutuhkan detail order yang mudah diakses dari tab `Dalam Perjalanan`.
2. Kurir membutuhkan cara cepat memberi tahu customer bahwa kurir sedang menuju alamat customer.
3. Tanpa notifikasi OTW, customer bisa belum siap saat kurir datang.
4. Kurir perlu akses cepat ke Maps dari detail order tanpa copy-paste alamat.
5. Aksi operasional kurir berisiko bercampur jika detail, notifikasi, Maps, dan konfirmasi pickup tidak dipisahkan secara jelas.

## 8. Kebutuhan Pengguna

### 8.1 Order Dalam Perjalanan Bisa Dibuka ke Detail

Saat kurir berada pada tab `Kurir` lalu membuka subtab `Dalam Perjalanan`, setiap order yang tampil harus bisa dibuka ke detail order.

Perilaku yang diharapkan:

1. Kurir menekan kartu order atau area yang jelas untuk membuka detail.
2. Aplikasi membuka detail order dalam konteks kurir.
3. Detail order tidak langsung mengubah status.
4. Detail order tetap menampilkan tombol aksi yang relevan, seperti konfirmasi pengambilan, WA, dan Maps.

Jika kartu order masih memiliki tombol aksi seperti `Konfirmasi`, plan perlu memastikan tap pada kartu dan tap pada tombol aksi tidak saling membingungkan.

### 8.2 Detail Order Menampilkan Informasi Penting

Detail order kurir perlu menampilkan informasi minimal:

1. Nomor order.
2. Status order dan label bisnisnya.
3. Nama customer.
4. Nomor telepon atau informasi kontak customer jika tersedia.
5. Alamat pickup customer.
6. Jadwal pickup.
7. Nama outlet pemilik order.
8. Ringkasan item atau jumlah item order.
9. Catatan customer jika tersedia.
10. Aksi kurir yang masih relevan untuk status tersebut.

Informasi outlet tetap penting untuk kurir multi-outlet agar kurir tidak salah mengambil atau membawa order ke outlet yang salah.

### 8.3 Kurir Bisa Mengirim Notifikasi WA OTW

Pada detail order dengan status `picking_up`, kurir perlu melihat tombol `Kirim Notif WA`.

Saat tombol diklik:

1. Sistem mengirim notifikasi WhatsApp ke nomor customer.
2. Pesan memberi tahu bahwa kurir sedang menuju rumah/alamat customer.
3. Sistem memberi feedback sukses jika pesan berhasil dikirim.
4. Sistem memberi feedback gagal jika pesan tidak bisa dikirim.
5. Status order tidak berubah hanya karena notifikasi dikirim.

Jika sistem WA notification memakai coin, maka UI dan plan implementasi harus memperhatikan biaya coin, sumber coin, saldo cukup/tidak cukup, dan konfirmasi sebelum coin dipotong sesuai aturan fitur WA notification yang sudah ada.

### 8.4 Kurir Bisa Membuka Google Maps dari Detail

Detail order perlu menyediakan tombol `Buka Maps` atau `Google Maps` di dekat informasi alamat pickup customer.

Saat tombol diklik:

1. Sistem membuka Google Maps ke alamat customer.
2. Jika koordinat customer tersedia, sistem memakai latitude dan longitude.
3. Jika koordinat tidak tersedia, sistem boleh memakai alamat teks sebagai query.
4. Jika tidak ada alamat atau target navigasi, tombol tidak ditampilkan atau disabled dengan pesan non-teknis.
5. Status order tidak berubah hanya karena Maps dibuka.

### 8.5 Aksi Tetap Terpisah dan Tidak Membingungkan

Detail order dapat memiliki beberapa aksi, tetapi maknanya harus jelas:

1. `Kirim Notif WA` hanya mengirim pesan ke customer.
2. `Buka Maps` hanya membuka navigasi.
3. `Konfirmasi Pengambilan` tetap menjadi aksi terpisah untuk update status pickup.
4. Jika ada aksi `Tiba Outlet`, aksi tersebut tetap terpisah dari WA dan Maps.

Kurir tidak boleh salah mengira bahwa membuka Maps atau mengirim WA sudah menyelesaikan pickup.

## 9. Alur Bisnis yang Diharapkan

### 9.1 Membuka Detail dari Tab Dalam Perjalanan

1. Kurir membuka aplikasi produksi.
2. Kurir membuka tab `Kurir`.
3. Kurir membuka subtab `Dalam Perjalanan`.
4. Sistem menampilkan order yang sedang dijemput.
5. Kurir menekan salah satu order.
6. Sistem membuka detail order.
7. Kurir melihat informasi customer, alamat, jadwal, outlet, item, dan status.

### 9.2 Mengirim Notifikasi WA Kurir OTW

1. Kurir membuka detail order dari tab `Dalam Perjalanan`.
2. Kurir menekan tombol `Kirim Notif WA`.
3. Jika ada preview atau konfirmasi, sistem menampilkan pesan yang akan dikirim dan informasi biaya jika berlaku.
4. Kurir mengonfirmasi pengiriman.
5. Sistem mengirim WA ke nomor customer.
6. Sistem menampilkan feedback bahwa notifikasi berhasil dikirim.
7. Status order tetap `picking_up`.

### 9.3 Membuka Google Maps

1. Kurir membuka detail order dari tab `Dalam Perjalanan`.
2. Kurir melihat alamat customer.
3. Kurir menekan tombol `Buka Maps`.
4. Sistem membuka Google Maps ke koordinat atau alamat customer.
5. Kurir mengikuti rute di Google Maps.
6. Kurir kembali ke aplikasi untuk menjalankan aksi pickup berikutnya.

## 10. Aturan Bisnis

### 10.1 Status yang Relevan

Tombol `Kirim Notif WA` untuk pesan kurir OTW paling relevan pada status `picking_up`, yaitu saat kurir sudah mulai penjemputan dan sedang menuju customer.

Jika order sudah berubah menjadi `picked_up`, pesan "kurir sedang menuju rumah customer" tidak lagi cocok. Pada status tersebut, tombol OTW ke customer sebaiknya disembunyikan atau diganti dengan aksi lain pada kebutuhan terpisah.

### 10.2 Akses Order

Kurir hanya boleh membuka detail dan menjalankan aksi pada order dari outlet yang memang menjadi hak aksesnya.

Jika order berasal dari outlet yang tidak bisa diakses kurir, sistem harus menolak akses dan tidak menampilkan data detail order.

### 10.3 Nomor WhatsApp Customer

Jika customer tidak memiliki nomor WhatsApp/telepon:

1. Tombol `Kirim Notif WA` tidak ditampilkan atau disabled.
2. Sistem menampilkan pesan non-teknis seperti `Nomor WhatsApp customer belum tersedia`.
3. Kurir tetap bisa membuka Maps dan menjalankan aksi pickup lain.

### 10.4 Biaya Coin WA Notification

Jika notifikasi WA memakai coin:

1. Sistem harus memberi tahu user bahwa pengiriman WA membutuhkan coin.
2. Sistem harus menampilkan status saldo cukup/tidak cukup jika data tersedia.
3. Coin tidak boleh dipotong tanpa aksi konfirmasi user.
4. Jika saldo tidak cukup, tombol kirim harus disabled atau pengiriman harus ditolak dengan pesan yang jelas.
5. Gagal kirim WA tidak boleh mengubah status order.

### 10.5 Anti Spam dan Pengiriman Berulang

Plan implementasi perlu menentukan perilaku jika kurir menekan `Kirim Notif WA` lebih dari sekali pada order yang sama.

Kebutuhan bisnis yang diharapkan:

1. Sistem memberi feedback jika notifikasi baru saja dikirim.
2. Jika pengiriman ulang diizinkan, user harus memahami bahwa WA akan dikirim lagi dan biaya coin dapat terpotong lagi jika fitur memakai coin.
3. Jika pengiriman ulang tidak diizinkan dalam periode tertentu, tombol harus disabled atau menampilkan pesan yang jelas.

## 11. Edge Case

1. Customer tidak memiliki nomor WhatsApp.
   - Tombol WA disabled atau tidak ditampilkan.

2. Customer memiliki nomor, tetapi format nomor tidak valid.
   - Sistem menampilkan pesan gagal yang mudah dipahami.

3. Layanan WA/Fonnte gagal.
   - Sistem menampilkan pesan gagal dan status order tetap sama.

4. Saldo coin tidak cukup untuk kirim WA.
   - Sistem menampilkan pesan saldo coin tidak cukup dan tidak mengirim notifikasi.

5. Alamat customer tidak tersedia.
   - Tombol Maps disabled atau tidak ditampilkan.

6. Koordinat tidak tersedia, tetapi alamat teks tersedia.
   - Maps boleh dibuka memakai query alamat teks.

7. Google Maps tidak tersedia di perangkat.
   - Sistem fallback ke Google Maps web jika memungkinkan atau menampilkan pesan gagal.

8. Order berubah status saat detail sedang dibuka.
   - Detail perlu refresh atau menyesuaikan aksi agar tombol yang tidak relevan tidak tetap bisa dipakai.

9. Kurir kehilangan akses outlet saat session masih aktif.
   - Detail dan aksi harus ditolak sesuai aturan permission/access outlet.

## 12. Acceptance Criteria

1. Pada tab `Kurir` subtab `Dalam Perjalanan`, order dapat diklik untuk membuka detail order.
2. Detail order menampilkan nomor order, status, customer, alamat pickup, jadwal pickup, outlet, dan ringkasan item.
3. Detail order untuk order `picking_up` menampilkan tombol `Kirim Notif WA`.
4. Tombol `Kirim Notif WA` mengirim pesan WhatsApp ke customer bahwa kurir sedang menuju alamat customer.
5. Pengiriman WA sukses menampilkan feedback sukses.
6. Pengiriman WA gagal menampilkan feedback gagal yang mudah dipahami.
7. Mengirim WA tidak mengubah status order.
8. Jika nomor customer tidak tersedia, tombol WA disabled atau tidak ditampilkan.
9. Jika WA notification memakai coin, user melihat info biaya/status saldo atau konfirmasi sebelum coin dipotong.
10. Detail order menampilkan tombol `Buka Maps` dekat alamat customer.
11. Tombol `Buka Maps` membuka Google Maps ke koordinat customer jika tersedia.
12. Jika koordinat tidak tersedia, tombol `Buka Maps` memakai alamat pickup sebagai query jika alamat tersedia.
13. Membuka Maps tidak mengubah status order.
14. Aksi `Konfirmasi Pengambilan` tetap terpisah dari `Kirim Notif WA` dan `Buka Maps`.
15. Kurir tidak bisa membuka detail atau menjalankan aksi pada order dari outlet yang tidak dia akses.
16. Jika order sudah tidak berada pada status yang cocok untuk notifikasi OTW ke customer, tombol WA OTW tidak tampil atau berubah sesuai aturan status.

## 13. Catatan untuk Penyusunan Plan

Plan implementasi berikutnya perlu memutuskan:

1. Apakah detail yang dipakai adalah screen detail pickup yang sudah ada atau perlu show order/detail baru.
2. Apakah tap seluruh kartu order membuka detail, atau ada area khusus selain tombol aksi.
3. Endpoint atau usecase yang dipakai untuk kirim notifikasi WA OTW.
4. Apakah endpoint WA notification yang sudah ada cukup, atau perlu template/action khusus `courier_otw`.
5. Apakah perlu preview pesan dan konfirmasi biaya coin sebelum kirim WA.
6. Cara mencatat waktu terakhir notifikasi WA dikirim untuk mencegah spam.
7. Cara refresh detail order setelah aksi WA, Maps, atau konfirmasi pickup.
8. Test coverage untuk klik order, detail order, WA sukses/gagal, nomor kosong, coin tidak cukup, Maps koordinat, Maps alamat teks, dan permission outlet.

Dokumen ini tidak menentukan detail teknis final. Hasil akhir yang diinginkan adalah kurir dapat membuka order dalam perjalanan, memahami detail pickup, memberi tahu customer bahwa kurir sedang OTW melalui WhatsApp, dan membuka Google Maps dari detail order tanpa mengubah status order secara tidak sengaja.
