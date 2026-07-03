# Implementation Plan: Penyelesaian Tablet Pagination Cashier dan Production

**Tanggal**: 2026-07-01
**Referensi User Need**: `docs/user_need/cashier_production_tablet_pagination_user_need.md`
**Referensi Plan Sebelumnya**: `docs/plan/cashier_production_tablet_pagination_plan.md` (sudah sebagian dieksekusi)
**Dikerjakan oleh**: AI model implementor berikutnya
**Target package**: `packages/wash_wallet_core`, `packages/wash_wallet_ui`, `apps/cashier`, `apps/production`

## 1. Konteks

Plan sebelumnya sudah membangun fondasi: `PaginatedData<T>` (dengan `from`/`to`),
widget `AppPagination`, integrasi dasar di `AppDataTable`/`AppDataView`, dan
migrasi penuh untuk Production `order`/`order_item` serta separuh migrasi
Cashier `unit`. Audit ulang terhadap kode aktual (bukan dokumen lama) menemukan
fondasi ini punya beberapa bug dan gap konkret, dan 12 dari 13 fitur index/list
Cashier belum tersentuh sama sekali. Plan ini HANYA berisi pekerjaan yang
tersisa, disusun dari kondisi kode saat ini yang sudah diverifikasi langsung.

Tujuan: tuntaskan numbered pagination tablet di semua index/list Cashier dan
Production sesuai `docs/user_need/cashier_production_tablet_pagination_user_need.md`,
perbaiki bug replace-vs-append yang membuat tablet pagination Production saat
ini rusak secara fungsional, dan kunci semuanya dengan test.

## 2. Keputusan Arsitektur (wajib dibaca sebelum menulis kode)

**Masalah inti**: satu method `getAll(page, ...)` dipakai baik oleh mobile
"load more" (append saat `page > 1`) maupun oleh `AppPagination.onPageChanged`
di tablet (harus replace di halaman manapun). Pola ini sudah digandakan di
`order_cubit.dart` (production), akan digandakan lagi di `order_item_cubit.dart`,
dan sudah ada pula di `unit_cubit.dart` (cashier). Jika 12 fitur cashier sisanya
dimigrasi dengan meniru pola ini apa adanya, bug yang sama akan muncul di
semua tempat.

**Keputusan**:

1. `getAll({page, ...})` TETAP seperti sekarang secara perilaku untuk
   mobile/compact: `page == 1` replace, `page > 1` append. Dipanggil oleh
   initial load, search, filter, sort, refresh, dan mobile load-more.
2. Tambahkan method publik baru `changePage(int page, {...filter params...})`
   di setiap cubit yang butuh pagination tablet. Hanya method ini yang boleh
   dipanggil oleh `AppPagination.onPageChanged` di tablet. Method ini SELALU
   replace `items`, tidak pernah append.
3. Tambahkan field `bool isPageLoading` (default `false`) ke setiap state
   `XxxLoaded` yang berpaginasi, plus `copyWith`. `changePage` emit
   `currentState.copyWith(isPageLoading: true)` dulu (list tetap terlihat,
   `AppPagination` men-disable diri via `isLoading`), lalu emit state
   `XxxLoaded` BARU sepenuhnya dari `PaginatedData` hasil fetch (tidak pernah
   digabung dengan item lama). Saat gagal, emit state error yang sudah ada
   (`XxxError`), konsisten dengan konvensi cubit lain di repo ini.
