# User Need: Improvement Dashboard Utama Owner sebagai Control Center Bisnis Laundry

Tanggal: 2026-06-22

## 1. Latar Belakang

Dashboard utama owner di `/dashboard` saat ini sudah memberi ringkasan dasar bisnis WashWallet, tetapi belum cukup membantu owner laundry mengambil keputusan harian. Owner laundry tidak hanya butuh melihat total historis, tetapi juga butuh tahu:

1. Uang yang masuk hari ini.
2. Order yang sedang berjalan dan tersendat.
3. Outlet mana yang butuh perhatian.
4. Saldo pendapatan yang bisa ditarik.
5. Pembayaran yang belum lunas.
6. Approval yang menunggu tindakan.
7. Kesiapan operasional outlet.
8. Pelanggan atau paket membership yang perlu ditindaklanjuti.
9. Beban payroll dan pengeluaran periode berjalan.

Dashboard utama harus berubah dari halaman ringkasan statis menjadi control center lintas outlet. Owner seharusnya bisa membuka dashboard dan dalam beberapa detik memahami kondisi bisnis dari atas ke bawah: kesehatan uang, operasional hari ini, masalah yang perlu diprioritaskan, performa outlet, pelanggan, dan pekerjaan administratif yang tertunda.

Dokumen ini disusun sebagai acuan kebutuhan sebelum dibuat implementation plan oleh AI model lain. Tugas dokumen ini adalah mendefinisikan user need dan rekomendasi informasi, bukan menentukan implementasi teknis final.

## 2. Riset Singkat dan Prinsip Dashboard Owner Laundry

Riset ringkas yang relevan:

1. Operational dashboard sebaiknya menonjolkan informasi yang berubah cepat dan perlu respons segera. Referensi umum: https://en.wikipedia.org/wiki/Dashboard_%28computing%29
2. Cash flow adalah indikator penting kesehatan finansial bisnis karena menunjukkan kas masuk dan kas keluar. Referensi umum: https://en.wikipedia.org/wiki/Cash_flow
3. Gross margin dan profit margin membantu owner membaca efisiensi bisnis, bukan hanya omzet. Referensi umum: https://en.wikipedia.org/wiki/Gross_margin dan https://en.wikipedia.org/wiki/Profit_margin
4. Customer retention berdampak langsung pada profitabilitas dan relevan untuk bisnis laundry yang bergantung pada repeat order. Referensi umum: https://en.wikipedia.org/wiki/Customer_retention
5. Delivery/fulfillment performance relevan untuk laundry dengan pickup/delivery karena owner perlu tahu apakah order terpenuhi tepat waktu. Referensi umum: https://en.wikipedia.org/wiki/Delivery_Performance

Kesimpulan untuk konteks owner laundry:

1. Informasi paling atas harus menjawab "hari ini bisnis saya sehat atau bermasalah?"
2. Dashboard tidak cukup hanya menampilkan total historis.
3. Dashboard perlu memisahkan uang yang sudah diterima, piutang/outstanding, COD, saldo pendapatan withdrawable, saldo aset, dan coin.
4. Dashboard perlu memprioritaskan tindakan, bukan hanya grafik.
5. Dashboard perlu menghubungkan operasional, keuangan, outlet, pelanggan, membership, dan payroll dalam satu pandangan.

## 3. Ringkasan Kondisi Codebase Saat Ini

### Sudah Ada

1. Route dashboard utama ada di `routes/web.php` dengan nama route `dashboard`.
2. `App\Http\Controllers\Web\DashboardController@index` mengirim prop Inertia:
   - `user`,
   - `quickMetrics`,
   - `revenueOvertime`,
   - `assetSummary`,
   - `recentCoinTransactions`,
   - `recentOrders`.
3. `resources/js/Pages/Dashboard/Index.tsx` merender:
   - `Welcome`,
   - `QuickMetrics`,
   - `RevenueOvertime`,
   - `AssetSummary`,
   - `RecentCoinTransactions`,
   - `LastOrder`.
4. `Welcome` menampilkan sapaan dan `Saldo Koin` dari `user.coinBalance`.
5. `QuickMetrics` menampilkan 4 KPI:
   - Total Pendapatan,
   - Total Pesanan,
   - Total Pelanggan,
   - Outlet Aktif.
6. `QuickMetrics` sudah punya konsep trend icon, tetapi change masih selalu `0` sehingga trend tidak tampil.
7. `RevenueOvertime` memakai `recharts` untuk grafik pendapatan dari waktu ke waktu.
8. `AssetSummary` menampilkan ringkasan akun aset level 2, misalnya bank, ewallet, cash, dan other assets jika ada dari chart of accounts.
9. `RecentCoinTransactions` menampilkan transaksi coin terbaru.
10. `LastOrder` menampilkan 5 order terbaru dengan customer, employee, status, total, dan link detail.
11. `DashboardService::quickMetrics()` memakai cache 60 detik dan mengambil data dari static method model `User`.
12. `DashboardService::assetSummary()` memakai cache 180 detik dan menghitung saldo aset dari `Account` dan `JournalDetail`.
13. `DashboardService::recentCoinTransactions()` memakai cache 60 detik dan membaca transaksi coin dari journal detail akun `coin_asset`.
14. `User::totalRevenue()` menghitung total pendapatan dari order completed/delivered milik owner.
15. `User::totalOrders()` menghitung total order owner.
16. `User::totalCustomers()` menghitung customer aktif owner.
17. `User::totalOutlets()` menghitung outlet owner.
18. `User::recentOrders()` mengambil 5 order terbaru owner.
19. `User::revenueOvertime()` mengambil pendapatan completed/delivered berdasarkan `order_date` dan interval default harian 30 hari.
20. Modul detail outlet sudah memiliki improvement overview yang lebih maju melalui `OutletOverviewService`, termasuk KPI, chart, recent orders, dan checklist operasional. Karena itu dokumen ini fokus pada dashboard utama owner lintas outlet, bukan tab `Overview` detail outlet.
21. Sidebar owner menunjukkan domain fitur yang relevan untuk dashboard utama:
   - Keuangan Owner,
   - Operasional,
   - Keuangan Karyawan,
   - Akuntansi & Laporan,
   - Pengaturan Data.
