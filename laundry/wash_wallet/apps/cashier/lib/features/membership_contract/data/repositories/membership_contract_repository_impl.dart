import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/repositories/membership_contract_repository.dart';
import '../datasources/membership_contract_remote_datasource.dart';

class MembershipContractRepositoryImpl implements MembershipContractRepository {
  final MembershipContractRemoteDatasource _remoteDatasource;

  MembershipContractRepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<PaginatedData<MembershipContract>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? customerId,
    int? outletId,
    int? membershipPlanId,
    String? status,
    double? totalPaidMin,
    double? totalPaidMax,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  }) async {
    try {
      final paginatedData = await _remoteDatasource.getAll(
        page: page,
        perPage: perPage,
        search: search,
        customerId: customerId,
        outletId: outletId,
        membershipPlanId: membershipPlanId,
        status: status,
        totalPaidMin: totalPaidMin,
        totalPaidMax: totalPaidMax,
        sortBy: sortBy,
        sortDirection: sortDirection,
      );

      return Result.success(PaginatedData<MembershipContract>(
        items: paginatedData.items.map((model) => model.toEntity()).toList(),
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
  Future<Result<MembershipContract>> getById(int id) async {
    try {
      final result = await _remoteDatasource.getById(id);
      return Result.success(result.toEntity());
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
