# Feedback Review: Cashier New Order Realtime Notification Plan

Tanggal: 2026-06-12

Dokumen yang direview:

- `docs/user_need/cashier_new_order_realtime_notification_user_need.md`
- `docs/plan/cashier_new_order_realtime_notification_plan.md`

## Kesimpulan

Plan sudah mencakup kebutuhan utama user need: broadcast realtime untuk foreground, FCM untuk background, token device employee, targeting outlet/permission, banner, badge, sound, dan sync ulang.

Namun plan perlu direvisi sebelum dieksekusi oleh model lain, karena kondisi repo saat review sudah tidak sama dengan asumsi plan. Beberapa item yang ditulis sebagai "belum ada" sudah ada di kode, dan beberapa detail teknis plan masih berisiko menimbulkan implementasi yang tidak stabil atau tidak konsisten.

Prioritas utama untuk model berikutnya adalah menyinkronkan plan dengan state repo saat ini, menetapkan implementasi Laravel broadcaster `pusher` dengan Pusher Channels, lalu menutup risiko FCM, targeting multi-outlet, payload deduplication, dan test coverage.

## Findings

### 1. Plan tidak sinkron dengan kondisi repo saat ini

Severity: high

Plan masih menyebut beberapa hal sebagai perlu ditambahkan, padahal sudah ada di repo:

- `laravel/reverb` sudah ada di `webapp/wash_wallet_be/composer.json`.
- `config/reverb.php` sudah ada.
- `routes/channels.php` sudah ada dan memakai `Broadcast::channel('outlet.{outletId}', ...)`.
- `EmployeeDeviceToken`, migration `employee_device_tokens`, dan relasi `Employee::deviceTokens()` sudah ada.
- `EmployeeFcmTokenController` dan route `/mobile/cashier/auth/fcm-token` sudah ada.
- `OrderController::newCount()` dan endpoint `/mobile/cashier/orders/new-count` sudah ada.
- `FcmNotificationService` sudah punya method employee/cashier.
- Cashier app sudah punya `NotificationService`, Firebase dependency, local notification, audio, badge, banner, dan handler tap awal.

Masukan:

Ubah plan menjadi delta plan yang eksplisit:

1. "Sudah ada dan perlu diverifikasi".
2. "Sudah ada tetapi perlu diperbaiki".
3. "Belum ada".

Tanpa ini, model berikutnya berisiko membuat ulang file yang sudah ada, mengubah implementasi yang benar, atau membuat konflik pola.

### 2. Gunakan Laravel broadcaster `pusher`, jangan WebSocket manual

Severity: high

Keputusan final untuk plan berikutnya: gunakan Laravel broadcaster `pusher` dengan Pusher Channels dan client Flutter Pusher-compatible, bukan implementasi protokol sendiri dengan `web_socket_channel`.

Kondisi repo saat ini berbeda: cashier app sudah memakai `web_socket_channel` dan mengimplementasikan sebagian protokol Pusher secara manual. Ini sebaiknya diganti karena area ini rawan bug:

- reconnect dengan backoff,
- resubscribe setelah reconnect,
- handling `pusher:error`,
- handling `pusher_internal:subscription_succeeded`,
- ping/pong atau timeout koneksi,
- sync badge/list setelah reconnect,
- logging minimal untuk kegagalan subscribe/auth.

Masukan:

Revisi plan agar menetapkan keputusan ini:

1. Backend tetap memakai Laravel broadcasting private channel `outlet.{outletId}`.
2. Backend memakai `BROADCAST_CONNECTION=pusher`.
3. Pastikan dependency backend Pusher tersedia, misalnya `pusher/pusher-php-server` jika belum ada.
4. Flutter cashier memakai package Pusher-compatible, rekomendasi: `pusher_channels_flutter`.
5. Hapus dependency dan implementasi manual `web_socket_channel` dari `NotificationService`.
6. `NotificationService.connectPusher()` atau nama sejenis harus menangani subscribe private channel, auth endpoint `/broadcasting/auth`, reconnect, unsubscribe, dan disconnect.

Acceptance criteria perlu menambahkan test manual: putuskan koneksi Pusher, sambungkan lagi, pastikan app reconnect, resubscribe ke private channel, dan badge sync ulang.

