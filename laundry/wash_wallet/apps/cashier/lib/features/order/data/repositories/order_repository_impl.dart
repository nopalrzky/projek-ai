import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../../domain/repositories/order_repository.dart';
import '../datasources/order_local_datasource.dart';
import '../datasources/order_remote_datasource.dart';

class OrderRepositoryImpl implements OrderRepository {
  final OrderRemoteDatasource _remoteDatasource;
  final OrderLocalDatasource _localDatasource;

  OrderRepositoryImpl(this._remoteDatasource, this._localDatasource);

  @override
  Future<Result<PaginatedData<Order>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    String? paymentStatus,
    int? outletId,
    int? customerId,
    int? employeeId,
    String? orderDateFrom,
    String? orderDateTo,
    String? estimatedCompletionFrom,
    String? estimatedCompletionTo,
    double? totalAmountMin,
    double? totalAmountMax,
    String sortBy = 'orderDate',
    String sortDirection = 'desc',
  }) async {
    try {
      final paginatedData = await _remoteDatasource.getAll(
        page: page,
        perPage: perPage,
        search: search,
        status: status,
        paymentStatus: paymentStatus,
        outletId: outletId,
        customerId: customerId,
        employeeId: employeeId,
        orderDateFrom: orderDateFrom,
        orderDateTo: orderDateTo,
        estimatedCompletionFrom: estimatedCompletionFrom,
        estimatedCompletionTo: estimatedCompletionTo,
        totalAmountMin: totalAmountMin,
        totalAmountMax: totalAmountMax,
        sortBy: sortBy,
        sortDirection: sortDirection,
      );
      return Result.success(PaginatedData<Order>(
        items: paginatedData.items.map((e) => e.toEntity()).toList(),
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
  Future<Result<Order>> store(Map<String, dynamic> data) async {
    try {
      final model = await _remoteDatasource.store(data);
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Failed to create order: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<Order>> update({
    required int id,
    required Map<String, dynamic> data,
  }) async {
    try {
      final model = await _remoteDatasource.update(id: id, data: data);
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Failed to update order: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<Order>> complete({
    required int id,
    required String clientRequestId,
  }) async {
    try {
      final model = await _remoteDatasource.complete(
        id: id,
        clientRequestId: clientRequestId,
      );
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
  Future<Result<Order>> accept({
    required int id,
    required String clientRequestId,
  }) async {
    try {
      final model = await _remoteDatasource.accept(
        id: id,
        clientRequestId: clientRequestId,
      );
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Failed to accept order: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<Order>> reject({
    required int id,
    String? reason,
    required String clientRequestId,
  }) async {
    try {
      final model = await _remoteDatasource.reject(
        id: id,
        reason: reason,
        clientRequestId: clientRequestId,
      );
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Failed to reject order: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<Order>> weigh({
    required int id,
    required Map<String, dynamic> data,
    String? photoPath,
  }) async {
    try {
      final model = await _remoteDatasource.weigh(
        id: id,
        data: data,
        photoPath: photoPath,
      );
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Failed to weigh order: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<Order>> start({
    required int id,
    required String clientRequestId,
  }) async {
    try {
      final model = await _remoteDatasource.start(
        id: id,
        clientRequestId: clientRequestId,
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
  Future<Result<int>> getNewOrderCount() async {
    try {
      final count = await _remoteDatasource.getNewOrderCount();
      return Result.success(count);
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(
          message: 'Failed to fetch new order count: ${e.toString()}',
        ),
      );
    }
  }

  @override
  Future<Result<void>> saveDraft(OrderDraft draft) async {
    try {
      final model = OrderDraftModel.fromEntity(draft);
      await _localDatasource.saveDraft(model);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(CacheFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<OrderDraft?>> getDraft({
    required int customerId,
    required int outletId,
    required int employeeId,
  }) async {
    try {
      final model = await _localDatasource.getDraft(
        customerId: customerId,
        outletId: outletId,
        employeeId: employeeId,
      );
      return Result.success(model?.toEntity());
    } catch (e) {
      return Result.failure(CacheFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<void>> clearDraft({
    required int customerId,
    required int outletId,
    required int employeeId,
  }) async {
    try {
      await _localDatasource.clearDraft(
        customerId: customerId,
        outletId: outletId,
        employeeId: employeeId,
      );
      return const Result.success(null);
    } catch (e) {
      return Result.failure(CacheFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<void>> saveWeighingDraft(WeighingDraft draft) async {
    try {
      final model = WeighingDraftModel.fromEntity(draft);
      await _localDatasource.saveWeighingDraft(model);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(CacheFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<WeighingDraft?>> getWeighingDraft({
    required int orderId,
    required int employeeId,
    required int outletId,
  }) async {
    try {
      final model = await _localDatasource.getWeighingDraft(
        orderId: orderId,
        employeeId: employeeId,
        outletId: outletId,
      );
      return Result.success(model?.toEntity());
    } catch (e) {
      return Result.failure(CacheFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<void>> clearWeighingDraft({
    required int orderId,
    required int employeeId,
    required int outletId,
  }) async {
    try {
      await _localDatasource.clearWeighingDraft(
        orderId: orderId,
        employeeId: employeeId,
        outletId: outletId,
      );
      return const Result.success(null);
    } catch (e) {
      return Result.failure(CacheFailure(message: e.toString()));
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
