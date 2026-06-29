# Implementation Plan: Customer Outlet Feature

**Tujuan:**
Mengimplementasikan layer Data, Domain, dan Presentation (State & Cubit) untuk fitur pencarian dan detail Outlet pada aplikasi Customer, sesuai dengan _API Contract_ dan _Context_ yang telah diberikan.

**Catatan Khusus:**
Sesuai permintaan, pengelolaan State dan logika presentasi (List dan Detail) digabung menjadi **Satu Cubit** (`OutletCubit`).

---

## 1. Domain Layer (`packages/wash_wallet_domain`)

Kita akan mendefinisikan interface dan usecase yang dibutuhkan oleh aplikasi Customer.

### a. Update / Tambah Entity

Pastikan entity `Outlet` memiliki field yang mendukung data dari customer API, seperti:

- `id` (int)
- `name` (String)
- `status` (String)
- `distance` (double?) -> _Opsional, untuk menampung jarak pada endpoint nearby._
- Serta field pendukung lain (alamat, latitude, longitude, dsb).

### b. Repository Interface

Buat `OutletRepository` di `wash_wallet_domain/lib/src/outlet/repositories/customer_outlet_repository.dart`:

```dart
abstract class OutletRepository {
  Future<Result<PaginatedData<Outlet>>> getAll({
    bool exposureOnly = true,
    int page = 1,
    int perPage = 15,
  });

  Future<Result<PaginatedData<Outlet>>> getNearby({
    required double latitude,
    required double longitude,
    double radius = 10.0,
    int page = 1,
    int perPage = 15,
  });

  Future<Result<Outlet>> getById(int id);
}
```

### c. Usecases

Buat 3 Usecase terpisah di `wash_wallet_domain/lib/src/outlet/usecases/`:

1. `GetAllUsecase`
2. `GetNearbyUsecase`
3. `GetByIdUsecase`

_Langkah pasca implementasi:_ Jalankan `dart run build_runner build -d` di package domain jika ada perubahan model/freezed.

---

## 2. Data Layer (`packages/wash_wallet_data`)

Mengimplementasikan interface domain dengan memanggil API endpoint.

### a. Remote Datasource

Buat `OutletRemoteDatasource` di `wash_wallet_data/lib/src/outlet/datasources/customer_outlet_remote_datasource.dart`:

```dart
abstract class OutletRemoteDatasource {
  Future<PaginatedResponseDto<OutletDto>> getAll({
    bool exposureOnly = true,
    int page = 1,
    int perPage = 15,
  });

  Future<PaginatedResponseDto<OutletDto>> getNearby({
    required double latitude,
    required double longitude,
    double radius = 10.0,
    int page = 1,
    int perPage = 15,
  });

  Future<BaseResponseDto<OutletDto>> getById(int id);
}
```

_Gunakan `Dio` / HTTP client dengan header `Authorization: Bearer <token>` dan endpoint prefix `/api/mobile/customer/outlets`._

### b. Repository Implementation

Buat `OutletRepositoryImpl` yang menjembatani Datasource dan Domain. Ia akan bertugas me-mapping `OutletDto` menjadi `Outlet` entity dan membungkus hasil/error dengan tipe `Result`.

---

## 3. Presentation Layer - State & Cubit (`apps/customer`)

Di aplikasi Flutter (`apps/customer/lib/features/outlet/presentation/bloc/`), kita akan menggunakan **Satu File Cubit** (`OutletCubit` dan `OutletState`).

### a. Customer Outlet State (`customer_outlet_state.dart`)

Menggunakan `freezed` union state untuk menangani berbagai kondisi, atau state management dengan tipe yang jelas. Agar dapat menangani list (dengan pagination) dan detail dalam satu cubit, kita dapat membuat union state seperti berikut:

```dart
@freezed
class OutletState with _$OutletState {
  const factory OutletState.initial() = OutletInitial;

  // State untuk List (Termasuk pagination)
  const factory OutletState.loadingList() = OutletLoadingList;
  const factory OutletState.loadedList({
    required List<Outlet> outlets,
    required bool hasReachedMax,
    required int currentPage,
    required bool isGpsActive,
    @Default(false) bool isLoadMore,
  }) = OutletLoadedList;
  const factory OutletState.errorList(String message) = OutletErrorList;

  // State untuk Detail
  const factory OutletState.loadingDetail() = OutletLoadingDetail;
  const factory OutletState.loadedDetail(Outlet outlet) = OutletLoadedDetail;
  const factory OutletState.errorDetail(String message) = OutletErrorDetail;
}
```

### b. Customer Outlet Cubit (`customer_outlet_cubit.dart`)

Cubit tunggal yang menyimpan instance dari ketiga usecase.

**Methods Utama:**

- `Future<void> fetch({double? lat, double? lng, bool isRefresh = false})`:
  - Handle logika jika dipanggil untuk refresh.
  - Panggil `GetNearbyUsecase` jika `lat` & `lng` tersedia.
  - Panggil `GetAllUsecase(exposureOnly: true)` jika GPS tidak tersedia.
  - Emit `loadingList` saat inisialisasi, dan `loadedList` dengan data.
- `Future<void> loadMore()`:
  - Cek apakah state saat ini adalah `OutletLoadedList`.
  - Jika belum mencapai max page (`hasReachedMax`), emit status load more (misal parameter `isLoadMore = true`), ambil halaman berikutnya, lalu append hasilnya.

- `Future<void> loadById(int id)`:
  - Emit `loadingDetail`.
  - Panggil `GetByIdUsecase(id)`.
  - Handle 404/Error dan emit `errorDetail`. Jika sukses emit `loadedDetail`.

---

## 4. Langkah Eksekusi (Untuk Tim/Agent Selanjutnya)

1. **Domain & Data**: Kerjakan modifikasi entity, penambahan repo interface, usecases, datasource, dan repo implementation.
2. **Build Runner**: Pastikan `dart run build_runner build -d` berjalan sukses di `packages/wash_wallet_domain`, `packages/wash_wallet_data`, dan `apps/customer`.
3. **Cubit Implementation**: Implementasikan `OutletState` dan `OutletCubit` dalam satu file terpusat sesuai rancangan.
4. **Dependency Injection**: Daftarkan _Datasource_, _Repository_, _Usecase_, dan _Cubit_ ke dalam system Injeksi Dependensi (e.g. `service_locator.dart` atau `provider`).
