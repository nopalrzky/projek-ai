# Outlet Unconditional Free Shipping — Implementation Plan

Fitur ini memungkinkan outlet mengaktifkan **Gratis Ongkir Semua** tanpa syarat minimum order maupun jarak. Customer melihat badge di daftar outlet, detail outlet, dan discovery. Saat checkout, ongkir tampil sebagai `Rp 0` / Gratis. Backend tetap menjadi sumber kebenaran.

---

## Catatan Penting untuk AI Model Pelaksana

> [!IMPORTANT]
> **Sebelum menulis kode apapun, baca semua spec berikut:**
> - [cubit_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/cubit_spec.md)
> - [state_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/state_spec.md)
> - [usecase_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/usecase_spec.md)
> - [repository_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/repository_spec.md)
> - [repository_impl_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/repository_impl_spec.md)
> - [remote_datasource_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/remote_datasource_spec.md)

> [!IMPORTANT]
> **Aturan penulisan kode:**
> - Gunakan `context.colors.*`, `context.typography.*`, `context.space.*`, `context.radius.*` — **jangan hardcode warna atau angka**
> - Gunakan komponen shared dari `wash_wallet_ui` (`AppBadge`, `AppCard`, `AppChip`, dll.)
> - Pecah widget yang panjang ke file terpisah dalam folder `widgets/`
> - Tidak ada komentar di kode — clean code
> - Ikuti pola widget yang sudah ada: lihat [outlet_card.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/outlet/presentation/widgets/outlet_card.dart), [service_non_courier_badge_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/outlet/presentation/widgets/service_non_courier_badge_widget.dart), [discovery_service_badges_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/widgets/discovery_service_badges_widget.dart)

---

## Konteks Codebase

### Field yang sudah ada

