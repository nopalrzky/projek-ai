# User Need: Edit Profile Customer

Tanggal: 2026-06-14

## Latar Belakang

Halaman Akun customer di route `/profile` sudah menjadi halaman profil MVP, tetapi customer belum bisa memperbarui data dasar profilnya. Saat ini customer hanya bisa melihat ringkasan data akun, status kelengkapan profil, saldo deposit, quick actions, menu akun, card setup password, dan logout.

Menu `Edit Profil` masih diperlakukan sebagai fitur belum tersedia. Dampaknya, customer yang sudah login tidak punya jalur resmi untuk memperbaiki nama, menambahkan email, mengisi gender, atau mengisi tanggal lahir. Field kosong tersebut juga membuat status card `Profil belum lengkap` tetap muncul di `/profile`.

Dokumen ini menjadi acuan kebutuhan pengguna sebelum dibuat implementation plan untuk fitur edit profile customer. Fokus v1 adalah update data dasar customer authenticated dari halaman Akun, bukan membuat domain profile terpisah atau fitur account management penuh.

## Tujuan

1. Menyediakan route dan screen edit profile customer dari halaman `/profile`.
2. Mengizinkan customer authenticated memperbarui data dasar yang sudah tersedia di `CustomerAccount`.
3. Menjaga `CustomerAuthAuthenticated.customer` sebagai sumber kebenaran UI setelah update berhasil.
4. Menyimpan perubahan melalui backend authenticated endpoint yang reliable.
5. Menghilangkan navigasi placeholder `Edit Profil` tanpa membuat route palsu.
6. Menjadi brief yang jelas untuk AI model lain saat menyusun implementation plan.

## Current State Codebase

### Halaman Profile

- Route `/profile` sudah terdaftar di `AppRouter` sebagai branch tab Akun.
- `ProfileScreen` sudah membaca auth state memakai `BlocBuilder<CustomerAuthCubit, CustomerAuthState>`.
- Jika state adalah `CustomerAuthAuthenticated`, halaman memakai `authState.customer` sebagai data customer utama.
- Jika state bukan `CustomerAuthAuthenticated`, halaman menampilkan fallback loading.
- `ProfileScreen` sudah menampilkan beberapa section:
  - `ProfileAccountHeaderWidget`
  - `ProfileStatusCardWidget`
  - `ProfileSummaryCardWidget`
  - `ProfilePasswordSetupCardWidget`
  - `ProfileWalletCardWidget`
  - `ProfileQuickActionsWidget`
  - `ProfileRecentActivityWidget`
  - `ProfileMenuSectionWidget`
  - `ProfileLogoutButtonWidget`

### Profile Summary

- `ProfileSummaryCardWidget` menerima `CustomerAccount customer`.
- Card menampilkan:
  - Avatar dari `customer.avatar` jika tersedia.
  - Initial avatar fallback dari `customer.name` jika avatar kosong atau gagal load.
  - Nama customer dari `customer.name`.
  - Nomor HP dari `customer.phone`.
  - Badge verifikasi berdasarkan `customer.isVerified`.
  - Email customer jika ada, atau teks `Email belum ditambahkan`.
- Saat ini summary card belum menyediakan CTA edit profile.

### Profile Status Card

- `ProfileStatusCardWidget` menerima `CustomerAccount customer`.
- Card tampil jika ada kondisi profile/account yang perlu perhatian.
- Kondisi yang sudah dipakai:
  - `customer.email` kosong.
  - `customer.dateOfBirth` kosong.
  - `customer.gender` kosong.
  - `customer.isVerified == false`.
  - `customer.isActive == false`.
- `ProfileScreen` membuat condition signature dari kondisi tersebut dan menyimpan dismissed signature secara lokal.
- Jika field yang kosong diisi lewat edit profile, signature harus berubah dan card harus otomatis menyesuaikan atau hilang.

### Profile Menu

