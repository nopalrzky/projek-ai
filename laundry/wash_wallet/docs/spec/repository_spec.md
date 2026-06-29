# Repository Specification (Domain Layer)

> **Layer:** Domain Layer  
> **Lokasi:** `lib/features/<feature>/domain/repositories/<feature>_repository.dart`  
> **Dependensi:** `wash_wallet_core` (untuk `Result<T>`), `wash_wallet_domain` (untuk Entity)

---

## Konsep Utama

Repository interface adalah **kontrak abstrak** di domain layer yang:
1. Mendefinisikan operasi bisnis yang tersedia untuk sebuah fitur
2. **Selalu** mengembalikan `Result<T>` — tidak pernah melempar exception
3. Menggunakan **Entity** (bukan Model) sebagai tipe data
4. Tidak tahu tentang implementasi — murni interface

Repository **tidak** berisi logika. Logika ada di `RepositoryImpl`.

---

## Template

```dart
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class <Feature>Repository {
  /// Ambil semua data dengan pagination & filter opsional.
  Future<Result<List<<Feature>>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    // filter spesifik fitur...
    String sortBy = 'created_at',
    String sortDirection = 'desc',
    bool forceRefresh = false,   // hanya jika ada local cache
  });

  /// Ambil satu data berdasarkan ID.
  Future<Result<<Feature>>> getById({
    required int id,
    bool forceRefresh = false,   // hanya jika ada local cache
  });

  /// Buat data baru.
  Future<Result<<Feature>>> store({
    required <Type> <requiredField>,
    <Type>? <optionalField>,
  });

  /// Perbarui data yang ada.
  Future<Result<<Feature>>> update({
    required int id,
    <Type>? <optionalField>,
  });

  /// Hapus data berdasarkan ID.
  Future<Result<void>> destroy(int id);
}
```

---

## Aturan & Konvensi

| Aturan | Keterangan |
|--------|-----------|
| Return type | Selalu `Future<Result<T>>` |
| Tipe data T | Gunakan **Entity** dari `wash_wallet_domain` |
| `forceRefresh` | Tambahkan hanya jika feature memiliki local cache (Hive/SharedPrefs) |
| Error semantics | Tidak ada exception di interface — error dikomunikasikan via `Result.failure(Failure)` |
| Method naming | `getAll`, `getById`, `store`, `update`, `destroy` (gunakan kata ini secara konsisten) |
| Params getById | Gunakan `required int id` dengan named param |
| Params destroy | Gunakan positional `int id` (simple, tidak perlu named) |

---

## Variasi: Repository Tanpa Cache

Jika feature tidak memerlukan caching (tidak ada local datasource), hilangkan parameter `forceRefresh`:

```dart
abstract class <Feature>Repository {
  Future<Result<List<<Feature>>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  });

  Future<Result<<Feature>>> getById(int id);  // simpler tanpa named param
  Future<Result<<Feature>>> store({...});
  Future<Result<<Feature>>> update({...});
  Future<Result<void>> destroy(int id);
}
```

## Variasi: Repository dengan Method Tambahan (Non-CRUD)

Untuk method bisnis khusus di luar CRUD standar:

```dart
abstract class CustomerSubscriptionRepository {
  // ... CRUD standard ...

  /// Shortcut untuk filter by customerId
  Future<Result<List<CustomerSubscription>>> getByCustomerId({
    required int customerId,
    int page = 1,
    String? status,
  });

  /// Shortcut untuk filter by outletId
  Future<Result<List<CustomerSubscription>>> getByOutletId({
    required int outletId,
    int page = 1,
    String? status,
  });
}
```

---

## Hubungan dengan Layer Lain

```
Domain Layer                    Data Layer
─────────────────────────────   ─────────────────────────────
<Feature>Repository   ◄──────── <Feature>RepositoryImpl
     (abstract)                       (concrete)
         ▲
         │ digunakan oleh
         │
    <Feature>Usecase
```

---

## Contoh Nyata: CategoryRepository

Lihat: `apps/cashier/lib/features/category/domain/repositories/category_repository.dart`
