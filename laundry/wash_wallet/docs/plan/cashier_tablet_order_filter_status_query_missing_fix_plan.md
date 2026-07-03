# Fix Plan: Filter Status Order Tablet Tidak Terkirim sebagai Query Param

Tanggal: 2026-06-30
Referensi Issue: `docs/issue/cashier_tablet_order_filter_status_query_missing_issue.md`

---

## 1. Ringkasan Masalah

Filter status order di halaman daftar order Cashier App tablet tidak menghasilkan query param `status` pada request API. Log menunjukkan URL tanpa `status` padahal user sudah memilih, misalnya, `Diajukan`.

Akar masalah adalah **non-atomic apply filter**: callback `onApply` di `IndexToolbar` memanggil `onFilterReset()` terlebih dahulu sebelum memanggil `onFilterApply()` satu per satu. Di `IndexOrdersScreen`, `onFilterReset` langsung memanggil `_loadData()`, sehingga request kosong (tanpa filter) terkirim sebelum request dengan filter yang benar.

Ada juga **bug sampingan** di `AppDropdown<T>`: opsi dengan value `null` (opsi "Semua") tidak bisa dipilih karena guard `if (selected != null)` mencegah `onChanged` dipanggil untuk nilai `null`.

---

## 2. Analisis Kode Saat Ini

### 2.1 Jalur Bug Utama: Apply di `IndexToolbar`

**File:** `packages/wash_wallet_ui/lib/src/components/data_view/index_toolbar.dart` (baris 65–71)

```dart
// KODE BERMASALAH SAAT INI
onApply: (applied) {
  widget.onFilterReset?.call();      // <-- memanggil _loadData() via onFilterReset
  for (final f in applied) {
    widget.onFilterApply?.call(f);  // <-- memanggil _loadData() per filter
  }
  setState(() => _isPanelOpen = false);
},
```

Urutan eksekusi yang terjadi saat user klik Terapkan dengan status = "Diajukan":

1. `onFilterReset()` dipanggil → `setState` reset semua filter → `_loadData()` → **request tanpa `status`** dikirim
2. `onFilterApply(ActiveFilter{filterId:'status', value:'requested'})` dipanggil → `setState` set `_selectedStatus = 'requested'` → `_loadData()` → **request dengan `status=requested`** dikirim
3. Karena tidak ada cancellation di `OrderCubit`, response (1) bisa tiba setelah (2) dan menimpa state list

### 2.2 Jalur Bug Sampingan: `AppDropdown<T>` Tidak Bisa Pilih Nilai `null`

**File:** `packages/wash_wallet_ui/lib/src/components/dropdown/app_dropdown.dart` (baris 75–77)

```dart
// KODE BERMASALAH SAAT INI
if (selected != null) {
  onChanged(selected);  // onChanged tidak pernah dipanggil jika selected == null
}
```

Opsi "Semua" (value `null`) tidak bisa dipilih via `AppDropdown`. Ini mempengaruhi filter status di mobile layout.

### 2.3 Kontrak `onFilterApply` yang Tidak Atomic di `IndexOrdersScreen`

**File:** `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart` (baris 373–400)

```dart
// KODE BERMASALAH: setiap onFilterApply langsung memanggil _loadData()
onFilterApply: (filter) {
  setState(() { ... });
  _loadData(); // <-- dipanggil N kali jika N filter di-apply
},
```

Jika `applied` berisi 3 filter, maka `_loadData()` dipanggil 3 kali dengan state parsial.

---

## 3. Solusi: Atomic Apply via Callback Baru

### Pendekatan

Ganti kontrak antara `IndexToolbar` ↔ `IndexOrdersScreen` dari:
- (lama) `onFilterApply(ActiveFilter)` dipanggil per filter + `onFilterReset()` dipanggil sebelumnya

Menjadi:
- (baru) `onFiltersChanged(List<ActiveFilter>)` dipanggil **sekali** dengan semua filter final yang harus diterapkan

`onFilterApply` dan `onFilterReset` tetap dipertahankan pada signature `IndexToolbar` untuk backward compatibility dengan halaman lain yang tidak pakai batch apply. Hanya `IndexOrdersScreen` yang menggunakan callback baru ini.