- `ProfileMenuSectionWidget` sudah menampilkan menu aktif untuk route yang sudah ada:
  - `Alamat Saya` ke `/customer-addresses`
  - `Riwayat Pesanan` ke `/orders`
  - `Promo` ke `/promos`
  - `Saldo Deposit` ke `/topup`
- `Edit Profil` saat ini masih ada di daftar disabled item tanpa route.
- Disabled item memakai title `${item.label} - Segera hadir` dan tap menampilkan `AppSnackbar.info` dengan pesan `Segera hadir`.
- Untuk fitur ini, item `Edit Profil` harus menjadi entry point aktif dan tidak lagi menampilkan `Segera hadir`.

### Navigasi Existing

- `/profile` sudah tersedia.
- `/profile/password` sudah tersedia untuk `SetPasswordScreen`.
- `/profile/edit` belum tersedia dan menjadi route default untuk implementation plan berikutnya.
- Tidak boleh ada navigasi ke route edit profile selain route yang benar-benar dibuat.

### Auth dan Data Customer

- App customer menyediakan `CustomerAuthCubit` sebagai global auth bloc.
- State authenticated adalah `CustomerAuthAuthenticated`.
- Data customer authenticated tersedia lewat `CustomerAuthAuthenticated.customer`.
- `CustomerAuthCubit` sudah memiliki pola update auth state setelah aksi authenticated berhasil, misalnya `setPassword()` meng-emit `CustomerAuthAuthenticated(customer)` dari response backend.
- `CustomerAuthRepositoryImpl` menyimpan customer ke local cache ketika `getProfile()`, login/register, dan `setPassword()` berhasil.
- Untuk edit profile, update sukses juga harus memperbarui:
  - `CustomerAuthAuthenticated.customer`
  - local cached customer di `AuthLocalDatasource`
- Fitur ini tidak boleh membuat `ProfileCubit` atau repository profile terpisah yang menjadi sumber customer kedua dan rawan stale tanpa sinkronisasi ke auth state.

### CustomerAccount Field

`CustomerAccount` saat ini memiliki field:

- `id`
- `phone`
- `name`
- `email`
- `gender`
- `avatar`
- `dateOfBirth`
- `isVerified`
- `isActive`
- `lastLoginAt`
- `fcmToken`
- `depositBalance`
- `hasPassword`

Field yang masuk scope edit profile v1:

- `name`
- `email`
- `gender`
- `dateOfBirth`

Field yang tidak masuk scope edit profile v1:

- `phone`
- `avatar`
- `password`
- `hasPassword`
- `isVerified`
- `isActive`
- `lastLoginAt`
- `fcmToken`
- `depositBalance`

### Backend/API Existing

- Customer mobile auth routes berada di group `/mobile/customer/auth`.
- Existing route authenticated yang terkait profil:
  - `GET /mobile/customer/auth/me`
  - `POST /mobile/customer/auth/logout`
  - `POST /mobile/customer/auth/fcm-token`
  - `POST /mobile/customer/auth/set-password`
- Belum ada route update profile customer dasar.
- `CustomerAccountResource` sudah mengembalikan shape customer yang dibaca mobile, termasuk `name`, `email`, `gender`, `dateOfBirth`, `phone`, `depositBalance`, `isVerified`, `isActive`, dan `has_password`.

## Aktor

- Customer yang sudah login.
- Sistem mobile customer.
- Backend mobile customer API.

## Scope Fitur v1

### In Scope

1. Customer authenticated dapat membuka edit profile dari halaman `/profile`.
2. Route default fitur adalah `/profile/edit`.
3. Screen edit profile menampilkan form data dasar yang prefilled dari `CustomerAuthAuthenticated.customer`.
4. Customer dapat mengubah:
   - `name`
   - `email`
   - `gender`
   - `dateOfBirth`
