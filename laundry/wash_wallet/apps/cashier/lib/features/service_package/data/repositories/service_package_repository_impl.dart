import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/repositories/service_package_repository.dart';
import '../datasources/service_package_remote_datasource.dart';

class ServicePackageRepositoryImpl implements ServicePackageRepository {
  final ServicePackageRemoteDatasource _remoteDatasource;

  ServicePackageRepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<List<ServicePackage>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? outletId,
    bool? isActive,
    double? minPrice,
    double? maxPrice,
    int? minValidityDays,
    int? maxValidityDays,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  }) async {
    try {
      final models = await _remoteDatasource.getAll(
        page: page,
        perPage: perPage,
        search: search,
        outletId: outletId,
        isActive: isActive,
        minPrice: minPrice,
        maxPrice: maxPrice,
        minValidityDays: minValidityDays,
        maxValidityDays: maxValidityDays,
        sortBy: sortBy,
        sortDirection: sortDirection,
      );

      final entities = models.map((model) => model.toEntity()).toList();
      return Result.success(entities);
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'An unexpected error occurred: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<ServicePackage>> getById({
    required int servicePackageId,
  }) async {
    try {
      final model = await _remoteDatasource.getById(
        servicePackageId: servicePackageId,
      );

      return Result.success(model.toEntity());
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'An unexpected error occurred: ${e.toString()}'),
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
