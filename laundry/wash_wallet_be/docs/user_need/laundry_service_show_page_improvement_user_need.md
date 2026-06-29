# User Need: Improvement Halaman Detail Laundry Service

Tanggal: 2026-06-28

## 1. Latar Belakang

Halaman detail laundry service di `Dashboard/LaundryServices/Show` sudah memiliki struktur dasar yang baik: header, tab ringkasan, dan tab proses layanan. Namun informasi yang tampil masih belum cukup lengkap untuk membantu owner/operator memahami layanan tersebut secara utuh.

Owner/operator membutuhkan halaman detail layanan yang bisa menjawab pertanyaan bisnis utama dalam waktu singkat:

1. Layanan ini milik outlet dan kategori apa.
2. Berapa harga, durasi, minimal kuantitas, dan satuannya.
3. Apakah layanan aktif dan apakah mendukung kurir.
4. Proses produksi apa saja yang berlaku untuk layanan ini.
5. Paket layanan apa saja yang memakai layanan ini.
6. Apakah layanan ini pernah dipakai di order, dan seperti apa riwayat pemakaiannya.
7. Apakah ada risiko konfigurasi, misalnya layanan aktif tetapi belum punya proses, tidak mendukung kurir, atau belum masuk paket mana pun.

Dokumen ini disusun sebagai acuan kebutuhan untuk AI model lain dalam menyusun implementation plan. Dokumen ini bukan implementation plan final dan tidak meminta implementasi langsung.

## 2. Ringkasan Kondisi Codebase Saat Ini

### 2.1 Halaman Frontend Saat Ini

1. Halaman show laundry service berada di:
   - `resources/js/Pages/Dashboard/LaundryServices/Show.tsx`.
2. `Show.tsx` menerima prop:
   - `laundryService: LaundryService`.
3. `Show.tsx` memakai:
   - `Head` dari `@inertiajs/react`,
   - `Tabs` dari `@/Components/Tabs`,
   - `withAuthenticatedLayout` dari `@/Layouts/AuthenticatedLayout`,
   - icon dari `lucide-react`.
4. Tab yang tersedia saat ini:
   - `Ringkasan`,
   - `Proses Layanan`.
5. Tab `Ringkasan` dirender oleh:
   - `resources/js/Pages/Dashboard/LaundryServices/Partials/LaundryServiceOverview.tsx`.
6. Tab `Proses Layanan` dirender oleh:
   - `resources/js/Pages/Dashboard/LaundryServices/LaundryServiceProcesses/Index.tsx`.
7. Header halaman dirender oleh:
   - `resources/js/Pages/Dashboard/LaundryServices/Partials/LaundryServicePageHeader.tsx`.
8. `LaundryServiceOverview.tsx` saat ini menampilkan:
   - outlet,
   - kategori,
   - unit,
   - tanggal dibuat,
   - tanggal terakhir diupdate,
   - deskripsi jika ada.
9. `LaundryServicePageHeader.tsx` saat ini menampilkan:
   - nama layanan,
   - status aktif/nonaktif,
   - outlet,
   - kategori,
   - unit,
   - deskripsi singkat,
   - tombol kembali.
10. `LaundryServiceProcesses/Index.tsx` sudah mengikuti pola hasMany:
    - berada di folder relasi tersendiri,
    - memakai `Card`,
    - memakai `Table`,
    - memakai `ColumnDef` dari `@tanstack/react-table`,
    - menampilkan row proses layanan,
    - menyediakan action tambah, detail, edit, hapus.

### 2.2 Pola Show Page Lain yang Relevan

1. `resources/js/Pages/Dashboard/ServicePackages/Show.tsx`
   - memakai `Tabs`,
   - tab `Overview` dirender oleh partial,
   - relasi hasMany `servicePackageItems` dibuat sebagai folder `ServicePackageItems/Index.tsx`,
   - tab relasi memakai badge count.
2. `resources/js/Pages/Dashboard/Orders/Show.tsx`
   - memakai tab banyak,
   - relasi hasMany `orderItems` dibuat sebagai folder `OrderItems/Index.tsx`,
   - informasi tunggal seperti customer dan employee ditempatkan di `Partials`.
3. `resources/js/Pages/Dashboard/Customers/Show.tsx`
   - relasi tunggal outlet dirender sebagai partial `CustomerOutlet`,
   - relasi hasMany seperti orders, membership contracts, dan subscriptions dibuat sebagai folder/tab terpisah.
