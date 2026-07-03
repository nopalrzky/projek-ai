# User Need: Pagination Tablet Cashier dan Production

Tanggal: 2026-07-01

Dokumen ini adalah user need untuk AI planner berikutnya. Dokumen ini bukan implementation plan final dan tidak meminta implementasi kode pada tahap ini. Tujuannya adalah memastikan planner berikutnya berangkat dari kondisi codebase terkini dan dari kontrak produk yang benar.

## 1. Ringkasan Kebutuhan Produk

Semua halaman index/list tablet di `apps/cashier` dan `apps/production` harus memakai numbered pagination yang konsisten, reusable, dan berbasis metadata pagination dari server.

Kebutuhan utama:

1. Tablet/non-compact memakai numbered pagination dengan nomor halaman, prev/next, ellipsis, range info, active state, dan disabled state.
2. Compact/mobile tetap memakai pola list/load-more/infinite-scroll existing. Jangan memaksa compact memakai numbered pagination.
3. Pagination tablet harus memakai shared `PaginatedData<T>` dan shared pagination UI, bukan widget pagination lokal per screen.
4. Page change di tablet harus mengganti data halaman saat ini, bukan append.
5. Search, filter, sort, refresh, dan perubahan tab/status harus reset ke page `1`.
6. Metadata pagination harus berasal dari response server. Parser tidak boleh menebak `lastPage` dari `items.length`.

## 2. Target Path dan Referensi

Target aplikasi:

1. `apps/cashier`
2. `apps/production`

Shared Flutter yang relevan:

1. `packages/wash_wallet_core/lib/src/models/paginated_data.dart`
2. `packages/wash_wallet_ui/lib/src/components/pagination/app_pagination.dart`
3. `packages/wash_wallet_ui/lib/src/components/data_view/app_data_view.dart`
4. `packages/wash_wallet_ui/lib/src/components/data_view/app_data_table.dart`

Referensi UX web owner yang wajib dibaca planner:

1. `webapp/wash_wallet_be/resources/js/Components/Pagination/Pagination.tsx`
2. `webapp/wash_wallet_be/resources/js/Components/Pagination/PaginationItem.tsx`
3. `webapp/wash_wallet_be/resources/js/Components/Pagination/types.ts`
4. `webapp/wash_wallet_be/resources/js/Components/DataTable/DataTable.tsx`

## 3. Kontrak Backend Canonical

Kontrak canonical metadata pagination untuk Flutter tablet adalah camelCase:

1. `currentPage`
2. `lastPage`
3. `perPage`
4. `total`
5. `from`
6. `to`

Response index/list yang dipakai tablet harus membawa `items/data` plus metadata di atas. Selama transisi, parser Flutter boleh dan sebaiknya toleran terhadap snake_case dari Laravel default:

1. `current_page`
2. `last_page`
3. `per_page`

Namun sumber kebenaran produk tetap camelCase karena API helper/resource backend mobile saat ini sudah banyak memakai `currentPage`, `lastPage`, `perPage`, `total`, `from`, dan `to`.

Aturan penting:

1. `lastPage` wajib dari metadata server, bukan dari `items.length`, `hasReachedMax`, atau pembulatan lokal per screen.
2. `total` adalah total hasil setelah search/filter/sort diterapkan.
3. `from` dan `to` adalah range item yang sedang ditampilkan menurut server.
4. `from`/`to` boleh null untuk empty result, tetapi empty result harus tetap dibedakan dari metadata yang hilang.
5. Jika endpoint belum mengembalikan metadata lengkap, planner boleh menuntut update API/helper backend. Jangan membuat perhitungan manual berbeda di setiap screen.

## 4. Target UX Tablet

UX harus mengikuti web owner:

1. Sembunyikan pagination jika `lastPage <= 1` atau `total == 0`.
2. Tampilkan range info: `Menampilkan x sampai y dari total hasil`.
3. Gunakan tombol previous berlabel `Sebelumnya`.
4. Gunakan tombol next berlabel `Berikutnya`.
5. Tampilkan nomor halaman.
6. Current page punya active state yang jelas.
7. Jumlah halaman besar memakai ellipsis.
8. Disable semua action saat loading.
9. Disable `Sebelumnya` saat `currentPage <= 1`.
10. Disable `Berikutnya` saat `currentPage >= lastPage`.
11. Disable action jika `onPageChanged` null.
12. Jangan fetch ulang jika user memilih halaman yang sama dengan `currentPage`.
13. Jangan fetch page invalid, misalnya `< 1` atau `> lastPage`.
14. Layout harus aman di tablet portrait dan landscape, tanpa overflow.
15. Styling harus memakai token/theme shared UI, bukan hardcoded per screen.

