import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../entities/auth_employee.dart';
import '../../repositories/auth_repository.dart';

class SaveRememberedAccountUsecase {
  final AuthRepository _repository;

  SaveRememberedAccountUsecase(this._repository);

  Future<Result<void>> call(AuthEmployee employee) {
    return _repository.saveRememberedAccount(employee);
  }
}
