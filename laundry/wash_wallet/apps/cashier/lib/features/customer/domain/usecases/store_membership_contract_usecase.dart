import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../repositories/customer_repository.dart';

class StoreMembershipContractUsecase {
  final CustomerRepository _repository;

  StoreMembershipContractUsecase(this._repository);

  Future<Result<Customer>> call({
    required int customerId,
    required int membershipPlanId,
    String? startAt,
    double? totalPaid,
  }) async {
    return await _repository.storeMembershipContract(
      customerId: customerId,
      membershipPlanId: membershipPlanId,
      startAt: startAt,
      totalPaid: totalPaid,
    );
  }
}
