# Feedback Review: Payment Wallet Balance Plan

Tanggal: 2026-05-29

Dokumen yang direview:

- `docs/user_need/payment_wallet_balance_user_need.md`
- `docs/plan/payment_wallet_balance_plan.md`

## Kesimpulan

Plan saat ini belum cukup untuk memenuhi user need secara end-to-end.

User need meminta perubahan bisnis utama pada pembayaran order, mutasi customer wallet, owner wallet balance, Midtrans, idempotency, dan penghapusan `payment_status = cod`. Tetapi plan saat ini membatasi scope ke customer app dan domain package, lalu secara eksplisit menaruh backend, webhook Midtrans, dan owner wallet balance di luar scope.

Akibatnya, jika plan ini dieksekusi apa adanya, UI customer bisa berubah, tetapi aturan bisnis pembayaran tetap belum selesai.

## Findings

### 1. Scope plan tidak mencakup inti user need

Severity: high

User need menetapkan bahwa:

- pembayaran `wallet_balance` memotong saldo customer dan menambah wallet balance owner,
- pembayaran `transfer` menambah wallet balance owner setelah Midtrans sukses,
- COD tidak menambah wallet balance owner,
- `payment_status = cod` harus dihapus atau tidak dipakai lagi.

Namun plan menyatakan backend, webhook Midtrans, dan owner wallet balance berada di luar scope. Ini membuat acceptance criteria user need tidak bisa terpenuhi.

Masukan:

Tambahkan fase backend ke plan, atau pecah menjadi dua plan eksplisit:

1. backend payment wallet balance plan,
2. customer app payment UI plan.

Jika dipisah, customer app plan harus menyebut dependency backend yang wajib selesai lebih dulu.

### 2. Plan belum menghapus `payment_status = cod`

Severity: high

User need sudah memutuskan COD memakai `payment_method = cod`, dengan payment status `unpaid` sebelum dibayar dan `paid` setelah diterima kasir.

Di codebase backend masih ada beberapa titik yang perlu masuk plan:

- `Order::PAYMENT_STATUS_COD`
- `OrderService::storeCustomer()` masih membuat COD dengan payment status `cod`
- `OrderService::pay()` masih mengubah COD menjadi payment status `cod`
- `Order::updatePaymentStatus()` masih mengecualikan status `cod`
- beberapa test masih mengharapkan `PAYMENT_STATUS_COD`

Masukan:

Plan perlu menambahkan fase migrasi status pembayaran COD:

1. ubah order baru COD menjadi `payment_status = unpaid`,
2. ubah mark COD paid menjadi `payment_status = paid`,
3. hapus penggunaan `PAYMENT_STATUS_COD` dari service/model/test,
4. siapkan migration/data repair untuk order lama yang masih berstatus `cod`.

### 3. Payment method `wallet_balance` belum masuk kontrak backend

Severity: high

User need menetapkan nilai teknis final adalah `wallet_balance`.

Plan customer app mengirim `payment_method`, tetapi backend mobile customer saat ini masih perlu diselaraskan:

- `StoreCustomerOrderRequest` masih membatasi `paymentMethod` ke `cod,transfer`.
- endpoint pay customer perlu menerima dan memvalidasi payment method.
- service wallet customer lama masih memakai `payment_method = balance`.

Masukan:

Plan perlu menetapkan kontrak API yang konsisten:

- saat create order: field `paymentMethod` berisi `cod`, `transfer`, atau `wallet_balance`,
- saat pay order: pilih satu format final, misalnya `paymentMethod`, bukan campur dengan `payment_method`,
- backend harus menolak nilai selain tiga metode tersebut,
- semua penggunaan lama `balance` untuk pembayaran customer perlu dimigrasikan ke `wallet_balance`.

### 4. Alur invoice masih bertentangan dengan keputusan "metode dipilih saat membuat order"

Severity: high

User need menyatakan customer memilih metode pembayaran saat membuat order. Plan juga menyebut hal ini di fase Order Summary.

Namun plan masih mendesain `OrderInvoiceScreen` untuk menampilkan `PaymentMethodSelectorWidget`, sehingga customer dapat mengganti metode pembayaran di invoice. Ini bertentangan dengan keputusan bisnis.

Masukan:

Pilih salah satu:

1. invoice hanya menampilkan metode pembayaran yang sudah dipilih saat order dibuat, atau
2. user need diubah agar customer memang boleh mengganti metode saat invoice.

