# Implementation Plan: Customer Service Courier Eligibility

## Konteks untuk AI Model

> **WAJIB DIBACA SEBELUM CODING:**
> 1. Baca `docs/spec/cubit_spec.md`, `state_spec.md`, `repository_spec.md`, `usecase_spec.md`, `remote_datasource_spec.md`, `repository_impl_spec.md`
> 2. Selalu gunakan **widget shared reusable** dari `wash_wallet_ui` (AppBadge, AppCard, AppButton, dll.) — jangan buat komponen UI ad-hoc
> 3. Selalu gunakan **theme color** via `context.colors.*`, `context.typography.*`, `context.space.*` — jangan hardcode warna
> 4. Pecah UI menjadi **widget kecil** di folder `widgets/` — jangan taruh semua di satu file besar
> 5. **Jangan ada comment** — biarkan code berbicara sendiri (clean code)
> 6. Konsisten dengan pola yang sudah ada di codebase:
>    - `service_card.dart`, `outlet_card.dart` untuk referensi card widget
>    - `self_dropoff_banner_widget.dart` untuk referensi banner pattern
>    - `outlet_status_badge_widget.dart` untuk referensi badge widget
>    - `cart_cubit.dart`, `order_cubit.dart` untuk referensi cubit pattern

## Konteks Codebase — Temuan Penting

### Yang sudah ada di Backend (PHP) ✅
- `supports_courier` field di tabel `laundry_services` (fillable + cast boolean)
- `scopeSupportsCourier()` dan `scopeNotSupportsCourier()` di `LaundryService.php`
- `validateCourierEligibility()` di `OrderService::storeCustomer()` — sudah memvalidasi per layanan
- `LaundryServiceResource.php` sudah return `supportsCourier` (tapi **belum** return `courierSupportLabel` dan `courierSupportMessage`)

### Yang belum ada di Flutter/Dart ❌
- `supportsCourier` di `LaundryService` entity dan `LaundryServiceModel`
- UI indicator di `ServiceCard` untuk layanan non-kurir
- Info di `ServiceDetailBottomSheet` untuk layanan non-kurir
- Logic di `PickupTypeSelectorWidget` untuk disable courier jika ada layanan non-kurir di cart
- Warning banner di `OrderSummaryScreen`
- CartState tidak tracking mana service yang non-kurir

---

## Urutan Pengerjaan

---

### Phase 1: Backend — Tambahkan Label Fields ke Resource

**Step 1.1 — Update `LaundryServiceResource.php`**

File: `webapp/wash_wallet_be/app/Http/Resources/LaundryService/LaundryServiceResource.php`

Tambahkan dua field computed setelah `supportsCourier`:

```php
'supportsCourier' => (bool) $this->supports_courier,
'courierSupportLabel' => $this->supports_courier ? null : 'Datang langsung ke outlet',
'courierSupportMessage' => $this->supports_courier
    ? null
    : 'Layanan ini tidak tersedia untuk pickup/delivery. Silakan datang langsung ke outlet.',
```

> Tidak ada migration diperlukan — hanya computed field dari kolom yang sudah ada.

---

### Phase 2: Domain Layer — Tambah `supportsCourier` ke Entity & Model

**Step 2.1 — Update `LaundryService` entity**

File: `packages/wash_wallet_domain/lib/src/entities/laundry_service.dart`

Tambahkan tiga field:
```dart
final bool supportsCourier;
final String? courierSupportLabel;
final String? courierSupportMessage;
```

- Default `supportsCourier = true` (backward compatible)
- Update `fromModel()` untuk memetakan field baru
- Update `props` untuk tambahkan tiga field tersebut

---

**Step 2.2 — Update `LaundryServiceModel`**

File: `packages/wash_wallet_domain/lib/src/models/laundry_service_model.dart`

Tambahkan ke factory Freezed:
```dart
@Default(true) bool supportsCourier,
String? courierSupportLabel,
String? courierSupportMessage,
```

Update `_normalizeJson()`:
```dart
normalized['supportsCourier'] = toBool(
  json['supportsCourier'] ?? json['supports_courier'] ?? true,
);
normalized['courierSupportLabel'] = json['courierSupportLabel'] ?? json['courier_support_label'];
normalized['courierSupportMessage'] = json['courierSupportMessage'] ?? json['courier_support_message'];
```

Update `toEntity()` dan `fromEntity()`.

---

**Step 2.3 — Regenerate Freezed**

```bash
cd packages/wash_wallet_domain
dart run build_runner build --delete-conflicting-outputs
```

---

