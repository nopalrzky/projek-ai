# User Need: Penentuan Default Tanggal Order Ketika Jadwal Kurir Sedang Berlangsung

Tanggal: 2026-06-05

## Latar Belakang

Wash Wallet memiliki fitur kurir dengan jadwal operasional tertentu per hari di masing-masing outlet. Setiap slot jadwal kurir memiliki rentang waktu (jam mulai – jam selesai) yang menentukan kapan kurir beroperasi.

Sebelumnya, user need `customer_courier_schedule_validation_user_need.md` sudah menetapkan bahwa:

1. Slot jadwal kurir yang sedang berlangsung (jam saat ini berada di dalam rentang) harus di-disable.
2. Slot jadwal kurir yang sudah terlewat juga harus di-disable.
3. Hanya slot jadwal yang belum dimulai yang boleh dipilih customer.

Namun, permasalahan baru muncul: **ketika customer membuka halaman pemesanan dan semua slot jadwal kurir di hari ini sudah tidak tersedia (karena sedang berlangsung atau sudah terlewat), sistem perlu menentukan secara cerdas tanggal default yang akan ditampilkan kepada customer.**

Saat ini belum ada logika eksplisit yang mengatur:

1. Apa tanggal/hari default yang ditampilkan jika slot hari ini sudah habis?
2. Bagaimana jika hari berikutnya adalah hari libur?
3. Bagaimana jika hari libur berlanjut beberapa hari?

Dokumen ini mendefinisikan kebutuhan pengguna (user need) untuk menyelesaikan permasalahan tersebut.

## Tujuan

1. Memastikan customer selalu diarahkan ke slot jadwal kurir yang tersedia secara otomatis.
2. Menghindari tampilan awal halaman pemesanan yang membingungkan (semua slot disabled, tidak ada petunjuk ke hari berikutnya).
3. Memastikan logika penentuan default tanggal memperhitungkan jadwal kurir yang aktif dan hari libur outlet.
4. Memastikan backend memvalidasi bahwa slot yang dipilih benar-benar tersedia saat order disubmit.

## Aktor

- Customer
- Sistem (aplikasi customer)
- Backend

## Istilah Bisnis

### Slot Jadwal Kurir

Rentang waktu operasional kurir di outlet pada hari tertentu. Contoh: Jumat jam 08:00–10:00 dan Jumat jam 14:00–16:00.

### Hari Aktif Kurir

Hari dalam seminggu di mana outlet memiliki minimal satu slot jadwal kurir yang dikonfigurasi.

### Hari Libur

Hari di mana outlet tidak beroperasi. Didefinisikan sebagai hari yang tidak memiliki slot jadwal kurir aktif di outlet tersebut (misalnya Sabtu dan Minggu dikonfigurasi libur oleh owner).

### Slot Tersedia

Slot jadwal kurir yang jam mulainya masih belum tiba berdasarkan jam saat ini. Dengan kata lain: jam saat ini < jam mulai slot.

### Slot Tidak Tersedia

Slot jadwal kurir yang:
- Jam saat ini berada di dalam rentang (jam mulai <= jam saat ini < jam selesai), **atau**
- Jam saat ini sudah melewati jam selesai (jam saat ini >= jam selesai).

### Default Tanggal

Tanggal yang secara otomatis dipilih/ditampilkan kepada customer saat pertama kali membuka halaman pemesanan jadwal kurir.

## Skenario Bisnis

### Skenario 1: Hari Ini Masih Ada Slot Tersedia

**Kondisi**: Jam saat ini berada sebelum jam mulai salah satu slot di hari ini.

**Contoh**: Sekarang Jumat jam 08:30. Outlet memiliki slot Jumat jam 08:00–10:00 (sedang berlangsung, disabled) dan Jumat jam 14:00–16:00 (belum dimulai, tersedia).

**Perilaku yang diharapkan**:
- Default tanggal tetap pada **hari ini (Jumat)**.
- Slot 08:00–10:00 ditampilkan sebagai disabled dengan label "Sedang berlangsung".
- Slot 14:00–16:00 ditampilkan sebagai tersedia dan dapat dipilih.

---

### Skenario 2: Hari Ini Semua Slot Tidak Tersedia, Hari Berikutnya Bukan Hari Libur

**Kondisi**: Jam saat ini sudah melewati atau berada di dalam semua slot hari ini. Hari berikutnya adalah hari aktif kurir (bukan hari libur).

**Contoh**: Sekarang Jumat jam 17:00. Outlet memiliki slot Jumat jam 08:00–10:00 dan Jumat jam 14:00–16:00. Kedua slot sudah tidak tersedia. Sabtu adalah hari aktif kurir (bukan libur).

