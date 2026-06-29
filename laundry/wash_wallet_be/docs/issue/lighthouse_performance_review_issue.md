# Context: Lighthouse Performance Review - WashWallet Web App

Saya ingin Anda mereview hasil Lighthouse dari aplikasi web WashWallet secara menyeluruh, bukan hanya satu halaman tertentu.

Contoh URL yang diuji:

```txt
https://washwallet.id/dashboard/outlets/16/activate
```

Namun hasil review dan plan perbaikan harus diperlakukan sebagai acuan untuk seluruh halaman web WashWallet, terutama halaman dashboard, outlet, transaksi, customer, cashier, owner, dan halaman lain yang menggunakan layout, asset, font, JavaScript, CSS, serta backend Laravel yang sama.

---

## Goal

Tolong analisis masalah performa, accessibility, SEO, dan best practices pada aplikasi web WashWallet secara menyeluruh, lalu susun plan teknis untuk memperbaiki masalah tersebut di level aplikasi/global.

Fokus utama bukan hanya memperbaiki satu halaman, tetapi mencari root cause yang kemungkinan memengaruhi banyak halaman, seperti:

- response time backend Laravel,
- query database,
- middleware,
- layout Blade/Inertia,
- Vite bundle,
- CSS global,
- font loading,
- third-party resources,
- JavaScript global,
- image delivery,
- animation,
- accessibility pattern,
- meta tag global,
- security headers.

---

## Lighthouse Score

```txt
Performance: 71
Accessibility: 95
Best Practices: 100
SEO: 92
```

Catatan penting dari Lighthouse:

```txt
The page loaded too slowly to finish within the time limit. Results may be incomplete.
```

Kondisi pengujian:

```txt
Captured at: Jun 17, 2026, 3:00 PM GMT+7
Device: Emulated Moto G Power
Network: Slow 4G throttling
Browser: Chromium 149.0.0.0 with DevTools
Lighthouse: 13.2.0
Session: Single page session
Mode: Initial page load
```

---

# Main Problem

Masalah utama ada pada kategori:

```txt
Performance: 71
```

Halaman yang diuji masih terasa lambat saat diuji pada kondisi mobile dan jaringan Slow 4G.

Karena aplikasi kemungkinan menggunakan layout, asset, font, JavaScript bundle, CSS, middleware, dan pola backend yang sama, maka masalah ini perlu direview secara menyeluruh di level aplikasi, bukan hanya di satu route.

Kategori lain relatif baik:

```txt
Accessibility: 95
Best Practices: 100
SEO: 92
```

Namun tetap ada beberapa minor issue yang sebaiknya diperbaiki secara global.

---

# Performance Metrics

## 1. First Contentful Paint

```txt
First Contentful Paint: 3.2 s
```

### Problem

User baru melihat konten pertama setelah sekitar 3.2 detik.

### Possible Global Causes

- Server response awal lambat pada halaman dashboard.
- CSS utama masih render-blocking.
- Font eksternal ikut menahan render awal.
- Browser belum bisa menampilkan konten sampai resource penting selesai dimuat.
- Layout global memuat terlalu banyak asset sejak initial load.
- Middleware/auth/session pada dashboard terlalu berat.
- Data global seperti user, outlet, notification, permission, atau setting dimuat terlalu banyak di setiap halaman.

### Expected Review

Tolong cek kemungkinan bottleneck global pada:

- response time Laravel,
- middleware dashboard,
- shared data Inertia jika menggunakan Inertia,
- global layout Blade,
- global query database,
- global asset loading,
- external font loading,
- cache production.

---

## 2. Largest Contentful Paint

```txt
Largest Contentful Paint: 3.2 s
```

### Problem

Elemen utama terbesar di viewport selesai muncul pada 3.2 detik. Ini masih perlu diperbaiki, terutama untuk mobile network lambat.

### Possible Global Causes

- Initial HTML response lambat.
- CSS dan font blocking render.
- Komponen layout utama terlalu berat.
- Header/sidebar/dashboard shell terlalu besar.
- Ada gambar, card, atau section utama yang belum dioptimasi.
- Data halaman terlalu banyak dimuat saat initial render.
- SPA/Inertia hydration atau mounting terlalu berat.

### Expected Review

Tolong identifikasi pola elemen LCP di beberapa halaman utama, seperti:

- dashboard home,
- outlet list,
- outlet detail,
- transaction page,
- cashier page,
- customer-facing page,
- owner dashboard.

Berikan plan untuk menurunkan LCP mendekati atau di bawah 2.5 detik secara global.

---

## 3. Total Blocking Time

