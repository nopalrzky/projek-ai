import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../entities/auth_employee.dart';
import '../../repositories/auth_repository.dart';

class VerifyPinParams {
  final int? employeeId;
  final String? username;
  final String pin;

  VerifyPinParams({this.employeeId, this.username, required this.pin});
}

class VerifyPinUseCase {
  final AuthRepository _repository;

  VerifyPinUseCase(this._repository);

  Future<Result<AuthEmployee>> call(VerifyPinParams params) {
    return _repository.verifyPin(
      employeeId: params.employeeId,
      username: params.username,
      pin: params.pin,
    );
  }
}
