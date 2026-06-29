# Lighthouse Performance Global Optimization Plan

## Summary

Plan ini menargetkan optimasi performa global Laravel/Inertia untuk memperbaiki Lighthouse score, terutama pada halaman dashboard dan contoh URL `/dashboard/outlets/{id}/activate`.

Catatan eksekusi:
- Jangan revert perubahan parsial yang sudah ada di working tree kecuali user meminta eksplisit.
- Jika ada file sudah berubah karena eksekusi sebelumnya, lanjutkan dari kondisi sekarang dan validasi dampaknya.
- Fokus utama adalah performa tanpa mengubah behavior bisnis.

Priority:
- P0 - Critical: turunkan document latency/TTFB dan hilangkan render-blocking font eksternal ganda.
- P1 - High: kecilkan initial JS dashboard, hapus import ikon/barrel berat, lazy-load chart/map/table-heavy UI.
- P2 - Medium: optimasi CSS, image delivery, notification polling, dan animasi.
- P3 - Low: accessibility minor, SEO meta, dan security headers non-breaking.

## Root Cause Analysis

### Backend Global

`HandleInertiaRequests` membagikan `auth.user` memakai `UserResource` penuh pada setiap request web. Resource ini memanggil role checks dan beberapa computed fields yang tidak selalu dibutuhkan oleh shell UI.

Shared prop `notifications.unread_count` menjalankan query unread notification count pada setiap Inertia request sebelum HTML dikirim. Ini menambah TTFB untuk semua halaman private.

### Dashboard Backend

`DashboardService` menjalankan beberapa aggregate dashboard terpisah. `assetSummary()` melakukan loop per akun level 2 lalu query children dan journal totals per akun, sehingga mudah menjadi query berlebih. `recentCoinTransactions()` memakai `User::find(...)->outlet_ids`, yang bisa memicu query tambahan untuk outlet IDs.

### List Pages

Beberapa halaman list memuat filter options dalam jumlah penuh bersamaan dengan data utama:
- `OrderController@index`: outlets, customers, employees.
- `CustomerController@index`: outlets.
- `OutletController@index`: memakai semua outlet untuk membangun province/city/district filter.

Payload filter seharusnya minimal, misalnya `{ id, name, code }`, bukan resource penuh dengan relasi atau field detail.

### Outlet Pages

`OutletController@show` memuat banyak relasi sekaligus dan langsung membangun overview/chart payload. Halaman detail outlet jadi berat meskipun user belum membuka semua tab.

`OutletController@activatePage` melakukan query katalog fitur dan trial eligibility sebelum render. Optimasi di sini perlu hati-hati karena terkait bisnis aktivasi dan trial.

### Frontend Global

`AuthenticatedLayout` memuat `framer-motion` dan menjalankan animasi route transition untuk semua halaman dashboard.

Komponen dashboard/list seperti `PageHeader`, `PageStats`, `DataView`, filters, modal, dan banyak page memakai `framer-motion`. Animasi sebaiknya opt-in untuk interaksi penting, bukan default untuk semua render.

### Bundle Issues

Build sebelumnya menunjukkan indikasi chunk besar:
- `app-*.js` sekitar 486 KB.
- `app-*.css` sekitar 210 KB.
- `PageStats-*.js` sekitar 537 KB.
- `CartesianChart-*.js` sekitar 356 KB.

`StatCard` memakai `import * as LucideIcons from "lucide-react"`, sehingga chunk `PageStats` menarik terlalu banyak icon.

Import barrel `@/Components/Page` berisiko menarik `PageStats` saat halaman hanya butuh `PageHeader`.

Recharts, Google Maps, date picker, dropzone, dan table-heavy components harus hanya dimuat pada halaman yang benar-benar memakainya.

### Render Blocking Fonts

Root layout memuat Bunny Figtree dari `resources/views/app.blade.php`, sementara `resources/css/app.css` juga mengimpor Google Fonts Inter/Manrope. Ini menyebabkan request font eksternal ganda yang render-blocking di Slow 4G.

