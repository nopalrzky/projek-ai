# Plan: Koreksi Item Pesanan Saat Cashier Menimbang

Tanggal: 2026-06-11

User need: `docs/user_need/cashier_weigh_order_item_correction_user_need.md`

---

## Sebelum Mengerjakan

Baca semua file spec di `docs/spec/` terlebih dahulu:
`cubit_spec.md`, `state_spec.md`, `provider_spec.md`, `remote_datasource_spec.md`,
`repository_spec.md`, `repository_impl_spec.md`, `usecase_spec.md`.

Aturan coding yang wajib diikuti:
- Gunakan shared widget dari `packages/wash_wallet_ui/lib/src/components/`
- Gunakan `Theme.of(context).colorScheme` untuk warna, tidak hardcode warna apapun
- Pecah widget panjang ke folder `widgets/` di dalam folder screen yang relevan
- Tidak ada comment di dalam kode

---

## Kondisi Awal Repo

Dari eksplorasi repo sebelum plan ini dibuat:

### Frontend (Cashier App)
- Halaman timbang: `apps/cashier/lib/features/order/presentation/screens/weigh_order_screen.dart`
- `WeighItemData` hanya punya dua field: `quantity` dan `itemNotes` — tidak ada `laundryServiceId`
- Item dirender berdasarkan `widget.order.orderItems` dengan index tetap (tidak bisa tambah/hapus)
- Cashier hanya bisa edit quantity dan catatan, tidak bisa ganti layanan
- Submit via `OrderCubit.weigh(WeighParams)`
- `WeighParams.toMap()` menghasilkan `orderItems: [{quantity, itemNotes}]` tanpa service info
- Referensi flow create order: `select_laundry_service_for_order_screen.dart` menggunakan `LaundryServiceCubit` + `OrderPriceCalculator`
- `OrderPriceCalculator.calculate()` menerima `items`, `services`, `membershipContracts`, `customerSubscriptions` dan menghasilkan subtotal, quota discount, membership discount, total per item

### Backend
- `WeightOrderRequest` validasi: `orderItems.*.quantity` (numeric, min 0.01) dan `orderItems.*.itemNotes` (nullable) — tidak ada `laundryServiceId`
- `OrderService::weight()` memproses item berdasarkan posisi index array, bukan berdasarkan `laundryServiceId`
- `weight()` tidak memproses quota atau package usage (hanya update quantity × price dari service lama)
- `weight()` mempertahankan `discount_amount` lama dari order
- `weight()` sudah menghitung ulang `total_amount = subtotal + fees - discount + tax`
- `weight()` sudah mengubah `payment_status` dari `not_yet_priced` → `unpaid`
- Referensi flow store: `OrderService::store()` memproses `laundryServiceId` per item, hitung quota, catat `QuotaUsageLog`, panggil `accountingService`
- `LaundryService` tidak punya `outlet_id` langsung — outlet diakses via `category.outlet_id` (scope: `scopeByOutletId`)

---

## Arsitektur Perubahan

```
Customer Order → Cashier receives (status: received)
  → WeighOrderScreen (revamped)
      ├── Load available services for outlet
      ├── Load customer subscriptions (for quota preview)
      ├── Show existing items as draft (editable)
      ├── Add / Edit / Delete items
      ├── Realtime price estimation via OrderPriceCalculator
      └── Submit → WeighParams (with laundryServiceId per item)
                     → OrderRemoteDatasource.weigh()
                       → POST /api/mobile/cashier/orders/{id}/weigh
                         → WeightOrderRequest (+ laundryServiceId validation)
                           → OrderService::weight() (replace items, handle quota)
                             → status: ready_to_process
```

---

## Perubahan yang Diperlukan

---

### Bagian 1 — Domain Model Baru: WeighDraftItem

---

#### [NEW] `apps/cashier/lib/features/order/domain/models/weigh_draft_item.dart`

Buat model lokal yang digunakan hanya di layer UI sebagai representasi draft item selama penimbangan.

