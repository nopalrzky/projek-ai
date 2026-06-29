# State Specification (Presentation Layer)

> **Layer:** Presentation Layer  
> **Lokasi:** `lib/features/<feature>/presentation/bloc/<feature>_state.dart`  
> **Dependensi:** `equatable`, `wash_wallet_core` (untuk `Failure`), `wash_wallet_domain` (untuk Entity)

---

## Konsep Utama

State mendefinisikan semua kemungkinan kondisi UI dari sebuah feature. Menggunakan:
- `sealed class` sebagai base — memungkinkan exhaustive pattern matching di UI
- `Equatable` untuk perbandingan state yang efisien (mencegah rebuild yang tidak perlu)
- Entity dari domain layer sebagai tipe data (bukan Model)

---

## Struktur State Standar

Setiap feature memiliki **5 state standar**:

| State | Kapan diemit |
|-------|-------------|
| `<Feature>Initial` | State awal, sebelum ada aksi apapun |
| `<Feature>Loading` | Saat request sedang berjalan |
| `<Feature>sLoaded` | Setelah `getAll()` berhasil (list) |
| `<Feature>DetailLoaded` | Setelah `getById()` berhasil (single item) |
| `<Feature>ActionSuccess` | Setelah `store`, `update`, atau `destroy` berhasil |
| `<Feature>Failure` | Setelah operasi apapun gagal |

---

## Template Lengkap

```dart
import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

// ─── Base State ───────────────────────────────────────────────────────────────

sealed class <Feature>State extends Equatable {
  const <Feature>State();

  @override
  List<Object?> get props => [];
}

// ─── Initial ──────────────────────────────────────────────────────────────────

class <Feature>Initial extends <Feature>State {
  const <Feature>Initial();
}

// ─── Loading ──────────────────────────────────────────────────────────────────

class <Feature>Loading extends <Feature>State {
  const <Feature>Loading();
}

// ─── List Loaded (dengan pagination) ──────────────────────────────────────────

class <Feature>sLoaded extends <Feature>State {
  final List<<Feature>> <feature>s;
  final bool hasReachedMax;
  final int currentPage;

  const <Feature>sLoaded({
    required this.<feature>s,
    this.hasReachedMax = false,
    this.currentPage = 1,
  });

  <Feature>sLoaded copyWith({
    List<<Feature>>? <feature>s,
    bool? hasReachedMax,
    int? currentPage,
  }) {
    return <Feature>sLoaded(
      <feature>s: <feature>s ?? this.<feature>s,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      currentPage: currentPage ?? this.currentPage,
    );
  }

  @override
  List<Object?> get props => [<feature>s, hasReachedMax, currentPage];
}

// ─── Detail Loaded ────────────────────────────────────────────────────────────

class <Feature>DetailLoaded extends <Feature>State {
  final <Feature> <feature>;

  const <Feature>DetailLoaded(this.<feature>);

  @override
  List<Object?> get props => [<feature>];
}

// ─── Action Success ───────────────────────────────────────────────────────────

class <Feature>ActionSuccess extends <Feature>State {
  final String message;
  final <Feature>? <feature>;   // nullable: destroy tidak mengembalikan data

  const <Feature>ActionSuccess(this.message, {this.<feature>});

  @override
  List<Object?> get props => [message, <feature>];
}

// ─── Failure ──────────────────────────────────────────────────────────────────

class <Feature>Failure extends <Feature>State {
  final Failure failure;

  const <Feature>Failure(this.failure);

  @override
  List<Object?> get props => [failure];
}
```

---

## Aturan Penamaan

| State | Pola Nama |
|-------|-----------|
| Base | `<Feature>State` |
| Initial | `<Feature>Initial` |
| Loading | `<Feature>Loading` |
| List loaded | `<Feature>sLoaded` (plural + "Loaded") |
| Detail loaded | `<Feature>DetailLoaded` |
| Action success | `<Feature>ActionSuccess` |
| Failure | `<Feature>Failure` |

Contoh untuk `Category`:
- `CategoryState`, `CategoryInitial`, `CategoryLoading`
- `CategoriesLoaded` (plural: Categories)
- `CategoryDetailLoaded`, `CategoryActionSuccess`, `CategoryFailure`

---

## Aturan Props (Equatable)

| State | Props |
|-------|-------|
| `Initial`, `Loading` | `[]` (kosong, bisa diomit — sudah inherit dari base) |
| `<Feature>sLoaded` | `[list, hasReachedMax, currentPage]` |
| `<Feature>DetailLoaded` | `[entity]` |
| `<Feature>ActionSuccess` | `[message, entity]` |
| `<Feature>Failure` | `[failure]` |

---

## Variasi: State Tanpa Pagination

Untuk feature yang tidak membutuhkan pagination (data sedikit, misal settings):

```dart
class <Feature>sLoaded extends <Feature>State {
  final List<<Feature>> <feature>s;

  const <Feature>sLoaded(this.<feature>s);

  @override
  List<Object?> get props => [<feature>s];
}
```

## Variasi: State dengan Metadata Tambahan

Jika UI membutuhkan informasi tambahan:

```dart
class OrdersLoaded extends OrderState {
  final List<Order> orders;
  final bool hasReachedMax;
  final int currentPage;
  final double totalAmount;   // metadata tambahan

  const OrdersLoaded({
    required this.orders,
    required this.totalAmount,
    this.hasReachedMax = false,
    this.currentPage = 1,
  });

  @override
  List<Object?> get props => [orders, hasReachedMax, currentPage, totalAmount];
}
```

---

## Penggunaan di UI (Pattern Matching)

```dart
BlocBuilder<<Feature>Cubit, <Feature>State>(
  builder: (context, state) {
    return switch (state) {
      <Feature>Initial() => const SizedBox.shrink(),
      <Feature>Loading() => const CircularProgressIndicator(),
      <Feature>sLoaded(:<feature>s) => ListView(...),
      <Feature>DetailLoaded(:<feature>) => DetailWidget(<feature>),
      <Feature>ActionSuccess(:message) => SuccessWidget(message),
      <Feature>Failure(:failure) => ErrorWidget(failure.message),
    };
  },
)
```

---

## Contoh Nyata

- `apps/cashier/lib/features/category/presentation/bloc/category_state.dart`
- `apps/cashier/lib/features/customer_subscription/presentation/bloc/customer_subscription_state.dart`
