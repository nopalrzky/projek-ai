# Implementation Plan — Standarisasi Code Pattern Seluruh Feature

## 1. Tujuan

Menyeragamkan arsitektur dan gaya kode **seluruh feature** di `apps/cashier` dan `apps/production` agar konsisten mengikuti pattern yang sudah diimplementasikan pada fitur **Order** (cashier) dan **Order / OrderItem / OrderItemProcess** (production) — yang dianggap sebagai **gold standard**.

---

## 2. Hasil Audit: Kondisi Saat Ini

### 2.1 Gold Standard (✅ Sudah Benar)

| App | Feature | Result Type | State Pattern | Provider Pattern |
|-----|---------|-------------|---------------|-----------------|
| cashier | `order` | `Result` (`.when()`) | `sealed class` + Equatable | Static factory `OrderProvider` |
| production | `order` | `Result` (`.when()`) | `sealed class` + Equatable | Static factory `OrderProvider` |
| production | `order_item` | `Result` (`.when()`) | `sealed class` + Equatable | Static factory |
| production | `order_item_process` | `Result` (`.when()`) | `sealed class` + Equatable | Static factory |

### 2.2 Feature Yang Masih Menggunakan Pattern Lama (❌ Perlu Migrasi)

**Cashier App — 15 feature menggunakan `dartz Either` + `.fold()`:**

| Feature | Domain Repo | Usecase Return | Cubit Pattern | Inconsistencies |
|---------|-------------|----------------|---------------|-----------------|
| `account` | `Either` | `Either` | `.fold()` | Migrasi ke `Result` |
| `category` | `Either` | `Either` | `.fold()` | Migrasi ke `Result` |
| `customer` | `Either` | `Either` | `.fold()` | Migrasi ke `Result`, punya retry logic custom |
| `customer_subscription` | `Either` | `Either` | `.fold()` | State filename typo: `customer_subcription_state.dart` |
| `deposit` | `Either` | `Either` | `.fold()` | Migrasi ke `Result` |
| `employee` | `Either` | `Either` | `.fold()` | Migrasi ke `Result` |
| `expense` | `Either` | `Either` | `.fold()` | Migrasi ke `Result` |
| `home` | `Either` | `Either` | `.fold()` | Migrasi ke `Result` |
| `laundry_service` | `Either` | `Either` | `.fold()` | Migrasi ke `Result` |
| `membership_contract` | `Either` | `Either` | `.fold()` | Migrasi ke `Result` |
| `membership_plan` | `Either` | `Either` | `.fold()` | Migrasi ke `Result` |
| `petty_cash` | `Either` | `Either` | `.fold()` | **Folder `usecase` (singular)** bukan `usecases` |
| `print` | `Either` | `Either` | `.fold()` | Migrasi ke `Result` |
| `service_package` | `Either` | `Either` | `.fold()` | Migrasi ke `Result` |
| `wa_notification` | `Either` | `Either` | `.fold()` | Migrasi ke `Result` |

**Cashier App — 4 feature tanpa data/domain layer (hanya presentation):**

| Feature | Notes |
|---------|-------|
| `auth` | Presentation only — uses shared package datasource/repo |
| `finances` | Presentation only — no data layer |
| `setting` | Presentation only — printer settings |
| `splash` / `onboarding` | UI only |
| `unit` | Presentation only — uses shared package datasource/repo |

**Shared Packages (`wash_wallet_domain/lib/src/repositories/`):**

| File | Pattern | Notes |
|------|---------|-------|
| `auth_repository.dart` | `Either` | Perlu migrasi ke `Result` |
| `outlet_repository.dart` | `Either` | Perlu migrasi ke `Result` |
| `unit_repository.dart` | `Either` | Perlu migrasi ke `Result` |
| `order_cart_repository.dart` | `Either` | Perlu migrasi ke `Result` |
| `order_repository.dart` | `Either` | Perlu migrasi ke `Result` |
| `order_fulfillment_repository.dart` | **`Result`** ✅ | Sudah standar |

---

## 3. Gold Standard Pattern Reference

### 3.1 Folder Structure Per Feature

