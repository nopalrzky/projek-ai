import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/outlet_repository.dart';

class GetOutletReviewsUseCase {
  final OutletRepository _repository;

  GetOutletReviewsUseCase(this._repository);

  Future<Result<List<OrderReview>>> call({
    required int outletId,
    int page = 1,
    int perPage = 10,
  }) {
    return _repository.getReviews(
      outletId: outletId,
      page: page,
      perPage: perPage,
    );
  }
}
