# User Need: Koreksi Item Pesanan Saat Cashier Menimbang

Tanggal: 2026-06-11

## 1. Latar Belakang

Saat customer membuat order, item yang dipilih masih berdasarkan asumsi customer terhadap jenis cucian dan layanan yang dibutuhkan. Pada praktik operasional laundry, isi cucian aktual baru benar-benar diketahui ketika cucian sampai outlet dan cashier melakukan penimbangan.

Contoh kasus:

1. Customer memilih kategori pakaian dengan layanan cuci kering.
2. Saat cashier membuka kantong cucian, terdapat jaket tebal.
3. Jaket tersebut seharusnya masuk kategori atau layanan berbeda, dengan unit, harga, dan proses produksi yang berbeda.
4. Jika cashier hanya bisa mengubah quantity item lama, order final tetap salah karena layanan yang dihitung tidak sesuai dengan cucian fisik.

Cashier membutuhkan kontrol penuh pada tahap timbang untuk menjadikan item awal dari customer sebagai draft awal, lalu mengoreksinya menjadi daftar item aktual sebelum harga final dihitung dan order masuk production.

Dokumen ini menjadi acuan user need untuk AI model lain saat menyusun implementation plan. Dokumen ini fokus pada kebutuhan bisnis, alur pengguna, kontrak API yang diharapkan, aturan validasi, dan acceptance criteria. Detail teknis final seperti struktur state management Flutter, perubahan service backend, migration, resource, atau test implementation ditentukan pada dokumen plan.

## 2. Tujuan

1. Memastikan daftar item order final sesuai dengan cucian fisik aktual yang diterima outlet.
2. Memberi cashier kemampuan menambah, mengganti, menghapus, dan mengubah quantity item saat penimbangan.
3. Menghitung ulang harga final order berdasarkan item aktual hasil timbang.
4. Menghitung ulang pemakaian paket atau quota membership sesuai layanan aktual, bukan pilihan awal customer.
5. Memastikan customer melihat harga final setelah penimbangan.
6. Memastikan production hanya menerima item yang sudah dikoreksi dan disimpan oleh cashier.
7. Mempertahankan transisi status timbang existing ke `ready_to_process`.

## 3. Aktor

1. `cashier employee`
   Menimbang order yang sudah sampai outlet, mengoreksi daftar item, dan menyimpan harga final.
2. `customer`
   Membuat order awal dan melihat harga final setelah cashier selesai menimbang.
3. `production employee`
   Mengerjakan order setelah status menjadi `ready_to_process` dan menggunakan daftar item hasil timbang.
4. `backend`
   Memvalidasi layanan outlet, quantity, minimum layanan, paket/quota, harga final, dan status order.
5. `system notification`
   Mengirim notifikasi harga/status setelah order selesai ditimbang mengikuti flow existing.

## 4. Scope Kebutuhan

Scope utama:

1. Halaman timbang order cashier untuk status `received`.
2. Koreksi daftar item pada tahap timbang:
   - tambah layanan baru,
   - ganti layanan item lama,
   - hapus item,
   - ubah quantity atau berat aktual,
   - ubah catatan per item.
3. Catatan umum customer dan catatan internal saat penimbangan.
4. Penghitungan ulang subtotal, total, remaining amount, dan payment status berdasarkan harga final.
5. Penghitungan ulang pemakaian paket atau quota membership customer berdasarkan layanan aktual.
6. Validasi backend agar layanan yang dipilih aktif dan berasal dari outlet order yang sama.
7. Penyimpanan foto bukti timbang sebagai field opsional seperti flow existing.

Di luar scope:

1. Redesign menyeluruh halaman detail order cashier.
2. Perubahan flow pickup sebelum status `received`.
3. Perubahan flow production setelah order masuk `ready_to_process`, selain memastikan production menerima item hasil koreksi.
4. Perubahan metode pembayaran, Midtrans, wallet, atau settlement selain penyesuaian total dan remaining amount akibat harga final timbang.
5. Perubahan master data layanan, kategori, atau paket di dashboard owner.

## 5. Kondisi Saat Ini

Berdasarkan eksplorasi repo:

1. UI timbang ada di `apps/cashier/lib/features/order/presentation/screens/weigh_order_screen.dart`.
2. Entry point tombol ada di detail order cashier dengan label `Timbang Pesanan`.
3. Endpoint timbang mobile cashier memakai `POST /api/mobile/cashier/orders/{id}/weigh`.
4. Payload timbang dari cashier saat ini mengirim `quantity` dan `itemNotes` per item, tanpa `laundryServiceId`.
5. `WeighItemData` di aplikasi cashier belum membawa identitas layanan, diskon, atau pemakaian paket.
6. Backend request `App\Http\Requests\Order\WeightOrderRequest` saat ini memvalidasi `orderItems.*.quantity` dan `orderItems.*.itemNotes`, tetapi belum memvalidasi `orderItems.*.laundryServiceId`.
7. `OrderService::weight()` saat ini memperbarui item berdasarkan index item lama dari order, bukan mengganti daftar item berdasarkan item aktual hasil koreksi cashier.
8. Flow pembuatan order cashier sudah memiliki pola pemilihan layanan dan perhitungan harga/quota yang dapat menjadi referensi saat menyusun plan.

Gap utama:

1. Cashier belum bisa mengganti layanan item yang salah.
2. Cashier belum bisa menambah layanan baru saat timbang.
3. Cashier belum bisa menghapus item yang tidak sesuai.
4. Backend belum menerima daftar item lengkap sebagai sumber kebenaran hasil timbang.
5. Harga final masih bergantung pada item lama, sehingga tidak cukup untuk kasus item aktual berbeda dari pilihan customer.

## 6. Istilah Bisnis

### Item Awal Customer

Daftar item yang dipilih customer saat membuat order. Pada halaman timbang, item ini harus diperlakukan sebagai draft awal, bukan data final yang wajib dipertahankan.

### Item Aktual Hasil Timbang

Daftar item final yang disimpan cashier setelah mencocokkan order dengan cucian fisik. Item ini menjadi sumber harga final, quota usage, detail order, cetak nota, dan pekerjaan production.

### Layanan Aktif Outlet

Layanan laundry yang:

1. masih aktif,
2. dimiliki oleh outlet order tersebut,
3. boleh digunakan pada konteks order cashier,
4. memiliki unit, harga, dan aturan minimum quantity yang valid.

### Harga Final Timbang

Total order setelah cashier menyimpan item aktual hasil timbang. Harga ini menggantikan estimasi atau asumsi awal dari customer.

### Paket atau Quota Membership

Hak layanan customer yang dapat mengurangi biaya atau memakai quota tertentu. Pada tahap timbang, pemakaian quota harus dihitung ulang terhadap item aktual dan mengikuti pola perhitungan pada flow pembuatan order cashier.

## 7. Kebutuhan Pengguna

### 7.1 Cashier Melihat Item Awal sebagai Draft

Saat cashier membuka halaman timbang dari order berstatus `received`, sistem menampilkan item yang dipilih customer sebagai draft awal.

Kebutuhan:

1. Cashier dapat melihat kategori, layanan, unit, quantity awal, harga satuan, subtotal, dan catatan item.
2. Cashier memahami bahwa daftar ini dapat dikoreksi sesuai cucian fisik.
3. Cashier tidak perlu mengulang input dari nol jika item awal sudah benar.
4. Perubahan draft hanya menjadi final setelah cashier menekan simpan dan backend berhasil memproses timbang.

### 7.2 Cashier Mengganti Layanan Item yang Salah

Cashier dapat mengganti kategori atau layanan pada item yang sudah ada jika layanan awal tidak sesuai dengan cucian aktual.

Kebutuhan:

1. Cashier membuka pemilihan layanan dari item yang ingin dikoreksi.
2. Daftar layanan yang muncul berasal dari layanan aktif outlet yang sama.
3. Setelah layanan dipilih, sistem memperbarui:
   - nama kategori,
   - nama layanan,
   - unit,
   - harga satuan,
   - minimum quantity,
   - subtotal item,
   - estimasi total order.
