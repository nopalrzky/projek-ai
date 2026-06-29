import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../repositories/customer_repository.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class GetByIdUsecase {
  final CustomerRepository _repository;

  GetByIdUsecase(this._repository);

  Future<Result<Customer>> call(int id) async {
    return await _repository.getById(id);
  }
}
