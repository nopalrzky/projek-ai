import 'failure.dart';

class ValidationFailure extends Failure {
  final Map<String, dynamic>? errors;

  const ValidationFailure({this.errors, String message = 'Invalid input data'})
    : super(message);

  @override
  String toString() {
    if (errors != null && errors!.isNotEmpty) {
      return 'ValidationFailure: $message - Errors: $errors';
    }
    return 'ValidationFailure: $message';
  }
}
