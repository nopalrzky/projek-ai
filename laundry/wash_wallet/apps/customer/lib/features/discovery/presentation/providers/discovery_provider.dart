import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../data/datasources/discovery_remote_datasource.dart';
import '../../data/repositories/discovery_repository_impl.dart';
import '../../domain/repositories/discovery_repository.dart';
import '../../domain/usecases/get_discovery_outlets_usecase.dart';
import '../../domain/usecases/get_recommended_services_usecase.dart';
import '../../domain/usecases/get_top_outlets_usecase.dart';
import '../../domain/usecases/search_services_usecase.dart';
import '../bloc/discovery_cubit.dart';

class DiscoveryProvider {
  DiscoveryProvider._();

  static DiscoveryRemoteDatasource createRemoteDatasource(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return DiscoveryRemoteDatasourceImpl(dio, endpoints);
  }

  static DiscoveryRepository createRepository(
    DiscoveryRemoteDatasource remoteDatasource,
  ) {
    return DiscoveryRepositoryImpl(remoteDatasource);
  }

  static SearchServicesUsecase createSearchServicesUsecase(
    DiscoveryRepository repository,
  ) {
    return SearchServicesUsecase(repository);
  }

  static GetRecommendedServicesUsecase createGetRecommendedServicesUsecase(
    DiscoveryRepository repository,
  ) {
    return GetRecommendedServicesUsecase(repository);
  }

  static GetTopOutletsUsecase createGetTopOutletsUsecase(
    DiscoveryRepository repository,
  ) {
    return GetTopOutletsUsecase(repository);
  }

  static GetDiscoveryOutletsUsecase createGetDiscoveryOutletsUsecase(
    DiscoveryRepository repository,
  ) {
    return GetDiscoveryOutletsUsecase(repository);
  }

  static DiscoveryCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);

    return DiscoveryCubit(
      searchServicesUsecase: createSearchServicesUsecase(repository),
      getDiscoveryOutletsUsecase: createGetDiscoveryOutletsUsecase(repository),
    );
  }
}
