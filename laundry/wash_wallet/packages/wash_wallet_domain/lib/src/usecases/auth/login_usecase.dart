import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../entities/auth_employee.dart';
import '../../repositories/auth_repository.dart';

class LoginUsecase {
  final AuthRepository _repository;

  LoginUsecase(this._repository);

  Future<Result<AuthEmployee>> call({
    required String username,
    required String password,
  }) async {
    return await _repository.login(username: username, password: password);
  }
}
