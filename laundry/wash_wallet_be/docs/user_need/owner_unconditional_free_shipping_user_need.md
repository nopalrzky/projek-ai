# User Need: Web Owner Gratis Ongkir Semua Tanpa Syarat

Tanggal: 2026-06-06

## 1. Latar Belakang

Owner outlet membutuhkan kontrol yang jelas untuk menanggung ongkir semua order kurir customer tanpa syarat minimum order. Saat ini pengaturan gratis ongkir pada courier setting masih berpotensi dipahami sebagai gratis ongkir bersyarat karena terkait dengan `free_shipping_enabled` dan `min_order_free_shipping`.

Kebutuhan ini berfokus pada website owner sebagai tempat owner mengatur mode gratis ongkir outlet. Customer app dan backend kalkulasi ongkir tetap terdampak, tetapi dokumen ini hanya menjadi acuan kebutuhan untuk sisi web owner dan kontrak backend yang diperlukan agar setting tersebut berjalan benar.

## 2. Ringkasan Kondisi Codebase Saat Ini

### Sudah Ada

1. Web owner sudah memiliki halaman pengaturan kurir outlet.
2. Courier setting sudah memiliki field:
   - `free_shipping_enabled`
   - `min_order_free_shipping`
3. Request update courier setting sudah menerima `freeShippingEnabled` dan `minOrderFreeShipping`.
4. Resource courier setting sudah mengirim `freeShippingEnabled` dan `minOrderFreeShipping`.
5. Backend pricing engine sudah dapat mengembalikan ongkir `0` untuk kondisi gratis ongkir bersyarat minimum order.
6. Customer app sudah disiapkan untuk membaca flag khusus `hasUnconditionalFreeShipping` agar badge Gratis Ongkir hanya tampil untuk gratis ongkir semua.

### Gap yang Relevan

1. Belum ada setting khusus untuk **Gratis Ongkir Semua** tanpa minimum order.
2. Field `free_shipping_enabled` masih ambigu karena dapat berarti gratis ongkir bersyarat.
3. UI owner belum membedakan:
   - tidak ada gratis ongkir,
   - gratis ongkir dengan minimum order,
   - gratis ongkir semua order.
4. Backend belum memiliki sumber kebenaran yang aman untuk badge customer, misalnya `has_unconditional_free_shipping`.
5. Pricing engine belum memprioritaskan gratis ongkir semua sebelum membership customer.
6. Detail order owner/kasir belum wajib menampilkan bahwa ongkir gratis ditanggung outlet.

## 3. Tujuan Fitur

Tujuan utama fitur ini adalah:

1. Owner dapat mengaktifkan dan menonaktifkan gratis ongkir semua dari website owner.
2. Owner dapat membedakan gratis ongkir semua dari gratis ongkir bersyarat minimum order.
3. Owner memahami bahwa biaya ongkir customer menjadi `0` dan ditanggung outlet.
4. Backend memiliki field yang tidak ambigu untuk kalkulasi ongkir dan badge customer.
5. Perubahan setting langsung berlaku untuk order baru dan kalkulasi ongkir yang belum disubmit.
6. Order yang sudah dibuat tetap menyimpan ongkir sesuai hasil kalkulasi saat order dibuat.

## 4. Aktor

1. `owner`
   Mengatur mode gratis ongkir pada outlet dan memahami dampak biaya operasionalnya.
2. `employee/kasir`
   Melihat order yang memakai gratis ongkir outlet agar transparan saat melayani customer.
3. `customer`
   Mendapat ongkir `0` ketika order kurir valid pada outlet yang mengaktifkan gratis ongkir semua.
4. `system`
   Menyimpan setting, menghitung ongkir final, mengirim flag badge, dan menjaga prioritas promo/membership.

## 5. Scope Kebutuhan

Scope utama:

1. Pengaturan gratis ongkir semua pada halaman courier setting web owner.
2. Pembedaan mode gratis ongkir di UI owner.
3. Validasi input agar minimum order tidak wajib saat gratis ongkir semua aktif.
4. Penyimpanan setting per outlet.
5. Kontrak response backend untuk customer badge dan pricing result.
6. Komunikasi ringkas pada owner/kasir bahwa ongkir ditanggung outlet.

