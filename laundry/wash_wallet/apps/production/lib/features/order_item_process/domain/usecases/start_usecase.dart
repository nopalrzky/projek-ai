import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_item_process_repository.dart';

class StartUsecase {
  final OrderItemProcessRepository _repository;

  StartUsecase(this._repository);

  Future<Result<OrderItemProcess>> call(int id) async {
    return await _repository.start(id);
  }
}
