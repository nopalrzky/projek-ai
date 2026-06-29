import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_item_repository.dart';

class StartUsecase {
  final OrderItemRepository _repository;

  StartUsecase(this._repository);

  Future<Result<OrderItem>> call(int id) async {
    return await _repository.start(id);
  }
}
