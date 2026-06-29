# Plan: Notifikasi Order Diterima untuk Customer dan Kurir

Tanggal: 2026-06-12  
Referensi user need: `docs/user_need/customer_order_accepted_courier_notification_user_need.md`

---

## 0. Petunjuk Penting untuk Implementor

Plan ini adalah **plan lengkap** yang perlu dibaca dari awal hingga akhir sebelum mengerjakan apapun. Setiap item pekerjaan dikategorikan sebagai:

- ✅ **Sudah ada** — verifikasi saja, jangan timpa.
- 🔧 **Sudah ada tapi perlu dimodifikasi** — modifikasi dengan hati-hati, baca file yang ada terlebih dahulu.
- 🆕 **Belum ada** — buat baru.

> **PENTING**: Selalu baca file aktual di repo sebelum membuat keputusan modifikasi. Jika ada perbedaan antara deskripsi plan ini dan kondisi repo aktual, percayai kondisi repo aktual.

---

## 1. Analisis Kondisi Codebase Saat Ini

### 1.1 Backend (`webapp/wash_wallet_be`)

**Yang sudah ada dan relevan:**

| Item | Status | Keterangan |
|------|--------|------------|
| `laravel/reverb` di `composer.json` | ✅ Sudah ada | Dipakai cashier app untuk notifikasi order baru |
| `employee_device_tokens` migration + model | ✅ Sudah ada | Multi-device token untuk employee |
| `EmployeeDeviceToken` relasi ke `Employee` | ✅ Sudah ada | |
| `FcmNotificationService.php` + method employee | ✅ Sudah ada | Dipakai cashier new order notification |
| `OrderService::acceptCustomer()` atau sejenis | 🔧 Perlu diverifikasi | Endpoint `POST /orders/{id}/accept` sudah ada di cashier datasource |
| Broadcast channel `private-outlet.{outletId}` | ✅ Sudah ada | Di `routes/channels.php` untuk cashier |
| `CashierNewOrderCreated` event | ✅ Sudah ada | Event untuk notifikasi cashier |
| Customer FCM token di `customer_accounts` | ✅ Sudah ada | `fcm_token` kolom di `customer_accounts` (pola single device) |
| Permission system RBAC multi-outlet | ✅ Sudah ada | Dipakai fitur `courier_multi_outlet_pickup_plan` |

**Yang perlu dibuat/dimodifikasi:**

| Item | Status | Keterangan |
|------|--------|------------|
| Event `CustomerOrderAccepted` (broadcast ke customer) | 🆕 Buat baru | Event baru untuk customer |
| Event atau Job `CourierNewPickupNotification` | 🆕 Buat baru | Notifikasi ke kurir berdasarkan permission |
| Modifikasi `OrderService::accept()` | 🔧 Modifikasi | Tambahkan dispatch event setelah order accepted, dengan guard sumber order customer app |
| Query kurir berdasarkan `positions.outlet_id` + permission aktif | 🆕 Buat baru | Logic targeting kurir multi-outlet |
| Private broadcast channel untuk customer | 🆕 Buat baru | Channel `private-customer.{customerId}` di `channels.php` |
| FCM payload untuk customer (order accepted) | 🔧 Extend | Extend `FcmNotificationService` untuk send ke customer (order accepted) |
| FCM payload untuk kurir (new pickup) | 🔧 Extend | Extend `FcmNotificationService` untuk send ke kurir (pickup baru) |

### 1.2 Customer App (`apps/customer`)

**Yang sudah ada dan relevan:**

| Item | Status | Keterangan |
|------|--------|------------|
| `firebase_core` + `firebase_messaging` | ✅ Sudah ada | Di `pubspec.yaml` |
| Firebase init di `main.dart` | ✅ Sudah ada | `Firebase.initializeApp()` |
| `CustomerAuthCubit` dengan `_update()` FCM token | ✅ Sudah ada | Token dikirim ke backend saat login/register |
| `FcmTokenRemoteDataSourceImpl` | ✅ Sudah ada | `POST /customer/auth/fcm-token` dengan field `fcm_token` |
| `ShowOrderScreen` | ✅ Sudah ada | Detail order customer di `show_order_screen.dart` |

**Yang perlu dibuat:**

| Item | Status | Keterangan |
|------|--------|------------|
| Background message handler | 🆕 Buat baru | `@pragma('vm:entry-point')` function di `main.dart` |
| `CustomerNotificationService` | 🆕 Buat baru | Singleton untuk handle FCM foreground + tap |
| Foreground notification listener | 🆕 Buat baru | `FirebaseMessaging.onMessage` listener |
| Navigation saat tap notifikasi | 🆕 Buat baru | `PushNotificationCoordinator` untuk customer, atau extend yang ada |
| Deduplication dengan `eventId` atau `orderId` | 🆕 Buat baru | In-memory set untuk cegah notif ganda |
| `flutter_local_notifications` dependency | 🆕 Tambah ke `pubspec.yaml` | Untuk show notif saat foreground |

### 1.3 Production App (`apps/production`)

**Yang sudah ada dan relevan:**

