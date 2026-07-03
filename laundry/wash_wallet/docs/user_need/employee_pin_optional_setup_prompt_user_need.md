# User Need: Optional Prompt Setup PIN Employee Cashier dan Production

Tanggal: 2026-06-28

Dokumen ini menjadi acuan user need untuk AI model lain saat menyusun implementation plan. Fokus dokumen ini adalah perubahan produk pada flow employee setelah login atau restore session: employee yang belum memiliki PIN tidak lagi langsung dipaksa masuk form setup PIN, tetapi melihat interstitial opsional yang mendorong setup PIN dan tetap memberi pilihan masuk ke Home untuk session aplikasi saat ini. Detail final seperti nama state, nama route, komponen UI, struktur cubit/provider, dan test implementation ditentukan pada dokumen plan.

## 1. Latar Belakang

Employee baru yang dibuat owner dapat berhasil login sebelum memiliki PIN. PIN dipakai untuk kebutuhan operasional seperti quick switch employee, re-auth session, dan keamanan akses cepat pada perangkat yang sama.

Saat ini Cashier App sudah memiliki flow PIN yang memaksa employee tanpa PIN untuk langsung membuat PIN. Perilaku ini aman untuk quick switch, tetapi terlalu mengunci operasional jika employee perlu segera masuk Home. Production App memakai employee auth yang sama, tetapi belum memiliki flow setup PIN sehingga belum setara dengan Cashier.

Kebutuhan baru adalah membuat setup PIN menjadi prompt opsional:

1. Jika login employee berhasil dan response auth menyatakan `hasPin=false`, aplikasi menampilkan layar `PIN Anda belum disetting`.
2. User dapat memilih `Setting sekarang` untuk membuat PIN melalui flow setup yang sudah ada atau flow shared yang setara.
3. User dapat memilih `Lewati` untuk masuk Home pada session aplikasi saat ini tanpa mengubah status PIN backend.
4. Jika aplikasi dibuka ulang, login ulang, atau bootstrap token melalui `/auth/me` kembali berhasil dengan `hasPin=false`, prompt muncul lagi.

## 2. Tujuan

1. Mengurangi hambatan operasional untuk employee baru yang belum sempat membuat PIN.
2. Tetap mendorong employee membuat PIN karena PIN dibutuhkan untuk quick switch dan keamanan session.
3. Menjaga status `hasPin` sebagai sumber kebenaran dari backend, bukan dari flag UI lokal permanen.
4. Membuat Cashier dan Production memiliki perilaku PIN employee yang setara.
5. Memastikan access denied atau no-permission tetap lebih prioritas daripada prompt PIN.
6. Memastikan notifikasi, FCM, dan session startup tetap berjalan saat user memilih `Lewati` dan masuk Home.
7. Menjadi brief yang jelas untuk implementation plan frontend dan backend.

## 3. Aktor

1. `cashier employee`
   Employee yang login ke Cashier App dan belum memiliki PIN.
2. `production employee`
   Employee yang login ke Production App dan belum memiliki PIN.
3. `cashier app`
   Aplikasi yang saat ini sudah memiliki state `AuthSetupPinRequired`, route `/setup-pin`, dan flow setup PIN.
4. `production app`
   Aplikasi yang memakai auth employee tetapi belum memiliki flow setup PIN.
5. `backend`
   Sistem yang menyimpan hash PIN, mengirim field `hasPin`, dan menyediakan endpoint setup/verify/reset PIN employee.
6. `owner` atau `admin`
   Pihak yang membuat akun employee dan mengatur permission employee.

## 4. Konteks Sistem Saat Ini

### 4.1 Cashier App

Konteks yang relevan dari Cashier App:

1. `apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart` memiliki `_handleAuthSuccess()`.
2. `_handleAuthSuccess()` saat ini mengecek permission terlebih dahulu, lalu jika `employee.hasPin == false` mengemit `AuthSetupPinRequired(employee)`.
3. `apps/cashier/lib/features/auth/presentation/bloc/auth_state.dart` memiliki state `AuthSetupPinRequired`.
4. `apps/cashier/lib/core/router/app_router.dart` mengarahkan `AuthSetupPinRequired` ke `/setup-pin`.
5. Flow setup existing adalah `SetupPinScreen -> ConfirmPinScreen -> AuthCubit.setupPin()`.
6. Setelah `setupPin()` berhasil, response employee dipakai untuk auth state baru dan user masuk Home jika permission valid.
7. Settings Cashier tetap memiliki entry point PIN, termasuk setup/reset PIN. Kemampuan ini tidak boleh dihapus.
8. Cashier sudah memiliki remembered employee account dan PIN entry untuk switch. Employee yang belum punya PIN tidak boleh dianggap siap untuk PIN entry sampai setup berhasil.
9. Cashier juga memiliki startup notifikasi/FCM saat auth sukses. Perilaku ini harus tetap berjalan setelah user memilih `Lewati`.

