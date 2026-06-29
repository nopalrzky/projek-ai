import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class PettyCashRemoteDatasource {
  Future<List<PettyCashModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    int? outletId,
    int? cashierId,
    int? ownerId,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  });

  Future<PettyCashModel> getById(int id);

  Future<PettyCashModel> store({
    required double amount,
    required String description,
    required String requestDate,
  });

  Future<PettyCashModel> update({
    required int id,
    double? amount,
    String? description,
    String? requestDate,
  });
}

class PettyCashRemoteDatasourceImpl implements PettyCashRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  PettyCashRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<List<PettyCashModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    int? outletId,
    int? cashierId,
    int? ownerId,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  }) async {
    try {
      final queryParams = {
        'page': page,
        'perPage': perPage,
        'search': ?search,
        'status': ?status,
        'outletId': ?outletId,
        'cashierId': ?cashierId,
        'ownerId': ?ownerId,
        'sortBy': sortBy,
        'sortDirection': sortDirection,
      };

      final response = await _dio.get(
        _endpoints.pettyCashes,
        queryParameters: queryParams,
      );

      _validateResponse(response);

      final List data = response.data['data'];
      return data.map((e) => PettyCashModel.fromJson(e)).toList();
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<PettyCashModel> getById(int id) async {
    try {
      final response = await _dio.get(_endpoints.pettyCash(id));

      _validateResponse(response);

      return PettyCashModel.fromJson(response.data['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<PettyCashModel> store({
    required double amount,
    required String description,
    required String requestDate,
  }) async {
    try {
      final requestData = {
        'amount': amount,
        'description': description,
        'requestDate': requestDate,
      };

      final response = await _dio.post(
        _endpoints.pettyCashes,
        data: requestData,
      );

      _validateResponse(response);

      return PettyCashModel.fromJson(response.data['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<PettyCashModel> update({
    required int id,
    double? amount,
    String? description,
    String? requestDate,
  }) async {
    try {
      final requestData = <String, dynamic>{};
      if (amount != null) requestData['amount'] = amount;
      if (description != null) requestData['description'] = description;
      if (requestDate != null) requestData['requestDate'] = requestDate;

      final response = await _dio.put(
        '${_endpoints.pettyCashes}/$id',
        data: requestData,
      );

      _validateResponse(response);

      return PettyCashModel.fromJson(response.data['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  void _validateResponse(Response response) {
    final data = response.data;
    final isSuccess = data is Map<String, dynamic>
        ? data['success'] == true
        : true;
    if (response.statusCode! >= 200 &&
        response.statusCode! < 300 &&
        isSuccess) {
      return;
    }

    throw ApiException(
      message: data is Map<String, dynamic>
          ? (data['message']?.toString() ?? 'Request failed')
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

      return ApiException(
        message: e.message ?? 'An error occurred',
        statusCode: null,
      );
    }

    return ApiException(
      message: 'An unexpected error occurred',
      statusCode: null,
    );
  }
}
