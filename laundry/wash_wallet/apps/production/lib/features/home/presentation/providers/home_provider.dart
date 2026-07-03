import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:dio/dio.dart';
import '../../data/datasources/home_remote_datasource.dart';
import '../../data/repositories/home_repository_impl.dart';
import '../../domain/repositories/home_repository.dart';
import '../../domain/usecases/get_home_data_usecase.dart';
import '../bloc/home_cubit.dart';

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
    return HomeRepositoryImpl(remoteDatasource: remoteDatasource);
  }

  static GetHomeDataUsecase createGetHomeDataUsecase(
    HomeRepository repository,
  ) {
    return GetHomeDataUsecase(repository);
  }

  static HomeCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);
    final getHomeDataUsecase = createGetHomeDataUsecase(repository);

    return HomeCubit(getHomeDataUsecase: getHomeDataUsecase);
  }
}
