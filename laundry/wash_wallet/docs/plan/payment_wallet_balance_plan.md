# Implementation Plan: Logika Pembayaran Order & Owner Wallet Balance

> Berdasarkan: `docs/user_need/payment_wallet_balance_user_need.md`  
> Scope: Customer App (`apps/customer`) + Domain Package (`packages/wash_wallet_domain`)

---

## ⚠️ Instruksi Wajib untuk AI Model

Sebelum menulis kode apapun, **selalu baca** spec berikut:

- `docs/spec/cubit_spec.md` — pola Cubit & `result.when()`
- `docs/spec/state_spec.md` — pola State & sealed class
- `docs/spec/usecase_spec.md` — pola Usecase & Params class
- `docs/spec/repository_spec.md` — pola Repository interface
- `docs/spec/repository_impl_spec.md` — pola RepositoryImpl
- `docs/spec/remote_datasource_spec.md` — pola RemoteDatasource

**Aturan ketat yang tidak boleh dilanggar:**

1. **Gunakan `context.colors.*`** — jangan hardcode warna (`Color(0xFF...)` atau `Colors.red`)
2. **Gunakan `context.typography.*`** — jangan hardcode `TextStyle`
3. **Gunakan `context.space.*`** — jangan hardcode angka spacing
4. **Gunakan `context.radius.*`** — jangan hardcode `BorderRadius`
5. **Gunakan shared UI components** dari `wash_wallet_ui` — `AppCard`, `AppButton`, `AppLoadingIndicator`, `AppSnackbar`, `AppHeader`, `AppLayout`, dll.
6. **Pecah widget besar** menjadi widget-widget kecil di folder `widgets/`
7. **Tidak ada comment** — tulis clean code yang self-explanatory
8. **Gunakan `result.when()`** — jangan `fold()` atau `if (result is Success)`
9. **Gunakan named parameters** di constructor Cubit
10. **Satu file per usecase** — ikuti konvensi penamaan spec

---

## Ringkasan Perubahan

| Area | Perubahan |
|------|-----------|
| `PaymentMethodSelectorWidget` | Tambah opsi `wallet_balance` dengan label "Saldo Wallet" |
| `OrderInvoiceScreen` | Redesign untuk mendukung 3 metode pembayaran, bukan hanya wallet |
| `OrderState` | Tambah `midtransPaymentUrl` untuk redirect Midtrans |
| `OrderCubit.payOrder` | Kirim `paymentMethod` ke backend |
| `PayOrderUseCase` | Ubah untuk menerima `paymentMethod` parameter |
| `OrderRepository` | Update signature method `pay` |
| `OrderRepositoryImpl` | Update implementasi |
| `OrderRemoteDatasource` | Update method `pay` dengan payload |
| Baru: `WalletBalanceSummaryWidget` | Widget saldo customer dengan status cukup/tidak |
| Baru: `PaymentMethodOptionWidget` | Widget pilihan metode pembayaran satu opsi |
| Baru: `InvoiceDetailCard` | Widget kartu detail tagihan |
| Baru: `InvoiceAmountRow` | Widget baris nominal |
| Baru: `PaymentConfirmSheet` | Bottom sheet konfirmasi pembayaran |

---

## Fase 1 — Domain Layer

### 1.1 Update `PayOrderUseCase`

**File:** `apps/customer/lib/features/order/domain/usecases/pay_order_usecase.dart`

Ubah signature agar menerima `paymentMethod`:

```dart
class PayOrderParams {
  final int orderId;
  final String paymentMethod;

  PayOrderParams({required this.orderId, required this.paymentMethod});
}

class PayOrderUseCase {
  final OrderRepository repository;

  PayOrderUseCase(this.repository);

  Future<Result<Order>> call(PayOrderParams params) {
    return repository.pay(
      orderId: params.orderId,
      paymentMethod: params.paymentMethod,
    );
  }
}
```

### 1.2 Update `OrderRepository` (domain interface)

**File:** `apps/customer/lib/features/order/domain/repositories/order_repository.dart`

Tambah parameter `paymentMethod` pada method `pay`:

```dart
Future<Result<Order>> pay({
  required int orderId,
  required String paymentMethod,
});
```

---

## Fase 2 — Data Layer

### 2.1 Update `OrderRemoteDatasource`

**File:** `apps/customer/lib/features/order/data/datasources/order_remote_datasource.dart`

- Interface: ubah `pay(int orderId)` → `pay(int orderId, Map<String, dynamic> payload)`
- Impl: kirim `payload` sebagai body POST

```dart
// Abstract
Future<OrderModel> pay(int orderId, Map<String, dynamic> payload);

// Impl
Future<OrderModel> pay(int orderId, Map<String, dynamic> payload) async {
  try {
    final response = await _dio.post(
      _endpoints.orderPay(orderId),
      data: payload,
    );
    final body = _validateResponse(response);
    return OrderModel.fromJson(body['data']);
  } catch (e) {
    throw _handleError(e);
  }
}
```