### SEO, Accessibility, Security

Root layout perlu default meta description. Halaman dashboard/auth private sebaiknya `robots noindex,nofollow`.

Security headers bisa ditambahkan non-breaking:
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `X-Frame-Options`
- CSP report-only lebih dulu karena Inertia/Ziggy/Vite bisa memakai inline script/style.

## Implementation Plan

### P0 - Backend Shared Props

1. Ubah `HandleInertiaRequests` agar shared `auth.user` hanya berisi field shell UI:
   - `id`
   - `name`
   - `username`
   - `email`
   - `avatar`
   - `status`
   - `coinBalance`
   - `walletBalance`
   - `rewardBalance`
   - `roles`
   - `isOwner`

2. Jangan pakai `UserResource` untuk shared global props. Full user resource tetap boleh dipakai pada controller page-specific seperti profile/dashboard bila memang dibutuhkan.

3. Cache `notifications.unread_count` per user selama 30-60 detik:
   - cache key: `users:{id}:notifications:unread_count`
   - TTL rekomendasi: 45 detik.

4. Alternatif yang lebih agresif: hilangkan unread count dari initial props dan biarkan `NotificationBell` fetch setelah idle. Ini perlu penyesuaian UI agar badge awal default `0`.

### P0 - Font Cleanup

1. Pilih satu strategi font.

2. Opsi aman tanpa network:
   - hapus Bunny font link dari `resources/views/app.blade.php`.
   - hapus `@import` Google Fonts dari `resources/css/app.css`.
   - gunakan system font stack di CSS global.

3. Opsi ideal jangka menengah:
   - self-host Inter WOFF2 di `public/fonts`.
   - tambahkan `@font-face` dengan `font-display: swap`.
   - preload hanya font utama di root layout.

4. Validasi tidak ada request ke:
   - `fonts.bunny.net`
   - `fonts.googleapis.com`
   - `fonts.gstatic.com`

### P0 - Dashboard Backend Aggregates

1. Tambahkan cache pendek untuk dashboard:
   - quick metrics: 60 detik.
   - asset summary: 180-300 detik.
   - recent coin transactions: 60 detik.

2. Refactor `DashboardService::assetSummary()`:
   - ambil semua akun asset level 2 sekali.
   - ambil semua children level 3 sekali.
   - ambil journal totals dengan satu grouped query.
   - hitung balance di memory.

3. Hindari `User::find($ownerId)->outlet_ids` bila `Auth::user()` sudah tersedia.

4. Jangan cache terlalu lama untuk data accounting/order agar dashboard tidak terasa stale.

### P0 - List Payload Reduction

1. `OrderController@index`:
   - tetap kirim orders paginated seperti sekarang.
   - ubah filter options menjadi payload minimal:
     - outlets: `{ id, name, code }`
     - customers: `{ id, name, phone }`
     - employees: `{ id, name, outlet: { id, name } }`

2. `CustomerController@index`:
   - outlets filter cukup `{ id, name, code }`.

3. `OutletController@index`:
   - untuk province/city/district filter, jangan resolve `OutletResource`.
   - gunakan data minimal dari collection atau query distinct.
   - target jangka menengah: query distinct per field agar tidak memuat semua outlet model penuh.

4. Jika filter options masih besar, buat endpoint lookup async/searchable:
   - `/dashboard/lookups/outlets`
   - `/dashboard/lookups/customers`
   - `/dashboard/lookups/employees`

### P1 - Frontend Bundle Cleanup

1. Ubah `StatCard`:
   - hapus `import * as LucideIcons`.
   - pakai explicit icon map untuk icon yang benar-benar dipakai stats.
   - fallback ke `Activity`.

2. Ubah import barrel:
   - halaman yang hanya butuh header harus import `@/Components/Page/PageHeader`.
   - halaman yang butuh stats bisa import `@/Components/Page/PageStats`.
   - hindari `import { PageHeader } from "@/Components/Page"` di page yang tidak perlu `PageStats`.

