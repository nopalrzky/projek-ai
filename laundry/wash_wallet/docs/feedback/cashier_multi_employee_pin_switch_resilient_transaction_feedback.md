# Feedback Review: Cashier Multi Employee PIN Switch dan Resilient Transaction Plan

Tanggal: 2026-06-20

Dokumen yang direview:

- `docs/user_need/cashier_multi_employee_pin_switch_resilient_transaction_user_need.md`
- `docs/plan/cashier_multi_employee_pin_switch_resilient_transaction_plan.md`

## Kesimpulan

Plan sudah menangkap arah produk yang benar: employee login pertama dengan password, setup PIN, remembered accounts, quick switch, draft order/weighing, online-required final action, idempotency, print/WA coin safety, dan notifikasi order baru.

Namun plan perlu direvisi sebelum dijadikan acuan implementasi lanjutan. Kondisi repo saat review sudah berisi banyak implementasi yang di plan masih ditulis sebagai pekerjaan baru. Revisi plan sebaiknya menjadi delta plan: inventarisasi yang sudah ada, lalu fokus pada bug, hardening, dan gap acceptance criteria.

Prioritas utama revisi adalah menjaga session lama tetap aman saat PIN switch gagal, memperbaiki remembered account setelah setup PIN, menentukan active outlet/per-outlet permission secara eksplisit, memperkuat idempotency end-to-end, melengkapi draft recovery, menutup permission gap pada endpoint print/mobile cashier, dan menambah test coverage.

## State Repo Saat Review

Beberapa item yang di plan ditulis sebagai "tambahkan" sudah ada di repo:

- Backend PIN: migration `pin_hash`/`pin_set_at`, `Employee` hidden/casts/fillable, `AuthService::setupPin`, `AuthService::verifyPin`, `SetupPinRequest`, `VerifyPinRequest`, route `/mobile/cashier/auth/pin/setup`, route `/mobile/cashier/auth/pin/verify`, dan `LoginEmployeeResource::hasPin`.
- Backend test PIN dasar sudah ada di `webapp/wash_wallet_be/tests/Feature/EmployeePinAuthTest.php`.
- Flutter auth sudah punya `hasPin`, `AuthSetupPinRequired`, `AuthAccessDenied`, `setupPin`, `verifyPin`, `SetupPinScreen`, `SwitchEmployeeScreen`, `PinEntryScreen`, dan `RememberedEmployeeLocalDatasource`.
- Draft order v2 dan weighing draft sudah ada di domain/data cashier.
- Middleware idempotency dan table `mobile_action_idempotencies` sudah ada.
- Route mutasi order cashier sebagian sudah memakai middleware `idempotent`.
- Print dan WA client sudah mengirim `Client-Request-Id`.
- Notification service sudah memakai Pusher-compatible package, FCM, local notification, sound, badge, dan dedupe berbasis `orderId`.

Masukan:

Revisi plan harus dimulai dengan bagian "State repo saat ini" yang membagi pekerjaan menjadi:

1. Sudah ada dan cukup diverifikasi.
2. Sudah ada tetapi perlu diperbaiki.
3. Belum ada.

Tanpa pembagian ini, model berikutnya berisiko membuat ulang file, menimpa pola existing, atau mengerjakan ulang scope yang sudah selesai.

## Findings

### 1. Plan belum sinkron dengan path dan state kode aktual

Severity: high

Beberapa path pada plan sudah tidak tepat atau sudah berpindah:

- Plan menyebut `app/Http/Resources/Auth/LoginEmployeeResource.php`, sedangkan file aktual ada di `webapp/wash_wallet_be/app/Http/Resources/Employee/LoginEmployeeResource.php`.
- Plan menyebut `apps/cashier/lib/core/storage/secure_token_storage.dart` dan `apps/cashier/lib/core/network/auth_interceptor.dart`, sedangkan implementasi aktual berada di `packages/wash_wallet_core/lib/src/auth/token_storage.dart` dan `packages/wash_wallet_core/lib/src/network/interceptors/auth_interceptor.dart`.
- Plan masih menyebut banyak task sebagai baru, padahal sudah ada implementasi awal.

Masukan:

Perbarui daftar file yang perlu dibaca agar model berikutnya tidak mencari path yang salah. Ubah fase implementasi menjadi fase hardening dan completion, bukan full implementation dari nol.

### 2. Setup PIN tidak memperbarui remembered account

Severity: high

Flow saat ini:

1. Password login sukses.
2. `AuthRepositoryImpl.login()` menyimpan remembered account.
3. Jika employee belum punya PIN, remembered account tersimpan dengan `hasPin=false`.
4. Setelah `setupPin()` sukses, repository hanya menyimpan employee lokal, tetapi tidak memanggil `_rememberedDatasource.saveAccount(employeeModel)`.

Risiko:

Employee yang baru membuat PIN bisa tetap tampil sebagai akun tanpa PIN di switch list sampai login/verify berikutnya. Ini melanggar acceptance criteria bahwa employee yang sudah setup PIN bisa dipakai quick switch.

Masukan:

Tambahkan update remembered account setelah setup PIN sukses. Test yang perlu ditambah: login employee tanpa PIN, setup PIN, buka switch account, akun tersebut tampil dengan `hasPin=true` dan membuka PIN entry, bukan redirect login password.

### 3. PIN switch gagal dapat menghilangkan session aktif lama dari state

Severity: high

`AuthCubit.verifyPin()` langsung emit `AuthLoading`, lalu `AuthFailureState` ketika PIN salah. Router memperlakukan `AuthFailureState` mirip unauthenticated untuk protected route. Padahal user need menegaskan: jika PIN salah, employee aktif tidak berubah.

Risiko:

Saat Employee A sedang aktif lalu user mencoba switch ke Employee B dan PIN salah, UI/auth state dapat kehilangan `Authenticated(Employee A)` walaupun token A belum diganti. Ini bisa mengganggu draft aktif dan membuat user terlempar ke switch flow.

Masukan:

Revisi plan harus menentukan state switch yang mempertahankan current employee, misalnya:

- `SwitchPinVerifying(previousEmployee, targetEmployee)`
- `SwitchPinFailure(previousEmployee, targetEmployee, failure)`
- atau cubit terpisah khusus PIN switch.

Active token dan active employee hanya boleh diganti setelah verify PIN sukses. PIN salah harus mengembalikan UI ke prompt PIN tanpa mengubah session lama.

### 4. Lifecycle token saat switch belum aman dan belum jelas

Severity: high

Backend `loginEmployee()` dan `verifyPin()` memanggil `$employee->tokens()->delete()` untuk target employee. Ini menghapus semua Sanctum token employee tersebut, termasuk token di device lain. Sebaliknya saat device switch dari Employee A ke Employee B, token server milik Employee A tidak dicabut karena verify PIN B tidak tahu token A sebagai session yang sedang diganti.

Risiko:

- Login/switch satu device dapat logout employee target dari device lain.
- Token employee lama bisa tetap valid di server setelah client overwrite token lokal.
- Ini belum sesuai dengan prinsip "data sensitif session employee lama tidak boleh dipakai untuk request employee baru".

Masukan:

Plan revisi harus memilih kebijakan eksplisit:

1. Multi-device allowed: jangan delete semua token employee; revoke hanya token/device tertentu.
2. Single-device per employee: tulis sebagai constraint produk dan tambahkan pesan/QA untuk efek logout device lain.
3. Saat switch sukses, cabut current access token lama jika request verify PIN membawa Authorization token employee aktif lama.

Tambahkan test backend untuk memastikan token employee lama dan token employee target diperlakukan sesuai kebijakan final.

### 5. Active outlet dan permission masih terlalu bergantung pada `employee.outletId`

Severity: high

`LoginEmployeeResource` mengirim `accessibleOutlets` dan `allPermissions`, tetapi Flutter auth memakai `employee.hasOrderViewPermission` dari permission flat. Router, dashboard, Pusher, order list, dan screen lain memakai `employee.outletId` sebagai outlet aktif.

Risiko:

Employee bisa punya `order.view` di outlet B tetapi `employee.outletId` adalah outlet A. Karena `allPermissions` flat, app menganggap employee punya akses cashier, lalu membuka outlet A. Backend `position.permission` dapat menolak request outlet A. Hasilnya UX access granted di frontend tetapi 403 di backend.