4. Sentralkan boilerplate ini (guard same-page/invalid-page, toggle loading,
   replace-on-success) di satu mixin, supaya tidak ditulis ulang manual di
   ~15 cubit:

   **File baru**: `packages/wash_wallet_core/lib/src/pagination/table_pagination_cubit_mixin.dart`
   ```dart
   mixin TablePaginationCubitMixin<S> on Cubit<S> {
     Future<void> changePageGeneric<Item>({
       required int page,
       required int currentPage,
       required int lastPage,
       required Future<Result<PaginatedData<Item>>> Function() request,
       required S Function() markPageLoading,
       required S Function(PaginatedData<Item> data) buildLoaded,
       required S Function(Failure failure) buildError,
     }) async {
       if (page == currentPage) return;
       if (page < 1 || page > lastPage) return;
       emit(markPageLoading());
       final result = await request();
       result.when(
         success: (data) => emit(buildLoaded(data)),
         failure: (failure) => emit(buildError(failure)),
       );
     }
   }
   ```
   Export dari `packages/wash_wallet_core/lib/wash_wallet_core.dart`.

   Setiap cubit memakainya sebagai wrapper tipis, contoh untuk `OrderCubit` (production):
   ```dart
   Future<void> changePage(int page, {String? status, String search = ""}) {
     final current = state;
     if (current is! OrdersLoaded) return Future.value();
     return changePageGeneric<Order>(
       page: page,
       currentPage: current.currentPage,
       lastPage: current.lastPage,
       request: () => _getAllUsecase(page: page, perPage: current.perPage, status: status, search: search),
       markPageLoading: () => current.copyWith(isPageLoading: true),
       buildLoaded: (data) => OrdersLoaded(
         orders: data.items, hasReachedMax: data.hasReachedMax, currentPage: data.currentPage,
         lastPage: data.lastPage, total: data.total, from: data.from, to: data.to,
         perPage: data.perPage, isPageLoading: false,
       ),
       buildError: (f) => OrderError(f.message),
     );
   }
   ```
   Pola ini memenuhi user-need §7 poin 7-12 (replace bukan append, disable
   pagination saat loading, tidak fetch untuk page sama/invalid) secara
   seragam, dan WAJIB dipakai setiap kali migrasi fitur cashier baru (lihat Fase 5).

5. Sentralkan perbaikan parser meta sebagai factory tambahan di `PaginatedData<T>`
   (`packages/wash_wallet_core/lib/src/models/paginated_data.dart`), camelCase
   sebagai canonical, snake_case sebagai fallback, TIDAK PERNAH menebak
   `lastPage` dari `items.length`:
   ```dart
   factory PaginatedData.fromMeta({
     required List<T> items,
     required Map<String, dynamic> meta,
     required int requestedPage,
     required int requestedPerPage,
   }) {
     int readInt(String camelKey, String snakeKey, int fallback) {
       final v = meta[camelKey] ?? meta[snakeKey];
       if (v is int) return v;
       if (v is num) return v.toInt();
       if (v is String) return int.tryParse(v) ?? fallback;
       return fallback;
     }
     return PaginatedData<T>(
       items: items,
       currentPage: readInt('currentPage', 'current_page', requestedPage),
       lastPage: readInt('lastPage', 'last_page', 1),
       perPage: readInt('perPage', 'per_page', requestedPerPage),
       total: readInt('total', 'total', items.length),
       from: meta['from'] as int?,
       to: meta['to'] as int?,
     );
   }
   ```
   Setiap datasource yang disentuh di plan ini mengganti parsing manual
   `meta['current_page'] as int? ?? page` dengan satu panggilan
   `PaginatedData<XxxModel>.fromMeta(items: items, meta: meta, requestedPage: page, requestedPerPage: perPage)`.

## 3. Fase 1 — Perbaikan bug shared UI (low risk, kerjakan pertama)

**File**: `packages/wash_wallet_ui/lib/src/components/data_view/app_data_table.dart`,
method `_buildPagination()` (baris ~362-384, sudah diverifikasi persis):

Kode saat ini:
```dart
Widget _buildPagination(BuildContext context) {
  if (widget.totalCount == null || widget.currentPage == null || widget.lastPage == null) {
    return const SizedBox.shrink();
  }
  return Container(
    ...
    child: AppPagination(
      currentPage: widget.currentPage!,
      lastPage: widget.lastPage!,
      total: widget.totalCount!,
      from: widget.from,
      to: widget.to,
      onPageChanged: widget.onPageChanged ?? (page) {},   // BUG: null jadi no-op
      // isLoading TIDAK diteruskan sama sekali  -> BUG
    ),
  );
}
```

Perbaikan:
```dart
child: AppPagination(
  currentPage: widget.currentPage!,
  lastPage: widget.lastPage!,
  total: widget.totalCount!,
  from: widget.from,
  to: widget.to,
  isLoading: widget.isLoading,
  onPageChanged: widget.onPageChanged,
),
```
`AppPagination.onPageChanged` sudah nullable dan sudah men-disable diri sendiri
saat null (lihat `packages/wash_wallet_ui/lib/src/components/pagination/app_pagination.dart`),
jadi tidak perlu coalescing. `app_data_view.dart` sudah benar meneruskan
`isLoading`/`onPageChanged` ke `AppDataTable`, tidak perlu diubah.

## 4. Fase 2 — Penambahan shared package