Di luar scope:

1. Kurir antar kota.
2. Integrasi kurir pihak ketiga.
3. Voucher gratis ongkir berbasis kode promo.
4. Ranking outlet karena promo gratis ongkir.
5. Perhitungan laporan subsidi outlet yang sangat detail, kecuali hanya menampilkan sumber gratis ongkir.

## 6. Istilah Bisnis

### Gratis Ongkir Semua

Mode setting outlet yang membuat customer membayar ongkir `0` untuk semua order yang menggunakan kurir outlet, selama order tersebut valid menurut aturan layanan kurir.

Aturan utamanya:

1. Tanpa minimum order.
2. Tanpa syarat jarak tambahan selain area layanan kurir existing.
3. Berlaku untuk order baru.
4. Tidak mengaktifkan kurir jika fitur kurir outlet mati.
5. Tidak mengabaikan validasi layanan, jadwal kurir, area layanan, dan status outlet.

### Gratis Ongkir Bersyarat

Mode gratis ongkir yang hanya berlaku jika syarat tertentu terpenuhi, misalnya minimum order.

### Mode Gratis Ongkir

Pilihan di website owner yang membedakan status gratis ongkir outlet. Mode yang dibutuhkan:

1. `none`
   Tidak ada promo gratis ongkir dari outlet.
2. `min_order`
   Gratis ongkir berlaku jika minimum order terpenuhi.
3. `all`
   Gratis ongkir berlaku untuk semua order kurir yang valid.

## 7. Prinsip Dasar Kebutuhan

1. Website owner harus memakai istilah yang jelas, bukan hanya toggle generik `Gratis Ongkir`.
2. Mode gratis ongkir semua harus menjadi setting per outlet.
3. Backend tetap menjadi sumber kebenaran ongkir final.
4. Frontend owner hanya mengirim setting, bukan menentukan ongkir final.
5. Customer app hanya boleh menampilkan badge Gratis Ongkir jika outlet benar-benar mengaktifkan gratis ongkir semua.
6. Setting gratis ongkir semua tidak boleh membuat outlet tanpa kurir terlihat mendukung kurir.
7. Setting gratis ongkir semua tidak boleh mengubah layanan non-kurir menjadi layanan kurir.
8. Gratis ongkir semua harus diprioritaskan sebelum membership free shipping customer.

## 8. User Need Fungsional

### FR-01 Owner Dapat Memilih Mode Gratis Ongkir

1. Pada halaman pengaturan kurir outlet, owner dapat memilih mode gratis ongkir.
2. Mode minimal yang tersedia:
   - `Tidak ada gratis ongkir`
   - `Gratis ongkir dengan minimum order`
   - `Gratis ongkir semua order`
3. UI harus menampilkan pilihan secara eksplisit, misalnya segmented control, radio group, atau card option.
4. Pilihan harus mudah dipahami tanpa owner perlu membaca dokumentasi teknis.
5. Mode yang tersimpan harus terbaca kembali saat owner membuka halaman setting.

### FR-02 Owner Dapat Mengaktifkan Gratis Ongkir Semua Order

1. Owner dapat memilih `Gratis ongkir semua order`.
2. Saat mode ini aktif, customer tidak membayar ongkir untuk order kurir valid.
3. Field minimum order tidak boleh wajib.
4. Field minimum order sebaiknya disembunyikan atau dinonaktifkan agar tidak memberi kesan ada syarat.
5. UI harus memberi copy singkat bahwa ongkir customer akan menjadi gratis tanpa minimum order.

### FR-03 Owner Dapat Menggunakan Gratis Ongkir Bersyarat Minimum Order

1. Owner tetap dapat memilih mode gratis ongkir dengan minimum order jika fitur lama masih dipertahankan.
2. Saat mode ini aktif, field minimum order wajib diisi.
3. UI harus menjelaskan bahwa gratis ongkir hanya berlaku jika total order customer memenuhi minimum.
4. Mode bersyarat tidak boleh membuat customer app menampilkan badge Gratis Ongkir Semua.

### FR-04 Owner Dapat Menonaktifkan Gratis Ongkir