## 5. Audit Current State

### Shared Core

`PaginatedData<T>` sudah ada di `packages/wash_wallet_core/lib/src/models/paginated_data.dart` dan saat audit ini sudah memiliki:

1. `items`
2. `currentPage`
3. `lastPage`
4. `perPage`
5. `total`
6. `from`
7. `to`
8. getter `hasReachedMax`

Artinya planner berikutnya tidak perlu menganggap model shared belum ada. Fokusnya adalah memastikan semua layer index/list yang butuh pagination tidak lagi membuang metadata ini.

### Shared UI

`AppPagination` sudah ada dan diekspor dari `packages/wash_wallet_ui`. Komponen ini sudah mengarah ke UX target:

1. hide jika `lastPage <= 1` atau `total == 0`;
2. menampilkan `Menampilkan x sampai y dari total hasil` jika `from` dan `to` tersedia;
3. memakai label `Sebelumnya` dan `Berikutnya`;
4. menampilkan nomor halaman, active state, dan ellipsis;
5. menerima `isLoading`;
6. menerima nullable `onPageChanged`.

Gap yang masih harus dikunci planner:

1. Tambahkan/pertahankan widget test agar behavior `AppPagination` tidak regresi.
2. Pastikan semua screen tablet memakai `AppPagination` melalui shared integration, bukan membuat pagination lokal baru.

### AppDataView dan AppDataTable

`AppDataView<T>` dan `AppDataTable<T>` sudah menerima field pagination:

1. `totalCount`
2. `currentPage`
3. `pageSize`
4. `lastPage`
5. `from`
6. `to`
7. `onPageChanged`

`AppDataTable` sudah memakai `AppPagination`, tetapi integrasinya belum lengkap:

1. `AppDataTable` belum meneruskan `isLoading` ke `AppPagination`.
2. `AppDataTable` mengganti `onPageChanged == null` menjadi callback kosong, sehingga disabled state berbasis nullable callback bisa keliru.
3. `AppDataView` hanya meneruskan metadata yang diterima. Mayoritas screen Cashier belum memberi metadata lengkap karena state/data layer-nya belum membawa metadata.
4. `pageSize` masih ada sebagai parameter legacy, tetapi target tablet final harus memakai `lastPage/from/to/total/currentPage/perPage` dari server.

### Cashier

Mayoritas fitur Cashier masih memakai pola `Result<List<T>>`, `List<T>`, `hasReachedMax`, dan `currentPage`. Beberapa cubit masih menebak akhir data dari `items.length < perPage` atau `items.isEmpty || items.length < perPage`.

Screen tablet Cashier yang sudah banyak memakai `AppDataView`, tetapi belum membawa metadata lengkap, antara lain:

1. `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`
2. `apps/cashier/lib/features/customer/presentation/screens/index_customers_screen.dart`
3. `apps/cashier/lib/features/category/presentation/screens/index_categories_screen.dart`
4. `apps/cashier/lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart`
5. `apps/cashier/lib/features/service_package/presentation/screens/index_service_packages_screen.dart`
6. `apps/cashier/lib/features/membership_plan/presentation/screens/index_membership_plan_screen.dart`
7. `apps/cashier/lib/features/deposit/presentation/screens/index_deposit_screen.dart`
8. `apps/cashier/lib/features/expense/presentation/screens/index_expense_screen.dart`
9. `apps/cashier/lib/features/petty_cash/presentation/screens/index_petty_cash_screen.dart`

`unit` sudah lebih dekat ke target karena state membawa `lastPage`, `total`, `from`, `to`, dan `perPage` dari `PaginatedData`. Namun cubit masih append data pada `page > 1`, sehingga behavior tablet belum benar jika dipakai untuk numbered pagination.

Planner perlu mengaudit juga list management lain seperti account, employee, membership contract, dan customer subscription jika tampil sebagai index tablet.

### Production

Production order dan order item sudah lebih dekat ke target dibanding Cashier:

1. `apps/production/lib/features/order/domain/usecases/get_all_usecase.dart` memakai `Result<PaginatedData<Order>>`.
2. `apps/production/lib/features/order_item/domain/usecases/get_all_usecase.dart` memakai `Result<PaginatedData<OrderItem>>`.
3. State order/order item sudah membawa `currentPage`, `lastPage`, `total`, `from`, `to`, dan `perPage`.
4. `order_queued_tab.dart` dan `order_in_progress_tab.dart` sudah menampilkan `AppPagination` pada tablet.

