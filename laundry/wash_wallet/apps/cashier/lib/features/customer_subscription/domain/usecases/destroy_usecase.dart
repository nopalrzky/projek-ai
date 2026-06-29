import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../repositories/customer_subscription_repository.dart';

class DestroyUsecase {
  final CustomerSubscriptionRepository _repository;

  DestroyUsecase(this._repository);

  Future<Result<void>> call(int id) async {
    return _repository.destroy(id);
  }
}