```
features/{feature_name}/
├── data/
│   ├── datasources/
│   │   └── {feature}_remote_datasource.dart    ← abstract + impl
│   └── repositories/
│       └── {feature}_repository_impl.dart      ← implements domain repo
├── domain/
│   ├── repositories/
│   │   └── {feature}_repository.dart           ← abstract contract
│   └── usecases/                               ← plural "usecases" (BUKAN "usecase")
│       ├── get_all_usecase.dart
│       ├── get_by_id_usecase.dart
│       ├── store_usecase.dart
│       ├── update_usecase.dart
│       ├── complete_usecase.dart
│       └── destroy_usecase.dart
└── presentation/
    ├── bloc/
    │   ├── {feature}_cubit.dart
    │   └── {feature}_state.dart
    ├── providers/
    │   └── {feature}_provider.dart
    ├── screens/
    └── widgets/
```

### 3.2 Remote Datasource Pattern

```dart
import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

// 1. Abstract class — pure interface, returns Model
abstract class {Feature}RemoteDatasource {
  Future<List<{Feature}Model>> getAll({...params});
  Future<{Feature}Model> getById(int id);
  Future<{Feature}Model> store({...params});
  Future<{Feature}Model> update({required int id, ...params});
  Future<void> destroy(int id);
}

// 2. Implementation — uses Dio + ApiEndpoints
//    - Mixes in `NetworkRetryMixin` (jika feature butuh retry)
//    - Memiliki `_validateResponse()` → cek statusCode + `success` field
//    - Memiliki `_handleError()` → map DioException ke ApiException/NetworkException
//    - Memiliki `_normalizeJsonData()` HANYA jika model butuh normalisasi tipe data
class {Feature}RemoteDatasourceImpl implements {Feature}RemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  {Feature}RemoteDatasourceImpl(this._dio, this._endpoints);

  // ... implementations
}
```

> [!IMPORTANT]
> **`_validateResponse()`** harus konsisten:
> - Cek `statusCode >= 200 && statusCode < 300`
> - Cek `body['success'] == true`
> - Return `Map<String, dynamic>` body (cashier style) ATAU void (production style)
>
> **`_handleError()`** harus konsisten:
> - `ApiException` → rethrow
> - `DioException` → map ke `ApiException` atau `NetworkException` berdasarkan tipe
> - Selalu extract `errors` field dari response body untuk validation errors

### 3.3 Repository Pattern

```dart
import 'package:wash_wallet_core/wash_wallet_core.dart'; // ← Result, Failure
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

// Domain Repository (abstract) — HARUS return Result<T>, BUKAN Either<Failure, T>
abstract class {Feature}Repository {
  Future<Result<List<{Entity}>>> getAll({...});
  Future<Result<{Entity}>> getById(int id);
  Future<Result<{Entity}>> store({...});
  Future<Result<{Entity}>> update({...});
  Future<Result<void>> destroy(int id);
}

// Data Repository Impl — menangkap exception dan wrap ke Result
class {Feature}RepositoryImpl implements {Feature}Repository {
  final {Feature}RemoteDatasource _remoteDatasource;

  {Feature}RepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<{Entity}>> getById(int id) async {
    try {
      final model = await _remoteDatasource.getById(id);
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Failed to fetch: ${e.toString()}'),
      );
    }
  }

  // _mapApiExceptionToFailure — standar switch case by statusCode
  Failure _mapApiExceptionToFailure(ApiException exception) { ... }
}
```

> [!IMPORTANT]
> **WAJIB hapus semua `import 'package:dartz/dartz.dart'`** dari domain repository dan usecase files.
> Ganti semua `Either<Failure, T>` → `Result<T>`.

### 3.4 Usecase Pattern

```dart
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/{feature}_repository.dart';

class GetAllUsecase {
  final {Feature}Repository _repository;

  GetAllUsecase(this._repository);

  // Gunakan `call()` method agar bisa dipanggil sebagai function
  Future<Result<List<{Entity}>>> call({...params}) async {
    return await _repository.getAll(...);
  }
}
```

> [!TIP]
> - Setiap usecase = 1 file, 1 class, 1 method `call()`
> - Jika usecase perlu params kompleks, buat Params class di **file yang sama** (bukan file terpisah)
> - Return type HARUS `Result<T>`, BUKAN `Either<Failure, T>`

