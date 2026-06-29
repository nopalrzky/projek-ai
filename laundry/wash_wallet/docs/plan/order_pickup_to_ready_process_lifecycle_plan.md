# Plan: Alur Status Order Pickup — Accepted sampai Ready To Process

Tanggal: 2026-06-10  
Referensi user need: `docs/user_need/order_pickup_to_ready_process_lifecycle_user_need.md`

---

## 1. Ringkasan Perubahan

Plan ini menyelaraskan tiga aplikasi (customer, cashier, production) terhadap alur status order pickup:

```
requested
  → cashier accept
accepted / "Siap Dijemput"
  → kurir mulai pickup
picking_up / "Dalam Perjalanan"
  → kurir confirm pickup (cucian sudah diambil dari customer)
  [STATUS BARU] picked_up / "Sudah Diambil"
  → kurir confirm arrived at outlet (cucian sudah sampai outlet)
received / "Di Outlet"
  → cashier timbang
ready_to_process / "Siap Dikerjakan"
  → production mulai kerja
in_progress / "Sedang Dikerjakan"
```

### Mengapa Status Baru `picked_up` Diperlukan

Berdasarkan user need bagian 13 poin 3 (jawaban stakeholder):

> "confirm pickup berarti cucian diambil, kalo udah sampai outlet baru status berubah, jadi butuh status tambahan untuk menandakan cucian sudah sampai outlet"

Artinya:
- `confirmPickup` yang ada sekarang → semantiknya berubah: hanya berarti **kurir sudah mengambil cucian dari customer** → status menjadi `picked_up`
- Diperlukan aksi baru `confirmArrived` → kurir konfirmasi **sudah sampai outlet** → status berubah menjadi `received`

Status teknis `picked_up` adalah status **baru** yang perlu ditambahkan ke backend dan didaftarkan di semua layer Flutter.

---

## 2. Analisis Kondisi Awal Codebase

### 2.1 Status Yang Sudah Ada

Backend sudah memiliki konstanta:
- `accepted`, `picking_up`, `received`, `ready_to_process`, `in_progress`

Status `picked_up` **belum ada** dan perlu ditambahkan.

### 2.2 Alur Pickup Saat Ini (Yang Bermasalah)

```
accepted
  → pickup()         → picking_up
  → confirmPickup()  → received   ← LANGSUNG ke received, tanpa tahap "sudah diambil"
```

Setelah plan ini diimplementasikan:

```
accepted
  → pickup()           → picking_up
  → confirmPickup()    → picked_up    ← baru diambil dari customer
  → confirmArrived()   → received     ← sudah sampai outlet
```

### 2.3 Kondisi Label di `OrderStatusBadge`

File: `packages/wash_wallet_ui/lib/src/components/badge/order_status_badge.dart`

- `accepted` → label saat ini: **"Diterima"**
- `picking_up` → label saat ini: **"Sedang Dijemput"**
- `received` → label saat ini: **"Di Outlet"** ✓ (sudah benar)
- `ready_to_process` → label saat ini: **"Siap Dikerjakan"** ✓ (sudah benar)
- Status `picked_up` → **belum ada**, perlu ditambahkan

Label `accepted` di cashier diputuskan **tetap "Diterima"** (sesuai jawaban pertanyaan terbuka no. 1 di user need). Di konteks kurir (pickup schedule), label kontekstual "Siap Dijemput" sudah ditampilkan secara hardcode di UI tab (`Tab(text: 'Siap Dijemput')`), bukan dari badge.

### 2.4 Kondisi Cashier App

File: `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`

Filter status yang ada:
- `Diajukan` → `requested`
- `Di outlet` → `received` ✓ (sudah ada)
- `Siap Dikerjakan` → `ready_to_process` ✓ (sudah ada)

**Gap**: Tidak ada filter untuk `accepted` dan `picking_up`. Ini perlu ditambahkan agar cashier bisa melihat perkembangan order.

File: `apps/cashier/lib/features/order/presentation/screens/show_order_screen.dart`

