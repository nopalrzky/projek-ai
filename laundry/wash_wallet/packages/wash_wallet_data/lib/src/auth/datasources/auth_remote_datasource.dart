import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class AuthRemoteDatasource {
  Future<(String token, AuthEmployeeModel employee)> login({
    required String username,
    required String password,
  });

  Future<AuthEmployeeModel> getMe();

  Future<void> logout();

  Future<AuthEmployeeModel> setupPin({
    required String pin,
    required String pinConfirmation,
  });

  Future<AuthEmployeeModel> resetPin({
    required String currentPin,
    required String pin,
    required String pinConfirmation,
  });

  Future<(String token, AuthEmployeeModel employee)> verifyPin({
    int? employeeId,
    String? username,
    required String pin,
    String? deviceName,
  });

  Future<AuthEmployeeModel> updateProfile({
    required String name,
    String? email,
    String? phone,
    String? gender,
    String? address,
  });

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
    required String newPasswordConfirmation,
  });

  Future<bool> requestOtp(String phone, {required String intent});

  Future<
    ({
      String? token,
      CustomerAccountModel? customer,
      String status,
      String phone,
    })
  >
  verifyOtp({required String phone, required String otp});

  Future<(String token, CustomerAccountModel customer)> registerCustomer({
    required String phone,
    required String name,
    String? email,
    String? gender,
    String? password,
    String? dateOfBirth,
    String? deviceName,
  });

  Future<(String token, CustomerAccountModel customer)> loginWithPassword({
    required String phone,
    required String password,
    String? deviceName,
  });

  Future<CustomerAccountModel> getCustomerProfile();

  Future<CustomerAccountModel> setCustomerPassword({
    required String password,
    required String passwordConfirmation,
  });

  Future<CustomerAccountModel> updateCustomerProfile({
    required String name,
    String? email,
    String? gender,
    String? dateOfBirth,
  });
}