22. Modul wallet owner sudah ada:
   - `wallet_balance` pada owner,
   - `WalletTransaction`,
   - `WalletWithdrawal`,
   - bank account owner,
   - withdrawal flow owner/admin.
23. Modul order sudah memiliki status lengkap dan payment status:
   - order status seperti `requested`, `accepted`, `received`, `in_progress`, `ready`, `delivering`, `completed`, `cancelled`, `rejected`, dan lainnya,
   - payment status seperti `not_yet_priced`, `unpaid`, `partial`, `paid`, `refunded`, `paid_by_package`, `cod`.
24. Modul approval operasional tersedia untuk:
   - expense,
   - deposit,
   - petty cash,
   - wallet withdrawal.
25. Modul accounting sudah memiliki:
   - chart of accounts,
   - journal entries,
   - general ledger,
   - profit loss,
   - balance sheet,
   - accounting period.
26. Modul HR/payroll sudah memiliki:
   - employee,
   - position/permission,
   - salary component,
   - work log commission,
   - loan,
   - fine,
   - payroll preview/store.
27. Modul membership/loyalty sudah memiliki:
   - customer,
   - customer account/deposit balance,
   - service package,
   - customer subscription/quota,
   - membership plan,
   - membership contract.

### Gap yang Relevan

1. Dashboard utama masih lebih mirip summary total, belum menjadi control center harian.
2. KPI paling atas belum menampilkan konteks hari ini dan periode berjalan.
3. Belum ada filter periode dan filter outlet di dashboard utama.
4. Belum ada action center untuk pekerjaan yang perlu ditangani owner.
5. Belum ada ringkasan order aktif berdasarkan tahap operasional.
6. Belum ada deteksi bottleneck order lintas outlet.
7. Belum ada ringkasan kesehatan pembayaran seperti unpaid, partial, COD, paid by package, dan outstanding amount.
8. Belum ada ringkasan saldo pendapatan withdrawable pada dashboard utama.
9. Saldo coin tampil cukup dominan, tetapi saldo pendapatan owner belum menjadi fokus.
10. Belum ada ringkasan pending withdrawal.
11. Belum ada ringkasan pending approval expense/deposit/petty cash.
12. Belum ada ringkasan laba rugi periode pada dashboard utama.
13. Belum ada perbandingan revenue vs expense.
14. Belum ada ranking performa outlet lintas outlet.
15. Belum ada ringkasan outlet readiness atau fitur expired di dashboard utama.
16. Belum ada indikator customer retention, customer baru, repeat customer, membership/package aktif, atau subscription hampir expired.
17. Belum ada ringkasan payroll, komisi unpaid, loan, dan fine yang berdampak ke kas owner.
18. Belum ada activity feed lintas domain.
19. Sebagian agregasi sudah tersedia di halaman lain, tetapi belum dikonsolidasikan untuk owner dashboard.
20. Jika dashboard mengambil banyak collection mentah dan menghitung di frontend, akan muncul risiko payload besar dan business logic tidak konsisten.

## 4. Tujuan Improvement

Tujuan utama improvement dashboard owner adalah:

1. Menjadikan `/dashboard` sebagai layar pertama untuk memahami kesehatan bisnis laundry lintas outlet.
2. Mengubah dashboard dari ringkasan total historis menjadi control center yang actionable.
3. Membantu owner menjawab pertanyaan harian:
   - Berapa uang masuk hari ini?
   - Berapa order aktif?
   - Ada order yang terlambat atau tersendat?
   - Ada pembayaran belum lunas?
   - Berapa saldo pendapatan yang bisa ditarik?
   - Ada approval yang menunggu?
   - Outlet mana paling bermasalah?
   - Layanan atau paket mana yang performanya baik?
4. Menampilkan prioritas tindakan owner berdasarkan severity dan dampak nominal.
5. Mengurangi kebutuhan owner membuka banyak menu hanya untuk mengecek kondisi umum.
6. Menjaga dashboard tetap cepat dengan payload agregasi backend.
7. Menyediakan navigasi langsung ke halaman detail untuk tindakan lanjutan.

## 5. Aktor

1. `owner`
   Aktor utama yang melihat performa bisnis, mengambil keputusan operasional/keuangan, dan menindaklanjuti masalah.
2. `super_admin`
   Aktor pendukung untuk monitoring withdrawal atau data sistem jika role ini membuka dashboard yang sama atau variasinya.
3. `operator/supervisor`
   Aktor pendukung jika nanti diberi akses terbatas ke dashboard outlet atau dashboard operasional.
4. `system`
   Menghitung agregasi lintas domain, menjaga scoping owner/outlet, dan menyusun action center.

## 6. Scope Kebutuhan

Scope utama:

1. Improvement dashboard utama owner web di `/dashboard`.
2. Payload backend agregasi khusus dashboard owner.
3. Filter periode dan outlet.
4. KPI harian dan periode berjalan.
5. Action center lintas domain.
6. Ringkasan operasional order.
7. Ringkasan kesehatan pembayaran.
8. Ringkasan saldo pendapatan dan withdrawal.
9. Ringkasan revenue, expense, dan profit.
10. Ranking performa outlet.
11. Ringkasan customer, package, dan membership.
12. Ringkasan HR/payroll.
13. Activity feed lintas domain.
14. Empty state dan setup checklist untuk owner baru.

