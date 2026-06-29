# User Need: Setting PIN dan Atur Ulang PIN Cashier

Tanggal: 2026-06-21

Dokumen ini menjadi acuan user need untuk AI model lain saat menyusun implementation plan. Fokus dokumen ini adalah perubahan kebutuhan produk pada menu Settings cashier agar entry point PIN bersifat action-oriented berdasarkan status PIN employee. Detail implementasi final seperti nama route, nama endpoint, struktur state management, nama class, dan susunan UI akhir ditentukan pada dokumen implementation plan.

## 1. Latar Belakang

Settings cashier saat ini memiliki item `Keamanan PIN` dan screen informasi PIN. Label dan flow ini masih terasa pasif, seolah user hanya membuka halaman informasi keamanan, bukan melakukan aksi yang jelas.

Stakeholder ingin item tersebut berubah menjadi entry point aksi yang langsung sesuai dengan kondisi employee:

1. Jika employee belum memiliki PIN, menu Settings harus menampilkan `Setting PIN`.
2. Jika employee sudah memiliki PIN, menu Settings harus menampilkan `Atur Ulang PIN`.

Perubahan ini penting karena PIN dipakai dalam konteks multi-kasir dan quick switch employee. Employee baru yang belum punya PIN perlu diarahkan untuk membuat PIN. Employee yang sudah punya PIN perlu bisa mengganti PIN dengan aman, tetapi hanya setelah berhasil memverifikasi PIN saat ini.

## 2. Tujuan

1. Menghilangkan label menu utama `Keamanan PIN` dari Settings cashier.
2. Menampilkan aksi PIN yang tepat berdasarkan status PIN employee authenticated.
3. Memudahkan employee yang belum punya PIN untuk membuat PIN dari Settings.
4. Memungkinkan employee yang sudah punya PIN untuk mengatur ulang PIN melalui verifikasi PIN lama lebih dulu.
5. Memastikan reset PIN tidak bisa dilakukan ketika PIN lama salah.
6. Memastikan state auth employee tetap konsisten setelah setup atau reset PIN berhasil.
7. Menjadi brief yang jelas untuk penyusun implementation plan frontend dan backend.

## 3. Aktor

1. `cashier employee`
   Employee yang sedang authenticated di Cashier App dan membuka menu Settings.
2. `cashier app`
   Aplikasi yang membaca status PIN employee dari auth state, menampilkan label menu yang sesuai, mengarahkan user ke flow setup atau reset, dan memperbarui state auth setelah berhasil.
3. `backend`
   Sistem yang menyimpan hash PIN, memvalidasi PIN lama saat reset, membuat PIN baru, dan mengembalikan employee auth resource yang konsisten.
4. `owner` atau `admin`
   Pihak yang menangani pemulihan akses jika employee lupa PIN. Recovery lupa PIN berada di luar scope user need ini.

## 4. Konteks Sistem Saat Ini

Konteks produk dan teknis yang relevan:

1. Cashier App sudah memiliki konsep employee authenticated.
2. Auth state employee perlu menyediakan status apakah employee sudah memiliki PIN, misalnya melalui `Authenticated.employee.hasPin` atau properti setara.
3. Flow setup PIN existing boleh direuse, terutama pola `SetupPinScreen -> ConfirmPinScreen`.
4. Endpoint setup PIN existing seperti `pin/setup` menolak employee yang sudah memiliki PIN, sehingga tidak cukup untuk kebutuhan reset PIN.
5. Flow verify PIN untuk switch employee tidak boleh otomatis dijadikan endpoint reset PIN penuh jika endpoint tersebut menerbitkan token, mengganti session, atau memiliki side effect switch yang tidak relevan.
6. Settings cashier saat ini perlu mengubah entry point PIN dari info pasif menjadi aksi setup atau reset.

## 5. Scope Kebutuhan

Scope utama:

1. Label menu PIN pada Settings cashier mengikuti status PIN employee.
2. Employee tanpa PIN dapat membuka flow pembuatan PIN baru dari Settings.
3. Employee dengan PIN dapat membuka flow reset PIN dari Settings.
4. Reset PIN meminta PIN saat ini sebelum menampilkan input PIN baru.
5. Reset PIN hanya mengganti PIN jika PIN saat ini benar dan konfirmasi PIN baru valid.
6. Auth employee state diperbarui setelah setup atau reset berhasil.
7. Backend menyediakan kontrak reset PIN authenticated yang tidak membocorkan hash PIN.

