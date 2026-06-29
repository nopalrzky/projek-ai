class FormatDataException implements Exception {
  final String message;

  FormatDataException([this.message = 'Data format is invalid']);

  @override
  String toString() => 'FormatDataException: $message';
}
