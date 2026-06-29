# User Need: Tombol Navigasi Google Maps untuk Kurir

Tanggal: 2026-06-09

## Latar Belakang

Kurir perlu menuju alamat customer dengan cepat saat melakukan penjemputan. Pada flow kurir, ada dua kondisi utama yang perlu diperhatikan:

1. order yang akan atau siap dijemput,
2. order yang sedang dalam perjalanan untuk dijemput.

Saat ini kurir dapat melihat alamat customer pada order, tetapi untuk membuka Google Maps kurir masih berpotensi harus mencari alamat secara manual. Hal ini memperlambat pekerjaan kurir, terutama ketika alamat panjang, ada banyak order, atau kurir sedang berada di lapangan.

Stakeholder meminta agar tersedia tombol yang ketika diklik akan mengarahkan kurir ke Google Maps. Tombol ini harus tersedia pada titik kerja kurir yang relevan, khususnya saat kurir akan mulai mengambil order dan saat kurir sedang dalam perjalanan.

Dokumen ini menjadi acuan user need untuk AI model lain saat menyusun implementation plan. Dokumen ini fokus pada kebutuhan pengguna, alur bisnis, aturan UX, acceptance criteria, dan catatan hasil eksplorasi awal. Detail teknis final seperti package Flutter, URL scheme, perubahan model, perubahan API, dan lokasi komponen final ditentukan pada dokumen plan.

## Relasi dengan Dokumen Lain

Dokumen ini perlu dibaca bersama:

- `docs/user_need/courier_multi_outlet_pickup_user_need.md`

Catatan relasi:

1. Informasi outlet pada order kurir tetap penting agar kurir tidak salah mengambil order lintas outlet.
2. Tombol Google Maps pada dokumen ini fokus membantu kurir menuju alamat customer atau alamat tujuan operasional yang relevan.
3. Tombol Google Maps tidak mengubah aturan akses order lintas outlet.

## Tujuan

1. Kurir dapat membuka Google Maps langsung dari flow order kurir.
2. Kurir dapat menuju alamat customer tanpa menyalin atau mengetik ulang alamat.
3. Kurir dapat membuka navigasi sebelum mulai mengambil order dari modal konfirmasi pickup.
4. Kurir dapat membuka navigasi dari detail order saat order sedang dalam perjalanan.
5. Sistem memakai koordinat alamat customer jika tersedia.
6. Sistem tetap memiliki fallback memakai alamat teks jika koordinat belum tersedia di response.
7. Tombol navigasi tidak mengubah status order dan tidak menggantikan aksi pickup atau konfirmasi.

## Aktor

- Kurir
- Aplikasi kurir/production
- Backend
- Google Maps

## Istilah Bisnis

### Order Akan atau Siap Dijemput

Order yang sudah siap diambil oleh kurir dari alamat customer. Pada code production saat dokumen ini disusun, tab yang terlihat adalah `Siap Dijemput` dan data diambil dari status `accepted`.

Jika ada bagian bisnis atau UI yang masih menyebut `Akan Dijemput`, penyusun plan perlu menyelaraskan istilah final dengan kebutuhan product. Untuk kebutuhan tombol Google Maps, konteksnya adalah order yang belum mulai dijemput dan kurir akan menekan aksi ambil.

### Order Dalam Perjalanan

Order yang sudah mulai dijemput oleh kurir. Pada code production saat dokumen ini disusun, tab yang terlihat adalah `Dalam Perjalanan` dan data diambil dari status `picking_up`.

Pada kondisi ini, kurir sedang menuju alamat customer atau sedang menjalankan proses penjemputan. Saat order dalam kondisi ini diklik, user need yang diinginkan adalah kurir diarahkan ke detail order, dan detail tersebut menyediakan tombol Google Maps.

### Modal Mulai Penjemputan

Modal atau dialog yang muncul ketika kurir memilih aksi untuk mulai mengambil order dari tab akan atau siap dijemput. Pada code production saat dokumen ini disusun, dialog berjudul `Mulai Penjemputan` dengan aksi `Ambil Sekarang`.

Modal ini perlu menyediakan tombol Google Maps agar kurir bisa membuka alamat terlebih dahulu sebelum benar-benar mengubah status order menjadi dalam perjalanan.

