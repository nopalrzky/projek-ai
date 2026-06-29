import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_repository.dart';

class RejectParams {
  final int orderId;
  final String? reason;

  RejectParams({
    required this.orderId,
    this.reason,
  });
}

class RejectUsecase {
  final OrderRepository _repository;

  RejectUsecase(this._repository);

  Future<Result<Order>> call(RejectParams params, {required String clientRequestId}) {
    return _repository.reject(
      id: params.orderId,
      reason: params.reason,
      clientRequestId: clientRequestId,
    );
  }
}
