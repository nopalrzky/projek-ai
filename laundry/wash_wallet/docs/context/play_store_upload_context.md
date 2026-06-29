# Context: Upload WashWallet Apps ke Google Play

Tanggal review: 2026-06-23

Dokumen ini merangkum konteks codebase, arsitektur, status kesiapan Android release, dan checklist yang dibutuhkan untuk mengupload tiga aplikasi Flutter WashWallet ke Google Play:

- `apps/cashier`
- `apps/customer`
- `apps/production`

Dokumen ini ditulis dari pembacaan codebase saat ini dan pengecekan dokumentasi resmi Google/Flutter pada 2026-06-23.

## Ringkasan Eksekutif

Repositori ini adalah monorepo Flutter dengan tiga app mobile dan empat package shared:

- `apps/cashier`: aplikasi POS/front office untuk kasir outlet.
- `apps/customer`: aplikasi customer-facing untuk discovery outlet, checkout order, alamat, wallet/topup, invoice, dan order tracking.
- `apps/production`: aplikasi operasional internal untuk produksi, kurir pickup, item process, bukti foto, print, dan notifikasi pickup.
- `packages/wash_wallet_core`: network, API endpoints, secure storage, token, failures, result, printer service.
- `packages/wash_wallet_domain`: entity/usecase/domain model shared.
- `packages/wash_wallet_data`: datasource/repository shared untuk auth dan data common.
- `packages/wash_wallet_ui`: design system, theme, layout, component shared.

Secara arsitektur aplikasi sudah cukup matang untuk produk real: feature-based Clean Architecture, BLoC/Cubit, Dio, shared UI system, secure storage, Firebase Messaging, Pusher/Reverb style realtime channel, dan backend Laravel Sanctum.

Namun, secara Play Store release, ketiga app belum siap langsung upload. Blocker utama:

1. Release build masih memakai debug signing di semua app.
2. `cashier` dan `production` masih memakai `applicationId`/`namespace` `com.example...`.
3. `customer` release manifest belum mendeklarasikan `INTERNET`, padahal app bergantung pada API.
4. `customer` mengaktifkan `android:usesCleartextTraffic="true"`, perlu dimatikan untuk produksi HTTPS.
5. `production` memakai Firebase Messaging di Dart, tetapi tidak punya `google-services.json` dan tidak menerapkan plugin `com.google.gms.google-services`.
6. Default `API_BASE_URL` semua app masih `http://10.0.2.2:8000/api`, sehingga release harus memakai `--dart-define` atau config build production.
7. Privacy policy publik belum terlihat sebagai route aktif, walau footer web mengarah ke `/privacy` dan `/terms`.
8. App label, icon, feature graphic, screenshot, reviewer credentials, dan Data safety form belum siap sebagai artefak Play Console.

## Persyaratan Google Play yang Berlaku

Sumber resmi yang dicek:

- Target API level: https://support.google.com/googleplay/android-developer/answer/11926878
- Android App Bundle: https://developer.android.com/guide/app-bundle
- Play App Signing: https://support.google.com/googleplay/android-developer/answer/9842756
- App content/review: https://support.google.com/googleplay/android-developer/answer/9859455
- Testing personal developer account: https://support.google.com/googleplay/android-developer/answer/14151465
- Store preview assets: https://support.google.com/googleplay/android-developer/answer/9866151
- Data safety section: https://support.google.com/googleplay/android-developer/answer/10787469
- Flutter Android release: https://docs.flutter.dev/deployment/android

Per dokumentasi resmi Google yang dibaca pada 2026-06-23:

- Mulai 2025-08-31, new apps dan app updates untuk Android mobile harus target Android 15/API 35 atau lebih tinggi.
- Existing apps minimal target Android 14/API 34 agar tetap tersedia untuk new users di OS Android yang lebih baru dari target app.
- New apps di Google Play wajib dipublish sebagai Android App Bundle (`.aab`), bukan APK.
- Play App Signing memakai dua key: upload key yang dipegang developer dan app signing key yang dipegang Google Play.
- App yang seluruh atau sebagian fiturnya terkunci login wajib menyediakan sign-in details untuk reviewer.
- App dengan sensitive permissions/data wajib punya privacy policy aktif di store listing dan di dalam app.
- Jika developer account adalah personal account baru setelah 2023-11-13, Google mewajibkan closed test dengan minimal 12 tester yang opt-in selama 14 hari berturut-turut sebelum production access.
- Store listing wajib memiliki app icon 512x512 PNG, short description maksimal 80 karakter, feature graphic 1024x500, dan minimal dua screenshot. Google merekomendasikan minimal empat screenshot app dengan resolusi minimal 1080px untuk eligibility promosi.

Catatan: target API adalah kebijakan tahunan. Walau halaman resmi yang dibaca masih menyebut API 35+, codebase saat ini memakai Flutter SDK yang default target SDK-nya 36. Itu memenuhi API 35+ dan lebih aman untuk perubahan berikutnya, tetapi tetap verifikasi lagi di Play Console tepat sebelum submission final.

## Status Toolchain Lokal

Flutter metadata dibaca dari `C:\tools\flutter\bin\cache\flutter.version.json` karena `flutter --version` menggantung di environment ini.

- Flutter: 3.38.4 stable
- Dart SDK: 3.10.3
- Flutter Gradle default:
  - `compileSdkVersion = 36`
  - `targetSdkVersion = 36`
  - `minSdkVersion = 24`
  - `ndkVersion = 28.2.13676358`
- Android SDK lokal berisi platform `android-30` sampai `android-36`.

Implikasi:

- Dari sisi target SDK, app saat ini seharusnya memenuhi requirement Play Store yang tercatat (API 35+).
- Karena semua app memakai `compileSdk = flutter.compileSdkVersion` dan `targetSdk = flutter.targetSdkVersion`, target final mengikuti Flutter SDK lokal/CI.
- Pastikan CI/build machine juga punya Android SDK 36 atau pin target SDK eksplisit bila ingin build reproducible.

## Arsitektur Codebase

### Monorepo Flutter

Root `pubspec.yaml` memakai Dart workspace:

- `apps/cashier`
- `apps/production`
- `apps/customer`
- `packages/wash_wallet_core`
- `packages/wash_wallet_domain`
- `packages/wash_wallet_data`
- `packages/wash_wallet_ui`

Root juga memakai `melos` dengan script:

- `melos run analyze`
- `melos run build_runner`
- `melos run clean`
- `melos run get`
- `melos run test`

### Pola Aplikasi

Ketiga app memakai pola feature-based Clean Architecture:

- `presentation`: screen, widget, bloc/cubit, provider/presentation composition.
- `domain`: entity, repository contract, usecase, domain service.
- `data`: model, remote/local datasource, repository implementation.
- `core`: router, navigation coordinator, service, widget app-level.

State management utama memakai `flutter_bloc` Cubit. Routing memakai `go_router`.

### Network dan Auth

`packages/wash_wallet_core/lib/src/network/api/api_endpoints.dart` membagi endpoint mobile menjadi:

- `ApiEndpoints.cashier()` -> `/mobile/cashier`
- `ApiEndpoints.customer()` -> `/mobile/customer`
- `ApiEndpoints.production()` -> `/mobile/production`

Semua app membuat `DioConfig` dengan:

- base URL dari `String.fromEnvironment('API_BASE_URL')`
- default local emulator: `http://10.0.2.2:8000/api`
- timeout connect/send 30 detik, receive 60 detik
- `AuthInterceptor` untuk header `Authorization: Bearer <token>`
- `LoggingInterceptor`

Token disimpan dengan `FlutterSecureStorage` melalui `SecureStorageProvider`, memakai encrypted shared preferences di Android.

### Backend

Backend ada di `webapp/wash_wallet_be`:

- Laravel 13
- PHP 8.4.21
- Laravel Sanctum untuk auth API
- Laravel Reverb/broadcasting untuk realtime channel
- Kreait Firebase untuk server-side FCM
- Midtrans untuk pembayaran/topup
- Fonnte untuk WhatsApp gateway
- Spatie Permission untuk role/permission
- Inertia + React + Vite untuk web dashboard

