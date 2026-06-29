# User Need: Default Position Outlet, Gating Proses Produksi, dan Seeder Order yang Realistis

Tanggal: 2026-05-28

## 1. Latar Belakang

Codebase saat ini sudah memiliki fondasi yang cukup baik untuk:

1. Membuat default position saat outlet dibuat.
2. Menempelkan default permission ke position berdasarkan slug.
3. Menyimpan assignment process dan commission ke employee.
4. Menyimpan order dengan berbagai status dan payment status.

Namun masih ada gap kualitas implementasi dan data demo:

1. Flow produksi aplikasi sudah mengasumsikan adanya position default `kasir`, `produksi`, dan `kurir`, tetapi seeder bisnis masih membuat posisi secara acak dan tidak konsisten dengan flow produksi.
2. Assignment process dan commission ke employee saat ini belum dikunci secara eksplisit oleh position `produksi`, sehingga employee non-produksi masih berpotensi memperoleh process assignment atau komisi produksi.
3. Seeder order saat ini masih terlalu acak, sehingga bisa menghasilkan kombinasi data yang tidak masuk akal untuk kebutuhan demo, QA, dan validasi bisnis.

Dokumen ini menjadi pondasi kebutuhan bisnis sebelum dibuat implementation plan.

## 2. Ringkasan Temuan dari Codebase Saat Ini

### Sudah Ada

1. `PositionService::createDefaultPositionsForOutlet()` sudah membuat tiga default position:
   - `Kasir`
   - `Produksi`
   - `Kurir`
2. `Permission::defaultForSlug()` sudah menjadi source of truth untuk default permission per slug position.
3. Listener `CreateOutletPositionsListener` sudah memanggil flow default position saat outlet dibuat.
4. `OrderItemService` sudah mengecek apakah employee punya assignment process aktif sebelum memulai/menyelesaikan proses.

### Gap yang Relevan

1. `LaundryBusinessSeeder` masih membuat position secara manual dan acak berdasarkan ukuran outlet, sehingga tidak selaras dengan flow produksi yang mengandalkan tiga default position tetap.
2. `EmployeeProcessSeeder` masih meng-assign process dan commission berdasarkan urutan employee global, bukan berdasarkan kelayakan position `produksi`.
3. `OrderFactory` dan `LaundryBusinessSeeder` masih menghasilkan status order, payment status, dan progres order secara terlalu acak, sehingga dapat menimbulkan kombinasi yang tidak realistis.
4. Seeder belum menjamin distribusi minimal order per status per outlet.
5. Seeder belum menjamin variasi payment method yang disengaja dan masuk akal antar skenario order.

## 3. Tujuan Fitur

Perbaikan yang diinginkan memiliki tiga tujuan utama:

1. Menjadikan tiga default position outlet sebagai standar tetap di sistem dan di seeder.
2. Menjadikan position `produksi` sebagai syarat wajib agar employee bisa menerima process assignment dan commission produksi.
3. Menjadikan data seeder order lebih realistis, konsisten secara bisnis, dan lebih berguna untuk demo maupun testing manual.

## 4. Aktor

1. `super_admin`
   Mengawasi data sistem dan dapat melakukan audit.
2. `owner`
   Membuat outlet, mengelola employee, position, assignment process, dan data operasional outlet.
3. `employee`
   Menjalankan tugas berdasarkan position dan assignment process yang valid.
4. `system`
   Membuat default position, memvalidasi eligibility process, dan menghasilkan seeded data yang realistis.

## 5. Scope Kebutuhan

Scope utama:

1. Default position outlet.
2. Default permission per position.
3. Eligibility employee untuk process dan commission produksi.
4. Seeder employee-process-commission.
5. Seeder order yang realistis dan terdistribusi per status.

Di luar scope:

1. Mendesain ulang seluruh flow order production dari nol.
2. Menambah master permission baru di luar katalog yang sudah ada.
3. Mengubah seluruh model pembayaran eksternal seperti Midtrans.

## 6. User Need Fungsional

### FR-01 Outlet Baru Harus Memiliki Tiga Default Position Tetap

1. Saat outlet dibuat, sistem harus selalu membentuk tepat tiga default position:
   - `Kasir`
   - `Produksi`
   - `Kurir`
2. Tiga position ini harus aktif secara default.
3. Tiga position ini harus memiliki slug yang stabil dan konsisten dengan aturan bisnis sistem.
4. Seeder outlet juga harus menggunakan pola yang sama, bukan membuat kombinasi position acak yang berbeda dari flow produksi.

### FR-02 Setiap Default Position Harus Memiliki Default Permission

1. `Kasir`, `Produksi`, dan `Kurir` harus otomatis memperoleh permission default sesuai source of truth sistem.
2. Mapping default permission tidak boleh di-hardcode terpisah di seeder jika source of truth sudah tersedia di domain utama.
3. Seeder dan flow runtime harus menghasilkan permission default yang sama untuk slug position yang sama.

