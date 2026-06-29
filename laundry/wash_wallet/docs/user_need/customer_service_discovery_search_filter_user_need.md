# User Need: Discovery, Search, dan Filter Layanan pada Aplikasi Customer

Tanggal: 2026-05-30

## Latar Belakang

Aplikasi customer Wash Wallet saat ini sudah memiliki daftar outlet dan detail outlet yang menampilkan layanan laundry. Customer dapat mencari outlet, membuka outlet, lalu memilih layanan dari outlet tersebut. Kebutuhan berikutnya adalah membuat pengalaman discovery yang lebih kuat agar customer dapat menemukan layanan lintas outlet tanpa harus membuka outlet satu per satu.

Customer sering datang dengan niat yang berbeda-beda. Ada customer yang mencari layanan tertentu seperti **cuci kering**, ada yang mencari outlet terbaik, ada yang mencari harga murah, ada yang mencari outlet dengan gratis ongkir, dan ada yang hanya ingin melihat layanan populer. Search juga perlu lebih toleran terhadap typo, misalnya customer mengetik `cci kerinh` tetapi sistem tetap bisa mengarah ke layanan **Cuci Kering**.

Dokumen ini menjadi acuan user need sebelum dibuat implementation plan. Dokumen ini fokus pada kebutuhan produk dan perilaku pengguna. Detail teknis search engine, endpoint, schema, dan implementasi ranking akan diputuskan pada implementation plan.

## Tujuan

1. Customer dapat menemukan layanan laundry lintas outlet dari satu screen discovery.
2. Customer dapat mencari layanan dengan query bebas, termasuk query yang mengandung typo.
3. Customer dapat melihat informasi outlet pada setiap hasil layanan.
4. Customer dapat memfilter layanan berdasarkan outlet, gratis ongkir, dukungan kurir, kategori/unit, harga, rating, dan ketersediaan outlet.
5. Customer dapat melihat rekomendasi seperti layanan terbaik, outlet terbaik, layanan murah, dan outlet gratis ongkir.
6. Customer dapat memahami apakah sebuah layanan mendukung pickup/delivery kurir atau harus datang langsung ke outlet.
7. Customer dapat memahami bahwa gratis ongkir memiliki syarat dan perlu dihitung ulang berdasarkan alamat, jarak, dan cart.
8. Backend tetap menjadi sumber kebenaran untuk eligibility outlet, layanan, kurir, gratis ongkir, dan ketersediaan order.

## Aktor

- Customer
- Owner outlet
- Sistem

## Istilah Bisnis

### Discovery Screen

Screen customer app yang menampilkan layanan dan outlet lintas outlet. Screen ini membantu customer menemukan layanan sebelum memilih outlet tertentu.

### Search Layanan

Pencarian berbasis kata kunci yang menampilkan hasil utama berupa layanan laundry. Setiap hasil layanan harus membawa informasi outlet asal layanan tersebut.

### Typo-Tolerant Search

Kemampuan search untuk tetap menemukan hasil yang relevan walaupun query customer salah ketik. Contoh:

```text
cci kerinh -> Cuci Kering
```

### Context-Aware Search

Kemampuan search untuk memahami istilah yang umum dipakai customer, synonym, atau kata yang berhubungan dengan domain laundry. Contoh:

```text
dry clean -> Cuci Kering
kilat -> Express / layanan cepat
kg -> Kiloan / Kilogram
```

### Gratis Ongkir Eligible

Status bahwa outlet memiliki program gratis ongkir atau berpotensi memberikan ongkir gratis. Status ini bukan jaminan ongkir final Rp0 sebelum sistem menghitung alamat customer, jarak, minimum order, dan aturan courier pricing.

### Layanan Terbaik

Layanan yang direkomendasikan karena rating, jumlah review, popularitas order, atau sinyal kualitas lain yang tersedia.

### Outlet Terbaik

Outlet yang direkomendasikan karena rating, jumlah review, status aktif, exposure, ketersediaan layanan, jarak, atau sinyal kualitas lain yang tersedia.

## Keputusan Produk

