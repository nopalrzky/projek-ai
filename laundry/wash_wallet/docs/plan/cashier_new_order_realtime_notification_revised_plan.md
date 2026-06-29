# Revised Plan: Sistem Notifikasi Order Baru Cashier (Revisi Berdasarkan Feedback)

Tanggal: 2026-06-12  
Referensi user need: `docs/user_need/cashier_new_order_realtime_notification_user_need.md`  
Referensi plan lama: `docs/plan/cashier_new_order_realtime_notification_plan.md`  
Referensi feedback: `docs/feedback/cashier_new_order_realtime_notification_feedback.md`

---

## 0. Petunjuk Penting untuk Implementor

Plan ini adalah **delta plan** — bukan plan dari awal. Sebelum mengerjakan apapun, baca dan pahami state repo saat ini pada bagian 1. Jangan membuat ulang file yang sudah ada. Setiap item pekerjaan sudah dikategorikan sebagai:

- ✅ **Sudah ada** — verifikasi saja, jangan timpa.
- 🔧 **Sudah ada tapi perlu diperbaiki** — modifikasi dengan hati-hati.
- 🆕 **Belum ada** — buat baru.

---

## 1. State Repo Saat Ini (Harus Dibaca Sebelum Mengerjakan)

Berdasarkan review repo pada tanggal feedback (2026-06-12), item-item berikut **sudah ada** dan **tidak perlu dibuat ulang**:

### Backend (`webapp/wash_wallet_be`)

| Item | Status |
|------|--------|
| `laravel/reverb` di `composer.json` | ✅ Sudah ada |
| `config/reverb.php` | ✅ Sudah ada |
| `routes/channels.php` dengan `Broadcast::channel('outlet.{outletId}', ...)` | ✅ Sudah ada |
| Migration `employee_device_tokens` | ✅ Sudah ada |
| Model `EmployeeDeviceToken` | ✅ Sudah ada |
| Relasi `Employee::deviceTokens()` | ✅ Sudah ada |
| `EmployeeFcmTokenController` | ✅ Sudah ada |
| Route `/mobile/cashier/auth/fcm-token` (POST dan DELETE) | ✅ Sudah ada |
| `OrderController::newCount()` dan route `/mobile/cashier/orders/new-count` | ✅ Sudah ada |
| Method employee/cashier di `FcmNotificationService` | ✅ Sudah ada |

### Cashier App (`apps/cashier`)

| Item | Status |
|------|--------|
| `NotificationService` | ✅ Sudah ada |
| Firebase dependency (`firebase_core`, `firebase_messaging`) | ✅ Sudah ada |
| Local notification dependency | ✅ Sudah ada |
| Audio dependency dan sound file `assets/sounds/notification.mp3` | ✅ Sudah ada |
| Badge counter | ✅ Sudah ada |
| Banner widget awal | ✅ Sudah ada |
| Handler tap awal di `HomeScreen` | ✅ Sudah ada |
| `web_socket_channel` dan implementasi protokol Pusher manual | 🔧 Ada, harus diganti dengan `pusher_channels_flutter` |

> **PENTING**: Jika ada perbedaan antara daftar ini dan state repo aktual saat implementasi, selalu percayai repo aktual. Baca file yang ada sebelum membuat keputusan modifikasi.

---

## 2. Ringkasan Pekerjaan yang Tersisa

Berdasarkan state repo dan feedback, pekerjaan yang perlu dikerjakan:

1. **[Backend]** Migrasi `BROADCAST_CONNECTION` ke `pusher` dan verifikasi dependensi Pusher PHP.
2. **[Backend]** Perbaiki `routes/channels.php` — pastikan logika permission selaras dengan multi-outlet RBAC.
3. **[Backend]** Perbaiki event `CashierNewOrderCreated` — ganti `ShouldBroadcastNow` ke `ShouldBroadcast` (queued), tambahkan guard eksplisit sumber order.
4. **[Backend]** Jadikan pengiriman FCM sebagai queued job, bukan sinkron.
5. **[Backend]** Perbaiki kontrak payload — pastikan FCM dan broadcast membawa field identik, deduplication berbasis `orderId`.
6. **[Backend]** Perbaiki `FcmNotificationService` — klasifikasikan error token (permanen vs sementara), gunakan query RBAC multi-outlet.
7. **[Backend]** Perbaiki `new-count` agar menggunakan konteks outlet aktif yang konsisten.
8. **[Backend]** Update `.env.example` dan `bootstrap/app.php` untuk konfigurasi Pusher.
9. **[Backend]** Pertegas lifecycle token — bersihkan token lama saat token refresh dari device yang sama.
10. **[Flutter]** Ganti `web_socket_channel` manual dengan `pusher_channels_flutter`.
11. **[Flutter]** Perbaiki deduplication — ubah key dedupe dari `eventId` ke `orderId`.
12. **[Flutter]** Implementasi coordinator navigasi push di level app/root.
13. **[Flutter]** Samakan nama sound asset dengan yang ada di repo (`notification.mp3`).
14. **[Testing]** Tambahkan test otomatis backend dan Flutter sesuai daftar.

---

## 3. Keputusan Teknis Final

Bagian ini menetapkan keputusan yang mengikat. Semua keputusan di plan lama yang bertentangan dengan bagian ini harus diabaikan.

### 3.1 WebSocket Client

**Keputusan: `pusher_channels_flutter` — ganti implementasi `web_socket_channel` manual.**

