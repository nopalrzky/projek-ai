import 'failure.dart';

class AuthFailure extends Failure {
  const AuthFailure({required String message}) : super(message);

  List<Object> get props => [message];
}
