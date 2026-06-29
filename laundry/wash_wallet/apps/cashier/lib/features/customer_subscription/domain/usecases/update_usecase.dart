import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../repositories/customer_subscription_repository.dart';

class UpdateCustomerSubscriptionParams {
  final int customerSubscriptionId;
  final String? status;
  final String? note;

  const UpdateCustomerSubscriptionParams({
    required this.customerSubscriptionId,
    this.status,
    this.note,
  });
}

class UpdateUsecase {
  final CustomerSubscriptionRepository _repository;

  UpdateUsecase(this._repository);

  Future<Result<CustomerSubscription>> call(
    UpdateCustomerSubscriptionParams params,
  ) async {
    return _repository.update(
      id: params.customerSubscriptionId,
      status: params.status,
      note: params.note,
    );
  }
}
