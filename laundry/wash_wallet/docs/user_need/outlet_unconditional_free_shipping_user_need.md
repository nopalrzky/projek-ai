# User Need: Setting Gratis Ongkir Semua dan Badge Outlet Customer

Tanggal: 2026-06-06

## Latar Belakang

Wash Wallet memiliki layanan kurir outlet untuk pickup/delivery laundry. Saat ini konteks bisnis kurir masih berada dalam cakupan kota yang sama, sehingga kebutuhan ongkir tidak perlu dibuat kompleks seperti pengiriman antar kota.

Owner outlet membutuhkan pengaturan agar outlet dapat menanggung ongkir semua order kurir tanpa syarat minimum order dan tanpa syarat jarak. Ketika outlet mengaktifkan pengaturan ini, customer perlu langsung melihat apresiasi tersebut di aplikasi customer melalui icon atau badge **Gratis Ongkir** pada outlet.

Dokumen ini menjadi acuan user need sebelum dibuat implementation plan oleh AI model lain.

## Tujuan

1. Owner dapat mengaktifkan gratis ongkir untuk semua order kurir pada outlet.
2. Gratis ongkir semua berlaku tanpa minimum order.
3. Gratis ongkir semua berlaku tanpa syarat jarak selama order masih berada dalam area layanan kurir outlet.
4. Customer melihat outlet yang memberi gratis ongkir melalui icon atau badge yang jelas.
5. Customer melihat ongkir bernilai `Rp 0` atau **Gratis** saat checkout.
6. Backend tetap menjadi sumber kebenaran perhitungan ongkir.
7. Pengaturan ini tidak mengganggu aturan outlet tanpa kurir, layanan non-kurir, jadwal kurir, dan validasi area layanan.

## Aktor

- Owner outlet
- Customer
- Kasir
- Sistem

## Istilah Bisnis

### Gratis Ongkir Semua

Pengaturan outlet yang membuat biaya kurir yang dibebankan ke customer menjadi `0` untuk semua order yang memakai kurir outlet.

Aturan utamanya:

- tanpa minimum order,
- tanpa syarat jarak,
- berlaku untuk order baru,
- tetap tunduk pada ketersediaan kurir outlet dan area layanan yang valid.

### Gratis Ongkir Bersyarat

Promo gratis ongkir yang hanya berlaku jika syarat tertentu terpenuhi, misalnya minimum order. Ini berbeda dari **Gratis Ongkir Semua**.

### Badge Gratis Ongkir

Icon, badge, atau label visual pada aplikasi customer yang menandai bahwa outlet tersebut menanggung ongkir untuk customer.

Contoh label:

```text
Gratis Ongkir
```

### Apresiasi Outlet

Bentuk penghargaan produk kepada outlet yang menanggung ongkir customer. Apresiasi minimal berupa badge/icon yang terlihat pada aplikasi customer.

## Keputusan Bisnis

1. Owner outlet dapat mengatur **Gratis Ongkir Semua** dari website owner.
2. Pengaturan dilakukan per outlet.
3. Jika aktif, biaya kurir yang dibayar customer menjadi `0`.
4. Pengaturan ini tidak membutuhkan minimum order.
5. Pengaturan ini tidak membutuhkan batas jarak tambahan.
6. Selama layanan kurir Wash Wallet masih sesama kota, customer tidak perlu melihat syarat jarak untuk badge gratis ongkir.
7. Gratis ongkir semua hanya berlaku jika outlet memang menyediakan kurir dan order memenuhi aturan layanan kurir.
8. Gratis ongkir semua tidak membuat outlet tanpa kurir menjadi seolah-olah memiliki kurir.
9. Gratis ongkir semua tidak mengubah layanan non-kurir menjadi layanan kurir.
10. Gratis ongkir semua tidak mengabaikan jadwal kurir yang tidak tersedia.
11. Gratis ongkir semua tidak mengabaikan validasi outlet tutup.
12. Jika outlet mengaktifkan gratis ongkir semua, aplikasi customer menampilkan badge/icon **Gratis Ongkir** pada outlet tersebut.
13. Badge gratis ongkir menjadi bentuk apresiasi dan sinyal promosi kepada customer.
14. Badge harus tampil sebelum customer checkout, bukan hanya setelah ongkir dihitung.
15. Saat checkout, ringkasan biaya harus menampilkan ongkir sebagai **Gratis** atau `Rp 0`.
16. Perubahan pengaturan berlaku untuk order baru dan kalkulasi ongkir yang belum disubmit.
17. Order yang sudah dibuat menyimpan ongkir sesuai hasil perhitungan saat order dibuat.
18. Jika customer memiliki membership gratis ongkir, kuota membership tidak boleh terpakai ketika outlet sudah memberikan gratis ongkir semua.

