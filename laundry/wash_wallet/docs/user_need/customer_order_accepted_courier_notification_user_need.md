# User Need: Notifikasi Order Diterima untuk Customer dan Kurir

Tanggal: 2026-06-12

Dokumen ini menjadi acuan user need untuk AI model lain saat menyusun implementation plan. Fokus dokumen ini adalah kebutuhan pengguna, alur bisnis, aturan trigger, aturan penerima notifikasi, payload minimal, edge cases, acceptance criteria, dan rencana verifikasi. Detail teknis final seperti nama event, channel, job, service class, endpoint, package Flutter, atau struktur migration ditentukan pada dokumen plan.

## 1. Latar Belakang

Customer membuat order pickup dari aplikasi customer dan menunggu outlet menerima pesanan tersebut. Setelah cashier menerima order, customer membutuhkan kepastian bahwa order sudah diterima outlet dan proses pickup akan berjalan sesuai jadwal yang dipilih.

Pada saat yang sama, employee kurir di aplikasi production membutuhkan sinyal bahwa ada order pickup baru yang siap dijemput. Tanpa notifikasi, kurir harus membuka atau me-refresh daftar order secara manual. Dalam operasional laundry, keterlambatan mengetahui order pickup baru dapat menunda penjemputan, penimbangan, dan proses produksi berikutnya.

Kebutuhan ini muncul pada transisi order customer dari status `requested` menjadi `accepted` karena cashier menerima order. Status `accepted` secara bisnis berarti order sudah diterima outlet dan masuk antrian pickup kurir.

## 2. Tujuan

1. Memberi kepastian kepada customer bahwa order pickup sudah diterima outlet.
2. Memberi tahu kurir bahwa ada order pickup baru yang siap dijemput tanpa refresh manual.
3. Menargetkan notifikasi kurir berdasarkan permission kurir pada outlet order, bukan hanya outlet utama employee.
4. Mendukung skenario employee lintas outlet, misalnya employee outlet A punya posisi atau permission kurir aktif untuk outlet B.
5. Mencegah employee yang tidak punya permission kurir pada outlet order menerima notifikasi pickup.
6. Menyediakan payload notifikasi yang konsisten agar aplikasi dapat membuka detail order pickup yang benar.
7. Menghindari notifikasi ganda ketika event realtime dan push notification sama-sama diterima.

## 3. Aktor

1. `customer`
   Pemilik order pickup yang dibuat dari aplikasi customer.
2. `cashier`
   Employee yang menerima order customer dari status `requested` menjadi `accepted`.
3. `employee kurir di production app`
   Employee yang memakai aplikasi production dan memiliki permission kurir pada outlet tertentu.
4. `backend`
   Menjaga transisi status order, menentukan penerima notifikasi, membuat payload, mengirim realtime event dan push notification bila tersedia.
5. `production app`
   Menerima event atau push untuk employee kurir, menampilkan notifikasi pickup baru, dan membuka detail order yang relevan.
6. `customer app`
   Menerima notifikasi order diterima dan membuka detail order customer yang relevan.

## 4. Scope Kebutuhan

Scope utama:

1. Notifikasi setelah cashier menerima order pickup customer.
2. Trigger dari order customer yang berstatus `requested` lalu berubah menjadi `accepted`.
3. Notifikasi kepada customer pemilik order.
4. Notifikasi kepada employee kurir di aplikasi production berdasarkan permission pada outlet order.
5. Targeting kurir multi-outlet berdasarkan posisi aktif dan permission aktif.
6. Payload notifikasi untuk customer app dan production app.
7. Tampilan notifikasi pickup baru di production app hanya untuk employee yang punya akses kurir pada outlet order.
8. Navigasi dari notifikasi ke detail order atau halaman pickup yang benar.
9. Deduplication agar notifikasi yang sama tidak tampil dua kali.

Di luar scope:

1. Optimasi rute pickup kurir.
2. Assignment kurir spesifik untuk satu order.
3. Tracking lokasi realtime kurir atau customer.
4. Perubahan flow penimbangan cashier.
5. Perubahan flow produksi setelah order masuk outlet.
6. Perubahan status order selain transisi `requested` ke `accepted` yang relevan untuk fitur ini.
7. Notifikasi untuk self drop-off yang berubah menjadi `received`, kecuali plan berikutnya memutuskan perlu fitur terpisah.

