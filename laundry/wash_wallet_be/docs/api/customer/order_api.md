# Customer Order API Documentation

Base URL: `/api/mobile/customer/orders`
Authentication: Bearer Token (Sanctum Customer)

## 1. Get All Orders
Mendapatkan daftar semua order milik pelanggan yang sedang login.

- **Endpoint:** `GET /`
- **Headers:**
  - `Authorization: Bearer {token}`
- **Query Parameters:**
  - `customerAccountId`: int (**Required**) - ID akun pelanggan
  - `page`: int (Optional)
  - `perPage`: int (Optional)
  - `search`: string (Optional)
  - `status`: string (Optional)
  - `sortBy`: string (Optional)
  - `sortDirection`: string (Optional)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Order list retrieved successfully",
  "data": [
    {
      "id": 1,
      "order_number": "ORD-20231010-0001",
      "status": "pending",
      "total_amount": 100000,
      "payment_status": "unpaid"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 1
  }
}
```

## 2. Get Order by ID
Mendapatkan detail spesifik order berdasarkan ID.

- **Endpoint:** `GET /{id}`
- **Headers:**
  - `Authorization: Bearer {token}`
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "id": 1,
    "order_number": "ORD-20231010-0001",
    "status": "pending",
    "total_amount": 100000,
    "payment_status": "unpaid",
    "order_items": [
      {
        "id": 1,
        "laundry_service_id": 2,
        "quantity": 1
      }
    ]
  }
}
```

## 3. Create (Store) Order
Membuat order baru dari aplikasi customer.

- **Endpoint:** `POST /`
- **Headers:**
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- **Request Body:**
```json
{
  "customerAccountId": 1,
  "outletId": 1,
  "paymentMethod": "cod", // 'cod' atau 'transfer'
  "pickupType": "courier", // 'courier' atau 'self_pickup'
  "notes": "Catatan tambahan (opsional)",
  "customerAddressId": 2, // Wajib jika pickupType 'courier'
  "pickupScheduleId": 3, // Wajib jika pickupType 'courier'
  "pickupDate": "2023-11-20", // Wajib jika pickupType 'courier', format YYYY-MM-DD
  "orderItems": [
    {
      "laundryServiceId": 5
    }
  ]
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 12,
    "order_number": "ORD-20231120-0012",
    "status": "requested"
  }
}
```

## 4. Cancel Order
Membatalkan order yang masih berstatus `requested` atau `pending`.

- **Endpoint:** `POST /{id}/cancel`
- **Headers:**
  - `Authorization: Bearer {token}`
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Order berhasil dibatalkan",
  "data": {
    "id": 12,
    "status": "cancelled"
  }
}
```
- **Error Response:** Jika order sudah diproses atau tidak ditemukan.
```json
{
  "success": false,
  "message": "Order tidak dapat dibatalkan karena sudah diproses.",
  "errors": {}
}
```
