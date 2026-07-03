# Implementation Plan: Redesign Filter Order Tablet Cashier

Tanggal: 2026-06-30
Referensi User Need: `docs/user_need/cashier_tablet_order_filter_redesign_user_need.md`

---

## 1. Latar Belakang

Halaman daftar order pada Cashier App versi tablet saat ini menggunakan satu filter `status` bertipe `singleSelect`, dan panel filter dibuka lewat `showModalBottomSheet` — pola yang terasa mobile-first dan tidak optimal untuk tablet. Kebutuhan ini meredesain filter menjadi panel inline di bawah toolbar, menambah input untuk `paymentStatus`, date range (`orderDate`, `estimatedCompletion`), dan number range (`totalAmount`), serta menyambungkan semua filter tersebut ke `OrderCubit.getAll()`.

---

## 2. Keputusan Teknis Utama

### 2.1 Panel Inline vs. Modal

| Pendekatan | Konsekuensi |
|---|---|
| Tetap `showModalBottomSheet` | Tidak memenuhi kebutuhan — terasa mobile |
| Inline panel (animated) per-widget | Aman untuk halaman lain yang pakai `AppDataView` |
| Overlay/Popup dropdown | Lebih kompleks, risiko overflow di portrait |

**Keputusan: Inline animated panel.**
`IndexToolbar` dikonversi menjadi `StatefulWidget`. Saat tombol Filter ditekan, panel muncul di bawah bar utama dengan animasi `AnimatedSize`. Panel mendorong konten di bawahnya (push down), bukan overlay. Karena `IndexToolbar` adalah `StatelessWidget` saat ini, perubahan menjadi `StatefulWidget` adalah perubahan minimal yang diperlukan.

### 2.2 Backward Compatibility `IndexToolbar` / `AppDataView`

Halaman lain (customer, category, deposit, expense, dll.) memakai `AppDataView` hanya dengan `FilterType.singleSelect`. Strategi:

- Panel inline hanya aktif jika `filterConfigs.isNotEmpty`.
- Semua tipe filter yang belum dirender di halaman lain masih di-skip (fallback `SizedBox.shrink()`), sehingga tidak rusak.
- Tidak ada perubahan pada signature `AppDataView` dan `IndexToolbar` — hanya menambah fungsionalitas.

### 2.3 Behavior Apply Filter

**Keputusan: Batch apply (disukai user need).**
Panel menyimpan state sementara (`_pendingFilters`). Tombol Apply mengkomit state ke induk, Cancel membuang state sementara, Clear All mengosongkan semua filter di panel.

### 2.4 State Filter di `IndexOrdersScreen`

`IndexOrdersScreen` saat ini hanya menyimpan `_selectedStatus`. Diperlukan state tambahan untuk semua parameter filter baru. State ini dikelola di `_IndexOrdersScreenState` — tidak memerlukan BLoC/Cubit baru.

### 2.5 Outlet

Outlet diperlakukan sebagai konteks single-outlet aktif dari `widget.outletId`. Tidak ada dropdown outlet yang ditambahkan. `outletId` tetap dikirim secara implisit ke `OrderCubit.getAll()`.

### 2.6 Format Tanggal

Format `YYYY-MM-DD` (ISO 8601) dipakai untuk parameter API `orderDateFrom`, `orderDateTo`, `estimatedCompletionFrom`, `estimatedCompletionTo`.

### 2.7 Validasi Nominal

`totalAmountMin` dan `totalAmountMax` hanya dikirim jika tidak kosong dan nilainya valid (non-negatif, min <= max).

---

## 3. Arsitektur Perubahan

```
packages/wash_wallet_ui/
  lib/src/components/data_view/
    index_toolbar.dart          <- MODIFY (StatefulWidget + inline panel)
    filter_panel.dart           <- NEW (widget panel terpisah)
    models/
      filter_config.dart        <- MODIFY (tambah fromHint & toHint)
      active_filter.dart        <- (no change)
      filter_option.dart        <- (no change)

apps/cashier/
  lib/features/order/
    presentation/
      screens/
        index_orders_screen.dart  <- MODIFY (filter state + wiring cubit)
```

---

## 4. Rincian Perubahan per File

---

### 4.1 `filter_config.dart` — MODIFY

