# User Need: Auto Accept Order per Outlet

Tanggal: 2026-06-13

Dokumen ini menjadi acuan user need untuk fitur **Auto Accept Order**. Fokus dokumen adalah kebutuhan pengguna, aturan bisnis, dampak modul, edge cases, acceptance criteria, dan asumsi produk. Dokumen ini tidak membahas solusi teknis final, desain database, command, job, scheduler detail, atau implementation plan.

## 1. Latar Belakang

Customer dapat membuat order dari aplikasi customer. Untuk order pickup atau kurir, order masuk ke outlet dengan status `requested` dan perlu diterima oleh cashier agar customer mendapat kepastian bahwa pesanan sudah diterima outlet.

Dalam operasional outlet, ada kemungkinan order `requested` dibiarkan terlalu lama karena cashier belum membuka aplikasi atau belum menekan tombol Terima. Owner membutuhkan kontrol per outlet agar order customer-app yang masih menunggu dapat diterima otomatis setelah batas waktu tertentu, tanpa mengubah perilaku semua outlet secara global.

Kebutuhan ini dikunci sebagai konfigurasi per outlet yang diatur Owner dari halaman detail outlet pada tab `Pengaturan`.

## 2. Tujuan

1. Owner dapat mengaktifkan atau menonaktifkan Auto Accept Order per outlet.
2. Default Auto Accept Order adalah nonaktif agar perilaku outlet existing tidak berubah tanpa keputusan owner.
3. Order customer-app berstatus `requested` yang tetap tidak berubah selama 24 jam sejak dibuat dapat berubah menjadi `accepted` secara otomatis jika outlet mengaktifkan setting.
4. Auto accept hanya berlaku untuk outlet yang mengaktifkan setting tersebut.
5. Auto accept memberi konsekuensi bisnis yang sama dengan accept manual untuk status customer, count order baru, dan notifikasi terkait status accepted.
6. Riwayat order dan komunikasi ke user membedakan auto accept sebagai tindakan `Sistem otomatis`, bukan tindakan cashier atau owner.

## 3. Aktor

1. `owner`
   Mengatur Auto Accept Order pada outlet yang dimiliki.
2. `cashier`
   Melihat order yang masih perlu diterima manual dan tidak perlu menerima ulang order yang sudah auto accepted.
3. `customer`
   Membuat order dari customer app dan melihat status order berubah menjadi accepted ketika auto accept terjadi.
4. `courier atau production user`
   Menerima dampak downstream dari order yang sudah accepted sesuai flow pickup atau courier existing.
5. `sistem`
   Mengevaluasi order yang memenuhi aturan dan mencatat perubahan sebagai tindakan otomatis.

## 4. Kondisi Saat Ini

1. Aplikasi memakai monorepo Flutter dan Laravel:
   - `apps/customer`
   - `apps/cashier`
   - `apps/production`
   - shared packages
   - backend Laravel/Inertia di `webapp/wash_wallet_be`
2. Customer membuat order melalui API customer, lalu backend menyimpan order dengan `source = customer_app`.
3. Order customer dengan alur pickup atau kurir masuk sebagai status `requested`.
4. Order customer dengan alur self drop-off masuk sebagai status `pending_dropoff`.
5. Cashier dapat menerima order secara manual melalui endpoint accept.
6. Accept manual saat ini mengubah `requested` menjadi `accepted`.
7. Accept manual untuk `pending_dropoff` mengubah order menjadi `received`, sehingga status tersebut berbeda dari cakupan Auto Accept Order v1.
8. Setelah accept manual dari `requested` ke `accepted`, sistem sudah memiliki efek lanjutan seperti notifikasi status ke customer dan notifikasi pickup ke courier jika order memenuhi kriteria.
9. Scheduler dan queue sudah tersedia untuk fitur lain, tetapi belum ada mekanisme Auto Accept Order.
10. Detail outlet sudah memiliki tab `Pengaturan`, dengan setting seperti Notifikasi WhatsApp Otomatis dan COD.
11. Data setting outlet masih memiliki gap konsistensi: model dan migration memakai relasi `setting_id`, sementara beberapa service/resource/UI mengakses setting berdasarkan `key` atau bentuk data yang berbeda.
12. Belum ada setting Auto Accept Order, aturan 24 jam untuk auto accept, atau status history/audit khusus yang menandai perubahan otomatis oleh sistem.

