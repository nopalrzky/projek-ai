# User Need: Halaman Tidak Memiliki Permission dan Tab Dinamis Aplikasi Employee

Tanggal: 2026-06-11

## 1. Latar Belakang

WashWallet memiliki aplikasi employee untuk kebutuhan operasional outlet. Secara kebutuhan saat ini, konteks utamanya adalah:

1. Aplikasi kasir.
2. Aplikasi produksi, yang di dalamnya memiliki area kerja `Produksi` dan `Kurir`.

Employee dapat berhasil login karena akun dan password valid, tetapi keberhasilan login tidak otomatis berarti employee boleh memakai aplikasi atau area kerja yang sedang dibuka.

Akses setiap aplikasi harus mengikuti posisi aktif employee dan permission yang diberikan owner pada posisi tersebut.

Contoh kondisi bisnis:

1. Employee A berhasil login.
2. Employee A memiliki posisi B.
3. Posisi B memiliki permission C dan D.
4. Employee A membuka aplikasi kasir atau aplikasi produksi.
5. Jika posisi B tidak memiliki permission yang dibutuhkan aplikasi atau area kerja yang sedang dibuka, employee A tetap dianggap sudah login, tetapi tidak boleh masuk ke halaman utama atau tab area kerja tersebut.

Dalam kondisi ini, aplikasi harus menampilkan halaman khusus yang menjelaskan bahwa user tidak memiliki permission untuk mengakses aplikasi tersebut dan perlu menghubungi owner untuk meminta akses.

Dokumen ini menjadi acuan user need untuk AI model lain saat menyusun implementation plan. Dokumen ini fokus pada kebutuhan pengguna, aturan akses, perilaku setelah login, copy UI, edge case, dan acceptance criteria. Detail teknis seperti route guard, state management, endpoint, middleware, atau test implementation disusun pada dokumen plan.

## 2. Tujuan

1. Mencegah employee tanpa permission yang sesuai melihat atau memakai aplikasi kasir, area produksi, atau area kurir.
2. Memberikan pengalaman setelah login yang jelas ketika akun valid tetapi akses aplikasi belum diberikan.
3. Mengarahkan employee untuk menghubungi owner agar owner memperbarui posisi atau permission.
4. Menghindari kondisi membingungkan seperti blank page, redirect loop, logout otomatis, atau error teknis mentah.
5. Menjadikan permission berbasis posisi sebagai sumber kebenaran akses aplikasi employee.
6. Membuat tab aplikasi produksi fleksibel berdasarkan permission produksi dan kurir yang dimiliki employee.

## 3. Aktor

1. `employee`
   User yang login ke aplikasi kasir atau aplikasi produksi.
2. `owner`
   Pihak yang mengatur posisi dan permission employee.
3. `system`
   Mengecek permission employee dan menentukan apakah user boleh masuk aplikasi yang sedang dibuka.

## 4. Scope Kebutuhan

Scope utama:

1. Halaman no-permission untuk aplikasi kasir.
2. Halaman no-permission untuk aplikasi produksi ketika employee tidak memiliki permission produksi maupun kurir.
3. Halaman no-permission area kerja tertentu ketika employee mencoba membuka area yang tidak dia miliki, misalnya area `Kurir` tanpa permission kurir.
4. Pengecekan permission setelah login berhasil.
5. Pengecekan permission saat restore session/token yang masih aktif.
6. Pesan UI yang jelas sesuai aplikasi yang sedang dibuka.
7. Tab aplikasi produksi yang dinamis berdasarkan permission produksi dan kurir.
8. Aksi dasar seperti logout dan cek ulang akses.
9. Konsistensi dengan payload permission employee, seperti `allPermissions` dan `accessibleOutlets`.

Di luar scope:

1. Perubahan sistem manajemen posisi dan permission di dashboard owner.
2. Redesign menyeluruh aplikasi employee.
3. Menghapus validasi permission backend.
4. Aplikasi customer.
5. Owner dashboard.

## 5. Aturan Bisnis Akses

### 5.1 Login Berhasil Tidak Selalu Berarti Boleh Masuk Aplikasi

Employee dengan credential valid tetap boleh berhasil login. Setelah login berhasil, aplikasi harus mengecek apakah employee memiliki permission yang dibutuhkan untuk aplikasi atau area kerja yang sedang dibuka.

Jika permission memenuhi syarat, user boleh masuk ke halaman utama aplikasi tersebut.

