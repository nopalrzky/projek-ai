import 'package:dio/dio.dart';
import 'package:http_parser/http_parser.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class DepositRemoteDatasource {
  Future<PaginatedData<DepositModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? ownerId,
    String? status,
    int? outletId,
    int? cashierId,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  });

  Future<DepositModel> getById(int id);

  Future<DepositModel> store({
    required int destinationAccountId,
    required double amount,
    String? notes,
    String? attachmentPath,
  });

  Future<DepositModel> update({
    required int id,
    int? destinationAccountId,
    double? amount,
    String? notes,
    String? attachmentPath,
  });
}

class DepositRemoteDatasourceImpl implements DepositRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  DepositRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<PaginatedData<DepositModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? ownerId,
    String? status,
    int? outletId,
    int? cashierId,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  }) async {
    try {
      final queryParams = {
        'page': page,
        'perPage': perPage,
        if (search != null && search.trim().isNotEmpty) 'search': search,
        'ownerId': ?ownerId,
        'status': ?status,
        'outletId': ?outletId,
        'cashierId': ?cashierId,
        'sortBy': sortBy,
        'sortDirection': sortDirection,
      };

      final response = await _dio.get(
        _endpoints.deposits,
        queryParameters: queryParams,
      );

      final body = _validateResponse(response);
      final List data = body['data'] as List? ?? [];
      final meta = body['meta'] as Map<String, dynamic>? ?? {};
      final items = data.map((e) => DepositModel.fromJson(e)).toList();
      return PaginatedData<DepositModel>.fromMeta(
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
  Future<DepositModel> getById(int id) async {
    try {
      final response = await _dio.get('${_endpoints.deposits}/$id');
      final body = _validateResponse(response);
      return DepositModel.fromJson(body['data'] as Map<String, dynamic>);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<DepositModel> store({
    required int destinationAccountId,
    required double amount,
    String? notes,
    String? attachmentPath,
  }) async {
    try {
      final formMap = <String, dynamic>{
        'destinationAccountId': destinationAccountId,
        'amount': amount,
        'notes': ?notes,
      };

      if (attachmentPath != null) {
        final fileName = attachmentPath.split('/').last;
        final mimeType = _getMimeType(fileName);
        formMap['attachment'] = await MultipartFile.fromFile(
          attachmentPath,
          filename: fileName,
          contentType: MediaType.parse(mimeType),
        );
      }

      final formData = FormData.fromMap(formMap);

      final response = await _dio.post(
        _endpoints.deposits,
        data: formData,
        options: Options(contentType: Headers.multipartFormDataContentType),
      );
      final body = _validateResponse(response);
      return DepositModel.fromJson(body['data'] as Map<String, dynamic>);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<DepositModel> update({
    required int id,
    int? destinationAccountId,
    double? amount,
    String? notes,
    String? attachmentPath,
  }) async {
    try {
      final formMap = <String, dynamic>{
        'destination_account_id': ?destinationAccountId,
        'amount': ?amount,
        'notes': ?notes,
      };

      if (attachmentPath != null) {
        final fileName = attachmentPath.split('/').last;
        final mimeType = _getMimeType(fileName);
        formMap['attachment'] = await MultipartFile.fromFile(
          attachmentPath,
          filename: fileName,
          contentType: MediaType.parse(mimeType),
        );
      }

      final formData = FormData.fromMap(formMap);

      final response = await _dio.put(
        '${_endpoints.deposits}/$id',
        data: formData,
        options: Options(contentType: Headers.multipartFormDataContentType),
      );
      final body = _validateResponse(response);
      return DepositModel.fromJson(body['data'] as Map<String, dynamic>);
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

  String _getMimeType(String fileName) {
    final extension = fileName.split('.').last.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
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

      if (e.type == DioExceptionType.unknown) {
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
