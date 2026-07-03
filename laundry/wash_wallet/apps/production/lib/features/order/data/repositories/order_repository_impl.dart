import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../../domain/repositories/order_repository.dart';
import '../datasources/order_remote_datasource.dart';

class OrderRepositoryImpl implements OrderRepository {
  final OrderRemoteDatasource _remoteDatasource;

  OrderRepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<PaginatedData<Order>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    String? paymentStatus,
    int? outletId,
    List<int>? outletIds,
    int? customerId,
    int? employeeId,
    String? orderDateFrom,
    String? orderDateTo,
    String? estimatedCompletionFrom,
    String? estimatedCompletionTo,
    double? totalAmountMin,
    double? totalAmountMax,
    String? pickupScheduleFrom,
    String? pickupScheduleTo,
    String? forCourierPickupDate,
    String sortBy = 'orderDate',
    String sortDirection = 'desc',
  }) async {
    try {
      final models = await _remoteDatasource.getAll(
        page: page,
        perPage: perPage,
        search: search,
        status: status,
        paymentStatus: paymentStatus,
        outletId: outletId,
        outletIds: outletIds,
        customerId: customerId,
        employeeId: employeeId,
        orderDateFrom: orderDateFrom,
        orderDateTo: orderDateTo,
        estimatedCompletionFrom: estimatedCompletionFrom,
        estimatedCompletionTo: estimatedCompletionTo,
        totalAmountMin: totalAmountMin,
        totalAmountMax: totalAmountMax,
        pickupScheduleFrom: pickupScheduleFrom,
        pickupScheduleTo: pickupScheduleTo,
        forCourierPickupDate: forCourierPickupDate,
        sortBy: sortBy,
        sortDirection: sortDirection,
      );
      return Result.success(PaginatedData<Order>(
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
        ServerFailure(message: 'Failed to fetch orders: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<Order>> getById(int id) async {
    try {
      final model = await _remoteDatasource.getById(id);
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Failed to fetch order detail: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<Order>> start({required int orderId, int? employeeId}) async {
    try {
      final model = await _remoteDatasource.start(
        orderId: orderId,
        employeeId: employeeId,
      );
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Failed to start order: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<Order>> complete(int id) async {
    try {
      final model = await _remoteDatasource.complete(id);
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Failed to complete order: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<Order>> pickup(int id) async {
    try {
      final model = await _remoteDatasource.pickup(id);
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Failed to pickup order: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<Order>> confirmPickup(int id, String photoPath) async {
    try {
      final model = await _remoteDatasource.confirmPickup(id, photoPath);
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Failed to confirm pickup: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<Order>> confirmArrived(int id, String? photoPath) async {
    try {
      final model = await _remoteDatasource.confirmArrived(id, photoPath);
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Failed to confirm arrival: ${e.toString()}'),
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
