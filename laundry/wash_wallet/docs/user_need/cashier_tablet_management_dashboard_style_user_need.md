# User Need: Cashier Tablet Management Index Mengikuti Web Dashboard

Tanggal: 2026-06-30

Dokumen ini menjadi acuan kebutuhan untuk AI model lain saat menyusun implementation plan. Fokusnya adalah menyamakan gaya halaman index manajemen di aplikasi kasir tablet dengan pola web dashboard owner yang sudah konsisten, tanpa mengubah kode pada tahap dokumen ini.

Dokumen ini adalah user need, bukan implementation plan. Detail teknis di bawah dipakai untuk menjelaskan kebutuhan UX, scope, gap current state, dan acceptance criteria agar implementor berikutnya dapat menyusun plan yang tepat.

## 1. Ringkasan Kebutuhan

User membutuhkan semua halaman index target pada Cashier App versi tablet tampil sebagai halaman manajemen yang ringkas, modern, dan konsisten seperti web dashboard owner.

Halaman target:

1. Order
2. Layanan Laundry
3. Kategori
4. Paket Layanan
5. Membership
6. Setoran Kasir
7. Petty Cash
8. Pengeluaran Outlet

Kebutuhan utama:

1. Semua halaman target memakai pola index tablet yang sama: page header, toolbar, active filter pills, filter panel inline, table, empty state, loading state, error state, action button, dan pagination bila data/API mendukung.
2. Toolbar wajib berisi search field, tombol filter dengan count aktif, active filter pills, dan tombol action utama sesuai halaman.
3. Filter wajib tampil sebagai panel/dropdown inline di bawah toolbar, bukan modal fullscreen dan bukan bottom sheet tablet.
4. Styling tidak boleh di-hardcode per screen. Gunakan shared UI dan theme token dari `packages/wash_wallet_ui`, seperti `context.space`, `context.radius`, typography, colors, dan `AppDensity`.
5. Tabel harus memakai pola kolom yang proporsional untuk tablet portrait dan landscape: column gap, row height density, min width, two-line cell bila perlu, badge status konsisten, action icon konsisten, dan tidak overlap.

## 2. Referensi Web Dashboard

Hasil review web dashboard menunjukkan pola index owner sudah jelas dan bisa menjadi referensi UX untuk tablet cashier.

Referensi utama:

1. `webapp/wash_wallet_be/resources/js/Pages/Dashboard/Customers/Index.tsx`
   - Contoh index lengkap dengan `PageHeader`, flash `Alert`, `PageStats`, dan `DataView`.
   - `DataView` memakai action button, search placeholder, filters, sorting, pagination, empty state, dan initial filters.
2. `webapp/wash_wallet_be/resources/js/Pages/Dashboard/LaundryServices/Index.tsx`
   - Contoh CRUD index yang lebih sederhana tetapi tetap konsisten.
   - Memakai `PageHeader`, flash `Alert`, `DataView`, columns, filters, action button, pagination, dan filter bar.
3. `webapp/wash_wallet_be/resources/js/Components/DataView/DataView.tsx`
   - Menjadi pusat komposisi data table, filter, search, sorting, pagination, dan action button pada dashboard web.
4. `webapp/wash_wallet_be/resources/js/Components/Filters/FilterBar.tsx`
   - Menunjukkan pola top bar: search field, tombol filter, action button, active filter pills, dan reset.
5. `webapp/wash_wallet_be/resources/js/Components/Filters/FilterPanel.tsx`
   - Menunjukkan filter panel inline dengan layout grid, action footer, clear, cancel, dan apply.
6. `webapp/wash_wallet_be/docs/spec/index_page_dashboard_spec.md`
   - Menegaskan standardisasi index dashboard: `PageHeader`, flash alert, optional `PageStats`, lalu `DataView`.

Yang perlu diambil dari web dashboard adalah pola UX dan konsistensi struktur, bukan menyalin detail visual React ke Flutter secara mentah.

## 3. Fondasi Cashier Tablet Saat Ini

Cashier tablet sudah punya fondasi shared UI yang relevan:

1. `packages/wash_wallet_ui/lib/src/components/data_view/app_data_view.dart`
   - Sudah mendukung `breadcrumbs`, `pageTitle`, `pageSubtitle`, `pageActions`, search, filters, active filters, primary action, table, row actions, row tap, row highlight, row height, column gap, dan pagination props.
2. `packages/wash_wallet_ui/lib/src/components/data_view/index_toolbar.dart`
   - Sudah menyediakan toolbar dengan search field, tombol filter dengan count aktif, active filter chips, reset, secondary actions, dan primary action.
   - Versi source saat ini sudah membuka `FilterPanel` inline melalui `AnimatedSize`.
3. `packages/wash_wallet_ui/lib/src/components/data_view/filter_panel.dart`
   - Sudah mendukung apply/cancel/clear all dan render dasar untuk `singleSelect`, `dateRange`, dan `numberRange`.
   - Masih perlu distandarkan styling dan kontraknya agar tidak terasa sebagai komponen sementara.
4. `packages/wash_wallet_ui/lib/src/components/data_view/app_data_table.dart`
   - Sudah punya table container, sticky header, row actions, pagination, row highlight, row height, column gap, dan density mode.
5. `packages/wash_wallet_ui/lib/src/components/data_view/models/filter_config.dart`
   - `FilterType` sudah mencakup `singleSelect`, `multiSelect`, `dateRange`, `numberRange`, dan `textInput`.
6. `packages/wash_wallet_ui/lib/src/theme/density/app_density.dart`
   - Sudah punya token awal untuk `standard` dan `compact`, termasuk `tableColumnGap` dan `tableTwoLineRowHeight`.

Fondasi ini berarti implementasi berikutnya sebaiknya memperkuat dan memakai shared UI, bukan membuat ulang toolbar/filter/table di setiap screen.

## 4. Gap Current State vs Target

Gap utama yang perlu diselesaikan:

1. Adopsi `AppDataView` belum seragam antar halaman target.
2. Sebagian halaman sudah punya `pageTitle` dan `breadcrumbs`, tetapi halaman finansial seperti setoran, petty cash, dan pengeluaran belum memakai header tablet yang setara dengan halaman lain.
3. Filter masih parsial di beberapa halaman. Order sudah relatif lengkap, tetapi layanan laundry baru kategori/satuan; kategori, paket layanan, dan membership belum punya filter tablet yang sesuai kebutuhan; setoran, petty cash, dan pengeluaran masih dominan status saja.
4. Beberapa halaman masih memakai `onFilterApply` satu per satu, sementara kebutuhan tablet lebih cocok dengan batch apply melalui `onFiltersChanged`.
5. `FilterPanel` sudah inline, tetapi masih ada hardcoded spacing, border, input decoration, dan layout width yang belum sepenuhnya memakai token shared UI.
6. `AppDataView` masih punya hardcoded padding table `24.0`, dan toolbar masih punya beberapa hardcoded `SizedBox`, padding, dan height.
7. `DataTableColumnDef.minWidth` sudah ada di model, tetapi belum benar-benar dimanfaatkan oleh `AppDataTable`; kolom flex masih langsung menjadi `Expanded`.
8. Row height dan column gap belum konsisten dipakai semua halaman. Beberapa halaman memakai default, sementara order/customer mulai memakai `AppDensity`.
9. Beberapa table cell masih berupa `Text` polos tanpa pola wrapping, max lines, badge, atau two-line layout yang konsisten.
10. Active filter pills sudah ada di shared toolbar, tetapi label, reset behavior, dan remove individual filter perlu dibuat konsisten untuk semua halaman target.
11. Outlet pada cashier tablet adalah konteks aktif dari employee/outlet route. Tidak perlu filter outlet bebas kecuali produk/API nanti mendukung cashier multi-outlet.

## 5. Target UX Tablet

Setiap halaman target pada layout tablet harus mengikuti struktur:

1. Header konten:
   - Breadcrumbs singkat.
   - Judul halaman.
   - Subtitle bila membantu konteks.
   - Action sekunder bila benar-benar diperlukan.
2. Toolbar:
   - Search field di kiri.
   - Tombol Filter dengan count aktif.
   - Active filter pills dekat toolbar.
   - Tombol action utama di kanan, misalnya `Tambah`, `Pesanan Baru`, `Buat Setoran`, `Buat Permintaan`, atau `Buat Pengeluaran`.