Perilaku existing yang perlu berubah:

1. Employee `hasPin=false` tidak boleh langsung masuk form setup PIN.
2. Employee `hasPin=false` harus melihat prompt opsional lebih dulu.
3. Home tidak lagi diblokir penuh oleh setup PIN, selama employee memilih `Lewati` dan permission valid.

### 4.2 Production App

Konteks yang relevan dari Production App:

1. `apps/production/lib/features/auth/presentation/bloc/auth_state.dart` saat ini hanya memiliki state utama seperti `Authenticated`, `Unauthenticated`, dan `AuthFailureState`.
2. `apps/production/lib/features/auth/presentation/providers/auth_provider.dart` belum membuat `SetupPinUseCase`, `VerifyPinUseCase`, atau `ResetPinUseCase`.
3. `apps/production/lib/features/auth/presentation/bloc/auth_cubit.dart` langsung mengemit `Authenticated(employee)` saat login, `checkAuthStatus()`, atau `refreshMe()` berhasil.
4. Production sudah menjalankan startup notifikasi/FCM/Pusher di `_onAuthenticated(employee)`.
5. Production router sudah memiliki no-permission flow berdasarkan permission produksi/kurir.
6. Production belum memiliki screen setup/confirm PIN yang setara dengan Cashier.

Perilaku yang perlu ditambah:

1. Production harus membaca kontrak `employee.hasPin` yang sama dengan Cashier.
2. Production harus memiliki prompt opsional yang sama saat login atau `/auth/me` berhasil dengan `hasPin=false`.
3. Production harus memiliki flow setup PIN, baik dengan reuse komponen shared maupun implementasi yang konsisten dengan Cashier.
4. Production tetap harus menjalankan startup notifikasi/FCM/Pusher saat user memilih `Lewati` dan masuk Home.

### 4.3 Backend Mobile Routes

Konteks route backend saat ini:

1. `webapp/wash_wallet_be/routes/api_mobile_cashier.php` memiliki route employee auth untuk login, logout, validate, me, `pin/setup`, `pin/reset`, dan `pin/verify`.
2. `webapp/wash_wallet_be/routes/api_mobile_production.php` memiliki route employee auth untuk login, logout, validate, dan me, tetapi belum mengekspos route PIN.
3. `EmployeeAuthController` sudah memiliki method `setupPin()`, `resetPin()`, dan `verifyPin()`.
4. Jika Production akan memakai endpoint auth PIN yang sama melalui prefix production, backend perlu menambah route PIN parity untuk Production.

## 5. Scope Kebutuhan

Scope utama:

1. Prompt opsional untuk employee authenticated dengan `hasPin=false`.
2. Prompt muncul setelah login password berhasil.
3. Prompt muncul setelah bootstrap token atau `/auth/me` berhasil dengan `hasPin=false`.
4. Prompt muncul di Cashier dan Production.
5. Tombol `Setting sekarang` membuka flow setup/confirm PIN.
6. Tombol `Lewati` memasukkan user ke Home untuk session aplikasi saat ini.
7. Setup PIN sukses memperbarui auth employee menjadi `hasPin=true`.
8. Access denied atau no-permission tetap menang atas prompt PIN.
9. Remembered account tetap koheren terhadap status `hasPin`.
10. Notification, FCM, dan realtime session startup tetap berjalan saat user masuk Home lewat `Lewati`.

Di luar scope:

1. Menghapus setup/reset PIN dari Settings Cashier.
2. Mengubah panjang PIN dari aturan existing 6 digit numerik.
3. Membuat PIN wajib untuk semua employee sebelum masuk Home.
4. Membuat recovery `Lupa PIN`.
5. Mengubah credential utama login username/password.
6. Menyimpan pilihan `Lewati` sebagai preferensi jangka panjang.
7. Redesign menyeluruh Cashier App atau Production App.

## 6. Aturan Bisnis

### 6.1 Sumber Kebenaran Status PIN

Status PIN employee harus berasal dari auth employee backend:

1. Response login.
2. Response `/auth/me`.
3. Response setup PIN.
4. Response reset PIN.
5. Field setara dengan `AuthEmployee.hasPin`.

