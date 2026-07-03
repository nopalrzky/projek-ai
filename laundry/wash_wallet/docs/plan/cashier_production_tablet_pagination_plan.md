# Implementation Plan: Tablet Pagination Cashier dan Production

**Tanggal**: 2026-07-01
**Referensi User Need**: `docs/user_need/cashier_production_tablet_pagination_user_need.md`
**Dikerjakan oleh**: AI model implementor berikutnya
**Target package**: `packages/wash_wallet_core`, `packages/wash_wallet_ui`, `apps/cashier`, `apps/production`

---

## 1. Latar Belakang dan Tujuan

Halaman index/list tablet di `apps/cashier` dan `apps/production` saat ini menggunakan pola pagination yang tidak akurat dan tidak seragam:

- `AppDataTable._buildPagination()` hanya menampilkan `Total: n`, icon prev/next, dan `Page x of y`.
- `AppDataView` hanya menerima `totalCount`, `currentPage`, `pageSize` � tidak ada `lastPage`, `from`, `to`.
- Semua cubit menyimpan state `List<T> + hasReachedMax + currentPage`.
- Datasource membuang metadata pagination dari API response (`response.data['meta']` tidak pernah diparsing).
- Production menggunakan tab/card list (bukan `AppDataView`) dan tidak memiliki pagination tablet sama sekali.

Tujuan plan ini adalah membangun sistem pagination tablet yang reusable, berbasis metadata server akurat, dan mengikuti UX web owner (`webapp/.../Components/Pagination`).

---

## 2. Temuan Audit Codebase

### 2.1 `PaginatedData<T>` (wash_wallet_core)

**File**: `packages/wash_wallet_core/lib/src/models/paginated_data.dart`

Model sudah ada tetapi **tidak memiliki `from` dan `to`**:

```dart
class PaginatedData<T> {
  final List<T> items;
  final int currentPage;
  final int lastPage;    // ADA
  final int perPage;
  final int total;       // ADA
  // TIDAK ADA: from, to
  bool get hasReachedMax => currentPage >= lastPage;
}
```

### 2.2 `AppDataView` dan `AppDataTable` (wash_wallet_ui)

**File**: `packages/wash_wallet_ui/lib/src/components/data_view/app_data_view.dart`
**File**: `packages/wash_wallet_ui/lib/src/components/data_view/app_data_table.dart`

Parameter pagination yang ada saat ini:
- `totalCount`, `currentPage`, `pageSize`, `onPageChanged` � sudah ada.
- `lastPage`, `from`, `to` � **tidak ada**.

Footer `_buildPagination()` saat ini:
```dart
// MASALAH: Hitung totalPages dari totalCount/pageSize (bukan dari lastPage server)
final totalPages = (widget.totalCount! / widget.pageSize!).ceil();

// MASALAH: Hanya icon chevron, tidak ada label Indonesia
// MASALAH: Tidak ada nomor halaman, ellipsis, range info
// MASALAH: Tidak ada disabled state saat loading
Row(children: [
  Text('Total: ${widget.totalCount}'),
  const Spacer(),
  IconButton(icon: const Icon(Icons.chevron_left), ...),
  Text('Page ${widget.currentPage} of $totalPages'),
  IconButton(icon: const Icon(Icons.chevron_right), ...),
])
```

### 2.3 Pola State Cubit � Cashier

**Semua cubit cashier menggunakan pola ini** (ditemukan di: order, customer, category, deposit, expense, laundry_service, membership_plan, petty_cash, service_package, unit):

```dart
// State
class XxxLoaded extends XxxState {
  final List<Xxx> items;
  final bool hasReachedMax;  // hanya untuk load-more mobile
  final int currentPage;
  // TIDAK ADA: lastPage, total, from, to
}

// Cubit
emit(XxxLoaded(
  items: result,
  hasReachedMax: result.length < perPage,  // TEBAKAN, bukan metadata server
  currentPage: page,
));
```

### 2.4 Pola Datasource � Metadata Dibuang

**Semua datasource membuang metadata**:

```dart
// customer_remote_datasource.dart (baris 104-105)
final List data = body['data'] as List? ?? [];
return data.map((e) => CustomerModel.fromJson(e)).toList();
// Meta dari body['meta'] TIDAK PERNAH dibaca

// order_remote_datasource.dart (baris 112-119)
final List data = response.data['data'];
return normalizedData.map((e) => OrderModel.fromJson(e)).toList();
// response.data['meta'] TIDAK PERNAH dibaca
```

### 2.5 Pola Tablet Cashier (AppDataView)

9 screen cashier sudah memakai `AppDataView`:
- `index_orders_screen.dart`
- `index_customers_screen.dart`
- `index_categories_screen.dart`
- `index_deposit_screen.dart`
- `index_expense_screen.dart`
- `index_laundry_services_screen.dart`
- `index_membership_plan_screen.dart`
- `index_petty_cash_screen.dart`
- `index_service_packages_screen.dart`

Semua belum meneruskan `totalCount`, `currentPage`, dan `pageSize` dengan benar karena state tidak memiliki metadata lengkap dari server.

### 2.6 Pola Production (Card/Tab, bukan AppDataView)

Production menggunakan tab + card list:
- `index_order_screen.dart` ? tab `OrderQueuedTab` + `OrderInProgressTab`
- `OrderQueuedTab` dan `OrderInProgressTab` ? `ListView.separated` dengan `OrderItemCard`
- State: `OrdersLoaded { List<Order> orders, bool hasReachedMax, int currentPage }`
- Order item state: `OrderItemsLoaded { List<OrderItem> orderItems, bool hasReachedMax, int currentPage }`
- Tidak ada `AppDataView` � pagination tablet perlu ditambahkan tanpa mengganggu compact list.

### 2.7 Web Pagination Contract (Referensi)

**File**: `webapp/.../Components/Pagination/types.ts`

```typescript
export interface PaginationMeta {
    currentPage: number;
    lastPage: number;
    from: number | null;
    to: number | null;
    total: number;
    perPage?: number;
}
```

UX dari `Pagination.tsx` yang harus diikuti:
- Range info: `Menampilkan x sampai y dari total hasil`
- Prev: label `Sebelumnya`
- Next: label `Berikutnya`
- Nomor halaman dengan active state
- Ellipsis untuk banyak halaman
- Hide jika `lastPage <= 1` atau `total === 0`
- Disabled saat loading atau boundary

---

## 3. Arsitektur Solusi

### 3.1 Ringkasan Pendekatan

```
Layer              Perubahan
-----------        -----------------------------------------
Core Model         PaginatedData<T> + from + to
UI Component       AppPagination widget (baru)
                   AppDataTable: ganti _buildPagination() ? pakai AppPagination
                   AppDataTable: tambah parameter lastPage, from, to
                   AppDataView: tambah parameter lastPage, from, to
Datasource         Setiap getAll() return PaginatedData<XxxModel>
Repository         Teruskan PaginatedData ke usecase/cubit
State (Cubit)      XxxLoaded { items, currentPage, lastPage, total, from, to, perPage }
Screen Cashier     Teruskan meta dari state ke AppDataView
Screen Production  Tambah AppPagination ke tablet layout (tidak ganggu compact)
```

### 3.2 Prinsip Kompatibilitas

- `AppDataTable`: parameter `lastPage`, `from`, `to` bersifat `int?` � nullable/optional. Bila null, `AppPagination` tetap bisa jalan dengan kalkulasi fallback dari `totalCount/pageSize`.
- `hasReachedMax` di state tetap ada untuk compact/mobile load-more.
- Compact screen tidak berubah � semua perubahan tablet dibungkus kondisi `!isCompact`.
- Existing API call site tidak perlu diubah signature kecuali return type datasource.

---

## 4. Proposed Changes

### 4.1 [MODIFY] `PaginatedData<T>` � Tambah `from` dan `to`

**File**: `packages/wash_wallet_core/lib/src/models/paginated_data.dart`

Tambahkan field `from` dan `to` sebagai nullable int:

