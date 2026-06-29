# Fitur Accept, Reject & Weight Order — Cashier App

## Latar Belakang & Alur

Backend sudah menyediakan 3 endpoint baru:
- `POST /orders/{id}/accept` → mengubah status `requested` → `accepted`
- `POST /orders/{id}/reject` → mengubah status `requested` → `cancelled`
- `POST /orders/{id}/weigh` → mengisi quantity per item & menghitung harga, mengubah status → `priced`

### Alur yang Disepakati

```
[IndexOrdersScreen]
       │
       ▼ (tap order berstatus requested)
[ShowOrderScreen]
       │
       ├──[Tolak]──► Bottom sheet alasan (opsional) ──► reject() ──► cancelled
       │
       └──[Terima]──► Konfirmasi dialog ──► accept() ──► accepted
                             │
                             ▼
                  Status berubah jadi "accepted".
                  Pesanan dikirim ke produksi untuk dijemput.
                  Kasir TIDAK langsung ke WeighScreen.
                             │
                     (setelah barang dijemput produksi)
                             │
                             ▼
                  ShowOrderScreen (status: accepted)
                  Tombol "Timbang" muncul
                             │
                             ▼
                  [WeighOrderScreen]
                  - List order items (nama layanan)
                  - Input field "Quantity" per item (numerik/kg)
                  - Preview subtotal per item (unit_price × quantity)
                  - Input catatan (opsional)
                  - Tombol "Simpan & Hitung Harga"
                             │
                             ▼
                  weigh() ──► status: priced
                  Kembali ke ShowOrderScreen (refresh)
```

### Pertimbangan Desain

| Keputusan | Keputusan Final | Catatan |
|---|---|---|
| Accept: langsung atau konfirmasi? | **Konfirmasi dialog** | Mencegah tap tidak sengaja |
| Reject: alasan wajib? | **Opsional** | Backend mendukung tanpa alasan |
| WeighScreen: navigasi atau modal? | **Screen terpisah (push)** | Form lebih panjang, UX lebih nyaman |
| WeighScreen: kapan bisa diakses? | **Status = `accepted` saja** | Setelah produksi menjemput barang |
| Discount/Tax di WeighScreen? | **Tidak ada** | Tidak diperlukan saat ini |
| Status filter di index? | **Tambahkan `Diajukan` (requested)** | Agar kasir mudah lihat pesanan masuk |

---

## Proposed Changes

### Layer 1 — Domain

#### [MODIFY] [order_repository.dart](file:///c:/Bimo/Project/wash_wallet/apps/cashier/lib/features/order/domain/repositories/order_repository.dart)
Tambahkan 3 method baru:
```dart
Future<Result<Order>> accept(int id);
Future<Result<Order>> reject(int id, {String? reason});
Future<Result<Order>> weigh(int id, Map<String, dynamic> data);
```

---

#### [MODIFY] [accept_usecase.dart](file:///c:/Bimo/Project/wash_wallet/apps/cashier/lib/features/order/domain/usecases/accept_usecase.dart)
File masih kosong — isi lengkap:
```dart
class AcceptUsecase {
  final OrderRepository _repository;
  AcceptUsecase(this._repository);
  Future<Result<Order>> call(int orderId) async {
    return await _repository.accept(orderId);
  }
}
```

---

#### [MODIFY] [reject_usecase.dart](file:///c:/Bimo/Project/wash_wallet/apps/cashier/lib/features/order/domain/usecases/reject_usecase.dart)
File masih kosong — isi lengkap:
```dart
class RejectParams {
  final int orderId;
  final String? reason;
  RejectParams({required this.orderId, this.reason});
}

class RejectUsecase {
  final OrderRepository _repository;
  RejectUsecase(this._repository);
  Future<Result<Order>> call(RejectParams params) async {
    return await _repository.reject(params.orderId, reason: params.reason);
  }
}
```

---

#### [MODIFY] [weigh_usecase.dart](file:///c:/Bimo/Project/wash_wallet/apps/cashier/lib/features/order/domain/usecases/weigh_usecase.dart)
File masih kosong — isi lengkap:
```dart
class WeighItemData {
  final double quantity;
  final String? itemNotes;
  WeighItemData({required this.quantity, this.itemNotes});
  Map<String, dynamic> toMap() => {'quantity': quantity, 'itemNotes': itemNotes};
}

class WeighParams {
  final int orderId;
  final int employeeId;
  final List<WeighItemData> orderItems;
  final String? notes;
  final String? internalNotes;
  // ...toMap()
}

class WeighUsecase {
  final OrderRepository _repository;
  WeighUsecase(this._repository);
  Future<Result<Order>> call(WeighParams params) async {
    return await _repository.weigh(params.orderId, params.toMap());
  }
}
```

---

### Layer 2 — Data

#### [MODIFY] [order_remote_datasource.dart](file:///c:/Bimo/Project/wash_wallet/apps/cashier/lib/features/order/data/datasources/order_remote_datasource.dart)
Tambahkan ke abstract class dan impl:
```dart
Future<OrderModel> accept(int id);
Future<OrderModel> reject(int id, {String? reason});
Future<OrderModel> weigh(int id, Map<String, dynamic> data);
```
Implementasi memanggil:
- `POST ${_endpoints.orders}/$id/accept`
- `POST ${_endpoints.orders}/$id/reject`
- `POST ${_endpoints.orders}/$id/weigh`

---

