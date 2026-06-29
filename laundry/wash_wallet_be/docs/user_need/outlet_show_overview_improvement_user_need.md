# User Need: Improvement Overview Detail Outlet sebagai Ringkasan Performa dan Kesiapan Operasional

Tanggal: 2026-06-16

## 1. Latar Belakang

Tab `Overview` pada halaman detail outlet saat ini belum cukup membantu owner/operator memahami kondisi outlet secara cepat. Halaman detail outlet sudah memiliki banyak tab dan data operasional, tetapi overview masih lebih terasa sebagai halaman informasi outlet dasar dan daftar pesanan terbaru yang belum benar-benar terisi dari backend.

Masalah yang ingin diatasi:

1. Owner/operator perlu melihat performa outlet tanpa membuka dashboard utama atau beberapa tab terpisah.
2. Owner/operator perlu mengetahui apakah outlet siap beroperasi hari ini, termasuk jam buka, layanan aktif, kurir, fitur, dan konfigurasi penting.
3. Data penting seperti order, pendapatan, status pembayaran, layanan terlaris, dan risiko konfigurasi belum diringkas di tab `Overview`.
4. Section `Pesanan Terbaru` sudah ada di UI, tetapi data `recentOrders` belum dikirim dari page show sehingga sering jatuh ke empty state.
5. Halaman detail outlet sudah punya banyak data pendukung, tetapi belum dirangkai menjadi ringkasan yang actionable.

Dokumen ini disusun sebagai acuan kebutuhan sebelum dibuat implementation plan.

## 2. Ringkasan Kondisi Codebase Saat Ini

### Sudah Ada

1. `OutletController::show` di web sudah memuat outlet beserta relasi:
   - `owner`,
   - `categories`,
   - `customers`,
   - `employees`,
   - `fines`,
   - `laundryServices`,
   - `laundryServices.unit`,
   - `laundryServices.category`,
   - `membershipPlans`,
   - `operationalDays.courierSchedules`,
   - `positions`,
   - `servicePackages`,
   - `courierSchedules`,
   - `outletFeatures`,
   - `outletFeatures.feature`,
   - `outletSettings.setting`,
   - `courierSetting`,
   - `courierSetting.pricingTiers`,
   - `courierSetting.pricingZones`.
2. `OutletController::show` hanya mengirim satu prop utama ke Inertia:
   - `outlet`.
3. `OutletResource` sudah mengekspos banyak informasi outlet, termasuk:
   - data identitas dan lokasi,
   - status aktivasi,
   - coin balance,
   - status jam operasional jika `operationalDays` dimuat,
   - average rating dan total reviews jika `orderReviews` dimuat,
   - collection relasi,
   - count relasi,
   - status aktivasi/exposure,
   - status courier dan free shipping.
4. `Dashboard/Outlets/Show.tsx` sudah memiliki tab:
   - `Overview`,
   - `Fitur & Aktivasi`,
   - `Jam Kerja`,
   - `Kurir`,
   - `Posisi`,
   - `Karyawan`,
   - `Pelanggan`,
   - `Kategori`,
   - `Layanan`,
   - `Denda`,
   - `Membership`,
   - `Paket Deposit`,
   - `Pengaturan`.
5. `Dashboard/Outlets/Show.tsx` memanggil `OutletOverview` hanya dengan prop:
   - `outlet={outlet}`.
6. `OutletOverview.tsx` saat ini menampilkan:
   - card `Informasi Outlet`,
   - section `Pesanan Terbaru`.
7. `OutletOverviewProps` sudah memiliki prop optional:
   - `recentOrders?: Order[]`,
   - `employees?: Employee[]`,
   - `isLoading?: boolean`.
8. `OutletOverview.tsx` sudah membaca `recentOrders`, tetapi prop tersebut tidak dikirim dari `Show.tsx`.
9. Model dan resource order sudah menyediakan field yang relevan untuk ringkasan:
   - `status`,
   - `paymentStatus`,
   - `paymentMethod`,
   - `totalAmount`,
   - `paidAmount`,
   - `remainingAmount`,
   - `orderDate`,
   - `createdAt`,
   - `outletId`,
   - relasi `orderItems`,
   - relasi `review`.
