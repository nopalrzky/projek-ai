# Customer Order Feature Implementation Plan

Pembaruan struktur backend pada `docs/api/order_api.md` memerlukan penyesuaian pada seluruh layer *Clean Architecture* di sisi aplikasi customer. Plan ini mencakup modifikasi pada *Data Layer* (Datasource & Repository), *Domain Layer* (Entities & UseCases), dan *Presentation Layer* (Cubit & State).

## Open Questions
1. Parameter `customerAccountId` dan `outletId` kini wajib pada API. Apakah nilainya akan di-inject langsung ke Cubit dari `AuthCubit`/`CartCubit`, atau akan dibaca dari *local storage* di dalam *repository*?

## Proposed Changes

### 1. Data Layer

#### [MODIFY] `lib/features/order/data/datasources/order_remote_datasource.dart`
- Menambahkan *method* `Future<OrderModel> cancel(int orderId)` pada antarmuka `OrderRemoteDatasource`.
- Mengimplementasikan pemanggilan endpoint `POST /{id}/cancel` pada `OrderRemoteDatasourceImpl`.
- Memodifikasi parameter `getAll` untuk menerima `customerAccountId` (wajib), `search`, `status`, `sortBy`, dan `sortDirection`.

#### [MODIFY] `lib/features/order/data/repositories/order_repository_impl.dart`
- Menyesuaikan `OrderRepositoryImpl` untuk memanggil `cancel` dari *remote datasource*.
- Memperbarui pemanggilan `getAll` dengan parameter baru yang diteruskan ke datasource.

### 2. Domain Layer

#### [MODIFY] `lib/features/order/domain/repositories/order_repository.dart`
- Menambahkan *method* `Future<Result<Order>> cancel(int orderId)`.
- Mengupdate signature `getAll` untuk menyertakan `customerAccountId`, `search`, `status`, `sortBy`, dan `sortDirection`.

#### [MODIFY] `lib/features/order/domain/entities/create_params.dart`
- Menambahkan *field* `customerAccountId` dan `outletId` pada `CreateParams` sesuai dengan kebutuhan *request body* di API baru.

#### [NEW] `lib/features/order/domain/usecases/cancel_usecase.dart`
- Membuat usecase baru untuk mengeksekusi logika pembatalan pesanan yang menghubungkan presentasi dengan repository.

#### [MODIFY] `lib/features/order/domain/usecases/get_all_usecase.dart` (jika sudah ada, atau buat baru)
- Menambahkan/menyesuaikan parameter (khususnya `customerAccountId` yang wajib) pada usecase pemanggilan *list* pesanan.

### 3. Presentation Layer (State Management)

#### [MODIFY] `lib/features/order/presentation/cubit/order_cubit.dart` & `order_state.dart` (Menggabungkan semua Cubit)
- Menggabungkan seluruh logika pesanan (`create`, `cancel`, `getAll`) ke dalam satu `OrderCubit` yang komprehensif.
- **State (`OrderState`)**: Perlu dimodifikasi agar dapat menampung multiple status secara bersamaan (misal status *loading* untuk fetch vs *loading* untuk aksi mutasi seperti *create/cancel*) tanpa menghilangkan data *list* yang sedang ada.
  - Contoh *fields* tambahan: `List<Order> orders`, `bool isFetchingOrders`, `bool isSubmittingOrder`, `bool isCancellingOrder`, `String? errorMessage`.
- **Cubit (`OrderCubit`)**:
  - `getAll(...)`: Mengelola pemanggilan `GetAllUseCase` dengan filter status dan *search*.
  - `create(...)`: Menangani proses pembuatan pesanan.
  - `cancel(int orderId)`: Menangani proses pembatalan pesanan.
- **Penghapusan/Penyatuan**: File `create_order_cubit.dart`, `create_order_state.dart`, dsb. akan digabungkan (refactor) ke dalam `OrderCubit` dan dihapus jika tidak lagi digunakan secara mandiri.

## Verification Plan

### Automated Verification
- Memastikan tidak ada *error* kompilasi (*analyzer* bersih) setelah perubahan *signature* metode pada *interface* `OrderRepository` dan implementasinya.

### Manual Verification
- **Testing API Integration**: Memeriksa *Network Log* (menggunakan *logger* dio) untuk memastikan endpoint `GET /` dan `POST /` memuat *payload* atau *query param* baru (`customerAccountId`, `outletId`).
- **Order Flow**: Mensimulasikan pembuatan pesanan dari awal hingga selesai untuk memverifikasi payload terkirim dengan benar sesuai `OrderApi.md`.
- **Cancel Flow**: Menguji fungsionalitas tombol batal pada UI untuk pesanan berstatus *requested*, lalu memastikan daftar pesanan di-_refresh_ dengan benar setelahnya.