### Tombol Google Maps

Button atau action yang membuka Google Maps menuju alamat atau koordinat tujuan. Tombol ini bukan peta embedded di aplikasi, melainkan shortcut untuk membuka aplikasi Google Maps atau halaman Google Maps.

### Alamat Customer

Alamat customer yang dipakai untuk pickup. Berdasarkan informasi stakeholder, alamat customer dibuat menggunakan Google Maps API, sehingga secara bisnis alamat customer seharusnya memiliki latitude dan longitude.

### Koordinat

Latitude dan longitude dari alamat tujuan. Jika tersedia, koordinat lebih diprioritaskan daripada teks alamat karena lebih akurat untuk navigasi.

## Masalah Saat Ini

1. Kurir harus mencari alamat customer secara manual di Google Maps.
2. Kurir berisiko salah memilih lokasi jika alamat mirip atau panjang.
3. Ketika akan mulai mengambil order, kurir perlu tahu rute sebelum menekan aksi yang mengubah status order.
4. Pada order dalam perjalanan, kurir perlu akses cepat ke Google Maps dari detail order.
5. Data order yang tampil di app saat ini sudah punya snapshot alamat teks, tetapi koordinat belum terlihat sebagai field eksplisit di model order frontend.
6. Jika backend tidak mengirim `customerAddress` beserta latitude/longitude pada list atau detail order kurir, frontend tidak bisa memakai koordinat dan hanya bisa fallback ke query alamat teks.

## Keputusan Produk

1. Tombol Google Maps perlu tersedia pada modal mulai penjemputan.
2. Tombol Google Maps perlu tersedia pada detail order untuk order dalam tab `Dalam Perjalanan`.
3. Pada tab akan atau siap dijemput, ketika kurir menekan aksi ambil, modal yang muncul harus memberi opsi membuka Google Maps sebelum menekan `Ambil Sekarang`.
4. Pada tab `Dalam Perjalanan`, ketika order diklik, kurir diarahkan ke detail order.
5. Detail order pada kondisi `Dalam Perjalanan` harus menampilkan tombol Google Maps.
6. Tujuan utama tombol Google Maps adalah alamat customer untuk pickup.
7. Jika latitude dan longitude customer address tersedia, Google Maps dibuka memakai koordinat tersebut.
8. Jika koordinat belum tersedia tetapi alamat teks tersedia, Google Maps boleh dibuka memakai query alamat teks.
9. Jika koordinat dan alamat teks tidak tersedia, tombol Google Maps tidak ditampilkan atau tampil disabled dengan pesan non-teknis.
10. Tombol Google Maps tidak mengubah status order.
11. Tombol Google Maps tidak menggantikan aksi `Ambil Sekarang`, konfirmasi pickup, foto bukti, atau aksi operasional lain.
12. Jika Google Maps tidak tersedia di perangkat, sistem perlu fallback ke Google Maps web jika memungkinkan.

## User Need

### 1. Kurir Membuka Maps dari Modal Mulai Penjemputan

- Kurir membuka tab order akan atau siap dijemput.
- Kurir memilih order yang ingin diambil.
- Sistem menampilkan modal mulai penjemputan.
- Modal menampilkan ringkasan order dan alamat customer yang akan dituju.
- Modal menyediakan tombol Google Maps.
- Kurir dapat menekan tombol Google Maps untuk melihat rute.
- Setelah membuka Maps, status order tetap belum berubah.
- Kurir tetap perlu menekan aksi `Ambil Sekarang` jika ingin memulai penjemputan.

Contoh struktur modal:

```text
Mulai Penjemputan
Order #ORD-001
Customer: Budi
Alamat: Jl. Mulyosari Utara 12, Surabaya

[Buka Maps] [Ambil Sekarang]
```

### 2. Kurir Membuka Maps dari Detail Order Dalam Perjalanan

- Kurir membuka tab `Dalam Perjalanan`.
- Kurir menekan salah satu order.
- Sistem membuka detail order.
- Detail order menampilkan alamat customer.
- Detail order menyediakan tombol Google Maps dekat informasi alamat.
- Kurir dapat membuka Maps kapan pun selama order masih dalam perjalanan.
- Tombol Maps tidak mengubah status order.

Contoh pada detail:

```text
Alamat Customer
Jl. Mulyosari Utara 12, Surabaya
[Buka Maps]
```

### 3. Kurir Tidak Perlu Menyalin Alamat Manual

- Kurir tidak perlu copy-paste alamat dari aplikasi.
- Kurir tidak perlu mengetik ulang nama jalan, kelurahan, kecamatan, atau detail alamat.
- Jika koordinat tersedia, sistem memakai koordinat.
- Jika hanya snapshot alamat teks tersedia, sistem tetap membuka Google Maps dengan query alamat tersebut.

### 4. Kurir Tetap Memahami Tujuan yang Akan Dibuka

- Tombol Google Maps harus ditempatkan dekat alamat customer.
- Jika screen menampilkan alamat customer dan alamat outlet, tombol harus jelas membuka alamat yang mana.
- Untuk kebutuhan utama ini, tombol pada modal dan detail order mengarah ke alamat customer pickup.
- Jika plan menambahkan tombol ke outlet, label harus berbeda, misalnya `Maps Outlet`.

### 5. Flow Order Tetap Berjalan Normal

- Membuka Google Maps tidak otomatis memulai pickup.
- Membuka Google Maps tidak otomatis mengonfirmasi pickup.
- Membuka Google Maps tidak otomatis menyelesaikan order.
- Kurir tetap harus kembali ke aplikasi untuk menekan aksi order yang sesuai.
- Jika Google Maps gagal dibuka, order tetap berada pada state yang sama.

## Alur Bisnis yang Diharapkan

### Dari Tab Akan atau Siap Dijemput

1. Kurir membuka tab order akan atau siap dijemput.
2. Kurir melihat order dengan status siap diambil.
3. Kurir menekan aksi untuk mengambil order.
4. Sistem menampilkan modal mulai penjemputan.
5. Di dalam modal, kurir melihat alamat customer.
6. Kurir menekan tombol Google Maps.
7. Sistem membuka Google Maps ke alamat customer.
8. Kurir melihat rute.
9. Kurir kembali ke aplikasi.
10. Kurir menekan `Ambil Sekarang` jika siap memulai penjemputan.
11. Baru setelah aksi `Ambil Sekarang`, status order berubah menjadi dalam perjalanan atau status bisnis setara.

### Dari Tab Dalam Perjalanan

1. Kurir membuka tab `Dalam Perjalanan`.
2. Sistem menampilkan order yang sedang dijemput.
3. Kurir menekan order.
4. Sistem membuka detail order.
5. Detail order menampilkan alamat customer dan tombol Google Maps.
6. Kurir menekan tombol Google Maps.
7. Sistem membuka Google Maps ke alamat customer.
8. Kurir kembali ke aplikasi untuk melanjutkan flow konfirmasi pickup sesuai proses yang berlaku.

## Kebutuhan UI/UX

### Posisi Tombol

- Pada modal mulai penjemputan, tombol Google Maps berada dekat alamat dan sejajar dengan aksi modal jika memungkinkan.
- Pada detail order dalam perjalanan, tombol Google Maps berada di section alamat customer.
- Tombol Maps tidak boleh lebih dominan daripada aksi utama order.
- Tombol harus mudah ditekan di perangkat mobile.

### Label dan Icon

- Rekomendasi label utama: `Buka Maps`.
- Alternatif label yang masih bisa dipertimbangkan: `Arahkan` atau `Maps`.
- Gunakan icon yang familiar seperti map, navigation, route, atau direction.
- Jika ada lebih dari satu tujuan pada satu screen, label harus spesifik:
  - `Maps Customer`,
  - `Maps Outlet`.

### State Alamat Tidak Tersedia

- Jika tidak ada koordinat dan tidak ada alamat teks, tombol Google Maps tidak aktif atau tidak ditampilkan.
- Jika tombol disabled, gunakan copy non-teknis seperti `Alamat belum tersedia`.
- UI tidak boleh membuka Google Maps dengan query kosong.
- UI tidak boleh menampilkan `null`, `NaN`, atau URL mentah kepada kurir.

### Saat Google Maps Gagal Dibuka

