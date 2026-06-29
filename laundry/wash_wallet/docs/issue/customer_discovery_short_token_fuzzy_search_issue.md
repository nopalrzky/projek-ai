# Customer Discovery Short-Token Fuzzy Search Issue

Tanggal debug: 2026-06-07

Dokumen ini mencatat hasil debug lanjutan setelah perbaikan awal fuzzy search discovery. Issue ini fokus pada kasus query pendek atau potongan kata seperti `krin` dan `bsah` yang seharusnya tetap menemukan layanan `Cuci Kering` dan `Cuci Basah`.

## Ringkasan Masalah

Search discovery masih belum tahan terhadap query pendek yang merepresentasikan satu token penting dari nama layanan multi-kata.

Contoh actual:

- Query `krin` tidak menampilkan `Cuci Kering`.
- Query `bsah` tidak menampilkan `Cuci Basah`.
- Query lebih lengkap seperti `cuci krin`, `cuci bsah`, atau `cci bsah` lebih mungkin bekerja.

Secara ekspektasi customer, `krin` cukup jelas mengarah ke token `kering`, dan `bsah` cukup jelas mengarah ke token `basah`. Namun algoritma saat ini menilai query terhadap full service name yang sudah di-normalisasi tanpa spasi, misalnya `krin` dibandingkan dengan `cucikering`, bukan `kering`.

## Reproduksi

Endpoint discovery customer:

```text
GET /mobile/customer/outlets?includeServices=true&isExposure=true&search=krin
GET /mobile/customer/outlets?includeServices=true&isExposure=true&search=bsah
```

Expected:

- `krin` menampilkan service `Cuci Kering` jika service aktif dan outlet exposed.
- `bsah` menampilkan service `Cuci Basah` jika service aktif dan outlet exposed.

Actual:

- `krin` tidak menghasilkan `Cuci Kering`.
- `bsah` tidak menghasilkan `Cuci Basah`.

## Jalur Kode yang Bermasalah

File utama:

- `webapp/wash_wallet_be/app/Services/OutletService.php`

Method terkait:

- `resolveDiscoveryCorrectedQuery`
- `normalizeDiscoveryTerm`
- `scoreDiscoveryCandidate`
- `applyDiscoverySearch`
- `applyDiscoveryServiceQuery`

Alur saat query `krin`:

1. `resolveDiscoveryCorrectedQuery('krin')` dipanggil.
2. Literal pre-check tidak match karena `Cuci Kering` tidak mengandung substring `krin`.
3. Candidate `Cuci Kering` di-normalisasi menjadi `cucikering`.
4. Score dihitung antara `krin` dan `cucikering`.
5. Score hanya `57.14`, di bawah threshold `62.0`.
6. Backend tidak mengembalikan `corrected_query`.
7. Controller tetap memakai search raw `krin`.
8. `applyDiscoverySearch` dan `applyDiscoveryServiceQuery` memakai `LIKE '%krin%'`.
9. `LIKE '%krin%'` tidak match `Cuci Kering`, sehingga service tidak muncul.

Alur `bsah` sama:

1. Candidate `Cuci Basah` di-normalisasi menjadi `cucibasah`.
2. Score antara `bsah` dan `cucibasah` hanya `61.54`.
3. Score ini hampir lolos, tetapi tetap di bawah threshold `62.0`.
4. Karena tidak ada corrected query, backend fallback ke `LIKE '%bsah%'`.
5. `LIKE '%bsah%'` tidak match `Cuci Basah`.

## Bukti Skor Saat Ini

Skor ini dihitung menggunakan pendekatan backend saat ini: normalisasi lower-case + hapus spasi, lalu `max(similar_text, levenshteinScore)`.

| Query | Candidate | Normalized | Score Saat Ini | Status |
|---|---|---:|---:|---|
| `krin` | `Cuci Kering` | `krin` vs `cucikering` | `57.14` | Gagal, di bawah `62.0` |
| `bsah` | `Cuci Basah` | `bsah` vs `cucibasah` | `61.54` | Gagal, di bawah `62.0` |
| `cuci bsah` | `Cuci Basah` | `cucibsah` vs `cucibasah` | `94.12` | Lolos |
| `cci bsah` | `Cuci Basah` | `ccibsah` vs `cucibasah` | `87.50` | Lolos |
| `cuci krin` | `Cuci Kering` | `cucikrin` vs `cucikering` | `88.89` | Lolos |
| `kering` | `Cuci Kering` | `kering` vs `cucikering` | `75.00` | Lolos / literal substring juga match |
| `basah` | `Cuci Basah` | `basah` vs `cucibasah` | `71.43` | Lolos / literal substring juga match |

## Bukti Token-Level

Jika query dibandingkan terhadap token service name, hasilnya jauh lebih sesuai dengan ekspektasi user:

| Query Token | Candidate Token | Score Token-Level |
|---|---|---:|
| `krin` | `kering` | `80.00` |
| `bsah` | `basah` | `88.89` |
| `cci` | `cuci` | `85.71` |
| `krinh` | `kering` | `72.73` |
| `kerin` | `kering` | `90.91` |
| `bas` | `basah` | `75.00` |

Ini menunjukkan masalahnya bukan pada `similar_text`/`levenshtein` semata, tetapi pada unit pembandingnya. Query pendek harus dibandingkan ke token kandidat yang relevan, bukan full phrase `cucikering` atau `cucibasah`.

## Root Cause

Root cause utama:

- `normalizeDiscoveryTerm` menghapus semua spasi dan menjadikan service multi-kata sebagai satu string besar.
- `scoreDiscoveryCandidate` membandingkan query terhadap full normalized candidate.
- Untuk query pendek, prefix `cuci` pada candidate justru menjadi noise dan menurunkan score.
- Threshold global `62.0` membuat `bsah` gagal walaupun hanya hilang satu huruf dari `basah`.
- Setelah correction gagal, backend fallback ke query literal `LIKE`, yang tidak typo-tolerant.

Dengan kata lain, sistem saat ini lebih tahan untuk typo multi-token seperti `cci bsah`, tetapi belum tahan untuk partial-token intent seperti `bsah` atau `krin`.

## Mengapa Menurunkan Threshold Saja Tidak Cukup

Menurunkan threshold dari `62.0` ke sekitar `57.0` memang bisa membuat `krin -> Cuci Kering` lolos. Namun ini berisiko memperlebar hasil untuk query pendek lain yang tidak relevan.

Masalah intinya adalah scoring full phrase:

- `krin` seharusnya dinilai terhadap `kering`, bukan `cucikering`.
- `bsah` seharusnya dinilai terhadap `basah`, bukan `cucibasah`.
- `cci` seharusnya dinilai terhadap `cuci`, bukan seluruh nama service.

Threshold global tetap diperlukan, tetapi harus diterapkan setelah token-level scoring atau char-coverage yang benar.

## Dampak User-Facing

- Customer harus mengetik kata pertama seperti `cuci` agar hasil muncul.
- Query yang secara manusia jelas, seperti `krin` atau `bsah`, dianggap terlalu lemah.
- Search terasa tidak natural untuk mobile karena user sering mengetik kata inti saja.
- Service discovery kurang terasa seperti discovery; user tetap harus tahu ejaan atau struktur nama layanan.

## Rekomendasi Arah Plan

Plan berikutnya sebaiknya fokus pada fuzzy matching berbasis token/service candidate ID, bukan hanya corrected query string.

Rekomendasi teknis:

1. Tambahkan token-level scoring untuk nama layanan.
2. Untuk single-token query, bandingkan query terhadap setiap token candidate dan ambil score terbaik.
3. Untuk multi-token query, map setiap query token ke token candidate terbaik, lalu hitung aggregate score.
4. Pertahankan full-string scoring sebagai fallback, bukan satu-satunya score.
5. Tambahkan char coverage ratio, misalnya berapa banyak karakter query yang muncul berurutan/berdekatan di token candidate.
6. Gunakan threshold dinamis berdasarkan panjang query:
   - token 3 huruf perlu threshold lebih hati-hati.
   - token 4-5 huruf seperti `krin`, `bsah`, `kerin`, `krinh` boleh lolos jika token score tinggi.
7. Jika fuzzy match menemukan service relevan, gunakan service IDs hasil scoring untuk mem-filter outlet/relation, bukan hanya mengganti `search` dengan satu `corrected_query`.
8. `corrected_query` tetap boleh dikirim untuk UI banner, tetapi source of truth hasil search harus service IDs/scores.

## Acceptance Criteria untuk Plan

- Query `krin` menampilkan `Cuci Kering`.
- Query `bsah` menampilkan `Cuci Basah`.
- Query `cci` dapat menampilkan layanan dengan token `Cuci` jika relevan.
- Query `krinh` menampilkan `Cuci Kering`.
- Query `kerin` menampilkan `Cuci Kering`.
- Query `bas` atau `bsah` menampilkan `Cuci Basah`, dengan threshold yang tetap mencegah hasil terlalu melebar.
- Query typo multi-token seperti `cci bsah` tetap bekerja.
- Hasil fuzzy tidak menampilkan service unrelated dari outlet yang sama.
- Sort `relevant` memakai score fuzzy/token jika query search aktif.
- Test regression backend mencakup minimal `krin`, `bsah`, `cci bsah`, `cuci krin`, dan query random yang harus tetap empty.

## Catatan untuk Implementor Plan

Jangan hanya mengganti angka threshold tanpa mengubah unit scoring. Threshold lebih rendah mungkin memperbaiki contoh `krin`, tetapi akan membuat false positive lebih mungkin muncul. Perbaikan yang lebih benar adalah membuat scoring memahami token layanan.