4. Catatan item dapat dipertahankan atau diedit setelah layanan berubah.
5. Jika layanan baru memiliki minimum quantity lebih besar dari quantity saat ini, sistem harus meminta cashier menyesuaikan quantity atau menampilkan validasi yang jelas.

### 7.3 Cashier Menambah Item Layanan Baru

Cashier dapat menambah item layanan baru saat ditemukan cucian yang tidak ada di pilihan awal customer.

Kebutuhan:

1. Halaman timbang menyediakan aksi tambah item atau tambah layanan.
2. Cashier dapat memilih layanan aktif outlet yang sama.
3. Setelah layanan dipilih, item baru masuk ke draft timbang.
4. Cashier mengisi quantity aktual dan catatan item bila diperlukan.
5. Subtotal dan total estimasi berubah realtime setelah item baru ditambahkan.

### 7.4 Cashier Menghapus Item yang Tidak Sesuai

Cashier dapat menghapus item dari draft timbang jika item tersebut tidak ada dalam cucian fisik atau digantikan oleh layanan lain.

Kebutuhan:

1. Item yang dihapus tidak ikut harga final.
2. Item yang dihapus tidak dikirim ke production.
3. Jika cashier menghapus semua item, sistem menolak simpan.
4. Pesan validasi harus jelas, misalnya `Minimal harus ada 1 item`.

### 7.5 Cashier Mengubah Quantity atau Berat Aktual

Cashier dapat mengubah quantity atau berat tiap item berdasarkan hasil timbang aktual.

Kebutuhan:

1. Quantity wajib lebih dari 0.
2. Quantity mengikuti minimum quantity layanan jika layanan memiliki batas minimum.
3. Unit quantity mengikuti layanan yang dipilih, misalnya kg, pcs, atau unit lain yang sudah ada pada master layanan.
4. Subtotal item dan total estimasi berubah realtime saat quantity berubah.
5. Backend tetap menjadi sumber validasi akhir quantity dan minimum layanan.

### 7.6 Cashier Mengisi Catatan

Cashier dapat memberi catatan untuk memperjelas kondisi cucian.

Kebutuhan:

1. Catatan per item tetap tersedia untuk detail cucian spesifik, misalnya `Jaket tebal`.
2. Catatan umum order tetap tersedia untuk informasi yang relevan bagi customer atau order.
3. Catatan internal tetap tersedia untuk kebutuhan outlet dan tidak harus ditampilkan ke customer jika pola existing membedakan catatan internal.
4. Foto bukti timbang tetap opsional dan tetap tersimpan seperti flow saat ini.

### 7.7 Customer Melihat Harga Final Setelah Timbang

Customer harus melihat harga final setelah cashier menyimpan hasil timbang.

Kebutuhan:

1. Customer tidak boleh melihat harga asumsi awal sebagai harga final jika order belum ditimbang.
2. Setelah timbang berhasil, customer melihat total final dari item aktual hasil timbang.
3. Jika payment status sebelumnya `not_yet_priced`, sistem mengubahnya mengikuti flow timbang existing sehingga customer dapat melanjutkan pembayaran bila diperlukan.
4. Jika sudah ada paid amount, paid amount tidak dihapus otomatis.
5. Remaining amount harus mencerminkan selisih antara total final dan paid amount existing.

### 7.8 Production Menerima Item Hasil Koreksi

Production hanya boleh bekerja berdasarkan item aktual yang sudah disimpan cashier.

Kebutuhan:

1. Setelah timbang berhasil, order masuk status `ready_to_process`.
2. Daftar item pada detail order production sama dengan hasil koreksi cashier.
3. Item yang dihapus cashier tidak muncul sebagai pekerjaan production.
4. Item baru yang ditambahkan cashier muncul sebagai pekerjaan production sesuai layanan dan proses produksinya.

## 8. Alur Bisnis yang Diharapkan

### 8.1 Membuka Halaman Timbang

1. Order sudah sampai outlet dan berstatus `received`.
2. Cashier membuka detail order.
3. Tombol `Timbang Pesanan` tersedia pada detail order.
4. Cashier menekan tombol tersebut.
5. Sistem membuka halaman timbang dengan item awal customer sebagai draft.

