# Refactor: Cart UX — Gojek-Style Single Active Cart + Service Detail Bottom Sheet

## Latar Belakang

Perubahan ini merefaktor alur interaksi di halaman outlet agar lebih intuitif, mengacu pada UX Gojek:
1. **Single active cart** — hanya 1 outlet yang bisa aktif di cart. Jika user menambah item dari outlet lain, muncul konfirmasi dialog.
2. **Tanpa modal konfirmasi saat tambah item** — item langsung ditambah ke cart (tanpa modal "Apakah Anda ingin menambahkan?").
3. **Tap service card → tampilkan detail modal** — ketika service ditekan, tampil bottom sheet berisi detail layanan + tombol "Tambah ke Pesanan" dan "Hapus dari Pesanan".

---

## User Review Required

> [!IMPORTANT]
> Pastikan Anda setuju dengan keputusan desain berikut sebelum eksekusi:
> - Konfirmasi ganti outlet menggunakan `AppDialog.destructive` (sudah ada di shared UI).
> - Detail layanan menggunakan `AppBottomSheet.action` dari `wash_wallet_ui`.
> - `CartState` dikembalikan ke struktur **single-outlet** (seperti sebelum perubahan user tadi), yaitu hanya `Set<int> cartItems` + `int? outletId`. Struktur `Map<int, Set<int>> carts` dihapus.
> - Tidak ada perubahan pada backend / API.

---

## Proposed Changes

### 1. CartState & CartCubit (State Management)

#### [MODIFY] [cart_state.dart](file:///c:/Bimo/Project/wash_wallet/apps/customer/lib/features/order/presentation/bloc/cart_state.dart)
- Revert ke struktur sederhana: `Set<int> cartItems` + `int? outletId` (hapus `Map<int, Set<int>> carts` dan `activeOutletId`).
- Tambah getter `hasItems`, `totalItems`.

#### [MODIFY] [cart_cubit.dart](file:///c:/Bimo/Project/wash_wallet/apps/customer/lib/features/order/presentation/bloc/cart_cubit.dart)
- `addService(int serviceId, int outletId)`: cek apakah `outletId` berbeda dari cart aktif. Jika beda, **tidak langsung** clear — emit state baru dan biarkan UI menangani konfirmasi.
- Tambah method `switchOutletAndAdd(int serviceId, int outletId)`: clear cart lama lalu tambah item baru (dipanggil setelah user konfirmasi).
- `clearCart()`: tanpa argumen (cukup set ulang ke empty).
- `removeFromCart(int serviceId)`: tanpa argumen `outletId`.

---

### 2. Service Detail Bottom Sheet (Widget Baru)

#### [NEW] [service_detail_bottom_sheet.dart](file:///c:/Bimo/Project/wash_wallet/apps/customer/lib/features/order/presentation/widgets/service_detail_bottom_sheet.dart)
- Widget standalone yang menerima `LaundryService`, `int outletId`, dan `bool isInCart`.
- Menggunakan `AppBottomSheet.action` sebagai wrapper.
- Menampilkan:
  - Ikon / ilustrasi layanan
  - Nama, harga, durasi, minimum quantity, deskripsi
  - Jika `isInCart = false`: tombol **"Tambah ke Pesanan"** (primary).
  - Jika `isInCart = true`: tombol **"Hapus dari Pesanan"** (danger) + label "Sudah ditambahkan".
- Ketika "Tambah ke Pesanan" ditekan:
  - Cek `cartCubit.state.outletId`. Jika `null` atau sama dengan `outletId` → langsung `addService`.
  - Jika beda → tampilkan `AppDialog.destructive` konfirmasi ganti outlet → jika ya, `switchOutletAndAdd`.
- Semua warna/tipografi dari `context.colors`, `context.typography`, `context.space`.

---

### 3. ServiceCard (Simplifikasi)

