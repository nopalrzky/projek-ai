import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../entities/customer_account.dart';
import '../../repositories/customer_auth_repository.dart';

class UpdateProfileParams {
  final String name;
  final String? email;
  final String? gender;
  final String? dateOfBirth;

  UpdateProfileParams({
    required this.name,
    this.email,
    this.gender,
    this.dateOfBirth,
  });
}

class UpdateProfileUsecase {
  final CustomerAuthRepository _repository;

  UpdateProfileUsecase(this._repository);

  Future<Result<CustomerAccount>> call(UpdateProfileParams params) {
    return _repository.updateProfile(
      name: params.name,
      email: params.email,
      gender: params.gender,
      dateOfBirth: params.dateOfBirth,
    );
  }
}
