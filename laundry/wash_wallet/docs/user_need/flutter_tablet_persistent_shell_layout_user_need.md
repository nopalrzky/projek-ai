# User Need: Persistent Shell Layout Dashboard Flutter Tablet

Tanggal: 2026-06-29

## Ringkasan Kebutuhan

Aplikasi Flutter tablet membutuhkan layout dashboard yang menggunakan persistent shell layout dengan `go_router` + `ShellRoute` atau `StatefulShellRoute`. Sidebar dan header harus tetap statis/persist selama user berpindah route, sedangkan hanya area content/body yang berubah mengikuti route aktif.

User need ini akan menjadi acuan untuk menyusun plan teknis implementasi, khususnya untuk aplikasi Cashier dan Production.

## Latar Belakang

Saat ini aplikasi sudah memiliki komponen layout tablet bersama seperti `OperationalTabletShell`, `OperationalSidebar`, dan `OperationalTopHeader`. Komponen ini sudah bisa membentuk layout tablet dengan sidebar, header, dan body.

Namun kebutuhan baru bukan hanya tampilan visual layout, melainkan perilaku navigasi dashboard:

- Sidebar dan header tidak boleh terasa reload, flicker, atau reset saat pindah menu.
- Navigasi antar menu dashboard harus mengganti content/body saja.
- State lokal pada shell, seperti selected menu, collapsed sidebar, dan input/search header bila ada, harus tetap konsisten selama navigasi.
- Struktur route harus memusatkan layout shell di level router, bukan membungkus setiap screen secara manual.

## Kondisi Codebase Saat Ini

Berdasarkan pembacaan codebase:

- Cashier sudah memakai `GoRouter` dengan `StatefulShellRoute.indexedStack` dan `MainShellScreen` untuk sebagian route utama.
- `MainShellScreen` Cashier sudah merender `OperationalTabletShell` dengan `body` berisi `StatefulNavigationShell`.
- Cashier masih memiliki beberapa route tablet/management/profile/settings yang berada sebagai route standalone dan/atau memakai wrapper shell terpisah, sehingga belum seluruh dashboard berada dalam persistent shell yang sama.
- Production masih menggunakan `GoRouter` dengan daftar `GoRoute` individual.
- Production memiliki `ProductionTabletShell` yang membungkus screen satu per satu, sehingga shell dapat ikut dibuat ulang saat pindah route.
- Komponen UI shell tablet sudah tersedia di package `wash_wallet_ui`, sehingga kebutuhan utama adalah penataan arsitektur routing dan ownership layout.

## Masalah Yang Ingin Diselesaikan

1. Sidebar dan header berpotensi dibuat ulang ketika setiap screen membungkus dirinya sendiri dengan shell tablet.
2. Perpindahan menu dashboard dapat terasa seperti pindah halaman penuh, bukan mengganti body di dalam dashboard yang sama.
3. State shell seperti collapsed sidebar, search/header state, selected menu, atau state UI lain berisiko reset saat navigasi.
4. Wrapper layout tersebar di banyak screen sehingga maintenance menjadi sulit dan rawan inkonsistensi.
5. Cashier dan Production berpotensi memiliki perilaku navigasi tablet yang berbeda walaupun memakai layout operasional yang sama.

## Tujuan

Menyusun kebutuhan agar aplikasi memiliki dashboard tablet dengan persistent shell layout:

- Sidebar tetap persist selama navigasi dashboard.
- Header tetap persist selama navigasi dashboard.
- Content/body berubah sesuai route aktif.
- Route dashboard dikelompokkan di bawah shell route.
- Screen tidak perlu lagi membungkus dirinya sendiri dengan shell tablet untuk kebutuhan dashboard utama.
- Selected menu sidebar selalu sesuai dengan route aktif.
- Deep link langsung ke route dashboard tetap menampilkan shell dengan menu aktif yang benar.
- Auth guard dan permission guard tetap berjalan sesuai perilaku existing.
- Tampilan compact/mobile tetap mengikuti pola existing dan tidak ikut rusak karena perubahan tablet shell.

## Scope

### Termasuk

- Dashboard tablet untuk aplikasi Cashier.
- Dashboard tablet untuk aplikasi Production.
- Penggunaan `go_router` dengan `ShellRoute` atau `StatefulShellRoute`.
- Penataan route protected/dashboard agar berada di bawah persistent shell.
- Perilaku sidebar/header yang persist.
- Mapping route aktif ke selected menu sidebar.
- Deep link ke halaman dashboard.
- Responsiveness antara tablet dan compact/mobile.
- Penyesuaian penggunaan `OperationalTabletShell` agar berada di level shell.

