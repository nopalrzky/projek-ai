# User Need: Improvement Overview Detail Order sebagai Ringkasan Owner yang Mudah Dibaca

Tanggal: 2026-06-26

## 1. Latar Belakang

Halaman detail order di `Dashboard/Orders/Show` sudah memiliki tab terpisah untuk overview, item, pembayaran, riwayat status, pelanggan, karyawan, dan pengaturan. Namun tab `Overview` saat ini masih terasa seperti kumpulan informasi dasar yang panjang, bukan ringkasan yang langsung membantu owner memahami kondisi order.

Owner membutuhkan overview yang dapat dibaca cepat dari kiri ke kanan dan dari atas ke bawah. Saat membuka detail order, owner seharusnya langsung tahu:

1. Order ini sedang berada di tahap apa.
2. Apakah order ini sudah aman secara pembayaran.
3. Apakah produksi berjalan, tertahan, atau sudah selesai.
4. Apa tindakan berikutnya yang paling penting.
5. Siapa customer, outlet, dan employee yang bertanggung jawab.
6. Ada catatan atau instruksi penting apa yang perlu diperhatikan.
7. Apakah order ini terkait pickup/delivery, COD, paket membership, atau kuota layanan.

Dokumen ini disusun sebagai acuan kebutuhan untuk AI model lain dalam menyusun implementation plan. Dokumen ini bukan implementation plan final dan tidak meminta implementasi langsung.

## 2. Ringkasan Kondisi Codebase Saat Ini

### Sudah Ada

1. Halaman show order berada di:
   - `resources/js/Pages/Dashboard/Orders/Show.tsx`.
2. `Show.tsx` menerima prop:
   - `order: Order`.
3. `Show.tsx` memakai `Tabs` dari `resources/js/Components/Tabs`.
4. Tab yang tersedia saat ini:
   - `Overview`,
   - `Items`,
   - `Pembayaran`,
   - `Riwayat Status`,
   - `Pelanggan`,
   - `Karyawan`,
   - `Pengaturan`.
5. `Overview` dirender oleh:
   - `resources/js/Pages/Dashboard/Orders/Partials/OrderOverview.tsx`.
6. `OrderOverview.tsx` saat ini menampilkan:
   - `Ringkasan Keuangan`,
   - `Informasi Customer`,
   - `Informasi Employee`,
   - `Timeline Order`,
   - `Catatan`.
7. `OrderPageHeader.tsx` sudah menampilkan:
   - nomor order,
   - badge status order,
   - badge status pembayaran,
   - tanggal order,
   - customer,
   - employee,
   - outlet dari `order.employee.outlet`.
8. `OrderPayments.tsx` sudah memiliki informasi yang lebih actionable untuk pembayaran:
   - total tagihan,
   - sudah dibayar,
   - progress pelunasan,
   - sisa tagihan,
   - metode utama,
   - riwayat transaksi,
   - aksi catat pembayaran jika `order.canPay`.
9. `OrderItems/Index.tsx` sudah menghitung ringkasan item di frontend:
   - total quantity,
   - total subtotal,
   - total discount,
   - total akhir.
10. `OrderItemCard.tsx` sudah menampilkan detail item dan proses produksi per item:
    - nama layanan,
    - kategori,
    - kuantitas,
    - total,
    - status item,
    - proses produksi,
    - status proses `pending`, `processing`, atau `done`,
    - employee proses,
    - catatan item.
11. `OrderStatusHistory.tsx` sudah tersedia sebagai tab tersendiri untuk riwayat status.
12. Backend web show order berada di:
    - `app/Http/Controllers/Web/OrderController.php`.
13. `OrderController::show` sudah memuat relasi:
    - `customer.customerSubscriptions`,
    - `employee.employeePositions.position`,
    - `employee.outlet`,
    - `orderItems.laundryService`,
    - `orderItems.orderItemProcesses.laundryServiceProcess.process`,
    - `orderItems.orderItemProcesses.employee`,
    - `orderItems.quotaUsageLog.customerSubscription.servicePackage`,
    - `orderStatusHistories.employee`,
    - `orderPaymentLogs.employee`.