1. Discovery screen bersifat global dan dapat menampilkan layanan dari banyak outlet.
2. Customer tidak wajib memilih outlet terlebih dahulu untuk mencari layanan.
3. Filter outlet tetap tersedia agar customer dapat mempersempit hasil ke outlet tertentu.
4. Saat customer mengetik search, hasil utama adalah layanan.
5. Setiap hasil layanan wajib menampilkan informasi outlet.
6. Outlet relevan dapat ditampilkan sebagai section pendukung, tetapi bukan hasil utama search MVP.
7. Search kosong menampilkan curated sections seperti layanan terbaik, outlet terbaik, murah, gratis ongkir, dan populer.
8. Search aktif menampilkan daftar layanan yang relevan dengan query.
9. Filter gratis ongkir berarti outlet/layanan dari outlet yang eligible gratis ongkir, bukan jaminan ongkir final Rp0.
10. Filter bisa pakai kurir berarti layanan mendukung kurir dan outlet memiliki fitur kurir aktif.
11. Layanan yang tidak mendukung kurir tetap boleh muncul, tetapi harus diberi label **Datang langsung ke outlet**.
12. Outlet yang sedang tutup boleh muncul sebagai informasi, tetapi aplikasi harus memberi status yang jelas dan tidak boleh membuat customer mengira order bisa langsung dibuat.
13. Backend menjadi sumber kebenaran untuk validasi akhir saat customer membuat order.
14. Search engine yang direkomendasikan dari diskusi teknis adalah Laravel Scout + Meilisearch, tetapi user need ini tidak mengunci detail implementasi.

## Masalah Saat Ini

1. Customer perlu masuk ke detail outlet untuk melihat layanan, sehingga sulit membandingkan layanan lintas outlet.
2. Search outlet belum cukup untuk customer yang sebenarnya mencari layanan tertentu.
3. Customer belum dapat melihat layanan terbaik atau layanan murah lintas outlet dalam satu tempat.
4. Customer belum memiliki filter khusus untuk gratis ongkir eligible dan layanan yang bisa pakai kurir.
5. Search berbasis `LIKE` tidak cukup untuk typo seperti `cci kerinh`.
6. Customer dapat kesulitan menemukan istilah layanan jika mengetik sinonim seperti `dry clean`, `kilat`, `kg`, atau `kiloan`.
7. Jika gratis ongkir ditampilkan tanpa konteks syarat, customer bisa mengira semua order pasti Rp0 ongkir.
8. Jika layanan non-kurir tampil tanpa label, customer bisa baru mengetahui batasan kurir saat checkout.

## Kebutuhan Pengguna

### 1. Customer Membuka Discovery Screen

- Customer dapat membuka satu screen khusus untuk menemukan layanan dan outlet.
- Screen dapat diakses dari home atau navigasi customer app.
- Screen menampilkan search bar sebagai aksi utama.
- Screen tetap berguna walaupun customer belum mengetik query.
- Jika lokasi customer tersedia, screen dapat memprioritaskan outlet atau layanan yang lebih dekat.
- Jika lokasi tidak tersedia, screen tetap menampilkan rekomendasi berdasarkan data umum.

### 2. Customer Melihat Section Rekomendasi Saat Search Kosong

- Saat search kosong, aplikasi menampilkan beberapa section rekomendasi.
- Section yang diharapkan:
  - layanan terbaik,
  - outlet terbaik,
  - layanan murah,
  - outlet atau layanan dengan gratis ongkir eligible,
  - layanan populer.
- Section boleh disembunyikan jika data kosong.
- Setiap section harus memiliki judul yang mudah dipahami customer.
- Section tidak boleh membuat customer harus memahami istilah teknis seperti ranking score atau search index.

### 3. Customer Mencari Layanan

- Customer dapat mengetik nama layanan, kategori, unit, atau istilah umum laundry.
- Search harus mendukung typo-tolerant behavior.
- Search harus mendukung synonym atau kata terkait domain laundry.
- Search harus tetap responsif untuk query pendek maupun panjang.
- Search harus menampilkan hasil utama berupa layanan.
- Jika query cocok dengan outlet, outlet tersebut dapat membantu ranking layanan dari outlet tersebut, tetapi kartu layanan tetap menjadi hasil utama.

