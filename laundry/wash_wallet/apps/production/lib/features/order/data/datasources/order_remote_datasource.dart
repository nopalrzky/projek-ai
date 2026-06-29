import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

Future<T> withRetry<T>(Future<T> Function() request) async {
  return request();
}

abstract class OrderRemoteDatasource {
  Future<List<OrderModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    String? paymentStatus,
    int? outletId,
    List<int>? outletIds,
    int? customerId,
    int? employeeId,
    String? orderDateFrom,
    String? orderDateTo,
    String? estimatedCompletionFrom,
    String? estimatedCompletionTo,
    double? totalAmountMin,
    double? totalAmountMax,
    String? pickupScheduleFrom,
    String? pickupScheduleTo,
    String? forCourierPickupDate,
    String sortBy = 'orderDate',
    String sortDirection = 'desc',
  });

  Future<OrderModel> getById(int id);

  Future<OrderModel> start({required int orderId, int? employeeId});

  Future<OrderModel> complete(int id);

  Future<OrderModel> pickup(int id);

  Future<OrderModel> confirmPickup(int id, String photoPath);

  Future<OrderModel> confirmArrived(int id, String? photoPath);
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
    List<int>? outletIds,
    int? customerId,
    int? employeeId,
    String? orderDateFrom,
    String? orderDateTo,
    String? estimatedCompletionFrom,
    String? estimatedCompletionTo,
    double? totalAmountMin,
    double? totalAmountMax,
    String? pickupScheduleFrom,
    String? pickupScheduleTo,
    String? forCourierPickupDate,
    String sortBy = 'orderDate',
    String sortDirection = 'desc',
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'perPage': perPage,
        'sortBy': sortBy,
        'sortDirection': sortDirection,
      };

      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }
      if (status != null && status.isNotEmpty) {
        queryParams['status'] = status;
      }
      if (paymentStatus != null && paymentStatus.isNotEmpty) {
        queryParams['paymentStatus'] = paymentStatus;
      }
      if (outletId != null) {
        queryParams['outletId'] = outletId;
      }
      if (outletIds != null && outletIds.isNotEmpty) {
        queryParams['outletIds'] = outletIds.join(',');
      }
      if (customerId != null) {
        queryParams['customerId'] = customerId;
      }
      if (employeeId != null) {
        queryParams['employeeId'] = employeeId;
      }
      if (orderDateFrom != null && orderDateFrom.isNotEmpty) {
        queryParams['orderDate.from'] = orderDateFrom;
      }
      if (orderDateTo != null && orderDateTo.isNotEmpty) {
        queryParams['orderDate.to'] = orderDateTo;
      }
      if (estimatedCompletionFrom != null &&
          estimatedCompletionFrom.isNotEmpty) {
        queryParams['estimatedCompletion.from'] = estimatedCompletionFrom;
      }
      if (estimatedCompletionTo != null && estimatedCompletionTo.isNotEmpty) {
        queryParams['estimatedCompletion.to'] = estimatedCompletionTo;
      }
      if (totalAmountMin != null) {
        queryParams['totalAmount.min'] = totalAmountMin;
      }
      if (totalAmountMax != null) {
        queryParams['totalAmount.max'] = totalAmountMax;
      }
      if (pickupScheduleFrom != null && pickupScheduleFrom.isNotEmpty) {
        queryParams['pickupSchedule.from'] = pickupScheduleFrom;
      }
      if (pickupScheduleTo != null && pickupScheduleTo.isNotEmpty) {
        queryParams['pickupSchedule.to'] = pickupScheduleTo;
      }
      if (forCourierPickupDate != null && forCourierPickupDate.isNotEmpty) {
        queryParams['forCourierPickupDate'] = forCourierPickupDate;
      }

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
  Future<OrderModel> start({required int orderId, int? employeeId}) async {
    try {
      final requestBody = <String, dynamic>{};

      if (employeeId != null) {
        requestBody['employeeId'] = employeeId;
      }

      final response = await _dio.post(
        '${_endpoints.orders}/$orderId/start',
        data: requestBody,
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
  Future<OrderModel> complete(int id) async {
    try {
      final response = await _dio.post('${_endpoints.orders}/$id/complete');
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
  Future<OrderModel> pickup(int id) async {
    try {
      final response = await _dio.post('${_endpoints.orders}/$id/pickup');
      _validateResponse(response);

      final data = _normalizeJsonData(
        response.data['data'] as Map<String, dynamic>,
      );

      return OrderModel.fromJson(data);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OrderModel> confirmPickup(int id, String photoPath) async {
    try {
      final fileName = photoPath.split('/').last;
      final formData = FormData.fromMap({
        'photo': await MultipartFile.fromFile(photoPath, filename: fileName),
      });

      final response = await _dio.post(
        '${_endpoints.orders}/$id/confirm-pickup',
        data: formData,
        options: Options(contentType: Headers.multipartFormDataContentType),
      );

      _validateResponse(response);

      final data = _normalizeJsonData(
        response.data['data'] as Map<String, dynamic>,
      );

      return OrderModel.fromJson(data);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<OrderModel> confirmArrived(int id, String? photoPath) async {
    try {
      FormData? formData;

      if (photoPath != null) {
        final fileName = photoPath.split('/').last;
        formData = FormData.fromMap({
          'photo': await MultipartFile.fromFile(photoPath, filename: fileName),
        });
      }

      final response = await _dio.post(
        '${_endpoints.orders}/$id/confirm-arrived',
        data: formData,
        options: formData != null
            ? Options(contentType: Headers.multipartFormDataContentType)
            : null,
      );

      _validateResponse(response);

      final data = _normalizeJsonData(
        response.data['data'] as Map<String, dynamic>,
      );

      return OrderModel.fromJson(data);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Map<String, dynamic> _normalizeJsonData(Map<String, dynamic> json) {
    final normalized = Map<String, dynamic>.from(json);

    final intFields = [
      'id',
      'customerId',
      'employeeId',
      'outletId',
      'orderItemsCount',
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

    if (normalized['specialInstructions'] != null) {
      if (normalized['specialInstructions'] is String) {
        try {
          normalized['specialInstructions'] = jsonDecode(
            normalized['specialInstructions'] as String,
          );
        } catch (e) {
          normalized['specialInstructions'] = [
            normalized['specialInstructions'] as String,
          ];
        }
      } else if (normalized['specialInstructions'] is! List) {
        normalized['specialInstructions'] = [
          normalized['specialInstructions'].toString(),
        ];
      }
    }

    if (normalized['orderItems'] != null && normalized['orderItems'] is List) {
      normalized['orderItems'] = (normalized['orderItems'] as List).map((item) {
        if (item is! Map) return item;
        final itemMap = Map<String, dynamic>.from(item);

        itemMap['id'] = _toInt(itemMap['id']);
        itemMap['orderId'] = _toInt(itemMap['orderId']);
        itemMap['laundryServiceId'] = _toInt(itemMap['laundryServiceId']);

        itemMap['quantity'] = _toDouble(itemMap['quantity']);
        itemMap['unitPrice'] = _toDouble(itemMap['unitPrice']);
        itemMap['subtotal'] = _toDouble(itemMap['subtotal']);
        itemMap['discountAmount'] = _toDouble(itemMap['discountAmount']);
        itemMap['paidAmount'] = _toDouble(itemMap['paidAmount']);

        if (itemMap['totalAmount'] != null) {
          itemMap['totalAmount'] = _toDouble(itemMap['totalAmount']);
        } else if (itemMap['totalPrice'] != null) {
          itemMap['totalAmount'] = _toDouble(itemMap['totalPrice']);
        } else {
          itemMap['totalAmount'] = 0.0;
        }

        if (itemMap['status'] != null) {
          itemMap['status'] = itemMap['status'].toString();
        } else {
          itemMap['status'] = '';
        }

        itemMap['categoryName'] = itemMap['categoryName'] ?? '';
        itemMap['laundryServiceName'] = itemMap['laundryServiceName'] ?? '';
        itemMap['unitName'] = itemMap['unitName'] ?? '';
        itemMap['isPackageUsage'] = itemMap['isPackageUsage'] ?? false;

        if (itemMap['laundryService'] != null &&
            itemMap['laundryService'] is Map) {
          final service = Map<String, dynamic>.from(itemMap['laundryService']);
          if (service['name'] != null && itemMap['laundryServiceName'] == '') {
            itemMap['laundryServiceName'] = service['name'];
          }
          if (service['categoryName'] != null &&
              itemMap['categoryName'] == '') {
            itemMap['categoryName'] = service['categoryName'];
          }
          if (service['unitName'] != null && itemMap['unitName'] == '') {
            itemMap['unitName'] = service['unitName'];
          }
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
        newMap[key] = value;
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

  void _validateResponse(Response response) {
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw ApiException(
        message: response.statusMessage ?? 'An error occurred',
        statusCode: response.statusCode,
      );
    }
  }
}