14. `OrderResource` sudah mengekspos banyak field yang relevan untuk overview:
    - `source` dan `sourceLabel`,
    - `status`, `statusLabel`, `statusBadgeVariant`,
    - `deliveryType` dan `deliveryTypeLabel`,
    - `completionPercentage`,
    - `paymentStatus`, `paymentStatusLabel`, `paymentStatusBadgeVariant`,
    - `paymentMethod`,
    - nominal subtotal, discount, tax, pickup fee, delivery fee, total, paid, remaining,
    - tanggal order, estimasi selesai, selesai aktual,
    - pickup date, pickup schedule, pickup address,
    - delivery date, delivery schedule, delivery address,
    - `lastStatusUpdate`,
    - `canPay`,
    - `canScheduleDelivery`,
    - `requiresPaymentBeforeDelivery`,
    - notes, internal notes, special instructions,
    - order items,
    - order status histories,
    - order payment logs,
    - review jika dimuat.
15. `OrderItemResource` sudah mengekspos proses produksi terurut per item, termasuk:
    - `completionPercentage`,
    - `orderItemProcesses`,
    - `processName`,
    - `sequenceNumber`,
    - `status`,
    - `startedAt`,
    - `completedAt`,
    - `employeeName`,
    - `canStart`,
    - `canComplete`,
    - `actionDeniedReason`.
16. `resources/js/types/order.ts` sudah mendefinisikan sebagian besar field order dasar.
17. Komponen reusable yang relevan sudah tersedia:
    - `Card`,
    - `Badge`,
    - `Button`,
    - `Label`,
    - `Progress`,
    - `State`,
    - `Tabs`.
18. Theme color tersedia di:
    - `resources/css/app.css`.

### Gap yang Relevan

1. `Overview` belum menjadi ringkasan keputusan owner. Informasi masih tersebar dalam card panjang dan belum disusun berdasarkan prioritas bisnis.
2. Owner belum mendapat "apa yang harus dilakukan berikutnya" secara jelas.
3. Overview belum menampilkan progress produksi keseluruhan secara kuat, padahal `completionPercentage` dan proses per item sudah tersedia.
4. Overview belum merangkum bottleneck produksi, seperti proses yang sedang berjalan, proses tertahan, item belum selesai, atau item tanpa proses.
5. Overview belum merangkum item pesanan secara cepat. Owner harus pindah tab `Items` untuk memahami isi order.
6. Overview belum menampilkan progress pembayaran secara visual seperti di tab `Pembayaran`.
7. Overview belum menampilkan fee pickup/delivery, payment method, COD risk, dan kondisi "harus lunas sebelum delivery" secara eksplisit.
8. Overview belum menampilkan `source`, `deliveryType`, pickup schedule/address, delivery schedule/address, dan readiness delivery secara jelas.
9. `specialInstructions` bertipe array/null pada TypeScript, tetapi overview saat ini memperlakukannya seperti teks tunggal.
10. TypeScript `Order` belum sepenuhnya sinkron dengan `OrderResource`. Beberapa field dari resource belum ada atau belum lengkap di type frontend, misalnya:
    - `source`,
    - `sourceLabel`,
    - `deliveryType`,
    - `deliveryTypeLabel`,
    - `completionPercentage`,
    - `pickupFee`,
    - `formattedPickupFee`,
    - `deliveryFee`,
    - `formattedDeliveryFee`,
    - `pickupAddress`,
    - `pickupSchedule`,
    - `formattedPickupSchedule`,
    - `deliveryDate`,
    - `formattedDeliveryDate`,
    - `deliveryAddress`,
    - `deliverySchedule`,
    - `formattedDeliverySchedule`,
    - `canScheduleDelivery`,
    - `requiresPaymentBeforeDelivery`,
    - `customerAccount`,
    - `customerAddress`,
    - `review`,
    - `hasReview`.
11. `OrderController::show` belum memuat beberapa relasi yang bisa relevan untuk overview owner, seperti `outlet`, `customerAccount`, `customerAddress`, `statusUpdater`, dan `review`, meskipun beberapa field resource sudah mendukungnya.
12. `OrderOverview.tsx` masih banyak memakai pola markup berulang. Plan implementasi sebaiknya mengarahkan pemecahan menjadi komponen kecil reusable di area `resources/js/Components` atau komponen partial yang terstruktur, sesuai pola codebase.
13. Beberapa komponen partial order masih memakai warna Tailwind hardcoded seperti `blue-*`, `red-*`, atau `green-*`. Improvement overview sebaiknya konsisten memakai theme token dari `app.css`.

## 3. Tujuan Improvement

Tujuan utama improvement ini adalah menjadikan tab `Overview` sebagai ringkasan order yang mudah dibaca owner dan dapat digunakan untuk mengambil keputusan cepat.

Tujuan detail:

1. Membuat owner bisa memahami kondisi order dalam beberapa detik.
2. Menyusun informasi dengan alur baca yang jelas dari kiri ke kanan dan atas ke bawah.
3. Menampilkan indikator status paling penting di bagian atas:
   - status order,
   - status pembayaran,
   - progress produksi,
   - urgency atau risiko,
   - next action.
4. Mengurangi kebutuhan berpindah tab hanya untuk membaca ringkasan dasar.
5. Tetap menjaga tab detail seperti `Items`, `Pembayaran`, dan `Riwayat Status` sebagai tempat pendalaman.
6. Menampilkan data operasional, keuangan, customer, employee, dan catatan dalam hierarki yang jelas.
7. Memanfaatkan data yang sudah tersedia dari `OrderResource` sebelum menambah query baru.
8. Jika data agregat baru dibutuhkan, hitung di backend atau service layer agar logic bisnis tidak tersebar di frontend.

## 4. Aktor

1. `owner`
   Aktor utama yang membuka detail order untuk memonitor nilai order, pembayaran, progress, masalah, dan tindakan lanjutan.
2. `operator/kasir`
   Aktor pendukung yang perlu melihat status pembayaran, catatan customer, dan tindakan operasional berikutnya.
3. `employee produksi`
   Aktor pendukung yang terbantu oleh ringkasan proses yang sedang berjalan atau tertahan.
4. `kurir`
   Aktor pendukung jika order memakai pickup/delivery.
5. `system`
   Menghitung status, progress, risiko, dan action hints berdasarkan data order.

## 5. Scope Kebutuhan

### In Scope

1. Perbaikan struktur dan isi tab `Overview` pada `Dashboard/Orders/Show`.
2. Ringkasan owner-level untuk:
   - status order,
   - pembayaran,
   - progress produksi,
   - item pesanan,
   - customer,
   - employee/outlet,
   - pickup/delivery,
   - catatan dan instruksi penting,
   - aktivitas terbaru.
3. Penyusunan layout yang mudah dibaca dari kiri ke kanan dan atas ke bawah.
4. Penambahan komponen kecil/reusable jika diperlukan untuk menjaga konsistensi.
5. Sinkronisasi TypeScript type dengan field yang sudah dikirim `OrderResource`.
6. Penambahan field agregat backend bila data yang dibutuhkan tidak aman atau tidak efisien dihitung di frontend.
7. Empty state dan fallback data yang jelas.
8. Responsive layout untuk mobile dan desktop.
9. Penggunaan theme color dari `resources/css/app.css`.
10. Penggunaan komponen reusable dari `resources/js/Components` jika ada.

### Out of Scope

1. Mengubah lifecycle order.
2. Mengubah flow pembayaran.
3. Mengubah flow produksi item.
4. Mengganti seluruh halaman order show.
5. Menghapus tab detail existing.
6. Membuat realtime update atau websocket.
7. Membuat forecasting completion time berbasis machine learning.
8. Mengubah business rule COD, delivery, membership, atau wallet.
9. Mengubah schema database kecuali plan menemukan field benar-benar belum tersedia.
10. Membuat report akuntansi baru.

## 6. Prinsip UX dan Informasi

1. Overview harus menjawab "order ini aman atau bermasalah?" sebelum menampilkan detail.
2. Informasi yang perlu tindakan harus berada lebih atas daripada informasi arsip.
3. Layout desktop harus mendukung pembacaan kiri ke kanan:
   - kiri untuk narasi utama order dan detail prioritas,
   - kanan untuk status, aksi, atau insight ringkas.
4. Layout juga harus tetap logis dari atas ke bawah:
   - status dan next action,
   - keuangan dan pembayaran,
   - produksi dan item,
   - fulfillment pickup/delivery,
   - pihak terkait,
   - aktivitas dan catatan.
5. Overview tidak boleh menjadi duplikasi penuh tab detail. Overview hanya menampilkan summary, sedangkan tab detail tetap menjadi tempat eksplorasi.
6. Warna harus mendukung severity, bukan dekorasi berlebihan.
7. Semua warna harus memakai token theme dari `app.css`, bukan hardcode warna baru.
8. Komponen reusable dari `resources/js/Components` harus dipakai jika sudah tersedia.
9. Empty state harus membantu, misalnya "Belum ada pembayaran" atau "Belum ada proses produksi", bukan hanya area kosong.
10. Data nominal harus selalu memakai format rupiah yang konsisten.
11. Data waktu harus memakai formatted field dari backend jika tersedia.
12. Section harus tetap readable ketika ada teks panjang seperti alamat, catatan, atau instruksi khusus.
13. Label harus jelas dan berbasis bahasa bisnis owner, bukan hanya nama field database.

