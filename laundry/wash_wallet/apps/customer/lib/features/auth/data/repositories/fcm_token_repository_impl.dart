import 'package:dartz/dartz.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../domain/repositories/fcm_token_repository.dart';
import '../datasources/fcm_token_datasource.dart';

class FcmTokenRepositoryImpl implements FcmTokenRepository {
  final FcmTokenRemoteDataSource _remoteDataSource;

  FcmTokenRepositoryImpl(this._remoteDataSource);

  @override
  Future<Either<Failure, void>> update(String token) async {
    try {
      await _remoteDataSource.update(token);
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }
}
