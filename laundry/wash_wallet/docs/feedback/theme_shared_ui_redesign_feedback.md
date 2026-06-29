# Feedback Review: Theme Shared UI Redesign Plan

Tanggal review: 2026-06-22

Dokumen yang direview: `docs/plan/theme_shared_ui_redesign_plan.md`

Status review: plan sudah cukup kuat sebagai arah redesign, tetapi belum sepenuhnya decision-complete untuk dieksekusi tanpa revisi. Ada beberapa konflik scope, instruksi yang tidak sinkron dengan kondisi source terkini, dan detail implementasi yang masih terlalu longgar.

## Ringkasan

Plan sudah menangkap arah utama dari context dengan baik: clean operasional, backward-compatible shared UI, font consistency, token foundation, dan benchmark lintas cashier/production/customer. Struktur fase juga masuk akal: foundation token dulu, lalu komponen shared, lalu cleanup terbatas di benchmark screen.

Masalah utamanya bukan di arah desain, tetapi di presisi eksekusi. Beberapa bagian plan bisa membuat implementer salah langkah, terutama pada scope app-level changes, strategi font asset, density token yang belum dipakai, dan verifikasi yang belum cukup menangkap dampak ke aplikasi.

Saya juga menjalankan:

```powershell
flutter analyze packages\wash_wallet_ui
```

Hasil: `No issues found`. Ini hanya memvalidasi package UI saat ini, belum memvalidasi app customer/production/cashier.

## Findings

### 1. Scope plan kontradiktif antara larangan edit app dan fase app-level cleanup

Severity: High

Referensi:

- `docs/plan/theme_shared_ui_redesign_plan.md:47`
- `docs/plan/theme_shared_ui_redesign_plan.md:471`
- `docs/plan/theme_shared_ui_redesign_plan.md:487`

Plan melarang perubahan di luar `packages/wash_wallet_ui` kecuali font pubspec registration, tetapi Fase 3 meminta cleanup screen benchmark di `apps/cashier`, `apps/production`, dan `apps/customer`, lalu Fase 3.2 meminta fix encoding di production home screen.

Dampaknya, eksekutor bisa menafsirkan scope secara berbeda: ada yang hanya mengubah package UI, ada yang mengubah app screen juga. Ini berisiko membuat implementasi tidak konsisten atau melewatkan polish penting.

Saran revisi:

- Ubah batasan scope menjadi eksplisit:
  - Phase 1-2: hanya `packages/wash_wallet_ui` plus font assets/pubspec app.
  - Phase 3: boleh menyentuh screen benchmark yang sudah disebut, tetapi hanya untuk token migration dan polish non-logic.
- Hapus kalimat yang menyatakan jangan mengubah file di luar package UI, atau ubah menjadi "jangan mengubah file app selain daftar benchmark dan font registration".

### 2. Strategi font asset belum cukup aman sebagai instruksi eksekusi

Severity: High

Referensi:

- `docs/plan/theme_shared_ui_redesign_plan.md:33`
- `docs/plan/theme_shared_ui_redesign_plan.md:119`
- `docs/plan/theme_shared_ui_redesign_plan.md:123`

Plan meminta menyalin blok `fonts:` dari cashier ke customer dan production, tetapi instruksi ini belum cukup jika asset font belum ada di masing-masing app. Flutter membaca path font relatif terhadap package/app yang mendeklarasikan font. Jadi deklarasi `assets/fonts/Satoshi-Regular.otf` di `apps/customer/pubspec.yaml` hanya valid jika file tersebut memang ada di `apps/customer/assets/fonts/`.

Pada working tree saat review, folder `apps/customer/assets/fonts` dan `apps/production/assets/fonts` sudah ada dan berisi font Satoshi. Namun plan tidak mencatat apakah asset harus dicopy, dipindahkan ke shared package, atau dibiarkan terduplikasi per app.

Dampaknya, jika plan dijalankan di branch lain tanpa asset font yang sudah dicopy, build app bisa gagal karena asset path tidak ditemukan.

Saran revisi:

- Tambahkan langkah eksplisit:
  - pastikan file font Satoshi tersedia di `apps/customer/assets/fonts/` dan `apps/production/assets/fonts/`, atau
  - pindahkan font ke `packages/wash_wallet_ui` dan deklarasikan font dari package tersebut dengan strategi Flutter package font yang benar.
- Pilih satu strategi. Untuk eksekusi cepat, duplikasi asset per app paling sederhana. Untuk maintenance jangka panjang, shared package lebih rapi.
- Tambahkan verifikasi app-level, bukan hanya package UI analyze.

