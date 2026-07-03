import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../domain/repositories/customer_repository.dart';
import '../datasources/customer_remote_datasource.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class CustomerRepositoryImpl
    with NetworkRetryMixin
    implements CustomerRepository {
  final CustomerRemoteDatasource _remoteDatasource;

  CustomerRepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<PaginatedData<Customer>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? outletId,
    String? phone,
    String? gender,
    bool? isActive,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  }) async {
    try {
      final paginatedData = await withRetry(
        () => _remoteDatasource.getAll(
          page: page,
          perPage: perPage,
          search: search,
          outletId: outletId,
          phone: phone,
          gender: gender,
          isActive: isActive,
          sortBy: sortBy,
          sortDirection: sortDirection,
        ),
      );
      return Result.success(PaginatedData<Customer>(
        items: paginatedData.items.map((m) => m.toEntity()).toList(),
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
  Future<Result<Customer>> getById(int id) async {
    try {
      final model = await _remoteDatasource.getById(id);
      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<Customer>> store({
    required int outletId,
    required String name,
    String? email,
    String? phone,
    String? address,
    String? gender,
    String? dateOfBirth,
  }) async {
    try {
      final model = await _remoteDatasource.store(
        outletId: outletId,
        name: name,
        email: email,
        phone: phone,
        address: address,
        gender: gender,
        dateOfBirth: dateOfBirth,
      );
      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<Customer>> update({
    required int id,
    String? name,
    String? email,
    String? phone,
    String? address,
    String? gender,
    String? dateOfBirth,
    bool? isActive,
    int? outletId,
  }) async {
    try {
      final model = await _remoteDatasource.update(
        id: id,
        name: name,
        email: email,
        phone: phone,
        address: address,
        gender: gender,
        dateOfBirth: dateOfBirth,
        isActive: isActive,
        outletId: outletId,
      );
      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<void>> destroy(int id) async {
    try {
      await _remoteDatasource.destroy(id);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<Customer>> storeMembershipContract({
    required int customerId,
    required int membershipPlanId,
    String? startAt,
    double? totalPaid,
  }) async {
    try {
      final model = await _remoteDatasource.storeMembershipContract(
        customerId: customerId,
        membershipPlanId: membershipPlanId,
        startAt: startAt,
        totalPaid: totalPaid,
      );
      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<Customer>> storeCustomerSubscription({
    required int customerId,
    required int servicePackageId,
    required double pricePaid,
    String? purchaseDate,
    String? note,
  }) async {
    try {
      final model = await _remoteDatasource.storeCustomerSubscription(
        customerId: customerId,
        servicePackageId: servicePackageId,
        pricePaid: pricePaid,
        purchaseDate: purchaseDate,
        note: note,
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
