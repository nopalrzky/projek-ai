import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../repositories/deposit_repository.dart';

class GetAllParams {
  final int page;
  final int perPage;
  final String? search;
  final int? ownerId;
  final String? status;
  final int? outletId;
  final int? cashierId;
  final String sortBy;
  final String sortDirection;

  const GetAllParams({
    this.page = 1,
    this.perPage = 15,
    this.search,
    this.ownerId,
    this.status,
    this.outletId,
    this.cashierId,
    this.sortBy = 'created_at',
    this.sortDirection = 'desc',
  });
}

class GetAllUsecase {
  final DepositRepository _repository;

  GetAllUsecase(this._repository);

  Future<Result<List<Deposit>>> call(GetAllParams params) async {
    return await _repository.getAll(
      page: params.page,
      perPage: params.perPage,
      search: params.search,
      ownerId: params.ownerId,
      status: params.status,
      outletId: params.outletId,
      cashierId: params.cashierId,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    );
  }
}

typedef GetDepositsParams = GetAllParams;
typedef GetDepositsUsecase = GetAllUsecase;
