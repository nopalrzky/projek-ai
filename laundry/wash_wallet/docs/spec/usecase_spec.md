# Usecase Specification (Domain Layer)

> **Layer:** Domain Layer  
> **Lokasi:** `lib/features/<feature>/domain/usecases/<action>_usecase.dart`  
> **Dependensi:** `wash_wallet_core`, `wash_wallet_domain`, domain repository interface

---

## Konsep Utama

Usecase adalah unit terkecil dari business logic. Setiap usecase:
1. Hanya memiliki **satu tanggung jawab** (satu operasi bisnis)
2. Menerima input melalui **params class** (untuk operasi dengan banyak parameter) atau langsung
3. Mendelegasikan ke repository
4. Mengembalikan `Future<Result<T>>`

Satu file per usecase. Nama file mengikuti nama operasi: `get_all_usecase.dart`, `store_usecase.dart`, dst.

---

## Usecase Standar per Feature

| File | Operasi |
|------|---------|
| `get_all_usecase.dart` | Ambil daftar (dengan pagination & filter) |
| `get_by_id_usecase.dart` | Ambil satu item |
| `store_usecase.dart` | Buat item baru |
| `update_usecase.dart` | Perbarui item |
| `destroy_usecase.dart` | Hapus item |

---

## Template: GetAll Usecase

```dart
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/<feature>_repository.dart';

class GetAllUsecase {
  final <Feature>Repository _repository;

  GetAllUsecase(this._repository);

  Future<Result<List<<Feature>>>> call({
    int page = 1,
    int perPage = 15,
    String? search,
    // filter opsional sesuai domain...
    String sortBy = 'created_at',
    String sortDirection = 'desc',
    bool forceRefresh = false,
  }) {
    return _repository.getAll(
      page: page,
      perPage: perPage,
      search: search,
      sortBy: sortBy,
      sortDirection: sortDirection,
      forceRefresh: forceRefresh,
    );
  }
}
```

> **Catatan:** `GetAllUsecase` biasanya **tidak** menggunakan Params class karena semua parameter opsional dengan default value.

---

## Template: GetById Usecase

```dart
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/<feature>_repository.dart';

class GetByIdUsecase {
  final <Feature>Repository _repository;

  GetByIdUsecase(this._repository);

  Future<Result<<Feature>>> call({
    required int id,
    bool forceRefresh = false,
  }) {
    return _repository.getById(id: id, forceRefresh: forceRefresh);
  }
}
```

---

## Template: Store Usecase (dengan Params class)

```dart
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/<feature>_repository.dart';

// ─── Params ──────────────────────────────────────────────────────────────────

class Store<Feature>Params {
  final <Type> <requiredField>;
  final <Type>? <optionalField>;

  Store<Feature>Params({
    required this.<requiredField>,
    this.<optionalField>,
  });
}

// ─── Usecase ──────────────────────────────────────────────────────────────────

class StoreUsecase {
  final <Feature>Repository _repository;

  StoreUsecase(this._repository);

  Future<Result<<Feature>>> call(Store<Feature>Params params) async {
    return await _repository.store(
      <requiredField>: params.<requiredField>,
      <optionalField>: params.<optionalField>,
    );
  }
}
```

---

## Template: Update Usecase (dengan Params class)

```dart
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/<feature>_repository.dart';

// ─── Params ──────────────────────────────────────────────────────────────────

class Update<Feature>Params {
  final int id;
  final <Type>? <optionalField1>;
  final <Type>? <optionalField2>;

  Update<Feature>Params({
    required this.id,
    this.<optionalField1>,
    this.<optionalField2>,
  });
}

// ─── Usecase ──────────────────────────────────────────────────────────────────

class UpdateUsecase {
  final <Feature>Repository _repository;

  UpdateUsecase(this._repository);

  Future<Result<<Feature>>> call(Update<Feature>Params params) async {
    return await _repository.update(
      id: params.id,
      <optionalField1>: params.<optionalField1>,
      <optionalField2>: params.<optionalField2>,
    );
  }
}
```

---

## Template: Destroy Usecase

```dart
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../repositories/<feature>_repository.dart';

class DestroyUsecase {
  final <Feature>Repository _repository;

  DestroyUsecase(this._repository);

  Future<Result<void>> call(int id) async {
    return await _repository.destroy(id);
  }
}
```

> **Catatan:** `DestroyUsecase` dan `GetByIdUsecase` (simple) tidak perlu Params class — input hanya `id`.

---

## Kapan Menggunakan Params Class

| Kondisi | Gunakan Params? |
|---------|----------------|
| Input hanya `id` (destroy, getById) | ❌ Langsung sebagai parameter |
| Input banyak field (store, update, getAll dengan banyak filter) | ✅ Params class |
| Input semua optional dengan default | ❌ Named params langsung |

---

## Konvensi Penamaan

| Item | Konvensi |
|------|---------|
| Class usecase | `GetAllUsecase`, `StoreUsecase`, `UpdateUsecase` (bukan `GetAllCategoryUsecase`) |
| Params class | `Store<Feature>Params`, `Update<Feature>Params`, `GetAll<Feature>Params` |
| Method | Selalu `call(...)` — Dart callable class |

> **Mengapa nama usecase tidak menyertakan nama feature?** Karena usecase berada dalam folder feature masing-masing. `GetAllUsecase` di folder `category/domain/usecases/` sudah jelas untuk category.

---

## Usecase Non-CRUD

Untuk operasi bisnis khusus di luar CRUD:

```dart
// Contoh: VerifyOtpUsecase
class VerifyOtpUsecase {
  final AuthRepository _repository;

  VerifyOtpUsecase(this._repository);

  Future<Result<AuthToken>> call({
    required String phone,
    required String otp,
  }) {
    return _repository.verifyOtp(phone: phone, otp: otp);
  }
}
```

---

## Contoh Nyata: Category Usecases

- `get_all_usecase.dart` → `apps/cashier/lib/features/category/domain/usecases/get_all_usecase.dart`
- `store_usecase.dart` → `apps/cashier/lib/features/category/domain/usecases/store_usecase.dart`
- `update_usecase.dart` → `apps/cashier/lib/features/category/domain/usecases/update_usecase.dart`
- `destroy_usecase.dart` → `apps/cashier/lib/features/category/domain/usecases/destroy_usecase.dart`
