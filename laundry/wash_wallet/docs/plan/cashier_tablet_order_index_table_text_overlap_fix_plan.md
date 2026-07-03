# Fix Plan: Text Overlap dan Truncation pada Tabel Order Tablet Cashier

Tanggal: 2026-06-30
Referensi Issue: `docs/issue/cashier_tablet_order_index_table_text_overlap_issue.md`

---

## 1. Ringkasan Masalah

Tampilan tabel order pada `IndexOrdersScreen` versi tablet memiliki empat masalah visual:

1. **Kolom Total dan Tanggal saling berhimpit** — tidak ada horizontal gap antar cell di `AppDataTable`.
2. **Jarak antar kolom tidak proporsional** — fixed width beberapa kolom terlalu sempit, terutama saat detail panel kanan terbuka.
3. **Badge No. Pesanan terpotong** — kolom 144px dengan horizontal padding badge menyisakan terlalu sedikit ruang teks.
4. **Nomor telepon pelanggan terpotong di bawah** — `rowHeight: 88` tidak selalu cukup untuk dua-baris konten dengan badge, icon, gap, dan font weight tebal.

Akar masalah: `AppDataTable` tidak punya `columnGap`, row height tidak adaptif, dan angka layout tersebar sebagai hardcode di `IndexOrdersScreen`.

---

## 2. Pendekatan Fix

Fix dilakukan di dua lapisan:

### Lapisan 1 — `AppDataTable` (shared, reusable)
Tambahkan kemampuan yang hilang langsung di komponen shared agar semua halaman yang memakai `AppDataView` bisa ikut merasakan manfaatnya.

### Lapisan 2 — `IndexOrdersScreen` (order-specific)
Sesuaikan konfigurasi tabel order: perbaiki lebar kolom, ubah `rowHeight`, dan manfaatkan kapabilitas baru dari lapisan 1.

---

## 3. Rincian Perubahan per File

---

### 3.1 `app_density.dart` — MODIFY

**Lokasi:** `packages/wash_wallet_ui/lib/src/theme/density/app_density.dart`

Tambahkan dua token density baru untuk tabel:

```dart
/// Gap horizontal antar kolom tabel
static double tableColumnGap(AppDensityMode mode) =>
    mode == AppDensityMode.compact ? 8.0 : 12.0;

/// Tinggi row tabel untuk konten dua baris (two-line row)
static double tableTwoLineRowHeight(AppDensityMode mode) =>
    mode == AppDensityMode.compact ? 72.0 : 88.0;
```

**Alasan:** Gap dan row height adalah nilai yang bisa berubah per density. Dengan meletakkan di `AppDensity`, nilainya konsisten antar halaman dan mudah diubah dari satu tempat.

---

### 3.2 `data_table_column_def.dart` — MODIFY

**Lokasi:** `packages/wash_wallet_ui/lib/src/components/data_view/models/data_table_column_def.dart`

Tambahkan field `minWidth` opsional. Berguna saat kolom flex perlu dilindungi dari menyempit terlalu kecil:

```dart
/// Minimum width untuk kolom flex. Tidak berlaku jika [width] sudah diset.
final double? minWidth;

const DataTableColumnDef({
  required this.id,
  required this.header,
  required this.cellBuilder,
  this.width,
  this.minWidth,      // NEW
  this.flex = 1,
  ...
});
```

**Catatan implementasi:** `minWidth` hanya relevan untuk kolom flex (`width == null`). Pada `_buildRow` dan `_buildHeaderRow`, kolom flex dibungkus `Expanded` — implementasi tidak perlu menggunakannya secara khusus di dalam `AppDataTable` untuk saat ini. Nilai `minWidth` bisa dipakai oleh caller sebagai dokumentasi intent, atau diimplementasikan sebagai `ConstrainedBox` di dalam `Expanded` jika diperlukan di masa depan.

**Alternatif minimal:** Skip field ini jika scope terasa terlalu luas. Fokus pada `columnGap` dan `rowHeight` lebih dulu.

---

### 3.3 `app_data_table.dart` — MODIFY (KRITIS)

**Lokasi:** `packages/wash_wallet_ui/lib/src/components/data_view/app_data_table.dart`

#### 3.3.1 Tambah parameter `columnGap`

```dart
// Tambah field ke AppDataTable
final double columnGap;
```

Default value: `0.0` agar backward compatible — halaman yang sudah ada tidak berubah perilakunya secara default.

