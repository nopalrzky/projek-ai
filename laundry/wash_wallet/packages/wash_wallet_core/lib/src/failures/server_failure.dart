import 'failure.dart';

class ServerFailure extends Failure {
  final int? statusCode;

  const ServerFailure({
    this.statusCode,
    String message = 'Server error occurred',
  }) : super(message);

  @override
  String toString() {
    if (statusCode != null) {
      return 'ServerFailure: $message (Status: $statusCode)';
    }
    return 'ServerFailure: $message';
  }
}
