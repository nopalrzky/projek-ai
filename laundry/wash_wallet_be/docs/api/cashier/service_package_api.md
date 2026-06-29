# Service Package API (Mobile Cashier) - Flutter Guide

Dokumentasi ini untuk endpoint Service Package pada mobile cashier.

Base path:

- `/api/mobile/cashier/service-packages`

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

Saat ini controller ini hanya menyediakan endpoint read-only (`index` dan `show`), sehingga tidak ada request body validation 422 dari controller ini.

---

## 1) List Service Packages (index)

- Method: `GET`
- URL: `/api/mobile/cashier/service-packages`

### Query Params

- `search` (string, optional)
- `outletId` (int, optional)
- `isActive` (boolean, optional)
- `minPrice` (float, optional)
- `maxPrice` (float, optional)
- `minValidityDays` (int, optional)
- `maxValidityDays` (int, optional)
- `sortBy` (string, optional, default: `createdAt`)
    - allowed: `name`, `price`, `validityDays`, `createdAt`, `updatedAt`
- `sortDirection` (string, optional: `asc|desc`, default: `desc`)
- `page` (int, optional, default: `1`)
- `perPage` (int, optional, default: `15`)

### Example Request

```http
GET /api/mobile/cashier/service-packages?outletId=1&isActive=true&sortBy=price&sortDirection=asc&page=1&perPage=10
```

### Example Response 200

```json
{
    "success": true,
    "message": "Service packages retrieved successfully",
    "data": [
        {
            "id": 5,
            "name": "Paket 30 Hari",
            "description": "Paket laundry bulanan untuk pelanggan reguler",
            "price": 150000,
            "validityDays": 30,
            "isActive": true,
            "outlet": {
                "id": 1,
                "name": "Outlet Utama"
            },
            "servicePackageItems": [
                {
                    "id": 21,
                    "servicePackageId": 5,
                    "laundryServiceId": 15,
                    "quantity": 10,
                    "servicePackage": null,
                    "laundryService": {
                        "id": 15,
                        "categoryId": 2,
                        "unitId": 1,
                        "name": "Cuci Kering",
                        "description": "Layanan cuci kering reguler",
                        "price": 15000,
                        "durationHours": 24,
                        "minQuantity": 1,
                        "slug": "cuci-kering",
                        "isActive": true,
                        "category": {
                            "id": 2,
                            "name": "Laundry"
                        },
                        "outlet": null,
                        "unit": {
                            "id": 1,
                            "name": "Kg"
                        },
                        "laundryServiceProcesses": [],
                        "servicePackageItems": [],
                        "laundryServiceProcessesCount": 0,
                        "servicePackageItemsCount": 0,
                        "createdAt": "2026-04-19T08:00:00.000000Z",
                        "updatedAt": "2026-04-19T08:00:00.000000Z",
                        "deletedAt": null
                    },
                    "createdAt": "2026-04-19T08:00:00.000000Z",
                    "updatedAt": "2026-04-19T08:00:00.000000Z"
                }
            ],
            "customerSubscriptions": [],
            "servicePackageItemsCount": 1,
            "customerSubscriptionsCount": 0,
            "createdAt": "2026-04-19T08:00:00.000000Z",
            "updatedAt": "2026-04-19T08:00:00.000000Z",
            "deletedAt": null
        }
    ],
    "meta": {
        "currentPage": 1,
        "from": 1,
        "lastPage": 1,
        "perPage": 10,
        "to": 1,
        "total": 1,
        "path": "https://your-domain/api/mobile/cashier/service-packages"
    }
}
```

---

## 2) Service Package Detail (show)

- Method: `GET`
- URL: `/api/mobile/cashier/service-packages/{id}`

### Path Param

- `id` (int, required)

### Example Response 200