## 7. User Need Fungsional

### FR-01 Overview Memiliki Hero Summary untuk Status Utama Order

1. Owner dapat melihat ringkasan status utama order di bagian paling atas tab overview.
2. Hero summary minimal menampilkan:
   - nomor order,
   - status order,
   - status pembayaran,
   - progress produksi,
   - tanggal order,
   - estimasi selesai,
   - total tagihan,
   - sisa tagihan jika ada.
3. Hero summary harus memberi sinyal visual untuk order yang perlu perhatian:
   - belum dibayar,
   - partial payment,
   - overdue dari estimasi selesai,
   - produksi belum dimulai,
   - order siap tetapi belum diambil/delivery,
   - membutuhkan pembayaran sebelum delivery.
4. Hero summary harus tetap ringkas dan tidak menggantikan `OrderPageHeader`.
5. Jika `OrderPageHeader` sudah menampilkan sebagian informasi, plan dapat memutuskan apakah header diperkuat atau overview memiliki summary sendiri, tetapi jangan membuat informasi berulang secara berlebihan.

### FR-02 Overview Menampilkan Next Action yang Jelas

1. Owner dapat melihat tindakan berikutnya yang paling relevan untuk order.
2. Next action harus diturunkan dari kombinasi status order, payment status, delivery type, dan progress produksi.
3. Contoh next action:
   - `Catat pembayaran` jika `order.canPay` dan sisa tagihan masih ada.
   - `Tunggu harga/penimbangan` jika payment status `not_yet_priced`.
   - `Mulai proses produksi` jika order sudah `ready_to_process` dan item belum berjalan.
   - `Lanjutkan produksi` jika ada proses `processing`.
   - `Siapkan pickup/delivery` jika order `ready` atau `completed`.
   - `Selesaikan pelunasan sebelum delivery` jika `requiresPaymentBeforeDelivery`.
   - `Tidak ada aksi mendesak` jika order sudah completed dan paid.
4. Next action harus bisa berupa panel rekomendasi, callout, atau tombol aksi.
5. Jika aksi membuka tab lain, tombol/CTA boleh mengarahkan pengguna ke tab terkait, misalnya `Pembayaran` atau `Items`.
6. Action tidak boleh menjanjikan flow baru jika backend route belum tersedia.

### FR-03 Overview Menampilkan Ringkasan Pembayaran yang Mudah Dipahami

1. Owner dapat melihat kondisi pembayaran tanpa harus membuka tab `Pembayaran`.
2. Ringkasan pembayaran minimal menampilkan:
   - total tagihan,
   - sudah dibayar,
   - sisa tagihan,
   - status pembayaran,
   - metode pembayaran utama jika ada,
   - payment progress dalam persen.
3. Jika `remainingAmount > 0`, sisa tagihan harus jelas terlihat.
4. Jika order COD, tampilkan bahwa pembayaran ditagih saat delivery/pickup sesuai rule yang tersedia.
5. Jika `requiresPaymentBeforeDelivery` bernilai true, tampilkan peringatan bahwa order harus lunas sebelum delivery.
6. Jika `canPay` bernilai true, tampilkan aksi menuju pencatatan pembayaran atau tab pembayaran.
7. Jika ada payment logs, tampilkan aktivitas pembayaran terakhir secara ringkas.
8. Overview tidak perlu menampilkan seluruh timeline pembayaran karena itu tetap ada di tab `Pembayaran`.

### FR-04 Overview Menampilkan Breakdown Keuangan yang Lengkap tetapi Ringkas

1. Owner dapat melihat komponen total order tanpa membaca tabel panjang.
2. Breakdown minimal:
   - subtotal,
   - diskon,
   - pajak,
   - pickup fee jika ada,
   - delivery fee jika ada,
   - total akhir.
3. Pickup fee dan delivery fee sudah tersedia di `OrderResource`, tetapi belum tampil di `OrderOverview`.
4. Field TypeScript perlu disesuaikan jika plan menggunakan field tersebut.
5. Breakdown harus tetap mudah discan dan tidak memakan area paling dominan dibanding total dan sisa tagihan.

### FR-05 Overview Menampilkan Progress Produksi Keseluruhan

1. Owner dapat melihat progress produksi order tanpa membuka tab `Items`.
2. Progress produksi minimal menampilkan:
   - `completionPercentage`,
   - jumlah item total,
   - jumlah item selesai,
   - jumlah item sedang diproses,
   - jumlah item pending,
   - jumlah proses selesai,
   - jumlah proses sedang berjalan,
   - jumlah proses pending.