| Item | Status | Keterangan |
|------|--------|------------|
| `AuthCubit` production | ✅ Sudah ada | Login/logout, belum ada FCM integration |
| `PickupScheduleScreen` | ✅ Sudah ada | Layar daftar pickup kurir |
| `OrderCubit::getPickupSchedule()` | ✅ Sudah ada | Fetch pickup orders berdasarkan `outletIds` dan tanggal |
| Permission/RBAC: `accessibleOutletIds` di `Employee` | ✅ Sudah ada | Dipakai `PickupScheduleScreen` |
| `hive_flutter` | ✅ Sudah ada | Di `pubspec.yaml` |

**Yang perlu dibuat:**

| Item | Status | Keterangan |
|------|--------|------------|
| `firebase_core` + `firebase_messaging` | 🆕 Tambah ke `pubspec.yaml` | Belum ada di production app |
| `flutter_local_notifications` + `audioplayers` | 🆕 Tambah ke `pubspec.yaml` | Untuk show notif foreground + sound |
| `pusher_channels_flutter` | 🆕 Tambah ke `pubspec.yaml` | Realtime event dari Reverb |
| Firebase init di `main.dart` | 🆕 Modifikasi | Tambahkan Firebase init + background handler |
| `ProductionNotificationService` | 🆕 Buat baru | Singleton untuk handle FCM + Pusher lifecycle |
| `NewPickupPayload` | 🆕 Buat baru | Model payload notifikasi pickup baru |
| Auth FCM token datasource + endpoint | 🆕 Buat baru | Mirip cashier app: `FcmTokenDatasource` untuk production |
| FCM token kirim saat login + hapus saat logout | 🔧 Modifikasi `AuthCubit` | Tambahkan integrasi FCM token |
| Permission guard di app untuk filter notifikasi | 🆕 Buat baru | Validasi employee punya `courier.view`/`courier.manage` |
| Navigation tap notifikasi ke pickup screen | 🆕 Buat baru | `PushNotificationCoordinator` untuk production |
| Refresh list pickup saat notifikasi diterima | 🔧 Modifikasi `PickupScheduleScreen` | Listen stream dari `ProductionNotificationService` |
| Deduplication dengan `eventId`/`orderId` | 🆕 Buat baru | In-memory set atau Hive untuk cegah notif ganda |

---

## 2. Keputusan Teknis

### 2.1 Event Name dan Channel

| Context | Channel/Event | Keterangan |
|---------|--------------|------------|
| Broadcast ke customer | `private-customer.{customerId}` | Private channel, auth via `channels.php` |
| Broadcast event customer | `customer.order.accepted` | Nama event di channel customer |
| Broadcast ke kurir | `private-outlet.{outletId}` | Channel yang sudah ada untuk outlet |
| Broadcast event kurir | `courier.new-pickup` | Nama event baru di channel outlet |
| FCM type customer | `customer_order_accepted` | Field `type` di payload FCM |
| FCM type kurir | `courier_new_pickup` | Field `type` di payload FCM |

> **Rationale channel kurir**: Menggunakan channel outlet yang sudah ada (`private-outlet.{outletId}`) agar tidak perlu membuat channel baru dan authorization baru. Kurir yang subscribe ke outlet tersebut akan menerima event. Permission filtering dilakukan di app (kurir hanya proses event jika punya `courier.view`/`courier.manage`).

### 2.2 Payload Notifikasi

**Payload Customer (`customer_order_accepted`):**

```json
{
  "type": "customer_order_accepted",
  "eventId": "accept-{orderId}-{timestamp}",
  "orderId": "123",
  "orderNumber": "WW-2026-001",
  "outletId": "5",
  "outletName": "Outlet Pusat",
  "status": "accepted",
  "pickupSchedule": "2026-06-13T09:00:00+07:00",
  "formattedPickupSchedule": "Sabtu, 13 Juni 2026 pukul 09.00",
  "createdAt": "2026-06-12T20:00:00+07:00"
}
```

**Payload Kurir (`courier_new_pickup`):**

```json
{
  "type": "courier_new_pickup",
  "eventId": "pickup-{orderId}-{timestamp}",
  "orderId": "123",
  "orderNumber": "WW-2026-001",
  "outletId": "5",
  "outletName": "Outlet Pusat",
  "customerName": "Budi Santoso",
  "pickupAddress": "Jl. Merdeka No. 1, Jakarta",
  "pickupSchedule": "2026-06-13T09:00:00+07:00",
  "formattedPickupSchedule": "Sabtu, 13 Juni 2026 pukul 09.00",
  "status": "accepted",
  "createdAt": "2026-06-12T20:00:00+07:00"
}
```

> **Catatan**: `eventId` harus stabil (tidak berubah saat retry) untuk satu kejadian accept yang sama. Gunakan format `accept-{orderId}` atau `pickup-{orderId}` saja (tanpa timestamp) agar deduplikasi lebih andal.

### 2.3 Targeting Kurir

Query targeting kurir harus menggunakan logika berikut (bukan hanya `employee.outlet_id`):

```sql
SELECT DISTINCT e.id
FROM employees e
JOIN positions p ON p.employee_id = e.id
    AND p.outlet_id = :order_outlet_id
    AND p.is_active = 1
JOIN position_permissions pp ON pp.position_id = p.id
    AND pp.permission IN ('courier.view', 'courier.manage')
    AND pp.is_active = 1
WHERE e.is_active = 1
```

> **Atau** melalui relasi Eloquent yang sudah ada di codebase. Baca model `Employee` dan `Position` terlebih dahulu untuk memahami pola relasi yang dipakai.

