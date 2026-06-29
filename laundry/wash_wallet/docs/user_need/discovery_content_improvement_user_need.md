# User Need: Discovery Content Improvement

Tanggal: 2026-06-07

## Latar Belakang

Discovery screen customer app Wash Wallet perlu membantu customer memilih outlet dan layanan dengan lebih cepat. Saat customer membuka Discovery tanpa query spesifik, customer membutuhkan konten yang mudah discan: outlet mana yang relevan, seperti apa reputasinya, dan layanan unggulan apa yang bisa langsung dipilih.

Saat ini pengalaman discovery berisiko terlalu berat jika customer harus membuka detail outlet satu per satu hanya untuk melihat layanan populer. Di sisi lain, discovery juga tidak boleh membuat tampilan terlalu padat dengan informasi layanan yang belum dibutuhkan pada tahap eksplorasi awal.

Dokumen ini menjadi acuan user need untuk AI model lain saat menyusun implementation plan. Dokumen ini fokus pada kebutuhan produk dan UX konten Discovery. Detail endpoint, payload final, ranking algorithm, dan struktur komponen final diputuskan pada implementation plan.

## Relasi dengan Dokumen Discovery Lain

Dokumen ini harus dibaca bersama:

- `docs/user_need/customer_home_search_discovery_ux_user_need.md`
- `docs/user_need/customer_service_discovery_search_filter_user_need.md`
- `docs/user_need/header_improvement_discovery_screen_user_need.md`
- `docs/user_need/customer_service_courier_eligibility_user_need.md`
- `docs/user_need/customer_outlet_without_courier_user_need.md`
- `docs/user_need/customer_outlet_operational_hours_user_need.md`

Catatan penting:

1. Dokumen `customer_service_discovery_search_filter_user_need.md` menyatakan search aktif menampilkan hasil utama berupa layanan.
2. Dokumen ini memperinci content pattern outlet-first untuk mode discovery/browse/rekomendasi, terutama saat customer belum mengetik query atau sedang melihat rekomendasi outlet.
3. Jika implementation plan ingin menjadikan outlet-card sebagai hasil utama untuk semua mode, plan harus menyebutkan perubahan keputusan produk tersebut secara eksplisit karena itu berbeda dari dokumen discovery search sebelumnya.
4. Header location selector tetap menjadi konteks lokasi. Konten discovery harus menyesuaikan alamat aktif jika data lokasi tersedia.

## Tujuan

1. Customer dapat memahami informasi utama outlet tanpa membuka detail outlet.
2. Customer dapat melihat layanan unggulan dari setiap outlet langsung di Discovery.
3. Customer dapat memilih layanan populer dengan lebih cepat dari Discovery.
4. Customer tetap bisa membuka detail outlet untuk melihat seluruh layanan dan informasi lengkap.
5. Discovery content tetap ringkas, mudah discan, dan tidak terlalu padat.
6. Informasi penting seperti status outlet, dukungan kurir, dan harga tidak menyesatkan customer.
7. Backend tetap menjadi sumber kebenaran untuk outlet, layanan, harga, availability, courier eligibility, dan checkout.

## Aktor

- Customer
- Customer app
- Backend
- Outlet owner

## Istilah Bisnis

### Discovery Content

Konten utama di bawah header dan filter Discovery. Konten ini dapat berupa daftar outlet, daftar layanan, atau section rekomendasi tergantung mode screen dan keputusan plan.

### Outlet Card

Card yang merepresentasikan satu outlet. Card menampilkan ringkasan outlet dan kumpulan layanan unggulan dari outlet tersebut.

### Outlet Information

Bagian atas Outlet Card yang menampilkan data utama outlet seperti foto, nama, alamat singkat, rating, jumlah review, status buka/tutup, jarak, dan estimasi jika tersedia.

### Top Services

Kumpulan layanan unggulan dari satu outlet. Layanan dipilih berdasarkan sinyal seperti most ordered, popular, rating, revenue, atau fallback data yang tersedia.

