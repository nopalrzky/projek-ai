# User Need: Password Setup Card di Halaman Akun Customer

Tanggal: 2026-06-14

## Latar Belakang

Halaman Akun customer pada route `/profile` sudah menjadi tempat utama untuk menampilkan ringkasan identitas, status profil, saldo deposit, quick actions, recent activity, menu akun, dan logout. Customer yang sudah login tetapi belum pernah membuat password perlu diberi entry point yang jelas untuk mengamankan akun dengan password.

Dokumen ini menjadi acuan kebutuhan pengguna sebelum dibuat implementation plan untuk menambahkan password setup card di halaman Akun customer. Fokus dokumen ini adalah kapan card boleh tampil, sumber data yang boleh dipercaya, posisi card, perilaku dismiss, dan navigasi menuju screen pengaturan password.

## Tujuan

1. Menampilkan ajakan membuat password hanya untuk customer authenticated yang benar-benar belum memiliki password.
2. Mencegah UI menampilkan card password berdasarkan data sementara yang tidak reliable.
3. Menempatkan card password di posisi yang mudah terlihat tanpa mengganggu struktur halaman Akun existing.
4. Memberi customer kontrol untuk menutup card selama kondisi yang sama masih berlaku.
5. Menyediakan CTA yang mengarah ke screen pengaturan password yang benar-benar tersedia.
6. Menjadi brief yang jelas untuk AI model lain saat menyusun implementation plan.

## Current State Codebase

### Halaman Akun

- Route `/profile` sudah memakai `ProfileScreen`.
- `ProfileScreen` sudah membaca auth state melalui `CustomerAuthCubit`.
- Data customer authenticated tersedia dari `CustomerAuthAuthenticated.customer`.
- Struktur konten halaman Akun saat ini sudah memuat:
  - `ProfileAccountHeaderWidget`
  - `ProfileStatusCardWidget` jika ada status profil yang relevan
  - `ProfileSummaryCardWidget`
  - `ProfileWalletCardWidget`
  - `ProfileQuickActionsWidget`
  - `ProfileRecentActivityWidget`
  - `ProfileMenuSectionWidget`
  - `ProfileLogoutButtonWidget`
- Card password yang dimaksud dokumen ini harus ditempatkan tepat setelah `ProfileSummaryCardWidget` dan sebelum `ProfileWalletCardWidget`.

### Auth dan Data Customer

- `CustomerAuthAuthenticated` membawa `CustomerAccount` sebagai data customer login.
- `CustomerAccount` saat ini belum memiliki field persisten untuk status password, misalnya `hasPassword`.
- Model parsing customer authenticated juga belum memetakan field password seperti `has_password` atau `hasPassword`.
- Backend `CustomerAuthService.sendOtpWithCheck` saat ini mengembalikan `has_password` di response request OTP.
- `CustomerAuthOtpRequested.hasPassword` hanya tersedia dalam flow request OTP.
- `CustomerAuthOtpRequested.hasPassword` bukan properti customer authenticated dan bukan sumber data reliable untuk halaman `/profile`.
- `CustomerAccountResource` yang dipakai untuk response customer saat ini belum mengembalikan status password.

### Navigasi

- Route `/profile` sudah terdaftar.
- Route `/profile/password` belum boleh diasumsikan tersedia.
- Default route yang direkomendasikan untuk kebutuhan berikutnya adalah `/profile/password`.
- Jika screen atau route pengaturan password belum ada saat implementasi, implementation plan wajib membuat screen dan route tersebut.
- CTA card tidak boleh diarahkan ke route palsu atau route yang belum terdaftar.

## Kebutuhan Data

Password setup card wajib bergantung pada status password yang reliable dari state customer authenticated atau response profile/auth yang setara.

Sumber data yang boleh dipakai:

1. Field persisten di `CustomerAccount`, misalnya `hasPassword`.
2. Field ekuivalen dari auth/profile response yang ikut disimpan dalam state authenticated customer.
3. Data profile/auth yang di-refresh dari backend dan menjadi sumber kebenaran untuk customer authenticated.

Sumber data yang tidak boleh dipakai sebagai sumber utama:

1. `CustomerAuthOtpRequested.hasPassword`.
2. Flag dari flow OTP yang tidak lagi tersedia setelah customer authenticated.
3. Tebakan dari UI, local state, route sebelumnya, atau repository/cubit baru yang hanya mencoba menyimpulkan status password tanpa sumber backend reliable.

Jika status password belum tersedia atau belum dapat dipercaya, password setup card tidak boleh ditampilkan.

## Kebutuhan UX

### 1. Posisi di Halaman Akun

Urutan halaman Akun setelah kebutuhan ini menjadi:

1. Header.
2. Status profile card jika ada.
3. Profile summary card.
4. Password setup card jika eligible.
5. Wallet atau saldo card.
6. Quick actions.
7. Recent activity.
8. Menu akun.
9. Logout.

Password setup card harus berada tepat di bawah `ProfileSummaryCardWidget` agar pesan keamanan terlihat dekat dengan identitas akun customer.

### 2. Eligibility Card

Password setup card hanya tampil jika semua kondisi berikut terpenuhi:

1. Customer sedang authenticated.
2. Data customer authenticated memiliki status password yang reliable.
3. Status password reliable menunjukkan customer belum memiliki password.
4. Card belum ditutup untuk condition signature yang sama.

Password setup card tidak tampil jika:

1. Customer sudah memiliki password.
2. Status password belum tersedia atau unknown.
3. Customer tidak dalam state `CustomerAuthAuthenticated`.
4. Customer sudah menutup card dan condition signature belum berubah.

### 3. Konten Card

Konten card harus ringkas dan jelas.

Copy yang disarankan:

- Judul: `Amankan akun kamu`
- Pesan: `Kamu belum membuat password. Atur password agar akun bisa login lebih mudah dan tetap aman.`
- CTA utama: `Atur Password`
- Aksi dismiss: tombol close.

Desain visual mengikuti komponen dan pola halaman Akun existing, misalnya memakai `AppCard`, `AppButton`, spacing, warna, dan typography dari `wash_wallet_ui` jika sesuai dengan implementasi sekitar.

### 4. Dismiss Behavior

- Customer dapat menutup password setup card.
- Setelah ditutup, card tidak muncul lagi selama condition signature sama.
- Condition signature minimal untuk kondisi ini adalah `missing_password`.
- Jika status berubah dari belum punya password menjadi sudah punya password, card hilang permanen karena customer tidak lagi eligible.
- Jika status berubah lagi karena refresh data menghasilkan kondisi berbeda, eligibility boleh dievaluasi ulang.
- Persistensi dismissal lintas app restart boleh ditentukan di implementation plan, tetapi key dismissal harus bergantung pada condition signature agar tidak menyembunyikan kondisi baru secara keliru.

### 5. Navigasi CTA

- Tap CTA `Atur Password` membuka screen pengaturan password.
- Default route kebutuhan untuk plan berikutnya adalah `/profile/password`.
- Screen pengaturan password harus benar-benar dibuat jika belum ada.
- Route `/profile/password` harus terdaftar sebelum card mengarah ke route tersebut.
- Tidak boleh ada navigasi ke route yang belum dibuat.

## Alur Pengguna

### Customer Belum Memiliki Password

1. Customer sudah login.
2. Customer membuka tab `Akun`.
3. App membuka `/profile`.
4. App membaca `CustomerAuthAuthenticated.customer`.
5. Status password reliable menunjukkan customer belum punya password.
6. Password setup card tampil di bawah profile summary card.
7. Customer dapat tap `Atur Password` untuk membuka screen pengaturan password.

### Customer Menutup Card

1. Customer melihat password setup card.
2. Customer tap tombol close.
3. Card hilang dari halaman.
4. Card tidak muncul lagi selama condition signature tetap `missing_password`.
5. Jika status password atau kondisi terkait berubah, app boleh mengevaluasi ulang eligibility.

### Customer Berhasil Membuat Password

1. Customer membuka screen pengaturan password dari CTA.
2. Customer berhasil membuat password.
3. App memperbarui auth/profile state dengan status password reliable.
4. `CustomerAuthAuthenticated.customer` atau sumber authenticated profile setara menunjukkan customer sudah memiliki password.
5. Password setup card tidak muncul lagi.

