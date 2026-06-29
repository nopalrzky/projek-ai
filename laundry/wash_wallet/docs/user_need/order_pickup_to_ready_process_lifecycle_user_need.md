# User Need: Alur Status Order Pickup sampai Siap Dikerjakan

Tanggal: 2026-06-10

## 1. Latar Belakang

Stakeholder membutuhkan alur status order yang lebih jelas setelah order dari customer diterima oleh cashier. Setelah cashier menerima order, order tidak boleh langsung dipahami sebagai order yang siap dikerjakan oleh produksi, karena pada flow pickup cucian masih perlu dijemput oleh kurir, dibawa ke outlet, lalu ditimbang terlebih dahulu oleh cashier.

Alur yang diharapkan adalah:

1. Cashier menerima order customer.
2. Order menjadi siap dijemput oleh kurir.
3. Kurir menerima atau memulai penjemputan.
4. Order menjadi dalam perjalanan.
5. Setelah cucian diambil dan dibawa ke outlet, order menjadi di outlet.
6. Cashier menimbang cucian saat status order sudah di outlet.
7. Setelah ditimbang dan harga muncul, order menjadi siap dikerjakan oleh produksi.

Dokumen ini menjadi acuan user need untuk AI model lain saat menyusun implementation plan. Dokumen ini fokus pada kebutuhan pengguna, alur bisnis, istilah status, aturan antar-aplikasi, dan acceptance criteria. Detail teknis final seperti endpoint, perubahan UI, struktur state management, model, migration, atau test implementation ditentukan pada dokumen plan.

## 2. Tujuan

1. Menyelaraskan status order dengan proses operasional laundry yang sebenarnya.
2. Memastikan order customer tidak langsung masuk produksi sebelum dijemput, sampai outlet, dan ditimbang.
3. Memberi cashier titik kerja yang jelas untuk menerima order dan menimbang order yang sudah sampai outlet.
4. Memberi kurir titik kerja yang jelas untuk mengambil order dari status siap dijemput dan mengonfirmasi order sudah sampai outlet.
5. Memberi production titik kerja yang jelas bahwa order baru boleh dikerjakan setelah status menjadi siap dikerjakan.
6. Menampilkan status yang konsisten di aplikasi customer, cashier, dan production.

## 3. Aktor

1. `customer`
   Membuat order dan memantau perkembangan status order.
2. `cashier employee`
   Menerima order customer dan menimbang order ketika cucian sudah sampai outlet.
3. `courier employee`
   Mengambil order dari customer dan mengonfirmasi cucian sudah sampai outlet.
4. `production employee`
   Mengerjakan order setelah order siap dikerjakan.
5. `backend`
   Menjaga transisi status, validasi aksi, dan response status yang dikonsumsi oleh tiga aplikasi.

## 4. Scope Kebutuhan

Scope utama:

1. Alur status order pickup dari accepted oleh cashier sampai siap dikerjakan production.
2. Sinkronisasi label dan pemahaman status pada aplikasi customer, cashier, dan production.
3. Validasi aksi utama:
   - cashier accept order,
   - kurir mulai pickup,
   - kurir confirm pickup sampai outlet,
   - cashier timbang order,
   - production mulai pengerjaan.
4. Kebutuhan tampilan daftar/detail order di setiap aplikasi agar user memahami tahap order saat ini.

Di luar scope:

1. Perubahan flow delivery setelah order selesai dikerjakan.
2. Perubahan pembayaran, wallet, atau Midtrans.
3. Perubahan pricing service selain harga yang muncul akibat penimbangan.
4. Tracking lokasi kurir secara realtime.
5. Redesign menyeluruh halaman order.

## 5. Istilah Bisnis dan Mapping Status

Dokumen ini memakai status teknis yang sudah ada agar plan berikutnya tidak membuat status baru yang tidak diperlukan.

