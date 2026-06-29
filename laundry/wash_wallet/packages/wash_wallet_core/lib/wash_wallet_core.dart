/// Shared core infrastructure for WashWallet apps.
library wash_wallet_core;

// Auth
export 'src/auth/auth_token.dart';
export 'src/auth/token_storage.dart';

// Exceptions
export 'src/exceptions/cache_exception.dart';
export 'src/exceptions/format_data_exception.dart';
export 'src/exceptions/permission_exception.dart';

// Failures
export 'src/failures/failure.dart';
export 'src/failures/auth_failure.dart';
export 'src/failures/cache_failure.dart';
export 'src/failures/network_failure.dart';
export 'src/failures/pending_registration_failure.dart';
export 'src/failures/server_failure.dart';
export 'src/failures/validation_failure.dart';

// Network
export 'src/network/dio/dio_config.dart';
export 'src/network/dio/dio_provider.dart';
export 'src/network/api/api_client.dart';
export 'src/network/api/api_endpoints.dart';
export 'src/network/api/api_providers.dart';
export 'src/network/error_mapper.dart';
export 'src/network/network_retry_mixin.dart';
export 'src/network/exceptions/api_exception.dart';
export 'src/network/exceptions/network_exception.dart';
export 'src/network/exceptions/local_storage_exception.dart';
export 'src/network/interceptors/api_interceptor.dart';
export 'src/network/interceptors/auth_interceptor.dart';
export 'src/network/interceptors/error_interceptor.dart';
export 'src/network/interceptors/logging_interceptor.dart';

// Result
export 'src/result/result.dart';
export 'src/models/paginated_data.dart';

// Storage
export 'src/storage/secure_storage_provider.dart';

// Services
export 'src/services/onboarding_service.dart';
export 'src/services/thermal_printer_service.dart';

// Utils
export 'src/utils/idempotency_key.dart';
