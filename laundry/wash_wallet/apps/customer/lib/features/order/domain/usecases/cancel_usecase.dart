import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_repository.dart';

class CancelUsecase {
  final OrderRepository _repository;

  CancelUsecase(this._repository);

  Future<Result<Order>> call(int orderId) {
    return _repository.cancel(orderId);
  }
}
