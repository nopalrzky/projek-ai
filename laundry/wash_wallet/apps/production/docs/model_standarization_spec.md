# Standard Spesifikasi: Model & Entity (Flutter)

Dokumen ini mendefinisikan standar teknis untuk pembuatan `Entity` (Domain Layer) dan `Model` (Data Layer) pada project Flutter WashWallet.

---

## 1. Arsitektur Data (Clean Architecture)

### 1.1 Domain Layer: Entity
- **Lokasi:** `lib/features/*/domain/entities/`
- **Karakteristik:**
    - Objek bisnis murni, tidak bergantung pada JSON.
    - Menggunakan `Equatable` untuk perbandingan objek.
    - Tidak memiliki anotasi `@JsonKey`.
    - Menampung *derived logic* (misal: `fullName`).

### 1.2 Data Layer: Model (DTO)
- **Lokasi:** `lib/features/*/data/models/`
- **Karakteristik:**
    - Representasi 1:1 dari JSON API.
    - Menggunakan `freezed` dan `json_serializable`.
    - Penamaan file/kelas harus berakhiran `Model` (contoh: `CustomerModel`).

---

## 2. Implementasi Teknis

### 2.1 JSON Mapping & Strict Typing
- **Format Key:** Selalu gunakan **camelCase** sesuai respons backend.
- **Null Safety:** Field opsional dari API wajib dideklarasikan sebagai `Nullable`.
- **Casting:** Gunakan tipe data yang tepat (`double` untuk finansial, `int` untuk ID).

### 2.2 Relasi Nested
- Relasi tunggal: `final OtherModel? name;`
- Relasi koleksi: `final List<OtherModel>? items;`

### 2.3 Mapper (Data to Domain)
Setiap `Model` wajib memiliki ekstens/method `toEntity()` untuk konversi ke objek Domain.

```dart
extension CustomerModelX on CustomerModel {
  Customer toEntity() => Customer(
    id: id,
    name: name,
    // ... mapping lainnya
  );
}
```

---

## 3. Workflow Code Generation
Setelah mendefinisikan Model, jalankan:
```bash
dart run build_runner build --delete-conflicting-outputs
```