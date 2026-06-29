import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class OrderReviewRemoteDatasource {
  Future<List<OrderReviewModel>> getAll({
    int? outletId,
    int? customerAccountId,
    int? orderId,
    int? rating,
    int page = 1,
    int perPage = 15,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  });
  Future<OrderReviewModel> getById(int id);
  Future<OutletReviewSummaryModel> getSummary(int outletId);
}

class OrderReviewRemoteDatasourceImpl implements OrderReviewRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  OrderReviewRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<List<OrderReviewModel>> getAll({
    int? outletId,
    int? customerAccountId,
    int? orderId,
    int? rating,
    int page = 1,
    int perPage = 15,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  }) async {
    try {
      final response = await _dio.get(
        _endpoints.orderReviews,
        queryParameters: {
          'outletId': ?outletId,
          'customerAccountId': ?customerAccountId,
          'orderId': ?orderId,
          'rating': ?rating,
          'page': page,
          'perPage': perPage,
          'sortBy': sortBy,
          'sortDirection': sortDirection,
        },
      );

      final body = _validateResponse(response);
      final List data = body['data'] as List? ?? [];
      return data
          .whereType<Map>()
          .map((e) => OrderReviewModel.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OrderReviewModel> getById(int id) async {
    try {
      final response = await _dio.get(_endpoints.orderReview(id));

      final body = _validateResponse(response);
      return OrderReviewModel.fromJson(body['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OutletReviewSummaryModel> getSummary(int outletId) async {
    try {
      final response = await _dio.get(_endpoints.orderReviewSummary(outletId));

      final body = _validateResponse(response);
      return OutletReviewSummaryModel.fromJson(body['data']);
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
          errors: body['errors'] is Map<String, dynamic>
              ? body['errors'] as Map<String, dynamic>
              : null,
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

        String message = 'Request failed';
        if (data is Map<String, dynamic> && data['message'] != null) {
          message = data['message'] as String;
        }

        return ApiException(
          message: message,
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
