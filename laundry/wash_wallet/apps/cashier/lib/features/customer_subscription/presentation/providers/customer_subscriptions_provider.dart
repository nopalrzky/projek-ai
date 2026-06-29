import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:dio/dio.dart';
import '../../data/datasources/customer_subscription_remote_datasource.dart';
import '../../data/repositories/customer_subscription_repository_impl.dart';
import '../../domain/repositories/customer_subscription_repository.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import '../../domain/usecases/destroy_usecase.dart';
import '../bloc/customer_subscription_cubit.dart';

class CustomerSubscriptionProvider {
  CustomerSubscriptionProvider._();

  static CustomerSubscriptionRemoteDatasource createRemoteDatasource(Dio dio, ApiEndpoints endpoints) {
    return CustomerSubscriptionRemoteDatasourceImpl(dio, endpoints);
  }

  static CustomerSubscriptionRepository createRepository(
    CustomerSubscriptionRemoteDatasource remoteDatasource,
  ) {
    return CustomerSubscriptionRepositoryImpl(remoteDatasource);
  }

  static GetAllUsecase createGetCustomerSubscriptionsUsecase(
    CustomerSubscriptionRepository repository,
  ) {
    return GetAllUsecase(repository);
  }

  static GetByIdUsecase createGetByIdUsecase(
    CustomerSubscriptionRepository repository,
  ) {
    return GetByIdUsecase(repository);
  }

  static StoreUsecase createStoreUsecase(
    CustomerSubscriptionRepository repository,
  ) {
    return StoreUsecase(repository);
  }

  static UpdateUsecase createUpdateUsecase(
    CustomerSubscriptionRepository repository,
  ) {
    return UpdateUsecase(repository);
  }

  static DestroyUsecase createDestroyUsecase(
    CustomerSubscriptionRepository repository,
  ) {
    return DestroyUsecase(repository);
  }

  static CustomerSubscriptionCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);

    final getSubscriptions = createGetCustomerSubscriptionsUsecase(repository);
    final getById = createGetByIdUsecase(repository);
    final store = createStoreUsecase(repository);
    final update = createUpdateUsecase(repository);
    final destroy = createDestroyUsecase(repository);

    return CustomerSubscriptionCubit(
      getAllUsecase: getSubscriptions,
      getByIdUsecase: getById,
      storeUsecase: store,
      updateUsecase: update,
      destroyUsecase: destroy,
    );
  }
}
