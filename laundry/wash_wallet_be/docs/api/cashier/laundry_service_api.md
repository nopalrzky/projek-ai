# Laundry Service API (Mobile Cashier) - Flutter Guide

Dokumentasi ini untuk endpoint Laundry Service pada mobile cashier.

Base path:

- `/api/mobile/cashier/laundry-services`

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

- `meta` hanya muncul pada endpoint list (`index`) karena pagination.

### Error (controller)

```json
{
    "success": false,
    "message": "..."
}
```

### Validation Error (422)

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "name": ["Nama layanan laundry harus diisi."]
    }
}
```

---

## 1) List Laundry Services (index)

- Method: `GET`
- URL: `/api/mobile/cashier/laundry-services`

### Query Params

- `search` (string, optional)
- `isActive` (bool, optional)
- `outletId` (int, optional)
- `categoryId` (int, optional)
- `unitId` (int, optional)
- `sortBy` (string, optional, default: `createdAt`)
- `sortDirection` (string, optional: `asc|desc`, default: `desc`)
- `page` (int, optional, default: `1`)
- `perPage` (int, optional, default: `15`)

### Example Request

```http
GET /api/mobile/cashier/laundry-services?outletId=1&categoryId=2&isActive=true&page=1&perPage=10
```

### Example Response 200

```json
{
    "success": true,
    "message": "Laundry service list retrieved successfully",
    "data": [
        {
            "id": 101,
            "categoryId": 2,
            "unitId": 1,
            "name": "Cuci Kering",
            "description": "Reguler 24 jam",
            "price": 8000,
            "durationHours": 24,
            "minQuantity": 1,
            "slug": "cuci-kering",
            "isActive": true,
            "category": {
                "id": 2,
                "name": "Reguler"
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
            "createdAt": "2026-04-19T09:00:00.000000Z",
            "updatedAt": "2026-04-19T09:00:00.000000Z",
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
        "path": "https://your-domain/api/mobile/cashier/laundry-services",
        "firstPageUrl": "https://your-domain/api/mobile/cashier/laundry-services?page=1",
        "lastPageUrl": "https://your-domain/api/mobile/cashier/laundry-services?page=1",
        "nextPageUrl": null,
        "prevPageUrl": null
    }
}
```

---

## 2) Create Laundry Service (store)

- Method: `POST`
- URL: `/api/mobile/cashier/laundry-services`

### Body (JSON)

- `categoryId` (int, required, min 1, exists: categories)
- `unitId` (int, required, min 1)
- `name` (string, required, min 3, max 255, regex)
- `description` (string, optional, max 500)
- `durationHours` (int, optional, min 0)
- `price` (number, optional, min 0)
- `minQuantity` (int, optional, min 0)
- `laundryServiceProcesses` (array, optional)
- `laundryServiceProcesses[].processId` (int, required jika array diisi, exists: processes, distinct)

Regex `name`:

- hanya huruf, angka, spasi, dan simbol: `+ - & ( ) . /`

### Example Request

```json
{
    "categoryId": 2,
    "unitId": 1,
    "name": "Cuci Express",
    "description": "Selesai 4 jam",
    "durationHours": 4,
    "price": 12000,
    "minQuantity": 1,
    "laundryServiceProcesses": [{ "processId": 1 }, { "processId": 2 }]
}
```

### Example Response 201

```json
{
    "success": true,
    "message": "Laundry service created successfully",
    "data": {
        "id": 120,
        "categoryId": 2,
        "unitId": 1,
        "name": "Cuci Express",
        "description": "Selesai 4 jam",
        "price": 12000,
        "durationHours": 4,
        "minQuantity": 1,
        "slug": "cuci-express",
        "isActive": true,
        "category": null,
        "outlet": null,
        "unit": null,
        "laundryServiceProcesses": [],
        "servicePackageItems": [],
        "laundryServiceProcessesCount": 0,
        "servicePackageItemsCount": 0,
        "createdAt": "2026-04-19T09:10:00.000000Z",
        "updatedAt": "2026-04-19T09:10:00.000000Z",
        "deletedAt": null
    }
}
```

---

## 3) Laundry Service Detail (show)

- Method: `GET`
- URL: `/api/mobile/cashier/laundry-services/{id}`

### Path Param

- `id` (int, required)

### Example Response 200

```json
{
    "success": true,
    "message": "Laundry service retrieved successfully",
    "data": {
        "id": 120,
        "categoryId": 2,
        "unitId": 1,
        "name": "Cuci Express",
        "description": "Selesai 4 jam",
        "price": 12000,
        "durationHours": 4,
        "minQuantity": 1,
        "slug": "cuci-express",
        "isActive": true,
        "category": {
            "id": 2,
            "name": "Reguler"
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
        "createdAt": "2026-04-19T09:10:00.000000Z",
        "updatedAt": "2026-04-19T09:10:00.000000Z",
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

---

## 4) Update Laundry Service (update)

- Method: `PUT`
- URL: `/api/mobile/cashier/laundry-services/{id}`

### Path Param

- `id` (int, required)

### Body (JSON)

- `categoryId` (int, required, min 1)
- `unitId` (int, required, min 1)
- `name` (string, required, min 3, max 255, regex)
- `description` (string, optional, max 500)
- `isActive` (bool, optional)
- `durationHours` (int, optional, min 0)
- `price` (number, optional, min 0)
- `minQuantity` (int, optional, min 0)
- `laundryServiceProcesses` (array, optional)
- `laundryServiceProcesses[].processId` (int, required jika array diisi, exists: processes, distinct)

### Example Request

```json
{
    "categoryId": 2,
    "unitId": 1,
    "name": "Cuci Express Plus",
    "description": "Selesai 3 jam",
    "isActive": true,
    "durationHours": 3,
    "price": 14000,
    "minQuantity": 1
}
```

### Example Response 200

```json
{
    "success": true,
    "message": "Laundry service updated successfully",
    "data": {
        "id": 120,
        "categoryId": 2,
        "unitId": 1,
        "name": "Cuci Express Plus",
        "description": "Selesai 3 jam",
        "price": 14000,
        "durationHours": 3,
        "minQuantity": 1,
        "slug": "cuci-express-plus",
        "isActive": true,
        "category": {
            "id": 2,
            "name": "Reguler"
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
        "createdAt": "2026-04-19T09:10:00.000000Z",
        "updatedAt": "2026-04-19T09:20:00.000000Z",
        "deletedAt": null
    }
}
```

---

## 5) Delete Laundry Service (destroy)

- Method: `DELETE`
- URL: `/api/mobile/cashier/laundry-services/{id}`

### Path Param

- `id` (int, required)

### Example Response 200

```json
{
    "success": true,
    "message": "Laundry service deleted successfully",
    "data": null
}
```

### Example Response 404

```json
{
    "success": false,
    "message": "Data tidak ditemukan"
}
```

---

## Field Mapping untuk Flutter

Gunakan mapping berikut untuk model Laundry Service:

- `id`: int
- `categoryId`: int
- `unitId`: int
- `name`: String
- `description`: String?
- `price`: double
- `durationHours`: int
- `minQuantity`: int
- `slug`: String
- `isActive`: bool
- `category`: Object?
- `outlet`: Object?
- `unit`: Object?
- `laundryServiceProcesses`: List
- `servicePackageItems`: List
- `laundryServiceProcessesCount`: int
- `servicePackageItemsCount`: int
- `createdAt`: DateTime?
- `updatedAt`: DateTime?
- `deletedAt`: DateTime?

## cURL Quick Test

```bash
curl --location 'https://your-domain/api/mobile/cashier/laundry-services?page=1&perPage=10' \
  --header 'Authorization: Bearer <access_token>' \
  --header 'Accept: application/json'
```
