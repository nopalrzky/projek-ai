import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../repositories/auth_repository.dart';

class ChangePasswordUseCase {
  final AuthRepository repository;

  ChangePasswordUseCase(this.repository);

  Future<Result<void>> call({
    required String currentPassword,
    required String newPassword,
    required String newPasswordConfirmation,
  }) => repository.changePassword(
    currentPassword: currentPassword,
    newPassword: newPassword,
    newPasswordConfirmation: newPasswordConfirmation,
  );
}
