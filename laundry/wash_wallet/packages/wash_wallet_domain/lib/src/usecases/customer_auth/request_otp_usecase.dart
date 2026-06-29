import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../repositories/customer_auth_repository.dart';

class RequestOtpUsecase {
  final CustomerAuthRepository _repository;

  RequestOtpUsecase(this._repository);

  Future<Result<bool>> call(String phone, {required String intent}) async {
    return await _repository.requestOtp(phone, intent: intent);
  }
}