- Backend: `BROADCAST_CONNECTION=pusher`, bukan `reverb`.
- Backend membutuhkan `pusher/pusher-php-server` di `composer.json` jika belum ada.
- Flutter: package `pusher_channels_flutter` (cek versi terbaru di pub.dev).
- Hapus semua kode `web_socket_channel` dan implementasi protokol Pusher manual dari `NotificationService`.
- `NotificationService` harus menangani: subscribe private channel, auth endpoint `/broadcasting/auth`, reconnect dengan backoff, resubscribe setelah reconnect, dan disconnect.

Hal-hal yang wajib ditangani oleh `pusher_channels_flutter`:
- `pusher:error`
- `pusher_internal:subscription_succeeded`
- ping/pong / timeout koneksi
- sync badge/list setelah reconnect

### 3.2 Kontrak Payload (Final)

Payload broadcast dan payload FCM **wajib identik** dalam field berikut:

| Field | Tipe di payload | Catatan |
|-------|----------------|---------|
| `type` | string | Selalu `cashier_new_order` |
| `orderId` | string | Numeric ID sebagai string |
| `orderNumber` | string | Nomor order yang ditampilkan |
| `outletId` | string | Numeric ID sebagai string |
| `status` | string | `requested` atau `pending_dropoff` |
| `customerName` | string atau null | Nama customer |
| `deliveryType` | string atau null | Konteks delivery/pickup |
| `createdAt` | string ISO8601 | Timestamp |
| `eventId` | string | UUID untuk observability saja, bukan kunci dedupe utama |

> **Catatan**: Semua numeric ID di payload FCM dikirim sebagai **string**. Parser Flutter harus menerima string atau int (`int.tryParse(data['orderId']?.toString())`).

### 3.3 Kunci Deduplication

**Keputusan: Deduplication utama menggunakan `orderId` dengan window waktu pendek (60 detik).**

- `eventId` boleh tetap ada untuk observability dan logging, tetapi **bukan satu-satunya kunci dedupe**.
- Alasan: broadcast dan FCM mewakili order yang sama namun punya `eventId` berbeda.
- Implementasi: gunakan `Map<String, DateTime>` dengan `orderId` sebagai key dan timestamp kedatangan sebagai value. Jika `orderId` yang sama masuk dalam jeda < 60 detik, abaikan.

### 3.4 Broadcast: Queued, bukan Sinkron

**Keputusan: Event `CashierNewOrderCreated` menggunakan `ShouldBroadcast` (queued), bukan `ShouldBroadcastNow`.**

- Alasan: `ShouldBroadcastNow` menempatkan broadcast di jalur request utama customer. Jika broadcaster gagal, response customer bisa menerima error walaupun order sudah tersimpan.
- Event tetap implements `ShouldDispatchAfterCommit`.
- Kegagalan job broadcast harus di-log di level job/listener.

### 3.5 FCM: Queued Job, bukan Sinkron

**Keputusan: Pengiriman FCM dilakukan via queued job setelah commit.**

- Job menerima `orderId` sebagai parameter, lalu load ulang order dan penerima eligible di dalam job.
- Job menggunakan retry/backoff.
- Token hanya dihapus untuk error permanen (token invalid/unregistered dari FCM). Jangan hapus token untuk timeout, network error, 5xx, atau credential error.
- Job log ringkasan jumlah token berhasil dan gagal.

### 3.6 Targeting Outlet (Multi-Outlet RBAC)

**Keputusan: Semua targeting (FCM, channel auth, `new-count`) menggunakan logika permission yang sama.**

Sumber konteks outlet yang benar:
- Cashier hanya bekerja pada satu outlet aktif yang dikembalikan oleh `/auth/me`.
- Query FCM: cari employee yang punya **posisi aktif pada `outlet_id = order.outlet_id`** dan posisi tersebut punya permission `order.view`.
- Jangan wajibkan `employees.outlet_id = order.outlet_id` jika employee bisa punya posisi di beberapa outlet.

### 3.7 Guard Eksplisit Trigger Notifikasi

Sebelum dispatch broadcast/FCM, selalu cek ketiga kondisi ini:

```php
$isCustomerOrder = $order->source === Order::SOURCE_CUSTOMER_APP;
$hasOutlet = $order->outlet_id !== null;
$isNewStatus = in_array($order->status, ['requested', 'pending_dropoff']);

if ($isCustomerOrder && $hasOutlet && $isNewStatus) {
    // dispatch broadcast + FCM job
}
```

### 3.8 Sound Asset

**Keputusan: Gunakan nama file yang sudah ada di repo: `assets/sounds/notification.mp3`.**

- Plan lama menyebut `new_order.mp3`. Abaikan itu.
- `NotificationService` harus memakai `AssetSource('sounds/notification.mp3')` (sudah ada).
- Verifikasi manual bahwa sound terdengar di Android device/emulator.

### 3.9 Navigasi Push

**Keputusan: Gunakan coordinator di level app/root dengan navigator key global atau GoRouter.**

- Jangan bergantung pada subscription di `HomeScreen` saja.
- Simpan pending notification payload saat app dibuka dari push.
- Jika auth belum valid → arahkan ke login → setelah login, buka order detail (jika employee masih punya akses).
- Jika order sudah tidak dapat diakses → buka daftar order dengan status terbaru.

---

## 4. Perubahan yang Diperlukan

### 4.1 Backend

#### 4.1.1 Verifikasi dan Update Pusher Dependencies

**[VERIFY/MODIFY] `composer.json`**

Verifikasi keberadaan package berikut. Jika belum ada, tambahkan:

```bash
composer require pusher/pusher-php-server
```

Pastikan `laravel/reverb` tidak dijadikan broadcaster aktif. Reverb tetap bisa ada di `composer.json` tapi koneksi diubah ke Pusher.

**[MODIFY] `.env` dan `.env.example`**

Update broadcast connection dan tambahkan semua variabel Pusher:

```
BROADCAST_CONNECTION=pusher

PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-app-key
PUSHER_APP_SECRET=your-app-secret
PUSHER_APP_CLUSTER=mt1
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_USE_TLS=true
```

> Untuk development/local, bisa menggunakan Pusher Sandbox atau Soketi. Tetapkan nilai yang digunakan bersama tim di `.env.example`.

**[VERIFY] `bootstrap/app.php`**

Pastikan broadcasting route terdaftar di sini, bukan di `config/broadcasting.php` (file tersebut tidak ada di repo). Pastikan endpoint `/broadcasting/auth` dijaga oleh `auth:sanctum` dengan guard employee yang benar.

> **Catatan untuk implementor**: Verifikasi cara broadcasting route dan middleware didaftarkan di `bootstrap/app.php` yang ada. Sesuaikan jika berbeda dari ekspektasi.

#### 4.1.2 Perbaiki Channel Authorization (Multi-Outlet RBAC)

**[MODIFY] `routes/channels.php`**

Channel authorization yang ada perlu diverifikasi dan diperbaiki agar selaras dengan logika multi-outlet:

```php
Broadcast::channel('outlet.{outletId}', function (Employee $employee, int $outletId) {
    // 1. Employee harus aktif
    if (!$employee->is_active) {
        return false;
    }

    // 2. Gunakan helper permission yang sudah ada — SELARASKAN dengan middleware
    // Jangan hanya cek employees.outlet_id, tapi cek posisi aktif di outlet tersebut
    return $employee->hasPermissionOnOutlet('order.view', $outletId);
    // Implementor: sesuaikan nama method dengan yang tersedia di Employee model
    // Cek app/Models/Employee.php untuk method permission yang sudah ada
});
```

> **Catatan untuk implementor**: Baca `app/Models/Employee.php` untuk memahami method permission yang tersedia. Baca juga `app/Http/Middleware/` untuk menemukan cara middleware `position.permission` mengecek permission, lalu gunakan logika yang sama di sini.

#### 4.1.3 Perbaiki Event Broadcast — Queued

**[MODIFY] `app/Events/CashierNewOrderCreated.php`**

Ubah dari `ShouldBroadcastNow` menjadi `ShouldBroadcast`:

```php
use Illuminate\Contracts\Broadcasting\ShouldBroadcast; // bukan ShouldBroadcastNow

class CashierNewOrderCreated implements ShouldBroadcast, ShouldDispatchAfterCommit
{
    // ... sisa implementasi sama
}
```

Pastikan `broadcastWith()` mengirim payload sesuai kontrak final di bagian 3.2. Ubah semua numeric ID menjadi string:

```php
public function broadcastWith(): array
{
    $customer = $this->order->customer;

    return [
        'type'         => 'cashier_new_order',
        'eventId'      => $this->eventId,
        'orderId'      => (string) $this->order->id,
        'orderNumber'  => $this->order->order_number ?? '#' . $this->order->id,
        'outletId'     => (string) $this->order->outlet_id,
        'status'       => $this->order->status,
        'customerName' => $customer?->name ?? null,
        'deliveryType' => $this->order->delivery_type ?? null,
        'createdAt'    => $this->order->created_at?->toIso8601String(),
    ];
}
```

> **Catatan**: Field `pickupType` dihapus dari payload final dan digantikan dengan `deliveryType`. Jika keduanya dibutuhkan, cek field yang tersedia di `Order` model sebelum memutuskan.

#### 4.1.4 Buat Queued Job untuk FCM

**[NEW] `app/Jobs/SendNewOrderFcmJob.php`**

```php
<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\FcmNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SendNewOrderFcmJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30; // detik

    public function __construct(
        public readonly int $orderId
    ) {}

    public function handle(FcmNotificationService $fcmService): void
    {
        $order = Order::with(['customer', 'outlet'])->find($this->orderId);

        if (!$order) {
            Log::warning("SendNewOrderFcmJob: Order #{$this->orderId} tidak ditemukan.");
            return;
        }

        // Guard eksplisit
        $isCustomerOrder = $order->source === Order::SOURCE_CUSTOMER_APP;
        $hasOutlet = $order->outlet_id !== null;
        $isNewStatus = in_array($order->status, ['requested', 'pending_dropoff']);

        if (!$isCustomerOrder || !$hasOutlet || !$isNewStatus) {
            Log::info("SendNewOrderFcmJob: Order #{$this->orderId} tidak memenuhi kriteria notifikasi.", [
                'source' => $order->source,
                'outlet_id' => $order->outlet_id,
                'status' => $order->status,
            ]);
            return;
        }

        $fcmService->sendToOutletCashiers(
            outletId: $order->outlet_id,
            title: 'Order Baru Masuk',
            body: 'Order ' . ($order->order_number ?? '#' . $order->id) . ' dari '
                . ($order->customer?->name ?? 'customer') . ' menunggu diproses.',
            data: [
                'type'         => 'cashier_new_order',
                'orderId'      => (string) $order->id,
                'orderNumber'  => $order->order_number ?? (string) $order->id,
                'outletId'     => (string) $order->outlet_id,
                'status'       => $order->status,
                'customerName' => $order->customer?->name,
                'deliveryType' => $order->delivery_type,
                'createdAt'    => $order->created_at?->toIso8601String(),
                'eventId'      => (string) Str::uuid(), // untuk observability
            ]
        );
    }
}
```

#### 4.1.5 Perbaiki FcmNotificationService — Error Classification

**[MODIFY] `app/Services/FcmNotificationService.php`**

Perbaiki method `sendToEmployeeDevices` untuk tidak menghapus token saat error sementara:

```php
/**
 * Send push notification to all active devices of an employee.
 * Hanya hapus token untuk error permanen (invalid/unregistered).
 * Jangan hapus token untuk network error, timeout, 5xx, atau credential error.
 */
public function sendToEmployeeDevices(Employee $employee, string $title, string $body, array $data = []): void
{
    $tokens = EmployeeDeviceToken::where('employee_id', $employee->id)->pluck('token');

    $successCount = 0;
    $failedCount = 0;

    foreach ($tokens as $token) {
        try {
            $isPermanentlyInvalid = $this->sendAndCheckPermanentFailure($token, $title, $body, $data);

            if ($isPermanentlyInvalid) {
                EmployeeDeviceToken::where('token', $token)->delete();
                Log::info("sendToEmployeeDevices: Token invalid dihapus untuk employee #{$employee->id}");
                $failedCount++;
            } else {
                $successCount++;
            }
        } catch (\Throwable $e) {
            // Sementara (network error, timeout, dsb.) — jangan hapus token
            $failedCount++;
            Log::warning("sendToEmployeeDevices: Gagal sementara untuk employee #{$employee->id}", [
                'error' => $e->getMessage(),
            ]);
        }
    }

    Log::info("sendToEmployeeDevices: employee #{$employee->id} — sukses: {$successCount}, gagal: {$failedCount}");
}
```

> **Catatan untuk implementor**: Implementasikan `sendAndCheckPermanentFailure()` yang mengembalikan `bool` — `true` jika token invalid secara permanen (berdasarkan tipe exception dari `kreait/laravel-firebase`), `false` jika sukses atau error sementara. Baca dokumentasi `kreait/laravel-firebase` untuk memahami exception yang dilempar untuk token invalid vs error jaringan.

**[MODIFY] Method `sendToOutletCashiers` — Multi-Outlet RBAC**

Perbaiki query agar tidak bergantung hanya pada `employees.outlet_id`:

```php
public function sendToOutletCashiers(int $outletId, string $title, string $body, array $data = []): void
{
    // Query employee yang punya posisi aktif di outlet ini dengan permission order.view
    $employees = Employee::where('is_active', true)
        ->whereHas('positions', function ($q) use ($outletId) {
            $q->where('positions.outlet_id', $outletId)
              ->where('positions.is_active', true)
              ->where('employee_positions.is_active', true)
              ->whereHas('permissions', function ($q2) {
                  $q2->where('slug', 'order.view');
              });
        })
        ->with('deviceTokens')
        ->get();

    foreach ($employees as $employee) {
        $this->sendToEmployeeDevices($employee, $title, $body, $data);
    }
}
```

> **Catatan untuk implementor**: Sesuaikan nama relasi dan kolom dengan skema yang ada. Baca `app/Models/Employee.php`, `Position.php`, dan `PositionPermission.php` sebelum menulis query. Jangan tebak nama relasi.

#### 4.1.6 Update OrderService — Guard Eksplisit dan FCM Job

**[MODIFY] `app/Services/OrderService.php`**

Di dalam `storeCustomer()`, ganti dispatch FCM sinkron dengan job, dan tambahkan guard eksplisit:

```php
use App\Events\CashierNewOrderCreated;
use App\Jobs\SendNewOrderFcmJob;
use App\Models\Order;

// Setelah order berhasil dibuat dan di-load relasi yang dibutuhkan:
$order = $order->load(['orderItems', 'outlet', 'customer']);

// Guard eksplisit sebelum dispatch
$isCustomerOrder = $order->source === Order::SOURCE_CUSTOMER_APP;
$hasOutlet = $order->outlet_id !== null;
$isNewStatus = in_array($order->status, ['requested', 'pending_dropoff']);

if ($isCustomerOrder && $hasOutlet && $isNewStatus) {
    // Broadcast ke channel (queued + ShouldDispatchAfterCommit)
    CashierNewOrderCreated::dispatch($order);

    // FCM via queued job setelah commit
    SendNewOrderFcmJob::dispatch($order->id)->afterCommit();
}

return $order;
```

> **Catatan untuk implementor**: Pastikan queue worker berjalan di environment yang diuji. Untuk development bisa menggunakan `QUEUE_CONNECTION=sync` di `.env` agar job berjalan sinkron tanpa worker.

#### 4.1.7 Perbaiki `new-count` — Konteks Outlet Konsisten

**[VERIFY/MODIFY] `app/Http/Controllers/Api/OrderController.php` — method `newCount()`**

Verifikasi implementasi `newCount()` yang sudah ada. Pastikan query menggunakan outlet yang benar dan hanya menghitung order `source = customer_app`:

```php
public function newCount(Request $request): JsonResponse
{
    $employee = $request->user();
    $outletId = $employee->outlet_id; // Sesuaikan jika multi-outlet

    $count = Order::where('outlet_id', $outletId)
        ->whereIn('status', ['requested', 'pending_dropoff'])
        ->where('source', Order::SOURCE_CUSTOMER_APP)
        ->count();

    return $this->successResponse(['count' => $count], 'Success');
}
```

> **Catatan untuk implementor**: Pastikan filter `source = customer_app` ada. Jika implementasi yang ada belum ada filter ini, tambahkan.

#### 4.1.8 Perbaiki Token Lifecycle

**[MODIFY] `app/Http/Controllers/Api/EmployeeFcmTokenController.php` — method `store()`**

Tambahkan field `device_id` dan logika pembersihan token lama dari device yang sama:

```php
public function store(Request $request): JsonResponse
{
    $request->validate([
        'token'       => 'required|string|max:500',
        'device_name' => 'nullable|string|max:100',
        'device_id'   => 'nullable|string|max:255', // ID unik device
    ]);

    $employee = $request->user();

    // Hapus token lama dari device yang sama (jika ada) milik employee ini
    if ($request->filled('device_id')) {
        EmployeeDeviceToken::where('employee_id', $employee->id)
            ->where('device_id', $request->device_id)
            ->where('token', '!=', $request->token)
            ->delete();
    }

    EmployeeDeviceToken::updateOrCreate(
        ['token' => $request->token],
        [
            'employee_id' => $employee->id,
            'device_name' => $request->device_name,
            'device_id'   => $request->device_id,
            'last_used_at' => now(),
        ]
    );

    return $this->successResponse(null, 'FCM token registered');
}
```

**[NEW] Migration: tambah field `device_id`**

Jika field `device_id` belum ada di tabel, buat migration baru:

File: `database/migrations/2026_06_12_000001_add_device_id_to_employee_device_tokens_table.php`

```php
Schema::table('employee_device_tokens', function (Blueprint $table) {
    $table->string('device_id', 255)->nullable()->after('token');
    $table->index(['employee_id', 'device_id']);
});
```

> **Catatan untuk implementor**: Sebelum membuat migration, verifikasi skema tabel `employee_device_tokens` yang ada. Jika `device_id` sudah ada, lewati migration ini. Verifikasi juga panjang kolom `token` — FCM token bisa lebih dari 255 karakter, lebarkan jika perlu.

---

### 4.2 Flutter Cashier App

#### 4.2.1 Ganti `web_socket_channel` dengan `pusher_channels_flutter`

**[MODIFY] `apps/cashier/pubspec.yaml`**

Hapus `web_socket_channel` jika ada. Tambahkan `pusher_channels_flutter`:

```yaml
dependencies:
  # Hapus jika ada:
  # web_socket_channel: ...

  # Tambahkan:
  pusher_channels_flutter: ^2.0.0  # cek versi terbaru di pub.dev
```

> **Catatan untuk implementor**: Cek versi terbaru `pusher_channels_flutter` di pub.dev saat implementasi. Verifikasi kompatibilitas dengan versi Flutter yang digunakan.

**[MODIFY] `apps/cashier/lib/core/services/notification_service.dart`**

Ganti seluruh implementasi WebSocket manual dengan `pusher_channels_flutter`. Hapus kode `web_socket_channel`, handshake manual, dan parsing protokol Pusher manual. Implementasi baru harus mencakup:

```dart
import 'dart:convert';
import 'package:pusher_channels_flutter/pusher_channels_flutter.dart';

// Di dalam NotificationService:
PusherChannelsFlutter? _pusher;
int? _subscribedOutletId;
VoidCallback? _onReconnectCallback;

void setOnReconnectCallback(VoidCallback callback) {
  _onReconnectCallback = callback;
}

/// Hubungkan ke Pusher dan subscribe ke private channel outlet.
/// Panggil setelah login sukses.
Future<void> connectPusher({
  required int outletId,
  required String authToken,
  required String pusherAppKey,
  required String pusherCluster,
  required String broadcastingAuthEndpoint,
}) async {
  if (_subscribedOutletId == outletId && _pusher != null) return;
  await disconnectPusher();

  _pusher = PusherChannelsFlutter.getInstance();

  await _pusher!.init(
    apiKey: pusherAppKey,
    cluster: pusherCluster,
    authEndpoint: broadcastingAuthEndpoint,
    onAuthorizer: (channelName, socketId, options) async {
      try {
        // POST ke /broadcasting/auth dengan Bearer token cashier
        // Gunakan Dio yang sudah dikonfigurasi di app
        final response = await _authDio!.post(
          broadcastingAuthEndpoint,
          data: {'socket_id': socketId, 'channel_name': channelName},
          options: Options(headers: {'Authorization': 'Bearer $authToken'}),
        );
        return response.data;
      } catch (e) {
        // Log error auth
        return null;
      }
    },
    onConnectionStateChange: (currentState, previousState) {
      if (currentState == 'CONNECTED' && previousState != 'CONNECTED') {
        _onReconnectCallback?.call();
      }
    },
    onError: (message, code, e) {
      // Log error koneksi Pusher
    },
  );

  await _pusher!.connect();

  await _pusher!.subscribe(
    channelName: 'private-outlet.$outletId',
    onSubscriptionSucceeded: (channelName, data) {
      // Subscribe berhasil
    },
    onEvent: (event) {
      if (event.eventName == 'cashier.new-order.created') {
        _handlePusherEvent(event.data);
      }
    },
  );

  _subscribedOutletId = outletId;
}

Future<void> disconnectPusher() async {
  if (_pusher != null) {
    try { await _pusher!.disconnect(); } catch (_) {}
    _pusher = null;
    _subscribedOutletId = null;
  }
}

void _handlePusherEvent(dynamic rawData) {
  try {
    final Map<String, dynamic> data = rawData is String
        ? jsonDecode(rawData) as Map<String, dynamic>
        : Map<String, dynamic>.from(rawData as Map);

    final payload = NewOrderPayload.fromMap(data);
    if (_isDuplicateOrder(payload.orderId)) return;
    _markOrderShown(payload.orderId);

    _incrementBadge();
    _newOrderController.add(payload);
    _playSound();
  } catch (e) {
    // Log error parsing
  }
}
```

> **Catatan untuk implementor**: `_authDio` adalah instance Dio yang perlu di-inject ke `NotificationService` untuk membuat request ke `/broadcasting/auth`. Sesuaikan dengan pola dependency injection yang sudah ada di cashier app.

#### 4.2.2 Perbaiki Deduplication — `orderId` sebagai Kunci Utama

**[MODIFY] `apps/cashier/lib/core/services/notification_service.dart`**

Ganti implementasi deduplication dari `eventId`-based ke `orderId`-based dengan window waktu:

```dart
// Hapus:
// final LinkedHashSet<String> _shownEventIds = LinkedHashSet();

// Ganti dengan:
final Map<int, DateTime> _shownOrderIds = {};
static const Duration _deduplicationWindow = Duration(seconds: 60);

bool _isDuplicateOrder(int orderId) {
  final shownAt = _shownOrderIds[orderId];
  if (shownAt == null) return false;
  return DateTime.now().difference(shownAt) < _deduplicationWindow;
}

void _markOrderShown(int orderId) {
  _shownOrderIds[orderId] = DateTime.now();
  // Bersihkan entry lama untuk mencegah memory leak
  final cutoff = DateTime.now().subtract(_deduplicationWindow * 2);
  _shownOrderIds.removeWhere((_, shownAt) => shownAt.isBefore(cutoff));
}
```

Perbarui `_handleForegroundFcm` untuk menggunakan deduplication yang sama:

```dart
void _handleForegroundFcm(RemoteMessage message) {
  if (message.data['type'] != 'cashier_new_order') return;

  final payload = NewOrderPayload.fromMap(message.data);
  if (_isDuplicateOrder(payload.orderId)) return;
  _markOrderShown(payload.orderId);

  _incrementBadge();
  _newOrderController.add(payload);
  _playSound();
}
```

#### 4.2.3 Implementasi Push Navigation Coordinator

**[NEW] `apps/cashier/lib/core/navigation/push_notification_coordinator.dart`**

```dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/widgets.dart';

/// Koordinator navigasi push yang menyimpan pending payload
/// dan menangani navigasi setelah auth valid.
class PushNotificationCoordinator {
  PushNotificationCoordinator._();
  static final instance = PushNotificationCoordinator._();

  Map<String, dynamic>? _pendingPushPayload;

  /// Setup listener untuk app dibuka dari push (background -> foreground)
  void initialize() {
    FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpenedApp);
  }

  /// Cek apakah app dibuka dari push saat terminated
  Future<void> checkInitialMessage() async {
    final message = await FirebaseMessaging.instance.getInitialMessage();
    if (message != null && message.data['type'] == 'cashier_new_order') {
      _pendingPushPayload = message.data;
    }
  }

  void _handleMessageOpenedApp(RemoteMessage message) {
    if (message.data['type'] == 'cashier_new_order') {
      _pendingPushPayload = message.data;
      // Navigasi dilakukan via onAuthReady setelah auth dikonfirmasi
    }
  }

  /// Dipanggil setelah auth valid (setelah login sukses atau auth status dikonfirmasi).
  /// Jika ada pending payload, navigasi ke order.
  void onAuthReady(BuildContext context, {required bool isAuthenticated}) {
    if (!isAuthenticated || _pendingPushPayload == null) return;

    final payload = _pendingPushPayload!;
    _pendingPushPayload = null;

    final orderId = int.tryParse(payload['orderId']?.toString() ?? '');
    if (orderId == null) return;

    _navigateToOrder(context, orderId);
  }

  void _navigateToOrder(BuildContext context, int orderId) {
    // Navigasi ke ShowOrderScreen atau IndexOrdersScreen
    // Sesuaikan dengan routing yang digunakan di cashier app (GoRouter atau Navigator)
    //
    // Contoh dengan GoRouter:
    // context.push('/orders/$orderId');
    //
    // Contoh dengan Navigator:
    // Navigator.of(context).push(
    //   MaterialPageRoute(builder: (_) => ShowOrderScreen(orderId: orderId)),
    // );
  }

  bool get hasPendingPayload => _pendingPushPayload != null;
}
```

**[MODIFY] `apps/cashier/lib/main.dart`**

Inisialisasi coordinator di `main()`:

```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  // Inisialisasi push coordinator sebelum runApp
  PushNotificationCoordinator.instance.initialize();
  await PushNotificationCoordinator.instance.checkInitialMessage();

  // ... sisa inisialisasi
}
```

**[MODIFY] Root widget atau AuthCubit listener**

Panggil `onAuthReady` setelah auth dikonfirmasi. Karena Cubit tidak punya BuildContext, lakukan di `BlocListener` di root widget atau di `HomeScreen` saat pertama kali dirender:

```dart
BlocListener<AuthCubit, AuthState>(
  listener: (context, state) {
    if (state is Authenticated) {
      PushNotificationCoordinator.instance.onAuthReady(
        context,
        isAuthenticated: true,
      );
    }
  },
  child: // ...
)
```

#### 4.2.4 Verifikasi Sound Asset

**[VERIFY] `apps/cashier/assets/sounds/notification.mp3`**

Pastikan file ini ada. Jika tidak ada, tambahkan file sound notifikasi (chime singkat).

**[VERIFY] `apps/cashier/lib/core/services/notification_service.dart`**

Pastikan `_playSound()` menggunakan path yang benar:

```dart
Future<void> _playSound() async {
  try {
    await _audioPlayer.play(AssetSource('sounds/notification.mp3'));
    // BUKAN 'sounds/new_order.mp3'
  } catch (e) {
    // Log error — jangan crash
  }
}
```

**[VERIFY] `apps/cashier/pubspec.yaml`** — assets section mencakup folder sounds:

```yaml
flutter:
  assets:
    - assets/sounds/
```

#### 4.2.5 Update AuthCubit — Pusher Integration

**[MODIFY] `apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart`**

Ganti panggilan `connectReverb()` dengan `connectPusher()`:

```dart
// Setelah login sukses:
await NotificationService.instance.connectPusher(
  outletId: employee.outletId,
  authToken: currentAuthToken,
  pusherAppKey: AppConfig.pusherAppKey,
  pusherCluster: AppConfig.pusherCluster,
  broadcastingAuthEndpoint: AppConfig.broadcastingAuthUrl,
);

// Saat logout (sebelum token backend dicabut):
final fcmToken = await NotificationService.instance.getFcmToken();
if (fcmToken != null) {
  try { await _removeFcmTokenUsecase(fcmToken); } catch (_) {}
}
await NotificationService.instance.disconnectPusher();
```

**[MODIFY] `apps/cashier/lib/core/config/app_config.dart`** (atau file config yang ada)

Tambahkan konfigurasi Pusher dari dart-define:

```dart
static const String pusherAppKey = String.fromEnvironment(
  'PUSHER_APP_KEY',
  defaultValue: '',
);
static const String pusherCluster = String.fromEnvironment(
  'PUSHER_CLUSTER',
  defaultValue: 'mt1',
);
static const String broadcastingAuthUrl = String.fromEnvironment(
  'BROADCASTING_AUTH_URL',
  defaultValue: '',
);
```

> **Catatan untuk implementor**: Sesuaikan dengan cara cashier app mengelola konfigurasi environment. Jangan hardcode URL atau key di source code.

#### 4.2.6 Sync Badge saat Reconnect

**[MODIFY] `apps/cashier/lib/features/home/presentation/screens/home_screen.dart`**

Set callback reconnect di `initState()`:

```dart
@override
void initState() {
  super.initState();
  WidgetsBinding.instance.addObserver(this);

  // Set callback untuk sync badge saat Pusher reconnect
  NotificationService.instance.setOnReconnectCallback(() {
    if (mounted) _syncNotificationBadge();
  });

  Future.microtask(() => _syncNotificationBadge());
}

@override
void dispose() {
  WidgetsBinding.instance.removeObserver(this);
  // Clear callback saat widget dispose
  NotificationService.instance.setOnReconnectCallback(() {});
  super.dispose();
}
```

---

## 5. Konfigurasi Environment dan Deployment

### 5.1 Backend `.env.example`

Update `.env.example` dengan semua variabel yang dibutuhkan:

```
# Broadcasting
BROADCAST_CONNECTION=pusher

# Pusher Configuration
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=mt1
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_USE_TLS=true
```

### 5.2 Flutter Build Command

Saat build cashier app, sertakan Pusher config via `--dart-define`:

```bash
flutter build apk \
  --dart-define=PUSHER_APP_KEY=your-key \
  --dart-define=PUSHER_CLUSTER=mt1 \
  --dart-define=BROADCASTING_AUTH_URL=https://your-backend/broadcasting/auth
```

Tambahkan catatan ini ke `README.md` atau dokumen deployment cashier app.

### 5.3 Queue Worker

Pastikan queue worker berjalan di server production:

```bash
php artisan queue:work --queue=default --tries=3
```

Untuk Supervisor atau deployment config yang ada, pastikan worker untuk `SendNewOrderFcmJob` sudah dikonfigurasi.

---

## 6. Urutan Implementasi yang Disarankan

1. **[Backend]** Verifikasi `pusher/pusher-php-server` di `composer.json`, install jika belum ada.
2. **[Backend]** Update `.env` dan `.env.example` dengan konfigurasi Pusher.
3. **[Backend]** Verifikasi `bootstrap/app.php` — pastikan `/broadcasting/auth` terdaftar dengan middleware `auth:sanctum`.
4. **[Backend]** Perbaiki `routes/channels.php` — multi-outlet RBAC.
5. **[Backend]** Perbaiki `CashierNewOrderCreated` — ganti ke `ShouldBroadcast`, fix payload kontrak.
6. **[Backend]** Buat `SendNewOrderFcmJob`.
7. **[Backend]** Perbaiki `FcmNotificationService` — error classification dan query multi-outlet.
8. **[Backend]** Update `OrderService::storeCustomer()` — guard eksplisit + dispatch job.
9. **[Backend]** Verifikasi `new-count` — pastikan filter `source` ada dan outlet konsisten.
10. **[Backend]** Buat migration `device_id` jika belum ada.
11. **[Backend]** Perbaiki `EmployeeFcmTokenController::store()` — token lifecycle.
12. **[Flutter]** Update `pubspec.yaml` — tambah `pusher_channels_flutter`, hapus `web_socket_channel`.
13. **[Flutter]** Buat `PushNotificationCoordinator`.
14. **[Flutter]** Update `NotificationService` — ganti WebSocket manual, fix deduplication.
15. **[Flutter]** Update `AuthCubit` — integrasi Pusher.
16. **[Flutter]** Update `main.dart` — inisialisasi coordinator.
17. **[Flutter]** Verifikasi sound asset dan path.
18. **[Flutter]** Update `HomeScreen` — callback reconnect.
19. **[Flutter]** Update `AppConfig` — Pusher config dari dart-define.
20. **[Testing]** Jalankan test backend.
21. **[Testing]** Jalankan test Flutter.
22. **[Testing]** Manual integration test (foreground, background, reconnect).

---

## 7. Test Coverage yang Diperlukan

### 7.1 Backend (Automated Tests)

1. Register FCM token employee membuat atau meng-update row `employee_device_tokens`.
2. Delete FCM token hanya menghapus token milik employee yang sedang login.
3. Private channel `outlet.{id}` mengizinkan employee aktif dengan `order.view` pada outlet tersebut.
4. Private channel menolak employee dari outlet lain, tanpa `order.view`, dan tidak aktif.
5. Customer order baru men-dispatch `CashierNewOrderCreated` setelah commit DB.
6. Customer order baru men-dispatch `SendNewOrderFcmJob`.
7. Order dari `OrderService::store()` (cashier POS) tidak men-dispatch event atau FCM job.
8. Order dengan source bukan `customer_app`, tanpa `outlet_id`, atau status bukan `requested`/`pending_dropoff` tidak men-dispatch notifikasi.
9. `new-count` hanya menghitung order `source = customer_app` dan status `requested`/`pending_dropoff`.
10. `sendToOutletCashiers` tidak mengirim ke employee inactive, posisi inactive, permission missing, atau outlet tidak relevan.
11. Paksa broadcaster throw exception → endpoint create order tetap mengembalikan sukses.
12. Paksa FCM service error → order tetap tersimpan di database.