3. Filter panel inline:
   - Muncul tepat di bawah toolbar.
   - Tidak memakai modal fullscreen atau bottom sheet untuk tablet.
   - Boleh mendorong table ke bawah agar konteks halaman tetap terlihat.
   - Memiliki apply, cancel, dan clear all.
4. Table:
   - Header, row, badge, action icon, spacing, dan empty state konsisten.
   - Kolom proporsional di tablet portrait dan landscape.
   - Cell penting boleh two-line agar informasi tetap terbaca.
5. State:
   - Loading, error, empty state, dan refresh behavior konsisten dengan shared UI.

## 6. Kebutuhan Toolbar dan Filter

Toolbar wajib memenuhi kebutuhan berikut:

1. Search field selalu tersedia bila halaman mendukung pencarian.
2. Tombol filter menampilkan jumlah filter aktif, misalnya `Filter (3)`.
3. Active filter pills bisa dihapus satu per satu.
4. Reset/clear all tersedia saat ada filter aktif.
5. Primary action memakai label sesuai konteks:
   - Order: `Pesanan Baru`
   - Layanan Laundry: `Tambah`
   - Kategori: `Tambah`
   - Paket Layanan: tidak wajib bila cashier hanya melihat paket dari owner; jika cashier boleh membuat paket, gunakan `Tambah`
   - Membership: tidak wajib bila cashier hanya melihat plan dari owner; jika cashier boleh membuat plan, gunakan `Tambah`
   - Setoran Kasir: `Buat Setoran`
   - Petty Cash: `Buat Permintaan`
   - Pengeluaran Outlet: `Buat Pengeluaran`
6. Toolbar harus tidak overflow pada tablet portrait. Jika active pills banyak, gunakan horizontal scroll yang rapi atau wrap yang tetap menjaga primary action terlihat.

Filter panel wajib memenuhi kebutuhan berikut:

1. Tampil inline di bawah toolbar.
2. Layout compact, mudah discan, dan tidak mengambil tinggi layar berlebihan.
3. Mendukung `singleSelect`, `multiSelect`, `dateRange`, `numberRange`, dan `textInput` sesuai kebutuhan halaman.
4. Perubahan beberapa field bisa dikumpulkan lalu diterapkan melalui Apply.
5. Cancel mengembalikan perubahan sementara.
6. Clear All menghapus semua filter aktif.
7. Semua label filter dan active pill harus singkat, jelas, dan konsisten.

## 7. Matriks Kebutuhan Per Halaman

| Halaman | Search | Filter wajib | Konteks outlet | Action utama | Catatan |
| --- | --- | --- | --- | --- | --- |
| Order | Nomor order, pelanggan, referensi | Status order, status pembayaran, tanggal order, estimasi selesai, range nominal | Outlet aktif sebagai konteks single-outlet | `Pesanan Baru` | Order sudah paling dekat dengan target; tetap perlu styling dan kontrak shared UI yang seragam. |
| Layanan Laundry | Nama layanan, deskripsi | Kategori, unit/satuan, status aktif, range harga, durasi, minimal quantity | Outlet aktif | `Tambah` | Saat ini baru kategori dan satuan; perlu perluasan filter sesuai data/API. |
| Kategori | Nama kategori | Status aktif | Outlet aktif | `Tambah` | Saat ini belum ada filter status di tablet. |
| Paket Layanan | Nama paket | Status aktif, range harga, range masa berlaku | Outlet aktif | Opsional `Tambah` sesuai permission produk | Saat ini lebih berupa read-only list tanpa filter. |
| Membership | Nama membership/plan | Status aktif, range harga, durasi, diskon | Outlet aktif | Opsional `Tambah` sesuai permission produk | Saat ini search dilakukan client-side; filter belum ada. |
| Setoran Kasir | Referensi, cashier bila tersedia | Status, tanggal mulai/akhir | Outlet aktif | `Buat Setoran` | Saat ini filter status saja dan belum memakai page header tablet. |
| Petty Cash | Referensi, cashier bila tersedia | Status, tanggal mulai/akhir | Outlet aktif atau cashier aktif sesuai route | `Buat Permintaan` | Saat ini filter status saja dan belum memakai page header tablet. |
| Pengeluaran Outlet | Referensi, deskripsi | Akun pengeluaran, sumber dana, tanggal mulai/akhir, range nominal, lampiran bila API mendukung | Outlet aktif | `Buat Pengeluaran` | Saat ini filter status saja; kebutuhan filter finansial perlu mengikuti dukungan API. |

