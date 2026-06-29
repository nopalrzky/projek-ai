# User Need: Trial Outlet Gratis 14 Hari

Tanggal: 2026-06-17

## 1. Latar Belakang

Owner membutuhkan cara untuk mencoba WashWallet pada outlet nyata sebelum melakukan aktivasi berbayar dengan coin. Saat ini outlet memiliki mekanisme fitur berbayar dan status akses fitur, tetapi flow trial outlet gratis 14 hari perlu dipastikan jelas secara bisnis, konsisten secara data, dan tidak membuka fitur lain di luar aktivasi dasar outlet.

Masalah yang ingin diatasi:

1. Owner perlu mengevaluasi operasional outlet tanpa langsung membayar coin.
2. Trial harus dimulai secara sadar oleh owner, bukan otomatis saat outlet dibuat.
3. Trial hanya boleh dipakai satu kali per outlet agar tidak menjadi bypass aktivasi berbayar.
4. Trial harus memberi akses operasional dasar outlet, tetapi tidak otomatis membuka fitur paid lain.
5. Trial tidak boleh otomatis membuat outlet tampil publik di customer app.
6. Setelah masa trial habis, owner harus diarahkan ke aktivasi berbayar tanpa kehilangan data outlet.

Dokumen ini disusun sebagai acuan kebutuhan sebelum dibuat implementation plan fitur trial outlet.

## 2. Ringkasan Kondisi Codebase Saat Ini

### Sudah Ada

1. Tabel `outlet_features` sudah mendukung status:
   - `trial`
   - `active`
   - `expired`
   - `inactive`
2. Tabel `outlet_features` sudah memiliki field waktu trial dan aktivasi:
   - `trial_started_at`
   - `trial_expires_at`
   - `unlocked_at`
   - `expires_at`
3. `OutletFeature` sudah memiliki helper `hasActiveAccess()` yang menganggap trial masih berlaku sebagai akses aktif.
4. `OutletFeature` sudah memiliki helper `getTrialRemainingDays()`.
5. `Outlet::hasFeature()` sudah mengecek akses fitur melalui `OutletFeature::hasActiveAccess()`.
6. Middleware `CheckFeatureAccess` sudah memakai `Outlet::hasFeature()` untuk memblokir akses fitur outlet yang tidak aktif.
7. `OutletFeatureService` sudah memiliki method:
   - `startTrial(int $outletId)`
   - `getTrialEligibility(int $outletId)`
8. `OutletFeatureService::startTrial()` sudah membuat atau memperbarui row `outlet_features` untuk fitur `outlet_activation` dengan status `trial`.
9. `OutletFeatureService::startTrial()` tidak membuat `coin_transactions`.
10. Command `features:check-expiry` sudah mengubah trial yang melewati `trial_expires_at` menjadi `expired`.
11. `OutletActivationOverlay` sudah memiliki CTA `Coba Gratis 14 Hari`.
12. Route aktif untuk trial adalah `outlets.features.trial`, yaitu `POST /{outletId}/features/{featureId}/trial`.
13. `OutletResource` sudah mengirim `activationStatus` dari fitur `outlet_activation`.

### Gap yang Relevan