- Aplikasi menampilkan pesan ringan bahwa Maps gagal dibuka.
- Jika memungkinkan, aplikasi mencoba fallback ke Google Maps web.
- Jika fallback gagal, kurir tetap dapat membaca alamat manual di aplikasi.
- Kegagalan membuka Maps tidak boleh mengubah status order.

## Aturan Bisnis

1. Tombol Google Maps membuka tujuan alamat customer pickup pada flow kurir.
2. Tombol Google Maps pada modal mulai penjemputan tidak mengubah status order.
3. Tombol Google Maps pada detail order dalam perjalanan tidak mengubah status order.
4. Status order hanya berubah ketika kurir menekan aksi operasional yang memang mengubah status, misalnya `Ambil Sekarang`.
5. Koordinat alamat customer diprioritaskan untuk Google Maps.
6. Jika koordinat tidak tersedia, alamat teks boleh dipakai sebagai fallback query.
7. Jika alamat teks dan koordinat tidak tersedia, tombol tidak boleh aktif.
8. Jika ada alamat customer dan alamat outlet pada satu screen, tombol harus jelas membedakan tujuan.
9. Data alamat dan koordinat berasal dari backend atau model order/address yang tersedia.
10. Tombol ini tidak mengubah aturan pickup, delivery, jadwal kurir, ongkir, atau area layanan.

## Temuan Eksplorasi Saat Ini

Temuan ini menjadi masukan untuk penyusun implementation plan:

1. Aplikasi production memiliki screen `PickupScheduleScreen`.
2. Screen tersebut memiliki dua tab:
   - `Siap Dijemput`,
   - `Dalam Perjalanan`.
3. Data tab `Siap Dijemput` diambil dengan status `accepted`.
4. Data tab `Dalam Perjalanan` diambil dengan status `picking_up`.
5. Aksi pada order siap dijemput saat ini memunculkan dialog `Mulai Penjemputan` dengan tombol `Ambil Sekarang`.
6. Aksi pada order dalam perjalanan saat ini mengarah ke screen konfirmasi pickup (`PickupConfirmationScreen`) melalui card action. User need yang diinginkan adalah order dalam perjalanan bisa dibuka ke detail order dan di detail tersebut ada tombol Google Maps.
7. `PickupOrderCard` saat ini menampilkan `pickupAddress`.
8. `PickupConfirmationScreen` saat ini juga menampilkan `pickupAddress`.
9. `OrderModel` dan entity `Order` saat ini memiliki `pickupAddress`, `deliveryAddress`, `customerAddressId`, dan `customerAddress` bertipe dynamic, tetapi belum ada field latitude/longitude eksplisit.
10. Backend `OrderResource` mengirim `customerAddress` hanya ketika relation `customerAddress` diload.
11. Backend `CustomerAddressResource` sudah memiliki `latitude` dan `longitude`.
12. Endpoint order list dan detail pada `OrderController` saat ini perlu dicek oleh penyusun plan karena relation yang diload belum terlihat memasukkan `customerAddress` pada list/detail non-customer.
13. Karena alamat customer dibuat menggunakan Google Maps API, secara bisnis koordinat customer address seharusnya tersedia, tetapi implementation plan tetap perlu memastikan koordinat tersebut sampai ke app kurir.

## Catatan Teknis Awal untuk Penyusun Plan

Catatan ini bukan keputusan final implementasi, tetapi perlu diperhatikan saat menyusun plan:

1. Pastikan order list untuk kurir memuat data yang cukup untuk tombol Google Maps pada modal mulai penjemputan.
2. Pastikan detail order dalam perjalanan memuat data yang cukup untuk tombol Google Maps.
3. Jika ingin memakai koordinat, backend perlu mengirim customer address dengan `latitude` dan `longitude`, atau mengirim field navigasi eksplisit seperti `pickupLatitude` dan `pickupLongitude`.
4. Jika frontend tetap memakai `customerAddress` dynamic, plan perlu menentukan parsing aman untuk mengambil latitude/longitude.
5. Jika model domain perlu lebih kuat, plan dapat menambahkan model customer address atau field khusus navigasi pada `OrderModel` dan entity `Order`.
6. Jika koordinat belum tersedia pada response tertentu, fallback memakai `pickupAddress` sebagai query Google Maps.
7. Untuk URL Google Maps, plan dapat mempertimbangkan format:

```text
https://www.google.com/maps/search/?api=1&query={latitude},{longitude}
```

atau query alamat:

```text
https://www.google.com/maps/search/?api=1&query={encoded_address}
```

8. Pastikan query alamat di-encode dengan benar.
9. Untuk Flutter, plan dapat menggunakan mekanisme open URL yang sudah ada di project atau package seperti `url_launcher` jika belum tersedia.
10. Permission lokasi perangkat tidak menjadi syarat utama untuk membuka tujuan Google Maps. Permission lokasi hanya relevan jika aplikasi ingin memakai posisi kurir sebagai titik awal, dan itu di luar kebutuhan utama dokumen ini.
11. Plan perlu memastikan implementasi berjalan di Android dan iOS.
12. Plan perlu memastikan tombol di modal tidak otomatis menjalankan aksi `Ambil Sekarang`.

## Acceptance Criteria

1. Pada tab order akan atau siap dijemput, ketika kurir memilih aksi ambil, modal mulai penjemputan menampilkan tombol Google Maps.
2. Tombol Google Maps pada modal membuka Google Maps ke alamat customer pickup.
3. Menekan tombol Google Maps pada modal tidak mengubah status order.
4. Status order baru berubah ketika kurir menekan aksi pickup seperti `Ambil Sekarang`.
5. Pada tab `Dalam Perjalanan`, kurir dapat membuka detail order.
6. Detail order dalam perjalanan menampilkan tombol Google Maps.
7. Tombol Google Maps pada detail order membuka Google Maps ke alamat customer pickup.
8. Jika koordinat customer address tersedia dan valid, Google Maps memakai koordinat.
9. Jika koordinat belum tersedia tetapi `pickupAddress` tersedia, Google Maps memakai query alamat teks.
10. Jika koordinat dan alamat teks tidak tersedia, tombol tidak aktif atau tidak ditampilkan.
11. UI tidak menampilkan URL mentah, `null`, `NaN`, atau error teknis kepada kurir.
12. Jika Google Maps gagal dibuka, aplikasi menampilkan pesan yang mudah dipahami.
13. Jika Google Maps gagal dibuka, status order tidak berubah.
14. Tombol ditempatkan dekat informasi alamat sehingga tujuan navigasi jelas.
15. Jika screen memiliki lebih dari satu alamat, kurir dapat membedakan tombol untuk customer dan outlet.
16. Kurir tetap dapat membaca alamat manual walaupun tombol Google Maps tidak tersedia atau gagal dibuka.
17. Implementasi berjalan pada perangkat Android dan iOS sesuai dukungan aplikasi.
18. Data koordinat alamat customer yang tersedia di backend sampai ke aplikasi kurir, atau plan menjelaskan fallback yang dipakai.

## Out of Scope

1. Menampilkan peta embedded di dalam aplikasi.
2. Tracking posisi kurir secara realtime.
3. Optimasi rute multi-stop.
4. Estimasi waktu tempuh.
5. Perubahan status order otomatis berdasarkan lokasi kurir.
6. Validasi bahwa kurir benar-benar sampai di lokasi.
7. Perubahan tarif ongkir.
8. Perubahan area layanan.
9. Perubahan jadwal kurir.
10. Perubahan flow foto bukti pickup selain penempatan tombol Maps.
11. Integrasi aplikasi maps selain Google Maps sebagai kebutuhan utama.

## Open Questions untuk Penyusun Plan

1. Apakah detail order dalam perjalanan memakai screen detail order existing atau perlu screen/detail khusus untuk flow kurir?
2. Apakah tombol Google Maps juga perlu tampil langsung di card order dalam tab `Siap Dijemput` atau cukup di modal mulai penjemputan?
3. Apakah tombol Google Maps juga perlu tampil langsung di card order dalam tab `Dalam Perjalanan` atau cukup di detail order?
4. Apakah backend akan mengirim koordinat sebagai nested `customerAddress.latitude/longitude` atau field eksplisit seperti `pickupLatitude/pickupLongitude`?
5. Apakah perlu tombol Maps ke outlet juga pada order multi-outlet, atau fokus saat ini hanya alamat customer?
6. Apakah label final menggunakan `Buka Maps`, `Arahkan`, atau mengikuti komponen/design system existing?