**`Outlet` entity** ([outlet.dart](file:///C:/Bimo/Project/wash_wallet/packages/wash_wallet_domain/lib/src/entities/outlet.dart)) sudah memiliki:
- `hasFreeShipping` — field yang **sudah ada** tapi saat ini bersifat ambigu (bisa bersyarat atau tidak bersyarat)

**`DiscoveryService` entity** ([discovery_service.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/domain/entities/discovery_service.dart)) sudah memiliki:
- `outletHasFreeShipping` — sudah dipakai di `DiscoveryServiceBadgesWidget`

**`CourierSettingSummary` entity** ([courier_setting_summary.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/courier_pricing/domain/entities/courier_setting_summary.dart)) sudah memiliki:
- `freeShippingEnabled`, `minOrderFreeShipping` — field bersyarat yang perlu dibedakan

**`CourierPricingResult` entity** ([courier_pricing_result.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/courier_pricing/domain/entities/courier_pricing_result.dart)) sudah memiliki:
- `discountSource`, `customerPays`, `isFree` — sudah bisa membawa informasi sumber gratis ongkir

### Badge yang sudah tampil di `OutletCard`

Di [outlet_card.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/outlet/presentation/widgets/outlet_card.dart) baris 62–70, badge Gratis Ongkir **sudah tampil** menggunakan `outlet.hasFreeShipping`. Artinya frontend sudah siap — yang perlu dipastikan adalah field `hasFreeShipping` di `Outlet` entity benar-benar hanya `true` untuk **unconditional** free shipping.

---

## Analisis Perubahan yang Diperlukan

### Keputusan field

User need merekomendasikan dua opsi:
1. Tambah field baru `hasUnconditionalFreeShipping` di `Outlet` entity
2. Atau definisikan bahwa `hasFreeShipping` di `Outlet` **hanya** untuk unconditional

Pilihan yang diambil plan ini: **Tambah field `hasUnconditionalFreeShipping`** di `Outlet` entity agar tidak ambigu. Field `hasFreeShipping` yang lama tetap ada untuk kompatibilitas, namun badge hanya bergantung pada `hasUnconditionalFreeShipping`.

Untuk `CourierSettingSummary`, tambahkan `unconditionalFreeShippingEnabled` untuk membedakan dari `freeShippingEnabled` bersyarat.

---

## Proposed Changes

### Layer 1: Domain — Entity

---

#### [MODIFY] [outlet.dart](file:///C:/Bimo/Project/wash_wallet/packages/wash_wallet_domain/lib/src/entities/outlet.dart)

Tambahkan field `hasUnconditionalFreeShipping` di samping `hasFreeShipping` yang sudah ada. Field baru ini adalah sinyal badge yang aman untuk UI customer.

---

#### [MODIFY] [courier_setting_summary.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/courier_pricing/domain/entities/courier_setting_summary.dart)

Tambahkan field `unconditionalFreeShippingEnabled` untuk membedakan mode gratis ongkir semua dari gratis ongkir bersyarat minimum order.

---

#### [MODIFY] [discovery_service.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/domain/entities/discovery_service.dart)

Tambahkan field `outletHasUnconditionalFreeShipping` untuk discovery service card.

---

### Layer 2: Data — Model & Datasource

> [!NOTE]
> Model di data layer perlu ikut diperbarui agar bisa memetakan field baru dari JSON API. Ikuti pola `fromJson` yang sudah ada dan konversi via `toEntity()`.

---

#### [MODIFY] Model `Outlet` di data layer

Tambahkan parsing `hasUnconditionalFreeShipping` dari JSON response API (key: `has_unconditional_free_shipping` atau sesuai backend).

#### [MODIFY] Model `CourierSettingSummary` di data layer

Tambahkan parsing `unconditionalFreeShippingEnabled` dari JSON.

#### [MODIFY] Model `DiscoveryService` di data layer

Tambahkan parsing `outletHasUnconditionalFreeShipping` dari JSON.

---

### Layer 3: Presentation — Widget Baru & Modifikasi

---

#### [NEW] [outlet_free_shipping_badge_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/outlet/presentation/widgets/outlet_free_shipping_badge_widget.dart)

Widget badge reusable khusus Gratis Ongkir. Memisahkan badge dari `outlet_card.dart` agar bisa dipakai ulang di outlet info screen dan konteks lain.

```
OutletFreeShippingBadgeWidget
  └── AppBadge.success(
        label: 'Gratis Ongkir',
        icon: Icons.local_shipping_outlined,
        size: AppBadgeSize.sm,
        mode: AppBadgeMode.soft,
      )
```

Hanya tampil jika `hasUnconditionalFreeShipping == true`. Widget ini menjadi single source of truth tampilan badge.

---

#### [MODIFY] [outlet_card.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/outlet/presentation/widgets/outlet_card.dart)

Ganti kondisi `outlet.hasFreeShipping` dengan `outlet.hasUnconditionalFreeShipping`. Gunakan `OutletFreeShippingBadgeWidget` alih-alih inline `AppBadge`.

---

#### [MODIFY] [outlet_banner_header.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/outlet/presentation/widgets/outlet_banner_header.dart)

Tambahkan `OutletFreeShippingBadgeWidget` di bawah baris status buka/tutup jika `outlet.hasUnconditionalFreeShipping == true`. Badge perlu tampil di detail outlet (sebelum checkout).

---

#### [MODIFY] [outlet_info_screen.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/outlet/presentation/screens/outlet_info_screen.dart)

Tambahkan `OutletFreeShippingBadgeWidget` di bagian detail outlet (fungsi `_buildOutletDetails`). Badge harus tampil sebelum customer membuka checkout.

---

#### [MODIFY] [discovery_service_badges_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/widgets/discovery_service_badges_widget.dart)

Ganti kondisi `service.outletHasFreeShipping` dengan `service.outletHasUnconditionalFreeShipping` agar badge hanya tampil untuk unconditional free shipping.

---

#### [MODIFY] [courier_fee_breakdown_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/order/presentation/widgets/courier_fee_breakdown_widget.dart)

Saat `result.discountSource == 'outlet_free_shipping_all'` (atau nilai yang disepakati backend), tampilkan label yang lebih informatif: **"Gratis Ongkir Outlet"** alih-alih nama source mentah.

---

#### [NEW] [outlet_free_shipping_info_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/order/presentation/widgets/outlet_free_shipping_info_widget.dart)

Widget info banner kecil di halaman order summary yang memberi tahu customer bahwa outlet menanggung ongkir. Tampil di antara `OutletInfoCardWidget` dan daftar layanan jika `outlet.hasUnconditionalFreeShipping == true` dan kurir aktif.

```
OutletFreeShippingInfoWidget
  └── Container (warna successSurface, border success soft)
        ├── Icon(Icons.local_shipping_outlined, color: success)
        └── Text('Outlet ini menanggung ongkir untuk semua order kurir')
```

---

#### [MODIFY] [order_summary_screen.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/order/presentation/screens/order_summary_screen.dart)

Tambahkan `OutletFreeShippingInfoWidget` di blok content outlet yang aktif kurir (`outlet.isCourierEnabled && canUseCourier`), setelah `OutletInfoCardWidget`.

---

#### [MODIFY] [order_detail_pricing_summary_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/order/presentation/widgets/order_detail_pricing_summary_widget.dart)

Saat `order.pickupFee == 0 && order.deliveryFee == 0`, tampilkan baris ongkir dengan label **"Gratis"** dan warna `context.colors.success` untuk kejelasan visual. Jika order memiliki metadata sumber gratis ongkir, tampilkan catatan kecil.

---

### Layer 4: CourierSettingSummary — Tampilan Informatif

---

#### [MODIFY] [courier_fee_estimate_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/order/presentation/widgets/courier_fee_estimate_widget.dart)

Tidak ada perubahan logika. Widget ini sudah menampilkan `AppBadge.success(label: 'GRATIS')` saat `result.isFree`. Pastikan label `discountSource` yang ditampilkan di breakdown mudah dibaca.

---

## Verification Plan

### Manual Verification

1. Buka daftar outlet — outlet yang `hasUnconditionalFreeShipping = true` menampilkan badge Gratis Ongkir.
2. Buka detail outlet (`ShowOutletScreen` → `OutletBannerHeader`) — badge tetap tampil.
3. Buka halaman info outlet (`OutletInfoScreen`) — badge tampil di bagian detail.
4. Buka discovery — service dari outlet dengan unconditional free shipping menampilkan badge.
5. Checkout dengan outlet yang aktif gratis ongkir semua:
   - Banner info muncul sebelum memilih metode kurir.
   - Estimasi ongkir menampilkan GRATIS.
   - Breakdown menampilkan "Gratis Ongkir Outlet".
6. Outlet yang hanya punya gratis ongkir bersyarat (min order) **tidak** menampilkan badge.
7. Outlet tanpa kurir tetap tidak masuk alur kurir meskipun punya setting gratis ongkir.

### Automated Tests (Opsional)

- Unit test entity: `hasUnconditionalFreeShipping` hanya true jika field backend true.
- Widget test: `OutletFreeShippingBadgeWidget` hanya render saat prop true.

---

## Open Questions

> [!IMPORTANT]
> **Konfirmasi dengan backend:**
> 1. Nama field JSON yang digunakan backend untuk unconditional free shipping di response outlet: `has_unconditional_free_shipping` atau nama lain?
> 2. Nilai `discountSource` yang dikirim backend saat outlet mengaktifkan gratis ongkir semua: `outlet_free_shipping_all` atau nama lain?
> 3. Apakah field `hasUnconditionalFreeShipping` sudah tersedia di API outlet customer (GET /outlets), atau perlu koordinasi dengan backend terlebih dahulu?
>
> **Jika backend belum siap:** Frontend hanya perlu menambahkan field entity dan widget — kondisi badge cukup `false` sampai backend mengirim flag. Tidak ada perubahan breaking pada widget yang ada.