```txt
Total Blocking Time: 470 ms
```

### Problem

Browser cukup lama terblokir oleh JavaScript, sehingga interaksi awal user bisa terasa delay.

### Supporting Diagnostics

```txt
Reduce JavaScript execution time: 1.6 s
Reduce unused JavaScript: Est savings of 95 KiB
Avoid long main-thread tasks: 13 long tasks found
Minimize main-thread work: 31.7 s
```

### Possible Global Causes

- Bundle JavaScript utama terlalu besar.
- Banyak library atau komponen dimuat secara global padahal tidak dibutuhkan semua halaman.
- Komponen berat langsung dirender saat halaman pertama kali dibuka.
- Logic frontend terlalu banyak berjalan saat mount.
- Ada animasi atau interaction script yang membebani main thread.
- Belum ada lazy loading atau code splitting untuk komponen berat.
- Layout global memuat modal, sidebar, notification, map, chart, table, editor, atau component berat di semua halaman.

### Expected Review

Tolong cek:

- ukuran bundle JS hasil Vite/build,
- unused JavaScript secara global,
- import library berat,
- komponen yang dimuat oleh layout utama,
- komponen dashboard yang seharusnya lazy-loaded,
- kebutuhan code splitting per halaman,
- kebutuhan dynamic import,
- kemungkinan mengurangi logic pada initial render.

---

## 4. Cumulative Layout Shift

```txt
Cumulative Layout Shift: 0.015
```

### Problem

Nilai CLS sudah bagus dan layout relatif stabil.

### Notes

Masalah layout shift tidak menjadi prioritas utama. Namun tetap cek apakah ada pola global yang dapat menyebabkan layout bergeser.

### Expected Review

Tolong cek secara global:

- image tanpa width/height,
- font swap,
- alert/banner yang muncul setelah load,
- modal/skeleton/loading state,
- sidebar/header yang berubah ukuran,
- notification bar,
- komponen yang berubah ukuran saat data selesai dimuat.

---

## 5. Speed Index

```txt
Speed Index: 6.0 s
```

### Problem

Visual halaman terasa lambat untuk lengkap terlihat. Walaupun konten awal muncul sekitar 3.2 detik, halaman baru terasa lebih lengkap sekitar 6 detik.

### Possible Global Causes

- Resource penting dimuat terlalu lambat.
- Render-blocking CSS/font.
- JavaScript execution terlalu lama.
- Browser menunggu asset tambahan sebelum tampilan stabil.
- Komponen visual global muncul bertahap terlalu lama.
- Data dashboard dimuat sekaligus sebelum halaman terasa lengkap.

### Expected Review

Tolong buat plan untuk mempercepat visual completeness aplikasi secara global, terutama untuk mobile + Slow 4G.

---

# Lighthouse Insights

## 1. Document Request Latency

```txt
Document request latency: Est savings of 1,390 ms
Server responded slowly: observed 1489 ms
Avoids redirects: passed
Applies text compression: passed
```

### Problem

Request dokumen HTML awal lambat. Server membutuhkan sekitar 1489 ms untuk memberikan response awal.

### Possible Backend Causes

- Query database berat.
- N+1 query.
- Tidak menggunakan eager loading.
- Controller memuat terlalu banyak relasi/data.
- Tidak ada caching untuk data yang jarang berubah.
- Middleware/auth/session terlalu berat.
- Shared data global terlalu banyak.
- Data user/outlet/role/permission dimuat berulang di setiap request.
- Server atau hosting memiliki latency tinggi.
- Tidak ada route/config/view cache di production.
- OPcache belum aktif atau belum optimal.
- Beberapa route melakukan proses berat saat page load.
- Tidak ada pagination atau limit data pada halaman list.
- Agregasi dashboard dihitung langsung setiap request tanpa cache.

### Expected Review

Tolong cek backend Laravel secara menyeluruh:

- route dashboard,
- controller utama,
- middleware,
- policy/permission checks,
- query database,
- relasi Eloquent,
- N+1 query,
- eager loading,
- pagination,
- caching,
- shared data Inertia,
- service layer,
- job/queue untuk proses berat,
- config cache,
- route cache,
- view cache,
- OPcache,
- server response time.

---

## 2. Render-blocking Requests

```txt
Render-blocking requests: Est savings of 670 ms
```

Resource yang terdeteksi blocking:

```txt
/assets/app-BzIz5hOg.css
Transfer Size: 27.1 KiB
Duration: 300 ms

https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap
Transfer Size: 1.1 KiB
Duration: 780 ms

https://fonts.googleapis.com/css2?family=...
Transfer Size: 1.7 KiB
Duration: 780 ms
```

