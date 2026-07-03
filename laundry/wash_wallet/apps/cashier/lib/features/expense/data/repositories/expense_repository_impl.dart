import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/repositories/expense_repository.dart';
import '../datasources/expense_remote_datasource.dart';

class ExpenseRepositoryImpl implements ExpenseRepository {
  final ExpenseRemoteDatasource _remoteDatasource;

  ExpenseRepositoryImpl({required ExpenseRemoteDatasource remoteDatasource})
    : _remoteDatasource = remoteDatasource;

  @override
  Future<Result<PaginatedData<Expense>>> getAll({
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
  }) async {
    try {
      final paginatedData = await _remoteDatasource.getAll(
        page: page,
        perPage: perPage,
        search: search,
        status: status,
        outletId: outletId,
        employeeId: employeeId,
        expenseAccountId: expenseAccountId,
        sourceAccountId: sourceAccountId,
        startDate: startDate,
        endDate: endDate,
        minAmount: minAmount,
        maxAmount: maxAmount,
        hasAttachment: hasAttachment,
        sortBy: sortBy,
        sortDirection: sortDirection,
      );
      return Result.success(PaginatedData<Expense>(
        items: paginatedData.items
            .whereType<ExpenseModel>()
            .map((model) => model.toEntity())
            .toList(),
        currentPage: paginatedData.currentPage,
        lastPage: paginatedData.lastPage,
        perPage: paginatedData.perPage,
        total: paginatedData.total,
        from: paginatedData.from,
        to: paginatedData.to,
      ));
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Failed to load expenses: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<Expense>> getById(int id) async {
    try {
      final expenseModel = await _remoteDatasource.getById(id);
      return Result.success(expenseModel.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Failed to load expense: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<Expense>> store({
    required int outletId,
    required int expenseAccountId,
    int? sourceAccountId,
    required double amount,
    required String date,
    String? description,
    String? attachmentPath,
  }) async {
    try {
      final expenseModel = await _remoteDatasource.store(
        outletId: outletId,
        expenseAccountId: expenseAccountId,
        sourceAccountId: sourceAccountId,
        amount: amount,
        date: date,
        description: description,
        attachmentPath: attachmentPath,
      );
      return Result.success(expenseModel.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Failed to create expense: ${e.toString()}'),
      );
    }
  }

  @override
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
  }) async {
    try {
      final expenseModel = await _remoteDatasource.update(
        id: id,
        outletId: outletId,
        expenseAccountId: expenseAccountId,
        sourceAccountId: sourceAccountId,
        amount: amount,
        date: date,
        description: description,
        attachmentPath: attachmentPath,
        removeAttachment: removeAttachment,
      );
      return Result.success(expenseModel.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Failed to update expense: ${e.toString()}'),
      );
    }
  }

  Failure _mapApiExceptionToFailure(ApiException exception) {
    final statusCode = exception.statusCode;

    if (statusCode == null) {
      return ServerFailure(message: exception.message);
    }

    switch (statusCode) {
      case 400:
        return ValidationFailure(
          message: exception.message,
          errors: exception.errors,
        );
      case 401:
        return AuthFailure(message: exception.message);
      case 403:
        return AuthFailure(message: exception.message);
      case 404:
        return ServerFailure(
          message: exception.message,
          statusCode: statusCode,
        );
      case 422:
        return ValidationFailure(
          message: exception.message,
          errors: exception.errors,
        );
      case 500:
      case 502:
      case 503:
        return ServerFailure(
          message: exception.message,
          statusCode: statusCode,
        );
      default:
        return ServerFailure(
          message: exception.message,
          statusCode: statusCode,
        );
    }
  }
}