- Tombol **Accept** tersedia saat `status == 'requested'` ✓
- Tombol **Timbang** tersedia saat `status == 'received'` ✓
- Dialog accept masih menyebut: *"diteruskan ke produksi untuk dijemput"* — teks ini perlu diperbarui agar tidak menyesatkan.

### 2.5 Kondisi Production App — Pickup Schedule

File: `apps/production/lib/features/order/presentation/screens/pickup_schedule_screen.dart`

- Tab **"Siap Dijemput"** → fetch status `accepted` ✓
- Tab **"Dalam Perjalanan"** → fetch status `picking_up` ✓

**Gap kritis**: Tab "Dalam Perjalanan" saat ini hanya menampilkan `picking_up`. Setelah ditambahkan `picked_up`, perlu juga menampilkan `picked_up` di tab ini (karena kurir masih dalam perjalanan menuju outlet).

File: `apps/production/lib/features/order/presentation/screens/pickup_order_detail_screen.dart`

Saat ini hanya ada satu tombol: **"Konfirmasi Penjemputan"** → langsung panggil `confirmPickup()`.

Setelah plan diimplementasikan:
- Jika status `picking_up`: tombol **"Konfirmasi Pengambilan"** (kurir sudah ambil dari customer) → memanggil `confirmPickup()` → status jadi `picked_up`
- Jika status `picked_up`: tombol **"Konfirmasi Tiba di Outlet"** → memanggil `confirmArrived()` → status jadi `received`

### 2.6 Kondisi Production App — Order Queue (Production Worker)

File: `apps/production/lib/features/order/presentation/screens/index_order_screen.dart`

- Tab **"Siap Dikerjakan"** → fetch `ready_to_process` ✓ (sudah benar)
- Tab **"Sedang Dikerjakan"** → fetch `in_progress` ✓ (sudah benar)

**Tidak ada perubahan diperlukan** di tab produksi. Status `accepted`, `picking_up`, `picked_up`, dan `received` tidak boleh masuk ke sini.

### 2.7 Kondisi Customer App

File: `apps/customer/lib/features/order/presentation/screens/index_order_screen.dart`

Tab yang ada: Semua, Menunggu (`requested`), Diproses (`in_progress`), Siap Ambil (`ready`), Selesai (`completed`), Dibatalkan (`cancelled`).

**Gap**: Status `accepted`, `picking_up`, `picked_up`, `received`, `ready_to_process` tidak memiliki tab filter tersendiri — semua jatuh ke tab "Semua". Ini boleh dibiarkan karena customer tidak perlu filter teknis, namun **label status di badge dan info card perlu disesuaikan**.

File: `apps/customer/lib/features/order/presentation/widgets/order_card.dart`

- Sudah menampilkan `OrderStatusBadge` yang menggunakan label dari `order_status_badge.dart`
- Sudah ada info box `not_yet_priced` untuk memberi tahu customer bahwa harga belum final ✓
- Perlu menambahkan info kontekstual untuk status `accepted`, `picking_up`, dan `picked_up` agar customer memahami tahap order

File: `apps/customer/lib/features/order/presentation/widgets/order_detail_pricing_summary_widget.dart`

- Sudah menampilkan `—` dan info box saat `paymentStatus == 'not_yet_priced'` ✓

### 2.8 Kondisi `PickupConfirmationScreen`

File: `apps/production/lib/features/order/presentation/screens/pickup_confirmation_screen.dart`

- Saat ini: satu screen yang meminta foto → memanggil `confirmPickup()`
- Setelah plan: screen ini perlu dibuat **dinamis** sesuai status order yang masuk:
  - Jika status `picking_up`: konfirmasi "cucian diambil" → foto wajib → `confirmPickup()` → `picked_up`
  - Jika status `picked_up`: konfirmasi "tiba di outlet" → foto **opsional** atau wajib (sesuai keputusan implementor) → `confirmArrived()` → `received`

---

## 3. Perubahan yang Diperlukan

### 3.1 Backend

