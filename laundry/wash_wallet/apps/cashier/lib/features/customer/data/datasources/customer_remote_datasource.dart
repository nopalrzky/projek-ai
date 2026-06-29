import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class CustomerRemoteDatasource {
  Future<List<CustomerModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? outletId,
    String? phone,
    String? gender,
    bool? isActive,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  });

  Future<CustomerModel> getById(int id);

  Future<CustomerModel> store({
    required int outletId,
    required String name,
    String? email,
    String? phone,
    String? address,
    String? gender,
    String? dateOfBirth,
    bool? isActive,
  });

  Future<CustomerModel> update({
    required int id,
    String? name,
    String? email,
    String? phone,
    String? address,
    String? gender,
    String? dateOfBirth,
    bool? isActive,
    int? outletId,
  });

  Future<void> destroy(int id);

  Future<CustomerModel> storeMembershipContract({
    required int customerId,
    required int membershipPlanId,
    String? startAt,
    double? totalPaid,
  });

  Future<CustomerModel> storeCustomerSubscription({
    required int customerId,
    required int servicePackageId,
    required double pricePaid,
    String? purchaseDate,
    String? note,
  });
}

class CustomerRemoteDatasourceImpl implements CustomerRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  CustomerRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<List<CustomerModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? outletId,
    String? phone,
    String? gender,
    bool? isActive,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  }) async {
    const maxAttempts = 3;
    var attempt = 0;

    while (true) {
      try {
        attempt++;
        final queryParams = {
          'page': page,
          'perPage': perPage,
          'sortBy': sortBy,
          'sortDirection': sortDirection,
          if (search != null && search.trim().isNotEmpty) 'search': search,
          'outletId': ?outletId,
          if (phone != null && phone.trim().isNotEmpty) 'phone': phone,
          if (gender != null && gender.trim().isNotEmpty) 'gender': gender,
          'isActive': ?isActive,
        };

        final response = await _dio.get(
          _endpoints.customers,
          queryParameters: queryParams,
        );

        final body = _validateResponse(response);

        final List data = body['data'] as List? ?? [];
        return data.map((e) => CustomerModel.fromJson(e)).toList();
      } on DioException catch (e) {
        if (_isTransientGetError(e) && attempt < maxAttempts) {
          await Future.delayed(Duration(milliseconds: 500 * attempt));
          continue;
        }

        throw _handleError(e);
      } catch (e) {
        throw _handleError(e);
      }
    }
  }

  @override
  Future<CustomerModel> getById(int id) async {
    try {
      final response = await _dio.get('${_endpoints.customers}/$id');
      final body = _validateResponse(response);
      return CustomerModel.fromJson(body['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<CustomerModel> store({
    required int outletId,
    required String name,
    String? email,
    String? phone,
    String? address,
    String? gender,
    String? dateOfBirth,
    bool? isActive,
  }) async {
    try {
      final response = await _dio.post(
        _endpoints.customers,
        data: {
          'outletId': outletId,
          'name': name,
          'email': ?email,
          'phone': ?phone,
          'address': ?address,
          'gender': ?gender,
          'dateOfBirth': ?dateOfBirth,
          'isActive': ?isActive,
        },
      );

      final body = _validateResponse(response);
      return CustomerModel.fromJson(body['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<CustomerModel> update({
    required int id,
    String? name,
    String? email,
    String? phone,
    String? address,
    String? gender,
    String? dateOfBirth,
    bool? isActive,
    int? outletId,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (name != null) data['name'] = name;
      if (email != null) data['email'] = email;
      if (phone != null) data['phone'] = phone;
      if (address != null) data['address'] = address;
      if (gender != null) data['gender'] = gender;
      if (dateOfBirth != null) data['dateOfBirth'] = dateOfBirth;
      if (isActive != null) data['isActive'] = isActive;
      if (outletId != null) data['outletId'] = outletId;

      final response = await _dio.put(
        '${_endpoints.customers}/$id',
        data: data,
      );

      final body = _validateResponse(response);
      return CustomerModel.fromJson(body['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<void> destroy(int id) async {
    try {
      final response = await _dio.delete('${_endpoints.customers}/$id');
      _validateResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<CustomerModel> storeMembershipContract({
    required int customerId,
    required int membershipPlanId,
    String? startAt,
    double? totalPaid,
  }) async {
    try {
      final response = await _dio.post(
        _endpoints.membershipContracts,
        queryParameters: {'customerId': customerId},
        data: {
          'membershipPlanId': membershipPlanId,
          'startAt': ?startAt,
          'totalPaid': ?totalPaid,
        },
      );

      final body = _validateResponse(response);
      return CustomerModel.fromJson(body['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<CustomerModel> storeCustomerSubscription({
    required int customerId,
    required int servicePackageId,
    required double pricePaid,
    String? purchaseDate,
    String? note,
  }) async {
    try {
      final response = await _dio.post(
        _endpoints.customerSubscriptions,
        queryParameters: {'customerId': customerId},
        data: {
          'servicePackageId': servicePackageId,
          'pricePaid': pricePaid,
          'purchaseDate': ?purchaseDate,
          'note': ?note,
        },
      );

      final body = _validateResponse(response);
      return CustomerModel.fromJson(body['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Map<String, dynamic> _validateResponse(Response response) {
    if (response.statusCode! >= 200 && response.statusCode! < 300) {
      final body = response.data;

      if (body is! Map<String, dynamic>) {
        throw ApiException(
          message: 'Invalid response format',
          statusCode: response.statusCode,
        );
      }

      if (body['success'] == false) {
        throw ApiException(
          message: body['message'] as String? ?? 'Request failed',
          statusCode: response.statusCode,
        );
      }

      return body;
    }

    throw ApiException(
      message: 'Request failed',
      statusCode: response.statusCode,
    );
  }

  bool _isTransientGetError(DioException e) {
    return e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout ||
        e.type == DioExceptionType.sendTimeout ||
        e.type == DioExceptionType.connectionError;
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

      if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.unknown) {
        return NetworkException(
          message: 'No internet connection. Please check your network.',
        );
      }

      if (e.response != null) {
        final statusCode = e.response!.statusCode;
        final data = e.response!.data;

        String message = 'Request failed';
        if (data is Map<String, dynamic> && data['message'] != null) {
          message = data['message'] as String;
        }

        return ApiException(
          message: message,
          statusCode: statusCode,
          errors: data is Map<String, dynamic> ? data['errors'] : null,
        );
      }

      final fallbackMessage = e.error?.toString();
      return NetworkException(
        message: (fallbackMessage != null && fallbackMessage.isNotEmpty)
            ? fallbackMessage
            : 'Network request failed. Please try again.',
      );
    }

    return ApiException(message: 'Unexpected error: ${e.toString()}');
  }
}
