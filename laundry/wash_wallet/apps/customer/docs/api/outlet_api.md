# Outlet Feature API (Mobile Customer)

Dokumentasi endpoint outlet untuk aplikasi mobile customer, termasuk filter fitur exposure.

Base path:

- `/api/mobile/customer/outlets`

Auth:

- Wajib Bearer Token customer (`auth:customer_sanctum`)

Header wajib:

```http
Authorization: Bearer <access_token>
Accept: application/json
Content-Type: application/json
```

## Standard Response Envelope

### Success

```json
{
    "success": true,
    "message": "...",
    "data": {},
    "meta": {}
}
```

Catatan:

- `meta` hanya muncul untuk endpoint list ter-paginate.

### Error

```json
{
    "success": false,
    "message": "..."
}
```

---

## 1) List Outlets (index)

- Method: `GET`
- URL: `/api/mobile/customer/outlets`

### Query Params

- `search` (string, optional)
- `status` (string, optional)
- `provinceId` (int, optional)
- `cityId` (int, optional)
- `districtId` (int, optional)
- `isExposure` (boolean, optional)
- `sortBy` (string, optional, default `createdAt`)
- `sortDirection` (string, optional, default `desc`)
- `page` (int, optional, default `1`)
- `perPage` (int, optional, default `15`)

### Catatan Filter Exposure

- Jika `isExposure` tidak dikirim: filter exposure tidak diterapkan.
- Jika `isExposure=true`: hanya outlet dengan exposure aktif.
- Jika `isExposure=false`: hanya outlet tanpa exposure aktif.

### Contoh Request

```http
GET /api/mobile/customer/outlets?isExposure=true&page=1&perPage=10
```

### Contoh Response 200

```json
{
    "success": true,
    "message": "Outlets retrieved successfully",
    "data": [
        {
            "id": 1,
            "name": "Wash Wallet Cihampelas",
            "status": "active",
            "phone": "081234567890"
        }
    ],
    "meta": {
        "currentPage": 1,
        "from": 1,
        "lastPage": 2,
        "perPage": 10,
        "to": 10,
        "total": 15
    }
}
```

---

## 2) Outlet Detail (show)

- Method: `GET`
- URL: `/api/mobile/customer/outlets/{id}`

### Path Params

- `id` (int, required)

### Contoh Response 200

```json
{
    "success": true,
    "message": "Outlet retrieved successfully",
    "data": {
        "id": 1,
        "name": "Wash Wallet Cihampelas",
        "status": "active"
    }
}
```

### Contoh Response 404

```json
{
    "success": false,
    "message": "Data tidak ditemukan"
}
```

---

## Endpoint Summary

- `GET /api/mobile/customer/outlets`
- `GET /api/mobile/customer/outlets/{id}`

Catatan:

- Route `/api/mobile/customer/outlets/nearby` sudah terdaftar, tetapi dokumentasi ini hanya mencakup endpoint yang sudah tersedia pada controller saat ini.
