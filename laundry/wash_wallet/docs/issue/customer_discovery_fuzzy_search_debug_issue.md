# Customer Discovery Fuzzy Search Debug Issue

Tanggal debug: 2026-06-07

Dokumen ini mencatat hasil debug untuk bug search discovery customer yang terasa tidak konsisten, terutama saat fuzzy/typo search. Dokumen ini ditujukan sebagai bahan acuan plan implementasi oleh model lain.

## Ringkasan Masalah

Search discovery saat ini belum benar-benar melakukan fuzzy search pada query utama. Backend hanya mencoba mengoreksi typo menjadi satu `corrected_query`, lalu tetap menjalankan pencarian literal berbasis `LIKE`. Setelah client-side substring filter di Flutter dihapus, backend juga belum membatasi service yang di-eager-load berdasarkan query search. Kombinasi ini membuat hasil discovery bisa:

- Menampilkan service yang tidak relevan dari outlet yang kebetulan punya satu service yang match.
- Gagal menemukan query typo jika koreksi query tidak lolos threshold.
- Menghasilkan urutan "relevant" yang sebenarnya alfabetis, bukan berdasarkan skor relevansi.
- Terasa berubah-ubah saat user mengetik cepat karena response lama masih bisa menimpa response terbaru.

## Scope yang Dicek

- Frontend customer discovery:
  - `apps/customer/lib/features/discovery/data/datasources/discovery_remote_datasource.dart`
  - `apps/customer/lib/features/discovery/data/repositories/discovery_repository_impl.dart`
  - `apps/customer/lib/features/discovery/presentation/bloc/discovery_cubit.dart`
  - `apps/customer/lib/features/discovery/presentation/screens/discovery_screen.dart`
  - widget search result/filter/sort discovery
- Backend outlet discovery:
  - `webapp/wash_wallet_be/app/Http/Controllers/Api/OutletController.php`
  - `webapp/wash_wallet_be/app/Services/OutletService.php`
  - model `Outlet`, `Category`, `LaundryService`

Catatan: runtime test backend belum bisa dijalankan dari environment ini karena command `php` tidak tersedia di PATH.

## Alur Aktual

1. User mengetik query di `DiscoverySearchBarWidget`; search didebounce 500 ms.
2. `DiscoveryScreen._applyFilter` memanggil `DiscoveryCubit.updateFilter`.
3. `DiscoveryRemoteDatasource.fetchDiscoveryOutlets` mengirim `includeServices=true`, `isExposure=true`, `search`, filter harga/kategori/unit/kurir, dan `serviceSortBy` ke endpoint outlet/nearby.
4. `OutletController.index` atau `nearby` memanggil `OutletService.resolveDiscoveryCorrectedQuery`.
5. Jika backend menemukan kandidat koreksi, controller mengganti `$filters['search']` menjadi `corrected_query`.
6. `OutletService.getAll` atau `getNearby` tetap mem-filter outlet memakai `LIKE`.
7. Response backend berisi outlet beserta `categories.laundryServices`.
8. Flutter repository mem-flatten outlet menjadi list `DiscoveryService`.

## Temuan Utama

### 1. Backend mem-filter outlet, tetapi eager-loaded service tidak dibatasi oleh search

File: `webapp/wash_wallet_be/app/Services/OutletService.php`

Bagian yang relevan:

- `customerDiscoveryRelations` sekitar line 140-170.
- `applyDiscoveryOutletFilters` sekitar line 2476-2498.
- `applyDiscoveryServiceQuery` sekitar line 2501-2540.

Masalahnya ada pada pola ini:

```php
$includeServiceSearch = empty($filters['search']);
```

Saat query search ada, `$includeServiceSearch` menjadi `false`. Akibatnya `applyDiscoveryServiceQuery(..., false)` tidak menerapkan filter `LIKE` ke `laundryServices`; ia hanya mem-filter active service dan filter exact seperti category/unit/price/courier.

Dampak:

- Query seperti `cuci kering` atau typo yang dikoreksi ke `Cuci Kering` hanya dipakai untuk menentukan outlet mana yang masuk.
- Setelah outlet masuk, relation `categories.laundryServices` dapat memuat semua service aktif dari outlet/kategori tersebut.
- Flutter kemudian mem-flatten semua service itu sebagai hasil search.

Ini kemungkinan penyebab utama hasil search terasa "agak-agak": service yang tidak mengandung intent pencarian ikut muncul karena berasal dari outlet yang punya minimal satu service yang match.

Ekspektasi:

- Jika discovery adalah search service, backend harus mengembalikan hanya service yang relevan dengan query original/corrected/fuzzy.
- Jika ingin tetap mengembalikan outlet sebagai container, relation `categories.laundryServices` tetap harus dipersempit ke service yang match query atau kandidat fuzzy.

