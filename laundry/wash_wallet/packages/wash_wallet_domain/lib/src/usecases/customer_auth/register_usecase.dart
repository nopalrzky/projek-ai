import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../entities/customer_account.dart';
import '../../repositories/customer_auth_repository.dart';

class RegisterUsecase {
  final CustomerAuthRepository _repository;

  RegisterUsecase(this._repository);

  Future<Result<CustomerAccount>> call({
    required String phone,
    required String name,
    String? email,
    String? gender,
    String? password,
    String? dateOfBirth,
    String? deviceName,
  }) async {
    return await _repository.register(
      phone: phone,
      name: name,
      email: email,
      gender: gender,
      password: password,
      dateOfBirth: dateOfBirth,
      deviceName: deviceName,
    );
  }
}
