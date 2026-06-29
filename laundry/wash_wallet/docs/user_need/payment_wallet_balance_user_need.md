# User Need: Logika Pembayaran Order dan Wallet Balance Owner

Tanggal: 2026-05-29

## Latar Belakang

Order customer memiliki tiga metode pembayaran utama:

1. `cod`
   Customer membayar langsung di kasir atau saat proses operasional offline.
2. `transfer`
   Customer membayar secara online melalui Midtrans.
3. `wallet_balance`
   Customer membayar menggunakan saldo wallet/deposit customer yang sudah ada di sistem.

Setiap metode pembayaran perlu memiliki dampak saldo yang berbeda. Pembayaran `wallet_balance` harus memotong saldo customer dan menambah saldo pendapatan owner. Pembayaran `transfer` harus menunggu konfirmasi sukses dari Midtrans sebelum menambah saldo pendapatan owner. Pembayaran `cod` tidak menambah wallet balance owner karena uang diterima langsung secara offline oleh kasir/outlet.

Dokumen ini menjadi dasar kebutuhan pengguna sebelum dibuat implementation plan.

## Tujuan

1. Menyamakan aturan bisnis untuk tiga metode pembayaran order: `cod`, `transfer`, dan `wallet_balance`.
2. Memastikan saldo customer hanya dipotong saat pembayaran wallet berhasil.
3. Memastikan wallet balance owner hanya bertambah dari transaksi yang dananya berada di sistem Wash Wallet.
4. Memastikan pembayaran transfer hanya dianggap berhasil setelah Midtrans mengonfirmasi status sukses.
5. Memastikan COD tetap tercatat sebagai metode pembayaran offline tanpa menambah saldo withdrawable owner.
6. Menjadi acuan awal untuk plan perubahan backend, API, mobile customer, dan dashboard owner jika dibutuhkan.

## Aktor

- Customer
- Kasir
- Owner outlet
- Sistem
- Midtrans

## Istilah Bisnis

### Customer Wallet Balance

Saldo milik customer yang dapat digunakan untuk membayar order. Di codebase saat ini saldo ini berkaitan dengan `customer_accounts.deposit_balance`.

### Owner Wallet Balance

Saldo pendapatan owner dari transaksi customer yang dapat ditampilkan sebagai saldo pendapatan dan, jika fitur withdrawal aktif, dapat menjadi saldo yang bisa ditarik. Saldo ini disimpan di level owner, bukan di level outlet.

### Payment Method

Metode pembayaran yang dipilih customer saat membuat atau membayar order. Untuk kebutuhan bisnis ini, metode yang didukung adalah:

1. `cod`
2. `transfer`
3. `wallet_balance`

Nilai teknis yang dipakai untuk pembayaran menggunakan saldo customer adalah `wallet_balance`.

## Masalah Saat Ini

1. Aturan dampak saldo untuk setiap metode pembayaran belum dirumuskan sebagai kebutuhan bisnis yang eksplisit.
2. Pembayaran menggunakan saldo customer perlu dipastikan berjalan atomik: saldo customer berkurang, order menjadi paid, dan saldo owner bertambah dalam satu alur yang konsisten.
3. Pembayaran transfer perlu bergantung pada status sukses dari Midtrans, bukan hanya pada pilihan metode pembayaran.
4. Pembayaran COD perlu tetap tercatat sebagai metode pembayaran order, tetapi tidak boleh dianggap sebagai saldo yang masuk ke wallet owner.
5. Sistem perlu mencegah saldo owner bertambah dua kali karena retry, double submit, atau webhook Midtrans yang terkirim lebih dari sekali.
6. Status pembayaran order perlu mudah dipahami oleh customer, kasir, dan owner.

## Kebutuhan Pengguna

### 1. Customer Memilih Metode Pembayaran

- Customer memilih metode pembayaran saat membuat order.
- Metode yang tersedia adalah `cod`, `transfer`, dan `wallet_balance`.
- UI harus menampilkan label yang mudah dipahami:
  - `Bayar di Kasir` atau `COD`
  - `Transfer Online`
  - `Saldo Wallet`
