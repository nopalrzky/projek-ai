import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';

abstract class FcmTokenDatasource {
  Future<void> registerToken({
    required String token,
    String? deviceId,
    String? deviceName,
  });

  Future<void> removeToken(String token);
}

class FcmTokenDatasourceImpl implements FcmTokenDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  FcmTokenDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<void> registerToken({
    required String token,
    String? deviceId,
    String? deviceName,
  }) async {
    await _dio.post(
      _endpoints.updateFcmToken,
      data: {
        'token': token,
        if (deviceId != null && deviceId.isNotEmpty) 'device_id': deviceId,
        if (deviceName != null && deviceName.isNotEmpty)
          'device_name': deviceName,
      },
    );
  }

  @override
  Future<void> removeToken(String token) async {
    await _dio.delete(_endpoints.updateFcmToken, data: {'token': token});
  }
}
