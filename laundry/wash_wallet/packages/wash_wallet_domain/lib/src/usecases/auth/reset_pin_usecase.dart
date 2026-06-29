import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../entities/auth_employee.dart';
import '../../repositories/auth_repository.dart';

class ResetPinParams {
  final String currentPin;
  final String pin;
  final String pinConfirmation;

  const ResetPinParams({
    required this.currentPin,
    required this.pin,
    required this.pinConfirmation,
  });
}

class ResetPinUseCase {
  final AuthRepository _repository;

  ResetPinUseCase(this._repository);

  Future<Result<AuthEmployee>> call(ResetPinParams params) {
    return _repository.resetPin(
      currentPin: params.currentPin,
      pin: params.pin,
      pinConfirmation: params.pinConfirmation,
    );
  }
}