> **Catatan untuk implementor**: Koordinasikan dengan tim backend untuk memastikan endpoint dan migrasi di bawah sudah siap sebelum frontend diimplementasikan.

#### 3.1.1 Tambah Status `picked_up`

- Tambahkan konstanta `STATUS_PICKED_UP = 'picked_up'` di backend
- Daftarkan transisi: `picking_up` → `picked_up` (trigger: kurir confirm ambil)
- Daftarkan transisi: `picked_up` → `received` (trigger: kurir confirm tiba outlet)
- Pastikan `ready_to_process` hanya bisa dicapai dari `received` (bukan dari `picked_up`)

#### 3.1.2 Endpoint Baru

Tambahkan endpoint aksi di backend:

```
POST /orders/{id}/confirm-arrived
```

- Input: opsional photo (multipart/form-data)
- Output: Order dengan status `received`
- Validasi: hanya bisa dipanggil jika status saat ini adalah `picked_up`

Endpoint yang sudah ada tetap berfungsi dengan semantik baru:

```
POST /orders/{id}/confirm-pickup
```

- Semantik lama: ambil cucian + sampai outlet → `received`
- Semantik baru: **hanya** ambil cucian dari customer → `picked_up`

#### 3.1.3 Label Backend

Pastikan backend mengembalikan `statusLabel` dan `statusBadgeVariant` yang sesuai untuk `picked_up`:
- `statusLabel`: `"Sudah Diambil"` atau label yang disepakati
- `statusBadgeVariant`: misalnya `"warning"` atau `"info"`

---

### 3.2 Shared Package: `wash_wallet_ui`

#### [MODIFY] `order_status_badge.dart`

File: `packages/wash_wallet_ui/lib/src/components/badge/order_status_badge.dart`

Tambahkan case untuk `picked_up`:

```dart
'picked_up' => (AppBadgeVariant.warning, 'Sudah Diambil', Icons.directions_bike_outlined),
```

Sesuaikan juga label `picking_up` agar lebih sesuai dengan "dalam perjalanan ke customer":
- `picking_up`: label tetap `'Sedang Dijemput'` atau bisa diubah menjadi `'Menuju Customer'` — sesuaikan dengan keputusan UX

---

### 3.3 Aplikasi Production (Courier & Production Worker)

#### 3.3.1 Domain Layer

**[MODIFY] `order_repository.dart`**

File: `apps/production/lib/features/order/domain/repositories/order_repository.dart`

Tambahkan method abstrak baru:

```dart
Future<Result<Order>> confirmArrived(int id, String? photoPath);
```

**[NEW] `confirm_arrived_usecase.dart`**

File: `apps/production/lib/features/order/domain/usecases/confirm_arrived_usecase.dart`

```dart
class ConfirmArrivedUsecase {
  final OrderRepository _repository;
  ConfirmArrivedUsecase(this._repository);

  Future<Result<Order>> call({required int id, String? photoPath}) async {
    return await _repository.confirmArrived(id, photoPath);
  }
}
```

#### 3.3.2 Data Layer

**[MODIFY] `order_remote_datasource.dart`**

File: `apps/production/lib/features/order/data/datasources/order_remote_datasource.dart`

Tambahkan method abstrak dan implementasi untuk `confirmArrived`:

```dart
// Di abstract class:
Future<OrderModel> confirmArrived(int id, String? photoPath);

// Di implementasi:
@override
Future<OrderModel> confirmArrived(int id, String? photoPath) async {
  try {
    FormData? formData;
    if (photoPath != null) {
      final fileName = photoPath.split('/').last;
      formData = FormData.fromMap({
        'photo': await MultipartFile.fromFile(photoPath, filename: fileName),
      });
    }

    final response = await _dio.post(
      '${_endpoints.orders}/$id/confirm-arrived',
      data: formData,
      options: formData != null
          ? Options(contentType: Headers.multipartFormDataContentType)
          : null,
    );

    _validateResponse(response);

    final data = _normalizeJsonData(
      response.data['data'] as Map<String, dynamic>,
    );

    return OrderModel.fromJson(data);
  } catch (e) {
    throw _handleError(e);
  }
}
```