4. `resources/js/Pages/Dashboard/Employees/Show.tsx`
   - informasi personal/pekerjaan ditempatkan di `Partials`,
   - relasi hasMany seperti posisi, proses, gaji, pinjaman, denda, dan pesanan dibuat sebagai folder/tab terpisah.

Kesimpulan pola codebase:

1. `Show.tsx` berperan sebagai komposer header dan tab.
2. Informasi utama dan relasi one-to-one/belongsTo/hasOne ditempatkan di folder `Partials`.
3. Relasi hasMany ditempatkan dalam folder tersendiri dengan `Index.tsx`, biasanya memakai `Table`.
4. Tab hasMany menggunakan badge count jika count tersedia.
5. Komponen umum yang konsisten dipakai:
   - `Card`,
   - `Badge`,
   - `Button`,
   - `Tabs`,
   - `Table`,
   - icon dari `lucide-react`.
6. Styling banyak memakai CSS variable theme seperti:
   - `var(--color-text-primary)`,
   - `var(--color-text-secondary)`,
   - `var(--color-border)`,
   - `var(--color-primary-*)`,
   - `var(--color-success-*)`,
   - `var(--color-info-*)`.

### 2.3 Backend Saat Ini

1. Web controller berada di:
   - `app/Http/Controllers/Web/LaundryServiceController.php`.
2. Method `show` saat ini memanggil `LaundryServiceService::getById` dengan relasi:
   - `category`,
   - `category.outlet`,
   - `unit`,
   - `laundryServiceProcesses.process`.
3. Prop yang dikirim ke Inertia:
   - `laundryService` hasil `LaundryServiceResource`.
4. Service berada di:
   - `app/Services/LaundryServiceService.php`.
5. `LaundryServiceService::getById` hanya menjalankan `with($relations)` sesuai daftar relasi yang diberikan controller.
6. Resource berada di:
   - `app/Http/Resources/LaundryService/LaundryServiceResource.php`.
7. `LaundryServiceResource` sudah mengekspos field utama:
   - `id`,
   - `categoryId`,
   - `unitId`,
   - `name`,
   - `description`,
   - `price`,
   - `durationHours`,
   - `minQuantity`,
   - `slug`,
   - `isActive`,
   - `supportsCourier`,
   - `courierSupportLabel`,
   - `courierSupportMessage`,
   - `averageRating`,
   - `totalReviews`,
   - `createdAt`,
   - `updatedAt`,
   - `deletedAt`.
8. `LaundryServiceResource` sudah mendukung relasi jika diload:
   - `category`,
   - `outlet` melalui `category.outlet`,
   - `unit`,
   - `laundryServiceProcesses`,
   - `servicePackageItems`.
9. `LaundryServiceResource` sudah mengekspos count jika collection relasi diload:
   - `laundryServiceProcessesCount`,
   - `servicePackageItemsCount`.
10. Resource belum mengekspos:
    - `orderItems`,
    - `orderItemsCount`.
11. TypeScript `LaundryService` di `resources/js/types/laundry_service.ts` sudah memiliki field:
    - `orderItems`,
    - `orderItemsCount`,
    - `servicePackageItems`,
    - `servicePackageItemsCount`,
    - `laundryServiceProcesses`,
    - `laundryServiceProcessesCount`.
12. Ada gap antara TypeScript dan resource untuk `orderItems` karena type sudah ada, tetapi resource belum mengirimnya.

### 2.4 Relasi Model LaundryService

Model berada di:

- `app/Models/LaundryService.php`.

Relasi yang ditemukan:

1. `category(): BelongsTo`
   - Layanan berada pada satu kategori.
   - Kategori dapat membawa outlet.
   - Cocok ditampilkan sebagai informasi di `Partials`, bukan tab hasMany.
2. `unit(): BelongsTo`
   - Layanan memiliki satu unit.
   - Cocok ditampilkan sebagai informasi di `Partials`, bukan tab hasMany.
3. `outlet(): HasOneThrough`
   - Outlet layanan dapat diketahui melalui kategori.
   - Cocok ditampilkan sebagai informasi di `Partials`, bukan tab hasMany.
4. `laundryServiceProcesses(): HasMany`
   - Sudah ada folder dan tab `LaundryServiceProcesses/Index.tsx`.
   - Perlu tetap dipertahankan dan bisa ditingkatkan informasinya.
5. `servicePackageItems(): HasMany`
   - Menunjukkan paket layanan mana saja yang memasukkan laundry service ini.
   - Belum tampil sebagai tab di show laundry service.
   - Berdasarkan pola codebase, relasi ini layak dibuat folder/table/tab.
