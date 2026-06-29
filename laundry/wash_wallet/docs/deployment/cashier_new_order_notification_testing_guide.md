# Testing Guide: Notifikasi Order Baru Cashier

Panduan ini untuk skenario lokal:

- Backend Laravel berjalan di laptop/PC.
- Aplikasi cashier berjalan di device fisik Android lewat wireless/debug.
- Aplikasi customer berjalan di Android emulator.
- Realtime foreground memakai Pusher Channels.
- Push background/terminated memakai FCM.

## 1. Prasyarat

Pastikan:

- Laptop dan device fisik berada di jaringan WiFi yang sama.
- Backend bisa diakses dari device fisik melalui IP LAN laptop.
- Android emulator customer bisa mengakses backend.
- Pusher app sudah dibuat dan key/secret/cluster tersedia.
- Firebase Android config sudah tersedia di:
  - `apps/cashier/android/app/google-services.json`
  - `apps/customer/android/app/google-services.json`
- Backend Laravel sudah punya credential Firebase Admin/Kreait sesuai konfigurasi project lokal. Tanpa ini, realtime Pusher tetap bisa dites, tetapi FCM background tidak akan terkirim.

Cari IP LAN laptop:

```powershell
ipconfig
```

Ambil IPv4 WiFi, contoh:

```text
192.168.1.25
```

Di panduan ini IP tersebut disebut:

```text
LAPTOP_IP=192.168.1.25
```

## 2. Konfigurasi Backend `.env`

Masuk ke backend:

```powershell
cd C:\Bimo\Project\wash_wallet\webapp\wash_wallet_be
```

Set minimal `.env` untuk testing:

```env
APP_URL=http://192.168.1.25:8000

BROADCAST_CONNECTION=pusher
QUEUE_CONNECTION=database

PUSHER_APP_ID=isi-dari-dashboard-pusher
PUSHER_APP_KEY=isi-dari-dashboard-pusher
PUSHER_APP_SECRET=isi-dari-dashboard-pusher
PUSHER_APP_CLUSTER=mt1
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_USE_TLS=true
```

Catatan:

- Ganti `192.168.1.25` dengan IP laptop.
- `QUEUE_CONNECTION=database` disarankan agar broadcast dan FCM benar-benar lewat worker.
- Kalau hanya ingin quick smoke test, `QUEUE_CONNECTION=sync` bisa dipakai, tetapi itu tidak merepresentasikan production behavior.

Setelah ubah `.env`, clear config:

```powershell
php artisan config:clear
php artisan cache:clear
```

Jalankan migration terbaru:

```powershell
php artisan migrate
```

## 3. Jalankan Backend

Buka terminal 1, jalankan Laravel HTTP server:

```powershell
cd C:\Bimo\Project\wash_wallet\webapp\wash_wallet_be
php artisan serve --host=0.0.0.0 --port=8000
```

Server harus bisa dibuka dari device fisik:

```text
http://192.168.1.25:8000
```

Jika device fisik tidak bisa akses:

- Pastikan laptop dan device satu WiFi.
- Izinkan firewall Windows untuk port `8000`.
- Jangan pakai `localhost` dari device fisik, karena itu mengarah ke device, bukan laptop.

Buka terminal 2, jalankan queue worker:

```powershell
cd C:\Bimo\Project\wash_wallet\webapp\wash_wallet_be
php artisan queue:work --queue=default --tries=3
```

Buka terminal 3 untuk log:

```powershell
cd C:\Bimo\Project\wash_wallet\webapp\wash_wallet_be
php artisan pail
```

Jika `pail` tidak nyaman, gunakan:

```powershell
Get-Content storage\logs\laravel.log -Wait
```

## 4. Jalankan Cashier App di Device Fisik

Device fisik harus memakai URL backend dengan IP LAN laptop:

```powershell
cd C:\Bimo\Project\wash_wallet
flutter run -d <DEVICE_ID> `
  --target apps/cashier/lib/main.dart `
  --dart-define=API_BASE_URL=http://192.168.1.25:8000/api `
  --dart-define=PUSHER_APP_KEY=isi-dari-dashboard-pusher `
  --dart-define=PUSHER_CLUSTER=mt1 `
  --dart-define=BROADCASTING_AUTH_URL=http://192.168.1.25:8000/broadcasting/auth
```

Ambil `DEVICE_ID` dengan:

```powershell
flutter devices
```

Setelah app terbuka:

1. Login sebagai cashier yang aktif.
2. Pastikan cashier punya posisi aktif pada outlet target.
3. Pastikan posisi tersebut punya permission `order.view`.
4. Izinkan notification permission saat diminta Android.
5. Biarkan app cashier berada di foreground untuk test realtime Pusher.

## 5. Jalankan Customer App di Emulator

Untuk Android emulator, backend laptop bisa diakses via `10.0.2.2`:

```powershell
cd C:\Bimo\Project\wash_wallet
flutter run -d <EMULATOR_ID> `
  --target apps/customer/lib/main.dart `
  --dart-define=API_BASE_URL=http://10.0.2.2:8000/api
