import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../entities/courier_pricing_result.dart';
import '../entities/courier_setting_summary.dart';

abstract class CourierPricingRepository {
  Future<Result<CourierPricingResult>> calculateFee({
    required int outletId,
    required double latitude,
    required double longitude,
    int? customerId,
    double? orderTotal,
    int? addressId,
  });

  Future<Result<CourierSettingSummary>> getSettingSummary(int outletId);
}
