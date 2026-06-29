class PermissionException implements Exception {
  final String message;

  PermissionException([this.message = 'Permission denied']);

  @override
  String toString() => 'PermissionException: $message';
}
