import 'package:dio/dio.dart';
import 'package:http_parser/http_parser.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class EmployeeRemoteDatasource {
  Future<List<EmployeeModel>> getAll({int? outletId});

  Future<EmployeeModel> getById(int id);

  Future<EmployeeModel> update({
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
  });
}

class EmployeeRemoteDatasourceImpl implements EmployeeRemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  EmployeeRemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<List<EmployeeModel>> getAll({int? outletId}) async {
    try {
      final response = await _dio.get(
        _endpoints.employees,
        queryParameters: {'outletId': ?outletId},
      );

      final body = _validateResponse(response);
      final List data = body['data'] as List? ?? [];
      return data
          .map((item) => EmployeeModel.fromJson(item as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<EmployeeModel> getById(int id) async {
    try {
      final response = await _dio.get('${_endpoints.employees}/$id');
      final body = _validateResponse(response);
      return EmployeeModel.fromJson(body['data'] as Map<String, dynamic>);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<EmployeeModel> update({
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
      final payload = <String, dynamic>{
        'name': name,
        'startDate': startDate,
        'cutoffDays': cutoffDays,
        'isActive': ?isActive,
        'phone': ?phone,
        'address': ?address,
        'gender': ?gender,
        'positionIds': ?positionIds,
        'employeeSalaries': ?employeeSalaries,
        'employeeProcessCommissions': ?employeeProcessCommissions,
      };

      dynamic data = payload;
      if (avatarPath != null && avatarPath.trim().isNotEmpty) {
        final fileName = avatarPath.split('/').last;
        final mimeType = _getMimeType(fileName);
        
        final Map<String, dynamic> flattenedData = {};
        
        void flatten(dynamic value, String prefix) {
          if (value is Map) {
            value.forEach((key, val) {
              flatten(val, '$prefix[$key]');
            });
          } else if (value is List) {
            for (int i = 0; i < value.length; i++) {
              flatten(value[i], '$prefix[$i]');
            }
          } else if (value is bool) {
            flattenedData[prefix] = value ? 1 : 0;
          } else if (value != null) {
            flattenedData[prefix] = value;
          }
        }

        payload.forEach((key, value) {
          flatten(value, key);
        });

        flattenedData['avatar'] = await MultipartFile.fromFile(
          avatarPath,
          filename: fileName,
          contentType: MediaType.parse(mimeType),
        );

        data = FormData.fromMap(flattenedData);
      }

      final response = await _dio.put(
        '${_endpoints.employees}/$id',
        data: data,
        options: data is FormData
            ? Options(contentType: Headers.multipartFormDataContentType)
            : null,
      );

      final body = _validateResponse(response);
      return EmployeeModel.fromJson(body['data'] as Map<String, dynamic>);
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
          errors: body['errors'] is Map<String, dynamic>
              ? body['errors'] as Map<String, dynamic>
              : null,
        );
      }

      return body;
    }

    throw ApiException(
      message: 'Request failed',
      statusCode: response.statusCode,
    );
  }

  String _getMimeType(String fileName) {
    final extension = fileName.split('.').last.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
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

      if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.unknown) {
        return NetworkException(
          message: 'No internet connection. Please check your network.',
        );
      }

      if (e.response != null) {
        final data = e.response!.data;
        return ApiException(
          message: data is Map<String, dynamic>
              ? (data['message'] as String? ?? 'Request failed')
              : 'Request failed',
          statusCode: e.response!.statusCode,
          errors: data is Map<String, dynamic>
              ? data['errors'] as Map<String, dynamic>?
              : null,
        );
      }

      return NetworkException(message: e.message ?? 'Connection Error');
    }

    return ApiException(message: e.toString());
  }
}