Gap Production yang harus diselesaikan:

1. Parser datasource order/order item masih membaca `current_page`, `last_page`, dan `per_page`, sementara kontrak canonical backend untuk mobile/API helper adalah camelCase.
2. Parser perlu toleran camelCase dan snake_case selama transisi.
3. Cubit order/order item masih append data pada `page > 1`; tablet page change harus replace.
4. Pagination pada tab/card-list boleh tetap memakai shared `AppPagination`, tetapi logika metadata dan page-change behavior harus shared dan konsisten, bukan bercabang lokal per tab.
5. Pickup schedule atau list operasional production lain perlu diaudit jika memakai list paginated.

## 6. Masalah yang Harus Diselesaikan Planner

1. Cashier kehilangan metadata pagination di banyak layer karena repository/usecase mengembalikan `Result<List<T>>`.
2. Screen `AppDataView` Cashier belum mengirim `lastPage`, `from`, `to`, `total`, dan `onPageChanged` secara lengkap.
3. Production sudah membawa metadata, tetapi parser belum cocok dengan camelCase canonical.
4. Production dan sebagian Cashier yang sudah punya `PaginatedData` masih append pada `page > 1`.
5. `AppDataTable` belum meneruskan loading dan nullable callback dengan benar ke `AppPagination`.
6. `hasReachedMax` masih dibutuhkan compact/mobile, tetapi tidak boleh menjadi sumber page number tablet.
7. Belum ada test plan yang mengunci parser camel/snake, replace-vs-append, dan shared pagination UI.

## 7. Behavior Wajib

Untuk tablet/non-compact:

1. Initial load fetch page `1`.
2. Search reset ke page `1`.
3. Filter apply/reset reset ke page `1`.
4. Sort change reset ke page `1`.
5. Refresh reset ke page `1`, kecuali planner membuat alasan produk yang jelas untuk mempertahankan page aktif.
6. Tab/status change reset ke page `1`.
7. Klik nomor halaman fetch page target.
8. Klik `Sebelumnya` fetch `currentPage - 1`.
9. Klik `Berikutnya` fetch `currentPage + 1`.
10. Result page baru mengganti `items` saat ini.
11. Result page baru tidak boleh append ke list existing.
12. Loading page change harus men-disable pagination dan memakai loading indicator existing.

Untuk compact/mobile:

1. Pola existing tetap berlaku.
2. List boleh append data saat load-more.
3. `hasReachedMax` boleh tetap dipakai untuk infinite scroll/load-more.
4. Jangan mengubah layout compact/mobile selain menjaga kompatibilitas state.

## 8. Arahan Implementasi untuk Planner Berikutnya

Planner berikutnya sebaiknya mengarahkan implementasi ke shared contract dan shared component.

Arahan minimum:

1. Pakai `PaginatedData<T>` sebagai shared result untuk endpoint index/list yang butuh tablet pagination.
2. Jika perlu model tambahan seperti `PaginationMeta`, jadikan adapter di shared layer, bukan model lokal per screen.
3. Buat parser metadata terpusat yang membaca camelCase sebagai canonical dan toleran snake_case selama transisi.
4. Jangan menebak `lastPage` dari `items.length`.
5. Update repository/usecase/cubit Cashier agar metadata tidak hilang.
6. Update Production parser order/order item agar membaca camelCase dan snake_case.
7. Update cubit/state agar form factor bisa membedakan behavior replace tablet dan append compact, atau gunakan method eksplisit untuk page-change tablet.
8. Update `AppDataTable`/`AppDataView` agar metadata lengkap, `isLoading`, dan nullable `onPageChanged` diteruskan dengan benar.
9. Gunakan `AppPagination` untuk tablet card-list yang tidak cocok memakai `AppDataTable`.
10. Hindari widget pagination lokal di screen.

## 9. Scope Halaman

Scope utama adalah semua halaman index/list tablet di Cashier dan Production.

Cashier tablet:

1. Order index.
2. Customer index.
3. Category index.
4. Laundry service index.
5. Service package index.
6. Membership plan index.
7. Membership contract index jika tampil sebagai index tablet.
8. Customer subscription/customer membership index jika tampil sebagai index tablet.
9. Deposit index.
10. Expense index.
11. Petty cash index.
12. Unit index.
13. Employee, account, atau list management lain yang tampil sebagai index tablet.

