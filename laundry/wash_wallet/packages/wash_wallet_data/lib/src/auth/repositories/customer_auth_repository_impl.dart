import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../datasources/auth_local_datasource.dart';
import '../datasources/auth_remote_datasource.dart';

class CustomerAuthRepositoryImpl implements CustomerAuthRepository {
  final AuthRemoteDatasource _remoteDatasource;
  final AuthLocalDatasource _localDatasource;

  CustomerAuthRepositoryImpl({
    required AuthRemoteDatasource remoteDatasource,
    required AuthLocalDatasource localDatasource,
  }) : _remoteDatasource = remoteDatasource,
       _localDatasource = localDatasource;

  @override
  Future<Result<bool>> requestOtp(
    String phone, {
    required String intent,
  }) async {
    try {
      final hasPassword = await _remoteDatasource.requestOtp(
        phone,
        intent: intent,
      );
      return Result.success(hasPassword);
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Request OTP failed: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<CustomerAccount>> verifyOtp({
    required String phone,
    required String otp,
  }) async {
    try {
      final verifyResult = await _remoteDatasource.verifyOtp(
        phone: phone,
        otp: otp,
      );

      if (verifyResult.status == 'new_user') {
        return Result.failure(
          PendingRegistrationFailure(phone: verifyResult.phone),
        );
      }

      final token = verifyResult.token;
      final customerModel = verifyResult.customer;

      if (token == null || customerModel == null) {
        return const Result.failure(
          ServerFailure(message: 'Data login OTP tidak lengkap.'),
        );
      }

      await _localDatasource.saveToken(token);
      await _localDatasource.saveCustomer(customerModel);

      return Result.success(customerModel.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Verify OTP failed: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<CustomerAccount>> register({
    required String phone,
    required String name,
    String? email,
    String? gender,
    String? password,
    String? dateOfBirth,
    String? deviceName,
  }) async {
    try {
      final (token, customerModel) = await _remoteDatasource.registerCustomer(
        phone: phone,
        name: name,
        email: email,
        gender: gender,
        password: password,
        dateOfBirth: dateOfBirth,
        deviceName: deviceName,
      );

      await _localDatasource.saveToken(token);
      await _localDatasource.saveCustomer(customerModel);

      return Result.success(customerModel.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Register failed: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<CustomerAccount>> loginWithPassword({
    required String phone,
    required String password,
    String? deviceName,
  }) async {
    try {
      final (token, customerModel) = await _remoteDatasource.loginWithPassword(
        phone: phone,
        password: password,
        deviceName: deviceName,
      );

      await _localDatasource.saveToken(token);
      await _localDatasource.saveCustomer(customerModel);

      return Result.success(customerModel.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Login with password failed: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<CustomerAccount>> getProfile() async {
    try {
      final customerModel = await _remoteDatasource.getCustomerProfile();
      await _localDatasource.saveCustomer(customerModel);
      return Result.success(customerModel.toEntity());
    } on ApiException catch (e) {
      if (e.statusCode == 401) {
        await _localDatasource.clearAll();
      }
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Failed to get profile: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<CustomerAccount>> checkAuthStatus() async {
    try {
      final token = await _localDatasource.getToken();

      if (token == null || token.isEmpty) {
        return const Result.failure(
          AuthFailure(message: 'No authentication token found. Please login.'),
        );
      }

      final result = await getProfile();

      return await result.when(
        success: (customer) async => Result.success(customer),
        failure: (failure) async {
          await _localDatasource.clearAll();
          return Result.failure(failure);
        },
      );
    } catch (e) {
      await _localDatasource.clearAll();
      return Result.failure(
        ServerFailure(message: 'Auth check failed: ${e.toString()}'),
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
  Future<Result<CustomerAccount>> setPassword({
    required String password,
    required String passwordConfirmation,
  }) async {
    try {
      final customerModel = await _remoteDatasource.setCustomerPassword(
        password: password,
        passwordConfirmation: passwordConfirmation,
      );
      await _localDatasource.saveCustomer(customerModel);
      return Result.success(customerModel.toEntity());
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Set password failed: ${e.toString()}'),
      );
    }
  }

  @override
  Future<Result<CustomerAccount>> updateProfile({
    required String name,
    String? email,
    String? gender,
    String? dateOfBirth,
  }) async {
    try {
      final customerModel = await _remoteDatasource.updateCustomerProfile(
        name: name,
        email: email,
        gender: gender,
        dateOfBirth: dateOfBirth,
      );
      await _localDatasource.saveCustomer(customerModel);
      return Result.success(customerModel.toEntity());
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
      case 429:
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