Route mobile utama:

- `routes/api_mobile_cashier.php`
- `routes/api_mobile_customer.php`
- `routes/api_mobile_production.php`

Channel broadcast:

- `outlet.{outletId}` guard `sanctum`
- `customer.{customerId}` guard `customer_sanctum`

Backend production harus punya HTTPS public URL, queue, storage public, database production, Firebase credential, Midtrans production config, Fonnte token, dan Reverb/Pusher-compatible broadcast config sebelum mobile app dirilis.

## Peran Tiap Aplikasi

### Cashier App

Lokasi: `apps/cashier`

Peran produk:

- POS outlet laundry.
- Login employee/kasir.
- Dashboard outlet.
- New order notification.
- Order creation, accept/reject, weigh order, payment.
- Customer, membership, service, finance, deposit, expense, petty cash.
- Thermal printer receipt/label.
- WhatsApp notification modal.

Feature folder utama:

- `auth`
- `home`
- `order`
- `customer`
- `deposit`
- `expense`
- `petty_cash`
- `finances`
- `print`
- `setting`
- `wa_notification`
- master data: `category`, `laundry_service`, `service_package`, `membership_plan`, `unit`, `employee`

Runtime integration:

- Firebase Messaging
- Flutter Local Notifications
- Pusher Channels
- Audio notification
- Bluetooth thermal printer
- Camera/gallery for proof images
- Secure storage and SharedPreferences
- Hive

### Customer App

Lokasi: `apps/customer`

Peran produk:

- Customer-facing marketplace/self-service laundry app.
- OTP/register/login password.
- Home dashboard customer.
- Search/discovery outlet dan service.
- Address book dan lokasi.
- Checkout order dengan courier/self dropoff.
- Courier schedule dan fee calculation.
- Order history, invoice, payment, review.
- Wallet/topup.
- Profile dan password setup.
- Push notification order accepted/topup success.

Feature folder utama:

- `auth`
- `home`
- `discovery`
- `search`
- `outlet`
- `order`
- `customer_address`
- `courier_schedule`
- `courier_pricing`
- `topup`
- `profile`
- `promo`

Runtime integration:

- Firebase Messaging
- Flutter Local Notifications
- Geolocator
- Google Maps Flutter
- Google Places API via HTTP
- Geocoding
- URL launcher
- SharedPreferences cart/search history
- Secure storage

### Production App

Lokasi: `apps/production`

Peran produk:

- Operational execution layer untuk staf produksi dan kurir.
- Login employee.
- Permission-aware access untuk `production.view`, `courier.view`, `courier.manage`.
- Dashboard produksi.
- Order ready/in-progress.
- Item-level production tracking.
- Courier pickup schedule.
- Pickup confirmation dengan foto bukti.
- WhatsApp pickup notification.
- Thermal printer.
- Push/realtime new pickup notification.

Feature folder utama:

- `auth`
- `home`
- `order`
- `order_item`
- `order_item_process`
- `print`
- `wa_notification`
- `no_permission`
- `splash`
- `onboarding`

Runtime integration:

- Firebase Messaging
- Flutter Local Notifications
- Pusher Channels
- Audio notification
- Image picker/camera
- URL launcher for Google Maps
- Bluetooth thermal printer
- Secure storage, SharedPreferences, Hive

## Status Android Release Saat Ini

### Ringkasan Konfigurasi

| App | applicationId saat ini | Label manifest | Firebase Android config | Release signing | Catatan |
| --- | --- | --- | --- | --- | --- |
| cashier | `com.example.app_new` | `Wash Wallet` | Ada `google-services.json`, package `com.example.app_new` | Debug signing | Harus ganti applicationId final sebelum release pertama |
| customer | `com.washwallet.customer` | `wash_wallet_customer` | Ada `google-services.json`, package `com.washwallet.customer` | Debug signing | ApplicationId cukup layak, tetapi manifest release perlu dibenahi |
| production | `com.example.wash_wallet_production` | `wash_wallet_production` | Tidak ada `google-services.json`, plugin Google services belum dipasang | Debug signing | Firebase Messaging tidak siap untuk release |

### Build System