1. Backend membaca `$feature->trial_duration_days`, tetapi kolom `trial_duration_days` belum ada pada migration `features`.
2. Model `Feature` belum memiliki `trial_duration_days` pada `fillable` dan `casts`.
3. `FeatureSeeder` untuk `outlet_activation` belum menyimpan durasi trial 14 hari.
4. Jika `trial_duration_days` belum tersedia atau bernilai `0`, `getTrialEligibility()` akan menganggap trial tidak tersedia.
5. `Activate.tsx` masih memanggil route `outlets.start-trial`, sementara route tersebut sedang dikomentari.
6. Route yang aktif adalah `outlets.features.trial`, dan komponen lain seperti `OutletActivationOverlay` sudah memakai route tersebut.
7. `OutletFeatureController::startTrial(int $outletId, int $featureId)` menerima `featureId`, tetapi service saat ini tetap hardcode ke fitur `outlet_activation`.
8. `OutletResource` mengirim `trialRemainingDays`, sementara beberapa type/frontend masih memakai bentuk snake_case seperti `trial_remaining`.
9. `OutletResource` mengirim `trialExpiresAt` dan `unlockedAt`, sementara sebagian type masih memakai `trial_expires_at` dan `unlocked_at`.
10. DB `outlets.status` hanya mendukung `active`, `inactive`, dan `suspended`. Status trial atau expired sebaiknya tetap direpresentasikan oleh `outlet_features.status`.
11. `OutletFeatureService::startTrial()` saat ini mengubah `outlets.status` menjadi `active`. Implementation plan perlu memastikan arti status ini tidak membuat trial disamakan dengan aktivasi berbayar di seluruh sistem.
12. Trial `outlet_activation` tidak boleh secara implisit mengaktifkan `outlet_exposure`.

## 3. Tujuan Fitur

Tujuan utama fitur ini adalah:

1. Owner dapat memulai trial gratis 14 hari untuk outlet yang belum aktif dan belum pernah memakai trial.
2. Trial memberi owner akses operasional dasar outlet agar dapat mencoba konfigurasi dan transaksi internal.
3. Trial tidak memotong coin dan tidak membuat transaksi coin.
4. Trial tidak membuka semua fitur paid.
5. Trial tidak otomatis membuat outlet tampil publik di pencarian atau customer app.
6. Setelah trial habis, akses operasional outlet diblokir sampai owner melakukan aktivasi berbayar.
7. Data yang dibuat selama trial tetap tersimpan dan dapat digunakan kembali setelah aktivasi berbayar.

## 4. Aktor

1. `owner`
   Memulai trial, mencoba outlet, melihat status trial, dan melakukan aktivasi berbayar sebelum atau setelah trial habis.
2. `employee/kasir`
   Dapat memakai outlet untuk operasional internal selama trial masih aktif sesuai permission yang diberikan owner.
3. `customer`
   Hanya terdampak jika exposure outlet aktif. Trial outlet tidak otomatis membuat outlet terlihat publik.
4. `system`
   Mengelola eligibility trial, durasi trial, status akses, expiry, blocking setelah expired, dan kontrak data ke frontend.

## 5. Scope Kebutuhan

Scope utama:

1. Manual start trial gratis 14 hari untuk fitur `outlet_activation`.
2. Eligibility trial satu kali per outlet.
3. Status trial dan sisa masa trial pada UI owner.
4. Blocking akses outlet setelah trial expired.
5. CTA aktivasi berbayar sebelum dan setelah trial habis.
6. Kontrak backend/frontend untuk `activationStatus`.
7. Penyesuaian konfigurasi feature agar `outlet_activation` memiliki durasi trial 14 hari.
8. Verifikasi bahwa trial tidak mengurangi coin dan tidak membuat `coin_transactions`.
9. Verifikasi bahwa trial tidak mengaktifkan `outlet_exposure`.

Di luar scope:

1. Trial untuk semua fitur paid.
2. Trial untuk fitur `outlet_exposure`.
3. Trial otomatis saat outlet dibuat.
4. Perpanjangan trial manual oleh admin.
5. Coupon, voucher, promo coin, atau diskon aktivasi.
6. Penghapusan data outlet setelah trial expired.
7. Exposure publik outlet trial tanpa aktivasi exposure terpisah.

## 6. Prinsip Dasar Kebutuhan

1. Trial dimulai manual oleh owner.
2. Trial hanya berlaku untuk fitur `outlet_activation`.
3. Durasi trial adalah 14 x 24 jam sejak owner menekan tombol mulai trial.
4. Trial hanya bisa dipakai sekali per outlet.
5. Status utama trial disimpan di `outlet_features.status`.
6. `outlets.status` tidak perlu ditambah enum `trial` atau `expired` pada tahap kebutuhan ini.
7. Trial yang masih aktif dianggap cukup untuk akses operasional dasar outlet.
8. Trial expired harus memblokir akses operasional dasar outlet.
9. Trial tidak boleh dianggap sebagai aktivasi berbayar.
10. Trial tidak boleh membuka fitur paid lain secara otomatis.
11. Trial tidak boleh mengaktifkan exposure publik secara otomatis.
12. Aktivasi berbayar setelah trial expired harus membuka kembali akses outlet.

