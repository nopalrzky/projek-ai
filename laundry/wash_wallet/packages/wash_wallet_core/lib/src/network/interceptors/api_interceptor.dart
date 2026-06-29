import 'package:dio/dio.dart';

class ApiInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    options.headers['Accept'] = 'application/json';

    if (options.method != 'GET' && options.headers['Content-Type'] == null) {
      options.headers['Content-Type'] = 'application/json';
    }

    handler.next(options);
  }
}
