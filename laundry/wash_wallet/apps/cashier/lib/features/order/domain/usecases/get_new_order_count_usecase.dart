import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../repositories/order_repository.dart';

class GetNewOrderCountUsecase {
  final OrderRepository _repository;

  GetNewOrderCountUsecase(this._repository);

  Future<Result<int>> call() {
    return _repository.getNewOrderCount();
  }
}
