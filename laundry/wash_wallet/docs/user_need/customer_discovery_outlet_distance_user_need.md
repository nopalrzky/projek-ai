# User Need: Tampilan Jarak Outlet di Discovery dan Daftar Outlet Customer

Tanggal: 2026-06-09

## Latar Belakang

Stakeholder meminta agar customer dapat melihat jarak outlet pada area discovery dan daftar outlet. Jarak ini penting karena customer perlu menilai outlet mana yang paling masuk akal dipilih berdasarkan lokasi atau alamat yang sedang digunakan.

Pada Discovery, jarak yang ditampilkan adalah jarak outlet terhadap alamat atau jalan yang dipilih oleh customer. Secara default, konteks lokasi memakai alamat primary customer. Jika customer mengganti alamat aktif, jarak perlu dihitung ulang agar informasi yang tampil tetap relevan.

Pada daftar Outlet, jarak tampil hanya jika customer memiliki alamat yang bisa dipakai sebagai referensi. Prioritas alamat adalah alamat primary. Jika tidak ada alamat primary, sistem memakai alamat pertama yang dibuat customer. Jika customer belum memiliki alamat, daftar outlet tetap tampil tetapi tanpa keterangan jarak.

Detail outlet juga perlu menampilkan jarak yang sama ketika outlet dibuka dari Discovery atau daftar Outlet dengan konteks alamat yang sama.

Dokumen ini menjadi acuan user need untuk AI model lain saat menyusun implementation plan. Dokumen ini fokus pada kebutuhan produk, UX, aturan bisnis, dan acceptance criteria. Detail endpoint, schema response final, dan komponen final diputuskan pada implementation plan. Keputusan produk saat ini: alamat dan outlet sudah memiliki latitude/longitude, dan jarak dihitung oleh backend.

## Relasi dengan Dokumen Lain

Dokumen ini perlu dibaca bersama:

- `docs/user_need/customer_home_search_discovery_ux_user_need.md`
- `docs/user_need/customer_service_discovery_search_filter_user_need.md`
- `docs/user_need/discovery_content_improvement_user_need.md`
- `docs/user_need/header_improvement_discovery_screen_user_need.md`
- `docs/user_need/customer_outlet_operational_hours_user_need.md`
- `docs/user_need/customer_outlet_without_courier_user_need.md`

Catatan penting:

1. Header lokasi atau address selector pada Discovery tetap menjadi konteks lokasi aktif customer.
2. Informasi jarak adalah informasi pendukung untuk membantu customer memilih outlet, bukan pengganti validasi checkout.
3. Backend tetap menjadi sumber kebenaran untuk data outlet, alamat, koordinat, availability, courier eligibility, dan perhitungan biaya kurir.
4. Jika dokumen discovery lain mengatur mode hasil pencarian sebagai service-first, jarak outlet tetap bisa ditampilkan sebagai informasi pendukung pada service card atau outlet information.
5. Discovery saat ini sudah memiliki opsi sort `nearest` dengan label `Terdekat`; plan perlu memastikan sort ini memakai jarak backend berdasarkan alamat aktif.

## Tujuan

1. Customer dapat melihat jarak outlet dari alamat aktif pada Discovery.
2. Customer dapat melihat jarak outlet pada daftar outlet jika customer memiliki alamat referensi.
3. Customer memahami konteks jarak yang sedang dipakai berdasarkan alamat yang dipilih.
4. Saat customer mengganti alamat aktif, sistem menghitung ulang jarak terhadap outlet.
5. Jika customer tidak memiliki alamat, daftar outlet tetap bisa digunakan tanpa menampilkan jarak yang menyesatkan.
6. Informasi jarak tidak boleh membuat customer mengira ongkir, area layanan, atau jadwal kurir sudah pasti valid.
7. Perhitungan jarak konsisten antara Discovery, daftar Outlet, dan detail outlet jika memakai konteks alamat yang sama.
8. Backend menghitung jarak berdasarkan latitude/longitude alamat dan outlet.
9. Customer dapat memakai sort `Terdekat` berdasarkan jarak outlet dari alamat aktif.
10. Detail outlet menampilkan jarak yang sama jika data jarak tersedia.