### 2.4 Guard Sumber Order

Notifikasi hanya boleh dikirim jika:
1. `order.source = 'customer_app'` (atau field yang setara, baca model Order).
2. `order.delivery_type = 'pickup'` (bukan `self_dropoff`).
3. Transisi status adalah dari `requested` ke `accepted`.
4. Transisi berhasil disimpan (dispatch event setelah commit, gunakan `ShouldDispatchAfterCommit` atau dispatch di dalam event `ShouldBroadcast` dengan queue).

### 2.5 Deduplication

- **Backend**: Jangan kirim notifikasi jika status order sudah `accepted` sebelum `accept()` dipanggil (guard di awal method).
- **App**: Gunakan in-memory `Set<String>` dengan key `eventId` (atau `orderId` sebagai fallback). Window deduplication: 60 detik (konsisten dengan cashier app).

### 2.6 Error Handling

- Kegagalan FCM (token invalid, network error) **tidak boleh** menggagalkan accept order.
- Kirim notifikasi FCM di background job (Queue) agar tidak blocking response.
- Token invalid dapat ditandai inactive/dihapus di `employee_device_tokens` (untuk kurir) dan di `customer_accounts.fcm_token` (untuk customer).

---

## 3. Rencana Implementasi

### Bagian A: Backend

#### A.1 — Event `CustomerOrderAccepted` 🆕

**File**: `app/Events/CustomerOrderAccepted.php`

```php
class CustomerOrderAccepted implements ShouldBroadcast, ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $eventId;

    public function __construct(public Order $order)
    {
        // eventId stabil: tidak berubah jika order yang sama di-accept ulang (retry)
        $this->eventId = 'accept-' . $order->id;
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('customer.' . $this->order->customer_account_id)];
    }

    public function broadcastAs(): string
    {
        return 'customer.order.accepted';
    }

    public function broadcastWith(): array
    {
        return [
            'type'                   => 'customer_order_accepted',
            'eventId'                => $this->eventId,
            'orderId'                => (string) $this->order->id,
            'orderNumber'            => $this->order->order_number,
            'outletId'               => (string) $this->order->outlet_id,
            'outletName'             => $this->order->outlet?->name ?? '',
            'status'                 => $this->order->status,
            'pickupSchedule'         => $this->order->pickup_schedule?->toIso8601String(),
            'formattedPickupSchedule'=> $this->_formatSchedule($this->order->pickup_schedule),
            'createdAt'              => now()->toIso8601String(),
        ];
    }
}
```

> Baca model `Order` untuk nama field yang tepat (`order_number`, `customer_account_id`, `pickup_schedule`, dll).

#### A.2 — Job `SendCourierNewPickupNotification` 🆕

**File**: `app/Jobs/SendCourierNewPickupNotification.php`

Job ini bertanggung jawab untuk:
1. Query semua employee kurir aktif pada outlet order (menggunakan query di seksi 2.3).
2. Broadcast event `courier.new-pickup` ke channel `private-outlet.{outletId}`.
3. Kirim FCM ke semua device token aktif dari employee kurir yang ditemukan.
4. Handle token invalid dengan grace (tandai/hapus, jangan throw).

```php
class SendCourierNewPickupNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Order $order) {}

    public function handle(FcmNotificationService $fcmService): void
    {
        $eventId = 'pickup-' . $this->order->id;
        
        // 1. Broadcast realtime ke channel outlet
        broadcast(new CourierNewPickupBroadcast($this->order, $eventId));
        
        // 2. Query kurir berdasarkan permission pada outlet order
        $courierEmployees = $this->_queryCourierEmployees($this->order->outlet_id);
        
        // 3. Kirim FCM ke device token aktif setiap kurir
        foreach ($courierEmployees as $employee) {
            $fcmService->sendToCourierDevices($employee, $this->order, $eventId);
        }
    }
    
    private function _queryCourierEmployees(int $outletId): Collection
    {
        // Implementasi query RBAC — baca model Position dan PositionPermission
        // Filter: employee aktif, posisi aktif pada outlet_id, permission courier.view/courier.manage aktif
    }
}
```

#### A.3 — Event `CourierNewPickupBroadcast` 🆕

**File**: `app/Events/CourierNewPickupBroadcast.php`

Broadcast event ke channel outlet untuk kurir. Gunakan channel `private-outlet.{outletId}` yang sudah ada.

```php
class CourierNewPickupBroadcast implements ShouldBroadcast
{
    public function broadcastOn(): array
    {
        return [new PrivateChannel('outlet.' . $this->order->outlet_id)];
    }

    public function broadcastAs(): string
    {
        return 'courier.new-pickup';
    }

    public function broadcastWith(): array
    {
        return [
            'type'                    => 'courier_new_pickup',
            'eventId'                 => $this->eventId,
            'orderId'                 => (string) $this->order->id,
            'orderNumber'             => $this->order->order_number,
            'outletId'                => (string) $this->order->outlet_id,
            'outletName'              => $this->order->outlet?->name ?? '',
            'customerName'            => $this->order->customer?->name ?? '',
            'pickupAddress'           => $this->order->pickup_address ?? '',
            'pickupSchedule'          => $this->order->pickup_schedule?->toIso8601String(),
            'formattedPickupSchedule' => $this->_formatSchedule($this->order->pickup_schedule),
            'status'                  => $this->order->status,
            'createdAt'               => now()->toIso8601String(),
        ];
    }
}
```

