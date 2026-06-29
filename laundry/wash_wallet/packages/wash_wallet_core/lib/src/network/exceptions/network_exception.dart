class NetworkException implements Exception {
  final String message;
  final int? statusCode;

  NetworkException({
    this.message = 'Network connection error',
    this.statusCode,
  });

  @override
  String toString() => 'NetworkException: $message';
}
