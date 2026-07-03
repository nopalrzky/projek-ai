# Cashier & Production Tablet Responsive Follow-up Plan

## Tujuan

Perbaiki 13 issue tablet sebagai satu follow-up terkoordinasi: shared UI foundation dulu, lalu Cashier table/detail/dialog, lalu Production responsive layout.

Keputusan produk:
- Cashier tablet diseragamkan ke pola two-pane.
- Production order tetap memakai modal detail, bukan master-detail baru.
- Tidak ada perubahan API backend, route schema, atau permission model.

## Catatan Workspace

Turn sebelumnya sempat mengubah sebagian file sebelum dihentikan. Jangan revert otomatis. Model pelaksana berikutnya harus mulai dengan `git diff` dan memvalidasi apakah perubahan parsial sudah benar, perlu dilanjutkan, atau perlu dirapikan.

## Urutan Implementasi

1. Shared UI foundation.
2. Cashier table density, detail two-pane, dan delete dialog.
3. Cashier silent fetch untuk embedded detail panel.
4. Production responsive home, order grid, dialog, login/PIN, dan profile layout.
5. Test dan verifikasi.

## Shared UI Changes

### AppDensity

Tambahkan helper responsif di `AppDensity`:
- `modeForSizeClass(WindowSizeClass)`: `compact`/`medium` -> `AppDensityMode.compact`, `expanded`/`large` -> `standard`.
- Token row action:
  - `tableRowActionSize`: 44 compact, 48 standard.
  - `tableRowActionGap`: 4 compact, 8 standard.
- Token order row kaya:
  - `tableRichRowHeight(mode, {required bool condensed})`.
  - Pindahkan nilai row height lama dari `IndexOrdersScreen` ke token density.

### AppDataView / AppDataTable

Ubah default table agar tidak memakai literal `56.0` dan `0.0`:
- `rowHeight` default dari `AppDensity.tableRowHeight(resolvedMode)`.
- `columnGap` default dari `AppDensity.tableColumnGap(resolvedMode)`.
- Tambahkan `densityMode` opsional di `AppDataView`.
- Tambahkan `twoLineRows` opsional di `AppDataView`.
- Row action `AppDataTable` memakai token touch target baru, termasuk lebar kolom aksi dan spacing antar tombol.

### ResponsiveGrid

Perluas `ResponsiveGrid`:
- Tambahkan `maxColumns`.
- Tambahkan static/helper `columnsFor(...)`.
- Grid dashboard dan grid order memakai helper ini agar breakpoint konsisten tanpa switch manual di screen.

### AppDialogLayout

Tambahkan max-width responsif:
- `confirmationMaxWidth` untuk dialog pendek.
- `formMaxWidth` untuk login/PIN.
- `detailMaxWidth` untuk detail order Production.
- Nilai dihitung dari `WindowSizeClass` dan token spacing, bukan literal di screen.

### OperationalTopHeader

Ubah header:
- Search max-width responsif.
- Teks user tampil mulai breakpoint resmi `medium`.
- Hilangkan threshold lokal `900`.

### OperationalTabletShell

Ubah sidebar:
- Default `medium` tetap collapsed.
- Toggle tampil di semua non-compact.
- Gunakan override nullable: `collapsed = userOverride ?? isMedium`, supaya user medium bisa expand manual.
- Tambahkan komentar singkat di shell/config bahwa `secondaryBody` reserved untuk panel app-level, bukan pola yang dipaksakan untuk order Production.

## Cashier Changes

### Table Density

Migrasikan tabel berikut ke density responsif:
- Order: pakai `AppDensity.tableRichRowHeight(...)` dan default `columnGap`.
- Customer: `twoLineRows: true`, tanpa hardcoded `AppDensityMode.compact`.
- Category, Unit, Laundry Service: pakai default single-line row height dan default column gap.

### Delete Dialog

Ganti delete confirmation `AlertDialog` dengan `AppDialog.destructive` pada:
- Category.
- Customer.
- Laundry Service.
- `index_laundry_services_screen.dart`.
- `show_laundry_service_screen.dart`.

### Tablet Detail Pattern