## Constraint Teknis

1. Password setup card wajib memakai status password yang reliable dari authenticated customer/profile data.
2. Jangan memakai `CustomerAuthOtpRequested.hasPassword` sebagai sumber utama halaman Akun.
3. Jika status password unknown, jangan tampilkan card.
4. Jangan membuat `ProfileCubit` atau `ProfileRepository` baru hanya untuk menebak status password.
5. Jika backend belum mengirim status password pada auth/profile response, implementation plan perlu memasukkan perubahan data contract yang diperlukan.
6. Jika mobile domain belum memiliki field status password, implementation plan perlu menambahkan field yang nullable atau setara agar status unknown bisa dibedakan dari `false`.
7. CTA tidak boleh mengarah ke `/profile/password` sebelum route dan screen tersebut dibuat.
8. Setelah password berhasil dibuat, auth/profile state harus di-refresh atau diperbarui agar card hilang.
9. Dismissal card harus bergantung pada condition signature, minimal `missing_password`.
10. Perubahan harus menjaga halaman `/profile` tetap dapat render walau status password belum tersedia.

## Non-Goals

- Dokumen user need ini tidak menentukan detail form password penuh.
- Dokumen ini tidak menentukan validasi password final, field form, atau API request detail.
- Dokumen ini tidak memaksa perubahan backend tertentu, tetapi wajib menyatakan kebutuhan status password reliable.
- Dokumen ini tidak menjadikan OTP flag sebagai sumber utama status password.
- Dokumen ini tidak membuat card password jika status tidak bisa dipercaya.
- Dokumen ini tidak mengganti keseluruhan struktur halaman Akun MVP.

## Acceptance Criteria

1. Customer authenticated yang belum punya password melihat password setup card di bawah summary card.
2. Customer authenticated yang sudah punya password tidak melihat password setup card.
3. Customer authenticated dengan status password unknown tidak melihat password setup card.
4. Password setup card bisa ditutup.
5. Password setup card yang ditutup tidak muncul lagi selama condition signature sama.
6. CTA `Atur Password` membuka screen pengaturan password.
7. Tidak ada navigasi ke route yang belum dibuat.
8. Status password bersumber dari data reliable, bukan `CustomerAuthOtpRequested.hasPassword`.
9. Setelah password berhasil dibuat dan auth/profile state diperbarui, password setup card hilang.

## Test Plan

1. Auth state dengan `hasPassword == false` menampilkan password setup card.
2. Auth state dengan `hasPassword == true` tidak menampilkan password setup card.
3. Auth state tanpa status password reliable tidak menampilkan password setup card.
4. Dismiss card menyembunyikan card selama signature `missing_password` belum berubah.
5. CTA `Atur Password` membuka `/profile/password`.
6. Setelah proses set password berhasil dan customer state menunjukkan sudah punya password, card tidak muncul lagi.
7. Tidak ada `ProfileCubit` atau repository baru yang dibuat hanya untuk menebak status password tanpa sumber reliable.
8. Tidak ada penggunaan `CustomerAuthOtpRequested.hasPassword` sebagai sumber utama halaman `/profile`.
9. Jika route `/profile/password` belum dibuat, test atau review implementation plan harus gagal sampai route dan screen tersedia.

## Catatan untuk Implementation Plan

- Tambahkan field status password reliable di contract auth/profile terlebih dahulu bila belum tersedia.
- Pertimbangkan field nullable seperti `bool? hasPassword` agar implementation bisa membedakan `false` dari unknown.
- Letakkan widget card baru setelah `ProfileSummaryCardWidget` dan sebelum `ProfileWalletCardWidget`.
- Reuse pola dismiss card yang sudah ada di `ProfileScreen` jika masih sesuai, tetapi gunakan signature khusus `missing_password`.
- Buat route dan screen `/profile/password` jika belum ada.
- Setelah set password sukses, refresh atau update `CustomerAuthAuthenticated.customer` agar eligibility card berubah tanpa perlu restart app.
