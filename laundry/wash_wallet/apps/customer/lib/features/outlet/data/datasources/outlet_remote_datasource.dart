import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class OutletRemoteDatasource {
  Future<List<OutletModel>> getAll({
    bool? isExposure,
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    int? provinceId,
    int? cityId,
    int? districtId,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
    double? latitude,
    double? longitude,
  });

  Future<List<OutletModel>> getNearby({
    String? search,
    required double latitude,
    required double longitude,
    double radius = 10.0,
    int page = 1,
    int perPage = 15,
  });

  Future<OutletModel> getById({
    required int id,
    double? latitude,
    double? longitude,
  });

  Future<List<OrderReviewModel>> getReviews({
    required int outletId,
    int page = 1,
    int perPage = 10,
  });

  Future<OutletReviewSummaryModel> getReviewSummary({required int outletId});
}

class OutletRemoteDatasourceImpl implements OutletRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  OutletRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<List<OutletModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    bool? isExposure,
    String? status,
    int? provinceId,
    int? cityId,
    int? districtId,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
    double? latitude,
    double? longitude,
  }) async {
    try {
      final hasLocation = latitude != null && longitude != null;
      final queryParams = {
        'page': page,
        'perPage': perPage,
        'sortBy': sortBy,
        'sortDirection': sortDirection,
        if (search != null && search.trim().isNotEmpty) 'search': search,
        'isExposure': ?isExposure,
        if (status != null && status.trim().isNotEmpty) 'status': status,
        'provinceId': ?provinceId,
        'cityId': ?cityId,
        'districtId': ?districtId,
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

  @override
  Future<List<OutletModel>> getNearby({
    String? search,
    required double latitude,
    required double longitude,
    double radius = 10.0,
    int page = 1,
    int perPage = 15,
  }) async {
    try {
      final queryParams = {
        if (search != null && search.trim().isNotEmpty) 'search': search,
        'page': page,
        'perPage': perPage,
        'latitude': latitude,
        'longitude': longitude,
        'radius': radius,
      };

      final response = await _dio.get(
        _endpoints.nearbyOutlets,
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

  @override
  Future<OutletModel> getById({
    required int id,
    double? latitude,
    double? longitude,
  }) async {
    try {
      final hasLocation = latitude != null && longitude != null;
      final response = await _dio.get(
        _endpoints.outlet(id),
        queryParameters: {
          if (hasLocation) 'latitude': latitude,
          if (hasLocation) 'longitude': longitude,
        },
      );

      final body = _validateResponse(response);
      final rawData = body['data'];
      if (rawData is! Map<String, dynamic>) {
        throw ApiException(
          message: 'Invalid outlet detail format',
          statusCode: response.statusCode,
        );
      }

      return OutletModel.fromJson(rawData);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<List<OrderReviewModel>> getReviews({
    required int outletId,
    int page = 1,
    int perPage = 10,
  }) async {
    try {
      final response = await _dio.get(
        _endpoints.outletReviews(outletId),
        queryParameters: {'page': page, 'per_page': perPage},
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
  Future<OutletReviewSummaryModel> getReviewSummary({
    required int outletId,
  }) async {
    try {
      final response = await _dio.get(_endpoints.outletReviewSummary(outletId));

      final body = _validateResponse(response);
      final rawData = body['data'];
      if (rawData is! Map<String, dynamic>) {
        throw ApiException(
          message: 'Invalid review summary format',
          statusCode: response.statusCode,
        );
      }

      return OutletReviewSummaryModel.fromJson(rawData);
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
