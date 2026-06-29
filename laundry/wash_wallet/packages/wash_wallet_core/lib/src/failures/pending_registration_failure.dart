import 'failure.dart';

class PendingRegistrationFailure extends Failure {
  final String phone;

  const PendingRegistrationFailure({
    required this.phone,
    String message = 'OTP terverifikasi, lanjutkan registrasi.',
  }) : super(message);
}
