import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/repositories/membership_plan_repository.dart';
import '../datasources/membership_plan_remote_datasource.dart';

class MembershipPlanRepositoryImpl implements MembershipPlanRepository {
  final MembershipPlanRemoteDatasource _remoteDatasource;

  MembershipPlanRepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<PaginatedData<MembershipPlan>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? outletId,
    bool? isActive,
    double? minPrice,
    double? maxPrice,
    int? minDurationDays,
    int? maxDurationDays,
    double? minDiscountPercentage,
    double? maxDiscountPercentage,
    String sortBy = 'createdAt',
    String sortOrder = 'desc',
  }) async {
    try {
      final paginatedData = await _remoteDatasource.getAll(
        page: page,
        perPage: perPage,
        search: search,
        outletId: outletId,
        isActive: isActive,
        minPrice: minPrice,
        maxPrice: maxPrice,
        minDurationDays: minDurationDays,
        maxDurationDays: maxDurationDays,
        minDiscountPercentage: minDiscountPercentage,
        maxDiscountPercentage: maxDiscountPercentage,
        sortBy: sortBy,
        sortOrder: sortOrder,
      );
      return Result.success(PaginatedData<MembershipPlan>(
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
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<MembershipPlan>> getById(int membershipPlanId) async {
    try {
      final model = await _remoteDatasource.getById(membershipPlanId);
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }

  Failure _mapApiExceptionToFailure(ApiException exception) {
    final statusCode = exception.statusCode;

    if (statusCode == null) {
      return ServerFailure(message: exception.message);
    }

    switch (statusCode) {
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
          statusCode: statusCode,
        );
    }
  }
}
