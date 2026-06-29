# Customer Service Discovery Search Filter Plan

Fitur discovery screen global untuk customer app agar customer bisa menemukan layanan laundry lintas outlet, melihat rekomendasi, dan memakai search/filter layanan tanpa mengganti tab Outlet yang sudah ada.

## Keputusan User Review

1. Endpoint API baru tidak diperlukan.
2. Discovery memakai endpoint customer outlet existing:
   - `GET /mobile/customer/outlets`
   - `GET /mobile/customer/outlets/nearby` jika lokasi/GPS tersedia.
3. Endpoint outlet existing boleh ditambah query parameter dan eager-load service khusus discovery, tetapi path route baru tidak dibuat.
4. Discovery tidak mengganti tab Outlet.
5. Discovery adalah standalone route/screen sendiri, misalnya `/discovery`, yang bisa dibuka dari Home atau entry point lain.
6. Discovery tidak menerima parameter awal dari luar.
7. Discovery selalu mulai dari cakupan global seluruh outlet/layanan customer yang eligible/exposed.
8. Filter outlet hanya dipilih di dalam screen discovery.
9. Filter kategori, unit, dan range harga wajib masuk MVP.
10. Section rekomendasi memakai endpoint yang sama dengan variasi parameter/sort/filter, bukan endpoint terpisah.

---

## Panduan Implementasi

> [!CAUTION]
> **WAJIB DIBACA SEBELUM CODING.** Setiap file yang dibuat harus mengikuti standardisasi spec di `docs/spec/`:
>
> | Spec | Lokasi |
> |------|--------|
> | Cubit | [cubit_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/cubit_spec.md) |
> | State | [state_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/state_spec.md) |
> | Provider | [provider_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/provider_spec.md) |
> | Usecase | [usecase_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/usecase_spec.md) |
> | Repository | [repository_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/repository_spec.md) |
> | Repository Impl | [repository_impl_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/repository_impl_spec.md) |
> | Remote Datasource | [remote_datasource_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/remote_datasource_spec.md) |

> [!CAUTION]
> **Aturan coding yang HARUS dipatuhi:**
> - Gunakan widget dari `wash_wallet_ui` (`AppCard`, `AppButton`, `AppBadge`, `AppChip`, `AppEmptyState`, `AppLayout`, `AppHeader`, `AppTextField`, `AppLoadingIndicator`, `AppBottomSheet`, `AppListTile`, `AppDivider`).
> - Gunakan theme token via `context.colors`, `context.space`, `context.radius`, `context.typography`; jangan hardcode warna, spacing, atau font.
> - Jangan tulis comment di kode.
> - Pecah UI menjadi widget kecil di folder `widgets/`; setiap widget maksimal sekitar 80 sampai 100 baris.
> - Gunakan `result.when()`, bukan `.fold()` atau `if (result.isSuccess)`.
> - State menggunakan `sealed class` dengan pattern matching di UI.
> - Constructor cubit menggunakan named parameters.
> - Remote datasource mengembalikan `Model`, bukan `Result`.
> - Repository impl mengembalikan `Result` via try/catch dan `_mapExceptionToFailure`.

---

## Backend Plan

### Existing Endpoint Enhancement

Jangan membuat route baru khusus layanan untuk discovery.

Gunakan endpoint existing:

```text
GET /mobile/customer/outlets
GET /mobile/customer/outlets/nearby
```

Tambahkan dukungan query parameter khusus discovery:

```text
includeServices=true
search=
outletId=
categoryId=
unitId=
minPrice=
maxPrice=
supportsCourier=
freeShippingEligible=
serviceSortBy=relevant|best|cheapest|nearest|popular
sortDirection=asc|desc
page=
perPage=
latitude=
longitude=
```

Aturan compatibility:

1. Jika `includeServices` tidak dikirim atau bernilai `false`, response outlet list tetap seperti sekarang.
2. Jika `includeServices=true`, backend memuat `categories.laundryServices.unit` dan hanya mengembalikan layanan yang lolos filter discovery.
3. Filter service tidak boleh mengubah behavior tab Outlet existing yang tidak mengirim `includeServices=true`.
4. `GET /mobile/customer/outlets/nearby` tetap dipakai saat lokasi tersedia agar jarak outlet tetap dapat dihitung.
5. Backend tetap menjadi sumber kebenaran untuk outlet aktif, outlet exposed, operational hours, courier setting, gratis ongkir, dan status layanan aktif.

### Backend Filtering

Saat `includeServices=true`, filter diterapkan pada layanan dan outlet:

1. `search` mencari layanan dan outlet. Minimal mencakup service name, service description, category name, unit name/symbol, dan outlet name.
2. `outletId` membatasi layanan ke satu outlet, tetapi hanya jika customer memilih filter outlet di dalam discovery.
3. `categoryId` membatasi layanan ke kategori tertentu.
4. `unitId` membatasi layanan ke unit tertentu.
5. `minPrice` dan `maxPrice` membatasi harga layanan.
6. `supportsCourier=true` hanya menampilkan layanan dengan `supports_courier=true` dari outlet yang `is_courier_enabled=true`.
7. `freeShippingEligible=true` hanya menampilkan layanan dari outlet yang `courierSetting.free_shipping_enabled=true`.
8. Layanan nonaktif tidak dikembalikan sebagai hasil discovery.
9. Outlet yang tidak aktif atau tidak exposed tidak dikembalikan ke customer discovery.

### Backend Sorting

`serviceSortBy` dipakai untuk hasil layanan di discovery:

```text
relevant  -> default search relevance / existing order fallback
best      -> rating desc, reviews count desc
cheapest  -> service price asc
nearest   -> outlet distance asc jika lokasi tersedia
popular   -> orders/reviews/popularity desc jika data tersedia; fallback ke reviews count desc
```

Jika metric tertentu belum tersedia, gunakan fallback yang stabil dan dokumentasikan di service layer.

### Recommendation Parameters

Section rekomendasi tidak memakai endpoint terpisah. Discovery app memanggil endpoint outlet existing beberapa kali dengan parameter berbeda:

```text
Layanan terbaik:
GET /mobile/customer/outlets?includeServices=true&serviceSortBy=best&perPage=10

Layanan murah:
GET /mobile/customer/outlets?includeServices=true&serviceSortBy=cheapest&perPage=10

Gratis ongkir:
GET /mobile/customer/outlets?includeServices=true&freeShippingEligible=true&serviceSortBy=best&perPage=10

Layanan populer:
GET /mobile/customer/outlets?includeServices=true&serviceSortBy=popular&perPage=10

Outlet terbaik:
GET /mobile/customer/outlets?sortBy=best&perPage=5
```

Jika GPS tersedia, gunakan `/mobile/customer/outlets/nearby` dengan parameter latitude/longitude yang sama.

---

## Customer App Data Flow

### Endpoint Usage

`DiscoveryRemoteDatasource` tidak memakai endpoint baru dan tidak menambahkan getter baru di `ApiEndpoints`.

Datasource memakai:

```dart
_endpoints.outlets
_endpoints.nearbyOutlets
```

Rules:

1. Jika latitude dan longitude tersedia, panggil `nearbyOutlets`.
2. Jika lokasi tidak tersedia, panggil `outlets`.
3. Selalu kirim `includeServices=true` untuk search, filter, dan recommendation layanan.
4. Jangan kirim `outletId` dari route. `outletId` hanya berasal dari filter yang dipilih user di discovery screen.
5. Untuk top outlets, `includeServices` boleh tidak dikirim jika tidak perlu flatten layanan.

### Response Mapping

Endpoint mengembalikan `List<OutletModel>`. Discovery app melakukan flatten:

```text
OutletModel
  categories[]
    laundryServices[]
      -> DiscoveryService
```

`DiscoveryService` menyimpan snapshot layanan dan outlet agar card dapat render tanpa request detail tambahan.

Field minimal:

```dart
class DiscoveryService {
  final int id;
  final String name;
  final double price;
  final int categoryId;
  final String? categoryName;
  final int unitId;
  final String? unitName;
  final String? unitSymbol;
  final double? averageRating;
  final int? reviewsCount;
  final bool supportsCourier;
  final String? courierSupportLabel;
  final String? courierSupportMessage;
  final int outletId;
  final String outletName;
  final double? outletDistance;
  final bool outletIsCurrentlyOpen;
  final bool outletIsCourierEnabled;
  final bool outletHasFreeShipping;
  final double? outletAverageRating;
  final int? outletReviewsCount;
}
```

### Filter Entity

`DiscoveryFilter` wajib mencakup seluruh filter MVP:

```dart
class DiscoveryFilter {
  final String? query;
  final int? outletId;
  final String? outletName;
  final int? categoryId;
  final String? categoryName;
  final int? unitId;
  final String? unitName;
  final double? priceMin;
  final double? priceMax;
  final bool? freeShippingEligible;
  final bool? supportsCourier;
  final String serviceSortBy; // relevant, best, cheapest, nearest, popular
}
```

---

## Proposed Changes