**[MODIFY] `order_repository_impl.dart`**

File: `apps/production/lib/features/order/data/repositories/order_repository_impl.dart`

Tambahkan implementasi `confirmArrived` yang memanggil datasource.

#### 3.3.3 Presentation Layer — BLoC

**[MODIFY] `order_state.dart`**

File: `apps/production/lib/features/order/presentation/bloc/order_state.dart`

Tidak perlu state baru khusus untuk `confirmArrived` — cukup gunakan `OrderDetailLoaded` atau refresh `PickupScheduleLoaded` seperti pola yang sudah ada di `confirmPickup`.

**[MODIFY] `order_cubit.dart`**

File: `apps/production/lib/features/order/presentation/bloc/order_cubit.dart`

- Tambahkan dependency `ConfirmArrivedUsecase`
- Tambahkan method `confirmArrived(int orderId, String? photoPath)`:

```dart
Future<void> confirmArrived(int orderId, String? photoPath) async {
  emit(const OrderLoading());
  final result = await _confirmArrivedUsecase(
    id: orderId,
    photoPath: photoPath,
  );

  result.when(
    success: (order) {
      if (state is PickupScheduleLoaded) {
        final currentState = state as PickupScheduleLoaded;
        getPickupSchedule(
          outletIds: currentState.outletIds,
          date: currentState.selectedDate,
          fetchAccepted: false,
          fetchInProgress: true,
        );
      } else {
        emit(OrderDetailLoaded(order: order));
      }
    },
    failure: (failure) => emit(OrderError(failure.message)),
  );
}
```

Sesuaikan juga konstruktor dan injeksi dependency di `order_cubit.dart`.

#### 3.3.4 Presentation Layer — Providers

**[MODIFY] `order_providers.dart`** (atau file provider yang relevan)

File: `apps/production/lib/features/order/presentation/providers/`

Daftarkan `ConfirmArrivedUsecase` dan inject ke `OrderCubit`.

#### 3.3.5 Presentation Layer — Pickup Schedule Screen

**[MODIFY] `pickup_schedule_screen.dart`**

File: `apps/production/lib/features/order/presentation/screens/pickup_schedule_screen.dart`

Perubahan pada logic fetch tab "Dalam Perjalanan":

```dart
// Sebelum: hanya fetch picking_up
// Sesudah: fetch picking_up DAN picked_up

// Saat ini di tab listener index == 1:
context.read<OrderCubit>().getPickupSchedule(
  outletIds: outletIds,
  date: _selectedDate,
  fetchAccepted: false,
  fetchInProgress: true,  // ini harus cover picking_up + picked_up
);
```

Opsi implementasi:
1. Backend mendukung multi-status filter `status=picking_up,picked_up` → implementor cek dukungan backend
2. Atau lakukan dua fetch terpisah di cubit dan merge hasilnya di state `inProgressOrders`
3. Atau tambahkan field baru di `getPickupSchedule` untuk `fetchPickedUp`

**Rekomendasi**: Tambahkan parameter `fetchPickedUp` di `getPickupSchedule` dan fetch dua request terpisah, kemudian merge hasilnya ke `inProgressOrders`. Ini konsisten dengan pola fetch yang sudah ada.

#### 3.3.6 Presentation Layer — PickupOrderDetailScreen

**[MODIFY] `pickup_order_detail_screen.dart`**

File: `apps/production/lib/features/order/presentation/screens/pickup_order_detail_screen.dart`

Ubah tombol "Konfirmasi Penjemputan" menjadi dinamis berdasarkan `order.status`:

```dart
Widget _buildConfirmButton(BuildContext context) {
  final status = order.status;

  if (status == 'picking_up') {
    return AppButton.primary(
      label: 'Konfirmasi Pengambilan',
      isFullWidth: true,
      icon: const Icon(Icons.check_circle_outline),
      onPressed: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => PickupConfirmationScreen(
              order: order,
              mode: PickupConfirmationMode.pickup,
            ),
          ),
        );
      },
    );
  }

  if (status == 'picked_up') {
    return AppButton.primary(
      label: 'Konfirmasi Tiba di Outlet',
      isFullWidth: true,
      icon: const Icon(Icons.store_outlined),
      onPressed: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => PickupConfirmationScreen(
              order: order,
              mode: PickupConfirmationMode.arrived,
            ),
          ),
        );
      },
    );
  }

  return const SizedBox.shrink();
}
```

#### 3.3.7 Presentation Layer — PickupConfirmationScreen

**[MODIFY] `pickup_confirmation_screen.dart`**

File: `apps/production/lib/features/order/presentation/screens/pickup_confirmation_screen.dart`

Tambahkan enum `PickupConfirmationMode` dan parameter mode:

```dart
enum PickupConfirmationMode { pickup, arrived }

class PickupConfirmationScreen extends StatefulWidget {
  final Order order;
  final PickupConfirmationMode mode;

  const PickupConfirmationScreen({
    super.key,
    required this.order,
    this.mode = PickupConfirmationMode.pickup,
  });
  // ...
}
```

Ubah logika `_confirmPickup()` menjadi:

```dart
void _confirm() {
  if (mode == PickupConfirmationMode.pickup && _image == null) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Silakan ambil foto bukti pengambilan')),
    );
    return;
  }

  if (mode == PickupConfirmationMode.pickup) {
    context.read<OrderCubit>().confirmPickup(widget.order.id, _image!.path);
  } else {
    // Arrived: foto opsional
    context.read<OrderCubit>().confirmArrived(
      widget.order.id,
      _image?.path,
    );
  }
}
```

Sesuaikan juga:
- Header title: `'Konfirmasi Pengambilan'` vs `'Konfirmasi Tiba di Outlet'`
- Label tombol aksi: sesuai mode
- Teks deskripsi foto: sesuai mode
- Listener sukses: sama-sama pop screen dan refresh

#### 3.3.8 Pickup Order Card

**[MODIFY] `pickup_order_card.dart`**

File: `apps/production/lib/features/order/presentation/widgets/pickup/pickup_order_card.dart`

Pastikan card dapat menampilkan order dengan status `picked_up` di tab "Dalam Perjalanan" dengan label yang benar.

---

### 3.4 Aplikasi Cashier

#### 3.4.1 Index Orders Screen — Filter Status

**[MODIFY] `index_orders_screen.dart`**

File: `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`

Tambahkan filter `accepted` dan `picking_up` dan `picked_up` agar cashier bisa memonitor:

```dart
final List<Map<String, String?>> _statusFilters = [
  {'label': 'Semua', 'value': null},
  {'label': 'Diajukan', 'value': 'requested'},
  {'label': 'Diterima', 'value': 'accepted'},          // TAMBAH
  {'label': 'Dalam Perjalanan', 'value': 'picking_up'}, // TAMBAH
  {'label': 'Sudah Diambil', 'value': 'picked_up'},     // TAMBAH (status baru)
  {'label': 'Di outlet', 'value': 'received'},
  {'label': 'Siap Dikerjakan', 'value': 'ready_to_process'},
  {'label': 'Diproses', 'value': 'in_progress'},
  {'label': 'Siap Ambil', 'value': 'ready'},
  {'label': 'Selesai', 'value': 'completed'},
];
```

#### 3.4.2 Show Order Screen — Dialog Accept

**[MODIFY] `show_order_screen.dart`**

File: `apps/cashier/lib/features/order/presentation/screens/show_order_screen.dart`

Perbarui teks dialog konfirmasi accept — saat ini:
> "Pesanan #xxx akan diterima dan diteruskan ke produksi untuk dijemput."

Ganti menjadi teks yang lebih akurat:
> "Pesanan #xxx akan diterima. Kurir akan menjemput cucian dari customer."