#### A.4 — Job `SendCustomerOrderAcceptedFcm` 🆕

**File**: `app/Jobs/SendCustomerOrderAcceptedFcm.php`

Job terpisah untuk mengirim FCM ke customer (agar tidak blocking).

```php
class SendCustomerOrderAcceptedFcm implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Order $order) {}

    public function handle(FcmNotificationService $fcmService): void
    {
        $customer = $this->order->customerAccount;
        if (!$customer || empty($customer->fcm_token)) return;
        
        $eventId = 'accept-' . $this->order->id;
        $fcmService->sendOrderAcceptedToCustomer($customer, $this->order, $eventId);
    }
}
```

#### A.5 — Modifikasi `FcmNotificationService.php` 🔧

Tambahkan dua method baru:

1. `sendOrderAcceptedToCustomer(CustomerAccount $customer, Order $order, string $eventId): void`
   - Kirim ke `$customer->fcm_token`.
   - Title: `"Pesanan Anda Diterima"`
   - Body: `"Pesanan Anda sudah diterima. Kurir akan menjemput pada {formattedSchedule}."` (dengan fallback jika jadwal kosong).
   - Data: payload customer (lihat seksi 2.2).
   - Handle token invalid: tandai `$customer->fcm_token = null` atau log warning, jangan throw.

2. `sendToCourierDevices(Employee $employee, Order $order, string $eventId): void`
   - Ambil semua `EmployeeDeviceToken` aktif dari employee.
   - Kirim ke setiap token.
   - Title: `"Pesanan Pickup Baru"`
   - Body: `"Pesanan pickup baru dari {customerName} untuk {formattedSchedule} di {pickupAddress|outletName}."`.
   - Data: payload kurir (lihat seksi 2.2).
   - Handle token invalid: tandai device token inactive/hapus, jangan throw.

#### A.6 — Modifikasi `routes/channels.php` 🔧

Tambahkan authorization untuk channel customer:

```php
Broadcast::channel('customer.{customerId}', function ($user, $customerId) {
    // $user adalah CustomerAccount yang sedang login
    // Sesuaikan dengan guard customer yang dipakai
    return (int) $user->id === (int) $customerId;
});
```

> Baca `channels.php` yang ada dan pola authorization yang digunakan untuk memahami cara auth customer vs employee.

#### A.7 — Modifikasi `OrderService::accept()` (atau controller) 🔧

Setelah order berhasil diubah statusnya ke `accepted`, tambahkan dispatch:

```php
// Guard: hanya untuk customer pickup order
if ($order->source === Order::SOURCE_CUSTOMER_APP && 
    $order->delivery_type === 'pickup' &&
    $previousStatus === 'requested' &&
    $order->customer_account_id !== null) {
    
    // Broadcast realtime + FCM ke customer
    CustomerOrderAccepted::dispatch($order);
    SendCustomerOrderAcceptedFcm::dispatch($order);
    
    // Notifikasi kurir (queued)
    SendCourierNewPickupNotification::dispatch($order);
}
```

> **PENTING**: Baca `OrderService.php` atau controller yang menangani `accept` untuk menemukan titik yang tepat. Pastikan dispatch dilakukan **setelah** commit transaksi database berhasil (gunakan `ShouldDispatchAfterCommit` atau dispatch di luar `DB::transaction()`).

> Baca konstanta `Order::SOURCE_CUSTOMER_APP` dan nama delivery type yang dipakai di model Order.

---

### Bagian B: Customer App (`apps/customer`)

#### B.1 — Tambah Dependency `pubspec.yaml` 🆕

Tambahkan ke `dependencies`:

```yaml
flutter_local_notifications: ^18.0.0  # atau versi terbaru yang kompatibel
```

> Cek versi yang kompatibel dengan `firebase_messaging` yang sudah ada (`^16.0.3`).

#### B.2 — Buat `CustomerNotificationService` 🆕

**File**: `apps/customer/lib/core/services/customer_notification_service.dart`

Singleton service mirip dengan `NotificationService` di cashier app. Tanggung jawab:
1. Initialize `FlutterLocalNotificationsPlugin`.
2. Set background message handler (background FCM).
3. Listen `FirebaseMessaging.onMessage` (foreground FCM).
4. Listen `FirebaseMessaging.onMessageOpenedApp` (tap dari background).
5. Check `FirebaseMessaging.instance.getInitialMessage()` (tap saat app terminated).
6. Emit stream `onOrderAccepted` untuk dipakai widget.
7. Emit stream `onNotificationTap` untuk navigasi.
8. Deduplication dengan `Set<String>` (key: `eventId` atau fallback `orderId`).

