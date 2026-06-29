import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_repository.dart';
import '../entities/create_order_params.dart';

class StoreUsecase {
  final OrderRepository _repository;

  StoreUsecase(this._repository);

  Future<Result<Order>> call(CreateOrderParams params) {
    return _repository.store(params);
  }
}