### Phase 3: Cart State — Tracking Non-Courier Services

**Step 3.1 — Update `CartState`**

File: `apps/customer/lib/features/order/presentation/bloc/cart_state.dart`

Tambahkan field baru:
```dart
final Set<int> nonCourierServiceIds;
```

Tambahkan computed property:
```dart
bool get hasNonCourierServices => nonCourierServiceIds.isNotEmpty;
bool get canUseCourier => nonCourierServiceIds.isEmpty;
```

Update constructor:
```dart
const CartState({
  this.activeOutletId,
  this.activeOutletName,
  required this.activeServices,
  this.nonCourierServiceIds = const {},
});
```

Update `copyWith()` — tambahkan `nonCourierServiceIds` parameter.

Update `props` — tambahkan `nonCourierServiceIds`.

Update `CartInitial` dan `CartLoaded` sesuai.

---

**Step 3.2 — Update `CartCubit`**

File: `apps/customer/lib/features/order/presentation/bloc/cart_cubit.dart`

Ubah signature `addService()`:
```dart
Future<AddServiceResult> addService(
  int serviceId,
  int outletId,
  String outletName, {
  bool supportsCourier = true,
}) async { ... }
```

Update `_addServiceDirect()` untuk menerima dan menyimpan `supportsCourier`:
```dart
Future<void> _addServiceDirect(
  int serviceId,
  int outletId,
  String outletName, {
  bool supportsCourier = true,
}) async {
  final newServices = Set<int>.from(state.activeServices)..add(serviceId);
  final newNonCourierIds = Set<int>.from(state.nonCourierServiceIds);
  if (!supportsCourier) newNonCourierIds.add(serviceId);

  emit(CartLoaded(
    activeOutletId: outletId,
    activeOutletName: outletName,
    activeServices: newServices,
    nonCourierServiceIds: newNonCourierIds,
  ));
  await _saveCart(outletId, outletName, newServices, newNonCourierIds);
}
```

Update `removeFromCart()` untuk remove dari `nonCourierServiceIds` juga.

Update `switchOutletAndAdd()` untuk reset `nonCourierServiceIds`:
```dart
Future<void> switchOutletAndAdd(
  int serviceId,
  int newOutletId,
  String newOutletName, {
  bool supportsCourier = true,
}) async {
  final nonCourierIds = supportsCourier ? <int>{} : {serviceId};
  emit(CartLoaded(..., nonCourierServiceIds: nonCourierIds));
  await _saveCart(...);
}
```

Update `_saveCart()` untuk persist `nonCourierServiceIds`:
```dart
Future<void> _saveCart(
  int? outletId, String? outletName,
  Set<int> services, Set<int> nonCourierIds,
) async {
  final data = {
    'activeOutletId': outletId,
    'activeOutletName': outletName,
    'activeServices': services.toList(),
    'nonCourierServiceIds': nonCourierIds.toList(),
  };
  await prefs.setString(_cartKey, json.encode(data));
}
```

Update `loadCart()` untuk load `nonCourierServiceIds` dari prefs.

Update `clearCart()` dan `clearAllCarts()` untuk reset `nonCourierServiceIds`.

---

### Phase 4: Frontend Widgets

> **Widget baru** di `apps/customer/lib/features/outlet/presentation/widgets/` atau `apps/customer/lib/features/order/presentation/widgets/`.
> Masing-masing widget satu file, kecil, dan focused.

---

**Step 4.1 — `service_non_courier_badge_widget.dart`**

Lokasi: `apps/customer/lib/features/outlet/presentation/widgets/`

Widget kecil badge "Datang langsung ke outlet". Gunakan `AppBadge.warning(label: ...)` dengan icon `Icons.store_outlined`.

```dart
class ServiceNonCourierBadgeWidget extends StatelessWidget {
  final String? label;
  const ServiceNonCourierBadgeWidget({super.key, this.label});

  @override
  Widget build(BuildContext context) {
    return AppBadge.warning(
      label: label ?? 'Datang langsung ke outlet',
      icon: Icons.store_outlined,
      size: AppBadgeSize.sm,
      mode: AppBadgeMode.soft,
    );
  }
}
```

---

**Step 4.2 — Update `ServiceCard`**

File: `apps/customer/lib/features/outlet/presentation/widgets/service_card.dart`

Import `service_non_courier_badge_widget.dart`.

Di bagian bawah nama service (sebelum rating/durasi row), tambahkan kondisional:
```dart
if (!service.supportsCourier) ...[
  SizedBox(height: context.space.xxs),
  const ServiceNonCourierBadgeWidget(),
],
```