1. Owner dapat memilih `Tidak ada gratis ongkir`.
2. Saat mode ini aktif, ongkir dihitung normal berdasarkan aturan pricing, subsidy, membership, atau aturan lain yang berlaku.
3. Field minimum order boleh dikosongkan atau tidak dipakai.
4. Customer app tidak menampilkan badge Gratis Ongkir karena outlet tidak mengaktifkan gratis ongkir semua.

### FR-05 UI Owner Menampilkan Dampak Biaya Secara Jelas

1. Website owner perlu menampilkan penjelasan singkat pada mode gratis ongkir semua.
2. Copy yang dibutuhkan harus menjelaskan:
   - customer membayar ongkir `Rp 0`,
   - ongkir ditanggung outlet,
   - setting hanya berlaku untuk order kurir yang valid.
3. UI tidak perlu meminta batas jarak khusus selama layanan kurir masih dalam cakupan kota/area layanan outlet.
4. UI harus menghindari copy yang membuat owner mengira fitur ini mengabaikan jadwal atau area layanan kurir.

### FR-06 Setting Disimpan Per Outlet

1. Mode gratis ongkir disimpan pada courier setting outlet terkait.
2. Perubahan pada satu outlet tidak memengaruhi outlet lain.
3. Owner yang memiliki beberapa outlet dapat memiliki mode gratis ongkir berbeda per outlet.
4. Backend harus memastikan owner hanya dapat mengubah outlet yang memang boleh diaksesnya.

### FR-07 Backend Mengirim Field yang Tidak Ambigu ke Customer

1. API outlet customer perlu mengirim flag yang aman untuk badge, misalnya `hasUnconditionalFreeShipping`.
2. Flag tersebut hanya `true` jika:
   - fitur kurir outlet aktif,
   - gratis ongkir semua order aktif,
   - outlet dapat menerima order sesuai status dasar yang berlaku.
3. Flag tidak boleh `true` hanya karena `free_shipping_enabled` untuk minimum order aktif.
4. Jika backend juga mengirim label badge, label yang diharapkan adalah `Gratis Ongkir`.

### FR-08 Pricing Engine Memprioritaskan Gratis Ongkir Semua

1. Saat order kurir valid dan gratis ongkir semua aktif, pricing engine harus mengembalikan `customerPays = 0`.
2. Result kalkulasi perlu menyertakan source yang jelas, misalnya `discountSource = outlet_free_shipping_all`.
3. Gratis ongkir semua harus dievaluasi sebelum membership free shipping.
4. Jika gratis ongkir semua aktif, kuota membership free shipping customer tidak boleh berkurang.
5. Jika order tidak serviceable, gratis ongkir semua tidak boleh memaksa order menjadi valid.

### FR-09 Detail Order Owner/Kasir Menampilkan Sumber Gratis Ongkir

1. Order yang memakai gratis ongkir semua perlu dapat diaudit.
2. Owner/kasir perlu melihat bahwa ongkir customer gratis karena ditanggung outlet.
3. Detail order dapat menampilkan label seperti `Gratis Ongkir Outlet`.
4. Riwayat order lama tidak perlu diubah ketika setting berubah.
5. Jika metadata source belum tersedia pada order lama, UI cukup menampilkan ongkir `Rp 0` tanpa source.

### FR-10 Perubahan Berlaku untuk Order Baru

1. Perubahan setting berlaku untuk order baru.
2. Perubahan setting juga berlaku untuk checkout yang belum disubmit karena backend menghitung ulang ongkir final.
3. Order yang sudah dibuat tidak berubah otomatis.
4. Jika owner menonaktifkan gratis ongkir semua, checkout baru setelah perubahan harus mengikuti aturan terbaru.

### FR-11 Validasi Input Harus Konsisten

1. Jika mode `all`, minimum order tidak wajib.
2. Jika mode `min_order`, minimum order wajib dan harus lebih besar atau sama dengan `0`.
3. Jika mode `none`, field gratis ongkir tidak boleh membuat perhitungan ongkir menjadi gratis.
4. Backend harus tetap memvalidasi input meskipun UI sudah mengatur enable/disable field.