1. `packages/wash_wallet_core/lib/src/models/paginated_data.dart` — tambah factory `fromMeta` (§2.5). Additive saja, jangan ubah constructor/getter yang ada.
2. `packages/wash_wallet_core/lib/src/pagination/table_pagination_cubit_mixin.dart` — file baru (§2.4).
3. `packages/wash_wallet_core/lib/wash_wallet_core.dart` — export keduanya.

## 5. Fase 3 — Production: perbaiki bug append + parser

### 5.1 Fitur `order`

- `apps/production/lib/features/order/data/datasources/order_remote_datasource.dart`
  (konstruksi `PaginatedData<OrderModel>` manual saat ini) — ganti dengan
  `PaginatedData<OrderModel>.fromMeta(items: items, meta: meta, requestedPage: page, requestedPerPage: perPage)`.
- `apps/production/lib/features/order_item/data/datasources/order_item_remote_datasource.dart` — perbaikan sama.
- `apps/production/lib/features/order/presentation/bloc/order_state.dart` — tambah `bool isPageLoading = false` ke `OrdersLoaded` + `copyWith`/`props`.
- `apps/production/lib/features/order/presentation/bloc/order_cubit.dart`:
  - Hapus stub kosong `Future<void> changePage(int page) async { /* Handled by _loadData(page: page) in screen */ }` yang sudah diverifikasi tidak melakukan apapun.
  - Tambahkan `with TablePaginationCubitMixin<OrderState>` ke deklarasi class.
  - Implementasikan `changePage(int page, {...parameter filter yang sama dengan getAll...})` sesuai pola §2.4.
  - JANGAN ubah `getAll()` — tetap jadi entry point mobile load-more/initial-load/refresh/search.
- `apps/production/lib/features/order/presentation/widgets/order_queued_tab.dart` — ganti pemanggilan
  `onPageChanged: (page) { context.read<OrderCubit>().getAll(status: 'ready_to_process', page: page, perPage: 15); }`
  (ini AKAR BUG: memanggil method append yang sama dengan mobile) menjadi
  `context.read<OrderCubit>().changePage(page, status: 'ready_to_process')`.
  Tambahkan `isLoading: state.isPageLoading` ke `AppPagination(...)` yang sudah
  ada di widget ini (saat ini tidak diisi sama sekali, sehingga pagination
  tidak pernah terlihat disabled saat fetch berlangsung).
- `apps/production/lib/features/order/presentation/widgets/order_in_progress_tab.dart` — perubahan identik dengan `status: 'in_progress'`.

### 5.2 Fitur `order_item`

`OrderItemCubit` saat ini dead code untuk index/list (hanya dipakai screen
detail `show_order_item_screen.dart` via `getById`/`start`/`complete`). Tetap
perbaiki untuk konsistensi dan karena user-need mendaftarkan "Order item
list/antrian produksi" sebagai scope jika suatu saat ada list-nya:
- `order_item_remote_datasource.dart` — pakai `fromMeta` (sudah disebut di atas).
- `order_item_state.dart` — tambah `isPageLoading` ke `OrderItemsLoaded` (mirror `OrdersLoaded`).
- `order_item_cubit.dart` — hapus stub `changePage` kosong, tambah `with TablePaginationCubitMixin<OrderItemState>`, implementasikan `changePage` nyata.
- JANGAN membuat index screen baru untuk order_item — di luar scope kecuali diminta produk secara eksplisit.

### 5.3 `pickup_schedule_screen.dart`

Konfirmasi di luar scope: `getPickupSchedule()` memanggil usecase dengan
`perPage: 100` tanpa UI pagination sama sekali. Jangan diubah.

## 6. Fase 4 — Cashier: tuntaskan fitur `unit`

Kondisi terverifikasi: datasource, repository, usecase Unit sudah
mengembalikan `PaginatedData<Unit>`/`Result<PaginatedData<Unit>>`. Cubit dan
state sudah bawa field pagination tapi pakai pola append-saat-page>1 yang
sama seperti production. **Belum ada index screen sama sekali** untuk Unit
(hanya ada folder `bloc/` dan `providers/`, tidak ada `screens/`). `UnitCubit`
sudah didaftarkan di `apps/cashier/lib/main.dart` tapi belum punya route.