Di luar scope tahap pertama:

1. Mengubah lifecycle order.
2. Membuat real-time websocket dashboard.
3. Membuat forecasting pendapatan.
4. Membuat AI recommendation otomatis.
5. Membuat bank reconciliation otomatis.
6. Membuat transfer withdrawal otomatis.
7. Membuat attendance/shift dashboard jika attendance flow belum aktif.
8. Membuat inventory/bahan baku.
9. Mengubah laporan accounting yang sudah ada.
10. Mengganti overview detail outlet yang sudah punya improvement sendiri.

## 7. Prinsip Dasar Kebutuhan

1. Dashboard utama harus menjawab kondisi bisnis sekarang, bukan hanya total sepanjang waktu.
2. Informasi paling atas harus berisi data paling penting dan paling sering diputuskan owner.
3. Dashboard harus actionable: setiap masalah penting punya link ke halaman yang bisa menyelesaikan masalah.
4. Dashboard harus membedakan domain uang:
   - revenue/order gross,
   - paid amount/cash-in,
   - outstanding/piutang,
   - COD/cash offline,
   - wallet balance withdrawable,
   - asset balance,
   - coin balance.
5. Semua query wajib scoped ke owner login dan outlet miliknya.
6. Semua agregasi berat wajib dihitung backend.
7. Frontend tidak boleh menghitung chart dari seluruh collection order/expense/customer.
8. Default periode operasional adalah hari ini.
9. Default periode trend bisnis adalah 30 hari.
10. Filter periode yang disarankan:
    - `today`,
    - `7d`,
    - `30d`,
    - `90d`.
11. Filter outlet yang disarankan:
    - semua outlet,
    - satu outlet tertentu.
12. Empty state harus membantu owner baru menyelesaikan setup dasar.
13. Dashboard utama tidak menggantikan halaman detail, tabel, report, atau CRUD yang sudah ada.

## 8. Rekomendasi Layout dari Atas ke Bawah

### Area 1 - Header dan Filter Konteks

Di bagian paling atas, owner perlu melihat:

1. Sapaan ringkas dan nama bisnis/owner.
2. Periode aktif, misalnya `Hari ini`, `7 hari`, `30 hari`, atau `90 hari`.
3. Filter outlet:
   - `Semua Outlet`,
   - daftar outlet milik owner.
4. Timestamp data terakhir diperbarui.
5. Quick action primer:
   - `Buat Order`,
   - `Tarik Saldo`,
   - `Catat Pengeluaran`,
   - `Lihat Laba Rugi`.

Alasan:

1. Owner perlu tahu konteks angka yang sedang dilihat.
2. Multi-outlet owner perlu bisa membedakan total bisnis dan outlet tertentu.
3. Quick action mempercepat tindakan rutin.

### Area 2 - Saldo dan Uang yang Bisa Diputuskan

Area kanan atas atau top strip sebaiknya menampilkan:

1. `Saldo Pendapatan Tersedia`
2. `Saldo Pending Withdrawal`
3. `Saldo Coin`
4. Link ke `Dompet Pendapatan`, `Tarik Saldo`, dan `Topup Koin`

Prioritas visual:

1. Saldo pendapatan/wallet harus lebih dominan daripada saldo coin.
2. Saldo coin tetap tampil karena dibutuhkan untuk fitur, tetapi bukan indikator utama pendapatan owner.
3. Jika ada pending withdrawal, tampilkan status dan nominal tertahan.

### Area 3 - KPI Utama Hari Ini dan Periode

KPI paling atas yang disarankan:

1. `Pendapatan Hari Ini`
   - gunakan paid amount/cash-in jika memungkinkan.
2. `Order Hari Ini`
   - total order dibuat hari ini.
3. `Order Aktif`
   - order yang belum terminal.
4. `Belum Dibayar`
   - count dan outstanding amount.
5. `Pendapatan Periode`
   - sesuai filter periode.
6. `Laba Bersih Periode`
   - dari profit/loss jika outlet dan periode tersedia.

KPI tambahan yang bisa muncul di baris kedua atau compact chips:

1. `Expense Periode`
2. `Customer Baru`
3. `Repeat Customer`
4. `Outlet Bermasalah`
5. `Approval Pending`
6. `Payroll Bulan Ini`

### Area 4 - Action Center / Prioritas Tindakan

Action center adalah bagian paling penting setelah KPI. Isinya daftar masalah prioritas yang perlu owner tindak lanjuti.

Contoh item:

1. Order baru menunggu diterima.
2. Order aktif melewati estimasi selesai.
3. Order unpaid/partial dengan outstanding besar.
4. Expense pending approval.
5. Deposit pending approval.
6. Petty cash pending approval.
7. Withdrawal pending/processing.
8. Outlet belum punya jam kerja.
9. Outlet tidak punya layanan aktif.
10. Courier aktif tetapi setting atau schedule belum lengkap.
11. Fitur outlet expired.
12. Membership/package customer hampir expired jika relevan.
13. Payroll bulan berjalan belum diproses.
14. Komisi produksi unpaid.
15. Loan repayment payroll yang akan jatuh tempo.

Setiap item minimal punya:

1. severity: `critical`, `warning`, `info`.
2. title.
3. count.
4. nominal jika ada.
5. pesan singkat.
6. action label.
7. action target route.

### Area 5 - Ringkasan Operasional Order