## 5. Alur Bisnis yang Diharapkan

1. Customer membuat order pickup dari aplikasi customer.
2. Order masuk dengan status `requested`.
3. Cashier outlet membuka daftar order masuk.
4. Cashier menerima order customer.
5. Backend mengubah status order dari `requested` menjadi `accepted`.
6. Backend mengirim notifikasi ke customer bahwa order sudah diterima dan kurir akan menjemput sesuai jadwal pickup.
7. Backend mencari semua employee aktif yang memiliki posisi aktif dan permission kurir aktif pada outlet order.
8. Backend mengirim notifikasi pickup baru ke employee kurir yang memenuhi aturan penerima.
9. Production app menampilkan notifikasi pickup baru hanya jika employee login memiliki permission kurir pada outlet order.
10. Saat customer atau kurir mengetuk notifikasi, aplikasi membuka detail order yang sesuai.

## 6. Aturan Trigger

Notifikasi pada dokumen ini hanya dikirim ketika semua kondisi berikut terpenuhi:

1. Order berasal dari aplikasi customer.
2. Order adalah order pickup yang membutuhkan penjemputan kurir.
3. Status order sebelumnya adalah `requested`.
4. Cashier menerima order tersebut.
5. Status order berhasil berubah menjadi `accepted`.
6. Transisi status sudah tersimpan secara berhasil.

Kondisi yang tidak termasuk trigger:

1. Order self drop-off yang berubah menjadi `received`.
2. Order yang dibuat langsung oleh cashier dari aplikasi POS atau cashier.
3. Order yang sudah berada di status `accepted` dan diproses ulang tanpa perubahan status.
4. Perubahan status lanjutan seperti `picking_up`, `received`, `ready_to_process`, atau `in_progress`.
5. Perubahan data non-status seperti catatan order, alamat, atau jadwal tanpa transisi accept cashier.

Jika terdapat order lama dengan data `source` yang belum konsisten, implementation plan perlu menentukan fallback yang aman, misalnya berdasarkan endpoint pembuat order atau keberadaan `customer_account_id`, tanpa memperluas notifikasi ke order internal cashier.

## 7. Aturan Penerima Customer

Customer yang menerima notifikasi adalah customer pemilik order.

Aturan:

1. Customer harus terkait dengan order yang diterima.
2. Jika customer memiliki lebih dari satu device aktif, semua device aktif customer boleh menerima push notification.
3. Jika token device customer invalid, kegagalan push tidak boleh menggagalkan proses accept order.
4. Jika customer sedang membuka aplikasi, notifikasi dapat tampil sebagai in-app update, push, atau mekanisme realtime sesuai pola aplikasi customer.
5. Tap notifikasi customer harus membuka detail order customer yang benar.

Copy customer yang direkomendasikan:

`Pesanan Anda sudah diterima. Kurir akan menjemput pada {jadwal}.`

Jika jadwal pickup kosong atau tidak bisa diformat, copy fallback harus tetap jelas, misalnya:

`Pesanan Anda sudah diterima. Kurir akan segera menjemput sesuai jadwal pickup.`

## 8. Aturan Penerima Kurir

Notifikasi pickup baru hanya boleh diterima employee yang memenuhi aturan berikut:

1. Employee aktif.
2. Employee memiliki posisi aktif yang terkait dengan outlet order melalui `positions.outlet_id`.
3. Employee memiliki permission aktif `courier.view` atau `courier.manage` pada outlet order.
4. Permission harus dievaluasi terhadap outlet order, bukan hanya terhadap `employee.outlet_id`.
5. Employee dapat berasal dari outlet utama yang berbeda selama memiliki posisi dan permission kurir aktif pada outlet order.
6. Employee tanpa permission `courier.view` atau `courier.manage` pada outlet order tidak boleh menerima notifikasi.
7. Employee yang hanya memiliki akses produksi non-kurir tidak boleh menerima notifikasi pickup baru.
8. Employee yang berasal dari owner yang sama tetapi tidak punya permission kurir pada outlet order tidak boleh menerima notifikasi.
9. Jika employee login di beberapa device aktif, semua device aktif milik employee tersebut boleh menerima push notification.
10. Jika employee logout atau device token dinonaktifkan, device tersebut tidak boleh menerima push untuk akun lama.

