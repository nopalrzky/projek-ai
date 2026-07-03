# Issue: Cashier standalone route belum sinkron dengan GoRouter

## Scope Debug

Dokumen ini hanya mencatat diagnosis routing Cashier saat ini dan rekomendasi perbaikan. Tidak ada perubahan implementasi pada kode aplikasi dalam scope ini.

Keputusan produk/engineering terbaru:

- Semua route fitur tidak perlu dikelompokkan berdasarkan struktur tampilan.
- Pengelompokan seperti `Operasional`, `Dana & Keuangan`, dan `Setting` hanya berlaku untuk tampilan UI, bukan prefix URL.
- Aplikasi masih development dan belum release, jadi route lama tidak perlu backward compatibility.
- Tampilan tablet/sidebar harus bisa langsung membuka route fitur.
- Tampilan compact/Android untuk Dana & Keuangan tetap masuk ke halaman `/finances` terlebih dahulu.
- Route create/show/edit juga tetap standalone.
- Route edit tanpa `state.extra` cukup menampilkan halaman error yang jelas.

Contoh route canonical yang diinginkan:

```text
/customers
/categories
/laundry-services
/service-packages
/membership-plans
/profile
/printer
/pin-security
/deposits
/petty-cashes
/expenses
```

## Ringkasan Root Cause

`CashierNavigationConfig` sudah mengarah ke beberapa route fitur pendek seperti `/customers`, `/categories`, dan `/laundry-services`, tetapi `AppRouter` masih menempatkan screen operasional di bawah route nested `/settings/setup-outlet/...`.

Di bagian bawah router memang ada alias seperti `/customers`, `/categories`, dan `/laundry-services`, tetapi alias tersebut hanya `redirect` ke path relatif seperti `customers`, bukan mendefinisikan screen route yang mandiri.

Untuk Settings dan Dana & Keuangan, mismatch-nya lebih jelas: sidebar mengarah ke root-level route seperti `/profile`, `/printer`, `/pin-security`, `/deposits`, `/petty-cashes`, dan `/expenses`, sementara `AppRouter` belum punya route langsung untuk path tersebut.

Karena app belum release, perbaikan bisa langsung mengganti struktur nested lama menjadi standalone route tanpa mempertahankan redirect kompatibilitas.

## Bukti Kode

### 1. Sidebar operasional sudah memakai route pendek yang benar

`lib/core/navigation/cashier_navigation_config.dart` saat ini mengirim:

```text
/customers
/categories
/laundry-services
/service-packages
/membership-plans
```

Ini sesuai keputusan terbaru. Pengelompokan `Operasional` cukup menjadi section visual di sidebar, bukan prefix route.

### 2. Router belum punya implementasi screen mandiri untuk route operasional

Screen operasional saat ini masih didefinisikan di bawah:

```text
/settings/setup-outlet/customers
/settings/setup-outlet/categories
/settings/setup-outlet/laundry-services
/settings/setup-outlet/service-packages
/settings/setup-outlet/membership-plans
```

Sementara route pendek hanya alias redirect:

```dart
GoRoute(
  path: '/customers',
  redirect: (context, state) => 'customers',
),
```

Pola yang sama ada untuk `/categories`, `/laundry-services`, `/service-packages`, dan `/membership-plans`. Dengan target standalone route, alias ini perlu diganti menjadi route page langsung.

### 3. Route Settings belum standalone

Sidebar saat ini mengirim:

```text
/profile
/printer
/pin-security
```

Namun router yang tersedia berada di bawah:

```text
/settings/profile
/settings/printer
/settings/pin-security
```

Berdasarkan keputusan "semua tidak perlu dikelompokkan", route canonical untuk menu ini adalah `/profile`, `/printer`, dan `/pin-security`. Route nested `/settings/...` tidak perlu dipertahankan.

`/settings` masih boleh ada sebagai halaman hub untuk compact/bottom navigation jika diperlukan, tetapi child feature route-nya tidak perlu memakai prefix `/settings`.

### 4. Route Dana & Keuangan belum mendukung behavior tablet vs Android

Sidebar/tablet punya item:

```text
/deposits
/petty-cashes
/expenses
```

Namun `AppRouter` hanya mendaftarkan `/finances` untuk branch keuangan. Screen deposit, petty cash, dan expense saat ini dicapai dari `IndexFinancesScreen` dengan `Navigator.push`:

```dart
Navigator.push(
  context,
  MaterialPageRoute(builder: (_) => IndexDepositScreen(outletId: outletId)),
);
```

Behavior yang diinginkan:

- Tablet/sidebar: item `Setoran`, `Petty Cash`, dan `Pengeluaran Outlet` langsung membuka `/deposits`, `/petty-cashes`, dan `/expenses`.
- Compact/Android: bottom navigation `Dana` tetap membuka `/finances` terlebih dahulu, lalu user memilih detail finance dari halaman tersebut.

Karena route tetap standalone, navigasi dari `/finances` ke detail finance sebaiknya memakai GoRouter route seperti `/deposits`, bukan `MaterialPageRoute`.

### 5. Active state sidebar masih dominan membaca path nested lama

`MainShellScreen` menghitung `currentRouteId` dari beberapa path nested:

```dart
location.startsWith('/settings/setup-outlet/laundry-services')
location.startsWith('/settings/setup-outlet/categories')
location.startsWith('/settings/setup-outlet/service-packages')
location.startsWith('/settings/setup-outlet/membership-plans')
location.startsWith('/settings/setup-outlet/customers')
```

Ada pengecualian untuk `/customers`, tetapi belum ada pola lengkap untuk route standalone lain seperti `/categories`, `/laundry-services`, `/service-packages`, `/membership-plans`, `/profile`, `/printer`, `/pin-security`, `/deposits`, `/petty-cashes`, dan `/expenses`.

Jika route canonical adalah standalone, highlight sidebar sebaiknya membaca route standalone sebagai sumber utama.

### 6. Guard protected route belum mencakup semua standalone route

`AppRouter.redirect` saat ini menandai protected route antara lain:

```dart
currentLocation == '/home' ||
currentLocation.startsWith('/orders') ||
currentLocation.startsWith('/customers') ||
currentLocation.startsWith('/settings') ||
currentLocation.startsWith('/finances') ||
currentLocation.startsWith('/outlets')
```

Jika route standalone ditambahkan, guard ini perlu mencakup:

```text
/categories
/laundry-services
/service-packages
/membership-plans
/profile
/printer
/pin-security
/deposits
/petty-cashes
/expenses
```

supaya user unauthenticated tetap diarahkan ke `/login?from=...`.

### 7. Route edit masih bergantung pada `state.extra`

Beberapa route edit memakai hard cast ke entity dari `state.extra`:

```dart
final item = state.extra as Customer;
final item = state.extra as Category;
final item = state.extra as LaundryService;
```

Ini bekerja untuk navigasi internal yang selalu mengirim `extra`, tetapi rentan crash jika user deep link, reload, atau membuka route edit tanpa payload `extra` yang sesuai. Keputusan saat ini: tidak perlu fetch data dari API untuk kasus ini; tampilkan halaman error yang jelas.

## Arah Perbaikan

### 1. Jadikan route operasional sebagai page route standalone

Buat route langsung di `AppRouter`:

```text
/customers
/customers/create
/customers/:id
/customers/:id/edit
/categories
/categories/create
/categories/:id
/categories/:id/edit
/laundry-services
/laundry-services/create
/laundry-services/:id
/laundry-services/:id/edit
/service-packages
/service-packages/:id
/membership-plans
```

Hapus route nested lama `/settings/setup-outlet/...` setelah route standalone tersedia.

### 2. Jadikan route Settings sebagai standalone

Buat route canonical:

```text
/profile
/printer
/pin-security
```

Route lama `/settings/profile`, `/settings/printer`, dan `/settings/pin-security` bisa dihapus. Halaman `/settings` boleh tetap ada sebagai hub compact bila masih dipakai bottom navigation.

### 3. Jadikan route Dana & Keuangan sebagai standalone

Buat route canonical:

```text
/deposits
/petty-cashes
/expenses
```

