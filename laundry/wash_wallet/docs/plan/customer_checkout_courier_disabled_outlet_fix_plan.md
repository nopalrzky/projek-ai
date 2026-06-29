# Implementation Plan: Fix Checkout Customer Menampilkan Kurir Saat Outlet Belum Aktif Kurir

## Penting: Panduan untuk AI Model yang Mengerjakan

Sebelum menulis satu baris kode pun, AI model **WAJIB**:

1. **Baca standarisasi spec** — baca semua file spec/standarisasi di `docs/` dan `packages/wash_wallet_ui/` sebelum mulai.
2. **Gunakan reusable components** — selalu pakai `AppCard`, `AppButton`, `AppHeader`, `AppLayout`, `AppLoadingIndicator`, `AppSnackbar`, dan komponen UI yang sudah ada.
3. **Gunakan theme tokens** — warna dari `context.colors.*`, spacing dari `context.space.*`, radius dari `context.radius.*`, typography dari `context.typography.*`. **Jangan hardcode warna apapun.**
4. **Pecah ke widget/partial kecil** — jangan buat satu file yang panjang. Setiap widget yang bisa dipisahkan **harus** diletakkan di folder `widgets/`.
5. **Tanpa komentar** — kode harus clean code, tidak ada comment apapun.
6. **Review file terkait terlebih dahulu** — lihat file yang akan diubah sebelum mengedit agar tidak merusak fitur yang sudah ada.

---

## Referensi Issue

Issue lengkap ada di: `docs/issue/customer_checkout_courier_disabled_outlet_issue.md`

---

## Konteks Teknis

### Root Cause yang Sudah Dikonfirmasi

**Root Cause 1 — OutletResource fallback salah**

File: `webapp/wash_wallet_be/app/Http/Resources/Outlet/OutletResource.php` baris 160–162:

```php
'isCourierEnabled' => $this->relationLoaded('courierSetting') && $this->courierSetting
    ? (bool) $this->courierSetting->is_courier_enabled
    : true,   // ← BUG: fallback true, seharusnya false
```

Ketika `courierSetting` tidak di-load atau tidak ada, field ini mengembalikan `true` sehingga frontend menampilkan opsi kurir untuk outlet yang belum pernah mengaktifkan fitur kurir.

**Root Cause 2 — Key fitur kurir tidak konsisten**

File: `webapp/wash_wallet_be/app/Http/Resources/Outlet/OutletResource.php` baris 157–159:

```php
'isCourierActive' => $this->whenLoaded('outletFeatures', function () {
    return $this->outletFeatures->contains(fn($f) => $f->feature?->key === 'courier_service' && ...);
})
```

Resource mengecek key `courier_service`, tetapi seeder (`CourierFeatureSeeder.php` baris 16) dan `OutletFeatureService.php` (baris 185, 187) memakai key `courier_schedule`. Karena key tidak match, `isCourierActive` selalu `false` untuk semua outlet meski kurir sudah aktif di seeder.

**Root Cause 3 — Default `firstOrCreate` membuat courier setting dengan enabled=true**

File: `webapp/wash_wallet_be/app/Services/CourierSettingService.php` baris 84–87:

```php
$setting = $this->courierSetting->query()->firstOrCreate(
    ['outlet_id' => $outletId],
    ['is_courier_enabled' => true]   // ← outlet baru otomatis enabled
);
```

Setiap kali `getByOutletId()` dipanggil untuk outlet baru, sistem otomatis membuat courier setting dengan `is_courier_enabled = true`.

**Root Cause 4 — Default migration `is_courier_enabled = true`**

File: `webapp/wash_wallet_be/database/migrations/2026_04_29_164242_create_courier_settings_table.php` baris 17:

```php
$table->boolean('is_courier_enabled')->default(true);
```

**Root Cause 5 — `validateOutletCourierStatus` tidak mencakup `deliveryType='delivery'`**

File: `webapp/wash_wallet_be/app/Services/OrderService.php` baris 640–648:

