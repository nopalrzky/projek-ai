import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_review_repository.dart';

class GetOrderReviewSummaryUseCase {
  final OrderReviewRepository _repository;

  GetOrderReviewSummaryUseCase(this._repository);

  Future<Result<OutletReviewSummary>> call({required int outletId}) {
    return _repository.getSummary(outletId);
  }
}
