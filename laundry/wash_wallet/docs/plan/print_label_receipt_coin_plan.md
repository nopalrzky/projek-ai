# Implementasi Fitur: Cetak Label/Nota dengan Pemakaian Coin Owner/Outlet

Tanggal: 2026-05-30  
Referensi User Need: `docs/user_need/print_label_receipt_coin_user_need.md`

---

## Latar Belakang

Fitur cetak label/nota saat ini di aplikasi **kasir** sudah ada namun flow-nya **salah**: printer dijalankan dulu baru coin dipotong (via `processReceipt`/`processLabel`). Sesuai user need, urutannya harus: **tampilkan info → konfirmasi → debit coin → cetak**.

Aplikasi **produksi** belum memiliki modul print sama sekali dan harus mendapat fitur yang setara.

---

## Instruksi Wajib untuk AI Model yang Mengeksekusi Plan Ini

Sebelum menulis kode apapun, baca terlebih dahulu semua spec berikut:

- `docs/spec/cubit_spec.md`
- `docs/spec/state_spec.md`
- `docs/spec/remote_datasource_spec.md`
- `docs/spec/repository_spec.md`
- `docs/spec/repository_impl_spec.md`
- `docs/spec/provider_spec.md`
- `docs/spec/usecase_spec.md`

Aturan kode wajib (tanpa pengecualian):

1. Selalu gunakan widget shared UI dari `wash_wallet_ui` — `AppButton`, `AppCard`, `AppBottomSheet`, `AppLoadingIndicator`, `AppErrorState`, `AppSnackbar`, dst.
2. Jangan hardcode warna — selalu gunakan `context.colors.*` dari theme extension.
3. Jangan hardcode spacing/radius — gunakan `context.space.*` dan `context.radius.*`.
4. Jangan ada comment di kode — clean code bicara sendiri.
5. Pecah widget ke file terpisah di folder `widgets/` — tidak boleh ada widget lebih dari ~80 baris per file.
6. Jangan duplikasi kode antara kasir dan produksi — struktur modul harus sama persis.

---

## Keputusan Desain

| Keputusan | Pilihan |
|---|---|
| ThermalPrinterService | Dipindah ke `packages/wash_wallet_core/lib/src/services/thermal_printer_service.dart` karena dipakai di 2 app |
| Trigger print | Gunakan `BlocListener` — listen `PrintReceiptReady` / `PrintLabelReady`, lalu panggil `ThermalPrinterService` |
| Kapan cetak di production | Hanya ketika status order `in_progress` atau `completed` (sudah ditimbang, sudah ada harga) — bukan `ready_to_process` |
| Konfirmasi sebelum debit | Coin dipotong hanya setelah user klik tombol konfirmasi di `PrintConfirmationSheet` |

---

## Analisis Gap

### Masalah di Cashier (yang perlu diperbaiki)

Flow saat ini di `print_modal.dart`:

```
User klik "Cetak" → printer jalan → processReceipt/processLabel (debit coin)
```

Flow yang benar (sesuai FR-04, FR-05):

```
User klik "Cetak" → tampil konfirmasi (biaya, sumber coin, sisa saldo) → User konfirmasi → debit coin → printer jalan
```

Masalah utama:
1. `print_modal.dart` adalah satu file 537 baris — harus dipecah ke widget-widget terpisah.
2. `PrintState` punya `PrintReceiptReady` dan `PrintLabelReady` yang seharusnya menjadi signal "debit berhasil, silakan print" — namun saat ini tidak digunakan dengan benar.
3. Tidak ada confirmation step yang jelas sebelum coin dipotong.

### Gap di Production

Aplikasi produksi tidak punya modul print sama sekali. Perlu dibuat dari awal dengan struktur yang sama seperti cashier.

---

## Proposed Changes

### 1. Shared Package — Pindahkan ThermalPrinterService

#### [MODIFY] `packages/wash_wallet_core/lib/src/services/thermal_printer_service.dart` [NEW]

Pindahkan `ThermalPrinterService` dan `PrintItemData` dari `apps/cashier/lib/core/services/thermal_printer_service.dart` ke shared package ini. Tidak ada perubahan logic.

#### [MODIFY] `packages/wash_wallet_core/lib/wash_wallet_core.dart`

Tambahkan export:

```dart
export 'src/services/thermal_printer_service.dart';
```

#### [DELETE] `apps/cashier/lib/core/services/thermal_printer_service.dart`

Hapus file lama di cashier setelah dipindah ke shared package.

Perbarui semua import di cashier yang merujuk ke file lama:
- `apps/cashier/lib/features/print/presentation/widgets/print_modal.dart`
- `apps/cashier/lib/main.dart` (jika ada `RepositoryProvider<ThermalPrinterService>`)

---

### 2. Cashier — Refactor State & Cubit

#### [MODIFY] `apps/cashier/lib/features/print/presentation/bloc/print_state.dart`

Tambah 2 state baru untuk flow konfirmasi:

| State | Kapan |
|---|---|
| `PrintConfirmingReceipt(PrintInfo info)` | User klik "Cetak Nota", menunggu konfirmasi user |
| `PrintConfirmingLabel(PrintInfo info)` | User klik "Cetak Label", menunggu konfirmasi user |

State lama yang tetap ada: `PrintInitial`, `PrintInfoLoading`, `PrintInfoLoaded`, `PrintReceiptProcessing`, `PrintLabelProcessing`, `PrintReceiptReady`, `PrintLabelReady`, `PrintError`.

#### [MODIFY] `apps/cashier/lib/features/print/presentation/bloc/print_cubit.dart`

Tambah method:

```dart
void requestReceipt(PrintInfo info) => emit(PrintConfirmingReceipt(info));
void requestLabel(PrintInfo info)   => emit(PrintConfirmingLabel(info));
void cancelConfirm(PrintInfo info)  => emit(PrintInfoLoaded(info));
```

Method `processReceipt` dan `processLabel` tetap: debit coin via backend → emit `PrintReceiptReady` / `PrintLabelReady`.

---

### 3. Cashier — Pecah print_modal.dart ke Widgets

#### [MODIFY] `apps/cashier/lib/features/print/presentation/widgets/print_modal.dart`

Jadikan hanya entry point `showPrintModal()` + orchestrator `_PrintSheet` yang tipis. Semua sub-UI didelegasikan ke widget terpisah.

`BlocListener` di `_PrintSheet` meng-handle:
- `PrintReceiptReady` → panggil `ThermalPrinterService.printReceiptFromData(...)`
- `PrintLabelReady` → panggil `ThermalPrinterService.printLabelFromData(...)`

#### [NEW] `apps/cashier/lib/features/print/presentation/widgets/print_order_info_card.dart`

Widget card info order: outlet, nomor order, nama pelanggan, kasir.

Input: `PrintInfo info`

#### [NEW] `apps/cashier/lib/features/print/presentation/widgets/print_coin_status_banner.dart`

Widget banner status coin (success/warning/error).

Menampilkan: icon + teks (sumber coin, harga, sisa saldo, atau pesan tidak cukup).

Input: `PrintCoinInfo coinInfo`

#### [NEW] `apps/cashier/lib/features/print/presentation/widgets/print_type_card.dart`

Widget card untuk satu opsi cetak (Nota atau Label).

Menampilkan:
- Icon + judul cetak
- `PrintCoinStatusBanner`
- Tombol "Cetak" (disabled jika `!coinInfo.canPrint`)

Input: `title`, `icon`, `PrintCoinInfo coinInfo`, `bool isDisabled`, `VoidCallback onPrint`

#### [NEW] `apps/cashier/lib/features/print/presentation/widgets/print_confirmation_sheet.dart`

Bottom sheet konfirmasi sebelum coin dipotong.

Menampilkan:
- Jenis cetak yang dipilih
- Biaya coin
- Sumber coin (outlet / owner)
- Sisa saldo setelah cetak
- Tombol "Konfirmasi Cetak" (dengan loading indicator saat proses)
- Tombol "Batal"

Coin baru dipotong setelah user klik konfirmasi — `cubit.processReceipt()` / `cubit.processLabel()` dipanggil di sini.

#### [NEW] `apps/cashier/lib/features/print/presentation/widgets/print_sheet_body.dart`

Widget body bottom sheet utama. Mengorkestrasi `PrintOrderInfoCard`, dua `PrintTypeCard`, dan tombol tutup.

#### [NEW] `apps/cashier/lib/features/print/presentation/widgets/widgets.dart`

Barrel file export semua widget di folder ini.

---

### 4. Production — Buat Modul Print Baru

Struktur identik dengan cashier. Layer data dan domain dapat dicopy karena endpoint dan entity sama.

#### Layer Core

- `[NEW]` `apps/production/lib/core/services/` — tidak perlu lagi, `ThermalPrinterService` sudah dari `wash_wallet_core`

#### Layer Data

- `[NEW]` `apps/production/lib/features/print/data/datasources/print_remote_datasource.dart`
- `[NEW]` `apps/production/lib/features/print/data/models/print_coin_info_model.dart` (+ `.freezed.dart`, `.g.dart`)
- `[NEW]` `apps/production/lib/features/print/data/models/print_info_model.dart` (+ `.freezed.dart`)
- `[NEW]` `apps/production/lib/features/print/data/models/print_order_item_model.dart` (+ `.freezed.dart`, `.g.dart`)
- `[NEW]` `apps/production/lib/features/print/data/repositories/print_repository_impl.dart`

#### Layer Domain

- `[NEW]` `apps/production/lib/features/print/domain/entities/print_coin_info.dart`
- `[NEW]` `apps/production/lib/features/print/domain/entities/print_info.dart`
- `[NEW]` `apps/production/lib/features/print/domain/entities/print_order_item.dart`
- `[NEW]` `apps/production/lib/features/print/domain/repositories/print_repository.dart`
- `[NEW]` `apps/production/lib/features/print/domain/usecases/get_print_info_usecase.dart`
- `[NEW]` `apps/production/lib/features/print/domain/usecases/process_receipt_usecase.dart`
- `[NEW]` `apps/production/lib/features/print/domain/usecases/process_label_usecase.dart`

