import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../repositories/customer_repository.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class StoreCustomerSubscriptionUsecase {
  final CustomerRepository _repository;

  StoreCustomerSubscriptionUsecase(this._repository);

  Future<Result<Customer>> call({
    required int customerId,
    required int servicePackageId,
    required double pricePaid,
    String? purchaseDate,
    String? note,
  }) async {
    return await _repository.storeCustomerSubscription(
      customerId: customerId,
      servicePackageId: servicePackageId,
      pricePaid: pricePaid,
      purchaseDate: purchaseDate,
      note: note,
    );
  }
}
