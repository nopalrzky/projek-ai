# Issue: Flow Checkout Layanan Non-Kurir Masih Menampilkan Opsi Kurir

## Status

Open

## Ringkasan Masalah

Pada flow checkout/ringkasan pesanan, ketika customer memilih layanan yang tidak mendukung kurir, UI masih menampilkan beberapa elemen yang seharusnya hanya muncul untuk layanan kurir:

- Input atau pilihan alamat.
- Pilihan jadwal pengambilan baju kotor.
- Opsi metode pengantaran baju bersih masih menampilkan "Antar Kurir".
- Estimasi ongkir masih muncul atau masih dihitung.

Untuk layanan non-kurir, flow harus selalu dipaksa menjadi:

- Pengambilan baju kotor: customer datang/antar sendiri ke outlet.
- Pengantaran baju bersih: customer ambil sendiri di outlet.
- Tidak ada alamat customer.
- Tidak ada jadwal pickup kurir.
- Tidak ada ongkir pickup/delivery.

Selain itu, copy untuk metode pembayaran transfer saat ini masih menyebut Midtrans secara eksplisit. Contoh yang perlu dihindari: "Bayar via Midtrans" atau "Bayar aman via Midtrans". Nama payment gateway tidak perlu tampil ke customer.

## Dampak

Bug ini membuat customer mengira layanan non-kurir tetap bisa dijemput/diantar oleh kurir. Ini juga bisa memicu perhitungan ongkir yang tidak relevan dan membuat checkout terasa membingungkan.

## Dugaan Root Cause

### 1. Section kurir masih dirender hanya berdasarkan outlet courier-enabled

File: `lib/features/order/presentation/screens/order_summary_screen.dart`

Di `_buildContent`, section metode pengambilan, pickup courier section, metode pengantaran, delivery courier section, dan payment method masih dirender ketika `outlet.isCourierEnabled == true`, tanpa menjadikan `cartState.canUseCourier` sebagai guard utama.

Akibatnya, ketika outlet mendukung kurir tetapi cart berisi layanan non-kurir, UI tetap masuk ke blok:

```dart
if (outlet.isCourierEnabled) ...[
  const SectionTitle(title: 'Metode Pengambilan Baju Kotor'),
  PickupTypeSelectorWidget(...),
  CourierPickupSectionWidget(...),
  const SectionTitle(title: 'Metode Pengantaran Baju Bersih'),
  DeliveryTypeSelectorWidget(...),
  const CourierDeliverySectionWidget(),
]
```

Padahal untuk layanan non-kurir, seluruh kontrol kurir harus disembunyikan atau diganti menjadi ringkasan outlet visit/self pickup yang jelas.

### 2. Delivery selector tidak tahu kondisi `canUseCourier`

File: `lib/features/order/presentation/widgets/delivery_type_selector_widget.dart`

`DeliveryTypeSelectorWidget` hanya menerima `isCourierEnabled`, sehingga opsi "Antar Kurir" tetap muncul selama outlet courier-enabled. Widget ini perlu menerima guard tambahan seperti `canUseCourier`, atau tidak dirender sama sekali untuk cart non-kurir.

### 3. State order default masih bernilai kurir

File: `lib/features/order/presentation/bloc/order_state.dart`

Default state:

```dart
pickupType = 'courier'
deliveryType = 'delivery'
```

Untuk cart non-kurir, state harus segera dinormalisasi ke:

```dart
pickupType = 'self_dropoff'
deliveryType = 'pickup'
```

Catatan: saat ini ada campuran istilah `self_pickup` dan `self_dropoff`. Pastikan value yang dikirim ke API konsisten dengan `CreateOrderParams` dan backend. Di `OrderCubit.createOrder`, non-kurir sudah dipaksa menjadi `pickupType: 'self_dropoff'` dan `deliveryType: 'pickup'`, tetapi UI state masih bisa berada di mode kurir sebelum submit.

### 4. Fee calculation masih bisa terpanggil untuk non-kurir

File: `lib/features/order/presentation/screens/order_summary_screen.dart`

`_triggerFeeCalculation` hanya mengecek:

```dart
orderState.pickupType == 'courier' || orderState.deliveryType == 'delivery'
```

Karena `deliveryType` default adalah `delivery`, fee calculation bisa tetap berjalan walaupun cart tidak bisa pakai kurir. Guard ini harus mempertimbangkan `cartState.canUseCourier` dan `outlet.isCourierEnabled`.

### 5. Customer address masih auto-selected untuk flow non-kurir

File: `lib/features/order/presentation/screens/order_summary_screen.dart`

`CustomerAddressListCubit` tetap dimuat dan listener otomatis memilih primary address. Untuk non-kurir, alamat customer tidak dibutuhkan dan tidak boleh mempengaruhi checkout atau ongkir.

## Scope Perbaikan

### Wajib Diperbaiki

