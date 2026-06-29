# Flutter Context — Customer Authentication Feature

## Wash Wallet Customer App

**Versi Dokumen:** 1.1  
**Tanggal:** 2026-04-26  
**Untuk:** Tim Frontend / Flutter  
**Status Backend:** ✅ Selesai, feedback ditindaklanjuti & siap diintegrasikan

---

## Overview

Fitur autentikasi customer sudah selesai diimplementasi di backend. Dokumen ini menjelaskan semua yang perlu tim Flutter ketahui untuk membangun UI/flow yang terintegrasi dengan API yang tersedia.

Sistem autentikasi menggunakan **dual-method**:

1. **OTP via WhatsApp** (default, semua user) — menggunakan Fonnte
2. **Password** (opsional, alternatif login bagi yang sudah punya password)

---

## Base URL

```
https://<domain>/api/mobile/customer
```

Semua endpoint di dokumen ini menggunakan prefix tersebut.

---

## 1. Alur Register (New User)

```
┌─────────────────────────────────────────────────────────┐
│                    REGISTER FLOW                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [1] User input nomor HP                               │
│       ↓                                                 │
│  POST /auth/otp/request { phone, intent: "register" }  │
│       ↓                                                 │
│  ┌─ status: "already_exists" → Arahkan ke Login Screen │
│  └─ status: "otp_sent"      → Tampilkan OTP Input Screen│
│       ↓                                                 │
│  [2] User input kode OTP (dari WA)                     │
│       ↓                                                 │
│  POST /auth/otp/verify { phone, otp }                  │
│       ↓                                                 │
│  └─ status: "new_user" → Routing ke Complete Profile   │
│       ↓                                                 │
│  [3] User isi form profil (nama wajib, lainnya opsional)│
│       ↓                                                 │
│  POST /auth/register { phone, name, email?, ... }      │
│       ↓                                                 │
│  ← token + data customer → Simpan token, masuk app    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

> ⚠️ **Penting:** Setelah `verifyOtp` sukses, Flutter punya **window ±5 menit** untuk mengirim `POST /auth/register`.
> Window ini mengikuti konfigurasi backend `fonnte.otp.expiry_minutes` (default: `5`).
> Jika melebihi window tersebut, backend akan menolak (`422`) dan user harus request OTP ulang dari awal.

---

## 2. Alur Login via OTP (Default)

```
┌─────────────────────────────────────────────────────────┐
│                  LOGIN OTP FLOW                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [1] User input nomor HP                               │
│       ↓                                                 │
│  POST /auth/otp/request { phone, intent: "login" }     │
│       ↓                                                 │
│  ┌─ status: "not_found" → Arahkan ke Register Screen   │
│  └─ status: "otp_sent"  → Tampilkan OTP Input Screen   │
│       ↓                                                 │
│  [2] User input kode OTP (dari WA)                     │
│       ↓                                                 │
│  POST /auth/otp/verify { phone, otp, deviceName? }     │
│       ↓                                                 │
│  └─ status: "existing_user" → token + data customer    │
│       ↓                                                 │
│  Simpan token → masuk ke app                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Alur Login via Password (Alternatif)

