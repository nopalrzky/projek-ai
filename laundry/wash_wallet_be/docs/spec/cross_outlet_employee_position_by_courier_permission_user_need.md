# User Need: Assignment Position Employee Antar Outlet Berdasarkan Permission Kurir

Tanggal: 2026-05-28

## 1. Latar Belakang

Sistem saat ini sudah memiliki fondasi yang cukup matang untuk:

1. Position per outlet.
2. Permission yang melekat pada position.
3. Employee yang dapat memiliki lebih dari satu position.
4. Aturan assignment lintas outlet dalam owner yang sama.
5. Default position outlet seperti `kasir`, `produksi`, dan `kurir`.

Namun aturan lintas outlet yang berjalan saat ini masih bergantung pada `slug` position, khususnya `kurir`.

Kebutuhan bisnis yang ingin dipastikan sekarang adalah:

1. Assignment position employee ke outlet lain tidak lagi ditentukan oleh nama atau slug position.
2. Assignment lintas outlet harus ditentukan oleh capability aktual dari position tersebut, yaitu apakah position itu memiliki permission kurir.
3. Dengan demikian, hanya position yang memang punya akses kurir yang boleh diberikan ke employee antar outlet dalam owner yang sama.

Dokumen ini disusun sebagai pedoman kebutuhan bisnis sebelum dibuat implementation plan.

## 2. Ringkasan Temuan dari Codebase Saat Ini

### Sudah Ada

1. Position sudah mendukung permission per jabatan melalui relasi `position_permissions`.
2. Employee sudah mendukung multi-position melalui `employee_positions`.
3. Effective permission employee sudah dihitung dari union seluruh position aktif pada outlet yang relevan.
4. Default position outlet sudah mengarah pada pola tetap:
   - `Kasir`
   - `Produksi`
   - `Kurir`
5. Sistem sudah mengenal permission domain kurir pada master permission:
   - `courier.view`
   - `courier.manage`

### Gap yang Relevan

1. Validasi assignment position lintas outlet masih berbasis `slug = kurir`, belum berbasis permission kurir yang benar-benar melekat pada position.
2. Posisi dari outlet lain saat ini bisa lolos atau ditolak berdasarkan identitas slug, bukan berdasarkan kemampuan akses kurir yang sesungguhnya.
3. Rule bisnis lama menjadi terlalu kaku:
   - jika suatu hari ada position baru non-`kurir` tetapi punya permission kurir, secara bisnis position itu seharusnya dapat lintas outlet,
   - sebaliknya, jika ada position bernama/slug `kurir` tetapi permission kurirnya dihapus, secara bisnis position itu seharusnya tidak otomatis tetap boleh lintas outlet.

## 3. Tujuan Fitur

Perubahan yang diinginkan memiliki tujuan utama berikut:

1. Menjadikan permission sebagai dasar otorisasi assignment lintas outlet, bukan slug position.
2. Menjamin hanya position yang benar-benar memiliki capability kurir yang bisa diberikan ke employee antar outlet.
3. Menjaga konsistensi dengan sistem RBAC yang sudah dibangun sebelumnya, di mana akses ditentukan oleh permission, bukan oleh nama jabatan semata.

## 4. Aktor

1. `super_admin`
   Dapat mengaudit dan mengelola data lintas tenant sesuai kewenangannya.
2. `owner`
   Mengelola employee dan assignment position pada outlet-outlet miliknya.
3. `employee`
   Menerima position dan memperoleh akses sesuai permission dari position aktif.
4. `system`
   Memvalidasi assignment position, menolak assignment yang tidak valid, dan menjaga konsistensi lintas outlet.

## 5. Scope Kebutuhan

Scope utama:

1. Rule assignment position employee antar outlet.
2. Hubungan antara position permission dan eligibility lintas outlet.
3. Validasi create/update/sync employee position.
4. Konsistensi dengan multi-position employee dan effective permission.

Di luar scope:

1. Mendesain ulang seluruh RBAC dari nol.
2. Menambah permission kurir baru di luar katalog yang sudah ada.
3. Mengubah flow produksi dan commission, kecuali yang terdampak secara tidak langsung oleh aturan position lintas outlet.

## 6. Prinsip Dasar Kebutuhan

Prinsip utama perubahan ini adalah:

1. Position lintas outlet boleh diberikan hanya jika position tersebut memiliki permission kurir.
2. Position tanpa permission kurir harus tetap dibatasi ke outlet utama employee.
3. Rule lintas outlet tetap hanya berlaku dalam outlet-outlet milik owner yang sama.
4. Penentuan eligibility lintas outlet harus berbasis permission aktual pada position, bukan berbasis slug, nama, atau label jabatan.

## 7. User Need Fungsional

### FR-01 Permission Tetap Menjadi Sumber Kebenaran Akses Position

1. Position tetap menjadi wadah utama permission.
2. Sistem harus menilai capability sebuah position dari permission yang menempel pada position tersebut.
3. Nama atau slug position tidak boleh menjadi satu-satunya dasar penentuan eligibility lintas outlet.

