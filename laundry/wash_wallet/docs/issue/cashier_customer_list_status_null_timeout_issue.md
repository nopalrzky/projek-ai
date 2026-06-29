# Cashier Customer List `Status: null` Timeout Debug Issue

## Scope

This is a debug artifact only. No code changes are included in this step.

## Symptom

The cashier Flutter log shows `Status: null` for the customer list request.

In Dio, `err.response?.statusCode == null` means the exception did not include an HTTP response object. This is different from a normal backend `4xx` or `5xx` response, where Dio would have a response and a status code.

Given that the backend can still finish the customer query successfully, the most likely explanation is that the client timed out or lost the connection before the HTTP response arrived. For this issue, treat `Status: null` as a client-side transport failure signal, not as proof that the backend returned a null status.

## Current Client Findings

- Cashier Dio timeout is configured in `apps/cashier/lib/main.dart`:
  - `connectTimeout`: 30 seconds
  - `receiveTimeout`: 60 seconds
  - `sendTimeout`: 30 seconds
- The cashier Dio instance uses `AuthInterceptor(tokenStorage)` and `LoggingInterceptor()`.
- `packages/wash_wallet_core/lib/src/network/interceptors/logging_interceptor.dart` logs only:
  - `err.response?.statusCode`
  - request base URL and path
  - `err.message`
  - response data, only when `err.response?.data` exists
- The logging interceptor does not log:
  - `DioException.type`
  - `err.error`
  - full URI with query parameters
  - request elapsed duration
  - active timeout config
  - redacted headers
- Because of that, timeout or connection errors can appear as low-information logs such as `Status: null` and `Message: null`.
- `apps/cashier/lib/features/customer/data/datasources/customer_remote_datasource.dart` maps timeout exceptions to `NetworkException(message: 'Connection timeout. Please try again.')`.
- That mapping happens after the logging interceptor has already emitted the raw Dio error log.
- `apps/cashier/lib/features/customer/data/repositories/customer_repository_impl.dart` wraps customer list fetching with `NetworkRetryMixin`.
- `packages/wash_wallet_core/lib/src/network/network_retry_mixin.dart` only retries raw `DioException` values whose type is not `badResponse`.
- The customer datasource catches `DioException` and rethrows `NetworkException`, so the repository retry wrapper does not see the original transient `DioException`. This makes retry ineffective for this customer list path.

## Current Backend Findings

- `webapp/wash_wallet_be/app/Http/Controllers/Api/CustomerController.php#index` loads these relations for the list endpoint:
  - `outlet`
  - `orders`
  - `membershipContracts`
  - `orders.orderItems`
- These relations can make the customer list response large and slow when customers have many orders and order items.
- `webapp/wash_wallet_be/app/Http/Controllers/Api/CustomerController.php#show` also loads fuller detail relations. That is appropriate for the detail endpoint, but the list endpoint does not need the same depth.
- `webapp/wash_wallet_be/app/Http/Controllers/Api/CustomerController.php#getFilters()` sets `withCounts => true`.
- `webapp/wash_wallet_be/app/Services/CustomerService.php#applyFilters()` does not currently use the `withCounts` flag.
- `webapp/wash_wallet_be/app/Http/Resources/Customer/CustomerResource.php` derives `ordersCount`, `customerSubscriptionsCount`, and `membershipContractsCount` from loaded relations with `whenLoaded(...)`.
- Because the list endpoint loads full relations and the resource counts loaded collections, counts are currently coupled to relation loading instead of lightweight `withCount` queries.
- `packages/wash_wallet_domain/lib/src/models/customer_model.dart` only parses summary fields and count fields for the cashier list model:
  - customer identity/status fields
  - `ordersCount`
  - `customerSubscriptionsCount`
  - `membershipContractsCount`
- The cashier list model does not consume nested `orders` or nested `orders.orderItems`, so sending them on the list response is unnecessary.

## Working Diagnosis

The `Status: null` log most likely comes from a Dio timeout or connection interruption before the backend response reaches the Flutter client.

The backend customer list endpoint currently performs and serializes more work than the cashier list UI needs. That extra payload and query cost can push the request beyond the cashier app's `receiveTimeout` of 60 seconds, especially for outlets with many customers, orders, and order items.

The current logs are not diagnostic enough to distinguish `receiveTimeout`, `connectionTimeout`, `sendTimeout`, `connectionError`, cancellation, or another no-response failure type. The UI-level error handling may still show a useful mapped `NetworkException`, but the raw log line loses the important context.

## Recommended Fix Direction

- Improve `LoggingInterceptor` diagnostics:
  - log `DioException.type`
  - log `err.error`
  - log the full URI including query parameters
  - log elapsed duration per request
  - log effective timeout values
  - redact `Authorization` and any other sensitive headers before logging
- Optimize the backend customer list response:
  - use summary/count loading for `index`
  - avoid loading full `orders` and `orders.orderItems` for list responses
  - keep full relations for the detail endpoint only
- Make GET retry effective for the customer list:
  - retry before the datasource maps `DioException` to `NetworkException`, or
  - allow retry on mapped transient `NetworkException` values
- Treat increasing `receiveTimeout` as mitigation only.
- The primary fix should be reducing response payload/time and improving diagnostics.

## Test Scenarios

- Manual backend/API check:
  - call `/api/mobile/cashier/customers?page=1&perPage=15&outletId=1&isActive=true`
  - test with many customers and many orders/order items
  - compare response time and response size before and after backend list optimization
- Flutter timeout handling:
  - simulate Dio `receiveTimeout`
  - confirm the UI receives a non-null user-facing message, such as `Connection timeout. Please try again.`
- Flutter retry behavior:
  - simulate a transient GET failure followed by success
  - confirm customer list retry actually happens
- Backend list response shape:
  - assert customer list response includes summary/count fields
  - assert customer list response does not include nested `orders.orderItems`
- Backend detail response shape:
  - assert customer detail response still includes the full relations required by detail screens

## Assumptions

- Target issue document path: `docs/issue/cashier_customer_list_status_null_timeout_issue.md`.
- This document records debug findings only.
- Implementation fixes should be planned and reviewed separately.
