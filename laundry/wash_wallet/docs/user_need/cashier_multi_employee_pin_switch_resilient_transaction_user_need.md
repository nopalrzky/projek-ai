# User Need: Multi-Kasir PIN Switch dan Resilient Transaction Flow Cashier App

Tanggal: 2026-06-19

Dokumen ini menjadi acuan user need untuk AI model lain saat menyusun implementation plan. Dokumen ini fokus pada kebutuhan pengguna, konteks sistem saat ini, perilaku yang diharapkan, batasan online-required, edge case, dan acceptance criteria. Detail teknis final seperti nama endpoint, migration, state management, struktur penyimpanan lokal, algoritma hashing PIN, dan test implementation ditentukan pada dokumen plan.

## 1. Latar Belakang

Dalam satu outlet bisa ada beberapa kasir atau employee yang memakai perangkat kasir yang sama. Saat ini pola aplikasi cashier masih berpusat pada satu session employee aktif: employee login dengan username dan password, lalu aplikasi masuk ke home cashier. Pada operasional outlet, pergantian kasir bisa terjadi di tengah shift atau ketika perangkat dipakai bergantian oleh beberapa employee.

User membutuhkan pengalaman login yang lebih cepat setelah akun pernah dipakai di perangkat tersebut. Employee yang sudah pernah login perlu bisa dipilih dari daftar akun tersimpan dan melakukan switch dengan PIN. Karena akun employee dibuat oleh owner, employee baru belum memiliki PIN saat pertama kali login. Karena itu, aplikasi perlu meminta employee membuat PIN setelah login pertama dengan password.

Di sisi transaksi, user juga menegaskan bahwa Cashier App tidak ingin dibuat offline-first penuh. Aplikasi tetap harus online-required untuk aksi yang berdampak ke backend, tetapi input kasir tidak boleh hilang hanya karena koneksi putus, submit gagal, atau aplikasi tertutup. Pendekatan yang dibutuhkan adalah resilient transaction flow: kasir boleh mengisi transaksi dan draft disimpan lokal, tetapi submit order, payment, weighing final, print coin, dan kirim WA tetap membutuhkan koneksi.

## 2. Tujuan

1. Memungkinkan beberapa employee kasir memakai satu perangkat cashier secara bergantian dengan cepat.
2. Menyimpan akun employee yang pernah login di perangkat agar bisa dipilih saat switch.
3. Menggunakan PIN sebagai verifikasi cepat saat switch employee, tanpa menggantikan login username/password pertama.
4. Memastikan employee yang belum punya PIN membuat PIN setelah login password pertama.
5. Menjaga akses cashier tetap mengikuti posisi dan permission yang diberikan owner.
6. Menjaga tampilan cashier tetap sama untuk employee yang punya akses kasir, dengan pembatasan aksi berdasarkan permission.
7. Memastikan input transaksi kasir tidak hilang ketika koneksi bermasalah, aplikasi force-close, atau submit gagal.
8. Menegaskan bahwa aksi berdampak backend tetap membutuhkan koneksi dan tidak boleh diproses diam-diam secara offline.
9. Mempertahankan notifikasi order baru yang sudah ada, termasuk suara, dan menambahkan kebutuhan getar bila device mendukung.

## 3. Aktor

1. `owner`
   Membuat akun employee, mengatur posisi, outlet, dan permission.
2. `cashier employee`
   Employee yang memakai Cashier App untuk transaksi, order, payment, weighing, print, dan komunikasi WA.
3. `cashier app`
   Menyimpan akun yang pernah login, mengelola session aktif, meminta PIN saat switch, menyimpan draft lokal, dan menolak aksi online ketika koneksi tidak tersedia.
4. `backend`
   Memvalidasi credential, session token, permission, PIN, dan semua aksi yang mengubah data.
5. `customer`
   Tidak memakai fitur switch, tetapi terdampak oleh order yang dibuat atau diproses kasir.

## 4. Konteks Sistem Saat Ini

