import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../repositories/customer_address_repository.dart';

class DestroyUsecase {
  final CustomerAddressRepository _repository;

  DestroyUsecase(this._repository);

  Future<Result<void>> call(int id) {
    return _repository.destroy(id);
  }
}
