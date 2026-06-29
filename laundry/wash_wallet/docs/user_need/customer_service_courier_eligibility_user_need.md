# User Need: Dukungan Kurir per Layanan pada Aplikasi Customer

Tanggal: 2026-05-29

## Latar Belakang

Wash Wallet memiliki integrasi antara website owner dan aplikasi customer. Owner outlet dapat mengelola layanan laundry melalui website. Setiap layanan dapat memiliki konfigurasi apakah layanan tersebut mendukung kurir atau tidak.

Tidak semua layanan laundry cocok untuk pickup/delivery menggunakan kurir. Contoh layanan yang mungkin tidak mendukung kurir:

1. Cuci karpet besar.
2. Layanan khusus yang harus dicek langsung di outlet.
3. Layanan dengan risiko kerusakan tinggi.
4. Layanan yang membutuhkan konfirmasi manual.
5. Layanan dengan ukuran atau berat yang tidak memungkinkan dibawa kurir.

Konfigurasi ini perlu digunakan di aplikasi customer agar customer tidak memilih alur pickup/delivery untuk layanan yang memang tidak mendukung kurir. Layanan tetap boleh tampil dan tetap boleh dipilih, tetapi order yang mengandung layanan tersebut harus menjadi self drop-off atau datang langsung ke outlet.

Dokumen ini menjadi acuan user need sebelum dibuat implementation plan.

## Tujuan

1. Memastikan customer mengetahui layanan mana yang tidak tersedia untuk pickup/delivery.
2. Memastikan layanan yang tidak mendukung kurir tetap tampil di aplikasi customer.
3. Memastikan order yang berisi layanan non-kurir otomatis menjadi self drop-off.
4. Memastikan order campuran tetap dapat dibuat tanpa perlu memisahkan order.
5. Memastikan customer mendapat warning sebelum checkout jika pilihan layanan membuat kurir tidak tersedia.
6. Memastikan backend memvalidasi ulang konfigurasi layanan saat order dibuat.
7. Memastikan kasir dapat melihat alasan order menjadi self drop-off.

## Aktor

- Owner outlet
- Customer
- Kasir
- Sistem

## Istilah Bisnis

### Supports Courier

Konfigurasi pada layanan laundry yang menentukan apakah layanan tersebut dapat menggunakan pickup/delivery kurir.

Nilai yang direkomendasikan:

```text
supportsCourier: true / false
```

### Layanan Non-Kurir

Layanan laundry dengan `supportsCourier = false`. Layanan ini tetap aktif dan tetap dapat dipilih customer, tetapi hanya dapat diproses jika customer datang langsung ke outlet.

### Self Drop-Off

Alur order ketika customer membuat order dari aplikasi, lalu membawa laundry sendiri ke outlet. Label UI utama yang digunakan adalah **Datang langsung ke outlet**.

### Pending Drop-Off

Status awal order self drop-off. Nilai teknis yang digunakan adalah `pending_dropoff`, artinya order sudah dibuat tetapi barang/laundry belum diserahkan ke outlet.

### Fulfillment Method

Metode pemenuhan order dari sisi customer, misalnya pickup/delivery kurir atau self drop-off.

## Keputusan Bisnis

1. Owner dapat mengatur dukungan kurir per layanan di website owner.
2. Layanan yang tidak mendukung kurir tetap tampil di aplikasi customer selama layanan aktif.
3. Layanan non-kurir wajib diberi label yang jelas.
4. Label utama untuk layanan non-kurir adalah **Datang langsung ke outlet**.
5. Label pendukung adalah **Tidak tersedia untuk pickup/delivery**.
6. Customer tetap boleh memilih layanan non-kurir.
7. Jika customer memilih minimal satu layanan non-kurir, seluruh order otomatis menjadi self drop-off.
8. Order campuran layanan kurir dan non-kurir tetap boleh dibuat, tetapi dipaksa menjadi self drop-off.
9. Customer boleh menghapus atau mengganti layanan non-kurir agar bisa memakai pickup/delivery.
10. Aplikasi wajib menampilkan warning sebelum checkout jika cart memiliki layanan non-kurir.
11. Jika outlet fitur kurirnya aktif tetapi ada layanan non-kurir, aturan layanan menang.
12. Jika outlet fitur kurirnya tidak aktif, semua order otomatis self drop-off.
13. Jika outlet sedang tutup, customer tidak dapat membuat order sama sekali.
14. Pembayaran transfer/wallet untuk self drop-off baru tersedia setelah laundry diterima, ditimbang/dicek, total harga ditentukan, dan order di-ACC kasir.
15. Order self drop-off karena layanan non-kurir memakai status awal `pending_dropoff`.
16. Kasir perlu melihat alasan order menjadi self drop-off.
17. Perubahan konfigurasi `supportsCourier` oleh owner berlaku untuk order baru dan checkout yang belum selesai.
18. Backend wajib memvalidasi ulang layanan dan fulfillment method saat order dibuat.