```dart
const AppDataTable({
  ...
  this.columnGap = 0.0,   // NEW, default 0 = backward compatible
  ...
});
```

#### 3.3.2 Terapkan `columnGap` di `_buildHeaderRow` dan `_buildRow`

Saat ini kedua method membangun `Row` dengan cell langsung berurutan tanpa spasi. Ubah dengan menyisipkan `SizedBox(width: columnGap)` di antara setiap cell.

**Implementasi di `_buildHeaderRow`:**

```dart
// SEBELUM
...widget.columns.map((col) {
  return col.width != null
      ? SizedBox(width: col.width, child: headerCell)
      : Expanded(flex: col.flex, child: headerCell);
}),

// SESUDAH
..._buildCellsWithGap(
  widget.columns.map((col) {
    return col.width != null
        ? SizedBox(width: col.width, child: headerCell)
        : Expanded(flex: col.flex, child: headerCell);
  }).toList(),
),
```

**Helper method `_buildCellsWithGap`:**

```dart
List<Widget> _buildCellsWithGap(List<Widget> cells) {
  if (widget.columnGap <= 0 || cells.isEmpty) return cells;
  final result = <Widget>[];
  for (int i = 0; i < cells.length; i++) {
    result.add(cells[i]);
    if (i < cells.length - 1) {
      result.add(SizedBox(width: widget.columnGap));
    }
  }
  return result;
}
```

Terapkan helper yang sama di `_buildRow`.

#### 3.3.3 Sesuaikan padding horizontal header dan row

Saat ini `_buildHeaderRow` dan `_buildRow` memakai `padding: const EdgeInsets.symmetric(horizontal: 16.0)`. Ini adalah hardcode. Setelah ada `columnGap`, padding horizontal masih bisa tetap 16, namun untuk konsistensi dengan density, bisa dipertimbangkan mengekspos sebagai parameter juga. Untuk scope plan ini, biarkan `padding: const EdgeInsets.symmetric(horizontal: 16.0)` tetap, hanya tambahkan `columnGap`.

#### 3.3.4 Backward compatibility

- `columnGap` default `0.0` → tidak ada perubahan visual bagi halaman yang belum memakai parameter ini.
- `_buildCellsWithGap` hanya aktif jika `columnGap > 0`.

---

### 3.4 `app_data_view.dart` — MODIFY

**Lokasi:** `packages/wash_wallet_ui/lib/src/components/data_view/app_data_view.dart`

Teruskan parameter `columnGap` dari `AppDataView` ke `AppDataTable`:

```dart
// Tambah field ke AppDataView
final double columnGap;

const AppDataView({
  ...
  this.columnGap = 0.0,    // NEW, default 0 = backward compatible
  ...
});

// Di build(), teruskan ke AppDataTable
AppDataTable<T>(
  ...
  columnGap: columnGap,
)
```

---

### 3.5 `index_orders_screen.dart` — MODIFY (KRITIS)

**Lokasi:** `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`

#### 3.5.1 Revisi lebar kolom tablet

Masalah saat ini: kolom `No. Pesanan` 144px, `Status` 148px, `Total` 136px, `Tanggal` 128px.

Penyesuaian yang direkomendasikan:

| Kolom | Width saat ini | Width baru | Catatan |
|---|---|---|---|
| No. Pesanan | 144 | 160 | Badge butuh ruang lebih |
| Status | 148 | 156 | Sedikit longgar untuk badge panjang |
| Total | 136 | 148 | Ruang untuk nominal + badge payment |
| Tanggal | 128 | 140 | Ruang untuk date + time |
| Pelanggan | flex | flex | Tidak berubah |

**Catatan:** Nilai di atas adalah panduan awal. Implementor perlu verifikasi di device/emulator tablet portrait dan landscape, serta dalam kondisi detail panel embedded terbuka. Jika width tertentu masih terlalu sempit, naikkan secara lokal.

#### 3.5.2 Aktifkan `columnGap` dan sesuaikan `rowHeight`

```dart
AppDataView<Order>(
  ...
  columnGap: AppDensity.tableColumnGap(AppDensityMode.compact),  // gunakan token
  rowHeight: AppDensity.tableTwoLineRowHeight(AppDensityMode.compact),  // gunakan token
  ...
)
```

