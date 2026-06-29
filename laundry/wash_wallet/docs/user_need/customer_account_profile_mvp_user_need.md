# User Need: Halaman Akun Customer MVP

Tanggal: 2026-06-14

## Latar Belakang

Tab `Akun` pada aplikasi mobile customer sudah tersedia di bottom navigation dan mengarah ke route `/profile`, tetapi halaman yang ditampilkan saat ini masih placeholder `Halaman Akun (Segera Hadir)`. Customer yang sudah login belum memiliki satu tempat ringkas untuk melihat identitas akun, status profil, saldo deposit, shortcut fitur penting, aktivitas terbaru, dan aksi logout.

Dokumen ini menjadi acuan kebutuhan pengguna sebelum dibuat implementation plan untuk halaman Akun customer. Fokus MVP adalah read-only account/profile surface yang memakai data login yang sudah ada, bukan membangun domain profile baru.

## Tujuan

1. Mengganti placeholder `/profile` menjadi halaman Akun customer yang berguna untuk MVP.
2. Menampilkan identitas customer dan saldo deposit dari state autentikasi yang sudah tersedia.
3. Memberikan entry point cepat ke fitur customer yang route-nya sudah ada.
4. Menampilkan status akun/profil yang relevan tanpa mewajibkan backend profile baru.
5. Menyediakan recent activity sederhana dengan reuse data existing bila implementation plan memilihnya.
6. Menyediakan logout yang aman dengan confirmation dialog.
7. Menjadi brief yang jelas untuk AI model lain saat menyusun implementation plan.

## Current State Codebase

### Halaman Akun

- `apps/customer/lib/features/profile/presentation/screens/profile_screen.dart` masih berupa placeholder.
- Teks placeholder saat ini adalah `Halaman Akun (Segera Hadir)`.
- Belum ada kebutuhan untuk membuat `ProfileCubit`, `ProfileRepository`, atau endpoint profile baru untuk MVP read-only ini.

### Navigasi

- Bottom navigation di `MainNavigationScreen` sudah memiliki tab `Akun`.
- Tab `Akun` berada pada branch route `/profile`.
- Route `/profile` sudah terdaftar di `StatefulShellRoute.indexedStack`.
- Route pendukung yang sudah tersedia dan boleh dipakai sebagai shortcut/menu:
  - `/customer-addresses`
  - `/orders`
  - `/promos`
  - `/topup`
  - `/topup/create`
- Route lain yang belum tersedia tidak boleh dibuat seolah-olah sudah siap. Untuk MVP, item tersebut harus menjadi placeholder `Segera hadir`, disabled, atau tidak ditampilkan.

### Auth dan Data Customer

- App customer menyediakan `CustomerAuthCubit` sebagai global bloc.
- State login customer adalah `CustomerAuthAuthenticated`.
- Data customer yang sudah login tersedia lewat `CustomerAuthAuthenticated.customer`.
- `CustomerAuthCubit.logout()` sudah tersedia dan mengarah ke unauthenticated flow setelah logout.
- `CustomerAccount` sudah memiliki field yang cukup untuk tampilan Akun MVP:
  - `id`
  - `name`
  - `phone`
  - `email`
  - `gender`
  - `avatar`
  - `dateOfBirth`
  - `isVerified`
  - `isActive`
  - `lastLoginAt`
  - `fcmToken`
  - `depositBalance`
- `CustomerAccount` belum menyimpan status password yang reliable seperti `hasPassword`.
- `CustomerAuthOtpRequested.hasPassword` hanya tersedia pada flow request OTP, bukan sebagai properti customer yang persisten di halaman profile.

### Data Aktivitas Existing

- `HomeDashboardCubit` sudah tersedia secara global di app customer.
- `HomeDashboard` memiliki `recentOrders` dan customer data yang sudah dipakai di Home.
- Fitur topup memiliki `TopupCubit` dengan `history` dan route `/topup`.
- Recent activity pada halaman Akun boleh reuse `HomeDashboard.recentOrders` dan/atau topup history jika implementation plan memilih data existing tersebut.
- MVP tidak wajib membuat sumber transaksi gabungan baru untuk order + topup.

## Aktor

- Customer yang sudah login.
- Sistem mobile customer.

## Kebutuhan UX MVP

### 1. Header

- Halaman memakai header `Akun Saya`.
- Header harus terasa sebagai bagian dari tab utama, bukan flow detail.
- Header tidak perlu tombol back karena `/profile` adalah tab bottom navigation.
- Halaman harus nyaman untuk mobile viewport dan dapat discroll.

### 2. Closable Status Card

