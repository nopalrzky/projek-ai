# Review Issue: Setting dan Setup Outlet Design Flow

## Scope Review

Dokumen ini berisi feedback UX/product design untuk area:

- `Setting > Setup Outlet`
- Kategori menu
- Layanan laundry
- Paket layanan
- Paket membership
- Database pelanggan

Fokus review: flow desain, information architecture, ergonomi CRUD, dan rekomendasi pola aplikasi modern untuk admin/POS operasional.

## Ringkasan Masalah Utama

Area `Setup Outlet` saat ini terasa seperti daftar link CRUD biasa. Secara fungsi sudah membuka modul-modul penting, tetapi belum terasa sebagai pusat konfigurasi outlet yang membantu user memahami:

- Setup apa yang sudah lengkap atau belum.
- Urutan konfigurasi yang benar.
- Dampak data satu modul ke modul lain.
- Apa yang bisa diedit oleh kasir dan apa yang hanya read-only dari owner/admin.
- Aksi cepat yang paling penting untuk operasional harian.
/us
Untuk aplikasi modern, area ini sebaiknya menjadi "Outlet Setup Center" atau "Master Data Center", bukan sekadar menu list.

## Ringkasan Prioritas

| ID | Prioritas | Area | Ringkasan |
|---|---|---|---|
| UX-SET-01 | P1 | Setup Outlet IA | Setup Outlet hanya list menu datar, belum menjadi hub konfigurasi outlet. |
| UX-SET-02 | P1 | Guided setup | Tidak ada urutan setup, readiness state, atau progress konfigurasi. |/us
| UX-SET-03 | P1 | Module grouping | Item kategori, layanan, paket, membership, pelanggan dicampur tanpa grouping operasional yang jelas. |
| UX-SET-04 | P1 | CRUD ergonomics | Kategori/layanan masih terasa seperti CRUD generik, belum seperti master data yang produktif. |
| UX-SET-05 | P1 | Dependency UX | Layanan bergantung pada kategori dan satuan, tetapi flow belum membantu saat dependency belum siap. |
| UX-SET-06 | P2 | Read-only clarity | Paket layanan dan membership tampil di Setup Outlet, tetapi copy/empty state menunjukkan user harus hubungi owner. |
| UX-SET-07 | P2 | Responsive admin layout | Modul setup belum memakai pola master-detail/table yang lebih modern untuk layar besar. |
| UX-SET-08 | P2 | Consistency | Visual dan interaction pattern antar modul belum konsisten. |
| UX-SET-09 | P2 | Safety | Delete/edit belum memberi impact preview untuk data yang punya relasi. |
| UX-SET-10 | P2 | Search/filter | Search, filter, sort, dan active/inactive management masih minimum dan tidak seragam. |
| UX-SET-11 | P0 | Navigation | Route kategori/layanan dari Setup Outlet keluar dari shell bottom navbar sehingga user tidak bisa pindah tab. |
| UX-SET-12 | P1 | Header/back UX | Index kategori/layanan memakai menu/drawer style, bukan back/tab navigation yang jelas. |

---

## UX-SET-01 - Setup Outlet Masih Berupa List Menu Datar

Prioritas: P1

### Bukti kode

- `lib/features/setting/presentation/screens/setup_outlet_setting_screen.dart:17-59` menampilkan `ListView` berisi item Kategori, Layanan, Paket Layanan, Paket Membership, dan Database Pelanggan.
- Tiap item hanya memiliki icon, title, subtitle, dan `context.push(...)`.
- Tidak ada summary outlet, status setup, count data, health indicator, atau shortcut aksi utama.

### Dampak

User harus menebak sendiri bagian mana yang perlu dikonfigurasi. Halaman ini belum menjawab pertanyaan operasional seperti:

- Apakah outlet ini sudah siap menerima order?
- Berapa kategori aktif?
- Berapa layanan aktif?
- Apakah ada layanan tanpa kategori/satuan?
- Apakah paket atau membership tersedia?
- Apa langkah berikutnya setelah membuat kategori?

### Rekomendasi modern

Ubah `Setup Outlet` menjadi dashboard konfigurasi kecil:

- Header: nama outlet, status "Siap transaksi" atau "Setup belum lengkap".
- Readiness cards: `Kategori`, `Layanan`, `Paket`, `Membership`, `Pelanggan`.
- Tiap card menampilkan count aktif/nonaktif, status, dan primary action.
- Tampilkan rekomendasi langkah berikutnya, misalnya "Buat minimal 1 kategori sebelum menambahkan layanan".
- Gunakan layout grid di tablet/desktop dan list ringkas di mobile.

