import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:dio/dio.dart';
import '../../data/datasources/petty_cash_remote_datasource.dart';
import '../../data/repositories/petty_cash_repository_impl.dart';
import '../../domain/repositories/petty_cash_repository.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import '../bloc/petty_cash_cubit.dart';

class PettyCashProvider {
  PettyCashProvider._();

  static PettyCashRemoteDatasource createRemoteDatasource(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return PettyCashRemoteDatasourceImpl(dio, endpoints);
  }

  static PettyCashRepository createRepository(
    PettyCashRemoteDatasource remoteDatasource,
  ) {
    return PettyCashRepositoryImpl(remoteDatasource);
  }

  static GetAllUsecase createGetAllUsecase(PettyCashRepository repository) {
    return GetAllUsecase(repository);
  }

  static GetByIdUsecase createGetByIdUsecase(PettyCashRepository repository) {
    return GetByIdUsecase(repository);
  }

  static StoreUsecase createStorePettyCashUsecase(
    PettyCashRepository repository,
  ) {
    return StoreUsecase(repository);
  }

  static UpdateUsecase createUpdatePettyCashUsecase(
    PettyCashRepository repository,
  ) {
    return UpdateUsecase(repository);
  }

  static PettyCashCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);

    final getAll = createGetAllUsecase(repository);
    final getById = createGetByIdUsecase(repository);
    final store = createStorePettyCashUsecase(repository);
    final update = createUpdatePettyCashUsecase(repository);

    return PettyCashCubit(
      getAllUsecase: getAll,
      getByIdUsecase: getById,
      storePettyCashUsecase: store,
      updatePettyCashUsecase: update,
    );
  }
}
