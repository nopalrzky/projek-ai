import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../repositories/order_repository.dart';

class ClearDraftParams {
  final int customerId;
  final int outletId;
  final int employeeId;

  ClearDraftParams({
    required this.customerId,
    required this.outletId,
    required this.employeeId,
  });
}

class ClearDraftUsecase {
  final OrderRepository _repository;

  ClearDraftUsecase(this._repository);

  Future<Result<void>> call(ClearDraftParams params) async {
    return await _repository.clearDraft(
      customerId: params.customerId,
      outletId: params.outletId,
      employeeId: params.employeeId,
    );
  }
}
