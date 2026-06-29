# Test Print Struk Tidak Keluar

## Tanggal Debugging
30 Mei 2026

## Gejala
Saat user membuka Pengaturan Printer di aplikasi kasir lalu menekan tombol **Test Print Struk**, printer tidak mencetak apa pun. Dari sisi UI, kondisi ini bisa terlihat seperti tombol tidak bekerja karena tidak ada feedback sukses/gagal yang cukup jelas ketika pengiriman data ke printer gagal.

## Area yang Dicek
- `apps/cashier/lib/features/setting/presentation/screens/printer_setting_screen.dart`
- `apps/cashier/lib/features/setting/presentation/bloc/printer_setting_cubit.dart`
- `packages/wash_wallet_core/lib/src/services/thermal_printer_service.dart`
- `apps/cashier/android/app/src/main/AndroidManifest.xml`
- Package plugin `print_bluetooth_thermal` versi `1.1.9`

## Alur Saat Tombol Diklik
1. Tombol **Test Print Struk** hanya muncul saat device dianggap terhubung.
2. Tombol memanggil `PrinterSettingCubit.testPrint()`.
3. Cubit memanggil `ThermalPrinterService.testPrint()`.
4. Service menjalankan `_ensureConnected()`.
5. Service membuat ESC/POS bytes test print.
6. Service mengirim bytes ke printer melalui `PrintBluetoothThermal.writeBytes(bytes)`.

## Temuan
1. `PrintBluetoothThermal.writeBytes(...)` mengembalikan `Future<bool>`.
2. Kode sebelumnya tidak membaca return value dari `writeBytes`.
3. Jika plugin mengembalikan `false`, misalnya output stream printer null, printer disconnect, printer mati, Bluetooth off, atau printer tidak menerima data, service tetap selesai tanpa error.
4. Karena tidak ada error, UI tidak menampilkan pesan gagal. Ini membuat kasus gagal kirim terlihat seperti "klik test print tapi tidak keluar".
5. Saat cubit emit `PrinterSettingError`, screen bisa jatuh ke tampilan default karena state loaded tidak dikembalikan. Ini membuat debugging di device lebih membingungkan.
6. Permission Bluetooth sudah ada di Android manifest kasir:
   - `BLUETOOTH`
   - `BLUETOOTH_ADMIN`
   - `BLUETOOTH_CONNECT`
   - `BLUETOOTH_SCAN`

## Root Cause Paling Mungkin
Root cause di sisi aplikasi adalah kegagalan pengiriman bytes ke printer tidak diperlakukan sebagai error. Plugin sudah memberi sinyal gagal lewat return value `false`, tetapi aplikasi sebelumnya mengabaikan nilai tersebut.

Kondisi fisik yang masih perlu dicek di device:
- Printer thermal menyala.
- Printer sudah paired di pengaturan Bluetooth HP.
- Printer yang dipilih di aplikasi sama dengan printer fisik.
- Kertas tersedia dan printer tidak dalam kondisi error.
- Bluetooth HP aktif.
- Printer tidak sedang tersambung atau dipakai aplikasi lain.

## Perubahan yang Dilakukan
1. Menambahkan pengecekan `PrintBluetoothThermal.bluetoothEnabled` sebelum print.
2. Menambahkan helper `_writeBytesOrThrow(...)` di `ThermalPrinterService`.
3. Semua flow print sekarang mengecek hasil `writeBytes`:
   - test print
   - cetak struk
   - cetak label
4. Jika `writeBytes` mengembalikan `false`, aplikasi sekarang melempar error dengan pesan yang bisa ditampilkan di snackbar.
5. Menambahkan state `PrinterSettingTestPrintSuccess`.
6. UI sekarang menampilkan snackbar saat test print berhasil dikirim.
7. Jika test print gagal, UI menampilkan snackbar error dan mengembalikan state printer sebelumnya agar daftar printer tidak hilang.

## Hasil yang Diharapkan Setelah Fix
- Jika printer menerima data, muncul snackbar: `Test print berhasil dikirim ke printer.`
- Jika printer tidak menerima data, muncul pesan error yang lebih spesifik.
- Daftar printer tetap tampil setelah error, sehingga user bisa disconnect/connect ulang tanpa keluar dari halaman.

## Catatan Verifikasi Manual
Perlu dites langsung di device fisik karena plugin Bluetooth thermal membutuhkan hardware printer dan koneksi Bluetooth nyata. Setelah rebuild app:
1. Buka Pengaturan Printer.
2. Pastikan printer muncul di daftar paired device.
3. Tekan **Hubungkan**.
4. Tekan **Test Print Struk**.
5. Jika snackbar sukses muncul tetapi printer tetap diam, cek kondisi fisik printer dan pairing Bluetooth.

## Verifikasi Kode
- `dart format packages\wash_wallet_core\lib\src\services\thermal_printer_service.dart apps\cashier\lib\features\setting\presentation\bloc\printer_setting_cubit.dart apps\cashier\lib\features\setting\presentation\bloc\printer_setting_state.dart apps\cashier\lib\features\setting\presentation\screens\printer_setting_screen.dart` berhasil.
- `flutter analyze packages\wash_wallet_core\lib\src\services\thermal_printer_service.dart apps\cashier\lib\features\setting\presentation\bloc\printer_setting_cubit.dart apps\cashier\lib\features\setting\presentation\bloc\printer_setting_state.dart apps\cashier\lib\features\setting\presentation\screens\printer_setting_screen.dart` menghasilkan `No issues found`.
- `flutter test apps\cashier\test\features\print` menghasilkan `All tests passed`.