### 4. Customer Melihat Kartu Layanan pada Hasil Search

- Setiap kartu hasil layanan minimal menampilkan:
  - nama layanan,
  - nama outlet,
  - harga,
  - unit,
  - rating layanan jika ada,
  - jumlah review jika ada,
  - status bisa kurir atau harus datang langsung,
  - status gratis ongkir eligible dari outlet jika ada,
  - status outlet buka/tutup jika tersedia.
- Customer dapat membuka detail layanan atau langsung menuju outlet asal layanan.
- Jika layanan berasal dari outlet berbeda, informasi outlet harus cukup jelas agar customer tidak salah memilih.
- Jika outlet punya jarak dari lokasi customer, jarak dapat ditampilkan.

### 5. Customer Memfilter Berdasarkan Outlet

- Customer dapat memilih satu outlet tertentu sebagai filter.
- Setelah filter outlet aktif, daftar layanan hanya menampilkan layanan dari outlet tersebut.
- Customer dapat menghapus filter outlet untuk kembali ke hasil global.
- Jika customer membuka discovery dari halaman outlet, outlet tersebut dapat otomatis menjadi filter awal.
- Filter outlet tidak boleh menghilangkan informasi bahwa search bersifat global ketika filter dilepas.

### 6. Customer Memfilter Gratis Ongkir

- Customer dapat mengaktifkan filter **Gratis ongkir**.
- Filter ini menampilkan layanan dari outlet yang eligible gratis ongkir.
- Aplikasi harus memberi konteks bahwa gratis ongkir memiliki syarat.
- Syarat yang dapat mempengaruhi gratis ongkir:
  - alamat customer,
  - jarak dari outlet,
  - minimum order,
  - konfigurasi courier setting outlet,
  - cart final.
- Jika alamat belum tersedia, aplikasi tetap boleh menampilkan outlet eligible, tetapi tidak boleh menjanjikan ongkir final Rp0.
- Copy yang direkomendasikan: **Gratis ongkir tersedia dengan syarat**.

### 7. Customer Memfilter Layanan yang Bisa Pakai Kurir

- Customer dapat mengaktifkan filter **Bisa pickup/delivery**.
- Filter ini menampilkan layanan yang mendukung kurir dari outlet yang fitur kurirnya aktif.
- Jika outlet tidak mengaktifkan kurir, layanan dari outlet tersebut tidak boleh dianggap bisa pickup/delivery walaupun layanan memiliki `supportsCourier = true`.
- Jika layanan tidak mendukung kurir, layanan tetap dapat muncul saat filter tidak aktif dengan badge **Datang langsung ke outlet**.
- Filter ini harus selaras dengan aturan pada user need dukungan kurir per layanan.

### 8. Customer Memfilter Harga dan Sorting Murah

- Customer dapat melihat layanan murah lintas outlet.
- Customer dapat sort hasil berdasarkan harga termurah.
- Jika tersedia, customer dapat memakai rentang harga minimum dan maksimum.
- Harga harus selalu ditampilkan dengan unit agar customer paham konteks harga, misalnya per kg atau per item.
- Sort murah tidak boleh menyembunyikan status outlet, status kurir, atau syarat gratis ongkir.

### 9. Customer Memfilter Kategori dan Unit

- Customer dapat mempersempit hasil berdasarkan kategori layanan.
- Customer dapat mempersempit hasil berdasarkan unit jika data tersedia.
- Contoh unit:
  - kg,
  - pcs,
  - meter,
  - pasang.
- Search synonym seperti `kg`, `kilo`, dan `kilogram` perlu diarahkan ke layanan dengan unit yang sesuai jika memungkinkan.

### 10. Customer Melihat Outlet Terbaik

- Discovery screen dapat menampilkan section outlet terbaik.
- Outlet terbaik dapat mempertimbangkan rating, jumlah review, exposure, status aktif, jarak, dan ketersediaan layanan.
- Outlet terbaik tidak harus menjadi hasil utama saat search aktif.
- Customer dapat membuka detail outlet dari section outlet terbaik.
- Outlet yang sedang tutup harus diberi status yang jelas.