```dart
class PaginatedData<T> {
  final List<T> items;
  final int currentPage;
  final int lastPage;
  final int perPage;
  final int total;
  final int? from;   // BARU: item pertama di halaman ini (1-based)
  final int? to;     // BARU: item terakhir di halaman ini (1-based)

  const PaginatedData({
    required this.items,
    required this.currentPage,
    required this.lastPage,
    required this.perPage,
    required this.total,
    this.from,   // BARU
    this.to,     // BARU
  });

  bool get hasReachedMax => currentPage >= lastPage;
}
```

---

### 4.2 [NEW] `AppPagination` � Shared Pagination Widget

**File**: `packages/wash_wallet_ui/lib/src/components/pagination/app_pagination.dart`

Widget baru yang mengikuti UX web owner. Desain harus menggunakan token dari `context.colors`, `context.typography`, `context.space`, `context.radius`.

#### Contract (parameter):

```dart
class AppPagination extends StatelessWidget {
  final int currentPage;
  final int lastPage;
  final int total;
  final int? from;    // null jika halaman kosong
  final int? to;      // null jika halaman kosong
  final bool isLoading;
  final void Function(int page)? onPageChanged;
  final int maxVisiblePages;  // default: 5

  const AppPagination({
    required this.currentPage,
    required this.lastPage,
    required this.total,
    this.from,
    this.to,
    this.isLoading = false,
    this.onPageChanged,
    this.maxVisiblePages = 5,
  });
}
```

#### Perilaku yang harus diimplementasikan:

1. **Hide condition**: `if (lastPage <= 1 || total == 0) return SizedBox.shrink()`
2. **Range info** (kiri): `'Menampilkan $from sampai $to dari $total hasil'` � sembunyikan jika `from == null`
3. **Tombol Sebelumnya** (label teks, bukan hanya icon):
   - Disabled jika: `isLoading || currentPage <= 1 || onPageChanged == null`
   - `onPressed: () => onPageChanged!(currentPage - 1)`
4. **Nomor halaman** (tengah):
   - Hitung visible pages dengan ellipsis algorithm (mirip web):
     - Selalu tampilkan halaman 1
     - Selalu tampilkan halaman `lastPage`
     - Tampilkan halaman di sekitar `currentPage`
     - Sisipkan `...` (ellipsis, non-clickable) bila ada gap
   - Active state: halaman `currentPage` punya visual berbeda (background primary, text onPrimary)
   - Disabled jika `isLoading`
   - Klik halaman yang sama dengan `currentPage` tidak memanggil `onPageChanged`
5. **Tombol Berikutnya** (label teks):
   - Disabled jika: `isLoading || currentPage >= lastPage || onPageChanged == null`
   - `onPressed: () => onPageChanged!(currentPage + 1)`
6. **Responsive**: gunakan `Wrap` atau `LayoutBuilder` agar tidak overflow di tablet portrait

#### Contoh layout yang diharapkan:

```
[Menampilkan 16 sampai 30 dari 142 hasil]  [Sebelumnya] [1] [...] [2] [3*] [4] [...] [10] [Berikutnya]
```

#### Export:

Tambahkan ke `packages/wash_wallet_ui/lib/wash_wallet_ui.dart`:
```dart
export 'src/components/pagination/app_pagination.dart';
```

---

### 4.3 [MODIFY] `AppDataTable` � Ganti Footer, Tambah Parameter Meta

**File**: `packages/wash_wallet_ui/lib/src/components/data_view/app_data_table.dart`

#### Tambah parameter baru (nullable, backward-compatible):

```dart
// Pagination tambahan � metadata dari server
final int? lastPage;    // BARU
final int? from;        // BARU
final int? to;          // BARU
```

#### Ganti `_buildPagination()`:

Hapus implementasi lama. Gunakan `AppPagination`:

```dart
Widget _buildPagination(BuildContext context) {
  final resolvedLastPage = widget.lastPage
      ?? ((widget.totalCount != null && widget.pageSize != null && widget.pageSize! > 0)
          ? (widget.totalCount! / widget.pageSize!).ceil()
          : 1);

  return Container(
    padding: EdgeInsets.symmetric(
      horizontal: context.space.md,
      vertical: context.space.sm,
    ),
    decoration: BoxDecoration(
      color: context.colors.surface,
      border: Border(
        top: BorderSide(
          color: context.colors.outlineVariant.withValues(alpha: 0.85),
        ),
      ),
    ),
    child: AppPagination(
      currentPage: widget.currentPage ?? 1,
      lastPage: resolvedLastPage,
      total: widget.totalCount ?? 0,
      from: widget.from,
      to: widget.to,
      isLoading: widget.isLoading,
      onPageChanged: widget.onPageChanged,
    ),
  );
}
```

