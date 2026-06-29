# Implementation Plan: Customer Order untuk Outlet Tanpa Fitur Kurir

## Penting: Panduan untuk AI Model yang Mengerjakan

Sebelum menulis satu baris kode pun, AI model **WAJIB**:

1. **Baca standarisasi spec** — baca semua file spec/standarisasi di `docs/` dan `packages/wash_wallet_ui/` sebelum mulai.
2. **Gunakan reusable components** — selalu pakai `AppCard`, `AppButton`, `AppHeader`, `AppLayout`, `AppLoadingIndicator`, `AppSnackbar`, dan komponen UI yang sudah ada.
3. **Gunakan theme tokens** — warna dari `context.colors.*`, spacing dari `context.space.*`, radius dari `context.radius.*`, typography dari `context.typography.*`. **Jangan hardcode warna apapun.**
4. **Pecah ke widget/partial kecil** — jangan buat satu file yang panjang. Setiap widget yang bisa dipisahkan **harus** diletakkan di folder `widgets/` (Flutter) atau `Partials/` (Blade/PHP).
5. **Tanpa komentar** — kode harus clean code, tidak ada comment apapun.
6. **Review file terkait terlebih dahulu** — lihat file yang akan diubah sebelum mengedit agar tidak merusak fitur yang sudah ada.

---

## Konteks Teknis

### Status Order Saat Ini

Backend `Order.php` memiliki status konstanta:
- `requested`, `accepted`, `rejected`, `picking_up`, `received`, `weighing`, `ready_to_process`, `in_progress`, `ready`, `delivering`, `delivered`, `completed`, `cancelled`

Status **`pending_dropoff`** belum ada — perlu ditambahkan.

### Outlet.isCourierEnabled

Field `isCourierEnabled` sudah ada di:
- Flutter: `Outlet` entity (`packages/wash_wallet_domain/lib/src/entities/outlet.dart`)
- Backend: disupply dari `OutletResource` via `isCourierEnabled`

### CreateOrderParams Saat Ini

`CreateOrderParams` di Flutter masih memiliki field `paymentMethod` sebagai required. Untuk self drop-off, field ini perlu dibuat nullable/opsional.

### StoreCustomerOrderRequest Saat Ini

Validasi backend mensyaratkan `paymentMethod` wajib diisi. Perlu disesuaikan untuk order self drop-off.

---

## Ruang Lingkup

| Area | Termasuk | Tidak Termasuk |
|---|---|---|
| Flutter Customer App | `apps/customer` | Cashier app |
| Laravel Backend | `webapp/wash_wallet_be` | Web dashboard UI |
| Domain Package | `packages/wash_wallet_domain` | — |

---

## Backend Laravel

### Task BE-1: Tambah Status `pending_dropoff` di `Order.php`

**File**: `webapp/wash_wallet_be/app/Models/Order.php`

Tambahkan konstanta baru:

```php
const STATUS_PENDING_DROPOFF = 'pending_dropoff';
```

Update `getStatusLabel()`:

```php
self::STATUS_PENDING_DROPOFF => 'Menunggu Drop-off',
```

Update `getStatusBadgeVariant()`:

```php
self::STATUS_PENDING_DROPOFF => 'warning',
```

Update `canBeCancelled()`: tambahkan `STATUS_PENDING_DROPOFF` ke daftar status yang boleh dibatalkan.

Update `scopeActive()`: pastikan `pending_dropoff` termasuk dalam status aktif (tidak masuk daftar excluded).

---

### Task BE-2: Update Validasi `StoreCustomerOrderRequest.php`

**File**: `webapp/wash_wallet_be/app/Http/Requests/Order/StoreCustomerOrderRequest.php`

Ubah validasi `paymentMethod` dari `required` menjadi `nullable`:

```php
'paymentMethod' => 'nullable|string|in:cod,transfer,wallet_balance',
```

Tambahkan value `self_dropoff` ke allowed `pickupType`:

```php
'pickupType' => 'required|string|in:courier,self_pickup,self_dropoff',
```

---

### Task BE-3: Update `storeCustomer()` di `OrderService.php`

**File**: `webapp/wash_wallet_be/app/Services/OrderService.php`

Dalam method `storeCustomer(array $data)`, setelah resolve `pickupType`:

