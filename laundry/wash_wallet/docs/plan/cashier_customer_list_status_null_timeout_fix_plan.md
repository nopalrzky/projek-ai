# Plan: Cashier Customer List `Status: null` Timeout Fix

**Source Issue:** `docs/issue/cashier_customer_list_status_null_timeout_issue.md`  
**Created:** 2026-06-18  
**Status:** Ready for implementation

---

## Overview

Issue ini terjadi ketika cashier app menampilkan log `Status: null` saat request customer list.
Root cause adalah kombinasi dari tiga hal:

1. **Backend** mengirimkan payload terlalu besar (eager-load `orders` + `orders.orderItems` yang tidak diperlukan list UI).
2. **Client** retry tidak berfungsi karena datasource sudah mengubah `DioException` menjadi `NetworkException` sebelum repository melihatnya.
3. **Logging** tidak cukup informatif sehingga jenis error (timeout, connection error, dll) tidak bisa dibedakan dari log.

---

## Target Files

### Backend (PHP / Laravel)

| File | Perubahan |
|------|-----------|
| `webapp/wash_wallet_be/app/Http/Controllers/Api/CustomerController.php` | Ubah relasi `index()`: hapus `orders` dan `orders.orderItems`, gunakan `withCount` |
| `webapp/wash_wallet_be/app/Services/CustomerService.php` | Implementasi parameter `$withCounts` di `getAll()` |
| `webapp/wash_wallet_be/app/Http/Resources/Customer/CustomerResource.php` | Gunakan `orders_count`, `membership_contracts_count`, `customer_subscriptions_count` dari `withCount` |

### Flutter / Dart

| File | Perubahan |
|------|-----------|
| `packages/wash_wallet_core/lib/src/network/interceptors/logging_interceptor.dart` | Tambah log: `DioException.type`, `err.error`, full URI + query params, elapsed duration, redact header `Authorization` |
| `apps/cashier/lib/features/customer/data/datasources/customer_remote_datasource.dart` | Tambah retry internal di `getAll()` sebelum konversi exception |

---

## Step-by-Step Implementation

### Step 1 — Backend: Optimalkan Customer List Endpoint

**File:** `webapp/wash_wallet_be/app/Http/Controllers/Api/CustomerController.php`

**Masalah saat ini (index method):**

```php
$customers = $this->customerService->getAll(
    filters: $filters,
    page: $filters['page'],
    perPage: $filters['perPage'],
    relations: [
        'outlet',
        'orders',              // TIDAK diperlukan list UI
        'membershipContracts', // diperlukan untuk count saja - bisa diganti withCount
        'orders.orderItems',   // TIDAK diperlukan list UI, sangat berat
    ],
);
```

**Perubahan yang diperlukan di `index()`:**
- Hapus `'orders'` dan `'orders.orderItems'` dari array `relations`.
- Tetap sertakan `'outlet'` untuk display nama outlet.
- Hapus `'membershipContracts'` dari `relations` (count akan didapat via `withCount`).
- Tambahkan parameter `withCounts` untuk memberitahu service menggunakan query count ringan.

```php
// Target code setelah perubahan
$customers = $this->customerService->getAll(
    filters: $filters,
    page: $filters['page'],
    perPage: $filters['perPage'],
    relations: ['outlet'],
    withCounts: ['orders', 'membershipContracts', 'customerSubscriptions'],
);
```

> **Catatan:** `getFilters()` sudah mengembalikan `'withCounts' => true`, tapi nilai tersebut belum digunakan oleh service. Step 2 akan menambahkan dukungannya via parameter eksplisit.

---

### Step 2 — Backend: Implementasi `withCount` di CustomerService

**File:** `webapp/wash_wallet_be/app/Services/CustomerService.php`

**Perubahan signature `getAll()`:**  
Tambahkan parameter `array $withCounts = []` pada method `getAll()`:

```php
public function getAll(
    array $filters = [],
    ?int $page = null,
    ?int $perPage = null,
    array $relations = ['outlet'],
    array $withCounts = []    // tambah parameter baru
): LengthAwarePaginator|Collection {
    try {
        $query = $this->customer->query();

        $this->applyTenantScope($query);
        $this->applyFilters($query, $filters);

        if (!empty($relations)) {
            $query->with($relations);
        }

        // Gunakan withCount untuk count tanpa load full collection
        if (!empty($withCounts)) {
            $query->withCount($withCounts);
        }

        return $this->paginate($query, $perPage, $page);
    } catch (Exception $e) {
        Log::error('Failed to get customers', [
            'filters' => $filters,
            'error'   => $e->getMessage(),
            'user_id' => Auth::id(),
            'type'    => 'customer_service_error',
        ]);
        throw $e;
    }
}
```

