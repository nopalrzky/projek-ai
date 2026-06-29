# Discovery Content Improvement Plan

Meningkatkan konten Discovery agar customer dapat melihat informasi outlet dan layanan unggulan langsung dari outlet card tanpa membuka detail outlet satu per satu. Mode browse/rekomendasi menggunakan outlet-first content pattern, sementara search aktif tetap menggunakan service-first content pattern sesuai keputusan produk existing.

## Keputusan User Review

> [!IMPORTANT]
> 1. Endpoint API baru tidak diperlukan. Menggunakan endpoint existing `GET /mobile/customer/outlets` dan `GET /mobile/customer/outlets/nearby` dengan `includeServices=true`.
> 2. Mode browse/rekomendasi Discovery berubah dari service-first ke outlet-first content pattern.
> 3. Search aktif tetap menggunakan service-first content pattern sesuai `customer_service_discovery_search_filter_plan.md`. Tidak ada perubahan keputusan produk pada search mode.
> 4. Top Services menggunakan fallback ranking MVP: layanan aktif dengan urutan dari backend. Ranking advanced (most ordered, popular, revenue) ditandai sebagai next iteration.
> 5. ShowOutletScreen diperluas agar bisa menerima `serviceId` query parameter untuk quick select service.
> 6. Navigation contract menggunakan GoRouter query parameter: `/outlets/{outletId}?serviceId={serviceId}&openService=true`.

## Open Questions

> [!IMPORTANT]
> 1. **Section rekomendasi service existing**: Apakah section horizontal rekomendasi service existing (Layanan Terbaik, Paling Murah, Diskon Ongkir, Populer) tetap dipertahankan di atas outlet cards, atau diganti sepenuhnya oleh outlet cards dengan top services? **Rekomendasi default: diganti sepenuhnya oleh outlet cards.**
> 2. **Section Top Outlet existing**: Section "Outlet Terbaik" yang menampilkan outlet horizontal list di bagian bawah recommendations — apakah dihapus karena outlet cards sudah menjadi konten utama? **Rekomendasi default: dihapus karena redundan.**
> 3. **Pagination outlet cards**: Apakah outlet cards di mode browse menggunakan infinite scroll pagination atau cukup satu halaman saja? **Rekomendasi default: infinite scroll pagination seperti search mode.**

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

Tidak ada endpoint baru atau perubahan backend. Menggunakan endpoint existing:

```text
GET /mobile/customer/outlets
GET /mobile/customer/outlets/nearby
```

Kedua endpoint sudah mendukung `includeServices=true` yang mengembalikan outlet beserta categories dan laundry services. Data ini sudah cukup untuk:
- Outlet information (nama, alamat, rating, review, status, jarak, courier)
- Top services (layanan dari categories outlet)

---

## Phase 1: Domain Layer — Discovery Outlet Entity

### Komponen: Entity Baru

#### [NEW] [discovery_outlet.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/domain/entities/discovery_outlet.dart)

Entity `DiscoveryOutlet` yang merepresentasikan satu outlet card di Discovery. Entity ini berbeda dari `Outlet` domain karena sudah berisi top services yang sudah di-flatten dan difilter.

```dart
class DiscoveryOutlet extends Equatable {
  final int id;
  final String name;
  final String? thumbnailUrl;
  final String? shortAddress;
  final String? fullAddress;
  final double? averageRating;
  final int? reviewsCount;
  final double? distanceKm;
  final bool isCurrentlyOpen;
  final bool isCourierEnabled;
  final bool hasFreeShipping;
  final bool hasUnconditionalFreeShipping;
  final List<DiscoveryTopService> topServices;
}
```

---

#### [NEW] [discovery_top_service.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/domain/entities/discovery_top_service.dart)

Entity `DiscoveryTopService` yang merepresentasikan satu service card sederhana di dalam outlet card Discovery. Hanya berisi informasi minimum sesuai user need.

```dart
class DiscoveryTopService extends Equatable {
  final int id;
  final int outletId;
  final String name;
  final String? thumbnailUrl;
  final double priceStartsFrom;
  final String? unitName;
  final String? unitSymbol;
  final bool isActive;
  final bool supportsCourier;
}
```

---

## Phase 2: Domain Layer — Repository & Usecase

### Komponen: Repository

#### [MODIFY] [discovery_repository.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/domain/repositories/discovery_repository.dart)