### FR-03 Employee Hanya Boleh Mendapat Process Jika Memiliki Position Produksi

1. Employee hanya boleh menerima assignment process jika memiliki minimal satu position aktif dengan slug `produksi`.
2. Position `produksi` yang dipakai sebagai syarat harus relevan dengan outlet context employee tersebut.
3. Employee tanpa position `produksi` tidak boleh:
   - menerima assignment process,
   - menerima assignment commission proses,
   - dianggap eligible untuk pengerjaan proses produksi.

### FR-04 Commission Proses Hanya Berlaku untuk Employee Produksi

1. Commission proses hanya boleh dibuat untuk employee yang memenuhi eligibility produksi.
2. Jika employee tidak memiliki position `produksi`, sistem harus menolak pembuatan atau sinkronisasi commission proses.
3. Jika employee kehilangan eligibility produksi, assignment process dan commission yang ada tidak boleh lagi dianggap valid untuk operasi produksi sampai eligibility kembali terpenuhi.

### FR-05 Enforcement Operasional Harus Konsisten dengan Eligibility Produksi

1. Saat employee memulai atau menyelesaikan proses order item, sistem harus memastikan employee:
   - memiliki assignment process aktif, dan
   - tetap eligible sebagai employee produksi.
2. Employee non-produksi tidak boleh bisa mengerjakan proses hanya karena masih memiliki record assignment process lama.

### FR-06 Seeder Employee Harus Selaras dengan Position Outlet

1. Employee yang dibuat oleh seeder harus dihubungkan ke position yang benar-benar ada pada outlet tersebut.
2. Jika seeder membuat assignment process atau commission, employee target harus memiliki position `produksi`.
3. Seeder sebaiknya tetap menyediakan komposisi role operasional yang masuk akal, minimal mencerminkan kebutuhan:
   - kasir,
   - produksi,
   - kurir.

### FR-07 Seeder Order Harus Berbasis Skenario, Bukan Acak Penuh

1. Order seeded harus dibentuk dari skenario operasional yang masuk akal, bukan hanya kombinasi random status, pembayaran, dan tanggal.
2. Skenario order minimal harus membedakan:
   - order walk-in kasir,
   - order pickup/delivery kurir,
   - order yang sedang diproses produksi,
   - order selesai,
   - order batal atau ditolak.
3. Seeder boleh tetap memakai variasi data, tetapi variasinya harus dibatasi dalam koridor bisnis yang konsisten.

### FR-08 Setiap Outlet Harus Memiliki Minimal Tiga Order per Status yang Dipakai

1. Pada setiap outlet seeded, setiap status order yang diputuskan masuk dalam skenario bisnis harus memiliki minimal tiga order.
2. Distribusi ini harus dibuat per outlet, bukan hanya global lintas semua outlet.
3. Status yang disiapkan oleh seeder harus mewakili alur bisnis nyata sistem, termasuk status aktif dan status terminal yang relevan.

### FR-09 Payment Method Seeder Harus Bervariasi dan Masuk Akal

1. Order seeded dalam satu outlet tidak boleh didominasi satu payment method saja.
2. Harus ada variasi payment method antar skenario order, misalnya `cash`, `qris`, `transfer`, `debit`, `ewallet`, atau `cod` bila memang relevan.
3. Variasi payment method harus mengikuti konteks order:
   - `cod` hanya untuk skenario yang memang logis memakai bayar di tempat,
   - `transfer` atau digital payment lebih cocok untuk order non-tunai,
   - payment method order tidak boleh terasa acak tanpa alasan bisnis.
4. Karena jumlah status order lebih banyak daripada payment method, kebutuhan ini ditafsirkan sebagai distribusi payment method yang disengaja per kelompok skenario, bukan relasi satu payment method unik untuk setiap status.

### FR-10 Status Order dan Pembayaran Harus Konsisten Secara Bisnis

1. Seeder tidak boleh membuat order dengan kombinasi yang tidak masuk akal, misalnya:
   - order `completed` tetapi masih `unpaid`,
   - order `delivered` tetapi belum pernah melewati proses yang diperlukan,
   - order `cancelled` tetapi masih tampak sebagai order aktif normal,
   - order `rejected` tetapi memiliki progres produksi lanjutan.
2. Untuk order yang sudah selesai secara operasional, status pembayaran harus mencerminkan penyelesaian yang masuk akal.
3. Jika ada skenario COD, penyelesaian status order dan pembayaran harus tetap konsisten dan tidak membingungkan untuk data demo.

### FR-11 Kronologi Order Seeder Harus Masuk Akal