3. Kurangi `framer-motion` global:
   - hapus dari `AuthenticatedLayout`.
   - ganti route transition global dengan static container.
   - biarkan motion hanya pada komponen yang benar-benar butuh.

4. `PageStats` dan `PageHeader`:
   - default animate bisa diganti CSS transition/animation ringan.
   - jika tetap memakai framer-motion, pastikan chunk tidak masuk halaman yang tidak memakai stats/header.

5. `DataView` dan filters:
   - audit apakah `framer-motion`, `react-day-picker`, dan filter panel selalu masuk initial chunk.
   - lazy-load filter panel/date-range bila filter dibuka.

### P1 - Lazy Load Chart-Heavy Sections

1. Dashboard `/dashboard`:
   - lazy-load `RevenueOvertime`.
   - render lightweight skeleton placeholder dengan tinggi stabil.

2. Outlet detail:
   - lazy-load `OutletOverview` karena mengandung Recharts.
   - aktifkan lazy panel mounting pada `Tabs` untuk mencegah semua tab render saat initial load.

3. Pastikan skeleton punya dimensi stabil untuk menghindari CLS.

4. Validasi Recharts/CartesianChart tidak masuk initial chunk halaman yang tidak menampilkan chart.

### P2 - Notification Polling

1. `NotificationBell`:
   - fetch unread count setelah `requestIdleCallback` atau timeout pendek.
   - polling interval naik dari 30 detik ke 60 detik.
   - fetch recent notifications hanya saat dropdown dibuka.

2. Setelah mark all read, invalidasi cache unread count bila backend cache dipakai.

3. Jika cache invalidation belum ada, TTL pendek 30-60 detik sudah cukup sebagai langkah awal.

### P2 - CSS Pruning

1. Audit `resources/css/app.css`.

2. Pisahkan style marketing/interaktif/glow yang hanya dipakai public feature pages ke CSS entry khusus jika memungkinkan.

3. Pertahankan global CSS untuk:
   - theme variables.
   - base reset.
   - common utilities.
   - dashboard primitives yang benar-benar dipakai luas.

4. Jangan refactor besar sebelum build analyzer tersedia.

### P2 - Image Delivery

1. Header/sidebar logo:
   - buat versi kecil optimized WebP/PNG.
   - tambahkan `width` dan `height` pada `<img>`.

2. Non-critical images:
   - tambahkan `loading="lazy"`.
   - pakai thumbnail pada attachment/list image.

3. Validasi CLS tetap stabil.

### P3 - Accessibility

1. Naikkan kontras `--color-text-tertiary` atau gunakan `text-secondary` untuk metadata penting.

2. Audit heading order:
   - satu `h1` per page.
   - section utama `h2`.
   - subsection `h3`.

3. Jangan ubah visual scale besar-besaran; cukup semantic heading bila memungkinkan.

### P3 - SEO

1. Tambahkan default meta description di root layout.

2. Tambahkan `robots noindex,nofollow` untuk private dashboard/auth pages melalui layout atau shared Meta component.

3. Public pages tetap indexable kecuali ada alasan khusus.

### P3 - Security Headers