Target feel: lebih seperti settings center di aplikasi POS/SaaS modern, bukan list navigasi biasa.

---

## UX-SET-02 - Tidak Ada Guided Setup atau Progress Konfigurasi

Prioritas: P1

### Bukti kode

- `SetupOutletSettingScreen` tidak memuat data dari cubit mana pun.
- Tidak ada stepper/checklist yang menghubungkan urutan setup:
  - Kategori dulu.
  - Layanan laundry.
  - Paket/membership.
  - Pelanggan.

### Dampak

Untuk user baru atau outlet baru, flow terasa kosong dan tidak terarah. Padahal data master punya urutan alami: layanan membutuhkan kategori dan satuan, transaksi membutuhkan layanan, membership/paket membutuhkan definisi produk yang jelas.

### Rekomendasi modern

Tambahkan guided checklist:

1. Buat kategori layanan.
2. Tambahkan layanan laundry dan harga.
3. Cek paket layanan dari owner/admin.
4. Cek membership plan.
5. Tambahkan pelanggan atau mulai transaksi.

Setiap step punya state:

- `Belum mulai`
- `Perlu dilengkapi`
- `Siap`
- `Perlu perhatian`

Tambahkan CTA kontekstual:

- Jika kategori kosong: "Buat kategori pertama".
- Jika kategori ada tetapi layanan kosong: "Tambah layanan pertama".
- Jika ada layanan nonaktif: "Review layanan nonaktif".

---

## UX-SET-03 - Grouping Modul Belum Jelas

Prioritas: P1

### Bukti kode

- `lib/features/setting/presentation/screens/setup_outlet_setting_screen.dart:20-58` menyusun semua item sejajar.
- `Database Pelanggan` ditempatkan bersama setup outlet, padahal pelanggan lebih dekat ke operasional CRM/transaksi daripada konfigurasi outlet.
- `Paket Layanan` dan `Paket Membership` terlihat sebagai "Kelola", tetapi modulnya cenderung read-only untuk cashier.

### Dampak

User tidak dapat membedakan mana master data inti, mana konfigurasi komersial, dan mana data pelanggan operasional. Ini membuat area setting terasa kurang matang.

### Rekomendasi modern

Kelompokkan menu menjadi beberapa section:

- `Master Layanan`
  - Kategori
  - Layanan Laundry
- `Produk dan Promo`
  - Paket Layanan
  - Paket Membership
- `Relasi Pelanggan`
  - Database Pelanggan
- `Outlet Readiness`
  - Status konfigurasi, issue, dan rekomendasi

Gunakan label section, count, dan helper text singkat. Untuk item read-only, gunakan badge `Dikelola owner` atau `Read-only`.

---

## UX-SET-11 - Navigasi Setup Outlet Keluar dari Bottom Navbar

Prioritas: P0

### Bukti kode

- `SetupOutletSettingScreen` membuka modul setup dengan route top-level:
  - `lib/features/setting/presentation/screens/setup_outlet_setting_screen.dart:25` -> `context.push('/categories')`
  - `lib/features/setting/presentation/screens/setup_outlet_setting_screen.dart:33` -> `context.push('/laundry-services')`
  - `lib/features/setting/presentation/screens/setup_outlet_setting_screen.dart:41` -> `context.push('/service-packages')`
  - `lib/features/setting/presentation/screens/setup_outlet_setting_screen.dart:49` -> `context.push('/membership-plans')`
  - `lib/features/setting/presentation/screens/setup_outlet_setting_screen.dart:57` -> `context.push('/customers')`
- Bottom navbar hanya dibungkus oleh `StatefulShellRoute.indexedStack` untuk root tabs:
  - `lib/core/router/app_router.dart:168-292`
- Route `/categories`, `/laundry-services`, `/service-packages`, `/membership-plans`, dan `/customers` berada di luar shell route:
  - `lib/core/router/app_router.dart:293-372`

### Dampak

Saat user dari `Setting > Setup Outlet` masuk ke `Kategori`, `Layanan Laundry`, `Paket`, `Membership`, atau `Pelanggan`, screen berpindah ke route top-level di luar shell. Akibatnya bottom navbar hilang, user tidak bisa cepat pindah ke Home/Dana/Transaksi/Setting, dan flow terasa seperti "terkunci" di halaman master data.