> **Alternatif yang lebih sederhana dan lebih aman (DIREKOMENDASIKAN)**: Ubah cara `IndexToolbar` memanggil callback saat Apply — jangan panggil `onFilterReset`, langsung panggil `onFilterApply` untuk setiap filter di `applied`. Di `IndexOrdersScreen`, pisahkan "set state only" dari "_loadData", dan hanya panggil `_loadData()` sekali di akhir.

Implementor boleh memilih salah satu pendekatan. Panduan keduanya ada di bawah.

---

## 4. Rincian Perubahan per File

---

### 4.1 `index_toolbar.dart` — MODIFY (KRITIS)

**Lokasi:** `packages/wash_wallet_ui/lib/src/components/data_view/index_toolbar.dart`

**Perubahan pada callback `onApply` di dalam `_IndexToolbarState.build()`:**

Hapus pemanggilan `widget.onFilterReset?.call()` dari jalur Apply. Cukup panggil `onFilterApply` untuk setiap filter di `applied`.

```dart
// SEBELUM (bermasalah)
onApply: (applied) {
  widget.onFilterReset?.call();      // BUG: memicu _loadData() prematur
  for (final f in applied) {
    widget.onFilterApply?.call(f);
  }
  setState(() => _isPanelOpen = false);
},

// SESUDAH (benar)
onApply: (applied) {
  for (final f in applied) {
    widget.onFilterApply?.call(f);
  }
  setState(() => _isPanelOpen = false);
},
```

**Alasan tidak memanggil `onFilterReset` dari Apply:**

`onFilterReset` didesain untuk "hapus semua filter dan reload". Ketika Apply ditekan, user ingin menerapkan set filter baru — bukan reset dulu lalu apply. Memindahkan tanggung jawab reset ke caller (`IndexOrdersScreen`) saat Apply jauh lebih bersih.

**Pertimbangan backward compatibility:**

Halaman lain yang memakai `AppDataView` dengan `singleSelect` menggunakan `onFilterApply` untuk apply satu filter dan langsung reload. Perubahan ini tidak merusak mereka karena:
- Untuk `singleSelect`, panel biasanya hanya mengembalikan satu `ActiveFilter` di `applied`.
- `onFilterReset` masih tersedia dan dipanggil dari tombol `onClearAll`.

---

### 4.2 `index_orders_screen.dart` — MODIFY (KRITIS)

**Lokasi:** `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`

**Tujuan:** Pastikan apply filter hanya memicu satu `_loadData()`, dan semua state sudah di-set lengkap sebelum `_loadData()` dipanggil.

#### 4.2.1 Tambah method `_applyFilters(List<ActiveFilter>)`

Tambahkan method baru yang menerima seluruh daftar filter yang telah diterapkan, set semua state dalam satu `setState`, lalu panggil `_loadData()` satu kali:

```dart
void _applyFilters(List<ActiveFilter> filters) {
  // Reset semua field filter terlebih dahulu
  String? newStatus;
  String? newPaymentStatus;
  String? newOrderDateFrom;
  String? newOrderDateTo;
  String? newEstimatedFrom;
  String? newEstimatedTo;
  double? newTotalMin;
  double? newTotalMax;

  // Isi nilai dari filter yang ada
  for (final filter in filters) {
    switch (filter.filterId) {
      case 'status':
        newStatus = filter.value as String?;
      case 'paymentStatus':
        newPaymentStatus = filter.value as String?;
      case 'orderDate':
        final v = filter.value as Map;
        newOrderDateFrom = v['from'] as String?;
        newOrderDateTo = v['to'] as String?;
      case 'estimatedCompletion':
        final v = filter.value as Map;
        newEstimatedFrom = v['from'] as String?;
        newEstimatedTo = v['to'] as String?;
      case 'totalAmount':
        final v = filter.value as Map;
        newTotalMin = v['min'] as double?;
        newTotalMax = v['max'] as double?;
    }
  }

  // Set semua state sekaligus
  setState(() {
    _selectedStatus = newStatus;
    _selectedPaymentStatus = newPaymentStatus;
    _orderDateFrom = newOrderDateFrom;
    _orderDateTo = newOrderDateTo;
    _estimatedCompletionFrom = newEstimatedFrom;
    _estimatedCompletionTo = newEstimatedTo;
    _totalAmountMin = newTotalMin;
    _totalAmountMax = newTotalMax;
  });

  // Satu kali load
  _loadData();
}
```

#### 4.2.2 Ubah `onFilterApply` menjadi "state only" (tanpa langsung `_loadData`)

