# User Need: Cetak Label/Nota dengan Pemakaian Coin Owner/Outlet

Tanggal: 2026-05-30

## 1. Latar Belakang

Aplikasi kasir dan aplikasi produksi membutuhkan fitur cetak label/nota yang terhubung dengan sistem coin. Setiap aksi cetak tidak boleh berjalan tanpa informasi biaya. User harus melihat informasi cetak terlebih dahulu, melihat saldo coin yang tersedia, lalu mengonfirmasi cetak.

Berdasarkan keputusan kebutuhan:

1. Sumber coin memakai auto fallback.
2. Sistem memakai coin outlet terlebih dahulu jika cukup.
3. Jika coin outlet tidak cukup, sistem memakai coin owner.
4. Pemotongan coin terjadi saat user menekan konfirmasi cetak.

## 2. Ringkasan Kondisi Saat Ini

### Sudah Ada

1. Backend sudah memiliki endpoint print:
   - `GET /api/orders/{orderId}/print/info`
   - `POST /api/orders/{orderId}/print/receipt`
   - `POST /api/orders/{orderId}/print/label`
2. Backend sudah memiliki `PrintService` untuk cek coin, debit coin, mencatat `CoinTransaction`, dan journal.
3. Feature coin sudah tersedia dengan key:
   - `print_receipt`
   - `print_label`
4. Aplikasi kasir sudah memiliki modal cetak dan thermal printer service.
5. Aplikasi produksi belum terlihat memiliki modul print seperti aplikasi kasir.

### Gap Utama

1. Flow cetak perlu dibuat eksplisit: pilih jenis cetak, tampilkan info coin, lalu konfirmasi.
2. Aplikasi produksi perlu mendapat fitur cetak yang setara dengan kasir.
3. Debit coin harus terjadi saat konfirmasi cetak, bukan tanpa konfirmasi user.
4. UI harus menampilkan sumber coin yang akan dipakai oleh auto fallback: outlet atau owner.

## 3. Tujuan Fitur

Membuat alur cetak label/nota pada aplikasi kasir dan produksi agar setiap cetak:

1. Menampilkan pilihan cetak label atau nota.
2. Menampilkan harga coin fitur.
3. Menampilkan saldo coin outlet dan owner.
4. Menampilkan sumber coin yang akan dipakai sistem.
5. Meminta konfirmasi user.
6. Memotong coin saat user mengonfirmasi.
7. Menjalankan cetak setelah proses coin berhasil.
8. Mencatat transaksi coin secara konsisten.

## 4. Aktor

1. `cashier employee`
   Mencetak nota/label dari aplikasi kasir.
2. `production employee`
   Mencetak label/nota dari aplikasi produksi.
3. `owner`
   Memiliki saldo coin owner yang dapat dipakai sebagai fallback.
4. `outlet`
   Memiliki saldo coin outlet yang dipakai terlebih dahulu.
5. `system`
   Menentukan sumber coin, memproses debit, mencatat transaksi, dan mengirim data cetak ke aplikasi.

## 5. Scope Kebutuhan

Scope utama:

1. Flow cetak nota/struk dan label di aplikasi kasir.
2. Flow cetak nota/struk dan label di aplikasi produksi.
3. Informasi biaya coin dan saldo outlet/owner sebelum cetak.
4. Auto fallback sumber coin dari outlet ke owner.
5. Debit coin saat user mengonfirmasi cetak.
6. Pencatatan transaksi coin untuk audit.

Di luar scope:

1. Topup coin owner atau outlet.
2. Perubahan harga coin feature print.
3. Manajemen printer Bluetooth di luar kebutuhan cetak label/nota.
4. Redesign menyeluruh sistem coin.

## 6. User Need Fungsional

### FR-01 User Dapat Membuka Modal Cetak

Saat user menekan tombol cetak pada order, sistem menampilkan modal/bottom sheet cetak yang memuat:

1. Nomor order.
2. Nama pelanggan.
3. Nama outlet.
4. Pilihan cetak `Nota/Struk`.
5. Pilihan cetak `Label`.
6. Status fitur dan biaya coin tiap jenis cetak.

### FR-02 Sistem Menampilkan Informasi Coin

Untuk setiap jenis cetak, sistem harus menampilkan:

1. Harga coin.
2. Saldo coin outlet.
3. Saldo coin owner.
4. Sumber coin yang akan dipakai oleh auto fallback.
5. Status apakah saldo cukup atau tidak.

### FR-03 Sumber Coin Menggunakan Auto Fallback

Aturan sumber coin:

1. Jika saldo outlet cukup, sistem memakai coin outlet.
2. Jika saldo outlet tidak cukup dan saldo owner cukup, sistem memakai coin owner.
3. Jika keduanya tidak cukup, tombol cetak harus disabled dan user melihat pesan coin tidak cukup.

User tidak perlu memilih manual antara owner/outlet.

### FR-04 User Harus Mengonfirmasi Sebelum Coin Dipotong

Saat user memilih `Cetak Nota` atau `Cetak Label`, sistem harus menampilkan atau menjaga state konfirmasi yang jelas:

1. Jenis cetak yang dipilih.
2. Biaya coin.
3. Sumber coin yang akan dipakai.
4. Sisa saldo setelah cetak.

Coin dipotong hanya setelah user menekan tombol konfirmasi cetak.

### FR-05 Cetak Berjalan Setelah Coin Berhasil Diproses

Setelah user mengonfirmasi:

1. Aplikasi meminta backend memproses debit coin.
2. Jika berhasil, aplikasi menjalankan thermal print.
3. Jika debit gagal, aplikasi tidak boleh menjalankan printer.
4. Jika printer gagal setelah debit berhasil, user harus mendapat pesan error yang jelas.

### FR-06 Aplikasi Kasir dan Produksi Memiliki Flow yang Sama

Fitur harus tersedia di:

1. Aplikasi kasir.
2. Aplikasi produksi.

Keduanya harus memakai kontrak backend dan aturan coin yang sama.

## 7. Business Rules

1. Harga cetak mengikuti feature key `print_receipt` dan `print_label`.
2. Feature yang tidak aktif tidak boleh dicetak.
3. Coin outlet diprioritaskan sebelum coin owner.
4. Coin owner hanya dipakai jika outlet tidak cukup.
5. Setiap debit coin harus tercatat sebagai `CoinTransaction`.
6. Jenis transaksi harus dibedakan:
   - `print_receipt`
   - `print_label`
7. Satu konfirmasi cetak menghasilkan satu debit coin.
8. Jika saldo tidak cukup, cetak ditolak sebelum printer dijalankan.

## 8. Kebutuhan UI/UX

### Modal Cetak

1. Modal harus ringan dan langsung berfokus pada aksi cetak.
2. Pilihan cetak `Nota/Struk` dan `Label` harus mudah dibedakan.
3. Tiap pilihan harus menampilkan biaya coin dan sumber coin yang akan dipakai.
4. Jika coin owner dipakai karena outlet tidak cukup, UI harus memberi informasi yang jelas agar user memahami sumber debit.
5. Jika coin tidak cukup, tombol cetak harus disabled dan pesan error harus menjelaskan saldo yang dibutuhkan.

### State Konfirmasi

1. User harus melihat ringkasan sebelum menekan konfirmasi.
2. Tombol konfirmasi harus menampilkan status loading saat proses coin dan cetak sedang berjalan.
3. User tidak boleh bisa menekan cetak ganda saat proses berjalan.

## 9. Non-Functional Need

### NFR-01 Konsistensi Transaksi

1. Debit coin harus dilakukan secara atomik di backend.
2. Satu request proses cetak tidak boleh menghasilkan lebih dari satu transaksi coin.
3. Backend harus mengembalikan response yang cukup untuk menampilkan coin yang dipotong, sumber coin, dan sisa saldo.

### NFR-02 Auditability

1. Setiap debit coin cetak harus tercatat di `coin_transactions`.
2. Transaksi harus mengarah ke order terkait.
3. Description transaksi harus membedakan biaya cetak nota/struk dan label.

### NFR-03 Maintainability

1. Logic print coin sebaiknya reusable untuk aplikasi kasir dan produksi.
2. Aplikasi produksi sebaiknya tidak menduplikasi logic besar dari kasir jika bisa dipindahkan ke shared package atau pola reusable yang sesuai codebase.
3. Kontrak endpoint print harus tetap konsisten dengan `ApiEndpoints` di `wash_wallet_core`.

## 10. Acceptance Criteria

1. User kasir dapat membuka modal cetak dari detail/success order.
2. User produksi dapat membuka modal cetak dari detail order produksi.
3. Modal menampilkan pilihan `Nota/Struk` dan `Label`.
4. Modal menampilkan harga coin, saldo outlet, saldo owner, dan sumber coin auto fallback.
5. Jika outlet cukup, sumber tampil sebagai outlet.
6. Jika outlet tidak cukup tapi owner cukup, sumber tampil sebagai owner.
7. Jika outlet dan owner tidak cukup, tombol cetak disabled.
8. Saat user konfirmasi cetak, coin dipotong dan transaksi tercatat.
9. Printer hanya berjalan jika backend berhasil memproses coin.
10. Jika backend gagal, user melihat pesan error dan tidak ada cetak.
11. Jika printer gagal setelah debit, user melihat pesan gagal cetak dan status tidak membuat debit kedua otomatis.

## 11. Titik Implementasi yang Perlu Dipertimbangkan Model Planner

1. Reuse `PrintService`, `PrintController`, dan endpoint print yang sudah ada.
2. Audit response `POST print/receipt` dan `POST print/label` agar payload debit coin konsisten untuk Flutter.
3. Pertimbangkan membuat modul print reusable/shared agar kasir dan produksi tidak menduplikasi terlalu banyak logic.
4. Aplikasi produksi kemungkinan perlu dependency dan service printer seperti aplikasi kasir.
5. Pastikan flow lama yang mencetak dulu lalu memproses coin diubah menjadi flow konfirmasi/debit lalu cetak.
6. Pastikan error saldo tidak cukup, feature tidak aktif, dan outlet tidak ditemukan ditampilkan jelas di aplikasi.

## 12. Referensi Codebase

1. Backend print controller: `webapp/wash_wallet_be/app/Http/Controllers/Api/PrintController.php`
2. Backend print service: `webapp/wash_wallet_be/app/Services/PrintService.php`
3. Backend routes: `webapp/wash_wallet_be/routes/api.php`
4. Endpoint Flutter core: `packages/wash_wallet_core/lib/src/network/api/api_endpoints.dart`
5. Modal cetak kasir: `apps/cashier/lib/features/print/presentation/widgets/print_modal.dart`
6. Print cubit kasir: `apps/cashier/lib/features/print/presentation/bloc/print_cubit.dart`
7. Thermal printer kasir: `apps/cashier/lib/core/services/thermal_printer_service.dart`
8. Aplikasi produksi order detail: `apps/production/lib/features/order/presentation/screens/show_order_screen.dart`