### Quick Select Service

Interaksi saat customer menekan service card dari Discovery. Aplikasi membawa customer ke Outlet Show Screen dan otomatis membuka bottom sheet/detail layanan yang dipilih.

## Masalah Saat Ini

1. Customer perlu membuka detail outlet untuk mengetahui layanan yang tersedia.
2. Discovery bisa terasa lambat untuk eksplorasi jika setiap outlet harus dibuka satu per satu.
3. Customer belum langsung melihat layanan populer dari outlet pada card discovery.
4. Informasi outlet dan layanan berisiko tercampur tanpa hierarchy yang jelas.
5. Card layanan yang terlalu lengkap dapat membuat Discovery padat dan sulit discan.
6. Klik outlet dan klik service perlu behavior yang berbeda agar customer tidak bingung.
7. Jika status outlet atau layanan berubah, frontend tidak boleh menjadikan data discovery sebagai sumber kebenaran final.

## Keputusan Produk

1. Mode browse/rekomendasi Discovery menggunakan outlet-first content pattern.
2. Setiap Outlet Card merepresentasikan satu outlet.
3. Di dalam setiap Outlet Card, tampilkan section Top Services.
4. Top Services maksimal 9 layanan per outlet.
5. Top Services ditampilkan horizontal scroll agar card tetap ringkas.
6. Service card di Discovery dibuat sederhana: foto, nama layanan, dan harga mulai.
7. Informasi detail seperti deskripsi panjang, promo detail, estimasi detail, kategori, dan badge yang terlalu banyak tidak ditampilkan pada service card discovery.
8. Klik area outlet membuka Outlet Show Screen tanpa membuka service bottom sheet.
9. Klik service card membuka Outlet Show Screen lalu otomatis membuka service bottom sheet untuk layanan tersebut.
10. Klik `Lihat Semua` membuka Outlet Show Screen dengan seluruh layanan outlet.
11. Backend tetap memvalidasi ulang layanan, harga, status outlet, status layanan, courier eligibility, dan cart saat customer membuat order.

## Struktur Konten Discovery

Struktur satu item content:

```text
Outlet Card
1. Outlet Information
2. Top Services
```

Contoh hierarchy:

```text
Wash Express - MERR
Jl. Dr. Ir. H. Soekarno No.123
4.9 (524 review)    1.2 km    Buka

Layanan unggulan                         Lihat Semua
[Cuci Reguler] [Express 3 Jam] [Setrika] [Bed Cover] ...
```

## Section 1: Outlet Information

### Tujuan

Customer dapat menilai outlet secara cepat sebelum membuka detail outlet atau memilih layanan.

### Informasi Minimum

1. Foto outlet.
2. Nama outlet.
3. Alamat singkat.
4. Rating outlet jika tersedia.
5. Jumlah review jika tersedia.
6. Status buka/tutup jika tersedia.

### Informasi Opsional

1. Jarak dari alamat aktif customer.
2. Estimasi pickup/delivery atau estimasi jarak waktu.
3. Status gratis ongkir eligible dengan disclaimer singkat.
4. Badge `Bisa pickup/delivery` jika outlet dan layanan relevan mendukung kurir.

### Aturan Tampilan

1. Nama outlet harus menjadi teks paling dominan pada Outlet Information.
2. Alamat harus ringkas dan memakai ellipsis jika panjang.
3. Rating dan jumlah review ditampilkan satu baris jika data tersedia.
4. Jika rating belum tersedia, jangan tampilkan rating palsu atau `0.0` yang bisa disalahartikan.
5. Jika outlet sedang tutup, tampilkan status `Tutup` atau `Outlet sedang tutup`.
6. Outlet tutup tetap boleh tampil, tetapi customer tidak boleh dibuat mengira order dapat langsung dibuat jika backend melarang order.

Contoh:

```text
Wash Express - MERR
Mulyorejo, Surabaya
4.9 (524 review)    Buka
```

Jika ada jarak:

```text
Wash Express - MERR
Jl. Dr. Ir. H. Soekarno No.123
4.9 (524 review)    1.2 km    Buka
```

## Section 2: Top Services

### Tujuan

Customer dapat melihat layanan unggulan dari outlet tanpa membuka halaman outlet terlebih dahulu.

### Jumlah

Maksimal 9 layanan per outlet.

Jika outlet memiliki kurang dari 9 layanan eligible, tampilkan semua layanan eligible yang tersedia.

### Ranking

Urutan Top Services dapat memakai salah satu atau kombinasi sinyal berikut:

1. Most ordered.
2. Most popular.
3. Highest revenue.
4. Highest rating.
5. Recently ordered.
6. Harga kompetitif.
7. Fallback: layanan aktif terbaru atau layanan aktif pertama dari outlet.

Catatan untuk plan:

Jika sinyal ranking belum tersedia, MVP boleh memakai fallback layanan aktif dengan urutan backend existing. Plan harus menandai ranking advanced sebagai next iteration.

### Layout

Top Services ditampilkan horizontal scroll.

```text
Layanan unggulan                         Lihat Semua

[Service Card] [Service Card] [Service Card] [Service Card]
```

### Empty Section

Jika outlet tidak memiliki layanan aktif yang bisa ditampilkan:

1. Section Top Services boleh disembunyikan.
2. Outlet tetap boleh tampil jika masih relevan.
3. Jika semua outlet tidak memiliki layanan eligible, tampilkan empty state Discovery yang jelas.

## Service Card pada Discovery

### Tujuan

Service card memberi preview cepat tanpa memenuhi Discovery dengan detail berlebihan.

### Informasi Minimum

1. Foto layanan atau placeholder.
2. Nama layanan.
3. Harga mulai.
4. Unit harga jika tersedia, misalnya `/kg`, `/pcs`, `/item`.

Contoh:

```text
Cuci Reguler
Mulai Rp7.000/kg
```

```text
Express 3 Jam
Mulai Rp12.000/kg
```

### Informasi Opsional

Informasi berikut boleh ditampilkan hanya jika tidak membuat card terlalu padat:

1. Badge kecil `Bisa pickup/delivery`.
2. Badge kecil `Datang langsung`.
3. Status layanan tidak tersedia jika backend tetap mengirim layanan tersebut untuk konteks.

### Informasi yang Tidak Diprioritaskan

Untuk menjaga kepadatan informasi, service card discovery tidak perlu menampilkan:

1. Deskripsi panjang.
2. Detail diskon atau promo.
3. Badge promo berlebihan.
4. Estimasi durasi detail.
5. Kategori layanan.
6. Review layanan detail.
7. Tombol kuantitas langsung.

Catatan:

Jika promo atau diskon adalah kebutuhan bisnis penting, cukup tampilkan indikator ringkas dan biarkan detailnya muncul di Outlet Show Screen atau service bottom sheet.

## CTA Lihat Semua

### Posisi

CTA berada di header section Top Services.

```text
Layanan unggulan                         Lihat Semua
```

### Behavior

Saat customer menekan `Lihat Semua`:

1. Aplikasi membuka Outlet Show Screen.
2. Outlet Show Screen menampilkan seluruh layanan outlet.
3. Tidak perlu otomatis membuka service bottom sheet.

## Interaction Flow

### Klik Outlet Area

Area yang termasuk outlet area:

1. Foto outlet.
2. Nama outlet.
3. Alamat outlet.
4. Rating outlet.
5. Status outlet.
6. Area kosong dalam Outlet Information.

Flow:

```text
Discovery
-> tap Outlet Information
Outlet Show Screen
```

Behavior:

1. Aplikasi membuka Outlet Show Screen.
2. Service bottom sheet tidak terbuka otomatis.
3. Customer dapat melihat informasi outlet dan seluruh layanan secara normal.

### Klik Service Card

Area yang termasuk service card:

1. Foto layanan.
2. Nama layanan.
3. Harga layanan.
4. Seluruh area card layanan.

