# Issue: Filter Status Order Tablet Tidak Terkirim sebagai Query Param

Tanggal: 2026-06-30

Dokumen ini adalah hasil debug awal untuk bug filter order cashier tablet. Dokumen ini dimaksudkan sebagai acuan bagi AI model lain saat menyusun implementation plan, bukan sebagai implementasi fix.

## Ringkasan

Saat user mencoba menerapkan filter status order, misalnya `Diajukan`, request API yang terlihat di log tidak membawa query param `status`.

Log yang dilaporkan:

```text
I/flutter ( 3199): URL: http://10.0.2.2:8000/api/mobile/cashier/orders?page=1&perPage=15&sortBy=orderDate&sortDirection=desc&outletId=1
```

Expected minimal ketika filter `Diajukan` diterapkan:

```text
http://10.0.2.2:8000/api/mobile/cashier/orders?page=1&perPage=15&sortBy=orderDate&sortDirection=desc&status=requested&outletId=1
```

## Area yang Direview

File yang relevan:

1. `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`
2. `packages/wash_wallet_ui/lib/src/components/data_view/index_toolbar.dart`
3. `packages/wash_wallet_ui/lib/src/components/data_view/filter_panel.dart`
4. `packages/wash_wallet_ui/lib/src/components/data_view/models/filter_config.dart`
5. `apps/cashier/lib/features/order/presentation/bloc/order_cubit.dart`
6. `apps/cashier/lib/features/order/data/datasources/order_remote_datasource.dart`
7. `packages/wash_wallet_ui/lib/src/components/dropdown/app_dropdown.dart`

## Temuan Debug

### 1. Datasource sudah benar jika `status` non-null

`OrderRemoteDatasourceImpl.getAll()` sudah menambahkan query param `status` jika argumen `status` tidak null:

```dart
if (status != null) 'status': status,
```

Artinya URL tanpa `status` bukan berasal dari mapping query datasource, tetapi karena nilai `status` yang masuk ke datasource masih `null`.

### 2. `IndexOrdersScreen._loadData()` sudah meneruskan `_selectedStatus`

`_loadData()` memanggil:

```dart
context.read<OrderCubit>().getAll(
  outletId: widget.outletId,
  search: _searchController.text,
  status: _selectedStatus,
  ...
);
```

Jika `_selectedStatus == 'requested'`, datasource seharusnya mengirim `status=requested`.

### 3. Sumber masalah paling kuat ada di alur Apply filter tablet

Di `IndexToolbar`, callback `FilterPanel.onApply` saat ini melakukan:

```dart
onApply: (applied) {
  widget.onFilterReset?.call();
  for (final f in applied) {
    widget.onFilterApply?.call(f);
  }
  setState(() => _isPanelOpen = false);
},
```

Masalahnya: `onFilterReset` di `IndexOrdersScreen` bukan hanya reset state, tetapi juga langsung memanggil `_loadData()`.

Akibatnya, satu klik `Terapkan` dapat menghasilkan request berurutan:

1. Request pertama dari `onFilterReset()` dengan semua filter kosong.
2. Request berikutnya dari `onFilterApply()` dengan filter yang diterapkan.

Request pertama persis menjelaskan log yang dilaporkan: URL hanya berisi `page`, `perPage`, `sortBy`, `sortDirection`, dan `outletId`, tanpa `status`.

Karena `OrderCubit.getAll()` tidak punya request cancellation, request reset/partial bisa selesai setelah request filtered dan menimpa state list order. Ini bisa membuat UI terlihat seperti filter tidak diterapkan walaupun request filtered sempat dikirim.

### 4. Apply multi-filter juga berpotensi mengirim request parsial

`IndexToolbar` memanggil `onFilterApply` satu per satu untuk setiap `ActiveFilter`.

Di `IndexOrdersScreen`, setiap `onFilterApply` langsung:

1. update satu field state,
2. memanggil `_loadData()`.

Jika user apply beberapa filter sekaligus, request bisa menjadi:

1. request tanpa filter,
2. request hanya status,
3. request status + payment status,
4. request status + payment status + tanggal,
5. dan seterusnya.

