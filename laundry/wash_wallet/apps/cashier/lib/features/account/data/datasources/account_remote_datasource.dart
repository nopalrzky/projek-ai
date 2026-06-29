import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class AccountRemoteDatasource {
  Future<List<AccountModel>> getAll({
    required int outletId,
    required String type,
  });
}

class AccountRemoteDatasourceImpl implements AccountRemoteDatasource {
  final Dio dio;
  final ApiEndpoints endpoints;

  AccountRemoteDatasourceImpl({required this.dio, required this.endpoints});

  @override
  Future<List<AccountModel>> getAll({
    required int outletId,
    required String type,
  }) async {
    try {
      final response = await dio.get(
        endpoints.accounts,
        queryParameters: {'outletId': outletId, 'type': type},
      );

      _validateResponse(response);

      final List data = response.data['data'] as List? ?? [];
      return data.map((e) => AccountModel.fromJson(e)).toList();
    } on DioException catch (e) {
      throw _handleDioException(e);
    } catch (e) {
      if (e is ApiException || e is NetworkException) rethrow;
      throw ApiException(message: 'Unexpected error: ${e.toString()}');
    }
  }

  void _validateResponse(Response response) {
    final body = response.data;

    if (response.statusCode == null ||
        response.statusCode! < 200 ||
        response.statusCode! >= 300) {
      throw ApiException(
        message: body is Map<String, dynamic>
            ? (body['message']?.toString() ?? 'Request failed')
            : 'Request failed',
        statusCode: response.statusCode,
        errors: body is Map<String, dynamic> ? body['errors'] : null,
      );
    }

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
        errors: body['errors'],
      );
    }
  }

  Exception _handleDioException(DioException e) {
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout ||
        e.type == DioExceptionType.sendTimeout) {
      return NetworkException(message: 'Connection timeout. Please try again.');
    }

    if (e.type == DioExceptionType.connectionError ||
        e.type == DioExceptionType.unknown) {
      return NetworkException(
        message: 'No internet connection. Please check your network.',
      );
    }

    final data = e.response?.data;
    return ApiException(
      message: data is Map<String, dynamic>
          ? (data['message']?.toString() ?? 'Request failed')
          : (e.message ?? 'Request failed'),
      statusCode: e.response?.statusCode,
      errors: data is Map<String, dynamic> ? data['errors'] : null,
    );
  }
}
