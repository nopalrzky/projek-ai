# Context: Home Screen Current State untuk Redesign

Tanggal review: 2026-06-21

Dokumen ini menjelaskan kondisi `HomeScreen` WashWallet Cashier saat ini sebagai bahan untuk AI lain yang akan membahas redesign home screen. Fokus utama context ini adalah menghapus drawer dan membenarkan logika `AppBottomBar` agar navigation utama bekerja semestinya.

## Ringkasan

WashWallet Cashier adalah aplikasi operasional kasir outlet laundry. Home screen saat ini berfungsi sebagai dashboard ringan untuk kasir, tetapi model navigasinya masih tumpang tindih:

- `HomeScreen` memakai bottom navigation dengan item Home, Dana & Keuangan, Transaksi, dan Setting.
- Beberapa screen root lain masih memakai drawer melalui `AppLayout` dan `AppHeader.showMenuButton`.
- Bottom bar hanya dipasang di `HomeScreen`, sehingga state tab aktif tidak konsisten saat user masuk ke screen lain.
- Aksi bottom bar masih bercampur antara `Navigator.push` dan `context.go`, sehingga root navigation belum benar-benar menjadi struktur utama aplikasi.

Redesign yang akan dibahas sebaiknya menjadikan bottom bar sebagai navigasi root utama, menghapus drawer dari home/root screens, dan memindahkan akses data master ke area secondary yang lebih sesuai.

## Source Areas Reviewed

File utama yang menjadi sumber konteks:

- `lib/features/home/presentation/screens/home_screen.dart`
- `lib/features/home/presentation/bloc/home_cubit.dart`
- `lib/features/home/presentation/bloc/home_state.dart`
- `lib/features/home/data/datasources/home_remote_datasource.dart`
- `lib/features/home/domain/entities/home.dart`
- `lib/features/home/presentation/sections/employee_info_section.dart`
- `lib/features/home/presentation/sections/transaction_reports_section.dart`
- `lib/features/home/presentation/sections/quick_actions_section.dart`
- `lib/core/router/app_router.dart`
- `packages/wash_wallet_ui/lib/src/components/layout/app_layout.dart`
- `packages/wash_wallet_ui/lib/src/components/layout/app_header/app_header.dart`
- `packages/wash_wallet_ui/lib/src/components/layout/app_bottom_bar/app_bottom_bar.dart`
- `packages/wash_wallet_ui/lib/src/components/drawer/config/drawer_menu_config.dart`
- `packages/wash_wallet_ui/lib/src/components/drawer/helpers/drawer_builder.dart`

## Current Home Screen Structure

`HomeScreen` adalah `StatefulWidget` dengan `WidgetsBindingObserver`. Saat init:

- memanggil `HomeCubit.getHomeData()`;
- sinkronisasi badge notification dari backend;
- subscribe ke `NotificationService.instance.onNewOrder`;
- subscribe ke `NotificationService.instance.onNotificationTap`;
- memasang callback reconnect untuk refresh badge notification.

Render utama memakai:

- `BlocConsumer<HomeCubit, HomeState>` untuk state dashboard;
- `BlocConsumer<AuthCubit, AuthState>` untuk data employee dan prompt simpan akun;
- `Stack` untuk menampilkan `AppLayout` dan overlay `NewOrderBanner`.

`AppLayout` di home menerima:

- `userName` dari `Authenticated.employee.name`;
- `onLogout` ke `AuthCubit.logout()`;
- `header` berupa `AppHeader`;
- `body` dari `_buildBody`;
- `bottomBar` berupa `AppBottomBar.navigation`.

## Current Header

Header home saat ini:

- title: `Wash Wallet`
- subtitle: `Selamat Bekerja`
- type: `AppHeaderType.standard`
- background: `context.colors.surface`
- `showMenuButton: true`
- action pertama: icon people untuk pindah pegawai ke `/switch-employee`
- action kedua: notification badge button

Catatan penting:

- `showMenuButton: true` membuat tombol menu tampil jika `AppLayout` berhasil membuat drawer.
- Home tidak membuat drawer secara eksplisit, tetapi `AppLayout` membuat drawer otomatis selama `showDrawer` bernilai default `true`.

## Current Body

Jika `HomeState` adalah `HomeLoading`, UI menampilkan `AppLoadingIndicator` dengan pesan `Memuat dashboard...`.

Jika `HomeState` adalah `HomeError`, UI menampilkan `AppErrorState` dengan tombol retry ke `HomeCubit.getHomeData()`.

Jika `HomeState` adalah `HomeLoaded`, body memakai `RefreshIndicator` dan `SingleChildScrollView` dengan urutan section:

1. `EmployeeInfoSection`
2. `TransactionReportsSection`
3. `QuickActionsSection`