Tambahkan method baru untuk mendapatkan discovery outlets:

```dart
Future<Result<List<DiscoveryOutlet>>> getDiscoveryOutlets({
  double? latitude,
  double? longitude,
  int page = 1,
  int perPage = 15,
});
```

Method existing (`searchServices`, `getRecommendedServices`, `getTopOutlets`) tidak diubah.

---

### Komponen: Usecase

#### [NEW] [get_discovery_outlets_usecase.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/domain/usecases/get_discovery_outlets_usecase.dart)

Usecase baru yang memanggil `DiscoveryRepository.getDiscoveryOutlets()`. Mengikuti pattern existing `GetTopOutletsUsecase`.

```dart
class GetDiscoveryOutletsUsecase {
  final DiscoveryRepository _repository;

  GetDiscoveryOutletsUsecase(this._repository);

  Future<Result<List<DiscoveryOutlet>>> call({
    double? latitude,
    double? longitude,
    int page = 1,
    int perPage = 15,
  }) {
    return _repository.getDiscoveryOutlets(
      latitude: latitude,
      longitude: longitude,
      page: page,
      perPage: perPage,
    );
  }
}
```

---

## Phase 3: Data Layer — Repository Implementation

### Komponen: Repository Impl

#### [MODIFY] [discovery_repository_impl.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/data/repositories/discovery_repository_impl.dart)

Implementasikan `getDiscoveryOutlets`:

1. Panggil `_remoteDatasource.fetchDiscoveryOutlets()` dengan parameter lokasi.
2. Untuk setiap `OutletModel`, konversi ke `DiscoveryOutlet` menggunakan method `_mapToDiscoveryOutlet`.
3. Method `_mapToDiscoveryOutlet`:
   - Ambil semua `LaundryService` dari semua categories outlet.
   - Filter hanya layanan aktif (`isActive == true`).
   - Ambil maksimal 9 layanan pertama (MVP fallback ranking: urutan dari backend).
   - Map setiap layanan ke `DiscoveryTopService`.
   - Susun `DiscoveryOutlet` dengan data outlet + top services.

```dart
@override
Future<Result<List<DiscoveryOutlet>>> getDiscoveryOutlets({
  double? latitude,
  double? longitude,
  int page = 1,
  int perPage = 15,
}) async {
  try {
    final response = await _remoteDatasource.fetchDiscoveryOutlets(
      page: page,
      perPage: perPage,
      latitude: latitude,
      longitude: longitude,
    );
    
    final outlets = response.outlets
        .map((model) => _mapToDiscoveryOutlet(model))
        .toList();
    
    return Result.success(outlets);
  } catch (e) {
    return Result.failure(_mapExceptionToFailure(e));
  }
}

DiscoveryOutlet _mapToDiscoveryOutlet(OutletModel model) {
  final outlet = model.toEntity();
  final allServices = (outlet.categories ?? <Category>[])
      .expand((c) => c.laundryServices ?? <LaundryService>[])
      .where((s) => s.isActive)
      .take(9)
      .toList();
  
  return DiscoveryOutlet(
    id: outlet.id,
    name: outlet.name,
    shortAddress: outlet.districtName != null && outlet.cityName != null
        ? '${outlet.districtName}, ${outlet.cityName}'
        : outlet.fullAddress,
    fullAddress: outlet.fullAddress,
    averageRating: outlet.averageRating,
    reviewsCount: outlet.reviewsCount,
    distanceKm: outlet.distance,
    isCurrentlyOpen: outlet.isCurrentlyOpen,
    isCourierEnabled: outlet.isCourierEnabled,
    hasFreeShipping: outlet.hasFreeShipping,
    hasUnconditionalFreeShipping: outlet.hasUnconditionalFreeShipping,
    topServices: allServices.map((s) => DiscoveryTopService(
      id: s.id,
      outletId: outlet.id,
      name: s.name,
      priceStartsFrom: s.price,
      unitName: s.unit?.name,
      unitSymbol: s.unit?.symbol,
      isActive: s.isActive,
      supportsCourier: s.supportsCourier && outlet.isCourierEnabled,
    )).toList(),
  );
}
```

---

## Phase 4: State Management — Cubit & State

### Komponen: Discovery State

#### [MODIFY] [discovery_state.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/bloc/discovery_state.dart)

Tambah state baru `DiscoveryOutletsLoaded` untuk mode browse/rekomendasi outlet-first:

```dart
class DiscoveryOutletsLoaded extends DiscoveryState {
  final List<DiscoveryOutlet> outlets;
  final bool hasReachedMax;
  final int currentPage;
  final bool isLoadMore;

  const DiscoveryOutletsLoaded({
    required this.outlets,
    this.hasReachedMax = false,
    this.currentPage = 1,
    this.isLoadMore = false,
  });

  DiscoveryOutletsLoaded copyWith({
    List<DiscoveryOutlet>? outlets,
    bool? hasReachedMax,
    int? currentPage,
    bool? isLoadMore,
  }) { ... }
}
```

> [!WARNING]
> State `DiscoveryRecommendationsLoaded` tetap dipertahankan sementara agar tidak breaking. Setelah outlet-first pattern terbukti stabil, state ini bisa dihapus di iterasi berikutnya jika open question #1 disetujui untuk mengganti sepenuhnya.

---

### Komponen: Discovery Cubit

#### [MODIFY] [discovery_cubit.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/bloc/discovery_cubit.dart)

Tambahkan dependency `GetDiscoveryOutletsUsecase` dan method baru:

1. Tambah `_getDiscoveryOutletsUsecase` sebagai dependency.
2. Ubah `loadRecommendations()` menjadi memanggil `_getDiscoveryOutletsUsecase` dan emit `DiscoveryOutletsLoaded`.
3. Tambah method `loadMoreOutlets()` untuk infinite scroll pagination pada mode browse.
4. Sesuaikan `clearSearch()`, `refreshForLocation()`, `refresh()`, dan `retry()` agar menangani state `DiscoveryOutletsLoaded`.

```dart
DiscoveryCubit({
  required SearchServicesUsecase searchServicesUsecase,
  required GetRecommendedServicesUsecase getRecommendedServicesUsecase,
  required GetTopOutletsUsecase getTopOutletsUsecase,
  required GetDiscoveryOutletsUsecase getDiscoveryOutletsUsecase,
}) : ...

Future<void> loadRecommendations({
  double? latitude,
  double? longitude,
}) async {
  _lastLatitude = latitude;
  _lastLongitude = longitude;
  _lastFilter = const DiscoveryFilter();

  emit(const DiscoveryLoading());

  final result = await _getDiscoveryOutletsUsecase(
    latitude: latitude,
    longitude: longitude,
    page: 1,
    perPage: _perPage,
  );

  result.when(
    success: (outlets) => emit(DiscoveryOutletsLoaded(
      outlets: outlets,
      hasReachedMax: outlets.length < _perPage,
      currentPage: 1,
    )),
    failure: (failure) => emit(DiscoveryFailure(failure)),
  );
}

Future<void> loadMoreOutlets() async {
  final currentState = state;
  if (currentState is! DiscoveryOutletsLoaded) return;
  if (currentState.hasReachedMax || currentState.isLoadMore) return;

  emit(currentState.copyWith(isLoadMore: true));
  
  final nextPage = currentState.currentPage + 1;
  final result = await _getDiscoveryOutletsUsecase(
    latitude: _lastLatitude,
    longitude: _lastLongitude,
    page: nextPage,
    perPage: _perPage,
  );

  result.when(
    success: (outlets) => emit(DiscoveryOutletsLoaded(
      outlets: [...currentState.outlets, ...outlets],
      hasReachedMax: outlets.length < _perPage,
      currentPage: nextPage,
    )),
    failure: (failure) => emit(DiscoveryFailure(failure)),
  );
}
```

Sesuaikan method existing:

- `loadMore()`: tambah check `if (currentState is DiscoveryOutletsLoaded) return loadMoreOutlets()`.
- `clearSearch()`: tetap memanggil `loadRecommendations()`.
- `refresh()`: tambah check `if (currentState is DiscoveryOutletsLoaded) return loadRecommendations(...)`.
- `retry()`: tetap berfungsi sama.

---

### Komponen: Provider

#### [MODIFY] [discovery_provider.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/providers/discovery_provider.dart)

Tambahkan factory method untuk `GetDiscoveryOutletsUsecase` dan pass ke `DiscoveryCubit`:

