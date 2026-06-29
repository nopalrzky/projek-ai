import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../domain/entities/home.dart';

abstract class HomeRemoteDatasource {
  Future<Home> getHomeData();
}

class HomeRemoteDatasourceImpl
    with NetworkRetryMixin
    implements HomeRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  HomeRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<Home> getHomeData() async {
    try {
      final response = await withRetry(() => _dio.get(_endpoints.dashboard));

      if (response.statusCode != 200) {
        throw ApiException(
          message: 'Failed to retrieve dashboard data',
          statusCode: response.statusCode,
        );
      }

      final data = _extractData(response.data);

      return Home(
        employeeName: _readString(data, const [
          'employeeName',
          'employee_name',
          'name',
        ]),
        employeePhone: _readString(data, const [
          'employeePhone',
          'employee_phone',
          'phone',
        ]),
        cashBalance: _readDouble(data, const [
          'cashBalance',
          'cash_balance',
          'balance',
        ]),
        ordersInProduction: _readInt(data, const [
          'ordersInProduction',
          'orders_in_production',
        ]),
        ordersNotPickedUp: _readInt(data, const [
          'ordersNotPickedUp',
          'orders_not_picked_up',
        ]),
        ordersPickedUp: _readInt(data, const [
          'ordersPickedUp',
          'orders_picked_up',
        ]),
      );
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.sendTimeout) {
        throw NetworkException(
          message: 'Connection timeout. Please try again.',
        );
      }

      if (e.type == DioExceptionType.connectionError) {
        throw NetworkException(
          message: 'No internet connection. Please check your network.',
        );
      }

      if (e.response != null) {
        final statusCode = e.response!.statusCode;
        final data = e.response!.data;

        String message = 'Failed to retrieve dashboard data';
        if (data is Map<String, dynamic> && data['message'] != null) {
          message = data['message'] as String;
        }

        throw ApiException(
          message: message,
          statusCode: statusCode,
          errors: data is Map<String, dynamic> ? data['errors'] : null,
        );
      }

      throw NetworkException(message: e.message ?? 'Unknown error occurred');
    } catch (e) {
      throw ApiException(message: 'Unexpected error: ${e.toString()}');
    }
  }

  Map<String, dynamic> _extractData(dynamic responseData) {
    if (responseData is Map<String, dynamic>) {
      final data = responseData['data'];
      if (data is Map<String, dynamic>) return data;
      return responseData;
    }

    return <String, dynamic>{};
  }

  String _readString(Map<String, dynamic> data, List<String> keys) {
    for (final key in keys) {
      final value = data[key];
      if (value is String && value.isNotEmpty) return value;
      if (value != null) return value.toString();
    }

    return '';
  }

  int _readInt(Map<String, dynamic> data, List<String> keys) {
    for (final key in keys) {
      final value = data[key];
      if (value is int) return value;
      if (value is num) return value.toInt();
      if (value is String) {
        final parsed = int.tryParse(value);
        if (parsed != null) return parsed;
      }
    }

    return 0;
  }

  double _readDouble(Map<String, dynamic> data, List<String> keys) {
    for (final key in keys) {
      final value = data[key];
      if (value is double) return value;
      if (value is num) return value.toDouble();
      if (value is String) {
        final parsed = double.tryParse(value);
        if (parsed != null) return parsed;
      }
    }

    return 0.0;
  }
}