### 3. Payload dan deduplication belum konsisten antara broadcast dan FCM

Severity: high

User need meminta payload broadcast dan FCM konsisten supaya app memakai satu handler.

Masalah yang perlu diselesaikan:

- Plan sample FCM di `OrderService` tidak menyertakan `eventId`, tetapi `NotificationService` plan melakukan dedupe berbasis `eventId`.
- Implementasi saat ini membuat broadcast `eventId` sebagai UUID, sedangkan FCM memakai format berbeda seperti `fcm-{orderId}-{timestamp}`.
- Jika dedupe hanya berbasis `eventId`, broadcast dan FCM untuk order yang sama bisa dianggap dua event berbeda.
- Plan menyebut `pickupType`, tetapi event/backend saat ini lebih banyak mengirim `deliveryType` dan belum konsisten mengirim `pickupType`.

Masukan:

Tetapkan kontrak final:

- dedupe utama memakai `orderId` untuk window pendek, karena broadcast dan FCM merepresentasikan order yang sama,
- `eventId` boleh tetap ada untuk observability, tetapi jangan menjadi satu-satunya kunci dedupe,
- FCM dan broadcast wajib sama-sama membawa `type`, `orderId`, `orderNumber`, `outletId`, `status`, `customerName`, `deliveryType` atau `pickupType`, dan `createdAt`,
- semua numeric ID di payload FCM dikirim sebagai string, dan parser Flutter menerima string/int.

### 4. Kegagalan broadcast belum terbukti tidak mempengaruhi request order

Severity: high

Plan menyatakan kegagalan broadcast tidak boleh membatalkan pembuatan order. Namun jika memakai `ShouldBroadcastNow`, kegagalan broadcaster setelah commit masih bisa membuat request customer menerima error walaupun order sudah tersimpan.

Masukan:

Perkuat plan dengan salah satu pendekatan:

1. Gunakan `ShouldBroadcast` queued, bukan `ShouldBroadcastNow`, supaya broadcast tidak berada di jalur request utama.
2. Jika tetap `ShouldBroadcastNow`, tambahkan test yang memaksa broadcaster throw dan pastikan endpoint create order tetap sukses.
3. Log kegagalan broadcast secara eksplisit di level job/listener, bukan hanya try-catch di sekitar `dispatch()`.

Acceptance criteria "kegagalan broadcast tidak membatalkan order" harus dibuktikan dengan test atau simulasi failure.

### 5. FCM sebaiknya tidak dikirim sinkron dan tidak boleh menghapus token untuk semua error

Severity: high

Plan mengizinkan FCM dikirim langsung setelah commit. Untuk production, ini berisiko:

- response create order customer melambat karena harus mengirim push ke banyak device,
- error jaringan sementara bisa membuat token valid ikut dihapus,
- retry FCM tidak jelas,
- observability kegagalan per-token minim.

Masukan:

Jadikan pengiriman FCM sebagai queued job setelah commit:

- job menerima `orderId`, lalu load ulang order dan penerima eligible,
- gunakan retry/backoff,
- hapus token hanya untuk error permanen yang memang berarti token invalid/unregistered,
- jangan hapus token untuk timeout, network error, 5xx, atau credential error,
- log ringkasan jumlah token berhasil/gagal.

Jika belum ingin queue, minimal revisi `FcmNotificationService::send()` supaya mengembalikan kategori error, bukan hanya boolean.

### 6. Targeting FCM dan `new-count` belum selaras dengan multi-outlet RBAC

Severity: high

Channel auth sudah memakai `Employee::hasPermissionOnOutlet('order.view', $outletId)`, tetapi FCM targeting dan `new-count` masih berpotensi terlalu bergantung pada `employee.outlet_id`.

Risiko:

- employee yang punya posisi aktif di outlet lain bisa lolos channel auth untuk outlet itu, tetapi tidak menerima FCM jika query FCM membatasi `employees.outlet_id = outletId`,
- `new-count` bisa menghitung outlet utama employee, bukan outlet aktif yang sedang dipakai di app,
- perilaku berbeda antara broadcast Pusher, FCM, dan REST sync.

Masukan:

Tentukan satu sumber konteks outlet:

- jika cashier app hanya boleh bekerja di outlet utama, tulis eksplisit dan pastikan semua query memakai outlet utama,
- jika mendukung multi-outlet, kirim `X-Outlet-ID` atau outlet aktif dari app, lalu gunakan helper permission yang sama dengan middleware.

Untuk FCM, rekomendasi query:

- cari employee aktif yang punya posisi aktif pada `positions.outlet_id = order.outlet_id`,
- permission `order.view` ada pada posisi tersebut,
- jangan wajibkan `employees.outlet_id = order.outlet_id` kecuali bisnis memang hanya single-outlet.

Untuk `new-count`, gunakan outlet aktif yang sama dengan screen cashier, bukan asumsi otomatis dari `employee.outlet_id`.

### 7. Trigger order baru perlu guard eksplisit

Severity: medium

Plan mengandalkan fakta bahwa trigger diletakkan di `storeCustomer()`. Itu cukup untuk saat ini, tetapi lebih aman jika dispatch juga punya guard eksplisit sesuai definisi order baru.

Masukan:

Sebelum dispatch broadcast/FCM, cek:

- `source === Order::SOURCE_CUSTOMER_APP`,
- `outlet_id !== null`,
- status termasuk `requested` atau `pending_dropoff`.

Ini mencegah notifikasi salah jika `storeCustomer()` berubah, dipakai ulang, atau status awal order customer berubah di masa depan.

### 8. Environment dan deployment Pusher belum cukup konkret

Severity: medium

Plan lama mencantumkan env Reverb, tetapi keputusan final sekarang adalah Laravel broadcaster `pusher`. Repo saat ini masih memiliki `.env.example` dengan `BROADCAST_CONNECTION=log` dan belum terlihat daftar env Pusher yang lengkap.

Selain itu, plan menyebut cek `config/broadcasting.php`, sementara file itu tidak ada di repo. Broadcasting route didaftarkan lewat `bootstrap/app.php` dengan `withBroadcasting(...)`.

Masukan:

Update plan agar sesuai Laravel versi repo:

- sebutkan `bootstrap/app.php` sebagai tempat route `/broadcasting/auth`,
- update `.env.example` dengan `BROADCAST_CONNECTION=pusher` dan semua `PUSHER_*`,
- jelaskan konfigurasi Pusher app id, app key, secret, cluster, TLS, dan dashboard Pusher,
- jelaskan nilai Flutter via `--dart-define`, terutama app key, cluster, host/port jika diperlukan package,
- tambahkan catatan channel auth `/broadcasting/auth` harus memakai `auth:sanctum`.

### 9. Token lifecycle employee perlu dipertegas

Severity: medium

Tabel token terpisah adalah keputusan yang tepat. Tetapi plan perlu menutup beberapa edge case:

- token refresh menghasilkan token baru, token lama bisa tertinggal jika tidak dihapus,
- logout harus menghapus token sebelum auth token backend dicabut,
- satu FCM token bisa berpindah employee setelah login ulang di device yang sama,
- panjang kolom token `255` perlu divalidasi dengan token aktual, atau dibuat lebih longgar.

Masukan:

Tambahkan field opsional `platform`, `device_id`, atau `app_version` jika berguna untuk troubleshooting. Minimal, rancang update token agar token lama dari device yang sama bisa dibersihkan saat token refresh.

### 10. Navigasi push saat app belum authenticated belum dirancang detail

Severity: medium

User need meminta: jika app dibuka dari push tetapi user belum login atau token auth invalid, app login dulu lalu tidak kehilangan konteks order.

Plan hanya menyebut perlu `GoRouter` atau `navigatorKey`, sedangkan implementasi saat ini lebih banyak memakai `Navigator.push` lokal di `HomeScreen`. Jika initial FCM payload datang sebelum `HomeScreen` subscribe, event tap bisa hilang.

Masukan:

Tambahkan coordinator di level app/root:

- simpan pending notification payload saat app dibuka dari push,
- jika auth belum valid, arahkan ke login,
- setelah login sukses, buka order detail jika employee masih punya akses,
- jika akses tidak ada atau order sudah berubah, buka daftar order dengan status terbaru,
- jangan bergantung pada subscription di `HomeScreen` saja.