Fields yang diperlukan:
- `laundryServiceId` (int) — identifier layanan, kunci utama item
- `categoryName` (String) — untuk display
- `serviceName` (String) — untuk display
- `unitName` (String) — untuk display satuan quantity
- `unitPrice` (double) — harga satuan dari service
- `minQuantity` (int?) — minimum quantity dari service
- `quantity` (double) — quantity aktual yang diisi cashier
- `itemNotes` (String?) — catatan per item
- `isPackageUsage` (bool) — apakah item ini memakai quota paket
- `customerSubscriptionId` (int?) — referensi subscription yang dipakai
- `quotaUsed` (double?) — jumlah quota yang dipakai

Tambahkan computed property `subtotal` yang mengembalikan `unitPrice * quantity`.

Tambahkan factory constructor `fromOrderItem(OrderItem item)` untuk membangun draft awal dari item order existing:
- Ambil `laundryServiceId`, `categoryName`, `serviceName` (laundryServiceName), `unitName`, `unitPrice` dari `OrderItem`
- Set `quantity`, `itemNotes`, `isPackageUsage`, `customerSubscriptionId`, `quotaUsed` dari field yang sudah ada di `OrderItem`

Tambahkan method `copyWith(...)` untuk immutable update.

Tambahkan method `toWeighItemData()` yang menghasilkan `WeighItemData` untuk dikirim ke usecase.

---

### Bagian 2 — Update WeighItemData dan WeighParams

---

#### [MODIFY] `apps/cashier/lib/features/order/domain/usecases/weigh_usecase.dart`

Update `WeighItemData` dengan menambah field:
- `laundryServiceId` (int) — wajib
- `discountAmount` (double) — default 0
- `isPackageUsage` (bool) — default false
- `customerSubscriptionId` (int?) — nullable
- `quotaUsed` (double?) — nullable

Update method `toMap()` agar mengikutsertakan semua field baru.

`WeighParams` dan `WeighUsecase` tidak perlu diubah karena sudah menerima `List<WeighItemData>`.

---

### Bagian 3 — Update Remote Datasource

---

#### [MODIFY] `apps/cashier/lib/features/order/data/datasources/order_remote_datasource.dart`

Method `weigh()` sudah menggunakan `FormData.fromMap({...data})` sehingga field baru di `WeighItemData.toMap()` otomatis ikut terkirim.

Pastikan `orderItems` dikirim dengan struktur yang kompatibel dengan multipart form Dio sehingga backend menerima:
```
orderItems[0][laundryServiceId]
orderItems[0][quantity]
orderItems[0][itemNotes]
orderItems[0][discountAmount]
orderItems[0][isPackageUsage]
orderItems[0][customerSubscriptionId]
orderItems[0][quotaUsed]
```

Tidak perlu perubahan besar jika `WeighItemData.toMap()` sudah menyertakan semua key yang diperlukan.

---

### Bagian 4 — Backend: Update WeightOrderRequest

---

#### [MODIFY] `webapp/wash_wallet_be/app/Http/Requests/Order/WeightOrderRequest.php`

Tambahkan validasi berikut ke dalam `rules()`:

```php
'orderItems.*.laundryServiceId'         => ['required', 'integer', 'exists:laundry_services,id'],
'orderItems.*.discountAmount'           => ['nullable', 'numeric', 'min:0'],
'orderItems.*.isPackageUsage'           => ['nullable', 'boolean'],
'orderItems.*.customerSubscriptionId'   => ['nullable', 'integer', 'exists:customer_subscriptions,id'],
'orderItems.*.quotaUsed'                => ['nullable', 'numeric', 'min:0'],
```

Tambahkan key yang sesuai di `attributes()` jika metode itu ada, agar pesan validasi lebih ramah pengguna.

---

### Bagian 5 — Backend: Refactor OrderService::weight()

---

#### [MODIFY] `webapp/wash_wallet_be/app/Services/OrderService.php`

Refactor metode `weight()` dengan perubahan berikut. Gunakan database transaction untuk seluruh operasi.

**Langkah 1 — Validasi status order**

