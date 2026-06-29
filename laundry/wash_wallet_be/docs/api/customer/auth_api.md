# Customer Auth API (Mobile Customer)

Dokumentasi endpoint autentikasi untuk aplikasi mobile customer.

Base path:

- `/api/mobile/customer/auth`

## Header

Untuk endpoint yang membutuhkan login:

```http
Authorization: Bearer <access_token>
Accept: application/json
Content-Type: application/json
```

## Response Envelope

### Success

```json
{
    "success": true,
    "message": "...",
    "data": {}
}
```

### Error

```json
{
    "success": false,
    "message": "...",
    "error": {}
}
```

Catatan:

- `error` detail hanya muncul sesuai konfigurasi aplikasi.

---

## 1) Request OTP

- Method: `POST`
- URL: `/api/mobile/customer/auth/otp/request`
- Auth: tidak perlu

### Body

- `phone` (string, required)
- `intent` (string, required): `register` atau `login`

### Contoh Request

```json
{
    "phone": "081234567890",
    "intent": "register"
}
```

### Contoh Response 200

```json
{
    "success": true,
    "message": "Kode OTP telah dikirim ke nomor WhatsApp Anda.",
    "data": {
        "status": "otp_sent"
    }
}
```

Kemungkinan `status` lain:

- `already_exists` untuk intent `register` jika nomor sudah terdaftar.
- `not_found` untuk intent `login` jika nomor belum terdaftar.

---

## 2) Verify OTP

- Method: `POST`
- URL: `/api/mobile/customer/auth/otp/verify`
- Auth: tidak perlu

### Body

- `phone` (string, required)
- `otp` (string, required)
- `deviceName` (string, optional)

### Contoh Request

```json
{
    "phone": "081234567890",
    "otp": "123456",
    "deviceName": "android"
}
```

### Contoh Response 200 (akun sudah ada)

```json
{
    "success": true,
    "message": "Login berhasil.",
    "data": {
        "status": "existing_user",
        "token": "1|...",
        "tokenType": "Bearer",
        "customer": {
            "id": 1,
            "name": "Bimo"
        }
    }
}
```

### Contoh Response 200 (akun baru)

```json
{
    "success": true,
    "message": "OTP valid. Silakan lanjutkan registrasi.",
    "data": {
        "status": "new_user",
        "phone": "081234567890"
    }
}
```

---

## 3) Register

- Method: `POST`
- URL: `/api/mobile/customer/auth/register`
- Auth: tidak perlu

### Body

- `phone` (string, required)
- `name` (string, required, max 255)
- `email` (string, optional, email, unique)
- `gender` (string, optional): `male` atau `female`
- `password` (string, optional, min 6)
- `date_of_birth` (date, optional)
- `deviceName` (string, optional)

### Contoh Response 200

```json
{
    "success": true,
    "message": "Registrasi berhasil.",
    "data": {
        "token": "1|...",
        "tokenType": "Bearer",
        "customer": {
            "id": 1,
            "name": "Bimo"
        }
    }
}
```

---

## 4) Login Dengan Password

- Method: `POST`
- URL: `/api/mobile/customer/auth/login-password`
- Auth: tidak perlu

### Body

- `phone` (string, required)
- `password` (string, required)
- `deviceName` (string, optional)

### Contoh Response 200

```json
{
    "success": true,
    "message": "Login berhasil.",
    "data": {
        "token": "1|...",
        "tokenType": "Bearer",
        "customer": {
            "id": 1,
            "name": "Bimo"
        }
    }
}
```

---

## 5) Profile Saya

- Method: `GET`
- URL: `/api/mobile/customer/auth/me`
- Auth: wajib `customer_sanctum`

### Contoh Response 200

```json
{
    "success": true,
    "message": "Berhasil mengambil data profil.",
    "data": {
        "id": 1,
        "name": "Bimo"
    }
}
```

---

## 6) Logout

- Method: `POST`
- URL: `/api/mobile/customer/auth/logout`
- Auth: wajib `customer_sanctum`

### Contoh Response 200

```json
{
    "success": true,
    "message": "Logout berhasil.",
    "data": null
}
```

---

## Ringkasan Endpoint

- `POST /api/mobile/customer/auth/otp/request`
- `POST /api/mobile/customer/auth/otp/verify`
- `POST /api/mobile/customer/auth/register`
- `POST /api/mobile/customer/auth/login-password`
- `GET /api/mobile/customer/auth/me`
- `POST /api/mobile/customer/auth/logout`
