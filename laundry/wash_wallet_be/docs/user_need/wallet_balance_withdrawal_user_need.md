# User Need: Wallet Balance Owner dan Withdrawal Manual oleh Super Admin

Tanggal: 2026-05-29

## 1. Latar Belakang

Aplikasi customer memiliki beberapa metode pembayaran order:

1. `transfer`
   Pembayaran diproses melalui Midtrans. Dana masuk terlebih dahulu ke akun/payment gateway WashWallet, bukan langsung ke rekening owner.
2. `wallet`
   Customer membayar menggunakan saldo wallet/deposit customer yang ada di sistem.
3. `cod`
   Customer membayar tunai/COD, sehingga uang diterima secara operasional oleh outlet/kurir, bukan melalui rekening WashWallet.

Karena pembayaran `transfer` masuk ke WashWallet, owner membutuhkan saldo pendapatan yang bisa dicairkan. Saldo ini disebut `wallet_balance`.

`wallet_balance` berbeda dari `coin`:

1. `coin` adalah saldo internal owner/outlet untuk menggunakan fitur WashWallet.
2. `wallet_balance` adalah saldo pendapatan owner dari transaksi customer yang dapat diajukan untuk withdrawal.
3. `coin` tidak boleh bercampur dengan saldo withdrawal.
4. Withdrawal hanya berlaku untuk `wallet_balance`, bukan `coin_balance`.

Dokumen ini disusun sebagai acuan kebutuhan sebelum dibuat implementation plan.

## 2. Ringkasan Kondisi Codebase Saat Ini

### Sudah Ada

1. Order sudah memiliki field pembayaran seperti `payment_method`, `payment_status`, `paid_amount`, `remaining_amount`, dan data Midtrans.
2. Webhook Midtrans sudah ada untuk menangani pembayaran order/topup.
3. Customer account memiliki `deposit_balance`, yang secara bisnis dapat menjadi sumber pembayaran `wallet`.
4. Outlet memiliki field `balance`, tetapi istilah dan penggunaannya perlu dipastikan lagi apakah sudah merepresentasikan pendapatan withdrawable.
5. User/owner memiliki field rekening sederhana:
   - `bank_account_name`
   - `bank_account_number`
   - `bank_name`
6. Sudah ada model/tabel `withdrawals`, tetapi struktur saat ini masih berbasis `coin_amount` dan belum sesuai dengan kebutuhan withdrawal `wallet_balance`.

### Gap yang Relevan

1. Belum ada pemisahan eksplisit antara `coin_balance` dan `wallet_balance` owner.
2. Withdrawal yang dibutuhkan sekarang adalah withdrawal pendapatan owner, bukan withdrawal coin.
3. Owner baru memiliki satu data rekening sederhana, sementara kebutuhan mengarah ke owner dapat menyimpan dan memilih akun rekening.
4. Belum ada master setting biaya admin per bank untuk withdrawal.
5. Belum ada lifecycle withdrawal manual yang jelas dari request owner sampai transfer manual oleh super admin.
6. Belum ada notifikasi khusus ke super admin saat ada permintaan withdrawal.
7. Belum ada perhitungan estimasi nominal bersih yang diterima owner setelah biaya admin bank.

## 3. Tujuan Fitur

Tujuan utama fitur ini adalah:

1. Owner dapat melihat saldo pendapatan yang bisa ditarik sebagai `wallet_balance`.
2. Owner dapat menyimpan rekening bank untuk menerima withdrawal.
3. Owner dapat mengajukan withdrawal dengan memilih rekening tujuan.
4. Owner dapat melihat estimasi biaya admin dan nominal bersih yang akan diterima.
5. Super admin menerima notifikasi saat ada request withdrawal baru.
6. Super admin dapat memproses withdrawal secara manual, lalu memperbarui status di sistem.
7. Sistem menjaga agar withdrawal tidak melebihi saldo tersedia.

## 4. Aktor

1. `owner`
   Menerima pendapatan dari pembayaran customer, mengelola rekening penerima, dan mengajukan withdrawal.
2. `super_admin`
   Mengatur biaya admin bank, melihat request withdrawal, melakukan transfer manual, dan mengubah status withdrawal.
3. `customer`
   Membayar order menggunakan transfer, wallet, atau COD.
4. `system`
   Menghitung wallet balance, mencatat transaksi saldo, mengunci saldo saat withdrawal pending, mengirim notifikasi, dan menjaga konsistensi status.

## 5. Scope Kebutuhan

Scope utama:

1. Wallet balance owner sebagai saldo pendapatan withdrawable.
2. Riwayat transaksi wallet balance.
3. Manajemen rekening bank owner.
4. Master bank dan biaya admin withdrawal.
5. Pengajuan withdrawal oleh owner.
6. Review dan pemrosesan withdrawal manual oleh super admin.
7. Notifikasi withdrawal untuk super admin dan owner.

Di luar scope:

1. Transfer otomatis ke bank melalui API disbursement.
2. Konversi coin menjadi uang.
3. Withdrawal coin.
4. Rekonsiliasi otomatis mutasi bank.
5. Pembagian otomatis pendapatan multi-owner.
6. Settlement fee Midtrans secara detail, kecuali nanti diputuskan sebagai bagian dari perhitungan net revenue.

## 6. Prinsip Dasar Kebutuhan

1. `coin_balance` dan `wallet_balance` harus menjadi domain saldo yang terpisah.
2. `wallet_balance` hanya bertambah dari transaksi customer yang uangnya masuk atau tersimpan di sistem WashWallet.
3. COD tidak otomatis menambah `wallet_balance` karena uang diterima langsung secara offline oleh outlet/kurir.
4. Withdrawal mengurangi saldo tersedia owner, bukan saldo coin.
5. Biaya admin bank harus diketahui owner sebelum request withdrawal dikirim.
6. Super admin tetap melakukan transfer manual di luar sistem, lalu mencatat hasilnya di sistem.
7. Sistem harus mencegah saldo yang sama diajukan withdrawal lebih dari sekali.

## 7. Definisi Saldo

### Wallet Balance

`wallet_balance` adalah saldo pendapatan owner yang dapat diajukan untuk withdrawal.

Sumber penambahan saldo yang diharapkan:

1. Order customer dengan metode `transfer` setelah Midtrans mengonfirmasi pembayaran sukses.
2. Order customer dengan metode `wallet` setelah saldo customer berhasil dipotong dan order dinyatakan paid.

Sumber yang tidak menambah saldo:

1. Order `cod`, karena uang diterima langsung secara offline.
2. Topup coin owner.
3. Bonus/referral coin.
4. Penyesuaian coin outlet.

### Available Wallet Balance

`available_wallet_balance` adalah saldo yang benar-benar bisa diajukan withdrawal.

Rumus kebutuhan:

1. `available_wallet_balance = wallet_balance - total_pending_or_processing_withdrawal`
2. Withdrawal baru hanya boleh diajukan jika `available_wallet_balance` mencukupi.

### Pending/Reserved Balance

Saat owner mengajukan withdrawal, nominal withdrawal perlu dianggap terkunci/reserved agar tidak bisa diajukan ulang.

Plan nanti perlu memilih pendekatan:

1. saldo langsung dikurangi saat request dibuat, lalu dikembalikan jika rejected/cancelled, atau
2. saldo utama tetap, tetapi sistem menghitung reserved balance dari withdrawal pending/processing.

Rekomendasi awal: gunakan ledger transaksi wallet agar audit lebih jelas.

## 8. User Need Fungsional

### FR-01 Owner Dapat Melihat Wallet Balance

1. Owner dapat melihat total `wallet_balance`.
2. Owner dapat melihat `available_wallet_balance`.
3. Owner dapat melihat nominal saldo yang sedang tertahan karena withdrawal pending/processing.
4. Tampilan harus membedakan saldo wallet dari saldo coin.
5. Label UI harus jelas, misalnya:
   - `Saldo Pendapatan`
   - `Saldo Tersedia untuk Withdraw`
   - `Saldo Coin Fitur`

### FR-02 Sistem Mencatat Wallet Transaction

1. Setiap perubahan wallet balance harus memiliki histori transaksi.
2. Histori minimal memuat:
   - owner,
   - outlet jika relevan,
   - order jika berasal dari order,
   - withdrawal jika berasal dari withdrawal,
   - type transaksi,
   - amount,
   - balance before,
   - balance after,
   - status,
   - description,
   - created at.
3. Type transaksi minimal:
   - `order_transfer_income`
   - `order_wallet_income`
   - `withdrawal_request`
   - `withdrawal_rejected_refund`
   - `manual_adjustment`
4. Histori wallet tidak boleh bercampur dengan `coin_transactions`.

### FR-03 Wallet Balance Bertambah dari Pembayaran Transfer

1. Saat customer membayar order dengan metode `transfer`, pembayaran diproses melalui Midtrans.
2. Saldo owner hanya bertambah setelah webhook/status Midtrans menyatakan pembayaran sukses.
3. Jika pembayaran pending, expired, cancelled, atau failed, saldo owner tidak boleh bertambah.
4. Sistem harus mencegah duplicate credit jika webhook Midtrans terkirim lebih dari sekali.
5. Amount yang masuk ke wallet balance perlu ditentukan pada plan:
   - menggunakan gross order total, atau
   - menggunakan net setelah fee payment gateway.