Langkah:
1. `packages/wash_wallet_data/lib/src/unit/datasources/unit_remote_datasource.dart` — pakai `PaginatedData<UnitModel>.fromMeta(...)`.
2. `apps/cashier/lib/features/unit/presentation/bloc/unit_state.dart` — tambah `isPageLoading` + `copyWith`/`props` ke `UnitsLoaded`.
3. `apps/cashier/lib/features/unit/presentation/bloc/unit_cubit.dart` — tambah `with TablePaginationCubitMixin<UnitState>` dan `changePage(int page, {...filter params sesuai getAll...})`. `getAll()` tidak berubah.
4. File baru `apps/cashier/lib/features/unit/presentation/screens/index_units_screen.dart` — contoh polanya persis seperti `index_categories_screen.dart` (lihat Fase 5.1 untuk breakdown lengkap): branch `isCompact` → `ListView` sederhana; branch tablet → `AppDataView<Unit>` dengan `rows`, `isLoading: state is UnitLoading || (state is UnitsLoaded && state.isPageLoading)`, `currentPage/lastPage/total/from/to` dari state, `onPageChanged: (page) => context.read<UnitCubit>().changePage(page, ...)`. Konfirmasi dulu apakah Unit punya usecase create/edit/delete sebelum menambahkan action button — kalau hanya ada `GetAllUsecase`, screen ini read-only listing.
5. Daftarkan route baru di `apps/cashier/lib/core/router/app_router.dart`, mirip pola route `/categories` yang sudah ada.
6. Tambahkan entry point navigasi di `apps/cashier/lib/core/navigation/cashier_navigation_config.dart` jika Unit perlu bisa diakses dari menu — cek dulu struktur menu management/settings yang ada, belum ada entry "unit" hari ini.

## 7. Fase 5 — Cashier: migrasi 8 fitur index tersisa

### 7.1 Contoh kerja penuh: `category` (representatif, kerjakan ini dulu untuk validasi pola sebelum diulang ke 8 fitur lain)

Kondisi terverifikasi (semua layer masih pola lama):
- Datasource `apps/cashier/lib/features/category/data/datasources/category_remote_datasource.dart`: `Future<List<CategoryModel>> getAll(...)` — return bare List, tidak baca meta sama sekali.
- Repository (`domain/repositories/category_repository.dart`, `data/repositories/category_repository_impl.dart`): `Future<Result<List<Category>>>`, ada local cache layer (`category_local_datasource.dart`) yang cache hanya saat `page==1 && search==null && isActive==null` dengan sort default.
- Usecase `domain/usecases/get_all_usecase.dart`: passthrough `Result<List<Category>>`.
- Cubit `presentation/bloc/category_cubit.dart`: menebak `hasReachedMax: categories.length < 15`. State `CategoriesLoaded` hanya punya `categories`/`hasReachedMax`/`currentPage`.
- Screen `presentation/screens/index_categories_screen.dart` method `_buildTabletTable()`: sudah panggil `AppDataView<Category>` TAPI tidak kirim `totalCount/currentPage/lastPage/from/to/onPageChanged` sama sekali — pagination saat ini tidak pernah tampil di screen ini.

Langkah per layer (pola ini dipakai ulang persis untuk 7 fitur lain di §7.2):

1. **Datasource**: ubah return type jadi `Future<PaginatedData<CategoryModel>>`. Setelah parse `data`, baca `meta = body['meta'] as Map<String, dynamic>? ?? {}`, lalu `return PaginatedData<CategoryModel>.fromMeta(items: items, meta: meta, requestedPage: page, requestedPerPage: perPage)`.
2. **Repository interface & impl**: return type jadi `Future<Result<PaginatedData<Category>>>`. Jalur remote: wrap `PaginatedData<Category>` dari hasil datasource (map `items` ke entity, teruskan field pagination lain apa adanya). Jalur cache-hit/offline (yang cuma simpan `List<CategoryModel>` tanpa metadata): bungkus sebagai `PaginatedData` sintetis single-page (`currentPage: 1, lastPage: 1, perPage: items.length, total: items.length, from/to` dihitung dari `items.isEmpty`). Ini simplifikasi yang disengaja — cache/offline tidak mendukung numbered pagination, cache hanya dipakai untuk fetch page-1 dengan filter default.
3. **Usecase**: return type `Future<Result<PaginatedData<Category>>>`, sisanya passthrough.
4. **State**: tambah `lastPage`, `total`, `from`, `to`, `perPage`, `isPageLoading` ke `CategoriesLoaded` + `copyWith`/`props`. `hasReachedMax` tetap ada untuk mobile, tapi sumbernya jadi `PaginatedData.hasReachedMax`, bukan tebakan `items.length < 15`.
5. **Cubit**: tambah `with TablePaginationCubitMixin<CategoryState>`; perbaiki `getAll()` supaya emit `CategoriesLoaded` dari field `PaginatedData` asli; tambah `changePage(int page, {...filter params sesuai getAll...})` yang selalu replace.
6. **Screen**: di `_buildTabletTable()`, kirim `totalCount/currentPage/lastPage/from/to` dari state, `isLoading: state is CategoryLoading || (state is CategoriesLoaded && state.isPageLoading)`, `onPageChanged: (page) => context.read<CategoryCubit>().changePage(page, ...)`.
7. **Reset ke page 1**: `_loadData()`/`_handleRefresh()` di screen sudah default `page: 1` tanpa mengirim page lama — sudah benar, tinggal pastikan tetap begitu setelah migrasi.

