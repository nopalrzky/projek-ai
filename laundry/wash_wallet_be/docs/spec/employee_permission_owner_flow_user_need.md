# User Need: Employee Permission per Position dan Multi-Position Employee

Tanggal: 2026-05-28

## 1. Latar Belakang

Sistem saat ini sudah memiliki fondasi RBAC berbasis `position`, `position_permissions`, dan assignment `employee_positions`. Namun kebutuhan bisnis yang ingin dipastikan adalah:

1. Terdapat master data permission yang sifatnya fixed.
2. Saat owner membuat atau mengubah jabatan/position, owner juga menentukan permission apa saja yang melekat pada jabatan tersebut.
3. Satu employee dapat memiliki lebih dari satu position.
4. Hak akses employee ditentukan dari gabungan permission seluruh position aktif yang dia miliki pada outlet yang relevan.

Dokumen ini disusun agar model lain dapat membuat implementation plan yang sesuai dengan codebase saat ini.

## 2. Ringkasan Temuan dari Codebase Saat Ini

### Sudah Ada

1. Master permission fixed sudah ada di enum `App\Enums\Permission`.
2. Tabel relasi permission per position sudah ada: `position_permissions`.
3. Tabel relasi many-to-many employee ke position sudah ada: `employee_positions`.
4. Backend API create/update position sudah menerima field `permissions`.
5. Middleware employee permission per outlet sudah ada melalui `position.permission`.
6. Payload login employee sudah mengembalikan `accessibleOutlets` dan `allPermissions`.
7. Form create employee di dashboard web sudah mendukung `positionIds` berupa array.

### Gap yang Paling Relevan

1. Flow owner dari halaman outlet untuk create/edit position belum menerima dan menampilkan field `permissions`.
2. Form owner pada `Dashboard/Outlets/Positions/Create` dan `Edit` baru memuat `name`, `description`, dan `isActive`.
3. Request owner-side pada `app/Http/Requests/Outlet/Position/*` juga belum memvalidasi `permissions`.

## 3. Tujuan Fitur

Membuat flow manajemen permission employee yang konsisten dari sisi owner, dengan prinsip:

1. Permission didefinisikan sekali oleh sistem sebagai master tetap.
2. Owner tidak bisa membuat permission baru.
3. Owner hanya memilih permission dari master list saat membuat atau mengubah position.
4. Employee dapat memiliki banyak position.
5. Effective permission employee merupakan union dari seluruh permission pada position aktif yang dimiliki employee.

## 4. Aktor

1. `super_admin`
   Mengelola sistem secara global dan dapat mengakses seluruh tenant.
2. `owner`
   Mengelola outlet miliknya, termasuk position dan assignment position ke employee.
3. `employee`
   Mengakses fitur sesuai permission yang diperoleh dari position aktif.
4. `system`
   Menyediakan master permission, memvalidasi assignment, dan menegakkan access control.

## 5. Scope Kebutuhan

Scope utama fitur ini:

1. Master permission catalog.
2. Owner flow create/edit position dengan pemilihan permission.
3. Employee assignment ke banyak position.
4. Permission enforcement di endpoint employee/mobile.
5. Konsistensi payload login employee untuk kebutuhan frontend mobile.

Di luar scope:

1. Owner membuat permission custom baru.
2. Permission hierarchy kompleks di luar daftar master.
3. Policy builder dinamis per aksi non-master.

## 6. User Need Fungsional

### FR-01 Master Data Permission Tersedia dan Read-Only

1. Sistem harus menyediakan daftar master permission dengan minimal field:
   - `key`
   - `label`
2. Daftar permission hanya dapat dibaca oleh owner/admin untuk kebutuhan form.
3. Owner tidak dapat menambah, mengubah, atau menghapus key master dari UI operasional.

### FR-02 Owner Dapat Menentukan Permission Saat Membuat Position

1. Saat owner membuat jabatan/position pada outlet, owner dapat memilih banyak permission dari master list.
2. Permission yang dipilih disimpan sebagai relasi position ke permission.
3. Jika owner tidak memilih permission apa pun, sistem tetap dapat membuat position, dengan perilaku yang harus didefinisikan jelas:
   - diizinkan sebagai position tanpa akses, atau
   - diwajibkan minimal satu permission.

### FR-03 Owner Dapat Mengubah Permission pada Position

1. Saat owner mengedit jabatan/position, owner dapat:
   - menambah permission,
   - menghapus permission,
   - mempertahankan permission yang sudah ada.
2. Hasil akhir permission pada position harus tersinkron penuh dengan pilihan terakhir owner.

### FR-04 Employee Dapat Memiliki Banyak Position

1. Owner dapat memberikan lebih dari satu position kepada satu employee.
2. Satu employee dapat memiliki kombinasi position dalam outlet yang sama.
3. Untuk kebutuhan multi-outlet, assignment lintas outlet hanya mengikuti aturan bisnis yang sudah berlaku pada codebase.
4. Sistem harus mencegah assignment duplikat untuk kombinasi employee dan position yang sama.

### FR-05 Effective Permission Employee adalah Union dari Semua Position Aktif

1. Jika employee memiliki beberapa position aktif, maka seluruh permission dari position-position tersebut digabung.
2. Jika dua position memiliki permission yang sama, hasil effective permission tidak boleh duplikat.
3. Jika satu position dinonaktifkan atau assignment position dinonaktifkan, permission dari position tersebut tidak lagi dihitung.

### FR-06 Permission Ditegakkan per Outlet Context