```

Alternatif, pakai IP LAN laptop juga:

```powershell
flutter run -d <EMULATOR_ID> `
  --target apps/customer/lib/main.dart `
  --dart-define=API_BASE_URL=http://192.168.1.25:8000/api
```

## 6. Test Foreground Realtime

Kondisi:

- Backend server hidup.
- Queue worker hidup.
- Cashier app login dan berada di foreground.
- Customer app login di emulator.
- Customer memilih outlet yang sama dengan outlet cashier.

Langkah:

1. Dari customer app, buat order baru.
2. Pastikan status order awal termasuk `requested` atau `pending_dropoff`.
3. Lihat cashier app.

Hasil yang diharapkan:

- Banner/order notification muncul di cashier app.
- Badge order baru bertambah.
- Sound `notification.mp3` berbunyi.
- Log backend menunjukkan dispatch broadcast/FCM job tanpa error.

Kalau tidak muncul:

- Cek terminal queue worker, apakah job diproses.
- Cek terminal log Laravel.
- Cek Pusher dashboard debug console, apakah event `cashier.new-order.created` terkirim ke channel `private-outlet.{outletId}`.
- Pastikan `PUSHER_APP_KEY` di Flutter sama dengan backend.
- Pastikan `BROADCASTING_AUTH_URL` mengarah ke `http://LAPTOP_IP:8000/broadcasting/auth`, bukan `/api/broadcasting/auth`.

## 7. Test Background / Terminated FCM

Kondisi:

- Cashier sudah login minimal sekali agar FCM token tersimpan ke backend.
- Notification permission sudah diizinkan.
- Backend Firebase Admin/Kreait credential valid.
- Device fisik punya internet.

Langkah background:

1. Buka cashier app dan login.
2. Tekan Home, biarkan app background.
3. Dari customer emulator, buat order baru.

Hasil yang diharapkan:

- Push notification muncul di device fisik.
- Saat push ditap, cashier app terbuka ke konteks order.

Langkah terminated:

1. Buka cashier app dan login.
2. Tutup app dari recent apps.
3. Dari customer emulator, buat order baru.
4. Tap push notification.

Hasil yang diharapkan:

- App terbuka.
- Jika auth masih valid, app mengarah ke order.
- Jika auth tidak valid, login dulu, lalu konteks push tetap diproses setelah login.

## 8. Checklist Data yang Sering Membuat Notifikasi Tidak Masuk

Order harus memenuhi semua ini:

- `source = customer_app`
- `outlet_id` terisi
- `status` adalah `requested` atau `pending_dropoff`

Cashier penerima harus memenuhi:

- employee aktif
- punya posisi aktif pada outlet order
- posisi aktif
- posisi punya permission `order.view`
- device token sudah tersimpan di `employee_device_tokens`

Cek token cashier di database:

```sql
select employee_id, device_id, token, last_used_at
from employee_device_tokens
order by updated_at desc;
```

## 9. Terminal yang Ideal Saat Testing

Gunakan 4 terminal:

1. Backend HTTP:

```powershell
php artisan serve --host=0.0.0.0 --port=8000
```

2. Queue worker:

```powershell
php artisan queue:work --queue=default --tries=3
```

3. Backend log:

```powershell
php artisan pail
```

4. Flutter run cashier/customer sesuai device yang sedang dites.

## 10. Quick Troubleshooting

Device fisik tidak bisa login:

- Salah `API_BASE_URL`.
- Firewall menutup port `8000`.
- Backend masih jalan di `127.0.0.1`, bukan `0.0.0.0`.

Cashier login tapi realtime tidak masuk:

- `PUSHER_APP_KEY` atau `PUSHER_CLUSTER` salah.
- `/broadcasting/auth` gagal karena token cashier tidak valid.
- Cashier tidak punya permission `order.view` pada outlet tersebut.
- Queue worker tidak berjalan jika `QUEUE_CONNECTION=database`.

Push background tidak masuk:

- FCM token belum tersimpan.
- Notification permission belum diizinkan.
- Firebase Admin credential backend belum benar.
- Token device invalid dan sudah dihapus oleh backend.
- Device tidak punya koneksi internet.

Order dibuat tapi tidak memicu notif:

- Order dibuat dari POS cashier, bukan customer app.
- Status order bukan `requested` atau `pending_dropoff`.
- Outlet order berbeda dari outlet cashier.