**Perilaku yang diharapkan**:
- Default tanggal berpindah ke **hari berikutnya (Sabtu)**.
- Semua slot kurir Sabtu ditampilkan sebagai tersedia secara normal.

---

### Skenario 3: Hari Ini Semua Slot Tidak Tersedia, Hari Berikutnya Adalah Hari Libur

**Kondisi**: Jam saat ini sudah melewati atau berada di dalam semua slot hari ini. Hari berikutnya adalah hari libur atau tidak ada jadwal kurir yang aktif.

**Contoh**: Sekarang Jumat jam 17:00. Outlet memiliki slot Jumat jam 08:00–10:00 dan Jumat jam 14:00–16:00. Kedua slot sudah tidak tersedia. Sabtu dan Minggu adalah hari libur (tidak ada slot kurir).

**Perilaku yang diharapkan**:
- Sistem menelusuri hari-hari berikutnya secara berurutan (Sabtu -> Minggu -> Senin -> ...) sampai menemukan hari yang:
  1. Bukan hari libur, **dan**
  2. Memiliki minimal satu slot jadwal kurir aktif.
- Default tanggal berpindah ke hari pertama yang memenuhi kedua syarat tersebut (dalam contoh ini: **Senin**).
- Semua slot kurir di hari tersebut ditampilkan sebagai tersedia secara normal.

---

### Skenario 4: Hari Ini Semua Slot Disabled karena Sedang Berlangsung (Bukan Terlewat)

**Kondisi**: Jam saat ini berada di dalam satu-satunya slot kurir hari ini dan tidak ada slot lain setelahnya hari ini.

**Contoh**: Sekarang Jumat jam 09:00. Outlet hanya memiliki satu slot Jumat jam 08:00–10:00 (sedang berlangsung, disabled). Tidak ada slot lain hari ini.

**Perilaku yang diharapkan**:
- Tidak ada slot tersedia untuk hari ini.
- Sistem menerapkan logika yang sama dengan Skenario 2 atau Skenario 3 (tergantung hari berikutnya).
- Default tanggal berpindah ke hari berikutnya yang tersedia.

## Keputusan Bisnis

1. **Default hari ini** jika masih ada minimal satu slot kurir yang belum dimulai (jam mulai > jam saat ini) di hari ini.
2. **Pindah ke hari berikutnya** jika tidak ada lagi slot tersedia di hari ini.
3. **Lewati hari libur** saat mencari hari berikutnya. Hari libur didefinisikan sebagai hari yang tidak memiliki jadwal kurir aktif di outlet tersebut.
4. **Iterasi hari** dilakukan secara berurutan (+1 hari per iterasi) sampai ditemukan hari aktif kurir pertama.
5. **Batas iterasi maksimum 30 hari** ke depan untuk menghindari loop tak terbatas.
6. **Jika tidak ada hari tersedia dalam 30 hari ke depan**, tampilkan pesan kepada customer bahwa jadwal kurir belum tersedia saat ini.

## Kebutuhan Pengguna

### 1. Customer Melihat Default Tanggal yang Relevan

- Saat customer membuka halaman pemesanan jadwal kurir, sistem langsung menampilkan tanggal default yang memiliki slot tersedia.
- Customer tidak perlu secara manual menelusuri hari-hari berikutnya hanya untuk menemukan slot yang bisa dipilih.
- Perubahan default tanggal dilakukan secara otomatis di sisi sistem, bukan di sisi customer.

### 2. Customer Memahami Status Setiap Slot

- Slot yang sedang berlangsung ditampilkan sebagai **disabled** dengan label **"Sedang berlangsung"**.
- Slot yang sudah terlewat ditampilkan sebagai **disabled** dengan label **"Sudah lewat"**.
- Slot yang tersedia ditampilkan secara normal dan dapat dipilih.

### 3. Sistem Melewati Hari Libur Secara Otomatis

- Jika hari berikutnya adalah hari libur (tidak ada slot kurir aktif), sistem otomatis melompat ke hari berikutnya lagi.
- Proses ini transparan bagi customer — customer langsung melihat hari pertama yang tersedia sebagai default.
- Customer tetap boleh memilih hari lain secara manual dari date picker jika tersedia.

### 4. Backend Memvalidasi Slot Saat Submit Order

- Frontend hanya membantu UX. Backend wajib memvalidasi ulang bahwa slot yang dipilih masih tersedia pada saat order disubmit.
- Jika antara customer membuka halaman dan submit order slot yang dipilih menjadi tidak tersedia (karena waktu berjalan), backend wajib menolak order dan memberikan pesan error yang jelas.
- Customer akan diminta memilih ulang slot jadwal yang tersedia.

## Alur Bisnis yang Diharapkan

### Customer Membuka Halaman Pemesanan Jadwal Kurir