Catatan outlet:

1. Cashier app saat ini dianggap single-outlet berdasarkan `outletId` dari route/auth employee.
2. Outlet tidak wajib menjadi dropdown bebas.
3. Jika nanti ada dukungan cashier multi-outlet, outlet boleh menjadi filter select, tetapi harus mengikuti permission dan kontrak API yang tersedia.

## 8. Kebutuhan Table dan Column Layout

Tabel tablet harus terasa seperti data management table, bukan list mobile yang diperbesar.

Kebutuhan:

1. Semua halaman target memakai `AppDataTable` melalui `AppDataView` kecuali ada alasan kuat.
2. Kolom memakai kombinasi `width`, `flex`, dan `minWidth` secara proporsional.
3. `minWidth` pada `DataTableColumnDef` harus benar-benar dihormati oleh table layout.
4. `columnGap` memakai `AppDensity.tableColumnGap(AppDensityMode.compact)` atau token density sejenis.
5. `rowHeight` memakai density token, termasuk two-line row bila cell memuat nama + metadata.
6. Cell panjang harus memiliki `maxLines`, ellipsis, wrap, atau two-line composition yang jelas.
7. Badge status memakai komponen/status style shared yang konsisten.
8. Action icon memakai ukuran, tooltip, hit area, radius, dan warna yang konsisten.
9. Table tidak boleh overlap atau truncated secara buruk pada tablet portrait.
10. Jika kolom tidak cukup, table boleh memakai horizontal scroll yang jelas dan tidak merusak toolbar/filter.

## 9. Anti-Hardcode dan Shared UI

Implementasi berikutnya harus memusatkan perubahan di `packages/wash_wallet_ui` sebanyak mungkin.

Yang harus dihindari:

1. Menambahkan padding, radius, color, row height, chip style, dan table action style berbeda-beda di tiap screen.
2. Membuat filter panel custom per halaman target jika shared `FilterPanel` bisa diperluas.
3. Menggandakan label active filter, apply/cancel/clear behavior, atau action icon pattern di banyak screen.
4. Menambahkan layout khusus per screen untuk mengatasi overflow yang sebenarnya harus diselesaikan di shared table/toolbar.

Yang perlu dipusatkan di shared UI:

1. Kontrak `AppDataView` untuk page header, toolbar, filters, table density, and pagination.
2. Kontrak `IndexToolbar` untuk active pills, filter count, reset, responsive overflow, and primary action.
3. Kontrak `FilterPanel` untuk `singleSelect`, `multiSelect`, `dateRange`, `numberRange`, `textInput`, batch apply, cancel, and clear all.
4. Kontrak `AppDataTable` untuk `minWidth`, density, two-line rows, column gap, horizontal overflow, status badge, action icon, and pagination.
5. Token `AppDensity` bila token yang ada belum cukup untuk toolbar height, filter panel gap, table header height, atau compact input height.

## 10. Interface Impact

Dokumen ini tidak mengubah kode.

Interface impact untuk implementor berikutnya:

1. Perubahan sebaiknya dimulai dari shared UI `packages/wash_wallet_ui`, bukan hardcode di setiap screen.
2. Perlu perluasan atau penguatan kontrak `AppDataView`, `IndexToolbar`, `FilterPanel`, `AppDataTable`, dan `AppDensity`.
3. Setelah shared UI siap, halaman target cukup memasok konfigurasi filter, active filter mapping, search handler, action utama, columns, dan data source.
4. Implementor harus mengecek dukungan API/domain tiap halaman sebelum menambah filter yang belum didukung server.
5. Bila API belum mendukung filter tertentu, dokumen plan berikutnya harus menandai filter itu sebagai backend/API dependency, bukan memaksakan client-side workaround yang tidak scalable.

## 11. Acceptance Criteria Dokumen

