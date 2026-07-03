# User Need: Permission Granular untuk Fitur Cashier App Berbasis Position

Tanggal: 2026-06-29

## 1. Latar Belakang

WashWallet sudah memiliki sistem permission berbasis `position` untuk employee. Owner dapat membuat atau mengubah posisi di website owner, lalu memilih permission yang melekat pada posisi tersebut. Employee yang login ke aplikasi mobile memakai permission dari posisi aktifnya.

Kebutuhan baru adalah memperbarui katalog permission agar fitur di aplikasi cashier bisa diatur lebih granular oleh owner. Contoh bisnis yang diminta: pada fitur `Layanan Laundry`, owner harus bisa menentukan apakah sebuah posisi boleh melihat, membuat, mengedit, atau menghapus layanan. Employee yang tidak memiliki permission tidak boleh mengakses screen atau action terkait, dan harus mendapat pesan jelas bahwa ia tidak memiliki izin serta perlu menghubungi owner.

Dokumen ini hanya menyusun user need berdasarkan pembacaan codebase. Dokumen ini tidak menentukan detail implementasi final, migrasi teknis, atau perubahan kode. Dokumen ini dipakai sebagai input untuk AI model lain saat menyusun implementation plan.

## 2. Konteks Codebase yang Terbaca

### 2.1 Sistem Permission Saat Ini

Backend sudah memiliki RBAC position-permission:

1. Master permission fixed ada di `webapp/wash_wallet_be/app/Enums/Permission.php`.
2. Permission disimpan di tabel `position_permissions` melalui relasi `Position -> permissions`.
3. Owner memilih permission pada halaman position outlet di website owner.
4. UI website owner memakai `PermissionSelector` dan catalog dari endpoint `GET /api/permissions/catalog`.
5. Validasi create/update position memakai enum permission, sehingga key baru harus masuk ke enum agar bisa disimpan.
6. Endpoint employee dilindungi middleware `position.permission:{key}` di backend.
7. Middleware `CheckPositionPermission` mengevaluasi permission berdasarkan outlet context.
8. Login dan endpoint `me` mengembalikan `accessibleOutlets` dan `allPermissions`.

Permission existing masih kasar:

| Key existing | Makna saat ini |
| --- | --- |
| `order.create` | Buat order |
| `order.view` | Lihat order dan akses dashboard kasir |
| `order.manage` | Banyak aksi order sekaligus |
| `payment.manage` | Hampir semua fitur pembayaran/keuangan kasir |
| `customer.view` | Lihat customer dan beberapa data membership |
| `customer.manage` | Mutasi customer dan beberapa membership/subscription |
| `service.view` | Lihat kategori, layanan, paket, unit |
| `service.manage` | Buat/edit/hapus kategori dan layanan |
| `production.view`, `production.manage` | Produksi |
| `courier.view`, `courier.manage` | Kurir |

Masalah utama: key seperti `service.manage`, `customer.manage`, `payment.manage`, dan `order.manage` terlalu luas untuk kebutuhan owner yang ingin mengatur akses per fitur dan per action.

### 2.2 Fitur Cashier App yang Terbaca

Fitur yang terlihat dari `apps/cashier/lib/features`, router cashier, navigation config, usecase, dan API mobile cashier:

1. Auth dan session employee:
   - login, logout, validate token, `me`, setup/reset/verify PIN, switch employee.
2. Dashboard/Home cashier:
   - ringkasan transaksi/order, quick actions, notifikasi order baru.
3. Transaksi/Order:
   - list/detail order, buat order, update order, delete order, start, complete, accept, reject, weigh, mark COD paid, draft lokal.
4. Customer:
   - list/detail customer, create, edit, delete.
5. Customer subscription:
   - list/detail/create/update/delete.
6. Membership plan:
   - list/detail, read-only di mobile cashier.
7. Membership contract:
   - list/detail, create lewat customer.
8. Category:
   - list/detail/create/edit/delete kategori layanan.
9. Laundry service:
   - list/detail/create/edit/delete layanan laundry.
10. Service package:
   - list/detail, read-only di mobile cashier.
11. Unit:
   - list unit, read-only untuk kebutuhan form layanan.
12. Account:
   - list akun untuk kebutuhan pembayaran/keuangan.
13. Deposit:
   - list/detail/create/update setoran.
14. Petty cash:
   - list/detail/create/update request petty cash.