Karena keputusan terbaru adalah memilih saat membuat order, rekomendasi saya: invoice screen jangan menampilkan selector. Tampilkan ringkasan metode pembayaran dan tombol aksi sesuai metode tersebut.

### 5. COD di invoice screen masih ambigu

Severity: medium

Plan menulis `cod` tidak tampil di invoice screen, tetapi struktur layar masih memakai `PaymentMethodSelectorWidget` yang berisi COD. Ini membuat arahan implementasi tidak konsisten.

Masukan:

Tambahkan aturan UI:

- jika order `payment_method = cod`, invoice hanya menampilkan instruksi bayar di kasir,
- tombol "Bayar Sekarang" tidak memanggil payment online/wallet,
- status tetap `unpaid` sampai kasir menandai paid.

### 6. Transfer net after fee belum direncanakan secara teknis

Severity: high

User need memutuskan owner wallet balance dari transfer memakai nominal net setelah fee. Plan belum menjelaskan:

- sumber data fee,
- kapan fee diketahui,
- field apa yang menyimpan gross, fee, dan net,
- apakah `wallet_transactions.amount` menyimpan net saja atau perlu menyimpan metadata gross/fee,
- dampaknya ke laporan/accounting.

Saat ini service wallet yang ada meng-credit dari `order.total_amount`, sehingga masih gross.

Masukan:

Tambahkan fase backend untuk perhitungan net:

- tentukan sumber fee Midtrans atau konfigurasi fee internal,
- simpan `gross_amount`, `fee_amount`, dan `net_amount` jika dibutuhkan audit,
- credit owner wallet menggunakan `net_amount`,
- update test webhook transfer agar memastikan saldo owner bertambah net, bukan gross.

### 7. Idempotency webhook perlu no-op, bukan error

Severity: high

User need meminta webhook Midtrans aman dari duplikasi. Pendekatan yang melempar error saat transaksi wallet sudah ada bisa membuat retry webhook dianggap gagal, padahal semestinya idempotent.

Masukan:

Plan perlu menegaskan:

- duplicate webhook sukses untuk order yang sudah credited harus return success/no-op,
- tambahkan unique constraint untuk kombinasi `order_id + type` di wallet transaction,
- lock order dan owner saat mutasi saldo,
- test webhook settlement dikirim dua kali dan saldo owner hanya bertambah sekali.

### 8. Risiko race condition pada owner wallet balance

Severity: high

Mutasi wallet balance owner harus aman jika dua pembayaran masuk bersamaan untuk owner yang sama.

Masukan:

Plan backend perlu mewajibkan salah satu pendekatan:

- lock row owner dengan `lockForUpdate()` sebelum menghitung `balance_before` dan `balance_after`, atau
- gunakan ledger sebagai sumber kebenaran dan update saldo cache secara atomic.

Tanpa ini, dua transaksi bersamaan bisa membaca saldo awal yang sama dan menghasilkan `balance_after` yang salah.

### 9. Partial payment belum scope, tetapi status `partial` masih ada di domain

Severity: medium

User need menyatakan partial payment belum dibuat untuk tahap ini. Namun model dan beberapa logic lama masih mengenal `partial`.

Masukan:

Plan tidak harus menghapus `partial` global jika dipakai modul lain, tetapi perlu menegaskan:

- customer payment flow tahap ini hanya full payment,
- endpoint pay order menolak pembayaran jika nominal tidak penuh,
- UI customer tidak menampilkan opsi partial,
- test customer payment memastikan paid amount selalu full total.

### 10. Plan frontend tampak sudah tidak sinkron dengan kondisi code

Severity: medium

Beberapa hal yang ditulis sebagai rencana sudah terlihat ada di customer app, misalnya:

- `PayOrderParams.paymentMethod`,
- `OrderState.midtransPaymentUrl`,
- `PaymentMethodSelectorWidget` dengan `wallet_balance`,
- `PaymentConfirmSheet`,
- `WalletBalanceSummaryWidget`,
- `OrderInvoiceScreen` redesign.

Masukan:

Perbarui plan agar jelas mana yang:

- sudah selesai,
- masih perlu diperbaiki,
- masih menunggu backend.

Jika tidak, implementor berikutnya bisa mengerjakan ulang bagian yang sebenarnya sudah ada.

### 11. Redirect Midtrans perlu diputuskan sebagai fitur final atau dependency