Flow:

```text
Discovery
-> tap Service Card
Outlet Show Screen
-> service bottom sheet terbuka otomatis
```

Behavior:

1. Aplikasi navigate ke Outlet Show Screen sesuai outlet service tersebut.
2. Outlet Show Screen memuat data outlet.
3. Setelah outlet berhasil dimuat, service bottom sheet terbuka otomatis.
4. Layanan yang diklik menjadi active service.
5. Customer dapat langsung menambahkan layanan ke keranjang jika backend menyatakan eligible.

Catatan untuk plan:

Implementation plan perlu menentukan mekanisme deep link atau navigation argument, misalnya:

```text
/outlets/{outletId}?serviceId={serviceId}&openService=true
```

atau navigation extra yang setara.

### Klik Lihat Semua

Flow:

```text
Discovery
-> tap Lihat Semua
Outlet Show Screen
```

Behavior:

1. Aplikasi membuka Outlet Show Screen.
2. Seluruh layanan outlet ditampilkan.
3. Service bottom sheet tidak terbuka otomatis.

## Kebutuhan Pengguna

### UN-01 Melihat Informasi Outlet

Sebagai customer, saya ingin melihat informasi utama outlet di Discovery agar saya dapat menilai outlet sebelum membukanya.

Acceptance Criteria:

1. Outlet Card menampilkan foto outlet.
2. Outlet Card menampilkan nama outlet.
3. Outlet Card menampilkan alamat singkat outlet.
4. Outlet Card menampilkan rating jika tersedia.
5. Outlet Card menampilkan jumlah review jika tersedia.
6. Outlet Card menampilkan status buka/tutup jika tersedia.
7. Alamat panjang dipotong dengan ellipsis.

### UN-02 Melihat Layanan Unggulan Outlet

Sebagai customer, saya ingin melihat layanan unggulan dari setiap outlet agar saya dapat mengetahui layanan populer tanpa membuka outlet terlebih dahulu.

Acceptance Criteria:

1. Outlet Card menampilkan section `Layanan unggulan` jika layanan tersedia.
2. Section menampilkan maksimal 9 layanan.
3. Layanan ditampilkan dalam horizontal scroll.
4. Setiap service card menampilkan foto atau placeholder.
5. Setiap service card menampilkan nama layanan.
6. Setiap service card menampilkan harga mulai dan unit jika tersedia.
7. Section disembunyikan jika outlet tidak memiliki layanan aktif yang dapat ditampilkan.

### UN-03 Membuka Detail Outlet

Sebagai customer, saya ingin membuka detail outlet dari Discovery agar saya dapat melihat informasi lengkap outlet dan seluruh layanan yang tersedia.

Acceptance Criteria:

1. Tap Outlet Information membuka Outlet Show Screen.
2. Tap Outlet Information tidak membuka service bottom sheet.
3. Navigation menggunakan outlet yang benar.
4. Jika outlet gagal dimuat, Outlet Show Screen menampilkan error state yang bisa dicoba ulang.

### UN-04 Memilih Layanan Langsung dari Discovery

Sebagai customer, saya ingin langsung memilih layanan dari Discovery agar proses pemesanan lebih cepat.

Acceptance Criteria:

1. Tap service card membuka Outlet Show Screen.
2. Outlet Show Screen menerima konteks service yang dipilih.
3. Setelah outlet selesai dimuat, service bottom sheet terbuka otomatis.
4. Service yang diklik menjadi active service.
5. Customer dapat menambahkan layanan ke keranjang jika layanan eligible.
6. Jika layanan tidak lagi tersedia, tampilkan pesan yang jelas dan jangan lanjutkan add to cart.

### UN-05 Melihat Seluruh Layanan Outlet

Sebagai customer, saya ingin melihat seluruh layanan outlet agar saya dapat memilih layanan selain yang ditampilkan pada Discovery.

Acceptance Criteria:

1. CTA `Lihat Semua` tersedia pada section Top Services jika outlet memiliki layanan.
2. Tap `Lihat Semua` membuka Outlet Show Screen.
3. Outlet Show Screen menampilkan seluruh layanan outlet.
4. Service bottom sheet tidak terbuka otomatis dari CTA `Lihat Semua`.

### UN-06 Memahami Status Outlet dan Layanan

Sebagai customer, saya ingin melihat status outlet dan batasan layanan agar saya tidak memilih outlet atau layanan yang belum bisa dipesan.

Acceptance Criteria:

1. Outlet tutup diberi label status yang jelas.
2. Layanan yang tidak mendukung kurir tidak boleh terlihat seolah-olah bisa pickup/delivery.
3. Jika outlet tidak mengaktifkan kurir, service card tidak boleh menjanjikan pickup/delivery.
4. Jika layanan tidak eligible untuk order, service bottom sheet atau checkout harus menjelaskan alasan.

## Business Rules

1. Outlet Card merepresentasikan satu outlet.
2. Top Services di dalam Outlet Card harus berasal dari outlet yang sama.
3. Top Services hanya menampilkan layanan aktif atau layanan yang backend nyatakan boleh ditampilkan.
4. Maksimal Top Services adalah 9 item per outlet.
5. Harga layanan harus selalu memakai unit jika unit tersedia.
6. Harga yang ditampilkan adalah harga mulai atau harga minimum yang valid dari backend.
7. Klik outlet dan klik service harus punya behavior berbeda.
8. Klik service tidak langsung menambahkan item ke cart dari Discovery; customer tetap masuk ke service bottom sheet untuk konfirmasi.
9. Outlet tutup boleh tampil, tetapi order tetap mengikuti aturan operational hours backend.
10. Gratis ongkir eligible bukan jaminan ongkir final Rp0.
11. Backend wajib validasi ulang outlet, layanan, harga, kurir, dan eligibility saat add to cart atau checkout.
12. Frontend tidak boleh menganggap data Discovery sebagai sumber kebenaran permanen karena konfigurasi outlet dan layanan dapat berubah.

## Loading, Empty, dan Error State

### Loading State

Saat konten Discovery dimuat:

1. Tampilkan skeleton Outlet Card.
2. Skeleton mencerminkan struktur outlet information dan horizontal services.
3. Jangan tampilkan layar kosong terlalu lama.
4. Header, search, filter, dan alamat aktif tetap terlihat jika sudah tersedia.

### Empty State

Jika tidak ada outlet atau layanan yang dapat ditampilkan:

```text
Belum ada outlet yang cocok
Coba ubah lokasi, kata kunci, atau filter pencarian.
```

CTA opsional:

```text
Atur Ulang Filter
```

### Error State

Jika konten gagal dimuat:

```text
Gagal memuat discovery
Periksa koneksi kamu dan coba lagi.
```

CTA:

```text
Coba Lagi
```

### Partial Empty pada Outlet Card

Jika outlet ada tetapi Top Services kosong:

1. Sembunyikan section Top Services.
2. Outlet Information tetap dapat diklik.
3. CTA `Lihat Semua` tidak perlu ditampilkan jika tidak ada layanan.

## Edge Cases

1. Outlet tidak memiliki foto.
2. Service tidak memiliki foto.
3. Outlet tidak memiliki rating.
4. Outlet memiliki alamat sangat panjang.
5. Outlet sedang tutup.
6. Outlet tidak aktif tetapi masih muncul karena cache.
7. Outlet tidak memiliki layanan aktif.
8. Layanan unggulan kurang dari 9 item.
9. Layanan yang ditampilkan di Discovery sudah tidak tersedia saat diklik.
10. Harga layanan berubah setelah Discovery dimuat.
11. Unit harga tidak tersedia.
12. Customer mengganti alamat aktif sehingga jarak, ongkir, dan coverage berubah.
13. Outlet berada di luar coverage alamat aktif.
14. Outlet tidak mendukung kurir.
15. Layanan tidak mendukung kurir.
16. Search/filter aktif menghasilkan daftar kosong.
17. Koneksi gagal saat memuat outlet card.
18. Navigation ke Outlet Show Screen gagal atau outlet tidak ditemukan.
19. Service bottom sheet gagal terbuka karena outlet belum selesai dimuat.
20. Cart sudah berisi item dari outlet lain saat customer memilih service dari Discovery.