15. Expense:
   - list/detail/create/update pengeluaran, route delete terdaftar tetapi dokumentasi menyebut controller destroy belum tersedia.
16. Print:
   - print info, receipt, label.
17. WhatsApp notification:
   - preview dan send notifikasi order.
18. Settings lokal cashier:
   - profile, printer, PIN security.

Cashier app saat ini melakukan gate aplikasi di `AuthCubit`: employee hanya dianggap boleh masuk cashier jika memiliki `order.view`. Ini belum cukup untuk kebutuhan granular, karena employee yang hanya diberi akses fitur tertentu seperti `laundry_service.view` atau `deposit.create` akan tetap tertolak oleh gate aplikasi lama.

## 3. Tujuan

1. Owner dapat mengatur permission posisi untuk fitur cashier secara lebih detail.
2. Permission dapat membedakan minimal `view`, `create`, `update`, dan `delete` pada fitur CRUD cashier.
3. Permission dapat membedakan action order penting seperti accept, reject, weigh, complete, payment, print, dan WA notification.
4. Employee hanya melihat menu, route, screen, dan tombol yang sesuai dengan permission posisinya.
5. Employee yang mencoba membuka fitur atau action tanpa permission mendapat pesan no-permission yang jelas, bukan error teknis mentah.
6. Backend tetap menjadi sumber enforcement utama, sehingga request tanpa permission tetap ditolak walaupun UI gagal menyembunyikan action.
7. Perubahan permission tidak membuat posisi existing kehilangan akses tanpa migrasi atau aturan compatibility yang jelas.

## 4. Aktor

1. `owner`: mengatur position dan permission di website owner.
2. `employee cashier`: memakai aplikasi cashier sesuai permission posisinya.
3. `system`: menyediakan catalog permission, menyimpan permission position, menghitung permission employee, menjaga route/API, dan menampilkan no-permission saat akses ditolak.

## 5. Scope

Dalam scope:

1. Penambahan atau pembaruan master permission cashier.
2. Permission untuk position di website owner.
3. Enforcement permission pada API mobile cashier.
4. Gate menu, route, screen, dan action di Flutter cashier.
5. Handling no-permission pada aplikasi cashier.
6. Mapping backward compatibility dari permission lama ke permission granular.
7. Test coverage untuk owner position, backend permission, dan Flutter cashier permission UX.

Di luar scope:

1. Owner membuat permission custom sendiri. Permission tetap master fixed dari produk/engineering.
2. Redesign besar dashboard owner atau cashier app.
3. Menghapus validasi permission backend.
4. Aplikasi customer.
5. Perubahan utama aplikasi production/kurir, kecuali sebagai referensi pola no-permission yang sudah ada.

## 6. Prinsip Permission Baru

1. Permission harus fixed dan terdaftar di master catalog.
2. Owner hanya memilih permission, bukan membuat key baru.
3. Permission harus cukup granular untuk membedakan fitur dan action.
4. Permission harus tetap mudah dipahami owner melalui label Indonesia.
5. Permission route API, guard Flutter, dan payload employee harus memakai key yang sama.
6. `view` hanya memberi akses baca/list/detail.
7. `create` hanya memberi akses membuat data baru.
8. `update` hanya memberi akses mengubah data existing.
9. `delete` hanya memberi akses menghapus data.
10. Action non-CRUD harus memiliki permission action sendiri jika risikonya berbeda, misalnya `order.weigh` atau `order.payment.manage`.
11. Jika sebuah screen membutuhkan data pendukung, plan harus memastikan permission pendukung dibaca secara aman. Contoh: create order membutuhkan list customer dan laundry service. Plan perlu memutuskan apakah read dependency ikut diberikan otomatis atau tetap wajib permission view masing-masing.

## 7. Kandidat Master Permission Cashier

Daftar berikut adalah kandidat user need, bukan keputusan teknis final. Plan boleh menyesuaikan nama key selama prinsip granular dan kompatibilitas terpenuhi.

### 7.1 Dashboard Cashier

| Key kandidat | Label owner | Kegunaan |
| --- | --- | --- |
| `cashier_dashboard.view` | Lihat Dashboard Kasir | Membuka home/dashboard, ringkasan order, ringkasan transaksi, quick action yang tidak membuka data sensitif lain. |

