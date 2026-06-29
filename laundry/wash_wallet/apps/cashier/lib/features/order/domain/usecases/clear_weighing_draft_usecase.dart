import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../repositories/order_repository.dart';

class ClearWeighingDraftParams {
  final int orderId;
  final int employeeId;
  final int outletId;

  ClearWeighingDraftParams({
    required this.orderId,
    required this.employeeId,
    required this.outletId,
  });
}

class ClearWeighingDraftUsecase {
  final OrderRepository _repository;

  ClearWeighingDraftUsecase(this._repository);

  Future<Result<void>> call(ClearWeighingDraftParams params) async {
    return await _repository.clearWeighingDraft(
      orderId: params.orderId,
      employeeId: params.employeeId,
      outletId: params.outletId,
    );
  }
}
