# Customer Home API (Mobile Customer)

Dokumentasi endpoint home untuk aplikasi mobile customer.

Base path:

- `/api/mobile/customer/dashboard`

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
    "data": {}
}
```

### Error

```json
{
    "success": false,
    "message": "..."
}
```

---

## 1) Home Dashboard

- Method: `GET`
- URL: `/api/mobile/customer/dashboard/home`

Endpoint ini mengembalikan data utama untuk layar Home customer.

### Data Sections

- `customer`: data profil customer login
- `primaryAddress`: alamat utama customer (atau `null`)
- `orderSummary`: ringkasan status order customer
- `recentOrders`: 5 order terbaru customer
- `featuredOutlets`: 5 outlet aktif dengan exposure aktif

### Contoh Response 200

```json
{
    "success": true,
    "message": "Customer home dashboard retrieved successfully",
    "data": {
        "customer": {
            "id": 10,
            "phone": "081234567890",
            "name": "Bimo",
            "email": "bimo@mail.com",
            "gender": "male",
            "avatar": null,
            "date_of_birth": "1998-07-10",
            "is_verified": true,
            "is_active": true,
            "last_login_at": "2026-04-27T10:00:00.000000Z"
        },
        "primaryAddress": {
            "id": 2,
            "label": "Rumah",
            "recipientName": "Bimo",
            "recipientPhone": "081234567890",
            "street": "Jl. Sukajadi No. 10",
            "notes": "Dekat minimarket",
            "latitude": -6.89,
            "longitude": 107.61,
            "isPrimary": true,
            "createdAt": "2026-04-27T08:00:00.000000Z",
            "updatedAt": "2026-04-27T08:00:00.000000Z"
        },
        "orderSummary": {
            "totalOrders": 12,
            "activeOrders": 3,
            "readyToPickup": 1,
            "completedOrders": 8
        },
        "recentOrders": [
            {
                "id": 2001,
                "orderNumber": "ORD-20260427-0001",
                "status": "in_progress",
                "paymentStatus": "unpaid",
                "totalAmount": 35000,
                "remainingAmount": 35000,
                "orderDate": "2026-04-27T09:00:00.000000Z",
                "estimatedCompletion": "2026-04-27T17:00:00.000000Z",
                "outletName": "Wash Wallet Cihampelas"
            }
        ],
        "featuredOutlets": [
            {
                "id": 1,
                "name": "Wash Wallet Cihampelas",
                "status": "active",
                "cityName": "Bandung",
                "districtName": "Coblong"
            }
        ]
    }
}
```

### Contoh Response 401

```json
{
    "success": false,
    "message": "Unauthenticated"
}
```

### Contoh Response 500

```json
{
    "success": false,
    "message": "Gagal memuat data home customer"
}
```

---

## Endpoint Summary

- `GET /api/mobile/customer/dashboard/home`
