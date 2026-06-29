import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_repository.dart';

class ConfirmArrivedUsecase {
  final OrderRepository _repository;

  ConfirmArrivedUsecase(this._repository);

  Future<Result<Order>> call({required int id, String? photoPath}) async {
    return await _repository.confirmArrived(id, photoPath);
  }
}
