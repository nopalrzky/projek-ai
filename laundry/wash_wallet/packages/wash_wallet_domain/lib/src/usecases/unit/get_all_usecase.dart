import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../entities/unit.dart';
import '../../repositories/unit_repository.dart';

class GetAllParams {
  final int page;
  final int perPage;
  final String? search;
  final String sortBy;
  final String sortDirection;
  final bool? isActive;

  const GetAllParams({
    this.page = 1,
    this.perPage = 15,
    this.search,
    this.sortBy = 'createdAt',
    this.sortDirection = 'desc',
    this.isActive,
  });
}

class GetAllUsecase {
  final UnitRepository _repository;

  GetAllUsecase(this._repository);

  Future<Result<List<Unit>>> call(GetAllParams params) async {
    return await _repository.getAll(
      page: params.page,
      perPage: params.perPage,
      search: params.search,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      isActive: params.isActive,
    );
  }
}