Masukan:

Revisi plan harus menetapkan active outlet:

- Jika cashier hanya mendukung outlet utama, maka `hasOrderViewPermission` harus dicek untuk `employee.outletId`, bukan semua outlet.
- Jika cashier mendukung multi-outlet, tambahkan outlet selector/session context dan kirim `X-Outlet-ID` untuk request yang butuh outlet context.
- Pusher/FCM/badge/list harus mengikuti active outlet yang sama.

Acceptance criteria perlu menambahkan employee dengan permission cashier hanya pada outlet non-primary.

### 6. Ada route mobile cashier dan print yang belum cukup terlindungi permission

Severity: high

Pada `routes/api_mobile_cashier.php`, beberapa route masih tidak punya `auth:sanctum` atau `position.permission`, misalnya route `outlets` dan `employees`. Endpoint print global `/orders/{orderId}/print/*` memakai `PrintController` dengan `auth:sanctum`, tetapi tidak terlihat memakai `position.permission` untuk memastikan employee punya akses ke order/outlet tersebut.

Risiko:

Employee authenticated dapat mengakses data/action di luar scope permission jika controller/service tidak melakukan guard tambahan. Print sangat sensitif karena memotong coin.

Masukan:

Revisi plan harus memasukkan audit route mobile cashier:

- Semua route mobile cashier non-public dibungkus `auth:sanctum`.
- Route data master yang dipakai cashier diberi permission sesuai kebutuhan (`service.view`, `customer.view`, `order.view`, dll).
- Print info/process diberi guard per outlet/order, minimal `order.view` untuk info dan `order.manage` atau permission print yang disepakati untuk process.
- Tambahkan test unauthenticated dan wrong-outlet employee untuk print/WA/order routes.

### 7. Idempotency backend belum memenuhi strategi aman untuk duplicate prevention

Severity: high

Middleware idempotency sudah ada, tetapi masih ada gap:

- Payload berbeda dengan `client_request_id` sama belum ditolak 409 secara konsisten. Cabang conflict hanya dikomentari setelah success branch sudah return.
- Business write dan update row idempotency tidak berada dalam satu transaction yang sama.
- Race condition pada unique index belum ditangani eksplisit.
- Jika business action sukses tetapi proses gagal sebelum response body tersimpan ke idempotency row, retry masih bisa menjalankan action ulang.
- Hash request untuk multipart/photo weighing perlu didefinisikan dengan hati-hati agar file upload tidak membuat hash tidak stabil.

Masukan:

Plan revisi perlu merancang idempotency service yang lebih eksplisit:

1. Lock row idempotency atau gunakan transaction dengan unique-key retry handling.
2. Return 409 jika same key dengan payload hash berbeda, untuk semua status yang belum aman.
3. Simpan response sukses secara atomik setelah business commit.
4. Untuk action coin/WA/print, idempotency harus melingkupi coin debit dan external send boundary.
5. Tentukan hash canonical untuk JSON dan multipart.

Tambahkan test: retry same key same payload, same key different payload, double request concurrent, success response lost simulation, dan coin tidak berkurang dua kali.

### 8. Client idempotency belum lengkap untuk semua mutasi

Severity: high

Order store dan weigh membawa `client_request_id` di body. Print dan WA membawa `Client-Request-Id` header. Namun action seperti accept, reject, start, complete, update order, mark payment, deposit, petty cash, dan expense belum terlihat memiliki client request id konsisten di usecase/datasource.

Risiko:

Plan menyatakan semua final backend action harus idempotent, tetapi client belum selalu mengirim key. Middleware backend akan melewati idempotency jika key kosong.

Masukan:

Revisi plan harus membuat helper umum untuk mutating request:

- Generate UUID, bukan timestamp string.
- Reuse UUID untuk retry action yang sama.
- Persist UUID untuk draft/order action yang bisa tertutup app-nya sebelum retry.
- Kirim key konsisten lewat header `Client-Request-Id` atau body, pilih satu sebagai standar.

