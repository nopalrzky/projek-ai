import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import 'package:wash_wallet_cashier/core/services/notification_service.dart';
import 'package:wash_wallet_data/wash_wallet_data.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../data/datasources/fcm_token_datasource.dart';
import '../../domain/usecases/register_fcm_token_usecase.dart';
import '../../domain/usecases/remove_fcm_token_usecase.dart';
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

  static FcmTokenDatasource createFcmTokenDatasource(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return FcmTokenDatasourceImpl(dio, endpoints);
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

  static SetupPinUseCase createSetupPinUseCase(AuthRepository repository) {
    return SetupPinUseCase(repository);
  }

  static VerifyPinUseCase createVerifyPinUseCase(AuthRepository repository) {
    return VerifyPinUseCase(repository);
  }

  static ResetPinUseCase createResetPinUseCase(AuthRepository repository) {
    return ResetPinUseCase(repository);
  }

  static UpdateProfileUseCase createUpdateProfileUseCase(
    AuthRepository repository,
  ) {
    return UpdateProfileUseCase(repository);
  }

  static ChangePasswordUseCase createChangePasswordUseCase(
    AuthRepository repository,
  ) {
    return ChangePasswordUseCase(repository);
  }

  static SaveRememberedAccountUsecase createSaveRememberedAccountUsecase(
    AuthRepository repository,
  ) {
    return SaveRememberedAccountUsecase(repository);
  }

  static AuthCubit createAuthCubit({
    required LoginUsecase loginUsecase,
    required LogoutUsecase logoutUsecase,
    required GetMeUsecase getMeUsecase,
    required CheckAuthStatusUsecase checkAuthStatusUsecase,
    required SetupPinUseCase setupPinUseCase,
    required VerifyPinUseCase verifyPinUseCase,
    required ResetPinUseCase resetPinUseCase,
    required UpdateProfileUseCase updateProfileUseCase,
    required ChangePasswordUseCase changePasswordUseCase,
    required SaveRememberedAccountUsecase saveRememberedAccountUsecase,
    required RegisterFcmTokenUsecase registerFcmTokenUsecase,
    required RemoveFcmTokenUsecase removeFcmTokenUsecase,
    required NotificationService notificationService,
  }) {
    return AuthCubit(
      loginUsecase: loginUsecase,
      logoutUsecase: logoutUsecase,
      getMeUsecase: getMeUsecase,
      checkAuthStatusUsecase: checkAuthStatusUsecase,
      setupPinUseCase: setupPinUseCase,
      verifyPinUseCase: verifyPinUseCase,
      resetPinUseCase: resetPinUseCase,
      updateProfileUseCase: updateProfileUseCase,
      changePasswordUseCase: changePasswordUseCase,
      saveRememberedAccountUsecase: saveRememberedAccountUsecase,
      registerFcmTokenUsecase: registerFcmTokenUsecase,
      removeFcmTokenUsecase: removeFcmTokenUsecase,
      notificationService: notificationService,
    );
  }

  static Future<AuthCubit> createAuthCubitWithDependencies(
    Dio dio,
    ApiEndpoints endpoints, {
    required NotificationService notificationService,
    FlutterSecureStorage? storage,
  }) async {
    final effectiveStorage = storage ?? SecureStorageProvider.create();
    final prefs = await SharedPreferences.getInstance();

    final localDatasource = createLocalDatasource(effectiveStorage, prefs);
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final fcmTokenDatasource = createFcmTokenDatasource(dio, endpoints);

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
    final setupPinUseCase = createSetupPinUseCase(repository);
    final verifyPinUseCase = createVerifyPinUseCase(repository);
    final resetPinUseCase = createResetPinUseCase(repository);
    final updateProfileUseCase = createUpdateProfileUseCase(repository);
    final changePasswordUseCase = createChangePasswordUseCase(repository);
    final saveRememberedAccountUsecase = createSaveRememberedAccountUsecase(
      repository,
    );

    final registerFcmTokenUsecase = RegisterFcmTokenUsecase(fcmTokenDatasource);
    final removeFcmTokenUsecase = RemoveFcmTokenUsecase(fcmTokenDatasource);

    return createAuthCubit(
      loginUsecase: loginUsecase,
      logoutUsecase: logoutUsecase,
      getMeUsecase: getMeUsecase,
      checkAuthStatusUsecase: checkAuthStatusUsecase,
      setupPinUseCase: setupPinUseCase,
      verifyPinUseCase: verifyPinUseCase,
      resetPinUseCase: resetPinUseCase,
      updateProfileUseCase: updateProfileUseCase,
      changePasswordUseCase: changePasswordUseCase,
      saveRememberedAccountUsecase: saveRememberedAccountUsecase,
      registerFcmTokenUsecase: registerFcmTokenUsecase,
      removeFcmTokenUsecase: removeFcmTokenUsecase,
      notificationService: notificationService,
    );
  }
}