Hanya izinkan timbang dari status `received` dan `ready_to_process`. Jika status lain, lempar exception.

**Langkah 2 — Validasi layanan per item**

Untuk setiap item di `$data['orderItems']`:
1. Ambil `LaundryService` berdasarkan `laundryServiceId`
2. Validasi `is_active === true`, jika tidak → exception dengan pesan yang jelas
3. Validasi layanan milik outlet yang sama dengan order (via `scopeByOutletId($order->outlet_id)`), jika tidak → exception

**Langkah 3 — Restore quota lama (jika order pernah pakai quota)**

Sebelum mengganti item, cek apakah ada `orderItems` lama yang memiliki `customer_subscription_id` tidak null dan `quota_used` tidak null.

Untuk setiap item lama yang punya quota usage:
1. Ambil `CustomerQuota` berdasarkan `customer_subscription_id` dan `laundry_service_id`
2. Kembalikan `remaining_quota += quota_used` (restore)
3. Hapus `QuotaUsageLog` terkait atau tandai sebagai reversed (ikuti pola existing jika ada)

Jika subscription sudah dalam status `exhausted`, kembalikan ke `active` setelah restore.

**Langkah 4 — Hapus item lama**

Hapus semua `orderItems` lama milik order: `$order->orderItems()->delete()`.

**Langkah 5 — Buat item baru dari payload**

Untuk setiap item baru di payload:
1. Gunakan harga dari `$laundryService->price` — tidak percaya harga dari client
2. Hitung `subtotal = price * quantity`
3. `discountAmount` diambil dari payload (hasil quota/paket dari client)
4. `totalAmount = subtotal - discountAmount`
5. Buat `OrderItem` baru dengan snapshot lengkap: `category_name`, `laundry_service_name`, `unit_name`, `unit_price`, `quantity`, `subtotal`, `discount_amount`, `total_amount`, `is_package_usage`, `customer_subscription_id`, `quota_used`, `item_notes`

Hitung `$orderSubtotal` sebagai jumlah `totalAmount` semua item baru.

**Langkah 6 — Proses quota baru**

Untuk setiap item baru yang `isPackageUsage === true`:
1. Ikuti pola yang sama dengan `OrderService::store()` untuk deduct quota
2. Validasi `remaining_quota >= quotaUsed`, jika tidak → exception dengan pesan jelas
3. `$quota->decrement('remaining_quota', $quotaUsed)`
4. Buat `QuotaUsageLog`
5. Jika `remaining_quota` menjadi 0 → update subscription status ke `exhausted`

**Langkah 7 — Hitung ulang total order**

```php
$totalAmount = $orderSubtotal + $order->pickup_fee + $order->delivery_fee
             - $order->discount_amount + $order->tax_amount;
$remainingAmount = max(0, $totalAmount - $order->paid_amount);
```

**Langkah 8 — Update order**

Update order dengan:
- `subtotal`, `total_amount`, `remaining_amount`
- `status` → `ready_to_process`
- `payment_status`: jika sebelumnya `not_yet_priced` → `unpaid`, jika sudah ada paid_amount dan remaining = 0 → `paid`, selain itu ikuti pola existing
- `notes` dan `internal_notes` jika dikirim di payload
- Simpan foto timbang jika dikirim (ikuti pola existing)

**Langkah 9 — Kirim notifikasi**

Ikuti pola notifikasi existing setelah timbang berhasil (FCM + WhatsApp).

**Langkah 10 — Return response**

Return order fresh dengan relasi: `customer`, `employee`, `orderItems.laundryService.category`, `orderItems.laundryService.unit`.

---

### Bagian 6 — Backend: Tambah Endpoint Daftar Layanan untuk Timbang

---

#### [MODIFY] `webapp/wash_wallet_be/routes/api_mobile_cashier.php`

Pastikan sudah ada endpoint untuk mengambil daftar layanan aktif per outlet yang dapat diakses oleh cashier. Cek apakah sudah ada endpoint `GET /api/mobile/cashier/laundry-services?outletId={id}&isActive=true` atau serupa.

