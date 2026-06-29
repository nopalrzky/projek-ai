import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../entities/customer_account.dart';
import '../../repositories/customer_auth_repository.dart';

class LoginWithPasswordUsecase {
  final CustomerAuthRepository _repository;

  LoginWithPasswordUsecase(this._repository);

  Future<Result<CustomerAccount>> call({
    required String phone,
    required String password,
    String? deviceName,
  }) async {
    return await _repository.loginWithPassword(
      phone: phone,
      password: password,
      deviceName: deviceName,
    );
  }
}
