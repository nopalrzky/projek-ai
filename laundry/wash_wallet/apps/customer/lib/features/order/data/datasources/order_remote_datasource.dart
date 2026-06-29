import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class OrderRemoteDatasource {
  Future<OrderModel> store(Map<String, dynamic> payload);
  Future<List<OrderModel>> getAll({
    required int customerAccountId,
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    String? sortBy,
    String? sortDirection,
  });
  Future<OrderModel> getById(int orderId);
  Future<OrderModel> cancel(int orderId);
  Future<OrderModel> pay(int orderId, Map<String, dynamic> payload);
  Future<OrderModel> scheduleDelivery(
    int orderId,
    Map<String, dynamic> payload,
  );
  Future<OrderModel> complete(int orderId);
  Future<OrderModel> submitReview(int orderId, Map<String, dynamic> payload);
}

class OrderRemoteDatasourceImpl implements OrderRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  OrderRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<OrderModel> store(Map<String, dynamic> payload) async {
    try {
      final response = await _dio.post(_endpoints.orders, data: payload);

      final body = _validateResponse(response);
      return OrderModel.fromJson(body['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<List<OrderModel>> getAll({
    required int customerAccountId,
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    String? sortBy,
    String? sortDirection,
  }) async {
    try {
      final response = await _dio.get(
        _endpoints.orders,
        queryParameters: {
          'customerAccountId': customerAccountId,
          'page': page,
          'perPage': perPage,
          'search': ?search,
          'status': ?status,
          'sortBy': ?sortBy,
          'sortDirection': ?sortDirection,
        },
      );

      final body = _validateResponse(response);
      final List data = body['data'] as List? ?? [];
      return data
          .whereType<Map>()
          .map((e) => OrderModel.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OrderModel> getById(int orderId) async {
    try {
      final response = await _dio.get(_endpoints.order(orderId));

      final body = _validateResponse(response);
      return OrderModel.fromJson(body['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OrderModel> cancel(int orderId) async {
    try {
      final response = await _dio.post(_endpoints.orderCancel(orderId));

      final body = _validateResponse(response);
      return OrderModel.fromJson(body['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OrderModel> pay(int orderId, Map<String, dynamic> payload) async {
    try {
      final response = await _dio.post(
        _endpoints.orderPay(orderId),
        data: payload,
      );

      final body = _validateResponse(response);
      return OrderModel.fromJson(body['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OrderModel> scheduleDelivery(
    int orderId,
    Map<String, dynamic> payload,
  ) async {
    try {
      final response = await _dio.post(
        _endpoints.orderScheduleDelivery(orderId),
        data: payload,
      );

      final body = _validateResponse(response);
      return OrderModel.fromJson(body['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OrderModel> complete(int orderId) async {
    try {
      final response = await _dio.post(_endpoints.orderComplete(orderId));

      final body = _validateResponse(response);
      return OrderModel.fromJson(body['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OrderModel> submitReview(int orderId, Map<String, dynamic> payload) async {
    try {
      final response = await _dio.post(
        '${_endpoints.order(orderId)}/review',
        data: payload,
      );

      final body = _validateResponse(response);
      return OrderModel.fromJson(body['data']);
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
