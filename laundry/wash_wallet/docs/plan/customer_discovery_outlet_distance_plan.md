# Implementation Plan: Tampilan Jarak Outlet di Discovery dan Daftar Outlet

**Sumber:** `docs/user_need/customer_discovery_outlet_distance_user_need.md`  
**Tanggal:** 2026-06-09

---

> [!IMPORTANT]
> **Wajib dibaca sebelum implementasi:**
> - `docs/spec/cubit_spec.md`
> - `docs/spec/state_spec.md`
> - `docs/spec/usecase_spec.md`
> - `docs/spec/repository_spec.md`
> - `docs/spec/remote_datasource_spec.md`
> - `docs/spec/provider_spec.md`
> - `docs/spec/repository_impl_spec.md`

> [!NOTE]
> **Coding guidelines yang wajib dipatuhi:**
> - Gunakan **theme color** via `context.colors.*` — tidak boleh hardcode warna
> - Gunakan **shared UI** dari `wash_wallet_ui` (AppBadge, AppCard, AppButton, dll.)
> - Setiap widget besar **dipecah menjadi widget terpisah** di folder `widgets/`
> - **Tidak ada comment** di kode — tulis clean code yang self-explanatory
> - Panjang file dijaga minimal — satu widget = satu tanggung jawab

---

## Analisis Konteks

### Apa yang sudah ada

| Item | Status | Catatan |
|------|--------|---------|
| `Outlet.distance` (domain entity) | ✅ Ada | `double? distance` di `wash_wallet_domain/src/entities/outlet.dart` |
| `OutletModel.distance` (model) | ✅ Ada | `double? distance` sudah di-parse dari JSON |
| `DiscoveryOutlet.distanceKm` | ✅ Ada | Field sudah ada di discovery entity |
| `DiscoveryService.outletDistance` | ✅ Ada | Field sudah ada di service entity |
| `_DistanceMeta` di `discovery_outlet_info_widget` | ✅ Ada | Sudah render, tapi format belum sesuai aturan (masih `x.x km`) |
| Distance di `discovery_service_outlet_info_widget` | ✅ Ada | Sudah render, format salah (`x.x km`) |
| Distance di `outlet_banner_header` | ✅ Ada | Sudah render, format salah |
| Distance di `outlet_card` | ✅ Ada | Sudah render, format salah |
| Sort `nearest` di Discovery | ✅ Ada | Ada di filter, perlu diikat ke alamat aktif |
| `CustomerAddress.latitude/longitude` | ✅ Ada | Field sudah ada di entity |
| `OutletCubit.getAll` / `getNearby` | ✅ Ada | Sudah ada, perlu ditambah parameter `addressId` |
| `DiscoveryCubit.refreshForLocation` | ✅ Ada | Sudah ada, perlu propagasi dari address picker |

### Apa yang perlu diubah / ditambah

1. **Format label jarak** — semua tempat masih memakai `x.x km`, harus memakai aturan: `800m` jika < 1 km, `1.8km` jika ≥ 1 km
2. **Shared distance formatter** — buat helper tunggal agar format konsisten di semua screen
3. **Shared distance badge widget** — buat widget reusable untuk menampilkan label jarak
4. **Outlet list** — perlu kirim `addressId` ke backend agar backend menghitung jarak berdasarkan alamat primary/first
5. **Outlet detail** — perlu kirim `addressId` ke backend agar jarak konsisten
6. **Discovery** — perlu pastikan `latitude/longitude` dari alamat aktif sudah terkirim ke datasource
7. **Sort Terdekat** — perlu validasi bahwa sort ini hanya aktif jika ada alamat valid; tambah fallback UX

---

## Arsitektur Perubahan

```
Perubahan Backend-side (API):
  → OutletList API sudah menerima lat/lng, perlu tambah support address_id
  → Discovery API sudah menerima lat/lng ✅
  → OutletDetail API perlu menerima address_id atau lat/lng

Perubahan Frontend:
  → Shared utility: OutletDistanceFormatter
  → Shared widget: OutletDistanceBadgeWidget
  → Discovery: format label jarak
  → OutletList: kirim lat/lng dari primary address
  → OutletDetail: kirim lat/lng dari konteks asal
  → Sort Terdekat: validasi sebelum diaktifkan
```