| Status teknis | Label bisnis yang diharapkan | Makna operasional | Pemilik aksi utama |
| --- | --- | --- | --- |
| `requested` | Diajukan | Order dibuat customer dan menunggu keputusan cashier | Customer, cashier |
| `accepted` | Siap Dijemput | Cashier sudah menerima order dan order masuk antrian pickup kurir | Cashier |
| `picking_up` | Dalam Perjalanan | Kurir sudah mulai proses penjemputan menuju customer atau sedang membawa cucian | Kurir |
| `received` | Di Outlet | Cucian sudah sampai outlet dan siap ditimbang cashier | Kurir, cashier |
| `ready_to_process` | Siap Dikerjakan | Cucian sudah ditimbang, harga sudah muncul, dan order siap masuk produksi | Cashier, production |
| `in_progress` | Sedang Dikerjakan | Production sudah mulai mengerjakan order | Production |

Catatan penting:

1. `accepted` secara bisnis harus ditampilkan sebagai `Siap Dijemput` pada konteks kurir, bukan sekadar `Diterima`.
2. `received` adalah status teknis untuk label bisnis `Di Outlet`.
3. `ready_to_process` adalah status teknis untuk label bisnis `Siap Dikerjakan`.
4. Jika ada UI lama yang masih memakai label berbeda, plan implementasi perlu menyelaraskan label tanpa mengganti status teknis kecuali ada kebutuhan backend yang eksplisit.

## 6. Alur Bisnis yang Diharapkan

### 6.1 Customer Membuat Order

1. Customer membuat order pickup dari aplikasi customer.
2. Order masuk ke sistem dengan status awal yang merepresentasikan order diajukan, yaitu `requested`.
3. Customer melihat order sedang menunggu diterima oleh outlet atau cashier.
4. Order belum tampil sebagai pekerjaan produksi.

### 6.2 Cashier Menerima Order

1. Cashier membuka daftar order masuk.
2. Cashier menerima order customer.
3. Setelah diterima, status teknis berubah dari `requested` menjadi `accepted`.
4. Secara bisnis, order ini harus dipahami sebagai `Siap Dijemput`.
5. Order masuk ke antrian kurir pada aplikasi production atau kurir.
6. Order belum boleh masuk antrian `Siap Dikerjakan` production karena cucian belum sampai outlet dan belum ditimbang.

### 6.3 Kurir Memulai Penjemputan

1. Kurir membuka tab atau daftar `Siap Dijemput`.
2. Daftar ini berisi order dengan status teknis `accepted`.
3. Kurir memilih order dan memulai penjemputan.
4. Setelah kurir memulai penjemputan, status teknis berubah menjadi `picking_up`.
5. Secara bisnis, order ini tampil sebagai `Dalam Perjalanan`.
6. Customer, cashier, dan kurir harus dapat memahami bahwa order sedang dalam proses dijemput atau dibawa ke outlet.

### 6.4 Kurir Mengonfirmasi Cucian Sampai Outlet

1. Setelah cucian diambil dari customer dan dibawa ke outlet, kurir mengonfirmasi pickup selesai.
2. Status teknis berubah dari `picking_up` menjadi `received`.
3. Secara bisnis, status ini tampil sebagai `Di Outlet`.
4. Order `Di Outlet` menjadi pekerjaan cashier untuk penimbangan.
5. Order belum boleh mulai dikerjakan production sebelum ditimbang dan harga muncul.

### 6.5 Cashier Menimbang Order di Outlet

1. Cashier membuka daftar atau detail order dengan status `Di Outlet`.
2. Cashier menimbang cucian dan mengisi kuantitas aktual.
3. Sistem menghitung subtotal, total harga, dan informasi pembayaran sesuai data order.
4. Setelah penimbangan berhasil, status teknis berubah menjadi `ready_to_process`.
5. Secara bisnis, status ini tampil sebagai `Siap Dikerjakan`.
6. Customer dapat melihat bahwa harga sudah muncul dan order sudah siap diproses.