```dart
static GetDiscoveryOutletsUsecase createGetDiscoveryOutletsUsecase(
  DiscoveryRepository repository,
) {
  return GetDiscoveryOutletsUsecase(repository);
}

static DiscoveryCubit createCubit(Dio dio, ApiEndpoints endpoints) {
  final remoteDatasource = createRemoteDatasource(dio, endpoints);
  final repository = createRepository(remoteDatasource);

  return DiscoveryCubit(
    searchServicesUsecase: createSearchServicesUsecase(repository),
    getRecommendedServicesUsecase: createGetRecommendedServicesUsecase(repository),
    getTopOutletsUsecase: createGetTopOutletsUsecase(repository),
    getDiscoveryOutletsUsecase: createGetDiscoveryOutletsUsecase(repository),
  );
}
```

---

## Phase 5: Presentation — Outlet Card Widgets

### Komponen: Outlet Card

#### [NEW] [discovery_outlet_card_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/widgets/discovery_outlet_card_widget.dart)

Widget utama yang merepresentasikan satu Outlet Card. Menyusun `DiscoveryOutletInfoWidget` dan `DiscoveryTopServicesWidget`.

- Menggunakan `AppCard.elevated` sebagai container.
- Area outlet information di-tap mengarah ke `onOutletTap`.
- Top services section di dalamnya mengarah ke `onServiceTap` dan `onViewAllTap`.

```dart
class DiscoveryOutletCardWidget extends StatelessWidget {
  final DiscoveryOutlet outlet;
  final void Function(DiscoveryOutlet outlet) onOutletTap;
  final void Function(DiscoveryTopService service) onServiceTap;
  final void Function(DiscoveryOutlet outlet) onViewAllTap;
}
```

---

#### [NEW] [discovery_outlet_info_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/widgets/discovery_outlet_info_widget.dart)

Bagian atas outlet card yang menampilkan informasi outlet. Seluruh area ini clickable menuju Outlet Show Screen.

Informasi yang ditampilkan:
1. Nama outlet (teks dominan, `headlineSmall` + `bold`)
2. Alamat singkat (max 1 baris dengan ellipsis)
3. Row metadata: rating + review count (jika ada) • jarak (jika ada) • status buka/tutup
4. Badge courier jika outlet mendukung kurir

Aturan:
- Jika `averageRating == null`, jangan tampilkan rating sama sekali
- Jika `isCurrentlyOpen == false`, tampilkan label `Tutup` dengan warna `context.colors.error`
- Jika `isCurrentlyOpen == true`, tampilkan label `Buka` dengan warna `context.colors.success`
- Alamat menggunakan `shortAddress`, fallback ke `fullAddress` dengan `maxLines: 1, overflow: TextOverflow.ellipsis`

```dart
class DiscoveryOutletInfoWidget extends StatelessWidget {
  final DiscoveryOutlet outlet;
  final VoidCallback onTap;
}
```

---

#### [NEW] [discovery_top_services_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/widgets/discovery_top_services_widget.dart)

Section "Layanan unggulan" di dalam outlet card. Menampilkan header dengan title dan CTA "Lihat Semua", lalu horizontal scrollable list of service cards.

- Section header: `Text('Layanan unggulan')` di kiri, `TextButton('Lihat Semua')` di kanan.
- Horizontal scroll `ListView.builder` dengan `scrollDirection: Axis.horizontal`.
- Section disembunyikan jika `topServices` kosong.
- CTA "Lihat Semua" disembunyikan jika tidak ada layanan.

```dart
class DiscoveryTopServicesWidget extends StatelessWidget {
  final List<DiscoveryTopService> services;
  final void Function(DiscoveryTopService service) onServiceTap;
  final VoidCallback onViewAllTap;
}
```

---

#### [NEW] [discovery_top_service_card_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/widgets/discovery_top_service_card_widget.dart)

Service card sederhana di dalam horizontal list. Menampilkan informasi minimum sesuai user need.

Informasi yang ditampilkan:
1. Ikon layanan (placeholder dengan `Icons.local_laundry_service_rounded` dalam container berwarna)
2. Nama layanan (max 1 baris dengan ellipsis)
3. Harga mulai: `Mulai Rp{harga}/{unit}` atau `Mulai Rp{harga}` jika unit tidak tersedia

Ukuran card: fixed width ~140px agar 2-3 card terlihat sekaligus di viewport.

```dart
class DiscoveryTopServiceCardWidget extends StatelessWidget {
  final DiscoveryTopService service;
  final VoidCallback onTap;
}
```

---

### Komponen: Skeleton Loading

