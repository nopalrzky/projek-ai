# User Need: Komponen Reusable Label untuk Frontend

## 1. Latar Belakang

Saat ini frontend Wash Wallet sudah memiliki beberapa komponen reusable di `resources/js/Components`, seperti `Badge`, `Button`, `Card`, `Input`, dan komponen UI lainnya. Namun belum ada komponen khusus `Label` yang dapat dipakai secara konsisten untuk menampilkan teks label pada form, field metadata, filter, tabel, panel ringkasan, dan area UI lain yang membutuhkan penanda teks singkat.

Kebutuhan ini dibuat sebagai acuan bagi AI model lain untuk menyusun implementation plan pembuatan komponen baru `Label`. Dokumen ini bukan implementation plan dan tidak meminta implementasi langsung. Fokus dokumen ini adalah menjelaskan kebutuhan, batasan, perilaku, dan acceptance criteria agar plan yang dibuat tetap konsisten dengan pola codebase.

## 2. Ringkasan Kondisi Codebase Saat Ini

### Sudah Ada

1. Folder komponen reusable berada di `resources/js/Components`.
2. Beberapa komponen menggunakan pola folder per komponen, misalnya:
   - `resources/js/Components/Badge/Badge.tsx`
   - `resources/js/Components/Badge/types.ts`
   - `resources/js/Components/Badge/index.ts`
   - `resources/js/Components/Button/Button.tsx`
   - `resources/js/Components/Button/types.ts`
   - `resources/js/Components/Button/index.ts`
3. Utility class merger tersedia melalui `cn` dari `@/lib/utils`.
4. Komponen existing memakai TypeScript dan menerima `className` untuk override styling.
5. Komponen `Badge` sudah tersedia untuk status, tag, count, dan indikator visual singkat.
6. Komponen input tertentu sudah memiliki prop `label`, tetapi label tersebut masih terikat pada implementasi input masing-masing.

### Gap yang Relevan

1. Belum ada komponen `Label` yang berdiri sendiri sebagai primitive UI reusable.
2. Tampilan label di banyak halaman masih berpotensi dibuat dengan class Tailwind langsung dan tidak seragam.
3. Belum ada satu kontrak prop yang konsisten untuk kebutuhan label seperti required marker, optional text, helper suffix, ikon, ukuran, tone, dan semantic element.
4. Belum ada batasan eksplisit antara penggunaan `Label` dan `Badge`, sehingga plan implementasi perlu membedakan keduanya dengan jelas.

## 3. Tujuan

Tujuan utama kebutuhan ini adalah:

1. Menyediakan acuan untuk membuat komponen baru `Label` di `resources/js/Components/Label`.
2. Menyeragamkan tampilan label teks di seluruh frontend.
3. Membuat label dapat digunakan di form, filter, metadata, detail panel, dan header kecil tanpa harus menulis class Tailwind berulang.
4. Menjaga aksesibilitas label, terutama untuk relasi label dengan input melalui `htmlFor`.
5. Mencegah penggunaan `Badge` untuk kebutuhan label teks biasa yang tidak merepresentasikan status atau tag.
6. Memberikan batas kebutuhan yang cukup jelas agar AI model lain dapat menyusun implementation plan tanpa melakukan perubahan di luar scope.

## 4. Aktor

1. Developer frontend yang membutuhkan komponen label reusable.
2. AI model lain yang akan membuat implementation plan.
3. Maintainer UI yang ingin menjaga konsistensi styling antar halaman.
4. User akhir secara tidak langsung, karena label yang konsisten membuat form dan informasi lebih mudah dipahami.

## 5. Scope Kebutuhan

### In Scope

1. Pembuatan komponen reusable `Label` di bawah `resources/js/Components/Label`.
2. Definisi prop TypeScript untuk variasi label yang umum dipakai.
3. Export komponen melalui `resources/js/Components/Label/index.ts`.
4. Dukungan penggunaan sebagai label form dengan `htmlFor`.
5. Dukungan penggunaan sebagai teks label non-form melalui semantic element yang sesuai.
6. Dukungan ukuran, tone, required marker, optional text, helper text singkat, ikon kiri/kanan, dan `className`.
7. Penentuan prinsip kapan menggunakan `Label` dan kapan tetap menggunakan `Badge`.
8. Acceptance criteria untuk validasi plan dan implementasi berikutnya.

