import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/expense_repository.dart';

class StoreParams {
  final int outletId;
  final int expenseAccountId;
  final int? sourceAccountId;
  final double amount;
  final String date;
  final String? description;
  final String? attachmentPath;

  StoreParams({
    required this.outletId,
    required this.expenseAccountId,
    this.sourceAccountId,
    required this.amount,
    required this.date,
    this.description,
    this.attachmentPath,
  });
}

class StoreUsecase {
  final ExpenseRepository _repository;

  StoreUsecase(this._repository);

  Future<Result<Expense>> call(StoreParams params) async {
    return await _repository.store(
      outletId: params.outletId,
      expenseAccountId: params.expenseAccountId,
      sourceAccountId: params.sourceAccountId,
      amount: params.amount,
      date: params.date,
      description: params.description,
      attachmentPath: params.attachmentPath,
    );
  }
}