Severity: medium

Plan menyebut WebView Midtrans tidak diimplementasikan dan hanya menyiapkan `midtransPaymentUrl`. Namun layar invoice saat ini mengarah ke external launcher ketika `midtransPaymentUrl` tersedia.

Masukan:

Plan perlu memilih perilaku final:

- buka external browser/app,
- buka WebView internal,
- atau hanya menampilkan instruksi pembayaran.

Setelah itu acceptance criteria frontend perlu disesuaikan.

### 12. Encoding dokumen plan rusak

Severity: low

Dokumen plan menampilkan karakter rusak untuk dash, arrow, checkmark, dan emoji. Ini mengganggu pembacaan dan bisa membuat instruksi visual tidak jelas.

Masukan:

Simpan ulang file plan sebagai UTF-8 dan ganti simbol/emoji dengan ASCII sederhana jika perlu.

## Rekomendasi Revisi Plan

Tambahkan fase berikut sebelum atau sejajar dengan fase customer app:

### Fase Backend 1: Kontrak Payment Method

1. Validasi `paymentMethod` menerima `cod`, `transfer`, `wallet_balance`.
2. Normalisasi field request antara `paymentMethod` dan `payment_method`.
3. Migrasi penggunaan lama `balance` menjadi `wallet_balance`.
4. Update API docs customer order.

### Fase Backend 2: COD Payment Status

1. Hapus penggunaan `PAYMENT_STATUS_COD`.
2. Order COD baru dibuat sebagai `unpaid`.
3. Mark COD paid mengubah status menjadi `paid`.
4. Data lama `payment_status = cod` dimigrasikan ke `unpaid` atau `paid` sesuai aturan yang disepakati.
5. Update test yang masih mengharapkan `PAYMENT_STATUS_COD`.

### Fase Backend 3: Wallet Balance Payment

1. Endpoint pay menerima `wallet_balance`.
2. Saldo customer dikunci dan dicek.
3. Saldo customer dipotong.

4. Order menjadi paid.
5. Owner wallet balance dikredit.
6. Wallet transaction dibuat idempotent.
7. Test saldo kurang, saldo cukup, dan double submit.

### Fase Backend 4: Transfer Midtrans

1. Buat payment intent Midtrans untuk order transfer.
2. Simpan Midtrans reference dan payment URL/QR/instruction.
3. Webhook sukses mengubah order menjadi paid.
4. Owner wallet balance dikredit sebesar net after fee.
5. Webhook pending/gagal/expired tidak meng-credit wallet owner.
6. Duplicate webhook menjadi no-op sukses.

### Fase Frontend Revisi

1. Payment method selector hanya ada saat membuat order.
2. Invoice screen membaca payment method dari order, bukan memilih ulang.
3. Untuk `wallet_balance`, tampilkan saldo dan tombol bayar jika cukup.
4. Untuk `transfer`, tampilkan tombol lanjut pembayaran Midtrans.
5. Untuk `cod`, tampilkan instruksi bayar di kasir dan jangan tampilkan tombol payment online.
6. State `paymentSuccess` dan `midtransPaymentUrl` harus di-reset setelah dipakai agar listener tidak memicu navigasi berulang.

## Test yang Perlu Ditambahkan

1. Create customer order COD menghasilkan `payment_method = cod` dan `payment_status = unpaid`.
2. Mark COD paid menghasilkan `payment_status = paid`, tidak mengubah owner wallet balance.
3. Create customer order `wallet_balance` diterima oleh backend.
4. Pay `wallet_balance` dengan saldo kurang gagal tanpa mutasi saldo.
5. Pay `wallet_balance` dengan saldo cukup memotong customer balance, membuat order paid, dan meng-credit owner wallet balance.
6. Double submit pay `wallet_balance` tidak double debit customer dan tidak double credit owner.
7. Transfer Midtrans pending tidak meng-credit owner wallet balance.
8. Transfer Midtrans settlement meng-credit owner wallet balance sebesar net after fee.
9. Duplicate settlement webhook tidak double credit.
10. Customer tidak bisa cancel order setelah status accepted.

## Catatan Akhir

User need sudah cukup jelas. Yang perlu diperkuat adalah plan implementasinya, terutama backend. Customer app plan bisa tetap dipakai, tetapi sebaiknya diposisikan sebagai fase frontend setelah kontrak backend pembayaran diselesaikan.
