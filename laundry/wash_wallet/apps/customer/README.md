# Wash Wallet Customer

## API Base URL

Aplikasi membaca backend dari `API_BASE_URL`.

Jika tidak diisi, default yang dipakai:

```text
http://10.0.2.2:8000/api
```

Catatan:

- `10.0.2.2` cocok untuk Android emulator.
- Untuk device fisik, pakai IP laptop/PC yang bisa diakses dari phone.
- Karena backend masih memakai HTTP, aplikasi Android ini sudah diizinkan untuk cleartext traffic.

## Menjalankan di Device Fisik

Jika backend Laravel jalan di komputer yang sama dan device terhubung lewat USB, kamu bisa pakai:

```bash
adb reverse tcp:8000 tcp:8000
flutter run --dart-define=API_BASE_URL=http://127.0.0.1:8000/api
```

Kalau pakai Wi-Fi, gunakan IP LAN komputer:

```bash
flutter run --dart-define=API_BASE_URL=http://<IP-LAN-KOMPUTER>:8000/api
```