Pull-to-refresh memanggil `HomeCubit.refresh()`.

## Current Data Available

Home dashboard hanya menerima data berikut dari `HomeLoaded`:

- `employeeName`
- `employeePhone`
- `cashBalance`
- `ordersInProduction`
- `ordersNotPickedUp`
- `ordersPickedUp`

Sumber data berasal dari endpoint dashboard melalui `HomeRemoteDatasource.getHomeData()`. Datasource membaca beberapa kemungkinan key response:

- employee name: `employeeName`, `employee_name`, `name`
- employee phone: `employeePhone`, `employee_phone`, `phone`
- cash balance: `cashBalance`, `cash_balance`, `balance`
- order production count: `ordersInProduction`, `orders_in_production`
- order not picked up count: `ordersNotPickedUp`, `orders_not_picked_up`
- order picked up count: `ordersPickedUp`, `orders_picked_up`

Implikasi redesign:

- Jangan mengasumsikan home sudah punya data analytics lengkap.
- Jika redesign membutuhkan queue detail, trend chart, revenue breakdown, atau task list spesifik, perlu data baru dari API atau reuse dari feature lain.
- Current dashboard cocok sebagai operational summary, bukan analytics dashboard penuh.

## Current Sections

### EmployeeInfoSection

Section ini hanya membungkus `EmployeeProfileCard`.

`EmployeeProfileCard` menampilkan:

- avatar inisial pegawai;
- nama pegawai;
- nomor telepon pegawai;
- parameter `onNotificationTap` tersedia, tetapi di widget card saat ini tidak ada action notification yang dirender.

Catatan redesign:

- Jika notification tetap ada di header, parameter notification di profile card bisa dibersihkan atau dipakai ulang dengan jelas.
- Jika ingin profile menjadi entry point account/switch employee, definisikan interaksi secara eksplisit.

### TransactionReportsSection

Section ini menampilkan:

- `TransactionReportHeader`
- `TransactionSummaryCard`

`TransactionSummaryCard` berisi:

- label `Kas di Outlet`
- tombol `Setor`
- nominal saldo kas outlet dalam format Rupiah
- tiga statistik order:
  - `Produksi`
  - `Belum Diambil`
  - `Sudah Diambil`

Catatan penting:

- Handler `_handleSetorTap` di `HomeScreen` masih kosong.
- Padahal finance area sudah punya menu `Setoran Kasir` melalui `IndexFinancesScreen`.
- Redesign bisa mengarahkan tombol `Setor` ke flow setoran kasir, tetapi rute/target final perlu dipastikan saat implementasi.

### QuickActionsSection

Quick actions saat ini:

- `Buat Transaksi` ke flow pilih customer order.
- `Lihat Transaksi` ke order list.
- `Customer` ke customer list.
- `Dana & Keuangan` ke finance menu.

Semua action membutuhkan `AuthState` berupa `Authenticated` agar bisa mengambil `employee.outletId`.

Catatan redesign:

- Quick actions masih relevan untuk kasir, terutama buat transaksi dan lihat transaksi.
- Jika bottom bar sudah memuat Transaksi, Customer, Dana, atau Setting, quick actions perlu dibedakan sebagai shortcut task, bukan duplikasi navigasi penuh.

## Current Realtime Notification Behavior

Home menangani order baru melalui `NotificationService`.

Perilaku saat order baru masuk:

- `_handleNewOrder` menyimpan payload ke `_visibleBanner`;
- `NewOrderBanner` muncul di atas layar selama sekitar 8 detik;
- tap banner membuka `ShowOrderScreen`;
- close banner menyembunyikan banner.

Perilaku notification badge:

- badge count dibaca dari stream `NotificationService.instance.onBadgeCountChanged`;
- badge tampil pada icon notification di header;
- tap notification clear badge lalu membuka `IndexOrdersScreen` dengan `initialStatusFilter: 'requested'`;
- setelah kembali dari order list, home refresh dan badge disinkronkan ulang.

Implikasi redesign:

- Notification order baru adalah bagian penting home.
- Redesign harus tetap memberi jalur cepat ke order status `requested`.
- Jangan menghapus notification badge/banner tanpa pengganti yang jelas.

## Current Drawer Behavior

Drawer berasal dari `AppLayout`, bukan dari `HomeScreen`.

Di `AppLayout`:

- property `showDrawer` default `true`;
- jika `drawer` tidak diberikan dan `showDrawer` tetap `true`, layout memanggil `DrawerBuilder.build`;
- `DrawerBuilder` memakai `DrawerMenuConfig.getMenuSections()`;
- jika `header` adalah `AppHeader`, drawer ada, `header.leading == null`, dan `header.showMenuButton == true`, maka `AppLayout` menyuntikkan `onMenuPressed: openDrawer` ke header.

