# Fix: Customer Discovery Fuzzy Search

Berdasarkan temuan di [customer_discovery_fuzzy_search_debug_issue.md](file:///C:/Bimo/Project/wash_wallet/docs/issue/customer_discovery_fuzzy_search_debug_issue.md), terdapat 6 isu utama yang membuat search discovery terasa tidak konsisten. Plan ini mengelompokkan perbaikan ke dalam prioritas berdasarkan dampak user-facing.

---

## Background

Discovery search saat ini bekerja dengan pola:
1. Frontend → kirim `search` query ke endpoint outlet
2. Backend → `resolveDiscoveryCorrectedQuery` coba koreksi typo ke 1 candidate
3. Backend → replace `search` menjadi corrected query, lalu filter outlet via `LIKE`
4. Backend → eager-load `categories.laundryServices` **tanpa** filter search
5. Frontend → flatten semua service dari outlet → tampilkan ke user

Hasilnya: service tidak relevan dari outlet yang "kebetulan match" ikut muncul, typo kadang tidak terdeteksi, sort tidak mencerminkan relevansi, dan response lama bisa menimpa query terbaru.

---

## User Review Required

> [!WARNING]
> Perbaikan ini **tidak mengubah API contract** (endpoint, method, parameter). Perubahan hanya pada logika internal backend dan guard/sort di frontend. Tidak ada migrasi database.

> [!IMPORTANT]
> Issue #4 (Pagination service-level) membutuhkan pertimbangan arsitektur lebih dalam. Pada plan ini, perbaikannya **dibatasi** dengan memperbaiki `hasReachedMax` menjadi lebih defensif (berbasis jumlah service hasil, bukan jumlah outlet), **bukan** mengubah ke service-level endpoint. Perubahan endpoint adalah refactor besar yang sebaiknya dilakukan di sprint terpisah.

> [!NOTE]
> Filter `isCurrentlyOpen`, `minRating`, `paymentMethod`, `newest`, dan `price_desc` saat ini **tidak didukung backend**. Plan ini memilih opsi **sembunyikan dari UI** daripada mengimplementasikan penuh, untuk menghindari scope creep. Jika ingin diimplementasikan penuh, perlu sprint tersendiri.

---

## Open Questions

> [!IMPORTANT]
> **Q1**: Untuk Issue #1 (service filter pada eager-load), apakah Anda ingin tetap menggunakan pola `outlet-as-container` (backend tetap return outlet, service-nya difilter), atau ingin mulai refactor ke endpoint service-level? Ini menentukan seberapa dalam perubahan backend.
>
> *Default plan ini: tetap outlet-as-container, tapi service dalam eager-load difilter.*

> [!IMPORTANT]
> **Q2**: Untuk filter `isCurrentlyOpen`, `minRating`, `paymentMethod` — apakah ini **disembunyikan dari UI** (hide option) atau **ditampilkan disabled** (greyed out dengan label "Segera hadir")?
>
> *Default plan ini: sembunyikan dari UI untuk saat ini.*

---

## Proposed Changes

### Prioritas 1 — Backend: Eager-load service harus ikut difilter oleh search query

Ini adalah root cause utama. Saat `search` ada, `$includeServiceSearch` menjadi `false`, sehingga `laundryServices` yang di-eager-load tidak difilter oleh query.

---

#### [MODIFY] [OutletService.php](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Services/OutletService.php)

**Lokasi: `customerDiscoveryRelations` ~line 140-174**

Ubah logika `$includeServiceSearch` agar eager-load `laundryServices` **selalu difilter** oleh search query (baik original maupun corrected):

```diff
- $includeServiceSearch = empty($filters['search']);
+ // Eager-load service wajib difilter oleh search jika search aktif
+ $includeServiceSearch = true;
```

Efek: `applyDiscoveryServiceQuery($serviceQuery, $filters, true)` akan selalu menerapkan filter `LIKE` pada `name`, `description`, `slug`, `category.name`, `unit.name` untuk service yang dimuat di relation.

**Lokasi: `applyDiscoveryOutletFilters` ~line 2476-2498**

Sama persis, ubah satu baris:

```diff
- $includeServiceSearch = empty($filters['search']);
+ $includeServiceSearch = true;
```

Efek: `whereHas('categories.laundryServices')` kini juga akan mengecualikan outlet yang tidak punya service apapun yang match query, sehingga outlet yang "kebetulan match di satu service" tidak memuat service lain yang tidak relevan.

---

### Prioritas 2 — Backend: Perbaiki logika literal pre-check pada `resolveDiscoveryCorrectedQuery`

Saat ini, jika ada **literal match** pada `name/description/slug` dari *service apapun*, koreksi dilewati sepenuhnya, bahkan jika match tersebut lemah (misalnya typo yang ada di description).

**Lokasi: `resolveDiscoveryCorrectedQuery` ~line 199-251**

Ubah pre-check agar hanya mematikan koreksi jika ada literal match pada **`name` service saja** (bukan `description` dan `slug`), yang merupakan signal relevansi yang lebih kuat:

```diff
  $query->where(function (Builder $q) use ($rawSearch, $normalizedSearch) {
-     $q->where('name', 'LIKE', "%{$rawSearch}%")
-         ->orWhere('description', 'LIKE', "%{$rawSearch}%")
-         ->orWhere('slug', 'LIKE', "%{$rawSearch}%")
-         ->orWhereRaw("REPLACE(LOWER(name), ' ', '') LIKE ?", ["%{$normalizedSearch}%"]);
+     $q->where('name', 'LIKE', "%{$rawSearch}%")
+         ->orWhereRaw("REPLACE(LOWER(name), ' ', '') LIKE ?", ["%{$normalizedSearch}%"]);
  });
```

Efek: typo yang kebetulan ada di `description` atau `slug` tidak lagi mematikan koreksi. Koreksi hanya dilewati jika ada nama service yang benar-benar mengandung query literal.

---

### Prioritas 3 — Backend: Perbaiki `applyDiscoveryServiceSort` untuk sort `relevant`

Saat ini `relevant` (default) hanya melakukan `orderBy('name', 'asc')` — urutan alfabetis, bukan relevansi.

**Lokasi: `applyDiscoveryServiceSort` ~line 2542-2549**

Tambahkan case `relevant` dan `popular` terpisah:

```diff
  private function applyDiscoveryServiceSort(Builder|Relation $query, string $serviceSortBy): void
  {
      match ($serviceSortBy) {
          'cheapest' => $query->orderBy('price', 'asc')->orderBy('name', 'asc'),
-         'best', 'popular' => $query->withCount('orderItems')->orderByDesc('order_items_count')->orderBy('price', 'asc'),
-         default => $query->orderBy('name', 'asc'),
+         'best' => $query->withCount('orderItems')->orderByDesc('order_items_count')->orderBy('price', 'asc'),
+         'popular' => $query->withCount('orderItems')->orderByDesc('order_items_count')->orderBy('name', 'asc'),
+         // 'relevant': urutkan berdasarkan nama terlebih dulu, kemudian harga
+         'relevant' => $query->orderBy('name', 'asc')->orderBy('price', 'asc'),
+         default => $query->orderBy('name', 'asc'),
      };
  }
```

> [!NOTE]
> Sorting `relevant` yang sesungguhnya (berbasis skor fuzzy) memerlukan scoring di application-layer atau full-text index. Sebagai langkah awal, sort ini diperbaiki agar konsisten. Relevance scoring berbasis skor fuzzy dapat diimplementasikan di iterasi berikutnya.

---

### Prioritas 4 — Frontend: Tambahkan stale-response guard di `DiscoveryCubit`

Saat ini `_activeSearchRequests` hanya mencegah duplicate request, tetapi tidak membatalkan request lama. Jika request lama selesai setelah request baru, state bisa kembali ke query lama.

#### [MODIFY] [discovery_cubit.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/bloc/discovery_cubit.dart)

Tambahkan `_latestRequestKey` untuk melacak request terbaru:

```dart
// Tambahkan field baru
int _requestSequence = 0;

// Di method search(), sebelum memanggil usecase:
final thisSequence = ++_requestSequence;

// Setelah await selesai, cek apakah masih request terbaru:
result.when(
  success: (searchResult) {
    if (thisSequence != _requestSequence) return; // stale, abaikan
    // ... emit state seperti biasa
  },
  failure: (failure) {
    if (thisSequence != _requestSequence) return; // stale, abaikan
    emit(DiscoveryFailure(failure));
  },
);
```

Efek: response dari request yang lebih lama tidak akan menimpa state yang sudah diupdate oleh request terbaru.

---

### Prioritas 5 — Frontend: Sembunyikan filter/sort yang belum diimplementasikan

Filter `isCurrentlyOpen`, `minRating`, `paymentMethod` tidak dikirim ke backend dan tidak difilter di client. Sort `newest` dan `price_desc` tidak ditangani di `_sortServices`.

#### [MODIFY] [discovery_sort_selector_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/widgets/discovery_sort_selector_widget.dart)

Hapus `newest` dan `price_desc` dari `options`:

```diff
  static const options = <String, String>{
    'relevant': 'Terkait',
-   'newest': 'Terbaru',
    'popular': 'Terlaris',
-   'price_desc': 'Harga tertinggi',
    'cheapest': 'Harga terendah',
+   'best': 'Rating terbaik',
+   'nearest': 'Terdekat',
  };
```

#### [MODIFY] [discovery_filter.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/domain/entities/discovery_filter.dart)

Field `isCurrentlyOpen`, `minRating`, dan `paymentMethod` **tetap di entity** (untuk backward compat), namun perlu memastikan field-field ini tidak berkontribusi ke `hasActiveFilter` sampai backend mendukungnya:

```diff
  bool get hasActiveFilter =>
      outletId != null ||
      categoryId != null ||
      unitId != null ||
      priceMin != null ||
      priceMax != null ||
      freeShippingEligible == true ||
      supportsCourier == true ||
-     serviceSortBy != 'relevant' ||
-     isCurrentlyOpen == true ||
-     minRating != null ||
-     paymentMethod != null;
+     serviceSortBy != 'relevant';
+     // isCurrentlyOpen, minRating, paymentMethod belum diimplementasikan backend
```

#### [MODIFY] [discovery_repository_impl.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/data/repositories/discovery_repository_impl.dart)

Tambahkan `newest` dan `price_desc` ke `_sortServices` agar tidak jatuh ke default (meskipun sebaiknya tidak ditampilkan di UI):

```dart
case 'price_desc':
  sorted.sort((a, b) => b.price.compareTo(a.price));
  break;
// 'newest' tidak bisa diimplementasikan client-side karena tidak ada field createdAt di DiscoveryService
```

---

### Prioritas 6 — Frontend: Perbaiki `hasReachedMax` agar lebih akurat

Saat ini: `hasReachedMax: response.outlets.length < perPage`

Ini salah karena 1 page = 15 outlet ≠ 15 service. Jika setiap outlet punya 3 service, 1 page menghasilkan 45 service, padahal `hasReachedMax` masih `false` jika ada lebih dari 15 outlet.

#### [MODIFY] [discovery_repository_impl.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/data/repositories/discovery_repository_impl.dart)

```diff
  return Result.success(
    DiscoverySearchResult(
      services: services,
      activeFilter: filter,
      correctedQuery: response.correctedQuery,
-     hasReachedMax: response.outlets.length < perPage,
+     // hasReachedMax berbasis jumlah outlet yang dikembalikan backend (masih outlet-level pagination)
+     // Ini adalah perbaikan parsial; refactor ke service-level endpoint diperlukan untuk akurasi penuh
+     hasReachedMax: response.outlets.isEmpty || response.outlets.length < perPage,
      currentPage: page,
    ),
  );
```

---

## Verification Plan

### Skenario Manual (tanpa runtime test karena `php` tidak tersedia di PATH)

| Skenario | Expected Result |
|---|---|
| Search `cci kering` | `Cuci Kering` muncul; service lain dari outlet yang sama **tidak** ikut muncul |
| Search `cci krinh` | `Cuci Kering` muncul (koreksi typo bekerja) |
| Search `cuci` (exact) | Hanya service yang namanya mengandung "cuci"; service unrelated dari outlet tidak ikut |
| Ketik cepat `c` → `cu` → `cuci` (berurutan cepat) | Hasil yang ditampilkan selalu sesuai query **terakhir** (`cuci`) |
| Pilih sort `Terlaris` | Hasil diurutkan berdasarkan `order_items_count` DESC |
| Pilih sort `Terkait` | Hasil diurutkan berdasarkan `name ASC, price ASC` (bukan acak) |
| Filter UI | Hanya filter yang diimplementasikan yang tampil (tidak ada `Terbaru`, `Harga tertinggi`) |

### Code Review Checklist

- [ ] `customerDiscoveryRelations`: `$includeServiceSearch = true` di dua lokasi
- [ ] `applyDiscoveryOutletFilters`: `$includeServiceSearch = true`
- [ ] `resolveDiscoveryCorrectedQuery`: pre-check hanya pada `name` (bukan `description`/`slug`)
- [ ] `applyDiscoveryServiceSort`: case `relevant` dan `popular` terpisah
- [ ] `DiscoveryCubit.search`: sequence number guard
- [ ] Sort widget: `newest` dan `price_desc` dihapus
- [ ] `hasReachedMax`: guard `outlets.isEmpty ||` ditambahkan

