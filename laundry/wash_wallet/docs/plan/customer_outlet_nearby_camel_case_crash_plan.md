# Implementation Plan: Customer Outlet Nearby CamelCase Crash Fix

**Tanggal:** 2026-06-18  
**Referensi Issue:** `docs/issue/customer_outlet_nearby_camel_case_crash_issue.md`  
**Endpoint Terdampak:** `GET /api/mobile/customer/outlets/nearby` dan `GET /api/mobile/customer/outlets`

---

## Ringkasan

Aplikasi customer crash saat memuat daftar outlet terdekat ketika terdapat outlet yang **sedang tutup**. Error yang muncul:

```
type 'List<dynamic>' is not a subtype of type 'Map<String, dynamic>?'
```

Ada dua masalah terpisah yang perlu diselesaikan:

1. **Crash utama (KRITIS):** Backend mengirim `todaySchedule: []` (array kosong) untuk outlet tutup. Flutter `OutletModel._normalizeTodaySchedule()` sudah bisa menangani list non-empty, tetapi ada bug di fallback logic — ketika `_normalizeTodaySchedule()` return `null`, `normalized['todaySchedule']` jatuh kembali ke `json['todaySchedule']` yang masih berupa `[]`, sehingga generated code `.g.dart` crash saat cast `[] as Map<String, dynamic>?`.

2. **CamelCase gap (MEDIUM):** Backend mengirim `meta.corrected_query` (snake_case). Perlu diganti ke `correctedQuery` (camelCase) sesuai konvensi API yang sudah ada.

---

## Root Cause Analysis

### Bug 1 - Crash: `todaySchedule: []` tidak dihandle Flutter

**Rantai error step-by-step:**

**Step 1 — Backend (OutletResource.php:72):**
```php
'todaySchedule' => $status['todayHours'],
```
Untuk outlet tutup, `OperationalStatusService::resolve()` return `'todayHours' => []`.
Sehingga response JSON berisi: `"todaySchedule": []`

**Step 2 — Flutter normalisasi (outlet_model.dart:133-136):**
```dart
normalized['todaySchedule'] =
    _normalizeTodaySchedule(json) ??
    json['todaySchedule'] ??        // BUG: fallback ke [] jika null
    json['today_schedule'];
```

**Step 3 — `_normalizeTodaySchedule` return null (outlet_model.dart:252-286):**
- `existingTodaySchedule = json['todaySchedule']` → `[]` (List)
- `[]` bukan `Map<String, dynamic>` → skip
- `todayHours = json['todayHours']` → `[]` (empty)
- `todayHours.isNotEmpty` → `false` → skip
- Return `null`

**Step 4 — Fallback buruk:**
`_normalizeTodaySchedule(json)` return `null`, sehingga: `null ?? json['todaySchedule']` → `[]`

**Step 5 — Crash di generated code (outlet_model.g.dart:63):**
```dart
todaySchedule: json['todaySchedule'] as Map<String, dynamic>?,
// Cast [] as Map<String, dynamic>? → throws TypeError
```

### Bug 2 - CamelCase: `corrected_query` di response meta

**OutletController.php baris 53 dan 99:**
```php
$meta['corrected_query'] = $correctedQuery;  // snake_case
```

Flutter `_parseCorrectedQuery()` saat ini hanya mengecek `corrected_query` (snake_case), tidak `correctedQuery`. Ini tidak crash, tapi inkonsisten dengan konvensi API.

---

## Perubahan yang Diperlukan

---

### A. Flutter — Fix Crash (WAJIB, Prioritas KRITIS)

#### [MODIFY] `packages/wash_wallet_domain/lib/src/models/outlet_model.dart`

**Lokasi perubahan:** Method `_normalizeJson`, baris 133-136.

**SEBELUM:**
```dart
normalized['todaySchedule'] =
    _normalizeTodaySchedule(json) ??
    json['todaySchedule'] ??
    json['today_schedule'];
```

**SESUDAH:**
```dart
normalized['todaySchedule'] = _normalizeTodaySchedule(json);
```

**Alasan:** `_normalizeTodaySchedule` sudah membaca `json['todaySchedule']` dan `json['todayHours']` secara internal. Fallback manual ke `json['todaySchedule']` tidak diperlukan dan berbahaya karena bisa bypass type safety dengan memberikan `List` ke field yang diharapkan `Map`.

