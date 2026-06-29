# Customer Discovery Typo-Tolerant Search Plan

Fitur ini memperbaiki search layanan pada Discovery agar tahan terhadap typo, huruf hilang, atau ejaan tidak sempurna — sehingga customer dapat menemukan layanan seperti `Cuci Kering` meskipun mengetik `cci krinh`.

## Keputusan Desain

1. Typo-tolerant search diterapkan di **backend** melalui fuzzy/full-text search; frontend hanya mengonsumsi hasilnya.
2. Backend mengembalikan field `corrected_query` (opsional) di response ketika query dikoreksi.
3. Frontend sudah memiliki `correctedQuery` di `DiscoverySearchResult` dan `DiscoverySearchResultLoaded` serta `DiscoveryTypoCorrectionBannerWidget` — yang perlu diperbaiki adalah **alur data**: backend response harus benar-benar mengisi `corrected_query`.
4. Sisi frontend ditambah **typo suggestion / empty state yang lebih kontekstual** ketika tidak ada hasil.
5. Tidak ada perubahan pada `DiscoveryFilter`, `DiscoveryRepository`, atau `SearchServicesUsecase` — kontrak sudah cukup.
6. Perubahan terbesar ada di: **backend search logic**, **datasource parsing `corrected_query`**, dan **repository: hapus client-side filter substring yang melawan typo-tolerance**.

---

## Panduan Implementasi

> [!CAUTION]
> **WAJIB DIBACA SEBELUM CODING.** Setiap file yang dibuat atau dimodifikasi harus mengikuti standardisasi spec di `docs/spec/`:
>
> | Spec | Lokasi |
> |------|--------|
> | Cubit | [cubit_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/cubit_spec.md) |
> | State | [state_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/state_spec.md) |
> | Provider | [provider_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/provider_spec.md) |
> | Usecase | [usecase_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/usecase_spec.md) |
> | Repository | [repository_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/repository_spec.md) |
> | Repository Impl | [repository_impl_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/repository_impl_spec.md) |
> | Remote Datasource | [remote_datasource_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/remote_datasource_spec.md) |

> [!CAUTION]
> **Aturan coding yang HARUS dipatuhi:**
> - Gunakan widget dari `wash_wallet_ui` (`AppCard`, `AppButton`, `AppBadge`, `AppChip`, `AppEmptyState`, `AppLayout`, `AppHeader`, `AppTextField`, `AppLoadingIndicator`, `AppBottomSheet`, `AppListTile`, `AppDivider`).
> - Gunakan theme token via `context.colors`, `context.space`, `context.radius`, `context.typography`; jangan hardcode warna, spacing, atau font.
> - Jangan tulis comment di kode.
> - Pecah UI menjadi widget kecil di folder `widgets/`; setiap widget maksimal sekitar 80–100 baris.
> - Gunakan `result.when()`, bukan `.fold()` atau `if (result.isSuccess)`.
> - State menggunakan `sealed class` dengan pattern matching di UI.
> - Constructor cubit menggunakan named parameters.
> - Remote datasource mengembalikan `Model`, bukan `Result`.
> - Repository impl mengembalikan `Result` via try/catch dan `_mapExceptionToFailure`.

---

## Analisis State Saat Ini

### Yang Sudah Ada (Tidak Perlu Dibuat Ulang)

| File | Status |
|------|--------|
| `DiscoveryFilter` | ✅ Tidak perlu diubah |
| `DiscoverySearchResult` | ✅ Field `correctedQuery` sudah ada |
| `DiscoverySearchResultLoaded` | ✅ Field `correctedQuery` sudah ada |
| `DiscoveryTypoCorrectionBannerWidget` | ✅ Widget sudah ada, digunakan di `DiscoverySearchResultContentWidget` |
| `SearchServicesUsecase` | ✅ Tidak perlu diubah |
| `DiscoveryRepository` (abstract) | ✅ Tidak perlu diubah |

### Yang Perlu Diubah