### 3. `AppDensity` ditambahkan sebagai token, tetapi tidak ada mekanisme konsumsi

Severity: Medium

Referensi:

- `docs/plan/theme_shared_ui_redesign_plan.md:215`
- `docs/plan/theme_shared_ui_redesign_plan.md:223`
- `docs/plan/theme_shared_ui_redesign_plan.md:242`

Plan menambahkan `AppDensityMode` dan static helper `AppDensity`, tetapi tidak menentukan bagaimana app memilih mode density dan bagaimana komponen shared membacanya. Tanpa integrasi ke `ThemeExtension`, constructor parameter, atau app-level configuration, token ini mudah menjadi unused code.

Dampaknya, masalah density cashier/production vs customer tidak benar-benar terselesaikan. Eksekutor bisa membuat class baru, mengekspornya, tetapi komponen tetap memakai ukuran lama.

Saran revisi:

- Pilih salah satu pendekatan:
  - Minimal: jangan implement `AppDensity` dulu; jadikan hanya guidance dokumentasi.
  - Explicit API: tambahkan parameter density pada komponen yang perlu, dengan default `standard`.
  - Theme-based: buat `AppDensityExtension` dan akses via `context.density`, lalu set mode per app/theme.
- Jika target v1 adalah visual polish cepat, lebih aman menunda `AppDensity` sampai ada use case jelas.

### 4. Beberapa instruksi "tambah" tidak sinkron dengan API/source terkini

Severity: Medium

Referensi:

- `docs/plan/theme_shared_ui_redesign_plan.md:340`
- `docs/plan/theme_shared_ui_redesign_plan.md:354`
- `docs/plan/theme_shared_ui_redesign_plan.md:355`

Plan meminta menambah `AppButtonVariant.tonal`, `isLoading`, `AppCard.info`, dan `isSelected`. Dari source yang dicek saat review, beberapa item ini sudah ada di working tree:

- `AppButtonVariant` sudah memuat `tonal`.
- `AppButton` sudah punya constructor `tonal`.
- `AppButton` sudah punya `isLoading`.
- `AppCardVariant` sudah memuat `info`.
- `AppCard` sudah punya `isSelected`.
- `AppElevation` dan `AppDensity` juga sudah ada dan diekspor.

Dampaknya, plan menjadi tidak jelas apakah ini masih task baru, task perbaikan implementasi existing, atau task verifikasi. Eksekutor bisa membuat duplikasi, mengubah API yang sudah ada, atau membuang waktu.

Saran revisi:

- Update plan menjadi delta dari kondisi source terbaru:
  - "Verifikasi/sempurnakan `tonal`" bukan "tambah variant tonal".
  - "Pastikan loading state preserve width" bukan "tambah isLoading".
  - "Ubah behavior `AppCard.info` agar memakai info surface/border" bukan "tambah info".
- Tambahkan catatan source state terkini sebelum fase eksekusi.

### 5. Soft badge color mapping masih underspecified

Severity: Medium

Referensi:

- `docs/plan/theme_shared_ui_redesign_plan.md:378`
- `docs/plan/theme_shared_ui_redesign_plan.md:383`
- `docs/plan/theme_shared_ui_redesign_plan.md:384`

Plan meminta soft badge memakai `colorSurface` dan `colorDark`, tetapi tidak mendefinisikan mapping per variant. Untuk semantic colors saat ini, nama getter berbeda-beda: `successSurface`, `successDark`, `warningSurface`, `warningDark`, `errorSurface`, `errorDark`, `infoSurface`, `infoDark`, dan primary tidak punya `primaryDark`/`primarySurface` dengan pola yang sama untuk semua mode.

Dampaknya, implementer harus membuat keputusan sendiri untuk default/neutral/primary/danger, terutama di dark mode. Ini rawan inkonsisten.

Saran revisi:

- Tambahkan tabel mapping eksplisit:
  - primary soft: bg `primarySurface`, fg `primaryDark` atau `primary`
  - success soft: bg `successSurface`, fg `successDark`
  - warning soft: bg `warningSurface`, fg `warningDark`
  - danger/error soft: bg `errorSurface`, fg `errorDark`
  - info soft: bg `infoSurface`, fg `infoDark`
  - neutral soft: bg `surfaceVariant`, fg `textSecondary` atau `neutralForeground`
- Tambahkan aturan dark mode jika foreground `*Dark` tidak cocok di dark surface.

### 6. `AppHeader` parameter `elevation` bertipe shadow list rawan membingungkan