Jika belum ada, tambahkan route baru yang memanggil controller laundry service yang sudah ada dan mengembalikan layanan aktif untuk outlet tertentu. Endpoint ini dibutuhkan oleh halaman timbang saat load layanan.

---

### Bagian 7 — Flutter: Widget Baru

Semua widget baru diletakkan di folder:
`apps/cashier/lib/features/order/presentation/screens/widgets/`

---

#### [NEW] `widgets/weigh_order_header_widget.dart`

Menampilkan ringkasan informasi order di bagian atas halaman timbang:
- Nomor order
- Nama customer
- Status order (label bisnis)
- Nama outlet

Gunakan `AppCard` dari shared UI. Jangan hardcode warna.

---

#### [NEW] `widgets/weigh_item_card.dart`

Menampilkan satu item draft timbang. Menerima `WeighDraftItem` dan callback.

Konten kartu:
- Nama kategori dan nama layanan (tappable untuk ganti layanan)
- Input quantity dengan `TextFormField` (keyboard decimal)
- Tampilan unit satuan di samping input qty
- Tampilan harga satuan dan subtotal realtime
- Input catatan item (opsional)
- Tombol hapus item

Callback yang diperlukan:
- `onServiceTap` — saat nama layanan ditekan untuk ganti layanan
- `onQuantityChanged(double)` — saat quantity berubah
- `onNotesChanged(String?)` — saat catatan berubah
- `onDelete` — saat tombol hapus ditekan

Gunakan `AppCard` untuk wrapper. Gunakan `Theme.of(context).colorScheme` untuk semua warna.

---

#### [NEW] `widgets/weigh_add_item_button.dart`

Tombol sederhana "Tambah Layanan" yang ditekan cashier untuk menambah item baru.

Menerima callback `onTap`. Gunakan styling yang konsisten dengan halaman (outlined button atau card dengan icon +).

---

#### [NEW] `widgets/weigh_price_summary.dart`

Menampilkan ringkasan harga berdasarkan draft item saat ini:
- Subtotal (sebelum diskon)
- Total diskon quota/paket (jika ada)
- Total diskon membership (jika ada)
- Total estimasi
- Paid amount existing (readonly)
- Remaining amount estimasi

Menerima `OrderPriceResult` dan `Order` (untuk paid amount dan fee). Diupdate secara realtime saat draft item berubah.

Gunakan `AppCard`. Semua warna dari theme.

---

#### [NEW] `widgets/weigh_notes_section.dart`

Menampilkan dua input catatan:
- Catatan customer (notes)
- Catatan internal (internalNotes)

Masing-masing `TextFormField` multiline. Menerima dua `TextEditingController`.

---

#### [NEW] `widgets/weigh_photo_section.dart`

Menampilkan kontrol upload foto bukti timbang (opsional). Pindahkan logika foto dari `weigh_order_screen.dart` existing ke widget ini.

Menerima callback `onPhotoSelected(String? path)` dan `selectedPhotoPath`.

---

#### [NEW] `widgets/select_service_bottom_sheet.dart`

Bottom sheet untuk memilih layanan saat tambah item baru atau ganti layanan existing.

Menggunakan `AppBottomSheet` dari shared UI.

Konten:
- Search bar untuk filter nama layanan
- Daftar layanan aktif outlet menggunakan `AppListTile`
- Setiap item menampilkan: nama kategori, nama layanan, harga satuan, unit, minimum quantity (jika ada)

Menerima:
- `List<LaundryService> services` — daftar layanan yang tersedia
- `onServiceSelected(LaundryService)` — callback saat layanan dipilih

Menerapkan filter lokal berdasarkan search query. Tidak perlu load ulang data — cukup filter dari list yang sudah diterima.

---

### Bagian 8 — Flutter: Revamp WeighOrderScreen

---

#### [MODIFY] `apps/cashier/lib/features/order/presentation/screens/weigh_order_screen.dart`

Halaman ini perlu direvamp secara signifikan. Tetap gunakan `StatefulWidget` dengan `BlocListener<OrderCubit, OrderState>`.