## Aktor

- Customer
- Customer app
- Backend
- Sistem lokasi/alamat

## Istilah Bisnis

### Alamat Primary

Alamat utama customer yang ditandai sebagai alamat default atau primary. Alamat ini menjadi referensi pertama untuk menghitung jarak jika customer belum memilih alamat lain.

### Alamat Pertama

Alamat customer yang paling pertama dibuat ketika customer tidak memiliki alamat primary. Definisi bisnisnya mengikuti `created_at` paling awal atau field waktu pembuatan setara yang dipakai backend.

### Alamat Aktif

Alamat yang sedang dipakai sebagai konteks lokasi di screen customer. Alamat aktif dapat berasal dari:

1. alamat primary,
2. alamat pertama sebagai fallback,
3. alamat yang dipilih customer melalui address selector,
4. alamat baru atau alamat lain yang customer pilih saat sesi berjalan.

### Jarak Outlet

Jarak antara outlet dan alamat aktif customer. Jarak dihitung oleh backend dari latitude/longitude alamat dan outlet.

Format label jarak:

1. Jika jarak di bawah 1 km, tampilkan dalam meter, misalnya `800m`.
2. Jika jarak 1 km atau lebih, tampilkan dalam kilometer, misalnya `1.8km`.

Jarak outlet adalah informasi estimasi lokasi, bukan biaya ongkir final.

### Konteks Lokasi Discovery

Alamat atau jalan yang sedang dipilih customer pada Discovery. Konteks ini menentukan jarak outlet yang ditampilkan pada hasil discovery.

## Masalah Saat Ini

1. Customer belum selalu mendapat informasi jarak outlet saat melihat discovery atau daftar outlet.
2. Customer perlu membuka detail outlet atau menebak jarak berdasarkan alamat teks.
3. Discovery dapat terasa kurang kontekstual karena outlet tidak dikaitkan dengan alamat aktif customer.
4. Jika customer mengganti alamat, informasi outlet dapat tetap terasa sama padahal jaraknya berbeda.
5. Daftar outlet berisiko menampilkan informasi jarak yang salah jika sistem tidak punya aturan fallback alamat yang jelas.
6. Jika customer belum punya alamat, UI berisiko menampilkan jarak palsu, `0 km`, atau placeholder yang membingungkan.

## Keputusan Produk

1. Discovery menampilkan jarak outlet terhadap alamat aktif customer jika data lokasi tersedia.
2. Alamat default untuk Discovery adalah alamat primary customer.
3. Jika customer mengganti alamat pada Discovery atau header lokasi, jarak outlet harus dihitung ulang.
4. Daftar Outlet menampilkan jarak jika customer memiliki alamat yang dapat dipakai.
5. Prioritas alamat pada daftar Outlet adalah:
   - alamat primary,
   - jika tidak ada primary, alamat pertama yang dibuat,
   - jika tidak ada alamat, tidak menampilkan jarak.
6. Jika alamat aktif tidak memiliki koordinat yang valid dan sistem belum bisa menghitung jarak, jarak tidak ditampilkan.
7. Jarak tidak boleh ditampilkan sebagai angka default seperti `0 km` jika jarak tidak diketahui.
8. Jarak tidak otomatis berarti outlet menyediakan kurir ke alamat tersebut.
9. Ongkir, eligibility kurir, dan validasi area layanan tetap dihitung pada flow checkout atau kalkulasi kurir yang relevan.
10. Alamat customer saat ini sudah memiliki latitude dan longitude.
11. Outlet saat ini sudah memiliki latitude dan longitude.
12. Jarak dihitung oleh backend, bukan dihitung manual oleh frontend sebagai sumber utama.
13. Backend perlu mengembalikan jarak dalam data yang cukup untuk ditampilkan konsisten di Discovery, daftar Outlet, dan detail outlet.
14. Format jarak mengikuti aturan:
    - di bawah 1 km tampil sebagai meter, misalnya `800m`,
    - 1 km atau lebih tampil sebagai kilometer, misalnya `1.8km`.
