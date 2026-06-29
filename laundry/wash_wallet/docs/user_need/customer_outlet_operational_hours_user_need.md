# User Need: Logika Buka/Tutup Outlet Berdasarkan Operational Day

Tanggal: 2026-05-29

## Latar Belakang

Pada aplikasi customer Wash Wallet, customer dapat melihat daftar outlet, membuka detail outlet, dan membuat order laundry. Owner outlet dapat mengatur operational day dan jam operasional outlet.

Contoh jam operasional sederhana:

```text
Senin: 08:00-20:00
Selasa: 08:00-20:00
Minggu: Tutup
```

Kebutuhan baru adalah menggunakan operational day ini di aplikasi customer agar customer dapat mengetahui apakah outlet sedang buka atau tutup. Jika outlet sedang tutup, customer tetap dapat melihat outlet, tetapi tidak boleh membuat order baru.

Selain itu, jam operasional perlu mendukung lebih dari satu rentang waktu dalam satu hari agar outlet dapat memiliki break time.

Contoh:

```text
Senin:
- 08:00-12:00
- 13:00-20:00
```

Artinya outlet buka pukul 08:00-12:00, tutup sementara pukul 12:00-13:00, lalu buka kembali pukul 13:00-20:00.

Dokumen ini menjadi acuan user need sebelum dibuat implementation plan.

## Tujuan

1. Menampilkan status buka/tutup outlet secara jelas di aplikasi customer.
2. Mencegah customer membuat order saat outlet sedang tutup.
3. Menampilkan kapan outlet buka kembali jika outlet sedang tutup.
4. Mendukung operational day dengan multiple time ranges per day.
5. Mendukung break time sebagai kondisi tutup sementara.
6. Menggunakan timezone outlet sebagai sumber kebenaran perhitungan status.
7. Menjadikan backend sebagai sumber utama status operasional yang siap ditampilkan frontend.

## Aktor

- Customer
- Owner outlet
- Sistem

## Istilah Bisnis

### Operational Day

Konfigurasi hari dan jam operasional outlet yang diatur oleh owner.

### Time Range

Rentang waktu buka dalam satu hari, misalnya `08:00-12:00`. Satu hari dapat memiliki lebih dari satu time range.

### Break Time

Jeda di antara dua time range buka. Pada break time, outlet dianggap tutup sementara dan tidak dapat menerima order baru.

### Status Operasional

Status yang menjelaskan kondisi outlet saat ini, misalnya `Buka`, `Tutup`, `Tutup sementara`, `Tutup hari ini`, atau `Jam operasional belum tersedia`.

### Timezone Outlet

Timezone yang digunakan outlet untuk menentukan status buka/tutup. Status tidak boleh dihitung menggunakan timezone device customer sebagai sumber utama.

## Keputusan Bisnis

1. Outlet yang sedang tutup tetap tampil di daftar outlet customer.
2. Outlet yang sedang tutup tetap dapat dibuka detailnya oleh customer.
3. Outlet yang sedang tutup tidak boleh menerima order baru.
4. Tombol buat order harus disabled jika outlet sedang tutup.
5. Jika outlet sedang tutup, aplikasi wajib menampilkan alasan dan waktu buka berikutnya.
6. Operational day harus mendukung multiple time ranges per day.
7. Break time dianggap sebagai kondisi outlet tutup sementara.
8. Order hanya dapat dibuat ketika outlet sedang buka.
9. Status buka/tutup dihitung berdasarkan timezone outlet.
10. Backend sebaiknya mengirim status operasional yang sudah siap ditampilkan oleh frontend.
11. Jika operational day belum diatur, outlet dianggap belum siap menerima order.
12. Perubahan operational day oleh owner langsung berlaku untuk order baru.

## Masalah Saat Ini

1. Customer dapat melihat atau memilih outlet tanpa informasi buka/tutup yang jelas.
2. Customer bisa mencoba membuat order saat outlet sebenarnya sedang tutup.
3. Customer tidak tahu kapan outlet buka kembali.
4. Sistem belum menegaskan bahwa break time harus dianggap sebagai kondisi tutup sementara.
5. Sistem perlu menangani edge case seperti hari tutup penuh, jam melewati tengah malam, timezone, dan operational day belum diatur.