Seragamkan pola detail tablet menjadi two-pane:
- Category dan Laundry Service:
  - Row tap dan action "Lihat" memilih item di panel kanan.
  - Jangan `context.push(...)` pada tablet.
- Unit:
  - Tambahkan selected-row state.
  - Tambahkan row tap, highlight, dan detail panel ringan berbasis data `Unit` yang sudah ada di list.
  - Jangan tambah route baru karena `show_unit_screen.dart` belum ada.
- Order dan Customer:
  - Tetap two-pane.
  - Rapikan density dan row action agar konsisten.

### Embedded Detail Fetching

Untuk embedded detail panel, jangan memanggil `getById` yang menimpa state list utama.

Tambahkan silent fetch:
- `CategoryCubit.fetchCategorySilently(...)`.
- `LaundryServiceCubit.fetchLaundryServiceSilently(...)`.
- `CustomerCubit.fetchCustomerSilently(...)`.

Detail embedded memakai state lokal:
- loading.
- error.
- entity.

Aksi delete/update tetap boleh lewat cubit utama. Setelah sukses, parent clear selected id dan reload current list.

### Detail Header

Panel detail embedded memakai header panel sederhana plus close button.

Standalone route Category/Laundry Service tetap memakai `PageContentHeader`.

## Production Changes

### Home

- Home dashboard non-compact dibungkus `ContentConstraint`, mengikuti pola Profile.
- `ProductionSummaryCard` mengganti `GridView.count(crossAxisCount: 2)` dengan `ResponsiveGrid(maxColumns: 4)`.

### Orders

Order Queued dan In Progress memakai satu widget/helper shared untuk tablet:
- Compact tetap `ListView.separated`.
- Tablet memakai layout multi-kolom berbasis `ResponsiveGrid.columnsFor`.
- Medium 2 kolom, expanded/large 3 kolom.
- Gunakan `Wrap` atau width-calculated cards agar tinggi kartu tidak terpotong oleh fixed grid extent.
- Pagination tetap di bawah collection.

`OrderItemCard` dibuat aman untuk grid:
- Teks panjang `ellipsis`/`maxLines`.
- Tombol proses tidak overflow.
- Notes tidak memaksa kartu terlalu tinggi.

Production tetap memakai modal detail order. Jangan memakai `OperationalTabletShell.secondaryBody` dalam scope ini.

### Dialogs And Auth

Gunakan helper `AppDialogLayout`:
- `OrderDetailDialog` memakai `detailMaxWidth`.
- `LoginScreen` memakai `formMaxWidth`.
- `PinSetupPromptScreen` memakai `formMaxWidth`.

Hilangkan literal `500`, `420`, dan `480` dari screen terkait.

### Profile

`ProfileSettingScreen` non-compact memakai form 2 kolom:
- Baris 1: Nama Lengkap | Email.
- Baris 2: No. Handphone | Jenis Kelamin.
- Alamat tetap full width.
- Compact tetap satu kolom.

## Test Plan

Tambahkan widget/unit test di `packages/wash_wallet_ui` untuk:
- `AppDensity.modeForSizeClass`.
- Default `AppDataView/AppDataTable` menghasilkan `columnGap > 0`.
- Row action target size 44/48 sesuai density.
- `ResponsiveGrid.columnsFor` dan `maxColumns`.
- `OperationalTabletShell` medium default collapsed tetapi toggle bisa expand.
- `OperationalTopHeader` tidak lagi memakai threshold 900.

Tambahkan/ubah test Cashier bila praktis:
- Minimal memastikan silent fetch cubit tidak emit state list.

## Verification

Jalankan:
- `dart format` pada file yang diubah.
- `flutter analyze packages/wash_wallet_ui`.
- `flutter analyze apps/cashier`.
- `flutter analyze apps/production`.
- `flutter test packages/wash_wallet_ui`.
- `flutter test apps/cashier` bila perubahan cubit/detail panel ditest.

Manual visual checklist:
- Cashier Order/Customer/Category/Unit/Laundry Service pada 600, 840, 1200px.
- Production Home, Orders, Profile, Login, PIN Prompt pada 600, 840, 1200px.
- Compact mobile untuk Cashier dan Production tidak berubah.