## Masalah Saat Ini

1. Customer belum selalu mendapat informasi bahwa suatu layanan tidak tersedia untuk pickup/delivery.
2. Customer berpotensi memilih layanan yang tidak memungkinkan dibawa kurir lalu tetap memilih pickup/delivery.
3. Order campuran berpotensi membingungkan jika sebagian layanan mendukung kurir dan sebagian tidak.
4. Jika validasi hanya dilakukan di frontend, konfigurasi layanan yang berubah saat checkout bisa menghasilkan order yang tidak valid.
5. Kasir membutuhkan konteks kenapa order masuk sebagai self drop-off.

## Prioritas Aturan

Jika ada beberapa kondisi sekaligus, prioritas aturan adalah:

1. Outlet sedang tutup.
2. Outlet tidak mengaktifkan kurir.
3. Ada layanan yang tidak mendukung kurir.
4. Semua layanan mendukung kurir dan outlet kurir aktif.

Penjelasan:

1. Jika outlet sedang tutup, customer tidak bisa membuat order.
2. Jika outlet buka tetapi tidak mengaktifkan kurir, customer hanya bisa membuat order self drop-off.
3. Jika outlet buka dan kurir aktif tetapi ada layanan non-kurir, customer hanya bisa membuat order self drop-off.
4. Jika outlet buka, kurir aktif, dan semua layanan mendukung kurir, pickup/delivery tersedia sesuai aturan outlet.

## Kebutuhan Pengguna

### 1. Owner Mengatur Dukungan Kurir per Layanan

- Owner dapat mengatur apakah sebuah layanan mendukung kurir atau tidak.
- Pengaturan dilakukan pada website owner.
- Pengaturan berlaku untuk order baru.
- Perubahan pengaturan tidak otomatis mengubah order yang sudah dibuat.
- Jika customer sedang checkout saat pengaturan berubah, backend tetap harus memakai konfigurasi terbaru saat submit order.

### 2. Customer Melihat Label Layanan Non-Kurir

- Layanan non-kurir tetap tampil di daftar layanan.
- Layanan non-kurir diberi badge **Datang langsung ke outlet**.
- Subtext opsional: **Tidak tersedia untuk pickup/delivery**.
- Informasi juga harus tampil pada detail layanan.
- Customer tidak boleh baru mengetahui batasan ini setelah submit order.

### 3. Customer Memilih Layanan Non-Kurir

- Customer tetap dapat menambahkan layanan non-kurir ke cart.
- Setelah layanan non-kurir masuk cart, sistem menandai cart/order sebagai harus self drop-off.
- Aplikasi menampilkan informasi bahwa layanan tersebut hanya tersedia jika datang langsung ke outlet.
- Pickup/delivery tidak boleh tersedia untuk order tersebut.

### 4. Order Campuran Tetap Diizinkan

- Customer boleh memilih campuran layanan yang mendukung kurir dan tidak mendukung kurir.
- Jika minimal satu layanan dalam cart tidak mendukung kurir, seluruh order menjadi self drop-off.
- Sistem tidak perlu memaksa customer membuat dua order terpisah.
- Customer boleh menghapus layanan non-kurir jika ingin memakai pickup/delivery.

### 5. Customer Melihat Warning Sebelum Checkout

- Jika cart memiliki layanan non-kurir, aplikasi wajib menampilkan warning di cart/order summary.
- Warning menjelaskan bahwa pickup/delivery tidak tersedia untuk order ini.
- Warning juga menjelaskan bahwa customer harus datang langsung ke outlet.
- Warning harus muncul sebelum customer submit order.

### 6. Metode Pengiriman Menyesuaikan Eligibility

- Jika ada layanan non-kurir, opsi pickup/delivery disabled atau tidak tersedia.
- Self drop-off otomatis dipilih sebagai fulfillment method.
- Aplikasi menampilkan alasan kenapa pickup/delivery tidak tersedia.
- Jika customer menghapus semua layanan non-kurir, pickup/delivery dapat tersedia kembali jika outlet buka, fitur kurir aktif, dan semua layanan mendukung kurir.

