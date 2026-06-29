import '../../data/datasources/fcm_token_datasource.dart';

class RegisterFcmTokenUsecase {
  final FcmTokenDatasource _datasource;

  RegisterFcmTokenUsecase(this._datasource);

  Future<void> call({
    required String token,
    String? deviceId,
    String? deviceName,
  }) {
    return _datasource.registerToken(
      token: token,
      deviceId: deviceId,
      deviceName: deviceName,
    );
  }
}