---

## Keputusan Implementasi

### 1. Cara Kirim Konteks Alamat ke Backend

Gunakan **latitude/longitude** (bukan `address_id`) sebagai konteks, karena:
- API Discovery sudah menerima `latitude` dan `longitude`
- API Outlet sudah mendukung `getNearby` dengan lat/lng
- Menggunakan `address_id` butuh perubahan backend tambahan

**Discovery:** sudah pakai lat/lng dari alamat aktif → lanjutkan pola ini  
**Outlet List:** tambah parameter `latitude` dan `longitude` ke `getAll()` sehingga backend menghitung jarak  
**Outlet Detail:** tambah parameter `latitude` dan `longitude` ke `getById()`

### 2. Format Label Jarak

```
distanceMeters < 1000 → "${distanceMeters.round()}m"   contoh: "800m"
distanceMeters >= 1000 → "${(distanceMeters / 1000).toStringAsFixed(1)}km"  contoh: "1.8km"
```

`distance` yang ada di entity (`Outlet.distance`, `DiscoveryOutlet.distanceKm`) diasumsikan dalam satuan **kilometer** (sesuai data yang ada).

Konversi:
```dart
distanceKm < 1.0 → "${(distanceKm * 1000).round()}m"
distanceKm >= 1.0 → "${distanceKm.toStringAsFixed(1)}km"
```

### 3. Shared Utility Location

Buat `OutletDistanceFormatter` di `apps/customer/lib/core/utils/outlet_distance_formatter.dart`

### 4. Shared Widget

Buat `OutletDistanceBadgeWidget` di `apps/customer/lib/core/widgets/outlet_distance_badge_widget.dart`

Dipakai di: discovery_outlet_info_widget, discovery_service_outlet_info_widget, outlet_card, outlet_banner_header

### 5. Sort Terdekat — Fallback UX

Jika customer memilih sort `Terdekat` tanpa alamat aktif → tampilkan `AppSnackbar` ringan yang mengajak menambahkan alamat, dan sort fallback ke `relevant`.  
Tidak perlu disable tombol sort — cukup tangani di cubit saat alamat tidak ada.

### 6. Outlet List — Sumber Alamat

`IndexOutletScreen` saat ini memakai GPS device. Perlu ditambah:
- Jika GPS tidak tersedia, coba ambil alamat primary customer dari `CustomerAddressCubit`
- Kirim lat/lng ke `OutletCubit.getAll()` agar backend menghitung jarak

### 7. Outlet Detail — Konteks Alamat

`ShowOutletScreen` tidak menerima lat/lng saat ini. Perlu:
- Terima optional `latitude` dan `longitude` sebagai parameter route extra
- Jika tidak ada, biarkan `getById()` tanpa lat/lng (jarak tidak tampil, valid per business rule)

---

## Rencana File yang Dibuat / Diubah

### Baru (NEW)

| File | Keterangan |
|------|-----------|
| `apps/customer/lib/core/utils/outlet_distance_formatter.dart` | Helper fungsi format label jarak |
| `apps/customer/lib/core/widgets/outlet_distance_badge_widget.dart` | Widget badge jarak reusable |

### Diubah (MODIFY)

