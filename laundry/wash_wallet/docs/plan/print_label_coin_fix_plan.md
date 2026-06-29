# Implementation Plan: Fix Cetak Label Coin Terpotong tetapi Tidak Tercetak

> Berdasarkan: `docs/issue/print_label_coin_terpotong_tapi_tidak_dicetak_issue.md`
> Scope utama: Backend Laravel + Flutter app `cashier` dan `production`

---

## Instruksi Wajib untuk AI Model

Sebelum menulis kode apapun, baca spec berikut:

- `docs/spec/cubit_spec.md`
- `docs/spec/state_spec.md`
- `docs/spec/remote_datasource_spec.md`
- `docs/spec/repository_spec.md`
- `docs/spec/repository_impl_spec.md`
- `docs/spec/provider_spec.md`
- `docs/spec/usecase_spec.md`

Aturan eksekusi:

1. Jangan ubah flow bisnis utama pada fase awal. Tetap pakai urutan `preview -> konfirmasi -> debit coin -> print`.
2. Jangan langsung menerapkan optimistic print sebagai fix pertama. Bug inti saat ini adalah kontrak response dan error handling.
3. Semua perbaikan Flutter harus diterapkan konsisten di `apps/cashier` dan `apps/production`.
4. Jika memilih memperbaiki kontrak di backend, pastikan tidak merusak consumer lain yang mungkin sudah memakai response camelCase.
5. Tambahkan verifikasi terukur. Fix ini menyentuh transaksi coin, jadi tidak cukup hanya mengandalkan inspeksi UI.

---

## Ringkasan Masalah

Bug yang sedang diperbaiki bukan terutama karena printer lambat atau backend terlalu lama, walaupun timeout tetap mungkin terjadi.

Masalah terkuat dari hasil debug:

1. Backend `PrintController.processPrint()` mengirim `coinDeducted`, `coinSource`, `remainingCoin`.
2. Flutter `PrintRemoteDatasource` membaca `coin_deducted`, `coin_source`, `remaining_coin`.
3. Coin sudah dipotong di `PrintService.processPrint()`.
4. Setelah response sukses diterima, Flutter gagal parse payload.
5. Karena parse gagal, state `PrintLabelReady` tidak pernah muncul.
6. Karena `PrintLabelReady` tidak pernah muncul, `ThermalPrinterService.printLabelFromData(...)` tidak pernah dipanggil.

Kesimpulan: fix prioritas adalah menyamakan kontrak response dan memperkeras error handling sebelum membahas optimistic execution.

---

## Keputusan Implementasi

| Area | Keputusan |
|---|---|
| Strategi fix awal | Pertahankan flow debit dulu lalu print |
| Sumber perubahan kontrak | Utamakan Flutter agar kompatibel terhadap camelCase dan snake_case |
| Perubahan backend | Minimal, hanya bila perlu untuk konsistensi response atau test |
| Error handling | Tangani `success: false`, `403`, `422`, dan payload `data` kosong secara eksplisit |
| Duplikasi app | Semua perubahan datasource/repository/cubit yang relevan harus dicerminkan di `cashier` dan `production` |
| Optimistic print | Dikeluarkan dari fase fix inti, dipindah ke fase lanjutan opsional |

Alasan memilih kompatibilitas di Flutter lebih dulu:

1. Risiko paling kecil untuk consumer lain.
2. Fix bisa langsung menutup mismatch yang sekarang terjadi.
3. Backend tetap bebas mempertahankan response camelCase yang sudah telanjur dipakai endpoint ini.

---

## Scope Fix Inti

Fix inti mencakup:

1. Parsing response `POST /orders/{orderId}/print/receipt`.
2. Parsing response `POST /orders/{orderId}/print/label`.
3. Handling response error yang saat ini bisa jatuh menjadi parsing error generik.
4. Verifikasi bahwa state `PrintReceiptReady` dan `PrintLabelReady` benar-benar tercapai saat debit sukses.
5. Verifikasi bahwa printer hanya dipanggil setelah debit sukses.

Fix inti tidak mencakup:

1. Perubahan arsitektur menjadi print optimistic.
2. Retry background ke backend.
3. Reversal otomatis coin ketika printer gagal.
4. Perubahan besar pada UI modal print.

---

