import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/membership_contract_repository.dart';

class GetAllParams {
  final int page;
  final int perPage;
  final String? search;
  final int? customerId;
  final int? outletId;
  final int? membershipPlanId;
  final String? status;
  final double? totalPaidMin;
  final double? totalPaidMax;
  final String sortBy;
  final String sortDirection;

  const GetAllParams({
    this.page = 1,
    this.perPage = 15,
    this.search,
    this.customerId,
    this.outletId,
    this.membershipPlanId,
    this.status,
    this.totalPaidMin,
    this.totalPaidMax,
    this.sortBy = 'createdAt',
    this.sortDirection = 'desc',
  });
}

class GetAllUsecase {
  final MembershipContractRepository _repository;

  GetAllUsecase(this._repository);

  Future<Result<List<MembershipContract>>> call(GetAllParams params) async {
    return await _repository.getAll(
      page: params.page,
      perPage: params.perPage,
      search: params.search,
      customerId: params.customerId,
      outletId: params.outletId,
      membershipPlanId: params.membershipPlanId,
      status: params.status,
      totalPaidMin: params.totalPaidMin,
      totalPaidMax: params.totalPaidMax,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    );
  }
}
