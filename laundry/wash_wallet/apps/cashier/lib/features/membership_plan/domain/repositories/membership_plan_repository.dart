import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class MembershipPlanRepository {
  Future<Result<PaginatedData<MembershipPlan>>> getAll({
    int page,
    int perPage,
    String? search,
    int? outletId,
    bool? isActive,
    double? minPrice,
    double? maxPrice,
    int? minDurationDays,
    int? maxDurationDays,
    double? minDiscountPercentage,
    double? maxDiscountPercentage,
    String sortBy,
    String sortOrder,
  });

  Future<Result<MembershipPlan>> getById(int membershipPlanId);
}
