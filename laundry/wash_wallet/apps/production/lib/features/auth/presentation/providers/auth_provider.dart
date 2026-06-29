import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import 'package:wash_wallet_data/wash_wallet_data.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../data/datasources/fcm_token_datasource.dart';
import '../bloc/auth_cubit.dart';

class AuthProvider {
  AuthProvider._();

  static AuthLocalDatasource createLocalDatasource(
    FlutterSecureStorage storage,
    SharedPreferences prefs,
  ) {
    return AuthLocalDatasourceImpl(storage, prefs);
  }

  static AuthRemoteDatasource createRemoteDatasource(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return AuthRemoteDatasourceImpl(dio, endpoints);
  }

  static AuthRepository createRepository({
    required AuthRemoteDatasource remoteDatasource,
    required AuthLocalDatasource localDatasource,
    required RememberedEmployeeLocalDatasource rememberedDatasource,
  }) {
    return AuthRepositoryImpl(
      remoteDatasource: remoteDatasource,
      localDatasource: localDatasource,
      rememberedDatasource: rememberedDatasource,
    );
  }

  static LoginUsecase createLoginUsecase(AuthRepository repository) {
    return LoginUsecase(repository);
  }

  static LogoutUsecase createLogoutUsecase(AuthRepository repository) {
    return LogoutUsecase(repository);
  }

  static GetMeUsecase createGetMeUsecase(AuthRepository repository) {
    return GetMeUsecase(repository);
  }

  static CheckAuthStatusUsecase createCheckAuthStatusUsecase(
    AuthRepository repository,
  ) {
    return CheckAuthStatusUsecase(repository);
  }

  static AuthCubit createAuthCubit({
    required LoginUsecase loginUsecase,
    required LogoutUsecase logoutUsecase,
    required GetMeUsecase getMeUsecase,
    required CheckAuthStatusUsecase checkAuthStatusUsecase,
    FcmTokenDatasource? fcmTokenDatasource,
  }) {
    return AuthCubit(
      loginUsecase: loginUsecase,
      logoutUsecase: logoutUsecase,
      getMeUsecase: getMeUsecase,
      checkAuthStatusUsecase: checkAuthStatusUsecase,
      fcmTokenDatasource: fcmTokenDatasource,
    );
  }

  static Future<AuthCubit> createAuthCubitWithDependencies(
    Dio dio,
    ApiEndpoints endpoints,
  ) async {
    const storage = FlutterSecureStorage();
    final prefs = await SharedPreferences.getInstance();

    final localDatasource = createLocalDatasource(storage, prefs);
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final fcmTokenDatasource = FcmTokenDatasourceImpl(dio, endpoints);

    final rememberedDatasource = RememberedEmployeeLocalDatasourceImpl(prefs);

    final repository = createRepository(
      remoteDatasource: remoteDatasource,
      localDatasource: localDatasource,
      rememberedDatasource: rememberedDatasource,
    );

    final loginUsecase = createLoginUsecase(repository);
    final logoutUsecase = createLogoutUsecase(repository);
    final getMeUsecase = createGetMeUsecase(repository);
    final checkAuthStatusUsecase = createCheckAuthStatusUsecase(repository);

    return createAuthCubit(
      loginUsecase: loginUsecase,
      logoutUsecase: logoutUsecase,
      getMeUsecase: getMeUsecase,
      checkAuthStatusUsecase: checkAuthStatusUsecase,
      fcmTokenDatasource: fcmTokenDatasource,
    );
  }
}