Production tablet:

1. Order queued.
2. Order in progress.
3. Order item list/antrian produksi.
4. Pickup schedule jika memakai list paginated.
5. Tab/card-list operasional lain yang memakai pagination server.

Daftar ini adalah target audit minimum. Requirement utamanya tetap semua index/list tablet di `apps/cashier` dan `apps/production`.

## 10. Non-goals

1. Tidak mengganti pola compact/mobile menjadi numbered pagination.
2. Tidak membuat desain pagination custom per fitur.
3. Tidak melakukan rewrite layout besar yang tidak dibutuhkan pagination.
4. Tidak mengubah bisnis backend selain memastikan endpoint index/list mengembalikan metadata pagination lengkap.
5. Tidak menghapus `hasReachedMax` jika masih dipakai mobile/load-more.
6. Tidak melakukan implementasi kode pada tahap dokumen user need ini.

## 11. Acceptance Criteria untuk Implementasi Berikutnya

Implementasi berikutnya dianggap memenuhi user need jika:

1. Semua index/list tablet Cashier memakai shared pagination.
2. Semua index/list tablet Production memakai shared pagination.
3. Pagination muncul di semua list tablet yang punya `lastPage > 1` dan `total > 0`.
4. Pagination disembunyikan jika `lastPage <= 1` atau `total == 0`.
5. Metadata berasal dari server dan membawa `currentPage`, `lastPage`, `perPage`, `total`, `from`, dan `to`.
6. Parser Flutter membaca camelCase dan toleran snake_case selama transisi.
7. Tablet page change mengganti data halaman saat ini, bukan append.
8. Compact/mobile tetap append/load-more tanpa regresi UX.
9. Search/filter/sort/refresh/tab/status change reset ke page `1`.
10. UI mengikuti web owner: range info, `Sebelumnya`, `Berikutnya`, nomor halaman, active state, ellipsis, disabled loading/boundary.
11. Tidak ada overflow di tablet portrait atau landscape.
12. `AppDataTable`/`AppDataView` meneruskan metadata lengkap, `isLoading`, dan nullable `onPageChanged` dengan benar.
13. Tidak ada variasi pagination lokal per page.

## 12. Test Plan yang Harus Diturunkan Planner

Planner berikutnya wajib menurunkan test plan minimal:

1. Widget test `AppPagination`:
   - hide ketika `lastPage <= 1`;
   - hide ketika `total == 0`;
   - render range `Menampilkan x sampai y dari total hasil`;
   - render `Sebelumnya` dan `Berikutnya`;
   - render nomor halaman dan ellipsis;
   - active state current page;
   - disabled state saat loading dan boundary;
   - callback tidak dipanggil untuk page sama atau page invalid.
2. Widget test `AppDataView`/`AppDataTable`:
   - menerima metadata lengkap;
   - meneruskan `isLoading` ke pagination;
   - meneruskan nullable `onPageChanged` tanpa no-op;
   - tidak render pagination untuk empty/single page.
3. Parser metadata test:
   - camelCase canonical;
   - snake_case fallback;
   - tidak menebak `lastPage` dari `items.length`;
   - empty result dengan metadata valid.
4. Cubit test:
   - tablet page change replace items;
   - compact load-more append items;
   - search/filter/sort/refresh/tab/status reset page `1`.
5. Manual regression:
   - Cashier tablet portrait dan landscape untuk scope utama;
   - Production tablet portrait dan landscape untuk scope utama;
   - compact Android/mobile untuk screen yang sama.

## 13. Acceptance Dokumen Ini

Dokumen user need ini memenuhi deliverable jika:

1. File berada di `docs/user_need/cashier_production_tablet_pagination_user_need.md`.
2. Dokumen menyebut path target `apps/cashier` dan `apps/production`.
3. Dokumen menyebut current-state audit shared `PaginatedData`, `AppPagination`, `AppDataView`, dan `AppDataTable`.
4. Dokumen menjadikan camelCase metadata sebagai kontrak backend canonical.
5. Dokumen mencatat toleransi parser camelCase/snake_case selama transisi.
6. Dokumen mencatat Cashier mayoritas masih `Result<List<T>>`.
7. Dokumen mencatat Production order/order item sudah memakai `PaginatedData`, tetapi parser dan append behavior masih perlu diperbaiki.
8. Dokumen menyebut UX target web owner.
9. Dokumen menyebut scope screen, non-goals, acceptance criteria, dan test plan.