15. Discovery sudah memiliki sort `Terdekat`; sort tersebut perlu memakai jarak backend berdasarkan alamat aktif.
16. Saat customer mengganti alamat aktif, Discovery cukup refresh in-place dan tidak perlu berpindah screen.
17. Detail outlet perlu menampilkan jarak jika dibuka dari konteks alamat yang memiliki jarak valid.

## User Need Discovery

### 1. Customer Melihat Jarak pada Hasil Discovery

- Customer membuka Discovery.
- Sistem menentukan alamat aktif customer.
- Jika alamat aktif memiliki data lokasi yang valid, hasil Discovery menampilkan jarak outlet.
- Jika Discovery menampilkan service card, jarak outlet ditampilkan sebagai bagian dari informasi outlet pendukung.
- Jika Discovery menampilkan outlet card, jarak ditampilkan pada outlet information.
- Jarak harus mudah discan dan tidak mengganggu informasi utama seperti nama layanan, nama outlet, harga, rating, atau status buka/tutup.

Contoh tampilan ringkas:

```text
Wash Express - MERR
Jl. Dr. Ir. H. Soekarno
1.8km    Buka    4.8
```

Jika hasil utama berupa layanan:

```text
Cuci Kering
Wash Express - MERR    1.8km
Mulai Rp7.000/kg
```

### 2. Customer Memakai Alamat Primary sebagai Default

- Saat customer membuka Discovery tanpa memilih alamat khusus, sistem memakai alamat primary.
- Jika alamat primary tersedia dan valid, semua jarak outlet dihitung dari alamat tersebut.
- Header lokasi atau informasi alamat harus tetap menunjukkan alamat yang sedang dipakai agar customer memahami konteks jarak.
- Jika customer memiliki beberapa alamat, primary tetap menjadi default awal.

### 3. Customer Mengganti Alamat dan Jarak Dihitung Ulang

- Customer dapat mengganti alamat aktif dari selector lokasi, header, atau flow pemilihan alamat yang tersedia.
- Setelah alamat aktif berubah, Discovery melakukan refresh in-place dan meminta jarak baru dari backend.
- Jarak yang tampil setelah perubahan alamat harus berdasarkan alamat baru, bukan alamat primary lama.
- State filter, search, dan sorting yang masih relevan boleh dipertahankan saat jarak dihitung ulang.
- Jika alamat baru tidak memiliki koordinat valid, UI menyembunyikan jarak atau memberi state ringan bahwa jarak belum tersedia.

Flow:

```text
Customer buka Discovery
-> Sistem pakai alamat primary
-> Jarak outlet tampil
-> Customer pilih alamat lain
-> Sistem refresh in-place dengan alamat baru
-> Backend menghitung ulang jarak outlet
-> Jarak outlet berubah sesuai alamat baru
```

### 4. Customer Memakai Sort Terdekat

- Discovery sudah memiliki opsi sort `Terdekat`.
- Saat customer memilih sort `Terdekat`, hasil diurutkan berdasarkan jarak outlet dari alamat aktif.
- Jika alamat aktif berubah ketika sort `Terdekat` sedang aktif, sistem refresh in-place dan urutan hasil ikut berubah berdasarkan jarak baru.
- Jika customer tidak memiliki alamat atau jarak tidak tersedia, sort `Terdekat` tidak boleh menghasilkan urutan yang menyesatkan.
- Implementation plan perlu menentukan fallback UX saat sort `Terdekat` dipilih tanpa alamat valid, misalnya:
  - disable opsi sort `Terdekat`,
  - tampilkan ajakan memilih alamat,
  - atau tetap tampilkan hasil default tanpa klaim terdekat.