5. Submit mengirim data ke backend authenticated endpoint.
6. Response update mengembalikan `CustomerAccount` terbaru.
7. Setelah sukses, app memperbarui auth state dan local cached customer.
8. Setelah sukses, app menampilkan feedback berhasil dan kembali ke `/profile`.
9. Halaman `/profile` langsung menampilkan data terbaru tanpa perlu logout-login.

### Non-Goals v1

- Edit nomor HP.
- Verifikasi atau ganti nomor HP.
- Upload, crop, hapus, atau edit avatar.
- Ubah password atau keamanan akun.
- Setup password.
- Alamat customer.
- Notification settings.
- Delete account.
- Update saldo deposit.
- Update status verifikasi.
- Update status aktif akun.
- Membuat halaman profile publik.
- Membuat sumber data customer kedua melalui `ProfileCubit` atau profile repository terpisah tanpa sinkron ke auth state.

## Kebutuhan UX

### Entry Point

Fitur harus dapat dibuka dari dua tempat di halaman `/profile`:

1. Dari profile summary card.
2. Dari menu `Edit Profil` di `ProfileMenuSectionWidget`.

Profile summary boleh memakai affordance yang jelas, misalnya action icon atau small button edit, selama tidak mengganggu informasi utama. Menu `Edit Profil` harus menjadi item aktif yang mengarah ke `/profile/edit`.

### Screen Edit Profile

- Screen memakai route `/profile/edit`.
- Screen terasa sebagai detail flow dari tab Akun dan memiliki navigasi back.
- Header/title yang disarankan: `Edit Profil`.
- Form harus prefilled dari `CustomerAuthAuthenticated.customer`.
- Field yang ditampilkan:
  - Nama.
  - Email.
  - Gender.
  - Tanggal lahir.
- Nomor HP boleh ditampilkan sebagai informasi read-only jika membantu konteks, tetapi tidak boleh editable.
- Avatar upload tidak perlu ditampilkan sebagai kewajiban v1.

### Validasi Lokal

- `name` wajib diisi setelah trim.
- `email` opsional.
- Jika `email` diisi, format email harus valid.
- `gender` opsional.
- Jika `gender` diisi, value harus konsisten dengan backend:
  - `male`
  - `female`
- `dateOfBirth` opsional.
- Jika `dateOfBirth` diisi, tanggal tidak boleh di masa depan.
- Format payload tanggal lahir harus konsisten dengan backend, disarankan `YYYY-MM-DD`.

### Submit State

- Tombol simpan harus disabled atau menampilkan loading saat request berjalan.
- UI harus mencegah double submit.
- Customer tetap bisa melihat data yang sedang diedit saat loading.
- Jika submit sukses:
  - Tampilkan feedback berhasil.
  - Update auth state dan local cache.
  - Kembali ke `/profile`.
- Jika submit gagal:
  - Tampilkan error yang jelas.
  - Jangan mengubah data tersimpan di auth state atau local cache.
  - Form tetap berada di `/profile/edit` agar customer bisa memperbaiki input.

### Error Handling

Error backend harus ditampilkan jelas, terutama:

- `name` kosong atau tidak valid.
- `email` format tidak valid.
- `email` sudah digunakan customer lain.
- `gender` tidak valid.
- `dateOfBirth` bukan tanggal valid.
- `dateOfBirth` tanggal masa depan jika backend ikut memvalidasi.
- Error network atau server umum.

Implementation plan boleh memilih menampilkan error sebagai inline form error, snackbar, atau kombinasi keduanya. Error validasi field lebih baik ditampilkan dekat field jika struktur failure mendukung.

## Kebutuhan Data dan API

### Endpoint Update Profile

Fitur harus memakai authenticated endpoint yang reliable. Rekomendasi default untuk implementation plan:

- `PATCH /auth/profile`

Dengan base mobile customer API, endpoint efektif dapat dipetakan menjadi:

- `PATCH /mobile/customer/auth/profile`

