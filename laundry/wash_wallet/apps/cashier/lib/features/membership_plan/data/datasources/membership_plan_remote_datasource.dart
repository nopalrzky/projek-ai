import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class MembershipPlanRemoteDatasource {
  Future<PaginatedData<MembershipPlanModel>> getAll({
    int page,
    int perPage,
    String? search,
    int? outletId,
    bool? isActive,
    double? minPrice,
    double? maxPrice,
    int? minDurationDays,
    int? maxDurationDays,
    double? minDiscountPercentage,
    double? maxDiscountPercentage,
    String sortBy,
    String sortOrder,
  });
  Future<MembershipPlanModel> getById(int membershipPlanId);
}

class MembershipPlanRemoteDatasourceImpl
    implements MembershipPlanRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  MembershipPlanRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<PaginatedData<MembershipPlanModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? outletId,
    bool? isActive,
    double? minPrice,
    double? maxPrice,
    int? minDurationDays,
    int? maxDurationDays,
    double? minDiscountPercentage,
    double? maxDiscountPercentage,
    String sortBy = 'createdAt',
    String sortOrder = 'desc',
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'perPage': perPage,
        'sortBy': sortBy,
        'sortOrder': sortOrder,
      };

      if (search != null) queryParams['search'] = search;
      if (outletId != null) queryParams['outletId'] = outletId;
      if (isActive != null) queryParams['isActive'] = isActive;
      if (minPrice != null) queryParams['minPrice'] = minPrice;
      if (maxPrice != null) queryParams['maxPrice'] = maxPrice;
      if (minDurationDays != null) {
        queryParams['minDurationDays'] = minDurationDays;
      }
      if (maxDurationDays != null) {
        queryParams['maxDurationDays'] = maxDurationDays;
      }
      if (minDiscountPercentage != null) {
        queryParams['minDiscountPercentage'] = minDiscountPercentage;
      }
      if (maxDiscountPercentage != null) {
        queryParams['maxDiscountPercentage'] = maxDiscountPercentage;
      }

      final response = await _dio.get(
        _endpoints.membershipPlans,
        queryParameters: queryParams,
      );

      _validateResponse(response);

      final List data = response.data['data'];
      final meta = response.data['meta'] as Map<String, dynamic>? ?? {};
      final normalizedData = data
          .map((item) => _normalizeJsonData(item as Map<String, dynamic>))
          .toList();

      try {
        final items = normalizedData
            .map((e) => MembershipPlanModel.fromJson(e))
            .toList();
        return PaginatedData<MembershipPlanModel>.fromMeta(
          items: items,
          meta: meta,
          requestedPage: page,
          requestedPerPage: perPage,
        );
      } catch (parseError) {
        throw ApiException(
          message: 'Failed to parse membership plan data: $parseError',
          statusCode: 500,
        );
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<MembershipPlanModel> getById(int membershipPlanId) async {
    try {
      final response = await _dio.get(
        '${_endpoints.membershipPlans}/$membershipPlanId',
      );

      _validateResponse(response);

      final data = response.data['data'];
      final normalizedData = _normalizeJsonData(data as Map<String, dynamic>);

      try {
        return MembershipPlanModel.fromJson(normalizedData);
      } catch (parseError) {
        throw ApiException(
          message: 'Failed to parse membership plan data: $parseError',
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
    if (normalized['level'] is String) {
      normalized['level'] = int.parse(normalized['level']);
    }
    if (normalized['durationDays'] is String) {
      normalized['durationDays'] = int.parse(normalized['durationDays']);
    }
    if (normalized['discountPercentage'] is String) {
      normalized['discountPercentage'] = double.parse(
        normalized['discountPercentage'],
      );
    }

    return normalized;
  }

  void _validateResponse(Response response) {
    if (response.statusCode! >= 200 && response.statusCode! < 300) {
      return;
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

      if (e.type == DioExceptionType.connectionError) {
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
          errors: data is Map<String, dynamic> ? data['errors'] : null,
        );
      }

      return NetworkException(message: e.message ?? 'Unknown error occurred');
    }

    if (e is TypeError || e is FormatException) {
      return ApiException(
        message: 'Data format error: ${e.toString()}',
        statusCode: 500,
      );
    }

    return ApiException(message: 'Unexpected error: ${e.toString()}');
  }
}
