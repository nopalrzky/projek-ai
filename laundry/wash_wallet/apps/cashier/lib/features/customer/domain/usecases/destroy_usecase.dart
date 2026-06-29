import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../repositories/customer_repository.dart';

class DestroyUsecase {
  final CustomerRepository _repository;

  DestroyUsecase(this._repository);

  Future<Result<void>> call(int id) async {
    return await _repository.destroy(id);
  }
}
