import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../../domain/repositories/order_item_repository.dart';
import '../datasources/order_item_remote_datasource.dart';

class OrderItemRepositoryImpl implements OrderItemRepository {
  final OrderItemRemoteDataSource _remoteDatasource;

  OrderItemRepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<PaginatedData<OrderItem>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    int? orderId,
    int? laundryServiceId,
    int? customerId,
    String? startedAtFrom,
    String? startedAtTo,
    String? completedAtFrom,
    String? completedAtTo,
    String? createdAtFrom,
    String? createdAtTo,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  }) async {
    try {
      final models = await _remoteDatasource.getAll(
        page: page,
        perPage: perPage,
        search: search,
        status: status,
        orderId: orderId,
        laundryServiceId: laundryServiceId,
        customerId: customerId,
        startedAtFrom: startedAtFrom,
        startedAtTo: startedAtTo,
        completedAtFrom: completedAtFrom,
        completedAtTo: completedAtTo,
        createdAtFrom: createdAtFrom,
        createdAtTo: createdAtTo,
        sortBy: sortBy,
        sortDirection: sortDirection,
      );
      return Result.success(PaginatedData<OrderItem>(
        items: models.items.map((e) => e.toEntity()).toList(),
        currentPage: models.currentPage,
        lastPage: models.lastPage,
        perPage: models.perPage,
        total: models.total,
        from: models.from,
        to: models.to,
      ));
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Failed to fetch order items: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<OrderItem>> getById(int id) async {
    try {
      final model = await _remoteDatasource.getById(id);
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(
          message: 'Failed to fetch order item detail: ${e.toString()}',
        ),
      );
    }
  }

  @override
  Future<Result<OrderItem>> start(int id) async {
    try {
      final model = await _remoteDatasource.start(id);
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Failed to start order item: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<OrderItem>> complete({required int id, String? notes}) async {
    try {
      final model = await _remoteDatasource.complete(id: id, notes: notes);
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(
          message: 'Failed to complete order item: ${e.toString()}',
        ),
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
