# User Need: Redesign Filter Order Tablet Cashier

Tanggal: 2026-06-30

Dokumen ini menjadi acuan kebutuhan untuk AI model lain saat menyusun implementation plan. Fokusnya adalah redesign filter halaman order di aplikasi kasir tablet agar mengikuti pola web dashboard: top bar horizontal, filter panel/dropdown terstruktur, dan pengalaman yang lebih compact untuk tablet.

## 1. Ringkasan Kebutuhan

User membutuhkan halaman daftar order pada Cashier App versi tablet yang lebih modern dan efisien. Area filter harus dibuat ulang agar tidak terasa seperti pola mobile yang diperbesar.

Kebutuhan utama:

1. Gunakan top bar horizontal berisi search field, tombol filter, dan tombol action utama seperti `Pesanan Baru`.
2. Saat filter dibuka, tampilkan panel/dropdown terstruktur di bawah toolbar, bukan modal fullscreen dan bukan bottom sheet mobile.
3. Panel filter harus compact, mudah discan, dan mengikuti rasa visual web dashboard.
4. Filter yang diharapkan tersedia minimal mencakup status order, status pembayaran, tanggal order, estimasi selesai, outlet atau outlet aktif, dan range nominal.
5. Filter aktif harus terlihat sebagai pills/chips yang bisa dihapus satu per satu.
6. Mobile layout tidak menjadi target redesign utama dan harus tetap aman.

## 2. Konteks Codebase Saat Ini

Hasil review source terbaru:

1. Halaman utama order cashier ada di `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`.
2. `IndexOrdersScreen` punya dua mode:
   - compact/mobile memakai `OrderSearchBar` dan `OrderFilterChips`;
   - tablet/non-compact memakai `AppDataView<Order>`.
3. Mode tablet sudah memiliki toolbar horizontal dari `AppDataView`/`IndexToolbar` dengan search field, tombol filter, dan primary action `Pesanan Baru`.
4. Filter tablet saat ini hanya satu: `status` dengan `FilterType.singleSelect`.
5. `_loadData()` saat ini hanya mengirim `outletId`, `search`, dan `status` ke `OrderCubit.getAll()`.
6. `IndexToolbar` berada di `packages/wash_wallet_ui/lib/src/components/data_view/index_toolbar.dart`.
7. `IndexToolbar` saat ini masih membuka filter lewat `showModalBottomSheet`, sehingga terasa mobile-first untuk tablet.
8. `IndexToolbar._buildFilterSection()` saat ini hanya merender `FilterType.singleSelect`.
9. Model filter shared sudah lebih siap daripada UI-nya: `FilterType` sudah memiliki `singleSelect`, `multiSelect`, `dateRange`, `numberRange`, dan `textInput`.
10. `AppDataView` dipakai oleh beberapa halaman cashier lain seperti customer, category, laundry service, deposit, expense, petty cash, service package, membership plan, dan order. Perubahan shared toolbar harus backward compatible.

## 3. Kapabilitas Data yang Sudah Ada

Jalur data order sudah mendukung filter lebih lengkap dari UI tablet saat ini.

`OrderCubit.getAll()`, usecase, repository, dan remote datasource sudah menerima parameter:

1. `search`
2. `status`
3. `paymentStatus`
4. `outletId`
5. `customerId`
6. `employeeId`
7. `orderDateFrom`
8. `orderDateTo`
9. `estimatedCompletionFrom`
10. `estimatedCompletionTo`
11. `totalAmountMin`
12. `totalAmountMax`
13. `sortBy`
14. `sortDirection`
15. `page`
16. `perPage`

Remote datasource sudah mengirim parameter ini sebagai query API, termasuk `orderDate.from`, `orderDate.to`, `estimatedCompletion.from`, `estimatedCompletion.to`, `totalAmount.min`, dan `totalAmount.max`. Karena itu, kebutuhan ini seharusnya tidak memerlukan perubahan backend untuk filter dasar yang sudah tersedia.

Status pembayaran yang ditemukan di backend/shared UI:

1. `not_yet_priced` - Belum Harga / Belum Dihargai
2. `unpaid` - Belum Bayar
3. `partial` - Sebagian
4. `paid` - Lunas
5. `refunded` - Refund
6. `paid_by_package` - Paket
7. `cod` - COD / Bayar di Tempat

## 4. Referensi Web Dashboard

Web dashboard order memakai pola filter yang lebih matang:

1. `FilterBar` menampilkan search field, tombol filter, action button, filter pills, dan panel filter.
2. `FilterPanel` expand inline, bukan modal fullscreen.
3. Filter panel memakai grid responsive 1 sampai 3 kolom.
4. Panel punya action footer seperti Clear All, Cancel, dan Apply.
5. Order dashboard web punya filter: outlet, customer, employee, status order, status pembayaran, tanggal order, estimasi selesai, dan total amount.