## 7. User Need Fungsional

### FR-01 Owner Dapat Memulai Trial dari Outlet Belum Aktif

1. Owner dapat melihat CTA `Mulai Trial Gratis 14 Hari` atau `Coba Gratis 14 Hari` pada outlet yang belum aktif.
2. CTA hanya tersedia jika outlet memenuhi eligibility trial.
3. Owner harus menekan tombol trial secara manual.
4. Sistem tidak boleh otomatis memulai trial ketika outlet dibuat.
5. Setelah trial berhasil dimulai, owner melihat outlet dalam status trial aktif.

### FR-02 Sistem Mengecek Eligibility Trial

1. Sistem hanya mengizinkan trial jika outlet belum memiliki aktivasi berbayar aktif.
2. Sistem hanya mengizinkan trial jika outlet belum pernah memakai trial.
3. Outlet yang pernah memiliki `trial_started_at` atau `trial_expires_at` tidak boleh memulai trial lagi.
4. Outlet dengan status fitur `trial`, `active`, atau riwayat trial tidak boleh mendapat trial kedua.
5. Jika trial tidak tersedia, sistem mengembalikan pesan yang jelas.
6. Pesan yang disarankan:
   - `Trial hanya dapat digunakan satu kali.`
   - `Fitur sudah aktif.`
   - `Fitur ini tidak memiliki masa trial.`

### FR-03 Trial Mencatat Waktu dan Status dengan Benar

1. Saat trial dimulai, sistem membuat atau memperbarui row `outlet_features` untuk fitur `outlet_activation`.
2. Field yang harus tercatat:
   - `status = trial`
   - `trial_started_at = now()`
   - `trial_expires_at = now() + 14 hari`
   - `unlocked_at = now()`
   - `expires_at = trial_expires_at`
3. Durasi harus 14 x 24 jam, bukan sekadar sampai akhir tanggal kalender.
4. Sisa hari trial harus dihitung dari `trial_expires_at`.
5. Implementation plan perlu memutuskan apakah tampilan sisa hari memakai pembulatan ke atas, pembulatan ke bawah, atau label jam saat kurang dari 1 hari.

### FR-04 Trial Tidak Mengurangi Coin

1. Start trial tidak boleh mengurangi coin owner.
2. Start trial tidak boleh mengurangi coin outlet.
3. Start trial tidak boleh membuat row `coin_transactions`.
4. `coin_spent` pada `outlet_features` tidak boleh bertambah karena trial.
5. Aktivasi berbayar tetap memakai flow coin existing.

### FR-05 Trial Membuka Akses Operasional Dasar Outlet

1. Selama trial aktif, owner dapat memakai outlet untuk operasional internal.
2. Akses dasar yang diharapkan:
   - konfigurasi outlet,
   - jam operasional,
   - kategori,
   - layanan,
   - karyawan,
   - pelanggan,
   - order atau transaksi internal sesuai akses dasar outlet.
3. Middleware dan helper akses harus menganggap `outlet_activation` trial yang belum expired sebagai akses aktif.
4. Fitur paid lain tetap mengikuti status masing-masing fitur.
5. Trial outlet tidak boleh bypass middleware untuk fitur paid selain `outlet_activation`.

### FR-06 Trial Tidak Mengaktifkan Exposure Publik

1. Start trial hanya berlaku untuk `outlet_activation`.
2. Start trial tidak boleh membuat atau mengubah row fitur `outlet_exposure`.
3. Outlet trial tidak otomatis tampil pada pencarian/customer app.
4. Customer app hanya boleh melihat outlet jika aturan exposure publik memang terpenuhi.
5. Jika owner ingin outlet tampil publik, owner harus mengikuti flow aktivasi exposure sesuai aturan fitur exposure.

