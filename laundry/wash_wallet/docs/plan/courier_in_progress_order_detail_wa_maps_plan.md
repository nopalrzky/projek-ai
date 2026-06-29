# Plan: Detail Order Kurir Dalam Perjalanan — Notifikasi WA dan Google Maps

## Referensi

- User Need: `docs/user_need/courier_in_progress_order_detail_wa_maps_user_need.md`
- Spec Standarisasi: `apps/production/docs/model_standarization_spec.md`
- Spec Remote Datasource: `apps/production/docs/remote_datasource_standarization.md`
- Referensi Implementasi: `apps/cashier/lib/features/wa_notification/` (pola identik dipakai di plan ini)

---

## Instruksi Penting untuk AI Model

Sebelum mengerjakan plan ini, **wajib baca** file-file berikut:

1. `apps/production/docs/model_standarization_spec.md`
2. `apps/production/docs/remote_datasource_standarization.md`
3. `apps/cashier/lib/features/wa_notification/` (seluruh folder sebagai referensi implementasi WA)

Selama implementasi:

- Selalu gunakan widget shared dari `package:wash_wallet_ui/wash_wallet_ui.dart` (`AppButton`, `AppCard`, `AppLayout`, `AppHeader`, `AppLoadingIndicator`, `AppBottomSheet`, dsb). Jangan buat ulang komponen yang sudah ada.
- Selalu gunakan `context.colors`, `context.typography`, `context.space`, `context.radius` — tidak boleh hardcode warna, ukuran font, atau spacing.
- Pecah widget menjadi file-file kecil dalam folder `widgets/`. Satu file satu tanggung jawab.
- Tidak boleh ada comment dalam kode. Clean code.
- Kode per file tidak boleh terlalu panjang. Jika file melebihi ~150 baris, ekstrak ke widget terpisah.

---

## Konteks Codebase

### Alur Pickup yang Sudah Ada

```
Tab Kurir -> PickupScheduleScreen
  -> Tab "Siap Dijemput" -> PickupStartBottomSheet -> status: picking_up
  -> Tab "Dalam Perjalanan" -> _handleAction(order, isPickingUp: true)
       -> PickupOrderDetailScreen (halaman detail yang sudah ada)
            -> PickupMapsButton (sudah ada)
            -> AppButton.primary "Konfirmasi Pengambilan" -> PickupConfirmationScreen
            -> AppButton.primary "Konfirmasi Tiba di Outlet" (status picked_up)
```

### Status Order yang Relevan

- `picking_up`: Kurir sedang menuju customer. Tombol WA OTW relevan di sini.
- `picked_up`: Kurir sudah mengambil, menuju outlet. Tombol WA OTW tidak relevan.

### PickupOrderDetailScreen — Kondisi Saat Ini

File: `apps/production/lib/features/order/presentation/screens/pickup_order_detail_screen.dart`

Screen ini sudah menampilkan:
- Informasi customer (`_buildCustomerSection`)
- Alamat pickup + `PickupMapsButton` (`_buildAddressSection`)
- Jadwal penjemputan (`_buildScheduleSection`)
- Item pesanan (`_buildItemsSection`)
- Tombol konfirmasi (`_buildConfirmButton`) berdasarkan status

Yang belum ada:
- Informasi nomor telepon customer
- Informasi outlet order
- Catatan customer (`notes`)
- Tombol `Kirim Notif WA` untuk status `picking_up`

### WA Notification — Pola Cashier App

Di `apps/cashier/`, WA notification sudah diimplementasikan lengkap:

- `WaNotificationRemoteDatasource`: `getPreview(orderId)` dan `sendNotification(orderId)`
- `WaNotificationCubit`: state `WaNotificationInitial | PreviewLoading | PreviewLoaded | Sending | Sent | Error`
- `showWaNotificationModal(context, orderId: id)`: bottom sheet dengan preview pesan, info coin, dan tombol kirim
- Endpoint: `_endpoints.waNotificationPreview(orderId)` dan `_endpoints.waNotificationSend(orderId)`

Plan ini mengadopsi pola yang sama di aplikasi produksi, hanya perlu buat ulang feature folder `wa_notification` di `apps/production/`.

### MapsLauncherService — Sudah Ada

`PickupMapsButton` dan `MapsLauncherService` sudah ada dan berfungsi. Tidak perlu diubah.

---

## Keputusan Teknis