10. Model `OrderItem` sudah memiliki data yang realistis untuk performa layanan/kategori:
    - `category_name`,
    - `laundry_service_name`,
    - `quantity`,
    - `subtotal`,
    - `total_amount`,
    - `is_package_usage`,
    - `paid_amount`.
11. Model `Outlet` sudah memiliki relasi langsung `orders`, `orderReviews`, `operationalDays`, `courierSetting`, `courierSchedules`, `outletFeatures`, dan data konfigurasi outlet.
12. `recharts` sudah tersedia di `package.json` dan sudah dipakai pada dashboard utama, misalnya komponen grafik pendapatan.

### Gap yang Relevan

1. Tab `Overview` belum menjadi ringkasan performa dan kesiapan operasional outlet.
2. Backend belum mengirim payload khusus untuk overview seperti `overviewStats`, `overviewCharts`, `recentOrders`, dan `operationalChecklist`.
3. `OutletController::show` belum mengambil recent orders outlet, sehingga section `Pesanan Terbaru` belum dapat menampilkan data yang benar.
4. Statistik order, pendapatan, status order, status pembayaran, dan layanan terlaris belum dihitung khusus untuk outlet yang sedang dibuka.
5. Data chart belum tersedia di payload show outlet.
6. Kesiapan operasional outlet belum diringkas dalam bentuk checklist/actionable warning.
7. Banyak data tab lain sudah dimuat, tetapi overview belum memanfaatkannya untuk membantu owner/operator mengambil keputusan.
8. Jika semua data mentah dikirim ke frontend untuk dihitung, risiko payload besar dan inkonsistensi business logic akan meningkat.

## 3. Tujuan Improvement

Tujuan utama improvement ini adalah:

1. Menjadikan tab `Overview` sebagai ringkasan performa outlet yang mudah dipahami owner/operator.
2. Menampilkan kondisi operasional outlet secara cepat: buka/tutup hari ini, layanan aktif, kurir, fitur, dan konfigurasi penting.
3. Menyediakan indikator masalah atau risiko konfigurasi yang perlu ditindaklanjuti.
4. Menampilkan recent orders yang benar-benar berasal dari backend dan scoped ke outlet terkait.
5. Menggunakan grafik yang relevan untuk membaca tren pendapatan, order, status order, status pembayaran, dan performa layanan.
6. Mengurangi kebutuhan owner/operator berpindah tab hanya untuk mengecek kondisi penting outlet.
7. Menjaga frontend tetap ringan dengan mengirim agregasi dari backend, bukan seluruh collection besar untuk dihitung di browser.

## 4. Aktor

1. `owner`
   Melihat performa dan kesiapan outlet, mengevaluasi risiko konfigurasi, dan mengambil keputusan bisnis.
2. `operator`
   Melihat kondisi operasional outlet harian, status order aktif, pembayaran bermasalah, dan kesiapan layanan.
3. `employee/kasir`
   Menjadi aktor pendukung yang terbantu oleh ringkasan order aktif, belum dibayar, dan konfigurasi operasional.
4. `supervisor`
   Menjadi aktor pendukung yang dapat menggunakan overview untuk memantau bottleneck outlet.
5. `system`
   Menghitung agregasi, memvalidasi scope outlet/tenant, dan mengirim payload overview yang aman.

## 5. Scope Kebutuhan

Scope utama:

1. Perbaikan konten tab `Overview` pada halaman detail outlet.
2. Payload backend khusus untuk overview outlet.
3. KPI ringkas performa outlet.
4. Grafik pendapatan dan jumlah order per hari.
5. Grafik distribusi status order.
6. Grafik kesehatan pembayaran.
7. Grafik performa layanan/kategori terlaris.
8. Ringkasan kesiapan operasional outlet.
9. Checklist risiko konfigurasi.
10. Recent orders outlet yang benar-benar dikirim dari backend.
11. Default periode data 30 hari.

