import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_item_repository.dart';

class CompleteUsecase {
  final OrderItemRepository _repository;

  CompleteUsecase(this._repository);

  Future<Result<OrderItem>> call({required int id, String? notes}) async {
    return await _repository.complete(id: id, notes: notes);
  }
}
