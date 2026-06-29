# Plan: Sistem Notifikasi Order Baru Cashier dengan Laravel Reverb dan FCM

Tanggal: 2026-06-11  
Referensi user need: `docs/user_need/cashier_new_order_realtime_notification_user_need.md`

---

## 1. Ringkasan Perubahan

Plan ini mengimplementasikan sistem notifikasi dua jalur untuk cashier:

1. **Laravel Reverb** — notifikasi realtime saat aplikasi cashier sedang aktif (foreground).
2. **Firebase Cloud Messaging (FCM)** — push notification saat aplikasi background, terminated, atau device terkunci.

Notifikasi hanya dipicu untuk order baru dari customer app (`source = customer_app`, status `requested` atau `pending_dropoff`) yang dikirim ke employee cashier di outlet terkait yang memiliki permission `order.view` atau lebih tinggi. Order yang dibuat langsung oleh cashier dari POS tidak memicu notifikasi.

Implementasi dibagi menjadi enam bagian:

```
1. Backend: Install Reverb + Broadcasting Setup
2. Backend: Employee Device Token Management (tabel terpisah)
3. Backend: Broadcast Event Order Baru + FCM Trigger
4. Cashier App: Notification Service Lifecycle (FCM + Reverb)
5. Cashier App: UI Banner, Badge, Sound, dan Navigation
6. Testing dan Konfigurasi Environment
```

---

## 2. Analisis Kondisi Codebase Saat Ini

### 2.1 Backend

**Yang sudah ada:**

- `FcmNotificationService.php` — sudah ada, hanya support customer (`sendToCustomer`), belum support employee.
- `kreait/laravel-firebase` — sudah ada di `composer.json`.
- `OrderService::storeCustomer()` — sudah meng-create order dengan `source = ORDER::SOURCE_CUSTOMER_APP`, `outlet_id`, dan status `requested` atau `pending_dropoff`. Selesai di dalam `DB::transaction()`.
- `EmployeeAuthController` — ada endpoint `login`, `logout`, `me`, `validateToken`. Belum ada endpoint `fcm-token`.
- `Employee.php` model — belum ada field `fcm_token`. Belum ada tabel device/token terpisah.
- `Events/` — sudah ada contoh event (`OutletCreated`) yang implements `ShouldDispatchAfterCommit`. Namun belum ada event broadcast order baru.
- `laravel/reverb` — **belum ada** di `composer.json`.
- Channels authorization — belum ada file `channels.php` yang mendukung private channel untuk cashier.

**Yang perlu ditambahkan:**

- `laravel/reverb` package.
- Tabel `employee_device_tokens` (bukan kolom fcm_token di employees — alasan: multi-device, logout per-device).
- Model `EmployeeDeviceToken`.
- Endpoint cashier `POST /auth/fcm-token` dan `DELETE /auth/fcm-token`.
- Event `CashierNewOrderCreated` yang implements `ShouldBroadcastNow` (atau `ShouldBroadcast` dengan queue).
- Channel authorization di `channels.php` untuk private channel `outlet.{outletId}`.
- Modifikasi `OrderService::storeCustomer()` untuk dispatch event setelah commit.
- Modifikasi `FcmNotificationService` untuk support pengiriman ke employee/device.

### 2.2 Cashier App Flutter

**Yang sudah ada:**

- `pubspec.yaml` — tidak ada `firebase_core`, `firebase_messaging`, Echo/Reverb client, local notification, atau audio player.
- `home_screen.dart` — icon notification sudah ada di header, `_handleNotificationTap()` masih kosong.
- `AuthCubit` — punya `login()`, `logout()`, `checkAuthStatus()`, `refreshMe()`. Belum ada integrasi FCM.
- `AuthProvider` — factory pattern yang sudah jelas strukturnya untuk menambahkan dependency.
- `main.dart` — init pattern sudah jelas, menggunakan `BlocProvider` multi-provider.
- Pola provider (factory class) sudah konsisten di semua fitur.
- Pola cubit/state sudah konsisten.

**Yang perlu ditambahkan:**

- Dependencies Flutter: `firebase_core`, `firebase_messaging`, `flutter_local_notifications`, `audioplayers` (atau `just_audio`), dan client WebSocket untuk Reverb.
- Firebase initialization di `main.dart`.
- `NotificationService` singleton untuk menangani FCM + Reverb lifecycle.
- `FcmTokenDatasource` dan usecase untuk mengirim/menghapus token FCM ke backend.
- Integrasi `NotificationService` dengan `AuthCubit` (send token setelah login, clear saat logout).
- UI: badge pada notification icon di `home_screen.dart`.
- UI: banner in-app overlay saat order baru masuk di foreground.
- UI: sound notifikasi.
- UI: navigasi ke daftar order atau detail order saat banner/push diklik.
- Halaman notifikasi (stub awal) yang dibuka saat icon notifikasi diklik.
- Logic deduplication menggunakan Set atau LRU cache di memori.
- Sync ulang badge/count saat app resume dan saat Reverb reconnect.

---

## 3. Keputusan Teknis

### 3.1 Penyimpanan Token FCM Employee

**Keputusan: Tabel terpisah `employee_device_tokens`**

Alasan:
- Satu employee bisa login di beberapa device sekaligus → satu baris per device, bukan satu kolom di `employees`.
- Logout per-device harus membersihkan token device tersebut saja, tidak mempengaruhi device lain.
- Konsisten dengan pola yang ada di `CustomerAccount.fcm_token` untuk kasus single-device. Employee perlu multi-device.

Skema tabel:

```sql
employee_device_tokens
- id (bigint, PK)
- employee_id (bigint, FK → employees.id)
- token (string, 255, unique)
- device_name (string, nullable) — dari header request
- last_used_at (timestamp, nullable)
- created_at, updated_at
```

### 3.2 Channel Reverb

**Keputusan: Private channel `outlet.{outletId}`**

Format: `private-outlet.{outletId}`

Alasan:
- Scoping berdasarkan outlet sudah cukup untuk kebutuhan targeting.
- Authorization di `channels.php` akan memverifikasi bahwa user adalah employee aktif di outlet tersebut dengan permission `order.view`.
- Nama channel stabil dan tidak bergantung pada ID employee individual, sehingga semua cashier outlet yang sama dapat subscribe ke satu channel.