```php
private function validateOutletCourierStatus(int $outletId, string $pickupType): void
{
    $outlet = Outlet::with('courierSetting')->findOrFail($outletId);
    $isCourierEnabled = $outlet->courierSetting ? (bool) $outlet->courierSetting->is_courier_enabled : false;

    if ($pickupType === 'courier' && !$isCourierEnabled) {
        throw new InvalidArgumentException("Outlet ini tidak memiliki layanan kurir.");
    }
    // ← TIDAK ADA guard untuk deliveryType='delivery' saat courier disabled
}
```

Guard hanya menolak `pickupType='courier'`, tetapi tidak menolak `deliveryType='delivery'` saat outlet courier disabled.

**Root Cause 6 — Default state OrderCubit masih mode kurir**

File: `apps/customer/lib/features/order/presentation/bloc/order_state.dart` baris 55–56:

```dart
this.pickupType = 'courier',
this.deliveryType = 'delivery',
```

Meskipun `order_summary_screen.dart` sudah memiliki guard `outlet.isCourierEnabled && cartState.canUseCourier` (baris 60, 126, 221), jika backend mengirim `isCourierEnabled=true` secara salah (Root Cause 1), UI tetap menampilkan mode kurir.

---

## Ruang Lingkup

| Area | Termasuk | Tidak Termasuk |
|---|---|---|
| Laravel Backend | `webapp/wash_wallet_be` | Web dashboard UI |
| Flutter Customer App | `apps/customer` | Cashier app, Courier app |

---

## Backend Laravel

### Task BE-1: Fix `isCourierEnabled` di `OutletResource.php`

**File**: `webapp/wash_wallet_be/app/Http/Resources/Outlet/OutletResource.php`

**Perubahan**:

Ubah logika `isCourierEnabled` dari fallback `true` menjadi `false` ketika relasi tidak ada/tidak di-load:

```php
// SEBELUM
'isCourierEnabled' => $this->relationLoaded('courierSetting') && $this->courierSetting
    ? (bool) $this->courierSetting->is_courier_enabled
    : true,

// SESUDAH
'isCourierEnabled' => $this->relationLoaded('courierSetting') && $this->courierSetting
    ? (bool) $this->courierSetting->is_courier_enabled
    : false,
```

**Semantik yang diharapkan setelah fix**:
- `courierSetting` tidak di-load → `false`
- `courierSetting` ada tapi `is_courier_enabled=false` → `false`
- `courierSetting` ada dan `is_courier_enabled=true` → `true`

> **PENTING**: Setelah perubahan ini, pastikan semua controller yang memanggil `OutletResource` dan membutuhkan `isCourierEnabled` sudah meng-load relasi `courierSetting`. Cari controller yang mereturn `OutletResource` dan pastikan `with('courierSetting')` ada.

---

### Task BE-2: Fix `isCourierActive` di `OutletResource.php` — key mismatch

**File**: `webapp/wash_wallet_be/app/Http/Resources/Outlet/OutletResource.php`

**Permasalahan**: `isCourierActive` mengecek key `courier_service`, tetapi seeder dan OutletFeatureService memakai key `courier_schedule`.

**Langkah**:

1. Cek file `webapp/wash_wallet_be/database/seeders/CourierFeatureSeeder.php` — konfirmasi key yang benar yang dipakai saat aktivasi fitur kurir.
2. Cek file `webapp/wash_wallet_be/app/Services/OutletFeatureService.php` baris 185–187 — konfirmasi key yang dipakai saat unlock fitur.
3. Setelah memastikan key yang benar adalah `courier_schedule`, ubah `OutletResource.php`:

```php
// SEBELUM
'isCourierActive' => $this->whenLoaded('outletFeatures', function () {
    return $this->outletFeatures->contains(fn($f) => $f->feature?->key === 'courier_service' && ($f->status === 'unlocked' || $f->status === 'trial'));
}),

// SESUDAH (setelah konfirmasi key)
'isCourierActive' => $this->whenLoaded('outletFeatures', function () {
    return $this->outletFeatures->contains(fn($f) => $f->feature?->key === 'courier_schedule' && ($f->status === 'unlocked' || $f->status === 'trial'));
}),
```

