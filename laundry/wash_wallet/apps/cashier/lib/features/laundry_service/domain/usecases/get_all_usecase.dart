import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../repositories/laundry_service_repository.dart';

class GetAllParams {
  final int page;
  final int perPage;
  final String? search;
  final int? outletId;
  final int? categoryId;
  final int? unitId;
  final bool? isActive;
  final String sortBy;
  final String sortDirection;

  GetAllParams({
    this.page = 1,
    this.perPage = 15,
    this.search,
    this.outletId,
    this.categoryId,
    this.unitId,
    this.isActive,
    this.sortBy = 'createdAt',
    this.sortDirection = 'desc',
  });
}

class GetAllUsecase {
  final LaundryServiceRepository _repository;

  GetAllUsecase(this._repository);

  Future<Result<List<LaundryService>>> call(
    GetAllParams params,
  ) async {
    return await _repository.getAll(
      page: params.page,
      perPage: params.perPage,
      search: params.search,
      outletId: params.outletId,
      categoryId: params.categoryId,
      unitId: params.unitId,
      isActive: params.isActive,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    );
  }
}