Rekomendasi kebutuhan awal: catat gross order total sebagai pendapatan owner, lalu fee gateway diputuskan terpisah pada plan/accounting.

### FR-04 Wallet Balance Bertambah dari Pembayaran Wallet Customer

1. Saat customer membayar order menggunakan wallet/deposit customer, sistem memotong saldo customer.
2. Setelah pemotongan berhasil, owner menerima penambahan `wallet_balance`.
3. Penambahan saldo harus idempotent dan terkait ke order.
4. Jika pembayaran wallet gagal karena saldo customer tidak cukup, wallet balance owner tidak boleh bertambah.

### FR-05 COD Tidak Menambah Wallet Balance

1. Order dengan metode `cod` tidak menambah wallet balance owner secara otomatis.
2. COD tetap dapat dicatat sebagai order paid ketika kasir/kurir menandai pembayaran diterima.
3. Karena dana COD tidak berada di WashWallet, dana tersebut tidak masuk ke saldo withdrawal.
4. Laporan order tetap boleh menampilkan revenue COD, tetapi bukan sebagai withdrawable balance.

### FR-06 Owner Dapat Menyimpan Banyak Rekening Bank

1. Owner dapat menyimpan lebih dari satu rekening bank.
2. Data rekening minimal:
   - nama bank,
   - kode bank jika tersedia,
   - nomor rekening,
   - nama pemilik rekening,
   - status aktif/nonaktif,
   - penanda rekening utama/default.
3. Owner dapat menambah rekening baru.
4. Owner dapat mengubah data rekening selama belum digunakan pada withdrawal yang sedang pending/processing.
5. Owner dapat menonaktifkan rekening yang tidak dipakai.
6. Sistem perlu menyimpan snapshot rekening pada withdrawal agar riwayat tidak berubah jika rekening owner diedit setelah request dibuat.

### FR-07 Super Admin Dapat Mengatur Biaya Admin per Bank

1. Super admin dapat mengelola daftar bank yang tersedia untuk withdrawal.
2. Setiap bank dapat memiliki biaya admin.
3. Biaya admin minimal mendukung nominal fixed, misalnya Rp 2.500 atau Rp 6.500.
4. Jika dibutuhkan, plan dapat memperluas ke persentase atau kombinasi fixed dan persentase.
5. Owner hanya dapat memilih bank/rekening yang bank-nya aktif untuk withdrawal.
6. Perubahan biaya admin baru berlaku untuk request withdrawal baru, tidak mengubah request yang sudah dibuat.

### FR-08 Owner Dapat Mengajukan Withdrawal

1. Owner dapat membuat request withdrawal dari wallet balance.
2. Owner memilih rekening tujuan dari daftar rekening aktif miliknya.
3. Owner memasukkan nominal withdrawal.
4. Sistem menampilkan:
   - saldo tersedia,
   - nominal withdrawal,
   - biaya admin bank,
   - estimasi nominal bersih diterima.
5. Rumus nominal bersih:
   - `net_amount = requested_amount - admin_fee`
6. Sistem harus menolak request jika:
   - nominal lebih besar dari available wallet balance,
   - nominal kurang dari minimum withdrawal,
   - rekening tidak aktif atau bukan milik owner,
   - biaya admin membuat nominal bersih kurang dari atau sama dengan nol.

### FR-09 Owner Dapat Melihat Riwayat Withdrawal

1. Owner dapat melihat daftar request withdrawal miliknya.
2. Owner dapat melihat status setiap request.
3. Detail withdrawal minimal memuat:
   - kode withdrawal,
   - tanggal request,
   - rekening tujuan,
   - bank,
   - requested amount,
   - admin fee,
   - net amount,
   - status,
   - catatan admin jika ada,
   - bukti transfer jika tersedia.
4. Owner tidak dapat melihat withdrawal owner lain.

### FR-10 Super Admin Mendapat Notifikasi Withdrawal Baru

1. Saat owner mengajukan withdrawal, super admin harus menerima notifikasi.
2. Notifikasi minimal memuat:
   - nama owner,
   - nominal withdrawal,
   - bank tujuan,
   - net amount,
   - waktu request.
3. Notifikasi harus mengarah ke halaman detail withdrawal.
4. Jika ada lebih dari satu super admin, semua super admin yang relevan dapat menerima notifikasi.

### FR-11 Super Admin Dapat Memproses Withdrawal Manual

