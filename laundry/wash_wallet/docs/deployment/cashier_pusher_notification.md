# Cashier Pusher Notification Deployment

## Backend

Set environment backend:

```env
BROADCAST_CONNECTION=pusher

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=mt1
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_USE_TLS=true
```

Pastikan route broadcasting aktif melalui `bootstrap/app.php` dan memakai middleware `api` serta `auth:sanctum`.

Jalankan queue worker di production supaya broadcast queued dan FCM job tidak berada di request utama customer:

```bash
php artisan queue:work --queue=default --tries=3
```

## Cashier App

Saat build cashier app, kirim konfigurasi Pusher melalui `--dart-define`:

```bash
flutter build apk \
  --dart-define=PUSHER_APP_KEY=your-key \
  --dart-define=PUSHER_CLUSTER=mt1 \
  --dart-define=BROADCASTING_AUTH_URL=https://your-backend.example.com/broadcasting/auth
```

Jika `BROADCASTING_AUTH_URL` tidak diisi, app akan mencoba membuat URL auth dari `Dio.baseUrl` dengan mengganti suffix `/api` menjadi `/broadcasting/auth`.

## Manual Checks

- Foreground: buat order customer, cashier menerima banner, badge bertambah, sound berbunyi.
- Background atau terminated: device cashier menerima FCM push.
- Tap push: app membuka konteks order setelah auth valid.
- Reconnect: putus-sambungkan koneksi, app sync badge ulang.
- Targeting: cashier outlet lain atau tanpa permission `order.view` tidak menerima broadcast maupun FCM.