**State lokal yang dibutuhkan:**
```dart
List<WeighDraftItem> _draftItems = [];
List<LaundryService> _availableServices = [];
List<CustomerSubscription> _customerSubscriptions = [];
TextEditingController _notesController;
TextEditingController _internalNotesController;
String? _photoPath;
OrderPriceResult? _priceResult;
bool _isLoadingServices = false;
```

**`initState()`:**
1. Inisialisasi `_draftItems` dari `widget.order.orderItems` menggunakan `WeighDraftItem.fromOrderItem()`
2. Load layanan aktif outlet dari `LaundryServiceCubit` atau panggil langsung dari datasource jika cubit sudah ada
3. Load customer subscriptions (gunakan cubit atau provider yang sudah ada di create order flow)
4. Hitung `_priceResult` awal
5. Inisialisasi controllers

**`_recalculatePrice()`:**
Dipanggil setiap kali `_draftItems` berubah. Konversi `_draftItems` ke `List<OrderDraftItem>` untuk dipakai di `OrderPriceCalculator.calculate()`.

**`_onServiceSelected(int itemIndex, LaundryService service)`:**
Update `_draftItems[itemIndex]` dengan data dari service baru (categoryName, serviceName, unitName, unitPrice, minQuantity), reset isPackageUsage dan quota fields, lalu panggil `_recalculatePrice()`.

**`_onAddItem(LaundryService service)`:**
Tambah `WeighDraftItem` baru ke `_draftItems` dengan quantity awal dari `service.minQuantity ?? 1`.

**`_onDeleteItem(int index)`:**
Hapus item dari `_draftItems[index]`. Panggil `_recalculatePrice()`.

**`_openServicePicker({int? replaceIndex})`:**
Tampilkan `SelectServiceBottomSheet` menggunakan `showModalBottomSheet`. Jika `replaceIndex` tidak null → panggil `_onServiceSelected`. Jika null → panggil `_onAddItem`.

**`_handleSave()`:**
1. Validasi minimal 1 item
2. Validasi semua quantity > 0 dan >= minQuantity layanan
3. Bangun `List<WeighItemData>` dari `_draftItems` (gunakan `item.toWeighItemData()`) dengan quota/package info dari `_priceResult`
4. Bangun dan dispatch `WeighParams`

**Build layout:**
Gunakan `CustomScrollView` dengan `SliverList` atau `Column` dalam `SingleChildScrollView`. Susun widget dari atas ke bawah:
1. `WeighOrderHeaderWidget`
2. `WeighPhotoSection`
3. Header section "Item Cucian" dengan label dan `WeighAddItemButton`
4. `ListView` (shrinkWrap, tidak scrollable sendiri) dari `WeighItemCard` per item
5. `WeighNotesSection`
6. `WeighPriceSummary`
7. Bottom bar dengan tombol simpan

Gunakan hanya widget dari folder `widgets/` di atas sebagai building block.

---

### Bagian 9 — Backend: Tambah Feature Test

---

#### [NEW] `webapp/wash_wallet_be/tests/Feature/WeighOrderItemCorrectionTest.php`

Buat file test Pest. Gunakan pola yang sama dengan test feature existing di repo.

Setup:
- Helper untuk buat cashier employee dengan permission `order.manage`
- Helper untuk buat order dengan status `received` dan beberapa order items
- Helper untuk buat laundry services aktif di outlet yang sama

Test cases yang wajib dibuat:

1. **Cashier dapat mengganti layanan item saat timbang**
   - Order status `received`, kirim payload dengan `laundryServiceId` berbeda dari item awal
   - Ekspektasi: 200, status berubah ke `ready_to_process`, `orderItems` berisi layanan baru

2. **Cashier dapat menambah item layanan baru saat timbang**
   - Order status `received`, kirim payload dengan item lebih banyak dari item awal
   - Ekspektasi: 200, `orderItems` berisi semua item yang dikirim

3. **Cashier dapat menghapus item lama saat timbang**
   - Order status `received` dengan 2 item, kirim payload hanya 1 item dengan service berbeda
   - Ekspektasi: 200, `orderItems` hanya berisi 1 item

