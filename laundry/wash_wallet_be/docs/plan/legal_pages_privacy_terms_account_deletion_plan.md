# Implementation Plan: Halaman Legal Publik WashWallet
# (Privacy Policy, Terms of Service, Account Deletion)

**Dibuat:** 2026-06-23  
**Revisi:** 2026-06-23 (v2 â€” dari Blade ke Inertia.js + React + TypeScript)  
**Berdasarkan:** `docs/user_need/wash_wallet_privacy_policy_terms_and_account_deletion_user_need.md`  
**Status:** Ready to Implement

---

## Ringkasan

Tujuan plan ini adalah membuat tiga halaman legal publik WashWallet menggunakan stack yang konsisten dengan proyek:
**Laravel + Inertia.js + React + TypeScript + Tailwind CSS**.

Pendekatan:
- **Hapus** route closure lama di `routes/web.php` yang mengarah ke Blade view
- **Buat** `LegalController.php` baru di `app/Http/Controllers/Web/`
- **Daftarkan** tiga route baru yang memanggil controller tersebut
- **Buat** tiga halaman React baru di `resources/js/Pages/Legal/`
- **Buat** satu file test baru di `tests/Feature/Web/`

Ketiga Blade view lama (`resources/views/public/`) dibiarkan saja (tidak dihapus, tidak perlu dimodifikasi).

---

## Konteks Codebase yang Relevan

### Stack yang Digunakan Proyek

| Layer | Teknologi |
|---|---|
| Backend | Laravel (PHP) |
| Frontend rendering | Inertia.js v2 (`@inertiajs/react`) |
| UI Framework | React 18 + TypeScript |
| Styling | Tailwind CSS v3 |
| Bundler | Vite + `laravel-vite-plugin` |
| Icon library | `lucide-react` |
| Path alias | `@/` â†’ `resources/js/` |

### Pola Controller yang Digunakan di Proyek

Semua halaman publik menggunakan pola:

```php
// Controller
return Inertia::render('PageName/Index');

// Route
Route::get('/url', [ControllerClass::class, 'method'])->name('route.name');
```

Contoh:
- `HomeController` â†’ `Inertia::render('Home/Index')` â†’ `resources/js/Pages/Home/Index.tsx`
- `FaqController` â†’ `Inertia::render('Faq/Index')` â†’ `resources/js/Pages/Faq/Index.tsx`

### Layout yang Tersedia

`GuestLayout.tsx` sudah ada dan digunakan oleh seluruh halaman publik. Props:

```tsx
<GuestLayout
    showNavigation={true}  // tampilkan GuestNavbar
    showFooter={true}      // tampilkan GuestFooter
    isFullWidth={false}    // false = container mx-auto, true = full width
>
```

### Route Lama yang Perlu Diganti

Di `routes/web.php` (baris 88â€“99):

```php
// Lama â€” route closure ke Blade
Route::get('/privacy', function () {
    return view('public.privacy');
})->name('privacy');

Route::get('/terms', function () {
    return view('public.terms');
})->name('terms');

Route::get('/account-deletion', function () {
    return view('public.account-deletion');
})->name('account-deletion');
```

---

## Placeholder Kontak (gunakan ini secara konsisten di ketiga halaman)

| Field | Nilai Placeholder |
|---|---|
| Organisasi | `WashWallet` |
| Email Support | `support@washwallet.com` |
| Website | `https://washwallet.com` |
| Waktu Proses Account Deletion | Maksimal 30 hari kalender |

> Definisikan placeholder ini sebagai konstanta di dalam masing-masing file `*.tsx` agar mudah diganti.

---

## Perubahan yang Diperlukan

---

### [MODIFY] `routes/web.php`

Ganti tiga route closure lama dengan tiga route baru yang mengarah ke `LegalController`.

**Tambahkan import** di bagian atas file (bersama import controller lain):

```php
use App\Http\Controllers\Web\LegalController;
```

**Ganti** blok route lama (baris 88â€“99):

