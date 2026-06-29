import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_repository.dart';
import '../entities/submit_review_params.dart';

class SubmitReviewUseCase {
  final OrderRepository repository;

  SubmitReviewUseCase(this.repository);

  Future<Result<Order>> call(SubmitReviewParams params) {
    return repository.submitReview(params);
  }
}