### Component 1: Domain Entities

#### [NEW] `discovery_service.dart`

Lokasi:

```text
apps/customer/lib/features/discovery/domain/entities/discovery_service.dart
```

Entity hasil flatten layanan + outlet snapshot.

#### [NEW] `discovery_filter.dart`

Lokasi:

```text
apps/customer/lib/features/discovery/domain/entities/discovery_filter.dart
```

Value object untuk filter state. Wajib support query, outlet, kategori, unit, range harga, gratis ongkir, courier, dan sort.

#### [NEW] `discovery_search_result.dart`

Lokasi:

```text
apps/customer/lib/features/discovery/domain/entities/discovery_search_result.dart
```

Wrapper berisi:

```dart
final List<DiscoveryService> services;
final DiscoveryFilter activeFilter;
final String? correctedQuery;
final bool hasReachedMax;
final int currentPage;
```

### Component 2: Data Layer

#### [NEW] `discovery_remote_datasource.dart`

Lokasi:

```text
apps/customer/lib/features/discovery/data/datasources/discovery_remote_datasource.dart
```

Method:

```dart
Future<List<OutletModel>> fetchDiscoveryOutlets({
  String? query,
  int? outletId,
  int? categoryId,
  int? unitId,
  double? priceMin,
  double? priceMax,
  bool? freeShippingEligible,
  bool? supportsCourier,
  String serviceSortBy = 'relevant',
  int page = 1,
  int perPage = 15,
  double? latitude,
  double? longitude,
});

Future<List<OutletModel>> fetchTopOutlets({
  int perPage = 5,
  double? latitude,
  double? longitude,
});
```

Implementation rules:

1. Gunakan `_endpoints.nearbyOutlets` saat latitude/longitude tersedia.
2. Gunakan `_endpoints.outlets` saat lokasi tidak tersedia.
3. `fetchDiscoveryOutlets` selalu mengirim `includeServices=true`.
4. `fetchTopOutlets` tidak wajib mengirim `includeServices=true`.
5. Gunakan pattern `_validateResponse()` dan `_handleError()` seperti datasource existing.
6. Remote datasource mengembalikan `OutletModel`, bukan entity dan bukan `Result`.

#### [NEW] `discovery_repository_impl.dart`

Lokasi:

```text
apps/customer/lib/features/discovery/data/repositories/discovery_repository_impl.dart
```

Responsibilities:

1. Memanggil remote datasource.
2. Flatten outlet/category/service menjadi `DiscoveryService`.
3. Menerapkan fallback client-side filter ringan hanya jika backend belum mengembalikan hasil yang sudah tepat.
4. Mengembalikan `Result` via try/catch + `_mapExceptionToFailure`.
5. Tidak membuat cache untuk MVP.

### Component 3: Domain Repository and Usecases

#### [NEW] `discovery_repository.dart`

Lokasi:

```text
apps/customer/lib/features/discovery/domain/repositories/discovery_repository.dart
```

Contract:

```dart
abstract class DiscoveryRepository {
  Future<Result<DiscoverySearchResult>> searchServices({
    required DiscoveryFilter filter,
    int page = 1,
    int perPage = 15,
    double? latitude,
    double? longitude,
  });

  Future<Result<List<DiscoveryService>>> getRecommendedServices({
    required String serviceSortBy,
    bool? freeShippingEligible,
    double? latitude,
    double? longitude,
    int perPage = 10,
  });

  Future<Result<List<Outlet>>> getTopOutlets({
    double? latitude,
    double? longitude,
    int perPage = 5,
  });
}
```

#### [NEW] Usecases

Lokasi:

```text
apps/customer/lib/features/discovery/domain/usecases/
```

Files:

1. `search_services_usecase.dart`
2. `get_recommended_services_usecase.dart`
3. `get_top_outlets_usecase.dart`

Usecase hanya mendelegasikan ke repository dan mengikuti `usecase_spec.md`.

### Component 4: Presentation State and Cubit

#### [NEW] `discovery_state.dart`

Lokasi:

```text
apps/customer/lib/features/discovery/presentation/bloc/discovery_state.dart
```

State:

```dart
sealed class DiscoveryState extends Equatable {}

class DiscoveryInitial extends DiscoveryState {}
class DiscoveryLoading extends DiscoveryState {}

class DiscoveryRecommendationsLoaded extends DiscoveryState {
  final List<DiscoveryService> bestServices;
  final List<DiscoveryService> cheapestServices;
  final List<DiscoveryService> freeShippingServices;
  final List<DiscoveryService> popularServices;
  final List<Outlet> topOutlets;
}

class DiscoverySearchResultLoaded extends DiscoveryState {
  final List<DiscoveryService> services;
  final DiscoveryFilter activeFilter;
  final String? correctedQuery;
  final bool hasReachedMax;
  final int currentPage;
}

class DiscoveryFailure extends DiscoveryState {
  final Failure failure;
}
```