```json
{
    "success": true,
    "message": "Service package retrieved successfully",
    "data": {
        "id": 5,
        "name": "Paket 30 Hari",
        "description": "Paket laundry bulanan untuk pelanggan reguler",
        "price": 150000,
        "validityDays": 30,
        "isActive": true,
        "outlet": {
            "id": 1,
            "name": "Outlet Utama"
        },
        "servicePackageItems": [
            {
                "id": 21,
                "servicePackageId": 5,
                "laundryServiceId": 15,
                "quantity": 10,
                "servicePackage": null,
                "laundryService": {
                    "id": 15,
                    "categoryId": 2,
                    "unitId": 1,
                    "name": "Cuci Kering",
                    "description": "Layanan cuci kering reguler",
                    "price": 15000,
                    "durationHours": 24,
                    "minQuantity": 1,
                    "slug": "cuci-kering",
                    "isActive": true,
                    "category": {
                        "id": 2,
                        "name": "Laundry"
                    },
                    "outlet": null,
                    "unit": {
                        "id": 1,
                        "name": "Kg"
                    },
                    "laundryServiceProcesses": [],
                    "servicePackageItems": [],
                    "laundryServiceProcessesCount": 0,
                    "servicePackageItemsCount": 0,
                    "createdAt": "2026-04-19T08:00:00.000000Z",
                    "updatedAt": "2026-04-19T08:00:00.000000Z",
                    "deletedAt": null
                },
                "createdAt": "2026-04-19T08:00:00.000000Z",
                "updatedAt": "2026-04-19T08:00:00.000000Z"
            }
        ],
        "customerSubscriptions": [],
        "servicePackageItemsCount": 1,
        "customerSubscriptionsCount": 0,
        "createdAt": "2026-04-19T08:00:00.000000Z",
        "updatedAt": "2026-04-19T08:00:00.000000Z",
        "deletedAt": null
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
    "message": "Gagal memuat data paket layanan"
}
```

---

## Status Values

Status aktif paket layanan di model:

- `isActive = true`
- `isActive = false`

Catatan:

- Status ini adalah boolean, bukan enum string.

---

## Field Mapping untuk Flutter

Model `ServicePackage`:

- `id`: int
- `name`: string|null
- `description`: string|null
- `price`: number
- `validityDays`: int|null
- `isActive`: bool
- `outlet`: object|null
- `servicePackageItems`: array
- `customerSubscriptions`: array
- `servicePackageItemsCount`: int
- `customerSubscriptionsCount`: int
- `createdAt`: string (ISO 8601)
- `updatedAt`: string (ISO 8601)
- `deletedAt`: string (ISO 8601)|null

Model `ServicePackageItem`:

- `id`: int
- `servicePackageId`: int|null
- `laundryServiceId`: int|null
- `quantity`: number
- `servicePackage`: object|null
- `laundryService`: object|null
- `createdAt`: string (ISO 8601)
- `updatedAt`: string (ISO 8601)

Model `LaundryService` (nested pada item paket):

- `id`: int
- `categoryId`: int
- `unitId`: int
- `name`: string
- `description`: string|null
- `price`: number
- `durationHours`: int
- `minQuantity`: int
- `slug`: string
- `isActive`: bool
- `category`: object|null
- `outlet`: object|null
- `unit`: object|null
- `laundryServiceProcesses`: array
- `servicePackageItems`: array
- `laundryServiceProcessesCount`: int
- `servicePackageItemsCount`: int
- `createdAt`: string (ISO 8601)
- `updatedAt`: string (ISO 8601)
- `deletedAt`: string (ISO 8601)|null

---

## Catatan Implementasi Saat Ini

- Controller ini hanya menyediakan endpoint `index` dan `show`.
- `customerSubscriptions` ada di resource, tetapi pada controller ini relasi tersebut tidak dimuat, jadi umumnya akan kosong pada response API ini.
- Saat paket belum memiliki relasi tambahan, beberapa nested object bisa bernilai `null` atau array kosong.
