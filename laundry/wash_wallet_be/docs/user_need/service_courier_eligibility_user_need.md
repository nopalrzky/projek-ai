# User Need: Pengaturan Layanan yang Bisa Menggunakan Kurir

Tanggal: 2026-05-29

## 1. Latar Belakang

Stakeholder membutuhkan kontrol yang lebih detail atas layanan laundry yang boleh menggunakan fitur jemput/antar kurir.

Kondisi bisnis yang ingin diakomodasi:

1. Tidak semua layanan cocok atau memungkinkan untuk dijemput/diantar oleh kurir.
2. Kapasitas dan jenis kendaraan kurir berbeda per outlet.
3. Contoh kasus: outlet hanya memiliki kurir dengan sepeda motor, sehingga layanan kategori besar seperti karpet tidak realistis untuk dijemput atau diantar.
4. Owner perlu dapat menentukan layanan mana saja yang tersedia untuk kurir, bukan hanya mengaktifkan atau mematikan fitur kurir secara global di outlet.

Dokumen ini disusun sebagai acuan kebutuhan sebelum dibuat implementation plan.

## 2. Ringkasan Kondisi Codebase Saat Ini

### Sudah Ada

1. Model layanan laundry tersedia melalui `LaundryService`.
2. Layanan terhubung ke kategori melalui `category_id`, dan outlet dapat diketahui dari kategori.
3. Form create/edit layanan outlet sudah memiliki data utama seperti kategori, unit, nama, deskripsi, harga, durasi, minimal kuantitas, status aktif, dan proses layanan.
4. Fitur kurir outlet sudah memiliki pengaturan global melalui courier setting dan courier schedule.
5. Detail outlet sudah memuat data layanan laundry, jadwal operasional, courier setting, dan courier schedule.

### Gap yang Relevan

1. Belum terlihat field pada `laundry_services` untuk menandai apakah layanan boleh menggunakan kurir.
2. Belum ada validasi create/update layanan yang menerima status ketersediaan kurir per layanan.
3. Belum ada payload resource layanan yang mengembalikan status apakah layanan bisa dijemput/diantar kurir.
4. Pengaturan kurir saat ini cenderung berada di level outlet/jadwal, belum sampai ke level layanan.
5. Detail outlet tab kurir belum memiliki daftar layanan yang dapat diatur untuk kurir.

## 3. Tujuan Fitur

Tujuan utama fitur ini adalah:

1. Owner dapat menentukan layanan mana saja yang bisa menggunakan kurir.
2. Sistem mencegah pelanggan/kasir memilih metode kurir untuk layanan yang tidak mendukung kurir.
3. Pengaturan dapat dilakukan dari dua konteks:
   - saat owner membuat atau mengedit layanan,
   - dari detail outlet pada tab kurir.
4. Aturan kurir menjadi lebih realistis sesuai kemampuan operasional outlet, kendaraan, dan kategori layanan.

## 4. Aktor

1. `owner`
   Mengatur layanan outlet, menentukan layanan mana yang mendukung jemput/antar kurir, dan menyesuaikan operasional kurir outlet.
2. `employee/kasir`
   Membuat order dan hanya dapat memilih metode kurir jika semua layanan dalam order memenuhi aturan kurir.
3. `customer`
   Melihat dan memilih layanan yang tersedia, termasuk opsi kurir hanya jika layanan mendukung kurir dan fitur kurir outlet aktif.
4. `system`
   Menyimpan konfigurasi layanan-kurir, memvalidasi order, dan menjaga konsistensi tampilan/API.

## 5. Scope Kebutuhan

Scope utama:

1. Pengaturan eligibility kurir per layanan laundry.
2. Penambahan field pada form create/edit layanan.
3. Pengaturan daftar layanan pada detail outlet tab kurir.
4. Validasi pemilihan layanan saat order menggunakan metode kurir.
5. Payload API/resource agar frontend dapat membedakan layanan yang bisa dan tidak bisa menggunakan kurir.

Di luar scope:

1. Optimasi rute kurir.
2. Perhitungan kapasitas kendaraan berdasarkan berat/dimensi real-time.
3. Manajemen armada kendaraan kurir secara detail.
4. Penjadwalan kurir per layanan secara terpisah.
5. Pembuatan kategori kendaraan baru, kecuali nanti diputuskan sebagai pengembangan lanjutan.

## 6. Prinsip Dasar Kebutuhan

