import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/repositories/employee_repository.dart';
import '../datasources/employee_remote_datasource.dart';

class EmployeeRepositoryImpl implements EmployeeRepository {
  final EmployeeRemoteDatasource _remoteDatasource;

  EmployeeRepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<List<Employee>>> getAll({int? outletId}) async {
    try {
      final models = await _remoteDatasource.getAll(outletId: outletId);
      return Result.success(models.map((model) => model.toEntity()).toList());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<Employee>> getById(int id) async {
    try {
      final model = await _remoteDatasource.getById(id);
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<Employee>> update({
    required int id,
    required String name,
    required String startDate,
    required int cutoffDays,
    bool? isActive,
    String? phone,
    String? address,
    String? gender,
    String? avatarPath,
    List<int>? positionIds,
    List<Map<String, dynamic>>? employeeSalaries,
    List<Map<String, dynamic>>? employeeProcessCommissions,
  }) async {
    try {
      final model = await _remoteDatasource.update(
        id: id,
        name: name,
        startDate: startDate,
        cutoffDays: cutoffDays,
        isActive: isActive,
        phone: phone,
        address: address,
        gender: gender,
        avatarPath: avatarPath,
        positionIds: positionIds,
        employeeSalaries: employeeSalaries,
        employeeProcessCommissions: employeeProcessCommissions,
      );
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