### 3.3 Nama Event Broadcast

**Keputusan: `CashierNewOrderCreated`**

Event di backend: `App\Events\CashierNewOrderCreated`  
Event name di channel (frontend): `cashier.new-order.created`

### 3.4 WebSocket Client Flutter

**Keputusan: `laravel_echo` package (atau `web_socket_channel` + implementasi manual)**

Karena Reverb compatible dengan Pusher protocol, package `laravel_echo` yang tersedia di pub.dev akan digunakan jika tersedia dan stabil. Jika tidak, gunakan `pusher_channels_flutter` yang juga kompatibel dengan Reverb. Implementor perlu mengecek versi dan kompatibilitas terbaru.

### 3.5 Sound Notifikasi

**Keputusan: `audioplayers` package**

Package `audioplayers` sudah mature dan support Android/iOS untuk memutar sound file lokal di foreground.

### 3.6 Local Notification (Foreground)

**Keputusan: `flutter_local_notifications`**

Untuk menampilkan notifikasi sistem saat app di foreground (khususnya background handler FCM) dan banner in-app custom.

### 3.7 Event Dispatch Timing

**Keputusan: `ShouldDispatchAfterCommit`**

Event `CashierNewOrderCreated` harus implement `ShouldDispatchAfterCommit` agar dispatch hanya terjadi setelah transaksi DB berhasil commit. Ini konsisten dengan pattern yang sudah ada di `OutletCreated`.

### 3.8 FCM Kegagalan

Kegagalan FCM tidak boleh membatalkan pembuatan order. Dispatch FCM dilakukan di dalam `try-catch` terpisah atau via `ShouldDispatchAfterCommit` dengan queue. Jika token tidak valid (exception `InvalidArgumentException` atau response 400/404 dari FCM), token yang bersangkutan ditandai invalid atau dihapus dari tabel.

---

## 4. Perubahan yang Diperlukan

### 4.1 Backend

#### 4.1.1 Install Laravel Reverb

**[MODIFY] `composer.json`**

Jalankan:

```bash
composer require laravel/reverb
php artisan reverb:install
```

Perintah `reverb:install` akan membuat file konfigurasi `config/reverb.php` dan menambahkan entri environment di `.env`.

#### 4.1.2 Tabel Employee Device Tokens

**[NEW] Migration `create_employee_device_tokens_table`**

File: `database/migrations/2026_06_11_000001_create_employee_device_tokens_table.php`

```php
Schema::create('employee_device_tokens', function (Blueprint $table) {
    $table->id();
    $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
    $table->string('token')->unique();
    $table->string('device_name')->nullable();
    $table->timestamp('last_used_at')->nullable();
    $table->timestamps();
});
```

**[NEW] Model `EmployeeDeviceToken`**

File: `app/Models/EmployeeDeviceToken.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeDeviceToken extends Model
{
    protected $fillable = [
        'employee_id',
        'token',
        'device_name',
        'last_used_at',
    ];

    protected function casts(): array
    {
        return [
            'last_used_at' => 'datetime',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
```

**[MODIFY] `Employee.php`**

Tambahkan relasi `deviceTokens`:

```php
public function deviceTokens(): HasMany
{
    return $this->hasMany(EmployeeDeviceToken::class);
}
```

#### 4.1.3 Endpoint FCM Token Employee

**[NEW] `EmployeeFcmTokenController`**

File: `app/Http/Controllers/Api/EmployeeFcmTokenController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmployeeDeviceToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeFcmTokenController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string|max:255',
            'device_name' => 'nullable|string|max:100',
        ]);

        $employee = $request->user();

        EmployeeDeviceToken::updateOrCreate(
            ['token' => $request->token],
            [
                'employee_id' => $employee->id,
                'device_name' => $request->device_name,
                'last_used_at' => now(),
            ]
        );

        return $this->successResponse(null, 'FCM token registered');
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string|max:255',
        ]);

        $employee = $request->user();

        EmployeeDeviceToken::where('employee_id', $employee->id)
            ->where('token', $request->token)
            ->delete();

        return $this->successResponse(null, 'FCM token removed');
    }
}
```

**[MODIFY] `routes/api_mobile_cashier.php`**

Tambahkan route FCM token di dalam group auth:

```php
use App\Http\Controllers\Api\EmployeeFcmTokenController;

// Di dalam group auth:
Route::prefix('auth')->name('auth.')->controller(EmployeeAuthController::class)->group(function () {
    Route::post('/login', 'login')->name('login');
    Route::post('/logout', 'logout')->name('logout');
    Route::get('/validate', 'validateToken')->name('validate');
    Route::get('/me', 'me')->name('me');
});

// Route FCM token (di luar group auth controller karena controller berbeda):
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/fcm-token', [EmployeeFcmTokenController::class, 'store'])->name('auth.fcm-token.store');
    Route::delete('/auth/fcm-token', [EmployeeFcmTokenController::class, 'destroy'])->name('auth.fcm-token.destroy');
});
```

> **Catatan untuk implementor**: Letakkan route FCM token di dalam group `mobile/cashier` yang sudah ada, dengan middleware `auth:sanctum`. Karena endpoint ini bukan bagian dari `EmployeeAuthController`, ia perlu route tersendiri dengan `EmployeeFcmTokenController`.

#### 4.1.4 Broadcasting Authorization Channel

**[MODIFY] `routes/channels.php`**

File: `routes/channels.php`

Tambahkan authorization untuk private channel outlet:

```php
use App\Models\Employee;

Broadcast::channel('outlet.{outletId}', function (Employee $employee, int $outletId) {
    // Employee harus aktif, berada di outlet yang sama, dan memiliki permission order.view
    if (!$employee->is_active) {
        return false;
    }

    if ((int) $employee->outlet_id !== $outletId) {
        return false;
    }

    // Cek permission order.view menggunakan sistem permission yang sudah ada
    // Sesuaikan dengan cara cek permission yang sudah dipakai di middleware position.permission
    return $employee->hasPermissionViaPosition('order.view');
});
```