## Kebutuhan Pengguna

### 1. Customer Melihat Status Outlet

- Customer dapat melihat status outlet di daftar outlet.
- Customer dapat melihat status outlet di halaman detail outlet.
- Status minimal yang perlu tampil:
  - `Buka`
  - `Tutup`
  - `Tutup sementara`
  - `Tutup hari ini`
  - `Jam operasional belum tersedia`
- Status harus mudah dipahami dan tidak membuat customer mengira aplikasi error.

### 2. Customer Melihat Informasi Jam Operasional

- Customer dapat melihat jam operasional hari ini.
- Customer dapat melihat jam operasional mingguan.
- Jika satu hari memiliki beberapa time range, seluruh time range harus ditampilkan.
- Jika outlet tutup penuh pada hari tertentu, hari tersebut harus ditampilkan sebagai tutup.

### 3. Customer Melihat Waktu Buka Berikutnya

- Jika outlet sedang tutup, aplikasi harus menampilkan kapan outlet buka kembali.
- Contoh pesan:
  - `Buka lagi hari ini 13:00`
  - `Buka lagi besok 08:00`
  - `Buka lagi Senin 08:00`
- Jika outlet sedang buka, aplikasi dapat menampilkan kapan outlet tutup.
- Contoh pesan:
  - `Buka sampai 20:00`

### 4. Customer Tidak Bisa Order Saat Outlet Tutup

- Jika outlet sedang tutup, tombol buat order harus disabled.
- Customer tidak dapat membuat order baru saat outlet tutup.
- Aplikasi harus menampilkan alasan tombol disabled.
- Contoh pesan:
  - `Outlet sedang tutup. Kamu bisa membuat order saat outlet buka kembali.`
  - `Outlet sedang istirahat. Kamu bisa membuat order saat outlet buka kembali pukul 13:00.`
  - `Jam operasional belum tersedia. Outlet belum dapat menerima order saat ini.`

### 5. Customer Tetap Bisa Melihat Detail Outlet Saat Tutup

- Walaupun outlet tutup, customer tetap dapat membuka detail outlet.
- Detail outlet tetap menampilkan informasi penting:
  - nama outlet,
  - alamat outlet,
  - kontak outlet,
  - tombol navigasi/maps,
  - jam operasional hari ini,
  - jam operasional mingguan,
  - status layanan kurir jika relevan.

### 6. Break Time Ditampilkan dengan Jelas

- Jika waktu saat ini berada di antara dua time range buka, outlet dianggap `Tutup sementara`.
- Aplikasi harus menampilkan waktu buka berikutnya pada hari yang sama jika tersedia.
- Customer tidak dapat membuat order saat break time.

### 7. Operational Day Belum Diatur

- Jika owner belum mengatur operational day, outlet tetap tampil.
- Status outlet menjadi `Jam operasional belum tersedia`.
- Tombol buat order disabled.
- Aplikasi menampilkan pesan bahwa outlet belum dapat menerima order saat ini.

## Hubungan dengan Fitur Kurir dan Self Drop-Off

Jam operasional outlet menjadi validasi utama sebelum fitur kurir atau self drop-off dipertimbangkan.

Jika outlet tutup:

- Customer tidak dapat membuat order.
- Customer tidak dapat memilih pickup.
- Customer tidak dapat memilih delivery.
- Customer tidak dapat membuat self drop-off order.

Jika outlet buka:

- Jika fitur kurir aktif, customer dapat menggunakan alur pickup/delivery sesuai konfigurasi kurir.
- Jika fitur kurir tidak aktif, customer dapat menggunakan alur self drop-off sesuai user need outlet tanpa kurir.

## Alur Bisnis yang Diharapkan

### Daftar Outlet

1. Customer membuka daftar outlet.
2. Sistem mengambil data outlet beserta status operasional.
3. Outlet tetap tampil walaupun sedang tutup.
4. Setiap outlet menampilkan badge status operasional.
5. Jika outlet tutup, aplikasi menampilkan waktu buka berikutnya jika tersedia.
6. Customer tetap dapat membuka detail outlet.

### Detail Outlet Buka

