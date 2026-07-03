import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../models/print_coin_info_model.dart';
import '../models/print_info_model.dart';

abstract class PrintRemoteDatasource {
  Future<PrintInfoModel> getPrintInfo(int orderId);
  Future<PrintCoinInfoModel> processReceipt(
    int orderId, {
    String? clientRequestId,
  });
  Future<PrintCoinInfoModel> processLabel(
    int orderId, {
    String? clientRequestId,
  });
}

class PrintRemoteDatasourceImpl implements PrintRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  PrintRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<PrintInfoModel> getPrintInfo(int orderId) async {
    try {
      final response = await _dio.get(_endpoints.orderPrintInfo(orderId));
      final body = validateResponse(response);
      final data = body['data'];

      if (data is! Map<String, dynamic>) {
        throw ApiException(
          message: 'Invalid print info payload',
          statusCode: response.statusCode,
        );
      }

      return PrintInfoModel.fromJson(data);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<PrintCoinInfoModel> processReceipt(
    int orderId, {
    String? clientRequestId,
  }) async {
    try {
      final options = clientRequestId != null
          ? Options(headers: {'Client-Request-Id': clientRequestId})
          : null;
      final response = await _dio.post(
        _endpoints.orderPrintReceipt(orderId),
        options: options,
      );
      final body = validateResponse(response);
      return parsePrintCoinInfo(body, response.statusCode);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<PrintCoinInfoModel> processLabel(
    int orderId, {
    String? clientRequestId,
  }) async {
    try {
      final options = clientRequestId != null
          ? Options(headers: {'Client-Request-Id': clientRequestId})
          : null;
      final response = await _dio.post(
        _endpoints.orderPrintLabel(orderId),
        options: options,
      );
      final body = validateResponse(response);
      return parsePrintCoinInfo(body, response.statusCode);
    } catch (e) {
      throw _handleError(e);
    }
  }

  static PrintCoinInfoModel parsePrintCoinInfo(
    Map<String, dynamic> body,
    int? statusCode,
  ) {
    final data = body['data'];
    if (data is! Map<String, dynamic>) {
      throw ApiException(
        message: body['message'] as String? ?? 'Invalid print response payload',
        statusCode: statusCode,
      );
    }

    final coinPrice = _readRequiredInt(data, const [
      'coin_deducted',
      'coinDeducted',
    ], statusCode);
    final coinSource = _readRequiredString(data, const [
      'coin_source',
      'coinSource',
    ], statusCode);
    final remainingCoin = _readRequiredInt(data, const [
      'remaining_coin',
      'remainingCoin',
    ], statusCode);

    return PrintCoinInfoModel(
      coinPrice: coinPrice,
      featureActive: true,
      hasEnoughCoin: true,
      coinSource: coinSource,
      outletCoinBalance: coinSource == 'outlet' ? remainingCoin : 0,
      ownerCoinBalance: coinSource == 'owner' ? remainingCoin : 0,
    );
  }

  static Map<String, dynamic> validateResponse(Response response) {
    final body = response.data;

    if (body is! Map<String, dynamic>) {
      throw ApiException(
        message: 'Invalid response format',
        statusCode: response.statusCode,
      );
    }

    final statusCode = response.statusCode ?? 500;
    final message = body['message'] as String? ?? 'Request failed';

    if (statusCode < 200 || statusCode >= 300) {
      throw ApiException(message: message, statusCode: statusCode);
    }

    if (body['success'] == false) {
      throw ApiException(message: message, statusCode: statusCode);
    }

    return body;
  }

  static int _readRequiredInt(
    Map<String, dynamic> data,
    List<String> keys,
    int? statusCode,
  ) {
    for (final key in keys) {
      final value = data[key];
      if (value is int) return value;
      if (value is num) return value.toInt();
      if (value is String) {
        final parsed = int.tryParse(value);
        if (parsed != null) return parsed;
      }
    }

    throw ApiException(
      message: 'Missing required integer field: ${keys.join(' / ')}',
      statusCode: statusCode,
    );
  }

  static String _readRequiredString(
    Map<String, dynamic> data,
    List<String> keys,
    int? statusCode,
  ) {
    for (final key in keys) {
      final value = data[key];
      if (value is String && value.isNotEmpty) return value;
    }

    throw ApiException(
      message: 'Missing required string field: ${keys.join(' / ')}',
      statusCode: statusCode,
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
        final message = data is Map<String, dynamic> && data['message'] != null
            ? data['message'] as String
            : 'Request failed';

        return ApiException(
          message: message,
          statusCode: statusCode,
          errors: data is Map<String, dynamic> ? data['errors'] : null,
        );
      }
    }

    return ApiException(message: 'Unexpected error: ${e.toString()}');
  }
}
