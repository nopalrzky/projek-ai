# User Need: Tampilan Gratis Ongkir Semua dan Default Price Strategi Harga Kurir

Tanggal: 2026-06-06

## 1. Latar Belakang

Owner membutuhkan tampilan pengaturan kurir yang lebih jelas ketika outlet mengaktifkan `Gratis Ongkir Semua`. Saat mode ini aktif, strategi harga kurir sebenarnya tidak dipakai untuk menentukan biaya yang dibayar customer karena ongkir menjadi `Rp 0`. Namun jika halaman tetap menampilkan strategi harga seperti zona atau radius, owner dapat salah paham dan mengira aturan harga tersebut masih berlaku ke customer.

Selain itu, strategi harga berbasis zona dan radius bertingkat membutuhkan `default price`. Default price dipakai ketika alamat customer tidak masuk ke aturan zona atau radius yang sudah didefinisikan, tetapi order masih dianggap dapat dilayani oleh kurir outlet.

Dokumen ini menjadi acuan kebutuhan sebelum dibuat implementation plan.

## 2. Ringkasan Kebutuhan

Kebutuhan utama:

1. Pada detail outlet tab kurir, jika `Gratis Ongkir Semua` aktif, strategi harga tidak ditampilkan sebagai daftar aturan harga.
2. Pada detail outlet tab kurir, sistem hanya menampilkan informasi bahwa ongkir outlet adalah gratis.
3. Pada halaman edit courier setting tab strategi harga, jika `Gratis Ongkir Semua` aktif, sistem menampilkan empty/locked state dengan icon dan copy bahwa ongkir seluruhnya gratis.
4. Jika owner ingin mengatur strategi harga, owner harus mengubah mode gratis ongkir agar tidak memilih `Gratis Ongkir Semua` pada pengaturan lainnya.
5. Strategi harga kurir memiliki `default price`.
6. Jika alamat customer tidak masuk scope aturan zona atau radius bertingkat, sistem menggunakan default price sebagai tarif fallback.

## 3. Tujuan

Tujuan fitur ini adalah:

1. Menghindari kebingungan owner ketika gratis ongkir semua aktif.
2. Memastikan UI tidak menampilkan strategi harga yang sedang tidak berdampak ke biaya customer.
3. Memberi arahan yang jelas agar owner tahu cara mengaktifkan kembali pengaturan strategi harga.
4. Menjamin setiap alamat serviceable tetap memiliki harga fallback melalui default price.
5. Mengurangi kasus kalkulasi ongkir gagal hanya karena alamat tidak cocok dengan zona atau tier radius tertentu.

## 4. Aktor

1. `owner`
   Mengatur gratis ongkir, strategi harga kurir, default price, zona, dan radius bertingkat per outlet.
2. `employee/kasir`
   Melihat ringkasan setting kurir dan memahami apakah ongkir sedang gratis atau dihitung berdasarkan aturan harga.
3. `customer`
   Mendapat hasil ongkir yang konsisten saat checkout.
4. `system`
   Menyimpan setting, menentukan prioritas kalkulasi, dan mengirim payload yang cukup untuk frontend.

## 5. Scope Kebutuhan

Scope utama:

1. Tampilan detail outlet tab kurir saat gratis ongkir semua aktif.
2. Tampilan edit courier setting tab strategi harga saat gratis ongkir semua aktif.
3. Penambahan konsep default price pada strategi harga kurir.
4. Fallback default price untuk alamat yang tidak match aturan zona atau radius bertingkat.
5. Validasi dan kontrak data agar frontend dapat membedakan strategi harga aktif, terkunci, atau memakai fallback.

Di luar scope:

1. Voucher atau kode promo ongkir.
2. Integrasi kurir pihak ketiga.
3. Optimasi rute kurir.
4. Laporan subsidi ongkir outlet secara detail.
5. Perubahan order lama yang sudah dibuat.

## 6. Istilah Bisnis

### Gratis Ongkir Semua

Mode pengaturan outlet yang membuat semua order kurir valid memiliki ongkir customer `Rp 0` tanpa minimum order.

### Strategi Harga

Aturan yang dipakai untuk menghitung ongkir normal, misalnya flat, zona, radius bertingkat, base fee per km, atau metode lain yang tersedia.

### Default Price

Tarif fallback yang dipakai saat alamat customer tidak cocok dengan aturan spesifik yang dikonfigurasi, selama alamat tersebut masih boleh dilayani oleh kurir outlet.

Contoh:

