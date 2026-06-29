# Feature Context - Program Afiliasi

## Tujuan Context

Dokumen ini adalah content brief untuk AI lain yang akan menulis konten page feature Program Afiliasi WashWallet.

Gaya yang harus dipakai: Actual + Guardrail. Program afiliasi di codebase saat ini berbasis referral code owner, `referred_by`, daftar referral, referral logs dari topup, komisi koin, dan pencatatan accounting. Jangan mengambil klaim lanjutan dari copy marketing lama jika tidak terbukti di backend.

## Ringkasan Feature

Program Afiliasi WashWallet saat ini memungkinkan user owner membagikan kode referral 8 karakter. Saat user baru registrasi dengan kode tersebut, relasi referrer disimpan. Ketika referred user melakukan topup yang berhasil, referrer menerima komisi berbasis koin/reward balance dan sistem membuat referral log serta pencatatan accounting.

Narasi aman: WashWallet membantu owner mengajak pengguna baru lewat kode referral, memantau daftar referral, dan mendapatkan komisi koin dari topup referral yang berhasil.

## Capability yang Aman Diklaim

- Referral code per user:
  - User memiliki `referral_code` unik 8 karakter.
  - User baru dapat membawa `referralCode` saat registrasi.
  - Jika kode valid, `referred_by` pada user baru diisi dengan id referrer.

- Validasi referral:
  - Endpoint `GET /api/referral/check` memvalidasi format kode 8 karakter.
  - Endpoint hanya menerima referrer dengan status active.
  - Response valid mengembalikan id dan nama referrer.

- Dashboard afiliasi:
  - Web route `/dashboard/affiliates` menampilkan user referral milik owner yang login.
  - Dashboard mendukung search, status filter, sort, pagination, total referrals, dan total commission.
  - Profile juga memiliki referral summary dan recent referrals.

- Referral log:
  - `ReferralLog` mencatat referrer, referred user, topup, dan commission coin.
  - Total commission dihitung dari sum `commission_coin`.

- Komisi dari topup:
  - Saat owner topup sukses, TopupService menambah coin balance owner/outlet.
  - Jika user punya `referred_by`, sistem menghitung commission amount sebesar 10% dari coin received.
  - Referrer mendapat increment `reward_balance`.
  - Referral log dibuat untuk topup tersebut.

- Coin transaction dan accounting:
  - `AccountingService::recordReferralCommission` mencatat jurnal komisi referral.
  - Accounting service juga membuat coin transaction untuk komisi/reward sesuai flow yang ada.
  - Account default memiliki role terkait referral expense dan referral commission revenue.

## Source of Truth dari Codebase

- Route validasi referral ada di `routes/api.php`.
- Dashboard affiliate ada di `routes/web.php` dan `app/Http/Controllers/Web/AffiliateController.php`.
- Validasi kode ada di `app/Http/Controllers/Api/ReferralController.php`.
- Registrasi dan relasi referral ada di `app/Services/AuthService.php`.
- Komisi topup ada di `app/Services/TopupService.php`.
- Accounting referral ada di `app/Services/AccountingService.php`.
- Entity utama ada di `app/Models/User.php`, `app/Models/ReferralLog.php`, `app/Models/Topup.php`, dan `app/Models/CoinTransaction.php`.
- UI dashboard affiliate ada di `resources/js/Pages/Dashboard/Affiliates/Index.tsx`.
- Form registrasi referral ada di `resources/js/Pages/Auth/Partials/UserInformation.tsx`.

## Flow / Entity Utama

1. User owner memiliki referral code unik.
2. Calon user memasukkan kode referral saat registrasi.
3. Frontend dapat memanggil endpoint referral check untuk menampilkan status kode.
4. AuthService mencari user dengan referral code dan mengisi `referred_by` pada user baru.
5. Referred user melakukan topup owner coin.
6. Saat topup settlement/capture, sistem menambah coin balance dan menghitung komisi referral 10%.
7. Sistem menambah reward balance referrer, membuat referral log, dan mencatat accounting journal/coin transaction.
8. Referrer melihat daftar referral dan total komisi di dashboard affiliate atau profile.

## Angle Konten untuk Feature Page

- "Bagikan kode referral, pantau siapa yang bergabung, dan terima komisi koin dari topup yang berhasil."
- "Program referral yang sederhana dan transparan: kode unik, daftar referral, total komisi."
- "Komisi tercatat di sistem, bukan spreadsheet manual."
- "Cocok untuk growth awal yang mengandalkan rekomendasi owner ke owner lain."

## Batas Klaim / Jangan Diklaim

- Jangan klaim referral link custom. Yang terlihat aman adalah referral code, bukan link builder/tracking link.
- Jangan klaim click tracking, attribution click, UTM analytics, conversion funnel, atau source campaign.
- Jangan klaim multi-level affiliate atau indirect referral commission. Codebase memakai `referred_by` satu level.
- Jangan klaim custom commission rules, tiered commission, flat fee custom, atau per-package commission rule. Saat ini komisi topup tampak fixed 10%.
- Jangan klaim payout bank affiliate, payout instant, withdrawal referral reward, atau settlement ke rekening.
- Jangan klaim fraud detection, duplicate device detection, geolocation verification, atau manual review suspicious referral.
- Jangan klaim affiliate landing page builder atau campaign asset generator.

## Saran Section Page

- Hero: "Program referral owner dengan kode unik dan komisi koin."
- Problem: referral manual sulit dilacak, komisi perlu direkap manual, owner tidak tahu referral aktif.
- Feature block 1: Referral code dan validasi kode.
- Feature block 2: Registrasi dengan `referred_by`.
- Feature block 3: Dashboard daftar referral dan total komisi.
- Feature block 4: Komisi koin dari topup sukses.
- Feature block 5: Referral log dan pencatatan accounting.
- Guardrail note internal: jangan pakai klaim "multi-level", "fraud detection", atau "payout instant".

## Referensi Kode

- `routes/api.php`
- `routes/web.php`
- `app/Http/Controllers/Api/ReferralController.php`
- `app/Http/Controllers/Web/AffiliateController.php`
- `app/Services/AuthService.php`
- `app/Services/TopupService.php`
- `app/Services/ProfileService.php`
- `app/Services/AccountingService.php`
- `app/Services/AccountService.php`
- `app/Models/User.php`
- `app/Models/ReferralLog.php`
- `app/Models/Topup.php`
- `app/Models/CoinTransaction.php`
- `database/migrations/0001_01_01_000000_create_users_table.php`
- `database/migrations/2026_01_11_054918_create_referral_logs_table.php`
- `resources/js/Pages/Dashboard/Affiliates/Index.tsx`
- `resources/js/Pages/Auth/Partials/UserInformation.tsx`
- `resources/js/Data/Features/AffiliateProgram.tsx` sebagai copy pembanding, bukan source of truth jika bertentangan dengan backend.
