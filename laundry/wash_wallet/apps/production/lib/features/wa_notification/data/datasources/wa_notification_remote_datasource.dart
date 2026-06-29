import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class WaNotificationRemoteDatasource {
  Future<WaNotificationPreviewModel> getPreview(int orderId);
  Future<Map<String, dynamic>> sendNotification(int orderId);
}

class WaNotificationRemoteDatasourceImpl
    implements WaNotificationRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  WaNotificationRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<WaNotificationPreviewModel> getPreview(int orderId) async {
    final response = await _dio.get(_endpoints.waNotificationPreview(orderId));
    return WaNotificationPreviewModel.fromJson(response.data['data']);
  }

  @override
  Future<Map<String, dynamic>> sendNotification(int orderId) async {
    final response = await _dio.post(_endpoints.waNotificationSend(orderId));
    return response.data as Map<String, dynamic>;
  }
}
