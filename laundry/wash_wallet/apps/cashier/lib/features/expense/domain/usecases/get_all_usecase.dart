import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/expense_repository.dart';

class GetAllParams {
  final int page;
  final int perPage;
  final String? search;
  final String? status;
  final int? outletId;
  final int? employeeId;
  final int? expenseAccountId;
  final int? sourceAccountId;
  final String? startDate;
  final String? endDate;
  final double? minAmount;
  final double? maxAmount;
  final bool? hasAttachment;
  final String sortBy;
  final String sortDirection;

  const GetAllParams({
    this.page = 1,
    this.perPage = 15,
    this.search,
    this.status,
    this.outletId,
    this.employeeId,
    this.expenseAccountId,
    this.sourceAccountId,
    this.startDate,
    this.endDate,
    this.minAmount,
    this.maxAmount,
    this.hasAttachment,
    this.sortBy = 'date',
    this.sortDirection = 'desc',
  });
}

class GetAllUsecase {
  final ExpenseRepository _repository;

  GetAllUsecase(this._repository);

  Future<Result<PaginatedData<Expense>>> call(GetAllParams params) async {
    return await _repository.getAll(
      page: params.page,
      perPage: params.perPage,
      search: params.search,
      status: params.status,
      outletId: params.outletId,
      employeeId: params.employeeId,
      expenseAccountId: params.expenseAccountId,
      sourceAccountId: params.sourceAccountId,
      startDate: params.startDate,
      endDate: params.endDate,
      minAmount: params.minAmount,
      maxAmount: params.maxAmount,
      hasAttachment: params.hasAttachment,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    );
  }
}

typedef GetExpensesParams = GetAllParams;
typedef GetExpensesUsecase = GetAllUsecase;