### 7. Order Self Drop-Off Karena Layanan Non-Kurir

- Order yang mengandung layanan non-kurir dibuat sebagai self drop-off.
- Status awal order adalah `pending_dropoff`.
- Order menunggu customer datang ke outlet dan menyerahkan laundry.
- Pembayaran belum tersedia saat order dibuat.
- Pembayaran baru muncul setelah kasir menerima laundry, mengecek/menimbang, menentukan total harga, dan meng-ACC order.

### 8. Kasir Melihat Alasan Self Drop-Off

- Kasir perlu melihat bahwa order dibuat sebagai self drop-off.
- Kasir perlu melihat alasan self drop-off.
- Contoh alasan:
  - `Outlet tidak menyediakan kurir`
  - `Terdapat layanan yang tidak mendukung kurir`
- Jika alasan berasal dari layanan non-kurir, kasir idealnya dapat melihat layanan mana yang menyebabkan order harus self drop-off.

### 9. Backend Memvalidasi Ulang Saat Submit Order

- Backend wajib memvalidasi ulang order saat customer submit.
- Frontend hanya membantu UX, bukan sumber kebenaran.
- Backend perlu memvalidasi:
  - outlet masih aktif,
  - outlet sedang buka,
  - outlet mengaktifkan fitur kurir atau tidak,
  - layanan masih aktif,
  - layanan masih tersedia di outlet,
  - konfigurasi `supportsCourier` terbaru,
  - fulfillment method yang dikirim customer valid.
- Jika customer mengirim fulfillment method kurir tetapi ada layanan non-kurir, backend harus menolak atau mengarahkan ke self drop-off sesuai desain endpoint.

## Alur Bisnis yang Diharapkan

### Customer Melihat Daftar Layanan

1. Customer membuka outlet.
2. Customer melihat daftar layanan.
3. Layanan yang tidak mendukung kurir tetap tampil.
4. Layanan tersebut memiliki label **Datang langsung ke outlet**.
5. Customer dapat membuka detail layanan untuk melihat penjelasan tambahan.

### Customer Memilih Layanan Non-Kurir

1. Customer memilih layanan yang tidak mendukung kurir.
2. Sistem menambahkan layanan ke cart.
3. Sistem menampilkan informasi bahwa layanan hanya tersedia jika datang langsung ke outlet.
4. Cart/order ditandai sebagai self drop-off.
5. Pickup/delivery tidak tersedia untuk order tersebut.

### Customer Memilih Layanan Campuran

1. Customer memilih layanan yang mendukung kurir.
2. Customer memilih layanan yang tidak mendukung kurir.
3. Sistem menampilkan warning bahwa pickup/delivery tidak tersedia untuk order ini.
4. Customer dapat lanjut sebagai datang langsung ke outlet.
5. Customer juga dapat menghapus layanan non-kurir agar pickup/delivery bisa tersedia kembali jika syarat lain terpenuhi.

### Customer Memilih Fulfillment Method

Jika order memiliki layanan non-kurir:

1. Opsi pickup/delivery disabled atau tidak ditampilkan.
2. Opsi yang tersedia adalah **Datang langsung ke outlet**.
3. Sistem menampilkan alasan bahwa beberapa layanan harus diproses langsung di outlet.

### Customer Submit Order

1. Customer submit order.
2. Backend memvalidasi ulang outlet, layanan, dan fulfillment method.
3. Jika valid, order dibuat dengan fulfillment method self drop-off.
4. Status awal order menjadi `pending_dropoff`.
5. Aplikasi menampilkan instruksi agar customer datang ke outlet dan menunjukkan order kepada kasir.

## Aturan Bisnis

1. Setiap layanan memiliki konfigurasi `supportsCourier`.
2. Layanan non-kurir tetap tampil di customer app selama aktif.
3. Layanan non-kurir wajib diberi label **Datang langsung ke outlet**.
4. Jika cart memiliki minimal satu layanan `supportsCourier = false`, order tidak dapat menggunakan pickup/delivery.
5. Order campuran tetap diizinkan, tetapi fulfillment method harus self drop-off.
6. Customer boleh menghapus layanan non-kurir agar dapat memakai pickup/delivery jika syarat lain terpenuhi.
7. Aturan layanan mengalahkan aturan outlet: jika outlet kurir aktif tetapi layanan tidak mendukung kurir, order tidak bisa memakai kurir.
8. Jika outlet kurir tidak aktif, semua order menjadi self drop-off terlepas dari konfigurasi layanan.
9. Jika outlet sedang tutup, customer tidak dapat membuat order untuk pickup/delivery maupun self drop-off.
10. Untuk order self drop-off, pembayaran transfer/wallet baru tersedia setelah ACC kasir.
11. Order self drop-off memakai status awal `pending_dropoff`.
12. Kasir perlu melihat alasan order menjadi self drop-off.
13. Perubahan setting `supportsCourier` berlaku untuk order baru dan proses checkout yang belum selesai.
14. Backend wajib validasi ulang saat order dibuat.
15. Order yang sudah dibuat tetap mengikuti konfigurasi saat order dibuat, kecuali ada proses revisi manual oleh kasir/outlet.

