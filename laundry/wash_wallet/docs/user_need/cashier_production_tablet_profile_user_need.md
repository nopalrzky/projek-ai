# User Need: Index Profile dan Edit Profile Tablet untuk Cashier dan Production App

Tanggal: 2026-06-29

Dokumen ini menjadi acuan user need untuk AI model lain saat menyusun implementation plan. Fokus kebutuhan adalah membuat halaman **Index Profile** dan **Edit Profile** untuk aplikasi Cashier dan Production, khusus pada pengalaman tablet setelah login. Dokumen ini tidak menentukan nama class final, struktur cubit final, nama endpoint final, atau detail implementasi teknis final.

## 1. Latar Belakang

Cashier App dan Production App sudah mulai memiliki pola tablet management layout dengan sidebar. Pada tampilan tablet, sidebar menampilkan identitas user dan beberapa menu navigasi. User menginginkan menu `Profil` di sidebar menjadi entry point yang jelas:

1. Saat `Profil` diklik, user diarahkan ke halaman index profile.
2. Halaman index profile menampilkan data profil employee yang sedang login.
3. Dari index profile, user dapat membuka edit profile.
4. Di edit profile, user dapat mengubah data dasar profil dan mengatur keamanan akun seperti password dan PIN.

Kebutuhan ini berlaku untuk dua aplikasi employee:

1. Cashier App.
2. Production App.

Target utama adalah tampilan tablet. Phone compact tidak menjadi fokus utama fitur ini dan tidak boleh rusak karena perubahan tablet.

## 2. Tujuan

1. Menyediakan halaman index profile untuk employee authenticated pada Cashier App dan Production App.
2. Menyediakan halaman edit profile yang dapat dibuka dari index profile.
3. Membuat menu `Profil` di sidebar tablet mengarah ke halaman profile yang benar, bukan placeholder atau screen setting umum.
4. Menampilkan data employee yang relevan dari auth state dan/atau endpoint profile.
5. Mengizinkan employee mengelola data dasar profil pribadi secara aman.
6. Mengizinkan employee mengelola password dari edit profile.
7. Mengizinkan employee setup atau reset PIN dari edit profile.
8. Menjaga profile sebagai fitur akun pribadi, bukan fitur RBAC outlet yang membutuhkan permission operasional.
9. Menjadi brief yang jelas untuk penyusun implementation plan frontend dan backend.

## 3. Aktor

1. `cashier employee`
   Employee yang login ke Cashier App dan menggunakan tablet.
2. `production employee`
   Employee produksi atau kurir yang login ke Production App dan menggunakan tablet.
3. `cashier app`
   Aplikasi yang menampilkan sidebar tablet, profile index, edit profile, dan security actions untuk kasir.
4. `production app`
   Aplikasi yang menampilkan sidebar tablet, profile index, edit profile, dan security actions untuk produksi/kurir.
5. `backend`
   Sistem yang menyimpan data employee, password, PIN hash, dan mengembalikan auth employee resource yang konsisten.
6. `owner`
   Pihak yang mengelola employee dari dashboard owner. Owner bukan aktor utama di fitur ini, tetapi tetap menjadi pihak pemulihan jika employee lupa password atau PIN.

## 4. Konteks Codebase Saat Ini

### 4.1 Shared Domain dan Auth Employee

Data employee authenticated memakai `AuthEmployee` di package domain. Field yang terbaca dan relevan:

1. `id`
2. `name`
3. `username`
4. `email`
5. `phone`
6. `outletId`
7. `accessibleOutlets`
8. `allPermissions`
9. `hasPin`

Response login/me backend memakai `LoginEmployeeResource`, yang juga mengirim field tambahan seperti `gender`, `address`, `startDate`, `cutoffDays`, `lastLoginAt`, `formattedGender`, dan status. Namun entity `AuthEmployee` saat ini belum menyimpan semua field tersebut.

### 4.2 Backend Employee Auth

Endpoint auth employee mobile yang sudah terlihat:

Cashier:

1. `POST /mobile/cashier/auth/login`
2. `POST /mobile/cashier/auth/logout`
3. `GET /mobile/cashier/auth/validate`
4. `GET /mobile/cashier/auth/me`
5. `POST /mobile/cashier/auth/pin/setup`
6. `POST /mobile/cashier/auth/pin/reset`
7. `POST /mobile/cashier/auth/pin/verify`

Production:

1. `POST /mobile/production/auth/login`
2. `POST /mobile/production/auth/logout`
3. `GET /mobile/production/auth/validate`
4. `GET /mobile/production/auth/me`
5. `POST /mobile/production/auth/pin/setup`
6. `POST /mobile/production/auth/pin/reset`
7. `POST /mobile/production/auth/pin/verify`

Backend sudah memiliki setup/reset PIN authenticated melalui `EmployeeAuthController`.

### 4.3 Gap Backend untuk Password dan Profile Pribadi

Belum terlihat endpoint mobile employee khusus untuk:

1. Update profile diri sendiri, misalnya `PATCH /mobile/{app}/auth/profile`.
2. Change password diri sendiri, misalnya `POST /mobile/{app}/auth/password`.

Endpoint employee umum di Cashier:

1. `GET /mobile/cashier/employees`
2. `GET /mobile/cashier/employees/{id}`
3. `PUT /mobile/cashier/employees/{id}`

Endpoint ini lebih dekat ke manajemen employee, bukan profile pribadi. Request update employee juga membutuhkan data HR seperti `startDate` dan `cutoffDays`, sehingga tidak ideal untuk edit profile pribadi sederhana.

### 4.4 Cashier App

Cashier App sudah memiliki:

1. Sidebar tablet melalui `MainShellScreen` dan `CashierNavigationConfig`.
2. Menu `Profil` di sidebar yang mengarah ke `/profile`.
3. Route `/profile` yang saat ini mengarah ke `ProfileSettingScreen`.
4. `ProfileSettingScreen` yang menampilkan form nama dan email, tetapi action save masih sebatas snackbar `Menyimpan perubahan...`.
5. Flow setup PIN dan reset PIN sudah tersedia di Settings:
   - `SetupPinScreen`
   - `ConfirmPinScreen`
   - `ResetPinVerifyScreen`
   - `ResetPinNewScreen`
6. `PinSecuritySettingScreen` masih berupa informasi PIN dan entry point setup PIN.
7. File `apps/cashier/lib/features/profile/presentation/index_profile_screen.dart` dan `edit_profile_screen.dart` sudah ada di worktree tetapi masih kosong saat dokumen ini dibuat.

Catatan: Cashier saat ini punya beberapa perubahan worktree terkait permission granular dan no-permission. Fitur profile ini harus menjaga agar profile tetap bisa diakses employee yang sudah boleh masuk app, tanpa tergantung permission operasional seperti order, finance, atau layanan laundry.

### 4.5 Production App

Production App sudah memiliki:

1. `ProductionTabletShell` untuk tablet.
2. `ProductionNavigationConfig` untuk sidebar tablet.
3. Sidebar tablet saat ini hanya berisi Dashboard, Produksi, dan Kurir sesuai permission.
4. Belum ada menu `Profil` di sidebar tablet.
5. Router production belum memiliki route `/profile` atau `/profile/edit`.
6. Production AuthCubit baru mendukung login, logout, refresh me, dan setup PIN.
7. Backend dan shared data layer sudah memiliki reset PIN, tetapi Production App belum terlihat memiliki UI reset PIN.
8. Bottom bar production mobile sudah memiliki label `Profil`, tetapi route map yang terbaca belum memetakan tab Profil ke route profile. Karena kebutuhan ini tablet-first, perbaikan mobile bottom bar dapat menjadi follow-up kecuali implementation plan memilih menyelaraskannya.

## 5. Masalah Saat Ini

