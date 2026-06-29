# Feedback Review: Default Position Production Eligibility Seeder Plan

Tanggal: 2026-05-28

Dokumen yang direview:
- `docs/plan/default_position_production_eligibility_seeder_plan.md`
- `docs/spec/default_position_process_commission_realistic_seeder_user_need.md`

## Findings

### 1. Snippet `OrderItemProcess` di plan tidak cocok dengan model aktual

Pada bagian method `createProcessProgressForOrderItem`, contoh implementasi di plan masih memakai field yang tidak sesuai dengan model `OrderItemProcess`.

Contoh yang bermasalah di plan:
- `process_id`
- `sequence`
- `status`

Masalah:
- Model `OrderItemProcess` saat ini tidak memakai field-field tersebut sebagai payload create utama.
- Model yang ada memakai relasi `laundry_service_process_id` dan status proses diturunkan dari kombinasi `started_at` dan `completed_at`, bukan dari field `status`.

Risiko:
- Jika implementer mengikuti plan apa adanya, seeder yang dibuat akan salah terhadap struktur tabel/model aktual.

Saran:
- Revisi contoh create `OrderItemProcess` agar mengikuti schema/model aktual.
- Gunakan `laundry_service_process_id` sebagai foreign key utama.
- Gunakan `started_at` dan `completed_at` untuk merepresentasikan progress proses.

### 2. Plan belum menutup semua jalur assignment process dan commission

Plan sudah meminta guard eligibility produksi di `EmployeeService`, tetapi penjelasannya masih terlalu umum dan belum memastikan seluruh jalur assignment tertutup.

Masalah:
- Flow create/update employee biasa masih bisa melewati helper private seperti:
  - `assignProcesses`
  - `assignProcessCommissions`
- Jika plan hanya diimplementasikan pada method tertentu saja, employee non-produksi masih berpotensi mendapat process assignment atau commission dari flow lain.

Risiko:
- Requirement eligibility produksi menjadi hanya sebagian benar.
- Perilaku sistem berbeda tergantung entry point yang dipakai.

Saran:
- Di plan, sebutkan secara eksplisit semua titik enforcement yang wajib diaudit:
  - create employee,
  - update employee,
  - sync employee processes,
  - create employee process,
  - update employee process,
  - assignment commission dari flow create/update employee.
- Jika memungkinkan, arahkan implementasi ke satu helper reusable agar guard tidak tersebar setengah-setengah.

### 3. Beberapa gap di plan sebenarnya sudah selesai di repo

Plan masih menandai beberapa area sebagai gap, padahal implementasinya sudah ada di codebase saat ini.

Contoh yang sudah ada:
- `Employee::isEligibleForProduction()`
- Guard eligibility di `OrderItemService`
- Guard eligibility di sebagian flow `EmployeeService`

Risiko:
- Plan menjadi stale.
- Implementer bisa mengulang pekerjaan yang sebenarnya sudah selesai.
- Sulit membedakan mana remaining work dan mana historical gap.

Saran:
- Perbarui bagian `Ringkasan Gap`.
- Pindahkan item yang sudah selesai ke section seperti:
  - `Sudah Diimplementasikan`
  - `Remaining Gaps`

### 4. Plan menyebut `OrderFactory` sebagai gap tetapi tidak benar-benar memasukkannya ke langkah implementasi

Plan mengidentifikasi `OrderFactory::definition()` sebagai sumber masalah karena masih random dan belum konsisten secara bisnis.

Namun:
- Di urutan implementasi tidak ada langkah konkret untuk refactor factory.
- Fokus implementasi justru diarahkan ke `LaundryBusinessSeeder`.

Risiko:
- Ada mismatch antara analisis gap dan eksekusi plan.
- Factory tetap menjadi sumber seeded data yang tidak realistis di tempat lain.

Saran:
- Putuskan salah satu:
  1. Hapus `OrderFactory` dari daftar gap jika memang tidak akan disentuh.
  2. Tambahkan fase khusus untuk merapikan state factory order agar konsisten dengan scenario-driven seeding.

### 5. Plan bergeser dari requirement “3 order per status” menjadi “3 order per skenario”

Spec menyebut kebutuhan minimum:
- tiga order per status per outlet.

Plan mengubah framing menjadi:
- tiga order per skenario per outlet.

Masalah:
- Secara praktis bisa mirip, tetapi secara definisi tidak identik.
- Jika nanti satu status memiliki lebih dari satu skenario, requirement spec bisa tidak terpenuhi secara eksplisit.

Saran:
- Selaraskan istilah di plan dengan spec.
- Jika tetap ingin memakai konsep skenario, tambahkan kalimat tegas bahwa setiap status yang dipakai harus tetap memenuhi minimal tiga order per outlet.

## Open Questions

### 1. Source of truth default position perlu dirumuskan lebih tepat

Plan menyebut `PositionService::getDefaultPositions()` sebagai source of truth.

Catatan:
- Method tersebut saat ini bersifat private.
- Implementer tidak bisa memakainya langsung dari luar service.

Saran:
- Rumuskan source of truth sebagai flow runtime `createDefaultPositionsForOutlet()` beserta mapping internalnya.
- Hindari menyebut method private sebagai kontrak implementasi lintas layer.

### 2. Plan belum punya fase test/verification yang eksplisit

Saat ini plan sudah punya checklist sebelum commit, tetapi belum ada test plan yang benar-benar konkret.

Saran:
- Tambahkan fase verifikasi minimal untuk:
  - eligibility produksi pada create/update employee,
  - penolakan process assignment untuk non-produksi,
  - penolakan commission assignment untuk non-produksi,
  - start/complete process oleh employee non-produksi,
  - distribusi seeded order per status per outlet,
  - konsistensi payment status, payment method, dan timeline.

## Rekomendasi Revisi Plan

Revisi minimum yang saya sarankan:

1. Perbarui `Ringkasan Gap` agar hanya berisi pekerjaan yang benar-benar belum selesai.
2. Koreksi contoh implementasi `OrderItemProcess` agar sesuai schema/model aktual.
3. Tambahkan audit eksplisit untuk semua jalur assignment process dan commission di `EmployeeService`.
4. Selaraskan kembali istilah `status` vs `skenario` dengan requirement spec.
5. Putuskan posisi `OrderFactory`: ikut direfactor atau dikeluarkan dari daftar gap.
6. Tambahkan section `Test Plan` atau `Verification Plan`.

## Kesimpulan

Arah plan sudah benar dan cukup dekat dengan user need, terutama pada standardisasi default position, gating produksi, dan niat menjadikan seeder order lebih realistis. Namun dokumen ini masih perlu dirapikan agar lebih akurat terhadap codebase saat ini, lebih presisi pada struktur model aktual, dan lebih tegas dalam menutup seluruh jalur enforcement eligibility produksi.
