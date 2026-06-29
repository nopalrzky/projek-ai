import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../entities/courier_setting_summary.dart';
import '../repositories/courier_pricing_repository.dart';

class GetSettingSummaryUsecase {
  final CourierPricingRepository _repository;

  const GetSettingSummaryUsecase(this._repository);

  Future<Result<CourierSettingSummary>> call(int outletId) {
    return _repository.getSettingSummary(outletId);
  }
}
