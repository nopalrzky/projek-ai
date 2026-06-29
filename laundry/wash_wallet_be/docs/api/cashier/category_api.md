# Category API (Mobile Cashier) - Flutter Guide

Dokumentasi ini hanya untuk endpoint Category pada mobile cashier:

- index
- store
- show
- update
- destroy

## Base URL

`/api/mobile/cashier/categories`

## Authentication

Semua endpoint wajib menggunakan Bearer Token (Sanctum).

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

### Error (custom controller)

```json
{
    "success": false,
    "message": "..."
}
```

### Error Validasi Laravel (422)

Untuk request validation (`StoreCategoryRequest`, `UpdateCategoryRequest`), format 422 mengikuti default Laravel:

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "name": ["Category name is required."]
    }
}
```

---

## 1) List Categories (index)

- Method: `GET`
- URL: `/api/mobile/cashier/categories`

### Query Params

- `search` (string, optional)
- `outletId` (integer, optional)
- `isActive` (boolean, optional)
- `sortBy` (string, optional, default: `created_at`)
- `sortDirection` (string, optional: `asc|desc`, default: `desc`)
- `page` (integer, optional, default: `1`)
- `perPage` (integer, optional, default: `15`)

### Example Request

```http
GET /api/mobile/cashier/categories?outletId=1&search=Wash&isActive=true&page=1&perPage=10
```

### Example Response 200

```json
{
    "success": true,
    "message": "Categories retrieved successfully",
    "data": [
        {
            "id": 12,
            "outletId": 1,
            "name": "Cuci Kering",
            "slug": "cuci-kering",
            "description": "Layanan cuci kering reguler",
            "isActive": true,
            "createdAt": "2026-04-19T07:44:12.000000Z",
            "updatedAt": "2026-04-19T07:44:12.000000Z",
            "deletedAt": null,
            "outlet": {
                "id": 1,
                "name": "Outlet A"
            },
            "laundryServices": [],
            "laundryServicesCount": 0
        }
    ],
    "meta": {
        "currentPage": 1,
        "from": 1,
        "lastPage": 3,
        "perPage": 10,
        "to": 10,
        "total": 23,
        "path": "https://your-domain/api/mobile/cashier/categories",
        "firstPageUrl": "https://your-domain/api/mobile/cashier/categories?page=1",
        "lastPageUrl": "https://your-domain/api/mobile/cashier/categories?page=3",
        "nextPageUrl": "https://your-domain/api/mobile/cashier/categories?page=2",
        "prevPageUrl": null
    }
}
```

---

## 2) Create Category (store)

- Method: `POST`
- URL: `/api/mobile/cashier/categories`

### Body (JSON)

- `outletId` (integer, required, must exist in `outlets`)
- `name` (string, required, max 255)
- `description` (string, optional, max 1000)

### Example Request

```json
{
    "outletId": 1,
    "name": "Cuci Express",
    "description": "Selesai 4 jam"
}
```

### Example Response 201

```json
{
    "success": true,
    "message": "Category created successfully",
    "data": {
        "id": 34,
        "outletId": 1,
        "name": "Cuci Express",
        "slug": "cuci-express",
        "description": "Selesai 4 jam",
        "isActive": true,
        "createdAt": "2026-04-19T08:00:00.000000Z",
        "updatedAt": "2026-04-19T08:00:00.000000Z",
        "deletedAt": null,
        "outlet": {
            "id": 1,
            "name": "Outlet A"
        },
        "laundryServices": [],
        "laundryServicesCount": 0
    }
}
```

---

## 3) Get Category Detail (show)

- Method: `GET`
- URL: `/api/mobile/cashier/categories/{id}`

### Path Param

- `id` (integer, required)

### Example Response 200

```json
{
    "success": true,
    "message": "Category retrieved successfully",
    "data": {
        "id": 34,
        "outletId": 1,
        "name": "Cuci Express",
        "slug": "cuci-express",
        "description": "Selesai 4 jam",
        "isActive": true,
        "createdAt": "2026-04-19T08:00:00.000000Z",
        "updatedAt": "2026-04-19T08:00:00.000000Z",
        "deletedAt": null,
        "outlet": null,
        "laundryServices": [
            {
                "id": 101,
                "name": "Cuci Kering 1 Kg"
            }
        ],
        "laundryServicesCount": 1
    }
}
```

### Example Response 404

```json
{
    "success": false,
    "message": "Kategori tidak ditemukan"
}
```

---

## 4) Update Category (update)

- Method: `PUT`
- URL: `/api/mobile/cashier/categories/{id}`

### Path Param

- `id` (integer, required)

### Body (JSON)

- `name` (string, required, max 255)
- `outletId` (integer, optional, must exist in `outlets`)
- `description` (string|null, optional, max 1000)
- `isActive` (boolean, optional)

### Example Request

```json
{
    "name": "Cuci Express Plus",
    "description": "Selesai 3 jam",
    "isActive": true
}
```

### Example Response 200

```json
{
    "success": true,
    "message": "Category updated successfully",
    "data": {
        "id": 34,
        "outletId": 1,
        "name": "Cuci Express Plus",
        "slug": "cuci-express-plus",
        "description": "Selesai 3 jam",
        "isActive": true,
        "createdAt": "2026-04-19T08:00:00.000000Z",
        "updatedAt": "2026-04-19T08:10:00.000000Z",
        "deletedAt": null,
        "outlet": {
            "id": 1,
            "name": "Outlet A"
        },
        "laundryServices": [],
        "laundryServicesCount": 0
    }
}
```

---

## 5) Delete Category (destroy)

- Method: `DELETE`
- URL: `/api/mobile/cashier/categories/{id}`

### Path Param

- `id` (integer, required)

### Example Response 200

```json
{
    "success": true,
    "message": "Category deleted successfully",
    "data": null
}
```

### Example Response 404

```json
{
    "success": false,
    "message": "Kategori tidak ditemukan"
}
```

---

## Field Mapping untuk Flutter Model

Gunakan mapping berikut dari response `data`:

- `id`: int
- `outletId`: int?
- `name`: String
- `slug`: String
- `description`: String?
- `isActive`: bool
- `createdAt`: String (ISO8601) / DateTime
- `updatedAt`: String (ISO8601) / DateTime
- `deletedAt`: String? (ISO8601) / DateTime?
- `outlet`: object?
- `laundryServices`: list
- `laundryServicesCount`: int

## cURL Quick Test

```bash
curl --location 'https://your-domain/api/mobile/cashier/categories?page=1&perPage=10' \
  --header 'Authorization: Bearer <access_token>' \
  --header 'Accept: application/json'
```
