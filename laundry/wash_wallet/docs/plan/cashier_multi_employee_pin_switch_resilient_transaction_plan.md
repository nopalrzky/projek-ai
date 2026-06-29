# Plan: Cashier Multi Employee PIN Switch dan Resilient Transaction

Referensi kebutuhan: `docs/user_need/cashier_multi_employee_pin_switch_resilient_transaction_user_need.md`

Dokumen ini adalah rencana implementasi untuk model AI lain. Jangan langsung mengubah kode tanpa membaca ulang kebutuhan user dan kondisi kode aktual di repo. Scope utama ada di aplikasi Flutter cashier dan backend Laravel.

## Tujuan

Membangun mode multi-kasir pada satu device dengan quick switch menggunakan PIN, tetap aman terhadap transaksi hilang atau dobel eksekusi saat koneksi bermasalah, dan menjaga alur kasir yang sudah ada.

Target hasil:

- Employee login pertama kali tetap memakai password.
- Jika employee belum punya PIN, app memaksa setup PIN sebelum masuk ke dashboard cashier.
- Employee yang pernah login di device tersimpan sebagai akun lokal untuk quick switch.
- Quick switch dilakukan dengan PIN, bukan password.
- Session aktif selalu jelas: employee aktif, outlet aktif, dan aksesnya.
- Draft transaksi order dan weighing tersimpan lokal agar input kasir tidak hilang.
- Aksi backend tetap online-required, tetapi retry aman dari submit dobel, coin dobel, atau WhatsApp dobel.
- Bunyi notifikasi order baru tetap ada dan ditambah vibration/haptic.

## Batasan Penting

- Jangan membuat offline queue untuk submit backend. Requirement menyebut final action tetap butuh online.
- Jangan menyimpan PIN plaintext di lokal.
- Jangan menyimpan token untuk akun inactive. Token aktif cukup satu, ditimpa saat switch berhasil.
- Jangan mengubah flow customer app atau modul lain yang tidak terkait.
- Jangan menghapus konfirmasi printer yang sudah ada.
- Gunakan pola service, repository, bloc/cubit, route guard, dan request/response backend yang sudah ada.
- Jika menemukan perubahan user di working tree, jangan revert.

## Ringkasan Kode yang Perlu Dibaca

Backend Laravel:

- `webapp/wash_wallet_be/app/Http/Controllers/Api/EmployeeAuthController.php`
- `webapp/wash_wallet_be/app/Services/AuthService.php`
- `webapp/wash_wallet_be/app/Http/Resources/Auth/LoginEmployeeResource.php`
- `webapp/wash_wallet_be/app/Models/Employee.php`
- `webapp/wash_wallet_be/database/migrations/*employees*`
- `webapp/wash_wallet_be/routes/api.php`
- Controller/service order, payment, print, WhatsApp, dan status order yang dipakai cashier.

Flutter cashier:

- `apps/cashier/lib/core/router/app_router.dart`
- `apps/cashier/lib/core/storage/secure_token_storage.dart`
- `apps/cashier/lib/core/network/auth_interceptor.dart`
- `apps/cashier/lib/features/auth/**`
- `apps/cashier/lib/features/order/**`
- `apps/cashier/lib/features/notification/**`
- `apps/cashier/pubspec.yaml`

Shared packages:

- `packages/wash_wallet_domain/lib/src/entities/auth_employee.dart`
- `packages/wash_wallet_domain/lib/src/models/auth_employee_model.dart`
- `packages/wash_wallet_domain/lib/src/repositories/auth_repository.dart`
- `packages/wash_wallet_data/lib/src/auth/**`

## Keputusan Teknis

### 1. Permission Minimum untuk Akses Cashier

Gunakan permission `order.view` sebagai minimum untuk masuk dashboard cashier.

Alasan:

- Route cashier dashboard/order di backend sudah memakai `position.permission:order.view`.
- Default role `kasir` sudah memiliki `order.view`.
- Ini lebih konsisten daripada memperkenalkan permission baru di fase ini.

Jika employee login berhasil tetapi tidak punya `order.view`, app harus menampilkan state "tidak punya akses kasir" dan tidak masuk dashboard.

