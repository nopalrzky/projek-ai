# User Need: Auto Accept Order Berdasarkan Lead Time dan Jarak Pickup

Tanggal: 2026-06-16

Dokumen ini menjadi acuan user need untuk kebutuhan lanjutan **Auto Accept Order** berdasarkan lead time sebelum jadwal jemput kurir dan batas maksimal jarak order. Dokumen ini melengkapi `auto_accept_order_user_need.md`, bukan menggantikannya. Perbedaan utama adalah stakeholder terbaru membutuhkan opsi waktu auto accept yang dihitung mundur dari jadwal pickup serta pembatas jarak agar order yang terlalu jauh tidak otomatis diterima.

Dokumen ini fokus pada kebutuhan pengguna, aturan bisnis, edge cases, acceptance criteria, dan catatan konflik produk. Dokumen ini tidak menentukan solusi teknis final, desain database, nama setting final, migration, command, job, scheduler detail, atau komponen UI final.

## 1. Latar Belakang

Customer dapat membuat order dari aplikasi customer. Untuk order dengan alur pickup atau kurir, order masuk ke outlet dengan status `requested` dan perlu diterima agar proses berikutnya dapat berjalan.

Dalam operasional outlet, cashier bisa sedang sibuk melayani transaksi, timbang barang, atau menangani customer langsung sehingga order customer-app yang masuk dapat terlewat. Jika order baru disadari terlalu dekat dengan jadwal jemput kurir, outlet dan courier berisiko tidak punya cukup waktu untuk menyiapkan proses pickup.

Selain faktor waktu, jarak order juga memengaruhi kelayakan auto accept. Contohnya, jika customer mengajukan pickup dengan jarak sekitar `20 km` dari outlet, owner mungkin tidak ingin order tersebut otomatis diterima karena jarak tersebut berisiko tidak realistis untuk operasional kurir outlet. Owner membutuhkan batas maksimal jarak agar auto accept hanya berlaku untuk order yang masih masuk cakupan layanan outlet.

Di sisi lain, sebagian owner tidak ingin semua order langsung diterima otomatis begitu order dibuat. Owner tetap membutuhkan kontrol agar order hanya otomatis diterima pada waktu yang relevan dengan jadwal operasional, misalnya mendekati jadwal jemput kurir.

Karena itu, stakeholder membutuhkan pengaturan agar auto accept dapat terjadi berdasarkan dua kontrol utama: lead time sebelum jadwal pickup, seperti `30 menit`, `1 jam`, atau `2 jam`, dan maksimal jarak order yang masih boleh diterima otomatis.

## 2. Tujuan

1. Owner dapat mengatur kapan order customer-app boleh auto-accept berdasarkan lead time sebelum jadwal jemput kurir.
2. Owner dapat mengatur maksimal jarak order yang boleh auto-accept untuk outlet tertentu.
3. Outlet dapat menghindari order `requested` yang terlambat diproses menjelang jadwal pickup.
4. Outlet dapat mencegah order yang jaraknya terlalu jauh agar tidak otomatis diterima tanpa review manual.
5. Owner tetap memiliki kontrol agar order tidak selalu diterima otomatis sejak awal.
6. Jika outlet belum mengatur lead time atau batas jarak khusus, sistem tetap memakai perilaku default auto accept yang sudah ada.
7. Auto accept berdasarkan lead time dan jarak memberikan dampak bisnis yang sama dengan accept manual.
8. Riwayat order tetap mencatat tindakan otomatis sebagai `Sistem otomatis`.

## 3. Aktor

1. `owner`
   Mengatur lead time dan batas maksimal jarak auto accept untuk outlet yang dikelola.
2. `cashier`
   Melihat order yang masih perlu diterima manual dan tidak perlu menerima ulang order yang sudah auto accepted.
3. `customer`
   Membuat order dari customer app dan melihat status order berubah menjadi diterima ketika auto accept terjadi.