#### [MODIFY] [order_repository_impl.dart](file:///c:/Bimo/Project/wash_wallet/apps/cashier/lib/features/order/data/repositories/order_repository_impl.dart)
Override 3 method baru, lakukan mapping ke `Result<Order>` seperti method `complete()`.

---

### Layer 3 — Presentation

#### [MODIFY] [order_cubit.dart](file:///c:/Bimo/Project/wash_wallet/apps/cashier/lib/features/order/presentation/bloc/order_cubit.dart)
Tambahkan field + method baru:
```dart
final AcceptUsecase _acceptUsecase;
final RejectUsecase _rejectUsecase;
final WeighUsecase _weighUsecase;

Future<void> accept(int orderId) async { ... }
Future<void> reject(RejectParams params) async { ... }
Future<void> weigh(WeighParams params) async { ... }
```

---

#### [MODIFY] [order_provider.dart](file:///c:/Bimo/Project/wash_wallet/apps/cashier/lib/features/order/presentation/providers/order_provider.dart)
Daftarkan 3 usecase baru dan inject ke `OrderCubit`.

---

#### [NEW] [weigh_order_screen.dart](file:///c:/Bimo/Project/wash_wallet/apps/cashier/lib/features/order/presentation/screens/weigh_order_screen.dart)
Screen input penimbangan:
- Menerima `Order` sebagai parameter
- `ListView` berisi setiap `OrderItem` dengan:
  - Nama layanan (dari `orderItem.laundryService.name`)
  - Harga satuan (dari `orderItem.unitPrice` / `laundryService.price`)
  - `TextFormField` input `quantity` (numerik/kg)
  - Subtotal dinamis (unit_price × quantity, update real-time)
- Total keseluruhan di bagian bawah (sum semua subtotal)
- Input `notes` (opsional)
- **Tidak ada input discount/tax**
- Tombol **"Simpan & Hitung Harga"** → panggil `cubit.weigh()`
- Setelah `OrderActionSuccess` → pop dan kembali ke `ShowOrderScreen` (yang akan refresh otomatis)

---

#### [MODIFY] [show_order_screen.dart](file:///c:/Bimo/Project/wash_wallet/apps/cashier/lib/features/order/presentation/screens/show_order_screen.dart)
Tambahkan:
- Handler `_handleAcceptOrder()` → dialog konfirmasi → `cubit.accept()` → refresh halaman (tetap di ShowOrderScreen)
- Handler `_handleRejectOrder()` → bottom sheet input alasan (opsional) → `cubit.reject()`
- Handler `_handleWeighOrder()` → navigate ke `WeighOrderScreen`, setelah kembali refresh detail

---

#### [MODIFY] [order_action_buttons.dart](file:///c:/Bimo/Project/wash_wallet/apps/cashier/lib/features/order/presentation/widgets/order_detail/order_action_buttons.dart)
Tambahkan prop baru yang kondisional:
```dart
final bool showAcceptRejectButtons; // true jika status = requested
final VoidCallback? onAcceptOrder;
final VoidCallback? onRejectOrder;
final bool showWeighButton;          // true jika status = accepted
final VoidCallback? onWeighOrder;
```
Tombol muncul di atas tombol "Selesaikan Pesanan" sesuai status.

---

#### [MODIFY] [index_orders_screen.dart](file:///c:/Bimo/Project/wash_wallet/apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart)
Tambahkan `'Diajukan' → 'requested'` ke daftar `_statusFilters` agar kasir bisa filter pesanan masuk.

---

## Status Flow Visual

```
requested
   │
   ├── accept() ──► accepted  (produksi menjemput)
   │                  │
   │               weigh()  ──► priced ──► (processing, completed, dll)
   │
   └── reject() ──► cancelled
```

> [!IMPORTANT]
> Tombol **Terima** dan **Tolak** hanya ditampilkan jika `order.status == 'requested'`.
> Tombol **Timbang** hanya ditampilkan jika `order.status == 'accepted'`.
> Tombol **Selesaikan** tetap ditampilkan seperti sebelumnya (status pending/processing).
> **Tidak ada auto-navigate** setelah accept — kasir kembali ke ShowOrderScreen dan menunggu produksi menjemput.

---

## Keputusan yang Sudah Disepakati

> [!NOTE]
> - Setelah accept, kasir **tidak** diarahkan ke WeighScreen — pesanan dikirim ke produksi untuk dijemput lebih dulu.
> - Tombol "Timbang" baru muncul di ShowOrderScreen setelah status berubah jadi `accepted`.
> - Alasan reject **opsional**.
> - WeighScreen **tidak** memiliki input discount/tax.

---

## Verification Plan

### Automated
- Pastikan `flutter analyze` clean setelah semua perubahan
- Pastikan tidak ada `missing_required_param` atau `undefined_identifier`

### Manual (Device/Emulator)
1. Login sebagai kasir → Buka pesanan berstatus `requested`
2. Tap **"Terima"** → konfirmasi dialog muncul → confirm → status berubah jadi `accepted`
3. Navigasi ke `WeighOrderScreen` → isi quantity setiap item → tap simpan
4. Status order berubah jadi `priced`, kembali ke `ShowOrderScreen`, harga tampil benar
5. Ulangi alur reject → bottom sheet alasan muncul → confirm → status jadi `cancelled`
6. Di `IndexOrdersScreen`, filter `Diajukan` menampilkan pesanan status `requested`
