import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:dio/dio.dart';
import 'dio_config.dart';

class DioProvider {
  final DioConfig _config;
  final List<Interceptor> _interceptors;

  Dio? _dio;

  DioProvider({
    required DioConfig config,
    required List<Interceptor> interceptors,
  }) : _config = config,
       _interceptors = interceptors;

  Dio getDio() {
    _dio ??= _config.createDio(interceptors: _interceptors);
    return _dio!;
  }
}
