# User Need: Seeder Akun Reviewer Google Play Store

Tanggal: 2026-06-25

## 1. Latar Belakang

WashWallet akan merilis aplikasi Android ke Google Play. Google Play App Review membutuhkan akses login yang stabil jika aplikasi memiliki fitur yang berada di balik autentikasi.

Berdasarkan pembacaan codebase saat ini, WashWallet memiliki tiga aplikasi mobile:

1. `apps/customer`
   Aplikasi customer untuk discovery outlet, alamat, order, topup, profile, dan histori order.
2. `apps/cashier`
   Aplikasi employee/kasir untuk dashboard, order, customer, layanan, finance, print, dan setting outlet.
3. `apps/production`
   Aplikasi employee produksi dan kurir untuk order produksi, proses item order, pickup schedule, dan workflow kurir.

Ketiga aplikasi memiliki fitur utama yang membutuhkan autentikasi:

1. Customer app menggunakan `customer_accounts` dan guard `customer_sanctum`.
2. Cashier app menggunakan `employees`, token Sanctum, posisi aktif, permission posisi, dan PIN cashier.
3. Production app menggunakan `employees`, token Sanctum, posisi aktif, permission posisi produksi/kurir, dan akses outlet.

Dokumen ini menjadi acuan user need untuk AI model lain saat menyusun implementation plan pembuatan seeder akun reviewer Google Play. Dokumen ini tidak berisi detail final implementasi kode, tetapi harus cukup jelas untuk menentukan data, akses, keamanan, risiko, dan acceptance criteria.

## 2. Tujuan

1. Menyediakan akun reviewer Google Play yang dapat dipakai setiap proses review dan update aplikasi.
2. Memastikan reviewer dapat login di production environment tanpa registrasi, OTP wajib, 2FA, biometrik, QR code, lokasi tertentu, membership, atau mekanisme lain yang menghambat akses.
3. Memberikan akses ke fitur utama Customer, Cashier, Production, dan Courier tanpa memakai data pelanggan asli.
4. Menyediakan data demo yang cukup agar reviewer langsung dapat menguji fitur utama setelah login.
5. Membuat akun dan data reviewer stabil, idempotent, tidak kedaluwarsa, tidak berubah tiap release, tidak terkunci, dan tidak terhapus oleh seeder umum.
6. Menyiapkan informasi yang harus diisi di Google Play Console bagian `Add Sign-in Details`.

## 3. Ringkasan Kondisi Codebase Saat Ini

### 3.1 Customer App

Customer app memiliki onboarding/welcome screen, tetapi fitur utama diarahkan oleh state autentikasi.

Kondisi auth saat ini:

1. Login utama meminta nomor WhatsApp dan OTP.
2. Backend customer auth memiliki endpoint `login-password`.
3. UI password login tersedia di route `/login-password`.
4. Di alur UI saat ini, tombol `Masuk dengan Password` baru muncul setelah user meminta OTP dan backend mengembalikan `has_password`.
5. Customer account tersimpan di tabel `customer_accounts`, bukan tabel `users`.
6. Customer data outlet lokal tersimpan di tabel `customers` dan dapat dikaitkan ke `customer_account_id`.

Implikasi untuk Google Play:

1. Reviewer customer harus memiliki `customer_accounts` aktif, verified, dan punya password.
2. Reviewer tidak boleh diwajibkan menerima OTP WhatsApp.
3. Jika UI belum menyediakan tombol password login langsung dari welcome/login, instruksi Play Console harus menjelaskan cara masuk ke password login, atau implementasi perlu membuat jalur password login yang lebih jelas.

### 3.2 Cashier App

Cashier app menggunakan akun `employees` dengan username/password.

Kondisi auth dan akses saat ini:

1. Login menggunakan `username` dan `password`.
2. Setelah login, app mengecek `hasOrderViewPermission`.
3. Jika employee tidak punya `order.view`, app masuk state `AuthAccessDenied`.
4. Jika employee belum punya PIN, app masuk state `AuthSetupPinRequired`.
5. Jika session cashier stale setelah beberapa waktu, app meminta PIN untuk re-auth.
6. Permission diambil dari posisi aktif employee melalui `positions`, `employee_positions`, dan `position_permissions`.

Implikasi untuk Google Play:

1. Employee reviewer untuk Cashier wajib punya permission kasir minimal `order.view`, dan sebaiknya punya seluruh permission kasir demo.
2. Employee reviewer wajib punya PIN statis yang sudah diset dari seeder agar tidak terjebak setup PIN.
3. Play Console harus mencantumkan PIN jika reviewer mungkin melihat layar re-auth PIN.

### 3.3 Production App

Production app menggunakan akun `employees` yang sama dengan model auth Cashier.

Kondisi auth dan akses saat ini:

1. Login menggunakan `username` dan `password`.
2. Akses app membutuhkan permission produksi atau kurir.
3. Area produksi memakai permission seperti `production.view` dan `production.manage`.
4. Area kurir memakai permission seperti `courier.view` dan `courier.manage`.
5. Production app menggunakan `accessibleOutlets` untuk akses multi-outlet, terutama area kurir.
6. Jika employee tidak punya permission produksi maupun kurir, app menampilkan no-permission.

Implikasi untuk Google Play:

1. Employee reviewer yang sama dapat dipakai untuk Cashier dan Production selama memiliki posisi aktif `kasir`, `produksi`, dan `kurir`.
2. Employee reviewer harus punya akses ke demo outlet dan permission produksi serta kurir agar reviewer bisa membuka semua area utama Production app.

### 3.4 Seeder Reviewer Saat Ini

Codebase sudah memiliki `webapp/wash_wallet_be/database/seeders/ReviewerSeeder.php`, tetapi kebutuhan baru tidak boleh langsung menganggap file tersebut cukup.

Masalah yang perlu diperbaiki atau diganti:

1. Seeder tersebut belum dipanggil oleh `DatabaseSeeder`.
2. Seeder customer lama membuat `User` dan `Customer`, padahal auth customer app memakai `CustomerAccount`.
3. Seeder mengambil `Outlet::first()` sehingga berisiko memakai data outlet nyata atau outlet dari seeder lain.
4. Seeder belum membuat posisi, permission, PIN employee, data demo outlet, layanan, order, customer address, courier settings, atau order progress.
5. Seeder belum memastikan data reviewer terisolasi dari data produksi.

## 4. Aktor

1. `Google Play reviewer`
   Pihak eksternal dari Google yang perlu login dan meninjau app.
2. `customer reviewer account`
   Akun customer dummy untuk aplikasi Customer.
3. `employee reviewer account`
   Akun employee dummy untuk aplikasi Cashier dan Production.
4. `system`
   Backend dan mobile app yang memvalidasi login, permission, outlet, PIN, dan data demo.
5. `developer/admin`
   Pihak internal yang menjalankan seeder dan mengisi Google Play Console.

## 5. Scope Kebutuhan

Scope utama:

1. User need untuk seeder akun reviewer Google Play.
2. Satu tenant demo yang terisolasi untuk reviewer.
3. Satu akun customer reviewer untuk Customer app.
4. Satu akun employee reviewer untuk Cashier dan Production app.
5. Data demo yang cukup untuk fitur utama.
6. Persyaratan credential statis dan production-safe.
7. Isi formulir Google Play Console `Add Sign-in Details`.
8. Risiko akses yang dapat membuat reviewer gagal login atau gagal meninjau fitur.

Di luar scope dokumen ini:

1. Implementasi kode seeder final.
2. Perubahan UI detail untuk login password customer, kecuali sebagai kebutuhan/risiko.
3. Perubahan policy Google Play selain Sign-in Details.
4. Pembuatan akun Google Play Console.
5. Pembuatan credential rahasia asli di dokumen repository.

## 6. Strategi Akun Reviewer