### FR-07 Owner Melihat Status Trial dengan Jelas

1. Saat trial aktif, UI menampilkan status `Masa Trial Aktif`.
2. UI menampilkan sisa hari atau waktu trial.
3. UI menampilkan tanggal dan waktu berakhir trial.
4. UI tetap menampilkan CTA aktivasi berbayar.
5. Copy harus menjelaskan bahwa outlet perlu diaktifkan berbayar agar tetap dapat digunakan setelah trial habis.
6. Jika trial hampir habis, UI boleh memberi warning, misalnya saat sisa 3 hari atau kurang.

### FR-08 Owner Diarahkan ke Aktivasi Berbayar

1. Outlet inactive menampilkan CTA:
   - `Mulai Trial Gratis 14 Hari`
   - `Aktifkan Sekarang`
2. Outlet trial aktif menampilkan CTA `Aktifkan Sekarang`.
3. Outlet trial expired menampilkan blocking state dan CTA `Aktifkan Sekarang`.
4. Aktivasi berbayar setelah trial aktif atau expired harus memakai coin sesuai harga fitur `outlet_activation`.
5. Setelah aktivasi berbayar berhasil, status fitur menjadi `active` dan outlet dapat digunakan kembali.

### FR-09 Trial Expired Memblokir Akses Operasional

1. Setelah `trial_expires_at` lewat, trial dianggap tidak aktif.
2. Command expiry atau pengecekan akses harus mengubah atau memperlakukan status sebagai `expired`.
3. Akses operasional dasar outlet diblokir sampai owner melakukan aktivasi berbayar.
4. UI menampilkan blocking state yang jelas.
5. Data outlet, order, karyawan, pelanggan, konfigurasi, dan histori selama trial tidak boleh dihapus.
6. Owner tetap harus dapat mengakses flow aktivasi berbayar.

### FR-10 Kontrak Payload Activation Status Konsisten

1. Backend dan TypeScript types harus memakai bentuk field yang konsisten.
2. Jika backend memakai camelCase, type dan komponen frontend harus membaca:
   - `trialRemainingDays`
   - `trialExpiresAt`
   - `unlockedAt`
3. Jika frontend memilih snake_case, resource backend perlu disesuaikan secara konsisten.
4. Implementation plan perlu memilih satu format dan memperbaiki semua pemakaian.
5. UI tidak boleh menampilkan `undefined Hari` karena mismatch nama field.

### FR-11 Route Frontend Start Trial Konsisten

1. Frontend harus memakai route trial yang aktif.
2. Route aktif saat ini adalah `outlets.features.trial` dengan parameter outlet id dan feature id.
3. Komponen yang masih memanggil `outlets.start-trial` perlu disesuaikan atau route lama perlu diaktifkan kembali secara sengaja.
4. Implementation plan harus memilih satu jalur route agar tidak ada dua endpoint yang ambigu.
5. Jika endpoint menerima `featureId`, backend harus memvalidasi bahwa feature tersebut memang `outlet_activation` atau service dibuat benar-benar generic.

## 8. Aturan Bisnis

1. Trial hanya berlaku untuk fitur `outlet_activation`.
2. Durasi trial adalah 14 x 24 jam sejak tombol mulai trial ditekan.
3. Trial hanya bisa dipakai sekali per outlet.
4. Outlet existing yang belum aktif dan belum pernah trial boleh memulai trial.
5. Outlet yang sudah aktif berbayar tidak bisa memulai trial.
6. Outlet yang trial-nya pernah expired tidak bisa memulai trial kedua.
7. Trial tidak memotong coin owner.
8. Trial tidak memotong coin outlet.
9. Trial tidak membuat `coin_transactions`.
10. Trial tidak mengaktifkan `outlet_exposure`.
11. Trial tidak membuka fitur paid lain.
12. Trial aktif memberi akses operasional dasar outlet.
13. Trial expired memblokir akses operasional dasar outlet.
14. Data outlet dan data operasional tidak dihapus saat trial expired.
15. Aktivasi berbayar setelah trial expired mengubah akses menjadi aktif sesuai flow aktivasi coin.
16. Status trial/expired utama berada di `outlet_features`, bukan enum baru pada `outlets.status`.

