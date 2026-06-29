import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_repository.dart';

class PayOrderParams {
  final int orderId;
  final String paymentMethod;

  PayOrderParams({
    required this.orderId,
    required this.paymentMethod,
  });
}

class PayOrderUseCase {
  final OrderRepository repository;

  PayOrderUseCase(this.repository);

  Future<Result<Order>> call(PayOrderParams params) {
    return repository.pay(
      orderId: params.orderId,
      paymentMethod: params.paymentMethod,
    );
  }
}
