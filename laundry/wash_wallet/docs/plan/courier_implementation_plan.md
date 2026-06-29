# Fitur Pickup Schedule — Produksi/Kurir (Cashier App)

## Latar Belakang

Setelah kasir menerima (accept) pesanan dari pelanggan, bagian produksi/kurir perlu menjemput barang cucian. Pesanan yang statusnya `accepted` memiliki field `pickupSchedule` (datetime jadwal penjemputan yang dipilih pelanggan). Fitur ini menampilkan jadwal penjemputan dalam bentuk kalender 7 hari ke depan, dikelompokkan berdasarkan time slot, sehingga kurir bisa melihat pesanan mana yang harus dijemput, kapan, dan tombol **"Ambil Sekarang"** + konfirmasi foto bukti pengambilan.

---

## Keputusan Desain (Final)

| Aspek | Keputusan |
|---|---|
| Entry point | **Bottom Navbar** tab ke-3, nama **"Kurir"** (icon: `local_shipping`) |
| Navbar final | Home / Keuangan / **Kurir** / Transaksi / Setting |
| Screen utama | `PickupScheduleScreen` — screen terpisah dedicated |
| Range tanggal | **7 hari ke depan** (hari ini + 6) |
| Grouping | **Group by time slot** (jam `pickupSchedule`) |
| Filter API | **Reuse `GET /orders`** + tambah query param `pickupScheduleFrom` & `pickupScheduleTo` + `status=accepted` |
| Status baru | **`picking_up`** (kurir sedang menjemput) |
| Pencatatan | `employee_id` = kurir yang menekan "Ambil Sekarang" |
| Bukti pengambilan | **Foto** — dikirim via `POST /orders/{id}/confirm-pickup` setelah kurir tiba |
| Setelah foto dikirim | Status berubah → (next logical status, e.g. `accepted` tetap / ke `weighing`) |

---

## Alur Lengkap

```
[HomeScreen] Bottom Navbar Tab "Kurir"
       │
       ▼
[PickupScheduleScreen]
  ┌────────────────────────────────────────────┐
  │  Date Picker (Horizontal, 7 hari)          │
  │  [Hari Ini] [Besok] [Lusa] ...             │
  └────────────────────────────────────────────┘
  ┌────────────────────────────────────────────┐
  │  Group: "09:00 - 11:00"                    │
  │  ┌──────────────────────────────────────┐  │
  │  │ #ORD-123 │ Budi Santoso             │  │
  │  │ 📍 Jl. Merdeka No.5, Jakarta        │  │
  │  │ 3 item   │ [Ambil Sekarang 🚚]      │  │
  │  └──────────────────────────────────────┘  │
  │                                            │
  │  Group: "13:00 - 15:00"                    │
  │  ┌──────────────────────────────────────┐  │
  │  │ #ORD-456 │ Siti Rahayu              │  │
  │  │ 📍 Jl. Sudirman No.12               │  │
  │  │ 2 item   │ [Ambil Sekarang 🚚]      │  │
  │  └──────────────────────────────────────┘  │
  └────────────────────────────────────────────┘
       │
       ▼ tap "Ambil Sekarang"
  ┌────────────────────────────────────────────┐
  │  Konfirmasi Dialog                         │
  │  "Mulai penjemputan pesanan #ORD-123?"     │
  │  [Batal]  [Ambil Sekarang]                 │
  └────────────────────────────────────────────┘
       │ konfirmasi
       ▼
  API: POST /orders/{id}/pickup
  → status: picking_up  |  employee_id: kurir
  → Order hilang dari list (bukan 'accepted' lagi)
  → Snackbar sukses + refresh list
       │
       ▼ (kapan saja, kurir sudah tiba)
  [PickupScheduleScreen] — filter "Dalam Perjalanan"
  Tab / chip: [Akan Dijemput] [Dalam Perjalanan]
       │
       ▼ tap card "picking_up" → tap "Konfirmasi Pengambilan"
  ┌────────────────────────────────────────────┐
  │  PickupConfirmationScreen                  │
  │  - Preview info order                      │
  │  - Kamera / Gallery picker untuk FOTO      │
  │  - Tombol "Kirim Konfirmasi"               │
  └────────────────────────────────────────────┘
       │
       ▼
  API: POST /orders/{id}/confirm-pickup (multipart/form-data)
  Body: { photo: File }
  → Status tetap picking_up / berubah ke next status (TBD)
  → Foto tersimpan di server
```

