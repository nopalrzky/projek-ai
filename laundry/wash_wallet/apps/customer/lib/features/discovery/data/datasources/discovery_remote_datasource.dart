import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class DiscoverySearchResponse {
  final List<OutletModel> outlets;
  final String? correctedQuery;

  const DiscoverySearchResponse({required this.outlets, this.correctedQuery});
}

abstract class DiscoveryRemoteDatasource {
  Future<DiscoverySearchResponse> fetchDiscoveryOutlets({
    String? query,
    int? outletId,
    int? categoryId,
    int? unitId,
    double? priceMin,
    double? priceMax,
    bool? freeShippingEligible,
    bool? supportsCourier,
    String serviceSortBy = 'relevant',
    int page = 1,
    int perPage = 15,
    double? latitude,
    double? longitude,
  });

  Future<List<OutletModel>> fetchTopOutlets({
    int perPage = 5,
    double? latitude,
    double? longitude,
  });
}

class DiscoveryRemoteDatasourceImpl implements DiscoveryRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  DiscoveryRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<DiscoverySearchResponse> fetchDiscoveryOutlets({
    String? query,
    int? outletId,
    int? categoryId,
    int? unitId,
    double? priceMin,
    double? priceMax,
    bool? freeShippingEligible,
    bool? supportsCourier,
    String serviceSortBy = 'relevant',
    int page = 1,
    int perPage = 15,
    double? latitude,
    double? longitude,
  }) async {
    try {
      final hasLocation = latitude != null && longitude != null;
      final queryParams = {
        'includeServices': true,
        'isExposure': true,
        'page': page,
        'perPage': perPage,
        'serviceSortBy': serviceSortBy,
        if (query != null && query.trim().isNotEmpty) 'search': query.trim(),
        'outletId': ?outletId,
        'categoryId': ?categoryId,
        'unitId': ?unitId,
        'minPrice': ?priceMin,
        'maxPrice': ?priceMax,
        'freeShippingEligible': ?freeShippingEligible,
        'supportsCourier': ?supportsCourier,
        if (hasLocation) 'latitude': latitude,
        if (hasLocation) 'longitude': longitude,
      };

      final response = await _dio.get(
        hasLocation ? _endpoints.nearbyOutlets : _endpoints.outlets,
        queryParameters: queryParams,
      );

      final body = _validateResponse(response);
      final List data = body['data'] as List? ?? [];
      final outlets = data
          .whereType<Map>()
          .map((e) => OutletModel.fromJson(Map<String, dynamic>.from(e)))
          .toList();
      final correctedQuery = _parseCorrectedQuery(body);

      return DiscoverySearchResponse(
        outlets: outlets,
        correctedQuery: correctedQuery,
      );
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<List<OutletModel>> fetchTopOutlets({
    int perPage = 5,
    double? latitude,
    double? longitude,
  }) async {
    try {
      final hasLocation = latitude != null && longitude != null;
      final queryParams = {
        'isExposure': true,
        'sortBy': 'best',
        'page': 1,
        'perPage': perPage,
        if (hasLocation) 'latitude': latitude,
        if (hasLocation) 'longitude': longitude,
      };

      final response = await _dio.get(
        hasLocation ? _endpoints.nearbyOutlets : _endpoints.outlets,
        queryParameters: queryParams,
      );

      final body = _validateResponse(response);
      final List data = body['data'] as List? ?? [];
      return data
          .whereType<Map>()
          .map((e) => OutletModel.fromJson(Map<String, dynamic>.from(e)))
          .toList();
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

  String? _parseCorrectedQuery(Map<String, dynamic> body) {
    // Check meta first (standard structure)
    final meta = body['meta'];
    if (meta is Map<String, dynamic>) {
      // Prefer camelCase (new contract)
      final camel = meta['correctedQuery'];
      if (camel is String && camel.trim().isNotEmpty) return camel.trim();

      // Fallback to snake_case (legacy/transition)
      final snake = meta['corrected_query'];
      if (snake is String && snake.trim().isNotEmpty) return snake.trim();
    }

    // Check top-level as fallback (legacy format)
    final directCamel = body['correctedQuery'];
    if (directCamel is String && directCamel.trim().isNotEmpty) {
      return directCamel.trim();
    }

    final directSnake = body['corrected_query'];
    if (directSnake is String && directSnake.trim().isNotEmpty) {
      return directSnake.trim();
    }

    return null;
  }
}
