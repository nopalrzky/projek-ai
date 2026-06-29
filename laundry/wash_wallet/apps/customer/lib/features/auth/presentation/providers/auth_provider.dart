import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_data/wash_wallet_data.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../../data/datasources/fcm_token_datasource.dart';
import '../../data/repositories/fcm_token_repository_impl.dart';
import '../../domain/usecases/update_usecase.dart';
import '../bloc/customer_auth_cubit.dart';

class CustomerAuthProvider {
  static Future<CustomerAuthCubit> createAuthCubitWithDependencies(
    Dio dio,
    ApiEndpoints endpoints,
  ) async {
    final remoteDatasource = AuthRemoteDatasourceImpl(dio, endpoints);
    final fcmTokenDataSource = FcmTokenRemoteDataSourceImpl(dio, endpoints);
    final fcmTokenRepository = FcmTokenRepositoryImpl(fcmTokenDataSource);
    final updateUsecase = UpdateUsecase(fcmTokenRepository);

    final storage = SecureStorageProvider.create();
    final sharedPreferences = await SharedPreferences.getInstance();
    final localDatasource = AuthLocalDatasourceImpl(storage, sharedPreferences);

    final repository = CustomerAuthRepositoryImpl(
      remoteDatasource: remoteDatasource,
      localDatasource: localDatasource,
    );

    return CustomerAuthCubit(
      checkAuthStatus: CheckCustomerAuthStatusUsecase(repository),
      requestOtp: RequestOtpUsecase(repository),
      verifyOtp: VerifyOtpUsecase(repository),
      register: RegisterUsecase(repository),
      loginWithPassword: LoginWithPasswordUsecase(repository),
      logout: CustomerLogoutUsecase(repository),
      updateUsecase: updateUsecase,
      setPassword: SetPasswordUsecase(repository),
      updateProfile: UpdateProfileUsecase(repository),
    );
  }
}