Dokumen ini dianggap memenuhi kebutuhan bila:

1. File user need dibuat di `docs/user_need/cashier_tablet_management_dashboard_style_user_need.md`.
2. Dokumen menyebut hasil review web dashboard dan cashier shared UI.
3. Dokumen mencantumkan gap current state vs target dashboard style.
4. Dokumen mencantumkan matriks kebutuhan filter untuk semua halaman target.
5. Dokumen menegaskan anti-hardcode dan konsistensi theme/shared UI.
6. Dokumen jelas bahwa ini user need, bukan implementation plan.
7. Dokumen menyebut bahwa perubahan kode tidak termasuk scope dokumen ini.

## 12. Acceptance Criteria untuk Plan Berikutnya

Implementation plan berikutnya harus memastikan:

1. Semua halaman target tablet memakai pola index yang konsisten dengan web dashboard owner.
2. Semua halaman target yang relevan memiliki `pageTitle`, breadcrumbs, toolbar, active filter pills, inline filter panel, table, empty state, loading state, error state, dan action utama.
3. Filter panel tablet tidak memakai modal fullscreen atau bottom sheet.
4. Filter minimum per halaman mengikuti matriks kebutuhan di dokumen ini.
5. Shared UI mendukung batch apply filter dan remove individual filter secara konsisten.
6. Styling memakai theme token dan `AppDensity`, bukan hardcoded values per screen.
7. `DataTableColumnDef.minWidth` dimanfaatkan sehingga kolom tidak overlap/truncated buruk.
8. Tablet portrait dan landscape aman dari overflow.
9. Mobile layout tetap aman dan tidak menjadi target redesign utama.
10. Perubahan filter yang membutuhkan API baru diidentifikasi secara eksplisit.

## 13. Source Files Reviewed

File web dashboard:

1. `webapp/wash_wallet_be/resources/js/Pages/Dashboard/Customers/Index.tsx`
2. `webapp/wash_wallet_be/resources/js/Pages/Dashboard/LaundryServices/Index.tsx`
3. `webapp/wash_wallet_be/docs/spec/index_page_dashboard_spec.md`

File shared UI cashier:

1. `packages/wash_wallet_ui/lib/src/components/data_view/app_data_view.dart`
2. `packages/wash_wallet_ui/lib/src/components/data_view/index_toolbar.dart`
3. `packages/wash_wallet_ui/lib/src/components/data_view/filter_panel.dart`
4. `packages/wash_wallet_ui/lib/src/components/data_view/app_data_table.dart`
5. `packages/wash_wallet_ui/lib/src/components/data_view/models/filter_config.dart`
6. `packages/wash_wallet_ui/lib/src/components/data_view/models/data_table_column_def.dart`
7. `packages/wash_wallet_ui/lib/src/theme/density/app_density.dart`

File cashier target:

1. `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`
2. `apps/cashier/lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart`
3. `apps/cashier/lib/features/category/presentation/screens/index_categories_screen.dart`
4. `apps/cashier/lib/features/service_package/presentation/screens/index_service_packages_screen.dart`
5. `apps/cashier/lib/features/membership_plan/presentation/screens/index_membership_plan_screen.dart`
6. `apps/cashier/lib/features/deposit/presentation/screens/index_deposit_screen.dart`
7. `apps/cashier/lib/features/petty_cash/presentation/screens/index_petty_cash_screen.dart`
8. `apps/cashier/lib/features/expense/presentation/screens/index_expense_screen.dart`

## 14. Assumptions

1. `Customers/Index.tsx` dipakai sebagai referensi gaya web dashboard, bukan bagian dari scope halaman cashier target.
2. Cashier app saat ini dianggap single-outlet berdasarkan konteks `outletId`; filter outlet bebas tidak diwajibkan kecuali nanti ada dukungan multi-outlet.
3. Fokus dokumen adalah kebutuhan tablet cashier; mobile layout tidak menjadi target redesign utama.
4. Jika halaman paket layanan dan membership memang read-only untuk cashier, action `Tambah` tidak wajib.
5. Filter yang belum didukung API/domain harus dicatat sebagai dependency pada implementation plan, bukan diselesaikan dengan hardcode lokal tanpa dasar produk.