### FR-02 Employee Dapat Memiliki Banyak Position

1. Owner tetap dapat memberikan lebih dari satu position kepada satu employee.
2. Employee dapat memiliki kombinasi position dalam outlet utama dan outlet lain sesuai aturan bisnis yang berlaku.
3. Kombinasi position tetap harus dihitung sebagai union permission dari seluruh assignment aktif yang valid.

### FR-03 Position Non-Kurir Tidak Boleh Diberikan Antar Outlet

1. Jika sebuah position tidak memiliki permission kurir, position tersebut hanya boleh diberikan pada employee di outlet utamanya sendiri.
2. Position dari outlet lain yang tidak memiliki permission kurir harus ditolak saat:
   - create employee,
   - update employee,
   - sync positions,
   - create single employee-position,
   - update single employee-position.
3. Error validasi atau exception yang dikembalikan harus jelas menjelaskan bahwa lintas outlet hanya diperbolehkan untuk position dengan permission kurir.

### FR-04 Position dengan Permission Kurir Boleh Diberikan Antar Outlet

1. Jika sebuah position memiliki permission kurir, position tersebut boleh diberikan ke employee dari outlet lain.
2. Rule ini hanya boleh berlaku jika outlet asal position dan outlet utama employee masih berada di bawah owner yang sama.
3. Position yang punya permission kurir boleh tetap dianggap lintas outlet walaupun slug atau nama position bukan `kurir`.

### FR-05 Position Bernama Kurir Tidak Otomatis Boleh Lintas Outlet Jika Tidak Punya Permission Kurir

1. Jika suatu position memiliki slug atau nama `kurir`, tetapi permission kurirnya sudah tidak ada, position tersebut tidak boleh otomatis lolos assignment lintas outlet.
2. Capability lintas outlet harus mengikuti permission aktual yang tersimpan pada position saat itu.

### FR-06 Definisi Permission Kurir untuk Eligibility Lintas Outlet Harus Jelas

1. Sistem harus memiliki definisi eksplisit tentang apa yang dimaksud “position memiliki permission kurir”.
2. Definisi minimum yang disarankan:
   - position memiliki setidaknya satu permission dalam domain kurir, misalnya `courier.view` atau `courier.manage`.
3. Jika bisnis menginginkan lebih strict, rule boleh dipertegas di tahap plan, misalnya:
   - wajib punya `courier.view`, atau
   - wajib punya salah satu dari `courier.view` / `courier.manage`.
4. Keputusan final harus tunggal dan dipakai konsisten di semua jalur validasi.

### FR-07 Rule Owner Sama Tetap Berlaku

1. Walaupun position memiliki permission kurir, assignment lintas outlet tetap hanya boleh dilakukan antar outlet yang dimiliki owner yang sama.
2. Position dari outlet milik owner lain harus tetap ditolak.

### FR-08 Assignment Duplikat Tetap Tidak Boleh

1. Sistem tetap harus mencegah duplikasi assignment untuk kombinasi `employee_id` dan `position_id`.
2. Rule baru permission-based tidak boleh membuka celah duplikasi pivot assignment.

### FR-09 Effective Permission Employee Tetap Mengikuti Position Aktif

1. Position lintas outlet yang valid harus tetap berkontribusi ke effective permission employee pada outlet yang relevan.
2. Jika assignment position dinonaktifkan, permission dari assignment tersebut tidak lagi dihitung.
3. Jika position itu sendiri dinonaktifkan, permission dari position tersebut juga tidak lagi dihitung.

### FR-10 Rule Produksi Tetap Konsisten dengan Position yang Aktif

1. Aturan eligibility produksi yang sudah dibahas sebelumnya tetap berlaku terpisah dari aturan lintas outlet ini.
2. Position yang boleh lintas outlet karena punya permission kurir tidak otomatis boleh dipakai untuk eligibility produksi.
3. Eligibility produksi tetap harus mengikuti position/permission/aturan produksi yang relevan, bukan ikut terpengaruh hanya karena position itu lintas outlet.

### FR-11 Default Position Tetap Konsisten dengan Aturan Baru

1. Saat outlet baru dibuat, default position seperti `Kasir`, `Produksi`, dan `Kurir` tetap harus terbentuk.
2. Position default `Kurir` secara normal memang diharapkan memiliki permission kurir, sehingga valid untuk skenario lintas outlet.
3. Position default `Kasir` dan `Produksi` secara normal tidak boleh lintas outlet kecuali di masa depan owner benar-benar menempelkan permission kurir pada position tersebut dan bisnis memang mengizinkan itu.

### FR-12 Validasi Harus Berlaku di Semua Entry Point Assignment Position

1. Rule baru harus diterapkan konsisten di seluruh flow yang dapat mengubah assignment position employee.
2. Minimal mencakup:
   - create employee,
   - update employee,
   - sync positions pada employee,
   - create employee-position tunggal,
   - update employee-position tunggal.
3. Tidak boleh ada satu flow yang masih memakai rule lama berbasis slug, sementara flow lain sudah memakai rule baru berbasis permission.

## 8. Business Rules