| App | AGP | Kotlin | Gradle wrapper |
| --- | --- | --- | --- |
| cashier | 8.9.1 | 2.1.0 | 8.11.1 |
| customer | 8.9.1 | 2.1.21 | 8.11.1 |
| production | 8.11.1 | 2.2.20 | 8.14 |

Catatan:

- `production` paling selaras dengan Flutter template 3.38.4.
- `cashier` dan `customer` masih memakai AGP/Kotlin lebih lama, tapi tetap kemungkinan buildable.
- Untuk jangka panjang, sebaiknya samakan Android toolchain ketiga app agar masalah Gradle/Kotlin tidak berbeda per app.

### Permissions Manifest

Cashier main manifest:

- `INTERNET`
- `POST_NOTIFICATIONS`
- `CAMERA`
- `READ_EXTERNAL_STORAGE` max SDK 32
- `WRITE_EXTERNAL_STORAGE` max SDK 32
- `READ_MEDIA_IMAGES`
- `BLUETOOTH`, `BLUETOOTH_ADMIN`, `BLUETOOTH_CONNECT`, `BLUETOOTH_SCAN`
- `uses-feature android.hardware.bluetooth required=false`

Customer main manifest:

- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`
- `android:usesCleartextTraffic="true"`
- Google Maps API key hardcoded in manifest
- Tidak ada `INTERNET` di main manifest
- Tidak ada explicit `POST_NOTIFICATIONS`

Production main manifest:

- `INTERNET`
- `CAMERA`
- `READ_EXTERNAL_STORAGE` max SDK 32
- `WRITE_EXTERNAL_STORAGE` max SDK 32
- `READ_MEDIA_IMAGES`
- `BLUETOOTH`, `BLUETOOTH_ADMIN`, `BLUETOOTH_CONNECT`, `BLUETOOTH_SCAN`
- `uses-feature android.hardware.bluetooth required=false`
- Tidak ada explicit `POST_NOTIFICATIONS`

Risiko:

- Customer release build kemungkinan tidak bisa akses jaringan tanpa `INTERNET` di `src/main/AndroidManifest.xml`.
- `usesCleartextTraffic=true` customer tidak layak untuk release publik jika backend sudah HTTPS.
- Customer/production perlu explicit `POST_NOTIFICATIONS` jika mengandalkan runtime notification permission Android 13+.
- Bluetooth permission harus bisa dijelaskan sebagai fungsi printer thermal, bukan location tracking. `neverForLocation` sudah dipakai untuk scan.
- Google Maps API key customer harus dibatasi dengan package name dan SHA-1/SHA-256 app signing key Play, bukan hanya upload key lokal.

## Blocker Wajib Sebelum Upload

### 1. Tentukan Application ID Permanen

Application ID tidak bisa diganti setelah app dipublish di Play Store. Rekomendasi:

- Cashier: `com.washwallet.cashier`
- Customer: `com.washwallet.customer`
- Production: `com.washwallet.production`

Jika app sudah pernah publish dengan ID lama, jangan ganti tanpa strategi migrasi. Jika belum pernah publish, ganti sebelum upload pertama.

File yang perlu disesuaikan:

- `apps/cashier/android/app/build.gradle.kts`
- `apps/customer/android/app/build.gradle.kts` jika ingin rename namespace/label saja tidak perlu ganti ID
- `apps/production/android/app/build.gradle.kts`
- Kotlin MainActivity package path bila namespace/applicationId berubah dan package lama tidak lagi sesuai
- Firebase Android app package name dan `google-services.json`
- Google Maps API restrictions
- Any backend allowlist/package assumptions jika ada

### 2. Buat Release Signing Config

Saat ini semua app:

```kotlin
release {
    signingConfig = signingConfigs.getByName("debug")
}
```

Ini tidak boleh dipakai untuk Play Store production.

Yang dibutuhkan:

- Buat upload keystore per developer/account strategy.
- Simpan keystore di lokasi aman, jangan commit ke repo.
- Buat `key.properties` per app atau shared secure path.
- Tambahkan `signingConfigs.create("release")`.
- Set `buildTypes.release.signingConfig = signingConfigs.getByName("release")`.
- Aktifkan Play App Signing di Play Console.

Catatan Play App Signing:

- Upload key dipakai developer untuk sign AAB sebelum upload.
- App signing key dipegang Google untuk APK yang dikirim ke user.
- Untuk Google Maps/Firebase/OAuth, register fingerprint app signing key dari Play Console setelah upload, bukan hanya fingerprint upload key lokal.

### 3. Siapkan Firebase Per App

Saat ini:

- Cashier dan customer punya `google-services.json`.
- Production belum punya `google-services.json` dan build script belum apply Google services plugin.

Checklist:

- Buat Firebase Android app untuk masing-masing final package name.
- Download `google-services.json` sesuai package final.
- Pastikan `cashier` dan `production` package final cocok dengan file Firebase.
- Tambahkan Google services plugin ke production jika FCM tetap dipakai.
- Tambahkan SHA-1/SHA-256 upload key dan app signing key di Firebase jika diperlukan.
- Validasi FCM token registration ke backend.

### 4. Pakai API Production HTTPS

Semua app default ke:

```dart
http://10.0.2.2:8000/api
```

Release harus dibuild dengan:

```powershell
--dart-define=API_BASE_URL=https://<domain-produksi>/api
```

Untuk cashier dan production, realtime Pusher/Reverb juga butuh:

```powershell
--dart-define=PUSHER_APP_KEY=<key>
--dart-define=PUSHER_CLUSTER=<cluster>
--dart-define=BROADCASTING_AUTH_URL=https://<domain-produksi>/broadcasting/auth
```

Jika `BROADCASTING_AUTH_URL` tidak diberikan, app membuat URL dari `API_BASE_URL` dengan mengganti `/api` menjadi `/broadcasting/auth`.

### 5. Benahi Manifest Produksi

Wajib:

- Tambahkan `INTERNET` ke customer main manifest.
- Hapus atau matikan `usesCleartextTraffic=true` di customer untuk release HTTPS.
- Tambahkan `POST_NOTIFICATIONS` di customer/production jika notification harus tampil di Android 13+.
- Pastikan permission yang tidak dipakai benar-benar dihapus.
- Pastikan privacy policy menjelaskan permission yang dipakai.

### 6. App Label dan Icon

Saat ini label masih campur:

- Cashier: `Wash Wallet`
- Customer: `wash_wallet_customer`
- Production: `wash_wallet_production`

Rekomendasi:

- `WashWallet Cashier`
- `WashWallet Customer`
- `WashWallet Production`

Launcher icon masih default Flutter-style `ic_launcher` di tiap mipmap. Untuk release:

- Buat launcher icon final.
- Buat Play Store icon 512x512 PNG.
- Pastikan icon app dan store listing konsisten.
- Jangan memasukkan badge klaim seperti "best", "free", "#1".

### 7. Privacy Policy dan Terms

Google mewajibkan privacy policy untuk app yang mengakses sensitive permissions/data. Ketiga app memenuhi kondisi tersebut.

Saat ini footer web mengarah ke `/privacy` dan `/terms`, tetapi route aktif tidak ditemukan di `routes/web.php`.

Wajib:

- Buat halaman public HTTPS untuk Privacy Policy.
- Buat halaman Terms/Terms of Service.
- Link privacy policy di Play Console.
- Tambahkan link privacy policy di dalam app, biasanya di profile/settings/about.
- Pastikan policy mencakup customer data, employee data, lokasi, foto, notifikasi, FCM token/device ID, payment/topup data, order data, third-party services, retention, deletion request, dan contact.

### 8. Reviewer Credentials

Karena app memakai login/restricted access, Play Console harus diisi sign-in details.

Siapkan maksimal lima set instruksi reviewer:

- Customer app:
  - Nomor HP test yang bisa login tanpa OTP eksternal, atau OTP statis khusus review.
  - Akun dengan primary address, wallet/topup sample, order sample.
  - Instruksi jika memilih outlet, checkout, invoice, topup.
- Cashier app:
  - Username/password employee cashier.
  - Outlet test dengan data layanan, customer, order, printer path boleh dijelaskan tanpa printer fisik.
  - Role permission lengkap: `order.view`, `order.create`, `order.manage`, `payment.manage`, `customer.view/manage`, `service.view/manage`.
- Production app:
  - Username/password employee produksi.
  - Username/password employee kurir jika fitur kurir perlu diuji.
  - Data order ready/in progress dan pickup schedule sample.

Reviewer harus bisa melewati OTP dan permission blocker tanpa menghubungi developer.

## Build Command Draft

Jalankan dari root untuk dependency:

```powershell
flutter pub get
```

Atau dengan workspace:

```powershell
melos bootstrap
```

Build AAB per app:

```powershell
cd apps\cashier
flutter build appbundle --release --build-name=1.0.0 --build-number=1 --dart-define=API_BASE_URL=https://api.example.com/api --dart-define=PUSHER_APP_KEY=<key> --dart-define=PUSHER_CLUSTER=<cluster> --dart-define=BROADCASTING_AUTH_URL=https://api.example.com/broadcasting/auth
```

```powershell
cd apps\customer
flutter build appbundle --release --build-name=1.0.0 --build-number=1 --dart-define=API_BASE_URL=https://api.example.com/api
```

```powershell
cd apps\production
flutter build appbundle --release --build-name=1.0.0 --build-number=1 --dart-define=API_BASE_URL=https://api.example.com/api --dart-define=PUSHER_APP_KEY=<key> --dart-define=PUSHER_CLUSTER=<cluster> --dart-define=BROADCASTING_AUTH_URL=https://api.example.com/broadcasting/auth
```

Output umum:

```text
build/app/outputs/bundle/release/app-release.aab
```

Catatan:

- Jangan upload APK untuk production Play Store new app; gunakan AAB.
- Naikkan `--build-number` setiap upload release baru.
- Jangan pakai domain localhost/emulator.
- Jangan commit secret command ke repo.

## Play Console Setup Per App

Setiap aplikasi sebaiknya dibuat sebagai Play Console app terpisah karena package name dan audience berbeda.

### Customer App

Distribusi yang disarankan:

- Public app.
- Category: bisnis, lifestyle, atau tools sesuai positioning final.
- Target audience: dewasa/umum, bukan anak-anak.
- Ads: kemungkinan `No`, kecuali ada ad SDK di kemudian hari.
- App access: login required, sediakan akun/OTP test.

Store listing draft:

- App name: `WashWallet Customer`
- Short description <= 80 chars: `Pesan laundry, atur pickup, bayar, dan pantau order dalam satu app`
- Core screenshots:
  1. Home dashboard.
  2. Discovery/search outlet.
  3. Outlet detail/service selection.
  4. Checkout order.
  5. Order detail/invoice.
  6. Address book.
  7. Topup/payment instruction.
  8. Profile.

### Cashier App

Distribusi yang disarankan:

- Jika hanya untuk staf outlet internal satu organisasi: pertimbangkan private app/managed distribution.
- Jika untuk banyak outlet/mitra yang akan install dari Play Store: public/unlisted app dengan sign-in required.
- App access wajib karena semua fitur butuh login employee.

Store listing draft:

- App name: `WashWallet Cashier`
- Short description <= 80 chars: `POS laundry untuk order, pembayaran, pelanggan, dan print struk`
- Core screenshots:
  1. Login.
  2. Dashboard cashier.
  3. Order list/new order banner.
  4. Create/review order.
  5. Weigh order.
  6. Order detail/payment.
  7. Print modal/printer setting.
  8. Finance menu.

### Production App

Distribusi yang disarankan:

- Jika hanya untuk staf internal satu organisasi: pertimbangkan private app/managed distribution.
- Jika untuk staf banyak outlet/mitra: public/unlisted app dengan sign-in required.

Store listing draft:

- App name: `WashWallet Production`
- Short description <= 80 chars: `Kelola produksi laundry, jadwal pickup, bukti foto, dan print label`
- Core screenshots:
  1. Login.
  2. No permission or role-aware dashboard.
  3. Production dashboard.
  4. Order ready/in progress tabs.
  5. Order detail.
  6. Item process detail.
  7. Pickup schedule.
  8. Pickup proof photo/WhatsApp modal.

## Data Safety Draft

Bagian ini bukan pengganti legal review. Gunakan sebagai starting point untuk Data safety form dan privacy policy.

### Data yang Kemungkinan Dikumpulkan Semua App

- Account identifiers:
  - auth token
  - user/customer/employee ID
  - FCM token
  - generated device ID untuk notification registration
- Personal info:
  - nama employee/customer
  - nomor telepon
  - email bila tersedia
- App activity:
  - action order/payment/production yang dikirim ke backend
- Diagnostics/logs:
  - tidak terlihat Crashlytics, tetapi server/backend log tetap mencatat request/error
- Device or other IDs:
  - FCM token dan generated UUID device ID

Purpose:

- App functionality
- Account management
- Fraud prevention, security, and compliance
- Developer communications, jika notification atau WA dipakai untuk status transaksi

### Customer App

Data tambahan:

- Precise/coarse location untuk nearby outlet, address picker, courier fee.
- Address book: recipient name, phone, street, notes, latitude, longitude, province/regency/district/village metadata.
- Payment/topup/order data: topup amount, payment method, invoice/payment URL, wallet balance, order amount.
- Profile data: gender dan date of birth jika user mengisi.
- Reviews/rating/order feedback.

Sensitive permissions:

- Location.
- Notification.

Third-party/service touchpoints:

- Firebase Messaging.
- Google Maps/Places/Geocoding.
- Midtrans via backend/payment URL.

### Cashier App

Data tambahan:

- Employee login and outlet context.
- Customer data yang dibuat/diedit kasir.
- Order data: items, notes, payment status, payment method, paid amount.
- Photo/image attachments untuk deposit/expense/weighing evidence.
- Bluetooth printer device info/MAC selected locally.
- WhatsApp notification preview/send via backend.
- Finance data: deposit, expense, petty cash, account destination.

Sensitive permissions:

- Camera.
- Photos/media.
- Nearby devices/Bluetooth.
- Notification.

Third-party/service touchpoints:

- Firebase Messaging.
- Pusher/Reverb channel.
- Fonnte WhatsApp via backend.

### Production App

Data tambahan:

- Employee login and accessible outlets.
- Customer pickup address and order data shown to courier/production staff.
- Pickup/arrival photo evidence.
- Bluetooth printer selected device.
- WhatsApp notification preview/send via backend.
- Production item process actions.

Sensitive permissions:

- Camera.
- Photos/media.
- Nearby devices/Bluetooth.
- Notification.

Third-party/service touchpoints:

- Firebase Messaging.
- Pusher/Reverb channel.
- Google Maps opened via URL launcher.
- Fonnte WhatsApp via backend.

## Backend Production Checklist

Minimum backend readiness before mobile Play review:

- Public HTTPS API domain.
- `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://...`.
- Database production with seeded roles/permissions/outlet/sample review accounts.
- Laravel Sanctum configured for mobile token auth.
- CORS/API access configured for mobile clients.
- Queue worker active for notifications/payment jobs if needed.
- Storage public link configured for uploaded proof images.
- Firebase server credential at `FIREBASE_CREDENTIALS`.
- Midtrans production keys and callback URL configured.
- Fonnte token configured if WA notification feature remains enabled.
- Reverb/Pusher-compatible broadcasting configured:
  - `BROADCAST_CONNECTION`
  - `REVERB_APP_ID`
  - `REVERB_APP_KEY`
  - `REVERB_APP_SECRET`
  - `REVERB_HOST`
  - `REVERB_PORT`
  - `REVERB_SCHEME`