`onFilterApply` sekarang hanya mengupdate state. `_loadData()` **tidak** dipanggil dari sini. `_loadData()` hanya dipanggil dari `_applyFilters()`.

Namun karena `IndexToolbar.onApply` akan memanggil `onFilterApply` per filter, kita perlu guard agar `_loadData()` hanya dipanggil setelah semua filter di-apply. Cara paling sederhana: ubah `onFilterApply` agar hanya update state (tanpa `_loadData()`), dan tambahkan `onFiltersApplied` callback terpisah untuk trigger reload.

**Solusi alternatif yang lebih bersih:** Tambah callback `onFiltersApplied` ke `IndexToolbar` yang dipanggil SETELAH semua `onFilterApply` selesai.

```dart
// Tambah ke IndexToolbar widget
final VoidCallback? onFiltersApplied;
```

Di `_IndexToolbarState.build()`:

```dart
onApply: (applied) {
  for (final f in applied) {
    widget.onFilterApply?.call(f);
  }
  widget.onFiltersApplied?.call();  // dipanggil sekali setelah semua apply
  setState(() => _isPanelOpen = false);
},
```

Di `IndexOrdersScreen`, `onFilterApply` hanya update state:

```dart
onFilterApply: (filter) {
  // Hanya update state, TIDAK memanggil _loadData()
  setState(() {
    switch (filter.filterId) {
      case 'status':
        _selectedStatus = filter.value as String?;
      case 'paymentStatus':
        _selectedPaymentStatus = filter.value as String?;
      case 'orderDate':
        final v = filter.value as Map;
        _orderDateFrom = v['from'] as String?;
        _orderDateTo = v['to'] as String?;
      case 'estimatedCompletion':
        final v = filter.value as Map;
        _estimatedCompletionFrom = v['from'] as String?;
        _estimatedCompletionTo = v['to'] as String?;
      case 'totalAmount':
        final v = filter.value as Map;
        _totalAmountMin = v['min'] as double?;
        _totalAmountMax = v['max'] as double?;
    }
  });
  // Tidak memanggil _loadData() di sini
},
onFiltersApplied: _loadData,  // dipanggil sekali setelah semua filter di-set
```

`onFilterRemove` (hapus satu pill) tetap memanggil `_loadData()` langsung karena hanya mengubah satu filter:

```dart
onFilterRemove: (filterId) {
  setState(() {
    switch (filterId) {
      case 'status': _selectedStatus = null;
      case 'paymentStatus': _selectedPaymentStatus = null;
      case 'orderDate':
        _orderDateFrom = null;
        _orderDateTo = null;
      case 'estimatedCompletion':
        _estimatedCompletionFrom = null;
        _estimatedCompletionTo = null;
      case 'totalAmount':
        _totalAmountMin = null;
        _totalAmountMax = null;
    }
  });
  _loadData();  // satu kali, state sudah selesai diupdate
},
```

`onFilterReset` tetap memanggil `_loadData()` langsung karena sudah reset semua:

```dart
onFilterReset: () {
  setState(() {
    _selectedStatus = null;
    _selectedPaymentStatus = null;
    _orderDateFrom = null;
    _orderDateTo = null;
    _estimatedCompletionFrom = null;
    _estimatedCompletionTo = null;
    _totalAmountMin = null;
    _totalAmountMax = null;
  });
  _loadData();  // satu kali
},
```

#### 4.2.3 Ringkasan alur setelah fix

```
User klik Terapkan (dengan status = 'requested')
  |
  v
FilterPanel._apply() -> widget.onApply([ActiveFilter{filterId:'status', value:'requested'}])
  |
  v
IndexToolbar: for each f in applied -> widget.onFilterApply?.call(f)
  |
  +-- onFilterApply({filterId:'status', value:'requested'})
  |     setState(() { _selectedStatus = 'requested'; })
  |     // TIDAK memanggil _loadData()
  |
  v
IndexToolbar: widget.onFiltersApplied?.call()
  |
  v
_loadData() dipanggil SEKALI
  |
  v
OrderCubit.getAll(status: 'requested', ...)
  |
  v
URL: ...?status=requested&outletId=1&... (BENAR)
```

---

### 4.3 `index_toolbar.dart` — MODIFY (tambah `onFiltersApplied`)

**Lokasi:** `packages/wash_wallet_ui/lib/src/components/data_view/index_toolbar.dart`