### 3.5 Cubit Pattern

```dart
import 'package:flutter_bloc/flutter_bloc.dart';
import '{feature}_state.dart';

class {Feature}Cubit extends Cubit<{Feature}State> {
  final GetAllUsecase _getAllUsecase;
  // ... inject semua usecase via constructor

  {Feature}Cubit({
    required GetAllUsecase getAllUsecase,
    // ...
  }) : _getAllUsecase = getAllUsecase,
       super(const {Feature}Initial());

  Future<void> getAll({...}) async {
    emit(const {Feature}Loading());

    final result = await _getAllUsecase(...);

    // ✅ GUNAKAN .when() — BUKAN .fold()
    result.when(
      success: (data) => emit({Feature}sLoaded(items: data)),
      failure: (failure) => emit({Feature}Error(failure.message)),
    );
  }
}
```

### 3.6 State Pattern

```dart
import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart'; // ← Failure
import 'package:wash_wallet_domain/wash_wallet_domain.dart'; // ← Entity

// GUNAKAN sealed class — BUKAN abstract class
sealed class {Feature}State extends Equatable {
  const {Feature}State();

  @override
  List<Object?> get props => [];
}

class {Feature}Initial extends {Feature}State {
  const {Feature}Initial();
}

class {Feature}Loading extends {Feature}State {
  const {Feature}Loading();
}

// List loaded state — wajib punya hasReachedMax + currentPage
class {Feature}sLoaded extends {Feature}State {
  final List<{Entity}> items;
  final bool hasReachedMax;
  final int currentPage;

  const {Feature}sLoaded({
    required this.items,
    this.hasReachedMax = false,
    this.currentPage = 1,
  });

  {Feature}sLoaded copyWith({...}) { ... }

  @override
  List<Object?> get props => [items, hasReachedMax, currentPage];
}

// Detail loaded state
class {Feature}DetailLoaded extends {Feature}State {
  final {Entity} item;
  const {Feature}DetailLoaded({required this.item});
  @override
  List<Object?> get props => [item];
}

// Action success — untuk store/update/destroy
class {Feature}ActionSuccess extends {Feature}State {
  final String message;
  final {Entity}? item;
  const {Feature}ActionSuccess(this.message, {this.item});
  @override
  List<Object?> get props => [message, item];
}

// Error — terima Failure object, BUKAN hanya String message
class {Feature}Failure extends {Feature}State {
  final Failure failure;
  const {Feature}Failure(this.failure);
  @override
  List<Object?> get props => [failure];
}
```

> [!WARNING]
> **Perbedaan antara state pattern lama dan baru:**
> - Lama: `{Feature}Error(String message)` — kehilangan info statusCode/errors
> - Baru: `{Feature}Failure(Failure failure)` — retain full Failure object
> - Beberapa cubit (e.g. order) punya KEDUA pattern — pastikan konsisten ke satu pattern saja

### 3.7 Provider Pattern

```dart
class {Feature}Provider {
  {Feature}Provider._(); // private constructor

  static {Feature}RemoteDatasource createRemoteDatasource(
    Dio dio, ApiEndpoints endpoints,
  ) => {Feature}RemoteDatasourceImpl(dio, endpoints);

  static {Feature}Repository createRepository(
    {Feature}RemoteDatasource remote,
  ) => {Feature}RepositoryImpl(remote);

  static GetAllUsecase createGetAllUsecase({Feature}Repository repo) =>
    GetAllUsecase(repo);

  // ... static factory per usecase

  static {Feature}Cubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remote = createRemoteDatasource(dio, endpoints);
    final repo = createRepository(remote);
    final getAll = createGetAllUsecase(repo);
    // ...
    return {Feature}Cubit(getAllUsecase: getAll, ...);
  }
}
```

---

## 4. Daftar Inkonsistensi Yang Harus Diperbaiki

### 4.1 Inkonsistensi Kritis

