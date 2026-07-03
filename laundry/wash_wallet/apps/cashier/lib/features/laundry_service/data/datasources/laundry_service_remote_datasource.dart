import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class LaundryServiceRemoteDatasource {
  Future<PaginatedData<LaundryServiceModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? outletId,
    int? categoryId,
    int? unitId,
    bool? isActive,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  });

  Future<LaundryServiceModel> getById(int id);

  Future<LaundryServiceModel> store({
    required int unitId,
    required int categoryId,
    required String name,
    String? description,
    required double price,
    required int durationHours,
    int minQuantity = 1,
    bool isActive = true,
  });

  Future<LaundryServiceModel> update({
    required int id,
    int? unitId,
    int? categoryId,
    String? name,
    String? description,
    double? price,
    int? durationHours,
    int? minQuantity,
    bool? isActive,
  });

  Future<void> destroy(int id);
}

class LaundryServiceRemoteDatasourceImpl
    implements LaundryServiceRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  LaundryServiceRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<PaginatedData<LaundryServiceModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? outletId,
    int? categoryId,
    int? unitId,
    bool? isActive,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  }) async {
    try {
      final queryParams = {
        'page': page,
        'perPage': perPage,
        'sortBy': sortBy,
        'sortDirection': sortDirection,
        if (search != null && search.trim().isNotEmpty) 'search': search,
        'outletId': ?outletId,
        'categoryId': ?categoryId,
        'unitId': ?unitId,
        'isActive': ?isActive,
      };

      final response = await _dio.get(
        _endpoints.laundryServices,
        queryParameters: queryParams,
      );

      final body = _validateResponse(response);

      final List data = body['data'] as List? ?? [];
      final meta = body['meta'] as Map<String, dynamic>? ?? {};
      final items = data.map((e) => LaundryServiceModel.fromJson(e)).toList();
      return PaginatedData<LaundryServiceModel>.fromMeta(
        items: items, meta: meta,
        requestedPage: page, requestedPerPage: perPage,
      );
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<LaundryServiceModel> getById(int id) async {
    try {
      final response = await _dio.get('${_endpoints.laundryServices}/$id');
      final body = _validateResponse(response);
      return LaundryServiceModel.fromJson(body['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<LaundryServiceModel> store({
    required int unitId,
    required int categoryId,
    required String name,
    String? description,
    required double price,
    required int durationHours,
    int minQuantity = 1,
    bool isActive = true,
  }) async {
    try {
      final response = await _dio.post(
        _endpoints.laundryServices,
        data: {
          'unitId': unitId,
          'categoryId': categoryId,
          'name': name,
          'description': ?description,
          'price': price,
          'durationHours': durationHours,
          'minQuantity': minQuantity,
          'isActive': isActive,
        },
      );

      final body = _validateResponse(response);
      return LaundryServiceModel.fromJson(body['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<LaundryServiceModel> update({
    required int id,
    int? unitId,
    int? categoryId,
    String? name,
    String? description,
    double? price,
    int? durationHours,
    int? minQuantity,
    bool? isActive,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (unitId != null) data['unitId'] = unitId;
      if (categoryId != null) data['categoryId'] = categoryId;
      if (name != null) data['name'] = name;
      if (description != null) data['description'] = description;
      if (price != null) data['price'] = price;
      if (durationHours != null) data['durationHours'] = durationHours;
      if (minQuantity != null) data['minQuantity'] = minQuantity;
      if (isActive != null) data['isActive'] = isActive;

      final response = await _dio.put(
        '${_endpoints.laundryServices}/$id',
        data: data,
      );

      final body = _validateResponse(response);
      return LaundryServiceModel.fromJson(body['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<void> destroy(int id) async {
    try {
      final response = await _dio.delete('${_endpoints.laundryServices}/$id');
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

      if (body['success'] == false) {
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

      return NetworkException(
        message: e.message ?? 'Network request failed. Please try again.',
      );
    }
    return ApiException(message: e.toString());
  }
}
