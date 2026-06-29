import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../repositories/customer_subscription_repository.dart';

class GetByIdUsecase {
  final CustomerSubscriptionRepository _repository;

  GetByIdUsecase(this._repository);

  Future<Result<CustomerSubscription>> call(int id) async {
    return _repository.getById(id);
  }
}