- Privacy policy and terms public routes deployed.

## Verification Checklist Sebelum Upload

Run minimal:

```powershell
melos run get
melos run analyze
melos run test
```

Build each app release AAB:

```powershell
cd apps\cashier
flutter build appbundle --release ...
```

```powershell
cd apps\customer
flutter build appbundle --release ...
```

```powershell
cd apps\production
flutter build appbundle --release ...
```

Manual QA per app:

- Install release build from generated bundle/APK via internal app sharing or bundletool.
- Login with reviewer/test accounts.
- Verify API production URL is used.
- Verify no debug banner.
- Verify app icon and app name.
- Verify notification permission prompt on Android 13+.
- Verify customer app can access network in release.
- Verify customer app maps and location flow.
- Verify cashier/production printer permission flow without crash if no printer.
- Verify camera/gallery flow on cashier/production.
- Verify Firebase token registration.
- Verify Pusher/Reverb event path for cashier new order and production pickup.
- Verify logout clears notification subscriptions.
- Verify Play pre-launch report does not show crash/blocker.

## Urutan Upload yang Disarankan

1. Finalkan package name, app label, launcher icon, privacy/terms URL.
2. Benahi manifest dan release signing.
3. Siapkan Firebase/Maps key untuk final package name.
4. Deploy backend production HTTPS.
5. Buat tiga app di Play Console.
6. Isi App content:
   - privacy policy
   - ads declaration
   - app access/sign-in details
   - target audience
   - permissions declaration bila diminta
   - content rating
   - data safety