| File | Perubahan |
|------|-----------|
| `apps/customer/lib/features/discovery/presentation/widgets/discovery_outlet_info_widget.dart` | Ganti `_DistanceMeta` pakai `OutletDistanceBadgeWidget` + format baru |
| `apps/customer/lib/features/discovery/presentation/widgets/discovery_service_outlet_info_widget.dart` | Ganti format jarak pakai `OutletDistanceFormatter.format()` |
| `apps/customer/lib/features/outlet/presentation/widgets/outlet_card.dart` | Ganti format jarak pakai `OutletDistanceBadgeWidget` |
| `apps/customer/lib/features/outlet/presentation/widgets/outlet_banner_header.dart` | Ganti format jarak pakai `OutletDistanceFormatter.format()` |
| `apps/customer/lib/features/outlet/data/datasources/outlet_remote_datasource.dart` | Tambah `latitude?` dan `longitude?` ke `getAll()` dan `getById()` |
| `apps/customer/lib/features/outlet/domain/repositories/outlet_repository.dart` | Tambah `latitude?` dan `longitude?` ke `getAll()` dan `getById()` |
| `apps/customer/lib/features/outlet/data/repositories/outlet_repository_impl.dart` | Propagasi `latitude?` dan `longitude?` |
| `apps/customer/lib/features/outlet/domain/usecases/get_all_usecase.dart` | Tambah `latitude?` dan `longitude?` |
| `apps/customer/lib/features/outlet/domain/usecases/get_by_id_usecase.dart` | Tambah `latitude?` dan `longitude?` |
| `apps/customer/lib/features/outlet/presentation/bloc/outlet_cubit.dart` | Tambah `latitude?` dan `longitude?` ke `getAll()` dan `getById()` |
| `apps/customer/lib/features/outlet/presentation/screens/index_outlet_screen.dart` | Gunakan alamat primary customer sebagai fallback jika GPS tidak ada |
| `apps/customer/lib/features/outlet/presentation/screens/show_outlet_screen.dart` | Terima `latitude?` dan `longitude?` opsional dari route |

---

## Detail Implementasi Per File

### STEP 1 — Shared Utility: `outlet_distance_formatter.dart`

```
Lokasi: apps/customer/lib/core/utils/outlet_distance_formatter.dart
```

Berisi satu class `OutletDistanceFormatter` dengan static method `format(double? distanceKm)`:
- Jika `distanceKm == null` → kembalikan `null`
- Jika `distanceKm < 1.0` → kembalikan `"${(distanceKm * 1000).round()}m"`
- Jika `distanceKm >= 1.0` → kembalikan `"${distanceKm.toStringAsFixed(1)}km"`

Tidak ada dependency Flutter. Pure Dart utility.

---

### STEP 2 — Shared Widget: `outlet_distance_badge_widget.dart`

```
Lokasi: apps/customer/lib/core/widgets/outlet_distance_badge_widget.dart
```

`OutletDistanceBadgeWidget` adalah `StatelessWidget`:
- Terima `double? distanceKm`
- Jika null → return `SizedBox.shrink()`
- Jika ada → render `AppBadge.soft(label: OutletDistanceFormatter.format(distanceKm)!, icon: Icons.near_me_rounded, size: AppBadgeSize.sm)`
- Gunakan `context.colors.*` untuk warna, tidak hardcode

---

### STEP 3 — Fix Format di `discovery_outlet_info_widget.dart`

Ganti widget `_DistanceMeta` (private class di file ini):
- Sebelum: `'${outlet.distanceKm!.toStringAsFixed(1)} km'`
- Sesudah: ganti pakai `OutletDistanceBadgeWidget(distanceKm: outlet.distanceKm)`

Tidak perlu perubahan lain pada file ini.

---

### STEP 4 — Fix Format di `discovery_service_outlet_info_widget.dart`

Ganti format jarak pada bagian `if (distance != null)`:
- Sebelum: `'${distance!.toStringAsFixed(1)} km'`
- Sesudah: `OutletDistanceFormatter.format(distance)` (hanya tampil jika tidak null)

Refactor: pisahkan bagian "jarak" menjadi private widget kecil `_DistanceLabel` di file yang sama agar `build()` tetap singkat.

---

### STEP 5 — Fix Format di `outlet_card.dart`

Ganti bagian distance badge:
- Sebelum: `AppBadge.info(label: '${outlet.distance!.toStringAsFixed(1)} km', ...)`
- Sesudah: `OutletDistanceBadgeWidget(distanceKm: outlet.distance)` — widget sudah handle null-guard

Hapus conditional `if (outlet.distance != null)` karena sudah di-handle oleh widget.

---

### STEP 6 — Fix Format di `outlet_banner_header.dart`

Ganti bagian yang menampilkan jarak:
- Sebelum: `'${outlet.distance!.toStringAsFixed(1)} km'`
- Sesudah: Text dengan `OutletDistanceFormatter.format(outlet.distance)!`
- Wrap dengan `if (outlet.distance != null && OutletDistanceFormatter.format(outlet.distance) != null)`