| Aspek | Keputusan |
|---|---|
| Screen detail | Gunakan `PickupOrderDetailScreen` yang sudah ada, tambahkan informasi dan tombol WA |
| Tombol WA | Hanya tampil pada status `picking_up` |
| Klik kartu di "Dalam Perjalanan" | Sudah open `PickupOrderDetailScreen` via `_handleAction` di `PickupScheduleScreen`. Tidak ada perubahan navigasi. |
| WA modal | Gunakan bottom sheet identik dengan cashier app. Buat ulang feature `wa_notification` di apps/production |
| Tap pada kartu vs tombol aksi | Tombol "Konfirmasi" di card tetap ada; klik card (area luar tombol) membuka detail. Tidak ada konflik navigasi karena navigasi saat ini sudah terpilah dengan baik di `_handleAction` |
| Refresh setelah aksi | `PickupScheduleScreen` sudah memanggil `_loadData()` via `.then((_) => _loadData())` setelah `PickupOrderDetailScreen` ditutup. Tidak perlu perubahan. |

---

## Proposed Changes

### 1. Feature: wa_notification di apps/production

Buat ulang feature WA notification di production app, mengikuti persis pola cashier. Semua file di bawah `lib/features/wa_notification/`.

#### [NEW] `lib/features/wa_notification/data/datasources/wa_notification_remote_datasource.dart`

Identik dengan cashier. Gunakan `_endpoints.waNotificationPreview(orderId)` dan `_endpoints.waNotificationSend(orderId)`.

```dart
abstract class WaNotificationRemoteDatasource {
  Future<WaNotificationPreviewModel> getPreview(int orderId);
  Future<Map<String, dynamic>> sendNotification(int orderId);
}

class WaNotificationRemoteDatasourceImpl implements WaNotificationRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  WaNotificationRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<WaNotificationPreviewModel> getPreview(int orderId) async {
    final response = await _dio.get(_endpoints.waNotificationPreview(orderId));
    return WaNotificationPreviewModel.fromJson(response.data['data']);
  }

  @override
  Future<Map<String, dynamic>> sendNotification(int orderId) async {
    final response = await _dio.post(_endpoints.waNotificationSend(orderId));
    return response.data as Map<String, dynamic>;
  }
}
```

#### [NEW] `lib/features/wa_notification/domain/repositories/wa_notification_repository.dart`
#### [NEW] `lib/features/wa_notification/data/repositories/wa_notification_repository_impl.dart`
#### [NEW] `lib/features/wa_notification/domain/usecases/get_wa_notification_preview_usecase.dart`
#### [NEW] `lib/features/wa_notification/domain/usecases/send_wa_notification_usecase.dart`

Semua identik dengan versi cashier. Cukup salin dan sesuaikan import path.

#### [NEW] `lib/features/wa_notification/presentation/bloc/wa_notification_state.dart`

State identik dengan cashier:

```dart
sealed class WaNotificationState
  WaNotificationInitial |
  WaNotificationPreviewLoading |
  WaNotificationPreviewLoaded(preview) |
  WaNotificationSending(preview) |
  WaNotificationSent(message, coinDeducted, coinSource, remainingCoin) |
  WaNotificationError(failure, preview?)
```

#### [NEW] `lib/features/wa_notification/presentation/bloc/wa_notification_cubit.dart`

Identik dengan cashier. Method `getPreview(orderId)` dan `sendNotification(orderId, preview)`.

#### [NEW] `lib/features/wa_notification/presentation/providers/wa_notification_provider.dart`

Provider untuk membuat `WaNotificationCubit` dengan dependency injection menggunakan `Dio` dan `ApiEndpoints`.

#### [NEW] `lib/features/wa_notification/presentation/widgets/wa_notification_modal.dart`

Bottom sheet identik dengan cashier. Menampilkan:
- Preview pesan WA yang akan dikirim
- Info coin (harga, saldo, sumber coin)
- Status saldo cukup / tidak cukup
- Tombol kirim (disabled jika saldo tidak cukup)
- Feedback sukses / gagal

Fungsi entry point: `showWaNotificationModal(context, orderId: id)`.

---

### 2. Daftarkan WaNotificationCubit di main.dart

#### [MODIFY] `lib/main.dart`

Tambahkan `WaNotificationCubit` ke `AppDependencies` dan `MultiBlocProvider`.

Tambahan di `_initializeDependencies()`:
```dart
final waNotificationCubit = WaNotificationProvider.createCubit(dio, endpoints);
```

Tambahan di `AppDependencies`:
```dart
final WaNotificationCubit waNotificationCubit;
```

Tambahan di `MultiBlocProvider`:
```dart
BlocProvider<WaNotificationCubit>.value(value: dependencies.waNotificationCubit),
```

---

### 3. Modifikasi PickupOrderDetailScreen

#### [MODIFY] `lib/features/order/presentation/screens/pickup_order_detail_screen.dart`

