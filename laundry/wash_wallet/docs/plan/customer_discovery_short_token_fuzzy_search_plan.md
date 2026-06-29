# Fix: Customer Discovery Short-Token Fuzzy Search

**Tanggal plan:** 2026-06-07
**Berdasarkan issue:** [customer_discovery_short_token_fuzzy_search_issue.md](file:///C:/Bimo/Project/wash_wallet/docs/issue/customer_discovery_short_token_fuzzy_search_issue.md)
**Referensi plan sebelumnya:** [fix_customer_discovery_fuzzy_search_plan.md](file:///C:/Bimo/Project/wash_wallet/docs/plan/fix_customer_discovery_fuzzy_search_plan.md)

---

## Background

Plan sebelumnya (`fix_customer_discovery_fuzzy_search_plan.md`) sudah menangani:
- Eager-load service difilter oleh search (`$includeServiceSearch = true`)
- Literal pre-check dipersempit ke `name` saja
- Stale-response guard di Cubit
- Sort widget cleanup
- `hasReachedMax` fix

Issue **baru ini** adalah lanjutan yang lebih dalam: query **single short-token** seperti `krin` dan `bsah` masih tidak menghasilkan `Cuci Kering` dan `Cuci Basah`, meski perbaikan sebelumnya sudah diterapkan.

### Mengapa terjadi

Algoritma scoring saat ini di `scoreDiscoveryCandidate` membandingkan:
- Input: `krin` (normalized dari query `krin`)
- Candidate: `cucikering` (normalized dari `Cuci Kering` — spasi dihapus)

Hasilnya:
- `similar_text("krin", "cucikering")` → **57.14%**
- `levenshtein("krin", "cucikering")` → score **55.56%**
- `max(57.14, 55.56)` = **57.14** → **gagal** (threshold 62.0)

Seharusnya `krin` dibandingkan ke token `kering` saja → **80.00%** → lolos.

---

## Scope Perubahan

Hanya satu file backend yang perlu dimodifikasi:

- **[MODIFY]** `webapp/wash_wallet_be/app/Services/OutletService.php`

Tidak ada perubahan frontend, database migration, atau API contract baru.

---

## Proposed Changes

### [MODIFY] [OutletService.php](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Services/OutletService.php)

---

#### Perubahan 1 — `normalizeDiscoveryTerm`: Tambahkan parameter `$keepSpaces`

**Lokasi: ~line 2449–2456**

Saat ini method ini selalu menghapus spasi, menghasilkan `cucikering`. Tambahkan parameter `$keepSpaces` agar method bisa dipakai dua cara:

```diff
- private function normalizeDiscoveryTerm(string $value): string
- {
-     $normalized = Str::lower(trim($value));
-     $normalized = preg_replace('/[^a-z0-9\s]/', ' ', $normalized) ?? '';
-     $normalized = preg_replace('/\s+/', ' ', trim($normalized)) ?? '';
-
-     return str_replace(' ', '', $normalized);
- }

+ private function normalizeDiscoveryTerm(string $value, bool $keepSpaces = false): string
+ {
+     $normalized = Str::lower(trim($value));
+     $normalized = preg_replace('/[^a-z0-9\s]/', ' ', $normalized) ?? '';
+     $normalized = preg_replace('/\s+/', ' ', trim($normalized)) ?? '';
+
+     return $keepSpaces ? $normalized : str_replace(' ', '', $normalized);
+ }
```

**Mengapa:** Method dengan `$keepSpaces = true` menghasilkan `cuci kering` (dengan spasi) sehingga bisa di-`explode` menjadi token array `['cuci', 'kering']`. Backward compatible karena default tetap `false`.

---

#### Perubahan 2 — Tambah private helper `computePairScore`

Ekstrak logika pair-score yang ada di `scoreDiscoveryCandidate` ke method tersendiri agar bisa di-reuse oleh token-level scoring:

```php
/**
 * Hitung score similarity antara dua string normalized (tanpa spasi).
 */
private function computePairScore(string $a, string $b): float
{
    if ($a === '' || $b === '') {
        return 0.0;
    }

    similar_text($a, $b, $similarPercent);
    $maxLen = max(strlen($a), strlen($b));
    $levenshteinScore = $maxLen > 0
        ? (1 - levenshtein($a, $b) / $maxLen) * 100
        : 0.0;

    return max((float) $similarPercent, (float) $levenshteinScore);
}
```

---

#### Perubahan 3 — Tambah private helper `computeTokenLevelScore`

```php
/**
 * Bandingkan setiap token query ke setiap token kandidat, ambil score terbaik per pasangan.
 *
 * Strategi:
 * - Untuk setiap query token, cari candidate token dengan score tertinggi.
 * - Hitung weighted average berdasarkan panjang token (token lebih panjang = bobot lebih besar).
 *
 * Contoh:
 *   query tokens    = ['krin']
 *   candidate tokens = ['cuci', 'kering']
 *   best match untuk 'krin' → 'kering' → score 80.00
 *   result = 80.00
 */
private function computeTokenLevelScore(array $queryTokens, array $candidateTokens): float
{
    $totalWeight  = 0.0;
    $weightedScore = 0.0;

    foreach ($queryTokens as $qToken) {
        $qToken = (string) $qToken;
        if ($qToken === '') {
            continue;
        }

        $bestTokenScore = 0.0;
        foreach ($candidateTokens as $cToken) {
            $cToken = (string) $cToken;
            if ($cToken === '') {
                continue;
            }
            $pairScore = $this->computePairScore($qToken, $cToken);
            if ($pairScore > $bestTokenScore) {
                $bestTokenScore = $pairScore;
            }
        }

        // Bobot berdasarkan panjang token — token sangat pendek (< 3 huruf) diberi bobot lebih kecil
        $weight = max(1.0, (float) strlen($qToken));
        $weightedScore += $bestTokenScore * $weight;
        $totalWeight   += $weight;
    }

    return $totalWeight > 0 ? $weightedScore / $totalWeight : 0.0;
}
```

---

#### Perubahan 4 — `scoreDiscoveryCandidate`: Integrasikan token-level scoring

**Lokasi: ~line 2458–2472**

Refactor untuk memanggil `computePairScore` (existing behavior, diekstrak) dan `computeTokenLevelScore` (baru), lalu ambil nilai tertinggi:

```diff
  private function scoreDiscoveryCandidate(string $normalizedSearch, string $candidate): float
  {
      $normalizedCandidate = $this->normalizeDiscoveryTerm($candidate);
      if ($normalizedCandidate === '') {
          return 0.0;
      }

-     similar_text($normalizedSearch, $normalizedCandidate, $similarPercent);
-     $maxLen = max(strlen($normalizedSearch), strlen($normalizedCandidate));
-     $levenshteinScore = $maxLen > 0
-         ? (1 - levenshtein($normalizedSearch, $normalizedCandidate) / $maxLen) * 100
-         : 0.0;
-
-     return max((float) $similarPercent, (float) $levenshteinScore);

+     // 1. Full-string score (existing behavior)
+     $fullScore = $this->computePairScore($normalizedSearch, $normalizedCandidate);
+
+     // 2. Token-level score: bandingkan query token ke setiap token kandidat
+     //    normalizeDiscoveryTerm dengan $keepSpaces=true menghasilkan 'cuci kering'
+     //    sehingga bisa di-explode menjadi ['cuci', 'kering']
+     $queryTokens     = array_filter(explode(' ', $this->normalizeDiscoveryTerm($normalizedSearch, true)));
+     $candidateTokens = array_filter(explode(' ', $this->normalizeDiscoveryTerm($candidate, true)));
+
+     $tokenScore = 0.0;
+     if (!empty($queryTokens) && !empty($candidateTokens)) {
+         $tokenScore = $this->computeTokenLevelScore(
+             array_values($queryTokens),
+             array_values($candidateTokens)
+         );
+     }
+
+     return max($fullScore, $tokenScore);
  }
```

> [!NOTE]
> `normalizedSearch` yang masuk ke method ini sudah merupakan string tanpa spasi (hasil `normalizeDiscoveryTerm($rawSearch)` dari caller). Agar bisa di-tokenize ulang, kita normalisasi dari string kandidat asli dengan `$keepSpaces = true`. Untuk query single-word seperti `krin`, token-nya tetap satu `['krin']` — tidak ada spasi — sehingga tokenize query via `explode` langsung dari `$normalizedSearch` sudah benar.

---

#### Perubahan 5 — `resolveDiscoveryCorrectedQuery`: Dynamic threshold

**Lokasi: ~line 244**

Ganti threshold flat `62.0` dengan threshold dinamis berbasis panjang query:

```diff
- if ($bestCandidate === null || $bestScore < 62.0) {
-     return null;
- }

+ // Threshold dinamis berdasarkan panjang query normalized
+ // Query pendek lebih mungkin menjadi false-positive; namun threshold dipilih
+ // berdasarkan bukti empiris dari tabel skor di issue document.
+ $queryLen = strlen($normalizedSearch);
+ $dynamicThreshold = match (true) {
+     $queryLen <= 3 => 75.0,  // sangat ketat: 'cci' perlu score >=75 untuk lolos
+     $queryLen <= 5 => 65.0,  // 'krin', 'bsah', 'kerin', 'krinh' perlu >=65
+     default        => 62.0,  // threshold existing untuk query 6+ karakter
+ };
+
+ if ($bestCandidate === null || $bestScore < $dynamicThreshold) {
+     return null;
+ }
```

**Tabel validasi threshold:**

| Query | Len | Threshold | Score (token-level) | Hasil |
|---|---|---|---|---|
| `krin` | 4 | 65.0 | 80.00 | ✅ Lolos |
| `bsah` | 4 | 65.0 | 88.89 | ✅ Lolos |
| `cci` | 3 | 75.0 | 85.71 | ✅ Lolos |
| `bas` | 3 | 75.0 | 75.00 | ✅ Pas threshold |
| `kerin` | 5 | 65.0 | 90.91 | ✅ Lolos |
| `krinh` | 5 | 65.0 | 72.73 | ✅ Lolos |
| `cuci bsah` | 8 | 62.0 | 94.12 (full) | ✅ Lolos |
| `cci krinh` | 7 | 62.0 | 87.50 (full) | ✅ Lolos |
| `kering` | 6 | 62.0 | 75.00 (full/literal) | ✅ Lolos / pre-check juga match |
| `abc` | 3 | 75.0 | ~20–30 | ❌ Tidak lolos |
| `xyz` | 3 | 75.0 | ~0–15 | ❌ Tidak lolos |

---

## Alur Setelah Perbaikan

**Untuk query `krin`:**
```
1. resolveDiscoveryCorrectedQuery('krin') dipanggil
2. Literal pre-check: 'krin' tidak ada di nama service → lanjut fuzzy
3. Ambil candidates limit(250): ['Cuci Basah', 'Cuci Kering', ...]
4. scoreDiscoveryCandidate('krin', 'Cuci Kering'):
   - fullScore('krin', 'cucikering') = 57.14
   - tokenScore(['krin'], ['cuci', 'kering']):
       → computePairScore('krin', 'cuci')   = 44.44
       → computePairScore('krin', 'kering') = 80.00  ← best
       → weighted avg = 80.00
   - max(57.14, 80.00) = 80.00  ✅
5. bestScore = 80.00, dynamicThreshold = 65.0 (len=4)
6. 80.00 >= 65.0 → corrected_query = 'Cuci Kering'
7. Controller: $filters['search'] = 'Cuci Kering'
8. applyDiscoveryServiceQuery: LIKE '%Cuci Kering%' → match!
9. Hasil: Cuci Kering muncul ✅
```

**Untuk query `bsah`:**
```
1. resolveDiscoveryCorrectedQuery('bsah') dipanggil
2. Literal pre-check: 'bsah' tidak ada di nama service → lanjut fuzzy
3. scoreDiscoveryCandidate('bsah', 'Cuci Basah'):
   - fullScore('bsah', 'cucibasah') = 61.54  ← sebelumnya gagal (< 62)
   - tokenScore(['bsah'], ['cuci', 'basah']):
       → computePairScore('bsah', 'cuci') = ~30
       → computePairScore('bsah', 'basah') = 88.89  ← best
       → weighted avg = 88.89
   - max(61.54, 88.89) = 88.89  ✅
4. bestScore = 88.89, dynamicThreshold = 65.0 (len=4)
5. 88.89 >= 65.0 → corrected_query = 'Cuci Basah'
6. Hasil: Cuci Basah muncul ✅
```

---

## Acceptance Criteria

- [ ] Query `krin` → menampilkan service `Cuci Kering`
- [ ] Query `bsah` → menampilkan service `Cuci Basah`
- [ ] Query `cci` → menampilkan service dengan token `Cuci`
- [ ] Query `kerin` → menampilkan `Cuci Kering`
- [ ] Query `krinh` → menampilkan `Cuci Kering`
- [ ] Query `bas` → kemungkinan menampilkan `Cuci Basah` (score pas threshold)
- [ ] Query `cuci bsah` → menampilkan `Cuci Basah` (tidak regresi)
- [ ] Query `cci krinh` → menampilkan `Cuci Kering` (tidak regresi)
- [ ] Query random tidak relevan (`abcd`, `xyz`) → tidak ada false positive
- [ ] Query exact `Cuci Kering` → pre-check match, tidak masuk fuzzy loop (performa aman)
- [ ] Query `kering` → literal LIKE match, pre-check match, tidak masuk fuzzy loop

---

## Checklist Implementasi

- [ ] `normalizeDiscoveryTerm`: tambah parameter `bool $keepSpaces = false`
- [ ] Tambah private method `computePairScore(string $a, string $b): float`
- [ ] Tambah private method `computeTokenLevelScore(array $queryTokens, array $candidateTokens): float`
- [ ] `scoreDiscoveryCandidate`: refactor menggunakan `computePairScore` + `computeTokenLevelScore`
- [ ] `resolveDiscoveryCorrectedQuery`: ganti threshold flat `62.0` dengan dynamic threshold
- [ ] Logic review: semua acceptance criteria dicek secara manual

---

## Catatan Arsitektur

> [!NOTE]
> Plan ini hanya menyentuh **3 method yang ada** (`normalizeDiscoveryTerm`, `scoreDiscoveryCandidate`, `resolveDiscoveryCorrectedQuery`) dan menambahkan **2 private helper baru** (`computePairScore`, `computeTokenLevelScore`). Tidak ada perubahan pada `applyDiscoverySearch`, `applyDiscoveryServiceQuery`, atau `customerDiscoveryRelations`.

> [!IMPORTANT]
> Method `levenshtein()` PHP memiliki batas panjang string **255 karakter**. Service name normal jauh di bawah itu. Namun jika ada service name sangat panjang, `levenshtein()` akan menghasilkan warning. Implementor boleh menambahkan guard `strlen($a) <= 255 && strlen($b) <= 255` sebelum pemanggilan `levenshtein`.

> [!TIP]
> Untuk iterasi berikutnya yang lebih canggih: pertimbangkan **MySQL FULLTEXT index** (`MATCH ... AGAINST`) pada kolom `name` di tabel `laundry_services`. Ini menggantikan seluruh PHP loop candidate scan tanpa perlu migrasi schema berarti. Namun untuk iterasi ini, pendekatan PHP token scoring sudah cukup dan tidak memerlukan perubahan database.