Catatan: saat ini dashboard cashier memakai `order.view`. Jika `cashier_dashboard.view` tidak dibuat, plan harus menjelaskan permission minimum untuk membuka home.

### 7.2 Order

| Key kandidat | Label owner | Kegunaan |
| --- | --- | --- |
| `order.view` | Lihat Order | List/detail order dan count order baru. |
| `order.create` | Buat Order | Membuat transaksi/order baru. |
| `order.update` | Edit Order | Mengubah data order dan item order. |
| `order.delete` | Hapus Order | Menghapus order. |
| `order.accept` | Terima Order | Menerima order masuk dari customer. |
| `order.reject` | Tolak Order | Menolak order masuk dari customer. |
| `order.start` | Mulai Order | Mengubah order menjadi mulai diproses. |
| `order.complete` | Selesaikan Order | Menyelesaikan order. |
| `order.weigh` | Timbang Order | Menimbang order dan mengoreksi kuantitas/item. |
| `order.payment.manage` | Kelola Pembayaran Order | Mengatur pembayaran order, termasuk mark COD paid jika dipakai. |
| `order.print` | Cetak Struk dan Label | Akses print info, receipt, dan label. |
| `order.wa_notification.preview` | Preview Notifikasi WA | Melihat preview pesan WA order. |
| `order.wa_notification.send` | Kirim Notifikasi WA | Mengirim notifikasi WA order. |

Catatan: `order.manage` existing terlalu luas. Plan perlu memecah route yang saat ini memakai `order.manage` ke action permission yang sesuai.

### 7.3 Customer dan Membership Customer

| Key kandidat | Label owner | Kegunaan |
| --- | --- | --- |
| `customer.view` | Lihat Customer | List/detail customer. |
| `customer.create` | Buat Customer | Membuat customer. |
| `customer.update` | Edit Customer | Mengubah customer. |
| `customer.delete` | Hapus Customer | Menghapus customer. |
| `customer_subscription.view` | Lihat Subscription Customer | List/detail subscription customer. |
| `customer_subscription.create` | Buat Subscription Customer | Membuat subscription customer. |
| `customer_subscription.update` | Edit Subscription Customer | Mengubah subscription customer. |
| `customer_subscription.delete` | Hapus Subscription Customer | Menghapus subscription customer. |
| `membership_plan.view` | Lihat Paket Membership | List/detail membership plan. |
| `membership_contract.view` | Lihat Kontrak Membership | List/detail kontrak membership. |
| `membership_contract.create` | Buat Kontrak Membership | Membuat kontrak membership dari customer. |

Catatan: saat ini sebagian route membership memakai `customer.view` atau `customer.manage`. Owner perlu bisa membedakan akses customer biasa dengan akses membership/subscription jika bisnis membutuhkannya.

### 7.4 Layanan dan Setup Operasional

| Key kandidat | Label owner | Kegunaan |
| --- | --- | --- |
| `category.view` | Lihat Kategori Layanan | List/detail kategori. |
| `category.create` | Buat Kategori Layanan | Membuat kategori. |
| `category.update` | Edit Kategori Layanan | Mengubah kategori. |
| `category.delete` | Hapus Kategori Layanan | Menghapus kategori. |
| `laundry_service.view` | Lihat Layanan Laundry | List/detail layanan laundry. |
| `laundry_service.create` | Buat Layanan Laundry | Membuat layanan laundry. |
| `laundry_service.update` | Edit Layanan Laundry | Mengubah layanan laundry. |
| `laundry_service.delete` | Hapus Layanan Laundry | Menghapus layanan laundry. |
| `service_package.view` | Lihat Paket Layanan | List/detail service package yang saat ini read-only di mobile cashier. |
| `unit.view` | Lihat Unit | Mengambil daftar unit untuk form layanan. |

Catatan utama dari user: permission layanan laundry harus bisa membedakan create, edit, dan delete. `service.manage` existing tidak cukup karena memberi akses manage semua kategori dan layanan sekaligus.

### 7.5 Keuangan Cashier

