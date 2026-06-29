import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/outlet_repository.dart';

class GetOutletReviewSummaryUseCase {
  final OutletRepository _repository;

  GetOutletReviewSummaryUseCase(this._repository);

  Future<Result<OutletReviewSummary>> call({required int outletId}) {
    return _repository.getReviewSummary(outletId: outletId);
  }
}
