# Production WA Notification Route 404 Issue

Tanggal debug: 2026-06-11

Dokumen ini mencatat hasil debug untuk bug tombol "Kirim Notif WA" pada detail order kurir di aplikasi production. Saat tombol membuka preview notifikasi WhatsApp, API mengembalikan 404 karena URL yang dipanggil Flutter tidak terdaftar di route Laravel.

## Gejala

Log Flutter:

```text
Status: 404
URL: http://10.0.2.2:8000/api/mobile/production/orders/592/wa-notification-preview
Data: {
  message: The route api/mobile/production/orders/592/wa-notification-preview could not be found.
}
```

Ekspektasi:

- Kurir membuka detail order dalam perjalanan.
- Kurir klik tombol "Kirim Notif WA".
- Aplikasi memuat preview pesan WA, status coin, dan nomor customer.
- Setelah dikonfirmasi, aplikasi mengirim notifikasi WA ke customer.

Aktual:

- Request preview WA gagal 404.
- Modal WA menampilkan error karena route backend tidak ditemukan.

## Area yang Dicek

- `apps/production/lib/features/wa_notification/data/datasources/wa_notification_remote_datasource.dart`
- `apps/cashier/lib/features/wa_notification/data/datasources/wa_notification_remote_datasource.dart`
- `packages/wash_wallet_core/lib/src/network/api/api_endpoints.dart`
- `webapp/wash_wallet_be/routes/api.php`
- `webapp/wash_wallet_be/routes/api_mobile_production.php`
- `webapp/wash_wallet_be/routes/api_mobile_cashier.php`
- `webapp/wash_wallet_be/app/Http/Controllers/Api/WaNotificationController.php`

## Alur Aktual

1. Production app menggunakan `ApiEndpoints.production()`.
2. Prefix production adalah `/mobile/production`.
3. `WaNotificationRemoteDatasourceImpl.getPreview(orderId)` memanggil:

```dart
_dio.get(_endpoints.waNotificationPreview(orderId));
```

4. `ApiEndpoints.waNotificationPreview(592)` menghasilkan:

```text
/mobile/production/orders/592/wa-notification-preview
```

5. Karena base API adalah `/api`, URL final menjadi:

```text
/api/mobile/production/orders/592/wa-notification-preview
```

6. Laravel tidak punya route tersebut, sehingga response 404.

## Temuan Debug

Helper endpoint shared saat ini:

```dart
String waNotificationPreview(int orderId) =>
    '$_prefix/orders/$orderId/wa-notification-preview';

String waNotificationSend(int orderId) =>
    '$_prefix/orders/$orderId/send-wa-notification';
```

Untuk production, helper tersebut menghasilkan:

```text
GET  /api/mobile/production/orders/{orderId}/wa-notification-preview
POST /api/mobile/production/orders/{orderId}/send-wa-notification
```

Namun backend yang terdaftar di `routes/api.php` adalah:

```php
Route::prefix('orders/{orderId}/wa-notification')
    ->controller(WaNotificationController::class)
    ->group(function () {
        Route::get('preview', 'preview')->name('preview');
        Route::post('send', 'send')->name('send');
    })->whereNumber('orderId');
```

Route backend tersebut berarti:

```text
GET  /api/orders/{orderId}/wa-notification/preview
POST /api/orders/{orderId}/wa-notification/send
```

Di `routes/api_mobile_production.php` tidak ada route:

```text
/mobile/production/orders/{orderId}/wa-notification-preview
/mobile/production/orders/{orderId}/send-wa-notification
/mobile/production/orders/{orderId}/wa-notification/preview
/mobile/production/orders/{orderId}/wa-notification/send
```

Di `routes/api_mobile_cashier.php` juga tidak ada route WA notification mobile, walaupun cashier app memakai datasource dan helper endpoint yang sama.

## Root Cause

Root cause utama: kontrak endpoint frontend dan backend tidak sama.

Ada dua mismatch sekaligus:

1. Prefix mismatch:
   - Flutter production memanggil `/api/mobile/production/...`
   - Backend WA notification saat ini hanya terdaftar di `/api/orders/...`
2. Path shape mismatch:
   - Flutter memakai `/wa-notification-preview` dan `/send-wa-notification`
   - Backend memakai `/wa-notification/preview` dan `/wa-notification/send`

Akibatnya route yang dipanggil aplikasi production tidak pernah cocok dengan route Laravel mana pun.

## Dampak

- Fitur WA notification di aplikasi production gagal saat preview.
- Request send WA juga kemungkinan akan gagal 404 karena endpoint send juga tidak terdaftar.
- Fitur WA notification di cashier berpotensi mengalami masalah yang sama, karena cashier memakai `ApiEndpoints.waNotificationPreview()` dan `ApiEndpoints.waNotificationSend()` yang sama dengan production.