**Lokasi:** `packages/wash_wallet_ui/lib/src/components/data_view/models/filter_config.dart`

Tambahkan field opsional untuk mendukung rendering input hint dan format pada `dateRange` dan `numberRange`:

```dart
class FilterConfig {
  final String id;
  final String label;
  final FilterType type;
  final List<FilterOption> options;
  final bool optional;

  // NEW: hint untuk input text/number
  final String? fromHint;   // contoh: 'Dari tanggal', 'Min nominal'
  final String? toHint;     // contoh: 'Sampai tanggal', 'Max nominal'

  const FilterConfig({
    required this.id,
    required this.label,
    required this.type,
    this.options = const [],
    this.optional = false,
    this.fromHint,
    this.toHint,
  });
}
```

Tidak ada perubahan breaking. Field baru bersifat opsional.

---

### 4.2 `filter_panel.dart` — NEW

**Lokasi:** `packages/wash_wallet_ui/lib/src/components/data_view/filter_panel.dart`

Widget baru berupa `StatefulWidget` yang menampilkan semua filter dalam panel grid. Dipisah dari `index_toolbar.dart` agar mudah di-test dan dirawat.

**Struktur internal:**

```dart
class FilterPanel extends StatefulWidget {
  final List<FilterConfig> filterConfigs;
  final List<ActiveFilter> activeFilters;
  final void Function(List<ActiveFilter> applied) onApply;
  final VoidCallback onCancel;
  final VoidCallback onClearAll;

  const FilterPanel({ ... });
}

class _FilterPanelState extends State<FilterPanel> {
  // _pendingFilters: copy dari activeFilters saat panel dibuka
  // Dimodifikasi secara lokal, baru di-commit saat Apply ditekan
  late Map<String, ActiveFilter> _pendingFilters;

  @override
  void initState() {
    super.initState();
    _pendingFilters = {
      for (final f in widget.activeFilters) f.filterId: f,
    };
  }
}
```

**Rendering per FilterType:**

| FilterType | Widget yang digunakan |
|---|---|
| `singleSelect` | `Wrap` of `ChoiceChip` |
| `multiSelect` | `Wrap` of `FilterChip` (untuk kebutuhan masa depan) |
| `dateRange` | Dua `TextFormField` dengan `suffixIcon` untuk date picker (`showDatePicker`), format `yyyy-MM-dd` |
| `numberRange` | Dua `TextFormField` bertipe `TextInputType.number`, untuk min dan max |
| `textInput` | Satu `TextFormField` |

**Layout panel:**

- `Container` dengan `decoration` menggunakan `surface`, `border`, `radius` dari `wash_wallet_ui`.
- Grid 2 kolom menggunakan `Wrap` dengan threshold dari `LayoutBuilder` (>= 600px), 1 kolom untuk compact.
- Footer: `Row` berisi `TextButton("Batal")`, `Spacer`, `TextButton("Hapus Semua")`, `FilledButton("Terapkan")`.
- Bungkus konten dengan `SingleChildScrollView` agar tidak overflow di portrait mode.

**Representasi nilai internal `ActiveFilter.value`:**

Untuk `dateRange`:
```dart
// ActiveFilter.value berupa Map<String, String?>
{'from': 'YYYY-MM-DD', 'to': 'YYYY-MM-DD'}
```

Untuk `numberRange`:
```dart
// ActiveFilter.value berupa Map<String, double?>
{'min': 100000.0, 'max': 500000.0}
```

**Label chip aktif (contoh):**
- `dateRange`: `"Tanggal: 2026-06-01 - 2026-06-30"`
- `numberRange`: `"Nominal: 100.000 - 500.000"`
- `singleSelect`: `"Status: Diterima"`

---

### 4.3 `index_toolbar.dart` — MODIFY

**Lokasi:** `packages/wash_wallet_ui/lib/src/components/data_view/index_toolbar.dart`

**Perubahan:**

1. **Konversi ke `StatefulWidget`** untuk menyimpan state `_isPanelOpen`.
2. **Hapus `_showFilterPanel()`** yang memanggil `showModalBottomSheet`.
3. **Ganti logika buka filter** dengan toggle `_isPanelOpen`.
4. **Render `FilterPanel`** secara inline di bawah bar utama, dibungkus `AnimatedSize`.
5. **Callback** diteruskan ke `FilterPanel`:
   - `onApply`: reset semua filter lama, apply filter baru, tutup panel.
   - `onCancel`: tutup panel tanpa commit.
   - `onClearAll`: panggil `onFilterReset`, tutup panel.