Status PIN tidak boleh ditentukan dari:

1. Local UI flag permanen.
2. Tebakan berdasarkan route terakhir.
3. Pilihan `Lewati` pada session sebelumnya.
4. Remembered account yang belum disinkronkan dengan auth employee aktif.

### 6.2 Prioritas Auth dan Permission

Urutan keputusan setelah login atau `/auth/me` berhasil harus menjaga prinsip berikut:

1. Jika employee tidak memiliki permission aplikasi yang dibutuhkan, tampilkan access denied atau no-permission.
2. Jika employee memiliki permission valid dan `hasPin=false`, tampilkan prompt opsional PIN.
3. Jika employee memiliki permission valid dan `hasPin=true`, lanjut ke Home atau route tujuan.
4. Prompt PIN tidak boleh dipakai untuk menggantikan state failure, unauthenticated, access denied, atau no-permission.
5. State prompt PIN harus berbeda dari hard auth failure agar router dan UI tidak salah memperlakukan kondisi ini sebagai login gagal.

### 6.3 Makna `Lewati`

`Lewati` adalah keputusan session-only.

Aturan yang diharapkan:

1. `Lewati` memasukkan employee ke Home tanpa mengirim request setup PIN.
2. `Lewati` tidak mengubah `hasPin` di backend.
3. `Lewati` tidak membuat remembered account dianggap memiliki PIN.
4. `Lewati` berlaku hanya selama app session saat ini masih berjalan.
5. Setelah app restart, cold start, login ulang, atau bootstrap token `/auth/me`, jika backend masih mengirim `hasPin=false`, prompt muncul lagi.
6. Implementation plan boleh menentukan bentuk flag runtime untuk menandai prompt sudah dilewati pada session saat ini, tetapi flag tersebut tidak boleh bertahan untuk hari/jam berikutnya.

### 6.4 Makna `Setting sekarang`

`Setting sekarang` membawa user ke flow pembuatan PIN.

Aturan yang diharapkan:

1. Cashier boleh menggunakan flow existing `SetupPinScreen -> ConfirmPinScreen`.
2. Production harus memiliki flow setara, baik memakai komponen shared maupun screen Production khusus.
3. User memasukkan PIN 6 digit numerik.
4. User mengonfirmasi PIN.
5. Jika setup berhasil, backend mengembalikan employee auth resource yang menyatakan `hasPin=true`.
6. Auth state harus diperbarui dari response setup sukses.
7. User lanjut ke intended route atau Home setelah setup berhasil.
8. Jika setup gagal, user tetap belum dianggap memiliki PIN.

## 7. Kebutuhan UX

### 7.1 Layar Prompt

Layar prompt harus menjadi interstitial setelah auth valid dan permission valid.

Copy utama yang wajib dipakai:

1. Title: `PIN Anda belum disetting`
2. Primary button: `Setting sekarang`
3. Secondary button: `Lewati`

Copy pendukung yang direkomendasikan:

1. Jelaskan bahwa PIN membantu masuk atau switch akun lebih cepat di perangkat ini.
2. Jelaskan bahwa user tetap bisa melanjutkan operasional sekarang.
3. Hindari membuat user merasa login gagal.

Contoh body copy yang boleh dipakai atau disesuaikan:

`Buat PIN 6 digit agar akses dan pergantian akun di perangkat ini lebih cepat. Anda tetap bisa melanjutkan pekerjaan sekarang dan mengatur PIN nanti.`

### 7.2 Flow `Lewati`

Jika user memilih `Lewati`:

1. App masuk Home atau intended route yang aman.
2. Auth state tetap membawa employee yang sama dengan `hasPin=false`.
3. Startup notification/FCM/realtime tetap dipanggil seperti auth sukses normal.
4. Settings tetap menampilkan entry point setup PIN untuk employee yang belum punya PIN.
5. Quick switch atau PIN entry tidak boleh tersedia untuk account tersebut sampai PIN dibuat.

### 7.3 Flow `Setting sekarang`

Jika user memilih `Setting sekarang`:

1. App membuka screen input PIN baru.
2. App membuka screen confirm PIN.
3. App memanggil endpoint setup PIN.
4. Jika berhasil, app memperbarui auth employee menjadi `hasPin=true`.
5. App masuk Home atau route tujuan.
6. Jika gagal, app menampilkan error validasi/network yang jelas dan tidak mengubah status PIN lokal menjadi true.

### 7.4 Back, Logout, dan Restart