```dart
@pragma('vm:entry-point')
Future<void> customerFirebaseMessagingBackgroundHandler(RemoteMessage message) async {
  try {
    await Firebase.initializeApp();
  } catch (_) {}
}

class OrderAcceptedPayload {
  final String type;
  final String eventId;
  final int orderId;
  final String orderNumber;
  final int outletId;
  final String outletName;
  final String? pickupSchedule;
  final String? formattedPickupSchedule;
  final String status;
  final String? createdAt;

  // fromMap factory — toleran terhadap null, camelCase dan snake_case
}

class CustomerNotificationService {
  CustomerNotificationService._();
  static final CustomerNotificationService instance = CustomerNotificationService._();

  final _tapController = StreamController<OrderAcceptedPayload>.broadcast();
  final _shownEventIds = <String>{};

  Stream<OrderAcceptedPayload> get onNotificationTap => _tapController.stream;

  Future<void> initialize() async { ... }
  Future<void> requestPermission() async { ... }
  void dispose() { ... }

  // Internal methods:
  // _initLocalNotifications()
  // _initFirebaseMessaging()
  // _handleForegroundMessage(RemoteMessage)
  // _handleMessageOpenedApp(RemoteMessage)
  // _showLocalNotification(OrderAcceptedPayload)
  // _isDuplicate(String eventId) -> bool
  // _markShown(String eventId)
  // _payloadFromMap(Map) -> OrderAcceptedPayload?
  //   -> filter: hanya proses jika type == 'customer_order_accepted'
}
```

#### B.3 — Modifikasi `main.dart` customer 🔧

1. Registrasi background handler sebelum Firebase.initializeApp:
   ```dart
   FirebaseMessaging.onBackgroundMessage(customerFirebaseMessagingBackgroundHandler);
   ```
2. Initialize `CustomerNotificationService`:
   ```dart
   await CustomerNotificationService.instance.initialize();
   ```
3. Buat `CustomerPushNotificationCoordinator` atau tambahkan `GlobalKey<NavigatorState>` untuk navigasi dari notifikasi.

#### B.4 — Buat `CustomerPushNotificationCoordinator` 🆕

**File**: `apps/customer/lib/core/navigation/customer_push_notification_coordinator.dart`

Mirip dengan `PushNotificationCoordinator` di cashier app. Tanggung jawab:
1. Simpan `GlobalKey<NavigatorState>`.
2. Saat `CustomerAuthCubit` emit `CustomerAuthAuthenticated`, tandai siap navigasi.
3. Saat `CustomerNotificationService.onNotificationTap` emit payload, navigasi ke `ShowOrderScreen`.
4. Handle pending push jika tap terjadi sebelum auth siap.

```dart
class CustomerPushNotificationCoordinator {
  CustomerPushNotificationCoordinator._();
  static final instance = CustomerPushNotificationCoordinator._();

  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
  OrderAcceptedPayload? _pendingPayload;
  bool _isAuthenticated = false;

  void initialize() {
    CustomerNotificationService.instance.onNotificationTap.listen(_handleTap);
  }

  void onAuthReady() {
    _isAuthenticated = true;
    _flushPending();
  }

  void onLogout() {
    _isAuthenticated = false;
  }

  void _handleTap(OrderAcceptedPayload payload) {
    _pendingPayload = payload;
    _flushPending();
  }

  void _flushPending() {
    if (!_isAuthenticated || _pendingPayload == null) return;
    final payload = _pendingPayload!;
    _pendingPayload = null;
    _navigateToOrder(payload.orderId);
  }

  void _navigateToOrder(int orderId) {
    final context = navigatorKey.currentContext;
    if (context == null) return;
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ShowOrderScreen(orderId: orderId),
      ),
    );
  }
}
```

#### B.5 — Integrasi dengan `CustomerAuthCubit` 🔧

Di `customer_auth_cubit.dart`, panggil `CustomerPushNotificationCoordinator.instance.onAuthReady()` saat state `CustomerAuthAuthenticated` emit, dan `onLogout()` saat `CustomerAuthUnauthenticated`.

> Atau lakukan di `BlocListener` di `main.dart`/`MainApp` agar tidak tightly couple ke cubit.

#### B.6 — Sambungkan `navigatorKey` ke `MaterialApp.router` 🔧

Di `main.dart` customer:
```dart
MaterialApp.router(
  // ...
  // Tambahkan:
  // Jika menggunakan navigatorKey, sesuaikan dengan AppRouter
  // Baca AppRouter customer untuk memahami cara menambahkan navigatorKey
)
```

> Baca `app_router.dart` customer untuk memahami cara mengintegrasikan `navigatorKey` dengan `go_router`. Pada `go_router`, biasanya menggunakan `navigatorKey` di constructor `GoRouter`.

---

### Bagian C: Production App (`apps/production`)

#### C.1 — Tambah Dependency `pubspec.yaml` 🆕

Tambahkan ke `dependencies`:

```yaml
firebase_core: ^4.2.0
firebase_messaging: ^16.0.3
flutter_local_notifications: ^18.0.0
audioplayers: ^6.0.0
pusher_channels_flutter: ^2.0.0
```

> Cek versi terbaru yang kompatibel satu sama lain. Sesuaikan dengan versi yang dipakai cashier app untuk konsistensi.

#### C.2 — Setup Firebase untuk Production App 🆕

1. Tambahkan `google-services.json` untuk Android production app di `apps/production/android/app/`.
2. Tambahkan konfigurasi `FirebaseOptions` atau gunakan `DefaultFirebaseOptions` jika menggunakan FlutterFire CLI.

> Tanyakan kepada tim apakah production app menggunakan Firebase project yang sama dengan cashier app atau terpisah.

#### C.3 — Buat `ProductionNotificationService` 🆕

**File**: `apps/production/lib/core/services/production_notification_service.dart`

