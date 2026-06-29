import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../data/datasources/laundry_service_remote_datasource.dart';
import '../../data/repositories/laundry_service_repository_impl.dart';
import '../../domain/repositories/laundry_service_repository.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import '../../domain/usecases/destroy_usecase.dart';
import '../bloc/laundry_service_cubit.dart';

class LaundryServiceProvider {
  LaundryServiceProvider._();

  static LaundryServiceRemoteDatasource createRemoteDatasource(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return LaundryServiceRemoteDatasourceImpl(dio, endpoints);
  }

  static LaundryServiceRepository createRepository(
    LaundryServiceRemoteDatasource remoteDatasource,
  ) {
    return LaundryServiceRepositoryImpl(remoteDatasource);
  }

  static GetAllUsecase createGetAllUsecase(
    LaundryServiceRepository repository,
  ) {
    return GetAllUsecase(repository);
  }

  static GetByIdUsecase createGetByIdUsecase(
    LaundryServiceRepository repository,
  ) {
    return GetByIdUsecase(repository);
  }

  static StoreUsecase createStoreUsecase(LaundryServiceRepository repository) {
    return StoreUsecase(repository);
  }

  static UpdateUsecase createUpdateUsecase(
    LaundryServiceRepository repository,
  ) {
    return UpdateUsecase(repository);
  }

  static DestroyUsecase createDestroyUsecase(
    LaundryServiceRepository repository,
  ) {
    return DestroyUsecase(repository);
  }

  static LaundryServiceCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);

    final getAll = createGetAllUsecase(repository);
    final getById = createGetByIdUsecase(repository);
    final store = createStoreUsecase(repository);
    final update = createUpdateUsecase(repository);
    final destroy = createDestroyUsecase(repository);

    return LaundryServiceCubit(
      getAllUsecase: getAll,
      getByIdUsecase: getById,
      storeUsecase: store,
      updateUsecase: update,
      destroyUsecase: destroy,
    );
  }
}