**Struktur `build()` baru:**

```dart
@override
Widget build(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    mainAxisSize: MainAxisSize.min,
    children: [
      // Bar utama (existing layout, tidak berubah signifikan)
      _buildTopBar(context),

      // Panel filter inline (baru)
      AnimatedSize(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeInOut,
        child: _isPanelOpen && filterConfigs.isNotEmpty
            ? FilterPanel(
                filterConfigs: filterConfigs,
                activeFilters: activeFilters,
                onApply: (applied) {
                  onFilterReset?.call();
                  for (final f in applied) {
                    onFilterApply?.call(f);
                  }
                  setState(() => _isPanelOpen = false);
                },
                onCancel: () => setState(() => _isPanelOpen = false),
                onClearAll: () {
                  onFilterReset?.call();
                  setState(() => _isPanelOpen = false);
                },
              )
            : const SizedBox.shrink(),
      ),
    ],
  );
}
```

> **Catatan backward compatibility:** Halaman lain yang hanya memakai `singleSelect` tetap berfungsi. Panel baru merender `ChoiceChip` sama seperti sebelumnya untuk `singleSelect` — hanya presentasinya berubah dari bottom sheet ke inline. Interface `onFilterApply`, `onFilterRemove`, `onFilterReset` tidak berubah.

---

### 4.4 `index_orders_screen.dart` — MODIFY

**Lokasi:** `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`

**Perubahan state — tambahan field di `_IndexOrdersScreenState`:**

```dart
String? _selectedPaymentStatus;
String? _orderDateFrom;
String? _orderDateTo;
String? _estimatedCompletionFrom;
String? _estimatedCompletionTo;
double? _totalAmountMin;
double? _totalAmountMax;
```

**Perubahan `_loadData()`:**

```dart
void _loadData() {
  context.read<OrderCubit>().getAll(
    outletId: widget.outletId,
    search: _searchController.text,
    status: _selectedStatus,
    paymentStatus: _selectedPaymentStatus,
    orderDateFrom: _orderDateFrom,
    orderDateTo: _orderDateTo,
    estimatedCompletionFrom: _estimatedCompletionFrom,
    estimatedCompletionTo: _estimatedCompletionTo,
    totalAmountMin: _totalAmountMin,
    totalAmountMax: _totalAmountMax,
  );
}
```

**`filterConfigs` baru untuk tablet:**

```dart
filterConfigs: [
  FilterConfig(
    id: 'status',
    label: 'Status Order',
    type: FilterType.singleSelect,
    options: _statusFilters.map(
      (f) => FilterOption(
        id: f['value']?.toString() ?? 'all',
        label: f['label'] as String,
        value: f['value'],
      ),
    ).toList(),
  ),
  FilterConfig(
    id: 'paymentStatus',
    label: 'Status Pembayaran',
    type: FilterType.singleSelect,
    options: _paymentStatusFilters.map(
      (f) => FilterOption(
        id: f['value']?.toString() ?? 'all',
        label: f['label'] as String,
        value: f['value'],
      ),
    ).toList(),
  ),
  FilterConfig(
    id: 'orderDate',
    label: 'Tanggal Order',
    type: FilterType.dateRange,
    fromHint: 'Dari tanggal',
    toHint: 'Sampai tanggal',
  ),
  FilterConfig(
    id: 'estimatedCompletion',
    label: 'Estimasi Selesai',
    type: FilterType.dateRange,
    fromHint: 'Dari tanggal',
    toHint: 'Sampai tanggal',
  ),
  FilterConfig(
    id: 'totalAmount',
    label: 'Range Nominal',
    type: FilterType.numberRange,
    fromHint: 'Nominal min',
    toHint: 'Nominal max',
  ),
],
```

**Daftar `_paymentStatusFilters`** (tambahkan di state):

