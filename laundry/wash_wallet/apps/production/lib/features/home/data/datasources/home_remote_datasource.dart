import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../domain/entities/home.dart';
import '../models/active_order_model.dart';
import '../models/home_summary_model.dart';
import '../models/priority_order_model.dart';
import '../models/process_queue_model.dart';

abstract class HomeRemoteDatasource {
  Future<Home> getHomeData();
}

class HomeRemoteDatasourceImpl implements HomeRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  HomeRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<Home> getHomeData() async {
    try {
      final response = await _dio.get(_endpoints.dashboard);

      if (response.statusCode != 200) {
        throw ApiException(
          message: 'Failed to retrieve dashboard data',
          statusCode: response.statusCode,
        );
      }

      final data = _extractMap(response.data['data'] ?? response.data);

      return _mapHome(data);
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

  Home _mapHome(Map<String, dynamic> json) {
    final summaryJson = _extractMap(
      json['summary'] ?? json['homeSummary'] ?? json['summaryData'],
    );

    return Home(
      employeeName: _readString(json, const [
        'employeeName',
        'employee_name',
        'name',
      ]),
      outletName: _readString(json, const ['outletName', 'outlet_name']),
      summary: HomeSummaryModel.fromJson({
        'ordersToday': _readInt(summaryJson, const [
          'ordersToday',
          'orders_today',
        ]),
        'ordersInProgress': _readInt(summaryJson, const [
          'ordersInProgress',
          'orders_in_progress',
        ]),
        'ordersReadyForPickup': _readInt(summaryJson, const [
          'ordersReadyForPickup',
          'orders_ready_for_pickup',
        ]),
        'ordersCompleted': _readInt(summaryJson, const [
          'ordersCompleted',
          'orders_completed',
        ]),
      }).toEntity(),
      processQueue: _readList(json, const ['processQueue', 'process_queue'])
          .map(
            (item) => ProcessQueueModel.fromJson(_extractMap(item)).toEntity(),
          )
          .toList(),
      activeOrders: _readList(json, const ['activeOrders', 'active_orders'])
          .map(
            (item) => ActiveOrderModel.fromJson(_extractMap(item)).toEntity(),
          )
          .toList(),
      priorityOrders:
          _readList(json, const ['priorityOrders', 'priority_orders'])
              .map(
                (item) =>
                    PriorityOrderModel.fromJson(_extractMap(item)).toEntity(),
              )
              .toList(),
    );
  }

  Map<String, dynamic> _extractMap(dynamic value) {
    if (value is Map<String, dynamic>) return value;
    if (value is Map) {
      return value.map((key, dynamic item) => MapEntry(key.toString(), item));
    }
    return <String, dynamic>{};
  }

  List<dynamic> _readList(Map<String, dynamic> json, List<String> keys) {
    for (final key in keys) {
      final value = json[key];
      if (value is List) return value;
    }
    return const [];
  }

  String _readString(Map<String, dynamic> json, List<String> keys) {
    for (final key in keys) {
      final value = json[key];
      if (value is String && value.isNotEmpty) return value;
      if (value != null) return value.toString();
    }
    return '';
  }

  int _readInt(Map<String, dynamic> json, List<String> keys) {
    for (final key in keys) {
      final value = json[key];
      if (value is int) return value;
      if (value is double) return value.toInt();
      if (value is String) {
        final parsed = int.tryParse(value);
        if (parsed != null) return parsed;
      }
    }
    return 0;
  }
}