```
┌─────────────────────────────────────────────────────────┐
│               LOGIN PASSWORD FLOW                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [1] User input nomor HP + password                    │
│       ↓                                                 │
│  POST /auth/login-password { phone, password }         │
│       ↓                                                 │
│  ┌─ 200 OK → token + data customer → masuk app        │
│  └─ 422    → "Nomor atau password salah"               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

> 💡 Flow ini hanya tersedia bagi customer yang **sudah mengisi password** saat register. Jika user belum punya password, gunakan Login OTP.

---

## 4. API Reference

### 4.1 `POST /auth/otp/request`

**Auth:** Tidak diperlukan

**Request Body:**

```json
{
    "phone": "628123456789",
    "intent": "register"
}
```

| Field    | Type   | Required | Nilai Valid                            |
| -------- | ------ | -------- | -------------------------------------- |
| `phone`  | string | ✅       | Format internasional, contoh: `628xxx` |
| `intent` | string | ✅       | `"register"` atau `"login"`            |

> ⚠️ Selalu kirim `intent` secara eksplisit. Jangan biarkan kosong.
>
> Backend saat ini memvalidasi `intent` sebagai **required**. Jika tidak dikirim, request akan gagal `422`.

**Response — OTP Terkirim:**

```json
{
    "success": true,
    "message": "Kode OTP telah dikirim ke nomor WhatsApp Anda.",
    "data": { "status": "otp_sent" }
}
```

**Response — Nomor Sudah Ada (intent: register):**

```json
{
    "success": true,
    "message": "Nomor sudah terdaftar. Silakan login atau gunakan nomor lain.",
    "data": { "status": "already_exists" }
}
```

**Response — Nomor Tidak Ditemukan (intent: login):**

```json
{
    "success": true,
    "message": "Nomor belum terdaftar. Silakan registrasi terlebih dahulu.",
    "data": { "status": "not_found" }
}
```

---

### 4.2 `POST /auth/otp/verify`

**Auth:** Tidak diperlukan

**Request Body:**

```json
{
    "phone": "628123456789",
    "otp": "123456",
    "deviceName": "Pixel 9 Pro"
}
```

| Field        | Type   | Required | Keterangan                                                    |
| ------------ | ------ | -------- | ------------------------------------------------------------- |
| `phone`      | string | ✅       | Nomor yang sama dengan saat request OTP                       |
| `otp`        | string | ✅       | Kode 6 digit dari WA                                          |
| `deviceName` | string | ❌       | Nama device (untuk label token Sanctum). Default: User-Agent. |

**Response — New User (belum terdaftar):**

```json
{
    "success": true,
    "message": "OTP valid. Silakan lanjutkan registrasi.",
    "data": {
        "status": "new_user",
        "phone": "628123456789"
    }
}
```

→ Flutter harus routing ke **Complete Profile Screen**.

**Response — Existing User (sudah terdaftar):**

```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "status": "existing_user",
    "token": "1|xxxxxxxxxxxxxxxx",
    "tokenType": "Bearer",
    "customer": { ...CustomerAccount }
  }
}
```

→ Flutter simpan token → routing ke **Home Screen**.

**Response — OTP Salah / Kedaluwarsa:**

```json
{
    "success": false,
    "message": "Kode OTP tidak valid atau sudah kedaluwarsa.",
    "code": 422
}
```

---

### 4.3 `POST /auth/register`

**Auth:** Tidak diperlukan  
**Catatan:** Hanya bisa dipanggil setelah `verifyOtp` sukses dengan `status: "new_user"`.

**Request Body:**

```json
{
    "phone": "628123456789",
    "name": "Budi Santoso",
    "email": "budi@mail.com",
    "gender": "male",
    "password": "secret123",
    "date_of_birth": "1995-08-17",
    "deviceName": "Pixel 9 Pro"
}
```

| Field           | Type   | Required | Keterangan                                                      |
| --------------- | ------ | -------- | --------------------------------------------------------------- |
| `phone`         | string | ✅       | Nomor yang sudah diverifikasi                                   |
| `name`          | string | ✅       | Nama lengkap customer                                           |
| `email`         | string | ❌       | Email unik (nullable)                                           |
| `gender`        | string | ❌       | `"male"` atau `"female"`                                        |
| `password`      | string | ❌       | Min 6 karakter. Jika diisi, user bisa login via password nanti. |
| `date_of_birth` | string | ❌       | Format `YYYY-MM-DD`                                             |
| `deviceName`    | string | ❌       | Nama device                                                     |

**Response Sukses:**

```json
{
  "success": true,
  "message": "Registrasi berhasil.",
  "data": {
    "token": "2|xxxxxxxxxxxxxxxx",
    "tokenType": "Bearer",
    "customer": { ...CustomerAccount }
  }
}
```

**Response Gagal — Nomor Sudah Terdaftar:**

```json
{
    "success": false,
    "message": "Nomor sudah terdaftar.",
    "code": 422
}
```

**Response Gagal — OTP Sudah Kedaluwarsa:**

```json
{
    "success": false,
    "message": "OTP belum diverifikasi atau sudah kedaluwarsa. Silakan verifikasi OTP kembali.",
    "code": 422
}
```

---

### 4.4 `POST /auth/login-password`

**Auth:** Tidak diperlukan

**Rate Limit:** `10 request / menit` per client (`throttle:10,1`)

**Request Body:**

```json
{
    "phone": "628123456789",
    "password": "secret123",
    "deviceName": "Pixel 9 Pro"
}
```

| Field        | Type   | Required |
| ------------ | ------ | -------- |
| `phone`      | string | ✅       |
| `password`   | string | ✅       |
| `deviceName` | string | ❌       |

**Response Sukses:**

```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "token": "3|xxxxxxxxxxxxxxxx",
    "tokenType": "Bearer",
    "customer": { ...CustomerAccount }
  }
}
```

**Response Gagal:**

```json
{
    "success": false,
    "message": "Nomor atau password salah.",
    "code": 422,
    "errors": { "credentials": "Nomor atau password salah." }
}
```

**Response Gagal — Too Many Attempts (`429`):**

```json
{
    "success": false,
    "message": "Too Many Attempts."
}
```

---

### 4.5 `GET /auth/me`

**Auth:** ✅ Bearer Token diperlukan  
**Header:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "message": "Berhasil mengambil data profil.",
  "data": { ...CustomerAccount }
}
```

---

### 4.6 `POST /auth/logout`

**Auth:** ✅ Bearer Token diperlukan

**Response:**

```json
{
    "success": true,
    "message": "Logout berhasil.",
    "data": null
}
```

> Backend hanya menghapus token **saat ini** (single session logout). Token lama di device lain tidak terpengaruh.

---

## 5. CustomerAccount Object Schema

Semua endpoint yang mengembalikan data customer menggunakan struktur ini:

```json
{
    "id": 1,
    "phone": "628123456789",
    "name": "Budi Santoso",
    "email": "budi@mail.com",
    "gender": "male",
    "avatar": null,
    "date_of_birth": "1995-08-17",
    "is_verified": true,
    "is_active": true,
    "last_login_at": "2026-04-26T09:00:00.000000Z"
}
```