Karena `HomeScreen` memakai `AppHeader(showMenuButton: true)` dan tidak mengubah `showDrawer`, maka tombol menu drawer muncul.

Menu drawer saat ini:

Transaksi:

- Dashboard: `/dashboard`
- Pesanan: `/orders`

Data Master:

- Pelanggan: `/customers`
- Kategori: `/categories`
- Layanan: `/laundry-services`
- Paket Deposit: `/service-packages`
- Membership: `/membership-plans`

Pengaturan:

- Pengaturan: `/settings`

Masalah current state:

- Drawer dan bottom bar sama-sama memberi akses ke area utama seperti dashboard, pesanan, dan settings.
- Data master ada di drawer, tetapi sebagian fitur seperti customer juga ada di quick actions.
- Jika drawer dihapus, akses ke Data Master tetap perlu disediakan lewat secondary menu, settings, atau setup outlet area.

## Current Bottom Bar Behavior

Bottom bar home saat ini:

- type: `AppBottomBar.navigation`
- `currentIndex: 0`
- items:
  - index 0: Home
  - index 1: Dana & Keuangan
  - index 2: Transaksi
  - index 3: Setting

Tap handling:

- index 0: tidak melakukan apa-apa.
- index 1: memanggil `_handleManageFinances(context)`.
- index 2: memanggil `_handleViewTransactions(context)`.
- index 3: `context.go('/settings')`.

Masalah current state:

- `currentIndex` selalu `0`, sehingga home selalu dianggap aktif.
- Dana & Keuangan dibuka via `Navigator.push` ke `IndexFinancesScreen`, bukan route root via `go_router`.
- Transaksi dibuka via `Navigator.push` ke `IndexOrdersScreen`, bukan route root via `go_router`.
- Setting memakai `context.go('/settings')`, sehingga perilakunya beda dari Dana dan Transaksi.
- `IndexOrdersScreen` dan `IndexSettingScreen` sendiri tidak punya bottom bar, hanya drawer/menu button.
- Saat user masuk ke order/settings, bottom navigation hilang, sehingga model root tab tidak terasa konsisten.

Target redesign navigation:

- Bottom bar sebaiknya menjadi root navigation yang konsisten di Home, Transaksi, Dana, Setting, dan mungkin Customer jika dipilih sebagai root.
- Root tab sebaiknya memakai `context.go` atau shell route, bukan `Navigator.push`.
- `currentIndex` harus ditentukan dari route aktif, bukan hardcoded.
- Drawer sebaiknya tidak lagi muncul di root screens jika bottom bar menjadi navigasi utama.

## Current Routes Relevant to Home

Route utama di `AppRouter`:

- `/home`: `HomeScreen`
- `/dashboard`: `HomeScreen`
- `/orders`: `IndexOrdersScreen`
- `/customers`: `IndexCustomersScreen`
- `/categories`: `IndexCategoriesScreen`
- `/laundry-services`: `IndexLaundryServicesScreen`
- `/service-packages`: `IndexServicePackagesScreen`
- `/membership-plans`: `IndexMembershipPlanScreen`
- `/settings`: `IndexSettingScreen`
- `/switch-employee`: `SwitchEmployeeScreen`

Setting subroutes yang ada:

- `/settings/printer`
- `/settings/profile`
- `/settings/pin-security`
- `/settings/pin-setup`
- `/settings/confirm-pin`
- `/settings/pin-reset-verify`
- `/settings/pin-reset-new`

Catatan:

- `/dashboard` dan `/home` sama-sama menuju `HomeScreen`, tetapi drawer memakai `/dashboard`.
- Bottom bar memakai Home sebagai index 0 tetapi tidak memanggil route apapun saat index 0 ditap.
- Perlu diputuskan apakah route home final hanya `/home`, dan `/dashboard` menjadi alias/backward compatibility saja.

## Screens Root yang Masih Memakai Drawer

Beberapa screen list/root saat ini memakai `AppHeader(showMenuButton: true)`, sehingga masih membuka drawer:

- `HomeScreen`
- `IndexOrdersScreen`
- `IndexCustomersScreen`
- `IndexCategoriesScreen`
- `IndexLaundryServicesScreen`
- `IndexServicePackagesScreen`
- `IndexMembershipPlanScreen`
- `IndexSettingScreen`

Implikasi redesign:

- Jika drawer dihapus, screen-screen ini perlu diganti header-nya agar tidak menampilkan menu button.
- Root screens yang masuk bottom bar perlu diberi bottom bar yang sama.
- Secondary screens seperti detail/create/edit sebaiknya tetap memakai back navigation, bukan bottom root nav jika flow-nya bersifat task detail.

## Finance Current State

Home membuka Dana & Keuangan dengan `Navigator.push` ke `IndexFinancesScreen(outletId)`.