## Fase 1 - Audit dan Normalisasi Kontrak Response

### 1.1 Update parsing print response di Flutter

**Files:**

- `apps/cashier/lib/features/print/data/datasources/print_remote_datasource.dart`
- `apps/production/lib/features/print/data/datasources/print_remote_datasource.dart`

Tambahkan pembacaan yang kompatibel terhadap dua format:

- `coinDeducted` dan `coin_deducted`
- `coinSource` dan `coin_source`
- `remainingCoin` dan `remaining_coin`

Implementasi sebaiknya memakai helper lokal kecil, misalnya pola:

```dart
T readRequired<T>(Map<String, dynamic> data, List<String> keys)
String? readNullableString(Map<String, dynamic> data, List<String> keys)
```

Tujuan:

1. Datasource tidak bergantung pada satu gaya key saja.
2. Endpoint lama dan baru tetap aman.
3. Error parsing jadi lebih jelas jika key benar-benar tidak ada.

### 1.2 Putuskan apakah backend perlu diselaraskan juga

**Files:**

- `webapp/wash_wallet_be/app/Http/Controllers/Api/PrintController.php`

Ada dua opsi:

1. Biarkan backend tetap camelCase, Flutter jadi tolerant reader.
2. Backend mengirim kedua bentuk key sekaligus untuk masa transisi.

Rekomendasi fase awal:

1. Flutter dibuat tolerant reader.
2. Backend tidak perlu diubah dulu kecuali user ingin kontrak API diseragamkan global.

---

## Fase 2 - Hardening Error Handling di Datasource

### 2.1 Validasi `success` dan `data`

**Files:**

- `apps/cashier/lib/features/print/data/datasources/print_remote_datasource.dart`
- `apps/production/lib/features/print/data/datasources/print_remote_datasource.dart`

Sebelum parsing `response.data['data']`, lakukan cek:

1. `response.data` adalah `Map<String, dynamic>`
2. `response.data['success'] == true`
3. `response.data['data']` ada dan bertipe `Map<String, dynamic>`

Jika gagal:

1. Ambil `response.data['message']` jika ada.
2. Lempar exception dengan pesan backend yang benar.
3. Hindari cast `null as int` atau error generik tipe data.

### 2.2 Tangani status 4xx sebagai error bisnis

Karena `Dio` menerima status `< 500`, endpoint `403` dan `422` tidak otomatis gagal di transport layer.

Perubahan yang dibutuhkan:

1. Jika status code bukan 2xx, datasource harus melempar exception berdasarkan body.
2. Jika `success == false`, datasource juga harus melempar exception.

Hasil yang diinginkan:

1. Saldo tidak cukup tetap muncul sebagai pesan saldo tidak cukup.
2. Feature tidak aktif tetap muncul sebagai pesan feature tidak aktif.
3. Error parsing tidak menutupi error bisnis dari backend.

---

## Fase 3 - Rapikan Mapping Repository dan State Trigger

### 3.1 Pastikan repository menerima hasil datasource yang sudah tervalidasi

**Files:**

- `apps/cashier/lib/features/print/data/repositories/print_repository_impl.dart`
- `apps/production/lib/features/print/data/repositories/print_repository_impl.dart`

Repository saat ini cukup tipis, jadi fokusnya:

1. Jangan ubah signature public jika tidak perlu.
2. Pastikan data yang diteruskan ke cubit selalu sudah valid.
3. Pastikan `remaining_coin` hasil repository konsisten walau source owner atau outlet.

### 3.2 Verifikasi cubit tidak perlu redesign

**Files:**

- `apps/cashier/lib/features/print/presentation/bloc/print_cubit.dart`
- `apps/production/lib/features/print/presentation/bloc/print_cubit.dart`

Cubit secara struktur sudah benar:

1. `processLabel()` -> `PrintLabelProcessing`
2. sukses -> `PrintLabelReady`
3. gagal -> `PrintError`

Karena itu fase ini bukan untuk redesign cubit, hanya untuk memastikan state sukses sekarang benar-benar bisa tercapai setelah datasource diperbaiki.

---

## Fase 4 - Test dan Safety Net

### 4.1 Tambahkan unit test untuk parsing response print

Target test:

1. Response camelCase berhasil diparse.
2. Response snake_case berhasil diparse.
3. Response `success: false` melempar error yang memakai message backend.
4. Response tanpa `data` melempar error yang jelas.

Lokasi test mengikuti struktur project masing-masing app. Jika test datasource saat ini belum ada, buat test minimal untuk `PrintRemoteDatasource` atau `PrintRepositoryImpl`.

### 4.2 Tambahkan test backend ringan bila memungkinkan

**Files yang relevan:**

- `webapp/wash_wallet_be/tests/...`

Target minimal:

1. Endpoint `POST /orders/{orderId}/print/label` mengembalikan field yang memang dikontrak.
2. Status `422` untuk saldo tidak cukup tetap mengirim message yang bisa dibaca client.

Jika test backend terlalu mahal untuk fase pertama, minimal dokumentasikan kontrak final yang dipilih.

---

## Fase 5 - Verifikasi Manual End-to-End

### Cashier

1. Buka modal print pada order yang saldo coin-nya cukup.
2. Klik `Cetak Label`.
3. Klik `Konfirmasi Cetak`.
4. Pastikan coin terpotong sekali.
5. Pastikan printer menerima label.
6. Pastikan snackbar sukses muncul.

### Production

1. Ulangi skenario yang sama di app produksi.
2. Pastikan flow dan hasilnya identik.

### Negative cases

1. Saldo coin tidak cukup -> tombol disabled atau backend menolak dengan pesan yang benar.
2. Feature print tidak aktif -> muncul error feature tidak aktif.
3. Printer gagal setelah debit sukses -> coin tetap terpotong, tetapi user mendapat pesan print gagal yang jelas.

### Verifikasi data

1. Tabel `coin_transactions` hanya bertambah satu record per satu konfirmasi sukses.
2. Tidak ada kasus coin terpotong tanpa `PrintLabelReady` pada payload sukses yang valid.

---

## Fase 6 - Hardening Lanjutan Opsional

Fase ini tidak wajib untuk menutup bug inti, tetapi penting jika ingin mengurangi risiko retry ganda.

### 6.1 Idempotency request print

Tambahkan `idempotency_key` per aksi print.

Tujuan:

1. Retry karena timeout tidak memotong coin dua kali.
2. Client bisa mengulang request dengan aman.

### 6.2 Audit optimistic print

Jika nanti ingin benar-benar menjalankan print lebih dulu atau paralel dengan backend, perlu design terpisah karena tradeoff-nya besar:

1. Label bisa tercetak tanpa coin tercatat.
2. Perlu retry sinkronisasi.
3. Perlu state UI tambahan untuk pending sync.
4. Perlu keputusan bisnis apakah coin boleh menyusul setelah label keluar.

Rekomendasi: jangan gabungkan fase ini dengan fix bug inti.

---

## Urutan Implementasi yang Disarankan

1. Perbaiki parsing response print di Flutter `cashier`.
2. Terapkan perubahan yang sama di Flutter `production`.
3. Tambahkan handling `success: false`, status 4xx, dan payload `data` kosong.
4. Verifikasi state `PrintLabelReady` dan `PrintReceiptReady` kembali tercapai.
5. Tambahkan test parsing response.
6. Lakukan verifikasi manual dengan printer fisik.
7. Baru evaluasi kebutuhan idempotency.

---

## Acceptance Criteria

1. `POST /orders/{orderId}/print/label` dengan response camelCase tidak lagi menyebabkan parsing failure di Flutter.
2. Setelah debit coin sukses, `PrintLabelReady` benar-benar ter-emit dan printer label dijalankan.
3. `cashier` dan `production` sama-sama kompatibel terhadap payload response print yang dipakai backend.
4. Response `success: false`, `403`, dan `422` tidak berubah menjadi error parsing generik.
5. User mendapat error bisnis yang jelas saat saldo tidak cukup atau feature tidak aktif.
6. Tidak ada perubahan perilaku bisnis utama di luar area bug ini.

---

## Catatan Eksekusi

Jika saat implementasi ditemukan consumer backend lain yang juga tergantung pada endpoint print ini, jangan langsung mengganti kontrak backend secara breaking. Pertahankan backward compatibility, lalu dokumentasikan kontrak final yang dipilih di issue atau plan lanjutan.