Tidak ada perubahan logic pada tombol accept/timbang karena sudah benar:
- `showAcceptRejectButtons: order.status == 'requested'` ✓
- `showWeighButton: order.status == 'received'` ✓

---

### 3.5 Aplikasi Customer

#### 3.5.1 OrderStatusBadge — Label Kontekstual Customer

Karena `OrderStatusBadge` di `wash_wallet_ui` adalah shared component, label yang ditampilkan ke customer harus berasal dari `statusLabel` yang dikembalikan backend (bukan hardcode di badge).

**Strategi**: Backend mengembalikan `statusLabel` yang sudah disesuaikan per konteks aplikasi (customer vs cashier vs production). Di sisi Flutter, `OrderStatusBadge` sudah menerima parameter `label` opsional:

```dart
OrderStatusBadge(
  status: order.status,
  label: order.statusLabel, // gunakan label dari backend jika tersedia
)
```

Pastikan semua tempat yang merender `OrderStatusBadge` di customer app sudah meneruskan `label: order.statusLabel`.

File-file yang perlu dicek dan diperbarui:
- `apps/customer/lib/features/order/presentation/widgets/order_card.dart` — baris: `OrderStatusBadge(status: order.status)` → ubah ke `OrderStatusBadge(status: order.status, label: order.statusLabel)`
- `apps/customer/lib/features/order/presentation/widgets/order_detail_header_widget.dart` — sama

> **Catatan untuk implementor**: Jika backend sudah mengembalikan `statusLabel` yang sesuai untuk customer (misal: `'accepted'` → `'Siap Dijemput'`, `'picking_up'` → `'Dalam Perjalanan'`, `'picked_up'` → `'Sudah Diambil'`, `'received'` → `'Cucian sudah sampai outlet'`), maka hanya perlu meneruskan `label: order.statusLabel` ke badge. Jika belum, koordinasikan dengan backend.

#### 3.5.2 Order Card — Info Box Kontekstual

**[MODIFY] `order_card.dart`**

File: `apps/customer/lib/features/order/presentation/widgets/order_card.dart`

Tambahkan info box kontekstual untuk status pickup di bawah pricing row. Saat ini sudah ada untuk `not_yet_priced` dan `pending_dropoff`. Tambahkan untuk:

```dart
// Setelah blok existing untuk not_yet_priced:
if (order.status == 'accepted' && order.pickupType == 'courier') ...[
  SizedBox(height: context.space.sm),
  _buildInfoBox(
    context,
    'Pesanan diterima. Kurir akan segera menjemput cucian Anda.',
    Icons.thumb_up_outlined,
    context.colors.info,
  ),
],
if (order.status == 'picking_up' && order.pickupType == 'courier') ...[
  SizedBox(height: context.space.sm),
  _buildInfoBox(
    context,
    'Kurir sedang dalam perjalanan menuju lokasi Anda.',
    Icons.delivery_dining_outlined,
    context.colors.warning,
  ),
],
if (order.status == 'picked_up' && order.pickupType == 'courier') ...[
  SizedBox(height: context.space.sm),
  _buildInfoBox(
    context,
    'Cucian sudah diambil. Kurir sedang menuju outlet.',
    Icons.directions_bike_outlined,
    context.colors.warning,
  ),
],
if (order.status == 'received' && order.pickupType == 'courier') ...[
  SizedBox(height: context.space.sm),
  _buildInfoBox(
    context,
    'Cucian sudah sampai outlet. Menunggu ditimbang.',
    Icons.store_outlined,
    context.colors.info,
  ),
],
```

Buat helper method `_buildInfoBox` jika belum ada (lihat pola existing di file yang sama).

#### 3.5.3 Order Detail — Info Kontekstual Pickup

**[MODIFY] `order_detail_info_widget.dart`** atau screen show_order_screen

File: `apps/customer/lib/features/order/presentation/widgets/order_detail_info_widget.dart`

Tambahkan section atau callout yang menjelaskan tahap pickup aktif saat status adalah `accepted`, `picking_up`, `picked_up`, atau `received`. Ini membantu customer memahami proses tanpa melihat status teknis.