Severity: Low

Referensi:

- `docs/plan/theme_shared_ui_redesign_plan.md:317`
- `docs/plan/theme_shared_ui_redesign_plan.md:320`

Plan mengusulkan parameter `elevation` dengan type `List<BoxShadow>`. Dalam Flutter, istilah `elevation` biasanya numeric (`double`) dan dipakai Material untuk z-depth. Menggunakan nama `elevation` untuk list shadow bisa membingungkan.

Dampaknya kecil, tetapi API shared UI akan dipakai lintas app. Nama yang kurang presisi akan menyebar.

Saran revisi:

- Gunakan nama `boxShadow`, `shadows`, atau `headerShadow`.
- Jika ingin mengikuti Material convention, gunakan `double elevation` dan map internally ke shadow token, tetapi ini lebih kompleks.

### 7. Verification belum cukup menangkap risiko app-level

Severity: Medium

Referensi:

- `docs/plan/theme_shared_ui_redesign_plan.md:526`
- `docs/plan/theme_shared_ui_redesign_plan.md:558`
- `docs/plan/theme_shared_ui_redesign_plan.md:560`

Plan hanya mewajibkan `flutter analyze packages/wash_wallet_ui` per fase. Itu tidak cukup untuk menangkap:

- asset font missing di customer/production,
- breaking usage di app setelah enum/constructor berubah,
- pubspec indentation/asset registration issue,
- app-level cleanup yang dilakukan di benchmark screen.

Dampaknya, package UI bisa lolos analyze, tetapi app target tetap gagal build/analyze.

Saran revisi:

- Setelah Phase 1 font registration, jalankan:
  - `flutter analyze apps/customer`
  - `flutter analyze apps/production`
  - `flutter analyze apps/cashier`
- Setelah API komponen berubah, minimal jalankan analyze untuk ketiga app atau `melos run analyze` jika feasible.
- Tambahkan `dart format` atau `dart format --set-exit-if-changed` untuk file Dart yang berubah.

### 8. Command examples belum cocok dengan environment PowerShell/repo convention

Severity: Low

Referensi:

- `docs/plan/theme_shared_ui_redesign_plan.md:250`
- `docs/plan/theme_shared_ui_redesign_plan.md:253`
- `docs/plan/theme_shared_ui_redesign_plan.md:558`

Plan memakai `grep` dan `head`, sementara environment project ini PowerShell dan repo workflow sebelumnya lebih cocok memakai `rg`. Ini bukan masalah desain, tetapi bisa membuat eksekutor salah command.

Saran revisi:

- Ganti contoh command menjadi:

```powershell
rg -n "\.withOpacity\(" packages\wash_wallet_ui\lib
rg -n "AppCard\." apps
rg -n "AppButton\." apps
rg -n "AppTextField\." apps
```

## Catatan Positif

- Plan menjaga backward compatibility sebagai prinsip utama.
- Urutan fase cukup benar: token dulu, komponen shared, lalu benchmark app.
- Area prioritas komponen sudah sesuai dampak aktual: layout/header, card, button, field, badge/chip, bottom bar, modal state.
- Plan tidak melebar ke route/domain/state management.
- Checklist visual manual sudah berguna untuk sign-off awal.

## Rekomendasi Revisi Singkat

Sebelum plan dipakai untuk eksekusi final, buat revisi v1.1 dengan perubahan berikut:

1. Sinkronkan scope: izinkan app benchmark changes secara eksplisit atau hapus Phase 3.
2. Kunci strategi font asset: duplicate per app atau shared package font, jangan hanya "copy pubspec block".
3. Putuskan nasib `AppDensity`: integrasikan benar atau keluarkan dari v1.
4. Update task yang sudah ada di source menjadi task verifikasi/penyempurnaan.
5. Lengkapi mapping soft badge per variant, termasuk dark mode.
6. Rename `AppHeader.elevation` menjadi `boxShadow`/`shadows` jika memakai `List<BoxShadow>`.
7. Tambahkan analyze app-level dan formatting command.
8. Ganti command sample `grep/head` menjadi `rg`/PowerShell-compatible commands.

## Kesimpulan

Plan layak dilanjutkan setelah revisi kecil-menengah. Jangan langsung dipakai sebagai spec eksekusi final karena masih ada konflik scope dan beberapa instruksi yang out-of-date terhadap source terkini. Bagian paling penting untuk dikunci adalah scope app-level, strategi font asset, dan cara density/token baru benar-benar dipakai oleh komponen.