Tambahkan beberapa section yang belum ada dan tombol WA.

**Tambahan informasi yang perlu ditampilkan:**

- Nomor telepon customer di section `Informasi Customer`
- Nama outlet di section baru `Informasi Outlet`
- Catatan customer di section baru `Catatan` (hanya jika `order.notes` tidak null/kosong)

**Tambahkan tombol WA OTW:**

Sebelum tombol `Konfirmasi Pengambilan` (saat status `picking_up`), tambahkan tombol WA:

```dart
if (order.status.toLowerCase() == 'picking_up' && order.customer?.phone != null)
  ...[
    PickupWaButton(orderId: order.id),
    SizedBox(height: context.space.md),
  ]
```

Karena file ini akan melebihi 150 baris setelah penambahan, ekstrak bagian yang ada ke widget-widget di folder `widgets/pickup/`:

---

### 4. Widget: PickupCustomerSection

#### [MODIFY/EXTRACT] `lib/features/order/presentation/widgets/pickup/pickup_customer_section.dart`

Ekstrak dari `_buildCustomerSection` di `PickupOrderDetailScreen` dan tambahkan tampilan nomor telepon customer.

```dart
class PickupCustomerSection extends StatelessWidget {
  final Order order;
  const PickupCustomerSection({super.key, required this.order});
  ...
}
```

Tampilkan:
- Nama customer
- Nomor telepon customer jika tersedia (`order.customer?.phone`), dengan icon `Icons.phone_outlined`
- Jika tidak tersedia, tampilkan label `'Nomor WA tidak tersedia'` dengan warna `context.colors.textTertiary`

---

### 5. Widget: PickupOutletSection

#### [NEW] `lib/features/order/presentation/widgets/pickup/pickup_outlet_section.dart`

Section `AppCard` baru yang menampilkan nama outlet dari `order.outlet?.name`.

```dart
class PickupOutletSection extends StatelessWidget {
  final Order order;
  const PickupOutletSection({super.key, required this.order});
  ...
}
```

Tampilkan dengan icon `Icons.store_outlined` dan nama outlet. Jika `order.outlet` null, sembunyikan section ini.

---

### 6. Widget: PickupNotesSection

#### [NEW] `lib/features/order/presentation/widgets/pickup/pickup_notes_section.dart`

Section `AppCard` baru yang menampilkan catatan customer dari `order.notes`.

```dart
class PickupNotesSection extends StatelessWidget {
  final Order order;
  const PickupNotesSection({super.key, required this.order});
  ...
}
```

Tampilkan dengan icon `Icons.note_outlined`. Hanya tampil jika `order.notes` tidak null dan tidak kosong.

---

### 7. Widget: PickupWaButton

#### [NEW] `lib/features/order/presentation/widgets/pickup/pickup_wa_button.dart`

Tombol `Kirim Notif WA` yang memanggil `showWaNotificationModal`.

```dart
class PickupWaButton extends StatelessWidget {
  final int orderId;
  const PickupWaButton({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    return AppButton.secondary(
      label: 'Kirim Notif WA',
      isFullWidth: true,
      icon: const Icon(Icons.send_rounded),
      onPressed: () => showWaNotificationModal(context, orderId: orderId),
    );
  }
}
```

---

### 8. Perbarui Layout PickupOrderDetailScreen

#### [MODIFY] `lib/features/order/presentation/screens/pickup_order_detail_screen.dart`

Setelah ekstraksi ke widget-widget di atas, screen menjadi ringkas:

```dart
body: SingleChildScrollView(
  padding: EdgeInsets.all(context.space.lg),
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      PickupCustomerSection(order: order),
      SizedBox(height: context.space.lg),
      PickupAddressSection(order: order),       // sudah ada, tidak berubah
      SizedBox(height: context.space.lg),
      if (order.outlet != null) ...[
        PickupOutletSection(order: order),
        SizedBox(height: context.space.lg),
      ],
      if (order.pickupSchedule != null) ...[
        PickupScheduleSection(order: order),    // refactor dari _buildScheduleSection
        SizedBox(height: context.space.lg),
      ],
      PickupItemsSection(order: order),         // refactor dari _buildItemsSection
      if (order.notes?.isNotEmpty == true) ...[
        SizedBox(height: context.space.lg),
        PickupNotesSection(order: order),
      ],
      SizedBox(height: context.space.xxl),
      if (order.status.toLowerCase() == 'picking_up' && order.customer?.phone != null) ...[
        PickupWaButton(orderId: order.id),
        SizedBox(height: context.space.md),
      ],
      PickupConfirmButton(order: order),        // refactor dari _buildConfirmButton
      SizedBox(height: context.space.md),
    ],
  ),
),
```

