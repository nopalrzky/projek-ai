import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:dio/dio.dart';
import '../../data/datasources/category_local_datasource.dart';
import '../../data/datasources/category_remote_datasource.dart';
import '../../data/repositories/category_repository_impl.dart';
import '../../domain/repositories/category_repository.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import '../../domain/usecases/destroy_usecase.dart';
import '../bloc/category_cubit.dart';

class CategoryProvider {
  CategoryProvider._();

  static CategoryRemoteDatasource createRemoteDatasource(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return CategoryRemoteDatasourceImpl(dio, endpoints);
  }

  static CategoryLocalDatasource createLocalDatasource() {
    return CategoryLocalDatasourceImpl();
  }

  static CategoryRepository createRepository(
    CategoryRemoteDatasource remoteDatasource,
    CategoryLocalDatasource localDatasource,
  ) {
    return CategoryRepositoryImpl(remoteDatasource, localDatasource);
  }

  static GetAllUsecase createGetAllUsecase(CategoryRepository repository) {
    return GetAllUsecase(repository);
  }

  static GetByIdUsecase createGetByIdUsecase(CategoryRepository repository) {
    return GetByIdUsecase(repository);
  }

  static StoreUsecase createStoreUsecase(CategoryRepository repository) {
    return StoreUsecase(repository);
  }

  static UpdateUsecase createUpdateUsecase(CategoryRepository repository) {
    return UpdateUsecase(repository);
  }

  static DestroyUsecase createDestroyUsecase(CategoryRepository repository) {
    return DestroyUsecase(repository);
  }

  static CategoryCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final localDatasource = createLocalDatasource();
    final repository = createRepository(remoteDatasource, localDatasource);

    final getAll = createGetAllUsecase(repository);
    final getById = createGetByIdUsecase(repository);
    final store = createStoreUsecase(repository);
    final update = createUpdateUsecase(repository);
    final destroy = createDestroyUsecase(repository);

    return CategoryCubit(
      getAllUsecase: getAll,
      getByIdUsecase: getById,
      storeUsecase: store,
      updateUsecase: update,
      destroyUsecase: destroy,
    );
  }
}
