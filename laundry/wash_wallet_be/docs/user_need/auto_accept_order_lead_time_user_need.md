# User Need: Pengaturan Waktu Auto-Accept Order Customer

Tanggal: 2026-06-16

## 1. Latar Belakang

Stakeholder meminta agar mekanisme auto-accept order customer tidak lagi bersifat satu aturan tetap untuk semua outlet.

Masalah yang ingin diatasi:

1. Saat ini pesanan customer yang masuk bisa menumpuk sebelum benar-benar diterima oleh outlet.
2. Beberapa owner tidak ingin semua pesanan langsung auto-accept di waktu tertentu karena ada kondisi operasional, misalnya jarak jemput terlalu jauh atau kasir sedang sibuk.
3. Di sisi lain, jika auto-accept hanya dijalankan terlalu lambat, pesanan yang seharusnya sudah diproses bisa terlewat.
4. Stakeholder ingin ada pengaturan yang lebih fleksibel, misalnya auto-accept dijalankan 30 menit, 1 jam, atau 2 jam sebelum jadwal kurir.
5. Jika tidak ada pengaturan khusus, sistem tetap harus memakai perilaku default yang sudah ada.

Dokumen ini disusun sebagai acuan kebutuhan sebelum dibuat implementation plan.

## 2. Ringkasan Kondisi Codebase Saat Ini

### Sudah Ada

1. Terdapat setting `auto_accept_order` di level outlet.
2. `AutoAcceptOrderService` sudah memproses order customer-app dengan status `requested`.
3. Scheduler menjalankan command `orders:auto-accept` secara berkala.
4. Status history, notifikasi customer, dan notifikasi kurir sudah terhubung saat order di-accept otomatis.

### Gap yang Relevan

1. Belum terlihat pengaturan lead time auto-accept per outlet.
2. Belum ada aturan yang membedakan kapan auto-accept dijalankan berdasarkan jadwal kurir/pickup.
3. Belum ada opsi fallback yang jelas jika owner tidak mengatur waktu khusus.
4. Belum ada konfigurasi yang memungkinkan owner memilih perilaku auto-accept yang lebih operasional.

## 3. Tujuan Fitur

Tujuan utama kebutuhan ini adalah:

1. Owner dapat mengatur kapan order customer akan di-auto-accept.
2. Sistem dapat menyesuaikan waktu auto-accept terhadap jadwal kurir atau pickup yang sudah dipilih customer.
3. Owner tetap bisa memakai perilaku default jika tidak ingin mengatur waktu khusus.
4. Auto-accept menjadi lebih relevan dengan kondisi operasional outlet, bukan hanya berbasis satu jadwal global.

## 4. Aktor

1. `owner`
   Mengatur preferensi auto-accept outlet sesuai kebutuhan operasional.
2. `employee/kasir`
   Terbantu karena order yang sudah melewati waktu aman dapat otomatis masuk ke status diterima.
3. `customer`
   Mendapat kepastian bahwa order yang dijadwalkan tetap diproses pada waktu yang sesuai.
4. `system`
   Menjalankan auto-accept sesuai setting outlet dan memastikan status order tetap konsisten.

## 5. Scope Kebutuhan

Scope utama:

1. Pengaturan lead time auto-accept per outlet.
2. Dukungan preset waktu seperti `30 menit`, `1 jam`, dan `2 jam`.
3. Fallback ke perilaku default jika outlet tidak mengatur lead time.
4. Penyesuaian logika auto-accept berdasarkan jadwal kurir/pickup.
5. Tetap mempertahankan alur notifikasi dan status history yang sudah ada.

Di luar scope:

1. Manual review order oleh AI.
2. Penolakan otomatis berdasarkan jarak.
3. Optimasi rute kurir.
4. Perubahan flow manual accept/reject oleh kasir.
5. Perhitungan kapasitas operasional outlet secara real-time.

## 6. Prinsip Dasar Kebutuhan

1. Auto-accept harus tetap menjadi fitur opt-in per outlet.
2. Jika outlet tidak mengatur lead time, sistem harus memakai perilaku default yang ada sekarang.
3. Jika outlet mengatur lead time, sistem harus menggunakan nilai tersebut sebagai acuan auto-accept.
4. Pengaturan ini harus tetap aman terhadap order yang belum layak diproses.
5. Status order yang sudah berubah secara manual tidak boleh ditimpa oleh proses auto-accept.

## 7. User Need Fungsional

### FR-01 Owner Dapat Mengatur Waktu Auto-Accept Per Outlet

1. Owner dapat mengaktifkan pengaturan waktu auto-accept untuk outlet tertentu.
2. Owner dapat memilih kapan order akan auto-accept, misalnya:
   - `30 menit sebelum jadwal kurir`
   - `1 jam sebelum jadwal kurir`
   - `2 jam sebelum jadwal kurir`