1. Customer membuka detail outlet.
2. Sistem menampilkan status `Buka`.
3. Sistem menampilkan pesan, misalnya `Buka sampai 20:00`.
4. Tombol buat order aktif.
5. Customer dapat membuat order.
6. Alur order mengikuti konfigurasi outlet:
   - kurir aktif: pickup/delivery,
   - kurir tidak aktif: self drop-off.

### Detail Outlet Tutup

1. Customer membuka detail outlet.
2. Sistem menampilkan status `Tutup`, `Tutup sementara`, atau `Tutup hari ini`.
3. Sistem menampilkan waktu buka berikutnya.
4. Sistem menampilkan jam operasional outlet.
5. Tombol buat order disabled.
6. Customer tetap dapat melihat alamat, kontak, navigasi/maps, jam operasional mingguan, dan status layanan kurir.

### Break Time

Contoh operational day:

```text
Senin:
- 08:00-12:00
- 13:00-20:00
```

Jika customer membuka outlet pada Senin pukul 12:30:

1. Sistem menampilkan status `Tutup sementara`.
2. Sistem menampilkan pesan `Buka lagi hari ini 13:00`.
3. Tombol buat order disabled.
4. Customer tidak dapat membuat order sampai outlet buka kembali.

## Aturan Bisnis

1. Outlet yang sedang tutup tetap muncul di daftar outlet.
2. Outlet yang sedang tutup tetap dapat dibuka detailnya.
3. Outlet yang sedang tutup tidak dapat menerima order baru.
4. Tombol buat order disabled jika outlet tidak dapat menerima order saat ini.
5. Sistem wajib menampilkan alasan mengapa order tidak dapat dibuat.
6. Sistem wajib menampilkan waktu buka berikutnya jika outlet tutup dan jadwal berikutnya tersedia.
7. Satu hari operational day dapat memiliki lebih dari satu time range.
8. Break time dianggap sebagai outlet tutup sementara.
9. Hari tutup penuh harus didukung.
10. Jam operasional yang melewati tengah malam harus didukung.
11. Status buka/tutup harus dihitung berdasarkan timezone outlet.
12. Jika operational day belum diatur, outlet dianggap belum siap menerima order.
13. Perubahan operational day langsung berlaku untuk order baru.
14. Customer hanya dapat membuat order jika `isOpenNow = true` dan `canCreateOrderNow = true`.
15. Frontend tidak boleh menjadikan timezone device customer sebagai sumber kebenaran perhitungan buka/tutup.
16. Backend menjadi sumber kebenaran status operasional outlet.

## Rekomendasi Data Backend

Backend sebaiknya menghitung status operasional dan mengirim data siap pakai ke customer app. Frontend sebaiknya tidak menghitung sendiri status buka/tutup karena rawan berbeda untuk timezone, break time, jam melewati tengah malam, dan multiple time ranges.

Contoh response:

```json
{
  "timezone": "Asia/Jakarta",
  "isOpenNow": false,
  "operationalStatus": "temporary_closed",
  "operationalStatusLabel": "Tutup sementara",
  "operationalStatusMessage": "Buka lagi hari ini 13:00",
  "todayHours": [
    {
      "open": "08:00",
      "close": "12:00"
    },
    {
      "open": "13:00",
      "close": "20:00"
    }
  ],
  "weeklyHours": [
    {
      "day": "monday",
      "isClosed": false,
      "timeRanges": [
        {
          "open": "08:00",
          "close": "12:00"
        },
        {
          "open": "13:00",
          "close": "20:00"
        }
      ]
    },
    {
      "day": "sunday",
      "isClosed": true,
      "timeRanges": []
    }
  ],
  "nextOpenAt": "2026-06-01T13:00:00+07:00",
  "nextCloseAt": null,
  "canCreateOrderNow": false,
  "orderDisabledReason": "Outlet sedang tutup sementara. Kamu bisa membuat order saat outlet buka kembali."
}
```

Field yang direkomendasikan:

1. `timezone`
2. `isOpenNow`
3. `operationalStatus`
4. `operationalStatusLabel`
5. `operationalStatusMessage`
6. `todayHours`
7. `weeklyHours`
8. `nextOpenAt`
9. `nextCloseAt`
10. `canCreateOrderNow`
11. `orderDisabledReason`