## Rekomendasi Data Backend

### Data Layanan

```json
{
  "id": "service_001",
  "name": "Cuci Karpet Besar",
  "isActive": true,
  "supportsCourier": false,
  "courierSupportLabel": "Datang langsung ke outlet",
  "courierSupportMessage": "Layanan ini tidak tersedia untuk pickup/delivery."
}
```

### Data Cart/Order Eligibility

```json
{
  "canUseCourier": false,
  "requiredFulfillmentMethod": "self_dropoff",
  "courierDisabledReason": "Terdapat layanan yang tidak mendukung pickup/delivery.",
  "nonCourierServices": [
    {
      "id": "service_001",
      "name": "Cuci Karpet Besar"
    }
  ]
}
```

### Data Order

```json
{
  "fulfillmentMethod": "self_dropoff",
  "initialStatus": "pending_dropoff",
  "selfDropoffReason": "service_not_support_courier"
}
```

## UI Requirement

### Daftar Layanan

Untuk layanan non-kurir, tampilkan badge:

```text
Datang langsung ke outlet
```

Subtext opsional:

```text
Tidak tersedia untuk pickup/delivery
```

### Detail Layanan

Tampilkan informasi:

```text
Layanan ini hanya tersedia jika kamu datang langsung ke outlet. Pickup/delivery tidak tersedia untuk layanan ini.
```

### Cart / Order Summary

Jika cart memiliki layanan non-kurir, tampilkan warning:

```text
Order ini harus dilakukan dengan datang langsung ke outlet karena terdapat layanan yang tidak mendukung pickup/delivery.
```

### Pilih Metode Pengiriman

Jika layanan non-kurir dipilih:

- Opsi pickup disabled.
- Opsi delivery disabled.
- Self drop-off otomatis dipilih.

Pesan:

```text
Pickup/delivery tidak tersedia untuk order ini.
```

Detail:

```text
Beberapa layanan harus dicek langsung di outlet.
```

### Halaman Sukses Order

Untuk self drop-off, tampilkan:

```text
Order berhasil dibuat.
Silakan datang ke outlet dan tunjukkan order ini kepada kasir.
```

Tambahan:

```text
Pembayaran akan tersedia setelah laundry diterima dan di-ACC oleh kasir.
```

## Copywriting UI

### Badge Layanan

```text
Datang langsung ke outlet
```

### Detail Layanan

```text
Layanan ini tidak tersedia untuk pickup/delivery.
Silakan datang langsung ke outlet untuk menggunakan layanan ini.
```

### Warning Cart

```text
Ada layanan yang hanya tersedia jika datang langsung ke outlet.
Pickup/delivery tidak tersedia untuk order ini.
```

### Disabled Pickup/Delivery

```text
Tidak tersedia untuk layanan yang dipilih.
```

### Pilihan Self Drop-Off

```text
Datang langsung ke outlet
```

### Instruksi Setelah Order Dibuat

```text
Silakan datang ke outlet dan tunjukkan order ini kepada kasir.
```

## Error / Validation Message

### Customer Memilih Kurir untuk Layanan Non-Kurir

```text
Pickup/delivery tidak tersedia untuk salah satu layanan yang dipilih. Silakan lanjut dengan datang langsung ke outlet atau ubah layanan.
```

### Setting Layanan Berubah Saat Checkout

```text
Ketersediaan layanan berubah. Salah satu layanan kini hanya tersedia jika datang langsung ke outlet.
```

### Outlet Tutup Saat Submit Order

```text
Outlet sedang tutup. Kamu bisa membuat order saat outlet buka kembali.
```

## Acceptance Criteria

