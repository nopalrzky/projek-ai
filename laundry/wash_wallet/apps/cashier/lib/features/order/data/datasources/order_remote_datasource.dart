import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class OrderRemoteDatasource {
  Future<List<OrderModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    String? paymentStatus,
    int? outletId,
    int? customerId,
    int? employeeId,
    String? orderDateFrom,
    String? orderDateTo,
    String? estimatedCompletionFrom,
    String? estimatedCompletionTo,
    double? totalAmountMin,
    double? totalAmountMax,
    String sortBy = 'orderDate',
    String sortDirection = 'desc',
  });

  Future<OrderModel> getById(int id);

  Future<OrderModel> store(Map<String, dynamic> data);

  Future<OrderModel> update({
    required int id,
    required Map<String, dynamic> data,
  });

  Future<OrderModel> complete({required int id, required String clientRequestId});

  Future<OrderModel> accept({required int id, required String clientRequestId});

  Future<OrderModel> reject({required int id, String? reason, required String clientRequestId});

  Future<OrderModel> weigh({
    required int id,
    required Map<String, dynamic> data,
    String? photoPath,
  });

  Future<OrderModel> start({required int id, required String clientRequestId});

  Future<int> getNewOrderCount();
}

class OrderRemoteDatasourceImpl
    with NetworkRetryMixin
    implements OrderRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  OrderRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<List<OrderModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    String? paymentStatus,
    int? outletId,
    int? customerId,
    int? employeeId,
    String? orderDateFrom,
    String? orderDateTo,
    String? estimatedCompletionFrom,
    String? estimatedCompletionTo,
    double? totalAmountMin,
    double? totalAmountMax,
    String sortBy = 'orderDate',
    String sortDirection = 'desc',
  }) async {
    try {
      final queryParams = {
        'page': page,
        'perPage': perPage,
        'sortBy': sortBy,
        'sortDirection': sortDirection,
        if (search != null && search.isNotEmpty) 'search': search,
        'status': ?status,
        'paymentStatus': ?paymentStatus,
        'outletId': ?outletId,
        'customerId': ?customerId,
        'employeeId': ?employeeId,
        'orderDate.from': ?orderDateFrom,
        'orderDate.to': ?orderDateTo,
        'estimatedCompletion.from': ?estimatedCompletionFrom,
        'estimatedCompletion.to': ?estimatedCompletionTo,
        'totalAmount.min': ?totalAmountMin,
        'totalAmount.max': ?totalAmountMax,
      };

      final response = await withRetry(
        () => _dio.get(_endpoints.orders, queryParameters: queryParams),
      );

      _validateResponse(response);

      final List data = response.data['data'];

      final normalizedData = data
          .map((item) => _normalizeJsonData(item as Map<String, dynamic>))
          .toList();

      try {
        return normalizedData.map((e) => OrderModel.fromJson(e)).toList();
      } catch (parseError) {
        throw ApiException(
          message: 'Failed to parse order data: $parseError',
          statusCode: 500,
        );
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OrderModel> getById(int id) async {
    try {
      final response = await withRetry(
        () => _dio.get('${_endpoints.orders}/$id'),
      );

      _validateResponse(response);

      final data = _normalizeJsonData(
        response.data['data'] as Map<String, dynamic>,
      );

      try {
        return OrderModel.fromJson(data);
      } catch (parseError) {
        throw ApiException(
          message: 'Failed to parse order data: $parseError',
          statusCode: 500,
        );
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OrderModel> store(Map<String, dynamic> data) async {
    try {
      final clientRequestId = data.remove('client_request_id') as String?;
      final options = clientRequestId != null 
          ? Options(headers: {'Client-Request-Id': clientRequestId}) 
          : null;
      final response = await _dio.post(_endpoints.orders, data: data, options: options);
      _validateResponse(response);

      final normalizedData = _normalizeJsonData(
        response.data['data'] as Map<String, dynamic>,
      );

      try {
        return OrderModel.fromJson(normalizedData);
      } catch (parseError) {
        throw ApiException(
          message: 'Failed to parse order data: $parseError',
          statusCode: 500,
        );
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OrderModel> update({
    required int id,
    required Map<String, dynamic> data,
  }) async {
    try {
      final clientRequestId = data.remove('client_request_id') as String?;
      final options = clientRequestId != null 
          ? Options(headers: {'Client-Request-Id': clientRequestId}) 
          : null;
      final response = await _dio.put('${_endpoints.orders}/$id', data: data, options: options);
      _validateResponse(response);

      final normalizedData = _normalizeJsonData(
        response.data['data'] as Map<String, dynamic>,
      );

      try {
        return OrderModel.fromJson(normalizedData);
      } catch (parseError) {
        throw ApiException(
          message: 'Failed to parse order data: $parseError',
          statusCode: 500,
        );
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OrderModel> complete({required int id, required String clientRequestId}) async {
    try {
      final response = await _dio.post(
        '${_endpoints.orders}/$id/complete',
        options: Options(headers: {'Client-Request-Id': clientRequestId}),
      );
      _validateResponse(response);

      final normalizedData = _normalizeJsonData(
        response.data['data'] as Map<String, dynamic>,
      );

      try {
        return OrderModel.fromJson(normalizedData);
      } catch (parseError) {
        throw ApiException(
          message: 'Failed to parse order data: $parseError',
          statusCode: 500,
        );
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OrderModel> accept({required int id, required String clientRequestId}) async {
    try {
      final response = await _dio.post(
        '${_endpoints.orders}/$id/accept',
        options: Options(headers: {'Client-Request-Id': clientRequestId}),
      );
      _validateResponse(response);

      final normalizedData = _normalizeJsonData(
        response.data['data'] as Map<String, dynamic>,
      );

      return OrderModel.fromJson(normalizedData);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OrderModel> reject({required int id, String? reason, required String clientRequestId}) async {
    try {
      final response = await _dio.post(
        '${_endpoints.orders}/$id/reject',
        data: {'reason': reason},
        options: Options(headers: {'Client-Request-Id': clientRequestId}),
      );
      _validateResponse(response);

      final normalizedData = _normalizeJsonData(
        response.data['data'] as Map<String, dynamic>,
      );

      return OrderModel.fromJson(normalizedData);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OrderModel> weigh({
    required int id,
    required Map<String, dynamic> data,
    String? photoPath,
  }) async {
    try {
      final clientRequestId = data.remove('client_request_id') as String?;
      final Map<String, dynamic> flattenedData = {};
      
      void flatten(dynamic value, String prefix) {
        if (value is Map) {
          value.forEach((key, val) {
            flatten(val, '$prefix[$key]');
          });
        } else if (value is List) {
          for (int i = 0; i < value.length; i++) {
            flatten(value[i], '$prefix[$i]');
          }
        } else if (value is bool) {
          flattenedData[prefix] = value ? 1 : 0;
        } else if (value != null) {
          flattenedData[prefix] = value;
        }
      }

      data.forEach((key, value) {
        flatten(value, key);
      });

      if (photoPath != null) {
        flattenedData['photo'] = await MultipartFile.fromFile(
          photoPath,
          filename: photoPath.split('/').last,
        );
      }

      final formData = FormData.fromMap(flattenedData);

      final options = clientRequestId != null 
          ? Options(
              contentType: Headers.multipartFormDataContentType,
              headers: {'Client-Request-Id': clientRequestId},
            )
          : Options(contentType: Headers.multipartFormDataContentType);

      final response = await _dio.post(
        '${_endpoints.orders}/$id/weigh',
        data: formData,
        options: options,
      );
      _validateResponse(response);

      final normalizedData = _normalizeJsonData(
        response.data['data'] as Map<String, dynamic>,
      );

      return OrderModel.fromJson(normalizedData);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OrderModel> start({required int id, required String clientRequestId}) async {
    try {
      final response = await _dio.post(
        '${_endpoints.orders}/$id/start',
        options: Options(headers: {'Client-Request-Id': clientRequestId}),
      );
      _validateResponse(response);

      final normalizedData = _normalizeJsonData(
        response.data['data'] as Map<String, dynamic>,
      );

      return OrderModel.fromJson(normalizedData);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<int> getNewOrderCount() async {
    try {
      final response = await _dio.get(_endpoints.ordersNewCount);
      _validateResponse(response);

      final data = response.data['data'];
      if (data is Map<String, dynamic>) {
        return _toInt(data['count']);
      }
      return 0;
    } catch (e) {
      throw _handleError(e);
    }
  }

  void _validateResponse(Response response) {
    final data = response.data;
    final isSuccess = data is Map<String, dynamic>
        ? data['success'] == true
        : true;
    if (response.statusCode! >= 200 &&
        response.statusCode! < 300 &&
        isSuccess) {
      return;
    }
    throw ApiException(
      message: data is Map<String, dynamic>
          ? (data['message']?.toString() ?? 'Request failed')
          : 'Request failed',
      statusCode: response.statusCode,
    );
  }

  Map<String, dynamic> _normalizeJsonData(Map<String, dynamic> json) {
    final normalized = Map<String, dynamic>.from(json);

    final intFields = ['id', 'customerId', 'employeeId', 'orderItemsCount'];
    for (final field in intFields) {
      if (normalized[field] != null) {
        if (normalized[field] is String) {
          normalized[field] = int.tryParse(normalized[field]) ?? 0;
        } else if (normalized[field] is double) {
          normalized[field] = (normalized[field] as double).toInt();
        } else if (normalized[field] is num) {
          normalized[field] = (normalized[field] as num).toInt();
        }
      }
    }

    final doubleFields = [
      'subtotal',
      'discountAmount',
      'taxAmount',
      'totalAmount',
      'paidAmount',
      'remainingAmount',
    ];
    for (final field in doubleFields) {
      if (normalized[field] != null) {
        if (normalized[field] is String) {
          normalized[field] = double.tryParse(normalized[field]) ?? 0.0;
        } else if (normalized[field] is int) {
          normalized[field] = (normalized[field] as int).toDouble();
        } else if (normalized[field] is num) {
          normalized[field] = (normalized[field] as num).toDouble();
        }
      }
    }

    if (normalized['customer'] != null && normalized['customer'] is Map) {
      normalized['customer'] = _normalizeNestedObject(
        normalized['customer'] as Map<String, dynamic>,
      );
    }

    if (normalized['employee'] != null && normalized['employee'] is Map) {
      normalized['employee'] = _normalizeNestedObject(
        normalized['employee'] as Map<String, dynamic>,
      );
    }

    if (normalized['specialInstructions'] != null &&
        normalized['specialInstructions'] is List) {
      normalized['specialInstructions'] = jsonEncode(
        normalized['specialInstructions'],
      );
    }

    if (normalized['orderItems'] != null && normalized['orderItems'] is List) {
      normalized['orderItems'] = (normalized['orderItems'] as List).map((item) {
        if (item is! Map) return item;
        final itemMap = Map<String, dynamic>.from(item);

        if (itemMap['id'] != null) {
          itemMap['id'] = _toInt(itemMap['id']);
        }
        if (itemMap['orderId'] != null) {
          itemMap['orderId'] = _toInt(itemMap['orderId']);
        }
        if (itemMap['laundryServiceId'] != null) {
          itemMap['laundryServiceId'] = _toInt(itemMap['laundryServiceId']);
        }
        if (itemMap['quantity'] != null) {
          itemMap['quantity'] = _toDouble(itemMap['quantity']);
        }
        if (itemMap['unitPrice'] != null) {
          itemMap['unitPrice'] = _toDouble(itemMap['unitPrice']);
        }
        if (itemMap['subtotal'] != null) {
          itemMap['subtotal'] = _toDouble(itemMap['subtotal']);
        }
        if (itemMap['discountAmount'] != null) {
          itemMap['discountAmount'] = _toDouble(itemMap['discountAmount']);
        }
        if (itemMap['totalAmount'] != null) {
          itemMap['totalAmount'] = _toDouble(itemMap['totalAmount']);
        }

        if (itemMap['laundryService'] != null &&
            itemMap['laundryService'] is Map) {
          itemMap['laundryService'] = _normalizeNestedObject(
            Map<String, dynamic>.from(itemMap['laundryService']),
          );
        }

        return itemMap;
      }).toList();
    }

    return normalized;
  }

  int _toInt(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    if (value is double) return value.toInt();
    if (value is String) return int.tryParse(value) ?? 0;
    if (value is num) return value.toInt();
    return 0;
  }

  double _toDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    if (value is num) return value.toDouble();
    return 0.0;
  }

  Map<String, dynamic> _normalizeNestedObject(Map<String, dynamic> json) {
    final normalized = Map<String, dynamic>.from(json);
    final newMap = <String, dynamic>{};

    const nestedIntKeys = {
      'id',
      'ownerId',
      'outletId',
      'employeeId',
      'customerId',
      'servicePackageId',
      'membershipPlanId',
      'laundryServiceId',
      'categoryId',
      'unitId',
      'cutoffDays',
      'remainingDays',
      'ordersCount',
      'customerSubscriptionsCount',
      'membershipContractsCount',
    };

    const nestedDoubleKeys = {
      'price',
      'pricePaid',
      'totalQuota',
      'remainingQuota',
      'durationHours',
      'minQuantity',
      'discountPercentage',
      'subtotal',
      'discountAmount',
      'taxAmount',
      'totalAmount',
      'paidAmount',
      'remainingAmount',
      'quantity',
      'unitPrice',
      'quotaUsed',
    };

    normalized.forEach((key, value) {
      if (value == null) {
        newMap[key] = null;
      } else if (value is Map) {
        newMap[key] = _normalizeNestedObject(Map<String, dynamic>.from(value));
      } else if (value is List) {
        newMap[key] = value.map((item) {
          if (item is Map) {
            return _normalizeNestedObject(Map<String, dynamic>.from(item));
          }
          return item;
        }).toList();
      } else if (value is String) {
        if (nestedIntKeys.contains(key)) {
          newMap[key] = int.tryParse(value) ?? value;
        } else if (nestedDoubleKeys.contains(key)) {
          newMap[key] = double.tryParse(value) ?? value;
        } else {
          newMap[key] = value;
        }
      } else {
        newMap[key] = value;
      }
    });

    return newMap;
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

      if (e.type == DioExceptionType.connectionError) {
        return NetworkException(
          message: 'No internet connection. Please check your network.',
        );
      }

      if (e.response != null) {
        final statusCode = e.response!.statusCode;
        final data = e.response!.data;

        String message = 'Request failed';
        dynamic errors;

        if (data is Map<String, dynamic>) {
          message = (data['message']?.toString() ?? message);
          errors = data['errors'];
        }

        return ApiException(
          message: message,
          statusCode: statusCode,
          errors: errors,
        );
      }

      return NetworkException(message: e.message ?? 'Connection Error');
    }
    if (e is TypeError || e is FormatException) {
      return ApiException(
        message: 'Data format error: ${e.toString()}',
        statusCode: 500,
      );
    }
    return ApiException(message: e.toString());
  }
}