> **Catatan untuk implementor**: Method `hasPermissionViaPosition` harus disesuaikan dengan implementasi permission yang ada di codebase. Cek file `Middleware/` untuk cara middleware `position.permission` mengecek permission employee, kemudian ekstrak logic tersebut agar bisa digunakan di sini.

#### 4.1.5 Event Broadcast Order Baru

**[NEW] `CashierNewOrderCreated` Event**

File: `app/Events/CashierNewOrderCreated.php`

```php
<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class CashierNewOrderCreated implements ShouldBroadcastNow, ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $eventId;

    public function __construct(
        public readonly Order $order
    ) {
        $this->eventId = (string) Str::uuid();
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('outlet.' . $this->order->outlet_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'cashier.new-order.created';
    }

    public function broadcastWith(): array
    {
        $customer = $this->order->customer;

        return [
            'type'         => 'cashier_new_order',
            'eventId'      => $this->eventId,
            'orderId'      => $this->order->id,
            'orderNumber'  => $this->order->order_number ?? '#' . $this->order->id,
            'outletId'     => $this->order->outlet_id,
            'status'       => $this->order->status,
            'customerName' => $customer?->name ?? null,
            'pickupType'   => $this->order->pickup_type ?? null,
            'deliveryType' => $this->order->delivery_type ?? null,
            'createdAt'    => $this->order->created_at?->toIso8601String(),
        ];
    }
}
```

#### 4.1.6 FcmNotificationService — Dukungan Employee

**[MODIFY] `FcmNotificationService.php`**

File: `app/Services/FcmNotificationService.php`

Tambahkan method `sendToEmployeeDevices`:

```php
use App\Models\Employee;
use App\Models\EmployeeDeviceToken;

/**
 * Send push notification to all active devices of an employee.
 */
public function sendToEmployeeDevices(Employee $employee, string $title, string $body, array $data = []): void
{
    $tokens = EmployeeDeviceToken::where('employee_id', $employee->id)->pluck('token');

    foreach ($tokens as $token) {
        $success = $this->send($token, $title, $body, $data);

        if (!$success) {
            // Token invalid atau expired — hapus dari tabel
            EmployeeDeviceToken::where('token', $token)->delete();
            Log::info("Removed invalid FCM token for employee #{$employee->id}");
        }
    }
}

/**
 * Send push notification to all cashier employees in a specific outlet
 * who have order.view permission.
 */
public function sendToOutletCashiers(int $outletId, string $title, string $body, array $data = []): void
{
    // Ambil semua employee aktif di outlet dengan permission order.view
    // Sesuaikan query dengan cara permission dicek di codebase (menggunakan spatie/permission)
    $employees = Employee::where('outlet_id', $outletId)
        ->where('is_active', true)
        ->whereHas('positions', function ($q) {
            $q->where('positions.is_active', true)
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

> **Catatan untuk implementor**: Query `whereHas('positions')` harus disesuaikan dengan skema `position_permissions` yang ada. Cek file `PositionPermission.php` dan `Position.php` untuk memahami relasi yang tepat.

#### 4.1.7 Trigger Broadcast dan FCM di OrderService

**[MODIFY] `OrderService.php`**

File: `app/Services/OrderService.php`

Di dalam method `storeCustomer()`, setelah `return $order->load(...)`, tambahkan dispatch event sebelum return dari dalam transaction. Karena event implements `ShouldDispatchAfterCommit`, event akan otomatis dieksekusi setelah commit:

```php
// Di dalam storeCustomer(), setelah order berhasil dibuat:
$order = $order->load(['orderItems', 'outlet', 'customer']);

// Dispatch Reverb broadcast event (ShouldDispatchAfterCommit — otomatis setelah commit)
CashierNewOrderCreated::dispatch($order);

// Dispatch FCM push (juga setelah commit, via job queue atau langsung)
// Gunakan try-catch agar tidak membatalkan order jika FCM gagal
try {
    $this->fcmService->sendToOutletCashiers(
        outletId: $order->outlet_id,
        title: 'Order Baru Masuk',
        body: 'Order dari ' . ($order->customer?->name ?? 'customer') . ' menunggu diproses.',
        data: [
            'type'        => 'cashier_new_order',
            'orderId'     => (string) $order->id,
            'orderNumber' => $order->order_number ?? (string) $order->id,
            'outletId'    => (string) $order->outlet_id,
            'status'      => $order->status,
        ]
    );
} catch (\Throwable $e) {
    Log::warning('FCM send to cashiers failed (non-critical)', [
        'order_id' => $order->id,
        'error'    => $e->getMessage(),
    ]);
}

return $order;
```

> **Catatan untuk implementor**: Pastikan `use App\Events\CashierNewOrderCreated;` ditambahkan ke import di atas file `OrderService.php`.

---

### 4.2 Cashier App Flutter

#### 4.2.1 Dependencies

**[MODIFY] `apps/cashier/pubspec.yaml`**

Tambahkan dependencies berikut:

```yaml
dependencies:
  # Firebase
  firebase_core: ^3.0.0
  firebase_messaging: ^15.0.0
  
  # Local notifications (untuk foreground FCM + in-app banner)
  flutter_local_notifications: ^18.0.0
  
  # Audio
  audioplayers: ^6.0.0
  
  # WebSocket client untuk Reverb (Pusher-compatible)
  # Pilih salah satu — cek versi terbaru saat implementasi:
  pusher_channels_flutter: ^2.0.0
  # Alternatif: laravel_echo (jika tersedia dan stabil di pub.dev)
```

> **Catatan untuk implementor**: Cek versi terbaru dari masing-masing package saat implementasi. `pusher_channels_flutter` kompatibel dengan Laravel Reverb karena Reverb mendukung Pusher protocol.

#### 4.2.2 Firebase Initialization

**[NEW] `google-services.json`** (Android)

File: `apps/cashier/android/app/google-services.json`

Download dari Firebase Console untuk project yang sudah dikonfigurasi. Pastikan package name sesuai dengan app cashier.

**[MODIFY] `apps/cashier/android/build.gradle`** (root level)

Tambahkan Google Services classpath:

```gradle
classpath 'com.google.gms:google-services:4.4.0'
```

**[MODIFY] `apps/cashier/android/app/build.gradle`**

Tambahkan plugin:

```gradle
apply plugin: 'com.google.gms.google-services'
```

**[MODIFY] `apps/cashier/lib/main.dart`**

Tambahkan Firebase initialization sebelum `runApp()`:

```dart
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'firebase_options.dart'; // generated by FlutterFire CLI