| File | Jenis Perubahan |
|------|----------------|
| `DiscoveryRemoteDatasource` | Tambah parsing `corrected_query` dari backend response |
| `DiscoveryRepositoryImpl` | Hapus client-side substring filter yang melawan typo-tolerance; teruskan `correctedQuery` dari datasource |
| `DiscoverySearchResultContentWidget` | Ekstrak logika list/empty ke sub-widget agar tetap ≤100 baris |
| `DiscoverySearchEmptyStateWidget` | Tampilkan pesan yang lebih kontekstual jika ada query |
| `DiscoveryTypoCorrectionBannerWidget` | Sudah baik, tidak perlu diubah |

### Yang Perlu Dibuat (Widget Baru)

| Widget Baru | Tujuan |
|-------------|--------|
| `DiscoverySearchResultHeaderWidget` | Menampilkan jumlah hasil + banner typo correction sebagai header list |
| `DiscoverySearchResultListWidget` | ListView item-item hasil search + load more indicator; dipecah dari `DiscoverySearchResultContentWidget` |
| `DiscoverySearchTypoEmptyStateWidget` | Empty state khusus saat query ada tapi tidak ada hasil, memberikan konteks "coba perbaiki typo" |

---

## Backend Plan

### Mengapa Client-Side Filter Harus Dihapus

`DiscoveryRepositoryImpl._applyClientFilters` saat ini melakukan pencocokan substring literal:

```dart
if (!searchable.contains(query)) return false;
```

Ini **bertolak belakang** dengan typo-tolerant search. Jika backend sudah mengembalikan hasil fuzzy yang relevan (misal `Cuci Kering` untuk query `cci krinh`), filter client-side akan membuangnya karena `"cuci kering".contains("cci krinh")` bernilai `false`.

**Solusi:** Hapus blok filter query dari `_applyClientFilters` di repository impl. Serahkan seluruh keputusan relevansi ke backend.

### Backend Search Enhancement

Backend perlu mengubah implementasi search dari `LIKE`/substring menjadi fuzzy/full-text search. Plan ini tidak menetapkan algoritma final — AI implementor backend bebas memilih pendekatan yang paling sesuai dengan stack, selama:

1. Query `cci kering`, `cci krinh`, `cuci krinh`, `cuc kering` menemukan `Cuci Kering`.
2. Response menyertakan `corrected_query` (string, nullable) jika backend mengoreksi/menginterpretasikan query.
3. Hasil tetap bisa difilter oleh `outletId`, `categoryId`, `unitId`, `priceMin`, `priceMax`, `freeShippingEligible`, `supportsCourier`.
4. Hasil tetap bisa diurutkan oleh `serviceSortBy`: `relevant`, `cheapest`, `nearest`, `best`, `popular`.
5. Hanya layanan yang berstatus eligible/exposed ke customer yang muncul.

### Contoh Response dengan Koreksi Query

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "corrected_query": "cuci kering",
    "total": 12,
    "page": 1,
    "per_page": 15
  }
}
```

> Backend bebas menempatkan `corrected_query` di `meta` atau di root body — yang penting datasource Flutter mem-parsing-nya dengan benar.

---

## Frontend Plan

### Perubahan File Existing

#### 1. `discovery_remote_datasource.dart`

**Tujuan:** Ubah return type `fetchDiscoveryOutlets` agar membawa `corrected_query` dari response.

Buat wrapper model lokal `DiscoveryOutletResponse` atau ganti return type menjadi `DiscoverySearchResponse` yang membungkus `List<OutletModel>` + `String? correctedQuery`.

```
apps/customer/lib/features/discovery/data/datasources/discovery_remote_datasource.dart
```

**Perubahan:**
- Tambah abstract method baru atau ubah signature `fetchDiscoveryOutlets` agar mengembalikan objek yang mengandung `correctedQuery`.
- Parse `corrected_query` dari body response (dari `meta` atau root).

Contoh struktur return type baru (buat sebagai simple class di file yang sama):

```dart
class DiscoverySearchResponse {
  final List<OutletModel> outlets;
  final String? correctedQuery;

