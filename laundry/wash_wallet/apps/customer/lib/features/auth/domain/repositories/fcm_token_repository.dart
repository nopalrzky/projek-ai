import 'package:dartz/dartz.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';

abstract class FcmTokenRepository {
  Future<Either<Failure, void>> update(String token);
}