Ini juga membuat ekspektasi user rusak: karena entry point-nya berasal dari tab Setting, halaman kategori/layanan seharusnya masih terasa sebagai bagian dari tab Setting, bukan keluar dari navigasi utama.

### Rekomendasi terbaik

Jadikan semua modul Setup Outlet sebagai nested route di branch Setting, bukan route top-level yang keluar dari shell.

Contoh arah route:

- `/settings/setup-outlet/categories`
- `/settings/setup-outlet/laundry-services`
- `/settings/setup-outlet/service-packages`
- `/settings/setup-outlet/membership-plans`
- `/settings/setup-outlet/customers`

Dengan struktur ini:

- Bottom navbar tetap muncul.
- User tetap bisa pindah ke Home/Dana/Transaksi/Setting.
- Back tetap kembali ke `Setup Outlet`.
- State tab Setting tetap masuk akal karena modul setup masih berada di branch Setting.

Untuk route quick action dari Home seperti `/customers`, putuskan secara eksplisit:

- Jika pelanggan dibuka dari Setup Outlet, pakai nested setting route.
- Jika pelanggan dibuka dari Home/Order quick action, boleh pakai route fokus tanpa bottom nav atau route khusus sesuai kebutuhan.

Acceptance utama untuk issue ini: dari `Setting > Setup Outlet > Kategori`, bottom navbar harus tetap terlihat dan user bisa tap Home tanpa harus back dulu.

---

## UX-SET-12 - Index Screen Memakai Drawer/Menu, Bukan Back Navigation yang Jelas

Prioritas: P1

### Bukti kode

- `IndexCategoriesScreen` memakai `showMenuButton: true`, tanpa `onBackPressed`:
  - `lib/features/category/presentation/screens/index_categories_screen.dart:59-63`
- `IndexLaundryServicesScreen` memakai `showMenuButton: true`, tanpa `onBackPressed`:
  - `lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart:77-81`
- `IndexServicePackagesScreen` memakai `showMenuButton: true`, tanpa `onBackPressed`:
  - `lib/features/service_package/presentation/screens/index_service_packages_screen.dart:53-57`
- `IndexMembershipPlanScreen` memakai `showMenuButton: true`, tanpa `onBackPressed`:
  - `lib/features/membership_plan/presentation/screens/index_membership_plan_screen.dart:51-55`
- `IndexCustomersScreen` memakai `showMenuButton: true`, tanpa `onBackPressed`:
  - `lib/features/customer/presentation/screens/index_customers_screen.dart:57-61`

### Dampak

Saat masuk ke index category/laundry dari Setup Outlet, user mengharapkan tombol back ke Setup Outlet atau tetap punya bottom navbar. Yang muncul justru pola menu/drawer. Ini membuat navigasi terasa tidak natural:

- User tidak tahu cara kembali ke Setup Outlet.
- Drawer/menu terasa seperti navigasi lama yang tidak konsisten dengan bottom navbar.
- Screen setup terasa terpisah dari tab Setting.

### Rekomendasi terbaik

Hilangkan drawer/menu style untuk screen yang dibuka dari Setup Outlet.

Gunakan pola berikut:

- Jika screen berada di nested Setting route: tampilkan back button ke `Setup Outlet` dan tetap tampilkan bottom navbar.
- Jika screen adalah root tab page: baru boleh tidak ada back.
- Jangan tampilkan drawer/menu di modul setup jika app sudah memakai bottom navbar sebagai navigasi utama.

Rekomendasi header:

- Title: `Kategori`
- Subtitle/context kecil: `Setup Outlet`
- Leading: back arrow ke `Setup Outlet`
- Actions: search/filter/add jika relevan
- Bottom navbar: tetap visible

Jika modul juga bisa dibuka dari tempat lain, header harus context-aware:

- Dari Setup Outlet: back ke Setup Outlet.
- Dari quick action/focus flow: back/pop sesuai stack.

---

## UX-SET-04 - CRUD Kategori/Layanan Masih Generik

Prioritas: P1

### Bukti kode

- `lib/features/category/presentation/screens/index_categories_screen.dart:56-73` menampilkan header dan FAB `Tambah`.
- `lib/features/category/presentation/widgets/category_tile_card.dart:23-118` memakai card list dengan menu edit/delete.
- `lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart:74-91` pola serupa: header, search/filter, FAB.
- `lib/features/laundry_service/presentation/widgets/laundry_service_card.dart:30-198` menampilkan layanan sebagai card generik.