**Catatan implementasi:**
- `withCount(['orders'])` akan menghasilkan kolom `orders_count` pada model result.
- Ini jauh lebih ringan daripada me-load seluruh relasi `orders` lalu menghitung `->count()`.
- Key `'withCounts' => true` di dalam `$filters` yang diset oleh `getFilters()` bisa dibiarkan — tidak berpengaruh karena service sekarang menggunakan parameter eksplisit `$withCounts`.

---

### Step 3 — Backend: Update CustomerResource untuk Pakai `withCount`

**File:** `webapp/wash_wallet_be/app/Http/Resources/Customer/CustomerResource.php`

**Masalah saat ini:**

```php
'ordersCount' => $this->whenLoaded('orders', fn() => $this->orders?->count() ?? 0),
'customerSubscriptionsCount' => $this->whenLoaded('customerSubscriptions', fn() => $this->customerSubscriptions?->count() ?? 0),
'membershipContractsCount' => $this->whenLoaded('membershipContracts', fn() => $this->membershipContracts?->count() ?? 0),
```

Count hanya muncul jika relasi ter-load. Jika relasi tidak di-load (setelah perubahan Step 1), count menjadi `null` di response, padahal field ini dibutuhkan oleh Flutter `CustomerModel`.

**Perubahan yang diperlukan:**  
Ganti logika count agar memprioritaskan hasil `withCount` (kolom `*_count` di model Eloquent), dan fallback ke koleksi ter-load jika ada:

```php
'ordersCount' => $this->orders_count
    ?? $this->whenLoaded('orders', fn() => $this->orders?->count() ?? 0, 0),

'customerSubscriptionsCount' => $this->customer_subscriptions_count
    ?? $this->whenLoaded('customerSubscriptions', fn() => $this->customerSubscriptions?->count() ?? 0, 0),

'membershipContractsCount' => $this->membership_contracts_count
    ?? $this->whenLoaded('membershipContracts', fn() => $this->membershipContracts?->count() ?? 0, 0),

'subscriptionsCount' => $this->customer_subscriptions_count
    ?? $this->when(
        $this->resource->relationLoaded('customerSubscriptions'),
        fn() => $this->customerSubscriptions?->count() ?? 0
    ),
```

**Catatan naming convention Eloquent `withCount`:**
- `withCount(['orders'])` → kolom hasil: `orders_count`
- `withCount(['membershipContracts'])` → kolom hasil: `membership_contracts_count`
- `withCount(['customerSubscriptions'])` → kolom hasil: `customer_subscriptions_count`

---

### Step 4 — Flutter: Perbaiki `LoggingInterceptor`

**File:** `packages/wash_wallet_core/lib/src/network/interceptors/logging_interceptor.dart`

**Masalah saat ini di `onError()`:**

```dart
debugPrint('| Status: ${err.response?.statusCode}'); // null jika timeout
debugPrint('| URL: ${err.requestOptions.baseUrl}${err.requestOptions.path}'); // tidak ada query params
debugPrint('| Message: ${err.message}'); // null jika timeout
// TIDAK ada: DioException.type, err.error, elapsed duration
```

**Perubahan lengkap pada `logging_interceptor.dart`:**