1. Outlet memakai zona harga dan hanya mengatur Kelurahan A serta Kelurahan B.
2. Customer memilih alamat di Kelurahan C.
3. Jika Kelurahan C masih dalam area layanan outlet, ongkir menggunakan default price.

### Scope Aturan Harga

Cakupan aturan harga spesifik yang dibuat owner, misalnya daftar zona atau rentang radius bertingkat. Scope ini berbeda dari serviceability kurir.

## 7. Prinsip Dasar

1. `Gratis Ongkir Semua` memiliki prioritas lebih tinggi daripada strategi harga.
2. Saat `Gratis Ongkir Semua` aktif, strategi harga tidak dipakai untuk biaya yang dibayar customer.
3. UI owner harus mencerminkan prioritas tersebut dengan menyembunyikan atau mengunci strategi harga.
4. Owner tetap boleh menyimpan konfigurasi strategi harga lama, tetapi konfigurasi itu tidak aktif selama gratis ongkir semua aktif.
5. Default price hanya dipakai jika order masih serviceable.
6. Jika terdapat aturan hard limit seperti fitur kurir mati, outlet tutup, layanan tidak mendukung kurir, atau max distance yang memang memblokir order, default price tidak boleh memaksa order menjadi valid.
7. Default price tidak sama dengan gratis ongkir. Nilainya harus angka ongkir normal, termasuk boleh `0` hanya jika owner memang mengatur demikian dan plan mengizinkan.

## 8. User Need Fungsional

### FR-01 Detail Outlet Tab Kurir Menampilkan State Gratis

1. Ketika outlet mengaktifkan `Gratis Ongkir Semua`, detail outlet tab kurir tidak menampilkan daftar strategi harga seperti zona, tier radius, flat fee, atau modifier harga.
2. Tab kurir menampilkan state ringkas bahwa ongkir seluruh order kurir valid adalah gratis.
3. Copy yang disarankan:
   - `Gratis Ongkir`
   - `Ongkir seluruh order kurir valid ditanggung outlet.`
4. State ini dapat memakai badge, card, atau banner agar mudah terlihat.
5. Owner tetap dapat melihat informasi lain yang tidak terkait strategi harga, seperti status kurir, jadwal kurir, dan layanan yang mendukung kurir.

### FR-02 Detail Outlet Tidak Menampilkan Strategi Harga yang Tidak Aktif

1. Jika `Gratis Ongkir Semua` aktif, informasi strategi harga tidak boleh tampil seolah-olah sedang digunakan.
2. Sistem tidak perlu menghapus data strategi harga lama dari database.
3. Jika perlu, UI boleh menampilkan teks kecil seperti `Strategi harga disimpan, tetapi tidak aktif selama Gratis Ongkir Semua dipilih.`
4. Tujuannya adalah mencegah owner mengira customer masih dikenakan tarif zona atau radius.

### FR-03 Edit Courier Setting Tab Strategi Harga Menampilkan Locked State

1. Pada halaman edit courier setting, tab `Strategi Harga` harus mendeteksi jika `Gratis Ongkir Semua` aktif.
2. Jika aktif, form strategi harga tidak langsung ditampilkan sebagai form editable utama.
3. UI menampilkan locked/empty state dengan icon.
4. Copy yang disarankan:
   - `Ongkir seluruhnya gratis`
   - `Strategi harga tidak digunakan karena Gratis Ongkir Semua sedang aktif.`
   - `Untuk mengatur tarif zona, radius, atau default price, ubah pengaturan gratis ongkir pada tab Pengaturan Lainnya.`
5. Icon dapat berupa icon truck, gift, tag, info, atau icon lain yang konsisten dengan design system.

### FR-04 Owner Diarahkan Mengubah Pengaturan Lainnya

1. Saat owner ingin mengedit strategi harga tetapi `Gratis Ongkir Semua` aktif, sistem harus memberi arahan yang jelas.
2. Arahan utama: owner harus masuk ke tab `Pengaturan Lainnya` dan memilih mode selain `Gratis Ongkir Semua`.
3. UI boleh menyediakan tombol shortcut, misalnya `Ubah pengaturan gratis ongkir`.
4. Jika ada tombol shortcut, tombol tersebut memindahkan owner ke tab pengaturan yang berisi pilihan mode gratis ongkir.
5. Setelah mode gratis ongkir bukan `all`, tab strategi harga dapat menampilkan form normal kembali.

### FR-05 Strategi Harga Memiliki Default Price