#### [MODIFY] [service_card.dart](file:///c:/Bimo/Project/wash_wallet/apps/customer/lib/features/outlet/presentation/widgets/service_card.dart)
- Hapus prop `onRemove` — remove action dipindah ke detail bottom sheet.
- Tetap ada `isSelected` untuk indikator visual di card.
- `onTap` selalu memanggil `onServiceTap(service)` → yang akan membuka `ServiceDetailBottomSheet`.

---

### 4. ShowOutletScreen & ServiceCategorySection (Update)

#### [MODIFY] [show_outlet_screen.dart](file:///c:/Bimo/Project/wash_wallet/apps/customer/lib/features/outlet/presentation/screens/show_outlet_screen.dart)
- `_onServiceTap(service)` sekarang membuka `ServiceDetailBottomSheet` (bukan `AddToCartBottomSheet`).
- Hapus penggunaan `setActiveOutlet`.

#### [MODIFY] [service_category_section.dart](file:///c:/Bimo/Project/wash_wallet/apps/customer/lib/features/outlet/presentation/widgets/service_category_section.dart)
- Update `isSelected` menggunakan `cartState.cartItems.contains(service.id)`.
- Hapus `onRemove` dari `ServiceCard` call.

---

### 5. File Dihapus

#### [DELETE] [add_to_cart_bottom_sheet.dart](file:///c:/Bimo/Project/wash_wallet/apps/customer/lib/features/order/presentation/widgets/add_to_cart_bottom_sheet.dart)
- Digantikan sepenuhnya oleh `ServiceDetailBottomSheet`.

---

### 6. OrderSummaryScreen & AppRouter (Update Minor)

#### [MODIFY] [order_summary_screen.dart](file:///c:/Bimo/Project/wash_wallet/apps/customer/lib/features/order/presentation/screens/order_summary_screen.dart)
- Kembalikan referensi ke `cartState.cartItems` (bukan `activeCartItems`).
- `clearCart()` tanpa argumen.

#### [MODIFY] [app_router.dart](file:///c:/Bimo/Project/wash_wallet/apps/customer/lib/core/router/app_router.dart)
- Kembalikan referensi ke `cartState.outletId` (bukan `activeOutletId`).

---

## Catatan Penting untuk AI yang Mengerjakan

> [!IMPORTANT]
> **Sebelum menulis kode apapun, baca panduan ini terlebih dahulu:**
>
> 1. **Selalu gunakan App Theme** — Semua warna via `context.colors.*`, tipografi via `context.typography.*`, spacing via `context.space.*`, radius via `context.radius.*`. **Jangan hardcode nilai warna/font/padding**.
> 2. **Gunakan shared components dari `wash_wallet_ui`** — Dialog konfirmasi ganti outlet wajib menggunakan `AppDialog.destructive`. Bottom sheet detail layanan wajib menggunakan `AppBottomSheet.action` atau `AppBottomSheet.show`. Jangan buat custom dialog dengan `showDialog()` manual.
> 3. **Gunakan `AppCard`, `AppButton`, `AppLoadingIndicator`, `AppEmptyState`, dll** dari paket shared. Jangan buat widget duplikat.
> 4. **Jangan modifikasi file di `packages/`** kecuali benar-benar diperlukan.

---

## Verification Plan

### Automated
- Pastikan `flutter analyze` tidak mengeluarkan error.

### Manual Flows
1. Buka outlet A → tap layanan → bottom sheet detail muncul → tap "Tambah" → item masuk cart (cart button muncul).
2. Tap layanan yang sudah ada di cart → bottom sheet detail muncul dengan label "Sudah ditambahkan" + tombol "Hapus dari Pesanan".
3. Pergi ke outlet B → tap layanan → bottom sheet muncul → tap "Tambah" → muncul `AppDialog.destructive` konfirmasi → pilih "Ya" → cart lama bersih, item baru masuk.
4. Tap "Lanjut ke Pemesanan" → `OrderSummaryScreen` menampilkan items dengan benar.