1. Customer masuk ke halaman pemilihan jadwal kurir.
2. Sistem mengambil jam saat ini dan jadwal kurir outlet.
3. Sistem mengevaluasi slot di hari ini:
   - Jika ada slot tersedia (jam mulai > jam saat ini) -> default tanggal = hari ini.
   - Jika tidak ada slot tersedia -> lanjut ke langkah 4.
4. Sistem mengevaluasi hari berikutnya (+1 hari):
   - Jika hari tersebut adalah hari libur atau tidak ada slot kurir -> lanjut ke hari berikutnya lagi.
   - Jika hari tersebut adalah hari aktif kurir -> default tanggal = hari tersebut.
5. Sistem menampilkan halaman dengan tanggal default yang sudah ditentukan.
6. Slot yang tersedia ditampilkan normal; slot yang disabled ditampilkan dengan label status.

### Customer Memilih Slot dan Submit Order

1. Customer memilih slot jadwal kurir yang tersedia.
2. Customer melanjutkan ke checkout dan submit order.
3. Backend memvalidasi:
   - Slot yang dipilih masih berada di masa depan (jam mulai > jam submit).
   - Slot yang dipilih tidak sedang berlangsung (jam saat ini < jam mulai slot).
4. Jika valid -> order dibuat.
5. Jika tidak valid -> backend menolak dan memberikan pesan error. Customer diminta memilih ulang slot.

## Aturan Bisnis

1. Slot tersedia jika dan hanya jika: jam saat ini < jam mulai slot (di hari yang sama).
2. Slot disabled jika: jam mulai <= jam saat ini (termasuk sedang berlangsung maupun sudah terlewat).
3. Default tanggal = hari ini, jika ada minimal satu slot tersedia di hari ini.
4. Default tanggal = hari berikutnya yang aktif, jika tidak ada slot tersedia di hari ini.
5. Hari libur = hari yang tidak memiliki slot jadwal kurir aktif di outlet tersebut.
6. Iterasi pencarian hari default maksimum 30 hari ke depan.
7. Jika tidak ada hari tersedia dalam 30 hari, tampilkan pesan bahwa jadwal kurir belum tersedia.
8. Aturan ini berlaku khusus untuk penentuan **tanggal default**. Customer tetap boleh memilih tanggal lain secara manual.
9. Backend wajib memvalidasi ulang ketersediaan slot saat order disubmit.
10. Pengecekan waktu menggunakan zona waktu outlet.

## Rekomendasi Data Backend

### Logika Penentuan Default Tanggal (Pseudocode)

```
function getDefaultCourierDate(outletId, currentDateTime):
  currentDate = currentDateTime.date

  for offset in 0..30:
    candidateDate = currentDate + offset days

    slots = getActiveSlots(outletId, candidateDate.dayOfWeek)

    if slots is empty:
      continue  // hari libur atau tidak ada slot, lewati

    if offset == 0:
      // hari ini: filter slot yang belum dimulai
      availableSlots = slots.filter(slot => currentDateTime.time < slot.startTime)
      if availableSlots is not empty:
        return candidateDate
      else:
        continue  // tidak ada slot tersedia hari ini, coba besok
    else:
      // hari berikutnya: semua slot tersedia
      return candidateDate

  return null  // tidak ada hari tersedia dalam 30 hari
```

### Respons API Jadwal Kurir

```json
{
  "defaultDate": "2026-06-08",
  "defaultDayLabel": "Senin, 8 Juni 2026",
  "reason": "next_available_day",
  "slots": [
    {
      "id": "slot_001",
      "startTime": "08:00",
      "endTime": "10:00",
      "isAvailable": true,
      "unavailableReason": null
    },
    {
      "id": "slot_002",
      "startTime": "14:00",
      "endTime": "16:00",
      "isAvailable": true,
      "unavailableReason": null
    }
  ]
}
```

Nilai `reason` yang mungkin:

| Nilai | Keterangan |
|---|---|
| `today` | Default hari ini karena masih ada slot tersedia |
| `next_available_day` | Default bukan hari ini karena semua slot hari ini tidak tersedia |
| `no_schedule_available` | Tidak ada jadwal kurir tersedia dalam 30 hari ke depan |

### Respons Slot Disabled

```json
{
  "id": "slot_001",
  "startTime": "08:00",
  "endTime": "10:00",
  "isAvailable": false,
  "unavailableReason": "in_progress"
}
```

Nilai `unavailableReason` yang mungkin:

| Nilai | Keterangan |
|---|---|
| `in_progress` | Slot sedang berlangsung saat ini |
| `already_passed` | Slot sudah terlewat |

## UI Requirement

### Slot Jadwal Tersedia

Ditampilkan normal dengan teks jam, dapat diklik.

### Slot Jadwal Disabled — Sedang Berlangsung

Ditampilkan dengan warna abu-abu dan label "Sedang berlangsung", tidak dapat diklik.