Section ini menjawab "di mana order saya sedang berada?"

Konten yang disarankan:

1. Funnel status order lintas outlet:
   - order masuk/menunggu,
   - pickup/dropoff,
   - diterima/ditimbang,
   - proses,
   - siap,
   - delivery,
   - selesai,
   - batal/ditolak.
2. Recent active orders, bukan hanya recent orders historis.
3. Delayed/stale orders:
   - order yang tidak berubah status terlalu lama,
   - order melewati estimated completion.
4. Bottleneck per outlet:
   - outlet dengan order aktif terbanyak,
   - outlet dengan unpaid terbesar,
   - outlet dengan delayed orders terbanyak.

Catatan:

1. Mapping status teknis ke stage bisnis harus jelas.
2. Recent orders tetap berguna, tetapi dashboard owner perlu recent active/problematic orders.

### Area 6 - Ringkasan Keuangan dan Pembayaran

Section finansial perlu menjawab "uang saya di mana?"

Konten yang disarankan:

1. Grafik revenue vs expense periode.
2. Ringkasan laba/rugi periode:
   - total revenue,
   - total expense,
   - net profit,
   - net margin jika tersedia.
3. Payment health:
   - paid,
   - unpaid,
   - partial,
   - COD,
   - paid by package,
   - refunded,
   - not yet priced.
4. Outstanding amount.
5. Wallet income dan withdrawal:
   - wallet balance,
   - available balance,
   - pending withdrawal,
   - withdrawal paid periode.
6. Asset summary:
   - cash,
   - bank,
   - ewallet,
   - other assets.

Catatan:

1. COD harus dibedakan karena uang diterima offline.
2. Paid by package harus dibedakan agar owner tidak salah membaca sebagai unpaid.
3. Wallet balance tidak sama dengan revenue total.

### Area 7 - Performa Outlet

Untuk owner multi-outlet, dashboard perlu menampilkan outlet mana yang sehat dan mana yang perlu dicek.

Konten yang disarankan:

1. Ranking outlet berdasarkan pendapatan periode.
2. Ranking outlet berdasarkan jumlah order.
3. Outlet dengan outstanding terbesar.
4. Outlet dengan active/delayed orders terbanyak.
5. Outlet dengan rating/review rendah jika data cukup.
6. Outlet readiness:
   - jam kerja ada,
   - layanan aktif ada,
   - karyawan aktif ada,
   - fitur aktivasi aktif,
   - courier setting lengkap jika courier aktif.
7. Feature status summary:
   - active,
   - trial,
   - expired,
   - inactive.

### Area 8 - Pelanggan, Package, dan Membership

Section ini menjawab "apakah pelanggan saya kembali?"

Konten yang disarankan:

1. Customer baru periode.
2. Repeat customers periode.
3. Active customers.
4. Customer tanpa order dalam periode tertentu.
5. Active customer subscriptions/package.
6. Package hampir expired.
7. Membership contract aktif.
8. Membership contract expired/hampir expired.
9. Top customers berdasarkan spending/order count.
10. Top service package atau membership plan.

Catatan:

1. Jangan klaim loyalty points karena codebase tidak punya points reward engine.
2. Gunakan istilah `retention`, `repeat customer`, `package`, dan `membership benefit`.

### Area 9 - HR dan Payroll

Section ini menjawab "berapa beban karyawan saya dan apa yang belum diproses?"

Konten yang disarankan:

1. Jumlah employee aktif.
2. Payroll bulan berjalan:
   - total payroll paid,
   - total net salary,
   - payroll count.
3. Estimasi payroll jika preview tersedia.
4. Unpaid work log commission.
5. Active employee loans/kasbon.
6. Fine logs unpaid/pending payroll.
7. Employee tanpa posisi atau permission penting jika bisa dihitung.

Catatan:

1. Jangan menjadikan attendance sebagai metrik utama jika flow attendance belum aktif end-to-end.
2. Fokus pada payroll, komisi, loan, fine, dan employee readiness.

### Area 10 - Activity Feed Lintas Domain

Bagian bawah dashboard dapat menampilkan aktivitas terbaru lintas domain:

1. Order baru.
2. Pembayaran order.
3. Wallet transaction.
4. Coin transaction.
5. Expense/deposit/petty cash approval.
6. Withdrawal status change.
7. Payroll paid.
8. Journal entry/report activity jika relevan.
9. Notification terbaru.

Activity feed harus ringkas dan dapat diklik.

## 9. User Need Fungsional

### FR-01 Dashboard Memiliki Filter Periode dan Outlet

1. Owner dapat memilih periode dashboard.
2. Periode minimal:
   - `today`,
   - `7d`,
   - `30d`,
   - `90d`.
3. Owner dapat memilih semua outlet atau satu outlet.
4. Filter periode mempengaruhi KPI, chart, action center tertentu, order trend, finance trend, outlet ranking, customer, membership, dan payroll summary.
5. Filter outlet membatasi semua data ke outlet yang dipilih.
6. Filter harus dikirim ke backend agar scoping dan agregasi dilakukan server-side.

### FR-02 Dashboard Menampilkan KPI Hari Ini

1. Owner dapat melihat order hari ini.
2. Owner dapat melihat pendapatan hari ini.
3. Owner dapat melihat order aktif.
4. Owner dapat melihat pembayaran belum lunas.
5. Owner dapat melihat outstanding amount.
6. KPI hari ini harus berada di area paling atas.
7. KPI harus memakai label bisnis yang jelas.

### FR-03 Dashboard Menampilkan KPI Periode