Jika permission tidak memenuhi syarat, user harus diarahkan ke halaman tidak memiliki permission.

### 5.2 Permission Aplikasi Kasir

Aplikasi kasir memiliki aturan yang lebih sederhana dibanding aplikasi produksi. Employee boleh masuk aplikasi kasir jika posisi aktifnya memiliki permission kasir.

Berdasarkan permission yang tersedia saat ini, kandidat permission kasir yang relevan adalah:

1. `order.create`
2. `order.view`
3. `order.manage`
4. `payment.manage`
5. `customer.view`
6. `customer.manage`
7. `service.view`
8. `service.manage`

Plan implementasi perlu menentukan permission minimum untuk membuka aplikasi kasir. Secara kebutuhan bisnis, jika employee memiliki posisi aktif dengan permission kasir yang disyaratkan, employee boleh masuk aplikasi kasir. Jika tidak memiliki permission kasir, employee tidak boleh masuk ke home, dashboard, order, customer, layanan, pembayaran, atau fitur kasir lain dan harus melihat halaman no-permission.

### 5.3 Permission Aplikasi Produksi

Aplikasi produksi adalah satu aplikasi yang dapat memuat dua area kerja:

1. `Produksi`
2. `Kurir`

Area `Produksi` hanya boleh diakses oleh employee yang memiliki permission produksi.

Berdasarkan permission yang tersedia saat ini, kandidat permission produksi yang relevan adalah:

1. `production.view`
2. `production.manage`
3. `order.view`

Plan implementasi perlu menentukan permission minimum untuk membuka area `Produksi`. Secara kebutuhan bisnis, employee yang tidak memiliki permission produksi tidak boleh melihat antrian produksi, detail pekerjaan produksi, atau aksi proses produksi.

Catatan UI:

1. Tab `Pesanan` yang saat ini ada di aplikasi produksi perlu diubah menjadi tab `Produksi`.
2. Label tab harus merepresentasikan area kerja, bukan sekadar daftar pesanan.

### 5.4 Permission Area Kurir di Aplikasi Produksi

Area `Kurir` berada di dalam aplikasi produksi dan hanya boleh diakses oleh employee yang memiliki permission kurir.

Berdasarkan permission yang tersedia saat ini, kandidat permission kurir yang relevan adalah:

1. `courier.view`
2. `courier.manage`
3. `order.view`

Plan implementasi perlu menentukan permission minimum untuk membuka area `Kurir`. Secara kebutuhan bisnis, employee yang tidak memiliki permission kurir tidak boleh melihat jadwal pickup, daftar order kurir, detail pickup, atau aksi pickup/antar.

### 5.5 Tab Dinamis Aplikasi Produksi

Aplikasi produksi harus menampilkan tab secara dinamis berdasarkan permission produksi dan kurir yang dimiliki employee.

Tab dasar yang selalu ada ketika employee boleh masuk aplikasi produksi:

1. `Home`
2. `Profile`

Tab area kerja yang muncul berdasarkan permission:

1. Jika employee hanya memiliki permission kurir, aplikasi produksi menampilkan 3 tab:
   - `Home`
   - `Kurir`
   - `Profile`
2. Jika employee hanya memiliki permission produksi, aplikasi produksi menampilkan 3 tab:
   - `Home`
   - `Produksi`
   - `Profile`
3. Jika employee memiliki permission produksi dan kurir, aplikasi produksi menampilkan 4 tab:
   - `Home`
   - `Produksi`
   - `Kurir`
   - `Profile`
4. Jika employee tidak memiliki permission produksi maupun kurir, aplikasi produksi tidak boleh masuk ke tab utama dan harus menampilkan halaman no-permission.

Aturan tambahan:

1. Employee yang punya permission produksi tetapi tidak punya permission kurir tidak boleh melihat tab `Kurir`.
2. Employee yang punya permission kurir tetapi tidak punya permission produksi tidak boleh melihat tab `Produksi`.
3. Navigasi, tab, menu, dan deep link harus mengikuti permission masing-masing area.
4. Jika user mencoba membuka area yang tidak dia miliki melalui deep link, aplikasi harus menampilkan no-permission untuk area tersebut atau mengarahkan ke tab yang dia miliki.

### 5.6 Permission Mengikuti Posisi Aktif

Akses aplikasi harus dihitung dari posisi aktif employee dan permission aktif yang melekat pada posisi tersebut.

User tidak boleh dianggap punya akses jika:

1. Permission ada pada posisi yang nonaktif.
2. Assignment employee ke posisi tersebut nonaktif.
3. Permission berasal dari outlet atau konteks yang tidak boleh dipakai untuk aplikasi yang sedang dibuka.
4. Payload permission kosong karena relasi permission tidak dimuat.

### 5.7 Konteks Outlet

Jika employee hanya memiliki satu outlet, pengecekan akses mengikuti outlet tersebut.

Jika employee memiliki akses ke beberapa outlet, plan perlu menentukan konteks outlet yang dipakai aplikasi. Kebutuhan bisnisnya:

1. Employee boleh masuk aplikasi hanya untuk outlet yang memang memiliki permission sesuai aplikasi.
2. Employee tidak boleh memakai permission dari outlet lain untuk mengakses data atau fitur pada outlet yang tidak memiliki permission tersebut.
3. Jika tidak ada outlet yang memiliki permission sesuai aplikasi, tampilkan halaman tidak memiliki permission.
4. Jika aplikasi mendukung pemilihan outlet, outlet yang tidak punya permission untuk aplikasi tersebut harus disembunyikan atau tidak bisa dipilih.

## 6. Halaman Tidak Memiliki Permission

### 6.1 Kondisi Muncul

Halaman ini muncul ketika:

1. Login employee berhasil.
2. Session/token employee valid.
3. Employee tidak memiliki permission yang dibutuhkan aplikasi yang sedang dibuka.

Halaman ini juga harus muncul saat aplikasi dibuka ulang dengan session yang masih aktif tetapi permission terbaru employee tidak memenuhi syarat akses.

### 6.2 Pesan Utama

Copy utama harus menyesuaikan nama aplikasi atau area kerja.

Untuk aplikasi kasir:

```text
Anda tidak memiliki izin untuk mengakses aplikasi kasir.
Silakan hubungi owner outlet Anda untuk meminta akses.
```

Untuk aplikasi produksi ketika employee tidak memiliki permission produksi maupun kurir:

```text
Anda tidak memiliki izin untuk mengakses aplikasi produksi.
Silakan hubungi owner outlet Anda untuk meminta akses.
```

Untuk tab Produksi:

```text
Anda tidak memiliki izin untuk membuka tab Produksi.
Silakan hubungi owner outlet Anda untuk meminta akses.
```

Untuk tab Kurir:

```text
Anda tidak memiliki izin untuk membuka tab Kurir.
Silakan hubungi owner outlet Anda untuk meminta akses.
```

Copy boleh disesuaikan agar lebih natural, tetapi maknanya harus tetap:

1. User tidak punya izin untuk aplikasi atau tab area kerja yang sedang dibuka.
2. Ini bukan error password.
3. Ini bukan berarti akun employee pasti nonaktif.
4. Akses perlu diberikan oleh owner melalui posisi atau permission.

### 6.3 Informasi Pendukung

Halaman dapat menampilkan informasi pendukung:

1. Nama employee.
2. Nama outlet aktif atau outlet utama.
3. Nama aplikasi atau area kerja yang sedang dibuka.
4. Posisi employee, jika tersedia.
5. Ringkasan bahwa akses diatur owner melalui posisi dan permission.

Informasi pendukung tidak wajib menampilkan daftar permission mentah. Jika ditampilkan untuk kebutuhan debug internal, tampilkan secara aman dan mudah dipahami.

### 6.4 Aksi User

Halaman minimal menyediakan aksi:

1. `Keluar`
   User logout dari aplikasi dan kembali ke halaman login.

Aksi tambahan yang disarankan:

1. `Cek Ulang Akses`
   Aplikasi memuat ulang data employee atau memanggil endpoint `me` untuk mengambil permission terbaru.

2. `Hubungi Owner`
   Jika data kontak owner tersedia, tombol dapat membuka WhatsApp/telepon. Jika data kontak owner belum tersedia, aksi ini tidak wajib.

## 7. Alur Bisnis yang Diharapkan

### 7.1 Employee Login ke Aplikasi Kasir Tanpa Permission Kasir

1. Employee membuka aplikasi kasir.
2. Employee login dengan username/password valid.
3. Backend mengembalikan token, data employee, outlet, posisi, dan permission.
4. Aplikasi mengecek permission kasir.
5. Jika employee tidak punya permission kasir, aplikasi menampilkan halaman tidak memiliki permission untuk aplikasi kasir.
6. Employee tidak melihat home, dashboard, daftar order, atau fitur operasional kasir.
7. Employee dapat logout atau cek ulang akses setelah owner memperbarui permission.