> **Catatan**: Jika key yang benar ternyata berbeda dari `courier_schedule`, sesuaikan. Lakukan konfirmasi ke seeder dan service terlebih dahulu.

---

### Task BE-3: Fix `isCourierEnabled` agar gabungkan cek `isCourierActive`

**File**: `webapp/wash_wallet_be/app/Http/Resources/Outlet/OutletResource.php`

Setelah BE-1 dan BE-2, `isCourierEnabled` harus menggabungkan dua kondisi:
1. Fitur kurir outlet aktif (`isCourierActive = true`)
2. Setting kurir diaktifkan (`is_courier_enabled = true`)

**Refactor `isCourierEnabled`**:

```php
'isCourierEnabled' => $this->whenLoaded('outletFeatures', function () {
    $featureActive = $this->outletFeatures->contains(
        fn($f) => $f->feature?->key === 'courier_schedule' && ($f->status === 'unlocked' || $f->status === 'trial')
    );
    if (!$featureActive) return false;
    return $this->relationLoaded('courierSetting') && $this->courierSetting
        ? (bool) $this->courierSetting->is_courier_enabled
        : false;
}, false),
```

Jika `outletFeatures` tidak di-load, default ke `false`.

> **PENTING**: Pastikan controller customer yang memanggil `OutletResource` meng-load **kedua** relasi: `with(['courierSetting', 'outletFeatures.feature'])`. Cari endpoint `/mobile/customer/outlets/{id}` dan pastikan eager load-nya sudah benar.

---

### Task BE-4: Fix `firstOrCreate` default di `CourierSettingService.php`

**File**: `webapp/wash_wallet_be/app/Services/CourierSettingService.php`

**Perubahan**:

```php
// SEBELUM
$setting = $this->courierSetting->query()->firstOrCreate(
    ['outlet_id' => $outletId],
    ['is_courier_enabled' => true]
);

// SESUDAH
$setting = $this->courierSetting->query()->firstOrCreate(
    ['outlet_id' => $outletId],
    ['is_courier_enabled' => false]
);
```

> **PENTING**: Perubahan ini hanya mempengaruhi outlet **baru** yang belum pernah punya courier setting. Outlet yang sudah ada tetap menggunakan value dari database. Tidak ada data existing yang terpengaruh.

---

### Task BE-5: Perluas `validateOutletCourierStatus` di `OrderService.php` untuk `deliveryType='delivery'`

**File**: `webapp/wash_wallet_be/app/Services/OrderService.php`

Metode `validateOutletCourierStatus` saat ini hanya menolak `pickupType='courier'`. Perlu diperluas untuk juga menolak `deliveryType='delivery'` saat outlet courier disabled.

**Langkah**:

1. Tambahkan parameter `string $deliveryType` pada signature method:

```php
private function validateOutletCourierStatus(int $outletId, string $pickupType, string $deliveryType = 'pickup'): void
```

2. Tambahkan guard untuk `deliveryType`:

```php
private function validateOutletCourierStatus(int $outletId, string $pickupType, string $deliveryType = 'pickup'): void
{
    $outlet = Outlet::with(['courierSetting', 'outletFeatures.feature'])->findOrFail($outletId);

    $featureActive = $outlet->outletFeatures->contains(
        fn($f) => $f->feature?->key === 'courier_schedule' && ($f->status === 'unlocked' || $f->status === 'trial')
    );
    $settingEnabled = $outlet->courierSetting ? (bool) $outlet->courierSetting->is_courier_enabled : false;
    $isCourierEnabled = $featureActive && $settingEnabled;

    if ($pickupType === 'courier' && !$isCourierEnabled) {
        throw new InvalidArgumentException("Outlet ini tidak memiliki layanan kurir.");
    }

    if ($deliveryType === 'delivery' && !$isCourierEnabled) {
        throw new InvalidArgumentException("Outlet ini tidak memiliki layanan antar kurir.");
    }
}
```

3. Update pemanggilan method di `storeCustomer()`:

```php
// Cari baris 507 di OrderService.php
$this->validateOutletCourierStatus($outletId, $pickupType);

// Ubah menjadi (setelah resolve $deliveryType dari $data)
$deliveryType = $data['deliveryType'] ?? 'pickup';
$this->validateOutletCourierStatus($outletId, $pickupType, $deliveryType);
```

> **PENTING**: Pastikan `self_dropoff` + `pickup` tetap **diterima** (tidak ikut diblokir). Guard hanya untuk `deliveryType='delivery'` dan `pickupType='courier'` saat courier disabled.

---

### Task BE-6: Verifikasi Controller Customer Outlet — Eager Load

**File yang perlu dicek**:
- Controller yang menangani endpoint `/mobile/customer/outlets/{id}`
- Controller yang menangani endpoint list outlet customer

**Langkah**:

1. Cari controller endpoint customer outlet. Kemungkinan ada di:
   - `webapp/wash_wallet_be/app/Http/Controllers/Customer/OutletController.php` atau
   - `webapp/wash_wallet_be/app/Http/Controllers/Mobile/`

2. Pastikan setiap `OutletResource::make($outlet)` atau `OutletResource::collection(...)` untuk endpoint customer sudah meng-load relasi:

```php
$outlet->load(['courierSetting', 'outletFeatures.feature']);
// atau di query:
Outlet::with(['courierSetting', 'outletFeatures.feature', ...])->findOrFail($id);
```

3. Jika relasi belum di-load, tambahkan eager loading.

---

### Task BE-7: Verifikasi `StoreCustomerOrderRequest.php` — `deliveryType` Validation

**File**: `webapp/wash_wallet_be/app/Http/Requests/Order/StoreCustomerOrderRequest.php`

Cek apakah `deliveryType` sudah ada di validasi request. Jika belum, tambahkan:

```php
'deliveryType' => 'nullable|string|in:delivery,pickup',
```

Pastikan `pickup` (self pickup) adalah value yang valid selain `delivery`.

---

## Flutter Customer App

### Task FL-1: Pastikan `OrderState` default bukan mode kurir saat outlet non-kurir

**File**: `apps/customer/lib/features/order/presentation/bloc/order_cubit.dart`

**Permasalahan**: Default state `pickupType='courier'` dan `deliveryType='delivery'` tetap terset di awal inisialisasi. Meski `order_summary_screen.dart` sudah ada guard `outlet.isCourierEnabled && cartState.canUseCourier`, jika backend mengirim nilai yang salah, UI akan salah.

**Langkah**:

Cari method/event yang dipanggil saat screen pertama kali load (kemungkinan `initOrder`, `loadOutlet`, atau listener `OutletCubit`). Tambahkan normalisasi state saat outlet di-load:

```dart
// Ketika outlet berhasil dimuat, normalisasi state sesuai kemampuan kurir outlet
void normalizeOrderStateForOutlet(Outlet outlet) {
  final bool courierAvailable = outlet.isCourierEnabled;
  if (!courierAvailable) {
    emit(state.copyWith(
      pickupType: 'self_dropoff',
      deliveryType: 'pickup',
    ));
  }
}
```

Panggil method ini dari listener `OutletCubit` di `OrderSummaryScreen` atau dari `OrderCubit` itu sendiri setelah outlet terload.

---

### Task FL-2: Verifikasi `order_summary_screen.dart` — Guard Kurir Sudah Benar

**File**: `apps/customer/lib/features/order/presentation/screens/order_summary_screen.dart`

Berdasarkan code review, screen sudah memiliki guard `outlet.isCourierEnabled && cartState.canUseCourier` di beberapa titik (baris 60, 126, 200, 221, 255). Ini benar secara konsep.

**Langkah verifikasi**:

1. Cek baris 200: `if (!outlet.isCourierEnabled)` — pastikan semua widget kurir (address picker, pickup schedule, courier delivery section, ongkir kurir) benar-benar **tidak dirender** di sini.
2. Cek baris 126: pastikan listener normalisasi `pickupType` dan `deliveryType` ke `self_dropoff`/`pickup` dijalankan ketika `!outlet.isCourierEnabled`.
3. Pastikan baris 60 memaksa `orderCubit.setPickupType('self_dropoff')` atau `normalizeOrderStateForOutlet()` dipanggil.

