import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../data/datasources/order_item_remote_datasource.dart';
import '../../data/repositories/order_item_repository_impl.dart';
import '../../domain/repositories/order_item_repository.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/start_usecase.dart';
import '../../domain/usecases/complete_usecase.dart';
import '../bloc/order_item_cubit.dart';

class OrderItemProvider {
  OrderItemProvider._();

  static OrderItemRemoteDataSource createRemoteDataSource(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return OrderItemRemoteDataSourceImpl(dio, endpoints);
  }

  static OrderItemRepository createRepository(
    OrderItemRemoteDataSource remoteDataSource,
  ) {
    return OrderItemRepositoryImpl(remoteDataSource);
  }

  static GetAllUsecase createGetAllUsecase(OrderItemRepository repository) {
    return GetAllUsecase(repository);
  }

  static GetByIdUsecase createGetByIdUsecase(OrderItemRepository repository) {
    return GetByIdUsecase(repository);
  }

  static StartUsecase createStartUsecase(OrderItemRepository repository) {
    return StartUsecase(repository);
  }

  static CompleteUsecase createCompleteUsecase(OrderItemRepository repository) {
    return CompleteUsecase(repository);
  }

  static OrderItemCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDataSource = createRemoteDataSource(dio, endpoints);
    final repository = createRepository(remoteDataSource);

    return OrderItemCubit(
      getAllUsecase: createGetAllUsecase(repository),
      getByIdUsecase: createGetByIdUsecase(repository),
      startUsecase: createStartUsecase(repository),
      completeUsecase: createCompleteUsecase(repository),
    );
  }
}