Untuk Cashier App tablet, yang perlu diambil adalah pola UX dan struktur visualnya, bukan menyalin semua detail web secara mentah.

## 5. User Need Detail

### 5.1 Top Bar Horizontal

Pada layout tablet daftar order, toolbar harus menjadi area kerja utama yang ringkas:

1. Search field berada di kiri dan tetap mudah dijangkau.
2. Tombol Filter berada setelah search dan menampilkan indikasi jumlah filter aktif.
3. Tombol action utama seperti `Pesanan Baru` tetap berada di kanan.
4. Active filter pills tampil dekat toolbar agar kasir paham data sedang tersaring.
5. Toolbar harus nyaman untuk tablet portrait dan landscape, tanpa overflow.

Catatan: struktur top bar dasar sudah ada lewat `IndexToolbar`, sehingga kebutuhan utamanya adalah menyempurnakan behavior filter dan active filters, bukan membuat toolbar dari nol.

### 5.2 Filter Panel / Dropdown

Saat tombol Filter ditekan:

1. Jangan gunakan modal fullscreen.
2. Jangan gunakan bottom sheet untuk tablet.
3. Tampilkan panel/dropdown inline di bawah toolbar.
4. Panel boleh push konten tabel ke bawah agar konteks halaman tetap terlihat.
5. Panel harus bisa dibuka dan ditutup dari tombol Filter.
6. Panel sebaiknya memakai animasi ringan agar terasa modern.
7. Panel harus memakai surface, border, radius, spacing, dan typography dari `wash_wallet_ui`.
8. Panel harus tetap compact dan tidak mengambil tinggi layar berlebihan.

### 5.3 Input Filter yang Dibutuhkan

Filter minimum untuk tablet cashier:

1. Status Order
   - Tipe: single select.
   - Gunakan opsi status order yang valid dari model/backend.

2. Status Pembayaran
   - Tipe: single select.
   - Gunakan status pembayaran valid yang sudah ditemukan di codebase.

3. Tanggal Order
   - Tipe: date range.
   - Mengisi `orderDateFrom` dan `orderDateTo`.

4. Estimasi Selesai
   - Tipe: date range.
   - Mengisi `estimatedCompletionFrom` dan `estimatedCompletionTo`.

5. Range Nominal
   - Tipe: number range.
   - Mengisi `totalAmountMin` dan `totalAmountMax`.

6. Outlet
   - User meminta filter outlet sebagai salah satu input.
   - Kondisi source saat ini: route order cashier selalu memakai `authState.employee.outletId`, dan `IndexOrdersScreen` menerima `outletId` sebagai konteks single outlet.
   - Jika Cashier App memang hanya bekerja pada outlet aktif employee, outlet tidak perlu menjadi dropdown bebas; tampilkan sebagai konteks outlet aktif atau tetap kirim `outletId` tersembunyi.
   - Jika plan berikutnya ingin mendukung multi-outlet cashier, filter outlet boleh dibuat sebagai select, tetapi harus mengikuti data dan permission yang sudah tersedia. Jangan menambah API baru hanya untuk memaksakan outlet filter jika konteks produk masih single-outlet.

Filter customer dan employee dari web dashboard tidak wajib untuk tahap ini. Search field sudah menutup kebutuhan pencarian pelanggan/order secara umum, dan cashier tablet sebaiknya tetap compact.

### 5.4 Active Filter Pills

Setiap filter aktif harus terlihat sebagai chip/pill.

Contoh label:

1. `Status: Diterima`
2. `Pembayaran: Lunas`
3. `Tanggal: 2026-06-01 - 2026-06-30`
4. `Nominal: 100000 - 500000`

Kebutuhan:

1. Filter pills bisa dihapus satu per satu.
2. Ada aksi reset/clear all untuk menghapus semua filter aktif.
3. Menghapus chip harus langsung memuat ulang data dengan filter yang tersisa.
4. Label chip harus singkat dan tidak membuat toolbar overflow.

### 5.5 Behavior Apply Filter

Pengalaman yang diinginkan mengikuti web dashboard:

1. User bisa membuka panel, mengubah beberapa filter, lalu menekan Apply.
2. Tombol Cancel mengembalikan perubahan sementara dan menutup panel.
3. Tombol Clear All mengosongkan semua filter.
4. Jika implementor memilih auto-apply untuk v1, behavior itu harus tetap terasa jelas dan tidak membuat panel menutup setiap kali satu field dipilih.

Batch apply lebih disukai karena lebih efisien untuk tablet dan filter multi-field.

## 6. Batasan Scope

Termasuk scope:

1. Redesign filter order pada layout tablet/non-compact.
2. Mengubah presentasi filter shared toolbar dari bottom sheet menjadi inline panel/dropdown untuk kebutuhan tablet.
3. Menambahkan rendering input `dateRange` dan `numberRange` pada UI filter.
4. Menambahkan wiring state filter order agar parameter yang sudah tersedia bisa dikirim ke `OrderCubit.getAll()`.
5. Menampilkan active filter pills untuk semua filter yang aktif.
6. Menjaga halaman lain yang memakai `AppDataView` tetap berjalan.

Tidak termasuk scope:

1. Redesign mobile order list.
2. Mengubah lifecycle order.
3. Mengubah logic pembayaran.
4. Mengubah backend API untuk filter dasar yang sudah tersedia.
5. Mengubah web dashboard.
6. Menambah analytics atau data baru.
7. Mengubah flow buat order.

## 7. Acceptance Criteria untuk Plan Berikutnya

Plan implementasi berikutnya harus memastikan:

1. Tablet order list menampilkan top bar horizontal berisi search, tombol filter, dan action utama.
2. Tombol filter membuka panel/dropdown inline di bawah toolbar, bukan modal fullscreen atau bottom sheet.
3. Panel menampilkan minimal status order, status pembayaran, tanggal order, estimasi selesai, dan range nominal.
4. Kebutuhan outlet ditangani sesuai konteks source: outlet aktif untuk single-outlet atau select outlet jika multi-outlet memang didukung.
5. Date range dan number range punya input yang jelas dan compact.
6. Apply, Cancel, Clear All, remove individual filter, dan reset semua filter terdefinisi.
7. Semua filter aktif dikirim ke `OrderCubit.getAll()` dengan parameter yang tepat.
8. Query API yang sudah tersedia tetap dipakai, tanpa perubahan backend yang tidak perlu.
9. Mobile layout tetap memakai `OrderSearchBar` dan `OrderFilterChips` atau tetap aman bila shared toolbar berubah.
10. Halaman lain yang memakai `AppDataView` tidak rusak saat hanya memakai `singleSelect`.
11. Tablet portrait dan landscape bebas overflow.
12. Styling konsisten dengan `wash_wallet_ui`.

## 8. Source Files Reviewed

File utama yang direview:

1. `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`
2. `apps/cashier/lib/features/order/presentation/widgets/order_search_bar.dart`
3. `apps/cashier/lib/features/order/presentation/widgets/order_filter_chips.dart`
4. `apps/cashier/lib/features/order/presentation/bloc/order_cubit.dart`
5. `apps/cashier/lib/features/order/domain/usecases/get_all_usecase.dart`
6. `apps/cashier/lib/features/order/domain/repositories/order_repository.dart`
7. `apps/cashier/lib/features/order/data/repositories/order_repository_impl.dart`
8. `apps/cashier/lib/features/order/data/datasources/order_remote_datasource.dart`
9. `apps/cashier/lib/core/router/app_router.dart`
10. `packages/wash_wallet_ui/lib/src/components/data_view/app_data_view.dart`
11. `packages/wash_wallet_ui/lib/src/components/data_view/index_toolbar.dart`
12. `packages/wash_wallet_ui/lib/src/components/data_view/models/filter_config.dart`
13. `packages/wash_wallet_ui/lib/src/components/data_view/models/active_filter.dart`
14. `packages/wash_wallet_ui/lib/src/components/badge/payment_status_badge.dart`
15. `webapp/wash_wallet_be/resources/js/Components/Filters/FilterBar.tsx`
16. `webapp/wash_wallet_be/resources/js/Components/Filters/FilterPanel.tsx`
17. `webapp/wash_wallet_be/resources/js/Components/Filters/types.ts`
18. `webapp/wash_wallet_be/resources/js/Pages/Dashboard/Orders/Index.tsx`
19. `webapp/wash_wallet_be/resources/js/Pages/Dashboard/Orders/filters.tsx`
20. `webapp/wash_wallet_be/app/Http/Controllers/Web/OrderController.php`
21. `webapp/wash_wallet_be/app/Models/Order.php`

## 9. Catatan untuk AI Penyusun Plan

Kebutuhan ini adalah user need, bukan plan final. Saat menyusun plan, model berikutnya perlu menentukan desain teknis yang paling aman untuk shared `IndexToolbar`, terutama karena komponen itu dipakai oleh banyak halaman cashier.

Prioritas teknis yang perlu diperhatikan:

1. Jangan merusak halaman lain yang sudah memakai `AppDataView`.
2. Pertimbangkan apakah panel inline harus aktif untuk semua width atau hanya non-compact.
3. Pastikan perubahan state filter bisa menampung value kompleks seperti date range dan number range.
4. Gunakan format tanggal yang diterima API, idealnya `YYYY-MM-DD`.
5. Validasi nominal min/max agar tidak mengirim nilai tidak valid.
6. Perlakukan outlet sebagai konteks single-outlet saat ini, kecuali ada keputusan produk untuk multi-outlet.
