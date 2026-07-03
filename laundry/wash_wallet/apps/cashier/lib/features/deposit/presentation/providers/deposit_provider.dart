import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:dio/dio.dart';
import '../../data/datasources/deposit_remote_datasource.dart';
import '../../data/repositories/deposit_repository_impl.dart';
import '../../domain/repositories/deposit_repository.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../bloc/deposit_cubit.dart';

class DepositProvider {
  DepositProvider._();

  static DepositRemoteDatasource createRemoteDatasource(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return DepositRemoteDatasourceImpl(dio, endpoints);
  }

  static DepositRepository createRepository(
    DepositRemoteDatasource remoteDatasource,
  ) {
    return DepositRepositoryImpl(remoteDatasource);
  }

  static GetAllUsecase createGetAllUsecase(DepositRepository repository) {
    return GetAllUsecase(repository);
  }

  static GetByIdUsecase createGetByIdUsecase(DepositRepository repository) {
    return GetByIdUsecase(repository);
  }

  static StoreUsecase createStoreUsecase(DepositRepository repository) {
    return StoreUsecase(repository);
  }

  static UpdateUsecase createUpdateUsecase(DepositRepository repository) {
    return UpdateUsecase(repository);
  }

  static DepositCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);

    final getAll = createGetAllUsecase(repository);
    final getById = createGetByIdUsecase(repository);
    final store = createStoreUsecase(repository);
    final update = createUpdateUsecase(repository);

    return DepositCubit(
      getAllUsecase: getAll,
      getByIdUsecase: getById,
      storeUsecase: store,
      updateUsecase: update,
    );
  }
}