### Out of Scope

1. Tidak membuat implementation plan di dokumen ini.
2. Tidak mengimplementasikan komponen `Label` dalam task ini.
3. Tidak mengubah seluruh halaman existing untuk memakai `Label`.
4. Tidak mengganti komponen `Badge`.
5. Tidak mengubah kontrak komponen `Input` existing kecuali nanti diputuskan pada implementation plan terpisah.
6. Tidak menambah dependency UI baru.
7. Tidak membuat dokumentasi visual seperti Storybook kecuali nanti diputuskan dalam plan terpisah.

## 6. Prinsip Dasar Kebutuhan

1. `Label` adalah primitive teks, bukan status badge.
2. `Label` harus ringan, mudah dikomposisi, dan tidak memiliki state internal yang kompleks.
3. Styling harus konsisten dengan token warna dan pola Tailwind yang sudah digunakan di codebase.
4. Komponen harus tetap dapat dioverride melalui `className`.
5. Komponen harus aman digunakan di form dan non-form.
6. Komponen harus menjaga aksesibilitas dasar, terutama penggunaan elemen `label` dan atribut `htmlFor`.
7. Komponen tidak boleh memaksa layout tertentu yang membuatnya sulit dipakai di grid, form, tabel, atau panel ringkas.
8. Komponen tidak boleh menggantikan heading, paragraph panjang, placeholder, error message, atau badge status.

## 7. Definisi Komponen

### Label

`Label` adalah komponen UI reusable untuk menampilkan teks pendek yang menjelaskan field, nilai, grup informasi, filter, atau kontrol UI.

Contoh penggunaan yang diharapkan:

1. Label field form seperti `Nama Outlet`, `Nomor Telepon`, atau `Tanggal Pickup`.
2. Label metadata seperti `Status Aktivasi`, `Owner`, atau `Outlet`.
3. Label filter seperti `Periode`, `Cabang`, atau `Metode Pembayaran`.
4. Label pada panel ringkasan seperti `Total Order`, `Saldo Wallet`, atau `Pendapatan Hari Ini`.

### Bukan Label

`Label` tidak ditujukan untuk:

1. Status visual seperti `Aktif`, `Pending`, `Berhasil`, atau `Ditolak`; gunakan `Badge`.
2. Tag atau kategori yang berbentuk chip; gunakan `Badge` atau komponen tag lain jika tersedia.
3. Pesan error form; gunakan komponen atau pola error message existing.
4. Deskripsi panjang; gunakan elemen teks biasa atau komponen typography jika tersedia.
5. Tombol aksi; gunakan `Button`.

## 8. User Need Fungsional

### FR-01 Komponen Label Tersedia di Folder Components

1. AI model yang membuat plan harus mengarahkan pembuatan komponen di `resources/js/Components/Label`.
2. Struktur file yang direncanakan harus mengikuti pola komponen existing, minimal mempertimbangkan:
   - `Label.tsx`
   - `types.ts`
   - `index.ts`
3. Export harus memungkinkan import dengan pola `import { Label } from "@/Components/Label";`.

### FR-02 Label Mendukung Penggunaan Form

1. `Label` harus dapat dirender sebagai elemen `label`.
2. `Label` harus mendukung prop `htmlFor` agar dapat terhubung dengan input.
3. Saat `htmlFor` diberikan, interaksi klik label harus diarahkan ke input terkait sesuai perilaku HTML standar.
4. Label form harus dapat menampilkan marker required dengan cara yang jelas dan konsisten.

### FR-03 Label Mendukung Penggunaan Non-Form

1. `Label` harus dapat digunakan untuk metadata atau teks penanda non-form.
2. Plan harus mempertimbangkan semantic element selain `label`, misalnya `span`, `p`, atau elemen lain yang aman.
3. Penggunaan non-form tidak boleh menghasilkan atribut form yang tidak relevan.

