import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../domain/repositories/customer_subscription_repository.dart';
import '../datasources/customer_subscription_remote_datasource.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class CustomerSubscriptionRepositoryImpl
    implements CustomerSubscriptionRepository {
  final CustomerSubscriptionRemoteDatasource _remoteDatasource;

  CustomerSubscriptionRepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<List<CustomerSubscription>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    int? outletId,
    int? customerId,
    int? servicePackageId,
    String? minPurchaseDate,
    String? maxPurchaseDate,
    String? expiryAtFrom,
    String? expiryAtTo,
    double? minPricePaid,
    double? maxPricePaid,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  }) async {
    try {
      final result = await _remoteDatasource.getAll(
        page: page,
        perPage: perPage,
        search: search,
        status: status,
        customerId: customerId,
        servicePackageId: servicePackageId,
        minPurchaseDate: minPurchaseDate,
        maxPurchaseDate: maxPurchaseDate,
        expiryAtFrom: expiryAtFrom,
        expiryAtTo: expiryAtTo,
        minPricePaid: minPricePaid,
        maxPricePaid: maxPricePaid,
        sortBy: sortBy,
        sortDirection: sortDirection,
        outletId: outletId,
      );
      return Result.success(result.map((model) => model.toEntity()).toList());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<CustomerSubscription>> getById(int id) async {
    try {
      final result = await _remoteDatasource.getById(
        customerSubscriptionId: id,
      );
      return Result.success(result.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<CustomerSubscription>> store({
    required int customerId,
    required int servicePackageId,
    required double pricePaid,
    String? purchaseDate,
    String? note,
  }) async {
    try {
      final result = await _remoteDatasource.store(
        customerId: customerId,
        servicePackageId: servicePackageId,
        pricePaid: pricePaid,
        purchaseDate: purchaseDate,
        note: note,
      );
      return Result.success(result.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<CustomerSubscription>> update({
    required int id,
    String? status,
    String? note,
  }) async {
    try {
      final result = await _remoteDatasource.update(
        customerSubscriptionId: id,
        status: status,
        note: note,
      );
      return Result.success(result.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<void>> destroy(int id) async {
    try {
      await _remoteDatasource.destroy(
        customerSubscriptionId: id,
      );
      return const Result.success(null);
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<List<CustomerSubscription>>> getByCustomerId({
    required int customerId,
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  }) async {
    try {
      final result = await _remoteDatasource.getAll(
        customerId: customerId,
        page: page,
        perPage: perPage,
        search: search,
        status: status,
        sortBy: sortBy,
        sortDirection: sortDirection,
      );
      return Result.success(result.map((model) => model.toEntity()).toList());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<List<CustomerSubscription>>> getByOutletId({
    required int outletId,
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  }) async {
    try {
      final result = await _remoteDatasource.getAll(
        outletId: outletId,
        page: page,
        perPage: perPage,
        search: search,
        status: status,
        sortBy: sortBy,
        sortDirection: sortDirection,
      );
      return Result.success(result.map((model) => model.toEntity()).toList());
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

    return ServerFailure(
      message: 'An unexpected error occurred',
      statusCode: 500,
    );
  }
}