### 11. Customer Melihat Layanan Terbaik

- Discovery screen dapat menampilkan section layanan terbaik.
- Layanan terbaik dapat mempertimbangkan rating, jumlah review, popularitas order, atau sinyal lain yang tersedia.
- Jika sinyal popularitas belum tersedia, MVP dapat memakai rating dan review count.
- Jika rating belum tersedia, MVP dapat memakai layanan aktif dari outlet aktif sebagai fallback.

### 12. Customer Melihat Empty State yang Jelas

- Jika search tidak menemukan hasil, aplikasi menampilkan empty state.
- Empty state harus menyarankan customer:
  - memeriksa ejaan,
  - menghapus sebagian filter,
  - mencoba kata kunci lain,
  - memilih outlet lain.
- Empty state tidak boleh terlihat seperti error teknis.
- Jika query mengandung typo berat dan tidak ada hasil, aplikasi dapat menampilkan saran pencarian jika tersedia.

### 13. Customer Melihat Status Loading dan Error

- Saat search atau filter sedang memuat, aplikasi menampilkan loading state.
- Jika gagal memuat data karena koneksi atau server, aplikasi menampilkan error state dengan tombol coba lagi.
- Filter yang sudah dipilih tidak boleh hilang tanpa alasan saat retry.
- Jika data rekomendasi gagal tetapi search masih bisa dipakai, screen tetap harus memberi jalan bagi customer untuk melakukan search.

### 14. Backend Menjadi Sumber Kebenaran

- Frontend hanya membantu pengalaman pencarian dan filter.
- Backend tetap menentukan:
  - outlet aktif atau tidak,
  - outlet buka atau tutup,
  - outlet punya fitur kurir atau tidak,
  - layanan aktif atau tidak,
  - layanan mendukung kurir atau tidak,
  - gratis ongkir eligible atau tidak,
  - harga dan unit layanan,
  - apakah order bisa dibuat.
- Saat customer membuat order dari hasil discovery, backend wajib memvalidasi ulang data terbaru.

## Alur Bisnis yang Diharapkan

### Alur Search Kosong

1. Customer membuka discovery screen.
2. Aplikasi menampilkan search bar dan filter ringkas.
3. Aplikasi menampilkan section rekomendasi.
4. Customer melihat layanan terbaik, outlet terbaik, layanan murah, dan gratis ongkir eligible.
5. Customer memilih layanan atau outlet.
6. Aplikasi membawa customer ke detail layanan/outlet atau flow order yang sesuai.

### Alur Search Layanan

1. Customer mengetik query, misalnya `cci kerinh`.
2. Sistem mencari layanan yang relevan.
3. Sistem menampilkan hasil layanan seperti **Cuci Kering** jika relevan.
4. Setiap hasil layanan menampilkan outlet asal layanan.
5. Customer dapat membuka layanan atau outlet.
6. Jika layanan dipilih, cart/order tetap mengikuti aturan outlet, kurir, dan operational hours.

### Alur Filter Gratis Ongkir

1. Customer mengaktifkan filter **Gratis ongkir**.
2. Sistem menampilkan layanan dari outlet yang eligible gratis ongkir.
3. Aplikasi menampilkan copy bahwa gratis ongkir memiliki syarat.
4. Jika customer memilih layanan, perhitungan ongkir final tetap dilakukan di checkout berdasarkan alamat, jarak, dan cart.
5. Jika ternyata tidak memenuhi syarat, aplikasi harus menjelaskan alasan pada checkout.

### Alur Filter Bisa Kurir

1. Customer mengaktifkan filter **Bisa pickup/delivery**.
2. Sistem hanya menampilkan layanan yang mendukung kurir dan berasal dari outlet dengan fitur kurir aktif.
3. Customer memilih layanan.
4. Checkout tetap memvalidasi ulang apakah seluruh layanan dalam cart bisa memakai kurir.
5. Jika ada perubahan konfigurasi, customer mendapat pesan yang jelas.