## Arah Perbaikan yang Disarankan

Pilih satu kontrak endpoint canonical, lalu samakan frontend dan backend. Jangan hanya memperbaiki production tanpa mengecek cashier, karena helper endpoint berada di package shared.

### Opsi A: Tambahkan mobile route alias di backend

Tambahkan route WA notification di `routes/api_mobile_production.php` sesuai URL yang saat ini sudah dipanggil Flutter:

```text
GET  /api/mobile/production/orders/{orderId}/wa-notification-preview
POST /api/mobile/production/orders/{orderId}/send-wa-notification
```

Route diarahkan ke:

```php
WaNotificationController::preview
WaNotificationController::send
```

Tambahkan juga route setara di `routes/api_mobile_cashier.php` jika cashier tetap memakai helper endpoint shared yang sama.

Middleware yang perlu dipertimbangkan:

- Production preview: `position.permission:courier.view,courier.manage`
- Production send: `position.permission:courier.manage`
- Cashier preview/send: sesuaikan dengan permission order yang dipakai cashier, kemungkinan `order.view` untuk preview dan `order.manage` untuk send.

Kelebihan:

- Perubahan frontend minimal.
- URL yang sudah dipakai production tidak perlu diubah.

Kekurangan:

- Backend memiliki dua bentuk path WA notification: route global dan route mobile alias.

### Opsi B: Ubah helper endpoint shared agar mengikuti route backend global

Ubah `ApiEndpoints.waNotificationPreview()` dan `ApiEndpoints.waNotificationSend()` menjadi:

```dart
String waNotificationPreview(int orderId) =>
    '/orders/$orderId/wa-notification/preview';

String waNotificationSend(int orderId) =>
    '/orders/$orderId/wa-notification/send';
```

Dengan ini production dan cashier akan memanggil route global yang sudah ada:

```text
GET  /api/orders/{orderId}/wa-notification/preview
POST /api/orders/{orderId}/wa-notification/send
```

Kelebihan:

- Tidak perlu menambah route baru.
- Langsung cocok dengan route backend saat ini.

Kekurangan:

- Mengubah behavior semua app yang memakai helper shared.
- Route global saat ini hanya dilindungi `auth:sanctum` dari controller attribute, tidak ada middleware position permission spesifik di route file.
- Model lain harus memastikan akses production/cashier tetap sesuai aturan permission bisnis.

### Rekomendasi

Rekomendasi paling aman untuk arsitektur mobile app saat ini adalah Opsi A:

1. Tambahkan mobile route alias di `api_mobile_production.php`.
2. Tambahkan mobile route alias di `api_mobile_cashier.php` agar fitur cashier tidak ikut rusak.
3. Gunakan middleware permission app-specific di route mobile.
4. Biarkan helper endpoint Flutter tetap memakai prefix masing-masing app.

Jika ingin merapikan kontrak jangka panjang, setelah Opsi A stabil bisa dibuat refactor terpisah untuk menyatukan path shape menjadi:

```text
/wa-notification/preview
/wa-notification/send
```

## Acceptance Criteria

- `GET /api/mobile/production/orders/{orderId}/wa-notification-preview` tidak lagi 404.
- `POST /api/mobile/production/orders/{orderId}/send-wa-notification` tidak lagi 404.
- Kurir dengan permission yang sesuai bisa memuat preview WA dari detail order.
- Kurir tanpa permission yang sesuai menerima response permission error, bukan 404.
- Tombol "Kirim Notif WA" berhasil mengirim notifikasi dan menampilkan snackbar sukses di production app.
- Cashier WA notification tetap berfungsi atau ikut mendapatkan route alias yang sesuai.
- Tidak ada perubahan yang merusak route global `/api/orders/{orderId}/wa-notification/preview` dan `/api/orders/{orderId}/wa-notification/send`, kecuali memang sengaja dimigrasikan.

## Verifikasi yang Disarankan

Setelah implementasi, jalankan:

```bash
php artisan route:list --path=mobile/production/orders
php artisan route:list --path=mobile/cashier/orders
php artisan route:list --path=wa-notification
```

Lalu test manual dari emulator:

1. Login production sebagai employee dengan akses kurir.
2. Buka tab kurir.
3. Buka order dalam perjalanan atau penjemputan yang punya nomor customer.
4. Klik "Kirim Notif WA".
5. Pastikan preview muncul.
6. Klik kirim.
7. Pastikan tidak ada 404 dan snackbar sukses tampil.

Jika project memiliki feature test Laravel untuk route mobile, tambahkan test untuk:

- preview WA production success
- send WA production success
- preview/send tanpa permission ditolak
- route cashier tetap kompatibel

## Status

Debug selesai. Dokumen ini menjadi acuan implementasi perbaikan bug route WA notification 404.