### 7.2 Employee Login ke Aplikasi Produksi Tanpa Permission Produksi dan Kurir

1. Employee membuka aplikasi produksi.
2. Employee login dengan username/password valid.
3. Backend mengembalikan token, data employee, outlet, posisi, dan permission.
4. Aplikasi mengecek permission produksi dan kurir.
5. Jika employee tidak punya permission produksi maupun kurir, aplikasi menampilkan halaman tidak memiliki permission untuk aplikasi produksi.
6. Employee tidak melihat tab `Home`, `Produksi`, `Kurir`, atau `Profile` pada shell utama aplikasi produksi.
7. Employee dapat logout atau cek ulang akses setelah owner memperbarui permission.

### 7.3 Owner Memberikan Permission Setelah Employee Sudah Login

1. Employee berada di halaman tidak memiliki permission.
2. Owner memperbarui posisi atau permission employee.
3. Employee menekan `Cek Ulang Akses`.
4. Aplikasi mengambil data permission terbaru.
5. Jika permission sudah memenuhi syarat aplikasi atau area kerja yang sedang dibuka, aplikasi mengarahkan employee ke halaman utama yang sesuai.
6. Jika permission masih belum memenuhi syarat, employee tetap berada di halaman tidak memiliki permission.

### 7.4 Permission Dicabut Saat Session Masih Aktif

1. Employee sebelumnya punya akses aplikasi.
2. Owner mencabut permission employee.
3. Saat aplikasi dibuka ulang, refresh session, atau endpoint `me` dipanggil, permission terbaru tidak lagi memenuhi syarat.
4. Aplikasi tidak boleh terus memberi akses berdasarkan cache lama.
5. Aplikasi mengarahkan employee ke halaman tidak memiliki permission.

### 7.5 Employee Hanya Punya Permission Produksi di Aplikasi Produksi

1. Employee membuka aplikasi produksi.
2. Employee hanya punya permission produksi.
3. Aplikasi menampilkan tab `Home`, `Produksi`, dan `Profile`.
4. Aplikasi tidak menampilkan tab `Kurir`.
5. Jika employee mencoba membuka area kurir melalui deep link atau menu lama, aplikasi menampilkan no-permission untuk tab `Kurir` atau mengarahkan kembali ke tab yang tersedia.

### 7.6 Employee Hanya Punya Permission Kurir di Aplikasi Produksi

1. Employee membuka aplikasi produksi.
2. Employee hanya punya permission kurir.
3. Aplikasi menampilkan tab `Home`, `Kurir`, dan `Profile`.
4. Aplikasi tidak menampilkan tab `Produksi`.
5. Jika employee mencoba membuka area produksi melalui deep link atau menu lama, aplikasi menampilkan no-permission untuk tab `Produksi` atau mengarahkan kembali ke tab yang tersedia.

### 7.7 Employee Punya Permission Produksi dan Kurir di Aplikasi Produksi

1. Employee membuka aplikasi produksi.
2. Employee punya permission produksi dan kurir.
3. Aplikasi menampilkan tab `Home`, `Produksi`, `Kurir`, dan `Profile`.
4. Employee dapat berpindah antara area produksi dan kurir sesuai permission yang dimiliki.

## 8. Kebutuhan Fungsional

### FR-01 Aplikasi Mengecek Permission Setelah Login

Setelah login berhasil, aplikasi harus mengecek permission sesuai aplikasi atau area kerja yang sedang dibuka.

Jika memenuhi syarat, user masuk ke halaman utama aplikasi.

Jika tidak memenuhi syarat, user masuk ke halaman tidak memiliki permission.

### FR-02 Aplikasi Mengecek Permission Saat Restore Session

Saat aplikasi dibuka dan menemukan session/token yang masih valid, aplikasi tidak boleh langsung mengarahkan user ke home tanpa memeriksa permission terbaru yang tersedia.

Jika permission tidak memenuhi syarat, user harus diarahkan ke halaman tidak memiliki permission.

### FR-03 Aplikasi Produksi Membentuk Tab Berdasarkan Permission

Aplikasi produksi harus membentuk tab utama secara dinamis:

1. Permission kurir saja: `Home`, `Kurir`, `Profile`.
2. Permission produksi saja: `Home`, `Produksi`, `Profile`.
3. Permission produksi dan kurir: `Home`, `Produksi`, `Kurir`, `Profile`.
4. Tanpa permission produksi dan kurir: tampilkan halaman no-permission, bukan tab utama.