### Alur Memilih Outlet dari Filter

1. Customer membuka filter outlet.
2. Customer memilih outlet tertentu.
3. Sistem menampilkan layanan dari outlet tersebut.
4. Customer dapat tetap search layanan dalam outlet tersebut.
5. Customer dapat menghapus filter outlet untuk kembali ke hasil global.

## Aturan Bisnis

1. Discovery screen menampilkan layanan lintas outlet sebagai pengalaman utama.
2. Hasil utama search adalah layanan, bukan outlet.
3. Kartu layanan harus menampilkan outlet asal layanan.
4. Outlet filter bersifat opsional.
5. Search harus mendukung typo tolerance untuk nama layanan yang umum.
6. Search harus mendukung synonym atau kata terkait domain laundry.
7. Filter gratis ongkir memakai status eligible, bukan jaminan ongkir final Rp0.
8. Ongkir final tetap dihitung saat checkout berdasarkan alamat, jarak, dan cart.
9. Filter bisa kurir hanya valid jika layanan mendukung kurir dan outlet memiliki fitur kurir aktif.
10. Layanan non-kurir tetap dapat tampil saat filter bisa kurir tidak aktif.
11. Layanan non-kurir harus diberi label **Datang langsung ke outlet**.
12. Outlet tutup boleh tampil, tetapi harus memiliki status yang jelas.
13. Order tetap tidak boleh dibuat jika aturan operational hours melarang order.
14. Backend wajib validasi ulang saat customer membuat order.
15. Frontend tidak boleh menjadikan hasil search sebagai sumber kebenaran permanen karena konfigurasi outlet dan layanan bisa berubah.

## Rekomendasi Filter MVP

Filter MVP yang dibutuhkan:

1. Search query.
2. Outlet.
3. Gratis ongkir eligible.
4. Bisa pickup/delivery.
5. Kategori.
6. Unit.
7. Harga minimum dan maksimum.
8. Sort by:
   - relevan,
   - terbaik,
   - termurah,
   - terdekat,
   - populer.

Jika implementation plan perlu membatasi MVP, prioritas filter adalah:

1. Search query.
2. Outlet.
3. Gratis ongkir eligible.
4. Bisa pickup/delivery.
5. Sort termurah dan terbaik.

## Rekomendasi Data yang Perlu Tersedia

### Data Layanan pada Hasil Search

```json
{
  "id": 101,
  "name": "Cuci Kering",
  "price": 7000,
  "unitName": "Kilogram",
  "unitSymbol": "kg",
  "averageRating": 4.8,
  "reviewsCount": 24,
  "supportsCourier": true,
  "courierSupportLabel": "Bisa pickup/delivery",
  "outlet": {
    "id": 5,
    "name": "Wash Wallet Darmo",
    "distance": 2.4,
    "isCurrentlyOpen": true,
    "isCourierEnabled": true,
    "hasFreeShipping": true,
    "averageRating": 4.7,
    "reviewsCount": 130
  }
}
```

### Data Gratis Ongkir Eligible

```json
{
  "hasFreeShipping": true,
  "freeShippingLabel": "Gratis ongkir tersedia dengan syarat",
  "freeShippingMessage": "Gratis ongkir mengikuti jarak, minimum order, dan alamat pengiriman."
}
```

### Data Search Metadata

```json
{
  "query": "cci kerinh",
  "correctedQuery": "cuci kering",
  "resultType": "service",
  "filters": {
    "outletId": null,
    "freeShippingEligible": true,
    "supportsCourier": true
  }
}
```

Catatan: bentuk payload final tidak dikunci oleh user need ini. Contoh di atas hanya menjelaskan data yang dibutuhkan oleh customer app.

## UI Requirement

### Search Bar

Placeholder yang direkomendasikan:

```text
Cari layanan atau outlet
```

### Filter Gratis Ongkir

Label:

```text
Gratis ongkir
```

Pesan pendukung:

```text
Gratis ongkir tersedia dengan syarat.
```

### Filter Kurir

Label:

```text
Bisa pickup/delivery
```

### Badge Layanan Kurir

Untuk layanan yang bisa memakai kurir:

```text
Bisa pickup/delivery
```

Untuk layanan yang tidak mendukung kurir:

```text
Datang langsung ke outlet
```

### Empty State

Judul:

```text
Tidak ada layanan yang cocok
```

Deskripsi:

```text
Coba kata kunci lain atau hapus beberapa filter.
```

### Outlet Tutup

Jika outlet sedang tutup:

```text
Outlet sedang tutup
```

Jika ada jadwal buka berikutnya:

```text
Buka kembali pada {jadwal}
```

## Copywriting UI

### Section Layanan Terbaik

```text
Layanan terbaik untuk Anda
```

### Section Outlet Terbaik

```text
Outlet terbaik
```

### Section Layanan Murah

```text
Mulai dari harga hemat
```

### Section Gratis Ongkir

```text
Outlet dengan gratis ongkir
```

### Search Result Header

```text
Hasil layanan
```

### Gratis Ongkir Disclaimer

```text
Gratis ongkir mengikuti alamat, jarak, dan minimum order.
```

### Typo Suggestion

```text
Menampilkan hasil untuk "{correctedQuery}"
```

## Error / Validation Message

### Tidak Ada Hasil

```text
Tidak ada layanan yang cocok. Coba kata kunci lain atau hapus beberapa filter.
```

### Gratis Ongkir Tidak Memenuhi Syarat Saat Checkout

```text
Gratis ongkir tidak berlaku untuk alamat atau pesanan ini.
```

### Layanan Tidak Lagi Tersedia

```text
Layanan ini sudah tidak tersedia. Silakan pilih layanan lain.
```

### Outlet Tidak Lagi Tersedia

```text
Outlet ini belum dapat menerima order saat ini.
```

### Kurir Tidak Tersedia Setelah Validasi Ulang

```text
Pickup/delivery tidak tersedia untuk layanan atau outlet yang dipilih.
```

## Acceptance Criteria

1. Customer dapat membuka discovery screen dari customer app.
2. Discovery screen menampilkan search bar dengan placeholder **Cari layanan atau outlet**.
3. Saat search kosong, discovery screen menampilkan rekomendasi layanan atau outlet jika data tersedia.
4. Rekomendasi minimal mendukung konsep layanan terbaik, outlet terbaik, layanan murah, dan gratis ongkir eligible.
5. Customer dapat mencari layanan lintas outlet.
6. Search menampilkan hasil utama berupa layanan.
7. Setiap hasil layanan menampilkan nama outlet asal layanan.
8. Setiap hasil layanan menampilkan harga dan unit.
9. Setiap hasil layanan menampilkan rating/review jika tersedia.
10. Setiap hasil layanan menampilkan status dukungan kurir.
11. Layanan non-kurir menampilkan badge **Datang langsung ke outlet**.
12. Layanan dari outlet gratis ongkir eligible menampilkan informasi gratis ongkir dengan syarat.
13. Customer dapat memfilter berdasarkan outlet.
14. Customer dapat menghapus filter outlet.
15. Customer dapat memfilter layanan dari outlet yang eligible gratis ongkir.
16. Filter gratis ongkir tidak menjanjikan ongkir final Rp0 sebelum checkout.
17. Customer dapat memfilter layanan yang bisa pickup/delivery.
18. Filter bisa pickup/delivery hanya menampilkan layanan yang mendukung kurir dari outlet dengan fitur kurir aktif.
19. Customer dapat sort layanan berdasarkan harga termurah.
20. Customer dapat melihat layanan terbaik berdasarkan sinyal rating/review/popularitas yang tersedia.
21. Search mendukung typo umum seperti `cci kerinh` untuk menemukan **Cuci Kering** jika data relevan tersedia.
22. Search mendukung synonym domain seperti `dry clean`, `kilat`, `kg`, `kilo`, atau `kilogram` jika synonym dikonfigurasi.
23. Empty state muncul jika tidak ada hasil.
24. Empty state menyarankan customer mencoba kata kunci lain atau menghapus filter.
25. Error state memiliki aksi coba lagi.
26. Outlet tutup ditampilkan dengan status yang jelas.
27. Customer tidak dapat membuat order jika backend menyatakan outlet atau layanan tidak eligible.
28. Backend memvalidasi ulang outlet, layanan, kurir, gratis ongkir, dan ketersediaan order saat checkout.
29. Jika konfigurasi berubah setelah customer melihat hasil search, checkout memakai konfigurasi terbaru.
30. Discovery screen tetap dapat digunakan meskipun lokasi customer tidak tersedia.