1. Sidebar tablet Cashier memiliki item `Profil`, tetapi belum mengarah ke profile index yang lengkap.
2. Cashier profile saat ini lebih menyerupai edit form sederhana, belum ada halaman index profile yang read-only dan jelas.
3. Action simpan profile Cashier belum menyimpan data ke backend.
4. File profile index/edit Cashier sudah ada tetapi kosong.
5. Production tablet sidebar belum memiliki menu `Profil`.
6. Production belum memiliki halaman profile index atau edit profile.
7. Production belum memiliki UI untuk reset PIN dari profile/edit profile.
8. Belum ada kontrak backend mobile employee yang jelas untuk update profile pribadi dan change password pribadi.
9. Profile pribadi rawan tercampur dengan endpoint manajemen employee yang butuh field HR dan bisa berdampak ke data yang seharusnya dikelola owner.
10. Belum ada pola shared atau paralel yang konsisten antara Cashier dan Production untuk profile employee.

## 6. Scope Kebutuhan

### 6.1 In Scope

1. Menu `Profil` di sidebar tablet Cashier dan Production.
2. Route profile index untuk Cashier dan Production.
3. Route edit profile untuk Cashier dan Production.
4. Index profile read-only yang menampilkan ringkasan employee authenticated.
5. Edit profile untuk data pribadi yang aman diedit oleh employee sendiri.
6. Entry point setting password dari edit profile.
7. Entry point setting PIN atau atur ulang PIN dari edit profile.
8. Sinkronisasi auth state setelah profile/password/PIN berhasil diubah.
9. Backend contract untuk profile pribadi dan password pribadi bila belum tersedia.
10. Error handling dan feedback sukses/gagal yang jelas.
11. Test coverage untuk navigation, rendering profile, edit form, password action, dan PIN action.

### 6.2 Out of Scope

1. Redesign besar seluruh sidebar/tablet shell.
2. Mengubah permission production/courier/cashier.
3. Mengubah flow bisnis order, produksi, kurir, finance, atau cashier.
4. Membuat owner/admin profile.
5. Mengubah data HR yang harusnya dikelola owner, seperti posisi, gaji, komisi proses, status aktif, cutoff, dan start date.
6. Upload avatar jika belum tersedia backend yang jelas.
7. Recovery lupa password atau lupa PIN mandiri.
8. Mengubah mobile phone profile jika implementation plan memilih fokus tablet-only.
9. Menggunakan endpoint manajemen employee umum sebagai satu-satunya kontrak profile pribadi tanpa pembatasan yang jelas.

## 7. Prinsip Produk

1. Profile adalah fitur akun pribadi employee.
2. Profile harus selalu bisa diakses dari tablet sidebar oleh employee yang sudah authenticated dan boleh masuk app.
3. Profile tidak boleh membutuhkan permission operasional seperti `order.view`, `production.view`, atau `courier.view`.
4. Data yang ditampilkan harus berasal dari auth state atau endpoint authenticated yang benar.
5. Edit profile tidak boleh mengubah data HR atau data otorisasi employee.
6. Password dan PIN adalah fitur keamanan, sehingga flow harus memvalidasi input dengan jelas dan tidak membocorkan data sensitif.
7. Setelah update berhasil, UI harus langsung menampilkan data terbaru tanpa logout-login.
8. Cashier dan Production sebaiknya memakai pola UX yang sama agar employee tidak bingung saat berpindah app.

## 8. Kebutuhan UX Tablet Sidebar

### 8.1 Cashier App

Pada tablet, sidebar Cashier harus memiliki item `Profil`.

Perilaku:

1. Item `Profil` tampil sebagai menu akun pribadi.
2. Saat diklik, app membuka halaman profile index.
3. Selected state sidebar aktif saat route profile index atau edit profile sedang terbuka.
4. Item ini tetap tampil walaupun employee hanya memiliki akses cashier terbatas.
5. Item ini tidak boleh disembunyikan oleh filter permission operasional.

### 8.2 Production App

Pada tablet, sidebar Production harus menambahkan item `Profil`.

Perilaku:

1. Item `Profil` tampil untuk employee authenticated.
2. Item berada di section utama atau section akun, bukan di section Produksi/Kurir yang permission-gated.
3. Saat diklik, app membuka halaman profile index.
4. Selected state sidebar aktif saat route profile index atau edit profile sedang terbuka.
5. Item tetap tampil untuk employee dengan production-only, courier-only, atau kombinasi akses.

### 8.3 Compact Phone

Kebutuhan utama fitur ini tablet. Untuk phone compact:

1. Existing navigation tidak boleh rusak.
2. Implementation plan boleh memilih tidak mengubah phone behavior.
3. Jika route profile juga dipakai phone, UI harus tetap usable.
4. Production bottom bar `Profil` yang belum map ke route profile dapat dicatat sebagai follow-up atau diselaraskan jika plan memilihnya.

## 9. Kebutuhan Halaman Index Profile

Index profile adalah halaman read-only utama ketika user membuka `Profil`.

Konten minimal:

1. Header halaman: `Profil Saya`.
2. Avatar atau initial fallback.
3. Nama employee.
4. Username.
5. Email jika tersedia.
6. Nomor telepon jika tersedia.
7. Outlet aktif.
8. Daftar outlet/position yang dapat diakses jika data tersedia.
9. Badge status akun aktif.
10. Badge status PIN, misalnya `PIN aktif` atau `PIN belum dibuat`.
11. Ringkasan role/app access:
    - Cashier: label kasir atau outlet context.
    - Production: produksi, kurir, atau keduanya sesuai permission.
12. Tombol `Edit Profil`.
13. Tombol atau menu `Keluar` boleh tetap tersedia jika pola shell/profile membutuhkan.

Konten opsional:

1. Gender.
2. Alamat.
3. Tanggal mulai kerja.
4. Last login.
5. Informasi device/session jika tersedia.

Konten yang tidak boleh ditampilkan:

1. Password.
2. PIN.
3. `pin_hash`.
4. Token auth.
5. Data salary/payroll/commission yang bukan kebutuhan profile pribadi.

## 10. Kebutuhan Halaman Edit Profile

Edit profile adalah halaman untuk memperbarui data pribadi dan membuka security settings.

### 10.1 Entry Point

Edit profile dapat dibuka dari:

1. Tombol `Edit Profil` di index profile.
2. Optional action di profile header/card bila desain membutuhkan.

### 10.2 Form Data Pribadi

Field editable yang direkomendasikan:

1. Nama.
2. Email.
3. Nomor telepon.
4. Gender.
5. Alamat.

Field read-only yang boleh ditampilkan:

1. Username.
2. Outlet aktif.
3. Posisi atau daftar posisi.
4. Status aktif.
5. Tanggal mulai kerja.

Field di luar scope edit employee mandiri:

1. Position IDs.
2. Employee salaries.
3. Employee process commissions.
4. Cutoff days.
5. Status aktif.
6. Outlet assignment.
7. Password owner/admin.

### 10.3 Security Section

Edit profile harus menyediakan area keamanan akun.

Action yang dibutuhkan:

1. `Atur Password` atau `Ubah Password`.
2. `Setting PIN` jika employee belum punya PIN.
3. `Atur Ulang PIN` jika employee sudah punya PIN.

Password dan PIN boleh berupa section terpisah di edit profile, tab, drawer, dialog, atau route detail. Implementation plan menentukan UI final, tetapi user harus dapat mencapainya dari edit profile.

## 11. Kebutuhan Password

### 11.1 Alur Ubah/Atur Password

Employee harus dapat mengatur atau mengubah password login dari edit profile.

Perilaku yang diharapkan:

1. User membuka edit profile.
2. User memilih action password.
3. User mengisi password baru dan konfirmasi password.
4. Jika employee sudah memiliki password dan backend mensyaratkan password lama, user mengisi password saat ini.
5. App mengirim request ke backend authenticated.
6. Jika berhasil, user mendapat feedback sukses.
7. Session tetap authenticated.
8. Jika gagal, user mendapat error jelas dan data tidak berubah palsu.

### 11.2 Validasi Password

Validasi minimal:

1. Password baru wajib diisi.
2. Konfirmasi password wajib sama.
3. Panjang password mengikuti standar backend employee saat ini. Backend owner employee terlihat memakai minimal 8 karakter dan kombinasi huruf besar/huruf kecil. Implementation plan harus memastikan standar final konsisten.
4. Password tidak boleh tampil di log, snackbar, analytics, atau response.

### 11.3 Backend Password

Jika endpoint belum tersedia, backend perlu menyediakan endpoint authenticated khusus employee mobile.

Kontrak minimum:

1. Hanya employee authenticated yang bisa memanggil.
2. Request menerima `current_password` bila dibutuhkan.
3. Request menerima `password`.
4. Request menerima `password_confirmation`.
5. Backend menyimpan password dengan hashing.
6. Response tidak mengembalikan password.
7. Response boleh mengembalikan employee auth resource terbaru atau success message.

Endpoint ini sebaiknya tersedia untuk base Cashier dan Production, atau menjadi endpoint shared yang dipakai kedua app.

## 12. Kebutuhan PIN

PIN sudah menjadi bagian auth employee.

### 12.1 Employee Belum Punya PIN

Jika `hasPin == false`:

1. Edit profile menampilkan action `Setting PIN`.
2. Action membuka flow setup PIN.
3. User mengisi PIN baru.
4. User mengonfirmasi PIN baru.
5. Backend menyimpan PIN hash.
6. Response memperbarui employee auth resource.
7. Auth state berubah menjadi `hasPin=true`.

### 12.2 Employee Sudah Punya PIN

Jika `hasPin == true`:

1. Edit profile menampilkan action `Atur Ulang PIN`.
2. Action membuka flow reset PIN.
3. User mengisi PIN saat ini.
4. User mengisi PIN baru.
5. User mengonfirmasi PIN baru.
6. Backend memvalidasi PIN saat ini sebelum mengganti PIN.
7. Response memperbarui employee auth resource.
8. Auth state tetap authenticated dan `hasPin=true`.

### 12.3 Cashier dan Production

Cashier sudah memiliki UI setup/reset PIN yang dapat menjadi referensi.

Production perlu memiliki UI reset PIN atau reuse shared flow bila implementation plan memilihnya. Backend production route untuk reset PIN sudah tersedia.

## 13. Kebutuhan Data dan State

### 13.1 Source of Truth

Sumber data utama profile:

1. Auth state employee yang sedang authenticated.
2. `GET /auth/me` untuk refresh data terbaru.
3. Endpoint update profile pribadi jika ditambahkan.

Data setelah update harus sinkron ke:

1. Auth state aktif.
2. Local cached employee di auth datasource.
3. UI index profile.
4. Sidebar user account name jika nama berubah.

### 13.2 Field yang Perlu Dipertimbangkan di AuthEmployee

Jika index/edit profile membutuhkan field yang belum ada di `AuthEmployee`, implementation plan harus menentukan apakah:

1. Menambah field ke `AuthEmployee` dan `AuthEmployeeModel`.
2. Memakai entity profile/employee khusus untuk halaman profile.
3. Memanggil endpoint employee profile detail yang mengembalikan data lebih lengkap.

Yang penting: jangan membuat dua sumber data yang mudah stale tanpa strategi sinkronisasi.

## 14. Kebutuhan Backend/API

Backend yang dibutuhkan atau perlu diverifikasi:

1. `GET /mobile/cashier/auth/me` dan `GET /mobile/production/auth/me` tetap mengembalikan data employee terbaru.
2. Endpoint update profile pribadi employee.
3. Endpoint change/set password pribadi employee.
4. Endpoint setup/reset PIN sudah ada dan harus dipastikan response konsisten.

Rekomendasi kontrak profile pribadi:

```json
{
  "name": "Nama Employee",
  "email": "employee@example.com",
  "phone": "08123456789",
  "gender": "male",
  "address": "Alamat employee"
}
```

Response sukses ideal:

```json
{
  "employee": {
    "id": 1,
    "name": "Nama Employee",
    "username": "employee01",
    "email": "employee@example.com",
    "phone": "08123456789",
    "gender": "male",
    "address": "Alamat employee",
    "hasPin": true,
    "accessibleOutlets": [],
    "allPermissions": []
  }
}
```