class AuthRemoteDatasourceImpl implements AuthRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  AuthRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<(String, AuthEmployeeModel)> login({
    required String username,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        _endpoints.login,
        data: {'username': username, 'password': password},
      );

      _validateResponse(response);

      final data = response.data['data'] as Map<String, dynamic>;
      final token = data['token'] as String;
      final employeeJson = data['employee'] as Map<String, dynamic>;

      return (token, AuthEmployeeModel.fromJson(employeeJson));
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<AuthEmployeeModel> getMe() async {
    try {
      final response = await _dio.get(_endpoints.me);

      _validateResponse(response);

      final data = response.data['data'] as Map<String, dynamic>;

      return AuthEmployeeModel.fromJson(data);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<void> logout() async {
    try {
      final response = await _dio.post(_endpoints.logout);
      _validateResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<AuthEmployeeModel> setupPin({
    required String pin,
    required String pinConfirmation,
  }) async {
    try {
      final response = await _dio.post(
        '$_authBaseEndpoint/pin/setup',
        data: {'pin': pin, 'pin_confirmation': pinConfirmation},
      );

      _validateResponse(response);

      final data = response.data['data'] as Map<String, dynamic>;
      final employeeJson = data['employee'] as Map<String, dynamic>;

      return AuthEmployeeModel.fromJson(employeeJson);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<AuthEmployeeModel> resetPin({
    required String currentPin,
    required String pin,
    required String pinConfirmation,
  }) async {
    try {
      final response = await _dio.post(
        _endpoints.cashierPinReset,
        data: {
          'current_pin': currentPin,
          'pin': pin,
          'pin_confirmation': pinConfirmation,
        },
      );

      _validateResponse(response);

      final data = response.data['data'] as Map<String, dynamic>;
      final employeeJson = data['employee'] as Map<String, dynamic>;

      return AuthEmployeeModel.fromJson(employeeJson);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<(String token, AuthEmployeeModel employee)> verifyPin({
    int? employeeId,
    String? username,
    required String pin,
    String? deviceName,
  }) async {
    try {
      final response = await _dio.post(
        '$_authBaseEndpoint/pin/verify',
        data: {
          if (employeeId != null) 'employee_id': employeeId,
          if (username != null && username.isNotEmpty) 'username': username,
          'pin': pin,
          if (deviceName != null && deviceName.isNotEmpty)
            'device_name': deviceName,
        },
      );

      _validateResponse(response);

      final data = response.data['data'] as Map<String, dynamic>;
      final token = data['token'] as String;
      final employeeJson = data['employee'] as Map<String, dynamic>;

      return (token, AuthEmployeeModel.fromJson(employeeJson));
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<AuthEmployeeModel> updateProfile({
    required String name,
    String? email,
    String? phone,
    String? gender,
    String? address,
  }) async {
    try {
      final response = await _dio.patch(
        '$_authBaseEndpoint/profile',
        data: {
          'name': name,
          if (email != null && email.isNotEmpty) 'email': email,
          if (phone != null && phone.isNotEmpty) 'phone': phone,
          if (gender != null && gender.isNotEmpty) 'gender': gender,
          if (address != null && address.isNotEmpty) 'address': address,
        },
      );

      _validateResponse(response);

      final data = response.data['data'] as Map<String, dynamic>;
      final employeeJson = data['employee'] as Map<String, dynamic>;

      return AuthEmployeeModel.fromJson(employeeJson);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
    required String newPasswordConfirmation,
  }) async {
    try {
      final response = await _dio.post(
        '$_authBaseEndpoint/password',
        data: {
          'current_password': currentPassword,
          'password': newPassword,
          'password_confirmation': newPasswordConfirmation,
        },
      );

      _validateResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<bool> requestOtp(String phone, {required String intent}) async {
    try {
      final response = await _dio.post(
        '$_authBaseEndpoint/otp/request',
        data: {'phone': phone, 'intent': intent},
      );
      _validateResponse(response);

      final data = response.data['data'] as Map<String, dynamic>? ?? {};
      final status = data['status']?.toString();

      if (status != 'otp_sent') {
        throw ApiException(
          message: status ?? 'request_otp_failed',
          statusCode: 422,
        );
      }

      return data['has_password'] as bool? ?? false;
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<
    ({
      String? token,
      CustomerAccountModel? customer,
      String status,
      String phone,
    })
  >
  verifyOtp({required String phone, required String otp}) async {
    try {
      final response = await _dio.post(
        '$_authBaseEndpoint/otp/verify',
        data: {'phone': phone, 'otp': otp},
      );

      _validateResponse(response);

      final data = response.data['data'] as Map<String, dynamic>;
      final status = data['status']?.toString() ?? '';
      final responsePhone = data['phone']?.toString() ?? phone;

      if (status == 'new_user') {
        return (
          token: null,
          customer: null,
          status: status,
          phone: responsePhone,
        );
      }

      if (status == 'existing_user') {
        final token = data['token'] as String?;
        final customerJson = data['customer'] as Map<String, dynamic>?;

        if (token == null || customerJson == null) {
          throw ApiException(
            message: 'Incomplete existing user payload',
            statusCode: 500,
          );
        }

        return (
          token: token,
          customer: CustomerAccountModel.fromJson(customerJson),
          status: status,
          phone: responsePhone,
        );
      }

      throw ApiException(
        message: 'Unknown verify status: $status',
        statusCode: 500,
      );
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<(String token, CustomerAccountModel customer)> registerCustomer({
    required String phone,
    required String name,
    String? email,
    String? gender,
    String? password,
    String? dateOfBirth,
    String? deviceName,
  }) async {
    try {
      final response = await _dio.post(
        '$_authBaseEndpoint/register',
        data: {
          'phone': phone,
          'name': name,
          if (email != null && email.isNotEmpty) 'email': email,
          if (gender != null && gender.isNotEmpty) 'gender': gender,
          if (password != null && password.isNotEmpty) 'password': password,
          if (dateOfBirth != null && dateOfBirth.isNotEmpty)
            'date_of_birth': dateOfBirth,
          if (deviceName != null && deviceName.isNotEmpty)
            'deviceName': deviceName,
        },
      );

      _validateResponse(response);

      final data = response.data['data'] as Map<String, dynamic>;
      final token = data['token'] as String;
      final customerJson = data['customer'] as Map<String, dynamic>;

      return (token, CustomerAccountModel.fromJson(customerJson));
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<(String token, CustomerAccountModel customer)> loginWithPassword({
    required String phone,
    required String password,
    String? deviceName,
  }) async {
    try {
      final response = await _dio.post(
        '$_authBaseEndpoint/login-password',
        data: {
          'phone': phone,
          'password': password,
          if (deviceName != null && deviceName.isNotEmpty)
            'deviceName': deviceName,
        },
      );

      _validateResponse(response);

      final data = response.data['data'] as Map<String, dynamic>;
      final token = data['token'] as String;
      final customerJson = data['customer'] as Map<String, dynamic>;

      return (token, CustomerAccountModel.fromJson(customerJson));
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<CustomerAccountModel> getCustomerProfile() async {
    try {
      final response = await _dio.get(_endpoints.me);

      _validateResponse(response);

      final data = response.data['data'] as Map<String, dynamic>;

      return CustomerAccountModel.fromJson(data);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<CustomerAccountModel> setCustomerPassword({
    required String password,
    required String passwordConfirmation,
  }) async {
    try {
      final response = await _dio.post(
        '$_authBaseEndpoint/set-password',
        data: {
          'password': password,
          'password_confirmation': passwordConfirmation,
        },
      );

      _validateResponse(response);

      final data = response.data['data'] as Map<String, dynamic>;

      return CustomerAccountModel.fromJson(data);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<CustomerAccountModel> updateCustomerProfile({
    required String name,
    String? email,
    String? gender,
    String? dateOfBirth,
  }) async {
    try {
      final response = await _dio.patch(
        '$_authBaseEndpoint/profile',
        data: {
          'name': name,
          'email': email,
          'gender': gender,
          'date_of_birth': dateOfBirth,
        },
      );

      _validateResponse(response);

      final data = response.data['data'] as Map<String, dynamic>;

      return CustomerAccountModel.fromJson(data);
    } catch (e) {
      throw _handleError(e);
    }
  }

  void _validateResponse(Response response) {
    if (response.statusCode != 200) {
      throw ApiException(
        message: 'Request failed',
        statusCode: response.statusCode,
      );
    }
  }

  Exception _handleError(Object e) {
    if (e is ApiException) return e;

    if (e is DioException) {
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.sendTimeout) {
        return NetworkException(
          message: 'Connection timeout. Please try again.',
        );
      }

      if (e.type == DioExceptionType.connectionError) {
        return NetworkException(
          message: 'No internet connection. Please check your network.',
        );
      }

      if (e.response != null) {
        final statusCode = e.response!.statusCode;
        final data = e.response!.data;

        String message = 'Request failed';

        if (data is Map<String, dynamic>) {
          if (data['errors'] is Map<String, dynamic>) {
            final errors = data['errors'] as Map<String, dynamic>;
            if (errors.isNotEmpty) {
              final firstError = errors.values.first;
              if (firstError is List && firstError.isNotEmpty) {
                message = firstError.first.toString();
              } else {
                message = firstError.toString();
              }
            }
          } else if (data['message'] != null) {
            message = data['message'].toString();
          }
        }

        return ApiException(message: message, statusCode: statusCode);
      }

      return NetworkException(message: e.message ?? 'Unknown error occurred');
    }

    return ApiException(message: 'Unexpected error: ${e.toString()}');
  }

  String get _authBaseEndpoint => _endpoints.login.replaceAll('/login', '');
}