---

## 4. Catatan Penting untuk Implementor

### 4.1 Urutan Implementasi yang Disarankan

1. **Backend** — tambah status `picked_up`, endpoint `confirm-arrived`, ubah semantik `confirm-pickup`
2. **`wash_wallet_ui`** — tambah case `picked_up` di `OrderStatusBadge`
3. **Production app — domain & data layer** — tambah `ConfirmArrivedUsecase`, repository method, datasource method
4. **Production app — presentation layer** — update cubit, screens, dan widgets
5. **Cashier app** — update filter dan teks dialog
6. **Customer app** — update info box dan teruskan `statusLabel`

### 4.2 Backward Compatibility

- Endpoint `confirm-pickup` lama berubah semantik: dari "selesai penjemputan → received" menjadi "cucian diambil dari customer → picked_up". Pastikan tidak ada client lain yang masih menggunakan semantik lama.
- Jika backend ingin menjaga backward compatibility, bisa menambahkan request body `action: 'pickup'` atau `action: 'arrived'` ke satu endpoint, tapi **lebih disarankan endpoint terpisah** untuk kejelasan.

### 4.3 Pola Injeksi Dependency

Lihat file provider yang ada di:
- `apps/production/lib/features/order/presentation/providers/`

untuk memahami cara mendaftarkan usecase baru ke dalam DI container dan inject ke `OrderCubit`.

### 4.4 Validasi Backend (Yang Tidak Boleh Dilewati)

Perlu dikonfirmasi ke tim backend bahwa:
1. `start()` hanya bisa dipanggil pada status `ready_to_process`
2. `weigh()` hanya bisa dipanggil pada status `received`
3. `confirmArrived()` hanya bisa dipanggil pada status `picked_up`
4. `confirmPickup()` (baru) hanya bisa dipanggil pada status `picking_up`

Validasi ini **tidak boleh hanya disembunyikan di UI** — harus divalidasi di backend.

### 4.5 Penanganan Edge Case

- Jika kurir membuka `PickupOrderDetailScreen` dengan status `received` atau di luar `picking_up`/`picked_up`, tombol konfirmasi tidak perlu ditampilkan.
- Jika `getPickupSchedule` menampilkan `inProgressOrders`, pastikan order dengan status `picked_up` juga muncul di tab "Dalam Perjalanan" — bukan hilang dari daftar.

---

## 5. File yang Diubah — Ringkasan

### `packages/wash_wallet_ui`

| File | Aksi | Deskripsi |
|------|------|-----------|
| `lib/src/components/badge/order_status_badge.dart` | MODIFY | Tambah case `picked_up` |

### `apps/production`

| File | Aksi | Deskripsi |
|------|------|-----------|
| `lib/features/order/domain/repositories/order_repository.dart` | MODIFY | Tambah `confirmArrived` abstract method |
| `lib/features/order/domain/usecases/confirm_arrived_usecase.dart` | NEW | Usecase untuk konfirmasi tiba outlet |
| `lib/features/order/data/datasources/order_remote_datasource.dart` | MODIFY | Tambah `confirmArrived` implementasi + endpoint |
| `lib/features/order/data/repositories/order_repository_impl.dart` | MODIFY | Implementasi `confirmArrived` |
| `lib/features/order/presentation/bloc/order_cubit.dart` | MODIFY | Tambah method `confirmArrived`, inject usecase baru |
| `lib/features/order/presentation/providers/` | MODIFY | Daftarkan `ConfirmArrivedUsecase` |
| `lib/features/order/presentation/screens/pickup_schedule_screen.dart` | MODIFY | Fetch `picked_up` di tab "Dalam Perjalanan" |
| `lib/features/order/presentation/screens/pickup_order_detail_screen.dart` | MODIFY | Tombol dinamis berdasarkan status (`picking_up` vs `picked_up`) |
| `lib/features/order/presentation/screens/pickup_confirmation_screen.dart` | MODIFY | Tambah `mode` parameter, dua mode aksi |
| `lib/features/order/presentation/widgets/pickup/pickup_order_card.dart` | MODIFY | Pastikan tampil untuk status `picked_up` |