Plan juga perlu memilih satu pola navigasi final: full `GoRouter` route untuk order detail, atau tetap `Navigator.push` tetapi dengan navigator key global.

### 11. Sound asset tidak konsisten

Severity: low

Plan menyebut `assets/sounds/new_order.mp3`, tetapi repo saat ini memiliki `apps/cashier/assets/sounds/notification.mp3` dan `NotificationService` memakai `AssetSource('sounds/notification.mp3')`.

Masukan:

Samakan nama file di plan dan implementasi. Pilih salah satu:

- ubah plan menjadi `assets/sounds/notification.mp3`, atau
- rename asset dan update `NotificationService`.

Tambahkan verifikasi manual bahwa sound benar-benar terdengar di Android device/emulator, bukan hanya asset terdaftar.

### 12. Test coverage di plan masih terlalu acceptance-level

Severity: high

Plan sudah punya checklist acceptance, tetapi belum cukup konkret sebagai daftar test otomatis. Repo juga belum terlihat memiliki test khusus untuk fitur notifikasi ini.

Masukan:

Tambahkan test berikut ke plan.

Backend:

1. Register FCM token employee membuat atau meng-update row `employee_device_tokens`.
2. Delete FCM token hanya menghapus token milik employee yang sedang login.
3. Private channel `outlet.{id}` allow employee aktif dengan `order.view` pada outlet tersebut.
4. Private channel menolak employee outlet lain atau tanpa `order.view`.
5. Customer order baru dispatch event setelah commit.
6. Customer order baru mengirim FCM job ke cashier eligible.
7. Order cashier POS tidak dispatch event/FCM.
8. `new-count` menghitung hanya `source = customer_app` dan status `requested`/`pending_dropoff`.
9. FCM targeting tidak mengirim ke employee inactive, posisi inactive, permission missing, atau outlet tidak relevan.
10. Kegagalan broadcaster/FCM tidak membuat create order gagal.

Flutter:

1. `NewOrderPayload.fromMap` menerima payload string/int dari broadcast dan FCM.
2. Deduplication tidak menaikkan badge dua kali untuk `orderId` sama.
3. Badge bertambah saat payload baru dan reset saat membuka daftar order.
4. Handler tap notification membuka order/detail yang benar saat authenticated.
5. Pending push payload tetap diproses setelah login.
6. Pusher reconnect memanggil sync badge/list.
7. Asset sound tersedia dan path sesuai.

Manual integration:

1. Foreground: Pusher event memunculkan banner, badge, sound.
2. Background: FCM push muncul.
3. Terminated: tap push membuka konteks order.
4. Pusher disconnect/reconnect tidak menghilangkan order karena sync ulang.
5. Cashier outlet berbeda tidak menerima broadcast atau FCM.

## Rekomendasi Revisi Plan

Revisi plan sebaiknya dimulai dengan bagian "State repo saat ini" yang berisi item sudah ada, lalu lanjut ke pekerjaan sisa:

1. Sinkronisasi dokumen plan dengan file yang sudah ada.
2. Tetapkan Laravel broadcaster `pusher` sebagai keputusan final dan ganti implementasi manual `web_socket_channel`.
3. Perbaiki kontrak payload dan dedupe.
4. Jadikan FCM queued job atau minimal klasifikasikan error token.
5. Selaraskan FCM targeting, channel auth, dan `new-count` terhadap konteks outlet yang sama.
6. Tambahkan guard eksplisit sebelum trigger notifikasi.
7. Update `.env.example` dan instruksi deployment Pusher.
8. Tambahkan coordinator navigasi push di level app/root.
9. Samakan nama sound asset.
10. Tambahkan test otomatis dan manual sesuai daftar di atas.

## Catatan Akhir

Plan sudah berada di arah yang benar secara produk. Masalah utamanya bukan scope, tetapi ketidaksinkronan dengan kode yang sudah ada dan beberapa detail reliability yang belum dikunci. Model berikutnya sebaiknya tidak langsung menambah file baru dari plan lama, tetapi membaca state repo saat ini lalu mengerjakan gap yang tersisa.