### 8.2 Mengoreksi Item

1. Cashier mencocokkan draft dengan cucian fisik.
2. Cashier dapat:
   - mengganti layanan pada item existing,
   - menambah item layanan baru,
   - menghapus item yang tidak sesuai,
   - mengubah quantity aktual,
   - mengisi catatan item.
3. Sistem memperbarui subtotal dan total estimasi realtime berdasarkan draft saat ini.
4. Sistem menampilkan unit dan harga sesuai layanan aktual yang dipilih.

### 8.3 Menyimpan Hasil Timbang

1. Cashier menekan simpan.
2. Aplikasi mengirim struktur item lengkap ke backend.
3. Backend memvalidasi status order, employee, outlet, layanan, quantity, minimum quantity, paket/quota, dan foto opsional.
4. Backend mengganti daftar item order menjadi daftar item aktual hasil timbang.
5. Backend menghitung ulang subtotal, discount, tax, total amount, paid amount, remaining amount, payment status, dan status order.
6. Order berubah menjadi `ready_to_process`.
7. Response mengembalikan order terbaru beserta `orderItems.laundryService`, total harga baru, status baru, dan payment status.

### 8.4 Setelah Timbang Berhasil

1. Cashier kembali ke detail order atau melihat konfirmasi sukses.
2. Detail order setelah reload menampilkan item hasil koreksi.
3. Customer melihat harga final setelah penimbangan.
4. Production melihat order di daftar siap dikerjakan dengan item hasil koreksi.
5. Notifikasi status/harga berjalan mengikuti flow timbang existing.

## 9. Aturan Bisnis

1. Entry point timbang tetap dari detail order cashier.
2. Tombol `Timbang Pesanan` terutama tersedia untuk order status `received`.
3. Item awal customer hanya draft pada halaman timbang.
4. Hasil timbang final adalah daftar item yang dikirim saat cashier menyimpan.
5. Minimal harus ada satu item valid sebelum simpan.
6. Setiap item wajib memiliki `laundryServiceId` valid.
7. Layanan harus aktif dan berasal dari outlet yang sama dengan order.
8. Quantity wajib lebih dari 0.
9. Quantity wajib memenuhi minimum quantity layanan jika layanan memiliki aturan minimum.
10. Harga satuan tidak boleh dipercaya dari client. Backend harus mengambil harga dari master layanan aktif.
11. Unit, nama kategori, nama layanan, dan proses production mengikuti layanan aktual yang tersimpan.
12. Discount dan pemakaian paket/quota dihitung ulang otomatis berdasarkan item aktual.
13. Jika quota tidak cukup, sistem menolak simpan dengan error validasi yang jelas.
14. Jika layanan inactive atau milik outlet lain, sistem menolak request.
15. Item yang tidak dikirim pada payload timbang dianggap tidak menjadi bagian dari order final.
16. Foto bukti timbang tetap opsional.
17. Setelah simpan berhasil, status order berubah menjadi `ready_to_process`.
18. Paid amount existing tidak dihapus otomatis.
19. Remaining amount dihitung ulang dari total final dikurangi paid amount existing.

## 10. Kebutuhan UI/UX Cashier

### 10.1 Struktur Halaman Timbang

Halaman timbang perlu menampilkan:

1. Informasi order ringkas:
   - nomor order,
   - customer,
   - status,
   - outlet,
   - ringkasan pembayaran bila relevan.
2. Upload foto bukti timbang opsional.
3. Daftar item draft timbang yang bisa diedit.
4. Aksi tambah layanan baru.
5. Catatan umum dan catatan internal.
6. Ringkasan subtotal, discount/paket, biaya tambahan, total final estimasi, paid amount, dan remaining amount.
7. Tombol simpan hasil timbang.

### 10.2 Kontrol Item

Setiap item draft perlu memiliki kontrol:

1. Pilih atau ganti layanan.
2. Input quantity aktual.
3. Tampilan unit layanan.
4. Tampilan harga satuan.
5. Tampilan subtotal realtime.
6. Catatan item.
7. Hapus item.