Hasil review kode saat ini:

1. Cashier App memakai Flutter di `apps/cashier`.
2. Login cashier saat ini memakai username dan password melalui `AuthCubit`.
3. State auth utama saat ini adalah `Authenticated`, `Unauthenticated`, `AuthLoading`, dan `AuthFailureState`.
4. Router saat ini langsung mengarahkan employee authenticated ke `/home`.
5. Backend employee auth ada di `EmployeeAuthController` dan `AuthService::loginEmployee`.
6. Login employee backend saat ini membuat Sanctum token dan mengembalikan `LoginEmployeeResource`.
7. `LoginEmployeeResource` sudah mengembalikan `accessibleOutlets` dan `allPermissions`.
8. Model domain `AuthEmployee` sudah punya helper `hasPermission`, `hasAnyPermission`, dan `accessibleOutletIds`.
9. Migration `employees` saat ini belum memiliki field atau konsep PIN employee.
10. Cashier App sudah memiliki local draft order berbasis `SharedPreferences` melalui `OrderLocalDatasource`.
11. Draft order saat ini disimpan per customer dengan key seperti `draft_order_customer_{customerId}`.
12. Draft order saat ini terutama mencakup `outletId`, `customerId`, item order, dan `updatedAt`.
13. Submit order, update order, accept/reject, start, complete, dan weigh saat ini diproses ke remote datasource dan mengembalikan `NetworkFailure` ketika koneksi bermasalah.
14. Print flow sudah memakai backend print info dan Bluetooth thermal printer service.
15. Print coin confirmation sudah menjadi kebutuhan existing dan tidak boleh dilewati.
16. WA notification memakai preview/send endpoint dan tetap backend-driven.
17. Cashier App sudah memiliki FCM, Pusher, local notification, badge, dan audio notification untuk order baru.
18. Audio notification memakai asset `assets/sounds/notification.mp3`.
19. Implementasi getar eksplisit belum terlihat pada service notifikasi yang direview.
20. Permission backend mobile cashier sudah diterapkan pada route penting, misalnya `order.view`, `order.create`, `order.manage`, `payment.manage`, `customer.view`, `customer.manage`, dan `service.view`.

## 5. Scope Kebutuhan

Scope utama:

1. Remembered employee accounts pada satu perangkat cashier.
2. Quick switch employee dengan PIN.
3. Setup PIN pertama kali setelah login password untuk employee yang belum punya PIN.
4. Validasi akses cashier berdasarkan permission employee.
5. UX session aktif yang jelas, termasuk nama employee aktif dan opsi switch.
6. Penyimpanan draft transaksi lokal yang lebih tahan gangguan.
7. Online-required guard untuk aksi berdampak backend.
8. Retry yang jelas untuk submit/action yang gagal karena koneksi.
9. Pencegahan duplicate submit akibat retry atau tap berulang.
10. Integrasi perilaku notifikasi order baru agar tidak merusak flow transaksi aktif.

Di luar scope:

1. Aplikasi customer.
2. Owner dashboard untuk mengelola employee, kecuali payload/permission yang dibutuhkan oleh cashier.
3. Redesign menyeluruh UI cashier.
4. Offline-first penuh, queue background otomatis, atau sinkronisasi order offline ke backend.
5. Payment gateway settlement otomatis.
6. Universal printer support di luar Bluetooth thermal printer yang sudah dipakai.
7. Perubahan lifecycle status order secara menyeluruh.
8. Perubahan notifikasi order baru selain kebutuhan agar tetap non-intrusive dan dapat getar.

## 6. Kebutuhan Multi-Kasir dan Session Switch

### 6.1 Remembered Account

Aplikasi perlu menyimpan daftar employee yang pernah berhasil login dengan username/password di perangkat yang sama.

Aturan yang diharapkan:

1. Employee baru hanya bisa masuk daftar switch setelah berhasil login dengan username/password.
2. Daftar switch tidak perlu menampilkan semua employee outlet dari backend.
3. Data yang ditampilkan di switch cukup untuk mengenali employee, seperti nama, username, outlet, dan status apakah PIN sudah tersedia.
4. Akun tersimpan harus bisa dihapus dari perangkat, misalnya ketika employee tidak lagi memakai perangkat tersebut.
5. Menghapus akun dari perangkat tidak menghapus akun employee di backend.
6. Logout dari session aktif tidak selalu berarti menghapus akun dari daftar switch.
7. Jika employee dinonaktifkan owner atau permission dicabut, akun boleh tetap terlihat di perangkat, tetapi tidak boleh masuk ke cashier flow setelah validasi server gagal.

### 6.2 Login Pertama dan Setup PIN

Employee yang akunnya dibuat oleh owner belum memiliki PIN pada awalnya. Karena PIN dipakai untuk switch cepat, aplikasi harus membuat momen setup PIN yang jelas.

Perilaku yang diharapkan:

1. Employee login pertama kali memakai username/password.
2. Jika backend menyatakan employee belum punya PIN, aplikasi meminta employee membuat PIN.
3. Setup PIN harus terjadi sebelum employee dianggap siap untuk quick switch.
4. PIN harus dikonfirmasi dua kali agar tidak salah input.
5. Setelah PIN berhasil dibuat, employee masuk ke cashier app jika permission kasir valid.
6. Jika setup PIN gagal karena koneksi atau validasi, employee tetap tidak boleh dianggap memiliki PIN.
7. PIN tidak boleh ditampilkan kembali dalam bentuk asli.
8. PIN tidak boleh disimpan atau dicatat sebagai plain text di log, analytics, error message, atau local storage.

Catatan default untuk plan:

1. Default kebutuhan adalah employee tanpa PIN wajib setup PIN setelah login password pertama.
2. PIN adalah verifikasi cepat untuk switch, bukan pengganti credential utama untuk login awal.
3. Detail teknis penyimpanan PIN, hashing, endpoint, dan rate limit ditentukan pada implementation plan.

### 6.3 Switch Employee dengan PIN

Switch employee adalah proses mengganti employee aktif pada perangkat yang sama.

Perilaku yang diharapkan:

1. Employee aktif dapat membuka menu switch dari area profile/header/drawer/settings.
2. Aplikasi menampilkan daftar employee yang pernah login di perangkat tersebut.
3. Saat memilih employee lain yang sudah punya PIN, aplikasi meminta PIN.
4. Jika PIN benar dan session/token masih valid atau dapat divalidasi ulang, aplikasi mengganti employee aktif.
5. Jika PIN salah, employee aktif tidak berubah.
6. Jika session/token employee target invalid, aplikasi meminta login ulang username/password untuk employee tersebut.
7. Jika employee target tidak lagi aktif, aplikasi menampilkan pesan bahwa akun tidak aktif.
8. Jika employee target tidak lagi memiliki permission cashier, aplikasi menampilkan no-permission flow.
9. Switching tidak boleh menghapus draft transaksi milik employee lain secara otomatis.
10. Switching di tengah transaksi harus memberi peringatan jika ada input belum selesai, agar kasir tidak kehilangan konteks.

### 6.4 Session Aktif

Cashier App harus selalu jelas sedang berjalan sebagai employee siapa.

Kebutuhan UX:

1. Nama employee aktif terlihat di area yang mudah ditemukan, misalnya header, profile, atau settings.
2. Outlet aktif terlihat atau bisa diakses dari profile/session context.
3. Setelah switch sukses, semua aksi baru harus memakai employee aktif yang baru.
4. Data sensitif session employee lama tidak boleh dipakai untuk request employee baru.
5. Notifikasi dan realtime connection harus mengikuti outlet/session employee aktif.
6. Jika ada pending navigation dari push notification, aplikasi harus memastikan session aktif punya akses ke outlet/order tersebut sebelum membuka detail.

## 7. Permission dan Tampilan Kasir

