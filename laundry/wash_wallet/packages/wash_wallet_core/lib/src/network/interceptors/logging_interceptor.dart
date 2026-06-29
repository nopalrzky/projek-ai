import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class LoggingInterceptor extends Interceptor {
  static const _requestStartTimeKey = '_requestStartTime';

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    options.extra[_requestStartTimeKey] = DateTime.now().millisecondsSinceEpoch;

    debugPrint('----- HTTP REQUEST -----');
    debugPrint('Method: ${options.method}');
    debugPrint('URL: ${options.uri}');
    debugPrint('Headers: ${_redactHeaders(options.headers)}');
    debugPrint(
      'Timeouts: connect=${_formatDuration(options.connectTimeout)}, '
      'receive=${_formatDuration(options.receiveTimeout)}, '
      'send=${_formatDuration(options.sendTimeout)}',
    );
    if (options.data != null) {
      debugPrint('Body: ${options.data}');
    }
    debugPrint('------------------------');

    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    debugPrint('----- HTTP RESPONSE -----');
    debugPrint('Status: ${response.statusCode}');
    debugPrint('URL: ${response.requestOptions.uri}');
    debugPrint('Elapsed: ${_elapsed(response.requestOptions)}');
    debugPrint('Data: ${response.data}');
    debugPrint('-------------------------');

    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    debugPrint('----- HTTP ERROR -----');
    debugPrint('Type: ${err.type.name}');
    debugPrint(
      'Status: ${err.response?.statusCode ?? 'null (no HTTP response)'}',
    );
    debugPrint('URL: ${err.requestOptions.uri}');
    debugPrint('Elapsed: ${_elapsed(err.requestOptions)}');
    debugPrint(
      'Timeouts: connect=${_formatDuration(err.requestOptions.connectTimeout)}, '
      'receive=${_formatDuration(err.requestOptions.receiveTimeout)}, '
      'send=${_formatDuration(err.requestOptions.sendTimeout)}',
    );
    debugPrint('Message: ${err.message ?? 'null'}');
    if (err.error != null) {
      debugPrint('Error detail: ${err.error}');
    }
    if (err.response?.data != null) {
      debugPrint('Data: ${err.response?.data}');
    }
    debugPrint('----------------------');

    handler.next(err);
  }

  Map<String, dynamic> _redactHeaders(Map<String, dynamic> headers) {
    return headers.map((key, value) {
      if (key.toLowerCase() == 'authorization') {
        return MapEntry(key, 'Bearer [REDACTED]');
      }
      return MapEntry(key, value);
    });
  }

  String _elapsed(RequestOptions options) {
    final startTime = options.extra[_requestStartTimeKey] as int?;
    if (startTime == null) return 'unknown';

    return '${DateTime.now().millisecondsSinceEpoch - startTime}ms';
  }

  String _formatDuration(Duration? duration) {
    if (duration == null) return 'null';
    return '${duration.inMilliseconds}ms';
  }
}