---

## Proposed Changes

### Layer 0 — Backend (Laravel)

#### [MODIFY] [Order.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Models/Order.php)
Tambahkan:
```php
const STATUS_PICKING_UP = 'picking_up';
// di getStatusLabel():
'picking_up' => 'Dalam Perjalanan',
// scope baru:
public function scopePickupScheduleFrom(Builder $query, Carbon $date): Builder
{
    return $query->where('pickup_schedule', '>=', $date);
}
public function scopePickupScheduleTo(Builder $query, Carbon $date): Builder
{
    return $query->where('pickup_schedule', '<=', $date);
}
```

#### [MODIFY] [OrderService.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Services/OrderService.php)
Tambahkan method:
```php
// Ambil pesanan (accepted → picking_up)
public function pickup(int $orderId, int $employeeId): Order

// Konfirmasi pengambilan dengan foto
public function confirmPickup(int $orderId, UploadedFile $photo): Order
```
Tambahkan di `applyFilters()`:
```php
if (!empty($filters['pickupScheduleFrom'])) {
    $query->pickupScheduleFrom(Carbon::parse($filters['pickupScheduleFrom']));
}
if (!empty($filters['pickupScheduleTo'])) {
    $query->pickupScheduleTo(Carbon::parse($filters['pickupScheduleTo']));
}
```

#### [NEW] [ConfirmPickupRequest.php]
Validasi request foto (file, image, max 5MB).

#### [MODIFY] [OrderController.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Controllers/Api/OrderController.php)
```php
public function pickup(Request $request, int $id): JsonResponse
public function confirmPickup(Request $request, int $id): JsonResponse
```
Tambahkan `pickupScheduleFrom` / `pickupScheduleTo` di `getFiltersFromRequest()`.

#### [MODIFY] [api_mobile_cashier.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/routes/api_mobile_cashier.php)
```php
Route::post('/{id}/pickup', 'pickup')->name('pickup');
Route::post('/{id}/confirm-pickup', 'confirmPickup')->name('confirm-pickup');
```

---

### Layer 1 — Domain (Flutter)

#### [MODIFY] [order_repository.dart](file:///c:/Bimo/Project/wash_wallet/apps/cashier/lib/features/order/domain/repositories/order_repository.dart)
```dart
Future<Result<Order>> pickup(int id);
Future<Result<Order>> confirmPickup(int id, String photoPath);
```

#### [NEW] pickup_usecase.dart
```dart
class PickupUsecase {
  final OrderRepository _repository;
  PickupUsecase(this._repository);
  Future<Result<Order>> call(int orderId) => _repository.pickup(orderId);
}
```

#### [NEW] confirm_pickup_usecase.dart
```dart
class ConfirmPickupUsecase {
  final OrderRepository _repository;
  ConfirmPickupUsecase(this._repository);
  Future<Result<Order>> call(int orderId, String photoPath) =>
      _repository.confirmPickup(orderId, photoPath);
}
```

---

### Layer 2 — Data (Flutter)

#### [MODIFY] [order_remote_datasource.dart](file:///c:/Bimo/Project/wash_wallet/apps/cashier/lib/features/order/data/datasources/order_remote_datasource.dart)
- `pickup(int id)`: `POST .../orders/$id/pickup`
- `confirmPickup(int id, String photoPath)`: `POST .../orders/$id/confirm-pickup` (multipart/form-data)
- Tambah `pickupScheduleFrom`/`pickupScheduleTo` di method `getAll()`

#### [MODIFY] [order_repository_impl.dart](file:///c:/Bimo/Project/wash_wallet/apps/cashier/lib/features/order/data/repositories/order_repository_impl.dart)
Override method `pickup()` dan `confirmPickup()`.

---

### Layer 3 — Presentation (Flutter)

#### [MODIFY] [order_cubit.dart](file:///c:/Bimo/Project/wash_wallet/apps/cashier/lib/features/order/presentation/bloc/order_cubit.dart)
```dart
Future<void> pickup(int orderId) async { ... }
Future<void> confirmPickup(int orderId, String photoPath) async { ... }
Future<void> getPickupSchedule({
  required int outletId,
  required DateTime date,
}) async {
  // filter: status=accepted, pickupSchedule.from=date 00:00, pickupSchedule.to=date 23:59
}
```

