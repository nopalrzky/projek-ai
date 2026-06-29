~# Issue: Checkout Customer Menampilkan Kurir Saat Outlet Baru Belum Aktif

## Status

Open

## Ringkasan Masalah

Pada flow checkout customer, outlet baru atau outlet yang fitur kurirnya belum aktif masih bisa terlihat sebagai outlet yang mendukung kurir. Akibatnya customer melihat opsi:

- `Jemput Kurir`
- `Antar Kurir`
- pilihan alamat customer
- pilihan jadwal pickup kurir
- estimasi ongkir kurir

Padahal untuk outlet yang belum mengaktifkan fitur kurir, flow checkout seharusnya selalu menjadi:

- Pengambilan baju kotor: customer antar sendiri ke outlet.
- Pengantaran baju bersih: customer ambil sendiri di outlet.
- Tidak ada alamat customer.
- Tidak ada jadwal pickup kurir.
- Tidak ada ongkir pickup/delivery kurir.

Issue ini berbeda dari `docs/issue/non_courier_checkout_flow_issue.md`. Issue lama membahas layanan yang tidak support kurir di outlet yang bisa saja sudah aktif kurir. Issue ini khusus outlet baru, outlet tanpa `courier_settings`, atau outlet dengan courier setting disabled.

## Dampak

Customer bisa mengira outlet baru sudah menyediakan pickup/delivery kurir, lalu memilih opsi yang seharusnya belum tersedia. Ini berpotensi menghasilkan order dengan data kurir yang tidak valid atau flow checkout yang membingungkan.

## Dugaan Root Cause

### 1. OutletResource menganggap missing courier setting sebagai enabled

File: `webapp/wash_wallet_be/app/Http/Resources/Outlet/OutletResource.php`

Field `isCourierEnabled` saat ini mengembalikan `true` ketika relasi `courierSetting` tidak ada atau tidak loaded:

```php
'isCourierEnabled' => $this->relationLoaded('courierSetting') && $this->courierSetting
    ? (bool) $this->courierSetting->is_courier_enabled
    : true,
```

Untuk contract customer-facing, missing courier setting harus dianggap `false`, bukan `true`.

### 2. Key fitur kurir tidak konsisten

File: `webapp/wash_wallet_be/app/Http/Resources/Outlet/OutletResource.php`

`isCourierActive` mengecek feature key `courier_service`, sementara seeder dan aktivasi fitur memakai `courier_schedule`.

File terkait:

- `webapp/wash_wallet_be/database/seeders/CourierFeatureSeeder.php`
- `webapp/wash_wallet_be/app/Services/OutletFeatureService.php`
- `webapp/wash_wallet_be/app/Services/OutletService.php`

Perlu dipastikan key yang dipakai resource sama dengan key fitur yang benar-benar dibuat dan di-unlock.

### 3. Default courier setting masih enabled

File: `webapp/wash_wallet_be/app/Services/CourierSettingService.php`

`getByOutletId` memakai:

```php
firstOrCreate(
    ['outlet_id' => $outletId],
    ['is_courier_enabled' => true]
)
```

File: `webapp/wash_wallet_be/database/migrations/2026_04_29_164242_create_courier_settings_table.php`

Kolom `courier_settings.is_courier_enabled` juga memiliki default `true`.

Untuk aturan produk saat ini, outlet baru harus dianggap courier disabled sampai fitur kurir benar-benar diaktifkan.

### 4. Checkout frontend hanya mengikuti `outlet.isCourierEnabled`

File: `apps/customer/lib/features/order/presentation/screens/order_summary_screen.dart`

Section kurir dirender ketika:

```dart
outlet.isCourierEnabled && cartState.canUseCourier
```

Guard ini benar secara konsep, tetapi nilai `outlet.isCourierEnabled` dari backend saat ini bisa salah `true` untuk outlet baru atau missing courier setting. Akibatnya UI tetap menampilkan pilihan kurir.

File terkait:

- `apps/customer/lib/features/order/presentation/widgets/pickup_type_selector_widget.dart`
- `apps/customer/lib/features/order/presentation/widgets/delivery_type_selector_widget.dart`
- `apps/customer/lib/features/order/presentation/widgets/courier_pickup_section_widget.dart`
- `apps/customer/lib/features/order/presentation/widgets/courier_delivery_section_widget.dart`
- `apps/customer/lib/features/order/presentation/widgets/order_bottom_action_widget.dart`

### 5. Default state order masih mode kurir

File: `apps/customer/lib/features/order/presentation/bloc/order_state.dart`

Default state:

```dart
pickupType = 'courier'
deliveryType = 'delivery'
```

File: `apps/customer/lib/features/order/presentation/bloc/order_cubit.dart`

`OrderCubit.createOrder` sudah mencoba menormalisasi order menjadi self dropoff/self pickup ketika courier tidak efektif enabled. Namun UI state tetap bisa berada di mode kurir sebelum normalisasi, terutama jika backend mengirim `isCourierEnabled=true` secara salah.

### 6. Validasi backend order belum lengkap untuk delivery kurir

File: `webapp/wash_wallet_be/app/Services/OrderService.php`

Backend sudah memiliki guard untuk `pickupType='courier'` melalui `validateOutletCourierStatus`, tetapi scope guard perlu diperluas agar request dengan `deliveryType='delivery'` juga ditolak ketika outlet courier disabled atau missing courier setting.