### Dampak

Flow sudah bekerja, tetapi belum terasa sebagai alat admin yang cepat untuk mengelola master data. Untuk data seperti layanan, user biasanya perlu scan harga, kategori, satuan, durasi, status, dan aksi edit dengan cepat. Card besar membuat scanning lambat ketika data banyak.

### Rekomendasi modern

Untuk layar besar:

- Gunakan table/list dense dengan kolom: nama, kategori, satuan, harga, durasi, status, updated.
- Detail muncul di right panel/drawer tanpa meninggalkan list.
- Edit bisa via side sheet atau modal drawer, bukan selalu full page.

Untuk mobile:

- Tetap card, tetapi lebih padat.
- Primary info: nama, harga/unit, kategori, status.
- Secondary action masuk overflow menu.

Tambahkan fitur produktif:

- Duplicate layanan.
- Quick toggle aktif/nonaktif.
- Bulk activate/deactivate.
- Sort by nama, harga, kategori, status.

---

## UX-SET-05 - Dependency UX Kategori/Satuan/Layanan Belum Membantu

Prioritas: P1

### Bukti kode

- `lib/features/laundry_service/presentation/screens/create_laundry_service_screen.dart:36-39` memuat kategori dan unit saat form dibuat.
- `lib/features/laundry_service/presentation/widgets/laundry_service_form_section.dart:186-215` dropdown kategori hanya menampilkan list atau progress.
- `lib/features/laundry_service/presentation/widgets/laundry_service_form_section.dart:217-241` dropdown unit juga hanya menampilkan list.
- Submit menampilkan snackbar generic jika kategori/satuan kosong:
  - `lib/features/laundry_service/presentation/screens/create_laundry_service_screen.dart:52-59`

### Dampak

Jika kategori belum ada, user berada di form layanan tapi tidak diberi jalan cepat untuk membuat kategori. Ini membuat flow terasa patah: user harus back, masuk kategori, create, lalu kembali lagi.

### Rekomendasi modern

Tambahkan dependency-aware UX:

- Jika kategori kosong, dropdown berubah menjadi empty state inline dengan CTA `Buat kategori`.
- Tambahkan quick-create category dari form layanan via bottom sheet.
- Jika satuan kosong atau gagal load, tampilkan pesan jelas dan retry.
- Preselect kategori ketika user datang dari detail kategori.
- Setelah quick-create kategori, langsung pilih kategori baru di form layanan.

Ini membuat flow terasa seperti produk modern yang memahami konteks user.

---

## UX-SET-06 - Paket Layanan dan Membership Kurang Jelas Read-only atau Editable

Prioritas: P2

### Bukti kode

- `SetupOutletSettingScreen` menulis:
  - `Paket Layanan` dengan subtitle `Kelola paket bundling layanan`.
  - `Paket Membership` dengan subtitle `Kelola paket membership pelanggan`.
- Tetapi list kosong menyebut user harus hubungi owner:
  - `lib/features/service_package/presentation/screens/index_service_packages_screen.dart:104-110`
  - `lib/features/membership_plan/presentation/screens/index_membership_plan_screen.dart:104-110`
- Tidak ada FAB create/edit pada index package/membership.

### Dampak

Copy mengatakan "Kelola", tetapi UI sebenarnya read-only atau tidak memberi akses tambah. Ini menciptakan ekspektasi yang salah.

### Rekomendasi modern

Tentukan mode dengan jelas:

- Jika cashier hanya melihat: ubah copy menjadi `Lihat paket layanan` dan badge `Dikelola owner`.
- Jika cashier boleh request perubahan: tambahkan CTA `Ajukan perubahan`.
- Jika role tertentu boleh edit: tampilkan FAB hanya untuk role itu, bukan hilang tanpa penjelasan.

Tambahkan empty state yang actionable:

- "Belum ada paket layanan. Paket dibuat oleh owner. Hubungi owner atau sinkronkan data."
- Tombol: `Muat ulang`, `Hubungi owner`, atau `Buka bantuan`.

---

## UX-SET-07 - Belum Ada Responsive Master-detail untuk Admin Setup

Prioritas: P2

### Bukti kode

- `IndexOrdersScreen` sudah memakai `ResponsiveLayout` dan detail embedded pada layar medium:
  - `lib/features/order/presentation/screens/index_orders_screen.dart:97-130`