| Key kandidat | Label owner | Kegunaan |
| --- | --- | --- |
| `account.view` | Lihat Akun Keuangan | List akun untuk pilihan pembayaran, setoran, dan expense. |
| `deposit.view` | Lihat Setoran | List/detail deposit. |
| `deposit.create` | Buat Setoran | Membuat setoran. |
| `deposit.update` | Edit Setoran | Mengubah setoran. |
| `petty_cash.view` | Lihat Petty Cash | List/detail petty cash. |
| `petty_cash.create` | Buat Petty Cash | Membuat request petty cash. |
| `petty_cash.update` | Edit Petty Cash | Mengubah petty cash yang masih boleh diubah. |
| `expense.view` | Lihat Pengeluaran Outlet | List/detail expense. |
| `expense.create` | Buat Pengeluaran Outlet | Membuat expense. |
| `expense.update` | Edit Pengeluaran Outlet | Mengubah expense. |
| `expense.delete` | Hapus Pengeluaran Outlet | Menghapus expense hanya jika endpoint/controller benar-benar tersedia. |

Catatan: `payment.manage` existing terlalu luas karena memberi akses ke accounts, deposits, petty cash, expenses, dan beberapa action pembayaran order.

### 7.6 Setting Cashier

Setting lokal seperti profile, PIN security, dan printer perlu diperlakukan hati-hati:

1. Logout, refresh session, dan no-permission action harus selalu tersedia.
2. Profile employee dan PIN security sebaiknya tetap bisa diakses employee yang sudah boleh masuk cashier, karena itu kebutuhan akun pribadi.
3. Printer setting lokal bisa tetap tersedia jika tidak mengakses data outlet sensitif.
4. Jika plan ingin mengunci setting tertentu, key harus dibuat eksplisit, misalnya `printer.manage`, tetapi jangan sampai employee terkunci dari logout atau pemulihan akses.

## 8. Mapping Compatibility Permission Lama

Plan implementasi wajib menjaga agar posisi existing tidak kehilangan akses secara tiba-tiba. Ada dua pendekatan yang dapat dipilih:

1. Migrasi data lama ke permission granular baru.
2. Menjaga permission lama sebagai alias sementara yang dihitung setara dengan beberapa permission granular.

Kebutuhan bisnisnya: setelah deploy, posisi `Kasir` default yang sebelumnya berfungsi tetap dapat bekerja minimal setara sebelum owner mengubah permission.

Mapping compatibility yang disarankan:

| Permission lama | Dapat dimigrasikan/dianggap setara dengan |
| --- | --- |
| `order.view` | `cashier_dashboard.view`, `order.view` |
| `order.create` | `order.create` |
| `order.manage` | `order.update`, `order.delete`, `order.accept`, `order.reject`, `order.start`, `order.complete`, `order.weigh`, `order.wa_notification.preview`, `order.wa_notification.send` |
| `payment.manage` | `account.view`, `order.payment.manage`, `deposit.view`, `deposit.create`, `deposit.update`, `petty_cash.view`, `petty_cash.create`, `petty_cash.update`, `expense.view`, `expense.create`, `expense.update` |
| `customer.view` | `customer.view`, `customer_subscription.view`, `membership_plan.view`, `membership_contract.view` |
| `customer.manage` | `customer.create`, `customer.update`, `customer.delete`, `customer_subscription.create`, `customer_subscription.update`, `customer_subscription.delete`, `membership_contract.create` |
| `service.view` | `category.view`, `laundry_service.view`, `service_package.view`, `unit.view` |
| `service.manage` | `category.create`, `category.update`, `category.delete`, `laundry_service.create`, `laundry_service.update`, `laundry_service.delete` |

Catatan: jika `order.print` dianggap bagian dari `order.view` atau `order.manage`, plan harus memilih dan menjelaskan alasan bisnisnya. Cetak struk/label biasanya lebih aman jika punya permission sendiri karena bisa memuat data customer dan pembayaran.

## 9. Aturan UX Cashier App

### 9.1 Akses Masuk Aplikasi Cashier

Employee boleh masuk aplikasi cashier jika memiliki minimal satu permission operasional cashier pada outlet aktif atau outlet yang dapat diakses.

Jika employee tidak memiliki permission cashier apa pun, tampilkan no-permission app-level:

```text
Anda tidak memiliki izin untuk mengakses aplikasi kasir.
Silakan hubungi owner outlet Anda untuk meminta akses.
```

Plan perlu mengganti gate lama yang hanya memeriksa `order.view`, karena user bisa saja diberi akses cashier terbatas seperti hanya `laundry_service.view` atau hanya `deposit.create`.

### 9.2 Menu dan Quick Action Dinamis

Menu sidebar dan quick action harus mengikuti permission:

1. `Transaksi` tampil jika user punya salah satu permission order yang relevan.
2. `Pelanggan` tampil jika punya permission customer/subscription/membership yang relevan.
3. `Layanan Laundry` tampil jika punya `laundry_service.view` atau action laundry service lain yang membutuhkan screen.
4. `Kategori` tampil jika punya permission category.
5. `Paket Layanan` tampil jika punya `service_package.view`.
6. `Membership` tampil jika punya `membership_plan.view` atau `membership_contract.view`.
7. `Dana & Keuangan` atau sub-menu finance tampil hanya untuk permission finance terkait.
8. Tombol create/edit/delete/action harus tampil atau aktif hanya jika permission action tersedia.

Jika action disembunyikan, UI tidak boleh membuat user bingung. Jika action tetap terlihat karena alasan discoverability, action harus disabled dan saat ditekan memberi pesan izin tidak tersedia.

### 9.3 Route dan Deep Link

Jika employee membuka route langsung atau deep link tanpa permission:

1. Jangan tampilkan data fitur.
2. Tampilkan no-permission screen yang menyebut fitur/action yang ditolak.
3. Sediakan aksi `Kembali`, `Cek Ulang Akses`, dan `Keluar` sesuai konteks.

Contoh copy:

```text
Anda tidak memiliki izin untuk membuka Layanan Laundry.
Silakan hubungi owner outlet Anda untuk meminta akses.
```

Untuk action:

```text
Anda tidak memiliki izin untuk membuat layanan laundry.
Silakan hubungi owner outlet Anda untuk meminta akses.
```

### 9.4 Response 403 dari Backend

Jika backend mengembalikan 403 karena permission:

1. Jangan tampilkan raw `403 Forbidden`, stack trace, atau response teknis.
2. Aplikasi harus mengubahnya menjadi UI no-permission yang mudah dipahami.
3. Jika 403 terjadi pada request action di dalam screen, minimal tampilkan dialog/snackbar no-permission dan cegah perubahan state lokal palsu.
4. Jika 403 menunjukkan akses screen utama dicabut, arahkan user ke no-permission screen atau refresh permission.

### 9.5 Cek Ulang Akses

Halaman no-permission sebaiknya menyediakan `Cek Ulang Akses`:

1. Aplikasi memanggil endpoint `me`.
2. Jika owner sudah menambahkan permission, employee diarahkan ke screen yang sekarang boleh diakses.
3. Jika permission belum tersedia, tampilkan feedback singkat:

```text
Akses belum tersedia. Silakan hubungi owner outlet Anda.
```

## 10. Alur Bisnis

### 10.1 Owner Memberi Akses Laundry Service View Saja

1. Owner membuka website owner.
2. Owner mengedit posisi `Kasir Layanan`.
3. Owner memilih `Lihat Layanan Laundry`.
4. Employee dengan posisi tersebut login ke cashier app.
5. Employee dapat melihat list/detail layanan laundry.
6. Employee tidak melihat atau tidak bisa menekan tombol buat, edit, dan hapus layanan laundry.
7. Jika employee membuka route create/edit lewat deep link, aplikasi menampilkan no-permission.
8. Jika employee memaksa request API create/edit/delete, backend mengembalikan 403.

### 10.2 Owner Memberi Akses Create Layanan Laundry Tanpa Delete

1. Owner memberi `Lihat Layanan Laundry` dan `Buat Layanan Laundry`.
2. Employee dapat membuka list layanan dan membuat layanan baru.
3. Employee tidak dapat mengedit atau menghapus layanan existing.
4. Tombol edit/delete tidak tampil atau disabled.

### 10.3 Owner Memisahkan Akses Category dan Laundry Service

1. Employee memiliki `laundry_service.create` tetapi tidak memiliki `category.create`.
2. Employee dapat membuat layanan laundry memakai kategori existing.
3. Employee tidak dapat membuat kategori baru dari cashier app.
4. Jika form layanan membutuhkan kategori, list kategori yang dibutuhkan harus tetap dapat diambil dengan permission yang diputuskan plan, misalnya melalui `category.view` atau read dependency khusus.

### 10.4 Owner Memisahkan Keuangan

1. Employee A hanya memiliki `deposit.create`.
2. Employee A dapat membuat setoran.
3. Employee A tidak dapat membuat expense atau petty cash.
4. Employee A tidak melihat menu Pengeluaran Outlet dan Petty Cash, kecuali punya permission terkait.