Nilai `operationalStatus` yang direkomendasikan:

```text
open
closed
temporary_closed
closed_today
hours_not_set
```

## UI Requirement

### Daftar Outlet

Daftar outlet perlu menampilkan:

1. Nama outlet.
2. Alamat singkat atau jarak jika tersedia.
3. Badge status operasional.
4. Pesan jam operasional singkat.
5. Status layanan kurir jika relevan.

Contoh:

```text
Buka
Buka sampai 20:00
```

```text
Tutup
Buka lagi besok 08:00
```

```text
Tutup sementara
Buka lagi hari ini 13:00
```

```text
Jam operasional belum tersedia
Outlet belum dapat menerima order
```

### Detail Outlet

Detail outlet perlu menampilkan:

1. Status buka/tutup sekarang.
2. Jam operasional hari ini.
3. Jam buka berikutnya jika tutup.
4. Jam operasional mingguan.
5. Alamat lengkap outlet.
6. Kontak outlet.
7. Tombol navigasi/maps.
8. Status layanan kurir.
9. Tombol buat order.
10. Alasan jika tombol buat order disabled.

### Tombol Buat Order

Jika outlet buka:

```text
Buat Order
```

Jika outlet tutup:

```text
Outlet Sedang Tutup
```

Jika outlet tutup sementara:

```text
Tutup Sementara
```

Jika jam belum diatur:

```text
Order Belum Tersedia
```

## Copywriting UI

### Outlet Buka

```text
Buka
Buka sampai 20:00
```

### Outlet Tutup

```text
Tutup
Buka lagi besok 08:00
```

### Outlet Tutup Sementara

```text
Tutup sementara
Buka lagi hari ini 13:00
```

### Outlet Tutup Hari Ini

```text
Tutup hari ini
Buka lagi Senin 08:00
```

### Jam Operasional Belum Tersedia

```text
Jam operasional belum tersedia
Outlet belum dapat menerima order saat ini.
```

### Pesan Tidak Bisa Order

```text
Outlet sedang tutup. Kamu bisa membuat order saat outlet buka kembali.
```

### Pesan Break Time

```text
Outlet sedang istirahat. Kamu bisa membuat order saat outlet buka kembali pukul 13:00.
```

## Edge Case

### Break Time

Jika waktu saat ini berada di antara dua time range buka, outlet dianggap tutup sementara. Customer tidak dapat membuat order.

### Hari Tutup Penuh

Jika outlet tutup penuh pada hari tertentu, sistem mencari jadwal buka berikutnya dan menampilkan pesan yang sesuai.

Contoh:

```text
Tutup hari ini
Buka lagi Senin 08:00
```

### Jam Operasional Melewati Tengah Malam

Jika outlet memiliki jam operasional:

```text
Senin: 20:00-02:00
```

Maka outlet buka dari Senin 20:00 sampai Selasa 02:00. Jika customer membuka outlet pada Selasa 01:00, outlet tetap dianggap buka.

### Timezone

Status buka/tutup harus mengikuti timezone outlet, misalnya `Asia/Jakarta`. Frontend tidak boleh memakai timezone device customer sebagai sumber utama.

### Operational Day Belum Diatur

Jika owner belum mengatur operational day:

- outlet tetap tampil,
- status menjadi `Jam operasional belum tersedia`,
- tombol order disabled,
- customer tidak dapat membuat order.

### Owner Mengubah Jam Operasional

Jika owner mengubah operational day:

- perubahan langsung berlaku untuk order baru,
- customer app harus menampilkan jadwal terbaru,
- jika customer sedang berada di halaman outlet, data perlu di-refresh saat membuka ulang halaman atau saat melakukan action order.

### Outlet Buka Tapi Kurir Tidak Aktif

Jika outlet buka tetapi kurir tidak aktif:

- customer tetap dapat membuat order,
- order menggunakan alur self drop-off,
- customer harus datang langsung ke outlet.

### Outlet Tutup dan Kurir Aktif

Jika outlet tutup meskipun kurir aktif:

- customer tetap tidak dapat membuat order,
- customer tidak dapat memilih jadwal pickup,
- customer tidak dapat memilih delivery.

### Outlet Akan Segera Tutup