6. `orderItems(): HasMany`
   - Menunjukkan riwayat item order yang memakai laundry service ini.
   - Belum tampil sebagai tab di show laundry service.
   - Berdasarkan pola codebase, relasi ini layak dibuat folder/table/tab, tetapi perlu perhatian khusus agar payload tidak terlalu besar.

Accessor yang relevan:

1. `averageRating`
   - Dihitung dari `OrderReview` yang terhubung melalui `order.orderItems`.
2. `totalReviews`
   - Dihitung dari review yang terpublish.
3. `canBeDeleted()`
   - Bergantung pada apakah ada `orderItems`.

## 3. Gap yang Relevan

1. Tab `Ringkasan` belum menampilkan field penting yang sebenarnya sudah tersedia dari resource:
   - harga,
   - durasi,
   - minimal kuantitas,
   - slug,
   - status dukungan kurir,
   - rating rata-rata,
   - total review,
   - jumlah proses,
   - jumlah paket layanan.
2. Relasi `servicePackageItems` sudah ada di model dan resource, tetapi belum diload oleh controller show dan belum ditampilkan di frontend.
3. Relasi `orderItems` sudah ada di model dan type frontend, tetapi belum diekspos oleh resource dan belum diload oleh controller show.
4. Badge tab saat ini hanya ada untuk `laundryServiceProcessesCount`.
5. Count pada resource saat ini bergantung pada relasi yang diload sebagai collection. Untuk relasi besar seperti `orderItems`, implementation plan perlu mempertimbangkan `loadCount`/`withCount` atau prop ringkasan agar tidak memuat data besar hanya untuk badge.
6. `LaundryServiceOverview` masih berupa card informasi dasar, belum menjadi overview bisnis yang actionable.
7. Header belum memiliki action cepat seperti edit, tetapi plan perlu memutuskan apakah ini perlu atau tidak.
8. `LaundryServiceProcesses/Index.tsx` memanggil route nested seperti `laundry-services.laundry-service-processes.create`, `show`, `edit`, dan `destroy`.
9. Pencarian di `routes/web.php` menemukan method nested process di controller, tetapi tidak menemukan definisi route bernama `laundry-service-processes`. Implementation plan perlu memverifikasi ini sebelum menambah atau mengandalkan action proses layanan.
10. Ada beberapa teks separator di frontend yang tampak sebagai karakter salah encoding seperti `â€¢` pada beberapa file existing. Improvement baru sebaiknya menghindari penambahan karakter bermasalah dan memakai ASCII atau layout visual yang aman.

## 4. Tujuan Improvement

Tujuan utama improvement ini adalah membuat halaman detail laundry service menjadi pusat informasi layanan yang lengkap, mudah dipindai, dan mengikuti pola show page yang sudah ada.

Tujuan detail:

1. Owner/operator dapat memahami kondisi layanan dalam beberapa detik.
2. Informasi one-to-one/belongsTo/hasOne seperti outlet, kategori, dan unit ditampilkan dalam partial yang jelas.
3. Relasi hasMany seperti proses layanan, paket layanan, dan riwayat order ditampilkan sebagai tab/folder/table sesuai pola codebase.
4. Tab `Ringkasan` menjadi overview bisnis, bukan hanya daftar field dasar.
5. Data yang belum tersedia dari backend dicatat jelas sebagai kebutuhan payload, bukan dihitung dari data yang tidak ada.
6. Payload untuk relasi besar tetap aman dan tidak memuat data berlebihan.
7. Tampilan tetap konsisten dengan komponen dan theme token yang sudah digunakan di repo.

## 5. Aktor

1. `owner`
   Melihat konfigurasi, performa, dan pemakaian layanan untuk mengambil keputusan bisnis.
2. `operator/kasir`
   Mengecek detail layanan sebelum transaksi atau saat troubleshooting order.
3. `admin operasional`
   Memastikan proses layanan, status aktif, unit, kategori, dan dukungan kurir sudah benar.
4. `system`
   Mengirim data relasi, count, ringkasan, dan status layanan secara konsisten dan scoped ke user yang berhak.

## 6. Scope Kebutuhan

### In Scope

1. Perbaikan informasi pada halaman `Dashboard/LaundryServices/Show`.
2. Perbaikan konten tab `Ringkasan`.
3. Penambahan atau perapian partial untuk informasi satuan:
   - outlet,
   - kategori,
   - unit,
   - konfigurasi layanan.