4. **Backend menolak timbang tanpa item**
   - Kirim `orderItems: []`
   - Ekspektasi: 422 dengan validasi error

5. **Backend menolak layanan inactive**
   - Kirim `laundryServiceId` yang `is_active = false`
   - Ekspektasi: 422 atau 403 dengan pesan jelas

6. **Backend menolak layanan dari outlet lain**
   - Kirim `laundryServiceId` milik outlet berbeda
   - Ekspektasi: 422 atau 403

7. **Backend menolak quantity di bawah minimum layanan**
   - Service memiliki `min_quantity = 2`, kirim `quantity = 0.5`
   - Ekspektasi: 422

8. **Backend menghitung ulang total berdasarkan item aktual**
   - Verifikasi `total_amount` order setelah timbang sesuai `sum(quantity * servicePrice)`

9. **Timbang tetap berhasil tanpa foto**
   - Kirim payload valid tanpa file photo
   - Ekspektasi: 200

10. **Order berubah ke `ready_to_process` setelah timbang**
    - Ekspektasi: status di response = `ready_to_process`

---

## Urutan Pengerjaan

Ikuti urutan ini agar tidak ada dependency yang rusak:

1. **Backend WeightOrderRequest** (Bagian 4) — tambah validasi `laundryServiceId` terlebih dahulu
2. **Backend OrderService::weight()** (Bagian 5) — refactor logika utama
3. **Backend Feature Test** (Bagian 9) — jalankan setelah backend selesai, pastikan semua pass
4. **Domain Model WeighDraftItem** (Bagian 1) — buat model baru Flutter
5. **Update WeighItemData** (Bagian 2) — tambah field baru
6. **Update Remote Datasource** (Bagian 3) — pastikan field baru terkirim
7. **Widget Baru** (Bagian 7) — buat semua widget dalam folder `widgets/`
8. **Revamp WeighOrderScreen** (Bagian 8) — rakit dari widget-widget baru
9. **Backend Endpoint Layanan** (Bagian 6) — pastikan endpoint layanan bisa diakses dari cashier

---

## Acceptance Criteria

### Backend
- [ ] `POST /api/mobile/cashier/orders/{id}/weigh` menerima `laundryServiceId` per item
- [ ] Backend menolak layanan inactive (422)
- [ ] Backend menolak layanan dari outlet lain (422)
- [ ] Backend menolak quantity 0 atau di bawah `min_quantity` (422)
- [ ] Backend menolak `orderItems` kosong (422)
- [ ] Item lama diganti total oleh item dari payload
- [ ] Harga final dihitung dari `laundryService.price` di DB, bukan dari client
- [ ] `total_amount` order diperbarui sesuai item aktual
- [ ] `remaining_amount = max(0, total_amount - paid_amount)`
- [ ] `paid_amount` lama tidak terhapus
- [ ] Status order berubah ke `ready_to_process`
- [ ] Quota lama di-restore sebelum quota baru diterapkan
- [ ] Quota baru dideduct sesuai item aktual
- [ ] Semua test di `WeighOrderItemCorrectionTest.php` pass

### Flutter Cashier App
- [ ] Halaman timbang menampilkan item awal order sebagai draft
- [ ] Cashier bisa mengetuk nama layanan untuk membuka picker dan mengganti layanan
- [ ] Setelah layanan diganti, harga satuan, unit, subtotal berubah realtime
- [ ] Cashier bisa menambah item layanan baru via tombol "Tambah Layanan"
- [ ] Bottom sheet picker menampilkan layanan aktif outlet dengan search
- [ ] Cashier bisa menghapus item
- [ ] Tidak bisa submit jika semua item dihapus (pesan validasi muncul)
- [ ] Total estimasi berubah realtime saat item berubah
- [ ] Payload yang dikirim menyertakan `laundryServiceId` per item
- [ ] Foto timbang tetap opsional
- [ ] Setelah simpan berhasil, kembali ke halaman sebelumnya dan memuat ulang detail order
