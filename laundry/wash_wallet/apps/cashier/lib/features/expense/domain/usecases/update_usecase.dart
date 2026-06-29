import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/expense_repository.dart';

class UpdateParams {
  final int id;
  final int outletId;
  final int expenseAccountId;
  final int? sourceAccountId;
  final double amount;
  final String date;
  final String? description;
  final String? attachmentPath;
  final bool removeAttachment;

  UpdateParams({
    required this.id,
    required this.outletId,
    required this.expenseAccountId,
    this.sourceAccountId,
    required this.amount,
    required this.date,
    this.description,
    this.attachmentPath,
    this.removeAttachment = false,
  });
}

class UpdateUsecase {
  final ExpenseRepository _repository;

  UpdateUsecase(this._repository);

  Future<Result<Expense>> call(UpdateParams params) async {
    return await _repository.update(
      id: params.id,
      outletId: params.outletId,
      expenseAccountId: params.expenseAccountId,
      sourceAccountId: params.sourceAccountId,
      amount: params.amount,
      date: params.date,
      description: params.description,
      attachmentPath: params.attachmentPath,
      removeAttachment: params.removeAttachment,
    );
  }
}