7. Isi store listing:
   - app name
   - short/full description
   - icon 512x512
   - feature graphic 1024x500
   - screenshots
8. Upload AAB ke Internal testing.
9. Uji via Play internal testing/internal app sharing.
10. Jika account personal baru, jalankan closed testing 12 tester/14 hari.
11. Ajukan production access bila dibutuhkan.
12. Upload ke Production track dengan staged rollout kecil.
13. Monitor Play Console Android Vitals, crash, ANR, review feedback, and backend logs.

## File Codebase yang Direview

Mobile:

- `pubspec.yaml`
- `apps/cashier/pubspec.yaml`
- `apps/customer/pubspec.yaml`
- `apps/production/pubspec.yaml`
- `apps/cashier/lib/main.dart`
- `apps/customer/lib/main.dart`
- `apps/production/lib/main.dart`
- `apps/cashier/lib/core/router/app_router.dart`
- `apps/customer/lib/core/router/app_router.dart`
- `apps/production/lib/core/router/app_router.dart`
- `apps/cashier/lib/core/services/notification_service.dart`
- `apps/customer/lib/core/services/customer_notification_service.dart`
- `apps/production/lib/core/services/production_notification_service.dart`
- `packages/wash_wallet_core/lib/src/network/api/api_endpoints.dart`
- `packages/wash_wallet_core/lib/src/network/dio/dio_config.dart`
- `packages/wash_wallet_core/lib/src/network/interceptors/auth_interceptor.dart`
- `packages/wash_wallet_core/lib/src/storage/secure_storage_provider.dart`
- `packages/wash_wallet_core/lib/src/services/thermal_printer_service.dart`

