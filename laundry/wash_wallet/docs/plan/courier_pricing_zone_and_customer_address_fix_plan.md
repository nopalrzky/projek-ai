# Implementation Plan: Courier Pricing Zone Bug Fix & Customer Address Integration

**Tanggal:** 2026-06-18  
**Referensi Issue:** `apps/customer/issue.md`, `docs/issue/issue.md`  
**Status Codebase Saat Ini:** Perbaikan _sudah ada_ di kode namun belum divalidasi dengan test

---

## Ringkasan

Dokumen ini mencakup dua issue sekaligus:

1. **Courier Pricing Zone Bug** — Harga kurir yang menggunakan metode `zone_based` selalu fallback ke `default_price` / `flat_fee` karena: (a) frontend mengirim key `addressId` sedangkan backend mengekspektasikan `customerAddressId`, dan (b) backend mengirim `null` hardcode ke `pricingEngine->calculate()`.

2. **Integrasi Customer Address pada Alur Order** — Belum ada mekanisme pemilihan alamat customer di alur order summary dan flow pemilihan jadwal kurir.

Berdasarkan review codebase saat ini, **kedua perbaikan sudah diimplementasikan**. Yang masih dibutuhkan adalah: verifikasi komprehensif melalui backend test, memastikan konsistensi data flow dari frontend ke backend, dan beberapa edge case yang perlu ditutup.

---

## Status Perbaikan Saat Ini

### 1. Courier Pricing Zone Bug (Backend)

| Komponen | Status | Lokasi |
|---|---|---|
| `CalculateDeliveryFeeRequest.php` — validasi `customerAddressId` | Sudah diperbaiki | `app/Http/Requests/Courier/CalculateDeliveryFeeRequest.php` |
| `CourierSettingService::calculateDeliveryFee()` — fetch `$address` dari DB | Sudah diperbaiki | `app/Services/CourierSettingService.php:232-235` |
| `CourierPricingEngine::calculateZoneBased()` — menggunakan `$address` | Sudah benar | `app/Services/CourierPricingEngine.php:200-243` |
| Backend Test untuk endpoint `calculateFee` dengan `customerAddressId` | **Belum ada** | — |

### 2. Courier Pricing Zone Bug (Frontend)

| Komponen | Status | Lokasi |
|---|---|---|
| `CourierPricingRemoteDatasourceImpl.calculateFee()` — key `customerAddressId` | Sudah diperbaiki | `apps/customer/lib/features/courier_pricing/data/datasources/courier_pricing_remote_datasource.dart:42` |

### 3. Integrasi Customer Address (Frontend)

| Komponen | Status | Lokasi |
|---|---|---|
| `OrderSummaryScreen` — memuat semua alamat via `CustomerAddressListCubit` | Sudah ada | `apps/customer/lib/features/order/presentation/screens/order_summary_screen.dart:66` |
| `OrderSummaryScreen` — auto-select alamat `isPrimary` | Sudah ada | `order_summary_screen.dart:101-113` |
| `OrderSummaryScreen` — trigger kalkulasi fee saat alamat berubah | Sudah ada | `order_summary_screen.dart:249-299` |
| `CourierPickupSectionWidget` — address card clickable + bottom sheet selector | Sudah ada | `apps/customer/lib/features/order/presentation/widgets/courier_pickup_section_widget.dart` |
| `AddressSelectorBottomSheet` — list alamat customer + navigasi ke create | Sudah ada | `apps/customer/lib/features/order/presentation/widgets/address_selector_bottom_sheet.dart` |
| `CourierScheduleRemoteDatasourceImpl` — menggunakan `_endpoints.courierSchedules` (bukan nested route) | Sudah diperbaiki | `apps/customer/lib/features/courier_schedule/data/datasources/courier_schedule_remote_datasource.dart:38` |

---

## Gap yang Masih Perlu Diselesaikan

### Gap 1 — Tidak Ada Backend Test untuk `calculateFee` Endpoint dengan `customerAddressId`

Test yang sudah ada di `CourierPricingEngineTest.php` hanya menguji `CourierPricingEngine` secara unit (langsung memanggil `$engine->calculate()`). Tidak ada integration test untuk endpoint HTTP `GET /courier-settings/{outletId}/calculate-fee` yang memastikan:
- Parameter `customerAddressId` tervalidasi dengan benar
- `CustomerAddress` berhasil di-fetch dan diteruskan ke engine
- Zona pricing benar-benar digunakan dalam response HTTP

### Gap 2 — `CourierDeliverySectionWidget` Tidak Menampilkan Alamat