```php
// Public legal pages - accessible without authentication
Route::get('/privacy', function () {
    return view('public.privacy');
})->name('privacy');

Route::get('/terms', function () {
    return view('public.terms');
})->name('terms');

Route::get('/account-deletion', function () {
    return view('public.account-deletion');
})->name('account-deletion');
```

**Dengan** route baru:

```php
// Public legal pages - accessible without authentication
Route::prefix('legal')->name('legal.')->controller(LegalController::class)->group(function () {
    Route::get('/privacy', 'privacy')->name('privacy');
    Route::get('/terms', 'terms')->name('terms');
    Route::get('/account-deletion', 'accountDeletion')->name('account-deletion');
});
```

> **Catatan URL:** Dengan prefix `legal`, URL menjadi `/legal/privacy`, `/legal/terms`, `/legal/account-deletion`.  
> Jika stakeholder mengharuskan URL tetap `/privacy`, `/terms`, `/account-deletion` (tanpa prefix), hilangkan `->prefix('legal')` dan sesuaikan nama route. Pilih salah satu secara konsisten. **Rekomendasi default plan ini: gunakan prefix `/legal/`** agar lebih terorganisir dan hindari tabrakan dengan route lain di masa depan.

---

### [NEW] `app/Http/Controllers/Web/LegalController.php`

Buat file baru sesuai namespace dan pola yang digunakan proyek.

```php
<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class LegalController extends Controller
{
    public function privacy(): Response
    {
        return Inertia::render('Legal/Privacy');
    }

    public function terms(): Response
    {
        return Inertia::render('Legal/Terms');
    }

    public function accountDeletion(): Response
    {
        return Inertia::render('Legal/AccountDeletion');
    }
}
```

---

### [NEW] `resources/js/Pages/Legal/Privacy.tsx`

Halaman Privacy Policy. Gunakan `GuestLayout` dengan `showNavigation={true}` dan `showFooter={true}`.

#### Struktur Konten â€” Privacy Policy

Render semua seksi berikut dalam urutan ini. Seluruh teks dalam **Bahasa Indonesia**.

