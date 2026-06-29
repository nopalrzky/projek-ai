import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../data/datasources/outlet_remote_datasource.dart';
import '../../data/repositories/outlet_repository_impl.dart';
import '../../domain/repositories/outlet_repository.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/get_nearby_usecase.dart';
import '../bloc/outlet_cubit.dart';

class OutletProvider {
  OutletProvider._();

  static OutletRemoteDatasource createRemoteDatasource(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return OutletRemoteDatasourceImpl(dio, endpoints);
  }

  static OutletRepository createRepository(
    OutletRemoteDatasource remoteDatasource,
  ) {
    return OutletRepositoryImpl(remoteDatasource);
  }

  static GetAllUsecase createGetAllUsecase(OutletRepository repository) {
    return GetAllUsecase(repository);
  }

  static GetNearbyUsecase createGetNearbyUsecase(OutletRepository repository) {
    return GetNearbyUsecase(repository);
  }

  static GetByIdUsecase createGetByIdUsecase(OutletRepository repository) {
    return GetByIdUsecase(repository);
  }

  static OutletCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);

    return OutletCubit(
      getAllUsecase: createGetAllUsecase(repository),
      getNearbyUsecase: createGetNearbyUsecase(repository),
      getByIdUsecase: createGetByIdUsecase(repository),
    );
  }

  static OutletCubit createOutletCubit(Dio dio, ApiEndpoints endpoints) {
    return createCubit(dio, endpoints);
  }
}
