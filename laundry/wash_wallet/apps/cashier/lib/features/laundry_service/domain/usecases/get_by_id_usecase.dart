import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../repositories/laundry_service_repository.dart';

class GetByIdUsecase {
  final LaundryServiceRepository _repository;

  GetByIdUsecase(this._repository);

  Future<Result<LaundryService>> call(int id) async {
    return await _repository.getById(id);
  }
}