## 5. Scope Kebutuhan

Scope utama:

1. Konfigurasi Auto Accept Order pada level outlet.
2. Pengaturan dilakukan Owner dari halaman Show Outlet tab `Pengaturan`.
3. Default Auto Accept Order adalah nonaktif.
4. Evaluasi hanya untuk order customer-app dengan status `requested`.
5. Batas waktu 24 jam dihitung sejak order dibuat.
6. Perubahan otomatis dari `requested` menjadi `accepted`.
7. Pembedaan aktor perubahan sebagai `Sistem otomatis`.
8. Dampak ke count order baru cashier, tampilan status customer, notifikasi, dan riwayat status order.

Di luar scope v1:

1. Auto accept untuk order `pending_dropoff`.
2. Auto accept untuk order yang dibuat langsung dari cashier/POS.
3. Auto accept berdasarkan `pickup_schedule`.
4. Perubahan status selain `requested` ke `accepted`.
5. Perubahan payment flow, pricing, weighing, production processing, atau assignment courier.
6. Pengembalian status order yang sudah terlanjur auto accepted ketika setting dimatikan.
7. Dokumen ini tidak menentukan schema, command, job, scheduler, service class, event, atau detail implementasi teknis final.

## 6. Kebutuhan Pengguna

### 6.1 Owner Mengatur Auto Accept Order

1. Owner membuka detail outlet.
2. Owner masuk ke tab `Pengaturan`.
3. Owner melihat setting **Auto Accept Order** bersama setting outlet lain.
4. Owner dapat mengaktifkan Auto Accept Order untuk outlet tersebut.
5. Owner dapat menonaktifkan Auto Accept Order untuk outlet tersebut.
6. Setting tersimpan per outlet, bukan global.
7. Copy setting perlu menjelaskan bahwa order customer-app yang masih `requested` setelah 24 jam sejak dibuat akan diterima otomatis.
8. Default setting untuk outlet existing dan outlet baru adalah nonaktif.

### 6.2 Cashier Melihat Order Masuk

1. Jika Auto Accept Order nonaktif, cashier tetap menerima order `requested` secara manual seperti perilaku existing.
2. Jika Auto Accept Order aktif dan order sudah auto accepted, cashier tidak perlu menekan tombol Terima untuk order tersebut.
3. Order yang sudah menjadi `accepted` otomatis tidak lagi dihitung sebagai order baru atau order menunggu accept manual.
4. Cashier perlu dapat melihat bahwa perubahan status accepted terjadi oleh sistem otomatis jika membuka riwayat order.

### 6.3 Customer Melihat Status Order

1. Customer membuat order dari aplikasi customer.
2. Jika order tetap `requested` selama 24 jam sejak dibuat dan outlet mengaktifkan Auto Accept Order, customer melihat status order berubah menjadi accepted.
3. Setelah order menjadi accepted otomatis, customer tidak lagi berada pada kondisi order baru yang masih menunggu accept outlet.
4. Jika aturan batal order bergantung pada status, order yang sudah auto accepted mengikuti aturan status `accepted` yang sama dengan accept manual.
5. Customer tidak perlu mengetahui detail teknis proses otomatis, tetapi komunikasi status harus jelas bahwa order sudah diterima.

### 6.4 Sistem Mencatat Tindakan Otomatis

1. Riwayat/status order harus menunjukkan perubahan dari `requested` ke `accepted`.
2. Perubahan harus terlihat sebagai tindakan `Sistem otomatis`.
3. Riwayat tidak boleh memberi kesan bahwa cashier, owner, atau employee tertentu melakukan accept manual jika perubahan dilakukan otomatis.
4. Informasi ini diperlukan untuk audit, dukungan customer service, dan transparansi operasional outlet.

## 7. Aturan Bisnis

