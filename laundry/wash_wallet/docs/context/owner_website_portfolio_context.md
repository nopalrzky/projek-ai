# Context: WashWallet Owner/Website untuk Portofolio

Tanggal review: 2026-06-14

Dokumen ini adalah context brief untuk AI model lain yang akan menyusun materi portofolio WashWallet Owner/Website. Fokusnya adalah web dashboard owner/admin dan public marketing website yang berada di `webapp/wash_wallet_be`. Dokumen ini tidak dimaksudkan sebagai copy final, tetapi sebagai sumber konteks produk, fitur, workflow, technical highlights, materi visual, dan batas klaim aman berdasarkan kode yang ada.

## Ringkasan Produk

WashWallet Owner/Website adalah aplikasi web berbasis Laravel + Inertia React untuk dua kebutuhan utama:

- Public website: landing page, about, FAQ, dan feature pages untuk menjelaskan value proposition WashWallet kepada owner laundry.
- Owner/admin dashboard: portal operasional untuk mengelola outlet, order, customer, karyawan, layanan, membership, keuangan, accounting, payroll, wallet, feature unlock, notifikasi, dan import data.

Dalam ekosistem WashWallet, web ini menjadi pusat kontrol bisnis. Mobile apps menangani workflow harian di kasir, produksi/kurir, dan customer, sedangkan owner dashboard memberi pandangan manajerial, konfigurasi, laporan, dan kontrol multi-outlet.

## Masalah yang Diselesaikan

- Owner laundry sulit melihat performa semua outlet dari satu tempat.
- Data outlet, order, customer, service, payroll, dan laporan keuangan sering terpisah.
- Proses pengaturan layanan, harga, karyawan, membership, dan fitur outlet rentan manual dan tidak konsisten.
- Owner butuh laporan revenue, order, customer, asset/accounting, wallet, dan withdrawal tanpa rekap spreadsheet.
- Platform butuh public website untuk menjelaskan fitur, pricing/value, dan mengarahkan user ke register/login.

## Product Surface

### 1. Public Marketing Website

Route publik:

- `/`
- `/about`
- `/faq`
- `/features/affiliate-program`
- `/features/operational-management`
- `/features/coin-system`
- `/features/financial-accounting`
- `/features/hr-payroll`
- `/features/membership`

Landing page memiliki section:

- Hero
- About
- Problems
- Feature overview
- ROI calculator
- How it works
- Comparison
- Pricing section
- Risk reversal
- FAQ
- Final CTA

Feature pages memakai pattern komponen reusable:

- feature hero
- pain points
- highlights
- benefits
- comparison
- FAQ
- final CTA

Portfolio angle:
Public website menunjukkan sisi go-to-market produk SaaS, bukan hanya internal admin panel. Ia menjelaskan masalah bisnis laundry dan mengarahkan owner untuk memahami ekosistem WashWallet.

### 2. Owner Dashboard

Dashboard utama di `/dashboard` menampilkan:

- welcome section
- quick metrics
- revenue overtime chart
- asset summary
- recent coin transactions
- recent orders

Quick metrics dari backend mencakup:

- total revenue
- total orders
- total customers
- total outlets

Asset summary berasal dari account/journal detail, sehingga dashboard tidak hanya menampilkan transaksi order, tetapi juga menghubungkan data akuntansi.

Portfolio angle:
Dashboard bisa diposisikan sebagai cockpit owner untuk memantau revenue, outlet, customer, order, asset, coin usage, dan order terbaru.

## Fitur Utama Owner/Admin Dashboard

### 1. Authenticated Admin Layout

- Dashboard memakai `AuthenticatedLayout`.
- Layout memiliki header, sidebar, breadcrumb, search, theme toggle, profile section, dan responsive mobile sidebar.
- Sidebar collapsed state disimpan di `localStorage`.
- Page transition memakai Framer Motion.
- Theme memakai `ThemeContext`.
- Menu sidebar dapat difilter dengan pencarian menu.
- Unread notification count tampil sebagai badge di menu Notifikasi.

Portfolio angle:
Owner dashboard dibangun seperti operational SaaS dashboard yang scalable, bukan halaman admin sederhana.

### 2. Sidebar Information Architecture

Menu dashboard dibagi menjadi section:

- Utama: Dashboard, Profil Saya, Notifikasi.
- Keuangan Owner: Dompet Pendapatan, Rekening Bank Saya, Tarik Saldo, Topup Koin, Riwayat Transaksi Koin, Transfer ke Outlet.
- Operasional: Manajemen Order, Catat Pengeluaran, Setoran Kas Outlet, Data Pelanggan, Data Karyawan, Kelola Outlet, Layanan Laundry, Daftar Membership, Deposit Pelanggan, Kas Kecil, Prive, Afiliasi.
- Keuangan Karyawan: Payroll, Kasbon/Loan, Catat Denda, Jabatan/Posisi.
- Akuntansi & Laporan: COA, Jurnal Umum, Buku Besar, Periode Akuntansi, Laba Rugi, Neraca.
- Pengaturan Data: Kategori Layanan, Atur Deposit, Paket Membership, Jenis Denda, Komponen Gaji, Satuan, Pengaturan Sistem, Bank Master Withdrawal, Antrean Penarikan Dana.

Menu tertentu dibatasi role:

- owner: wallet, owner bank accounts, wallet withdrawals.
- super_admin: salary components, units, system settings, withdrawal bank master, admin wallet withdrawals.

Portfolio angle:
Struktur menu menunjukkan domain bisnis yang dalam: operasi laundry, finance, accounting, HR, wallet, dan platform admin.

### 3. Multi-Outlet Management

- Owner dapat mengelola outlet dari web dashboard.
- Outlet index memakai DataView dengan search, filters, sorting, pagination, actions, dan table columns.
- Outlet dapat dibuat, diedit, dilihat, dihapus, diaktifkan, diimport, dan diexport.
- Outlet route memiliki nested management untuk:
  - activation
  - categories
  - customers
  - employees
  - fines
  - laundry services
  - membership plans
  - operational days
  - positions
  - service packages
  - outlet features
  - courier schedules
  - courier settings
  - outlet settings
- Import flow tersedia untuk outlet, category, customer, dan laundry service.

Portfolio angle:
Ini cocok ditonjolkan sebagai multi-outlet operations management. Owner dapat mengelola struktur bisnis dari pusat, tetapi tetap punya detail per outlet.

### 4. Courier Settings dan Delivery Pricing

- Outlet courier settings dapat diatur dari dashboard.
- UI pengaturan kurir memakai tabs:
  - Strategi Harga
  - Pengaturan Lainnya
- Pricing strategy mendukung mode yang dipetakan di UI:
  - flat rate
  - distance based
  - tiered
  - zone based
- Ada editor untuk tier pricing dan zone pricing.
- Ada modifier untuk:
  - base fee
  - per km fee
  - min/max fee
  - free radius
  - max distance
  - surge multiplier
  - night surcharge
  - weekend surcharge
  - merchant subsidy
  - free shipping mode
  - minimum order free shipping
- Perubahan courier setting berdampak ke kalkulasi ongkos kirim di Customer App.
- Route juga mendukung zone option lookup sampai village berdasarkan district.

Portfolio angle:
Courier pricing adalah fitur domain-heavy. Ini menunjukkan kemampuan modeling pricing yang lebih kompleks daripada ongkir flat biasa.

### 5. Order Management

- Owner dashboard memiliki order index dan order show.
- Route order web mendukung:
  - list order
  - detail order
  - delete order
  - manual payment store
  - manual payment delete
- Dashboard juga menampilkan recent orders.
- Order domain di backend terhubung ke cashier/customer/production apps, sehingga web owner dapat diposisikan sebagai monitoring dan control layer.

Portfolio angle:
Order dashboard bukan POS utama, tetapi memberi visibility owner terhadap order lifecycle lintas channel.

### 6. Customer dan Membership Management

- Owner dapat mengelola customer.
- Customer route memiliki nested:
  - membership contracts
  - customer subscriptions
- Dashboard juga punya route resource global untuk:
  - customers
  - customer subscriptions
  - membership contracts
  - membership plans
  - service packages
- Membership-related pages mencakup customer quota dan quota usage logs.
- Service package dapat memiliki service package items dan customer subscriptions.

Portfolio angle:
Fitur ini menunjukkan retention/loyalty layer: owner tidak hanya mencatat order, tetapi bisa mengatur membership, deposit pelanggan, quota, dan kontrak.

### 7. Laundry Services dan Master Data

- Owner/admin dapat mengelola:
  - categories
  - laundry services
  - units
  - service packages
  - membership plans
  - fines
  - positions
  - accounts/COA
  - settings