### 5. Customer Tidak Memiliki Alamat

- Jika customer belum memiliki alamat, Discovery tetap dapat menampilkan hasil outlet atau layanan.
- Jarak outlet tidak ditampilkan.
- UI tidak boleh menampilkan jarak dummy seperti `0 km`, `- km`, atau `NaN km`.
- Jika diperlukan, UI boleh menampilkan ajakan ringan untuk menambahkan alamat, tetapi tidak boleh menghalangi customer melihat discovery kecuali ada kebutuhan bisnis lain.

## User Need Daftar Outlet

### 1. Customer Melihat Jarak pada List Outlet Jika Punya Alamat

- Customer membuka daftar Outlet.
- Sistem menentukan alamat referensi customer.
- Jika alamat referensi tersedia dan valid, setiap item outlet menampilkan jarak.
- Jarak tampil sebagai metadata ringkas pada outlet card/list item.

Contoh:

```text
Wash Express - MERR
Mulyorejo, Surabaya
1.8km    Buka
```

### 2. Prioritas Alamat untuk Daftar Outlet

Urutan pemilihan alamat referensi:

1. Pakai alamat primary jika ada.
2. Jika tidak ada alamat primary, pakai alamat pertama yang dibuat.
3. Jika customer tidak punya alamat, jangan tampilkan jarak.

Aturan:

- Jika alamat primary berubah, daftar outlet memakai primary terbaru.
- Jika alamat pertama dihapus, backend memakai alamat tersisa yang paling awal dibuat sebagai fallback baru.
- Jika alamat yang dipakai tidak memiliki koordinat valid, jarak tidak ditampilkan sampai data lokasi tersedia.

### 3. Customer Tanpa Alamat Tetap Bisa Melihat Outlet

- Daftar Outlet tetap tampil walaupun customer belum memiliki alamat.
- Outlet card tidak menampilkan label jarak.
- Layout card tidak boleh menyisakan ruang kosong aneh karena jarak tidak ada.
- CTA tambah alamat boleh tampil sebagai improvement, tetapi bukan syarat utama untuk melihat daftar outlet.

## User Need Detail Outlet

### 1. Customer Melihat Jarak di Detail Outlet

- Saat customer membuka detail outlet dari Discovery atau daftar Outlet, detail outlet perlu menampilkan jarak jika data jarak tersedia.
- Jarak pada detail outlet memakai konteks alamat yang sama dengan screen asal jika alamat aktif masih sama.
- Jika customer membuka detail outlet langsung tanpa konteks alamat tetapi customer memiliki alamat primary, backend memakai alamat primary sebagai referensi jarak.
- Jika customer tidak memiliki alamat, detail outlet tetap tampil tanpa keterangan jarak.
- Jarak di detail outlet tetap menjadi informasi lokasi, bukan validasi ongkir atau eligibility kurir final.

Contoh:

```text
Wash Express - MERR
1.8km dari Rumah
Buka
```

## Kebutuhan UI/UX

### Format Jarak

- Jarak di bawah 1 km ditampilkan sebagai meter, misalnya `800m`.
- Jarak 1 km atau lebih ditampilkan sebagai kilometer, misalnya `1.8km`.
- Jangan tampilkan `0.8km` untuk jarak 800 meter.
- Jumlah angka desimal untuk kilometer perlu dibatasi agar card tetap ringkas.
- Format label jarak harus konsisten antar Discovery, daftar Outlet, dan detail outlet.

### Posisi Informasi Jarak

