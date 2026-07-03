import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../entities/auth_employee.dart';

abstract class AuthRepository {
  Future<Result<AuthEmployee>> login({
    required String username,
    required String password,
  });

  Future<Result<AuthEmployee>> getMe();

  Future<Result<AuthEmployee>> checkAuthStatus();

  Future<Result<AuthEmployee>> setupPin({
    required String pin,
    required String pinConfirmation,
  });

  Future<Result<AuthEmployee>> resetPin({
    required String currentPin,
    required String pin,
    required String pinConfirmation,
  });

  Future<Result<AuthEmployee>> verifyPin({
    int? employeeId,
    String? username,
    required String pin,
  });

  Future<Result<void>> logout();

  Future<Result<void>> saveRememberedAccount(AuthEmployee employee);

  Future<Result<AuthEmployee>> updateProfile({
    required String name,
    String? email,
    String? phone,
    String? gender,
    String? address,
  });

  Future<Result<void>> changePassword({
    required String currentPassword,
    required String newPassword,
    required String newPasswordConfirmation,
  });
}