### 7.2 Terapkan pola identik ke 7 fitur berikut

Untuk setiap fitur, file per layer mengikuti struktur yang sama persis dengan
`category` (ganti nama fitur di path):

| Fitur | Direktori dasar |
|---|---|
| customer | `apps/cashier/lib/features/customer/` |
| laundry_service | `apps/cashier/lib/features/laundry_service/` |
| service_package | `apps/cashier/lib/features/service_package/` |
| membership_plan | `apps/cashier/lib/features/membership_plan/` |
| deposit | `apps/cashier/lib/features/deposit/` |
| expense | `apps/cashier/lib/features/expense/` |
| petty_cash | `apps/cashier/lib/features/petty_cash/` |
| order (cashier) | `apps/cashier/lib/features/order/` |

Catatan khusus **order (cashier)**: screen `index_orders_screen.dart` punya
banyak parameter filter tambahan (payment status, rentang tanggal, rentang
nominal). `changePage` WAJIB meneruskan semua parameter filter yang sama
dengan `getAll()`, kalau tidak filter akan ter-reset saat pindah halaman.

Semua 8 fitur terkonfirmasi masih `Future<List<XxxModel>> getAll(...)` di
datasource masing-masing (cek dulu sebelum edit, jangan asumsi struktur file
identik 100% — terutama keberadaan local cache datasource, ikuti pola cache
di §7.1 langkah 2 hanya jika fitur tsb memang punya local cache).

### 7.3 Perlu konfirmasi produk: `membership_contract`, `customer_subscription`

Kedua screen ini (`apps/cashier/lib/features/customer/presentation/screens/membership_contract/index_membership_contract_screen.dart`
dan `.../customer_subscription/index_customer_subscription_screen.dart`) BELUM
punya branch tablet/compact sama sekali — render `ListView` mobile-style
tanpa syarat. Cubit-nya juga masih return bare `List`.

Rekomendasi: migrasi data layer (langkah 1-4 di §7.1) aman dan sebaiknya
tetap dilakukan untuk konsistensi kontrak API, TAPI menambahkan branch
`AppDataView` tablet adalah penambahan UI baru, bukan sekadar perbaikan
metadata — di luar scope perbaikan bug pagination kecuali produk memang
minta tablet layout untuk 2 screen ini. Implementor harus menandai keputusan
ini ke product owner, jangan diam-diam membangun layout tablet baru.

### 7.4 Di luar scope (terkonfirmasi, tidak perlu aksi)

`employee` dan `account`: tidak ada index/list screen (`presentation/` fitur
ini hanya punya `bloc/`/`providers/`, tidak ada `screens/`). Keduanya cuma
dipakai sebagai dropdown selector di form lain. `employee_remote_datasource`
bahkan tidak menerima parameter pagination. Tidak perlu migrasi.

## 8. Fase 6 — Test (tulis berbarengan dengan tiap fase, jangan ditunda ke akhir)

Catatan konvensi (terverifikasi): repo ini TIDAK punya dependency
`mockito`/`mocktail`/`bloc_test` di pubspec manapun. Test yang sudah ada
(`apps/cashier/test/features/auth/presentation/bloc/auth_cubit_test.dart`)
pakai fake manual (`implements X { @override dynamic noSuchMethod(...) }`
atau field `Future<...> Function()? callMock`). Ikuti konvensi ini — jangan
menambah dependency test baru tanpa konfirmasi.