Contoh skenario:

1. Employee outlet A memiliki posisi dan permission `courier.view` pada outlet B.
   - Saat order outlet B diterima cashier, employee tersebut harus menerima notifikasi pickup baru untuk outlet B.
2. Employee outlet A tidak memiliki permission kurir pada outlet B.
   - Saat order outlet B diterima cashier, employee tersebut tidak boleh menerima notifikasi.
3. Employee outlet B memiliki permission production umum tetapi tidak memiliki `courier.view` atau `courier.manage`.
   - Employee tersebut tidak boleh menerima notifikasi pickup baru.

Copy production atau kurir yang direkomendasikan:

`Pesanan pickup baru dari {customerName} untuk {jam} di {alamat/outlet}.`

Jika alamat pickup kosong, copy dapat memakai outlet sebagai fallback:

`Pesanan pickup baru dari {customerName} untuk {jam} di {outletName}.`

## 9. Kebutuhan Production App

Production app perlu menampilkan notifikasi pickup baru hanya untuk user yang memang punya akses kurir pada outlet order.

Kebutuhan:

1. App memahami payload notifikasi pickup baru sebagai order `accepted` yang siap dijemput.
2. App memvalidasi atau menyesuaikan tampilan berdasarkan permission login user pada outlet order.
3. App tidak menampilkan notifikasi pickup baru untuk employee yang tidak memiliki `courier.view` atau `courier.manage` pada outlet order.
4. Jika employee memiliki akses kurir ke beberapa outlet, app dapat menerima dan menampilkan order pickup dari seluruh outlet tersebut.
5. Notifikasi harus menyertakan informasi outlet agar order lintas outlet tidak membingungkan.
6. Tap notifikasi membuka detail order pickup atau daftar pickup dengan order tersebut terlihat.
7. Jika app sedang berada pada daftar pickup, daftar dapat diperbarui agar order baru muncul tanpa refresh manual bila mekanisme realtime tersedia.
8. Jika app menerima push ketika belum login atau session invalid, app harus mengarahkan ke login lalu tetap dapat membuka konteks order setelah login bila memungkinkan.

## 10. Kebutuhan Customer App

Customer app perlu memberi kepastian bahwa pesanan sudah diterima outlet.

Kebutuhan:

1. Customer melihat notifikasi bahwa order sudah diterima.
2. Customer dapat melihat jadwal pickup yang sama dengan jadwal pada order.
3. Tap notifikasi membuka detail order.
4. Detail order menunjukkan status yang sesuai, yaitu order sudah diterima atau siap dijemput.
5. Customer tidak boleh mendapat notifikasi pickup baru untuk order milik customer lain.
6. Jika push notification gagal, status order pada aplikasi tetap harus benar saat customer membuka ulang detail order.

## 11. Payload Notifikasi

Payload notifikasi customer dan kurir perlu konsisten agar deduplication dan navigasi dapat menggunakan data yang stabil.

Informasi minimal:

| Field | Kebutuhan |
| --- | --- |
| `type` | Nilai stabil untuk jenis event, misalnya `order_accepted_pickup` atau nama final lain pada plan |
| `eventId` | ID unik event untuk deduplication |
| `orderId` | ID order |
| `orderNumber` | Nomor order yang ditampilkan ke user |
| `outletId` | ID outlet pemilik order |
| `outletName` | Nama outlet pemilik order |
| `customerName` | Nama customer jika tersedia |
| `pickupAddress` | Alamat pickup jika tersedia |
| `pickupSchedule` | Nilai jadwal pickup yang bisa dipakai aplikasi |
| `formattedPickupSchedule` | Jadwal pickup yang sudah siap ditampilkan |
| `status` | Status order setelah diterima, yaitu `accepted` |
| `createdAt` | Timestamp event atau waktu accept order |

