import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_repository.dart';

class StartUsecase {
  final OrderRepository _repository;

  StartUsecase(this._repository);

  Future<Result<Order>> call(int orderId, {required String clientRequestId}) {
    return _repository.start(id: orderId, clientRequestId: clientRequestId);
  }
}
