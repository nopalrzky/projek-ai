# 🛒 Cart Bug: Single-Active Cart (Gojek-style)

## Status: ✅ Completed

---

## Ringkasan Masalah

Saat ini sistem cart masih memiliki bug meskipun sebagian kode telah direfactor.
Aturan bisnisnya sederhana: **hanya boleh ada satu outlet aktif dalam satu keranjang pada satu waktu.**

| # | Bug yang Dilaporkan | Status |
|---|---------------------|--------|
| 1 | Layanan di outlet berbeda masih tampak aktif secara bersamaan | ✅ Fixed |
| 2 | Cart floating button muncul/tidak muncul tidak konsisten | ✅ Fixed |
| 3 | Ketika user menambah item dari outlet berbeda, tidak ada konfirmasi | ✅ Fixed |
| 4 | Setelah konfirmasi ganti outlet, item lama dari outlet sebelumnya masih bisa ikut ke order | ✅ Fixed |

---

## ⚠️ PENTING: Aturan Implementasi

> [!IMPORTANT]
> **Wajib gunakan komponen dari `wash_wallet_ui`** untuk semua UI baru.
> Jangan pernah membuat widget dialog atau button custom sendiri jika sudah ada di shared UI.
> Ini memastikan konsistensi tampilan di seluruh aplikasi.

### Komponen shared UI yang WAJIB digunakan:

| Kebutuhan | Komponen | Import |
|-----------|----------|--------|
| Dialog konfirmasi ganti outlet | `AppDialog.destructive(context, ...)` | `package:wash_wallet_ui/wash_wallet_ui.dart` |
| Tombol aksi | `AppButton.primary()`, `AppButton.danger()`, `AppButton.outline()` | `package:wash_wallet_ui/wash_wallet_ui.dart` |
| Card | `AppCard.elevated()` | `package:wash_wallet_ui/wash_wallet_ui.dart` |
| Warna | `context.colors.primary`, `context.colors.error`, dll | via `BuildContext` extension |
| Spacing | `context.space.md`, `context.space.lg`, dll | via `BuildContext` extension |
| Typography | `context.typography.bodyMedium`, dll | via `BuildContext` extension |

---

## Arsitektur yang Sudah Diimplementasikan (Perlu Diperbaiki)

### State yang Sudah Ada (`cart_state.dart`)

```dart
class CartState {
  final int? activeOutletId;
  final String? activeOutletName;
  final Set<int> activeServices; // layanan hanya untuk outlet aktif
}
```

### Metode CartCubit yang Sudah Ada (`cart_cubit.dart`)

```dart
enum AddServiceResult { added, alreadyExists, conflictOutlet }

// Metode yang sudah ada:
Future<AddServiceResult> addService(int serviceId, int outletId, String outletName)
Future<void> switchOutletAndAdd(int serviceId, int newOutletId, String newOutletName)
Future<void> removeFromCart(int serviceId)
Future<void> clearCart()
Future<void> clearAllCarts()
void setActiveOutlet(int outletId, String outletName)
```

---

## Bug Root Cause & Fix yang Dibutuhkan

### Bug 1 & 2: `SwitchOutletConfirmationDialog` — Tidak Menggunakan Shared UI

**File:** `apps/customer/lib/features/order/presentation/widgets/switch_outlet_confirmation_dialog.dart`

**Problem:** Dialog saat ini menggunakan `AlertDialog` Flutter biasa, bukan `AppDialog` dari `wash_wallet_ui`.

**Fix:** Hapus file `SwitchOutletConfirmationDialog` dan ganti pemanggilannya dengan:

```dart
// Di show_outlet_screen.dart, pada _onServiceTap():
final confirm = await AppDialog.destructive(
  context,
  title: 'Ganti Outlet?',
  message: 'Kamu masih memiliki pesanan aktif di "$activeOutletName".\n\n'
           'Menambahkan layanan dari "$currentOutletName" akan menghapus pesanan sebelumnya.',
  confirmLabel: 'Hapus & Ganti',
  cancelLabel: 'Batal',
);
```

---

### Bug 3: `setActiveOutlet()` Dipanggil Saat Build — Menyebabkan State Tertimpa