Tab `Pesanan` yang ada saat ini harus diubah menjadi `Produksi`.

### FR-04 No-Permission Tidak Menampilkan Fitur Operasional

Pada kondisi no-permission, user tidak boleh melihat atau membuka fitur operasional aplikasi yang tidak dia miliki aksesnya.

Contoh untuk kasir:

1. Dashboard kasir.
2. Order kasir.
3. Customer.
4. Layanan.
5. Payment/deposit/petty cash.

Contoh untuk tab Produksi:

1. Antrian produksi.
2. Detail pekerjaan produksi.
3. Mulai proses produksi.
4. Update progress produksi.

Contoh untuk tab Kurir:

1. Jadwal pickup.
2. Daftar order kurir.
3. Detail pickup.
4. Aksi pickup dan konfirmasi pengantaran.

### FR-05 Pesan Harus Jelas dan Kontekstual

Halaman harus menyebut aplikasi atau tab area kerja yang tidak bisa diakses, misalnya aplikasi kasir, aplikasi produksi, tab Produksi, atau tab Kurir.

Pesan tidak boleh berupa error teknis mentah seperti:

1. `403 Forbidden`
2. `Unauthorized`
3. `Permission denied`
4. Stack trace
5. Response backend mentah

### FR-06 User Bisa Logout

User harus bisa logout dari halaman tidak memiliki permission.

Setelah logout, token/session dibersihkan dan user diarahkan ke halaman login.

### FR-07 User Bisa Cek Ulang Akses

Jika tombol `Cek Ulang Akses` dibuat, aplikasi harus mengambil data permission terbaru.

Jika permission sudah valid, user diarahkan ke halaman utama yang sesuai.

Jika permission belum valid, user tetap berada di halaman no-permission dengan feedback singkat bahwa akses belum tersedia.

### FR-08 Backend Tetap Menolak Endpoint Tanpa Permission

Halaman no-permission hanya memperbaiki pengalaman pengguna di frontend. Backend tetap harus menolak request endpoint kasir, produksi, atau kurir ketika employee tidak memiliki permission yang sesuai.

## 9. Kebutuhan Non-Fungsional

1. Halaman harus ringan dan bisa tampil tanpa memuat data operasional sensitif.
2. UI harus konsisten dengan desain aplikasi employee.
3. Pesan harus mudah dipahami oleh employee non-teknis.
4. Routing tidak boleh menyebabkan loop antara splash, login, home, dan halaman no-permission.
5. Cache permission tidak boleh membuat user yang sudah dicabut aksesnya tetap bisa memakai aplikasi terlalu lama.
6. State auth harus membedakan antara:
   - belum login,
   - login dan punya akses aplikasi,
   - login tetapi tidak punya akses aplikasi.
7. Pada aplikasi produksi, state akses perlu bisa membedakan:
   - punya akses produksi,
   - punya akses kurir,
   - punya akses produksi dan kurir,
   - tidak punya akses produksi maupun kurir.
8. Perubahan tab karena permission tidak boleh membuat layout bottom navigation error, index tab salah, atau membuka tab yang sudah disembunyikan.

## 10. Edge Case

1. `allPermissions` kosong karena employee memang tidak punya permission.
   - Tampilkan halaman no-permission.

2. `allPermissions` kosong karena backend tidak memuat relasi permission.
   - Dari perspektif aplikasi, jangan memberi akses.
   - Plan perlu memastikan fallback refresh atau endpoint `me` tidak membuat false negative permanen.

3. Employee punya permission produksi tetapi membuka aplikasi kasir.
   - Tampilkan halaman no-permission kasir.

4. Employee punya permission kurir tetapi membuka area produksi.
   - Tab `Produksi` tidak ditampilkan.
   - Jika dibuka lewat deep link, tampilkan no-permission tab `Produksi` atau arahkan ke tab yang tersedia.

5. Employee punya permission kasir tetapi membuka area kurir.
   - Jika employee tidak punya permission kurir, tab `Kurir` tidak ditampilkan.
   - Jika dibuka lewat deep link, tampilkan no-permission tab `Kurir` atau arahkan ke tab yang tersedia.

6. Employee punya permission aplikasi pada outlet lain, tetapi outlet aktif tidak punya permission tersebut.
   - Jangan izinkan akses untuk outlet aktif.
   - Jika pemilihan outlet didukung, arahkan user memilih outlet yang memang punya akses.