| # | Issue | Lokasi | Impact |
|---|-------|--------|--------|
| 1 | **`dartz Either` vs `Result`** | 15 cashier features + 5 shared domain repos | Semua harus migrasi ke `Result` |
| 2 | **`.fold()` vs `.when()`** | 15 cashier feature cubits | Semua harus migrasi ke `.when()` |
| 3 | **Folder `usecase` (singular)** | `cashier/petty_cash/domain/usecase/` | Rename ke `usecases` (plural) |
| 4 | **State filename typo** | `customer_subcription_state.dart` | Rename ke `customer_subscription_state.dart` |
| 5 | **Duplicate repo impl file** | `production/order_item/data/repositories/` has TWO files: `order_item_impl_repository.dart` + `order_item_repository_impl.dart` | Hapus file duplikat |

### 4.2 Inkonsistensi Datasource

| # | Issue | Feature(s) |
|---|-------|-----------|
| 6 | **`_validateResponse()` signature berbeda** — cashier Order return `void`, customer/expense return `Map<String, dynamic>` | Standardisasi ke return `Map<String, dynamic>` |
| 7 | **`_handleError()` detail level berbeda** — beberapa hanya `NetworkException(message: e.message)`, yang lain punya mapping lengkap per `DioExceptionType` | Standardisasi ke versi lengkap (cashier order style) |
| 8 | **`_normalizeJsonData()` copy-paste** — logika identik di-copy ke tiap datasource order | Pertimbangkan extract ke helper di shared package |
| 9 | **`withRetry()` function** ada di production order datasource tapi bukan method, bukan mixin, hanya standalone function | Hapus dan gunakan `NetworkRetryMixin` yang sudah ada |

### 4.3 Inkonsistensi State

| # | Issue | Feature(s) |
|---|-------|-----------|
| 10 | **Error state mixed** — Order cashier punya `OrderError(String message)` DAN `OrderFailure(Failure failure)` | Pilih satu: `{Feature}Failure(Failure)` |
| 11 | **`Loaded` state tidak punya `currentPage`** | customer, expense, deposit, dll | Tambahkan `currentPage` |
| 12 | **Cubit method naming** — `loadCustomers()`, `loadExpenses()` vs `getAll()` | Standardisasi ke `getAll()`, `getById()`, `store()`, `update()`, `destroy()` |

### 4.4 Shared Package Issues

| # | Issue | File |
|---|-------|------|
| 13 | **`wash_wallet_domain` repositories** yang TIDAK dipakai oleh app-level feature | `order_repository.dart`, `order_cart_repository.dart` di shared domain — konflik nama dengan app-level repository |
| 14 | **Shared datasource** di `wash_wallet_data` hanya ada untuk `auth`, `outlet`, `unit` — sisanya di app level | Ini OK (intentional), tapi perlu didokumentasikan |

---

## 5. Rencana Eksekusi

### Fase 1: Shared Packages (Foundation)

> [!IMPORTANT]
> Fase ini HARUS selesai duluan karena app-level imports depend on shared packages.

**Scope:** Migrasi semua shared domain repositories dari `Either` ke `Result`.

#### [MODIFY] `packages/wash_wallet_domain/lib/src/repositories/`

| File | Perubahan |
|------|-----------|
| `auth_repository.dart` | `Either<Failure, T>` → `Result<T>`, hapus `import dartz` |
| `outlet_repository.dart` | `Either<Failure, T>` → `Result<T>`, hapus `import dartz` |
| `unit_repository.dart` | `Either<Failure, T>` → `Result<T>`, hapus `import dartz` |
| `order_repository.dart` | `Either<Failure, T>` → `Result<T>`, hapus `import dartz` |
| `order_cart_repository.dart` | `Either<Failure, T>` → `Result<T>`, hapus `import dartz` |
| `order_fulfillment_repository.dart` | ✅ Sudah `Result` — tidak perlu diubah |

#### [MODIFY] `packages/wash_wallet_data/lib/src/`

Update semua repository implementations di subfolder `auth/`, `outlet/`, `unit/` — return `Result` instead of `Either`.

#### [MODIFY] `packages/wash_wallet_domain/lib/src/usecases/`

Update semua usecase return types dari `Either<Failure, T>` → `Result<T>`.

**Verifikasi:** `dart analyze packages/wash_wallet_domain` dan `dart analyze packages/wash_wallet_data` harus clean.