Di luar scope:

1. Mengubah seluruh tab detail outlet menjadi dashboard baru.
2. Mengganti dashboard utama aplikasi.
3. Membuat forecasting pendapatan.
4. Membuat capacity planning otomatis.
5. Membuat alert real-time berbasis websocket.
6. Mengubah lifecycle order atau status pembayaran.
7. Mengubah model pricing kurir, membership, deposit, atau fitur aktivasi.

## 6. Prinsip Dasar Kebutuhan

1. Overview harus bersifat ringkasan, bukan menggantikan tab detail.
2. Data yang tampil harus membantu owner/operator mengambil tindakan.
3. Semua agregasi performa harus dihitung di backend.
4. Frontend hanya menerima data siap tampil atau data chart yang sudah diperkecil.
5. Semua query wajib scoped ke outlet yang dibuka dan user yang berhak.
6. Periode default adalah 30 hari.
7. Implementation plan boleh menambahkan filter periode seperti `7 hari`, `30 hari`, dan `90 hari`.
8. Empty state harus menjelaskan kondisi dan mengarahkan tindakan jika relevan.
9. Grafik harus menggunakan data yang realistis dari model saat ini atau jelas dinyatakan membutuhkan agregasi backend baru.
10. Overview tidak boleh menampilkan data outlet lain.

## 7. User Need Fungsional

### FR-01 Overview Menampilkan KPI Ringkas Performa Outlet

1. Owner/operator dapat melihat KPI utama dalam satu area ringkas.
2. KPI minimal yang disarankan:
   - total order hari ini,
   - total order dalam periode terpilih,
   - pendapatan dalam periode terpilih,
   - order aktif,
   - order belum dibayar,
   - total pelanggan,
   - layanan aktif,
   - karyawan aktif,
   - average rating,
   - status coin/fitur penting.
3. KPI harus memakai label bisnis yang mudah dipahami.
4. KPI harus memiliki empty/zero state yang wajar jika outlet belum beroperasi.
5. Nilai KPI harus berasal dari backend, bukan dihitung dari collection besar di frontend.

### FR-02 Overview Menampilkan Tren Pendapatan dan Order Harian

1. Owner/operator dapat melihat grafik pendapatan per hari untuk default 30 hari terakhir.
2. Owner/operator dapat melihat jumlah order per hari pada periode yang sama.
3. Grafik boleh berupa kombinasi line/bar selama mudah dibaca.
4. Data chart minimal berisi:
   - `date`,
   - `revenue`,
   - `ordersCount`.
5. Jika tidak ada order pada tanggal tertentu, backend sebaiknya mengirim nilai `0` agar grafik tidak putus.
6. Implementasi dapat memakai `recharts` karena dependency sudah tersedia dan sudah digunakan di dashboard utama.

### FR-03 Overview Menampilkan Distribusi Status Order

1. Owner/operator dapat melihat distribusi status order pada periode terpilih.
2. Tujuannya untuk membaca bottleneck operasional, misalnya banyak order masih `requested`, `accepted`, `in_progress`, atau `ready`.
3. Data chart harus scoped ke outlet dan periode.
4. Status yang ditampilkan harus mengikuti status order yang ada di model, misalnya:
   - `requested`,
   - `accepted`,
   - `picking_up`,
   - `picked_up`,
   - `received`,
   - `weighing`,
   - `ready_to_process`,
   - `in_progress`,
   - `ready`,
   - `delivering`,
   - `delivered`,
   - `completed`,
   - `cancelled`,
   - `rejected`,
   - `pending_dropoff`.
5. UI boleh mengelompokkan status menjadi status bisnis yang lebih sederhana jika mapping-nya jelas.

### FR-04 Overview Menampilkan Kesehatan Pembayaran

