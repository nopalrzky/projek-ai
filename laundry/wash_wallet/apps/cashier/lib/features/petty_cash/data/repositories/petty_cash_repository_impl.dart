import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/repositories/petty_cash_repository.dart';
import '../datasources/petty_cash_remote_datasource.dart';

class PettyCashRepositoryImpl implements PettyCashRepository {
  final PettyCashRemoteDatasource _remoteDatasource;

  PettyCashRepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<List<PettyCash>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    int? outletId,
    int? cashierId,
    int? ownerId,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  }) async {
    try {
      final models = await _remoteDatasource.getAll(
        page: page,
        perPage: perPage,
        search: search,
        status: status,
        outletId: outletId,
        cashierId: cashierId,
        ownerId: ownerId,
        sortBy: sortBy,
        sortDirection: sortDirection,
      );

      return Result.success(models.map((e) => e.toEntity()).toList());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<PettyCash>> getById(int id) async {
    try {
      final model = await _remoteDatasource.getById(id);
      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<PettyCash>> store({
    required double amount,
    required String description,
    required String requestDate,
  }) async {
    try {
      final model = await _remoteDatasource.store(
        amount: amount,
        description: description,
        requestDate: requestDate,
      );

      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<PettyCash>> update({
    required int id,
    double? amount,
    String? description,
    String? requestDate,
  }) async {
    try {
      final model = await _remoteDatasource.update(
        id: id,
        amount: amount,
        description: description,
        requestDate: requestDate,
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
