# User Need: Sistem Notifikasi Order Baru Cashier dengan Laravel Reverb dan FCM

Tanggal: 2026-06-11

Dokumen ini menjadi acuan user need untuk AI model lain saat menyusun implementation plan. Dokumen ini fokus pada kebutuhan pengguna, konteks sistem saat ini, perilaku yang diharapkan, aturan penerima notifikasi, dan acceptance criteria. Detail teknis final seperti package yang dipilih di Flutter, struktur migration, nama channel Reverb, nama event, service class, dan test implementation ditentukan pada dokumen plan.

## 1. Latar Belakang

Cashier membutuhkan cara yang lebih andal untuk mengetahui order baru dari customer. Saat ini cashier perlu membuka atau me-refresh daftar order untuk mengetahui apakah ada order baru. Pada operasional laundry, keterlambatan menerima order dapat membuat proses pickup, penimbangan, dan produksi ikut terlambat.

Sistem notifikasi yang dibutuhkan memakai dua jalur:

1. Laravel Reverb untuk realtime event ketika aplikasi cashier sedang aktif.
2. Firebase Cloud Messaging atau FCM sebagai fallback ketika aplikasi cashier berada di background, ditutup, atau perangkat terkunci.

Kombinasi ini dibutuhkan agar cashier tetap mendapat sinyal order baru pada kondisi aplikasi aktif maupun tidak aktif, sekaligus meminimalkan risiko pesanan customer terlewat.

## 2. Tujuan

1. Memastikan setiap order baru dari customer diketahui oleh cashier outlet terkait secepat mungkin.
2. Menampilkan notifikasi realtime saat aplikasi cashier sedang aktif tanpa menunggu refresh manual.
3. Mengirim push notification saat aplikasi tidak aktif, background, terminated, atau perangkat terkunci.
4. Menampilkan indikator visual yang mudah terlihat seperti banner dan badge jumlah order baru.
5. Memutar sound notifikasi saat order baru masuk ketika aplikasi aktif.
6. Menjaga targeting notifikasi agar hanya cashier outlet yang relevan yang menerima order baru.
7. Menyediakan mekanisme sinkronisasi ulang agar order tidak hilang saat koneksi realtime putus.

## 3. Aktor

1. `customer`
   Membuat order dari aplikasi customer.
2. `cashier employee`
   Menerima dan menindaklanjuti order baru pada aplikasi cashier.
3. `backend`
   Membuat order, menentukan penerima, mengirim event Reverb, dan mengirim push FCM.
4. `mobile cashier app`
   Mendaftarkan device token, mendengarkan event realtime, menampilkan banner/badge, memutar sound, dan membuka halaman order saat notifikasi diklik.

## 4. Konteks Sistem Saat Ini

Hasil review kode saat ini:

1. Aplikasi cashier belum memiliki dependency FCM atau realtime websocket.
   - `apps/cashier/pubspec.yaml` belum memuat `firebase_core`, `firebase_messaging`, client Echo/Reverb, local notification, atau audio player.
2. Aplikasi customer sudah memiliki pola awal FCM.
   - `apps/customer/pubspec.yaml` memakai `firebase_core` dan `firebase_messaging`.
   - `apps/customer/lib/features/auth/presentation/bloc/customer_auth_cubit.dart` mengambil token dari `FirebaseMessaging.instance.getToken()`.
   - `apps/customer/lib/features/auth/data/datasources/fcm_token_datasource.dart` mengirim token ke endpoint `updateFcmToken`.
3. Package shared sudah punya helper endpoint token FCM.
   - `packages/wash_wallet_core/lib/src/network/api/api_endpoints.dart` memiliki `updateFcmToken => '$_prefix/auth/fcm-token'`.
4. Backend sudah memiliki service FCM untuk customer.
   - `webapp/wash_wallet_be/app/Services/FcmNotificationService.php` memakai `kreait/laravel-firebase`.
   - Method yang tersedia saat ini adalah `sendToCustomer(CustomerAccount ...)` dan `send(...)`.
5. Backend belum memiliki FCM token untuk employee cashier.
   - `webapp/wash_wallet_be/app/Models/Employee.php` belum memiliki field `fcm_token`.
   - Migration `employees` belum memiliki kolom token device.
   - `EmployeeAuthController` belum memiliki endpoint `auth/fcm-token`.
