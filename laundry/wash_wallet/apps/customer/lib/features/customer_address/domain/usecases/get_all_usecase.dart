import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../entities/customer_address.dart';
import '../repositories/customer_address_repository.dart';

class GetAllUsecase {
  final CustomerAddressRepository _repository;

  GetAllUsecase(this._repository);

  Future<Result<List<CustomerAddress>>> call({
    int page = 1,
    int perPage = 15,
    String? search,
    bool? isPrimary,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  }) {
    return _repository.getAll(
      page: page,
      perPage: perPage,
      search: search,
      isPrimary: isPrimary,
      sortBy: sortBy,
      sortDirection: sortDirection,
    );
  }
}