### FR-04 Label Memiliki Variasi Ukuran

1. `Label` harus mendukung beberapa ukuran agar cocok di form, tabel, panel, dan card.
2. Ukuran minimal yang perlu dipertimbangkan adalah `sm`, `md`, dan `lg`.
3. Ukuran default harus cocok untuk form standar di dashboard.
4. Perubahan ukuran harus mengatur font size, line height, dan jarak ikon secara konsisten.

### FR-05 Label Memiliki Tone atau Variant

1. `Label` harus mendukung tone visual untuk kebutuhan informasi ringan.
2. Tone minimal yang perlu dipertimbangkan:
   - `default`
   - `muted`
   - `primary`
   - `success`
   - `warning`
   - `danger`
   - `info`
3. Tone tidak boleh membuat `Label` terlihat seperti status badge.
4. Tone harus memakai token warna yang sudah tersedia di codebase.

### FR-06 Label Mendukung Required dan Optional Indicator

1. `Label` harus dapat menampilkan indikator field wajib.
2. `Label` harus dapat menampilkan indikator optional jika diperlukan.
3. Required marker harus dapat dibaca oleh user dan tidak hanya bergantung pada warna.
4. Optional indicator harus tampil sebagai teks ringan, misalnya `Opsional`, tanpa mengganggu label utama.
5. Required dan optional tidak boleh aktif bersamaan tanpa aturan prioritas yang jelas.

### FR-07 Label Mendukung Helper Suffix Singkat

1. `Label` dapat mendukung teks tambahan pendek di sisi label, misalnya `Maks. 50 karakter` atau `Opsional`.
2. Helper suffix harus berbeda dari error message atau deskripsi panjang.
3. Helper suffix harus tetap ringkas dan tidak menyebabkan layout pecah di mobile.

### FR-08 Label Mendukung Ikon

1. `Label` harus dapat menerima ikon kiri dan/atau ikon kanan.
2. Ikon harus dirender dengan ukuran yang seimbang terhadap ukuran label.
3. Ikon tidak boleh wajib.
4. Komponen tidak perlu menentukan daftar ikon sendiri; caller dapat mengirim React node.

### FR-09 Label Dapat Dikustomisasi dengan className

1. `Label` harus menerima `className`.
2. `className` harus digabung dengan class bawaan menggunakan utility `cn` dari `@/lib/utils`.
3. Override class harus tetap memungkinkan tanpa menghilangkan default yang penting untuk aksesibilitas.

### FR-10 Label Harus Type Safe

1. Prop `Label` harus didefinisikan di `types.ts` atau tempat konsisten lain sesuai pola komponen existing.
2. Type harus memperjelas nilai yang valid untuk size, tone, weight, dan semantic element.
3. Props native HTML yang relevan harus tetap dapat diteruskan ke elemen yang dirender.
4. Type tidak boleh terlalu longgar sampai membuat penggunaan keliru sulit terdeteksi.

### FR-11 Label Tidak Mengganggu Komponen Input Existing

1. Pembuatan `Label` tidak otomatis mengubah semua `Input` existing.
2. Integrasi ke komponen input existing dapat dibahas pada plan terpisah jika diperlukan.
3. Jika implementation plan mengusulkan integrasi ke input existing, plan harus memisahkan tahap pembuatan komponen dari tahap migrasi penggunaan.

### FR-12 Label Memiliki Dokumentasi Penggunaan Minimal

1. Plan harus mempertimbangkan adanya contoh penggunaan minimal di komentar, dokumentasi kecil, atau referensi internal jika pola repo mendukung.
2. Dokumentasi minimal harus menjelaskan kapan memakai `Label` dan kapan memakai `Badge`.
3. Dokumentasi tidak boleh menjadi pengganti acceptance criteria.

## 9. Aturan Bisnis dan Teknis

