import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../entities/auth_employee.dart';
import '../../repositories/auth_repository.dart';

class UpdateProfileUseCase {
  final AuthRepository repository;

  UpdateProfileUseCase(this.repository);

  Future<Result<AuthEmployee>> call({
    required String name,
    String? email,
    String? phone,
    String? gender,
    String? address,
  }) => repository.updateProfile(
    name: name,
    email: email,
    phone: phone,
    gender: gender,
    address: address,
  );
}
