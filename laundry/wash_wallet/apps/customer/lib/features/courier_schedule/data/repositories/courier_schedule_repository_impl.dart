import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../domain/entities/courier_schedule.dart';
import '../../domain/repositories/courier_schedule_repository.dart';
import '../datasources/courier_schedule_remote_datasource.dart';

class CourierScheduleRepositoryImpl implements CourierScheduleRepository {
  final CourierScheduleRemoteDatasource remoteDatasource;

  CourierScheduleRepositoryImpl(this.remoteDatasource);

  @override
  Future<Result<CourierScheduleData>> getAll({
    required int outletId,
    String? dayOfWeek,
    String? type,
    String? date,
  }) async {
    try {
      final model = await remoteDatasource.getAll(
        outletId: outletId,
        dayOfWeek: dayOfWeek,
        type: type,
        date: date,
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