User menegaskan bahwa jika employee diberi posisi atau permission kasir, employee bisa mengakses Cashier App dan tampilannya sama.

Aturan yang diharapkan:

1. Employee boleh masuk Cashier App jika memiliki permission kasir minimum yang ditentukan oleh plan.
2. Kandidat permission kasir mengikuti pola existing: `order.view`, `order.create`, `order.manage`, `payment.manage`, `customer.view`, `customer.manage`, `service.view`, dan `service.manage`.
3. Employee dengan permission kasir melihat shell/tampilan kasir yang sama.
4. Perbedaan permission dipakai untuk membatasi aksi atau menu tertentu, bukan membuat app yang terasa berbeda untuk setiap posisi.
5. Employee tanpa permission kasir tidak boleh masuk home cashier.
6. Employee tanpa permission kasir harus melihat halaman tidak memiliki permission, bukan blank page, redirect loop, atau logout otomatis.
7. Jika permission berubah ketika session masih aktif, aplikasi perlu mengecek ulang akses saat restore session, switch, dan request penting.

## 8. Resilient Transaction Flow

### 8.1 Prinsip Utama

Cashier App tetap online-required. Tujuan resilient flow bukan membuat transaksi bisa selesai offline, tetapi memastikan input kasir tidak hilang sebelum aksi final berhasil terkirim ke backend.

Prinsip:

1. Kasir boleh mengisi transaksi ketika koneksi sedang tidak stabil.
2. Input yang sudah diisi harus disimpan lokal sebagai draft.
3. Aksi final tetap membutuhkan koneksi aktif.
4. Aplikasi tidak boleh membuat antrean offline tersembunyi untuk order, payment, weighing final, print coin, atau WA.
5. User harus tahu dengan jelas apakah aksi sudah berhasil di backend atau belum.
6. Draft hanya dihapus setelah backend mengonfirmasi aksi final berhasil.

### 8.2 Draft Order Walk-In

Draft order walk-in perlu lebih lengkap dari draft item yang ada saat ini.

Draft lokal yang dibutuhkan minimal mencakup:

1. Outlet.
2. Employee pemilik draft atau employee terakhir yang mengedit draft.
3. Customer yang dipilih.
4. Item layanan, quantity, harga referensi bila diperlukan, dan notes item.
5. Notes order.
6. Estimated completion.
7. Payment status.
8. Payment method.
9. Source account atau account tujuan untuk transfer/QRIS jika sudah dipilih.
10. Paid amount.
11. Timestamp terakhir disimpan.
12. Status draft, misalnya editing atau submit_failed.

Perilaku:

1. Draft disimpan otomatis saat kasir mengubah customer, item, quantity, notes, payment, tanggal, atau account.
2. Jika aplikasi ditutup paksa, draft dapat dipulihkan saat kasir kembali.
3. Jika draft lama ditemukan, aplikasi harus memberi opsi lanjutkan, hapus, atau mulai baru.
4. Draft harus scoped dengan aman agar tidak tertukar antara outlet, customer, dan employee.
5. Draft tidak boleh hilang ketika submit gagal karena network.
6. Draft boleh dihapus setelah order berhasil dibuat di backend.

### 8.3 Draft Weighing

Weighing final adalah aksi backend. Namun input penimbangan yang sedang diedit juga tidak boleh hilang.

Kebutuhan:

1. Draft weighing lokal perlu menyimpan order ID, item timbang, quantity final, notes, dan referensi foto jika ada.
2. Jika koneksi hilang sebelum final submit, input tetap dapat dipulihkan.
3. Final submit weighing tetap membutuhkan koneksi.
4. Jika foto atau upload gagal, aplikasi harus menjelaskan apakah weighing belum tersimpan atau hanya foto yang gagal.
5. Draft weighing dihapus hanya setelah backend mengonfirmasi penimbangan berhasil.

### 8.4 Aksi Online-Required

Aksi berikut harus membutuhkan koneksi dan tidak boleh diproses offline secara diam-diam:

1. Submit order baru.
2. Update order yang mengubah data backend.
3. Accept atau reject order.
4. Start atau complete order.
5. Weighing final.
6. Mark payment atau payment action.
7. Print receipt atau label yang memotong coin atau membutuhkan print info backend.
8. Kirim WA notification.
9. Deposit, petty cash, expense, atau aksi dana lain.

Saat koneksi tidak tersedia:

1. Tombol boleh tetap terlihat, tetapi saat ditekan harus memberi pesan bahwa koneksi dibutuhkan.
2. Jika app bisa mendeteksi offline lebih awal, tombol dapat disabled dengan alasan yang jelas.
3. Input user tetap disimpan sebagai draft.
4. User diberi aksi retry atau coba lagi setelah koneksi pulih.
5. Aplikasi tidak boleh menampilkan sukses sebelum backend berhasil.

### 8.5 Pencegahan Duplicate Submit

Kegagalan koneksi bisa membuat user menekan tombol berkali-kali. Sistem perlu mencegah order atau action ganda.

Kebutuhan:

1. Saat submit berjalan, tombol submit disabled dan menampilkan loading.
2. Jika request timeout atau network failure, aplikasi tidak boleh otomatis menganggap sukses.
3. Draft masuk status submit_failed atau tetap editing dengan pesan retry.
4. Retry memakai draft yang sama, bukan membuat input ulang dari nol.
5. Setelah retry berhasil, draft dibersihkan.
6. Jika backend sebenarnya sudah menerima request tetapi response gagal diterima, plan perlu menentukan strategi aman, misalnya client request id, idempotency key, atau pencarian order terakhir sebelum membuat ulang.

Catatan: strategi teknis idempotency ditentukan di implementation plan, tetapi user need ini menetapkan bahwa duplicate order/action tidak boleh terjadi karena retry.

## 9. Notifikasi Order Baru Saat Kasir Bekerja

New order notification sudah menjadi kebutuhan existing dan current code sudah memiliki fondasi FCM, Pusher, local notification, badge, dan audio.

Kebutuhan tambahan dan penegasan:

1. Sound notification tetap dipertahankan untuk order baru.
2. Aplikasi perlu mendukung getar saat order baru masuk bila device dan permission mendukung.
3. Banner/order notification tidak boleh memutus flow transaksi yang sedang diisi.
4. Jika kasir sedang mengisi draft, notification tap tidak boleh menghapus draft.
5. Jika user membuka order baru dari banner, aplikasi harus memberi jalan kembali ke draft aktif atau menjaga draft tetap recoverable.
6. Badge dan count perlu sinkron ulang setelah reconnect atau app resume.
7. Setelah switch employee, notification session harus mengikuti outlet dan permission employee aktif.

## 10. UX Copy dan State yang Dibutuhkan

Contoh pesan yang perlu tersedia:

1. Setup PIN:
   - "Buat PIN kasir untuk switch akun lebih cepat."
   - "PIN dipakai saat berganti kasir di perangkat ini."
2. Switch PIN:
   - "Masukkan PIN untuk masuk sebagai {nama employee}."
   - "PIN salah. Session belum diganti."
3. Session invalid:
   - "Session akun ini sudah berakhir. Login ulang dengan password."
4. No permission:
   - "Akun ini belum memiliki akses kasir. Hubungi owner untuk memperbarui permission."
5. Offline submit:
   - "Koneksi dibutuhkan untuk mengirim pesanan. Draft tetap tersimpan."
6. Submit failed:
   - "Pesanan belum terkirim. Periksa koneksi lalu coba lagi."
7. Print online-required:
   - "Koneksi dibutuhkan untuk mengambil data cetak dan konfirmasi coin."
8. WA online-required:
   - "Koneksi dibutuhkan untuk mengirim notifikasi WhatsApp."

State UI yang perlu dibedakan:

1. Belum login.
2. Login password berhasil tetapi perlu setup PIN.
3. Authenticated dan punya akses cashier.
4. Authenticated tetapi tidak punya permission cashier.
5. Switch PIN prompt.
6. Switch target session invalid.
7. Draft editing.
8. Draft ditemukan.
9. Submit in progress.
10. Submit failed karena koneksi.
11. Submit berhasil.
12. Aksi online-required tertolak karena offline.

## 11. Edge Case

1. Employee A sedang mengisi transaksi, lalu Employee B ingin switch.
   Aplikasi harus memperingatkan bahwa ada draft aktif dan memastikan draft tersimpan sebelum switch.
2. Employee target switch tidak punya PIN karena data lama.
   Default kebutuhan: employee harus login password dan membuat PIN terlebih dahulu.
3. Employee salah memasukkan PIN berulang kali.
   Aplikasi tidak mengganti session dan perlu mekanisme keamanan yang ditentukan pada plan.
4. Employee dihapus atau dinonaktifkan owner.
   Switch atau restore session gagal dan user diberi pesan akun tidak aktif.
5. Permission kasir dicabut saat app sedang aktif.
   Request backend akan gagal 403; aplikasi perlu menampilkan no-permission atau pesan akses dicabut.
6. Draft dibuat oleh Employee A, lalu Employee B switch.
   Draft tidak boleh diam-diam dikirim sebagai Employee B tanpa konfirmasi.
7. Koneksi putus setelah kasir menekan submit.
   App tidak boleh menampilkan sukses tanpa konfirmasi backend.
8. User menekan submit berkali-kali karena loading lama.
   App harus mencegah duplicate request dari UI.
9. Backend menerima order tetapi response gagal sampai ke app.
   Plan harus punya strategi aman agar retry tidak membuat order ganda.
10. Print gagal karena printer tidak tersambung.
    Error harus mengarahkan ke setting printer dan tidak menyatakan print berhasil.
11. Print gagal karena koneksi ketika mengambil print info atau konfirmasi coin.
    App harus menyatakan print belum terjadi atau belum lengkap.
12. WA preview berhasil tetapi send gagal.
    App harus menyatakan WA belum terkirim.
13. Order baru masuk saat offline atau Pusher reconnect.
    App perlu sync count/list saat koneksi pulih.
14. Aplikasi force-close di review order.
    Saat dibuka kembali, draft review bisa dipulihkan.
15. Storage lokal gagal atau corrupt.
    App harus gagal dengan pesan jelas dan tidak crash permanen.

## 12. Acceptance Criteria

### 12.1 Multi-Kasir PIN Switch

1. Given Employee A login dengan username/password dan belum punya PIN, when login berhasil, then aplikasi meminta Employee A membuat PIN.
2. Given Employee A selesai membuat PIN dan memiliki permission kasir, when setup berhasil, then aplikasi masuk ke cashier home.
3. Given Employee A sudah pernah login di perangkat, when user membuka switch account, then Employee A muncul di daftar akun tersimpan.
4. Given Employee B belum pernah login di perangkat, when user ingin memakai Employee B, then Employee B harus login username/password terlebih dahulu.
5. Given Employee B sudah tersimpan dan punya PIN, when user memilih Employee B, then aplikasi meminta PIN Employee B.
6. Given PIN Employee B benar, when session valid, then session aktif berubah menjadi Employee B.
7. Given PIN Employee B salah, when user submit PIN, then session aktif tetap employee sebelumnya.
8. Given session Employee B invalid, when user mencoba switch dengan PIN, then aplikasi meminta login ulang password.
9. Given Employee B tidak punya permission kasir, when switch/login berhasil secara credential, then aplikasi menampilkan halaman tidak memiliki permission.
10. Given Employee A dan B sama-sama punya permission kasir, when masing-masing aktif, then tampilan cashier utama tetap sama.
11. Given Employee A sedang memiliki draft aktif, when user switch ke Employee B, then aplikasi memastikan draft tersimpan dan tidak otomatis mengirim draft sebagai Employee B.
12. Given employee dihapus dari daftar perangkat, when daftar switch dibuka ulang, then employee tersebut tidak tampil lagi di perangkat itu.

