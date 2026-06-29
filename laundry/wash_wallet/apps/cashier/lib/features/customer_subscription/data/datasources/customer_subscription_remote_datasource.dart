import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class CustomerSubscriptionRemoteDatasource {
  Future<List<CustomerSubscriptionModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    int? customerId,
    int? servicePackageId,
    String? minPurchaseDate,
    String? maxPurchaseDate,
    String? expiryAtFrom,
    String? expiryAtTo,
    double? minPricePaid,
    double? maxPricePaid,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
    int? outletId,
  });

  Future<CustomerSubscriptionModel> getById({
    required int customerSubscriptionId,
  });

  Future<CustomerSubscriptionModel> store({
    required int customerId,
    required int servicePackageId,
    required double pricePaid,
    String? purchaseDate,
    String? note,
  });

  Future<CustomerSubscriptionModel> update({
    required int customerSubscriptionId,
    String? status,
    String? note,
  });

  Future<void> destroy({required int customerSubscriptionId});
}

class CustomerSubscriptionRemoteDatasourceImpl
    implements CustomerSubscriptionRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  CustomerSubscriptionRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<List<CustomerSubscriptionModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    int? customerId,
    int? servicePackageId,
    String? minPurchaseDate,
    String? maxPurchaseDate,
    String? expiryAtFrom,
    String? expiryAtTo,
    double? minPricePaid,
    double? maxPricePaid,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
    int? outletId,
  }) async {
    try {
      final queryParams = {
        'page': page,
        'perPage': perPage,
        'sortBy': sortBy,
        'sortDirection': sortDirection,
        if (search != null && search.trim().isNotEmpty) 'search': search,
        'status': ?status,
        'customerId': ?customerId,
        'outletId': ?outletId,
        'servicePackageId': ?servicePackageId,
        'minPurchaseDate': ?minPurchaseDate,
        'maxPurchaseDate': ?maxPurchaseDate,
        'expiryAtFrom': ?expiryAtFrom,
        'expiryAtTo': ?expiryAtTo,
        'minPricePaid': ?minPricePaid,
        'maxPricePaid': ?maxPricePaid,
      };

      final response = await _dio.get(
        _endpoints.customerSubscriptions,
        queryParameters: queryParams,
      );

      final body = _validateResponse(response);
      final List data = body['data'] as List? ?? [];

      final normalizedData = data
          .map((item) => _normalizeJsonData(item as Map<String, dynamic>))
          .toList();

      try {
        return normalizedData
            .map((e) => CustomerSubscriptionModel.fromJson(e))
            .toList();
      } catch (parseError) {
        throw ApiException(
          message: 'Failed to parse customer subscription data: $parseError',
          statusCode: 500,
        );
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<CustomerSubscriptionModel> getById({
    required int customerSubscriptionId,
  }) async {
    try {
      final response = await _dio.get(
        _endpoints.customerSubscription(customerSubscriptionId),
      );

      final body = _validateResponse(response);

      final data = _normalizeJsonData(body['data'] as Map<String, dynamic>);

      return CustomerSubscriptionModel.fromJson(data);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<CustomerSubscriptionModel> store({
    required int customerId,
    required int servicePackageId,
    required double pricePaid,
    String? purchaseDate,
    String? note,
  }) async {
    try {
      final response = await _dio.post(
        _endpoints.customerSubscriptions,
        data: {
          'customerId': customerId,
          'servicePackageId': servicePackageId,
          'pricePaid': pricePaid,
          'purchaseDate': ?purchaseDate,
          'note': ?note,
        },
      );

      final body = _validateResponse(response);
      final data = _normalizeJsonData(body['data'] as Map<String, dynamic>);
      return CustomerSubscriptionModel.fromJson(data);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<CustomerSubscriptionModel> update({
    required int customerSubscriptionId,
    String? status,
    String? note,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (status != null) data['status'] = status;
      if (note != null) data['note'] = note;

      final response = await _dio.put(
        _endpoints.customerSubscription(customerSubscriptionId),
        data: data,
      );

      final body = _validateResponse(response);
      final normalized = _normalizeJsonData(
        body['data'] as Map<String, dynamic>,
      );
      return CustomerSubscriptionModel.fromJson(normalized);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<void> destroy({required int customerSubscriptionId}) async {
    try {
      final response = await _dio.delete(
        _endpoints.customerSubscription(customerSubscriptionId),
      );
      _validateResponse(response);
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

      if (body['success'] == false) {
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

  Map<String, dynamic> _normalizeJsonData(Map<String, dynamic> json) {
    final normalized = Map<String, dynamic>.from(json);

    if (normalized['id'] is String) {
      normalized['id'] = int.parse(normalized['id']);
    }
    if (normalized['customerId'] is String) {
      normalized['customerId'] = int.parse(normalized['customerId']);
    }
    if (normalized['servicePackageId'] is String) {
      normalized['servicePackageId'] = int.parse(
        normalized['servicePackageId'],
      );
    }
    if (normalized['pricePaid'] is String) {
      normalized['pricePaid'] = double.parse(normalized['pricePaid']);
    }
    if (normalized['remainingDays'] is String) {
      normalized['remainingDays'] = int.parse(normalized['remainingDays']);
    }

    if (normalized['customer'] != null && normalized['customer'] is Map) {
      normalized['customer'] = _normalizeNestedObject(
        normalized['customer'] as Map<String, dynamic>,
      );
    }

    if (normalized['servicePackage'] != null &&
        normalized['servicePackage'] is Map) {
      normalized['servicePackage'] = _normalizeNestedObject(
        normalized['servicePackage'] as Map<String, dynamic>,
      );
    }

    if (normalized['customerQuotas'] != null &&
        normalized['customerQuotas'] is List) {
      normalized['customerQuotas'] = (normalized['customerQuotas'] as List)
          .map((quota) => _normalizeNestedObject(quota as Map<String, dynamic>))
          .toList();
    }

    return normalized;
  }

  Map<String, dynamic> _normalizeNestedObject(Map<String, dynamic> json) {
    final normalized = Map<String, dynamic>.from(json);

    normalized.forEach((key, value) {
      if (value is String) {
        final intValue = int.tryParse(value);
        if (intValue != null) {
          normalized[key] = intValue;
          return;
        }
        final doubleValue = double.tryParse(value);
        if (doubleValue != null) {
          normalized[key] = doubleValue;
          return;
        }
      } else if (value is Map<String, dynamic>) {
        normalized[key] = _normalizeNestedObject(value);
      } else if (value is List) {
        normalized[key] = value.map((item) {
          if (item is Map<String, dynamic>) {
            return _normalizeNestedObject(item);
          }
          return item;
        }).toList();
      }
    });

    return normalized;
  }

  Exception _handleError(Object e) {
    if (e is DioException) {
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.sendTimeout) {
        return NetworkException(
          message: 'Connection timeout. Please check your internet connection.',
        );
      }

      if (e.type == DioExceptionType.unknown) {
        return NetworkException(
          message: 'No internet connection. Please check your network.',
        );
      }

      if (e.response != null) {
        final statusCode = e.response!.statusCode;
        final message = e.response!.data is Map
            ? e.response!.data['message'] ?? 'An error occurred'
            : 'An error occurred';
        final errors = e.response!.data is Map
            ? e.response!.data['errors'] as Map<String, dynamic>?
            : null;

        return ApiException(
          message: message,
          statusCode: statusCode,
          errors: errors,
        );
      }

      return NetworkException(message: e.message ?? 'Network error occurred');
    }

    if (e is ApiException) {
      return e;
    }

    if (e is NetworkException) {
      return e;
    }

    if (e is TypeError || e is FormatException) {
      return ApiException(
        message: 'Data format error: ${e.toString()}',
        statusCode: 500,
      );
    }

    return NetworkException(
      message: 'An unexpected error occurred: ${e.toString()}',
    );
  }
}