## 9. UX yang Diharapkan

### Outlet Belum Aktif dan Belum Pernah Trial

1. UI menampilkan status `Outlet Belum Aktif`.
2. UI menampilkan tombol `Mulai Trial Gratis 14 Hari` atau `Coba Gratis 14 Hari`.
3. UI menampilkan tombol `Aktifkan Sekarang`.
4. Copy menjelaskan bahwa trial gratis berlangsung 14 hari.
5. Owner memahami bahwa trial tidak memotong coin.

### Outlet Trial Aktif

1. UI menampilkan status `Masa Trial Aktif`.
2. UI menampilkan sisa hari trial.
3. UI menampilkan tanggal berakhir trial.
4. UI menampilkan CTA `Aktifkan Sekarang`.
5. UI memberi pesan bahwa akses akan diblokir setelah trial habis jika belum aktivasi berbayar.

### Outlet Trial Expired

1. UI menampilkan status `Masa Trial Berakhir`.
2. UI menampilkan blocking state pada area operasional yang membutuhkan aktivasi outlet.
3. UI menampilkan CTA `Aktifkan Sekarang`.
4. UI menjelaskan bahwa data tidak hilang dan akses akan dibuka kembali setelah aktivasi.

### Trial Sudah Pernah Digunakan

1. Tombol trial tidak ditampilkan, atau ditampilkan disabled dengan pesan yang jelas.
2. UI tidak memberi kesan bahwa owner masih bisa mencoba trial lagi.
3. CTA utama diarahkan ke aktivasi berbayar.

## 10. Data Contract yang Disarankan

Payload `activationStatus` pada `OutletResource` disarankan konsisten dalam satu format. Jika mengikuti style resource saat ini, gunakan camelCase:

```ts
type OutletActivationStatus = {
    status: "inactive" | "trial" | "active" | "expired";
    trialStartedAt?: string | null;
    trialExpiresAt?: string | null;
    unlockedAt?: string | null;
    expiresAt?: string | null;
    trialRemainingDays: number;
    trialEligible?: boolean;
    trialEligibilityCode?: string | null;
    trialEligibilityMessage?: string | null;
    trialDurationDays?: number;
};
```

Catatan:

1. Shape di atas adalah rekomendasi kebutuhan, bukan kontrak final.
2. `trialEligible` dan informasi eligibility dapat dikirim terpisah jika lebih sesuai dengan struktur page props.
3. Tanggal sebaiknya dikirim dalam format ISO string seperti resource existing.
4. Frontend harus membaca nama field yang sama dengan resource.
5. Implementation plan perlu memutuskan apakah `trialRemainingDays` dihitung backend saja atau juga dihitung ulang di frontend untuk live countdown.

## 11. Alur Bisnis yang Diharapkan

### Owner Memulai Trial

1. Owner membuka halaman aktivasi atau detail fitur outlet.
2. Sistem memuat status fitur `outlet_activation` dan eligibility trial.
3. UI menampilkan tombol trial jika eligible.
4. Owner menekan tombol mulai trial.
5. Sistem memvalidasi bahwa outlet belum aktif dan belum pernah trial.
6. Sistem membuat status trial selama 14 hari.
7. Sistem tidak mengurangi coin dan tidak membuat transaksi coin.
8. Owner diarahkan kembali ke outlet dengan status trial aktif.

### Owner Menggunakan Outlet Selama Trial

1. Owner mengatur outlet dan mencoba operasional internal.
2. Middleware mengizinkan akses dasar karena `outlet_activation` masih trial aktif.
3. Fitur paid lain tetap terkunci jika belum aktif.
4. Outlet tidak otomatis tampil di customer app karena exposure tidak aktif.

### Trial Berakhir