7. Token expired saat user menekan `Cek Ulang Akses`.
   - Arahkan ke login.

8. Backend mengembalikan 403 ketika user sudah berada di dalam aplikasi karena permission dicabut.
   - Aplikasi harus menghentikan akses halaman operasional dan mengarahkan ke no-permission atau refresh permission.

## 11. Acceptance Criteria

1. Employee dengan credential valid tetapi tanpa permission kasir diarahkan ke halaman no-permission saat membuka aplikasi kasir.
2. Employee dengan credential valid tetapi tanpa permission produksi maupun kurir diarahkan ke halaman no-permission saat membuka aplikasi produksi.
3. Employee dengan permission produksi saja dapat masuk aplikasi produksi dengan tab `Home`, `Produksi`, dan `Profile`.
4. Employee dengan permission kurir saja dapat masuk aplikasi produksi dengan tab `Home`, `Kurir`, dan `Profile`.
5. Employee dengan permission produksi dan kurir dapat masuk aplikasi produksi dengan tab `Home`, `Produksi`, `Kurir`, dan `Profile`.
6. Tab `Pesanan` pada aplikasi produksi berubah menjadi tab `Produksi`.
7. Employee tanpa permission produksi tidak melihat tab `Produksi`.
8. Employee tanpa permission kurir tidak melihat tab `Kurir`.
9. Employee yang membuka tab `Produksi` melalui deep link tanpa permission produksi tidak dapat melihat fitur produksi.
10. Employee yang membuka tab `Kurir` melalui deep link tanpa permission kurir tidak dapat melihat fitur kurir.
11. Employee tanpa permission yang sesuai tidak dapat membuka route fitur melalui navigasi langsung atau deep link internal.
12. Halaman menampilkan pesan yang jelas dan menyebut aplikasi atau tab area kerja yang tidak dapat diakses.
13. Halaman mengarahkan user untuk menghubungi owner outlet agar mendapatkan akses.
14. Halaman menyediakan aksi logout.
15. Jika tombol cek ulang akses tersedia, employee yang permission-nya baru diberikan owner bisa masuk aplikasi atau tab yang sesuai setelah permission terbaru dimuat.
16. Employee yang punya permission kasir tetap dapat masuk aplikasi kasir.
17. Employee yang hanya punya permission produksi tidak otomatis punya akses kurir.
18. Employee yang hanya punya permission kurir tidak otomatis punya akses produksi.
19. Employee yang hanya punya permission produksi atau kurir tidak otomatis punya akses kasir.
20. Saat session dipulihkan dari storage, aplikasi tetap mengecek permission sebelum masuk home.
21. Backend tetap memberikan response deny untuk endpoint yang membutuhkan permission ketika employee tidak memiliki permission tersebut.
22. Tidak ada route loop antara splash, login, home, dan halaman no-permission.
23. Copy halaman tidak menampilkan error teknis mentah seperti `403 Forbidden` atau stack trace.

## 12. Catatan untuk Penyusunan Plan

Plan implementasi berikutnya perlu memutuskan:

1. Nama route halaman no-permission, misalnya `/no-permission` atau `/unauthorized`.
2. Apakah satu screen reusable dipakai untuk aplikasi kasir, aplikasi produksi, tab Produksi, dan tab Kurir dengan parameter konteks akses.
3. Permission minimum untuk akses aplikasi kasir.
4. Permission minimum untuk akses area produksi.
5. Permission minimum untuk akses area kurir.
6. Cara membentuk daftar tab aplikasi produksi berdasarkan kombinasi permission produksi dan kurir.
7. Cara mengganti tab `Pesanan` menjadi `Produksi` tanpa merusak route atau state lama.
8. Cara mengambil permission terbaru saat restore session dan cek ulang akses.
9. Perilaku employee multi-outlet yang punya permission aplikasi hanya pada outlet tertentu.
10. Test coverage untuk login tanpa permission, kombinasi tab aplikasi produksi, restore session tanpa permission, deep link, logout, refresh permission, dan endpoint 403.

Dokumen ini tidak menentukan detail teknis final. Hasil akhir yang harus terasa oleh user adalah: employee yang tidak punya permission untuk aplikasi kasir atau aplikasi produksi tidak dibuang ke error mentah, sementara employee yang hanya punya sebagian permission di aplikasi produksi hanya melihat tab yang memang boleh dia akses.