Ekstrak semua `_build*` method yang ada menjadi widget file terpisah:

---

### 9. Widget: PickupAddressSection

#### [EXTRACT] `lib/features/order/presentation/widgets/pickup/pickup_address_section.dart`

Pindahkan `_buildAddressSection` dari screen ke widget file ini. Sudah menggunakan `PickupMapsButton` yang ada.

---

### 10. Widget: PickupScheduleSection

#### [EXTRACT] `lib/features/order/presentation/widgets/pickup/pickup_schedule_section.dart`

Pindahkan `_buildScheduleSection` dari screen ke widget file ini.

---

### 11. Widget: PickupItemsSection

#### [EXTRACT] `lib/features/order/presentation/widgets/pickup/pickup_items_section.dart`

Pindahkan `_buildItemsSection` dari screen ke widget file ini.

---

### 12. Widget: PickupConfirmButton

#### [EXTRACT] `lib/features/order/presentation/widgets/pickup/pickup_confirm_button.dart`

Pindahkan `_buildConfirmButton` dari screen ke widget file ini.

---

## Struktur File

```
apps/production/lib/
├── main.dart                                                  [MODIFY]
└── features/
    ├── wa_notification/                                        [NEW FEATURE]
    │   ├── data/
    │   │   ├── datasources/
    │   │   │   └── wa_notification_remote_datasource.dart     [NEW]
    │   │   └── repositories/
    │   │       └── wa_notification_repository_impl.dart       [NEW]
    │   ├── domain/
    │   │   ├── repositories/
    │   │   │   └── wa_notification_repository.dart            [NEW]
    │   │   └── usecases/
    │   │       ├── get_wa_notification_preview_usecase.dart   [NEW]
    │   │       └── send_wa_notification_usecase.dart          [NEW]
    │   └── presentation/
    │       ├── bloc/
    │       │   ├── wa_notification_cubit.dart                 [NEW]
    │       │   └── wa_notification_state.dart                 [NEW]
    │       ├── providers/
    │       │   └── wa_notification_provider.dart              [NEW]
    │       └── widgets/
    │           └── wa_notification_modal.dart                 [NEW]
    └── order/
        └── presentation/
            ├── screens/
            │   └── pickup_order_detail_screen.dart            [MODIFY]
            └── widgets/
                └── pickup/
                    ├── pickup_customer_section.dart           [NEW - extract+enhance]
                    ├── pickup_address_section.dart            [NEW - extract]
                    ├── pickup_outlet_section.dart             [NEW]
                    ├── pickup_schedule_section.dart           [NEW - extract]
                    ├── pickup_items_section.dart              [NEW - extract]
                    ├── pickup_notes_section.dart              [NEW]
                    ├── pickup_wa_button.dart                  [NEW]
                    └── pickup_confirm_button.dart             [NEW - extract]
```

---

## Urutan Implementasi yang Disarankan

1. Feature `wa_notification`: datasource -> repository -> usecases -> state -> cubit -> provider -> modal widget
2. Daftarkan `WaNotificationCubit` di `main.dart`
3. Ekstrak widget-widget dari `PickupOrderDetailScreen` yang sudah ada
4. Buat widget-widget baru: `PickupOutletSection`, `PickupNotesSection`, `PickupWaButton`, `PickupCustomerSection` (enhanced)
5. Perbarui `PickupOrderDetailScreen` untuk memakai semua widget baru

---

## Acceptance Criteria Teknis

- Tab `Dalam Perjalanan` -> klik order -> buka `PickupOrderDetailScreen`
- Detail menampilkan: nomor order, status, nama customer, nomor telepon (jika ada), alamat pickup, jadwal, outlet, jumlah item, catatan customer (jika ada)
- Tombol `Buka Maps` tetap ada dan berfungsi seperti sebelumnya
- Tombol `Kirim Notif WA` muncul hanya pada status `picking_up` dan hanya jika customer memiliki nomor telepon
- Klik `Kirim Notif WA` membuka bottom sheet WA dengan preview pesan, info coin, dan tombol kirim
- Kirim WA sukses menampilkan feedback sukses
- Kirim WA gagal menampilkan feedback gagal (status order tidak berubah)
- Saldo coin tidak cukup: tombol kirim WA di modal disabled
- Customer tanpa nomor telepon: tombol `Kirim Notif WA` tidak ditampilkan
- Tombol `Konfirmasi Pengambilan` dan `Konfirmasi Tiba di Outlet` tetap ada dan terpisah dari tombol WA
- Tidak ada hardcode warna, spacing, atau font size
- Tidak ada comment dalam kode
- Setiap file widget tidak melebihi ~150 baris