1. Super admin dapat melihat daftar withdrawal seluruh owner.
2. Super admin dapat memfilter withdrawal berdasarkan status, owner, bank, dan tanggal.
3. Super admin membuka detail withdrawal untuk melihat data rekening snapshot dan nominal transfer.
4. Super admin melakukan transfer manual di luar sistem.
5. Setelah transfer manual dilakukan, super admin mengubah status withdrawal menjadi paid/completed.
6. Super admin dapat mengunggah atau mencatat bukti transfer.
7. Owner menerima notifikasi ketika withdrawal selesai diproses.

### FR-12 Super Admin Dapat Menolak Withdrawal

1. Super admin dapat menolak withdrawal yang masih pending/processing.
2. Penolakan wajib memiliki alasan/catatan.
3. Jika nominal sudah dikunci dari saldo tersedia, sistem harus mengembalikan saldo tersebut ke owner.
4. Owner menerima notifikasi penolakan beserta alasan.

### FR-13 Status Lifecycle Withdrawal Harus Jelas

Status minimal yang dibutuhkan:

1. `pending`
   Request dibuat owner dan menunggu review super admin.
2. `processing`
   Super admin mulai memproses transfer manual.
3. `paid`
   Transfer manual berhasil dilakukan dan dicatat di sistem.
4. `rejected`
   Request ditolak dan saldo dikembalikan jika sebelumnya terkunci.
5. `cancelled`
   Request dibatalkan oleh owner sebelum diproses, jika fitur cancel disediakan.

Plan dapat menyederhanakan status, tetapi harus tetap membedakan request yang sudah dibayar dari request yang baru disetujui.

### FR-14 Withdrawal Harus Aman dari Double Spending

1. Sistem harus menggunakan transaksi database saat membuat withdrawal.
2. Sistem harus mengunci atau menghitung reserved balance agar saldo tidak bisa dipakai dua kali.
3. Dua request withdrawal bersamaan tidak boleh membuat saldo owner menjadi negatif.
4. Update status withdrawal harus idempotent.
5. Withdrawal yang sudah `paid` atau `rejected` tidak boleh diproses ulang secara tidak sengaja.

### FR-15 Minimum dan Maksimum Withdrawal Dapat Diatur

1. Sistem perlu memiliki konfigurasi minimum withdrawal.
2. Jika dibutuhkan, sistem dapat memiliki maksimum withdrawal per request.
3. Owner harus melihat batas minimum/maksimum sebelum submit.
4. Validasi backend tetap menjadi sumber kebenaran.

### FR-16 Admin Fee Harus Transparan

1. Owner harus melihat biaya admin sebelum request dikirim.
2. Request withdrawal harus menyimpan snapshot biaya admin saat request dibuat.
3. Jika biaya admin bank berubah setelah request dibuat, withdrawal lama tetap memakai biaya saat request dibuat.
4. Detail withdrawal harus menampilkan gross amount, admin fee, dan net amount secara terpisah.

### FR-17 Data Rekening Harus Memiliki Validasi Dasar

1. Nomor rekening hanya boleh berisi format yang valid sesuai aturan umum sistem.
2. Nama pemilik rekening wajib diisi.
3. Bank wajib dipilih dari daftar bank aktif.
4. Owner tidak boleh membuat rekening duplikat dengan bank dan nomor rekening yang sama.
5. Rekening yang sudah dipakai pada withdrawal tidak boleh dihapus permanen jika menghilangkan histori audit.

### FR-18 Audit Trail Harus Tersedia

1. Sistem harus mencatat siapa yang membuat request withdrawal.
2. Sistem harus mencatat siapa super admin yang memproses, menolak, atau menandai paid.
3. Sistem harus mencatat waktu perubahan status.
4. Catatan admin dan bukti transfer harus tersimpan pada withdrawal.
5. Perubahan saldo harus bisa ditelusuri dari wallet transaction.

## 9. Aturan Bisnis

1. Withdrawal hanya bisa dilakukan oleh owner.
2. Withdrawal hanya menggunakan `wallet_balance`, bukan `coin_balance`.
3. Owner hanya dapat memilih rekening miliknya sendiri.
4. Super admin menentukan biaya admin bank.
5. Owner menerima `requested_amount - admin_fee`.
6. Admin fee tidak boleh membuat net amount menjadi nol atau negatif.
7. Withdrawal tidak boleh melebihi saldo wallet tersedia.
8. Saldo dari order transfer baru boleh masuk setelah pembayaran sukses dari Midtrans.
9. Saldo dari order wallet baru boleh masuk setelah saldo customer berhasil dipotong.
10. COD tidak menambah wallet balance.
11. Withdrawal yang sudah paid tidak boleh dibatalkan.
12. Withdrawal rejected harus mengembalikan saldo jika saldo sudah dikunci/dipotong.