```dart
final List<Map<String, String?>> _paymentStatusFilters = [
  {'label': 'Semua', 'value': null},
  {'label': 'Belum Dihargai', 'value': 'not_yet_priced'},
  {'label': 'Belum Bayar', 'value': 'unpaid'},
  {'label': 'Sebagian', 'value': 'partial'},
  {'label': 'Lunas', 'value': 'paid'},
  {'label': 'Refund', 'value': 'refunded'},
  {'label': 'Paket', 'value': 'paid_by_package'},
  {'label': 'COD', 'value': 'cod'},
];
```

**`activeFilters` dibangun dinamis:**

```dart
activeFilters: _buildActiveFilters(),
```

Implementasi `_buildActiveFilters()`:

```dart
List<ActiveFilter> _buildActiveFilters() {
  final filters = <ActiveFilter>[];

  if (_selectedStatus != null) {
    filters.add(ActiveFilter(
      filterId: 'status',
      filterLabel: 'Status',
      valueLabel: _labelFor(_statusFilters, _selectedStatus),
      value: _selectedStatus,
    ));
  }

  if (_selectedPaymentStatus != null) {
    filters.add(ActiveFilter(
      filterId: 'paymentStatus',
      filterLabel: 'Pembayaran',
      valueLabel: _labelFor(_paymentStatusFilters, _selectedPaymentStatus),
      value: _selectedPaymentStatus,
    ));
  }

  if (_orderDateFrom != null || _orderDateTo != null) {
    final from = _orderDateFrom ?? '...';
    final to = _orderDateTo ?? '...';
    filters.add(ActiveFilter(
      filterId: 'orderDate',
      filterLabel: 'Tanggal',
      valueLabel: '$from - $to',
      value: {'from': _orderDateFrom, 'to': _orderDateTo},
    ));
  }

  if (_estimatedCompletionFrom != null || _estimatedCompletionTo != null) {
    final from = _estimatedCompletionFrom ?? '...';
    final to = _estimatedCompletionTo ?? '...';
    filters.add(ActiveFilter(
      filterId: 'estimatedCompletion',
      filterLabel: 'Est. Selesai',
      valueLabel: '$from - $to',
      value: {'from': _estimatedCompletionFrom, 'to': _estimatedCompletionTo},
    ));
  }

  if (_totalAmountMin != null || _totalAmountMax != null) {
    final min = _totalAmountMin != null ? _formatCurrency(_totalAmountMin!) : '...';
    final max = _totalAmountMax != null ? _formatCurrency(_totalAmountMax!) : '...';
    filters.add(ActiveFilter(
      filterId: 'totalAmount',
      filterLabel: 'Nominal',
      valueLabel: '$min - $max',
      value: {'min': _totalAmountMin, 'max': _totalAmountMax},
    ));
  }

  return filters;
}

String _labelFor(List<Map<String, String?>> options, String? value) {
  return options
      .firstWhere((f) => f['value'] == value, orElse: () => options.first)['label'] ?? '-';
}

String _formatCurrency(double amount) {
  // Format tanpa desimal, pakai titik sebagai separator ribuan
  // Contoh: 100000 -> '100.000'
  return amount.toStringAsFixed(0).replaceAllMapped(
    RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
    (m) => '${m[1]}.',
  );
}
```

**`onFilterApply`:**

```dart
onFilterApply: (filter) {
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
  _loadData();
},
```

**`onFilterRemove`:**

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
  _loadData();
},
```

**`onFilterReset`:**

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
  _loadData();
},
```

---

## 5. Alur Interaksi User (UX Flow)

```
User membuka halaman Order Tablet
       |
       v
Top bar: [Search...] [Filter (N)] ... [Pesanan Baru]
Active pills: [Status: Diterima x] [Tanggal: ... x] [Reset]
       |
User klik tombol [Filter]
       |
       v
Panel muncul inline di bawah toolbar (AnimatedSize 250ms)
+--------------------------------------------------+
| Status Order       | Status Pembayaran           |
| [chip] [chip]...   | [chip] [chip]...            |
|                    |                             |
| Tanggal Order      | Estimasi Selesai            |
| [Dari] [Sampai]    | [Dari] [Sampai]             |
|                    |                             |
| Range Nominal                                    |
| [Min nominal]   [Max nominal]                    |
|                                                  |
| [Batal]  [Hapus Semua]              [Terapkan]  |
+--------------------------------------------------+
       |
User ubah filter -> klik [Terapkan]
       |
       v
onApply dipanggil -> state di-commit -> _loadData() -> panel ditutup
Active pills di toolbar diperbarui
```

