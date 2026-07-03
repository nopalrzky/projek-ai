import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:dio/dio.dart';
import '../../data/datasources/expense_remote_datasource.dart';
import '../../data/repositories/expense_repository_impl.dart';
import '../../domain/repositories/expense_repository.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import '../bloc/expense_cubit.dart';

class ExpenseProvider {
  ExpenseProvider._();

  static ExpenseRemoteDatasource createRemoteDatasource(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return ExpenseRemoteDatasourceImpl(dio, endpoints);
  }

  static ExpenseRepository createRepository(
    ExpenseRemoteDatasource remoteDatasource,
  ) {
    return ExpenseRepositoryImpl(remoteDatasource: remoteDatasource);
  }

  static GetAllUsecase createGetAllUsecase(ExpenseRepository repository) {
    return GetAllUsecase(repository);
  }

  static GetByIdUsecase createGetByIdUsecase(ExpenseRepository repository) {
    return GetByIdUsecase(repository);
  }

  static StoreUsecase createStoreUsecase(ExpenseRepository repository) {
    return StoreUsecase(repository);
  }

  static UpdateUsecase createUpdateUsecase(ExpenseRepository repository) {
    return UpdateUsecase(repository);
  }

  static ExpenseCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);

    final getAll = createGetAllUsecase(repository);
    final getById = createGetByIdUsecase(repository);
    final store = createStoreUsecase(repository);
    final update = createUpdateUsecase(repository);

    return ExpenseCubit(
      getAllUsecase: getAll,
      getByIdUsecase: getById,
      storeUsecase: store,
      updateUsecase: update,
    );
  }
}