1. Courier eligibility ditentukan di level layanan laundry.
2. Fitur kurir outlet tetap menjadi gate utama. Jika kurir outlet tidak aktif, layanan tetap tidak bisa menggunakan kurir meskipun layanan tersebut ditandai mendukung kurir.
3. Status aktif layanan tetap menjadi gate terpisah. Layanan nonaktif tidak boleh tersedia untuk transaksi baru.
4. Owner harus dapat mengubah status courier eligibility tanpa harus menghapus layanan.
5. Pengaturan dari form layanan dan dari tab kurir harus mengubah sumber data yang sama.

## 7. User Need Fungsional

### FR-01 Owner Dapat Mengatur Courier Eligibility Saat Membuat Layanan

1. Saat owner membuat layanan laundry, form harus menyediakan opsi apakah layanan tersebut bisa menggunakan kurir.
2. Opsi tersebut harus mudah dipahami, misalnya:
   - `Bisa dijemput/diantar kurir`
   - `Tidak tersedia untuk kurir`
3. Sistem harus menyimpan pilihan tersebut bersama data layanan.
4. Default value perlu ditentukan dengan jelas pada plan:
   - default `true` jika mayoritas layanan dianggap bisa dikirim kurir, atau
   - default `false` jika owner harus eksplisit mengaktifkan layanan kurir per layanan.

Rekomendasi kebutuhan bisnis: default lebih aman adalah `false` untuk layanan baru, agar owner secara sadar memilih layanan yang memang bisa dibawa kurir.

### FR-02 Owner Dapat Mengubah Courier Eligibility Saat Mengedit Layanan

1. Saat owner mengedit layanan, form harus menampilkan status courier eligibility saat ini.
2. Owner dapat mengubah status tersebut tanpa mengubah field layanan lain.
3. Perubahan harus langsung berdampak pada transaksi baru.
4. Perubahan tidak perlu mengubah order lama yang sudah dibuat.

### FR-03 Detail Outlet Tab Kurir Menampilkan Daftar Layanan

1. Pada detail outlet, tab kurir harus menampilkan daftar layanan outlet.
2. Daftar layanan harus memuat informasi minimal:
   - nama layanan,
   - kategori layanan,
   - status aktif layanan,
   - status bisa/tidak bisa menggunakan kurir.
3. Owner dapat melihat layanan mana saja yang saat ini tersedia untuk kurir.
4. Tampilan harus membantu owner memahami dampak operasional, misalnya layanan besar seperti karpet dapat dinonaktifkan dari kurir.

### FR-04 Owner Dapat Mengatur Courier Eligibility dari Tab Kurir

1. Pada tab kurir detail outlet, owner dapat mengubah status courier eligibility layanan.
2. Pengaturan dapat dilakukan per layanan.
3. Jika memungkinkan secara UX, sistem dapat menyediakan bulk action untuk mengaktifkan atau menonaktifkan beberapa layanan sekaligus.
4. Perubahan dari tab kurir harus konsisten dengan nilai yang muncul di form edit layanan.

### FR-05 Sistem Memvalidasi Order dengan Metode Kurir

1. Saat order menggunakan metode kurir, sistem harus memastikan semua layanan dalam order mendukung kurir.
2. Jika ada satu layanan yang tidak mendukung kurir, order dengan metode kurir harus ditolak atau diarahkan untuk menggunakan metode ambil sendiri sesuai flow yang dipilih pada plan.
3. Pesan error harus menyebutkan layanan yang tidak mendukung kurir agar user memahami masalahnya.
4. Validasi harus berlaku untuk order dari customer maupun order yang dibuat kasir jika keduanya mendukung metode kurir.

### FR-06 Daftar Layanan untuk Customer/Kasir Membedakan Ketersediaan Kurir

1. API/resource layanan harus mengembalikan status courier eligibility.
2. Frontend customer/kasir dapat menggunakan status tersebut untuk:
   - menyembunyikan opsi kurir pada layanan tertentu,
   - memberi label bahwa layanan tidak tersedia untuk kurir,
   - mencegah checkout kurir jika cart berisi layanan yang tidak mendukung kurir.
3. Jika fitur kurir outlet tidak aktif, frontend tetap harus menganggap semua layanan tidak tersedia untuk kurir pada outlet tersebut.

### FR-07 Pengaturan Tidak Mengubah Kategori Secara Otomatis

1. Courier eligibility harus berada di level layanan, bukan kategori.
2. Owner tetap dapat memiliki dua layanan dalam kategori yang sama dengan aturan kurir berbeda.
3. Kategori dapat dipakai sebagai informasi bantu, tetapi tidak boleh menjadi satu-satunya sumber kebenaran.

### FR-08 Audit dan Konsistensi Data