4. `courier atau production user`
   Menerima dampak downstream dari order yang sudah `accepted` sesuai flow pickup atau courier existing.
5. `sistem`
   Mengevaluasi order yang memenuhi aturan lead time dan jarak, lalu mencatat perubahan sebagai tindakan otomatis.

## 4. Scope Kebutuhan

Scope utama:

1. Pengaturan lead time auto accept pada level outlet.
2. Pengaturan batas maksimal jarak auto accept pada level outlet.
3. Lead time dihitung mundur dari jadwal jemput kurir yang dipilih untuk order.
4. Batas jarak dipakai untuk menentukan apakah order masih layak auto-accept.
5. Pilihan lead time perlu mendukung kebutuhan operasional seperti `30 menit`, `1 jam`, atau `2 jam` sebelum jadwal pickup.
6. Evaluasi hanya berlaku untuk order customer-app yang masih berstatus `requested`.
7. Evaluasi hanya berlaku untuk order yang memiliki outlet valid.
8. Order harus memenuhi syarat waktu dan syarat jarak agar berubah dari `requested` menjadi `accepted`.
9. Order yang sudah di-accept manual, reject, cancel, atau masuk proses manual/status lain tidak boleh diproses ulang oleh auto accept.
10. Dampak status, notifikasi, flow courier/production, dan status history mengikuti perilaku accept manual.
11. Riwayat/status order membedakan perubahan otomatis sebagai tindakan `Sistem otomatis`.
12. Jika outlet tidak memiliki pengaturan lead time atau batas jarak khusus, sistem tetap memakai perilaku default auto accept existing.

Di luar scope dokumen ini:

1. Menentukan nama final field, key setting, schema, migration, command, job, atau detail scheduler.
2. Menentukan desain final komponen UI.
3. Mengubah flow reject, cancel, payment, pricing, weighing, production, delivery, atau completion.
4. Mengubah aturan self drop-off kecuali ada user need terpisah.
5. Mengubah order yang sudah tidak berada dalam status `requested`.
6. Mengembalikan status order yang sudah terlanjur auto accepted ketika setting berubah.
7. Menentukan final default produk jika ada konflik antara perilaku existing dan arahan stakeholder terbaru.
8. Menentukan metode teknis perhitungan jarak, sumber data maps, atau formula jarak final.

## 5. Kebutuhan Pengguna

### 5.1 Owner Mengatur Lead Time dan Maksimal Jarak Auto Accept

1. Owner dapat memilih kapan auto accept dijalankan untuk outlet tertentu.
2. Pilihan waktu dipahami sebagai selisih waktu sebelum jadwal jemput kurir, bukan durasi sejak order dibuat.
3. Contoh pilihan bisnis yang perlu didukung adalah `30 menit sebelum pickup`, `1 jam sebelum pickup`, dan `2 jam sebelum pickup`.
4. Owner dapat menentukan maksimal jarak order yang boleh auto-accept untuk outlet tertentu.
5. Batas jarak dipahami sebagai jarak order terhadap outlet atau cakupan layanan outlet yang relevan untuk pickup.
6. Contoh kebutuhan bisnis: jika maksimal jarak auto accept adalah `10 km`, order dengan jarak sekitar `20 km` tidak boleh auto accepted walaupun sudah masuk window waktu.
7. Setting berlaku per outlet, bukan global untuk semua outlet.
8. Owner dapat membedakan outlet yang membutuhkan auto accept lebih cepat, outlet yang ingin menunggu lebih dekat ke jadwal pickup, dan outlet yang hanya ingin auto accept untuk jarak tertentu.
9. Jika owner tidak mengatur lead time atau batas jarak khusus untuk outlet, outlet tersebut tetap mengikuti perilaku default auto accept yang sudah ada.

### 5.2 Cashier Menangani Order Masuk