// Background handler — harus top-level function
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  // Tidak perlu logic kompleks di sini — FCM akan menampilkan notifikasi sistem secara otomatis
  // untuk notification messages. Data-only messages perlu local notification.
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  await Hive.initFlutter();
  await initializeDateFormatting('id_ID', null);

  // ... sisa initialization
}
```

> **Catatan untuk implementor**: Gunakan FlutterFire CLI untuk generate `firebase_options.dart`:
> ```
> dart pub global activate flutterfire_cli
> flutterfire configure
> ```

#### 4.2.3 Notification Service

**[NEW] `NotificationService`**

File: `apps/cashier/lib/core/services/notification_service.dart`

Service singleton ini mengelola:
- Inisialisasi `flutter_local_notifications`
- Request permission FCM
- Mendapatkan dan merefresh FCM token
- Mengelola koneksi Reverb (subscribe/unsubscribe)
- Menangani payload order baru
- Deduplication
- Sound notifikasi

```dart
import 'dart:async';
import 'dart:collection';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:audioplayers/audioplayers.dart';

class NewOrderPayload {
  final String type;
  final String eventId;
  final int orderId;
  final String orderNumber;
  final int outletId;
  final String status;
  final String? customerName;
  final String? pickupType;
  final DateTime? createdAt;

  const NewOrderPayload({
    required this.type,
    required this.eventId,
    required this.orderId,
    required this.orderNumber,
    required this.outletId,
    required this.status,
    this.customerName,
    this.pickupType,
    this.createdAt,
  });

  factory NewOrderPayload.fromMap(Map<String, dynamic> data) {
    return NewOrderPayload(
      type: data['type'] as String? ?? 'cashier_new_order',
      eventId: data['eventId'] as String? ?? '',
      orderId: int.tryParse(data['orderId']?.toString() ?? '') ?? 0,
      orderNumber: data['orderNumber']?.toString() ?? '',
      outletId: int.tryParse(data['outletId']?.toString() ?? '') ?? 0,
      status: data['status']?.toString() ?? '',
      customerName: data['customerName']?.toString(),
      pickupType: data['pickupType']?.toString(),
      createdAt: data['createdAt'] != null
          ? DateTime.tryParse(data['createdAt'].toString())
          : null,
    );
  }
}

class NotificationService {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();
  final AudioPlayer _audioPlayer = AudioPlayer();
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;

  // Deduplication: simpan eventId yang sudah ditampilkan (max 100 entry)
  final LinkedHashSet<String> _shownEventIds = LinkedHashSet();
  static const int _maxDeduplicationEntries = 100;

  // Stream controller untuk mengirim payload ke UI
  final StreamController<NewOrderPayload> _newOrderController =
      StreamController.broadcast();
  Stream<NewOrderPayload> get onNewOrder => _newOrderController.stream;

  // Badge count (in-memory)
  int _badgeCount = 0;
  int get badgeCount => _badgeCount;
  final StreamController<int> _badgeController = StreamController.broadcast();
  Stream<int> get onBadgeCountChanged => _badgeController.stream;

  // FCM token callback
  Function(String token)? onTokenReceived;
  Function(String token)? onTokenRefreshed;

  bool _initialized = false;

  // Reverb connection (WebSocket)
  // Tipe spesifik tergantung package yang dipilih (pusher_channels_flutter, dll)
  dynamic _pusher;
  int? _subscribedOutletId;

  Future<void> initialize() async {
    if (_initialized) return;
    _initialized = true;

    // Setup local notifications
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );
    await _localNotifications.initialize(
      const InitializationSettings(android: androidSettings, iOS: iosSettings),
      onDidReceiveNotificationResponse: _onLocalNotificationTap,
    );