Jika ada kondisi yang tidak konsisten, perbaiki agar **semua** tempat menggunakan guard yang sama dan konsisten.

---

### Task FL-3: Verifikasi Widget-Widget Kurir — Tidak Render Saat Courier Disabled

**File yang perlu dicek**:
- `apps/customer/lib/features/order/presentation/widgets/pickup_type_selector_widget.dart`
- `apps/customer/lib/features/order/presentation/widgets/delivery_type_selector_widget.dart`
- `apps/customer/lib/features/order/presentation/widgets/courier_pickup_section_widget.dart`
- `apps/customer/lib/features/order/presentation/widgets/courier_delivery_section_widget.dart`
- `apps/customer/lib/features/order/presentation/widgets/order_bottom_action_widget.dart`

**Langkah**:

Untuk setiap widget di atas:

1. Buka file dan cek apakah widget sudah menerima `isCourierEnabled` sebagai parameter.
2. Pastikan konten kurir (opsi Jemput Kurir, Antar Kurir, address picker, jadwal kurir, estimasi ongkir) tidak dirender ketika `isCourierEnabled = false`.
3. Jika widget belum ada guard, tambahkan. Contoh untuk `pickup_type_selector_widget.dart`:

```dart
// Jika outlet tidak support kurir, jangan render opsi 'courier'
if (isCourierEnabled) ...[
  // render courier option
]
```

---

### Task FL-4: Verifikasi `OrderCubit.createOrder()` — Normalisasi Payload

**File**: `apps/customer/lib/features/order/presentation/bloc/order_cubit.dart`

Cek method `createOrder()`:

1. Pastikan ketika `!isCourierEnabled`, payload yang dikirim ke backend adalah:
   - `pickupType: 'self_dropoff'`
   - `deliveryType: 'pickup'`
   - `paymentMethod: null` (opsional, tergantung flow)
   - Tidak ada `customerAddressId`
   - Tidak ada `pickupScheduleId`

2. Jika normalisasi belum ada, tambahkan guard di awal method:

```dart
Future<void> createOrder() async {
  final outlet = // ambil dari state atau OutletCubit
  final bool courierAvailable = outlet.isCourierEnabled;

  final String resolvedPickupType = courierAvailable ? state.pickupType : 'self_dropoff';
  final String resolvedDeliveryType = courierAvailable ? state.deliveryType : 'pickup';

  // Lanjutkan dengan resolvedPickupType dan resolvedDeliveryType
}
```

---

## Urutan Pengerjaan

1. **BE-6** → Verifikasi controller customer outlet, pastikan eager load `courierSetting` dan `outletFeatures.feature` sudah ada *(ini fundamental, harus dikerjakan dulu)*
2. **BE-1** → Fix fallback `isCourierEnabled` dari `true` ke `false` di `OutletResource`
3. **BE-2** → Fix key `courier_service` → `courier_schedule` di `isCourierActive` `OutletResource`
4. **BE-3** → Refactor `isCourierEnabled` agar gabungkan cek `isCourierActive` dan `courierSetting`
5. **BE-4** → Fix `firstOrCreate` default di `CourierSettingService`
6. **BE-5** → Perluas `validateOutletCourierStatus` untuk `deliveryType='delivery'`
7. **BE-7** → Verifikasi validasi `StoreCustomerOrderRequest` untuk `deliveryType`
8. **FL-2** → Verifikasi guard di `order_summary_screen.dart` sudah konsisten di semua tempat
9. **FL-3** → Verifikasi/perbaiki widget kurir agar tidak render saat courier disabled
10. **FL-1** → Tambahkan normalisasi state di `OrderCubit` saat outlet non-kurir
11. **FL-4** → Verifikasi payload `createOrder()` sudah benar saat courier disabled

---

## Acceptance Criteria

### Backend