**Condition render pagination** (tidak berubah):
```dart
if (widget.totalCount != null && widget.currentPage != null)
  _buildPagination(context),
```

---

### 4.4 [MODIFY] `AppDataView` � Tambah Parameter Meta

**File**: `packages/wash_wallet_ui/lib/src/components/data_view/app_data_view.dart`

Tambahkan parameter baru (nullable, backward-compatible):

```dart
final int? lastPage;    // BARU
final int? from;        // BARU
final int? to;          // BARU
```

Teruskan ke `AppDataTable`:

```dart
AppDataTable<T>(
  // ...existing params...
  totalCount: totalCount,
  currentPage: currentPage,
  pageSize: pageSize,
  lastPage: lastPage,    // BARU
  from: from,            // BARU
  to: to,                // BARU
  onPageChanged: onPageChanged,
)
```

---

### 4.5 [MODIFY] Datasources Cashier � Return `PaginatedData<XxxModel>`

**Berlaku untuk semua fitur cashier yang punya index:**

| Fitur | File Datasource |
|-------|-----------------|
| Order | `apps/cashier/lib/features/order/data/datasources/order_remote_datasource.dart` |
| Customer | `apps/cashier/lib/features/customer/data/datasources/customer_remote_datasource.dart` |
| Category | `apps/cashier/lib/features/category/data/datasources/category_remote_datasource.dart` |
| Deposit | `apps/cashier/lib/features/deposit/data/datasources/deposit_remote_datasource.dart` |
| Expense | `apps/cashier/lib/features/expense/data/datasources/expense_remote_datasource.dart` |
| Laundry Service | `apps/cashier/lib/features/laundry_service/data/datasources/laundry_service_remote_datasource.dart` |
| Membership Plan | `apps/cashier/lib/features/membership_plan/data/datasources/membership_plan_remote_datasource.dart` |
| Petty Cash | `apps/cashier/lib/features/petty_cash/data/datasources/petty_cash_remote_datasource.dart` |
| Service Package | `apps/cashier/lib/features/service_package/data/datasources/service_package_remote_datasource.dart` |
| Unit | `apps/cashier/lib/features/unit/data/datasources/unit_remote_datasource.dart` |
| Membership Contract | `apps/cashier/lib/features/membership_contract/data/datasources/membership_contract_remote_datasource.dart` |

**Pola perubahan untuk setiap `getAll()`**:

```dart
// SEBELUM � return type: Future<List<XxxModel>>
Future<List<XxxModel>> getAll({...}) async {
  // ...
  final List data = response.data['data'];
  return data.map((e) => XxxModel.fromJson(e)).toList();
}

// SESUDAH � return type: Future<PaginatedData<XxxModel>>
Future<PaginatedData<XxxModel>> getAll({...}) async {
  // ...
  final body = response.data;
  final List data = body['data'] as List? ?? [];
  final meta = body['meta'] as Map<String, dynamic>? ?? {};

  final items = data.map((e) => XxxModel.fromJson(e)).toList();

  return PaginatedData<XxxModel>(
    items: items,
    currentPage: meta['current_page'] as int? ?? page,
    lastPage: meta['last_page'] as int? ?? 1,
    perPage: meta['per_page'] as int? ?? perPage,
    total: meta['total'] as int? ?? items.length,
    from: meta['from'] as int?,
    to: meta['to'] as int?,
  );
}
```

> **Catatan untuk implementor**: Periksa key `meta` dari API response backend masing-masing endpoint. Backend Laravel biasanya mengembalikan `meta.current_page`, `meta.last_page`, `meta.from`, `meta.to`, `meta.total`, `meta.per_page`. Konfirmasi dengan response log atau backend code bila key berbeda.

**Update abstract class** (interface datasource) untuk masing-masing endpoint:

```dart
// SEBELUM
abstract class XxxRemoteDatasource {
  Future<List<XxxModel>> getAll({...});
}

// SESUDAH
abstract class XxxRemoteDatasource {
  Future<PaginatedData<XxxModel>> getAll({...});
}
```

---

### 4.6 [MODIFY] Repositories Cashier � Teruskan PaginatedData

**Berlaku untuk semua repository yang memiliki `getAll()`.**

Pola perubahan:

```dart
// SEBELUM � return type: Future<Result<List<Xxx>>>
Future<Result<List<Xxx>>> getAll({...}) async {
  try {
    final models = await _datasource.getAll(...);
    return Result.success(models.map((m) => m.toDomain()).toList());
  } catch (e) { ... }
}

// SESUDAH � return type: Future<Result<PaginatedData<Xxx>>>
Future<Result<PaginatedData<Xxx>>> getAll({...}) async {
  try {
    final paginated = await _datasource.getAll(...);
    return Result.success(PaginatedData<Xxx>(
      items: paginated.items.map((m) => m.toDomain()).toList(),
      currentPage: paginated.currentPage,
      lastPage: paginated.lastPage,
      perPage: paginated.perPage,
      total: paginated.total,
      from: paginated.from,
      to: paginated.to,
    ));
  } catch (e) { ... }
}
```

---

### 4.7 [MODIFY] Usecases Cashier � Teruskan PaginatedData

```dart
// SEBELUM � return type: Future<Result<List<Xxx>>>
// SESUDAH � return type: Future<Result<PaginatedData<Xxx>>>
```

---

### 4.8 [MODIFY] State Cubit Cashier � Tambah Metadata

**Berlaku untuk semua `XxxLoaded` state.**

Pola perubahan:

```dart
// SEBELUM
class XxxLoaded extends XxxState {
  final List<Xxx> items;
  final bool hasReachedMax;
  final int currentPage;
}

// SESUDAH
class XxxLoaded extends XxxState {
  final List<Xxx> items;
  final bool hasReachedMax;  // tetap untuk compact/mobile
  final int currentPage;
  final int lastPage;        // BARU
  final int total;           // BARU
  final int? from;           // BARU
  final int? to;             // BARU
  final int perPage;         // BARU (atau bisa pakai konstanta)
}
```

**Pola perubahan cubit:**

```dart
// SEBELUM
result.when(
  success: (items) => emit(XxxLoaded(
    items: items,
    hasReachedMax: items.length < perPage,
    currentPage: page,
  )),
);

// SESUDAH
result.when(
  success: (paginated) => emit(XxxLoaded(
    items: paginated.items,
    hasReachedMax: paginated.hasReachedMax,  // dari server
    currentPage: paginated.currentPage,
    lastPage: paginated.lastPage,
    total: paginated.total,
    from: paginated.from,
    to: paginated.to,
    perPage: paginated.perPage,
  )),
);
```

**Pola cubit dengan page tracking** (untuk reset saat search/filter):

Setiap cubit perlu menyimpan `_currentPage` internal agar saat search/filter berubah, bisa reset ke page 1:

```dart
int _currentPage = 1;

Future<void> search({String query = ''}) async {
  _currentPage = 1;  // reset ke page 1
  await _fetch(page: _currentPage, search: query);
}

Future<void> changePage(int page) async {
  _currentPage = page;
  await _fetch(page: page, /* filter params lainnya */);
}
```

---

### 4.9 [MODIFY] Screen Cashier � Teruskan Meta ke AppDataView

**Berlaku untuk semua 9 screen cashier yang memakai `AppDataView`.**

Pola perubahan:

```dart
// SEBELUM
AppDataView<Xxx>(
  // pagination tidak diteruskan atau hanya totalCount
  ...
)

// SESUDAH � di dalam BlocBuilder
AppDataView<Xxx>(
  rows: state is XxxLoaded ? state.items : [],
  isLoading: state is XxxLoading,
  totalCount: state is XxxLoaded ? state.total : null,
  currentPage: state is XxxLoaded ? state.currentPage : null,
  pageSize: state is XxxLoaded ? state.perPage : null,
  lastPage: state is XxxLoaded ? state.lastPage : null,    // BARU
  from: state is XxxLoaded ? state.from : null,            // BARU
  to: state is XxxLoaded ? state.to : null,                // BARU
  onPageChanged: (page) => context.read<XxxCubit>().changePage(page),  // BARU
  // search/filter tetap memanggil dengan page 1
  onSearch: () => context.read<XxxCubit>().search(query: _searchController.text),
  ...
)
```