### 2.2 Update `OrderRepositoryImpl`

**File:** `apps/customer/lib/features/order/data/repositories/order_repository_impl.dart`

```dart
@override
Future<Result<Order>> pay({
  required int orderId,
  required String paymentMethod,
}) async {
  try {
    final model = await _remoteDatasource.pay(
      orderId,
      {'payment_method': paymentMethod},
    );
    return Result.success(model.toEntity());
  } on ApiException catch (e) {
    return Result.failure(ServerFailure(message: e.message));
  } catch (e) {
    return Result.failure(ServerFailure(message: e.toString()));
  }
}
```

---

## Fase 3 — Presentation Layer: State & Cubit

### 3.1 Update `OrderState`

**File:** `apps/customer/lib/features/order/presentation/bloc/order_state.dart`

Tambah field baru:

```dart
final String? midtransPaymentUrl;  // untuk redirect Transfer
```

Tambah di `copyWith`, constructor, dan `props`.

> Default `paymentMethod` diubah dari `'cod'` menjadi tetap `'cod'` (sudah sesuai).

### 3.2 Update `OrderCubit`

**File:** `apps/customer/lib/features/order/presentation/bloc/order_cubit.dart`

Ubah `payOrder` untuk menyertakan `paymentMethod` dari state:

```dart
Future<void> payOrder(int orderId) async {
  emit(state.copyWith(isPayingOrder: true, errorMessage: null));

  final result = await _payOrderUseCase(
    PayOrderParams(
      orderId: orderId,
      paymentMethod: state.paymentMethod,
    ),
  );

  result.when(
    success: (updatedOrder) {
      final updatedOrders = state.orders
          .map((o) => o.id == updatedOrder.id ? updatedOrder : o)
          .toList();

      emit(
        state.copyWith(
          isPayingOrder: false,
          orders: updatedOrders,
          selectedOrder: updatedOrder,
          paymentSuccess: state.paymentMethod != 'transfer',
          midtransPaymentUrl: updatedOrder.qrUrl,
        ),
      );
    },
    failure: (failure) {
      emit(state.copyWith(isPayingOrder: false, errorMessage: failure.message));
    },
  );
}
```

---

## Fase 4 — Presentation Layer: Widgets Baru

Semua widget baru diletakkan di:
`apps/customer/lib/features/order/presentation/widgets/`

### 4.1 `payment_method_option_widget.dart`

Widget satu pilihan metode pembayaran (reusable untuk setiap opsi).

**Props:** `title`, `subtitle`, `icon`, `isSelected`, `onTap`

```
[Icon]  Saldo Wallet        ← title
        Bayar dari saldo    ← subtitle (opsional)
                        [✓] ← selected indicator
```

### 4.2 `payment_method_selector_widget.dart` *(update)*

Ubah dari 2 opsi (COD + Transfer) menjadi 3 opsi:

```
[💳] Bayar di Kasir        (COD)
[🏦] Transfer Online       (transfer)
[👛] Saldo Wallet          (wallet_balance)
```

Gunakan `PaymentMethodOptionWidget` untuk setiap opsi.  
Tampilkan info saldo customer di bawah opsi `wallet_balance` jika opsi tersebut dipilih.

### 4.3 `wallet_balance_summary_widget.dart`

Widget yang menampilkan saldo customer dan status kecukupan.

**Props:** `balance`, `totalAmount`, `formatter`

```
┌─────────────────────────────────┐
│ 👛 Saldo Anda         Rp 50.000 │
│    Tagihan            Rp 30.000 │  ← Warna: colors.success (cukup)
│                      ✓ Cukup   │     atau colors.error (kurang)
└─────────────────────────────────┘
```

- Gunakan `colors.successSurface` / `colors.errorSurface` sebagai background
- Gunakan `colors.success` / `colors.error` untuk teks status

### 4.4 `invoice_detail_card.dart`

Widget kartu detail tagihan (item list + breakdown harga).

**Props:** `order`

Pisahkan dari `OrderInvoiceScreen` agar layar tetap ringkas.  
Gunakan `AppCard` sebagai container.

### 4.5 `invoice_amount_row.dart`

Widget baris label + nominal yang reusable.

**Props:** `label`, `amount`, `formatter`, `color` (opsional), `isBold` (opsional)

### 4.6 `payment_confirm_sheet.dart`

Bottom sheet konfirmasi sebelum bayar. Menggantikan `AlertDialog` yang ada saat ini.

**Props:** `paymentMethod`, `totalAmount`, `balance`, `formatter`, `onConfirm`