1. Auto Accept Order adalah pengaturan per outlet.
2. Default Auto Accept Order adalah nonaktif.
3. Auto Accept Order hanya berlaku untuk order dengan `source = customer_app`.
4. Auto Accept Order hanya berlaku untuk order dengan status `requested`.
5. Patokan 24 jam dihitung sejak order dibuat.
6. `created_at` atau waktu pembuatan order menjadi acuan bisnis, bukan `pickup_schedule`.
7. Order yang statusnya masih `requested` setelah 24 jam sejak dibuat dapat berubah menjadi `accepted` otomatis jika outlet pemilik order mengaktifkan setting.
8. Order yang sudah berubah status sebelum 24 jam tidak boleh diproses otomatis.
9. Status yang sudah berubah sebelum 24 jam mencakup manual accept, reject/cancel, pickup, received, atau status lain.
10. Order `pending_dropoff` tidak termasuk cakupan Auto Accept Order v1.
11. Order yang dibuat dari cashier/POS tidak termasuk cakupan Auto Accept Order v1.
12. Auto accept tidak boleh berlaku lintas outlet.
13. Setting outlet A tidak memengaruhi order outlet B.
14. Menonaktifkan Auto Accept Order tidak mengembalikan order yang sudah terlanjur auto accepted.
15. Perubahan setting setelah order dibuat hanya memengaruhi order yang masih memenuhi aturan saat evaluasi dilakukan.
16. Auto accept harus mengikuti konsekuensi bisnis accept manual untuk status `accepted`.
17. Efek notifikasi yang relevan dengan status accepted tetap terjadi seperti pada accept manual.
18. Kegagalan notifikasi tidak boleh membuat status order ambigu bagi customer setelah status berhasil berubah.

## 8. Dampak Modul

### 8.1 Owner Web Dashboard

1. Tab `Pengaturan` pada detail outlet perlu menampilkan status konfigurasi Auto Accept Order.
2. Setting Auto Accept Order perlu tampil bersama setting outlet lain seperti WhatsApp otomatis dan COD.
3. Owner perlu memahami status aktif/nonaktif setting dengan jelas.

### 8.2 Order Management Cashier

1. Count order baru cashier akan berkurang setelah order berubah menjadi `accepted` otomatis.
2. Daftar order yang difilter sebagai `requested` tidak lagi memuat order yang sudah auto accepted.
3. Tombol Terima tidak perlu muncul sebagai aksi utama untuk order yang sudah accepted otomatis.

### 8.3 Customer App

1. Customer melihat status order sebagai accepted setelah auto accept.
2. Detail order perlu mengikuti aturan tampilan dan aksi untuk status `accepted`.
3. Aksi customer yang hanya berlaku saat status `requested`, seperti batal sebelum diterima, tidak lagi berlaku setelah auto accept jika aturan existing demikian.

### 8.4 Courier dan Production Flow

1. Order `accepted` tetap menjadi input flow pickup/courier yang sudah ada.
2. Auto accept tidak mengubah aturan permission courier, pickup, arrival, weighing, atau production.
3. Jika notifikasi pickup relevan untuk accept manual, auto accept perlu memberikan efek status accepted yang setara.

### 8.5 Notification dan Audit

1. Notifikasi status accepted yang relevan tetap terjadi.
2. Status history perlu membedakan tindakan otomatis dari tindakan employee.
3. Copy atau metadata audit perlu cukup jelas untuk customer support dan owner ketika menelusuri order.

### 8.6 Scheduler, Queue, dan Configuration

1. Codebase sudah memiliki kemampuan scheduler dan queue untuk fitur lain.
2. Mekanisme Auto Accept Order belum tersedia saat dokumen ini dibuat.
3. Dokumen ini hanya mencatat kebutuhan kapabilitas, bukan menentukan mekanisme teknis final.

## 9. Edge Cases

1. Setting Auto Accept Order nonaktif.
   - Order `requested` tetap menunggu accept manual walaupun sudah lebih dari 24 jam.
2. Setting Auto Accept Order aktif setelah order dibuat.
   - Order yang masih memenuhi aturan saat evaluasi dilakukan boleh terdampak setting tersebut.
3. Setting Auto Accept Order dimatikan setelah order dibuat.
   - Order yang belum berubah otomatis tidak boleh auto accepted selama setting nonaktif saat evaluasi.
4. Order sudah manual accepted sebelum 24 jam.
   - Order tidak diproses ulang oleh Auto Accept Order.
5. Order ditolak atau dibatalkan sebelum 24 jam.
   - Order tidak diproses otomatis.
6. Order masuk status `pending_dropoff`.
   - Order tidak berubah otomatis pada v1.
7. Order customer-app tidak memiliki data outlet yang valid.
   - Order tidak boleh diproses lintas outlet atau tanpa konteks outlet yang jelas.