- Backend tetap menjadi sumber kebenaran untuk validasi metode pembayaran yang diperbolehkan.
- Jika nominal final order baru diketahui setelah order diproses/ditimbang, metode pembayaran tetap mengikuti pilihan customer saat order dibuat, sementara proses pembayaran dilakukan setelah tagihan tersedia.

### 2. Pembayaran dengan Wallet Balance Customer

- Saat customer memilih `wallet_balance`, sistem harus mengecek saldo customer terlebih dahulu.
- Jika saldo customer mencukupi, sistem memotong saldo customer sebesar total tagihan order.
- Setelah saldo customer berhasil dipotong, order harus berubah menjadi paid.
- Setelah order paid karena wallet balance, owner wallet balance harus bertambah sebesar nominal pembayaran yang sah.
- Jika saldo customer tidak cukup, pembayaran harus gagal dan saldo customer tidak boleh berubah.
- Jika proses update order atau penambahan saldo owner gagal, saldo customer tidak boleh terpotong secara permanen.
- Pembayaran wallet balance harus idempotent agar order yang sama tidak bisa menambah saldo owner lebih dari sekali.

### 3. Pembayaran Transfer Melalui Midtrans

- Saat customer memilih `transfer`, sistem membuat transaksi pembayaran melalui Midtrans.
- Order tidak boleh dianggap paid hanya karena transaksi Midtrans dibuat.
- Order baru dianggap paid setelah Midtrans mengirim atau sistem mengambil status pembayaran sukses.
- Setelah pembayaran transfer sukses, owner wallet balance harus bertambah.
- Nominal yang masuk ke owner wallet balance dari pembayaran transfer adalah nominal net setelah fee.
- Jika status Midtrans masih pending, owner wallet balance tidak boleh bertambah.
- Jika status Midtrans failed, cancelled, denied, atau expired, owner wallet balance tidak boleh bertambah.
- Webhook Midtrans harus aman dari duplikasi, sehingga notifikasi sukses yang sama tidak menambah saldo owner lebih dari sekali.

### 4. Pembayaran COD

- Saat customer memilih `cod`, order dicatat sebagai order dengan pembayaran offline.
- Order COD tetap berstatus pembayaran `unpaid` sampai kasir atau proses operasional menandai pembayaran sudah diterima.
- Setelah pembayaran COD diterima, status pembayaran order berubah menjadi `paid`.
- COD tidak memotong customer wallet balance.
- COD tidak menambah owner wallet balance secara otomatis.
- Kasir atau alur operasional tetap dapat menandai pembayaran COD sudah diterima sesuai proses bisnis.
- Pendapatan COD boleh tampil di laporan order/penjualan, tetapi tidak boleh bercampur dengan saldo wallet owner yang bisa ditarik.

### 5. Dampak ke Owner Wallet Balance

- Owner wallet balance hanya bertambah dari:
  1. Pembayaran `wallet_balance` yang berhasil.
  2. Pembayaran `transfer` yang sukses dari Midtrans.
- Owner wallet balance tidak bertambah dari:
  1. Order `cod`.
  2. Order transfer yang masih pending.
  3. Order transfer yang gagal, expired, denied, atau cancelled.
  4. Percobaan pembayaran wallet balance yang gagal.
- Setiap penambahan saldo owner harus memiliki referensi ke order dan metode pembayaran.
- Sistem harus dapat membedakan saldo pendapatan owner dari saldo coin atau saldo fitur lain.

### 6. Status Pembayaran Order

- Order perlu memiliki status pembayaran yang mencerminkan kondisi aktual pembayaran.
- Status minimal yang dibutuhkan:
  - `not_yet_priced` jika order belum memiliki nominal final.
  - `unpaid` jika tagihan sudah ada tetapi belum dibayar.
  - `pending` atau status sejenis untuk transfer yang menunggu Midtrans, jika dibutuhkan pada plan.
  - `paid` jika pembayaran sudah berhasil.
  - `failed` atau status sejenis untuk pembayaran online yang gagal, jika dibutuhkan pada plan.