### 2. PIN Employee

Tambahkan field di backend employee:

- `pin_hash` nullable string.
- `pin_set_at` nullable timestamp.

Aturan PIN:

- Default 6 digit numeric.
- Hash dengan `Hash::make`.
- Verifikasi dengan `Hash::check`.
- Tidak pernah dikirim balik ke client.
- Login resource hanya mengirim boolean `hasPin`.

Validasi:

- Setup PIN: required, numeric string, length 6, confirmation sama.
- Verify PIN: required, numeric string, length 6.

Rate limit endpoint verify PIN untuk mengurangi brute force. Ikuti style throttle/rate limiter yang sudah ada di backend.

### 3. Endpoint Auth

Tambahkan endpoint mobile cashier:

- `POST /mobile/cashier/auth/pin/setup`
  - Authenticated dengan Sanctum.
  - Body: `pin`, `pin_confirmation`.
  - Menyimpan hash PIN untuk employee token aktif.
  - Response minimal: updated employee payload dengan `hasPin: true`.

- `POST /mobile/cashier/auth/pin/verify`
  - Public endpoint dengan throttle.
  - Body: `employee_id` atau `username`, `pin`, `device_name`.
  - Verifikasi employee dan PIN.
  - Jika valid, mint token baru dengan kemampuan mobile cashier yang sama seperti password login employee.
  - Response harus sama bentuknya dengan password login: token, token type, employee, accessible outlets, all permissions.

Catatan naming:

- Backend Laravel umumnya memakai snake_case.
- Flutter model boleh expose camelCase, tetapi datasource harus mapping ke snake_case sesuai API.

### 4. State Auth dan Routing Flutter

Tambahkan state auth yang eksplisit:

- `AuthLoading`
- `Unauthenticated`
- `Authenticated`
- `PinSetupRequired`
- `CashierAccessDenied`
- `AuthFailureState`

Flow:

1. Password login berhasil.
2. Simpan token aktif.
3. Simpan metadata employee ke remembered accounts.
4. Jika employee tidak punya `order.view`, arahkan ke access denied.
5. Jika `hasPin == false`, arahkan ke setup PIN.
6. Jika sudah punya PIN dan akses valid, masuk dashboard.

Quick switch:

1. User buka switch employee.
2. App tampilkan daftar remembered employee accounts dari device.
3. User pilih employee.
4. User input PIN.
5. App call verify PIN endpoint.
6. Jika berhasil, token aktif diganti token baru, employee aktif diganti, lalu route ke dashboard.

Logout:

- Logout normal menghapus active token/session.
- Remembered accounts tetap ada, kecuali user memilih remove remembered account.

### 5. Remembered Employee Accounts

Simpan metadata lokal di SharedPreferences, bukan SecureStorage token inactive.

Schema lokal yang disarankan:

```json
{
  "version": 1,
  "accounts": [
    {
      "employeeId": 123,
      "username": "kasir_a",
      "name": "Kasir A",
      "outletId": 10,
      "outletName": "Outlet Utama",
      "hasPin": true,
      "lastUsedAt": "2026-06-20T10:00:00.000Z"
    }
  ]
}
```

Key SharedPreferences:

- `cashier_remembered_employee_accounts_v1`

Aturan:

- Deduplicate berdasarkan `employeeId`.
- Sort by `lastUsedAt` descending.
- Update metadata setiap login/password atau verify PIN berhasil.
- Sediakan delete remembered account.

### 6. Draft Order V2

Draft order perlu lebih lengkap dari draft lama.

Key yang disarankan:

- `cashier_order_draft_v2_{outletId}_{employeeId}_{customerId}`

Schema:

```json
{
  "version": 2,
  "outletId": 10,
  "employeeId": 123,
  "customerId": 456,
  "items": [
    {
      "serviceId": 1,
      "priceId": 99,
      "serviceName": "Cuci Kering",
      "quantity": 2,
      "unitPrice": 15000,
      "subtotal": 30000,
      "notes": ""
    }
  ],
  "notes": "Catatan order",
  "estimatedCompletion": "2026-06-21T09:00:00.000Z",
  "paymentStatus": "unpaid",
  "paymentMethod": "cash",
  "paymentAccountId": null,
  "paidAmount": 0,
  "status": "editing",
  "clientRequestId": "uuid",
  "lastError": null,
  "updatedAt": "2026-06-20T10:00:00.000Z"
}
```

