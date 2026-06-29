# Customer App Authentication — Implementation Plan (Final)

## Background & Existing State

### ✅ Sudah Ada
| Komponen | Detail |
|---|---|
| Model `CustomerAccount` | `phone`, `name`, `avatar`, `is_verified`, `is_active`, `last_login_at`, `fcm_token` |
| `CustomerAuthService` | Extends `AuthService`, `loginOrRegister()` digabung — akan dipisah |
| `CustomerAuthController` | `requestOtp`, `verifyOtp`, `logout`, `me` |
| `WhatsappOtp` infra | Fonnte, rate limit, max attempts — sudah matang |
| Routes | `otp/request`, `otp/verify` |
| Guard `customer_sanctum` | Sudah dipakai di routes |

### ❌ Belum Ada
| Komponen | Detail |
|---|---|
| Kolom `email`, `gender`, `password`, `date_of_birth` di `customer_accounts` | Perlu migrasi baru |
| Kolom `name` nullable | Saat ini NOT NULL, perlu diubah |
| Pemisahan `new_user` vs `existing_user` di `verifyOtp` | Saat ini langsung auto-create & login |
| Endpoint `POST /auth/register` | Belum ada |
| Endpoint `POST /auth/login-password` | Belum ada |
| `CustomerAccountResource` | Belum ada resource terstandar |

---

## Alur Autentikasi (Refined)

### 1. Register Flow
```
1. Flutter: input PHONE → POST /auth/otp/request (intent: "register")
2. Backend: 
   ├─ Cek apakah nomor SUDAH ada di database?
   │  └─ Ya: Return { status: "already_exists" }
   └─ Tidak: Kirim OTP ke WA → Return { status: "otp_sent" }
3. Flutter:
   ├─ Jika "already_exists": Tampilkan opsi Login atau Ganti Nomor.
   └─ Jika "otp_sent": Tampilkan screen input OTP.
4. Flutter: input OTP code → POST /auth/otp/verify
5. Backend: Verifikasi OTP → Return Success
6. Flutter: Verifikasi sukses → Routing ke screen "Complete Profile"
7. Flutter: POST /auth/register (name, email, password, etc.)
8. Backend: Buat akun, terbitkan Sanctum token
```

### 2. Login Flow (Default OTP)
```
1. Flutter: input PHONE → POST /auth/otp/request (intent: "login")
2. Backend:
   ├─ Cek apakah nomor ADA di database?
   │  └─ Tidak: Return { status: "not_found" }
   └─ Ya: Kirim OTP ke WA → Return { status: "otp_sent" }
3. Flutter:
   ├─ Jika "not_found": Tampilkan opsi Register atau Ganti Nomor.
   └─ Jika "otp_sent": Tampilkan screen input OTP.
4. Flutter: input OTP code → POST /auth/otp/verify
5. Backend: Verifikasi OTP, login, terbitkan Sanctum token
```

### 3. Login Flow (Alternative Password)
```
1. Flutter: input PHONE → (Opsional) Cek nomor exist dulu? 
   Atau langsung POST /auth/login-password (phone, password)
2. Backend:
   ├─ Cek phone & password match?
   │  ├─ Ya: Login, terbitkan Sanctum token
   │  └─ Tidak: Return 422 "Nomor atau password salah"
```

---

## Proposed Changes

---

### 1. Database Migration

#### [NEW] `2026_04_25_XXXXXX_update_customer_accounts_for_full_auth.php`

```php
Schema::table('customer_accounts', function (Blueprint $table) {
    $table->string('name')->nullable()->change();          // diubah jadi nullable untuk flow register
    $table->string('email')->nullable()->unique()->after('name');
    $table->string('gender', 10)->nullable()->after('email'); // 'male'|'female'
    $table->string('password')->nullable()->after('gender');
    $table->date('date_of_birth')->nullable()->after('password');
});
```

---

### 2. Model CustomerAccount

#### [MODIFY] `app/Models/CustomerAccount.php`

- Tambah ke `$fillable`: `email`, `gender`, `password`, `date_of_birth`
- Tambah ke `$hidden`: `password`
- Tambah ke `$casts`: `'password' => 'hashed'`, `'date_of_birth' => 'date'`

---

### 3. CustomerAuthService

#### [MODIFY] `app/Services/CustomerAuthService.php`

