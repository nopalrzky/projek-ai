# Provider Specification (Presentation Layer)

> **Layer:** Presentation Layer  
> **Lokasi:** `lib/features/<feature>/presentation/providers/<feature>_provider.dart`  
> **Dependensi:** `wash_wallet_core`, `package:dio/dio.dart`, semua layer feature

---

## Konsep Utama

Provider adalah **factory / wiring class** yang menghubungkan semua layer menjadi satu. Bertanggung jawab:
1. Membuat instance datasource, repository, usecases, dan cubit
2. Menyatukan dependency injection secara manual
3. Menjadi satu-satunya tempat di mana semua lapisan dirakit

Provider **bukan** state manager. Provider hanya factory object.

---

## Struktur Provider

Provider adalah class dengan:
- Constructor privat `<Feature>Provider._()` — **tidak bisa diinstansiasi**
- Semua method adalah `static`
- Ada **create** method untuk setiap layer
- Ada satu method `createCubit(Dio dio, ApiEndpoints endpoints)` sebagai entry point utama

---

## Template Standar (Tanpa Local Datasource)

```dart
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:dio/dio.dart';

import '../../data/datasources/<feature>_remote_datasource.dart';
import '../../data/repositories/<feature>_repository_impl.dart';
import '../../domain/repositories/<feature>_repository.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import '../../domain/usecases/destroy_usecase.dart';
import '../bloc/<feature>_cubit.dart';

class <Feature>Provider {
  <Feature>Provider._();

  static <Feature>RemoteDatasource createRemoteDatasource(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return <Feature>RemoteDatasourceImpl(dio, endpoints);
  }

  static <Feature>Repository createRepository(
    <Feature>RemoteDatasource remoteDatasource,
  ) {
    return <Feature>RepositoryImpl(remoteDatasource);
  }

  static GetAllUsecase createGetAllUsecase(<Feature>Repository repository) {
    return GetAllUsecase(repository);
  }

  static GetByIdUsecase createGetByIdUsecase(<Feature>Repository repository) {
    return GetByIdUsecase(repository);
  }

  static StoreUsecase createStoreUsecase(<Feature>Repository repository) {
    return StoreUsecase(repository);
  }

  static UpdateUsecase createUpdateUsecase(<Feature>Repository repository) {
    return UpdateUsecase(repository);
  }

  static DestroyUsecase createDestroyUsecase(<Feature>Repository repository) {
    return DestroyUsecase(repository);
  }

  /// Entry point utama — gunakan ini untuk membuat Cubit siap pakai.
  static <Feature>Cubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);

    return <Feature>Cubit(
      getAllUsecase: createGetAllUsecase(repository),
      getByIdUsecase: createGetByIdUsecase(repository),
      storeUsecase: createStoreUsecase(repository),
      updateUsecase: createUpdateUsecase(repository),
      destroyUsecase: createDestroyUsecase(repository),
    );
  }
}
```

---

## Template dengan Local Datasource (Cache)

```dart
class <Feature>Provider {
  <Feature>Provider._();

  static <Feature>RemoteDatasource createRemoteDatasource(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return <Feature>RemoteDatasourceImpl(dio, endpoints);
  }

  static <Feature>LocalDatasource createLocalDatasource() {
    return <Feature>LocalDatasourceImpl();
  }

  static <Feature>Repository createRepository(
    <Feature>RemoteDatasource remoteDatasource,
    <Feature>LocalDatasource localDatasource,
  ) {
    return <Feature>RepositoryImpl(remoteDatasource, localDatasource);
  }

  // ... usecases sama ...

  static <Feature>Cubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final localDatasource = createLocalDatasource();
    final repository = createRepository(remoteDatasource, localDatasource);

    return <Feature>Cubit(
      getAllUsecase: createGetAllUsecase(repository),
      getByIdUsecase: createGetByIdUsecase(repository),
      storeUsecase: createStoreUsecase(repository),
      updateUsecase: createUpdateUsecase(repository),
      destroyUsecase: createDestroyUsecase(repository),
    );
  }
}
```

---

## Cara Penggunaan di UI / main.dart

```dart
// Di main.dart atau di route yang membutuhkan cubit
BlocProvider(
  create: (context) => <Feature>Provider.createCubit(dio, apiEndpoints),
  child: <Feature>Screen(),
)
```

---

## Aturan & Konvensi

| Aturan | Keterangan |
|--------|-----------|
| Constructor | Selalu privat: `<Feature>Provider._()` |
| Semua method | `static` — tidak perlu instance |
| Entry point | Method `createCubit(Dio, ApiEndpoints)` |
| Urutan `createCubit` | datasource → repository → usecases → cubit |
| Penamaan method | `create<WhatItCreates>` |
| Import | Gunakan relative import (bukan package import) untuk file dalam feature |
| Nama file | `<feature>_provider.dart` |

---

## Method Tambahan: createCubitWithExistingDatasource

Jika Cubit perlu di-inject dengan datasource yang sudah ada (singleton atau shared):

```dart
static <Feature>Cubit createCubitFrom(
  <Feature>RemoteDatasource remoteDatasource,
) {
  final repository = createRepository(remoteDatasource);
  return <Feature>Cubit(
    getAllUsecase: createGetAllUsecase(repository),
    getByIdUsecase: createGetByIdUsecase(repository),
    storeUsecase: createStoreUsecase(repository),
    updateUsecase: createUpdateUsecase(repository),
    destroyUsecase: createDestroyUsecase(repository),
  );
}
```

---

## Diagram Dependency Provider

```
<Feature>Provider.createCubit(dio, endpoints)
          │
          ├─► createRemoteDatasource(dio, endpoints)
          │         └─► <Feature>RemoteDatasourceImpl
          │
          ├─► createLocalDatasource()              [jika ada cache]
          │         └─► <Feature>LocalDatasourceImpl
          │
          ├─► createRepository(remote, local)
          │         └─► <Feature>RepositoryImpl
          │
          ├─► createGetAllUsecase(repo)   → GetAllUsecase
          ├─► createGetByIdUsecase(repo)  → GetByIdUsecase
          ├─► createStoreUsecase(repo)    → StoreUsecase
          ├─► createUpdateUsecase(repo)   → UpdateUsecase
          ├─► createDestroyUsecase(repo)  → DestroyUsecase
          │
          └─► <Feature>Cubit(all usecases)
```

---

## Contoh Nyata

- **Dengan local datasource:** `apps/cashier/lib/features/category/presentation/providers/category_provider.dart`
- **Tanpa local datasource:** `apps/cashier/lib/features/customer_subscription/presentation/providers/customer_subscriptions_provider.dart`
