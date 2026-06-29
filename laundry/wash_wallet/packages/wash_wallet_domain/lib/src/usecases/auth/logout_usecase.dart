import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../repositories/auth_repository.dart';

class LogoutUsecase {
  final AuthRepository _repository;

  LogoutUsecase(this._repository);

  Future<Result<void>> call() async {
    return await _repository.logout();
  }
}