Singleton service untuk production/kurir app. Mirip dengan `NotificationService` cashier tapi dengan perbedaan:
1. Payload type: `courier_new_pickup` (bukan `cashier_new_order`).
2. Permission guard: hanya proses jika user punya `courier.view` atau `courier.manage` pada `outletId` dari payload.
3. Channel Pusher: `private-outlet.{outletId}` (sama dengan cashier) — subscribe ke semua outlet yang accessible.
4. Stream `onNewPickup` untuk trigger refresh list.

```dart
@pragma('vm:entry-point')
Future<void> productionFirebaseMessagingBackgroundHandler(RemoteMessage message) async {
  try {
    await Firebase.initializeApp();
  } catch (_) {}
}

class NewPickupPayload {
  final String type;
  final String eventId;
  final int orderId;
  final String orderNumber;
  final int outletId;
  final String outletName;
  final String customerName;
  final String? pickupAddress;
  final String? pickupSchedule;
  final String? formattedPickupSchedule;
  final String status;
  final String? createdAt;

  // fromMap factory — toleran terhadap null, camelCase dan snake_case
  // Static helper _int() dan _string() seperti di cashier app
}

class ProductionNotificationService {
  ProductionNotificationService._();
  static final ProductionNotificationService instance = ProductionNotificationService._();

  static const _pusherAppKey = String.fromEnvironment('PUSHER_APP_KEY');
  static const _pusherCluster = String.fromEnvironment('PUSHER_CLUSTER', defaultValue: 'mt1');
  static const _broadcastingAuthUrl = String.fromEnvironment('BROADCASTING_AUTH_URL');
  static const _deduplicationWindow = Duration(seconds: 60);

  final _localNotifications = FlutterLocalNotificationsPlugin();
  final _audioPlayer = AudioPlayer();
  final _newPickupController = StreamController<NewPickupPayload>.broadcast();
  final _tapController = StreamController<NewPickupPayload>.broadcast();
  final _shownEventIds = <String, DateTime>{};

  // Permission checker — disuntikkan dari luar atau dibaca dari Employee state
  // Berisi list outletId yang user punya courier permission
  Set<int> _courierOutletIds = {};

  Stream<NewPickupPayload> get onNewPickup => _newPickupController.stream;
  Stream<NewPickupPayload> get onNotificationTap => _tapController.stream;

  /// Harus dipanggil setelah login berhasil, dengan outlet IDs yang user punya akses kurir
  void setCourierOutletIds(Set<int> outletIds) {
    _courierOutletIds = outletIds;
  }

  Future<void> initialize({required Dio dio, required ApiEndpoints endpoints}) async { ... }
  Future<void> connectPusher({required List<int> outletIds}) async { ... }
  Future<void> disconnectPusher() async { ... }
  Future<void> dispose() async { ... }

  // Internal methods:
  // _initLocalNotifications()
  // _initFirebaseMessaging()
  // _handleForegroundMessage(RemoteMessage)
  // _handlePusherEvent(dynamic rawData, int outletId)
  // _publishNewPickup(NewPickupPayload)
  // _hasPermissionForOutlet(int outletId) -> bool
  //   -> cek apakah outletId ada di _courierOutletIds
  // _showLocalNotification(NewPickupPayload)
  // _playNotificationSound()
  // _isDuplicate(String eventId) -> bool
  // _markShown(String eventId)
  // _payloadFromMap(Map) -> NewPickupPayload?
  //   -> filter: hanya proses jika type == 'courier_new_pickup'
  //   -> filter: hanya proses jika _hasPermissionForOutlet(outletId)
}
```

**Catatan penting untuk sound**: Tambahkan file sound di `apps/production/assets/sounds/notification.mp3`. Tambahkan entry di `pubspec.yaml` flutter assets.

#### C.4 — Buat FCM Token Datasource untuk Production 🆕

**File**: `apps/production/lib/features/auth/data/datasources/fcm_token_datasource.dart`

Salin dan adaptasi dari cashier app (`apps/cashier/lib/features/auth/data/datasources/fcm_token_datasource.dart`).

```dart
abstract class FcmTokenDatasource {
  Future<void> registerToken({
    required String token,
    String? deviceId,
    String? deviceName,
  });

  Future<void> removeToken(String token);
}

class FcmTokenDatasourceImpl implements FcmTokenDatasource {
  // Gunakan _endpoints.updateFcmToken
  // Baca ApiEndpoints untuk memastikan endpoint production ada
}
```

> Periksa `ApiEndpoints.production()` di package `wash_wallet_core` untuk memastikan endpoint `updateFcmToken` tersedia. Jika belum ada, tambahkan.

#### C.5 — Modifikasi `AuthCubit` Production 🔧

**File**: `apps/production/lib/features/auth/presentation/bloc/auth_cubit.dart`

Tambahkan integrasi FCM mirip dengan cashier app `AuthCubit`:

1. Inject `FcmTokenDatasource` ke constructor.
2. Setelah login berhasil: ambil token FCM, kirim ke backend, connect Pusher untuk outlet kurir.
3. Setelah logout: hapus token FCM dari backend, disconnect Pusher.
4. Saat `checkAuthStatus` berhasil: ulangi langkah login (token + Pusher).
5. Tentukan `courierOutletIds` dari `Employee` yang login → set ke `ProductionNotificationService`.

