import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../../../customer_address/domain/entities/customer_address.dart';
import '../../repositories/recent_address_repository.dart';

class GetAllUsecase {
  final RecentAddressRepository _repository;

  GetAllUsecase(this._repository);

  Future<Result<List<CustomerAddress>>> call() {
    return _repository.getAll();
  }
}
