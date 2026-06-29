import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/expense_repository.dart';

class GetByIdUsecase {
  final ExpenseRepository _repository;

  GetByIdUsecase(this._repository);

  Future<Result<Expense>> call(int id) async {
    return await _repository.getById(id);
  }
}
