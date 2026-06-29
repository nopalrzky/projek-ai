import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../../domain/repositories/outlet_repository.dart';
import '../datasources/outlet_remote_datasource.dart';

class OutletRepositoryImpl implements OutletRepository {
  final OutletRemoteDatasource _remoteDatasource;

  OutletRepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<List<Outlet>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    bool? isExposure,
    String? status,
    int? provinceId,
    int? cityId,
    int? districtId,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
    double? latitude,
    double? longitude,
  }) async {
    try {
      final models = await _remoteDatasource.getAll(
        page: page,
        perPage: perPage,
        search: search,
        isExposure: isExposure,
        status: status,
        provinceId: provinceId,
        cityId: cityId,
        districtId: districtId,
        sortBy: sortBy,
        sortDirection: sortDirection,
        latitude: latitude,
        longitude: longitude,
      );

      return Result.success(models.map((m) => m.toEntity()).toList());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<List<Outlet>>> getNearby({
    required double latitude,
    required double longitude,
    double radius = 10.0,
    int page = 1,
    int perPage = 15,
    String? search,
  }) async {
    try {
      final models = await _remoteDatasource.getNearby(
        search: search,
        latitude: latitude,
        longitude: longitude,
        radius: radius,
        page: page,
        perPage: perPage,
      );

      return Result.success(models.map((m) => m.toEntity()).toList());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<Outlet>> getById({
    required int id,
    double? latitude,
    double? longitude,
  }) async {
    try {
      final model = await _remoteDatasource.getById(
        id: id,
        latitude: latitude,
        longitude: longitude,
      );
      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<List<OrderReview>>> getReviews({
    required int outletId,
    int page = 1,
    int perPage = 10,
  }) async {
    try {
      final models = await _remoteDatasource.getReviews(
        outletId: outletId,
        page: page,
        perPage: perPage,
      );
      return Result.success(models.map((m) => m.toEntity()).toList());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<OutletReviewSummary>> getReviewSummary({
    required int outletId,
  }) async {
    try {
      final model = await _remoteDatasource.getReviewSummary(
        outletId: outletId,
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