### 10.5 Permission Dicabut Saat Session Masih Aktif

1. Employee sebelumnya memiliki akses layanan laundry.
2. Owner mencabut `laundry_service.view`.
3. Saat app refresh session, memanggil `me`, atau mendapat 403 dari endpoint laundry service, app tidak boleh terus memakai cache lama.
4. Employee diarahkan ke no-permission atau menu layanan hilang setelah permission terbaru dimuat.

## 11. Kebutuhan Fungsional

### FR-01 Master Permission Catalog Bertambah Granular

Sistem harus menyediakan permission cashier granular di master catalog yang digunakan website owner.

### FR-02 Owner Bisa Memilih Permission Granular pada Position

Owner dapat menambah/menghapus permission granular pada posisi outlet melalui create/edit position.

### FR-03 Default Position Tetap Aman Setelah Update

Default position `Kasir` harus mendapat permission yang membuat perilaku existing tetap berjalan, atau data existing harus dimigrasikan agar tidak kehilangan akses.

### FR-04 Backend Route Cashier Menggunakan Permission Granular

Endpoint mobile cashier harus memakai permission yang sesuai action, bukan hanya permission coarse lama.

### FR-05 Flutter Cashier Memiliki Permission Checker

Cashier app perlu punya checker permission yang membaca `allPermissions` dan/atau `accessibleOutlets`, mirip pola `PermissionChecker` pada aplikasi production.

### FR-06 Gate Login Cashier Tidak Lagi Hanya `order.view`

Employee boleh masuk cashier jika punya minimal satu permission cashier yang valid. Jika tidak ada, tampilkan no-permission app-level.

### FR-07 Menu dan Route Mengikuti Permission

Sidebar, quick action, route guard, dan deep link harus mengikuti permission fitur.

### FR-08 Action Button Mengikuti Permission

Button create/edit/delete/order action/payment/print/WA harus disembunyikan, disabled, atau ditolak dengan pesan no-permission jika user tidak punya permission.

### FR-09 No-Permission Screen Kontekstual

No-permission harus menyebut aplikasi, fitur, atau action yang ditolak dan mengarahkan user menghubungi owner.

### FR-10 403 Backend Ditangani sebagai No-Permission

Repository/cubit/screen tidak boleh menampilkan error teknis mentah saat backend menolak permission.

### FR-11 Permission Mengikuti Outlet Context

Permission harus dievaluasi pada outlet yang benar. Employee tidak boleh memakai permission dari outlet lain untuk mengakses fitur outlet aktif.

### FR-12 Read Dependency Ditentukan Jelas

Plan harus menentukan dependency permission untuk form yang membutuhkan data lain, misalnya create order butuh customer, laundry service, membership, account, dan unit.

## 12. Kebutuhan Non-Fungsional

1. Perubahan harus backward compatible atau memiliki migrasi data yang jelas.
2. Tidak boleh ada privilege escalation karena UI hanya menyembunyikan tombol.
3. Backend tetap menjadi enforcement utama.
4. Permission label harus mudah dipahami owner non-teknis.
5. No-permission screen harus ringan dan tidak memuat data sensitif.
6. Cache permission tidak boleh membuat employee yang aksesnya dicabut tetap bisa memakai fitur terlalu lama.
7. Tidak boleh terjadi redirect loop antara splash, login, home, dan no-permission.
8. Test harus membuktikan route, action, dan API sama-sama menolak akses tanpa permission.

## 13. Edge Case

1. Employee punya `laundry_service.create` tetapi tidak punya `laundry_service.view`.
   - Plan harus menentukan apakah `create` mengimplikasikan `view`, atau owner wajib memilih keduanya.

2. Employee punya permission create order tetapi tidak punya customer/laundry service view.
   - Plan harus menentukan apakah form create order tetap bisa mengambil data dependency secara terbatas.

3. Employee punya permission pada outlet A tetapi membuka data outlet B.
   - Akses harus ditolak.

4. Permission lama masih tersimpan di database setelah deploy.
   - Jangan sampai posisi existing kehilangan akses tanpa migrasi/alias.

5. Route delete expense terdaftar tetapi controller destroy belum tersedia.
   - Permission `expense.delete` hanya boleh efektif jika endpoint benar-benar tersedia.

