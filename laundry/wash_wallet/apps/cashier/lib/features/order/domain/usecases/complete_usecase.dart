import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_repository.dart';

class CompleteUsecase {
  final OrderRepository _repository;

  CompleteUsecase(this._repository);

  Future<Result<Order>> call(int orderId, {required String clientRequestId}) {
    return _repository.complete(id: orderId, clientRequestId: clientRequestId);
  }
}