1. Jika `pickupType === 'self_dropoff'`:
   - Load outlet, cek relasi `courierSetting`. Jika outlet memiliki kurir aktif, throw `InvalidArgumentException`.
   - Set `status` order menjadi `Order::STATUS_PENDING_DROPOFF`.
   - Set `payment_method` menjadi `null`.
   - Set `payment_status` menjadi `Order::PAYMENT_STATUS_NOT_YET_PRICED`.
   - Skip set `pickupAddress`, `pickupSchedule`, `pickupFee`.

2. Jika `pickupType === 'courier'`:
   - Load outlet, cek apakah fitur kurir aktif. Jika tidak aktif, throw exception `"Outlet ini tidak memiliki layanan kurir."`.
   - Flow lama tetap berjalan.

> **Catatan**: Cek apakah kolom `pickup_type` sudah ada di migration. Jika belum, tambahkan di migration atau gunakan kolom yang ada.

---

### Task BE-4: Tambah Validasi Outlet Courier

**File**: `webapp/wash_wallet_be/app/Services/OrderService.php`

Tambahkan private method `validateOutletCourierStatus(int $outletId, string $pickupType)`:
- Load `Outlet` dengan relasi `courierSetting`.
- Jika `pickupType === 'courier'` dan outlet tidak punya kurir aktif → throw exception.
- Jika `pickupType === 'self_dropoff'` dan outlet punya kurir aktif → throw exception.

Panggil method ini di awal `storeCustomer()`.

---

### Task BE-5: Verifikasi `OrderResource.php` untuk `pending_dropoff`

**File**: `webapp/wash_wallet_be/app/Http/Resources/Order/OrderResource.php`

Pastikan `canPay` false untuk order `pending_dropoff`. Tidak perlu perubahan kode jika `Order::canAcceptPayment()` tidak menyertakan `pending_dropoff` di daftar payable statuses — sudah aman secara default.

---

### Task BE-6: Update `accept()` di `OrderService.php`

**File**: `webapp/wash_wallet_be/app/Services/OrderService.php`

Cari method `accept()`. Pastikan order dengan status `pending_dropoff` bisa diterima oleh kasir ketika customer datang. Transisi: `pending_dropoff` → `received`.

> **Keputusan Desain**: `pending_dropoff` → kasir accept → `received` → `weighing` → `ready_to_process`. Cek method `accept()` dan pastikan `pending_dropoff` bisa ditransisi ke `received`.

---

### Task BE-7: Tambah Test Backend

**File**: `webapp/wash_wallet_be/tests/Feature/`

Buat atau update test untuk:
1. Order self drop-off berhasil dibuat dengan status `pending_dropoff`.
2. Order self drop-off tidak punya `paymentMethod`.
3. Backend menolak request courier untuk outlet tanpa kurir.
4. `canPay` false untuk order `pending_dropoff`.

---

## Flutter Customer App

### Task FL-1: Update `CreateOrderParams` — `paymentMethod` Nullable

**File**: `apps/customer/lib/features/order/domain/entities/create_order_params.dart`

Ubah `paymentMethod` dari `required String` menjadi `String? paymentMethod`:
- Update constructor: `this.paymentMethod,` (nullable, tanpa required).
- Update `toJson()`: hanya sertakan `paymentMethod` jika tidak null.
- Update `props`.

Tambahkan `'self_dropoff'` sebagai value valid untuk `pickupType`.

---

### Task FL-2: Update `OrderCubit.createOrder()` — Self Drop-Off Flow

**File**: `apps/customer/lib/features/order/presentation/bloc/order_cubit.dart`

Tambahkan parameter `bool isCourierEnabled` ke method `createOrder()`.

Dalam method `createOrder()`:
1. Jika `!isCourierEnabled`:
   - Skip validasi `selectedAddress`, `selectedDate`, `selectedSchedule`.
   - Set `pickupType: 'self_dropoff'`.
   - Kirim `paymentMethod: null`.
2. Jika `isCourierEnabled`:
   - Flow lama tetap berjalan.

---

### Task FL-4: Buat Widget `self_dropoff_banner_widget.dart`

**File**: `apps/customer/lib/features/order/presentation/widgets/self_dropoff_banner_widget.dart`