3. Progress harus disajikan secara visual, misalnya progress bar atau status cards ringkas.
4. Jika tidak ada item atau proses, tampilkan empty state yang jelas.
5. Jika ada proses yang sedang berjalan, tampilkan nama proses dan employee yang sedang mengerjakan jika data tersedia.
6. Jika ada proses tertahan karena proses sebelumnya belum selesai, tampilkan sebagai bottleneck ringan jika data bisa diturunkan dari `orderItemProcesses`.
7. Jangan menampilkan seluruh proses detail di overview; cukup ringkasan dan link/CTA ke tab `Items`.

### FR-06 Overview Menampilkan Ringkasan Item Pesanan

1. Owner dapat melihat isi order secara cepat.
2. Ringkasan item minimal menampilkan:
   - jumlah item,
   - total quantity,
   - kategori/layanan dominan jika bisa dihitung,
   - daftar 3 sampai 5 item terpenting atau item pertama,
   - indikasi item menggunakan paket atau kuota jika ada `quotaUsageLog`.
3. Jika ada banyak item, overview harus menampilkan ringkasan dan link ke tab `Items`, bukan daftar penuh.
4. Item summary harus menampilkan informasi yang mudah dibaca:
   - nama layanan,
   - quantity dan unit,
   - status,
   - total amount.
5. Jika item memiliki catatan penting, tampilkan indikator kecil agar owner tahu ada detail yang perlu dibuka.

### FR-07 Overview Menampilkan Pickup dan Delivery Readiness

1. Owner dapat melihat apakah order ini pickup, delivery, atau walk-in/cabang.
2. Informasi fulfillment minimal:
   - `deliveryTypeLabel`,
   - pickup schedule jika ada,
   - pickup date jika ada,
   - pickup address jika ada,
   - delivery schedule jika ada,
   - delivery date jika ada,
   - delivery address jika ada,
   - readiness delivery berdasarkan `canScheduleDelivery` dan `requiresPaymentBeforeDelivery`.
3. Jika order membutuhkan pembayaran sebelum delivery, tampilkan warning yang jelas.
4. Jika address tidak tersedia padahal order butuh pickup/delivery, tampilkan missing-data warning.
5. Jika field `customerAddress` diperlukan, plan perlu mempertimbangkan memuat relasi `customerAddress` di `OrderController::show`.

### FR-08 Overview Menampilkan Customer, Employee, dan Outlet dalam Bentuk Ringkas

1. Owner dapat memahami pihak yang terkait dengan order dalam satu area ringkas.
2. Customer summary minimal menampilkan:
   - nama,
   - phone,
   - email jika ada,
   - alamat atau customer address jika relevan.
3. Employee/outlet summary minimal menampilkan:
   - employee penanggung jawab,
   - posisi atau role jika tersedia,
   - outlet,
   - alamat outlet jika tersedia.
4. Informasi pihak terkait harus ringkas karena tab `Pelanggan` dan `Karyawan` tetap tersedia untuk detail.
5. Jika nomor phone tersedia, plan dapat mempertimbangkan action link aman seperti `tel:` atau WhatsApp jika pola aplikasi sudah ada.

### FR-09 Overview Menampilkan Catatan dan Instruksi Penting Secara Prioritas

1. Owner dapat melihat catatan penting tanpa scroll terlalu jauh.
2. Catatan yang perlu diprioritaskan:
   - `specialInstructions`,
   - `internalNotes`,
   - `notes` customer,
   - item notes jika ada item yang punya catatan.
3. `specialInstructions` perlu ditampilkan sebagai list/chips karena tipe datanya array.
4. Catatan internal harus dibedakan secara visual dari catatan customer.
5. Jika tidak ada catatan, section boleh disembunyikan atau tampil sebagai state ringan, sesuai keputusan desain.
6. Catatan panjang harus wrap dengan baik dan tidak merusak layout.

### FR-10 Overview Menampilkan Aktivitas Terbaru

1. Owner dapat melihat aktivitas paling baru dari order tanpa membuka tab riwayat.
2. Aktivitas terbaru dapat bersumber dari:
   - `orderStatusHistories`,
   - `orderPaymentLogs`,
   - `lastStatusUpdate`,
   - item process update jika tersedia.
3. Overview cukup menampilkan 3 sampai 5 aktivitas terbaru.
4. Setiap aktivitas minimal menampilkan:
   - label aktivitas,
   - waktu,
   - actor/employee jika tersedia,
   - status dari/ke jika relevan.