- Tampilkan status card di bagian atas konten setelah header jika ada kondisi akun yang perlu diberi perhatian.
- Status card harus bisa ditutup oleh customer.
- Setelah ditutup, card tidak muncul lagi selama condition signature belum berubah.
- Condition signature dapat disusun dari kondisi yang ditampilkan, misalnya `missing_email`, `missing_birthdate`, `not_verified`, atau kombinasi condition lain yang dipilih plan.
- Jika kondisi berubah, status card boleh muncul lagi karena pesan yang relevan sudah berbeda.
- Contoh kondisi yang boleh ditampilkan:
  - Email kosong.
  - Tanggal lahir kosong.
  - Gender kosong.
  - Akun belum terverifikasi jika `isVerified == false`.
  - Akun tidak aktif jika `isActive == false`.
- Jangan menampilkan banner `Belum membuat password` kecuali implementation plan menyediakan status password yang reliable. Saat ini `has_password` tidak tersimpan di `CustomerAccount`.

### 3. Profile Summary Card

- Tampilkan ringkasan profil customer.
- Konten minimal:
  - Avatar dari `customer.avatar` jika tersedia.
  - Initial avatar fallback dari `customer.name` jika avatar kosong.
  - Nama customer.
  - Nomor HP.
  - Badge status verifikasi dari `customer.isVerified`.
  - Email jika ada, atau label ringan seperti `Email belum ditambahkan`.
- Informasi opsional yang boleh ditampilkan jika desain membutuhkan:
  - Gender.
  - Tanggal lahir.
  - Status aktif.
- Edit profile penuh bukan bagian wajib MVP kecuali route/halaman edit sudah tersedia saat implementation plan dibuat.

### 4. Wallet atau Saldo Card

- Tampilkan saldo deposit utama dari `customer.depositBalance`.
- Label yang disarankan: `Saldo Deposit`.
- Format nominal menggunakan format Rupiah yang konsisten dengan UI existing.
- CTA utama:
  - `Topup` menuju `/topup/create`.
- CTA sekunder atau link:
  - `Riwayat` menuju `/topup`.
- Saldo utama untuk MVP bersumber dari `CustomerAuthAuthenticated.customer.depositBalance`.
- Jika implementation plan ingin melakukan refresh data saldo dari `HomeDashboardCubit`, itu boleh sebagai enhancement, tetapi halaman Akun MVP tidak boleh bergantung pada profile backend baru.

### 5. Quick Actions

- Tampilkan shortcut ringkas untuk pekerjaan yang sering dilakukan customer.
- Quick actions yang route-nya sudah ada:
  - `Alamat` menuju `/customer-addresses`.
  - `Pesanan` menuju `/orders`.
  - `Promo` menuju `/promos`.
  - `Topup` menuju `/topup/create` atau `/topup`, sesuai desain final.
- Setiap shortcut harus memakai navigasi ke route yang benar dan tidak menghasilkan broken navigation.
- Jika ada shortcut tambahan yang belum punya route/backend, tampilkan disabled/`Segera hadir` atau jangan tampilkan.

### 6. Recent Activity

- Tampilkan aktivitas terbaru secara ringan, maksimal 3-5 item.
- Sumber data yang boleh dipakai:
  - `HomeDashboard.recentOrders`.
  - `TopupCubit.history` jika implementation plan memilih reuse topup history.
- Jangan wajibkan agregator transaksi baru untuk MVP.
- Jika memakai order:
  - Tampilkan nomor/order identifier jika tersedia.
  - Tampilkan status order/payment secara singkat.
  - Tampilkan outlet atau ringkasan item jika data tersedia.
  - Tap item menuju detail order jika route detail tersedia, misalnya `/orders/:id`.
- Jika memakai topup:
  - Tampilkan nominal, status, dan tanggal jika tersedia.
  - Tap item menuju detail topup jika route detail tersedia, misalnya `/topup/:id`.
- Jika data kosong, tampilkan empty state ringan, bukan error besar.
- Jika data gagal dimuat, halaman Akun tetap harus dapat menampilkan identitas dan saldo dari auth state.

### 7. Menu Akun

- Tampilkan menu akun setelah quick actions/recent activity.
- Menu yang route-nya sudah tersedia:
  - `Alamat Saya` menuju `/customer-addresses`.
  - `Riwayat Pesanan` menuju `/orders`.
  - `Promo` menuju `/promos`.
  - `Saldo Deposit` menuju `/topup`.
- Menu yang belum punya route/backend penuh boleh ditampilkan sebagai disabled atau `Segera hadir`, misalnya:
  - `Edit Profil`
  - `Keamanan Akun`
  - `Notifikasi`
  - `Bantuan`
  - `Tentang Aplikasi`
