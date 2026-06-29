import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../repositories/laundry_service_repository.dart';

class DestroyUsecase {
  final LaundryServiceRepository _repository;

  DestroyUsecase(this._repository);

  Future<Result<void>> call(int id) async {
    return await _repository.destroy(id);
  }
}