1. Owner dapat melihat pendapatan periode.
2. Owner dapat melihat total order periode.
3. Owner dapat melihat expense periode.
4. Owner dapat melihat net profit periode jika data accounting tersedia.
5. Owner dapat melihat margin periode jika data cukup.
6. Jika profit/loss membutuhkan outlet tertentu, UI harus menjelaskan ketika data belum tersedia untuk `Semua Outlet`.

### FR-04 Dashboard Membedakan Saldo Pendapatan, Aset, dan Coin

1. Owner dapat melihat wallet balance atau saldo pendapatan.
2. Owner dapat melihat available balance untuk withdrawal.
3. Owner dapat melihat pending withdrawal amount.
4. Owner tetap dapat melihat coin balance.
5. Owner dapat melihat asset summary.
6. Label UI harus tidak membingungkan:
   - `Saldo Pendapatan`,
   - `Saldo Tersedia`,
   - `Saldo Tertahan Withdrawal`,
   - `Saldo Coin`,
   - `Aset Kas/Bank`.

### FR-05 Dashboard Menampilkan Action Center

1. Owner dapat melihat daftar masalah prioritas.
2. Masalah harus diurutkan berdasarkan severity dan dampak bisnis.
3. Setiap action item minimal punya:
   - key,
   - title,
   - severity,
   - count,
   - amount opsional,
   - message,
   - action label,
   - action target.
4. Action item harus mengarah ke halaman yang bisa menyelesaikan masalah.
5. Action center harus tetap memiliki empty state jika tidak ada masalah.

### FR-06 Dashboard Menampilkan Funnel Status Order

1. Owner dapat melihat jumlah order di setiap tahap operasional.
2. Status teknis order boleh dikelompokkan menjadi stage bisnis:
   - `Menunggu`,
   - `Pickup/Dropoff`,
   - `Diterima`,
   - `Ditimbang`,
   - `Proses`,
   - `Siap`,
   - `Delivery`,
   - `Selesai`,
   - `Batal/Ditolak`.
3. Mapping status harus konsisten dan terdokumentasi di plan.
4. Funnel harus scoped ke periode dan outlet filter.
5. Owner dapat klik stage untuk menuju daftar order terfilter jika memungkinkan.

### FR-07 Dashboard Menampilkan Order Bermasalah

1. Owner dapat melihat order yang butuh perhatian.
2. Order bermasalah minimal:
   - order baru menunggu diterima,
   - order aktif melewati estimated completion,
   - order tidak berubah status terlalu lama,
   - order unpaid/partial,
   - order not yet priced,
   - order ready tetapi belum delivered/picked up jika relevan.
3. Setiap order menampilkan:
   - nomor order,
   - outlet,
   - customer,
   - status,
   - payment status,
   - amount/outstanding,
   - waktu dibuat atau order date,
   - link detail.

### FR-08 Dashboard Menampilkan Kesehatan Pembayaran

1. Owner dapat melihat payment status distribution.
2. Payment status minimal:
   - `not_yet_priced`,
   - `unpaid`,
   - `partial`,
   - `paid`,
   - `refunded`,
   - `paid_by_package`,
   - `cod`.
3. Dashboard harus menampilkan count dan amount per status.
4. Outstanding amount harus berasal dari `remaining_amount`.
5. COD harus dipisah dari wallet/cash-in platform.
6. Paid by package harus dipisah dari unpaid.

### FR-09 Dashboard Menampilkan Revenue vs Expense Trend

1. Owner dapat melihat tren pendapatan dan pengeluaran dalam periode terpilih.
2. Data chart minimal:
   - date,
   - revenue,
   - expense,
   - net.
3. Jika tidak ada transaksi pada tanggal tertentu, backend sebaiknya mengirim nilai 0.
4. Chart boleh menggunakan `recharts` karena dependency sudah tersedia.
5. Owner dapat melihat apakah revenue naik tetapi expense juga naik.

### FR-10 Dashboard Menampilkan Ringkasan Laba Rugi

1. Owner dapat melihat total revenue periode.
2. Owner dapat melihat total expense periode.
3. Owner dapat melihat net profit periode.
4. Owner dapat melihat margin jika tersedia.
5. Data sebaiknya konsisten dengan `ProfitLossService`.
6. Jika accounting data belum lengkap, dashboard harus menampilkan state yang jelas, bukan angka menyesatkan.

### FR-11 Dashboard Menampilkan Performa Outlet

1. Owner dapat melihat daftar outlet dengan performa terbaik dan outlet yang berisiko.
2. Metrik outlet minimal:
   - revenue periode,
   - order periode,
   - active orders,
   - outstanding amount,
   - delayed orders,
   - readiness status.
3. Outlet risk minimal:
   - fitur expired,
   - tidak ada layanan aktif,
   - tidak ada jam kerja,
   - tidak ada karyawan aktif,
   - courier aktif tetapi setting/schedule tidak lengkap.
4. Owner dapat klik outlet untuk membuka detail outlet.

### FR-12 Dashboard Menampilkan Layanan dan Kategori Terlaris

1. Owner dapat melihat layanan paling sering dipakai.
2. Owner dapat melihat kategori paling sering dipakai.
3. Data dihitung dari `order_items`.
4. Metrik minimal:
   - items count,
   - quantity,
   - revenue.
5. Chart atau list harus dibatasi, misalnya top 5 atau top 10.
6. Data harus scoped ke owner/outlet/periode.

### FR-13 Dashboard Menampilkan Customer dan Retention Summary

1. Owner dapat melihat customer baru periode.
2. Owner dapat melihat repeat customer periode.
3. Owner dapat melihat customer aktif.
4. Owner dapat melihat customer tidak aktif jika definisi tersedia.
5. Owner dapat melihat top customers berdasarkan spending atau order count.
6. Data retention harus berbasis perilaku order, bukan niat atau asumsi.