```php
// Update sendOtp untuk support pre-check intent
public function sendOtpWithCheck(string $phone, string $intent): array
{
    $exists = CustomerAccount::where('phone', $phone)->exists();

    if ($intent === 'register' && $exists) {
        return ['status' => 'already_exists'];
    }

    if ($intent === 'login' && !$exists) {
        return ['status' => 'not_found'];
    }

    // Panggil logic sendOtp existing (parent AuthService)
    $this->sendOtp($phone);
    return ['status' => 'otp_sent'];
}

// Update verifyOtp untuk support login auto jika intent login
public function verifyAndLogin(string $phone, string $otp, string $deviceName): array
{
    $this->verifyOtp($phone, $otp);
    
    $customerAccount = CustomerAccount::where('phone', $phone)->first();
    
    if ($customerAccount) {
        $token = $customerAccount->createToken($deviceName)->plainTextToken;
        return [
            'status' => 'logged_in',
            'token' => $token,
            'customer' => $customerAccount
        ];
    }

    return ['status' => 'verified']; // Untuk register flow
}
```

---

### 4. CustomerAuthController

#### [MODIFY] `app/Http/Controllers/Mobile/Customer/Auth/CustomerAuthController.php`

| Method | Perubahan |
|---|---|
| `requestOtp` | Tidak berubah |
| `verifyOtp` | **Diubah** — panggil `verifyOtpAndCheckStatus()`, return `status` |
| `register` | **Baru** — panggil `registerCustomer()` |
| `loginWithPassword` | **Baru** — panggil `loginWithPassword()` |
| `me` | Tidak berubah |
| `logout` | Tidak berubah |

---

### 5. API Routes

#### [MODIFY] `routes/api_mobile_customer.php`

```php
Route::prefix('auth')->name('auth.')->controller(CustomerAuthController::class)->group(function () {
    // Public
    Route::post('/otp/request',     'requestOtp');       // existing
    Route::post('/otp/verify',      'verifyOtp');        // diubah
    Route::post('/register',        'register');         // BARU
    Route::post('/login-password',  'loginWithPassword');// BARU

    // Protected
    Route::middleware('auth:customer_sanctum')->group(function () {
        Route::get('/me',      'me');
        Route::post('/logout', 'logout');
    });
});
```

---

### 6. CustomerAccountResource

#### [NEW] `app/Http/Resources/CustomerAccount/CustomerAccountResource.php`

Fields yang dikembalikan:
```php
'id', 'phone', 'name', 'email', 'gender',
'avatar', 'date_of_birth', 'is_verified', 'is_active', 'last_login_at'
// Hidden: password, fcm_token, deleted_at
```

---

## API Contract Summary

| Method | Endpoint | Auth | Body |
|---|---|---|---|
| POST | `/mobile/customer/auth/otp/request` | — | `phone` |
| POST | `/mobile/customer/auth/otp/verify` | — | `phone`, `otp`, `deviceName?` |
| POST | `/mobile/customer/auth/register` | — | `phone`, `name`, `email?`, `gender?`, `password?`, `date_of_birth?`, `deviceName?` |
| POST | `/mobile/customer/auth/login-password` | — | `phone`, `password`, `deviceName?` |
| GET | `/mobile/customer/auth/me` | ✅ Bearer | — |
| POST | `/mobile/customer/auth/logout` | ✅ Bearer | — |

---

## Response Schema

### `POST /auth/otp/verify`
```json
// Belum terdaftar
{ "success": true, "data": { "status": "new_user", "phone": "628xxx" } }

// Sudah terdaftar → langsung login
{
  "success": true,
  "data": {
    "status": "existing_user",
    "token": "sanctum_token",
    "tokenType": "Bearer",
    "customer": { ...CustomerAccountResource }
  }
}
```

### `POST /auth/register`
```json
// Request
{ "phone": "628xxx", "name": "Budi", "email": "budi@mail.com", "gender": "male", "password": "secret" }

// Response
{ "success": true, "message": "Registrasi berhasil.", "data": { "token": "...", "tokenType": "Bearer", "customer": { ... } } }
```

### `POST /auth/login-password`
```json
// Request
{ "phone": "628xxx", "password": "secret" }

// Response sukses
{ "success": true, "data": { "token": "...", "customer": { ... } } }

// Response gagal
{ "success": false, "message": "Nomor atau password salah.", "code": 422 }
```

---

## Verification Plan

1. `POST /otp/request` nomor valid → `200 OK`, OTP terkirim ke WA
2. `POST /otp/verify` nomor **belum terdaftar** → `{ status: "new_user" }`
3. `POST /otp/verify` nomor **sudah terdaftar** → `{ status: "existing_user", token: "..." }`
4. `POST /register` dengan data lengkap → akun terbuat, token dikembalikan
5. `POST /register` dengan phone yang sudah terdaftar → `422` 
6. `POST /login-password` phone + password benar → `200` dengan token
7. `POST /login-password` password salah → `422`
8. `GET /me` tanpa token → `401`
9. `GET /me` dengan token valid → data profil dikembalikan