Implementation plan perlu menentukan detail navigasi, tetapi perilaku produk minimum adalah:

1. Back dari prompt tidak boleh membuat route loop atau blank screen.
2. User harus tetap punya cara logout jika tidak ingin melanjutkan.
3. Jika prompt ditutup dengan `Lewati`, prompt tidak muncul berulang-ulang dalam session aplikasi yang sama.
4. Jika aplikasi restart dan `/auth/me` kembali sukses dengan `hasPin=false`, prompt muncul lagi.
5. Jika user logout lalu login lagi dengan employee yang sama dan `hasPin=false`, prompt muncul lagi.

## 8. Kebutuhan Cashier App

Cashier App perlu mengubah perilaku yang saat ini hard-block setup PIN.

Kebutuhan:

1. `_handleAuthSuccess()` tidak boleh langsung memaksa employee `hasPin=false` ke `/setup-pin`.
2. Setelah permission cashier valid, employee `hasPin=false` masuk state prompt opsional.
3. Router mengarahkan state prompt opsional ke layar interstitial baru, bukan langsung ke form setup PIN.
4. `Setting sekarang` membuka flow setup existing.
5. `Lewati` mengubah state menjadi kondisi authenticated untuk session saat ini tanpa mengubah `employee.hasPin`.
6. `_startNotificationSession(employee)` atau mekanisme setara tetap berjalan setelah `Lewati`.
7. `AuthAccessDenied` tetap lebih prioritas daripada prompt PIN.
8. Settings PIN existing tetap tersedia dan tetap membaca `employee.hasPin`.
9. Remembered account dengan `hasPin=false` tetap tidak boleh membuka PIN entry untuk switch.

Catatan untuk planner:

1. Nama state baru tidak ditentukan oleh user need ini. Contoh yang dapat dipertimbangkan adalah state prompt PIN opsional yang berbeda dari `AuthSetupPinRequired`.
2. `AuthSetupPinRequired` existing boleh diubah maknanya, diganti, atau dipertahankan untuk flow internal setup, selama perilaku produk terpenuhi.
3. Router harus menghindari redirect loop antara prompt, setup PIN, confirm PIN, Home, dan re-auth PIN.

## 9. Kebutuhan Production App

Production App perlu mencapai parity dengan Cashier untuk status PIN employee.

Kebutuhan:

1. Auth state Production perlu memiliki kondisi prompt PIN opsional atau mekanisme setara.
2. Auth provider Production perlu menyediakan dependency setup PIN jika flow setup memakai use case domain yang sama.
3. Production perlu screen prompt `PIN Anda belum disetting`.
4. Production perlu screen setup/confirm PIN atau reuse flow shared.
5. Login sukses dengan `hasPin=false` menampilkan prompt setelah permission production/courier valid.
6. `/auth/me` atau bootstrap token sukses dengan `hasPin=false` menampilkan prompt setelah permission valid.
7. `Lewati` harus tetap memanggil `_onAuthenticated(employee)` atau mekanisme startup yang setara agar notification, FCM token, courier outlet ids, dan Pusher tetap aktif.
8. No-permission Production tetap lebih prioritas daripada prompt PIN.
9. Jika Production memakai endpoint auth PIN dari prefix production, backend perlu menambah route `pin/setup`, dan bila flow lain diperlukan route `pin/reset` dan `pin/verify` juga perlu dipertimbangkan agar parity terjaga.

## 10. Kebutuhan Backend dan API

Cashier tidak membutuhkan perubahan backend besar untuk optional prompt selama endpoint setup existing tetap bekerja dan response auth tetap membawa `hasPin`.

Kebutuhan backend minimum:

1. Response login employee tetap mengirim status PIN, misalnya `hasPin`.
2. Response `/auth/me` tetap mengirim status PIN.
3. Response setup PIN mengirim employee auth resource terbaru dengan `hasPin=true`.
4. Response tidak boleh membocorkan `pin_hash`.
5. Endpoint setup PIN tetap menolak input tidak valid dan tidak mengubah PIN saat gagal.

Kebutuhan Production parity:

1. Production route saat ini belum mengekspos route PIN di prefix `mobile/production/auth`.
2. Jika Production menggunakan shared mobile auth datasource dengan endpoint berdasarkan prefix production, backend perlu menambah route setup PIN untuk Production.
3. Jika Production juga akan mendukung reset PIN dari settings atau verify PIN untuk session/switch, route reset/verify juga perlu dibuat parity.
4. Middleware harus sesuai dengan karakter endpoint: setup/reset memakai authenticated employee, verify PIN untuk switch perlu mempertimbangkan throttle dan side effect token seperti Cashier.

