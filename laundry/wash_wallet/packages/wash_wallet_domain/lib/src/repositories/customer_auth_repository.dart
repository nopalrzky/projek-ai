import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../entities/customer_account.dart';

abstract class CustomerAuthRepository {
  Future<Result<bool>> requestOtp(String phone, {required String intent});

  Future<Result<CustomerAccount>> verifyOtp({
    required String phone,
    required String otp,
  });

  Future<Result<CustomerAccount>> register({
    required String phone,
    required String name,
    String? email,
    String? gender,
    String? password,
    String? dateOfBirth,
    String? deviceName,
  });

  Future<Result<CustomerAccount>> loginWithPassword({
    required String phone,
    required String password,
    String? deviceName,
  });

  Future<Result<CustomerAccount>> getProfile();

  Future<Result<CustomerAccount>> checkAuthStatus();

  Future<Result<void>> logout();

  Future<Result<CustomerAccount>> setPassword({
    required String password,
    required String passwordConfirmation,
  });

  Future<Result<CustomerAccount>> updateProfile({
    required String name,
    String? email,
    String? gender,
    String? dateOfBirth,
  });
}