`CourierDeliverySectionWidget` hanya menampilkan **estimasi ongkir pengantaran** tanpa menampilkan **alamat tujuan pengantaran**. Meskipun alamat sudah dipilih di bagian pickup, bagian delivery tidak memperlihatkan alamat tersebut secara eksplisit kepada user.

### Gap 3 — `DeliveryScheduleScreen` Tidak Mengintegrasikan Customer Address Selector

`DeliveryScheduleScreen` (untuk jadwal pengantaran baju bersih setelah order accepted) menampilkan `_buildAddressSection` yang sifatnya **read-only** — hanya menampilkan `order.deliveryAddress` string dari data order. Tidak ada mekanisme untuk user mengubah/memilih alamat pengantaran di screen ini.

### Gap 4 — `scheduleDelivery` di `OrderCubit` Tidak Mengirim `customerAddressId`

Method `OrderCubit.scheduleDelivery()` tidak mengirimkan `customerAddressId` ke backend. Jika backend membutuhkan alamat saat menjadwalkan pengiriman, ini bisa menjadi issue.

---

## Perubahan yang Diperlukan

---

### A. Backend — Test Coverage (Prioritas Tinggi)

#### [NEW] `tests/Feature/Api/CourierCalculateFeeApiTest.php`

Buat test untuk endpoint `GET /api/mobile/customer/courier-settings/{outletId}/calculate-fee` yang mencakup skenario berikut:

1. **Test zone-based pricing dengan `customerAddressId` yang valid** — memastikan response menggunakan harga zona, bukan `default_price`.
2. **Test zone-based pricing tanpa `customerAddressId`** — memastikan response fallback ke `default_price`.
3. **Test zone-based pricing dengan `customerAddressId` yang tidak cocok zona mana pun** — memastikan response menggunakan `default_price`.
4. **Test validasi `customerAddressId` yang tidak valid** — memastikan response 422.

Gunakan pattern yang sama dengan `CourierScheduleApiTest.php` untuk setup autentikasi customer.

Contoh struktur test:

```php
<?php

namespace Tests\Feature\Api;

use App\Models\CourierPricingZone;
use App\Models\CourierSetting;
use App\Models\CustomerAddress;
use App\Models\Outlet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourierCalculateFeeApiTest extends TestCase
{
    use RefreshDatabase;

    private $customer;
    private $customerToken;
    private Outlet $outlet;
    private CourierSetting $setting;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup customer auth, outlet, courierSetting
        // Gunakan factory atau PestHelper
    }

    public function test_zone_based_pricing_returns_zone_fee_when_address_matches(): void
    {
        // Arrange: buat zona dengan district_id tertentu
        // Arrange: buat CustomerAddress dengan district_id yang sama
        // Act: GET /courier-settings/{outletId}/calculate-fee?customerAddressId=...
        // Assert: response->data->calculationSource === 'zone'
        // Assert: response->data->finalFee === zona->fee
    }

    public function test_zone_based_pricing_returns_default_price_when_no_address_provided(): void
    {
        // Act tanpa customerAddressId
        // Assert: calculationSource === 'default_price'
    }

    public function test_zone_based_pricing_returns_default_price_when_address_not_in_any_zone(): void
    {
        // Arrange: CustomerAddress dengan district_id berbeda dari zona yang terdaftar
        // Assert: calculationSource === 'default_price'
    }

    public function test_returns_422_when_customerAddressId_is_invalid(): void
    {
        // Act dengan customerAddressId=99999 (tidak ada di DB)
        // Assert: status 422
    }
}
```

---

### B. Frontend — Penyempurnaan UI (Prioritas Medium)

#### [MODIFY] `apps/customer/lib/features/order/presentation/widgets/courier_delivery_section_widget.dart`

Tambahkan tampilan alamat tujuan pengantaran (baca dari `OrderState.selectedAddress`) di bawah estimasi ongkir, agar user mengetahui ke mana baju bersih akan diantar.

Tampilan yang diusulkan:
- Row dengan icon `location_on_outlined` dan teks label + street dari `selectedAddress`
- Hanya ditampilkan jika `selectedAddress != null`
- Diletakkan di bawah baris ongkir di dalam `AppCard` yang sudah ada

```dart
// Tambahkan di dalam Column setelah baris ongkir:
BlocBuilder<OrderCubit, OrderState>(
  builder: (context, orderState) {
    final address = orderState.selectedAddress;
    if (address == null) return const SizedBox.shrink();
    return Padding(
      padding: EdgeInsets.only(top: context.space.sm),
      child: Row(
        children: [
          Icon(
            Icons.location_on_outlined,
            size: 14,
            color: context.colors.textSecondary,
          ),
          const SizedBox(width: 4),
          Expanded(
            child: Text(
              '${address.label} — ${address.street}',
              style: context.typography.bodySmall.copyWith(
                color: context.colors.textSecondary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  },
),
```

