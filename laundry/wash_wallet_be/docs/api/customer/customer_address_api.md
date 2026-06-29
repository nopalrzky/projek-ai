# Customer Address API (Mobile Customer)

Dokumentasi endpoint alamat customer untuk aplikasi mobile customer.

Base path:

- `/api/mobile/customer/addresses`

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

## 1) List Customer Addresses (index)

- Method: `GET`
- URL: `/api/mobile/customer/addresses`

Endpoint ini hanya mengembalikan alamat milik customer yang sedang login.

### Query Params

- `search` (string, optional)
- `isPrimary` (boolean, optional)
- `sortBy` (string, optional, default `createdAt`): `createdAt`, `updatedAt`, `label`, `isPrimary`
- `sortDirection` (string, optional, default `desc`): `asc` / `desc`
- `page` (int, optional, default `1`)
- `perPage` (int, optional, default `15`)

### Contoh Request

```http
GET /api/mobile/customer/addresses?page=1&perPage=10&isPrimary=true
```

### Contoh Response 200

```json
{
    "success": true,
    "message": "Customer addresses retrieved successfully",
    "data": [
        {
            "id": 1,
            "label": "Rumah",
            "recipientName": "Bimo",
            "recipientPhone": "081234567890",
            "street": "Jl. Sukajadi No. 10",
            "notes": "Pagar hitam",
            "latitude": -6.89,
            "longitude": 107.61,
            "isPrimary": true,
            "createdAt": "2026-04-27T08:00:00.000000Z",
            "updatedAt": "2026-04-27T08:00:00.000000Z"
        }
    ],
    "meta": {
        "currentPage": 1,
        "from": 1,
        "lastPage": 1,
        "perPage": 10,
        "to": 1,
        "total": 1
    }
}
```

---

## 2) Detail Customer Address (show)

- Method: `GET`
- URL: `/api/mobile/customer/addresses/{id}`

### Path Param

- `id` (int, required)

### Contoh Response 200

```json
{
    "success": true,
    "message": "Customer address retrieved successfully",
    "data": {
        "id": 1,
        "label": "Rumah",
        "recipientName": "Bimo",
        "recipientPhone": "081234567890",
        "street": "Jl. Sukajadi No. 10",
        "notes": null,
        "latitude": null,
        "longitude": null,
        "isPrimary": true,
        "createdAt": "2026-04-27T08:00:00.000000Z",
        "updatedAt": "2026-04-27T08:00:00.000000Z"
    }
}
```

### Contoh Response 404

```json
{
    "success": false,
    "message": "Alamat tidak ditemukan"
}
```

---

## 3) Create Customer Address (store)

- Method: `POST`
- URL: `/api/mobile/customer/addresses`

### Body

- `label` (string, required, max 50)
- `recipientName` (string, required, max 255)
- `recipientPhone` (string, required, max 20)
- `street` (string, required)
- `notes` (string, optional, max 500)
- `latitude` (numeric, optional, -90 s/d 90)
- `longitude` (numeric, optional, -180 s/d 180)
- `isPrimary` (boolean, optional)

Catatan:

- Jika ini alamat pertama customer, sistem otomatis menjadikannya primary.

### Contoh Response 201

```json
{
    "success": true,
    "message": "Customer address created successfully",
    "data": {
        "id": 2,
        "label": "Kantor",
        "recipientName": "Bimo",
        "recipientPhone": "081234567890",
        "street": "Jl. Setiabudi No. 1",
        "notes": null,
        "latitude": null,
        "longitude": null,
        "isPrimary": false,
        "createdAt": "2026-04-27T09:00:00.000000Z",
        "updatedAt": "2026-04-27T09:00:00.000000Z"
    }
}
```

---

## 4) Update Customer Address (update)

- Method: `PUT` / `PATCH`
- URL: `/api/mobile/customer/addresses/{id}`

### Body

Semua field bersifat optional (partial update), mengikuti field create.

### Contoh Response 200

```json
{
    "success": true,
    "message": "Customer address updated successfully",
    "data": {
        "id": 2,
        "label": "Kantor Baru",
        "recipientName": "Bimo",
        "recipientPhone": "081234567890",
        "street": "Jl. Setiabudi No. 2",
        "notes": "Gedung A",
        "latitude": null,
        "longitude": null,
        "isPrimary": true,
        "createdAt": "2026-04-27T09:00:00.000000Z",
        "updatedAt": "2026-04-27T09:30:00.000000Z"
    }
}
```

---

## 5) Delete Customer Address (destroy)

- Method: `DELETE`
- URL: `/api/mobile/customer/addresses/{id}`

Jika alamat yang dihapus adalah primary, sistem akan memilih alamat lain sebagai primary (jika masih ada).

### Contoh Response 200

```json
{
    "success": true,
    "message": "Customer address deleted successfully",
    "data": null
}
```

---

## Endpoint Summary

- `GET /api/mobile/customer/addresses`
- `GET /api/mobile/customer/addresses/{id}`
- `POST /api/mobile/customer/addresses`
- `PUT /api/mobile/customer/addresses/{id}`
- `PATCH /api/mobile/customer/addresses/{id}`
- `DELETE /api/mobile/customer/addresses/{id}`