```
1. <Head title="Kebijakan Privasi - WashWallet" />
2. Heading h1: "Kebijakan Privasi WashWallet"
3. Tanggal: "Berlaku sejak: [tanggal implementasi]"
4. Paragraf intro:
   - WashWallet adalah platform manajemen laundry yang mencakup 3 aplikasi:
     WashWallet (Customer), WashWallet Cashier, WashWallet Production
   - Kebijakan ini berlaku untuk ketiganya karena menggunakan backend & database yang sama

5. Seksi: "Data yang Kami Kumpulkan"

   5a. Data Customer (dari aplikasi WashWallet):
       - Informasi akun: nama, nomor telepon, email, gender, tanggal lahir (opsional),
         avatar (opsional), password terenkripsi, status verifikasi, status aktif,
         last login, FCM token
       - Informasi alamat: label alamat, nama & nomor penerima, jalan/alamat,
         provinsi/kabupaten/kecamatan/desa, catatan alamat, latitude, longitude,
         status alamat utama
       - Informasi transaksi: order laundry, status order, item order, invoice/payment amount,
         metode pembayaran, Midtrans order id/transaction id, topup customer,
         deposit balance, riwayat transaksi
       - Informasi pickup & delivery: tipe delivery, alamat pickup, alamat delivery,
         jadwal pickup, jadwal delivery, biaya pickup/delivery, instruksi khusus
       - Review & feedback: rating, komentar, nama customer, status publikasi review

   5b. Data Employee (dari WashWallet Cashier & WashWallet Production):
       - Informasi employee: nama, username, nomor telepon, alamat, gender, tanggal lahir,
         avatar, password terenkripsi, PIN terenkripsi, status aktif, tanggal mulai,
         outlet, posisi, role/permission, last login
       - Informasi perangkat: FCM token, device id, device name, last used time
       - Informasi operasional: aktivitas kasir, aktivitas produksi, aktivitas kurir,
         status pekerjaan/order, pickup/delivery activity, order item process, work log,
         payroll/commission/fine/loan (jika fitur digunakan)

   5c. Data Owner/Admin (dari dashboard web):
       - Nama, username, email, phone, address, password terenkripsi, avatar,
         status akun, last login, role, permission, outlet yang dikelola,
         wallet/coin/reward balance, data rekening (jika fitur withdrawal digunakan),
         data accounting & transaksi bisnis outlet

   5d. Data Media & Attachment:
       - Avatar customer/employee/owner (jika digunakan)
       - Foto bukti pickup
       - Foto bukti kedatangan/pengantaran
       - Foto bukti timbang/order
       - Evidence attachment proses produksi
       - Attachment transaksi (deposit, expense, payroll, fine log â€” jika fitur digunakan)

   5e. Data Lokasi:
       - Latitude & longitude outlet
       - Latitude & longitude alamat customer
       - Koordinat perangkat untuk menemukan outlet terdekat
       - Koordinat untuk menghitung jarak & biaya pickup/delivery
       - TIDAK ada real-time tracking lokasi terus-menerus

   5f. Data Perangkat, Log & Diagnostik:
       - FCM token customer & employee per perangkat
       - Device id & device name
       - User agent
       - IP address pada OTP
       - Log aplikasi/server & diagnostic information

6. Seksi: "Tujuan Penggunaan Data"
   - Membuat dan mengelola akun
   - Memproses order laundry
   - Mengelola transaksi & pembayaran
   - Mengirim notifikasi (push notification & WhatsApp)
   - Menghitung biaya layanan pickup/delivery
   - Menampilkan outlet & layanan terdekat
   - Menyediakan pickup & delivery management
   - Menyediakan customer support
   - Meningkatkan kualitas layanan
   - Menjaga keamanan sistem
   - Memenuhi kewajiban hukum & audit

7. Seksi: "Layanan Pihak Ketiga"
   - Firebase Cloud Messaging (Google): push notification customer & employee
   - Google Maps Platform: location services, distance calculation, koordinat outlet/customer
   - Midtrans: payment gateway untuk order, topup, virtual account, QRIS, e-wallet
   - Fonnte: WhatsApp notification & OTP WhatsApp
   Setiap layanan pihak ketiga memiliki kebijakan privasi sendiri.

8. Seksi: "Keamanan Data"
   - Password & PIN disimpan dalam bentuk terenkripsi
   - Sistem menggunakan mekanisme keamanan standar
   - User diminta menjaga kerahasiaan akun

9. Seksi: "Retensi Data"
   - Data dipertahankan selama akun aktif
   - Data transaksi dapat disimpan lebih lama untuk keperluan audit, accounting, & kewajiban hukum

10. Seksi: "Hak Pengguna"
    - Hak mengakses data pribadi
    - Hak meminta koreksi data yang tidak akurat
    - Hak meminta penghapusan akun (link ke /legal/account-deletion)
    - Hak mengajukan pertanyaan atau keberatan via email support

11. Seksi: "Privasi Anak-Anak"
    - Layanan tidak ditujukan untuk anak di bawah 13 tahun
    - Jika ditemukan data anak, akan dihapus setelah verifikasi

12. Seksi: "Perubahan Kebijakan"
    - Perubahan akan diumumkan di halaman ini
    - Penggunaan layanan setelah perubahan dianggap menyetujui kebijakan baru

13. Seksi: "Hubungi Kami"
    - Nama: WashWallet
    - Email: support@washwallet.com (mailto link)
    - Website: https://washwallet.com
```

#### Panduan Implementasi React

```tsx
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
// import lucide-react icons yang relevan: Shield, Mail, Globe, dll.

// Konstanta kontak â€” ganti ketika data final tersedia
const CONTACT = {
    org: 'WashWallet',
    email: 'support@washwallet.com',
    website: 'https://washwallet.com',
};

const Privacy: React.FC = () => (
    <>
        <Head title="Kebijakan Privasi - WashWallet" />
        <GuestLayout showNavigation={true} showFooter={true} isFullWidth={false}>
            {/* Konten halaman */}
        </GuestLayout>
    </>
);

export default Privacy;
```

