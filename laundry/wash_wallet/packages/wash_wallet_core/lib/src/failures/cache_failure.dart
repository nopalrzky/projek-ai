import 'failure.dart';

class CacheFailure extends Failure {
  const CacheFailure({required String message}) : super(message);

  @override
  String toString() => 'CacheFailure: $message';
}