#### [MODIFY] [order_state.dart](file:///c:/Bimo/Project/wash_wallet/apps/cashier/lib/features/order/presentation/bloc/order_state.dart)
```dart
class PickupScheduleLoaded extends OrderState {
  final List<Order> scheduledOrders;    // status=accepted, hari terpilih
  final List<Order> inProgressOrders;  // status=picking_up
  final DateTime selectedDate;
}
```

#### [MODIFY] [order_provider.dart](file:///c:/Bimo/Project/wash_wallet/apps/cashier/lib/features/order/presentation/providers/order_provider.dart)
Register `PickupUsecase` dan `ConfirmPickupUsecase`.

#### [MODIFY] [home_screen.dart](file:///c:/Bimo/Project/wash_wallet/apps/cashier/lib/features/home/presentation/screens/home_screen.dart)
Ubah bottom navbar dari 4 item menjadi 5:
```dart
// Urutan: Home | Keuangan | Kurir | Transaksi | Setting
//          0       1         2        3           4
AppBottomBarItem(icon: Icons.local_shipping_outlined, activeIcon: Icons.local_shipping, label: 'Kurir'),
```
Tambahkan handler `case 2: _handleCourier(context)` di `_handleBottomNavTap`.

#### [MODIFY] [app_router.dart](file:///c:/Bimo/Project/wash_wallet/apps/cashier/lib/core/router/app_router.dart)
Tambahkan route `/pickup-schedule`.

#### [NEW] pickup_schedule_screen.dart
```
apps/cashier/lib/features/order/presentation/screens/pickup_schedule_screen.dart
```
Komponen:
- `PickupDateSelector` — horizontal scroll date chips (7 hari)
- Toggle tab: **"Akan Dijemput"** (accepted) / **"Dalam Perjalanan"** (picking_up)
- `ListView` grouped by time slot
- Pull-to-refresh
- Empty state per tab

#### [NEW] pickup_confirmation_screen.dart
```
apps/cashier/lib/features/order/presentation/screens/pickup_confirmation_screen.dart
```
Komponen:
- Info ringkasan order (nomor, nama pelanggan, alamat)
- Image picker (kamera / galeri)
- Preview foto sebelum dikirim
- Tombol "Kirim Konfirmasi"

#### [NEW] pickup_order_card.dart
```
apps/cashier/lib/features/order/presentation/widgets/pickup/pickup_order_card.dart
```
- Nomor pesanan & nama pelanggan
- Alamat pickup
- Jumlah & nama item
- Badge jadwal (jam)
- Tombol **"Ambil Sekarang"** (untuk status `accepted`)
- Tombol **"Konfirmasi Pengambilan"** (untuk status `picking_up`)

#### [NEW] pickup_date_selector.dart
```
apps/cashier/lib/features/order/presentation/widgets/pickup/pickup_date_selector.dart
```
- Horizontal scroll container
- 7 chip: nama hari singkat + tanggal
- Highlight aktif dengan warna primary

---

## Status Flow Visual (Updated)

```
requested
   │
   ├── accept() ──────────► accepted  ◄─── [Pickup Schedule tab "Akan Dijemput"]
   │                           │
   │                        pickup() ──► picking_up  ◄─── [Pickup Schedule tab "Dalam Perjalanan"]
   │                                        │
   │                              confirmPickup() ──► (foto tersimpan, status lanjut)
   │                                        │
   │                                     weigh() ──► priced ──► pending ──► ...
   │
   └── reject() ──► cancelled
```

---

## Verification Plan

### Backend
1. `GET /orders?status=accepted&pickupScheduleFrom=2026-05-01 00:00:00&pickupScheduleTo=2026-05-01 23:59:59` → hanya order accepted hari itu
2. `POST /orders/{id}/pickup` → status jadi `picking_up`, `employee_id` tercatat
3. `POST /orders/{id}/confirm-pickup` (multipart foto) → foto tersimpan

### Flutter (Manual)
1. Login → Bottom navbar tab **"Kurir"** → masuk `PickupScheduleScreen`
2. Pilih tanggal → list muncul sesuai jadwal
3. Tab "Akan Dijemput" tampil order `accepted`, tab "Dalam Perjalanan" tampil `picking_up`
4. Tap "Ambil Sekarang" → dialog → konfirmasi → order pindah ke tab "Dalam Perjalanan"
5. Tap card "Dalam Perjalanan" → `PickupConfirmationScreen` → ambil foto → kirim → sukses
