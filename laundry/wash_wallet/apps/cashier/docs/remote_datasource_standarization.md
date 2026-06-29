# Standard Spesifikasi: Remote Data Source (Flutter)

Dokumen ini mendefinisikan standar implementasi untuk lapisan `RemoteDataSource` yang berinteraksi dengan API eksternal.

---

## 1. Arsitektur & Struktur

### 1.1 Lokasi & Penamaan
- **Lokasi:** `lib/features/*/data/datasources/`
- **Penamaan:** Berakhiran `RemoteDataSource` (Interface) dan `RemoteDataSourceImpl` (Implementasi).

### 1.2 Interface & DI
Wajib memisahkan antara *abstract class* dan implementasi untuk mendukung *Unit Testing* dan *Dependency Injection*.

```dart
abstract class CustomerRemoteDataSource {
  Future<CustomerModel> getCustomerDetail(int id);
}

class CustomerRemoteDataSourceImpl implements CustomerRemoteDataSource {
  final Dio dio;
  CustomerRemoteDataSourceImpl({required this.dio});
  // ...
}
```

---

## 2. Aturan Komunikasi Data

### 2.1 Tipe Kembalian (Return Type)
- Data Source **HARUS** mengembalikan `Model` (Data Layer), bukan `Entity` (Domain Layer).
- Gunakan `Future<T>` untuk operasi asinkron.

### 2.2 Penanganan HTTP Client (Dio)
- Gunakan instance `Dio` yang di-injeksi via *constructor*.
- Manfaatkan `api_endpoints.dart` untuk manajemen URL.
- Jangan mengelola token secara manual (gunakan *Interceptor*).

---

## 3. Error Handling & Exceptions

- **Tanggung Jawab:** Data Source hanya bertugas melakukan *request* dan *parsing*.
- **Exceptions:** Jika respons gagal (status code non-2xx), wajib melakukan `throw` terhadap custom `Exception` (contoh: `ServerException()`).
- **Logika Failure:** Konversi `Exception` menjadi `Failure` dilakukan di level `RepositoryImpl`.

---

## 4. Standar Request Body
- Gunakan `Map<String, dynamic>` untuk payload POST/PUT/PATCH.
- Nama key pada Map wajib **camelCase** mengikuti standarisasi API backend WashWallet.