Untuk tablet/sidebar, `CashierNavigationConfig` boleh langsung mengarah ke route tersebut.

Untuk compact/Android, bottom navigation `Dana` tetap membuka `/finances`. Dari halaman `/finances`, ketika user memilih Setoran/Petty Cash/Pengeluaran Outlet, navigasi sebaiknya memakai GoRouter ke route standalone terkait.

### 4. Perbarui active route mapping

`MainShellScreen` perlu membaca route standalone:

```text
/customers -> customers
/categories -> categories
/laundry-services -> laundry-services
/service-packages -> service-packages
/membership-plans -> membership-plans
/profile -> profile
/printer -> printer
/pin-security -> pin-security
/deposits -> deposits
/petty-cashes -> petty-cashes
/expenses -> expenses
```

Mapping nested lama tidak perlu dipertahankan setelah route standalone tersedia.

### 5. Perluas protected route guard

Tambah semua route standalone yang butuh auth ke `isProtectedRoute`, terutama:

```text
/categories
/laundry-services
/service-packages
/membership-plans
/profile
/printer
/pin-security
/deposits
/petty-cashes
/expenses
```

### 6. Tampilkan error page untuk edit tanpa `state.extra`

Hindari hard cast langsung dari `state.extra`. Untuk route seperti:

```text
/customers/:id/edit
/categories/:id/edit
/laundry-services/:id/edit
```

Jika `state.extra` kosong atau salah tipe, tampilkan page error seperti `Data tidak tersedia untuk mode edit` atau pesan sejenis. Tidak perlu fetch ulang entity dari API untuk kasus ini.

### 7. Tambahkan test router

Tambahkan test yang memastikan:

- semua `SidebarMenuItem.route` resolve ke GoRouter route valid,
- route standalone bisa dibuka saat authenticated,
- route standalone protected redirect ke login saat unauthenticated,
- active highlight sidebar sesuai untuk route standalone,
- route edit tanpa `extra` menampilkan error page, bukan crash,
- compact/Android tetap bisa masuk ke `/finances` sebagai hub Dana.

## Catatan Issue Lama Yang Sudah Outdated

Beberapa catatan route lama tidak lagi merepresentasikan state saat ini:

- `/orders?status=...` sekarang sudah dibaca di `AppRouter` dan diteruskan ke `IndexOrdersScreen(initialStatusFilter: statusFilter)`.
- `IndexOrdersScreen` sudah memakai `initialStatusFilter` untuk mengisi `_selectedStatus`.
- `PushNotificationCoordinator` sekarang navigasi ke detail order dengan `context.push('/orders/$orderId')`.

Jadi fokus perbaikan berikutnya sebaiknya tidak kembali ke area tersebut kecuali ada bug baru yang spesifik.

## Validation Notes

- `flutter analyze` sebelumnya dilaporkan bersih dengan hasil `No issues found`.
- `flutter test test/core/router/app_router_test.dart` sebelumnya timeout dua kali, pada 120 detik dan 240 detik. Catat ini sebagai testability issue/gap, bukan bukti bahwa router test pass.
- Ada beberapa proses Dart aktif setelah timeout sebelumnya; proses tersebut tidak dihentikan karena bisa saja milik proses lain.

## Assumptions

- Scope issue ini hanya Cashier app route/sidebar mismatch.
- Perubahan dirty yang sudah ada di `lib/core/router/app_router.dart` dan `lib/core/navigation/cashier_navigation_config.dart` dianggap sebagai current state.
- Semua route fitur dianggap canonical standalone; pengelompokan hanya untuk tampilan UI.
- Tidak perlu backward compatibility untuk route lama karena aplikasi belum release dan masih development.
- Tablet/sidebar langsung membuka route fitur Dana & Keuangan, sedangkan compact/Android masuk ke `/finances` terlebih dahulu.
- Route edit tanpa `state.extra` harus menampilkan error page, bukan fetch data ulang.
- Dokumen ini dibuat sebagai issue baru dan tidak menimpa issue lama.
- Tidak ada perubahan public API, interface, atau type dalam task dokumentasi ini.