### 7.2 Flutter (Unit Tests)

1. `NewOrderPayload.fromMap` menerima payload dari broadcast (int) dan FCM (string) untuk field `orderId` dan `outletId`.
2. `_isDuplicateOrder` tidak menaikkan badge dua kali untuk `orderId` yang sama dalam window 60 detik.
3. `orderId` yang sama setelah 60 detik dianggap event baru (tidak diduplikasi).
4. Badge bertambah saat payload baru masuk.
5. Badge kembali ke nol setelah `clearBadge()` dipanggil.
6. `PushNotificationCoordinator` menyimpan payload dan memprosesnya setelah `onAuthReady` dipanggil.
7. `_onReconnectCallback` dipanggil saat Pusher reconnect.
8. `_playSound()` menggunakan `AssetSource('sounds/notification.mp3')` bukan `new_order.mp3`.

### 7.3 Manual Integration Tests

1. **Foreground — Pusher event**: Buat order customer → cashier app menerima banner, badge bertambah, sound berbunyi.
2. **Foreground — deduplication**: Kirim Pusher event dan FCM untuk order yang sama → banner dan sound muncul hanya sekali.
3. **Background — FCM push**: Minimize cashier app → buat order → push notification muncul.
4. **Terminated — tap push**: Tutup cashier app → buat order → tap push → app terbuka langsung ke konteks order.
5. **Pusher disconnect/reconnect**: Putuskan koneksi → sambungkan kembali → app reconnect, resubscribe, badge sync ulang.
6. **Cashier outlet berbeda**: Cashier outlet lain tidak menerima broadcast atau FCM.
7. **Sound di Android**: Verifikasi sound `notification.mp3` benar-benar terdengar di Android device/emulator.
8. **Push saat belum auth**: Kirim push → app mengarah ke login → setelah login, buka order dengan benar.
9. **Logout membersihkan token**: Logout → verifikasi token FCM dihapus dari `employee_device_tokens`.

---

## 8. File yang Diubah — Ringkasan Delta

### Backend (`webapp/wash_wallet_be`)

| File | Aksi | Deskripsi |
|------|------|-----------|
| `composer.json` | VERIFY/MODIFY | Verifikasi `pusher/pusher-php-server` ada |
| `.env` + `.env.example` | MODIFY | Update ke `BROADCAST_CONNECTION=pusher` dan variabel Pusher |
| `bootstrap/app.php` | VERIFY | Pastikan `/broadcasting/auth` terdaftar dengan `auth:sanctum` |
| `routes/channels.php` | MODIFY | Perbaiki channel auth — multi-outlet RBAC |
| `app/Events/CashierNewOrderCreated.php` | MODIFY | Ganti `ShouldBroadcastNow` → `ShouldBroadcast`, fix payload kontrak |
| `app/Jobs/SendNewOrderFcmJob.php` | NEW | Queued job pengiriman FCM dengan guard eksplisit |
| `app/Services/FcmNotificationService.php` | MODIFY | Error classification, query multi-outlet RBAC |
| `app/Services/OrderService.php` | MODIFY | Guard eksplisit, dispatch job FCM (bukan sinkron) |
| `app/Http/Controllers/Api/OrderController.php` | VERIFY/MODIFY | Verifikasi `newCount()` — filter `source` dan outlet konsisten |
| `app/Http/Controllers/Api/EmployeeFcmTokenController.php` | MODIFY | Token lifecycle — bersihkan token lama saat refresh |
| `database/migrations/..._add_device_id_to_employee_device_tokens_table.php` | NEW (jika belum ada) | Field `device_id` untuk identifikasi device |

### Cashier App (`apps/cashier`)

| File | Aksi | Deskripsi |
|------|------|-----------|
| `pubspec.yaml` | MODIFY | Tambah `pusher_channels_flutter`, hapus `web_socket_channel` |
| `lib/core/services/notification_service.dart` | MODIFY | Ganti WebSocket manual dengan Pusher SDK, fix deduplication |
| `lib/core/navigation/push_notification_coordinator.dart` | NEW | Coordinator navigasi push di level app |
| `lib/core/config/app_config.dart` | MODIFY | Tambah Pusher config dari dart-define |
| `lib/main.dart` | MODIFY | Inisialisasi coordinator |
| `lib/features/auth/presentation/bloc/auth_cubit.dart` | MODIFY | Integrasi Pusher `connectPusher`/`disconnectPusher` |
| `lib/features/home/presentation/screens/home_screen.dart` | MODIFY | Callback reconnect untuk sync badge |
| `assets/sounds/notification.mp3` | VERIFY | Pastikan file ada dengan nama ini |

---

## 9. Yang Di Luar Scope Plan Ini

- Notifikasi WhatsApp customer.
- Notifikasi untuk aplikasi production atau courier.
- Redesign menyeluruh dashboard cashier.
- Perubahan flow status order, payment, penimbangan, atau pickup.
- Tracking lokasi realtime.
- Broadcast untuk semua perubahan status order selain order baru dari customer app.
- Admin panel untuk monitoring FCM token atau notifikasi.
- iOS push notification setup (APNs) — tangani jika ada kebutuhan iOS.
