import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:dio/dio.dart';
import '../../data/datasources/customer_remote_datasource.dart';
import '../../data/repositories/customer_repository_impl.dart';
import '../../domain/repositories/customer_repository.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import '../../domain/usecases/destroy_usecase.dart';
import '../../domain/usecases/store_membership_contract_usecase.dart';
import '../../domain/usecases/store_customer_subscription_usecase.dart';
import '../bloc/customer_cubit.dart';

class CustomerProvider {
  CustomerProvider._();

  static CustomerRemoteDatasource createRemoteDatasource(Dio dio, ApiEndpoints endpoints) {
    return CustomerRemoteDatasourceImpl(dio, endpoints);
  }

  static CustomerRepository createRepository(
    CustomerRemoteDatasource remoteDatasource,
  ) {
    return CustomerRepositoryImpl(remoteDatasource);
  }

  static GetAllUsecase createGetAllUsecase(CustomerRepository repository) {
    return GetAllUsecase(repository);
  }

  static GetByIdUsecase createGetByIdUsecase(CustomerRepository repository) {
    return GetByIdUsecase(repository);
  }

  static StoreUsecase createStoreUsecase(CustomerRepository repository) {
    return StoreUsecase(repository);
  }

  static UpdateUsecase createUpdateUsecase(CustomerRepository repository) {
    return UpdateUsecase(repository);
  }

  static DestroyUsecase createDestroyUsecase(CustomerRepository repository) {
    return DestroyUsecase(repository);
  }

  static StoreMembershipContractUsecase createStoreMembershipContractUsecase(
    CustomerRepository repository,
  ) {
    return StoreMembershipContractUsecase(repository);
  }

  static StoreCustomerSubscriptionUsecase
  createStoreCustomerSubscriptionUsecase(CustomerRepository repository) {
    return StoreCustomerSubscriptionUsecase(repository);
  }

  static CustomerCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);

    final getAll = createGetAllUsecase(repository);
    final getById = createGetByIdUsecase(repository);
    final store = createStoreUsecase(repository);
    final update = createUpdateUsecase(repository);
    final destroy = createDestroyUsecase(repository);
    final storeMembershipContract = createStoreMembershipContractUsecase(
      repository,
    );

    final storeCustomerSubscription = createStoreCustomerSubscriptionUsecase(
      repository,
    );

    return CustomerCubit(
      getAllUsecase: getAll,
      getByIdUsecase: getById,
      storeUsecase: store,
      updateUsecase: update,
      destroyUsecase: destroy,
      storeMembershipContractUsecase: storeMembershipContract,
      storeCustomerSubscriptionUsecase: storeCustomerSubscription,
    );
  }
}
