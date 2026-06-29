import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_item_repository.dart';

class GetByIdUsecase {
  final OrderItemRepository _repository;

  GetByIdUsecase(this._repository);

  Future<Result<OrderItem>> call(int id) async {
    return await _repository.getById(id);
  }
}