### FR-12 Existing Setting Lama Harus Dimigrasikan dengan Aman

1. Data existing dengan `free_shipping_enabled = true` dan `min_order_free_shipping` terisi sebaiknya dianggap sebagai mode `min_order`.
2. Data existing dengan `free_shipping_enabled = false` dianggap sebagai mode `none`.
3. Data existing tidak boleh otomatis menjadi `all` tanpa keputusan owner.
4. Plan implementasi perlu menentukan migration path agar tidak memunculkan badge gratis ongkir semua secara salah.

## 9. Aturan Bisnis

1. Gratis ongkir semua hanya berlaku untuk order dengan kurir outlet.
2. Gratis ongkir semua hanya berlaku jika fitur kurir outlet aktif.
3. Gratis ongkir semua tidak membuat layanan yang tidak mendukung kurir menjadi dapat dikirim kurir.
4. Gratis ongkir semua tidak mengabaikan jadwal kurir.
5. Gratis ongkir semua tidak mengabaikan area layanan, max distance, atau validasi serviceable existing.
6. Gratis ongkir semua tidak mengabaikan status outlet tutup/nonaktif.
7. Jika order kurir valid dan mode `all` aktif, customer membayar ongkir `0`.
8. Jika mode `min_order` aktif, customer hanya mendapat gratis ongkir jika minimum order terpenuhi.
9. Jika mode `all` aktif, surcharge, minimum fee, tarif flat, tarif per km, tier, dan zona tidak dibebankan ke customer.
10. Backend boleh tetap menghitung estimasi ongkir dasar untuk audit internal, tetapi biaya yang ditagihkan ke customer harus `0`.
11. Gratis ongkir semua memiliki prioritas sebelum membership free shipping.
12. Perubahan setting hanya berlaku ke order baru dan kalkulasi yang belum final.

## 10. Alur Bisnis yang Diharapkan

### Owner Mengaktifkan Gratis Ongkir Semua

1. Owner membuka detail outlet.
2. Owner membuka tab atau halaman pengaturan kurir.
3. Owner memilih mode `Gratis ongkir semua order`.
4. Sistem menampilkan penjelasan bahwa ongkir customer menjadi gratis tanpa minimum order.
5. Owner menyimpan perubahan.
6. Backend menyimpan setting pada courier setting outlet.
7. Customer app mulai menerima flag badge gratis ongkir semua dari API outlet.
8. Checkout baru pada outlet tersebut mengembalikan ongkir customer `0` jika order kurir valid.

### Owner Mengubah ke Gratis Ongkir Bersyarat

1. Owner membuka pengaturan kurir.
2. Owner memilih mode `Gratis ongkir dengan minimum order`.
3. Owner mengisi minimum order.
4. Sistem menyimpan mode bersyarat.
5. Customer app tidak menampilkan badge gratis ongkir semua.
6. Checkout baru hanya gratis ongkir jika minimum order terpenuhi.

### Owner Menonaktifkan Gratis Ongkir

1. Owner membuka pengaturan kurir.
2. Owner memilih mode `Tidak ada gratis ongkir`.
3. Sistem menyimpan perubahan.
4. Customer app tidak menampilkan badge gratis ongkir.
5. Checkout baru memakai perhitungan ongkir normal atau aturan lain yang masih berlaku.

## 11. Acceptance Criteria

1. Owner dapat memilih mode gratis ongkir dari pengaturan kurir outlet.
2. Owner dapat mengaktifkan gratis ongkir semua order.
3. Owner dapat menonaktifkan gratis ongkir semua order.
4. Owner tetap dapat memakai gratis ongkir bersyarat minimum order jika fitur lama dipertahankan.
5. Minimum order tidak wajib saat mode gratis ongkir semua aktif.
6. Minimum order wajib saat mode gratis ongkir bersyarat aktif.
7. Setting tersimpan per outlet.
8. Setting satu outlet tidak mengubah outlet lain.
9. Backend menyimpan field atau mode yang tidak ambigu untuk gratis ongkir semua.
10. API outlet customer mengirim `hasUnconditionalFreeShipping = true` hanya untuk gratis ongkir semua.
11. Badge customer tidak tampil untuk gratis ongkir bersyarat minimum order.
12. Pricing engine mengembalikan `customerPays = 0` saat gratis ongkir semua aktif dan order kurir valid.
13. Pricing result mengirim source yang jelas, misalnya `outlet_free_shipping_all`.
14. Membership free shipping customer tidak terpakai ketika gratis ongkir semua outlet aktif.
15. Order baru setelah setting berubah memakai konfigurasi terbaru.
16. Order lama tidak berubah otomatis.
17. Detail order owner/kasir dapat menampilkan bahwa ongkir gratis ditanggung outlet.
18. Backend tetap menolak order kurir yang tidak valid meskipun gratis ongkir semua aktif.
19. Owner tidak dapat mengubah setting outlet yang bukan miliknya.
20. Migration data existing tidak membuat outlet bersyarat tiba-tiba menjadi gratis ongkir semua.