- Pada outlet card, jarak ditempatkan bersama metadata seperti status buka/tutup, rating, atau area.
- Pada service card discovery, jarak ditempatkan dekat nama outlet agar customer memahami jarak tersebut milik outlet.
- Jarak tidak boleh lebih dominan daripada nama layanan atau nama outlet.
- Jika ruang sempit, jarak boleh memakai icon lokasi kecil atau teks singkat.

### Empty dan Missing State

- Jika tidak ada alamat, sembunyikan jarak.
- Jika alamat ada tetapi koordinat belum valid, sembunyikan jarak atau tampilkan copy ringan hanya jika dibutuhkan.
- Jangan tampilkan error teknis pada card outlet hanya karena jarak gagal dihitung.
- Jika perhitungan jarak gagal secara umum, screen tetap menampilkan outlet/service tanpa jarak.

### Perubahan Alamat

- Setelah customer mengganti alamat, UI melakukan refresh in-place dan menunjukkan loading atau refresh state yang wajar.
- Data jarak lama tidak boleh tetap tampil jika sedang memakai alamat baru dan belum dihitung ulang.
- Jika sistem memakai cache, cache harus terikat pada alamat aktif agar jarak antar alamat tidak tertukar.

## Aturan Bisnis

1. Jarak dihitung oleh backend dari outlet ke alamat aktif atau alamat referensi customer.
2. Discovery memakai alamat aktif; default awal adalah alamat primary.
3. Daftar Outlet memakai alamat primary, fallback ke alamat pertama yang dibuat, lalu tanpa jarak jika tidak ada alamat.
4. Jarak hanya tampil jika outlet dan alamat memiliki data lokasi yang cukup untuk dihitung.
5. Jarak tidak tampil jika customer tidak punya alamat.
6. Jarak tidak tampil jika koordinat alamat atau outlet tidak valid.
7. Jarak tidak boleh memakai alamat customer yang tidak sedang aktif ketika customer sudah memilih alamat lain.
8. Perubahan alamat customer harus memicu refresh in-place dan perhitungan ulang jarak oleh backend.
9. Jarak yang tampil tidak menentukan ongkir final.
10. Jarak yang tampil tidak menentukan apakah outlet bisa pickup/delivery ke alamat tersebut.
11. Validasi area layanan, jadwal kurir, dan ongkir tetap dilakukan oleh backend pada flow yang relevan.
12. Frontend memakai nilai jarak dari backend sebagai sumber kebenaran.
13. Format label jarak mengikuti aturan backend:
    - `< 1 km` tampil meter, contoh `800m`,
    - `>= 1 km` tampil kilometer, contoh `1.8km`.
14. Sort `Terdekat` memakai jarak backend berdasarkan alamat aktif.
15. Jika sort `Terdekat` aktif dan alamat berubah, hasil perlu di-refresh dan diurutkan ulang berdasarkan alamat baru.
16. Detail outlet menampilkan jarak berdasarkan konteks alamat yang sama jika data tersedia.

## Alur Bisnis yang Diharapkan

### Discovery dengan Alamat Primary

1. Customer memiliki alamat primary.
2. Customer membuka Discovery.
3. Sistem membaca alamat primary sebagai alamat aktif.
4. Sistem mengambil outlet/service discovery dengan parameter alamat aktif atau koordinat alamat.
5. Backend menghitung jarak outlet terhadap alamat aktif.
6. Response berisi jarak outlet dan label jarak yang siap ditampilkan atau data yang cukup untuk membuat label konsisten.
7. UI menampilkan jarak pada item discovery.

### Discovery Setelah Customer Mengganti Alamat

1. Customer membuka Discovery.
2. Sistem menampilkan jarak berdasarkan alamat aktif awal.
3. Customer memilih alamat lain.
4. Sistem memperbarui alamat aktif.
5. Discovery refresh in-place tanpa pindah screen.
6. Backend menghitung ulang jarak outlet terhadap alamat baru.
7. UI menampilkan jarak baru sesuai alamat yang dipilih.

### Discovery dengan Sort Terdekat

