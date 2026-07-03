# User Need: Owner Dapat Mengganti Password Karyawan

Tanggal: 2026-07-03

## 1. Latar Belakang

Stakeholder meminta agar owner dapat mengganti password karyawan (employee) miliknya sendiri, tanpa harus mengetahui atau meminta password lama karyawan tersebut.

Kondisi bisnis yang melatarbelakangi kebutuhan ini:

1. Karyawan (kasir/produksi) login menggunakan `username` dan `password` melalui aplikasi mobile, bukan email.
2. Karyawan tidak memiliki alamat email yang tersimpan di sistem, sehingga tidak ada mekanisme "lupa password" berbasis email seperti yang dimiliki owner.
3. Dalam praktiknya sering terjadi karyawan lupa password, resign lalu diganti karyawan baru dengan akun yang sama, atau owner mencurigai kredensial karyawan bocor/dipakai pihak lain, sehingga owner perlu cara cepat mengganti password tanpa bergantung pada karyawan yang bersangkutan.
4. Halaman edit karyawan pada dashboard owner saat ini secara eksplisit menyatakan bahwa password tidak bisa diubah dari halaman tersebut dan mengarahkan owner ke "menu pengaturan akun" untuk reset password, padahal menu tersebut belum ada. Owner saat ini tidak memiliki cara sama sekali untuk mengganti password karyawannya.

Dokumen ini disusun sebagai acuan kebutuhan sebelum dibuat implementation plan.

## 2. Ringkasan Kondisi Codebase Saat Ini

### Sudah Ada

1. Karyawan adalah entitas terpisah dari `User` (owner/super_admin), yaitu model `Employee` dengan tabel `employees`, memakai guard autentikasi sendiri (`sanctum` dengan provider `employees`) untuk login di aplikasi mobile.
2. Kolom `password` pada `employees` sudah ada, di-hash dengan `Hash::make()` dan memakai cast `hashed`.
3. Owner sudah dapat membuat karyawan baru beserta password awal melalui `EmployeeService::store()`, dengan aturan password: wajib, minimal 8 karakter, kombinasi huruf besar dan huruf kecil (`StoreEmployeeRequest`).
4. Owner sudah dapat mengedit data karyawan (nama, telepon, alamat, gender, tanggal mulai, cutoff days, status aktif, avatar, posisi, gaji, komisi) melalui `EmployeeService::update()`, tetapi field password sama sekali tidak disentuh oleh proses update ini.
5. Karyawan sudah dapat mengganti password miliknya sendiri, tetapi hanya melalui API mobile (`EmployeeAuthController::changePassword()`), dengan mewajibkan `current_password` yang cocok, password baru minimal 8 karakter dan konfirmasi. Tidak ada jalur web untuk ini karena karyawan tidak login ke dashboard web.
6. Owner sudah dapat mengganti password miliknya sendiri melalui halaman profile (`ProfileController::updatePassword` → `ProfileService::changePassword()`), yang mewajibkan `current_password` sesuai password owner yang login, password baru mengikuti `Password::defaults()` bawaan Laravel (minimal 8 karakter), dan konfirmasi.
7. Halaman edit karyawan (`resources/js/Pages/Dashboard/Employees/Edit.tsx`) sudah menampilkan pesan kepada owner: "Untuk keamanan, password tidak dapat diubah melalui halaman ini. Silakan reset password melalui menu pengaturan akun." Namun menu yang dimaksud tidak pernah dibuat.
8. Halaman detail karyawan (`Show.tsx`) sudah memiliki header aksi (`EmployeePageHeader.tsx`) dengan tombol `Edit Karyawan` dan `Hapus`, serta pola modal konfirmasi untuk aksi sensitif (`DeleteEmployeeModal.tsx`) yang menampilkan avatar, nama, dan badge karyawan sebelum aksi dieksekusi.
9. Terdapat fungsi `canUserModifyEmployee()` di `EmployeeService` yang memvalidasi bahwa hanya `super_admin` atau `owner` pemilik outlet karyawan tersebut yang boleh memodifikasi karyawan, namun fungsi ini saat ini hanya dipakai pada `forceDestroy()` dan `restore()`, dan nilai boolean hasilnya tidak pernah diperiksa/dilempar sebagai error (dead code secara efektif).
10. Sistem sudah memiliki infrastruktur notifikasi database (`Notifiable` trait pada `Employee` dan `User`, tabel `notifications`) yang dipakai untuk event lain seperti withdrawal dan deposit, dan bisa dipertimbangkan untuk memberi tahu karyawan bahwa passwordnya baru saja diganti oleh owner.

### Gap yang Relevan