- Status yang ditampilkan ke user harus jelas dan tidak membuat customer mengira pembayaran sudah berhasil sebelum benar-benar sukses.
- Payment status khusus `cod` tidak digunakan. COD direpresentasikan melalui `payment_method = cod`, sedangkan status pembayarannya tetap memakai `unpaid` sebelum uang diterima dan `paid` setelah uang diterima.

### 7. Riwayat dan Audit Saldo

- Setiap perubahan owner wallet balance harus tercatat dalam riwayat transaksi wallet.
- Riwayat minimal memuat:
  - owner,
  - outlet jika relevan,
  - order,
  - payment method,
  - nominal,
  - saldo sebelum,
  - saldo sesudah,
  - waktu transaksi,
  - sumber transaksi.
- Setiap pemotongan customer wallet balance juga perlu dapat ditelusuri dari order yang dibayar.
- Riwayat harus cukup jelas untuk membantu owner, admin, atau developer menelusuri perbedaan saldo.

## Alur Bisnis yang Diharapkan

### Alur Wallet Balance

1. Customer memilih pembayaran `wallet_balance`.
2. Sistem mengecek total tagihan order.
3. Sistem mengecek saldo wallet customer.
4. Jika saldo cukup, sistem memotong saldo customer.
5. Sistem mengubah order menjadi paid.
6. Sistem menambah owner wallet balance.
7. Sistem mencatat riwayat transaksi saldo.
8. Customer melihat pembayaran berhasil.
9. Owner dapat melihat saldo pendapatan bertambah.

### Alur Transfer

1. Customer memilih pembayaran `transfer`.
2. Sistem membuat transaksi pembayaran Midtrans.
3. Customer menyelesaikan pembayaran di channel Midtrans.
4. Midtrans mengirim status pembayaran.
5. Sistem memvalidasi status dari Midtrans.
6. Jika status sukses, order menjadi paid.
7. Sistem menambah owner wallet balance sebesar nominal net setelah fee.
8. Sistem mencatat riwayat transaksi saldo.
9. Customer dan owner melihat status pembayaran berhasil.

### Alur COD

1. Customer memilih pembayaran `cod`.
2. Sistem mencatat order dengan metode COD dan payment status `unpaid`.
3. Customer membayar langsung di kasir atau saat operasional offline.
4. Kasir mencatat pembayaran diterima.
5. Order dapat diproses sesuai aturan COD.
6. Payment status order berubah menjadi `paid`.
7. Owner wallet balance tidak bertambah dari order COD.

## Aturan Bisnis

1. Satu order hanya boleh menghasilkan satu credit ke owner wallet balance untuk satu pembayaran penuh yang sah.
2. Pembayaran wallet balance harus menolak transaksi jika saldo customer kurang.
3. Pembayaran wallet balance harus memotong saldo customer dan menambah saldo owner secara konsisten.
4. Pembayaran transfer harus menunggu status sukses dari Midtrans sebelum menambah saldo owner.
5. COD tidak menambah owner wallet balance karena dana diterima di luar sistem.
6. Owner wallet balance harus terpisah dari coin balance.
7. Perubahan saldo harus bisa diaudit dari riwayat transaksi.
8. Backend menjadi sumber kebenaran untuk status pembayaran dan mutasi saldo.
9. Retry, double submit, dan webhook berulang tidak boleh menyebabkan double credit.
10. Customer hanya bisa membatalkan order saat status order masih `requested` atau tahap "mengajukan".
11. Setelah order di-accept, customer tidak bisa membatalkan order dan tidak ada refund untuk alur saat ini.
12. Payment status `cod` harus dihapus atau tidak lagi dipakai sebagai status pembayaran.
13. COD memakai `payment_method = cod`, dengan payment status `unpaid` sebelum dibayar dan `paid` setelah diterima kasir.
14. Pembayaran partial belum didukung pada tahap ini dan menjadi fitur mendatang.

