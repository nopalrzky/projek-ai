import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/petty_cash_repository.dart';

class GetAllParams {
  final int page;
  final int perPage;
  final String? search;
  final String? status;
  final int? outletId;
  final int? cashierId;
  final int? ownerId;
  final String sortBy;
  final String sortDirection;

  const GetAllParams({
    this.page = 1,
    this.perPage = 15,
    this.search,
    this.status,
    this.outletId,
    this.cashierId,
    this.ownerId,
    this.sortBy = 'created_at',
    this.sortDirection = 'desc',
  });
}

class GetAllUsecase {
  final PettyCashRepository _repository;

  GetAllUsecase(this._repository);

  Future<Result<List<PettyCash>>> call(GetAllParams params) async {
    return await _repository.getAll(
      page: params.page,
      perPage: params.perPage,
      search: params.search,
      status: params.status,
      outletId: params.outletId,
      cashierId: params.cashierId,
      ownerId: params.ownerId,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    );
  }
}