### Problem

CSS dan font eksternal menghambat initial render.

### Possible Global Causes

- Menggunakan dua font provider sekaligus, yaitu Bunny Fonts dan Google Fonts.
- Font eksternal membutuhkan DNS lookup, TLS, dan request tambahan.
- CSS utama masih berada di critical rendering path.
- Font belum dipreload atau self-hosted.
- Ada CSS yang tidak terpakai di bundle utama.
- Layout global memuat CSS untuk seluruh aplikasi sekaligus.

### Expected Review

Tolong cek secara global:

- apakah project memuat Figtree dari Bunny Fonts dan Google Fonts sekaligus,
- lokasi import font di layout utama Blade/Inertia/CSS,
- apakah font bisa disederhanakan menjadi satu provider saja,
- apakah font bisa di-self-host,
- apakah perlu preload font utama,
- apakah CSS global bisa dikurangi,
- apakah CSS bisa dipisah berdasarkan area dashboard/customer/public,
- apakah Tailwind content purge sudah benar,
- apakah build production Vite sudah optimal.

---

## 3. Improve Image Delivery

```txt
Improve image delivery: Est savings of 55 KiB
```

### Problem

Ada gambar yang masih bisa dioptimasi walaupun dampaknya tidak terlalu besar.

### Possible Global Causes

- Gambar terlalu besar dibanding ukuran tampil.
- Format gambar belum WebP/AVIF.
- Image belum lazy-loaded.
- Width dan height belum eksplisit.
- Logo/icon/avatar/banner/outlet image belum dioptimasi.
- Halaman list memuat banyak gambar sekaligus.

### Expected Review

Tolong cek semua pola image di aplikasi:

- logo,
- avatar,
- outlet image,
- banner,
- icon,
- payment logo,
- customer-facing image,
- dashboard image.

Buat plan:

- convert ke WebP/AVIF jika relevan,
- resize sesuai dimensi tampil,
- gunakan lazy loading untuk image non-critical,
- set width dan height agar layout stabil,
- compress asset image,
- hindari memuat image yang tidak terlihat pada initial viewport,
- gunakan thumbnail untuk list, bukan image original.

---

## 4. Layout Shift Culprits

```txt
Layout shift culprits detected
```

### Problem

Nilai CLS memang bagus, tetapi Lighthouse tetap mendeteksi potensi penyebab layout shift.

### Expected Review

Tolong cek pola global:

- gambar tanpa dimensi,
- font swap,
- alert/banner yang muncul setelah load,
- modal/skeleton/loading state,
- sidebar/header,
- notification/toast,
- elemen yang berubah ukuran saat data selesai dimuat.

---

## 5. Third Parties

### Problem

Ada third-party resource yang ikut memengaruhi performa, terutama font provider.

### Expected Review

Tolong cek semua third-party script/resource di seluruh aplikasi:

- Google Fonts,
- Bunny Fonts,
- Google Maps,
- Midtrans,
- analytics,
- CDN lain,
- script eksternal lain.

Pastikan hanya resource yang benar-benar dibutuhkan pada halaman tertentu yang dimuat. Jangan memuat Google Maps, Midtrans, chart, atau script eksternal berat secara global jika hanya dipakai pada beberapa halaman.

---

# Diagnostics

## 1. Minimize Main-thread Work

```txt
Minimize main-thread work: 31.7 s
```

### Problem

Main thread browser melakukan banyak pekerjaan.

### Possible Global Causes

- JavaScript parsing/execution berat.
- Rendering layout kompleks.
- Banyak komponen UI dirender sekaligus.
- Banyak animasi.
- Data besar diproses di frontend.
- Hydration atau mounting frontend terlalu berat.
- DOM terlalu kompleks.
- Layout dashboard memuat terlalu banyak UI global.
- Data tabel/list besar dirender tanpa pagination/virtualization.

### Expected Review

Tolong cek:

- kompleksitas DOM di halaman utama,
- jumlah komponen yang dirender,
- script yang berjalan saat load,
- animasi global,
- data processing di frontend,
- apakah data bisa diproses di backend,
- apakah rendering bisa dipisah/lazy,
- apakah halaman list butuh pagination atau virtualization.

---

## 2. Reduce JavaScript Execution Time

```txt
Reduce JavaScript execution time: 1.6 s
```

### Problem

JavaScript membutuhkan waktu eksekusi cukup besar saat initial load.

### Expected Review

Tolong cek:

- file bundle JS utama,
- import library berat,
- komponen yang tidak perlu dimount awal,
- event listener berlebihan,
- logic di mounted/useEffect/onMounted,
- script animasi,
- chart/maps/editor/modal/table library yang mungkin tidak perlu dimuat awal,
- apakah ada dependency yang lebih ringan.

---

## 3. Reduce Unused JavaScript

```txt
Reduce unused JavaScript: Est savings of 95 KiB
```

### Problem

Ada sekitar 95 KiB JavaScript yang dimuat tetapi tidak digunakan pada initial load.

### Expected Review

Tolong susun plan untuk:

- menghapus import yang tidak dipakai,
- melakukan dynamic import,
- lazy load komponen berat,
- memisahkan bundle berdasarkan area aplikasi,
- memisahkan bundle public/customer/dashboard jika relevan,
- memastikan tree-shaking berjalan,
- menghindari import global yang terlalu besar,
- mengecek apakah komponen modal/dropdown/chart/map dimuat di semua halaman.

---

## 4. Reduce Unused CSS

```txt
Reduce unused CSS: Est savings of 24 KiB
```

### Problem

Ada sekitar 24 KiB CSS yang dimuat tetapi tidak digunakan pada initial load.

### Expected Review

Tolong cek:

- konfigurasi Tailwind content path,
- CSS global,
- komponen UI yang stylenya masuk semua ke bundle,
- library CSS eksternal,
- apakah ada CSS lama yang tidak dipakai,
- apakah ada style dari template yang tidak diperlukan,
- apakah CSS dashboard/customer/public bisa dipisah.

---

## 5. Avoid Long Main-thread Tasks

```txt
Avoid long main-thread tasks: 13 long tasks found
```

### Problem

Ada 13 long tasks yang membuat browser sibuk dalam periode cukup lama.

### Expected Review

Tolong identifikasi long tasks dari trace/performance panel dan berikan rekomendasi:

- pecah task besar,
- defer script non-critical,
- lazy load komponen,
- kurangi animasi berat,
- kurangi pekerjaan saat initial render,
- pindahkan proses berat ke backend atau worker jika relevan,
- kurangi render list besar tanpa pagination.

---

## 6. Avoid Non-composited Animations

```txt
Avoid non-composited animations: 12 animated elements found
```

### Problem

Ada 12 elemen animasi yang kemungkinan menggunakan property yang memicu layout/paint berat.

### Possible Causes

Animasi mungkin menggunakan property seperti:

```txt
top
left
width
height
margin
padding
box-shadow
filter
background
```

### Expected Review

Tolong cek animasi global dan komponen UI yang sering dipakai:

- sidebar,
- dropdown,
- modal,
- toast,
- card hover,
- loading spinner,
- skeleton,
- button animation,
- page transition.

Sarankan perbaikan:

- gunakan transform dan opacity untuk animasi,
- hindari animasi layout property,
- kurangi animasi yang berjalan saat initial load,
- pastikan animasi tidak memblokir render awal,
- disable animasi tertentu untuk user dengan prefers-reduced-motion.

---

# Accessibility Issues

## Score

```txt
Accessibility: 95
```

## 1. Contrast Issue

```txt
Background and foreground colors do not have a sufficient contrast ratio.
```

### Problem

Ada warna teks dan background yang kontrasnya kurang.

### Expected Review

Tolong cek pola UI global:

- teks abu-abu muda,
- placeholder,
- label kecil,
- button disabled,
- teks pada background berwarna,
- badge/status label,
- link atau secondary text,
- sidebar text,
- table text,
- card metadata.

Berikan rekomendasi warna yang tetap sesuai desain namun memenuhi contrast ratio.

---

## 2. Heading Order Issue

```txt
Heading elements are not in a sequentially-descending order.
```

### Problem

Struktur heading tidak berurutan.

Contoh yang kurang baik:

```html
<h1>Title</h1>
<h4>Section</h4>
<h2>Another Section</h2>
```

Contoh yang lebih baik:

```html
<h1>Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

### Expected Review

Tolong cek struktur heading di layout dan halaman utama aplikasi:

- public page,
- dashboard,
- outlet page,
- transaction page,
- cashier page,
- customer page,
- owner page.

Perbaiki urutan heading secara semantic tanpa merusak tampilan visual. Gunakan class styling untuk ukuran visual, jangan bergantung pada level heading untuk ukuran.

---

# Best Practices

## Score

```txt
Best Practices: 100
```

### Notes

Kategori ini sudah sangat baik.

Namun Lighthouse tetap menampilkan beberapa manual checks/security hardening:

```txt
Ensure CSP is effective against XSS attacks
Ensure proper origin isolation with COOP
Mitigate clickjacking with XFO or CSP
Mitigate DOM-based XSS with Trusted Types
```

### Expected Review

Tolong cek apakah aplikasi sudah memiliki header keamanan yang sesuai untuk production:

- Content-Security-Policy,
- X-Frame-Options atau frame-ancestors pada CSP,
- X-Content-Type-Options,
- Referrer-Policy,
- Permissions-Policy,
- Cross-Origin-Opener-Policy jika relevan.

Jangan prioritaskan ini di atas masalah performance, tetapi masukkan sebagai optional hardening.

---

# SEO Issues

## Score

```txt
SEO: 92
```

## 1. Missing Meta Description

```txt
Document does not have a meta description
```

### Problem

Halaman tidak memiliki meta description.

### Notes

Jika beberapa halaman adalah dashboard internal/private, SEO bukan prioritas utama. Namun meta description tetap bisa ditambahkan di layout untuk memperbaiki skor dasar SEO.

Untuk halaman publik/customer-facing, SEO lebih penting dan perlu ditangani lebih serius.

### Expected Review

Tolong cek meta tag secara global:

- default meta description,
- title per halaman,
- canonical jika relevan,
- robots tag untuk dashboard private,
- meta description untuk halaman publik/customer-facing,
- Open Graph meta untuk halaman publik jika dibutuhkan.

Contoh meta description global:

```html
<meta name="description" content="WashWallet adalah platform manajemen laundry untuk mengelola outlet, transaksi, layanan, pelanggan, dan operasional bisnis secara digital.">
```

Untuk dashboard private, pertimbangkan:

```html
<meta name="robots" content="noindex, nofollow">
```

---

# Requested Output From AI Model

Tolong hasilkan review dan plan teknis berdasarkan data di atas dengan cakupan seluruh aplikasi WashWallet.

Output yang saya inginkan:

## 1. Root Cause Analysis

Jelaskan kemungkinan akar masalah berdasarkan Lighthouse report dan jelaskan bagian mana yang kemungkinan bersifat global.

## 2. Priority Ranking

Urutkan masalah berdasarkan dampak terbesar ke performance score.

Gunakan format:

```txt
P0 - Critical
P1 - High
P2 - Medium
P3 - Low
```

## 3. Backend Optimization Plan

Fokus pada Laravel/server response secara global:

- route dashboard dan public,
- controller,
- middleware,
- query,
- N+1,
- eager loading,
- pagination,
- caching,
- shared data,
- queue/job,
- config cache,
- route cache,
- view cache,
- OPcache,
- compression,
- server/hosting latency.

## 4. Frontend Optimization Plan

Fokus pada asset dan browser rendering secara global:

- CSS render-blocking,
- font loading,
- JS bundle,
- unused JS,
- unused CSS,
- lazy loading,
- code splitting,
- image optimization,
- animation optimization,
- DOM complexity,
- split bundle per area: dashboard/customer/public jika relevan.

## 5. Accessibility Fix Plan

Fokus pada:

- contrast,
- heading order,
- reusable UI component accessibility.

## 6. SEO Fix Plan

Fokus pada:

- meta description,
- title/meta handling,
- robots tag untuk private dashboard,
- SEO untuk public/customer-facing pages.

## 7. Security Hardening Optional Plan

Fokus pada:

- CSP,
- XFO/frame-ancestors,
- COOP,
- Referrer-Policy,
- Permissions-Policy.

## 8. Step-by-step Implementation Checklist

Berikan checklist teknis yang bisa langsung dikerjakan developer.

## 9. Expected Impact

Untuk setiap rekomendasi, jelaskan perkiraan dampaknya terhadap:

- FCP,
- LCP,
- TBT,
- Speed Index,
- Lighthouse Performance Score.

## 10. Validation Plan

Berikan cara mengukur hasil setelah perbaikan, termasuk:

- menjalankan Lighthouse ulang di beberapa halaman utama,
- membandingkan before/after,
- menggunakan Chrome DevTools Performance,
- mengecek Network tab,
- mengecek Laravel Debugbar/Telescope/log query jika tersedia,
- mengecek Vite bundle analyzer jika tersedia,
- mengecek Core Web Vitals untuk halaman publik jika tersedia.

## 11. Suggested Pages To Test

Tolong sarankan halaman mana saja yang perlu dites ulang, minimal:

- landing/public page,
- login page,
- dashboard owner,
- dashboard cashier,
- outlet list,
- outlet detail,
- transaction/order list,
- customer discovery page,
- customer outlet show page,
- page yang memuat Google Maps,
- page yang memuat Midtrans/payment,
- page yang memuat banyak table/list.