**Tambah state tracking halaman di screen:**

```dart
// Di _IndexXxxScreenState
int _currentPage = 1;

void _loadData({int page = 1}) {
  setState(() => _currentPage = page);
  context.read<XxxCubit>().getAll(
    page: page,
    // filter/sort params...
  );
}

void _onSearch() {
  _loadData(page: 1);  // reset ke 1
}

void _onFilterChanged() {
  _loadData(page: 1);  // reset ke 1
}
```

---

### 4.10 [MODIFY] Production Order � Tambah Pagination Tablet

**File**: `apps/production/lib/features/order/presentation/screens/index_order_screen.dart`
**File**: `apps/production/lib/features/order/presentation/widgets/order_queued_tab.dart`
**File**: `apps/production/lib/features/order/presentation/widgets/order_in_progress_tab.dart`

Pendekatan: tablet menggunakan `AppPagination` langsung di bawah list card. Compact tetap tanpa pagination.

```dart
// order_queued_tab.dart � tablet section
Widget _buildTabletContent(BuildContext context, OrdersLoaded state) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Expanded(
        child: GridView.builder(  // atau ListView sesuai kebutuhan visual
          // ... order cards
        ),
      ),
      AppPagination(
        currentPage: state.currentPage,
        lastPage: state.lastPage,
        total: state.total,
        from: state.from,
        to: state.to,
        isLoading: false,
        onPageChanged: (page) => context.read<OrderCubit>().getAll(
          status: 'ready_to_process',
          page: page,
          perPage: 15,
        ),
      ),
    ],
  );
}
```

Pemisahan compact vs tablet di `order_queued_tab.dart`:

```dart
// Tambah isCompact parameter atau baca dari context
class OrderQueuedTab extends StatelessWidget {
  final bool isTablet;  // BARU
  const OrderQueuedTab({this.isTablet = false, ...});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<OrderCubit, OrderState>(
      builder: (context, state) {
        if (state is OrdersLoaded) {
          if (isTablet) return _buildTabletContent(context, state);
          return _buildMobileContent(context, state);
        }
        // ...
      },
    );
  }
}
```

**Update state production order** (sama dengan cashier):
```dart
class OrdersLoaded extends OrderState {
  final List<Order> orders;
  final bool hasReachedMax;
  final int currentPage;
  final int lastPage;   // BARU
  final int total;      // BARU
  final int? from;      // BARU
  final int? to;        // BARU
}
```

---

### 4.11 [MODIFY] Production Order Item � Tambah Pagination Tablet

**File**: `apps/production/lib/features/order_item/presentation/bloc/order_item_state.dart`
**File**: `apps/production/lib/features/order_item/presentation/bloc/order_item_cubit.dart`

Update `OrderItemsLoaded` sama seperti pola cashier � tambah `lastPage`, `total`, `from`, `to`.

Screen order item production perlu direview apakah menampilkan list tablet yang perlu pagination.

---

### 4.12 [MODIFY] Datasources Production � Return PaginatedData

Sama dengan pola cashier di 4.5:

| Fitur | File |
|-------|------|
| Production Order | `apps/production/lib/features/order/data/datasources/order_remote_datasource.dart` |
| Production Order Item | `apps/production/lib/features/order_item/data/datasources/order_item_remote_datasource.dart` |

---

## 5. Urutan Pengerjaan (Step-by-Step)