### Slot Jadwal Disabled — Sudah Lewat

Ditampilkan dengan warna abu-abu dan label "Sudah lewat", tidak dapat diklik.

### Tanggal Default Berpindah ke Hari Berikutnya

Tidak perlu menampilkan notifikasi pop-up atau toast. Sistem cukup langsung menampilkan hari yang tersedia sebagai default. Customer akan melihat hari yang berbeda dari hari ini secara natural.

### Tidak Ada Jadwal Tersedia

```
Jadwal kurir belum tersedia saat ini.
Silakan coba lagi nanti atau hubungi outlet.
```

## Error / Validation Message

### Slot Sudah Tidak Tersedia Saat Submit

```
Jadwal kurir yang kamu pilih sudah tidak tersedia.
Silakan pilih jadwal lain.
```

### Tidak Ada Jadwal Tersedia

```
Belum ada jadwal kurir yang tersedia dalam waktu dekat.
Silakan hubungi outlet untuk informasi lebih lanjut.
```

## Acceptance Criteria

1. Saat customer membuka halaman jadwal kurir, default tanggal yang ditampilkan adalah hari yang memiliki slot tersedia.
2. Jika hari ini masih ada slot yang belum dimulai, default tanggal adalah hari ini.
3. Jika hari ini tidak ada lagi slot yang tersedia (semua sedang berlangsung atau sudah lewat), default tanggal berpindah ke hari berikutnya yang aktif.
4. Jika hari berikutnya adalah hari libur (tidak ada slot kurir), sistem melompat ke hari berikutnya lagi secara otomatis.
5. Proses lompat hari libur berlanjut sampai ditemukan hari aktif pertama.
6. Slot yang sedang berlangsung ditampilkan sebagai disabled dengan label "Sedang berlangsung".
7. Slot yang sudah terlewat ditampilkan sebagai disabled dengan label "Sudah lewat".
8. Slot yang belum dimulai ditampilkan sebagai tersedia dan dapat dipilih.
9. Jika tidak ada jadwal tersedia dalam 30 hari ke depan, sistem menampilkan pesan yang sesuai.
10. Backend memvalidasi ulang ketersediaan slot saat order disubmit.
11. Jika slot yang dipilih sudah tidak tersedia saat submit, backend menolak order dan customer mendapat pesan error.
12. Semua pengecekan waktu menggunakan zona waktu outlet.

## Catatan Relasi dengan User Need Lain

### Relasi dengan Validasi Jadwal Kurir

Dokumen `customer_courier_schedule_validation_user_need.md` sudah menetapkan bahwa slot yang sedang berlangsung atau sudah terlewat harus di-disable. User need ini merupakan **kelanjutan langsung** dari dokumen tersebut: setelah slot di-disable, sistem perlu menentukan default tanggal yang cerdas agar customer langsung diarahkan ke slot yang tersedia.

### Relasi dengan Hari Libur Outlet

Definisi hari libur mengacu pada konfigurasi jadwal kurir outlet. Hari yang tidak memiliki slot kurir aktif dianggap sebagai hari libur untuk keperluan logika ini.

### Relasi dengan Operational Hours

Dokumen `customer_outlet_operational_hours_user_need.md` mengatur jam operasional outlet secara umum. Jadwal kurir adalah subset dari jam operasional outlet. Jika outlet tutup, semua jadwal kurir juga otomatis tidak tersedia.

## Catatan Ruang Lingkup

In scope:

1. Logika penentuan default tanggal berdasarkan ketersediaan slot kurir dan hari libur.
2. Tampilan status slot (tersedia, sedang berlangsung, sudah lewat).
3. Validasi backend saat submit order.
4. Iterasi maksimum 30 hari ke depan untuk mencari hari tersedia.
5. Pesan kepada customer jika tidak ada jadwal tersedia.

Out of scope:

1. Hari libur nasional (di luar konfigurasi jadwal kurir outlet).
2. Perubahan jadwal kurir yang bersifat mendadak/ad hoc di hari tertentu.
3. Notifikasi push kepada customer ketika jadwal berubah.
4. Logika untuk membagi atau menggabungkan order berdasarkan tanggal.

## Keputusan untuk Plan

1. Direkomendasikan backend yang menentukan `defaultDate` sebagai bagian dari respons API jadwal kurir agar logika konsisten dan tidak direplikasi di frontend.
2. Backend tetap wajib memvalidasi ulang slot saat submit order, terlepas dari siapa yang menghitung `defaultDate`.
3. Pengecekan waktu menggunakan zona waktu outlet, bukan zona waktu device customer.
4. Batas iterasi pencarian hari default adalah 30 hari ke depan.
5. Definisi hari libur = hari yang tidak memiliki slot kurir aktif di outlet (bukan kalender nasional).