Pisahkan block jarak menjadi private widget `_DistanceRow` agar `build()` tetap singkat.

---

### STEP 7 — Outlet Datasource: Tambah Lat/Lng ke `getAll` dan `getById`

File: `outlet_remote_datasource.dart`

**Abstract class:**
```dart
Future<List<OutletModel>> getAll({
  // ... parameter existing ...
  double? latitude,   // tambah
  double? longitude,  // tambah
});

Future<OutletModel> getById({
  required int id,
  double? latitude,   // tambah
  double? longitude,  // tambah
});
```

**Implementation:**
- `getAll()`: tambah `'latitude': ?latitude, 'longitude': ?longitude` ke queryParams
  - Jika ada lat/lng → gunakan `_endpoints.nearbyOutlets`, jika tidak → `_endpoints.outlets` (pola yang sudah ada di discovery)
- `getById()`: tambah `queryParameters: {'latitude': ?latitude, 'longitude': ?longitude}` ke `_dio.get()`

---

### STEP 8 — Repository Interface: `outlet_repository.dart`

Tambah `latitude?` dan `longitude?` ke signature `getAll()` dan `getById()`.

---

### STEP 9 — Repository Impl: `outlet_repository_impl.dart`

Propagasi parameter baru ke datasource call.

---

### STEP 10 — Usecases

**`get_all_usecase.dart`:** tambah `double? latitude`, `double? longitude` → propagasi ke `_repository.getAll()`

**`get_by_id_usecase.dart`:** tambah `double? latitude`, `double? longitude` → propagasi ke `_repository.getById()`

---

### STEP 11 — `outlet_cubit.dart`

**`getAll()` method:** tambah `double? latitude`, `double? longitude` → propagasi ke usecase

**`getById()` method:** tambah `double? latitude`, `double? longitude` → propagasi ke usecase

Simpan `_lastLatitude` dan `_lastLongitude` saat `getAll()` dipanggil agar `loadMore()` dan `refresh()` tetap konsisten (sudah ada pola ini untuk GPS, tinggal diperluas).

---

### STEP 12 — `index_outlet_screen.dart`

**Perubahan `_initLocation()`:**

```
GPS success → getAll/getNearby dengan lat/lng (existing behavior)
GPS failure → coba ambil primary address dari CustomerAddressCubit
              Jika primary address punya lat/lng → getAll dengan lat/lng
              Jika tidak ada alamat → getAll tanpa lat/lng (existing behavior)
```

Logika pemilihan alamat:
1. Ambil state dari `CustomerAddressCubit` (sudah di-provide di route)
2. Cari `isPrimary == true` → pakai lat/lng-nya
3. Jika tidak ada primary, cari berdasarkan `createdAt` terlama → pakai lat/lng-nya
4. Jika tidak ada alamat → `getAll()` tanpa koordinat

Pecah logika ini menjadi private method `_resolveAddressContext()` di state class agar tidak semua ada di `_initLocation()`.

---

### STEP 13 — `show_outlet_screen.dart`

Tambah dua parameter opsional:
```dart
final double? latitude;
final double? longitude;
```

Pada `initState`, teruskan ke:
```dart
context.read<OutletCubit>().getById(
  id: widget.outletId,
  latitude: widget.latitude,
  longitude: widget.longitude,
);
```

Di routing, saat push dari Discovery atau Outlet list, kirimkan lat/lng aktif via `extra`:
```dart
context.push('/outlets/${outlet.id}', extra: {'latitude': lat, 'longitude': lng})
```

---

### STEP 14 — Sort Terdekat — Validasi di Discovery

Pada `discovery_sort_selector_widget.dart` atau saat sort dipilih di cubit:
- Jika user pilih sort `nearest` dan `_lastLatitude == null` → emit snackbar via state atau callback
- Tampilkan `AppSnackbar` dengan pesan: `"Pilih alamat terlebih dahulu untuk mengurutkan berdasarkan jarak"`
- Fallback sort ke `relevant` secara internal