## Acceptance Criteria

1. Customer dapat memilih `cod`, `transfer`, atau `wallet_balance` sebagai metode pembayaran yang valid.
2. Pembayaran `wallet_balance` berhasil hanya jika saldo customer mencukupi.
3. Saat pembayaran `wallet_balance` berhasil, saldo customer berkurang sesuai tagihan order.
4. Saat pembayaran `wallet_balance` berhasil, order menjadi paid.
5. Saat pembayaran `wallet_balance` berhasil, owner wallet balance bertambah sesuai nominal pembayaran.
6. Saat saldo customer tidak cukup, pembayaran `wallet_balance` gagal tanpa mengubah saldo customer, status order, atau owner wallet balance.
7. Pembayaran `transfer` menghasilkan proses pembayaran Midtrans.
8. Order `transfer` tidak menjadi paid sebelum Midtrans menyatakan pembayaran sukses.
9. Saat Midtrans menyatakan pembayaran sukses, order menjadi paid dan owner wallet balance bertambah sebesar nominal net setelah fee.
10. Saat Midtrans mengirim status pending/gagal/expired/cancelled/denied, owner wallet balance tidak bertambah.
11. Webhook Midtrans yang berulang untuk order yang sama tidak menambah owner wallet balance lebih dari sekali.
12. Pembayaran `cod` tidak memotong saldo customer.
13. Pembayaran `cod` tidak menambah owner wallet balance.
14. Order COD memakai payment status `unpaid` sebelum dibayar dan berubah menjadi `paid` setelah pembayaran diterima.
15. Payment status khusus `cod` tidak lagi dipakai.
16. Pendapatan COD tetap dapat dilihat sebagai data order/penjualan, tetapi tidak masuk ke saldo wallet owner.
17. Setiap penambahan owner wallet balance memiliki riwayat transaksi yang dapat ditelusuri ke order.
18. Customer, kasir, dan owner melihat status pembayaran yang sesuai dengan kondisi pembayaran sebenarnya.
19. Customer hanya dapat membatalkan order saat status order masih `requested` atau "mengajukan".
20. Order yang sudah di-accept tidak dapat dibatalkan atau di-refund pada tahap ini.
21. Sistem belum mendukung pembayaran partial pada tahap ini.

## Catatan Ruang Lingkup

- Dokumen ini fokus pada user need dan aturan bisnis pembayaran.
- Dokumen ini belum menentukan struktur database, nama service, perubahan endpoint, atau desain UI final.
- Detail teknis seperti transaksi database, ledger wallet, mapping status Midtrans, perhitungan net setelah fee, dan strategi idempotency perlu dibahas pada implementation plan.
- Fitur withdrawal owner tidak dibahas detail di dokumen ini, tetapi owner wallet balance yang bertambah dari pembayaran order harus kompatibel dengan kebutuhan withdrawal.

## Keputusan Bisnis untuk Plan

1. Nilai teknis payment method untuk saldo customer adalah `wallet_balance`.
2. Owner wallet balance disimpan di level owner.
3. Nominal owner wallet balance dari pembayaran transfer memakai nominal net setelah fee.
4. Payment status khusus `cod` harus dihapus atau tidak dipakai lagi.
5. Order COD memakai `payment_method = cod` dan payment status `unpaid` sampai pembayaran diterima.
6. Setelah pembayaran COD diterima, payment status berubah menjadi `paid`.
7. Customer memilih metode pembayaran saat membuat order.
8. Customer hanya dapat membatalkan order saat status order masih `requested` atau "mengajukan".
9. Setelah order di-accept, order tidak dapat dibatalkan dan tidak ada refund pada tahap ini.
10. Pembayaran partial belum dibuat pada tahap ini dan akan menjadi fitur mendatang.