## Contract yang Diharapkan

Tetap gunakan field existing:

```json
{
  "isCourierEnabled": false
}
```

Semantik yang diharapkan:

- `isCourierEnabled=false` jika `courierSetting` belum ada.
- `isCourierEnabled=false` jika `courierSetting.is_courier_enabled=false`.
- `isCourierEnabled=false` jika fitur kurir outlet belum aktif, meskipun setting row ada.
- `isCourierEnabled=true` hanya jika fitur kurir outlet aktif dan courier setting enabled.

Tidak perlu menambah field request baru dari mobile customer.

## Scope Perbaikan yang Direkomendasikan

### Backend

- Ubah `OutletResource` agar missing `courierSetting` tidak pernah dianggap enabled.
- Samakan key pengecekan fitur kurir dengan feature key yang benar, kemungkinan `courier_schedule`.
- Review default `firstOrCreate` courier setting agar outlet baru tidak otomatis enabled.
- Review migration default `is_courier_enabled=true`; jika tidak bisa diubah untuk data lama, minimal pastikan API customer-facing tetap mengembalikan `false` sampai fitur aktif.
- Perluas validasi `OrderService::storeCustomer` agar courier disabled/missing menolak:
  - `pickupType='courier'`
  - `deliveryType='delivery'`
- Pastikan kombinasi `pickupType='self_dropoff'` dan `deliveryType='pickup'` tetap diterima.

### Frontend Customer

- Pastikan checkout hanya menampilkan flow kurir ketika:
  - `outlet.isCourierEnabled == true`
  - `cartState.canUseCourier == true`
- Ketika outlet courier disabled/missing, UI harus dipaksa ke:
  - `pickupType='self_dropoff'`
  - `deliveryType='pickup'`
- Tidak boleh menampilkan address picker, pickup schedule, delivery courier section, atau ongkir kurir jika outlet tidak aktif kurir.

## Acceptance Criteria

- Outlet baru tanpa aktivasi kurir:
  - `/mobile/customer/outlets/{id}` mengembalikan `isCourierEnabled=false`.
  - Checkout hanya menampilkan self dropoff dan self pickup.
  - Tidak ada opsi `Jemput Kurir`.
  - Tidak ada opsi `Antar Kurir`.
  - Tidak ada address picker.
  - Tidak ada pickup schedule.
  - Tidak ada estimasi ongkir kurir.
- API order:
  - Reject `pickupType='courier'` saat courier disabled atau missing.
  - Reject `deliveryType='delivery'` saat courier disabled atau missing.
  - Accept `pickupType='self_dropoff'` dan `deliveryType='pickup'`.
- Regression:
  - Outlet yang fitur kurirnya sudah aktif dan semua layanan mendukung kurir tetap bisa memakai flow jemput/antar.
  - Issue `docs/issue/non_courier_checkout_flow_issue.md` tetap relevan untuk kasus layanan non-kurir.

## Test Checklist

- Buat atau gunakan outlet baru yang belum pernah mengaktifkan fitur kurir.
- Hit endpoint detail outlet customer dan pastikan `isCourierEnabled=false`.
- Buka checkout customer untuk outlet tersebut.
- Pastikan hanya flow datang ke outlet/ambil sendiri yang tampil.
- Submit order dengan payload self dropoff/self pickup dan pastikan sukses.
- Coba paksa payload `pickupType='courier'` untuk outlet courier disabled dan pastikan API reject.
- Coba paksa payload `deliveryType='delivery'` untuk outlet courier disabled dan pastikan API reject.
- Uji outlet yang sudah aktif kurir dengan layanan yang support kurir dan pastikan flow jemput/antar tetap normal.

## File yang Perlu Dicek Agent Berikutnya

- `webapp/wash_wallet_be/app/Http/Resources/Outlet/OutletResource.php`
- `webapp/wash_wallet_be/app/Services/CourierSettingService.php`
- `webapp/wash_wallet_be/app/Services/OrderService.php`
- `webapp/wash_wallet_be/app/Services/OutletFeatureService.php`
- `webapp/wash_wallet_be/app/Services/OutletService.php`
- `webapp/wash_wallet_be/database/migrations/2026_04_29_164242_create_courier_settings_table.php`
- `webapp/wash_wallet_be/database/seeders/CourierFeatureSeeder.php`
- `apps/customer/lib/features/order/presentation/screens/order_summary_screen.dart`
- `apps/customer/lib/features/order/presentation/bloc/order_state.dart`
- `apps/customer/lib/features/order/presentation/bloc/order_cubit.dart`
- `apps/customer/lib/features/order/presentation/widgets/order_bottom_action_widget.dart`
- `apps/customer/lib/features/order/presentation/widgets/pickup_type_selector_widget.dart`
- `apps/customer/lib/features/order/presentation/widgets/delivery_type_selector_widget.dart`

## Assumptions

- Product rule saat ini: outlet baru harus courier disabled sampai fitur kurir benar-benar diaktifkan.
- Customer-facing source of truth cukup memakai field existing `isCourierEnabled`.
- Implementasi lanjutan akan dikerjakan agent lain; dokumen ini hanya menjadi referensi debug dan scope perbaikan.
