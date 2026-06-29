# Customer Dashboard Home API Implementation Plan

This plan details the implementation of a new API endpoint for the Customer App's home dashboard. The endpoint will return the authenticated customer's profile information and their primary address.

## Proposed Changes

### Controller

#### [MODIFY] [DashboardController.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Controllers/Api/DashboardController.php)

- Add a new method `indexCustomer(): JsonResponse`
- Retrieve the currently authenticated customer via `Auth::guard('customer_sanctum')->user()`.
- Load the customer's primary address using `$customer->load('primaryAddress')`.
- Return a successful JSON response containing the customer profile data (`CustomerAccountResource`) and the primary address data (`CustomerAddressResource`).

**Expected Data Structure:**

```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "customer": {
      "id": 1,
      "name": "John Doe",
      "phone": "08123456789",
      ...
    },
    "primaryAddress": {
      "id": 1,
      "label": "Rumah",
      "street": "Jl. Sudirman No. 1",
      ...
    }
  }
}
```

---

### Routes

#### [MODIFY] [api_mobile_customer.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/routes/api_mobile_customer.php)

- Add a new route prefix `dashboard` to group dashboard-related endpoints.
- Register the `GET /dashboard/home` route pointing to `DashboardController::indexCustomer`.
- This route must be protected by the `auth:customer_sanctum` middleware.

```php
Route::prefix('dashboard')->name('dashboard.')->controller(App\Http\Controllers\Api\DashboardController::class)->group(function () {
    Route::get('/home', 'indexCustomer')->name('home');
});
```

## Verification Plan

### Automated Tests

1. Verify the `indexCustomer` method correctly eager loads and returns the primary address.
2. Verify the endpoint returns `null` for `primaryAddress` if the customer hasn't set any address as primary.
3. Test that unauthenticated access returns a 401 Unauthorized response.

### Manual Verification

1. Log in to the customer mobile application or test using Postman with a valid `customer_sanctum` token.
2. Hit the `GET /api/mobile/customer/dashboard/home` endpoint.
3. Assert that both `customer` and `primaryAddress` are present and correctly formatted in the JSON response.