### 6.6 Production Mulai Mengerjakan Order

1. Production membuka daftar order `Siap Dikerjakan`.
2. Daftar ini berisi order dengan status teknis `ready_to_process`.
3. Production mulai mengerjakan order.
4. Setelah production memulai pekerjaan, status teknis berubah menjadi `in_progress`.
5. Secara bisnis, status ini tampil sebagai `Sedang Dikerjakan`.

## 7. Kebutuhan per Aplikasi

### 7.1 Aplikasi Customer

Customer perlu melihat status order yang mudah dipahami sepanjang alur pickup sampai produksi.

Kebutuhan:

1. Saat order masih `requested`, customer memahami order sedang menunggu diterima outlet.
2. Saat order `accepted`, customer memahami order sudah diterima dan siap dijemput.
3. Saat order `picking_up`, customer memahami kurir sedang dalam perjalanan atau proses penjemputan.
4. Saat order `received`, customer memahami cucian sudah sampai outlet.
5. Saat order `ready_to_process`, customer memahami order sudah ditimbang, harga sudah muncul, dan order siap dikerjakan.
6. Saat order `in_progress`, customer memahami order sedang dikerjakan.
7. Jika harga belum muncul, customer tidak boleh diberi kesan bahwa pembayaran final sudah tersedia.

### 7.2 Aplikasi Cashier

Cashier membutuhkan dua titik kerja utama dalam alur ini: menerima order dan menimbang order yang sudah sampai outlet.

Kebutuhan:

1. Cashier dapat melihat order customer yang masih `requested`.
2. Cashier dapat menerima order `requested`.
3. Setelah diterima, order berubah menjadi `accepted` dan secara bisnis menjadi `Siap Dijemput`.
4. Cashier dapat melihat order yang sudah sampai outlet dengan status `received` atau label `Di Outlet`.
5. Tombol atau aksi timbang hanya tersedia pada order yang memang sudah bisa ditimbang, terutama status `received`.
6. Setelah cashier menimbang order, harga muncul dan status berubah menjadi `ready_to_process`.
7. Cashier tidak boleh menimbang order yang masih dalam tahap dijemput jika secara operasional cucian belum sampai outlet.

### 7.3 Aplikasi Production atau Kurir

Aplikasi production mencakup kebutuhan kurir dan kebutuhan production worker.

Kebutuhan kurir:

1. Kurir melihat daftar order `Siap Dijemput` dari status teknis `accepted`.
2. Kurir dapat memulai penjemputan sehingga status berubah menjadi `picking_up`.
3. Kurir melihat daftar order `Dalam Perjalanan` dari status teknis `picking_up`.
4. Kurir dapat mengonfirmasi cucian sudah diambil dan sampai outlet.
5. Setelah konfirmasi, status berubah menjadi `received`.
6. Order yang sudah `received` tidak lagi berada di daftar aktif penjemputan kurir.

Kebutuhan production worker:

1. Production worker melihat daftar order `Siap Dikerjakan` dari status teknis `ready_to_process`.
2. Production worker tidak mengerjakan order yang masih `accepted`, `picking_up`, atau `received`.
3. Saat production worker mulai mengerjakan order, status berubah menjadi `in_progress`.

## 8. Business Rules

1. Order `requested` menjadi `accepted` hanya setelah cashier menerima order.
2. Order `accepted` adalah order yang siap dijemput kurir.
3. Order `accepted` belum boleh masuk daftar `Siap Dikerjakan` production.
4. Order `accepted` menjadi `picking_up` hanya setelah kurir memulai penjemputan.
5. Order `picking_up` menjadi `received` hanya setelah kurir mengonfirmasi pickup selesai atau cucian sudah sampai outlet.
6. Order `received` adalah satu-satunya status utama dalam flow pickup yang menandakan cucian sudah ada di outlet dan bisa ditimbang cashier.
7. Order `received` menjadi `ready_to_process` setelah cashier menimbang order dan sistem menghitung harga.
8. Order `ready_to_process` menjadi `in_progress` saat production mulai mengerjakan order.
9. Status `ready_to_process` tidak boleh diberikan sebelum harga order tersedia.
10. Production tidak boleh memulai order dari `accepted`, `picking_up`, atau `received`.
11. Setiap aplikasi harus memakai istilah status yang konsisten dengan konteks user, tetapi tetap mengacu pada status teknis backend yang sama.

