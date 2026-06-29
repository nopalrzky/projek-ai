import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../repositories/customer_subscription_repository.dart';

class StoreCustomerSubscriptionParams {
  final int customerId;
  final int servicePackageId;
  final double pricePaid;
  final String? purchaseDate;
  final String? note;

  const StoreCustomerSubscriptionParams({
    required this.customerId,
    required this.servicePackageId,
    required this.pricePaid,
    this.purchaseDate,
    this.note,
  });
}

class StoreUsecase {
  final CustomerSubscriptionRepository _repository;

  StoreUsecase(this._repository);

  Future<Result<CustomerSubscription>> call(
    StoreCustomerSubscriptionParams params,
  ) async {
    return _repository.store(
      customerId: params.customerId,
      servicePackageId: params.servicePackageId,
      pricePaid: params.pricePaid,
      purchaseDate: params.purchaseDate,
      note: params.note,
    );
  }
}