### 10.3 Pemilihan Layanan

Pemilihan layanan dari halaman timbang harus:

1. Menggunakan daftar layanan aktif outlet yang sama.
2. Mendukung pencarian atau filter jika pola existing sudah tersedia.
3. Menampilkan nama kategori, nama layanan, harga, unit, dan informasi minimum quantity.
4. Mengembalikan layanan terpilih ke draft timbang tanpa langsung menyimpan ke backend.

### 10.4 Realtime Estimation

Estimasi total di UI harus berubah ketika cashier:

1. mengubah layanan item,
2. menambah item,
3. menghapus item,
4. mengubah quantity,
5. mengubah penggunaan paket/quota jika UI menampilkan kontrol tersebut.

Catatan: total realtime adalah estimasi client untuk membantu cashier. Backend tetap menjadi sumber kebenaran final.

### 10.5 Error dan Empty State

UI perlu menangani:

1. Draft item kosong.
2. Quantity kosong atau tidak valid.
3. Quantity di bawah minimum layanan.
4. Layanan tidak lagi tersedia saat simpan.
5. Quota tidak cukup.
6. Gagal upload foto.
7. Gagal menyimpan hasil timbang.

Pesan error harus cukup jelas agar cashier tahu apa yang perlu diperbaiki.

## 11. Kontrak API yang Diharapkan

Endpoint timbang tetap dapat memakai endpoint existing:

```http
POST /api/mobile/cashier/orders/{id}/weigh
```

Request perlu menerima struktur item lengkap, bukan hanya quantity berdasarkan index item lama.

Contoh payload:

```json
{
  "employeeId": 1,
  "notes": "catatan customer opsional",
  "internalNotes": "catatan internal opsional",
  "orderItems": [
    {
      "laundryServiceId": 10,
      "quantity": 2.5,
      "itemNotes": "Jaket tebal",
      "discountAmount": 0,
      "isPackageUsage": false,
      "customerSubscriptionId": null,
      "quotaUsed": null
    }
  ],
  "photo": "optional multipart image"
}
```

Validasi request minimum:

1. `employeeId` wajib dan employee valid.
2. `orderItems` wajib array dan minimal 1 item.
3. `orderItems.*.laundryServiceId` wajib, integer, aktif, dan milik outlet order.
4. `orderItems.*.quantity` wajib numeric dan lebih dari 0.
5. `orderItems.*.quantity` memenuhi minimum quantity layanan.
6. `orderItems.*.itemNotes` optional string.
7. `orderItems.*.isPackageUsage` optional boolean.
8. `orderItems.*.customerSubscriptionId` optional tetapi harus valid jika dikirim.
9. `orderItems.*.quotaUsed` optional numeric dan harus sesuai quota tersedia jika dikirim.
10. `photo` optional multipart image seperti flow existing.

Response tetap mengembalikan order terbaru dengan:

1. `orderItems.laundryService`,
2. total harga baru,
3. status `ready_to_process`,
4. payment status terbaru,
5. paid amount existing,
6. remaining amount terbaru,
7. catatan dan foto timbang jika pola existing mengembalikannya.

## 12. Kebutuhan Backend

Backend perlu menyiapkan behavior berikut:

1. Memvalidasi order hanya bisa ditimbang pada status yang disepakati, terutama `received`.
2. Memvalidasi employee dan akses outlet sesuai pola authorization existing.
3. Mengambil layanan dari database berdasarkan `laundryServiceId`, bukan dari harga client.
4. Menolak layanan inactive atau bukan milik outlet order.
5. Menghapus atau mengganti daftar order item lama dengan item aktual hasil timbang secara transaksional.
6. Menghitung subtotal item berdasarkan quantity aktual dan harga layanan.
7. Menghitung ulang pemakaian paket/quota membership mengikuti pola flow pembuatan order cashier.
8. Menolak request jika quota tidak cukup.
9. Menghitung ulang discount amount, subtotal, tax, total amount, paid amount, remaining amount, dan payment status.
10. Menyimpan foto bukti timbang jika dikirim.
11. Mengubah status order menjadi `ready_to_process`.
12. Mengembalikan order fresh dengan relasi yang diperlukan oleh aplikasi cashier, customer, dan production.

