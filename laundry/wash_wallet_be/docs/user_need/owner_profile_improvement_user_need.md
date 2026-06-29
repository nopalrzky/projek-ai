# User Need: Improvement Profile Owner sebagai Pusat Informasi Owner

Tanggal: 2026-05-29

## 1. Latar Belakang

Profile owner saat ini perlu ditingkatkan agar tidak hanya menjadi halaman informasi akun dasar, tetapi menjadi pusat informasi penting yang membantu owner memahami kondisi akun, outlet, saldo, rekening, withdrawal, referral, dan status operasional bisnisnya.

Stakeholder menginginkan agar informasi yang sudah dibuat di sistem, tetapi belum masuk atau belum terlihat jelas di profile, dapat dimasukkan ke halaman profile. Tujuannya agar owner tidak perlu membuka banyak menu hanya untuk memahami kondisi penting terkait dirinya sebagai pemilik bisnis.

Dokumen ini disusun sebagai acuan kebutuhan sebelum dibuat implementation plan.

## 2. Ringkasan Kondisi Codebase Saat Ini

### Sudah Ada

1. Halaman profile owner sudah tersedia di `Dashboard/Profile/Index`.
2. Profile sudah memiliki tab:
   - `Overview`
   - `Outlets`
   - `Settings`
3. Profile sudah menampilkan data dasar user:
   - nama,
   - username,
   - avatar,
   - phone,
   - address,
   - status akun,
   - tanggal bergabung,
   - last login.
4. Profile sudah menampilkan ringkasan outlet:
   - total outlets,
   - active outlets,
   - daftar outlet owner.
5. Profile sudah menampilkan data referral dasar:
   - referral code,
   - total referrals,
   - total commission.
6. Profile sudah menampilkan `coinBalance`.
7. Sistem sudah memiliki data rekening lama pada user:
   - `bank_account_name`,
   - `bank_account_number`,
   - `bank_name`.
8. Sistem sudah mulai memiliki domain withdrawal baru:
   - `wallet_balance` pada user,
   - `owner_bank_accounts`,
   - `withdrawal_banks`,
   - `wallet_withdrawals`,
   - `wallet_transactions`.

### Gap yang Relevan

1. Profile belum menjadi ringkasan menyeluruh informasi owner.
2. `wallet_balance` belum terlihat sebagai informasi penting di profile.
3. `coin_balance` dan `wallet_balance` belum dibedakan secara eksplisit di profile.
4. Rekening bank owner baru belum terlihat sebagai bagian dari profile owner.
5. Withdrawal owner belum memiliki ringkasan di profile.
6. Wallet transaction atau histori saldo pendapatan belum terlihat dari profile.
7. Informasi referral dan commission sudah ada, tetapi masih bisa dibuat lebih actionable.
8. Profile belum memberi sinyal apakah setup owner sudah lengkap atau belum, misalnya belum punya rekening, belum punya outlet aktif, atau belum melengkapi nomor telepon.
9. Tab `Finance` dan `Referrals` pada folder profile terlihat belum terisi, sehingga ada peluang menjadikan profile lebih lengkap dengan tab finance/referral yang relevan.

## 3. Tujuan Improvement

Tujuan utama improvement ini adalah:

1. Menjadikan profile owner sebagai pusat informasi penting terkait akun owner.
2. Menampilkan data yang sudah tersedia tetapi belum dimasukkan ke profile.
3. Membantu owner memahami kondisi saldo coin, wallet balance, rekening, dan withdrawal.
4. Membantu owner mengetahui kelengkapan setup akun dan bisnis.
5. Mengurangi kebutuhan owner berpindah menu hanya untuk melihat ringkasan informasi dirinya.
6. Menyediakan navigasi cepat dari profile ke halaman pengelolaan terkait.

## 4. Aktor

1. `owner`
   Melihat dan mengelola informasi akun, outlet, saldo, rekening, withdrawal, referral, dan kelengkapan setup.
2. `system`
   Menyediakan ringkasan data, status, indikator kelengkapan, dan navigasi ke fitur terkait.
3. `super_admin`
   Tidak menjadi pengguna utama halaman ini, tetapi beberapa data seperti status akun, status withdrawal, atau verifikasi rekening dapat berkaitan dengan proses admin.

## 5. Scope Kebutuhan

Scope utama:

1. Ringkasan akun owner.
2. Ringkasan outlet owner.
3. Ringkasan saldo owner.
4. Ringkasan rekening bank owner.
5. Ringkasan withdrawal owner.
6. Ringkasan referral dan commission.
7. Indikator kelengkapan profile/setup owner.
8. Quick actions dari profile ke halaman terkait.

Di luar scope:

1. Membuat sistem KYC formal.
2. Membuat transfer withdrawal otomatis.
3. Menggabungkan semua halaman finance ke profile secara penuh.
4. Mengubah flow utama pengelolaan outlet, rekening, wallet, atau withdrawal.
5. Mengubah konsep coin dan wallet balance.

## 6. Prinsip Dasar Kebutuhan

1. Profile harus menjadi halaman ringkasan, bukan menggantikan halaman manajemen detail.
2. Data yang ditampilkan harus berguna bagi owner untuk mengambil tindakan.
3. Informasi saldo coin dan wallet balance harus dipisahkan dengan jelas.
4. Profile harus menampilkan status penting, bukan hanya angka.
5. Setiap section yang membutuhkan aksi lanjutan harus memiliki navigasi ke halaman terkait.
6. Informasi sensitif seperti nomor rekening harus ditampilkan secara aman, misalnya dimasking sebagian.
7. Profile tidak boleh menampilkan data owner lain.

## 7. User Need Fungsional

### FR-01 Profile Menampilkan Identitas Owner yang Lengkap

1. Owner dapat melihat informasi identitas utama:
   - nama,
   - username,
   - email,
   - nomor telepon,
   - alamat,
   - avatar,
   - status akun.
2. Jika ada data penting yang belum lengkap, profile harus menampilkan indikator atau pesan ringan.
3. Owner dapat menuju halaman edit profile dari section identitas.
4. Profile perlu membedakan informasi yang hanya dilihat dan informasi yang bisa diedit.

### FR-02 Profile Menampilkan Kelengkapan Setup Owner

1. Owner dapat melihat status kelengkapan setup akun.
2. Checklist kelengkapan minimal:
   - profile dasar sudah lengkap,
   - nomor telepon sudah diisi,
   - alamat sudah diisi,
   - memiliki minimal satu outlet,
   - memiliki minimal satu outlet aktif,
   - memiliki rekening withdrawal aktif,
   - memiliki saldo wallet atau coin jika relevan.
3. Checklist harus membantu owner memahami langkah berikutnya.
4. Setiap item checklist yang belum lengkap sebaiknya memiliki action link ke halaman yang sesuai.

### FR-03 Profile Menampilkan Ringkasan Outlet

1. Owner dapat melihat total outlet.
2. Owner dapat melihat total outlet aktif.
3. Owner dapat melihat daftar ringkas outlet miliknya.
4. Informasi outlet minimal:
   - nama outlet,
   - kode outlet,
   - status aktif/nonaktif,
   - tanggal dibuat.
5. Profile dapat menyediakan quick link ke detail outlet.
6. Jika owner belum memiliki outlet, profile harus menampilkan empty state dan action untuk membuat outlet jika role owner diizinkan.

### FR-04 Profile Menampilkan Ringkasan Saldo Owner

1. Owner dapat melihat `coin_balance`.
2. Owner dapat melihat `wallet_balance`.
3. Profile harus menjelaskan perbedaan:
   - coin adalah saldo fitur,
   - wallet balance adalah pendapatan yang dapat diajukan withdrawal.
4. Jika ada `available_wallet_balance`, profile dapat menampilkannya terpisah dari total wallet balance.
5. Jika ada saldo yang sedang tertahan karena withdrawal pending/processing, profile dapat menampilkannya sebagai reserved balance.
6. Profile harus menyediakan quick action ke:
   - halaman wallet,
   - halaman topup coin jika tersedia,
   - halaman withdrawal jika tersedia.

### FR-05 Profile Menampilkan Ringkasan Rekening Bank Owner

1. Owner dapat melihat daftar ringkas rekening bank yang tersimpan.
2. Data rekening yang ditampilkan minimal:
   - nama bank,
   - nama pemilik rekening,
   - nomor rekening yang dimasking,
   - status aktif/nonaktif,
   - penanda default jika ada.