### Tidak Termasuk

- Redesign visual besar-besaran pada sidebar atau header.
- Perubahan backend/API.
- Perubahan domain logic cashier atau production.
- Perubahan struktur database.
- Perubahan flow login, kecuali yang diperlukan untuk menjaga redirect/guard tetap benar.
- Implementasi fitur baru di dalam halaman body.
- Penggantian total navigation library selain `go_router`.

## Kebutuhan UX

1. Saat user klik menu di sidebar tablet, sidebar dan header tetap berada di layar tanpa reload visual.
2. Area content/body berubah sesuai route tujuan.
3. Selected menu sidebar berubah mengikuti route aktif.
4. Header tetap mempertahankan tampilan dan state global yang relevan.
5. Jika sidebar memiliki collapsed/expanded state, state tersebut tetap bertahan saat user pindah route.
6. Jika user membuka route dashboard langsung dari deep link, shell tetap muncul dan menu yang sesuai harus aktif.
7. Tombol back harus bekerja pada riwayat navigasi content tanpa menghilangkan shell dashboard.
8. Route auth seperti splash, login, onboarding, dan route setup khusus tidak boleh menampilkan dashboard shell bila memang berada di luar area authenticated dashboard.
9. Pada mobile/compact, aplikasi boleh tetap memakai pola existing seperti bottom navigation atau layout screen biasa.

## Kebutuhan Routing

1. Route dashboard authenticated perlu dikelompokkan di bawah satu shell route.
2. Shell route bertanggung jawab merender layout utama tablet: sidebar, header, dan body placeholder.
3. Child route bertanggung jawab merender isi body saja.
4. Untuk route yang membutuhkan preserve state antar tab/menu utama, plan teknis perlu mengevaluasi penggunaan `StatefulShellRoute.indexedStack`.
5. Untuk route yang hanya membutuhkan wrapper persistent tanpa branch state terpisah, plan teknis dapat mengevaluasi penggunaan `ShellRoute`.
6. Redirect auth dan permission harus tetap berjalan sebelum user masuk ke route dashboard.
7. Route yang berada di luar dashboard, seperti login dan splash, harus tetap berada di luar shell.
8. Detail page yang masih bagian dari workflow dashboard, seperti detail order atau item produksi, perlu tetap tampil di dalam shell bila UX tablet mengharuskan sidebar/header persist.
9. Route settings/profile yang diakses dari sidebar/header tablet perlu diputuskan apakah termasuk dashboard shell atau standalone, tetapi perilaku akhirnya harus konsisten dan tidak menyebabkan nested shell ganda.

## Kebutuhan Untuk Cashier

Cashier sudah memiliki dasar persistent shell melalui `StatefulShellRoute.indexedStack` dan `MainShellScreen`. Plan teknis berikutnya perlu mengevaluasi:

- Route mana saja yang saat ini sudah berada di dalam shell utama.
- Route mana saja yang masih standalone tetapi secara UX tablet seharusnya berada dalam shell.
- Apakah wrapper seperti standalone tablet shell masih dibutuhkan atau bisa dikurangi.
- Bagaimana selected menu diturunkan dari route aktif, termasuk route detail atau child route.
- Bagaimana compact/mobile tetap berjalan dengan pola existing.

Contoh area route yang perlu dievaluasi untuk masuk atau tetap kompatibel dengan shell:

- Home/dashboard.
- Orders dan detail order.
- Customer.
- Category.
- Laundry service.
- Service package.
- Membership plan.
- Deposit.
- Petty cash.
- Expense.
- Printer/settings.
- Profile.
- PIN/security settings.

## Kebutuhan Untuk Production

Production saat ini lebih membutuhkan perubahan arsitektur karena route masih berupa `GoRoute` individual dan screen dibungkus dengan `ProductionTabletShell` masing-masing.

Plan teknis berikutnya perlu mengevaluasi:

- Membuat shell route dashboard production.
- Memindahkan ownership `ProductionTabletShell` atau `OperationalTabletShell` dari level screen ke level route shell.
- Menjadikan halaman production sebagai child route yang hanya merender body.
- Menghindari nested shell saat route berpindah dari home ke orders, pickup schedule, detail order, atau profile/settings.
- Menentukan route mana yang harus berada di luar shell, seperti splash/login/setup.

Contoh area route yang perlu dievaluasi untuk berada di dalam shell:

- Home production.
- Orders.
- Order detail.
- Order item detail.
- Pickup schedule.
- Profile/settings bila tersedia untuk tablet.

## Kebutuhan State Dan Persistensi

