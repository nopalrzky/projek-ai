import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../entities/customer_address.dart';
import '../repositories/customer_address_repository.dart';

class GetByIdUsecase {
  final CustomerAddressRepository _repository;

  GetByIdUsecase(this._repository);

  Future<Result<CustomerAddress>> call({required int id}) {
    return _repository.getById(id: id);
  }
}