- `GET /mobile/customer/outlets/{id}` untuk outlet baru tanpa aktivasi kurir mengembalikan `isCourierEnabled: false`.
- `GET /mobile/customer/outlets/{id}` untuk outlet yang sudah aktif kurir mengembalikan `isCourierEnabled: true`.
- `POST` order dengan `pickupType='courier'` saat outlet courier disabled → **ditolak 422**.
- `POST` order dengan `deliveryType='delivery'` saat outlet courier disabled → **ditolak 422**.
- `POST` order dengan `pickupType='self_dropoff'` + `deliveryType='pickup'` saat outlet courier disabled → **diterima**.
- Outlet dengan kurir aktif: flow jemput/antar tetap normal → **tidak ada regresi**.

### Frontend Customer

- Outlet baru/courier disabled: checkout hanya menampilkan flow self dropoff + self pickup.
- Tidak ada opsi "Jemput Kurir" ditampilkan.
- Tidak ada opsi "Antar Kurir" ditampilkan.
- Tidak ada address picker ditampilkan.
- Tidak ada jadwal pickup kurir ditampilkan.
- Tidak ada estimasi ongkir kurir ditampilkan.
- Outlet dengan kurir aktif: flow checkout kurir tetap normal → **tidak ada regresi**.

---

## Test Checklist

- [ ] Gunakan outlet baru yang belum pernah mengaktifkan fitur kurir.
- [ ] Hit endpoint detail outlet customer, pastikan `isCourierEnabled: false` di response.
- [ ] Buka checkout customer untuk outlet tersebut, pastikan hanya flow self dropoff/pickup yang tampil.
- [ ] Submit order dengan `pickupType='self_dropoff'` + `deliveryType='pickup'` → harus sukses.
- [ ] Paksa request dengan `pickupType='courier'` untuk outlet courier disabled → API harus reject 422.
- [ ] Paksa request dengan `deliveryType='delivery'` untuk outlet courier disabled → API harus reject 422.
- [ ] Uji outlet yang sudah aktif kurir dengan layanan yang support kurir → flow jemput/antar harus tetap normal.
- [ ] Pastikan issue `docs/issue/non_courier_checkout_flow_issue.md` tidak terpengaruh regresi.

---

## Hal yang Perlu Dicek Sebelum Eksekusi

1. **Eager load controller** — Temukan semua controller yang mereturn `OutletResource` untuk endpoint customer dan pastikan relasi `courierSetting` dan `outletFeatures.feature` sudah di-load. Ini kritis agar fix BE-1, BE-2, BE-3 bekerja.
2. **Key fitur kurir** — Konfirmasi key yang benar di `CourierFeatureSeeder.php` dan `OutletFeatureService.php`. Jika key berbeda dari `courier_schedule`, sesuaikan di BE-2 dan BE-3.
3. **Downstream effect `getByOutletId`** — Method `getByOutletId` di `CourierSettingService` dipanggil dari berbagai tempat (termasuk flow kasir, kurir, order backend). Perubahan default di BE-4 hanya mempengaruhi saat `firstOrCreate` (outlet baru). Pastikan tidak ada dampak ke flow lain.
4. **Relasi `outletFeatures` di customer outlet endpoint** — Jika relasi ini belum di-load di endpoint customer, `isCourierActive` dan `isCourierEnabled` (setelah BE-3) akan selalu `false` untuk semua outlet. Pastikan relasi ini di-load di controller customer.

---

## Keputusan Teknis

| Keputusan | Pilihan |
|---|---|
| Fallback `isCourierEnabled` saat courierSetting tidak ada | `false` (bukan `true`) |
| Key fitur kurir yang benar | `courier_schedule` (konfirmasi dari seeder) |
| `isCourierEnabled` gabungkan feature active + setting enabled | Ya |
| Default `firstOrCreate` courier setting outlet baru | `is_courier_enabled: false` |
| Guard `validateOutletCourierStatus` untuk `deliveryType` | Tolak `delivery` saat courier disabled |
| Normalisasi state Flutter saat outlet non-kurir | `pickupType='self_dropoff'`, `deliveryType='pickup'` |
| Perubahan contract API | Tidak ada field baru, hanya semantik `isCourierEnabled` yang diperbaiki |
