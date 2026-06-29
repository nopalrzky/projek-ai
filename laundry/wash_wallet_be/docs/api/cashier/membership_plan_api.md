# Membership Plan API (Mobile Cashier) - Flutter Guide

Dokumentasi ini untuk endpoint Membership Plan pada mobile cashier.

Base path:

- `/api/mobile/cashier/membership-plans`

Auth:

- Wajib Bearer Token (Sanctum)

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

- `meta` hanya ada pada endpoint list (`index`) karena pagination.

### Error (controller)

```json
{
    "success": false,
    "message": "..."
}
```

### Validation Error (422)

Saat ini endpoint pada controller ini hanya read-only (`index` dan `getById`), sehingga tidak ada request body validation 422 dari controller ini.

---

## 1) List Membership Plans (index)

- Method: `GET`
- URL: `/api/mobile/cashier/membership-plans`

### Query Params

- `search` (string, optional)
- `outletId` (int, optional)
- `isActive` (boolean, optional)
- `minPrice` (float, optional)
- `maxPrice` (float, optional)
- `minDurationDays` (int, optional)
- `maxDurationDays` (int, optional)
- `minDiscountPercentage` (float, optional)
- `maxDiscountPercentage` (float, optional)
- `sortBy` (string, optional, default: `createdAt`)
    - allowed: `name`, `price`, `durationDays`, `createdAt`, `updatedAt`
- `sortOrder` (string, optional: `asc|desc`, default: `desc`)
- `page` (int, optional, default: `1`)
- `perPage` (int, optional, default: `15`)

### Example Request

```http
GET /api/mobile/cashier/membership-plans?outletId=1&isActive=true&sortBy=price&sortOrder=asc&page=1&perPage=10
```

### Example Response 200

```json
{
    "success": true,
    "message": "Membership plans retrieved successfully",
    "data": [
        {
            "id": 3,
            "outletId": 1,
            "name": "Paket Gold",
            "price": 250000,
            "durationDays": 30,
            "isActive": true,
            "discountPercentage": 10,
            "description": "Diskon untuk layanan laundry reguler",
            "level": 2,
            "createdAt": "2026-04-19T10:00:00.000000Z",
            "updatedAt": "2026-04-19T10:00:00.000000Z",
            "outlet": {
                "id": 1,
                "name": "Outlet Utama"
            },
            "membershipContracts": [],
            "membershipContractsCount": 0
        }
    ],
    "meta": {
        "currentPage": 1,
        "from": 1,
        "lastPage": 1,
        "perPage": 10,
        "to": 1,
        "total": 1,
        "path": "https://your-domain/api/mobile/cashier/membership-plans"
    }
}
```

---

## 2) Membership Plan Detail (getById)

- Method: `GET`
- URL: `/api/mobile/cashier/membership-plans/{membershipPlanId}`

### Path Param

- `membershipPlanId` (int, required)

### Example Response 200

```json
{
    "success": true,
    "message": "Membership plan retrieved successfully",
    "data": {
        "id": 3,
        "outletId": 1,
        "name": "Paket Gold",
        "price": 250000,
        "durationDays": 30,
        "isActive": true,
        "discountPercentage": 10,
        "description": "Diskon untuk layanan laundry reguler",
        "level": 2,
        "createdAt": "2026-04-19T10:00:00.000000Z",
        "updatedAt": "2026-04-19T10:00:00.000000Z",
        "outlet": {
            "id": 1,
            "name": "Outlet Utama"
        },
        "membershipContracts": [
            {
                "id": 55,
                "customerId": 10,
                "outletId": 1,
                "membershipPlanId": 3,
                "startAt": "2026-04-20T00:00:00.000000Z",
                "expiredAt": "2026-05-20T00:00:00.000000Z",
                "status": "active",
                "totalPaid": 250000,
                "formattedTotalPaid": "Rp. 250.000,00",
                "createdAt": "2026-04-20T10:00:00.000000Z",
                "updatedAt": "2026-04-20T10:00:00.000000Z",
                "customer": {
                    "id": 10,
                    "name": "Budi Santoso"
                },
                "outlet": {
                    "id": 1,
                    "name": "Outlet Utama"
                },
                "membershipPlan": null
            }
        ],
        "membershipContractsCount": 1
    }
}
```

### Example Response 404

```json
{
    "success": false,
    "message": "Data tidak ditemukan"
}
```

### Example Response 500

```json
{
    "success": false,
    "message": "Gagal memuat data paket membership"
}
```

---

## Field Mapping untuk Flutter

Model `MembershipPlan`:

- `id`: int
- `outletId`: int
- `name`: string
- `price`: number
- `durationDays`: int
- `isActive`: bool
- `discountPercentage`: number
- `description`: string|null
- `level`: int|null
- `createdAt`: string (ISO 8601)
- `updatedAt`: string (ISO 8601)
- `outlet`: object|null
- `membershipContracts`: array
- `membershipContractsCount`: int

Model `MembershipContract` (nested pada detail):

- `id`: int
- `customerId`: int
- `outletId`: int
- `membershipPlanId`: int
- `startAt`: string (ISO 8601)
- `expiredAt`: string (ISO 8601)
- `status`: string (`active`|`expired`)
- `totalPaid`: number
- `formattedTotalPaid`: string
- `createdAt`: string (ISO 8601)
- `updatedAt`: string (ISO 8601)
- `customer`: object|null
- `outlet`: object|null
- `membershipPlan`: object|null
