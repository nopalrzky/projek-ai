# Cubit Specification (Presentation Layer)

> **Layer:** Presentation Layer  
> **Lokasi:** `lib/features/<feature>/presentation/bloc/<feature>_cubit.dart`  
> **Dependensi:** `flutter_bloc`, domain usecases, `<feature>_state.dart`

---

## Konsep Utama

Cubit adalah state manager untuk sebuah feature. Bertugas:
1. Menerima aksi dari UI
2. Memanggil usecase yang sesuai
3. Mengkonversi `Result<T>` menjadi state via `result.when(...)`
4. Memancarkan (`emit`) state baru ke UI

Cubit **tidak** boleh tahu tentang remote datasource, repository, atau HTTP. Semua logika I/O ada di usecase.

---

## Template Lengkap

```dart
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import '../../domain/usecases/destroy_usecase.dart';

import '<feature>_state.dart';

class <Feature>Cubit extends Cubit<<Feature>State> {
  final GetAllUsecase _getAllUsecase;
  final GetByIdUsecase _getByIdUsecase;
  final StoreUsecase _storeUsecase;
  final UpdateUsecase _updateUsecase;
  final DestroyUsecase _destroyUsecase;

  <Feature>Cubit({
    required GetAllUsecase getAllUsecase,
    required GetByIdUsecase getByIdUsecase,
    required StoreUsecase storeUsecase,
    required UpdateUsecase updateUsecase,
    required DestroyUsecase destroyUsecase,
  }) : _getAllUsecase = getAllUsecase,
       _getByIdUsecase = getByIdUsecase,
       _storeUsecase = storeUsecase,
       _updateUsecase = updateUsecase,
       _destroyUsecase = destroyUsecase,
       super(const <Feature>Initial());

  // ─── GetAll (dengan pagination) ──────────────────────────────────────────

  Future<void> getAll({
    int page = 1,
    String? search,
    // filter opsional sesuai kebutuhan UI...
    bool forceRefresh = false,
  }) async {
    // Hanya emit Loading di page pertama; untuk page berikutnya, state
    // sudah ada (<Feature>sLoaded) dan UI mengelola loading indicator sendiri.
    if (page == 1) {
      emit(const <Feature>Loading());
    }

    final result = await _getAllUsecase(
      page: page,
      search: search,
      forceRefresh: forceRefresh,
    );

    result.when(
      success: (<feature>s) {
        if (page == 1) {
          emit(
            <Feature>sLoaded(
              <feature>s: <feature>s,
              hasReachedMax: <feature>s.length < 15,
              currentPage: page,
            ),
          );
        } else {
          final currentState = state;
          if (currentState is <Feature>sLoaded) {
            emit(
              currentState.copyWith(
                <feature>s: currentState.<feature>s + <feature>s,
                hasReachedMax: <feature>s.isEmpty || <feature>s.length < 15,
                currentPage: page,
              ),
            );
          }
        }
      },
      failure: (failure) => emit(<Feature>Failure(failure)),
    );
  }

  // ─── GetById ─────────────────────────────────────────────────────────────

  Future<void> getById({
    required int id,
    bool forceRefresh = false,
  }) async {
    emit(const <Feature>Loading());

    final result = await _getByIdUsecase(id: id, forceRefresh: forceRefresh);

    result.when(
      success: (<feature>) => emit(<Feature>DetailLoaded(<feature>)),
      failure: (failure) => emit(<Feature>Failure(failure)),
    );
  }

  // ─── Store ────────────────────────────────────────────────────────────────

  Future<void> store({
    required <Type> <requiredField>,
    <Type>? <optionalField>,
  }) async {
    emit(const <Feature>Loading());

    final params = Store<Feature>Params(
      <requiredField>: <requiredField>,
      <optionalField>: <optionalField>,
    );

    final result = await _storeUsecase(params);

    result.when(
      success: (<feature>) => emit(
        <Feature>ActionSuccess('<Feature> berhasil dibuat', <feature>: <feature>),
      ),
      failure: (failure) => emit(<Feature>Failure(failure)),
    );
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  Future<void> update({
    required int id,
    <Type>? <optionalField>,
  }) async {
    emit(const <Feature>Loading());

    final params = Update<Feature>Params(
      id: id,
      <optionalField>: <optionalField>,
    );

    final result = await _updateUsecase(params);

    result.when(
      success: (<feature>) => emit(
        <Feature>ActionSuccess('<Feature> berhasil diperbarui', <feature>: <feature>),
      ),
      failure: (failure) => emit(<Feature>Failure(failure)),
    );
  }

  // ─── Destroy ──────────────────────────────────────────────────────────────

  Future<void> destroy(int id) async {
    emit(const <Feature>Loading());

    final result = await _destroyUsecase(id);

    result.when(
      success: (_) => emit(const <Feature>ActionSuccess('<Feature> berhasil dihapus')),
      failure: (failure) => emit(<Feature>Failure(failure)),
    );
  }
}
```

---

## Pola result.when() — Wajib Digunakan

Selalu gunakan `result.when()` — **jangan** gunakan `.fold()` atau `if (result.isSuccess)`:

```dart
// ✅ BENAR
result.when(
  success: (data) => emit(SomeLoadedState(data)),
  failure: (failure) => emit(SomeFailureState(failure)),
);

// ❌ SALAH - hindari
result.fold(
  (failure) => emit(SomeFailureState(failure)),
  (data) => emit(SomeLoadedState(data)),
);

// ❌ SALAH - hindari
if (result is Success) { ... }
```

---

## Pola Pagination (Load More)

```dart
Future<void> loadMore() async {
  final currentState = state;
  if (currentState is! <Feature>sLoaded) return;
  if (currentState.hasReachedMax) return;

  await getAll(page: currentState.currentPage + 1);
}

Future<void> refresh() async {
  await getAll(page: 1, forceRefresh: true);
}
```

---

## Emit Loading: Kapan dan Kapan Tidak

| Situasi | Emit Loading? |
|---------|--------------|
| `getAll` page 1 (fresh load / refresh) | ✅ Ya |
| `getAll` page > 1 (load more) | ❌ Tidak — UI pakai loading indicator sendiri |
| `getById` | ✅ Ya |
| `store` | ✅ Ya |
| `update` | ✅ Ya |
| `destroy` | ✅ Ya |

---

## Method Helper (Opsional)

Cubit boleh memiliki method convenience yang mendelegasikan ke method utama:

```dart
// Contoh dari CustomerSubscriptionCubit
Future<void> loadByCustomerId({
  required int customerId,
  int page = 1,
  String? status,
}) async {
  await getAll(
    page: page,
    status: status,
    customerId: customerId,
  );
}
```

> **Aturan:** Helper method harus mendelegasikan ke method CRUD utama, bukan mengimplementasikan logika sendiri.

---

## Constructor Pattern

Selalu gunakan **named parameters** di constructor Cubit:

```dart
// ✅ BENAR — named params, mudah dibaca di Provider
<Feature>Cubit({
  required GetAllUsecase getAllUsecase,
  required GetByIdUsecase getByIdUsecase,
  required StoreUsecase storeUsecase,
  required UpdateUsecase updateUsecase,
  required DestroyUsecase destroyUsecase,
})

// ❌ SALAH — positional params di Cubit susah dibaca
<Feature>Cubit(this._getAllUsecase, this._getByIdUsecase, ...)
```

---

## Contoh Nyata

- `apps/cashier/lib/features/category/presentation/bloc/category_cubit.dart`
- `apps/cashier/lib/features/customer_subscription/presentation/bloc/customer_subscription_cubit.dart`
