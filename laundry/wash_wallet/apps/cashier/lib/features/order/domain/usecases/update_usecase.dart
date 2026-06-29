import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_repository.dart';

class UpdateParams {
  final int id;
  final Map<String, dynamic> data;

  UpdateParams({required this.id, required this.data});
}

class UpdateUsecase {
  final OrderRepository _repository;

  UpdateUsecase(this._repository);

  Future<Result<Order>> call(UpdateParams params) async {
    return await _repository.update(id: params.id, data: params.data);
  }
}