Di luar scope:

1. Flow `Lupa PIN`.
2. Reset PIN oleh owner/admin dari dashboard.
3. Perubahan konsep PIN untuk customer app.
4. Perubahan flow quick switch employee di luar kebutuhan reset PIN dari Settings.
5. Redesign menyeluruh halaman Settings.
6. Perubahan aturan panjang PIN selain mengikuti validasi existing.

## 6. Kebutuhan Data

Settings item wajib membaca status PIN dari auth state employee yang reliable.

Sumber data yang boleh dipakai:

1. `Authenticated.employee.hasPin`.
2. Field setara di employee auth model yang berasal dari response login, me/profile, setup PIN, atau reset PIN.
3. Auth state yang sudah di-refresh dari backend dan menjadi sumber kebenaran session employee aktif.

Sumber data yang tidak boleh dipakai sebagai sumber utama:

1. Local UI flag sementara.
2. Tebakan dari route sebelumnya.
3. Status dari remembered account yang belum disinkronkan dengan session aktif.
4. Response verify PIN switch jika response tersebut tidak menjadi auth resource employee aktif yang konsisten.

Jika status PIN belum tersedia atau tidak reliable, implementation plan harus menentukan fallback yang aman. Default yang direkomendasikan adalah tidak menampilkan aksi reset berbasis asumsi dan melakukan refresh auth state lebih dulu.

## 7. Kebutuhan UX Settings

### 7.1 Employee Belum Punya PIN

Jika employee authenticated belum memiliki PIN:

1. Settings menampilkan item `Setting PIN`.
2. Menu utama tidak memakai label `Keamanan PIN`.
3. Saat item diklik, user diarahkan ke flow setup PIN.
4. User memasukkan PIN baru.
5. User mengonfirmasi PIN baru.
6. Jika setup berhasil, user mendapat feedback sukses yang jelas.
7. Setelah setup berhasil, auth state employee diperbarui sehingga `hasPin` menjadi `true`.

### 7.2 Employee Sudah Punya PIN

Jika employee authenticated sudah memiliki PIN:

1. Settings menampilkan item `Atur Ulang PIN`.
2. Menu utama tidak memakai label `Keamanan PIN`.
3. Saat item diklik, user diarahkan ke screen input PIN saat ini.
4. Form PIN baru tidak boleh ditampilkan sebelum PIN saat ini berhasil diverifikasi.
5. Jika PIN saat ini benar, user lanjut ke input PIN baru.
6. User mengonfirmasi PIN baru.
7. Jika reset berhasil, user mendapat feedback sukses yang jelas.
8. Setelah reset berhasil, auth state employee tetap authenticated dan `hasPin` tetap `true`.

### 7.3 Copy Utama

Copy menu utama yang wajib dipakai:

1. `Setting PIN` untuk employee yang belum punya PIN.
2. `Atur Ulang PIN` untuk employee yang sudah punya PIN.

Copy yang harus dihindari sebagai label menu utama:

1. `Keamanan PIN`.

Implementation plan boleh menentukan copy pendukung seperti judul screen, helper text, error message, dan success message, selama tidak mengubah dua label utama di atas.

## 8. Flow Setup PIN

Flow setup PIN berlaku untuk employee authenticated yang belum punya PIN.

Perilaku yang diharapkan:

1. User membuka Settings.
2. User melihat item `Setting PIN`.
3. User tap item tersebut.
4. User masuk ke screen input PIN baru.
5. User mengisi PIN baru sesuai validasi existing.
6. User masuk ke screen konfirmasi PIN.
7. User mengisi konfirmasi PIN yang sama.
8. Aplikasi mengirim request setup PIN.
9. Jika berhasil, backend mengembalikan employee auth resource yang konsisten.
10. Aplikasi memperbarui auth state employee.
11. User kembali ke Settings atau mendapat feedback sukses yang jelas sesuai desain final.

Jika konfirmasi PIN tidak cocok, PIN tidak boleh berubah dan user harus melihat error yang jelas.

## 9. Flow Atur Ulang PIN

Flow reset PIN berlaku untuk employee authenticated yang sudah punya PIN.

Perilaku yang diharapkan:

1. User membuka Settings.
2. User melihat item `Atur Ulang PIN`.
3. User tap item tersebut.
4. User masuk ke screen input PIN saat ini.
5. User mengisi PIN saat ini.
6. Aplikasi memvalidasi PIN saat ini melalui flow reset yang aman.
7. Jika PIN saat ini salah, user tetap berada di verifikasi PIN saat ini.
8. Jika PIN saat ini benar, user lanjut ke screen input PIN baru.
9. User mengisi PIN baru.
10. User mengonfirmasi PIN baru.
11. Aplikasi mengirim request reset PIN.
12. Jika berhasil, backend mengganti hash PIN dan mengembalikan employee auth resource yang konsisten.
13. Aplikasi memperbarui auth state employee.
14. User kembali ke Settings atau mendapat feedback sukses yang jelas sesuai desain final.

PIN lama salah tidak boleh membuka form PIN baru, tidak boleh mengubah PIN, dan harus menampilkan error yang jelas.

## 10. Validasi dan Aturan Bisnis

1. PIN tetap mengikuti validasi existing, default 6 digit numerik.
2. Setup PIN hanya berlaku untuk employee authenticated yang belum punya PIN.
3. Reset PIN hanya berlaku untuk employee authenticated yang sudah punya PIN.
4. Reset PIN wajib memvalidasi `current_pin` sebelum PIN baru diterima.
5. PIN lama salah harus menghasilkan error dan tidak mengubah data.
6. Konfirmasi PIN baru tidak cocok harus menghasilkan error dan tidak mengubah data.
7. PIN tidak boleh tampil sebagai plain text di log, analytics, error message, local storage, atau response API.
8. Response API tidak boleh membocorkan `pin_hash` atau field penyimpanan sensitif sejenis.
9. Setelah setup berhasil, status auth employee harus menunjukkan `hasPin=true`.
10. Setelah reset berhasil, status auth employee harus tetap authenticated dan `hasPin=true`.
11. Kegagalan jaringan atau backend tidak boleh membuat UI menganggap PIN sudah berubah.
12. Back navigation dari flow setup/reset harus ditentukan oleh plan, tetapi tidak boleh menghasilkan state `hasPin` palsu.

## 11. Kebutuhan Backend

Backend perlu mendukung reset PIN authenticated karena endpoint setup existing menolak employee yang sudah punya PIN.

Kontrak reset PIN minimum:

1. Request membawa `current_pin`.
2. Request membawa `pin`.
3. Request membawa `pin_confirmation`.
4. Request hanya bisa dipakai oleh employee yang sedang authenticated.
5. Backend memvalidasi PIN saat ini sebelum mengganti PIN.
6. Backend memvalidasi PIN baru dan konfirmasi PIN baru.
7. Response mengembalikan employee auth resource yang konsisten dengan login/me.
8. Response tetap mengirim field yang dibutuhkan app seperti `hasPin`, `accessibleOutlets`, dan `allPermissions`.
9. Response tidak mengirim `pin_hash`.

Endpoint verify PIN switch tidak boleh dipakai sebagai pengganti penuh reset PIN jika endpoint tersebut menerbitkan token baru, mengganti session aktif, atau menjalankan side effect switch employee. Implementation plan perlu memisahkan tanggung jawab verify switch dan reset PIN authenticated.

## 12. Error dan Feedback

Error yang harus ditangani:

1. PIN saat ini salah.
2. PIN baru tidak valid.
3. Konfirmasi PIN baru tidak cocok.
4. Employee belum authenticated.
5. Employee tidak sesuai dengan kondisi flow, misalnya reset saat `hasPin=false`.
6. Koneksi gagal.
7. Backend error.

Feedback sukses yang dibutuhkan:

1. Setup PIN berhasil.
2. Reset PIN berhasil.

Feedback sukses boleh berupa snackbar, toast, dialog, atau kembali ke Settings dengan pesan yang jelas. Implementation plan menentukan pola final mengikuti design system app.

## 13. Acceptance Criteria