- Jangan arahkan menu placeholder ke route palsu.
- Jika item disabled ditampilkan, tap dapat memunculkan snackbar `Segera hadir` atau tidak melakukan apa pun dengan affordance disabled yang jelas.

### 8. Logout

- Tombol logout wajib berada paling bawah konten halaman.
- Logout wajib memakai confirmation dialog.
- Dialog minimal memiliki aksi:
  - Cancel/batal: menutup dialog dan tidak mengubah auth state.
  - Confirm/keluar: memanggil `CustomerAuthCubit.logout()`.
- Saat logout loading, UI harus mencegah double tap jika memungkinkan.
- Setelah logout berhasil, app mengikuti unauthenticated flow yang sudah diatur oleh router/auth listener.

## Data Source MVP

1. Identitas customer utama bersumber dari `CustomerAuthCubit`.
2. Komponen halaman harus membaca customer dari state `CustomerAuthAuthenticated.customer`.
3. Saldo deposit utama bersumber dari `customer.depositBalance` di auth state.
4. Recent orders boleh bersumber dari `HomeDashboardCubit` yang sudah tersedia global.
5. Topup history boleh bersumber dari `TopupCubit` bila implementation plan memilih membuat provider di subtree `/profile`.
6. Tidak perlu `ProfileCubit` baru untuk MVP read-only.
7. Tidak perlu `ProfileRepository` baru untuk MVP read-only.
8. Tidak perlu endpoint backend profile baru untuk MVP read-only.
9. Jika data dashboard/topup belum loaded, halaman tetap render dengan data auth dan menampilkan loading/empty state ringan hanya pada section activity.

## Constraint Teknis

1. MVP harus menjaga scope read-only untuk profile.
2. Jangan membuat backend profile baru hanya untuk menampilkan data yang sudah ada di auth state.
3. Jangan menampilkan status password tanpa sumber data reliable.
4. Banner `Belum membuat password` hanya boleh masuk plan jika ada field persisten yang bisa dipercaya, misalnya `CustomerAccount.hasPassword` atau endpoint profile yang memang ditambahkan di luar scope MVP.
5. Jangan membuat navigasi rusak ke route yang belum ada.
6. Route yang sudah ada boleh dipakai langsung:
   - `/customer-addresses`
   - `/orders`
   - `/promos`
   - `/topup`
   - `/topup/create`
7. Logout harus memanggil `CustomerAuthCubit.logout()`, bukan membersihkan local storage langsung dari UI.
8. Gunakan komponen/design system existing seperti `AppLayout`, `AppHeader`, `AppCard`, `AppButton`, `AppBadge`, `AppSnackbar`, dan spacing/typography dari `wash_wallet_ui` bila sesuai pola file sekitar.
9. Jangan mengubah bottom navigation untuk kebutuhan MVP ini kecuali implementation plan menemukan bug yang langsung terkait.
10. Jangan mengubah struktur auth flow kecuali diperlukan untuk logout confirmation.

## Non-Goals MVP

- Edit profil penuh.
- Upload avatar.
- Ubah password atau security settings.
- Halaman bantuan lengkap.
- Halaman tentang aplikasi lengkap.
- Notification settings.
- Backend profile baru.
- Riwayat transaksi gabungan lintas order dan topup.
- Sinkronisasi saldo realtime.
- Menambahkan field `hasPassword` ke `CustomerAccount` hanya untuk banner MVP.

## Alur Pengguna

### Melihat Halaman Akun

1. Customer sudah login.
2. Customer tap tab `Akun`.
3. App membuka `/profile`.
4. Customer melihat header `Akun Saya`.
5. Customer melihat status card jika ada kondisi profil/akun yang relevan.
6. Customer melihat ringkasan profil dan saldo deposit.
7. Customer dapat memakai shortcut/menu untuk membuka alamat, pesanan, promo, atau topup.

### Menutup Status Card

1. Customer melihat status card.
2. Customer tap close.
3. Status card hilang.
4. Status card tidak muncul lagi selama condition signature sama.
5. Jika data customer berubah dan condition signature berubah, status card boleh muncul kembali.

### Membuka Shortcut

1. Customer tap shortcut atau menu.
2. Jika route tersedia, app membuka route tersebut.
3. Jika fitur belum tersedia, app menampilkan state disabled atau feedback `Segera hadir`.
4. Tidak ada tap yang mengarah ke route yang tidak terdaftar.

### Logout

1. Customer scroll ke bagian bawah halaman.
2. Customer tap `Keluar` atau `Logout`.
3. App menampilkan confirmation dialog.
4. Jika customer memilih batal, dialog ditutup dan user tetap authenticated.
5. Jika customer memilih keluar, UI memanggil `CustomerAuthCubit.logout()`.
6. Setelah logout selesai, app kembali ke unauthenticated flow sesuai router existing.