### FR-14 Dashboard Menampilkan Package dan Membership Summary

1. Owner dapat melihat customer subscription aktif.
2. Owner dapat melihat package hampir expired atau quota hampir habis jika data tersedia.
3. Owner dapat melihat membership contract aktif.
4. Owner dapat melihat membership contract expired/hampir expired.
5. Owner dapat melihat package atau membership plan paling populer.
6. Dashboard tidak boleh mengklaim loyalty points atau voucher reward jika tidak ada flow aktif.

### FR-15 Dashboard Menampilkan HR dan Payroll Summary

1. Owner dapat melihat employee aktif.
2. Owner dapat melihat payroll bulan berjalan.
3. Owner dapat melihat total net salary paid periode.
4. Owner dapat melihat unpaid commission dari work logs.
5. Owner dapat melihat active loans/kasbon.
6. Owner dapat melihat fine logs yang menjadi potongan payroll.
7. Dashboard tidak boleh menonjolkan attendance sebagai fitur aktif jika flow belum lengkap.

### FR-16 Dashboard Menampilkan Pending Approval

1. Owner dapat melihat pending expense.
2. Owner dapat melihat pending deposit.
3. Owner dapat melihat pending petty cash.
4. Owner dapat melihat pending/processing withdrawal.
5. Setiap approval summary menampilkan count dan amount.
6. Owner dapat klik menuju halaman daftar terfilter.

### FR-17 Dashboard Menampilkan Activity Feed

1. Owner dapat melihat aktivitas terbaru lintas domain.
2. Activity feed dapat mencakup:
   - order,
   - payment,
   - wallet transaction,
   - coin transaction,
   - withdrawal,
   - expense/deposit/petty cash,
   - payroll,
   - notification.
3. Setiap activity minimal punya:
   - type,
   - title,
   - description,
   - timestamp,
   - route target jika ada.
4. Activity feed harus dibatasi agar payload ringan.

### FR-18 Dashboard Menyediakan Empty State untuk Owner Baru

1. Jika owner belum punya outlet aktif, dashboard menampilkan setup checklist.
2. Checklist owner baru minimal:
   - buat outlet,
   - atur jam kerja,
   - tambah layanan,
   - tambah karyawan,
   - tambah customer,
   - atur rekening bank,
   - topup coin jika perlu,
   - aktifkan fitur outlet.
3. Empty state harus memberi action jelas.
4. Empty state tidak boleh hanya menampilkan "belum ada data".

## 10. Data Contract yang Disarankan

Payload konseptual baru:

```ts
type OwnerDashboardPayload = {
    meta: OwnerDashboardMeta;
    filters: OwnerDashboardFilters;
    kpis: OwnerDashboardKpis;
    money: OwnerDashboardMoneySummary;
    actionCenter: OwnerDashboardActionItem[];
    operations: OwnerDashboardOperations;
    finance: OwnerDashboardFinance;
    outlets: OwnerDashboardOutletSummary;
    customers: OwnerDashboardCustomerSummary;
    membership: OwnerDashboardMembershipSummary;
    hrPayroll: OwnerDashboardHrPayrollSummary;
    activityFeed: OwnerDashboardActivityItem[];
    setupChecklist?: OwnerDashboardSetupItem[];
};
```

### Meta dan Filter

```ts
type OwnerDashboardMeta = {
    period: "today" | "7d" | "30d" | "90d";
    startDate: string;
    endDate: string;
    timezone: string;
    generatedAt: string;
};

type OwnerDashboardFilters = {
    outletId: number | null;
    outletLabel: string;
};
```

### KPI

```ts
type OwnerDashboardKpis = {
    todayRevenue: number;
    todayOrdersCount: number;
    activeOrdersCount: number;
    unpaidOrdersCount: number;
    outstandingAmount: number;
    periodRevenue: number;
    periodExpense: number;
    periodNetProfit: number | null;
    periodOrdersCount: number;
    newCustomersCount: number;
    pendingApprovalsCount: number;
};
```

### Money Summary

```ts
type OwnerDashboardMoneySummary = {
    walletBalance: number;
    availableWalletBalance: number;
    pendingWithdrawalAmount: number;
    coinBalance: number;
    assetSummary: Array<{
        slug: string;
        label: string;
        amount: number;
        formatted: string;
    }>;
};
```

### Action Center

```ts
type OwnerDashboardActionItem = {
    key: string;
    title: string;
    severity: "critical" | "warning" | "info";
    count?: number;
    amount?: number;
    message: string;
    actionLabel: string;
    actionHref: string;
};
```

### Operations

```ts
type OwnerDashboardOperations = {
    orderFunnel: Array<{
        stage: string;
        label: string;
        count: number;
        amount?: number;
    }>;
    recentActiveOrders: Array<{
        id: number;
        orderNumber: string;
        outletName: string;
        customerName: string | null;
        status: string;
        statusLabel: string;
        paymentStatus: string;
        paymentStatusLabel: string;
        totalAmount: number;
        remainingAmount: number;
        orderDate: string | null;
        estimatedCompletion: string | null;
        createdAt: string;
    }>;
    delayedOrders: Array<{
        id: number;
        orderNumber: string;
        outletName: string;
        status: string;
        ageMinutes: number;
        estimatedCompletion: string | null;
    }>;
};
```

### Finance

```ts
type OwnerDashboardFinance = {
    revenueExpenseTrend: Array<{
        date: string;
        revenue: number;
        expense: number;
        net: number;
    }>;
    paymentHealth: Array<{
        paymentStatus: string;
        label: string;
        ordersCount: number;
        totalAmount: number;
        paidAmount: number;
        remainingAmount: number;
    }>;
    withdrawalSummary: {
        pendingCount: number;
        processingCount: number;
        paidCount: number;
        pendingAmount: number;
        paidAmount: number;
    };
};
```