Implementation plan boleh memilih response langsung berupa employee object atau dibungkus `employee`, selama data layer kedua app konsisten.

## 15. Error Handling

Error yang harus ditangani:

1. Auth token invalid atau expired.
2. Employee tidak aktif.
3. Profile gagal dimuat.
4. Nama kosong atau tidak valid.
5. Email tidak valid.
6. Email atau phone duplicate jika backend menerapkan unique.
7. Password lama salah.
8. Password baru tidak memenuhi aturan.
9. Konfirmasi password tidak cocok.
10. PIN saat ini salah.
11. PIN baru tidak valid.
12. Konfirmasi PIN tidak cocok.
13. Network error.
14. Server error.

UX error:

1. Error validasi field sebaiknya dekat field terkait jika memungkinkan.
2. Error umum boleh sebagai snackbar/dialog.
3. Form tidak boleh mengubah auth state jika request gagal.
4. Loading harus mencegah double submit.

## 16. Alur Pengguna

### 16.1 Membuka Profile di Cashier Tablet

1. Employee login ke Cashier App.
2. App masuk ke tablet shell.
3. Employee melihat menu `Profil` di sidebar.
4. Employee klik `Profil`.
5. App membuka index profile.
6. Employee melihat data akun dan status keamanan.

### 16.2 Membuka Profile di Production Tablet

1. Employee login ke Production App.
2. App masuk ke tablet shell.
3. Employee melihat menu `Profil` di sidebar.
4. Employee klik `Profil`.
5. App membuka index profile.
6. Employee melihat data akun, role produksi/kurir, dan status keamanan.

### 16.3 Edit Data Profile

1. Employee membuka index profile.
2. Employee klik `Edit Profil`.
3. App membuka edit profile.
4. Form tampil prefilled dari data employee saat ini.
5. Employee mengubah data.
6. Employee klik simpan.
7. App validasi input.
8. App mengirim request update ke backend.
9. Jika berhasil, auth state dan local cache diperbarui.
10. App kembali ke index profile atau tetap di edit dengan feedback sukses.
11. Sidebar dan index profile menampilkan nama terbaru jika nama berubah.

### 16.4 Setting atau Reset PIN

1. Employee membuka edit profile.
2. Employee memilih action PIN.
3. Jika belum punya PIN, user masuk setup PIN.
4. Jika sudah punya PIN, user masuk reset PIN.
5. Setelah sukses, `hasPin` di auth state diperbarui.
6. Edit profile/index profile menampilkan status PIN terbaru.

### 16.5 Mengubah Password

1. Employee membuka edit profile.
2. Employee memilih action password.
3. Employee mengisi form password.
4. App mengirim request authenticated.
5. Jika berhasil, employee tetap login dan mendapat feedback sukses.
6. Jika gagal, form tetap terbuka dan menampilkan error.

## 17. Acceptance Criteria

1. Pada tablet Cashier, sidebar memiliki menu `Profil`.
2. Pada tablet Cashier, klik `Profil` membuka index profile.
3. Pada tablet Production, sidebar memiliki menu `Profil`.
4. Pada tablet Production, klik `Profil` membuka index profile.
5. Index profile menampilkan nama employee authenticated.
6. Index profile menampilkan username employee authenticated.
7. Index profile menampilkan email dan phone jika tersedia.
8. Index profile menampilkan outlet aktif atau daftar outlet yang dapat diakses jika tersedia.
9. Index profile menampilkan status PIN berdasarkan `hasPin`.
10. Index profile menyediakan tombol `Edit Profil`.
11. Edit profile dapat dibuka dari index profile.
12. Edit profile form prefilled dari data employee saat ini.
13. Edit profile tidak menyediakan edit data HR seperti position, salary, commission, cutoff, dan active status.
14. Simpan profile valid mengirim request ke backend.
15. Simpan profile sukses memperbarui auth state.
16. Simpan profile sukses memperbarui local cached employee.
17. Setelah simpan sukses, index profile menampilkan data terbaru.
18. Setelah nama berubah, sidebar user account ikut menampilkan nama terbaru.
19. Submit profile gagal tidak mengubah auth state atau local cache.
20. Edit profile menyediakan action password.
21. Password baru harus dikonfirmasi.
22. Password berhasil diubah tanpa logout paksa.
23. Password gagal menampilkan error jelas.
24. Edit profile menyediakan action `Setting PIN` jika `hasPin=false`.
25. Edit profile menyediakan action `Atur Ulang PIN` jika `hasPin=true`.
26. Setup PIN sukses mengubah `hasPin` menjadi true.
27. Reset PIN sukses menjaga user tetap authenticated.
28. PIN lama salah tidak mengganti PIN.
29. PIN/password tidak pernah tampil di response UI, log, atau state publik.
30. Phone compact tidak rusak oleh fitur tablet profile.