1. Courier setting harus memiliki default price untuk ongkir normal.
2. Default price menjadi tarif fallback saat aturan spesifik tidak match.
3. Default price harus dapat diatur oleh owner pada tab strategi harga saat strategi harga tidak terkunci oleh `Gratis Ongkir Semua`.
4. Default price harus disimpan per outlet.
5. Default price harus dikirim kembali pada resource/API courier setting agar form dapat menampilkan nilai saat ini.

### FR-06 Default Price Berlaku untuk Zona

1. Jika strategi harga berbasis zona aktif, sistem mencoba mencocokkan alamat customer ke zona yang dibuat owner.
2. Jika alamat cocok dengan zona, ongkir memakai fee zona tersebut.
3. Jika alamat tidak cocok dengan zona mana pun, ongkir memakai default price.
4. Default price membuat owner tidak wajib mendefinisikan seluruh wilayah satu per satu.
5. UI zone editor harus menjelaskan bahwa alamat di luar daftar zona akan memakai default price.

### FR-07 Default Price Berlaku untuk Radius Bertingkat

1. Jika strategi harga berbasis radius bertingkat aktif, sistem mencoba mencocokkan jarak customer ke tier radius yang dibuat owner.
2. Jika jarak cocok dengan tier, ongkir memakai fee tier tersebut.
3. Jika jarak tidak cocok dengan tier mana pun, ongkir memakai default price.
4. Contoh kasus: owner membuat tier 0-3 km dan 3-5 km, lalu customer berada di 7 km. Jika order masih serviceable, ongkir memakai default price.
5. UI tier editor harus menjelaskan bahwa jarak di luar tier yang dibuat akan memakai default price.

### FR-08 Default Price Tidak Mengabaikan Serviceability

1. Default price hanya dipakai setelah sistem memastikan order kurir masih dapat dilayani.
2. Jika fitur kurir outlet tidak aktif, default price tidak berlaku.
3. Jika layanan tidak mendukung kurir, default price tidak berlaku.
4. Jika jadwal kurir tidak tersedia dan flow bisnis menolak order, default price tidak berlaku.
5. Jika max distance dianggap hard limit dan alamat melewati batas tersebut, default price tidak boleh mengubah order menjadi serviceable.

### FR-09 Kalkulasi Ongkir Mengirim Source yang Jelas

1. Hasil kalkulasi ongkir perlu menyertakan sumber harga.
2. Contoh source:
   - `zone`
   - `tier`
   - `default_price`
   - `unconditional_free_shipping`
3. Jika default price dipakai, frontend/customer support dapat memahami bahwa alamat tidak match aturan spesifik.
4. Jika gratis ongkir semua dipakai, source harus menunjukkan bahwa ongkir gratis karena setting outlet, bukan karena default price.

### FR-10 Validasi Input Default Price

1. Default price wajib tersedia untuk strategi harga yang membutuhkan fallback.
2. Nilai default price harus numerik dan tidak negatif.
3. Plan dapat menentukan apakah default price wajib untuk semua pricing method atau hanya untuk `zone_based` dan `tiered`.
4. Jika default price kosong pada metode yang membutuhkan fallback, backend harus menolak penyimpanan atau menggunakan nilai default yang eksplisit sesuai keputusan plan.

## 9. Aturan Bisnis

1. Jika `Gratis Ongkir Semua` aktif, customer membayar ongkir `Rp 0` untuk order kurir valid.
2. Jika `Gratis Ongkir Semua` aktif, strategi harga normal tidak tampil sebagai strategi aktif di detail outlet.
3. Jika `Gratis Ongkir Semua` aktif, tab strategi harga pada edit courier setting menampilkan state terkunci/informatif.
4. Strategi harga dapat diedit kembali hanya setelah owner memilih mode selain `Gratis Ongkir Semua`.
5. Default price adalah fallback untuk aturan harga normal.
6. Default price dipakai ketika alamat tidak match zona atau radius bertingkat.
7. Default price tidak boleh mengabaikan aturan validasi kurir.
8. Data strategi harga lama tidak perlu dihapus saat gratis ongkir semua aktif.
9. Perubahan default price berlaku untuk kalkulasi/order baru, bukan order lama.
10. Backend tetap menjadi sumber kebenaran ongkir final.

## 10. Alur Bisnis yang Diharapkan

### Detail Outlet Saat Gratis Ongkir Semua Aktif

1. Owner membuka detail outlet.
2. Owner membuka tab kurir.
3. Sistem membaca courier setting outlet.
4. Sistem mendeteksi mode gratis ongkir semua aktif.
5. Sistem menampilkan card/badge `Gratis Ongkir`.
6. Sistem tidak menampilkan daftar strategi harga sebagai aturan aktif.