Badge hanya tampil ketika `!isSelected` (tidak perlu muncul lagi saat sudah di-add).

---

**Step 4.3 — Update `ServiceDetailBottomSheet`**

File: `apps/customer/lib/features/order/presentation/widgets/service_detail_bottom_sheet.dart`

Tambahkan `ServiceNonCourierInfoRowWidget` (widget inline kecil dalam file ini) yang muncul jika `!service.supportsCourier`:

```dart
// Widget privat kecil di dalam file yang sama atau file terpisah
class _NonCourierInfoRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.warning.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(color: context.colors.warning.withValues(alpha: 0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.store_outlined, color: context.colors.warning, size: 20),
          SizedBox(width: context.space.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Datang langsung ke outlet',
                  style: context.typography.labelLarge.copyWith(
                    fontWeight: FontWeight.bold,
                    color: context.colors.warning,
                  ),
                ),
                SizedBox(height: context.space.xxs),
                Text(
                  'Layanan ini tidak tersedia untuk pickup/delivery. Silakan datang langsung ke outlet.',
                  style: context.typography.bodySmall.copyWith(
                    color: context.colors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
```

Tambahkan di atas button "Tambah ke Pesanan" jika `!service.supportsCourier`.

---

**Step 4.4 — `non_courier_cart_warning_widget.dart`**

Lokasi: `apps/customer/lib/features/order/presentation/widgets/`

Banner warning di order summary. Gunakan pattern yang sama dengan `SelfDropoffBannerWidget` tapi dengan pesan berbeda.

```dart
class NonCourierCartWarningWidget extends StatelessWidget {
  const NonCourierCartWarningWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(bottom: context.space.md),
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.warning.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(context.radius.lg),
        border: Border.all(color: context.colors.warning.withValues(alpha: 0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.info_outline_rounded, color: context.colors.warning),
          SizedBox(width: context.space.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Ada layanan yang hanya tersedia jika datang langsung ke outlet.',
                  style: context.typography.titleMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: context.colors.warning,
                  ),
                ),
                SizedBox(height: context.space.xs),
                Text(
                  'Pickup/delivery tidak tersedia untuk order ini.',
                  style: context.typography.bodySmall.copyWith(
                    color: context.colors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
```

---

**Step 4.5 — Update `PickupTypeSelectorWidget`**

File: `apps/customer/lib/features/order/presentation/widgets/pickup_type_selector_widget.dart`

Tambahkan parameter `canUseCourier`:
```dart
class PickupTypeSelectorWidget extends StatelessWidget {
  final bool isCourierEnabled;
  final bool canUseCourier;

  const PickupTypeSelectorWidget({
    super.key,
    this.isCourierEnabled = true,
    this.canUseCourier = true,
  });
}
```

Logika tampil mengikuti prioritas aturan:

| Kondisi | Tampilan |
|---------|----------|
| `!isCourierEnabled` | Hanya "Antar Sendiri" (perilaku lama) |
| `isCourierEnabled && !canUseCourier` | Hanya "Antar Sendiri" + info "Pickup/delivery tidak tersedia karena ada layanan non-kurir" |
| `isCourierEnabled && canUseCourier` | "Jemput Kurir" + "Antar Sendiri" (perilaku lama) |

Untuk kondisi `!canUseCourier`, tambahkan teks penjelasan di bawah pilihan menggunakan `context.typography.labelSmall` dengan warna `context.colors.warning`.

Pastikan juga memanggil `OrderCubit.setPickupType('self_pickup')` secara otomatis jika `!canUseCourier` saat build.

---

### Phase 5: Update ShowOutletScreen & OrderSummaryScreen

**Step 5.1 — Update `ShowOutletScreen`**

File: `apps/customer/lib/features/outlet/presentation/screens/show_outlet_screen.dart`

Di method `_onServiceTap()`, update semua call ke `CartCubit.addService()` untuk pass `supportsCourier`:

```dart
await context.read<CartCubit>().addService(
  service.id,
  widget.outletId,
  currentOutletName,
  supportsCourier: service.supportsCourier,
);
```

Juga update `switchOutletAndAdd()` call untuk pass `supportsCourier`.

---

**Step 5.2 — Update `OrderSummaryScreen`**

File: `apps/customer/lib/features/order/presentation/screens/order_summary_screen.dart`

Di `_buildContent()`, baca `canUseCourier` dari `CartCubit`:

```dart
Widget _buildContent(BuildContext context, Outlet outlet) {
  return BlocBuilder<CartCubit, CartState>(
    builder: (context, cartState) {
      final canUseCourier = cartState.canUseCourier;
      final hasNonCourierServices = cartState.hasNonCourierServices;

      // Tampilkan SelfDropoffBannerWidget atau NonCourierCartWarningWidget di bagian atas
      // Logika: jika !isCourierEnabled → SelfDropoffBannerWidget
      //         jika isCourierEnabled && !canUseCourier → NonCourierCartWarningWidget
      // ...

      // Pass canUseCourier ke PickupTypeSelectorWidget
      PickupTypeSelectorWidget(
        isCourierEnabled: outlet.isCourierEnabled,
        canUseCourier: canUseCourier,
      )
      // ...
    },
  );
}
```

Tambahkan import untuk `non_courier_cart_warning_widget.dart`.

---

### Phase 6: Update OrderCubit & OrderBottomActionWidget

**Step 6.1 — Update `OrderCubit.createOrder()`**

File: `apps/customer/lib/features/order/presentation/bloc/order_cubit.dart`

Tambahkan parameter `canUseCourier`:
```dart
Future<void> createOrder({
  required int customerAccountId,
  required int outletId,
  required Set<int> serviceIds,
  required bool isCourierEnabled,
  required bool canUseCourier,
}) async {
  // ...
  final effectivelyCourierEnabled = isCourierEnabled && canUseCourier;

  if (effectivelyCourierEnabled && state.pickupType == 'courier') {
    // validasi address, tanggal, schedule (existing logic)
  }

  final params = CreateOrderParams(
    // ...
    pickupType: effectivelyCourierEnabled ? state.pickupType : 'self_dropoff',
    // ...
  );
}
```

---

**Step 6.2 — Update `OrderBottomActionWidget`**

File: `apps/customer/lib/features/order/presentation/widgets/order_bottom_action_widget.dart`

Baca `cartState.canUseCourier` dari `CartCubit` dan pass ke `OrderCubit.createOrder()`:

```dart
final cartState = context.watch<CartCubit>().state;
// ...
context.read<OrderCubit>().createOrder(
  customerAccountId: authState.customer.id,
  outletId: outletId,
  serviceIds: outletCart,
  isCourierEnabled: isCourierEnabled,
  canUseCourier: cartState.canUseCourier,
);
```

---

## File yang Dibuat / Diubah

### Dibuat Baru
| File | Deskripsi |
|------|-----------|
| `outlet/presentation/widgets/service_non_courier_badge_widget.dart` | Badge "Datang langsung ke outlet" untuk ServiceCard |
| `order/presentation/widgets/non_courier_cart_warning_widget.dart` | Warning banner di order summary |

### Diubah
| File | Perubahan |
|------|-----------|
| `LaundryServiceResource.php` | Tambah `courierSupportLabel`, `courierSupportMessage` |
| `entities/laundry_service.dart` | Tambah `supportsCourier`, `courierSupportLabel`, `courierSupportMessage` |
| `models/laundry_service_model.dart` | Tambah field + `_normalizeJson()` + `toEntity()` |
| `cart_state.dart` | Tambah `nonCourierServiceIds`, computed `hasNonCourierServices`, `canUseCourier` |
| `cart_cubit.dart` | Update `addService()` + `removeFromCart()` + persist non-courier state |
| `service_card.dart` | Tampilkan `ServiceNonCourierBadgeWidget` jika `!service.supportsCourier` |
| `service_detail_bottom_sheet.dart` | Tambahkan info container non-kurir |
| `pickup_type_selector_widget.dart` | Tambah param `canUseCourier`, disable pickup jika non-kurir |
| `order_summary_screen.dart` | Tampilkan `NonCourierCartWarningWidget`, pass `canUseCourier` |
| `order_cubit.dart` | Tambah param `canUseCourier` di `createOrder()` |
| `order_bottom_action_widget.dart` | Pass `canUseCourier` dari CartState |
| `show_outlet_screen.dart` | Pass `supportsCourier` saat `addService()` |

---

## Catatan Prioritas Aturan (Urutan Implementasi Logika)

```
1. Outlet tutup (canCreateOrderNow = false)  →  order tidak bisa sama sekali
2. Outlet kurir tidak aktif (!isCourierEnabled) →  self drop-off (perilaku lama)
3. Ada layanan non-kurir (!canUseCourier)  →  self drop-off karena layanan
4. Semua oke  →  kurir tersedia normal
```

Implementasikan prioritas ini di `PickupTypeSelectorWidget` dan `OrderCubit.createOrder()`.