## 18. Test Plan

### 18.1 Flutter Cashier

1. Navigation test menu sidebar `Profil` membuka route profile.
2. Widget test index profile menampilkan data dari Authenticated employee.
3. Widget test status PIN menampilkan kondisi `hasPin=false`.
4. Widget test status PIN menampilkan kondisi `hasPin=true`.
5. Widget test tombol `Edit Profil` membuka edit profile.
6. Widget test edit form prefilled dari auth employee.
7. Widget test submit valid memanggil update profile usecase/repository.
8. Widget test submit gagal menampilkan error dan tidak mengganti state.
9. Widget test action PIN memilih setup atau reset sesuai `hasPin`.
10. Widget test action password membuka form/flow password.

### 18.2 Flutter Production

1. Navigation test sidebar Production memiliki item `Profil`.
2. Navigation test menu `Profil` membuka route profile.
3. Widget test index profile menampilkan data employee.
4. Widget test edit profile dapat dibuka.
5. Widget test action PIN tersedia sesuai `hasPin`.
6. Widget test password action tersedia.
7. Permission test profile tetap tampil untuk production-only employee.
8. Permission test profile tetap tampil untuk courier-only employee.

### 18.3 Backend/API

1. `GET /mobile/cashier/auth/me` mengembalikan field profile yang dibutuhkan.
2. `GET /mobile/production/auth/me` mengembalikan field profile yang dibutuhkan.
3. Update profile pribadi menolak request unauthenticated.
4. Update profile pribadi hanya mengubah field yang diperbolehkan.
5. Update profile pribadi tidak mengubah position, salary, commission, cutoff, active status, atau outlet assignment.
6. Update profile sukses mengembalikan employee auth resource konsisten.
7. Change password menolak password lama salah jika current password diwajibkan.
8. Change password menolak konfirmasi tidak cocok.
9. Change password sukses mengubah hash password.
10. Response password tidak membocorkan password/hash.
11. Setup/reset PIN tetap tidak membocorkan `pin_hash`.
12. Reset PIN menolak `current_pin` salah.

## 19. Constraint Teknis

1. Jangan memakai endpoint manajemen employee umum tanpa membatasi field profile pribadi.
2. Jangan mengirim field HR dari edit profile pribadi.
3. Jangan menyimpan password atau PIN plain text.
4. Jangan membuat UI menganggap update berhasil sebelum backend sukses.
5. Jangan membuat source profile baru yang tidak sinkron dengan auth state.
6. Jangan menyembunyikan profile berdasarkan permission operasional.
7. Gunakan design system `wash_wallet_ui` dan pola tablet shell existing.
8. Pada tablet, profile harus berada di dalam shell/sidebar yang sama dengan screen operasional lain.
9. Pada compact phone, perubahan harus minimal dan tidak merusak navigation existing.
10. Jika AuthEmployee perlu field tambahan, update model/entity/cache secara konsisten.

## 20. Non-Goals

