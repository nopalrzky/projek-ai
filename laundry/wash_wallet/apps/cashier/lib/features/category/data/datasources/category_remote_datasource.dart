import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class CategoryRemoteDatasource {
  Future<PaginatedData<CategoryModel>> getAll({
    int? outletId,
    int page = 1,
    int perPage = 15,
    String? search,
    bool? isActive,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  });

  Future<CategoryModel> getById(int id);

  Future<CategoryModel> store({
    required int outletId,
    required String name,
    String? description,
    bool? isActive,
  });

  Future<CategoryModel> update({
    required int id,
    String? name,
    String? description,
    bool? isActive,
    int? outletId,
  });

  Future<void> destroy(int id);
}

class CategoryRemoteDatasourceImpl implements CategoryRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  CategoryRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<PaginatedData<CategoryModel>> getAll({
    int? outletId,
    int page = 1,
    int perPage = 15,
    String? search,
    bool? isActive,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  }) async {
    try {
      final queryParams = {
        'page': page,
        'perPage': perPage,
        'sortBy': sortBy,
        'sortDirection': sortDirection,
        'outletId': ?outletId,
        if (search != null && search.trim().isNotEmpty) 'search': search,
        'isActive': ?isActive,
      };

      final response = await _dio.get(
        _endpoints.categories,
        queryParameters: queryParams,
      );

      final body = _validateResponse(response);

      final List data = body['data'] as List? ?? [];
      final meta = body['meta'] as Map<String, dynamic>? ?? {};
      final items = data.map((e) => CategoryModel.fromJson(e)).toList();
      return PaginatedData<CategoryModel>.fromMeta(
        items: items,
        meta: meta,
        requestedPage: page,
        requestedPerPage: perPage,
      );
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<CategoryModel> getById(int id) async {
    try {
      final response = await _dio.get('${_endpoints.categories}/$id');

      final body = _validateResponse(response);

      return CategoryModel.fromJson(body['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<CategoryModel> store({
    required int outletId,
    required String name,
    String? description,
    bool? isActive,
  }) async {
    try {
      final response = await _dio.post(
        _endpoints.categories,
        data: {
          'outletId': outletId,
          'name': name,
          'description': ?description,
          'isActive': ?isActive,
        },
      );

      final body = _validateResponse(response);

      return CategoryModel.fromJson(body['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<CategoryModel> update({
    required int id,
    String? name,
    String? description,
    bool? isActive,
    int? outletId,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (name != null) data['name'] = name;
      if (description != null) data['description'] = description;
      if (isActive != null) data['isActive'] = isActive;
      if (outletId != null) data['outletId'] = outletId;

      final response = await _dio.put(
        '${_endpoints.categories}/$id',
        data: data,
      );

      final body = _validateResponse(response);

      return CategoryModel.fromJson(body['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<void> destroy(int id) async {
    try {
      final response = await _dio.delete('${_endpoints.categories}/$id');
      _validateResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Map<String, dynamic> _validateResponse(Response response) {
    if (response.statusCode! >= 200 && response.statusCode! < 300) {
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

    return ApiException(message: 'Unexpected error: ${e.toString()}');
  }
}
