import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class MembershipContractRemoteDatasource {
  Future<PaginatedData<MembershipContractModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? customerId,
    int? outletId,
    int? membershipPlanId,
    String? status,
    double? totalPaidMin,
    double? totalPaidMax,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  });

  Future<MembershipContractModel> getById(int id);
}

class MembershipContractRemoteDatasourceImpl
    implements MembershipContractRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  MembershipContractRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<PaginatedData<MembershipContractModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? customerId,
    int? outletId,
    int? membershipPlanId,
    String? status,
    double? totalPaidMin,
    double? totalPaidMax,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  }) async {
    try {
      final queryParams = {
        'page': page,
        'perPage': perPage,
        if (search != null && search.trim().isNotEmpty) 'search': search,
        'customerId': ?customerId,
        'outletId': ?outletId,
        'membershipPlanId': ?membershipPlanId,
        'status': ?status,
        'totalPaidMin': ?totalPaidMin,
        'totalPaidMax': ?totalPaidMax,
        'sortBy': sortBy,
        'sortDirection': sortDirection,
      };

      final response = await _dio.get(
        _endpoints.membershipContracts,
        queryParameters: queryParams,
      );

      final body = _validateResponse(response);
      final List data = body['data'] as List? ?? [];
      final meta = body['meta'] as Map<String, dynamic>? ?? {};

      final normalizedData = data
          .whereType<Map<String, dynamic>>()
          .map(_normalizeJsonData)
          .toList();

      try {
        final items = normalizedData
            .map((json) => MembershipContractModel.fromJson(json))
            .toList();
        return PaginatedData<MembershipContractModel>.fromMeta(
          items: items,
          meta: meta,
          requestedPage: page,
          requestedPerPage: perPage,
        );
      } catch (parseError) {
        throw ApiException(
          message: 'Failed to parse membership contract data: $parseError',
          statusCode: 500,
        );
      }
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<MembershipContractModel> getById(int id) async {
    try {
      final response = await _dio.get('${_endpoints.membershipContracts}/$id');
      final body = _validateResponse(response);

      final normalizedData = _normalizeJsonData(
        body['data'] as Map<String, dynamic>,
      );

      try {
        return MembershipContractModel.fromJson(normalizedData);
      } catch (parseError) {
        throw ApiException(
          message: 'Failed to parse membership contract data: $parseError',
          statusCode: 500,
        );
      }
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

    _normalizeIntField(normalized, 'id');
    _normalizeIntField(normalized, 'customerId', alias: 'customer_id');
    _normalizeIntField(normalized, 'outletId', alias: 'outlet_id');
    _normalizeIntField(
      normalized,
      'membershipPlanId',
      alias: 'membership_plan_id',
    );
    _normalizeDoubleField(normalized, 'totalPaid', alias: 'total_paid');

    if (normalized['customer'] is Map<String, dynamic>) {
      normalized['customer'] = _normalizeNestedObject(
        normalized['customer'] as Map<String, dynamic>,
      );
    }

    if (normalized['outlet'] is Map<String, dynamic>) {
      normalized['outlet'] = _normalizeNestedObject(
        normalized['outlet'] as Map<String, dynamic>,
      );
    }

    if (normalized['membershipPlan'] is Map<String, dynamic>) {
      normalized['membershipPlan'] = _normalizeNestedObject(
        normalized['membershipPlan'] as Map<String, dynamic>,
      );
    }

    return normalized;
  }

  void _normalizeIntField(
    Map<String, dynamic> data,
    String key, {
    String? alias,
  }) {
    final value = data[key] ?? (alias != null ? data[alias] : null);

    if (value is int) {
      data[key] = value;
      return;
    }

    if (value is num) {
      data[key] = value.toInt();
      return;
    }

    if (value is String) {
      data[key] = int.tryParse(value);
    }
  }

  void _normalizeDoubleField(
    Map<String, dynamic> data,
    String key, {
    String? alias,
  }) {
    final value = data[key] ?? (alias != null ? data[alias] : null);

    if (value is double) {
      data[key] = value;
      return;
    }

    if (value is num) {
      data[key] = value.toDouble();
      return;
    }

    if (value is String) {
      data[key] = double.tryParse(value) ?? 0.0;
    }
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
      }

      if (value is Map<String, dynamic>) {
        normalized[key] = _normalizeNestedObject(value);
      }
    });

    return normalized;
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