1. Lupa password mandiri.
2. Lupa PIN mandiri.
3. OTP recovery employee.
4. Owner reset PIN/password dari mobile app.
5. Upload avatar wajib.
6. Edit payroll/gaji/komisi.
7. Edit position/outlet assignment.
8. Mengubah login username/password utama selain fitur change password.
9. Membuat profile public.
10. Membuat settings app besar di luar profile/security.

## 21. Catatan untuk Implementation Plan

1. Tentukan apakah profile screen dibuat shared antar Cashier dan Production atau dibuat paralel dengan widget bersama.
2. Cashier sudah punya file kosong `features/profile/presentation/index_profile_screen.dart` dan `edit_profile_screen.dart`; plan bisa memakai file tersebut bila masih relevan.
3. Cashier `ProfileSettingScreen` saat ini bisa menjadi referensi awal, tetapi perlu dipisah menjadi index profile dan edit profile.
4. Production perlu route `/profile` dan `/profile/edit`.
5. Production sidebar perlu item `Profil` non-permission-gated.
6. Password membutuhkan kontrak backend baru jika belum tersedia.
7. PIN dapat reuse kontrak setup/reset yang sudah tersedia.
8. Pastikan update profile/password/PIN melakukan refresh atau emit auth employee terbaru.
9. Pastikan sidebar user account ikut re-render setelah nama berubah.
10. Jangan memasukkan data HR ke form edit profile pribadi.

## 22. Source Files Reviewed

File yang dibaca untuk menyusun user need:

1. `apps/cashier/lib/core/router/app_router.dart`
2. `apps/cashier/lib/core/navigation/main_shell_screen.dart`
3. `apps/cashier/lib/core/navigation/cashier_navigation_config.dart`
4. `apps/cashier/lib/features/setting/presentation/screens/profile_setting_screen.dart`
5. `apps/cashier/lib/features/setting/presentation/screens/index_setting_screen.dart`
6. `apps/cashier/lib/features/setting/presentation/screens/pin_security_setting_screen.dart`
7. `apps/cashier/lib/features/profile/presentation/index_profile_screen.dart`
8. `apps/cashier/lib/features/profile/presentation/edit_profile_screen.dart`
9. `apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart`
10. `apps/production/lib/core/widgets/production_tablet_shell.dart`
11. `apps/production/lib/core/navigation/production_navigation_config.dart`
12. `apps/production/lib/core/router/app_router.dart`
13. `apps/production/lib/core/utils/bottom_bar_items_builder.dart`
14. `apps/production/lib/features/auth/presentation/bloc/auth_cubit.dart`
15. `apps/production/lib/features/auth/presentation/bloc/auth_state.dart`
16. `packages/wash_wallet_domain/lib/src/entities/auth_employee.dart`
17. `packages/wash_wallet_domain/lib/src/repositories/auth_repository.dart`
18. `packages/wash_wallet_data/lib/src/auth/datasources/auth_remote_datasource.dart`
19. `packages/wash_wallet_data/lib/src/auth/repositories/auth_repository_impl.dart`
20. `apps/cashier/lib/features/employee/data/datasources/employee_remote_datasource.dart`
21. `apps/cashier/lib/features/employee/data/repositories/employee_repository_impl.dart`
22. `webapp/wash_wallet_be/routes/api_mobile_cashier.php`
23. `webapp/wash_wallet_be/routes/api_mobile_production.php`
24. `webapp/wash_wallet_be/app/Http/Controllers/Api/EmployeeAuthController.php`
25. `webapp/wash_wallet_be/app/Http/Controllers/Api/EmployeeController.php`
26. `webapp/wash_wallet_be/app/Http/Requests/Employee/UpdateEmployeeRequest.php`
27. `webapp/wash_wallet_be/app/Http/Resources/Employee/LoginEmployeeResource.php`
28. `webapp/wash_wallet_be/app/Http/Resources/Employee/EmployeeResource.php`
29. `docs/user_need/cashier_setting_pin_reset_user_need.md`
30. `docs/user_need/cashier_production_tablet_management_layout_user_need.md`

## Status

Draft user need selesai disusun untuk kebutuhan index profile dan edit profile tablet pada Cashier App dan Production App.