3. Sistem harus menyimpan pengaturan tersebut sebagai konfigurasi outlet.
4. Jika owner tidak memilih nilai khusus, sistem tetap memakai perilaku default.

### FR-02 Sistem Auto-Accept Berdasarkan Lead Time

1. Jika sebuah order sudah masuk dalam window auto-accept, sistem harus mengubah status order menjadi diterima secara otomatis.
2. Window auto-accept dihitung dari jadwal kurir atau pickup yang sudah ditentukan.
3. Contoh:
   - jadwal pickup jam `09:00`, lead time `1 jam`, maka order eligible sekitar jam `08:00`
   - jadwal pickup jam `09:00`, lead time `30 menit`, maka order eligible sekitar jam `08:30`
4. Jika order belum masuk window, sistem tidak boleh memprosesnya.

### FR-03 Fallback Jika Tidak Ada Pengaturan Khusus

1. Jika outlet tidak mengisi lead time, sistem tetap menjalankan auto-accept dengan perilaku default yang sudah ada.
2. Fallback default harus tetap jelas di dokumentasi implementasi.
3. Perilaku default ini tidak boleh hilang ketika fitur lead time ditambahkan.

### FR-04 Tetap Menghormati Status Manual

1. Jika order sudah di-accept, di-reject, atau dibatalkan secara manual, auto-accept tidak boleh mengubah statusnya lagi.
2. Jika order sudah diproses oleh employee, sistem harus menganggap order tersebut selesai dari sisi auto-accept.
3. Proses otomatis harus aman jika dijalankan berulang.

### FR-05 Notifikasi dan Status History Tetap Konsisten

1. Order yang di-auto-accept tetap harus memicu status history.
2. Order yang di-auto-accept tetap harus memicu notifikasi customer.
3. Order yang di-auto-accept tetap harus memicu notifikasi kurir bila relevan.
4. Actor pada history harus tetap tercatat sebagai system.

### FR-06 Pengaturan Harus Mudah Dipahami Owner

1. Label pengaturan harus mudah dipahami oleh owner non-teknis.
2. Owner harus mengerti bahwa nilai yang dipilih menentukan kapan order diproses otomatis.
3. Sistem tidak boleh menampilkan istilah teknis yang membingungkan tanpa penjelasan.

## 8. Aturan Bisnis

1. Auto-accept tetap hanya berlaku untuk outlet yang mengaktifkan fitur ini.
2. Auto-accept berbasis lead time hanya berlaku untuk order customer-app yang memiliki jadwal pickup/kurir relevan.
3. Lead time yang dipilih harus menjadi batas kapan order mulai dianggap layak untuk diterima otomatis.
4. Jika order tidak memiliki jadwal yang bisa dijadikan acuan, sistem harus mengikuti aturan default atau menolak diproses sesuai keputusan implementasi.
5. Jika order sudah tidak berada pada status `requested`, proses auto-accept harus melewatinya.

## 9. Acceptance Criteria

1. Owner dapat memilih lead time auto-accept per outlet.
2. Sistem dapat menjalankan auto-accept `30 menit`, `1 jam`, atau `2 jam` sebelum jadwal kurir.
3. Jika lead time tidak diatur, sistem tetap menjalankan perilaku default yang ada sekarang.
4. Order yang sudah di-accept/reject/cancel tidak diubah lagi oleh auto-accept.
5. Status history tetap tercatat saat auto-accept terjadi.
6. Notifikasi customer dan kurir tetap terkirim saat order auto-accept.
7. Pengaturan tidak mengganggu flow manual accept/reject.

## 10. Catatan untuk Implementation Plan

Hal yang perlu diputuskan pada plan:

1. Nama field konfigurasi lead time, misalnya dalam satuan menit.
2. Apakah pengaturan lead time dibuat sebagai preset atau custom input.
3. Apakah fallback default tetap berbasis jam tertentu atau berbasis scheduler malam.
4. Titik validasi utama apakah di service, command, atau keduanya.
5. Apakah aturan ini hanya untuk order dengan `pickup_schedule` atau juga untuk variasi order customer lain.
6. Apakah pengaturan ini ditampilkan di halaman outlet, halaman setting, atau keduanya.

## 11. Rekomendasi Awal

Untuk implementasi tahap pertama, kebutuhan paling aman adalah:

1. Tambahkan setting lead time auto-accept per outlet.
2. Sediakan opsi preset `30 menit`, `1 jam`, `2 jam`.
3. Jika tidak ada konfigurasi, pertahankan perilaku default existing.
4. Terapkan validasi agar hanya order eligible yang diproses.
5. Pastikan notifikasi dan status history tetap berjalan seperti sekarang.