- Modul setup seperti kategori, layanan, pelanggan masih single-pane:
  - `lib/features/category/presentation/screens/index_categories_screen.dart:74-173`
  - `lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart:92-195`
  - `lib/features/customer/presentation/screens/index_customers_screen.dart:72-173`

### Dampak

Di tablet/desktop, user harus bolak-balik list-detail-form. Padahal setup data lebih cocok untuk pola admin modern: list di kiri, detail/editor di kanan.

### Rekomendasi modern

Samakan dengan pola orders:

- Compact: list -> detail page -> edit page.
- Medium/expanded: split view.
  - Kiri: list/search/filter.
  - Kanan: detail selected item atau empty prompt.
  - Edit/create: side drawer atau right panel.

Untuk `Setup Outlet`, gunakan responsive grid cards dengan status dan quick actions.

---

## UX-SET-08 - Visual dan Interaction Pattern Antar Modul Belum Konsisten

Prioritas: P2

### Bukti kode

- Setting dan Setup Outlet memakai `Card` + `ListTile` sederhana.
- Category card memakai gradient, circle avatar, popup menu custom:
  - `lib/features/category/presentation/widgets/category_tile_card.dart:23-118`
- Laundry service card lebih dense dan memakai chip:
  - `lib/features/laundry_service/presentation/widgets/laundry_service_card.dart:30-198`
- Package/membership memakai `AppListTile`:
  - `lib/features/service_package/presentation/widgets/service_package_list_view.dart:45-54`
  - `lib/features/membership_plan/presentation/widgets/membership_plan_list_view.dart:45-54`
- Customer form memakai card besar, gradient, icon container, dan button gradient:
  - `lib/features/customer/presentation/widgets/customer_form_section.dart:63-614`

### Dampak

Area setup terasa seperti gabungan beberapa gaya UI, bukan satu sistem admin yang kohesif. Ini bisa membuat user merasa beberapa bagian "belum selesai" walaupun fungsinya ada.

### Rekomendasi modern

Buat satu design pattern untuk master data:

- Satu komponen `MasterDataListItem`.
- Satu komponen `MasterDataHeader`.
- Satu pola `SearchFilterToolbar`.
- Satu pola `StatusBadge`.
- Satu pola create/edit form.

Gunakan visual yang lebih utilitarian:

- Kurangi gradient dekoratif untuk list admin.
- Prioritaskan alignment, density, status, dan aksi.
- Card radius mengikuti design system, jangan terlalu banyak variasi.

---

## UX-SET-09 - Delete/Edit Belum Menampilkan Impact Preview

Prioritas: P2

### Bukti kode

- Delete kategori memakai dialog generic:
  - `lib/features/category/presentation/screens/index_categories_screen.dart:199-242`
  - `lib/features/category/presentation/screens/show_category_screen.dart:226-269`
- Detail kategori sebenarnya punya data layanan terkait:
  - `lib/features/category/presentation/screens/show_category_screen.dart:204-208`
- Delete layanan juga generic:
  - `lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart:262-305`
  - `lib/features/laundry_service/presentation/screens/show_laundry_service_screen.dart:433-477`

### Dampak

User bisa menghapus data yang punya dampak ke transaksi, layanan, paket, atau riwayat tanpa melihat konsekuensinya. Untuk master data POS, ini riskan.

### Rekomendasi modern

Tambahkan impact preview:

- Untuk kategori: tampilkan jumlah layanan yang terkait.
- Untuk layanan: tampilkan apakah pernah dipakai order, paket, membership, atau draft.
- Jika data punya relasi penting, default action sebaiknya `Nonaktifkan`, bukan `Hapus`.
- Dialog destructive harus membedakan:
  - `Nonaktifkan` untuk data yang pernah dipakai.
  - `Hapus permanen` hanya jika aman.

Tambahkan copy yang operasional, misalnya:

"Kategori ini memiliki 8 layanan aktif. Nonaktifkan kategori akan menyembunyikan layanan terkait dari transaksi baru."

---

## UX-SET-10 - Search, Filter, Sort, dan Status Management Belum Seragam

Prioritas: P2

### Bukti kode

- Kategori hanya search.
- Layanan punya search + filter kategori/unit.
- Membership search dilakukan lokal di widget, bukan lewat datasource:
  - `lib/features/membership_plan/presentation/screens/index_membership_plan_screen.dart:130-144`