**Styling:** Gunakan Tailwind CSS. Gunakan `prose` dari `@tailwindcss/typography` jika tersedia, atau susun layout dengan class Tailwind standar. Ikuti pola visual yang sudah digunakan di `Faq/Index.tsx`.

---

### [NEW] `resources/js/Pages/Legal/Terms.tsx`

Halaman Terms of Service. Pola yang sama dengan `Privacy.tsx`.

#### Struktur Konten â€” Terms of Service

```
1. <Head title="Syarat dan Ketentuan - WashWallet" />
2. Heading h1: "Syarat dan Ketentuan Penggunaan WashWallet"
3. Tanggal berlaku

4. Paragraf intro:
   - Syarat ini berlaku untuk WashWallet, WashWallet Cashier, WashWallet Production
   - Dengan menggunakan aplikasi, user menyetujui syarat ini

5. Seksi: "Definisi"
   - "Platform" = WashWallet dan seluruh aplikasinya
   - "Customer" = pengguna aplikasi WashWallet Customer
   - "Employee" = pengguna WashWallet Cashier / WashWallet Production
   - "Owner/Admin" = pengguna dashboard web WashWallet

6. Seksi: "Tanggung Jawab Pengguna"

   6a. Tanggung Jawab Customer:
       - Memberikan informasi akun yang akurat & terkini
       - Menjaga kerahasiaan akun & password
       - Tidak menyalahgunakan layanan
       - Tidak menggunakan layanan untuk aktivitas ilegal
       - Bertanggung jawab atas semua aktivitas dari akun miliknya

   6b. Tanggung Jawab Employee:
       - Employee menggunakan akun kerja yang diberikan oleh organisasi/outlet
       - Employee bertanggung jawab atas aktivitas dari akun kerjanya
       - Employee wajib mengikuti kebijakan outlet dan organisasi yang berwenang
       - Akun kerja bukan akun pribadi; pengelolaan akun berada di tangan administrator

7. Seksi: "Pembayaran"
   - Pembayaran diproses melalui metode yang tersedia di platform (Midtrans: virtual account, QRIS, e-wallet, dll.)
   - Harga layanan laundry ditentukan oleh masing-masing outlet laundry
   - WashWallet bertindak sebagai platform teknologi yang memfasilitasi transaksi
   - Transaksi melalui payment gateway pihak ketiga mengikuti ketentuan provider terkait
   - Topup saldo/deposit customer diproses melalui mekanisme yang tersedia

8. Seksi: "Ketersediaan Layanan & Maintenance"
   - Platform berusaha menjaga ketersediaan layanan (best effort basis)
   - Maintenance terjadwal atau tidak terjadwal dapat menyebabkan gangguan sementara
   - WashWallet tidak menjamin ketersediaan 100% tanpa downtime

9. Seksi: "Larangan Penggunaan"
   - Dilarang: akses tidak sah ke sistem, reverse engineering, scraping massal
   - Dilarang: memberikan informasi palsu atau menyesatkan
   - Dilarang: menggunakan platform untuk aktivitas penipuan
   - Pelanggaran dapat mengakibatkan penonaktifan akun

10. Seksi: "Hak Kekayaan Intelektual"
    - Konten, desain, dan fitur platform adalah milik WashWallet atau pemegang lisensi
    - User tidak boleh menyalin, mendistribusikan, atau memodifikasi konten platform tanpa izin

11. Seksi: "Batasan Tanggung Jawab"
    - WashWallet tidak bertanggung jawab atas kerugian tidak langsung atau konsekuensial
    - WashWallet tidak bertanggung jawab atas kerugian akibat kegagalan pihak ketiga
    - Tanggung jawab maksimum terbatas sesuai hukum yang berlaku
    - [Informasi umum â€” perlu legal review sebelum produksi]

12. Seksi: "Perubahan Syarat"
    - WashWallet berhak mengubah syarat ini sewaktu-waktu
    - Perubahan diumumkan di halaman ini
    - Penggunaan berkelanjutan dianggap menyetujui perubahan

13. Seksi: "Hukum yang Berlaku"
    - Syarat ini tunduk pada hukum yang berlaku di Indonesia

14. Seksi: "Hubungi Kami"
    - Nama: WashWallet
    - Email: support@washwallet.com
    - Website: https://washwallet.com
```