## Masalah Saat Ini

1. Pengaturan gratis ongkir berpotensi dipahami sebagai gratis ongkir bersyarat minimum order.
2. Customer belum memiliki sinyal visual yang kuat untuk membedakan outlet yang menanggung ongkir.
3. Outlet yang mau memberi benefit gratis ongkir belum mendapat apresiasi di aplikasi customer.
4. Jika badge hanya membaca flag umum `freeShippingEnabled`, customer bisa melihat badge gratis ongkir walaupun syarat minimum order belum terpenuhi.
5. Jika backend hanya menghitung gratis ongkir setelah checkout, customer terlambat mengetahui benefit outlet.
6. Jika gratis ongkir semua dicampur dengan gratis ongkir membership, kuota membership customer bisa terpakai padahal outlet sudah menanggung ongkir.

## Kebutuhan Pengguna

### 1. Owner Mengaktifkan Gratis Ongkir Semua

- Owner dapat membuka pengaturan kurir outlet.
- Owner melihat opsi **Gratis ongkir semua order**.
- Opsi ini berbentuk toggle atau pilihan mode yang jelas.
- Copy pengaturan perlu menjelaskan bahwa ongkir customer menjadi gratis tanpa minimum order.
- Jika gratis ongkir semua aktif, field minimum order gratis ongkir tidak boleh wajib diisi.
- Jika sistem tetap memiliki promo gratis ongkir bersyarat, owner perlu bisa membedakan:
  - gratis ongkir semua,
  - gratis ongkir dengan minimum order.
- Perubahan pengaturan disimpan per outlet.

### 2. Owner Memahami Dampak Biaya

- Owner perlu melihat bahwa ongkir ditanggung outlet atau merchant.
- Website owner perlu memberi penjelasan singkat bahwa customer tidak membayar ongkir ketika setting aktif.
- Jika ada laporan atau detail order, kasir/owner perlu melihat bahwa ongkir order tersebut gratis karena setting outlet.
- Sistem tidak perlu meminta syarat jarak tambahan selama layanan masih dalam kota yang sama.

### 3. Customer Melihat Badge Gratis Ongkir pada Outlet

- Outlet yang mengaktifkan gratis ongkir semua harus memiliki badge/icon **Gratis Ongkir** di aplikasi customer.
- Badge perlu tampil pada kartu outlet di daftar outlet.
- Badge perlu tampil pada detail outlet.
- Jika discovery/search menampilkan outlet sebagai informasi pendukung layanan, badge gratis ongkir perlu ikut tampil.
- Badge harus mudah dipahami tanpa customer membuka checkout.
- Badge tidak boleh tampil pada outlet yang hanya punya gratis ongkir bersyarat jika customer belum tentu memenuhi syarat.

### 4. Customer Melihat Ongkir Gratis Saat Checkout

- Saat customer memakai kurir dari outlet dengan gratis ongkir semua, ringkasan biaya menampilkan ongkir sebagai **Gratis** atau `Rp 0`.
- Customer tidak perlu memasukkan kode promo.
- Customer tidak perlu memenuhi minimum order.
- Customer tidak perlu melihat pesan batas jarak untuk mendapatkan gratis ongkir.
- Jika order tidak memenuhi area layanan atau jadwal kurir tidak tersedia, customer tetap tidak bisa memaksa order kurir hanya karena outlet punya badge gratis ongkir.

### 5. Perhitungan Backend Selalu Menentukan Ongkir Final

- Backend wajib menghitung ulang ongkir saat checkout atau submit order.
- Frontend hanya menampilkan badge dan preview.
- Jika gratis ongkir semua aktif dan order kurir valid, backend mengembalikan ongkir customer `0`.
- Jika gratis ongkir semua tidak aktif, backend memakai aturan ongkir normal, promo bersyarat, membership, atau subsidi lain sesuai aturan yang berlaku.
- Hasil perhitungan perlu memiliki sumber diskon yang jelas, misalnya `outlet_free_shipping_all` atau nama lain yang konsisten.

### 6. Prioritas terhadap Promo dan Membership

- Gratis ongkir semua dari outlet memiliki prioritas sebelum membership gratis ongkir customer.
- Jika outlet sudah memberi gratis ongkir semua, kuota gratis ongkir membership customer tidak berkurang.
- Jika outlet tidak memberi gratis ongkir semua, membership gratis ongkir tetap dapat berlaku sesuai aturan membership.
- Jika ada promo gratis ongkir bersyarat lain, plan implementasi perlu memastikan customer tidak mendapat perhitungan ganda yang membingungkan.

