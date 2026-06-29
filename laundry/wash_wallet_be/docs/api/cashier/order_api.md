# Order API (Mobile Cashier) - Flutter Guide

Dokumentasi ini untuk endpoint Order pada mobile cashier.

Base path:

- `/api/mobile/cashier/orders`

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

Untuk request validation (`StoreOrderRequest`, `UpdateOrderRequest`), format 422 mengikuti default Laravel:

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "customerId": ["Pelanggan harus dipilih"]
    }
}
```

---

## 1) List Orders (index)

- Method: `GET`
- URL: `/api/mobile/cashier/orders`

### Query Params

- `search` (string, optional)
- `status` (string, optional)
    - common values: `pending`, `in_progress`, `processing`, `ready`, `completed`, `delivered`, `cancelled`, `on_hold`
- `paymentStatus` (string, optional)
    - common values: `unpaid`, `partial`, `paid`, `refunded`
- `outletId` (int, optional)
- `customerId` (int, optional)
- `employeeId` (int, optional)
- `orderDate.from` (date `YYYY-MM-DD`, optional)
- `orderDate.to` (date `YYYY-MM-DD`, optional)
- `estimatedCompletion.from` (date `YYYY-MM-DD`, optional)
- `estimatedCompletion.to` (date `YYYY-MM-DD`, optional)
- `totalAmount.min` (float, optional)
- `totalAmount.max` (float, optional)
- `sortBy` (string, optional, fallback default: `orderDate`)
    - allowed: `orderNumber`, `status`, `paymentStatus`, `totalAmount`, `paidAmount`, `remainingAmount`, `orderDate`, `estimatedCompletion`, `actualCompletion`, `pickupDate`, `createdAt`, `updatedAt`
- `sortDirection` (string, optional: `asc|desc`, default: `desc`)
- `page` (int, optional, default: `1`)
- `perPage` (int, optional, default: `15`)

### Example Request

```http
GET /api/mobile/cashier/orders?status=in_progress&paymentStatus=partial&outletId=1&page=1&perPage=10
```

### Example Response 200

```json
{
    "success": true,
    "message": "Order list retrieved successfully",
    "data": [
        {
            "id": 101,
            "orderNumber": "ORD20260419010001",
            "status": "in_progress",
            "statusLabel": "Diproses",
            "statusBadgeVariant": "info",
            "completionPercentage": 50,
            "paymentStatus": "partial",
            "paymentStatusLabel": "Cicilan",
            "paymentStatusBadgeVariant": "warning",
            "customerId": 10,
            "employeeId": 3,
            "customer": {
                "id": 10,
                "name": "Budi Santoso"
            },
            "employee": {
                "id": 3,
                "name": "Kasir A"
            },
            "outlet": null,
            "commissionLogs": [],
            "subtotal": 120000,
            "formattedSubtotal": "Rp 120.000",
            "discountAmount": 10000,
            "formattedDiscountAmount": "Rp 10.000",
            "taxAmount": 0,
            "formattedTaxAmount": "Rp 0",
            "totalAmount": 110000,
            "formattedTotalAmount": "Rp 110.000",
            "paidAmount": 50000,
            "formattedPaidAmount": "Rp 50.000",
            "remainingAmount": 60000,
            "formattedRemainingAmount": "Rp 60.000",
            "orderDate": "2026-04-19T09:00:00.000000Z",
            "formattedOrderDate": "19 Apr 2026, 09:00",
            "estimatedCompletion": "2026-04-20T12:00:00.000000Z",
            "formattedEstimatedCompletion": "20 Apr 2026, 12:00",
            "actualCompletion": null,
            "formattedActualCompletion": null,
            "pickupDate": null,
            "formattedPickupDate": null,
            "lastStatusUpdate": "2026-04-19T09:10:00.000000Z",
            "formattedLastStatusUpdate": "19 Apr 2026, 09:10",
            "notes": "Tolong pisahkan pakaian putih",
            "internalNotes": null,
            "specialInstructions": ["jangan pakai pemutih"],
            "orderItems": [],
            "orderItemsCount": 0,
            "createdAt": "2026-04-19T09:00:00.000000Z",
            "updatedAt": "2026-04-19T09:10:00.000000Z",
            "formattedCreatedAt": "19 Apr 2026, 09:00",
            "formattedUpdatedAt": "19 Apr 2026, 09:10",
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
        "path": "https://your-domain/api/mobile/cashier/orders"
    }
}
```

---

## 2) Order Detail (show)

- Method: `GET`
- URL: `/api/mobile/cashier/orders/{id}`

### Path Param

- `id` (int, required)

### Example Response 200

```json
{
    "success": true,
    "message": "Order retrieved successfully",
    "data": {
        "id": 101,
        "orderNumber": "ORD20260419010001",
        "status": "in_progress",
        "paymentStatus": "partial",
        "customerId": 10,
        "employeeId": 3,
        "customer": {
            "id": 10,
            "name": "Budi Santoso"
        },
        "employee": {
            "id": 3,
            "name": "Kasir A"
        },
        "orderItems": [
            {
                "id": 700,
                "orderId": 101,
                "laundryServiceId": 15,
                "laundryServiceName": "Cuci Kering 1 Kg",
                "quantity": 3,
                "status": "pending",
                "totalAmount": 30000
            }
        ]
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
    "message": "Gagal memuat data order"
}
```

---

## 3) Create Order (store)

- Method: `POST`
- URL: `/api/mobile/cashier/orders`

### Body (JSON)

- `customerId` (int, required, exists `customers.id`)
- `employeeId` (int, required, exists `employees.id`)
- `paymentStatus` (string, required: `unpaid|paid|partial`)
- `paymentMethod` (string, nullable: `cash|transfer`, dilarang jika `paymentStatus=unpaid`)
- `sourceAccountId` (int, nullable, required jika `paymentMethod=transfer`, exists `accounts.id`)
- `notes` (string, optional, max 1000)
- `internalNotes` (string, optional, max 1000)
- `specialInstructions` (array, optional)
- `discountAmount` (number, optional, min 0)
- `taxAmount` (number, optional, min 0)
- `paidAmount` (number, nullable, required jika `paymentStatus` adalah `paid` atau `partial`)
- `orderDate` (date, optional)
- `estimatedCompletion` (date, optional)
- `orderItems` (array, required, min 1)
- `orderItems[].laundryServiceId` (int, required)
- `orderItems[].quantity` (number, required, min 0.01)
- `orderItems[].discountAmount` (number, optional, min 0)
- `orderItems[].isPackageUsage` (bool, optional)
- `orderItems[].customerSubscriptionId` (int, nullable, required jika `isPackageUsage=true`)
- `orderItems[].quotaUsed` (number, nullable, required jika `isPackageUsage=true`)
- `orderItems[].itemNotes` (string, optional, max 500)

### Example Request

```json
{
    "customerId": 10,
    "employeeId": 3,
    "paymentStatus": "partial",
    "paymentMethod": "cash",
    "paidAmount": 50000,
    "discountAmount": 10000,
    "notes": "Tolong pisahkan pakaian putih",
    "orderItems": [
        {
            "laundryServiceId": 15,
            "quantity": 3,
            "discountAmount": 0,
            "itemNotes": "Baju kantor"
        },
        {
            "laundryServiceId": 21,
            "quantity": 2,
            "isPackageUsage": true,
            "customerSubscriptionId": 88,
            "quotaUsed": 2
        }
    ]
}
```

### Example Response 201

```json
{
    "success": true,
    "message": "Order created successfully",
    "data": {
        "id": 101,
        "orderNumber": "ORD20260419010001",
        "status": "pending",
        "paymentStatus": "partial",
        "totalAmount": 110000,
        "paidAmount": 50000,
        "remainingAmount": 60000,
        "customerId": 10,
        "employeeId": 3,
        "orderItemsCount": 2
    }
}
```

---

## 4) Update Order (update)

- Method: `PUT`
- URL: `/api/mobile/cashier/orders/{id}`

### Path Param

- `id` (int, required)

### Body (JSON, partial update)

- `customerId` (int, optional)
- `employeeId` (int, optional)
- `orderType` (string, optional: `regular|express|same_day`)
- `paymentMethod` (string, optional: `cash|debit|credit|ewallet|qris`)
- `paymentStatus` (string, optional: `pending|paid|partial`)
- `orderStatus` (string, optional: `pending|processing|ready|completed|cancelled`)
- `notes` (string|null, optional, max 1000)
- `internalNotes` (string|null, optional, max 1000)
- `specialInstructions` (array|null, optional)
- `discountAmount` (number|null, optional, min 0)
- `taxAmount` (number|null, optional, min 0)
- `paidAmount` (number|null, optional, min 0)
- `orderDate` (date|null, optional)
- `estimatedCompletion` (date|null, optional)
- `pickupDate` (date|null, optional)
- `orderItems` (array, optional, min 1)
- `orderItems[].laundryServiceId` (int, required_with `orderItems`)
- `orderItems[].quantity` (number, required_with `orderItems`, min 0.01)
- `orderItems[].discountAmount` (number, optional)
- `orderItems[].productionStatus` (string, optional: `pending|in_progress|completed`)
- `orderItems[].isPackageUsage` (bool, optional)
- `orderItems[].customerSubscriptionId` (int, optional)
- `orderItems[].itemNotes` (string, optional, max 500)

### Example Request

```json
{
    "orderStatus": "processing",
    "paymentStatus": "partial",
    "paidAmount": 70000,
    "internalNotes": "Prioritas pelanggan VIP"
}
```

### Example Response 200

```json
{
    "success": true,
    "message": "Order updated successfully",
    "data": {
        "id": 101,
        "status": "processing",
        "paymentStatus": "partial",
        "paidAmount": 70000,
        "remainingAmount": 40000
    }
}
```

---

## 5) Delete Order (destroy)

- Method: `DELETE`
- URL: `/api/mobile/cashier/orders/{id}`

### Path Param

- `id` (int, required)

### Example Response 200

```json
{
    "success": true,
    "message": "Order deleted successfully",
    "data": {
        "deleted": true
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

## 6) Start Order (start)

- Method: `POST`
- URL: `/api/mobile/cashier/orders/{id}/start`

### Path Param

- `id` (int, required)

### Body (JSON)

- `employeeId` (int, optional, exists `employees.id`)

### Example Request

```json
{
    "employeeId": 3
}
```

### Example Response 200

```json
{
    "success": true,
    "message": "Order berhasil dimulai",
    "data": {
        "id": 101,
        "status": "in_progress",
        "orderItemsCount": 2
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
    "message": "Gagal memulai order"
}
```

---

## 7) Complete Order (complete)

- Method: `POST`
- URL: `/api/mobile/cashier/orders/{id}/complete`

### Path Param

- `id` (int, required)

### Example Response 200

```json
{
    "success": true,
    "message": "Order berhasil diselesaikan",
    "data": {
        "id": 101,
        "status": "completed",
        "actualCompletion": "2026-04-19T12:00:00.000000Z"
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
    "message": "Seluruh item harus diselesaikan terlebih dahulu (Status: Selesai) sebelum order dapat diselesaikan."
}
```

---

## 9. Terima Pesanan (Accept Order)

- **Endpoint**: `POST /{id}/accept`
- **Method**: `POST`
- **Deskripsi**: Menerima order yang masuk dari pelanggan (status `requested`) untuk kemudian diproses dan ditimbang.

### Header
- `Authorization`: Bearer Token

### Body Params (JSON)
*(Opsional)*
- `employeeId` (integer): ID kasir yang menerima pesanan (default: kasir yang sedang login).

### Response Success (200 OK)
```json
{
    "success": true,
    "message": "Order berhasil diterima",
    "data": { ... }
}
```

---

## 10. Tolak Pesanan (Reject Order)

- **Endpoint**: `POST /{id}/reject`
- **Method**: `POST`
- **Deskripsi**: Menolak order yang masuk dari pelanggan (status `requested`).

### Header
- `Authorization`: Bearer Token

### Body Params (JSON)
- `employeeId` (integer, opsional): ID kasir (default: kasir login).
- `reason` (string, opsional): Alasan penolakan pesanan.

### Response Success (200 OK)
```json
{
    "success": true,
    "message": "Order berhasil ditolak",
    "data": { ... }
}
```

---

## 11. Pengukuran / Penimbangan Pesanan (Weight Order)

- **Endpoint**: `POST /{id}/weigh`
- **Method**: `POST`
- **Deskripsi**: Melakukan penimbangan pesanan (yang berstatus `accepted` atau `requested`) untuk mengukur `quantity` sehingga `subtotal` dan `total_amount` pesanan dapat dihitung oleh sistem.

### Header
- `Authorization`: Bearer Token

### Body Params (JSON)
```json
{
    "customerId": 1,
    "employeeId": 2,
    "notes": "Pesanan reguler",
    "internalNotes": "Pelanggan VIP",
    "specialInstructions": ["Jangan dicampur luntur"],
    "orderItems": [
        {
            "quantity": 2.5,
            "itemNotes": "Harum ekstra"
        }
    ]
}
```
*Catatan:* `orderItems` dikirim sebagai array item sesuai dengan urutan dari `orderItems` di database. Tiap item cukup memuat `quantity` dan `itemNotes`.

### Response Success (200 OK)
```json
{
    "success": true,
    "message": "Order berhasil ditimbang dan diberi harga",
    "data": { ... }
}
```

---

## Field Mapping untuk Flutter

Model `Order` (ringkas):

- `id`: int
- `orderNumber`: string
- `status`: string
- `statusLabel`: string
- `statusBadgeVariant`: string
- `completionPercentage`: int
- `paymentStatus`: string
- `paymentStatusLabel`: string
- `paymentStatusBadgeVariant`: string
- `customerId`: int
- `employeeId`: int
- `subtotal`: number
- `discountAmount`: number
- `taxAmount`: number
- `totalAmount`: number
- `paidAmount`: number
- `remainingAmount`: number
- `orderDate`: string|datetime
- `estimatedCompletion`: string|datetime|null
- `actualCompletion`: string|datetime|null
- `pickupDate`: string|datetime|null
- `lastStatusUpdate`: string|datetime|null
- `notes`: string|null
- `internalNotes`: string|null
- `specialInstructions`: array|null
- `customer`: object|null
- `employee`: object|null
- `outlet`: object|null
- `orderItems`: array
- `orderItemsCount`: int
- `createdAt`: string (ISO 8601)
- `updatedAt`: string (ISO 8601)
- `deletedAt`: string (ISO 8601)|null

---

## Catatan Implementasi Saat Ini

- Filter `estimatedCompletion.from` dan `estimatedCompletion.to` sudah dibaca di controller, tetapi belum diaplikasikan pada query service.
- Filter `totalAmount.min` dan `totalAmount.max` dibaca di controller sebagai `totalAmountMin/Max`, sedangkan service menggunakan `minTotalAmount/maxTotalAmount`. Artinya filter total amount belum efektif tanpa penyelarasan key filter di service/controller.
