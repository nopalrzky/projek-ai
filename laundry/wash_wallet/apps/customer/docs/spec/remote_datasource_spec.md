# Remote Datasource Specification

> **Layer:** Data Layer  
> **Lokasi:** `lib/features/<feature>/data/datasources/<feature>_remote_datasource.dart`  
> **Dependensi:** `package:dio/dio.dart`, `wash_wallet_core`, `wash_wallet_domain`

---

## Konsep Utama

Remote Datasource adalah layer paling bawah pada sisi data. Bertanggung jawab **hanya** pada:
1. Membuat HTTP request ke API
2. Mem-parse raw JSON response menjadi `Model` (bukan Entity)
3. Melempar exception (`ApiException` / `NetworkException`) jika terjadi error

Remote Datasource **tidak boleh** mengembalikan `Result<T>` — itu tugas Repository.

---

## Struktur File

Setiap feature memiliki **satu** file datasource yang berisi:
- `abstract class <Feature>RemoteDatasource` — kontrak/interface
- `class <Feature>RemoteDatasourceImpl implements <Feature>RemoteDatasource` — implementasi

---

## Template Abstract Class

```dart
abstract class <Feature>RemoteDatasource {
  Future<List<<Feature>Model>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    // filter spesifik fitur...
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  });

  Future<<Feature>Model> getById(int id);

  Future<<Feature>Model> store({
    required <Type> <requiredField>,
    // field opsional...
  });

  Future<<Feature>Model> update({
    required int id,
    // field opsional (semua nullable)...
  });

  Future<void> destroy(int id);
}
```

---

## Template Implementation Class

```dart
class <Feature>RemoteDatasourceImpl implements <Feature>RemoteDatasource {
  final Dio _dio;
  final ApiEndpoints _endpoints;

  <Feature>RemoteDatasourceImpl(this._dio, this._endpoints);

  @override
  Future<List<<Feature>Model>> getAll({...}) async {
    try {
      final queryParams = {
        'page': page,
        'perPage': perPage,
        'sortBy': sortBy,
        'sortDirection': sortDirection,
        if (search != null && search.trim().isNotEmpty) 'search': search,
        // Gunakan null-aware operator untuk optional params:
        'outletId': ?outletId,
        'status': ?status,
      };

      final response = await _dio.get(
        _endpoints.<featureEndpoint>,
        queryParameters: queryParams,
      );

      final body = _validateResponse(response);
      final List data = body['data'] as List? ?? [];
      return data.map((e) => <Feature>Model.fromJson(e)).toList();
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<<Feature>Model> getById(int id) async {
    try {
      final response = await _dio.get('${_endpoints.<featureEndpoint>}/$id');
      final body = _validateResponse(response);
      return <Feature>Model.fromJson(body['data'] as Map<String, dynamic>);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<<Feature>Model> store({
    required <Type> <requiredField>,
    <Type>? <optionalField>,
  }) async {
    try {
      final response = await _dio.post(
        _endpoints.<featureEndpoint>,
        data: {
          '<requiredField>': <requiredField>,
          '<optionalField>': ?<optionalField>, // null-aware untuk opsional
        },
      );

      final body = _validateResponse(response);
      return <Feature>Model.fromJson(body['data'] as Map<String, dynamic>);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<<Feature>Model> update({
    required int id,
    <Type>? <optionalField>,
  }) async {
    try {
      // Pola update: hanya kirim field yang tidak null
      final data = <String, dynamic>{};
      if (<optionalField> != null) data['<optionalField>'] = <optionalField>;

      final response = await _dio.put(
        '${_endpoints.<featureEndpoint>}/$id',
        data: data,
      );

      final body = _validateResponse(response);
      return <Feature>Model.fromJson(body['data'] as Map<String, dynamic>);
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<void> destroy(int id) async {
    try {
      final response = await _dio.delete('${_endpoints.<featureEndpoint>}/$id');
      _validateResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  Map<String, dynamic> _validateResponse(Response response) {
    if (response.statusCode! >= 200 && response.statusCode! < 300) {
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

  Exception _handleError(Object e) {
    if (e is ApiException) return e;

    if (e is DioException) {
      // Timeout
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.sendTimeout) {
        return NetworkException(
          message: 'Connection timeout. Please try again.',
        );
      }

      // No internet / connection error
      if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.unknown) {
        return NetworkException(
          message: 'No internet connection. Please check your network.',
        );
      }

      // Server returned error response
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

      return NetworkException(message: e.message ?? 'Unknown error occurred');
    }

    return ApiException(message: 'Unexpected error: ${e.toString()}');
  }
}
```

---

## Aturan & Konvensi

| Aturan | Keterangan |
|--------|-----------|
| Return type | Selalu `Future<XModel>` atau `Future<List<XModel>>` — **bukan** `Result<T>` |
| Error handling | `try/catch` + `throw _handleError(e)` di setiap method |
| Null params di query | Gunakan null-aware operator Dart `'key': ?value` |
| Null params di body (update) | Build Map secara manual, hanya tambahkan jika `!= null` |
| File upload | Gunakan `FormData.fromMap()` + `MultipartFile.fromFile()` |
| Response parsing | Selalu gunakan `_validateResponse()` sebelum akses `body['data']` |
| Nama class impl | `<Feature>RemoteDatasourceImpl` |
| Constructor | Positional: `(this._dio, this._endpoints)` |

---

## Variasi: Endpoint Dinamis (resource dengan parent ID)

```dart
// Untuk endpoint seperti: /api/customers/{id}/subscriptions
final response = await _dio.get(
  _endpoints.customerSubscriptions(customerId),
  queryParameters: queryParams,
);
```

## Variasi: File Upload dengan FormData

```dart
Future<<Feature>Model> store({
  required String filePath,
  required String name,
}) async {
  try {
    final fileName = filePath.split('/').last;
    final mimeType = _getMimeType(fileName);

    final formData = FormData.fromMap({
      'name': name,
      'file': await MultipartFile.fromFile(
        filePath,
        filename: fileName,
        contentType: MediaType.parse(mimeType),
      ),
    });

    final response = await _dio.post(_endpoints.<feature>, data: formData);
    final body = _validateResponse(response);
    return <Feature>Model.fromJson(body['data'] as Map<String, dynamic>);
  } catch (e) {
    throw _handleError(e);
  }
}

String _getMimeType(String fileName) {
  final extension = fileName.split('.').last.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}
```

---

## Contoh Nyata: CategoryRemoteDatasource

Lihat: `apps/cashier/lib/features/category/data/datasources/category_remote_datasource.dart`