### Edit Strategi Harga Saat Gratis Ongkir Semua Aktif

1. Owner membuka halaman edit courier setting.
2. Owner masuk ke tab strategi harga.
3. Sistem mendeteksi mode gratis ongkir semua aktif.
4. Sistem menampilkan icon dan pesan `Ongkir seluruhnya gratis`.
5. Sistem memberi arahan agar owner mengubah mode gratis ongkir pada tab pengaturan lainnya jika ingin mengatur tarif.

### Alamat Tidak Masuk Zona

1. Owner mengatur strategi harga berbasis zona.
2. Owner mengisi beberapa zona dan default price.
3. Customer checkout dengan alamat yang tidak cocok dengan zona mana pun.
4. Sistem memastikan order masih serviceable.
5. Sistem memakai default price sebagai ongkir.
6. Hasil kalkulasi mengirim source `default_price`.

### Jarak Tidak Masuk Radius Bertingkat

1. Owner mengatur strategi harga berbasis radius bertingkat.
2. Owner mengisi beberapa tier radius dan default price.
3. Customer checkout dengan jarak yang tidak cocok dengan tier mana pun.
4. Sistem memastikan order masih serviceable.
5. Sistem memakai default price sebagai ongkir.
6. Hasil kalkulasi mengirim source `default_price`.

## 11. Acceptance Criteria

1. Detail outlet tab kurir menampilkan state `Gratis Ongkir` saat gratis ongkir semua aktif.
2. Detail outlet tab kurir tidak menampilkan strategi harga aktif saat gratis ongkir semua aktif.
3. Edit courier setting tab strategi harga menampilkan icon dan copy `Ongkir seluruhnya gratis` saat gratis ongkir semua aktif.
4. Edit courier setting tab strategi harga memberi arahan untuk mengubah mode gratis ongkir pada tab pengaturan lainnya.
5. Owner dapat melihat dan mengatur default price ketika strategi harga tidak terkunci.
6. Default price tersimpan per outlet.
7. Default price dikembalikan pada payload courier setting.
8. Alamat yang tidak match zona memakai default price selama order masih serviceable.
9. Jarak yang tidak match radius bertingkat memakai default price selama order masih serviceable.
10. Hasil kalkulasi ongkir membedakan source `default_price` dan `unconditional_free_shipping`.
11. Default price tidak membuat order invalid menjadi valid.
12. Perubahan default price tidak mengubah order lama.

## 12. Catatan untuk Implementation Plan

Hal yang perlu diputuskan saat membuat plan:

1. Nama field database untuk default price, misalnya `default_price`, `default_shipping_fee`, atau `fallback_fee`.
2. Apakah default price wajib untuk semua pricing method atau hanya untuk `zone_based` dan `tiered`.
3. Apakah default price mengikuti modifier seperti minimum fee, maximum cap, surcharge, dan merchant subsidy.
4. Apakah max distance tetap menjadi hard limit sebelum default price.
5. Bentuk payload kalkulasi untuk source harga.
6. Bentuk UI locked state pada tab strategi harga.
7. Lokasi tab `Pengaturan Lainnya` yang berisi mode gratis ongkir.
8. Copy final dan icon yang dipakai agar konsisten dengan design system.

## 13. Pertanyaan Terbuka

1. Apakah default price juga harus dipakai untuk metode selain zona dan radius bertingkat?
2. Jika default price dipakai, apakah modifier tetap diterapkan setelahnya?
3. Jika zona tidak match tetapi alamat berada di luar kota outlet, apakah tetap default price atau tidak serviceable?
4. Apakah owner boleh mengisi default price `0` saat gratis ongkir semua tidak aktif?
5. Apakah perlu warning jika owner membuat zona/tier tanpa default price?

## 14. Rekomendasi Awal

Rekomendasi untuk plan tahap pertama:

1. Tambahkan field `default_price` pada courier setting.
2. Wajibkan `default_price >= 0` untuk metode `zone_based` dan `tiered`.
3. Terapkan fallback default price hanya setelah serviceability dasar lolos.
4. Jangan tampilkan strategi harga aktif pada detail outlet jika `unconditional_free_shipping_enabled = true`.
5. Pada edit courier setting tab strategi harga, tampilkan locked state dengan icon dan tombol menuju tab pengaturan lainnya.
6. Kirim source kalkulasi `default_price` saat fallback dipakai.
7. Pastikan source `unconditional_free_shipping` tetap terpisah dari default price agar audit dan UI tidak ambigu.