6. Backend belum terlihat memakai Laravel Reverb.
   - `webapp/wash_wallet_be/composer.json` belum memuat package `laravel/reverb`.
   - Belum ditemukan event broadcast order baru untuk cashier.
7. Cashier home sudah memiliki entry point UI notifikasi, tetapi belum aktif.
   - `apps/cashier/lib/features/home/presentation/screens/home_screen.dart` memiliki icon notification di header.
   - `_handleNotificationTap(BuildContext context)` masih kosong.
8. Order customer sudah memiliki data yang cukup untuk targeting notifikasi outlet.
   - `OrderService::storeCustomer()` membuat order customer dengan `outlet_id`, `customer_account_id`, `source = customer_app`, status `requested` atau `pending_dropoff`, dan `payment_status = not_yet_priced`.
   - Order cashier internal dibuat dari `OrderService::store()` dan langsung masuk status `ready_to_process`, sehingga tidak menjadi prioritas notifikasi order baru untuk cashier.

## 5. Scope Kebutuhan

Scope utama:

1. Notifikasi order baru untuk aplikasi cashier.
2. Event realtime via Laravel Reverb saat aplikasi aktif.
3. Push notification via FCM saat aplikasi background, terminated, atau device locked.
4. Penyimpanan token FCM untuk employee cashier.
5. Targeting notifikasi berdasarkan outlet dan permission employee.
6. Banner in-app, badge jumlah order baru, sound notifikasi, dan navigasi ke order.
7. Sinkronisasi ulang saat app dibuka atau koneksi realtime reconnect.

Di luar scope:

1. Notifikasi WA customer.
2. Notifikasi order untuk aplikasi production atau courier.
3. Redesign menyeluruh dashboard cashier.
4. Perubahan flow status order, payment, penimbangan, atau pickup.
5. Tracking lokasi realtime.
6. Pengiriman broadcast untuk semua perubahan status order selain order baru.

## 6. Definisi Order Baru

Order baru yang perlu memicu notifikasi cashier adalah order yang dibuat dari aplikasi customer dan membutuhkan perhatian outlet.

Kriteria utama:

1. `source` adalah `customer_app`, atau order memiliki `customer_account_id` dari customer app.
2. `outlet_id` terisi.
3. Status awal termasuk:
   - `requested`, untuk order pickup kurir yang menunggu diterima cashier.
   - `pending_dropoff`, untuk order self drop-off yang perlu diketahui outlet.
4. Order yang dibuat langsung oleh cashier dari POS tidak perlu memicu notifikasi keras ke cashier yang sama, karena cashier sedang melakukan input order tersebut.

Jika implementasi menemukan kondisi source belum konsisten pada order lama, plan perlu menetapkan fallback yang aman berdasarkan endpoint pembuat order atau keberadaan `customer_account_id`.

## 7. Penerima Notifikasi

Notifikasi order baru hanya boleh diterima oleh employee yang relevan.

Aturan penerima:

1. Employee aktif.
2. Employee berada pada outlet yang sama dengan `order.outlet_id`.
3. Employee memiliki akses order, minimal permission `order.view`.
4. Untuk aksi tindak lanjut seperti accept/reject, employee idealnya memiliki `order.manage`, tetapi notifikasi dapat ditampilkan untuk employee dengan `order.view`.
5. Employee di outlet lain tidak boleh menerima event atau push.
6. Jika satu employee login pada lebih dari satu device, semua device aktif milik employee tersebut boleh menerima push.
7. Jika employee logout dari sebuah device, device tersebut tidak boleh lagi menerima push untuk akun lama.

## 8. Perilaku Realtime Saat App Aktif

Saat aplikasi cashier aktif atau foreground:

1. App membuka koneksi realtime ke Laravel Reverb setelah user authenticated.
2. App subscribe ke channel private yang relevan dengan outlet employee.
3. Saat order baru masuk, backend mengirim event realtime ke channel outlet tersebut.
4. App menampilkan banner in-app yang jelas dan tidak menghalangi pekerjaan utama terlalu lama.
5. App menambah badge jumlah order baru.
6. App memutar sound notifikasi.
7. App dapat me-refresh count atau list order baru tanpa user menarik refresh manual.
8. Jika cashier mengetuk banner, app membuka detail order atau daftar order dengan filter order baru.
9. Jika cashier sedang berada di halaman daftar order, list harus bisa diperbarui agar order baru terlihat.
10. Jika cashier sedang berada di flow input order, banner tetap muncul tetapi tidak boleh membatalkan input yang sedang berjalan.