1. Tanggal order, estimasi selesai, waktu mulai proses, waktu selesai proses, pengantaran, dan penyelesaian harus urut secara kronologis.
2. Status yang lebih lanjut tidak boleh memiliki timestamp yang lebih awal daripada tahapan sebelumnya.
3. Seeder tidak boleh membuat order yang secara waktu terlihat mustahil.

### FR-12 Progress Produksi pada Order Harus Konsisten dengan Status Order

1. Jika order berada di tahap awal, proses produksi dan order item process tidak boleh tampak sudah selesai semua.
2. Jika order berada di status `in_progress`, harus ada indikasi bahwa minimal sebagian proses memang sudah dimulai.
3. Jika order berada di status `ready`, `delivered`, atau `completed`, maka proses-proses yang diwajibkan untuk order item tersebut harus sudah selesai.
4. Employee yang tercatat pada log proses order seeded harus merupakan employee yang valid untuk produksi.

## 7. Business Rules

1. Source of truth default position tetap berada pada domain utama sistem, bukan pada seeder yang berdiri sendiri.
2. Source of truth default permission per position tetap berada pada katalog permission utama sistem.
3. Position `produksi` adalah syarat eligibility untuk assignment process dan commission produksi.
4. Assignment process tanpa eligibility produksi dianggap tidak valid.
5. Commission proses tanpa eligibility produksi dianggap tidak valid.
6. Seeder order harus scenario-driven dan deterministic secara bisnis, walaupun masih boleh memiliki variasi minor.
7. Status order terminal harus selaras dengan kondisi pembayaran dan progres operasional.
8. Distribusi minimal tiga order per status harus dihitung per outlet.

## 8. Kebutuhan Non-Fungsional

### NFR-01 Konsistensi Domain

1. Flow runtime dan seeder harus memakai aturan yang sama untuk default position dan default permission.
2. Tidak boleh ada dua sumber aturan yang saling bertentangan antara runtime dan seeder.

### NFR-02 Data Realism untuk Demo dan QA

1. Data seeded harus mudah dipahami manusia saat dibuka di dashboard.
2. Data seeded harus cukup realistis untuk demo owner, testing manual, dan validasi visual UI.

### NFR-03 Maintainability

1. Rule eligibility produksi harus berada di tempat yang bisa dipakai ulang oleh flow create, update, sync, dan operasi proses.
2. Scenario order seeded harus mudah diperluas tanpa kembali ke model random penuh.

## 9. Acceptance Criteria

1. Saat outlet baru dibuat, tiga default position `Kasir`, `Produksi`, dan `Kurir` selalu tersedia tanpa tergantung ukuran outlet atau randomizer.
2. Tiga default position tersebut otomatis memiliki permission default yang konsisten dengan source of truth sistem.
3. Employee tanpa position `produksi` ditolak saat akan diberi process assignment.
4. Employee tanpa position `produksi` ditolak saat akan diberi commission proses.
5. Employee non-produksi tidak bisa memulai atau menyelesaikan proses produksi walaupun memiliki assignment process lama yang tidak valid.
6. Seeder employee-process tidak pernah membuat commission proses untuk employee non-produksi.
7. Pada setiap outlet seeded, setiap status order yang termasuk skenario seeder memiliki minimal tiga order.
8. Seeder tidak lagi menghasilkan kombinasi absurd seperti order selesai tetapi belum dibayar tanpa skenario bisnis yang jelas.
9. Payment method order dalam seeded data bervariasi antar skenario dan tetap konsisten dengan konteks order.
10. Timestamp order seeded tersusun kronologis dan konsisten dengan status operasionalnya.

## 10. Titik Implementasi yang Perlu Dipertimbangkan Model Planner

1. Reuse flow yang sudah ada untuk default position dan default permission, jangan biarkan seeder membuat aturan duplikat sendiri.
2. Audit seluruh titik assignment process dan commission:
   - create employee,
   - update employee,
   - seeder employee process,
   - operasi start/complete proses.
3. Definisikan satu rule eligibility produksi yang bisa dipakai bersama.
4. Refactor seeder order dari model random menjadi model scenario/template.
5. Pastikan seeder order mengontrol:
   - status,
   - payment status,
   - payment method,
   - timeline,
   - process progress,
   - distribusi jumlah order per status per outlet.

## 11. Referensi Codebase

1. Default permission per slug: `app/Enums/Permission.php`
2. Default position outlet: `app/Services/PositionService.php`
3. Listener outlet created: `app/Listeners/CreateOutletPositionsListener.php`
4. Seeder bisnis outlet: `database/seeders/LaundryBusinessSeeder.php`
5. Seeder employee process: `database/seeders/EmployeeProcessSeeder.php`
6. Order status enum: `app/Enums/OrderStatus.php`
7. Order domain model: `app/Models/Order.php`
8. Order random factory: `database/factories/OrderFactory.php`
9. Enforcement proses order item: `app/Services/OrderItemService.php`
10. Employee assignment flow: `app/Services/EmployeeService.php`