1. Given employee belum punya PIN, when membuka Settings, then item PIN tampil sebagai `Setting PIN`.
2. Given employee belum punya PIN, when item diklik, then user masuk flow buat PIN dan konfirmasi PIN.
3. Given employee sudah punya PIN, when membuka Settings, then item PIN tampil sebagai `Atur Ulang PIN`.
4. Given employee sudah punya PIN, when item diklik, then user diminta memasukkan PIN saat ini.
5. Given PIN saat ini salah, when submit, then user tetap di verifikasi PIN dan PIN tidak berubah.
6. Given PIN saat ini benar, when submit, then user lanjut ke form PIN baru dan konfirmasi PIN.
7. Given konfirmasi PIN baru tidak cocok, then PIN tidak berubah dan error ditampilkan.
8. Given setup PIN berhasil, then user mendapat feedback sukses, auth state employee terbarui, dan `hasPin=true`.
9. Given reset PIN berhasil, then user mendapat feedback sukses dan status auth tetap authenticated.
10. Given reset PIN berhasil, then auth state employee tetap memiliki `hasPin=true`.
11. Menu utama Settings tidak lagi memakai label `Keamanan PIN`.
12. Response setup/reset PIN tidak membocorkan `pin_hash`.

## 14. Test Plan

Widget dan navigation test Cashier App:

1. Settings untuk `hasPin=false` menampilkan `Setting PIN`.
2. Settings untuk `hasPin=true` menampilkan `Atur Ulang PIN`.
3. Navigation test `Setting PIN` membuka setup PIN flow.
4. Navigation test `Atur Ulang PIN` membuka verifikasi PIN lama lebih dulu.
5. Flow test PIN lama salah tidak membuka form PIN baru.
6. Flow test PIN lama benar membuka form PIN baru dan konfirmasi.
7. Flow test konfirmasi PIN baru tidak cocok menampilkan error dan tidak mengirim update berhasil.
8. Flow test setup PIN berhasil memperbarui auth state menjadi `hasPin=true`.
9. Flow test reset PIN berhasil menjaga auth state authenticated dan `hasPin=true`.

Backend/API test:

1. Reset PIN menolak `current_pin` salah.
2. Reset PIN berhasil mengganti hash PIN.
3. Reset PIN tidak membocorkan `pin_hash`.
4. Reset PIN response tetap mengirim `hasPin`.
5. Reset PIN response tetap mengirim `accessibleOutlets`.
6. Reset PIN response tetap mengirim `allPermissions`.
7. Setup PIN existing tetap menolak employee yang sudah punya PIN jika aturan existing memang demikian.

## 15. Non-Goals

1. Membuat flow `Lupa PIN`.
2. Membuat recovery PIN mandiri lewat OTP.
3. Membuat owner/admin reset PIN dari dashboard.
4. Mengubah quick switch employee secara menyeluruh.
5. Mengubah login username/password employee.
6. Menyimpan PIN plain text untuk alasan apa pun.
7. Menentukan nama final endpoint, route, class, widget, atau cubit di dokumen user need ini.

## 16. Assumptions

1. Nama file user need ini adalah `docs/user_need/cashier_setting_pin_reset_user_need.md`.
2. Label bahasa Indonesia yang dipakai persis: `Setting PIN` dan `Atur Ulang PIN`.
3. PIN tetap 6 digit numerik mengikuti validasi existing.
4. Employee yang membuka Settings sudah authenticated.
5. Auth employee model dapat atau akan memiliki status PIN reliable seperti `hasPin`.
6. Setup PIN boleh reuse flow existing `SetupPinScreen -> ConfirmPinScreen`.
7. Reset PIN membutuhkan verifikasi PIN lama lebih dulu, lalu input PIN baru dan konfirmasi PIN baru.
8. Default recovery untuk lupa PIN dilakukan melalui owner/admin atau kebutuhan terpisah.

## 17. Catatan untuk Penyusun Implementation Plan

1. Rancang perubahan Settings sebagai menu action-oriented, bukan halaman info pasif.
2. Pastikan planner mengecek sumber status `hasPin` di auth state employee dan response backend terkait.
3. Pastikan planner tidak memakai endpoint verify PIN switch sebagai reset PIN jika endpoint tersebut punya side effect token/session.
4. Pastikan planner memasukkan backend reset PIN authenticated karena setup existing tidak cukup untuk employee yang sudah punya PIN.
5. Pastikan planner memasukkan update auth state setelah setup/reset berhasil.
6. Pastikan planner memasukkan test frontend dan backend agar label, navigasi, validasi, response auth resource, dan keamanan response terjaga.
7. Jangan mengubah scope menjadi recovery `Lupa PIN`; buat user need terpisah jika stakeholder meminta fitur tersebut.

## Status

Draft user need siap dipakai sebagai acuan penyusunan implementation plan.