#### [NEW] `discovery_cubit.dart`

Lokasi:

```text
apps/customer/lib/features/discovery/presentation/bloc/discovery_cubit.dart
```

Methods:

1. `loadRecommendations({double? latitude, double? longitude})`
2. `search(DiscoveryFilter filter)`
3. `loadMore()`
4. `updateFilter(DiscoveryFilter filter)`
5. `clearSearch()`

Rules:

1. `loadRecommendations` memanggil same endpoint melalui usecase sebanyak section yang dibutuhkan.
2. `clearSearch` menghapus query/filter dan kembali ke recommendations global.
3. `search` tidak boleh memakai initial route filter.
4. Semua result handling menggunakan `result.when()`.

### Component 5: Provider

#### [NEW] `discovery_provider.dart`

Lokasi:

```text
apps/customer/lib/features/discovery/presentation/providers/discovery_provider.dart
```

Static factory:

```dart
static DiscoveryCubit createCubit(Dio dio, ApiEndpoints endpoints)
```

Menyusun datasource, repository impl, usecases, dan cubit.

### Component 6: Screen

#### [NEW] `discovery_screen.dart`

Lokasi:

```text
apps/customer/lib/features/discovery/presentation/screens/discovery_screen.dart
```

Constructor:

```dart
const DiscoveryScreen({super.key});
```

Tidak menerima parameter awal seperti outlet atau filter dari route.

Layout:

```text
AppLayout
  AppHeader(title: 'Temukan Layanan')
  Column
    DiscoverySearchBarWidget
    DiscoveryQuickFilterBarWidget
    Expanded BlocBuilder<DiscoveryCubit, DiscoveryState>
```

Screen hanya orchestrate. Semua konten masuk ke widget kecil.

### Component 7: Widgets

Semua file berada di:

```text
apps/customer/lib/features/discovery/presentation/widgets/
```

#### Search and Filter

| File | Tanggung jawab |
|------|----------------|
| `discovery_search_bar_widget.dart` | `AppTextField` dengan debounce 500ms, search icon, clear button |
| `discovery_quick_filter_bar_widget.dart` | Horizontal chips: Gratis Ongkir, Bisa Pickup/Delivery, Filter, Sort |
| `discovery_filter_bottom_sheet_widget.dart` | Filter lanjutan: outlet, kategori, unit, harga min/max, gratis ongkir, courier |
| `discovery_outlet_filter_widget.dart` | Picker outlet dari data outlet yang tersedia |
| `discovery_category_filter_widget.dart` | Picker kategori dari categories yang tersedia |
| `discovery_unit_filter_widget.dart` | Picker unit dari services yang tersedia |
| `discovery_price_range_filter_widget.dart` | Input harga minimum dan maksimum |
| `discovery_sort_selector_widget.dart` | Sort: Relevan, Terbaik, Termurah, Terdekat, Populer |

#### Recommendation

| File | Tanggung jawab |
|------|----------------|
| `discovery_recommendations_content_widget.dart` | Menyusun semua section rekomendasi |
| `discovery_section_header_widget.dart` | Header reusable section |
| `discovery_service_horizontal_list_widget.dart` | Horizontal list service card |
| `discovery_outlet_horizontal_list_widget.dart` | Horizontal list outlet, reuse `OutletCard` jika cocok |

#### Search Result

| File | Tanggung jawab |
|------|----------------|
| `discovery_search_result_content_widget.dart` | Vertical list hasil search + empty state |
| `discovery_typo_correction_banner_widget.dart` | Banner corrected query jika backend menyediakan |
| `discovery_search_empty_state_widget.dart` | `AppEmptyState.search` dengan saran hapus filter / ubah keyword |

#### Shared Cards

| File | Tanggung jawab |
|------|----------------|
| `discovery_service_card_widget.dart` | Card layanan utama |
| `discovery_service_outlet_info_widget.dart` | Nama outlet, jarak, buka/tutup |
| `discovery_service_badges_widget.dart` | Badge kurir, gratis ongkir, rating |

### Component 8: Routing

#### [MODIFY] `apps/customer/lib/core/router/app_router.dart`

Tambahkan standalone route:

```dart
GoRoute(
  path: '/discovery',
  builder: (context, state) {
    return BlocProvider(
      create: (_) => DiscoveryProvider.createCubit(dio, endpoints)
        ..loadRecommendations(),
      child: const DiscoveryScreen(),
    );
  },
),
```

Rules:

1. Jangan tambahkan branch baru pada bottom navigation.
2. Jangan mengganti route `/outlets`.
3. Jangan parse query param `outletId`.
4. Discovery bisa dibuka dari Home dengan `context.push('/discovery')`.

### Component 9: Home Entry Point

Tambahkan entry point ringan dari Home menuju discovery.

Pilihan implementasi:

1. Tambahkan search/CTA di `HomeScreen` atau `HomeHeader` dengan label **Cari layanan**.
2. CTA membuka `/discovery`.
3. Tidak mengirim parameter awal apa pun.

Jika UI Home belum siap menerima komponen baru, entry point dapat berupa button/icon di area yang sudah ada tanpa mengubah bottom navigation.

---

## Struktur File Final

```text
apps/customer/lib/features/discovery/
  data/
    datasources/
      discovery_remote_datasource.dart
    repositories/
      discovery_repository_impl.dart
  domain/
    entities/
      discovery_service.dart
      discovery_filter.dart
      discovery_search_result.dart
    repositories/
      discovery_repository.dart
    usecases/
      search_services_usecase.dart
      get_recommended_services_usecase.dart
      get_top_outlets_usecase.dart
  presentation/
    bloc/
      discovery_cubit.dart
      discovery_state.dart
    providers/
      discovery_provider.dart
    screens/
      discovery_screen.dart
    widgets/
      discovery_search_bar_widget.dart
      discovery_quick_filter_bar_widget.dart
      discovery_filter_bottom_sheet_widget.dart
      discovery_outlet_filter_widget.dart
      discovery_category_filter_widget.dart
      discovery_unit_filter_widget.dart
      discovery_price_range_filter_widget.dart
      discovery_sort_selector_widget.dart
      discovery_recommendations_content_widget.dart
      discovery_section_header_widget.dart
      discovery_service_horizontal_list_widget.dart
      discovery_outlet_horizontal_list_widget.dart
      discovery_search_result_content_widget.dart
      discovery_typo_correction_banner_widget.dart
      discovery_search_empty_state_widget.dart
      discovery_service_card_widget.dart
      discovery_service_outlet_info_widget.dart
      discovery_service_badges_widget.dart
```

Modified existing files:

```text
webapp/wash_wallet_be/app/Http/Controllers/Api/OutletController.php
webapp/wash_wallet_be/app/Services/OutletService.php
webapp/wash_wallet_be/app/Models/Outlet.php
apps/customer/lib/core/router/app_router.dart
apps/customer/lib/features/home/presentation/screens/home_screen.dart
```

Do not modify `ApiEndpoints` unless existing endpoint getter names need cleanup. `laundryServices` is not used for this discovery feature.

---

## Verification Plan

### Automated Checks

```bash
cd apps/customer && flutter analyze
cd apps/customer && flutter build apk --debug
cd webapp/wash_wallet_be && php artisan test
```

If full backend tests are too slow, run focused tests for outlet API/service filtering after adding coverage.

### Manual Verification

1. Open Home and navigate to `/discovery`.
2. Verify discovery does not replace or alter the Outlet tab.
3. Verify discovery opens with no route-provided filter active.
4. Verify search kosong loads recommendation sections.
5. Verify recommendation sections call existing outlet endpoint with different params/sorts.
6. Search service keyword and verify service cards show outlet info.
7. Apply outlet filter from inside discovery and verify results narrow to that outlet.
8. Apply category filter and verify results narrow to that category.
9. Apply unit filter and verify results narrow to that unit.
10. Apply price min/max and verify service prices stay within range.
11. Apply gratis ongkir filter and verify only eligible outlet services appear.
12. Apply bisa pickup/delivery filter and verify service + outlet courier eligibility.
13. Sort cheapest and verify ascending service price.
14. Sort best/popular and verify stable non-empty ordering when data exists.
15. Disable GPS and verify discovery still works through `/outlets`.
16. Enable GPS and verify discovery uses `/outlets/nearby`.
17. Tap service card and verify navigation to outlet detail works.
18. Confirm `/outlets` tab behavior is unchanged when `includeServices` is not sent.

### Documentation Validation

Pastikan dokumen tidak lagi memiliki bagian pertanyaan terbuka atau asumsi bahwa discovery membutuhkan route API baru, getter endpoint baru, parameter awal outlet dari route, atau penundaan filter kategori/unit/range harga.