Catatan payload:

1. `eventId` harus stabil untuk satu kejadian accept agar Reverb dan FCM dapat dideduplikasi.
2. `orderId` dan `orderNumber` harus cukup untuk membuka detail atau melakukan fetch detail order.
3. `outletId` wajib tersedia karena permission kurir dan konteks multi-outlet bergantung pada outlet order.
4. `formattedPickupSchedule` dipakai untuk copy notifikasi; jika kosong, app dapat memakai fallback copy.
5. Payload data tidak boleh bergantung pada parsing title atau body notifikasi.

## 12. Deduplication dan Sinkronisasi

Karena event realtime dan FCM dapat sama-sama diterima, aplikasi perlu menghindari notifikasi ganda.

Kebutuhan:

1. App menggunakan `eventId` sebagai kunci deduplication utama.
2. Jika `eventId` tidak tersedia karena fallback tertentu, app dapat memakai kombinasi `type`, `orderId`, dan `status`.
3. Notifikasi dengan event yang sama tidak boleh menampilkan banner, sound, atau push lokal berulang dalam waktu dekat.
4. Badge atau count pickup baru tidak boleh bertambah dua kali untuk order yang sama.
5. Saat app resume dari background, app melakukan sync daftar pickup agar data tetap benar.
6. Saat koneksi realtime reconnect, app melakukan fetch ulang daftar atau count pickup untuk menghindari event yang terlewat.
7. Backend boleh mencatat event terkirim, tetapi kegagalan salah satu channel notifikasi tidak boleh membatalkan status order yang sudah diterima.

## 13. Edge Cases

1. Jadwal pickup kosong.
   - Customer tetap menerima copy fallback yang tidak menampilkan nilai kosong.
   - Kurir tetap menerima notifikasi dengan informasi order dan outlet.
2. `formattedPickupSchedule` tidak tersedia.
   - App atau backend memakai `pickupSchedule` untuk format fallback bila memungkinkan.
3. Alamat pickup kosong.
   - Copy kurir memakai `outletName` sebagai fallback konteks lokasi.
4. Token FCM invalid.
   - Token dapat ditandai invalid atau dibersihkan.
   - Kegagalan push tidak menggagalkan accept order.
5. Employee memiliki banyak device.
   - Semua device aktif boleh menerima notifikasi.
   - Deduplication tetap dilakukan per device atau per app session.
6. Permission employee dicabut setelah event terkirim.
   - App tidak boleh membuka detail order jika user tidak lagi punya akses.
   - Fetch detail atau action lanjutan harus tetap divalidasi backend.
7. Order sudah diambil kurir lain saat notifikasi dibuka.
   - App menampilkan status terbaru dan tidak memberi aksi pickup yang sudah tidak valid.
8. Event realtime dan FCM dobel.
   - App menampilkan satu notifikasi untuk satu `eventId`.
9. Employee lintas outlet.
   - Employee menerima notifikasi hanya untuk outlet yang tercakup posisi dan permission kurir aktifnya.
10. Employee dari owner yang sama tanpa permission kurir outlet order.
   - Employee tidak menerima notifikasi dan tidak dapat membuka detail pickup.
11. Accept order dipanggil ulang atau terjadi retry.
   - Sistem tidak boleh membuat notifikasi baru jika status order sudah `accepted` dari transaksi sebelumnya.
12. Customer tidak memiliki token aktif.
   - Order tetap diterima, dan customer melihat status terbaru saat membuka aplikasi.

## 14. Acceptance Criteria

### Customer

1. Ketika cashier menerima order pickup customer dari `requested` ke `accepted`, customer pemilik order menerima notifikasi order diterima.
2. Notifikasi customer memakai copy yang menjelaskan bahwa pesanan sudah diterima dan kurir akan menjemput sesuai jadwal.
3. Payload customer memuat data minimal untuk membuka detail order yang benar.
4. Tap notifikasi customer membuka detail order customer tersebut.
5. Customer lain tidak menerima notifikasi untuk order yang bukan miliknya.

### Kurir dan Production App

