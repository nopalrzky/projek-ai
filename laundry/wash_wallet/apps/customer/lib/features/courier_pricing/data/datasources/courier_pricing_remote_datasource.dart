import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../models/courier_pricing_result_model.dart';
import '../models/courier_setting_summary_model.dart';

abstract class CourierPricingRemoteDatasource {
  Future<CourierPricingResultModel> calculateFee({
    required int outletId,
    required double latitude,
    required double longitude,
    int? customerId,
    double? orderTotal,
    int? customerAddressId,
  });

  Future<CourierSettingSummaryModel> getSettingSummary(int outletId);
}

class CourierPricingRemoteDatasourceImpl
    implements CourierPricingRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  const CourierPricingRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<CourierPricingResultModel> calculateFee({
    required int outletId,
    required double latitude,
    required double longitude,
    int? customerId,
    double? orderTotal,
    int? customerAddressId,
  }) async {
    final response = await _dio.get(
      _endpoints.courierCalculateFee(outletId),
      queryParameters: {
        'latitude': latitude,
        'longitude': longitude,
        'customerId': customerId,
        'orderTotal': orderTotal,
        'customerAddressId': customerAddressId,
      },
    );

    return CourierPricingResultModel.fromJson(response.data['data']);
  }

  @override
  Future<CourierSettingSummaryModel> getSettingSummary(int outletId) async {
    final response = await _dio.get(_endpoints.courierSettingSummary(outletId));
    return CourierSettingSummaryModel.fromJson(response.data['data']);
  }
}