  const DiscoverySearchResponse({required this.outlets, this.correctedQuery});
}
```

#### 2. `discovery_repository_impl.dart`

**Tujuan:**
1. Sesuaikan pemanggilan `fetchDiscoveryOutlets` agar membaca `DiscoverySearchResponse`.
2. Teruskan `correctedQuery` ke `DiscoverySearchResult`.
3. **Hapus** blok filter query di `_applyClientFilters` (baris `if (!searchable.contains(query)) return false;`).

Filter non-query (outlet, kategori, unit, harga, gratis ongkir, kurir) tetap dipertahankan di `_applyClientFilters` karena filter ini berbasis ID/nilai exact — bukan string search.

#### 3. `discovery_search_result_content_widget.dart`

**Tujuan:** Ukuran file saat ini 89 baris — masih dalam batas — tapi logika item builder sudah tercampur antara header, item, dan load-more. Pecah menjadi dua widget terpisah agar setiap widget tetap bersih:

- `DiscoverySearchResultHeaderWidget` — hanya menampilkan corrected query banner.
- `DiscoverySearchResultListWidget` — hanya mengelola ListView + separator + load-more.

`DiscoverySearchResultContentWidget` menjadi komposisi dari dua widget di atas.

#### 4. `discovery_search_empty_state_widget.dart`

**Tujuan:** Saat ini description generik. Ketika ada query aktif tapi tidak ada hasil, tampilkan pesan yang lebih kontekstual:

- Jika ada query: `'Tidak ada layanan untuk "$query". Coba perbaiki ejaan atau ubah filter.'`
- Jika tidak ada query (filter saja): pesan saat ini sudah cukup.

Terima parameter opsional `String? activeQuery`.

---

### Widget Baru

#### Widget 1: `discovery_search_result_header_widget.dart`

```
apps/customer/lib/features/discovery/presentation/widgets/discovery_search_result_header_widget.dart
```

Menampilkan:
- `DiscoveryTypoCorrectionBannerWidget` jika `correctedQuery != null`.
- Tidak tampil jika `correctedQuery == null`.

Props:
```dart
final String? correctedQuery;
```

#### Widget 2: `discovery_search_result_list_widget.dart`

```
apps/customer/lib/features/discovery/presentation/widgets/discovery_search_result_list_widget.dart
```

Mengelola:
- `RefreshIndicator` + `ListView.separated`.
- Header (corrected query banner) sebagai item pertama list jika ada.
- Item kartu layanan.
- Load more indicator di akhir jika belum `hasReachedMax`.

Props:
```dart
final List<DiscoveryService> services;
final String? correctedQuery;
final bool hasReachedMax;
final bool isLoadMore;
final ScrollController scrollController;
final VoidCallback onRefresh;
final void Function(DiscoveryService) onServiceTap;
```

#### Widget 3: `discovery_search_typo_empty_state_widget.dart`

```
apps/customer/lib/features/discovery/presentation/widgets/discovery_search_typo_empty_state_widget.dart
```

Menampilkan empty state khusus saat query ada tapi tidak ada hasil. Berbeda dari `DiscoverySearchEmptyStateWidget` yang generik.

Props:
```dart
final String query;
final VoidCallback onClear;
```

Tampilan:
- Icon: `Icons.search_off_rounded` atau `Icons.manage_search_rounded`.
- Title: `'Tidak Ada Hasil untuk "$query"'`.
- Description: `'Coba perbaiki ejaan atau gunakan kata lain.'`.
- Action button: `AppButton.outline(label: 'Hapus Pencarian', onPressed: onClear)`.
- Gunakan `AppEmptyState.search(...)` dari `wash_wallet_ui`.

---

### Perubahan `DiscoverySearchResultContentWidget`

Setelah widget dipecah, file ini hanya mengelola routing kondisi:

```dart
class DiscoverySearchResultContentWidget extends StatelessWidget {
  // ... props sama seperti sekarang + activeQuery untuk empty state