Buat private method `_canSortNearest()` di `DiscoveryCubit` yang mengecek `_lastLatitude != null && _lastLongitude != null`.

---

## Skema Data API yang Diharapkan

Backend sudah mengembalikan `distance` dalam response outlet. Plan ini tidak mengubah schema backend, hanya memastikan frontend mengirim lat/lng agar backend menghitung jarak.

```json
{
  "id": 1,
  "name": "Wash Express - MERR",
  "distance": 1.8,
  ...
}
```

Frontend kemudian memakai `OutletDistanceFormatter.format(outlet.distance)` untuk mengubahnya menjadi label `"1.8km"` atau `"800m"`.

---

## Widget Breakdown (Baru)

### `OutletDistanceFormatter`
```
core/utils/outlet_distance_formatter.dart
→ static String? format(double? distanceKm)
```

### `OutletDistanceBadgeWidget`
```
core/widgets/outlet_distance_badge_widget.dart
→ StatelessWidget
→ Props: double? distanceKm
→ Return: AppBadge.soft dengan icon near_me_rounded, atau SizedBox.shrink()
```

---

## Acceptance Criteria Mapping

| AC dari User Need | Implementasi |
|-------------------|-------------|
| AC #2: Discovery tampilkan jarak | ✅ Sudah ada, perbaiki format |
| AC #3: Discovery pakai alamat primary | ✅ DiscoveryCubit sudah pakai lat/lng dari location picker |
| AC #4: Ganti alamat → refresh in-place | ✅ `refreshForLocation()` sudah ada |
| AC #5: Jarak dihitung ulang setelah ganti alamat | ✅ Backend dikirim lat/lng baru saat refresh |
| AC #6: Jarak lama tidak tetap tampil | ✅ `emit(DiscoveryLoading())` saat refresh |
| AC #7: Service card tampilkan jarak outlet | ✅ Ada `outletDistance`, perbaiki format |
| AC #8: Outlet card tampilkan jarak | ✅ Ada `distance`, perbaiki format |
| AC #9: Sort Terdekat pakai jarak dari alamat aktif | 🔧 Perlu validasi + fallback UX |
| AC #10: Sort Terdekat → alamat berubah → refresh urutan | ✅ `refreshForLocation()` reset pagination |
| AC #11: Outlet list tampilkan jarak jika ada alamat primary | 🔧 Step 12 |
| AC #12: Fallback ke alamat pertama | 🔧 Step 12 — `_resolveAddressContext()` |
| AC #13: Tanpa alamat → tidak tampilkan jarak | ✅ Null-guard di widget |
| AC #14: Outlet detail tampilkan jarak | 🔧 Step 13 |
| AC #15: Outlet detail tanpa alamat → tanpa jarak | ✅ `latitude/longitude` nullable |
| AC #16-#17: Tidak tampilkan 0km/NaN | ✅ Null-guard di `OutletDistanceBadgeWidget` |
| AC #18: < 1km tampil meter | 🔧 `OutletDistanceFormatter` Step 1 |
| AC #19: ≥ 1km tampil kilometer | 🔧 `OutletDistanceFormatter` Step 1 |
| AC #20: Tidak tampil "0.8km" untuk 800m | 🔧 `OutletDistanceFormatter` Step 1 |
| AC #24: Jika gagal → screen tetap tampil tanpa jarak | ✅ Field nullable, widget null-safe |

---

## Urutan Pengerjaan yang Disarankan

```
1. outlet_distance_formatter.dart (utility, no dependency)
2. outlet_distance_badge_widget.dart (widget, pakai formatter)
3. Fix format di semua 4 widget Discovery/Outlet yang sudah ada
4. Outlet datasource → repository → usecase → cubit (tambah lat/lng)
5. index_outlet_screen: tambah _resolveAddressContext()
6. show_outlet_screen: tambah latitude/longitude parameter
7. Discovery sort: validasi sort nearest
```

---

## Out of Scope (tidak dikerjakan)

- Perubahan tarif ongkir
- Geocoding massal alamat lama
- Integrasi map full-screen
- Perubahan default ranking menjadi otomatis terdekat
- Perubahan validasi area kurir