4. Penambahan tab/folder/table untuk relasi hasMany yang belum tampil:
   - `servicePackageItems`,
   - `orderItems` atau riwayat pemakaian order.
5. Penyesuaian backend payload agar tab baru memiliki data yang benar.
6. Penyesuaian TypeScript type jika resource berubah.
7. Empty state dan badge count untuk setiap tab relasi.

### Out of Scope

1. Mengubah skema database laundry service.
2. Mengubah alur create/edit layanan kecuali field yang sudah ada perlu ditampilkan konsisten.
3. Mengubah aturan bisnis harga, membership, kurir, atau order.
4. Membuat dashboard analitik besar untuk performa layanan.
5. Membuat realtime update.
6. Mengubah lifecycle order.
7. Menghapus atau merombak total komponen show page lain.

## 7. Prinsip Dasar Kebutuhan

1. `Show.tsx` harus tetap menjadi komposer header dan tab.
2. Relasi one-to-one/belongsTo/hasOne ditempatkan di `Partials`.
3. Relasi hasMany ditempatkan pada folder tersendiri dengan `Index.tsx` dan ditampilkan sebagai tab.
4. Tab relasi memakai badge count yang berasal dari backend atau count collection yang memang sudah diload.
5. Jika relasi berpotensi besar, jangan memuat seluruh data hanya untuk count.
6. Gunakan komponen existing sebelum membuat komponen baru.
7. Gunakan `formatCurrency` dan `formatDate` dari util existing jika menampilkan nominal atau tanggal.
8. Gunakan icon dari `lucide-react`.
9. Gunakan CSS variable theme, bukan palet hardcoded yang tidak konsisten.
10. Empty state harus menjelaskan kondisi dan tindakan relevan.
11. Halaman harus tetap aman jika relasi null atau belum diload.
12. Jangan membuat plan yang hanya mempercantik UI tanpa memastikan payload backend tersedia.

## 8. User Need Fungsional

### FR-01 Owner Melihat Ringkasan Identitas Layanan

1. Owner/operator dapat melihat identitas layanan pada header dan tab ringkasan.
2. Informasi minimal:
   - nama layanan,
   - status aktif/nonaktif,
   - outlet,
   - kategori,
   - unit,
   - slug,
   - deskripsi.
3. Jika data outlet/kategori/unit tidak tersedia, UI harus menampilkan fallback yang jelas.
4. Informasi outlet, kategori, dan unit sebaiknya ditaruh di partial karena relasinya bukan hasMany.

### FR-02 Owner Melihat Konfigurasi Komersial Layanan

1. Owner/operator dapat melihat harga layanan dengan format rupiah.
2. Owner/operator dapat melihat durasi layanan dalam jam.
3. Owner/operator dapat melihat minimal kuantitas dan unit.
4. Owner/operator dapat memahami apakah layanan mendukung kurir.
5. Jika `supportsCourier = false`, UI dapat menampilkan pesan dari:
   - `courierSupportLabel`,
   - `courierSupportMessage`.
6. Informasi ini sebaiknya tampil pada tab `Ringkasan` karena merupakan inti konfigurasi layanan.

### FR-03 Owner Melihat Kesehatan Konfigurasi Layanan

1. Owner/operator dapat melihat indikator ringkas apakah layanan siap dipakai.
2. Indikator minimal:
   - status aktif,
   - jumlah proses layanan,
   - status dukungan kurir,
   - jumlah paket layanan yang memakai layanan ini,
   - jumlah riwayat order jika tersedia.
3. Jika layanan aktif tetapi tidak memiliki proses, UI harus menampilkan warning ringan.
4. Jika layanan tidak masuk paket mana pun, UI dapat menampilkan info netral, bukan error.
5. Jika layanan nonaktif, UI harus tetap menampilkan data historis tetapi menegaskan bahwa layanan tidak tersedia untuk transaksi baru.

### FR-04 Owner Melihat Proses Layanan

1. Tab `Proses Layanan` tetap tersedia.
2. Tab ini menampilkan daftar proses sesuai urutan `sequence`.
3. Informasi minimal per row:
   - urutan,
   - nama proses,
   - deskripsi proses jika ada,
   - status aktif proses,
   - tanggal ditambahkan.
4. Badge tab memakai `laundryServiceProcessesCount`.
5. Empty state harus menjelaskan bahwa layanan belum memiliki proses.
6. Jika action tambah/edit/hapus tetap dipakai, route nested harus diverifikasi dan dicakup di plan.

### FR-05 Owner Melihat Paket Layanan yang Memakai Laundry Service Ini