## 11. Remembered Account dan PIN Entry

Remembered account harus tetap konsisten dengan status PIN.

Aturan:

1. Account dengan `hasPin=false` boleh tersimpan sebagai remembered account jika login password berhasil.
2. Account dengan `hasPin=false` tidak boleh menawarkan PIN entry untuk quick switch.
3. Jika user memilih account remembered yang belum punya PIN, app harus meminta login password atau mengarahkan ke flow yang ditentukan plan, bukan meminta PIN yang belum ada.
4. Setelah setup PIN sukses, remembered account boleh diperbarui menjadi `hasPin=true`.
5. `Lewati` tidak boleh memperbarui remembered account menjadi `hasPin=true`.
6. Jika `/auth/me` terbaru menyatakan `hasPin=false`, data lokal yang menyatakan true harus disinkronkan atau dianggap stale sesuai keputusan plan.

## 12. Edge Case

1. Login berhasil, permission tidak valid, `hasPin=false`:
   Tampilkan access denied atau no-permission, bukan prompt PIN.
2. Login berhasil, permission valid, `hasPin=false`:
   Tampilkan prompt PIN opsional.
3. Token bootstrap berhasil, permission valid, `hasPin=false`:
   Tampilkan prompt PIN opsional kecuali user sudah memilih `Lewati` dalam session runtime yang sama.
4. User memilih `Lewati`, lalu membuka Settings:
   Settings tetap menawarkan setup PIN karena `hasPin=false`.
5. User memilih `Setting sekarang`, lalu jaringan gagal:
   Tetap di flow setup dengan error, status PIN tidak berubah.
6. Setup PIN sukses tetapi response tidak membawa `hasPin=true`:
   Plan harus menentukan fallback aman, misalnya refresh `/auth/me` sebelum masuk Home.
7. User menutup app setelah memilih `Lewati`:
   Pada cold start berikutnya, prompt muncul lagi jika `/auth/me` mengirim `hasPin=false`.
8. Employee dinonaktifkan setelah memilih `Lewati`:
   Bootstrap berikutnya harus gagal atau masuk unauthenticated sesuai auth existing.
9. Permission dicabut setelah memilih `Lewati`:
   Refresh atau bootstrap berikutnya harus mengarah ke no-permission/access denied.
10. Re-auth stale dan prompt PIN opsional sama-sama mungkin terjadi:
    Plan perlu menentukan prioritas, tetapi tidak boleh meminta user memasukkan PIN untuk re-auth jika employee belum punya PIN.

## 13. Acceptance Criteria

1. Cashier login dengan `hasPin=false` menampilkan layar `PIN Anda belum disetting`, bukan langsung form setup PIN.
2. Cashier user memilih `Lewati` dan berhasil masuk Home.
3. Cashier app restart dengan token valid dan `/auth/me` mengembalikan `hasPin=false`, lalu prompt muncul lagi.
4. Cashier user memilih `Setting sekarang`, menyelesaikan setup PIN, lalu masuk Home dengan auth employee `hasPin=true`.
5. Cashier Settings tetap memiliki kemampuan setup/reset PIN sesuai status employee.
6. Production login dengan `hasPin=false` mengikuti prompt behavior yang sama.
7. Production `/auth/me` bootstrap dengan `hasPin=false` mengikuti prompt behavior yang sama.
8. Employee dengan `hasPin=true` langsung masuk Home atau route tujuan tanpa prompt.
9. Employee tanpa permission tetap melihat access denied atau no-permission, bukan prompt PIN.
10. `Lewati` tidak mengubah backend PIN state.
11. Remembered account `hasPin=false` tidak dapat memakai PIN entry sampai setup sukses.
12. Notification/FCM/realtime startup tetap berjalan saat user memilih `Lewati` dan masuk Home.

## 14. Test Scenario yang Perlu Dicakup

### 14.1 Cashier