Khusus print: `_clientRequestId` saat ini hanya hidup di modal. Jika backend sudah debit coin lalu app tertutup sebelum local print berhasil, retry dari modal baru akan membuat key baru dan bisa debit lagi. Plan perlu menyimpan print action state atau print retry key sampai local print selesai/dianggap batal.

### 9. Draft order belum punya UX recovery dan submit_failed yang nyata

Severity: high

Model draft order sudah punya `status`, `clientRequestId`, dan `lastError`, tetapi `OrderCubit.store()` tidak mengubah draft menjadi `submit_failed` saat network/server failure. UI juga langsung memuat draft lama ke cart tanpa prompt lanjutkan, hapus, atau mulai baru.

Risiko:

User need meminta kasir diberi opsi jelas saat draft lama ditemukan dan draft masuk status gagal saat submit gagal. Implementasi parsial saat ini bisa memulihkan data, tetapi belum memberi state/UX yang cukup jelas.

Masukan:

Revisi plan harus menambahkan:

- Saat submit gagal karena network/timeout/server, update draft `status=submit_failed`, simpan `lastError`, dan pertahankan `clientRequestId`.
- Saat draft ditemukan, tampilkan prompt "lanjutkan/hapus/mulai baru".
- Jangan overwrite draft submit_failed menjadi editing tanpa tindakan user.
- Test clear-on-success dan retain-on-failure.

### 10. Draft weighing belum mencakup data yang diminta user need

Severity: high

User need meminta draft weighing menyimpan order ID, item timbang, quantity final, notes, dan referensi foto jika ada. Implementasi saat ini terutama menyimpan `orderId`, `employeeId`, `additionalItems`, dan `updatedAt`. Notes, internal notes, photo path/reference, status, last error, client request id, dan outlet id belum terlihat tersimpan.

Risiko:

Jika app force-close setelah kasir mengisi notes atau foto weighing, data itu dapat hilang. Retry weighing juga bisa mendapat client request id baru karena `_clientRequestId` hanya dibuat di screen.

Masukan:

Perluas schema weighing draft:

- `outletId`
- `orderId`
- `employeeId`
- final item quantities dan notes per item
- order notes/internal notes
- photo local path/reference dan status upload
- `clientRequestId`
- `status`
- `lastError`
- `updatedAt`

Hapus draft hanya setelah backend confirm weighing berhasil.

### 11. Online-required guard belum menjadi guard awal yang konsisten

Severity: medium

`connectivity_plus` sudah ada di `pubspec.yaml`, tetapi belum terlihat helper online guard yang dipakai sebelum aksi final. Saat ini banyak flow hanya mengandalkan mapping `DioException` ke `NetworkFailure`.

Risiko:

User tetap bisa menekan action final saat offline dan hanya menerima error generik setelah request gagal. User need meminta pesan spesifik bahwa koneksi dibutuhkan dan draft tetap tersimpan.

Masukan:

Plan revisi perlu menambahkan helper/abstraction:

- `requireOnline(actionName, onOnline)` atau pola sejenis.
- Copy error khusus per action: submit order, weighing, print, WA, payment/fund action.
- Button boleh disabled saat offline jika status koneksi diketahui, tetapi tetap harus handle network failure dari Dio.
- Test UI/unit untuk offline preflight dan network failure after request.

### 12. Restore auth saat network failure terlalu agresif menghapus session lokal

Severity: medium

`AuthRepositoryImpl.checkAuthStatus()` memanggil `getMe()`, lalu menghapus local token/employee untuk semua failure. Ini mencampur token invalid dengan network failure.

Risiko:

Jika app dibuka ketika koneksi buruk, user dapat dianggap unauthenticated dan diarahkan ke switch/login walaupun token lokal masih valid. Ini bertentangan dengan resilient flow yang ingin input/draft tetap bisa dipulihkan saat koneksi bermasalah.

Masukan:

Bedakan:

- 401/403 dari backend: clear token dan minta login/switch.
- Network failure/timeout: pertahankan local session sebagai "needs online validation" atau "authenticated stale", batasi final action, tetapi biarkan draft recovery berjalan.

Tambahkan acceptance criteria untuk app start offline dengan token lokal dan draft tersimpan.

### 13. Setup PIN endpoint bisa menjadi reset PIN tanpa verifikasi tambahan