8. Outlet menonaktifkan Auto Accept Order setelah ada order yang sudah auto accepted.
   - Status order yang sudah accepted tidak dikembalikan.
9. Notifikasi gagal terkirim.
   - Status order yang sudah berhasil berubah tetap menjadi sumber kebenaran bagi customer saat membuka ulang aplikasi.
10. Evaluasi berjalan berulang.
   - Order yang sudah bukan `requested` tidak boleh diproses ulang.

## 10. Acceptance Criteria

1. Owner melihat setting Auto Accept Order di tab `Pengaturan` pada detail outlet.
2. Setting default Auto Accept Order adalah nonaktif.
3. Jika setting nonaktif, order `requested` tetap menunggu accept manual walaupun sudah lebih dari 24 jam.
4. Jika setting aktif, order customer-app `requested` yang masih `requested` setelah 24 jam sejak dibuat menjadi `accepted`.
5. Order `requested` yang sudah manual accept sebelum 24 jam tidak diproses ulang.
6. Order `requested` yang sudah reject atau cancel sebelum 24 jam tidak diproses otomatis.
7. Order yang berubah ke status lain sebelum 24 jam tidak diproses otomatis.
8. Order `pending_dropoff` tidak berubah otomatis pada v1.
9. Auto accepted order tidak lagi muncul dalam count order baru cashier.
10. Customer melihat status order sebagai accepted setelah auto accept.
11. Riwayat/status order menunjukkan perubahan dilakukan oleh `Sistem otomatis`.
12. Efek notifikasi yang relevan dengan status accepted tetap terjadi seperti pada accept manual.
13. Auto accept hanya berlaku untuk outlet yang mengaktifkan setting tersebut.
14. Auto accept tidak memproses order outlet lain.
15. Perubahan setting setelah order dibuat hanya memengaruhi order yang masih memenuhi aturan saat evaluasi dilakukan.
16. Menonaktifkan setting tidak mengembalikan order yang sudah terlanjur accepted otomatis.
17. Order yang sudah auto accepted mengikuti aturan bisnis status `accepted`, termasuk aturan tampilan dan aksi pada customer app dan cashier app.

## 11. Assumptions

1. "Tidak berubah selama 24 jam" berarti status order masih `requested` sejak order dibuat.
2. Waktu pembuatan order menjadi acuan bisnis 24 jam.
3. Auto Accept Order v1 tidak mencakup self drop-off `pending_dropoff`.
4. Auto accept berlaku untuk customer-app order, bukan cashier/POS order.
5. Istilah `Sistem otomatis` adalah label bisnis untuk membedakan aktor otomatis dari employee.
6. Detail implementasi penyimpanan audit, event, job, scheduler, atau queue akan ditentukan pada tahap implementation plan.

## 12. Non-Goals

1. Dokumen ini tidak merancang database atau migration.
2. Dokumen ini tidak menentukan nama setting final, key final, command, job, scheduler frequency, service, event, atau payload teknis final.
3. Dokumen ini tidak mengubah flow self drop-off.
4. Dokumen ini tidak mengubah flow reject/cancel.
5. Dokumen ini tidak mengubah flow pricing, weighing, payment, pickup, production, delivery, atau completion.
6. Dokumen ini tidak mengatur auto assignment courier.
7. Dokumen ini tidak membahas SLA outlet selain batas 24 jam Auto Accept Order.

## 13. Catatan untuk Penyusun Plan

1. Plan perlu menjaga default nonaktif agar outlet existing tidak berubah perilakunya tanpa keputusan owner.
2. Plan perlu menyelaraskan bentuk data setting outlet karena kondisi saat ini masih memiliki gap antara relasi `setting_id` dan akses berdasarkan `key`.
3. Plan perlu memastikan efek `accepted` dari auto accept konsisten dengan accept manual untuk customer, cashier count, courier/production flow, notification, dan audit.
4. Plan perlu memastikan status history tidak salah mengatribusikan perubahan otomatis kepada employee tertentu.
5. Plan perlu menjaga scope v1 agar `pending_dropoff` tidak ikut berubah otomatis.
6. Plan perlu memastikan perubahan setting hanya bekerja pada order yang masih memenuhi aturan saat evaluasi dilakukan.

## Status

Draft user need siap dijadikan dasar implementation plan.
