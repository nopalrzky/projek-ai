import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_review_repository.dart';

class GetOrderReviewByIdUseCase {
  final OrderReviewRepository _repository;

  GetOrderReviewByIdUseCase(this._repository);

  Future<Result<OrderReview>> call(int id) {
    return _repository.getById(id);
  }
}