### 7. Komunikasi di Order dan Riwayat

- Detail order customer perlu menampilkan ongkir sebagai **Gratis** atau `Rp 0`.
- Riwayat order boleh menampilkan label bahwa ongkir ditanggung outlet.
- Dashboard owner/kasir perlu dapat melihat bahwa order memakai gratis ongkir outlet.
- Informasi ini berguna untuk transparansi laporan dan rekonsiliasi.

## Alur Bisnis yang Diharapkan

### Owner Mengaktifkan Gratis Ongkir Semua

1. Owner membuka website owner.
2. Owner masuk ke pengaturan kurir outlet.
3. Owner mengaktifkan **Gratis ongkir semua order**.
4. Sistem menyimpan pengaturan pada outlet.
5. Outlet mulai ditandai sebagai outlet gratis ongkir untuk customer.
6. Pengaturan berlaku untuk order baru.

### Customer Melihat Outlet Gratis Ongkir

1. Customer membuka aplikasi customer.
2. Customer melihat daftar outlet atau hasil discovery.
3. Outlet yang mengaktifkan gratis ongkir semua menampilkan badge/icon **Gratis Ongkir**.
4. Customer membuka outlet.
5. Detail outlet tetap menampilkan badge gratis ongkir.
6. Customer memahami bahwa outlet tersebut menanggung ongkir.

### Customer Checkout dengan Kurir

1. Customer memilih layanan pada outlet yang mengaktifkan gratis ongkir semua.
2. Customer memilih alur kurir jika outlet, layanan, alamat, dan jadwal valid.
3. Sistem menghitung ongkir.
4. Backend mengembalikan ongkir customer `0`.
5. Ringkasan checkout menampilkan ongkir **Gratis**.
6. Customer membuat order.
7. Order menyimpan ongkir final `0` dengan sumber gratis ongkir outlet.

## Aturan Bisnis

1. Gratis ongkir semua adalah pengaturan per outlet.
2. Gratis ongkir semua hanya berlaku untuk order yang menggunakan kurir outlet.
3. Gratis ongkir semua berlaku tanpa minimum order.
4. Gratis ongkir semua berlaku tanpa syarat jarak tambahan selama alamat customer masih berada dalam area layanan kurir outlet.
5. Gratis ongkir semua tidak mengaktifkan fitur kurir jika fitur kurir outlet mati.
6. Gratis ongkir semua tidak mengizinkan pickup/delivery pada layanan yang tidak mendukung kurir.
7. Gratis ongkir semua tidak mengabaikan validasi jadwal kurir.
8. Gratis ongkir semua tidak mengabaikan status outlet tutup atau nonaktif.
9. Jika order kurir valid dan gratis ongkir semua aktif, customer membayar ongkir `0`.
10. Jika gratis ongkir semua aktif, surcharge, minimum fee, tarif per km, tarif zona, tarif tier, dan tarif flat tidak dibebankan ke customer.
11. Jika perlu pencatatan biaya internal, sistem dapat tetap menghitung estimasi ongkir dasar sebagai informasi subsidi outlet.
12. Badge gratis ongkir hanya tampil jika gratis ongkir semua benar-benar aktif.
13. Badge gratis ongkir tidak boleh memakai aturan yang ambigu jika outlet hanya memiliki gratis ongkir bersyarat.
14. Perubahan setting tidak mengubah order yang sudah dibuat.
15. Perubahan setting harus memengaruhi checkout yang belum disubmit ketika backend menghitung ulang ongkir.

## Prioritas Aturan

Jika beberapa kondisi terjadi bersamaan, prioritas keputusan adalah:

1. Outlet aktif dan sedang bisa menerima order.
2. Fitur kurir outlet aktif.
3. Layanan dalam cart mendukung kurir.
4. Alamat dan jadwal kurir valid.
5. Gratis ongkir semua outlet aktif.
6. Promo atau membership lain.
7. Perhitungan tarif ongkir normal.

Penjelasan:

- Gratis ongkir semua hanya menentukan biaya customer menjadi `0`.
- Gratis ongkir semua bukan pengganti validasi apakah order kurir boleh dibuat.
- Jika order kurir tidak valid, customer diarahkan ke aturan lain seperti self drop-off atau pesan tidak tersedia.

## Catatan Teknis Awal untuk Penyusun Plan

Catatan ini bukan keputusan final schema, tetapi perlu diperhatikan saat menyusun plan:

1. Backend sudah memiliki field seperti `free_shipping_enabled` dan `min_order_free_shipping` pada courier setting.
2. Perhitungan saat ini perlu dibedakan antara gratis ongkir bersyarat minimum order dan gratis ongkir semua.
3. Jika tetap memakai field lama, plan harus memastikan `free_shipping_enabled = true` tidak ambigu.
4. Opsi yang lebih jelas adalah menambah mode, misalnya:

```text
freeShippingMode: none | min_order | all
```

atau field boolean khusus seperti:

```text
unconditionalFreeShippingEnabled: true / false
```

5. API outlet customer perlu mengirim flag yang aman untuk badge, misalnya:

```text
hasUnconditionalFreeShipping: true / false
freeShippingBadgeLabel: "Gratis Ongkir"
```

6. API kalkulasi ongkir perlu mengirim sumber diskon, misalnya:

```text
discountSource: "outlet_free_shipping_all"
customerPays: 0
```

7. Jika sistem tetap menghitung ongkir dasar untuk laporan subsidi outlet, nilai tersebut jangan ditampilkan sebagai biaya yang harus dibayar customer.

## Acceptance Criteria

1. Owner dapat mengaktifkan gratis ongkir semua pada pengaturan kurir outlet.
2. Owner dapat menonaktifkan gratis ongkir semua.
3. Gratis ongkir semua tersimpan per outlet.
4. Gratis ongkir semua tidak mewajibkan minimum order.
5. Gratis ongkir semua tidak mewajibkan jarak tertentu.
6. Saat gratis ongkir semua aktif dan order kurir valid, backend menghitung ongkir customer menjadi `0`.
7. Saat gratis ongkir semua aktif, customer tidak perlu memenuhi minimum total belanja.
8. Saat gratis ongkir semua aktif, customer tidak perlu memakai voucher atau promo code.
9. Outlet dengan gratis ongkir semua menampilkan badge/icon **Gratis Ongkir** pada daftar outlet customer.
10. Detail outlet menampilkan badge/icon **Gratis Ongkir**.
11. Discovery/search yang menampilkan informasi outlet ikut menampilkan badge jika outlet punya gratis ongkir semua.
12. Badge gratis ongkir tidak tampil pada outlet yang gratis ongkirnya hanya bersyarat dan syaratnya belum pasti terpenuhi.
13. Checkout menampilkan ongkir sebagai **Gratis** atau `Rp 0`.
14. Detail order menampilkan ongkir sebagai **Gratis** atau `Rp 0`.
15. Order menyimpan ongkir final `0`.
16. Order menyimpan atau mengembalikan sumber gratis ongkir outlet agar bisa diaudit.
17. Kuota membership gratis ongkir customer tidak berkurang jika outlet sudah mengaktifkan gratis ongkir semua.
18. Outlet tanpa fitur kurir tetap tidak menampilkan alur kurir hanya karena punya setting gratis ongkir.
19. Layanan non-kurir tetap tidak bisa memakai kurir meskipun outlet punya gratis ongkir semua.
20. Jadwal kurir yang tidak tersedia tetap membuat alur kurir tidak tersedia.
21. Outlet tutup atau nonaktif tetap tidak bisa menerima order sesuai aturan existing.
22. Perubahan setting berlaku untuk order baru.
23. Order lama tidak berubah otomatis ketika setting gratis ongkir semua diubah.
24. Backend tetap menjadi sumber kebenaran ongkir final.
25. Frontend tidak menentukan ongkir final hanya dari badge.

## Non-Goals

1. Dokumen ini tidak membahas kurir antar kota.
2. Dokumen ini tidak membahas integrasi kurir pihak ketiga.
3. Dokumen ini tidak membahas voucher gratis ongkir berbasis kode promo.
4. Dokumen ini tidak mewajibkan perubahan ranking outlet.
5. Dokumen ini tidak mengubah alur self drop-off untuk outlet tanpa kurir atau layanan non-kurir.

## Catatan Relasi dengan User Need Lain

Dokumen ini perlu diselaraskan dengan:

1. `docs/user_need/customer_outlet_without_courier_user_need.md`
2. `docs/user_need/customer_service_courier_eligibility_user_need.md`
3. `docs/user_need/customer_home_search_discovery_ux_user_need.md`
4. `docs/user_need/customer_service_discovery_search_filter_user_need.md`

Prinsip relasinya:

- Jika outlet tidak punya kurir, aturan outlet tanpa kurir tetap menang.
- Jika layanan tidak mendukung kurir, aturan layanan non-kurir tetap menang.
- Jika order kurir valid dan outlet memberi gratis ongkir semua, ongkir customer menjadi gratis.
- Badge gratis ongkir adalah apresiasi untuk outlet dan sinyal benefit bagi customer, bukan validasi tunggal bahwa semua order pasti bisa memakai kurir.
