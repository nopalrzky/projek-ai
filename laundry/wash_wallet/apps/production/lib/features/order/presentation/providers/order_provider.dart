import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../data/datasources/order_remote_datasource.dart';
import '../../data/repositories/order_repository_impl.dart';
import '../../domain/repositories/order_repository.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/start_usecase.dart';
import '../../domain/usecases/complete_usecase.dart';
import '../../domain/usecases/pickup_usecase.dart';
import '../../domain/usecases/confirm_pickup_usecase.dart';
import '../../domain/usecases/confirm_arrived_usecase.dart';
import '../bloc/order_cubit.dart';

class OrderProvider {
  OrderProvider._();

  static OrderRemoteDatasource createRemoteDataSource(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return OrderRemoteDatasourceImpl(dio, endpoints);
  }

  static OrderRepository createRepository(
    OrderRemoteDatasource remoteDataSource,
  ) {
    return OrderRepositoryImpl(remoteDataSource);
  }

  static GetAllUsecase createGetAllUsecase(OrderRepository repository) {
    return GetAllUsecase(repository);
  }

  static GetByIdUsecase createGetByIdUsecase(OrderRepository repository) {
    return GetByIdUsecase(repository);
  }

  static StartUsecase createOrderUsecase(OrderRepository repository) {
    return StartUsecase(repository);
  }

  static CompleteUsecase createCompleteUsecase(OrderRepository repository) {
    return CompleteUsecase(repository);
  }

  static PickupUsecase createPickupUsecase(OrderRepository repository) {
    return PickupUsecase(repository);
  }

  static ConfirmPickupUsecase createConfirmPickupUsecase(
    OrderRepository repository,
  ) {
    return ConfirmPickupUsecase(repository);
  }

  static ConfirmArrivedUsecase createConfirmArrivedUsecase(
    OrderRepository repository,
  ) {
    return ConfirmArrivedUsecase(repository);
  }

  static OrderCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDataSource = createRemoteDataSource(dio, endpoints);
    final repository = createRepository(remoteDataSource);

    final getAllUsecase = createGetAllUsecase(repository);
    final getByIdUsecase = createGetByIdUsecase(repository);
    final startUsecase = createOrderUsecase(repository);
    final completeUsecase = createCompleteUsecase(repository);
    final pickupUsecase = createPickupUsecase(repository);
    final confirmPickupUsecase = createConfirmPickupUsecase(repository);
    final confirmArrivedUsecase = createConfirmArrivedUsecase(repository);

    return OrderCubit(
      getAllUsecase: getAllUsecase,
      getByIdUsecase: getByIdUsecase,
      startUsecase: startUsecase,
      completeUsecase: completeUsecase,
      pickupUsecase: pickupUsecase,
      confirmPickupUsecase: confirmPickupUsecase,
      confirmArrivedUsecase: confirmArrivedUsecase,
    );
  }

  static OrderCubit createCubitWithDependencies(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return createCubit(dio, endpoints);
  }
}