1. Karena `servicePackageItems` adalah relasi hasMany, halaman show perlu menyediakan tab tersendiri untuk paket layanan.
2. Struktur frontend yang disarankan untuk plan:
   - folder baru di bawah `resources/js/Pages/Dashboard/LaundryServices/`,
   - misalnya `ServicePackageItems/Index.tsx`.
3. Tab dapat diberi label:
   - `Paket Layanan`,
   - atau label lain yang jelas secara bisnis.
4. Informasi minimal per row:
   - nama paket layanan,
   - kuantitas layanan dalam paket,
   - harga paket jika tersedia dari relasi,
   - status aktif paket jika tersedia,
   - outlet paket jika tersedia,
   - tanggal item dibuat atau diperbarui.
5. Badge tab memakai `servicePackageItemsCount`.
6. Backend show perlu meload relasi yang cukup, misalnya `servicePackageItems.servicePackage`, agar row tidak kosong.
7. Empty state harus menjelaskan bahwa layanan ini belum digunakan dalam paket layanan.

### FR-06 Owner Melihat Riwayat Pemakaian Layanan pada Order

1. Karena `orderItems` adalah relasi hasMany, halaman show perlu menyediakan tab tersendiri untuk riwayat order/pemakaian layanan.
2. Struktur frontend yang disarankan untuk plan:
   - folder baru di bawah `resources/js/Pages/Dashboard/LaundryServices/`,
   - misalnya `OrderItems/Index.tsx` atau `UsageHistory/Index.tsx`.
3. Informasi minimal per row:
   - nomor order,
   - customer jika tersedia,
   - tanggal order atau tanggal item dibuat,
   - quantity,
   - harga satuan,
   - subtotal/total,
   - status item,
   - apakah memakai paket/deposit jika field tersedia.
4. Badge tab memakai `orderItemsCount`.
5. Karena order item bisa sangat banyak, implementation plan perlu memilih pendekatan aman:
   - load recent order items terbatas,
   - atau backend pagination khusus,
   - atau kirim count plus daftar ringkas.
6. Resource saat ini belum mengekspos `orderItems`, jadi plan harus mencakup penyesuaian resource atau prop terpisah.
7. Empty state harus menjelaskan bahwa layanan ini belum pernah dipakai dalam order.

### FR-07 Owner Melihat Rating dan Review Summary

1. `LaundryServiceResource` sudah mengekspos:
   - `averageRating`,
   - `totalReviews`.
2. Ringkasan layanan perlu menampilkan nilai ini jika tersedia.
3. Jika belum ada review, tampilkan state yang wajar seperti `Belum ada review`.
4. User need ini tidak meminta daftar review penuh, hanya summary.

### FR-08 Owner Mendapat Navigasi dan Action yang Wajar

1. Tombol kembali tetap tersedia.
2. Plan boleh mempertimbangkan tombol edit jika konsisten dengan show page lain dan route tersedia.
3. Link ke detail outlet, kategori, paket layanan, atau order dapat dipertimbangkan jika route tersedia.
4. Jangan membuat action yang route-nya belum ada tanpa memasukkannya ke plan.

### FR-09 Payload Backend Sinkron dengan TypeScript

1. Field yang dipakai frontend harus tersedia dari `LaundryServiceResource` atau prop Inertia lain.
2. Jika frontend memakai `servicePackageItems`, controller show harus meload relasinya.
3. Jika frontend memakai `orderItems`, resource harus mengeksposnya atau controller harus mengirim prop terpisah.
4. TypeScript `LaundryService` perlu disesuaikan agar sinkron dengan resource aktual.
5. Count relasi harus jelas sumbernya:
   - dari collection loaded,
   - dari `withCount/loadCount`,
   - atau dari prop ringkasan terpisah.

## 9. Kebutuhan Non-Fungsional

1. Halaman harus tetap responsif di desktop dan mobile.
2. Table hasMany harus punya empty state dan tidak merusak layout saat data kosong.
3. Data relasi harus aman terhadap null.
4. Hindari query N+1 dengan eager loading relasi yang dibutuhkan.
5. Hindari payload besar untuk riwayat order.
6. Gunakan naming komponen yang konsisten dengan folder lain.
7. Gunakan style dan komponen existing.
8. Jangan membuat nested card yang berlebihan.
9. Jangan mengubah behavior transaksi/order.
10. Jangan mengubah data historis order saat hanya memperbarui halaman show.

## 10. Acceptance Criteria

