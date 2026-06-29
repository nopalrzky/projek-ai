import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../entities/customer_account.dart';
import '../../repositories/customer_auth_repository.dart';

class CheckCustomerAuthStatusUsecase {
  final CustomerAuthRepository _repository;

  CheckCustomerAuthStatusUsecase(this._repository);

  Future<Result<CustomerAccount>> call() async {
    return await _repository.checkAuthStatus();
  }
}
