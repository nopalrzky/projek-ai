import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class MembershipContractRepository {
  Future<Result<PaginatedData<MembershipContract>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? customerId,
    int? outletId,
    int? membershipPlanId,
    String? status,
    double? totalPaidMin,
    double? totalPaidMax,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  });

  Future<Result<MembershipContract>> getById(int id);
}