Widget menampilkan:
- Judul: **Datang langsung ke outlet**
- Subtitle: **Layanan antar-jemput belum tersedia**
- Icon informatif (`Icons.store_outlined` atau `Icons.directions_walk`)
- Styling dengan `context.colors.warning`
- Menggunakan `AppCard` atau Container dengan border `context.colors`

---

### Task FL-5: Buat Widget `outlet_visit_info_widget.dart`

**File**: `apps/customer/lib/features/order/presentation/widgets/outlet_visit_info_widget.dart`

Widget menerima `Outlet outlet` dan menampilkan:
- Nama outlet
- Alamat (`outlet.fullAddress`) — dengan icon
- Jam operasional hari ini (`outlet.todaySchedule`) — jika null, tampilkan placeholder
- Tombol navigasi/maps ke Google Maps (`outlet.latitude`, `outlet.longitude`) — hanya jika koordinat ada
- Kontak (`outlet.phone`) dengan tap-to-call `tel:` — hanya jika phone ada

Pecah menjadi private sub-widget:
- `_OutletAddressRow`
- `_OutletHoursRow`
- `_OutletContactRow`
- `_OutletMapsButton`

---

### Task FL-6: Update `OrderSummaryScreen` — Self Drop-Off Flow

**File**: `apps/customer/lib/features/order/presentation/screens/order_summary_screen.dart`

Dalam `_buildContent()`, berdasarkan `outlet.isCourierEnabled`:

**Jika `!outlet.isCourierEnabled`**:
- Tampilkan `SelfDropoffBannerWidget()`.
- Tampilkan `OutletVisitInfoWidget(outlet: outlet)`.
- **Sembunyikan** section "Metode Pengambilan Baju Kotor", "Metode Pengantaran Baju Bersih", dan "Metode Pembayaran".
- Tetap tampilkan "Layanan Terpilih" dan "Catatan (Opsional)".

**Jika `outlet.isCourierEnabled`**:
- Flow lama tetap ditampilkan.

Update `BlocListener<OutletCubit>` — untuk outlet tanpa kurir, jangan paksa `setPickupType('self_pickup')`. Biarkan `createOrder()` yang handle.

---

### Task FL-7: Update `OrderBottomActionWidget` — Label Beda untuk Self Drop-Off

**File**: `apps/customer/lib/features/order/presentation/widgets/order_bottom_action_widget.dart`

Baca `outlet.isCourierEnabled` dari `OutletCubit`. Ubah label tombol:
- Courier disabled: `'Buat Order - Datang ke Outlet'`
- Courier enabled: `'Buat Order'` (sama)

Panggil `orderCubit.createOrder(isCourierEnabled: false)` jika courier disabled.

---

### Task FL-8: Buat Widget `pending_dropoff_instruction_widget.dart`

**File**: `apps/customer/lib/features/order/presentation/widgets/pending_dropoff_instruction_widget.dart`

Widget menerima `Order order` dan menampilkan:
- Judul: **Pesanan Berhasil Dibuat!**
- Langkah-langkah instruksi:
  1. Bawa laundry Anda ke outlet
  2. Kasir akan menerima dan menimbang laundry
  3. Total harga akan ditentukan oleh kasir
  4. Pembayaran dilakukan setelah kasir meng-ACC order
- Informasi outlet (nama, alamat) dari `order.outlet`
- Tombol navigasi/maps jika koordinat tersedia

---

### Task FL-9: Update `OrderSuccessScreen` — Konten Beda untuk Self Drop-Off

**File**: `apps/customer/lib/features/order/presentation/screens/order_success_screen.dart`

Cek `order.status == 'pending_dropoff'`:
- Jika `true`: tampilkan `PendingDropoffInstructionWidget(order: order)`.
- Jika `false`: tampilkan pesan sukses biasa.

Hapus hardcoded teks "Kurir akan menjemput sesuai jadwal yang dipilih."

---

### Task FL-10: Update `order_card.dart` — Label `pending_dropoff`

**File**: `apps/customer/lib/features/order/presentation/widgets/order_card.dart`

Pastikan order card menggunakan `order.statusLabel` (dari backend) bukan string hardcoded.

Untuk status `pending_dropoff`, tampilkan:
- Label: **Menunggu Anda datang ke outlet**
- CTA info: **Bawa laundry ke outlet untuk ditimbang**