---

### Fase 2: Cashier — Simple CRUD Features (Batch 1)

**Scope:** 5 feature paling sederhana (read-only atau basic CRUD).

| Feature | Usecases | Estimasi File Changes |
|---------|----------|----------------------|
| `account` | getAll | 4 files |
| `membership_plan` | getAll, getById | 5 files |
| `membership_contract` | getAll, getById | 5 files |
| `service_package` | getAll, getById | 5 files |
| `employee` | getAll, getById, update | 6 files |

**Per feature, ubah:**
1. `domain/repositories/{feature}_repository.dart` — `Either` → `Result`
2. `data/repositories/{feature}_repository_impl.dart` — `Left/Right` → `Result.failure/Result.success`
3. `domain/usecases/*.dart` — `Either` → `Result`
4. `presentation/bloc/{feature}_cubit.dart` — `.fold()` → `.when()`
5. `presentation/bloc/{feature}_state.dart` — tambah `currentPage` di Loaded state, pastikan `sealed class`

**Verifikasi:** `flutter analyze apps/cashier` harus clean.

---

### Fase 3: Cashier — CRUD + Extra Features (Batch 2)

**Scope:** 5 feature CRUD yang lebih kompleks.

| Feature | Usecases | Extra Notes |
|---------|----------|-------------|
| `category` | getAll, getById, store, update, destroy | Has local datasource |
| `laundry_service` | getAll, getById, store, update, destroy | |
| `customer` | getAll, getById, store, update, destroy + storeContract + storeSubscription | Hapus custom retry logic, gunakan `NetworkRetryMixin` |
| `customer_subscription` | getAll, getById, store, update, destroy | **Fix typo**: rename `customer_subcription_state.dart` → `customer_subscription_state.dart` |
| `deposit` | getAll, getById, store, update | |

---

### Fase 4: Cashier — Financial Features (Batch 3)

**Scope:** 3 feature finance.

| Feature | Usecases | Extra Notes |
|---------|----------|-------------|
| `expense` | getAll, getById, store, update | Has file attachment logic — keep as-is |
| `petty_cash` | getAll, getById, store, update | **Fix folder**: rename `domain/usecase/` → `domain/usecases/` |
| `home` | getHomeData | Single usecase |

---

### Fase 5: Cashier — Utility Features (Batch 4)

**Scope:** 3 feature yang interaction-focused.

| Feature | Usecases | Extra Notes |
|---------|----------|-------------|
| `wa_notification` | getPreview, send | |
| `print` | getPrintInfo, processReceipt, processLabel | |
| `unit` (presentation only) | N/A — uses shared package | Pastikan shared package sudah migrasi di Fase 1 |

---

### Fase 6: Cashier — Auth & Presentation-Only Features

**Scope:** Feature yang hanya punya presentation layer.

| Feature | Action |
|---------|--------|
| `auth` | Update cubit `.fold()` → `.when()` jika menggunakan `Either` dari shared repo |
| `setting` | Presentation only — cek jika ada `Either` usage |
| `splash` / `onboarding` | UI only — skip |
| `finances` | Presentation only — skip |

---

### Fase 7: Production App Cleanup

**Scope:** Fix minor issues di production app.

| Task | Action |
|------|--------|
| Hapus file duplikat `order_item_impl_repository.dart` | Delete file — `order_item_repository_impl.dart` adalah file yang benar |
| Hapus standalone `withRetry()` function | Di `order_remote_datasource.dart` line 6-8 — gunakan `NetworkRetryMixin` |
| Verify state pattern consistency | Pastikan semua feature punya `sealed class` |

---

## 6. Instruksi Eksekusi Untuk AI

> [!CAUTION]
> **Pattern wajib per file type — salin persis, jangan improvisasi.**

### 6.1 Checklist Per Feature Migration