1. Owner/operator dapat melihat ringkasan status pembayaran order.
2. Status pembayaran yang perlu diperhitungkan:
   - `not_yet_priced`,
   - `unpaid`,
   - `partial`,
   - `paid`,
   - `refunded`,
   - `paid_by_package`,
   - `cod`.
3. Ringkasan pembayaran minimal menampilkan:
   - jumlah order per status pembayaran,
   - total amount per status pembayaran jika relevan,
   - outstanding amount dari `remaining_amount`,
   - total paid amount dari `paid_amount`.
4. UI harus memberi perhatian khusus pada order `unpaid`, `partial`, dan outstanding amount.
5. COD perlu dibedakan karena belum tentu menjadi piutang yang sama dengan transfer/unpaid.
6. Paid by package perlu dibedakan agar owner tidak salah membaca bahwa order tersebut tidak menghasilkan penggunaan paket/deposit.

### FR-05 Overview Menampilkan Performa Layanan dan Kategori Terlaris

1. Owner/operator dapat melihat layanan atau kategori yang paling banyak dipakai.
2. Data performa harus dihitung dari `order_items`.
3. Metrik yang disarankan:
   - jumlah order item,
   - total quantity,
   - total revenue,
   - average revenue per item jika relevan.
4. Grouping realistis dari model saat ini:
   - `laundry_service_name`,
   - `category_name`.
5. Chart atau tabel harus membatasi jumlah item, misalnya top 5 atau top 10.
6. Data harus dihitung di backend dengan join/scoping yang aman ke outlet.

### FR-06 Overview Menampilkan Kesiapan Operasional Outlet

1. Owner/operator dapat melihat ringkasan kesiapan operasional outlet hari ini.
2. Ringkasan minimal:
   - apakah outlet buka sekarang,
   - jam buka hari ini,
   - jumlah hari buka dalam seminggu,
   - jumlah layanan aktif,
   - apakah outlet mendukung kurir,
   - apakah courier setting sudah tersedia,
   - status fitur penting seperti aktivasi outlet, exposure, dan courier service,
   - status trial/active/expired fitur.
3. Data yang sudah ada di `OutletResource` seperti `operationalStatus`, `todayHours`, `weeklyHours`, `isCourierActive`, `isCourierEnabled`, `activationStatus`, dan `exposureStatus` dapat menjadi dasar.
4. Jika data belum cukup, backend dapat menambahkan payload `operationalSummary` atau memasukkannya ke `operationalChecklist`.

### FR-07 Overview Menampilkan Checklist Risiko Konfigurasi

1. Owner/operator dapat melihat daftar risiko setup yang perlu dibereskan.
2. Checklist minimal yang disarankan:
   - belum ada jam kerja,
   - belum ada layanan aktif,
   - belum ada karyawan aktif,
   - courier aktif tetapi courier setting belum lengkap,
   - courier enabled tetapi belum ada schedule kurir jika jadwal diperlukan,
   - fitur outlet expired,
   - fitur courier expired atau trial hampir habis,
   - auto accept order belum diatur jika fiturnya penting,
   - pengaturan WhatsApp/notifikasi penting belum lengkap jika tersedia di outlet settings,
   - koordinat outlet kosong,
   - alamat outlet belum lengkap.
3. Setiap checklist item harus memiliki severity:
   - `critical`,
   - `warning`,
   - `info`,
   - `ok`.
4. Setiap item yang bermasalah sebaiknya memiliki action target ke tab atau route terkait.
5. Checklist harus disusun oleh backend agar rule konfigurasi konsisten.

### FR-08 Overview Menampilkan Recent Orders dari Backend

1. Section `Pesanan Terbaru` harus menampilkan order terbaru outlet yang sedang dibuka.
2. Backend perlu mengirim prop `recentOrders`.
3. Data recent orders minimal:
   - id,
   - order number,
   - customer name atau customer identifier yang aman,
   - status order,
   - status pembayaran,
   - total amount,
   - remaining amount,
   - created/order date.
4. Jumlah recent orders cukup dibatasi, misalnya 5 atau 6 item.
5. Jika tidak ada order, empty state harus tetap tampil seperti sekarang.
6. Recent orders harus scoped ke outlet dan tenant/permission user.

