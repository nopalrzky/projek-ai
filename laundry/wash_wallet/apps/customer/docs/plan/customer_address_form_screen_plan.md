# Customer Address Form Screens — Implementation Plan

**Tujuan:** Membangun layar formulir untuk menambah (`CreateCustomerAddressScreen`) dan mengubah (`EditCustomerAddressScreen`) alamat customer. Formulir ini harus valid dan terhubung dengan `CustomerAddressActionCubit`.

---

> [!IMPORTANT]
> **MANDATORY INSTRUCTION FOR AI AGENT — BACA DULU SEBELUM MENULIS KODE:**
>
> Sebelum menulis kode, Anda **WAJIB** membaca dan memahami:
>
> **1. Spesifikasi arsitektur:**
> - `docs/spec/cubit_spec.md` (khususnya penanganan `Result` dan status `loading`, `success`, `failure`)
> - `docs/spec/state_spec.md`
>
> **2. Shared UI components:**
> Buka package `wash_wallet_ui` dan pelajari komponen formulir yang tersedia. Jangan membuat text field kustom jika sudah ada di UI library.
> - `AppTextField` atau standar `TextFormField` dengan dekorasi dari `context.colors` dan `context.radius`.
> - `AppButton` (`primary`, `outline`, dll)
> - `context.colors.*`
> - `context.typography.*`
> - `context.space.*`
> - `context.radius.*`
>
> Selalu pastikan tampilan formulir terasa modern, berjarak pas (spacious), dan konsisten dengan halaman lain.

---

## Ringkasan Fitur Form

Sesuai dengan `docs/api/customer_address_api.md`, field yang diperlukan adalah:

1. **Label** (Wajib, maks 50 char) — *Contoh: Rumah, Kantor, Apartemen.*
2. **Nama Penerima** (Wajib, maks 255 char)
3. **Nomor HP Penerima** (Wajib, maks 20 char) — *Sertakan validasi input angka.*
4. **Alamat Lengkap / Jalan** (Wajib) — *Gunakan multiline text field.*
5. **Catatan** (Opsional, maks 500 char) — *Contoh: Warna pagar, patokan.*
6. **Titik Lokasi Peta** (Opsional: latitude, longitude) — *Untuk tahap awal, bisa menggunakan tombol placeholder "Pilih Lokasi" yang belum aktif, atau sekadar input manual/tersembunyi jika belum ada integrasi maps.*
7. **Jadikan Alamat Utama** (Opsional, boolean) — *Gunakan komponen Switch/Toggle.*

---

## Struktur Layar

### 1. `CreateCustomerAddressScreen`

- **AppBar**: Title "Tambah Alamat".
- **Body**: `SingleChildScrollView` berisi kolom-kolom input.
- **State Management**:
  - Bungkus body atau bagian tertentu dengan `BlocConsumer<CustomerAddressActionCubit, CustomerAddressActionState>`.
  - **Listener**: 
    - Jika state `success`, tampilkan `SnackBar` sukses, lalu `context.pop()`. Jangan lupa *refresh* list di layar index (biasanya dengan memanggil ulang cubit list, atau biarkan router yang menangani jika me-refresh saat on return).
    - Jika state `failure`, tampilkan `SnackBar` error.
  - **Builder**:
    - Jika state `loading`, tombol submit harus menunjukkan indikator loading (non-aktif).
- **Submit Action**: Memanggil method `store(...)` pada `CustomerAddressActionCubit`.

### 2. `EditCustomerAddressScreen`

- **Argument**: Menerima objek `CustomerAddress` via konstruktor/route extra.
- **AppBar**: Title "Ubah Alamat".
- **Init State**: Mengisi `TextEditingController` dengan nilai dari objek `CustomerAddress`.
- **Body**: Sama seperti Create.
- **State Management**: Sama seperti Create.
- **Submit Action**: Memanggil method `update(id, ...)` pada `CustomerAddressActionCubit`.

### 3. Widget Bantuan Khusus Form (Opsional)

Jika form sangat panjang, Anda dapat mengekstrak bagian form ke dalam `CustomerAddressFormWidget` yang *reusable* untuk dipakai di layar Create maupun Edit. Form widget ini akan mengatur validasi (`GlobalKey<FormState>`) dan meneruskan nilai-nilai yang tervalidasi kembali ke Screen saat disubmit.

---

## Detail Validasi Form

- Gunakan `Form` dan `TextFormField`.
- Terapkan fungsi `validator`:
  - Field wajib tidak boleh kosong (kembalikan pesan "Field ini wajib diisi").
  - Nomor HP: Hanya boleh mengandung angka, panjang min 9, maks 15/20.
- Gunakan `TextInputType.phone` untuk nomor HP.
- Gunakan `TextInputType.multiline` untuk Alamat Lengkap dan Catatan.
- Gunakan `TextInputAction.next` untuk berpindah field dengan mulus, dan `TextInputAction.done` pada field terakhir.

---

## State & Cubit (Mengingat Ulang)

Pastikan `CustomerAddressActionCubit` memiliki method:
- `store(CustomerAddressRequest request)`
- `update(int id, CustomerAddressRequest request)`

Dan memancarkan state:
- `CustomerAddressActionInitial`
- `CustomerAddressActionLoading`
- `CustomerAddressActionSuccess`
- `CustomerAddressActionFailure(Failure failure)`

---

## Urutan Pengerjaan (Checklist untuk AI Agent)

- [ ] Cek dan konfirmasi komponen input (seperti `AppTextField`) di dalam package `wash_wallet_ui`.
- [ ] Buat `lib/features/customer_address/presentation/screens/create_customer_address_screen.dart`.
- [ ] Buat `lib/features/customer_address/presentation/screens/edit_customer_address_screen.dart`.
- [ ] Implementasikan `GlobalKey<FormState>` untuk validasi pada form.
- [ ] Hubungkan form dengan `CustomerAddressActionCubit` melalui `BlocConsumer`.
- [ ] Atur *handling* rute di `app_router.dart` (termasuk meneruskan argument ID / object pada rute Edit).
- [ ] Pastikan navigasi kembali (`pop`) berjalan mulus dan memperbarui layar index jika diperlukan.