Implementation plan boleh memilih nama endpoint lain jika lebih konsisten dengan backend existing, tetapi harus tetap berada di area authenticated customer auth/profile dan tidak membuat resource yang ambigu.

### Payload

Payload minimal:

```json
{
  "name": "Nama Customer",
  "email": "customer@example.com",
  "gender": "male",
  "date_of_birth": "1995-01-31"
}
```

Catatan:

- `name` wajib.
- `email`, `gender`, dan `date_of_birth` boleh `null` atau tidak dikirim sesuai kontrak backend yang dipilih.
- Payload tidak boleh mengirim `phone` untuk update di scope v1.
- Payload tidak boleh mengirim `avatar`, `password`, `deposit_balance`, `is_verified`, atau field sistem lain.

### Response

Response sukses harus mengembalikan `CustomerAccount` terbaru dengan shape yang kompatibel dengan `CustomerAccountModel.fromJson`.

Contoh shape data:

```json
{
  "id": 1,
  "phone": "08123456789",
  "name": "Nama Customer",
  "email": "customer@example.com",
  "gender": "male",
  "avatar": null,
  "depositBalance": 0,
  "dateOfBirth": "1995-01-31",
  "isVerified": true,
  "isActive": true,
  "lastLoginAt": "2026-06-14T03:00:00.000000Z",
  "has_password": true
}
```

Response boleh dibungkus dalam envelope API existing selama datasource mengambil object customer yang benar.

### Backend Validation

Backend harus memvalidasi:

- Authenticated customer wajib ada.
- `name`: required string, max length sesuai standar backend.
- `email`: nullable email, unique pada `customer_accounts.email`, mengabaikan customer sendiri saat email tidak berubah.
- `gender`: nullable in `male,female`.
- `date_of_birth`: nullable date, tidak boleh future.
- Field selain scope update harus diabaikan atau ditolak secara aman.

### Update State dan Cache

Setelah backend update sukses:

1. Remote datasource mengubah response menjadi `CustomerAccountModel`.
2. Repository menyimpan `CustomerAccountModel` terbaru ke `AuthLocalDatasource.saveCustomer`.
3. Usecase mengembalikan `CustomerAccount`.
4. `CustomerAuthCubit` meng-emit `CustomerAuthAuthenticated(updatedCustomer)`.
5. `/profile` re-render dari auth state terbaru.

Fitur ini tidak boleh hanya mengubah local widget state tanpa konfirmasi backend.

## Interaksi dengan Halaman Akun

### Setelah Update Berhasil

- `ProfileSummaryCardWidget` menampilkan nama/email terbaru.
- Jika gender atau tanggal lahir ditampilkan di UI profile sekarang atau nanti, nilainya harus memakai customer terbaru.
- `ProfileStatusCardWidget` menghitung ulang condition signature dari customer terbaru.
- Jika email, gender, atau tanggal lahir yang sebelumnya kosong sudah diisi, pesan status card harus hilang atau berkurang.
- Jika semua kondisi profile lengkap dan akun aktif/verified, status card tidak tampil.
- Menu `Edit Profil` tetap aktif dan tidak menampilkan `Segera hadir`.

### Setelah Update Gagal

- `/profile` tidak boleh menampilkan data baru yang belum disimpan backend.
- `CustomerAuthAuthenticated.customer` tetap berisi data sebelum submit.
- Local cached customer tidak boleh ditimpa data gagal.
- Screen edit profile tetap terbuka dengan pesan error.

## Constraint Teknis