1. Permission adalah dasar capability position.
2. Slug position boleh dipakai sebagai identitas UI/default setup, tetapi bukan sebagai source of truth eligibility lintas outlet.
3. Position lintas outlet hanya boleh jika position tersebut memiliki permission kurir sesuai definisi bisnis yang dipilih.
4. Position tanpa permission kurir hanya boleh diberikan pada outlet utama employee.
5. Assignment lintas outlet tetap hanya boleh dalam outlet dengan owner yang sama.
6. Assignment position yang tidak valid harus ditolak sebelum data pivot `employee_positions` tersimpan.
7. Effective permission employee tetap dihitung dari union seluruh assignment position aktif yang valid.
8. Rule ini harus tetap kompatibel dengan default position, owner flow permission per position, dan multi-position employee yang sudah dibahas sebelumnya.

## 9. Kebutuhan UI/UX

### Employee Form

1. Form employee tetap boleh menampilkan multi-select position.
2. Saat owner memilih position dari outlet lain, sistem harus memberi validasi yang mudah dipahami jika position tersebut tidak memiliki permission kurir.
3. Jika position lintas outlet valid karena punya permission kurir, owner tidak perlu mendapat pesan error yang membingungkan hanya karena slug position bukan `kurir`.

### Position Management Context

1. Owner tetap harus bisa mengubah permission pada position.
2. Owner harus memahami bahwa perubahan permission kurir pada position akan memengaruhi eligibility lintas outlet position tersebut.
3. Jika diperlukan di tahap implementasi, sistem boleh menambahkan bantuan teks atau validasi yang menjelaskan dampak perubahan permission kurir terhadap assignment lintas outlet.

## 10. Non-Functional Need

### NFR-01 Konsistensi Domain

1. Rule lintas outlet harus memakai source of truth yang sama dengan RBAC utama, yaitu permission pada position.
2. Tidak boleh ada dua rule yang saling bertentangan antara:
   - validasi employee assignment,
   - effective permission calculation,
   - owner flow position permission.

### NFR-02 Maintainability

1. Rule eligibility lintas outlet sebaiknya berada di helper/service yang reusable.
2. Penambahan position baru di masa depan tidak boleh memaksa developer menambah pengecualian berbasis slug satu per satu.
3. Sistem harus mudah mendukung skenario position baru yang punya capability kurir walaupun namanya bukan `kurir`.

### NFR-03 Security dan Tenant Isolation

1. Owner tidak boleh menugaskan position dari outlet milik owner lain.
2. Employee tidak boleh memperoleh akses lintas outlet dari position yang tidak valid.
3. Perubahan rule lintas outlet tidak boleh melemahkan tenant isolation yang sudah ada.

## 11. Acceptance Criteria

1. Jika employee outlet A diberi position dari outlet B yang tidak memiliki permission kurir, request ditolak.
2. Jika employee outlet A diberi position dari outlet B yang memiliki permission kurir, request diizinkan selama outlet A dan B milik owner yang sama.
3. Jika position memiliki slug `kurir` tetapi permission kurirnya tidak ada, position tersebut tidak otomatis boleh lintas outlet.
4. Jika position tidak ber-slug `kurir` tetapi memiliki permission kurir, position tersebut dapat dianggap valid untuk assignment lintas outlet selama rule owner sama terpenuhi.
5. Rule validasi yang sama berlaku pada create employee, update employee, sync positions, create employee-position, dan update employee-position.
6. Effective permission employee tetap merupakan union dari seluruh position aktif yang valid.
7. Position lintas outlet yang valid tetap berkontribusi pada akses employee di outlet yang relevan.

## 12. Titik Implementasi yang Perlu Dipertimbangkan Model Planner

1. Audit seluruh validasi assignment position yang saat ini masih berbasis slug `kurir`.
2. Tentukan helper tunggal untuk menjawab pertanyaan:
   - apakah position ini eligible lintas outlet? 
   - apakah employee boleh menerima position ini?
3. Putuskan definisi final “memiliki permission kurir”:
   - apakah cukup salah satu permission domain kurir,
   - atau harus permission tertentu.
4. Pastikan perubahan rule tidak mematahkan flow lama:
   - default position outlet,
   - owner flow edit permission position,
   - login payload dan effective permission,
   - eligibility produksi yang sudah dibahas sebelumnya.
5. Pastikan test coverage mencakup:
   - cross-outlet allowed karena permission kurir,
   - cross-outlet denied karena tidak ada permission kurir,
   - same-owner allowed,
   - different-owner denied,
   - slug `kurir` tanpa permission kurir ditolak,
   - non-`kurir` dengan permission kurir diizinkan.

## 13. Referensi Codebase

1. Master permission: `app/Enums/Permission.php`
2. Employee model: `app/Models/Employee.php`
3. Employee service: `app/Services/EmployeeService.php`
4. Position service: `app/Services/PositionService.php`
5. Permission owner flow user need: `docs/spec/employee_permission_owner_flow_user_need.md`
6. Default position dan produksi user need: `docs/spec/default_position_process_commission_realistic_seeder_user_need.md`