## 9. Kebutuhan UI/UX

### Status dan Label

1. Label status harus membantu user memahami posisi order saat ini.
2. Pada konteks kurir, `accepted` sebaiknya tampil sebagai `Siap Dijemput`.
3. Pada konteks umum, `received` harus tampil sebagai `Di Outlet`.
4. Pada konteks produksi, `ready_to_process` harus tampil sebagai `Siap Dikerjakan`.
5. Customer tidak perlu melihat istilah teknis seperti `accepted`, `picking_up`, `received`, atau `ready_to_process`.

### Daftar Order

1. Cashier perlu filter atau bagian yang memudahkan menemukan order `Di Outlet`.
2. Kurir perlu tab atau daftar `Siap Dijemput` dan `Dalam Perjalanan`.
3. Production perlu tab atau daftar `Siap Dikerjakan` dan `Sedang Dikerjakan`.
4. Order tidak boleh muncul di daftar yang tidak sesuai dengan status bisnisnya.

### Detail Order

1. Detail order harus menampilkan status terbaru.
2. Aksi yang tersedia harus sesuai status.
3. Jika order belum sampai outlet, cashier tidak diarahkan untuk menimbang.
4. Jika order belum ditimbang, production tidak diarahkan untuk mulai mengerjakan.
5. Jika order sudah ditimbang, harga harus terlihat dengan jelas.

## 10. Acceptance Criteria

### Status Transition

1. Ketika cashier menerima order `requested`, status berubah menjadi `accepted`.
2. Order `accepted` tampil sebagai `Siap Dijemput` pada aplikasi production atau kurir.
3. Ketika kurir memulai pickup dari order `accepted`, status berubah menjadi `picking_up`.
4. Order `picking_up` tampil sebagai `Dalam Perjalanan`.
5. Ketika kurir confirm pickup selesai, status berubah menjadi `received`.
6. Order `received` tampil sebagai `Di Outlet`.
7. Cashier dapat menimbang order `received`.
8. Setelah penimbangan berhasil dan harga muncul, status berubah menjadi `ready_to_process`.
9. Order `ready_to_process` tampil sebagai `Siap Dikerjakan`.
10. Production dapat memulai order `ready_to_process` dan mengubahnya menjadi `in_progress`.

### Customer App

1. Customer dapat melihat perubahan status order dari diajukan sampai sedang dikerjakan.
2. Customer melihat informasi bahwa harga belum final sebelum order ditimbang.
3. Customer melihat harga setelah order selesai ditimbang.
4. Customer tidak melihat status teknis mentah jika label bisnis tersedia.

### Cashier App

1. Cashier dapat menerima order yang masih `requested`.
2. Setelah accept, order tidak lagi diperlakukan sebagai order yang perlu ditimbang langsung jika flow pickup belum sampai outlet.
3. Cashier dapat menemukan order `Di Outlet`.
4. Tombol timbang tersedia untuk order `received`.
5. Setelah timbang, order berpindah ke status `ready_to_process` dan harga muncul.

### Production App

1. Kurir melihat order `accepted` pada daftar `Siap Dijemput`.
2. Kurir melihat order `picking_up` pada daftar `Dalam Perjalanan`.
3. Setelah confirm pickup, order tidak lagi tampil sebagai order dalam perjalanan.
4. Production worker melihat order `ready_to_process` pada daftar `Siap Dikerjakan`.
5. Production worker tidak melihat order `received` sebagai pekerjaan produksi yang bisa langsung dimulai.