### 12.2 Resilient Transaction Flow

1. Given kasir memilih customer dan item layanan, when aplikasi ditutup, then draft dapat dipulihkan saat aplikasi dibuka kembali.
2. Given kasir mengisi payment status/method/account/paid amount di review, when koneksi putus, then input tetap tersimpan sebagai draft.
3. Given koneksi offline, when kasir menekan submit order, then aplikasi menolak submit dengan pesan koneksi dibutuhkan dan draft tetap ada.
4. Given submit order gagal karena network, when user kembali ke flow, then data transaksi tidak hilang.
5. Given submit order sedang berjalan, when user menekan tombol submit lagi, then request ganda tidak dikirim dari UI.
6. Given retry submit berhasil, when backend mengembalikan order berhasil, then draft terkait dibersihkan.
7. Given weighing sedang diedit, when aplikasi force-close, then input weighing dapat dipulihkan.
8. Given koneksi offline, when kasir menekan simpan weighing final, then aplikasi menolak aksi dan mempertahankan draft weighing.
9. Given koneksi offline, when kasir mencoba print receipt/label yang membutuhkan backend print info atau coin, then aplikasi menolak aksi dan tidak menyatakan print sukses.
10. Given koneksi offline, when kasir mencoba kirim WA, then aplikasi menolak aksi dan tidak menyatakan WA terkirim.
11. Given order baru masuk saat kasir mengisi transaksi, when notification muncul, then input transaksi tidak hilang.
12. Given app reconnect setelah koneksi putus, when user kembali ke home/order list, then count/list order baru dapat disinkronkan ulang.

## 13. Rekomendasi Untuk Implementation Plan

Implementation plan yang dibuat dari user need ini perlu menentukan:

1. Permission minimum untuk membuka Cashier App.
2. Bentuk payload auth yang menunjukkan `hasPin` atau status PIN employee.
3. Endpoint atau service untuk setup PIN dan verify PIN.
4. Kebijakan keamanan PIN, termasuk hashing, attempt limit, lockout, dan audit minimal.
5. Struktur local remembered accounts dan batas data yang boleh disimpan.
6. Strategi session/token untuk beberapa employee tersimpan di satu perangkat.
7. Cara refresh permission/session saat switch dan restore app.
8. Struktur draft order yang lebih lengkap dan strategy migration dari draft lama.
9. Struktur draft weighing lokal.
10. Idempotency atau mekanisme lain untuk mencegah duplicate submit/action.
11. UX offline/online-required guard yang konsisten di order, payment, weighing, print, WA, dan dana.
12. Integrasi getar pada notification service bila package/device mendukung.
13. Test coverage backend dan Flutter untuk PIN, switch, permission, draft recovery, offline submit, dan duplicate prevention.

## 14. Asumsi dan Default

1. Quick switch hanya menampilkan employee yang pernah login username/password di perangkat tersebut.
2. Employee yang belum punya PIN wajib setup PIN setelah login password pertama.
3. Employee tanpa PIN tidak bisa quick switch sampai PIN dibuat.
4. PIN dipakai untuk switch/unlock cepat, bukan untuk login awal dari perangkat baru.
5. Cashier App tetap online-required untuk semua aksi final yang berdampak backend.
6. Draft lokal adalah recovery input, bukan queue offline untuk sinkronisasi otomatis.
7. Employee dengan permission kasir memakai tampilan cashier yang sama.
8. Perbedaan permission memengaruhi akses aksi/menu, bukan membuat UI kasir utama berbeda.
9. Sound notification order baru sudah ada dan harus dipertahankan.
10. Getar notification dianggap kebutuhan tambahan yang perlu divalidasi kemampuan device dan permission.
11. File ini tidak menetapkan nama teknis final endpoint, kolom database, atau class implementasi.
