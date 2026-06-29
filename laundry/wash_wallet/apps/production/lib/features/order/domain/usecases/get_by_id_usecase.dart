import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_repository.dart';

class GetByIdUsecase {
  final OrderRepository _repository;

  GetByIdUsecase(this._repository);

  Future<Result<Order>> call(int id) async {
    return await _repository.getById(id);
  }
}
