# Repository Impl Specification (Data Layer)

> **Layer:** Data Layer  
> **Lokasi:** `lib/features/<feature>/data/repositories/<feature>_repository_impl.dart`  
> **Dependensi:** `wash_wallet_core`, `wash_wallet_domain`, domain repository interface, datasource(s)

---

## Konsep Utama

`RepositoryImpl` adalah implementasi konkret dari domain repository. Bertanggung jawab:
1. Mengeksekusi operasi via RemoteDatasource (dan LocalDatasource jika ada)
2. Mengkonversi `Model → Entity` menggunakan `.toEntity()`
3. Menangani exception dari datasource dan mengkonversi ke `Failure`
4. Mengembalikan `Result.success(entity)` atau `Result.failure(failure)`
5. Mengelola cache: baca cache → fetch remote → simpan ke cache

---

## Template Dasar (Tanpa Cache)

```dart
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/repositories/<feature>_repository.dart';
import '../datasources/<feature>_remote_datasource.dart';

class <Feature>RepositoryImpl implements <Feature>Repository {
  final <Feature>RemoteDatasource _remoteDatasource;

  <Feature>RepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<List<<Feature>>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  }) async {
    try {
      final models = await _remoteDatasource.getAll(
        page: page,
        perPage: perPage,
        search: search,
        sortBy: sortBy,
        sortDirection: sortDirection,
      );
      return Result.success(models.map((m) => m.toEntity()).toList());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<<Feature>>> getById(int id) async {
    try {
      final model = await _remoteDatasource.getById(id);
      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<<Feature>>> store({
    required <Type> <requiredField>,
    <Type>? <optionalField>,
  }) async {
    try {
      final model = await _remoteDatasource.store(
        <requiredField>: <requiredField>,
        <optionalField>: <optionalField>,
      );
      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<<Feature>>> update({
    required int id,
    <Type>? <optionalField>,
  }) async {
    try {
      final model = await _remoteDatasource.update(
        id: id,
        <optionalField>: <optionalField>,
      );
      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<void>> destroy(int id) async {
    try {
      await _remoteDatasource.destroy(id);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  // ─── Exception → Failure Mapper ────────────────────────────────────────────

  Failure _mapExceptionToFailure(Object exception) {
    if (exception is NetworkException) {
      return NetworkFailure(message: exception.message);
    }

    if (exception is ApiException) {
      switch (exception.statusCode) {
        case 400:
        case 422:
          return ValidationFailure(
            message: exception.message,
            errors: exception.errors,
          );
        case 401:
        case 403:
          return AuthFailure(message: exception.message);
        case 404:
          return ServerFailure(message: exception.message, statusCode: 404);
        default:
          return ServerFailure(
            message: exception.message,
            statusCode: exception.statusCode,
          );
      }
    }

    return ServerFailure(message: exception.toString());
  }
}
```

---

## Template dengan Cache (Local + Remote)

```dart
class <Feature>RepositoryImpl implements <Feature>Repository {
  final <Feature>RemoteDatasource _remoteDatasource;
  final <Feature>LocalDatasource _localDatasource;

  <Feature>RepositoryImpl(this._remoteDatasource, this._localDatasource);

  @override
  Future<Result<List<<Feature>>>> getAll({
    int? outletId,
    int page = 1,
    String? search,
    bool forceRefresh = false,
  }) async {
    try {
      // 1. Coba cache dulu (hanya untuk page=1 tanpa filter dinamis)
      if (!forceRefresh && page == 1 && search == null) {
        try {
          final cached = await _localDatasource.getCached<Feature>s(outletId);
          if (cached.isNotEmpty) {
            return Result.success(cached.map((m) => m.toEntity()).toList());
          }
        } catch (_) {}
      }

      // 2. Fetch dari remote
      final models = await _remoteDatasource.getAll(
        outletId: outletId,
        page: page,
        search: search,
      );

      // 3. Simpan ke cache (hanya page=1 tanpa filter)
      if (page == 1 && search == null && outletId != null) {
        try {
          await _localDatasource.cache<Feature>s(models, outletId);
        } catch (_) {}
      }

      return Result.success(models.map((m) => m.toEntity()).toList());
    } catch (e) {
      // 4. Fallback ke cache jika network error
      if (e is NetworkException && page == 1 && search == null) {
        try {
          final cached = await _localDatasource.getCached<Feature>s(outletId);
          if (cached.isNotEmpty) {
            return Result.success(cached.map((m) => m.toEntity()).toList());
          }
        } catch (_) {}
      }

      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<<Feature>>> store({...}) async {
    try {
      final model = await _remoteDatasource.store(...);

      // Invalidate cache setelah mutasi
      try {
        await _localDatasource.clear<Feature>s(outletId);
      } catch (_) {}

      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  // ... update, destroy: sama — invalidate cache setelah berhasil
}
```

---

## Pola Cache Invalidation

| Operasi | Aksi Cache |
|---------|-----------|
| `getAll` (page=1, tanpa filter) | Read cache → Write cache jika miss |
| `getAll` (page>1 atau ada filter) | Langsung ke remote, tidak cache |
| `getById` | Read cache per ID → Write cache setelah fetch |
| `store` | Invalidate list cache setelah sukses |
| `update` | Invalidate list cache + detail cache setelah sukses |
| `destroy` | Invalidate semua cache setelah sukses |

---

## Aturan _mapExceptionToFailure

Selalu gunakan mapping yang konsisten:

```
NetworkException        → NetworkFailure
ApiException (400/422)  → ValidationFailure (dengan errors)
ApiException (401/403)  → AuthFailure
ApiException (404)      → ServerFailure (statusCode: 404)
ApiException (lainnya)  → ServerFailure
Exception lainnya       → ServerFailure (message: toString())
```

---

## Aturan & Konvensi

| Aturan | Keterangan |
|--------|-----------|
| Return type | Selalu `Future<Result<T>>` |
| Konversi | Model → Entity selalu via `.toEntity()` |
| Destroy sukses | Return `const Result.success(null)` |
| Cache errors | Selalu `catch (_) {}` — jangan biarkan cache error propagate |
| Constructor | Positional params: `(this._remoteDatasource)` atau `(this._remoteDatasource, this._localDatasource)` |

---

## Contoh Nyata

- **Dengan cache:** `apps/cashier/lib/features/category/data/repositories/category_repository_impl.dart`  
- **Tanpa cache:** `apps/cashier/lib/features/customer_subscription/data/repositories/customer_subscription_repository_impl.dart`