```dart
class AuthCubit extends Cubit<AuthState> {
  // Tambahkan:
  final FcmTokenDatasource? _fcmTokenDatasource;

  Future<void> login({...}) async {
    // ... existing logic ...
    result.when(
      success: (employee) {
        emit(Authenticated(employee));
        _onAuthenticated(employee);  // NEW
      },
      ...
    );
  }

  Future<void> _onAuthenticated(Employee employee) async {
    // 1. Kirim FCM token ke backend
    try {
      final token = await ProductionNotificationService.instance.getFcmToken();
      if (token != null) {
        await _fcmTokenDatasource?.registerToken(token: token);
      }
    } catch (_) {}

    // 2. Set outlet IDs yang punya courier permission ke NotificationService
    final courierOutletIds = employee.positions
        .where((p) => p.isActive && p.hasCourierPermission)
        .map((p) => p.outletId)
        .toSet();
    ProductionNotificationService.instance.setCourierOutletIds(courierOutletIds);

    // 3. Connect Pusher untuk outlet-outlet tersebut
    await ProductionNotificationService.instance
        .connectPusher(outletIds: courierOutletIds.toList());
  }

  Future<void> logout() async {
    // Tambahkan:
    // _fcmTokenDatasource?.removeToken(token);
    // ProductionNotificationService.instance.disconnectPusher();
    // ...existing logout logic...
  }
}
```

> **Penting**: Baca model `Employee`, `Position`, dan mekanisme permission yang ada (`accessibleOutletIds`) untuk memahami cara mendapatkan outlet IDs yang punya courier permission. Lihat `PickupScheduleScreen` yang sudah menggunakan `authState.employee.accessibleOutlets`.

#### C.6 — Modifikasi `main.dart` Production 🔧

1. Tambahkan Firebase import dan init:
   ```dart
   import 'package:firebase_core/firebase_core.dart';
   import 'package:firebase_messaging/firebase_messaging.dart';
   import 'core/services/production_notification_service.dart';
   
   // Di main():
   await Firebase.initializeApp();
   FirebaseMessaging.onBackgroundMessage(productionFirebaseMessagingBackgroundHandler);
   ```
2. Initialize `ProductionNotificationService`:
   ```dart
   await ProductionNotificationService.instance.initialize(dio: dio, endpoints: endpoints);
   ```
3. Buat `ProductionPushNotificationCoordinator` dan integrasikan dengan router.

#### C.7 — Buat `ProductionPushNotificationCoordinator` 🆕

**File**: `apps/production/lib/core/navigation/production_push_notification_coordinator.dart`

Mirip dengan cashier app. Saat user tap notifikasi kurir, navigasi ke `PickupScheduleScreen` atau `PickupOrderDetailScreen`.

```dart
class ProductionPushNotificationCoordinator {
  static final instance = ProductionPushNotificationCoordinator._();
  ProductionPushNotificationCoordinator._();

  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
  NewPickupPayload? _pendingPayload;
  bool _isAuthenticated = false;

  void initialize() {
    ProductionNotificationService.instance.onNotificationTap.listen(_handleTap);
  }

  void onAuthReady() { ... }
  void onLogout() { ... }

  void _navigateToPickup(NewPickupPayload payload) {
    // Navigasi ke PickupScheduleScreen
    // Atau ke PickupOrderDetailScreen jika orderId tersedia
  }
}
```

#### C.8 — Modifikasi `PickupScheduleScreen` 🔧

**File**: `apps/production/lib/features/order/presentation/screens/pickup_schedule_screen.dart`

Tambahkan listener untuk `ProductionNotificationService.instance.onNewPickup` agar list pickup ter-refresh otomatis saat notifikasi baru masuk.

```dart
class _PickupScheduleScreenState extends State<PickupScheduleScreen> ... {
  StreamSubscription<NewPickupPayload>? _newPickupSubscription;

  @override
  void initState() {
    super.initState();
    // ...existing init...
    
    // Subscribe ke new pickup stream
    _newPickupSubscription = ProductionNotificationService.instance.onNewPickup
        .listen((_) => _loadData());
  }

  @override
  void dispose() {
    _newPickupSubscription?.cancel();
    super.dispose();
  }
}
```

#### C.9 — Integrasi BlocListener di `main.dart` atau `MainApp` 🔧

Di `MainApp.build()`, tambahkan `BlocListener<AuthCubit, AuthState>` untuk:
- Saat `Authenticated`: panggil `ProductionPushNotificationCoordinator.instance.onAuthReady()`.
- Saat `Unauthenticated`: panggil `ProductionPushNotificationCoordinator.instance.onLogout()`.

---

## 4. Urutan Pengerjaan yang Disarankan

Urutan ini memastikan setiap langkah dapat ditest secara independen:

1. **Backend A.1-A.4**: Buat semua event dan job backend.
2. **Backend A.5**: Modifikasi `FcmNotificationService`.
3. **Backend A.6**: Tambahkan channel authorization di `channels.php`.
4. **Backend A.7**: Modifikasi `OrderService::accept()` dengan guard yang benar.
5. **Customer App B.1-B.6**: Implementasi notifikasi customer dari FCM.
6. **Production App C.1-C.2**: Setup Firebase untuk production.
7. **Production App C.3-C.9**: Implementasi service, auth integration, dan UI refresh.

---

## 5. Hal yang Harus Diverifikasi Sebelum Memulai

