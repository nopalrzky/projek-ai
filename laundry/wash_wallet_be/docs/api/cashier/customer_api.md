# Customer API (Mobile Cashier) - Flutter Guide

Dokumentasi ini untuk endpoint Customer pada mobile cashier.

Base path:

- `/api/mobile/cashier/customers`

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

- `meta` hanya untuk endpoint list (`index`) karena pagination.

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
        "name": ["Nama pelanggan wajib diisi."]
    }
}
```

---

## Endpoint Utama (CRUD)

## 1) List Customers (index)

- Method: `GET`
- URL: `/api/mobile/cashier/customers`

### Query Params

- `search` (string, optional)
- `outletId` (int, optional)
- `phone` (string, optional)
- `gender` (string, optional: `male|female`)
- `isActive` (bool, optional)
- `sortBy` (string, optional, default: `created_at`)
- `sortDirection` (string, optional: `asc|desc`, default: `desc`)
- `page` (int, optional, default: `1`)
- `perPage` (int, optional, default: `15`)

### Example Request

```http
GET /api/mobile/cashier/customers?outletId=1&search=budi&page=1&perPage=10
```

### Example Response 200

```json
{
    "success": true,
    "message": "Customer retrieved successfully",
    "data": [
        {
            "id": 10,
            "outletId": 1,
            "name": "Budi Santoso",
            "email": "budi@mail.com",
            "phone": "08123456789",
            "address": "Jl. Merdeka No. 1",
            "gender": "male",
            "dateOfBirth": null,
            "isActive": true,
            "statusLabel": "Active",
            "createdAt": "2026-04-19T08:30:00.000000Z",
            "updatedAt": "2026-04-19T08:30:00.000000Z",
            "deletedAt": null,
            "outlet": {
                "id": 1,
                "name": "Outlet A"
            },
            "orders": [],
            "customerSubscriptions": [],
            "membershipContracts": [],
            "ordersCount": 0,
            "customerSubscriptionsCount": 0,
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
        "path": "https://your-domain/api/mobile/cashier/customers",
        "firstPageUrl": "https://your-domain/api/mobile/cashier/customers?page=1",
        "lastPageUrl": "https://your-domain/api/mobile/cashier/customers?page=1",
        "nextPageUrl": null,
        "prevPageUrl": null
    }
}
```

---

## 2) Create Customer (store)

- Method: `POST`
- URL: `/api/mobile/cashier/customers`

### Body (JSON)

- `name` (string, required, min 2, max 255)
- `outletId` (int, required, exists in outlets)
- `email` (string, optional, email, max 255, unique per outlet)
- `phone` (string, optional, max 20, regex `^[0-9+\-\s()]+$`, unique per outlet)
- `gender` (string, optional: `male|female`)
- `address` (string, optional, max 500)

### Example Request

```json
{
    "name": "Andi Saputra",
    "outletId": 1,
    "email": "andi@mail.com",
    "phone": "081300001111",
    "gender": "male",
    "address": "Bandung"
}
```

### Example Response 201

```json
{
    "success": true,
    "message": "Customer created successfully",
    "data": {
        "id": 11,
        "outletId": 1,
        "name": "Andi Saputra",
        "email": "andi@mail.com",
        "phone": "081300001111",
        "address": "Bandung",
        "gender": "male",
        "dateOfBirth": null,
        "isActive": true,
        "statusLabel": "Active",
        "createdAt": "2026-04-19T08:40:00.000000Z",
        "updatedAt": "2026-04-19T08:40:00.000000Z",
        "deletedAt": null,
        "outlet": null,
        "orders": [],
        "customerSubscriptions": [],
        "membershipContracts": [],
        "ordersCount": 0,
        "customerSubscriptionsCount": 0,
        "membershipContractsCount": 0
    }
}
```

---

## 3) Customer Detail (show)

- Method: `GET`
- URL: `/api/mobile/cashier/customers/{id}`

### Path Param

- `id` (int, required)

### Example Response 200

```json
{
    "success": true,
    "message": "Customer retrieved successfully",
    "data": {
        "id": 11,
        "outletId": 1,
        "name": "Andi Saputra",
        "email": "andi@mail.com",
        "phone": "081300001111",
        "address": "Bandung",
        "gender": "male",
        "dateOfBirth": null,
        "isActive": true,
        "statusLabel": "Active",
        "createdAt": "2026-04-19T08:40:00.000000Z",
        "updatedAt": "2026-04-19T08:40:00.000000Z",
        "deletedAt": null,
        "outlet": {
            "id": 1,
            "name": "Outlet A"
        },
        "orders": [],
        "customerSubscriptions": [],
        "membershipContracts": [],
        "ordersCount": 0,
        "customerSubscriptionsCount": 0,
        "membershipContractsCount": 0
    }
}
```

### Example Response 404

```json
{
    "success": false,
    "message": "Pelanggan tidak ditemukan"
}
```

---

## 4) Update Customer (update)

- Method: `PUT`
- URL: `/api/mobile/cashier/customers/{id}`

### Path Param

- `id` (int, required)

### Body (JSON)

- `name` (string, required, min 2, max 255)
- `outletId` (int, required, exists in outlets)
- `email` (string, optional, email, max 255, unique per outlet)
- `phone` (string, optional, max 20, regex `^[0-9+\-\s()]+$`, unique per outlet)
- `gender` (string, optional: `male|female`)
- `address` (string, optional, max 500)
- `isActive` (bool, required)

### Example Request

```json
{
    "name": "Andi Saputra Update",
    "outletId": 1,
    "email": "andi@mail.com",
    "phone": "081300001111",
    "gender": "male",
    "address": "Jakarta",
    "isActive": true
}
```

### Example Response 200

```json
{
    "success": true,
    "message": "Customer updated successfully",
    "data": {
        "id": 11,
        "outletId": 1,
        "name": "Andi Saputra Update",
        "email": "andi@mail.com",
        "phone": "081300001111",
        "address": "Jakarta",
        "gender": "male",
        "dateOfBirth": null,
        "isActive": true,
        "statusLabel": "Active",
        "createdAt": "2026-04-19T08:40:00.000000Z",
        "updatedAt": "2026-04-19T08:45:00.000000Z",
        "deletedAt": null,
        "outlet": {
            "id": 1,
            "name": "Outlet A"
        },
        "orders": [],
        "customerSubscriptions": [],
        "membershipContracts": [],
        "ordersCount": 0,
        "customerSubscriptionsCount": 0,
        "membershipContractsCount": 0
    }
}
```

---

## 5) Delete Customer (destroy)

- Method: `DELETE`
- URL: `/api/mobile/cashier/customers/{id}`

### Path Param

- `id` (int, required)

### Example Response 200

```json
{
    "success": true,
    "message": "Customer deleted successfully",
    "data": null
}
```

### Example Response 404

```json
{
    "success": false,
    "message": "Pelanggan tidak ditemukan"
}
```

---

## Endpoint Tambahan di CustomerController

Endpoint ini juga aktif pada route mobile cashier:

1. `POST /api/mobile/cashier/customers/{customerId}/membership-contracts`

- Method controller: `storeMembershipContract`
- Request class: `StoreMembershipContractRequest`

2. `POST /api/mobile/cashier/customers/{customerId}/customer-subscriptions`

- Method controller: `storeCustomerSubscription`
- Request class: `StoreCustomerSubscriptionRequest`

3. `PUT /api/mobile/cashier/customers/{customerId}/customer-subscriptions/{customerSubscriptionId}`

- Method controller: `updateCustomerSubscription`
- Request class: `UpdateCustomerSubscriptionRequest`

---

## Field Mapping untuk Flutter

Gunakan model dengan mapping berikut:

- `id`: int
- `outletId`: int?
- `name`: String
- `email`: String?
- `phone`: String?
- `address`: String?
- `gender`: String?
- `dateOfBirth`: dynamic (nullable)
- `isActive`: bool
- `statusLabel`: String
- `createdAt`: DateTime?
- `updatedAt`: DateTime?
- `deletedAt`: DateTime?
- `outlet`: Object?
- `orders`: List
- `customerSubscriptions`: List
- `membershipContracts`: List
- `ordersCount`: int
- `customerSubscriptionsCount`: int
- `membershipContractsCount`: int

## cURL Quick Test

```bash
curl --location 'https://your-domain/api/mobile/cashier/customers?page=1&perPage=10' \
  --header 'Authorization: Bearer <access_token>' \
  --header 'Accept: application/json'
```
