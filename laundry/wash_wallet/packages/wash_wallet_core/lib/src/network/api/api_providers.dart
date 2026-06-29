import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:dio/dio.dart';

class ApiProvider {
  final ApiClient _client;
  final ApiEndpoints _endpoints;

  ApiProvider(this._client, this._endpoints);

  Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await _client.post(
      _endpoints.login,
      data: {'username': username, 'password': password},
    );

    if (response.statusCode != 200) {
      throw DioException(
        requestOptions: response.requestOptions,
        response: response,
        message: 'Login failed',
      );
    }

    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getProfile() async {
    final response = await _client.get(_endpoints.me);

    if (response.statusCode != 200) {
      throw DioException(
        requestOptions: response.requestOptions,
        response: response,
        message: 'Failed to get profile',
      );
    }

    return response.data as Map<String, dynamic>;
  }

  Future<void> logout() async {
    final response = await _client.post(_endpoints.logout);

    if (response.statusCode != 200) {
      throw DioException(
        requestOptions: response.requestOptions,
        response: response,
        message: 'Logout failed',
      );
    }
  }
}