1. Tidak ada endpoint, service method, atau UI apa pun yang memungkinkan owner mengganti password karyawannya.
2. Tidak ada kebutuhan `current_password` karyawan yang bisa dipenuhi owner (owner tidak tahu dan tidak boleh tahu password lama karyawan), sehingga alur ini secara desain berbeda dari alur "ganti password milik sendiri" yang sudah ada.
3. Tidak ada `EmployeePolicy` atau pengecekan otorisasi yang konsisten diterapkan pada operasi terhadap data karyawan; pengecekan kepemilikan outlet (`canUserModifyEmployee`) ada tetapi tidak dipakai secara konsisten dan hasilnya tidak divalidasi.
4. Aturan kompleksitas password tidak konsisten antar alur yang sudah ada: pembuatan karyawan mewajibkan kombinasi huruf besar/kecil, ganti password karyawan sendiri (mobile) hanya mewajibkan minimal 8 karakter tanpa aturan kombinasi, ganti password owner memakai `Password::defaults()` bawaan Laravel. Belum ada keputusan aturan mana yang berlaku untuk fitur baru ini.
5. Tidak ada flag "wajib ganti password saat login berikutnya" pada tabel `employees`, sehingga jika owner mengganti password karyawan, karyawan akan langsung memakai password baru tanpa ada mekanisme paksa ganti ulang.
6. Tidak ada tabel/riwayat audit yang mencatat siapa mengganti password siapa dan kapan; satu-satunya jejak yang ada di codebase adalah `Log::info()`/`Log::error()` pada file log aplikasi, itu pun tidak diterapkan secara konsisten pada semua operasi employee.
7. Tidak ada mekanisme pemberitahuan ke karyawan bahwa passwordnya baru saja diganti oleh owner (baik melalui notifikasi database maupun WhatsApp), meskipun infrastrukturnya tersedia untuk dipakai.
8. Copy UI pada halaman edit karyawan saat ini menjanjikan kemampuan ("reset password melalui menu pengaturan akun") yang tidak pernah dibangun — ini adalah gap konkret yang langsung dirasakan owner hari ini.
9. Belum ada pola modal/halaman "ganti password milik entitas lain" di codebase ini; yang tersedia hanya pola modal konfirmasi aksi sensitif (`DeleteEmployeeModal.tsx`) dan pola halaman ganti password milik sendiri (`ChangePassword.tsx` milik owner) yang keduanya perlu diadaptasi, bukan dipakai langsung.

## 3. Tujuan Fitur

Tujuan utama fitur ini adalah:

1. Owner dapat mengganti password karyawan miliknya sendiri tanpa perlu mengetahui password lama karyawan tersebut.
2. Karyawan yang passwordnya diganti oleh owner tetap dapat login ke aplikasi mobile menggunakan password baru tersebut.
3. Owner hanya dapat mengganti password karyawan yang berada di outlet miliknya sendiri, tidak karyawan milik owner lain.
4. Aksi ganti password oleh owner harus jelas, aman, dan tidak membuka celah keamanan baru (misalnya tidak menampilkan password dalam bentuk plain text, tidak bisa ditebak/di-brute-force dengan mudah).
5. Menutup gap antara janji yang sudah ditampilkan di UI (`Edit.tsx`) dengan kemampuan sistem yang sebenarnya.

## 4. Aktor

1. `owner`
   Memicu penggantian password untuk karyawan yang berada di outlet miliknya, tanpa memasukkan password lama karyawan.
2. `employee/kasir`
   Pihak yang passwordnya diganti. Setelah penggantian, karyawan login dengan password baru. Karyawan berpotensi perlu diberi tahu (di aplikasi, saat login berikutnya, atau melalui channel lain) bahwa passwordnya telah diganti oleh owner.
3. `super_admin`
   Berpotensi memiliki kemampuan yang sama seperti owner untuk seluruh karyawan lintas outlet, mengikuti pola otorisasi yang sudah dipakai di fitur employee lain (`canUserModifyEmployee`), tetapi cakupan pastinya perlu diputuskan pada plan.
4. `system`
   Memvalidasi kepemilikan outlet, memvalidasi aturan password, menyimpan password baru dengan aman, dan (jika diputuskan) mencatat riwayat/notifikasi penggantian password.

## 5. Scope Kebutuhan

Scope utama:

1. Kemampuan owner memicu penggantian password untuk karyawan tertentu, dari dashboard web.
2. Validasi bahwa owner hanya bisa mengganti password karyawan pada outlet miliknya sendiri.
3. Aturan validasi password baru (panjang minimal, kompleksitas, konfirmasi).
4. Perubahan pada UI halaman karyawan (`Edit.tsx` dan/atau `Show.tsx`/`EmployeePageHeader.tsx`) agar owner punya jalan nyata untuk melakukan aksi ini, menggantikan pesan yang saat ini mengarah ke menu yang tidak ada.
5. Perilaku sistem terhadap sesi karyawan yang sedang aktif setelah password diganti (misalnya apakah token/sesi lama karyawan tetap berlaku atau perlu dicabut).

Di luar scope:

1. Membuat mekanisme lupa password berbasis email/OTP untuk karyawan.
2. Mengubah alur ganti password milik sendiri, baik untuk owner (`ProfileService::changePassword`) maupun untuk karyawan (`EmployeeAuthController::changePassword`).
3. Membangun sistem audit log/activity log generik untuk seluruh aplikasi.
4. Mengubah pengaturan PIN karyawan (`pin_hash`) — ini adalah kredensial terpisah dari password dan tidak termasuk permintaan stakeholder saat ini.
5. Mengubah sistem permission catalog (`position_permissions`) yang mengatur apa yang boleh dilakukan karyawan di dalam aplikasi.

## 6. Prinsip Dasar Kebutuhan

1. Owner tidak pernah perlu mengetahui atau memasukkan password lama karyawan untuk mengganti password karyawan tersebut — ini secara fundamental berbeda dari alur "ganti password milik sendiri" yang selalu mewajibkan `current_password`.
2. Batas kepemilikan (ownership boundary) harus ditegakkan secara eksplisit di backend: owner hanya boleh mengganti password karyawan yang `outlet.owner_id` miliknya, bukan hanya mengandalkan filtering di frontend.
3. Password baru tidak boleh pernah terekspos dalam bentuk plain text di log aplikasi, response API, maupun riwayat/notifikasi apa pun.
4. Aksi ini adalah aksi sensitif dan berdampak langsung pada akses karyawan ke sistem, sehingga sebaiknya memakai pola konfirmasi yang tegas, sejalan dengan pola konfirmasi aksi sensitif lain yang sudah ada (mis. hapus karyawan).
5. Fitur ini tidak boleh mengubah data lain milik karyawan (nama, posisi, gaji, dsb) — scope-nya murni penggantian kredensial password.

## 7. User Need Fungsional

### FR-01 Owner Dapat Memicu Penggantian Password Karyawan

1. Dari halaman terkait karyawan (edit karyawan dan/atau detail karyawan), owner dapat memicu aksi "Ganti Password Karyawan".
2. Owner memasukkan password baru dan konfirmasi password baru untuk karyawan tersebut.
3. Owner tidak diminta memasukkan password lama karyawan.
4. Sistem menampilkan identitas karyawan yang akan terdampak (nama, outlet) sebelum aksi dikonfirmasi, untuk menghindari owner salah target ketika membuka banyak tab/halaman karyawan.

### FR-02 Sistem Memvalidasi Password Baru

1. Password baru wajib diisi dan wajib dikonfirmasi (harus sama dengan konfirmasi).
2. Password baru mengikuti aturan minimal panjang dan kompleksitas yang perlu diputuskan pada plan, dengan mempertimbangkan konsistensi terhadap aturan yang sudah ada di `StoreEmployeeRequest` (kombinasi huruf besar/kecil, minimal 8 karakter).
3. Sistem menolak permintaan jika password baru tidak memenuhi aturan, dengan pesan error yang jelas dalam Bahasa Indonesia mengikuti gaya pesan error yang sudah ada di request lain pada modul employee.

### FR-03 Sistem Membatasi Aksi Hanya untuk Karyawan Milik Outlet Owner

1. Sistem harus memvalidasi bahwa karyawan yang passwordnya akan diganti berada pada outlet yang dimiliki oleh owner yang sedang login.
2. Jika owner mencoba mengganti password karyawan yang bukan miliknya (misalnya melalui manipulasi request), sistem harus menolak dengan respons otorisasi yang jelas, bukan diam-diam gagal atau mengizinkan.
3. `super_admin` perlu diputuskan pada plan apakah memiliki akses penuh lintas outlet untuk aksi ini, mengikuti pola otorisasi yang sudah dipakai pada operasi employee lain.

### FR-04 Password Baru Tersimpan dengan Aman

1. Password baru harus disimpan dalam bentuk hash, konsisten dengan mekanisme hashing yang sudah dipakai pada kolom `password` di tabel `employees`.
2. Password baru tidak boleh dikirim balik ke frontend dalam response apa pun setelah tersimpan.
3. Password baru tidak boleh dicatat dalam bentuk plain text di file log aplikasi.