### Outlet Summary

```ts
type OwnerDashboardOutletSummary = {
    totalOutlets: number;
    activeOutlets: number;
    riskyOutletsCount: number;
    topOutlets: Array<{
        id: number;
        name: string;
        revenue: number;
        ordersCount: number;
        activeOrdersCount: number;
        outstandingAmount: number;
        readinessStatus: "ok" | "warning" | "critical";
    }>;
    riskyOutlets: Array<{
        id: number;
        name: string;
        severity: "warning" | "critical";
        reasons: string[];
        actionHref: string;
    }>;
};
```

### Customer, Membership, HR

```ts
type OwnerDashboardCustomerSummary = {
    totalCustomers: number;
    newCustomersCount: number;
    repeatCustomersCount: number;
    inactiveCustomersCount?: number;
    topCustomers: Array<{
        id: number;
        name: string;
        ordersCount: number;
        totalSpent: number;
    }>;
};

type OwnerDashboardMembershipSummary = {
    activeSubscriptionsCount: number;
    expiringSubscriptionsCount: number;
    activeMembershipContractsCount: number;
    expiringMembershipContractsCount: number;
    topPackages: Array<{
        id: number;
        name: string;
        soldCount: number;
        revenue: number;
    }>;
};

type OwnerDashboardHrPayrollSummary = {
    activeEmployeesCount: number;
    payrollPaidAmount: number;
    payrollPaidCount: number;
    unpaidCommissionAmount: number;
    activeLoanAmount: number;
    fineDeductionAmount: number;
};
```

### Activity Feed dan Setup Checklist

```ts
type OwnerDashboardActivityItem = {
    id: string;
    type: "order" | "payment" | "wallet" | "coin" | "approval" | "withdrawal" | "payroll" | "notification";
    title: string;
    description: string;
    timestamp: string;
    href?: string;
};

type OwnerDashboardSetupItem = {
    key: string;
    label: string;
    status: "done" | "pending";
    actionLabel?: string;
    actionHref?: string;
};
```

Catatan:

1. Shape di atas adalah rekomendasi kebutuhan, bukan kontrak final.
2. Implementation plan boleh menyesuaikan naming agar konsisten dengan style resource existing.
3. Field uang sebaiknya dikirim sebagai number dan diformat frontend dengan helper existing.
4. Untuk order/activity/feed, gunakan resource ringkas agar payload tidak besar.

## 11. Aturan Bisnis

1. Semua data harus scoped ke owner login.
2. Jika filter outlet dipilih, semua data harus scoped ke outlet tersebut.
3. Owner tidak boleh melihat data outlet milik owner lain.
4. Revenue harus didefinisikan jelas pada implementation plan:
   - gross order total,
   - paid amount,
   - completed order revenue,
   - atau cash-in.
5. Rekomendasi awal:
   - KPI `Pendapatan Hari Ini` menggunakan `paid_amount` untuk membaca uang diterima.
   - KPI `Pendapatan Periode` dapat menggunakan completed/delivered revenue agar konsisten dengan dashboard existing, tetapi harus diberi label jelas.
6. COD tidak boleh otomatis dianggap saldo pendapatan withdrawable.
7. Paid by package harus dibedakan dari unpaid.
8. Outstanding amount harus berasal dari `remaining_amount`.
9. Active orders adalah order yang statusnya bukan terminal:
   - bukan `completed`,
   - bukan `delivered` jika dianggap terminal,
   - bukan `cancelled`,
   - bukan `rejected`.
10. Delayed order harus didefinisikan jelas:
    - melewati `estimated_completion`, atau
    - tidak ada perubahan status lebih dari ambang tertentu.
11. Action center tidak boleh menampilkan data tanpa action target jika action bisa diketahui.
12. Jika data accounting belum tersedia lengkap, laba/rugi harus nullable atau diberi empty state.
13. Dashboard tidak boleh menghitung data sensitif hanya di frontend.
14. Cache boleh dipakai, tetapi action center yang urgent sebaiknya tidak terlalu stale.
15. Query dashboard harus mempertimbangkan owner dengan banyak outlet dan order besar.

## 12. Alur Bisnis yang Diharapkan

### Owner Membuka Dashboard Pagi Hari

1. Owner membuka `/dashboard`.
2. Sistem menampilkan periode default `today` untuk KPI operasional dan trend default `30d`.
3. Owner melihat pendapatan hari ini, order hari ini, order aktif, unpaid, saldo pendapatan, dan pending approvals.
4. Owner membaca action center untuk mengetahui masalah paling penting.
5. Owner klik action, misalnya order menunggu diterima atau expense pending.

### Owner Memantau Multi-Outlet

1. Owner memilih `Semua Outlet`.
2. Dashboard menampilkan ranking outlet dan risky outlets.
3. Owner melihat outlet dengan delayed order atau outstanding besar.
4. Owner membuka detail outlet atau daftar order terfilter.

### Owner Mengecek Keuangan

1. Owner melihat revenue vs expense trend.
2. Owner melihat net profit periode jika data tersedia.
3. Owner melihat wallet balance dan pending withdrawal.
4. Owner masuk ke dompet pendapatan atau laba rugi jika perlu detail.

### Owner Mengecek Retensi Pelanggan

1. Owner melihat customer baru dan repeat customer.
2. Owner melihat package/membership yang aktif atau hampir expired.
3. Owner membuka customer atau membership list untuk follow up.