- Laundry service nested dapat dibuat dari category atau outlet.
- Laundry service mendukung courier eligibility update secara individual dan bulk.
- Laundry service process juga tersedia sebagai domain service/controller/page.

Portfolio angle:
Master data yang rapi penting karena semua mobile workflow bergantung pada layanan, harga, unit, kategori, paket, dan proses yang didefinisikan owner.

### 8. Finance, Accounting, dan Reports

Dashboard menyediakan modul:

- Chart of Accounts
- Journal Entries
- General Ledger
- Accounting Periods
- Profit Loss
- Balance Sheet
- Expenses
- Deposits
- Petty Cash
- Prive

General ledger backend menghitung:

- opening balance
- transactions
- running balance
- closing balance
- ledger summary
- compare multiple accounts
- export data structure

Routes accounting mendukung:

- general ledger detail
- general ledger summary
- compare accounts
- print
- export
- profit loss compare/print/export
- balance sheet compare/print/export
- accounting period close/reopen

Portfolio angle:
Ini adalah kekuatan utama owner dashboard: WashWallet bukan hanya order CRUD, tetapi sudah masuk ke accounting reports untuk bisnis laundry.

### 9. HR, Payroll, Loan, dan Fines

Dashboard memiliki modul:

- Employees
- Employee positions
- Employee processes
- Employee salaries
- Payrolls
- Payroll items
- Loans
- Loan logs
- Fines
- Fine logs
- Salaries/salary components
- Positions

Routes mendukung create/edit/delete untuk employee-related data, payroll preview API, dan nested employee financial records.

Portfolio angle:
Modul HR/payroll memperluas WashWallet menjadi operational business management platform, bukan sekadar POS laundry.

### 10. Owner Wallet dan Withdrawal

Owner wallet module mencakup:

- Dompet Pendapatan
- Wallet transaction list dengan search/filter/sort/pagination.
- Wallet balance overview:
  - wallet balance
  - available balance
  - pending withdrawal total
- Owner bank accounts.
- Withdrawal request.
- Withdrawal detail.
- Cancel withdrawal.
- Super admin withdrawal bank master.
- Super admin withdrawal queue:
  - process
  - mark paid
  - reject

Backend wallet service mencatat:

- credit from order
- debit for withdrawal
- refund withdrawal rejected/cancelled
- manual adjustment
- balance before/after
- gross/net/fee amount

Withdrawal service memvalidasi:

- owner bank account aktif
- min withdrawal
- max withdrawal
- available balance
- net amount setelah admin fee
- status transition pending, processing, paid, rejected, cancelled
- proof upload saat mark paid
- notification ke super admin dan owner

Portfolio angle:
Wallet/withdrawal adalah platform monetization/payment settlement layer untuk owner, berbeda dari kasir harian.

### 11. Coin System dan Feature Unlock

Dashboard memiliki:

- Topup Koin
- Riwayat Transaksi Koin
- Feature catalog
- Outlet feature management
- Outlet activation
- Feature trial
- Feature unlock
- Feature exposure
- Auto renewal untuk exposure
- Courier feature activation

Outlet feature service mendukung:

- trial eligibility
- start trial
- unlock free feature
- unlock paid feature dengan coin balance
- activate outlet
- activate exposure
- toggle exposure auto renewal
- process exposure renewals
- coin transaction creation

Portfolio angle:
Coin system dapat diposisikan sebagai monetization mechanism untuk SaaS feature usage: owner/outlet membuka fitur tertentu menggunakan coin, bukan sekadar subscription flat.

### 12. Notifications

Dashboard memiliki notification menu dengan:

- index
- unread count
- recent notifications
- mark all read
- mark read
- mark read and redirect

Notifications dipakai juga di wallet withdrawal flow melalui Laravel notifications.

Portfolio angle:
Notification system mendukung dashboard sebagai command center yang proaktif, bukan hanya data table pasif.

### 13. Import/Export

Import flows tersedia untuk:

- outlets
- categories
- customers
- laundry services

Route import mendukung:

- template download
- upload
- preview
- confirm
- result
- status
- cancel untuk beberapa flow

Maatwebsite Excel digunakan sebagai dependency backend.

Portfolio angle:
Import/export penting untuk onboarding bisnis nyata karena owner bisa memigrasikan data dari spreadsheet/manual process.

### 14. Super Admin Surface

Selain owner, web dashboard memiliki surface untuk super admin:

- withdrawal bank master
- admin wallet withdrawal queue
- salary components
- units
- system settings
- feature catalog