1. Tambahkan middleware security headers non-breaking:
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=(self), payment=(self)`
   - `X-Frame-Options: SAMEORIGIN`

2. CSP mulai dari `Content-Security-Policy-Report-Only`.

3. Setelah report aman, baru rencanakan enforce CSP.

## Validation Plan

### Static Validation

Run:

```bash
php -l app/Http/Middleware/HandleInertiaRequests.php
php -l app/Http/Middleware/SecurityHeaders.php
php -l app/Services/DashboardService.php
npm run build
php artisan test
```

Jika `php artisan test` terlalu luas atau gagal karena fixture lama, minimal jalankan subset controller/service terkait dan catat failure yang bukan akibat perubahan ini.

### Build Validation

1. Catat ukuran sebelum/sesudah:
   - `app-*.js`
   - `app-*.css`
   - `PageStats-*.js`
   - `CartesianChart-*.js`
   - `AuthenticatedLayout-*.js`
   - `DataView-*.js`

2. Pastikan setelah wildcard Lucide dihapus, `PageStats` tidak lagi menarik semua icon.

3. Tambahkan analyzer bila diperlukan:
   - `rollup-plugin-visualizer`
   - script `npm run build:analyze`

### Browser/Lighthouse Validation

Test minimal:
- public landing `/`
- login
- owner dashboard `/dashboard`
- cashier dashboard jika ada
- outlet list
- outlet detail
- outlet activate
- order list
- customer list/discovery
- customer outlet show
- halaman Google Maps
- halaman Midtrans/topup/payment
- halaman table/list besar

Untuk tiap halaman catat:
- Performance score
- FCP
- LCP
- TBT
- CLS
- Speed Index
- TTFB
- JS transfer and unused JS
- CSS transfer and unused CSS

### Network Validation

Pastikan tidak ada request font eksternal:
- `fonts.bunny.net`
- `fonts.googleapis.com`
- `fonts.gstatic.com`

Pastikan chart/map/date/dropzone chunks hanya dimuat saat halaman/komponen terkait dipakai.

### Backend Validation

Gunakan Telescope/Debugbar/query log untuk mencatat:
- query count.
- total query time.
- duplicate queries.
- N+1.
- slow queries.

Fokus halaman:
- `/dashboard`
- `/dashboard/outlets`
- `/dashboard/outlets/{id}`
- `/dashboard/outlets/{id}/activate`
- `/dashboard/orders`
- `/dashboard/customers`

## Expected Impact

P0 backend shared props dan cache:
- TTFB turun karena global props tidak lagi serialize full user resource dan unread count tidak query setiap request.
- Target document latency dashboard umum dari sekitar 1489 ms menuju di bawah 800 ms, bergantung DB/cache production.

Font cleanup:
- FCP/LCP membaik karena dua external font request hilang.
- Estimasi dampak Slow 4G: 300-700 ms.

JS bundle/lazy chart/motion cleanup:
- TBT turun karena route transition global, wildcard icon import, dan chart chunk initial berkurang.
- Target TBT dari sekitar 470 ms menuju 200-300 ms.

CSS pruning:
- render-blocking CSS turun setelah style public/marketing dipisah.

Image optimization:
- dampak kecil-menengah, terutama public/topup/attachment/list image.
- CLS lebih stabil dengan explicit dimensions.

Accessibility/SEO/security:
- skor A11y/SEO naik tanpa mengorbankan performance.

## Execution Checklist

1. Re-read files yang akan diubah dan cek working tree.
2. Jangan revert unrelated changes.
3. Implement P0 shared props and notification cache.
4. Implement P0 font cleanup.
5. Implement P0 dashboard aggregate cache/refactor.
6. Implement P0 list payload reduction.
7. Implement P1 StatCard explicit icon map.
8. Implement P1 direct Page imports.
9. Implement P1 remove global `framer-motion` from `AuthenticatedLayout`.
10. Implement P1 lazy chart/dashboard/outlet overview.
11. Implement P2 notification idle polling.
12. Implement P2 CSS/image optimizations where low risk.
13. Implement P3 meta/security headers.
14. Run validation commands.
15. Record before/after bundle and Lighthouse metrics.

## Assumptions

- Fokus perbaikan adalah seluruh aplikasi web Laravel/Inertia, bukan hanya satu URL contoh.
- Perubahan tidak mengubah behavior bisnis.
- Cache pendek boleh dipakai untuk dashboard/read-only metrics.
- CSP dibuat report-only dulu agar tidak mematahkan Inertia/Ziggy/Vite.
- Existing uncommitted changes dari user atau agent lain harus dipertahankan.