#### [NEW] [discovery_outlet_card_skeleton_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/widgets/discovery_outlet_card_skeleton_widget.dart)

Skeleton loading yang mencerminkan struktur outlet card (outlet info placeholder + horizontal service cards placeholder). Menggunakan `Container` dengan `color: context.colors.surfaceVariant` dan border radius untuk shimmer effect.

```dart
class DiscoveryOutletCardSkeletonWidget extends StatelessWidget {
  const DiscoveryOutletCardSkeletonWidget({super.key});
}
```

---

### Komponen: Outlet Content Container

#### [NEW] [discovery_outlet_content_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/widgets/discovery_outlet_content_widget.dart)

Container widget yang menampilkan list of outlet cards dengan RefreshIndicator, pagination loading indicator, dan empty state. Menggantikan `DiscoveryRecommendationsContentWidget` pada mode browse.

- Menggunakan `RefreshIndicator` + `ListView.builder`
- Setiap item adalah `DiscoveryOutletCardWidget`
- Loading more indicator di bagian bawah
- Empty state jika list kosong: "Belum ada outlet yang cocok"
- Scroll controller untuk infinite scroll

```dart
class DiscoveryOutletContentWidget extends StatelessWidget {
  final List<DiscoveryOutlet> outlets;
  final bool hasReachedMax;
  final bool isLoadMore;
  final ScrollController scrollController;
  final VoidCallback onRefresh;
  final void Function(DiscoveryOutlet outlet) onOutletTap;
  final void Function(DiscoveryTopService service) onServiceTap;
  final void Function(DiscoveryOutlet outlet) onViewAllTap;
}
```

---

## Phase 6: Presentation — Discovery Screen Update

### Komponen: Discovery Screen

#### [MODIFY] [discovery_screen.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/screens/discovery_screen.dart)

Update `BlocBuilder` pattern matching untuk menangani state `DiscoveryOutletsLoaded`:

```dart
return switch (state) {
  DiscoveryInitial() || DiscoveryLoading() => const Center(
    child: AppLoadingIndicator(),
  ),
  DiscoveryFailure(:final failure) => AppEmptyState.error(...),
  DiscoveryOutletsLoaded(
    :final outlets,
    :final hasReachedMax,
    :final isLoadMore,
  ) => DiscoveryOutletContentWidget(
    outlets: outlets,
    hasReachedMax: hasReachedMax,
    isLoadMore: isLoadMore,
    scrollController: _scrollController,
    onRefresh: () => context.read<DiscoveryCubit>().refresh(),
    onOutletTap: (outlet) => context.push('/outlets/${outlet.id}'),
    onServiceTap: _openQuickSelectService,
    onViewAllTap: (outlet) => context.push('/outlets/${outlet.id}'),
  ),
  DiscoveryRecommendationsLoaded(...) => DiscoveryRecommendationsContentWidget(...),
  DiscoverySearchResultLoaded(...) => DiscoverySearchResultContentWidget(...),
};
```

Tambahkan method baru `_openQuickSelectService`:

```dart
void _openQuickSelectService(DiscoveryTopService service) {
  context.push(
    '/outlets/${service.outletId}?serviceId=${service.id}&openService=true',
  );
}
```

Sesuaikan `_onScroll()` agar memanggil `loadMore()` yang sudah di-update (menangani kedua mode).

Sesuaikan `_servicesForState()` dan `_filterForState()`:
- `DiscoveryOutletsLoaded` mengembalikan empty list untuk services (filter bar tidak relevan pada mode browse). Filter bar tetap ditampilkan untuk memulai search.

---

## Phase 7: Navigation — Quick Select Service

### Komponen: Router

#### [MODIFY] [app_router.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/core/router/app_router.dart)

Update route `/outlets/:id` untuk membaca query parameters:

```dart
GoRoute(
  path: '/outlets/:id',
  builder: (context, state) {
    final id = int.parse(state.pathParameters['id']!);
    final serviceId = int.tryParse(
      state.uri.queryParameters['serviceId'] ?? '',
    );
    final openService = state.uri.queryParameters['openService'] == 'true';
    
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (context) =>
              OutletProvider.createOutletCubit(dio, endpoints)
                ..getById(id: id),
        ),
      ],
      child: ShowOutletScreen(
        outletId: id,
        initialServiceId: serviceId,
        openServiceOnLoad: openService && serviceId != null,
      ),
    );
  },
  routes: [...],
),
```