### Owner Mengecek Payroll

1. Owner melihat ringkasan employee aktif dan payroll bulan berjalan.
2. Owner melihat unpaid commission, loan, dan fine deduction.
3. Owner membuka payroll preview atau daftar loan/fine jika perlu.

## 13. Acceptance Criteria

1. Dokumen implementation plan berikutnya memiliki acuan bahwa dashboard utama owner harus menjadi control center lintas outlet.
2. Dashboard utama memiliki filter periode dan outlet.
3. Dashboard menampilkan KPI hari ini dan periode.
4. Dashboard membedakan saldo pendapatan, saldo coin, aset, COD, dan outstanding.
5. Dashboard menampilkan action center lintas domain.
6. Dashboard menampilkan funnel status order.
7. Dashboard menampilkan order bermasalah dan recent active orders.
8. Dashboard menampilkan payment health.
9. Dashboard menampilkan revenue vs expense trend.
10. Dashboard menampilkan ringkasan laba/rugi atau empty state accounting yang jelas.
11. Dashboard menampilkan performa outlet dan risky outlets.
12. Dashboard menampilkan top services/categories.
13. Dashboard menampilkan customer retention summary.
14. Dashboard menampilkan package dan membership summary.
15. Dashboard menampilkan HR/payroll summary.
16. Dashboard menampilkan pending approvals.
17. Dashboard menampilkan activity feed lintas domain.
18. Empty state owner baru membantu setup bisnis, bukan hanya "belum ada data".
19. Semua agregasi dihitung backend.
20. Semua data scoped ke owner dan outlet filter.
21. Dashboard tidak mengulang detail outlet overview, tetapi memberi ringkasan lintas outlet dan link ke detail.

## 14. Catatan untuk Implementation Plan

Hal yang perlu diputuskan pada plan:

1. Apakah membuat service baru seperti `OwnerDashboardService` atau memperluas `DashboardService`.
2. Apakah payload lama tetap dikirim untuk backward compatibility selama migrasi UI.
3. Definisi final revenue:
   - total amount completed,
   - paid amount,
   - atau kombinasi gross/cash-in.
4. Definisi final active order dan terminal statuses.
5. Definisi final delayed/stale order.
6. Mapping status order teknis ke stage funnel.
7. Sumber data expense untuk trend:
   - `expenses` approved,
   - journal expense accounts,
   - atau profit/loss service.
8. Apakah profit/loss summary mendukung semua outlet atau wajib outlet tertentu.
9. Cara menghitung repeat customer.
10. Cara menghitung inactive customer.
11. Cara menghitung package/membership expiring soon.
12. Cara menghitung unpaid commission dari work logs.
13. Cara menghitung loan/fine payroll risk.
14. Resource ringkas apa saja yang dibutuhkan untuk order/activity/feed.
15. Cache TTL per section:
   - KPI,
   - action center,
   - finance trend,
   - outlet ranking,
   - activity feed.
16. Index database yang mungkin dibutuhkan untuk query besar:
   - orders owner/outlet/date/status/payment_status,
   - order_items order_id,
   - expenses outlet/date/status,
   - deposits outlet/date/status,
   - petty_cashes outlet/date/status,
   - wallet_transactions user/date/type,
   - wallet_withdrawals user/status/date,
   - payrolls outlet/month/year/status,
   - customer_subscriptions status/expired_date,
   - membership_contracts status/expired_at.
17. Apakah dashboard perlu lazy-load section berat setelah initial render.
18. Apakah filter outlet/period menggunakan Inertia reload atau partial reload.

## 15. Pertanyaan Terbuka

1. Untuk owner, angka pendapatan utama sebaiknya `paid_amount`, `total_amount`, atau revenue completed?
2. Apakah COD dianggap pendapatan harian saat order ditandai paid COD atau hanya dicatat sebagai cash offline?
3. Apakah dashboard utama perlu mendukung super admin dengan data global, atau hanya owner?
4. Apakah dashboard perlu membandingkan periode ini vs periode sebelumnya sejak tahap pertama?
5. Berapa ambang order dianggap stale jika belum ada status update?
6. Apakah `delivered` dianggap terminal bersama `completed` atau masih perlu tindakan customer/owner?
7. Apakah profit/loss bisa ditampilkan untuk semua outlet gabungan atau hanya outlet tertentu?
8. Apakah action center perlu menyertakan notifikasi unread sebagai item prioritas?
9. Apakah owner membutuhkan export dari dashboard atau cukup link ke report?
10. Apakah chart payroll dan HR cukup ringkasan, atau perlu masuk tahap lanjut?

## 16. Rekomendasi Awal

Untuk tahap pertama, kebutuhan paling praktis:

1. Buat agregasi dashboard utama di backend service khusus, direkomendasikan `OwnerDashboardService`.
2. Pertahankan dashboard existing sampai payload baru siap, lalu migrasikan UI bertahap.
3. Tambahkan filter periode dan outlet.
4. Prioritaskan section berikut:
   - KPI hari ini/periode,
   - saldo pendapatan dan coin,
   - action center,
   - order funnel,
   - payment health,
   - revenue vs expense trend,
   - outlet performance,
   - pending approvals,
   - recent active/problem orders.
5. Jadikan customer/membership dan HR/payroll sebagai section tahap berikutnya jika payload tahap pertama terlalu besar.
6. Gunakan `recharts` untuk chart karena dependency sudah tersedia.
7. Gunakan resource ringkas untuk list order dan activity feed.
8. Jangan menghitung agregasi dari collection besar di frontend.
9. Semua action item harus punya link ke route existing.
10. Empty state owner baru harus menjadi setup checklist.

