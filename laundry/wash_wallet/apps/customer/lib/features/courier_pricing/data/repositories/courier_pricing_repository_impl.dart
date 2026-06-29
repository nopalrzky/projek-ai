import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../domain/entities/courier_pricing_result.dart';
import '../../domain/entities/courier_setting_summary.dart';
import '../../domain/repositories/courier_pricing_repository.dart';
import '../datasources/courier_pricing_remote_datasource.dart';

class CourierPricingRepositoryImpl implements CourierPricingRepository {
  final CourierPricingRemoteDatasource _remoteDatasource;

  const CourierPricingRepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<CourierPricingResult>> calculateFee({
    required int outletId,
    required double latitude,
    required double longitude,
    int? customerId,
    double? orderTotal,
    int? addressId,
  }) async {
    try {
      final result = await _remoteDatasource.calculateFee(
        outletId: outletId,
        latitude: latitude,
        longitude: longitude,
        customerId: customerId,
        orderTotal: orderTotal,
        customerAddressId: addressId,
      );
      return Result.success(result);
    } on Exception catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<CourierSettingSummary>> getSettingSummary(int outletId) async {
    try {
      final result = await _remoteDatasource.getSettingSummary(outletId);
      return Result.success(result);
    } on Exception catch (e) {
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
