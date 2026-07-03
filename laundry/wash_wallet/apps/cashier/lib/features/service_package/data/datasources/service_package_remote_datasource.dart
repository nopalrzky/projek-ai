import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class ServicePackageRemoteDatasource {
  Future<PaginatedData<ServicePackageModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? outletId,
    bool? isActive,
    double? minPrice,
    double? maxPrice,
    int? minValidityDays,
    int? maxValidityDays,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  });

  Future<ServicePackageModel> getById({required int servicePackageId});
}

class ServicePackageRemoteDatasourceImpl
    implements ServicePackageRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  ServicePackageRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<PaginatedData<ServicePackageModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? outletId,
    bool? isActive,
    double? minPrice,
    double? maxPrice,
    int? minValidityDays,
    int? maxValidityDays,
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
        'outletId': ?outletId,
        'isActive': ?isActive,
        'minPrice': ?minPrice,
        'maxPrice': ?maxPrice,
        'minValidityDays': ?minValidityDays,
        'maxValidityDays': ?maxValidityDays,
      };

      final response = await _dio.get(
        _endpoints.servicePackages,
        queryParameters: queryParams,
      );

      final body = _validateResponse(response);

      final List data = body['data'] as List? ?? [];
      final meta = body['meta'] as Map<String, dynamic>? ?? {};

      // Normalize data to handle type inconsistencies
      final normalizedData = data
          .map((item) => _normalizeJsonData(item as Map<String, dynamic>))
          .toList();

      try {
        final items = normalizedData
            .map((e) => ServicePackageModel.fromJson(e))
            .toList();
        return PaginatedData<ServicePackageModel>.fromMeta(
          items: items,
          meta: meta,
          requestedPage: page,
          requestedPerPage: perPage,
        );
      } catch (parseError) {
        throw ApiException(
          message: 'Failed to parse service package data: $parseError',
          statusCode: 500,
        );
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<ServicePackageModel> getById({required int servicePackageId}) async {
    try {
      final response = await _dio.get(
        _endpoints.servicePackage(servicePackageId),
      );

      final body = _validateResponse(response);

      final data = _normalizeJsonData(
        body['data'] as Map<String, dynamic>,
      );

      try {
        return ServicePackageModel.fromJson(data);
      } catch (parseError) {
        throw ApiException(
          message: 'Failed to parse service package data: $parseError',
          statusCode: 500,
        );
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  Map<String, dynamic> _normalizeJsonData(Map<String, dynamic> json) {
    final normalized = Map<String, dynamic>.from(json);

    if (normalized['id'] is String) {
      normalized['id'] = int.parse(normalized['id']);
    }
    if (normalized['outletId'] is String) {
      normalized['outletId'] = int.parse(normalized['outletId']);
    }
    if (normalized['price'] is String) {
      normalized['price'] = double.parse(normalized['price']);
    }
    if (normalized['validityDays'] is String) {
      normalized['validityDays'] = int.parse(normalized['validityDays']);
    }

    if (normalized['outlet'] != null && normalized['outlet'] is Map) {
      normalized['outlet'] = _normalizeNestedObject(
        normalized['outlet'] as Map<String, dynamic>,
      );
    }

    if (normalized['servicePackageItems'] != null &&
        normalized['servicePackageItems'] is List) {
      normalized['servicePackageItems'] =
          (normalized['servicePackageItems'] as List)
              .map(
                (item) => _normalizeNestedObject(item as Map<String, dynamic>),
              )
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

  Map<String, dynamic> _validateResponse(Response response) {
    if (response.statusCode == null ||
        response.statusCode! < 200 ||
        response.statusCode! >= 300) {
      throw ApiException(
        message: response.data is Map<String, dynamic>
            ? (response.data['message']?.toString() ?? 'Request failed')
            : 'Request failed',
        statusCode: response.statusCode,
      );
    }

    if (response.data is! Map<String, dynamic>) {
      throw ApiException(
        message: 'Invalid response format',
        statusCode: response.statusCode,
      );
    }

    final body = response.data as Map<String, dynamic>;

    if (body['success'] != true) {
      throw ApiException(
        message: body['message']?.toString() ?? 'Request failed',
        statusCode: response.statusCode,
      );
    }

    return body;
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

      if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.unknown) {
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