#### [MODIFY] `apps/customer/lib/features/order/presentation/screens/delivery_schedule_screen.dart`

Perbaiki `_buildAddressSection` agar menampilkan teks yang lebih informatif bahwa alamat pengiriman mengikuti alamat pickup yang dipilih di layar sebelumnya.

Perubahan minimal yang direkomendasikan:
- Ubah deskripsi teks menjadi: `"Pesanan akan diantar ke alamat yang dipilih saat checkout."`
- Pertimbangkan untuk mengintegrasikan `CustomerAddressListCubit` dan menampilkan label + street alamat yang sesungguhnya (bukan hanya string `order.deliveryAddress`) jika data tersedia.

---

## Alur Data yang Diverifikasi (Referensi)

```
Customer App (Flutter)
  OrderSummaryScreen.initState()
    CustomerAddressListCubit.getAll()
    CourierPricingCubit.getSettingSummary(outletId)

  BlocListener<CustomerAddressListCubit>
    OrderCubit.selectAddress(primaryAddress)
      _triggerFeeCalculation()
        CourierPricingCubit.calculateFee(
          outletId, latitude, longitude,
          customerId, addressId  <-- dari selectedAddress.id
        )
          CourierPricingRemoteDatasourceImpl.calculateFee(
            customerAddressId: addressId  <-- key yang benar
          )

Backend (Laravel)
  GET /api/mobile/customer/courier-settings/{outletId}/calculate-fee
    CalculateDeliveryFeeRequest.rules()
      validates: customerAddressId (nullable|integer|exists:customer_addresses,id)
    CourierSettingController.calculateFee()
      CourierSettingService.calculateDeliveryFee($outletId, $validated)
        fetch: $address = CustomerAddress::find($data['customerAddressId'])
        CourierPricingEngine.calculate($setting, $distanceKm, ..., $address)
          calculateZoneBased($setting, $address, ...)
            match village_id  -> zone fee
            match district_id -> zone fee
            fallback          -> default_price
```

---

## Rencana Verifikasi

### Automated Tests (Backend)

```bash
# Jalankan test courier pricing engine yang sudah ada
php artisan test tests/Feature/CourierPricingEngineTest.php

# Jalankan test baru setelah dibuat
php artisan test tests/Feature/Api/CourierCalculateFeeApiTest.php
```

### Manual Verification (Checklist)

- [ ] Buat outlet dengan `pricing_method = zone_based` dan tambahkan zona kecamatan
- [ ] Buat customer address dengan `district_id` yang cocok dengan zona tersebut
- [ ] Di customer app: Order Summary -> pastikan alamat primary terseleksi otomatis
- [ ] Pastikan estimasi ongkir menampilkan harga zona (bukan `default_price`)
- [ ] Klik card alamat -> pastikan bottom sheet terbuka dengan daftar alamat
- [ ] Pilih alamat berbeda -> pastikan ongkir direcalculate dengan alamat baru
- [ ] Pilih tanggal pickup -> pastikan `CourierScheduleCubit.getAll()` dipanggil dengan `outletId` sebagai query param (bukan nested URL)
- [ ] Di bagian delivery -> verifikasi alamat tujuan pengantaran tampil dengan benar

---

## File yang Diubah (Ringkasan)

### Backend

| Status | File | Keterangan |
|---|---|---|
| NEW | `tests/Feature/Api/CourierCalculateFeeApiTest.php` | Integration test untuk endpoint calculate-fee dengan customerAddressId |

### Frontend (Customer App)

| Status | File | Keterangan |
|---|---|---|
| MODIFY | `apps/customer/lib/features/order/presentation/widgets/courier_delivery_section_widget.dart` | Tambahkan tampilan alamat tujuan pengantaran |
| MODIFY | `apps/customer/lib/features/order/presentation/screens/delivery_schedule_screen.dart` | Perbaiki klarifikasi teks alamat pengiriman |

> **Catatan:** Semua file lain yang disebutkan dalam tabel "Status Perbaikan" sudah dalam keadaan benar dan tidak perlu diubah.

---

## Prioritas Pengerjaan

1. **[WAJIB]** `CourierCalculateFeeApiTest.php` — Backend test untuk membuktikan bug fix benar-benar berfungsi end-to-end
2. **[DIREKOMENDASIKAN]** `courier_delivery_section_widget.dart` — Tambahkan info alamat tujuan delivery agar UX lebih jelas
3. **[OPSIONAL]** `delivery_schedule_screen.dart` — Klarifikasi teks alamat (minimal), atau full address selector sebagai task terpisah jika dibutuhkan