## 10. Acceptance Criteria

1. Owner dapat melihat saldo coin dan saldo wallet sebagai dua saldo berbeda.
2. Owner dapat melihat wallet balance, available balance, dan saldo yang sedang pending withdrawal.
3. Owner dapat menambah, mengubah, menonaktifkan, dan memilih rekening bank.
4. Super admin dapat membuat/mengubah daftar bank dan biaya admin withdrawal.
5. Owner dapat mengajukan withdrawal dengan memilih rekening dan melihat estimasi net amount.
6. Sistem menolak withdrawal jika saldo tidak cukup atau rekening tidak valid.
7. Saat withdrawal dibuat, super admin menerima notifikasi.
8. Super admin dapat melihat detail request dan memproses transfer manual.
9. Super admin dapat menandai withdrawal sebagai paid dan menyimpan bukti/catatan transfer.
10. Super admin dapat menolak withdrawal dengan alasan.
11. Owner menerima notifikasi saat withdrawal paid atau rejected.
12. Wallet transaction mencatat semua perubahan saldo wallet.
13. Pembayaran order transfer yang sukses menambah wallet balance owner secara idempotent.
14. Pembayaran order wallet yang sukses menambah wallet balance owner secara idempotent.
15. Pembayaran COD tidak menambah wallet balance.
16. Withdrawal pending/processing mencegah saldo yang sama diajukan ulang.

## 11. Catatan untuk Implementation Plan

Hal yang perlu diputuskan pada plan:

1. Apakah `wallet_balance` disimpan di `users` sebagai saldo owner, di `outlets`, atau dihitung dari ledger.
2. Jika outlet `balance` yang ada ingin dipakai, perlu dipastikan apakah cakupannya outlet-level atau owner-level.
3. Nama tabel rekening owner, misalnya `owner_bank_accounts`.
4. Nama tabel master bank dan biaya admin, misalnya `withdrawal_banks` atau `bank_transfer_fees`.
5. Apakah tabel `withdrawals` existing akan dimigrasikan atau dibuat ulang konsepnya karena saat ini masih berbasis `coin_amount`.
6. Apakah `requested_amount` berarti nominal yang dipotong dari saldo owner atau nominal yang ingin diterima bersih.
7. Apakah payment gateway fee Midtrans mengurangi wallet balance owner atau menjadi biaya platform.
8. Bagaimana menangani refund order yang sebelumnya sudah menambah wallet balance.
9. Apakah owner boleh membatalkan withdrawal selama status masih pending.
10. Apakah perlu halaman khusus super admin untuk withdrawal atau masuk ke dashboard notification/action center.

## 12. Pertanyaan Terbuka

1. Wallet balance akan berada di level owner atau per outlet?
2. Apakah owner boleh menarik saldo gabungan semua outlet dalam satu withdrawal?
3. Apakah pembayaran `wallet` customer pasti harus menambah wallet balance owner, mengingat dana customer sudah masuk ke WashWallet saat topup?
4. Apakah biaya admin bank ditanggung owner sepenuhnya atau bisa ditanggung platform?
5. Apakah ada minimum withdrawal, misalnya Rp 50.000 atau Rp 100.000?
6. Apakah super admin perlu upload bukti transfer berupa gambar/file?
7. Apakah owner boleh menghapus rekening yang sudah pernah digunakan pada withdrawal?
8. Apakah withdrawal harus menunggu masa settlement tertentu setelah order paid?

## 13. Rekomendasi Awal

Untuk implementasi tahap pertama, kebutuhan paling aman adalah:

1. Gunakan istilah `wallet_balance` untuk saldo pendapatan owner yang bisa ditarik.
2. Buat ledger `wallet_transactions` agar saldo dapat diaudit dan tidak bercampur dengan coin.
3. Buat rekening owner sebagai tabel terpisah agar owner bisa punya banyak rekening.
4. Buat master bank withdrawal dengan fixed admin fee.
5. Simpan snapshot rekening dan biaya admin pada setiap withdrawal.
6. Gunakan status `pending`, `processing`, `paid`, `rejected`, dan opsional `cancelled`.
7. Kurangi available balance sejak withdrawal dibuat agar tidak terjadi double spending.
8. Jangan gunakan withdrawal existing berbasis `coin_amount` tanpa migrasi konsep, karena kebutuhan baru adalah withdrawal pendapatan, bukan coin.