```dart
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // Simpan start time untuk kalkulasi elapsed time
    options.extra['_requestStartTime'] = DateTime.now().millisecondsSinceEpoch;

    debugPrint('┌─────────────────────────────────────────────');
    debugPrint('│ REQUEST');
    debugPrint('├─────────────────────────────────────────────');
    debugPrint('│ Method: ${options.method}');
    // Gunakan options.uri agar query params ikut tampil
    debugPrint('│ URL: ${options.uri}');
    // Redact Authorization header sebelum log
    final headers = Map<String, dynamic>.from(options.headers);
    if (headers.containsKey('Authorization')) {
      headers['Authorization'] = 'Bearer [REDACTED]';
    }
    debugPrint('│ Headers: $headers');
    if (options.data != null) {
      debugPrint('│ Body: ${options.data}');
    }
    debugPrint('└─────────────────────────────────────────────');

    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    final startTime =
        response.requestOptions.extra['_requestStartTime'] as int?;
    final elapsed = startTime != null
        ? '${DateTime.now().millisecondsSinceEpoch - startTime}ms'
        : 'unknown';

    debugPrint('┌─────────────────────────────────────────────');
    debugPrint('│ RESPONSE');
    debugPrint('├─────────────────────────────────────────────');
    debugPrint('│ Status: ${response.statusCode}');
    debugPrint('│ URL: ${response.requestOptions.uri}');
    debugPrint('│ Elapsed: $elapsed');
    debugPrint('│ Data: ${response.data}');
    debugPrint('└─────────────────────────────────────────────');

    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final startTime = err.requestOptions.extra['_requestStartTime'] as int?;
    final elapsed = startTime != null
        ? '${DateTime.now().millisecondsSinceEpoch - startTime}ms'
        : 'unknown';

    debugPrint('┌─────────────────────────────────────────────');
    debugPrint('│ ERROR');
    debugPrint('├─────────────────────────────────────────────');
    debugPrint('│ Type: ${err.type.name}');
    debugPrint('│ Status: ${err.response?.statusCode ?? 'null (no HTTP response)'}');
    debugPrint('│ URL: ${err.requestOptions.uri}');
    debugPrint('│ Elapsed: $elapsed');
    debugPrint('│ Message: ${err.message ?? 'null'}');
    if (err.error != null) {
      debugPrint('│ Error detail: ${err.error}');
    }
    if (err.response?.data != null) {
      debugPrint('│ Data: ${err.response?.data}');
    }
    debugPrint('└─────────────────────────────────────────────');

    handler.next(err);
  }
}
```

**Yang berubah dibanding versi saat ini:**
- `onRequest`: Simpan `_requestStartTime` di `options.extra`. Gunakan `options.uri` (bukan `baseUrl + path`). Redact `Authorization` header.
- `onResponse`: Tampilkan `Elapsed` time. Gunakan `uri`.
- `onError`: Tambah `Type: ${err.type.name}`, `Elapsed`, `Error detail: ${err.error}`. Gunakan `uri`. Status berikan keterangan bila null.

---

### Step 5 — Flutter: Perbaiki Retry Mechanism di Datasource Level

**File:** `apps/cashier/lib/features/customer/data/datasources/customer_remote_datasource.dart`

**Masalah inti:**  
`NetworkRetryMixin.withRetry()` di repository hanya menangkap `DioException`. Tapi `CustomerRemoteDatasourceImpl._handleError()` sudah mengkonversi `DioException` ke `NetworkException` sebelum melemparnya. Sehingga retry di repository tidak pernah bekerja untuk transient error pada customer list.

**Solusi: Pindahkan retry ke dalam method `getAll()` di datasource, sebelum konversi exception.**

```dart
@override
Future<List<CustomerModel>> getAll({
  int page = 1,
  int perPage = 15,
  String? search,
  int? outletId,
  String? phone,
  String? gender,
  bool? isActive,
  String sortBy = 'created_at',
  String sortDirection = 'desc',
}) async {
  const maxAttempts = 3;
  int attempt = 0;

  while (true) {
    try {
      attempt++;
      final queryParams = {
        'page': page,
        'perPage': perPage,
        'sortBy': sortBy,
        'sortDirection': sortDirection,
        if (search != null && search.trim().isNotEmpty) 'search': search,
        'outletId': ?outletId,
        if (phone != null && phone.trim().isNotEmpty) 'phone': phone,
        if (gender != null && gender.trim().isNotEmpty) 'gender': gender,
        'isActive': ?isActive,
      };

      final response = await _dio.get(
        _endpoints.customers,
        queryParameters: queryParams,
      );

      final body = _validateResponse(response);
      final List data = body['data'] as List? ?? [];
      return data.map((e) => CustomerModel.fromJson(e)).toList();

    } on DioException catch (e) {
      // Hanya retry untuk error transient (bukan HTTP error response)
      final isTransient = e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.sendTimeout ||
          e.type == DioExceptionType.connectionError;

      if (isTransient && attempt < maxAttempts) {
        await Future.delayed(Duration(milliseconds: 500 * attempt));
        continue; // retry
      }

      // Semua retry habis atau error bukan transient: konversi dan lempar
      throw _handleError(e);
    } catch (e) {
      throw _handleError(e);
    }
  }
}
```

**Yang berubah dibanding versi saat ini:**
- Method `getAll()` menggunakan loop retry internal (bukan `withRetry()` dari mixin).
- `DioException` yang transient (timeout, connection error) akan di-retry hingga `maxAttempts` kali.
- Hanya setelah semua retry habis, exception dikonversi ke `NetworkException` via `_handleError()`.
- Semua method lain (`getById`, `store`, `update`, `destroy`, dll) **tidak berubah** — mutation operations tidak boleh di-retry secara otomatis.