Ini menghilangkan angka hardcode `rowHeight: 88` dan menggantinya dengan nilai dari token density. Nilai token `tableTwoLineRowHeight(compact)` = 72.0 seperti yang didefinisikan di Section 3.1.

> **Kenapa 72 bukan 88?** Dengan adanya `columnGap` yang memisahkan konten antar kolom, teks tidak lagi harus berbagi ruang horizontal yang ketat, sehingga risiko clipping vertikal berkurang. Namun jika setelah verifikasi visual 72 tidak cukup, implementor bisa menaikkan nilai token menjadi 80 atau 88.

#### 3.5.3 Perbaiki `_buildOrderNumberCell` — badge order number

Saat ini badge memakai `Container` dengan `padding: EdgeInsets.symmetric(horizontal: 10, vertical: 6)`. Dengan kolom 160px, badge akan punya cukup ruang. Namun agar lebih aman:

- Ganti `overflow: TextOverflow.ellipsis` tetap ada (sudah benar).
- Tambahkan `Tooltip` dengan `order.orderNumber` agar user bisa melihat nomor lengkap jika terpotong.

```dart
// Wrap Container dengan Tooltip
Tooltip(
  message: order.orderNumber,
  child: Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
    ...
    child: Text(
      order.orderNumber,
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
    ),
  ),
),
```

#### 3.5.4 Perbaiki `_buildCustomerCell` — nomor telepon terpotong

Masalah: `Column(mainAxisAlignment: MainAxisAlignment.center)` dengan dua baris konten terkadang membuat baris kedua (nomor telepon) terpotong jika `rowHeight` tidak cukup.

Perbaikan:

- Gunakan `mainAxisSize: MainAxisSize.min` alih-alih bergantung pada center alignment yang bisa mempersempit ruang.
- Pastikan `Expanded` di dalam `Row` nomor telepon sudah ada (sudah benar di kode saat ini).
- Dengan `rowHeight` yang lebih tepat dari token density, masalah ini seharusnya teratasi.

Tidak perlu perubahan structural pada `_buildCustomerCell` jika `rowHeight` sudah diperbaiki. Verifikasi visual tetap diperlukan.

#### 3.5.5 Perilaku saat detail embedded terbuka

Saat `_selectedOrderId != null`, tabel kiri memakai `Expanded(flex: 2)` dan panel kanan `Expanded(flex: 1)`. Dengan total fixed width kolom sekitar 160+156+148+140 = 604px + flex pelanggan, tabel bisa menyempit di bawah lebar tersebut pada tablet tertentu.

**Rekomendasi minimal:** Tidak perlu horizontal scroll untuk saat ini. Sebaiknya:

1. Pastikan total fixed width kolom tidak melebihi lebar aman tabel kiri saat detail terbuka (±50-55% lebar layar tablet portrait).
2. Jika lebar portrait landscape adalah ~1000px, lebar tabel saat detail terbuka sekitar ~660px. Fixed width ±604px masih aman dengan kolom pelanggan flex.
3. Jika masih bermasalah di portrait dengan detail terbuka, pertimbangkan menyembunyikan kolom `Tanggal` saat detail terbuka (opsional, scope lebih luas).

**Untuk tahap ini:** Cukup pastikan revisi lebar kolom di atas tidak melebihi ruang aman. Verifikasi di emulator tablet 768px portrait dengan detail terbuka.

---

## 4. Urutan Pengerjaan

Dikerjakan secara berurutan:

1. **[1] `app_density.dart`** — Tambah `tableColumnGap` dan `tableTwoLineRowHeight`.
2. **[2] `app_data_table.dart`** — Tambah parameter `columnGap`, tambah `_buildCellsWithGap`, terapkan di `_buildHeaderRow` dan `_buildRow`.
3. **[3] `app_data_view.dart`** — Tambah dan teruskan `columnGap`.
4. **[4] `index_orders_screen.dart`** — Revisi lebar kolom, ganti `rowHeight` dan `columnGap` dengan token density, tambah Tooltip pada badge order number.
5. **[5] Verifikasi visual** — Cek di emulator tablet portrait, landscape, dan saat detail embedded terbuka.

---

## 5. Diagram: Sebelum vs Sesudah

### Sebelum (masalah)