1. Saat employee mengakses endpoint mobile/API, sistem harus memeriksa permission berdasarkan outlet context.
2. Untuk request biasa, outlet context dapat berasal dari header, payload, atau default outlet employee sesuai standar sistem saat ini.
3. Untuk use case agregat lintas outlet, sistem harus tetap mendukung pengecekan permission berdasarkan outlet yang dapat diakses employee.

### FR-07 Login Employee Mengembalikan Informasi Akses yang Lengkap

1. Setelah login, response employee harus memuat data yang cukup untuk frontend menentukan akses.
2. Minimal payload harus memuat:
   - daftar outlet yang dapat diakses,
   - position aktif per outlet,
   - union permission employee.

### FR-08 Default Position Tetap Punya Default Permission

1. Saat outlet baru dibuat, default position seperti `kasir`, `produksi`, dan `kurir` tetap otomatis terbentuk.
2. Default position tetap memperoleh default permission sesuai definisi sistem.
3. Owner tetap dapat mengubah permission default position setelahnya jika bisnis mengizinkan.

## 7. Business Rules

1. Master permission berasal dari sistem, bukan dari input owner.
2. Permission key yang dikirim dari form wajib cocok dengan daftar master.
3. Position hanya boleh dikelola oleh owner dari outlet terkait atau super admin.
4. Employee hanya memperoleh akses dari position yang aktif dan assignment position yang aktif.
5. Kombinasi `employee_id` dan `position_id` tidak boleh ganda.
6. Kombinasi `position_id` dan `permission_key` tidak boleh ganda.
7. Assignment lintas outlet mengikuti aturan yang sudah ada saat ini:
   - non-kurir tidak boleh lintas outlet,
   - kurir hanya boleh lintas outlet dalam owner yang sama.

## 8. Kebutuhan UI/UX

### Owner Position Form

1. Pada form create/edit position di flow owner per outlet, harus ada section `Permissions`.
2. Permission ditampilkan sebagai daftar checkbox atau grouped checklist.
3. Owner harus bisa dengan cepat melihat:
   - permission yang aktif,
   - total permission yang dipilih,
   - deskripsi/label permission yang mudah dipahami.
4. Form edit harus memuat preselected permission yang sudah tersimpan.

### Employee Form

1. Form employee harus tetap mendukung multi-select position.
2. Saat memilih banyak position, UI harus tetap jelas posisi mana yang sedang melekat pada employee.
3. Jika ada batasan lintas outlet, owner harus mendapat feedback validasi yang jelas.

## 9. Non-Functional Need

### NFR-01 Security

1. Validasi permission key harus strict.
2. Owner tidak boleh dapat mengelola position atau employee di outlet milik owner lain.
3. Employee tidak boleh dapat mengakses endpoint manajemen position owner.

### NFR-02 Data Integrity

1. Update position dan permission harus atomik.
2. Sinkronisasi permission tidak boleh menghasilkan data duplikat.
3. Sinkronisasi position employee tidak boleh meninggalkan relasi stale yang tidak sesuai dengan request akhir.

### NFR-03 Maintainability

1. Sumber kebenaran master permission harus tetap satu tempat.
2. Route guard dan validasi form harus memakai key yang sama dengan master.
3. Penambahan permission baru di masa depan harus cukup dilakukan dari definisi master dan mapping label.

## 10. Acceptance Criteria

1. Owner dapat membuka form create/edit position dari halaman outlet dan melihat daftar master permission.
2. Saat owner membuat position dengan beberapa permission, seluruh permission tersebut tersimpan pada relasi position.
3. Saat owner mengubah permission position, data permission lama yang tidak dipilih lagi ikut tersinkron.
4. Jika request mengirim permission key yang tidak valid, request ditolak.
5. Employee dapat memiliki lebih dari satu position dalam satu employee record.
6. Jika employee memiliki dua position aktif, maka permission hasil login/me adalah gabungan keduanya.
7. Jika employee tidak memiliki permission yang dibutuhkan route, sistem mengembalikan `403`.
8. Jika employee memiliki permission yang dibutuhkan pada outlet context yang benar, request diizinkan.

## 11. Titik Implementasi yang Perlu Dipertimbangkan Model Planner

1. Reuse backend permission model yang sudah ada, jangan mendesain ulang RBAC dari nol.
2. Fokus gap utama ada pada flow owner per outlet:
   - request validation outlet-side,
   - controller payload untuk form,
   - UI create/edit position di halaman outlet.
3. Pastikan flow global position dan flow outlet-specific position tidak divergen.
4. Pastikan test coverage mencakup:
   - validasi permission,
   - sync permission create/update,
   - multi-position employee,
   - middleware enforcement per outlet.

## 12. Referensi Codebase

1. Master permission: `app/Enums/Permission.php`
2. Position permission model: `app/Models/PositionPermission.php`
3. Position service: `app/Services/PositionService.php`
4. Employee multi-position logic: `app/Models/Employee.php`, `app/Services/EmployeeService.php`
5. Permission middleware: `app/Http/Middleware/CheckPositionPermission.php`
6. Login permission payload: `app/Http/Resources/Employee/LoginEmployeeResource.php`
7. API position request validation: `app/Http/Requests/Position/*`
8. Owner outlet position request validation: `app/Http/Requests/Outlet/Position/*`
9. Owner outlet position UI:
   - `resources/js/Pages/Dashboard/Outlets/Positions/Create.tsx`
   - `resources/js/Pages/Dashboard/Outlets/Positions/Edit.tsx`
10. Employee create UI with multi-position:
   - `resources/js/Pages/Dashboard/Employees/Create.tsx`
