import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../entities/auth_employee.dart';
import '../../repositories/auth_repository.dart';

class CheckAuthStatusUsecase {
  final AuthRepository _repository;

  CheckAuthStatusUsecase(this._repository);

  Future<Result<AuthEmployee>> call() async {
    return await _repository.checkAuthStatus();
  }
}