5. Detail penuh tetap berada di tab `Riwayat Status` atau `Pembayaran`.

### FR-11 Overview Menampilkan Risiko atau Alert Owner

1. Owner dapat melihat masalah order yang perlu perhatian.
2. Alert minimal yang perlu dipertimbangkan:
   - order overdue dari `estimatedCompletion`,
   - sisa tagihan masih ada,
   - order siap tetapi belum dipickup/delivery,
   - belum ada item,
   - belum ada proses produksi pada item yang seharusnya diproses,
   - pickup/delivery address kosong,
   - membutuhkan pelunasan sebelum delivery,
   - customer phone kosong,
   - payment status `not_yet_priced`.
3. Alert harus memiliki severity:
   - info,
   - warning,
   - danger,
   - success/done.
4. Alert tidak boleh terlalu banyak. Jika banyak, tampilkan prioritas tertinggi dan link/detail.
5. Alert harus berdasarkan data nyata, bukan asumsi yang tidak dapat diverifikasi.

### FR-12 Overview Menyediakan Navigasi Cepat ke Tab Terkait

1. Owner dapat berpindah cepat dari summary ke detail.
2. CTA yang relevan:
   - lihat semua item,
   - lihat pembayaran,
   - lihat riwayat status,
   - lihat customer,
   - lihat employee,
   - catat pembayaran jika route dan permission tersedia.
3. Jika menggunakan state tab di `Show.tsx`, plan harus mempertimbangkan cara aman untuk mengubah active tab dari komponen overview.
4. Alternatifnya, overview dapat menerima callback `onNavigateTab` atau tab index mapping dari parent.
5. Jangan membuat routing baru hanya untuk pindah tab jika tab lokal sudah cukup.

## 8. Kebutuhan Data dan Backend

### DR-01 Sinkronisasi TypeScript dengan OrderResource

1. Type `Order` di `resources/js/types/order.ts` perlu disesuaikan dengan field yang sudah dikirim `OrderResource`.
2. Field yang perlu dipertimbangkan untuk ditambahkan minimal:
   - `source`,
   - `sourceLabel`,
   - `deliveryType`,
   - `deliveryTypeLabel`,
   - `completionPercentage`,
   - `pickupFee`,
   - `formattedPickupFee`,
   - `deliveryFee`,
   - `formattedDeliveryFee`,
   - `pickupAddress`,
   - `pickupSchedule`,
   - `formattedPickupSchedule`,
   - `deliveryDate`,
   - `formattedDeliveryDate`,
   - `deliveryAddress`,
   - `deliverySchedule`,
   - `formattedDeliverySchedule`,
   - `canScheduleDelivery`,
   - `requiresPaymentBeforeDelivery`,
   - `customerAccount`,
   - `customerAddress`,
   - `review`,
   - `hasReview`.
3. Type `specialInstructions` harus sesuai dengan data resource, yaitu array/string array atau null.
4. Type untuk item process juga perlu dicek jika overview menampilkan process summary dari `orderItemProcesses`.

### DR-02 Aggregation Strategy untuk Overview

1. Karena `OrderController::show` sudah memuat `orderItems` dan `orderItemProcesses`, overview dapat menghitung ringkasan ringan di frontend selama tidak mahal dan tidak menduplikasi business rule kritis.
2. Agregasi yang aman dihitung di frontend:
   - total item count,
   - total quantity,
   - jumlah item per status dari payload yang sudah ada,
   - jumlah process `pending`, `processing`, `done`,
   - aktivitas terbaru dari data yang sudah terkirim.
3. Agregasi yang sebaiknya dipertimbangkan di backend jika logic makin kompleks:
   - next action,
   - risk/alert severity,
   - overdue status,
   - production bottleneck,
   - fulfillment readiness,
   - owner-level action hints.
4. Plan dapat memilih membuat computed object seperti `orderOverview` pada payload show jika itu membuat frontend lebih bersih.
5. Jika menambah payload `orderOverview`, bentuknya harus kecil dan tidak menggandakan seluruh order.

### DR-03 Relasi Tambahan yang Mungkin Diperlukan

1. Jika overview butuh data outlet langsung, pertimbangkan memuat relasi:
   - `outlet`.
2. Jika overview butuh alamat customer yang lebih tepat untuk pickup/delivery, pertimbangkan memuat:
   - `customerAddress`.
