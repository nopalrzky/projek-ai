# Backend API Integration Plan for Mobile Customer App

**Tujuan**: Panduan komprehensif bagi AI Agent untuk mengintegrasikan perubahan backend API terbaru (Auth, Customer Address, Home, Outlet) ke dalam Flutter Customer App (layer RemoteDatasource, Repository, RepositoryImpl, Usecase, State, Provider, dan Cubit).

> [!IMPORTANT]
> **MANDATORY INSTRUCTION FOR AI AGENT:**
> Sebelum menulis atau memodifikasi kode apapun, Anda **WAJIB** membaca dan memahami semua spesifikasi standarisasi arsitektur yang berada di dalam folder `docs/spec/`.
> 
> Harap baca file berikut menggunakan tool `view_file` atau sejenisnya:
> 1. `docs/spec/remote_datasource_spec.md`
> 2. `docs/spec/repository_spec.md`
> 3. `docs/spec/repository_impl_spec.md`
> 4. `docs/spec/usecase_spec.md`
> 5. `docs/spec/state_spec.md`
> 6. `docs/spec/cubit_spec.md`
> 7. `docs/spec/provider_spec.md`
>
> Pastikan seluruh implementasi Anda nantinya mematuhi aturan penamaan, struktur class, penanganan error (`Result`), dan format mapping JSON yang telah distandardisasi.

---

## 1. Auth Module Integration

Berdasarkan `docs/api/auth_api.md`:

### A. Entity & Model
- Sesuaikan model `Customer` untuk memuat data profil yang direturn dari endpoint `/auth/me` dan response login/register.
- Buat entitas untuk merepresentasikan hasil request/verify OTP dan autentikasi token (misal: login response).

### B. RemoteDatasource (`AuthRemoteDatasource`)
Implementasi fungsi dengan mengkonsumsi client HTTP:
1. `requestOtp(phone, intent)`: `POST /api/mobile/customer/auth/otp/request`
2. `verifyOtp(phone, otp, deviceName)`: `POST /api/mobile/customer/auth/otp/verify`
3. `register(...)`: `POST /api/mobile/customer/auth/register`
4. `loginPassword(phone, password, deviceName)`: `POST /api/mobile/customer/auth/login-password`
5. `getProfile()`: `GET /api/mobile/customer/auth/me`
6. `logout()`: `POST /api/mobile/customer/auth/logout`

### C. Repository & RepositoryImpl
Buat `AuthRepository` interface dan `AuthRepositoryImpl` yang membungkus pemanggilan RemoteDatasource dengan standarisasi `Result<T>` (sesuai dokumen spesifikasi).

### D. Usecase
Buat Usecase terpisah untuk masing-masing aksi:
- `RequestOtpUsecase`
- `VerifyOtpUsecase`
- `RegisterUsecase`
- `LoginPasswordUsecase`
- `GetProfileUsecase`
- `LogoutUsecase`

### E. Presentation (State, Cubit, Provider)
- **State**: Buat `AuthState` menggunakan `freezed` dengan union type seperti `initial`, `loading`, `otpSent`, `unauthenticated`, `authenticated`, `error` (sesuai `state_spec.md`).
- **Cubit**: Buat `AuthCubit` yang mengelola alur login, logout, dan status sesi. Pastikan penanganan `Result.when` sesuai `cubit_spec.md`.
- **Provider**: Daftarkan semua layer ini di `auth_provider.dart`.

---

## 2. Customer Address Module Integration

Berdasarkan `docs/api/customer_address_api.md`:

### A. Entity & Model
- Buat model `CustomerAddress` yang merepresentasikan response JSON alamat (termasuk isPrimary, latitude, longitude, dll).

### B. RemoteDatasource (`CustomerAddressRemoteDatasource`)
1. `getAll(page, perPage, ...)`: `GET /api/mobile/customer/addresses`
2. `getById(id)`: `GET /api/mobile/customer/addresses/{id}`
3. `store(...)`: `POST /api/mobile/customer/addresses`
4. `update(id, ...)`: `PUT /api/mobile/customer/addresses/{id}`
5. `destroy(id)`: `DELETE /api/mobile/customer/addresses/{id}`

### C. Repository & RepositoryImpl
Kembalikan `Future<Result<List<CustomerAddress>>>` untuk index dan `Future<Result<CustomerAddress>>` atau `Future<Result<Unit>>` untuk aksi CRUD lainnya.

### D. Usecase
- `GetAllUsecase`
- `GetByIdUsecase`
- `StoreUsecase`
- `UpdateUsecase`
- `DestroyUsecase`

### E. Presentation
- **State**: `CustomerAddressListState` dan `CustomerAddressActionState` (untuk loading saat mutasi).
- **Cubit**: `CustomerAddressListCubit` (mengelola state list) dan `CustomerAddressActionCubit` (mengelola proses store/update/destroy).
- **Provider**: Daftarkan di `customer_address_provider.dart`.

---

## 3. Home Dashboard Integration

Berdasarkan `docs/api/home_api.md`:

### A. Entity & Model
- Buat entitas komposit `HomeDashboard` yang mencakup: `Customer`, `CustomerAddress` (primaryAddress), `OrderSummary`, List `RecentOrder`, List `FeaturedOutlet`.

### B. RemoteDatasource (`HomeRemoteDatasource`)
1. `getHomeDashboard()`: `GET /api/mobile/customer/dashboard/home`

### C. Repository & RepositoryImpl
Buat `HomeRepository` dengan method `getHomeDashboard()` mengembalikan `Result<HomeDashboard>`.

### D. Usecase
- `GetHomeDashboardUsecase`

### E. Presentation
- **State**: `HomeDashboardState` (initial, loading, success, error).
- **Cubit**: `HomeDashboardCubit` yang akan mengambil keseluruhan data dashboard.
- **Provider**: Daftarkan di `home_provider.dart`.

---

## 4. Outlet Module Integration

Berdasarkan `docs/api/outlet_api.md`:

### A. Entity & Model
- Siapkan request param untuk filtering (isExposure, status, provinceId, dll).

### B. RemoteDatasource (`OutletRemoteDatasource`)
1. `getAll(page, perPage, isExposure, ...)`: `GET /api/mobile/customer/outlets`
2. `getById(id)`: `GET /api/mobile/customer/outlets/{id}`

### C. Repository & RepositoryImpl
Update `OutletRepository` dengan fungsi `getAll()` yang mengembalikan `Future<Result<List<Outlet>>>` dan `getById()` yang mengembalikan `Future<Result<Outlet>>`.

### D. Usecase
- `GetAllUsecase`
- `GetByIdUsecase`

### E. Presentation
- **State**: `OutletListState` dan `OutletDetailState`.
- **Cubit**: `OutletListCubit` (mengelola state list) dan `OutletDetailCubit`.
- **Provider**: Daftarkan di `outlet_provider.dart`.

---

## Urutan Pengerjaan Disarankan (Checklist)

- [ ] Membaca keseluruhan file spesifikasi di `docs/spec/`.
- [ ] Menyelesaikan Integrasi Auth (Model -> RemoteDatasource -> Repository -> Usecase -> Cubit -> Provider).
- [ ] Menyelesaikan Integrasi Customer Address.
- [ ] Menyelesaikan Integrasi Outlet.
- [ ] Menyelesaikan Integrasi Home Dashboard (karena ini menggabungkan banyak model).
- [ ] Menjalankan `dart run build_runner build -d` untuk generate Freezed.