3. Profile tidak boleh menampilkan nomor rekening penuh tanpa alasan yang jelas.
4. Jika owner belum memiliki rekening bank aktif, profile harus menampilkan warning/action agar owner menambahkan rekening sebelum withdrawal.
5. Profile harus menyediakan quick action ke halaman manajemen rekening bank.

### FR-06 Profile Menampilkan Ringkasan Withdrawal Owner

1. Owner dapat melihat ringkasan withdrawal dari profile.
2. Ringkasan minimal:
   - total withdrawal pending,
   - total withdrawal processing,
   - total withdrawal paid/completed,
   - total withdrawal rejected jika relevan,
   - request withdrawal terbaru.
3. Request terbaru minimal memuat:
   - kode withdrawal,
   - tanggal request,
   - nominal requested,
   - admin fee,
   - net amount,
   - status.
4. Profile harus menyediakan quick action untuk mengajukan withdrawal jika saldo tersedia mencukupi.
5. Profile harus menyediakan link ke riwayat withdrawal.

### FR-07 Profile Menampilkan Ringkasan Wallet Transaction

1. Owner dapat melihat transaksi wallet terbaru dari profile.
2. Data transaksi minimal:
   - tanggal,
   - type,
   - amount,
   - status,
   - deskripsi singkat.
3. Profile tidak perlu menggantikan halaman wallet transaction lengkap.
4. Profile harus menyediakan link ke halaman wallet atau wallet transaction.

### FR-08 Profile Menampilkan Ringkasan Referral dan Commission

1. Owner dapat melihat referral code.
2. Owner dapat melihat total referral.
3. Owner dapat melihat total commission.
4. Jika ada histori referral/commission, profile dapat menampilkan data terbaru secara ringkas.
5. Profile harus menyediakan action untuk menyalin referral code jika dibutuhkan.
6. Profile harus menyediakan link ke halaman referral jika halaman tersebut tersedia.

### FR-09 Profile Menampilkan Status Keamanan Akun

1. Owner dapat melihat kapan terakhir login.
2. Owner dapat melihat kapan password terakhir diubah jika data tersedia.
3. Owner dapat mengakses action ganti password.
4. Jika email atau nomor telepon belum diverifikasi dan sistem mendukung verifikasi, profile dapat menampilkan status verifikasi.
5. Profile harus memberi arahan keamanan sederhana tanpa terlalu memenuhi halaman.

### FR-10 Profile Menyediakan Quick Actions yang Relevan

1. Profile harus menyediakan action cepat berdasarkan kondisi owner.
2. Contoh quick actions:
   - edit profile,
   - ganti password,
   - kelola outlet,
   - kelola rekening bank,
   - lihat wallet,
   - ajukan withdrawal,
   - topup coin,
   - lihat referral.
3. Quick action yang tidak relevan atau belum memenuhi syarat harus dinonaktifkan atau diberi pesan alasan.
4. Contoh: `Ajukan withdrawal` dinonaktifkan jika owner belum punya rekening aktif atau saldo tersedia tidak cukup.

### FR-11 Profile Memiliki Struktur Tab yang Lebih Informatif

1. Profile dapat tetap memakai struktur tab agar tidak terlalu panjang.
2. Struktur tab yang disarankan:
   - `Overview`
   - `Finance`
   - `Outlets`
   - `Referrals`
   - `Settings`
3. Tab `Overview` berisi ringkasan paling penting dan checklist setup.
4. Tab `Finance` berisi coin, wallet balance, rekening, withdrawal, dan transaksi wallet ringkas.
5. Tab `Outlets` berisi daftar outlet dan status outlet.
6. Tab `Referrals` berisi referral code, total referral, commission, dan riwayat ringkas.
7. Tab `Settings` berisi action edit profile, password, dan preferensi akun jika ada.

### FR-12 Profile Harus Aman dan Terbatas pada Owner Terkait

1. Owner hanya dapat melihat data miliknya sendiri.
2. Data rekening harus dimasking.
3. Data wallet, withdrawal, dan transaksi tidak boleh bocor ke owner lain.
4. Backend tetap menjadi sumber kebenaran untuk authorization.
5. Frontend tidak boleh hanya mengandalkan filtering client-side.

## 8. Aturan Bisnis

