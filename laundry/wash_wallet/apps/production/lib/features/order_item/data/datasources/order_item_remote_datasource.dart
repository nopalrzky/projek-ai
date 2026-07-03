import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class OrderItemRemoteDataSource {
  Future<PaginatedData<OrderItemModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    int? orderId,
    int? laundryServiceId,
    int? customerId,
    String? startedAtFrom,
    String? startedAtTo,
    String? completedAtFrom,
    String? completedAtTo,
    String? createdAtFrom,
    String? createdAtTo,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  });

  Future<OrderItemModel> getById(int id);

  Future<OrderItemModel> start(int id);

  Future<OrderItemModel> complete({required int id, String? notes});
}

class OrderItemRemoteDataSourceImpl implements OrderItemRemoteDataSource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  OrderItemRemoteDataSourceImpl(this._dio, this._endpoints);

  @override
  Future<PaginatedData<OrderItemModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    int? orderId,
    int? laundryServiceId,
    int? customerId,
    String? startedAtFrom,
    String? startedAtTo,
    String? completedAtFrom,
    String? completedAtTo,
    String? createdAtFrom,
    String? createdAtTo,
    String sortBy = 'createdAt',
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
        'orderId': ?orderId,
        'laundryServiceId': ?laundryServiceId,
        'customerId': ?customerId,
        'startedAt.from': ?startedAtFrom,
        'startedAt.to': ?startedAtTo,
        'completedAt.from': ?completedAtFrom,
        'completedAt.to': ?completedAtTo,
        'createdAt.from': ?createdAtFrom,
        'createdAt.to': ?createdAtTo,
      };

      final response = await withRetry(
        () => _dio.get(_endpoints.orderItems, queryParameters: queryParams),
      );

      _validateResponse(response);

      final body = response.data;
            final List data = body['data'] as List? ?? [];
            final meta = body['meta'] as Map<String, dynamic>? ?? {};
            final normalizedData = data
                .map((item) => _normalizeJsonData(item as Map<String, dynamic>))
                .toList();
            try {
              final items = normalizedData.map((e) => OrderItemModel.fromJson(e)).toList();
              return PaginatedData<OrderItemModel>.fromMeta(
                items: items,
                meta: meta,
                requestedPage: page,
                requestedPerPage: perPage,
              );
            } catch (parseError) {
              throw ApiException(
                message: 'Failed to parse order_item data: $parseError',
                statusCode: 500,
              );
            }
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OrderItemModel> getById(int id) async {
    try {
      final response = await withRetry(
        () => _dio.get(_endpoints.orderItem(id)),
      );

      _validateResponse(response);

      final data = _normalizeJsonData(
        response.data['data'] as Map<String, dynamic>,
      );

      try {
        return OrderItemModel.fromJson(data);
      } catch (parseError) {
        throw ApiException(
          message: 'Failed to parse order item data: $parseError',
          statusCode: 500,
        );
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OrderItemModel> start(int id) async {
    try {
      final response = await _dio.post(_endpoints.orderItemStart(id));

      _validateResponse(response);

      final data = _normalizeJsonData(
        response.data['data'] as Map<String, dynamic>,
      );

      try {
        return OrderItemModel.fromJson(data);
      } catch (parseError) {
        throw ApiException(
          message: 'Failed to parse order item data: $parseError',
          statusCode: 500,
        );
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OrderItemModel> complete({required int id, String? notes}) async {
    try {
      final requestBody = <String, dynamic>{};
      if (notes != null) {
        requestBody['notes'] = notes;
      }

      final response = await _dio.post(
        _endpoints.orderItemComplete(id),
        data: requestBody,
      );

      _validateResponse(response);

      final data = _normalizeJsonData(
        response.data['data'] as Map<String, dynamic>,
      );

      try {
        return OrderItemModel.fromJson(data);
      } catch (parseError) {
        throw ApiException(
          message: 'Failed to parse order item data: $parseError',
          statusCode: 500,
        );
      }
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

  Map<String, dynamic> _normalizeJsonData(Map<String, dynamic> json) {
    final normalized = Map<String, dynamic>.from(json);

    final intFields = [
      'id',
      'orderId',
      'laundryServiceId',
      'completionPercentage',
    ];
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
      'unitPrice',
      'subtotal',
      'discountAmount',
      'totalAmount',
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

    if (normalized['order'] != null && normalized['order'] is Map) {
      normalized['order'] = _normalizeNestedObject(
        normalized['order'] as Map<String, dynamic>,
      );
    }

    if (normalized['laundryService'] != null &&
        normalized['laundryService'] is Map) {
      normalized['laundryService'] = _normalizeNestedObject(
        normalized['laundryService'] as Map<String, dynamic>,
      );
    }

    if (normalized['orderItemProcesses'] != null &&
        normalized['orderItemProcesses'] is List) {
      normalized['orderItemProcesses'] =
          (normalized['orderItemProcesses'] as List).map((item) {
            if (item is! Map) return item;
            return _normalizeNestedObject(Map<String, dynamic>.from(item));
          }).toList();
    }

    return normalized;
  }

  Map<String, dynamic> _normalizeNestedObject(Map<String, dynamic> json) {
    final normalized = Map<String, dynamic>.from(json);
    final newMap = <String, dynamic>{};

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
        final intValue = int.tryParse(value);
        if (intValue != null) {
          newMap[key] = intValue;
        } else {
          final doubleValue = double.tryParse(value);
          if (doubleValue != null) {
            newMap[key] = doubleValue;
          } else {
            newMap[key] = value;
          }
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

Future<T> withRetry<T>(Future<T> Function() request) async {
  return request();
}