#### Layer Presentation — Bloc

- `[NEW]` `apps/production/lib/features/print/presentation/bloc/print_state.dart`
- `[NEW]` `apps/production/lib/features/print/presentation/bloc/print_cubit.dart`

#### Layer Presentation — Provider

- `[NEW]` `apps/production/lib/features/print/presentation/providers/print_provider.dart`

#### Layer Presentation — Widgets

Identik dengan versi refactor di cashier:

- `[NEW]` `apps/production/lib/features/print/presentation/widgets/print_modal.dart`
- `[NEW]` `apps/production/lib/features/print/presentation/widgets/print_order_info_card.dart`
- `[NEW]` `apps/production/lib/features/print/presentation/widgets/print_coin_status_banner.dart`
- `[NEW]` `apps/production/lib/features/print/presentation/widgets/print_type_card.dart`
- `[NEW]` `apps/production/lib/features/print/presentation/widgets/print_confirmation_sheet.dart`
- `[NEW]` `apps/production/lib/features/print/presentation/widgets/print_sheet_body.dart`
- `[NEW]` `apps/production/lib/features/print/presentation/widgets/widgets.dart`

---

### 5. Wiring di Production

#### [MODIFY] `apps/production/lib/main.dart`

- Import `PrintProvider` dari `features/print/presentation/providers/print_provider.dart`
- Import `ThermalPrinterService` dari `wash_wallet_core`
- Tambah `printCubit` ke `AppDependencies`
- Tambah `BlocProvider<PrintCubit>.value(value: dependencies.printCubit)` ke `MultiBlocProvider`
- Daftarkan `ThermalPrinterService` sebagai `RepositoryProvider`

#### [MODIFY] `apps/production/lib/features/order/presentation/screens/show_order_screen.dart`

Aturan tampil tombol cetak di production:

```dart
final canPrint = status == 'in_progress' || status == 'completed';
```

Tombol cetak tidak muncul ketika `ready_to_process` (belum ditimbang, belum ada harga).

Tambahkan tombol cetak di `bottomBar` saat `canPrint == true`:

```dart
AppButton(
  label: 'Cetak',
  icon: Icons.print,
  onPressed: () => showPrintModal(context, orderId: order.id),
)
```

---

## Alur Flow Baru

```
[Kasir / Produksi]
User klik tombol cetak pada order
        │
        ▼
showPrintModal(context, orderId)
PrintCubit.getPrintInfo(orderId)  ──►  GET /orders/{id}/print/info
        │ PrintInfoLoaded
        ▼
PrintSheetBody tampil:
  • PrintOrderInfoCard
  • PrintTypeCard (Nota) + PrintTypeCard (Label)
        │
        ▼ User klik "Cetak Nota"
cubit.requestReceipt(info)  ──►  emit PrintConfirmingReceipt
        │
        ▼
PrintConfirmationSheet tampil (ringkasan biaya, sumber, sisa saldo)
        │
        ▼ User klik "Konfirmasi Cetak"
cubit.processReceipt(orderId)  ──►  POST /orders/{id}/print/receipt
        │ PrintReceiptReady
        ▼       
BlocListener di PrintSheet
  → ThermalPrinterService.printReceiptFromData(...)
        │
        ├─► Berhasil: AppSnackbar success, tutup sheet
        └─► Gagal: AppSnackbar error (coin sudah terpotong, print gagal)
```

---

## Verification Plan

### Cashier

- [ ] Modal terbuka, info order tampil benar
- [ ] Status coin (outlet/owner/tidak cukup) tampil sesuai kondisi
- [ ] Konfirmasi sheet muncul saat klik "Cetak" — coin belum terpotong
- [ ] Coin baru terpotong setelah klik "Konfirmasi Cetak"
- [ ] Printer berjalan hanya setelah debit berhasil (`PrintReceiptReady` / `PrintLabelReady`)
- [ ] Jika saldo tidak cukup, tombol disabled, pesan error muncul
- [ ] Tidak bisa klik ganda saat proses berjalan

### Production

- [ ] Semua poin di atas berlaku sama
- [ ] Tombol cetak tidak muncul saat status `ready_to_process`
- [ ] Tombol cetak muncul saat status `in_progress` atau `completed`
- [ ] `PrintCubit` terdaftar di `MultiBlocProvider`
- [ ] `ThermalPrinterService` dapat diakses via `context.read<ThermalPrinterService>()`

### Shared Package

- [ ] `ThermalPrinterService` berhasil diimport dari `wash_wallet_core` di kedua app
- [ ] File lama di cashier sudah dihapus
- [ ] Tidak ada import yang rusak setelah perpindahan
