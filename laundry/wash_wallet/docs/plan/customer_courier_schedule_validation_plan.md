# Plan: Customer Courier Schedule Validation & Default Date

## Summary
Implementasi validasi jadwal kurir dilakukan dua lapis: backend sebagai sumber kebenaran, frontend sebagai UX disabled state. Untuk tanggal hari ini, slot hanya bisa dipilih jika jam saat ini sebelum `startTime`; slot yang sedang berjalan atau sudah lewat harus disabled dan ditolak saat submit.
Selain itu, sistem perlu menentukan default tanggal pemesanan (default date) secara cerdas. Jika semua slot hari ini sudah habis, sistem akan melompat ke hari aktif berikutnya (maksimal 30 hari ke depan).

## Instruksi Untuk AI Model
- Wajib baca `docs/spec/` sebelum coding.
- Gunakan shared UI reusable dari `wash_wallet_ui`, seperti `AppCard`, `AppBadge`, `AppButton`, `AppChip`, `AppEmptyState`, `AppLoadingIndicator`.
- Gunakan `context.colors`, `context.typography`, `context.space`, `context.radius`; jangan hardcode warna.
- Jangan membuat file panjang; pecah UI ke widget kecil di folder `widgets/`.
- Jangan menulis comment di code.
- Review file terkait sebelum edit, terutama schedule/order flow frontend dan validasi order backend.

## Key Changes

### Backend
- Update `CourierScheduleAvailabilityService` untuk menghitung availability slot berdasarkan `targetDate` dan timezone outlet.
- Tambahkan fitur di service tersebut untuk menghitung `defaultDate`: 
  - Jika frontend meminta jadwal (initial load) tanpa menspesifikkan `date`, backend mengevaluasi mulai hari ini.
  - Jika hari ini ada slot yang belum dimulai (`now < start_time`), return hari ini sebagai default.
  - Jika tidak, iterasi maksimal 30 hari ke depan, cari hari pertama yang memiliki jadwal kurir aktif.
  - Respons API harus menyertakan info: `defaultDate`, `defaultDayLabel`, dan `reason` (contoh: `today`, `next_available_day`, `no_schedule_available`) bersama list `slots` nya.
- Tambahkan field response di resource `CourierSchedule`: `isBookable`, `availabilityStatus`, `availabilityLabel` (misal: "Sedang berlangsung", "Sudah lewat"), `unavailableReason`.
- Update `CourierScheduleController@index` agar mendukung pencarian default date jika param `date` tidak ada, dan mengembalikan hari spesifik jika `date` disediakan.
- Update `OrderService::storeCustomer()` untuk validasi ulang `pickupScheduleId` saat submit:
  - schedule harus aktif, outlet sesuai, type `pickup`, dan day-of-week sesuai `pickupDate`.
  - jika `pickupDate` adalah hari ini di timezone outlet, schedule hanya valid jika `now < start_time`.
  - jika invalid, return error 422 dengan pesan customer-friendly.
- Update `CustomerOrderService::scheduleDelivery()` dengan validasi yang sama untuk type `delivery`.
- Update request/controller error handling agar schedule validation tidak jatuh menjadi pesan generik 500.

### Frontend Customer App
- Extend `CourierSchedule` entity/model dengan field availability: `isBookable`, `availabilityStatus`, `availabilityLabel`, `unavailableReason`.
- Buat entitas/model wrapper baru untuk respons API agar dapat menangkap `defaultDate`, `defaultDayLabel`, dan `reason`.
- Extend courier schedule datasource/repository/usecase/cubit agar request pertama tidak perlu menyertakan tanggal (membiarkan backend menentukan `defaultDate`), lalu request selanjutnya memakai tanggal yang diubah manual oleh user.
- Update `CourierPickupSectionWidget` dan `DeliveryScheduleScreen` beserta state management-nya:
  - Saat mendapat `defaultDate` dari backend, sinkronisasi state tanggal yang terpilih agar UI menampilkan kalender/date picker di tanggal tersebut.
  - Tampilkan error/empty state jika respons mengembalikan `reason: no_schedule_available` (dalam 30 hari tidak ada jadwal).
- Buat widget kecil di `apps/customer/lib/features/order/presentation/widgets/`:
  - `schedule_time_slot_card_widget.dart`
  - `schedule_availability_badge_widget.dart`
- Refactor `ScheduleSelectorWidget` dan schedule section delivery agar memakai widget baru, bukan `ChoiceChip`/container inline.
- Disabled slot tidak bisa dipilih; tampilkan label UI sesuai `availabilityLabel` dari backend.
- Jika schedule yang sedang dipilih menjadi tidak bookable setelah reload, clear selection dan tampilkan state agar user memilih ulang.

## Test Plan
- Backend feature/unit tests:
  - pencarian default date (hari ini masih tersedia).
  - pencarian default date (hari ini habis, lompat besok).
  - pencarian default date (hari ini habis, besok libur, lompat lusa).
  - validasi submit: hari ini `now < start_time` accepted.
  - validasi submit: hari ini `start_time <= now <= end_time` rejected.
  - validasi submit: hari ini `now > end_time` rejected.
  - besok/future date accepted.
  - pickup submit dan delivery scheduling sama-sama tervalidasi.
- Frontend checks:
  - initial load langsung menampilkan dan memilih `defaultDate` dari backend (bukan otomatis hari ini jika sudah habis).
  - slot berjalan/lewat disabled dan berlabel.
  - pilih hari berikutnya manual: semua slot aktif tampil selectable.
  - jika 30 hari kosong, tampil empty state.
  - submit setelah slot menjadi invalid: snackbar menampilkan error backend dan tidak membuat order.
- Static checks:
  - `dart format` untuk file Dart yang diubah.
  - `flutter analyze`.
  - `php -l` untuk file PHP yang diubah.
  - test Laravel terkait order dan courier schedule.

## Assumptions
- Timezone outlet memakai field `outlets.timezone`, default `Asia/Jakarta`.
- Backend menjadi penentu `defaultDate`, frontend hanya mengikuti respons API.
- Parameter query frontend disesuaikan: bisa mengirim `date=YYYY-MM-DD` atau kosong (untuk mendapatkan default date).
- Tidak ada perubahan schema database yang diperlukan, hanya penambahan endpoint logic dan resource fields.
