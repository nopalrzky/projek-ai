# User Need: Perbaikan Aplikasi Kurir untuk Pickup Multi-Outlet

## Latar Belakang

Saat ini aplikasi kurir masih memakai istilah "Akan Dijemput". Secara bisnis, istilah ini kurang tepat setelah pesanan sudah di-acc oleh kasir. Pada tahap itu, pesanan seharusnya dipahami sebagai pesanan yang **siap dijemput** oleh kurir.

Selain itu, kurir yang memiliki posisi atau permission kurir pada lebih dari satu outlet perlu melihat pesanan pickup dari outlet-outlet yang memang menjadi cakupan kerjanya. Agar tidak salah kirim atau salah ambil, kurir juga perlu melihat informasi outlet pemilik pesanan secara jelas di daftar dan detail order.

Dokumen ini menjadi acuan kebutuhan pengguna sebelum penyusunan plan implementasi.

## Tujuan

1. Menyamakan istilah pada aplikasi kurir dengan kondisi bisnis yang sebenarnya.
2. Memastikan order pickup diambil dari status `accepted`.
3. Memungkinkan kurir multi-outlet melihat order dari outlet yang memang bisa dia akses.
4. Menampilkan identitas outlet asal pesanan agar proses pickup dan pengantaran tidak tertukar.

## Aktor

- Kasir
- Produksi/Kurir
- Owner outlet

## Masalah Saat Ini

1. Label "Akan Dijemput" masih menimbulkan kesan bahwa order belum siap diproses oleh kurir.
2. Setelah kasir meng-acc order, belum ada penegasan di sisi kebutuhan bisnis bahwa order tersebut masuk antrian pickup kurir dengan basis status `accepted`.
3. Kurir yang punya akses lintas outlet berpotensi melihat order tanpa konteks outlet yang jelas.
4. Kurir berisiko salah mengambil atau salah mengantar pesanan jika outlet pemilik order tidak terlihat dengan jelas.

## Kebutuhan Pengguna

### 1. Perubahan istilah pickup

- Di aplikasi kurir, istilah "Akan Dijemput" harus diubah menjadi "Siap Dijemput".
- Perubahan istilah ini berlaku untuk tab, label, section title, empty state, dan teks lain yang merepresentasikan antrian order pickup sebelum diambil kurir.

### 2. Sumber order pickup untuk kurir

- Setelah order di-acc oleh kasir, status order menjadi `accepted`.
- Order dengan status `accepted` itulah yang harus masuk ke antrian pickup kurir.
- Tim produksi/kurir mengambil order dari daftar order `accepted`, bukan dari status atau antrian lain.

### 3. Akses kurir lintas outlet

- Jika seorang employee memiliki posisi atau permission kurir pada outlet lain, maka order pickup dari outlet tersebut juga harus muncul di aplikasi kurir miliknya.
- Order yang tampil untuk kurir harus mengikuti outlet-outlet yang memang menjadi hak akses employee tersebut.
- Kurir tidak boleh melihat order pickup dari outlet yang tidak termasuk dalam permission atau posisi aktifnya.

### 4. Informasi outlet pada order kurir

- Setiap order pickup yang tampil di aplikasi kurir harus menampilkan informasi outlet pemilik pesanan.
- Informasi minimal yang perlu terlihat adalah nama outlet.
- Bila diperlukan untuk menghindari ambiguitas, sistem dapat menampilkan identitas tambahan seperti kode outlet atau alamat singkat outlet.
- Informasi outlet harus terlihat jelas di daftar order, dan idealnya juga tetap terlihat di halaman detail atau aksi pickup.

### 5. Dukungan operasional kurir

- Kurir perlu bisa langsung memahami order ini milik outlet mana sebelum mengambil pesanan.
- Kurir perlu memastikan bahwa pickup dan pengantaran dilakukan ke outlet yang sesuai dengan pesanan.
- Saat ada beberapa order dari outlet berbeda dalam satu akun kurir, pembeda outlet harus tetap mudah dikenali tanpa membuka detail terlalu banyak.

## Alur Bisnis yang Diharapkan

1. Customer membuat order pickup.
2. Kasir memproses dan meng-acc order.
3. Status order berubah menjadi `accepted`.
4. Order `accepted` masuk ke antrian kurir dengan label bisnis "Siap Dijemput".
5. Kurir melihat seluruh order `accepted` sesuai outlet yang dia punya akses.
6. Pada setiap order, kurir dapat melihat outlet pemilik order.
7. Kurir mengambil order dan mengirimkannya ke outlet yang sesuai dengan pesanan tersebut.

## Acceptance Criteria

1. Di aplikasi kurir, teks "Akan Dijemput" sudah berubah menjadi "Siap Dijemput".
2. Order yang muncul pada antrian pickup kurir berasal dari status `accepted`.
3. Kurir dengan akses ke lebih dari satu outlet dapat melihat order pickup dari seluruh outlet yang memang dia akses.
4. Kurir tanpa akses ke outlet tertentu tidak melihat order pickup dari outlet tersebut.
5. Setiap order pada daftar kurir menampilkan informasi outlet pemilik order dengan jelas.
6. Kurir dapat membedakan order antar-outlet tanpa kebingungan saat melihat daftar pickup.

## Catatan Ruang Lingkup

- Dokumen ini fokus pada kebutuhan pengguna dan alur bisnis.
- Dokumen ini belum menentukan desain teknis backend, struktur permission, perubahan API, atau detail implementasi UI.
- Detail teknis tersebut disusun pada dokumen plan terpisah setelah user need ini disepakati.
