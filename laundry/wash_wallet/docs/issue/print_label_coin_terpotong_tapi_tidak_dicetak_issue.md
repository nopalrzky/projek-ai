# Cetak Label: Coin Terpotong tetapi Label Tidak Dieksekusi

## Tanggal Debugging
6 Juni 2026

## Gejala
Saat user menekan konfirmasi cetak label, coin berkurang di backend, tetapi printer tidak mencetak label. Dari sisi user, ini terlihat seperti aplikasi sudah memotong coin namun aksi cetak tidak pernah dieksekusi.

## Area yang Dicek
- `apps/cashier/lib/features/print/presentation/widgets/print_modal.dart`
- `apps/cashier/lib/features/print/presentation/bloc/print_cubit.dart`
- `apps/cashier/lib/features/print/data/datasources/print_remote_datasource.dart`
- `apps/production/lib/features/print/data/datasources/print_remote_datasource.dart`
- `packages/wash_wallet_core/lib/src/services/thermal_printer_service.dart`
- `packages/wash_wallet_core/lib/src/network/api/api_endpoints.dart`
- `webapp/wash_wallet_be/routes/api.php`
- `webapp/wash_wallet_be/app/Http/Controllers/Api/PrintController.php`
- `webapp/wash_wallet_be/app/Services/PrintService.php`

## Alur Aktual
1. User membuka modal cetak.
2. Flutter memanggil `GET /orders/{orderId}/print/info` untuk mengambil info order, biaya coin, saldo outlet, dan saldo owner.
3. Tombol cetak label disabled jika `coinInfo.canPrint` false.
4. User klik `Cetak Label`.
5. Aplikasi membuka sheet konfirmasi.
6. User klik `Konfirmasi Cetak`.
7. `PrintCubit.processLabel()` emit `PrintLabelProcessing`.
8. Cubit menunggu `POST /orders/{orderId}/print/label`.
9. Jika usecase sukses, cubit emit `PrintLabelReady`.
10. `BlocListener` baru menjalankan `ThermalPrinterService.printLabelFromData(...)`.

Implikasi penting: printer tidak akan dipanggil sebelum state `PrintLabelReady` muncul.

## Temuan Debug
1. Backend endpoint print terdaftar di `webapp/wash_wallet_be/routes/api.php` dengan pola `orders/{orderId}/print`.
2. Flutter memakai endpoint `/orders/{orderId}/print/label` dari `ApiEndpoints.orderPrintLabel`.
3. Backend `PrintService.processPrint()` melakukan debit coin dulu melalui `deductCoin(...)`, lalu mencatat journal, lalu mengembalikan hasil transaksi.
4. Tidak ada idempotency key atau marker bahwa request print untuk order tertentu sudah pernah diproses.
5. Backend controller `PrintController.processPrint()` membungkus hasil service menjadi response `data` dengan key camelCase: `coinDeducted`, `coinSource`, `remainingCoin`.
6. Flutter datasource membaca response backend dengan key snake_case: `coin_deducted`, `coin_source`, `remaining_coin`.
7. `Controller.successResponse()` tidak melakukan transform key otomatis. Response dikirim apa adanya.
8. Karena mismatch key, skenario yang sangat mungkin terjadi adalah:
Backend sukses memotong coin, response 200 diterima Flutter, Flutter membaca `data['coin_deducted']`, hasilnya `null`, cast `null as int` gagal, repository mengubahnya menjadi failure, cubit emit `PrintError`, bukan `PrintLabelReady`, lalu printer tidak pernah dieksekusi.
9. Datasource print di `apps/production` memiliki pola parsing yang sama, sehingga risiko ini juga berlaku di aplikasi produksi.
10. `Dio` disetel `receiveTimeout` 60 detik. Timeout jaringan setelah transaksi backend commit tetap bisa membuat client tidak masuk state ready, tetapi kode yang paling jelas saat ini adalah mismatch key response.
11. `Dio` juga menerima status `< 500` sebagai response valid. Jika backend mengembalikan 422/403 tanpa `data`, datasource print tetap langsung membaca `response.data['data']`, sehingga error user bisa berubah menjadi parsing error.

## Root Cause Paling Mungkin
Root cause paling kuat adalah kontrak response `POST /orders/{orderId}/print/label` tidak konsisten antara backend dan Flutter.

Backend mengirim camelCase:

```json
{
  "success": true,
  "data": {
    "coinDeducted": 1,
    "coinSource": "outlet",
    "remainingCoin": 99
  }
}
```

Flutter saat ini mengharapkan snake_case:

```json
{
  "success": true,
  "data": {
    "coin_deducted": 1,
    "coin_source": "outlet",
    "remaining_coin": 99
  }
}
```

Akibatnya, coin sudah terpotong di server tetapi client gagal membentuk `PrintCoinInfoModel`, sehingga tidak pernah emit `PrintLabelReady` dan tidak menjalankan printer.

## Risiko Tambahan
1. Jika printer gagal setelah `PrintLabelReady`, coin juga sudah terpotong karena flow saat ini memang debit dulu baru print.
2. Jika user retry setelah kegagalan parsing atau printer, backend akan membuat transaksi coin baru karena tidak ada idempotency.
3. Jika saldo cukup saat preview tetapi berubah sebelum konfirmasi, backend bisa menolak, namun datasource belum menangani `success: false` secara eksplisit.
4. Pendekatan optimistic murni, yaitu print dulu lalu kirim backend, mengurangi risiko "coin terpotong tapi tidak print", tetapi menambah risiko sebaliknya: label tercetak tanpa coin terpotong jika request backend gagal.

## Arah Plan Perbaikan yang Disarankan
1. Perbaiki kontrak response lebih dulu. Opsi A: backend mengirim snake_case untuk `processReceipt` dan `processLabel`, konsisten dengan service dan datasource. Opsi B: Flutter datasource menerima camelCase dan snake_case seperti model preview.
2. Tambahkan handling `success: false` dan error status 4xx di `PrintRemoteDatasource`, jangan langsung cast `response.data['data']`.
3. Tambahkan test kontrak backend atau test datasource untuk memastikan `POST print/label` bisa diparse dan menghasilkan `PrintLabelReady`.
4. Pertimbangkan idempotency key untuk request print agar retry tidak menggandakan potongan coin.
5. Jika ingin memakai pendekatan optimistic, jangan hanya print dan fire-and-forget debit. Rancang state yang eksplisit: validasi coin dari preview tetap wajib, saat konfirmasi print bisa dijalankan lebih dulu atau paralel, backend perlu menerima idempotency key, UI harus menampilkan status "print terkirim, sinkronisasi coin pending/gagal", dan perlu mekanisme retry sinkronisasi backend agar audit coin tidak hilang.
6. Alternatif yang lebih aman untuk tahap pertama: tetap debit dulu baru print, tetapi perbaiki parsing response dan error handling. Ini paling kecil risikonya karena menjaga business rule saat ini.

## Catatan Verifikasi Manual
Untuk memastikan root cause di device:
1. Klik `Konfirmasi Cetak Label`.
2. Cek log API response `POST /orders/{orderId}/print/label`.
3. Pastikan apakah response `data` berisi `coinDeducted` atau `coin_deducted`.
4. Cek log Flutter setelah response. Jika muncul error seperti `type 'Null' is not a subtype of type 'int'`, maka mismatch key terkonfirmasi.
5. Cek tabel `coin_transactions` untuk memastikan transaksi `print_label` tercatat walau printer tidak mencetak.

## Status
Debug selesai. Belum ada perubahan behavior aplikasi. Dokumen ini menjadi acuan untuk plan perbaikan berikutnya.