6. Employee login berhasil tetapi tidak punya permission cashier apa pun.
   - Tampilkan no-permission app-level, bukan logout otomatis.

7. Employee punya hanya permission setting lokal.
   - Plan harus menentukan apakah itu cukup untuk masuk app. Secara kebutuhan bisnis, akses operasional cashier sebaiknya membutuhkan minimal satu permission operasional.

8. Backend mengembalikan 403 saat user berada di screen yang sebelumnya terbuka.
   - App harus berhenti menampilkan data/action yang sudah tidak boleh diakses setelah permission direfresh.

## 14. Acceptance Criteria

1. Owner melihat permission cashier granular di form create/edit position.
2. Owner dapat menyimpan posisi dengan permission seperti `laundry_service.view`, `laundry_service.create`, `laundry_service.update`, dan `laundry_service.delete`.
3. Permission key yang tidak ada di master catalog tetap ditolak validasi.
4. Employee dengan hanya `laundry_service.view` dapat melihat list/detail layanan laundry.
5. Employee dengan hanya `laundry_service.view` tidak dapat membuka create/edit/delete layanan laundry.
6. Employee dengan `laundry_service.create` dapat membuat layanan laundry jika dependency read yang dibutuhkan terpenuhi.
7. Employee tanpa `laundry_service.update` tidak melihat atau tidak bisa memakai tombol edit layanan laundry.
8. Employee tanpa `laundry_service.delete` tidak melihat atau tidak bisa memakai tombol hapus layanan laundry.
9. API create/edit/delete laundry service menolak employee tanpa permission action yang sesuai.
10. Permission category dan laundry service dapat diatur terpisah.
11. Permission deposit, petty cash, dan expense dapat diatur terpisah.
12. Permission customer dan membership/subscription dapat diatur terpisah sesuai katalog final.
13. Action order seperti accept, reject, weigh, complete, payment, print, dan WA notification dapat dipisah sesuai permission final.
14. Sidebar cashier hanya menampilkan menu yang memiliki permission relevan.
15. Quick action cashier hanya menampilkan action yang boleh diakses.
16. Deep link ke route tanpa permission menampilkan no-permission, bukan data fitur.
17. Response backend 403 ditampilkan sebagai pesan no-permission yang jelas.
18. Employee tanpa permission cashier apa pun melihat pesan:
    `Anda tidak memiliki izin untuk mengakses aplikasi kasir. Silakan hubungi owner outlet Anda untuk meminta akses.`
19. Halaman no-permission menyediakan aksi logout.
20. Jika tombol `Cek Ulang Akses` dibuat, employee dapat masuk ke fitur setelah owner menambahkan permission dan data `me` direfresh.
21. Permission dicabut owner tidak terus dipakai dari cache lama setelah refresh session atau 403.
22. Default posisi `Kasir` existing tetap bisa menjalankan workflow kasir utama setelah perubahan permission.
23. Tidak ada route loop antara splash, login, no-permission, dan home.
24. Test backend membuktikan setiap endpoint mobile cashier penting menolak akses tanpa permission granular.
25. Test Flutter membuktikan menu/action/route utama cashier berubah sesuai permission employee.

## 15. Catatan untuk Penyusunan Plan

Plan implementasi berikutnya perlu memutuskan:

1. Nama key final dan apakah memakai key lama sebagai alias atau migrasi penuh.
2. Daftar permission final di `App\Enums\Permission` dan label Indonesia.
3. Mapping `Permission::defaultForSlug('kasir')`.
4. Migrasi existing `position_permissions`.
5. Route middleware baru di `routes/api_mobile_cashier.php` dan route print di `routes/api.php` jika masih dipakai app cashier.
6. Perubahan validation request position agar otomatis menerima enum baru.
7. Perubahan Flutter cashier auth gate dari `order.view` menjadi checker app access.
8. Permission checker cashier untuk menu, route, dan action.
9. Komponen no-permission cashier yang bisa dipakai app-level, feature-level, dan action-level.
10. Handling 403 di repository/cubit untuk semua fitur cashier.
11. Strategi dependency read untuk form create/edit.
12. Test coverage backend, website owner, dan Flutter cashier.

Hasil akhir yang diinginkan: owner dapat mengatur akses employee per posisi secara detail, misalnya hanya boleh melihat layanan laundry tanpa membuat/mengedit/menghapus, dan employee yang tidak punya izin mendapat pengalaman yang jelas serta aman.
