# wash_wallet_core

Shared core infrastructure for WashWallet apps.

## Contents

### Auth

- `AuthToken` - Represents authentication token with expiration
- `TokenStorage` / `SecureTokenStorage` - Secure token storage using Flutter Secure Storage

### Network

- `DioConfig` - Dio HTTP client configuration
- `DioProvider` - Dio provider and setup
- `ApiClient` - API client wrapper
- `ApiEndpoints` - API endpoint definitions
- `ApiProviders` - API service providers
- `ErrorMapper` - Maps network exceptions to failures
- `NetworkRetryMixin` - Mixin for network retry logic

### Interceptors

- `ApiInterceptor` - Base API interceptor
- `AuthInterceptor` - Authentication interceptor
- `ErrorInterceptor` - Error handling interceptor
- `LoggingInterceptor` - Request/response logging

### Exceptions

- `ApiException` - API-level exceptions
- `NetworkException` - Network-level exceptions
- `LocalStorageException` - Local storage exceptions
- `CacheException` - Cache operation exceptions
- `FormatDataException` - Data format exceptions
- `PermissionException` - Permission exceptions

### Failures

- `Failure` - Base failure class
- `AuthFailure` - Authentication failures
- `NetworkFailure` - Network failures
- `ServerFailure` - Server response failures
- `CacheFailure` - Cache operation failures
- `ValidationFailure` - Validation failures

### Result

- `Result<T>` - Freezed result wrapper class for handling success/failure

### Storage

- `SecureStorageProvider` - Secure storage provider

### Services

- `OnboardingService` - Onboarding service