Konten berdasarkan metode:
- **wallet_balance**: "Saldo Anda akan dipotong sebesar Rp X"
- **transfer**: "Anda akan diarahkan ke halaman pembayaran Midtrans"
- **cod**: "Pesanan akan dicatat sebagai pembayaran di kasir"

Gunakan `showModalBottomSheet` dengan `AppButton.primary` sebagai tombol konfirmasi.

---

## Fase 5 — Presentation Layer: Screen Update

### 5.1 Redesign `OrderInvoiceScreen`

**File:** `apps/customer/lib/features/order/presentation/screens/order_invoice_screen.dart`

Struktur baru layar:

```
AppLayout
  └── SingleChildScrollView
        ├── InvoiceDetailCard(order: order)       ← Fase 4.4
        ├── SizedBox(height: space.lg)
        ├── PaymentMethodSelectorWidget()          ← Fase 4.2 (updated)
        ├── SizedBox(height: space.md)
        ├── [if wallet_balance] WalletBalanceSummaryWidget(...)  ← Fase 4.3
        └── SizedBox(height: space.xxl)
  └── BottomActionBar
        └── AppButton.primary('Bayar Sekarang')
```

**Logika tombol bayar:**
- `wallet_balance` + saldo tidak cukup → disabled + tampilkan tombol Topup
- `wallet_balance` + saldo cukup → aktif
- `transfer` → selalu aktif (backend yang validasi)
- `cod` → tidak tampil di invoice screen (langsung ke kasir)

**Listener:**
- `state.paymentSuccess == true` → snackbar sukses → navigate ke schedule delivery
- `state.midtransPaymentUrl != null` → navigate ke WebView Midtrans
- `state.errorMessage != null` → snackbar error

---

## Fase 6 — Widget: `PaymentMethodSelectorWidget` Update Detail

**File:** `apps/customer/lib/features/order/presentation/widgets/payment_method_selector_widget.dart`

Ubah dari `Row` ke `Column` (3 opsi vertikal):

```dart
Column(
  children: [
    PaymentMethodOptionWidget(
      title: 'Bayar di Kasir',
      subtitle: 'Bayar langsung saat mengambil pesanan',
      icon: Icons.point_of_sale,
      isSelected: state.paymentMethod == 'cod',
      onTap: () => context.read<OrderCubit>().selectPaymentMethod('cod'),
    ),
    SizedBox(height: context.space.sm),
    PaymentMethodOptionWidget(
      title: 'Transfer Online',
      subtitle: 'Bayar via Midtrans',
      icon: Icons.account_balance,
      isSelected: state.paymentMethod == 'transfer',
      onTap: () => context.read<OrderCubit>().selectPaymentMethod('transfer'),
    ),
    SizedBox(height: context.space.sm),
    PaymentMethodOptionWidget(
      title: 'Saldo Wallet',
      subtitle: 'Bayar menggunakan saldo deposit Anda',
      icon: Icons.account_balance_wallet,
      isSelected: state.paymentMethod == 'wallet_balance',
      onTap: () => context.read<OrderCubit>().selectPaymentMethod('wallet_balance'),
    ),
  ],
)
```

---

## Fase 7 — Order Summary Screen (Saat Membuat Order)

**File:** `apps/customer/lib/features/order/presentation/screens/order_summary_screen.dart`

Pastikan `PaymentMethodSelectorWidget` yang sudah diupdate digunakan di sini.  
Tidak ada perubahan logika lain — pilihan metode pembayaran disimpan di state dan dikirim saat order dibuat.

---

## Urutan Implementasi

```
1. PayOrderParams + PayOrderUseCase       (Domain)
2. OrderRepository interface              (Domain)
3. OrderRemoteDatasource                 (Data)
4. OrderRepositoryImpl                   (Data)
5. OrderState + copyWith                 (Presentation)
6. OrderCubit.payOrder                   (Presentation)
7. InvoiceAmountRow widget               (Widget kecil dulu)
8. InvoiceDetailCard widget              (Widget)
9. WalletBalanceSummaryWidget            (Widget)
10. PaymentMethodOptionWidget            (Widget)
11. PaymentMethodSelectorWidget update   (Widget)
12. PaymentConfirmSheet                  (Widget)
13. OrderInvoiceScreen redesign          (Screen)
```

---

## Catatan Ruang Lingkup

- Implementasi **backend, webhook Midtrans, dan owner wallet balance** berada di luar scope plan ini — itu di sisi API/backend.
- Plan ini fokus pada **mobile customer app** untuk mendukung 3 metode pembayaran.
- Fitur **WebView Midtrans** (navigate ke `qrUrl`) tidak diimplementasikan dalam plan ini — hanya state `midtransPaymentUrl` yang disiapkan.
- **Owner dashboard** untuk menampilkan wallet balance tidak termasuk dalam scope plan ini.
- Refund dan partial payment **tidak termasuk** dalam scope ini sesuai user need.
