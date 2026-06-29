import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../entities/customer_account.dart';
import '../../repositories/customer_auth_repository.dart';

class SetPasswordParams {
  final String password;
  final String passwordConfirmation;

  SetPasswordParams({
    required this.password,
    required this.passwordConfirmation,
  });
}

class SetPasswordUsecase {
  final CustomerAuthRepository _repository;

  SetPasswordUsecase(this._repository);

  Future<Result<CustomerAccount>> call(SetPasswordParams params) {
    return _repository.setPassword(
      password: params.password,
      passwordConfirmation: params.passwordConfirmation,
    );
  }
}