Portfolio angle:
Ini menunjukkan aplikasi mendukung platform operator, bukan hanya tenant owner.

## Alur End-to-End Owner yang Bisa Diceritakan

1. Visitor membuka landing page WashWallet dan melihat fitur, pricing/value, FAQ, dan CTA register.
2. Owner login ke dashboard.
3. Owner melihat quick metrics, revenue chart, asset summary, coin transactions, dan recent orders.
4. Owner membuat outlet dan mengaktifkan fitur outlet.
5. Owner mengatur layanan, kategori, harga, service package, membership, dan operational days.
6. Owner mengatur karyawan, posisi, proses produksi, salary, loan, fine, dan payroll.
7. Owner mengatur courier pricing dan schedule per outlet.
8. Mobile apps dipakai kasir/customer/production untuk operasional harian.
9. Owner memantau order, pembayaran, deposit, expense, petty cash, dan accounting reports.
10. Pendapatan order masuk ke wallet owner.
11. Owner mengajukan withdrawal ke rekening bank.
12. Super admin memproses withdrawal sampai paid/rejected.

## Technical Highlights

- Backend Laravel 13 dengan PHP 8.4.
- Inertia Laravel + React 18 + TypeScript untuk dashboard dan public website.
- Tailwind CSS + Vite untuk frontend build.
- Laravel Sanctum untuk token/mobile auth dan web auth context.
- Spatie Permission untuk roles/permissions.
- Spatie Query Builder untuk query/filter patterns.
- Midtrans PHP SDK untuk payment-related domain.
- Kreait Firebase untuk FCM integration.
- Maatwebsite Excel untuk import/export.
- Reverb tersedia sebagai dependency broadcasting.
- UI web memakai component system internal:
  - Button
  - Card
  - Alert
  - DataView/DataTable
  - Filters
  - Form
  - Modal
  - Tabs
  - Header
  - Sidebar
  - Breadcrumb
  - Google Maps components
- Frontend dependencies yang relevan:
  - Recharts untuk chart/dashboard
  - TanStack Table untuk table behavior
  - Framer Motion untuk transitions
  - Lucide React untuk icons
  - React Day Picker
  - React Dropzone
  - Axios
  - Ziggy routes
- Backend memakai service layer seperti `DashboardService`, `OutletFeatureService`, `WalletBalanceService`, `WalletWithdrawalService`, `GeneralLedgerService`, `CourierPricingEngine`, `CourierSettingService`, `OrderService`, dan lain-lain.
- Multi-tenant scoping berada di `BaseService`, membedakan super admin, owner, employee, dan customer account context.
- Web route dashboard dibagi dengan resource controllers dan nested route untuk detail domain.

## API/Web Surface yang Relevan

Public:

- `GET /`
- `GET /about`
- `GET /faq`
- `GET /features/affiliate-program`
- `GET /features/operational-management`
- `GET /features/coin-system`
- `GET /features/financial-accounting`
- `GET /features/hr-payroll`
- `GET /features/membership`

Owner dashboard:

- `GET /dashboard`
- `GET /dashboard/assets/{slug}`
- `resource /dashboard/outlets`
- nested outlet routes for categories, customers, employees, fines, laundry services, membership plans, operational days, positions, service packages, features, courier schedules, courier settings, settings
- `resource /dashboard/orders`
- `POST /dashboard/orders/{id}/payment`
- `DELETE /dashboard/orders/{id}/payment/{paymentLogId}`
- `resource /dashboard/customers`
- `resource /dashboard/customer-subscriptions`
- `resource /dashboard/membership-contracts`
- `resource /dashboard/membership-plans`
- `resource /dashboard/service-packages`
- `resource /dashboard/employees`
- `resource /dashboard/payrolls`
- `resource /dashboard/positions`
- `resource /dashboard/loans`
- `resource /dashboard/fines`
- `resource /dashboard/fine-logs`
- `resource /dashboard/accounts`
- `resource /dashboard/journal-entries`
- `GET /dashboard/general-ledger`
- `GET /dashboard/general-ledger/summary`
- `GET /dashboard/general-ledger/compare`
- `GET /dashboard/profit-loss`
- `GET /dashboard/balance-sheet`
- `resource /dashboard/topups`
- `GET /dashboard/wallet`
- `resource /dashboard/bank-accounts`
- `resource /dashboard/wallet-withdrawals`
- `GET /dashboard/notifications`

Super admin:

- `resource /dashboard/admin/withdrawal-banks`
- admin wallet withdrawal routes for index, show, process, mark paid, reject

Internal dashboard API helpers:

- `/dashboard/api/permissions/catalog`
- account/category/customer/employee/fine/laundry-service lookup endpoints
- payroll preview endpoint
- service package lookup endpoint

## Materi Visual yang Disarankan

- Landing page hero WashWallet.
- Landing page sections: problems, feature overview, ROI calculator, pricing, FAQ.
- Feature page operational management.
- Feature page financial accounting.
- Dashboard overview: quick metrics, revenue chart, asset summary, recent coin transactions, recent orders.
- Sidebar expanded dengan grouping menu owner.
- Outlet index dengan DataView, filters, import/export, create action.
- Outlet detail atau activation/feature unlock page.
- Courier setting page dengan strategy selector, tier editor, zone editor, and modifier form.
- Order index/detail.
- Customer management atau membership contract page.
- General ledger/profit loss/balance sheet page.
- Wallet balance and transaction page.
- Wallet withdrawal detail/admin processing page.
- Notification page.
- Import preview/result page.

## Angle Portofolio yang Kuat

- SaaS owner command center: web dashboard sebagai pusat kendali multi-outlet laundry.
- Business depth: bukan hanya CRUD, tetapi mencakup order, customer, service, membership, HR, payroll, accounting, wallet, withdrawal, feature unlock, dan import.
- Connected ecosystem: owner dashboard mengontrol konfigurasi yang dipakai oleh mobile apps kasir, customer, dan production.
- Domain-heavy engineering: courier pricing, wallet ledger, accounting reports, feature unlock with coin, and multi-tenant scoping.
- Product + marketing: ada public website untuk acquisition dan dashboard untuk retention/operation.
- Scalable UI architecture: reusable DataView, filters, forms, modal, layout, sidebar, chart, and page components.

## Struktur Materi Portofolio yang Disarankan

1. Project overview: Owner/Website sebagai pusat kontrol WashWallet.
2. Problem: owner laundry butuh visibility, konfigurasi, dan laporan lintas outlet.
3. Public website: landing page dan feature pages sebagai SaaS marketing surface.
4. Dashboard: quick metrics, revenue chart, asset summary, recent activity.
5. Operational management: outlet, order, customer, service, membership.
6. Courier/pricing configuration: tier/zone/distance/free shipping.
7. Finance/accounting: wallet, withdrawal, COA, journal, ledger, profit loss, balance sheet.
8. HR/payroll: employees, positions, salaries, loans, fines, payroll.
9. Platform monetization: coin topup, feature unlock, exposure, auto renewal.
10. Architecture: Laravel service layer, Inertia React, reusable UI components, tenant scoping.
11. Impact: centralized control, cleaner operational data, easier reporting, and configuration reuse across mobile apps.

## Anti-Overclaim

Jangan klaim hal berikut kecuali ada bukti tambahan:

- Jangan klaim angka outcome seperti throughput naik, complaint turun, setup 5 menit, atau repeat customer naik. Beberapa angka muncul di copy marketing, tetapi belum terbukti sebagai metrik aktual project.
- Jangan klaim semua fitur landing page sudah production-ready hanya karena ada copy marketing. Gunakan kata "website menampilkan/menyediakan halaman untuk..." bila merujuk public pages.
- Jangan klaim offline-capable untuk web dashboard. Itu muncul sebagai marketing copy mobile app, bukan bukti web owner.
- Jangan klaim security fully audited. Yang aman: ada role-based menu, Spatie Permission, multi-tenant scoping di service layer.
- Jangan klaim semua report export menghasilkan file lengkap jika belum diverifikasi. Yang aman: route/export method tersedia untuk beberapa laporan.
- Jangan klaim live production, jumlah owner, jumlah outlet, revenue, atau jumlah transaksi.
- Jangan tampilkan `.env`, credential payment, token, nomor rekening asli, atau data customer nyata.

## Feature Inventory Singkat