1. Given login Cashier sukses dengan `hasPin=false`, when auth success diproses, then app menampilkan prompt opsional.
2. Given prompt opsional tampil, when user tap `Lewati`, then app masuk Home.
3. Given user sudah tap `Lewati`, when masih di app session yang sama, then prompt tidak muncul berulang pada navigasi Home biasa.
4. Given app cold start dengan token valid dan `/auth/me` mengembalikan `hasPin=false`, when bootstrap selesai, then prompt muncul lagi.
5. Given prompt opsional tampil, when user tap `Setting sekarang`, then app membuka setup PIN flow.
6. Given setup PIN sukses, when response employee `hasPin=true`, then auth state menjadi authenticated dan user masuk Home.
7. Given setup PIN gagal, then app tidak mengubah status PIN menjadi true.
8. Given login sukses dengan `hasPin=true`, then app langsung masuk Home.
9. Given login sukses tetapi permission kasir tidak ada, then access denied menang atas prompt PIN.
10. Given remembered account `hasPin=false`, when user memilih quick switch, then app tidak meminta PIN entry untuk account tersebut.

### 14.2 Production

1. Given login Production sukses dengan `hasPin=false`, when permission production/courier valid, then app menampilkan prompt opsional.
2. Given prompt Production tampil, when user tap `Lewati`, then app masuk Home Production.
3. Given user tap `Lewati`, then Production notification/FCM/Pusher startup tetap dijalankan.
4. Given Production cold start dengan token valid dan `/auth/me` mengembalikan `hasPin=false`, then prompt muncul lagi.
5. Given prompt Production tampil, when user tap `Setting sekarang`, then app membuka setup PIN flow Production atau shared flow.
6. Given setup PIN Production sukses, then auth employee menjadi `hasPin=true` dan user masuk Home.
7. Given login Production sukses dengan `hasPin=true`, then app langsung masuk Home.
8. Given login Production sukses tetapi tidak punya permission production maupun courier, then no-permission menang atas prompt PIN.

### 14.3 Backend/API

1. Login employee mengembalikan field status PIN.
2. `/auth/me` mengembalikan field status PIN.
3. Setup PIN sukses mengembalikan employee auth resource dengan `hasPin=true`.
4. Setup PIN gagal tidak mengubah hash PIN.
5. Response auth/setup/reset tidak membocorkan `pin_hash`.
6. Production route PIN tersedia jika app Production memakai prefix production untuk setup PIN.

## 15. Catatan untuk Implementation Plan

Planner perlu memperhatikan hal berikut:

1. Tentukan nama state prompt opsional yang eksplisit dan berbeda dari `AuthFailureState`.
2. Tentukan apakah `AuthSetupPinRequired` di Cashier diubah menjadi optional prompt atau diganti oleh state baru.
3. Tentukan route interstitial baru untuk Cashier dan Production.
4. Tentukan mekanisme session-only untuk menyimpan bahwa user sudah memilih `Lewati` selama runtime saat ini.
5. Pastikan mekanisme `Lewati` tidak persisted ke `SharedPreferences`, secure storage, atau backend.
6. Pastikan notification startup dipanggil saat employee masuk Home lewat `Lewati`.
7. Pastikan access denied/no-permission dievaluasi sebelum prompt PIN.
8. Pastikan Production wiring menambahkan use case dan endpoint setup PIN yang dibutuhkan.
9. Pastikan route backend Production memiliki parity jika datasource Production memanggil prefix production.
10. Pastikan remembered account diperbarui hanya setelah setup PIN sukses, bukan setelah `Lewati`.
11. Pastikan test router mencakup login, `/auth/me`, skip, setup success, access denied, dan app restart/cold start.

## 16. Asumsi

1. `Lewati` bersifat session-only.
2. PIN tetap 6 digit numerik mengikuti validasi existing.
3. Backend employee auth resource sudah atau akan membawa `hasPin` yang reliable.
4. PIN tetap memakai model employee PIN existing dan tidak berlaku untuk customer app.
5. Setup PIN boleh reuse flow existing Cashier `SetupPinScreen -> ConfirmPinScreen`.
6. Production boleh memakai komponen shared jika implementation plan memutuskan refactor shared module.
7. Route dan nama state final tidak ditentukan di dokumen user need ini.

## 17. Ringkasan Akhir

Kebutuhan ini mengubah setup PIN employee dari hard-block menjadi prompt opsional. Employee yang belum punya PIN tetap diingatkan setiap fresh auth bootstrap, tetapi dapat menekan `Lewati` untuk masuk Home pada session saat ini. Cashier perlu mengubah behavior `AuthSetupPinRequired` yang saat ini langsung memaksa `/setup-pin`, sedangkan Production perlu mendapatkan parity flow PIN setup dan backend route parity bila memakai endpoint production. Access denied/no-permission tetap prioritas tertinggi setelah auth sukses, dan pilihan `Lewati` tidak boleh mengubah status PIN backend maupun remembered account menjadi seolah-olah sudah punya PIN.