Status draft:

- `editing`: input masih berjalan.
- `submit_failed`: submit gagal karena network/server, data tetap dipertahankan.

Migration:

- Jika ada draft lama `draft_order_customer_{customerId}`, migrasikan ke v2 saat layar order dibuka.
- Legacy draft tidak punya `employeeId` dan payment fields, isi dari session aktif/default.
- Setelah migration berhasil, boleh hapus key lama untuk customer tersebut.

Autosave:

- Simpan ketika customer dipilih, item berubah, notes berubah, estimate berubah, payment field berubah, dan sebelum submit.
- Hapus draft hanya setelah backend submit sukses final.

### 7. Draft Weighing

Tambahkan draft weighing lokal untuk order yang sedang ditimbang.

Key:

- `cashier_weighing_draft_v1_{outletId}_{employeeId}_{orderId}`

Schema:

```json
{
  "version": 1,
  "outletId": 10,
  "employeeId": 123,
  "orderId": 999,
  "items": [
    {
      "orderItemId": 1,
      "serviceId": 1,
      "measuredWeight": 2.5,
      "notes": ""
    }
  ],
  "clientRequestId": "uuid",
  "status": "editing",
  "lastError": null,
  "updatedAt": "2026-06-20T10:00:00.000Z"
}
```

Hapus hanya setelah submit weighing sukses.

### 8. Online Guard

Gunakan `connectivity_plus` yang sudah ada di cashier app sebagai guard awal, tetapi tetap handle error Dio/network dari backend.

Aksi yang wajib online-required:

- Submit order.
- Update order.
- Accept order.
- Reject order.
- Start processing.
- Complete order.
- Submit weighing.
- Mark payment.
- Print action yang mengurangi coin atau mencatat print.
- WhatsApp action yang mengurangi coin atau mengirim pesan.
- Deposit, petty cash, expense.

Behavior:

- Jika offline sebelum request, tampilkan pesan singkat dan jangan hapus draft.
- Jika request gagal karena network/server, set draft status `submit_failed`, simpan error, dan tampilkan retry.
- Jangan melakukan silent queue.

### 9. Idempotency dan Anti Double Action

Tambahkan `client_request_id` untuk aksi mutasi penting dari cashier app.

Client:

- Generate UUID ketika user mulai action.
- Simpan di draft/action state.
- Reuse UUID yang sama saat retry dari kegagalan action yang sama.
- Generate UUID baru hanya jika user membuat action baru.

Backend:

- Simpan catatan idempotency, misalnya table `mobile_action_idempotencies`:
  - `id`
  - `employee_id`
  - `outlet_id`
  - `action`
  - `client_request_id`
  - `request_hash`
  - `status`
  - `response_code`
  - `response_body`
  - timestamps
- Unique index: `employee_id`, `action`, `client_request_id`.
- Jika request sama datang lagi dan sudah success, return response tersimpan.
- Jika request sama tetapi payload berbeda, return conflict 409.
- Jika previous attempt failed before committing business action, boleh retry sesuai status.

Minimal action yang perlu idempotent:

- `order.store`
- `order.weigh`
- `order.accept`
- `order.reject`
- `order.start_processing`
- `order.complete`
- `payment.mark_paid`
- `order.print`
- `whatsapp.send`

Transaksi database:

- Bungkus perubahan idempotency dan business write dalam DB transaction bila memungkinkan.
- Hindari coin debit terjadi dua kali untuk retry print/WhatsApp.

### 10. Print dan WhatsApp Coin Safety

Print flow existing harus dipertahankan, termasuk konfirmasi printer.

Masalah yang harus ditutup:

- Jika backend sudah mengurangi coin tetapi printer lokal gagal, retry tidak boleh mengurangi coin lagi untuk action yang sama.

Plan:

- Client membuat `clientRequestId` ketika user konfirmasi print.
- Backend process-print menerima `client_request_id`.
- Jika action sudah sukses pada backend coin/process, retry dengan key sama return success/previous result tanpa debit ulang.
- Client tetap menjalankan local Bluetooth print setelah backend mengizinkan.
- Jika local print gagal, tampilkan retry print lokal dengan idempotency key yang sama.

WhatsApp:

- Send endpoint juga menerima `client_request_id`.
- Retry dengan key sama tidak boleh mengurangi coin atau mengirim duplicate message jika backend sudah menganggap action success.

### 11. Notification Sound dan Vibration

Pertahankan sound `assets/sounds/notification.mp3`.

Tambahkan vibration/haptic saat order baru diterima:

- Gunakan `HapticFeedback.mediumImpact()` untuk minimal dependency.
- Jika perlu vibration fisik yang lebih kuat, tambahkan package khusus hanya bila benar-benar dibutuhkan.

Pastikan:

- Sound tetap berjalan.
- Vibration tidak crash di platform yang tidak mendukung.
- Tidak ada duplicate sound/vibration untuk event order yang sama jika event datang dari lebih dari satu channel.

## Fase Implementasi

### Fase 1 - Backend PIN Auth

Langkah:

1. Tambah migration `pin_hash` dan `pin_set_at` di employees.
2. Update `Employee` fillable/hidden/casts sesuai pola model.
3. Update `LoginEmployeeResource` dengan `hasPin`.
4. Tambah request validation setup PIN dan verify PIN.
5. Tambah method di `AuthService`:
   - setup PIN untuk authenticated employee.
   - verify PIN dan issue token baru.
6. Tambah routes mobile cashier auth.
7. Tambahkan throttle pada verify PIN.
8. Tambah test feature:
   - password login employee tanpa PIN mengembalikan `hasPin: false`.
   - setup PIN berhasil dan hash tersimpan.
   - verify PIN benar mengembalikan token baru.
   - verify PIN salah gagal.
   - PIN tidak pernah muncul di response.

### Fase 2 - Flutter Auth dan Employee Switch

Langkah:

1. Update domain entity/model employee dengan `hasPin` dan permission helper bila belum ada.
2. Update auth datasource/repository untuk endpoint setup PIN dan verify PIN.
3. Tambah usecase sesuai pola existing.
4. Tambah local datasource remembered employee accounts.
5. Update auth cubit/bloc:
   - detect `hasPin`.
   - detect `order.view`.
   - expose state setup PIN dan access denied.
6. Tambah screen:
   - setup PIN.
   - switch employee.
   - PIN entry.
   - access denied.
7. Update router guard.
8. Pastikan active employee/outlet tampil jelas di dashboard/header/menu.
9. Tambah test unit/bloc untuk state transition auth.

### Fase 3 - Draft Order dan Weighing

Langkah:

1. Buat model local draft order v2.
2. Buat datasource SharedPreferences untuk draft order v2.
3. Tambah migration dari draft lama.
4. Hubungkan autosave di flow create/review order, termasuk payment fields.
5. Submit order membaca draft lengkap.
6. Jika submit sukses, hapus draft.
7. Jika submit gagal, draft tetap ada dengan status `submit_failed`.
8. Buat model/datasource draft weighing.
9. Hubungkan autosave di screen weighing.
10. Tambah tests untuk serialization, migration, clear-on-success, retain-on-failure.

### Fase 4 - Online Guard dan Idempotency

Langkah backend:

1. Tambah migration/model/service idempotency.
2. Integrasikan ke endpoint mutasi cashier yang tercantum.
3. Pastikan conflict payload berbeda mengembalikan 409.
4. Pastikan retry payload sama mengembalikan response yang aman.

Langkah Flutter:

1. Tambah helper online guard berbasis connectivity dan Dio exception mapping.
2. Tambah `clientRequestId` di request mutasi.
3. Reuse id saat retry action yang sama.
4. Disable double tap saat request in-flight.
5. Tampilkan error dan retry tanpa menghapus draft.

### Fase 5 - Print, WhatsApp, dan Notification

Langkah:

1. Tambah `client_request_id` ke request print dan WhatsApp.
2. Pastikan backend coin deduction idempotent.
3. Pastikan retry local print setelah backend success tidak debit ulang.
4. Tambah vibration/haptic ke notification order baru.
5. Deduplicate notification event jika dibutuhkan berdasarkan order id/event id.

### Fase 6 - Validasi Akhir

Jalankan validasi minimal:

Backend:

- `php -l` untuk file PHP baru/diubah.
- Test feature auth PIN dan idempotency.
- Test endpoint print/WhatsApp retry jika coverage memungkinkan.

Flutter:

- `dart format` pada file Dart yang diubah.
- `flutter analyze` di `apps/cashier`.
- Unit tests untuk auth, remembered accounts, draft serialization/migration, idempotency client request id.

Manual QA:

1. Employee A login password pertama kali, dipaksa setup PIN, masuk dashboard setelah setup.
2. Employee B login password di device sama, setup PIN, lalu muncul di switch account.
3. Switch dari A ke B dengan PIN benar berhasil dan token aktif berubah.
4. PIN salah gagal dan tidak mengganti session.
5. Employee tanpa `order.view` tidak bisa masuk dashboard.
6. Buat draft order, force close app, buka lagi, draft masih ada.
7. Submit saat offline tidak menghapus draft.
8. Submit gagal karena network, draft status `submit_failed`, retry pakai request id sama.
9. Submit sukses, draft terhapus.
10. Weighing draft tidak hilang saat app ditutup.
11. Retry print setelah backend coin success tetapi printer gagal tidak mengurangi coin lagi.
12. Retry WhatsApp tidak mengirim atau charge dua kali.
13. Order baru tetap play sound dan melakukan vibration/haptic.

## Acceptance Checklist

- [ ] Password login employee tetap berjalan.
- [ ] Login employee tanpa PIN mengarah ke setup PIN.
- [ ] Setup PIN tersimpan hash di backend dan tidak bocor di response.
- [ ] Quick switch employee via PIN berhasil untuk remembered account.
- [ ] App tidak menyimpan inactive token.
- [ ] Active employee dan outlet terlihat jelas.
- [ ] Employee tanpa permission `order.view` tidak dapat masuk cashier dashboard.
- [ ] Draft order v2 menyimpan outlet, employee, customer, items, notes, estimate, payment fields, status, updatedAt.
- [ ] Draft lama dimigrasikan atau tetap tidak merusak flow.
- [ ] Draft weighing tersedia dan tidak hilang sebelum submit sukses.
- [ ] Semua final backend action online-required.
- [ ] Retry mutasi memakai idempotency key yang sama.
- [ ] Submit/order/status/payment/print/WA tidak dobel akibat retry.
- [ ] Print confirmation tetap ada.
- [ ] Notification sound tetap ada dan vibration/haptic ditambahkan.
- [ ] Backend dan Flutter lulus format/analyze/test yang relevan.

## Risiko dan Mitigasi

- Risiko: token lama masih dipakai setelah switch.
  - Mitigasi: token aktif satu sumber dari `SecureTokenStorage`, overwrite atomik saat verify PIN berhasil, refresh auth state setelah switch.

- Risiko: draft bercampur antar employee/outlet.
  - Mitigasi: key draft wajib mengandung `outletId` dan `employeeId`.

- Risiko: retry print mengurangi coin dua kali.
  - Mitigasi: idempotency backend melingkupi coin debit, client reuse key yang sama untuk retry print lokal.

- Risiko: permission check frontend berbeda dari backend.
  - Mitigasi: frontend pakai `order.view`, backend route tetap enforce permission middleware.

- Risiko: migration draft lama kehilangan field baru.
  - Mitigasi: isi default dari session aktif dan nilai default payment yang sudah dipakai flow lama.

## Catatan untuk Model Implementer

- Mulai dari backend auth PIN dan contract response karena Flutter bergantung pada `hasPin`.
- Setelah contract stabil, kerjakan Flutter auth/switch.
- Baru lanjut draft/idempotency karena area ini menyentuh flow transaksi.
- Buat perubahan kecil dan jalankan test/analyze per fase.
- Jangan melakukan refactor besar di luar kebutuhan ini.
