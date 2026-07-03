# User Need: Sidebar Tablet untuk Cashier dan Production

## Ringkasan

Dokumen ini berisi kebutuhan produk untuk navigasi sidebar pada ukuran tablet atau non-compact di aplikasi WashWallet Cashier dan Production. Pada ukuran mobile atau compact, aplikasi tetap memakai bottom navigation yang sudah berjalan saat ini.

Kebutuhan ini tidak mendefinisikan perubahan API, schema data, atau detail implementasi teknis final. Dokumen ini menjadi acuan agar navigasi tablet lebih terstruktur, konsisten, dan tetap mengikuti permission user.

## Konteks Codebase

Dari pembacaan kebutuhan terhadap kondisi aplikasi saat ini:

- Cashier sudah memakai `OperationalTabletShell` untuk layout non-compact dan `CashierNavigationConfig` untuk konfigurasi navigasi, tetapi grouping menu sidebar belum sesuai kebutuhan baru.
- Production sudah memiliki `ProductionTabletShell` dan `ProductionNavigationConfig`, tetapi daftar menunya masih sederhana: Dashboard, Produksi, dan Kurir.
- Komponen sidebar yang tersedia sudah mendukung section, item, selected state, user account, dan collapsed mode.
- Mobile atau compact layout sudah memiliki bottom navigation atau dynamic bottom bar yang tidak menjadi target perubahan kebutuhan ini.

## User Need

Sebagai kasir WashWallet yang memakai tablet, saya membutuhkan sidebar yang menampilkan area kerja utama secara terstruktur, sehingga saya dapat berpindah ke menu operasional, keuangan, dan pengaturan tanpa kembali ke landing menu terlebih dahulu.

Sebagai kasir, saya ingin sidebar Cashier memiliki area utama untuk `Home` dan `Profile`, sehingga akses ke beranda dan profil tetap mudah ditemukan.

Sebagai kasir, saya ingin menu operasional dikelompokkan dalam section `Operasional`, sehingga pekerjaan harian outlet seperti order, pelanggan, layanan, kategori, paket, membership, dan setup outlet berada dalam satu area yang jelas.

Sebagai kasir, saya ingin menu dana dan keuangan dikelompokkan dalam section `Dana & Keuangan`, sehingga Setoran Kasir, Petty Cash, dan Pengeluaran Outlet tidak tercampur dengan menu operasional.

Sebagai kasir, saya ingin pengaturan printer dan keamanan PIN berada di area `Setting` bagian bawah sidebar, sehingga pengaturan perangkat dan keamanan mudah dibedakan dari pekerjaan transaksi harian.

Sebagai user Production yang memakai tablet, saya membutuhkan pola sidebar section yang konsisten dengan Cashier, sehingga pengalaman navigasi tablet terasa seragam walaupun modul Production lebih terbatas.

Sebagai user Production, saya ingin menu tetap mengikuti permission yang dimiliki, sehingga menu Produksi hanya muncul atau dapat diakses untuk user dengan akses produksi, dan menu Kurir atau Pickup hanya muncul atau dapat diakses untuk user dengan akses kurir.

Sebagai pengguna mobile, saya ingin bottom navigation tetap seperti saat ini, sehingga perubahan sidebar tablet tidak mengubah kebiasaan navigasi di layar kecil.

Sebagai pengguna yang membuka deep link atau berada di nested route, saya ingin item sidebar aktif tetap sinkron dengan halaman saat ini, sehingga saya selalu tahu sedang berada di area menu yang benar.

## Perilaku yang Diharapkan

- Sidebar hanya digunakan pada ukuran tablet atau non-compact berdasarkan breakpoint existing.
- Mobile atau compact layout tetap memakai bottom bar atau dynamic bottom bar yang sudah ada.
- Cashier tablet menampilkan grouping menu yang jelas untuk area utama, `Operasional`, `Dana & Keuangan`, dan `Setting`.
- Cashier tablet menyediakan akses ke `Home` dan `Profile` sebagai area utama.
- Section `Operasional` pada Cashier berisi Order atau Transaksi, Pelanggan, Layanan Laundry, Kategori, Paket Layanan, Membership, dan Setup atau Kelola Outlet sesuai modul dan route yang tersedia.
- Section `Dana & Keuangan` pada Cashier berisi Setoran Kasir, Petty Cash, dan Pengeluaran Outlet.
- Area `Setting` bagian bawah pada Cashier berisi Printer dan Keamanan atau Setting PIN.
- Production tablet mengikuti pola sidebar section yang rapi dan konsisten dengan Cashier, namun tetap hanya menampilkan modul yang tersedia untuk Production.
- Kebutuhan ini tidak mewajibkan Production memiliki fitur Dana atau Keuangan baru jika modul tersebut belum tersedia.
- Active menu harus sinkron dengan route saat ini, termasuk deep link dan nested route.
- Tap item sidebar membawa user langsung ke halaman target jika route tersedia, bukan memaksa user kembali ke landing menu terlebih dahulu.
- Navigasi auth, permission guard, onboarding, setup PIN, dan stale session tetap mengikuti perilaku yang sudah ada.

## Kriteria Penerimaan

- Pada Cashier tablet, user melihat sidebar dengan area utama, section `Operasional`, section `Dana & Keuangan`, dan area `Setting`.
- Pada Cashier tablet, area utama menampilkan `Home` dan `Profile`.
- Pada Cashier tablet, section `Operasional` menampilkan Order atau Transaksi, Pelanggan, Layanan Laundry, Kategori, Paket Layanan, Membership, dan Setup atau Kelola Outlet sesuai route dan permission yang tersedia.
- Pada Cashier tablet, Setoran Kasir, Petty Cash, dan Pengeluaran Outlet berada di section `Dana & Keuangan`, bukan tercampur di `Operasional`.
- Pada Cashier tablet, Printer dan Keamanan atau Setting PIN berada di area `Setting` bagian bawah sidebar.
- Pada Cashier mobile atau compact layout, bottom navigation tetap tidak berubah.
- Pada Production tablet, sidebar memakai grouping yang rapi dan konsisten dengan pola Cashier sesuai modul Production dan Courier yang tersedia.
- Pada Production tablet, menu tetap permission-aware: Produksi hanya tersedia untuk user dengan akses produksi, dan Kurir atau Pickup hanya tersedia untuk user dengan akses kurir.
- Pada Production tablet, tidak ada kewajiban menambahkan modul Dana atau Keuangan baru jika modul tersebut belum ada.
- Active sidebar item benar saat user berada di Home, Profile, Orders, Customers, Laundry Services, finance items, Printer, atau PIN Security.
- Deep link atau nested route seperti pelanggan, layanan laundry, printer, dan PIN security menandai menu sidebar yang benar.
- Tap setiap item Cashier sidebar membawa user langsung ke route target yang sesuai jika route tersebut tersedia.
- Navigasi auth, permission guard, onboarding, setup PIN, dan stale session tidak berubah akibat kebutuhan sidebar tablet ini.

## Batasan dan Asumsi

- "Tablet" dimaknai sebagai semua ukuran non-compact berdasarkan breakpoint existing.
- `Profile` mengarah ke route profile atau settings profile yang sudah tersedia.
- `Printer` mengarah ke pengaturan printer yang sudah tersedia.
- `PIN` atau `PIN Security` mengarah ke halaman keamanan atau setting PIN yang sudah tersedia.
- Cashier menjadi target detail menu lengkap.
- Production hanya mengikuti pola sidebar sesuai fitur dan permission yang tersedia.
