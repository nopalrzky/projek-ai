import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_repository.dart';

class GetWeighingDraftParams {
  final int orderId;
  final int employeeId;
  final int outletId;

  GetWeighingDraftParams({
    required this.orderId,
    required this.employeeId,
    required this.outletId,
  });
}

class GetWeighingDraftUsecase {
  final OrderRepository _repository;

  GetWeighingDraftUsecase(this._repository);

  Future<Result<WeighingDraft?>> call(GetWeighingDraftParams params) async {
    return await _repository.getWeighingDraft(
      orderId: params.orderId,
      employeeId: params.employeeId,
      outletId: params.outletId,
    );
  }
}
