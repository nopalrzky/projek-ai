import '../../data/datasources/fcm_token_datasource.dart';

class RemoveFcmTokenUsecase {
  final FcmTokenDatasource _datasource;

  RemoveFcmTokenUsecase(this._datasource);

  Future<void> call(String token) {
    return _datasource.removeToken(token);
  }
}