### 2. Fuzzy search saat ini hanya correction step, bukan search/ranking utama

File: `webapp/wash_wallet_be/app/Services/OutletService.php`

Bagian yang relevan:

- `resolveDiscoveryCorrectedQuery` sekitar line 199-250.
- `scoreDiscoveryCandidate` sekitar line 2460-2474.
- `applyDiscoverySearch` sekitar line 2357-2383.

`resolveDiscoveryCorrectedQuery` melakukan:

1. Cek apakah query raw sudah match literal pada `name`, `description`, `slug`, atau normalized `name`.
2. Jika sudah ada literal match, tidak ada koreksi.
3. Jika tidak ada match, ambil sampai 250 nama service unik.
4. Hitung skor `max(similar_text, levenshtein)`.
5. Jika skor terbaik minimal 62, return satu nama service sebagai corrected query.
6. Controller mengganti search menjadi corrected query.
7. Search berikutnya tetap `LIKE "%corrected_query%"`.

Dampak:

- Jika kandidat terbaik tidak masuk 250 nama pertama berdasarkan `orderBy('name')`, search typo bisa gagal walaupun service relevan ada.
- Jika typo tidak lolos threshold 62, tidak ada fuzzy fallback.
- Jika ada beberapa service mirip, hanya satu kandidat global yang dipilih; tidak ada ranking per service.
- Query typo pada kategori, unit, outlet, atau deskripsi tidak benar-benar discoring karena kandidat koreksi hanya `pluck('name')`.
- Search "relevant" tidak memakai skor fuzzy; `applyDiscoveryServiceSort` default-nya `orderBy('name', 'asc')`.

Ekspektasi:

- Fuzzy matching perlu menjadi bagian dari query/ranking service, bukan hanya pre-step untuk mengganti search.
- Relevance score harus bisa membatasi dan mengurutkan service.

### 3. Literal pre-check bisa mematikan correction pada hasil yang kurang relevan

File: `webapp/wash_wallet_be/app/Services/OutletService.php`, `resolveDiscoveryCorrectedQuery` sekitar line 211-220.

Backend tidak mengoreksi query jika ada service yang literal-match pada `name`, `description`, `slug`, atau normalized `name`. Ini berisiko karena:

- Typo bisa kebetulan muncul di deskripsi/slug service yang kurang relevan.
- Setelah pre-check menemukan match literal, corrected query menjadi `null`.
- Search lanjut memakai raw query typo, bukan kandidat terbaik.

Dampak user-facing:

- Pada beberapa data, typo yang semestinya dikoreksi bisa tidak dikoreksi karena ada literal match lemah.
- Ini membuat perilaku "kadang benar, kadang aneh" sangat bergantung pada isi description/slug.

### 4. Pagination service tidak konsisten karena backend mem-paginate outlet

File:

- `webapp/wash_wallet_be/app/Http/Controllers/Api/OutletController.php`
- `apps/customer/lib/features/discovery/data/repositories/discovery_repository_impl.dart`

Backend response dipaginate sebagai outlet. Frontend menampilkan hasil sebagai flattened service.

Di Flutter:

```dart
hasReachedMax: response.outlets.length < perPage,
```

Dampak:

- `perPage=15` berarti 15 outlet, bukan 15 service.
- Satu page bisa menghasilkan jauh lebih banyak dari 15 service.
- `hasReachedMax` tidak menunjukkan apakah service search sudah habis; hanya outlet page yang habis.
- Sorting/pagination service-level menjadi sulit diprediksi.

Ekspektasi:

- Discovery search sebaiknya service-level endpoint/result.
- Jika tetap memakai outlet endpoint, backend perlu mengembalikan metadata service-level atau membatasi loaded service sesuai query dan page.

### 5. Response lama bisa menimpa response terbaru saat user mengetik cepat

File: `apps/customer/lib/features/discovery/presentation/bloc/discovery_cubit.dart`

Bagian yang relevan:

- `_activeSearchRequests` sekitar line 21.
- `search` sekitar line 131-194.

`_activeSearchRequests` hanya mencegah request duplikat dengan key yang sama. Ia tidak membatalkan request lama dan tidak mengecek apakah response yang selesai masih sesuai dengan filter terbaru.

Skenario:

1. User mengetik `cci`.
2. Request A berjalan.
3. User lanjut mengetik `cci krinh`.
4. Request B berjalan.
5. Jika request A selesai setelah B, state bisa kembali ke hasil `cci`.

Dampak:

- Search terasa random terutama pada fuzzy query yang lebih lambat karena backend melakukan candidate scan.
- Result list bisa tidak sesuai dengan text terakhir di search bar.