**File:** `apps/customer/lib/features/outlet/presentation/screens/show_outlet_screen.dart`

**Problem:** Di dalam `BlocConsumer.builder()`, ada pemanggilan `setActiveOutlet()` via `addPostFrameCallback`. Ini dipanggil **setiap kali state OutletDetailLoaded muncul**, termasuk saat re-render biasa. Ini menyebabkan `activeOutletId` berubah padahal user belum mengkonfirmasi.

```dart
// ❌ SALAH — ini ada di dalam builder() dan dieksekusi berulang
if (!cartState.hasItems || cartState.activeOutletId == widget.outletId) {
  WidgetsBinding.instance.addPostFrameCallback((_) {
    context.read<CartCubit>().setActiveOutlet(widget.outletId, state.outlet.name);
  });
}
```

**Fix:** `setActiveOutlet()` hanya boleh dipanggil **sekali** di `initState` melalui `BlocListener`, bukan di dalam `builder`:

```dart
// ✅ BENAR — gunakan BlocListener untuk side effect
BlocListener<OutletCubit, OutletState>(
  listener: (context, state) {
    if (state is OutletDetailLoaded) {
      // Hanya set jika cart kosong atau outlet sama
      final cartState = context.read<CartCubit>().state;
      if (!cartState.hasItems || cartState.activeOutletId == widget.outletId) {
        context.read<CartCubit>().setActiveOutlet(widget.outletId, state.outlet.name);
      }
    }
  },
)
```

---

### Bug 4: `isSelected` di `service_category_section.dart` — Sudah Benar, Perlu Verifikasi

Logika `isSelected` sudah benar:
```dart
final isSelected = cartState.activeOutletId == outletId 
                   && cartState.activeServices.contains(service.id);
```

Pastikan tidak ada tempat lain yang masih membaca dari `carts` Map lama.

---

## Urutan Fix yang Harus Dikerjakan

```
Step 1: Fix show_outlet_screen.dart
  ├── Pindahkan setActiveOutlet() dari builder() ke BlocListener
  └── Ganti SwitchOutletConfirmationDialog.show() dengan AppDialog.destructive()

Step 2: Hapus SwitchOutletConfirmationDialog widget (tidak diperlukan lagi)
  └── Gunakan AppDialog.destructive() langsung

Step 3: Verifikasi semua tempat tidak ada sisa penggunaan .carts Map lama
  └── grep: "carts[", ".carts", "clearCart(outletId)"

Step 4: Pastikan cart_floating_button.dart tampil dengan benar
  └── Harus muncul hanya ketika state.hasItems == true
  └── Pastikan trigger ke /order-summary dengan activeOutletId yang benar
```

---

## Edge Cases yang Harus Ditangani

| Skenario | Expected Behavior |
|----------|-------------------|
| Buka outlet A (cart kosong) | Set outlet aktif, tidak ada modal |
| Buka outlet A lagi (sudah ada cart A) | Cart tetap, tidak ada modal, item tetap selected |
| Buka outlet B (ada cart A) | **Tidak** set outlet aktif, item outlet A **tidak** hilang |
| Tap layanan di outlet B (ada cart A) | Tampil `AppDialog.destructive` |
| Konfirmasi ganti outlet | `switchOutletAndAdd()` → clear cart lama, set outlet B, add item |
| Batal dari dialog | Tidak ada perubahan, cart tetap di outlet A |
| App restart | `loadCart()` restore `activeOutletId` + `activeServices` dari SharedPreferences |
| Order berhasil dibuat | `clearCart()` → semua items dan outlet info terhapus |

> [!IMPORTANT]
> `setActiveOutlet()` di `ShowOutletScreen` **TIDAK BOLEH** otomatis menghapus cart.
> Reset hanya terjadi ketika user **secara eksplisit mengkonfirmasi** melalui dialog.

> [!NOTE]
> Selalu pass `outletName` dari `ShowOutletScreen` ke semua widget dan method yang membutuhkannya,
> agar nama outlet bisa ditampilkan di dialog konfirmasi tanpa fetch ulang ke API.