1. Waktu sekarang melewati `trial_expires_at`.
2. Command expiry atau pengecekan akses memperlakukan trial sebagai expired.
3. Akses operasional outlet diblokir.
4. UI menampilkan pesan trial berakhir dan CTA aktivasi berbayar.
5. Data outlet tetap tersimpan.

### Owner Aktivasi Berbayar Setelah Trial

1. Owner memilih CTA `Aktifkan Sekarang`.
2. Sistem mengecek saldo coin sesuai source coin yang dipakai.
3. Sistem memotong coin sesuai harga fitur `outlet_activation`.
4. Sistem membuat `coin_transactions`.
5. Sistem mengubah status fitur menjadi `active`.
6. Akses outlet terbuka kembali.

## 12. Acceptance Criteria

1. Dokumen implementation plan berikutnya memiliki acuan bahwa trial outlet adalah manual, gratis, dan berdurasi 14 hari.
2. Owner dapat memulai trial pada outlet inactive yang belum pernah trial.
3. Trial mencatat `trial_started_at`, `trial_expires_at`, `unlocked_at`, `expires_at`, dan status `trial`.
4. Durasi trial dihitung 14 x 24 jam sejak start trial.
5. Trial tidak mengurangi coin owner.
6. Trial tidak mengurangi coin outlet.
7. Trial tidak membuat `coin_transactions`.
8. Owner tidak bisa memulai trial kedua pada outlet yang sama.
9. Outlet aktif berbayar tidak bisa memulai trial.
10. Outlet trial tidak otomatis mendapat `outlet_exposure`.
11. Outlet trial tidak otomatis tampil publik di customer app.
12. Outlet trial aktif dapat dipakai untuk operasional internal sesuai akses dasar outlet.
13. Setelah trial expired, akses operasional outlet diblokir.
14. Setelah trial expired, data outlet dan data operasional tetap tersimpan.
15. Aktivasi berbayar setelah trial expired mengubah akses menjadi aktif dan membuka kembali outlet.
16. Frontend memakai route start trial yang benar dan tidak mengarah ke route yang dikomentari.
17. Payload `activationStatus` konsisten antara backend resource dan TypeScript types.
18. UI menampilkan status trial, sisa hari, tanggal berakhir, dan CTA aktivasi.
19. Tombol start trial tidak tersedia atau disabled jika trial sudah pernah digunakan.

## 13. Test Plan Minimal

Skenario yang harus dicakup:

1. Owner bisa memulai trial pada outlet inactive yang belum pernah trial.
2. Trial menyimpan status `trial`.
3. Trial menyimpan `trial_started_at`.
4. Trial menyimpan `trial_expires_at` tepat 14 hari setelah `trial_started_at`.
5. Trial menyimpan `expires_at` sama dengan `trial_expires_at`.
6. Trial tidak mengurangi coin owner.
7. Trial tidak mengurangi coin outlet.
8. Trial tidak membuat `coin_transactions`.
9. Owner tidak bisa memulai trial kedua pada outlet yang sama.
10. Outlet aktif berbayar tidak bisa memulai trial.
11. Outlet yang trial-nya sudah expired tidak bisa memulai trial kedua.
12. Outlet trial aktif lolos akses `outlet_activation`.
13. Outlet trial expired tidak lolos akses `outlet_activation`.
14. Command `features:check-expiry` mengubah trial expired menjadi status `expired`.
15. Outlet trial tidak membuat atau mengaktifkan fitur `outlet_exposure`.
16. Outlet trial tidak otomatis muncul di endpoint customer yang mensyaratkan exposure aktif.
17. Aktivasi berbayar setelah trial expired mengubah status menjadi `active`.
18. Aktivasi berbayar setelah trial expired membuat transaksi coin sesuai flow aktivasi.
19. Frontend start trial memakai route yang aktif.
20. `activationStatus` pada TypeScript type sesuai dengan payload backend.
21. UI tidak menampilkan nilai sisa trial yang `undefined`.

## 14. Catatan untuk Implementation Plan

Hal yang perlu diputuskan atau diperbaiki pada implementation plan:

1. Tambah kolom `trial_duration_days` pada tabel `features`, atau pilih sumber konfigurasi durasi trial lain yang eksplisit.
2. Tambah `trial_duration_days` pada `Feature::$fillable`.
3. Tambah cast `trial_duration_days` sebagai integer pada `Feature`.
4. Update `FeatureSeeder` agar `outlet_activation` memiliki `trial_duration_days = 14`.
5. Tentukan nilai default `trial_duration_days` untuk fitur lain, kemungkinan `0`.
6. Pastikan `getTrialEligibility()` tetap mengembalikan pesan jelas jika trial tidak tersedia.
7. Selaraskan route frontend:
   - gunakan `outlets.features.trial`, atau
   - aktifkan kembali route `outlets.start-trial` dengan alasan yang jelas.
8. Jika endpoint tetap menerima `featureId`, validasi bahwa `featureId` adalah fitur `outlet_activation`.
9. Selaraskan resource dan TypeScript type untuk `activationStatus`.
10. Evaluasi efek `startTrial()` yang mengubah `outlets.status` menjadi `active`.
11. Pastikan check akses operasional memakai fitur `outlet_activation`, bukan hanya `outlets.status`.
12. Pastikan expired trial memblokir akses walaupun `outlets.status` bernilai `active`.
13. Pastikan exposure publik tetap bergantung pada fitur `outlet_exposure`.
14. Pastikan aktivasi berbayar setelah trial tidak ditolak hanya karena row `outlet_features` sudah pernah trial.
15. Tentukan tampilan sisa waktu trial saat kurang dari 1 hari.
16. Tambahkan test backend untuk eligibility, start trial, expiry, coin, exposure, dan aktivasi setelah expired.
17. Tambahkan test frontend atau coverage komponen untuk route dan tampilan status jika test frontend tersedia.

## 15. Pertanyaan Terbuka

1. Apakah owner boleh memulai trial untuk outlet yang status `outlets.status = suspended`, atau hanya untuk outlet yang tidak suspended?
2. Apakah employee boleh tetap login dan melihat outlet trial expired, atau seluruh akses selain owner harus diblokir?
3. Apakah owner perlu notifikasi sebelum trial habis, misalnya H-3 atau H-1?
4. Apakah admin perlu kemampuan reset trial untuk kasus support tertentu?
5. Apakah trial outlet dasar harus mengizinkan pembuatan order customer, atau hanya order internal dari dashboard?
6. Apakah sisa trial di UI perlu countdown jam/menit saat kurang dari 24 jam?
7. Apakah `outlets.status` perlu tetap `inactive` selama trial agar status bisnis tidak rancu, sementara akses ditentukan oleh `outlet_features`?
8. Apakah fitur gratis seperti kurir boleh aktif selama outlet trial, atau tetap harus menunggu aktivasi berbayar?

## 16. Rekomendasi Awal

Untuk implementasi tahap pertama, pendekatan yang paling sederhana dan aman adalah:

1. Jadikan `outlet_features` sebagai sumber kebenaran trial.
2. Tambahkan `features.trial_duration_days` dengan default `0`.
3. Set `outlet_activation.trial_duration_days = 14` di seeder.
4. Pertahankan trial hanya untuk `outlet_activation`.
5. Gunakan route aktif `outlets.features.trial` dan hapus ketergantungan frontend pada `outlets.start-trial`.
6. Validasi `featureId` pada controller agar hanya `outlet_activation` yang bisa memulai trial.
7. Samakan payload `activationStatus` backend dan TypeScript types dengan format camelCase.
8. Pastikan middleware akses outlet dasar mengecek `outlet_activation` melalui `hasActiveAccess()`.
9. Jangan jadikan `outlets.status` sebagai satu-satunya sumber akses trial.
10. Tambahkan test bahwa trial tidak mengurangi coin, tidak membuat transaksi coin, dan tidak mengaktifkan exposure.
11. Tambahkan test bahwa trial expired memblokir akses dan aktivasi berbayar membuka akses kembali.