1. Gunakan `CustomerAuthCubit` sebagai orchestrator update profile supaya auth state tetap single source of truth.
2. Jika implementation plan menambahkan usecase baru, letakkan di domain auth/customer auth flow yang sudah ada, bukan membuat source customer paralel.
3. Jika implementation plan menambahkan method repository baru, method tersebut harus menyimpan customer terbaru ke local cache setelah response sukses.
4. Jangan membuat `ProfileCubit` hanya untuk menyimpan data customer edit profile.
5. Jangan membuat update local-only sebagai sumber kebenaran.
6. Jangan mengubah `phone` dalam scope ini.
7. Jangan mewajibkan avatar upload.
8. Jangan mengubah behavior `/profile/password`.
9. Jangan membuat route edit profile jika entry point masih disabled.
10. Jangan menambahkan navigasi ke route yang belum dibuat.
11. Gunakan komponen/design system existing seperti `AppCard`, `AppButton`, `AppTextField`, `AppSnackbar`, spacing, dan typography dari `wash_wallet_ui` bila sesuai pola file sekitar.
12. Pertahankan pola error mapping existing dari `ApiException` ke `ValidationFailure` jika memungkinkan.

## Alur Pengguna

### Membuka Edit Profile dari Summary

1. Customer sudah login.
2. Customer membuka tab Akun di `/profile`.
3. Customer tap action edit pada `ProfileSummaryCardWidget`.
4. App membuka `/profile/edit`.
5. Form tampil dengan data dari `CustomerAuthAuthenticated.customer`.

### Membuka Edit Profile dari Menu

1. Customer sudah login.
2. Customer membuka tab Akun di `/profile`.
3. Customer scroll ke `Menu Akun`.
4. Customer tap `Edit Profil`.
5. App membuka `/profile/edit`.
6. Item tidak menampilkan `Segera hadir`.

### Submit Berhasil

1. Customer mengubah nama, email, gender, atau tanggal lahir.
2. Customer tap `Simpan`.
3. App menjalankan validasi lokal.
4. App mengirim request authenticated ke backend.
5. Backend menyimpan perubahan dan mengembalikan `CustomerAccount` terbaru.
6. App menyimpan customer terbaru ke local cache.
7. `CustomerAuthCubit` meng-emit `CustomerAuthAuthenticated(updatedCustomer)`.
8. App menampilkan feedback berhasil.
9. App kembali ke `/profile`.
10. Summary card dan status card menampilkan kondisi terbaru.

### Submit Gagal

1. Customer mengisi data tidak valid atau backend menolak request.
2. Customer tap `Simpan`.
3. App menampilkan loading sebentar.
4. Backend mengembalikan validation error atau request gagal.
5. App menampilkan error.
6. App tidak mengubah auth customer dan local cache.
7. Customer tetap berada di form edit profile.

## Acceptance Criteria

1. Customer authenticated dapat membuka edit profile dari profile summary card.
2. Customer authenticated dapat membuka edit profile dari menu `Edit Profil`.
3. Route `/profile/edit` terdaftar dan membuka screen edit profile yang benar-benar tersedia.
4. Item `Edit Profil` tidak lagi disabled dan tidak menampilkan `Segera hadir`.
5. Form edit profile prefilled dari `CustomerAuthAuthenticated.customer`.
6. Form menyediakan field editable untuk `name`, `email`, `gender`, dan `dateOfBirth`.
7. Customer tidak dapat mengedit nomor HP pada fitur ini.
8. Avatar upload tidak muncul sebagai kewajiban fitur ini.
9. `name` wajib diisi.
10. `email` opsional, tetapi harus format email valid jika diisi.
11. `gender` hanya menerima pilihan valid `male` atau `female` jika diisi.
12. `dateOfBirth` opsional dan tidak boleh tanggal masa depan.
13. Tombol simpan mencegah double submit saat loading.
14. Submit valid memanggil authenticated backend endpoint update profile.
15. Backend response update mengembalikan `CustomerAccount` terbaru.
16. Submit sukses memperbarui `CustomerAuthAuthenticated.customer`.
17. Submit sukses memperbarui local cached customer.
18. Submit sukses menampilkan feedback berhasil dan kembali ke `/profile`.
19. Setelah sukses, `/profile` langsung menampilkan nama/email/gender/tanggal lahir terbaru sesuai UI yang tersedia.
20. Setelah sukses, status card profil di `/profile` ikut menyesuaikan berdasarkan data terbaru.
21. Jika field yang sebelumnya kosong sudah diisi, condition signature status card berubah atau hilang.
22. Submit gagal menampilkan error tanpa mengubah data yang tersimpan.
23. Error validasi backend ditampilkan jelas, terutama email duplicate atau format tidak valid.
24. Tidak ada navigasi ke route yang belum dibuat.
25. Tidak ada `ProfileCubit` atau repository terpisah yang membuat sumber customer kedua dan rawan stale tanpa sinkron ke auth state.
26. Tidak ada update local-only sebagai sumber kebenaran.