---

### [NEW] `resources/js/Pages/Legal/AccountDeletion.tsx`

Halaman Account Deletion. Pola yang sama dengan `Privacy.tsx`.

#### Struktur Konten â€” Account Deletion

```
1. <Head title="Penghapusan Akun - WashWallet" />
2. Heading h1: "Penghapusan Akun WashWallet"

3. Paragraf intro:
   - WashWallet menghormati hak pengguna untuk meminta penghapusan akun
   - Halaman ini menjelaskan cara mengajukan permintaan dan apa yang terjadi setelahnya

4. Seksi: "Cara Meminta Penghapusan Akun (Customer â€” Aplikasi WashWallet)"
   Langkah-langkah:
   1. Kirim email ke support@washwallet.com
   2. Gunakan subject: "Account Deletion Request"
   3. Sertakan dalam email:
      - Nomor telepon yang terdaftar di akun WashWallet
      - Email yang terdaftar (jika ada)
      - Nama lengkap (untuk verifikasi identitas)
   4. Tim support akan memverifikasi permintaan dan menghubungi Anda
   5. Proses diselesaikan maksimal 30 hari kalender sejak permintaan valid diterima

5. Seksi: "Akun Employee (WashWallet Cashier & WashWallet Production)"
   - Akun pada WashWallet Cashier dan WashWallet Production adalah akun kerja
   - Akun kerja dibuat, dikelola, dan dihentikan oleh administrator outlet atau administrator sistem
   - Untuk penonaktifan atau penghapusan akun kerja, employee menghubungi:
     a. Administrator outlet tempat bekerja
     b. Administrator sistem WashWallet
     c. Tim support WashWallet di support@washwallet.com

6. Seksi: "Data yang Dapat Dihapus atau Dinonaktifkan"
   Setelah permintaan valid diproses:
   - Akun customer (informasi login)
   - Data profil (nama, email, nomor telepon, gender, tanggal lahir, avatar)
   - Alamat tersimpan
   - Token perangkat (FCM token)
   - Data sesi aktif

7. Seksi: "Data yang Mungkin Tetap Disimpan"
   - Riwayat transaksi & order laundry
   - Invoice & payment record
   - Data audit & log sistem
   - Data yang diperlukan untuk dispute resolution
   - Data yang wajib disimpan menurut peraturan hukum yang berlaku

8. Seksi: "Alasan Penyimpanan Data Tertentu"
   - Keperluan audit internal
   - Kewajiban hukum & perpajakan
   - Keperluan accounting & pembukuan bisnis
   - Penyelesaian sengketa (dispute resolution)
   - Pencegahan penipuan (fraud prevention)
   - Keamanan sistem

9. Seksi: "Estimasi Waktu Proses"
   - Maksimal 30 hari kalender sejak permintaan valid diterima & terverifikasi
   - WashWallet akan menginformasikan status proses via email support

10. Seksi: "Hubungi Kami"
    - Nama: WashWallet
    - Email: support@washwallet.com
    - Website: https://washwallet.com
```

---

### [NEW] `tests/Feature/Web/PublicLegalPagesTest.php`

Buat direktori `tests/Feature/Web/` jika belum ada, lalu buat file test.

