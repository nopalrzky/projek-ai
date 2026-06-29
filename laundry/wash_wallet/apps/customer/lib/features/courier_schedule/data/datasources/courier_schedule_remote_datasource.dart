import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../models/courier_schedule_model.dart';

abstract class CourierScheduleRemoteDatasource {
  Future<CourierScheduleDataModel> getAll({
    required int outletId,
    String? dayOfWeek,
    String? type,
    String? date,
  });
}

class CourierScheduleRemoteDatasourceImpl
    implements CourierScheduleRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  CourierScheduleRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<CourierScheduleDataModel> getAll({
    required int outletId,
    String? dayOfWeek,
    String? type,
    String? date,
  }) async {
    try {
      final Map<String, dynamic> queryParams = {
        'outletId': outletId,
      };
      
      if (dayOfWeek != null) queryParams['dayOfWeek'] = dayOfWeek;
      if (type != null) queryParams['type'] = type;
      if (date != null) queryParams['date'] = date;

      final response = await _dio.get(
        _endpoints.courierSchedules,
        queryParameters: queryParams,
      );

      final body = _validateResponse(response);
      return CourierScheduleDataModel.fromJsonResponse(body);
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

      if (body['success'] != true) {
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

  Exception _handleError(Object e) {
    if (e is ApiException) return e;

    if (e is DioException) {
      if (e.response != null) {
        final data = e.response!.data;
        String message = 'Request failed';
        if (data is Map<String, dynamic> && data['message'] != null) {
          message = data['message'] as String;
        }

        return ApiException(
          message: message,
          statusCode: e.response!.statusCode,
          errors: data is Map<String, dynamic>
              ? data['errors'] as Map<String, dynamic>?
              : null,
        );
      }
      return NetworkException(message: e.message ?? 'Unknown error occurred');
    }

    return ApiException(message: 'Unexpected error: ${e.toString()}');
  }
}