## 13. Kebutuhan Data dan Integrasi Paket

Penghitungan paket/quota pada timbang harus mengikuti prinsip berikut:

1. Sumber layanan aktual adalah item hasil timbang, bukan item awal customer.
2. Jika customer memiliki paket untuk layanan tertentu, sistem mengevaluasi ulang kelayakan paket terhadap layanan aktual.
3. Jika layanan diganti ke layanan yang tidak termasuk paket, item tersebut tidak boleh memakai quota paket lama.
4. Jika item baru memenuhi paket yang tersedia, sistem dapat menghitung pemakaian quota sesuai pola create order cashier.
5. Jika quantity aktual melebihi quota tersedia, sistem menolak atau menghitung sisa non-paket sesuai aturan bisnis existing. Plan implementasi perlu mengikuti behavior existing yang paling konsisten.
6. Riwayat atau audit pemakaian quota harus merepresentasikan item final hasil timbang.

## 14. Acceptance Criteria

1. Cashier bisa membuka halaman timbang dari detail order berstatus `received`.
2. Cashier melihat item awal customer sebagai draft awal.
3. Cashier bisa menambah layanan baru saat timbang.
4. Cashier bisa mengganti layanan item yang salah.
5. Cashier bisa menghapus item yang tidak sesuai.
6. Cashier bisa mengubah quantity aktual tiap item.
7. Cashier bisa mengisi catatan per item.
8. Cashier bisa mengisi catatan umum dan catatan internal.
9. Total estimasi di UI berubah realtime mengikuti item aktual.
10. Jika layanan berubah, nama kategori, nama layanan, unit, harga satuan, subtotal, dan estimasi total ikut berubah.
11. Saat disimpan, payload timbang mengirim struktur item lengkap dengan `laundryServiceId`.
12. Backend membuat harga final berdasarkan layanan aktual.
13. Backend menolak simpan jika semua item dihapus.
14. Backend menolak layanan inactive.
15. Backend menolak layanan yang bukan milik outlet order.
16. Backend menolak quantity tidak valid atau di bawah minimum layanan.
17. Paket/quota customer dihitung ulang otomatis sesuai layanan aktual.
18. Jika quota tidak cukup, sistem menampilkan error validasi yang jelas.
19. Order berhasil berubah ke `ready_to_process`.
20. Payment status mengikuti flow timbang existing.
21. Paid amount existing tidak hilang otomatis.
22. Remaining amount mencerminkan harga final setelah timbang.
23. Detail order setelah reload menampilkan item hasil koreksi, bukan item awal yang salah.
24. Customer melihat harga final setelah penimbangan.
25. Production menerima daftar item hasil koreksi.
26. Foto bukti timbang tetap opsional dan tetap tersimpan seperti flow sekarang.

## 15. Test Scenarios

### 15.1 Cashier Menambah Item Jaket

1. Customer order satu item pakaian.
2. Cashier membuka timbang ketika order status `received`.
3. Cashier menambah layanan jaket.
4. Cashier mengisi quantity jaket.
5. Total estimasi bertambah.
6. Cashier menyimpan hasil timbang.
7. Detail order menampilkan dua item.
8. Production menerima dua item.

### 15.2 Cashier Mengganti Layanan Item Lama

1. Customer memilih layanan cuci kering.
2. Cashier mengganti item tersebut ke layanan lain.
3. Unit, harga satuan, dan subtotal berubah mengikuti layanan baru.
4. Cashier menyimpan hasil timbang.
5. Detail order menampilkan layanan baru, bukan layanan lama.

### 15.3 Cashier Menghapus Item Lama dan Menyimpan Item Baru

1. Customer memilih item yang ternyata tidak sesuai.
2. Cashier menghapus item lama.
3. Cashier menambahkan item layanan baru.
4. Cashier menyimpan hasil timbang.
5. Production hanya melihat item baru.

### 15.4 Cashier Mengubah Quantity Aktual