> **Catatan URL:** Sesuaikan URL di test dengan keputusan URL yang diambil pada bagian Route.  
> Jika menggunakan prefix `/legal/`, gunakan `/legal/privacy`, `/legal/terms`, `/legal/account-deletion`.  
> Jika tanpa prefix, gunakan `/privacy`, `/terms`, `/account-deletion`.

```php
<?php

// Tests untuk memastikan ketiga halaman legal publik:
// 1. Dapat diakses tanpa autentikasi (HTTP 200)
// 2. Memuat konten kunci yang dipersyaratkan

use function Pest\Laravel\get;

describe('Public Legal Pages', function () {

    // --- Privacy Policy ---

    it('can access /legal/privacy without authentication', function () {
        get('/legal/privacy')
            ->assertStatus(200);
    });

    it('privacy page response contains WashWallet apps coverage', function () {
        get('/legal/privacy')
            ->assertStatus(200)
            ->assertSee('WashWallet')
            ->assertSee('Cashier')
            ->assertSee('Production');
    });

    it('privacy page response mentions required third party services', function () {
        get('/legal/privacy')
            ->assertStatus(200)
            ->assertSee('Firebase')
            ->assertSee('Google Maps')
            ->assertSee('Midtrans')
            ->assertSee('Fonnte');
    });

    // --- Terms of Service ---

    it('can access /legal/terms without authentication', function () {
        get('/legal/terms')
            ->assertStatus(200);
    });

    it('terms page response contains WashWallet apps coverage', function () {
        get('/legal/terms')
            ->assertStatus(200)
            ->assertSee('WashWallet')
            ->assertSee('Cashier')
            ->assertSee('Production');
    });

    // --- Account Deletion ---

    it('can access /legal/account-deletion without authentication', function () {
        get('/legal/account-deletion')
            ->assertStatus(200);
    });

    it('account deletion page response contains support email', function () {
        get('/legal/account-deletion')
            ->assertStatus(200)
            ->assertSee('support@washwallet.com');
    });

    it('account deletion page response mentions 30 day processing time', function () {
        get('/legal/account-deletion')
            ->assertStatus(200)
            ->assertSee('30');
    });

    it('account deletion page explains employee work account', function () {
        get('/legal/account-deletion')
            ->assertStatus(200)
            ->assertSee('Cashier')
            ->assertSee('Production');
    });

    // --- No Auth Redirect ---

    it('/legal/privacy does not redirect to login', function () {
        get('/legal/privacy')
            ->assertStatus(200);
    });

    it('/legal/terms does not redirect to login', function () {
        get('/legal/terms')
            ->assertStatus(200);
    });

    it('/legal/account-deletion does not redirect to login', function () {
        get('/legal/account-deletion')
            ->assertStatus(200);
    });
});
```

---

## Ringkasan Perubahan

| File | Aksi | Keterangan |
|---|---|---|
| `routes/web.php` | MODIFY | Ganti 3 route closure lama dengan route ke `LegalController` |
| `app/Http/Controllers/Web/LegalController.php` | NEW | Controller dengan 3 method: `privacy()`, `terms()`, `accountDeletion()` |
| `resources/js/Pages/Legal/Privacy.tsx` | NEW | Halaman Privacy Policy (React + Tailwind, Bahasa Indonesia) |
| `resources/js/Pages/Legal/Terms.tsx` | NEW | Halaman Terms of Service (React + Tailwind, Bahasa Indonesia) |
| `resources/js/Pages/Legal/AccountDeletion.tsx` | NEW | Halaman Account Deletion (React + Tailwind, Bahasa Indonesia) |
| `tests/Feature/Web/PublicLegalPagesTest.php` | NEW | Test HTTP untuk verifikasi 3 halaman legal publik |
| `resources/views/public/` (3 Blade files lama) | TIDAK DIUBAH | Dibiarkan, tidak dihapus |
| Database / Migration | TIDAK DIUBAH | Tidak ada perubahan database dalam scope ini |

---

## Di Luar Scope (Jangan Dikerjakan dalam Plan Ini)