1. Sistem perlu menjaga agar layanan yang sudah dihapus atau tidak aktif tidak tampil sebagai layanan aktif untuk kurir.
2. Jika layanan dinonaktifkan, layanan tersebut tidak boleh tersedia untuk order baru dengan metode apa pun.
3. Jika layanan hanya dinonaktifkan dari kurir, layanan tetap dapat dipakai untuk order non-kurir selama `is_active = true`.

## 8. Aturan Bisnis

1. Layanan bisa menggunakan kurir hanya jika:
   - layanan aktif,
   - layanan ditandai mendukung kurir,
   - fitur kurir outlet aktif,
   - jadwal/setting kurir outlet memenuhi aturan yang sudah ada.
2. Layanan yang tidak mendukung kurir tetap dapat digunakan untuk transaksi ambil sendiri atau transaksi outlet biasa.
3. Order dengan metode kurir tidak boleh berisi campuran layanan yang mendukung kurir dan tidak mendukung kurir, kecuali plan nanti memutuskan ada flow split order.
4. Pengaturan courier eligibility tidak boleh bergantung pada nama kategori seperti `karpet`, karena owner mungkin punya kebutuhan berbeda per outlet.
5. Perubahan courier eligibility hanya berlaku untuk order baru setelah perubahan disimpan.

## 9. Acceptance Criteria

1. Owner dapat membuat layanan baru dan menentukan apakah layanan bisa menggunakan kurir.
2. Owner dapat mengedit layanan lama dan mengubah status bisa/tidak bisa menggunakan kurir.
3. Detail outlet tab kurir menampilkan daftar layanan beserta status courier eligibility.
4. Owner dapat mengubah courier eligibility layanan dari tab kurir.
5. Resource/API layanan mengembalikan field courier eligibility.
6. Order dengan metode kurir ditolak jika berisi layanan yang tidak mendukung kurir.
7. Pesan validasi menyebutkan layanan yang tidak tersedia untuk kurir.
8. Layanan nonaktif tidak dianggap tersedia untuk kurir.
9. Jika fitur kurir outlet tidak aktif, layanan tidak tersedia untuk kurir walaupun status layanan mendukung kurir.
10. Pengaturan dari form layanan dan dari tab kurir selalu membaca/menulis data yang sama.

## 10. Catatan untuk Implementation Plan

Hal yang perlu diputuskan pada plan:

1. Nama field database, misalnya `is_courier_enabled`, `is_courier_supported`, atau `supports_courier`.
2. Default value field untuk layanan lama dan layanan baru.
3. Apakah butuh endpoint khusus untuk bulk update layanan kurir di tab kurir.
4. Di titik mana saja validasi order kurir harus ditambahkan:
   - customer order,
   - cashier order,
   - update order,
   - schedule pickup/delivery jika ada.
5. Apakah frontend cukup memakai boolean dari layanan, atau perlu computed field seperti `isAvailableForCourier` yang sudah menggabungkan status layanan dan status kurir outlet.
6. Strategi migrasi data layanan lama agar tidak tiba-tiba membuka layanan besar untuk kurir tanpa konfirmasi owner.

## 11. Pertanyaan Terbuka

1. Apakah kebutuhan ini hanya untuk layanan jemput, layanan antar, atau keduanya sekaligus?
2. Apakah owner perlu membedakan `bisa dijemput` dan `bisa diantar`, atau cukup satu boolean untuk keduanya?
3. Apakah layanan yang tidak mendukung kurir tetap boleh masuk dalam order yang sama jika customer memilih ambil sendiri?
4. Apakah perlu alasan operasional per layanan, misalnya `Tidak muat motor`, `Butuh mobil`, atau cukup status aktif/nonaktif?
5. Apakah sistem perlu mendukung rekomendasi otomatis berdasarkan kategori, atau seluruh keputusan tetap manual oleh owner?

## 12. Rekomendasi Awal

Untuk implementasi tahap pertama, kebutuhan paling sederhana dan aman adalah:

1. Tambahkan satu boolean di layanan: `supports_courier`.
2. Default untuk data existing dan layanan baru adalah `false`, lalu owner mengaktifkan layanan yang memang aman untuk kurir.
3. Tambahkan field tersebut di form create/edit layanan.
4. Tambahkan panel daftar layanan di tab kurir detail outlet dengan toggle per layanan.
5. Tambahkan validasi order kurir agar semua order item memakai layanan dengan `supports_courier = true`.
6. Tambahkan field computed pada resource jika dibutuhkan frontend:
   - `supportsCourier`
   - `isAvailableForCourier`

