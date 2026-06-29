import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class AuthLocalDatasource {
  Future<void> saveToken(String token);
  Future<String?> getToken();
  Future<void> clearToken();
  Future<void> saveEmployee(AuthEmployeeModel employee);
  Future<AuthEmployeeModel?> getEmployee();
  Future<void> saveCustomer(CustomerAccountModel customer);
  Future<CustomerAccountModel?> getCustomer();
  Future<void> clearAll();
}

class AuthLocalDatasourceImpl implements AuthLocalDatasource {
  final FlutterSecureStorage _secureStorage;
  final SharedPreferences _prefs;

  static const String _tokenKey = 'auth_token';
  static const String _employeeKey = 'auth_employee';
  static const String _customerKey = 'auth_customer';
  static const String _tokenBackupKey = 'auth_token_backup';

  AuthLocalDatasourceImpl(this._secureStorage, this._prefs);

  @override
  Future<void> saveToken(String token) async {
    try {
      await Future.wait([
        _secureStorage.write(key: _tokenKey, value: token),
        _prefs.setString(_tokenBackupKey, token),
      ]);
    } catch (e) {
      throw Exception('Failed to save token: ${e.toString()}');
    }
  }

  @override
  Future<String?> getToken() async {
    try {
      String? token = await _secureStorage.read(key: _tokenKey);

      if (token != null && token.isNotEmpty) {
        return token;
      }

      token = _prefs.getString(_tokenBackupKey);

      if (token != null && token.isNotEmpty) {
        await _secureStorage.write(key: _tokenKey, value: token);
        return token;
      }

      return null;
    } catch (e) {
      final token = _prefs.getString(_tokenBackupKey);
      if (token != null) {
        return token;
      }
      return null;
    }
  }

  @override
  Future<void> clearToken() async {
    try {
      await Future.wait([
        _secureStorage.delete(key: _tokenKey),
        Future.sync(() => _prefs.remove(_tokenBackupKey)),
      ]);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> saveEmployee(AuthEmployeeModel employee) async {
    try {
      final jsonString = json.encode(employee.toJson());

      await Future.wait([
        _secureStorage.write(key: _employeeKey, value: jsonString),
        Future.sync(() => _prefs.setString(_employeeKey, jsonString)),
      ]);
    } catch (e) {
      throw Exception('Failed to save employee data: ${e.toString()}');
    }
  }

  @override
  Future<AuthEmployeeModel?> getEmployee() async {
    try {
      String? jsonString = await _secureStorage.read(key: _employeeKey);

      if (jsonString == null || jsonString.isEmpty) {
        jsonString = _prefs.getString(_employeeKey);
      }

      if (jsonString == null || jsonString.isEmpty) {
        return null;
      }

      final jsonMap = json.decode(jsonString) as Map<String, dynamic>;
      final employee = AuthEmployeeModel.fromJson(jsonMap);

      if (await _secureStorage.read(key: _employeeKey) == null) {
        await _secureStorage.write(key: _employeeKey, value: jsonString);
      }

      return employee;
    } catch (e) {
      return null;
    }
  }

  @override
  Future<void> saveCustomer(CustomerAccountModel customer) async {
    try {
      final jsonString = json.encode(customer.toJson());

      await Future.wait([
        _secureStorage.write(key: _customerKey, value: jsonString),
        Future.sync(() => _prefs.setString(_customerKey, jsonString)),
      ]);
    } catch (e) {
      throw Exception('Failed to save customer data: ${e.toString()}');
    }
  }

  @override
  Future<CustomerAccountModel?> getCustomer() async {
    try {
      String? jsonString = await _secureStorage.read(key: _customerKey);

      if (jsonString == null || jsonString.isEmpty) {
        jsonString = _prefs.getString(_customerKey);
      }

      if (jsonString == null || jsonString.isEmpty) {
        return null;
      }

      final jsonMap = json.decode(jsonString) as Map<String, dynamic>;
      return CustomerAccountModel.fromJson(jsonMap);
    } catch (e) {
      return null;
    }
  }

  @override
  Future<void> clearAll() async {
    try {
      await Future.wait([
        _secureStorage.delete(key: _tokenKey),
        _secureStorage.delete(key: _employeeKey),
        _secureStorage.delete(key: _customerKey),
        Future.sync(() => _prefs.remove(_tokenBackupKey)),
        Future.sync(() => _prefs.remove(_employeeKey)),
        Future.sync(() => _prefs.remove(_customerKey)),
      ]);
    } catch (e) {
      rethrow;
    }
  }
}