## Test Plan

1. Auth customer membuka `/profile/edit` dari profile summary card dan melihat form terisi sesuai customer state.
2. Auth customer membuka `/profile/edit` dari menu `Edit Profil` dan melihat form terisi sesuai customer state.
3. Route `/profile/edit` dapat dibuka langsung saat customer authenticated.
4. Nama kosong menampilkan validasi lokal atau backend.
5. Email kosong diterima.
6. Email tidak valid menampilkan validasi.
7. Email duplicate dari backend menampilkan error yang jelas.
8. Gender kosong diterima.
9. Gender hanya menerima pilihan valid `male` atau `female`.
10. Tanggal lahir kosong diterima.
11. Tanggal lahir masa depan ditolak.
12. Submit valid memanggil endpoint update profile.
13. Submit valid mengirim `name`, `email`, `gender`, dan `date_of_birth` sesuai kontrak backend.
14. Submit valid tidak mengirim `phone`.
15. Submit valid tidak mengirim `avatar`.
16. Response sukses diparse menjadi `CustomerAccount`.
17. Setelah sukses, `CustomerAuthAuthenticated.customer` berisi data baru.
18. Setelah sukses, local cached customer berisi data baru.
19. Setelah sukses, halaman `/profile` menampilkan nama/email terbaru pada summary card.
20. Setelah sukses, status card menghilangkan pesan email/gender/tanggal lahir yang sudah diisi.
21. Error 422 dari backend ditampilkan sebagai snackbar atau error form.
22. Error network/server ditampilkan tanpa keluar dari form.
23. Submit gagal tidak mengubah `CustomerAuthAuthenticated.customer`.
24. Submit gagal tidak menimpa local cached customer.
25. Tombol simpan tidak bisa ditekan berkali-kali saat loading.
26. Item `Edit Profil` tidak lagi disabled dan tidak menampilkan `Segera hadir`.
27. Tidak ada penggunaan update local-only sebagai sumber kebenaran.

## Catatan untuk Implementation Plan

- Default route yang dipakai: `/profile/edit`.
- Default endpoint yang direkomendasikan: `PATCH /auth/profile`, dipetakan ke base mobile customer API.
- Pertahankan `CustomerAuthCubit` sebagai tempat emit customer terbaru.
- Pola update bisa meniru `CustomerAuthCubit.setPassword()`:
  - simpan current authenticated state,
  - emit loading,
  - panggil usecase,
  - success emit `CustomerAuthAuthenticated(updatedCustomer)`,
  - failure emit error lalu kembalikan current state.
- Pastikan UI edit profile tidak kehilangan data form secara tidak perlu ketika state auth sempat loading.
- Jika memakai `CustomerAuthLoading` global saat submit, implementation plan harus memastikan screen edit tetap dapat menampilkan loading dan menangani success/error dengan stabil.
- Bila perlu state loading khusus update profile, tetap pastikan sumber customer final adalah `CustomerAuthAuthenticated.customer`.
- Backend sebaiknya memakai `CustomerAccountResource` untuk response supaya shape JSON tetap konsisten dengan login, register, `GET /auth/me`, dan set password.
- Validasi unique email harus mengabaikan customer authenticated sendiri agar customer bisa menyimpan email yang sama tanpa error palsu.
