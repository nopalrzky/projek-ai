import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/repositories/deposit_repository.dart';
import '../datasources/deposit_remote_datasource.dart';

class DepositRepositoryImpl implements DepositRepository {
  final DepositRemoteDatasource _remoteDatasource;

  DepositRepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<PaginatedData<Deposit>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? ownerId,
    String? status,
    int? outletId,
    int? cashierId,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  }) async {
    try {
      final paginatedData = await _remoteDatasource.getAll(
        page: page,
        perPage: perPage,
        search: search,
        ownerId: ownerId,
        status: status,
        outletId: outletId,
        cashierId: cashierId,
        sortBy: sortBy,
        sortDirection: sortDirection,
      );

      return Result.success(PaginatedData<Deposit>(
        items: paginatedData.items.map((e) => e.toEntity()).toList(),
        currentPage: paginatedData.currentPage,
        lastPage: paginatedData.lastPage,
        perPage: paginatedData.perPage,
        total: paginatedData.total,
        from: paginatedData.from,
        to: paginatedData.to,
      ));
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<Deposit>> getById(int id) async {
    try {
      final model = await _remoteDatasource.getById(id);
      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<Deposit>> store({
    required int destinationAccountId,
    required double amount,
    String? notes,
    String? attachmentPath,
  }) async {
    try {
      final model = await _remoteDatasource.store(
        destinationAccountId: destinationAccountId,
        amount: amount,
        notes: notes,
        attachmentPath: attachmentPath,
      );

      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<Deposit>> update({
    required int id,
    int? destinationAccountId,
    double? amount,
    String? notes,
    String? attachmentPath,
  }) async {
    try {
      final model = await _remoteDatasource.update(
        id: id,
        destinationAccountId: destinationAccountId,
        amount: amount,
        notes: notes,
        attachmentPath: attachmentPath,
      );

      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  Failure _mapExceptionToFailure(Object exception) {
    if (exception is NetworkException) {
      return NetworkFailure(message: exception.message);
    }

    if (exception is ApiException) {
      switch (exception.statusCode) {
        case 400:
        case 422:
          return ValidationFailure(
            message: exception.message,
            errors: exception.errors,
          );
        case 401:
        case 403:
          return AuthFailure(message: exception.message);
        case 404:
          return ServerFailure(message: exception.message, statusCode: 404);
        default:
          return ServerFailure(
            message: exception.message,
            statusCode: exception.statusCode,
          );
      }
    }

    return ServerFailure(message: exception.toString());
  }
}