> **PENTING:** Jangan mengubah `outlet_model.g.dart` — file itu adalah generated code. Perbaikan hanya dilakukan di `outlet_model.dart`.

---

### B. Backend — Fix `todaySchedule` Response (Prioritas Tinggi)

#### [MODIFY] `webapp/wash_wallet_be/app/Http/Resources/Outlet/OutletResource.php`

**Masalah:** Baris 72 mengirim `todaySchedule => $status['todayHours']` yang bisa berupa `[]` untuk outlet tutup.

**Perubahan yang direkomendasikan — hapus field `todaySchedule`:**

Field `todaySchedule` adalah legacy. Flutter sudah menggunakan `operationalStatus.todayHours` sebagai sumber canonical. Cara terbersih adalah menghapus `todaySchedule` dari response.

**SEBELUM (baris 71-74):**
```php
// Keep for backward compatibility if needed, though replaced
'todaySchedule' => $status['todayHours'],
'nextOpenDay' => null, 
```

**SESUDAH:**
```php
'nextOpenDay' => null,
```

**Alternatif (jika perlu tetap ada):** Kirim sebagai `null` atau object saat outlet tutup:
```php
'todaySchedule' => !empty($status['todayHours'])
    ? [
        'isOpen'     => true,
        'openTime'   => $status['todayHours'][0]['open'] ?? null,
        'closeTime'  => $status['todayHours'][0]['close'] ?? null,
    ]
    : null,
'nextOpenDay' => null,
```

---

### C. Backend — Fix CamelCase `corrected_query` (Prioritas Medium)

#### [MODIFY] `webapp/wash_wallet_be/app/Http/Controllers/Api/OutletController.php`

**Lokasi:** Baris 53 (method `index`) dan baris 99 (method `nearby`).

**SEBELUM:**
```php
$meta['corrected_query'] = $correctedQuery;
```

**SESUDAH:**
```php
$meta['correctedQuery'] = $correctedQuery;
```

---

### D. Flutter — Update `_parseCorrectedQuery` (Prioritas Medium)

#### [MODIFY] `apps/customer/lib/features/discovery/data/datasources/discovery_remote_datasource.dart`

**Setelah backend diubah**, perbarui `_parseCorrectedQuery` agar membaca `correctedQuery` (camelCase) sebagai key utama, dengan fallback ke `corrected_query` untuk backward compat selama transisi.

**SEBELUM (baris 208-223):**
```dart
String? _parseCorrectedQuery(Map<String, dynamic> body) {
  final direct = body['corrected_query'];
  if (direct is String && direct.trim().isNotEmpty) {
    return direct.trim();
  }

  final meta = body['meta'];
  if (meta is Map<String, dynamic>) {
    final fromMeta = meta['corrected_query'];
    if (fromMeta is String && fromMeta.trim().isNotEmpty) {
      return fromMeta.trim();
    }
  }

  return null;
}
```

**SESUDAH:**
```dart
String? _parseCorrectedQuery(Map<String, dynamic> body) {
  // Check meta first (standard structure)
  final meta = body['meta'];
  if (meta is Map<String, dynamic>) {
    // Prefer camelCase (new contract)
    final camel = meta['correctedQuery'];
    if (camel is String && camel.trim().isNotEmpty) return camel.trim();

    // Fallback to snake_case (legacy/transition)
    final snake = meta['corrected_query'];
    if (snake is String && snake.trim().isNotEmpty) return snake.trim();
  }

  // Check top-level as fallback (legacy format)
  final directCamel = body['correctedQuery'];
  if (directCamel is String && directCamel.trim().isNotEmpty) {
    return directCamel.trim();
  }

  final directSnake = body['corrected_query'];
  if (directSnake is String && directSnake.trim().isNotEmpty) {
    return directSnake.trim();
  }

  return null;
}
```

---

### E. Dart Unit Tests (Prioritas Tinggi)

#### [NEW] `packages/wash_wallet_domain/test/outlet_model_test.dart`

Buat `test/` directory di `packages/wash_wallet_domain` dan tambahkan test file:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