1. Customer membuka Discovery dengan alamat aktif yang valid.
2. Customer memilih sort `Terdekat`.
3. Sistem meminta data discovery dengan konteks alamat aktif dan sort terdekat.
4. Backend menghitung jarak dan mengembalikan data yang bisa diurutkan berdasarkan jarak.
5. UI menampilkan hasil berdasarkan outlet paling dekat ke alamat aktif.
6. Jika customer mengganti alamat saat sort `Terdekat` aktif, Discovery refresh in-place dan urutan hasil berubah sesuai alamat baru.

### Daftar Outlet dengan Alamat Primary

1. Customer memiliki alamat primary.
2. Customer membuka daftar Outlet.
3. Sistem memakai alamat primary sebagai referensi jarak.
4. Outlet list menampilkan jarak setiap outlet jika data lokasi valid.

### Daftar Outlet Tanpa Alamat Primary

1. Customer memiliki alamat tetapi tidak ada yang ditandai primary.
2. Customer membuka daftar Outlet.
3. Sistem memakai alamat pertama yang dibuat sebagai fallback.
4. Outlet list menampilkan jarak berdasarkan alamat pertama tersebut.

### Daftar Outlet Tanpa Alamat

1. Customer belum memiliki alamat.
2. Customer membuka daftar Outlet.
3. Sistem menampilkan daftar outlet tanpa jarak.
4. Customer tetap bisa membuka detail outlet.

### Detail Outlet dengan Jarak

1. Customer membuka detail outlet dari Discovery atau daftar Outlet.
2. Sistem memakai alamat aktif atau alamat referensi yang sama dengan screen asal.
3. Backend menghitung atau mengirim jarak outlet terhadap alamat tersebut.
4. UI detail outlet menampilkan jarak jika tersedia.
5. Jika customer tidak memiliki alamat, detail outlet tampil tanpa jarak.

## Catatan Teknis Awal untuk Penyusun Plan

Catatan ini bukan keputusan final schema atau endpoint, tetapi perlu diperhatikan saat menyusun plan:

1. Data alamat customer saat ini sudah memiliki latitude dan longitude.
2. Data outlet saat ini sudah memiliki latitude dan longitude.
3. Backend menjadi sumber perhitungan jarak.
4. Frontend tidak perlu menghitung jarak sendiri sebagai sumber utama.
5. API Discovery, Outlet list, dan detail outlet perlu menerima konteks alamat aktif agar backend menghitung jarak konsisten. Konteks bisa berupa `address_id` atau latitude/longitude alamat aktif sesuai keputusan implementation plan.
6. Response outlet/service sebaiknya memiliki field jarak raw dan label siap tampil, misalnya:

```text
distanceMeters: 800
distanceLabel: "800m"
```

atau:

```text
distanceMeters: 1800
distanceLabel: "1.8km"
```

7. Jika backend hanya mengembalikan angka raw, frontend boleh membuat label, tetapi aturan formatnya tetap mengikuti keputusan dokumen ini: `800m`, bukan `0.8km`; `1.8km` untuk jarak 1 km atau lebih.
8. Cache discovery/outlet/detail perlu memperhitungkan alamat aktif agar jarak alamat A tidak tampil saat customer memilih alamat B.
9. Pagination dan sorting perlu tetap konsisten setelah alamat berubah.
10. Discovery existing sudah memiliki sort `nearest` dengan label `Terdekat`; plan perlu memastikan sort tersebut benar-benar memakai jarak dari backend dan alamat aktif.
11. Saat alamat berubah, UX melakukan refresh in-place. Implementation plan boleh mengatur ulang pagination secara internal jika dibutuhkan, tetapi customer tetap melihat refresh di screen yang sama.
12. Detail outlet perlu menerima atau mengambil ulang konteks alamat agar jarak yang tampil konsisten dengan Discovery dan daftar Outlet.

## Acceptance Criteria