1. Ketika cashier menerima order pickup customer dari `requested` ke `accepted`, employee kurir yang punya `courier.view` atau `courier.manage` pada outlet order menerima notifikasi pickup baru.
2. Employee outlet A yang memiliki posisi dan permission kurir aktif pada outlet B menerima notifikasi untuk order outlet B.
3. Employee tanpa permission `courier.view` atau `courier.manage` pada outlet order tidak menerima notifikasi pickup baru.
4. Target kurir dihitung dari posisi aktif dan permission aktif pada `positions.outlet_id` order, bukan hanya dari `employee.outlet_id`.
5. Production app hanya menampilkan notifikasi pickup baru jika employee login punya permission kurir pada outlet order.
6. Tap notifikasi kurir membuka detail order pickup atau daftar pickup dengan order yang benar.
7. Informasi outlet terlihat atau tersedia pada notifikasi/detail agar kurir lintas outlet tidak salah konteks.

### Deduplication dan Reliability

1. Satu kejadian accept order tidak memunculkan notifikasi ganda pada app yang sama walaupun realtime event dan FCM sama-sama diterima.
2. Kegagalan FCM ke salah satu token tidak membatalkan accept order.
3. Token invalid dapat ditangani tanpa mengirim error ke user.
4. Jika permission dicabut sebelum user membuka notifikasi, backend tetap menolak akses detail atau aksi pickup yang tidak sah.
5. Jika order sudah diambil kurir lain, app menampilkan status terbaru dan tidak memperbolehkan aksi yang sudah tidak valid.

## 15. Test Plan yang Diharapkan

Backend test:

1. Accept order customer pickup dari `requested` ke `accepted` memicu notifikasi customer.
2. Accept order customer pickup dari `requested` ke `accepted` memicu notifikasi kurir pada outlet order.
3. Target kurir memakai permission pada `positions.outlet_id`, bukan hanya `employee.outlet_id`.
4. Employee outlet A dengan permission kurir aktif pada outlet B menerima notifikasi untuk order outlet B.
5. Employee tanpa `courier.view` atau `courier.manage` pada outlet order tidak menerima notifikasi.
6. Employee dengan akses production umum tetapi tanpa permission kurir tidak menerima notifikasi pickup.
7. Self drop-off yang berubah ke `received` tidak memicu notifikasi pickup kurir dari fitur ini.
8. Retry accept pada order yang sudah `accepted` tidak membuat notifikasi duplikat.
9. Token FCM invalid tidak menggagalkan transaksi accept order.

App test atau manual test:

1. Customer menerima push atau in-app notification setelah order diterima cashier.
2. Tap notifikasi customer membuka detail order yang benar.
3. Production app menampilkan notifikasi pickup baru untuk user yang memiliki permission kurir pada outlet order.
4. Production app tidak menampilkan notifikasi pickup baru untuk user yang tidak memiliki permission kurir pada outlet order.
5. Employee lintas outlet menerima notifikasi outlet yang menjadi cakupan permission kurirnya.
6. Tap notifikasi production membuka detail order pickup yang benar.
7. Realtime event dan FCM untuk event yang sama tidak menampilkan dua notifikasi.
8. Ketika order sudah diambil kurir lain, detail order menampilkan status terbaru.

## 16. Catatan untuk Penyusun Plan

1. Dokumen ini tidak mengunci nama final `type`, event, channel, job, service, atau package Flutter.
2. Plan perlu menyesuaikan dengan pola notifikasi cashier yang sudah atau akan ada, terutama untuk FCM, realtime event, dan deduplication.
3. Targeting kurir adalah bagian paling penting: jangan memakai `employee.outlet_id` sebagai satu-satunya filter.
4. Permission harus dievaluasi pada outlet order melalui posisi aktif dan permission aktif.
5. Backend tetap menjadi sumber kebenaran untuk akses detail dan aksi order, sehingga app tidak boleh hanya mengandalkan payload notifikasi.
6. Plan perlu memastikan transaksi accept order tidak gagal hanya karena notifikasi gagal dikirim.

## Status

Draft user need siap dijadikan dasar implementation plan.