Ekspektasi:

- Simpan `latestRequestKey` atau sequence number.
- Saat response selesai, emit hanya jika request masih request terbaru.

### 6. Beberapa filter/sort discovery tampil aktif tetapi tidak benar-benar diterapkan

File:

- `apps/customer/lib/features/discovery/domain/entities/discovery_filter.dart`
- `apps/customer/lib/features/discovery/data/datasources/discovery_remote_datasource.dart`
- `apps/customer/lib/features/discovery/data/repositories/discovery_repository_impl.dart`
- `apps/customer/lib/features/discovery/presentation/widgets/discovery_sort_selector_widget.dart`

Filter ada di `DiscoveryFilter`, UI, dan count filter:

- `isCurrentlyOpen`
- `minRating`
- `paymentMethod`

Namun datasource tidak mengirim parameter ini ke backend, dan repository tidak mem-filter field tersebut di client.

Sort selector juga menawarkan:

- `newest`
- `price_desc`

Tetapi backend `applyDiscoveryServiceSort` hanya menangani `cheapest`, `best`, `popular`, dan default `name asc`. Repository juga tidak menangani `newest`/`price_desc`.

Dampak:

- User bisa memilih filter/sort yang terlihat aktif, tetapi hasil search tidak berubah sesuai ekspektasi.
- Ini bukan fuzzy bug langsung, tetapi memperkuat persepsi search discovery tidak konsisten.

## Root Cause Ringkas

Root cause utama ada di kontrak data yang belum konsisten:

- UI menampilkan search service-level.
- Backend endpoint yang dipakai masih outlet-level.
- Backend fuzzy hanya mengubah query menjadi satu corrected service name.
- Relation service yang dikirim tidak dipersempit sesuai query saat search aktif.
- Frontend mem-flatten semua service dari outlet response tanpa ranking/relevance score.

## Dampak User-Facing

- Query typo seperti `cci krinh` bisa menemukan outlet yang punya `Cuci Kering`, tetapi daftar hasil bisa berisi service lain dari outlet yang sama.
- Query exact seperti `cuci` juga bisa menampilkan service non-cuci dari outlet yang match.
- Urutan `Terkait` tidak selalu terasa terkait karena default sorting berbasis nama service.
- Saat mengetik cepat, hasil bisa kembali ke query lama.
- Filter/sort tertentu terlihat aktif tetapi tidak mempengaruhi hasil.

## Rekomendasi Arah Plan

1. Jadikan discovery search sebagai service-level search. Backend sebaiknya mengembalikan service result langsung, bukan outlet yang kemudian di-flatten.
2. Jika endpoint outlet tetap dipakai, eager-loaded `categories.laundryServices` wajib dibatasi ke service yang match query original/corrected/fuzzy.
3. Tambahkan relevance score di backend untuk query search. Score ini dipakai untuk filter threshold dan sort `relevant`.
4. Hindari `limit(250)->pluck('name')` sebagai satu-satunya sumber fuzzy candidate. Minimal, candidate harus mencakup semua service eligible dalam filter aktif atau memakai pendekatan full-text/trigram/index yang stabil.
5. Jangan hanya mengoreksi ke satu `corrected_query`; simpan original query, corrected query, dan service match ids/scores agar filtering tidak melebar.
6. Tambahkan stale-response guard di `DiscoveryCubit.search`.
7. Samakan kontrak filter/sort UI dengan backend. Jika `minRating`, `paymentMethod`, `isCurrentlyOpen`, `newest`, atau `price_desc` belum didukung, jangan tampilkan dulu atau implementasikan penuh.
8. Tambahkan test regression khusus discovery search:
   - `cci kering` -> hanya service relevan seperti `Cuci Kering`.
   - `cci krinh` -> `Cuci Kering` muncul dan service unrelated dari outlet yang sama tidak ikut muncul.
   - query exact `cuci` -> tidak menampilkan service unrelated dari outlet yang sama.
   - rapid query response lama tidak menimpa query terbaru.
   - filter/sort aktif benar-benar mengubah hasil atau tidak ditampilkan.

## Kandidat Acceptance Criteria untuk Plan

- Search `cci krinh` menampilkan `Cuci Kering` jika service aktif dan outlet exposed.
- Hasil search tidak berisi service unrelated dari outlet yang hanya kebetulan match pada service lain.
- Sort `relevant` mengurutkan berdasarkan skor relevansi, bukan alfabetis.
- `corrected_query` tetap dikirim ketika backend mengoreksi query.
- Search result count/pagination merepresentasikan service result, bukan outlet container.
- Filter dan sort yang tampil di UI semuanya punya efek nyata.
- Response query lama tidak boleh mengganti hasil query terbaru.