Tambah field `onFiltersApplied` ke `IndexToolbar`:

```dart
// Tambah ke constructor dan field IndexToolbar
final VoidCallback? onFiltersApplied;
```

Update `onApply` callback di `_IndexToolbarState`:

```dart
onApply: (applied) {
  for (final f in applied) {
    widget.onFilterApply?.call(f);
  }
  widget.onFiltersApplied?.call();  // NEW: satu panggilan setelah loop
  setState(() => _isPanelOpen = false);
},
```

**Backward compatibility:** `onFiltersApplied` bersifat nullable (`VoidCallback?`). Halaman lain yang belum memakai parameter ini tetap aman — tidak ada perubahan breaking.

---

### 4.4 `app_data_view.dart` — MODIFY (teruskan `onFiltersApplied`)

**Lokasi:** `packages/wash_wallet_ui/lib/src/components/data_view/app_data_view.dart`

Karena `IndexOrdersScreen` menggunakan `AppDataView`, field `onFiltersApplied` harus diteruskan dari `AppDataView` ke `IndexToolbar`.

```dart
// Tambah field ke AppDataView
final VoidCallback? onFiltersApplied;

// Teruskan ke IndexToolbar di build()
IndexToolbar(
  ...
  onFiltersApplied: onFiltersApplied,
)
```

---

### 4.5 `app_dropdown.dart` — MODIFY (bug sampingan)

**Lokasi:** `packages/wash_wallet_ui/lib/src/components/dropdown/app_dropdown.dart`

**Bug:** Opsi dengan value `null` tidak bisa dipilih karena guard `if (selected != null)`.

**Penyebab:** `AppBottomSheet.select<T>` mengembalikan `null` baik ketika user dismiss (cancel) maupun ketika user memilih item dengan value `null`. Ini membuat sulit membedakan "user cancel" vs "user pilih Semua".

**Solusi:**

Ubah tipe `onChanged` menjadi menerima nullable, dan gunakan sentinel `_unselected` untuk membedakan "tidak ada pilihan" vs "pilih null":

```dart
// Opsi 1 (minimal, aman untuk kasus ini):
// Panggil onChanged meskipun selected == null, tapi cek apakah
// user benar-benar memilih sesuatu (bukan sekadar dismiss).
// AppBottomSheet.select mengembalikan null jika dismissed.
// Jika item null adalah pilihan valid, gunakan Optional wrapper.
```

Karena mengubah tipe return `AppBottomSheet.select` bisa berdampak luas, gunakan pendekatan **minimal dan aman**:

Ubah signature `AppDropdown` agar `onChanged` menerima nullable:

```dart
// SEBELUM
final ValueChanged<T> onChanged;  // ValueChanged<T> = void Function(T)

// SESUDAH
final void Function(T? value) onChanged;
```

Lalu hapus guard `if (selected != null)`:

```dart
// SEBELUM
if (selected != null) {
  onChanged(selected);
}

// SESUDAH
onChanged(selected);  // dipanggil juga saat selected == null (user pilih "Semua")
```

> **Catatan penting:** Ini mengubah signature `onChanged`. Semua caller `AppDropdown` yang saat ini menggunakan `ValueChanged<T>` (non-nullable) perlu di-update menjadi `void Function(T?)`. Implementor harus mencari semua penggunaan `AppDropdown` di codebase dan memastikan signature callback-nya kompatibel. Gunakan `grep` untuk mencari: `AppDropdown<`.

Jika scope perubahan terlalu luas, alternatif lebih terbatas: buat `AppDropdown` dengan flag `allowNullSelection` tanpa mengubah signature utama.

---

## 5. Perubahan Opsional: Request Token di `OrderCubit` (Guard Race Condition)

Issue menyebutkan bahwa response lama bisa menimpa response terbaru. Ini adalah race condition yang muncul karena `OrderCubit` tidak membatalkan request sebelumnya.

**Pendekatan minimal (tanpa mengubah arsitektur cubit):**

Tambahkan counter request di `OrderCubit`. Jika response dari request lama datang saat sudah ada request yang lebih baru, abaikan response lama tersebut.

```dart
// Di OrderCubit
int _requestGeneration = 0;

Future<void> getAll({ ... }) async {
  final generation = ++_requestGeneration;
  emit(const OrderLoading());

  final result = await _getAllUsecase(...);

  // Abaikan jika sudah ada request lebih baru
  if (generation != _requestGeneration) return;

  result.when(
    success: (orders) => emit(OrdersLoaded(...)),
    failure: (failure) => emit(OrderError(failure.message)),
  );
}
```

