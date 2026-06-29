import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../models/home_dashboard_model.dart';

abstract class HomeRemoteDatasource {
  Future<HomeDashboardModel> getHomeDashboard();
}

class HomeRemoteDatasourceImpl implements HomeRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  HomeRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<HomeDashboardModel> getHomeDashboard() async {
    try {
      final response = await _dio.get(_endpoints.customerHomeDashboard);
      final body = _validateResponse(response);
      return HomeDashboardModel.fromJson(body['data'] as Map<String, dynamic>);
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
          errors: body['errors'] as Map<String, dynamic>?,
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
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.sendTimeout) {
        return NetworkException(
          message: 'Connection timeout. Please try again.',
        );
      }

      if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.unknown) {
        return NetworkException(
          message: 'No internet connection. Please check your network.',
        );
      }

      if (e.response != null) {
        final statusCode = e.response!.statusCode;
        final data = e.response!.data;

        return ApiException(
          message: data is Map<String, dynamic>
              ? (data['message'] as String? ?? 'Request failed')
              : 'Request failed',
          statusCode: statusCode,
          errors: data is Map<String, dynamic>
              ? data['errors'] as Map<String, dynamic>?
              : null,
        );
      }

      return NetworkException(message: e.message ?? 'Unknown error occurred');
    }

    return ApiException(message: 'Unexpected error: ${e.toString()}');
  }
}