---

## 6. Urutan Pengerjaan (Task Order)

Dikerjakan secara berurutan untuk menghindari konflik:

1. **[1] `filter_config.dart`** — Tambah `fromHint`, `toHint`.
2. **[2] `filter_panel.dart`** — Buat widget baru dari nol.
3. **[3] `index_toolbar.dart`** — Konversi ke `StatefulWidget`, hapus bottom sheet, integrasi `FilterPanel` inline.
4. **[4] `index_orders_screen.dart`** — Tambah state filter, `filterConfigs`, `activeFilters`, callback, dan wiring `_loadData()`.

---

## 7. Batasan Scope yang Harus Dijaga

| Tidak dikerjakan | Alasan |
|---|---|
| Redesign mobile order list | Di luar scope user need |
| Perubahan `OrderCubit`, usecase, repository, datasource | Backend sudah mendukung parameter yang dibutuhkan |
| Filter outlet dropdown | Konteks single-outlet; `outletId` dikirim implisit |
| Filter customer/employee | Tidak wajib untuk tahap ini |
| Perubahan web dashboard | Di luar scope |
| Perubahan lifecycle/payment order | Di luar scope |

---

## 8. Acceptance Criteria (Checklist Implementor)

- [ ] Tombol Filter di toolbar tablet membuka panel inline di bawah toolbar (bukan modal/bottom sheet).
- [ ] Panel menampilkan: Status Order, Status Pembayaran, Tanggal Order, Estimasi Selesai, Range Nominal.
- [ ] Panel menggunakan `AnimatedSize` untuk transisi buka/tutup (duration 250ms, easeInOut).
- [ ] Tombol Terapkan mengkomit semua perubahan filter dan menutup panel.
- [ ] Tombol Batal menutup panel tanpa mengubah filter aktif.
- [ ] Tombol Hapus Semua mengosongkan semua filter dan menutup panel.
- [ ] Semua filter aktif muncul sebagai chip/pill di toolbar dengan label yang informatif.
- [ ] Setiap chip bisa dihapus satu per satu via ikon x.
- [ ] Ada tombol "Reset" di area pills untuk menghapus semua filter sekaligus.
- [ ] `_loadData()` selalu dipanggil setelah perubahan filter dikomit.
- [ ] `OrderCubit.getAll()` menerima semua parameter filter yang relevan.
- [ ] `outletId` tetap dikirim, outlet tidak muncul sebagai dropdown.
- [ ] Tablet portrait dan landscape tidak overflow.
- [ ] Layout mobile (`_buildMobileList`) tidak berubah.
- [ ] Halaman lain yang memakai `AppDataView` (customer, deposit, dll.) tetap berfungsi normal.
- [ ] Styling panel menggunakan token dari `wash_wallet_ui` (surface, border, radius, typography, spacing).
- [ ] Format tanggal ke API: `YYYY-MM-DD`.
- [ ] Validasi nominal: tidak mengirim nilai negatif atau min > max.

---

## 9. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| `IndexToolbar` dipakai banyak halaman; konversi ke `StatefulWidget` bisa break | Uji halaman lain setelah modifikasi: customer, category, expense, dll. |
| `onFilterApply` di halaman lain hanya menangani `singleSelect` | Tidak ada masalah; panel baru tidak memanggil `onFilterApply` dengan tipe baru kecuali `IndexOrdersScreen` yang memang meng-handle semua tipe |
| `showDatePicker` memerlukan `BuildContext` yang valid dan `mounted` check | Gunakan `mounted` check sebelum `setState` setelah `await showDatePicker` |
| Nominal string dari `TextFormField` bisa kosong atau tidak valid | Parse dengan `double.tryParse()`, skip jika null |
| Panel terlalu tinggi di portrait mode | Bungkus konten panel dengan `SingleChildScrollView` |

---

## 10. File Summary

| File | Aksi | Paket |
|---|---|---|
| `models/filter_config.dart` | MODIFY | `wash_wallet_ui` |
| `filter_panel.dart` | NEW | `wash_wallet_ui` |
| `index_toolbar.dart` | MODIFY | `wash_wallet_ui` |
| `index_orders_screen.dart` | MODIFY | `cashier` |