| Field           | Type   | Nullable | Keterangan                                      |
| --------------- | ------ | -------- | ----------------------------------------------- |
| `id`            | int    | —        | ID unik customer                                |
| `phone`         | string | —        | Nomor HP (format internasional)                 |
| `name`          | string | ✅       | Nama lengkap                                    |
| `email`         | string | ✅       | Email                                           |
| `gender`        | string | ✅       | `"male"` atau `"female"`                        |
| `avatar`        | string | ✅       | URL avatar (belum diimplementasi)               |
| `date_of_birth` | string | ✅       | Format `YYYY-MM-DD`                             |
| `is_verified`   | bool   | —        | Apakah nomor sudah terverifikasi via OTP        |
| `is_active`     | bool   | —        | Apakah akun aktif (jika `false`, login ditolak) |
| `last_login_at` | string | ✅       | ISO 8601 datetime                               |

> ⚠️ **Tidak ada** field `password` dan `fcm_token` di response. Keduanya disembunyikan di backend.

---

## 6. Penanganan Error Umum

| HTTP Code | Kondisi                                               | Tindakan Flutter                                          |
| --------- | ----------------------------------------------------- | --------------------------------------------------------- |
| `422`     | Validasi gagal (OTP salah, nomor sudah ada, dll)      | Tampilkan pesan dari field `message` atau `errors`        |
| `429`     | Terkena rate limit (terutama endpoint login-password) | Tampilkan pesan coba lagi nanti, disable tombol sementara |
| `401`     | Token tidak ada / kedaluwarsa                         | Clear token, redirect ke Login Screen                     |
| `500`     | Error server                                          | Tampilkan pesan generik, log error                        |

**Struktur error response:**

```json
{
    "success": false,
    "message": "Pesan error yang dapat ditampilkan ke user.",
    "code": 422,
    "errors": {
        "field_name": "Deskripsi error field."
    }
}
```

---

## 7. Token Management

- Token menggunakan **Laravel Sanctum** (Bearer Token)
- Token bersifat **single session**: setiap login baru akan menghapus semua token lama untuk akun customer tersebut
- Simpan token di **secure storage** (misal: `flutter_secure_storage`)
- Kirim token di setiap request protected endpoint via header:
    ```
    Authorization: Bearer <token>
    ```

---

## 8. Routing Decision Map untuk Flutter

```
verifyOtp response:
├── status: "new_user"
│   └── → CompleteProfileScreen (POST /auth/register)
│           └── Sukses → HomeScreen
└── status: "existing_user"
    └── → HomeScreen (token sudah ada)

requestOtp response (intent: "register"):
├── status: "already_exists"
│   └── → Tampilkan dialog: "Nomor sudah terdaftar, login?"
│           ├── Ya → LoginScreen
│           └── Ganti Nomor → Kembali ke input nomor
└── status: "otp_sent"
    └── → OtpInputScreen

requestOtp response (intent: "login"):
├── status: "not_found"
│   └── → Tampilkan dialog: "Nomor belum terdaftar, daftar?"
│           ├── Ya → RegisterScreen
│           └── Ganti Nomor → Kembali ke input nomor
└── status: "otp_sent"
    └── → OtpInputScreen
```

---

## 9. Hal yang Perlu Diperhatikan Tim Flutter

1. **Selalu kirim `intent`** saat request OTP (`"register"` atau `"login"`). Ini menentukan pre-check yang dilakukan backend.

2. **Window OTP untuk register** adalah ±5 menit setelah `verifyOtp` sukses. Jangan biarkan form Complete Profile terlalu lama terbuka tanpa timeout.

3. **Field `name` wajib** di endpoint register, sisanya opsional. Namun sebaiknya UI mendorong user untuk mengisi email dan password agar fitur login-password tersedia.

4. **Akun tidak aktif** (`is_active: false`) akan mendapat error `422` saat login. Tampilkan pesan untuk menghubungi admin.

5. **Response key yang benar adalah `customer`**, bukan `customer_account`. Pastikan parsing model Dart menggunakan key `customer`.

---

## 10. Checklist Integrasi Flutter

- [ ] Model `CustomerAccount` (Dart) sudah sesuai schema di section 5
- [ ] Repository / Service layer untuk auth sudah dibuat
- [ ] Secure storage untuk token sudah disiapkan
- [ ] Flow `requestOtp` → `verifyOtp` → `register` sudah diimplementasi
- [ ] Flow `requestOtp` → `verifyOtp` → login langsung (existing_user) sudah diimplementasi
- [ ] Flow `loginWithPassword` sudah diimplementasi
- [ ] Routing berdasarkan `status` field sudah diimplementasi
- [ ] Error handling untuk `401`, `422`, `429`, `500` sudah ditangani
- [ ] Logout sudah memanggil `POST /auth/logout` sebelum clear local token
- [ ] `GET /auth/me` digunakan untuk refresh profil saat app dibuka ulang
