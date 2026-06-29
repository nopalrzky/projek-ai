# Production Pickup Schedule Accepted Empty Issue

Tanggal debug: 2026-06-11

Dokumen ini mencatat hasil debug untuk bug di aplikasi production pada tab "Siap Dijemput". Request aplikasi mengirim filter order `accepted` dengan tanggal pickup kurir, tetapi API mengembalikan list kosong walaupun data yang relevan ada di database.

## Gejala

Flutter mengirim request:

```text
GET /api/mobile/production/orders
status=accepted
outletIds=1
forCourierPickupDate=2026-06-11
sortBy=pickupSchedule
sortDirection=asc
perPage=100
```

Response API sukses, tetapi `data` kosong:

```json
{
  "success": true,
  "message": "Order list retrieved successfully",
  "data": [],
  "meta": {
    "total": 0
  }
}
```

Ekspektasi bisnis: ada order customer app yang sudah `accepted`, berada di outlet 1, dan punya jadwal pickup awal pada 2026-06-11.

## Area yang Dicek

- `apps/production/lib/features/order/presentation/bloc/order_cubit.dart`
- `apps/production/lib/features/order/data/datasources/order_remote_datasource.dart`
- `webapp/wash_wallet_be/routes/api_mobile_production.php`
- `webapp/wash_wallet_be/app/Http/Controllers/Api/OrderController.php`
- `webapp/wash_wallet_be/app/Services/OrderService.php`
- `webapp/wash_wallet_be/app/Models/Order.php`
- Database lokal `wash_wallet.orders`

## Alur Aktual

1. Tab "Siap Dijemput" memanggil `OrderCubit.getPickupSchedule(...)`.
2. Cubit mengirim `status=accepted`, `outletIds`, `forCourierPickupDate`, dan `sortBy=pickupSchedule`.
3. `OrderRemoteDatasource` mengirim `outletIds` sebagai CSV, contoh `outletIds=1`.
4. `OrderController::getFiltersFromRequest()` mem-parse `outletIds` dengan `parseOutletIds(...)`.
5. `OrderService::applyFilters()` menerapkan status, outlet ids, lalu `forCourierPickupDate`.
6. `Order::scopeForCourierPickupDate()` menerapkan filter tambahan:
   - `source = customer_app`
   - `delivery_type = pickup`
   - `pickup_schedule` pada tanggal terpilih atau overdue
7. Karena order yang relevan punya `delivery_type = delivery`, order terbuang sebelum response dibuat.

## Temuan Debug

Query bertahap pada database lokal untuk kasus `status=accepted`, `outlet_id=1`, `forCourierPickupDate=2026-06-11`:

```text
accepted_outlet_1=6
plus_source_customer_app=2
plus_delivery_pickup=0
plus_date_or_overdue=0
```

Contoh row yang relevan secara bisnis:

```json
{
  "id": 592,
  "order_number": "ORD-20260610-0001",
  "status": "accepted",
  "outlet_id": 1,
  "source": "customer_app",
  "delivery_type": "delivery",
  "pickup_schedule": "2026-06-11 08:00:00",
  "pickup_date": null,
  "deleted_at": null
}
```

Order ini cocok untuk "Siap Dijemput" karena pickup awal dilakukan kurir dari customer ke outlet pada 2026-06-11. Namun order tidak muncul karena `scopeForCourierPickupDate()` mewajibkan `delivery_type = pickup`.

Makna `delivery_type` di model saat ini:

- `pickup` berarti "Ambil di Outlet".
- `delivery` berarti "Diantar Kurir".

Jadi `delivery_type` adalah metode pengambilan/pengantaran akhir setelah produksi, bukan penanda bahwa pickup awal dari customer harus dilakukan kurir.

Test existing juga mengakui kombinasi ini valid: customer order dapat dibuat dengan `pickupType=courier` dan `deliveryType=delivery`, sehingga order punya pickup awal kurir tetapi pengantaran akhir juga kurir.

## Root Cause

Root cause utama: `Order::scopeForCourierPickupDate()` mencampur konsep pickup awal kurir dengan field `delivery_type` yang merepresentasikan metode delivery akhir.

Akibatnya, order customer app yang perlu dijemput kurir dari customer tetapi setelah selesai akan diantar kurir (`delivery_type=delivery`) tidak pernah muncul di daftar "Siap Dijemput".

## Risiko Tambahan

Flutter mengirim `sortBy=pickupSchedule`, tetapi `Order::scopeSortBy()` belum memasukkan `pickupSchedule` ke allowlist dan mapping kolom. Saat ini sort tersebut fallback ke `orderDate`.

Dampak secondary issue:

- Tidak menyebabkan list kosong.
- Namun urutan "Siap Dijemput" bisa tidak sesuai jadwal pickup.
- Request terlihat benar di log, tetapi backend diam-diam memakai sort lain.

## Arah Perbaikan yang Disarankan

1. Ubah `Order::scopeForCourierPickupDate()` agar tetap memfilter:
   - `source = customer_app`
   - `pickup_schedule` pada tanggal terpilih atau overdue
2. Hapus syarat `delivery_type = pickup` dari scope tersebut.
3. Pastikan order tanpa `pickup_schedule` tidak ikut masuk, karena itu merepresentasikan self pickup/self dropoff atau order tanpa jadwal pickup awal kurir.
4. Tambahkan `pickupSchedule` ke allowlist `scopeSortBy()` dan map ke kolom `pickup_schedule`.
5. Tambahkan feature test untuk endpoint `GET /api/mobile/production/orders`:
   - order `accepted`, `source=customer_app`, `delivery_type=delivery`, `pickup_schedule=2026-06-11 08:00:00` harus muncul.
   - order customer app tanpa `pickup_schedule` harus tidak muncul.
   - `sortBy=pickupSchedule&sortDirection=asc` harus mengurutkan berdasarkan `pickup_schedule`.

## Status

Debug selesai. Dokumen ini menjadi acuan implementasi perbaikan bug production pickup schedule.