1. Customer membuat order dengan quantity estimasi.
2. Cashier menimbang ulang dan mengubah quantity.
3. Subtotal dan total final berubah.
4. Backend menyimpan quantity aktual dan total final.

### 15.5 Customer Memiliki Paket atau Quota

1. Customer memiliki quota untuk layanan tertentu.
2. Cashier mengganti atau menambah item saat timbang.
3. Sistem menghitung ulang pemakaian quota berdasarkan layanan aktual.
4. Jika quota cukup, order berhasil disimpan dengan pemakaian quota yang benar.
5. Jika quota tidak cukup, request ditolak dengan pesan validasi jelas.

### 15.6 Cashier Menyimpan Tanpa Item

1. Cashier menghapus semua item.
2. Cashier menekan simpan.
3. Sistem menolak simpan.
4. Pesan validasi menjelaskan minimal harus ada satu item.

### 15.7 Cashier Memakai Layanan Inactive atau Outlet Lain

1. Cashier atau client mengirim `laundryServiceId` inactive.
2. Backend menolak request.
3. Cashier melihat error validasi yang jelas.
4. Skenario yang sama berlaku untuk layanan milik outlet lain.

### 15.8 Foto Bukti Timbang Opsional

1. Cashier menyimpan timbang tanpa foto.
2. Order tetap berhasil jika data item valid.
3. Cashier menyimpan timbang dengan foto.
4. Foto tersimpan seperti flow existing.

## 16. Catatan Teknis Awal untuk Penyusun Plan

Area repo yang perlu diperhatikan:

1. `apps/cashier/lib/features/order/presentation/screens/weigh_order_screen.dart`
   Halaman timbang existing. Saat ini item dibangun dari `widget.order.orderItems` dan input utama hanya quantity serta catatan item.
2. `apps/cashier/lib/features/order/domain/usecases/weigh_usecase.dart`
   `WeighItemData` saat ini hanya membawa `quantity` dan `itemNotes`.
3. `apps/cashier/lib/features/order/data/datasources/order_remote_datasource.dart`
   Method `weigh()` sudah mengirim multipart form data ke endpoint timbang dan dapat dipertahankan untuk foto opsional.
4. `apps/cashier/lib/features/order/presentation/screens/select_laundry_service_for_order_screen.dart`
   Dapat menjadi referensi pemilihan layanan pada flow create order cashier.
5. `apps/cashier/lib/features/order/domain/services/order_price_calculator.dart`
   Dapat menjadi referensi estimasi harga dan quota pada client.
6. `webapp/wash_wallet_be/app/Http/Requests/Order/WeightOrderRequest.php`
   Perlu menambah validasi struktur item lengkap termasuk `laundryServiceId`.
7. `webapp/wash_wallet_be/app/Services/OrderService.php`
   Method `weight()` perlu memproses item aktual hasil timbang, bukan update berdasarkan index item lama.
8. Flow store/update order backend yang sudah memproses `laundryServiceId`, quantity, discount, package usage, dan quota perlu dijadikan referensi agar perhitungan timbang konsisten.

Risiko yang perlu diperhatikan:

1. Menghapus dan membuat ulang order item harus aman terhadap relasi production process jika order belum masuk production.
2. Jika order pernah ditimbang ulang, perlu keputusan apakah boleh mengganti item pada status selain `received`.
3. Jika paid amount lebih besar dari total final baru, plan perlu mengikuti pola payment existing untuk overpayment atau remaining amount minimum 0.
4. Perhitungan package usage harus konsisten antara create order cashier dan weight order.
5. Backend tidak boleh mempercayai harga, subtotal, total, atau unit dari client.

## 17. Keputusan untuk Plan

Keputusan stakeholder yang sudah dikunci:

1. Cashier boleh tambah, edit, dan hapus item saat timbang.
2. Paket/quota dihitung ulang otomatis.
3. Total order direvisi mengikuti hasil timbang final.
4. Flow pembayaran existing tetap dipertahankan.
5. Paid amount yang sudah ada tidak dihapus otomatis.
6. Total dan remaining amount harus mencerminkan harga final setelah timbang.
7. Production hanya menerima item yang sudah benar setelah hasil timbang disimpan.