---

### Task FL-11: Update `OrderDetailActionsWidget` — Aksi `pending_dropoff`

**File**: `apps/customer/lib/features/order/presentation/widgets/order_detail_actions_widget.dart`

Update kondisi `canCancel`:

```dart
final canCancel = order.status == 'requested'
    || order.status == 'pending_dropoff'
    || order.status == 'pending';
```

Untuk `pending_dropoff`, tombol "Bayar Sekarang" tidak muncul (`canPay` false dari backend).

---

### Task FL-12: Update `show_order_screen.dart` — Info untuk `pending_dropoff`

**File**: `apps/customer/lib/features/order/presentation/screens/show_order_screen.dart`

Jika `order.status == 'pending_dropoff'`:
- Tampilkan banner instruksi (pakai `PendingDropoffInstructionWidget` compact atau versi banner).
- Tampilkan informasi outlet untuk membantu customer datang.

---

## Alur Data

```
Customer pilih outlet (isCourierEnabled = false)
    ↓
OrderSummaryScreen tampil dengan SelfDropoffBannerWidget + OutletVisitInfoWidget
    ↓
Customer pilih layanan + tambah catatan
    ↓
Tap "Buat Order - Datang ke Outlet"
    ↓
OrderCubit.createOrder(isCourierEnabled: false)
    → pickupType = 'self_dropoff'
    → paymentMethod = null
    ↓
Backend storeCustomer()
    → validasi outlet tidak punya kurir aktif
    → buat order: status = 'pending_dropoff', payment_method = null
    ↓
Response → OrderSuccessScreen
    → tampilkan PendingDropoffInstructionWidget
    ↓
Customer datang ke outlet membawa laundry
    ↓
Kasir accept → received → weighing → ACC
    ↓
Setelah ACC: payment_status = 'unpaid', canPay = true
    ↓
Customer dapat membayar via invoice screen
```

---

## Urutan Pengerjaan

1. **BE-1** → Tambah `STATUS_PENDING_DROPOFF` di `Order.php`
2. **BE-2** → Update validasi `StoreCustomerOrderRequest`
3. **BE-3** → Update `storeCustomer()` di `OrderService`
4. **BE-4** → Tambah validasi outlet courier
5. **BE-5** → Verifikasi `OrderResource` sudah benar
6. **BE-6** → Update `accept()` untuk handle `pending_dropoff`
7. **BE-7** → Tulis test backend
8. **FL-1** → Update `CreateOrderParams` paymentMethod nullable
9. **FL-2** → Update `OrderCubit.createOrder()`
10. **FL-4** → Buat `SelfDropoffBannerWidget`
11. **FL-5** → Buat `OutletVisitInfoWidget`
12. **FL-6** → Update `OrderSummaryScreen`
13. **FL-7** → Update `OrderBottomActionWidget`
14. **FL-8** → Buat `PendingDropoffInstructionWidget`
15. **FL-9** → Update `OrderSuccessScreen`
16. **FL-10** → Update `order_card.dart`
17. **FL-11** → Update `OrderDetailActionsWidget`
18. **FL-12** → Update `show_order_screen.dart`

---

## Hal yang Perlu Dicek Sebelum Eksekusi

1. **Kolom `pickup_type` di tabel orders** — cek migration apakah sudah ada. Jika belum, tambahkan migration baru.
2. **Relasi `courierSetting` di Outlet** — cek `Outlet::courierSetting()` dan cara mengecek kurir aktif/nonaktif.
3. **`url_launcher` dependency** — pastikan ada di `pubspec.yaml` customer app untuk tombol maps dan telepon.
4. **`order.outlet` di detail screen** — pastikan `show_order_screen.dart` load relasi outlet dari backend.

---

## Keputusan Teknis

| Keputusan | Pilihan |
|---|---|
| Status order self drop-off | `pending_dropoff` |
| Payment method saat buat order | `null` |
| Payment status saat buat order | `not_yet_priced` |
| Transisi kasir | `pending_dropoff` → `received` |
| Label UI utama | **Datang langsung ke outlet** |
| Teks pendukung | **Layanan antar-jemput belum tersedia** |
| Outlet kurir aktif + request self_dropoff | Ditolak backend |
| Outlet tanpa kurir + request courier | Ditolak backend |