---

### Komponen: ShowOutletScreen

#### [MODIFY] [show_outlet_screen.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/outlet/presentation/screens/show_outlet_screen.dart)

Tambahkan parameter baru dan logic auto-open service bottom sheet:

```dart
class ShowOutletScreen extends StatefulWidget {
  final int outletId;
  final int? initialServiceId;
  final bool openServiceOnLoad;

  const ShowOutletScreen({
    super.key,
    required this.outletId,
    this.initialServiceId,
    this.openServiceOnLoad = false,
  });
}
```

Pada `BlocConsumer.listener`, setelah state berubah ke `OutletDetailLoaded`:

```dart
listener: (context, state) {
  if (state is OutletDetailLoaded) {
    // ... existing category keys logic ...
    // ... existing cart logic ...
    
    if (widget.openServiceOnLoad && widget.initialServiceId != null) {
      _autoOpenServiceBottomSheet(state.outlet);
    }
  }
},
```

Method `_autoOpenServiceBottomSheet`:

```dart
void _autoOpenServiceBottomSheet(Outlet outlet) {
  final allServices = (outlet.categories ?? [])
      .expand((c) => c.laundryServices ?? [])
      .toList();
  
  final targetService = allServices.where(
    (s) => s.id == widget.initialServiceId,
  ).firstOrNull;
  
  if (targetService == null || !targetService.isActive) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Layanan ini sudah tidak tersedia. Silakan pilih layanan lain.'),
      ),
    );
    return;
  }
  
  WidgetsBinding.instance.addPostFrameCallback((_) {
    if (!mounted) return;
    _onServiceTap(targetService, outlet.name);
  });
}
```

> [!NOTE]
> `_autoOpenServiceBottomSheet` menggunakan `addPostFrameCallback` agar bottom sheet dibuka setelah UI selesai build. Gunakan flag `_hasAutoOpened` agar hanya dipanggil sekali.

---

## Phase 8: Edge Cases

### Handling pada masing-masing komponen:

| Edge Case | Komponen | Handling |
|-----------|----------|----------|
| Outlet tanpa foto | `DiscoveryOutletInfoWidget` | Field `thumbnailUrl` tidak digunakan di MVP, info section berbasis teks |
| Service tanpa foto | `DiscoveryTopServiceCardWidget` | Tampilkan icon placeholder `Icons.local_laundry_service_rounded` |
| Outlet tanpa rating | `DiscoveryOutletInfoWidget` | Sembunyikan rating dan review count, hanya tampilkan status dan jarak |
| Alamat sangat panjang | `DiscoveryOutletInfoWidget` | `maxLines: 1, overflow: TextOverflow.ellipsis` |
| Outlet tutup | `DiscoveryOutletInfoWidget` | Label `Tutup` dengan `context.colors.error`, card tetap ditampilkan |
| Outlet tanpa layanan aktif | `DiscoveryOutletCardWidget` | Section Top Services disembunyikan, CTA Lihat Semua disembunyikan |
| Layanan < 9 item | `DiscoveryTopServicesWidget` | Tampilkan semua layanan yang ada |
| Layanan tidak tersedia saat diklik | `ShowOutletScreen._autoOpenServiceBottomSheet` | SnackBar dengan pesan "Layanan ini sudah tidak tersedia" |
| Harga berubah setelah load | Backend validasi | Backend tetap memvalidasi ulang saat add to cart |
| Unit harga tidak tersedia | `DiscoveryTopServiceCardWidget` | Tampilkan `Mulai Rp{harga}` tanpa unit |
| Ganti alamat aktif | `DiscoveryCubit.refreshForLocation` | Reload outlet cards dengan lokasi baru |
| Outlet di luar coverage | Backend filter | Backend sudah memfilter via `nearbyOutlets` endpoint |
| Navigation gagal | GoRouter | GoRouter error handling standard |
| Service bottom sheet gagal buka | `_autoOpenServiceBottomSheet` | Check `mounted` dan `firstOrNull`, fallback SnackBar |
| Cart conflict (outlet lain) | `ShowOutletScreen._onServiceTap` | Dialog konfirmasi sudah ada di existing code |

---

## File Summary

### File Baru (7 files)

