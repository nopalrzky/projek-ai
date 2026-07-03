import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../datasources/auth_local_datasource.dart';
import '../datasources/auth_remote_datasource.dart';
import '../datasources/remembered_employee_local_datasource.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDatasource _remoteDatasource;
  final AuthLocalDatasource _localDatasource;
  final RememberedEmployeeLocalDatasource _rememberedDatasource;

  AuthRepositoryImpl({
    required AuthRemoteDatasource remoteDatasource,
    required AuthLocalDatasource localDatasource,
    required RememberedEmployeeLocalDatasource rememberedDatasource,
  }) : _remoteDatasource = remoteDatasource,
       _localDatasource = localDatasource,
       _rememberedDatasource = rememberedDatasource;

  @override
  Future<Result<AuthEmployee>> login({
    required String username,
    required String password,
  }) async {
    try {
      final (token, employeeModel) = await _remoteDatasource.login(
        username: username,
        password: password,
      );

      await _localDatasource.saveToken(token);
      await _localDatasource.saveEmployee(employeeModel);

      return Result.success(employeeModel.toEntity());
    } on ApiException catch (e) {
      return Result.failure(AuthFailure(message: e.message));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Login failed: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<AuthEmployee>> getMe() async {
    try {
      final employeeModel = await _remoteDatasource.getMe();
      await _localDatasource.saveEmployee(employeeModel);
      return Result.success(employeeModel.toEntity());
    } on ApiException catch (e) {
      if (e.statusCode == 401 || e.statusCode == 403) {
        await _localDatasource.clearAll();
      }
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Failed to get user data: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<AuthEmployee>> checkAuthStatus() async {
    try {
      final token = await _localDatasource.getToken();

      if (token == null || token.isEmpty) {
        return const Result.failure(
          AuthFailure(message: 'No authentication token found. Please login.'),
        );
      }

      final result = await getMe();

      return await result.when(
        success: (employee) async => Result.success(employee),
        failure: (failure) async {
          if (failure is AuthFailure) {
            await _localDatasource.clearAll();
            return Result.failure(failure);
          }
          final localEmployeeModel = await _localDatasource.getEmployee();
          if (localEmployeeModel != null) {
            return Result.success(localEmployeeModel.toEntity());
          }
          return Result.failure(failure);
        },
      );
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Auth check failed: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<AuthEmployee>> setupPin({
    required String pin,
    required String pinConfirmation,
  }) async {
    try {
      final employeeModel = await _remoteDatasource.setupPin(
        pin: pin,
        pinConfirmation: pinConfirmation,
      );

      await _localDatasource.saveEmployee(employeeModel);

      return Result.success(employeeModel.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Setup PIN failed: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<AuthEmployee>> resetPin({
    required String currentPin,
    required String pin,
    required String pinConfirmation,
  }) async {
    try {
      final employeeModel = await _remoteDatasource.resetPin(
        currentPin: currentPin,
        pin: pin,
        pinConfirmation: pinConfirmation,
      );

      await _localDatasource.saveEmployee(employeeModel);

      return Result.success(employeeModel.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Reset PIN failed: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<AuthEmployee>> verifyPin({
    int? employeeId,
    String? username,
    required String pin,
  }) async {
    try {
      final (token, employeeModel) = await _remoteDatasource.verifyPin(
        employeeId: employeeId,
        username: username,
        pin: pin,
      );

      await _localDatasource.saveToken(token);
      await _localDatasource.saveEmployee(employeeModel);

      return Result.success(employeeModel.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Verify PIN failed: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<void>> logout() async {
    try {
      await _remoteDatasource.logout();
      await _localDatasource.clearAll();
      return const Result.success(null);
    } on ApiException catch (e) {
      await _localDatasource.clearAll();
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      await _localDatasource.clearAll();
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      await _localDatasource.clearAll();
      return Result.failure(
        ServerFailure(message: 'Logout failed: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<void>> saveRememberedAccount(AuthEmployee employee) async {
    try {
      final model = await _localDatasource.getEmployee();
      if (model == null) {
        return const Result.failure(
          CacheFailure(message: 'Employee data not found in local cache.'),
        );
      }
      await _rememberedDatasource.saveAccount(model);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(CacheFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<AuthEmployee>> updateProfile({
    required String name,
    String? email,
    String? phone,
    String? gender,
    String? address,
  }) async {
    try {
      final employeeModel = await _remoteDatasource.updateProfile(
        name: name,
        email: email,
        phone: phone,
        gender: gender,
        address: address,
      );

      await _localDatasource.saveEmployee(employeeModel);

      return Result.success(employeeModel.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Update profile failed: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<void>> changePassword({
    required String currentPassword,
    required String newPassword,
    required String newPasswordConfirmation,
  }) async {
    try {
      await _remoteDatasource.changePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
        newPasswordConfirmation: newPasswordConfirmation,
      );

      return const Result.success(null);
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Change password failed: ${e.toString()}'),
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
