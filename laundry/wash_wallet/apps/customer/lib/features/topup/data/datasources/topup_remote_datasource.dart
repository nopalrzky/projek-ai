import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class TopupRemoteDatasource {
  Future<CustomerTopupModel> store(Map<String, dynamic> payload);
  Future<List<CustomerTopupModel>> getAll();
  Future<CustomerTopupModel> getById(int id);
}

class TopupRemoteDatasourceImpl implements TopupRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  TopupRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<CustomerTopupModel> store(Map<String, dynamic> payload) async {
    try {
      final response = await _dio.post(
        _endpoints.customerTopups,
        data: payload,
      );

      final body = _validateResponse(response);
      return CustomerTopupModel.fromJson(body['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<List<CustomerTopupModel>> getAll() async {
    try {
      final response = await _dio.get(_endpoints.customerTopups);

      final body = _validateResponse(response);
      final List data = body['data']['data'] as List? ?? [];
      return data
          .whereType<Map>()
          .map((e) => CustomerTopupModel.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<CustomerTopupModel> getById(int id) async {
    try {
      final response = await _dio.get(_endpoints.customerTopup(id));

      final body = _validateResponse(response);
      return CustomerTopupModel.fromJson(body['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Map<String, dynamic> _validateResponse(Response response) {
    if (response.statusCode != null &&
        response.statusCode! >= 200 &&
        response.statusCode! < 300) {
      final body = response.data;

      if (body is! Map<String, dynamic>) {
        throw ApiException(
          message: 'Invalid response format',
          statusCode: response.statusCode,
        );
      }

      if (body['success'] != true) {
        throw ApiException(
          message: body['message'] as String? ?? 'Request failed',
          statusCode: response.statusCode,
        );
      }

      return body;
    }

    throw ApiException(
      message: 'Request failed',
      statusCode: response.statusCode,
    );
  }

  Exception _handleError(Object e) {
    if (e is ApiException) return e;

    if (e is DioException) {
      if (e.response != null) {
        final data = e.response!.data;
        String message = 'Request failed';
        if (data is Map<String, dynamic> && data['message'] != null) {
          message = data['message'] as String;
        }
        return ApiException(
          message: message,
          statusCode: e.response!.statusCode,
        );
      }
      return NetworkException(message: e.message ?? 'Unknown error occurred');
    }

    return ApiException(message: 'Unexpected error: ${e.toString()}');
  }
}
