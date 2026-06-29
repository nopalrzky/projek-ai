import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../models/customer_address_model.dart';

abstract class CustomerAddressRemoteDatasource {
  Future<List<CustomerAddressModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    bool? isPrimary,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  });

  Future<CustomerAddressModel> getById(int id);

  Future<CustomerAddressModel> store({
    required String label,
    required String recipientName,
    required String recipientPhone,
    required String street,
    String? notes,
    double? latitude,
    double? longitude,
    bool? isPrimary,
    String? villageId,
    String? districtId,
    String? regencyId,
    String? provinceId,
    String? villageName,
    String? districtName,
    String? regencyName,
    String? provinceName,
  });

  Future<CustomerAddressModel> update({
    required int id,
    String? label,
    String? recipientName,
    String? recipientPhone,
    String? street,
    String? notes,
    double? latitude,
    double? longitude,
    bool? isPrimary,
    String? villageId,
    String? districtId,
    String? regencyId,
    String? provinceId,
    String? villageName,
    String? districtName,
    String? regencyName,
    String? provinceName,
  });

  Future<void> destroy(int id);
}

class CustomerAddressRemoteDatasourceImpl
    implements CustomerAddressRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  CustomerAddressRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<List<CustomerAddressModel>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    bool? isPrimary,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  }) async {
    try {
      final response = await _dio.get(
        _endpoints.customerAddresses,
        queryParameters: {
          'page': page,
          'perPage': perPage,
          'sortBy': sortBy,
          'sortDirection': sortDirection,
          if (search != null && search.trim().isNotEmpty) 'search': search,
          'isPrimary': ?isPrimary,
        },
      );

      final body = _validateResponse(response);
      final List data = body['data'] as List? ?? [];
      return data
          .whereType<Map>()
          .map(
            (e) => CustomerAddressModel.fromJson(Map<String, dynamic>.from(e)),
          )
          .toList();
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<CustomerAddressModel> getById(int id) async {
    try {
      final response = await _dio.get(_endpoints.customerAddress(id));
      final body = _validateResponse(response);
      return CustomerAddressModel.fromJson(
        body['data'] as Map<String, dynamic>,
      );
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<CustomerAddressModel> store({
    required String label,
    required String recipientName,
    required String recipientPhone,
    required String street,
    String? notes,
    double? latitude,
    double? longitude,
    bool? isPrimary,
    String? villageId,
    String? districtId,
    String? regencyId,
    String? provinceId,
    String? villageName,
    String? districtName,
    String? regencyName,
    String? provinceName,
  }) async {
    try {
      final response = await _dio.post(
        _endpoints.customerAddresses,
        data: {
          'label': label,
          'recipientName': recipientName,
          'recipientPhone': recipientPhone,
          'street': street,
          'notes': ?notes,
          'latitude': ?latitude,
          'longitude': ?longitude,
          'isPrimary': ?isPrimary,
          'villageId': ?villageId,
          'districtId': ?districtId,
          'regencyId': ?regencyId,
          'provinceId': ?provinceId,
          'villageName': ?villageName,
          'districtName': ?districtName,
          'regencyName': ?regencyName,
          'provinceName': ?provinceName,
        },
      );

      final body = _validateResponse(response);
      return CustomerAddressModel.fromJson(
        body['data'] as Map<String, dynamic>,
      );
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<CustomerAddressModel> update({
    required int id,
    String? label,
    String? recipientName,
    String? recipientPhone,
    String? street,
    String? notes,
    double? latitude,
    double? longitude,
    bool? isPrimary,
    String? villageId,
    String? districtId,
    String? regencyId,
    String? provinceId,
    String? villageName,
    String? districtName,
    String? regencyName,
    String? provinceName,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (label != null) data['label'] = label;
      if (recipientName != null) data['recipientName'] = recipientName;
      if (recipientPhone != null) data['recipientPhone'] = recipientPhone;
      if (street != null) data['street'] = street;
      if (notes != null) data['notes'] = notes;
      if (latitude != null) data['latitude'] = latitude;
      if (longitude != null) data['longitude'] = longitude;
      if (isPrimary != null) data['isPrimary'] = isPrimary;
      if (villageId != null) data['villageId'] = villageId;
      if (districtId != null) data['districtId'] = districtId;
      if (regencyId != null) data['regencyId'] = regencyId;
      if (provinceId != null) data['provinceId'] = provinceId;
      if (villageName != null) data['villageName'] = villageName;
      if (districtName != null) data['districtName'] = districtName;
      if (regencyName != null) data['regencyName'] = regencyName;
      if (provinceName != null) data['provinceName'] = provinceName;

      final response = await _dio.put(
        _endpoints.customerAddress(id),
        data: data,
      );
      final body = _validateResponse(response);
      return CustomerAddressModel.fromJson(
        body['data'] as Map<String, dynamic>,
      );
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<void> destroy(int id) async {
    try {
      final response = await _dio.delete(_endpoints.customerAddress(id));
      _validateResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Map<String, dynamic> _validateResponse(Response response) {
    if (response.statusCode != null &&
        response.statusCode! >= 200 &&
        response.statusCode! < 300) {
      final body = response.data;
      if (body is! Map<String, dynamic>) {
        throw ApiException(
          message: 'Invalid response format',
          statusCode: response.statusCode,
        );
      }

      if (body['success'] != true) {
        throw ApiException(
          message: body['message'] as String? ?? 'Request failed',
          statusCode: response.statusCode,
          errors: body['errors'] as Map<String, dynamic>?,
        );
      }

      return body;
    }

    throw ApiException(
      message: 'Request failed',
      statusCode: response.statusCode,
    );
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

        return ApiException(
          message: data is Map<String, dynamic>
              ? (data['message'] as String? ?? 'Request failed')
              : 'Request failed',
          statusCode: statusCode,
          errors: data is Map<String, dynamic>
              ? data['errors'] as Map<String, dynamic>?
              : null,
        );
      }

      return NetworkException(message: e.message ?? 'Unknown error occurred');
    }

    return ApiException(message: 'Unexpected error: ${e.toString()}');
  }
}