## Acceptance Criteria

1. Customer authenticated dapat membuka tab `Akun` dan melihat halaman `/profile` non-placeholder.
2. Header halaman menampilkan `Akun Saya`.
3. Nama customer ditampilkan dari `CustomerAuthAuthenticated.customer.name`.
4. Nomor HP ditampilkan dari `CustomerAuthAuthenticated.customer.phone`.
5. Badge verifikasi ditampilkan sesuai `CustomerAuthAuthenticated.customer.isVerified`.
6. Saldo deposit ditampilkan dari `CustomerAuthAuthenticated.customer.depositBalance`.
7. Customer dengan email kosong atau profil belum lengkap melihat status card yang relevan.
8. Status card bisa ditutup.
9. Status card yang sudah ditutup tidak muncul lagi selama condition signature belum berubah.
10. Shortcut/menu ke `/customer-addresses` membuka halaman alamat.
11. Shortcut/menu ke `/orders` membuka halaman pesanan.
12. Shortcut/menu ke `/promos` membuka halaman promo, meski halaman promo masih placeholder existing.
13. Shortcut/menu ke `/topup` atau `/topup/create` membuka flow topup yang sudah tersedia.
14. Recent activity menampilkan maksimal 3-5 item jika data tersedia.
15. Recent activity menampilkan empty state ringan jika data kosong.
16. Halaman tetap berguna walau data recent activity gagal dimuat.
17. Item menu yang belum punya route/backend tidak menyebabkan broken navigation.
18. Logout menampilkan confirmation dialog.
19. Logout cancel tidak mengubah auth state.
20. Logout confirm memanggil `CustomerAuthCubit.logout()`.
21. Setelah logout confirm berhasil, customer kembali ke unauthenticated flow.
22. Implementation plan tidak menambahkan `ProfileCubit` atau `ProfileRepository` baru untuk MVP read-only.
23. Implementation plan tidak mewajibkan backend profile baru untuk MVP read-only.
24. Banner `Belum membuat password` tidak ditampilkan tanpa sumber status password yang reliable.

## Test Plan

1. Customer authenticated melihat nama, nomor HP, badge verifikasi, dan saldo deposit sesuai auth state.
2. Customer dengan email kosong melihat status card profil belum lengkap.
3. Customer dengan `isVerified == false` melihat status verifikasi yang sesuai.
4. Customer dengan profil lengkap dan verified tidak melihat status card yang tidak relevan.
5. Status card bisa ditutup.
6. Status card yang ditutup tidak muncul lagi selama condition signature belum berubah.
7. Perubahan condition signature membuat status card boleh muncul kembali.
8. Shortcut alamat membuka `/customer-addresses`.
9. Shortcut pesanan membuka `/orders`.
10. Shortcut promo membuka `/promos`.
11. Shortcut topup membuka `/topup` atau `/topup/create` sesuai CTA.
12. Recent activity menampilkan maksimal 3-5 item.
13. Recent activity menampilkan empty state ringan saat data kosong.
14. Error loading recent activity tidak menghilangkan profile summary dan saldo dari auth state.
15. Menu placeholder disabled atau menampilkan `Segera hadir`, tanpa broken navigation.
16. Logout cancel menutup dialog dan tidak mengubah auth state.
17. Logout confirm memanggil `CustomerAuthCubit.logout()`.
18. Setelah logout confirm, app masuk unauthenticated flow.
19. Tidak ada `ProfileCubit` baru.
20. Tidak ada `ProfileRepository` baru.
21. Tidak ada backend profile baru yang diwajibkan untuk MVP read-only.

## Catatan untuk Implementation Plan

- Prioritaskan implementasi di `ProfileScreen` dan widget kecil lokal bila dibutuhkan.
- Gunakan `BlocBuilder<CustomerAuthCubit, CustomerAuthState>` atau pembacaan state auth yang konsisten dengan pola app.
- Jika state bukan `CustomerAuthAuthenticated`, tampilkan fallback ringan atau biarkan router unauthenticated flow mengambil alih.
- Untuk closable status card, plan dapat memakai state lokal di `ProfileScreen`; persistensi lintas app restart tidak wajib untuk MVP kecuali dipilih secara eksplisit.
- Jika ingin menyimpan dismissal lebih tahan lama, gunakan key yang bergantung pada condition signature agar card muncul lagi saat kondisi berubah.
- Recent activity tidak perlu sempurna sebagai ledger transaksi. Section ini cukup membantu customer melihat aktivitas paling baru dan punya link ke halaman detail/list.
- `isVerified` dipakai sebagai status verifikasi akun/nomor HP yang tersedia saat ini.