1. Halaman detail laundry service tetap dapat dibuka dari route `laundry-services.show`.
2. Tab `Ringkasan` menampilkan informasi layanan yang lebih lengkap:
   - harga,
   - durasi,
   - minimal kuantitas,
   - unit,
   - outlet,
   - kategori,
   - status aktif,
   - status dukungan kurir,
   - rating/review summary,
   - deskripsi.
3. Informasi outlet/kategori/unit ditempatkan sebagai partial atau bagian ringkasan yang mengikuti pola one-to-one/belongsTo.
4. Tab `Proses Layanan` tetap tersedia dan menampilkan data proses yang sudah ada.
5. Relasi `servicePackageItems` ditampilkan sebagai tab hasMany dengan folder/table tersendiri.
6. Relasi `orderItems` atau riwayat pemakaian layanan ditampilkan sebagai tab hasMany atau pendekatan ringkas yang dipilih plan.
7. Setiap tab hasMany memiliki badge count yang benar.
8. Backend mengirim semua data yang dibutuhkan frontend tanpa mengandalkan field yang belum ada.
9. TypeScript type sinkron dengan payload backend.
10. Empty state tampil untuk proses kosong, paket kosong, dan riwayat order kosong.
11. Tidak ada perubahan skema database yang tidak perlu.
12. Tidak ada perubahan pada lifecycle order, membership, pricing, atau kurir.
13. Jika action create/edit/delete proses layanan dipertahankan, route yang dipakai harus valid.
14. UI tetap memakai komponen dan style token yang konsisten dengan codebase.

## 11. Catatan untuk Implementation Plan

Hal yang perlu diputuskan oleh plan berikutnya:

1. Apakah `servicePackageItemsCount` cukup dihitung dari eager-loaded collection atau perlu `loadCount`.
2. Bagaimana strategi `orderItems`:
   - load semua,
   - load recent terbatas,
   - backend pagination,
   - atau prop ringkasan terpisah.
3. Apakah `LaundryServiceResource` perlu menambahkan `orderItems` dan `orderItemsCount`.
4. Relasi apa saja yang perlu diload untuk tab paket:
   - minimal `servicePackageItems.servicePackage`,
   - mungkin `servicePackageItems.servicePackage.outlet`.
5. Relasi apa saja yang perlu diload untuk tab riwayat order:
   - minimal `orderItems.order`,
   - mungkin `orderItems.order.customer`,
   - mungkin `orderItems.customerSubscription`.
6. Apakah action proses layanan tetap aktif atau dibuat read-only dulu sampai route nested diverifikasi.
7. Apakah header perlu tombol edit.
8. Apakah ringkasan rating hanya memakai `averageRating` dan `totalReviews` yang sudah ada, atau perlu tab review di masa depan.

## 12. Referensi File

Frontend utama:

1. `resources/js/Pages/Dashboard/LaundryServices/Show.tsx`
2. `resources/js/Pages/Dashboard/LaundryServices/types.ts`
3. `resources/js/Pages/Dashboard/LaundryServices/Partials/LaundryServiceOverview.tsx`
4. `resources/js/Pages/Dashboard/LaundryServices/Partials/LaundryServicePageHeader.tsx`
5. `resources/js/Pages/Dashboard/LaundryServices/LaundryServiceProcesses/Index.tsx`
6. `resources/js/types/laundry_service.ts`
7. `resources/js/types/service_package_item.ts`
8. `resources/js/types/order_item.ts`

Backend utama:

1. `app/Models/LaundryService.php`
2. `app/Services/LaundryServiceService.php`
3. `app/Http/Controllers/Web/LaundryServiceController.php`
4. `app/Http/Resources/LaundryService/LaundryServiceResource.php`
5. `app/Http/Resources/ServicePackageItem/ServicePackageItemResource.php`
6. `app/Http/Resources/OrderItem/OrderItemResource.php`
7. `routes/web.php`

Show page pembanding:

1. `resources/js/Pages/Dashboard/ServicePackages/Show.tsx`
2. `resources/js/Pages/Dashboard/ServicePackages/ServicePackageItems/Index.tsx`
3. `resources/js/Pages/Dashboard/Orders/Show.tsx`
4. `resources/js/Pages/Dashboard/Orders/OrderItems/Index.tsx`
5. `resources/js/Pages/Dashboard/Customers/Show.tsx`
6. `resources/js/Pages/Dashboard/Customers/Partials/CustomerOutlet.tsx`
7. `resources/js/Pages/Dashboard/Employees/Show.tsx`