### 6.1 Satu Tenant Demo

Sistem harus menyediakan satu tenant demo khusus reviewer.

Tenant demo minimal berisi:

1. Owner demo.
2. Outlet demo aktif.
3. Posisi default aktif pada outlet demo.
4. Employee reviewer yang punya semua posisi utama.
5. Customer reviewer yang punya profile, alamat, saldo deposit, dan histori order demo.
6. Data operasional dummy yang hanya berada di outlet demo.

Tenant demo tidak boleh mengambil outlet pertama yang ada di database. Seeder harus mencari berdasarkan identifier stabil, misalnya:

1. Owner email: `googleplay.owner@washwallet.test`
2. Outlet code: `GPREVIEW`
3. Employee username: `googleplay.reviewer`
4. Customer phone: `081100009001`

Identifier final dapat berbeda, tetapi harus stabil dan terdokumentasi.

### 6.2 Akun Employee Reviewer

Akun employee reviewer dipakai untuk:

1. WashWallet Cashier.
2. WashWallet Production.

Role/posisi yang dibutuhkan:

1. `kasir`
2. `produksi`
3. `kurir`

Permission yang dibutuhkan minimal:

1. `order.create`
2. `order.view`
3. `order.manage`
4. `payment.manage`
5. `customer.view`
6. `customer.manage`
7. `service.view`
8. `service.manage`
9. `production.view`
10. `production.manage`
11. `courier.view`
12. `courier.manage`

Kebutuhan akun:

1. `is_active = true`.
2. Memiliki `outlet_id` demo outlet.
3. Memiliki assignment aktif di `employee_positions`.
4. Posisi yang diberikan harus aktif dan berada pada outlet demo.
5. Memiliki `pin_hash` yang valid untuk PIN statis.
6. Tidak bergantung pada proses reset password, OTP, QR code, atau approval owner.

Rekomendasi credential:

1. Username: `googleplay.reviewer`
2. Password: berasal dari environment production, misalnya `GOOGLE_PLAY_REVIEWER_PASSWORD`
3. PIN: `112233`

Password dan PIN di atas adalah rekomendasi identifier/dummy untuk kebutuhan dokumentasi. Nilai final boleh diganti, tetapi harus statis dan sama dengan yang diisi di Google Play Console.

### 6.3 Akun Customer Reviewer

Akun customer reviewer dipakai untuk WashWallet Customer.

Kebutuhan akun:

1. Dibuat di tabel `customer_accounts`.
2. `is_verified = true`.
3. `is_active = true`.
4. Memiliki `password`.
5. Memiliki `deposit_balance` dummy agar fitur pembayaran/topup/wallet bisa ditinjau.
6. Memiliki minimal satu `customer_addresses` primary.
7. Memiliki relasi `customers` ke outlet demo jika dibutuhkan fitur order/history/outlet.
8. Memiliki minimal beberapa order demo dengan `customer_account_id` akun reviewer.

Rekomendasi credential:

1. Phone number: `081100009001`
2. Email: `googleplay.customer@washwallet.test`
3. Password: berasal dari environment production, misalnya `GOOGLE_PLAY_REVIEWER_PASSWORD`

Customer reviewer tidak boleh diwajibkan:

1. Mendaftar sendiri.
2. Meminta OTP WhatsApp.
3. Menghubungi developer.
4. Memiliki membership aktif agar bisa membuka fitur dasar.
5. Berada di lokasi GPS tertentu.

## 7. Data Demo yang Dibutuhkan

Seeder reviewer harus membuat data dummy yang cukup agar reviewer bisa langsung menilai fitur utama.

### 7.1 Owner dan Outlet Demo

Data demo minimal:

1. Owner aktif dengan role owner.
2. Outlet aktif dengan code stabil, misalnya `GPREVIEW`.
3. Nama outlet yang jelas, misalnya `WashWallet Demo Outlet - Google Play Review`.
4. Alamat dummy lengkap.
5. Latitude/longitude dummy yang valid.
6. Phone dan email dummy.
7. Timezone `Asia/Jakarta`.
8. Operational days aktif setiap hari atau minimal hari kerja dengan jam buka yang luas.
9. Account/COA outlet yang dibutuhkan dashboard dan finance.

Outlet demo harus terlihat di Customer app discovery dan dapat dibuka detailnya.

### 7.2 Posisi dan Permission

Seeder harus membuat atau memastikan posisi default pada outlet demo:

1. `Kasir` dengan slug `kasir`.
2. `Produksi` dengan slug `produksi`.
3. `Kurir` dengan slug `kurir`.

Seeder harus memastikan permission sesuai enum permission saat ini. Jika posisi sudah ada, permission harus disinkronkan secara idempotent tanpa menghapus konfigurasi lain di outlet non-demo.

### 7.3 Layanan Laundry

Data demo minimal:

1. Unit seperti `kg`, `pcs`, atau unit lain yang sudah didukung sistem.
2. Kategori aktif seperti `Pakaian`, `Sepatu`, dan `Karpet`.
3. Laundry services aktif dengan harga, minimum quantity, durasi, slug, dan `supports_courier` yang realistis.
4. Beberapa service harus mendukung pickup/courier agar customer dan courier flow bisa ditinjau.
5. Laundry service process untuk production flow, jika fitur process membutuhkan relasi tersebut.

### 7.4 Customer dan Alamat

Data demo minimal:

1. Customer reviewer profile.
2. Minimal dua customer outlet dummy untuk Cashier app.
3. Minimal satu primary address untuk customer reviewer.
4. Alamat harus valid secara format dan tidak berisi data pelanggan nyata.

### 7.5 Order Demo

Seeder harus membuat order demo pada outlet demo dengan beberapa status utama.

Status yang disarankan:

1. `requested` atau `pending_dropoff` untuk order baru dari customer.
2. `accepted` atau `picking_up` untuk kurir.
3. `received` atau `weighing` untuk kasir.
4. `ready_to_process` untuk queue produksi.
5. `in_progress` untuk proses produksi berjalan.
6. `ready` untuk order siap diambil/diantar.
7. `delivering` atau `delivered` untuk kurir delivery.
8. `completed` untuk histori selesai.
9. `cancelled` atau `rejected` secukupnya untuk empty/risk state.

Setiap order demo harus:

1. Memiliki `outlet_id` demo outlet.
2. Memiliki `customer_account_id` customer reviewer jika ingin tampil di Customer app.
3. Memiliki `customer_id` customer demo yang benar.
4. Memiliki `employee_id` employee reviewer atau employee dummy demo.
5. Memiliki order item dengan snapshot kategori, layanan, unit, quantity, dan price.
6. Memiliki payment status yang bervariasi, misalnya `unpaid`, `partial`, dan `paid`.
7. Memakai nomor order stabil atau pattern yang tidak bentrok.

### 7.6 Courier Demo

Data demo untuk courier minimal:

1. Courier setting untuk outlet demo.
2. Courier schedule aktif.
3. Order pickup/delivery yang dapat dilihat oleh employee reviewer dengan permission kurir.
4. Pickup address dan delivery address dummy.
5. Fee dummy jika fitur perhitungan ongkir membutuhkan data.

### 7.7 Finance dan Wallet Demo

Data demo minimal:

1. Cash account outlet agar dashboard Cashier tidak kosong/error.
2. Deposit balance customer reviewer.
3. Payment account atau account role yang dibutuhkan fitur deposit, petty cash, expense, dan payment summary.
4. Beberapa payment status order agar reviewer dapat melihat kondisi belum bayar, sebagian bayar, dan lunas.

## 8. Aturan Keamanan dan Isolasi Data

### 8.1 Tidak Mengakses Data Produksi Nyata

Akun reviewer tidak boleh diberi akses ke outlet, order, customer, employee, atau data keuangan nyata.