### FR-09 Overview Mendukung Filter Periode Ringkas

1. Default periode overview adalah 30 hari.
2. Implementation plan boleh menambahkan filter periode:
   - `7 hari`,
   - `30 hari`,
   - `90 hari`.
3. Periode harus mempengaruhi KPI performa dan chart yang berbasis order.
4. Ringkasan konfigurasi operasional tidak harus ikut berubah oleh filter periode.
5. Backend harus memvalidasi periode agar tidak menerima range arbitrer yang terlalu berat.

### FR-10 Overview Menyediakan Navigasi ke Tab atau Halaman Terkait

1. Owner/operator dapat berpindah dari overview ke tab detail yang relevan.
2. Contoh action:
   - lihat semua order,
   - buka tab `Jam Kerja`,
   - buka tab `Kurir`,
   - buka tab `Layanan`,
   - buka tab `Karyawan`,
   - buka tab `Fitur & Aktivasi`,
   - buka tab `Pengaturan`.
3. Action dari checklist risiko harus mengarah ke tempat yang dapat menyelesaikan masalah.
4. Overview tetap menjadi ringkasan, bukan tempat mengedit semua konfigurasi.

## 8. Data Contract yang Disarankan

Payload baru yang disarankan pada `Dashboard/Outlets/Show`:

1. `outlet`
   Tetap berisi data outlet existing melalui `OutletResource`.
2. `overviewStats`
   Berisi KPI ringkas.
3. `overviewCharts`
   Berisi data chart yang sudah diagregasi.
4. `recentOrders`
   Berisi order terbaru outlet.
5. `operationalChecklist`
   Berisi ringkasan kesiapan dan risiko konfigurasi.
6. `overviewMeta`
   Opsional, untuk periode dan timestamp data.

Contoh shape konseptual:

```ts
type OutletOverviewStats = {
    period: {
        preset: "7d" | "30d" | "90d";
        startDate: string;
        endDate: string;
    };
    todayOrdersCount: number;
    periodOrdersCount: number;
    periodRevenue: number;
    activeOrdersCount: number;
    unpaidOrdersCount: number;
    outstandingAmount: number;
    customersCount: number;
    activeLaundryServicesCount: number;
    activeEmployeesCount: number;
    averageRating: number;
    totalReviews: number;
    coinBalance: number;
    featureStatusSummary: {
        active: number;
        trial: number;
        expired: number;
        inactive: number;
    };
};

type OutletOverviewCharts = {
    revenueAndOrdersByDay: Array<{
        date: string;
        revenue: number;
        ordersCount: number;
    }>;
    orderStatusDistribution: Array<{
        status: string;
        label: string;
        count: number;
    }>;
    paymentHealth: Array<{
        paymentStatus: string;
        label: string;
        ordersCount: number;
        totalAmount: number;
        paidAmount: number;
        remainingAmount: number;
    }>;
    topServices: Array<{
        name: string;
        categoryName: string | null;
        itemsCount: number;
        quantity: number;
        revenue: number;
    }>;
    topCategories: Array<{
        name: string;
        itemsCount: number;
        quantity: number;
        revenue: number;
    }>;
};

type OperationalChecklistItem = {
    key: string;
    label: string;
    status: "ok" | "info" | "warning" | "critical";
    message: string;
    actionLabel?: string;
    actionTarget?: string;
};
```

Catatan:

1. Shape di atas adalah rekomendasi kebutuhan, bukan kontrak final.
2. Implementation plan boleh menyesuaikan nama field agar konsisten dengan style resource existing.
3. Nilai numerik uang harus dikirim sebagai number dan diformat di frontend dengan helper existing.
4. Untuk `recentOrders`, sebaiknya gunakan `OrderResource` atau resource ringkas khusus agar payload tidak berlebihan.
5. Untuk chart layanan/kategori, backend perlu agregasi baru dari `order_items` yang terhubung ke `orders` outlet.

