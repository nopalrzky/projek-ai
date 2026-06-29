import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class ExpenseRepository {
  Future<Result<List<Expense>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    int? outletId,
    int? employeeId,
    int? expenseAccountId,
    int? sourceAccountId,
    String? startDate,
    String? endDate,
    double? minAmount,
    double? maxAmount,
    bool? hasAttachment,
    String sortBy = 'date',
    String sortDirection = 'desc',
  });

  Future<Result<Expense>> getById(int id);

  Future<Result<Expense>> store({
    required int outletId,
    required int expenseAccountId,
    int? sourceAccountId,
    required double amount,
    required String date,
    String? description,
    String? attachmentPath,
  });

  Future<Result<Expense>> update({
    required int id,
    required int outletId,
    required int expenseAccountId,
    int? sourceAccountId,
    required double amount,
    required String date,
    String? description,
    String? attachmentPath,
    bool removeAttachment = false,
  });
}