1. Profile owner harus menampilkan informasi yang terkait dengan user owner yang sedang login.
2. `coin_balance` dan `wallet_balance` harus dipisah secara visual dan istilah.
3. Rekening bank yang ditampilkan di profile harus berasal dari rekening owner sendiri.
4. Withdrawal yang ditampilkan di profile harus milik owner sendiri.
5. Nomor rekening sebaiknya dimasking, misalnya hanya 4 digit terakhir yang terlihat.
6. Profile tidak boleh menjadi tempat untuk proses approval admin.
7. Profile boleh menyediakan navigasi ke halaman detail, tetapi proses bisnis utama tetap berada di halaman fitur masing-masing.
8. Empty state harus actionable, bukan hanya menampilkan data kosong.

## 9. Acceptance Criteria

1. Owner dapat melihat informasi akun dasar secara jelas di profile.
2. Owner dapat melihat checklist kelengkapan setup akun/bisnis.
3. Owner dapat melihat ringkasan outlet dan outlet aktif.
4. Owner dapat melihat coin balance dan wallet balance sebagai dua saldo berbeda.
5. Owner dapat melihat ringkasan rekening bank dengan nomor rekening yang dimasking.
6. Owner dapat melihat ringkasan withdrawal terbaru dan statusnya.
7. Owner dapat melihat transaksi wallet terbaru secara ringkas.
8. Owner dapat melihat referral code, total referral, dan total commission.
9. Owner dapat mengakses quick action ke halaman edit profile, password, outlet, wallet, rekening, withdrawal, dan referral.
10. Profile menampilkan warning/action jika data penting belum lengkap, seperti belum ada rekening aktif.
11. Profile tidak menampilkan data owner lain.
12. Profile tetap ringan dan tidak menggantikan halaman index/detail fitur yang sudah ada.

## 10. Catatan untuk Implementation Plan

Hal yang perlu diputuskan pada plan:

1. Apakah profile akan memakai endpoint/service `ProfileService` yang diperluas atau membuat service khusus profile summary.
2. Data finance apa saja yang perlu dihitung real-time dan apa yang cukup diambil dari tabel existing.
3. Apakah `available_wallet_balance` dihitung dari wallet balance dikurangi withdrawal pending/processing atau sudah tersedia dari service wallet.
4. Apakah rekening lama pada tabel users masih dipakai atau akan digantikan sepenuhnya oleh `owner_bank_accounts`.
5. Apakah tab `Finance` dan `Referrals` yang masih kosong akan diaktifkan dalam scope implementasi ini.
6. Jumlah transaksi wallet dan withdrawal terbaru yang ditampilkan di profile, misalnya 3 atau 5 item.
7. Apakah checklist setup hanya visual atau juga disimpan sebagai progress khusus.
8. Apakah referral commission tetap memakai data existing `getTotalCommission()` atau perlu ledger/riwayat lebih detail.
9. Apakah profile perlu menampilkan status fitur aktif di outlet yang memakai coin.
10. Apakah data sensitive seperti rekening perlu component masking reusable.

## 11. Pertanyaan Terbuka

1. Apakah profile owner hanya untuk owner, atau admin/super admin juga bisa membuka profile owner tertentu?
2. Apakah data `wallet_balance` ditampilkan di overview utama atau hanya di tab finance?
3. Apakah owner perlu melihat semua rekening bank di profile atau hanya rekening default dan jumlah rekening aktif?
4. Apakah ringkasan withdrawal cukup menampilkan status dan nominal terbaru, atau perlu chart sederhana?
5. Apakah referral perlu menjadi tab sendiri atau cukup card ringkas di overview?
6. Apakah profile perlu menampilkan status subscription/fitur outlet yang memakai coin?
7. Apakah owner perlu melihat data verifikasi akun, seperti email verified atau phone verified?

## 12. Rekomendasi Awal

Untuk implementasi tahap pertama, kebutuhan paling praktis adalah:

1. Tambahkan tab `Finance` di profile.
2. Isi tab `Finance` dengan ringkasan coin balance, wallet balance, rekening aktif/default, withdrawal terbaru, dan wallet transaction terbaru.
3. Tambahkan checklist kelengkapan setup di `Overview`.
4. Tambahkan quick actions yang mengarah ke halaman existing, bukan membuat ulang semua fitur di profile.
5. Gunakan data dari service yang sudah ada agar tidak menggandakan logic business.
6. Masking nomor rekening di seluruh tampilan profile.
7. Tetap pisahkan profile sebagai ringkasan dan halaman index/detail sebagai tempat pengelolaan penuh.