void main() {
  group('OutletModel.fromJson', () {
    Map<String, dynamic> baseJson() => {
      'id': 1,
      'name': 'Test Outlet',
      'status': 'active',
      'isCurrentlyOpen': false,
    };

    test('does not throw when todaySchedule is empty list (closed outlet)', () {
      final json = {
        ...baseJson(),
        'todaySchedule': [],
        'todayHours': [],
        'weeklyHours': [],
        'operationalStatus': 'closed_today',
        'operationalStatusLabel': 'Tutup hari ini',
        'operationalStatusMessage': 'Buka lagi besok 08:00',
      };

      expect(() => OutletModel.fromJson(json), returnsNormally);

      final model = OutletModel.fromJson(json);
      expect(model.todaySchedule, isNull,
          reason: 'todaySchedule should be null for closed outlet');
    });

    test('normalizes todaySchedule from non-empty todayHours (open outlet)', () {
      final json = {
        ...baseJson(),
        'isCurrentlyOpen': true,
        'todaySchedule': [],
        'todayHours': [
          {'open': '08:00', 'close': '21:00'},
        ],
        'operationalStatus': 'open',
        'operationalStatusLabel': 'Buka',
        'operationalStatusMessage': 'Buka sampai 21:00',
      };

      final model = OutletModel.fromJson(json);
      expect(model.todaySchedule, isNotNull);
      expect(model.todaySchedule!['isOpen'], isTrue);
      expect(model.todaySchedule!['openTime'], equals('08:00'));
      expect(model.todaySchedule!['closeTime'], equals('21:00'));
    });

    test('todaySchedule is null when neither todaySchedule nor todayHours present', () {
      final json = {
        ...baseJson(),
        'operationalStatus': 'hours_not_set',
      };

      final model = OutletModel.fromJson(json);
      expect(model.todaySchedule, isNull);
    });

    test('operationalStatus is populated from flat fields for open outlet', () {
      final json = {
        ...baseJson(),
        'isCurrentlyOpen': true,
        'todayHours': [
          {'open': '08:00', 'close': '21:00'},
        ],
        'weeklyHours': [
          {
            'day': 'monday',
            'dayLabel': 'Senin',
            'isClosed': false,
            'timeRanges': [
              {'open': '08:00', 'close': '21:00'},
            ],
          },
        ],
        'operationalStatus': 'open',
        'operationalStatusLabel': 'Buka',
        'operationalStatusMessage': 'Buka sampai 21:00',
        'canCreateOrderNow': true,
      };

      final model = OutletModel.fromJson(json);
      expect(model.operationalStatus, isNotNull);
      expect(model.operationalStatus!.operationalStatus, equals('open'));
      expect(model.operationalStatus!.todayHours, hasLength(1));
      expect(model.operationalStatus!.weeklyHours, hasLength(1));
    });

    test('does not throw for minimal nearby response shape', () {
      // Simulasi response actual dari endpoint nearby untuk outlet tutup
      final json = {
        'id': 42,
        'name': 'Laundry Bersih',
        'status': 'active',
        'isCurrentlyOpen': false,
        'isActivated': true,
        'hasActiveExposure': true,
        'isCourierEnabled': true,
        'hasFreeShipping': false,
        'hasUnconditionalFreeShipping': false,
        'distance': 1.2,
        'latitude': -6.200,
        'longitude': 106.816,
        'todaySchedule': [],        // <-- trigger utama crash
        'todayHours': [],
        'weeklyHours': [],
        'operationalStatus': 'closed_today',
        'operationalStatusLabel': 'Tutup hari ini',
        'operationalStatusMessage': 'Buka lagi besok 08:00',
        'nextOpenAt': '2026-06-19T08:00:00+07:00',
        'canCreateOrderNow': false,
      };

      expect(() => OutletModel.fromJson(json), returnsNormally);
    });
  });
}
```

**Tambahkan ke `packages/wash_wallet_domain/pubspec.yaml`:**
```yaml
dev_dependencies:
  flutter_test:
    sdk: flutter
```

---

### F. Backend Feature Tests (Prioritas Medium)

#### [NEW] `webapp/wash_wallet_be/tests/Feature/Api/OutletNearbyResourceTest.php`

```php
<?php

namespace Tests\Feature\Api;

