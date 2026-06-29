import 'package:dio/dio.dart';
import '../exceptions/network_exception.dart';
import '../exceptions/api_exception.dart';

class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.sendTimeout ||
        err.type == DioExceptionType.receiveTimeout) {
      handler.reject(
        DioException(
          requestOptions: err.requestOptions,
          error: NetworkException(
            message: 'Connection timeout',
            statusCode: err.response?.statusCode,
          ),
        ),
      );
      return;
    }

    if (err.type == DioExceptionType.connectionError ||
        err.type == DioExceptionType.unknown) {
      handler.reject(
        DioException(
          requestOptions: err.requestOptions,
          error: NetworkException(
            message: 'Network connection error',
            statusCode: err.response?.statusCode,
          ),
        ),
      );
      return;
    }

    if (err.response != null) {
      final statusCode = err.response!.statusCode;
      final data = err.response!.data;

      String message = 'Unexpected API error';
      Map<String, dynamic>? errors;

      if (data is Map<String, dynamic>) {
        message = data['message'] ?? message;
        if (data.containsKey('errors')) {
          errors = data['errors'] as Map<String, dynamic>?;
        }
      }

      handler.reject(
        DioException(
          requestOptions: err.requestOptions,
          response: err.response,
          error: ApiException(
            message: message,
            statusCode: statusCode,
            errors: errors,
          ),
        ),
      );
      return;
    }

    handler.next(err);
  }
}
