import 'package:dio/dio.dart';
import 'package:http_parser/http_parser.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class ExpenseRemoteDatasource {
  Future<PaginatedData<ExpenseModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    int? outletId,
    int? employeeId,
    int? expenseAccountId,
    int? sourceAccountId,
    String? startDate,
    String? endDate,
    double? minAmount,
    double? maxAmount,
    bool? hasAttachment,
    String sortBy = 'date',
    String sortDirection = 'desc',
  });

  Future<ExpenseModel> getById(int id);

  Future<ExpenseModel> store({
    required int outletId,
    required int expenseAccountId,
    int? sourceAccountId,
    required double amount,
    required String date,
    String? description,
    String? attachmentPath,
  });

  Future<ExpenseModel> update({
    required int id,
    required int outletId,
    required int expenseAccountId,
    int? sourceAccountId,
    required double amount,
    required String date,
    String? description,
    String? attachmentPath,
    bool removeAttachment = false,
  });
}

class ExpenseRemoteDatasourceImpl implements ExpenseRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  ExpenseRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<PaginatedData<ExpenseModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    int? outletId,
    int? employeeId,
    int? expenseAccountId,
    int? sourceAccountId,
    String? startDate,
    String? endDate,
    double? minAmount,
    double? maxAmount,
    bool? hasAttachment,
    String sortBy = 'date',
    String sortDirection = 'desc',
  }) async {
    try {
      final queryParams = {
        'page': page,
        'perPage': perPage,
        if (search != null && search.trim().isNotEmpty) 'search': search,
        'status': ?status,
        'outletId': ?outletId,
        'employeeId': ?employeeId,
        'expenseAccountId': ?expenseAccountId,
        'sourceAccountId': ?sourceAccountId,
        'startDate': ?startDate,
        'endDate': ?endDate,
        'minAmount': ?minAmount,
        'maxAmount': ?maxAmount,
        'hasAttachment': ?hasAttachment,
        'sortBy': sortBy,
        'sortDirection': sortDirection,
      };

      final response = await _dio.get(
        _endpoints.expenses,
        queryParameters: queryParams,
      );

      final body = _validateResponse(response);
      final List data = body['data'] as List? ?? [];
      final meta = body['meta'] as Map<String, dynamic>? ?? {};
      final items = data.map((e) => ExpenseModel.fromJson(e)).toList();
      return PaginatedData<ExpenseModel>.fromMeta(
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
  Future<ExpenseModel> getById(int id) async {
    try {
      final response = await _dio.get('${_endpoints.expenses}/$id');
      final body = _validateResponse(response);
      return ExpenseModel.fromJson(body['data'] as Map<String, dynamic>);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<ExpenseModel> store({
    required int outletId,
    required int expenseAccountId,
    int? sourceAccountId,
    required double amount,
    required String date,
    String? description,
    String? attachmentPath,
  }) async {
    try {
      final payload = <String, dynamic>{
        'outletId': outletId,
        'expenseAccountId': expenseAccountId,
        'sourceAccountId': ?sourceAccountId,
        'amount': amount,
        'date': date,
        'description': ?description,
      };

      dynamic data = payload;
      if (attachmentPath != null && attachmentPath.trim().isNotEmpty) {
        final fileName = attachmentPath.split('/').last;
        final mimeType = _getMimeType(fileName);
        data = FormData.fromMap({
          ...payload,
          'attachment': await MultipartFile.fromFile(
            attachmentPath,
            filename: fileName,
            contentType: MediaType.parse(mimeType),
          ),
        });
      }

      final response = await _dio.post(
        _endpoints.expenses,
        data: data,
        options: data is FormData
            ? Options(contentType: Headers.multipartFormDataContentType)
            : null,
      );

      final body = _validateResponse(response);
      return ExpenseModel.fromJson(body['data'] as Map<String, dynamic>);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<ExpenseModel> update({
    required int id,
    required int outletId,
    required int expenseAccountId,
    int? sourceAccountId,
    required double amount,
    required String date,
    String? description,
    String? attachmentPath,
    bool removeAttachment = false,
  }) async {
    try {
      final payload = <String, dynamic>{
        'outletId': outletId,
        'expenseAccountId': expenseAccountId,
        'sourceAccountId': ?sourceAccountId,
        'amount': amount,
        'date': date,
        'description': ?description,
        if (removeAttachment) 'removeAttachment': true,
      };

      dynamic data = payload;
      if (attachmentPath != null && attachmentPath.trim().isNotEmpty) {
        final fileName = attachmentPath.split('/').last;
        final mimeType = _getMimeType(fileName);
        data = FormData.fromMap({
          ...payload,
          'attachment': await MultipartFile.fromFile(
            attachmentPath,
            filename: fileName,
            contentType: MediaType.parse(mimeType),
          ),
        });
      }

      final response = await _dio.put(
        '${_endpoints.expenses}/$id',
        data: data,
        options: data is FormData
            ? Options(contentType: Headers.multipartFormDataContentType)
            : null,
      );

      final body = _validateResponse(response);
      return ExpenseModel.fromJson(body['data'] as Map<String, dynamic>);
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
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
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