Kebutuhan:

1. Employee reviewer hanya memiliki posisi pada outlet demo.
2. Customer reviewer hanya memiliki order dan alamat dummy.
3. Query list di app harus secara efektif membatasi data berdasarkan outlet demo atau customer account reviewer.
4. Seeder tidak boleh memakai `Outlet::first()` atau data random dari database production.
5. Semua data demo harus dapat diidentifikasi dengan prefix/kode khusus, misalnya `GPREVIEW`.

### 8.2 Credential Tidak Dihardcode di Mobile App

Credential reviewer tidak boleh disimpan di source code mobile app.

Kebutuhan:

1. Password dibuat oleh backend seeder dari environment variable atau secret production.
2. PIN boleh diset oleh seeder backend sebagai hash.
3. Dokumen internal boleh menyebut placeholder credential, tetapi nilai rahasia final hanya di secret management dan Google Play Console.
4. App mobile tidak boleh memiliki backdoor login yang menerima credential khusus tanpa backend auth.

### 8.3 Akun Tidak Boleh Kedaluwarsa atau Terkunci

Kebutuhan:

1. Akun reviewer selalu `active`.
2. Password tidak dirotasi otomatis.
3. Token boleh kedaluwarsa, tetapi reviewer harus bisa login ulang dengan credential yang sama.
4. Akun tidak boleh ikut cleanup data trial, cleanup inactive user, atau reset seeder non-demo.
5. Jika rate limiter dapat terkunci karena percobaan login salah, tim harus dapat clear rate limit reviewer atau memberikan cooldown yang wajar.

### 8.4 Production Environment

Google Play reviewer harus dapat login di build yang terhubung ke production backend.

Kebutuhan:

1. Seeder reviewer dijalankan di production database.
2. Credential di Google Play Console harus cocok dengan production.
3. Data demo berada di production environment, tetapi terisolasi.
4. Jangan memberikan credential staging jika app release memakai production API.

## 9. Google Play Console - Add Sign-in Details

Bagian ini harus menjadi sumber pengisian Play Console.

### 9.1 WashWallet Customer

Name:

```text
Google Play Reviewer - WashWallet Customer
```

Username / Email / Phone Number:

```text
081100009001
```

Password:

```text
<isi dengan nilai GOOGLE_PLAY_REVIEWER_PASSWORD production>
```

Any other information required to access the app:

```text
Gunakan nomor WhatsApp 081100009001 dan password reviewer yang tertera.
Jika aplikasi menampilkan layar OTP terlebih dahulu, masukkan nomor tersebut, lanjutkan sampai layar OTP, lalu pilih "Masuk dengan Password" dan masukkan password. Akun ini sudah terverifikasi, aktif, dan tidak perlu registrasi atau OTP untuk akses password login.
```

Catatan kebutuhan:

1. Jalur password login sebaiknya dibuat mudah ditemukan dari layar login/welcome.
2. Jika tidak diperbaiki, instruksi di atas wajib dicantumkan agar reviewer tidak berhenti di layar OTP.

### 9.2 WashWallet Cashier

Name:

```text
Google Play Reviewer - WashWallet Cashier
```

Username / Email / Phone Number:

```text
googleplay.reviewer
```

Password:

```text
<isi dengan nilai GOOGLE_PLAY_REVIEWER_PASSWORD production>
```

Any other information required to access the app:

```text
Gunakan username googleplay.reviewer dan password reviewer yang tertera. Jika diminta PIN untuk verifikasi sesi, gunakan PIN 112233. Akun ini berada di outlet demo Google Play Review dan memiliki akses kasir untuk order, customer, layanan, pembayaran, dan finance demo.
```

### 9.3 WashWallet Production

Name:

```text
Google Play Reviewer - WashWallet Production
```

Username / Email / Phone Number:

```text
googleplay.reviewer
```

Password:

```text
<isi dengan nilai GOOGLE_PLAY_REVIEWER_PASSWORD production>
```

