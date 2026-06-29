import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../../../customer_address/domain/entities/customer_address.dart';
import '../../repositories/recent_address_repository.dart';

class SaveUsecase {
  final RecentAddressRepository _repository;

  SaveUsecase(this._repository);

  Future<Result<void>> call(CustomerAddress address) {
    return _repository.save(address);
  }
}