3. Jika overview butuh status updater terakhir, pertimbangkan memuat:
   - `statusUpdater`.
4. Jika overview ingin menampilkan review/order satisfaction, pertimbangkan memuat:
   - `review`.
5. Penambahan relasi harus dievaluasi terhadap payload size dan kebutuhan sebenarnya.

## 9. Kebutuhan Layout yang Disarankan

Bagian ini bukan instruksi implementasi final, tetapi orientasi kebutuhan visual agar plan tidak menyusun overview sebagai daftar card panjang tanpa hierarki.

### Struktur Desktop yang Diinginkan

1. Baris pertama: status summary dan next action.
2. Grid utama dua kolom:
   - kolom kiri lebih lebar untuk financial summary, production summary, dan item summary,
   - kolom kanan untuk next action, risk alerts, fulfillment, dan pihak terkait.
3. Section bawah:
   - aktivitas terbaru,
   - catatan dan instruksi penting.

Alternatif layout:

1. Top KPI strip berisi 4 sampai 5 angka penting.
2. Konten utama memakai `lg:grid-cols-3`.
3. Area kiri `lg:col-span-2` untuk narasi utama.
4. Area kanan `lg:col-span-1` untuk status/action/alerts.

### Struktur Mobile yang Diinginkan

1. Semua section stack vertikal.
2. Urutan mobile harus tetap mengikuti prioritas:
   - status utama,
   - next action,
   - pembayaran,
   - produksi,
   - fulfillment,
   - item,
   - pihak terkait,
   - catatan,
   - aktivitas.
3. Tidak boleh ada teks saling overlap.
4. Nominal, alamat, dan catatan panjang harus wrap dengan baik.

## 10. Komponen dan Konsistensi UI

1. Gunakan komponen reusable dari `resources/js/Components` jika sudah tersedia.
2. Jika ada pola yang sering berulang, plan perlu mengarahkan pembuatan komponen kecil reusable, misalnya:
   - `InfoRow`,
   - `MetricTile`,
   - `StatusSummaryCard`,
   - `ProgressSummary`,
   - `AlertList`,
   - `ActivityPreview`.
3. Komponen yang umum dan reusable lintas halaman sebaiknya ditempatkan di `resources/js/Components`.
4. Komponen yang spesifik order dapat tetap berada di `resources/js/Pages/Dashboard/Orders/Partials`.
5. Gunakan `Card`, `Badge`, `Button`, `Label`, dan `Progress` existing bila cocok.
6. Jangan hardcode warna baru. Gunakan token CSS seperti:
   - `var(--color-surface)`,
   - `var(--color-border)`,
   - `var(--color-text-primary)`,
   - `var(--color-text-secondary)`,
   - `var(--color-primary-*)`,
   - `var(--color-success-*)`,
   - `var(--color-warning-*)`,
   - `var(--color-error-*)`,
   - `var(--color-info-*)`.
7. Jangan menambah comment kode yang tidak diperlukan.
8. Hindari nested card yang membuat tampilan berat.
9. Hindari UI dekoratif yang tidak membantu pembacaan owner.
10. Pastikan spacing dan hierarchy konsisten dengan dashboard lain.

## 11. Kebutuhan Non-Fungsional

1. Overview harus tetap cepat dirender.
2. Tidak boleh menambah query N+1.
3. Payload tambahan harus proporsional dengan kebutuhan show order.
4. Perubahan harus menjaga aksesibilitas dasar:
   - heading terstruktur,
   - warna tidak menjadi satu-satunya penanda status,
   - tombol memiliki label jelas,
   - icon tidak menggantikan teks penting.
5. Layout harus responsif.
6. Empty state harus jelas.
7. Tidak boleh merusak tab existing.
8. Tidak boleh mengubah rule pembayaran atau status produksi.
9. TypeScript harus tetap konsisten.
10. Build frontend harus tetap lolos.

## 12. Acceptance Criteria

### AC-01 Owner Bisa Membaca Kondisi Order dengan Cepat

1. Saat membuka tab overview, owner dapat langsung melihat:
   - status order,
   - status pembayaran,
   - progress produksi,
   - total dan sisa tagihan,
   - next action.
2. Informasi tersebut terlihat tanpa harus scroll jauh pada desktop normal.

### AC-02 Overview Memiliki Alur Baca yang Jelas

1. Layout desktop dapat dibaca dari kiri ke kanan dan atas ke bawah.
2. Informasi prioritas berada di atas.
3. Section detail tidak mendahului summary.
4. Mobile tetap stack dengan urutan prioritas yang benar.