1. Cashier tetap dapat menerima order `requested` secara manual sebelum window auto accept tercapai.
2. Jika cashier sudah menerima order secara manual, sistem tidak memproses order tersebut lagi sebagai auto accepted.
3. Jika order berubah menjadi `accepted` otomatis, cashier tidak perlu menekan tombol Terima untuk order tersebut.
4. Order yang sudah auto accepted tidak lagi dihitung sebagai order baru yang menunggu accept manual.
5. Order yang melebihi batas jarak auto accept tetap dapat ditinjau dan diputuskan manual oleh cashier sesuai flow existing.
6. Saat melihat riwayat order, cashier dapat memahami bahwa perubahan status dilakukan oleh `Sistem otomatis`.

### 5.3 Customer Melihat Status Order

1. Customer membuat order dari aplikasi customer dengan jadwal jemput kurir.
2. Jika order masih `requested`, sudah masuk window lead time outlet, dan jaraknya masih dalam batas maksimal auto accept outlet, customer melihat order berubah menjadi `accepted`.
3. Jika order sudah masuk window waktu tetapi jaraknya melebihi batas maksimal auto accept, order tetap menunggu keputusan manual sesuai flow existing.
4. Setelah order menjadi `accepted`, customer mendapat kepastian bahwa order sudah diterima outlet.
5. Aksi dan tampilan customer setelah auto accept mengikuti aturan existing untuk order yang diterima manual.
6. Customer tidak perlu mengetahui detail pengaturan lead time dan batas jarak outlet, tetapi status order harus tetap jelas.

### 5.4 Courier dan Production Menerima Dampak Flow

1. Order yang auto accepted masuk ke flow courier/production seperti order yang diterima manual.
2. Auto accept tidak mengubah aturan pickup, assignment, weighing, production, atau delivery yang sudah berlaku.
3. Jika accept manual memicu notifikasi atau perubahan status yang relevan untuk courier/production, auto accept perlu memberi konsekuensi bisnis yang setara.

### 5.5 Sistem Mencatat Tindakan Otomatis

1. Sistem mengevaluasi order yang masih `requested` berdasarkan outlet, jadwal pickup, dan jarak order.
2. Sistem hanya mengubah order yang memenuhi aturan menjadi `accepted`.
3. Sistem mencatat perubahan status sebagai tindakan `Sistem otomatis`.
4. Riwayat tidak boleh memberi kesan bahwa cashier, owner, atau employee tertentu melakukan accept manual jika perubahan dilakukan otomatis.
5. Catatan audit perlu cukup jelas untuk kebutuhan operasional, support, dan penelusuran komplain.

## 6. Aturan Bisnis

1. Lead time auto accept adalah pengaturan per outlet.
2. Batas maksimal jarak auto accept adalah pengaturan per outlet.
3. Lead time dihitung mundur dari jadwal pickup order.
4. Contoh: jika jadwal pickup adalah `09:00` dan lead time outlet adalah `1 jam`, order masuk syarat waktu sekitar `08:00`.
5. Contoh: jika jadwal pickup adalah `09:00` dan lead time outlet adalah `30 menit`, order masuk syarat waktu sekitar `08:30`.
6. Order hanya eligible auto accept jika memenuhi syarat waktu dan syarat jarak.
7. Contoh: jika jadwal pickup adalah `09:00`, lead time outlet adalah `1 jam`, dan maksimal jarak adalah `10 km`, order berjarak `8 km` dapat auto accepted sekitar `08:00` jika syarat lain terpenuhi.
8. Contoh: dengan setting waktu yang sama dan maksimal jarak `10 km`, order berjarak `20 km` tidak boleh auto accepted walaupun sudah pukul `08:00`.
9. Auto accept hanya berlaku untuk order customer-app.
10. Auto accept hanya berlaku untuk order dengan status `requested`.
11. Auto accept hanya berlaku jika order memiliki outlet valid.
12. Order yang belum masuk window lead time tidak boleh berubah menjadi `accepted` karena aturan lead time.
13. Order yang melebihi batas jarak maksimal tidak boleh berubah menjadi `accepted` karena auto accept.
14. Order yang jaraknya tidak tersedia atau tidak dapat dipastikan tidak boleh auto accepted berdasarkan aturan jarak, kecuali fallback final produk menyatakan lain.
15. Order yang sudah manual accepted sebelum window lead time tidak diproses ulang.
16. Order yang sudah reject, cancel, atau berubah ke status lain sebelum window lead time tidak diproses otomatis.
17. Jika outlet tidak mengatur lead time atau batas jarak khusus, sistem memakai perilaku default auto accept yang sudah ada.
18. Menonaktifkan atau mengubah setting lead time atau batas jarak tidak mengembalikan order yang sudah terlanjur auto accepted.
19. Perubahan setting hanya memengaruhi order yang masih memenuhi aturan saat evaluasi berjalan.
20. Auto accept tidak boleh berlaku lintas outlet.
21. Status `accepted` dari auto accept harus memiliki konsekuensi bisnis yang sama dengan accept manual.
22. Notifikasi dan status history yang relevan dengan status `accepted` tetap berjalan konsisten dengan accept manual.
23. Kegagalan notifikasi tidak boleh membuat status order ambigu setelah status order berhasil berubah.