## 11. Catatan Teknis Awal dari Eksplorasi Repo

Catatan ini bukan implementation plan final, tetapi membantu model lain memahami kondisi awal repo:

1. Backend sudah memiliki konstanta status order:
   - `STATUS_ACCEPTED = accepted`
   - `STATUS_PICKING_UP = picking_up`
   - `STATUS_RECEIVED = received`
   - `STATUS_READY_TO_PROCESS = ready_to_process`
   - `STATUS_IN_PROGRESS = in_progress`
2. Backend sudah memberi label `received` sebagai `Di Outlet`.
3. Backend sudah memberi label `ready_to_process` sebagai `Siap Dikerjakan`.
4. Endpoint cashier sudah memiliki aksi accept dan weigh.
5. Endpoint production atau courier sudah memiliki aksi pickup dan confirm pickup.
6. Aplikasi cashier sudah memiliki filter `Di outlet` dengan value `received`.
7. Aplikasi cashier sudah menampilkan tombol timbang pada order status `received`.
8. Aplikasi production sudah memiliki tab pickup `Siap Dijemput` dan `Dalam Perjalanan`.
9. Aplikasi production sudah memiliki daftar order produksi `Siap Dikerjakan` berbasis status `ready_to_process`.

## 12. Risiko yang Perlu Diperhatikan Saat Menyusun Plan

1. Jangan membuat status baru untuk `Siap Dijemput` jika `accepted` sudah mencukupi.
2. Jangan membuat status baru untuk `Di Outlet` jika `received` sudah mencukupi.
3. Jangan memasukkan order `accepted` atau `received` ke daftar produksi `Siap Dikerjakan`.
4. Jangan mengubah label customer dengan istilah internal yang sulit dipahami.
5. Pastikan perubahan label tidak merusak filter status yang memakai value teknis.
6. Pastikan setiap aksi status tetap divalidasi backend, bukan hanya disembunyikan di UI.

## 13. Pertanyaan Terbuka untuk Plan

1. Apakah label `accepted` pada aplikasi cashier tetap `Diterima` atau ikut disesuaikan menjadi `Siap Dijemput` pada konteks tertentu? tetap Diterima saja
2. Apakah customer perlu melihat label `Di Outlet`, atau cukup pesan yang lebih natural seperti `Cucian sudah sampai outlet`? gunakan pesan yang lebih natural yaitu `Cucian sudah sampai outlet`
3. Apakah confirm pickup berarti cucian sudah sampai outlet, atau hanya sudah diambil dari customer? Jika bisnis mengharuskan dua tahap terpisah, plan perlu membahas apakah status tambahan dibutuhkan. confirm pickup berarti cucian diambil, kalo udh sampai outlet baru status berubah, jadi butuh status tambahan untuk menandakan cucian sudah sampai outlet
4. Apakah order drop-off mandiri mengikuti alur `pending_dropoff` menjadi `received`, lalu timbang, lalu `ready_to_process`? untuk dropoff nanti dlu saja, scope kita fokus ke kurir

## 14. Ringkasan untuk AI Penyusun Plan

Plan implementasi harus menjaga alur inti berikut:

```text
requested
  -> cashier accept
accepted / Siap Dijemput
  -> kurir mulai pickup
picking_up / Dalam Perjalanan
  -> kurir confirm pickup sampai outlet
received / Di Outlet
  -> cashier timbang dan harga muncul
ready_to_process / Siap Dikerjakan
  -> production mulai kerja
in_progress / Sedang Dikerjakan
```

Prioritas plan adalah menyelaraskan tiga aplikasi terhadap alur ini tanpa menambah status teknis baru kecuali ditemukan kebutuhan bisnis yang benar-benar tidak bisa diwakili status existing.