| # | File | Tipe |
|---|------|------|
| 1 | [discovery_outlet.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/domain/entities/discovery_outlet.dart) | Entity |
| 2 | [discovery_top_service.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/domain/entities/discovery_top_service.dart) | Entity |
| 3 | [get_discovery_outlets_usecase.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/domain/usecases/get_discovery_outlets_usecase.dart) | Usecase |
| 4 | [discovery_outlet_card_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/widgets/discovery_outlet_card_widget.dart) | Widget |
| 5 | [discovery_outlet_info_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/widgets/discovery_outlet_info_widget.dart) | Widget |
| 6 | [discovery_top_services_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/widgets/discovery_top_services_widget.dart) | Widget |
| 7 | [discovery_top_service_card_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/widgets/discovery_top_service_card_widget.dart) | Widget |
| 8 | [discovery_outlet_card_skeleton_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/widgets/discovery_outlet_card_skeleton_widget.dart) | Widget |
| 9 | [discovery_outlet_content_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/widgets/discovery_outlet_content_widget.dart) | Widget |

### File Dimodifikasi (6 files)

| # | File | Perubahan |
|---|------|-----------|
| 1 | [discovery_repository.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/domain/repositories/discovery_repository.dart) | Tambah `getDiscoveryOutlets` method |
| 2 | [discovery_repository_impl.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/data/repositories/discovery_repository_impl.dart) | Implementasi `getDiscoveryOutlets` + `_mapToDiscoveryOutlet` |
| 3 | [discovery_state.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/bloc/discovery_state.dart) | Tambah `DiscoveryOutletsLoaded` state |
| 4 | [discovery_cubit.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/bloc/discovery_cubit.dart) | Ubah `loadRecommendations` + tambah `loadMoreOutlets` |
| 5 | [discovery_provider.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/providers/discovery_provider.dart) | Wire up `GetDiscoveryOutletsUsecase` |
| 6 | [discovery_screen.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/screens/discovery_screen.dart) | Handle `DiscoveryOutletsLoaded` + `_openQuickSelectService` |
| 7 | [app_router.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/core/router/app_router.dart) | Tambah `serviceId` + `openService` query params |
| 8 | [show_outlet_screen.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/outlet/presentation/screens/show_outlet_screen.dart) | Tambah `initialServiceId` + `openServiceOnLoad` + auto-open logic |

---

## Next Iteration (Out of Scope)

1. **Ranking advanced Top Services** — most ordered, popular, revenue, rating signals dari backend.
2. **Thumbnail outlet dan service** — tampilkan foto dari `thumbnailUrl` jika tersedia.
3. **Analytics** — CTR tracking pada outlet card, service card, dan CTA Lihat Semua.
4. **Hapus state `DiscoveryRecommendationsLoaded`** — setelah outlet-first pattern stabil.
5. **Promo indicator** — indikator ringkas promo di service card jika bisnis membutuhkan.
6. **Image loading optimization** — lazy loading, caching, dan placeholder untuk thumbnail.

---

## Verification Plan

### Automated Tests

Tidak ada automated test yang dijalankan karena project tidak memiliki test suite yang aktif.

### Manual Verification

1. **Build check**: `flutter build apk --debug` harus berhasil tanpa error.
2. **Discovery browse mode**: Buka Discovery tanpa query — harus menampilkan outlet cards dengan top services.
3. **Outlet card content**: Verifikasi nama, alamat, rating, status outlet tampil benar.
4. **Top services horizontal scroll**: Verifikasi layanan tampil horizontal, maksimal 9 item.
5. **Tap outlet info**: Harus navigasi ke Outlet Show Screen tanpa membuka service bottom sheet.
6. **Tap service card**: Harus navigasi ke Outlet Show Screen dan otomatis membuka service bottom sheet.
7. **Tap Lihat Semua**: Harus navigasi ke Outlet Show Screen tanpa membuka service bottom sheet.
8. **Service tidak tersedia**: Jika layanan sudah tidak aktif, harus menampilkan SnackBar pesan error.
9. **Outlet tutup**: Label status `Tutup` harus terlihat jelas.
10. **Empty state**: Jika tidak ada outlet, tampilkan empty state yang benar.
11. **Loading state**: Skeleton outlet card harus tampil saat loading.
12. **Infinite scroll**: Scroll ke bawah harus memuat outlet cards berikutnya.
13. **Search mode**: Ketik query di search bar — harus tetap menampilkan service-first search results (tidak berubah).
14. **Ganti alamat**: Ganti alamat aktif — outlet cards harus reload sesuai lokasi baru.
