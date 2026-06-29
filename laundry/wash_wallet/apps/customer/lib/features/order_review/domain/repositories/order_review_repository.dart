import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class OrderReviewRepository {
  Future<Result<List<OrderReview>>> getAll({
    int? outletId,
    int? customerAccountId,
    int? orderId,
    int? rating,
    int page = 1,
    int perPage = 15,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  });
  Future<Result<OrderReview>> getById(int id);
  Future<Result<OutletReviewSummary>> getSummary(int outletId);
}