1. Shell widget harus tetap mounted selama navigasi antar child route dashboard.
2. Sidebar/header tidak boleh dibuat ulang sebagai bagian dari setiap screen body.
3. State selected menu harus berasal dari route aktif, bukan hanya index lokal yang mudah tidak sinkron.
4. State collapsed/expanded sidebar harus tetap bertahan selama user masih berada di dashboard shell.
5. Header action/search state perlu memiliki aturan yang jelas: dipertahankan sebagai state global shell atau di-reset secara eksplisit berdasarkan route.
6. Jika user logout atau employee/outlet context berubah, shell boleh rebuild karena konteks aplikasi memang berubah.
7. Jika permission berubah dan route tidak lagi boleh diakses, redirect harus tetap membawa user ke route yang valid tanpa merusak shell.

## Kebutuhan Responsiveness

1. Tablet/expanded layout memakai sidebar + header persistent.
2. Compact/mobile tetap boleh menggunakan bottom navigation atau layout existing.
3. Switching breakpoint tidak boleh membuat route aktif hilang.
4. Body route yang sama harus bisa dirender baik di dalam tablet shell maupun compact layout sesuai pola aplikasi.

## Acceptance Criteria

1. Pada tablet, ketika user berpindah menu dashboard, sidebar dan header tetap terlihat dan tidak flicker.
2. Pada tablet, hanya area content/body yang berubah sesuai route aktif.
3. Sidebar selected state selalu sesuai dengan route aktif, termasuk setelah deep link atau browser refresh bila platform mendukung.
4. State collapsed/expanded sidebar tidak reset saat pindah route dashboard.
5. Header tidak dibuat ulang sebagai bagian dari setiap screen body.
6. Route auth seperti splash/login tidak menampilkan dashboard shell.
7. Route dashboard yang dibuka langsung tetap muncul di dalam shell.
8. Tombol back berpindah antar content route sesuai history tanpa melepas shell.
9. Tidak ada nested tablet shell ganda pada route dashboard.
10. Production tidak lagi bergantung pada wrapper shell per screen untuk mendapatkan layout dashboard tablet.
11. Cashier tetap mempertahankan perilaku existing yang sudah benar, tetapi route standalone yang seharusnya berada di dashboard shell perlu dirapikan.
12. Mobile/compact tetap bisa digunakan seperti sebelumnya.

## Testing Yang Dibutuhkan

Plan teknis perlu mempertimbangkan pengujian berikut:

- Router test untuk memastikan route dashboard dirender di bawah shell.
- Widget test untuk memastikan sidebar/header tetap ada saat navigasi child route.
- Test selected menu berdasarkan route aktif.
- Test deep link ke child route dashboard.
- Test auth redirect agar route login/splash tidak menampilkan shell.
- Manual QA pada tablet untuk memastikan tidak ada flicker sidebar/header.
- Manual QA pada compact/mobile untuk memastikan perubahan tablet shell tidak merusak navigasi mobile.

## Referensi Codebase Yang Perlu Dibaca Saat Menyusun Plan

- `apps/cashier/lib/core/router/app_router.dart`
- `apps/cashier/lib/core/navigation/main_shell_screen.dart`
- `apps/cashier/lib/core/navigation/cashier_standalone_tablet_shell.dart`
- `apps/cashier/lib/core/navigation/cashier_navigation_config.dart`
- `apps/production/lib/core/router/app_router.dart`
- `apps/production/lib/core/widgets/production_tablet_shell.dart`
- `apps/production/lib/core/navigation/production_navigation_config.dart`
- `packages/wash_wallet_ui/lib/src/components/layout/operational_tablet_shell/operational_tablet_shell.dart`
- `packages/wash_wallet_ui/lib/src/components/layout/operational_sidebar/operational_sidebar.dart`
- `packages/wash_wallet_ui/lib/src/components/layout/operational_top_header/operational_top_header.dart`
- `docs/user_need/cashier_production_tablet_management_layout_user_need.md`

## Catatan Untuk AI Penyusun Plan

- Jangan langsung mengubah visual design bila tidak diperlukan.
- Fokus utama adalah ownership layout dan struktur routing.
- Pastikan tidak membuat shell baru di setiap screen.
- Evaluasi apakah `ShellRoute` cukup atau perlu `StatefulShellRoute.indexedStack` untuk menjaga state branch.
- Cashier dapat dijadikan referensi awal karena sudah memiliki `StatefulShellRoute`, tetapi tetap perlu audit route standalone.
- Production perlu perhatian lebih karena saat ini shell masih berada di wrapper screen.
- Plan harus memuat strategi migrasi bertahap agar risiko regresi navigasi rendah.