Jika outlet akan segera tutup, aplikasi dapat menampilkan warning, misalnya:

```text
Outlet akan tutup pukul 20:00.
```

Untuk MVP, customer tetap boleh membuat order selama outlet masih buka.

## Acceptance Criteria

1. Jika customer membuka daftar outlet saat outlet berada dalam salah satu time range buka, outlet menampilkan badge `Buka`.
2. Jika outlet sedang buka, aplikasi menampilkan informasi jam tutup berikutnya, misalnya `Buka sampai 20:00`.
3. Jika customer membuka daftar outlet saat outlet berada di luar seluruh time range, outlet tetap tampil.
4. Jika outlet sedang tutup, outlet menampilkan badge `Tutup`.
5. Jika outlet sedang tutup, aplikasi menampilkan waktu buka berikutnya.
6. Jika outlet sedang tutup, tombol buat order disabled.
7. Jika tombol buat order disabled, aplikasi menampilkan alasan yang jelas.
8. Jika outlet memiliki jam 08:00-12:00 dan 13:00-20:00, lalu customer membuka outlet pukul 12:30, outlet menampilkan status `Tutup sementara`.
9. Pada break time, aplikasi menampilkan pesan `Buka lagi hari ini 13:00` atau pesan sejenis sesuai jadwal.
10. Pada break time, customer tidak dapat membuat order.
11. Jika owner mengatur lebih dari satu time range dalam satu hari, aplikasi menampilkan seluruh rentang tersebut pada detail outlet.
12. Jika outlet tutup penuh pada hari tertentu, aplikasi menampilkan status `Tutup hari ini`.
13. Jika outlet tutup penuh, sistem menampilkan waktu buka berikutnya.
14. Jika outlet memiliki jam Senin 20:00-02:00 dan customer membuka outlet Selasa 01:00, outlet dianggap buka.
15. Jika operational day belum diatur, outlet menampilkan status `Jam operasional belum tersedia`.
16. Jika operational day belum diatur, tombol buat order disabled.
17. Status buka/tutup dihitung berdasarkan timezone outlet, bukan timezone device customer.
18. Jika outlet buka dan fitur kurir aktif, customer dapat menggunakan alur pickup/delivery sesuai konfigurasi outlet.
19. Jika outlet buka dan fitur kurir tidak aktif, customer menggunakan alur self drop-off.
20. Jika outlet tutup dan fitur kurir aktif, customer tetap tidak dapat membuat order.
21. Backend response untuk customer app menyertakan `isOpenNow`, `operationalStatus`, `todayHours`, `nextOpenAt`, `canCreateOrderNow`, dan `orderDisabledReason`.
22. Customer tidak mengira aplikasi error saat order tidak tersedia karena outlet tutup.

## Catatan Ruang Lingkup

In scope:

1. Status buka/tutup outlet di daftar outlet.
2. Status buka/tutup outlet di detail outlet.
3. Jam operasional hari ini.
4. Jam operasional mingguan.
5. Waktu buka berikutnya.
6. Disabled tombol order saat outlet tutup.
7. Multiple time ranges per day.
8. Break time.
9. Hari tutup penuh.
10. Timezone outlet.
11. Operational day belum diatur.
12. Hubungan dengan fitur kurir dan self drop-off.

Out of scope untuk tahap awal:

1. Holiday override atau libur khusus.
2. Auto-notification ketika outlet buka kembali.
3. Pemesanan terjadwal untuk besok.
4. Auto-reschedule order.
5. Estimasi kapasitas outlet.
6. Perubahan status order existing akibat perubahan jam operasional.

## Keputusan untuk Plan

1. Backend menjadi sumber kebenaran status operational day untuk customer app.
2. Customer app menampilkan outlet tutup, tetapi tidak mengizinkan order.
3. `canCreateOrderNow` harus dipakai untuk menentukan apakah tombol order aktif.
4. Multiple time ranges per day wajib didukung.
5. Break time wajib dianggap sebagai `temporary_closed`.
6. Operational day yang belum diatur wajib membuat order disabled.
7. Timezone outlet wajib digunakan dalam perhitungan.
8. Plan perlu mencakup perubahan backend response, model/domain customer app, dan UI daftar/detail outlet.
