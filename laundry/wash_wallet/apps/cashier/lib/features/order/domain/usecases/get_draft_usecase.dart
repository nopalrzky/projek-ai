import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_repository.dart';

class GetDraftParams {
  final int customerId;
  final int outletId;
  final int employeeId;

  GetDraftParams({
    required this.customerId,
    required this.outletId,
    required this.employeeId,
  });
}

class GetDraftUsecase {
  final OrderRepository _repository;

  GetDraftUsecase(this._repository);

  Future<Result<OrderDraft?>> call(GetDraftParams params) async {
    return await _repository.getDraft(
      customerId: params.customerId,
      outletId: params.outletId,
      employeeId: params.employeeId,
    );
  }
}