1. Backend menghitung jarak outlet berdasarkan latitude/longitude alamat aktif dan latitude/longitude outlet.
2. Discovery menampilkan jarak outlet jika customer memiliki alamat aktif dengan data lokasi valid.
3. Discovery memakai alamat primary sebagai default saat customer belum memilih alamat lain.
4. Saat customer mengganti alamat aktif di Discovery, screen refresh in-place.
5. Saat customer mengganti alamat aktif di Discovery, jarak outlet dihitung ulang oleh backend berdasarkan alamat baru.
6. Jarak lama tidak tetap tampil setelah alamat aktif berubah.
7. Jika Discovery menampilkan service sebagai result utama, jarak outlet tetap tampil sebagai informasi outlet pendukung jika data tersedia.
8. Jika Discovery menampilkan outlet card, jarak tampil pada outlet information jika data tersedia.
9. Sort `Terdekat` tersedia dan memakai jarak outlet dari alamat aktif.
10. Jika sort `Terdekat` sedang aktif lalu alamat berubah, hasil di-refresh dan diurutkan ulang berdasarkan jarak alamat baru.
11. Daftar Outlet menampilkan jarak jika customer memiliki alamat primary yang valid.
12. Jika customer tidak memiliki alamat primary tetapi memiliki alamat lain, daftar Outlet memakai alamat pertama yang dibuat sebagai referensi jarak.
13. Jika customer tidak memiliki alamat, daftar Outlet tidak menampilkan keterangan jarak.
14. Detail outlet menampilkan jarak jika customer memiliki alamat referensi yang valid.
15. Detail outlet tidak menampilkan jarak jika customer tidak memiliki alamat.
16. Jika alamat atau outlet tidak memiliki koordinat valid, UI tidak menampilkan jarak palsu.
17. UI tidak menampilkan `0 km`, `NaN`, `null`, atau placeholder teknis saat jarak tidak tersedia.
18. Jarak di bawah 1 km tampil sebagai meter, misalnya `800m`.
19. Jarak 1 km atau lebih tampil sebagai kilometer, misalnya `1.8km`.
20. UI tidak menampilkan `0.8km` untuk jarak 800 meter.
21. Informasi jarak tidak mengubah validasi ongkir, area layanan, jadwal kurir, atau checkout.
22. Backend menjadi sumber konsisten untuk jarak pada Discovery, daftar Outlet, dan detail outlet.
23. Perubahan alamat customer tidak menghapus filter/search yang masih relevan kecuali plan menjelaskan alasan UX sebaliknya.
24. Jika perhitungan jarak gagal, screen tetap menampilkan outlet/service/detail outlet tanpa jarak.

## Out of Scope

1. Perubahan tarif ongkir.
2. Perubahan aturan gratis ongkir.
3. Validasi area layanan kurir final.
4. Optimasi rute jalan aktual atau estimasi waktu tempuh.
5. Integrasi map full-screen.
6. Geocoding massal semua alamat lama karena alamat dan outlet saat ini sudah memiliki latitude/longitude.
7. Perubahan default ranking outlet menjadi otomatis terdekat.

## Keputusan atas Open Questions

1. Data alamat customer sudah memiliki latitude dan longitude.
2. Data outlet sudah memiliki latitude dan longitude.
3. Jarak dihitung oleh backend.
4. Format label jarak:
   - di bawah 1 km memakai meter, contoh `800m`,
   - 1 km atau lebih memakai kilometer, contoh `1.8km`.
5. Alamat pertama adalah alamat yang pertama kali dibuat customer.
6. Saat customer mengganti alamat di Discovery, list cukup refresh in-place.
7. Sort `Terdekat` sudah ada di Discovery sebagai `nearest` dan perlu diikat ke alamat aktif.
8. Detail outlet perlu menampilkan jarak yang sama jika dibuka dari Discovery atau daftar Outlet dengan konteks alamat yang sama.