- Paket layanan punya search ke cubit/datasource.
- Filter aktif/nonaktif tidak terlihat sebagai kontrol utama pada kategori, layanan, paket, membership, atau pelanggan.

### Dampak

User tidak mendapat pengalaman konsisten saat berpindah antar master data. Untuk outlet dengan banyak data, pengelolaan akan terasa lambat.

### Rekomendasi modern

Standarkan toolbar master data:

- Search.
- Filter status: Semua, Aktif, Nonaktif.
- Sort: Nama, terbaru, harga, kategori.
- Quick reset filter.
- Count hasil.
- Optional view mode: list/table.

Untuk layanan:

- Filter kategori.
- Filter satuan.
- Filter range harga.
- Filter durasi.

Untuk pelanggan:

- Filter aktif/nonaktif.
- Sort terakhir transaksi atau nama.

---

## Rekomendasi Desain Target

### 1. Jadikan Setup Outlet sebagai Setup Center

Struktur yang disarankan:

- Header outlet + readiness status.
- Checklist setup.
- Section `Master Layanan`.
- Section `Produk dan Membership`.
- Section `Pelanggan`.
- Section `Perlu Perhatian`.

Contoh card:

| Modul | Isi card |
|---|---|
| Kategori | 6 aktif, 1 nonaktif, CTA `Kelola` |
| Layanan | 32 aktif, 4 nonaktif, CTA `Tambah layanan` |
| Paket | 3 tersedia, badge `Dikelola owner` |
| Membership | 4 plan, badge `Dikelola owner` |
| Pelanggan | 1.240 pelanggan, CTA `Tambah pelanggan` |

### 2. Gunakan Pola Admin Modern untuk Master Data

Untuk kategori, layanan, pelanggan:

- Mobile: compact cards.
- Tablet/desktop: master-detail split.
- Detail/edit tidak selalu full page; gunakan side sheet untuk edit cepat.
- List harus mudah discan, tidak terlalu dekoratif.

### 3. Buat Flow Dependency-aware

Flow ideal:

1. User masuk Setup Outlet.
2. App melihat kategori kosong.
3. App menampilkan CTA `Buat kategori pertama`.
4. Setelah kategori dibuat, app menawarkan `Tambah layanan untuk kategori ini`.
5. Saat tambah layanan, kategori sudah terpilih.
6. Setelah layanan dibuat, app menawarkan `Buat layanan lain`, `Lihat layanan`, atau `Mulai transaksi`.

### 4. Perjelas Role dan Ownership

Jika paket/membership dikelola owner:

- Jangan tulis `Kelola` untuk cashier.
- Tulis `Lihat paket` atau `Dikelola owner`.
- Tampilkan alasan kenapa tidak ada tombol tambah.

### 5. Turunkan Dekorasi, Naikkan Kejelasan Operasional

Untuk halaman setup, yang paling penting adalah scanability:

- Nama.
- Status.
- Relasi.
- Harga.
- Aksi.
- Updated time.

Gradient/card besar sebaiknya dipakai terbatas untuk summary, bukan semua item list.

## Acceptance Criteria untuk Plan Berikutnya

- `Setup Outlet` menampilkan overview readiness dan count data per modul.
- User bisa memahami urutan setup dari halaman Setup Outlet tanpa membaca dokumentasi.
- Dari `Setting > Setup Outlet > Kategori`, bottom navbar tetap terlihat.
- Dari `Setting > Setup Outlet > Layanan Laundry`, bottom navbar tetap terlihat.
- User bisa pindah langsung ke Home/Dana/Transaksi/Setting dari screen kategori/layanan tanpa harus back dulu.
- Screen kategori/layanan yang dibuka dari Setup Outlet punya back button yang jelas ke Setup Outlet, bukan drawer/menu.
- Drawer/menu tidak dipakai untuk flow Setup Outlet jika bottom navbar adalah navigasi utama.
- Kategori dan layanan punya flow cepat dari empty state sampai data pertama berhasil dibuat.
- Form layanan membantu membuat kategori jika kategori belum tersedia.
- Paket dan membership jelas apakah read-only atau editable berdasarkan role.
- Layar besar memakai layout master-detail atau table-like list untuk data setup.
- Search/filter/sort/status control konsisten antar kategori, layanan, paket, membership, dan pelanggan.
- Delete/nonaktif data master menampilkan impact preview atau minimal jumlah relasi terdampak.