- Untuk cart dengan `cartState.canUseCourier == false`, jangan tampilkan:
  - address selector,
  - pickup schedule selector,
  - "Antar Kurir",
  - courier delivery estimate,
  - pesan error/validasi terkait alamat pickup,
  - estimasi ongkir.
- Untuk outlet yang `isCourierEnabled == false`, behavior juga harus sama: full self dropoff/self pickup.
- Normalisasi `OrderCubit` state saat flow non-kurir:
  - `pickupType = 'self_dropoff'`
  - `deliveryType = 'pickup'`
  - clear selected address, selected date, selected schedule bila perlu.
- `_triggerFeeCalculation` harus reset pricing dan tidak memanggil `calculateFee` saat order tidak eligible kurir.
- `OrderBottomActionWidget` tidak boleh disable tombol karena courier pricing error jika cart non-kurir.
- Copy transfer tidak boleh menyebut "Midtrans" di UI customer-facing.

### Copy yang Direkomendasikan

Gunakan copy yang customer-friendly:

- Title: `Transfer Online`
- Subtitle opsi pembayaran: `Bayar dengan transfer bank atau metode pembayaran online`
- Subtitle summary: `Instruksi pembayaran akan tersedia setelah pesanan dibuat`

Hindari menyebut nama provider payment gateway seperti Midtrans.

## Arahan UI/UX

Saat memperbaiki bug ini, sekalian rapikan tampilan agar lebih modern dan mudah dipahami.

Gunakan komponen dari `wash_wallet_ui` sebanyak mungkin:

- `AppCard` untuk ringkasan outlet/self pickup.
- `AppButton` untuk aksi.
- `AppBadge` untuk status seperti `Wajib Datang ke Outlet` atau `Ambil Sendiri`.
- `context.colors`, `context.space`, `context.radius`, dan `context.typography` untuk token desain.

Untuk flow non-kurir, ganti kontrol kurir dengan satu section ringkas, misalnya:

- Header: `Datang ke Outlet`
- Deskripsi: `Layanan ini tidak tersedia untuk antar-jemput kurir. Antar pakaian kotor dan ambil pakaian bersih langsung di outlet.`
- Isi:
  - nama outlet,
  - alamat outlet,
  - jam operasional,
  - tombol petunjuk arah jika koordinat tersedia.

Pastikan tampilannya bukan hanya warning kuning. Buat lebih rapi seperti guided checkout state: jelas, tenang, dan actionable.

## File yang Perlu Dicek

- `lib/features/order/presentation/screens/order_summary_screen.dart`
- `lib/features/order/presentation/widgets/pickup_type_selector_widget.dart`
- `lib/features/order/presentation/widgets/delivery_type_selector_widget.dart`
- `lib/features/order/presentation/widgets/courier_pickup_section_widget.dart`
- `lib/features/order/presentation/widgets/courier_delivery_section_widget.dart`
- `lib/features/order/presentation/widgets/courier_fee_estimate_widget.dart`
- `lib/features/order/presentation/widgets/order_bottom_action_widget.dart`
- `lib/features/order/presentation/widgets/payment_method_selector_widget.dart`
- `lib/features/order/presentation/widgets/payment_method_summary_widget.dart`
- `lib/features/order/presentation/bloc/order_cubit.dart`
- `lib/features/order/presentation/bloc/order_state.dart`

## Acceptance Criteria

- Ketika cart berisi minimal satu layanan non-kurir:
  - Tidak ada input/pilihan alamat customer di order summary.
  - Tidak ada pilihan tanggal/jam pickup kurir.
  - Tidak ada opsi "Antar Kurir".
  - Tidak ada estimasi ongkir pickup/delivery.
  - UI menunjukkan bahwa customer harus datang langsung ke outlet.
  - Submit order mengirim `pickupType: 'self_dropoff'` dan `deliveryType: 'pickup'`.
- Ketika outlet tidak mendukung kurir:
  - Behavior sama dengan cart non-kurir.
- Ketika cart hanya berisi layanan yang mendukung kurir dan outlet mendukung kurir:
  - Flow kurir tetap tersedia seperti sebelumnya.
  - Address selector, schedule picker, dan estimasi ongkir tetap berjalan normal.
- Copy transfer di semua UI checkout tidak menyebut "Midtrans".
- Tampilan checkout non-kurir terasa modern, konsisten dengan design system, dan tidak seperti bug/alert sementara.

## Test Checklist

- Pilih layanan non-kurir dari outlet yang sebenarnya mendukung kurir.
- Buka ringkasan pesanan.
- Pastikan hanya flow datang ke outlet/ambil sendiri yang tampil.
- Submit order dan verifikasi payload.
- Pilih layanan yang mendukung kurir dari outlet yang mendukung kurir.
- Pastikan flow jemput/antar kurir masih bisa dipilih dan ongkir tetap dihitung.
- Pilih layanan dari outlet yang tidak mendukung kurir.
- Pastikan flow sama seperti layanan non-kurir.
- Pilih metode transfer dan pastikan tidak ada teks "Midtrans" di UI.