### `apps/cashier`

| File | Aksi | Deskripsi |
|------|------|-----------|
| `lib/features/order/presentation/screens/index_orders_screen.dart` | MODIFY | Tambah filter `accepted`, `picking_up`, `picked_up` |
| `lib/features/order/presentation/screens/show_order_screen.dart` | MODIFY | Perbarui teks dialog accept |

### `apps/customer`

| File | Aksi | Deskripsi |
|------|------|-----------|
| `lib/features/order/presentation/widgets/order_card.dart` | MODIFY | Tambah info box untuk status pickup, teruskan `statusLabel` ke badge |
| `lib/features/order/presentation/widgets/order_detail_header_widget.dart` | MODIFY | Teruskan `statusLabel` ke `OrderStatusBadge` |
| `lib/features/order/presentation/widgets/order_detail_info_widget.dart` | MODIFY | Tambah section info tahap pickup aktif |

---

## 6. Acceptance Criteria Verifikasi

Implementor harus memverifikasi semua poin berikut sebelum dianggap selesai:

### Status Transition

- [ ] Cashier accept `requested` → status `accepted`
- [ ] Kurir pickup dari `accepted` → status `picking_up`
- [ ] Kurir confirmPickup dari `picking_up` → status `picked_up`
- [ ] Kurir confirmArrived dari `picked_up` → status `received`
- [ ] Cashier timbang dari `received` → status `ready_to_process`
- [ ] Production start dari `ready_to_process` → status `in_progress`
- [ ] Backend menolak aksi yang tidak sesuai status (misal: timbang dari `picking_up`)

### Production App (Kurir)

- [ ] Tab "Siap Dijemput" hanya menampilkan order `accepted`
- [ ] Tab "Dalam Perjalanan" menampilkan order `picking_up` DAN `picked_up`
- [ ] Order `received` tidak muncul di kedua tab kurir
- [ ] Tombol di `PickupOrderDetailScreen` sesuai status:
  - Status `picking_up` → tombol "Konfirmasi Pengambilan"
  - Status `picked_up` → tombol "Konfirmasi Tiba di Outlet"
- [ ] `PickupConfirmationScreen` mode pickup: foto wajib
- [ ] `PickupConfirmationScreen` mode arrived: foto opsional (atau wajib — sesuai keputusan tim)

### Production App (Production Worker)

- [ ] Tab "Siap Dikerjakan" hanya menampilkan order `ready_to_process`
- [ ] Tab "Sedang Dikerjakan" hanya menampilkan order `in_progress`
- [ ] Order `accepted`, `picking_up`, `picked_up`, `received` tidak muncul di kedua tab produksi

### Cashier App

- [ ] Filter "Di outlet" menampilkan order `received`
- [ ] Tombol timbang hanya muncul pada status `received`
- [ ] Filter status baru tersedia: `accepted` (Diterima), `picking_up` (Dalam Perjalanan), `picked_up` (Sudah Diambil)
- [ ] Teks dialog accept tidak menyesatkan

### Customer App

- [ ] Badge `accepted` menampilkan label yang sesuai (dari `statusLabel` backend)
- [ ] Badge `picked_up` menampilkan label yang sesuai
- [ ] Info box muncul untuk status `accepted`, `picking_up`, `picked_up`, `received`
- [ ] Pricing summary menampilkan `—` (dash) selama `paymentStatus == 'not_yet_priced'`
- [ ] Customer tidak melihat istilah teknis mentah

---

## 7. Yang Di Luar Scope Plan Ini

- Flow drop-off mandiri (`pending_dropoff`)
- Perubahan flow delivery setelah order selesai dikerjakan
- Perubahan pembayaran, wallet, atau Midtrans
- Tracking lokasi kurir real-time
- Redesign menyeluruh halaman order
