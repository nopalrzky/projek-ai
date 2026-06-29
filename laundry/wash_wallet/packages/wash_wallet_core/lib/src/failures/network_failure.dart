import 'failure.dart';

class NetworkFailure extends Failure {
  const NetworkFailure({String message = 'Network connection error'})
    : super(message);

  List<Object> get props => [message];
}