```
+------------+----------------------------+----------------+----------+----------+
| No. Pesanan| Pelanggan                  | Status         | Total    | Tanggal  |
| 144px      | flex                       | 148px          | 136px    | 128px    |
+------------+----------------------------+----------------+----------+----------+
| [WW-001...]| Budi Santoso               | [Diterima     ]| Rp120.000| 30 Jun   |
| 2 item     | 📞 +62812...               |                | [Lunas]  | ⏰ 10:30  |
+------------+----------------------------+----------------+----------+----------+
                                                           ^^^^^^^^^  ^^^^^^^^^
                                                           berhimpit, tidak ada gap
```

### Sesudah (fix)

```
+-------------+  +----------------------------+  +----------------+  +----------+  +----------+
| No. Pesanan |  | Pelanggan                  |  | Status         |  | Total    |  | Tanggal  |
| 160px       |  | flex                       |  | 156px          |  | 148px    |  | 140px    |
+-------------+  +----------------------------+  +----------------+  +----------+  +----------+
| [WW-001-...]|  | Budi Santoso               |  | [Diterima     ]|  | Rp120.000|  | 30 Jun   |
| 2 item      |  | 📞 +62812...               |  |                |  | [Lunas]  |  | ⏰ 10:30 |
+-------------+  +----------------------------+  +----------------+  +----------+  +----------+
              ^^                               ^^                  ^^             ^^
              gap antar kolom (8px dari token density)
```

---

## 6. Acceptance Criteria (Checklist Implementor)

- [ ] Nominal total tidak menabrak atau terlihat menyatu dengan tanggal transaksi.
- [ ] Ada jarak visual yang jelas antara setiap kolom tabel (minimal 8px gap dari token).
- [ ] No. Pesanan tidak terpotong untuk format order number normal (misal `WW-2026-001`, `ORD-123456`).
- [ ] Tooltip tampil saat hover/long-press pada badge No. Pesanan.
- [ ] Nomor telepon pelanggan tidak terpotong di baris bawah dalam kondisi normal.
- [ ] Row order tetap rapi dengan dua tingkat informasi pada setiap cell.
- [ ] Tabel tetap usable saat detail order embedded kanan terbuka (tablet landscape dan portrait).
- [ ] Tidak ada horizontal overflow warning pada tablet portrait (768px) dan landscape (1024px).
- [ ] `columnGap` default `0.0` di `AppDataTable` tidak merusak halaman lain yang memakai `AppDataView` (customer, deposit, expense, dll.).
- [ ] `rowHeight` dan `columnGap` di `IndexOrdersScreen` menggunakan `AppDensity` token, bukan angka hardcode.
- [ ] Perubahan di `app_density.dart` tidak merusak halaman yang sudah memakai `AppDensity`.

---

## 7. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| `columnGap` default 0 — halaman lain tidak terpengaruh | Default `0.0` memastikan tidak ada perubahan visual pada halaman yang tidak menge-set parameter ini |
| Revisi lebar kolom bisa membuat total fixed width terlalu besar di portrait dengan detail terbuka | Verifikasi di emulator 768px portrait dengan detail embedded terbuka sebelum merge |
| `tableTwoLineRowHeight` = 72 mungkin masih terlalu kecil untuk font scale besar | Jika terdeteksi saat verifikasi, naikkan nilai token menjadi 80 atau 88 |
| Tooltip tidak muncul di layar sentuh (hanya muncul di hover) | Acceptable untuk tablet; jika perlu, gunakan `GestureDetector` dengan long press sebagai fallback |
| Menambah `minWidth` ke `DataTableColumnDef` tidak dipakai saat ini | Cukup tambahkan field tanpa mengimplementasikan logic di `AppDataTable`; bisa diimplementasikan kemudian |

---

## 8. File Summary

| File | Aksi | Paket | Prioritas |
|---|---|---|---|
| `app_density.dart` | MODIFY — tambah `tableColumnGap` dan `tableTwoLineRowHeight` | `wash_wallet_ui` | **KRITIS** |
| `app_data_table.dart` | MODIFY — tambah `columnGap`, helper `_buildCellsWithGap`, terapkan di header dan row | `wash_wallet_ui` | **KRITIS** |
| `app_data_view.dart` | MODIFY — tambah dan teruskan `columnGap` ke `AppDataTable` | `wash_wallet_ui` | **KRITIS** |
| `index_orders_screen.dart` | MODIFY — revisi lebar kolom, pakai token density, tambah Tooltip badge | `cashier` | **KRITIS** |
| `data_table_column_def.dart` | MODIFY — tambah field `minWidth` opsional | `wash_wallet_ui` | Opsional |
