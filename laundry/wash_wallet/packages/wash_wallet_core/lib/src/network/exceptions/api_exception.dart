class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final Map<String, dynamic>? errors;

  ApiException({
    this.message = 'Unexpected API error',
    this.statusCode,
    this.errors,
  });

  @override
  String toString() {
    final buffer = StringBuffer('ApiException: $message');
    if (statusCode != null) {
      buffer.write(' (Status: $statusCode)');
    }
    if (errors != null && errors!.isNotEmpty) {
      buffer.write(' - Errors: $errors');
    }
    return buffer.toString();
  }
}