use App\Models\CustomerAccount;
use App\Models\Outlet;
use App\Models\OperationalDay;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class OutletNearbyResourceTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsCustomer(): static
    {
        $customer = \App\Models\Customer::factory()->create();
        $account  = CustomerAccount::factory()->create(['customer_id' => $customer->id]);
        Sanctum::actingAs($account, [], 'customer_sanctum');
        return $this;
    }

    public function test_nearby_response_never_contains_today_schedule_as_bare_array(): void
    {
        $outlet = Outlet::factory()->create([
            'latitude'  => -6.200,
            'longitude' => 106.816,
            'status'    => 'active',
        ]);

        // Buat semua hari tutup untuk memastikan todayHours kosong
        foreach (['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as $day) {
            OperationalDay::factory()->create([
                'outlet_id'    => $outlet->id,
                'day_of_week'  => $day,
                'is_open'      => false,
            ]);
        }

        $response = $this->actingAsCustomer()
            ->getJson('/api/mobile/customer/outlets/nearby?latitude=-6.200&longitude=106.816&radius=50');

        $response->assertStatus(200);

        $outlets = $response->json('data');
        foreach ($outlets as $outletData) {
            $todaySchedule = $outletData['todaySchedule'] ?? null;
            $this->assertFalse(
                is_array($todaySchedule),
                "todaySchedule must not be a bare array, got: " . json_encode($todaySchedule)
            );
        }
    }

    public function test_nearby_meta_uses_camel_case_corrected_query(): void
    {
        $response = $this->actingAsCustomer()
            ->getJson('/api/mobile/customer/outlets/nearby?latitude=-6.200&longitude=106.816&search=londri');

        $response->assertStatus(200);

        $meta = $response->json('meta');
        if ($meta !== null) {
            $this->assertArrayNotHasKey('corrected_query', $meta,
                'meta should use camelCase correctedQuery, not corrected_query');
        }
    }
}
```

---

## Urutan Implementasi

| Prioritas | Langkah | File |
|---|---|---|
| 1 (KRITIS) | Fix fallback todaySchedule di Flutter | `outlet_model.dart` |
| 2 (WAJIB) | Buat Dart unit test | `packages/wash_wallet_domain/test/outlet_model_test.dart` |
| 3 (TINGGI) | Hapus/fix `todaySchedule: []` dari backend | `OutletResource.php` |
| 4 (MEDIUM) | Rename `corrected_query` ke `correctedQuery` di backend | `OutletController.php` |
| 5 (MEDIUM) | Update `_parseCorrectedQuery` di Flutter | `discovery_remote_datasource.dart` |
| 6 (MEDIUM) | Buat backend feature test | `OutletNearbyResourceTest.php` |

---

## Alur Data (Referensi Lengkap)

```
GET /api/mobile/customer/outlets/nearby
  OutletController::nearby()
    OutletResource::toArray()
      [operationalDays relation loaded]
      OperationalStatusService::resolve()
        outlet TUTUP -> todayHours = []
      'todaySchedule' => $status['todayHours']  <- mengirim []

      *** SETELAH FIX BACKEND ***
      todaySchedule dihapus dari response

Flutter DiscoveryRemoteDatasourceImpl::fetchDiscoveryOutlets()
  OutletModel.fromJson(json)
    _normalizeJson(json)

      *** SEBELUM FIX (BUGGY) ***
      normalized['todaySchedule'] =
        _normalizeTodaySchedule(json) [return null]
        ?? json['todaySchedule']      [return []]
        ?? json['today_schedule']
      -> normalized['todaySchedule'] = []

      outlet_model.g.dart:63:
      json['todaySchedule'] as Map<String, dynamic>?
      -> CRASH: List is not Map

      *** SETELAH FIX FLUTTER ***
      normalized['todaySchedule'] = _normalizeTodaySchedule(json)
      -> null (safe, field nullable)

      outlet_model.g.dart:63:
      json['todaySchedule'] as Map<String, dynamic>?
      -> null (OK, tidak crash)
```

---

## Catatan Penting untuk AI Implementor

1. **Jangan edit `outlet_model.g.dart`** — ini adalah generated code. Perubahan hanya di `outlet_model.dart`.
2. **Satu baris perubahan di Flutter sudah cukup untuk fix crash** — ubah `normalized['todaySchedule'] = _normalizeTodaySchedule(json) ?? json['todaySchedule'] ?? json['today_schedule']` menjadi `normalized['todaySchedule'] = _normalizeTodaySchedule(json)`.
3. **Perubahan backend `OutletResource.php` adalah defense in depth** — crash tidak akan terjadi lagi setelah Flutter fix, tapi sebaiknya backend juga tidak mengirim data yang salah tipe.
4. **Tidak perlu jalankan `build_runner`** — perubahan yang dilakukan tidak mengubah field deklarasi Freezed/json_serializable, hanya logika normalisasi di method `_normalizeJson`.
5. **Test Dart** menggunakan `flutter_test` (bukan `dart_test`) karena package adalah Flutter package.