Any other information required to access the app:

```text
Gunakan username googleplay.reviewer dan password reviewer yang tertera. Akun ini memiliki akses Produksi dan Kurir pada outlet demo Google Play Review. Jika diminta PIN pada layar employee/session, gunakan PIN 112233.
```

## 10. Kebutuhan Fungsional

### FR-01 Seeder Membuat Tenant Demo Terisolasi

Seeder harus membuat tenant demo khusus reviewer dengan owner, outlet, posisi, permission, employee, customer account, alamat, layanan, dan order dummy.

Seeder tidak boleh memakai outlet atau data customer nyata.

### FR-02 Seeder Idempotent

Seeder harus dapat dijalankan berkali-kali tanpa membuat duplikasi data utama.

Data yang harus stabil:

1. Owner reviewer.
2. Outlet reviewer.
3. Employee reviewer.
4. Customer reviewer.
5. Posisi default outlet demo.
6. Data demo yang memiliki unique key atau kode stabil.

Jika ada data demo yang dapat berubah, perubahan harus terbatas pada outlet demo.

### FR-03 Customer Reviewer Bisa Login Tanpa OTP Wajib

Customer reviewer harus bisa masuk menggunakan phone/password.

Jika UI saat ini tetap meminta OTP sebelum tombol password terlihat, plan implementasi harus memilih salah satu:

1. Menambahkan entry point password login yang jelas dari welcome/login screen.
2. Atau menyertakan instruksi Play Console yang eksplisit dan sudah diverifikasi end-to-end.

Preferensi kebutuhan adalah opsi pertama karena lebih aman untuk review.

### FR-04 Employee Reviewer Bisa Login ke Cashier

Employee reviewer harus berhasil login ke Cashier app dengan username/password.

Setelah login:

1. App tidak boleh masuk `AuthAccessDenied`.
2. App tidak boleh meminta setup PIN.
3. Dashboard cashier dapat tampil.
4. Menu order, customer, service, finance/payment, dan setting dapat dibuka dengan data demo.

### FR-05 Employee Reviewer Bisa Login ke Production

Employee reviewer harus berhasil login ke Production app dengan username/password.

Setelah login:

1. App tidak boleh masuk no-permission.
2. Area produksi dapat dibuka.
3. Area kurir dapat dibuka.
4. Order produksi dan schedule/order kurir demo dapat dilihat.

### FR-06 PIN Reviewer Sudah Disiapkan

Seeder harus mengisi `pin_hash` employee reviewer.

PIN statis harus terdokumentasi di Play Console jika app dapat meminta re-auth PIN.

Jika ada mekanisme re-auth, PIN harus tetap valid setelah update aplikasi.

### FR-07 Data Demo Menampilkan Fitur Utama

Setelah login, reviewer tidak boleh melihat layar kosong untuk fitur utama karena data demo belum tersedia.

Minimal fitur yang harus punya data:

1. Customer home/discovery/outlet detail.
2. Customer order history dan order detail.
3. Customer address/profile.
4. Cashier dashboard.
5. Cashier order list dan detail.
6. Cashier customer list.
7. Cashier service/laundry service list.
8. Cashier finance/payment summary yang aman.
9. Production order queue.
10. Production order item/process detail.
11. Courier schedule/order list.

### FR-08 Akun Reviewer Tidak Boleh Mengakses Data Nyata

Semua akses reviewer harus terbatas pada outlet demo dan customer account demo.

Jika ada endpoint yang masih bisa mengembalikan data lintas outlet atau lintas customer, plan implementasi harus memasukkan perbaikan authorization atau filter.

### FR-09 Seeder Bisa Dijalankan Secara Terkontrol di Production

Implementasi harus menentukan cara menjalankan seeder di production tanpa menjalankan ulang seeder sample besar yang dapat membuat data acak.

Contoh kebutuhan:

1. Seeder reviewer bisa dipanggil langsung dengan `php artisan db:seed --class=GooglePlayReviewerSeeder`.
2. `DatabaseSeeder` boleh memanggilnya hanya jika strategi deployment mengizinkan.
3. Seeder harus aman terhadap data production dan tidak destructive.

## 11. Kebutuhan Non-Fungsional

1. Credential reviewer harus stabil antar release.
2. Password tidak boleh ditulis di repository dalam bentuk plain text final.
3. Seeder harus mudah diaudit.
4. Semua data demo harus jelas sebagai data dummy.
5. Tidak boleh ada data pribadi pelanggan nyata di akun reviewer.
6. Akun reviewer harus tetap aktif meskipun fitur trial/subscription/membership berubah.
7. Reviewer tidak boleh perlu mengaktifkan lokasi untuk login.
8. Reviewer tidak boleh perlu scan QR atau memakai perangkat khusus.
9. Reviewer tidak boleh perlu permission kamera, file, bluetooth, printer, atau notifikasi untuk sekadar masuk dan meninjau fitur utama.
10. Jika fitur tertentu membutuhkan hardware eksternal, app harus tetap memungkinkan reviewer melihat screen dan state dasar tanpa hardware tersebut.

## 12. Risiko dan Rekomendasi

### Risiko 1: Customer Reviewer Terjebak OTP

Kondisi:

Customer app saat ini menampilkan login nomor WhatsApp dan OTP sebagai jalur utama. Tombol password login muncul setelah OTP request jika backend mengembalikan `has_password`.

Risiko:

Google Play reviewer bisa berhenti karena tidak menerima OTP WhatsApp.

Rekomendasi:

1. Tambahkan jalur `Masuk dengan Password` yang terlihat dari layar welcome/login.
2. Tetap isi instruksi Play Console yang menjelaskan jalur password login.
3. Pastikan customer reviewer punya password dan `is_verified=true`.

### Risiko 2: Cashier Reviewer Diminta Setup PIN

Kondisi:

Cashier app mengarahkan employee tanpa PIN ke setup PIN.

Risiko:

Reviewer gagal masuk karena harus membuat PIN baru atau bingung dengan flow PIN.

Rekomendasi:

1. Seeder harus mengisi `pin_hash`.
2. Play Console harus menyebut PIN `112233`.
3. Jangan menghapus PIN reviewer saat reset seeder.

### Risiko 3: Cashier Access Denied Karena Permission Tidak Lengkap

Kondisi:

Cashier app butuh `order.view`.

Risiko:

Employee reviewer login berhasil tetapi masuk halaman access denied.

Rekomendasi:

1. Assign posisi `kasir` aktif.
2. Pastikan posisi punya permission default kasir.
3. Tambahkan test login dan `GET /mobile/cashier/auth/me`.

### Risiko 4: Production No-Permission Karena Tidak Ada Permission Produksi/Kurir

Kondisi:

Production app hanya bisa dipakai jika employee memiliki access produksi atau kurir.

Risiko:

Reviewer tidak dapat membuka area utama Production app.

Rekomendasi:

1. Assign posisi `produksi` dan `kurir` aktif pada outlet demo.
2. Pastikan `production.view`, `production.manage`, `courier.view`, dan `courier.manage` tersedia.
3. Pastikan `accessibleOutlets` memuat outlet demo.

### Risiko 5: Seeder Mengambil Outlet Production Nyata

Kondisi:

Seeder lama memakai `Outlet::first()`.

Risiko:

Reviewer melihat data outlet/customer/order nyata.

Rekomendasi:

1. Buat outlet demo dengan code unik.
2. Semua data reviewer harus dibuat atau dicari berdasarkan identifier demo.
3. Jangan memakai record random atau first record.

### Risiko 6: Data Demo Kosong atau Tidak Konsisten

Kondisi:

Jika hanya akun dibuat tanpa order/layanan/customer, reviewer bisa login tetapi tidak bisa meninjau fitur.

Risiko:

Review gagal karena app tampak kosong atau error saat membuka fitur utama.

Rekomendasi:

1. Seed layanan, customer, order, order item, courier schedule, dan payment state dummy.
2. Buat order pada beberapa status utama.
3. Jalankan smoke test tiap app setelah seeder.

### Risiko 7: Credential Berubah Tiap Deploy

Kondisi:

Jika password dibuat random saat seeder berjalan, credential di Play Console menjadi tidak valid.

Risiko:

Review update aplikasi gagal.

Rekomendasi:

1. Password final berasal dari env/secret stabil.
2. Seeder tidak mereset password kecuali explicit flag atau value env sama.
3. Dokumentasikan proses rotasi jika password harus diganti.

## 13. Acceptance Criteria

1. Tersedia seeder reviewer production-safe yang dapat dijalankan tanpa menghapus atau mengubah data nyata.
2. Seeder membuat satu owner demo dan satu outlet demo aktif dengan identifier stabil.
3. Seeder membuat employee reviewer aktif dengan username stabil.
4. Employee reviewer memiliki posisi aktif `kasir`, `produksi`, dan `kurir` pada outlet demo.
5. Employee reviewer memiliki semua permission utama kasir, produksi, dan kurir.
6. Employee reviewer memiliki PIN statis yang sudah diset.
7. Employee reviewer dapat login ke Cashier app dengan username/password production.
8. Setelah login Cashier, reviewer tidak diarahkan ke setup PIN atau access denied.
9. Employee reviewer dapat membuka dashboard, order, customer, service, finance/payment, dan setting demo di Cashier app.
10. Employee reviewer dapat login ke Production app dengan username/password production.
11. Setelah login Production, reviewer dapat membuka area Produksi dan Kurir.
12. Customer reviewer dibuat di `customer_accounts`, bukan hanya di `users` atau `customers`.
13. Customer reviewer aktif, verified, punya password, dan punya saldo/address dummy.
14. Customer reviewer dapat login ke Customer app tanpa harus menyelesaikan OTP.
15. Customer reviewer dapat membuka home, discovery, outlet detail, order history, order detail, address, profile, dan topup/payment-related screens.
16. Data yang terlihat oleh reviewer adalah data demo outlet/customer, bukan data pelanggan nyata.
17. Seeder dapat dijalankan dua kali tanpa duplikasi data utama.
18. Google Play Console Sign-in Details berisi name, username/phone, password, dan instruksi akses yang sesuai untuk masing-masing app.
19. Credential reviewer tetap valid setelah app update berikutnya.
20. Reviewer tidak perlu registrasi, OTP, 2FA, biometrik, QR code, lokasi tertentu, membership, perangkat printer, atau approval manual untuk login dan meninjau fitur utama.

## 14. Catatan untuk Penyusunan Implementation Plan

Plan implementasi berikutnya perlu memutuskan:

1. Nama final seeder, misalnya `GooglePlayReviewerSeeder`.
2. Apakah `ReviewerSeeder` lama dihapus, diganti, atau dibiarkan tetapi tidak dipakai.
3. Identifier final untuk owner, outlet, employee, customer, dan order demo.
4. Nama environment variable password production reviewer.
5. Apakah password lama akan selalu dipertahankan saat seeder ulang atau disinkronkan dari env.
6. Cara membuat posisi default: memakai `PositionService::createDefaultPositionsForOutlet()` atau helper idempotent khusus.
7. Cara memastikan permission posisi tanpa mengganggu data posisi non-demo.
8. Data order status apa saja yang dibuat untuk smoke test.
9. Cara membuat customer password login lebih mudah ditemukan di UI Customer app.
10. Smoke test backend dan mobile setelah seeder dijalankan.

Hasil akhir yang diinginkan: Google Play reviewer bisa membuka ketiga aplikasi WashWallet di production dengan credential statis, melihat fitur utama menggunakan data dummy, dan tidak pernah melihat atau mengubah data pelanggan nyata.