### AC-03 Pembayaran Ringkas dan Actionable

1. Payment progress tampil di overview.
2. Sisa tagihan tampil jelas jika ada.
3. Kondisi COD atau pembayaran sebelum delivery tampil jika relevan.
4. Ada navigasi atau CTA ke tab pembayaran jika perlu.

### AC-04 Produksi Ringkas dan Actionable

1. Completion percentage tampil jelas.
2. Jumlah item/proses berdasarkan status tampil ringkas.
3. Proses aktif atau bottleneck tampil jika data tersedia.
4. Ada navigasi ke tab item untuk detail.

### AC-05 Fulfillment Pickup/Delivery Tampil Jelas

1. Delivery type tampil dengan label bisnis.
2. Jadwal/alamat pickup atau delivery tampil jika tersedia.
3. Missing address atau requirement pelunasan sebelum delivery tampil sebagai warning jika relevan.

### AC-06 Catatan Penting Tidak Terkubur

1. Special instructions tampil sebagai list/chips.
2. Internal notes dan customer notes dibedakan.
3. Catatan panjang tidak merusak layout.

### AC-07 Type dan Data Aman

1. TypeScript `Order` mencakup field yang dipakai overview.
2. Field optional diberi fallback.
3. Tidak ada penggunaan field resource tanpa type yang jelas.
4. Tidak ada asumsi data selalu ada untuk customer, employee, outlet, address, notes, payment logs, atau item processes.

### AC-08 Konsisten dengan Codebase

1. Komponen reusable dipakai jika tersedia.
2. Warna memakai theme token.
3. Tidak ada hardcode warna baru.
4. Tidak ada perubahan unrelated.
5. Build frontend berhasil.

## 13. Rekomendasi Pertanyaan untuk Implementation Plan

AI model yang menyusun plan sebaiknya menjawab pertanyaan berikut sebelum implementasi:

1. Apakah overview cukup menghitung agregasi dari `order` payload existing, atau perlu `orderOverview` computed object dari backend?
2. Apakah `OrderPageHeader` perlu diperkuat atau summary utama cukup berada di `OrderOverview`?
3. Bagaimana cara terbaik untuk navigasi dari overview ke tab detail: callback parent, state lifting, atau link internal?
4. Apakah perlu memuat relasi tambahan `outlet`, `customerAddress`, `statusUpdater`, atau `review`?
5. Field apa saja di `resources/js/types/order.ts` yang harus disinkronkan dengan `OrderResource`?
6. Komponen mana yang layak menjadi reusable global di `resources/js/Components`, dan mana yang cukup menjadi partial order?
7. Bagaimana menentukan next action dan risk alert agar tidak terlalu banyak atau misleading?
8. Bagaimana menampilkan special instructions array secara konsisten?

## 14. Catatan Implementasi yang Harus Dihindari

1. Jangan hanya mempercantik card existing tanpa memperbaiki hierarki informasi.
2. Jangan membuat overview menjadi duplikasi penuh tab `Items`, `Pembayaran`, atau `Riwayat Status`.
3. Jangan membuat semua informasi memiliki bobot visual yang sama.
4. Jangan hardcode warna Tailwind baru jika token theme sudah tersedia.
5. Jangan menghitung business rule kompleks di frontend jika rule tersebut harus konsisten dengan backend.
6. Jangan menambahkan query besar tanpa kebutuhan yang jelas.
7. Jangan menghapus tab existing yang masih berguna.
8. Jangan mengandalkan warna saja untuk severity.
9. Jangan mengabaikan mobile layout.
10. Jangan membuat action button yang tidak punya route/permission jelas.

## 15. Ringkasan Prioritas

Prioritas tertinggi:

1. Rework layout overview agar mudah dibaca owner.
2. Tampilkan status utama, payment health, production progress, dan next action di atas.
3. Sinkronkan TypeScript dengan field `OrderResource` yang dipakai.
4. Tambahkan ringkasan item dan proses produksi.
5. Tambahkan pickup/delivery readiness.
6. Tampilkan alert/risk yang actionable.

Prioritas menengah:

1. Aktivitas terbaru gabungan status dan pembayaran.
2. Ringkasan notes/instructions yang lebih kuat.
3. Navigasi cepat ke tab detail.
4. Relasi tambahan backend jika benar-benar diperlukan.

Prioritas rendah:

1. Review/customer satisfaction di overview.
2. Advanced bottleneck analysis.
3. Estimasi waktu selesai yang dihitung dinamis.
4. Visualisasi chart tambahan.
