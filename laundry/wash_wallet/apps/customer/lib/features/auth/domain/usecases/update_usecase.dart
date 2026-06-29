import 'package:dartz/dartz.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../repositories/fcm_token_repository.dart';

class UpdateUsecase {
  final FcmTokenRepository _repository;

  UpdateUsecase(this._repository);

  Future<Either<Failure, void>> call(String token) async {
    return await _repository.update(token);
  }
}