Sebelum menulis kode apapun, baca file-file berikut di repo aktual untuk memastikan asumsi plan ini benar:

1. **`webapp/wash_wallet_be/app/Models/Order.php`**: Nama field `source`, `delivery_type`, `customer_account_id`, `pickup_schedule`, konstanta status.
2. **`webapp/wash_wallet_be/app/Models/Employee.php`**: Relasi `positions`, `deviceTokens`, cara mengakses permission kurir.
3. **`webapp/wash_wallet_be/app/Models/Position.php`**: Relasi permission, field `outlet_id`, `is_active`.
4. **`webapp/wash_wallet_be/app/Services/OrderService.php`**: Method `accept()`, pattern transaksi DB, titik dispatch event.
5. **`webapp/wash_wallet_be/app/Services/FcmNotificationService.php`**: Method yang sudah ada, signature, pola error handling.
6. **`webapp/wash_wallet_be/routes/channels.php`**: Authorization yang sudah ada.
7. **`packages/wash_wallet_core/lib/src/api/api_endpoints.dart`**: Endpoint yang tersedia untuk production app.
8. **`apps/production/lib/features/auth/presentation/providers/auth_provider.dart`**: Pattern factory provider untuk menambahkan dependency baru.
9. **`apps/cashier/lib/core/services/notification_service.dart`**: Referensi implementasi untuk production notification service (sudah pernah dikerjakan).
10. **`apps/customer/lib/core/router/app_router.dart`**: Cara mengintegrasikan `navigatorKey` dengan go_router.

---

## 6. Acceptance Criteria Teknis

### Backend

- [ ] `POST /orders/{id}/accept` — ketika dipanggil untuk customer pickup order dengan status `requested`, menghasilkan:
  - Broadcast event ke `private-customer.{customerId}` dengan nama `customer.order.accepted`.
  - Broadcast event ke `private-outlet.{outletId}` dengan nama `courier.new-pickup`.
  - FCM terkirim ke token customer.
  - FCM terkirim ke device token aktif employee yang punya `courier.view`/`courier.manage` pada outlet order.
- [ ] Accept order untuk self-dropoff, order internal cashier, atau order sudah `accepted` **tidak** memicu notifikasi.
- [ ] Kegagalan FCM tidak menggagalkan response accept order.
- [ ] Token FCM invalid ditangani tanpa throw ke caller.
- [ ] Targeting kurir menggunakan `positions.outlet_id` (multi-outlet), bukan hanya `employee.outlet_id`.

### Customer App

- [ ] Customer menerima push notification setelah cashier accept order pickup-nya.
- [ ] Tap notifikasi membuka `ShowOrderScreen` dengan `orderId` yang benar.
- [ ] Foreground notification tampil sebagai local notification.
- [ ] Realtime event (jika customer app diextend ke Reverb) dan FCM untuk event yang sama tidak menghasilkan 2 notifikasi.

### Production App

- [ ] Employee kurir dengan `courier.view`/`courier.manage` pada outlet order menerima push notification setelah cashier accept.
- [ ] Employee tanpa permission kurir pada outlet order **tidak** menerima atau **tidak menampilkan** notifikasi.
- [ ] Tap notifikasi membuka `PickupScheduleScreen` atau order detail yang benar.
- [ ] List pickup di `PickupScheduleScreen` ter-refresh otomatis saat notifikasi baru diterima saat screen aktif.
- [ ] Deduplication: satu kejadian accept tidak menampilkan dua notifikasi di app yang sama.

---

## 7. Catatan Tambahan untuk Implementor

1. **Production app tidak ada NotificationService sebelumnya**: Berbeda dengan cashier app yang sudah punya `NotificationService`, production app harus dibuat dari awal. Gunakan `NotificationService` cashier sebagai referensi implementasi.

2. **Multi-outlet Pusher di production**: Cashier app subscribe ke satu channel `private-outlet.{outletId}`. Production app perlu subscribe ke beberapa channel jika kurir punya akses ke beberapa outlet. Loop subscribe ke semua `courierOutletIds`.

3. **Permission guard di app**: Karena broadcast channel outlet (`private-outlet.{outletId}`) bisa diterima oleh semua employee yang subscribe (tidak hanya kurir), **app harus melakukan guard** sebelum menampilkan notifikasi. Cek `_courierOutletIds` sebelum publish ke stream.

4. **Customer app Reverb**: User need menyebut kemungkinan realtime event untuk customer. Dalam plan ini, realtime untuk customer hanya via broadcast `private-customer.{customerId}`. Jika customer app ingin connect ke Reverb, perlu menambahkan Pusher dependency dan subscribe ke channel. Untuk MVP, FCM sudah cukup.

5. **Sound file**: Production app perlu file `assets/sounds/notification.mp3`. Salin dari cashier app atau buat baru.

6. **Android notification channel**: Buat Android notification channel ID yang berbeda dari cashier: `production_new_pickup` agar tidak konflik jika kedua app diinstall di device yang sama.

7. **`eventId` sebagai dedupe key**: Gunakan `eventId` sebagai primary dedupe key. Fallback ke `orderId` jika `eventId` tidak tersedia. Window dedupe: 60 detik (konsisten dengan cashier).

---

## Status

Plan siap untuk diimplementasikan. Implementor harus membaca file-file yang disebutkan di Seksi 5 sebelum mulai menulis kode.