```
□ 1. domain/repositories/{feature}_repository.dart
     - Hapus `import 'package:dartz/dartz.dart'`
     - Ganti semua `Either<Failure, T>` → `Result<T>`
     - Import `package:wash_wallet_core/wash_wallet_core.dart` (yang export Result)

□ 2. data/repositories/{feature}_repository_impl.dart
     - Hapus `import 'package:dartz/dartz.dart'`
     - Ganti `return Right(...)` → `return Result.success(...)`
     - Ganti `return Left(...)` → `return Result.failure(...)`
     - Tambahkan `_mapApiExceptionToFailure()` method (copy dari order)

□ 3. domain/usecases/*.dart
     - Hapus `import 'package:dartz/dartz.dart'`
     - Ganti semua `Either<Failure, T>` → `Result<T>`

□ 4. presentation/bloc/{feature}_cubit.dart
     - Hapus `import 'package:dartz/dartz.dart'`
     - Ganti semua `.fold(...)` → `.when(success: ..., failure: ...)`
     - Pastikan error handler: `failure: (failure) => emit({Feature}Failure(failure))`
       BUKAN `failure: (failure) => emit({Feature}Error(failure.message))`

□ 5. presentation/bloc/{feature}_state.dart
     - Pastikan `sealed class` (bukan `abstract class`)
     - Pastikan Loaded state punya `hasReachedMax` + `currentPage`
     - Pastikan ada `{Feature}Failure(Failure failure)` state
     - Hapus `{Feature}Error(String message)` jika ada duplicate
```

### 6.2 Urutan Import Standard

```dart
// 1. Dart SDK
import 'dart:convert';

// 2. Flutter SDK
import 'package:flutter/material.dart';

// 3. External packages
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

// 4. Shared workspace packages
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

// 5. Relative imports (feature-local)
import '../repositories/{feature}_repository.dart';
```

### 6.3 Yang TIDAK Boleh Diubah

- ❌ Jangan ubah `_normalizeJsonData()` logic — itu data-specific
- ❌ Jangan ubah screen/widget files — fokus hanya pada data/domain/bloc layer
- ❌ Jangan refactor datasource methods signature (parameter names tetap)
- ❌ Jangan merge/split usecase files
- ❌ Jangan ubah entity/model files di `wash_wallet_domain`
- ❌ Jangan ubah `main.dart` wiring — hanya internal feature files

---

## 7. Verifikasi Plan

### Per Fase:
```bash
# Setelah tiap fase selesai:
flutter analyze apps/cashier
flutter analyze apps/production
dart analyze packages/wash_wallet_domain
dart analyze packages/wash_wallet_data
```

### End-to-End:
```bash
# Pastikan tidak ada import dartz tersisa di feature files
grep -r "package:dartz" apps/cashier/lib/features/
grep -r "package:dartz" apps/production/lib/features/
grep -r "package:dartz" packages/wash_wallet_domain/lib/src/repositories/

# Pastikan tidak ada .fold() tersisa di cubit files
grep -r "\.fold(" apps/cashier/lib/features/*/presentation/bloc/
grep -r "\.fold(" apps/production/lib/features/*/presentation/bloc/
```

---

## 8. Open Questions

> [!IMPORTANT]
> **Q1:** Shared domain repositories di `wash_wallet_domain` (`order_repository.dart`, `order_cart_repository.dart`) — apakah ini masih dipakai? Karena app-level (cashier/production) punya repository sendiri di `features/order/domain/repositories/`. Apakah boleh dihapus atau harus dipertahankan?

> [!IMPORTANT]
> **Q2:** `_validateResponse()` dan `_handleError()` methods — setiap datasource punya copy sendiri. Apakah mau diekstrak ke shared mixin/base class di `wash_wallet_core`, atau tetap copy per datasource?

> [!IMPORTANT]
> **Q3:** State pattern — beberapa feature (e.g. order cashier) punya KEDUA `OrderError(String)` DAN `OrderFailure(Failure)`. Apakah konsolidasi ke `{Feature}Failure(Failure)` saja dan hapus `{Feature}Error`? Ini akan mempengaruhi semua UI listener yang pakai state tersebut.

> [!IMPORTANT]
> **Q4:** Method naming di cubit — saat ini mixed antara `loadCustomers()` dan `getAll()`, `loadExpenseDetail()` dan `getById()`. Apakah mau distandardisasi ke nama pendek (`getAll`, `getById`, `store`, `update`, `destroy`, `complete`) seperti di order cubit?