## 7. Fallback Default

1. Jika outlet memiliki lead time dan batas jarak khusus, kedua aturan tersebut menjadi acuan untuk order eligible.
2. Jika outlet hanya memiliki salah satu setting khusus, implementation plan perlu menentukan apakah setting yang belum diisi memakai default existing atau membuat auto accept tidak berlaku untuk order tersebut.
3. Jika outlet tidak memiliki lead time atau batas jarak khusus, sistem tidak boleh berhenti memproses auto accept sepenuhnya hanya karena setting baru belum diisi.
4. Dalam kondisi tanpa setting khusus, sistem tetap memakai perilaku default auto accept yang sudah ada.
5. Default ini perlu difinalkan pada implementation plan berikutnya karena dokumen lama menyebut aturan berbasis 24 jam sejak order dibuat, sedangkan stakeholder terbaru meminta opsi berbasis jadwal pickup dan batas jarak.
6. Keputusan final default harus mengikuti arahan stakeholder terbaru dan mempertimbangkan kompatibilitas perilaku existing.

## 8. Dampak Bisnis

1. Order yang auto accepted berubah status dari `requested` menjadi `accepted`.
2. Status `accepted` dari auto accept diperlakukan sama seperti status `accepted` dari accept manual.
3. Customer melihat order sebagai diterima.
4. Cashier tidak lagi melihat order tersebut sebagai order baru yang perlu diterima manual.
5. Order masuk ke flow courier/production sesuai aturan existing.
6. Notifikasi status accepted tetap berjalan jika pada accept manual notifikasi tersebut memang relevan.
7. Status history tetap mencatat perubahan status.
8. Aktor perubahan pada riwayat adalah `Sistem otomatis`.
9. Order yang terlalu jauh tetap membutuhkan review manual sehingga outlet tidak otomatis mengambil komitmen operasional di luar batas layanan yang diatur owner.

## 9. Edge Cases

1. Order tidak memiliki jadwal pickup.
   - Order tidak dapat dievaluasi dengan aturan lead time pickup. Sistem perlu memakai aturan fallback atau membiarkan order tetap mengikuti flow manual sesuai perilaku default yang difinalkan.
2. Outlet tidak mengatur lead time khusus.
   - Sistem memakai perilaku default auto accept yang sudah ada.
3. Setting auto accept dimatikan untuk outlet.
   - Order `requested` tetap menunggu accept manual selama setting tidak aktif, kecuali ada perilaku default lain yang memang berlaku pada outlet tersebut.
4. Order belum masuk window lead time.
   - Order tetap `requested` dan cashier masih dapat melakukan accept manual.
5. Order sudah masuk window lead time tetapi melebihi batas jarak maksimal.
   - Order tetap `requested` dan perlu keputusan manual sesuai flow existing.