**Prioritas:** Ini adalah fix pelengkap, bukan fix utama. Fix utama (Section 4.1–4.2) sudah menghilangkan race condition dari sumbernya (tidak mengirim request ganda). Request token hanyalah safety net tambahan dan bersifat opsional untuk tahap ini.

---

## 6. Urutan Pengerjaan

Dikerjakan secara berurutan:

1. **[1] `index_toolbar.dart`** — Tambah `onFiltersApplied` ke signature widget. Ubah `onApply` callback: hapus `widget.onFilterReset?.call()`, panggil `widget.onFiltersApplied?.call()` setelah loop.

2. **[2] `app_data_view.dart`** — Tambah `onFiltersApplied` sebagai field nullable, teruskan ke `IndexToolbar`.

3. **[3] `index_orders_screen.dart`** — Ubah `onFilterApply` agar hanya update state (hapus `_loadData()` dari dalamnya). Tambah `onFiltersApplied: _loadData`. Pastikan `onFilterRemove` dan `onFilterReset` masih memanggil `_loadData()`.

4. **[4] `app_dropdown.dart`** — Fix bug `null` value: ubah `onChanged` menjadi nullable-aware, hapus guard `if (selected != null)`. Update semua caller yang perlu disesuaikan.

5. **[5] `order_cubit.dart`** *(opsional)* — Tambah `_requestGeneration` counter sebagai safety net race condition.

---

## 7. Acceptance Criteria (Checklist Implementor)

- [ ] Memilih `Status Order = Diajukan` dan klik Terapkan menghasilkan **satu** request dengan `status=requested` di URL.
- [ ] Tidak ada request reset kosong (tanpa `status`) yang dikirim saat user klik Terapkan.
- [ ] Memilih beberapa filter sekaligus hanya memicu **satu** request dengan semua query param aktif.
- [ ] Active filter pills muncul sesuai filter yang diterapkan.
- [ ] Klik tombol Reset/Hapus Semua mengirim **satu** request tanpa filter opsional.
- [ ] Remove satu pill (×) mengirim **satu** request dengan filter tersisa.
- [ ] Response request lama tidak menimpa response filter terbaru (baik via fix race condition maupun karena tidak ada lagi double-request).
- [ ] Di mobile, opsi "Semua" pada `AppDropdown` dapat dipilih untuk clear filter (value `null` bisa dikirim ke `onChanged`).
- [ ] Semua halaman lain yang memakai `AppDataView` (customer, category, deposit, dll.) tetap berfungsi normal.
- [ ] Tidak ada perubahan pada backend API.

---

## 8. Dampak dan Risiko

| Risiko | Mitigasi |
|---|---|
| Perubahan signature `onFiltersApplied` di `AppDataView` bisa break halaman lain | Field nullable, default `null` — halaman lain tidak perlu mengisinya |
| Perubahan `AppDropdown.onChanged` ke nullable bisa break banyak caller | Cari semua `AppDropdown<` di codebase sebelum mengubah; update satu per satu |
| `setState` di `onFilterApply` dipanggil beberapa kali sebelum `_loadData()` | Flutter akan batch `setState` dalam satu frame — aman, tidak ada rebuild berlebih |
| Race condition jika user klik Terapkan berkali-kali cepat | Ditangani oleh request token di `OrderCubit` (opsional, tapi direkomendasikan) |

---

## 9. File Summary

| File | Aksi | Paket | Prioritas |
|---|---|---|---|
| `index_toolbar.dart` | MODIFY — hapus `onFilterReset` dari Apply, tambah `onFiltersApplied` | `wash_wallet_ui` | **KRITIS** |
| `app_data_view.dart` | MODIFY — teruskan `onFiltersApplied` ke `IndexToolbar` | `wash_wallet_ui` | **KRITIS** |
| `index_orders_screen.dart` | MODIFY — pisahkan state-update dari `_loadData()`, tambah `onFiltersApplied` | `cashier` | **KRITIS** |
| `app_dropdown.dart` | MODIFY — fix null value guard | `wash_wallet_ui` | Penting |
| `order_cubit.dart` | MODIFY — tambah request generation counter | `cashier` | Opsional |
