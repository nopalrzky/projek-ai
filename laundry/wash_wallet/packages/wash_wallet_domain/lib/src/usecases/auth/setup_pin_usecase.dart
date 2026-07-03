import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../entities/auth_employee.dart';
import '../../repositories/auth_repository.dart';

class SetupPinParams {
  final String pin;
  final String pinConfirmation;

  SetupPinParams({required this.pin, required this.pinConfirmation});
}

class SetupPinUseCase {
  final AuthRepository _repository;

  SetupPinUseCase(this._repository);

  Future<Result<AuthEmployee>> call(SetupPinParams params) {
    return _repository.setupPin(
      pin: params.pin,
      pinConfirmation: params.pinConfirmation,
    );
  }
}