```
FASE 1: Foundation (Core + UI)
  Step 1.1: Update PaginatedData<T> � tambah from, to
  Step 1.2: Buat AppPagination widget di wash_wallet_ui
  Step 1.3: Update AppDataTable � tambah lastPage/from/to, ganti _buildPagination
  Step 1.4: Update AppDataView � tambah lastPage/from/to, teruskan ke AppDataTable
  Step 1.5: Export AppPagination dari wash_wallet_ui.dart
  Step 1.6: dart format packages/wash_wallet_ui packages/wash_wallet_core
  Step 1.7: flutter analyze packages/wash_wallet_ui packages/wash_wallet_core

FASE 2: Cashier Data Layer
  Step 2.1: Update setiap datasource getAll() � return PaginatedData<XxxModel>
            Order, Customer, Category, Deposit, Expense, LaundryService,
            MembershipPlan, PettyCash, ServicePackage, Unit, MembershipContract
  Step 2.2: Update abstract class (interface) masing-masing datasource
  Step 2.3: Update repository � teruskan PaginatedData
  Step 2.4: Update usecase � teruskan PaginatedData
  Step 2.5: flutter analyze apps/cashier

FASE 3: Cashier Presentation Layer
  Step 3.1: Update XxxLoaded state � tambah lastPage, total, from, to, perPage
  Step 3.2: Update cubit getAll() � emit state dengan metadata baru
  Step 3.3: Update cubit � tambah changePage() method
  Step 3.4: Update screen tablet cashier � teruskan meta ke AppDataView
            Pastikan search/filter reset page ke 1
  Step 3.5: flutter analyze apps/cashier

FASE 4: Production Data + Presentation Layer
  Step 4.1: Update datasource production � return PaginatedData
  Step 4.2: Update state production order dan order_item � tambah metadata
  Step 4.3: Update cubit production � emit metadata, tambah changePage()
  Step 4.4: Update tablet widget production � tambah AppPagination
            OrderQueuedTab, OrderInProgressTab (tambah isTablet param)
  Step 4.5: flutter analyze apps/production

FASE 5: Verifikasi
  Step 5.1: dart format apps/cashier apps/production
  Step 5.2: flutter analyze semua package dan app
  Step 5.3: Review visual manual (lihat bagian 7)
```

---

## 6. Files yang Diubah

### Core

| File | Aksi |
|------|------|
| `packages/wash_wallet_core/lib/src/models/paginated_data.dart` | MODIFY |

### UI Package

| File | Aksi |
|------|------|
| `packages/wash_wallet_ui/lib/src/components/pagination/app_pagination.dart` | NEW |
| `packages/wash_wallet_ui/lib/src/components/data_view/app_data_table.dart` | MODIFY |
| `packages/wash_wallet_ui/lib/src/components/data_view/app_data_view.dart` | MODIFY |
| `packages/wash_wallet_ui/lib/wash_wallet_ui.dart` | MODIFY (tambah export) |

### Cashier � Data Layer (11 fitur x 3 layer = ~33 file)

Setiap fitur: `remote_datasource.dart`, `repository_impl.dart`, `getall_usecase.dart`

Fitur: `order`, `customer`, `category`, `deposit`, `expense`, `laundry_service`, `membership_plan`, `petty_cash`, `service_package`, `unit`, `membership_contract`

### Cashier � Presentation Layer (9 fitur x 2 file = ~18 file)

Setiap fitur: `xxx_state.dart`, `xxx_cubit.dart`, `index_xxx_screen.dart`

### Production � Data Layer (~6 file)

Fitur: `order`, `order_item` � masing-masing datasource + repository + usecase

### Production � Presentation Layer (~8 file)

Fitur: `order` dan `order_item` � state, cubit, screen, dan widget tabs

---

## 7. Verification Plan

### 7.1 Automated (wajib)

```bash
dart format packages/wash_wallet_core packages/wash_wallet_ui apps/cashier apps/production

flutter analyze packages/wash_wallet_core
flutter analyze packages/wash_wallet_ui
flutter analyze apps/cashier
flutter analyze apps/production
```

> **Harus zero error baru.**

### 7.2 Unit Test � AppPagination Widget

Tulis widget test di `packages/wash_wallet_ui/test/`:

| Test Case | Assertion |
|-----------|-----------|
| `lastPage <= 1` | `AppPagination` tidak render |
| `total == 0` | `AppPagination` tidak render |
| Render range | `'Menampilkan 16 sampai 30 dari 142 hasil'` visible |
| Render Sebelumnya | Text `Sebelumnya` visible |
| Render Berikutnya | Text `Berikutnya` visible |
| Active state | Halaman aktif punya styling berbeda |
| Ellipsis | `...` muncul jika halaman > `maxVisiblePages` |
| Disabled loading | semua button disabled saat `isLoading: true` |
| Disabled page 1 | `Sebelumnya` disabled saat `currentPage == 1` |
| Disabled lastPage | `Berikutnya` disabled saat `currentPage == lastPage` |
| Same page | `onPageChanged` tidak dipanggil saat klik halaman aktif |

### 7.3 Review Visual Manual � Tablet

Jalankan di emulator tablet atau device dengan window lebar:

| App | Screen | Elemen yang diverifikasi |
|-----|--------|--------------------------|
| Cashier | Order index tablet | Range info, nomor halaman, prev/next, active state, pindah halaman |
| Cashier | Customer index tablet | Sama |
| Cashier | Category index tablet | Sama |
| Cashier | Deposit index tablet | Sama |
| Cashier | Expense index tablet | Sama |
| Cashier | Laundry service index tablet | Sama |
| Cashier | Membership plan index tablet | Sama |
| Cashier | Petty cash index tablet | Sama |
| Cashier | Service package index tablet | Sama |
| Production | Order antrian produksi (tablet) | Pagination muncul, pindah halaman |
| Production | Order in progress (tablet) | Sama |

### 7.4 Regression Test Manual � Compact/Mobile

Pastikan tidak ada regresi:

| App | Screen | Elemen yang diverifikasi |
|-----|--------|--------------------------|
| Cashier | Order index mobile | List cards, load-more/refresh, tidak ada pagination numbered |
| Cashier | Customer index mobile | Sama |
| Production | Order index mobile (tab) | Tab masih berfungsi, ListView card tanpa pagination numbered |

### 7.5 Checklist UX Tablet

- [ ] Range info: `Menampilkan x sampai y dari total hasil`
- [ ] Tombol bertuliskan `Sebelumnya` dan `Berikutnya` (bukan hanya icon)
- [ ] Nomor halaman tampil
- [ ] Halaman aktif punya active state berbeda
- [ ] Ellipsis muncul untuk halaman banyak
- [ ] `Sebelumnya` disabled di halaman 1
- [ ] `Berikutnya` disabled di halaman terakhir
- [ ] Semua kontrol disabled saat loading
- [ ] Klik halaman yang sama tidak trigger fetch ulang
- [ ] Pagination disembunyikan jika hanya 1 halaman atau total 0
- [ ] Search reset ke halaman 1
- [ ] Filter reset ke halaman 1
- [ ] Tidak ada overflow di tablet portrait

---

## 8. Risiko dan Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Key `meta` di response API berbeda dari ekspektasi (`current_page`, `last_page` vs `currentPage`, `lastPage`) | Periksa satu endpoint dulu, konfirmasi key sebelum update semua datasource. Fallback ke `page` param bila `meta` null. |
| 11+ datasource harus diubah � kemungkinan ada yang terlewat | Gunakan grep `Future<List<` di datasource untuk menemukan semua yang belum diupdate. |
| Repository/usecase ada yang return `List<T>` langsung (bypass PaginatedData) | Grep `Result<List<` di repository dan usecase untuk menemukan pattern lama. |
| Production widget tab tidak punya `isTablet` param � perlu refactor | Tambahkan parameter `isTablet` ke `OrderQueuedTab` dan `OrderInProgressTab`. Ini breaking change kecil yang terlokalisasi. |
| `AppPagination` ellipsis algorithm salah untuk edge case (1 halaman, 2 halaman, page di tengah) | Tulis widget test untuk setiap edge case sebelum merge. |
| `onPageChanged` callback di screen belum ada � screen hanya punya `_loadData()` | Tambahkan `changePage(int page)` ke cubit dan hubungkan ke `onPageChanged` di AppDataView. |
| Compact mobile yang load-more masih menggunakan `hasReachedMax` � pastikan tidak rusak | `hasReachedMax` tetap ada di state dan dihitung dari `paginated.hasReachedMax`. Compact screen tidak berubah. |