Severity: medium

`AuthService::setupPin()` selalu overwrite `pin_hash`. User need membahas setup PIN pertama kali untuk employee yang belum punya PIN, bukan reset PIN bebas.

Risiko:

Siapa pun yang memegang session employee aktif dapat mengganti PIN tanpa password lama/PIN lama. Ini mungkin tidak sesuai ekspektasi keamanan.

Masukan:

Plan revisi harus menetapkan policy:

- `setupPin` hanya boleh jika `pin_hash` null.
- Reset PIN perlu endpoint terpisah dengan password/current PIN atau hanya owner/admin.
- Response error harus jelas jika employee sudah punya PIN.

Tambahkan test setup PIN kedua kali.

### 14. Notification vibration belum terlihat

Severity: medium

Notification service sudah memainkan sound `assets/sounds/notification.mp3`, tetapi belum terlihat `HapticFeedback` atau vibration eksplisit.

Masukan:

Tambahkan haptic/vibration saat `_publishNewOrder()` menerima order baru, dengan guard agar tidak crash di platform yang tidak mendukung. Pastikan dedupe mencegah sound/vibration ganda untuk order yang sama.

### 15. Plan belum cukup kuat pada test coverage

Severity: high

Backend test PIN dasar sudah ada. Namun test untuk fitur ini masih belum mencakup risiko utama.

Tambahkan test backend:

1. `setupPin` tidak membocorkan `pin_hash`.
2. `setupPin` kedua kali ditolak atau mengikuti policy reset yang jelas.
3. Verify PIN inactive employee mengembalikan error akun tidak aktif.
4. Verify PIN salah tidak mencabut token employee aktif lama.
5. Token lifecycle switch sesuai policy final.
6. Cashier access dicek per active outlet, bukan permission flat.
7. Route mobile cashier unauthenticated ditolak.
8. Print info/process wrong-outlet employee ditolak.
9. Idempotency same key same payload return response lama.
10. Idempotency same key payload berbeda return 409.
11. Concurrent idempotent request tidak double write/debit coin.

Tambahkan test Flutter:

1. Setelah setup PIN, remembered account berubah `hasPin=true`.
2. PIN salah pada switch mempertahankan previous authenticated employee.
3. Auth restore network failure tidak menghapus token lokal.
4. Draft order retained-on-submit-failure dengan `submit_failed` dan `lastError`.
5. Draft found prompt mendukung lanjutkan/hapus/mulai baru.
6. Weighing draft menyimpan notes, item qty, photo reference, dan client request id.
7. Mutating request mengirim `Client-Request-Id` konsisten.
8. Print local failure lalu retry memakai idempotency key yang sama.
9. Notification sound dan vibration hanya sekali untuk order id sama dalam dedupe window.

## Rekomendasi Revisi Plan

Plan revisi sebaiknya dibuat dalam urutan berikut:

1. Inventory delta repo saat ini, termasuk file yang sudah ada dan path aktual.
2. Hardening auth/PIN/switch: remembered account update, state switch tidak menghapus session lama, token lifecycle, setup-vs-reset PIN policy.
3. Active outlet dan RBAC: tentukan single-outlet atau multi-outlet, lalu selaraskan frontend, backend middleware, Pusher, FCM, badge, dan route.
4. Draft recovery: lengkapi submit_failed/lastError/recovery prompt untuk order dan schema lengkap untuk weighing.
5. Idempotency: perbaiki backend middleware/service dan client request id untuk semua mutasi.
6. Print/WA: permission guard, idempotency key persistence untuk local retry, dan coin safety test.
7. Online-required UX: guard awal berbasis connectivity plus fallback Dio failure.
8. Notification: tambah vibration/haptic dan pastikan tidak double event.
9. Test plan otomatis dan manual yang konkret.

## Catatan Akhir

Plan awal sudah kuat sebagai arah produk, tetapi revisi tidak boleh lagi memperlakukan fitur ini sebagai greenfield. Model berikutnya harus membaca state repo saat ini dan menulis plan penyelesaian gap. Fokusnya adalah correctness, session safety, idempotency, route security, dan UX recovery saat koneksi bermasalah.