- Public website: home, about, FAQ, feature pages, CTA, pricing/value sections.
- Dashboard overview: quick metrics, revenue overtime, asset summary, recent coin transactions, recent orders.
- Layout: authenticated layout, responsive sidebar, menu search, theme toggle, breadcrumbs, notifications badge.
- Outlet: CRUD, activation, import/export, categories, customers, employees, services, courier settings, operational days, features.
- Courier: pricing strategy, tier editor, zone editor, surcharge/subsidy/free shipping settings, schedule routes.
- Order: index, detail, manual payment handling.
- Customer: customer data, customer subscriptions, membership contracts, quotas.
- Services: category, laundry service, unit, service package, membership plan, fines.
- Finance: expenses, deposits, petty cash, prive, topup, coin transactions.
- Accounting: COA, journal entries, general ledger, accounting periods, profit loss, balance sheet.
- HR/payroll: employees, positions, employee processes, employee salaries, payrolls, loans, fines/fine logs.
- Wallet: owner wallet, bank accounts, withdrawal request, admin withdrawal processing.
- Platform: feature catalog, outlet features, trial/unlock/exposure/auto-renewal.
- Notifications: unread count, recent, mark read, redirect.
- Import: outlet, category, customer, laundry service.

## Copy Snippet Kandidat

"WashWallet Owner Dashboard is the web-based command center for laundry owners, connecting outlet management, orders, customers, services, accounting, payroll, wallet withdrawals, and feature activation into one Laravel + Inertia React dashboard."

"The web platform combines a public SaaS marketing site with a deep operational dashboard. Owners can configure business rules once, then reuse them across cashier, customer, and production mobile workflows."

"A key technical strength is the domain depth: courier pricing strategies, accounting reports, wallet ledger, feature unlock via coin balance, and multi-tenant scoping are handled through Laravel service-layer boundaries."

## Source Files Reviewed

- `docs/context/portfolio_context.md`
- `webapp/wash_wallet_be/composer.json`
- `webapp/wash_wallet_be/package.json`
- `webapp/wash_wallet_be/routes/web.php`
- `webapp/wash_wallet_be/app/Http/Controllers/Web/DashboardController.php`
- `webapp/wash_wallet_be/app/Http/Controllers/Web/OutletController.php`
- `webapp/wash_wallet_be/app/Http/Controllers/Web/OrderController.php`
- `webapp/wash_wallet_be/app/Http/Controllers/Web/WalletController.php`
- `webapp/wash_wallet_be/app/Http/Controllers/Web/WalletWithdrawalController.php`
- `webapp/wash_wallet_be/app/Http/Controllers/Web/Admin/AdminWalletWithdrawalController.php`
- `webapp/wash_wallet_be/app/Services/BaseService.php`
- `webapp/wash_wallet_be/app/Services/DashboardService.php`
- `webapp/wash_wallet_be/app/Services/OutletFeatureService.php`
- `webapp/wash_wallet_be/app/Services/WalletBalanceService.php`
- `webapp/wash_wallet_be/app/Services/WalletWithdrawalService.php`
- `webapp/wash_wallet_be/app/Services/GeneralLedgerService.php`
- `webapp/wash_wallet_be/resources/js/Layouts/AuthenticatedLayout.tsx`
- `webapp/wash_wallet_be/resources/js/Components/Sidebar/Sidebar.tsx`
- `webapp/wash_wallet_be/resources/js/Components/Sidebar/menu.ts`
- `webapp/wash_wallet_be/resources/js/Pages/Dashboard/Index.tsx`
- `webapp/wash_wallet_be/resources/js/Pages/Dashboard/types.ts`
- `webapp/wash_wallet_be/resources/js/Pages/Dashboard/Outlets/Index.tsx`
- `webapp/wash_wallet_be/resources/js/Pages/Dashboard/Outlets/Courier/Edit.tsx`
- `webapp/wash_wallet_be/resources/js/Pages/Dashboard/Wallet/Index.tsx`
- `webapp/wash_wallet_be/resources/js/Pages/Home/Index.tsx`
- `webapp/wash_wallet_be/resources/js/Pages/Home/data.tsx`
- `webapp/wash_wallet_be/resources/js/Pages/Features/OperationalManagement.tsx`
- `webapp/wash_wallet_be/resources/js/Pages/Features/FinancialAccounting.tsx`
- `webapp/wash_wallet_be/resources/js/Pages/Features/HrPayroll.tsx`
- `webapp/wash_wallet_be/resources/js/Pages/Features/Membership.tsx`
- `webapp/wash_wallet_be/resources/js/Pages/Features/Partials/types.ts`
- `webapp/wash_wallet_be/resources/js/Data/Features/OperationalManagement.tsx`
- `webapp/wash_wallet_be/resources/js/Data/Features/HrPayroll.tsx`
- `webapp/wash_wallet_be/resources/js/Data/Features/Membership.tsx`