## Rekomendasi Data untuk Plan

Catatan: Payload berikut bukan kontrak final. Ini contoh data yang perlu tersedia agar plan dapat menentukan endpoint, mapper, dan state dengan jelas.

### Discovery Outlet Card

```json
{
  "id": 5,
  "name": "Wash Express - MERR",
  "thumbnailUrl": "https://example.com/outlets/5.jpg",
  "shortAddress": "Mulyorejo, Surabaya",
  "fullAddress": "Jl. Dr. Ir. H. Soekarno No.123, Surabaya",
  "rating": 4.9,
  "reviewCount": 524,
  "distanceKm": 1.2,
  "isCurrentlyOpen": true,
  "isCourierEnabled": true,
  "freeShippingEligible": false,
  "topServices": []
}
```

### Top Service Item

```json
{
  "id": 101,
  "outletId": 5,
  "name": "Cuci Reguler",
  "thumbnailUrl": "https://example.com/services/101.jpg",
  "priceStartsFrom": 7000,
  "unitName": "Kilogram",
  "unitSymbol": "kg",
  "isActive": true,
  "supportsCourier": true,
  "isOrderEligible": true
}
```

### Navigation Context untuk Quick Select Service

```json
{
  "outletId": 5,
  "serviceId": 101,
  "openServiceBottomSheet": true
}
```

## Copywriting UI

### Section Title

```text
Layanan unggulan
```

### CTA

```text
Lihat Semua
```

### Price

```text
Mulai Rp7.000/kg
```

Jika unit tidak tersedia:

```text
Mulai Rp7.000
```

### Outlet Closed

```text
Outlet sedang tutup
```

Jika ada jadwal:

```text
Buka kembali pada {jadwal}
```

### Service Not Available

```text
Layanan ini sudah tidak tersedia. Silakan pilih layanan lain.
```

## Catatan Scope

### In Scope

1. Outlet Card pada Discovery content.
2. Outlet Information.
3. Top Services maksimal 9 item per outlet.
4. Service card sederhana di Discovery.
5. CTA `Lihat Semua`.
6. Tap outlet menuju Outlet Show Screen.
7. Tap service menuju Outlet Show Screen dengan service bottom sheet otomatis.
8. Loading, empty, error, dan partial empty state.
9. Data minimum untuk outlet dan top services.

### Out of Scope

1. Detail desain high fidelity.
2. Ranking algorithm final untuk Top Services.
3. Endpoint final dan schema database.
4. Search engine implementation.
5. Promo engine detail.
6. Perhitungan ongkir final.
7. Add to cart langsung dari Discovery tanpa service bottom sheet.
8. Perubahan aturan cart lintas outlet.
9. Analytics detail seperti CTR atau conversion tracking.

## Prioritas Implementasi

### Phase 1: Outlet Card Foundation

1. Buat Outlet Card dengan Outlet Information.
2. Tampilkan foto, nama, alamat, rating/review jika tersedia, dan status outlet.
3. Tap Outlet Information membuka Outlet Show Screen.
4. Tambahkan loading, empty, dan error state dasar.

### Phase 2: Top Services

1. Tambahkan section `Layanan unggulan`.
2. Tampilkan maksimal 9 layanan horizontal scroll.
3. Service card menampilkan foto, nama, harga mulai, dan unit.
4. CTA `Lihat Semua` membuka Outlet Show Screen.
5. Section Top Services disembunyikan jika kosong.

### Phase 3: Quick Select Service

1. Tap service card membuka Outlet Show Screen dengan konteks service.
2. Outlet Show Screen membuka service bottom sheet otomatis setelah data outlet siap.
3. Tangani state layanan tidak tersedia atau outlet gagal dimuat.
4. Pastikan backend tetap validasi saat customer menambahkan layanan ke cart.