- Membuat endpoint API atau controller dedicated untuk account deletion request
- Membuat workflow admin internal untuk memproses deletion request
- Membuat perubahan database (tabel, migration, anonymization, soft-delete)
- Membuat sistem ticketing atau notifikasi internal
- Memberikan legal advice â€” konten bersifat informasi umum dan tetap perlu legal review

---

## Acceptance Criteria

Implementasi dianggap selesai jika seluruh kriteria berikut terpenuhi:

- [ ] `GET /legal/privacy` mengembalikan HTTP 200 tanpa autentikasi
- [ ] `GET /legal/terms` mengembalikan HTTP 200 tanpa autentikasi
- [ ] `GET /legal/account-deletion` mengembalikan HTTP 200 tanpa autentikasi
- [ ] `LegalController.php` ada di `app/Http/Controllers/Web/` dengan 3 method yang memanggil `Inertia::render()`
- [ ] `Privacy.tsx`, `Terms.tsx`, `AccountDeletion.tsx` ada di `resources/js/Pages/Legal/`
- [ ] Ketiga halaman menggunakan `GuestLayout` dengan navbar & footer
- [ ] Halaman `Privacy.tsx` menyebut WashWallet, WashWallet Cashier, WashWallet Production
- [ ] Halaman `Privacy.tsx` menyebut Firebase, Google Maps Platform, Midtrans, Fonnte
- [ ] Halaman `Privacy.tsx` memuat kategori data: customer, employee, owner/admin, media, perangkat, lokasi, transaksi, review, operasional
- [ ] Halaman `Terms.tsx` memuat tanggung jawab customer dan tanggung jawab employee
- [ ] Halaman `Terms.tsx` memuat aturan pembayaran, ketersediaan layanan, dan limitation of liability
- [ ] Halaman `AccountDeletion.tsx` memuat instruksi pengiriman email ke support
- [ ] Halaman `AccountDeletion.tsx` menjelaskan akun employee (Cashier & Production) sebagai akun kerja
- [ ] Halaman `AccountDeletion.tsx` menyebut estimasi waktu proses 30 hari kalender
- [ ] Halaman `AccountDeletion.tsx` memuat data yang dapat dihapus & data yang mungkin tetap disimpan
- [ ] Ketiga halaman menggunakan kontak yang konsisten (`support@washwallet.com`)
- [ ] Semua test di `PublicLegalPagesTest.php` lulus
- [ ] Konten tidak mengklaim real-time location tracking, SMS notification, atau account deletion otomatis/self-service

---

## Cara Menjalankan Test Setelah Implementasi

```bash
# Jalankan hanya test legal pages
php artisan test --filter=PublicLegalPagesTest

# Jalankan semua test untuk memastikan tidak ada regresi
php artisan test
```

---

## Catatan untuk Implementor

1. **Bahasa konsisten:** Semua konten publik dalam Bahasa Indonesia.
2. **Pola halaman:** Ikuti pola `Faq/Index.tsx` dan `Home/Index.tsx` â€” gunakan `GuestLayout`, `Head` dari `@inertiajs/react`, dan `lucide-react` untuk ikon.
3. **Konstanta kontak:** Definisikan `CONTACT` sebagai objek konstanta di tiap file TSX agar mudah diganti. Sertakan komentar `// TODO: Ganti dengan data legal final`.
4. **Tailwind CSS:** Gunakan kelas Tailwind yang sudah ada di proyek. Jangan tambahkan CSS baru di file terpisah.
5. **TypeScript:** Ketiga file harus valid TypeScript. Tidak perlu props dari controller (halaman statis).
6. **Jangan hapus Blade lama:** Blade view di `resources/views/public/` tidak perlu dihapus.
7. **URL Test:** Sesuaikan URL di `PublicLegalPagesTest.php` dengan keputusan prefix route (dengan atau tanpa `/legal/`).
8. **Direktori `Web/`:** Jika `tests/Feature/Web/` belum ada, buat direktori tersebut sebelum membuat file test.


