import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../data/datasources/home_remote_datasource.dart';
import '../../data/repositories/home_repository_impl.dart';
import '../../domain/repositories/home_repository.dart';
import '../../domain/usecases/get_home_dashboard_usecase.dart';
import '../bloc/home_dashboard_cubit.dart';

class HomeProvider {
  HomeProvider._();

  static HomeRemoteDatasource createRemoteDatasource(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return HomeRemoteDatasourceImpl(dio, endpoints);
  }

  static HomeRepository createRepository(
    HomeRemoteDatasource remoteDatasource,
  ) {
    return HomeRepositoryImpl(remoteDatasource);
  }

  static GetHomeDashboardUsecase createGetHomeDashboardUsecase(
    HomeRepository repository,
  ) {
    return GetHomeDashboardUsecase(repository);
  }

  static HomeDashboardCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);

    return HomeDashboardCubit(
      getHomeDashboardUsecase: createGetHomeDashboardUsecase(repository),
    );
  }
}
