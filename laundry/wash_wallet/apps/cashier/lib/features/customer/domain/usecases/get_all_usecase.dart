import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../repositories/customer_repository.dart';

class GetAllParams {
  final int page;
  final int perPage;
  final String? search;
  final int? outletId;
  final String? phone;
  final String? gender;
  final bool? isActive;
  final String sortBy;
  final String sortDirection;

  GetAllParams({
    this.page = 1,
    this.perPage = 15,
    this.search,
    this.outletId,
    this.phone,
    this.gender,
    this.isActive,
    this.sortBy = 'created_at',
    this.sortDirection = 'desc',
  });
}

class GetAllUsecase {
  final CustomerRepository _repository;

  GetAllUsecase(this._repository);

  Future<Result<List<Customer>>> call(GetAllParams params) async {
    return await _repository.getAll(
      page: params.page,
      perPage: params.perPage,
      search: params.search,
      outletId: params.outletId,
      phone: params.phone,
      gender: params.gender,
      isActive: params.isActive,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    );
  }
}