6. Jarak order tidak tersedia atau tidak dapat dipastikan.
   - Order tidak diproses auto accept berdasarkan aturan jarak sampai fallback final produk ditentukan.
7. Outlet tidak mengatur batas jarak khusus.
   - Sistem memakai perilaku default auto accept yang sudah ada atau default jarak yang difinalkan pada implementation plan.
8. Owner mengubah batas jarak setelah order dibuat.
   - Perubahan hanya memengaruhi order yang masih memenuhi aturan saat evaluasi berikutnya berjalan.
9. Order sudah manual accepted sebelum window lead time.
   - Order tidak diproses ulang oleh auto accept.
10. Order sudah reject atau cancel sebelum window lead time.
   - Order tidak diproses otomatis.
11. Order berubah ke status lain karena proses manual atau flow lain.
   - Order tidak diproses otomatis selama statusnya bukan `requested`.
12. Order customer-app tidak memiliki outlet valid.
   - Order tidak boleh diproses lintas outlet atau tanpa konteks outlet yang jelas.
13. Owner mengubah lead time setelah order dibuat.
   - Perubahan hanya memengaruhi order yang masih memenuhi aturan saat evaluasi berikutnya berjalan.
14. Owner menonaktifkan setting setelah ada order yang sudah auto accepted.
    - Status order yang sudah `accepted` tidak dikembalikan.
15. Evaluasi berjalan berulang.
    - Order yang sudah bukan `requested` tidak boleh diproses ulang.
16. Notifikasi gagal terkirim.
    - Status order yang sudah berhasil berubah tetap menjadi sumber kebenaran saat customer membuka ulang aplikasi.

## 10. Acceptance Criteria

1. Owner dapat memilih lead time auto accept per outlet, seperti `30 menit`, `1 jam`, atau `2 jam` sebelum jadwal pickup.
2. Owner dapat mengatur batas maksimal jarak auto accept per outlet.
3. Order customer-app berstatus `requested` dengan outlet valid berubah menjadi `accepted` ketika sudah masuk window lead time outlet dan jaraknya berada dalam batas maksimal.
4. Order customer-app berstatus `requested` yang belum masuk window lead time tidak berubah otomatis.
5. Order customer-app berstatus `requested` yang sudah masuk window lead time tetapi melebihi batas jarak maksimal tidak berubah otomatis.
6. Order dengan jarak sekitar `20 km` tidak auto accepted jika outlet mengatur maksimal jarak di bawah jarak tersebut.
7. Order yang sudah manual accepted sebelum window lead time tidak diproses ulang.
8. Order yang sudah reject, cancel, atau berubah ke status lain tidak diproses otomatis.
9. Order tanpa outlet valid tidak diproses oleh auto accept lintas outlet.
10. Jika outlet tidak memiliki lead time atau batas jarak khusus, perilaku default auto accept yang sudah ada tetap berjalan sesuai keputusan default final.
11. Status customer setelah auto accept sama dengan order yang diterima manual.
12. Order yang auto accepted masuk ke flow courier/production sesuai konsekuensi bisnis accept manual.
13. Count atau daftar order yang menunggu accept manual tidak lagi memuat order yang sudah auto accepted.
14. Notifikasi yang relevan dengan status `accepted` tetap berjalan konsisten dengan accept manual.
15. Status history mencatat perubahan dari `requested` ke `accepted`.
16. Riwayat/status order menunjukkan aktor perubahan sebagai `Sistem otomatis`.
17. Scheduler atau evaluasi berulang tidak menyebabkan order yang sama diproses lebih dari sekali.
18. Menonaktifkan atau mengubah lead time atau batas jarak tidak mengembalikan order yang sudah terlanjur `accepted`.

## 11. Konflik dengan User Need Lama

