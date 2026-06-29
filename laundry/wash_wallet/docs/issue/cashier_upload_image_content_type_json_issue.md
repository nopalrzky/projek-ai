# Cashier Upload Image Content-Type JSON Issue

Tanggal debug: 2026-06-11

Dokumen ini mencatat hasil debug untuk beberapa form upload image/file di aplikasi cashier yang sudah mengirim body `FormData`, tetapi header request masih terbaca sebagai `Content-Type: application/json`.

## Gejala

Log Flutter dari endpoint timbang order:

```text
REQUEST
Method: POST
URL: http://10.0.2.2:8000/api/mobile/cashier/orders/590/weigh
Headers: {
  Accept: application/json,
  Content-Type: application/json,
  Authorization: Bearer [redacted]
}
Body: Instance of 'FormData'

ERROR
Status: null
URL: http://10.0.2.2:8000/api/mobile/cashier/orders/590/weigh
Message: null
```

Ekspektasi:

- Saat form mengirim image/file, request memakai `multipart/form-data`.
- Backend menerima field file seperti `photo`, `attachment`, atau `avatar`.
- Header request tidak lagi mengirim `application/json` untuk body `FormData`.

Aktual:

- Body request sudah berupa `FormData`.
- Header masih `Content-Type: application/json`.
- Request upload gagal sebelum mendapatkan status response yang valid.

## Area yang Dicek

- `packages/wash_wallet_core/lib/src/network/dio/dio_config.dart`
- `packages/wash_wallet_core/lib/src/network/interceptors/api_interceptor.dart`
- `apps/cashier/lib/features/order/data/datasources/order_remote_datasource.dart`
- `apps/cashier/lib/features/deposit/data/datasources/deposit_remote_datasource.dart`
- `apps/cashier/lib/features/expense/data/datasources/expense_remote_datasource.dart`
- `apps/cashier/lib/features/employee/data/datasources/employee_remote_datasource.dart`
- `apps/production/lib/features/order/data/datasources/order_remote_datasource.dart`

## Temuan Debug

Konfigurasi Dio global masih menetapkan JSON sebagai default header:

```dart
headers: {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
}
```

Interceptors juga memiliki fallback JSON untuk request non-GET yang tidak punya `Content-Type`:

```dart
if (options.method != 'GET' && options.headers['Content-Type'] == null) {
  options.headers['Content-Type'] = 'application/json';
}
```

Pada cashier weigh order, request sudah membuat `FormData`:

```dart
final formData = FormData.fromMap({
  ...data,
  if (photoPath != null)
    'photo': await MultipartFile.fromFile(...),
});
```

Namun request tidak mengirim options multipart:

```dart
await _dio.post(
  '${_endpoints.orders}/$id/weigh',
  data: formData,
);
```

Akibatnya Dio tetap membawa default `Content-Type: application/json` dari konfigurasi global, walaupun body yang dikirim adalah `FormData`.

## Endpoint/Form Terdampak

Form yang ditemukan memakai `FormData` tanpa explicit multipart sebelum perbaikan:

- Cashier order weigh: `POST /api/mobile/cashier/orders/{id}/weigh`
- Cashier deposit store: `POST /api/mobile/cashier/deposits`
- Cashier deposit update: `PUT /api/mobile/cashier/deposits/{id}`
- Cashier expense store: `POST /api/mobile/cashier/expenses`
- Cashier expense update: `PUT /api/mobile/cashier/expenses/{id}`
- Cashier employee update avatar: `PUT /api/mobile/cashier/employees/{id}`

Referensi implementasi yang sudah benar ada di production order datasource:

```dart
options: Options(contentType: Headers.multipartFormDataContentType)
```

Production memakai pola ini pada flow upload foto pickup/arrived, sehingga request `FormData` mengirim header multipart.

## Root Cause

Root cause utama: request upload `FormData` di cashier tidak meng-override default `Content-Type` JSON.

Ada mismatch antara body dan header:

```text
Body: FormData
Content-Type: application/json
```

Untuk request upload file, header harus berupa:

```text
Content-Type: multipart/form-data; boundary=...
```

Boundary akan dibuat oleh Dio saat request memakai `Headers.multipartFormDataContentType`.

## Perbaikan yang Dilakukan

Perbaikan dilakukan di client Flutter cashier:

1. Cashier order weigh sekarang mengirim:

```dart
options: Options(contentType: Headers.multipartFormDataContentType)
```

2. Cashier deposit store/update sekarang selalu memakai multipart karena method tersebut selalu membungkus payload dengan `FormData`.

3. Cashier expense store/update memakai multipart secara kondisional hanya saat payload berubah menjadi `FormData`.

4. Cashier employee update memakai multipart secara kondisional hanya saat payload berubah menjadi `FormData`.

Perbaikan ini tidak mengubah default `DioConfig` global agar request JSON lain tidak ikut berubah.

## Acceptance Criteria

- Log cashier weigh order dengan foto tidak lagi menampilkan `Content-Type: application/json`.
- Log cashier weigh order dengan foto menampilkan `multipart/form-data` beserta boundary.
- Backend menerima file `photo` pada endpoint weigh order.
- Upload attachment deposit berhasil.
- Upload attachment expense berhasil.
- Upload avatar employee berhasil.
- Request expense/employee tanpa file tetap bisa berjalan sebagai JSON seperti sebelumnya.
- Tidak ada perubahan kontrak API backend.

## Verifikasi yang Disarankan

Jalankan static analysis:

```bash
flutter analyze
```

Lalu test manual dari emulator:

1. Login cashier.
2. Buka order yang perlu ditimbang.
3. Isi data timbang dan lampirkan foto.
4. Submit form.
5. Pastikan log request memakai `multipart/form-data`, bukan `application/json`.
6. Pastikan response tidak gagal dengan status `null`.
7. Ulangi upload file pada deposit, expense, dan employee avatar.

Jika project memiliki test datasource dengan mocked Dio, tambahkan assertion bahwa request `FormData` memakai `Headers.multipartFormDataContentType`.

## Status

Debug selesai dan perbaikan client sudah diterapkan pada datasource cashier yang mengirim `FormData`.