## 12. Catatan untuk Implementation Plan

Hal yang perlu diputuskan pada plan:

1. Bentuk schema final:
   - boolean baru `unconditional_free_shipping_enabled`, atau
   - enum/mode baru `free_shipping_mode`.
2. Jika memakai boolean baru, mapping mode dapat berupa:
   - `none`: `free_shipping_enabled = false`, `unconditional_free_shipping_enabled = false`
   - `min_order`: `free_shipping_enabled = true`, `unconditional_free_shipping_enabled = false`
   - `all`: `unconditional_free_shipping_enabled = true`
3. Jika memakai enum, nilai yang disarankan:
   - `none`
   - `min_order`
   - `all`
4. Apakah `min_order_free_shipping` dikosongkan saat mode `all`, atau dibiarkan tersimpan tetapi tidak dipakai.
5. Bagaimana menampilkan mode gratis ongkir pada UI existing `ModifierForm`.
6. Apakah butuh component khusus untuk pilihan mode gratis ongkir.
7. Titik backend yang harus diperbarui:
   - migration courier settings,
   - model cast/fillable,
   - request validation,
   - resource courier setting,
   - outlet resource customer,
   - update service,
   - courier pricing engine,
   - order storage jika source diskon perlu disimpan.
8. Strategi test:
   - request validation,
   - pricing engine priority,
   - resource badge flag,
   - owner update courier setting.

## 13. Pertanyaan Terbuka

1. Apakah mode gratis ongkir bersyarat minimum order tetap dipertahankan, atau digantikan sepenuhnya oleh gratis ongkir semua?
2. Apakah schema lebih disukai memakai enum `free_shipping_mode` daripada boolean tambahan?
3. Apakah owner perlu melihat estimasi total subsidi ongkir pada laporan bulanan?
4. Apakah order perlu menyimpan `discount_source` secara eksplisit untuk audit, atau cukup dari fee `0` dan metadata kalkulasi?
5. Apakah customer app perlu menerima `freeShippingBadgeLabel`, atau cukup boolean `hasUnconditionalFreeShipping`?
6. Apakah gratis ongkir semua harus otomatis nonaktif jika fitur kurir outlet dinonaktifkan, atau cukup tidak berlaku selama kurir nonaktif?
7. Apakah owner perlu warning tambahan saat mengaktifkan gratis ongkir semua jika max distance outlet sangat besar?

## 14. Rekomendasi Awal

Untuk implementasi tahap pertama, kebutuhan paling praktis adalah:

1. Tambahkan boolean `unconditional_free_shipping_enabled` pada `courier_settings`.
2. Pertahankan `free_shipping_enabled` dan `min_order_free_shipping` untuk mode bersyarat.
3. Buat UI owner menjadi pilihan 3 mode agar owner tidak bingung.
4. Saat mode `all`, kirim `unconditionalFreeShippingEnabled = true` dan abaikan minimum order.
5. Saat mode `min_order`, kirim `freeShippingEnabled = true` dan wajibkan minimum order.
6. Outlet resource customer mengirim `hasUnconditionalFreeShipping` dari setting baru.
7. Pricing engine memproses `unconditional_free_shipping_enabled` sebelum membership.
8. Simpan atau expose `discountSource = outlet_free_shipping_all` agar checkout dan order detail dapat menampilkan label yang jelas.
