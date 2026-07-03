import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class UnitRemoteDatasource {
  Future<PaginatedData<UnitModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
    bool? isActive,
  });
}

class UnitRemoteDatasourceImpl
    with NetworkRetryMixin
    implements UnitRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  UnitRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<PaginatedData<UnitModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
    bool? isActive,
  }) async {
    try {
      final queryParams = {
        'page': page,
        'perPage': perPage,
        if (search != null) 'search': search,
        'sortBy': sortBy,
        'sortDirection': sortDirection,
        if (isActive != null) 'isActive': isActive,
      };

      final response = await withRetry(
        () => _dio.get(_endpoints.units, queryParameters: queryParams),
      );

      _validateResponse(response);

      final body = response.data;
        final List data = body['data'] as List? ?? [];
        final meta = body['meta'] as Map<String, dynamic>? ?? {};
        final items = data.map((e) => UnitModel.fromJson(e)).toList();
        return PaginatedData<UnitModel>.fromMeta(
          items: items,
          meta: meta,
          requestedPage: page,
          requestedPerPage: perPage,
        );
    } catch (e) {
      throw _handleError(e);
    }
  }

  void _validateResponse(Response response) {
    final body = response.data;
    if (response.statusCode! >= 200 && response.statusCode! < 300) {
      if (body is! Map<String, dynamic>) {
        throw ApiException(
          message: 'Invalid response format',
          statusCode: response.statusCode,
        );
      }

      if (body['success'] != true) {
        throw ApiException(
          message: body['message']?.toString() ?? 'Request failed',
          statusCode: response.statusCode,
        );
      }

      return;
    }
    throw ApiException(
      message: body is Map<String, dynamic>
          ? (body['message']?.toString() ?? 'Request failed')
          : 'Request failed',
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
        final data = e.response?.data;
        return ApiException(
          message: data is Map<String, dynamic>
              ? (data['message']?.toString() ?? 'Request failed')
              : 'Request failed',
          statusCode: e.response?.statusCode,
          errors: data is Map<String, dynamic> ? data['errors'] : null,
        );
      }

      return NetworkException(message: e.message ?? 'Unknown error occurred');
    }

    return ApiException(message: 'Unexpected error: ${e.toString()}');
  }
}