    // Setup FCM handlers
    FirebaseMessaging.onMessage.listen(_handleForegroundFcm);
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);

    // Cek apakah app dibuka dari terminated via notification
    final initialMessage = await _fcm.getInitialMessage();
    if (initialMessage != null) {
      _handleNotificationTap(initialMessage);
    }

    _initialized = true;
  }

  Future<void> requestPermissions() async {
    final settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
    // Log hasil permission request
  }

  Future<String?> getFcmToken() async {
    return await _fcm.getToken();
  }

  void listenTokenRefresh(Function(String) callback) {
    _fcm.onTokenRefresh.listen(callback);
  }

  /// Hubungkan ke Reverb untuk outlet tertentu.
  /// Panggil setelah employee berhasil login dan outlet ID diketahui.
  Future<void> connectReverb({
    required int outletId,
    required String authToken,
    required String reverbAppKey,
    required String reverbHost,
    required int reverbPort,
  }) async {
    if (_subscribedOutletId == outletId) return; // Sudah subscribe

    await disconnectReverb(); // Disconnect dari outlet lama jika ada

    // Implementasi menggunakan pusher_channels_flutter:
    // _pusher = PusherChannelsFlutter.getInstance();
    // await _pusher.init(
    //   apiKey: reverbAppKey,
    //   cluster: 'mt1', // dummy, Reverb tidak butuh cluster
    //   authEndpoint: '$baseUrl/broadcasting/auth',
    //   onAuthorizer: (channelName, socketId, options) async {
    //     // Kirim request ke /broadcasting/auth dengan Bearer token
    //   },
    // );
    // await _pusher.connect();
    // await _pusher.subscribe(
    //   channelName: 'private-outlet.$outletId',
    //   onEvent: (event) {
    //     if (event.eventName == 'cashier.new-order.created') {
    //       _handleReverbEvent(event.data);
    //     }
    //   },
    // );
    _subscribedOutletId = outletId;
  }

  Future<void> disconnectReverb() async {
    if (_pusher != null) {
      // await _pusher.disconnect();
      _pusher = null;
      _subscribedOutletId = null;
    }
  }

  void _handleReverbEvent(dynamic rawData) {
    try {
      final data = rawData is String
          ? Map<String, dynamic>.from(/* json decode */ {})
          : Map<String, dynamic>.from(rawData as Map);
      
      final payload = NewOrderPayload.fromMap(data);

      if (_isDuplicate(payload.eventId)) return;
      _markShown(payload.eventId);
      _incrementBadge();
      _newOrderController.add(payload);
      _playSound();
    } catch (e) {
      // Log error
    }
  }

  void _handleForegroundFcm(RemoteMessage message) {
    if (message.data['type'] != 'cashier_new_order') return;

    final eventId = message.data['eventId'] ?? message.messageId ?? '';
    if (_isDuplicate(eventId)) return;
    _markShown(eventId);

    final payload = NewOrderPayload.fromMap(message.data);
    _incrementBadge();
    _newOrderController.add(payload);
    _playSound();
  }

  void _handleNotificationTap(RemoteMessage message) {
    if (message.data['type'] != 'cashier_new_order') return;
    final payload = NewOrderPayload.fromMap(message.data);
    // Kirim ke stream agar UI bisa navigate ke order
    _newOrderController.add(payload);
  }

  void _onLocalNotificationTap(NotificationResponse response) {
    // Parse payload dari response.payload dan navigate
  }

  Future<void> _playSound() async {
    try {
      await _audioPlayer.play(AssetSource('sounds/new_order.mp3'));
    } catch (e) {
      // Log error — jangan crash
    }
  }

  bool _isDuplicate(String eventId) {
    if (eventId.isEmpty) return false;
    return _shownEventIds.contains(eventId);
  }

  void _markShown(String eventId) {
    if (eventId.isEmpty) return;
    if (_shownEventIds.length >= _maxDeduplicationEntries) {
      _shownEventIds.remove(_shownEventIds.first);
    }
    _shownEventIds.add(eventId);
  }

  void _incrementBadge() {
    _badgeCount++;
    _badgeController.add(_badgeCount);
  }

  void clearBadge() {
    _badgeCount = 0;
    _badgeController.add(_badgeCount);
  }

  /// Sync ulang badge dari backend. Panggil saat app resume atau Reverb reconnect.
  /// Gunakan endpoint yang mengembalikan count order baru (requested/pending_dropoff).
  Future<void> syncBadgeFromBackend(Future<int> Function() fetchNewOrderCount) async {
    try {
      final count = await fetchNewOrderCount();
      _badgeCount = count;
      _badgeController.add(_badgeCount);
    } catch (e) {
      // Log error — biarkan badge count tidak berubah
    }
  }

  void dispose() {
    _newOrderController.close();
    _badgeController.close();
    _audioPlayer.dispose();
  }
}
```

#### 4.2.4 FCM Token Datasource dan Usecase

**[NEW] `FcmTokenDatasource` untuk cashier**

File: `apps/cashier/lib/features/auth/data/datasources/fcm_token_datasource.dart`

```dart
abstract class FcmTokenDatasource {
  Future<void> registerToken(String token, {String? deviceName});
  Future<void> removeToken(String token);
}

class FcmTokenDatasourceImpl implements FcmTokenDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  FcmTokenDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<void> registerToken(String token, {String? deviceName}) async {
    await _dio.post(
      _endpoints.updateFcmToken, // gunakan endpoint yang sudah ada atau tambah endpoint khusus cashier
      data: {
        'token': token,
        if (deviceName != null) 'device_name': deviceName,
      },
    );
  }

  @override
  Future<void> removeToken(String token) async {
    await _dio.delete(
      _endpoints.updateFcmToken,
      data: {'token': token},
    );
  }
}
```

> **Catatan untuk implementor**: `ApiEndpoints` di `wash_wallet_core` sudah memiliki `updateFcmToken`. Cek apakah endpoint tersebut mengarah ke endpoint yang benar untuk cashier (`/mobile/cashier/auth/fcm-token`). Jika perlu, tambahkan endpoint baru di `ApiEndpoints`.

**[NEW] Usecase Register/Remove FCM Token**

File: `apps/cashier/lib/features/auth/domain/usecases/register_fcm_token_usecase.dart`

```dart
class RegisterFcmTokenUsecase {
  final FcmTokenDatasource _datasource;
  RegisterFcmTokenUsecase(this._datasource);

  Future<void> call(String token, {String? deviceName}) async {
    return _datasource.registerToken(token, deviceName: deviceName);
  }
}

class RemoveFcmTokenUsecase {
  final FcmTokenDatasource _datasource;
  RemoveFcmTokenUsecase(this._datasource);

  Future<void> call(String token) async {
    return _datasource.removeToken(token);
  }
}
```

#### 4.2.5 Integrasi NotificationService dengan AuthCubit

**[MODIFY] `AuthCubit`**

File: `apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart`

Setelah login berhasil:
1. Call `NotificationService.instance.getFcmToken()`.
2. Kirim token ke backend via `RegisterFcmTokenUsecase`.
3. Call `NotificationService.instance.connectReverb(outletId: employee.outletId, ...)`.

Sebelum/saat logout:
1. Ambil token FCM saat ini.
2. Kirim `RemoveFcmTokenUsecase` untuk menghapus token dari backend.
3. Call `NotificationService.instance.disconnectReverb()`.

Contoh modifikasi `login()`:

```dart
Future<void> login({required String username, required String password}) async {
  emit(const AuthLoading());

  final result = await _loginUsecase(username: username, password: password);

  await result.when(
    success: (employee) async {
      emit(Authenticated(employee));
      
      // Setup FCM token
      final token = await NotificationService.instance.getFcmToken();
      if (token != null) {
        try {
          await _registerFcmTokenUsecase(token);
        } catch (_) {
          // Non-critical — log tapi jangan gagalkan login
        }
      }
      
      // Listen token refresh
      NotificationService.instance.listenTokenRefresh((newToken) async {
        try {
          await _registerFcmTokenUsecase(newToken);
        } catch (_) {}
      });

      // Connect Reverb
      // await NotificationService.instance.connectReverb(
      //   outletId: employee.outletId,
      //   authToken: currentToken,
      //   ...
      // );
    },
    failure: (failure) => emit(AuthFailureState(failure)),
  );
}
```

#### 4.2.6 Backend Endpoint untuk Count Order Baru

**[MODIFY] `routes/api_mobile_cashier.php`**

Tambahkan endpoint untuk mendapatkan jumlah order baru (untuk sync badge):

```php
Route::get('/orders/new-count', [OrderController::class, 'newCount'])
    ->name('orders.new-count')
    ->middleware('position.permission:order.view');