## Catatan Relasi dengan User Need Lain

### Relasi dengan Dukungan Kurir per Layanan

Dokumen `docs/user_need/customer_service_courier_eligibility_user_need.md` menetapkan bahwa layanan memiliki konfigurasi `supportsCourier`. Discovery screen harus memakai informasi tersebut untuk badge, filter, dan warning awal.

### Relasi dengan Outlet Tanpa Kurir

Dokumen `docs/user_need/customer_outlet_without_courier_user_need.md` menetapkan bahwa outlet tanpa kurir tetap dapat menerima order self drop-off. Discovery screen harus membedakan outlet yang bisa pickup/delivery dan outlet yang hanya mendukung datang langsung.

### Relasi dengan Operational Hours

Dokumen `docs/user_need/customer_outlet_operational_hours_user_need.md` menetapkan aturan outlet buka/tutup. Discovery screen boleh menampilkan outlet tutup, tetapi harus menampilkan status yang jelas dan tidak boleh melanggar aturan order.

### Relasi dengan Pembayaran

Gratis ongkir eligible di discovery bukan keputusan pembayaran final. Perhitungan ongkir dan pembayaran tetap mengikuti aturan checkout dan payment user need.

## Catatan dari Diskusi Teknis

Diskusi awal merekomendasikan:

1. MVP search memakai Laravel Scout + Meilisearch.
2. Eloquent `LIKE` dapat menjadi fallback sementara.
3. Elasticsearch/OpenSearch belum perlu untuk kebutuhan awal.
4. Semantic/vector search belum perlu untuk MVP.
5. Search perlu mendukung typo tolerance, synonyms, filter outlet/category/unit, filter kurir, filter gratis ongkir, dan ranking sederhana.

Catatan ini menjadi masukan untuk implementation plan, bukan aturan produk yang harus terlihat oleh customer.

## Catatan Ruang Lingkup

In scope:

1. Discovery screen global di customer app.
2. Search layanan lintas outlet.
3. Hasil search utama berupa layanan dengan informasi outlet.
4. Section rekomendasi saat search kosong.
5. Filter outlet, gratis ongkir eligible, bisa pickup/delivery, kategori/unit, harga, dan sort.
6. Label status kurir dan gratis ongkir pada hasil layanan.
7. Empty, loading, error, dan location unavailable state.
8. Validasi ulang backend saat checkout.

Out of scope untuk tahap user need:

1. Detail final endpoint API.
2. Detail final schema search index.
3. Implementasi Laravel Scout, Meilisearch, Typesense, atau search engine lain.
4. Semantic/vector search.
5. Personalisasi rekomendasi berbasis machine learning.
6. Search analytics detail seperti click-through rate dan conversion tracking.
7. Desain UI high fidelity.

## Keputusan untuk Plan

1. Buat satu customer discovery screen global untuk layanan lintas outlet.
2. Hasil utama search adalah layanan, bukan outlet.
3. Setiap kartu layanan harus membawa informasi outlet.
4. Search kosong menampilkan curated sections.
5. Search aktif menampilkan daftar layanan relevan.
6. Filter outlet bersifat opsional.
7. Filter gratis ongkir memakai konsep eligible dengan disclaimer syarat.
8. Filter bisa kurir harus menggabungkan status layanan dan status outlet.
9. Layanan non-kurir tetap tampil jika filter bisa kurir tidak aktif.
10. Backend wajib menjadi sumber kebenaran saat checkout.
11. Plan implementasi perlu mempertimbangkan search typo-tolerant dan synonym.
12. Plan implementasi boleh menambahkan endpoint discovery/search khusus jika endpoint outlet existing tidak cukup.