## 9. Aturan Bisnis

1. Semua data overview harus scoped ke outlet yang sedang dibuka.
2. Owner hanya boleh melihat overview outlet miliknya.
3. Operator/employee hanya boleh melihat overview outlet yang sesuai permission-nya.
4. Query tidak boleh mengandalkan filtering frontend untuk keamanan data.
5. Default periode performa adalah 30 hari terakhir berdasarkan timezone outlet atau fallback `Asia/Jakarta`.
6. Order yang dihitung sebagai pendapatan harus didefinisikan jelas di implementation plan, misalnya:
   - berdasarkan semua order pada periode,
   - hanya order non-cancelled,
   - atau hanya order yang sudah paid/completed.
7. Outstanding amount harus berasal dari `remaining_amount`.
8. Order aktif perlu didefinisikan sebagai status yang belum terminal, misalnya bukan `completed`, `cancelled`, dan `rejected`.
9. Recent orders harus dibatasi jumlahnya agar payload ringan.
10. Grafik layanan/kategori harus mengambil data dari order item, bukan dari master layanan saja.
11. Checklist risiko konfigurasi harus mempertimbangkan data yang sudah ada terlebih dahulu sebelum meminta field baru.
12. Jika ada data yang belum bisa dihitung dari model saat ini, plan harus menandainya sebagai kebutuhan agregasi/backend baru.
13. Overview tidak boleh memuat seluruh order, seluruh order item, atau seluruh histori pembayaran hanya untuk kebutuhan chart.

## 10. Alur Bisnis yang Diharapkan

### Owner Membuka Detail Outlet

1. Owner membuka halaman detail outlet.
2. Sistem memvalidasi akses owner terhadap outlet.
3. Sistem memuat outlet dan payload overview.
4. Tab `Overview` menampilkan KPI, chart, recent orders, dan checklist operasional.
5. Owner dapat langsung melihat apakah outlet performanya baik dan siap beroperasi.

### Operator Mengecek Kondisi Harian

1. Operator membuka detail outlet.
2. Operator melihat jam buka hari ini dan status operasional.
3. Operator melihat order aktif dan pembayaran bermasalah.
4. Operator membuka order atau tab terkait jika ada masalah.

### Owner Melihat Risiko Konfigurasi

1. Owner membuka tab `Overview`.
2. Checklist menampilkan risiko, misalnya belum ada layanan aktif atau courier setting belum lengkap.
3. Owner memilih action yang mengarah ke tab konfigurasi terkait.
4. Setelah konfigurasi diperbaiki, checklist berubah menjadi lebih sehat.

## 11. Acceptance Criteria

1. Dokumen implementation plan berikutnya memiliki acuan bahwa `Overview` harus menjadi ringkasan performa dan kesiapan operasional outlet.
2. `Overview` menampilkan KPI ringkas outlet.
3. `Overview` menampilkan grafik pendapatan dan order harian dengan default periode 30 hari.
4. `Overview` menampilkan distribusi status order.
5. `Overview` menampilkan ringkasan kesehatan pembayaran, termasuk paid, unpaid, partial, COD, paid by package, dan outstanding amount.
6. `Overview` menampilkan performa layanan/kategori berdasarkan order item.
7. `Overview` menampilkan ringkasan kesiapan operasional.
8. `Overview` menampilkan checklist risiko konfigurasi.
9. `recentOrders` dikirim dari backend dan ditampilkan di `OutletOverview`.
10. Semua agregasi dihitung di backend.
11. Semua query overview scoped ke outlet dan permission user.
12. Frontend tidak menghitung chart dari seluruh collection besar.
13. Empty state tetap tersedia untuk outlet baru yang belum memiliki order.
14. `recharts` dapat digunakan untuk chart karena sudah tersedia di dependency aplikasi.

## 12. Catatan untuk Implementation Plan

Hal yang perlu diputuskan pada plan:

1. Apakah agregasi overview dibuat langsung di `OutletController::show` atau lewat service baru seperti `OutletOverviewService`.
2. Apakah `recentOrders` memakai `OrderResource` penuh atau resource ringkas khusus.
3. Definisi final `periodRevenue`, terutama apakah menghitung semua order, order paid, atau order completed.
4. Definisi final `activeOrdersCount`.
5. Mapping status order teknis ke label chart yang lebih mudah dipahami.
6. Mapping status pembayaran ke kategori chart kesehatan pembayaran.
7. Cara menghitung layanan aktif dan karyawan aktif berdasarkan field status existing.
8. Apakah filter periode memakai query param pada route show atau state frontend dengan reload Inertia.
9. Apakah `orderReviews` perlu dimuat di `OutletController::show` agar average rating existing di `OutletResource` menjadi akurat.
10. Bagaimana action checklist mengubah tab aktif pada halaman detail outlet.
11. Apakah checklist dibuat sebagai array backend murni atau sebagian rule ringan di frontend.
12. Bagaimana menghindari query berat saat owner memiliki outlet dengan order besar.
13. Indeks database apa yang sudah ada atau perlu ditambahkan untuk query berdasarkan `outlet_id`, `order_date`, `created_at`, `status`, dan `payment_status`.
14. Apakah agregasi layanan/kategori perlu mengecualikan order cancelled/rejected.
15. Apakah timezone outlet perlu dipakai untuk batas hari ini dan range 30 hari.

## 13. Pertanyaan Terbuka

1. Siapa saja role operator yang boleh melihat overview outlet selain owner?
2. Apakah pendapatan di overview sebaiknya memakai `total_amount`, `paid_amount`, atau hanya order yang sudah `paid/completed`?
3. Apakah COD dihitung sebagai pendapatan saat order dibuat, saat delivered, atau saat completed?
4. Apakah order `paid_by_package` dianggap revenue pada periode order atau hanya pemakaian kuota/deposit?
5. Apakah layanan aktif ditentukan oleh status layanan, status kategori, atau keberadaan layanan yang belum dihapus?
6. Apakah karyawan aktif ditentukan oleh status employee tertentu atau semua employee pada outlet?
7. Apakah checklist harus menyertakan status WhatsApp/notifikasi jika setting-nya belum konsisten di codebase?
8. Apakah owner membutuhkan export laporan dari overview atau cukup tampilan ringkas?
9. Apakah filter periode perlu tersedia pada tahap pertama atau cukup default 30 hari?
10. Apakah recent orders perlu menampilkan nama customer penuh, masked, atau cukup order number dan customer id?

## 14. Rekomendasi Awal

Untuk implementasi tahap pertama, kebutuhan paling praktis adalah:

1. Buat service backend khusus untuk menyusun payload overview outlet.
2. Kirim prop baru dari `OutletController::show`:
   - `overviewStats`,
   - `overviewCharts`,
   - `recentOrders`,
   - `operationalChecklist`.
3. Gunakan default periode 30 hari terlebih dahulu.
4. Tambahkan recent orders maksimal 6 item dari backend.
5. Tambahkan KPI ringkas yang paling penting:
   - order hari ini,
   - order 30 hari,
   - pendapatan 30 hari,
   - order aktif,
   - unpaid/outstanding,
   - pelanggan,
   - layanan aktif,
   - karyawan aktif,
   - rating,
   - coin/status fitur.
6. Tambahkan chart tahap pertama:
   - pendapatan dan order per hari,
   - distribusi status order,
   - kesehatan pembayaran,
   - top layanan atau top kategori.
7. Tambahkan checklist operasional minimal:
   - jam kerja,
   - layanan aktif,
   - karyawan,
   - courier setting,
   - fitur expired,
   - koordinat/alamat.
8. Pakai `recharts` agar konsisten dengan dashboard utama.
9. Jangan menghitung agregasi dari seluruh collection besar di frontend.
10. Tetap jadikan tab detail lain sebagai tempat pengelolaan, sementara `Overview` hanya memberi ringkasan dan navigasi.
