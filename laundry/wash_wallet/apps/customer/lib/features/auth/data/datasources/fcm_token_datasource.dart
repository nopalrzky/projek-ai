import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';

abstract class FcmTokenRemoteDataSource {
  Future<void> update(String token);
}

class FcmTokenRemoteDataSourceImpl implements FcmTokenRemoteDataSource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  FcmTokenRemoteDataSourceImpl(this._dio, this._endpoints);

  @override
  Future<void> update(String token) async {
    try {
      await _dio.post(
        _endpoints.updateFcmToken,
        data: {'fcm_token': token},
      );
    } catch (e) {
      rethrow;
    }
  }
}
