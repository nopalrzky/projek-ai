# Order Item API (Mobile Production)

Dokumentasi ini untuk endpoint Order Item yang ditangani oleh `OrderItemController`.

Base path yang tersedia:

- `/api/mobile/production/order-items`
- `/api/order-items`

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

- `meta` hanya ada pada endpoint list (`index`) saat response berupa pagination.

### Error (controller)

```json
{
    "success": false,
    "message": "..."
}
```

---

## 1) List Order Items (index)

- Method: `GET`
- URL: `/api/mobile/production/order-items`

### Query Params

- `search` (string, optional)
    - mencari di `laundry_service_name`, `item_notes`, `notes`, dan `order.order_number`
- `status` (string, optional)
    - common values: `pending`, `processing`, `done`
- `orderId` (int, optional)
- `laundryServiceId` (int, optional)
- `customerId` (int, optional)
- `startedAt.from` (date `YYYY-MM-DD`, optional)
- `startedAt.to` (date `YYYY-MM-DD`, optional)
- `completedAt.from` (date `YYYY-MM-DD`, optional)
- `completedAt.to` (date `YYYY-MM-DD`, optional)
- `createdAt.from` (date `YYYY-MM-DD`, optional)
- `createdAt.to` (date `YYYY-MM-DD`, optional)
- `sortBy` (string, optional, default: `createdAt`)
    - allowed: `quantity`, `unitPrice`, `discountAmount`, `subtotal`, `totalAmount`, `status`, `startedAt`, `completedAt`, `createdAt`, `updatedAt`
- `sortDirection` (string, optional: `asc|desc`, default: `desc`)
- `page` (int, optional, default: `1`)
- `perPage` (int, optional, default: `15`)

### Example Request

```http
GET /api/mobile/production/order-items?orderId=201&status=processing&search=setrika&sortBy=createdAt&sortDirection=desc&page=1&perPage=10
```

### Example Response 200

```json
{
    "success": true,
    "message": "Daftar order item berhasil diambil",
    "data": [
        {
            "id": 700,
            "orderId": 201,
            "laundryServiceId": 15,
            "laundryServiceName": "Cuci Kering",
            "quantity": 3,
            "unitPrice": 10000,
            "subtotal": 30000,
            "discountAmount": 0,
            "totalAmount": 30000,
            "formattedSubtotal": "Rp 30.000",
            "formattedDiscountAmount": "Rp 0",
            "formattedTotalAmount": "Rp 30.000",
            "status": "processing",
            "completionPercentage": 50,
            "itemNotes": "Setrika rapi",
            "canCompleteOrderItem": false,
            "completeOrderItemReason": "Masih ada proses yang belum selesai",
            "createdAt": "2026-04-23T08:00:00.000000Z",
            "updatedAt": "2026-04-23T09:00:00.000000Z",
            "formattedCreatedAt": "23 Apr 2026 08:00",
            "formattedUpdatedAt": "23 Apr 2026 09:00",
            "order": {
                "id": 201,
                "orderNumber": "ORD202604230010001"
            },
            "laundryService": {
                "id": 15,
                "name": "Cuci Kering"
            },
            "orderItemProcesses": []
        }
    ],
    "meta": {
        "currentPage": 1,
        "from": 1,
        "lastPage": 1,
        "perPage": 10,
        "to": 1,
        "total": 1,
        "path": "https://your-domain/api/mobile/production/order-items",
        "firstPageUrl": "https://your-domain/api/mobile/production/order-items?page=1",
        "lastPageUrl": "https://your-domain/api/mobile/production/order-items?page=1",
        "nextPageUrl": null,
        "prevPageUrl": null
    }
}
```

---

## 2) Order Item Detail (show)

- Method: `GET`
- URL: `/api/mobile/production/order-items/{id}`

### Path Param

- `id` (int, required)

### Example Response 200

```json
{
    "success": true,
    "message": "Order item berhasil diambil",
    "data": {
        "id": 700,
        "orderId": 201,
        "laundryServiceId": 15,
        "laundryServiceName": "Cuci Kering",
        "status": "processing",
        "orderItemProcesses": []
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

## 3) Start Order Item (start)

- Method: `POST`
- URL: `/api/mobile/production/order-items/{id}/start`
- Body: tidak ada

### Path Param

- `id` (int, required)

### Example Response 200

```json
{
    "success": true,
    "message": "Order item berhasil dimulai",
    "data": {
        "id": 700,
        "status": "processing"
    }
}
```

### Example Response 500

```json
{
    "success": false,
    "message": "Gagal memulai order item"
}
```

---

## 4) Complete Order Item (complete)

- Method: `POST`
- URL: `/api/mobile/production/order-items/{id}/complete`

### Path Param

- `id` (int, required)

### Body (JSON)

- `notes` (string, nullable, max 1000)

### Example Request Body

```json
{
    "notes": "Semua proses selesai"
}
```

### Example Response 200

```json
{
    "success": true,
    "message": "Order item berhasil diselesaikan",
    "data": {
        "id": 700,
        "status": "done",
        "itemNotes": "Semua proses selesai"
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
    "message": "Gagal menyelesaikan order item"
}
```
