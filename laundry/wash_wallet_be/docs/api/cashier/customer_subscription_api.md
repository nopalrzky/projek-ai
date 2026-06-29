# Customer Subscription API (Mobile Cashier) - Flutter Guide

Dokumentasi ini untuk endpoint Customer Subscription pada mobile cashier.

Base path:

- `/api/mobile/cashier/customer-subscriptions`

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

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "customerId": ["Customer harus dipilih"]
    }
}
```

---

## 1) List Customer Subscriptions (index)

- Method: `GET`
- URL: `/api/mobile/cashier/customer-subscriptions`

### Query Params

- `search` (string, optional)
- `status` (string, optional)
- `customerId` (int, optional)
- `outletId` (int, optional)
- `servicePackageId` (int, optional)
- `minPurchaseDate` (date, optional)
- `maxPurchaseDate` (date, optional)
- `expiryAtFrom` (date, optional)
- `expiryAtTo` (date, optional)
- `minPricePaid` (float, optional)
- `maxPricePaid` (float, optional)
- `sortBy` (string, optional, default: `createdAt`)
- `sortDirection` (string, optional: `asc|desc`, default: `desc`)
- `page` (int, optional, default: `1`)
- `perPage` (int, optional, default: `15`)

### Example Request

```http
GET /api/mobile/cashier/customer-subscriptions?status=active&outletId=1&page=1&perPage=10
```

### Example Response 200

```json
{
    "success": true,
    "message": "Customer subscriptions retrieved successfully",
    "data": [
        {
            "id": 88,
            "customerId": 10,
            "servicePackageId": 3,
            "subscriptionCode": "SUB-2026-0001",
            "pricePaid": 150000,
            "purchaseDate": "2026-04-01T00:00:00.000000Z",
            "expiredAt": "2026-05-01T00:00:00.000000Z",
            "status": "active",
            "createdAt": "2026-04-01T09:00:00.000000Z",
            "updatedAt": "2026-04-01T09:00:00.000000Z",
            "remainingDays": 12,
            "isUnlimited": false,
            "statusBadgeVariant": "success",
            "statusLabel": "Active",
            "customer": {
                "id": 10,
                "name": "Budi Santoso"
            },
            "servicePackage": {
                "id": 3,
                "name": "Paket Bulanan"
            },
            "customerQuotas": []
        }
    ],
    "meta": {
        "currentPage": 1,
        "from": 1,
        "lastPage": 1,
        "perPage": 10,
        "to": 1,
        "total": 1,
        "path": "https://your-domain/api/mobile/cashier/customer-subscriptions",
        "firstPageUrl": "https://your-domain/api/mobile/cashier/customer-subscriptions?page=1",
        "lastPageUrl": "https://your-domain/api/mobile/cashier/customer-subscriptions?page=1",
        "nextPageUrl": null,
        "prevPageUrl": null
    }
}
```

---

## 2) Create Customer Subscription (store)

- Method: `POST`
- URL: `/api/mobile/cashier/customer-subscriptions`

### Body (JSON)

- `customerId` (int, required, customer aktif)
- `servicePackageId` (int, required, service package aktif)
- `pricePaid` (number, required, min 0, max 999999999.99)
- `purchaseDate` (date, optional, tidak boleh > hari ini)
- `note` (string, optional, max 1000)

### Example Request

```json
{
    "customerId": 10,
    "servicePackageId": 3,
    "pricePaid": 150000,
    "purchaseDate": "2026-04-01",
    "note": "Pembelian via kasir"
}
```

### Example Response 201

```json
{
    "success": true,
    "message": "Customer subscription created successfully",
    "data": {
        "id": 88,
        "customerId": 10,
        "servicePackageId": 3,
        "subscriptionCode": "SUB-2026-0001",
        "pricePaid": 150000,
        "purchaseDate": "2026-04-01T00:00:00.000000Z",
        "expiredAt": "2026-05-01T00:00:00.000000Z",
        "status": "active",
        "createdAt": "2026-04-01T09:00:00.000000Z",
        "updatedAt": "2026-04-01T09:00:00.000000Z",
        "remainingDays": 30,
        "isUnlimited": false,
        "statusBadgeVariant": "success",
        "statusLabel": "Active",
        "customer": null,
        "servicePackage": null,
        "customerQuotas": []
    }
}
```

### Example Response 404

```json
{
    "success": false,
    "message": "Pelanggan atau paket layanan tidak ditemukan"
}
```

---

## 3) Customer Subscription Detail (show)

- Method: `GET`
- URL: `/api/mobile/cashier/customer-subscriptions/{id}`

### Path Param

- `id` (int, required)

### Example Response 200

```json
{
    "success": true,
    "message": "Customer subscription retrieved successfully",
    "data": {
        "id": 88,
        "customerId": 10,
        "servicePackageId": 3,
        "subscriptionCode": "SUB-2026-0001",
        "pricePaid": 150000,
        "purchaseDate": "2026-04-01T00:00:00.000000Z",
        "expiredAt": "2026-05-01T00:00:00.000000Z",
        "status": "active",
        "createdAt": "2026-04-01T09:00:00.000000Z",
        "updatedAt": "2026-04-01T09:00:00.000000Z",
        "remainingDays": 12,
        "isUnlimited": false,
        "statusBadgeVariant": "success",
        "statusLabel": "Active",
        "customer": {
            "id": 10,
            "name": "Budi Santoso"
        },
        "servicePackage": {
            "id": 3,
            "name": "Paket Bulanan"
        },
        "customerQuotas": []
    }
}
```

### Example Response 404

```json
{
    "success": false,
    "message": "Langganan pelanggan tidak ditemukan"
}
```

---

## 4) Update Customer Subscription (update)

- Method: `PUT`
- URL: `/api/mobile/cashier/customer-subscriptions/{id}`

### Path Param

- `id` (int, required)

### Body (JSON)

- `status` (string, optional tapi jika dikirim wajib valid):
    - `active`
    - `exhausted`
    - `expired`
    - `cancelled`
- `note` (string, optional, max 1000)

### Example Request

```json
{
    "status": "cancelled",
    "note": "Permintaan pelanggan"
}
```

### Example Response 200

```json
{
    "success": true,
    "message": "Customer subscription updated successfully",
    "data": {
        "id": 88,
        "customerId": 10,
        "servicePackageId": 3,
        "subscriptionCode": "SUB-2026-0001",
        "pricePaid": 150000,
        "purchaseDate": "2026-04-01T00:00:00.000000Z",
        "expiredAt": "2026-05-01T00:00:00.000000Z",
        "status": "cancelled",
        "createdAt": "2026-04-01T09:00:00.000000Z",
        "updatedAt": "2026-04-19T09:20:00.000000Z",
        "remainingDays": 12,
        "isUnlimited": false,
        "statusBadgeVariant": "danger",
        "statusLabel": "Cancelled",
        "customer": null,
        "servicePackage": null,
        "customerQuotas": []
    }
}
```

---

## 5) Delete Customer Subscription (destroy)

- Method: `DELETE`
- URL: `/api/mobile/cashier/customer-subscriptions/{id}`

### Path Param

- `id` (int, required)

### Example Response 200

```json
{
    "success": true,
    "message": "Customer subscription deleted successfully",
    "data": null
}
```

### Example Response 404

```json
{
    "success": false,
    "message": "Langganan pelanggan tidak ditemukan"
}
```

---

## Field Mapping untuk Flutter

Mapping model `CustomerSubscription`:

- `id`: int
- `customerId`: int
- `servicePackageId`: int
- `subscriptionCode`: String
- `pricePaid`: double
- `purchaseDate`: DateTime?
- `expiredAt`: DateTime?
- `status`: String
- `createdAt`: DateTime?
- `updatedAt`: DateTime?
- `remainingDays`: int
- `isUnlimited`: bool
- `statusBadgeVariant`: String
- `statusLabel`: String
- `customer`: Object?
- `servicePackage`: Object?
- `customerQuotas`: List

## cURL Quick Test

```bash
curl --location 'https://your-domain/api/mobile/cashier/customer-subscriptions?page=1&perPage=10' \
  --header 'Authorization: Bearer <access_token>' \
  --header 'Accept: application/json'
```