### Phase 4: Ranking dan Optimasi

1. Tambahkan ranking Top Services berdasarkan most ordered, popular, revenue, rating, atau sinyal lain.
2. Tambahkan fallback ranking jika sinyal belum tersedia.
3. Optimasi performa horizontal list dan image loading.
4. Tambahkan analytics jika dibutuhkan product.

## Acceptance Criteria Global

1. Discovery dapat menampilkan daftar Outlet Card pada mode browse/rekomendasi.
2. Setiap Outlet Card menampilkan Outlet Information.
3. Outlet Information minimal memuat foto, nama, alamat, dan status outlet jika tersedia.
4. Rating dan review ditampilkan hanya jika data tersedia.
5. Alamat panjang menggunakan ellipsis.
6. Outlet Card menampilkan Top Services jika outlet memiliki layanan eligible.
7. Top Services maksimal 9 layanan.
8. Top Services ditampilkan horizontal scroll.
9. Service card menampilkan foto atau placeholder, nama layanan, harga mulai, dan unit jika tersedia.
10. Service card tidak menampilkan deskripsi panjang, detail promo, atau informasi berlebihan.
11. Tap Outlet Information membuka Outlet Show Screen tanpa membuka service bottom sheet.
12. Tap `Lihat Semua` membuka Outlet Show Screen tanpa membuka service bottom sheet.
13. Tap service card membuka Outlet Show Screen dan membuka service bottom sheet untuk service tersebut.
14. Jika service tidak lagi tersedia, customer mendapat pesan yang jelas.
15. Outlet tutup tetap diberi status jelas.
16. Layanan non-kurir atau outlet tanpa kurir tidak boleh terlihat seolah-olah mendukung pickup/delivery.
17. Loading state memakai skeleton atau indikator yang sesuai.
18. Empty state muncul jika tidak ada outlet/layanan yang dapat ditampilkan.
19. Error state memiliki aksi `Coba Lagi`.
20. Backend tetap menjadi sumber kebenaran saat add to cart dan checkout.

## Keputusan untuk Plan

1. Plan harus menentukan apakah outlet-first content hanya berlaku untuk mode browse/rekomendasi atau juga mengganti hasil utama search.
2. Rekomendasi default: search aktif tetap memakai service result sesuai dokumen discovery search, sedangkan search kosong/browse memakai outlet card dengan Top Services.
3. Plan perlu menentukan sumber data Top Services: endpoint existing, endpoint baru, atau mapper dari data outlet/detail existing.
4. Plan perlu menentukan navigation contract untuk quick select service.
5. Plan perlu memastikan Outlet Show Screen dapat menerima `serviceId` dan membuka service bottom sheet setelah outlet selesai dimuat.
6. Plan perlu memastikan status outlet, service availability, courier eligibility, harga, dan cart tetap divalidasi ulang oleh backend.
7. Plan perlu menjaga konten Discovery tetap ringkas dan tidak mengulang detail yang lebih tepat ditampilkan di Outlet Show Screen.

## Draft Task/Jira

Title:

```text
Improve Discovery Content with Outlet Cards and Top Services
```

Description:

```text
Improve Discovery content so customers can scan outlet information and see top services directly from each outlet card. Each outlet card should show concise outlet information and a horizontal list of up to 9 top services. Tapping the outlet opens Outlet Show Screen normally. Tapping a service opens Outlet Show Screen and automatically opens the selected service bottom sheet. Tapping Lihat Semua opens Outlet Show Screen without opening the service bottom sheet.
```

Recommended MVP scope:

1. Build Outlet Card with concise Outlet Information.
2. Add Top Services horizontal list with max 9 services.
3. Add `Lihat Semua` CTA.
4. Implement outlet tap navigation.
5. Implement service tap navigation with selected service context if Outlet Show Screen supports it.
6. Add loading, empty, and error states.