1. `auto_accept_order_user_need.md` mendefinisikan Auto Accept Order v1 berbasis 24 jam sejak order dibuat.
2. Dokumen lama juga menyatakan auto accept berdasarkan jadwal pickup berada di luar scope v1.
3. Stakeholder terbaru meminta opsi berbasis lead time sebelum jadwal pickup dan batas maksimal jarak.
4. Karena itu, dokumen ini harus diperlakukan sebagai kebutuhan lanjutan dengan prioritas arahan stakeholder terbaru.
5. Implementation plan berikutnya perlu memilih perilaku final default secara eksplisit:
   - apakah fallback tetap memakai aturan 24 jam dari dokumen lama,
   - apakah fallback mengikuti perilaku auto accept existing di kode saat ini,
   - atau apakah stakeholder memutuskan default baru berbasis jadwal pickup dan batas jarak.
6. Keputusan tersebut perlu dicatat pada implementation plan agar tidak ada dua aturan default yang saling bertentangan.

## 12. Assumptions

1. Permintaan stakeholder terbaru dianggap lebih tinggi prioritasnya daripada batasan v1 pada dokumen lama.
2. Lead time yang dimaksud adalah jarak waktu sebelum jadwal jemput kurir, bukan setelah order dibuat.
3. Batas jarak yang dimaksud adalah batas bisnis untuk menentukan apakah order masih layak diterima otomatis oleh outlet.
4. Dokumen ini tidak menentukan metode teknis perhitungan jarak; implementation plan perlu memakai sumber jarak yang paling konsisten dengan flow order existing.
5. Auto accept berdasarkan lead time dan jarak hanya berlaku untuk order customer-app yang masih `requested`.
6. Order yang sudah di-accept/reject/cancel/manual-process tidak boleh berubah karena proses auto accept.
7. `Sistem otomatis` adalah label bisnis untuk membedakan tindakan otomatis dari employee.
8. Perilaku default ketika lead time atau batas jarak belum diatur perlu difinalkan pada implementation plan berikutnya.
9. Detail implementasi penyimpanan setting, audit, event, scheduler, atau queue akan ditentukan setelah user need ini disetujui.

## 13. Non-Goals

1. Dokumen ini tidak menentukan struktur database atau migration.
2. Dokumen ini tidak menentukan nama field, key setting, command, job, scheduler frequency, service, event, atau payload teknis final.
3. Dokumen ini tidak menentukan desain final halaman, komponen, atau wording UI final.
4. Dokumen ini tidak mengubah flow payment, pricing, weighing, pickup, production, delivery, completion, reject, atau cancel.
5. Dokumen ini tidak mengatur auto assignment courier.
6. Dokumen ini tidak menentukan metode teknis perhitungan jarak, integrasi maps, geocoding, atau routing.
7. Dokumen ini tidak mengganti seluruh isi `auto_accept_order_user_need.md`; dokumen ini mencatat kebutuhan baru yang harus diselaraskan pada tahap implementation plan.

## 14. Catatan untuk Penyusun Implementation Plan

1. Plan perlu memperlakukan dokumen ini sebagai addendum terhadap user need lama.
2. Plan perlu menyelesaikan konflik default antara aturan 24 jam sejak order dibuat, aturan lead time sebelum jadwal pickup, dan batas maksimal jarak.
3. Plan perlu menjaga scope agar hanya order customer-app `requested` dengan outlet valid yang eligible.
4. Plan perlu memastikan accept otomatis memiliki dampak bisnis yang sama dengan accept manual.
5. Plan perlu memastikan order yang sudah berubah status tidak diproses ulang.
6. Plan perlu memastikan status history dan audit tidak salah mengatribusikan perubahan otomatis kepada employee.
7. Plan perlu menyebutkan keputusan produk untuk order tanpa jadwal pickup, order tanpa data jarak, outlet tanpa lead time khusus, dan outlet tanpa batas jarak khusus.
8. Plan perlu menentukan sumber jarak yang digunakan secara konsisten dengan data order existing tanpa mengubah user need ini menjadi desain teknis.

## Status

Draft user need siap dijadikan dasar implementation plan lanjutan.