## 9. Perilaku FCM Saat App Tidak Aktif

Saat aplikasi cashier background, terminated, atau device locked:

1. Backend mengirim FCM push ke device token employee cashier yang relevan.
2. Push notification menampilkan informasi ringkas order baru.
3. Tap pada push membuka aplikasi cashier dan mengarahkan user ke detail order atau daftar order baru.
4. Jika user belum login atau token auth sudah invalid, app harus mengarahkan ke login tanpa kehilangan konteks bahwa ada order baru.
5. Setelah app aktif kembali, app melakukan sync ulang ke backend untuk memastikan order baru benar-benar masuk ke list dan badge.

## 10. Payload Notifikasi

Payload event Reverb dan FCM perlu konsisten agar app bisa memakai satu handler notifikasi.

Informasi minimal:

| Field | Kebutuhan |
| --- | --- |
| `type` | Nilai stabil seperti `cashier_new_order` |
| `eventId` | ID unik event untuk deduplication |
| `orderId` | ID order |
| `orderNumber` | Nomor order untuk ditampilkan |
| `outletId` | Outlet tujuan |
| `status` | Status awal order, misalnya `requested` atau `pending_dropoff` |
| `customerName` | Nama customer jika tersedia |
| `deliveryType` atau `pickupType` | Konteks pickup/drop-off jika tersedia |
| `createdAt` | Timestamp order/event |

Konten notifikasi yang diharapkan:

1. Title singkat, misalnya `Order Baru Masuk`.
2. Body informatif, misalnya `Order #ORD... dari Budi menunggu diproses`.
3. Data payload cukup untuk navigasi tanpa perlu parsing title/body.

## 11. Deduplication dan Sinkronisasi

Karena Reverb dan FCM dapat sama-sama diterima dalam beberapa kondisi, app perlu menghindari duplikasi alert.

Kebutuhan:

1. App menyimpan event/order yang baru saja ditampilkan dalam memori atau local lightweight cache.
2. Event dengan `eventId` atau `orderId` yang sama tidak boleh memunculkan banner/sound berulang dalam waktu dekat.
3. Badge tidak boleh bertambah dua kali untuk order yang sama.
4. Saat Reverb reconnect, app melakukan fetch count/list order baru dari backend.
5. Saat app resume dari background, app melakukan sync ulang count/list order baru.
6. Jika event realtime terlewat, data order tetap muncul setelah sync.

## 12. Kebutuhan UI/UX Cashier

UI yang diharapkan:

1. Badge jumlah order baru pada icon notification di header home.
2. Banner in-app saat order baru masuk.
3. Sound notifikasi saat app aktif.
4. Tap banner atau push membuka detail order atau daftar order dengan filter `requested`/order baru.
5. Tap icon notification membuka daftar notifikasi/order baru, bukan handler kosong.
6. Cashier dapat mengosongkan badge setelah membuka daftar order baru atau setelah order ditindaklanjuti.
7. Visual notifikasi harus jelas tetapi tidak mengganggu input transaksi yang sedang berjalan.

Preferensi copy:

1. Gunakan bahasa operasional yang langsung dipahami cashier.
2. Hindari istilah teknis seperti Reverb, websocket, atau FCM di UI.
3. Fokus teks pada tindakan: order baru, nomor order, nama customer, dan status menunggu diproses.

## 13. Kebutuhan Backend

Backend perlu menyediakan kemampuan berikut:

1. Broadcast event order baru setelah transaksi order customer berhasil commit.
2. Event hanya dikirim untuk order customer yang memenuhi definisi order baru.
3. Private channel harus membatasi penerima berdasarkan outlet dan employee permission.
4. FCM token employee cashier harus dapat disimpan, diperbarui, dan dinonaktifkan saat logout.
5. Service FCM perlu mendukung pengiriman ke employee/device cashier, bukan hanya customer.
6. Jika push ke token gagal permanen, token harus bisa ditandai invalid atau dibersihkan.
7. Kegagalan FCM tidak boleh membatalkan pembuatan order.
8. Kegagalan Reverb broadcast tidak boleh membatalkan pembuatan order, tetapi harus tercatat di log.

## 14. Kebutuhan Aplikasi Cashier

Cashier app perlu menyediakan kemampuan berikut:

1. Initialize Firebase untuk app cashier.
2. Request permission notification sesuai platform.
3. Mengambil FCM token setelah login atau saat auth status valid.
4. Mengirim token ke backend cashier auth endpoint.
5. Mendengarkan token refresh dari FCM dan memperbarui backend.
6. Menghubungkan Reverb hanya setelah user authenticated.
7. Subscribe channel berdasarkan outlet employee.
8. Unsubscribe dan disconnect saat logout.
9. Mendengarkan FCM foreground/background/tap event.
10. Memutar sound saat order baru masuk di foreground.
11. Menampilkan banner dan badge order baru.
12. Melakukan sync ulang saat app resume dan saat realtime reconnect.

## 15. Edge Cases

1. Cashier sedang login tetapi permission order dicabut.
   - Notifikasi baru tidak boleh diterima setelah permission tidak valid.
2. Cashier pindah outlet atau posisi.
   - Channel dan targeting harus mengikuti data auth terbaru.
3. Device offline saat order dibuat.
   - FCM atau sync saat resume harus membuat cashier tetap melihat order baru.
4. Reverb disconnect.
   - App harus reconnect dan sync ulang.
5. FCM token berubah.
   - Backend harus menerima token baru dan tidak bergantung pada token lama.
6. Banyak order masuk berdekatan.
   - Badge bertambah sesuai jumlah order unik; banner tidak boleh membuat UI kacau.
7. Cashier membuka order dari push yang sudah ditindaklanjuti user lain.
   - App tetap membuka detail order dan menampilkan status terbaru dari backend.
8. App dibuka dari push tetapi user belum authenticated.
   - App login dulu, lalu arahkan ke order jika masih punya akses.

## 16. Acceptance Criteria

1. Saat customer membuat order pickup baru, cashier outlet terkait yang sedang membuka aplikasi menerima banner realtime.
2. Banner realtime menampilkan nomor order dan nama customer jika tersedia.
3. Badge order baru bertambah saat order baru diterima.
4. Sound notifikasi berbunyi saat app aktif.
5. Saat cashier tap banner, app membuka detail order atau daftar order baru.
6. Saat app background, device menerima push notification FCM.
7. Saat push ditap, app membuka konteks order yang benar setelah auth valid.
8. Employee cashier beda outlet tidak menerima event atau push order tersebut.
9. Employee tanpa permission order tidak menerima event atau push order tersebut.
10. Order yang dibuat langsung dari app cashier tidak memicu notifikasi order baru ke cashier yang sama.
11. Duplicate event Reverb/FCM tidak membuat banner, badge, atau sound ganda untuk order yang sama.
12. Setelah app resume atau Reverb reconnect, badge/list order baru sinkron dengan backend.
13. Logout membuat device tidak lagi menerima push untuk employee yang logout.
14. Kegagalan kirim Reverb atau FCM tidak menggagalkan proses pembuatan order.

## 17. Verifikasi yang Diharapkan pada Plan

Plan implementasi berikutnya perlu mencakup minimal:

1. Test backend untuk event order baru hanya dikirim ke outlet yang benar.
2. Test backend untuk permission channel private.
3. Test backend untuk register/update/delete atau invalidate FCM token employee.
4. Test backend bahwa order customer baru memicu event setelah commit.
5. Test backend bahwa order cashier internal tidak memicu notifikasi order baru.
6. Test Flutter untuk handler payload order baru, badge, dan deduplication.
7. Test manual foreground: banner, badge, sound, dan navigasi.
8. Test manual background/terminated: push muncul dan tap membuka order.
9. Test reconnect/resume: app sync ulang dan tidak kehilangan order.

## 18. Catatan untuk Penyusun Plan

Dokumen plan berikutnya harus mempertimbangkan bahwa ini adalah fitur lintas backend dan Flutter. Implementasi sebaiknya dipisah menjadi beberapa bagian yang jelas:

1. Backend Reverb dan broadcast authorization.
2. Backend employee FCM token/device management.
3. Backend trigger order baru.
4. Cashier app notification service lifecycle.
5. Cashier app UI banner, badge, sound, dan navigation.
6. Testing dan konfigurasi environment.

Plan juga perlu menentukan apakah token FCM disimpan sebagai satu kolom pada `employees` atau sebagai tabel device terpisah. Untuk kebutuhan operasional multi-device dan logout per-device, tabel device/token terpisah lebih sesuai daripada satu kolom `fcm_token` di `employees`.

## Status

User need selesai disusun sebagai acuan penyusunan implementation plan sistem notifikasi order baru cashier dengan Laravel Reverb dan FCM.