1. `packages/wash_wallet_ui/test/src/components/pagination/app_pagination_test.dart` (baru, belum ada satupun test pagination hari ini):
   - hide saat `lastPage <= 1`; hide saat `total == 0`.
   - render `Menampilkan $from sampai $to dari $total hasil` saat `from`/`to` ada; fallback teks saat tidak ada.
   - render label `Sebelumnya`/`Berikutnya`.
   - render nomor halaman + ellipsis untuk `lastPage` besar.
   - klik halaman aktif tidak memicu callback.
   - `isLoading: true` men-disable semua tombol.
   - `onPageChanged: null` men-disable semua tombol, tidak crash saat tap.
   - boundary: `Sebelumnya` disabled di halaman 1, `Berikutnya` disabled di halaman terakhir.
2. `packages/wash_wallet_ui/test/src/components/data_view/app_data_table_test.dart` (baru): regression test untuk Fase 1 — `isLoading: true` di `AppDataTable` membuat `AppPagination.isLoading == true`; `onPageChanged: null` diteruskan apa adanya (bukan no-op); pagination tidak render saat `totalCount`/`currentPage`/`lastPage` null.
3. `packages/wash_wallet_core/test/src/models/paginated_data_test.dart` (baru): `fromMeta` baca camelCase; fallback snake_case; tidak pernah menebak `lastPage` dari `items.length`; empty result dengan metadata valid ter-parse benar.
4. `packages/wash_wallet_core/test/src/pagination/table_pagination_cubit_mixin_test.dart` (baru): fake `Cubit` minimal yang pakai mixin — assert no-op untuk page sama/invalid, loading-lalu-replace saat sukses, error saat gagal.
5. Cubit test minimum (sesuai user-need §12.4):
   - `apps/production/test/features/order/presentation/bloc/order_cubit_test.dart`: `getAll(page: 2)` append; `changePage(2)` replace penuh (item lama hilang); `changePage` guard same/invalid page.
   - `apps/cashier/test/features/category/presentation/bloc/category_cubit_test.dart` (fitur representatif hasil migrasi): assertion replace-vs-append yang sama.
6. Regresi manual (sesuai user-need §12.5): tablet portrait/landscape untuk 9 screen cashier yang dimigrasi + unit + tab order production; compact/mobile untuk screen yang sama pastikan load-more tidak regresi.

## 9. Urutan Pengerjaan

1. Fase 1 (bug `AppDataTable`) — isolated, kerjakan pertama.
2. Fase 2 (`fromMeta` + `TablePaginationCubitMixin` di `wash_wallet_core`) — semua fase lain bergantung ini.
3. Fase 3 (perbaikan bug append Production) — prioritas tertinggi, bug fungsional yang sudah ada di screen yang jalan.
4. Fase 4 (Cashier `unit` — tambah screen yang hilang).
5. Fase 5.1 (`category`, migrasi penuh) — validasi pola sebelum diulang.
6. Fase 5.2 (7 fitur cashier lain) — ulangi pola.
7. Fase 5.3 (`membership_contract`/`customer_subscription`) — migrasi data layer saja, tandai keputusan UI tablet ke product.
8. Fase 6 test — ditulis segera setelah fase terkait selesai, bukan di akhir semua.

## 10. Verifikasi

Otomatis (wajib zero error baru):
```bash
dart format packages/wash_wallet_core packages/wash_wallet_ui apps/cashier apps/production
flutter analyze packages/wash_wallet_core
flutter analyze packages/wash_wallet_ui
flutter analyze apps/cashier
flutter analyze apps/production
flutter test packages/wash_wallet_core
flutter test packages/wash_wallet_ui
flutter test apps/cashier
flutter test apps/production
```

Manual (checklist UX dari user-need §11, wajib dicek per screen yang dimigrasi):
- Range info, label `Sebelumnya`/`Berikutnya`, nomor halaman, active state, ellipsis tampil benar.
- Pagination hilang saat `lastPage <= 1` atau `total == 0`.
- Klik nomor halaman MENGGANTI data (bukan menumpuk) — cek khusus di tab Production yang tadinya rusak.
- Search/filter/sort/refresh/ganti tab mereset ke halaman 1.
- Semua kontrol disabled saat loading (termasuk saat pindah halaman, bukan cuma initial load).
- Tidak ada overflow di tablet portrait/landscape.
- Compact/mobile tetap load-more, tidak ada regresi.