1. Komponen `Label` harus dibuat di `resources/js/Components/Label`.
2. Komponen harus ditulis dalam TypeScript dan React.
3. Komponen harus menggunakan pola export yang konsisten dengan komponen existing.
4. Komponen harus menggunakan `cn` dari `@/lib/utils` untuk merge class.
5. Komponen tidak boleh bergantung pada state global, Inertia, route helper, API, atau data backend.
6. Komponen tidak boleh menambah dependency baru untuk kebutuhan dasar label.
7. Komponen harus dapat digunakan di halaman dashboard dan halaman publik.
8. Komponen harus tetap dapat dirender di server-side build/Vite tanpa akses ke browser API.
9. Styling harus berbasis class Tailwind dan token CSS yang sudah ada.
10. Komponen tidak boleh memakai animasi kompleks.
11. Komponen tidak boleh mengganti perilaku native elemen `label`.
12. Komponen harus tetap readable pada light mode dan dark mode jika token dark mode sudah digunakan di area terkait.

## 10. UX yang Diharapkan

### Form Field

Developer dapat menggunakan `Label` untuk memberi nama field secara jelas, menampilkan required marker, dan menghubungkan label ke input dengan `htmlFor`.

### Metadata

Developer dapat menggunakan `Label` untuk menandai nilai informasi seperti owner, outlet, tanggal, atau ringkasan angka tanpa membuat teks terlihat seperti badge status.

### Filter dan Toolbar

Developer dapat menggunakan `Label` untuk menandai kontrol filter dengan ukuran ringkas dan warna muted.

### Panel Ringkasan

Developer dapat menggunakan `Label` untuk caption kecil di atas atau di samping angka ringkasan, misalnya `Total Order` atau `Pendapatan`.

## 11. Acceptance Criteria

1. Ada user need yang jelas untuk pembuatan komponen `Label` di `resources/js/Components/Label`.
2. Kebutuhan membedakan `Label` dari `Badge` secara eksplisit.
3. Kebutuhan menjelaskan dukungan form label melalui `htmlFor`.
4. Kebutuhan menjelaskan dukungan non-form label.
5. Kebutuhan mencakup size, tone, required marker, optional indicator, helper suffix, ikon, dan `className`.
6. Kebutuhan mencakup ekspektasi type safety untuk props TypeScript.
7. Kebutuhan mengarahkan struktur export yang konsisten dengan komponen existing.
8. Kebutuhan tidak meminta implementasi langsung pada task ini.
9. Kebutuhan tidak meminta migrasi seluruh halaman existing.
10. Kebutuhan cukup spesifik agar AI model lain dapat membuat implementation plan tanpa menebak scope utama.

## 12. Catatan untuk Implementation Plan

1. Implementation plan harus dibuat terpisah dari dokumen ini.
2. Plan harus mulai dari audit pola komponen existing di `resources/js/Components`.
3. Plan harus menentukan kontrak prop final sebelum implementasi.
4. Plan harus mempertimbangkan apakah `Label` perlu polymorphic element atau cukup prop semantic sederhana.
5. Plan harus memisahkan pembuatan komponen dari migrasi pemakaian di halaman existing.
6. Plan harus menyertakan validasi minimal seperti TypeScript check, lint/build yang relevan, atau pemeriksaan compile sesuai tooling repo.
7. Plan tidak boleh menghapus atau mengganti `Badge`.
8. Plan tidak boleh menambah dependency baru tanpa alasan kuat.

## 13. Pertanyaan Terbuka

1. Apakah `Label` perlu mendukung polymorphic `as` prop, atau cukup mendukung mode form dan non-form?
2. Apakah label form existing di komponen `Input` akan dimigrasikan ke `Label` pada tahap berikutnya?
3. Apakah repo membutuhkan dokumentasi visual untuk komponen ini, atau cukup contoh penggunaan di kode?
4. Apakah required marker perlu format khusus selain tanda bintang dan teks aksesibilitas?

## 14. Rekomendasi Awal

Rekomendasi awal untuk plan berikutnya adalah membuat `Label` sebagai komponen kecil, type safe, dan composable di `resources/js/Components/Label`, mengikuti pola `Badge` dan `Button` untuk pemisahan `Label.tsx`, `types.ts`, dan `index.ts`. Komponen sebaiknya fokus pada teks label, aksesibilitas form, dan variasi visual ringan, tanpa mengambil peran `Badge` sebagai indikator status.