Android:

- `apps/cashier/android/app/build.gradle.kts`
- `apps/customer/android/app/build.gradle.kts`
- `apps/production/android/app/build.gradle.kts`
- `apps/cashier/android/settings.gradle.kts`
- `apps/customer/android/settings.gradle.kts`
- `apps/production/android/settings.gradle.kts`
- `apps/cashier/android/app/src/main/AndroidManifest.xml`
- `apps/customer/android/app/src/main/AndroidManifest.xml`
- `apps/production/android/app/src/main/AndroidManifest.xml`
- `apps/cashier/android/app/google-services.json`
- `apps/customer/android/app/google-services.json`
- `apps/*/android/gradle/wrapper/gradle-wrapper.properties`

Backend:

- `webapp/wash_wallet_be/composer.json`
- `webapp/wash_wallet_be/package.json`
- `webapp/wash_wallet_be/.env.example`
- `webapp/wash_wallet_be/routes/api_mobile_cashier.php`
- `webapp/wash_wallet_be/routes/api_mobile_customer.php`
- `webapp/wash_wallet_be/routes/api_mobile_production.php`
- `webapp/wash_wallet_be/routes/channels.php`
- `webapp/wash_wallet_be/routes/web.php`

Existing context docs:

- `docs/context/cashier_app_portfolio_context.md`
- `docs/context/customer_app_portfolio_context.md`
- `docs/context/production_app_portfolio_context.md`