1. Owner dapat mengatur apakah layanan mendukung kurir atau tidak pada website owner.
2. Layanan aktif yang tidak mendukung kurir tetap tampil di aplikasi customer.
3. Layanan non-kurir memiliki label **Datang langsung ke outlet**.
4. Detail layanan non-kurir menampilkan informasi bahwa layanan tidak tersedia untuk pickup/delivery.
5. Saat customer memilih layanan non-kurir, cart/order ditandai sebagai self drop-off.
6. Saat customer memilih layanan non-kurir, pickup/delivery tidak tersedia.
7. Order campuran layanan kurir dan non-kurir tetap dapat dibuat.
8. Order campuran hanya mengizinkan fulfillment method self drop-off.
9. Customer dapat menghapus layanan non-kurir dari cart.
10. Setelah semua layanan non-kurir dihapus, pickup/delivery dapat tersedia kembali jika outlet buka, fitur kurir aktif, dan semua layanan mendukung kurir.
11. Cart/order summary menampilkan warning jika ada layanan non-kurir.
12. Jika outlet kurir aktif tetapi layanan tidak mendukung kurir, order hanya bisa self drop-off.
13. Jika outlet kurir tidak aktif, semua order hanya bisa self drop-off.
14. Jika outlet tutup, customer tidak dapat membuat order walaupun order adalah self drop-off.
15. Untuk order self drop-off, pembayaran belum tersedia saat order dibuat.
16. Pembayaran untuk order self drop-off baru muncul setelah kasir menerima, mengecek/menimbang, menentukan harga, dan meng-ACC order.
17. Order self drop-off memiliki status awal `pending_dropoff`.
18. Kasir melihat penanda bahwa order adalah self drop-off.
19. Kasir melihat alasan self drop-off, termasuk jika alasan berasal dari layanan non-kurir.
20. Perubahan setting `supportsCourier` berlaku untuk order baru.
21. Backend memvalidasi ulang outlet, layanan, konfigurasi `supportsCourier`, dan fulfillment method saat submit order.
22. Backend menolak order jika fulfillment method tidak valid.
23. Jika setting layanan berubah saat checkout, customer mendapat pesan yang jelas dan dapat melanjutkan sebagai self drop-off atau mengubah layanan.

## Catatan Relasi dengan User Need Lain

### Relasi dengan Outlet Tanpa Kurir

Dokumen `docs/user_need/customer_outlet_without_courier_user_need.md` menetapkan bahwa outlet tanpa kurir tetap bisa menerima order sebagai self drop-off. User need ini menambahkan alasan lain yang juga membuat order menjadi self drop-off, yaitu adanya layanan yang tidak mendukung kurir.

### Relasi dengan Operational Hours

Dokumen `docs/user_need/customer_outlet_operational_hours_user_need.md` menetapkan bahwa outlet yang sedang tutup tidak bisa menerima order. Aturan operational hours memiliki prioritas lebih tinggi daripada aturan layanan non-kurir.

### Relasi dengan Payment

Untuk self drop-off, pembayaran transfer/wallet baru tersedia setelah laundry diterima, ditimbang/dicek, total harga final ditentukan, dan order di-ACC oleh kasir.

## Catatan Ruang Lingkup

In scope:

1. Setting dukungan kurir per layanan di website owner.
2. Tampilan label layanan non-kurir di customer app.
3. Warning pada cart/order summary.
4. Eligibility fulfillment method berdasarkan layanan yang dipilih.
5. Order campuran dipaksa self drop-off.
6. Status awal `pending_dropoff` untuk self drop-off.
7. Alasan self drop-off yang terlihat oleh kasir.
8. Validasi backend saat submit order.

Out of scope untuk tahap awal:

1. Memecah otomatis order campuran menjadi order pickup dan self drop-off.
2. Pickup sebagian item dan self drop-off sebagian item dalam satu order.
3. Estimasi risiko layanan.
4. Approval manual sebelum layanan non-kurir bisa masuk cart.
5. Perubahan otomatis pada order lama saat owner mengubah setting layanan.

## Keputusan untuk Plan

1. Gunakan `supportsCourier` sebagai field utama eligibility kurir per layanan.
2. Layanan non-kurir tetap tampil dan tetap dapat dipilih.
3. Jika minimal satu layanan non-kurir dipilih, fulfillment method wajib self drop-off.
4. Order self drop-off karena layanan non-kurir memakai status awal `pending_dropoff`.
5. Tambahkan alasan self drop-off, misalnya `service_not_support_courier`.
6. Backend wajib validasi ulang eligibility saat submit order.
7. Customer app wajib menampilkan label, warning, disabled state, dan instruksi datang langsung ke outlet.
8. Plan perlu memastikan aturan prioritas: outlet tutup, outlet tanpa kurir, layanan non-kurir, lalu pickup/delivery normal.