Ini membuat behavior batch apply tidak atomic dan rawan race condition.

### 5. `FilterPanel` kemungkinan membentuk value status dengan benar

Untuk `FilterType.singleSelect`, `FilterPanel` menyimpan value chip ke `_pendingValues[config.id]`.

Saat user memilih `Diajukan`, option value dari `IndexOrdersScreen` adalah `requested`, sehingga `applied` seharusnya berisi:

```dart
ActiveFilter(
  filterId: 'status',
  value: 'requested',
)
```

Jika tidak ada request kedua dengan `status=requested`, perlu tambahkan logging sementara di `FilterPanel._apply()` dan `IndexOrdersScreen.onFilterApply` untuk memastikan `applied` tidak kosong.

### 6. Bug sampingan pada mobile dropdown clear filter

`AppDropdown<T>` hanya memanggil `onChanged(selected)` jika `selected != null`:

```dart
if (selected != null) {
  onChanged(selected);
}
```

Sementara opsi `Semua` untuk status memiliki value `null`. Ini membuat user tidak bisa memilih `Semua` untuk clear filter melalui dropdown. Ini bukan penyebab utama URL tanpa `status=requested`, tetapi masih relevan untuk stabilitas filter.

## Dugaan Akar Masalah

Akar masalah utama adalah desain callback filter yang tidak atomic:

1. Apply filter memanggil reset terlebih dahulu.
2. Reset langsung melakukan network request.
3. Filter diterapkan satu per satu, masing-masing juga melakukan network request.
4. Tidak ada cancellation atau guard terhadap response lama.

Hasilnya, request tanpa query param filter muncul dan berpotensi mengalahkan request filtered.

## Dampak

1. User melihat filter status tidak bekerja.
2. Log API menunjukkan request tanpa `status`, membingungkan saat debugging.
3. Data list order bisa kembali ke kondisi unfiltered karena race response.
4. Batch filter date/nominal/payment status berpotensi tidak konsisten.
5. Network request menjadi berlebih.

## Panduan untuk Plan Fix

Plan berikutnya sebaiknya mengarah ke apply filter yang atomic:

1. Jangan panggil `onFilterReset()` dari jalur Apply.
2. Pisahkan callback `reset state only` dari `reset and reload`, atau hindari reset sama sekali saat apply.
3. Ubah kontrak toolbar/panel agar parent menerima semua filter applied sekaligus, bukan satu per satu.
4. Di `IndexOrdersScreen`, set semua state filter dalam satu `setState`, lalu panggil `_loadData()` satu kali.
5. Untuk clear all, reset semua filter dan panggil `_loadData()` satu kali.
6. Untuk remove single filter pill, reset satu filter dan panggil `_loadData()` satu kali.
7. Pertimbangkan request token/counter di `OrderCubit` agar response lama tidak menimpa response terbaru.
8. Tambahkan logging sementara untuk membuktikan nilai status pada titik:
   - `FilterPanel._apply()`
   - `IndexToolbar.onApply`
   - `IndexOrdersScreen.onFilterApply`
   - `OrderCubit.getAll`
   - `OrderRemoteDatasourceImpl.getAll`

## Acceptance Criteria untuk Fix

1. Memilih `Status Order = Diajukan` menghasilkan satu request utama dengan `status=requested`.
2. Tidak ada request reset kosong yang dikirim saat user menekan `Terapkan`.
3. Apply beberapa filter hanya memicu satu request dengan semua query param yang aktif.
4. Active filter pills muncul sesuai filter yang diterapkan.
5. Clear all mengirim satu request tanpa filter opsional.
6. Remove satu pill mengirim satu request dengan filter tersisa.
7. Response lama tidak boleh menimpa response filter terbaru.
8. Jika mobile dropdown tetap dipakai, opsi `Semua` harus bisa mengirim `null` untuk clear filter.

## Status Debug

Bug belum diperbaiki di kode. Hasil debug menunjukkan datasource sudah siap, dan masalah utama berada di orchestration apply/reset filter pada UI tablet.