```

**[MODIFY] `OrderController`**

Tambahkan method `newCount`:

```php
public function newCount(Request $request): JsonResponse
{
    $employee = $request->user();
    
    $count = Order::where('outlet_id', $employee->outlet_id)
        ->whereIn('status', ['requested', 'pending_dropoff'])
        ->where('source', Order::SOURCE_CUSTOMER_APP)
        ->count();

    return $this->successResponse(['count' => $count], 'Success');
}
```

---

### 4.3 UI Cashier App

#### 4.3.1 Badge pada Notification Icon

**[MODIFY] `home_screen.dart`**

File: `apps/cashier/lib/features/home/presentation/screens/home_screen.dart`

Ganti `IconButton` notifikasi dengan widget yang menampilkan badge:

```dart
// Gunakan StreamBuilder untuk badge count
StreamBuilder<int>(
  stream: NotificationService.instance.onBadgeCountChanged,
  initialData: NotificationService.instance.badgeCount,
  builder: (context, snapshot) {
    final count = snapshot.data ?? 0;
    return Stack(
      children: [
        IconButton(
          onPressed: () => _handleNotificationTap(context),
          icon: const Icon(Icons.notifications_outlined),
        ),
        if (count > 0)
          Positioned(
            right: 8,
            top: 8,
            child: Container(
              padding: const EdgeInsets.all(2),
              decoration: BoxDecoration(
                color: context.colors.error,
                borderRadius: BorderRadius.circular(10),
              ),
              constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
              child: Text(
                count > 99 ? '99+' : count.toString(),
                style: const TextStyle(color: Colors.white, fontSize: 10),
                textAlign: TextAlign.center,
              ),
            ),
          ),
      ],
    );
  },
),
```

Implementasikan `_handleNotificationTap`:

```dart
void _handleNotificationTap(BuildContext context) {
  NotificationService.instance.clearBadge();
  // Navigate ke halaman daftar order baru
  final authState = context.read<AuthCubit>().state;
  if (authState is Authenticated) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => IndexOrdersScreen(
          outletId: authState.employee.outletId,
          initialStatusFilter: 'requested', // filter order baru
        ),
      ),
    );
  }
}
```

#### 4.3.2 Banner In-App Order Baru

**[NEW] `NewOrderBanner` Widget**

File: `apps/cashier/lib/features/home/presentation/widgets/new_order_banner.dart`

Widget overlay yang muncul saat ada order baru:

```dart
class NewOrderBanner extends StatefulWidget {
  final NewOrderPayload payload;
  final VoidCallback onTap;
  final VoidCallback onDismiss;

  const NewOrderBanner({
    super.key,
    required this.payload,
    required this.onTap,
    required this.onDismiss,
  });

  @override
  State<NewOrderBanner> createState() => _NewOrderBannerState();
}