**Catatan tentang `withRetry()` di Repository:**  
Setelah Step 5 diimplementasikan, `withRetry()` di `customer_repository_impl.dart` (`getAll`) akan menjadi no-op untuk `DioException` transient karena datasource sudah meng-handle-nya. Ini aman — tidak ada double-retry karena pada saat repository menangkap exception, itu sudah berupa `NetworkException` (bukan `DioException`), sehingga `withRetry` akan langsung rethrow.

---

## File Reference Map

```
apps/cashier/
└── lib/
    ├── main.dart                                        (no change)
    └── features/
        └── customer/
            └── data/
                ├── datasources/
                │   └── customer_remote_datasource.dart  ← Step 5
                └── repositories/
                    └── customer_repository_impl.dart    (no change)

packages/
└── wash_wallet_core/
    └── lib/src/network/
        ├── interceptors/
        │   └── logging_interceptor.dart                ← Step 4
        └── network_retry_mixin.dart                    (no change)

webapp/wash_wallet_be/app/
├── Http/
│   ├── Controllers/Api/
│   │   └── CustomerController.php                      ← Step 1
│   └── Resources/Customer/
│       └── CustomerResource.php                        ← Step 3
└── Services/
    └── CustomerService.php                             ← Step 2
```

---

## Implementation Order

```
BACKEND                          FLUTTER
-------                          -------
Step 2: CustomerService          Step 4: LoggingInterceptor
   ↓                                (independen)
Step 1: CustomerController
   ↓
Step 3: CustomerResource         Step 5: Datasource retry
                                    (independen dari backend)
```

Backend (Step 1–3) dan Flutter (Step 4–5) dapat dikerjakan secara paralel.

---

## Verification Checklist

### Backend Verification

- [ ] **Response size berkurang**: Panggil `GET /api/mobile/cashier/customers?page=1&perPage=15&outletId=1&isActive=true`. Response tidak boleh mengandung key `orders` atau `orderItems`.
- [ ] **Count fields tetap ada**: Response harus mengandung `ordersCount`, `membershipContractsCount`, `customerSubscriptionsCount` dengan nilai numerik yang benar.
- [ ] **Detail endpoint tidak terpengaruh**: Panggil `GET /api/mobile/cashier/customers/{id}`. Response masih harus mengandung relasi lengkap (`orders`, `orders.orderItems`, dll).
- [ ] **Response time berkurang**: Bandingkan response time sebelum dan sesudah untuk outlet dengan banyak customer dan banyak orders.

### Flutter Verification

- [ ] **Log error lebih informatif**: Simulasikan timeout. Log harus menampilkan `Type: receiveTimeout`, bukan hanya `Status: null`.
- [ ] **Full URL di log**: Log request dan response harus menampilkan URL lengkap termasuk query parameters.
- [ ] **Authorization di-redact**: Log request tidak boleh menampilkan token asli. Harus tampil `Bearer [REDACTED]`.
- [ ] **Elapsed time di log**: Log response menampilkan berapa milidetik request berlangsung (contoh: `Elapsed: 1234ms`).
- [ ] **Retry berfungsi**: Simulasikan kegagalan transient diikuti sukses. Customer list berhasil dimuat otomatis, di log terlihat ada lebih dari satu attempt.
- [ ] **UI error message tetap muncul**: Setelah semua retry habis, UI menampilkan `Connection timeout. Please try again.`.
- [ ] **`CustomerModel` field tidak null**: Setelah backend diubah, pastikan `ordersCount`, `membershipContractsCount`, `customerSubscriptionsCount` di Flutter tidak null/0 secara salah.

---

## Notes untuk AI Implementer

> [!IMPORTANT]
> Jangan ubah `show()` endpoint di `CustomerController`. Relasi lengkap di detail endpoint adalah by design dan tidak boleh berubah.

> [!IMPORTANT]
> Jangan ubah `CustomerModel.dart` di domain package. Field `ordersCount`, `customerSubscriptionsCount`, `membershipContractsCount` sudah ada dan sudah benar — hanya cara backend mengisinya yang berubah.

> [!WARNING]
> Jangan naikkan `receiveTimeout` sebagai primary fix. Menaikkan timeout hanya boleh sebagai mitigation sementara selama testing, bukan solusi permanen.

> [!NOTE]
> Eloquent `withCount` naming convention: snake_case dari nama relasi. `withCount(['orders'])` → `$model->orders_count`. `withCount(['membershipContracts'])` → `$model->membership_contracts_count`. `withCount(['customerSubscriptions'])` → `$model->customer_subscriptions_count`.