### FR-05 Karyawan Dapat Login dengan Password Baru

1. Setelah owner mengganti password, karyawan harus dapat login ke aplikasi mobile menggunakan password baru tersebut.
2. Password lama karyawan tidak lagi berlaku setelah penggantian.
3. Perlu diputuskan pada plan apakah sesi/token aktif karyawan yang sedang login (Sanctum token) tetap berlaku setelah password diganti, atau perlu dicabut agar karyawan wajib login ulang dengan password baru — ini relevan terutama untuk skenario "kredensial dicurigai bocor".

### FR-06 Owner Mendapatkan Konfirmasi Hasil Aksi

1. Setelah aksi berhasil, owner melihat pesan konfirmasi bahwa password karyawan telah berhasil diganti.
2. Jika aksi gagal (misalnya validasi password tidak terpenuhi, atau karyawan tidak ditemukan/bukan milik outlet owner), owner melihat pesan error yang jelas dan aksi tidak menimbulkan perubahan data.

### FR-07 UI Halaman Karyawan Diperbarui agar Konsisten dengan Kemampuan Baru

1. Pesan pada `Edit.tsx` yang saat ini mengarahkan owner ke "menu pengaturan akun" yang tidak ada harus diperbarui agar konsisten dengan cara baru owner mengganti password karyawan (baik itu tombol/aksi di halaman yang sama, atau di halaman detail karyawan).
2. Tombol/aksi untuk mengganti password sebaiknya ditempatkan mengikuti pola aksi sensitif yang sudah ada di halaman detail karyawan (`EmployeePageHeader.tsx`), berdampingan dengan aksi `Edit Karyawan` dan `Hapus`.
3. Aksi ganti password tidak boleh tercampur dengan form edit data karyawan yang lain, untuk menjaga agar perubahan password adalah aksi yang disengaja dan eksplisit, bukan bagian dari submit form update biasa.

### FR-08 Pemberitahuan kepada Karyawan (Opsional, Perlu Diputuskan pada Plan)

1. Sistem dapat mengirim notifikasi kepada karyawan (melalui notifikasi database yang sudah ada infrastrukturnya, atau WhatsApp jika dianggap perlu) bahwa passwordnya baru saja diganti oleh owner.
2. Notifikasi tidak boleh memuat password baru dalam bentuk apa pun.
3. Kebutuhan ini bersifat opsional untuk tahap pertama dan perlu diputuskan prioritasnya pada plan.

## 8. Aturan Bisnis

1. Owner hanya dapat mengganti password karyawan yang berada pada outlet miliknya sendiri.
2. Penggantian password oleh owner tidak memerlukan password lama karyawan.
3. Password baru wajib memenuhi aturan validasi yang berlaku (panjang dan kompleksitas ditentukan pada plan).
4. Password tidak boleh pernah ditampilkan dalam bentuk plain text di response, log, maupun notifikasi.
5. Penggantian password tidak mengubah data lain milik karyawan (posisi, gaji, status aktif, dsb).
6. Karyawan yang tidak aktif (`is_active = false`) atau sudah dihapus (soft deleted) sebaiknya tidak dapat menjadi target penggantian password, kecuali plan memutuskan lain dengan alasan operasional yang jelas.

## 9. Acceptance Criteria

1. Owner dapat membuka aksi "Ganti Password Karyawan" dari halaman terkait karyawan tanpa perlu mengetahui password lama karyawan.
2. Owner dapat mengganti password karyawan yang berada di outlet miliknya, dan karyawan tersebut dapat login dengan password baru setelahnya.
3. Owner tidak dapat mengganti password karyawan yang bukan milik outletnya, baik melalui UI maupun manipulasi request langsung ke endpoint.
4. Sistem menolak password baru yang tidak memenuhi aturan validasi, disertai pesan error yang jelas.
5. Password baru tidak pernah muncul dalam bentuk plain text di response API maupun log aplikasi.
6. Halaman edit karyawan tidak lagi mengarahkan owner ke menu yang tidak ada; pesan dan aksi yang ditampilkan konsisten dengan kemampuan sistem yang sebenarnya.
7. Aksi ganti password karyawan berjalan independen dari form update data karyawan lainnya.

## 10. Catatan untuk Implementation Plan

Hal yang perlu diputuskan pada plan:

1. Endpoint/route baru yang dipakai, misalnya `PUT/POST /dashboard/employees/{employee}/password`, beserta method service baru di `EmployeeService` (terpisah dari `update()`).
2. Aturan validasi password baru untuk fitur ini: apakah mengikuti aturan `StoreEmployeeRequest` (kombinasi huruf besar/kecil + minimal 8 karakter), atau dibuat lebih ketat, dan bagaimana menyelaraskannya dengan aturan yang sudah dipakai di alur ganti password lain agar tidak semakin menambah inkonsistensi.
3. Apakah `super_admin` mendapat kemampuan yang sama untuk seluruh karyawan lintas outlet, mengikuti pola `canUserModifyEmployee()`.
4. Bagaimana `canUserModifyEmployee()` (atau pengganti/perluasannya, misalnya `EmployeePolicy`) diterapkan secara eksplisit dan hasilnya benar-benar diperiksa (throw/abort) pada endpoint baru ini, mengingat saat ini fungsi tersebut ada tetapi tidak konsisten dipakai dan hasilnya tidak pernah divalidasi di pemanggil lain.
5. Apakah token Sanctum aktif milik karyawan perlu dicabut/di-invalidate saat password diganti oleh owner, terutama untuk skenario kredensial dicurigai bocor.
6. Apakah perlu ditambahkan flag baru pada tabel `employees` (misalnya `must_change_password`) agar karyawan dipaksa mengganti password saat login berikutnya, mengingat field ini belum ada sama sekali di skema saat ini.
7. Apakah perubahan ini perlu dicatat di suatu bentuk riwayat/audit yang lebih tahan lama dari `Log::info()` biasa, atau cukup mengikuti pola logging yang sudah dipakai di `EmployeeService` saat ini.
8. Apakah karyawan perlu diberi notifikasi (database notification dan/atau WhatsApp) bahwa passwordnya diganti oleh owner, dan bagaimana isi pesannya agar tidak membocorkan password baru.
9. Di halaman mana aksi ini paling tepat ditempatkan: hanya di `Show.tsx`/`EmployeePageHeader.tsx`, hanya di `Edit.tsx`, atau di keduanya dengan komponen modal yang sama.
10. Apakah karyawan yang tidak aktif atau soft-deleted boleh menjadi target aksi ini, dan bagaimana penanganannya di UI (misalnya tombol dinonaktifkan dengan alasan).

## 11. Pertanyaan Terbuka

1. Apakah aksi ini perlu konfirmasi tambahan dari owner (misalnya re-enter password owner sendiri, atau OTP) sebelum bisa mengganti password karyawan, mengingat ini adalah aksi sensitif terhadap akun pihak lain?
2. Apakah sistem perlu menampilkan password baru sekali saja kepada owner setelah berhasil dibuat (misalnya jika password digenerate otomatis oleh sistem), atau owner selalu yang menentukan password barunya secara manual?
3. Apakah fitur ini juga perlu mencakup kemampuan "generate password acak" oleh sistem, bukan hanya input manual oleh owner?
4. Apakah karyawan perlu mendapat pemberitahuan real-time (push notification di aplikasi mobile) saat sedang login lalu passwordnya diganti oleh owner, agar tidak bingung ketika tiba-tiba logout paksa (jika token dicabut)?
5. Apakah kebutuhan ini juga berlaku untuk `super_admin` mengganti password owner, atau murni terbatas pada owner-ke-karyawan sesuai permintaan stakeholder saat ini?

## 12. Rekomendasi Awal

Untuk implementasi tahap pertama, kebutuhan paling sederhana dan aman adalah:

1. Tambahkan endpoint baru khusus (bukan menumpang di endpoint update karyawan) untuk mengganti password karyawan, menerima `password` dan `password_confirmation` saja.
2. Terapkan validasi kepemilikan outlet secara eksplisit di service/controller baru ini (perbaiki pola `canUserModifyEmployee()` agar benar-benar memblokir, bukan sekadar mengembalikan boolean yang diabaikan).
3. Gunakan aturan password yang sama dengan pembuatan karyawan baru (`StoreEmployeeRequest`) agar konsisten dan tidak menambah variasi aturan baru.
4. Tambahkan tombol "Ganti Password" di `EmployeePageHeader.tsx` yang membuka modal konfirmasi (mengikuti pola `DeleteEmployeeModal.tsx`) berisi form password baru + konfirmasi.
5. Perbarui pesan pada `Edit.tsx` agar mengarahkan owner ke aksi yang benar-benar ada, bukan ke "menu pengaturan akun" yang tidak pernah dibuat.
6. Tunda dulu fitur pencabutan token otomatis, flag wajib ganti password saat login berikutnya, dan notifikasi ke karyawan sebagai pengembangan lanjutan, kecuali stakeholder secara eksplisit menyatakan hal tersebut sebagai kebutuhan wajib di tahap pertama.

