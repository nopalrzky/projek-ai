import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../repositories/customer_auth_repository.dart';

class CustomerLogoutUsecase {
  final CustomerAuthRepository _repository;

  CustomerLogoutUsecase(this._repository);

  Future<Result<void>> call() async {
    return await _repository.logout();
  }
}