`IndexFinancesScreen` menampilkan menu:

- Setoran Kasir
- Saldo Petty Cash
- Pengeluaran Outlet

Screen ini memakai `AppLayout` dengan `AppHeader` yang memiliki `onBackPressed: Navigator.pop(context)`, bukan drawer dan bukan bottom bar.

Implikasi redesign:

- Jika Dana menjadi root tab, finance screen tidak boleh lagi terasa seperti pushed detail screen dengan back button.
- Header dan bottom bar finance perlu mengikuti pola root navigation.
- Menu finance dapat tetap menjadi landing page Dana.

## Order Current State

Home membuka Transaksi dengan `Navigator.push` ke `IndexOrdersScreen(outletId)`.

`IndexOrdersScreen` saat ini:

- memakai drawer menu button;
- punya floating action button `Pesanan Baru`;
- punya search bar;
- punya status filter chips;
- list order memakai `OrderCard`;
- menerima `initialStatusFilter`, termasuk dari notification tap untuk filter `requested`.

Implikasi redesign:

- Transaksi cocok menjadi root tab.
- Jika dibuka dari notification, screen tetap perlu support filter awal `requested`.
- FAB `Pesanan Baru` harus tetap mudah dijangkau.
- Jangan mengganti order list menjadi dashboard statis karena ini flow kerja utama kasir.

## Setting Current State

`IndexSettingScreen` saat ini:

- memakai `AppLayout`;
- memakai `AppHeader(title: 'Pengaturan', showMenuButton: true)`;
- menampilkan list item Printer, Profil, dan PIN.

PIN item saat ini sudah membaca `authState.employee.hasPin`:

- jika punya PIN, title `Atur Ulang PIN`;
- jika belum punya PIN, title `Setting PIN`.

Implikasi redesign:

- Setting cocok menjadi root tab.
- Header setting tidak perlu drawer jika bottom bar menjadi root navigation.
- Item setting bisa menjadi tempat secondary access seperti data master/setup outlet jika drawer dihapus, tetapi jangan membuat setting terlalu padat tanpa pengelompokan.

## Recommended Direction untuk Redesign

Gunakan bottom bar sebagai primary navigation. Pilihan root yang paling sesuai dengan current request:

- Home
- Dana
- Transaksi
- Setting

Customer dan Data Master bisa dipertimbangkan sebagai:

- quick action di Home;
- section di Setting atau Setup Outlet;
- secondary menu dari Setting;
- shortcut di Home untuk customer jika workflow kasir sering membutuhkan customer.

Hilangkan drawer dari root screens dengan cara konseptual:

- `AppLayout(showDrawer: false)` pada screen yang tidak boleh punya drawer;
- `AppHeader(showMenuButton: false)` atau tanpa menu button;
- pertahankan `onBackPressed` hanya di secondary/detail/task screens.

Benahi bottom bar dengan cara konseptual:

- buat helper reusable untuk item bottom bar dan mapping route;
- tentukan `currentIndex` dari route aktif;
- pakai `context.go(route)` untuk pindah root tab;
- hindari `Navigator.push` untuk pindah antar root tab;
- pasang bottom bar yang sama di root screens;
- jangan pasang bottom bar di subflow seperti create order, detail order, review order, setup PIN, atau printer detail jika flow butuh fokus/back stack.

## Acceptance Criteria untuk Plan Redesign

AI lain yang menyusun plan redesign sebaiknya memastikan:

- Drawer tidak muncul di Home dan root screens yang memakai bottom navigation.
- Bottom navigation tetap terlihat saat user berada di root Home, Dana, Transaksi, dan Setting.
- Active item bottom bar sesuai route aktif.
- Tap item bottom bar tidak menumpuk screen baru di navigation stack.
- Home tetap bisa membuka create transaction, requested orders, customer, dan finance dengan jalur yang jelas.
- Notification badge dan new order banner tetap punya jalur ke order requested/detail.
- Data Master tetap reachable setelah drawer dihapus.
- Secondary/task screens tetap memakai back button dan tidak dipaksa menjadi root tab.

## Important Constraints

- Jangan mengubah konsep home menjadi analytics berat tanpa tambahan data API.
- Jangan menghilangkan quick access untuk order baru/requested.
- Jangan menjadikan semua data master sebagai bottom tab utama karena itu bukan pekerjaan harian utama kasir.
- Jangan memakai drawer sebagai fallback setelah requirement redesign adalah menghapus drawer.
- Jangan mencampur root navigation dengan `Navigator.push` jika tujuan redesign adalah membenarkan `AppBottomBar`.
- Pastikan istilah teknis yang dimaksud user sebagai "app button bar" mengacu ke `AppBottomBar` pada shared UI package.
