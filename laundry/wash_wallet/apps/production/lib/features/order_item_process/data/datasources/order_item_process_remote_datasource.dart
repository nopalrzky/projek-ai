import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class OrderItemProcessRemoteDataSource {
  Future<OrderItemProcessModel> start(int id);
  Future<OrderItemProcessModel> complete(int id);
}

class OrderItemProcessRemoteDataSourceImpl
    implements OrderItemProcessRemoteDataSource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  OrderItemProcessRemoteDataSourceImpl(this._dio, this._endpoints);

  @override
  Future<OrderItemProcessModel> start(int id) async {
    try {
      final response = await _dio.post(_endpoints.orderItemProcessStart(id));
      _validateResponse(response);

      final data = response.data['data'] as Map<String, dynamic>;
      final processData = data['process'] as Map<String, dynamic>;

      return OrderItemProcessModel.fromJson(processData);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OrderItemProcessModel> complete(int id) async {
    try {
      final response = await _dio.post(_endpoints.orderItemProcessComplete(id));
      _validateResponse(response);

      final data = response.data['data'] as Map<String, dynamic>;
      final processData = data['process'] as Map<String, dynamic>;

      return OrderItemProcessModel.fromJson(processData);
    } catch (e) {
      throw _handleError(e);
    }
  }

  void _validateResponse(Response response) {
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw ApiException(
        message: response.data['message'] ?? 'Request failed',
        statusCode: response.statusCode,
      );
    }
  }

  Exception _handleError(Object e) {
    if (e is ApiException) return e;
    if (e is DioException) {
      return NetworkException(message: e.message ?? 'Connection Error');
    }
    return ApiException(message: e.toString());
  }
}
