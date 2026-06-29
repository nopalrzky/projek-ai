import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../entities/customer_account.dart';
import '../../repositories/customer_auth_repository.dart';

class VerifyOtpUsecase {
  final CustomerAuthRepository _repository;

  VerifyOtpUsecase(this._repository);

  Future<Result<CustomerAccount>> call({
    required String phone,
    required String otp,
  }) async {
    return await _repository.verifyOtp(phone: phone, otp: otp);
  }
}