class _NewOrderBannerState extends State<NewOrderBanner>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _slideAnimation;
  Timer? _autoDismissTimer;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, -1),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));
    
    _controller.forward();
    
    // Auto dismiss setelah 5 detik
    _autoDismissTimer = Timer(const Duration(seconds: 5), widget.onDismiss);
  }

  @override
  void dispose() {
    _controller.dispose();
    _autoDismissTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final customerName = widget.payload.customerName ?? 'Customer';
    final orderNumber = widget.payload.orderNumber;

    return SlideTransition(
      position: _slideAnimation,
      child: GestureDetector(
        onTap: widget.onTap,
        child: Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: context.colors.primary,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.2),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              const Icon(Icons.notifications_active, color: Colors.white),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'Order Baru Masuk',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Order $orderNumber dari $customerName menunggu diproses',
                      style: const TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close, color: Colors.white, size: 18),
                onPressed: widget.onDismiss,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

**[MODIFY] `home_screen.dart`**

Tambahkan `StreamBuilder` untuk mendengarkan `NotificationService.instance.onNewOrder` dan menampilkan `NewOrderBanner` sebagai overlay:

```dart
// Di dalam Stack body HomeScreen (atau gunakan Overlay):
StreamBuilder<NewOrderPayload>(
  stream: NotificationService.instance.onNewOrder,
  builder: (context, snapshot) {
    if (!snapshot.hasData) return const SizedBox.shrink();
    
    return Positioned(
      top: MediaQuery.of(context).padding.top,
      left: 0,
      right: 0,
      child: NewOrderBanner(
        payload: snapshot.data!,
        onTap: () => _navigateToOrder(context, snapshot.data!.orderId),
        onDismiss: () {
          // Clear banner — gunakan state management sederhana
        },
      ),
    );
  },
),
```

> **Catatan untuk implementor**: Karena `StreamBuilder` merespons setiap event baru, pertimbangkan menggunakan `BlocListener` atau state lokal di level `HomeScreen` untuk mengelola daftar banner yang muncul dan dismiss. Pastikan banner tidak muncul berlapis-lapis jika banyak order datang bersamaan — tampilkan satu banner pada satu waktu dan queue sisanya.

#### 4.3.3 Sound File

**[NEW] Sound asset**

File: `apps/cashier/assets/sounds/new_order.mp3`

Tambahkan file sound notifikasi (pilih sound yang tidak mengganggu, misalnya chime singkat).

**[MODIFY] `apps/cashier/pubspec.yaml`**

Tambahkan di section assets:

```yaml
flutter:
  assets:
    - assets/images/core/
    - assets/images/icons/
    - assets/sounds/  # TAMBAH
```

#### 4.3.4 Navigasi dari Push (Background/Terminated)

**[MODIFY] `main.dart`**

Tangani `getInitialMessage()` dan `onMessageOpenedApp` untuk navigasi ke order setelah app dibuka dari push:

```dart
// Setup di main() atau di dalam widget tree awal:
FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
  if (message.data['type'] == 'cashier_new_order') {
    final orderId = int.tryParse(message.data['orderId'] ?? '');
    if (orderId != null) {
      // Navigate ke ShowOrderScreen atau IndexOrdersScreen
      // Gunakan GoRouter atau navigatorKey global
    }
  }
});
```

> **Catatan untuk implementor**: Karena cashier app menggunakan `GoRouter`, gunakan `GlobalKey<NavigatorState>` atau `GoRouter` instance yang dapat diakses secara global untuk navigasi dari handler yang berjalan di luar widget tree.

#### 4.3.5 App Lifecycle — Sync Badge saat Resume

**[MODIFY] `home_screen.dart`** atau di `_HomeScreenState`

Tambahkan `WidgetsBindingObserver` untuk mendeteksi saat app kembali ke foreground:

```dart
class _HomeScreenState extends State<HomeScreen> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    Future.microtask(() {
      context.read<HomeCubit>().getHomeData();
      _syncNotificationBadge();
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _syncNotificationBadge();
    }
  }

  Future<void> _syncNotificationBadge() async {
    await NotificationService.instance.syncBadgeFromBackend(() async {
      // Fetch count dari backend
      final result = await context.read<OrderCubit>().getNewOrderCount();
      return result;
    });
  }
}
```

---

## 5. File yang Diubah — Ringkasan

### Backend (`webapp/wash_wallet_be`)

| File | Aksi | Deskripsi |
|------|------|-----------|
| `composer.json` | MODIFY | Tambah `laravel/reverb` |
| `database/migrations/2026_06_11_000001_create_employee_device_tokens_table.php` | NEW | Tabel device token employee |
| `app/Models/EmployeeDeviceToken.php` | NEW | Model device token |
| `app/Models/Employee.php` | MODIFY | Tambah relasi `deviceTokens()` |
| `app/Http/Controllers/Api/EmployeeFcmTokenController.php` | NEW | Controller register/remove FCM token |
| `routes/api_mobile_cashier.php` | MODIFY | Tambah route FCM token + route `orders/new-count` |
| `routes/channels.php` | MODIFY | Tambah authorization private channel `outlet.{outletId}` |
| `app/Events/CashierNewOrderCreated.php` | NEW | Broadcast event order baru |
| `app/Services/FcmNotificationService.php` | MODIFY | Tambah `sendToEmployeeDevices()` dan `sendToOutletCashiers()` |
| `app/Services/OrderService.php` | MODIFY | Dispatch `CashierNewOrderCreated` + FCM di `storeCustomer()` |
| `app/Http/Controllers/Api/OrderController.php` | MODIFY | Tambah method `newCount()` |

### Cashier App (`apps/cashier`)

| File | Aksi | Deskripsi |
|------|------|-----------|
| `pubspec.yaml` | MODIFY | Tambah firebase, notifications, audioplayers, pusher deps |
| `android/app/google-services.json` | NEW | Firebase config Android |
| `android/build.gradle` | MODIFY | Google Services classpath |
| `android/app/build.gradle` | MODIFY | Google Services plugin |
| `lib/firebase_options.dart` | NEW | Generated oleh FlutterFire CLI |
| `lib/main.dart` | MODIFY | Firebase init, background handler, FCM tap handler |
| `lib/core/services/notification_service.dart` | NEW | Notification service singleton |
| `lib/features/auth/data/datasources/fcm_token_datasource.dart` | NEW | Datasource register/remove token |
| `lib/features/auth/domain/usecases/register_fcm_token_usecase.dart` | NEW | Usecases FCM token |
| `lib/features/auth/presentation/bloc/auth_cubit.dart` | MODIFY | Integrasi FCM token + Reverb saat login/logout |
| `lib/features/auth/presentation/providers/auth_provider.dart` | MODIFY | Inject FCM token usecases ke AuthCubit |
| `lib/features/home/presentation/screens/home_screen.dart` | MODIFY | Badge icon, banner, sync badge lifecycle |
| `lib/features/home/presentation/widgets/new_order_banner.dart` | NEW | Widget banner in-app |
| `assets/sounds/new_order.mp3` | NEW | Sound file notifikasi |

---

## 6. Urutan Implementasi yang Disarankan

Ikuti urutan ini untuk meminimalkan konflik dan memastikan backend siap sebelum Flutter diuji:

1. **Backend — Install Reverb**: `composer require laravel/reverb` + `php artisan reverb:install`.
2. **Backend — Migration dan Model**: Buat `employee_device_tokens` migration dan `EmployeeDeviceToken` model.
3. **Backend — FCM Token Endpoint**: `EmployeeFcmTokenController` + route.
4. **Backend — Channel Authorization**: Update `channels.php`.
5. **Backend — Broadcast Event**: Buat `CashierNewOrderCreated`.
6. **Backend — FCM Service Update**: Tambah method di `FcmNotificationService`.
7. **Backend — OrderService Update**: Dispatch event + FCM di `storeCustomer()`.
8. **Backend — Order new-count endpoint**: Tambah ke `OrderController` + route.
9. **Flutter — Dependencies**: Update `pubspec.yaml`, jalankan `flutter pub get`.
10. **Flutter — Firebase Setup**: Generate `firebase_options.dart` via FlutterFire CLI.
11. **Flutter — NotificationService**: Implementasi `notification_service.dart`.
12. **Flutter — FCM Datasource + Usecases**: Buat datasource dan usecases.
13. **Flutter — AuthCubit Integration**: Hubungkan NotificationService dengan AuthCubit.
14. **Flutter — Sound Asset**: Tambah file sound + update pubspec assets.
15. **Flutter — UI Badge + Banner**: Update `home_screen.dart` + buat `NewOrderBanner`.
16. **Flutter — Navigasi Push**: Handle `getInitialMessage` + `onMessageOpenedApp`.
17. **Flutter — App Lifecycle Sync**: Tambah `WidgetsBindingObserver` di HomeScreen.

---

## 7. Catatan Penting untuk Implementor

### 7.1 Permission System Cashier

Backend cashier menggunakan middleware `position.permission:order.view` di route-level. Untuk channel authorization di `channels.php`, implementor harus mengekstrak logic yang sama tanpa middleware. Cek `app/Http/Middleware/` untuk menemukan class middleware tersebut dan cara ia mengecek permission employee.

### 7.2 Reverb Auth Endpoint

Saat `pusher_channels_flutter` (atau client Reverb lain) melakukan handshake untuk private channel, ia akan POST ke `/broadcasting/auth` dengan `socket_id` dan `channel_name`. Endpoint ini sudah disediakan oleh Laravel secara default, namun perlu memastikan:
- Route `/broadcasting/auth` tersedia dan dijaga oleh `auth:sanctum`.
- Guard yang digunakan adalah guard employee, bukan guard user default.

Cek file `config/broadcasting.php` dan `routes/api.php` (atau routes utama) untuk memastikan endpoint ini ada dan dikonfigurasi dengan benar.

### 7.3 iOS Push Notification

Untuk iOS, perlu:
- APNs key atau certificate di Firebase Console.
- Background modes: enable "Remote notifications" dan "Background fetch" di `ios/Runner.xcodeproj`.
- `Info.plist` mungkin perlu entri tambahan untuk `firebase_messaging`.

### 7.4 Kegagalan FCM Tidak Membatalkan Order

Pastikan semua call ke `fcmService` di `OrderService::storeCustomer()` dibungkus dalam `try-catch` terpisah dari transaction utama. Event `CashierNewOrderCreated` dispatch ke Reverb juga tidak boleh throw exception yang mempengaruhi transaction.

### 7.5 Reverb Environment Variables

Setelah `reverb:install`, tambahkan ke `.env`:

```
REVERB_APP_ID=local
REVERB_APP_KEY=local-key
REVERB_APP_SECRET=local-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

BROADCAST_CONNECTION=reverb
```

Di Flutter, nilai `REVERB_APP_KEY`, `REVERB_HOST`, dan `REVERB_PORT` perlu dipass ke `NotificationService.connectReverb()`. Gunakan `--dart-define` atau environment config yang sudah ada di project.

### 7.6 Order Number Field

Cek apakah `Order` model memiliki field `order_number`. Jika tidak ada, gunakan format ID yang readable sebagai fallback di payload broadcast (misalnya `#ORD-{id}`).

### 7.7 Multi-Banner Management

Jika banyak order datang dalam waktu singkat, jangan stack banyak banner sekaligus. Disarankan:
- Tampilkan 1 banner pada satu waktu.
- Queue banner berikutnya dan tampilkan setelah banner sebelumnya dismiss.
- Atau: tampilkan satu banner yang menampilkan jumlah (misalnya `3 order baru masuk`).

---

## 8. Acceptance Criteria Verifikasi

Implementor harus memverifikasi semua poin berikut sebelum dianggap selesai:

### Backend

- [ ] `laravel/reverb` terinstall dan `reverb:install` berhasil.
- [ ] Migration `employee_device_tokens` berhasil dijalankan.
- [ ] `POST /mobile/cashier/auth/fcm-token` menerima token dan menyimpan ke tabel.
- [ ] `DELETE /mobile/cashier/auth/fcm-token` menghapus token dari tabel.
- [ ] Channel authorization `private-outlet.{outletId}` hanya allow employee aktif di outlet tersebut dengan permission `order.view`.
- [ ] Event `CashierNewOrderCreated` dispatch setelah commit pada `storeCustomer()`.
- [ ] Payload event berisi `type`, `eventId`, `orderId`, `orderNumber`, `outletId`, `status`, `customerName`.
- [ ] FCM push dikirim ke semua device employee cashier yang eligible di outlet yang sama.
- [ ] Order yang dibuat oleh cashier POS (`store()`) tidak memicu event/push.
- [ ] Kegagalan Reverb broadcast tidak membatalkan pembuatan order.
- [ ] Kegagalan FCM tidak membatalkan pembuatan order.
- [ ] `GET /mobile/cashier/orders/new-count` mengembalikan count order `requested`/`pending_dropoff` yang benar.

### Cashier App Flutter

- [ ] Firebase berhasil diinisialisasi.
- [ ] Permission notification diminta saat pertama kali login atau launch.
- [ ] FCM token berhasil dikirim ke backend setelah login.
- [ ] FCM token dihapus dari backend saat logout.
- [ ] App terhubung ke Reverb setelah login (foreground subscribe ke `private-outlet.{outletId}`).
- [ ] Reverb disconnect saat logout.
- [ ] Banner in-app muncul saat order baru masuk di foreground.
- [ ] Banner menampilkan nomor order dan nama customer.
- [ ] Sound notifikasi berbunyi saat banner muncul.
- [ ] Badge pada icon notifikasi bertambah saat order baru masuk.
- [ ] Tap banner membuka daftar order atau detail order yang benar.
- [ ] Tap icon notifikasi membuka daftar order baru (bukan handler kosong).
- [ ] Push notification FCM muncul saat app di background.
- [ ] Tap push notification membuka app dan mengarahkan ke order yang relevan.
- [ ] Employee cashier di outlet berbeda tidak menerima event/push.
- [ ] Duplicate event (Reverb + FCM bersamaan) tidak menghasilkan banner/sound ganda.
- [ ] Badge sync ulang saat app resume dari background.
- [ ] Reverb reconnect dan badge sync ulang tanpa kehilangan order.
- [ ] Setelah cashier membuka daftar order (tap icon notifikasi), badge kembali ke nol.

---

## 9. Yang Di Luar Scope Plan Ini

- Notifikasi WhatsApp customer.
- Notifikasi untuk aplikasi production atau courier.
- Redesign menyeluruh dashboard cashier.
- Perubahan flow status order, payment, penimbangan, atau pickup.
- Tracking lokasi realtime.
- Broadcast untuk semua perubahan status order selain order baru dari customer app.
- Admin panel untuk monitoring FCM token atau notifikasi.