  @override
  Widget build(BuildContext context) {
    if (services.isEmpty) {
      if (activeFilter.hasQuery) {
        return DiscoverySearchTypoEmptyStateWidget(
          query: activeFilter.query!,
          onClear: onClear,
        );
      }
      return DiscoverySearchEmptyStateWidget(onClear: onClear);
    }

    return DiscoverySearchResultListWidget(
      services: services,
      correctedQuery: correctedQuery,
      hasReachedMax: hasReachedMax,
      isLoadMore: isLoadMore,
      scrollController: scrollController,
      onRefresh: onRefresh,
      onServiceTap: onServiceTap,
    );
  }
}
```

---

## Ringkasan File yang Dimodifikasi / Dibuat

### Dimodifikasi

| File | Perubahan |
|------|-----------|
| `data/datasources/discovery_remote_datasource.dart` | Tambah `DiscoverySearchResponse`, parse `corrected_query` dari response |
| `data/repositories/discovery_repository_impl.dart` | Teruskan `correctedQuery`; hapus client-side query filter substring |
| `presentation/widgets/discovery_search_result_content_widget.dart` | Refactor menjadi komposisi widget kecil; route ke empty state kontekstual |
| `presentation/widgets/discovery_search_empty_state_widget.dart` | Tambah prop `String? activeQuery` untuk pesan kontekstual |

### Dibuat

| File | Keterangan |
|------|-----------|
| `presentation/widgets/discovery_search_result_header_widget.dart` | Banner typo correction sebagai komponen terpisah |
| `presentation/widgets/discovery_search_result_list_widget.dart` | ListView hasil search dengan header + load-more |
| `presentation/widgets/discovery_search_typo_empty_state_widget.dart` | Empty state kontekstual khusus saat ada query tapi tidak ada hasil |

> [!NOTE]
> `DiscoveryScreen`, `DiscoveryCubit`, `DiscoveryState`, `SearchServicesUsecase`, `DiscoveryRepository` (abstract), `DiscoveryFilter`, dan `DiscoveryTypoCorrectionBannerWidget` **tidak perlu diubah**.

---

## Urutan Implementasi

```
1. Backend: implementasi fuzzy/full-text search + tambah corrected_query di response
2. discovery_remote_datasource.dart — DiscoverySearchResponse + parse corrected_query
3. discovery_repository_impl.dart — teruskan correctedQuery + hapus client-side query filter
4. discovery_search_typo_empty_state_widget.dart — buat widget baru
5. discovery_search_result_header_widget.dart — buat widget baru
6. discovery_search_result_list_widget.dart — buat widget baru
7. discovery_search_empty_state_widget.dart — tambah activeQuery prop
8. discovery_search_result_content_widget.dart — refactor komposisi
```

---

## Edge Cases yang Harus Dihandle

| Edge Case | Handling |
|-----------|---------|
| Query kosong | Tidak trigger search; loadRecommendations — sudah dihandle di `DiscoveryScreen._applyFilter` |
| Typo ringan satu kata | Backend mengembalikan hasil + `corrected_query`; banner tampil |
| Typo berat, tidak ada hasil | Backend mengembalikan list kosong; frontend tampilkan `DiscoverySearchTypoEmptyStateWidget` |
| Query tidak berhubungan sama sekali | Backend mengembalikan list kosong; frontend tampilkan `DiscoverySearchTypoEmptyStateWidget` |
| Filter outlet + query typo | Client-side filter outlet (berdasarkan ID exact) tetap berjalan; hanya query filter yang dihapus |
| Sort + query typo | Backend sudah menerima `serviceSortBy`; tidak ada perubahan |
| Layanan aktif vs tidak aktif | Backend bertanggung jawab memfilter; hanya layanan eligible/exposed yang dikembalikan |
| Load more dengan query typo | Halaman 2+ menggunakan query yang sama; backend melanjutkan hasil fuzzy |

---

## Kriteria Selesai

- [ ] Query `cci kering` → menemukan `Cuci Kering`.
- [ ] Query `cci krinh` → menemukan `Cuci Kering` jika confidence cukup.
- [ ] Query `cuci krinh` → menemukan `Cuci Kering`.
- [ ] Banner `"Menampilkan hasil untuk cuci kering"` muncul jika backend mengoreksi query.
- [ ] Query yang dieja benar menghasilkan hasil yang sama atau lebih baik.
- [ ] Filter aktif (outlet, kategori, unit, harga, dll.) tetap berfungsi bersama query typo.
- [ ] Sort (`relevant`, `cheapest`, `nearest`, `best`, `popular`) tetap berfungsi bersama query typo.
- [ ] Empty state kontekstual tampil saat tidak ada hasil dengan query aktif.
- [ ] Semua widget baru ≤ 100 baris, tidak ada warna hardcode, tidak ada comment.
