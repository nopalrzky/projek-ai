import '../exceptions/cache_exception.dart';
import '../exceptions/format_data_exception.dart';
import '../exceptions/permission_exception.dart';

import '../failures/failure.dart';
import '../failures/auth_failure.dart';
import '../failures/network_failure.dart';
import '../failures/server_failure.dart';
import '../failures/validation_failure.dart';

import 'exceptions/api_exception.dart';
import 'exceptions/network_exception.dart';

class ErrorMapper {
  Failure map(Exception exception) {
    if (exception is NetworkException) {
      return NetworkFailure(message: exception.message);
    }

    if (exception is ApiException) {
      final statusCode = exception.statusCode;

      if (statusCode == 401 || statusCode == 403) {
        return AuthFailure(message: exception.message);
      }

      if (statusCode == 422) {
        return ValidationFailure(
          message: exception.message,
          errors: exception.errors,
        );
      }

      if (statusCode != null && statusCode >= 500) {
        return ServerFailure(
          message: exception.message,
          statusCode: statusCode,
        );
      }

      return ServerFailure(message: exception.message, statusCode: statusCode);
    }

    if (exception is CacheException) {
      return ServerFailure(message: exception.message);
    }

    if (exception is FormatDataException) {
      return ServerFailure(message: exception.message);
    }

    if (exception is PermissionException) {
      return AuthFailure(message: exception.message);
    }

    return const ServerFailure(message: 'Unexpected error occurred');
  }
}
