import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../data/datasources/customer_address_remote_datasource.dart';
import '../../data/repositories/customer_address_repository_impl.dart';
import '../../domain/repositories/customer_address_repository.dart';
import '../../domain/usecases/destroy_usecase.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import '../bloc/customer_address_action_cubit.dart';
import '../bloc/customer_address_list_cubit.dart';

class CustomerAddressProvider {
  CustomerAddressProvider._();

  static CustomerAddressRemoteDatasource createRemoteDatasource(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return CustomerAddressRemoteDatasourceImpl(dio, endpoints);
  }

  static CustomerAddressRepository createRepository(
    CustomerAddressRemoteDatasource remoteDatasource,
  ) {
    return CustomerAddressRepositoryImpl(remoteDatasource);
  }

  static GetAllUsecase createGetAllUsecase(
    CustomerAddressRepository repository,
  ) {
    return GetAllUsecase(repository);
  }

  static GetByIdUsecase createGetByIdUsecase(
    CustomerAddressRepository repository,
  ) {
    return GetByIdUsecase(repository);
  }

  static StoreUsecase createStoreUsecase(CustomerAddressRepository repository) {
    return StoreUsecase(repository);
  }

  static UpdateUsecase createUpdateUsecase(
    CustomerAddressRepository repository,
  ) {
    return UpdateUsecase(repository);
  }

  static DestroyUsecase createDestroyUsecase(
    CustomerAddressRepository repository,
  ) {
    return DestroyUsecase(repository);
  }

  static CustomerAddressListCubit createListCubit(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);

    return CustomerAddressListCubit(
      getAllUsecase: createGetAllUsecase(repository),
      getByIdUsecase: createGetByIdUsecase(repository),
    );
  }

  static CustomerAddressActionCubit createActionCubit(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);

    return CustomerAddressActionCubit(
      storeUsecase: createStoreUsecase(repository),
      updateUsecase: createUpdateUsecase(repository),
      destroyUsecase: createDestroyUsecase(repository),
    );
  }
}
